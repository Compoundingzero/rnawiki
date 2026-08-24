import type { SeedDossier } from '@/lib/seed-types'

/**
 * Curated flagship dossiers — the urology, gout and miscellaneous staples: the three urate drugs
 * that have been argued about for seventy years, the phosphodiesterase-5 inhibitor that was a
 * failed angina drug, the alpha-1 blockers that lower two different pressures, the dye that
 * numbs urine, the salt that alkalinises it, and the enzyme infusion of last resort.
 *
 * Editorial layer written over the machine-enriched records: the verdict, the mechanism carousel
 * and the audits, which no pipeline can produce. The identity facts — slug, trade name, sponsor,
 * approval year, SMILES — are copied from the enriched record rather than researched again.
 *
 * Every DOI, PMID and NCT number below was resolved against the NCBI E-utilities, the
 * ClinicalTrials.gov registry or the openFDA label endpoint at the time of writing. Sample sizes,
 * hazard ratios, confidence intervals and p-values are copied from the published abstract or the
 * FDA label, never from memory. Where a number could not be sourced, the field is absent.
 *
 * Five conventions apply to the whole group.
 *
 * 1. SERUM URATE IS A SURROGATE AND EVERY GOUT PAGE SAYS SO. Milligrams per decilitre is what
 *    allopurinol, febuxostat, probenecid and pegloticase are licensed on. Flares, tophi, joint
 *    destruction and death are what a reader cares about, and the two are not the same
 *    measurement. Where a drug has a hard-endpoint trial it is on the page; where the
 *    hard-endpoint trial failed — ALL-HEART, CKD-FIX, PERL — the failure is on the page at the
 *    same weight as the surrogate success.
 *
 * 2. A SYMPTOM DRUG IS NOT A DISEASE DRUG. Phenazopyridine dyes urine and dulls the burning; it
 *    treats no infection. Sildenafil produces an erection; it treats no cause. Potassium citrate
 *    raises urine pH; it dissolves no stone that is already calcified. Every page in this group
 *    that sells relief says what the relief does not do.
 *
 * 3. PRICING IS A PRICE, NOT A COST. Every price here is the CMS National Average Drug
 *    Acquisition Cost — what a United States retail pharmacy pays a wholesaler — and is labelled
 *    as such. `synthesisCostPerDose` is empty on every dossier in this file: the cost-of-production
 *    literature for the WHO Essential Medicines List publishes a method and an aggregate, and its
 *    per-molecule figures for this group sit in a supplementary appendix that could not be
 *    resolved and verified at the time of writing. An unverified cost is worse than an absent one.
 *
 * 4. NO DOSING, TITRATION, MONITORING OR PROCUREMENT GUIDANCE. Strengths and titration schedules
 *    appear only where they are part of a trial's description or a product's identity. Nothing
 *    here tells a reader what to take, how to move between doses, or where to obtain it.
 *
 * 5. THE MOST INSTRUCTIVE RECORD IN THIS GROUP IS AN ARM THAT WAS STOPPED. ALLHAT randomised
 *    over forty-two thousand people and terminated its doxazosin arm early for doubled heart
 *    failure against a diuretic that cost a fraction as much. That story is on the doxazosin page
 *    because it is the clearest available demonstration of what a surrogate endpoint cannot tell
 *    you.
 */

const NADAC_SOURCE = {
  label:
    'CMS National Average Drug Acquisition Cost (NADAC) survey — what United States retail pharmacies pay to acquire a drug',
  identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
  kind: 'url' as const,
}

const COST_OF_PRODUCTION_SOURCE = {
  label:
    'Hill A, Barber MJ, Gotham D. Estimated costs of production and potential prices for the WHO Essential Medicines List. BMJ Glob Health 2018;3:e000571 — the cost-of-production literature checked for this group. It publishes an estimation method over 148 medicines and an aggregate result; its per-molecule figures for these drugs are in a supplementary appendix that could not be resolved at the time of writing, so no per-dose cost is stated on these pages',
  identifier: '10.1136/bmjgh-2017-000571',
  kind: 'doi' as const,
}

export const ENRICHED_BATCH_30_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // 1. Allopurinol — sixty years of lowering a number, and three large randomised trials showing
  //    that lowering the number in people without gout protects neither heart nor kidney.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'allopurinol',
    name: 'Allopurinol',
    tradeName: 'Zyloprim / Lopurin / Aloprim',
    sponsor:
      'Casper Pharma LLC (current holder of the Zyloprim application); originated at Burroughs Wellcome with Gertrude Elion and George Hitchings, and generic from many manufacturers since the 1980s',
    targetGene: 'XDH',
    targetProtein:
      'Xanthine oxidoreductase — the molybdenum-containing enzyme that oxidises hypoxanthine to xanthine and xanthine to uric acid. Allopurinol is a substrate analogue of hypoxanthine; its metabolite oxypurinol is the long-lived inhibitor that does most of the work',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1966,
    indication:
      'Management of adults with signs and symptoms of primary or secondary gout (acute attacks, tophi, joint destruction, uric acid lithiasis and/or nephropathy); management of adults and children with leukaemia, lymphoma and solid tumours receiving cancer therapy that raises serum and urinary uric acid; and management of adults with recurrent calcium oxalate calculi whose daily uric acid excretion exceeds 800 mg in men or 750 mg in women despite lifestyle change. The label carries an explicit Limitation of Use: it is not recommended for the treatment of asymptomatic hyperuricaemia',
    patientFriendlyIndication: 'Gout',
    anatomicalSite:
      'Xanthine oxidoreductase in the liver and the intestinal mucosa, where most uric acid is made; the active metabolite oxypurinol is cleared by the kidney, which is why kidney function sets the exposure',
    conditionContext: {
      conditionExplainer:
        'Gout is a crystal disease, not a pain syndrome. When blood urate stays above roughly 6.8 mg/dL, monosodium urate comes out of solution and deposits in joints; an attack is the immune system reacting to crystals it has just noticed. Lower the urate far enough for long enough and the deposits dissolve, which is why the treatment target is a blood number and the result is measured in years.',
      whyItMatters:
        'Allopurinol has been the first-line urate-lowering drug since 1966, and the two things that go wrong with it are both about how it is used rather than what it does. Most people are left on a fixed 300 mg dose that never reaches the target, and a small number carry an HLA allele that turns the drug into a life-threatening skin reaction. Neither is a property of the molecule.',
      whoTakesThis:
        'Adults with gout that has caused attacks, tophi, joint damage or urate stones; people starting chemotherapy likely to cause tumour lysis; and adults with recurrent calcium oxalate stones and high uric acid excretion. The label specifically does not recommend it for a raised urate with no symptoms.',
      clinicalGoals:
        'A serum urate below 6 mg/dL, held there indefinitely, so existing crystal deposits dissolve and new ones stop forming. Attacks often increase in the first months of treatment, which is the deposits mobilising rather than the drug failing.',
    },
    oneSentenceVerdict:
      'A xanthine oxidase inhibitor whose active metabolite oxypurinol lowers serum urate reliably enough to dissolve crystal deposits — but at the commonly used fixed 300 mg dose reached a urate below 6 mg/dL in only 21% of patients in a 762-patient head-to-head trial, and in three large randomised trials in people without gout (ALL-HEART, CKD-FIX, PERL) lowering urate protected neither heart nor kidney.',
    laymanHowItWorks:
      'Uric acid is the last step in breaking down the purines in your DNA and in your food, and one enzyme, xanthine oxidase, catalyses the final two reactions. Allopurinol looks enough like that enzyme’s natural substrate to be taken up and converted into oxypurinol, which then sits in the enzyme’s active site and stays there. Less uric acid is made, the blood level falls, and if it falls far enough the crystals already deposited in joints slowly dissolve. The drug does nothing for the pain of an attack already under way — it is a supply-side drug, working over months and years.',
    auditConfidence: 'High Confidence',
    confidenceScore: 84,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0546 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 87 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States in 1966 and off patent for decades. It is on the WHO Model List of Essential Medicines and is among the cheapest prescription drugs in the country — a little over five United States cents a tablet at wholesale. Every comparison in this group has to start from that number: a urate-lowering drug that is not allopurinol has to justify a price that is several times higher for a surrogate advantage.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Allopurinol is the reference against which every other urate-lowering drug is priced and measured. The honest comparison is not "which lowers urate more" — febuxostat does, at a fixed-dose comparison allopurinol was never given a fair chance in — but "what does the alternative buy you that a properly escalated allopurinol dose does not". For most people, at five cents a tablet, the answer is nothing.',
      conventionalRx: [
        {
          name: 'Febuxostat (Uloric)',
          class: 'Non-purine selective xanthine oxidase inhibitor',
          howItCompares:
            'Beat allopurinol on the urate number in the registration trials, but those trials fixed allopurinol at 300 mg without titration. In CARES, the cardiovascular safety trial the FDA required afterwards, all-cause death was higher on febuxostat than on allopurinol (HR 1.22, 95% CI 1.01 to 1.47) and cardiovascular death higher still (HR 1.34, 95% CI 1.03 to 1.73), which produced a boxed warning. The larger open-label FAST trial did not reproduce that mortality signal.',
          typicalCost:
            'US$0.2810 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 29 listed generic products, survey effective 19 August 2026) — about five times allopurinol',
          prosAndCons:
            'Pros: no dose adjustment for mild to moderate renal impairment; an option where allopurinol caused a rash. Cons: five times the price; a boxed warning for cardiovascular death that allopurinol does not carry; no advantage once allopurinol is actually titrated.',
        },
        {
          name: 'Probenecid (Benemid)',
          class: 'Uricosuric — URAT1 and OAT inhibitor at the renal proximal tubule',
          howItCompares:
            'Works by the opposite mechanism: instead of making less urate it stops the kidney reabsorbing it. That only helps people who under-excrete urate and have adequate kidney function, and it raises urine urate, which is the wrong direction for anyone who forms urate stones. It is also more expensive than allopurinol at acquisition cost.',
          typicalCost:
            'US$0.6550 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 9 listed generic products, survey effective 19 August 2026) — about twelve times allopurinol',
          prosAndCons:
            'Pros: an alternative mechanism for allopurinol intolerance; can be combined with a xanthine oxidase inhibitor. Cons: ineffective at low creatinine clearance; contraindicated in urate stone formers; twice or more daily; a long list of drug interactions because it blocks tubular secretion generally.',
        },
        {
          name: 'Pegloticase (Krystexxa)',
          class: 'PEGylated recombinant porcine-like uricase, given by infusion',
          howItCompares:
            'Converts urate to allantoin, a step humans lost in evolution, and drives urate to near zero in responders. It is reserved for gout that has failed oral urate-lowering therapy, and about half of patients develop anti-drug antibodies that both abolish the effect and cause infusion reactions. It is not an alternative to allopurinol; it is what is left when allopurinol has been exhausted.',
          typicalCost:
            'A biologic infusion given every two weeks in a clinic; no United States pharmacy acquisition price is published in the CMS NADAC survey for it',
          prosAndCons:
            'Pros: the only agent that dissolves large tophi in months rather than years. Cons: intravenous, immunogenic, contraindicated in G6PD deficiency, and orders of magnitude more expensive.',
        },
      ],
      naturalFoods: [
        {
          name: 'Cherries and cherry extract',
          activeCompound: 'Anthocyanins; the urate-lowering component has not been isolated',
          biologicalMechanism:
            'Proposed to combine a weak uricosuric effect with anthocyanin-mediated suppression of the interleukin-1 beta response that produces the flare. Neither step has been demonstrated in humans at dietary intake.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: the largest study is a case-crossover analysis of 633 people with gout followed online for a year, in which cherry intake over a two-day period was associated with a 35% lower risk of an attack (OR 0.65, 95% CI 0.50 to 0.85), and cherry intake combined with allopurinol with a 75% lower risk (OR 0.25, 95% CI 0.15 to 0.42). A case-crossover design is not a randomised trial and cannot exclude that people eat cherries when they feel an attack coming.',
          monthlyCost: '',
        },
        {
          name: 'Skim milk powder',
          activeCompound: 'Glycomacropeptide and G600 milk fat extract',
          biologicalMechanism:
            'Dairy fractions with anti-inflammatory activity in animal models of acute crystal arthritis, plus a modest increase in fractional excretion of uric acid.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: a three-month randomised double-blind trial in 120 people with recurrent flares compared enriched skim milk powder against skim milk powder and against lactose. Flares fell in all three arms; the enriched arm fell significantly more than lactose control (p=0.044 on post hoc comparison). The authors describe it as proof of concept, and it has not been replicated at scale.',
          monthlyCost: '',
        },
        {
          name: 'Vitamin C — the one that was tested and did not work',
          activeCompound: 'Ascorbic acid',
          biologicalMechanism:
            'Ascorbate competes with urate for reabsorption at URAT1 and lowers serum urate in healthy volunteers. The effect does not carry over into established gout.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'Not stated here as advice. For scale only: a randomised trial in 40 people with gout compared vitamin C 500 mg daily against starting or increasing allopurinol. Over eight weeks urate fell by 0.23 mg/dL on vitamin C against 1.9 mg/dL on allopurinol (p<0.001), despite plasma ascorbate rising as expected. The authors titled the paper "clinically insignificant".',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Do not stop it because you are having an attack',
          action:
            'Keep taking it through a flare, and say if a flare started soon after you began the drug.',
          patientImpact:
            'The label states that gout flares may occur during initiation of treatment and that concurrent prophylactic treatment with colchicine or an anti-inflammatory is recommended. An early flare is deposits mobilising, not the drug failing, and stopping restarts the whole process.',
          clinicalPrecaution:
            'This is different from a rash. The label directs permanent discontinuation at the first appearance of skin rash or any other sign that may indicate a hypersensitivity reaction.',
        },
        {
          name: 'Report any rash immediately',
          action: 'Stop and get seen the same day if a rash appears.',
          patientImpact:
            'The label records that serious and sometimes fatal dermatological reactions — toxic epidermal necrolysis, Stevens-Johnson syndrome and DRESS — occur in approximately 5 in 10,000 (0.05%) patients taking allopurinol, and directs permanent discontinuation at the first appearance of rash.',
          clinicalPrecaution:
            'The HLA-B*58:01 allele is a genetic marker for these reactions and its frequency is higher in people of African, Asian (Han Chinese, Korean, Thai) and Native Hawaiian or Pacific Islander ancestry. Reactions have also been reported in people who do not carry it.',
        },
        {
          name: 'Say if you take azathioprine or mercaptopurine',
          action:
            'Name every immunosuppressant and chemotherapy agent before allopurinol is started.',
          patientImpact:
            'Azathioprine and mercaptopurine are inactivated by the same enzyme allopurinol blocks. The label directs that with 300 to 600 mg of allopurinol daily, the dose of mercaptopurine or azathioprine must be cut to roughly one-third to one-quarter of the usual dose.',
          clinicalPrecaution:
            'Missing this interaction produces profound bone marrow suppression. It is the single most dangerous prescribing error involving this drug and it is entirely predictable from the mechanism.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1=NNC2=C1C(=O)NC=N2',
      chemicalFormula: 'C5H4N4O',
      molecularWeight: '136.11 g/mol',
      targetReceptorAffinity:
        'Allopurinol is an isomer of hypoxanthine — the same atoms, with the nitrogen and carbon at positions 7 and 8 exchanged. Xanthine oxidoreductase oxidises it to oxypurinol, which then remains bound to the reduced molybdenum centre of the enzyme. Allopurinol itself has a plasma half-life of only one to two hours; oxypurinol has one of roughly 18 to 30 hours and is cleared renally, so the duration of effect belongs to the metabolite and the exposure is set by kidney function rather than liver function.',
      structureSource: {
        label:
          'PubChem CID 2094 (allopurinol) — canonical SMILES, molecular formula and weight, as carried on the enriched record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2094',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'allo-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Distinguish the drug from the purine it imitates',
          description:
            'Allopurinol and hypoxanthine share the formula C5H4N4O and differ only in where two ring atoms sit. Any release assay that cannot separate them cannot prove identity, and the same problem applies to the active metabolite oxypurinol against xanthine.',
          reagentsAndBuffer:
            'Allopurinol and oxypurinol reference standards, hypoxanthine and xanthine as negative controls, reversed-phase HPLC with ultraviolet detection at 250 nm, 13C and 15N NMR for ring-position assignment, differential scanning calorimetry for polymorph identity',
        },
        {
          id: 'allo-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Build the pyrazolopyrimidine ring from a hydrazine and a one-carbon donor',
          description:
            'The published route condenses hydrazine with an ethoxymethylene malononitrile to give a 3-amino-4-cyanopyrazole, hydrolyses the nitrile to the carboxamide, and closes the second ring with formamide. It is short, uses commodity reagents, and is the reason a tablet costs a few cents.',
          dependsOnStepId: 'allo-w1',
          reagentsAndBuffer:
            'Hydrazine hydrate, ethoxymethylene malononitrile, aqueous acid for nitrile hydrolysis, formamide at reflux for the pyrimidinone ring closure, activated carbon treatment',
        },
        {
          id: 'allo-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Recrystallise and specify the residual solvent and hydrazine limits',
          description:
            'Hydrazine is a genotoxic reagent and its residue is the critical impurity for this route. The compound is poorly soluble in water, so recrystallisation is from alkaline aqueous solution with reacidification rather than from an organic solvent.',
          dependsOnStepId: 'allo-w2',
          reagentsAndBuffer:
            'Dilute sodium hydroxide for dissolution, controlled reacidification with acetic or hydrochloric acid, derivatisation GC-MS for residual hydrazine at the parts-per-million level, ICP-MS for metal residues',
        },
        {
          id: 'allo-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Confirm conversion to oxypurinol, not just uptake of allopurinol',
          description:
            'Measuring parent drug alone measures the wrong molecule. The inhibitor that matters is generated by the target enzyme itself, so a cell system without functional xanthine oxidoreductase will show uptake and no inhibition.',
          dependsOnStepId: 'allo-w3',
          reagentsAndBuffer:
            'Primary human hepatocytes or Caco-2 monolayers, LC-MS/MS quantification of allopurinol and oxypurinol separately, stable-isotope internal standards, parallel incubation with a xanthine-oxidoreductase-null control',
        },
        {
          id: 'allo-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Measure enzyme inhibition and urate production, and report both',
          description:
            'The enzyme assay and the clinical endpoint are different measurements. Xanthine oxidoreductase inhibition in vitro is close to complete at achievable concentrations; serum urate below 6 mg/dL in a patient depends on dose, adherence and renal clearance of oxypurinol. Reporting only the first is how a drug acquires a reputation for potency it does not deliver in a clinic.',
          dependsOnStepId: 'allo-w4',
          reagentsAndBuffer:
            'Purified bovine or human xanthine oxidoreductase, xanthine substrate, continuous absorbance at 295 nm for urate formation, oxypurinol dose-response with pre-incubation to allow the mechanism-based step, paired plasma oxypurinol and serum urate measurement in the clinical arm',
        },
      ],
    },
    keyAudits: [
      {
        id: 'allo-a1',
        category: 'failed',
        title:
          'ALL-HEART: 5,721 people, 4.8 years, and no cardiovascular benefit from lowering urate',
        laymanSummary:
          'Allopurinol was thought to protect the heart, on the strength of small studies of blood vessel function. A trial of nearly six thousand older people with heart disease and no gout found nothing at all.',
        technicalDetails:
          'ALL-HEART randomised 5,937 patients aged 60 or over with ischaemic heart disease and no history of gout to allopurinol up-titrated to 600 mg daily (300 mg in moderate renal impairment) or usual care, across 424 UK primary care practices. In the 5,721-patient modified intention-to-treat population followed a mean 4.8 years, the primary composite of non-fatal myocardial infarction, non-fatal stroke or cardiovascular death occurred in 314 (11.0%) on allopurinol and 325 (11.3%) on usual care — hazard ratio 1.04 (95% CI 0.89 to 1.21, p=0.65). All-cause death was 288 (10.1%) against 303 (10.6%), HR 1.02 (95% CI 0.87 to 1.20, p=0.77). The mechanistic case — that xanthine oxidase generates reactive oxygen species and that inhibiting it improves endothelial function — was real in the laboratory and produced no clinical effect.',
        evidenceSource:
          'Mackenzie IS et al. Allopurinol versus usual care in UK patients with ischaemic heart disease (ALL-HEART). Lancet 2022;400:1195-1205',
        doi: '10.1016/S0140-6736(22)01657-9',
        measuredMetric:
          'Composite of non-fatal myocardial infarction, non-fatal stroke or cardiovascular death over a mean 4.8 years',
        auditFlag: 'verified',
      },
      {
        id: 'allo-a2',
        category: 'failed',
        title: 'Two kidney trials, two null results, and one signal in the wrong direction',
        laymanSummary:
          'Raised uric acid tracks with kidney decline, so allopurinol was expected to slow it. Two randomised trials — one in chronic kidney disease, one in type 1 diabetes — found no benefit, and in the diabetes trial the urine protein went up.',
        technicalDetails:
          'CKD-FIX randomised 369 adults with stage 3 or 4 chronic kidney disease and no gout to allopurinol 100 to 300 mg daily or placebo. eGFR change over 104 weeks was -3.33 mL/min/1.73 m2 per year on allopurinol against -3.23 on placebo; mean difference -0.10 (95% CI -1.18 to 0.97, p=0.85). PERL randomised 530 people with type 1 diabetes and early to moderate diabetic kidney disease; serum urate fell from 6.1 to 3.9 mg/dL on allopurinol and stayed at 6.1 on placebo, yet the between-group difference in iohexol-measured GFR after washout was 0.001 mL/min/1.73 m2 (95% CI -1.9 to 1.9, p=0.99), and the mean urinary albumin excretion rate after washout was 40% higher (95% CI 0 to 80) on allopurinol. Both trials moved the surrogate exactly as intended and neither moved the outcome.',
        evidenceSource:
          'Badve SV et al. Effects of Allopurinol on the Progression of Chronic Kidney Disease. N Engl J Med 2020;382:2504-2513; Doria A et al. Serum Urate Lowering with Allopurinol and Kidney Function in Type 1 Diabetes. N Engl J Med 2020;382:2493-2503',
        doi: '10.1056/NEJMoa1915833',
        measuredMetric:
          'Change in estimated or iohexol-measured glomerular filtration rate against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'allo-a3',
        category: 'measured',
        title: 'At a fixed 300 mg, only one patient in five reaches the target',
        laymanSummary:
          'The standard dose most people are left on hits the treatment target in about 21% of patients. Raising the dose until the number comes down works in most of the rest.',
        technicalDetails:
          'In FACT, 762 patients with gout and serum urate at least 8.0 mg/dL were randomised to febuxostat 80 mg, febuxostat 120 mg or allopurinol at a fixed 300 mg daily for 52 weeks. Serum urate below 6.0 mg/dL at the last three monthly measurements was achieved by 53%, 62% and 21% respectively (p<0.001 for each febuxostat arm against allopurinol). That 21% is routinely quoted as allopurinol failing; the protocol did not permit titration. When titration is permitted the picture inverts: in a 183-patient randomised trial of dose escalation above the creatinine-clearance-based dose, 69% of the escalation group and 32% of controls reached urate below 6 mg/dL at 12 months, with one serious adverse event judged probably drug-related across the whole study. The most-cited weakness of allopurinol is a property of how it was dosed in a comparator arm.',
        evidenceSource:
          'Becker MA et al. Febuxostat compared with allopurinol in patients with hyperuricemia and gout. N Engl J Med 2005;353:2450-2461 (FACT); Stamp LK et al. A randomised controlled trial of the efficacy and safety of allopurinol dose escalation. Ann Rheum Dis 2017;76:1522-1528',
        doi: '10.1056/NEJMoa050373',
        measuredMetric:
          'Proportion of patients achieving serum urate below 6.0 mg/dL, at fixed dose against titrated dose',
        auditFlag: 'verified',
      },
      {
        id: 'allo-a4',
        category: 'conclusion_shift',
        title: 'An unpredictable fatal reaction turned out to be one testable allele',
        laymanSummary:
          'For forty years the severe skin reaction to allopurinol was described as idiosyncratic and unforeseeable. In 2005 it was traced to a single HLA type, present in every one of 51 cases studied.',
        technicalDetails:
          'A Taiwanese case-control study genotyped 823 SNPs in 51 patients with allopurinol-induced severe cutaneous adverse reactions and 228 controls. HLA-B*5801 was present in 51 of 51 cases (100%), against 20 of 135 allopurinol-tolerant patients (15%) and 19 of 93 healthy subjects (20%) — odds ratio 580.3 (95% CI 34.4 to 9780.9), corrected p=4.7 x 10-24. The allele is now named in the United States label, which records that these reactions occur in approximately 5 in 10,000 (0.05%) patients, that HLA-B*58:01 carriers are at higher risk, and that allele frequency is higher in people of African, Asian and Native Hawaiian or Pacific Islander ancestry — while noting reactions have occurred in non-carriers. This is the field changing its mind in the honest direction: from "unforeseeable" to "foreseeable in most of the people it kills, if you look".',
        evidenceSource:
          'Hung SI et al. HLA-B*5801 allele as a genetic marker for severe cutaneous adverse reactions caused by allopurinol. Proc Natl Acad Sci U S A 2005;102:4134-4139; allopurinol United States prescribing information, sections 5.1 and 12.5',
        doi: '10.1073/pnas.0409500102',
        measuredMetric:
          'Carriage of HLA-B*5801 in allopurinol severe cutaneous adverse reaction cases against tolerant and healthy controls',
        auditFlag: 'verified',
      },
      {
        id: 'allo-a5',
        category: 'measured',
        title: 'The drug is not the bottleneck; the follow-up is',
        laymanSummary:
          'Give the same cheap drug through a nurse-led service that explains the disease and titrates the dose, and the proportion of people hitting the target goes from 30% to 95%.',
        technicalDetails:
          'A randomised trial enrolled 517 UK adults who had had a gout flare in the previous year and assigned them to nurse-led care — individualised education, shared decision making and treat-to-target urate lowering — or to continued GP-led usual care. At two years, 95% of the nurse-led group had serum urate below 360 micromol/L (6 mg/dL) against 30% of usual care, risk ratio 3.18 (95% CI 2.42 to 4.18, p<0.0001). All secondary outcomes, including flare frequency and tophi, favoured the nurse-led group, at £5,066 per quality-adjusted life-year. Nothing about the molecule changed between the two arms.',
        evidenceSource:
          'Doherty M et al. Efficacy and cost-effectiveness of nurse-led care involving education and engagement of patients and a treat-to-target urate-lowering strategy versus usual care for gout. Lancet 2018;392:1403-1412',
        doi: '10.1016/S0140-6736(18)32158-5',
        measuredMetric:
          'Proportion achieving serum urate below 360 micromol/L at two years, nurse-led against usual care',
        auditFlag: 'verified',
      },
      {
        id: 'allo-a6',
        category: 'inferred',
        title: 'The label refuses the most common reason it is prescribed',
        laymanSummary:
          'A high uric acid result on a blood test, with no gout attack and no stones, is not a reason to take this drug according to its own prescribing information — and the older version of that label said so in capital letters.',
        technicalDetails:
          'The current label carries an explicit Limitations of Use: "Allopurinol tablets are not recommended for the treatment of asymptomatic hyperuricemia." The pre-2024 version opened its indications section with "THIS IS NOT AN INNOCUOUS DRUG. IT IS NOT RECOMMENDED FOR THE TREATMENT OF ASYMPTOMATIC HYPERURICEMIA." The three licensed indications all require a consequence to have occurred — symptomatic gout, tumour lysis risk, or recurrent calcium oxalate stones with documented uric acid overexcretion above 800 mg/day in men or 750 mg/day in women. Treating a number on a panel is the inference the label declines to endorse, and ALL-HEART, CKD-FIX and PERL each tested a version of that inference in a randomised trial and found nothing.',
        evidenceSource:
          'Allopurinol tablets United States prescribing information, section 1 Indications and Usage and Limitations of Use (openFDA label, effective 3 June 2026, and the earlier non-PLR label effective 28 November 2022)',
        inferredClaim:
          'That a raised serum urate with no symptoms is itself a treatment indication — asserted widely in practice, declined by the label, and unsupported by three randomised outcome trials',
        auditFlag: 'caution',
      },
      {
        id: 'allo-a7',
        category: 'measured',
        title: 'The interaction that must never be missed',
        laymanSummary:
          'Azathioprine and mercaptopurine are broken down by the exact enzyme allopurinol blocks. Given together at normal doses, they can wipe out the bone marrow.',
        technicalDetails:
          'The label directs that in patients receiving mercaptopurine or azathioprine, concomitant administration of 300 to 600 mg of allopurinol daily requires the mercaptopurine or azathioprine dose to be reduced to approximately one-third to one-quarter of the usual dose, with subsequent adjustment on therapeutic response and toxicity. The mechanism is not incidental: xanthine oxidase is a principal inactivating route for both thiopurines, so blocking it multiplies the exposure to a cytotoxic drug. Myelosuppression is separately listed in section 5.5 as a warning for allopurinol alone. This is a predictable, mechanism-derived interaction, and it is the strongest reason the drug list must be complete before this tablet is started.',
        evidenceSource:
          'Allopurinol tablets United States prescribing information, Warnings (thiopurine dose reduction) and section 5.5 Myelosuppression',
        measuredMetric:
          'Required mercaptopurine or azathioprine dose reduction during concomitant allopurinol, from the label',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A purine that is one atom-swap away from the real thing',
        laymanDesc:
          'Allopurinol is a near-copy of hypoxanthine, a natural breakdown product of DNA. Two atoms in the ring have swapped places, and that is the whole trick.',
        molecularDetail:
          'Allopurinol is the 1H-pyrazolo[3,4-d]pyrimidin-4-ol isomer of hypoxanthine: same C5H4N4O composition, with the ring nitrogen moved from position 7 to position 8. It is absorbed rapidly from the gut and has a plasma half-life of only one to two hours.',
        iconName: 'Atom',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The target enzyme makes its own inhibitor',
        laymanDesc:
          'Xanthine oxidase treats allopurinol as a substrate and oxidises it. The product, oxypurinol, then gets stuck in the enzyme and will not leave.',
        molecularDetail:
          'Xanthine oxidoreductase hydroxylates allopurinol at C-6 to give oxypurinol, which binds the reduced molybdenum-IV centre of the enzyme and dissociates only as the centre reoxidises. This is mechanism-based inhibition: the enzyme is required for its own inactivation.',
        iconName: 'Repeat',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'The metabolite is the drug, and the kidney sets its level',
        laymanDesc:
          'Oxypurinol lasts about a day, not an hour, and is cleared by the kidney. So kidney function, not liver function, decides how much of the active molecule you carry.',
        molecularDetail:
          'Oxypurinol has a plasma half-life of roughly 18 to 30 hours and is eliminated renally, undergoing reabsorption in a manner analogous to urate. Reduced creatinine clearance raises oxypurinol exposure, which is why the label directs lower doses in renal impairment and why hypersensitivity is more frequent in people with impaired kidneys, especially on a thiazide.',
        iconName: 'Filter',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'Purine breakdown stops one step short of uric acid',
        laymanDesc:
          'Hypoxanthine and xanthine build up instead of becoming uric acid. Both are far more soluble, so they leave in the urine without crystallising.',
        molecularDetail:
          'Both the hypoxanthine-to-xanthine and xanthine-to-urate oxidations are blocked, shifting the terminal purine pool toward the oxypurines. Serum and urinary uric acid both fall, distinguishing allopurinol from a uricosuric such as probenecid, which lowers serum urate by raising urinary urate. Purine biosynthesis itself is not disrupted.',
        iconName: 'GitBranch',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Below 6 mg/dL, deposits dissolve — slowly',
        laymanDesc:
          'Crystals only redissolve when the blood level sits below the saturation point, and only over months to years. Attacks often get worse before they get better.',
        molecularDetail:
          'Monosodium urate saturation is around 6.8 mg/dL at physiological conditions, so the treat-to-target threshold of 6.0 mg/dL is a solubility argument, not an epidemiological one. Mobilisation of existing deposits provokes flares during initiation, which is why the label recommends concurrent colchicine or anti-inflammatory prophylaxis.',
        iconName: 'Snowflake',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What lowering the number does not do',
        laymanDesc:
          'In people without gout, driving uric acid down did not protect the heart in a 5,721-person trial or the kidneys in two more. The surrogate moved and nothing else did.',
        molecularDetail:
          'ALL-HEART: HR 1.04 (95% CI 0.89 to 1.21) for cardiovascular death, non-fatal infarction or non-fatal stroke over 4.8 years. CKD-FIX: eGFR slope difference -0.10 mL/min/1.73 m2 per year (p=0.85). PERL: iohexol GFR difference 0.001 mL/min/1.73 m2 (p=0.99) despite urate falling from 6.1 to 3.9 mg/dL. The xanthine-oxidase-as-oxidative-stress hypothesis is not settled by these trials, but the clinical claim built on it is.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'ALL-HEART (Lancet 2022;400:1195-1205; ISRCTN32017426)',
        phase: 'Phase 4, randomised, open-label, blinded-endpoint',
        sampleSize: 5721,
        primaryEndpoint:
          'Composite of non-fatal myocardial infarction, non-fatal stroke or cardiovascular death in patients aged 60 or over with ischaemic heart disease and no history of gout',
        endpointMet: false,
        statisticalPValue:
          '11.0% against 11.3%; hazard ratio 1.04 (95% CI 0.89 to 1.21), p=0.65 over a mean 4.8 years',
        unreportedAdverseSignals:
          'All-cause death 10.1% against 10.6%, HR 1.02 (95% CI 0.87 to 1.20), p=0.77 — also null. The trial was open-label with usual care as comparator, so adherence and dropout are not symmetric between arms.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'CKD-FIX (N Engl J Med 2020;382:2504-2513; ACTRN12611000791932)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 369,
        primaryEndpoint:
          'Change in estimated glomerular filtration rate from randomisation to week 104 in stage 3 or 4 chronic kidney disease without gout',
        endpointMet: false,
        statisticalPValue:
          '-3.33 against -3.23 mL/min/1.73 m2 per year; mean difference -0.10 (95% CI -1.18 to 0.97), p=0.85',
        unreportedAdverseSignals:
          'Enrolment was stopped early for slow recruitment after 369 of an intended 620 patients, so the trial is underpowered against its own plan. Serious adverse events were 46% on allopurinol against 44% on placebo.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'PERL (N Engl J Med 2020;382:2493-2503; NCT02017171)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 530,
        primaryEndpoint:
          'Baseline-adjusted iohexol-measured GFR after 3 years plus a 2-month washout in type 1 diabetes with early to moderate diabetic kidney disease',
        endpointMet: false,
        statisticalPValue:
          'Between-group difference 0.001 mL/min/1.73 m2 (95% CI -1.9 to 1.9), p=0.99, despite serum urate falling from 6.1 to 3.9 mg/dL on allopurinol',
        unreportedAdverseSignals:
          'The mean urinary albumin excretion rate after washout was 40% higher (95% CI 0 to 80) in the allopurinol group than in the placebo group — a secondary measure moving in the wrong direction.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'FACT (N Engl J Med 2005;353:2450-2461)',
        phase: 'Phase 3, randomised, double-blind, active-controlled',
        sampleSize: 760,
        primaryEndpoint:
          'Serum urate below 6.0 mg/dL at the last three monthly measurements, febuxostat 80 mg or 120 mg against allopurinol 300 mg fixed, over 52 weeks',
        endpointMet: true,
        statisticalPValue:
          '53% and 62% on febuxostat against 21% on allopurinol 300 mg, p<0.001 for each comparison',
        unreportedAdverseSignals:
          'The allopurinol arm was fixed at 300 mg with no titration, which is not how the drug is meant to be used; a later randomised dose-escalation trial reached target in 69% of patients. Gout flare incidence between weeks 9 and 52 was similar in all three arms (64%, 70%, 64%). Four of 507 febuxostat patients and none of 253 allopurinol patients died.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'Allopurinol dose escalation (Ann Rheum Dis 2017;76:1522-1528; ACTRN12611000845932)',
        phase: 'Phase 4, randomised, controlled, parallel-group',
        sampleSize: 183,
        primaryEndpoint:
          'Reduction in serum urate and adverse events with monthly allopurinol dose escalation above the creatinine-clearance-based dose, over 12 months',
        endpointMet: true,
        statisticalPValue:
          'Mean urate change -1.5 against -0.34 mg/dL; mean difference 1.2 mg/dL (95% CI 0.67 to 1.5), p<0.001. At 12 months 69% of the escalation group and 32% of controls were below 6 mg/dL',
        unreportedAdverseSignals:
          'Fifty-two per cent of participants had creatinine clearance below 60 mL/min, the group in which dose escalation is most often avoided; only one serious adverse event across the trial was judged probably allopurinol-related, and none of the ten deaths was.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Serum urate below 6.0 mg/dL in 21% of patients at a fixed 300 mg daily over 52 weeks (FACT, n=760)',
        'Serum urate below 6.0 mg/dL in 69% of patients at 12 months when the dose was escalated monthly against 32% of controls (n=183)',
        '95% of patients below 360 micromol/L at two years under nurse-led treat-to-target care against 30% under usual care (n=517, RR 3.18)',
        'HLA-B*5801 present in 51 of 51 cases of allopurinol severe cutaneous adverse reaction, against 15% of tolerant patients (OR 580.3)',
        'Severe dermatological reactions in approximately 5 in 10,000 (0.05%) patients, per the United States label',
      ],
      unsupportedInferences: [
        'That lowering serum urate protects the heart — tested directly in 5,721 patients in ALL-HEART and found null (HR 1.04)',
        'That lowering serum urate slows kidney decline — tested in CKD-FIX and PERL and found null in both, with albuminuria 40% higher on allopurinol in PERL',
        'That a raised urate with no gout, no stones and no tumour lysis risk is a treatment indication, which the label explicitly does not recommend',
        'That allopurinol is a weak urate-lowering drug, an impression built almost entirely on comparator arms that fixed it at 300 mg',
      ],
      whatFailedInitially: [
        'The cardiovascular hypothesis: xanthine oxidase inhibition improves endothelial function in the laboratory and changed no outcome in a 4.8-year randomised trial',
        'The renal hypothesis: two randomised trials moved urate exactly as designed and left glomerular filtration rate unchanged',
        'CKD-FIX stopped enrolment early for slow recruitment at 369 of an intended 620 patients',
        'Hypersensitivity was classified as unpredictable for four decades before the responsible allele was identified in 2005',
      ],
      realWorldOutcome: [
        'On the WHO Model List of Essential Medicines and priced at about five United States cents a tablet at pharmacy acquisition cost',
        'Still first-line for urate lowering in every major gout guideline, sixty years after approval',
        'Most commonly prescribed at a fixed dose that reaches target in a minority of patients, which is the practical failure the evidence keeps pointing at',
        'The severe skin reaction remains rare, is concentrated in identifiable ancestries and in renal impairment, and is now partly predictable by a single genotype',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, 100 mg and 300 mg, taken once daily; an intravenous formulation exists for tumour lysis prophylaxis when oral therapy is not tolerated',
      description:
        'Absorbed rapidly from the gastrointestinal tract, with roughly 80% bioavailability. Allopurinol itself is cleared within one to two hours, largely by conversion to oxypurinol, which carries the therapeutic effect and is eliminated renally with a half-life of about 18 to 30 hours. Once-daily dosing therefore reflects the metabolite, not the parent. Renal impairment raises oxypurinol exposure and the label directs dose reduction accordingly.',
      safetyProfile:
        'Discontinue permanently at the first appearance of skin rash or any other sign of hypersensitivity: serious and sometimes fatal reactions including toxic epidermal necrolysis, Stevens-Johnson syndrome and DRESS occur in approximately 5 in 10,000 patients. The HLA-B*58:01 allele markedly raises that risk and is more frequent in people of African, Asian and Native Hawaiian or Pacific Islander ancestry. Other labelled warnings are gout flares on initiation, nephrotoxicity, reversible hepatotoxicity, myelosuppression, and drowsiness affecting driving. Concomitant mercaptopurine or azathioprine requires their dose to be cut to about a third or a quarter. Hypersensitivity risk is increased in renal impairment with concurrent thiazide use.',
    },
    commonQuestions: [
      {
        q: 'My uric acid is high but I have never had gout. Should I take this?',
        a: 'The label says no. It carries an explicit Limitation of Use — allopurinol is not recommended for the treatment of asymptomatic hyperuricaemia — and the older version of the same document opened with the sentence "THIS IS NOT AN INNOCUOUS DRUG" in capital letters. The three licensed indications all require something to have already happened: symptomatic gout, cancer therapy likely to cause tumour lysis, or recurrent calcium oxalate stones with uric acid excretion above 800 mg a day in men or 750 mg in women. And the idea that lowering the number protects organs has now been tested directly three times in people without gout — in heart disease, in chronic kidney disease and in type 1 diabetes — and failed all three.',
        auditNote:
          'A biomarker that predicts an outcome is not the same as a biomarker that causes it. ALL-HEART, CKD-FIX and PERL are what that distinction looks like when someone finally runs the trial.',
      },
      {
        q: 'Why did I get a gout attack right after starting it?',
        a: 'Because it is working. Lowering blood urate below the saturation point makes the crystals already sitting in your joints start to dissolve, and dissolving crystals are as inflammatory as forming ones. The label states that flares may occur during initiation and that concurrent prophylactic treatment with colchicine or an anti-inflammatory is recommended for that reason. The mistake is to read the flare as a treatment failure and stop, which resets the whole process. A rash is entirely different: the label directs permanent discontinuation at the first appearance of one.',
      },
      {
        q: 'Is 300 mg the right dose?',
        a: 'For a minority of people. In the 762-patient trial that made febuxostat’s reputation, allopurinol fixed at 300 mg got 21% of patients below the 6 mg/dL target, against 53% and 62% for the two febuxostat doses. But that arm was not allowed to titrate. When a separate randomised trial escalated the allopurinol dose monthly until the target was reached, 69% got there against 32% of controls, with essentially no excess of drug-related serious events — and that included the 52% of participants whose creatinine clearance was below 60 mL/min. The number that matters is the serum urate, not the milligrams.',
        auditNote:
          'A comparator arm dosed the way the sponsor chose is not the same as the drug used the way it is meant to be used. Half of allopurinol’s reputation for weakness comes from that difference.',
      },
      {
        q: 'I have heard this drug can cause a life-threatening rash. How worried should I be?',
        a: 'The reaction is real, it is rare, and it is now partly predictable. The label puts serious dermatological reactions — toxic epidermal necrolysis, Stevens-Johnson syndrome and DRESS — at approximately 5 in 10,000 people taking the drug. The single largest risk factor identified is the HLA-B*58:01 allele: in the Taiwanese case-control study that found it, all 51 patients with a severe reaction carried it against 15% of people who tolerated the drug. Its frequency is higher in people of African, Asian — Han Chinese, Korean and Thai are named in the label — and Native Hawaiian or Pacific Islander ancestry, and risk is further raised by kidney impairment and concurrent thiazide use. Reactions have still occurred in people without the allele, so a negative test is reassurance rather than a guarantee.',
      },
      {
        q: 'Can I take it with my other medicines?',
        a: 'The one that must be checked is azathioprine or mercaptopurine. Both are inactivated by exactly the enzyme allopurinol blocks, and the label directs that their dose be reduced to roughly a third or a quarter of usual when 300 to 600 mg of allopurinol is given alongside. Getting that wrong causes severe bone marrow suppression. Separately, the label notes hypersensitivity reactions may be more frequent in people with reduced kidney function taking a thiazide diuretic at the same time. Neither of these is a reason not to take the drug; both are reasons the full medication list has to be in front of whoever starts it.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Mackenzie IS, Hawkey CJ, Ford I, et al. Allopurinol versus usual care in UK patients with ischaemic heart disease (ALL-HEART): a multicentre, prospective, randomised, open-label, blinded-endpoint trial. Lancet 2022;400:1195-1205',
        identifier: '10.1016/S0140-6736(22)01657-9',
        kind: 'doi',
      },
      {
        label:
          'Badve SV, Pascoe EM, Tiku A, et al. Effects of Allopurinol on the Progression of Chronic Kidney Disease. N Engl J Med 2020;382:2504-2513 (CKD-FIX)',
        identifier: '10.1056/NEJMoa1915833',
        kind: 'doi',
      },
      {
        label:
          'Doria A, Galecki AT, Spino C, et al. Serum Urate Lowering with Allopurinol and Kidney Function in Type 1 Diabetes. N Engl J Med 2020;382:2493-2503 (PERL)',
        identifier: '10.1056/NEJMoa1916624',
        kind: 'doi',
      },
      {
        label:
          'Becker MA, Schumacher HR Jr, Wortmann RL, et al. Febuxostat compared with allopurinol in patients with hyperuricemia and gout. N Engl J Med 2005;353:2450-2461 (FACT)',
        identifier: '10.1056/NEJMoa050373',
        kind: 'doi',
      },
      {
        label:
          'Stamp LK, Chapman PT, Barclay ML, et al. A randomised controlled trial of the efficacy and safety of allopurinol dose escalation to achieve target serum urate in people with gout. Ann Rheum Dis 2017;76:1522-1528',
        identifier: '10.1136/annrheumdis-2016-210872',
        kind: 'doi',
      },
      {
        label:
          'Doherty M, Jenkins W, Richardson H, et al. Efficacy and cost-effectiveness of nurse-led care involving education and engagement of patients and a treat-to-target urate-lowering strategy versus usual care for gout: a randomised controlled trial. Lancet 2018;392:1403-1412',
        identifier: '10.1016/S0140-6736(18)32158-5',
        kind: 'doi',
      },
      {
        label:
          'Hung SI, Chung WH, Liou LB, et al. HLA-B*5801 allele as a genetic marker for severe cutaneous adverse reactions caused by allopurinol. Proc Natl Acad Sci U S A 2005;102:4134-4139',
        identifier: '10.1073/pnas.0409500102',
        kind: 'doi',
      },
      {
        label:
          'Zhang Y, Neogi T, Chen C, et al. Cherry consumption and decreased risk of recurrent gout attacks. Arthritis Rheum 2012;64:4004-4011',
        identifier: '10.1002/art.34677',
        kind: 'doi',
      },
      {
        label:
          'Stamp LK, O’Donnell JL, Frampton C, et al. Clinically insignificant effect of supplemental vitamin C on serum urate in patients with gout: a pilot randomized controlled trial. Arthritis Rheum 2013;65:1636-1642',
        identifier: '10.1002/art.37925',
        kind: 'doi',
      },
      {
        label:
          'Dalbeth N, Ames R, Gamble GD, et al. Effects of skim milk powder enriched with glycomacropeptide and G600 milk fat extract on frequency of gout flares: a proof-of-concept randomised controlled trial. Ann Rheum Dis 2012;71:929-934',
        identifier: '10.1136/annrheumdis-2011-200156',
        kind: 'doi',
      },
      {
        label:
          'Allopurinol tablets United States prescribing information — Indications and Limitations of Use (1), Warnings and Precautions (5.1 Skin Rash and Hypersensitivity, 5.2 Gout Flares, 5.3 Nephrotoxicity, 5.4 Hepatotoxicity, 5.5 Myelosuppression), and the thiopurine dose-reduction instruction, via the openFDA drug label endpoint',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22allopurinol%22',
        kind: 'regulatory',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — allopurinol, 87 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 2094 — allopurinol structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2094',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 2. Febuxostat — beat a cheap drug on a blood test, then lost to it on death, and now carries a
  //    boxed warning and an indication that names its competitor.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'febuxostat',
    name: 'Febuxostat',
    tradeName: 'Uloric',
    sponsor:
      'Takeda Pharmaceuticals USA (holder of NDA 021856); originated at Teijin in Japan and generic in the United States since 2019',
    targetGene: 'XDH',
    targetProtein:
      'Xanthine oxidoreductase, inhibited by a non-purine mechanism: febuxostat occupies the narrow channel leading to the molybdenum-pterin centre and blocks both the oxidised and reduced forms of the enzyme, rather than being turned over by it as allopurinol is',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2009,
    indication:
      'Chronic management of hyperuricaemia in adults with gout who have an inadequate response to a maximally titrated dose of allopurinol, who are intolerant to allopurinol, or for whom allopurinol is not advisable. Limitations of Use: not recommended for the treatment of asymptomatic hyperuricaemia. The label carries a boxed warning for cardiovascular death',
    patientFriendlyIndication: 'Gout, when allopurinol has failed or cannot be used',
    anatomicalSite:
      'Xanthine oxidoreductase in liver and intestine; unlike allopurinol’s metabolite the drug is cleared mainly by hepatic conjugation and oxidation, which is why no dose adjustment is required in mild to moderate renal impairment',
    conditionContext: {
      conditionExplainer:
        'Gout is caused by monosodium urate crystals coming out of solution in joints once blood urate sits above roughly 6.8 mg/dL. Urate-lowering drugs are judged first on whether they get the blood number below 6, and second — much later, and much less often — on whether anything else changes.',
      whyItMatters:
        'Febuxostat is the clearest case in modern rheumatology of a drug winning on the surrogate and losing on the outcome. It beat allopurinol on the urate number in every registration trial. Nine years after approval the cardiovascular safety trial the FDA had required reported higher cardiovascular and all-cause death than allopurinol, and in 2019 the drug acquired a boxed warning and an indication that instructs prescribers to try allopurinol first.',
      whoTakesThis:
        'Adults with gout in whom a maximally titrated allopurinol dose did not reach target, who reacted to allopurinol, or for whom allopurinol is not advisable. The label specifically does not recommend it for asymptomatic hyperuricaemia, and directs prescribers to weigh cardiovascular risk before starting or continuing it.',
      clinicalGoals:
        'Serum urate below 6 mg/dL, sustained, in a patient for whom the cheaper first-line drug did not work. Nothing on the label claims a benefit beyond the number.',
    },
    oneSentenceVerdict:
      'A non-purine xanthine oxidase inhibitor that reached serum urate below 6 mg/dL in 67% of patients against allopurinol’s 42% in a 2,268-patient trial, and then in the 6,190-patient CARES outcome trial showed higher cardiovascular death than allopurinol (HR 1.34, 95% CI 1.03 to 1.73) and higher all-cause death (HR 1.22, 95% CI 1.01 to 1.47) — producing a boxed warning and an indication that now names allopurinol as the drug to try first.',
    laymanHowItWorks:
      'Uric acid is made by a single enzyme, xanthine oxidase, and febuxostat plugs the narrow tunnel that leads to that enzyme’s working core. It is not a purine and is not chemically related to uric acid, so unlike allopurinol it does not have to be converted by the enzyme first — it simply sits in the channel and blocks it in both the enzyme’s resting and working states. Less uric acid is made and the blood level falls, usually within two weeks. What it does with that lower number is where the argument starts.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 52,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.2810 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 29 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States on 13 February 2009 under NDA 021856 and generic since 2019. Even generic it costs about five times as much per tablet as allopurinol, whose acquisition cost is US$0.0546. Before genericisation it was promoted heavily on the strength of the urate comparison against a fixed-dose allopurinol arm; the label now instructs that allopurinol be maximally titrated first.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The label itself names the substitute. Febuxostat is indicated only after a maximally titrated dose of allopurinol has failed or cannot be used, so the honest comparison is not febuxostat against allopurinol in general but febuxostat against properly dosed allopurinol — a comparison the registration trials never ran, and the one the boxed warning now forces.',
      conventionalRx: [
        {
          name: 'Allopurinol (Zyloprim)',
          class: 'Purine-analogue xanthine oxidase inhibitor',
          howItCompares:
            'Costs about a fifth as much, has no boxed warning, and in CARES had lower cardiovascular death (100 events, 1.1 per 100 patient-years) and lower all-cause death than febuxostat (134 CV deaths, 1.5 per 100 patient-years). Its weakness is a dosing habit rather than a property: at a fixed 300 mg it reaches target in a minority, and when escalated monthly it reached target in 69% of patients in a randomised trial.',
          typicalCost:
            'US$0.0546 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 87 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: a fifth of the price; no cardiovascular boxed warning; sixty years of use. Cons: the HLA-B*58:01 severe skin reaction; needs titration and renal dose adjustment; the thiopurine interaction.',
        },
        {
          name: 'Probenecid (Benemid)',
          class: 'Uricosuric — URAT1 and OAT inhibitor at the renal proximal tubule',
          howItCompares:
            'A different mechanism entirely, and the usual next step when a xanthine oxidase inhibitor is not tolerated. It works only where kidney function is adequate and is the wrong choice for anyone forming urate stones, because it deliberately raises urinary urate.',
          typicalCost:
            'US$0.6550 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 9 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: no xanthine oxidase involvement, so usable alongside one; long history. Cons: ineffective at low creatinine clearance; contraindicated in urate stone formers; blocks tubular secretion of many other drugs.',
        },
        {
          name: 'Pegloticase (Krystexxa)',
          class: 'PEGylated recombinant uricase, given by intravenous infusion',
          howItCompares:
            'The step beyond every oral drug: it converts urate to allantoin rather than blocking its production. Reserved for gout refractory to conventional therapy, and roughly half of patients develop anti-drug antibodies that abolish the response and drive infusion reactions.',
          typicalCost:
            'A clinic-administered biologic infusion; no United States pharmacy acquisition price is published in the CMS NADAC survey for it',
          prosAndCons:
            'Pros: dissolves tophi in months. Cons: intravenous, immunogenic, contraindicated in G6PD deficiency, and far more expensive than any oral option.',
        },
      ],
      naturalFoods: [
        {
          name: 'Cherries and cherry extract',
          activeCompound: 'Anthocyanins; the active urate-lowering component is not established',
          biologicalMechanism:
            'A proposed combination of weak uricosuria with suppression of the interleukin-1 beta response that drives the flare. Neither step has been demonstrated in humans at dietary intake.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: a case-crossover study of 633 people with gout followed for a year associated cherry intake over a two-day window with a 35% lower risk of an attack (OR 0.65, 95% CI 0.50 to 0.85). This is an observational design in which the exposure and the outcome are reported by the same person, days apart, and it cannot exclude reverse causation.',
          monthlyCost: '',
        },
        {
          name: 'Vitamin C — tested against a urate-lowering drug and beaten decisively',
          activeCompound: 'Ascorbic acid',
          biologicalMechanism:
            'Ascorbate competes with urate for reabsorption at the URAT1 transporter, lowering urate in healthy volunteers. The effect does not survive into established gout.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'Not stated here as advice. For scale only: in a randomised trial of 40 people with gout, eight weeks of vitamin C 500 mg daily lowered urate by 0.23 mg/dL against 1.9 mg/dL for starting or increasing allopurinol (p<0.001), despite plasma ascorbate rising as intended.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Say whether you have had a heart attack or stroke',
          action:
            'Give the full cardiovascular history before this drug is started, and ask why it was chosen over allopurinol.',
          patientImpact:
            'The boxed warning states that gout patients with established cardiovascular disease treated with febuxostat had a higher rate of cardiovascular death than those treated with allopurinol, and directs that the risks and benefits be considered when prescribing or continuing it.',
          clinicalPrecaution:
            'Section 5.1 additionally suggests considering prophylactic low-dose aspirin in patients with a cardiovascular history, and monitoring for cardiovascular events.',
        },
        {
          name: 'A flare after starting is not a reason to stop',
          action: 'Keep taking it through an early flare unless told otherwise.',
          patientImpact:
            'The label states that an increase in gout flares is frequently observed after initiation, that this is due to urate being mobilised from tissue deposits, and that febuxostat need not be discontinued if a flare occurs. Prophylaxis with an NSAID or colchicine may be beneficial for up to six months.',
          clinicalPrecaution:
            'A skin reaction is the opposite case: the label directs discontinuation if serious skin reactions including Stevens-Johnson syndrome, DRESS or toxic epidermal necrolysis are suspected.',
        },
        {
          name: 'Report jaundice, dark urine or right-sided abdominal pain',
          action: 'Get liver tests if any of these appear.',
          patientImpact:
            'Section 5.3 records cases of hepatic failure, some fatal. The label directs prompt interruption if liver injury is detected and permanent discontinuation if liver injury is confirmed with no alternative cause found.',
          clinicalPrecaution:
            'This is one of the few respects in which febuxostat is handled more cautiously than allopurinol, whose hepatotoxicity is described in its own label as usually reversible.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC1=C(SC(=N1)C2=CC(=C(C=C2)OCC(C)C)C#N)C(=O)O',
      chemicalFormula: 'C16H16N2O3S',
      molecularWeight: '316.40 g/mol',
      targetReceptorAffinity:
        '2-[3-cyano-4-(2-methylpropoxy)phenyl]-4-methyl-1,3-thiazole-5-carboxylic acid. It is not a purine and bears no structural resemblance to hypoxanthine, which is the point: it inhibits both the oxidised and the reduced forms of xanthine oxidoreductase by occupying the substrate channel, whereas allopurinol must first be oxidised by the enzyme to oxypurinol, which binds only the reduced molybdenum centre. The label states that at therapeutic concentrations febuxostat is not expected to inhibit other enzymes of purine and pyrimidine metabolism.',
      structureSource: {
        label:
          'PubChem CID 134018 (febuxostat) — canonical SMILES, molecular formula and weight, as carried on the enriched record; mechanism statement from the febuxostat United States prescribing information, section 12.1',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/134018',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'feb-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identify the crystal form before anything else',
          description:
            'Febuxostat is a carboxylic acid with an extensive and heavily litigated polymorph landscape; different crystalline forms dissolve at different rates and a generic that matches on assay can still miss on dissolution. Form identity is the release-critical attribute for this molecule, not purity.',
          reagentsAndBuffer:
            'Febuxostat reference standard, powder X-ray diffraction against indexed reference patterns, differential scanning calorimetry, Raman microscopy, dynamic vapour sorption for hydrate screening, USP dissolution apparatus in buffered media across the physiological pH range',
        },
        {
          id: 'feb-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Build the thiazole, then hang the ether and unmask the acid',
          description:
            'The published route condenses a substituted thiobenzamide with a 2-chloroacetoacetate ester in a Hantzsch thiazole cyclisation, alkylates the phenol with isobutyl bromide to install the 2-methylpropoxy ether, and saponifies the ester to the free carboxylic acid. The nitrile on the ring is carried through rather than introduced late.',
          dependsOnStepId: 'feb-w1',
          reagentsAndBuffer:
            'Substituted 4-hydroxythiobenzamide, ethyl 2-chloroacetoacetate, base for the Hantzsch condensation, isobutyl bromide with potassium carbonate in a polar aprotic solvent, aqueous sodium hydroxide for ester hydrolysis, controlled acidification to precipitate the acid',
        },
        {
          id: 'feb-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallise to a specified form and control the alkylating-agent residues',
          description:
            'The isobutylation step leaves an alkyl halide residue that is a genotoxic impurity class, and the crystallisation solvent determines which polymorph is obtained. Purification here is a crystal-engineering exercise as much as a purity one.',
          dependsOnStepId: 'feb-w2',
          reagentsAndBuffer:
            'Controlled recrystallisation from a defined solvent and antisolvent pair with seeding, headspace GC-MS for residual isobutyl bromide and solvents, HPLC with photodiode array for related substances, powder X-ray diffraction on every batch',
        },
        {
          id: 'feb-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Confirm hepatic conjugation, not renal clearance, is the exit route',
          description:
            'The clinical selling point over allopurinol is that no dose adjustment is needed in mild to moderate renal impairment, and that rests on the drug being cleared by glucuronidation and oxidation in the liver rather than by the kidney. The assay that supports it is a hepatocyte clearance study with UGT and CYP contributions resolved, not a plasma half-life.',
          dependsOnStepId: 'feb-w3',
          reagentsAndBuffer:
            'Cryopreserved human hepatocytes, recombinant UGT1A1, UGT1A3, UGT1A9 and UGT2B7 supersomes, CYP1A2, CYP2C8 and CYP2C9 reaction phenotyping, LC-MS/MS quantification of parent and acyl glucuronide',
        },
        {
          id: 'feb-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Report the urate endpoint next to a cardiovascular endpoint, not instead of it',
          description:
            'The entire registration programme measured the proportion of patients below 6 mg/dL. The trial that changed the label measured death. A programme that reports only the first, in a population with 92% hypertension and 39% prior myocardial infarction, has not measured what the drug does to those patients.',
          dependsOnStepId: 'feb-w4',
          reagentsAndBuffer:
            'Uricase-peroxidase serum urate assay with monthly sampling, independent blinded adjudication of cardiovascular death, non-fatal myocardial infarction, non-fatal stroke and unstable angina with urgent revascularisation, event-driven follow-up to a prespecified event count',
        },
      ],
    },
    keyAudits: [
      {
        id: 'feb-a1',
        category: 'conclusion_shift',
        title: 'CARES: non-inferior on the composite, worse on death, and a boxed warning followed',
        laymanSummary:
          'The safety trial the regulator demanded found the same rate of heart attacks and strokes as allopurinol, but more deaths — both from heart causes and from all causes. The drug now carries a boxed warning and may only be used after allopurinol has failed.',
        technicalDetails:
          'CARES randomised 6,190 patients with gout and established cardiovascular disease to febuxostat (n=3,098) or allopurinol (n=3,092), median follow-up 2.6 years. The primary composite of cardiovascular death, non-fatal myocardial infarction, non-fatal stroke or unstable angina with urgent revascularisation occurred in 335 (10.8%) against 321 (10.4%) — hazard ratio 1.03, upper limit of the one-sided 98.5% CI 1.23, meeting the prespecified non-inferiority margin of 1.3 (p=0.002). But all-cause death was higher on febuxostat (HR 1.22, 95% CI 1.01 to 1.47) and cardiovascular death higher still (HR 1.34, 95% CI 1.03 to 1.73). The label records 134 cardiovascular deaths (1.5 per 100 patient-years) against 100 (1.1 per 100 patient-years), with sudden cardiac death the commonest adjudicated cause: 2.7% (83 of 3,098) against 1.8% (56 of 3,092). Note what the allopurinol arm was: titrated monthly to 600 mg, or 400 mg in moderate renal impairment — not the fixed 300 mg of the registration trials.',
        evidenceSource:
          'White WB et al. Cardiovascular Safety of Febuxostat or Allopurinol in Patients with Gout. N Engl J Med 2018;378:1200-1210 (CARES, NCT01101035); febuxostat United States prescribing information, boxed warning and sections 5.1 and 14.2',
        doi: '10.1056/NEJMoa1710895',
        measuredMetric:
          'All-cause and cardiovascular mortality against allopurinol over a median 2.6 years',
        auditFlag: 'contested',
      },
      {
        id: 'feb-a2',
        category: 'failed',
        title:
          'Nearly half the patients in the trial that decided the question walked away from it',
        laymanSummary:
          'CARES lost 45% of its participants to follow-up and 57% stopped taking the study drug. A mortality difference measured under those conditions is a fragile thing to hang a boxed warning on — and a fragile thing to dismiss.',
        technicalDetails:
          'The published report states that the trial regimen was discontinued in 56.6% of patients and 45.0% discontinued follow-up. Losing nearly half of a mortality endpoint is a first-order threat to the result in either direction: deaths among those lost are unobserved, and the loss was not necessarily balanced. The authors reported that on-treatment analyses were similar to the modified intention-to-treat analysis, which mitigates but does not remove the problem. This is why the follow-up trial mattered so much, and why the field did not simply accept CARES as final.',
        evidenceSource:
          'White WB et al. N Engl J Med 2018;378:1200-1210, Results section (discontinuation of trial regimen 56.6%, discontinuation of follow-up 45.0%)',
        doi: '10.1056/NEJMoa1710895',
        measuredMetric:
          'Proportion of randomised patients lost to follow-up and off study drug in the trial that produced the mortality signal',
        auditFlag: 'caution',
      },
      {
        id: 'feb-a3',
        category: 'conclusion_shift',
        title: 'FAST: a larger trial, run in Europe, that did not reproduce the mortality signal',
        laymanSummary:
          'A second cardiovascular safety trial, ordered by the European regulator and about the same size, found no excess death on febuxostat. Two large randomised trials asked the same question and disagreed.',
        technicalDetails:
          'FAST enrolled 6,128 patients aged 60 or over already taking allopurinol with at least one additional cardiovascular risk factor, in the UK, Denmark and Sweden, and randomised them after an allopurinol optimisation lead-in to continue optimised allopurinol (n=3,065) or switch to febuxostat 80 mg rising to 120 mg (n=3,063). Median follow-up was 1,467 days. On treatment, the primary composite occurred at 1.72 events per 100 patient-years on febuxostat against 2.05 on allopurinol — adjusted HR 0.85 (95% CI 0.70 to 1.03, p<0.0001 for non-inferiority). Deaths were 222 (7.2%) on febuxostat against 263 (8.6%) on allopurinol. The two trials differ in design in ways that plausibly matter: FAST was open-label, enrolled patients already established and optimised on allopurinol, excluded recent infarction or stroke and severe heart failure, and lost only about 6% to follow-up against CARES’s 45%. The FDA boxed warning has stood; the European position after FAST did not follow it.',
        evidenceSource:
          'Mackenzie IS et al. Long-term cardiovascular safety of febuxostat compared with allopurinol in patients with gout (FAST): a multicentre, prospective, randomised, open-label, non-inferiority trial. Lancet 2020;396:1745-1757',
        doi: '10.1016/S0140-6736(20)32234-0',
        measuredMetric:
          'Composite of hospitalisation for non-fatal myocardial infarction or biomarker-positive acute coronary syndrome, non-fatal stroke, or cardiovascular death, on treatment',
        auditFlag: 'contested',
      },
      {
        id: 'feb-a4',
        category: 'inferred',
        title: 'At the starting dose, it is not better than the drug it replaced',
        laymanSummary:
          'The 80 mg dose beats allopurinol on the blood test. The 40 mg dose most people start on does not — the difference was 3%, and the confidence interval crossed zero.',
        technicalDetails:
          'In the 2,268-patient six-month registration trial (Study 1, NCT00430248), serum urate below 6 mg/dL at final visit was reached by 45% on febuxostat 40 mg, 67% on febuxostat 80 mg and 42% on allopurinol. The label reports the difference for 40 mg against allopurinol as 3% (95% CI -2% to 8%) — not superior — against 25% (95% CI 20% to 30%) for 80 mg. In the renal-impairment subgroup the corresponding figures were 50%, 72% and 42%. The urate superiority that carried this drug into practice belongs to the higher dose, against an allopurinol arm capped at 300 mg (200 mg in moderate impairment). Against a maximally titrated allopurinol — which is what the label now requires before febuxostat is used — no such comparison exists.',
        evidenceSource:
          'Febuxostat United States prescribing information, section 14.1, Tables 3 and 4 (Study 1, NCT00430248; Study 2, NCT00174915; Study 3, NCT00102440)',
        inferredClaim:
          'That febuxostat is a more effective urate-lowering drug than allopurinol — established only at 80 mg against a dose-capped allopurinol arm, and not established at all at the 40 mg starting dose',
        auditFlag: 'caution',
      },
      {
        id: 'feb-a5',
        category: 'measured',
        title: 'Lowering urate more did not mean fewer attacks',
        laymanSummary:
          'In the 52-week head-to-head trial, febuxostat lowered uric acid far more than allopurinol and the number of gout attacks was the same in all three groups.',
        technicalDetails:
          'FACT randomised 760 patients to febuxostat 80 mg, febuxostat 120 mg or allopurinol 300 mg for 52 weeks. The primary urate endpoint was met by 53%, 62% and 21% respectively (p<0.001 for each febuxostat comparison). Gout flare incidence between weeks 9 and 52 was 64%, 70% and 64% — p=0.99 for febuxostat 80 mg against allopurinol and p=0.23 for 120 mg. Median tophus area reduction was 83%, 66% and 50%, neither febuxostat comparison reaching significance (p=0.08 and p=0.16). Over a year, a large and statistically overwhelming difference in the surrogate produced no measurable difference in the symptom the patient actually has. Crystal dissolution takes longer than a year, which is a real explanation — and it is also exactly the kind of explanation that has to be tested rather than assumed.',
        evidenceSource:
          'Becker MA et al. Febuxostat compared with allopurinol in patients with hyperuricemia and gout. N Engl J Med 2005;353:2450-2461 (FACT)',
        doi: '10.1056/NEJMoa050373',
        measuredMetric:
          'Gout flare incidence weeks 9 to 52 and median tophus area reduction, alongside the serum urate endpoint',
        auditFlag: 'caution',
      },
      {
        id: 'feb-a6',
        category: 'inferred',
        title: 'A post-hoc analysis suggesting the target can be overshot',
        laymanSummary:
          'In a Japanese trial of older people with high uric acid and no gout, the lowest achieved uric acid levels were associated with the highest event rates — a J-shaped curve, not a straight line.',
        technicalDetails:
          'FREED randomised 1,070 older patients with asymptomatic hyperuricaemia to febuxostat (n=537) or non-febuxostat treatment (n=533). A post-hoc analysis grouped patients by achieved serum urate. Within the febuxostat arm, compared with those achieving 5 to 6 mg/dL, the hazard ratio for the composite of all-cause death and cerebral, cardiovascular and renal events was 2.01 (95% CI 1.05 to 3.87) for urate at or below 4 mg/dL, 2.12 (1.07 to 4.20) for above 4 to 5 mg/dL, 2.42 (1.05 to 5.60) for above 6 to 7, and 4.73 (2.13 to 10.5) above 7 (log-rank p=0.003). No such relationship was significant in the non-febuxostat arm (p=0.212). This is a post-hoc, non-randomised comparison within one arm of a trial in a population the drug is not indicated for, and achieved urate is a marker of many things other than dose. It is not evidence that driving urate low is harmful — it is a reason not to assume the opposite without testing it.',
        evidenceSource:
          'Kojima S et al. Optimal uric acid levels by febuxostat treatment and cerebral, cardiorenovascular risks: post hoc analysis of a randomized controlled trial (FREED, NCT01984749). Rheumatology (Oxford) 2022;61:2346-2359',
        doi: '10.1093/rheumatology/keab739',
        inferredClaim:
          'That there is an optimal serum urate window of 5 to 6 mg/dL below which urate lowering becomes harmful — generated by a post-hoc within-arm analysis and not tested prospectively',
        auditFlag: 'contested',
      },
      {
        id: 'feb-a7',
        category: 'measured',
        title: 'The indication now names its own competitor',
        laymanSummary:
          'This is unusual: the licensed use of febuxostat is written as "after allopurinol", by name, in the indications section of the label.',
        technicalDetails:
          'The current indication reads: "for the chronic management of hyperuricemia in adult patients with gout who have an inadequate response to a maximally titrated dose of allopurinol, who are intolerant to allopurinol, or for whom treatment with allopurinol is not advisable." A Limitation of Use adds that it is not recommended for asymptomatic hyperuricaemia. The 2009 indication had no such restriction; the wording was added in 2019 alongside the boxed warning, on the strength of CARES. The regulatory record therefore contains a clear direction of travel: a drug approved on a surrogate advantage, narrowed nine years later when the outcome trial reported.',
        evidenceSource:
          'Febuxostat United States prescribing information, section 1 Indications and Usage with Limitations of Use, and boxed warning (openFDA label, effective 8 May 2024)',
        measuredMetric: 'Licensed indication wording before and after the 2019 boxed warning',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Not a purine, and that is the design',
        laymanDesc:
          'Febuxostat looks nothing like uric acid or its precursors. It was built to fit the enzyme’s access tunnel rather than to imitate its food.',
        molecularDetail:
          '2-[3-cyano-4-(2-methylpropoxy)phenyl]-4-methylthiazole-5-carboxylic acid: a thiazole carboxylic acid with a nitrile and an isobutyl ether on a benzene ring. Because it is not a purine, the label states it is not expected to inhibit other enzymes of purine and pyrimidine metabolism at therapeutic concentrations.',
        iconName: 'Shapes',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It blocks the tunnel, in both enzyme states',
        laymanDesc:
          'Rather than binding the enzyme’s reactive core, it wedges into the narrow channel that substrate must travel down — so it works whether the enzyme is loaded or resting.',
        molecularDetail:
          'Febuxostat occupies the substrate channel leading to the molybdenum-pterin centre of xanthine oxidoreductase and inhibits both the oxidised and reduced forms. Allopurinol, by contrast, must be oxidised by the enzyme to oxypurinol, which binds only the reduced molybdenum-IV centre and releases as the centre reoxidises.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'Cleared by the liver, so the kidney matters less',
        laymanDesc:
          'It leaves the body mainly through liver processing rather than through the kidney, which is why the dose does not have to be cut for mild or moderate kidney impairment.',
        molecularDetail:
          'Elimination is predominantly by hepatic glucuronidation via UGT enzymes and oxidation by CYP1A2, CYP2C8 and CYP2C9, with the metabolites and a minority of parent drug appearing in urine and faeces. This is the principal pharmacological argument for the drug over allopurinol, whose active metabolite oxypurinol is renally cleared and accumulates in renal impairment.',
        iconName: 'Filter',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'Urate falls, usually within two weeks',
        laymanDesc:
          'Most people who respond are below the target level by the second week and stay there.',
        molecularDetail:
          'The label records that in 76% of patients on 80 mg, serum urate fell below 6 mg/dL by the week 2 visit, and that average levels were maintained at or below 6 mg/dL throughout treatment in 83% of those patients. Fewer patients with baseline urate at or above 10 mg/dL or with tophi reached the goal in any arm.',
        iconName: 'TrendingDown',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Attacks increase before they decrease',
        laymanDesc:
          'Bringing the level down mobilises the crystals already in the joints, so flares often get worse for a while. That is expected, and it is not a reason to stop.',
        molecularDetail:
          'Section 5.2 attributes the early increase in flares to reduction in serum uric acid resulting in mobilisation of urate from tissue deposits, states that febuxostat need not be discontinued if a flare occurs, and notes that prophylaxis with an NSAID or colchicine may be beneficial for up to six months.',
        iconName: 'Flame',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And the endpoint that changed the label',
        laymanDesc:
          'The trial that measured death, not uric acid, found more cardiovascular deaths on febuxostat than on allopurinol. That result is printed in a black box at the top of the prescribing information.',
        molecularDetail:
          'CARES: cardiovascular death HR 1.34 (95% CI 1.03 to 1.73), all-cause death HR 1.22 (1.01 to 1.47), with sudden cardiac death 2.7% (83/3,098) against 1.8% (56/3,092). No mechanism for the excess has been established, non-fatal infarction and stroke rates were similar, and the larger FAST trial did not reproduce it (HR 0.85, 95% CI 0.70 to 1.03).',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'CARES (N Engl J Med 2018;378:1200-1210; NCT01101035)',
        phase: 'Phase 4, randomised, double-blind, active-controlled non-inferiority outcome trial',
        sampleSize: 6190,
        primaryEndpoint:
          'Time to first major adverse cardiovascular event — composite of cardiovascular death, non-fatal myocardial infarction, non-fatal stroke, or unstable angina with urgent coronary revascularisation — in gout patients with established cardiovascular disease',
        endpointMet: true,
        statisticalPValue:
          '10.8% against 10.4%; hazard ratio 1.03, upper limit of the one-sided 98.5% CI 1.23 against a prespecified margin of 1.3, p=0.002 for non-inferiority, median follow-up 2.6 years',
        unreportedAdverseSignals:
          'The composite was met and the mortality was not: all-cause death HR 1.22 (95% CI 1.01 to 1.47), cardiovascular death HR 1.34 (95% CI 1.03 to 1.73), sudden cardiac death 2.7% against 1.8%. The trial regimen was discontinued in 56.6% of patients and 45.0% discontinued follow-up.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'FAST (Lancet 2020;396:1745-1757; EudraCT 2011-001883-23, ISRCTN72443728)',
        phase: 'Phase 4, randomised, open-label, blinded-endpoint non-inferiority trial',
        sampleSize: 6128,
        primaryEndpoint:
          'Composite of hospitalisation for non-fatal myocardial infarction or biomarker-positive acute coronary syndrome, non-fatal stroke, or cardiovascular death, in patients aged 60 or over already on allopurinol with at least one cardiovascular risk factor',
        endpointMet: true,
        statisticalPValue:
          '1.72 against 2.05 events per 100 patient-years; adjusted hazard ratio 0.85 (95% CI 0.70 to 1.03), p<0.0001 for non-inferiority, median follow-up 1,467 days',
        unreportedAdverseSignals:
          'Deaths were 222 (7.2%) on febuxostat against 263 (8.6%) on allopurinol — the opposite direction from CARES. The trial was open-label; randomised therapy was discontinued in 32.4% of the febuxostat group against 16.5% of the allopurinol group, an asymmetry inherent in asking patients already stable on allopurinol to switch.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'Study 1 / CONFIRMS (NCT00430248), febuxostat registration programme',
        phase: 'Phase 3, randomised, double-blind, active-controlled',
        sampleSize: 2268,
        primaryEndpoint:
          'Proportion of patients with serum urate below 6 mg/dL at final visit, febuxostat 40 mg or 80 mg against allopurinol 300 mg (200 mg in moderate renal impairment), over six months',
        endpointMet: true,
        statisticalPValue:
          '45% on 40 mg, 67% on 80 mg, 42% on allopurinol. Difference against allopurinol 3% (95% CI -2% to 8%) for 40 mg — not superior — and 25% (95% CI 20% to 30%) for 80 mg',
        unreportedAdverseSignals:
          'The comparator was dose-capped: 300 mg for creatinine clearance at or above 60 mL/min and 200 mg below it, with no titration to target. The starting dose of febuxostat was not superior to that capped allopurinol arm.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'FACT (N Engl J Med 2005;353:2450-2461)',
        phase: 'Phase 3, randomised, double-blind, active-controlled',
        sampleSize: 760,
        primaryEndpoint:
          'Serum urate below 6.0 mg/dL at the last three monthly measurements, febuxostat 80 mg or 120 mg against allopurinol 300 mg, over 52 weeks',
        endpointMet: true,
        statisticalPValue: '53% and 62% against 21%, p<0.001 for each febuxostat comparison',
        unreportedAdverseSignals:
          'Gout flare incidence weeks 9 to 52 was 64%, 70% and 64% — no difference despite a threefold difference in the urate endpoint. Median tophus area reduction 83%, 66% and 50%, neither comparison significant. Four of 507 febuxostat patients died against none of 253 on allopurinol; all deaths were judged unrelated by blinded investigators (p=0.31).',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'FREED post-hoc analysis (Rheumatology 2022;61:2346-2359; NCT01984749)',
        phase: 'Post-hoc analysis of a randomised open-label trial',
        sampleSize: 1070,
        primaryEndpoint:
          'Composite of all-cause mortality and cerebral, cardiovascular and renal events by achieved serum urate category, in older patients with asymptomatic hyperuricaemia',
        endpointMet: false,
        statisticalPValue:
          'Within the febuxostat arm, against the 5 to 6 mg/dL reference: HR 2.01 (95% CI 1.05 to 3.87) at or below 4 mg/dL, 2.12 (1.07 to 4.20) for 4 to 5, 2.42 (1.05 to 5.60) for 6 to 7, 4.73 (2.13 to 10.5) above 7; log-rank p=0.003',
        unreportedAdverseSignals:
          'This is a within-arm, non-randomised comparison by achieved biomarker level, which confounds dose, adherence and underlying illness. The same relationship was not significant in the non-febuxostat arm (p=0.212), and the population — asymptomatic hyperuricaemia — is one the label does not recommend treating at all.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Serum urate below 6 mg/dL at final visit in 67% on febuxostat 80 mg against 42% on dose-capped allopurinol (n=2,268)',
        'Serum urate below 6 mg/dL in 45% on febuxostat 40 mg — difference against allopurinol 3% (95% CI -2% to 8%), not superior',
        'All-cause death HR 1.22 (95% CI 1.01 to 1.47) and cardiovascular death HR 1.34 (95% CI 1.03 to 1.73) against allopurinol in 6,190 patients over a median 2.6 years',
        'Sudden cardiac death 2.7% (83 of 3,098) on febuxostat against 1.8% (56 of 3,092) on allopurinol, per the label',
        'Primary cardiovascular composite HR 0.85 (95% CI 0.70 to 1.03) in the 6,128-patient FAST trial — no excess',
      ],
      unsupportedInferences: [
        'That febuxostat is the more effective urate-lowering drug in general, when the superiority was shown only at 80 mg against an allopurinol arm capped at 300 mg and never titrated to target',
        'That lowering urate further produces fewer gout attacks, which a 52-week head-to-head trial with a threefold urate difference did not show',
        'That the CARES mortality signal is settled, when a larger European trial in a comparable population found the opposite direction',
        'That achieved urate below 5 mg/dL is harmful, which comes from a post-hoc within-arm analysis in a population the drug is not indicated for',
      ],
      whatFailedInitially: [
        'CARES lost 45.0% of participants to follow-up and 56.6% to discontinuation of study drug, in a trial whose endpoint was death',
        'The 40 mg starting dose failed to demonstrate superiority over the comparator arm in the largest registration trial',
        'The tophus-area advantage over allopurinol in FACT did not reach significance at either dose (p=0.08 and p=0.16)',
        'The 2009 indication was narrowed in 2019 to patients in whom allopurinol had failed, was not tolerated, or was not advisable',
      ],
      realWorldOutcome: [
        'Approved 13 February 2009 under NDA 021856; generic in the United States since 2019 and still about five times the price of allopurinol at acquisition cost',
        'Carries a boxed warning for cardiovascular death — one of very few chronic-disease drugs to acquire one on the strength of a post-approval outcome trial',
        'The European regulator commissioned FAST, which did not reproduce the signal; the two regulatory positions have not converged',
        'Remains genuinely useful for the population the label now describes: people who cannot take allopurinol, including those who reacted to it',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, 40 mg and 80 mg, taken once daily with or without food',
      description:
        'Absorbed rapidly with peak concentrations at roughly one to one and a half hours. Cleared predominantly by hepatic glucuronidation and oxidation rather than renal excretion, so no dose adjustment is required in mild to moderate renal impairment — the principal pharmacological argument for the drug. The urate effect appears within two weeks in most responders.',
      safetyProfile:
        'Boxed warning for cardiovascular death: gout patients with established cardiovascular disease had a higher rate of cardiovascular death than those on allopurinol, and the drug is restricted to patients in whom a maximally titrated allopurinol dose failed, was not tolerated, or is not advisable. Section 5.1 suggests considering prophylactic low-dose aspirin in patients with cardiovascular history and monitoring for cardiovascular events. Other labelled warnings are an expected early increase in gout flares (which is not a reason to stop the drug), hepatic effects including cases of hepatic failure some of them fatal, and serious skin and hypersensitivity reactions including Stevens-Johnson syndrome, DRESS and toxic epidermal necrolysis. Not recommended for asymptomatic hyperuricaemia.',
    },
    commonQuestions: [
      {
        q: 'Should I be worried about the boxed warning?',
        a: 'It should be part of the conversation, not the end of it. The warning comes from CARES, which randomised 6,190 gout patients who all had established cardiovascular disease and found more cardiovascular deaths on febuxostat than on allopurinol — 1.5 against 1.1 per 100 patient-years, hazard ratio 1.34 — with no difference in non-fatal heart attacks or strokes. Two things complicate it. Nearly half the trial’s participants stopped follow-up, which weakens a mortality result in both directions. And a second, larger trial in Europe, FAST, followed 6,128 similar patients and found no excess at all, with a hazard ratio of 0.85 in the other direction. The FDA kept the warning; the European regulator did not add one. What is not in dispute is who the trial studied: people who already had heart disease.',
        auditNote:
          'Two adequately powered randomised trials asking the same question and disagreeing is not a scandal — it is what the middle of an evidence base looks like. The page shows both.',
      },
      {
        q: 'Why does the label tell my doctor to try allopurinol first?',
        a: 'Because that wording was added in 2019, alongside the boxed warning, after CARES reported. The indication now reads that febuxostat is for adults with gout "who have an inadequate response to a maximally titrated dose of allopurinol, who are intolerant to allopurinol, or for whom treatment with allopurinol is not advisable". The word doing the work is "maximally titrated": a great deal of the case for febuxostat was built against an allopurinol arm fixed at 300 mg, which is not the same drug as an allopurinol dose escalated until the urate target is reached.',
      },
      {
        q: 'Is it stronger than allopurinol?',
        a: 'At 80 mg, on the blood test, yes — 67% of patients reached a urate below 6 mg/dL against 42% on the comparator, in a 2,268-patient trial. At the 40 mg dose most people start on, no: the difference was 3% with a confidence interval from -2% to 8%, which the label reports as not superior. And in the 52-week head-to-head trial where febuxostat produced a threefold advantage on the urate endpoint, the proportion of patients having gout attacks between weeks 9 and 52 was 64%, 70% and 64% — identical. A bigger movement in the surrogate did not produce a difference in the symptom over a year.',
        auditNote:
          'Crystal dissolution genuinely takes longer than a year, so the flare result is not proof of no benefit. It is proof that the benefit was assumed rather than shown.',
      },
      {
        q: 'My kidneys are not great. Is this the better choice?',
        a: 'It is the argument the drug was designed around. Febuxostat is cleared mostly by the liver, through glucuronidation and oxidation, whereas allopurinol’s active metabolite oxypurinol is cleared by the kidney and accumulates when clearance falls. So no dose adjustment is required for mild to moderate renal impairment with febuxostat. In the registration trial’s renal-impairment subgroup, 72% on 80 mg reached target against 42% on allopurinol. That is a real advantage — but it sits alongside the boxed warning, and the CARES population was 92% renally impaired to some degree, so it is not a group in which the mortality question can be waved away.',
      },
      {
        q: 'I read that driving uric acid too low is dangerous. Is that true?',
        a: 'That claim comes from one post-hoc analysis of the Japanese FREED trial, in which patients within the febuxostat arm who ended up below 5 mg/dL had higher event rates than those who ended between 5 and 6. It is worth knowing about and it is weak evidence: the comparison is not randomised, the groups are defined by an outcome of treatment rather than by assignment, achieved urate reflects illness and adherence as much as dose, the same pattern was not significant in the comparison arm, and the population was people with no gout at all — which the label does not recommend treating. It has not been tested prospectively.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'White WB, Saag KG, Becker MA, et al. Cardiovascular Safety of Febuxostat or Allopurinol in Patients with Gout. N Engl J Med 2018;378:1200-1210 (CARES)',
        identifier: '10.1056/NEJMoa1710895',
        kind: 'doi',
      },
      {
        label:
          'Mackenzie IS, Ford I, Nuki G, et al. Long-term cardiovascular safety of febuxostat compared with allopurinol in patients with gout (FAST): a multicentre, prospective, randomised, open-label, non-inferiority trial. Lancet 2020;396:1745-1757',
        identifier: '10.1016/S0140-6736(20)32234-0',
        kind: 'doi',
      },
      {
        label:
          'Becker MA, Schumacher HR Jr, Wortmann RL, et al. Febuxostat compared with allopurinol in patients with hyperuricemia and gout. N Engl J Med 2005;353:2450-2461 (FACT)',
        identifier: '10.1056/NEJMoa050373',
        kind: 'doi',
      },
      {
        label:
          'Kojima S, Uchiyama K, Yokota N, et al. Optimal uric acid levels by febuxostat treatment and cerebral, cardiorenovascular risks: post hoc analysis of a randomized controlled trial. Rheumatology (Oxford) 2022;61:2346-2359 (FREED)',
        identifier: '10.1093/rheumatology/keab739',
        kind: 'doi',
      },
      {
        label: 'CARES cardiovascular outcomes trial registry record',
        identifier: 'NCT01101035',
        kind: 'nct',
      },
      {
        label:
          'Febuxostat registration trial (Study 1 in the label, six months, n=2,268) registry record',
        identifier: 'NCT00430248',
        kind: 'nct',
      },
      {
        label:
          'Febuxostat United States prescribing information — boxed warning (Cardiovascular Death), Indications and Usage with Limitations of Use (1), Warnings and Precautions (5.1 Cardiovascular Death, 5.2 Gout Flares, 5.3 Hepatic Effects, 5.4 Serious Skin Reactions), Clinical Studies (14.1 Tables 3 and 4, 14.2), Mechanism of Action (12.1), via the openFDA drug label endpoint',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22febuxostat%22',
        kind: 'regulatory',
      },
      {
        label:
          'Stamp LK, Chapman PT, Barclay ML, et al. A randomised controlled trial of the efficacy and safety of allopurinol dose escalation to achieve target serum urate in people with gout. Ann Rheum Dis 2017;76:1522-1528 — the titrated-allopurinol comparison the registration programme never ran',
        identifier: '10.1136/annrheumdis-2016-210872',
        kind: 'doi',
      },
      {
        label:
          'Zhang Y, Neogi T, Chen C, et al. Cherry consumption and decreased risk of recurrent gout attacks. Arthritis Rheum 2012;64:4004-4011',
        identifier: '10.1002/art.34677',
        kind: 'doi',
      },
      {
        label:
          'Stamp LK, O’Donnell JL, Frampton C, et al. Clinically insignificant effect of supplemental vitamin C on serum urate in patients with gout: a pilot randomized controlled trial. Arthritis Rheum 2013;65:1636-1642',
        identifier: '10.1002/art.37925',
        kind: 'doi',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — febuxostat, 29 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 134018 — febuxostat structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/134018',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 3. Probenecid — invented to make wartime penicillin go further, kept for gout on a label older
  //    than modern trial law, and in 2024 approved again for the job it was originally built for.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'probenecid',
    name: 'Probenecid',
    tradeName: 'Benemid / Probalan / Col-Probenecid (with colchicine) / a component of Orlynvah',
    sponsor:
      'Merck (originator, as Benemid); the standalone tablet is now made by many generic manufacturers, and the sulopenem–probenecid combination Orlynvah is held by Iterum Therapeutics under NDA 213972',
    targetGene: 'SLC22A12',
    targetProtein:
      'URAT1, the urate–anion exchanger of the renal proximal tubule (SLC22A12), together with the organic anion transporters OAT1 and OAT3 (SLC22A6 and SLC22A8) — the same transporters that secrete penicillins, methotrexate, ketorolac and many other anions',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1951,
    indication:
      'Treatment of the hyperuricaemia associated with gout and gouty arthritis; and as an adjuvant to therapy with penicillin, ampicillin, methicillin, oxacillin, cloxacillin or nafcillin, for elevation and prolongation of plasma levels by whatever route the antibiotic is given',
    patientFriendlyIndication: 'Gout, and raising antibiotic levels',
    anatomicalSite:
      'The brush-border and basolateral membranes of the renal proximal tubule cell, where urate is reabsorbed and organic anions are secreted',
    conditionContext: {
      conditionExplainer:
        'About nine in ten people with gout have it because the kidney holds on to too much urate, not because the body makes too much. Roughly 90% of filtered urate is reabsorbed in the proximal tubule before the urine leaves the kidney. Probenecid blocks that reabsorption, so more urate leaves in the urine and less stays in the blood.',
      whyItMatters:
        'This is a drug whose two indications are the same pharmacology pointed in two directions. Blocking the proximal tubule’s anion transporters keeps urate out of the blood — and keeps penicillin in it. It was built for the second purpose during the Second World War, when penicillin was rationed, and it spent seventy years being prescribed for the first. In October 2024 the FDA approved a sulopenem–probenecid tablet for uncomplicated urinary tract infection, which is the original idea returning as a new drug.',
      whoTakesThis:
        'Adults with gout, generally as a second-line urate-lowering drug after allopurinol has failed or could not be used, and specifically people who under-excrete urate and have reasonable kidney function. Not people with uric acid kidney stones, and not people taking aspirin, which the label states is contraindicated with it.',
      clinicalGoals:
        'A lower serum urate achieved by putting more urate into the urine. That is a different trade-off from allopurinol, which lowers both blood and urine urate, and it is why hydration and urinary alkalinisation are part of the label.',
    },
    oneSentenceVerdict:
      'A proximal-tubule transport blocker that lowers serum urate by pushing it into the urine — effective enough to reach a stringent 5 mg/dL target in 65% of allopurinol failures in the only head-to-head randomised trial, where benzbromarone reached it in 92% — with a pre-1962 label that carries no clinical trial data, warns it may not work below a glomerular filtration rate of 30 mL/min, contraindicates it with aspirin and with uric acid stones, and still lists the wartime purpose it was invented for.',
    laymanHowItWorks:
      'Your kidney filters uric acid out of the blood and then, in the very next stretch of tubing, takes almost all of it back. Probenecid blocks the transporter that does the taking back, so more uric acid leaves in the urine and the blood level drops. The same transporters also pump antibiotics like penicillin out into the urine, so blocking them makes an antibiotic dose last two to four times longer — the reason the drug was invented in the first place. Both effects are the same molecule doing the same thing at the same place in the kidney.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 55,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.6550 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 9 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'One of the oldest drugs still in routine use, off patent for over half a century — and, at 65.5 United States cents a tablet, twelve times the acquisition cost of allopurinol and more than twice that of generic febuxostat. Only nine products are listed in the survey. This is the price behaviour of a generic with almost no manufacturers left, not the price behaviour of an old drug.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Probenecid’s place is narrow and specific: an under-excreter of urate with adequate kidney function, no history of urate stones, no aspirin, and a reason not to be on a xanthine oxidase inhibitor. Outside that description almost every alternative is cheaper, better evidenced, or both.',
      conventionalRx: [
        {
          name: 'Allopurinol (Zyloprim)',
          class: 'Purine-analogue xanthine oxidase inhibitor',
          howItCompares:
            'Reduces the amount of urate made rather than increasing the amount excreted, so it lowers urinary urate as well as serum urate — the opposite direction from probenecid, and the reason it is the choice for anyone who forms urate stones. It works at kidney function levels where probenecid does not, and it costs a twelfth as much.',
          typicalCost:
            'US$0.0546 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 87 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: a twelfth of the price; works in renal impairment; no stone risk. Cons: the HLA-B*58:01 severe skin reaction; the thiopurine interaction; needs titration.',
        },
        {
          name: 'Febuxostat (Uloric)',
          class: 'Non-purine xanthine oxidase inhibitor',
          howItCompares:
            'The other route when allopurinol fails, and less than half the price of probenecid at acquisition cost. It requires no dose adjustment in mild to moderate renal impairment, where probenecid loses effect — but it carries a boxed warning for cardiovascular death that probenecid does not.',
          typicalCost:
            'US$0.2810 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 29 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: works in renal impairment; less than half the price; strong urate data. Cons: boxed warning for cardiovascular death; label restricts it to allopurinol failures.',
        },
        {
          name: 'Benzbromarone',
          class: 'Uricosuric — a more potent URAT1 inhibitor',
          howItCompares:
            'In the one randomised head-to-head trial in allopurinol failures, benzbromarone 200 mg reached a serum urate at or below 5.0 mg/dL in 22 of 24 patients (92%) against 20 of 31 (65%) on probenecid 2 g (p=0.03), with a 64% against 50% fall from baseline (p<0.001) and better tolerability. It is not marketed in the United States, having been withdrawn in several countries over rare severe hepatotoxicity.',
          typicalCost: 'Not available in the United States; not listed in the CMS NADAC survey',
          prosAndCons:
            'Pros: the most effective uricosuric tested against probenecid, and effective at lower kidney function. Cons: withdrawn in multiple markets for hepatotoxicity, which is why probenecid remains the uricosuric an American prescriber can actually reach for.',
        },
      ],
      naturalFoods: [
        {
          name: 'Water — the one dietary measure the label itself instructs',
          activeCompound: 'None; the mechanism is dilution of urinary urate',
          biologicalMechanism:
            'Probenecid works by increasing urinary urate, and uric acid crystallises out of acid, concentrated urine. Raising urine volume lowers the concentration and is the primary defence against the stone risk the drug creates.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'Not stated here as advice. The label’s own Precautions section states that haematuria, renal colic, costovertebral pain and formation of uric acid stones associated with probenecid in gouty patients may be prevented by alkalinisation of the urine and a liberal fluid intake.',
          monthlyCost: '',
        },
        {
          name: 'Cherries and cherry extract',
          activeCompound: 'Anthocyanins; the active component is not established',
          biologicalMechanism:
            'A proposed weak uricosuric effect combined with suppression of the interleukin-1 beta response to crystals. Neither has been demonstrated in humans at dietary intake.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: a case-crossover study in 633 people with gout associated a two-day cherry intake with a 35% lower risk of an attack (OR 0.65, 95% CI 0.50 to 0.85). This is observational and cannot exclude that people eat cherries when they sense an attack starting.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Do not take aspirin with it',
          action:
            'Ask before taking anything containing aspirin or salicylate, including combination cold remedies.',
          patientImpact:
            'The label states that in patients on probenecid the use of salicylates in either small or large doses is contraindicated, because salicylate antagonises the uricosuric action — the "paradoxical effect" of the biphasic action of salicylates in the renal tubule. It names paracetamol as the preferred mild analgesic instead.',
          clinicalPrecaution:
            'This is a genuine conflict where low-dose aspirin is being taken for cardiovascular reasons, and it is a conversation to have rather than a decision to make alone.',
        },
        {
          name: 'Drink and alkalinise, especially at the start',
          action: 'Follow the fluid and urine-alkalinisation instructions given with the drug.',
          patientImpact:
            'The label directs a liberal fluid intake plus sodium bicarbonate 3 to 7.5 g daily or potassium citrate 7.5 g daily to keep the urine alkaline, until serum urate is normal and tophaceous deposits have gone — because the drug works by putting more urate into the urine, and uric acid crystallises out of acid urine.',
          clinicalPrecaution:
            'The label adds that when alkali is given, the acid-base balance of the patient should be watched. This is not a self-managed regimen.',
        },
        {
          name: 'Name every other drug, especially methotrexate',
          action:
            'Give the complete medication list before starting, and again if anything changes.',
          patientImpact:
            'Probenecid blocks the transporters that clear a long list of drugs. The label singles out methotrexate — plasma concentrations rise and the methotrexate dose should be reduced with serum level monitoring — and notes prolonged action of indometacin, paracetamol, naproxen, ketoprofen, meclofenamate, lorazepam, rifampicin, sulfonamides and sulfonylureas.',
          clinicalPrecaution:
            'The sulopenem–probenecid combination label goes further, contraindicating concomitant ketorolac outright and advising against ketoprofen — the same mechanism, stated in modern regulatory language.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CCCN(CCC)S(=O)(=O)C1=CC=C(C=C1)C(=O)O',
      chemicalFormula: 'C13H19NO4S',
      molecularWeight: '285.36 g/mol',
      targetReceptorAffinity:
        '4-(dipropylsulfamoyl)benzoic acid — a benzoic acid with a dipropylsulfonamide. The free carboxylate is what makes it a substrate mimic for the organic anion transporters: it competes with urate at URAT1 on the brush border and with penicillins and other anions at OAT1 and OAT3 on the basolateral membrane. The label reports that inhibition of tubular secretion raises penicillin plasma levels two- to four-fold for various penicillins, and lists amino hippuric acid, aminosalicylic acid, indometacin, 17-ketosteroids, pantothenic acid, phenolsulfonphthalein, sulfonamides and sulfonylureas among the other transported compounds it blocks.',
      structureSource: {
        label:
          'PubChem CID 4911 (probenecid) — canonical SMILES, molecular formula and weight, as carried on the enriched record; transport pharmacology from the probenecid United States prescribing information, Clinical Pharmacology',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4911',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'prob-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the sulfonamide and the free acid, and screen for the des-propyl impurity',
          description:
            'The molecule is a para-substituted benzoic acid carrying a dipropylsulfonamide. Incomplete dialkylation leaves a mono-propyl analogue that is chromatographically close and pharmacologically weaker, so the release assay has to resolve it rather than integrate it into the main peak.',
          reagentsAndBuffer:
            'Probenecid reference standard, reversed-phase HPLC with photodiode array detection under acidic mobile phase, 1H NMR to confirm the propyl integration ratio, potentiometric titration of the carboxylic acid, Karl Fischer titration',
        },
        {
          id: 'prob-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Sulfonylate, dialkylate, and unmask the acid',
          description:
            'The route runs from a para-substituted benzenesulfonyl chloride: condensation with dipropylamine gives the sulfonamide, and the ring substituent is carried through to the carboxylic acid by oxidation or hydrolysis of an ester. It is short, cheap and unremarkable chemistry, which makes the drug’s current price a market fact rather than a manufacturing one.',
          dependsOnStepId: 'prob-w1',
          reagentsAndBuffer:
            'para-substituted benzenesulfonyl chloride, di-n-propylamine with an acid scavenger, aqueous base for ester hydrolysis or an oxidant for the methyl-to-carboxyl conversion, controlled acidification to precipitate the free acid',
        },
        {
          id: 'prob-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Recrystallise from the free acid and specify the amine residue',
          description:
            'Residual di-n-propylamine is both an odorant and a specified impurity, and the carboxylic acid’s low aqueous solubility means recrystallisation is from alcohol or an alcohol–water pair with pH-controlled precipitation.',
          dependsOnStepId: 'prob-w2',
          reagentsAndBuffer:
            'Ethanol or ethanol–water recrystallisation with seeding, headspace GC-MS for residual di-n-propylamine and solvents, HPLC related-substances profile, powder X-ray diffraction for form consistency',
        },
        {
          id: 'prob-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Separate URAT1 inhibition from OAT1/OAT3 inhibition, because the label depends on both',
          description:
            'The gout indication is URAT1 on the apical membrane; the antibiotic indication and almost every drug interaction on the label are OAT1 and OAT3 on the basolateral membrane. A single-transporter assay tells you about one indication and nothing about the other, and the interaction warnings all live in the transporter that is not being measured.',
          dependsOnStepId: 'prob-w3',
          reagentsAndBuffer:
            'HEK293 cells stably expressing human URAT1 (SLC22A12), OAT1 (SLC22A6) or OAT3 (SLC22A8), radiolabelled or stable-isotope urate for URAT1 and para-aminohippurate or estrone sulfate for OAT1/OAT3, empty-vector control cells, IC50 determination in each line separately',
        },
        {
          id: 'prob-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Measure urinary urate alongside serum urate, and count stones',
          description:
            'A uricosuric drug that reports only serum urate is reporting half of what it does. The other half — a rise in urinary urate concentration in an acidic urine — is the mechanism of the stone risk the label warns about, and it is measurable in the same 24-hour collection.',
          dependsOnStepId: 'prob-w4',
          reagentsAndBuffer:
            'Paired serum and 24-hour urine urate by uricase-peroxidase assay, urine pH and volume, fractional excretion of uric acid calculated with paired creatinine, imaging or symptomatic ascertainment of stone events as a prespecified safety endpoint',
        },
      ],
    },
    keyAudits: [
      {
        id: 'prob-a1',
        category: 'inferred',
        title: 'A label with no clinical trial section at all',
        laymanSummary:
          'The prescribing information for probenecid contains no efficacy data — no trial, no number, no endpoint. It predates the law that requires them.',
        technicalDetails:
          'The current United States label runs Indications, Contraindications, Warnings, Precautions, Adverse Reactions, Overdosage, Dosage and Administration — and has no Clinical Studies section. Probenecid was introduced before the 1962 Kefauver-Harris amendments made proof of effectiveness a condition of approval, and it was never subjected to a modern registration programme. Its Clinical Pharmacology section describes mechanism ("inhibits the tubular reabsorption of urate, thus increasing the urinary excretion of uric acid and decreasing serum urate levels") and a pharmacokinetic effect on penicillin ("a 2-fold to 4-fold elevation has been demonstrated for various penicillins"), and stops there. Everything a reader might want to know about how often it reaches a urate target, or what happens to flares and tophi, is absent from the document that authorises its use.',
        evidenceSource:
          'Probenecid tablets United States prescribing information, complete document (openFDA label, effective 18 November 2025) — sections present and absent',
        inferredClaim:
          'That probenecid’s effectiveness in gout has been established to a modern standard, which its own label neither claims nor documents',
        auditFlag: 'caution',
      },
      {
        id: 'prob-a2',
        category: 'measured',
        title: 'The only head-to-head trial: 65% against benzbromarone’s 92%',
        laymanSummary:
          'In the one randomised trial comparing uricosurics after allopurinol failed, probenecid got about two-thirds of patients to a strict target and benzbromarone got over nine in ten.',
        technicalDetails:
          'A two-stage open-label randomised trial gave 96 gout patients with normal renal function allopurinol 300 mg for two months. Only 20 of 82 evaluable patients (24%) reached the stringent target of serum urate at or below 0.30 mmol/L (5.0 mg/dL), and 9 (11%) stopped for adverse reactions. The 62 failures were randomised to benzbromarone 200 mg/day or probenecid 2 g/day for two further months. Benzbromarone succeeded in 22 of 24 evaluable patients (92%) and probenecid in 20 of 31 (65%), p=0.03; the mean fall from baseline was 64% against 50% (p<0.001). Benzbromarone was also better tolerated. It is not available in the United States, so the drug that won this comparison is not the drug an American prescriber can write.',
        evidenceSource:
          'Reinders MK, van Roon EN, Jansen TLTA, et al. Efficacy and tolerability of urate-lowering drugs in gout: a randomised controlled trial of benzbromarone versus probenecid after failure of allopurinol. Ann Rheum Dis 2009;68:51-56',
        doi: '10.1136/ard.2007.083071',
        measuredMetric:
          'Proportion reaching serum urate at or below 5.0 mg/dL after allopurinol failure, probenecid against benzbromarone',
        auditFlag: 'verified',
      },
      {
        id: 'prob-a3',
        category: 'failed',
        title: 'It stops working in exactly the patients most likely to need it',
        laymanSummary:
          'Gout and kidney disease travel together. Probenecid’s own label says it may not work once kidney filtration falls to 30 mL/min or below.',
        technicalDetails:
          'The Precautions section states: "Probenecid may not be effective in chronic renal insufficiency particularly when the glomerular filtration rate is 30 mL/minute or less", and adds that it is not recommended in conjunction with a penicillin in the presence of known renal impairment. The mechanism explains it: a drug that works by blocking reabsorption of a filtered solute needs filtration to block. Chronic kidney disease is one of the strongest risk factors for gout, so the population in whom urate lowering is hardest is the population in which this mechanism fails first. The randomised trial above enrolled only patients with normal renal function, so even the 65% figure is from the easy end of the spectrum.',
        evidenceSource:
          'Probenecid tablets United States prescribing information, Precautions — General (glomerular filtration rate 30 mL/minute or less); Reinders MK et al. Ann Rheum Dis 2009;68:51-56 (enrolment restricted to normal renal function)',
        doi: '10.1136/ard.2007.083071',
        measuredMetric:
          'Stated loss of effect at glomerular filtration rate at or below 30 mL/min, from the label',
        auditFlag: 'caution',
      },
      {
        id: 'prob-a4',
        category: 'conclusion_shift',
        title: 'The wartime purpose came back as a 2024 FDA approval',
        laymanSummary:
          'Probenecid was invented in the 1940s to make scarce penicillin last longer by stopping the kidney throwing it away. In October 2024 the FDA approved a tablet pairing it with a new antibiotic for exactly that reason.',
        technicalDetails:
          'Orlynvah, a fixed combination of sulopenem etzadroxil 500 mg and probenecid 500 mg, was approved on 25 October 2024 under NDA 213972 for uncomplicated urinary tract infection in adult women with limited or no alternative oral options. Its Mechanism of Action section states plainly that "probenecid inhibits OAT3-mediated renal clearance of sulopenem, resulting in increased plasma concentrations of sulopenem" — the same sentence that could have been written in 1946 with penicillin in place of sulopenem. The combination label also imports probenecid’s hazards into a modern format: it is contraindicated in patients with known uric acid kidney stones, contraindicated with ketorolac, not recommended with ketoprofen, and carries warnings for exacerbation of gout and risk of uric acid stone development. The oldest indication in this drug’s file turned out to be the one with a future.',
        evidenceSource:
          'ORLYNVAH (sulopenem etzadroxil and probenecid) United States prescribing information, sections 1.1, 4, 5.3, 5.4, 7.1 and 12.1; FDA Drugs@FDA application NDA 213972, original approval 25 October 2024',
        measuredMetric:
          'Regulatory approval of a probenecid combination for antibiotic exposure enhancement, and its stated mechanism',
        auditFlag: 'verified',
      },
      {
        id: 'prob-a5',
        category: 'measured',
        title: 'A large observational comparison favours it, and cannot prove why',
        laymanSummary:
          'In nearly 39,000 older Americans with gout, those started on probenecid had modestly fewer heart attacks and strokes than those started on allopurinol. It is a database study, not a trial.',
        technicalDetails:
          'A Medicare cohort study identified gout patients aged 65 and over initiating probenecid or allopurinol between 2008 and 2013 and propensity-score matched 9,722 probenecid initiators to 29,166 allopurinol initiators, mean age 76. The primary composite of hospitalisation for myocardial infarction or stroke occurred at 2.36 against 2.83 per 100 person-years — hazard ratio 0.80 (95% CI 0.69 to 0.93) — with secondary reductions in myocardial infarction, stroke, heart failure exacerbation and mortality, consistent across subgroups without baseline cardiovascular or kidney disease. Propensity matching cannot balance what is not recorded in claims, and the choice between these two drugs in 2008 to 2013 was itself made on clinical grounds that predict outcomes: allopurinol was first-line, so probenecid initiators are a selected group. It is a real signal and it is not evidence of causation.',
        evidenceSource:
          'Kim SC, Neogi T, Kang EH, et al. Cardiovascular Risks of Probenecid Versus Allopurinol in Older Patients With Gout. J Am Coll Cardiol 2018;71:994-1004',
        doi: '10.1016/j.jacc.2017.12.052',
        measuredMetric:
          'Hospitalisation for myocardial infarction or stroke per 100 person-years in a propensity-matched Medicare cohort',
        auditFlag: 'caution',
      },
      {
        id: 'prob-a6',
        category: 'failed',
        title: 'The drug creates the stone risk it then warns about',
        laymanSummary:
          'Because it works by putting more uric acid into the urine, it can cause the very stones that are one of gout’s complications. The label contraindicates it in anyone who has had one.',
        technicalDetails:
          'Probenecid is "not recommended in persons with known blood dyscrasias or uric acid kidney stones" — a contraindication, not a caution. The Precautions section lists haematuria, renal colic, costovertebral pain and formation of uric acid stones as consequences of use in gouty patients, and states these may be prevented by alkalinisation of the urine and liberal fluid intake, directing sodium bicarbonate 3 to 7.5 g or potassium citrate 7.5 g daily to maintain an alkaline urine until serum urate is normal and tophaceous deposits have resolved. This is the structural cost of the uricosuric mechanism, and it is the clearest reason a xanthine oxidase inhibitor — which lowers urinary urate as well as serum urate — is the default. The Orlynvah label repeats the contraindication for a five-day antibiotic course.',
        evidenceSource:
          'Probenecid tablets United States prescribing information, Contraindications, Precautions — General and Dosage and Administration; ORLYNVAH prescribing information, sections 4 and 5.3',
        measuredMetric:
          'Labelled contraindication in uric acid stone formers and the alkalinisation regimen prescribed to mitigate it',
        auditFlag: 'caution',
      },
      {
        id: 'prob-a7',
        category: 'measured',
        title: 'Aspirin cancels it, and the label calls that contraindicated',
        laymanSummary:
          'Salicylates block the uric-acid-lowering effect of probenecid at any dose, large or small. The label uses the word contraindicated.',
        technicalDetails:
          'The Warnings section states: "In patients on probenecid the use of salicylates in either small or large doses is contraindicated because it antagonizes the uricosuric action of probenecid. The biphasic action of salicylates in the renal tubules accounts for the so-called ‘paradoxical effect’ of uricosuric agents." It names paracetamol as the preferred mild analgesic instead. The interaction is at the same tubular transporters, which is why it is not dose-dependent in the usual direction. Pyrazinamide is separately listed as antagonising the uricosuric action. In an older population where low-dose aspirin is common, this is a real and frequently overlooked conflict between two chronic prescriptions.',
        evidenceSource:
          'Probenecid tablets United States prescribing information, Warnings (salicylates) and Drug Interactions (pyrazinamide)',
        measuredMetric:
          'Labelled contraindication of salicylates at any dose during probenecid therapy',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A benzoic acid that the kidney mistakes for cargo',
        laymanDesc:
          'Probenecid is a small acid. The kidney’s transporters handle acids, and this one competes for a seat.',
        molecularDetail:
          '4-(dipropylsulfamoyl)benzoic acid, C13H19NO4S. The free carboxylate makes it a competitive substrate analogue for the organic anion transporter family, which is why one molecule affects urate, penicillins, methotrexate and a long list of other anions.',
        iconName: 'Atom',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It blocks the urate exchanger on the brush border',
        laymanDesc:
          'Almost all the uric acid your kidney filters out is pulled straight back in. Probenecid blocks the pump that does the pulling.',
        molecularDetail:
          'Inhibition of URAT1 (SLC22A12) on the apical brush-border membrane of the proximal tubule cell prevents urate–anion exchange and therefore reabsorption. The label describes this as inhibiting tubular reabsorption of urate, increasing urinary excretion and decreasing serum urate.',
        iconName: 'Ban',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'And blocks the secretion pumps on the other side of the cell',
        laymanDesc:
          'The same drug blocks the pumps that push antibiotics and other drugs out into the urine. That is why penicillin levels rise two to four times.',
        molecularDetail:
          'Inhibition of OAT1 and OAT3 (SLC22A6, SLC22A8) on the basolateral membrane blocks tubular secretion of organic anions. The label documents a two- to four-fold elevation of plasma levels for various penicillins and lists amino hippuric acid, aminosalicylic acid, indometacin, 17-ketosteroids, pantothenic acid, phenolsulfonphthalein, sulfonamides and sulfonylureas as other affected compounds.',
        iconName: 'ArrowLeftRight',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'Serum urate falls; urinary urate rises',
        laymanDesc:
          'The blood level goes down because the urine level goes up. That trade is the whole drug, and it is also its main hazard.',
        molecularDetail:
          'The label states that effective uricosuria reduces the miscible urate pool, retards urate deposition and promotes resorption of urate deposits. The same rise in urinary urate concentration, in an acid urine, is what produces haematuria, renal colic and uric acid stones, which is why alkalinisation and fluid intake are written into the dosage section.',
        iconName: 'ArrowUpDown',
        visualStage: 'therapeutic_result',
      },
      {
        step: 5,
        title: 'Filtration sets the ceiling',
        laymanDesc:
          'You cannot stop reabsorption of something that was never filtered. As kidney function falls, the drug stops working.',
        molecularDetail:
          'The label states probenecid may not be effective in chronic renal insufficiency, particularly at a glomerular filtration rate of 30 mL/min or less, and that it is not recommended alongside a penicillin in known renal impairment. The randomised trial that produced its efficacy figure enrolled only patients with normal renal function.',
        iconName: 'TrendingDown',
        visualStage: 'cellular_entry',
      },
      {
        step: 6,
        title: 'The interaction list is the mechanism, restated',
        laymanDesc:
          'Every drug interaction on the label comes from the same blockade. Nothing here is a side effect in the usual sense — it is the drug working on the wrong molecule.',
        molecularDetail:
          'Methotrexate concentrations rise and its dose must be reduced. Salicylates antagonise the uricosuric effect at any dose and are contraindicated; pyrazinamide does the same. Indometacin, paracetamol, naproxen, ketoprofen, meclofenamate, lorazepam, rifampicin, sulfonamides and sulfonylureas all have prolonged elimination. The modern Orlynvah label contraindicates ketorolac outright on the same basis.',
        iconName: 'Network',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'Benzbromarone versus probenecid after allopurinol failure (Ann Rheum Dis 2009;68:51-56)',
        phase: 'Prospective, multicentre, open-label, two-stage randomised controlled trial',
        sampleSize: 62,
        primaryEndpoint:
          'Proportion attaining serum urate at or below 0.30 mmol/L (5.0 mg/dL) after two months, in gout patients with normal renal function who failed or could not tolerate allopurinol 300 mg',
        endpointMet: false,
        statisticalPValue:
          'Benzbromarone 22/24 (92%) against probenecid 20/31 (65%), p=0.03; mean fall from baseline 64% against 50%, p<0.001',
        unreportedAdverseSignals:
          'Probenecid lost the comparison. Stage 1 also found allopurinol 300 mg reached this stringent target in only 20 of 82 patients (24%), with 11% stopping for adverse reactions. Enrolment was restricted to normal renal function, so neither uricosuric was tested where the label says probenecid may fail.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'Probenecid versus allopurinol cardiovascular safety, Medicare 2008-2013 (J Am Coll Cardiol 2018;71:994-1004)',
        phase: 'Propensity-score-matched observational cohort study',
        sampleSize: 38888,
        primaryEndpoint:
          'Hospitalisation for myocardial infarction or stroke in gout patients aged 65 and over initiating probenecid or allopurinol',
        endpointMet: true,
        statisticalPValue:
          '2.36 against 2.83 events per 100 person-years; hazard ratio 0.80 (95% CI 0.69 to 0.93)',
        unreportedAdverseSignals:
          'This is not a randomised trial. Treatment choice between a first-line and a second-line urate-lowering drug is itself prognostic, and claims data cannot capture the clinical reasons that drove it. Secondary reductions in myocardial infarction, stroke, heart failure and mortality were all in the same direction, which is reassuring and also what confounding by indication looks like.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'ORLYNVAH uncomplicated urinary tract infection programme (SURE-1, NCT03354598, n=1,671 against ciprofloxacin; REASSURE, NCT05584657, n=2,229 against amoxicillin/clavulanate)',
        phase: 'Phase 3, randomised, double-blind, double-dummy, active-controlled',
        sampleSize: 3861,
        primaryEndpoint:
          'Overall success (clinical and microbiological) in adult women with uncomplicated urinary tract infection, sulopenem etzadroxil with probenecid against ciprofloxacin or amoxicillin/clavulanate',
        endpointMet: true,
        statisticalPValue:
          'Approved on this programme on 25 October 2024 under NDA 213972; the label reports 1,932 patients treated with the combination against 1,929 on comparator, with serious adverse reactions in 0.3% against 0.2% and 0.5%',
        unreportedAdverseSignals:
          'The label restricts the indication to women with limited or no alternative oral options, and states it is not indicated for complicated urinary tract or intra-abdominal infection or as step-down after intravenous therapy. Probenecid’s own hazards travel with it: contraindicated in known uric acid kidney stones, contraindicated with ketorolac, and carrying warnings for gout exacerbation and uric acid stone development.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Serum urate at or below 5.0 mg/dL reached in 20 of 31 patients (65%) on probenecid 2 g/day against 22 of 24 (92%) on benzbromarone, after allopurinol failure',
        'Mean serum urate fall from baseline of 50% on probenecid against 64% on benzbromarone (p<0.001)',
        'A two- to four-fold elevation of plasma penicillin levels, stated in the label’s Clinical Pharmacology',
        'Hospitalisation for myocardial infarction or stroke at 2.36 against 2.83 per 100 person-years versus allopurinol in 38,888 matched Medicare patients (HR 0.80)',
      ],
      unsupportedInferences: [
        'That probenecid reduces gout flares, tophi or joint damage — no trial on the label and none in the modern literature measures these endpoints for this drug',
        'That the Medicare cardiovascular advantage over allopurinol is causal, when the two drugs are prescribed to systematically different patients',
        'That its uricosuric effect is reliable across the gout population, when the only randomised efficacy data come from patients with normal renal function and the label warns of failure below 30 mL/min',
        'That an old drug with a short label is therefore a well-characterised one',
      ],
      whatFailedInitially: [
        'Lost its only head-to-head randomised comparison, to benzbromarone, 65% against 92%',
        'Is stated by its own label to be possibly ineffective at a glomerular filtration rate of 30 mL/min or less — the population most affected by gout',
        'Creates uric acid stones by its mechanism and is contraindicated in anyone who has had one',
        'Is antagonised at any dose by salicylates, which the label calls contraindicated, and by pyrazinamide',
      ],
      realWorldOutcome: [
        'Introduced in the early 1950s and never subjected to a modern efficacy trial programme; its label has no Clinical Studies section',
        'At US$0.6550 per tablet it is twelve times the acquisition cost of allopurinol, with only nine listed products in the survey',
        'Its original wartime purpose returned as an FDA approval on 25 October 2024, in the sulopenem–probenecid combination Orlynvah',
        'Remains the only uricosuric routinely available in the United States, because the drug that beat it in trial was withdrawn elsewhere for hepatotoxicity',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, 500 mg, usually twice daily; also supplied in a fixed combination with colchicine 0.5 mg, and as a component of the sulopenem combination Orlynvah',
      description:
        'Well absorbed orally and highly protein bound. In the Orlynvah combination the label reports a mean probenecid elimination half-life of about 2.9 hours fasted and 3.8 hours fed. Therapy should not be started until an acute gouty attack has subsided, and the label directs alkalinisation of the urine with liberal fluid intake during the period of high urinary urate excretion.',
      safetyProfile:
        'Contraindicated in hypersensitivity to probenecid, in children under two, and not recommended in known blood dyscrasias or uric acid kidney stones. Salicylates in any dose are stated to be contraindicated because they antagonise the uricosuric effect. Exacerbation of gout may follow initiation. Probenecid raises methotrexate concentrations and the methotrexate dose must be reduced with level monitoring. Haematuria, renal colic, costovertebral pain and uric acid stone formation are labelled consequences of the mechanism, mitigated by alkalinisation and fluid. Rare severe allergic reactions and anaphylaxis have been reported, typically within hours of readministration after prior use, and require cessation. May not be effective at a glomerular filtration rate of 30 mL/min or less. The combination product with colchicine is contraindicated in pregnancy because of the colchicine component.',
    },
    commonQuestions: [
      {
        q: 'How is this different from allopurinol?',
        a: 'They point in opposite directions. Allopurinol reduces how much uric acid your body makes, so both your blood level and your urine level fall. Probenecid stops your kidney from reclaiming the uric acid it has already filtered out, so your blood level falls because your urine level rises. That difference decides who each drug suits. If you have ever passed a uric acid stone, probenecid is contraindicated and allopurinol is the choice. If your kidney function is poor, probenecid’s own label says it may not work at all below a filtration rate of 30 mL/min, while allopurinol still does. And probenecid costs about twelve times as much per tablet at wholesale.',
        auditNote:
          'Two drugs described as "urate-lowering" can have opposite effects on the urine, which is the compartment where stones form. The class label hides the difference that matters most.',
      },
      {
        q: 'Why does the label still talk about penicillin?',
        a: 'Because that is what the drug was invented for. In the 1940s penicillin was scarce and the kidney cleared it within hours; probenecid was developed to block that clearance and make each dose go further. The indication never came off the label — it still reads "as an adjuvant to therapy with penicillin or with ampicillin, methicillin, oxacillin, cloxacillin, or nafcillin" — and the Clinical Pharmacology section documents a two- to four-fold rise in penicillin plasma levels. In October 2024 the FDA approved Orlynvah, a tablet combining probenecid with the new antibiotic sulopenem for urinary tract infection, on exactly this mechanism. The oldest thing on this label turned out to be the newest.',
      },
      {
        q: 'Can I take my low-dose aspirin with it?',
        a: 'The label says no, and it uses the word contraindicated for salicylates in either small or large doses, because they antagonise the uric-acid-lowering effect. It recommends paracetamol instead when a mild painkiller is needed. That said, low-dose aspirin is often being taken for a reason that is not negotiable, and the answer is a conversation about which of the two prescriptions is doing more for you — not a decision to drop either one unilaterally. Pyrazinamide, used in tuberculosis treatment, blocks the same effect.',
      },
      {
        q: 'Why do I need to drink so much water and take something to alkalinise my urine?',
        a: 'Because the drug works by loading your urine with uric acid, and uric acid crystallises out of acidic, concentrated urine. The label lists haematuria, renal colic, costovertebral pain and stone formation as things that happen with this drug in gout patients, and states they may be prevented by alkalinisation and a liberal fluid intake. The dosage section specifies sodium bicarbonate 3 to 7.5 g daily or potassium citrate 7.5 g daily to keep the urine alkaline until the serum urate is normal and any tophi have resolved. It also says the acid-base balance should be watched while alkali is being given, which is why this is a supervised regimen and not a supplement you add yourself.',
      },
      {
        q: 'Is there good evidence this drug works?',
        a: 'Less than you would expect for a drug this old. Its label has no clinical studies section at all — it predates the 1962 law that requires proof of effectiveness — so the official document describes only the mechanism and the pharmacokinetics. The best evidence is a single randomised trial in patients who had failed allopurinol, in which probenecid 2 g/day got 20 of 31 patients (65%) to a strict target of 5.0 mg/dL, against 22 of 24 (92%) for benzbromarone. No trial has measured what probenecid does to gout attacks, tophi or joint damage. That is not the same as evidence it does not work; it is an absence of the measurement.',
        auditNote:
          'A drug can be genuinely useful and simultaneously under-evidenced. The honest description of probenecid is that its mechanism is certain, its urate effect is measured, and everything downstream of the urate is assumed.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Reinders MK, van Roon EN, Jansen TLTA, et al. Efficacy and tolerability of urate-lowering drugs in gout: a randomised controlled trial of benzbromarone versus probenecid after failure of allopurinol. Ann Rheum Dis 2009;68:51-56',
        identifier: '10.1136/ard.2007.083071',
        kind: 'doi',
      },
      {
        label:
          'Kim SC, Neogi T, Kang EH, et al. Cardiovascular Risks of Probenecid Versus Allopurinol in Older Patients With Gout. J Am Coll Cardiol 2018;71:994-1004',
        identifier: '10.1016/j.jacc.2017.12.052',
        kind: 'doi',
      },
      {
        label:
          'Probenecid tablets United States prescribing information — Indications and Usage, Contraindications, Warnings (methotrexate, salicylates, anaphylaxis), Precautions (uric acid stones, glomerular filtration rate 30 mL/min), Clinical Pharmacology, Dosage and Administration, via the openFDA drug label endpoint (effective 18 November 2025)',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name.exact:%22PROBENECID%22',
        kind: 'regulatory',
      },
      {
        label:
          'ORLYNVAH (sulopenem etzadroxil and probenecid) United States prescribing information — Indications 1.1, Contraindications 4, Warnings 5.3 and 5.4, Drug Interactions 7.1, Mechanism of Action 12.1, Pharmacokinetics 12.3, Adverse Reactions 6.1',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22ORLYNVAH%22',
        kind: 'regulatory',
      },
      {
        label:
          'FDA Drugs@FDA application NDA 213972 (ORLYNVAH, Iterum Therapeutics) — original approval 25 October 2024',
        identifier:
          'https://api.fda.gov/drug/drugsfda.json?search=openfda.brand_name:%22ORLYNVAH%22',
        kind: 'regulatory',
      },
      {
        label:
          'SURE-1 — oral sulopenem etzadroxil/probenecid versus ciprofloxacin for uncomplicated urinary tract infection in adult women (n=1,671)',
        identifier: 'NCT03354598',
        kind: 'nct',
      },
      {
        label:
          'REASSURE — oral sulopenem etzadroxil/probenecid versus amoxicillin/clavulanate for uncomplicated urinary tract infection in adult women (n=2,229)',
        identifier: 'NCT05584657',
        kind: 'nct',
      },
      {
        label:
          'Probenecid and colchicine tablets United States prescribing information — Indications, Contraindications, Warnings, Precautions and Dosage and Administration (alkalinisation regimen)',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22PROBENECID+AND+COLCHICINE%22',
        kind: 'regulatory',
      },
      {
        label:
          'Zhang Y, Neogi T, Chen C, et al. Cherry consumption and decreased risk of recurrent gout attacks. Arthritis Rheum 2012;64:4004-4011',
        identifier: '10.1002/art.34677',
        kind: 'doi',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — probenecid, 9 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 4911 — probenecid structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4911',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 4. Sildenafil — a failed angina drug that became the most famous pill in the world, and whose
  //    every attempt to go back to the cardiovascular system has failed or killed someone.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'sildenafil',
    name: 'Sildenafil',
    tradeName: 'Viagra / Revatio / Vybrique / Liqrev',
    sponsor:
      'Viatris (current holder of several generic applications); discovered and developed at Pfizer’s Sandwich laboratories as UK-92,480, approved as VIAGRA under NDA 020895 and as REVATIO for pulmonary arterial hypertension under NDA 021845',
    targetGene: 'PDE5A',
    targetProtein:
      'Phosphodiesterase type 5, the cyclic-GMP-degrading enzyme of vascular and corpus cavernosum smooth muscle. Selectivity is 10-fold over PDE6 in the retina, more than 80-fold over PDE1, more than 700-fold over PDE2, 3, 4, 7, 8, 9, 10 and 11, and about 4,000-fold over the cardiac PDE3',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1998,
    indication:
      'Treatment of erectile dysfunction (VIAGRA). Under the REVATIO brand, treatment of pulmonary arterial hypertension (WHO Group I) in adults to improve exercise ability and delay clinical worsening, and in children aged 1 to 17 to improve exercise ability or, where the child is too young to be tested, the pulmonary haemodynamics thought to underlie it',
    patientFriendlyIndication:
      'Erectile dysfunction; and, as Revatio, pulmonary arterial hypertension',
    anatomicalSite:
      'Phosphodiesterase-5 in corpus cavernosum smooth muscle; the same enzyme in pulmonary vascular smooth muscle is the Revatio indication, and PDE6 in the retina is the source of the colour-vision effect',
    conditionContext: {
      conditionExplainer:
        'An erection is a hydraulic event controlled by a chemical signal. Nerve endings and endothelium release nitric oxide, which switches on guanylate cyclase, which makes cyclic GMP, which relaxes the smooth muscle of the corpus cavernosum so blood can flow in. An enzyme called PDE5 destroys the cyclic GMP and ends the event. Sildenafil blocks that enzyme.',
      whyItMatters:
        'This drug is the canonical example of a failure becoming a franchise. It was developed as an antianginal, did not work well enough for angina, and was rescued by an adverse-effect report from a Phase 1 study. It is also a cautionary example in the other direction: every subsequent attempt to point the same mechanism back at the cardiovascular system — heart failure with preserved ejection fraction, growth-restricted fetuses, higher doses in children with pulmonary hypertension — has been null or harmful.',
      whoTakesThis:
        'Men with erectile dysfunction, and — as Revatio, at a different dose and schedule — adults and children with pulmonary arterial hypertension. Absolutely not anyone taking a nitrate in any form, or the guanylate cyclase stimulator riociguat.',
      clinicalGoals:
        'For erectile dysfunction: a higher proportion of attempts at intercourse that succeed, measured on a questionnaire and a diary. For pulmonary arterial hypertension: exercise ability and delayed clinical worsening. The endpoints are different measurements in different diseases, and neither transfers to the other.',
    },
    oneSentenceVerdict:
      'A PDE5 inhibitor developed for angina and repurposed after Phase 1 volunteers reported erections, which in its registration programme raised successful intercourse attempts from 22% on placebo to 69% on drug — and whose returns to cardiovascular medicine have failed repeatedly: no change in peak oxygen consumption in heart failure with preserved ejection fraction (216 patients, p=0.90), and a fetal growth restriction trial halted early when neonatal pulmonary hypertension hit 18.8% against 5.1% on placebo.',
    laymanHowItWorks:
      'When a man is aroused, nerves in the penis release nitric oxide, which sets off a chemical called cyclic GMP that relaxes the muscle in the blood vessels so blood flows in. An enzyme, PDE5, then breaks that chemical down and the erection ends. Sildenafil blocks the enzyme, so the signal lasts longer and the blood stays in. It does not create the signal — the label states plainly that at recommended doses it has no effect in the absence of sexual stimulation. The same enzyme sits in the lung arteries, which is why a different-dose version of the same molecule is licensed for pulmonary hypertension.',
    auditConfidence: 'High Confidence',
    confidenceScore: 76,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1220 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 117 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved on 27 March 1998 under NDA 020895 and generic in the United States since December 2017. With 117 listed generic products it is one of the most competitively supplied molecules in the survey, and pharmacies now acquire it for about twelve United States cents a tablet — a fraction of a percent of the branded price that made it one of the best-known drugs ever launched. The gap between that twelve cents and what a consumer pays through a direct-to-consumer telehealth service is a distribution margin, not a manufacturing cost.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Within the PDE5 class the molecules differ mainly in how long they last and how they interact with food and with PDE6. Outside the class, the more consequential comparison is with looking for the cause: erectile dysfunction is frequently the first symptom of endothelial disease, and the label itself directs that evaluation include a determination of potential underlying causes.',
      conventionalRx: [
        {
          name: 'Tadalafil (Cialis)',
          class: 'PDE5 inhibitor with a long half-life',
          howItCompares:
            'Lasts far longer than sildenafil, which changes the drug from an event to a background state and allows a daily low-dose regimen. It is also licensed for benign prostatic hyperplasia, which sildenafil is not. Its PDE6 selectivity is better, so the blue-tinged vision effect is rarer, but it inhibits PDE11 more, whose function is unknown.',
          typicalCost:
            'Widely available as a generic in the United States; priced per tablet in the same low range as sildenafil at pharmacy acquisition cost',
          prosAndCons:
            'Pros: duration measured in days rather than hours; a second licensed indication. Cons: the same nitrate contraindication, held for longer; back pain and myalgia are more common.',
        },
        {
          name: 'Vardenafil (Levitra, Staxyn)',
          class: 'PDE5 inhibitor, structurally closest to sildenafil',
          howItCompares:
            'Very similar in profile and duration to sildenafil, and the one PDE5 inhibitor with a labelled QT effect that puts it on the list to avoid with class IA or class III antiarrhythmics. At US$2.97 a tablet at acquisition cost it is more than twenty times the price of sildenafil, across only 16 listed products.',
          typicalCost:
            'US$2.97 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 16 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: an alternative if sildenafil is not tolerated. Cons: more than twenty times the price for no demonstrated advantage; a QT-interval caution the others lack.',
        },
        {
          name: 'Investigating the cause rather than the symptom',
          class: 'Diagnostic evaluation, not a drug',
          howItCompares:
            'Erectile dysfunction is a small-vessel endothelial event and often precedes coronary disease by years. The Viagra label instructs that "the evaluation of erectile dysfunction should include a determination of potential underlying causes and the identification of appropriate treatment following a complete medical assessment", and separately warns that the drug should not generally be used where sexual activity is inadvisable on cardiovascular grounds.',
          typicalCost:
            'The cost of a consultation and standard cardiovascular and endocrine testing',
          prosAndCons:
            'Pros: the symptom may be the presenting sign of diabetes, hypogonadism, or arterial disease, none of which a PDE5 inhibitor treats. Cons: takes longer than a prescription, and a direct-to-consumer service has no incentive to do it.',
        },
      ],
      naturalFoods: [
        {
          name: 'Beetroot and other dietary nitrate sources',
          activeCompound:
            'Inorganic nitrate, reduced to nitrite by oral bacteria and then to nitric oxide',
          biologicalMechanism:
            'Feeds the same nitric oxide–cyclic GMP pathway that sildenafil acts on, but from the supply side rather than by blocking degradation. This is exactly why it is not a neutral food in this context: the drug is contraindicated with nitric oxide donors precisely because their effects combine.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'Not stated here as advice. No randomised trial has tested dietary nitrate for erectile dysfunction. The mechanistic overlap is a reason for caution about combining supplements marketed as nitric oxide boosters with a PDE5 inhibitor, not a reason to use them as a substitute.',
          monthlyCost: '',
        },
        {
          name: 'Unregulated "herbal" erectile products',
          activeCompound:
            'Frequently undeclared sildenafil, tadalafil or a chemical analogue of one of them',
          biologicalMechanism:
            'The mechanism is the drug on this page, present without being declared. That matters because the nitrate contraindication is absolute, and a man taking a nitrate who buys an unlabelled supplement is taking the combination the label says can be life-threatening.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'Not stated here as advice. The relevant fact is a regulatory one: adulteration of sexual-enhancement supplements with PDE5 inhibitors and their analogues is among the most frequently reported categories in the FDA’s tainted-products database.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Never combine it with a nitrate',
          action:
            'Say if you take glyceryl trinitrate, isosorbide, nicorandil, amyl nitrite or any other nitrate, in any form and however occasionally.',
          patientImpact:
            'The label makes administration to patients using nitric oxide donors — organic nitrates or nitrites in any form, regularly or intermittently — an outright contraindication, because sildenafil potentiates their hypotensive effect. It adds that after a dose it is unknown when nitrates can be safely given.',
          clinicalPrecaution:
            'The same contraindication applies to the guanylate cyclase stimulator riociguat. This is the single most important fact on the label and it is the one most often lost when the drug is obtained outside a consultation.',
        },
        {
          name: 'An erection lasting more than four hours is an emergency',
          action: 'Seek emergency treatment, do not wait it out.',
          patientImpact:
            'Section 5.2 directs patients to seek emergency treatment if an erection lasts more than four hours, and to use the drug with caution if predisposed to priapism — in sickle cell anaemia, multiple myeloma, leukaemia, or with an anatomically deformed penis.',
          clinicalPrecaution:
            'Untreated priapism causes permanent tissue damage. The four-hour threshold is a labelled instruction, not a rule of thumb.',
        },
        {
          name: 'Sudden loss of vision or hearing means stop',
          action: 'Stop the drug and seek medical attention the same day.',
          patientImpact:
            'The label directs stopping and seeking care for sudden loss of vision in one or both eyes, which could indicate non-arteritic anterior ischaemic optic neuropathy, and for sudden decrease or loss of hearing. Men with a "crowded" optic disc may be at higher risk of NAION.',
          clinicalPrecaution:
            'Neither association is proven causal — the men who take this drug share every risk factor for both events — which is exactly why the label instructs stopping and assessment rather than reassurance.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CCCC1=NN(C2=C1N=C(NC2=O)C3=C(C=CC(=C3)S(=O)(=O)N4CCN(CC4)C)OCC)C',
      chemicalFormula: 'C22H30N6O4S',
      molecularWeight: '474.60 g/mol (free base); dispensed as the citrate salt',
      targetReceptorAffinity:
        'A pyrazolo[4,3-d]pyrimidinone built as a cyclic-GMP mimic, so it occupies the catalytic site of PDE5 in place of the substrate. The label reports selectivity of 10-fold over PDE6, more than 80-fold over PDE1, more than 700-fold over PDE2, 3, 4, 7, 8, 9, 10 and 11, and approximately 4,000-fold over PDE3 — the isoform that controls cardiac contractility. The narrow 10-fold margin over retinal PDE6 is stated in the label as the basis for the colour-vision abnormalities, and it is the clearest example in common medicine of a side effect being predicted from a selectivity ratio.',
      structureSource: {
        label:
          'PubChem CID 135398744 (sildenafil) — canonical SMILES, molecular formula and weight, as carried on the enriched record; selectivity ratios from the VIAGRA prescribing information, section 12.1',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/135398744',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'sil-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Resolve the drug from its own analogues',
          description:
            'Sildenafil is the most-counterfeited and most-analogued small molecule in circulation: thiosildenafil, hydroxythiohomosildenafil, acetildenafil and dozens of others differ by one heteroatom or one alkyl group and are pharmacologically active. An assay that confirms sildenafil without excluding its analogues is not an identity test.',
          reagentsAndBuffer:
            'Sildenafil citrate reference standard, a curated analogue reference panel, UHPLC with high-resolution accurate-mass detection, 1H and 13C NMR, ion mobility separation for isobaric analogues',
        },
        {
          id: 'sil-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Build the pyrazolopyrimidinone, then sulfonylate and aminate',
          description:
            'The published route couples a 4-amino-pyrazole-carboxamide with a 2-ethoxybenzoyl derivative and cyclises to the pyrimidinone, then chlorosulfonates the pendant aryl ring and displaces with N-methylpiperazine. The chlorosulfonation is the hazardous step and the one that dictates the plant.',
          dependsOnStepId: 'sil-w1',
          reagentsAndBuffer:
            '1-methyl-4-nitro-pyrazole-carboxylic acid derivatives, 2-ethoxybenzoyl chloride, base-mediated cyclisation, chlorosulfonic acid, N-methylpiperazine, citric acid for salt formation',
        },
        {
          id: 'sil-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Form the citrate salt and specify the genotoxic sulfonate esters',
          description:
            'Chlorosulfonation followed by work-up in an alcoholic solvent is the classic route to alkyl sulfonate ester impurities, which are a specified genotoxic class. The citrate salt is what is dispensed and its stoichiometry and form must be controlled separately from the free base.',
          dependsOnStepId: 'sil-w2',
          reagentsAndBuffer:
            'Controlled citrate salt formation with defined stoichiometry, LC-MS at parts-per-million sensitivity for alkyl sulfonate esters, powder X-ray diffraction and DSC for salt form, dissolution testing across the physiological pH range',
        },
        {
          id: 'sil-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Measure PDE6 inhibition in the same experiment as PDE5, not a separate one',
          description:
            'The colour-vision effect and the retinal safety questions all follow from a single ratio: potency at PDE5 divided by potency at PDE6. A programme that assays PDE5 with one method and PDE6 with another cannot state that ratio, and the ratio is what the label reports.',
          dependsOnStepId: 'sil-w3',
          reagentsAndBuffer:
            'Recombinant human PDE5A and bovine or human retinal PDE6 assayed in parallel under identical conditions, tritiated or fluorescence-polarisation cyclic GMP substrate, matched PDE1, PDE3 and PDE11 counter-screens, IC50 determination on the same plate',
        },
        {
          id: 'sil-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Report the endpoint the disease has, not the one the mechanism has',
          description:
            'Cyclic GMP rises wherever PDE5 is inhibited, which is why this molecule has been tried in erectile dysfunction, pulmonary hypertension, heart failure, altitude sickness, Raynaud phenomenon and fetal growth restriction. The mechanism transferred to all of them; the benefit did not. The measurement that distinguishes them is the disease endpoint — peak oxygen consumption, perinatal mortality, survival — not the second messenger.',
          dependsOnStepId: 'sil-w4',
          reagentsAndBuffer:
            'Disease-specific prespecified primary endpoints with independent adjudication: cardiopulmonary exercise testing for heart failure, composite perinatal mortality and morbidity to hospital discharge for obstetric use, six-minute walk and time to clinical worsening for pulmonary arterial hypertension, IIEF questionnaire and event diary for erectile dysfunction',
        },
      ],
    },
    keyAudits: [
      {
        id: 'sil-a1',
        category: 'conclusion_shift',
        title: 'It was an angina drug that did not work, rescued by a side effect',
        laymanSummary:
          'Sildenafil was developed to treat chest pain from coronary disease. It was not good enough for that. What the early volunteers reported instead became the indication.',
        technicalDetails:
          'The compound entered development at Pfizer as UK-92,480, a PDE5 inhibitor intended to relax coronary vasculature in angina pectoris. The published history of the molecule describes the sequence: from a potential anti-angina drug, to an on-demand oral treatment for erectile dysfunction approved as Viagra in 1998, and later to an oral treatment for pulmonary arterial hypertension approved as Revatio. This is the most-cited repurposing story in the pharmaceutical literature, and its structure is worth stating precisely: the mechanism was correct, the target tissue was wrong, and the correction came from an adverse-event report rather than from the hypothesis.',
        evidenceSource:
          'Ghofrani HA, Osterloh IH, Grimminger F. Sildenafil: from angina to erectile dysfunction to pulmonary hypertension and beyond. Nat Rev Drug Discov 2006;5:689-702',
        doi: '10.1038/nrd2030',
        measuredMetric:
          'Development history from anti-angina candidate to two approved indications in different organ systems',
        auditFlag: 'verified',
      },
      {
        id: 'sil-a2',
        category: 'measured',
        title: 'The efficacy result that built the franchise',
        laymanSummary:
          'In the pivotal trials, roughly seven in ten attempts at intercourse succeeded on the drug against two in ten on placebo.',
        technicalDetails:
          'Two sequential double-blind studies enrolled 532 men in a 24-week dose-response study and 329 in a 12-week flexible dose-escalation study. In the last four weeks of the escalation study, 69% of all attempts at sexual intercourse were successful on sildenafil against 22% on placebo (p<0.001), with 5.9 successful attempts per month against 1.5 (p<0.001). At 100 mg the mean score for the question about achieving erections doubled from 2.0 to 4.0 out of 5. Headache, flushing and dyspepsia were the commonest adverse effects, in 6% to 18%. The label records that across 21 randomised placebo-controlled trials in more than 3,000 patients aged 19 to 87, sildenafil showed statistically significant improvement over placebo in all 21. The effect size here is unusually large and unusually consistent — this is not a marginal drug in its licensed indication.',
        evidenceSource:
          'Goldstein I, Lue TF, Padma-Nathan H, et al. Oral sildenafil in the treatment of erectile dysfunction. N Engl J Med 1998;338:1397-1404; VIAGRA United States prescribing information, section 14',
        doi: '10.1056/NEJM199805143382001',
        measuredMetric:
          'Proportion of intercourse attempts successful in the final four weeks, sildenafil against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'sil-a3',
        category: 'failed',
        title: 'RELAX: no benefit in heart failure with preserved ejection fraction',
        laymanSummary:
          'The mechanism suggested it should help a common kind of heart failure. In 216 patients over 24 weeks, exercise capacity did not change at all — the difference was 0.01 mL/kg/min.',
        technicalDetails:
          'RELAX randomised 216 stable outpatients with heart failure, ejection fraction at or above 50%, elevated NT-proBNP or invasively measured filling pressures, and reduced exercise capacity, to sildenafil (n=113) or placebo (n=103) — 20 mg three times daily for 12 weeks then 60 mg three times daily for 12 weeks. The primary endpoint, change in peak oxygen consumption at 24 weeks, was a median -0.20 mL/kg/min in both arms (p=0.90), with a mean between-group difference of 0.01 mL/kg/min (95% CI -0.60 to 0.61). Six-minute walk distance changed by 15.0 m on placebo and 5.0 m on sildenafil (p=0.92). The hierarchical clinical status score was 95.8 against 94.2 (p=0.85). Serious adverse events were 16% against 22%. This was a properly powered, well-conducted trial of a mechanistically attractive hypothesis, and it returned nothing.',
        evidenceSource:
          'Redfield MM, Chen HH, Borlaug BA, et al. Effect of phosphodiesterase-5 inhibition on exercise capacity and clinical status in heart failure with preserved ejection fraction: a randomized clinical trial (RELAX). JAMA 2013;309:1268-1277',
        doi: '10.1001/jama.2013.2024',
        measuredMetric: 'Change in peak oxygen consumption at 24 weeks against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'sil-a4',
        category: 'failed',
        title: 'The obstetric trial that was stopped for harm',
        laymanSummary:
          'Sildenafil was given to pregnant women whose babies were not growing, on the theory that it would open up the placental circulation. It did not help, and nearly one in five of the babies developed high pressure in the lung arteries against one in twenty on placebo.',
        technicalDetails:
          'The Dutch STRIDER trial randomised 216 pregnant women between 20 and 30 weeks with severe early-onset fetal growth restriction to sildenafil 25 mg three times daily or placebo, across 11 Dutch centres. It was halted on 19 July 2018, at 216 of a planned 360 participants, on safety grounds and because benefit was unlikely. The primary composite of perinatal mortality or major neonatal morbidity to discharge occurred in 65 (60.2%) against 58 (54.2%) — relative risk 1.11 (95% CI 0.88 to 1.40, p=0.38). Pulmonary hypertension, a prespecified safety outcome, occurred in 16 neonates (18.8%) against 4 (5.1%) — relative risk 3.67 (95% CI 1.28 to 10.51, p=0.008). A later post-hoc analysis of the same cohort proposed rebound vasoconstriction after withdrawal of the drug as a mechanism. The pharmacological reasoning behind the trial was sound and the result is one of the clearest demonstrations available that a plausible vasodilator mechanism, applied to a new circulation, can do net harm.',
        evidenceSource:
          'Pels A, Derks J, Elvan-Taspinar A, et al. Maternal Sildenafil vs Placebo in Pregnant Women With Severe Early-Onset Fetal Growth Restriction: A Randomized Clinical Trial. JAMA Netw Open 2020;3(6):e205323 (Dutch STRIDER, NCT02277132)',
        doi: '10.1001/jamanetworkopen.2020.5323',
        measuredMetric:
          'Neonatal pulmonary hypertension rate and the composite of perinatal mortality or major neonatal morbidity',
        auditFlag: 'retracted',
      },
      {
        id: 'sil-a5',
        category: 'conclusion_shift',
        title:
          'The paediatric mortality imbalance, and the label’s decision that it was not causal',
        laymanSummary:
          'In children with pulmonary hypertension, deaths rose with dose: 9% on low dose, 13.5% on medium, 22% on high. The FDA warned against higher doses, then reconsidered, and the label now reports the numbers and says a causal link is unlikely.',
        technicalDetails:
          'STARTS-1 randomised 234 treatment-naive children aged 1 to 17 with pulmonary arterial hypertension to low-, medium- or high-dose sildenafil or placebo; STARTS-2 was the long-term extension. As of August 2011, 37 deaths were reported. Kaplan-Meier three-year survival from start of sildenafil was 94%, 93% and 88% for low, medium and high dose; the hazard ratio for mortality was 3.95 (95% CI 1.46 to 10.65) for high against low dose and 1.92 (95% CI 0.65 to 5.65) for medium against low, and the authors noted that multiple analyses raised uncertainty about the dose-survival relationship. The current REVATIO label reports the imbalance explicitly — deaths of 5/55 (9.1%), 10/74 (13.5%) and 22/100 (22%) in the low, medium and high dose groups — and then states that the observation was not confirmed in the adult study designed to evaluate the risk, that a causal association is therefore unlikely, and that the data support dosing up to 40 mg three times a day in children over 45 kg. Both readings of the same data are on the record, which is why this is a conclusion shift rather than a settled result.',
        evidenceSource:
          'Barst RJ, Beghetti M, Pulido T, et al. STARTS-2: long-term survival with oral sildenafil monotherapy in treatment-naive pediatric pulmonary arterial hypertension. Circulation 2014;129:1914-1923; REVATIO United States prescribing information, section 8.4 Pediatric Use',
        doi: '10.1161/CIRCULATIONAHA.113.005698',
        measuredMetric:
          'Three-year mortality by randomised sildenafil dose group in treatment-naive paediatric pulmonary arterial hypertension',
        auditFlag: 'contested',
      },
      {
        id: 'sil-a6',
        category: 'inferred',
        title: 'The Alzheimer’s headline rests on prescription records, not on a trial',
        laymanSummary:
          'A widely reported analysis of insurance claims found that men prescribed sildenafil had 69% less Alzheimer’s disease. It is an association in a database, and the authors said so in the paper.',
        technicalDetails:
          'A network-medicine study screened drug candidates against Alzheimer endophenotype modules and then examined insurance claims for 7.23 million individuals, reporting that sildenafil use was associated with a 69% reduced risk of Alzheimer’s disease (hazard ratio 0.31, 95% CI 0.25 to 0.39, p<1.0 x 10-8), holding after propensity-score stratification against four comparator drug cohorts, alongside reduced phospho-tau in patient-derived neurons. Subsequent claims analyses in other databases reported associations of similar direction and smaller size — a 60% reduction in one MarketScan analysis and a 54% and 30% reduction against different comparators in another. Every one of these is observational. Men who receive a sildenafil prescription differ systematically from men who do not in health, wealth, healthcare contact and cognitive status at the point of prescribing, and erectile dysfunction is itself a marker of vascular disease, which cuts the other way. The original paper states directly that the association "does not establish causality or its direction, which requires a randomized clinical trial approach". No such trial has reported.',
        evidenceSource:
          'Fang J, Zhang P, Zhou Y, et al. Endophenotype-based in silico network medicine discovery combined with insurance record data mining identifies sildenafil as a candidate drug for Alzheimer’s disease. Nat Aging 2021;1:1175-1188',
        doi: '10.1038/s43587-021-00138-z',
        inferredClaim:
          'That sildenafil prevents or delays Alzheimer’s disease — an association from prescription claims databases, disclaimed as non-causal by its own authors, and never tested in a randomised trial',
        auditFlag: 'caution',
      },
      {
        id: 'sil-a7',
        category: 'measured',
        title: 'A ten-fold selectivity margin you can see',
        laymanSummary:
          'The blue tinge some men see is not a mystery. Sildenafil is only ten times better at blocking its intended enzyme than at blocking the near-identical enzyme in the retina, and the label says so.',
        technicalDetails:
          'Section 12.1 of the label states that sildenafil is approximately 4,000-fold more selective for PDE5 than for PDE3 — the isoform controlling cardiac contractility, and the reason the drug does not behave like an inotrope — but only about 10-fold as potent for PDE5 as for PDE6, the retinal enzyme in the phototransduction pathway. It states outright that "this lower selectivity is thought to be the basis for abnormalities related to color vision". This is one of the cleanest examples in medicine of a side effect being predicted quantitatively from an in-vitro ratio before it was reported clinically. The same section notes PDE5 is present in platelets, vascular and visceral smooth muscle, skeletal muscle, brain, heart, liver, kidney, lung, pancreas, prostate, bladder, testis and seminal vesicle — which is the reason this molecule keeps being tried in new diseases.',
        evidenceSource:
          'VIAGRA (sildenafil citrate) United States prescribing information, section 12.1 Mechanism of Action and Binding Characteristics (NDA 020895)',
        measuredMetric:
          'Selectivity ratios of sildenafil for PDE5 against PDE1, PDE3, PDE6 and PDE11',
        auditFlag: 'verified',
      },
      {
        id: 'sil-a8',
        category: 'measured',
        title: 'The contraindication that is absolute',
        laymanSummary:
          'Taken with a nitrate — a heart medicine, or amyl nitrite — sildenafil can drop blood pressure catastrophically. The label calls it a contraindication, not a caution, and cannot say how long to wait.',
        technicalDetails:
          'Section 4.1 makes administration to patients using nitric oxide donors — organic nitrates or organic nitrites in any form, regularly or intermittently — a contraindication, on the basis that sildenafil potentiates their hypotensive effect through the shared nitric oxide/cyclic GMP pathway. The label adds a striking admission: "After patients have taken VIAGRA, it is unknown when nitrates, if necessary, can be safely administered." Section 4.3 extends the contraindication to the guanylate cyclase stimulator riociguat. Section 5.1 separately warns against use where sexual activity is inadvisable on cardiovascular grounds, records a mean maximum supine blood pressure fall of 8.4/5.5 mmHg in healthy volunteers, and lists groups with no controlled data at all: recent myocardial infarction, stroke or life-threatening arrhythmia within six months, resting blood pressure below 90/50 or above 170/110, and cardiac failure or coronary disease causing unstable angina.',
        evidenceSource:
          'VIAGRA United States prescribing information, sections 4.1, 4.3, 5.1, 5.2, 5.3, 5.4 and 5.5 (NDA 020895)',
        measuredMetric:
          'Labelled contraindications and the mean maximum supine blood pressure reduction in healthy volunteers',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'The signal has to come first',
        laymanDesc:
          'Arousal releases nitric oxide in the penis. Without that, the drug has nothing to work on — the label says it has no effect in the absence of sexual stimulation.',
        molecularDetail:
          'Nitric oxide released from nitrergic nerve terminals and endothelium during sexual stimulation activates soluble guanylate cyclase in corpus cavernosum smooth muscle, raising cyclic GMP. Sildenafil has no direct relaxant effect on isolated human corpus cavernosum.',
        iconName: 'Zap',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Cyclic GMP relaxes the muscle and blood flows in',
        laymanDesc:
          'The chemical messenger tells the smooth muscle in the blood vessels to let go, and the tissue fills.',
        molecularDetail:
          'Cyclic GMP acts through protein kinase G to lower intracellular calcium and relax trabecular smooth muscle, allowing arterial inflow and passive compression of the subtunical venules, which is the veno-occlusive mechanism that maintains the erection.',
        iconName: 'Waves',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'PDE5 is the off switch, and this drug blocks it',
        laymanDesc:
          'An enzyme normally destroys the messenger within minutes. Sildenafil sits in its active site so the messenger lasts.',
        molecularDetail:
          'Sildenafil is a cyclic-GMP mimic that competitively occupies the catalytic site of phosphodiesterase type 5, preventing hydrolysis of cyclic GMP to 5’-GMP. The drug amplifies an existing signal rather than initiating one, which is the pharmacological basis for its on-demand use.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'And blocks the retinal enzyme ten times less well',
        laymanDesc:
          'The enzyme in the retina that handles light is a close relative. Sildenafil is only ten times more selective for its target than for that one, which is why some men see a blue tinge.',
        molecularDetail:
          'PDE6 in the retinal phototransduction cascade is inhibited at about a tenth the potency of PDE5. The label attributes colour-vision abnormalities to this margin, and contrasts it with roughly 4,000-fold selectivity over PDE3, the cardiac contractility isoform.',
        iconName: 'Eye',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The measured result: about seven attempts in ten instead of two',
        laymanDesc:
          'In the pivotal trial, 69% of intercourse attempts succeeded on the drug against 22% on placebo.',
        molecularDetail:
          'In the final four weeks of the dose-escalation study, 69% of attempts succeeded against 22% on placebo (p<0.001), with 5.9 against 1.5 successful attempts per month. Across 21 randomised placebo-controlled trials in over 3,000 men, all 21 showed statistically significant improvement over placebo.',
        iconName: 'CheckCircle',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'The same enzyme elsewhere, and what happened there',
        laymanDesc:
          'PDE5 sits in lung arteries, platelets, brain, bladder and kidney. Pointing the drug at the lung worked. Pointing it at stiff hearts and at growth-restricted pregnancies did not.',
        molecularDetail:
          'Pulmonary arterial hypertension is a licensed indication as Revatio. Heart failure with preserved ejection fraction: RELAX found a between-group difference in peak oxygen consumption of 0.01 mL/kg/min (p=0.90). Severe early-onset fetal growth restriction: the Dutch STRIDER trial was halted with neonatal pulmonary hypertension at 18.8% against 5.1% (RR 3.67, 95% CI 1.28 to 10.51).',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Sildenafil Study Group pivotal trials (N Engl J Med 1998;338:1397-1404)',
        phase: 'Phase 3, two sequential randomised double-blind placebo-controlled studies',
        sampleSize: 861,
        primaryEndpoint:
          'International Index of Erectile Function questions on achieving and maintaining erections, plus patient diary of successful intercourse attempts, in men with erectile dysfunction of organic, psychogenic and mixed cause',
        endpointMet: true,
        statisticalPValue:
          '69% of intercourse attempts successful against 22% on placebo in the final four weeks (p<0.001); 5.9 against 1.5 successful attempts per month (p<0.001); mean erection score 4.0 against a baseline 2.0 at 100 mg',
        unreportedAdverseSignals:
          'Headache, flushing and dyspepsia in 6% to 18%. These are efficacy trials of up to 24 weeks in men selected for the indication; they were not designed to detect cardiovascular events, and the label separately warns that there are no controlled data in men with recent infarction, stroke or life-threatening arrhythmia.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'RELAX (JAMA 2013;309:1268-1277; NCT00763867)',
        phase: 'Phase 3, multicentre, randomised, double-blind, placebo-controlled',
        sampleSize: 216,
        primaryEndpoint:
          'Change in peak oxygen consumption after 24 weeks in stable outpatients with heart failure and ejection fraction at or above 50%',
        endpointMet: false,
        statisticalPValue:
          'Median change -0.20 mL/kg/min in both arms, p=0.90; mean between-group difference 0.01 mL/kg/min (95% CI -0.60 to 0.61)',
        unreportedAdverseSignals:
          'Six-minute walk change 15.0 m on placebo against 5.0 m on sildenafil (p=0.92); clinical status rank 95.8 against 94.2 (p=0.85). Serious adverse events 16% on placebo against 22% on sildenafil — numerically higher on the drug that produced no benefit.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Dutch STRIDER (JAMA Netw Open 2020;3:e205323; NCT02277132)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled — halted early for safety',
        sampleSize: 216,
        primaryEndpoint:
          'Composite of perinatal mortality or major neonatal morbidity to hospital discharge, in pregnancies with severe early-onset fetal growth restriction',
        endpointMet: false,
        statisticalPValue:
          '60.2% against 54.2%; relative risk 1.11 (95% CI 0.88 to 1.40), p=0.38, in 216 of a planned 360 participants',
        unreportedAdverseSignals:
          'The trial was stopped on 19 July 2018 because of the safety signal it had already generated: neonatal pulmonary hypertension in 16 neonates (18.8%) against 4 (5.1%), relative risk 3.67 (95% CI 1.28 to 10.51), p=0.008. A post-hoc analysis of the same cohort proposed rebound vasoconstriction after drug withdrawal as the mechanism.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'STARTS-1 and STARTS-2 (Circulation 2014;129:1914-1923; NCT00159874)',
        phase: 'Phase 3 randomised placebo-controlled trial with long-term open extension',
        sampleSize: 234,
        primaryEndpoint:
          'Long-term survival on oral sildenafil monotherapy by randomised dose group, in treatment-naive children aged 1 to 17 with pulmonary arterial hypertension',
        endpointMet: false,
        statisticalPValue:
          'Kaplan-Meier 3-year survival 94%, 93% and 88% for low, medium and high dose; hazard ratio for mortality 3.95 (95% CI 1.46 to 10.65) for high against low dose',
        unreportedAdverseSignals:
          'Thirty-seven deaths were reported, 26 on study treatment. The authors state that multiple analyses raised uncertainty about the survival-dose relationship, and the current label reports the raw imbalance — 9.1%, 13.5% and 22% — while concluding a causal association is unlikely on the basis of an adult study. Two defensible readings of one dataset coexist in the regulatory record.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '69% of intercourse attempts successful against 22% on placebo in the final four weeks of the pivotal dose-escalation study (p<0.001)',
        'Statistically significant improvement over placebo in all 21 randomised controlled trials in more than 3,000 men, per the label',
        'Approximately 10-fold selectivity for PDE5 over retinal PDE6 and approximately 4,000-fold over cardiac PDE3, from the label',
        'Mean maximum supine blood pressure decrease of 8.4/5.5 mmHg in healthy volunteers',
        'Neonatal pulmonary hypertension 18.8% against 5.1% (RR 3.67, 95% CI 1.28 to 10.51) in the Dutch STRIDER trial',
      ],
      unsupportedInferences: [
        'That PDE5 inhibition helps heart failure with preserved ejection fraction — tested in RELAX and found null to two decimal places',
        'That improving uteroplacental blood flow with sildenafil helps a growth-restricted fetus — tested and stopped for harm',
        'That sildenafil prevents Alzheimer’s disease — an association in insurance claims that its own authors decline to call causal',
        'That the erectile dysfunction result implies anything about cardiovascular outcomes, when the label states there are no controlled data in men with recent infarction, stroke or life-threatening arrhythmia',
      ],
      whatFailedInitially: [
        'Failed as an antianginal, the indication it was developed for',
        'Failed in heart failure with preserved ejection fraction: peak oxygen consumption difference 0.01 mL/kg/min',
        'Failed and was halted for harm in severe early-onset fetal growth restriction',
        'Produced a dose-related mortality imbalance in treatment-naive children with pulmonary arterial hypertension that the label now judges non-causal',
      ],
      realWorldOutcome: [
        'Approved 27 March 1998 under NDA 020895; generic in the United States since December 2017 and now about twelve cents a tablet at pharmacy acquisition cost across 117 listed products',
        'A second identity as Revatio for pulmonary arterial hypertension, at a different dose and schedule, in adults and in children aged 1 to 17',
        'The most counterfeited and most analogue-adulterated small molecule in the supplement supply chain, which matters because the nitrate contraindication is absolute',
        'Still generating repurposing hypotheses from claims databases three decades after synthesis, none yet confirmed in a randomised trial',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet at 25, 50 and 100 mg for erectile dysfunction, taken on demand about an hour before sexual activity; as Revatio, a 20 mg tablet three times daily, an oral suspension and an intravenous injection for pulmonary arterial hypertension',
      description:
        'Rapidly absorbed with peak plasma concentrations at 30 to 120 minutes fasting; a high-fat meal delays absorption. Cleared principally by CYP3A4 with a contribution from CYP2C9, so strong CYP3A inhibitors such as ritonavir markedly raise exposure and the label directs a dose reduction. Terminal half-life is about four hours, which is what makes it an on-demand rather than a background drug — and the reason the pulmonary hypertension formulation is dosed three times a day.',
      safetyProfile:
        'Contraindicated with nitric oxide donors — organic nitrates or nitrites in any form, regular or intermittent — because the hypotensive effect is potentiated, and the label states it is unknown when a nitrate can safely be given after a dose. Also contraindicated with the guanylate cyclase stimulator riociguat and in known hypersensitivity. Should not generally be used where sexual activity is inadvisable on cardiovascular grounds; no controlled data exist in men with myocardial infarction, stroke or life-threatening arrhythmia within six months, resting blood pressure below 90/50 or above 170/110, or cardiac failure or coronary disease causing unstable angina. Seek emergency care for an erection beyond four hours. Stop and seek care for sudden vision loss, which may indicate non-arteritic anterior ischaemic optic neuropathy, or sudden hearing loss. Caution with alpha-blockers and antihypertensives because of additive hypotension. Commonest adverse effects are headache, flushing and dyspepsia.',
    },
    commonQuestions: [
      {
        q: 'Is it true this was a heart drug first?',
        a: 'Yes, and precisely so. It was developed as UK-92,480, a PDE5 inhibitor intended to relax coronary arteries in angina. It was not effective enough for that indication. What the early-phase volunteers reported instead redirected the programme, and the drug was approved for erectile dysfunction in 1998 and later, at a different dose, for pulmonary arterial hypertension. The mechanism was right the whole time; the organ was wrong. It is the most-cited repurposing story in the industry, and the part usually left out is that every deliberate attempt to steer it back toward the heart since — heart failure with preserved ejection fraction, and antenatal use for placental insufficiency — has failed.',
        auditNote:
          'A serendipitous success and a series of rational failures, from the same molecule and the same mechanism. That is what it looks like when a mechanism is real and its clinical consequences are not predictable from it.',
      },
      {
        q: 'Why can it not be taken with heart medicines?',
        a: 'Because nitrates and sildenafil act on the same pathway from opposite ends. Nitrates donate nitric oxide, which raises cyclic GMP; sildenafil stops cyclic GMP being broken down. Together they can produce a blood pressure fall that is dangerous rather than merely uncomfortable. The label does not treat this as a caution — it is a contraindication for organic nitrates or nitrites in any form, taken regularly or occasionally, and that includes recreational amyl nitrite. The label also admits that after a dose has been taken, it is not known when a nitrate can safely be given. The same contraindication covers riociguat.',
      },
      {
        q: 'Why do some people see a blue tinge?',
        a: 'Because the enzyme sildenafil blocks in the penis has a close relative in the retina that handles the conversion of light into a nerve signal, and the drug is only about ten times better at hitting the intended one. The label states this outright: sildenafil is approximately 10-fold as potent for PDE5 as for PDE6, "and this lower selectivity is thought to be the basis for abnormalities related to color vision". For contrast, it is roughly 4,000-fold selective over the cardiac enzyme PDE3, which is why it does not act on the heart muscle directly. It is a rare case where a side effect was predictable from a number in a laboratory assay.',
      },
      {
        q: 'I read it prevents Alzheimer’s disease. Does it?',
        a: 'Unknown, and the evidence is weaker than the headlines. The finding comes from analyses of insurance claims — one of 7.23 million people reported that men prescribed sildenafil had a 69% lower rate of Alzheimer’s diagnosis, and later analyses of other databases found associations in the same direction at 30% to 60%. None of these is a trial. The men who get a sildenafil prescription differ from the men who do not in ways databases cannot fully adjust for: income, healthcare contact, sexual activity, cognitive status at the time of prescribing, and general health. The authors of the original paper wrote in the paper that the association "does not establish causality or its direction, which requires a randomized clinical trial approach". That trial has not reported.',
        auditNote:
          'This is the same shape as the drug’s own history: a strong mechanistic story plus an observational signal. That combination produced Viagra and it also produced the failed HFpEF and obstetric trials. Which one it is here is not yet known.',
      },
      {
        q: 'It is generic now — why is it still expensive?',
        a: 'It is not, at the wholesale level. Pharmacies acquire generic sildenafil for about US$0.12 a tablet, across 117 listed products in the CMS survey, which makes it one of the most competitively supplied molecules in American medicine. Anything a patient pays substantially above that is the cost of a consultation, a subscription, a brand, or a distribution channel — not the cost of the drug. That gap is worth knowing about because the safety questions that matter with this molecule, above all the nitrate contraindication and the "is sexual activity safe for your heart" question the label raises, are exactly the ones a low-friction purchase is designed to skip.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Goldstein I, Lue TF, Padma-Nathan H, et al. Oral sildenafil in the treatment of erectile dysfunction. Sildenafil Study Group. N Engl J Med 1998;338:1397-1404',
        identifier: '10.1056/NEJM199805143382001',
        kind: 'doi',
      },
      {
        label:
          'Ghofrani HA, Osterloh IH, Grimminger F. Sildenafil: from angina to erectile dysfunction to pulmonary hypertension and beyond. Nat Rev Drug Discov 2006;5:689-702',
        identifier: '10.1038/nrd2030',
        kind: 'doi',
      },
      {
        label:
          'Redfield MM, Chen HH, Borlaug BA, et al. Effect of phosphodiesterase-5 inhibition on exercise capacity and clinical status in heart failure with preserved ejection fraction: a randomized clinical trial. JAMA 2013;309:1268-1277 (RELAX)',
        identifier: '10.1001/jama.2013.2024',
        kind: 'doi',
      },
      {
        label:
          'Pels A, Derks J, Elvan-Taspinar A, et al. Maternal Sildenafil vs Placebo in Pregnant Women With Severe Early-Onset Fetal Growth Restriction: A Randomized Clinical Trial. JAMA Netw Open 2020;3(6):e205323 (Dutch STRIDER)',
        identifier: '10.1001/jamanetworkopen.2020.5323',
        kind: 'doi',
      },
      {
        label:
          'Pels A, Onland W, Berger RMF, et al. Neonatal pulmonary hypertension after severe early-onset fetal growth restriction: post hoc reflections on the Dutch STRIDER study. Eur J Pediatr 2022;181:1709-1718',
        identifier: '10.1007/s00431-021-04355-x',
        kind: 'doi',
      },
      {
        label:
          'Barst RJ, Beghetti M, Pulido T, et al. STARTS-2: long-term survival with oral sildenafil monotherapy in treatment-naive pediatric pulmonary arterial hypertension. Circulation 2014;129:1914-1923',
        identifier: '10.1161/CIRCULATIONAHA.113.005698',
        kind: 'doi',
      },
      {
        label:
          'Fang J, Zhang P, Zhou Y, et al. Endophenotype-based in silico network medicine discovery combined with insurance record data mining identifies sildenafil as a candidate drug for Alzheimer’s disease. Nat Aging 2021;1:1175-1188',
        identifier: '10.1038/s43587-021-00138-z',
        kind: 'doi',
      },
      {
        label: 'Dutch STRIDER randomised trial registry record',
        identifier: 'NCT02277132',
        kind: 'nct',
      },
      {
        label: 'RELAX trial registry record',
        identifier: 'NCT00763867',
        kind: 'nct',
      },
      {
        label:
          'VIAGRA (sildenafil citrate) United States prescribing information — Indications (1), Contraindications (4.1 Nitrates, 4.3 Guanylate Cyclase Stimulators), Warnings and Precautions (5.1 to 5.6), Clinical Studies (14), Mechanism of Action and Binding Characteristics (12.1), NDA 020895',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22VIAGRA%22',
        kind: 'regulatory',
      },
      {
        label:
          'REVATIO (sildenafil) United States prescribing information — Indications (1, adults and paediatric patients 1 to 17 years) and Pediatric Use (8.4, STARTS-1 and STARTS-2 mortality imbalance), NDA 021845',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22REVATIO%22',
        kind: 'regulatory',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — sildenafil, 117 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 135398744 — sildenafil structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/135398744',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 5. Phenazopyridine — an azo dye that has never been approved by the FDA, whose own label says
  //    the mechanism is not known and the pharmacokinetics have not been determined, and which is
  //    listed by the National Toxicology Program as reasonably anticipated to be a human carcinogen.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'phenazopyridine',
    name: 'Phenazopyridine',
    tradeName:
      'Pyridium / AZO Urinary Pain Relief / Maximum Strength Urinary Pain Relief and dozens of retailer-branded equivalents',
    sponsor:
      'No FDA application holder exists. Phenazopyridine has never been the subject of an approved New Drug Application; every prescription and over-the-counter product in the United States is listed in the FDA National Drug Code directory under the marketing category "unapproved drug other", and is made by many manufacturers',
    targetGene: 'No molecular target has been identified',
    targetProtein:
      'None established. The label states that phenazopyridine is excreted in the urine where it exerts a topical analgesic effect on the mucosa of the urinary tract, and that the precise mechanism of action is not known. No receptor, channel or enzyme has been shown to mediate the effect',
    modality: 'Small Molecule',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Symptomatic relief of pain, burning, urgency, frequency and other discomforts arising from irritation of the lower urinary tract mucosa caused by infection, trauma, surgery, endoscopic procedures, or the passage of sounds or catheters. The label states that use should not delay definitive diagnosis and treatment of the causative condition, and that treatment of a urinary tract infection with it should not exceed 2 days',
    patientFriendlyIndication:
      'The burning of a urinary tract infection — the symptom, not the infection',
    anatomicalSite:
      'The urothelial lining of the bladder and lower urinary tract, reached from inside the urine rather than through the bloodstream: as much as 66% of an oral dose is excreted unchanged in the urine',
    conditionContext: {
      conditionExplainer:
        'A urinary tract infection hurts because bacteria inflame the lining of the bladder and urethra. Antibiotics kill the bacteria, but they take a day or more to make the burning stop. Phenazopyridine is a dye that is filtered into the urine and appears to numb that lining from the inside while the antibiotic works.',
      whyItMatters:
        'This is one of the most widely taken medicines in the United States that the FDA has never approved. It predates the modern approval system, is sold over the counter and on prescription without an application on file, and its own prescribing information states that the mechanism is not known and the pharmacokinetics have not been determined. It also turns urine bright orange, which breaks the dipstick test used to diagnose the infection it is being taken for.',
      whoTakesThis:
        'Adults with urinary burning, most often in the first day or two of treating a urinary tract infection, and people with catheter or post-procedure bladder discomfort. Not people with renal insufficiency, in whom it is contraindicated.',
      clinicalGoals:
        'Less burning for one to two days. Nothing else. It has no antibacterial activity and does not shorten, cure or prevent an infection.',
    },
    oneSentenceVerdict:
      'A urinary azo dye marketed in the United States without any FDA approval, whose label states outright that "the precise mechanism of action is not known" and that its pharmacokinetics "have not been determined", which failed to beat placebo for catheter-associated bladder discomfort in a 258-patient randomised trial (mean visual analogue score 0.95 cm against 0.97 cm, p=0.745), and which the National Toxicology Program lists as reasonably anticipated to be a human carcinogen on the basis of colorectal tumours in rats and liver tumours in mice.',
    laymanHowItWorks:
      'Phenazopyridine is a dye. Swallowed, it is filtered out by the kidney largely unchanged — as much as two-thirds of the dose leaves in the urine — and it appears to have a numbing effect on the lining of the bladder and urethra from the urine side. That is the whole of what is known. Its own prescribing information says the precise mechanism is not known and that the drug’s handling by the body has never been characterised. It kills no bacteria and treats no infection; it changes how the infection feels for a day or two while something else deals with the cause.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 34,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1766 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 19 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'There is no patent and there never was an approval. The compound dates from the early twentieth century and is sold in the United States under the FDA’s "unapproved drug other" marketing category, both on prescription at 100 and 200 mg and over the counter at 95 and 97.5 mg under dozens of retailer brands. A search of Drugs@FDA for phenazopyridine hydrochloride returns no matches at all.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Phenazopyridine competes against the antibiotic starting to work, and against simple analgesia. The honest framing is that the burning of a urinary infection resolves as the infection is treated, and the question is what to do about the first twenty-four to forty-eight hours.',
      conventionalRx: [
        {
          name: 'The antibiotic itself, started promptly',
          class:
            'Antibacterial therapy — nitrofurantoin, trimethoprim-sulfamethoxazole, fosfomycin',
          howItCompares:
            'Treats the cause rather than the sensation, and the symptoms follow. The phenazopyridine label is explicit that its use "should not delay definitive diagnosis and treatment of causative conditions", and that combined administration with an antibacterial has no demonstrated benefit over the antibacterial alone beyond two days.',
          typicalCost:
            'Generic first-line urinary antibacterials are among the cheaper prescription drugs at United States pharmacy acquisition cost',
          prosAndCons:
            'Pros: cures the infection; symptoms resolve as it works. Cons: takes a day or more to relieve burning, which is the gap phenazopyridine is sold to fill.',
        },
        {
          name: 'A simple oral analgesic',
          class: 'Paracetamol or a non-steroidal anti-inflammatory drug',
          howItCompares:
            'Has a known mechanism, characterised pharmacokinetics, and an approved label — three things phenazopyridine does not have. It does not discolour urine and does not interfere with urinalysis. The phenazopyridine label’s own claim on this point is modest: that its analgesic action "may reduce or eliminate the need for systemic analgesics or narcotics".',
          typicalCost: 'Among the least expensive medicines available anywhere',
          prosAndCons:
            'Pros: known mechanism and dose-response; no dye; no test interference. Cons: not targeted to the bladder mucosa, and NSAIDs carry their own renal and gastric cautions in an unwell, dehydrated patient.',
        },
        {
          name: 'Methenamine with methylthioninium chloride',
          class: 'Urinary antiseptic combination, studied head to head against phenazopyridine',
          howItCompares:
            'A 316-participant randomised trial compared this combination against phenazopyridine for symptomatic control of dysuria. Its existence is the point worth noting: the comparator arm in that trial is the drug on this page, which means the evidence base for phenazopyridine consists largely of being other trials’ control group.',
          typicalCost: 'Varies by market; not separately listed for this comparison',
          prosAndCons:
            'Pros: a defined antiseptic mechanism. Cons: methenamine requires acidic urine to work, and the combination is not a substitute for treating a diagnosed infection.',
        },
      ],
      naturalFoods: [
        {
          name: 'Water',
          activeCompound: 'None — the mechanism is dilution and flushing',
          biologicalMechanism:
            'Increased urine volume dilutes irritant solutes and increases voiding frequency. It is the one intervention that is both universally recommended and free of the test-interference problem this drug creates.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'Not stated here as advice. The phenazopyridine directions themselves instruct taking each dose with a full glass of water.',
          monthlyCost: '',
        },
        {
          name: 'Cranberry products',
          activeCompound: 'Proanthocyanidins',
          biologicalMechanism:
            'Proposed inhibition of bacterial adhesion to urothelium. This is a prevention hypothesis, not a symptom-relief one — it has nothing to say about an infection already causing burning.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'Not stated here as advice, and specifically not as a substitute for treating an established infection. It is included here only because it is the product most often sold beside phenazopyridine on the same shelf, for a different purpose.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Two days, and no more',
          action:
            'Do not continue past two days alongside an antibiotic, and do not use it to postpone being seen.',
          patientImpact:
            'The label states that treatment of a urinary tract infection with phenazopyridine should not exceed 2 days "because there is a lack of evidence that the combined administration of Phenazopyridine HCl and an antibacterial provides greater benefit than administration of the antibacterial alone after 2 days". The over-the-counter cartons carry the same two-day limit.',
          clinicalPrecaution:
            'The risk of the two-day rule being broken is not mainly toxicity — it is a treated symptom concealing an untreated infection.',
        },
        {
          name: 'Expect orange, and protect what it will stain',
          action:
            'Remove contact lenses before starting, and expect urine, and possibly tears and sweat, to be strongly coloured.',
          patientImpact:
            'The label instructs that patients be informed the drug produces a reddish-orange discoloration of the urine and may stain fabric, and that staining of contact lenses has been reported. Soft lenses can be permanently discoloured.',
          clinicalPrecaution:
            'A yellowish tinge of the skin or the whites of the eyes is a different sign entirely: the label says it may indicate accumulation from impaired renal excretion and the need to stop the drug.',
        },
        {
          name: 'Tell whoever tests your urine that you are taking it',
          action: 'Say so before any urine sample is taken, for any reason.',
          patientImpact:
            'The label states that as an azo dye, phenazopyridine may interfere with urinalysis based on spectrometry or colour reactions. That covers the standard dipstick — glucose, ketones, bilirubin, nitrite and leukocyte esterase are all colour reactions — and the colour it produces is strong enough to swamp them.',
          clinicalPrecaution:
            'The practical consequence is circular: the drug taken to relieve the symptoms of a urinary infection can obscure the bedside test used to confirm one.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1=CC=C(C=C1)N=NC2=C(N=C(C=C2)N)N',
      chemicalFormula: 'C11H11N5',
      molecularWeight: '213.24 g/mol (free base); dispensed as the hydrochloride',
      targetReceptorAffinity:
        'No target affinity has been measured, because no target has been identified. Structurally it is 2,6-diamino-3-(phenyldiazenyl)pyridine — an azo dye, in the same chemical family as the food and textile colourants, with a diazenyl bridge joining a benzene ring to a diaminopyridine. The azo linkage is what makes it intensely coloured and what makes it interfere with any colorimetric urine assay. The label states the pharmacokinetic properties have not been determined and that as much as 66% of an oral dose is excreted unchanged in the urine.',
      structureSource: {
        label:
          'PubChem CID 4756 (phenazopyridine) — canonical SMILES, molecular formula and weight, as carried on the enriched record; excretion figure and mechanism statement from the phenazopyridine hydrochloride prescription label, Clinical Pharmacology',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4756',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'phz-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Test for the aromatic amine impurities that define the azo dye class',
          description:
            'Azo compounds can release aromatic amines on reductive cleavage of the diazenyl bond, and aniline and its relatives are the classic genotoxic impurities of this chemistry. For a compound already listed as reasonably anticipated to be a human carcinogen, the impurity profile is not a formality.',
          reagentsAndBuffer:
            'Phenazopyridine hydrochloride reference standard, HPLC with photodiode array and mass detection, aniline and 2,6-diaminopyridine reference impurities, reductive cleavage under sodium dithionite followed by amine derivatisation, heavy-metal screening by ICP-MS',
        },
        {
          id: 'phz-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Diazotise aniline and couple it to 2,6-diaminopyridine',
          description:
            'The molecule is made the way azo dyes have been made since the nineteenth century: diazotise a primary aromatic amine at low temperature and couple the diazonium salt to an electron-rich ring. It is inexpensive and unremarkable, which is consistent with a product that sells for about eighteen United States cents a tablet.',
          dependsOnStepId: 'phz-w1',
          reagentsAndBuffer:
            'Aniline, sodium nitrite in aqueous mineral acid at 0 to 5 degrees Celsius for diazotisation, 2,6-diaminopyridine as the coupling component under controlled pH, hydrochloric acid for salt formation',
        },
        {
          id: 'phz-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Recrystallise the hydrochloride and control residual diazonium chemistry',
          description:
            'Unreacted coupling component and residual diazonium species have to be removed rather than merely quenched, and the intense colour of the product makes visual assessment of purity useless. Everything here has to be instrumental.',
          dependsOnStepId: 'phz-w2',
          reagentsAndBuffer:
            'Recrystallisation of the hydrochloride from aqueous alcohol, activated carbon treatment, quantitative HPLC against a specified related-substances limit, loss on drying and residue on ignition',
        },
        {
          id: 'phz-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Establish where the drug actually acts, which no one has done',
          description:
            'The label asserts a topical analgesic effect on urinary tract mucosa exerted from the urine side, and states the mechanism is unknown. The experiment that would test it is a urothelial preparation exposed to the compound at achievable urinary concentrations, with sensory afferent firing as the readout. This step is listed because it is missing from the record, not because it has been done.',
          dependsOnStepId: 'phz-w3',
          reagentsAndBuffer:
            'Primary human or porcine urothelial cell culture on a permeable support with apical exposure only, bladder afferent nerve recording in an ex-vivo preparation, capsaicin and lidocaine as positive and mechanistic comparators, phenazopyridine at measured urinary concentrations',
        },
        {
          id: 'phz-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Quantify the interference the dye causes in the assay used to diagnose the disease',
          description:
            'Any programme evaluating this drug has to measure how badly it breaks urinalysis, because that interference is the main clinical cost of taking it. The measurement is straightforward and is rarely reported: run spiked urine at achievable drug concentrations through the dipstick panel and record the false results.',
          dependsOnStepId: 'phz-w4',
          reagentsAndBuffer:
            'Pooled urine spiked with phenazopyridine across the achievable concentration range, standard reagent strip panels covering glucose, ketones, bilirubin, blood, nitrite and leukocyte esterase, paired reference measurements by enzymatic assay and quantitative culture, spectrophotometric characterisation of the interfering absorbance band',
        },
      ],
    },
    keyAudits: [
      {
        id: 'phz-a1',
        category: 'inferred',
        title: 'It has never been approved by the FDA',
        laymanSummary:
          'Every phenazopyridine product sold in the United States — prescription and over-the-counter — is listed by the FDA in the category for drugs marketed without an approval. There is no application on file.',
        technicalDetails:
          'A query of the FDA National Drug Code directory returns marketing category "UNAPPROVED DRUG OTHER" and no application number for phenazopyridine hydrochloride products, both prescription (100 mg and 200 mg tablets) and over-the-counter (95 mg and 97.5 mg tablets sold under dozens of retailer brands). A query of Drugs@FDA for phenazopyridine hydrochloride returns no matches at all. The compound predates the modern approval framework and has continued to be marketed without ever being required to demonstrate efficacy to the standard the 1962 Kefauver-Harris amendments created. This is not a technicality about paperwork: it means no regulator has ever assessed whether the drug works, and no sponsor has ever had to show that it does.',
        evidenceSource:
          'FDA National Drug Code directory via the openFDA NDC endpoint (marketing_category "UNAPPROVED DRUG OTHER", application_number null, for prescription and OTC phenazopyridine hydrochloride products); openFDA Drugs@FDA endpoint returns NOT_FOUND for phenazopyridine hydrochloride',
        inferredClaim:
          'That a medicine sold in every American pharmacy, on prescription and off the shelf, has been evaluated and approved — which for this molecule has never happened',
        auditFlag: 'caution',
      },
      {
        id: 'phz-a2',
        category: 'inferred',
        title:
          'The label says the mechanism is unknown and the pharmacokinetics were never determined',
        laymanSummary:
          'Two sentences in the prescribing information do the work of an entire pharmacology section: nobody knows how it works, and nobody has measured what the body does with it.',
        technicalDetails:
          'The Clinical Pharmacology section reads in full: "Phenazopyridine HCl is excreted in the urine where it exerts a topical analgesic effect on the mucosa of the urinary tract. This action helps to relieve pain, burning, urgency and frequency. The precise mechanism of action is not known. The pharmacokinetic properties of Phenazopyridine HCl have not been determined. Phenazopyridine HCl is rapidly excreted by the kidneys, with as much as 66% of an oral dose being excreted unchanged in the urine." There is no receptor, no channel, no enzyme, no half-life, no volume of distribution, no clearance and no dose-response. For a drug whose contraindication is renal insufficiency — a contraindication that depends entirely on renal handling — the absence of any pharmacokinetic characterisation is a substantive gap, not an editorial one.',
        evidenceSource:
          'Phenazopyridine hydrochloride tablets United States prescribing information, Clinical Pharmacology and Contraindications, via the openFDA drug label endpoint',
        inferredClaim:
          'That the "topical analgesic effect on the mucosa of the urinary tract" is an established mechanism, when the same paragraph states the precise mechanism is not known',
        auditFlag: 'caution',
      },
      {
        id: 'phz-a3',
        category: 'failed',
        title: 'It did not beat placebo for catheter discomfort: 0.95 cm against 0.97 cm',
        laymanSummary:
          'In a 258-patient randomised trial in women with a catheter after gynaecological surgery, pain scores on the drug and on placebo were the same to within two hundredths of a centimetre.',
        technicalDetails:
          'The CATH study randomised 258 gynaecological surgery patients 1:1 to phenazopyridine 200 mg or placebo on the same schedule, with 112 and 107 respectively contributing to the analysis. The primary outcome, reduction of catheter-associated discomfort measured as a mean visual analogue score, was 0.95 cm on the active agent against 0.97 cm on placebo, p=0.745 by two-sided t-test. Separately, a 152-patient randomised trial of phenazopyridine before the voiding trial after pelvic organ prolapse surgery found postoperative urinary retention in 30 of 72 in the phenazopyridine arm against 25 of 74 without it on intention-to-treat — numerically worse on the drug. Neither of these is the licensed indication, which is symptomatic relief in lower urinary tract irritation; both are within the label’s stated scope of "trauma, surgery, endoscopic procedures, or the passage of sounds or catheters".',
        evidenceSource:
          'CATH study, Loyola University: phenazopyridine versus placebo for catheter-associated bladder discomfort, posted results, NCT00771173; University of Massachusetts: effect of phenazopyridine on prolapse surgery voiding trials, posted results, NCT03065075',
        measuredMetric:
          'Mean visual analogue score for catheter-associated discomfort, and postoperative urinary retention rate',
        auditFlag: 'caution',
      },
      {
        id: 'phz-a4',
        category: 'failed',
        title: 'A 233-patient placebo-controlled trial finished in 2010 and never reported',
        laymanSummary:
          'A manufacturer ran a proper double-blind trial of the drug against placebo in women with urinary infection pain. It completed in December 2010. No results have ever been posted.',
        technicalDetails:
          'NCT01064024 — "A Double Blind, Randomized, Parallel Controlled Study to Evaluate the Safety and Efficacy of Phenazopyridine Hydrochloride Tablets, USP 200 mg vs. Placebo as a Urinary Analgesic for Short Term Treatment in Female Subjects Suffering From Pain or Burning When Passing Urine Associated With Uncomplicated Urinary Tract Infections", sponsored by Amneal Pharmaceuticals, enrolled 233 participants, ran from December 2009 to an actual completion date of December 2010, and is marked COMPLETED. The primary outcome was the proportion of subjects in each arm demonstrating reduction in pain or burning on passing urine at 24 and 48 hours. The registry record carries no results section. This is the single most directly relevant trial ever conducted on this drug in its principal indication, and its findings are not in the public record.',
        evidenceSource:
          'ClinicalTrials.gov registry record NCT01064024 (Amneal Pharmaceuticals, LLC), status COMPLETED, actual completion December 2010, no results posted as of August 2026',
        measuredMetric:
          'Existence and reporting status of the only registered placebo-controlled efficacy trial in the licensed indication',
        auditFlag: 'caution',
      },
      {
        id: 'phz-a5',
        category: 'measured',
        title: 'Listed as reasonably anticipated to be a human carcinogen',
        laymanSummary:
          'The National Toxicology Program has listed phenazopyridine hydrochloride as reasonably anticipated to be a human carcinogen since 1981, on the basis of bowel tumours in rats and liver tumours in mice.',
        technicalDetails:
          'The Report on Carcinogens, now in its fifteenth edition, lists phenazopyridine hydrochloride (CAS 136-40-3) as reasonably anticipated to be a human carcinogen based on sufficient evidence of carcinogenicity in experimental animals: dietary exposure caused hepatocellular adenoma and carcinoma in female mice and colorectal adenoma, adenocarcinoma or sarcoma in rats of both sexes. It was first listed in the Second Annual Report on Carcinogens in 1981. The profile states that the human epidemiological data are inadequate to evaluate the relationship between phenazopyridine exposure and human cancer — meaning the question has not been answered, not that it has been answered negatively. The drug’s own label carries the animal finding in its Carcinogenesis section: "Long-term administration of Phenazopyridine HCl has induced neoplasia in rats (large intestine) and mice (liver). Although no association between Phenazopyridine HCl and human neoplasia has been reported, adequate epidemiological studies along these lines have not been conducted." Set against a two-day course, the practical risk is likely small; set against a drug available without prescription for a recurring symptom, the absence of the epidemiology is worth naming.',
        evidenceSource:
          'National Toxicology Program, Report on Carcinogens, Fifteenth Edition (2021), profile for phenazopyridine hydrochloride, first listed in the Second Annual Report on Carcinogens (1981); phenazopyridine hydrochloride prescribing information, Carcinogenesis, Mutagenesis, Impairment of Fertility',
        measuredMetric:
          'Tumour incidence in two rodent species at two tissue sites on dietary exposure, and the resulting national listing',
        auditFlag: 'caution',
      },
      {
        id: 'phz-a6',
        category: 'measured',
        title: 'The dye breaks the test used to diagnose the infection',
        laymanSummary:
          'Phenazopyridine turns urine bright orange. The standard urine dipstick works by colour change, so the drug can make the test unreadable — for the very infection it is being taken for.',
        technicalDetails:
          'The label states under Laboratory Test Interaction: "Due to its properties as an azo dye, Phenazopyridine HCl may interfere with urinalysis based on spectrometry or color reactions." The standard reagent strip reads glucose, ketones, bilirubin, blood, nitrite and leukocyte esterase — all colour reactions — and an intensely coloured urine can obscure or falsify each of them. The clinical loop is direct: a person takes the drug for urinary burning, then produces a sample in which nitrite and leukocyte esterase, the two dipstick markers of urinary infection, cannot be reliably read. The label separately instructs that patients be told the drug produces reddish-orange discoloration of urine, may stain fabric, and has been reported to stain contact lenses, and warns that a yellowish tinge of skin or sclera may signal accumulation from impaired renal excretion.',
        evidenceSource:
          'Phenazopyridine hydrochloride tablets United States prescribing information, Precautions — General and Laboratory Test Interaction',
        measuredMetric: 'Labelled interference with spectrometric and colour-reaction urinalysis',
        auditFlag: 'verified',
      },
      {
        id: 'phz-a7',
        category: 'inferred',
        title: 'The over-the-counter cartons say more than the prescription label does',
        laymanSummary:
          'Prescription phenazopyridine is described as symptomatic relief only. Some over-the-counter packages of the same molecule carry headings like "UTI Infection Control".',
        technicalDetails:
          'The prescription label is careful: relief is symptomatic, use "should not delay definitive diagnosis and treatment of causative conditions", and administration alongside an antibacterial should not exceed two days because there is no evidence of added benefit past that point. Over-the-counter listings of the same active ingredient in the openFDA label database include products whose Uses section is headed "UTI Infection Control" alongside "temporarily relieves pain and burning". The drug has no antibacterial activity of any kind. A person reading "infection control" on a box, in a country where the underlying molecule has never been approved for anything, is being told something the prescription label of the same substance takes care not to say.',
        evidenceSource:
          'openFDA drug label endpoint — comparison of the prescription phenazopyridine hydrochloride Indications and Usage section against the Uses sections of over-the-counter phenazopyridine products',
        inferredClaim:
          'That phenazopyridine does anything to control a urinary tract infection — a claim appearing on retail packaging, absent from the prescription label, and unsupported by any antibacterial mechanism',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'It is a dye, first and last',
        laymanDesc:
          'Phenazopyridine belongs to the azo dye family — the same chemistry used to colour textiles and food. Its colour is not a side effect; it is what the molecule is.',
        molecularDetail:
          '2,6-diamino-3-(phenyldiazenyl)pyridine, C11H11N5, dispensed as the hydrochloride. The diazenyl bridge between a benzene ring and a diaminopyridine gives the intense absorbance in the visible range that makes urine orange and that interferes with every colorimetric urine assay.',
        iconName: 'Palette',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The kidney sends it out almost unchanged',
        laymanDesc:
          'Rather than being broken down, most of the dose is filtered straight into the urine — which is where it needs to be.',
        molecularDetail:
          'The label states phenazopyridine is rapidly excreted by the kidneys with as much as 66% of an oral dose appearing unchanged in the urine, and that the pharmacokinetic properties have not been determined. No half-life, clearance or volume of distribution is stated anywhere in the document.',
        iconName: 'Filter',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It acts from the urine side of the bladder wall',
        laymanDesc:
          'The effect is described as a numbing action on the lining of the urinary tract, applied from inside the urine rather than delivered by the bloodstream.',
        molecularDetail:
          'The label describes a topical analgesic effect on the mucosa of the urinary tract exerted after urinary excretion. No target has been identified and no urothelial or afferent-nerve mechanism has been demonstrated; the same sentence in the label concludes that the precise mechanism of action is not known.',
        iconName: 'Shield',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Burning eases — for about two days',
        laymanDesc:
          'Symptoms typically settle quickly. Beyond forty-eight hours, the label says there is no evidence it adds anything to the antibiotic.',
        molecularDetail:
          'The label limits combined use with an antibacterial to 2 days on the stated grounds of "a lack of evidence that the combined administration of Phenazopyridine HCl and an antibacterial provides greater benefit than administration of the antibacterial alone after 2 days". The over-the-counter directions carry the same two-day ceiling.',
        iconName: 'Clock',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Nothing happens to the bacteria',
        laymanDesc:
          'It has no antibacterial activity. The infection is unaffected; only the sensation changes.',
        molecularDetail:
          'The label states the drug provides only symptomatic relief, that prompt appropriate treatment of the cause must be instituted, and that it should be discontinued when symptoms are controlled. It describes itself as compatible with antibacterial therapy, not as a component of it.',
        iconName: 'Ban',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And the diagnostic test stops working',
        laymanDesc:
          'The orange colour swamps the dipstick, which reads infection by colour change. The drug obscures the test for the condition it is taken for.',
        molecularDetail:
          'Labelled Laboratory Test Interaction: as an azo dye it may interfere with urinalysis based on spectrometry or colour reactions — which covers nitrite and leukocyte esterase, the two dipstick markers of urinary infection, along with glucose, ketones, bilirubin and blood.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'CATH study — phenazopyridine versus placebo for catheter discomfort (NCT00771173)',
        phase: 'Randomised, double-blind, placebo-controlled',
        sampleSize: 258,
        primaryEndpoint:
          'Reduction of catheter-associated discomfort in the postoperative gynaecological patient, mean visual analogue scale in centimetres',
        endpointMet: false,
        statisticalPValue:
          '0.95 cm on phenazopyridine (n=112) against 0.97 cm on placebo (n=107), p=0.745 by two-sided t-test',
        unreportedAdverseSignals:
          '129 were randomised to each arm and 22 placebo and 17 active participants did not complete. The result is a clean null in a setting the label explicitly covers — discomfort from the passage of catheters.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'Phenazopyridine before the post-prolapse-surgery voiding trial (NCT03065075, University of Massachusetts)',
        phase: 'Randomised, controlled',
        sampleSize: 152,
        primaryEndpoint:
          'Number of participants with postoperative urinary retention after pelvic organ prolapse surgery',
        endpointMet: false,
        statisticalPValue:
          'Intention-to-treat: 30 of 72 with phenazopyridine against 25 of 74 without; as-treated: 28 of 69 against 27 of 77',
        unreportedAdverseSignals:
          'The direction of the point estimate favours no phenazopyridine on intention-to-treat. The hypothesis under test was that the drug would ease the voiding trial; the posted result does not support it.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'Phenazopyridine 200 mg versus placebo in uncomplicated urinary tract infection (NCT01064024, Amneal Pharmaceuticals)',
        phase: 'Double-blind, randomised, parallel, placebo-controlled',
        sampleSize: 233,
        primaryEndpoint:
          'Proportion of female subjects in each treatment group demonstrating reduction in pain or burning when passing urine, at 24 hours after the first dose and 48 hours after the second',
        endpointMet: false,
        statisticalPValue:
          'No results posted. The study is marked COMPLETED with an actual completion date of December 2010 and the registry record contains no results section as of August 2026',
        unreportedAdverseSignals:
          'This is the only registered placebo-controlled trial of the drug in its principal indication, and the reason its outcome is unknown is that it was never reported. An unreported trial is not a neutral absence: the direction of publication bias for a manufacturer-run study is well characterised.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'Methenamine plus methylthioninium chloride versus phenazopyridine for dysuria (NCT01657448)',
        phase: 'Randomised, active-controlled',
        sampleSize: 316,
        primaryEndpoint:
          'Efficacy of treatment in the symptomatic relief of dysuria, with phenazopyridine as the comparator arm',
        endpointMet: true,
        statisticalPValue:
          'Recorded here because of what the design implies rather than the effect size: phenazopyridine appears as the active control against which another product was tested',
        unreportedAdverseSignals:
          'Using an unapproved drug with an unknown mechanism as the reference arm builds any conclusion on an assumption that has never been tested against placebo in a reported trial.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'As much as 66% of an oral dose is excreted unchanged in the urine, per the label',
        'Mean visual analogue score for catheter-associated discomfort 0.95 cm against 0.97 cm on placebo, p=0.745 (n=258)',
        'Postoperative urinary retention 30 of 72 with phenazopyridine against 25 of 74 without, on intention-to-treat (n=152)',
        'Hepatocellular adenoma and carcinoma in female mice and colorectal tumours in rats of both sexes on dietary exposure, per the National Toxicology Program',
        'Marketing category "UNAPPROVED DRUG OTHER" with no application number for every listed product in the FDA National Drug Code directory',
      ],
      unsupportedInferences: [
        'That the drug relieves urinary pain better than placebo — the one registered trial that asked has never reported its result',
        'That the "topical analgesic effect on the mucosa" is a mechanism, when the same label paragraph says the precise mechanism is not known',
        'That it does anything to a urinary tract infection, a claim that appears on over-the-counter packaging and nowhere in the prescription label',
        'That a medicine sold in every American pharmacy has been reviewed and approved by the regulator',
      ],
      whatFailedInitially: [
        'Failed to separate from placebo for catheter-associated bladder discomfort in 258 randomised patients',
        'Did not reduce postoperative urinary retention in a 152-patient randomised trial, with the point estimate favouring the control arm',
        'Has no characterised pharmacokinetics, no identified target and no dose-response anywhere in its label',
        'Induced tumours in two rodent species at two tissue sites, and the human epidemiology to interpret that has never been conducted',
      ],
      realWorldOutcome: [
        'Sold in the United States both on prescription and over the counter without ever having been approved, under the FDA’s "unapproved drug other" category',
        'Listed since 1981 by the National Toxicology Program as reasonably anticipated to be a human carcinogen',
        'Its main practical cost in use is not toxicity but diagnostic interference: it makes the urine dipstick unreadable',
        'Both the prescription label and the retail carton cap use at two days — a limit set by the absence of evidence beyond that point, not by a safety signal',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet — 100 mg and 200 mg on prescription, 95 mg and 97.5 mg over the counter, typically three times daily after meals for no more than two days',
      description:
        'Taken with a full glass of water, with or after food. Rapidly excreted by the kidney with as much as 66% appearing unchanged in the urine; no half-life or clearance is stated because the label records that the pharmacokinetic properties have not been determined. The effect on symptoms is usually apparent within hours, and use is capped at two days when combined with an antibacterial.',
      safetyProfile:
        'Contraindicated in renal insufficiency and in prior hypersensitivity. A yellowish tinge of skin or sclera may indicate accumulation from impaired renal excretion and is a reason to stop. Produces reddish-orange discoloration of urine, may stain fabric, and has been reported to stain contact lenses. Interferes with urinalysis based on spectrometry or colour reactions. Reported adverse reactions are headache, rash, pruritus and occasional gastrointestinal upset, with an anaphylactoid-like reaction described; methaemoglobinaemia, haemolytic anaemia, and renal and hepatic toxicity have been reported, usually at overdose levels. Long-term administration induced neoplasia in rats (large intestine) and mice (liver), and the label notes that adequate human epidemiological studies have not been conducted.',
    },
    commonQuestions: [
      {
        q: 'Does this treat my urinary infection?',
        a: 'No. It has no antibacterial activity at all. It changes how the infection feels; it does nothing to the bacteria. The prescription label is explicit that the relief is symptomatic, that prompt appropriate treatment of the cause must be started, and that use of the drug "should not delay definitive diagnosis and treatment of causative conditions". Some over-the-counter cartons of the identical molecule carry headings like "UTI Infection Control", which is a claim the prescription label of the same substance carefully does not make.',
        auditNote:
          'The gap between what a prescription label may say and what a retail carton does say, for the same active ingredient, is one of the cleanest examples of regulatory asymmetry on this site.',
      },
      {
        q: 'Is this an FDA-approved medicine?',
        a: 'No. Every phenazopyridine product in the United States, prescription and over-the-counter, is listed in the FDA’s National Drug Code directory under the marketing category "unapproved drug other", with no application number. Searching Drugs@FDA for phenazopyridine hydrochloride returns nothing. The molecule predates the modern approval system and has continued to be sold without ever being required to demonstrate efficacy to the standard introduced in 1962. That is not a comment on whether it works — it is a statement that the question has never been formally answered.',
      },
      {
        q: 'Why does my urine go bright orange, and does it matter?',
        a: 'Because the drug is a dye, and most of the dose leaves in the urine unchanged. The colour matters for two practical reasons. It stains — fabric, and reportedly contact lenses, sometimes permanently. And it breaks the urine dipstick, which works by colour change: the label warns that as an azo dye it may interfere with urinalysis based on spectrometry or colour reactions. That means the test used to look for infection — nitrite and leukocyte esterase — may be unreadable in someone taking a drug for the symptoms of infection. Tell whoever takes the sample. Separately, a yellowish tinge to your skin or the whites of your eyes is not the same thing, and the label says it may mean the drug is accumulating because your kidneys are not clearing it.',
      },
      {
        q: 'Why only two days?',
        a: 'Because the label says there is no evidence of benefit beyond that. The exact wording is that treatment of a urinary tract infection with phenazopyridine should not exceed two days "because there is a lack of evidence that the combined administration of Phenazopyridine HCl and an antibacterial provides greater benefit than administration of the antibacterial alone after 2 days". It is a limit set by an absence of evidence rather than by a known harm — though the drug is also listed by the National Toxicology Program as reasonably anticipated to be a human carcinogen on animal data, which is a reason not to treat it as something to keep in a drawer and take whenever symptoms recur.',
      },
      {
        q: 'Does it actually work for the pain?',
        a: 'The honest answer is that nobody has published a trial that settles it. There is one registered double-blind placebo-controlled trial in the right population — 233 women with pain or burning from uncomplicated urinary tract infection, run by a manufacturer, completed in December 2010 — and its results have never been posted. Where the drug has been tested against placebo in adjacent situations covered by the label, it did not separate: mean pain scores for catheter-associated discomfort were 0.95 cm against 0.97 cm on placebo in 258 patients, p=0.745. Many people describe rapid relief, and that experience is real; what does not exist is the reported randomised comparison that would distinguish the drug from the natural course of a treated infection plus expectation.',
        auditNote:
          'A completed trial with no posted results is the strongest single fact on this page. It means the measurement exists and the public cannot see it.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Phenazopyridine hydrochloride tablets United States prescribing information — Indications and Usage, Clinical Pharmacology (mechanism not known; pharmacokinetics not determined; 66% excreted unchanged), Contraindications (renal insufficiency), Precautions (Laboratory Test Interaction; Carcinogenesis), Adverse Reactions, Dosage and Administration, via the openFDA drug label endpoint',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22phenazopyridine+hydrochloride%22',
        kind: 'regulatory',
      },
      {
        label:
          'FDA National Drug Code directory — phenazopyridine hydrochloride products listed with marketing category "UNAPPROVED DRUG OTHER" and no application number, prescription and over-the-counter',
        identifier:
          'https://api.fda.gov/drug/ndc.json?search=generic_name:%22phenazopyridine%20hydrochloride%22',
        kind: 'regulatory',
      },
      {
        label:
          'National Toxicology Program, Report on Carcinogens, Fifteenth Edition — Phenazopyridine Hydrochloride (CAS 136-40-3), listed as reasonably anticipated to be a human carcinogen; first listed in the Second Annual Report on Carcinogens (1981)',
        identifier: 'https://www.ncbi.nlm.nih.gov/books/NBK590835/',
        kind: 'url',
      },
      {
        label:
          'CATH study — phenazopyridine versus placebo for catheter-associated bladder discomfort after gynaecological surgery, Loyola University, posted results',
        identifier: 'NCT00771173',
        kind: 'nct',
      },
      {
        label:
          'Effect of phenazopyridine on prolapse surgery voiding trials, University of Massachusetts, posted results',
        identifier: 'NCT03065075',
        kind: 'nct',
      },
      {
        label:
          'Phenazopyridine hydrochloride 200 mg versus placebo in uncomplicated urinary tract infection, Amneal Pharmaceuticals — completed December 2010, no results posted',
        identifier: 'NCT01064024',
        kind: 'nct',
      },
      {
        label:
          'Methenamine plus methylthioninium chloride versus phenazopyridine for symptomatic control of dysuria',
        identifier: 'NCT01657448',
        kind: 'nct',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — phenazopyridine hydrochloride, 19 listed products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 4756 — phenazopyridine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4756',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 6. Potassium citrate — a drug whose own Clinical Studies section opens by warning that its
  //    pivotal trials were uncontrolled and "may overstate the effectiveness of the product".
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'potassium-citrate',
    name: 'Potassium Citrate',
    tradeName: 'Urocit-K / Potassium Citrate Extended-Release',
    sponsor: 'Mission Pharmacal Company (holder of NDA 019071), with several generic manufacturers',
    targetGene:
      'No gene target — the drug acts by changing urine chemistry, not by binding a protein',
    targetProtein:
      'None. Absorbed citrate is metabolised to bicarbonate, producing an alkali load that raises urinary pH and urinary citrate; the label attributes the citrate rise principally to modified renal handling of citrate rather than to an increased filtered load',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1985,
    indication:
      'Management of renal tubular acidosis with calcium stones; hypocitraturic calcium oxalate nephrolithiasis of any aetiology; and uric acid lithiasis with or without calcium stones',
    patientFriendlyIndication: 'Preventing kidney stones from coming back',
    anatomicalSite:
      'The urine itself, in the renal tubule and collecting system — this is a solubility drug, not a receptor drug',
    conditionContext: {
      conditionExplainer:
        'A kidney stone forms when the urine holds more of a salt than it can keep dissolved. Citrate is the body’s natural defence: it binds calcium in urine so the calcium is not available to pair with oxalate, and it blocks crystals from nucleating and growing. People who form calcium stones often have low urinary citrate. Raising urine pH separately makes uric acid far more soluble, because it converts uric acid into the urate ion.',
      whyItMatters:
        'The label of this drug does something almost no other label does: its Clinical Studies section begins by telling the reader that the pivotal trials were non-randomised, non-placebo-controlled, confounded with simultaneous diet change, and that the results "may overstate the effectiveness of the product". A regulator forced that sentence onto the page. It is the clearest example on this site of a label auditing itself.',
      whoTakesThis:
        'Adults who form calcium oxalate or uric acid stones, usually with a documented low urinary citrate on a 24-hour collection. Contraindicated in hyperkalaemia or anything predisposing to it, in renal insufficiency, in peptic ulcer disease, in anything delaying tablet transit, and in active urinary tract infection.',
      clinicalGoals:
        'Urinary citrate above 320 mg/day and as close to 640 mg/day as possible, with urine pH of 6.0 to 7.0, per the label’s stated objective — alongside a urine volume of at least two litres a day and salt restriction, which are part of the same instruction and are not optional extras.',
    },
    oneSentenceVerdict:
      'An alkalinising potassium salt that raises urinary citrate and pH, whose FDA label states its own pivotal trials were non-randomised, non-placebo-controlled and confounded by simultaneous dietary change and therefore "may overstate the effectiveness of the product" — with the randomised evidence amounting to a Cochrane review of seven small trials in 477 people that found new stone formation reduced (RR 0.26, 95% CI 0.10 to 0.68) on moderate-to-poor quality data, and dropouts for adverse events increased more than fourfold.',
    laymanHowItWorks:
      'Citrate is the substance your urine uses to keep calcium in solution: it grabs calcium so that calcium cannot pair up with oxalate and start a stone. People who form stones often do not have enough of it. Swallowed potassium citrate is absorbed and burned to bicarbonate, which makes your blood and then your urine slightly more alkaline — and that alkalinity is what makes your kidney hold back citrate instead of consuming it, so more citrate ends up in the urine. The same rise in pH turns uric acid into a much more soluble form, which is why the drug treats two very different kinds of stone by one change.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 58,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1798 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 24 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States in 1985 under NDA 019071 and long generic. The active ingredient is potassium citrate, a commodity food additive sold by the kilogram; what is being paid for in the prescription product is the wax-matrix extended-release tablet, which exists because immediate-release potassium salts caused ulcerative and stenotic bowel lesions. The formulation is the invention, not the molecule.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'For stone prevention, the intervention with the strongest randomised evidence is not a drug: it is fluid. Everything else, including this drug, is layered on top of a urine volume target the label states explicitly. Where a drug is added, the honest comparison is against a thiazide for calcium stones, against allopurinol for uric acid stones, and against sodium bicarbonate for alkalinisation alone.',
      conventionalRx: [
        {
          name: 'A thiazide diuretic — hydrochlorothiazide, chlortalidone or indapamide',
          class: 'Thiazide and thiazide-like diuretic',
          howItCompares:
            'Attacks a different variable: it lowers urinary calcium rather than raising urinary citrate, and is the standard drug where hypercalciuria is the abnormality on the 24-hour collection. The two are often combined, and the label of this drug describes concomitant thiazide use in its own study populations.',
          typicalCost: 'Among the cheapest prescription drugs in the United States',
          prosAndCons:
            'Pros: targets the calcium side of the equation; very cheap. Cons: causes hypokalaemia, which lowers urinary citrate — the exact abnormality this drug is treating, which is one reason the two are given together.',
        },
        {
          name: 'Allopurinol',
          class: 'Xanthine oxidase inhibitor',
          howItCompares:
            'For uric acid stones and for hyperuricosuric calcium oxalate stones, allopurinol reduces the amount of urate produced rather than making the urine better at dissolving it. Its own label carries an indication for recurrent calcium oxalate calculi where daily uric acid excretion exceeds 800 mg in men or 750 mg in women. At US$0.0546 a tablet it is a third the price of potassium citrate.',
          typicalCost:
            'US$0.0546 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 87 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: a third of the price; addresses production rather than solubility; no potassium load. Cons: the HLA-B*58:01 severe skin reaction; does nothing for hypocitraturia.',
        },
        {
          name: 'Sodium bicarbonate',
          class: 'Alkalinising salt without the potassium',
          howItCompares:
            'Raises urine pH by the same final mechanism and is what the probenecid label specifies as an alternative to potassium citrate for alkalinisation. The label of this drug notes that in small comparisons of oral citrate against oral bicarbonate, citrate had a greater effect on urinary citrate — a real but modest distinction. The decisive difference is the cation: sodium raises urinary calcium, which is the wrong direction for a calcium stone former.',
          typicalCost: 'Among the least expensive substances in a pharmacy',
          prosAndCons:
            'Pros: no potassium load, so usable where hyperkalaemia is a concern. Cons: the sodium load raises urinary calcium and is unwanted in hypertension and heart failure.',
        },
      ],
      naturalFoods: [
        {
          name: 'Water — the intervention the label itself prescribes first',
          activeCompound: 'None; the mechanism is dilution below the saturation threshold',
          biologicalMechanism:
            'Every stone is a solubility failure. Raising urine volume lowers the concentration of every stone-forming salt simultaneously, which no drug does. The label’s dosing section opens by stating that treatment should be added to a regimen that limits salt intake and encourages high fluid intake, with urine volume of at least two litres per day.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage:
            'Not stated here as advice. The label’s stated target is a urine output of at least two litres a day, and it presents this as the base on which drug treatment is added rather than as an alternative to it.',
          monthlyCost: '',
        },
        {
          name: 'Citrus juice — lemonade and orange juice',
          activeCompound: 'Citric acid, delivered as the potassium or sodium salt after metabolism',
          biologicalMechanism:
            'Dietary citrate raises urinary citrate by the same route as the drug. The cation matters: orange juice delivers citrate largely as the potassium salt and produces an alkali load, while lemon juice carries citrate mostly as the free acid, which raises urinary citrate less reliably per unit of citrate.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: no randomised trial of citrus juice with stone recurrence as the endpoint appears in the Cochrane review of citrate salts, which included seven trials of pharmaceutical citrate preparations totalling 477 participants and no juice study.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Take it with food, and never crush or chew it',
          action:
            'Take each dose with meals or within 30 minutes after a meal or bedtime snack, and swallow the tablet whole.',
          patientImpact:
            'The label’s dosing instructions specify administration with or shortly after food. The reason is in Warnings section 5.2: solid potassium dosage forms have produced stenotic and ulcerative lesions of the small bowel and deaths, caused by a high local concentration of potassium ions where the tablet dissolves. Crushing a wax-matrix tablet defeats the only thing protecting the bowel.',
          clinicalPrecaution:
            'The label directs immediate discontinuation and investigation for bowel perforation or obstruction if there is severe vomiting, abdominal pain or gastrointestinal bleeding.',
        },
        {
          name: 'Know your potassium status before you start',
          action:
            'Say if you have kidney disease, uncontrolled diabetes, adrenal insufficiency, heart failure, or take spironolactone, triamterene or amiloride.',
          patientImpact:
            'Section 5.1 states that in patients with impaired potassium excretion, this drug can produce hyperkalaemia and cardiac arrest, and that potentially fatal hyperkalaemia can develop rapidly and be asymptomatic. Each of the listed conditions is a formal contraindication, not a caution.',
          clinicalPrecaution:
            'The label directs monitoring of serum electrolytes, creatinine and full blood count every four months, with periodic electrocardiograms, and discontinuation for hyperkalaemia, a significant creatinine rise, or a significant fall in haematocrit or haemoglobin.',
        },
        {
          name: 'Do not start it during a urinary infection',
          action: 'Report any current urinary tract infection before starting.',
          patientImpact:
            'Active urinary tract infection is a contraindication. The label gives two reasons: bacterial enzymatic degradation of citrate can blunt the rise in urinary citrate, and the rise in urine pH the drug produces may promote further bacterial growth.',
          clinicalPrecaution:
            'This matters most with urea-splitting organisms and struvite stones, where alkaline urine is part of the disease rather than part of the treatment.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'generic_formula',
      chemicalFormula: 'K3C6H5O7 · H2O (potassium citrate monohydrate)',
      molecularWeight: '324.41 g/mol as the monohydrate',
      targetReceptorAffinity:
        'There is no receptor and therefore no affinity. Potassium citrate is a fully dissociated salt whose therapeutic action is a change in the composition of a fluid. The label describes the sequence: absorbed citrate is metabolised to produce an alkaline load; that load raises urinary pH and raises urinary citrate by augmenting citrate clearance without measurably altering ultrafilterable serum citrate; increased urinary citrate complexes calcium and lowers calcium ion activity and calcium oxalate saturation; citrate also inhibits spontaneous nucleation of calcium oxalate and of calcium phosphate (brushite); and the rise in pH increases ionisation of uric acid to the more soluble urate ion. The label also records what the drug does not do: urinary saturation of calcium phosphate is unchanged, because increased citrate complexation of calcium is opposed by the pH-dependent dissociation of phosphate, and calcium phosphate stones are more stable in alkaline urine.',
      structureSource: {
        label:
          'UROCIT-K prescribing information, section 11 Description (empirical formula K3C6H5O7 · H2O) and section 12 Clinical Pharmacology; molecular weight from PubChem CID 2735208, potassium citrate monohydrate. No SMILES is carried on the enriched record for this salt and none is invented here',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2735208',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'kcit-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the salt stoichiometry and the water of hydration',
          description:
            'The product is dosed in milliequivalents of potassium, not milligrams of citrate, so the assay that matters is potassium content per tablet and the tripotassium-to-citrate ratio. The monohydrate water is part of the formula weight and a batch that has lost or gained water is a batch with the wrong dose.',
          reagentsAndBuffer:
            'Potassium citrate monohydrate reference standard, flame photometry or ICP-OES for potassium content, ion chromatography for citrate, Karl Fischer titration for water, loss on drying, residue on ignition',
        },
        {
          id: 'kcit-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Neutralise citric acid with potassium carbonate and crystallise',
          description:
            'This is not a synthesis in the medicinal-chemistry sense. Citric acid, a bulk fermentation product, is neutralised to the tripotassium salt and crystallised. It is a commodity food additive; the pharmaceutical value added is entirely downstream of this step.',
          dependsOnStepId: 'kcit-w1',
          reagentsAndBuffer:
            'Food-grade citric acid, potassium carbonate or potassium hydroxide to a defined endpoint pH, controlled evaporative crystallisation to the monohydrate, drying to a specified water content',
        },
        {
          id: 'kcit-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Build and verify the wax matrix, which is the actual drug product',
          description:
            'The entire safety case for an oral potassium salt rests on not releasing a bolus of potassium ion against a patch of bowel wall. The wax matrix is what prevents that, and its release profile is the release-critical attribute. A tablet that meets assay and fails dissolution is a hazard, not a variance.',
          dependsOnStepId: 'kcit-w2',
          reagentsAndBuffer:
            'Carnauba wax and magnesium stearate as in the reference product, compression to a defined hardness and friability, USP dissolution apparatus with potassium quantification over the full release window, comparison against the reference listed drug profile',
        },
        {
          id: 'kcit-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Measure urinary citrate and pH, not serum citrate',
          description:
            'The label states the drug raises urinary citrate without measurably altering ultrafilterable serum citrate, which means a serum measurement will show nothing and a urine measurement will show everything. Any pharmacodynamic study that samples blood is measuring the wrong compartment.',
          dependsOnStepId: 'kcit-w3',
          reagentsAndBuffer:
            'Timed 24-hour urine collections with enzymatic citrate assay, urine pH by electrode rather than dipstick, paired ultrafilterable serum citrate as a negative control, creatinine normalisation, sampling across the circadian cycle to capture the flattening of the normal citrate rhythm',
        },
        {
          id: 'kcit-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Count stones, randomised, against a control that also drinks',
          description:
            'The label’s own warning names the flaw to design out: its pivotal studies were non-randomised and non-placebo-controlled, and dietary management changed at the same time as the drug started. A trial that separates the drug from the fluid and salt advice given alongside it is the missing measurement, and it is the trial the Cochrane review explicitly called for.',
          dependsOnStepId: 'kcit-w4',
          reagentsAndBuffer:
            'Randomised allocation with a placebo wax-matrix tablet, standardised fluid and sodium advice given identically to both arms, protocol imaging at fixed intervals to distinguish new stones from pre-existing ones, stone events and retreatment as prespecified endpoints, intention-to-treat analysis with dropout for adverse events reported separately',
        },
      ],
    },
    keyAudits: [
      {
        id: 'kcit-a1',
        category: 'inferred',
        title: 'The label warns that its own pivotal trials may overstate the drug',
        laymanSummary:
          'Section 14 of the prescribing information opens by saying the studies it is about to describe were not randomised, had no placebo group, changed the patients’ diets at the same time, and may therefore make the drug look better than it is.',
        technicalDetails:
          'The Clinical Studies section begins: "The pivotal Urocit-K trials were non-randomized and non-placebo controlled where dietary management may have changed coincidentally with pharmacological treatment. Therefore, the results as presented in the following sections may overstate the effectiveness of the product." What follows is exactly that. The renal tubular acidosis study enrolled nine patients — five men and four women — and reported stone formation falling from 13 ± 27 to 1 ± 2 per year with a 67% remission rate on the most conservative assumption. The hypocitraturic nephrolithiasis study enrolled 89 patients across four heterogeneous groups, some receiving concomitant thiazide or allopurinol, followed for one to 4.33 years against a three-year retrospective pre-study history. The uric acid study enrolled 18 patients, seven of whom also received allopurinol or a thiazide. A before-and-after comparison in nine people, with diet changed at the same time and other drugs added, is the design that produces the largest effect sizes in medicine and the least reliable ones.',
        evidenceSource:
          'UROCIT-K (potassium citrate extended-release tablets) United States prescribing information, section 14 Clinical Studies, subsections 14.1, 14.2 and 14.3 (NDA 019071)',
        inferredClaim:
          'That the stone-rate reductions reported in the label’s own studies are attributable to the drug, when the label states the studies were uncontrolled and confounded by simultaneous dietary change',
        auditFlag: 'caution',
      },
      {
        id: 'kcit-a2',
        category: 'measured',
        title: 'The randomised evidence: seven trials, 477 people, moderate to poor quality',
        laymanSummary:
          'A Cochrane review pooled every randomised trial of citrate salts for calcium stones. It found fewer new stones — but across seven small studies of limited quality, and with more people dropping out for side effects.',
        technicalDetails:
          'The 2015 Cochrane review included seven randomised controlled trials with 477 participants in total, most with oxalate stones: three of potassium citrate against placebo or no intervention (247 participants), three of potassium-sodium citrate against no intervention (166), and one of potassium-magnesium citrate against placebo (64). New stone formation was lower with citrate (7 studies, 324 participants, RR 0.26, 95% CI 0.10 to 0.68), stone size reduction was more frequent (4 studies, 160 participants, RR 2.35, 95% CI 1.36 to 4.05), stone size stability more frequent (RR 1.97, 95% CI 1.19 to 3.26), and the need for retreatment lower (2 studies, 157 participants, RR 0.22, 95% CI 0.06 to 0.89). Against that: dropouts due to adverse events were more than four times as frequent on citrate (4 studies, 271 participants, RR 4.45, 95% CI 1.28 to 15.50), gastrointestinal adverse events were more frequent but not significantly so (RR 2.55, 95% CI 0.71 to 9.16), the reviewers rated reporting quality moderate to poor with high risk of attrition bias in two studies, and their conclusion called for "a well-designed statistically powered multi-centre RCT". The largest single randomised trial in the set enrolled 57 patients.',
        evidenceSource:
          'Phillips R, Hanchanale VS, Myatt A, Somani B, Nabi G. Citrate salts for preventing and treating calcium containing kidney stones in adults. Cochrane Database Syst Rev 2015;(10):CD010057',
        doi: '10.1002/14651858.CD010057.pub2',
        measuredMetric:
          'Pooled relative risk of new stone formation, and of dropout for adverse events, against placebo or no intervention',
        auditFlag: 'verified',
      },
      {
        id: 'kcit-a3',
        category: 'measured',
        title: 'The one properly randomised trial: 57 patients, and it worked',
        laymanSummary:
          'A double-blind randomised trial in 57 stone formers with low urinary citrate found stone formation fell from 1.2 to 0.1 per patient-year on the drug and did not change at all on placebo.',
        technicalDetails:
          'Fifty-seven patients with active lithiasis — two or more stones in the preceding two years — and hypocitraturia were randomised double-blind to 30 to 60 mEq potassium citrate daily in wax-matrix tablets or to placebo. In the 18 patients who took potassium citrate for three years, stone formation fell from 1.2 ± 0.6 to 0.1 ± 0.2 per patient-year (p<0.0001), with 13 of 18 (72%) in remission and every patient showing an individual reduction. In the 20 patients on placebo for three years, the rate was unchanged at 1.1 ± 0.4 to 1.1 ± 0.3 per patient-year, with 4 of 20 (20%) in remission. The between-group difference on treatment was 0.1 ± 0.2 against 1.1 ± 0.3 (p<0.001). Urinary citrate, pH and potassium rose on drug and not on placebo. Two patients on drug and one on placebo withdrew for adverse reactions. This is a real, clean, positive randomised result — and it is one trial of 57 patients, of whom 38 completed three years, which is the entire high-quality evidence base for a drug approved in 1985.',
        evidenceSource:
          'Barcelo P, Wuhl O, Servitge E, Rousaud A, Pak CY. Randomized double-blind study of potassium citrate in idiopathic hypocitraturic calcium nephrolithiasis. J Urol 1993;150:1761-1764',
        doi: '10.1016/s0022-5347(17)35888-3',
        measuredMetric:
          'Stone formation rate per patient-year on potassium citrate against placebo over three years',
        auditFlag: 'verified',
      },
      {
        id: 'kcit-a4',
        category: 'failed',
        title:
          'The definitive trial was registered, enrolled 2,001 people, and its status is unknown',
        laymanSummary:
          'Cochrane asked for a large, properly powered randomised trial. One was registered in 2016 with a planned enrolment of 2,001 patients. The registry has listed its status as "unknown" ever since.',
        technicalDetails:
          'NCT03007160, "A Randomized, Blank Controlled, Multicenter Clinical Trial of the Effection of Potassium Citrate Extended-release Tablets on Urolithiasis Formation or Recurrence", registered with a planned enrolment of 2,001 participants and a primary outcome of rate of urolithiasis recurrence, carries the ClinicalTrials.gov status UNKNOWN — meaning the record has passed its expected completion date without the sponsor updating it. Its planned enrolment is more than four times the total of every randomised participant in the Cochrane review combined. The design descriptor "blank controlled" also matters: an untreated rather than placebo control cannot separate the drug from the fluid and dietary advice that accompanies it, which is precisely the confounder the FDA label warns about in its own studies. Forty years after approval, the trial that would settle this drug has been designed, registered, and not reported.',
        evidenceSource:
          'ClinicalTrials.gov registry record NCT03007160, planned enrolment 2,001, overall status UNKNOWN as of August 2026',
        measuredMetric:
          'Reporting status of the only registered trial large enough to answer the question the Cochrane review posed',
        auditFlag: 'caution',
      },
      {
        id: 'kcit-a5',
        category: 'measured',
        title: 'The label states what the drug does not fix',
        laymanSummary:
          'Alkaline urine helps dissolve uric acid and helps calcium oxalate. It does the opposite for calcium phosphate stones, and the label says so.',
        technicalDetails:
          'Section 12 states: "Urocit-K therapy does not alter the urinary saturation of calcium phosphate, since the effect of increased citrate complexation of calcium is opposed by the rise in pH-dependent dissociation of phosphate. Calcium phosphate stones are more stable in alkaline urine." This is a genuine limitation stated plainly, and it has a practical consequence that the indication wording does not carry: the drug is indicated for calcium oxalate and uric acid stones, and a person whose stones are calcium phosphate is taking a drug that makes their urine chemistry no better and their stone type more stable. Stone composition analysis, not the fact of having had a stone, is what determines whether this drug is the right one.',
        evidenceSource:
          'UROCIT-K prescribing information, section 12 Clinical Pharmacology (NDA 019071)',
        measuredMetric:
          'Effect of the drug on urinary calcium phosphate saturation, from the label’s pharmacology section',
        auditFlag: 'verified',
      },
      {
        id: 'kcit-a6',
        category: 'measured',
        title: 'The formulation exists because the immediate-release version killed people',
        laymanSummary:
          'Solid potassium tablets have caused ulcers and strictures of the small bowel, and deaths, by dissolving into a concentrated spot against the bowel wall. The wax matrix is the fix, and the label expects the same rate of injury.',
        technicalDetails:
          'Section 5.2 records that solid dosage forms of potassium chlorides have produced stenotic and ulcerative lesions of the small bowel and deaths, caused by a high local concentration of potassium ions where the tablet dissolves, and that wax-matrix preparations, not being enteric-coated, have been associated with upper gastrointestinal bleeding from potassium released in the stomach. It puts the frequency of gastrointestinal lesions with wax-matrix potassium chloride products at approximately one per 100,000 patient-years, states that experience with this product is limited, and instructs that a similar frequency should be anticipated. That last clause is an inference carried forward from a different potassium salt, stated as such. The directions to take the tablet with or shortly after food, and never to crush it, follow directly from this mechanism.',
        evidenceSource:
          'UROCIT-K prescribing information, section 5.2 Gastrointestinal Lesions and section 2.1 Dosing Instructions (NDA 019071)',
        measuredMetric:
          'Estimated frequency of gastrointestinal lesions with wax-matrix potassium products, per the label',
        auditFlag: 'caution',
      },
      {
        id: 'kcit-a7',
        category: 'conclusion_shift',
        title: 'The same substance is a prescription drug and a supermarket food additive',
        laymanSummary:
          'Potassium citrate is E332, used to stabilise processed foods, and is sold as a dietary supplement. The prescription version has five contraindications and requires blood tests every four months.',
        technicalDetails:
          'The active ingredient is a bulk food additive produced by neutralising fermentation-derived citric acid. The prescription product differs from a supplement in dose, in release profile and in supervision — and the label makes all three consequential. It is contraindicated in hyperkalaemia and in every condition predisposing to it, in impaired tablet transit, in peptic ulcer disease, in active urinary tract infection, and in renal insufficiency below a glomerular filtration rate of 0.7 mL/kg/min. It directs monitoring of electrolytes, creatinine and full blood count every four months with periodic electrocardiograms. Section 5.1 states that potentially fatal hyperkalaemia can develop rapidly and be asymptomatic. A person taking a potassium citrate supplement for stones is taking the same ion without any of that structure, and the group most likely to reach for one — people with recurrent stones — overlaps substantially with the group in whom kidney function is already reduced.',
        evidenceSource:
          'UROCIT-K prescribing information, sections 4 Contraindications, 5.1 Hyperkalemia and 2.1 Dosing Instructions (monitoring schedule), NDA 019071',
        inferredClaim:
          'That a potassium citrate supplement is equivalent to the prescription product because the molecule is identical — which ignores dose, release profile, the contraindication list and the monitoring the label requires',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed as a salt, absorbed as citrate',
        laymanDesc:
          'The tablet releases potassium citrate slowly along the gut. The wax matrix is there so that no single stretch of bowel meets a concentrated dose of potassium.',
        molecularDetail:
          'Potassium citrate monohydrate, K3C6H5O7 · H2O, in a wax-matrix extended-release tablet of 5, 10 or 15 mEq of potassium, with carnauba wax and magnesium stearate as the release-controlling excipients. Dosing is expressed in milliequivalents of potassium rather than milligrams of salt.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Citrate is burned to bicarbonate, producing an alkali load',
        laymanDesc:
          'The body metabolises citrate almost immediately, and the product of that metabolism is alkali. That alkali, not the citrate you swallowed, is what drives everything downstream.',
        molecularDetail:
          'The label states that metabolism of absorbed citrate produces an alkaline load, which in turn raises urinary pH and raises urinary citrate by augmenting citrate clearance, without measurably altering ultrafilterable serum citrate. The rise in urinary citrate is therefore principally a change in renal handling, not a change in filtered load.',
        iconName: 'Flame',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The kidney stops consuming citrate and lets it through',
        laymanDesc:
          'In acid conditions the kidney reabsorbs and burns citrate. Make the body slightly alkaline and it lets citrate pass into the urine instead.',
        molecularDetail:
          'Urinary citrate rises within the first hour after a single dose and the effect lasts about 12 hours; with repeated dosing the rise peaks by the third day and flattens the normally wide circadian fluctuation, holding urinary citrate at a higher and more constant level through the day. Urinary potassium rises by approximately the amount contained in the medication, and some patients show a transient fall in urinary calcium.',
        iconName: 'Filter',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Citrate ties up calcium and blocks crystal nucleation',
        laymanDesc:
          'Citrate in the urine grabs calcium so it cannot pair with oxalate, and separately stops new crystals from forming in the first place.',
        molecularDetail:
          'Increased urinary citrate complexes calcium, decreasing calcium ion activity and calcium oxalate saturation; citrate additionally inhibits spontaneous nucleation of calcium oxalate and of calcium phosphate as brushite. The higher pH independently lowers calcium ion activity by increasing complexation of calcium to dissociated anions.',
        iconName: 'Link',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'And uric acid becomes a far more soluble ion',
        laymanDesc:
          'Uric acid barely dissolves; the urate form dissolves easily. Raising urine pH converts one into the other, which is why the same tablet treats uric acid stones.',
        molecularDetail:
          'The rise in urinary pH increases ionisation of uric acid to the more soluble urate ion. This is the entire mechanism for the uric acid lithiasis indication and it is independent of the citrate-calcium chemistry that drives the calcium oxalate indication.',
        iconName: 'Droplet',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What the label says does not change',
        laymanDesc:
          'Calcium phosphate saturation is unaffected, and calcium phosphate stones are actually more stable in alkaline urine. Stone type decides whether this drug is right.',
        molecularDetail:
          'Section 12: urinary saturation of calcium phosphate is unaltered because increased citrate complexation of calcium is opposed by pH-dependent dissociation of phosphate, and calcium phosphate stones are more stable in alkaline urine. The drug therefore has one clearly stated population in which its central mechanism cuts the wrong way.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'Barcelo P et al., J Urol 1993;150:1761-1764 — randomised double-blind potassium citrate against placebo',
        phase: 'Randomised, double-blind, placebo-controlled',
        sampleSize: 57,
        primaryEndpoint:
          'Stone formation rate per patient-year in patients with active lithiasis and hypocitraturia, over three years',
        endpointMet: true,
        statisticalPValue:
          '1.2 ± 0.6 to 0.1 ± 0.2 per patient-year on potassium citrate (n=18, p<0.0001) against 1.1 ± 0.4 to 1.1 ± 0.3 on placebo (n=20); between-group p<0.001; remission 72% against 20%',
        unreportedAdverseSignals:
          'Fifty-seven were randomised and 38 completed three years, so a third of the cohort is not represented in the headline comparison. Two patients on drug and one on placebo withdrew for adverse reactions. This single trial carries most of the high-quality evidence for the drug.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId:
          'Cochrane systematic review of citrate salts for calcium-containing kidney stones (CD010057, 2015)',
        phase: 'Systematic review and meta-analysis of seven randomised controlled trials',
        sampleSize: 477,
        primaryEndpoint:
          'New stone formation, stone size and adverse events with citrate salts against placebo or no intervention, minimum six months of treatment',
        endpointMet: true,
        statisticalPValue:
          'New stone formation RR 0.26 (95% CI 0.10 to 0.68, 7 studies, 324 participants); stone size reduction RR 2.35 (1.36 to 4.05); retreatment RR 0.22 (0.06 to 0.89)',
        unreportedAdverseSignals:
          'Dropouts due to adverse events were more than fourfold higher on citrate: RR 4.45 (95% CI 1.28 to 15.50). Reporting quality was rated moderate to poor with high risk of attrition bias in two studies, and three of the seven trials used no intervention rather than placebo as the comparator. The authors called for a well-designed, statistically powered multicentre randomised trial.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'UROCIT-K pivotal studies, sections 14.1, 14.2 and 14.3 of the label (NDA 019071)',
        phase: 'Non-randomised, non-placebo-controlled, before-and-after',
        sampleSize: 116,
        primaryEndpoint:
          'Stone formation rate and remission in renal tubular acidosis with calcium stones (n=9), hypocitraturic calcium oxalate nephrolithiasis (n=89) and uric acid lithiasis (n=18)',
        endpointMet: true,
        statisticalPValue:
          'Renal tubular acidosis cohort: stone formation 13 ± 27 to 1 ± 2 per year over the first two years, remission 67% on the most conservative assumption',
        unreportedAdverseSignals:
          'The label prefaces all three studies with a statement that they were non-randomised and non-placebo-controlled, that dietary management may have changed coincidentally with treatment, and that the results "may overstate the effectiveness of the product". Patients were compared against their own retrospective three-year history, some received concomitant thiazide or allopurinol, and dietary sodium, oxalate and calcium were restricted at the same time as the drug was started.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'Potassium citrate extended-release tablets and urolithiasis recurrence (NCT03007160)',
        phase: 'Randomised, blank-controlled, multicentre',
        sampleSize: 2001,
        primaryEndpoint: 'Rate of urolithiasis formation or recurrence',
        endpointMet: false,
        statisticalPValue:
          'No results. The registry record has carried overall status UNKNOWN since passing its expected completion date',
        unreportedAdverseSignals:
          'Planned enrolment exceeds four times the combined total of every randomised participant in the Cochrane review. A "blank control" — untreated rather than placebo — cannot separate the drug from the fluid and dietary advice given alongside it, which is the confounder the FDA label names in its own studies.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Stone formation 1.2 to 0.1 per patient-year on drug against 1.1 to 1.1 on placebo in a 57-patient randomised double-blind trial (p<0.001 between groups)',
        'Pooled new stone formation RR 0.26 (95% CI 0.10 to 0.68) across seven randomised trials totalling 477 participants',
        'Dropout for adverse events RR 4.45 (95% CI 1.28 to 15.50) on citrate against control',
        'Urinary citrate rises within the first hour of a dose, peaks by day three of repeated dosing, and flattens the normal circadian fluctuation',
        'Urinary saturation of calcium phosphate is unchanged by the drug, per the label',
      ],
      unsupportedInferences: [
        'That the stone-rate reductions in the label’s own pivotal studies are attributable to the drug — the label itself says they may overstate its effectiveness',
        'That the benefit is separable from the two-litre urine volume and salt restriction the label prescribes alongside it, which no randomised trial has isolated',
        'That the wax-matrix gastrointestinal injury rate is one per 100,000 patient-years for this product, a figure the label carries over from potassium chloride and instructs be anticipated',
        'That a potassium citrate supplement is equivalent to the prescription product, which differs in dose, release profile, contraindications and monitoring',
      ],
      whatFailedInitially: [
        'The pivotal trials were uncontrolled, before-and-after, confounded by simultaneous diet change and by concomitant thiazide and allopurinol in some patients',
        'The Cochrane review rated the reporting quality of every randomised trial as moderate to poor, with high attrition-bias risk in two',
        'The 2,001-patient trial that would settle the question has carried registry status UNKNOWN since passing its completion date',
        'The drug does not improve calcium phosphate saturation, and calcium phosphate stones are more stable in the alkaline urine it produces',
      ],
      realWorldOutcome: [
        'Approved in 1985 under NDA 019071 and long generic, at about eighteen United States cents a tablet at pharmacy acquisition cost',
        'Recommended in stone-prevention guidelines on the strength of an evidence base whose largest randomised trial enrolled 57 patients',
        'Carries five formal contraindications and a four-monthly blood-test and periodic ECG monitoring schedule, unusual for a drug people think of as a salt',
        'The same molecule is a food additive and a supplement, which is where most of the confusion about it starts',
      ],
    },
    deliverySystem: {
      type: 'Oral wax-matrix extended-release tablet of 5 mEq (540 mg), 10 mEq (1,080 mg) or 15 mEq (1,620 mg) potassium citrate, taken two or three times daily with meals or within 30 minutes after a meal or bedtime snack',
      description:
        'The wax matrix exists to prevent a high local potassium concentration against the bowel wall and is the reason the tablet must be swallowed whole. Urinary citrate begins to rise within the first hour of a dose and the effect lasts about 12 hours; with repeated dosing the effect peaks by the third day. The label’s dosing target is urinary citrate above 320 mg/day, ideally near 640 mg/day, with urine pH 6.0 to 7.0, and it directs that treatment be added to a regimen limiting salt intake and achieving a urine volume of at least two litres per day. Doses above 100 mEq/day have not been studied and should be avoided.',
      safetyProfile:
        'Contraindicated in hyperkalaemia or any condition predisposing to it — chronic renal failure, uncontrolled diabetes, acute dehydration, strenuous exercise in unconditioned individuals, adrenal insufficiency, extensive tissue breakdown, or a potassium-sparing agent such as triamterene, spironolactone or amiloride — because a further rise in serum potassium may produce cardiac arrest. Also contraindicated where tablet passage may be arrested or delayed, in peptic ulcer disease, in active urinary tract infection, and in renal insufficiency below a glomerular filtration rate of 0.7 mL/kg/min. Potentially fatal hyperkalaemia can develop rapidly and be asymptomatic. Solid potassium dosage forms have caused stenotic and ulcerative small-bowel lesions and deaths; discontinue immediately and investigate for perforation or obstruction if there is severe vomiting, abdominal pain or gastrointestinal bleeding. Monitor serum electrolytes, creatinine and full blood count every four months with periodic electrocardiograms.',
    },
    commonQuestions: [
      {
        q: 'How strong is the evidence that this stops stones coming back?',
        a: 'Weaker than the length of its history suggests, and its own label says so. The Clinical Studies section opens by stating that the pivotal trials were non-randomised, had no placebo group, and had dietary management changing at the same time as the drug — and that the results "may overstate the effectiveness of the product". The randomised evidence is one good trial of 57 patients, in which stone formation fell from 1.2 to 0.1 per patient-year on drug and did not move on placebo, plus a Cochrane review pooling seven trials in 477 people that found new stone formation reduced by roughly three-quarters on data it rated moderate to poor. That is a genuinely positive signal from a small and imperfect evidence base, which is a different thing from a settled result.',
        auditNote:
          'A label that warns the reader about its own trials is rare enough to be worth reading twice. It is doing the job this site exists to do.',
      },
      {
        q: 'Could I just drink lemonade or take a supplement instead?',
        a: 'Citrus juice does raise urinary citrate by the same route, and the cation matters — orange juice supplies citrate largely as the potassium salt and produces an alkali load, while lemon juice supplies it mostly as the free acid. But no randomised trial with stone recurrence as the endpoint has tested juice; the Cochrane review of citrate salts contains seven trials of pharmaceutical preparations and no juice study. The supplement question has a sharper answer: the prescription product exists in a wax matrix specifically because solid potassium salts have caused bowel ulceration and deaths, it is contraindicated in five separate situations, and its label directs blood tests every four months and periodic ECGs. Those are properties of the product, not of the molecule, and a supplement has none of them.',
      },
      {
        q: 'Why do I still have to drink so much water if I am taking a tablet?',
        a: 'Because the tablet was never meant to replace the water. The dosing section opens by saying treatment "should be added to a regimen that limits salt intake and encourages high fluid intake (urine volume should be at least two liters per day)". Every stone is a solubility failure, and volume is the only intervention that lowers the concentration of every stone-forming salt at once. It is also the reason the drug’s own trials are hard to interpret: the patients started drinking more and eating less salt at the same moment they started the tablet, which is exactly the confounding the label warns about.',
      },
      {
        q: 'Does it work for every kind of stone?',
        a: 'No, and the label is specific. It is indicated for calcium oxalate stones with low urinary citrate, for renal tubular acidosis with calcium stones, and for uric acid stones. For calcium phosphate stones the pharmacology cuts the other way: section 12 states that the drug does not alter urinary calcium phosphate saturation, because the benefit of citrate binding calcium is cancelled by the pH-dependent dissociation of phosphate — and that calcium phosphate stones are more stable in alkaline urine. Which is why the composition of a stone you have passed is worth more than the fact of having passed one.',
      },
      {
        q: 'What is the actual risk with this drug?',
        a: 'Two things, and both are in the label rather than in folklore. The first is potassium: in anyone whose kidneys are not clearing potassium well, this drug can produce hyperkalaemia and cardiac arrest, and the label states that potentially fatal hyperkalaemia can develop rapidly and be asymptomatic. That is why chronic renal failure, uncontrolled diabetes, adrenal insufficiency, dehydration and potassium-sparing diuretics are all contraindications, and why electrolytes and an ECG are monitored. The second is the gut: solid potassium dosage forms have caused ulcerative and stenotic lesions of the small bowel and deaths, from a high local concentration of potassium ions where the tablet dissolves. That is what the wax matrix is for, and it is why the tablet is taken with food and swallowed whole.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'UROCIT-K (potassium citrate extended-release tablets) United States prescribing information — Indications (1.1 to 1.3), Dosage and Administration (2.1 to 2.3), Contraindications (4), Warnings and Precautions (5.1 Hyperkalemia, 5.2 Gastrointestinal Lesions), Description (11), Clinical Pharmacology (12), Clinical Studies (14, including the statement that the pivotal trials may overstate effectiveness), NDA 019071',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22UROCIT-K%22',
        kind: 'regulatory',
      },
      {
        label:
          'Phillips R, Hanchanale VS, Myatt A, Somani B, Nabi G. Citrate salts for preventing and treating calcium containing kidney stones in adults. Cochrane Database Syst Rev 2015;(10):CD010057',
        identifier: '10.1002/14651858.CD010057.pub2',
        kind: 'doi',
      },
      {
        label:
          'Barcelo P, Wuhl O, Servitge E, Rousaud A, Pak CY. Randomized double-blind study of potassium citrate in idiopathic hypocitraturic calcium nephrolithiasis. J Urol 1993;150:1761-1764',
        identifier: '10.1016/s0022-5347(17)35888-3',
        kind: 'doi',
      },
      {
        label:
          'Randomised, blank-controlled, multicentre trial of potassium citrate extended-release tablets on urolithiasis formation or recurrence, planned enrolment 2,001 — registry status UNKNOWN',
        identifier: 'NCT03007160',
        kind: 'nct',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — potassium citrate extended-release, 24 listed products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 2735208 — potassium citrate monohydrate, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2735208',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 7. Doxazosin — the blood pressure drug whose arm of a 42,000-patient trial was stopped early for
  //    doubling heart failure, and whose two formulations now carry contradictory indications.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'doxazosin',
    name: 'Doxazosin',
    tradeName: 'Cardura / Cardura XL',
    sponsor:
      'Viatris and many generic manufacturers; originated at Pfizer, which holds NDA 019668 for the immediate-release tablet and NDA 021269 for CARDURA XL',
    targetGene: 'ADRA1A',
    targetProtein:
      'Alpha-1 adrenergic receptor, with high affinity for the alpha-1A subtype that predominates in prostatic stroma, prostatic capsule and bladder neck; the same receptor on arterial and venous smooth muscle is what lowers blood pressure',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1990,
    indication:
      'Immediate-release doxazosin: treatment of the signs and symptoms of benign prostatic hyperplasia, and treatment of hypertension to lower blood pressure. CARDURA XL, the extended-release form of the same molecule: treatment of the signs and symptoms of benign prostatic hyperplasia only, with the explicit statement that it "is not indicated for the treatment of hypertension"',
    patientFriendlyIndication: 'Prostate symptoms, and high blood pressure',
    anatomicalSite:
      'Alpha-1A adrenoceptors in prostatic stroma, prostatic capsule and bladder neck; and alpha-1 adrenoceptors on peripheral arterial and venous smooth muscle',
    conditionContext: {
      conditionExplainer:
        'An enlarged prostate obstructs the urethra in two ways: by bulk, and by muscle tone. The tone part is controlled by alpha-1 receptors packed densely into the prostate and bladder neck. Blocking them relaxes that muscle and the stream improves within days, without changing the size of the gland at all. The same receptors line arteries, which is why the drug also drops blood pressure — and why the first dose can put someone on the floor.',
      whyItMatters:
        'Doxazosin is the clearest demonstration in modern medicine that lowering blood pressure with any drug is not the same as lowering cardiovascular risk. Its arm of ALLHAT — 24,335 patients — was stopped early after an interim analysis found combined cardiovascular events 25% higher and heart failure doubled against a diuretic costing a fraction as much. The molecule kept its hypertension indication on the immediate-release label and never had one on the extended-release label.',
      whoTakesThis:
        'Men with symptomatic benign prostatic hyperplasia, and — on the immediate-release product — adults with hypertension, usually as an add-on rather than a first-line agent. Anyone about to have cataract surgery needs to tell their ophthalmologist, whether or not they are still taking it.',
      clinicalGoals:
        'A better urinary stream and lower symptom score within days to weeks. For blood pressure, a lower number — with the ALLHAT result meaning that number should not be assumed to buy the usual reduction in events.',
    },
    oneSentenceVerdict:
      'An alpha-1 blocker that relieves prostate obstruction by relaxing smooth muscle rather than shrinking the gland — cutting overall clinical progression of benign prostatic hyperplasia by 39% against placebo in the 3,047-man MTOPS trial while failing to reduce acute urinary retention at all — and whose hypertension arm in ALLHAT was terminated early after 24,335 patients showed combined cardiovascular events 25% higher (RR 1.25, 95% CI 1.17 to 1.33) and heart failure doubled (RR 2.04, 95% CI 1.79 to 2.32) against chlortalidone.',
    laymanHowItWorks:
      'The tube that carries urine out of the bladder runs through the prostate, and the muscle in that stretch is held tight by adrenaline acting on a receptor called alpha-1. Doxazosin blocks that receptor, the muscle relaxes, and urine flows more easily — usually within days, and without the prostate getting any smaller. The same receptor keeps your arteries partly constricted, so the drug also lowers blood pressure, which is useful if you need that and a hazard if you do not: the first dose can drop your pressure enough to make you faint.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 54,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0772 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 88 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States in 1990 under NDA 019668 and generic since 2000, the same year the ALLHAT doxazosin arm was terminated. At under eight United States cents a tablet it is among the cheapest drugs in either of its indications — which is the part of the ALLHAT story that is usually left out: the drug that beat it, chlortalidone, was cheaper still.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Doxazosin has two indications and the substitution logic is different for each. For prostate symptoms, the alternatives differ in how much blood pressure they drop and whether they shrink the gland. For blood pressure, ALLHAT settled the question: three other classes have hard-endpoint superiority over this one, and one of them is cheaper.',
      conventionalRx: [
        {
          name: 'Tamsulosin',
          class: 'Alpha-1A-selective adrenergic antagonist',
          howItCompares:
            'Aimed at the same receptor subtype but with much greater selectivity for the prostatic alpha-1A over the vascular alpha-1B, so it produces far less postural hypotension and needs no titration. It has no hypertension indication, which for most men with a prostate problem and normal blood pressure is an advantage rather than a limitation.',
          typicalCost:
            'Among the cheapest prescription drugs in the United States at pharmacy acquisition cost',
          prosAndCons:
            'Pros: no dose titration; much less first-dose hypotension. Cons: abnormal ejaculation is markedly more common; the same intraoperative floppy iris syndrome risk, in fact the strongest of the class.',
        },
        {
          name: 'Finasteride or dutasteride',
          class: '5-alpha-reductase inhibitor',
          howItCompares:
            'Shrinks the gland rather than relaxing the muscle, so it works slowly — months, not days — but does the thing doxazosin does not. In MTOPS, finasteride reduced acute urinary retention and the need for invasive therapy significantly (p<0.001) and doxazosin did not, while doxazosin was the better of the two on symptom score. Combination beat both.',
          typicalCost: 'Generic and inexpensive in the United States at pharmacy acquisition cost',
          prosAndCons:
            'Pros: reduces retention and surgery; halves prostate-specific antigen, which must be accounted for in cancer screening. Cons: sexual adverse effects; takes six months or more to act.',
        },
        {
          name: 'Chlortalidone — for the hypertension indication only',
          class: 'Thiazide-like diuretic',
          howItCompares:
            'This is the drug that beat doxazosin in ALLHAT and caused its arm to be stopped. Over a median 3.3 years in 24,335 patients, combined cardiovascular disease was 21.76% on chlortalidone against 25.45% on doxazosin at four years (RR 1.25 for doxazosin), heart failure 4.45% against 8.13% (RR 2.04), and stroke risk 19% higher on doxazosin. Fatal coronary heart disease and non-fatal infarction, the primary endpoint, did not differ.',
          typicalCost: 'Among the least expensive antihypertensive drugs available',
          prosAndCons:
            'Pros: hard-endpoint superiority in the largest antihypertensive trial ever run; lower cost. Cons: hypokalaemia, hyponatraemia, new-onset diabetes, and it raises serum urate — a real problem for someone who also has gout.',
        },
      ],
      naturalFoods: [
        {
          name: 'Saw palmetto (Serenoa repens)',
          activeCompound: 'Fatty acids and phytosterols of the berry lipidosterolic extract',
          biologicalMechanism:
            'Proposed weak 5-alpha-reductase inhibition and anti-inflammatory effects in prostatic tissue. It has no alpha-1 blocking activity, so it does not share doxazosin’s mechanism at all — a point often lost when the two are presented as alternatives.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'Not stated here as advice. For scale only: the largest and best-controlled randomised trials of saw palmetto in benign prostatic hyperplasia, including dose-escalation designs, did not separate from placebo on symptom scores. It is the most-sold prostate supplement and one of the most thoroughly negative in trial.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Take the first dose at bedtime and get up slowly',
          action:
            'Take the first dose, and any dose increase, when you can sit or lie down afterwards.',
          patientImpact:
            'The label states that postural hypotension with or without dizziness may develop within a few hours of a dose, that there is a potential for syncope especially after the initial dose or a dose increase, and that patients should avoid situations where injury could result should syncope occur.',
          clinicalPrecaution:
            'The same section warns that taking a PDE-5 inhibitor such as sildenafil or tadalafil alongside doxazosin produces additive blood pressure lowering and symptomatic hypotension — a combination two different prescribers may not know about.',
        },
        {
          name: 'Tell your eye surgeon, even if you stopped it years ago',
          action: 'Before cataract surgery, say that you have taken an alpha-blocker at any point.',
          patientImpact:
            'The label describes intraoperative floppy iris syndrome in patients on or previously treated with alpha-1 blockers: a flaccid iris that billows in irrigation currents, progressive intraoperative miosis despite preoperative dilation, and potential prolapse of the iris toward the incisions.',
          clinicalPrecaution:
            'The label states there does not appear to be a benefit from stopping alpha-1 blocker therapy before cataract surgery. Warning the surgeon so the technique can be modified is what helps; stopping the drug is not.',
        },
        {
          name: 'Ask to be screened for prostate cancer before starting',
          action: 'Have prostate cancer excluded before treatment and at intervals afterwards.',
          patientImpact:
            'The label directs that patients be screened for the presence of prostate cancer prior to treatment for benign prostatic hyperplasia and at regular intervals afterwards, because the symptoms this drug relieves are also the symptoms of a cancer it does nothing about.',
          clinicalPrecaution:
            'Unlike a 5-alpha-reductase inhibitor, doxazosin does not lower prostate-specific antigen, so it does not distort the screening test. It also does not slow the disease it is masking the symptoms of.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'COC1=C(C=C2C(=C1)C(=NC(=N2)N3CCN(CC3)C(=O)C4COC5=CC=CC=C5O4)N)OC',
      chemicalFormula: 'C23H25N5O5',
      molecularWeight: '451.50 g/mol (free base); dispensed as the mesylate salt',
      targetReceptorAffinity:
        'A quinazoline: 4-amino-6,7-dimethoxy-2-quinazolinyl joined through a piperazine to a 1,4-benzodioxan-2-carbonyl group. The label states that doxazosin mesylate is a selective inhibitor of the alpha-1 subtype of alpha adrenergic receptors, that it antagonises phenylephrine-induced contractions in human prostate in vitro, and that it binds with high affinity to the alpha-1A adrenoceptor. It is not subtype-selective in the way tamsulosin is, which is why it lowers blood pressure at doses that relieve prostate symptoms. Terazosin and prazosin share the same 4-amino-6,7-dimethoxyquinazoline head; the difference between the three is entirely in the acyl group hanging off the piperazine.',
      structureSource: {
        label:
          'PubChem CID 3157 (doxazosin) — canonical SMILES, molecular formula and weight, as carried on the enriched record; receptor pharmacology from the CARDURA XL prescribing information, section 12.1',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3157',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'dox-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Separate doxazosin from its quinazoline siblings',
          description:
            'Doxazosin, terazosin and prazosin share the 4-amino-6,7-dimethoxyquinazolinyl-piperazine core and differ only in the acyl group. They co-elute readily on a short method, and the benzodioxan ring carries a stereocentre that the marketed product does not resolve.',
          reagentsAndBuffer:
            'Doxazosin mesylate reference standard with prazosin and terazosin as system-suitability markers, gradient reversed-phase HPLC with photodiode array detection, mass confirmation, chiral HPLC to characterise the benzodioxan enantiomer ratio, mesylate counter-ion assay by ion chromatography',
        },
        {
          id: 'dox-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Acylate the piperazinyl quinazoline with the benzodioxan acid',
          description:
            'The published route builds 2-chloro-4-amino-6,7-dimethoxyquinazoline, displaces the chloride with piperazine, and acylates the free piperazine nitrogen with an activated 1,4-benzodioxan-2-carboxylic acid. The benzodioxan acid is used as the racemate, so the drug is marketed as a racemate.',
          dependsOnStepId: 'dox-w1',
          reagentsAndBuffer:
            '2-chloro-4-amino-6,7-dimethoxyquinazoline, anhydrous piperazine in excess to suppress bis-alkylation, 1,4-benzodioxan-2-carboxylic acid with carbonyldiimidazole or an equivalent activating agent, methanesulfonic acid for salt formation',
        },
        {
          id: 'dox-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Remove the bis-quinazolinyl piperazine and crystallise the mesylate',
          description:
            'The characteristic impurity of this chemistry is the symmetrical bis-adduct formed when both piperazine nitrogens react with the quinazoline. It is poorly soluble and difficult to remove late, so the crystallisation has to be designed around it.',
          dependsOnStepId: 'dox-w2',
          reagentsAndBuffer:
            'Hot filtration to remove the bis-adduct, controlled mesylate salt crystallisation from alcohol with seeding, HPLC related-substances profile against the specified impurity list, powder X-ray diffraction for form',
        },
        {
          id: 'dox-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Measure alpha-1A against alpha-1B, because the side effect lives in the ratio',
          description:
            'The entire clinical difference between doxazosin and tamsulosin is the ratio of prostatic alpha-1A affinity to vascular alpha-1B affinity. A single-subtype binding number cannot express that, and it is the number that predicts whether a patient faints on the first dose.',
          dependsOnStepId: 'dox-w3',
          reagentsAndBuffer:
            'CHO or HEK293 lines stably expressing human ADRA1A, ADRA1B and ADRA1D separately, radioligand displacement with tritiated prazosin, phenylephrine-induced contraction of isolated human prostatic strips as the functional counterpart, tamsulosin and prazosin as reference comparators',
        },
        {
          id: 'dox-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Report heart failure as a prespecified endpoint, not as an adverse event',
          description:
            'ALLHAT found the doxazosin signal because heart failure was a named component of a prespecified composite, adjudicated and counted. A drug that causes sodium and water retention through vasodilation will produce oedema that can be recorded as an adverse event and never counted as an event. The difference between those two ways of recording the same clinical fact is the difference between a signal and silence.',
          dependsOnStepId: 'dox-w4',
          reagentsAndBuffer:
            'Prespecified adjudicated composite including congestive heart failure, blinded endpoint committee, active comparator rather than placebo, interim analyses with a data review committee empowered to stop an arm, event-driven follow-up in a population at genuine cardiovascular risk',
        },
      ],
    },
    keyAudits: [
      {
        id: 'dox-a1',
        category: 'failed',
        title: 'ALLHAT stopped the doxazosin arm: heart failure doubled',
        laymanSummary:
          'In the largest blood pressure trial ever run, the doxazosin group was stopped early. Compared with a cheap old diuretic, combined cardiovascular events were 25% higher and heart failure was twice as common.',
        technicalDetails:
          'ALLHAT randomised 24,335 hypertensive patients aged 55 or over with at least one additional coronary risk factor to chlortalidone 12.5 to 25 mg/day (n=15,268) or doxazosin 2 to 8 mg/day (n=9,067) across 625 centres, planned for four to eight years. In January 2000, after an interim analysis, an independent data review committee recommended discontinuing the doxazosin arm. At a median 3.3 years the primary endpoint — fatal coronary heart disease or non-fatal myocardial infarction — did not differ: 365 against 608 events, RR 1.03 (95% CI 0.90 to 1.17, p=0.71). Nor did total mortality (four-year rates 9.62% against 9.08%, RR 1.03, 95% CI 0.90 to 1.15, p=0.56). But doxazosin carried a higher risk of stroke (RR 1.19, 95% CI 1.01 to 1.40, p=0.04) and of combined cardiovascular disease (four-year rates 25.45% against 21.76%, RR 1.25, 95% CI 1.17 to 1.33, p<0.001), and congestive heart failure was doubled (four-year rates 8.13% against 4.45%, RR 2.04, 95% CI 1.79 to 2.32, p<0.001). Angina RR was 1.16 (p<0.001) and coronary revascularisation 1.15 (p=0.05).',
        evidenceSource:
          'ALLHAT Collaborative Research Group. Major cardiovascular events in hypertensive patients randomized to doxazosin vs chlorthalidone. JAMA 2000;283:1967-1975 (NCT00000542)',
        doi: '10.1001/jama.283.15.1967',
        measuredMetric:
          'Combined cardiovascular disease and congestive heart failure at four years, doxazosin against chlortalidone',
        auditFlag: 'verified',
      },
      {
        id: 'dox-a2',
        category: 'conclusion_shift',
        title: 'One molecule, two labels, opposite answers on hypertension',
        laymanSummary:
          'The extended-release version of doxazosin says in its indications section that it is not indicated for high blood pressure. The immediate-release version of the same drug is indicated for high blood pressure.',
        technicalDetails:
          'CARDURA XL (NDA 021269) states in section 1: "CARDURA XL is not indicated for the treatment of hypertension", and its sole indication is the signs and symptoms of benign prostatic hyperplasia. The immediate-release doxazosin label (NDA 019668 and its generics) carries two indications — benign prostatic hyperplasia and hypertension — and its hypertension section recites the standard class inference: "Lowering blood pressure reduces the risk of fatal and nonfatal cardiovascular events, primarily strokes and myocardial infarctions. These benefits have been seen in controlled trials of antihypertensive drugs from a wide variety of pharmacologic classes, including this drug." ALLHAT is the trial that tested that inference for this molecule specifically and found combined cardiovascular events 25% higher than the comparator. The two labels are not in conflict about pharmacology — the extended-release form was simply never developed for hypertension — but a reader comparing them sees the same active ingredient described as a blood pressure treatment on one document and explicitly not on the other.',
        evidenceSource:
          'CARDURA XL United States prescribing information, section 1 (NDA 021269); doxazosin immediate-release tablets prescribing information, sections 1.1 and 1.2 (NDA 019668 and generics), via the openFDA drug label endpoint',
        inferredClaim:
          'That the class statement on the immediate-release label — lowering blood pressure with this drug reduces cardiovascular events — holds for doxazosin, which is the claim ALLHAT tested and did not support',
        auditFlag: 'contested',
      },
      {
        id: 'dox-a3',
        category: 'measured',
        title: 'MTOPS: best on symptoms, no effect at all on retention',
        laymanSummary:
          'Over four and a half years in 3,047 men, doxazosin cut overall progression of prostate disease by 39% — but it did not reduce the risk of the bladder shutting down completely, and finasteride did.',
        technicalDetails:
          'The Medical Therapy of Prostatic Symptoms trial randomised 3,047 men to placebo, doxazosin, finasteride or both, with mean follow-up 4.5 years. Overall clinical progression — a rise of at least 4 points in the American Urological Association symptom score, acute urinary retention, incontinence, renal insufficiency, or recurrent urinary infection — was reduced 39% by doxazosin (p<0.001), 34% by finasteride (p=0.002), and 66% by combination (p<0.001, and significantly better than either alone). But the risks of acute urinary retention and of needing invasive therapy were significantly reduced by combination therapy and by finasteride (both p<0.001) and not by doxazosin. All three arms improved symptom scores significantly, with combination superior to doxazosin (p=0.006) and to finasteride (p<0.001). The division is mechanistic and clean: relaxing smooth muscle relieves the symptom, shrinking the gland changes the outcome, and doxazosin only does the first.',
        evidenceSource:
          'McConnell JD, Roehrborn CG, Bautista OM, et al. The long-term effect of doxazosin, finasteride, and combination therapy on the clinical progression of benign prostatic hyperplasia. N Engl J Med 2003;349:2387-2398 (MTOPS, NCT00021814)',
        doi: '10.1056/NEJMoa030656',
        measuredMetric:
          'Risk reduction for overall clinical progression, and separately for acute urinary retention and invasive therapy',
        auditFlag: 'verified',
      },
      {
        id: 'dox-a4',
        category: 'measured',
        title: 'The eye complication that persists after the drug is stopped',
        laymanSummary:
          'Alpha-blockers make the iris floppy during cataract surgery. The label says stopping the drug beforehand does not appear to help — the surgeon simply needs to know.',
        technicalDetails:
          'The label describes intraoperative floppy iris syndrome in patients "on or previously treated with alpha-1 blockers": a variant of small pupil syndrome combining a flaccid iris that billows in response to intraoperative irrigation currents, progressive intraoperative miosis despite preoperative dilation with standard mydriatics, and potential prolapse of the iris toward the phacoemulsification incisions. It directs the surgeon to be prepared to modify technique with iris hooks, iris dilator rings or viscoelastic substances, and states plainly that "there does not appear to be a benefit from stopping alpha 1 blocker therapy prior to cataract surgery". This is an unusual shape of adverse effect: it is not dose-dependent in the ordinary way, it persists after exposure ends, and the mitigation is entirely informational.',
        evidenceSource:
          'CARDURA XL United States prescribing information, section 5.2 Cataract Surgery; identical text in the immediate-release doxazosin label, section 5.2',
        measuredMetric:
          'Labelled description and management of intraoperative floppy iris syndrome in current and former alpha-1 blocker users',
        auditFlag: 'caution',
      },
      {
        id: 'dox-a5',
        category: 'inferred',
        title: 'The drug relieves the symptoms of a cancer it does not treat',
        laymanSummary:
          'The urinary symptoms doxazosin fixes are also the symptoms of prostate cancer. The label instructs screening before treatment and at intervals afterwards.',
        technicalDetails:
          'The label directs that patients be screened for the presence of prostate cancer prior to treatment for benign prostatic hyperplasia and at regular intervals afterwards. The reasoning is not stated on the label but follows directly from the pharmacology: alpha-1 blockade relieves the dynamic component of obstruction regardless of what is causing the obstruction, and relieving the symptom removes the prompt that would otherwise bring someone back. Unlike a 5-alpha-reductase inhibitor, doxazosin does not halve prostate-specific antigen, so it does not distort the test — the risk here is the symptom being silenced, not the marker being suppressed.',
        evidenceSource:
          'Doxazosin United States prescribing information, section 5.3 (immediate-release) and CARDURA XL section 5.4, Screening for Prostate Cancer',
        inferredClaim:
          'That symptom relief from an alpha-1 blocker indicates the underlying obstruction has been addressed, when the drug relaxes muscle tone regardless of the cause of the obstruction',
        auditFlag: 'caution',
      },
      {
        id: 'dox-a6',
        category: 'measured',
        title: 'Adding a PDE5 inhibitor to it can drop the pressure twice over',
        laymanSummary:
          'A man taking doxazosin for his prostate and sildenafil for erectile dysfunction is taking two blood-pressure-lowering drugs, and the label says so.',
        technicalDetails:
          'Section 5.1 states: "Concomitant administration of doxazosin mesylate with a PDE-5 inhibitor can result in additive blood pressure lowering effects and symptomatic hypotension." The overlap is a predictable consequence of prescribing patterns rather than a rare interaction: benign prostatic hyperplasia and erectile dysfunction share a population, and the two drugs are frequently written by different people. The sildenafil label carries the reciprocal warning that caution is advised when co-administered with alpha-blockers or antihypertensives. Neither combination is prohibited; both require the sequence and timing to be planned rather than discovered.',
        evidenceSource:
          'Doxazosin United States prescribing information, section 5.1 Postural Hypotension; VIAGRA prescribing information, section 5.5',
        measuredMetric:
          'Labelled additive hypotensive interaction between alpha-1 blockers and PDE5 inhibitors',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A quinazoline that fits the alpha-1 receptor',
        laymanDesc:
          'Doxazosin belongs to a small family of look-alike molecules — prazosin, terazosin, doxazosin — that all block the same receptor and differ only in the tail.',
        molecularDetail:
          '4-amino-6,7-dimethoxyquinazoline linked through piperazine to a 1,4-benzodioxan-2-carbonyl group, C23H25N5O5, dispensed as the mesylate. The shared quinazoline head is the pharmacophore; the acyl tail sets duration and, in this case, gives a half-life long enough for once-daily dosing.',
        iconName: 'Atom',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It blocks alpha-1 receptors in the prostate and bladder neck',
        laymanDesc:
          'These receptors are packed densely into the prostate and the neck of the bladder, and they hold that muscle tight. Blocked, the muscle relaxes.',
        molecularDetail:
          'The label states the dynamic component of benign prostatic hyperplasia is an increase in smooth muscle tone in prostate and bladder neck, mediated by the alpha-1 adrenoceptor present in high density in prostatic stroma, prostatic capsule and bladder neck. Doxazosin antagonises phenylephrine-induced contraction of human prostate in vitro and binds with high affinity to the alpha-1A subtype.',
        iconName: 'Unlock',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'The stream improves without the gland changing',
        laymanDesc: 'Flow gets better in days. The prostate is exactly the same size as it was.',
        molecularDetail:
          'The label notes that the severity of symptoms and the degree of urethral obstruction correlate poorly with prostate size, and that blockade of the alpha-1 receptor decreases urethral resistance. Nothing in the mechanism touches the static, anatomical component, which is what 5-alpha-reductase inhibitors address.',
        iconName: 'Waves',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'And the same receptors in your arteries let go too',
        laymanDesc:
          'Alpha-1 receptors keep arteries partly constricted everywhere. Blocking them lowers blood pressure, which is why the first dose can make you faint.',
        molecularDetail:
          'Doxazosin is not markedly subtype-selective between prostatic alpha-1A and vascular alpha-1B, unlike tamsulosin. Postural hypotension with or without dizziness may develop within a few hours of a dose, with a potential for syncope especially after the first dose or a dose increase, and PDE5 inhibitors add to the effect.',
        iconName: 'TrendingDown',
        visualStage: 'cellular_entry',
      },
      {
        step: 5,
        title: 'Symptoms improve; retention does not',
        laymanDesc:
          'Over four and a half years, doxazosin cut overall disease progression by 39% — but not the chance of the bladder shutting down entirely.',
        molecularDetail:
          'MTOPS: overall clinical progression reduced 39% by doxazosin (p<0.001) against 34% by finasteride and 66% by combination. Acute urinary retention and need for invasive therapy were significantly reduced by finasteride and by combination (p<0.001) and not by doxazosin.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What the blood pressure fall turned out to cost',
        laymanDesc:
          'In a 24,335-patient trial, doxazosin lowered pressure and still produced twice as much heart failure as a cheap diuretic. That arm was stopped early.',
        molecularDetail:
          'ALLHAT four-year rates: combined cardiovascular disease 25.45% against 21.76% (RR 1.25, 95% CI 1.17 to 1.33), congestive heart failure 8.13% against 4.45% (RR 2.04, 95% CI 1.79 to 2.32), stroke RR 1.19 (1.01 to 1.40). The primary endpoint of fatal coronary heart disease or non-fatal infarction and total mortality did not differ. Vasodilation with reflex sodium and water retention is the usual explanation and it remains an explanation, not a demonstrated mechanism.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'ALLHAT doxazosin arm (JAMA 2000;283:1967-1975; NCT00000542)',
        phase: 'Phase 4, randomised, double-blind, active-controlled',
        sampleSize: 24335,
        primaryEndpoint:
          'Fatal coronary heart disease or non-fatal myocardial infarction in hypertensive patients aged 55 or over with at least one additional coronary risk factor, doxazosin against chlortalidone',
        endpointMet: false,
        statisticalPValue:
          '365 against 608 events; RR 1.03 (95% CI 0.90 to 1.17), p=0.71 — no difference on the primary endpoint, at a median 3.3 years',
        unreportedAdverseSignals:
          'The arm was terminated early in January 2000 on the recommendation of an independent data review committee, because of the secondary endpoints: combined cardiovascular disease four-year rates 25.45% against 21.76% (RR 1.25, p<0.001), congestive heart failure 8.13% against 4.45% (RR 2.04, p<0.001), stroke RR 1.19 (p=0.04), angina RR 1.16 (p<0.001). Total mortality did not differ.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'MTOPS (N Engl J Med 2003;349:2387-2398; NCT00021814)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, four-arm factorial',
        sampleSize: 3047,
        primaryEndpoint:
          'Overall clinical progression of benign prostatic hyperplasia — symptom score rise of 4 points or more, acute urinary retention, incontinence, renal insufficiency or recurrent urinary infection — over a mean 4.5 years',
        endpointMet: true,
        statisticalPValue:
          'Risk reduction against placebo: doxazosin 39% (p<0.001), finasteride 34% (p=0.002), combination 66% (p<0.001, superior to each alone at p<0.001)',
        unreportedAdverseSignals:
          'Doxazosin did not significantly reduce acute urinary retention or the need for invasive therapy, while finasteride and combination therapy both did (p<0.001). The composite primary endpoint is dominated by the symptom-score component, which is the component doxazosin moves.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Combined cardiovascular disease four-year rate 25.45% on doxazosin against 21.76% on chlortalidone (RR 1.25, 95% CI 1.17 to 1.33) in 24,335 patients',
        'Congestive heart failure four-year rate 8.13% against 4.45% (RR 2.04, 95% CI 1.79 to 2.32)',
        'Stroke RR 1.19 (95% CI 1.01 to 1.40, p=0.04); primary endpoint of fatal coronary heart disease or non-fatal infarction unchanged (RR 1.03)',
        'Overall clinical progression of benign prostatic hyperplasia reduced 39% against placebo over a mean 4.5 years in 3,047 men',
        'No significant reduction by doxazosin in acute urinary retention or need for invasive therapy in the same trial',
      ],
      unsupportedInferences: [
        'That because doxazosin lowers blood pressure it reduces cardiovascular events, the class statement its immediate-release label still carries and the claim ALLHAT tested and did not support',
        'That relief of urinary symptoms means the obstruction has been treated, when the drug relaxes muscle tone whatever the cause — which is why the label directs prostate cancer screening',
        'That the MTOPS progression result implies protection against retention, when retention was measured separately and was not reduced',
        'That stopping the drug before cataract surgery avoids floppy iris syndrome, which the label states does not appear to help',
      ],
      whatFailedInitially: [
        'The doxazosin arm of ALLHAT was terminated early by an independent data review committee in January 2000',
        'Congestive heart failure was doubled against a comparator that cost less',
        'Acute urinary retention and the need for surgery were not reduced in the definitive benign prostatic hyperplasia trial',
        'First-dose and dose-increase syncope has been a labelled hazard since approval, and is worsened by PDE5 inhibitors prescribed for the same population',
      ],
      realWorldOutcome: [
        'Approved in 1990 under NDA 019668; generic since 2000, the same year its ALLHAT arm was stopped',
        'Alpha-blockers were removed from first-line status for uncomplicated hypertension in guidelines following ALLHAT, and the drug remains widely used for prostate symptoms',
        'The extended-release form, CARDURA XL, states in its own indications section that it is not indicated for hypertension',
        'At under eight United States cents a tablet it is among the cheapest drugs in either indication — and the drug that beat it in ALLHAT is cheaper',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet at 1, 2, 4 and 8 mg of doxazosin (immediate-release, titrated from a low starting dose); and CARDURA XL, a 4 or 8 mg extended-release tablet taken once daily with breakfast, for prostate symptoms only',
      description:
        'The immediate-release tablet is titrated upward because the first dose and each increase carry a risk of syncope. CARDURA XL delivers doxazosin over 24 hours from a non-deformable shell, with relative bioavailability of 54% at 4 mg and 59% at 8 mg compared with the immediate-release form, peak concentration at about 8 to 9 hours, and roughly 32% higher peak and 18% higher exposure when taken with food — which is why it is specified with breakfast.',
      safetyProfile:
        'Postural hypotension with or without dizziness may develop within a few hours of a dose, with potential for syncope especially after the first dose or a dose increase; PDE5 inhibitors add to the blood pressure fall. Intraoperative floppy iris syndrome occurs in current and former alpha-1 blocker users and stopping the drug beforehand does not appear to help — the surgeon must be told. Screen for prostate cancer before treating benign prostatic hyperplasia and at intervals afterwards. The extended-release form is a non-deformable tablet and requires caution in pre-existing severe gastrointestinal narrowing, with rare reports of obstructive symptoms. Caution in coronary insufficiency. In ALLHAT, congestive heart failure was twice as frequent on doxazosin as on chlortalidone.',
    },
    commonQuestions: [
      {
        q: 'I was told this is a blood pressure tablet. Is it a good one?',
        a: 'It lowers blood pressure reliably and it is no longer considered a first-line choice, because of a trial that measured what the lower number actually bought. ALLHAT randomised 24,335 people to doxazosin or to chlortalidone, an old and cheaper diuretic, and stopped the doxazosin arm early. Heart attacks and deaths were the same. But combined cardiovascular events were 25% higher on doxazosin, strokes 19% higher, and heart failure exactly doubled — 8.13% against 4.45% at four years. Blood pressure came down in both arms. That is the whole point of the result: two drugs achieved the same surrogate and produced different outcomes.',
        auditNote:
          'ALLHAT is the trial most often cited to justify treating blood pressure. It is also the trial that showed the number is not the thing being treated.',
      },
      {
        q: 'Will it shrink my prostate?',
        a: 'No. It relaxes the muscle in the prostate and bladder neck so the tube is less squeezed, and the gland stays exactly the size it was. That is why it works within days rather than months. It also explains the result of the definitive trial: over four and a half years in 3,047 men, doxazosin reduced overall progression by 39% and did not reduce acute urinary retention or the need for surgery at all, while finasteride — which does shrink the gland — reduced both. Together they were better than either. If your goal is to feel better now, this is the mechanism that does it; if your goal is to avoid the bladder shutting down in ten years, it is not.',
      },
      {
        q: 'Why do I have to start with such a small dose?',
        a: 'Because the receptor this drug blocks is also holding your arteries partly constricted, and the first dose can drop your blood pressure enough to make you faint. The label warns of postural hypotension with or without dizziness within a few hours of a dose and a potential for syncope especially after the initial dose or a dose increase, and advises avoiding situations where injury could result. The same warning names a specific combination: taking a PDE5 inhibitor such as sildenafil or tadalafil at the same time produces additive blood pressure lowering. That combination is common in exactly this population and often involves two different prescribers.',
      },
      {
        q: 'I am having cataract surgery. Should I stop it first?',
        a: 'Tell the surgeon; do not assume stopping helps. Alpha-blockers cause intraoperative floppy iris syndrome — the iris becomes flaccid, billows in the irrigation currents, constricts despite dilating drops, and can prolapse into the incision. The label states this occurs in patients on or previously treated with alpha-1 blockers, and that "there does not appear to be a benefit from stopping alpha 1 blocker therapy prior to cataract surgery". What does help is the surgeon knowing in advance so they can plan for iris hooks, dilator rings or viscoelastics. Mention it even if you took the drug years ago and stopped.',
      },
      {
        q: 'Why does one version of this drug say it is not for blood pressure?',
        a: 'Because Cardura XL, the once-daily extended-release form, was developed and licensed only for prostate symptoms, and its indications section says so outright: "CARDURA XL is not indicated for the treatment of hypertension." The ordinary immediate-release tablet carries both indications. So the same molecule appears in two American labels, one of which presents it as an antihypertensive and one of which specifically excludes that use. Reading them side by side is a useful exercise: the immediate-release label also recites the standard class sentence that lowering blood pressure with drugs including this one reduces fatal and non-fatal cardiovascular events — the exact proposition ALLHAT tested for this molecule and did not confirm.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'ALLHAT Collaborative Research Group. Major cardiovascular events in hypertensive patients randomized to doxazosin vs chlorthalidone: the Antihypertensive and Lipid-Lowering Treatment to Prevent Heart Attack Trial (ALLHAT). JAMA 2000;283:1967-1975',
        identifier: '10.1001/jama.283.15.1967',
        kind: 'doi',
      },
      {
        label:
          'McConnell JD, Roehrborn CG, Bautista OM, et al. The long-term effect of doxazosin, finasteride, and combination therapy on the clinical progression of benign prostatic hyperplasia. N Engl J Med 2003;349:2387-2398 (MTOPS)',
        identifier: '10.1056/NEJMoa030656',
        kind: 'doi',
      },
      {
        label: 'ALLHAT registry record',
        identifier: 'NCT00000542',
        kind: 'nct',
      },
      {
        label: 'Medical Therapy of Prostatic Symptoms (MTOPS) registry record',
        identifier: 'NCT00021814',
        kind: 'nct',
      },
      {
        label:
          'CARDURA XL (doxazosin mesylate extended-release tablets) United States prescribing information — Indications (1, "not indicated for the treatment of hypertension"), Warnings and Precautions (5.1 Postural Hypotension, 5.2 Cataract Surgery, 5.3 Gastrointestinal Disorders, 5.4 Screening for Prostate Cancer), Clinical Pharmacology (12.1, 12.3), NDA 021269',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22CARDURA%22',
        kind: 'regulatory',
      },
      {
        label:
          'Doxazosin mesylate immediate-release tablets United States prescribing information — Indications (1.1 Benign Prostatic Hyperplasia, 1.2 Hypertension), Warnings and Precautions (5.1 Postural Hypotension including the PDE-5 inhibitor interaction, 5.2 Cataract Surgery, 5.3 Screening for Prostate Cancer), NDA 019668 and generics',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22doxazosin+mesylate%22',
        kind: 'regulatory',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — doxazosin, 88 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 3157 — doxazosin structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3157',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 8. Terazosin — a 1987 prostate and blood pressure drug whose own indications line admits it has
  //    never been shown to prevent surgery or retention, and which is now in a Phase 3 trial for
  //    Parkinson's disease on the strength of an enzyme it happens to activate.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'terazosin',
    name: 'Terazosin',
    tradeName: 'Hytrin / Tezruly / Terazosin Hydrochloride',
    sponsor:
      'Abbott Laboratories (originator, as Hytrin); now made by many generic manufacturers, with Tezruly as an oral solution',
    targetGene: 'ADRA1A',
    targetProtein:
      'Alpha-1 adrenergic receptor on prostatic and bladder-neck smooth muscle and on vascular smooth muscle. A second, unrelated activity — allosteric enhancement of phosphoglycerate kinase 1, a glycolytic enzyme — is the basis of an entirely separate line of research and is not part of any approved indication',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1987,
    indication:
      'Treatment of symptomatic benign prostatic hyperplasia, with the label stating that approximately 70% of patients experience an increase in urinary flow and improvement in symptoms, and that "the long-term effects of terazosin capsules on the incidence of surgery, acute urinary obstruction or other complications of BPH are yet to be determined"; and treatment of hypertension, alone or with other antihypertensive agents',
    patientFriendlyIndication: 'Prostate symptoms, and high blood pressure',
    anatomicalSite:
      'Alpha-1 adrenoceptors in the prostate, prostatic capsule and bladder neck — the label notes there are relatively few in the bladder body, which is why the drug reduces outlet obstruction without weakening bladder contraction',
    conditionContext: {
      conditionExplainer:
        'Bladder outlet obstruction has a static part, which is the bulk of the prostate, and a dynamic part, which is muscle tone in the prostate and bladder neck held by alpha-1 receptors. Terazosin blocks those receptors. The label is explicit that prostate size does not correlate with symptom severity or with the degree of obstruction, which is why relaxing the muscle helps a gland that has not changed size.',
      whyItMatters:
        'Two things make this old drug interesting. Its indications section contains a rare, plain admission that nobody knows whether it prevents the outcomes that matter in prostate disease. And in 2019 it was found to activate a glycolytic enzyme, which produced a large observational signal in Parkinson’s disease and put a 1987 alpha-blocker into a Phase 3 neurology platform trial — a repurposing story currently at the exact stage where most of them fail.',
      whoTakesThis:
        'Men with symptomatic benign prostatic hyperplasia, and adults with hypertension, usually as an add-on. Prostate cancer must be excluded first, because the two conditions cause the same symptoms and frequently coexist.',
      clinicalGoals:
        'Better flow and lower symptom score within days, and a lower blood pressure where that is the indication. The label states that whether any of this reduces surgery or acute retention is undetermined.',
    },
    oneSentenceVerdict:
      'An alpha-1 blocker that beat both placebo and finasteride on symptoms and flow in a 1,229-man Veterans Affairs trial — symptom score falling 6.1 points against 3.2 on finasteride and 2.6 on placebo, with finasteride no better than placebo — whose own label states that its long-term effect on surgery, acute urinary obstruction and other complications is "yet to be determined", and which is now being tested in a 1,200-patient Phase 3 Parkinson’s platform trial on the strength of database associations, not of any randomised neurological result.',
    laymanHowItWorks:
      'The muscle around the neck of the bladder and inside the prostate is held tight by adrenaline acting on alpha-1 receptors. Terazosin blocks those receptors, the muscle relaxes, and the stream improves — usually within days, and without the prostate changing size. The same receptors sit on arteries throughout the body, which is why the drug also lowers blood pressure and why the first dose is taken at bedtime: a marked postural drop, and sometimes fainting, is a labelled effect of starting it.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 60,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1050 per capsule at United States pharmacy acquisition cost (CMS NADAC, median across 38 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States in 1987 as Hytrin and generic since 1999. At about ten United States cents a capsule it is among the least expensive drugs in either of its indications. The Parkinson’s hypothesis, if it were ever confirmed, would attach to a molecule with no remaining exclusivity anywhere — which is the reason that trial is being run by a university consortium rather than a company.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'For prostate symptoms the choice within the alpha-blocker class turns almost entirely on how much blood pressure the drug drops. Terazosin and doxazosin drop it substantially and need titration; tamsulosin and silodosin are prostate-selective and do not. Across classes, the 5-alpha-reductase inhibitors do the thing terazosin does not: change the long-term course.',
      conventionalRx: [
        {
          name: 'Tamsulosin',
          class: 'Alpha-1A-selective adrenergic antagonist',
          howItCompares:
            'Same receptor family, much greater selectivity for the prostatic subtype, so no dose titration and far less first-dose hypotension. It is also the comparator used in the Parkinson’s database studies precisely because it does not enhance glycolysis — meaning the drug most likely to be prescribed instead of terazosin is the one those studies treat as the control.',
          typicalCost:
            'Among the cheapest prescription drugs in the United States at pharmacy acquisition cost',
          prosAndCons:
            'Pros: no titration; minimal blood pressure effect. Cons: abnormal ejaculation is much more common; the strongest intraoperative floppy iris signal in the class.',
        },
        {
          name: 'Finasteride or dutasteride',
          class: '5-alpha-reductase inhibitor',
          howItCompares:
            'The evidence here is genuinely inconsistent and worth stating carefully. In the 1,229-man Veterans Affairs trial, finasteride was no better than placebo on symptom score or peak flow and terazosin was clearly better than both. In the later 3,047-man MTOPS trial, finasteride reduced acute urinary retention and the need for invasive therapy, which the alpha-blocker did not. The populations differed in prostate size, which is the accepted explanation and is itself an inference.',
          typicalCost: 'Generic and inexpensive in the United States at pharmacy acquisition cost',
          prosAndCons:
            'Pros: acts on the static component and reduces retention and surgery in men with larger glands. Cons: months to act; sexual adverse effects; halves prostate-specific antigen, which distorts cancer screening.',
        },
        {
          name: 'Chlortalidone or another thiazide-like diuretic — for the hypertension indication',
          class: 'Thiazide-like diuretic',
          howItCompares:
            'The class comparison that removed alpha-blockers from first-line hypertension treatment was run with doxazosin, not terazosin: ALLHAT stopped its doxazosin arm after 24,335 patients showed combined cardiovascular events 25% higher and heart failure doubled against chlortalidone. Terazosin has no comparable outcome trial of its own, so its demotion is inherited from a sibling molecule rather than measured.',
          typicalCost: 'Among the least expensive antihypertensive drugs available',
          prosAndCons:
            'Pros: hard-endpoint evidence in the largest antihypertensive trial ever run. Cons: hypokalaemia, hyponatraemia, new-onset diabetes, and it raises serum urate.',
        },
      ],
      naturalFoods: [
        {
          name: 'Saw palmetto (Serenoa repens)',
          activeCompound: 'Lipidosterolic extract of the berry — fatty acids and phytosterols',
          biologicalMechanism:
            'Proposed weak 5-alpha-reductase inhibition. It has no alpha-1 antagonist activity, so it does not act by terazosin’s mechanism at all, which is worth knowing before treating them as interchangeable.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'Not stated here as advice. For scale only: the best-controlled randomised trials of saw palmetto in benign prostatic hyperplasia, including dose-escalation designs, did not separate from placebo on symptom scores.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'First dose at bedtime, 1 mg, and nothing hazardous for 12 hours',
          action:
            'Take the first dose, any increase, and any restart after a break at bedtime, and avoid driving for 12 hours afterwards.',
          patientImpact:
            'The label directs that treatment always be initiated with a 1 mg dose at bedtime and that the 2, 5 and 10 mg capsules are not indicated as initial therapy. It states the same first-dose effect can be anticipated if therapy is interrupted for several days and restarted, and advises patients to avoid driving or hazardous tasks for 12 hours after the first dose, after a dose increase, and after an interruption.',
          clinicalPrecaution:
            'In early investigational studies with single doses up to 7.5 mg, syncope occurred in 3 of 14 subjects and severe orthostatic hypotension with blood pressure falling to 50/0 mmHg in two others. Tolerance to the first-dose phenomenon did not necessarily develop.',
        },
        {
          name: 'A painful erection lasting hours is an emergency',
          action: 'Seek immediate medical attention for a sustained painful erection.',
          patientImpact:
            'The label records that terazosin and other alpha-1 antagonists have rarely been associated with priapism — probably less than once in every several thousand patients, with two or three dozen cases reported — and states that if not brought to immediate medical attention it can lead to permanent erectile dysfunction.',
          clinicalPrecaution:
            'This is one of the few adverse effects on this page where the delay, not the event, causes the permanent harm.',
        },
        {
          name: 'Tell your eye surgeon, and get your prostate checked first',
          action:
            'Mention alpha-blocker use before cataract surgery, and have prostate cancer excluded before starting.',
          patientImpact:
            'The label describes intraoperative floppy iris syndrome in patients on or previously treated with alpha-1 blockers and states there does not appear to be a benefit from stopping the drug before surgery. Separately, it directs that patients thought to have benign prostatic hyperplasia be examined before starting to rule out carcinoma of the prostate, because the two diseases cause many of the same symptoms and frequently coexist.',
          clinicalPrecaution:
            'The label also records small but statistically significant falls in haematocrit, haemoglobin, white cells, total protein and albumin in controlled trials, which it attributes to haemodilution rather than to loss.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'COC1=C(C=C2C(=C1)C(=NC(=N2)N3CCN(CC3)C(=O)C4CCCO4)N)OC',
      chemicalFormula: 'C19H25N5O4',
      molecularWeight: '387.40 g/mol (free base); dispensed as the hydrochloride dihydrate',
      targetReceptorAffinity:
        'The same 4-amino-6,7-dimethoxyquinazoline head as prazosin and doxazosin, joined through piperazine to a tetrahydrofuran-2-carbonyl group. That single tail difference is what separates it from doxazosin, whose tail is a benzodioxan. The label describes blockade of alpha-1 adrenoceptors abundant in prostate, prostatic capsule and bladder neck, and notes that relatively few alpha-1 adrenoceptors are present in the bladder body, so outlet obstruction is reduced without affecting bladder contractility. A structurally unrelated activity — allosteric activation of phosphoglycerate kinase 1, raising glycolytic flux and cellular ATP — was reported in 2019 and underlies the Parkinson’s hypothesis. It is not an alpha-adrenergic effect, it appears in the closely related quinazolines and not in tamsulosin, and it has no approved indication.',
      structureSource: {
        label:
          'PubChem CID 5401 (terazosin) — canonical SMILES, molecular formula and weight, as carried on the enriched record; receptor pharmacology from the terazosin capsules prescribing information, Clinical Pharmacology',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5401',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ter-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Separate terazosin from prazosin and doxazosin, and fix the hydrate state',
          description:
            'The three quinazolines differ only in the acyl tail and share the chromophore, so a short isocratic method will not resolve them. Terazosin is dispensed as the hydrochloride dihydrate and the water is part of the salt, so a batch dried past specification is a batch with a different potency per capsule.',
          reagentsAndBuffer:
            'Terazosin hydrochloride dihydrate reference standard with prazosin and doxazosin as resolution markers, gradient reversed-phase HPLC with photodiode array detection, Karl Fischer titration for the dihydrate water, powder X-ray diffraction to confirm the hydrate form',
        },
        {
          id: 'ter-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Displace the quinazoline chloride with piperazine, then acylate with the furan acid',
          description:
            'The route is the same skeleton-building sequence as doxazosin with a different acyl partner: 2-chloro-4-amino-6,7-dimethoxyquinazoline is displaced by excess piperazine, and the free nitrogen is acylated with activated tetrahydrofuran-2-carboxylic acid. The tetrahydrofuran carries a stereocentre and the marketed product is the racemate.',
          dependsOnStepId: 'ter-w1',
          reagentsAndBuffer:
            '2-chloro-4-amino-6,7-dimethoxyquinazoline, anhydrous piperazine in excess to suppress the bis-adduct, tetrahydrofuran-2-carboxylic acid with a carbodiimide or acyl chloride activation, hydrochloric acid and controlled hydration to the dihydrate',
        },
        {
          id: 'ter-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Remove the symmetrical bis-adduct and crystallise the dihydrate reproducibly',
          description:
            'As with every piperazine displacement in this family the characteristic impurity is the bis-quinazolinyl piperazine, and the release-critical attribute of the drug substance is the hydrate. Crystallising to the anhydrate or the monohydrate changes dissolution and assay together.',
          dependsOnStepId: 'ter-w2',
          reagentsAndBuffer:
            'Hot filtration for the bis-adduct, controlled-humidity crystallisation from aqueous alcohol with seeding, HPLC related substances against a specified impurity list, dynamic vapour sorption to map the hydrate boundaries',
        },
        {
          id: 'ter-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Assay the second target, phosphoglycerate kinase 1, separately from the receptor',
          description:
            'The Parkinson’s hypothesis rests on an activity that has nothing to do with adrenergic receptors: allosteric enhancement of a glycolytic enzyme, raising ATP. Measuring it requires an enzyme assay and a cellular ATP readout run alongside the receptor pharmacology, with tamsulosin as the negative control — because tamsulosin blocks the receptor and does not enhance the enzyme, which is exactly the contrast the epidemiology exploits.',
          dependsOnStepId: 'ter-w3',
          reagentsAndBuffer:
            'Recombinant human PGK1 with coupled enzymatic assay, cellular ATP quantification by luminescence in neuronal and iPSC-derived dopaminergic models, parallel radioligand binding at human ADRA1A, ADRA1B and ADRA1D, tamsulosin as the receptor-active enzyme-inactive comparator and doxazosin and alfuzosin as positive comparators',
        },
        {
          id: 'ter-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Run the randomised trial the database studies cannot substitute for',
          description:
            'Two large propensity-matched cohorts reported lower Parkinson’s incidence in men on glycolysis-enhancing alpha-blockers than on tamsulosin, with an apparent dose-response. Both are observational, and the comparison is between two drugs chosen for the same indication by clinicians who saw the patients. The measurement that settles it is randomised allocation with a movement-disorder rating scale as the prespecified endpoint, which is now running.',
          dependsOnStepId: 'ter-w4',
          reagentsAndBuffer:
            'Randomised placebo-controlled allocation in a multi-arm multi-stage platform design, MDS-UPDRS as the prespecified primary outcome, blinded rating, prespecified interim analyses for futility, and a comparator arm that is not another drug prescribed for the same underlying condition',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ter-a1',
        category: 'inferred',
        title: 'The indications section admits it does not know if the drug prevents anything',
        laymanSummary:
          'The label says about 70% of men get better flow and fewer symptoms — and then says in the same paragraph that whether the drug prevents surgery or acute retention is yet to be determined.',
        technicalDetails:
          'The Indications and Usage section reads: "Terazosin capsules are indicated for the treatment of symptomatic benign prostatic hyperplasia (BPH). There is a rapid response, with approximately 70% of patients experiencing an increase in urinary flow and improvement in symptoms of BPH when treated with terazosin capsules. The long-term effects of terazosin capsules on the incidence of surgery, acute urinary obstruction or other complications of BPH are yet to be determined." That last sentence is the whole audit. The drug is licensed on a symptom score and a flow rate, and the outcomes a man actually fears — the catheter, the operation — are named in the indications section as unmeasured. The later MTOPS trial, which used doxazosin rather than terazosin, found that the alpha-blocker arm did not reduce acute urinary retention or the need for invasive therapy while finasteride did, which is at least consistent with the label’s caution.',
        evidenceSource:
          'Terazosin capsules United States prescribing information, Indications and Usage, via the openFDA drug label endpoint',
        inferredClaim:
          'That relief of symptoms and improvement in flow rate translate into fewer operations and fewer episodes of acute retention — an inference the label explicitly declines to make for this drug',
        auditFlag: 'caution',
      },
      {
        id: 'ter-a2',
        category: 'conclusion_shift',
        title: 'The trial where finasteride was no better than placebo',
        laymanSummary:
          'In a 1,229-man Veterans Affairs trial, terazosin clearly worked and finasteride did no better than placebo. A larger trial seven years later found finasteride reducing retention and surgery. Both results stand.',
        technicalDetails:
          'The Veterans Affairs Cooperative Study randomised 1,229 men with benign prostatic hyperplasia to placebo, terazosin 10 mg daily, finasteride 5 mg daily, or both, for one year. Mean falls in American Urological Association symptom score were 2.6 on placebo, 3.2 on finasteride, 6.1 on terazosin and 6.2 on combination (p<0.001 for terazosin and for combination against both finasteride and placebo). Mean increases in peak urinary flow were 1.4, 1.6, 2.7 and 3.2 mL/s respectively, with the same pattern of significance. The authors concluded that finasteride had no more effect than placebo on either measure, and that combination was no better than terazosin alone. Seven years later MTOPS, in 3,047 men over 4.5 years, found finasteride reducing overall clinical progression by 34% and significantly reducing acute urinary retention and the need for invasive therapy, which the alpha-blocker did not. The reconciliation usually offered is prostate size — the VA population had smaller glands, and 5-alpha-reductase inhibitors work best in large ones — and that explanation is itself a post-hoc inference rather than a randomised finding. What is certain is that two well-run randomised trials of the same two drugs reached opposite conclusions about one of them.',
        evidenceSource:
          'Lepor H, Williford WO, Barry MJ, et al. The efficacy of terazosin, finasteride, or both in benign prostatic hyperplasia. N Engl J Med 1996;335:533-539; McConnell JD et al. N Engl J Med 2003;349:2387-2398 (MTOPS)',
        doi: '10.1056/NEJM199608223350801',
        measuredMetric:
          'Change in American Urological Association symptom score and peak urinary flow at one year, four arms',
        auditFlag: 'contested',
      },
      {
        id: 'ter-a3',
        category: 'inferred',
        title: 'Its demotion in hypertension was measured on a different molecule',
        laymanSummary:
          'Alpha-blockers stopped being first-line for blood pressure because of ALLHAT. ALLHAT tested doxazosin. Terazosin has no outcome trial of its own and inherited the verdict.',
        technicalDetails:
          'ALLHAT randomised 24,335 hypertensive patients to doxazosin or chlortalidone and terminated the doxazosin arm early: combined cardiovascular disease four-year rates 25.45% against 21.76% (RR 1.25, 95% CI 1.17 to 1.33) and congestive heart failure 8.13% against 4.45% (RR 2.04, 95% CI 1.79 to 2.32). Terazosin was not a trial arm. Its own hypertension label carries no cardiovascular outcome data at all — the evidence is blood pressure reduction and an adverse-effect profile in which dizziness, lightheadedness or palpitations occurred in around 28% of patients in hypertension trials. The class inference runs both ways here and both directions are unproven: it is reasonable to expect a closely related quinazoline alpha-1 blocker to behave like doxazosin, and it has not been shown. The same class-inference logic is what the Parkinson’s literature relies on in the opposite direction, grouping terazosin, doxazosin and alfuzosin together as glycolysis enhancers.',
        evidenceSource:
          'ALLHAT Collaborative Research Group. JAMA 2000;283:1967-1975 (doxazosin arm, NCT00000542); terazosin capsules prescribing information, Indications and Precautions — Orthostatic Hypotension',
        doi: '10.1001/jama.283.15.1967',
        inferredClaim:
          'That the ALLHAT harm signal applies to terazosin — a class inference from a trial in which terazosin was not studied, with no terazosin outcome trial existing either way',
        auditFlag: 'contested',
      },
      {
        id: 'ter-a4',
        category: 'inferred',
        title: 'The Parkinson’s signal: two national databases, and no randomised evidence yet',
        laymanSummary:
          'Terazosin turns out to speed up a glycolysis enzyme. Men taking it had less Parkinson’s disease than men taking tamsulosin in two large databases, with an apparent dose-response. That is an association, and a Phase 3 trial started in 2025 to test it.',
        technicalDetails:
          'Terazosin enhances the activity of phosphoglycerate kinase 1, stimulating glycolysis and raising cellular ATP. In toxin-induced and genetic Parkinson’s models in mice, rats, flies and induced pluripotent stem cells, it increased brain ATP, slowed or prevented neuron loss, raised dopamine and partly restored motor function. A subsequent cohort study used tamsulosin — prescribed for the same indication and not a glycolysis enhancer — as the active comparator: 52,365 propensity-matched pairs in the Danish national registries gave a hazard ratio for developing Parkinson’s of 0.88 (95% CI 0.81 to 0.98), and 94,883 matched pairs in the United States Truven database gave 0.63 (95% CI 0.58 to 0.69), with a dose-response across short, medium and long duration in both (Danish long-duration HR 0.79, 95% CI 0.66 to 0.95; Truven long-duration HR 0.46, 95% CI 0.36 to 0.57). The two databases disagree substantially in effect size — 12% against 37% relative reduction — which is itself informative about how much residual confounding these designs carry. Terazosin is now Arm C of the Edmond J. Safra Accelerating Clinical Trials in Parkinson’s Disease platform trial, a Phase 3 multi-arm multi-stage study of 1,200 participants led by University College London, which began on 12 September 2025 and is recruiting.',
        evidenceSource:
          'Cai R, Zhang Y, Simmering JE, et al. Enhancing glycolysis attenuates Parkinson’s disease progression in models and clinical databases. J Clin Invest 2019;129:4539-4549; Simmering JE, Welsh MJ, Liu L, Narayanan NS, Pottegård A. Association of Glycolysis-Enhancing alpha-1 Blockers With Risk of Developing Parkinson Disease. JAMA Neurol 2021;78:407-413; EJS ACT-PD platform trial, NCT07207057',
        doi: '10.1172/JCI129987',
        inferredClaim:
          'That terazosin slows or prevents Parkinson’s disease — supported by animal models and two observational cohorts whose effect estimates differ threefold, and under randomised test for the first time from September 2025',
        auditFlag: 'contested',
      },
      {
        id: 'ter-a5',
        category: 'measured',
        title: 'The first-dose effect is severe, documented, and does not reliably wear off',
        laymanSummary:
          'In early studies, three of fourteen volunteers fainted and two more had blood pressure fall to 50/0. The label says tolerance to the first-dose effect did not necessarily develop.',
        technicalDetails:
          'The Warnings section states that terazosin can cause marked lowering of blood pressure, especially postural hypotension, and syncope in association with the first dose or first few days, and that a similar effect can be anticipated if therapy is interrupted for several days and restarted. In early investigational studies with increasing single doses up to 7.5 mg at three-day intervals, "tolerance to the first dose phenomenon did not necessarily develop and the ‘first-dose’ effect could be observed at all doses": syncope occurred in 3 of 14 subjects at 2.5, 5 and 7.5 mg, and severe orthostatic hypotension with blood pressure falling to 50/0 mmHg was seen in two others. The label attributes syncope to excessive postural hypotension, notes some episodes were preceded by supraventricular tachycardia at 120 to 160 beats per minute, and raises haemodilution as a contributor — supported by small but statistically significant falls in haematocrit, haemoglobin, white cells, total protein and albumin in controlled trials. Dizziness, lightheadedness or palpitations occurred in about 28% of patients in hypertension trials and 21% of patients in benign prostatic hyperplasia trials experienced dizziness, hypotension, postural hypotension, syncope or vertigo.',
        evidenceSource:
          'Terazosin capsules United States prescribing information, Warnings — Syncope and "First-dose" Effect, and Precautions — Orthostatic Hypotension and Laboratory Tests',
        measuredMetric:
          'Syncope and severe orthostatic hypotension rates in early dose-ranging studies, and orthostatic symptom rates in the clinical trial programme',
        auditFlag: 'caution',
      },
      {
        id: 'ter-a6',
        category: 'measured',
        title: 'Two rare harms whose damage comes from the delay',
        laymanSummary:
          'Priapism is very rare with this drug and causes permanent impotence if not treated quickly. Floppy iris syndrome persists after the drug is stopped and is managed by telling the surgeon, not by stopping.',
        technicalDetails:
          'The label records that terazosin and other alpha-1 antagonists have rarely been associated with priapism — "probably less than once in every several thousand patients", with two or three dozen cases reported — and that because the condition can lead to permanent impotence if not promptly treated, patients must be told to seek immediate medical attention. Separately, intraoperative floppy iris syndrome has been observed during cataract surgery in patients on or previously treated with alpha-1 blockers, with a flaccid iris billowing in irrigation currents, progressive miosis despite preoperative dilation, and potential iris prolapse toward the incisions; the label states there does not appear to be a benefit from stopping alpha-1 blocker therapy before cataract surgery. Both are cases where the harm is determined by whether information reached the right person in time rather than by dose.',
        evidenceSource:
          'Terazosin capsules United States prescribing information, Precautions — Priapism and Intraoperative Floppy Iris Syndrome',
        measuredMetric:
          'Labelled incidence of priapism and the labelled management of intraoperative floppy iris syndrome',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'The same quinazoline core, a different tail',
        laymanDesc:
          'Terazosin is one of three near-identical molecules — prazosin, terazosin, doxazosin — that block the same receptor. The only difference is what hangs off the end.',
        molecularDetail:
          '4-amino-6,7-dimethoxyquinazoline joined through piperazine to a tetrahydrofuran-2-carbonyl group, C19H25N5O4, dispensed as the hydrochloride dihydrate. Doxazosin substitutes a benzodioxan for the tetrahydrofuran; that single change accounts for the difference in half-life between the two.',
        iconName: 'Atom',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It blocks alpha-1 receptors in the prostate and bladder neck',
        laymanDesc:
          'Those receptors are abundant in the prostate and the bladder neck, and they hold that muscle tight. Blocked, the outlet opens.',
        molecularDetail:
          'The label states smooth muscle tone in prostate and bladder neck is mediated by sympathetic stimulation of alpha-1 adrenoceptors, abundant in prostate, prostatic capsule and bladder neck, and that reduction in symptoms and improvement in flow follow from relaxation of that muscle.',
        iconName: 'Unlock',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'The bladder itself keeps its strength',
        laymanDesc:
          'There are few of these receptors in the body of the bladder, so the drug opens the outlet without weakening the squeeze that empties it.',
        molecularDetail:
          'The label notes that because there are relatively few alpha-1 adrenoceptors in the bladder body, terazosin reduces bladder outlet obstruction without affecting bladder contractility — a genuine anatomical selectivity that is separate from receptor-subtype selectivity.',
        iconName: 'Shield',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'And the same receptors in arteries, which is the price',
        laymanDesc:
          'Alpha-1 receptors keep arteries partly constricted. Blocking them lowers blood pressure — useful if you need it, and the reason the first dose is 1 mg at bedtime.',
        molecularDetail:
          'Marked postural hypotension and syncope occur with the first dose or first few days and after any restart following interruption. In early dose-ranging studies syncope occurred in 3 of 14 subjects and blood pressure fell to 50/0 mmHg in two others; tolerance to the first-dose phenomenon did not necessarily develop.',
        iconName: 'TrendingDown',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Symptoms and flow improve; the gland is unchanged',
        laymanDesc:
          'Roughly seven men in ten get better flow and fewer symptoms. In the head-to-head trial terazosin cut the symptom score by 6.1 points against 2.6 on placebo.',
        molecularDetail:
          'Veterans Affairs Cooperative Study, 1,229 men, one year: symptom score change -2.6 placebo, -3.2 finasteride, -6.1 terazosin, -6.2 combination; peak flow change +1.4, +1.6, +2.7, +3.2 mL/s. Finasteride was no better than placebo on either and combination no better than terazosin alone.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'A second target that has nothing to do with any of this',
        laymanDesc:
          'Terazosin also speeds up an enzyme in the sugar-burning pathway, raising cellular energy. That has nothing to do with the prostate, and it is why the drug is now in a Parkinson’s trial.',
        molecularDetail:
          'Allosteric enhancement of phosphoglycerate kinase 1 raises glycolytic flux and cellular ATP. In Parkinson’s models across four systems it raised brain ATP, slowed neuron loss and partly restored motor function; in two national databases against a tamsulosin comparator, hazard ratios for developing Parkinson’s were 0.88 and 0.63 with a dose-response. It is now Arm C of a 1,200-patient Phase 3 platform trial that began in September 2025.',
        iconName: 'Zap',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'Veterans Affairs Cooperative Study of terazosin, finasteride or both (N Engl J Med 1996;335:533-539)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, four-arm',
        sampleSize: 1229,
        primaryEndpoint:
          'Change in American Urological Association symptom score and peak urinary flow rate at one year, placebo against terazosin 10 mg, finasteride 5 mg and the combination',
        endpointMet: true,
        statisticalPValue:
          'Symptom score -2.6, -3.2, -6.1 and -6.2 points; peak flow +1.4, +1.6, +2.7 and +3.2 mL/s; p<0.001 for terazosin and for combination against both finasteride and placebo',
        unreportedAdverseSignals:
          'Finasteride had no more effect than placebo on either measure, and combination was no better than terazosin alone — both findings contradicted by the later MTOPS trial in a population with larger prostates. Discontinuation for adverse effects was 1.6% on placebo against 4.8% to 7.8% in the three active arms.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId:
          'Glycolysis-enhancing alpha-1 blockers and Parkinson disease risk (JAMA Neurol 2021;78:407-413)',
        phase: 'Propensity-score-matched cohort study in two national databases',
        sampleSize: 294496,
        primaryEndpoint:
          'Hazard of developing Parkinson disease in men initiating terazosin, doxazosin or alfuzosin against men initiating tamsulosin for the same indication',
        endpointMet: true,
        statisticalPValue:
          'Danish registries (52,365 matched pairs): HR 0.88 (95% CI 0.81 to 0.98). United States Truven database (94,883 matched pairs): HR 0.63 (95% CI 0.58 to 0.69). Dose-response in both, with long-duration HR 0.79 (0.66 to 0.95) and 0.46 (0.36 to 0.57)',
        unreportedAdverseSignals:
          'The two databases differ threefold in effect size for the same exposure and outcome, which bounds how much of either estimate can be taken as causal. The comparator, tamsulosin, is chosen by prescribers for reasons — cardiovascular status, frailty, blood pressure — that also predict neurodegeneration, and the design cannot randomise that away.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId:
          'EJS ACT-PD platform trial, Arm C terazosin (NCT07207057, University College London)',
        phase: 'Phase 3, randomised, multi-arm multi-stage platform trial',
        sampleSize: 1200,
        primaryEndpoint:
          'Movement Disorder Society-sponsored revision of the Unified Parkinson’s Disease Rating Scale, in a placebo-controlled platform with telmisartan as a second experimental arm',
        endpointMet: false,
        statisticalPValue:
          'No results. The trial started on 12 September 2025 and is recruiting as of August 2026',
        unreportedAdverseSignals:
          'This is the first randomised test of the terazosin-Parkinson’s hypothesis in humans. Until it reports, every claim about this drug and neurodegeneration rests on animal models and on two observational cohorts that disagree threefold on the size of the effect.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Symptom score fell 6.1 points on terazosin against 2.6 on placebo and 3.2 on finasteride at one year in 1,229 men (p<0.001)',
        'Peak urinary flow rose 2.7 mL/s on terazosin against 1.4 on placebo in the same trial',
        'Syncope in 3 of 14 subjects and blood pressure falling to 50/0 mmHg in two others in early dose-ranging studies',
        'Orthostatic symptoms in about 28% of hypertension trial patients and 21% of benign prostatic hyperplasia trial patients',
        'Hazard ratio for developing Parkinson disease against tamsulosin users of 0.88 in Denmark and 0.63 in the United States, in propensity-matched cohorts',
      ],
      unsupportedInferences: [
        'That symptom and flow improvement reduce the need for surgery or the risk of acute retention, which the label states is yet to be determined',
        'That the ALLHAT cardiovascular harm applies to terazosin, which was not a trial arm and has no outcome trial of its own',
        'That terazosin slows Parkinson’s disease, an association from two databases whose effect estimates differ threefold and which is under randomised test for the first time',
        'That finasteride is ineffective in benign prostatic hyperplasia, the conclusion of this trial and the opposite of MTOPS in a larger-prostate population',
      ],
      whatFailedInitially: [
        'The label’s own indications section states the long-term effect on surgery, acute urinary obstruction and other complications is undetermined',
        'Combination with finasteride was no better than terazosin alone in the Veterans Affairs trial',
        'Tolerance to the first-dose hypotensive effect did not necessarily develop across all doses tested',
        'Alpha-blockers lost first-line status in hypertension on a trial of a sibling molecule that terazosin has never replicated in either direction',
      ],
      realWorldOutcome: [
        'Approved in 1987 and generic since 1999, at about ten United States cents a capsule at pharmacy acquisition cost',
        'Largely displaced for prostate symptoms by prostate-selective alpha-blockers that do not require bedtime titration',
        'Reappeared in 2019 as a candidate disease-modifying agent in Parkinson’s disease through an activity unrelated to its receptor',
        'Now Arm C of a 1,200-patient Phase 3 academic platform trial — a repurposing of an off-patent drug that no company has a reason to fund',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule at 1, 2, 5 and 10 mg, and an oral solution; started at 1 mg at bedtime and titrated slowly',
      description:
        'The label requires initiation at 1 mg at bedtime and states that the 2, 5 and 10 mg capsules are not indicated as initial therapy, because of the first-dose hypotensive effect. The same requirement applies after any interruption of several days. Onset in benign prostatic hyperplasia is rapid, with the label reporting that approximately 70% of patients experience improved flow and symptoms; measurements in the pivotal studies were taken about 24 hours after dosing, supporting once-daily use.',
      safetyProfile:
        'Marked postural hypotension and syncope occur with the first dose, the first few days, dose increases, and restarts after interruption; patients are advised to avoid driving or hazardous tasks for 12 hours after each. Syncope has occasionally been preceded by supraventricular tachycardia at 120 to 160 beats per minute. Small but significant falls in haematocrit, haemoglobin, white cells, total protein and albumin were seen in controlled trials, attributed to haemodilution. Priapism has rarely been reported — probably less than once in several thousand patients — and requires immediate treatment to avoid permanent impotence. Intraoperative floppy iris syndrome occurs in current and former users and stopping the drug beforehand does not appear to help. Prostate cancer must be excluded before starting treatment for benign prostatic hyperplasia, because the two conditions cause the same symptoms and frequently coexist.',
    },
    commonQuestions: [
      {
        q: 'Will this stop me needing prostate surgery later?',
        a: 'Nobody knows, and unusually the label says so in the same breath as the benefit. Its indications section states that about 70% of men get improved flow and symptoms — and then that "the long-term effects of terazosin capsules on the incidence of surgery, acute urinary obstruction or other complications of BPH are yet to be determined". The nearest evidence comes from a trial of a closely related drug: in MTOPS, the alpha-blocker arm did not significantly reduce acute urinary retention or the need for invasive therapy, while finasteride, which shrinks the gland, did. If avoiding an operation is the goal, that is a different conversation from feeling better next week.',
        auditNote:
          'It is rare for a label to name the outcome it has not measured. This one does, in the indications section, which is the first thing anyone reads.',
      },
      {
        q: 'Why must I take the first dose at bedtime?',
        a: 'Because the first dose can drop your blood pressure hard enough to make you faint. The label requires starting at 1 mg at bedtime and states that the 2, 5 and 10 mg capsules are not indicated as initial therapy. In early studies where single doses up to 7.5 mg were given, three of fourteen subjects had syncope and two more had blood pressure fall to 50/0 mmHg — and the label notes that tolerance to the first-dose effect did not necessarily develop. The same precaution applies if you stop for several days and restart, and the advice is to avoid driving or anything hazardous for 12 hours after the first dose, after any increase, and after any restart.',
      },
      {
        q: 'Is it true this drug might help Parkinson’s disease?',
        a: 'It might, and that is currently being tested for the first time. Terazosin turns out to activate phosphoglycerate kinase 1, an enzyme in the glycolysis pathway, which raises cellular ATP. In Parkinson’s models in mice, rats, flies and stem-cell-derived neurons it raised brain ATP, slowed neuron loss and partly restored movement. Two large database studies then compared men on terazosin, doxazosin or alfuzosin against men on tamsulosin — same indication, no glycolysis effect — and found lower Parkinson’s rates: a hazard ratio of 0.88 in the Danish national registries and 0.63 in a United States insurance database, with an apparent dose-response. Those two numbers disagree by a factor of three for the same question, which tells you how much unmeasured difference between the two groups of men is still in the estimate. Terazosin is now Arm C of a 1,200-patient Phase 3 platform trial that started in September 2025.',
        auditNote:
          'Two observational cohorts agreeing on direction and disagreeing threefold on magnitude is exactly the situation a randomised trial exists to resolve. Until it reports, this is a hypothesis with good mechanistic support.',
      },
      {
        q: 'Is terazosin bad for the heart, like doxazosin was?',
        a: 'Unknown for this molecule. The trial that changed how alpha-blockers are used in hypertension was ALLHAT, which randomised 24,335 people to doxazosin or chlortalidone and stopped the doxazosin arm early after finding combined cardiovascular events 25% higher and heart failure doubled. Terazosin was not in that trial and has never had an outcome trial of its own. So the caution attached to it is a class inference from a sibling molecule — reasonable, given how similar the two are chemically, and untested. It is worth noticing that the Parkinson’s literature applies the same class logic in the opposite direction, grouping terazosin with doxazosin and alfuzosin as glycolysis enhancers. Class inference is not wrong; it is just not a measurement.',
      },
      {
        q: 'What are the rare things I should actually watch for?',
        a: 'Two, and both are cases where the delay causes the damage rather than the drug. A painful erection lasting hours and not relieved by anything is priapism: the label puts it at probably less than once in several thousand patients, with two or three dozen cases reported, and states it can lead to permanent impotence if not brought to immediate medical attention. And if you are ever booked for cataract surgery, tell the surgeon you have taken an alpha-blocker, even if you stopped years ago — the iris becomes floppy during the operation, and the label states there does not appear to be a benefit from stopping the drug beforehand. What helps is the surgeon knowing in advance.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Lepor H, Williford WO, Barry MJ, et al. The efficacy of terazosin, finasteride, or both in benign prostatic hyperplasia. Veterans Affairs Cooperative Studies Benign Prostatic Hyperplasia Study Group. N Engl J Med 1996;335:533-539',
        identifier: '10.1056/NEJM199608223350801',
        kind: 'doi',
      },
      {
        label:
          'Cai R, Zhang Y, Simmering JE, et al. Enhancing glycolysis attenuates Parkinson’s disease progression in models and clinical databases. J Clin Invest 2019;129:4539-4549',
        identifier: '10.1172/JCI129987',
        kind: 'doi',
      },
      {
        label:
          'Simmering JE, Welsh MJ, Liu L, Narayanan NS, Pottegård A. Association of Glycolysis-Enhancing alpha-1 Blockers With Risk of Developing Parkinson Disease. JAMA Neurol 2021;78:407-413',
        identifier: '10.1001/jamaneurol.2020.5157',
        kind: 'doi',
      },
      {
        label:
          'ALLHAT Collaborative Research Group. Major cardiovascular events in hypertensive patients randomized to doxazosin vs chlorthalidone. JAMA 2000;283:1967-1975 — the alpha-blocker outcome trial in which terazosin was not studied',
        identifier: '10.1001/jama.283.15.1967',
        kind: 'doi',
      },
      {
        label:
          'Edmond J. Safra Accelerating Clinical Trials in Parkinson’s Disease (EJS ACT-PD), a Phase 3 multi-arm multi-stage platform trial led by University College London; Arm C is terazosin, started 12 September 2025, planned enrolment 1,200',
        identifier: 'NCT07207057',
        kind: 'nct',
      },
      {
        label:
          'Terazosin capsules United States prescribing information — Indications and Usage (including the statement that long-term effects on surgery and acute urinary obstruction are yet to be determined), Warnings (Syncope and "First-dose" Effect), Precautions (Prostatic Cancer, Intraoperative Floppy Iris Syndrome, Orthostatic Hypotension, Priapism, Laboratory Tests), Clinical Pharmacology, via the openFDA drug label endpoint',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22terazosin%22',
        kind: 'regulatory',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — terazosin, 38 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 5401 — terazosin structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5401',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 9. Vardenafil — twenty-four times the price of sildenafil for the same mechanism, with a QT
  //    effect matching the positive control and a head-to-head trial that was never reported.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'vardenafil',
    name: 'Vardenafil',
    tradeName: 'Levitra / Staxyn / Vardenafil Hydrochloride',
    sponsor:
      'Bayer HealthCare, which held NDA 021400 for LEVITRA and NDA 200179 for the STAXYN orally disintegrating tablet — both now listed as Discontinued in Drugs@FDA, with a Federal Register determination that the products were not withdrawn for safety or effectiveness reasons. Only generics remain on the United States market',
    targetGene: 'PDE5A',
    targetProtein:
      'Phosphodiesterase type 5, the cyclic-GMP-hydrolysing enzyme of corpus cavernosum and vascular smooth muscle — the same target as sildenafil and tadalafil',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2003,
    indication: 'Treatment of erectile dysfunction',
    patientFriendlyIndication: 'Erectile dysfunction',
    anatomicalSite: 'Phosphodiesterase-5 in corpus cavernosum smooth muscle',
    conditionContext: {
      conditionExplainer:
        'Arousal releases nitric oxide in the penis, which raises cyclic GMP, which relaxes smooth muscle so blood flows in. PDE5 destroys the cyclic GMP and ends it. Every drug in this class blocks PDE5; they differ in how fast they act, how long they last, and what else they hit.',
      whyItMatters:
        'Vardenafil is the third-place molecule in a three-drug class, and its page is mostly an economics and evidence-reporting audit rather than a pharmacology one. It costs about twenty-four times as much per tablet as sildenafil at wholesale, it is the one PDE5 inhibitor whose label carries a QT warning, its brand and orally disintegrating forms have both been discontinued, and the one manufacturer trial that compared it head to head against tadalafil in 759 men has no posted results.',
      whoTakesThis:
        'Men with erectile dysfunction, generally after or instead of sildenafil. Not anyone taking a nitrate or nitric oxide donor in any form, not with riociguat, and — per the label — not men with congenital long QT syndrome or on class IA or class III antiarrhythmics.',
      clinicalGoals:
        'Improved erectile function on the International Index of Erectile Function and a higher proportion of successful intercourse attempts. No PDE5 inhibitor has an outcome claim beyond that.',
    },
    oneSentenceVerdict:
      'A PDE5 inhibitor pharmacologically interchangeable with sildenafil, which raised the proportion of diabetic men reporting improved erections to 57% at 10 mg and 72% at 20 mg against 13% on placebo in a 452-patient trial — and which now costs US$2.97 a tablet against sildenafil’s US$0.1220, carries the class’s only QT warning after producing the same Fridericia QTc rise as the moxifloxacin positive control, and whose 759-man head-to-head trial against tadalafil has no results on the registry.',
    laymanHowItWorks:
      'Vardenafil does exactly what sildenafil does: it blocks the enzyme that destroys the chemical messenger responsible for an erection, so the messenger lasts longer and blood stays in. Sexual stimulation is still required — the label says so. It is taken about an hour before sex and lasts a few hours, so in practice it behaves like sildenafil rather than like the long-acting tadalafil. The differences that matter are not in how it works but in what it costs and in a small effect it has on the heart’s electrical recovery that the other two do not carry a warning about.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 56,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$2.97 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 16 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States in August 2003 under NDA 021400 and generic since 2018. It remains the outlier of its class on price: US$2.97 a tablet against US$0.1220 for sildenafil in the same survey, roughly twenty-four times as much, across only 16 listed products against sildenafil’s 117. Both branded forms — LEVITRA and the STAXYN orally disintegrating tablet — are listed as Discontinued in Drugs@FDA, each carrying the Federal Register determination that the product was not discontinued or withdrawn for safety or effectiveness reasons. A thin generic market for a molecule the originator has left is the usual explanation for a price like this, and it is a market fact rather than a pharmacological one.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'This is the rare page where the substitution question has an almost arithmetic answer. Three drugs share one mechanism and one indication. Two of them are widely supplied and cost cents; this one costs nearly three dollars a tablet and has never demonstrated an advantage over either in a reported head-to-head trial.',
      conventionalRx: [
        {
          name: 'Sildenafil (Viagra)',
          class: 'PDE5 inhibitor',
          howItCompares:
            'Same mechanism, same onset, same duration, same nitrate contraindication, and no QT warning. Pharmacies acquire it for about twelve United States cents a tablet across 117 listed products. Vardenafil has never been shown in a published head-to-head trial to do anything sildenafil does not.',
          typicalCost:
            'US$0.1220 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 117 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: about one twenty-fourth of the price; far more manufacturers; the largest safety database in the class. Cons: the 10-fold PDE6 selectivity margin that causes blue-tinged vision is narrower than vardenafil’s.',
        },
        {
          name: 'Tadalafil (Cialis)',
          class: 'PDE5 inhibitor with a long half-life',
          howItCompares:
            'Genuinely different in a way vardenafil is not: it lasts long enough to be taken daily rather than before an event, and it carries a second licensed indication in benign prostatic hyperplasia. Bayer ran a 759-man randomised double-dummy trial comparing vardenafil against tadalafil for intercourse attempted within 45 minutes of dosing. The registry record carries no results.',
          typicalCost:
            'Widely available as a generic in the United States at pharmacy acquisition cost in the same low range as sildenafil',
          prosAndCons:
            'Pros: duration measured in days; a second indication; cheap. Cons: back pain and myalgia are more common; the nitrate contraindication persists longer because the drug does.',
        },
        {
          name: 'Looking for the cause of the symptom',
          class: 'Diagnostic evaluation rather than a drug',
          howItCompares:
            'The vardenafil label opens its Warnings section with the instruction that evaluation of erectile dysfunction "should include a medical assessment, a determination of potential underlying causes and the identification of appropriate treatment". The trial evidence for this drug is largest in men with diabetes, which is a reminder of what the symptom often signals.',
          typicalCost:
            'The cost of a consultation and standard cardiovascular and endocrine testing',
          prosAndCons:
            'Pros: erectile dysfunction is frequently the first sign of endothelial or endocrine disease, none of which a PDE5 inhibitor treats. Cons: slower than a prescription, and a subscription service has no reason to do it.',
        },
      ],
      naturalFoods: [
        {
          name: 'Unregulated "herbal" erectile products',
          activeCompound:
            'Frequently undeclared sildenafil, tadalafil, vardenafil, or a chemical analogue of one of them',
          biologicalMechanism:
            'The mechanism is the drug class on this page, present without being on the label. It matters because the nitrate contraindication is absolute and because vardenafil analogues carry the QT question with them.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'Not stated here as advice. The relevant fact is regulatory: adulteration of sexual-enhancement supplements with PDE5 inhibitors and their analogues is among the most frequently reported categories in the FDA’s tainted-products database.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'No nitrates, ever, in any form',
          action:
            'Say if you take glyceryl trinitrate, isosorbide, nicorandil or amyl nitrite, however occasionally.',
          patientImpact:
            'Administration with nitrates, regularly or intermittently, and with nitric oxide donors is a contraindication. The label adds that "a suitable time interval following dosing of vardenafil hydrochloride tablets for the safe administration of nitrates or nitric oxide donors has not been determined."',
          clinicalPrecaution:
            'The same contraindication covers the guanylate cyclase stimulator riociguat. Caution is separately advised with alpha-blockers, where the label directs a 5 mg starting dose in men on stable alpha-blocker therapy.',
        },
        {
          name: 'Mention any heart rhythm problem or rhythm drug',
          action:
            'Say if you have long QT syndrome or take amiodarone, sotalol, quinidine, procainamide or a similar drug.',
          patientImpact:
            'The label states that patients with congenital QT syndrome or taking class IA or class III antiarrhythmics should avoid vardenafil. This warning is specific to this molecule within the class.',
          clinicalPrecaution:
            'The thorough QT study measured the effect at one hour post-dose, approximating peak concentration; the label states the clinical impact of the observed QTc changes is unknown.',
        },
        {
          name: 'Four hours, sudden vision loss, sudden hearing loss — all mean stop and get help',
          action: 'Seek immediate medical attention for any of the three.',
          patientImpact:
            'The label directs immediate medical assistance for an erection lasting more than four hours, and stopping the drug and seeking care for sudden loss of vision in one or both eyes, which could indicate non-arteritic anterior ischaemic optic neuropathy, or sudden decrease or loss of hearing.',
          clinicalPrecaution:
            'Men with a "crowded" optic disc may be at increased risk of NAION, and the drug should be used with caution and only where anticipated benefit outweighs risk in anyone with a history of it.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CCCC1=NC(=C2N1N=C(NC2=O)C3=C(C=CC(=C3)S(=O)(=O)N4CCN(CC4)CC)OCC)C',
      chemicalFormula: 'C23H32N6O4S',
      molecularWeight: '488.60 g/mol (free base); dispensed as the hydrochloride trihydrate',
      targetReceptorAffinity:
        'An imidazotriazinone rather than sildenafil’s pyrazolopyrimidinone, but built on the same design principle: a cyclic-GMP mimic occupying the catalytic site of PDE5, carrying the same ethoxyphenyl sulfonamide-piperazine arm with an ethyl rather than a methyl on the piperazine nitrogen. The structural relationship to sildenafil is close enough that the two are frequently confused in analyses of adulterated supplements, and analogues of both circulate in that supply chain. Systemic vasodilation produces a mean maximum supine blood pressure decrease of 7 mmHg systolic and 8 mmHg diastolic in healthy volunteers, and 10 mg raises mean heart rate by about 5 beats per minute against placebo.',
      structureSource: {
        label:
          'PubChem CID 135400189 (vardenafil) — canonical SMILES, molecular formula and weight, as carried on the enriched record; haemodynamic figures from the vardenafil hydrochloride prescribing information, sections 5.1 and 12.2',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/135400189',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'var-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Resolve vardenafil from sildenafil and from the analogue panel',
          description:
            'Vardenafil and sildenafil differ by a ring nitrogen position and a methylene on the piperazine, and both have families of designer analogues circulating in adulterated products. A method that identifies one without excluding the other and its analogues is not an identity test for either.',
          reagentsAndBuffer:
            'Vardenafil hydrochloride trihydrate reference standard, sildenafil and tadalafil as resolution markers, curated analogue reference panel, UHPLC with high-resolution accurate-mass detection, 1H and 13C NMR, Karl Fischer titration for the trihydrate water',
        },
        {
          id: 'var-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Assemble the imidazotriazinone, then sulfonylate and aminate',
          description:
            'The published route builds the 2-propyl-5-methyl imidazo-triazinone core from an amino-carboxamide precursor, condenses it with a 2-ethoxybenzoyl unit, then chlorosulfonates the pendant aryl ring and displaces with N-ethylpiperazine. As with sildenafil, the chlorosulfonation is the hazardous and impurity-defining step.',
          dependsOnStepId: 'var-w1',
          reagentsAndBuffer:
            'Imidazole carboxamide precursors, 2-ethoxybenzoyl chloride, base-mediated cyclisation, chlorosulfonic acid, N-ethylpiperazine, hydrochloric acid with controlled hydration to the trihydrate',
        },
        {
          id: 'var-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Control alkyl sulfonate esters and fix the hydrate state',
          description:
            'Chlorosulfonation followed by alcoholic work-up is the classic source of genotoxic alkyl sulfonate esters, and the marketed salt is a trihydrate whose water is part of the potency calculation. Both are release-critical and neither is visible in a simple assay.',
          dependsOnStepId: 'var-w2',
          reagentsAndBuffer:
            'LC-MS at parts-per-million sensitivity for alkyl sulfonate esters, controlled-humidity crystallisation of the hydrochloride trihydrate with seeding, dynamic vapour sorption to map hydrate boundaries, dissolution testing across the physiological pH range',
        },
        {
          id: 'var-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Measure hERG alongside PDE5, on the same material',
          description:
            'This is the one PDE5 inhibitor with a labelled QT warning, so the cardiac ion channel assay is not a background formality — it is the property that distinguishes the molecule from its competitors. Running it on the same batch and in the same campaign as the PDE5 potency assay is what makes the safety margin a real number rather than a comparison across laboratories.',
          dependsOnStepId: 'var-w3',
          reagentsAndBuffer:
            'Recombinant human PDE5A with fluorescence-polarisation cyclic GMP substrate, matched PDE6 and PDE11 counter-screens, automated patch clamp on hERG-expressing HEK293 cells, sildenafil and tadalafil as in-assay comparators, free-fraction correction to express the margin against unbound therapeutic concentration',
        },
        {
          id: 'var-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Report the active-controlled trial as well as the placebo-controlled one',
          description:
            'Placebo-controlled trials establish that a PDE5 inhibitor works; that was settled in 1998. What a third entrant needs to show is a difference from the first two, which requires an active-controlled trial reported in full. One such trial exists for this molecule, in 759 men against tadalafil, and its results are not in the public record.',
          dependsOnStepId: 'var-w4',
          reagentsAndBuffer:
            'Randomised double-dummy active-controlled design with a prespecified non-inferiority or superiority margin, International Index of Erectile Function and Sexual Encounter Profile as prespecified endpoints, registry results posting within the statutory window, publication irrespective of direction',
        },
      ],
    },
    keyAudits: [
      {
        id: 'var-a1',
        category: 'measured',
        title: 'Twenty-four times the price of the identical mechanism',
        laymanSummary:
          'Pharmacies pay US$2.97 for a vardenafil tablet and US$0.12 for a sildenafil tablet. The two drugs block the same enzyme, act over the same time course, and carry the same absolute contraindication.',
        technicalDetails:
          'In the CMS National Average Drug Acquisition Cost survey effective 19 August 2026, the median acquisition cost is US$2.97 per tablet for vardenafil across 16 listed generic products, against US$0.1220 for sildenafil across 117 listed products — a ratio of roughly 24 to 1. The product-count difference is the mechanism: sildenafil has a deep generic market and vardenafil has a thin one. Both branded vardenafil products are gone. LEVITRA under NDA 021400 and STAXYN under NDA 200179 are both listed as Discontinued in Drugs@FDA, each strength carrying the Federal Register determination that the product "was not discontinued or withdrawn for safety or effectiveness reasons" — the standard phrasing for a commercial withdrawal. A drug the originator has abandoned, supplied by few manufacturers, priced at twenty-four times its interchangeable competitor, is a supply-chain artefact and not a clinical judgement, and no part of that appears on a prescription.',
        evidenceSource:
          'CMS National Average Drug Acquisition Cost survey effective 19 August 2026 (vardenafil, 16 products; sildenafil, 117 products); FDA Drugs@FDA applications NDA 021400 (LEVITRA) and NDA 200179 (STAXYN), both Discontinued',
        measuredMetric:
          'Median United States pharmacy acquisition cost per tablet, vardenafil against sildenafil, and the marketing status of both branded applications',
        auditFlag: 'verified',
      },
      {
        id: 'var-a2',
        category: 'measured',
        title: 'At the therapeutic dose it matched the QT positive control',
        laymanSummary:
          'In the study designed to measure effects on heart rhythm, 10 mg of vardenafil lengthened the corrected QT interval by 8 milliseconds — exactly the same as moxifloxacin, the antibiotic used as the known-positive comparator.',
        technicalDetails:
          'The thorough QT study was a single-dose, double-blind, randomised, placebo- and active-controlled crossover in 59 healthy men aged 45 to 60, with QT measured one hour post-dose at approximately peak concentration. The 80 mg supratherapeutic dose was chosen to cover concentrations reached when 5 mg vardenafil is combined with ritonavir. Using Fridericia correction, the mean change from baseline relative to placebo was +8 msec (90% CI 6 to 9) for vardenafil 10 mg, +10 msec (8 to 11) for 80 mg, and +8 msec (6 to 9) for moxifloxacin 400 mg — the active control. By individual correction the figures were +4, +6 and +7 msec. The label states that therapeutic and supratherapeutic doses of vardenafil and the active control produced similar increases in QTc, that the study was not designed for direct statistical comparison between drugs or doses, and that "the clinical impact of these QTc changes is unknown". Mean heart rate rose 5 beats per minute at 10 mg and 6 at 80 mg. The consequence on the label is a specific warning that patients with congenital QT syndrome or taking class IA or class III antiarrhythmics should avoid the drug — a restriction the other two PDE5 inhibitors in common use do not carry.',
        evidenceSource:
          'Vardenafil hydrochloride tablets United States prescribing information, section 12.2 Effects on Cardiac Electrophysiology (Table 6) and section 5.7 QT Prolongation',
        measuredMetric:
          'Mean Fridericia-corrected QT change from baseline relative to placebo at one hour post-dose, against a moxifloxacin active control',
        auditFlag: 'caution',
      },
      {
        id: 'var-a3',
        category: 'failed',
        title: 'The head-to-head trial against tadalafil was run and never reported',
        laymanSummary:
          'Bayer randomised 759 men to vardenafil or tadalafil in a double-dummy trial testing which worked faster. No results appear on the registry, and no publication of it could be found.',
        technicalDetails:
          'NCT00663130 — "A Randomised, Double-blind, Double-dummy, Parallel-group, Active-controlled Study Evaluating the Efficacy of Vardenafil Versus Tadalafil When Intercourse is Attempted Within 45 Minutes of Administration in Subjects With Erectile Dysfunction", sponsored by Bayer, actual enrolment 759, with Sexual Encounter Profile question 3 as the primary outcome. The registry record carries no results section, and a search of the indexed literature at the time of writing did not locate a publication of it. Two further Bayer trials in the same registry cluster are in the same position: NCT00678704, a placebo-controlled study of 790 men with diabetes, and NCT00664833, a 1,029-man factorial cluster-randomised study of the effect of educating the primary care physician and the patient — nearly 2,600 randomised participants across the three, with no posted results. For a third entrant into a class where the first two are cheap and interchangeable, an unreported active-controlled comparison is the single most consequential missing document.',
        evidenceSource:
          'ClinicalTrials.gov registry records NCT00663130 (n=759, vardenafil against tadalafil, no results posted), NCT00678704 (n=790, no results posted) and NCT00664833 (n=1,029, no results posted), all sponsored by Bayer',
        measuredMetric:
          'Reporting status of the manufacturer-sponsored active-controlled comparison against another PDE5 inhibitor',
        auditFlag: 'caution',
      },
      {
        id: 'var-a4',
        category: 'measured',
        title: 'What was measured, and it is real: 72% against 13% in diabetic men',
        laymanSummary:
          'In 452 men with diabetes, 72% on the 20 mg dose reported improved erections against 13% on placebo. The drug works; that has never been the question.',
        technicalDetails:
          'A multicentre double-blind placebo-controlled fixed-dose Phase 3 trial randomised 452 men with type 1 or type 2 diabetes and erectile dysfunction to vardenafil 10 mg, 20 mg or placebo as needed for 12 weeks. On the global assessment question about improved erections in the previous four weeks, 57% on 10 mg and 72% on 20 mg reported improvement against 13% on placebo (p<0.0001, dose-dependence p=0.02). Final International Index of Erectile Function erectile function domain scores were 17.1 and 19.0 against 12.6 on placebo (p<0.0001, dose-dependence p=0.03). Both doses significantly increased rates of successful penetration and successful intercourse (p<0.0001), across all baseline severities, all HbA1c strata and both types of diabetes. Adverse events were mainly mild to moderate headache (up to 13%), flushing (up to 10%) and rhinitis (up to 10%). This is a clean, adequately sized, published positive trial in a population where erectile dysfunction is hardest to treat — and it establishes that vardenafil is a PDE5 inhibitor, not that it is a better one.',
        evidenceSource:
          'Goldstein I, Young JM, Fischer J, et al. Vardenafil, a new phosphodiesterase type 5 inhibitor, in the treatment of erectile dysfunction in men with diabetes: a multicenter double-blind placebo-controlled fixed-dose study. Diabetes Care 2003;26:777-783',
        doi: '10.2337/diacare.26.3.777',
        measuredMetric:
          'Proportion reporting improved erections on the global assessment question, and IIEF erectile function domain score, at 12 weeks',
        auditFlag: 'verified',
      },
      {
        id: 'var-a5',
        category: 'measured',
        title: 'The interaction table is longer than the efficacy section',
        laymanSummary:
          'With ritonavir the maximum dose is 2.5 mg in 72 hours. With several antifungals and antibiotics it is 2.5 or 5 mg in 24 hours. On an alpha-blocker the starting dose halves.',
        technicalDetails:
          'Section 2.4 specifies: no more than 2.5 mg in a 72-hour period with ritonavir or cobicistat; no more than 2.5 mg in 24 hours with indinavir, saquinavir, atazanavir, ketoconazole 400 mg daily, itraconazole 400 mg daily or clarithromycin; no more than 5 mg in 24 hours with ketoconazole 200 mg daily, itraconazole 200 mg daily or erythromycin. The recommended starting dose is 5 mg in men on stable alpha-blocker therapy, 5 mg in moderate hepatic impairment with a 10 mg ceiling, and 5 mg is to be considered in men aged 65 or over. Against a normal starting dose of 10 mg and a maximum of 20 mg, that is an eightfold range dictated by co-medication. The clinical significance is concentrated in the QT question: the supratherapeutic arm of the thorough QT study was chosen specifically to reproduce the exposure produced by a low vardenafil dose plus ritonavir.',
        evidenceSource:
          'Vardenafil hydrochloride tablets United States prescribing information, sections 2.3 and 2.4 Dosage Adjustments, and 12.2',
        measuredMetric:
          'Labelled maximum doses in the presence of strong and moderate CYP3A4 inhibitors, and starting doses in alpha-blocker use, hepatic impairment and old age',
        auditFlag: 'caution',
      },
      {
        id: 'var-a6',
        category: 'inferred',
        title: 'A third entrant with no demonstrated point of difference',
        laymanSummary:
          'Vardenafil arrived five years after sildenafil into a class that already worked. Nothing in its label claims it does anything the earlier drug does not.',
        technicalDetails:
          'The indication is a single sentence: treatment of erectile dysfunction. There is no subgroup claim, no onset claim, no duration claim, and no comparative claim of any kind on the label. The registration programme was placebo-controlled, which is the right design to show a drug works and the wrong one to show it is preferable. The one active-controlled trial in the registry — against tadalafil, on speed of onset, in 759 men — has no results. The differences that do exist run against it: a QT warning the others do not carry, a phenylalanine content warning on the orally disintegrating form, a thinner generic supply, and a price twenty-four times higher. A me-too drug is not a bad drug; the audit point is that "as good as" has never been demonstrated in a reported comparison either, and the whole commercial case for a third PDE5 inhibitor rested on a difference that was never published.',
        evidenceSource:
          'Vardenafil hydrochloride tablets United States prescribing information, section 1 Indications and Usage; ClinicalTrials.gov NCT00663130 (unreported active-controlled comparison)',
        inferredClaim:
          'That vardenafil offers a clinical advantage over sildenafil or tadalafil — never claimed on its label, tested once in a registered head-to-head trial, and never reported',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'The same target, a slightly different ring',
        laymanDesc:
          'Vardenafil is built on the same idea as sildenafil — a decoy that looks like the messenger the enzyme eats — with one ring atom moved and one extra carbon on a side chain.',
        molecularDetail:
          'An imidazo[5,1-f][1,2,4]triazin-4-one carrying the same 2-ethoxyphenyl sulfonamide-piperazine arm as sildenafil, with an N-ethyl rather than N-methyl piperazine. C23H32N6O4S, dispensed as the hydrochloride trihydrate.',
        iconName: 'Atom',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Arousal still has to happen first',
        laymanDesc:
          'The drug amplifies a signal; it does not create one. The label states that sexual stimulation is required for a response to treatment.',
        molecularDetail:
          'Nitric oxide released during sexual stimulation activates soluble guanylate cyclase and raises cyclic GMP in corpus cavernosum smooth muscle. Vardenafil competitively occupies the PDE5 catalytic site and prevents hydrolysis of that cyclic GMP.',
        iconName: 'Zap',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'Taken about an hour before, lasting hours not days',
        laymanDesc:
          'It is an on-demand drug, like sildenafil. That is the practical difference from tadalafil, which lasts long enough to take daily.',
        molecularDetail:
          'The label directs dosing approximately 60 minutes before sexual activity, once daily at most, with or without food. Starting dose 10 mg, range 5 to 20 mg, with 5 mg considered from age 65 and 5 mg required on stable alpha-blocker therapy or in moderate hepatic impairment.',
        iconName: 'Clock',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'Blood pressure falls a little, everywhere',
        laymanDesc:
          'PDE5 sits on blood vessels throughout the body, so the drug drops pressure slightly — and dangerously if combined with a nitrate.',
        molecularDetail:
          'Mean maximum supine blood pressure decrease of 7 mmHg systolic and 8 mmHg diastolic in healthy volunteers, with mean heart rate up about 5 beats per minute at 10 mg. Nitrates and nitric oxide donors are contraindicated, as is riociguat; alpha-blockers require a halved starting dose.',
        iconName: 'TrendingDown',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Measured effect: 72% against 13% in diabetic men',
        laymanDesc:
          'In the trial in men with diabetes, nearly three-quarters on the higher dose reported improvement against roughly one in eight on placebo.',
        molecularDetail:
          'Diabetes Care 2003, 452 men, 12 weeks: global assessment of improved erections 57% at 10 mg and 72% at 20 mg against 13% on placebo (p<0.0001); IIEF erectile function domain 17.1 and 19.0 against 12.6 (p<0.0001); significant increases in successful penetration and successful intercourse at both doses.',
        iconName: 'CheckCircle',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And the electrical effect the class siblings do not carry',
        laymanDesc:
          'At the ordinary dose, vardenafil lengthened the heart’s corrected recovery interval by the same amount as the drug used in the study as a known QT prolonger.',
        molecularDetail:
          'Thorough QT study in 59 healthy men: Fridericia-corrected QT change relative to placebo at one hour was +8 msec (90% CI 6 to 9) at 10 mg, +10 msec at 80 mg, and +8 msec for moxifloxacin 400 mg active control. The label states the clinical impact is unknown and directs that patients with congenital QT syndrome or on class IA or III antiarrhythmics avoid the drug.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Vardenafil in men with diabetes (Diabetes Care 2003;26:777-783)',
        phase: 'Phase 3, multicentre, randomised, double-blind, placebo-controlled, fixed-dose',
        sampleSize: 452,
        primaryEndpoint:
          'International Index of Erectile Function domain scores, rates of vaginal penetration and successful intercourse, and a global assessment of erection improvement over 12 weeks in men with type 1 or type 2 diabetes',
        endpointMet: true,
        statisticalPValue:
          'Improved erections in 57% at 10 mg and 72% at 20 mg against 13% on placebo (p<0.0001, dose-dependence p=0.02); erectile function domain 17.1 and 19.0 against 12.6 (p<0.0001)',
        unreportedAdverseSignals:
          'Headache in up to 13%, flushing and rhinitis in up to 10% each. This is a placebo-controlled trial: it establishes that the drug works and says nothing about whether it works better than the drug approved five years earlier.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Vardenafil versus tadalafil at 45 minutes (NCT00663130, Bayer)',
        phase: 'Randomised, double-blind, double-dummy, parallel-group, active-controlled',
        sampleSize: 759,
        primaryEndpoint:
          'Sexual Encounter Profile question 3 when intercourse is attempted within 45 minutes of administration',
        endpointMet: false,
        statisticalPValue:
          'No results. The registry record carries no results section, and no publication of the trial could be located at the time of writing',
        unreportedAdverseSignals:
          'This is the only registered active-controlled comparison of vardenafil against another PDE5 inhibitor. Its outcome is the single fact that would justify or undermine choosing this molecule over the cheaper ones, and it is not in the public record.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'Effect of educating the primary care physician and the patient (NCT00664833, Bayer)',
        phase: 'Open-label, multicentre, factorial design, cluster-randomised',
        sampleSize: 1029,
        primaryEndpoint:
          'Effect of education of the primary care physician or of the patient on outcomes when treating erectile dysfunction with vardenafil',
        endpointMet: false,
        statisticalPValue: 'No results posted on the registry',
        unreportedAdverseSignals:
          'A cluster-randomised trial of an educational intervention around a drug, run by the drug’s manufacturer, with 1,029 participants and no reported result. Combined with the 759-man head-to-head and the 790-man diabetes study in the same registry cluster, nearly 2,600 randomised participants are unaccounted for in the public record.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Improved erections in 72% at 20 mg and 57% at 10 mg against 13% on placebo in 452 men with diabetes over 12 weeks',
        'IIEF erectile function domain 19.0 and 17.1 against 12.6 on placebo in the same trial',
        'Fridericia-corrected QT +8 msec at 10 mg and +10 msec at 80 mg, against +8 msec for the moxifloxacin active control',
        'Mean maximum supine blood pressure decrease of 7/8 mmHg and heart rate increase of about 5 beats per minute in healthy volunteers',
        'US$2.97 per tablet at pharmacy acquisition cost across 16 listed products, against US$0.1220 for sildenafil across 117',
      ],
      unsupportedInferences: [
        'That vardenafil acts faster or better than tadalafil, the question its 759-man head-to-head trial was designed to answer and never reported',
        'That it offers any clinical advantage over sildenafil, a claim absent from its label and untested in any reported comparison',
        'That the QTc increase matching a known QT-prolonging positive control is clinically unimportant, which the label states is unknown',
        'That its price reflects anything about the drug rather than about how few manufacturers still make it',
      ],
      whatFailedInitially: [
        'Both branded products, LEVITRA and STAXYN, are listed as Discontinued in Drugs@FDA',
        'The manufacturer-sponsored head-to-head trial against tadalafil has no posted results and no located publication',
        'Two further manufacturer trials totalling 1,819 participants also carry no posted results',
        'It is the only PDE5 inhibitor in common use whose label restricts patients with congenital QT syndrome or on class IA or III antiarrhythmics',
      ],
      realWorldOutcome: [
        'Approved in August 2003 under NDA 021400; generic since 2018 and abandoned by its originator in both formulations',
        'Priced at roughly twenty-four times sildenafil at United States pharmacy acquisition cost, on a sixth as many listed products',
        'Retains a genuine, published, adequately sized efficacy result in men with diabetes — the hardest population in the indication',
        'Its principal clinical role now is as an alternative when a cheaper class sibling is not tolerated, which is not the role it was launched for',
      ],
    },
    deliverySystem: {
      type: 'Oral film-coated tablet at 2.5, 5, 10 and 20 mg, taken as needed about 60 minutes before sexual activity, at most once daily; formerly also an orally disintegrating tablet (STAXYN), now discontinued',
      description:
        'May be taken with or without food. Starting dose 10 mg for most men, adjusted to 5 or 20 mg on efficacy and tolerability. Dose is reduced to 5 mg starting in men aged 65 or over, in moderate hepatic impairment (with a 10 mg ceiling) and in men on stable alpha-blocker therapy, and is capped at 2.5 mg per 24 or 72 hours with various strong CYP3A4 inhibitors. The orally disintegrating tablet was never bioequivalent to the film-coated tablet and contained phenylalanine, which is why the phenylketonuria warning persists in the label.',
      safetyProfile:
        'Contraindicated with nitrates and nitric oxide donors, regularly or intermittently, with the label stating that a suitable interval after dosing for safe nitrate administration has not been determined; also contraindicated with the guanylate cyclase stimulator riociguat. Should not be used where sexual activity is inadvisable on cardiovascular grounds, and no controlled data exist in unstable angina, resting systolic pressure below 90 mmHg, blood pressure above 170/110, stroke, life-threatening arrhythmia or myocardial infarction within six months, or severe cardiac failure. Patients with congenital QT syndrome or taking class IA or class III antiarrhythmics should avoid it. Seek immediate medical assistance for an erection lasting over four hours. Stop and seek care for sudden vision loss, which may indicate non-arteritic anterior ischaemic optic neuropathy, or sudden hearing loss. Caution with alpha-blockers because of additive hypotension.',
    },
    commonQuestions: [
      {
        q: 'Is this better than sildenafil?',
        a: 'Nothing on the label says so, and no reported trial has tested it. The indication is one sentence — treatment of erectile dysfunction — with no claim about onset, duration, or any subgroup. The registration programme compared vardenafil against placebo, which shows that it works and cannot show that it is preferable to a drug approved five years earlier. There is one registered head-to-head trial in the class, comparing vardenafil against tadalafil in 759 men on how quickly it acts, and it has no posted results and no publication anyone can find. Meanwhile pharmacies pay about US$2.97 for a vardenafil tablet and about twelve cents for a sildenafil tablet.',
        auditNote:
          'The absence of a comparative result is the finding here. A third entrant into a working class needs a difference, and the trial that was designed to find one was never reported.',
      },
      {
        q: 'Why is it so much more expensive if it is generic?',
        a: 'Because almost nobody makes it. The CMS acquisition survey lists 16 vardenafil products and 117 sildenafil products. Both branded versions have gone: LEVITRA and the STAXYN orally disintegrating tablet are listed as Discontinued in the FDA’s Drugs@FDA database, each carrying the standard Federal Register note that the product was not discontinued for safety or effectiveness reasons — meaning the manufacturer left the market for commercial reasons. A thin generic market for an abandoned molecule keeps prices high. None of that is a statement about the drug, and none of it is visible on a prescription.',
      },
      {
        q: 'I read something about this drug and heart rhythm. Should I worry?',
        a: 'It is worth asking about if you have a rhythm problem or take a rhythm drug. Vardenafil is the only PDE5 inhibitor in common use whose label says patients with congenital long QT syndrome or taking class IA or class III antiarrhythmics — amiodarone, sotalol, quinidine and similar — should avoid it. That warning comes from the study specifically designed to measure QT effects: at the ordinary 10 mg dose, the corrected QT interval rose by 8 milliseconds against placebo, which was the same increase produced by moxifloxacin, the antibiotic included in the study as a known QT prolonger. The label states plainly that the clinical impact of that change is unknown. For a man with a normal heart and no rhythm drugs, this is a footnote; for anyone else, it is a reason to use one of the alternatives.',
      },
      {
        q: 'Does it work in diabetes? I have heard these drugs work less well.',
        a: 'It does, and that is the best-documented thing about it. A 452-man placebo-controlled trial in men with type 1 or type 2 diabetes found 57% on 10 mg and 72% on 20 mg reporting improved erections against 13% on placebo, with the erectile function score rising from a placebo value of 12.6 to 17.1 and 19.0. The effect held across every level of baseline severity, every HbA1c stratum, and both types of diabetes. That is a genuinely strong result in the population where erectile dysfunction is hardest to treat — and it is a result about the class, since sildenafil and tadalafil have comparable data in the same setting.',
      },
      {
        q: 'What must I never take with it?',
        a: 'Nitrates, in any form, however occasionally — glyceryl trinitrate, isosorbide, nicorandil, amyl nitrite. That is an outright contraindication, and the label adds an unusually frank admission: a suitable interval after taking vardenafil before a nitrate can safely be given "has not been determined". The guanylate cyclase stimulator riociguat is contraindicated too. Beyond that, the dose has to be cut hard with several common drugs: no more than 2.5 mg in 72 hours with ritonavir or cobicistat, no more than 2.5 mg in 24 hours with clarithromycin or high-dose ketoconazole or itraconazole, and no more than 5 mg in 24 hours with erythromycin or lower-dose azoles. If you take an alpha-blocker for your prostate, the starting dose halves to 5 mg.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Goldstein I, Young JM, Fischer J, Bangerter K, Segerson T, Taylor T. Vardenafil, a new phosphodiesterase type 5 inhibitor, in the treatment of erectile dysfunction in men with diabetes: a multicenter double-blind placebo-controlled fixed-dose study. Diabetes Care 2003;26:777-783',
        identifier: '10.2337/diacare.26.3.777',
        kind: 'doi',
      },
      {
        label:
          'Vardenafil versus tadalafil when intercourse is attempted within 45 minutes of administration (Bayer, n=759) — registry record with no posted results',
        identifier: 'NCT00663130',
        kind: 'nct',
      },
      {
        label:
          'Vardenafil in males with diabetes suffering from erectile dysfunction (Bayer, n=790) — registry record with no posted results',
        identifier: 'NCT00678704',
        kind: 'nct',
      },
      {
        label:
          'Impact of education of the primary care physician and patient on outcomes with vardenafil (Bayer, n=1,029) — registry record with no posted results',
        identifier: 'NCT00664833',
        kind: 'nct',
      },
      {
        label:
          'Vardenafil hydrochloride tablets United States prescribing information — Indications (1), Dosage and Administration (2.1 to 2.4), Contraindications (4.1 Nitrates, 4.2 Guanylate Cyclase Stimulators), Warnings and Precautions (5.1 Cardiovascular Effects, 5.3 Priapism, 5.4 Effects on the Eye, 5.5 Sudden Hearing Loss, 5.6 Alpha-Blockers, 5.7 QT Prolongation, 5.13 Phenylketonurics), Clinical Pharmacology (12.2, Table 6)',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22vardenafil+hydrochloride%22',
        kind: 'regulatory',
      },
      {
        label:
          'FDA Drugs@FDA — NDA 021400 (LEVITRA, Bayer HealthCare) and NDA 200179 (STAXYN), all products listed as Discontinued with the Federal Register determination that they were not discontinued or withdrawn for safety or effectiveness reasons',
        identifier:
          'https://api.fda.gov/drug/drugsfda.json?search=products.brand_name:%22LEVITRA%22',
        kind: 'regulatory',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — vardenafil, 16 listed generic products, and sildenafil, 117 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 135400189 — vardenafil structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/135400189',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 10. Pegloticase — an enzyme humans lost in evolution, given back by infusion, which the immune
  //     system rejects in most people and which had to be rescued by a 1950s cytotoxic drug.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'pegloticase',
    name: 'Pegloticase',
    tradeName: 'Krystexxa',
    sponsor:
      'Horizon Therapeutics, now part of Amgen (holder of BLA 125293); originated at Duke University and Mountain View Pharmaceutical and developed by Savient Pharmaceuticals',
    targetGene: 'UOX',
    targetProtein:
      'Not a target but a replacement: pegloticase is recombinant mammalian urate oxidase itself, the enzyme encoded by UOX, which is a non-functional pseudogene in humans and the great apes. Its substrate is uric acid, which it oxidises to allantoin',
    modality: 'Recombinant Protein / Biologic',
    approvalStatus: 'FDA Approved',
    approvalYear: 2010,
    indication:
      'Treatment of chronic gout in adults refractory to conventional therapy — patients who have failed to normalise serum uric acid and whose signs and symptoms are inadequately controlled with xanthine oxidase inhibitors at the maximum medically appropriate dose, or for whom those drugs are contraindicated. Limitation of Use: not recommended for the treatment of asymptomatic hyperuricaemia',
    patientFriendlyIndication: 'Severe gout that every tablet has failed to control',
    anatomicalSite:
      'The bloodstream itself. The enzyme circulates and destroys uric acid in plasma; the crystal deposits in joints and soft tissue then dissolve back into the depleted plasma',
    conditionContext: {
      conditionExplainer:
        'Almost every mammal converts uric acid into allantoin, which is highly soluble and simply leaves in urine. Humans and the other great apes cannot: the gene for that enzyme, urate oxidase, was inactivated by mutation in our lineage and is carried as a pseudogene. That single evolutionary loss is why gout exists in humans and essentially not in dogs. Pegloticase puts the enzyme back, by infusion.',
      whyItMatters:
        'This is the most direct intervention in gout medicine — replacing a missing enzyme rather than tuning a transporter — and its story is a lesson in what happens when you inject a protein the human immune system has never seen. In the pre-marketing trials 92% of treated patients developed antibodies to it, high antibody titre predicted both loss of effect and infusion reactions, and the drug was eventually rescued not by protein engineering but by giving weekly methotrexate alongside it.',
      whoTakesThis:
        'Adults with chronic gout that has failed maximally dosed xanthine oxidase inhibitors, usually with tophi and frequent flares. Absolutely not anyone with glucose-6-phosphate dehydrogenase deficiency, in whom it is contraindicated because the hydrogen peroxide it generates causes haemolysis and methaemoglobinaemia.',
      clinicalGoals:
        'Serum urate held below 6 mg/dL for at least 80% of the time, sustained long enough for tophi to dissolve — which in the trials took the full twelve months, with tophus resolution still increasing at week 52.',
    },
    oneSentenceVerdict:
      'A PEGylated recombinant uricase that restores an enzyme humans lost by mutation, driving urate below 6 mg/dL in 42% of refractory patients against 0% on placebo across two pooled randomised trials — and which the immune system defeats in most people, with anti-pegloticase antibodies in 92% of pre-marketing patients, infusion reactions in 53% of those with high titre against 6% with low titre, and a boxed warning for anaphylaxis, until weekly methotrexate co-therapy raised the twelve-month response rate from 30.8% to 60.0%.',
    laymanHowItWorks:
      'Nearly every other mammal has an enzyme that converts uric acid into a harmless, very soluble compound called allantoin, which leaves in urine. Humans lost the gene for that enzyme millions of years ago, which is the underlying reason gout is a human disease. Pegloticase is that enzyme, made in bacteria, wrapped in polyethylene glycol so it survives in the bloodstream, and dripped into a vein every two weeks. It destroys uric acid in the blood directly, and the crystals packed into joints and skin dissolve back into that emptied blood over months. The catch is that your immune system recognises it as foreign, and in most people eventually attacks it.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 61,
    substitutes: {
      summary:
        'There is no substitute at this stage of the disease — that is what "refractory to conventional therapy" means, and the label defines it. The comparison worth making is not against other drugs but against the alternative of accepting a urate that oral therapy cannot bring down, and against the cost of the immune response this treatment provokes.',
      conventionalRx: [
        {
          name: 'Maximally titrated allopurinol',
          class: 'Purine-analogue xanthine oxidase inhibitor',
          howItCompares:
            'This is the therapy that must have failed before pegloticase is used. The word doing the work in that sentence is "maximally": in a randomised dose-escalation trial, escalating allopurinol above the creatinine-clearance-based dose got 69% of patients to a urate below 6 mg/dL against 32% of controls, including in the half of the cohort with creatinine clearance under 60 mL/min. A patient labelled refractory on 300 mg has not necessarily failed allopurinol.',
          typicalCost:
            'US$0.0546 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 87 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: oral, five cents a tablet, no immunogenicity. Cons: the HLA-B*58:01 severe skin reaction; genuinely fails or is not tolerated in some patients, which is who this drug is for.',
        },
        {
          name: 'Febuxostat',
          class: 'Non-purine xanthine oxidase inhibitor',
          howItCompares:
            'The other oral option that must be exhausted first, and the one usable when allopurinol caused a rash. It carries a boxed warning for cardiovascular death; pegloticase carries a boxed warning for anaphylaxis and for haemolysis in G6PD deficiency. Both boxed warnings arrived after approval, from different kinds of evidence.',
          typicalCost:
            'US$0.2810 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 29 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: oral; no renal dose adjustment in mild to moderate impairment. Cons: boxed warning for cardiovascular death; restricted by its own label to allopurinol failures.',
        },
        {
          name: 'Probenecid, alone or added to a xanthine oxidase inhibitor',
          class: 'Uricosuric — URAT1 and OAT inhibitor',
          howItCompares:
            'A third mechanism to try before an infusion. It requires adequate kidney function, is contraindicated in urate stone formers, and lost its only head-to-head randomised comparison to benzbromarone, reaching a 5 mg/dL target in 65% of allopurinol failures against 92%. It is nonetheless an oral option that has often not been tried.',
          typicalCost:
            'US$0.6550 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 9 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: oral, different mechanism, combinable. Cons: ineffective at low creatinine clearance; contraindicated in urate stone formers; antagonised by aspirin.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Stop your urate tablets before starting, and do not restart them',
          action:
            'Discontinue oral urate-lowering medicines before the first infusion and do not resume while on treatment.',
          patientImpact:
            'The label instructs that before starting, patients discontinue oral urate-lowering medications and not institute them during therapy. The reason is a safety one rather than an efficacy one: an oral drug holding the urate down would mask the rising urate that signals loss of response, and rising urate is the warning sign the infusion reaction protocol depends on.',
          clinicalPrecaution:
            'Serum uric acid is measured before every infusion, and treatment is stopped if it rises above 6 mg/dL, particularly on two consecutive occasions.',
        },
        {
          name: 'Expect a flare, and expect prophylaxis for six months',
          action: 'Take the flare prophylaxis as prescribed even when nothing hurts.',
          patientImpact:
            'The label recommends gout flare prophylaxis for at least the first six months of treatment. Driving urate to near zero mobilises tophaceous deposits at a speed no oral drug produces, and the flares that follow are correspondingly intense.',
          clinicalPrecaution:
            'In the pivotal trials, prophylaxis with an NSAID or colchicine or both began at least one week before the first infusion.',
        },
        {
          name: 'Get tested for G6PD deficiency first',
          action:
            'Ask whether you have been screened, particularly with African, Mediterranean, Middle Eastern or South and Southeast Asian ancestry.',
          patientImpact:
            'The boxed warning directs screening for G6PD deficiency before starting, because haemolysis and methaemoglobinaemia have been reported in deficient patients. The drug is contraindicated in G6PD deficiency, not merely cautioned.',
          clinicalPrecaution:
            'The mechanism is direct: the uricase reaction produces hydrogen peroxide, and a red cell without G6PD cannot regenerate the glutathione needed to dispose of it.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'generic_formula',
      chemicalFormula:
        'Tetrameric recombinant mammalian urate oxidase, each subunit approximately 34 kDa, covalently conjugated to 10 kDa monomethoxypoly(ethylene glycol); no small-molecule formula applies',
      molecularWeight:
        'Approximately 540 kDa for the PEG-conjugated tetramer, per the label; each 8 mg vial contains 8 mg of uricase protein conjugated to 24 mg of 10 kDa mPEG',
      targetReceptorAffinity:
        'There is no receptor. Pegloticase is an enzyme performing a reaction the human body cannot: oxidation of uric acid to allantoin, which the label describes as an inert, water-soluble purine metabolite eliminated primarily by renal excretion. The cDNA is based on mammalian sequences and the protein is expressed in a genetically modified strain of Escherichia coli. The PEG shell exists to extend circulating half-life and to shield the protein from immune recognition — and the central clinical fact about this drug is that the shielding is only partly successful. Population pharmacokinetics identified only two significant covariates: body surface area, and anti-pegloticase antibodies. Age, sex, weight, creatinine clearance and estimated glomerular filtration rate had no effect. In other words, the single largest determinant of how much drug a patient has is how much of it their immune system has learned to remove.',
      structureSource: {
        label:
          'KRYSTEXXA (pegloticase) United States prescribing information, section 11 Description (subunit and conjugate molecular weights, expression system, mPEG content) and section 12.1 Mechanism of Action; BLA 125293',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22KRYSTEXXA%22',
        kind: 'regulatory',
      },
      laboratoryWorkflow: [
        {
          id: 'peg-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the tetramer, not just the subunit',
          description:
            'Uricase is only active as a tetramer, and a preparation rich in dissociated 34 kDa subunits will assay as protein and behave as an immunogen rather than an enzyme. Aggregates above the tetramer are the classic driver of anti-drug antibody formation in a PEGylated protein, so the size distribution is both a potency attribute and an immunogenicity attribute.',
          reagentsAndBuffer:
            'Size-exclusion chromatography with multi-angle light scattering, analytical ultracentrifugation for the oligomeric state, SDS-PAGE reduced and non-reduced, host-cell protein and endotoxin assays for the E. coli expression system, subvisible particle counting',
        },
        {
          id: 'peg-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Express the mammalian-sequence uricase in a modified E. coli strain',
          description:
            'The cDNA is based on mammalian sequences and is expressed in a genetically modified Escherichia coli. The choice matters for the immune response: a bacterially expressed mammalian-sequence protein carries no human glycosylation and arrives with the folding and impurity profile of a bacterial system, which is part of why the naive human immune system recognises it.',
          dependsOnStepId: 'peg-w1',
          reagentsAndBuffer:
            'Genetically modified E. coli production strain, defined fermentation medium with induction control, cell lysis and clarification, capture chromatography, buffer exchange into the conjugation buffer',
        },
        {
          id: 'peg-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Remove host-cell protein before PEG goes on, not after',
          description:
            'Once the protein is PEGylated its chromatographic behaviour changes completely and residual host-cell proteins become far harder to resolve from it. Anything immunogenic left in at this stage is carried into the vial, and this product’s entire clinical problem is immunogenicity.',
          dependsOnStepId: 'peg-w2',
          reagentsAndBuffer:
            'Ion-exchange and hydrophobic-interaction chromatography, host-cell protein ELISA validated against the production strain lysate, residual DNA quantification by qPCR, endotoxin by LAL',
        },
        {
          id: 'peg-w4',
          stepNumber: 4,
          phase: 'Conjugation',
          name: 'Attach the 10 kDa mPEG chains and control the distribution',
          description:
            'Each 8 mg of uricase protein carries 24 mg of 10 kDa monomethoxypoly(ethylene glycol), taking the tetramer to about 540 kDa. PEGylation is a distribution, not a single species: too few chains and the protein is exposed and immunogenic, too many and the active site is occluded. The specification is on the distribution, and it is the manufacturing step that defines this product.',
          dependsOnStepId: 'peg-w3',
          reagentsAndBuffer:
            'Activated 10 kDa monomethoxypoly(ethylene glycol), controlled pH and stoichiometry, quench and diafiltration, PEG-to-protein ratio by nuclear magnetic resonance or colorimetric assay, peptide mapping to localise conjugation sites, enzyme activity assay post-conjugation',
        },
        {
          id: 'peg-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Measure anti-drug antibodies as a primary readout, not a footnote',
          description:
            'For this molecule the immunogenicity assay is the efficacy assay. High anti-pegloticase titre predicted both failure to maintain urate normalisation and a nine-fold higher infusion reaction rate. Any programme evaluating a uricase has to run anti-drug and anti-PEG antibody assays alongside the urate endpoint on the same schedule, and report them together.',
          dependsOnStepId: 'peg-w4',
          reagentsAndBuffer:
            'Validated bridging immunoassay for anti-pegloticase antibodies with titre determination, separate anti-PEG antibody assay, drug-tolerance characterisation of the assay, serum uricase activity as the pharmacokinetic measure, pre-infusion serum urate at every visit as the clinical surrogate for antibody-mediated clearance',
        },
      ],
    },
    keyAudits: [
      {
        id: 'peg-a1',
        category: 'measured',
        title: 'It works where nothing else does — in fewer than half of patients',
        laymanSummary:
          'In two randomised trials of people whose gout had defeated every tablet, 42% got their urate below target and stayed there, against nobody at all on placebo.',
        technicalDetails:
          'Two replicate randomised double-blind placebo-controlled trials, C0405 and C0406, enrolled 225 patients across 56 rheumatology practices in the United States, Canada and Mexico, with severe gout, allopurinol intolerance or refractoriness, and serum uric acid at or above 8.0 mg/dL. Patients received twelve biweekly infusions of pegloticase 8 mg, pegloticase alternating with placebo (monthly), or placebo. The primary endpoint — plasma uric acid below 6.0 mg/dL for at least 80% of the time during months 3 and 6 — was reached by 20 of 43 biweekly patients in C0405 (47%) and 16 of 42 in C0406 (38%), against 0 of 20 and 0 of 23 on placebo. Pooled, 36 of 85 (42%, 95% CI 32% to 54%) on biweekly dosing and 29 of 84 (35%) on monthly against 0 of 43 (0%, 95% CI 0% to 8%) on placebo, p<0.001 for each. Tophi resolved completely in 45% of biweekly patients against 26% monthly and 8% on placebo at month 6, significant only for the biweekly regimen. Seven deaths occurred between randomisation and database closure, four on pegloticase and three on placebo. A zero per cent placebo response is unusual and is the measure of how refractory this population was.',
        evidenceSource:
          'Sundy JS, Baraf HSB, Yood RA, et al. Efficacy and tolerability of pegloticase for the treatment of chronic gout in patients refractory to conventional treatment: two randomized controlled trials. JAMA 2011;306:711-720 (NCT00325195)',
        doi: '10.1001/jama.2011.1169',
        measuredMetric:
          'Plasma uric acid below 6.0 mg/dL for at least 80% of the time during months 3 and 6',
        auditFlag: 'verified',
      },
      {
        id: 'peg-a2',
        category: 'failed',
        title: 'The immune system defeated it in 92% of patients',
        laymanSummary:
          'Almost everyone treated developed antibodies against the drug. Those with high antibody levels lost the effect and had infusion reactions nine times more often than those without.',
        technicalDetails:
          'The label reports that during the pre-marketing 24-week controlled trials of pegloticase alone, anti-pegloticase antibodies developed in 92% of patients treated every two weeks, against 28% in the placebo group; anti-PEG antibodies were detected in 42% of treated patients. High anti-pegloticase titre was associated with failure to maintain pegloticase-induced normalisation of uric acid, and with a markedly higher rate of infusion reactions: 53% (16 of 30) in high-titre patients on the biweekly regimen against 6% in those with undetectable or low titre. Population pharmacokinetics identified only two significant covariates on drug exposure — body surface area and anti-pegloticase antibodies — while age, sex, weight, creatinine clearance and eGFR had none. The label also notes that the impact of the anti-PEG antibodies on a patient’s later response to other PEG-containing therapeutics is unknown, which is a consequence that outlives the treatment course.',
        evidenceSource:
          'KRYSTEXXA United States prescribing information, section 12.6 Immunogenicity and section 12.3 Pharmacokinetics (BLA 125293)',
        measuredMetric:
          'Anti-pegloticase and anti-PEG antibody incidence, and infusion reaction rate by antibody titre',
        auditFlag: 'caution',
      },
      {
        id: 'peg-a3',
        category: 'conclusion_shift',
        title: 'Rescued by methotrexate: 30.8% to 60.0% at twelve months',
        laymanSummary:
          'Adding a weekly dose of an old immunosuppressant roughly doubled the proportion of patients who kept responding, and cut the number who had to stop for a rising urate from 63% to 23%.',
        technicalDetails:
          'The MIRROR randomised controlled trial randomised 152 patients with uncontrolled gout 2:1 to pegloticase 8 mg every two weeks with blinded oral methotrexate 15 mg weekly or with placebo, for 52 weeks, with standardised infusion-reaction prophylaxis and discontinuation for two consecutive serum urate values above 6 mg/dL. The month 6 primary endpoint — urate below 6 mg/dL for at least 80% of the month — was met by 71 of 100 (71%) with methotrexate against 20 of 52 (39%) without, a difference of 32% (95% CI 16% to 48%, p<0.0001). At month 12 the figures were 60 of 100 (60.0%) against 16 of 52 (30.8%), a difference of 29.1% (95% CI 13.2% to 44.9%, p=0.0003), with urate-monitoring discontinuations falling from 63.3% (31 of 49) to 22.9% (22 of 96). Complete resolution of at least one tophus at week 52 occurred in 53.8% against 31.0% (difference 22.8%, 95% CI 1.2% to 44.4%, p=0.048), up from 34.6% against 13.8% at week 24. Methotrexate lowered anti-pegloticase antibody incidence and titre and raised steady-state trough concentration from 0.59 to 1.13 micrograms/mL. The label’s recommended dosage now reads: pegloticase 8 mg every two weeks co-administered with weekly methotrexate 15 mg orally, with pegloticase alone reserved for patients in whom methotrexate is contraindicated. A biologic’s central limitation was solved by adding a drug first synthesised in the 1940s.',
        evidenceSource:
          'Botson JK, Saag K, Peterson J, et al. A Randomized, Double-Blind, Placebo-Controlled Multicenter Efficacy and Safety Study of Methotrexate to Increase Response Rates in Patients With Uncontrolled Gout Receiving Pegloticase: 12-Month Findings (MIRROR RCT). ACR Open Rheumatol 2023;5:407-418 (NCT03994731); KRYSTEXXA prescribing information, sections 2.2 and 14',
        doi: '10.1002/acr2.11578',
        measuredMetric:
          'Proportion maintaining serum urate below 6 mg/dL for at least 80% of month 6 and month 12, with and without methotrexate co-therapy',
        auditFlag: 'verified',
      },
      {
        id: 'peg-a4',
        category: 'measured',
        title: 'A boxed warning for anaphylaxis, and a monitoring rule derived post hoc',
        laymanSummary:
          'Anaphylaxis happened in 6.5% of patients on the every-two-week schedule and in nobody on placebo. The rule for preventing it — stop if the urate rises above 6 — was worked out afterwards from the trial data.',
        technicalDetails:
          'In the pre-marketing trials, where the drug was not stopped for a rising urate, anaphylaxis was reported in 6.5% (8 of 123) of patients on the every-2-week regimen and 4.8% (6 of 126) on the every-4-week regimen, with no cases on placebo. It generally occurred within two hours, in patients who had been pre-treated with an oral antihistamine, intravenous corticosteroid and paracetamol — the pre-treatment did not prevent it. The label then reports a post-hoc analysis of the same trial data: had the drug been stopped when urate rose above 6 mg/dL on a single occasion, infusion reactions would have fallen by approximately 67% but the primary efficacy success rate would have fallen by about 20%; had it been stopped after two consecutive values above 6 mg/dL, infusion reactions would have halved with little change in efficacy. That second option is now the boxed-warning instruction. It is a genuinely good piece of analysis and it is post-hoc: the monitoring rule that makes this drug safe enough to give was derived from the data rather than tested prospectively. In the later MIRROR trial, run with that rule in place, anaphylaxis occurred in 1% of the methotrexate group and none of the pegloticase-alone group.',
        evidenceSource:
          'KRYSTEXXA United States prescribing information, boxed warning and sections 5.1 Anaphylaxis, 5.2 Infusion Reactions, 2.1 Important Administration Instructions, and 14 Clinical Studies (post-hoc discontinuation analysis)',
        measuredMetric:
          'Anaphylaxis incidence by dosing regimen, and the modelled effect of urate-triggered discontinuation on infusion reactions and efficacy',
        auditFlag: 'caution',
      },
      {
        id: 'peg-a5',
        category: 'measured',
        title: 'Contraindicated in G6PD deficiency, for a reason written into the chemistry',
        laymanSummary:
          'The enzyme produces hydrogen peroxide as it destroys uric acid. Red cells lacking G6PD cannot clear peroxide, so they burst. Screening before treatment is a boxed-warning requirement.',
        technicalDetails:
          'The boxed warning directs screening for G6PD deficiency before starting, records that haemolysis and methaemoglobinaemia have been reported in deficient patients, and states that the drug is contraindicated in G6PD deficiency. The mechanism is not idiosyncratic: urate oxidase converts uric acid to 5-hydroxyisourate with the stoichiometric production of hydrogen peroxide, and glucose-6-phosphate dehydrogenase is the enzyme that supplies the NADPH a red cell needs to regenerate reduced glutathione and dispose of that peroxide. G6PD deficiency is the commonest human enzymopathy and its prevalence is highest in populations of African, Mediterranean, Middle Eastern and South and Southeast Asian ancestry — the same populations in which the HLA-B*58:01 allele that drives allopurinol hypersensitivity is most frequent. Both of the pharmacogenetic constraints in severe gout therapy fall on overlapping groups.',
        evidenceSource:
          'KRYSTEXXA United States prescribing information, boxed warning, section 4 Contraindications and section 5.3 G6PD Deficiency Associated Hemolysis and Methemoglobinemia',
        measuredMetric:
          'Labelled contraindication and screening requirement for G6PD deficiency before treatment',
        auditFlag: 'verified',
      },
      {
        id: 'peg-a6',
        category: 'inferred',
        title: '"Refractory to conventional therapy" is a definition, not a measurement',
        laymanSummary:
          'The indication requires that oral drugs have failed at the maximum appropriate dose. In practice many people are called refractory on a dose that was never escalated.',
        technicalDetails:
          'The label defines refractory gout as failure to normalise serum uric acid with signs and symptoms inadequately controlled by xanthine oxidase inhibitors "at the maximum medically appropriate dose", or contraindication to those drugs. That phrase carries the entire gatekeeping function of the indication, and the evidence around it is uncomfortable: in a randomised dose-escalation trial, monthly escalation of allopurinol above the creatinine-clearance-based dose reached a urate below 6 mg/dL in 69% of patients against 32% of controls, with only one serious adverse event judged probably drug-related across the study and with 52% of participants having creatinine clearance below 60 mL/min. In a separate randomised trial, allopurinol fixed at 300 mg reached a stringent 5 mg/dL target in only 24% of patients. A patient declared refractory on an unescalated dose has not met the label’s condition, and the consequence of the mislabel is an intravenous immunogenic biologic instead of a five-cent tablet.',
        evidenceSource:
          'KRYSTEXXA prescribing information, section 1 Indications and Usage; Stamp LK et al. Ann Rheum Dis 2017;76:1522-1528 (allopurinol dose escalation); Reinders MK et al. Ann Rheum Dis 2009;68:51-56 (allopurinol 300 mg reaching a 5.0 mg/dL target in 24%)',
        doi: '10.1136/annrheumdis-2016-210872',
        inferredClaim:
          'That a patient not at target on a standard oral dose is refractory to conventional therapy — the label requires maximal titration, and the titration evidence shows most such patients respond when it is done',
        auditFlag: 'caution',
      },
      {
        id: 'peg-a7',
        category: 'measured',
        title: 'Tophi kept dissolving after month six, which is why the endpoint moved',
        laymanSummary:
          'The visible lumps of urate crystal took a full year to clear. At six months a third had resolved; at twelve months more than half had.',
        technicalDetails:
          'In the MIRROR trial, complete resolution of at least one target tophus — defined as 100% resolution of at least one target tophus, no new tophi and no single tophus progressing, assessed by standardised digital photography with blinded central readers — occurred in 34.6% (18 of 52) of methotrexate co-treated patients at week 24 and 53.8% (28 of 52) at week 52, against 13.8% (4 of 29) and 31.0% (9 of 29) with pegloticase alone. In the pivotal placebo-controlled trials at month 6, complete tophus response was 45% on biweekly dosing, 26% on monthly and 8% on placebo, significant only for the biweekly regimen. Two things follow. Crystal dissolution is slower than the six-month endpoint the registration programme used, so a trial that stops at six months understates what the drug does. And the placebo arm was not zero on this endpoint — 8% of tophi resolved with no urate-lowering at all — which is a useful calibration for how variable tophus photography is as a measure.',
        evidenceSource:
          'KRYSTEXXA prescribing information, section 14 Clinical Studies (tophus response in Trial 1 at months 6 and 12, and pooled Trials 2 and 3 at month 6); Botson JK et al. ACR Open Rheumatol 2023;5:407-418',
        doi: '10.1002/acr2.11578',
        measuredMetric:
          'Complete tophus response by blinded central digital photography at 24 and 52 weeks',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'An enzyme humans deleted, remade in bacteria',
        laymanDesc:
          'Almost every other mammal converts uric acid into a harmless soluble compound. Our lineage lost the gene. Pegloticase is that enzyme, grown in E. coli.',
        molecularDetail:
          'Recombinant mammalian-sequence urate oxidase expressed in a genetically modified strain of Escherichia coli. Each subunit is approximately 34 kDa and the active enzyme is a tetramer. The human UOX gene is a pseudogene, inactivated in the great ape lineage, which is the evolutionary reason gout is a human disease.',
        iconName: 'Dna',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Wrapped in polyethylene glycol to survive the bloodstream',
        laymanDesc:
          'A bare bacterial enzyme would be cleared in minutes and recognised instantly. PEG chains extend its life and partly hide it from the immune system.',
        molecularDetail:
          'Each 8 mg of uricase protein is covalently conjugated to 24 mg of 10 kDa monomethoxypoly(ethylene glycol), giving an average conjugate molecular weight of approximately 540 kDa. The PEG shell is what makes a two-weekly infusion possible — and anti-PEG antibodies develop in 42% of treated patients, so the shield is itself antigenic.',
        iconName: 'Shield',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Uric acid is destroyed in the blood itself',
        laymanDesc:
          'The enzyme circulates and converts uric acid into allantoin, which dissolves easily and leaves in the urine. Serum urate falls to near zero.',
        molecularDetail:
          'The label describes catalysis of the oxidation of uric acid to allantoin, "an inert and water-soluble purine metabolite readily eliminated, primarily by renal excretion". This is the only urate-lowering drug that removes urate already in circulation rather than reducing its production or its reabsorption.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'Tophi dissolve back into the emptied blood, over a year',
        laymanDesc:
          'With plasma urate near zero, the crystal deposits in joints and skin have somewhere to go. It takes months, and it hurts along the way.',
        molecularDetail:
          'Complete tophus resolution by blinded central photography rose from 34.6% at week 24 to 53.8% at week 52 with methotrexate co-therapy. Flare prophylaxis is recommended for at least the first six months, because rapid mobilisation of deposits provokes intense flares.',
        iconName: 'Snowflake',
        visualStage: 'therapeutic_result',
      },
      {
        step: 5,
        title: 'The immune system learns the protein and clears it',
        laymanDesc:
          'Most people make antibodies to the drug. When titres are high the drug disappears from the blood, the urate climbs back, and infusion reactions become common.',
        molecularDetail:
          'Anti-pegloticase antibodies in 92% of pre-marketing biweekly patients; anti-PEG antibodies in 42%. Only body surface area and anti-pegloticase antibodies were significant covariates on drug exposure. Infusion reactions occurred in 53% (16 of 30) of high-titre patients against 6% of those with low or undetectable titre.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'A rising urate is the alarm, and methotrexate is the answer',
        laymanDesc:
          'Because losing the drug shows up as a rising urate before it shows up as a reaction, the urate is checked before every infusion. Adding weekly methotrexate stops the antibodies forming in the first place.',
        molecularDetail:
          'The boxed warning directs monitoring serum urate before each infusion and discontinuation above 6 mg/dL, particularly on two consecutive values. Methotrexate co-therapy lowered anti-pegloticase antibody incidence and titre, raised steady-state trough from 0.59 to 1.13 micrograms/mL, and lifted the 12-month response rate from 30.8% to 60.0%.',
        iconName: 'Gauge',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'C0405 and C0406 pivotal trials (JAMA 2011;306:711-720; NCT00325195)',
        phase: 'Phase 3, two replicate randomised double-blind placebo-controlled trials',
        sampleSize: 225,
        primaryEndpoint:
          'Plasma uric acid below 6.0 mg/dL for at least 80% of the time during months 3 and 6, in chronic gout refractory to conventional therapy',
        endpointMet: true,
        statisticalPValue:
          'Pooled biweekly 36 of 85 (42%, 95% CI 32% to 54%) and monthly 29 of 84 (35%) against 0 of 43 on placebo (0%, 95% CI 0% to 8%), p<0.001 for each comparison',
        unreportedAdverseSignals:
          'Anaphylaxis in 6.5% (8 of 123) on the biweekly regimen and 4.8% (6 of 126) on the monthly regimen, none on placebo, despite antihistamine, corticosteroid and paracetamol pre-treatment. Seven deaths occurred between randomisation and database closure, four on pegloticase and three on placebo. The monthly regimen showed more anaphylaxis and infusion reactions and less tophus effect, and was not adopted.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'MIRROR RCT (ACR Open Rheumatol 2023;5:407-418; NCT03994731)',
        phase: 'Phase 4, randomised, double-blind, placebo-controlled, 52 weeks',
        sampleSize: 152,
        primaryEndpoint:
          'Proportion of responders — serum urate below 6 mg/dL for at least 80% of month 6 — with pegloticase plus weekly methotrexate 15 mg against pegloticase plus placebo',
        endpointMet: true,
        statisticalPValue:
          'Month 6: 71 of 100 (71%) against 20 of 52 (39%), difference 32% (95% CI 16% to 48%), p<0.0001. Month 12: 60 of 100 (60.0%) against 16 of 52 (30.8%), difference 29.1% (95% CI 13.2% to 44.9%), p=0.0003',
        unreportedAdverseSignals:
          'Even with methotrexate, 40% of patients were not responders at twelve months and 22.9% discontinued for a rising urate. Anaphylaxis occurred in one methotrexate patient (1%) during a first infusion and in none on pegloticase alone. Patients unable to tolerate two weeks of run-in methotrexate were never randomised, so the trial population excludes methotrexate intolerance by design.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Plasma urate below 6 mg/dL for at least 80% of months 3 and 6 in 42% of biweekly patients against 0% of placebo patients (pooled, n=225)',
        'Complete tophus resolution 45% on biweekly pegloticase against 26% monthly and 8% on placebo at month 6',
        'Anti-pegloticase antibodies in 92% of pre-marketing biweekly patients and anti-PEG antibodies in 42%',
        'Infusion reactions in 53% (16 of 30) of high-antibody-titre patients against 6% with low or undetectable titre',
        'Twelve-month response 60.0% with weekly methotrexate against 30.8% without (difference 29.1%, 95% CI 13.2% to 44.9%)',
      ],
      unsupportedInferences: [
        'That a patient not at target on a standard allopurinol dose is refractory to conventional therapy, when the label requires maximal titration and titration reaches target in most patients',
        'That the urate-triggered discontinuation rule prevents anaphylaxis, which was derived from a post-hoc analysis of the pivotal trials rather than tested prospectively',
        'That anti-PEG antibodies raised by this treatment are without consequence for other PEGylated drugs, which the label states is unknown',
        'That the six-month registration endpoint captured the drug’s effect on tophi, when resolution was still increasing at week 52',
      ],
      whatFailedInitially: [
        'The majority of patients did not achieve a sustained response on pegloticase alone: 58% of biweekly patients were non-responders in the pivotal pooled analysis',
        'Anti-pegloticase antibodies developed in 92% of treated patients and predicted both loss of effect and infusion reactions',
        'Anaphylaxis occurred in 6.5% of biweekly patients despite protocol-mandated antihistamine, corticosteroid and paracetamol pre-treatment',
        'The monthly dosing regimen, which was studied in the pivotal trials, produced more anaphylaxis and less tophus benefit and was abandoned',
      ],
      realWorldOutcome: [
        'Approved in the United States in September 2010 under BLA 125293 as the only uricase for chronic refractory gout',
        'Its recommended dosage was rewritten in 2022 to include weekly methotrexate — a biologic’s immunogenicity solved by an antimetabolite from the 1940s',
        'It remains a clinic-administered infusion with a boxed warning, an absolute contraindication in G6PD deficiency, and no United States pharmacy acquisition price in the CMS survey',
        'The clearest demonstration in gout medicine that the disease is an inherited enzyme deficiency, and the clearest demonstration that replacing a lost enzyme is not straightforward',
      ],
    },
    deliverySystem: {
      type: 'Intravenous infusion of 8 mg pegloticase every two weeks, co-administered with weekly oral methotrexate 15 mg; supplied as a ready-to-use 8 mg/50 mL vial or a to-be-diluted 8 mg/mL vial',
      description:
        'Never given as a push or bolus. Methotrexate with folic or folinic acid supplementation is started at least four weeks before the first pegloticase infusion and continued throughout; pegloticase alone is used only where methotrexate is contraindicated or inappropriate. Oral urate-lowering drugs are discontinued before starting and are not resumed during treatment, so that a rising serum urate remains visible as the signal of lost response. Serum urate is measured before every infusion. Patients are pre-medicated with antihistamines and corticosteroids and observed after each infusion. Pharmacokinetics are driven by body surface area and by anti-drug antibodies; age, sex, weight and renal function have no effect.',
      safetyProfile:
        'Boxed warning for anaphylaxis and infusion reactions, which may occur with any infusion including the first, generally within two hours, with delayed hypersensitivity also reported — administration must be in a healthcare setting by staff prepared to manage anaphylaxis, with antihistamine and corticosteroid pre-medication and post-infusion observation. Boxed warning also for haemolysis and methaemoglobinaemia in glucose-6-phosphate dehydrogenase deficiency, which is an absolute contraindication requiring screening beforehand; prior serious hypersensitivity to the product is the other contraindication. Serum urate is monitored before each infusion and treatment stopped above 6 mg/dL, particularly on two consecutive values, because loss of response predicts reactions. Gout flare prophylaxis is recommended for at least the first six months. Congestive heart failure exacerbation may occur and patients should be monitored closely after infusion.',
    },
    commonQuestions: [
      {
        q: 'Why do humans get gout when dogs do not?',
        a: 'Because we lost an enzyme. Urate oxidase converts uric acid into allantoin, which is far more soluble and simply leaves in urine, and almost every other mammal has it. In the ancestral line leading to humans and the other great apes the gene was inactivated by mutation and now sits in the genome as a pseudogene that produces nothing. That is the underlying reason uric acid is the end of the line for human purine metabolism and why it crystallises in joints. Pegloticase is that missing enzyme, made in bacteria and given back by infusion, which makes it the most direct treatment for gout that exists — and also the one the immune system has the most reason to attack, because it is a protein no human body has ever seen.',
        auditNote:
          'It is worth holding both halves of that sentence together. The most mechanistically complete treatment in gout is also the one that fails in most patients, for reasons that have nothing to do with uric acid.',
      },
      {
        q: 'Why do I have to take methotrexate as well?',
        a: 'To stop your immune system destroying the drug. In the original trials 92% of treated patients developed antibodies against pegloticase, and those with high antibody levels lost the effect and had infusion reactions nine times more often than those without. Weekly methotrexate 15 mg suppresses that antibody response. In the MIRROR trial, adding it lifted the proportion of patients still responding at twelve months from 30.8% to 60.0%, cut the proportion who had to stop for a rising urate from 63% to 23%, and roughly doubled the steady-state level of drug in the blood. The label now makes methotrexate part of the recommended dosage, with pegloticase alone reserved for people who cannot take it.',
      },
      {
        q: 'Why is my uric acid measured before every single infusion?',
        a: 'Because a rising urate is the earliest sign that antibodies are clearing the drug, and losing response is what predicts a severe infusion reaction. The boxed warning directs stopping treatment if the level rises above 6 mg/dL, particularly on two consecutive occasions. That rule came from a post-hoc analysis of the original trials: had the drug been stopped after two consecutive values above 6, infusion reactions would have been halved with almost no loss of efficacy. It is also why you are told to stop your oral urate tablets and not restart them — an oral drug holding the number down would hide the very signal the monitoring depends on.',
      },
      {
        q: 'What is the G6PD test for?',
        a: 'It is not a formality. The enzyme in this drug produces hydrogen peroxide every time it destroys a molecule of uric acid. Red blood cells dispose of peroxide using glutathione, and regenerating glutathione requires NADPH, which comes from glucose-6-phosphate dehydrogenase. In someone deficient in that enzyme, the peroxide load bursts red cells — haemolysis — and can convert haemoglobin into a form that cannot carry oxygen. The label makes G6PD deficiency an outright contraindication and screening beforehand a boxed-warning requirement. Deficiency is commonest in people of African, Mediterranean, Middle Eastern and South or Southeast Asian ancestry.',
      },
      {
        q: 'I was told my gout is refractory. Does that mean I need this?',
        a: 'It means the question of whether your oral treatment was pushed to its limit deserves a direct answer first. The label defines refractory as failure with a xanthine oxidase inhibitor "at the maximum medically appropriate dose", and the word maximum is doing all the work. In a randomised trial that escalated allopurinol monthly above the dose usually chosen from kidney function, 69% of patients reached a urate below 6 mg/dL against 32% of those left on their existing dose — and that included the half of participants whose creatinine clearance was under 60 mL/min, the group in whom escalation is most often avoided. Being at 300 mg and not at target is common; having genuinely exhausted allopurinol is much less so. This drug is the right answer for people in the second group and a disproportionate intervention for people in the first.',
        auditNote:
          'The gate between an oral tablet costing five cents and an immunogenic biologic infusion is a single phrase in an indication. Whether a patient is on the correct side of it is a question about dosing history, not about severity.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Sundy JS, Baraf HSB, Yood RA, et al. Efficacy and tolerability of pegloticase for the treatment of chronic gout in patients refractory to conventional treatment: two randomized controlled trials. JAMA 2011;306:711-720',
        identifier: '10.1001/jama.2011.1169',
        kind: 'doi',
      },
      {
        label:
          'Botson JK, Saag K, Peterson J, et al. A Randomized, Double-Blind, Placebo-Controlled Multicenter Efficacy and Safety Study of Methotrexate to Increase Response Rates in Patients With Uncontrolled Gout Receiving Pegloticase: 12-Month Findings (MIRROR RCT). ACR Open Rheumatol 2023;5:407-418',
        identifier: '10.1002/acr2.11578',
        kind: 'doi',
      },
      {
        label: 'Pivotal pegloticase trials C0405 and C0406 registry record',
        identifier: 'NCT00325195',
        kind: 'nct',
      },
      {
        label: 'MIRROR RCT — methotrexate co-therapy with pegloticase, registry record',
        identifier: 'NCT03994731',
        kind: 'nct',
      },
      {
        label:
          'KRYSTEXXA (pegloticase) United States prescribing information — boxed warning (Anaphylaxis and Infusion Reactions, G6PD Deficiency Associated Hemolysis and Methemoglobinemia), Indications and Limitations of Use (1), Dosage and Administration (2.1 to 2.3), Contraindications (4), Warnings and Precautions (5.1 to 5.5), Drug Interactions (7.1), Description (11), Mechanism of Action (12.1), Pharmacokinetics (12.3), Immunogenicity (12.6), Clinical Studies (14, Tables 3 and 4 and the post-hoc discontinuation analysis), BLA 125293',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22KRYSTEXXA%22',
        kind: 'regulatory',
      },
      {
        label:
          'Stamp LK, Chapman PT, Barclay ML, et al. A randomised controlled trial of the efficacy and safety of allopurinol dose escalation to achieve target serum urate in people with gout. Ann Rheum Dis 2017;76:1522-1528 — the titration evidence behind the "maximum medically appropriate dose" condition in the indication',
        identifier: '10.1136/annrheumdis-2016-210872',
        kind: 'doi',
      },
      {
        label:
          'Reinders MK, van Roon EN, Jansen TLTA, et al. Efficacy and tolerability of urate-lowering drugs in gout: a randomised controlled trial of benzbromarone versus probenecid after failure of allopurinol. Ann Rheum Dis 2009;68:51-56',
        identifier: '10.1136/ard.2007.083071',
        kind: 'doi',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — consulted for pegloticase and returning no listed product, as expected for a clinic-administered biologic; allopurinol, febuxostat and probenecid prices quoted on this page are from the survey effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    ],
  },
]
