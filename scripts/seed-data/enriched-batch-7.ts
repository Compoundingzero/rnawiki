import type { SeedDossier } from '@/lib/seed-types'

/**
 * Enriched batch 7 — the lower urinary tract: alpha-blockers, a 5-alpha-reductase inhibitor, the
 * antimuscarinics and the one beta-3 agonist.
 *
 * These drugs are grouped because they share a single auditing problem. Every one of them is
 * approved on a questionnaire. The International Prostate Symptom Score and the three-day bladder
 * diary are the endpoints that got them licensed, and both are patient-reported instruments with
 * large placebo responses — placebo arms in overactive-bladder trials routinely lose one to one and
 * a half urgency episodes a day on their own. So the number that matters on these pages is never
 * the change from baseline. It is the change over placebo, and on this class of drug that margin is
 * usually smaller than the instrument's own minimally important difference. Where a dossier can
 * state that margin it does; where the published abstract reports only within-arm change, the page
 * says so rather than quoting a figure that flatters the drug.
 *
 * Every DOI, PMID and NCT number below was resolved at the time of writing — PMIDs and abstracts
 * through NCBI E-utilities, NCT numbers through the ClinicalTrials.gov v2 API, label text through
 * the openFDA drug-label endpoint. Every effect size, arm size, hazard ratio, confidence interval
 * and p-value is copied from the published abstract or from the US label text stored on this
 * record, never from memory. Where a number could not be sourced, the field is absent.
 *
 * Five conventions apply to the whole group.
 *
 * 1. PRICING IS A PRICE, NOT A COST. `retailPricePerDoseOrYear` carries the United States pharmacy
 *    acquisition cost held on this record, from the CMS National Average Drug Acquisition Cost
 *    survey. `synthesisCostPerDose` is empty on every dossier here, because no published per-dose
 *    cost-of-production figure for any of these molecules could be verified. The cost-of-production
 *    literature checked is Hill, Barber and Gotham in BMJ Global Health, which publishes an
 *    estimation method and an aggregate range rather than per-drug figures for these compounds; it
 *    is cited as `costSource` so a reader can see what was checked and what it does not contain.
 *
 * 2. THE SMILES STRINGS ARE THE ONES ALREADY ON THE RECORD. Each was pulled from PubChem by the
 *    ingestion pipeline and passed this repository's structure parser before curation began. Where
 *    a molecule is dispensed as a salt, or as one enantiomer of a pair, the dossier says which.
 *
 * 3. EVERY DOSSIER SEPARATES THE SYMPTOM SCORE FROM THE OUTCOME. Relaxing the bladder neck is not
 *    the same as preventing urinary retention; drying up a detrusor contraction is not the same as
 *    making someone continent. Tamsulosin monotherapy did not prevent retention or surgery over
 *    four years in CombAT. Antimuscarinics move a diary by fractions of an episode a day and are
 *    stopped by most people inside a year. Which of those a page is describing is stated in as many
 *    words.
 *
 * 4. THE AUDIT POINTS ARE NOT A HIGHLIGHT REEL. Every dossier carries at least one 'inferred' or
 *    'failed' entry, because the literature supplies them: tamsulosin failed outright as a stone
 *    expulsion therapy in SUSPEND after a decade of off-label use, dutasteride's prostate-cancer
 *    prevention trial hit its endpoint and produced a boxed-warning-adjacent high-grade signal
 *    instead of an indication, mirabegron was approved with a blood-pressure warning and a
 *    post-marketing hypertension requirement, and the whole antimuscarinic class now carries an
 *    observational dementia signal that no randomised trial has ever been powered to test.
 *
 * 5. NO DOSING, TITRATION OR PROCUREMENT GUIDANCE. Strengths appear only where they are part of a
 *    trial's description or a label's identity. Nothing here tells a reader what to take.
 */

const NADAC_SOURCE = {
  label: 'CMS National Average Drug Acquisition Cost (NADAC) file, United States pharmacy pricing',
  identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
  kind: 'url' as const,
}

const COST_OF_PRODUCTION_SOURCE = {
  label:
    'Hill A, Barber MJ, Gotham D. Estimated costs of production and potential prices for the WHO Essential Medicines List. BMJ Glob Health 2018;3:e000571 — the cost-of-production literature checked for this group; it publishes an estimation method and an aggregate range, and carries no per-dose figure for the drugs in this file',
  identifier: '10.1136/bmjgh-2017-000571',
  kind: 'doi' as const,
}

export const ENRICHED_BATCH_7_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // 1. Tamsulosin — a real symptom effect that arrives in hours, no effect on retention or surgery
  //    over four years, an eye complication nobody saw for eight years, and a failed second career
  //    as a kidney-stone drug.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'tamsulosin',
    name: 'Tamsulosin',
    tradeName: 'Flomax',
    sponsor: 'Sanofi',
    targetGene: 'ADRA1A',
    targetProtein:
      'Alpha-1A adrenergic receptor on prostatic and bladder-neck smooth muscle, with contribution from the alpha-1D subtype in the bladder body',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1997,
    indication:
      'Treatment of the signs and symptoms of benign prostatic hyperplasia. The label states explicitly that it is not indicated for the treatment of hypertension.',
    patientFriendlyIndication:
      'A weak, slow or hesitant urine stream, and getting up at night, caused by an enlarged prostate',
    anatomicalSite: 'Smooth muscle of the prostatic stroma, prostatic urethra and bladder neck',
    conditionContext: {
      conditionExplainer:
        'The US label divides bladder outlet obstruction into two parts. The static part is the physical bulk of an enlarged prostate pressing on the urethra. The dynamic part is muscle tone: the prostate and bladder neck contain smooth muscle held under constant tension by the sympathetic nervous system. Tamsulosin acts only on the second part.',
      whyItMatters:
        'The label also states that the severity of symptoms and the degree of obstruction do not correlate well with the size of the prostate. That single sentence is why two entirely different drug classes exist for the same complaint, and why shrinking the gland and relaxing it are separate questions with separate evidence.',
      whoTakesThis:
        'Men with moderate to severe lower urinary tract symptoms attributed to benign prostatic hyperplasia. It is the most prescribed drug in its class in the United States and is also widely given off-label to help ureteric stones pass, a use the largest randomised trial did not support.',
      clinicalGoals:
        'Lower the International Prostate Symptom Score or the equivalent AUA symptom index, and raise peak urine flow rate. Neither of those is retention avoided or surgery avoided, and the four-year CombAT data show the difference.',
    },
    oneSentenceVerdict:
      'An alpha-1A-selective blocker that relaxes prostate and bladder-neck muscle within hours without shrinking the gland at all: across the two US registration trials it lowered the AUA symptom score by 8.3 and 5.1 points against 5.5 and 3.6 on placebo, a genuine but modest margin that in four years of CombAT never translated into fewer episodes of urinary retention or fewer operations than dutasteride achieved.',
    laymanHowItWorks:
      'The prostate is not just bulk pressing on the urethra. It is also muscle, held permanently tense by nerve signals, and that tension squeezes the tube urine flows through. Tamsulosin blocks the receptor those nerve signals act on, so the muscle in the prostate and at the neck of the bladder relaxes and the channel widens. The gland itself is exactly the same size afterwards, which is why the effect starts within hours and disappears within days of stopping.',
    auditConfidence: 'High Confidence',
    confidenceScore: 79,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0509 per capsule at United States pharmacy acquisition cost (CMS NADAC, generic, median across 33 listed products, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States in April 1997 under NDA 020579 and long off patent. Thirty-three generic products are listed in the acquisition-cost file, which is why the per-capsule figure is five cents.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Three things compete with tamsulosin, and they compete on different axes. Older non-selective alpha-blockers do the same job for less money and drop blood pressure more. 5-alpha-reductase inhibitors shrink the gland instead of relaxing it, work over months rather than hours, and are the arm of CombAT that actually reduced retention and surgery. Saw palmetto is the supplement bought as a substitute, and it is the one with a large, well-run, completely negative randomised trial behind it.',
      conventionalRx: [
        {
          name: 'Terazosin (Hytrin)',
          class: 'Non-selective alpha-1 adrenergic antagonist',
          howItCompares:
            'Boehringer Ingelheim ran a 1,993-man head-to-head against tamsulosin, NCT02244255, with change in AUA symptom score as the primary endpoint. Terazosin acts at all three alpha-1 subtypes rather than preferentially at the 1A, which is why it lowers blood pressure and needs upward titration in a way tamsulosin does not.',
          typicalCost:
            'US$0.1050 per unit at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: same symptom target, decades of use, cheap. Cons: dose titration, dizziness and first-dose hypotension from genuine blood-pressure lowering, which is a side effect here and was the original indication.',
        },
        {
          name: 'Dutasteride (Avodart)',
          class: '5-alpha-reductase inhibitor',
          howItCompares:
            'Attacks the static component instead of the dynamic one: it shrinks the gland over months rather than relaxing it over hours. In the 4,844-man CombAT trial, combination therapy was significantly superior to tamsulosin monotherapy at reducing acute urinary retention or BPH-related surgery, but not superior to dutasteride monotherapy for that same endpoint.',
          typicalCost:
            'US$0.1606 per capsule at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: the arm of CombAT that carried the retention and surgery benefit. Cons: takes months, halves serum PSA, and carries sexual adverse effects that persist while treatment continues.',
        },
        {
          name: 'Silodosin (Rapaflo)',
          class: 'Alpha-1A adrenergic antagonist, more subtype-selective again',
          howItCompares:
            'A later molecule chosen for still greater alpha-1A over alpha-1B selectivity. The trade is visible in the adverse-event table: retrograde or absent ejaculation is far more common on silodosin than on tamsulosin, because ejaculatory smooth muscle uses the same receptor subtype the drug was optimised for.',
          typicalCost:
            'US$0.3137 per capsule at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: least cardiovascular effect of the class. Cons: ejaculatory dysfunction in a large minority, and six times the acquisition cost of tamsulosin.',
        },
      ],
      naturalFoods: [
        {
          name: 'Saw palmetto (Serenoa repens) berry extract',
          activeCompound: 'Free fatty acid and phytosterol fraction of the lipidosterolic extract',
          biologicalMechanism:
            'Proposed weak inhibition of 5-alpha-reductase plus anti-inflammatory effects on prostatic tissue. The mechanism was never the problem with saw palmetto; the outcome data were.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here. The CAMUS trial randomised 369 men to escalating doses of saw palmetto extract or to placebo for 72 weeks, reaching three times the usual commercial dose. The AUA symptom index fell 2.20 points on extract and 2.99 points on placebo — a difference of 0.79 points favouring placebo, one-sided P = 0.91.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Tell your eye surgeon before cataract surgery, even if you stopped years ago',
          action:
            'Any ophthalmologist planning cataract or glaucoma surgery needs to know about current or past tamsulosin use before the operation, not during it.',
          patientImpact:
            'In the prospective arm of the paper that first described it, intraoperative floppy iris syndrome occurred in 2.2% of 741 consecutive cataract patients, and 15 of those 16 cases were in men taking or having taken tamsulosin. Warned in advance, a surgeon can change technique; discovered mid-operation, the complication rate rises.',
          clinicalPrecaution:
            'Stopping the drug shortly before surgery has not been shown to prevent the syndrome — cases occur in men who stopped months earlier. Disclosure is what changes the outcome, not withdrawal.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CCOC1=CC=CC=C1OCCN[C@H](C)CC2=CC(=C(C=C2)OC)S(=O)(=O)N',
      chemicalFormula: 'C20H28N2O5S',
      molecularWeight: '408.50 g/mol (free base); dispensed as tamsulosin hydrochloride',
      targetReceptorAffinity:
        'Preferential antagonism at the alpha-1A adrenoceptor. The US label supplies the anatomical reason rather than a binding constant: approximately 70% of the alpha-1 receptors in the human prostate are of the alpha-1A subtype, which is why a subtype-preferring antagonist can relax prostatic smooth muscle at doses that leave vascular tone largely alone. Tamsulosin is 94% to 99% bound to plasma protein, chiefly alpha-1 acid glycoprotein, with an apparent half-life of 9 to 13 hours in healthy volunteers and 14 to 15 hours in the target population.',
      structureSource: {
        label: 'PubChem CID 129211 — tamsulosin structure, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/129211',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'tam-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Chiral purity of the (R)-aminopropyl benzenesulfonamide intermediate',
          description:
            'Establish enantiomeric excess of (R)-5-(2-aminopropyl)-2-methoxybenzenesulfonamide before any bond is formed to it. Tamsulosin is a single enantiomer and the (S) antipode is the specified chiral impurity, so the stereochemistry has to be measured at the point it is set rather than argued about at the end.',
          reagentsAndBuffer:
            'Chiral stationary-phase HPLC on an amylose tris(3,5-dimethylphenylcarbamate) column, n-hexane with 2-propanol and diethylamine, UV detection at 225 nm, (S)-enantiomer reference standard',
        },
        {
          id: 'tam-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'N-alkylation with the 2-(2-ethoxyphenoxy)ethyl electrophile',
          description:
            'Couple the chiral primary amine to 2-(2-ethoxyphenoxy)ethyl bromide under base, forming the secondary amine that is the whole molecule. The stereocentre is not touched in this step, which is the point of setting it earlier.',
          dependsOnStepId: 'tam-w1',
          reagentsAndBuffer:
            '2-(2-ethoxyphenoxy)ethyl bromide, potassium carbonate or diisopropylethylamine, acetonitrile or dimethylformamide, nitrogen atmosphere, sodium iodide as alkylation catalyst',
        },
        {
          id: 'tam-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Hydrochloride salt formation and recrystallisation',
          description:
            'Precipitate the hydrochloride from the free base and recrystallise, then re-run the chiral assay on the finished salt. Over-alkylation to the tertiary amine and residual unreacted alkyl bromide are the two process impurities the specification is written around.',
          dependsOnStepId: 'tam-w2',
          reagentsAndBuffer:
            'Hydrogen chloride in 2-propanol, ethanol and water for recrystallisation, activated charcoal, reversed-phase HPLC for related substances, chiral HPLC for enantiomeric excess',
        },
        {
          id: 'tam-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Application to cells expressing each human alpha-1 subtype separately',
          description:
            'Apply the compound to three stable cell lines, each carrying one human alpha-1 adrenoceptor subtype — 1A, 1B and 1D. Tamsulosin has no intracellular target and does not need to enter a cell; the receptor sits in the plasma membrane and the drug reaches it from outside. Running the three subtypes side by side is the only way a selectivity claim means anything.',
          dependsOnStepId: 'tam-w3',
          reagentsAndBuffer:
            'CHO or HEK293 lines stably expressing human ADRA1A, ADRA1B or ADRA1D, Ham F-12 or DMEM with 10% fetal bovine serum, geneticin selection, HEPES-buffered assay saline at pH 7.4',
        },
        {
          id: 'tam-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Radioligand competition and calcium-mobilisation readout',
          description:
            'Measure displacement of a labelled alpha-1 antagonist from each subtype to get binding affinity, then measure blockade of agonist-evoked intracellular calcium to confirm the binding is functional antagonism rather than affinity without effect. Reporting both matters: an affinity ratio is a chemistry number, and a functional ratio is the one that predicts what happens in tissue.',
          dependsOnStepId: 'tam-w4',
          reagentsAndBuffer:
            'Tritiated prazosin as radioligand, phentolamine for non-specific binding, GF/C filter plates, Fluo-4 AM calcium indicator, phenylephrine as agonist, probenecid-containing assay buffer',
        },
      ],
    },
    keyAudits: [
      {
        id: 'tam-a1',
        category: 'measured',
        title: 'A real symptom effect over placebo, roughly two to three points on a 35-point scale',
        laymanSummary:
          'In the two American registration trials, men on tamsulosin improved more than men on placebo. The placebo groups also improved substantially, and the difference between them was around two to three points on a scale that runs to 35.',
        technicalDetails:
          'The US label reports both pivotal studies. In Study 1 the AUA symptom score fell 8.3 ± 6.5 points on 0.4 mg and 9.6 ± 6.7 on 0.8 mg, against 5.5 ± 6.6 on placebo; in Study 2 it fell 5.1 ± 6.4 and 5.8 ± 6.4 against 3.6 ± 5.7. Peak urine flow rose 1.75 ± 3.57 and 1.78 ± 3.35 mL/sec in Study 1 against 0.52 ± 3.39 on placebo, and 1.52 ± 3.64 and 1.79 ± 3.36 in Study 2 against 0.93 ± 3.28. The Lepor phase 3 report of 756 randomised patients describes onset of action on peak flow within 4 to 8 hours of the first 0.4 mg dose. The placebo change is the number readers are least often shown and does two-thirds of the work in Study 1.',
        evidenceSource:
          'US prescribing information for tamsulosin hydrochloride capsules, Clinical Studies section; Lepor H, Urology 1998;51:892-900 (PMID 9609623)',
        doi: '10.1016/s0090-4295(98)00126-5',
        measuredMetric:
          'Change from baseline in AUA symptom score and in peak urine flow rate at 13 weeks, against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'tam-a2',
        category: 'failed',
        title: 'Four years of tamsulosin alone did not prevent retention or surgery in CombAT',
        laymanSummary:
          'The largest long-term trial of this drug compared it with a prostate-shrinking drug and with both together. On the outcomes that matter — needing a catheter for retention, or needing an operation — tamsulosin alone was the arm that lost.',
        technicalDetails:
          'CombAT (NCT00090103) randomised 4,844 men aged 50 and over with an International Prostate Symptom Score of 12 or more, prostate volume of 30 cm3 or more and PSA between 1.5 and 10 ng/mL, to dutasteride 0.5 mg, tamsulosin 0.4 mg, or both, for four years. Combination therapy was significantly superior to tamsulosin monotherapy at reducing the relative risk of acute urinary retention or BPH-related surgery, but was not superior to dutasteride monotherapy for that endpoint. Combination was superior to both monotherapies for BPH clinical progression and for symptom score at four years. The published report also notes an imbalance in the composite term of cardiac failure across the three arms.',
        evidenceSource:
          'Roehrborn CG et al., CombAT Study Group, Eur Urol 2010;57:123-131 (PMID 19825505); ClinicalTrials.gov NCT00090103',
        doi: '10.1016/j.eururo.2009.09.035',
        measuredMetric:
          'Relative risk of acute urinary retention or BPH-related surgery over four years, by treatment arm',
        auditFlag: 'verified',
      },
      {
        id: 'tam-a3',
        category: 'failed',
        title: 'SUSPEND: tamsulosin does not help a kidney stone pass',
        laymanSummary:
          'For years men with ureteric stones were given tamsulosin to help the stone come out, on the strength of small trials and meta-analyses. A 1,167-patient placebo-controlled trial across 24 UK hospitals found it made no difference at all.',
        technicalDetails:
          'SUSPEND randomised adults aged 18 to 65 with a single CT-confirmed ureteric stone of 10 mm or less to tamsulosin 400 µg, nifedipine 30 mg or placebo for up to four weeks. The primary outcome was the proportion needing no further intervention by four weeks. It was reached by 303 of 379 (80%) on placebo, 307 of 378 (81%) on tamsulosin (adjusted risk difference 1.3%, 95% CI -5.7 to 8.3, p=0.73) and 304 of 379 (80%) on nifedipine (0.5%, -5.6 to 6.5, p=0.88). The health technology assessment report of the same trial found no difference in quality-adjusted life-years or costs, and concluded medical expulsive therapy was unlikely to be cost-effective. The prior meta-analytic literature that established the practice had reported the opposite.',
        evidenceSource: 'Pickard R et al., Lancet 2015;386:341-349 (PMID 25998582)',
        doi: '10.1016/S0140-6736(15)60933-3',
        measuredMetric:
          'Proportion of patients needing no further intervention for stone clearance within four weeks',
        inferredClaim:
          'That the smooth-muscle relaxation tamsulosin produces in the prostate also relaxes the ureter enough to expel a stone — a mechanistic extrapolation that held up in small trials and failed in the large one',
        auditFlag: 'verified',
      },
      {
        id: 'tam-a4',
        category: 'conclusion_shift',
        title: 'Intraoperative floppy iris syndrome was invisible for eight years after approval',
        laymanSummary:
          'In 2005, eight years after approval, two eye surgeons noticed that a specific and dangerous behaviour of the iris during cataract surgery was happening almost exclusively in men on tamsulosin. It is now on the label. It was on nobody\'s list before.',
        technicalDetails:
          'Chang and Campbell reviewed 706 eyes from 511 consecutive cataract patients retrospectively and 900 consecutive cases from 741 patients prospectively. In the retrospective series, IFIS occurred in 10 of the 16 tamsulosin patients (63.0%) and in none of the 11 patients taking other systemic alpha-1 blockers. In the prospective series the prevalence of IFIS was 2.2% of 741 patients, and 15 of those 16 cases were current or former tamsulosin users. Overall IFIS prevalence in the retrospective series was 2.0%. The current US label carries the warning and instructs patients to tell their ophthalmologist about current or prior use before eye surgery. Nothing in the registration programme could have found this: cataract surgery is not an endpoint in a BPH trial.',
        evidenceSource: 'Chang DF, Campbell JR, J Cataract Refract Surg 2005;31:664-673 (PMID 15899440)',
        doi: '10.1016/j.jcrs.2005.02.027',
        measuredMetric:
          'Prevalence of intraoperative floppy iris syndrome in consecutive cataract series, by alpha-blocker exposure',
        auditFlag: 'verified',
      },
      {
        id: 'tam-a5',
        category: 'measured',
        title: 'Severe hypotension roughly doubles in the first four weeks, and again on restarting',
        laymanSummary:
          'Tamsulosin is marketed as the alpha-blocker that does not drop blood pressure. In a study of 297,596 new users, hospital admission for severe low blood pressure was about twice as likely during the first month, and the risk returned each time a man restarted the drug.',
        technicalDetails:
          'Bird and colleagues studied 383,567 new users in US healthcare claims — 297,596 starting tamsulosin and 85,971 starting a 5-alpha-reductase inhibitor as comparator — and identified 2,562 hospital admissions for severe hypotension. Incidence was 42.4 events per 10,000 person-years on tamsulosin against 31.3 on 5ARIs. Within the tamsulosin cohort, the rate ratio was 2.12 (95% CI 1.29 to 3.04) during weeks 1 to 4 and 1.51 (1.04 to 2.18) during weeks 5 to 8, with no significant increase at weeks 9 to 12. Comparable increases followed restarting the drug. The authors framed the finding as a first-dose phenomenon requiring counselling rather than as an argument against the drug.',
        evidenceSource: 'Bird ST et al., BMJ 2013;347:f6320 (PMID 24192967)',
        doi: '10.1136/bmj.f6320',
        measuredMetric:
          'Rate ratio for hospital admission with severe hypotension, by week since initiation',
        auditFlag: 'caution',
      },
      {
        id: 'tam-a6',
        category: 'inferred',
        title: 'The dementia signal came from one claims database and did not replicate in another',
        laymanSummary:
          'A large US Medicare analysis found 17% more dementia in tamsulosin users. A Korean national study designed to check it found no difference between tamsulosin and the other drugs in its class. Both are observational, and neither settles it.',
        technicalDetails:
          'Duan and colleagues compared 253,136 tamsulosin users with propensity-matched Medicare cohorts over a median 19.8 months and reported dementia incidence of 31.3 per 1,000 person-years against 25.9 in men on no BPH medication, hazard ratio 1.17 (95% CI 1.14 to 1.21), with similar excesses against doxazosin, terazosin, alfuzosin, dutasteride and finasteride. Tae and colleagues then analysed 59,263 men in the Korean National Health Insurance Service database from 2011 to 2017 and found no difference between tamsulosin and doxazosin (HR 1.038, 95% CI 0.960 to 1.121) or alfuzosin (HR 1.008, 0.925 to 1.098). A signal that appears against every comparator including two drugs with entirely different mechanisms is the pattern confounding by indication produces, and no randomised trial has ever been powered for a dementia endpoint in this class.',
        evidenceSource:
          'Duan Y et al., Pharmacoepidemiol Drug Saf 2018;27:340-348 (PMID 29316005); Tae BS et al., J Urol 2019;202:362-368 (PMID 30840545)',
        doi: '10.1002/pds.4361',
        inferredClaim:
          'That tamsulosin causes dementia — a claims-database association that appears against every comparator, including drugs with unrelated mechanisms, and disappears in the national database assembled to test it',
        auditFlag: 'contested',
      },
      {
        id: 'tam-a7',
        category: 'measured',
        title: 'Abnormal ejaculation is dose-dependent and forty times the placebo rate',
        laymanSummary:
          'At the usual dose, about one man in twelve reports abnormal ejaculation, against one in five hundred on placebo. At double the dose it is closer to one in five.',
        technicalDetails:
          'The pooled adverse-event table in the US prescribing information reports abnormal ejaculation in 42 of 502 patients (8.4%) on 0.4 mg once daily and 89 of 492 (18.1%) on 0.8 mg once daily, against 1 of 493 (0.2%) on placebo. The dose-response is close to linear and is mechanistic rather than idiosyncratic: seminal vesicle and vas deferens smooth muscle carries the same alpha-1A receptor the drug was designed to prefer. This is the clearest example on the page of an on-target effect that is therapeutic in one organ and an adverse event in another.',
        evidenceSource:
          'US prescribing information for tamsulosin hydrochloride capsules, Adverse Reactions section, pooled 13-week placebo-controlled studies',
        measuredMetric: 'Incidence of abnormal ejaculation by dose in the pooled registration trials',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed, absorbed slowly, and carried almost entirely on protein',
        laymanDesc:
          'The capsule is designed to release slowly so the drug level rises gently rather than spiking. Almost all of what enters the blood is stuck to a carrier protein, and only the small free fraction can do anything.',
        molecularDetail:
          'Modified-release capsule; 94% to 99% bound to plasma proteins, chiefly alpha-1 acid glycoprotein. Apparent half-life 9 to 13 hours in healthy volunteers and 14 to 15 hours in the target population. Metabolised by CYP3A4 and CYP2D6, which is why strong inhibitors of either raise exposure.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It reaches the prostate without ever entering a cell',
        laymanDesc:
          'The target sits on the outside surface of the muscle cell, facing the bloodstream. The drug never has to get inside anything — it simply arrives at the surface and sits on the receptor.',
        molecularDetail:
          'Alpha-1 adrenoceptors are G-protein-coupled receptors in the plasma membrane with an extracellular-facing orthosteric pocket. There is no transporter step and no intracellular accumulation requirement, which is the structural reason the effect appears within hours of the first dose and fades within days of stopping.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It occupies the receptor noradrenaline needs',
        laymanDesc:
          'Nerve endings in the prostate constantly release a signal that tells the muscle to stay tense. Tamsulosin sits in the receptor that signal binds to, so the message stops arriving.',
        molecularDetail:
          'Competitive antagonism at the alpha-1A adrenoceptor, with preference over the alpha-1B subtype that predominates in vasculature. The label gives the anatomical basis: roughly 70% of alpha-1 receptors in the human prostate are alpha-1A. Alpha-1D antagonism in the bladder body probably contributes to the storage symptoms that improve.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The calcium signal that holds the muscle tense stops',
        laymanDesc:
          'Tension in smooth muscle is maintained by a continuous internal calcium signal. With the receptor blocked, that signal falls and the muscle lets go.',
        molecularDetail:
          'Loss of Gq/11 coupling ends phospholipase C activation, so inositol trisphosphate falls, sarcoplasmic reticulum calcium release drops and myosin light-chain kinase activity declines. Prostatic stromal and bladder-neck smooth muscle relaxes. The prostate is not reduced in volume by any amount.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The outlet widens, flow rises, the score falls — and the gland is unchanged',
        laymanDesc:
          'Urine meets less resistance leaving the bladder. Flow rate rises by under two millilitres a second on average, and the symptom questionnaire improves by a few points more than placebo.',
        molecularDetail:
          'Peak flow rose 1.75 and 1.52 mL/sec over baseline in the two registration studies against 0.52 and 0.93 on placebo, with AUA symptom score falling 8.3 and 5.1 against 5.5 and 3.6. Because only the dynamic component of obstruction is addressed, four years of monotherapy in CombAT did not deliver the retention and surgery reduction that shrinking the gland did.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Lepor phase 3 registration trial (US Tamsulosin Investigator Group)',
        phase: 'Phase 3 randomised double-blind placebo-controlled, 13 weeks',
        sampleSize: 756,
        primaryEndpoint: 'Change in AUA symptom score and peak urine flow rate versus placebo',
        endpointMet: true,
        statisticalPValue:
          'Statistically significant improvement in all efficacy parameters versus placebo; the long-term extension reports P < 0.001 for AUA symptom score change from baseline in all groups',
        unreportedAdverseSignals:
          'Intraoperative floppy iris syndrome was not an endpoint, was not looked for, and was not described until 2005. Abnormal ejaculation was captured, at 8.4% on 0.4 mg against 0.2% on placebo.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'CombAT (NCT00090103)',
        phase: 'Phase 3 randomised double-blind, 4 years',
        sampleSize: 4844,
        primaryEndpoint:
          'Relative risk of acute urinary retention or BPH-related surgery with combination therapy versus each monotherapy',
        endpointMet: false,
        statisticalPValue:
          'Combination was significantly superior to tamsulosin monotherapy but not to dutasteride monotherapy for acute urinary retention or BPH-related surgery',
        unreportedAdverseSignals:
          'The published report notes an imbalance in the composite term of cardiac failure across the three arms. `endpointMet: false` here records that tamsulosin monotherapy was the arm that lost, not that the trial failed.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'SUSPEND (medical expulsive therapy for ureteric colic)',
        phase: 'Randomised double-blind placebo-controlled, 24 UK hospitals, 4 weeks',
        sampleSize: 1136,
        primaryEndpoint:
          'Proportion of participants needing no further intervention for stone clearance within four weeks',
        endpointMet: false,
        statisticalPValue:
          'P = 0.73 for tamsulosin versus placebo (adjusted risk difference 1.3%, 95% CI -5.7 to 8.3)',
        unreportedAdverseSignals:
          'The 1,167 randomised included participants without primary-outcome data; the analysed comparison is 379 placebo, 378 tamsulosin and 379 nifedipine. The health technology assessment of the same trial found no QALY or cost difference either.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'FLOMAX versus HYTRIN head-to-head (NCT02244255)',
        phase: 'Phase 4 randomised comparison',
        sampleSize: 1993,
        primaryEndpoint: 'Change in AUA symptom score index versus terazosin',
        endpointMet: false,
        statisticalPValue:
          'No result posted. The registry entry records completion with no results section and no linked publication.',
        unreportedAdverseSignals:
          'A 1,993-man head-to-head against the older, cheaper drug in the same class, completed and never reported. `endpointMet: false` here means no result exists, not that the endpoint was missed.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'AUA symptom score fell 8.3 and 5.1 points on 0.4 mg in the two US registration studies, against 5.5 and 3.6 on placebo',
        'Peak urine flow rose 1.75 and 1.52 mL/sec against 0.52 and 0.93 on placebo in the same studies',
        'Abnormal ejaculation in 8.4% on 0.4 mg and 18.1% on 0.8 mg, against 0.2% on placebo',
        'Hospital admission for severe hypotension at a rate ratio of 2.12 (95% CI 1.29 to 3.04) during weeks 1 to 4 after starting, in 297,596 new users',
        'Intraoperative floppy iris syndrome in 63.0% of tamsulosin patients undergoing cataract surgery in the retrospective series that first described it, and in none of 11 patients on other alpha-1 blockers',
      ],
      unsupportedInferences: [
        'That relaxing prostatic smooth muscle also expels ureteric stones — SUSPEND randomised 1,136 analysed patients and found an adjusted risk difference of 1.3% (p=0.73)',
        'That tamsulosin causes dementia — a Medicare hazard ratio of 1.17 that appears against every comparator including finasteride, and vanishes in the Korean national database (HR 1.038 versus doxazosin)',
        'That symptom-score improvement predicts avoided retention or avoided surgery — four years of CombAT show it does not for this arm',
        'That being the alpha-blocker which "does not lower blood pressure" means no hypotension risk; the first-dose and restart windows are measurable in claims data',
      ],
      whatFailedInitially: [
        'Medical expulsive therapy for ureteric colic: a decade of routine off-label use, supported by meta-analyses of small trials, overturned by one adequately powered trial',
        'Tamsulosin monotherapy over four years in CombAT, which was the arm combination therapy beat on retention and surgery',
        'The 1,993-man head-to-head against terazosin, completed and never published, leaving the comparison with the cheaper older drug unresolved in the public record',
      ],
      realWorldOutcome: [
        'Five cents a capsule at United States pharmacy acquisition cost, with 33 generic products listed',
        'The floppy iris warning now appears on the labels of the whole alpha-blocker class, added eight years after this drug was approved',
        'Still the most prescribed drug for benign prostatic hyperplasia in the United States, and still prescribed off-label for stones in some centres after SUSPEND',
      ],
    },
    deliverySystem: {
      type: 'Oral modified-release capsule, taken once daily',
      description:
        'The modified-release formulation exists to blunt the peak concentration after each dose, which is what drives the dizziness and orthostatic effects. The label instructs administration approximately 30 minutes after the same meal each day, because food alters the absorption profile and consistency matters more than timing.',
      safetyProfile:
        'Commonest effects are dizziness, abnormal ejaculation and rhinitis. Orthostatic hypotension and syncope can occur, particularly at initiation and on restarting after an interruption, and claims data show the risk concentrated in the first eight weeks. The label carries warnings for intraoperative floppy iris syndrome in cataract and glaucoma surgery, for priapism, and for concomitant use with strong CYP3A4 inhibitors. It states explicitly that the drug is not indicated for hypertension.',
    },
    commonQuestions: [
      {
        q: 'Does tamsulosin shrink the prostate?',
        a: 'No, and it is not designed to. The US label splits bladder outlet obstruction into a static component, which is the physical size of the gland, and a dynamic component, which is smooth muscle tone. Tamsulosin acts only on the second. The gland is the same size on day one and day one thousand. That is the reason the effect appears within four to eight hours of the first dose, and also the reason four years of it in the CombAT trial did not reduce acute urinary retention or the need for surgery the way the gland-shrinking arm did.',
        auditNote:
          'The two drug classes for this condition are routinely described as alternatives. On the outcomes measured over four years they are not doing the same job.',
      },
      {
        q: 'I was told to take it to help pass a kidney stone. Does that work?',
        a: 'The largest trial says no. SUSPEND randomised adults across 24 UK hospitals with a single CT-confirmed stone of 10 mm or less to tamsulosin, nifedipine or placebo for up to four weeks. Eighty per cent of the placebo group needed no further intervention, against 81% on tamsulosin — an adjusted risk difference of 1.3% with a confidence interval running from -5.7% to 8.3%, p=0.73. The practice had been built on meta-analyses of small trials that pointed the other way. The health technology assessment of the same trial found no difference in quality of life or cost either.',
      },
      {
        q: 'Why do I have to tell my eye surgeon about this?',
        a: 'Because of a complication nobody knew existed until eight years after the drug was approved. In 2005 two surgeons reported that during cataract surgery the iris of men on tamsulosin behaved differently: it billowed, prolapsed towards the incisions and progressively constricted. In their retrospective series it happened in 10 of 16 tamsulosin patients and in none of 11 patients on other alpha-1 blockers. A surgeon who knows in advance can change technique and instruments. One who meets it mid-operation cannot. Stopping the drug beforehand has not been shown to prevent it — cases occur in men who stopped months or years earlier — so the thing that changes the outcome is telling them, not stopping.',
        auditNote:
          'A registration programme measuring urine flow could not have found this. It took an ophthalmologist noticing a pattern in his own operating list.',
      },
      {
        q: 'Does it cause dementia?',
        a: 'Two large database studies disagree, and neither is a trial. A US Medicare analysis of 253,136 tamsulosin users found a hazard ratio of 1.17 for dementia against men on no BPH medication. The same paper found similar excesses against doxazosin, terazosin, alfuzosin, dutasteride and finasteride — that is, against drugs with completely different mechanisms, which is the fingerprint of confounding rather than of a drug effect. A Korean national study of 59,263 men then found no difference between tamsulosin and doxazosin (HR 1.038) or alfuzosin (HR 1.008). No randomised trial in this class has ever been powered for a dementia endpoint, so what exists is two observational datasets pointing in different directions.',
      },
      {
        q: 'Why does this page not show a manufacturing cost?',
        a: 'Because no per-dose cost-of-production figure for tamsulosin could be verified and cited. The cost-of-production literature checked here publishes an estimation method and aggregate ranges rather than a per-dose figure for this molecule, and putting a number in that field without a source would mean this page inventing one. What is shown instead is what pharmacies actually pay — about five cents a capsule from the CMS acquisition-cost survey — which is a price, not a cost of manufacture.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Lepor H; Tamsulosin Investigator Group. Phase III multicenter placebo-controlled study of tamsulosin in benign prostatic hyperplasia. Urology 1998;51:892-900',
        identifier: '10.1016/s0090-4295(98)00126-5',
        kind: 'doi',
      },
      {
        label:
          'Lepor H; Tamsulosin Investigator Group. Long-term evaluation of tamsulosin in benign prostatic hyperplasia: placebo-controlled, double-blind extension of phase III trial. Urology 1998;51:901-906',
        identifier: '10.1016/s0090-4295(98)00127-7',
        kind: 'doi',
      },
      {
        label:
          'Roehrborn CG et al., CombAT Study Group. The effects of combination therapy with dutasteride and tamsulosin on clinical outcomes in men with symptomatic BPH: 4-year results from the CombAT study. Eur Urol 2010;57:123-131',
        identifier: '10.1016/j.eururo.2009.09.035',
        kind: 'doi',
      },
      {
        label: 'CombAT — Combination of Avodart and Tamsulosin, 4-year randomised trial',
        identifier: 'NCT00090103',
        kind: 'nct',
      },
      {
        label:
          'Pickard R et al. Medical expulsive therapy in adults with ureteric colic: a multicentre, randomised, placebo-controlled trial (SUSPEND). Lancet 2015;386:341-349',
        identifier: '10.1016/S0140-6736(15)60933-3',
        kind: 'doi',
      },
      {
        label:
          'Pickard R et al. Use of drug therapy in the management of symptomatic ureteric stones in hospitalised adults (the SUSPEND trial). Health Technol Assess 2015;19(63):1-171',
        identifier: '10.3310/hta19630',
        kind: 'doi',
      },
      {
        label:
          'Chang DF, Campbell JR. Intraoperative floppy iris syndrome associated with tamsulosin. J Cataract Refract Surg 2005;31:664-673',
        identifier: '10.1016/j.jcrs.2005.02.027',
        kind: 'doi',
      },
      {
        label:
          'Bird ST et al. Tamsulosin treatment for benign prostatic hyperplasia and risk of severe hypotension in men aged 40-85 years in the United States. BMJ 2013;347:f6320',
        identifier: '10.1136/bmj.f6320',
        kind: 'doi',
      },
      {
        label:
          'Duan Y, Grady JJ, Albertsen PC, Wu ZH. Tamsulosin and the risk of dementia in older men with benign prostatic hyperplasia. Pharmacoepidemiol Drug Saf 2018;27:340-348',
        identifier: '10.1002/pds.4361',
        kind: 'doi',
      },
      {
        label:
          'Tae BS et al. Alpha-Blocker and Risk of Dementia in Patients with Benign Prostatic Hyperplasia: A Nationwide Population Based Study. J Urol 2019;202:362-368',
        identifier: '10.1097/JU.0000000000000209',
        kind: 'doi',
      },
      {
        label: 'FLOMAX versus HYTRIN in patients with the signs and symptoms of BPH',
        identifier: 'NCT02244255',
        kind: 'nct',
      },
      {
        label:
          'US prescribing information for tamsulosin hydrochloride capsules — mechanism of action, clinical pharmacology, clinical studies and adverse reactions (openFDA drug label endpoint)',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22tamsulosin+hydrochloride%22',
        kind: 'regulatory',
      },
      {
        label:
          'Barry MJ et al., CAMUS Study Group. Effect of increasing doses of saw palmetto extract on lower urinary tract symptoms: a randomized trial. JAMA 2011;306:1344-1351',
        identifier: '10.1001/jama.2011.1364',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 129211 — tamsulosin structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/129211',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 2. Dutasteride — the one drug here with a hard outcome benefit, whose prevention trial hit its
  //    endpoint and produced a label warning instead of an indication.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'dutasteride',
    name: 'Dutasteride',
    tradeName: 'Avodart',
    sponsor: 'Waylis Therapeutics',
    targetGene: 'SRD5A1 and SRD5A2',
    targetProtein:
      'Steroid 5-alpha-reductase, both the type 1 and the type 2 isoenzyme, which is what separates it from finasteride',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2001,
    indication:
      'Treatment of symptomatic benign prostatic hyperplasia in men with an enlarged prostate, to improve symptoms, reduce the risk of acute urinary retention and reduce the risk of needing BPH-related surgery; and in combination with tamsulosin for the same population',
    patientFriendlyIndication:
      'An enlarged prostate, where the aim is to shrink the gland rather than relax it',
    anatomicalSite:
      'Prostate epithelium and stroma, with the type 1 isoenzyme also inhibited in skin and liver',
    conditionContext: {
      conditionExplainer:
        'The prostate grows through life under the influence of dihydrotestosterone, a more potent androgen the gland makes locally from testosterone using the enzyme 5-alpha-reductase. Remove the dihydrotestosterone and androgen-dependent prostate tissue shrinks. This is the static component of obstruction, the one an alpha-blocker cannot touch.',
      whyItMatters:
        'Alone in this batch, dutasteride has randomised evidence on outcomes people care about rather than on a questionnaire: fewer episodes of acute urinary retention and fewer operations. The cost of that is systemic androgen suppression, and the trial designed to turn it into a cancer-prevention drug found something the label now warns about instead.',
      whoTakesThis:
        'Men with an enlarged prostate, usually 30 cm3 or more, since gland size predicts who benefits. It is also used off-label for male pattern hair loss, at a dose and for a duration no outcome trial in this file covers.',
      clinicalGoals:
        'Reduce prostate volume and dihydrotestosterone, and through that reduce acute urinary retention and BPH-related surgery over years, not weeks.',
    },
    oneSentenceVerdict:
      'A dual 5-alpha-reductase inhibitor that cuts circulating dihydrotestosterone by about 90% and shrank the prostate 25.7% over two years in 4,325 men, cutting acute urinary retention by 57% and BPH surgery by 48% — and the same androgen suppression, tested for four years in 8,231 men to prevent prostate cancer, produced twelve Gleason 8-10 tumours against one on placebo in years three and four, which is why the label carries a warning where an indication was expected.',
    laymanHowItWorks:
      'The prostate does not respond to testosterone directly. It converts testosterone into a stronger hormone, dihydrotestosterone, using an enzyme that sits inside prostate cells, and it is that stronger hormone which keeps the gland growing. Dutasteride jams both versions of that enzyme, so dihydrotestosterone in the blood falls by around 90% and the androgen-dependent part of the gland gradually shrinks. Because it works by removing a growth signal rather than by relaxing muscle, nothing happens for months.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 74,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1606 per capsule at United States pharmacy acquisition cost (CMS NADAC, generic, median across 7 listed products, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Developed at GlaxoSmithKline as GG745 and approved in the United States in November 2001 under NDA 021319. The composition-of-matter patent has expired and seven generic products are listed in the acquisition-cost file. The fixed-dose combination with tamsulosin, Jalyn, is a separate application.',
      synthesisComplexity: 'High',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The honest comparison set is short. Finasteride does the same job through one of the two isoenzymes and lost nothing to dutasteride in a 1,630-man head-to-head. Tamsulosin works on the other component of obstruction, faster and for a third the price, and did not prevent retention or surgery over four years. Saw palmetto is the supplement bought instead of all of them and has a large, negative, well-conducted trial.',
      conventionalRx: [
        {
          name: 'Finasteride (Proscar)',
          class: '5-alpha-reductase inhibitor, type 2 selective',
          howItCompares:
            'EPICS randomised 1,630 men to dutasteride or finasteride for 48 blinded weeks. Both reduced prostate volume with no significant difference between them, and symptom index and peak flow improved similarly. Dual inhibition of both isoenzymes was the reason dutasteride existed; it did not produce a measurable clinical advantage in the trial built to look for one.',
          typicalCost:
            'US$0.0684 per tablet at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: less than half the acquisition cost, a shorter half-life, and a seven-year placebo-controlled trial of its own. Cons: the same high-grade prostate cancer label warning, from finasteride 1.8% against placebo 1.1% in that trial.',
        },
        {
          name: 'Tamsulosin (Flomax)',
          class: 'Alpha-1A adrenergic antagonist',
          howItCompares:
            'Acts on muscle tone rather than gland size, so it works within hours instead of months. In CombAT, combination therapy beat tamsulosin monotherapy on acute urinary retention and BPH-related surgery but did not beat dutasteride monotherapy on that endpoint. Dutasteride was the arm carrying the outcome benefit.',
          typicalCost:
            'US$0.0509 per capsule at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: immediate effect, a third of the price, no PSA interference. Cons: no effect on gland size, no retention or surgery benefit over four years, ejaculatory dysfunction, floppy iris syndrome at cataract surgery.',
        },
      ],
      naturalFoods: [
        {
          name: 'Saw palmetto (Serenoa repens) berry extract',
          activeCompound: 'Free fatty acid and phytosterol fraction of the lipidosterolic extract',
          biologicalMechanism:
            'Weak 5-alpha-reductase inhibition is the proposed mechanism, which makes it a nominal analogue of this drug. Dutasteride cuts serum dihydrotestosterone by roughly 90%; no comparable measurement supports the extract.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here. In CAMUS, 369 men took escalating doses to three times the usual commercial dose over 72 weeks. The AUA symptom index fell 2.20 points on extract against 2.99 on placebo.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Make sure whoever reads your PSA knows you are on this',
          action:
            'Any clinician interpreting a PSA result needs to know about current dutasteride use, because the number they are looking at is not comparable to a normal range.',
          patientImpact:
            'The label states that dutasteride reduces serum PSA by approximately 50%. A PSA that looks reassuring can be a value that would have prompted investigation if the drug were not being taken.',
          clinicalPrecaution:
            'Any confirmed rise in PSA while on a 5-alpha-reductase inhibitor should be evaluated, even if the absolute value still sits inside the reference range. This is a measurement artefact, not a treatment effect on cancer risk.',
        },
        {
          name: 'Do not donate blood for six months after stopping',
          action:
            'The label instructs men treated with dutasteride not to donate blood until at least six months after the last dose.',
          patientImpact:
            'The terminal elimination half-life is approximately five weeks at steady state, and serum concentrations stay detectable above 0.1 ng/mL for four to six months after stopping. The deferral exists to prevent a transfused pregnant recipient being exposed.',
          clinicalPrecaution:
            '5-alpha-reductase inhibitors can interfere with development of the external genitalia of a male fetus. That is the reason for the deferral and for the handling advice on the capsules.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'C[C@]12CC[C@H]3[C@H]([C@@H]1CC[C@@H]2C(=O)NC4=C(C=CC(=C4)C(F)(F)F)C(F)(F)F)CC[C@@H]5[C@@]3(C=CC(=O)N5)C',
      chemicalFormula: 'C27H30F6N2O2',
      molecularWeight: '528.50 g/mol',
      targetReceptorAffinity:
        'Not a receptor ligand. The US label describes dutasteride as a competitive and specific inhibitor of both the type 1 and the type 2 5-alpha-reductase isoenzyme, with which it forms a stable enzyme complex. That stable complex is the pharmacological reason for the unusual kinetics: the terminal elimination half-life is approximately five weeks at steady state, and serum concentrations remain detectable above 0.1 ng/mL for four to six months after the last dose.',
      structureSource: {
        label: 'PubChem CID 6918296 — dutasteride structure, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/6918296',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'dut-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Stereochemical control of the 4-azasteroid core',
          description:
            'Confirm the 5-alpha ring fusion and the 1,2-unsaturation of the 3-oxo-4-aza-androst-1-ene-17-beta-carboxylic acid before coupling. The 5-beta epimer is the specified impurity and is not separable by simple recrystallisation once the amide has been formed, so it has to be excluded at the core stage.',
          reagentsAndBuffer:
            'Reversed-phase HPLC with UV detection at 240 nm for the enone chromophore, proton and carbon NMR in deuterated chloroform, 5-beta epimer reference standard, Karl Fischer titration',
        },
        {
          id: 'dut-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Amide coupling to 2,5-bis(trifluoromethyl)aniline',
          description:
            'Activate the 17-beta carboxylic acid and couple it to 2,5-bis(trifluoromethyl)aniline. The aniline is deactivated by two trifluoromethyl groups and is a poor nucleophile, which is why this step needs an activated acyl species rather than a standard carbodiimide coupling and is the reason the molecule is expensive relative to finasteride.',
          dependsOnStepId: 'dut-w1',
          reagentsAndBuffer:
            'Thionyl chloride or oxalyl chloride for acid chloride formation, 2,5-bis(trifluoromethyl)aniline, pyridine or triethylamine as base, anhydrous dichloromethane or toluene, nitrogen atmosphere',
        },
        {
          id: 'dut-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation and residual aniline clearance',
          description:
            'Recrystallise the crude amide and assay for residual free aniline and for the 5-beta epimer. Unreacted 2,5-bis(trifluoromethyl)aniline is a genotoxic-class concern and is controlled to a low threshold rather than to a general related-substances limit.',
          dependsOnStepId: 'dut-w2',
          reagentsAndBuffer:
            'Ethyl acetate and n-heptane for recrystallisation, activated charcoal, gas chromatography with mass-selective detection for residual aniline, reversed-phase HPLC for related substances',
        },
        {
          id: 'dut-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Exposure of cells expressing each 5-alpha-reductase isoenzyme separately',
          description:
            'Apply the compound to cells expressing human SRD5A1 or SRD5A2 individually. The enzyme is an intracellular membrane protein of the endoplasmic reticulum and nuclear membrane, so unlike an alpha-blocker the drug genuinely has to cross the plasma membrane to reach it. Running the isoenzymes apart is what a dual-inhibition claim rests on.',
          dependsOnStepId: 'dut-w3',
          reagentsAndBuffer:
            'CHO or HEK293 lines transfected with human SRD5A1 or SRD5A2, DMEM with charcoal-stripped fetal bovine serum to remove background androgen, geneticin selection, citrate buffer at pH 5.5 for the type 2 optimum and pH 7.0 for type 1',
        },
        {
          id: 'dut-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Testosterone-to-dihydrotestosterone conversion by mass spectrometry',
          description:
            'Measure conversion of testosterone to dihydrotestosterone by liquid chromatography with tandem mass spectrometry, and characterise the inhibition as time-dependent rather than instantaneous. Dutasteride forms a stable enzyme complex, so an IC50 read at one time point understates it; the kinetics have to be run as a progress curve.',
          dependsOnStepId: 'dut-w4',
          reagentsAndBuffer:
            'Testosterone substrate with deuterated dihydrotestosterone internal standard, NADPH regenerating system, LC-MS/MS with electrospray in positive ion mode, finasteride as comparator inhibitor',
        },
      ],
    },
    keyAudits: [
      {
        id: 'dut-a1',
        category: 'measured',
        title: 'Fewer catheters and fewer operations, in 4,325 randomised men over two years',
        laymanSummary:
          'This is the one drug on these pages with a randomised result on something other than a questionnaire. Over two years it cut the risk of being unable to pass urine at all by 57%, and the risk of needing prostate surgery by 48%.',
        technicalDetails:
          'The pooled ARIA3001, ARIA3002 and ARIA3003 trials randomised 4,325 men with moderate-to-severe symptoms to dutasteride 0.5 mg or placebo for 24 months, with 2,951 completing. At 24 months serum dihydrotestosterone fell 90.2% (median -93.7%, p<0.001), total prostate volume fell 25.7% (p<0.001) and transition zone volume 20.4% (p<0.001). Symptom score improved 4.5 points, or 21.4% (p<0.001), and maximum flow rate rose 2.2 mL/sec (p<0.001). Risk of acute urinary retention fell 57% and risk of BPH-related surgical intervention fell 48% against placebo.',
        evidenceSource:
          'Roehrborn CG et al., ARIA3001/ARIA3002/ARIA3003 Study Investigators, Urology 2002;60:434-441 (PMID 12350480)',
        doi: '10.1016/s0090-4295(02)01905-2',
        measuredMetric:
          'Relative risk of acute urinary retention and of BPH-related surgery at 24 months, plus prostate volume and dihydrotestosterone change',
        auditFlag: 'verified',
      },
      {
        id: 'dut-a2',
        category: 'conclusion_shift',
        title: 'REDUCE hit its endpoint and produced a warning rather than an indication',
        laymanSummary:
          'An 8,231-man, four-year trial was built to show this drug prevents prostate cancer. Fewer cancers were found on biopsy, exactly as designed. But the aggressive ones went the wrong way, and the label now carries that finding as a warning instead of a prevention claim.',
        technicalDetails:
          'REDUCE (NCT00056407) randomised men aged 50 to 75 with a PSA of 2.5 to 10.0 ng/mL and one prior negative biopsy to dutasteride 0.5 mg or placebo for four years; 6,729 underwent biopsy or prostate surgery. Cancer was detected in 659 of 3,305 on dutasteride against 858 of 3,424 on placebo, a relative risk reduction of 22.8% (95% CI 15.2 to 29.8, p<0.001). Gleason 7-10 tumours were 220 against 233 (p=0.81). In years three and four, Gleason 8-10 tumours numbered 12 on dutasteride against 1 on placebo (p=0.003). The current US label states the incidence of Gleason 8-10 prostate cancer as 1.0% on dutasteride against 0.5% on placebo, and notes the same pattern for finasteride in a seven-year trial, 1.8% against 1.1%. There is no prostate-cancer-prevention indication for either drug.',
        evidenceSource:
          'Andriole GL et al., N Engl J Med 2010;362:1192-1202 (PMID 20357281); US prescribing information for dutasteride, Warnings and Precautions 5.2',
        doi: '10.1056/NEJMoa0908127',
        measuredMetric:
          'Biopsy-detected prostate cancer over four years, and Gleason 8-10 incidence by treatment arm',
        inferredClaim:
          'That a 22.8% reduction in biopsy-detected cancer means fewer men die of prostate cancer — REDUCE measured detection, not mortality, and reported no survival endpoint',
        auditFlag: 'contested',
      },
      {
        id: 'dut-a3',
        category: 'inferred',
        title: 'The endpoint was cancer found on a biopsy, not cancer that harms anyone',
        laymanSummary:
          'The prevention trial counted tumours found by scheduled biopsies. It did not count deaths, and it did not follow men long enough to know whether the cancers it prevented were ones that would ever have caused trouble.',
        technicalDetails:
          'The registered primary outcome of NCT00056407 is the incidence of biopsy-detectable prostate cancer at years two and four, reported three ways as crude rate, modified crude rate and restricted crude rate. Prostate-cancer mortality is not among the primary outcomes and the four-year report carries no survival result. A large fraction of biopsy-detected, low-Gleason prostate cancer is never destined to become clinically significant, which is why the field moved towards active surveillance over the same decade. So the 22.8% figure describes how many cancers a scheduled biopsy programme found, in a drug arm where the gland being biopsied was roughly a quarter smaller.',
        evidenceSource:
          'ClinicalTrials.gov NCT00056407 primary outcome measures; Andriole GL et al., N Engl J Med 2010;362:1192-1202',
        doi: '10.1056/NEJMoa0908127',
        inferredClaim:
          'That preventing a biopsy-detectable cancer is the same as preventing a harmful one, in a trial with no mortality endpoint and a systematic difference in the size of the organ being sampled',
        auditFlag: 'caution',
      },
      {
        id: 'dut-a4',
        category: 'failed',
        title: 'A cardiac failure imbalance appeared in both large trials and was never explained',
        laymanSummary:
          'Two separate multi-thousand-man trials of this drug reported more heart failure in the treated arms than expected. Neither trial was designed to test that, and no mechanism has been established.',
        technicalDetails:
          'In REDUCE, the composite term of cardiac failure occurred in 0.7% on dutasteride against 0.4% on placebo (p=0.03) across 8,231 randomised men. The four-year CombAT report separately notes an imbalance in the composite term of cardiac failure across its three arms, in a further 4,844 men. Neither trial had cardiac failure as an endpoint, neither adjudicated it, and the term is a composite rather than a single diagnosis. That combination — an unplanned finding, unadjudicated, in a composite, appearing twice — is exactly the shape of finding that is neither dismissible nor conclusive.',
        evidenceSource:
          'Andriole GL et al., N Engl J Med 2010;362:1192-1202; Roehrborn CG et al., Eur Urol 2010;57:123-131',
        doi: '10.1056/NEJMoa0908127',
        measuredMetric: 'Incidence of the composite adverse-event term cardiac failure, by arm',
        auditFlag: 'caution',
      },
      {
        id: 'dut-a5',
        category: 'inferred',
        title: 'Dual isoenzyme inhibition was the reason for the drug and did not beat finasteride',
        laymanSummary:
          'Dutasteride blocks both versions of the enzyme where finasteride mainly blocks one. The trial run to show that this matters clinically found no difference.',
        technicalDetails:
          'EPICS randomised 1,630 men aged 50 and over with symptomatic BPH — 813 to dutasteride and 817 to finasteride — for a 48-week blinded phase with an optional 24-month open-label extension. Both drugs reduced prostate volume with no significant difference between them, and improvements in the AUA Symptom Index and maximum urinary flow rate were similar. A similar percentage of adverse events occurred in both groups. The greater biochemical suppression of dihydrotestosterone that dual inhibition produces is real and measurable; the clinical superiority that was inferred from it was not found.',
        evidenceSource: 'Nickel JC et al., BJU Int 2011;108:388-394 (PMID 21631695)',
        doi: '10.1111/j.1464-410X.2011.10195.x',
        inferredClaim:
          'That inhibiting both 5-alpha-reductase isoenzymes rather than one produces a better clinical result — a mechanistic argument the head-to-head trial did not confirm',
        auditFlag: 'verified',
      },
      {
        id: 'dut-a6',
        category: 'measured',
        title: 'It halves PSA, which is the test used to look for the cancer it warns about',
        laymanSummary:
          'This drug cuts the PSA blood test result roughly in half. That is the same test used to decide whether a man needs investigating for prostate cancer, and the drug carries a high-grade cancer warning.',
        technicalDetails:
          'The US label states that dutasteride reduces serum PSA concentration by approximately 50%, and that any confirmed increase from the nadir while on treatment may signal prostate cancer and should be evaluated even if PSA values are still within the normal range for men not taking a 5-alpha-reductase inhibitor. The interaction is not subtle: the drug suppresses the marker by a factor of two and simultaneously carries a Warnings and Precautions entry for increased Gleason 8-10 incidence. Both facts are on the same label, several pages apart.',
        evidenceSource:
          'US prescribing information for dutasteride, Warnings and Precautions and Clinical Pharmacology sections (openFDA drug label endpoint)',
        measuredMetric: 'Percentage reduction in serum prostate-specific antigen on treatment',
        auditFlag: 'caution',
      },
      {
        id: 'dut-a7',
        category: 'measured',
        title: 'Stopping the drug does not stop the exposure for four to six months',
        laymanSummary:
          'The terminal half-life is about five weeks, so the drug is still measurable in blood four to six months after the last capsule. Blood donation is deferred for six months for that reason.',
        technicalDetails:
          'The label gives a terminal elimination half-life of approximately five weeks at steady state, with serum concentrations remaining detectable above 0.1 ng/mL for four to six months after discontinuation. Men treated with dutasteride are instructed not to donate blood until at least six months after the last dose, so that a pregnant transfusion recipient is not exposed; 5-alpha-reductase inhibitors can interfere with development of the external genitalia of a male fetus. This pharmacokinetic tail also means that adverse effects attributed to the drug cannot be resolved by a short washout, and that any trial of discontinuation has to allow months rather than weeks.',
        evidenceSource:
          'US prescribing information for dutasteride, Clinical Pharmacology and Warnings and Precautions sections (openFDA drug label endpoint)',
        measuredMetric:
          'Terminal elimination half-life and duration of detectable serum concentration after discontinuation',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Taken as a capsule, and it accumulates for months',
        laymanDesc:
          'This is not a drug that reaches its working level in a day. Because the body clears it so slowly, the amount in the blood keeps rising for months before it settles.',
        molecularDetail:
          'Oral soft gelatin capsule, absorbed with a terminal elimination half-life of approximately five weeks at steady state. Extensively protein-bound, metabolised by CYP3A4. Serum concentrations remain detectable above 0.1 ng/mL for four to six months after the last dose, which is the pharmacokinetic basis for the six-month blood donation deferral.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It crosses into the cell, because that is where the enzyme is',
        laymanDesc:
          'Unlike a drug that works on the outside of a cell, this one has to get inside. The enzyme it blocks sits on internal membranes within prostate cells.',
        molecularDetail:
          'Dutasteride is a lipophilic 4-azasteroid and crosses the plasma membrane by passive diffusion. 5-alpha-reductase is an integral membrane protein of the endoplasmic reticulum and nuclear membrane, with the type 2 isoenzyme predominating in prostate and the type 1 isoenzyme also present in skin and liver.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It locks onto both versions of the enzyme and does not let go',
        laymanDesc:
          'The drug binds the enzyme in a way that is very hard to reverse, and it does this to both forms of the enzyme rather than just one. That grip is why the effect lasts so long.',
        molecularDetail:
          'The label describes a competitive and specific inhibition of both type 1 and type 2 5-alpha-reductase, forming a stable enzyme complex. Finasteride is largely type 2 selective. The dissociation of that complex is slow enough that the pharmacodynamic effect outlasts plasma clearance.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Testosterone stops being converted, and dihydrotestosterone collapses',
        laymanDesc:
          'The step that turns testosterone into the stronger prostate hormone stops happening. Levels of that stronger hormone in the blood fall by around ninety per cent.',
        molecularDetail:
          'Serum dihydrotestosterone fell 90.2% at 24 months in the pooled ARIA trials, median -93.7% (p<0.001). Testosterone is not removed and typically rises modestly. Intraprostatic dihydrotestosterone falls further than serum, since both isoenzymes are inhibited within the gland itself.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Androgen-dependent tissue involutes, and the outcomes follow',
        laymanDesc:
          'Deprived of its growth signal, part of the gland shrinks over months. That translated into fewer men unable to pass urine and fewer operations.',
        molecularDetail:
          'Total prostate volume fell 25.7% and transition zone volume 20.4% at 24 months. Symptom score improved 4.5 points and maximum flow rate 2.2 mL/sec. Acute urinary retention risk fell 57% and BPH-related surgery 48% against placebo. Serum PSA falls by approximately 50%, which is a consequence of the same epithelial involution and complicates cancer surveillance.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'ARIA3001 / ARIA3002 / ARIA3003 pooled registration programme',
        phase: 'Phase 3 randomised double-blind placebo-controlled, 24 months',
        sampleSize: 4325,
        primaryEndpoint:
          'Change in BPH symptom score, with acute urinary retention and BPH-related surgery as prespecified outcomes',
        endpointMet: true,
        statisticalPValue:
          'P < 0.001 for symptom score, prostate volume, dihydrotestosterone and maximum flow rate; 57% relative risk reduction for acute urinary retention and 48% for surgery',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'REDUCE (NCT00056407)',
        phase: 'Phase 3 randomised double-blind placebo-controlled, 4 years',
        sampleSize: 8231,
        primaryEndpoint: 'Incidence of biopsy-detectable prostate cancer at years 2 and 4',
        endpointMet: true,
        statisticalPValue:
          'P < 0.001 for a 22.8% relative risk reduction (95% CI 15.2 to 29.8) in biopsy-detected prostate cancer',
        unreportedAdverseSignals:
          'Gleason 8-10 tumours in years 3 and 4: 12 on dutasteride against 1 on placebo (p=0.003). Cardiac failure composite 0.7% against 0.4% (p=0.03). No prostate-cancer-prevention indication was granted and the high-grade finding is on the label as a warning.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'CombAT (NCT00090103)',
        phase: 'Phase 3 randomised double-blind, 4 years',
        sampleSize: 4844,
        primaryEndpoint:
          'Relative risk of acute urinary retention or BPH-related surgery with combination therapy versus each monotherapy',
        endpointMet: true,
        statisticalPValue:
          'Combination was significantly superior to tamsulosin monotherapy but not to dutasteride monotherapy for acute urinary retention or BPH-related surgery',
        unreportedAdverseSignals:
          'The published report notes an imbalance in the composite term of cardiac failure across the three arms, the second such observation in a large dutasteride trial.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'EPICS (Enlarged Prostate International Comparator Study)',
        phase: 'Randomised double-blind active comparator, 48 weeks plus open-label extension',
        sampleSize: 1630,
        primaryEndpoint: 'Change in total prostate volume, dutasteride versus finasteride',
        endpointMet: false,
        statisticalPValue:
          'No significant difference between dutasteride and finasteride in prostate volume reduction, AUA Symptom Index or maximum urinary flow rate',
        unreportedAdverseSignals:
          '`endpointMet: false` here records that the superiority hypothesis behind dual isoenzyme inhibition was not confirmed, not that the drug failed to shrink the prostate.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Serum dihydrotestosterone fell 90.2% and total prostate volume 25.7% at 24 months in 4,325 randomised men',
        'Acute urinary retention risk fell 57% and BPH-related surgery risk fell 48% against placebo over 24 months',
        '22.8% relative reduction in biopsy-detected prostate cancer over four years in 6,729 biopsied men (95% CI 15.2 to 29.8)',
        'Gleason 8-10 tumours in years 3 and 4 of REDUCE: 12 on dutasteride against 1 on placebo (p=0.003); label incidence 1.0% against 0.5%',
        'Serum PSA reduced by approximately 50%, per the US label',
        'Terminal elimination half-life of approximately five weeks, with drug detectable four to six months after the last dose',
      ],
      unsupportedInferences: [
        'That preventing biopsy-detected cancer prevents prostate cancer death — REDUCE had no mortality endpoint and reported no survival result',
        'That inhibiting both 5-alpha-reductase isoenzymes beats inhibiting one — EPICS randomised 1,630 men against finasteride and found no difference',
        'That the 22.8% detection reduction is unaffected by biopsying a gland a quarter smaller than the comparator gland',
        'That the twice-observed cardiac failure imbalance is either a real drug effect or safely dismissible; it is an unadjudicated composite in trials not designed to measure it',
      ],
      whatFailedInitially: [
        'The prostate-cancer-prevention indication. The trial met its registered endpoint and the label carries a high-grade cancer warning instead of a prevention claim.',
        'The superiority case for dual isoenzyme inhibition, which was the commercial rationale for developing a second 5-alpha-reductase inhibitor',
        'Any attempt to use PSA normally in men on this drug, since the drug halves the marker it would be read against',
      ],
      realWorldOutcome: [
        'Sixteen cents a capsule at United States pharmacy acquisition cost, with seven generic products listed',
        'Combined with tamsulosin in a single fixed-dose product, on the strength of the four-year CombAT result',
        'Widely used off-label for male pattern hair loss, an indication with none of the outcome data on this page',
      ],
    },
    deliverySystem: {
      type: 'Oral soft gelatin capsule, taken once daily',
      description:
        'Swallowed whole. The capsules are not to be opened, chewed or handled by women who are or may be pregnant, because the contents can be absorbed through skin and 5-alpha-reductase inhibitors interfere with development of the external genitalia of a male fetus.',
      safetyProfile:
        'The commonest adverse reactions are impotence, decreased libido, breast disorders including enlargement and tenderness, and ejaculation disorders. Warnings and Precautions cover increased incidence of Gleason 8-10 prostate cancer, the effect on PSA and prostate cancer detection, exposure of women and blood donation deferral for six months after the last dose. Serum PSA falls by approximately 50%, and any confirmed rise from the on-treatment nadir warrants evaluation even within the ordinary reference range.',
    },
    commonQuestions: [
      {
        q: 'Does this drug prevent prostate cancer?',
        a: 'It has no prevention indication, and the trial that tested the question is the reason the label carries a warning. REDUCE randomised men with a raised PSA and one prior negative biopsy to dutasteride or placebo for four years. Fewer cancers were found on biopsy in the treated group, a 22.8% relative reduction. But in years three and four there were twelve Gleason 8-10 tumours in the dutasteride group against one on placebo. The label now records the overall Gleason 8-10 incidence as 1.0% against 0.5%, and notes the same pattern for finasteride in its own seven-year trial. The trial also had no mortality endpoint, so even the reduction it did find describes cancers found rather than lives changed.',
        auditNote:
          'This is the clearest conclusion shift on the page: a trial that met its registered primary endpoint and produced a warning rather than an indication.',
      },
      {
        q: 'Is it better than finasteride?',
        a: 'On the biochemistry, yes. On the trial that compared them, no. Dutasteride blocks both isoenzymes of 5-alpha-reductase and suppresses dihydrotestosterone further than finasteride does. EPICS then randomised 1,630 men to one or the other for 48 blinded weeks and found no significant difference in prostate volume reduction, and similar improvements in symptom index and peak flow, with a similar rate of adverse events. Dual inhibition is a real pharmacological difference that did not become a measurable clinical one. Finasteride costs less than half as much at pharmacy acquisition cost.',
      },
      {
        q: 'How long does it take to work, and how long does it take to wear off?',
        a: 'Months in both directions. This drug shrinks a gland rather than relaxing muscle, so there is nothing to feel in the first days. In the registration programme the prostate volume and symptom score measurements that matter are reported at 24 months. Coming off is equally slow: the terminal half-life is around five weeks, and the label states that serum concentrations stay detectable for four to six months after the last capsule. That is why blood donation is deferred for six months, and why a short break is not a way to test whether a side effect is being caused by the drug.',
      },
      {
        q: 'Why did my PSA drop so much?',
        a: 'Because the drug does that, not because anything changed in your prostate cancer risk. The US label states that dutasteride reduces serum PSA by approximately 50%. The practical consequence is that a PSA result measured while on this drug cannot be read against a normal range built from men who are not taking it. The label also states that any confirmed increase from the lowest on-treatment value should be evaluated, even if the value is still inside the ordinary reference range. A halved marker and a high-grade cancer warning appear on the same label.',
        auditNote:
          'A drug that suppresses the surveillance test by half, and separately warns about the disease that test looks for, is a combination worth stating explicitly rather than leaving on two different pages of the insert.',
      },
      {
        q: 'Why does this page not show a manufacturing cost?',
        a: 'Because no per-dose cost-of-production figure for dutasteride could be verified and cited. The cost-of-production literature checked here publishes an estimation method and aggregate ranges rather than a per-dose figure for this molecule. What is shown instead is what pharmacies actually pay — about sixteen cents a capsule from the CMS acquisition-cost survey — which is a price, not a cost of manufacture. The synthesis is genuinely harder than tamsulosin: it needs a stereochemically defined 4-azasteroid core and an amide coupling to a doubly deactivated aniline.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Roehrborn CG, Boyle P, Nickel JC, Hoefner K, Andriole G; ARIA3001 ARIA3002 and ARIA3003 Study Investigators. Efficacy and safety of a dual inhibitor of 5-alpha-reductase types 1 and 2 (dutasteride) in men with benign prostatic hyperplasia. Urology 2002;60:434-441',
        identifier: '10.1016/s0090-4295(02)01905-2',
        kind: 'doi',
      },
      {
        label:
          'Andriole GL et al. Effect of dutasteride on the risk of prostate cancer. N Engl J Med 2010;362:1192-1202',
        identifier: '10.1056/NEJMoa0908127',
        kind: 'doi',
      },
      {
        label:
          'REDUCE — Reduction by Dutasteride of Prostate Cancer Events, 4-year randomised placebo-controlled trial',
        identifier: 'NCT00056407',
        kind: 'nct',
      },
      {
        label:
          'Roehrborn CG et al., CombAT Study Group. 4-year results from the CombAT study. Eur Urol 2010;57:123-131',
        identifier: '10.1016/j.eururo.2009.09.035',
        kind: 'doi',
      },
      {
        label: 'CombAT — Combination of Avodart and Tamsulosin, 4-year randomised trial',
        identifier: 'NCT00090103',
        kind: 'nct',
      },
      {
        label:
          'Nickel JC, Gilling P, Tammela TL, Morrill B, Wilson TH, Rittmaster RS. Comparison of dutasteride and finasteride for treating benign prostatic hyperplasia: the Enlarged Prostate International Comparator Study (EPICS). BJU Int 2011;108:388-394',
        identifier: '10.1111/j.1464-410X.2011.10195.x',
        kind: 'doi',
      },
      {
        label:
          'Barry MJ et al., CAMUS Study Group. Effect of increasing doses of saw palmetto extract on lower urinary tract symptoms: a randomized trial. JAMA 2011;306:1344-1351',
        identifier: '10.1001/jama.2011.1364',
        kind: 'doi',
      },
      {
        label:
          'US prescribing information for dutasteride capsules — mechanism of action, clinical pharmacology, warnings and precautions (openFDA drug label endpoint)',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22dutasteride%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 6918296 — dutasteride structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/6918296',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
]
