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

  // ---------------------------------------------------------------------------------------------
  // 3. Solifenacin — the best-selling antimuscarinic, whose own placebo-controlled trials show a
  //    margin of well under one episode a day, whose side effects are the same receptor in the
  //    wrong organ, and which most people have stopped taking within a year.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'solifenacin',
    name: 'Solifenacin',
    tradeName: 'Vesicare',
    sponsor: 'Astellas',
    targetGene: 'CHRM3',
    targetProtein:
      'M3 muscarinic acetylcholine receptor on detrusor smooth muscle, with binding at M1 and M2 as well; the same M3 receptor serves the salivary glands, gut smooth muscle and the ciliary muscle of the eye',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2004,
    indication:
      'Treatment of adults with overactive bladder with symptoms of urge urinary incontinence, urgency and urinary frequency. A separate paediatric oral suspension is licensed for neurogenic detrusor overactivity.',
    patientFriendlyIndication:
      'A bladder that squeezes without asking — sudden urgency, going far too often, and leaking before you get there',
    anatomicalSite:
      'Detrusor smooth muscle of the bladder wall, and the urothelium and suburothelial afferent nerves beneath it',
    conditionContext: {
      conditionExplainer:
        'Overactive bladder is a symptom description, not a lesion. There is no scan and no blood test for it. It is defined by what a person reports — urgency, frequency, sometimes leaking — and it is measured with a three-day diary in which the patient counts their own trips to the toilet and their own accidents.',
      whyItMatters:
        'That measurement method decides how the evidence must be read. A diary is a patient-reported instrument with a large placebo response: in the placebo arm of the 3,527-patient SYNERGY trial, incontinence episodes fell by 1.34 a day with no active drug at all. Any drug effect has to be counted on top of that, not instead of it.',
      whoTakesThis:
        'Mostly women, mostly over 50, and disproportionately people already taking several other medicines with anticholinergic activity. It is the best-selling drug of its class worldwide.',
      clinicalGoals:
        'Fewer incontinence episodes and fewer voids per 24 hours on the diary. Not continence, which the trials do not deliver for most patients, and not cure.',
    },
    oneSentenceVerdict:
      'A competitive M3 muscarinic antagonist that blocks the acetylcholine signal telling the bladder wall to contract: in its 12-week pivotal trial it removed 2.37 voids a day at 5 mg against 1.59 on placebo, and in the placebo-controlled SYNERGY trial 1.79 incontinence episodes a day against placebo 1.34 — margins of roughly three-quarters of a void and less than half an episode a day, bought at a dry-mouth rate of 10.9% at 5 mg and 27.6% at 10 mg against 4.2% on placebo.',
    laymanHowItWorks:
      'The bladder wall is a muscle that contracts when a nerve chemical, acetylcholine, lands on receptors embedded in it. In an overactive bladder that contraction arrives early and unbidden while the bladder is still filling, and that is what urgency feels like. Solifenacin occupies those receptors so the chemical cannot land, and the wall stays quieter for longer. The same receptor runs the salivary glands, the gut and the focusing muscle of the eye, which is why dry mouth, constipation and blurred vision are not incidental side effects — they are the identical drug action in the wrong organ.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 61,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1754 per tablet at United States pharmacy acquisition cost (CMS NADAC, generic, median across 40 listed products, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States in 2004 and now off patent, with forty generic products listed in the acquisition-cost file. The branded paediatric oral suspension is a separate, later listing and is not covered by that median.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The alternatives divide by where they act. Mirabegron works through a different receptor entirely and, in a head-to-head trial in patients dissatisfied with antimuscarinics, was statistically indistinguishable from solifenacin. Trospium is a charged molecule that crosses into the brain far less readily, which matters given the class-wide dementia association. And in the one trial that pitted a drug of this class directly against structured behavioural training, the training won.',
      conventionalRx: [
        {
          name: 'Mirabegron (Myrbetriq)',
          class: 'Beta-3 adrenergic agonist',
          howItCompares:
            'Relaxes the detrusor during filling through a different receptor, so it does not dry the mouth. BEYOND (NCT01638000) randomised 1,887 patients who were already dissatisfied with an antimuscarinic to mirabegron 50 mg or solifenacin 5 mg; voids per 24 hours fell 2.95 on mirabegron and 3.13 on solifenacin, adjusted difference -0.18 (95% CI -0.42 to 0.06), p=0.15. Non-inferiority was met; superiority was not shown in either direction.',
          typicalCost:
            'US$9.60 per tablet at United States pharmacy acquisition cost (CMS NADAC, generic, median across 17 listed products, effective 19 August 2026)',
          prosAndCons:
            'Pros: no anticholinergic burden, and real-world one-year persistence of 32% to 38% against 12% to 25% for antimuscarinics. Cons: a blood-pressure warning on the label, and about fifty-five times the acquisition cost of solifenacin.',
        },
        {
          name: 'Trospium chloride (Sanctura)',
          class: 'Quaternary ammonium muscarinic antagonist',
          howItCompares:
            'Does the same receptor job, but carries a permanent positive charge, so it crosses the blood-brain barrier poorly. That is a pharmacological argument, not an outcome: no randomised trial has compared dementia incidence between trospium and the tertiary-amine antimuscarinics.',
          typicalCost:
            'US$0.2121 per tablet at United States pharmacy acquisition cost (CMS NADAC, generic, median across 16 listed products, effective 19 August 2026)',
          prosAndCons:
            'Pros: minimal central nervous system penetration by design, and almost the same acquisition cost. Cons: absorption is cut substantially by food, and the immediate-release form is not once daily.',
        },
        {
          name: 'Tolterodine extended release (Detrol LA)',
          class: 'Non-selective muscarinic antagonist',
          howItCompares:
            'The STAR trial compared flexibly dosed solifenacin against tolterodine ER 4 mg in a double-dummy design and found solifenacin superior on most efficacy variables. The 4-week subanalysis is more specific: incontinence episodes fell 1.30 a day on solifenacin 5 mg against 0.90 on tolterodine ER 4 mg, p=0.0181 — a difference of 0.4 episodes a day between two active drugs.',
          typicalCost:
            'US$0.2533 per unit at United States pharmacy acquisition cost (CMS NADAC, generic, median across 54 listed products, effective 19 August 2026)',
          prosAndCons:
            'Pros: long track record and cheap. Cons: the STAR comparison went against it, and both arms sit inside the same anticholinergic class signal.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Structured behavioural training with a bladder diary',
          action:
            'Pelvic floor muscle exercises with biofeedback plus urge-suppression strategies, taught over several sessions rather than handed out as a leaflet.',
          patientImpact:
            'In a randomised trial of 197 community-dwelling women aged 55 and over, behavioural training reduced incontinence episodes by a mean of 80.7%, the drug arm by 68.5% (P=.04 for the comparison) and placebo by 39.4%. Only 14.0% of the behavioural group wanted to switch to something else, against 75.5% in each of the other two groups.',
          clinicalPrecaution:
            'The drug in that trial was oxybutynin, not solifenacin, and no equivalent head-to-head against a modern antimuscarinic has been run. It is evidence that the behavioural arm is not a placebo, not evidence that solifenacin specifically is inferior to it.',
        },
        {
          name: 'Tell any clinician who prescribes for you what else you already take',
          action:
            'Anticholinergic burden accumulates across drug classes — antidepressants, antipsychotics, antiparkinson and antiepileptic drugs all contribute alongside bladder antimuscarinics.',
          patientImpact:
            'In a nested case-control study of 58,769 dementia cases and 225,574 controls, the adjusted odds ratio for dementia rose from 1.06 (95% CI 1.03 to 1.09) at the lowest total anticholinergic exposure to 1.49 (1.44 to 1.54) at the highest. Bladder antimuscarinics carried an adjusted odds ratio of 1.65 (1.56 to 1.75) as a class.',
          clinicalPrecaution:
            'This is observational and cannot establish causation; reverse causation and confounding by indication are both live explanations, and no randomised trial in this class has ever been powered for a dementia endpoint.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1CN2CCC1[C@H](C2)OC(=O)N3CCC4=CC=CC=C4[C@@H]3C5=CC=CC=C5',
      chemicalFormula: 'C23H26N2O2',
      molecularWeight: '362.50 g/mol (free base); dispensed as solifenacin succinate',
      targetReceptorAffinity:
        'Competitive antagonism at muscarinic receptors, with relative preference for M3 over M2. The US label states the mechanism in one sentence and offers no binding constants, so no Ki is quoted here. Two stereocentres are fixed in the molecule and both appear in the structure, which is why enantiomeric purity is the first quality-control question rather than the last.',
      structureSource: {
        label: 'PubChem CID 154059 — solifenacin structure, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/154059',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'sol-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Stereochemical purity of both chiral fragments before coupling',
          description:
            'Establish enantiomeric excess of the quinuclidin-3-ol and of the 1-phenyl-1,2,3,4-tetrahydroisoquinoline separately, before the carbamate bond joins them. The molecule carries two stereocentres, so four stereoisomers are possible and three of them are impurities. Measuring each fragment on its own is the only way to attribute a failure to a step.',
          reagentsAndBuffer:
            'Chiral stationary-phase HPLC on amylose or cellulose carbamate columns, n-hexane with 2-propanol and diethylamine, UV detection at 210 and 254 nm, individual enantiomer reference standards',
        },
        {
          id: 'sol-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Carbamate coupling of the two fragments',
          description:
            'Activate the tetrahydroisoquinoline nitrogen and couple it to the quinuclidinol oxygen, forming the carbamate ester that is the whole molecule. Neither stereocentre is created here, which is the reason for setting both beforehand.',
          dependsOnStepId: 'sol-w1',
          reagentsAndBuffer:
            'Carbonyl source such as a chloroformate or carbonyldiimidazole, sodium hydride or an amine base, anhydrous tetrahydrofuran or toluene, nitrogen atmosphere',
        },
        {
          id: 'sol-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Succinate salt formation and recrystallisation',
          description:
            'Form the succinate salt from the free base and recrystallise, then re-run the chiral assay on the finished salt rather than only on the intermediates. The specification is written around residual diastereomer and unreacted quinuclidinol.',
          dependsOnStepId: 'sol-w2',
          reagentsAndBuffer:
            'Succinic acid, ethanol or 2-propanol with water, activated charcoal, reversed-phase HPLC for related substances, chiral HPLC for stereoisomeric purity, Karl Fischer titration for water content',
        },
        {
          id: 'sol-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Application to cell lines expressing each human muscarinic subtype separately',
          description:
            'Apply the compound to five stable lines, each carrying one human muscarinic receptor — M1 through M5. The receptor sits in the plasma membrane facing outward, so no cell entry is required and no transporter step exists. Running all five side by side is the only way an M3-selectivity claim carries meaning, and it is the assay that predicts the dry mouth as well as the bladder effect.',
          dependsOnStepId: 'sol-w3',
          reagentsAndBuffer:
            'CHO or HEK293 lines stably expressing human CHRM1 to CHRM5, DMEM or Ham F-12 with 10% fetal bovine serum, geneticin selection, HEPES-buffered assay saline at pH 7.4',
        },
        {
          id: 'sol-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Radioligand competition and functional calcium readout across all five subtypes',
          description:
            'Measure displacement of a labelled non-selective muscarinic antagonist at each subtype to obtain affinity, then measure blockade of carbachol-evoked intracellular calcium at the Gq-coupled subtypes to confirm functional antagonism. Affinity ratios and functional ratios do not always agree, and it is the functional one that predicts tissue behaviour.',
          dependsOnStepId: 'sol-w4',
          reagentsAndBuffer:
            'Tritiated N-methylscopolamine as radioligand, atropine for non-specific binding, GF/B filter plates, Fluo-4 AM calcium indicator, carbachol as agonist, probenecid-containing assay buffer',
        },
      ],
    },
    keyAudits: [
      {
        id: 'sol-a1',
        category: 'measured',
        title: 'The pivotal trial margin is about three-quarters of a void a day over placebo',
        laymanSummary:
          'In the trial that got the drug licensed, people on placebo cut 1.59 trips to the toilet a day. People on the 5 mg dose cut 2.37. The difference between them is the drug effect, and it is under one trip a day.',
        technicalDetails:
          'Cardozo and colleagues ran a multicentre, multinational, randomised, double-blind, placebo-controlled phase 3 trial with 12 weeks of once-daily treatment. The primary variable was change from baseline in mean micturitions per 24 hours. Placebo fell 1.59, solifenacin 5 mg fell 2.37 (p=0.0018) and solifenacin 10 mg fell 2.81 (p=0.0001). Urgency episodes fell 2.84 on 5 mg (a 51% reduction, p=0.003) and 2.90 on 10 mg (52%, p=0.002), and half of patients incontinent at baseline achieved continence. Nocturia reached significance only at 10 mg, falling 0.71 episodes against 0.52 on placebo, p=0.036. The p-values are solid and the absolute differences are small; both statements are true at once and the second is the one a reader is rarely shown.',
        evidenceSource: 'Cardozo L et al., J Urol 2004;172(5 Pt 1):1919-1924 (PMID 15540755)',
        doi: '10.1097/01.ju.0000140729.07840.16',
        measuredMetric:
          'Change from baseline in mean micturitions per 24 hours at 12 weeks, against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'sol-a2',
        category: 'measured',
        title: 'The dry mouth is the same receptor, in the salivary gland, and it doubles with dose',
        laymanSummary:
          'Dry mouth is not an unlucky side reaction. It is the drug doing exactly what it was designed to do, in the gland that makes saliva. At the higher dose more than one patient in four reports it.',
        technicalDetails:
          'The US label reports dry mouth in 4.2% on placebo, 10.9% on 5 mg and 27.6% on 10 mg; constipation in 2.9%, 5.4% and 13.4%; blurred vision in 1.8%, 3.8% and 4.8%. The pivotal publication reports the same gradient at 2.3%, 7.7% and 23%. The M3 receptor blocked in the detrusor is the M3 receptor in the salivary acinar cell and in the ciliary muscle, so the therapeutic effect and the adverse effects rise together and cannot be separated by dosing. This is the clearest on-target-wrong-organ example in the class, and it is why the efficacy gain from doubling the dose has to be weighed against a roughly two-and-a-half-fold rise in dry mouth.',
        evidenceSource:
          'US prescribing information for solifenacin succinate tablets, Adverse Reactions section; Cardozo L et al., J Urol 2004;172:1919-1924',
        measuredMetric:
          'Incidence of dry mouth, constipation and blurred vision by dose in the pooled registration trials',
        auditFlag: 'verified',
      },
      {
        id: 'sol-a3',
        category: 'measured',
        title: 'Against placebo in a modern trial, under half an incontinence episode a day',
        laymanSummary:
          'SYNERGY is one of the few recent trials of this drug with a real placebo arm. Placebo took away 1.34 leaks a day on its own. Solifenacin took away 1.79. The drug is responsible for the difference: 0.45 leaks a day.',
        technicalDetails:
          'SYNERGY (NCT01972841) randomised 3,527 patients to placebo, mirabegron 25 mg or 50 mg, solifenacin 5 mg, or solifenacin plus mirabegron at either dose. Change from baseline to end of treatment in mean incontinence episodes per 24 hours was -1.34 on placebo, -1.70 and -1.76 on mirabegron 25 and 50 mg, and -1.79 on solifenacin 5 mg. Micturitions per 24 hours fell 1.64 on placebo and 2.20 on solifenacin. The combination arms reached -2.04 and -1.98 for incontinence, significantly better than the corresponding mirabegron monotherapy (p=0.001 and p<0.001). Read from the placebo arm rather than from baseline, every active arm in this trial sits within half an episode a day of every other.',
        evidenceSource: 'ClinicalTrials.gov results record, SYNERGY, NCT01972841',
        measuredMetric:
          'Change from baseline in mean incontinence episodes and micturitions per 24 hours, all arms including placebo',
        auditFlag: 'verified',
      },
      {
        id: 'sol-a4',
        category: 'inferred',
        title: 'BESIDE beat solifenacin 5 mg and did not separate from solifenacin 10 mg',
        laymanSummary:
          'The trial used to argue for adding a second drug on top of solifenacin compared the combination with the low dose. Against the high dose of solifenacin alone, the gap nearly disappears.',
        technicalDetails:
          'BESIDE (NCT01908829) randomised 2,174 incontinent patients already on solifenacin 5 mg for four weeks to combination with mirabegron, to solifenacin 5 mg, or to solifenacin 10 mg. Incontinence episodes per 24 hours fell 1.80 on combination, 1.53 on solifenacin 5 mg and 1.67 on solifenacin 10 mg. The registered primary comparison was combination against solifenacin 5 mg: difference -0.26 episodes (95% CI -0.47 to -0.05), p=0.001. The comparison a prescriber actually faces — add a second drug, or raise the dose of the one already prescribed — is 1.80 against 1.67, a gap of 0.13 episodes a day that the trial was not designed to test as its primary endpoint.',
        evidenceSource: 'ClinicalTrials.gov results record, BESIDE, NCT01908829',
        measuredMetric:
          'Change from baseline in mean incontinence episodes per 24 hours, combination versus each solifenacin dose',
        inferredClaim:
          'That combination therapy is the next step after solifenacin 5 mg fails — an inference resting on a comparison against the dose the patient has already outgrown, rather than against the higher dose of the same drug',
        auditFlag: 'caution',
      },
      {
        id: 'sol-a5',
        category: 'failed',
        title: 'Most people have stopped within a year, and a quarter never reach six months',
        laymanSummary:
          'Whatever the trials show at 12 weeks, in ordinary use this class of drug is abandoned. Across thirty real-world studies, between 12% and 25% of patients were still taking an antimuscarinic a year later.',
        technicalDetails:
          'Yeowell and colleagues systematically reviewed thirty observational studies drawing on electronic prescription claims. Overall persistence ranged from 5% to 47%. In the three studies reporting both drug groups, one-year persistence was 12% to 25% for antimuscarinics and 32% to 38% for mirabegron. Median time to discontinuation was under five months for antimuscarinics in all but one study, against 5.6 to 7.4 months for mirabegron. The proportion adherent at one year ranged from 15% to 44%. A 12-week efficacy result describes a population that, in practice, has largely dispersed before the first anniversary of the prescription; the review was funded by the manufacturer of the comparator drug, which is a reason to check the underlying studies rather than a reason to dismiss the direction.',
        evidenceSource: 'Yeowell G et al., BMJ Open 2018;8(11):e021889 (PMID 30467131)',
        doi: '10.1136/bmjopen-2018-021889',
        measuredMetric:
          'One-year persistence and adherence with oral antimuscarinics in electronic prescription claims, across 30 studies',
        auditFlag: 'caution',
      },
      {
        id: 'sol-a6',
        category: 'inferred',
        title: 'The class-wide dementia association is large, consistent, and not from a trial',
        laymanSummary:
          'Two very large British database studies found more dementia in people who had taken bladder antimuscarinics. Neither randomised anyone, and a bladder that is misbehaving can itself be an early sign of the disease being counted as the outcome.',
        technicalDetails:
          'Coupland and colleagues studied 58,769 dementia cases and 225,574 matched controls aged 55 and over, using prescriptions for 56 anticholinergic drugs issued 1 to 11 years before diagnosis. The adjusted odds ratio rose from 1.06 (95% CI 1.03 to 1.09) at the lowest exposure to 1.49 (1.44 to 1.54) at the highest, and bladder antimuscarinics as a class carried an adjusted odds ratio of 1.65 (1.56 to 1.75). The population-attributable fraction for total anticholinergic exposure was 10.3%. Richardson and colleagues, in 40,770 cases and 283,933 controls, found an adjusted odds ratio of 1.11 (1.08 to 1.14) for any drug with a definite anticholinergic score, with the association for urological drugs still present 15 to 20 years before diagnosis. Persistence that far back argues against simple reverse causation and is the strongest part of the case; the absence of any randomised evidence is the weakest.',
        evidenceSource:
          'Coupland CAC et al., JAMA Intern Med 2019;179:1084-1093 (PMID 31233095); Richardson K et al., BMJ 2018;361:k1315 (PMID 29695481)',
        doi: '10.1001/jamainternmed.2019.0677',
        inferredClaim:
          'That bladder antimuscarinics cause dementia — a large and dose-graded association in two national primary-care databases, with no randomised trial in this class ever powered for a cognitive endpoint',
        auditFlag: 'contested',
      },
      {
        id: 'sol-a7',
        category: 'measured',
        title: 'A measured QT effect at three times the maximum dose, and a boxed-adjacent warning',
        laymanSummary:
          'At three times the highest dose anyone is meant to take, solifenacin lengthened an electrical interval in the heart by about 8 milliseconds. That is small. The label still names it, alongside angioedema, as a reason for caution.',
        technicalDetails:
          'The US label reports a dedicated QT study in which the 30 mg dose — three times the maximum recommended 10 mg — produced a mean increase in the Fridericia-corrected QT interval of 8 msec (90% CI 4 to 13), an effect smaller than that of moxifloxacin as positive control at its therapeutic dose. The Warnings and Precautions section carries angioedema and anaphylactic reactions with potential airway obstruction, urinary retention, reduced gastrointestinal motility, somnolence affecting the ability to drive, and caution in narrow-angle glaucoma. The QT finding is measured, quantified and modest; it is included here because "no clinically significant effect at the approved dose" and "no effect" are different statements and the label makes only the first.',
        evidenceSource:
          'US prescribing information for solifenacin succinate tablets, Clinical Pharmacology and Warnings and Precautions sections (openFDA drug label endpoint)',
        measuredMetric:
          'Mean change in Fridericia-corrected QT interval at 30 mg against placebo, with 90% confidence interval',
        auditFlag: 'verified',
      },
      {
        id: 'sol-a8',
        category: 'failed',
        title: 'A 2,225-patient study of this drug had no control arm at all',
        laymanSummary:
          'One of the largest studies on the registry for solifenacin, VOLT, enrolled 2,225 patients and gave every one of them the drug. With nobody on placebo, it cannot say what the drug did.',
        technicalDetails:
          'VOLT (NCT00463541) was an open-label study of solifenacin 5 and 10 mg in patients with overactive bladder symptoms, enrolling 2,225 participants and assessing symptoms at weeks 4, 8 and 12. It is completed. An open-label single-arm design in a condition whose placebo arms lose 1.34 incontinence episodes and 1.64 voids a day cannot distinguish drug effect from regression to the mean, from diary-keeping itself, or from expectation. It remains a legitimate safety and tolerability dataset and an illegitimate efficacy one, and the distinction is not always made when its patient numbers are quoted.',
        evidenceSource: 'ClinicalTrials.gov record, VOLT, NCT00463541',
        measuredMetric:
          'Enrolment and design of the largest open-label solifenacin study on the public registry',
        inferredClaim:
          'That large single-arm enrolment numbers add weight to the efficacy case — they add precision to a within-arm change that includes the entire placebo response',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed once a day, and slow to leave',
        laymanDesc:
          'One tablet daily. The drug hangs around in the body far longer than most, which is why the dose is once a day and why side effects do not clear quickly if they arrive.',
        molecularDetail:
          'Oral tablet, once daily, with a long terminal half-life supporting once-daily dosing. Cleared substantially by CYP3A4, so strong inhibitors of that enzyme raise exposure and the label caps the dose accordingly. Dispensed as the succinate salt.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It reaches the bladder wall without entering a cell',
        laymanDesc:
          'The target sits on the outer surface of the muscle cell, facing outward. The drug arrives from the bloodstream and sits down on it; nothing has to be carried inside.',
        molecularDetail:
          'Muscarinic receptors are G-protein-coupled receptors in the plasma membrane with an outward-facing orthosteric pocket. No transporter and no intracellular accumulation is required. The same access applies in the salivary gland and the gut, which is why the unwanted effects appear on the same timescale as the wanted one.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It occupies the seat acetylcholine needs',
        laymanDesc:
          'Parasympathetic nerves release acetylcholine into the bladder wall to tell it to squeeze. Solifenacin sits in the receptor that message binds to, so the message does not get through.',
        molecularDetail:
          'Competitive antagonism at muscarinic receptors with relative preference for M3 over M2. Competitive means surmountable: a strong enough acetylcholine surge still produces a contraction, which is the pharmacological reason a person on this drug can still be caught by urgency.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The calcium spike that drives the squeeze does not fire',
        laymanDesc:
          'A contraction needs a burst of calcium inside the muscle cell. With the receptor occupied, the burst is smaller, and the involuntary squeeze during filling is blunted.',
        molecularDetail:
          'Loss of M3-Gq/11 coupling reduces phospholipase C activation, so inositol trisphosphate falls, sarcoplasmic reticulum calcium release drops and myosin light-chain phosphorylation declines. M2 blockade additionally removes the inhibition of adenylyl cyclase that normally opposes relaxation. Detrusor tone during filling falls and functional bladder capacity rises.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'A fraction of an episode a day, and a dry mouth',
        laymanDesc:
          'The diary improves by less than one leak and under one extra trip a day compared with placebo. Roughly one person in nine at the low dose, and one in four at the high dose, gets a dry mouth in exchange.',
        molecularDetail:
          'Micturitions per 24 hours fell 2.37 on 5 mg against 1.59 on placebo in the pivotal trial; incontinence episodes fell 1.79 against 1.34 on placebo in SYNERGY. Dry mouth 10.9% and 27.6% at 5 and 10 mg against 4.2% on placebo. The identical M3 blockade produces both columns of that table, and no dosing strategy separates them.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'SYNERGY (NCT01972841)',
        phase: 'Phase 3 randomised double-blind placebo- and active-controlled, 12 weeks',
        sampleSize: 3527,
        primaryEndpoint:
          'Change from baseline to end of treatment in mean incontinence episodes and mean micturitions per 24 hours',
        endpointMet: true,
        statisticalPValue:
          'Combination versus mirabegron monotherapy p=0.001 (25 mg) and p<0.001 (50 mg) for incontinence episodes; placebo -1.34, solifenacin 5 mg -1.79, mirabegron 50 mg -1.76',
        unreportedAdverseSignals:
          'The comparison a reader most wants — solifenacin monotherapy against placebo — is present in the arm means but is not the registered hypothesis, so it carries no p-value in the results record. The margin from those means is 0.45 incontinence episodes a day.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'BESIDE (NCT01908829)',
        phase: 'Phase 3 randomised double-blind active-controlled, 12 weeks',
        sampleSize: 2174,
        primaryEndpoint:
          'Change from baseline to end of treatment in mean incontinence episodes per 24 hours, combination versus solifenacin 5 mg',
        endpointMet: true,
        statisticalPValue:
          'Difference -0.26 episodes per 24 hours (95% CI -0.47 to -0.05), p=0.001 for combination versus solifenacin 5 mg',
        unreportedAdverseSignals:
          'Solifenacin 10 mg monotherapy fell 1.67 episodes against the combination arm 1.80. That 0.13 gap is the clinically relevant comparison and was not the primary hypothesis.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'BEYOND (NCT01638000)',
        phase: 'Phase 3 randomised double-blind active-controlled non-inferiority, 12 weeks',
        sampleSize: 1887,
        primaryEndpoint:
          'Change from baseline to final visit in mean micturitions per 24 hours, mirabegron 50 mg versus solifenacin 5 mg in patients dissatisfied with prior antimuscarinics',
        endpointMet: true,
        statisticalPValue:
          'Solifenacin -3.13 versus mirabegron -2.95; adjusted difference -0.18 (95% CI -0.42 to 0.06), p=0.15. Non-inferiority met; no superiority in either direction.',
        unreportedAdverseSignals:
          'Every patient enrolled had already failed an antimuscarinic, and the trial then gave half of them another antimuscarinic. That both arms improved by about three voids a day with no placebo arm to subtract makes the size of the drug effect unrecoverable from this trial.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'VOLT (NCT00463541)',
        phase: 'Open-label single-arm, 12 weeks',
        sampleSize: 2225,
        primaryEndpoint:
          'Efficacy of solifenacin 5 and 10 mg on overactive bladder symptoms at weeks 4, 8 and 12',
        endpointMet: false,
        statisticalPValue:
          'No controlled comparison exists. `endpointMet: false` here records the absence of a control arm, not a missed endpoint.',
        unreportedAdverseSignals:
          'A single-arm design in a condition with a placebo response of 1.34 incontinence episodes a day cannot separate drug effect from regression to the mean or from the act of keeping a diary.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Micturitions per 24 hours fell 2.37 on solifenacin 5 mg and 2.81 on 10 mg, against 1.59 on placebo, in the 12-week pivotal trial',
        'Incontinence episodes per 24 hours fell 1.79 on solifenacin 5 mg against 1.34 on placebo in the 3,527-patient SYNERGY trial',
        'Dry mouth in 10.9% at 5 mg and 27.6% at 10 mg, against 4.2% on placebo, in the pooled label data',
        'Against tolterodine ER 4 mg at four weeks, incontinence fell 1.30 a day on solifenacin 5 mg versus 0.90, p=0.0181',
        'A 30 mg dose — three times the maximum recommended — raised Fridericia-corrected QT by a mean 8 msec (90% CI 4 to 13)',
      ],
      unsupportedInferences: [
        'That a 51% reduction in urgency episodes is a 51% drug effect — the placebo arm supplies most of the movement, and only the difference belongs to the drug',
        'That combination therapy is the established next step after solifenacin 5 mg — BESIDE tested it against the 5 mg dose, not against the 10 mg dose of the same drug',
        'That bladder antimuscarinics cause dementia — a class odds ratio of 1.65 in a nested case-control study, with no randomised evidence at all',
        'That the trial populations describe the treated population — real-world one-year persistence for this class runs from 12% to 25%',
      ],
      whatFailedInitially: [
        'Persistence: median time to discontinuation is under five months for oral antimuscarinics across almost every real-world study reviewed',
        'The head-to-head against a different mechanism: BEYOND could not separate solifenacin from mirabegron on its primary endpoint, p=0.15',
        'The comparison with structured behavioural training, which reduced incontinence episodes 80.7% against 68.5% for the antimuscarinic arm and has never been repeated against a modern agent',
      ],
      realWorldOutcome: [
        'Eighteen cents a tablet at United States pharmacy acquisition cost, with forty generic products listed',
        'Still the leading branded-turned-generic antimuscarinic worldwide, and increasingly prescribed alongside mirabegron rather than instead of it',
        'The class now carries an anticholinergic-burden warning in most national prescribing guidance for older adults, driven by observational data rather than by any trial in this indication',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, once daily; a separate oral suspension exists for paediatric use',
      description:
        'A conventional immediate-release tablet swallowed whole once a day. There is no modified-release engineering here of the kind tamsulosin uses, because the molecule already has a long enough half-life to hold a once-daily schedule on its own. Dose is capped in the presence of strong CYP3A4 inhibitors and in significant renal or hepatic impairment.',
      safetyProfile:
        'The commonest effects are dry mouth, constipation and blurred vision, all dose-dependent and all on-target. The label warns of angioedema and anaphylactic reactions with potential airway obstruction, of urinary retention in patients with bladder outflow obstruction, of decreased gastrointestinal motility, of somnolence affecting driving, of caution in narrow-angle glaucoma, and of QT prolongation in patients already at risk. The class-level concern that does not appear in a 12-week trial is cumulative anticholinergic burden in older adults.',
    },
    commonQuestions: [
      {
        q: 'How much better than placebo is it, in plain numbers?',
        a: 'In the trial that licensed it, people on placebo made 1.59 fewer trips to the toilet a day and people on 5 mg made 2.37 fewer — a difference of about three-quarters of a trip. In the more recent SYNERGY trial, placebo removed 1.34 leaks a day and solifenacin removed 1.79, a difference of 0.45. Both differences are statistically real; the trials were large enough to detect them reliably. Whether a fraction of an episode a day is worth it to any particular person is a different question from whether the p-value is small, and it is the question the p-value does not answer.',
        auditNote:
          'Percentage reductions quoted from baseline — "a 51% fall in urgency episodes" — include the whole placebo response. Only the difference between arms is attributable to the drug.',
      },
      {
        q: 'Why does it dry my mouth out so badly?',
        a: 'Because the receptor it blocks in your bladder is the same receptor that makes your salivary glands produce saliva. There is no version of this drug that can tell the two apart, and the rate rises with dose in exactly the way the bladder effect does: 10.9% at 5 mg and 27.6% at 10 mg, against 4.2% on placebo. Constipation follows the same pattern for the same reason, because the gut uses the receptor too, and blurred vision because the focusing muscle of the eye does. These are not side effects in the sense of something going wrong. They are the drug working, elsewhere.',
      },
      {
        q: 'Does this class of drug cause dementia?',
        a: 'Nobody knows, and the honest answer has to include why. Two very large British primary-care studies found an association. Coupland and colleagues, comparing 58,769 people with dementia against 225,574 controls, found bladder antimuscarinics carried an adjusted odds ratio of 1.65, and found the risk rose steadily with cumulative exposure across all anticholinergic drugs. Richardson and colleagues found the association still present 15 to 20 years before diagnosis, which argues against the simplest alternative explanation — that an early, undiagnosed dementia was causing the bladder symptoms that led to the prescription. But no randomised trial in this indication has ever been powered for a cognitive endpoint, and observational data of this kind cannot settle causation on its own.',
        auditNote:
          'A drug that is stopped by most people inside a year is also a drug whose cumulative-exposure studies are dominated by the minority who stay on it, who differ from everyone else in ways no adjustment fully captures.',
      },
      {
        q: 'Is there anything that works as well without the drug?',
        a: 'One randomised trial addressed this directly, and it did not favour the drug. In 197 community-dwelling women aged 55 and over, structured behavioural training — pelvic floor exercises with biofeedback plus urge-suppression technique — reduced incontinence episodes by a mean of 80.7%, against 68.5% for the drug arm (P=.04) and 39.4% for placebo. Only 14% of the behavioural group wanted to switch to something else, against 75.5% in each of the other groups. Two caveats belong with that result: the drug in that trial was oxybutynin rather than solifenacin, and behavioural training as delivered there was several supervised sessions, not a handout.',
      },
      {
        q: 'Why does this page not show a manufacturing cost?',
        a: 'Because no per-dose cost-of-production figure for solifenacin could be verified and cited. The cost-of-production literature checked publishes an estimation method and aggregate ranges rather than a per-dose figure for this molecule, and filling that field without a source would mean inventing a number. What is shown instead is what pharmacies pay — about eighteen cents a tablet in the CMS acquisition-cost survey — which is a price, not a cost of manufacture.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Cardozo L, Lisec M, Millard R, van Vierssen Trip O, Kuzmin I, Drogendijk TE, Huang M, Ridder AM. Randomized, double-blind placebo controlled trial of the once daily antimuscarinic agent solifenacin succinate in patients with overactive bladder. J Urol 2004;172(5 Pt 1):1919-1924',
        identifier: '10.1097/01.ju.0000140729.07840.16',
        kind: 'doi',
      },
      {
        label:
          'Chapple CR et al., STAR study group. A comparison of the efficacy and tolerability of solifenacin succinate and extended release tolterodine at treating overactive bladder syndrome: results of the STAR trial. Eur Urol 2005;48:464-470',
        identifier: '10.1016/j.eururo.2005.05.015',
        kind: 'doi',
      },
      {
        label:
          'Chapple CR et al., STAR study group. Treatment outcomes in the STAR study: a subanalysis of solifenacin 5 mg and tolterodine ER 4 mg. Eur Urol 2007;52:1195-1203',
        identifier: '10.1016/j.eururo.2007.05.027',
        kind: 'doi',
      },
      {
        label:
          'SYNERGY — solifenacin and mirabegron combination versus each monotherapy and placebo in overactive bladder',
        identifier: 'NCT01972841',
        kind: 'nct',
      },
      {
        label: 'BESIDE — adding mirabegron to solifenacin in incontinent overactive bladder',
        identifier: 'NCT01908829',
        kind: 'nct',
      },
      {
        label:
          'BEYOND — mirabegron versus solifenacin in patients dissatisfied with prior antimuscarinic therapy',
        identifier: 'NCT01638000',
        kind: 'nct',
      },
      {
        label: 'VOLT — open-label study of solifenacin 5 and 10 mg in overactive bladder',
        identifier: 'NCT00463541',
        kind: 'nct',
      },
      {
        label:
          'Yeowell G, Smith P, Nazir J, Hakimi Z, Siddiqui E, Fatoye F. Real-world persistence and adherence to oral antimuscarinics and mirabegron in patients with overactive bladder: a systematic literature review. BMJ Open 2018;8(11):e021889',
        identifier: '10.1136/bmjopen-2018-021889',
        kind: 'doi',
      },
      {
        label:
          'Coupland CAC, Hill T, Dening T, Morriss R, Moore M, Hippisley-Cox J. Anticholinergic drug exposure and the risk of dementia: a nested case-control study. JAMA Intern Med 2019;179:1084-1093',
        identifier: '10.1001/jamainternmed.2019.0677',
        kind: 'doi',
      },
      {
        label:
          'Richardson K, Fox C, Maidment I, et al. Anticholinergic drugs and risk of dementia: case-control study. BMJ 2018;361:k1315',
        identifier: '10.1136/bmj.k1315',
        kind: 'doi',
      },
      {
        label:
          'Burgio KL, Locher JL, Goode PS, Hardin JM, McDowell BJ, Dombrowski M, Candib D. Behavioral vs drug treatment for urge urinary incontinence in older women: a randomized controlled trial. JAMA 1998;280:1995-2000',
        identifier: '10.1001/jama.280.23.1995',
        kind: 'doi',
      },
      {
        label:
          'US prescribing information for solifenacin succinate tablets — mechanism of action, clinical pharmacology, warnings and precautions, adverse reactions (openFDA drug label endpoint)',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22solifenacin+succinate%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 154059 — solifenacin structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/154059',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 4. Mirabegron — the first new mechanism in this indication in thirty years, whose registration
  //    trials accidentally demonstrated that the drug they were being compared against could not
  //    beat placebo, and whose most famous experiment used four times the licensed dose.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'mirabegron',
    name: 'Mirabegron',
    tradeName: 'Myrbetriq',
    sponsor: 'Astellas',
    targetGene: 'ADRB3',
    targetProtein:
      'Beta-3 adrenergic receptor on detrusor smooth muscle, the dominant beta-adrenoceptor subtype in human bladder and the one that mediates relaxation during filling',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2012,
    indication:
      'Overactive bladder in adults with symptoms of urge urinary incontinence, urgency and urinary frequency, alone or in combination with solifenacin succinate; and neurogenic detrusor overactivity in children aged 3 years and over weighing 35 kg or more.',
    patientFriendlyIndication:
      'An overactive bladder — sudden urgency, going too often, and leaking — for people who cannot tolerate or do not want an anticholinergic drug',
    anatomicalSite: 'Detrusor smooth muscle of the bladder wall during the storage phase',
    conditionContext: {
      conditionExplainer:
        'The bladder has two jobs and they use different nerves. Emptying is driven by acetylcholine acting on muscarinic receptors, which is what every older drug in this indication blocks. Filling is helped along by the sympathetic nervous system relaxing the same muscle through beta-adrenoceptors, and in the human bladder that job belongs almost entirely to the beta-3 subtype.',
      whyItMatters:
        'For thirty years the whole treatment class attacked the emptying signal. Mirabegron was the first approved drug to work on the filling signal instead, which is why its side-effect profile is unrelated: no dry mouth, no constipation from the drug itself, and no contribution to anticholinergic burden.',
      whoTakesThis:
        'Adults with overactive bladder, disproportionately those who stopped an antimuscarinic because of dry mouth or who are already carrying a heavy anticholinergic load from other prescriptions. A paediatric granule formulation is licensed separately for neurogenic detrusor overactivity.',
      clinicalGoals:
        'Fewer incontinence episodes and fewer voids per 24 hours on a three-day diary, without adding to the anticholinergic burden. The size of that improvement over placebo is the number this page keeps returning to.',
    },
    oneSentenceVerdict:
      'The first beta-3 adrenergic agonist licensed for any condition, which relaxes the bladder wall during filling instead of blocking the signal that empties it: across its three placebo-controlled registration trials the 50 mg dose removed 1.38 to 1.57 incontinence episodes a day against placebo 0.96 to 1.17, and in two of those trials the antimuscarinic used as active control could not separate from placebo at all.',
    laymanHowItWorks:
      'Your bladder does not just squeeze — while it is filling, a separate set of nerve signals actively tells the muscle to stay relaxed so it can hold more. Mirabegron amplifies that relaxing signal by switching on a receptor called beta-3, which in the human bladder is almost the only beta-receptor there is. Because it is not touching the acetylcholine system at all, it does not dry the mouth, blur vision or add to the anticholinergic load older bladder drugs carry. What it does carry instead is a blood-pressure warning, because beta receptors elsewhere in the body are not entirely indifferent to it.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 68,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$9.60 per tablet at United States pharmacy acquisition cost (CMS NADAC, generic, median across 17 listed products, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States in June 2012 and now nominally generic, with seventeen products in the acquisition-cost file. The median has not collapsed the way tamsulosin or solifenacin did: at US$9.60 a tablet this generic still costs roughly fifty-five times a generic solifenacin tablet, which is a fact about how few suppliers entered rather than about the chemistry.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The choice here is a three-way one. The antimuscarinics are almost free and produce a similar diary change, at the cost of dry mouth, constipation and a place on every anticholinergic-burden list. Vibegron is the same mechanism as mirabegron without the blood-pressure warning, and costs more again. And the only randomised comparison of a drug in this indication against structured behavioural training went to the training.',
      conventionalRx: [
        {
          name: 'Solifenacin (Vesicare)',
          class: 'M3-preferring muscarinic antagonist',
          howItCompares:
            'BEYOND (NCT01638000) randomised 1,887 patients dissatisfied with prior antimuscarinics to mirabegron 50 mg or solifenacin 5 mg. Voids per 24 hours fell 2.95 against 3.13, adjusted difference -0.18 (95% CI -0.42 to 0.06), p=0.15: statistically indistinguishable. In SYNERGY, with a placebo arm present, incontinence fell 1.76 on mirabegron 50 mg and 1.79 on solifenacin 5 mg against 1.34 on placebo.',
          typicalCost:
            'US$0.1754 per tablet at United States pharmacy acquisition cost (CMS NADAC, generic, median across 40 listed products, effective 19 August 2026)',
          prosAndCons:
            'Pros: about one fifty-fifth of the acquisition cost, and the same diary movement. Cons: dry mouth in 10.9% at 5 mg and 27.6% at 10 mg, and membership of a drug class carrying an observational dementia association.',
        },
        {
          name: 'Vibegron (Gemtesa)',
          class: 'Beta-3 adrenergic agonist, the second in the class',
          howItCompares:
            'EMPOWUR (NCT03492281) randomised 1,530 patients to vibegron 75 mg, tolterodine ER 4 mg or placebo. Vibegron beat placebo by 0.5 voids a day (p<0.001) and 0.6 urge incontinence episodes a day (p<0.0001). Its US label does not carry mirabegron\'s blood-pressure warning, and it is not a strong CYP2D6 inhibitor, which removes a drug-interaction problem mirabegron has.',
          typicalCost:
            'US$16.46 per tablet at United States pharmacy acquisition cost (CMS NADAC, brand, median across 2 listed products, effective 19 August 2026)',
          prosAndCons:
            'Pros: same mechanism, no blood-pressure warning, fewer interactions. Cons: still branded, nearly double the acquisition cost, and no head-to-head trial against mirabegron has been run.',
        },
        {
          name: 'Oxybutynin (Ditropan, and its transdermal forms)',
          class: 'Non-selective muscarinic antagonist, the oldest drug in the indication',
          howItCompares:
            'The cheapest option by a wide margin and the one with the heaviest anticholinergic load. In older patients, dry mouth occurred roughly six times more often on tolterodine ER 4 mg than on mirabegron over 12 weeks, and oxybutynin is more anticholinergic than tolterodine, not less.',
          typicalCost:
            'US$0.0817 per unit at United States pharmacy acquisition cost (CMS NADAC, generic, median across 92 listed products, effective 19 August 2026)',
          prosAndCons:
            'Pros: eight cents a dose, fifty years of use, and transdermal forms that bypass first-pass metabolism. Cons: the highest anticholinergic burden in the indication, and it was the drug arm that lost to behavioural training in the only trial to test that comparison.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Have your blood pressure checked after starting, not only before',
          action:
            'The US label recommends measuring blood pressure periodically on treatment, and states that mirabegron is not recommended in severe uncontrolled hypertension.',
          patientImpact:
            'At the 50 mg dose the label reports mean increases of approximately 0.5 to 1 mmHg over placebo — small. The adverse-event table is less tidy: hypertension was reported in 11.3% at 25 mg, 7.5% at 50 mg and 7.6% on placebo, a pattern with no dose gradient. A 715-patient ambulatory monitoring substudy of SYNERGY then found no consistent 24-hour blood-pressure or heart-rate signal at all.',
          clinicalPrecaution:
            'A group mean of 1 mmHg says nothing about an individual, which is why the label asks for measurement rather than reassurance. Someone with severe uncontrolled hypertension is outside the population any of these datasets describe.',
        },
        {
          name: 'Check for interactions before anything metabolised by CYP2D6 is added',
          action:
            'Mirabegron is a moderate CYP2D6 inhibitor, so it raises exposure to drugs cleared by that enzyme.',
          patientImpact:
            'This is a mechanism-level interaction, not a rare event: metoprolol, many antidepressants, and several antiarrhythmics all use that pathway. The label handles it with dose caps and monitoring language rather than outright contraindications.',
          clinicalPrecaution:
            'The successor drug in the same class, vibegron, does not inhibit CYP2D6, which is one of the few concrete clinical differences between the two.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1=CC=C(C=C1)[C@H](CNCCC2=CC=C(C=C2)NC(=O)CC3=CSC(=N3)N)O',
      chemicalFormula: 'C21H24N4O2S',
      molecularWeight: '396.50 g/mol',
      targetReceptorAffinity:
        'Agonist at the human beta-3 adrenergic receptor. The US label describes the pharmacology functionally rather than numerically — the drug "relaxes the detrusor smooth muscle during the storage phase" and increases bladder capacity — so no Ki or EC50 is quoted here. The single stereocentre is the (R) configuration and is carried in the structure; the (S) enantiomer is the specified chiral impurity. The aminothiazole acetamide on one end and the phenylethanolamine on the other are the two halves the synthesis joins.',
      structureSource: {
        label: 'PubChem CID 9865528 — mirabegron structure, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/9865528',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'mir-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Enantiomeric excess of the (R)-styrene oxide or (R)-phenylglycinol precursor',
          description:
            'Confirm the configuration of the benzylic alcohol fragment before it is opened by the amine. Mirabegron is a single enantiomer with one stereocentre, so this is the only chiral checkpoint in the route and every downstream specification depends on it.',
          reagentsAndBuffer:
            'Chiral stationary-phase HPLC on an amylose tris(3,5-dimethylphenylcarbamate) column, n-hexane with 2-propanol and diethylamine, UV detection at 210 nm, (S)-enantiomer reference standard',
        },
        {
          id: 'mir-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Ring opening of the epoxide, then amide coupling to the aminothiazole',
          description:
            'Open the chiral epoxide with the arylethylamine to build the secondary amine and the benzylic alcohol in one operation, then acylate the aniline nitrogen with 2-(2-aminothiazol-4-yl)acetic acid to complete the molecule. The stereocentre is inherited, not created, which is the point of settling it first.',
          dependsOnStepId: 'mir-w1',
          reagentsAndBuffer:
            '(R)-styrene oxide, 4-nitrophenethylamine followed by reduction to the aniline, 2-(2-aminothiazol-4-yl)acetic acid, a carbodiimide or uronium coupling reagent with hydroxybenzotriazole, diisopropylethylamine, anhydrous dimethylformamide under nitrogen',
        },
        {
          id: 'mir-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation and control of the des-amino and regioisomeric impurities',
          description:
            'Crystallise the free base and re-run both the achiral related-substances method and the chiral method on the finished solid. The impurity profile is dominated by incomplete acylation and by over-alkylation at the secondary amine, and residual thiazole starting material is controlled separately.',
          dependsOnStepId: 'mir-w2',
          reagentsAndBuffer:
            'Ethanol or ethyl acetate with heptane antisolvent, activated charcoal, reversed-phase HPLC with gradient elution for related substances, chiral HPLC for enantiomeric purity, X-ray powder diffraction for polymorph identity',
        },
        {
          id: 'mir-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Application to cells expressing each human beta-adrenoceptor subtype separately',
          description:
            'Apply the compound to three stable lines carrying human ADRB1, ADRB2 or ADRB3. The receptor faces the extracellular space, so nothing has to be carried inside a cell. Running all three together is what a selectivity claim rests on, and it is also the assay that maps onto the cardiovascular warning: beta-1 activity is what would raise heart rate, and beta-2 activity is what would move vascular tone.',
          dependsOnStepId: 'mir-w3',
          reagentsAndBuffer:
            'CHO or HEK293 lines stably expressing human ADRB1, ADRB2 or ADRB3, Ham F-12 or DMEM with 10% fetal bovine serum, geneticin selection, HEPES-buffered assay saline at pH 7.4, ascorbate to protect catecholamine reference agonists',
        },
        {
          id: 'mir-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Cyclic AMP accumulation across all three subtypes, plus isolated detrusor strip relaxation',
          description:
            'Measure cyclic AMP generation at each beta subtype to obtain potency and intrinsic activity, then confirm the result in a tissue that has not been engineered: strips of human detrusor precontracted with carbachol, relaxed by the compound. A cell line reports what a transfected receptor does; a muscle strip reports what the drug does to muscle.',
          dependsOnStepId: 'mir-w4',
          reagentsAndBuffer:
            'HTRF or AlphaScreen cyclic AMP detection kit, isoprenaline and CL-316,243 as reference agonists, IBMX to block phosphodiesterase, forskolin as positive control, Krebs-Henseleit buffer gassed with 95% oxygen and 5% carbon dioxide for the organ bath, carbachol as precontracting agent',
        },
      ],
    },
    keyAudits: [
      {
        id: 'mir-a1',
        category: 'measured',
        title: 'Three placebo-controlled trials, all positive, all under half an episode a day',
        laymanSummary:
          'Mirabegron beat placebo in all three of its registration trials, on both endpoints, with small p-values. The size of the win was consistently between a quarter and half an accident a day.',
        technicalDetails:
          'ARIES (NCT00662909, n=2,149) reported incontinence episodes per 24 hours falling 1.13 on placebo, 1.47 on 50 mg (p=0.026) and 1.63 on 100 mg (p<0.001); micturitions fell 1.05, 1.66 (p=0.001) and 1.75 (p<0.001). SCORPIO (NCT00689104, n=2,336) reported incontinence 1.17 on placebo against 1.57 on 50 mg (p=0.003), micturitions 1.34 against 1.93 (p<0.001). CAPRICORN (NCT00912964, n=2,030) reported incontinence 0.96 on placebo, 1.36 on 25 mg (p=0.005) and 1.38 on 50 mg (p=0.001). Three independent trials, over 6,500 patients, and a treatment effect that lands between 0.34 and 0.59 incontinence episodes a day every time. The consistency is the strongest thing about this dataset and the magnitude is the most easily overstated.',
        evidenceSource:
          'ClinicalTrials.gov results records for ARIES (NCT00662909), SCORPIO (NCT00689104) and CAPRICORN (NCT00912964)',
        measuredMetric:
          'Change from baseline to week 12 in mean incontinence episodes and micturitions per 24 hours, against placebo, in three registration trials',
        auditFlag: 'verified',
      },
      {
        id: 'mir-a2',
        category: 'failed',
        title: 'In SCORPIO the active control — the standard drug — could not beat placebo',
        laymanSummary:
          'SCORPIO included an arm on tolterodine, the established treatment, purely as a yardstick. On both main endpoints, the yardstick failed to separate from placebo. Mirabegron did. The comparison people rarely draw from that trial is the one about tolterodine.',
        technicalDetails:
          'In SCORPIO (n=2,336; placebo 480, mirabegron 50 mg 473, mirabegron 100 mg 478, tolterodine SR 4 mg 475), incontinence episodes per 24 hours fell 1.17 on placebo and 1.27 on tolterodine, p=0.11 (95% CI -0.42 to 0.21); micturitions fell 1.34 and 1.59, p=0.11 (95% CI -0.55 to 0.06). Mirabegron 50 mg reached p=0.003 and p<0.001 on the same endpoints in the same trial. The pattern repeated seven years later in EMPOWUR (NCT03492281, n=1,530), where tolterodine ER 4 mg missed on micturitions against placebo (p=0.0988) while vibegron reached p<0.001. Two large, well-conducted, independently sponsored trials in which a drug prescribed to millions of people could not be distinguished from placebo is not a fluke of assay sensitivity; it is a statement about the size of the effect.',
        evidenceSource:
          'ClinicalTrials.gov results records, SCORPIO NCT00689104 and EMPOWUR NCT03492281; Khullar V et al., Eur Urol 2013;63:283-295',
        doi: '10.1016/j.eururo.2012.10.016',
        measuredMetric:
          'Tolterodine arm versus placebo on both co-primary endpoints, in two separate phase 3 trials',
        auditFlag: 'verified',
      },
      {
        id: 'mir-a3',
        category: 'conclusion_shift',
        title: 'The blood-pressure warning stayed, and the measurement that tested it found nothing',
        laymanSummary:
          'Mirabegron carries a blood-pressure warning on its label. When 715 patients wore 24-hour blood-pressure monitors in a later trial, no consistent increase showed up.',
        technicalDetails:
          'The US label states the drug can increase blood pressure, is not recommended in severe uncontrolled hypertension, and asks for periodic measurement; it quotes mean increases of approximately 0.5 to 1 mmHg over placebo at the 50 mg dose. The adverse-event table sits awkwardly beside that: hypertension was reported in 11.3% at 25 mg, 7.5% at 50 mg and 7.6% on placebo, with no dose gradient in the direction the warning implies. Weber and colleagues then reported an ambulatory blood-pressure monitoring substudy of SYNERGY in 715 patients, and found no consistent increase from baseline in mean 24-hour systolic or diastolic pressure for any active arm against placebo, no signal in the one-hour averages spanning both drugs\' Tmax, no difference on shift or outlier analysis, and no 24-hour heart-rate signal. The warning has not been removed. That is a defensible regulatory position for a chronic drug in an elderly population, and it is also a case where the most careful measurement disagrees with the label text.',
        evidenceSource:
          'US prescribing information for mirabegron extended-release tablets, Warnings and Precautions and Adverse Reactions; Weber MA et al., Blood Press Monit 2018;23:153-163 (PMID 29578880)',
        doi: '10.1097/MBP.0000000000000320',
        measuredMetric:
          '24-hour ambulatory systolic and diastolic blood pressure and heart rate against placebo, in 715 patients',
        auditFlag: 'contested',
      },
      {
        id: 'mir-a4',
        category: 'inferred',
        title: 'The brown fat result everyone cites used four times the approved dose in twelve men',
        laymanSummary:
          'Mirabegron became famous outside urology for switching on brown fat and raising resting metabolic rate by 13%. That experiment gave twelve healthy men 200 mg — four times the licensed dose.',
        technicalDetails:
          'Cypess and colleagues gave 200 mg of oral mirabegron to twelve healthy male subjects and measured brown adipose tissue activity by 18F-fluorodeoxyglucose PET-CT. All twelve showed higher brown fat metabolic activity than on placebo (p=0.001) and resting metabolic rate rose by 203 ± 40 kcal/day, a 13% increase (p=0.001). Brown fat activity significantly predicted the change in resting metabolic rate (p=0.006). The maximum licensed dose for overactive bladder is 50 mg, and the label\'s own QT data show the cardiovascular effect scaling with dose: mean QTcI difference from placebo of 3.7 msec at 50 mg against 8.1 msec at 200 mg. Twelve healthy young men receiving a single supratherapeutic dose is a physiology experiment, and it is a legitimate and important one. It is not evidence that the licensed dose does anything to body weight in anybody.',
        evidenceSource: 'Cypess AM et al., Cell Metab 2015;21:33-38 (PMID 25565203)',
        doi: '10.1016/j.cmet.2014.12.009',
        measuredMetric:
          'Brown adipose tissue 18F-FDG uptake and resting metabolic rate after a single 200 mg dose, against placebo, in 12 healthy men',
        inferredClaim:
          'That mirabegron is a metabolic or weight-loss drug — an extrapolation from a twelve-man crossover at four times the approved dose to a chronic 50 mg prescription written for a bladder',
        auditFlag: 'caution',
      },
      {
        id: 'mir-a5',
        category: 'measured',
        title: 'It genuinely does not dry the mouth, and people stay on it longer as a result',
        laymanSummary:
          'The one thing mirabegron clearly does better than the older drugs is not cause dry mouth. That shows up in how long people keep taking it: roughly a third are still on it after a year, against one in five on an antimuscarinic.',
        technicalDetails:
          'In a systematic review of thirty observational studies using electronic prescription claims, one-year persistence was 32% to 38% for mirabegron against 12% to 25% for antimuscarinics in the three studies reporting both, with median time to discontinuation of 5.6 to 7.4 months against under five months. Mean medication possession ratio was 0.59 for mirabegron against 0.41 to 0.53 for antimuscarinics. In patients aged 65 and over, dry mouth occurred with a six-fold higher incidence on tolterodine ER 4 mg than on mirabegron over 12 weeks, and a three-fold higher incidence over one year. The review was conducted by authors including employees and consultants of the manufacturer, which is a reason to weigh the size of the difference carefully rather than to discount its direction — the tolerability mechanism is not in dispute, because mirabegron has no muscarinic activity to produce the effect in the first place.',
        evidenceSource:
          'Yeowell G et al., BMJ Open 2018;8(11):e021889 (PMID 30467131); Wagg A et al., Curr Med Res Opin 2016;32:621-638 (PMID 26828974)',
        doi: '10.1136/bmjopen-2018-021889',
        measuredMetric:
          'One-year persistence, median time to discontinuation and dry-mouth incidence against antimuscarinics',
        auditFlag: 'verified',
      },
      {
        id: 'mir-a6',
        category: 'inferred',
        title: 'BESIDE tested adding mirabegron against the low dose of the drug already prescribed',
        laymanSummary:
          'The trial behind the combination licence compared solifenacin plus mirabegron with solifenacin 5 mg. Against solifenacin 10 mg — simply raising the dose already prescribed — the difference nearly vanishes.',
        technicalDetails:
          'BESIDE (NCT01908829) randomised 2,174 patients still incontinent after four weeks on solifenacin 5 mg to combination with mirabegron, to solifenacin 5 mg, or to solifenacin 10 mg. Incontinence episodes per 24 hours fell 1.80 on combination, 1.53 on solifenacin 5 mg and 1.67 on solifenacin 10 mg. The registered primary comparison against solifenacin 5 mg gave a difference of -0.26 episodes (95% CI -0.47 to -0.05), p=0.001. Against solifenacin 10 mg the gap is 0.13 episodes a day and was not the primary hypothesis. Adding a second mechanism and doubling the first drug are the two options a prescriber has, and the trial was designed to answer only one of them.',
        evidenceSource: 'ClinicalTrials.gov results record, BESIDE, NCT01908829',
        measuredMetric:
          'Change from baseline in mean incontinence episodes per 24 hours, combination versus each solifenacin dose',
        inferredClaim:
          'That combination therapy is the demonstrated next step after a partial response — demonstrated against the dose the patient has already failed, not against the higher dose of the same drug',
        auditFlag: 'caution',
      },
      {
        id: 'mir-a7',
        category: 'measured',
        title: 'The longest trial measured adverse events, not whether anyone got better',
        laymanSummary:
          'TAURUS ran for a year in 2,792 patients — the longest study of this drug. Its primary endpoint was how many people had side effects, not how well it worked.',
        technicalDetails:
          'TAURUS (NCT00688688) randomised 2,792 patients to mirabegron 50 mg, mirabegron 100 mg or tolterodine ER 4 mg for twelve months, with the number and severity of treatment-emergent adverse events as the registered primary outcome. There is no placebo arm. This is a normal and appropriate design for a long-term safety commitment, and it is worth stating plainly what follows from it: the longest randomised exposure anyone has to this drug can describe its tolerability over a year, and cannot describe the size of its benefit over a year. Every efficacy figure quoted for mirabegron comes from a 12-week trial.',
        evidenceSource:
          'ClinicalTrials.gov record, TAURUS, NCT00688688; Chapple CR et al., Eur Urol 2013;63:296-305',
        doi: '10.1016/j.eururo.2012.10.048',
        measuredMetric:
          'Registered primary outcome and arm structure of the only 12-month randomised trial of this drug',
        auditFlag: 'verified',
      },
      {
        id: 'mir-a8',
        category: 'measured',
        title: 'Generic status did not bring the price down',
        laymanSummary:
          'Mirabegron is off patent and there are seventeen listed products, yet pharmacies still pay about nine dollars sixty a tablet. Generic solifenacin costs eighteen cents.',
        technicalDetails:
          'The CMS National Average Drug Acquisition Cost file effective 19 August 2026 lists mirabegron as generic with a median across seventeen products of US$9.60 per tablet. The comparable figures on the same file are US$0.1754 for solifenacin across forty products, US$0.2533 for tolterodine across fifty-four, and US$0.0817 for oxybutynin across ninety-two. Number of suppliers, not molecular complexity, is what these medicines\' prices track: the extended-release formulation is a real technical barrier, and seventeen listings that leave the median near ten dollars indicate a market that has not behaved the way a mature generic market does.',
        evidenceSource:
          'CMS National Average Drug Acquisition Cost file, effective 19 August 2026, as stored on this record',
        measuredMetric:
          'Median pharmacy acquisition cost per tablet and number of listed products, against the antimuscarinic comparators on the same file',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'An extended-release tablet, once a day, sensitive to food',
        laymanDesc:
          'One tablet daily, swallowed whole. The tablet is engineered to release slowly, and how much gets absorbed depends on whether it is taken with food.',
        molecularDetail:
          'Oral controlled-absorption system tablet, once daily. Bioavailability is dose-dependent and is reduced by food, which is why the label specifies conditions of administration. Metabolised by multiple routes including CYP3A4 and CYP2D6; mirabegron itself is a moderate CYP2D6 inhibitor, which is the source of its main interaction profile.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It meets the receptor on the outside of the bladder muscle cell',
        laymanDesc:
          'The beta-3 receptor sits on the surface of the muscle cell facing the bloodstream. The drug arrives and sits on it. Nothing needs to be carried inside.',
        molecularDetail:
          'Beta-3 adrenoceptors are G-protein-coupled receptors in the plasma membrane with an extracellular-facing orthosteric pocket. Beta-3 is the predominant beta-adrenoceptor subtype expressed in human detrusor, which is the anatomical fact the whole drug class rests on and the reason a beta-3-selective agonist can relax bladder without the beta-1 and beta-2 effects that would follow a non-selective one.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It switches the receptor on rather than blocking it',
        laymanDesc:
          'This is the opposite of how every older bladder drug works. Instead of blocking a squeeze signal, mirabegron turns up a relaxation signal the body already uses while the bladder fills.',
        molecularDetail:
          'Agonism, not antagonism. Beta-3 activation couples to Gs, which is why the pharmacology is additive with muscarinic blockade rather than redundant to it — the two drugs act on opposite arms of the autonomic supply to the same muscle. That is the mechanistic basis for the combination licence, and BESIDE is the trial that had to test whether the mechanism translated.',
        iconName: 'ToggleRight',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Cyclic AMP rises and the muscle lets go during filling',
        laymanDesc:
          'Switching the receptor on raises an internal messenger that tells the muscle to relax. The bladder holds more before it starts demanding to be emptied.',
        molecularDetail:
          'Gs coupling activates adenylyl cyclase, cyclic AMP rises, protein kinase A phosphorylates targets that lower intracellular calcium and reduce myosin light-chain kinase sensitivity. Detrusor tone during the storage phase falls and functional bladder capacity increases without impairing the voiding contraction itself, which is why post-void residual volume is not the problem here that it is with antimuscarinics.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'A third to a half an episode a day, and a dry mouth that does not arrive',
        laymanDesc:
          'The diary improves by roughly a third to a half an accident a day more than placebo. The difference people notice most is what does not happen: no dry mouth, no constipation from the drug.',
        molecularDetail:
          'Incontinence episodes per 24 hours fell 1.38 to 1.57 on 50 mg against 0.96 to 1.17 on placebo across ARIES, SCORPIO and CAPRICORN. Because no muscarinic receptor is touched, dry mouth rates approach placebo, and one-year persistence runs 32% to 38% against 12% to 25% for antimuscarinics. The trade appearing in its place is a blood-pressure warning, a mean QTcI increase of 3.7 msec at 50 mg, and moderate CYP2D6 inhibition.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'ARIES (NCT00662909)',
        phase: 'Phase 3 randomised double-blind placebo-controlled, 12 weeks',
        sampleSize: 2149,
        primaryEndpoint:
          'Change from baseline to week 12 in mean incontinence episodes and mean micturitions per 24 hours',
        endpointMet: true,
        statisticalPValue:
          'Incontinence: placebo -1.13, 50 mg -1.47 (p=0.026), 100 mg -1.63 (p<0.001). Micturitions: placebo -1.05, 50 mg -1.66 (p=0.001), 100 mg -1.75 (p<0.001)',
        unreportedAdverseSignals:
          'No active comparator arm, so this trial says nothing about how mirabegron compares with the drugs it was intended to replace.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'SCORPIO (NCT00689104)',
        phase: 'Phase 3 randomised double-blind placebo- and active-controlled, 12 weeks',
        sampleSize: 2336,
        primaryEndpoint:
          'Change from baseline to week 12 in mean incontinence episodes and mean micturitions per 24 hours',
        endpointMet: true,
        statisticalPValue:
          'Mirabegron 50 mg: incontinence -1.57 versus placebo -1.17 (p=0.003), micturitions -1.93 versus -1.34 (p<0.001). Tolterodine SR 4 mg: incontinence -1.27 (p=0.11), micturitions -1.59 (p=0.11)',
        unreportedAdverseSignals:
          'The tolterodine arm missed on both co-primary endpoints against placebo. That result belongs to tolterodine and is rarely reported as a finding about tolterodine.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'CAPRICORN (NCT00912964)',
        phase: 'Phase 3 randomised double-blind placebo-controlled, 12 weeks',
        sampleSize: 2030,
        primaryEndpoint:
          'Change from baseline to week 12 in mean incontinence episodes and mean micturitions per 24 hours',
        endpointMet: true,
        statisticalPValue:
          'Incontinence: placebo -0.96, 25 mg -1.36 (p=0.005), 50 mg -1.38 (p=0.001). Micturitions: placebo -1.18, 25 mg -1.65 (p=0.007), 50 mg -1.60 (p=0.015)',
        unreportedAdverseSignals:
          'The 25 mg and 50 mg arms are indistinguishable from each other on both endpoints, which is the trial that establishes 25 mg as a licensed dose and also undercuts any dose-response argument for going higher.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'TAURUS (NCT00688688)',
        phase: 'Phase 3 randomised double-blind active-controlled long-term safety, 12 months',
        sampleSize: 2792,
        primaryEndpoint:
          'Number and severity of treatment-emergent adverse events over 12 months, against tolterodine ER 4 mg',
        endpointMet: true,
        statisticalPValue:
          'A safety endpoint with no hypothesis test of efficacy and no placebo arm; no efficacy p-value exists for the 12-month comparison',
        unreportedAdverseSignals:
          'The longest randomised exposure to this drug carries no placebo arm and no efficacy primary. Every efficacy number quoted for mirabegron comes from a 12-week study.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'SYNERGY (NCT01972841)',
        phase: 'Phase 3 randomised double-blind placebo- and active-controlled, 12 weeks',
        sampleSize: 3527,
        primaryEndpoint:
          'Change from baseline to end of treatment in mean incontinence episodes and micturitions per 24 hours, combination versus each monotherapy',
        endpointMet: true,
        statisticalPValue:
          'Combination versus mirabegron monotherapy p=0.001 (25 mg) and p<0.001 (50 mg) for incontinence; placebo -1.34, mirabegron 50 mg -1.76, solifenacin 5 mg -1.79, combination -1.98',
        unreportedAdverseSignals:
          'The 715-patient ambulatory blood-pressure substudy of this trial found no consistent 24-hour blood-pressure or heart-rate signal in any active arm, which sits uneasily with the label warning it was designed to interrogate.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Incontinence episodes per 24 hours fell 1.38 to 1.57 on mirabegron 50 mg against 0.96 to 1.17 on placebo, across three phase 3 trials totalling over 6,500 patients',
        'Micturitions per 24 hours fell 1.60 to 1.93 on 50 mg against 1.05 to 1.34 on placebo in the same trials',
        'Tolterodine SR 4 mg, the active control in SCORPIO, missed against placebo on both co-primary endpoints at p=0.11',
        'Mean QTcI difference from placebo of 3.7 msec at the 50 mg dose, and 8.1 msec at 200 mg',
        'A single 200 mg dose raised resting metabolic rate by 203 ± 40 kcal/day in 12 healthy men (p=0.001)',
        'One-year persistence of 32% to 38% against 12% to 25% for antimuscarinics in real-world prescription claims',
      ],
      unsupportedInferences: [
        'That mirabegron is a metabolic or weight-loss drug — the brown fat result used four times the licensed dose in twelve healthy young men',
        'That the label blood-pressure warning reflects a measurable hypertensive effect at the approved dose — a 715-patient ambulatory monitoring substudy found no consistent signal',
        'That combination with solifenacin is the demonstrated next step after partial response — BESIDE compared it with solifenacin 5 mg, not with solifenacin 10 mg',
        'That the 12-month TAURUS trial demonstrates 12-month efficacy — its primary endpoint was adverse events and it had no placebo arm',
      ],
      whatFailedInitially: [
        'The active-control arm in its own registration trial: tolterodine could not beat placebo in SCORPIO, and the same happened to tolterodine again in EMPOWUR seven years later',
        'Generic competition: seventeen listed products and a median acquisition cost still near ten dollars a tablet',
        'The dose-response case: 25 mg and 50 mg were indistinguishable on both co-primary endpoints in CAPRICORN',
      ],
      realWorldOutcome: [
        'US$9.60 a tablet at pharmacy acquisition cost, about fifty-five times generic solifenacin',
        'Now the usual choice where anticholinergic burden is the deciding factor, and the reason most national guidance for older adults names a beta-3 agonist before an antimuscarinic',
        'A second drug in the class, vibegron, is licensed without the blood-pressure warning and without the CYP2D6 interaction, and no head-to-head against mirabegron exists',
      ],
    },
    deliverySystem: {
      type: 'Oral extended-release tablet, once daily; granules for oral suspension in paediatric use',
      description:
        'A controlled-absorption tablet swallowed whole and not crushed or chewed, because the release mechanism is the formulation rather than the molecule. Food reduces exposure, so the label specifies administration conditions. The paediatric neurogenic detrusor overactivity indication uses a granule formulation dosed by weight.',
      safetyProfile:
        'No anticholinergic effects, which is the point of the drug: dry mouth rates approach placebo. The label warns that mirabegron can increase blood pressure, is not recommended in severe uncontrolled hypertension, and requires periodic blood-pressure measurement; it also warns of urinary retention in patients with bladder outlet obstruction, particularly if an antimuscarinic is taken as well, and of angioedema. Mirabegron is a moderate CYP2D6 inhibitor, so exposure to substrates of that enzyme rises. The measured QT effect is 3.7 msec at the licensed dose.',
    },
    commonQuestions: [
      {
        q: 'How is this different from the older bladder drugs?',
        a: 'It works on the opposite nerve system. Emptying the bladder is driven by acetylcholine, and every older drug in this indication blocks that. Filling is helped by the sympathetic system relaxing the same muscle through beta-adrenoceptors, and in the human bladder that job is done almost entirely by the beta-3 subtype. Mirabegron switches beta-3 on rather than switching acetylcholine off. Practically, this means no dry mouth, no constipation from the drug itself, no blurred vision, and no contribution to the anticholinergic burden that matters so much in older adults. It also means a different set of cautions: a blood-pressure warning, and an interaction with drugs cleared by CYP2D6.',
      },
      {
        q: 'How much does it actually help?',
        a: 'Between about a third and half an incontinence episode a day more than placebo, consistently, across three trials in more than 6,500 people. In the 50 mg arms, incontinence episodes fell 1.38 to 1.57 a day; on placebo they fell 0.96 to 1.17. Voids per day fell 1.60 to 1.93 against 1.05 to 1.34. Those p-values are convincing and the trials are large, so the effect is real. It is also small, and the fair way to describe it is that it is about the same size as what an antimuscarinic delivers, with a different side-effect profile.',
        auditNote:
          'Every efficacy figure on this page comes from a 12-week trial. The only 12-month randomised study of this drug measured adverse events and had no placebo arm.',
      },
      {
        q: 'Does it raise blood pressure?',
        a: 'The label says it can, and the best measurement of it found nothing. Mirabegron\'s US prescribing information warns about blood pressure, asks for periodic measurement, and quotes mean increases of roughly 0.5 to 1 mmHg over placebo at the 50 mg dose. Its own adverse-event table reports hypertension in 11.3% at 25 mg, 7.5% at 50 mg and 7.6% on placebo — no dose gradient at all. Then 715 patients in the SYNERGY trial wore 24-hour ambulatory blood-pressure monitors, and the analysis found no consistent increase in mean 24-hour systolic or diastolic pressure, no signal in the hourly averages around peak drug levels, and no heart-rate signal. The warning remains on the label. If you have severe uncontrolled hypertension you are outside every dataset described here, and that is the population the label is written for.',
      },
      {
        q: 'I read this drug burns fat. Is that true?',
        a: 'A real experiment produced a real result at a dose nobody is prescribed. Cypess and colleagues gave twelve healthy men 200 mg of mirabegron — four times the maximum licensed dose — and measured brown adipose tissue with PET-CT. All twelve showed increased brown fat activity, and resting metabolic rate rose by 203 calories a day, about 13%. That is a genuine finding and a genuinely interesting one about human physiology. It does not transfer to a 50 mg tablet taken for a bladder. It is also worth knowing that the drug\'s cardiovascular effects scale with dose in the label\'s own data: the QT effect is 3.7 milliseconds at 50 mg and 8.1 at 200 mg.',
        auditNote:
          'Twelve subjects, single dose, healthy young men, four times the approved dose. Each of those four facts limits what the result can be generalised to, and they compound.',
      },
      {
        q: 'Why is a generic drug still nine dollars a tablet?',
        a: 'Because the acquisition-cost file lists only seventeen products for mirabegron, and price in this market tracks the number of suppliers more closely than it tracks anything about the molecule. On the same CMS file, generic solifenacin sits at eighteen cents across forty products, tolterodine at twenty-five cents across fifty-four, and oxybutynin at eight cents across ninety-two. The extended-release formulation is a real technical barrier to entry, which is part of it. What that figure is not is a manufacturing cost — it is what pharmacies pay, and no verifiable per-dose cost-of-production study for this molecule exists to compare it against.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label: 'ARIES — phase 3 placebo-controlled trial of mirabegron in overactive bladder',
        identifier: 'NCT00662909',
        kind: 'nct',
      },
      {
        label:
          'SCORPIO — phase 3 placebo- and tolterodine-controlled trial of mirabegron in overactive bladder',
        identifier: 'NCT00689104',
        kind: 'nct',
      },
      {
        label: 'CAPRICORN — phase 3 placebo-controlled trial of mirabegron 25 mg and 50 mg',
        identifier: 'NCT00912964',
        kind: 'nct',
      },
      {
        label:
          'TAURUS — 12-month randomised active-controlled long-term safety study of mirabegron versus tolterodine ER',
        identifier: 'NCT00688688',
        kind: 'nct',
      },
      {
        label:
          'SYNERGY — solifenacin and mirabegron combination versus each monotherapy and placebo in overactive bladder',
        identifier: 'NCT01972841',
        kind: 'nct',
      },
      {
        label: 'BESIDE — adding mirabegron to solifenacin in incontinent overactive bladder',
        identifier: 'NCT01908829',
        kind: 'nct',
      },
      {
        label:
          'EMPOWUR — phase 3 placebo- and tolterodine-controlled trial of vibegron in overactive bladder',
        identifier: 'NCT03492281',
        kind: 'nct',
      },
      {
        label:
          'Khullar V, Amarenco G, Angulo JC, et al. Efficacy and tolerability of mirabegron, a beta(3)-adrenoceptor agonist, in patients with overactive bladder: results from a randomised European-Australian phase 3 trial. Eur Urol 2013;63:283-295',
        identifier: '10.1016/j.eururo.2012.10.016',
        kind: 'doi',
      },
      {
        label:
          'Chapple CR, Kaplan SA, Mitcheson D, et al. Randomized double-blind, active-controlled phase 3 study to assess 12-month safety and efficacy of mirabegron, a beta(3)-adrenoceptor agonist, in overactive bladder. Eur Urol 2013;63:296-305',
        identifier: '10.1016/j.eururo.2012.10.048',
        kind: 'doi',
      },
      {
        label:
          'Weber MA, Chapple CR, Gratzke C, et al. A strategy utilizing ambulatory monitoring and home and clinic blood pressure measurements to optimize the safety evaluation of noncardiovascular drugs with potential for hemodynamic effects: a report from the SYNERGY trial. Blood Press Monit 2018;23:153-163',
        identifier: '10.1097/MBP.0000000000000320',
        kind: 'doi',
      },
      {
        label:
          'Cypess AM, Weiner LS, Roberts-Toler C, et al. Activation of human brown adipose tissue by a beta3-adrenergic receptor agonist. Cell Metab 2015;21:33-38',
        identifier: '10.1016/j.cmet.2014.12.009',
        kind: 'doi',
      },
      {
        label:
          'Yeowell G, Smith P, Nazir J, Hakimi Z, Siddiqui E, Fatoye F. Real-world persistence and adherence to oral antimuscarinics and mirabegron in patients with overactive bladder: a systematic literature review. BMJ Open 2018;8(11):e021889',
        identifier: '10.1136/bmjopen-2018-021889',
        kind: 'doi',
      },
      {
        label:
          'Wagg A, Nitti VW, Kelleher C, Castro-Diaz D, Siddiqui E, Berner T. Oral pharmacotherapy for overactive bladder in older patients: mirabegron as a potential alternative to antimuscarinics. Curr Med Res Opin 2016;32:621-638',
        identifier: '10.1185/03007995.2016.1149806',
        kind: 'doi',
      },
      {
        label:
          'US prescribing information for mirabegron extended-release tablets — mechanism of action, clinical pharmacology, warnings and precautions, adverse reactions (openFDA drug label endpoint)',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22mirabegron%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 9865528 — mirabegron structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/9865528',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 5. Oxybutynin — approved in 1975, still the cheapest drug in the indication, beaten by
  //    behavioural training in the only trial that compared the two, and the drug whose whole
  //    modern history is a fifty-year attempt to stop its own metabolite reaching the mouth.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'oxybutynin',
    name: 'Oxybutynin',
    tradeName: 'Ditropan XL',
    sponsor: 'Janssen Pharmaceuticals',
    targetGene: 'CHRM3',
    targetProtein:
      'Muscarinic acetylcholine receptors on detrusor smooth muscle, non-selectively across subtypes; the R-enantiomer carries the antimuscarinic activity and the active metabolite N-desethyloxybutynin carries a comparable one',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1975,
    indication:
      'Treatment of overactive bladder with symptoms of urge urinary incontinence, urgency and frequency; and, for the extended-release tablet, of detrusor overactivity associated with a neurological condition in children aged 6 years and over. A transdermal form is sold over the counter to women in the United States.',
    patientFriendlyIndication:
      'An overactive bladder — sudden urgency, going far too often, and leaking — treated with the oldest and cheapest drug available for it',
    anatomicalSite:
      'Detrusor smooth muscle of the bladder wall; and, unavoidably, the salivary glands, gut, eye and brain',
    conditionContext: {
      conditionExplainer:
        'Oxybutynin reached the market in 1975, before overactive bladder existed as a named condition, before the three-day bladder diary was a standard endpoint, and before any regulator asked for a placebo-controlled trial in this indication. Its modern efficacy data come from studies run twenty-five years later to register a new formulation.',
      whyItMatters:
        'That history explains the shape of the evidence. There is no large modern placebo-controlled trial of plain immediate-release oxybutynin, the form most prescriptions are written for, because none was ever required. What exists is a comparison of the extended-release tablet against placebo, and comparisons of every newer formulation against the immediate-release one.',
      whoTakesThis:
        'Anyone for whom cost is the deciding factor, which in practice means a very large number of older adults — the group in whom the anticholinergic-burden evidence is strongest and in whom this particular molecule crosses into the brain most readily.',
      clinicalGoals:
        'Fewer incontinence episodes and fewer voids on a diary. What the drug is chosen for, in most systems, is that it costs about eight cents a dose.',
    },
    oneSentenceVerdict:
      'A non-selective muscarinic antagonist from 1975 whose extended-release tablet removed 15.8 urge incontinence episodes a week against 7.6 on placebo, and whose entire subsequent development history — extended release, transdermal patch, topical gel — exists to keep its own active metabolite out of the salivary gland, where the immediate-release form produces dry mouth in 72.4% of patients against 34.9% for the extended-release version.',
    laymanHowItWorks:
      'The bladder wall contracts when acetylcholine lands on muscarinic receptors in it, and oxybutynin blocks those receptors so the contraction is blunted. It is not selective about which muscarinic receptors it blocks, and it is not selective about which organ it does it in. When the tablet is swallowed, the liver converts much of it into a second compound, N-desethyloxybutynin, which is about as active as the drug itself and reaches the salivary glands in quantity — which is why the immediate-release tablet dries out roughly seven patients in ten. Every newer version of this drug, from the once-daily tablet to the skin patch, is an attempt to get the drug into the body without going through that conversion step.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 55,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0817 per unit at United States pharmacy acquisition cost (CMS NADAC, generic, median across 92 listed products, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States in 1975 and off patent for decades, with ninety-two products in the acquisition-cost file — the most crowded generic market of any drug in this group, and the reason the median sits at eight cents. The transdermal system for women was switched to over-the-counter sale in the United States and is priced separately.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Everything else in this indication is more expensive and less anticholinergic, in roughly that order. Solifenacin is about twice the price and produces dry mouth in a third as many patients. Trospium carries a permanent charge and crosses into the brain poorly. Mirabegron does not touch the acetylcholine system at all and costs over a hundred times as much. And in the only randomised trial that pitted this drug against structured behavioural training, the training won.',
      conventionalRx: [
        {
          name: 'Solifenacin (Vesicare)',
          class: 'M3-preferring muscarinic antagonist',
          howItCompares:
            'Newer, subtype-preferring and once daily. Dry mouth at the 5 mg dose is 10.9% against placebo 4.2%, where immediate-release oxybutynin reaches 72.4% and extended-release 34.9%. The diary effect is not obviously larger: solifenacin 5 mg removed 1.79 incontinence episodes a day against placebo 1.34 in the SYNERGY trial.',
          typicalCost:
            'US$0.1754 per tablet at United States pharmacy acquisition cost (CMS NADAC, generic, median across 40 listed products, effective 19 August 2026)',
          prosAndCons:
            'Pros: a third of the dry mouth of even the extended-release oxybutynin, once-daily dosing. Cons: twice the acquisition cost, and it sits inside the same class-level anticholinergic signal.',
        },
        {
          name: 'Trospium chloride (Sanctura)',
          class: 'Quaternary ammonium muscarinic antagonist',
          howItCompares:
            'A permanently charged molecule, which crosses the blood-brain barrier poorly by design. Oxybutynin is the opposite: lipophilic, tertiary, and the antimuscarinic most often singled out in the cognitive literature. No randomised trial has compared cognitive outcomes between the two.',
          typicalCost:
            'US$0.2121 per tablet at United States pharmacy acquisition cost (CMS NADAC, generic, median across 16 listed products, effective 19 August 2026)',
          prosAndCons:
            'Pros: designed not to reach the brain. Cons: two and a half times the cost, absorption cut substantially by food, and the central-nervous-system advantage is pharmacological reasoning rather than a measured outcome.',
        },
        {
          name: 'Mirabegron (Myrbetriq)',
          class: 'Beta-3 adrenergic agonist',
          howItCompares:
            'A different receptor entirely, so it contributes nothing to anticholinergic burden and produces dry mouth at close to placebo rates. Its diary effect is of the same order: incontinence episodes fell 1.38 to 1.57 a day at 50 mg against 0.96 to 1.17 on placebo across three trials.',
          typicalCost:
            'US$9.60 per tablet at United States pharmacy acquisition cost (CMS NADAC, generic, median across 17 listed products, effective 19 August 2026)',
          prosAndCons:
            'Pros: no anticholinergic load at all, and roughly double the one-year persistence. Cons: about a hundred and twenty times the acquisition cost of oxybutynin, plus a blood-pressure warning and a CYP2D6 interaction.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Structured behavioural training, taught rather than handed out',
          action:
            'Pelvic floor muscle exercises with biofeedback plus urge-suppression strategy, delivered over several supervised sessions.',
          patientImpact:
            'In a randomised trial of 197 community-dwelling women aged 55 and over, behavioural training reduced incontinence episodes by a mean of 80.7%, oxybutynin by 68.5% (P=.04 for the comparison) and placebo by 39.4%. Patient-perceived improvement was "much better" in 74.1% of the behavioural group against 50.9% on the drug. Only 14.0% of the behavioural group wanted to change treatment, against 75.5% of the drug group.',
          clinicalPrecaution:
            'A later extension of the same programme found that adding one to the other helped further: among patients not satisfied with a single treatment, combining them improved reduction from 57.5% to 88.5% in one group and from 72.7% to 84.3% in another. These are not mutually exclusive options.',
        },
        {
          name: 'Count the anticholinergic drugs you are already taking, not just this one',
          action:
            'Antihistamines, tricyclic antidepressants and several other common classes carry the same activity, and the evidence associates the cumulative total rather than any single prescription with harm.',
          patientImpact:
            'In a prospective cohort of 3,434 people aged 65 and over followed a mean 7.3 years, the adjusted hazard ratio for incident dementia rose to 1.54 (95% CI 1.21 to 1.96) in those with more than 1,095 total standardised daily doses of strong anticholinergics over ten years, against nonusers, with a significant dose-response trend (P<.001). Bladder antimuscarinics were among the three commonest classes contributing.',
          clinicalPrecaution:
            'The study excluded the most recent twelve months of use specifically to reduce the chance that early dementia symptoms were driving the prescriptions. That design choice strengthens the finding without making it a trial.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CCN(CC)CC#CCOC(=O)C(C1CCCCC1)(C2=CC=CC=C2)O',
      chemicalFormula: 'C22H31NO3',
      molecularWeight: '357.50 g/mol (free base); dispensed as oxybutynin chloride',
      targetReceptorAffinity:
        'Non-selective muscarinic antagonism. The US label describes the pharmacology in two separate clauses — the drug "relaxes bladder smooth muscle" and "inhibits the muscarinic action of acetylcholine on smooth muscle" — a wording that preserves the historical claim of a direct spasmolytic action alongside receptor blockade. The molecule is supplied as a racemate and the R-enantiomer carries the antimuscarinic activity. Its principal metabolite, N-desethyloxybutynin, is described by the label as having pharmacological activity similar to the parent in vitro, which is the single most consequential fact about this drug: first-pass metabolism generates a second active antimuscarinic in quantity.',
      structureSource: {
        label: 'PubChem CID 4634 — oxybutynin structure, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4634',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'oxy-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity and purity of the tertiary glycolic acid, with no chiral specification',
          description:
            'Confirm identity and purity of 2-cyclohexyl-2-hydroxy-2-phenylacetic acid and of 4-(diethylamino)but-2-yn-1-ol before esterification. There is deliberately no enantiomeric-excess step here: oxybutynin is manufactured and sold as the racemate, and the single-enantiomer version was pursued separately and never displaced it. Recording an absent specification is as much a QC decision as recording a present one.',
          reagentsAndBuffer:
            'Reversed-phase HPLC with UV detection at 210 nm, gas chromatography for residual solvents in the alkynol, Karl Fischer titration, nuclear magnetic resonance for identity confirmation',
        },
        {
          id: 'oxy-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Esterification of the glycolic acid with the aminoalkynol',
          description:
            'Form the ester bond between the tertiary alcohol-bearing acid and the propargylic alcohol carrying the diethylamino group. The alkyne in the middle of the chain is the structural feature that distinguishes this molecule from the simpler antispasmodics of the same era, and it survives the reaction untouched.',
          dependsOnStepId: 'oxy-w1',
          reagentsAndBuffer:
            'Acid chloride formation with thionyl chloride or direct coupling with a carbodiimide, 4-dimethylaminopyridine catalyst, triethylamine base, anhydrous toluene or dichloromethane under nitrogen',
        },
        {
          id: 'oxy-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Hydrochloride salt formation and control of the hydrolysis products',
          description:
            'Precipitate the hydrochloride and recrystallise. The ester bond is the vulnerable point of the molecule, so the specification is written around the free glycolic acid and the free aminoalkynol as hydrolysis markers, and stability testing follows the same two analytes.',
          dependsOnStepId: 'oxy-w2',
          reagentsAndBuffer:
            'Hydrogen chloride in 2-propanol or ethyl acetate, activated charcoal, reversed-phase HPLC with gradient elution for related substances, accelerated stability chambers at 40 degrees Celsius and 75% relative humidity',
        },
        {
          id: 'oxy-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Parallel application of parent drug and N-desethyl metabolite to each muscarinic subtype',
          description:
            'Apply oxybutynin and, in parallel wells, synthesised N-desethyloxybutynin to five stable lines carrying human CHRM1 through CHRM5. Testing the parent alone would misdescribe what a patient is exposed to after an oral dose, because first-pass metabolism means the metabolite reaches the tissue in comparable quantity. This is the assay design that explains why a transdermal route changes the side-effect profile without changing the molecule.',
          dependsOnStepId: 'oxy-w3',
          reagentsAndBuffer:
            'CHO or HEK293 lines stably expressing human CHRM1 to CHRM5, DMEM with 10% fetal bovine serum, geneticin selection, HEPES-buffered assay saline at pH 7.4, authentic N-desethyloxybutynin reference standard',
        },
        {
          id: 'oxy-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Radioligand competition, calcium readout, and a salivary-gland comparison arm',
          description:
            'Measure displacement of a labelled muscarinic antagonist at each subtype for both compounds, then measure blockade of carbachol-evoked calcium to confirm functional antagonism. Running a salivary acinar preparation alongside the detrusor readout is what turns the dry-mouth rate from an observed adverse-event percentage into a predicted, mechanistically explained one.',
          dependsOnStepId: 'oxy-w4',
          reagentsAndBuffer:
            'Tritiated N-methylscopolamine as radioligand, atropine for non-specific binding, GF/B filter plates, Fluo-4 AM calcium indicator, carbachol as agonist, isolated rodent submandibular acinar cells or a human salivary gland cell line as the comparison tissue',
        },
      ],
    },
    keyAudits: [
      {
        id: 'oxy-a1',
        category: 'measured',
        title: 'Immediate release dries the mouth in 72.4% of patients; extended release in 34.9%',
        laymanSummary:
          'The cheapest and most-prescribed form of this drug gives roughly seven patients in ten a dry mouth. The once-daily version halves that. Same molecule, same dose range — only the release rate differs.',
        technicalDetails:
          'The US label for the extended-release tablet reports pooled adverse events against an immediate-release comparator arm. Dry mouth: 34.9% on extended release (n=774) against 72.4% on immediate release (n=199). Constipation 8.7% against 15.1%. Somnolence 5.6% against 14.1%. Dizziness 5.0% against 16.6%. Blurred vision 4.3% against 9.6%. Every one of those is roughly halved or better. The mechanism is first-pass metabolism: swallowing a rapidly dissolving tablet delivers a bolus to the liver, which converts a large fraction into N-desethyloxybutynin, an active antimuscarinic that the label states has similar in vitro activity to the parent. Slowing the release moves absorption further down the gut and changes the parent-to-metabolite ratio. The clinical consequence of a pharmacokinetic decision is a 37-percentage-point difference in whether a patient can taste their food.',
        evidenceSource:
          'US prescribing information for oxybutynin chloride extended-release tablets, Adverse Reactions and Clinical Pharmacology sections (openFDA drug label endpoint)',
        measuredMetric:
          'Incidence of dry mouth, constipation, somnolence, dizziness and blurred vision, extended release versus immediate release',
        auditFlag: 'verified',
      },
      {
        id: 'oxy-a2',
        category: 'failed',
        title: 'Behavioural training beat this drug, and the drug group wanted out',
        laymanSummary:
          'The only randomised trial to compare a bladder drug against structured behavioural training used oxybutynin, and the training won. Three quarters of the people on the drug wanted to switch to something else. One in seven of the training group did.',
        technicalDetails:
          'Burgio and colleagues randomised 197 community-dwelling women aged 55 and over with persistent urge incontinence to behavioural training, oxybutynin, or placebo. Behavioural training reduced incontinence episodes by a mean of 80.7%, significantly more than the drug at 68.5% (P=.04), and both beat placebo at 39.4% (P<.001 and P=.009). Patient-perceived improvement of "much better" was reported by 74.1% of the behavioural group against 50.9% on the drug and 26.9% on placebo. The most telling number is the last: 14.0% of the behavioural group wanted to change to another treatment, against 75.5% in each of the other two groups. Note what that means — three quarters of the drug group and three quarters of the placebo group wanted out, at the same rate, despite a real difference in diary outcomes between them.',
        evidenceSource: 'Burgio KL et al., JAMA 1998;280:1995-2000 (PMID 9863850)',
        doi: '10.1001/jama.280.23.1995',
        measuredMetric:
          'Percentage reduction in incontinence episodes and proportion wanting to change treatment, by randomised arm',
        auditFlag: 'verified',
      },
      {
        id: 'oxy-a3',
        category: 'measured',
        title: 'Against placebo the extended-release tablet is worth about one episode a day',
        laymanSummary:
          'In the trial that registered the once-daily tablet, patients on the drug had 15.8 fewer weekly leaks and patients on placebo had 7.6 fewer. That is a real difference of about eight leaks a week, or a bit over one a day.',
        technicalDetails:
          'The Clinical Studies section of the extended-release label reports urge urinary incontinence episodes falling 15.8 per week on the drug against 7.6 per week on placebo. Converted to the units the rest of this class reports in, that is 2.26 against 1.09 episodes per 24 hours — a treatment effect of about 1.17 episodes a day, at the upper end of what any drug in this indication has shown. Two things qualify it. The placebo arm still accounts for nearly half the total movement. And no comparable modern placebo-controlled trial exists for the immediate-release tablet, which is the form most prescriptions in this class are actually written for, because it was approved in 1975 and never had to produce one.',
        evidenceSource:
          'US prescribing information for oxybutynin chloride extended-release tablets, Clinical Studies section (openFDA drug label endpoint)',
        measuredMetric: 'Change in weekly urge urinary incontinence episodes against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'oxy-a4',
        category: 'measured',
        title: 'The topical gel beat placebo by half an episode a day, and placebo took away 2.5',
        laymanSummary:
          'A 789-patient trial of oxybutynin skin gel found the drug removed 3.0 leaks a day and the placebo gel removed 2.5. Almost all the improvement people felt came from something other than the drug.',
        technicalDetails:
          'Study OG05009 (NCT00350636), sponsored by Watson Pharmaceuticals, randomised 789 patients to oxybutynin topical gel (n=389) or placebo gel (n=400) for 12 weeks, with change in average daily incontinence episodes as the primary endpoint. The reported result was -3.0 (SD 2.73) on drug against -2.5 (SD 3.06) on placebo. That is the largest placebo response of any trial on this page, and the smallest absolute margin. Large placebo responses are characteristic of applied-to-the-skin interventions in symptom-diary conditions, which is a reason to read the difference rather than the change, and a reason to distrust any presentation of this trial that quotes only the -3.0.',
        evidenceSource: 'ClinicalTrials.gov results record, OG05009, NCT00350636',
        measuredMetric:
          'Change from baseline to week 12 in average daily incontinence episodes, gel versus placebo gel',
        auditFlag: 'verified',
      },
      {
        id: 'oxy-a5',
        category: 'inferred',
        title: 'The dementia association is dose-graded and this is the molecule most implicated',
        laymanSummary:
          'A ten-year study of 3,434 older adults found that the more anticholinergic medicine someone had taken, the higher their chance of a later dementia diagnosis. Oxybutynin is the most brain-penetrating drug in this class.',
        technicalDetails:
          'Gray and colleagues followed 3,434 people aged 65 and over with no dementia at entry for a mean 7.3 years, using computerised dispensing records to compute total standardised daily doses over the preceding ten years and excluding the most recent twelve months to reduce reverse causation. Dementia developed in 797 (23.2%). Adjusted hazard ratios against nonuse were 0.92 (95% CI 0.74 to 1.16) at 1 to 90 TSDDs, 1.19 (0.94 to 1.51) at 91 to 365, 1.23 (0.94 to 1.62) at 366 to 1,095, and 1.54 (1.21 to 1.96) above 1,095, with a significant trend (P<.001). Bladder antimuscarinics were among the three most-used classes. Coupland and colleagues later reported an adjusted odds ratio of 1.65 (1.56 to 1.75) for bladder antimuscarinics specifically. Oxybutynin is tertiary, lipophilic and the most readily brain-penetrating of the class, so the pharmacology points the same way as the epidemiology — but no randomised trial in this indication has ever been powered for a cognitive endpoint, and none is likely to be.',
        evidenceSource:
          'Gray SL et al., JAMA Intern Med 2015;175:401-407 (PMID 25621434); Coupland CAC et al., JAMA Intern Med 2019;179:1084-1093 (PMID 31233095)',
        doi: '10.1001/jamainternmed.2014.7663',
        inferredClaim:
          'That oxybutynin specifically causes dementia — the cohort data are for cumulative anticholinergic exposure across all classes, and the singling out of this molecule rests on its lipophilicity rather than on a drug-specific randomised result',
        auditFlag: 'contested',
      },
      {
        id: 'oxy-a6',
        category: 'failed',
        title: 'The over-the-counter study found half the users applied the patch wrongly',
        laymanSummary:
          'Before the transdermal form was sold without a prescription, a study watched 855 real consumers use it. Over half used it incorrectly, and one in seven kept using it after developing a symptom the label told them to stop for.',
        technicalDetails:
          'The Oxytrol Transdermal System Actual Use Study (NCT04534491, sponsored by Bayer) enrolled 855 participants in a single-group, unmasked design. The registered primary outcome was the percentage who did not stop use when they developed a new symptom named in the labelling or when their condition worsened, including abdominal or pelvic pain: 14.4% (95% CI 12.0 to 17.2) of 727 participants pre-mitigation, falling to 3.4% (2.2 to 5.0) after mitigating factors such as physician contact were accounted for. Patch misuse — wrong duration or simultaneous application of more than one — was 51.7% pre-mitigation and 21.2% post-mitigation. Among 324 participants who continued despite concerning symptoms, 16 were assessed as facing medical risk and 24 possible risk. The switch went ahead. The finding that half the participants misused the product is a real, measured, published result about how this drug is used outside a clinic, and it exists because a regulator required it.',
        evidenceSource: 'ClinicalTrials.gov results record, Oxytrol Actual Use Study, NCT04534491',
        measuredMetric:
          'Percentage misusing the transdermal system and percentage continuing use despite labelled warning symptoms',
        auditFlag: 'caution',
      },
      {
        id: 'oxy-a7',
        category: 'conclusion_shift',
        title: 'A 1975 drug whose efficacy evidence was assembled in the 2000s for a newer tablet',
        laymanSummary:
          'Oxybutynin was approved half a century ago, under a standard of evidence that no longer exists. The placebo-controlled numbers on its label today come from studies run decades later to register the once-daily version.',
        technicalDetails:
          'The immediate-release tablet reached the US market in 1975. Overactive bladder as a defined syndrome, the standardised three-day bladder diary, and the regulatory expectation of a placebo-controlled trial with a diary primary endpoint all postdate it. The efficacy data now quoted for oxybutynin — the 15.8 against 7.6 weekly urge incontinence episodes — come from the extended-release registration programme, and the comparisons that establish the immediate-release form\'s effect are non-inferiority comparisons against that newer product rather than against placebo. The direction of inference is backwards from the usual one: the old drug\'s efficacy is supported by the new formulation\'s trials, and the new formulation\'s advantage is supported by a tolerability comparison against the old drug.',
        evidenceSource:
          'US prescribing information for oxybutynin chloride extended-release tablets, Clinical Studies and Adverse Reactions sections; approval year as held on this record',
        measuredMetric:
          'Provenance of the placebo-controlled efficacy figures carried on the current US label',
        inferredClaim:
          'That immediate-release oxybutynin has a demonstrated placebo-controlled effect of the size quoted on the extended-release label',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed — and immediately half-converted into something else',
        laymanDesc:
          'A tablet goes through the liver before it reaches the rest of the body, and the liver turns much of this drug into a second compound that is just as active. That second compound is the source of most of the dry mouth.',
        molecularDetail:
          'Extensive first-pass metabolism, principally by CYP3A4, generates N-desethyloxybutynin, which the label describes as having pharmacological activity similar to the parent in vitro. Extended-release, transdermal and topical gel formulations all exist to alter the parent-to-metabolite ratio rather than to alter the molecule. The extended-release tablet halves the dry-mouth rate on that basis alone.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It reaches the bladder wall — and everywhere else, including the brain',
        laymanDesc:
          'The target is on the outside of the muscle cell, so nothing needs to be carried inside. But this particular molecule is fat-soluble and uncharged, so it also passes into the brain more readily than newer drugs in its class.',
        molecularDetail:
          'Muscarinic receptors are plasma-membrane G-protein-coupled receptors with an outward-facing binding pocket; no transporter step is required. Oxybutynin is a lipophilic tertiary amine, in contrast to the quaternary, permanently charged trospium, and blood-brain barrier penetration follows from that difference in physical chemistry. This is the structural basis of the class cognitive concern, and the reason oxybutynin is the molecule most often named in it.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It blocks acetylcholine at every muscarinic receptor it meets',
        laymanDesc:
          'Newer drugs try to prefer the receptor subtype the bladder uses. This one does not distinguish. It blocks the signal in the bladder, the salivary gland, the gut and the eye at the same time.',
        molecularDetail:
          'Non-selective competitive muscarinic antagonism, with the R-enantiomer of the racemate carrying the activity. The label additionally preserves a direct smooth-muscle relaxant claim alongside receptor blockade, wording that dates from an era when antispasmodics were characterised functionally rather than by receptor pharmacology.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The calcium signal that drives the squeeze is blunted',
        laymanDesc:
          'A bladder contraction needs a burst of calcium inside the muscle cell. With the receptors occupied, that burst is smaller and the involuntary squeeze during filling is weaker.',
        molecularDetail:
          'Loss of M3-Gq/11 coupling reduces phospholipase C activity, inositol trisphosphate falls, sarcoplasmic reticulum calcium release drops and myosin light-chain phosphorylation declines. The identical cascade is interrupted in salivary acinar cells, where the consequence is not relaxation but a failure to secrete — which is what a 72.4% dry-mouth rate looks like at the molecular level.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'About one fewer leak a day, at eight cents a dose',
        laymanDesc:
          'The once-daily tablet removes roughly one more leak a day than placebo. It costs about eight cents. Those two facts together are why it is still one of the most prescribed drugs in the indication fifty years after approval.',
        molecularDetail:
          'Urge incontinence episodes fell 15.8 per week on extended-release oxybutynin against 7.6 on placebo, equivalent to 2.26 against 1.09 per 24 hours. Median United States pharmacy acquisition cost is US$0.0817 per unit across ninety-two listed products. The cost of that effect is a dry-mouth rate of 34.9% on the extended-release form and 72.4% on the immediate-release one, plus membership of the drug class with the strongest observational cognitive signal.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Oxybutynin topical gel pivotal study OG05009 (NCT00350636)',
        phase: 'Phase 3 randomised double-blind placebo-controlled, 12 weeks',
        sampleSize: 789,
        primaryEndpoint:
          'Change from baseline to week 12 in average daily number of incontinence episodes',
        endpointMet: true,
        statisticalPValue:
          'Oxybutynin gel -3.0 (SD 2.73) against placebo gel -2.5 (SD 3.06); the results record does not carry a p-value for the primary comparison',
        unreportedAdverseSignals:
          'The placebo gel arm removed 2.5 incontinence episodes a day. That is the largest placebo response of any trial on this page and it leaves a drug-attributable margin of 0.5 episodes.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Behavioural versus drug treatment for urge incontinence (Burgio 1998)',
        phase: 'Randomised controlled trial, three arms, 8 weeks per treatment phase',
        sampleSize: 197,
        primaryEndpoint: 'Percentage reduction in incontinence episodes from bladder diaries',
        endpointMet: false,
        statisticalPValue:
          'Behavioural 80.7% versus drug 68.5%, P=.04; both versus placebo 39.4%, P<.001 and P=.009',
        unreportedAdverseSignals:
          '75.5% of the oxybutynin group wanted to change to another treatment, the same proportion as in the placebo group, against 14.0% of the behavioural group. `endpointMet: false` records that the drug arm lost the head-to-head comparison, not that the trial failed.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Oxytrol Transdermal System Actual Use Study (NCT04534491)',
        phase: 'Phase 3 single-group open-label consumer actual-use study',
        sampleSize: 855,
        primaryEndpoint:
          'Percentage of participants who did not stop use when they developed a new symptom named in the labelling or when their condition worsened',
        endpointMet: false,
        statisticalPValue:
          '14.4% (95% CI 12.0 to 17.2) pre-mitigation and 3.4% (2.2 to 5.0) post-mitigation of 727 evaluable participants',
        unreportedAdverseSignals:
          'Patch misuse — wrong duration or more than one applied at once — was 51.7% pre-mitigation and 21.2% post-mitigation. Of 324 continuing despite concerning symptoms, 16 were assessed as at medical risk and 24 at possible risk.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Oxybutynin extended-release registration programme (US label, Study 1)',
        phase: 'Randomised double-blind placebo-controlled',
        sampleSize: 774,
        primaryEndpoint: 'Change in weekly urge urinary incontinence episodes against placebo',
        endpointMet: true,
        statisticalPValue:
          'Urge incontinence episodes fell 15.8 per week on extended-release oxybutynin against 7.6 on placebo; the label reports the arm values without a p-value in the extracted text',
        unreportedAdverseSignals:
          'The sample size given is the pooled safety population of 774 for the extended-release arm reported in the Adverse Reactions table, not a per-study randomised total. No equivalent placebo-controlled trial exists for the immediate-release tablet.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Dry mouth in 72.4% on immediate-release oxybutynin against 34.9% on extended release, with dizziness 16.6% against 5.0% and somnolence 14.1% against 5.6%',
        'Urge incontinence episodes fell 15.8 per week on extended release against 7.6 per week on placebo',
        'Oxybutynin topical gel removed 3.0 incontinence episodes a day against 2.5 on placebo gel in 789 patients',
        'Behavioural training reduced incontinence episodes 80.7% against 68.5% for oxybutynin (P=.04) and 39.4% for placebo',
        '51.7% of 855 consumers misused the over-the-counter transdermal system before mitigation was applied',
        'Cumulative strong-anticholinergic exposure above 1,095 total standardised daily doses carried an adjusted hazard ratio for dementia of 1.54 (95% CI 1.21 to 1.96)',
      ],
      unsupportedInferences: [
        'That the immediate-release tablet has the placebo-controlled effect size quoted on the extended-release label — the placebo comparison was run on the newer formulation',
        'That oxybutynin specifically causes dementia — the cohort evidence is for cumulative anticholinergic exposure across all classes, and this molecule is singled out on lipophilicity rather than on a drug-specific trial',
        'That a 3.0-episode-a-day reduction on topical gel is a drug effect — 2.5 of it occurred on placebo gel',
        'That over-the-counter availability implies the drug is used as labelled — the study run to answer that question found otherwise',
      ],
      whatFailedInitially: [
        'The head-to-head against behavioural training, which oxybutynin lost on both the diary endpoint and on how many patients wanted to stop',
        'The immediate-release formulation\'s tolerability, which drove fifty years of reformulation rather than replacement',
        'Correct use of the over-the-counter patch, misapplied by half the consumers studied before mitigation',
      ],
      realWorldOutcome: [
        'Eight cents a dose across ninety-two listed products — the cheapest option in the indication by a wide margin',
        'Still among the most prescribed bladder drugs worldwide, and the one most frequently named in anticholinergic-burden guidance for older adults',
        'The only drug in this indication available over the counter in the United States, in a transdermal form sold to women without a prescription',
      ],
    },
    deliverySystem: {
      type: 'Oral immediate-release tablet and syrup, oral extended-release tablet, transdermal system, and topical gel',
      description:
        'Four routes for one molecule, and the reason for all of them is the same: avoiding or reducing first-pass conversion to N-desethyloxybutynin. The extended-release tablet slows absorption; the transdermal system and topical gel bypass the gut and liver entirely. None of them changes the drug. The extended-release tablet is swallowed whole and its non-absorbable shell may be visible in the stool, which is expected rather than a treatment failure.',
      safetyProfile:
        'Anticholinergic effects dominate and are dose- and formulation-dependent: dry mouth, constipation, blurred vision, somnolence and dizziness. Because the molecule is lipophilic and enters the central nervous system, confusion and cognitive impairment are described particularly in older adults, and this is the antimuscarinic most often named in anticholinergic-burden guidance. Heat-related risk is real, because sweating is a cholinergic function. Urinary retention, decreased gastrointestinal motility and caution in narrow-angle glaucoma appear as they do across the class.',
    },
    commonQuestions: [
      {
        q: 'Why does the once-a-day version cost more but dry my mouth less?',
        a: 'Because of what happens on the way in, not what the drug does when it arrives. A fast-dissolving tablet delivers a slug of drug to the liver, which converts a large part of it into a second compound, N-desethyloxybutynin, that is about as antimuscarinic as the original. That metabolite reaches the salivary glands in quantity. Slowing the release changes where and how much absorption happens and shifts that balance. The measured consequence in the label\'s own tables is dry mouth in 72.4% on immediate release against 34.9% on extended release, with dizziness falling from 16.6% to 5.0% and somnolence from 14.1% to 5.6%. Same molecule, same dose range, different delivery.',
        auditNote:
          'This is the rare case where a formulation change is the clinically significant innovation and the molecule is unchanged. The skin patch and the gel exist for the same reason.',
      },
      {
        q: 'Is there anything that works better than this drug?',
        a: 'In the one randomised trial that asked, yes. Burgio and colleagues randomised 197 women aged 55 and over to structured behavioural training, to oxybutynin, or to placebo. Behavioural training cut incontinence episodes by 80.7%, oxybutynin by 68.5% — a statistically significant difference at P=.04 — and placebo by 39.4%. The most striking result was not the diary: 75.5% of the drug group wanted to change to a different treatment by the end, exactly the same proportion as the placebo group, against 14.0% of the training group. A later extension found that combining the two helped patients who were unsatisfied with either alone. Behavioural training here meant several supervised sessions with biofeedback, not a leaflet.',
      },
      {
        q: 'Should I worry about this drug and memory?',
        a: 'It is the honest thing to raise with a prescriber, and it is not settled. A prospective cohort of 3,434 people aged 65 and over, followed a mean of 7.3 years, found the risk of a later dementia diagnosis rose with total anticholinergic exposure over the preceding decade: hazard ratio 1.54 (95% CI 1.21 to 1.96) for the highest exposure group against nonusers, with a clear dose-response trend. The study deliberately ignored the most recent year of prescriptions to reduce the chance that early symptoms were causing the prescribing. Oxybutynin is the most fat-soluble drug in its class and therefore the one that enters the brain most readily, which makes it the molecule most often singled out — but that singling out is pharmacological reasoning, not a drug-specific trial result. No randomised trial in this indication has ever been powered for a cognitive endpoint.',
        auditNote:
          'What the evidence supports is counting the total anticholinergic load across all a person\'s prescriptions. What it does not support is a claim about this one tablet in isolation.',
      },
      {
        q: 'The patch is sold without a prescription. Does that mean it is safer?',
        a: 'It means a regulator judged that consumers could select and use it appropriately, and the study run to test that is public. Bayer enrolled 855 consumers in an actual-use study. Before mitigating factors were counted, 14.4% continued using the patch after developing a symptom the labelling told them to stop for, and 51.7% used it incorrectly — wrong duration, or more than one patch at a time. After accounting for mitigation such as physician contact, those figures fell to 3.4% and 21.2%. Of 324 people who kept going despite concerning symptoms, 16 were assessed as facing medical risk. The switch to over-the-counter went ahead on that evidence. Over-the-counter status describes a regulatory judgement about self-selection, not a lower pharmacological risk: it is the same anticholinergic drug.',
      },
      {
        q: 'Why does this page not show a manufacturing cost?',
        a: 'Because no per-dose cost-of-production figure for oxybutynin could be verified and cited. The cost-of-production literature checked here publishes an estimation method and aggregate ranges rather than a per-dose figure for this molecule. What is shown instead is what pharmacies pay — about eight cents a unit in the CMS acquisition-cost survey, across ninety-two listed products — which is a price, not a cost of manufacture. It is the lowest figure on any page in this group, and the number of listed suppliers is the reason.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Burgio KL, Locher JL, Goode PS, Hardin JM, McDowell BJ, Dombrowski M, Candib D. Behavioral vs drug treatment for urge urinary incontinence in older women: a randomized controlled trial. JAMA 1998;280:1995-2000',
        identifier: '10.1001/jama.280.23.1995',
        kind: 'doi',
      },
      {
        label:
          'Burgio KL, Locher JL, Goode PS. Combined behavioral and drug therapy for urge incontinence in older women. J Am Geriatr Soc 2000;48:370-374',
        identifier: '10.1111/j.1532-5415.2000.tb04692.x',
        kind: 'doi',
      },
      {
        label:
          'Gray SL, Anderson ML, Dublin S, et al. Cumulative use of strong anticholinergics and incident dementia: a prospective cohort study. JAMA Intern Med 2015;175:401-407',
        identifier: '10.1001/jamainternmed.2014.7663',
        kind: 'doi',
      },
      {
        label:
          'Coupland CAC, Hill T, Dening T, Morriss R, Moore M, Hippisley-Cox J. Anticholinergic drug exposure and the risk of dementia: a nested case-control study. JAMA Intern Med 2019;179:1084-1093',
        identifier: '10.1001/jamainternmed.2019.0677',
        kind: 'doi',
      },
      {
        label:
          'OG05009 — placebo-controlled trial of oxybutynin topical gel for overactive bladder',
        identifier: 'NCT00350636',
        kind: 'nct',
      },
      {
        label:
          'Oxytrol Transdermal System Actual Use Study — consumer self-selection and use of the over-the-counter patch',
        identifier: 'NCT04534491',
        kind: 'nct',
      },
      {
        label:
          'US prescribing information for oxybutynin chloride extended-release tablets — mechanism of action, clinical pharmacology, clinical studies and adverse reactions (openFDA drug label endpoint)',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22oxybutynin+chloride%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 4634 — oxybutynin structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4634',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 6. Tolterodine — the drug everyone else's trial uses as the yardstick, which twice failed to
  //    beat placebo in trials of over fifteen hundred patients, and whose own manufacturer
  //    developed its active metabolite into a separate product and then beat it with it.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'tolterodine',
    name: 'Tolterodine',
    tradeName: 'Detrol',
    sponsor: 'Upjohn',
    targetGene: 'CHRM3',
    targetProtein:
      'Postganglionic muscarinic acetylcholine receptors, non-selectively across subtypes; the active moiety in most people is the CYP2D6-derived metabolite 5-hydroxymethyl tolterodine rather than the parent drug',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1998,
    indication:
      'Treatment of overactive bladder with symptoms of urge urinary incontinence, urgency and frequency.',
    patientFriendlyIndication:
      'An overactive bladder — sudden urgency, going too often, and leaking before you reach the toilet',
    anatomicalSite:
      'Detrusor smooth muscle of the bladder wall, and the salivary glands where the same receptor sits',
    conditionContext: {
      conditionExplainer:
        'Tolterodine was the first antimuscarinic designed specifically for the bladder rather than inherited from general antispasmodic use, and it became the default comparator for everything that followed. Almost every large trial in this indication since 2008 has included a tolterodine arm as the active control.',
      whyItMatters:
        'That makes tolterodine the most independently tested drug in the class, and the results are not what a decade of prescribing implies. In two separate large trials run by other companies, the tolterodine arm could not be distinguished from placebo. In two trials run by its own manufacturer, it beat placebo by 0.12 and 0.15 incontinence episodes per 24 hours.',
      whoTakesThis:
        'Adults with overactive bladder, and — in a much larger number — trial participants randomised to it as the yardstick against which a newer drug is being measured.',
      clinicalGoals:
        'Fewer incontinence episodes and fewer voids on a diary, and a larger volume passed each time. The label reports all three, and all three margins over placebo are small.',
    },
    oneSentenceVerdict:
      'A non-selective muscarinic antagonist that is mostly a delivery vehicle for its own metabolite: its US label reports 11.8 fewer weekly incontinence episodes against 6.9 on placebo and 1.8 fewer daily voids against 1.2, yet as the active control in other companies\' trials it failed to separate from placebo in SCORPIO (p=0.11 on both endpoints, n=2,336) and missed on micturitions in EMPOWUR (p=0.0988, n=1,530).',
    laymanHowItWorks:
      'Tolterodine blocks the receptors that acetylcholine uses to tell the bladder wall to contract, so the involuntary squeeze while the bladder is filling is weakened. The twist is that in most people the drug you swallow is not the drug that does the work: an enzyme in the liver converts it into a compound called 5-hydroxymethyl tolterodine, which blocks the same receptors and is present in larger quantity. About seven people in a hundred of European ancestry lack a working version of that enzyme, and they end up with almost none of the metabolite and much more of the parent drug. Both block the same receptor, so the drug still works — but what is circulating in one person is not what is circulating in another.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 52,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.2533 per unit at United States pharmacy acquisition cost (CMS NADAC, generic, median across 54 listed products, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States in 1998 and long off patent, with fifty-four products in the acquisition-cost file. Its own manufacturer\'s successor product, fesoterodine — which delivers tolterodine\'s active metabolite directly — is generic too, at US$0.8127 across sixteen products on the same file.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Two of the alternatives here beat tolterodine in a randomised head-to-head, and one of them is chemically tolterodine\'s own metabolite. Solifenacin beat it in STAR. Fesoterodine beat it in two Pfizer trials totalling more than four thousand patients. Mirabegron beat it indirectly, by clearing placebo in the same trial where tolterodine did not.',
      conventionalRx: [
        {
          name: 'Fesoterodine (Toviaz)',
          class: 'Prodrug of 5-hydroxymethyl tolterodine',
          howItCompares:
            'The FDA label states fesoterodine is rapidly hydrolysed by nonspecific esterases to 5-hydroxymethyl tolterodine, which is the same compound tolterodine is converted into by CYP2D6, and which the label names as responsible for the antimuscarinic activity. In two Pfizer trials it beat tolterodine ER 4 mg on urgency incontinence episodes: -1.95 against -1.74 (p=0.0072, n=2,417) and -1.72 against -1.61 (p=0.0172, n=1,712).',
          typicalCost:
            'US$0.8127 per tablet at United States pharmacy acquisition cost (CMS NADAC, generic, median across 16 listed products, effective 19 August 2026)',
          prosAndCons:
            'Pros: no dependence on CYP2D6 to generate the active moiety, and two head-to-head wins. Cons: three times the acquisition cost, and the wins are 0.11 and 0.21 episodes a day.',
        },
        {
          name: 'Solifenacin (Vesicare)',
          class: 'M3-preferring muscarinic antagonist',
          howItCompares:
            'The STAR trial compared flexibly dosed solifenacin against tolterodine ER 4 mg in a double-blind, double-dummy design and found solifenacin superior on most efficacy variables. At four weeks on the starting doses, incontinence episodes fell 1.30 a day on solifenacin 5 mg against 0.90 on tolterodine ER 4 mg (p=0.0181), and pad use fell 1.21 against 0.80 (p=0.0089).',
          typicalCost:
            'US$0.1754 per tablet at United States pharmacy acquisition cost (CMS NADAC, generic, median across 40 listed products, effective 19 August 2026)',
          prosAndCons:
            'Pros: cheaper, and it won the head-to-head. Cons: dry mouth rises steeply with dose, and it carries the same class-level anticholinergic concern.',
        },
        {
          name: 'Mirabegron (Myrbetriq)',
          class: 'Beta-3 adrenergic agonist',
          howItCompares:
            'In SCORPIO, both drugs were tested against placebo in the same 2,336-patient trial. Mirabegron 50 mg reached p=0.003 on incontinence episodes and p<0.001 on micturitions; tolterodine SR 4 mg reached p=0.11 on both. No direct superiority test between the two was performed, but the placebo comparison was run in the same population on the same days.',
          typicalCost:
            'US$9.60 per tablet at United States pharmacy acquisition cost (CMS NADAC, generic, median across 17 listed products, effective 19 August 2026)',
          prosAndCons:
            'Pros: no anticholinergic burden, roughly double the one-year persistence, and it cleared placebo where tolterodine did not. Cons: nearly forty times the acquisition cost, and a blood-pressure warning.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Ask whether anything else you take is metabolised by CYP2D6 or blocks CYP3A4',
          action:
            'Tolterodine needs CYP2D6 to generate its main active metabolite and CYP3A4 to clear the parent, so both pathways matter and interference with either changes what is circulating.',
          patientImpact:
            'The label states that poor metabolisers — roughly 7% of Caucasians — form negligible 5-hydroxymethyl tolterodine and instead reach significantly higher serum concentrations of the parent drug through CYP3A4 dealkylation. In those individuals a strong CYP3A4 inhibitor removes the remaining clearance route.',
          clinicalPrecaution:
            'This is a labelled pharmacokinetic fact rather than a rare event, and it is one of the reasons a successor drug was developed that delivers the active metabolite directly and needs neither enzyme to work.',
        },
        {
          name: 'Structured behavioural training, delivered as sessions rather than advice',
          action:
            'Pelvic floor muscle exercises with biofeedback plus urge-suppression strategy, taught over several supervised visits.',
          patientImpact:
            'In a randomised trial of 197 community-dwelling women aged 55 and over, behavioural training reduced incontinence episodes by 80.7% against 68.5% for an antimuscarinic (P=.04) and 39.4% for placebo, with 14.0% of the training group wanting to change treatment against 75.5% of the drug group.',
          clinicalPrecaution:
            'The drug arm in that trial was oxybutynin, not tolterodine, and no equivalent head-to-head against tolterodine exists. It is evidence about the comparator, not about this specific molecule.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC1=CC(=C(C=C1)O)[C@H](CCN(C(C)C)C(C)C)C2=CC=CC=C2',
      chemicalFormula: 'C22H31NO',
      molecularWeight: '325.50 g/mol (free base); dispensed as tolterodine tartrate',
      targetReceptorAffinity:
        'The US label describes the pharmacology functionally: tolterodine "acts as a competitive antagonist of acetylcholine at postganglionic muscarinic receptors," with no subtype selectivity claimed and no binding constant quoted, so none is given here. The single stereocentre is the (R) configuration. The pharmacologically decisive fact is metabolic rather than structural: CYP2D6 hydroxylates the 5-methyl group to give 5-hydroxymethyl tolterodine, an equally active antimuscarinic that is the principal active moiety in extensive metabolisers, and which is marketed separately as the active moiety of fesoterodine.',
      structureSource: {
        label: 'PubChem CID 443879 — tolterodine structure, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/443879',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'tol-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Enantiomeric excess of the (R)-3-aryl-3-phenylpropylamine core',
          description:
            'Establish enantiomeric excess before the amine is alkylated. Tolterodine is a single enantiomer and the (S) antipode is the specified chiral impurity, so the stereochemistry is measured where it is set rather than argued about in the finished salt.',
          reagentsAndBuffer:
            'Chiral stationary-phase HPLC on an amylose or cellulose carbamate column, n-hexane with 2-propanol and diethylamine, UV detection at 220 nm, (S)-enantiomer reference standard',
        },
        {
          id: 'tol-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Reductive amination to the diisopropylamino tail and phenol deprotection',
          description:
            'Install the bulky diisopropylamino group on the propyl chain and unmask the phenol. The free phenol is not decoration: it is the hydrogen-bond donor the receptor pocket uses, and the 5-methyl group ortho to it is the position CYP2D6 will later hydroxylate in the body.',
          dependsOnStepId: 'tol-w1',
          reagentsAndBuffer:
            'Diisopropylamine, sodium triacetoxyborohydride or catalytic hydrogenation, benzyl or methyl phenol protecting group with palladium on carbon or boron tribromide for removal, anhydrous dichloromethane or methanol under nitrogen',
        },
        {
          id: 'tol-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Tartrate salt formation and control of the phenolic oxidation products',
          description:
            'Form the L-tartrate salt and recrystallise, then re-run the chiral assay on the finished salt. Free phenols oxidise, so the related-substances specification is written around quinone-type degradants as well as the residual (S)-enantiomer.',
          dependsOnStepId: 'tol-w2',
          reagentsAndBuffer:
            'L-tartaric acid, ethanol or acetone with water, nitrogen sparging to limit oxidation, reversed-phase HPLC with photodiode-array detection for related substances, chiral HPLC for enantiomeric purity',
        },
        {
          id: 'tol-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Parallel application of tolterodine and 5-hydroxymethyl tolterodine to each subtype',
          description:
            'Apply the parent and, in parallel wells, authentic 5-hydroxymethyl tolterodine to five stable lines carrying human CHRM1 through CHRM5. Testing the parent alone would describe a drug that most patients barely have in circulation, because CYP2D6 converts a large fraction of it before it reaches the bladder. Poor metabolisers are the mirror case, and the two-compound design is the only one that covers both.',
          dependsOnStepId: 'tol-w3',
          reagentsAndBuffer:
            'CHO or HEK293 lines stably expressing human CHRM1 to CHRM5, DMEM with 10% fetal bovine serum, geneticin selection, HEPES-buffered assay saline at pH 7.4, authentic 5-hydroxymethyl tolterodine reference standard',
        },
        {
          id: 'tol-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Muscarinic functional antagonism plus a hERG patch-clamp arm',
          description:
            'Measure radioligand displacement and carbachol-evoked calcium blockade for both compounds at every subtype, then run whole-cell patch clamp on a hERG-expressing line for both. The second assay is not optional for this molecule: the label carries a measured QT effect of 11.84 msec at twice the therapeutic dose, and the cardiac channel is where that comes from, not the muscarinic receptor.',
          dependsOnStepId: 'tol-w4',
          reagentsAndBuffer:
            'Tritiated N-methylscopolamine as radioligand, atropine for non-specific binding, Fluo-4 AM calcium indicator, carbachol as agonist, HEK293 line stably expressing hERG, external and internal patch solutions with 4 mM potassium, E-4031 as positive control',
        },
      ],
    },
    keyAudits: [
      {
        id: 'tol-a1',
        category: 'failed',
        title: 'In SCORPIO, 475 patients on this drug could not be told apart from placebo',
        laymanSummary:
          'Mirabegron\'s registration trial included a tolterodine arm as the yardstick. On both main endpoints the yardstick missed. Mirabegron cleared placebo comfortably in the same trial, on the same days, in the same patients.',
        technicalDetails:
          'SCORPIO (NCT00689104) randomised 2,336 patients to placebo (480), mirabegron 50 mg (473), mirabegron 100 mg (478) or tolterodine SR 4 mg (475). Incontinence episodes per 24 hours fell 1.17 on placebo and 1.27 on tolterodine, p=0.11 (95% CI -0.42 to 0.21). Micturitions fell 1.34 and 1.59, p=0.11 (95% CI -0.55 to 0.06). Mirabegron 50 mg in the same trial reached p=0.003 and p<0.001. An active-control arm that misses is usually written off as a failure of assay sensitivity — but assay sensitivity was demonstrated in the same trial by the experimental drug clearing both endpoints. The remaining explanation is that the tolterodine effect is small enough that a 475-patient arm can miss it.',
        evidenceSource:
          'ClinicalTrials.gov results record, SCORPIO NCT00689104; Khullar V et al., Eur Urol 2013;63:283-295',
        doi: '10.1016/j.eururo.2012.10.016',
        measuredMetric:
          'Tolterodine SR 4 mg versus placebo on both co-primary endpoints, in a 2,336-patient trial',
        auditFlag: 'verified',
      },
      {
        id: 'tol-a2',
        category: 'failed',
        title: 'It happened again in EMPOWUR, seven years later, with a different sponsor',
        laymanSummary:
          'Vibegron\'s registration trial also used tolterodine as the comparator. Tolterodine again failed to beat placebo on the number of daily toilet trips.',
        technicalDetails:
          'EMPOWUR (NCT03492281) randomised 1,530 patients to placebo (475), vibegron 75 mg (492) or tolterodine ER 4 mg (378). On the first co-primary endpoint, micturitions per 24 hours, vibegron beat placebo by 0.5 (p<0.001) while tolterodine reached only a 0.3 difference at p=0.0988, reported as descriptive. On urge urinary incontinence episodes in the wet subgroup, vibegron beat placebo by 0.6 (p<0.0001) and tolterodine by 0.4 (p=0.0123, descriptive). Two independent sponsors, seven years apart, using different beta-3 agonists, produced the same result for the tolterodine arm. Two replications of a null is not a coincidence about trial conduct.',
        evidenceSource: 'ClinicalTrials.gov results record, EMPOWUR NCT03492281',
        measuredMetric:
          'Tolterodine ER 4 mg versus placebo on micturitions and urge incontinence episodes per 24 hours',
        auditFlag: 'verified',
      },
      {
        id: 'tol-a3',
        category: 'measured',
        title: 'Where it did beat placebo, the margin was about a tenth of an episode a day',
        laymanSummary:
          'Two large trials run by tolterodine\'s own manufacturer did show it beating placebo. The size of the win was 0.12 and 0.15 fewer leaks a day.',
        technicalDetails:
          'Pfizer ran two 12-week double-blind, double-dummy, placebo-controlled trials of fesoterodine against tolterodine ER 4 mg. In the larger (NCT00611026, n=2,417), urgency incontinence episodes per 24 hours fell 1.62 ± 0.07 on placebo (n=448) and 1.74 ± 0.06 on tolterodine (n=926), p=0.0228 — a difference of 0.12 episodes a day. In the second (NCT00444925, n=1,712), placebo fell 1.46 (n=307) and tolterodine 1.61 (n=626), p=0.0107 — a difference of 0.15. The label reports the same order of magnitude in different units: 11.8 against 6.9 weekly incontinence episodes, 1.8 against 1.2 daily micturitions, and 34 mL against 14 mL added to the volume passed each time. These are positive results with defensible p-values and effect sizes measured in tenths of an episode.',
        evidenceSource:
          'ClinicalTrials.gov results records NCT00611026 and NCT00444925; US prescribing information for tolterodine tartrate extended-release capsules, Clinical Studies section',
        measuredMetric:
          'Change from baseline in urgency incontinence episodes per 24 hours, tolterodine ER versus placebo, in two trials',
        auditFlag: 'verified',
      },
      {
        id: 'tol-a4',
        category: 'conclusion_shift',
        title: 'The manufacturer developed this drug\'s own metabolite and beat it with it',
        laymanSummary:
          'Fesoterodine, sold as a separate newer drug, is a delivery vehicle for the exact compound tolterodine turns into inside the body. Pfizer tested it against tolterodine twice and won both times.',
        technicalDetails:
          'The fesoterodine label states that after oral administration fesoterodine is rapidly and extensively hydrolysed by nonspecific esterases to 5-hydroxymethyl tolterodine, "which is responsible for the antimuscarinic activity of fesoterodine," and names the compound explicitly. The tolterodine label states that tolterodine is metabolised by CYP2D6 to the same 5-hydroxymethyl metabolite. So the two products deliver the same active moiety by different routes — one requiring a polymorphic liver enzyme, one requiring only ubiquitous esterases. In the head-to-heads, fesoterodine escalated to 8 mg beat tolterodine ER 4 mg on urgency incontinence episodes: -1.95 against -1.74 (p=0.0072) and -1.72 against -1.61 (p=0.0172). A fair reading is that the newer drug is a real pharmacokinetic improvement over the older one whose clinical size is about a tenth of an episode a day, and that the dose comparison was 8 mg against 4 mg rather than a like-for-like exposure.',
        evidenceSource:
          'US prescribing information for fesoterodine fumarate extended-release tablets, Mechanism of Action and Clinical Pharmacology; US prescribing information for tolterodine tartrate extended-release capsules, Clinical Pharmacology; ClinicalTrials.gov results records NCT00611026 and NCT00444925',
        measuredMetric:
          'Fesoterodine 8 mg versus tolterodine ER 4 mg on urgency incontinence episodes per 24 hours, in two trials totalling 4,129 patients',
        inferredClaim:
          'That fesoterodine represents a new mechanism rather than a new route to the same active molecule — the labels of both drugs name the identical active moiety',
        auditFlag: 'caution',
      },
      {
        id: 'tol-a5',
        category: 'measured',
        title: 'About seven Caucasians in a hundred get a different drug from the same capsule',
        laymanSummary:
          'The enzyme that converts tolterodine into its active form is missing or non-functional in roughly 7% of people of European ancestry. Those people end up with almost none of the metabolite and much more of the parent drug.',
        technicalDetails:
          'The US label states that poor metabolisers, approximately 7% of Caucasians, cannot efficiently form 5-hydroxymethyl tolterodine via CYP2D6, and that dealkylation via CYP3A4 becomes the primary route instead, "resulting in significantly higher serum concentrations of tolterodine and negligible concentrations of 5-HMT". Both compounds are antimuscarinic, so the therapeutic effect does not vanish; what changes is the identity, exposure and clearance route of the circulating active species. It also removes the redundancy: in a poor metaboliser, CYP3A4 is the only clearance pathway left, which is why the label handles strong CYP3A4 inhibitors differently in that group. Trials of this drug did not stratify on CYP2D6 status, so every efficacy figure quoted for tolterodine is an average over two pharmacologically distinct populations.',
        evidenceSource:
          'US prescribing information for tolterodine tartrate extended-release capsules, Clinical Pharmacology section (openFDA drug label endpoint)',
        measuredMetric:
          'Proportion of poor metabolisers and their relative parent-drug and metabolite concentrations',
        auditFlag: 'caution',
      },
      {
        id: 'tol-a6',
        category: 'measured',
        title: 'A measured 11.84 msec QT effect at twice the therapeutic dose',
        laymanSummary:
          'At double the normal daily dose, tolterodine lengthened an electrical interval in the heart by about 12 milliseconds. The label compares it with a known QT-prolonging antibiotic and notes the confidence intervals overlapped.',
        technicalDetails:
          'The US label reports a dedicated QT study. At tolterodine 4 mg twice daily — twice the therapeutic 4 mg once-daily extended-release exposure — the mean QT interval change by manual measurement was 11.84 msec (7.11, 16.58). The label states the effect at 8 mg/day "was not as large as that observed after four days of therapeutic dosing with moxifloxacin. However, the confidence intervals overlapped." That last sentence is doing real work: overlapping confidence intervals with the positive control is not the same as a clean negative, and the label chose to say so rather than to summarise. The mechanism is hERG channel block, which is unrelated to the muscarinic receptor the drug was designed for.',
        evidenceSource:
          'US prescribing information for tolterodine tartrate extended-release capsules, Clinical Pharmacology section (openFDA drug label endpoint)',
        measuredMetric:
          'Mean QT interval change at twice the therapeutic dose, with 95% confidence interval, against a moxifloxacin positive control',
        auditFlag: 'caution',
      },
      {
        id: 'tol-a7',
        category: 'measured',
        title: 'Dry mouth in 23% against 8% on placebo, and it is the same receptor',
        laymanSummary:
          'Nearly one in four patients gets a dry mouth, against one in twelve on placebo. As with every drug in this class, that is the identical receptor block happening in the salivary gland.',
        technicalDetails:
          'The US label for the extended-release capsule reports dry mouth in 23% against 8% on placebo, constipation 6% against 4%, and headache 6% against 5%. Only the dry mouth separates convincingly. In patients aged 65 and over, dry mouth occurred with roughly six times the incidence on tolterodine ER 4 mg as on mirabegron over 12 weeks, and three times the incidence over a year. The extended-release capsule was itself developed to reduce this: it is the same molecule as the immediate-release tablet, released more slowly, on the same logic that produced oxybutynin\'s extended-release form.',
        evidenceSource:
          'US prescribing information for tolterodine tartrate extended-release capsules, Adverse Reactions section; Wagg A et al., Curr Med Res Opin 2016;32:621-638 (PMID 26828974)',
        doi: '10.1185/03007995.2016.1149806',
        measuredMetric: 'Incidence of dry mouth, constipation and headache against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'tol-a8',
        category: 'inferred',
        title: 'The class dementia association applies here and has never been tested in a trial',
        laymanSummary:
          'Large database studies associate bladder antimuscarinics as a group with later dementia. Tolterodine is one of them. No randomised trial in this indication has ever measured cognition as an endpoint.',
        technicalDetails:
          'Coupland and colleagues, in 58,769 dementia cases and 225,574 controls, reported an adjusted odds ratio of 1.65 (95% CI 1.56 to 1.75) for bladder antimuscarinic drugs as a class, and a rise from 1.06 (1.03 to 1.09) to 1.49 (1.44 to 1.54) across cumulative anticholinergic exposure bands. Gray and colleagues, following 3,434 people aged 65 and over for a mean 7.3 years, reported an adjusted hazard ratio of 1.54 (1.21 to 1.96) above 1,095 total standardised daily doses. Neither study can attribute risk to tolterodine specifically, and neither randomised anyone. What makes the inference harder rather than easier here is that most patients discontinue within months: the cumulative-exposure bands that carry the signal are populated by the minority who stayed on treatment, who differ from everyone else in ways no adjustment fully captures.',
        evidenceSource:
          'Coupland CAC et al., JAMA Intern Med 2019;179:1084-1093 (PMID 31233095); Gray SL et al., JAMA Intern Med 2015;175:401-407 (PMID 25621434)',
        doi: '10.1001/jamainternmed.2019.0677',
        inferredClaim:
          'That tolterodine specifically raises dementia risk — the evidence is class-level and observational, and this drug is not separately identified in it',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed, then converted into the compound that does most of the work',
        laymanDesc:
          'The capsule releases the drug slowly. On the way through the liver, an enzyme turns most of it into a second compound that blocks the same receptors. In most people, that second compound is what reaches the bladder in quantity.',
        molecularDetail:
          'Extended-release capsule, once daily. CYP2D6 hydroxylates the 5-methyl group to 5-hydroxymethyl tolterodine, an equally active antimuscarinic. In poor metabolisers, roughly 7% of Caucasians, that pathway is unavailable and CYP3A4 dealkylation dominates instead, giving significantly higher parent concentrations and negligible metabolite.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Both compounds reach the receptor from outside the cell',
        laymanDesc:
          'The target sits on the outer surface of the bladder muscle cell. Neither the drug nor its metabolite needs to get inside anything — they arrive from the bloodstream and sit down.',
        molecularDetail:
          'Muscarinic receptors are plasma-membrane G-protein-coupled receptors with an outward-facing orthosteric pocket, so no transporter step exists. Tolterodine is a tertiary amine and lipophilic, and the hydroxymethyl metabolite is more polar than the parent — a difference that matters for tissue distribution but not for reaching a surface receptor.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It competes with acetylcholine at every muscarinic receptor',
        laymanDesc:
          'The nerve chemical that tells the bladder to squeeze finds its seat taken. The same thing happens in the salivary gland, which is where the dry mouth comes from.',
        molecularDetail:
          'The label describes competitive antagonism at postganglionic muscarinic receptors, with no subtype selectivity claimed. Competition is surmountable, so a large enough acetylcholine release still produces a contraction. The free phenol on the aromatic ring is the hydrogen-bond donor the binding pocket uses, and the methyl group next to it is the site CYP2D6 attacks.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Calcium release falls and the bladder holds more',
        laymanDesc:
          'The internal calcium burst that drives a contraction is weakened, so the bladder tolerates more filling before it demands emptying. Each void is larger as a result.',
        molecularDetail:
          'Reduced M3-Gq/11 coupling lowers phospholipase C activity, inositol trisphosphate and sarcoplasmic reticulum calcium release, and myosin light-chain phosphorylation falls. The label captures the functional consequence directly: volume passed per void rose 34 mL against 14 mL on placebo.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Five fewer leaks a week than placebo, or none at all depending on the trial',
        laymanDesc:
          'On its own label, about five fewer leaks a week than placebo. In two large trials run by other companies, no measurable difference from placebo at all.',
        molecularDetail:
          'Label figures: incontinence episodes -11.8 per week against -6.9 on placebo, micturitions -1.8 per day against -1.2, volume per void +34 mL against +14 mL. Against that, the tolterodine arm missed both co-primary endpoints in SCORPIO (p=0.11) and missed on micturitions in EMPOWUR (p=0.0988). Dry mouth 23% against 8%. A measured QT effect of 11.84 msec at twice the therapeutic dose.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'SCORPIO (NCT00689104) — tolterodine SR 4 mg as active control',
        phase: 'Phase 3 randomised double-blind placebo- and active-controlled, 12 weeks',
        sampleSize: 2336,
        primaryEndpoint:
          'Change from baseline to week 12 in mean incontinence episodes and mean micturitions per 24 hours',
        endpointMet: false,
        statisticalPValue:
          'Tolterodine SR 4 mg: incontinence -1.27 versus placebo -1.17, p=0.11 (95% CI -0.42 to 0.21); micturitions -1.59 versus -1.34, p=0.11 (95% CI -0.55 to 0.06)',
        unreportedAdverseSignals:
          'Assay sensitivity was demonstrated in the same trial by the mirabegron arms clearing both endpoints at p=0.003 and p<0.001, which removes the usual excuse for an active control missing.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'EMPOWUR (NCT03492281) — tolterodine ER 4 mg as active control',
        phase: 'Phase 3 randomised double-blind placebo- and active-controlled, 12 weeks',
        sampleSize: 1530,
        primaryEndpoint:
          'Change from baseline at week 12 in average micturitions per 24 hours, and in urge urinary incontinence episodes in the wet subgroup',
        endpointMet: false,
        statisticalPValue:
          'Tolterodine versus placebo: micturitions difference -0.3, p=0.0988 (descriptive); urge incontinence difference -0.4, p=0.0123 (descriptive). Vibegron reached p<0.001 and p<0.0001 in the same trial.',
        unreportedAdverseSignals:
          'A different sponsor, a different experimental drug and seven years later, with the same outcome for the tolterodine arm on the first co-primary endpoint.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'Fesoterodine versus tolterodine ER, A0221046 (NCT00611026)',
        phase: 'Phase 3 randomised double-blind double-dummy placebo-controlled, 12 weeks',
        sampleSize: 2417,
        primaryEndpoint:
          'Change from baseline in mean urgency urinary incontinence episodes per 24 hours at week 12',
        endpointMet: true,
        statisticalPValue:
          'Placebo -1.62 ± 0.07 (n=448), tolterodine ER -1.74 ± 0.06 (n=926, p=0.0228 versus placebo), fesoterodine -1.95 ± 0.05 (n=908, p<0.0001 versus placebo and p=0.0072 versus tolterodine)',
        unreportedAdverseSignals:
          'The comparison was fesoterodine escalated to 8 mg against tolterodine ER 4 mg, not a matched-exposure comparison of the same active moiety by two routes.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Fesoterodine versus tolterodine ER (NCT00444925)',
        phase: 'Phase 3 randomised double-blind double-dummy placebo-controlled, 12 weeks',
        sampleSize: 1712,
        primaryEndpoint:
          'Change from baseline in mean urgency urinary incontinence episodes per 24 hours at week 12',
        endpointMet: true,
        statisticalPValue:
          'Placebo -1.46 (n=307), tolterodine ER -1.61 (n=626, p=0.0107 versus placebo), fesoterodine -1.72 (n=619, p<0.0001 versus placebo and p=0.0172 versus tolterodine)',
        unreportedAdverseSignals:
          'The tolterodine margin over placebo here is 0.15 incontinence episodes per 24 hours. It is statistically significant and it is fifteen hundredths of an episode.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'TAURUS (NCT00688688) — tolterodine ER 4 mg as active control',
        phase: 'Phase 3 randomised double-blind active-controlled long-term safety, 12 months',
        sampleSize: 2792,
        primaryEndpoint:
          'Number and severity of treatment-emergent adverse events over 12 months, mirabegron versus tolterodine ER 4 mg',
        endpointMet: true,
        statisticalPValue:
          'A safety endpoint with no efficacy hypothesis test and no placebo arm; the trial establishes 12-month tolerability, not 12-month effect',
        unreportedAdverseSignals:
          'This is the longest randomised exposure to tolterodine in the public record, and it carries no placebo arm.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Incontinence episodes fell 11.8 per week on tolterodine ER against 6.9 on placebo, and micturitions 1.8 per day against 1.2, on the US label',
        'Volume passed per void rose 34 mL against 14 mL on placebo',
        'Urgency incontinence episodes fell 1.74 against 1.62 on placebo (p=0.0228, n=2,417) and 1.61 against 1.46 (p=0.0107, n=1,712) in two Pfizer trials',
        'The tolterodine arm missed both co-primary endpoints against placebo in SCORPIO at p=0.11, and missed micturitions in EMPOWUR at p=0.0988',
        'Dry mouth in 23% against 8% on placebo',
        'Mean QT interval change of 11.84 msec (7.11, 16.58) at twice the therapeutic dose, with confidence intervals overlapping the moxifloxacin positive control',
        'Approximately 7% of Caucasians form negligible 5-hydroxymethyl tolterodine and reach significantly higher parent-drug concentrations instead',
      ],
      unsupportedInferences: [
        'That an active-control arm missing against placebo reflects a failed trial — assay sensitivity was demonstrated in the same trial by the experimental arm',
        'That fesoterodine is a different mechanism from tolterodine — both labels name 5-hydroxymethyl tolterodine as the active moiety',
        'That the label\'s efficacy figures apply equally to poor and extensive CYP2D6 metabolisers — no trial stratified on genotype',
        'That tolterodine specifically raises dementia risk — the observational evidence is class-level and does not identify this molecule',
      ],
      whatFailedInitially: [
        'The active-control arm in SCORPIO, which missed both co-primary endpoints against placebo in 475 patients',
        'The active-control arm in EMPOWUR seven years later, under a different sponsor, on the first co-primary endpoint',
        'The head-to-head against solifenacin in STAR, which tolterodine ER lost on most efficacy variables',
        'The head-to-head against its own active metabolite, which tolterodine lost twice',
      ],
      realWorldOutcome: [
        'Twenty-five cents a unit at United States pharmacy acquisition cost, across fifty-four listed products',
        'Now used more often as the comparator arm in other companies\' trials than it is discussed on its own terms',
        'Real-world one-year persistence for oral antimuscarinics runs 12% to 25%, with median time to discontinuation under five months',
      ],
    },
    deliverySystem: {
      type: 'Oral extended-release capsule once daily, and immediate-release tablet twice daily',
      description:
        'The extended-release capsule exists for the same reason oxybutynin\'s does: to smooth the concentration peak that drives the anticholinergic side effects, without changing the molecule. Dose is reduced in significant hepatic or renal impairment and in the presence of strong CYP3A4 inhibitors, and the extended-release form is not recommended in severe renal impairment.',
      safetyProfile:
        'Dry mouth is the dominant effect at 23% against 8% on placebo, with constipation and headache barely separating. The label carries warnings for angioedema, urinary retention, gastric retention, narrow-angle glaucoma and central nervous system effects including somnolence, and reports a measured QT prolongation of 11.84 msec at twice the therapeutic dose with confidence intervals overlapping the positive control. The pharmacokinetic profile depends on CYP2D6 status, and in poor metabolisers CYP3A4 becomes the only remaining clearance route.',
    },
    commonQuestions: [
      {
        q: 'Why did this drug fail to beat placebo in two big trials?',
        a: 'Because in both of them it was the comparator, not the drug being registered, and its true effect is small enough that a few hundred patients can miss it. In SCORPIO, 475 patients on tolterodine SR 4 mg were compared with 480 on placebo: incontinence episodes fell 1.27 a day against 1.17, p=0.11, and voids fell 1.59 against 1.34, p=0.11. In EMPOWUR, 378 patients on tolterodine ER missed against placebo on daily voids at p=0.0988. The usual explanation for an active control missing is that the trial lacked the sensitivity to detect anything — but in both cases the experimental drug in the same trial cleared both endpoints comfortably. When the trials that were designed to detect a difference did find one, as in the two Pfizer studies, the difference was 0.12 and 0.15 incontinence episodes a day.',
        auditNote:
          'A statistically significant result and a clinically noticeable one are different claims. Both of the positive trials here reported the first without asserting the second.',
      },
      {
        q: 'Is fesoterodine actually a different drug from this one?',
        a: 'Chemically the tablet is different; pharmacologically the active compound is the same. Tolterodine is converted by the liver enzyme CYP2D6 into 5-hydroxymethyl tolterodine. Fesoterodine is broken down by general-purpose esterases into the same compound — its own FDA label names it as "5-hydroxymethyl tolterodine" and states it "is responsible for the antimuscarinic activity of fesoterodine". The practical difference is that fesoterodine does not need a polymorphic enzyme to become active, and in two head-to-head trials it produced a slightly larger effect: 1.95 against 1.74 incontinence episodes a day, and 1.72 against 1.61. Those comparisons were 8 mg of fesoterodine against 4 mg of tolterodine, so part of the gap is dose rather than route.',
      },
      {
        q: 'I heard some people process this drug differently. Does that affect me?',
        a: 'It affects about seven people in a hundred of European ancestry, and the label says so directly. Those people are poor CYP2D6 metabolisers: they cannot efficiently make 5-hydroxymethyl tolterodine, so they end up with negligible amounts of it and significantly higher concentrations of the parent drug, cleared instead by CYP3A4. Both compounds block the same receptors, so the drug still works. What changes is which molecule is doing the blocking, how much of it there is, and what happens if you take something that inhibits CYP3A4 — because in a poor metaboliser that is the only clearance route left. None of the efficacy trials for this drug stratified patients by CYP2D6 status, so every published figure is an average across both groups.',
      },
      {
        q: 'Should I worry about the heart rhythm warning?',
        a: 'The label reports a measured effect and is unusually candid about its limits. At 4 mg twice daily — twice the therapeutic exposure — the mean QT interval lengthened by 11.84 milliseconds, with a confidence interval of 7.11 to 16.58. The label compares this with moxifloxacin, an antibiotic used as the positive control in QT studies, and says the tolterodine effect was not as large but that "the confidence intervals overlapped". That sentence is a deliberate refusal to round a partial overlap down to nothing. The mechanism is blockade of a cardiac potassium channel, which has nothing to do with the muscarinic receptor the drug was designed for. It is a reason to raise the question with a prescriber if you have a known QT problem or take other drugs that lengthen it.',
        auditNote:
          'Labels rarely volunteer that a confidence interval overlapped the positive control. This one does, and the sentence is worth more than the point estimate.',
      },
      {
        q: 'Why does this page not show a manufacturing cost?',
        a: 'Because no per-dose cost-of-production figure for tolterodine could be verified and cited. The cost-of-production literature checked here publishes an estimation method and aggregate ranges rather than a per-dose figure for this molecule. What is shown instead is what pharmacies pay — about twenty-five cents a unit in the CMS acquisition-cost survey across fifty-four listed products — which is a price, not a cost of manufacture.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'SCORPIO — phase 3 placebo- and tolterodine-controlled trial of mirabegron in overactive bladder',
        identifier: 'NCT00689104',
        kind: 'nct',
      },
      {
        label:
          'Khullar V, Amarenco G, Angulo JC, et al. Efficacy and tolerability of mirabegron, a beta(3)-adrenoceptor agonist, in patients with overactive bladder: results from a randomised European-Australian phase 3 trial. Eur Urol 2013;63:283-295',
        identifier: '10.1016/j.eururo.2012.10.016',
        kind: 'doi',
      },
      {
        label:
          'EMPOWUR — phase 3 placebo- and tolterodine-controlled trial of vibegron in overactive bladder',
        identifier: 'NCT03492281',
        kind: 'nct',
      },
      {
        label:
          'A0221046 — 12-week placebo-controlled trial of fesoterodine compared with tolterodine ER in overactive bladder',
        identifier: 'NCT00611026',
        kind: 'nct',
      },
      {
        label:
          'Second 12-week placebo-controlled trial of fesoterodine compared with tolterodine ER in overactive bladder',
        identifier: 'NCT00444925',
        kind: 'nct',
      },
      {
        label:
          'TAURUS — 12-month randomised active-controlled long-term safety study of mirabegron versus tolterodine ER',
        identifier: 'NCT00688688',
        kind: 'nct',
      },
      {
        label:
          'Chapple CR et al., STAR study group. A comparison of the efficacy and tolerability of solifenacin succinate and extended release tolterodine at treating overactive bladder syndrome: results of the STAR trial. Eur Urol 2005;48:464-470',
        identifier: '10.1016/j.eururo.2005.05.015',
        kind: 'doi',
      },
      {
        label:
          'Chapple CR et al., STAR study group. Treatment outcomes in the STAR study: a subanalysis of solifenacin 5 mg and tolterodine ER 4 mg. Eur Urol 2007;52:1195-1203',
        identifier: '10.1016/j.eururo.2007.05.027',
        kind: 'doi',
      },
      {
        label:
          'Coupland CAC, Hill T, Dening T, Morriss R, Moore M, Hippisley-Cox J. Anticholinergic drug exposure and the risk of dementia: a nested case-control study. JAMA Intern Med 2019;179:1084-1093',
        identifier: '10.1001/jamainternmed.2019.0677',
        kind: 'doi',
      },
      {
        label:
          'Gray SL, Anderson ML, Dublin S, et al. Cumulative use of strong anticholinergics and incident dementia: a prospective cohort study. JAMA Intern Med 2015;175:401-407',
        identifier: '10.1001/jamainternmed.2014.7663',
        kind: 'doi',
      },
      {
        label:
          'Wagg A, Nitti VW, Kelleher C, Castro-Diaz D, Siddiqui E, Berner T. Oral pharmacotherapy for overactive bladder in older patients: mirabegron as a potential alternative to antimuscarinics. Curr Med Res Opin 2016;32:621-638',
        identifier: '10.1185/03007995.2016.1149806',
        kind: 'doi',
      },
      {
        label:
          'US prescribing information for tolterodine tartrate extended-release capsules — mechanism of action, clinical pharmacology, clinical studies and adverse reactions (openFDA drug label endpoint)',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22tolterodine+tartrate%22',
        kind: 'regulatory',
      },
      {
        label:
          'US prescribing information for fesoterodine fumarate extended-release tablets — mechanism of action and clinical pharmacology, naming 5-hydroxymethyl tolterodine as the active moiety (openFDA drug label endpoint)',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22fesoterodine+fumarate%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 443879 — tolterodine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/443879',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 7. Alfuzosin — sold on the word "uroselective", which describes a formulation rather than a
  //    receptor; missed its registered two-year endpoint outright and reported post hoc composites
  //    instead; and produced one of the cleanest null results in urology when tried on prostatitis.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'alfuzosin',
    name: 'Alfuzosin',
    tradeName: 'Uroxatral',
    sponsor: 'Advanz Pharma',
    targetGene: 'ADRA1A',
    targetProtein:
      'Post-synaptic alpha-1 adrenoceptors in the prostate, bladder base, bladder neck, prostatic capsule and prostatic urethra; the US label claims selectivity for the alpha-1 class and locates it anatomically, and does not claim preference for any alpha-1 subtype',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2003,
    indication:
      'Treatment of the signs and symptoms of benign prostatic hyperplasia. The label states that it is not indicated for the treatment of hypertension and not indicated for use in the paediatric population.',
    patientFriendlyIndication:
      'A weak or hesitant stream, going often, and getting up at night, caused by an enlarged prostate',
    anatomicalSite:
      'Smooth muscle of the prostatic stroma, prostatic capsule, prostatic urethra, bladder neck and bladder base',
    conditionContext: {
      conditionExplainer:
        'The obstruction an enlarged prostate causes has two components: the bulk of the gland, and the tension in the smooth muscle running through it. Alfuzosin, like every alpha-blocker, addresses only the second. Nothing about the gland changes.',
      whyItMatters:
        'Alfuzosin is the drug that tested that distinction most directly. It was given to 1,522 men at raised risk of urinary retention for two years, with the first episode of acute retention as the registered primary endpoint. Retention occurred in 2.1% on the drug and 1.8% on placebo.',
      whoTakesThis:
        'Men with moderate to severe lower urinary tract symptoms attributed to benign prostatic hyperplasia, particularly those who cannot tolerate the ejaculatory effects of the alpha-1A-preferring drugs.',
      clinicalGoals:
        'Lower the International Prostate Symptom Score and raise peak urine flow. On the label\'s own three trials, the symptom margin over placebo is about two points on a thirty-five point scale and the flow margin missed significance in one of the three.',
    },
    oneSentenceVerdict:
      'An alpha-1 adrenoceptor antagonist whose "uroselectivity" is a matter of formulation and dosing rather than of receptor subtype: across its three US registration trials it lowered the International Prostate Symptom Score by 3.6, 6.9 and 6.5 points against 1.6, 4.9 and 4.6 on placebo, a margin of about two points; over two years in 1,522 men it did not reduce acute urinary retention at all (2.1% against 1.8%, P=0.82); and in a 272-man randomised trial for chronic prostatitis it produced a response rate identical to placebo to within a tenth of a percentage point.',
    laymanHowItWorks:
      'The prostate and the neck of the bladder are wrapped in muscle that nerves hold permanently tense, and that tension narrows the tube urine leaves through. Alfuzosin blocks the receptor those nerve signals use, so the muscle relaxes and the channel widens. The gland is the same size afterwards. Unlike some drugs in its class, alfuzosin does not prefer one receptor subtype over another — what it has instead is an extended-release tablet and a once-daily schedule designed to keep blood-pressure effects small, which is a different kind of selectivity and worth knowing the difference.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 58,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1077 per tablet at United States pharmacy acquisition cost (CMS NADAC, generic, median across 12 listed products, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States in 2003 as an extended-release tablet and now generic, with twelve products in the acquisition-cost file — the thinnest generic market of any alpha-blocker in this group, and about twice the per-tablet cost of tamsulosin as a result.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Within the alpha-blocker class the choice is mostly about which side effect you would rather have: tamsulosin and silodosin prefer the alpha-1A subtype and cause ejaculatory dysfunction, alfuzosin and terazosin do not and are more likely to affect blood pressure. Across classes the choice is different in kind: a 5-alpha-reductase inhibitor shrinks the gland over months and is the only drug type that has been shown to reduce retention and surgery.',
      conventionalRx: [
        {
          name: 'Tamsulosin (Flomax)',
          class: 'Alpha-1A-preferring adrenergic antagonist',
          howItCompares:
            'Genuinely subtype-preferring where alfuzosin is not, which is why abnormal ejaculation appears in 8.4% at 0.4 mg and 18.1% at 0.8 mg against 0.2% on placebo. Alfuzosin\'s own adverse-event table has no comparable ejaculatory signal; its leading effect is dizziness at 5.7% against 2.8%. The symptom-score effects are of the same order.',
          typicalCost:
            'US$0.0509 per capsule at United States pharmacy acquisition cost (CMS NADAC, generic, median across 33 listed products, effective 19 August 2026)',
          prosAndCons:
            'Pros: half the acquisition cost, thirty-three generic suppliers, and no CYP3A4 contraindication. Cons: dose-dependent abnormal ejaculation, and the same intraoperative floppy iris warning.',
        },
        {
          name: 'Dutasteride (Avodart) or finasteride (Proscar)',
          class: '5-alpha-reductase inhibitor',
          howItCompares:
            'Attacks the gland rather than the muscle. This matters precisely where alfuzosin failed: alfuzosin did not reduce acute urinary retention over two years in ALTESS (2.1% against 1.8%, P=0.82), whereas the 5-alpha-reductase inhibitor arm of CombAT was the one that carried the retention and surgery benefit over four years.',
          typicalCost:
            'US$0.0684 per tablet for finasteride at United States pharmacy acquisition cost (CMS NADAC, generic, median across 50 listed products, effective 19 August 2026)',
          prosAndCons:
            'Pros: the only drug class with a demonstrated effect on retention and surgery. Cons: works over months not hours, halves serum PSA, and carries sexual adverse effects that persist during treatment.',
        },
        {
          name: 'Silodosin (Rapaflo)',
          class: 'Alpha-1A adrenergic antagonist, the most subtype-selective of the class',
          howItCompares:
            'The opposite design choice from alfuzosin: maximise alpha-1A preference and accept the ejaculatory consequence in exchange for the least cardiovascular effect. Alfuzosin achieves a similar cardiovascular result by pharmacokinetics rather than by receptor preference, and keeps ejaculation intact.',
          typicalCost:
            'US$0.3137 per capsule at United States pharmacy acquisition cost (CMS NADAC, generic, median across 21 listed products, effective 19 August 2026)',
          prosAndCons:
            'Pros: least blood-pressure effect of the class by design. Cons: three times the cost of alfuzosin, and retrograde or absent ejaculation in a large minority.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Check the interaction list before any antifungal or protease inhibitor is started',
          action:
            'Alfuzosin is contraindicated — not merely cautioned — for use with potent CYP3A4 inhibitors such as ketoconazole, itraconazole and ritonavir.',
          patientImpact:
            'This is a hard contraindication in the US label, and it exists because those drugs remove the drug\'s clearance route. The same label contraindicates use in moderate to severe hepatic insufficiency (Child-Pugh B and C), where plasma clearance falls to a third or a quarter of normal and concentrations rise three to four-fold.',
          clinicalPrecaution:
            'Most drugs in this class carry a caution here. Alfuzosin carries a contraindication, which is a stronger statement and one worth raising specifically.',
        },
        {
          name: 'Tell an eye surgeon before cataract surgery, as for every alpha-blocker',
          action:
            'The intraoperative floppy iris warning applies across the alpha-blocker class, not only to the drug in which it was first described.',
          patientImpact:
            'The syndrome was first identified in tamsulosin users and the warning has since been extended across the class. A surgeon told in advance can change technique; one who meets it mid-operation cannot.',
          clinicalPrecaution:
            'Stopping the drug before surgery has not been shown to prevent the syndrome. Disclosure is what changes the outcome.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CN(CCCNC(=O)C1CCCO1)C2=NC3=CC(=C(C=C3C(=N2)N)OC)OC',
      chemicalFormula: 'C19H27N5O4',
      molecularWeight: '389.40 g/mol (free base); dispensed as alfuzosin hydrochloride',
      targetReceptorAffinity:
        'The US label states that alfuzosin is "a selective antagonist of post-synaptic alpha 1-adrenoreceptors, which are located in the prostate, bladder base, bladder neck, prostatic capsule, and prostatic urethra". That sentence claims selectivity between alpha-1 and alpha-2, and then locates the receptors anatomically. It does not claim preference among the alpha-1A, alpha-1B and alpha-1D subtypes, and no such preference is quoted here. The molecule is achiral — it has no stereocentre, which is unusual in this group and removes the chiral-purity step every other dossier in this file carries. It shares the 4-amino-6,7-dimethoxyquinazoline head with prazosin, terazosin and doxazosin, and differs in the tail.',
      structureSource: {
        label: 'PubChem CID 2092 — alfuzosin structure, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2092',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'alf-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Purity of the 4-amino-2-chloro-6,7-dimethoxyquinazoline intermediate',
          description:
            'Establish identity and purity of the quinazoline head before the aminopropyl tail is attached. There is deliberately no chiral specification anywhere in this route: alfuzosin has no stereocentre, which is why the whole quinazoline family of alpha-blockers is manufactured without the chiral analytics that tamsulosin and silodosin require.',
          reagentsAndBuffer:
            'Reversed-phase HPLC with UV detection at 254 nm, gas chromatography for residual solvents, nuclear magnetic resonance for identity, loss-on-drying and Karl Fischer titration',
        },
        {
          id: 'alf-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'N-methylaminopropylamine displacement, then tetrahydrofuroyl amidation',
          description:
            'Displace the 2-chloro substituent with N-methyl-1,3-propanediamine to install the tertiary amine linkage, then acylate the remaining primary amine with tetrahydrofuran-2-carboxylic acid. Because the acyl fragment is racemic and the finished drug is sold as such, no resolution step follows.',
          dependsOnStepId: 'alf-w1',
          reagentsAndBuffer:
            'N-methyl-1,3-propanediamine, tetrahydrofuran-2-carbonyl chloride or the free acid with a carbodiimide coupling reagent, triethylamine or diisopropylethylamine, isopropanol or dimethylformamide, nitrogen atmosphere',
        },
        {
          id: 'alf-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Hydrochloride salt formation and control of the unacylated amine',
          description:
            'Precipitate the hydrochloride and recrystallise. The specification is written around the unacylated intermediate, which is the most likely process impurity, and around the hydrolysis product that regenerates it on storage.',
          dependsOnStepId: 'alf-w2',
          reagentsAndBuffer:
            'Hydrogen chloride in isopropanol, ethanol and water for recrystallisation, activated charcoal, reversed-phase HPLC with gradient elution for related substances, accelerated stability chambers at 40 degrees Celsius and 75% relative humidity',
        },
        {
          id: 'alf-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Application to cells expressing each human alpha-1 subtype separately',
          description:
            'Apply the compound to three stable lines carrying human ADRA1A, ADRA1B or ADRA1D. The receptor faces outward from the plasma membrane, so nothing has to be carried into a cell. For this molecule the three-subtype panel is the assay that tests the marketing claim directly: a drug described as uroselective either shows a subtype preference here or it does not, and the label makes no such claim.',
          dependsOnStepId: 'alf-w3',
          reagentsAndBuffer:
            'CHO or HEK293 lines stably expressing human ADRA1A, ADRA1B or ADRA1D, Ham F-12 or DMEM with 10% fetal bovine serum, geneticin selection, HEPES-buffered assay saline at pH 7.4',
        },
        {
          id: 'alf-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Radioligand competition, calcium mobilisation, and a hERG counter-screen',
          description:
            'Measure displacement of a labelled alpha-1 antagonist at each subtype, then blockade of phenylephrine-evoked calcium to confirm functional antagonism. The hERG counter-screen belongs here because the label carries a quantified QT result: 1.8 msec at the therapeutic 10 mg dose and 4.3 msec at 40 mg, against 11.1 msec for moxifloxacin as positive control. That is a clean negative, and a clean negative is only interpretable if the assay that produced it is stated.',
          dependsOnStepId: 'alf-w4',
          reagentsAndBuffer:
            'Tritiated prazosin as radioligand, phentolamine for non-specific binding, GF/C filter plates, Fluo-4 AM calcium indicator, phenylephrine as agonist, HEK293 line stably expressing hERG, E-4031 as positive control',
        },
      ],
    },
    keyAudits: [
      {
        id: 'alf-a1',
        category: 'failed',
        title: 'ALTESS missed its primary endpoint: no reduction in acute urinary retention',
        laymanSummary:
          'Fifteen hundred men at raised risk of urinary retention took alfuzosin or placebo for two years. Retention happened to 2.1% on the drug and 1.8% on placebo. The endpoint the trial was built around was not met.',
        technicalDetails:
          'ALTESS (NCT00029822) randomised 1,522 men at risk of BPH progression to alfuzosin 10 mg once daily (759) or placebo (763) for two years, with occurrence of a first episode of acute urinary retention as the primary endpoint and BPH-related surgery as a secondary. Alfuzosin did not reduce the risk of retention: 2.1% against 1.8%, P=0.82. Surgery trended in the drug\'s favour without reaching significance: 5.1% against 6.5%, P=0.18, relative risk reduction 22% (95% CI -18 to 48). The findings that were significant — symptom deterioration 11.7% against 16.8%, P=0.0013, and the composite "overall clinical progression" 16.3% against 22.1%, P<0.001 — are described by the publication itself as post hoc analyses. The paper\'s own title states the conclusion in full: prevents overall clinical progression but not acute urinary retention.',
        evidenceSource: 'Roehrborn CG, BJU Int 2006;97:734-741 (PMID 16536764); NCT00029822',
        doi: '10.1111/j.1464-410X.2006.06110.x',
        measuredMetric:
          'Incidence of first episode of acute urinary retention over two years, alfuzosin versus placebo',
        inferredClaim:
          'That an alpha-blocker slows the disease — the endpoints that support this in ALTESS are post hoc, and the pre-specified one failed',
        auditFlag: 'verified',
      },
      {
        id: 'alf-a2',
        category: 'failed',
        title: 'For chronic prostatitis the response rate was 49.3% in both arms',
        laymanSummary:
          'Alfuzosin was widely used for chronic pelvic pain in men on the strength of small trials. A properly powered NIH-network trial found the improvement rate identical in the drug and placebo groups — 49.3% each.',
        technicalDetails:
          'Nickel and colleagues randomised 272 men with chronic prostatitis-chronic pelvic pain syndrome diagnosed within the previous two years and with no prior alpha-blocker exposure, to alfuzosin 10 mg daily or placebo for 12 weeks. The primary outcome was a reduction of at least 4 points on the NIH Chronic Prostatitis Symptom Index, which is the instrument\'s minimal clinically significant difference. In both groups 49.3% of participants achieved it: rate difference associated with alfuzosin 0.1% (95% CI -11.2 to 11.0), P=0.99. A global response assessment agreed: 33.6% on placebo and 34.8% on alfuzosin, P=0.90. Adverse event rates were similar. Two arms landing on the same number to a tenth of a percentage point is as clean a null as this literature produces, and the enrolment criterion — no previous alpha-blocker — was specifically designed to give the drug its best chance.',
        evidenceSource: 'Nickel JC et al., N Engl J Med 2008;359:2663-2673 (PMID 19092152)',
        doi: '10.1056/NEJMoa0803240',
        measuredMetric:
          'Proportion achieving a 4-point or greater fall in NIH-CPSI score at 12 weeks, alfuzosin versus placebo',
        inferredClaim:
          'That alpha-blockade relieves chronic pelvic pain in men because it relieves obstructive urinary symptoms — a mechanistic extrapolation supported by small trials and refuted by the adequately powered one',
        auditFlag: 'verified',
      },
      {
        id: 'alf-a3',
        category: 'measured',
        title: 'About two points of symptom score over placebo, in all three registration trials',
        laymanSummary:
          'On the label\'s own three trials, men on alfuzosin improved by roughly two more points on a thirty-five point symptom questionnaire than men on placebo. The placebo groups improved substantially on their own.',
        technicalDetails:
          'The Clinical Studies section reports three 12-week placebo-controlled trials. International Prostate Symptom Score total fell 3.6 against 1.6 on placebo (p=0.001), 6.9 against 4.9 (p=0.002) and 6.5 against 4.6 (p=0.007). The treatment effect is 2.0, 2.0 and 1.9 points respectively — remarkably consistent, and consistently around two points on an instrument that runs to 35 and whose commonly cited minimally important difference is around three. Note the placebo arms: 1.6, 4.9 and 4.6 points of improvement with no active drug, meaning that in the second and third trials placebo accounted for roughly seven-tenths of the total movement patients experienced.',
        evidenceSource:
          'US prescribing information for alfuzosin hydrochloride extended-release tablets, Clinical Studies section (openFDA drug label endpoint)',
        measuredMetric:
          'Change in International Prostate Symptom Score total at 12 weeks against placebo, in three registration trials',
        auditFlag: 'verified',
      },
      {
        id: 'alf-a4',
        category: 'failed',
        title: 'The flow-rate endpoint missed in one of the three registration trials',
        laymanSummary:
          'Peak urine flow is the one objective measurement in this indication. In the third registration trial, alfuzosin did not beat placebo on it.',
        technicalDetails:
          'Peak urine flow rate rose 1.7 mL/sec against 0.2 on placebo in Trial 1 (p=0.0004), 2.3 against 1.4 in Trial 2 (p=0.03), and 1.5 against 0.9 in Trial 3 (p=0.22). The third result did not reach significance. Peak flow matters more than it appears to, because it is the only endpoint in this indication that a patient cannot influence by how they feel about their treatment — the symptom score is entirely self-reported. A drug whose objective endpoint separates in two trials out of three, by 1.5 and 0.9 mL/sec, is being described accurately when both facts are stated together.',
        evidenceSource:
          'US prescribing information for alfuzosin hydrochloride extended-release tablets, Clinical Studies section (openFDA drug label endpoint)',
        measuredMetric:
          'Change in peak urine flow rate at 12 weeks against placebo, in three registration trials',
        auditFlag: 'caution',
      },
      {
        id: 'alf-a5',
        category: 'inferred',
        title: '"Uroselective" describes the tablet, not the receptor',
        laymanSummary:
          'Alfuzosin is routinely called uroselective, which sounds like it means the drug picks out bladder receptors. The label makes no such claim: it says the drug is selective for one broad receptor family and then lists where in the body those receptors sit.',
        technicalDetails:
          'The US label states alfuzosin is "a selective antagonist of post-synaptic alpha 1-adrenoreceptors, which are located in the prostate, bladder base, bladder neck, prostatic capsule, and prostatic urethra." Read carefully, that is a claim of alpha-1 versus alpha-2 selectivity followed by an anatomical statement about where alpha-1 receptors are found. It is not a claim of preference for the alpha-1A subtype, which is the claim tamsulosin\'s and silodosin\'s labels do make. The term "uroselective" nonetheless appears routinely in the peer-reviewed literature describing this drug — the opening sentence of Mondaini and colleagues\' 2006 European Urology paper calls it "a uroselective alpha(1)-adrenoceptor antagonist". What the extended-release formulation and once-daily schedule genuinely deliver is a lower peak concentration and a smaller haemodynamic effect: in a randomised crossover of 14 healthy young men, 10 mg produced no significant change in systolic or diastolic pressure or heart rate, and no hypotensive episode. That is a real and useful property. It is a pharmacokinetic property, and calling it selectivity moves a claim from one category into another.',
        evidenceSource:
          'US prescribing information for alfuzosin hydrochloride extended-release tablets, Mechanism of Action; Mondaini N et al., Eur Urol 2006;50:1292-1298 (PMID 16837126)',
        doi: '10.1016/j.eururo.2006.06.016',
        inferredClaim:
          'That alfuzosin is receptor-subtype selective for the lower urinary tract — the label claims alpha-1 class selectivity and anatomical distribution, and the clinical difference from the older quinazolines is delivered by formulation',
        auditFlag: 'contested',
      },
      {
        id: 'alf-a6',
        category: 'measured',
        title: 'The QT study is a clean negative, and the label reports the numbers',
        laymanSummary:
          'At the normal dose, alfuzosin lengthened a heart electrical interval by under 2 milliseconds, against 11 for the antibiotic used as the positive control. Even at four times the dose it reached 4.3.',
        technicalDetails:
          'The US label reports mean QTc change of 1.8 msec at the therapeutic 10 mg dose using subject-specific correction, and 4.3 msec at 40 mg, against 11.1 msec for moxifloxacin 400 mg as positive control. No Torsade de Pointes signal emerged in non-US post-marketing experience. This is included as a measured audit point rather than omitted as good news, because it is the counterexample within this file: tolterodine\'s label reports 11.84 msec at twice its therapeutic dose with confidence intervals overlapping the same positive control. Identical study design, opposite result, both stated in the manufacturer\'s own words. It is what a genuinely negative safety study looks like when it is reported in full.',
        evidenceSource:
          'US prescribing information for alfuzosin hydrochloride extended-release tablets, Clinical Pharmacology section (openFDA drug label endpoint)',
        measuredMetric:
          'Mean QTc change at 10 mg and 40 mg against a moxifloxacin positive control',
        auditFlag: 'verified',
      },
      {
        id: 'alf-a7',
        category: 'measured',
        title: 'Two hard contraindications where most of this class carries only cautions',
        laymanSummary:
          'Alfuzosin must not be taken with certain antifungal and HIV drugs, and must not be taken by anyone with moderate or severe liver impairment. These are contraindications, not warnings.',
        technicalDetails:
          'The US label contraindicates use with potent CYP3A4 inhibitors including ketoconazole, itraconazole and ritonavir, and contraindicates use in moderate to severe hepatic insufficiency (Child-Pugh B and C), where plasma clearance falls to one-third to one-quarter of normal and alfuzosin concentrations rise three- to four-fold. Tamsulosin\'s label handles strong CYP3A4 inhibitors with a warning rather than a contraindication. The difference is not arbitrary: alfuzosin has a single dominant clearance route and a formulation designed around a specific concentration profile, so removing that route defeats the design. The commonest adverse effects on the label are dizziness at 5.7% against 2.8% on placebo, upper respiratory infection 3.0% against 0.6%, headache 3.0% against 1.8% and fatigue 2.7% against 1.8%.',
        evidenceSource:
          'US prescribing information for alfuzosin hydrochloride extended-release tablets, Contraindications and Adverse Reactions sections (openFDA drug label endpoint)',
        measuredMetric:
          'Contraindicated interactions and hepatic clearance reduction, with adverse-event incidences against placebo',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'An extended-release tablet built to avoid a peak',
        laymanDesc:
          'The tablet releases the drug gradually so the level in the blood never spikes. That is the whole design: the older drugs in this family dropped blood pressure because their concentration rose sharply after each dose.',
        molecularDetail:
          'Once-daily extended-release tablet, taken with food. Cleared predominantly by CYP3A4, which is why potent inhibitors of that enzyme are a contraindication rather than a caution, and why moderate to severe hepatic impairment is also contraindicated. In 14 healthy young men, 10 mg produced no significant change in systolic pressure, diastolic pressure or heart rate against placebo.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It reaches the receptor without entering any cell',
        laymanDesc:
          'The target is on the outer face of the smooth muscle cell. The drug arrives from the bloodstream and occupies it directly; nothing has to be transported inside.',
        molecularDetail:
          'Alpha-1 adrenoceptors are plasma-membrane G-protein-coupled receptors with an extracellular-facing orthosteric pocket, so there is no transporter step and no intracellular accumulation requirement. This is why alpha-blocker effects appear within days rather than months, and disappear as quickly on stopping.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It blocks the alpha-1 receptor without preferring a subtype',
        laymanDesc:
          'Noradrenaline released by nerves keeps prostate muscle tense. Alfuzosin occupies the receptor it uses. Unlike some drugs in its class it does not favour one variant of that receptor over another.',
        molecularDetail:
          'Competitive antagonism at post-synaptic alpha-1 adrenoceptors. The label names the anatomical sites — prostate, bladder base, bladder neck, prostatic capsule and prostatic urethra — and claims no subtype preference among alpha-1A, alpha-1B and alpha-1D. That absence is the structural reason the drug leaves ejaculation largely alone where the alpha-1A-preferring drugs do not.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The calcium signal holding the muscle tense falls away',
        laymanDesc:
          'Smooth muscle tension is maintained by a continuous internal calcium signal. With the receptor blocked, that signal weakens and the muscle relaxes.',
        molecularDetail:
          'Loss of Gq/11 coupling ends phospholipase C activation, inositol trisphosphate falls, sarcoplasmic reticulum calcium release drops and myosin light-chain kinase activity declines. Prostatic and bladder-neck smooth muscle relaxes. Prostate volume is unchanged, which is why two years of this drug in ALTESS did not reduce acute urinary retention.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Two points of symptom score, and no fewer episodes of retention',
        laymanDesc:
          'The questionnaire improves by about two points more than placebo, and the flow rate by one to two millilitres a second in two of three trials. Over two years, the number of men who ended up unable to pass urine was the same as on placebo.',
        molecularDetail:
          'IPSS fell 3.6, 6.9 and 6.5 against 1.6, 4.9 and 4.6 on placebo across three registration trials. Peak flow rose 1.7, 2.3 and 1.5 mL/sec against 0.2, 1.4 and 0.9, with the third comparison at p=0.22. In ALTESS, acute urinary retention over two years occurred in 2.1% on alfuzosin and 1.8% on placebo, P=0.82.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'ALTESS / EFC4485 (NCT00029822)',
        phase: 'Phase 3 randomised double-blind placebo-controlled, 2 years',
        sampleSize: 1522,
        primaryEndpoint: 'Occurrence of a first episode of acute urinary retention',
        endpointMet: false,
        statisticalPValue:
          'Acute urinary retention 2.1% on alfuzosin against 1.8% on placebo, P=0.82. Surgery 5.1% against 6.5%, P=0.18. Post hoc: symptom deterioration 11.7% against 16.8%, P=0.0013; overall clinical progression 16.3% against 22.1%, P<0.001',
        unreportedAdverseSignals:
          'The endpoints that produced the trial\'s positive headline are identified by the publication as post hoc analyses. The pre-specified primary endpoint was not met and the secondary surgery endpoint did not reach significance.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Alfuzosin for chronic prostatitis-chronic pelvic pain syndrome (Nickel 2008)',
        phase: 'Randomised double-blind placebo-controlled multicentre, 12 weeks',
        sampleSize: 272,
        primaryEndpoint:
          'Proportion with a reduction of at least 4 points in NIH Chronic Prostatitis Symptom Index score from baseline to 12 weeks',
        endpointMet: false,
        statisticalPValue:
          '49.3% in both groups; rate difference 0.1% (95% CI -11.2 to 11.0), P=0.99. Global response 34.8% against 33.6%, P=0.90',
        unreportedAdverseSignals:
          'Enrolment was restricted to men diagnosed within two years and never previously treated with an alpha-blocker, a design chosen to give the drug its best chance. Adverse event rates were similar between groups.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'ALFAURUS (NCT00290030)',
        phase: 'Randomised double-blind placebo-controlled, 6 months',
        sampleSize: 800,
        primaryEndpoint:
          'Successful voiding at an active voiding trial after a first episode of acute urinary retention, absence of relapse over 6 months, and no requirement for surgery',
        endpointMet: false,
        statisticalPValue:
          'No results are posted on the registry record and no linked publication is recorded there. `endpointMet: false` records the absence of a public result, not a missed endpoint.',
        unreportedAdverseSignals:
          'An 800-patient placebo-controlled trial addressing exactly the question ALTESS failed on — whether this drug helps in acute urinary retention — with no result in the public registry record.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'US registration programme, three 12-week placebo-controlled trials (US label)',
        phase: 'Phase 3 randomised double-blind placebo-controlled, 12 weeks',
        sampleSize: 1177,
        primaryEndpoint:
          'Change in International Prostate Symptom Score total, with peak urine flow rate as a co-reported endpoint',
        endpointMet: true,
        statisticalPValue:
          'IPSS -3.6 vs -1.6 (p=0.001), -6.9 vs -4.9 (p=0.002), -6.5 vs -4.6 (p=0.007). Peak flow +1.7 vs +0.2 (p=0.0004), +2.3 vs +1.4 (p=0.03), +1.5 vs +0.9 (p=0.22)',
        unreportedAdverseSignals:
          'The peak flow comparison — the only objective endpoint in this indication — missed significance in the third trial at p=0.22. The sample size given is the enrolment of the largest registered US symptom-score trial on this record, NCT00399464, not the pooled registration total.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'International Prostate Symptom Score fell 3.6, 6.9 and 6.5 points against 1.6, 4.9 and 4.6 on placebo in the three registration trials',
        'Peak urine flow rose 1.7, 2.3 and 1.5 mL/sec against 0.2, 1.4 and 0.9, with the third comparison at p=0.22',
        'Acute urinary retention over two years occurred in 2.1% on alfuzosin and 1.8% on placebo (P=0.82) in 1,522 men',
        'For chronic prostatitis, 49.3% of both arms achieved a 4-point NIH-CPSI improvement; rate difference 0.1% (95% CI -11.2 to 11.0), P=0.99',
        'Mean QTc change of 1.8 msec at 10 mg and 4.3 msec at 40 mg, against 11.1 msec for moxifloxacin',
        'In 14 healthy young men, 10 mg produced no significant change in systolic or diastolic pressure or heart rate and no hypotensive episode',
      ],
      unsupportedInferences: [
        'That "uroselective" denotes receptor-subtype selectivity — the label claims alpha-1 class selectivity and anatomical distribution, and the clinical advantage comes from the extended-release formulation',
        'That relaxing prostatic smooth muscle prevents urinary retention — ALTESS tested exactly that in 1,522 men over two years and found no difference',
        'That alpha-blockade relieves chronic pelvic pain — a 272-man trial produced identical response rates in both arms',
        'That ALTESS showed alfuzosin slows disease progression — the endpoints supporting that are post hoc, and the pre-specified primary endpoint failed',
      ],
      whatFailedInitially: [
        'The registered two-year primary endpoint of ALTESS: acute urinary retention, 2.1% against 1.8%, P=0.82',
        'The chronic prostatitis indication, refuted by an NIH-network trial after years of off-label use built on small studies',
        'The peak flow endpoint in the third registration trial, at p=0.22',
        'The 800-patient ALFAURUS trial in acute urinary retention, with no result posted on the public registry record',
      ],
      realWorldOutcome: [
        'Eleven cents a tablet at United States pharmacy acquisition cost, across only twelve listed products — twice tamsulosin\'s price on a third of the supplier base',
        'Chosen in practice where ejaculatory function matters, because it has no alpha-1A subtype preference to disturb it',
        'Carries two hard contraindications — potent CYP3A4 inhibitors and Child-Pugh B or C hepatic impairment — where most of its class carries only warnings',
      ],
    },
    deliverySystem: {
      type: 'Oral extended-release tablet, once daily, taken with food',
      description:
        'The extended-release geomatrix tablet is the drug\'s actual point of difference. Older quinazoline alpha-blockers required upward titration because their concentration peaked sharply after each dose and dropped blood pressure. Slowing release removes the peak and removes the titration. The tablet is swallowed whole, not crushed or chewed, and is taken with food because absorption depends on it.',
      safetyProfile:
        'Commonest effects are dizziness at 5.7% against 2.8% on placebo, upper respiratory infection, headache and fatigue. The label contraindicates concomitant potent CYP3A4 inhibitors and moderate to severe hepatic insufficiency outright. Warnings cover postural hypotension and syncope, intraoperative floppy iris syndrome in cataract and glaucoma surgery, priapism, and caution in patients with congenital or acquired QT prolongation despite a dedicated QT study showing only 1.8 msec at the therapeutic dose. It states explicitly that the drug is not indicated for hypertension.',
    },
    commonQuestions: [
      {
        q: 'What does "uroselective" actually mean for this drug?',
        a: 'Less than it sounds like. The label says alfuzosin is "a selective antagonist of post-synaptic alpha 1-adrenoreceptors, which are located in the prostate, bladder base, bladder neck, prostatic capsule, and prostatic urethra". Read that carefully: it claims selectivity between two broad receptor families, alpha-1 and alpha-2, and then tells you where alpha-1 receptors are found in the body. It does not claim that the drug prefers the alpha-1A subtype the prostate is richest in — which is a claim tamsulosin\'s and silodosin\'s labels do make. What alfuzosin genuinely has is an extended-release tablet that avoids the concentration spike older drugs in its family produced, which is why it needs no dose titration and why it left blood pressure and heart rate unchanged in a crossover study of healthy young men. That is a real advantage delivered by the formulation.',
        auditNote:
          'The word appears throughout the peer-reviewed literature on this drug, including in the opening sentence of papers about it. Its currency is not in doubt; what it denotes is.',
      },
      {
        q: 'Will this stop me ending up unable to pass urine?',
        a: 'The trial designed to answer that found it does not. ALTESS randomised 1,522 men at raised risk of progression to alfuzosin or placebo for two years, with the first episode of acute urinary retention as the primary endpoint. It occurred in 2.1% on the drug and 1.8% on placebo, P=0.82. Surgery was 5.1% against 6.5%, which did not reach significance either at P=0.18. The trial did find less symptom deterioration on the drug, 11.7% against 16.8%, and the publication states plainly that this and the composite progression endpoint were post hoc analyses. The drug relaxes the muscle around the urethra and does nothing to the size of the gland, and over two years that distinction showed up exactly where the mechanism predicts it would.',
      },
      {
        q: 'My doctor mentioned this for pelvic pain. Does it work for that?',
        a: 'The largest and best-designed trial says no, and the numbers are unusually stark. Nickel and colleagues randomised 272 men with chronic prostatitis-chronic pelvic pain syndrome to alfuzosin or placebo for 12 weeks, restricting entry to men diagnosed within two years and never previously given an alpha-blocker — conditions chosen to give the drug the best possible chance. The primary outcome was a fall of at least 4 points on the NIH symptom index, the smallest change considered clinically meaningful. Exactly 49.3% of each group achieved it. The rate difference attributable to alfuzosin was 0.1%, with a confidence interval from -11.2% to 11.0% and P=0.99. A separate global assessment agreed. Note that half of each group improved: the condition responds to being in a trial, which is why smaller uncontrolled studies had looked encouraging.',
        auditNote:
          'Two arms landing within a tenth of a percentage point of each other is the shape of a genuine null, not of an underpowered miss.',
      },
      {
        q: 'Why does this one have contraindications when similar drugs only have warnings?',
        a: 'Because its clearance depends heavily on a single enzyme and its formulation depends on a specific concentration profile. The label contraindicates potent CYP3A4 inhibitors — ketoconazole, itraconazole, ritonavir — outright, rather than cautioning against them, because blocking that enzyme removes the route the drug leaves the body by. For the same reason it contraindicates moderate to severe liver impairment: in Child-Pugh B and C, plasma clearance falls to a third or a quarter of normal and concentrations rise three- to four-fold. The extended-release design that makes this drug tolerable at a fixed dose is the same design that makes it unforgiving when clearance is impaired.',
      },
      {
        q: 'Why does this page not show a manufacturing cost?',
        a: 'Because no per-dose cost-of-production figure for alfuzosin could be verified and cited. The cost-of-production literature checked publishes an estimation method and aggregate ranges rather than a per-dose figure for this molecule. What is shown instead is what pharmacies pay — about eleven cents a tablet in the CMS acquisition-cost survey — which is a price, not a cost of manufacture. It is roughly twice tamsulosin\'s figure, and the acquisition-cost file lists twelve suppliers for alfuzosin against thirty-three for tamsulosin.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Roehrborn CG. Alfuzosin 10 mg once daily prevents overall clinical progression of benign prostatic hyperplasia but not acute urinary retention: results of a 2-year placebo-controlled study. BJU Int 2006;97:734-741',
        identifier: '10.1111/j.1464-410X.2006.06110.x',
        kind: 'doi',
      },
      {
        label:
          'ALTESS / EFC4485 — two-year placebo-controlled trial of alfuzosin 10 mg on acute urinary retention and need for surgery',
        identifier: 'NCT00029822',
        kind: 'nct',
      },
      {
        label:
          'Nickel JC, Krieger JN, McNaughton-Collins M, et al. Alfuzosin and symptoms of chronic prostatitis-chronic pelvic pain syndrome. N Engl J Med 2008;359:2663-2673',
        identifier: '10.1056/NEJMoa0803240',
        kind: 'doi',
      },
      {
        label:
          'Mondaini N, Giubilei G, Ungar A, et al. Alfuzosin (10 mg) does not affect blood pressure in young healthy men. Eur Urol 2006;50:1292-1298',
        identifier: '10.1016/j.eururo.2006.06.016',
        kind: 'doi',
      },
      {
        label:
          'ALFAURUS — placebo-controlled trial of alfuzosin 10 mg in the management of a first episode of acute urinary retention',
        identifier: 'NCT00290030',
        kind: 'nct',
      },
      {
        label:
          'Placebo-controlled trial of alfuzosin with change in International Prostate Symptom Score as primary endpoint',
        identifier: 'NCT00399464',
        kind: 'nct',
      },
      {
        label:
          'US prescribing information for alfuzosin hydrochloride extended-release tablets — mechanism of action, clinical pharmacology, contraindications, clinical studies and adverse reactions (openFDA drug label endpoint)',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22alfuzosin+hydrochloride%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 2092 — alfuzosin structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2092',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
]
