import type { SeedDossier } from '@/lib/seed-types'

/**
 * Enriched batch 13 — the immunosuppressants: four glucocorticoids, two antimetabolites, two
 * calcineurin inhibitors and two conventional disease-modifying antirheumatic drugs.
 *
 * They are grouped because they share one structural problem that makes the class worth auditing.
 * None of them is aimed at a disease. Every one of them turns down a general-purpose defence
 * system, and the benefit and the harm come out of the same mechanism, at the same time, in the
 * same patient. A page that reports the remission rate and not the infection rate, the graft
 * survival and not the kidney damage, the anti-inflammatory effect and not the fracture risk, is
 * not reporting the drug.
 *
 * Editorial layer written over the machine-enriched records: the verdict, the mechanism carousel
 * and the audits, which no pipeline can produce. The identity facts — slug, trade names, sponsor,
 * approval year, SMILES, molecular formula and weight — are copied from the enriched record rather
 * than researched again; each SMILES was re-checked against the PubChem PUG REST property endpoint
 * while writing and all ten matched formula and weight exactly.
 *
 * Every DOI, PMID, NCT number, ISRCTN number and FDA application number below was resolved at the
 * time of writing through NCBI E-utilities, the Crossref API or the openFDA Drugs@FDA endpoint.
 * Every effect size, arm size, hazard ratio, confidence interval and p-value is copied from the
 * published abstract or from the United States label text, never from memory. Where a number could
 * not be sourced, the field is absent.
 *
 * Five conventions apply to the whole group.
 *
 * 1. THE STORED TRIAL LIST WAS NOT USABLE AND WAS NOT USED. The ingestion pipeline attached six
 *    ClinicalTrials.gov records to each of these drugs by keyword match, ranked by enrolment. For
 *    a drug in use since 1955 that returns things like a health-system pharmacogenetics costing
 *    study and a 126,870-participant outreach programme, every one of them carrying "Result not
 *    recorded on this page". The `trials` array on each dossier here was rewritten from the
 *    published registration and landmark trials instead, and the registry identifier is given so a
 *    reader can check it.
 *
 * 2. PRICING IS A PRICE, NOT A COST. `retailPricePerDoseOrYear` carries the United States pharmacy
 *    acquisition cost held on this record, from the CMS National Average Drug Acquisition Cost
 *    file. `synthesisCostPerDose` is empty on every dossier here: the cost-of-production
 *    literature checked is Hill, Barber and Gotham in BMJ Global Health, which publishes an
 *    estimation formula and an aggregate range of US$0.01 to US$1.45 per unit across the WHO
 *    Essential Medicines List rather than per-drug figures that could be verified for these
 *    molecules. It is cited as `costSource` so a reader can see what was checked and what it does
 *    not contain. `openPatentNotes` carries the actual patent and generic history, not a repeated
 *    apology about what NADAC is.
 *
 * 3. EVERY DOSSIER STATES WHAT THE IMMUNE SUPPRESSION COSTS. Serious infection, malignancy,
 *    nephrotoxicity, bone loss, teratogenicity: whichever applies is on the page as a measured
 *    number with a source, not as a gesture at "side effects".
 *
 * 4. THE AUDITS ARE NOT A HIGHLIGHT REEL. The literature here supplies failures readily.
 *    Prednisolone missed its primary endpoint in the largest alcoholic hepatitis trial ever run;
 *    dexamethasone's meningitis result did not replicate in Africa or Vietnam; methylprednisolone
 *    killed people in the CRASH head-injury trial and lost its spinal-cord-injury indication;
 *    hydrocortisone in septic shock has two adequately powered trials that disagree; azathioprine
 *    failed to induce remission in Crohn's disease; mycophenolic acid was approved on equivalence
 *    to a drug it was meant to improve on; calcineurin-inhibitor nephrotoxicity has been both
 *    demonstrated and disputed in the same decade; sulfasalazine was designed on a hypothesis that
 *    turned out to be wrong; and leflunomide gained a boxed warning eight years after approval.
 *
 * 5. NO DOSING, TAPERING, MONITORING SCHEDULE OR PROCUREMENT GUIDANCE. Strengths and durations
 *    appear only where they are part of a trial's description or a label's identity. Nothing here
 *    tells a reader what to take, how to come off it, or where to get it.
 */

const NADAC_SOURCE = {
  label: 'CMS National Average Drug Acquisition Cost (NADAC) file, United States pharmacy pricing',
  identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
  kind: 'url' as const,
}

const COST_OF_PRODUCTION_SOURCE = {
  label:
    'Hill AM, Barber MJ, Gotham D. Estimated costs of production and potential prices for the WHO Essential Medicines List. BMJ Glob Health 2018;3:e000571 — the cost-of-production literature checked for this group; it publishes an estimation formula and an aggregate range of US$0.01 to US$1.45 per unit, and no per-dose figure for these molecules could be verified from it',
  identifier: '10.1136/bmjgh-2017-000571',
  kind: 'doi' as const,
}

export const ENRICHED_BATCH_13_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // 1. Prednisolone — the workhorse glucocorticoid. Unambiguous in Bell's palsy, unambiguous in
  //    slowing joint erosion, and a miss in the largest alcoholic hepatitis trial ever run.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'prednisolone',
    name: 'Prednisolone',
    tradeName: 'Prednisolone Sodium Phosphate / Orapred / Pediapred / Pred Forte / Hydeltrasol',
    sponsor:
      'No single sponsor — off patent for half a century and made by dozens of manufacturers. The reference oral solution is PEDIAPRED, NDA 019157; Pfizer holds several of the historical brand names.',
    targetGene: 'NR3C1',
    targetProtein:
      'Glucocorticoid receptor (NR3C1); at higher exposure it also occupies the mineralocorticoid receptor NR3C2, which is where the salt and water effects come from',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1955,
    indication:
      'Allergic states, dermatologic diseases, endocrine disorders including adrenocortical insufficiency, gastrointestinal diseases, haematologic disorders, neoplastic disease, nervous system disorders, ophthalmic diseases, renal disease including nephrotic syndrome, respiratory disease, rheumatic disorders and a range of other inflammatory conditions listed on the label',
    patientFriendlyIndication:
      'Inflammation and overactive immune responses, across a very wide range of conditions',
    anatomicalSite:
      'The cytoplasm and then the nucleus of almost every nucleated cell in the body — the glucocorticoid receptor is not tissue-restricted, and that is the whole story of this drug',
    conditionContext: {
      conditionExplainer:
        'Inflammation is the body damaging its own tissue while trying to defend it. Immune cells release signalling proteins that recruit more immune cells, and in an autoimmune or allergic condition that loop does not switch itself off. The body already has a brake on the loop: cortisol, made by the adrenal glands.',
      whyItMatters:
        'Prednisolone is a manufactured version of that brake, and it works within hours in conditions where nothing else does. It is also the reason glucocorticoids are the most over-prescribed class in medicine: one in five insured American adults received at least one short course in a three-year period.',
      whoTakesThis:
        'People with asthma flares, inflammatory bowel disease, rheumatoid arthritis, nephrotic syndrome, autoimmune skin disease, transplant rejection, some cancers, and adrenal insufficiency, where it is replacing a hormone rather than suppressing anything.',
      clinicalGoals:
        'Bring inflammation down fast enough to stop tissue damage, then get off the drug or onto something else before the harms accumulate. The second half of that sentence is the part the trials measure worst.',
    },
    oneSentenceVerdict:
      'A synthetic cortisol that binds the glucocorticoid receptor in nearly every cell and switches off the genes that make inflammatory signals — 83.0% of patients recovered facial function by three months in the Bell’s palsy trial against 63.6% without it (p<0.001), and in the largest alcoholic hepatitis trial ever run it missed its primary endpoint with an odds ratio for 28-day mortality of 0.72 (95% CI 0.52 to 1.01, p=0.06) while doubling serious infections.',
    laymanHowItWorks:
      'Your adrenal glands make a hormone called cortisol that tells cells to stop producing inflammatory proteins. Prednisolone is a manufactured version of that hormone, altered so it lasts longer and acts more on inflammation than on salt and water balance. Once inside a cell it binds a receptor that travels into the nucleus, settles on the DNA, and silences the genes that make the signals of inflammation. Because that receptor sits in nearly every cell in the body, the drug cannot be aimed: the same switch that quietens a swollen joint also thins bone, raises blood sugar and blunts the response to infection.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 72,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$4.39 per millilitre of oral solution at United States pharmacy acquisition cost (CMS NADAC, generic, median across 38 listed products, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'First marketed in 1955 and out of patent since the 1970s. There is no composition-of-matter protection anywhere in the world and dozens of manufacturers make it. Prednisolone appears on the WHO Model List of Essential Medicines. Where a modern price appears on a prednisolone product it belongs to the formulation — an ophthalmic emulsion, an orally disintegrating tablet — and not to the molecule.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Nothing outside the glucocorticoid class does what prednisolone does at the speed it does it, and the realistic alternatives are almost all other glucocorticoids differing in half-life, mineralocorticoid activity and where they are delivered. The genuinely different option is a steroid-sparing agent — the other nine drugs in this batch exist largely to let people come off glucocorticoids — and those work over months, not hours. Nothing sold as a food or a supplement substitutes for a glucocorticoid, and stopping one abruptly after prolonged use can precipitate an adrenal crisis.',
      conventionalRx: [
        {
          name: 'Prednisone',
          class: 'Glucocorticoid, prodrug of prednisolone',
          howItCompares:
            'Chemically the 11-keto form of the same molecule. It has no activity until the liver enzyme 11-beta-hydroxysteroid dehydrogenase type 1 reduces it to prednisolone, which is why prednisolone rather than prednisone is used where liver conversion cannot be assumed. For everyone else the two are treated as interchangeable at the same milligram figure.',
          typicalCost:
            'Among the cheapest drugs in the United States formulary; a generic tablet costs cents at pharmacy acquisition cost',
          prosAndCons:
            'Pros: identical clinical effect in most people, universally stocked. Cons: an extra metabolic step that is not guaranteed in severe liver disease, and no advantage anywhere else.',
        },
        {
          name: 'Dexamethasone',
          class: 'Fluorinated glucocorticoid',
          howItCompares:
            'Roughly six to seven times more potent per milligram, with a much longer biological half-life and essentially no mineralocorticoid activity, so it does not cause salt and water retention. That makes it the choice where oedema matters — cerebral oedema, croup, and the COVID-19 indication established by RECOVERY — and a poor choice where adrenal replacement is the goal.',
          typicalCost:
            'US$0.2461 per tablet at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: no salt retention, long action, the best mortality evidence of any steroid in any condition. Cons: the long half-life means adrenal suppression accumulates faster, and it is harder to taper.',
        },
        {
          name: 'Budesonide (oral, controlled-ileal-release)',
          class: 'Glucocorticoid with high first-pass metabolism',
          howItCompares:
            'Designed so that about nine-tenths of an absorbed dose is destroyed by the liver before reaching the general circulation, which confines most of the steroid effect to the gut wall. In Crohn’s disease and microscopic colitis it buys much of the local benefit with a smaller share of the systemic harm. It is not a substitute anywhere the inflammation is not in the bowel.',
          typicalCost:
            'Generic capsules are available in the United States; the branded delayed-release formulations remain substantially more expensive',
          prosAndCons:
            'Pros: markedly less adrenal suppression and bone loss than prednisolone at equivalent gut effect. Cons: only works for gut disease, and is less effective than prednisolone in severe flares.',
        },
        {
          name: 'Methotrexate, azathioprine and the other steroid-sparing agents',
          class: 'Conventional disease-modifying antirheumatic drugs',
          howItCompares:
            'These do not replace prednisolone in an acute flare, because they take six weeks to three months to work. They replace the reason the flare keeps coming back, which is what allows the steroid to be stopped. In early rheumatoid arthritis the low-dose prednisolone trial that showed slowed joint erosion was run in addition to these drugs, not instead of them.',
          typicalCost:
            'All are generic; methotrexate and azathioprine are among the cheapest immunosuppressants available',
          prosAndCons:
            'Pros: allow glucocorticoid withdrawal, which is the single biggest safety gain available in this class. Cons: slow onset, each carries its own monitoring burden and its own harms, several are teratogenic.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Never stop a prolonged course abruptly',
          action:
            'Ask the prescriber how to come off it before starting, and raise it again if a course runs longer than planned.',
          patientImpact:
            'Prolonged glucocorticoid exposure suppresses the body’s own cortisol production. Stopping suddenly can leave a person unable to mount a stress response, which presents as collapse, low blood pressure and low blood sodium.',
          clinicalPrecaution:
            'The label carries this warning explicitly. Recovery of the hypothalamic-pituitary-adrenal axis can take months after a long course, and during that window an illness or an operation is the trigger that exposes it.',
        },
        {
          name: 'Treat a new fever as urgent while on it',
          action:
            'Report fever, breathlessness or a spreading skin infection promptly rather than waiting to see whether it settles.',
          patientImpact:
            'In a nationwide United States cohort of 1,548,945 adults, the rate of sepsis was 5.30 times higher in the 30 days after starting even a short course of oral corticosteroid. Glucocorticoids also mask the fever and the pain that would otherwise signal an infection.',
          clinicalPrecaution:
            'The same analysis found the risk persisted at prednisone-equivalent doses below 20 mg per day, so a low-dose course is not a safe one in this respect.',
        },
        {
          name: 'Ask about bone protection early, not late',
          action:
            'Raise the question of bone density and vitamin D status when a course is expected to run beyond three months.',
          patientImpact:
            'A meta-analysis of 66 bone-density papers and 23 fracture papers found fracture risk rises within three to six months of starting oral corticosteroids, independent of the underlying disease, age and sex, and falls again after stopping.',
          clinicalPrecaution:
            'The same analysis identified more than 5 mg daily of prednisolone or equivalent as the threshold above which bone density falls measurably. That is a description of a published finding, not an instruction about what to take.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C[C@]12C[C@@H]([C@H]3[C@H]([C@@H]1CC[C@@]2(C(=O)CO)O)CCC4=CC(=O)C=C[C@]34C)O',
      chemicalFormula: 'C21H28O5',
      molecularWeight: '360.40 g/mol',
      targetReceptorAffinity:
        'Binds the glucocorticoid receptor with roughly four times the relative affinity of cortisol and about four times its anti-inflammatory potency per milligram. It retains a small fraction of cortisol’s mineralocorticoid activity, which is why it can still cause fluid retention where dexamethasone does not.',
      structureSource: {
        label:
          'PubChem CID 5755 (prednisolone) — canonical SMILES, molecular formula C21H28O5 and molecular weight 360.4 g/mol, re-checked against the PUG REST property endpoint',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5755',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'pred-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity and stereochemical purity of the pregnane skeleton',
          description:
            'Confirm the configuration at all six stereocentres of the steroid nucleus and the presence of the 1,2-double bond that distinguishes prednisolone from cortisol. The 11-beta hydroxyl is the group that decides whether the molecule is active at all; its 11-keto epimer is prednisone, a prodrug with no intrinsic receptor affinity.',
          reagentsAndBuffer:
            'Prednisolone USP reference standard, chiral HPLC with polysaccharide stationary phase, 1H and 13C NMR in DMSO-d6, ultraviolet absorbance at 242 nm for the dienone chromophore',
        },
        {
          id: 'pred-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Microbial 1,2-dehydrogenation of hydrocortisone',
          description:
            'Introduce the C1-C2 double bond into hydrocortisone using a bacterial 3-ketosteroid-delta-1-dehydrogenase, most often from Arthrobacter simplex. This single biotransformation is what converts the natural hormone into the synthetic anti-inflammatory, raising glucocorticoid potency roughly fourfold while reducing mineralocorticoid activity, and it is the step that made corticosteroids affordable in the 1950s.',
          dependsOnStepId: 'pred-w1',
          reagentsAndBuffer:
            'Arthrobacter simplex whole-cell culture or immobilised delta-1-dehydrogenase, hydrocortisone substrate in a co-solvent such as methanol or a cyclodextrin complex, phosphate buffer at pH 7, aerated fermentation at 30 degrees C',
        },
        {
          id: 'pred-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation away from the unconverted substrate and over-oxidised by-products',
          description:
            'Separate prednisolone from residual hydrocortisone, from the 11-keto species prednisone, and from 9,11-dehydro degradation products. Prednisone is the impurity that matters most, because it is itself a marketed drug and would not be detected by a simple potency assay.',
          dependsOnStepId: 'pred-w2',
          reagentsAndBuffer:
            'Ethyl acetate or acetone extraction, activated charcoal decolourisation, crystallisation from aqueous ethanol, reversed-phase HPLC against USP related-compounds standards',
        },
        {
          id: 'pred-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Receptor translocation assay in a glucocorticoid-responsive cell line',
          description:
            'Dose cells expressing a GFP-tagged glucocorticoid receptor and confirm that the receptor actually leaves the cytoplasm for the nucleus. Ligand binding alone is not the endpoint: the receptor must shed its chaperone complex and translocate, and a compound that binds without triggering translocation is an antagonist, not an agonist.',
          dependsOnStepId: 'pred-w3',
          reagentsAndBuffer:
            'A549 or HeLa cells stably expressing GFP-tagged NR3C1, charcoal-stripped fetal bovine serum to remove endogenous steroid, live-cell confocal imaging, mifepristone as an antagonist control',
        },
        {
          id: 'pred-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Transactivation and transrepression read out separately',
          description:
            'Measure GRE-driven reporter activity and NF-kappaB-driven reporter suppression in the same system, because they are the two halves of the glucocorticoid effect and the harms track mostly with the first. A compound that transrepresses without transactivating has been the target of dissociated-steroid programmes for thirty years, and none has reached the market.',
          dependsOnStepId: 'pred-w4',
          reagentsAndBuffer:
            'MMTV-luciferase reporter for transactivation, NF-kappaB-luciferase reporter with TNF-alpha stimulation for transrepression, dual-luciferase substrate, dexamethasone as the potency reference',
        },
      ],
    },
    keyAudits: [
      {
        id: 'pred-a1',
        category: 'measured',
        title: 'Bell’s palsy: 83.0% recovered against 63.6%, in a placebo-controlled trial',
        laymanSummary:
          'This is the cleanest result the drug has. Patients with sudden one-sided facial paralysis were randomly given prednisolone, an antiviral, both or dummy tablets within three days of onset. Four in five on prednisolone had full facial function back at three months. Fewer than two in three did without it. The antiviral did nothing.',
        technicalDetails:
          'A double-blind, placebo-controlled, factorial trial recruited 551 patients within 72 hours of symptom onset and assessed final outcomes in 496. Recovery of facial function on the House-Brackmann scale at 3 months was 83.0% with prednisolone against 63.6% without it (P<0.001), and at 9 months 94.4% against 81.6% (P<0.001). Acyclovir showed no benefit alone (71.2% against 75.7%, adjusted P=0.50) and added nothing to prednisolone. There were no serious adverse events in any group.',
        evidenceSource:
          'Sullivan FM et al., N Engl J Med 2007;357:1598-1607 (ISRCTN71548196)',
        doi: '10.1056/NEJMoa072006',
        measuredMetric:
          'Complete recovery of facial function on the House-Brackmann scale at 3 and 9 months, against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'pred-a2',
        category: 'measured',
        title: 'Early rheumatoid arthritis: joint erosion nearly stopped over two years',
        laymanSummary:
          'This one measured damage on X-rays rather than how patients felt. Over two years, hands in the prednisolone group barely changed. Hands in the placebo group visibly eroded. It is the trial that established a glucocorticoid can alter the course of the disease and not only its symptoms.',
        technicalDetails:
          'A randomised, double-blind trial gave 128 adults with rheumatoid arthritis of less than two years’ duration either oral prednisolone 7.5 mg daily or placebo for two years, alongside their other treatment; radiographic analysis was based on 106 patients with films at baseline and two years. Larsen index scores rose by a mean of 0.72 units on prednisolone against 5.37 units on placebo (P=0.004). Of 147 hands with no erosions at baseline, 22.1% in the prednisolone group and 45.6% in the placebo group had acquired erosions at two years — a difference of 23.5 percentage points (95% CI 5.9 to 40.7, P=0.007). There was no difference between groups in the acute-phase response.',
        evidenceSource:
          'Kirwan JR, Arthritis and Rheumatism Council Low-Dose Glucocorticoid Study Group, N Engl J Med 1995;333:142-146',
        doi: '10.1056/NEJM199507203330302',
        measuredMetric:
          'Radiographic Larsen index progression and new erosion formation over two years, against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'pred-a3',
        category: 'failed',
        title: 'STOPAH: the alcoholic hepatitis indication missed its primary endpoint',
        laymanSummary:
          'Prednisolone had been recommended for severe alcoholic hepatitis for decades. The definitive trial randomised more than a thousand patients and found a survival benefit at 28 days that did not reach statistical significance, nothing at all at 90 days or a year, and nearly twice the rate of serious infection.',
        technicalDetails:
          'STOPAH was a multicentre, double-blind, 2-by-2 factorial trial in 1,103 patients with severe alcoholic hepatitis, with primary-endpoint data from 1,053. Mortality at 28 days was 17% (45 of 269) on placebo-placebo, 14% (38 of 266) on prednisolone-placebo, 19% (50 of 258) on pentoxifylline-placebo and 13% (35 of 260) on both. The odds ratio for 28-day mortality with prednisolone was 0.72 (95% CI 0.52 to 1.01, P=0.06). There were no significant between-group differences at 90 days or at 1 year. Serious infections occurred in 13% of patients treated with prednisolone against 7% of those not treated with it (P=0.002).',
        evidenceSource:
          'Thursz MR et al., N Engl J Med 2015;372:1619-1628 (STOPAH, ISRCTN88782125, EudraCT 2009-013897-42)',
        doi: '10.1056/NEJMoa1412278',
        measuredMetric: 'All-cause mortality at 28 days, 90 days and 1 year, against matched placebo',
        auditFlag: 'caution',
      },
      {
        id: 'pred-a4',
        category: 'failed',
        title: 'Preschool viral wheeze: no better than placebo in 687 children',
        laymanSummary:
          'A five-day course of prednisolone was standard practice for small children brought to hospital wheezing with a cold. A trial of 700 of them found it did not shorten their stay in hospital, and did not improve a single secondary measure either.',
        technicalDetails:
          'A randomised, double-blind, placebo-controlled trial in three English hospitals enrolled 700 children aged 10 to 60 months presenting with mild-to-moderate virus-induced wheeze; 687 were analysed (343 prednisolone, 344 placebo). Duration of hospitalisation was 13.9 hours on placebo against 11.0 hours on prednisolone, a ratio of geometric means of 0.90 (95% CI 0.77 to 1.05) — not significant. There was no significant difference in the Preschool Respiratory Assessment Measure, albuterol use, the 7-day symptom score, or the number of adverse events.',
        evidenceSource: 'Panickar J et al., N Engl J Med 2009;360:329-338 (ISRCTN58363576)',
        doi: '10.1056/NEJMoa0804897',
        measuredMetric: 'Duration of hospitalisation, against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'pred-a5',
        category: 'failed',
        title: 'PREDNOS: a longer course in childhood nephrotic syndrome changed nothing',
        laymanSummary:
          'Earlier reviews had suggested that giving prednisolone for four months rather than two would keep childhood nephrotic syndrome from coming back. A properly blinded trial gave the extra fourteen weeks as real drug or as matching placebo. Relapse happened at the same rate either way.',
        technicalDetails:
          'PREDNOS randomised 237 children aged 1 to 14 with a first episode of steroid-sensitive nephrotic syndrome to an extended 16-week prednisolone course (total 3,150 mg/m2) or a standard 8-week course (total 2,240 mg/m2), with matching placebo so tablet counts were identical, across 125 UK hospitals. There was no significant difference in time to first relapse (hazard ratio 0.87, 95% CI 0.65 to 1.17, log-rank P=0.28), nor in frequently relapsing nephrotic syndrome (53% against 50%, P=0.75), steroid-dependent disease (42% against 44%, P=0.77) or need for other immunosuppression (54% against 56%, P=0.81).',
        evidenceSource: 'Webb NJA et al., BMJ 2019;365:l1800 (PREDNOS, ISRCTN16645249)',
        doi: '10.1136/bmj.l1800',
        measuredMetric: 'Time to first relapse over a minimum 24 months, extended against standard course',
        auditFlag: 'verified',
      },
      {
        id: 'pred-a6',
        category: 'measured',
        title: 'Even a short course carries a measurable harm signal',
        laymanSummary:
          'A five-day course of steroids is treated as trivial. In a study of more than one and a half million American adults, the thirty days after such a course carried five times the rate of blood poisoning, three times the rate of blood clots and nearly twice the rate of fracture.',
        technicalDetails:
          'A retrospective cohort and self-controlled case series across a nationwide United States private-insurance dataset covered 1,548,945 adults aged 18 to 64, of whom 327,452 (21.1%) received at least one outpatient prescription for a course of oral corticosteroid shorter than 30 days over three years. Within 30 days of initiation the incidence rate ratio was 5.30 (95% CI 3.80 to 7.41) for sepsis, 3.33 (2.78 to 3.99) for venous thromboembolism and 1.87 (1.69 to 2.07) for fracture, diminishing over the following 31 to 90 days. The increased risk persisted at prednisone-equivalent doses below 20 mg per day: 4.02 for sepsis, 3.61 for venous thromboembolism, 1.83 for fracture, all P<0.001. The commonest indications were upper respiratory infections, spinal conditions and allergies.',
        evidenceSource: 'Waljee AK et al., BMJ 2017;357:j1415',
        doi: '10.1136/bmj.j1415',
        measuredMetric:
          'Incidence rate ratios for sepsis, venous thromboembolism and fracture in the 30 days after a short oral corticosteroid course',
        auditFlag: 'caution',
      },
      {
        id: 'pred-a7',
        category: 'inferred',
        title: 'The "steroid-equivalent dose" table is a potency conversion, not an outcome equivalence',
        laymanSummary:
          'Every hospital has a chart saying that so many milligrams of one steroid equals so many of another. Those numbers came from measurements of anti-inflammatory potency in the 1950s and 1960s. They were never validated against clinical outcomes, and they do not carry over to bone loss, blood sugar or adrenal suppression, which follow the drug’s half-life rather than its potency.',
        technicalDetails:
          'Glucocorticoid equivalence tables derive from relative receptor affinity and from bioassays of anti-inflammatory activity, and rank prednisolone at roughly four times cortisol and dexamethasone at roughly 25 to 30 times cortisol. Duration of hypothalamic-pituitary-adrenal axis suppression tracks the biological half-life, which is 12 to 36 hours for prednisolone and 36 to 72 hours for dexamethasone, so equal anti-inflammatory doses do not produce equal adrenal suppression. Mineralocorticoid activity diverges further still: prednisolone retains a fraction of cortisol’s sodium-retaining effect and dexamethasone has essentially none. No randomised trial has shown that equivalent-dose substitution between glucocorticoids produces equivalent clinical outcomes, and the class has no head-to-head programme comparable to the one that exists for, say, the statins.',
        evidenceSource:
          'United States prescribing information for prednisolone sodium phosphate oral solution (PEDIAPRED, NDA 019157) and for dexamethasone tablets, pharmacology sections',
        inferredClaim:
          'That the standard equivalence table lets one glucocorticoid be swapped for another with the same benefit and the same harm — it is a potency conversion built from anti-inflammatory bioassay, and half-life-driven harms do not follow it',
        auditFlag: 'contested',
      },
      {
        id: 'pred-a8',
        category: 'conclusion_shift',
        title: 'From "steroids are safe at low dose" to "the threshold is lower than we thought"',
        laymanSummary:
          'For decades a small daily dose was treated as effectively harmless. Two large observational analyses moved that line: bone density starts falling above five milligrams a day, and infection and clot risk rise even on short courses under twenty milligrams a day. The class did not become more dangerous; the measurement got better.',
        technicalDetails:
          'A meta-analysis of 66 bone-mineral-density papers and 23 fracture papers found strong correlations between cumulative dose and bone loss and between daily dose and fracture risk, with fracture risk rising within 3 to 6 months of starting and falling after stopping, independent of underlying disease, age and sex; it identified more than 5 mg daily of prednisolone or equivalent as the threshold for measurable bone loss. The 2017 nationwide cohort then showed the sepsis, thromboembolism and fracture signal persisted below a 20 mg prednisone-equivalent daily dose in short courses. Both are observational, and confounding by indication is the standing objection: sicker people get more steroid. The self-controlled case series design in the second study, which compares each person with themselves, is the response to that objection rather than a refutation of it.',
        evidenceSource:
          'van Staa TP, Leufkens HG, Cooper C, Osteoporos Int 2002;13:777-787; Waljee AK et al., BMJ 2017;357:j1415',
        doi: '10.1007/s001980200108',
        inferredClaim:
          'That low-dose glucocorticoid therapy is free of meaningful harm — an inference from the absence of measurement, which two large analyses have now filled in',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed or injected, and already active',
        laymanDesc:
          'Unlike its close relative prednisone, prednisolone does not need the liver to switch it on. It is the working form from the moment it is absorbed, which is why it is preferred when liver function cannot be relied on.',
        molecularDetail:
          'Prednisolone is the 11-beta-hydroxy species. Prednisone is its 11-keto prodrug and has no intrinsic receptor affinity until 11-beta-hydroxysteroid dehydrogenase type 1, largely hepatic, reduces it. Prednisolone is extensively protein bound, principally to transcortin at low concentrations and to albumin once transcortin saturates, which gives it non-linear kinetics across the clinical range.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It walks straight through the cell membrane',
        laymanDesc:
          'Steroids are greasy enough to cross a cell membrane without a transporter or a receptor on the surface. There is no gate to select which cells receive the drug, which is the reason its effects are body-wide.',
        molecularDetail:
          'Passive diffusion across the lipid bilayer, driven by the logP of about 1.9 held on this record. Intracellular access is modulated rather than gated: the efflux pump P-glycoprotein exports some glucocorticoids, and 11-beta-hydroxysteroid dehydrogenase type 2 in kidney and colon inactivates cortisol locally to protect the mineralocorticoid receptor — a protection prednisolone partly evades.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It frees a receptor that was being held in reserve',
        laymanDesc:
          'Waiting in the cytoplasm is a receptor clamped in a complex of chaperone proteins. When prednisolone binds, the clamp releases and the receptor is free to move.',
        molecularDetail:
          'The unliganded glucocorticoid receptor (NR3C1) is held in an inactive multiprotein complex with HSP90, HSP70, p23 and an immunophilin, usually FKBP51. Ligand binding triggers exchange of FKBP51 for FKBP52, which recruits dynein and licenses nuclear import through the receptor’s two nuclear localisation signals.',
        iconName: 'Unlock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The receptor enters the nucleus and rewrites which genes are read',
        laymanDesc:
          'The freed receptor travels into the nucleus and does two things at once: it switches some genes on by landing directly on the DNA, and it switches others off by grabbing the proteins that would have turned them on.',
        molecularDetail:
          'Homodimers bind glucocorticoid response elements to transactivate genes including TSC22D3 (GILZ), NFKBIA, DUSP1 and ANXA1. Monomeric receptor transrepresses by tethering to NF-kappaB p65 and to AP-1, and by recruiting histone deacetylase 2 to their promoters, suppressing IL-1, IL-2, IL-6, TNF-alpha, COX-2 and inducible nitric oxide synthase. Transactivation is thought to carry most of the metabolic harm and transrepression most of the anti-inflammatory benefit, which is the premise of the dissociated-steroid programmes that have so far produced no marketed drug.',
        iconName: 'Dna',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Inflammation falls within hours, and keeps falling for days',
        laymanDesc:
          'Because the effect works through gene transcription rather than by blocking a single molecule, it takes a few hours to appear and then persists after the drug itself has been cleared.',
        molecularDetail:
          'The plasma half-life is 2 to 4 hours but the biological half-life is 12 to 36 hours, because the endpoint is a changed transcriptional programme rather than an occupied receptor. Measured downstream effects include lymphocyte redistribution out of the circulation within hours, suppressed eosinophil counts, reduced capillary permeability and inhibited phospholipase A2 activity through induced annexin A1.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'The same receptor is in bone, muscle, pancreas and the adrenal feedback loop',
        laymanDesc:
          'There is no version of this mechanism that only affects the inflamed tissue. The receptor sits in bone-building cells, in muscle, in the liver and in the gland that makes your own cortisol, and the drug acts on all of them at once.',
        molecularDetail:
          'Glucocorticoid receptor activation in osteoblasts suppresses Wnt signalling and increases osteoclast lifespan, in skeletal muscle induces atrophy through FOXO and myostatin, in liver induces gluconeogenic enzymes, and at the pituitary suppresses proopiomelanocortin transcription and therefore ACTH, causing adrenal atrophy. Fracture risk rises within 3 to 6 months of starting, and hypothalamic-pituitary-adrenal recovery after a prolonged course can take months.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Sullivan 2007 Bell’s palsy trial (ISRCTN71548196)',
        phase: 'Randomised, double-blind, placebo-controlled, 2-by-2 factorial',
        sampleSize: 551,
        primaryEndpoint:
          'Complete recovery of facial function on the House-Brackmann scale at 3 months',
        endpointMet: true,
        statisticalPValue: '83.0% with prednisolone against 63.6% without, P<0.001',
        unreportedAdverseSignals:
          'Final outcomes were assessed in 496 of 551 randomised, a 10% loss. The trial reported no serious adverse events, but a 10-day course is too short to detect the harms this class is known for.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'ARC Low-Dose Glucocorticoid Study (Kirwan 1995)',
        phase: 'Randomised, double-blind, placebo-controlled',
        sampleSize: 128,
        primaryEndpoint:
          'Radiographic progression of hand joint damage by Larsen index at one and two years, and new erosions in previously unaffected hands',
        endpointMet: true,
        statisticalPValue:
          'Larsen score rose 0.72 units against 5.37 units, P=0.004; new erosions 22.1% against 45.6%, difference 23.5 percentage points (95% CI 5.9 to 40.7), P=0.007',
        unreportedAdverseSignals:
          'Radiographic analysis rested on 106 of 128 randomised patients. The trial ran for two years, which is long enough to measure erosion and too short to measure the fracture risk the same treatment creates.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'STOPAH (ISRCTN88782125)',
        phase: 'Phase 3, multicentre, double-blind, 2-by-2 factorial',
        sampleSize: 1103,
        primaryEndpoint: 'All-cause mortality at 28 days in severe alcoholic hepatitis',
        endpointMet: false,
        statisticalPValue:
          'Odds ratio 0.72 (95% CI 0.52 to 1.01), P=0.06 — did not reach significance; no difference at 90 days or 1 year',
        unreportedAdverseSignals:
          'Serious infections occurred in 13% of prednisolone-treated patients against 7% of those not treated with it, P=0.002. That harm is in the abstract and is routinely omitted when the 28-day point estimate is quoted as if it were positive.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Panickar 2009 preschool viral wheeze trial (ISRCTN58363576)',
        phase: 'Randomised, double-blind, placebo-controlled',
        sampleSize: 700,
        primaryEndpoint: 'Duration of hospitalisation',
        endpointMet: false,
        statisticalPValue:
          '13.9 hours on placebo against 11.0 hours on prednisolone; ratio of geometric means 0.90 (95% CI 0.77 to 1.05)',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'PREDNOS (ISRCTN16645249, EudraCT 2010-022489-29)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 237,
        primaryEndpoint: 'Time to first relapse of steroid-sensitive nephrotic syndrome',
        endpointMet: false,
        statisticalPValue: 'Hazard ratio 0.87 (95% CI 0.65 to 1.17), log-rank P=0.28',
        unreportedAdverseSignals:
          'The extended-course group received about 900 mg/m2 more prednisolone in the trial and no less afterwards: total post-trial dose was 6,674 mg against 5,475 mg, P=0.07.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Complete facial recovery in 83.0% against 63.6% at three months in Bell’s palsy, P<0.001, in a placebo-controlled factorial trial',
        'Radiographic joint erosion in early rheumatoid arthritis: Larsen score rose 0.72 units against 5.37 on placebo over two years, P=0.004',
        'Severe alcoholic hepatitis 28-day mortality odds ratio 0.72 (95% CI 0.52 to 1.01), P=0.06 in 1,053 analysed patients — a miss, not a win',
        'Serious infection in 13% of prednisolone-treated patients against 7% of untreated in the same trial, P=0.002',
        'Sepsis incidence rate ratio 5.30, venous thromboembolism 3.33 and fracture 1.87 in the 30 days after a short course, in 1.5 million adults',
      ],
      unsupportedInferences: [
        'That the standard steroid equivalence table transfers harm as well as potency — it was built from anti-inflammatory bioassay, and adrenal suppression follows half-life instead',
        'That a short course is a safe course; the harm signal persists below a 20 mg prednisone-equivalent daily dose',
        'That the 28-day point estimate in alcoholic hepatitis represents a benefit, when the confidence interval crosses one and the 90-day and one-year results are flat',
        'That because glucocorticoids work fast in a flare, longer courses work better — three separate trials on this page found extending or adding a course changed nothing',
      ],
      whatFailedInitially: [
        'STOPAH missed its primary endpoint in the largest alcoholic hepatitis trial ever conducted, and nearly doubled serious infections',
        'A five-day course did not shorten hospital stay for preschool children with viral wheeze in 687 analysed patients',
        'Doubling the initial course length in childhood nephrotic syndrome changed neither time to relapse nor any secondary outcome',
        'Dissociated steroids, designed to keep the transrepression and drop the transactivation, have been pursued for thirty years and none has been approved',
      ],
      realWorldOutcome: [
        'On the WHO Model List of Essential Medicines and among the cheapest drugs in any formulary, at cents per tablet',
        'One in five insured American adults aged 18 to 64 received at least one short oral corticosteroid course over a three-year period',
        'Still the fastest-acting anti-inflammatory available, and still the drug the other nine in this batch exist to help people stop taking',
        'The measured harm threshold has moved down twice in twenty years, without the drug itself changing at all',
      ],
    },
    deliverySystem: {
      type:
        'Oral solution, oral tablet, orally disintegrating tablet, ophthalmic suspension and emulsion, and injectable sodium phosphate and acetate salts',
      description:
        'Absorbed rapidly and completely from the gut, with peak concentrations within one to two hours. The sodium phosphate salt is water-soluble and used for injection and for oral solution; the acetate salt is a poorly soluble depot for intra-articular and ophthalmic use. Ophthalmic formulations exist because the eye is one of the few places a glucocorticoid can be delivered locally at high concentration with limited systemic exposure.',
      safetyProfile:
        'The label warns of adrenal suppression on withdrawal, increased susceptibility to and masking of infection, reactivation of latent tuberculosis, osteoporosis and fracture, hyperglycaemia, hypertension, fluid retention, cataract and glaucoma, growth suppression in children, peptic ulceration in combination with NSAIDs, and psychiatric disturbance including mania and depression. Live vaccines are contraindicated at immunosuppressive exposure. In a nationwide cohort of 1,548,945 adults, sepsis, venous thromboembolism and fracture rates all rose within 30 days of even a short course, and the rise persisted below a 20 mg prednisone-equivalent daily dose.',
    },
    commonQuestions: [
      {
        q: 'What is the difference between prednisone and prednisolone?',
        a: 'One chemical group. Prednisone carries a ketone at position 11 and has no activity at the receptor until the liver reduces it to prednisolone, which carries a hydroxyl there. In a person with normal liver function that conversion is fast and essentially complete, so the two are used interchangeably at the same milligram figure. Prednisolone is preferred where hepatic conversion cannot be assumed, and it is the form used in most paediatric liquids and in eye drops. There is no evidence that either is more effective than the other in people who can make the conversion.',
      },
      {
        q: 'Is a short course really harmless?',
        a: 'No, and this is the most consistently underestimated fact about the drug. A study of 1,548,945 privately insured American adults found that in the 30 days after starting a course shorter than 30 days, the rate of sepsis was 5.30 times higher, venous thromboembolism 3.33 times higher and fracture 1.87 times higher than in non-users. The effect faded over the following two months. It persisted at prednisone-equivalent doses under 20 mg a day. This is observational data and confounding by indication is the standing objection — sicker people get steroids — but the study also compared each person against themselves in a self-controlled case series, which is the design built to answer that objection.',
        auditNote:
          'The comparison a reader wants is a randomised trial of short-course steroids against placebo with sepsis as an endpoint. It does not exist, and no one is going to run it.',
      },
      {
        q: 'Does it treat the disease or just the symptoms?',
        a: 'Both, depending on the disease, and the distinction is measurable. In early rheumatoid arthritis a two-year randomised trial measured X-ray damage, not symptoms, and found joint erosion nearly stopped: Larsen scores rose 0.72 units on prednisolone against 5.37 on placebo. That is disease modification. In preschool viral wheeze a trial of 687 children found no difference in anything, including how long they stayed in hospital. In severe alcoholic hepatitis the largest trial run found a 28-day mortality difference that did not reach significance and nothing at all by 90 days. The honest answer is that this drug’s effect ranges from disease-altering to nil depending entirely on the condition, and the label’s long list of indications does not distinguish between them.',
      },
      {
        q: 'Why can I not just stop taking it?',
        a: 'Because the drug suppresses the signal that tells your adrenal glands to make cortisol. Glucocorticoid receptor activation at the pituitary shuts down ACTH production, the adrenal cortex atrophies from disuse, and after a prolonged course it can take months to recover. If the external supply stops before the internal one restarts, the body has no cortisol at all, and the result is an adrenal crisis: collapse, low blood pressure and low blood sodium, often triggered by an infection or an operation. This page does not tell you how to come off it — that is a conversation with the prescriber — but it does tell you why the question matters.',
      },
      {
        q: 'Is prednisolone a steroid like the ones athletes use?',
        a: 'No. Both are steroids in the chemical sense, meaning they share a four-ring carbon skeleton, and there the resemblance ends. Prednisolone is a glucocorticoid: it binds NR3C1 and suppresses inflammation, and its effect on muscle is to break it down, not build it. Anabolic steroids are androgens: they bind the androgen receptor and build muscle. Confusing the two runs in both directions and both directions are harmful — patients refusing a needed anti-inflammatory, and people assuming a glucocorticoid is performance-enhancing when muscle wasting is one of its documented effects.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Sullivan FM et al. Early treatment with prednisolone or acyclovir in Bell’s palsy. N Engl J Med 2007;357:1598-1607',
        identifier: '10.1056/NEJMoa072006',
        kind: 'doi',
      },
      {
        label:
          'Kirwan JR. The effect of glucocorticoids on joint destruction in rheumatoid arthritis. N Engl J Med 1995;333:142-146',
        identifier: '10.1056/NEJM199507203330302',
        kind: 'doi',
      },
      {
        label:
          'Thursz MR et al. Prednisolone or pentoxifylline for alcoholic hepatitis. N Engl J Med 2015;372:1619-1628 (STOPAH)',
        identifier: '10.1056/NEJMoa1412278',
        kind: 'doi',
      },
      {
        label:
          'Panickar J et al. Oral prednisolone for preschool children with acute virus-induced wheezing. N Engl J Med 2009;360:329-338',
        identifier: '10.1056/NEJMoa0804897',
        kind: 'doi',
      },
      {
        label:
          'Webb NJA et al. Long term tapering versus standard prednisolone treatment for first episode of childhood nephrotic syndrome. BMJ 2019;365:l1800 (PREDNOS)',
        identifier: '10.1136/bmj.l1800',
        kind: 'doi',
      },
      {
        label:
          'Waljee AK et al. Short term use of oral corticosteroids and related harms among adults in the United States. BMJ 2017;357:j1415',
        identifier: '10.1136/bmj.j1415',
        kind: 'doi',
      },
      {
        label:
          'van Staa TP, Leufkens HG, Cooper C. The epidemiology of corticosteroid-induced osteoporosis: a meta-analysis. Osteoporos Int 2002;13:777-787',
        identifier: '10.1007/s001980200108',
        kind: 'doi',
      },
      {
        label:
          'Drugs@FDA: PEDIAPRED (prednisolone sodium phosphate) oral solution, NDA 019157 — label and approval history',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=019157',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 5755 — prednisolone structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5755',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 2. Dexamethasone — the only drug in this batch with an unambiguous mortality result, and the
  //    only one whose own trial found it killing the wrong patients.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'dexamethasone',
    name: 'Dexamethasone',
    tradeName: 'Decadron / Dexamethasone Sodium Phosphate / Maxidex / Ozurdex / Hemady',
    sponsor:
      'Originally Merck, which introduced Decadron in 1958. Off patent for decades and now made by dozens of manufacturers; the modern branded products are formulations — the Ozurdex intravitreal implant, the Hemady high-strength oral tablet — not the molecule.',
    targetGene: 'NR3C1',
    targetProtein:
      'Glucocorticoid receptor (NR3C1). The 9-alpha fluorine and 16-alpha methyl groups raise glucocorticoid potency and abolish mineralocorticoid activity almost completely, so it does not act at NR3C2 at clinical exposure.',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1958,
    indication:
      'Endocrine, rheumatic, collagen, dermatologic, allergic, ophthalmic, respiratory, haematologic, neoplastic, oedematous and gastrointestinal disorders, and diagnostic testing of adrenocortical hyperfunction, given orally, intravenously, intramuscularly, intra-articularly or intraocularly; and hospitalised COVID-19 in patients requiring supplemental oxygen',
    patientFriendlyIndication:
      'Severe inflammation and swelling — including brain swelling, croup, some cancers, and COVID-19 severe enough to need oxygen',
    anatomicalSite:
      'Cytoplasm and nucleus of nucleated cells throughout the body. It crosses the blood-brain and placental barriers freely, which is what makes it the steroid used for cerebral oedema and for fetal lung maturation.',
    conditionContext: {
      conditionExplainer:
        'Dexamethasone is the same mechanism as prednisolone taken further: about six times the anti-inflammatory potency per milligram, a much longer duration, and essentially no effect on salt and water. Removing the salt-retaining effect is what lets it be used where swelling itself is the problem.',
      whyItMatters:
        'It is the only drug in this batch with a clean randomised mortality benefit in more than one unrelated disease, and one of very few generic drugs to have had a headline effect on a pandemic. It is also the drug whose own trial showed it doing nothing, and possibly harm, in the milder patients everyone wanted to give it to.',
      whoTakesThis:
        'People with cerebral oedema from a brain tumour, children with croup, women at risk of very preterm birth, patients with bacterial meningitis, patients with myeloma, and patients hospitalised with COVID-19 who need oxygen.',
      clinicalGoals:
        'Reduce swelling or suppress an inflammatory response that is doing more damage than the thing it is responding to. In COVID-19 and in meningitis the target is the immune response, not the pathogen.',
    },
    oneSentenceVerdict:
      'A fluorinated glucocorticoid with no salt-retaining activity that binds the same receptor as cortisol about 25 times more strongly and for far longer — in RECOVERY it cut 28-day mortality in ventilated COVID-19 patients from 41.4% to 29.3% (rate ratio 0.64, 95% CI 0.51 to 0.81) while showing no benefit and a point estimate favouring harm in patients not on oxygen (17.8% against 14.0%, rate ratio 1.19, 95% CI 0.92 to 1.55).',
    laymanHowItWorks:
      'Dexamethasone is cortisol with two chemical changes: a fluorine atom that makes it bind its receptor far more tightly, and a methyl group that stops the body breaking it down quickly. Those changes also strip out the part of cortisol’s effect that makes you retain salt and water, which is why it can be used to bring swelling down rather than add to it. Inside a cell it frees a receptor that moves into the nucleus and shuts off the genes that make inflammatory signals. It crosses into the brain and across the placenta as easily as into anywhere else, which is both why it works on brain swelling and fetal lungs and why nothing about its effects is local.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 84,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.2461 per tablet at United States pharmacy acquisition cost (CMS NADAC, generic, median across 114 listed products, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Introduced in 1958 and long out of patent; it is on the WHO Model List of Essential Medicines and costs cents a tablet. The exception is the branded reformulations: Hemady, a 20 mg oral tablet approved in 2019 for multiple myeloma, and Ozurdex, an intravitreal implant. Both deliver a molecule available for pennies through a delivery system that carries its own patents, and the price difference belongs entirely to the delivery system.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Where the target is swelling, dexamethasone has no real substitute inside the class, because the alternatives all retain some salt-and-water effect that works against the goal. Where the target is general inflammation, prednisolone and methylprednisolone do the same job with a shorter half-life and an easier taper. Outside the class there is no substitute at all for the uses that matter most here: no food, supplement or home measure reduces cerebral oedema, matures fetal lungs, or alters COVID-19 mortality.',
      conventionalRx: [
        {
          name: 'Prednisolone or prednisone',
          class: 'Glucocorticoid, intermediate-acting',
          howItCompares:
            'About one-sixth to one-seventh the potency per milligram, a shorter biological half-life of 12 to 36 hours against dexamethasone’s 36 to 72, and a retained fraction of mineralocorticoid activity. That combination makes it easier to taper and easier to stop, and unsuitable where fluid retention would worsen the problem.',
          typicalCost:
            'US$4.39 per millilitre of prednisolone oral solution at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026); tablets cost cents',
          prosAndCons:
            'Pros: shorter action gives finer control and less cumulative adrenal suppression. Cons: salt and water retention, and it was not the drug tested in RECOVERY.',
        },
        {
          name: 'Betamethasone',
          class: 'Fluorinated glucocorticoid, stereoisomer of dexamethasone',
          howItCompares:
            'Differs only in the orientation of the 16-methyl group and is essentially equipotent. It is the alternative antenatal corticosteroid, and the choice between the two in preterm birth is a supply and formulation question rather than a demonstrated difference in effect.',
          typicalCost: 'Generic; comparable to dexamethasone in most markets',
          prosAndCons:
            'Pros: interchangeable with dexamethasone for fetal lung maturation. Cons: no advantage that has been demonstrated in a head-to-head trial with a hard endpoint.',
        },
        {
          name: 'Hydrocortisone',
          class: 'Glucocorticoid, short-acting, with full mineralocorticoid activity',
          howItCompares:
            'The opposite trade. It is what the body actually makes, which is why it is used for adrenal replacement and in septic shock where the mineralocorticoid effect on vascular tone is part of the point. It is a poor choice for cerebral oedema for the same reason.',
          typicalCost:
            'US$0.1824 per tablet at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: physiological, short-acting, supports blood pressure. Cons: causes the fluid retention that dexamethasone was engineered to avoid.',
        },
        {
          name: 'Mannitol or hypertonic saline (for cerebral oedema)',
          class: 'Osmotic agents',
          howItCompares:
            'These pull water out of brain tissue by osmosis and act within minutes; dexamethasone acts on the leaky capillaries of a tumour or abscess over hours and does nothing useful for the cytotoxic oedema of stroke or traumatic brain injury. They are not interchangeable — they treat different kinds of swelling.',
          typicalCost: 'Both are inexpensive generic hospital fluids',
          prosAndCons:
            'Pros: immediate effect, no immunosuppression. Cons: transient, need close monitoring of blood chemistry, and no effect on the underlying inflammation.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Expect blood sugar to rise, and say so if you are diabetic',
          action:
            'Tell the prescriber about diabetes or prediabetes before a course starts, and report unusual thirst or urination during one.',
          patientImpact:
            'Hyperglycaemia is the commonest measured adverse event with dexamethasone in critical illness. In the DEXA-ARDS trial it occurred in 76% of dexamethasone patients and 70% of controls in the intensive care unit.',
          clinicalPrecaution:
            'Glucocorticoids induce hepatic gluconeogenesis and impair peripheral insulin sensitivity through the same receptor that produces the anti-inflammatory effect. The rise is a mechanism, not an idiosyncrasy.',
        },
        {
          name: 'Report sleeplessness, agitation or mood change early',
          action:
            'Mention any new insomnia, restlessness or mood swing to whoever prescribed it, especially at higher exposure.',
          patientImpact:
            'Psychiatric disturbance ranging from insomnia and euphoria to frank mania and depression is on the label for the whole class, and dexamethasone’s long half-life makes it harder to escape between doses.',
          clinicalPrecaution:
            'This is dose-related and reversible on withdrawal, but withdrawal from a prolonged course cannot be abrupt because of adrenal suppression.',
        },
        {
          name: 'Ask what your gestational age is before an antenatal course',
          action:
            'For a woman at risk of preterm birth, ask on what basis gestational age was determined.',
          patientImpact:
            'A cluster-randomised trial of 100,000 births found that a strategy to widen antenatal corticosteroid use in low-income settings increased overall neonatal mortality — 27.4 against 23.9 deaths per 1,000 live births, RR 1.12 — and maternal infection, because the drug reached many women who were not in fact about to deliver preterm.',
          clinicalPrecaution:
            'The same drug in the same indication, given to women with confirmed risk between 26 and 34 weeks in a hospital setting, reduced neonatal death from 23.5% to 19.6%. Accuracy of gestational age is what separates those two results.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'C[C@@H]1C[C@H]2[C@@H]3CCC4=CC(=O)C=C[C@@]4([C@]3([C@H](C[C@@]2([C@]1(C(=O)CO)O)C)O)F)C',
      chemicalFormula: 'C22H29FO5',
      molecularWeight: '392.50 g/mol',
      targetReceptorAffinity:
        'Roughly 25 to 30 times the anti-inflammatory potency of cortisol per milligram, with essentially no mineralocorticoid activity. Biological half-life 36 to 72 hours against cortisol’s 8 to 12. The 9-alpha fluorine raises receptor affinity and the 16-alpha methyl blocks metabolic inactivation; removing either reverts the molecule towards cortisol-like behaviour.',
      structureSource: {
        label:
          'PubChem CID 5743 (dexamethasone) — canonical SMILES, molecular formula C22H29FO5 and molecular weight 392.5 g/mol, re-checked against the PUG REST property endpoint',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5743',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'dex-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the 9-alpha fluorine and the 16-alpha methyl orientation',
          description:
            'Verify fluorine position and, critically, the stereochemistry at C16. The 16-beta epimer is betamethasone, a different marketed drug with its own approvals. The two are indistinguishable by molecular formula, by mass and by ultraviolet spectrum, so an assay that checks only identity and potency will not separate them.',
          reagentsAndBuffer:
            'Dexamethasone USP reference standard, 19F NMR and 1H NMR in DMSO-d6, chiral or beta-cyclodextrin HPLC to resolve the C16 epimers, ultraviolet detection at 240 nm',
        },
        {
          id: 'dex-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Fluorination through the 9,11-epoxide and 16-methylation',
          description:
            'Build the molecule from a 16-methyl pregnadiene intermediate: form the 9,11-beta-epoxide, then open it with hydrogen fluoride to install the 9-alpha fluorine and the 11-beta hydroxyl in one stereospecific step. Ring-A unsaturation is introduced by microbial 1,2-dehydrogenation as for prednisolone.',
          dependsOnStepId: 'dex-w1',
          reagentsAndBuffer:
            'Anhydrous hydrogen fluoride or HF-pyridine in a fluoropolymer vessel at low temperature, N-bromosuccinimide and perchloric acid for bromohydrin formation, potassium acetate for epoxide closure, Arthrobacter simplex culture for the delta-1 step',
        },
        {
          id: 'dex-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Separate dexamethasone from betamethasone and from defluorinated by-products',
          description:
            'Crystallise the 16-alpha epimer away from the 16-beta epimer and from 9,11-dehydro material formed by elimination of hydrogen fluoride. Epimeric separation is the cost-determining step and the reason the two drugs are priced as separate products despite an identical formula.',
          dependsOnStepId: 'dex-w2',
          reagentsAndBuffer:
            'Fractional crystallisation from acetone-water or methanol, reversed-phase preparative HPLC against USP related-compounds standards, 19F NMR for defluorination check',
        },
        {
          id: 'dex-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Blood-brain barrier permeability and P-glycoprotein handling',
          description:
            'Measure transcellular flux across a brain endothelial monolayer and determine whether efflux transporters remove the compound. Dexamethasone is the glucocorticoid chosen for cerebral oedema on the basis of central penetration, and that penetration is an experimentally measured property rather than a class assumption — some glucocorticoids are far better P-glycoprotein substrates than others.',
          dependsOnStepId: 'dex-w3',
          reagentsAndBuffer:
            'hCMEC/D3 or primary brain microvascular endothelial monolayer on Transwell inserts, transendothelial electrical resistance monitoring, radiolabelled or LC-MS/MS quantification, elacridar as a P-glycoprotein inhibitor control',
        },
        {
          id: 'dex-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Mineralocorticoid counter-screen alongside the glucocorticoid readout',
          description:
            'Run a mineralocorticoid receptor reporter assay in parallel with the glucocorticoid one. The whole point of the 9-fluoro-16-methyl design is a high glucocorticoid-to-mineralocorticoid ratio, and a batch that has lost the 16-methyl group regains sodium-retaining activity that a glucocorticoid potency assay alone would not reveal.',
          dependsOnStepId: 'dex-w4',
          reagentsAndBuffer:
            'MMTV-luciferase glucocorticoid reporter and an MR-responsive element reporter in a stably transfected line, aldosterone as mineralocorticoid reference, spironolactone as MR antagonist control, charcoal-stripped serum',
        },
      ],
    },
    keyAudits: [
      {
        id: 'dex-a1',
        category: 'measured',
        title: 'RECOVERY: 28-day mortality fell from 41.4% to 29.3% in ventilated COVID-19 patients',
        laymanSummary:
          'This is the strongest randomised result any drug in this batch has. Patients in hospital with COVID-19 were randomly given dexamethasone or the usual care. Among those on a ventilator, roughly three in ten on the drug died against four in ten without it.',
        technicalDetails:
          'RECOVERY assigned 2,104 patients to dexamethasone 6 mg once daily for up to 10 days and 4,321 to usual care alone. Death within 28 days occurred in 482 (22.9%) against 1,110 (25.7%), age-adjusted rate ratio 0.83 (95% CI 0.75 to 0.93, P<0.001). The effect varied sharply with respiratory support at randomisation: 29.3% against 41.4% on invasive mechanical ventilation (rate ratio 0.64, 95% CI 0.51 to 0.81) and 23.3% against 26.2% on oxygen without ventilation (0.82, 0.72 to 0.94).',
        evidenceSource:
          'RECOVERY Collaborative Group, N Engl J Med 2021;384:693-704 (NCT04381936, ISRCTN50189673)',
        doi: '10.1056/NEJMoa2021436',
        measuredMetric: 'All-cause mortality at 28 days, against usual care, in an open-label randomised comparison',
        auditFlag: 'verified',
      },
      {
        id: 'dex-a2',
        category: 'failed',
        title: 'The same trial found no benefit, and a point estimate favouring harm, without oxygen',
        laymanSummary:
          'The headline was that dexamethasone saves lives in COVID-19. The trial itself found that in patients who were not on oxygen at all, more died on the drug than off it. The result was not statistically significant, but it points the wrong way and it is the reason the indication is written as it is.',
        technicalDetails:
          'Among RECOVERY participants receiving no respiratory support at randomisation, 28-day mortality was 17.8% on dexamethasone against 14.0% on usual care, rate ratio 1.19 (95% CI 0.92 to 1.55). The confidence interval includes both a 8% reduction and a 55% increase, so this is an absence of demonstrated benefit rather than a demonstrated harm — but the point estimate is above one, the biological reading is coherent (suppressing an immune response that is still clearing virus), and the licensed indication was written to exclude these patients.',
        evidenceSource: 'RECOVERY Collaborative Group, N Engl J Med 2021;384:693-704',
        doi: '10.1056/NEJMoa2021436',
        measuredMetric:
          '28-day mortality in the subgroup receiving no respiratory support at randomisation',
        auditFlag: 'caution',
      },
      {
        id: 'dex-a3',
        category: 'measured',
        title: 'Antenatal dexamethasone cut neonatal death from 23.5% to 19.6%',
        laymanSummary:
          'Given to a woman at risk of delivering very early, dexamethasone crosses the placenta and matures the baby’s lungs before birth. In a trial across five countries, the trial was stopped early because the benefit was clear: about four fewer deaths for every hundred babies.',
        technicalDetails:
          'The WHO ACTION-I trial randomised 2,852 women and their 3,070 fetuses between 26 weeks 0 days and 33 weeks 6 days of gestation across 29 hospitals in Bangladesh, India, Kenya, Nigeria and Pakistan to intramuscular dexamethasone or identical placebo, and was stopped for benefit at the second interim analysis. Neonatal death occurred in 278 of 1,417 infants (19.6%) against 331 of 1,406 (23.5%), relative risk 0.84 (95% CI 0.72 to 0.97, P=0.03). Stillbirth or neonatal death was 25.7% against 29.2% (RR 0.88, 95% CI 0.78 to 0.99, P=0.04). Possible maternal bacterial infection was 4.8% against 6.3% (RR 0.76, 95% CI 0.56 to 1.03), meeting the prespecified non-inferiority margin.',
        evidenceSource:
          'WHO ACTION Trials Collaborators, N Engl J Med 2020;383:2514-2525 (ACTRN12617000476336, CTRI/2017/04/008326)',
        doi: '10.1056/NEJMoa2022398',
        measuredMetric: 'Neonatal death, and stillbirth or neonatal death, against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'dex-a4',
        category: 'failed',
        title: 'ACT: widening antenatal use in the community raised neonatal deaths and maternal infection',
        laymanSummary:
          'A programme to get the same drug to more women at risk of preterm birth across six countries was tested against ordinary care. Among the whole population, more babies died in the intervention group, not fewer, and more mothers developed suspected infections. The drug was right. The targeting was not.',
        technicalDetails:
          'The ACT cluster-randomised trial covered 51 intervention clusters with 47,394 live births and 50 control clusters with 50,743, across Argentina, Guatemala, India, Kenya, Pakistan and Zambia. Antenatal corticosteroid use in mothers of less-than-5th-percentile infants rose from 10% to 45% (P<0.0001). Among those infants, 28-day mortality was 225 against 232 per 1,000 live births (RR 0.96, 95% CI 0.87 to 1.06, P=0.65) — no benefit. Across the whole population, 28-day neonatal mortality was 27.4 against 23.9 per 1,000 (RR 1.12, 95% CI 1.02 to 1.22, P=0.0127), and suspected maternal infection 3% against 2% (OR 1.45, 95% CI 1.33 to 1.58, P<0.0001). The authors calculated an excess of 3.5 neonatal deaths per 1,000 women exposed to the strategy.',
        evidenceSource: 'Althabe F et al., Lancet 2015;385:629-639 (ACT trial, NCT01084096)',
        doi: '10.1016/S0140-6736(14)61651-2',
        measuredMetric:
          '28-day neonatal mortality and suspected maternal infection across whole populations, cluster-randomised',
        auditFlag: 'caution',
      },
      {
        id: 'dex-a5',
        category: 'conclusion_shift',
        title: 'The bacterial meningitis indication did not replicate outside Europe',
        laymanSummary:
          'A European trial in 2002 showed dexamethasone halved deaths in adults with bacterial meningitis, and it became standard care. Two large trials in Malawi and Vietnam then found no benefit at all in the whole trial population. The field settled on a position that depends on where you are and on whether the diagnosis is confirmed.',
        technicalDetails:
          'The European Dexamethasone in Adulthood Bacterial Meningitis study randomised 301 patients and found unfavourable outcome in 15% against 25% (RR 0.59, 95% CI 0.37 to 0.94, P=0.03) and death in 7% against 15% (RR 0.48, 95% CI 0.24 to 0.96, P=0.04), with the largest effect in pneumococcal meningitis (26% against 52% unfavourable, RR 0.50, 95% CI 0.30 to 0.83, P=0.006). In Malawi, 465 adults of whom 90% were HIV-positive showed no mortality difference at 40 days (OR 1.14, 95% CI 0.79 to 1.64), and none in proven pneumococcal disease either (OR 1.10, 95% CI 0.68 to 1.77). In Vietnam, 435 patients showed no significant reduction in death at one month overall (RR 0.79, 95% CI 0.45 to 1.39), with benefit confined to the 300 with microbiologically confirmed disease (RR 0.43, 95% CI 0.20 to 0.94) and multivariate analysis suggesting increased death in probable — largely tuberculous — meningitis.',
        evidenceSource:
          'de Gans J, van de Beek D, N Engl J Med 2002;347:1549-1556; Scarborough M et al., N Engl J Med 2007;357:2441-2450 (ISRCTN31371499); Nguyen TH et al., N Engl J Med 2007;357:2431-2440 (ISRCTN42986828)',
        doi: '10.1056/NEJMoa021334',
        inferredClaim:
          'That the European result generalises to bacterial meningitis anywhere — two adequately powered trials in high-HIV and high-tuberculosis settings found no benefit, and one found a signal of harm where the diagnosis was unconfirmed',
        auditFlag: 'contested',
      },
      {
        id: 'dex-a6',
        category: 'measured',
        title: 'Mild croup: a single dose halved return visits',
        laymanSummary:
          'Seven hundred and twenty children with mild croup got one dose of dexamethasone or a placebo. Seven in a hundred on the drug came back for more care within a week, against fifteen in a hundred on placebo. They also slept better and their parents were less distressed.',
        technicalDetails:
          'A double-blind trial at four paediatric emergency departments randomised 720 children with mild croup, defined by a Westley score of 2 or less, to a single oral dose of dexamethasone 0.6 mg/kg or placebo. Return to a medical care provider for croup within seven days was 7.3% against 15.3% (P<0.001). Croup symptoms resolved faster (P=0.003), less sleep was lost (P<0.001), and parental stress was lower (P<0.001).',
        evidenceSource: 'Bjornson CL et al., N Engl J Med 2004;351:1306-1313',
        doi: '10.1056/NEJMoa033534',
        measuredMetric: 'Return to a medical care provider for croup within seven days, against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'dex-a7',
        category: 'inferred',
        title: 'The ARDS result rests on a trial stopped early for slow recruitment',
        laymanSummary:
          'A Spanish trial reported that dexamethasone cut deaths in severe lung failure from 36% to 21%. It was stopped before it finished, not because the answer was clear but because patients were not being enrolled fast enough, and a trial stopped early tends to overstate its effect.',
        technicalDetails:
          'DEXA-ARDS randomised 277 patients with established moderate-to-severe ARDS, 139 to dexamethasone and 138 to control, and was stopped by the data safety monitoring board for a low enrolment rate after reaching 88% of the planned 314. Ventilator-free days at 28 days favoured dexamethasone by 4.8 days (95% CI 2.57 to 7.03, P<0.0001), and 60-day mortality was 21% against 36% (between-group difference -15.3%, 95% CI -25.9 to -4.9, P=0.0047). Hyperglycaemia in intensive care occurred in 76% against 70%; new intensive-care infections were 24% against 25%. The trial recruited over five years and nine months at a rate of under one patient per site per year, which is the fact behind the stopping decision.',
        evidenceSource: 'Villar J et al., Lancet Respir Med 2020;8:267-276 (NCT01731795)',
        doi: '10.1016/S2213-2600(19)30417-5',
        inferredClaim:
          'That a 15-percentage-point mortality reduction in ARDS is a reliable estimate, when it comes from a single trial of 277 patients stopped before completion with an unblinded control arm',
        auditFlag: 'caution',
      },
      {
        id: 'dex-a8',
        category: 'inferred',
        title: 'A pennies-a-tablet molecule sold at a formulation price',
        laymanSummary:
          'Dexamethasone costs about a quarter of a dollar a tablet at what American pharmacies pay. The same molecule in a 20 mg tablet approved for myeloma, and in an implant placed inside the eye, is priced in a completely different range. What is being paid for is the packaging, not the drug.',
        technicalDetails:
          'The CMS National Average Drug Acquisition Cost file lists generic dexamethasone tablets at a median of US$0.2461 across 114 products. Hemady, a 20 mg oral dexamethasone tablet, was approved in 2019 for multiple myeloma in combination regimens — the molecule was already in universal off-label use for that indication at a fraction of the cost. Ozurdex, a biodegradable intravitreal implant releasing 0.7 mg of dexamethasone, is a genuinely different product with its own clinical trials, and the comparison there is against other intravitreal agents rather than against a tablet. The general claim being audited is that a high-strength or repackaged presentation of an off-patent molecule represents a new therapy; for the oral tablet it does not.',
        evidenceSource:
          'CMS National Average Drug Acquisition Cost file, effective 19 August 2026; Drugs@FDA records for dexamethasone products',
        inferredClaim:
          'That a reformulated presentation of a 1958 molecule justifies a price unrelated to the molecule — true for the intravitreal implant, which had to be tested on its own, and not established for the high-strength oral tablet',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Given by almost any route, and it reaches almost everywhere',
        laymanDesc:
          'Tablet, injection, eye drop or implant — dexamethasone is absorbed well and distributes widely, including into the brain and across the placenta into an unborn baby.',
        molecularDetail:
          'Oral bioavailability is high and the water-soluble sodium phosphate ester allows intravenous, intramuscular, intra-articular and intraocular use. Unlike cortisol, it is a poor substrate for placental 11-beta-hydroxysteroid dehydrogenase type 2, so it is not inactivated on the way to the fetus — the pharmacological basis of the antenatal indication.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The fluorine makes it stick, the methyl makes it last',
        laymanDesc:
          'Two small chemical changes to cortisol do all the work: one makes the molecule grip its receptor far more tightly, the other stops enzymes from taking it apart quickly.',
        molecularDetail:
          'The 9-alpha fluorine is electron-withdrawing and increases the acidity of the adjacent 11-beta hydroxyl, strengthening the hydrogen bond to the receptor. The 16-alpha methyl group sterically blocks the metabolic route that would otherwise clear the molecule and, separately, abolishes mineralocorticoid receptor activity. Together they give roughly 25 to 30 times cortisol’s glucocorticoid potency and a 36 to 72 hour biological half-life.',
        iconName: 'Atom',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The receptor is released and moves into the nucleus',
        laymanDesc:
          'The receptor waiting in the cell is bound up in a complex of helper proteins. Dexamethasone binding releases it and it travels to where the DNA is.',
        molecularDetail:
          'Identical to the general glucocorticoid pathway: dissociation of the HSP90-HSP70-p23-immunophilin complex, FKBP51 to FKBP52 exchange, dynein-mediated transport, nuclear import through two localisation signals in NR3C1.',
        iconName: 'Unlock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Inflammatory genes are shut off and vessel walls tighten',
        laymanDesc:
          'In the nucleus it silences the genes that produce inflammatory signals, and it also makes the smallest blood vessels less leaky. That second effect is why it works on swelling.',
        molecularDetail:
          'Transrepression of NF-kappaB and AP-1 suppresses IL-1, IL-6, TNF-alpha, COX-2 and inducible nitric oxide synthase. Transactivation induces ANXA1, DUSP1, TSC22D3 and NFKBIA. In vasogenic oedema the additional effect is on endothelial tight-junction proteins and on VEGF-driven permeability in the capillaries of a tumour or abscess — the reason it works on tumour oedema and not on the cytotoxic oedema of stroke.',
        iconName: 'Dna',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Where the immune response is the disease, this is a survival benefit',
        laymanDesc:
          'In severe COVID-19 the damage comes largely from the body’s own inflammatory response to the virus. Blunting it kept people alive — but only once they were sick enough to need oxygen.',
        molecularDetail:
          'RECOVERY measured a 28-day mortality rate ratio of 0.64 (95% CI 0.51 to 0.81) in patients on invasive mechanical ventilation and 0.82 (0.72 to 0.94) in those on oxygen alone. The gradient tracks the shift from viral replication to immunopathology as the dominant driver of injury.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And where it is not, the same suppression is a liability',
        laymanDesc:
          'In patients not yet needing oxygen, the immune response was still doing its job. In that group the trial found no benefit and slightly more deaths on the drug.',
        molecularDetail:
          '17.8% against 14.0% mortality with a rate ratio of 1.19 (95% CI 0.92 to 1.55) in the no-respiratory-support stratum of RECOVERY. The same principle appears in the Vietnam meningitis trial, where multivariate analysis associated dexamethasone with increased one-month death in probable rather than confirmed bacterial meningitis, an observation the authors attributed to unrecognised tuberculous meningitis.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'RECOVERY dexamethasone arm (NCT04381936, ISRCTN50189673)',
        phase: 'Randomised, controlled, open-label, adaptive platform trial',
        sampleSize: 6425,
        primaryEndpoint: 'All-cause mortality within 28 days of randomisation',
        endpointMet: true,
        statisticalPValue:
          '22.9% against 25.7%; age-adjusted rate ratio 0.83 (95% CI 0.75 to 0.93), P<0.001',
        unreportedAdverseSignals:
          'The overall figure conceals a reversal: rate ratio 0.64 on invasive ventilation, 0.82 on oxygen alone, 1.19 on no respiratory support. Quoting the pooled number without the stratum is the commonest misreading of this trial. The trial was open-label, so all non-mortality outcomes are subject to expectation effects.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'WHO ACTION-I (ACTRN12617000476336, CTRI/2017/04/008326)',
        phase: 'Phase 3, multicountry, randomised, double-blind, placebo-controlled',
        sampleSize: 2852,
        primaryEndpoint:
          'Neonatal death; stillbirth or neonatal death; possible maternal bacterial infection (non-inferiority)',
        endpointMet: true,
        statisticalPValue:
          'Neonatal death 19.6% against 23.5%, RR 0.84 (95% CI 0.72 to 0.97), P=0.03; stillbirth or neonatal death 25.7% against 29.2%, RR 0.88 (0.78 to 0.99), P=0.04',
        unreportedAdverseSignals:
          'Stopped early for benefit at the second interim analysis, which tends to overstate effect size. It was conducted in hospitals with reliable gestational-age assessment; the ACT trial shows what the same drug does without that.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'ACT antenatal corticosteroid implementation trial (NCT01084096)',
        phase: 'Cluster-randomised implementation trial across six countries',
        sampleSize: 98137,
        primaryEndpoint:
          '28-day neonatal mortality among infants below the 5th percentile for birthweight',
        endpointMet: false,
        statisticalPValue:
          '225 against 232 deaths per 1,000 live births, RR 0.96 (95% CI 0.87 to 1.06), P=0.65; whole-population mortality 27.4 against 23.9 per 1,000, RR 1.12 (1.02 to 1.22), P=0.0127',
        unreportedAdverseSignals:
          'Suspected maternal infection rose (OR 1.45, 95% CI 1.33 to 1.58, P<0.0001). The authors calculated an excess of 3.5 neonatal deaths per 1,000 women exposed to the strategy.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'European Dexamethasone in Adulthood Bacterial Meningitis study (de Gans 2002)',
        phase: 'Randomised, double-blind, placebo-controlled',
        sampleSize: 301,
        primaryEndpoint: 'Unfavourable outcome on the Glasgow Outcome Scale at 8 weeks',
        endpointMet: true,
        statisticalPValue:
          'Unfavourable outcome 15% against 25%, RR 0.59 (95% CI 0.37 to 0.94), P=0.03; death 7% against 15%, RR 0.48 (0.24 to 0.96), P=0.04',
        unreportedAdverseSignals:
          'The population was European, largely HIV-negative, with a high proportion of pneumococcal disease. Neither the Malawi nor the Vietnam replication reproduced the overall result.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'Malawi adjunctive dexamethasone trial (ISRCTN31371499)',
        phase: 'Randomised, double-blind, placebo-controlled, factorial',
        sampleSize: 465,
        primaryEndpoint: 'Death at 40 days after randomisation',
        endpointMet: false,
        statisticalPValue:
          'Odds ratio 1.14 (95% CI 0.79 to 1.64) by intention to treat; 1.10 (0.68 to 1.77) restricted to proven pneumococcal meningitis',
        unreportedAdverseSignals:
          'Ninety percent of participants were HIV-positive. The trial did not show harm, but it removed the basis for assuming the European result applies in this setting.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'DEXA-ARDS (NCT01731795)',
        phase: 'Phase 3, multicentre, randomised, controlled, open-label',
        sampleSize: 277,
        primaryEndpoint: 'Ventilator-free days at 28 days',
        endpointMet: true,
        statisticalPValue:
          'Between-group difference 4.8 days (95% CI 2.57 to 7.03), P<0.0001; 60-day mortality 21% against 36%, difference -15.3% (-25.9 to -4.9), P=0.0047',
        unreportedAdverseSignals:
          'Stopped by the data monitoring board for a low enrolment rate after 88% of the planned sample, over a recruitment period of nearly six years. Open-label with an unblinded control arm and no placebo.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'COVID-19 28-day mortality 29.3% against 41.4% on invasive ventilation, rate ratio 0.64 (95% CI 0.51 to 0.81), in 6,425 randomised patients',
        'Neonatal death 19.6% against 23.5% with antenatal dexamethasone in 2,852 women across five countries, RR 0.84, P=0.03',
        'Bacterial meningitis unfavourable outcome 15% against 25% in Europe, RR 0.59 (95% CI 0.37 to 0.94)',
        'Croup return visits 7.3% against 15.3% after a single oral dose in 720 children, P<0.001',
        'No mortality benefit in Malawi (OR 1.14) or overall in Vietnam (RR 0.79) for the same meningitis indication',
      ],
      unsupportedInferences: [
        'That the pooled RECOVERY mortality figure applies to all hospitalised COVID-19 patients — it reverses direction in the stratum not receiving oxygen',
        'That the European meningitis result generalises to settings with high HIV or tuberculosis prevalence',
        'That the 15-percentage-point ARDS mortality reduction is a settled number, when it comes from one open-label trial of 277 patients stopped early',
        'That a high-strength repackaging of a molecule available for cents represents a new therapy',
      ],
      whatFailedInitially: [
        'The no-respiratory-support stratum of RECOVERY: 17.8% against 14.0% mortality, rate ratio 1.19, favouring harm',
        'The ACT implementation trial raised whole-population neonatal mortality (RR 1.12) and maternal infection (OR 1.45) while successfully increasing steroid use',
        'Two large meningitis replications in Malawi and Vietnam found no overall benefit, and the Vietnam multivariate analysis suggested harm in unconfirmed cases',
        'DEXA-ARDS never reached its planned sample size and was stopped for recruitment failure rather than for a definitive answer',
      ],
      realWorldOutcome: [
        'Added to WHO COVID-19 guidance within weeks of the RECOVERY preprint, at a cost of a few dollars per course',
        'On the WHO Model List of Essential Medicines for croup, cerebral oedema, antenatal lung maturation and palliative care',
        'The licensed COVID-19 use is written to require supplemental oxygen — the trial’s own subgroup analysis wrote that restriction',
        'The oral molecule still costs about US$0.25 a tablet at United States pharmacy acquisition cost, sixty-eight years after launch',
      ],
    },
    deliverySystem: {
      type:
        'Oral tablet including a 20 mg high-strength presentation, oral solution, sodium phosphate solution for intravenous, intramuscular, intra-articular and soft-tissue injection, ophthalmic suspension, and a biodegradable intravitreal implant',
      description:
        'Well absorbed orally and rapidly distributed, including across the blood-brain barrier and the placenta. Because it is a poor substrate for placental 11-beta-hydroxysteroid dehydrogenase type 2, an intramuscular dose given to a mother reaches the fetus largely intact, which is what makes fetal lung maturation possible. The intravitreal implant exists to place the same molecule inside the eye for months without systemic exposure.',
      safetyProfile:
        'The class warnings apply in full: adrenal suppression, infection risk and masking, hyperglycaemia, psychiatric disturbance, osteoporosis, myopathy, cataract and glaucoma, growth suppression in children. The long biological half-life makes adrenal suppression accumulate faster than with prednisolone and makes tapering harder. In critical care trials, hyperglycaemia is the most frequently recorded adverse event, occurring in around three-quarters of treated patients in DEXA-ARDS. In the RECOVERY stratum receiving no respiratory support, mortality was numerically higher on dexamethasone.',
    },
    commonQuestions: [
      {
        q: 'Does dexamethasone work for COVID-19?',
        a: 'For patients sick enough to need oxygen, yes, and the evidence is as good as this class gets. RECOVERY randomised 6,425 hospitalised patients and found 28-day mortality of 22.9% against 25.7% overall, with the benefit concentrated where the illness was worst: 29.3% against 41.4% among those on a ventilator. For patients not needing oxygen the same trial found 17.8% against 14.0%, pointing the other way and not statistically significant. The mechanism explains the split. Early on, the immune response is still clearing virus and suppressing it is not obviously helpful; later, the immune response is doing most of the damage.',
        auditNote:
          'This is one of the clearest examples in medicine of a subgroup analysis that was right and that changed a licence. It was prespecified by level of respiratory support, which is why it carries weight that a post-hoc split would not.',
      },
      {
        q: 'How is it different from prednisolone?',
        a: 'Two chemical changes. A fluorine at position 9 makes it bind the glucocorticoid receptor far more tightly; a methyl group at position 16 stops it being cleared quickly and removes almost all of its salt-and-water activity. The result is roughly six to seven times prednisolone’s anti-inflammatory potency per milligram, a biological half-life of 36 to 72 hours against 12 to 36, and no fluid retention. That makes it the drug of choice wherever swelling is the problem and a difficult drug to taper, because the effect on your own adrenal glands outlasts each dose.',
      },
      {
        q: 'Why is it given to pregnant women?',
        a: 'To mature an unborn baby’s lungs before a very early delivery. Most steroids are destroyed by an enzyme in the placenta before they reach the fetus; dexamethasone and betamethasone are poor substrates for that enzyme, so they get through. The WHO ACTION-I trial randomised 2,852 women at 26 to 34 weeks across five countries and was stopped early: neonatal death was 19.6% against 23.5% on placebo. The caution attached to that result is real. A separate cluster-randomised trial across six countries tried to widen the same treatment through the community and increased overall neonatal deaths and maternal infections, because many treated women were not in fact about to deliver preterm.',
      },
      {
        q: 'Is it a chemotherapy drug?',
        a: 'It is used in cancer treatment, and it is not chemotherapy in the usual sense. In lymphoid cancers — myeloma, lymphoma, acute lymphoblastic leukaemia — glucocorticoids are directly cytotoxic to the malignant cells, which are lymphocytes and die when the receptor is activated. Everywhere else in oncology it is supportive: reducing brain swelling around a tumour, preventing chemotherapy-induced nausea, and treating the inflammatory complications of immune checkpoint inhibitors. Those are different roles with different evidence behind them and the label lists them separately.',
      },
      {
        q: 'Why does it cost pennies as a tablet and a fortune as an implant?',
        a: 'Because you are not paying for the molecule. Generic dexamethasone tablets have a median United States pharmacy acquisition cost of about 25 cents, and the drug has been off patent since long before most people prescribing it were born. Ozurdex is a biodegradable implant that places 0.7 mg of the same molecule inside the eye and releases it over months; that device required its own trials and carries its own patents, and comparing its price to a tablet is comparing a delivery system to a chemical. The harder case is a 20 mg oral tablet approved in 2019 for a myeloma use in which ordinary dexamethasone tablets were already universal. There the packaging is the innovation.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'RECOVERY Collaborative Group. Dexamethasone in hospitalized patients with Covid-19. N Engl J Med 2021;384:693-704',
        identifier: '10.1056/NEJMoa2021436',
        kind: 'doi',
      },
      {
        label:
          'WHO ACTION Trials Collaborators. Antenatal dexamethasone for early preterm birth in low-resource countries. N Engl J Med 2020;383:2514-2525',
        identifier: '10.1056/NEJMoa2022398',
        kind: 'doi',
      },
      {
        label:
          'Althabe F et al. A population-based, multifaceted strategy to implement antenatal corticosteroid treatment versus standard care: the ACT cluster-randomised trial. Lancet 2015;385:629-639',
        identifier: '10.1016/S0140-6736(14)61651-2',
        kind: 'doi',
      },
      {
        label:
          'de Gans J, van de Beek D. Dexamethasone in adults with bacterial meningitis. N Engl J Med 2002;347:1549-1556',
        identifier: '10.1056/NEJMoa021334',
        kind: 'doi',
      },
      {
        label:
          'Scarborough M et al. Corticosteroids for bacterial meningitis in adults in sub-Saharan Africa. N Engl J Med 2007;357:2441-2450',
        identifier: '10.1056/NEJMoa065711',
        kind: 'doi',
      },
      {
        label:
          'Nguyen TH et al. Dexamethasone in Vietnamese adolescents and adults with bacterial meningitis. N Engl J Med 2007;357:2431-2440',
        identifier: '10.1056/NEJMoa070852',
        kind: 'doi',
      },
      {
        label:
          'Bjornson CL et al. A randomized trial of a single dose of oral dexamethasone for mild croup. N Engl J Med 2004;351:1306-1313',
        identifier: '10.1056/NEJMoa033534',
        kind: 'doi',
      },
      {
        label:
          'Villar J et al. Dexamethasone treatment for the acute respiratory distress syndrome: a multicentre, randomised controlled trial. Lancet Respir Med 2020;8:267-276',
        identifier: '10.1016/S2213-2600(19)30417-5',
        kind: 'doi',
      },
      {
        label: 'RECOVERY: randomised evaluation of COVID-19 therapy, dexamethasone comparison',
        identifier: 'NCT04381936',
        kind: 'nct',
      },
      {
        label:
          'ACT: antenatal corticosteroids trial, cluster-randomised implementation across six countries',
        identifier: 'NCT01084096',
        kind: 'nct',
      },
      {
        label: 'PubChem CID 5743 — dexamethasone structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5743',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 3. Hydrocortisone — the hormone itself. Life-saving as replacement on evidence no trial will
  //    ever supply, and the subject of two adequately powered septic shock trials that disagree.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'hydrocortisone',
    name: 'Hydrocortisone',
    tradeName:
      'Cortef / Solu-Cortef / A-Hydrocort / Hydrocortisone Sodium Succinate / Alkindi Sprinkle',
    sponsor:
      'Originally Merck, which first synthesised cortisone and hydrocortisone in the late 1940s. Off patent for over half a century; the injectable Solu-Cortef is a Pfizer legacy product and the paediatric granule formulation Alkindi Sprinkle is held by Eton Pharmaceuticals under NDA 213876.',
    targetGene: 'NR3C1',
    targetProtein:
      'Glucocorticoid receptor (NR3C1) and, at higher exposure, the mineralocorticoid receptor (NR3C2). Hydrocortisone is cortisol: it is the endogenous ligand for both, and only the local enzyme 11-beta-hydroxysteroid dehydrogenase type 2 normally keeps it away from NR3C2.',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1951,
    indication:
      'Primary and secondary adrenocortical insufficiency and congenital adrenal hyperplasia, where it replaces a missing hormone; and, at pharmacological exposure, rheumatic, collagen, dermatologic, allergic, ophthalmic, respiratory, haematologic, neoplastic, oedematous and gastrointestinal disorders. Also available over the counter as a topical cream for minor skin inflammation.',
    patientFriendlyIndication:
      'Replacing the cortisol the adrenal glands cannot make, and — at higher exposure — inflammation and allergy',
    anatomicalSite:
      'Every tissue. Cortisol is a systemic hormone and hydrocortisone is that hormone; the receptor is expressed in essentially all nucleated human cells.',
    conditionContext: {
      conditionExplainer:
        'The adrenal glands sit above the kidneys and make cortisol, the hormone that maintains blood pressure, blood sugar and the ability to withstand stress. When they fail — from autoimmune destruction, from surgery, from an enzyme defect present at birth, or from being switched off by another steroid — nothing else in the body makes it.',
      whyItMatters:
        'Untreated primary adrenal insufficiency was uniformly fatal before 1949. It is the one indication in this entire batch where the drug is not suppressing anything: it is putting a missing molecule back. That is also why it has no placebo-controlled trial and never will.',
      whoTakesThis:
        'People with Addison’s disease, with pituitary failure, with congenital adrenal hyperplasia, and anyone whose own cortisol production has been suppressed by prolonged treatment with another glucocorticoid. Separately, patients in septic shock, and anyone reaching for a 1% cream for an insect bite.',
      clinicalGoals:
        'For replacement, restore something close to the normal daily cortisol pattern and avoid an adrenal crisis during illness. For pharmacological use, suppress inflammation or support blood pressure. These are different goals with entirely different evidence behind them, and the page keeps them apart.',
    },
    oneSentenceVerdict:
      'Cortisol itself, made in a factory: it binds both the glucocorticoid and the mineralocorticoid receptor and is the only drug here that replaces a hormone rather than suppressing a system — the replacement indication rests on the disappearance of a uniformly fatal disease after 1949 and on no randomised trial at all, while the septic shock indication has two trials of 3,800 and 1,241 patients that reached opposite conclusions.',
    laymanHowItWorks:
      'Hydrocortisone is chemically identical to cortisol, the hormone your adrenal glands release every morning and whenever you are ill or injured. Given as a tablet or an injection it does exactly what your own cortisol does: it binds a receptor inside cells that then switches inflammatory genes off and metabolic genes on, and it also acts on the receptor that keeps blood pressure up by holding on to salt. In someone whose adrenal glands have failed, that is replacement — putting back a molecule the body cannot make. In someone with working adrenal glands, giving more of it is suppression, and the same hormone that keeps a person with Addison’s disease alive will thin their bones and raise their blood sugar if given in excess.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 70,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1824 per tablet at United States pharmacy acquisition cost (CMS NADAC, generic, median across 122 listed products, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Cortisone was first isolated in the 1930s and synthesised at scale by Merck from 1948; the compound has been off patent since long before modern patent terms. It appears on the WHO Model List of Essential Medicines and the topical 1% cream is sold over the counter. The live pricing question in this class is not the molecule but the paediatric formulation: Alkindi Sprinkle, taste-masked granules in doses down to 0.5 mg approved under NDA 213876 in September 2020, exists because tablets cannot be split accurately enough for an infant, and it is priced accordingly.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'For adrenal replacement there is no substitute outside the class and only partial ones inside it: prednisolone lasts longer but does not reproduce the daily rhythm, and dexamethasone has no mineralocorticoid activity at all, which matters in primary adrenal insufficiency where the aldosterone pathway has also failed. For anti-inflammatory use hydrocortisone is the weakest and shortest-acting option in the class, which is why it is largely confined to topical and intravenous use. Nothing sold as a food, an adaptogen or an "adrenal support" supplement replaces cortisol, and in a person with true adrenal insufficiency relying on one is life-threatening.',
      conventionalRx: [
        {
          name: 'Prednisolone (for replacement)',
          class: 'Glucocorticoid, intermediate-acting',
          howItCompares:
            'A once-daily alternative for adults with adrenal insufficiency who cannot manage divided hydrocortisone. It is about four times as potent per milligram with a much longer duration, which smooths out the peaks and troughs and also removes the physiological rhythm. It retains only a fraction of hydrocortisone’s mineralocorticoid activity.',
          typicalCost:
            'Generic tablets cost cents at United States pharmacy acquisition cost',
          prosAndCons:
            'Pros: once daily, simpler. Cons: a flat exposure curve rather than a diurnal one, and long-term data comparing it against hydrocortisone on hard outcomes in adrenal insufficiency are limited.',
        },
        {
          name: 'Fludrocortisone',
          class: 'Mineralocorticoid',
          howItCompares:
            'Not a substitute but a partner. Primary adrenal insufficiency destroys aldosterone production as well as cortisol, and hydrocortisone alone does not replace it at replacement exposure. In the APROCCHSS septic shock trial fludrocortisone was given alongside hydrocortisone, which is one of the reasons that trial cannot be compared directly with ADRENAL, where it was not.',
          typicalCost: 'Generic; among the cheapest prescription tablets available',
          prosAndCons:
            'Pros: replaces the salt-retaining hormone that hydrocortisone cannot at physiological exposure. Cons: not needed in secondary adrenal insufficiency, where the aldosterone axis is intact.',
        },
        {
          name: 'Modified-release hydrocortisone (Plenadren, Chronocort)',
          class: 'Glucocorticoid, delayed and dual-release formulations',
          howItCompares:
            'Formulations designed to reproduce the natural overnight rise in cortisol that immediate-release tablets cannot. The molecule is unchanged. The claimed advantage is a physiological exposure curve, and the endpoint evidence for that translating into better long-term outcomes is thinner than the pharmacokinetic evidence that the curve is closer.',
          typicalCost:
            'Substantially more expensive than immediate-release hydrocortisone; not marketed in all countries',
          prosAndCons:
            'Pros: better matches the natural cortisol rhythm, particularly the pre-waking rise. Cons: cost, availability, and a gap between a demonstrated pharmacokinetic improvement and a demonstrated clinical one.',
        },
        {
          name: 'Topical calcineurin inhibitors (for skin)',
          class: 'Non-steroidal topical immunomodulators',
          howItCompares:
            'For eczema on thin skin — face, eyelids, skin folds — tacrolimus and pimecrolimus ointments avoid the skin thinning that repeated topical hydrocortisone causes. They do not work as fast and they sting on application.',
          typicalCost:
            'US$0.6591 per unit for generic oral tacrolimus at United States pharmacy acquisition cost; the topical ointment is a separate and more expensive product',
          prosAndCons:
            'Pros: no dermal atrophy, no telangiectasia. Cons: burning on application, and a boxed warning about malignancy that came from animal data and case reports rather than from a controlled study.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Carry a steroid emergency card and know what an adrenal crisis is',
          action:
            'Anyone on replacement should carry documentation of the diagnosis, and anyone around them should know that vomiting plus collapse is an emergency.',
          patientImpact:
            'In adrenal insufficiency, an ordinary infection or an operation can precipitate circulatory collapse if cortisol is not increased. This is the failure mode that still kills people with a treated diagnosis.',
          clinicalPrecaution:
            'A Swedish population study of 1,675 people with Addison’s disease found 507 deaths where 199 were expected, with infection among the leading causes of the excess. Replacement therapy does not restore normal mortality.',
        },
        {
          name: 'Do not use "adrenal fatigue" supplements as a substitute',
          action:
            'If adrenal insufficiency has been diagnosed, treat any product marketed for "adrenal support" as irrelevant to it.',
          patientImpact:
            'Adrenal insufficiency is diagnosed by a measured cortisol response, and treated by replacing cortisol. Products sold for "adrenal fatigue" address a condition that has no diagnostic criteria and no laboratory definition, and some contain undeclared glandular extract.',
          clinicalPrecaution:
            'Stopping prescribed replacement to try an alternative is the specific action that causes adrenal crisis. This is not a caution about efficacy; it is a caution about substitution.',
        },
        {
          name: 'Use the over-the-counter cream on skin, not on eyes or broken skin',
          action:
            'Keep topical 1% hydrocortisone away from the eyelids and off open or infected skin unless a clinician has said otherwise.',
          patientImpact:
            'Topical steroid applied to infected skin suppresses the local immune response and can let a fungal or bacterial infection spread while masking its appearance. Around the eye it can raise intraocular pressure.',
          clinicalPrecaution:
            'Repeated application to thin skin causes dermal atrophy, stretch marks and visible small vessels, and these changes are not always reversible.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C[C@]12CCC(=O)C=C1CC[C@@H]3[C@@H]2[C@H](C[C@]4([C@H]3CC[C@@]4(C(=O)CO)O)C)O',
      chemicalFormula: 'C21H30O5',
      molecularWeight: '362.50 g/mol',
      targetReceptorAffinity:
        'The reference compound for the whole class: relative glucocorticoid potency 1 and relative mineralocorticoid potency 1 by definition. Biological half-life 8 to 12 hours, the shortest of the systemic glucocorticoids. Roughly 90% is bound in plasma, mostly to corticosteroid-binding globulin, which saturates within the physiological range and gives free cortisol a sharply non-linear relationship to total cortisol.',
      structureSource: {
        label:
          'PubChem CID 5754 (hydrocortisone / cortisol) — canonical SMILES, molecular formula C21H30O5 and molecular weight 362.5 g/mol, re-checked against the PUG REST property endpoint',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5754',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'hc-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Distinguish hydrocortisone from cortisone by the C11 oxidation state',
          description:
            'Confirm the 11-beta hydroxyl rather than the 11-keto group. Cortisone differs by two hydrogen atoms, is inactive at the receptor until reduced, and was the compound in the original 1949 Mayo Clinic experiments — so the two are constantly confused in historical sources and are separately marketed products today.',
          reagentsAndBuffer:
            'Hydrocortisone USP reference standard, 1H and 13C NMR in DMSO-d6, reversed-phase HPLC resolving cortisol from cortisone, ultraviolet detection at 242 nm',
        },
        {
          id: 'hc-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Microbial 11-beta-hydroxylation of a plant-derived precursor',
          description:
            'Introduce the 11-beta hydroxyl into a Reichstein-type intermediate using the fungal 11-beta-hydroxylase of Curvularia lunata. This single biotransformation, published in 1952, replaced a 31-step chemical synthesis and cut the price of cortisone by more than two orders of magnitude within a few years. It is the reason corticosteroids are cheap.',
          dependsOnStepId: 'hc-w1',
          reagentsAndBuffer:
            'Curvularia lunata whole-cell culture or recombinant CYP11B1 expressed with adrenodoxin and adrenodoxin reductase, Reichstein’s Substance S in a cyclodextrin or co-solvent complex, aerated fermentation at 28 degrees C, NADPH regeneration for the enzymatic route',
        },
        {
          id: 'hc-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation away from the 11-alpha epimer and residual substrate',
          description:
            'Separate the 11-beta product from the 11-alpha epimer, which the same enzyme produces as a minor by-product and which has no glucocorticoid activity, and from unconverted Substance S. Neither impurity is separable by mass, so chromatographic resolution is the only usable check.',
          dependsOnStepId: 'hc-w2',
          reagentsAndBuffer:
            'Ethyl acetate extraction, crystallisation from aqueous methanol or acetone, reversed-phase HPLC against USP related-compounds standards',
        },
        {
          id: 'hc-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Test whether 11-beta-HSD2 inactivates it in a mineralocorticoid target cell',
          description:
            'Expose a kidney-derived cell line expressing 11-beta-hydroxysteroid dehydrogenase type 2 and measure conversion to cortisone. This enzyme is the only thing preventing cortisol from occupying the mineralocorticoid receptor, which it binds with the same affinity as aldosterone. A compound resistant to the enzyme — dexamethasone, or cortisol when the enzyme is inhibited by liquorice — behaves entirely differently in the kidney.',
          dependsOnStepId: 'hc-w3',
          reagentsAndBuffer:
            'HEK293 or M-1 collecting duct cells expressing HSD11B2, LC-MS/MS quantification of cortisol and cortisone, glycyrrhetinic acid as an enzyme inhibitor control',
        },
        {
          id: 'hc-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Read glucocorticoid and mineralocorticoid activity in parallel',
          description:
            'Quantify transactivation at both receptors in the same experiment. Hydrocortisone is the only compound in this batch with clinically meaningful activity at both, and separating the two readouts is what makes its behaviour interpretable — the blood-pressure support in septic shock and the fluid retention on the ward are the mineralocorticoid arm, not the anti-inflammatory one.',
          dependsOnStepId: 'hc-w4',
          reagentsAndBuffer:
            'MMTV-luciferase glucocorticoid reporter and MR-responsive element reporter lines, aldosterone and dexamethasone as reference ligands, spironolactone and mifepristone as receptor-specific antagonists, charcoal-stripped serum',
        },
      ],
    },
    keyAudits: [
      {
        id: 'hc-a1',
        category: 'inferred',
        title: 'The replacement indication has no randomised evidence and never will',
        laymanSummary:
          'Addison’s disease killed almost everyone who had it before 1949. After cortisone became available, it stopped doing so. That is the entire evidence base for the most important use of this drug: a before-and-after comparison, not a randomised trial, because randomising someone with adrenal failure to placebo would kill them.',
        technicalDetails:
          'No placebo-controlled trial of glucocorticoid replacement in primary adrenal insufficiency exists, and none can be conducted: withholding cortisol from a person who cannot make it is lethal within days to weeks under physiological stress. The evidence is the historical case fatality of untreated Addison’s disease, the dose-response of the cortisol requirement during illness, and the reproducible physiological effect on blood pressure, sodium and glucose. This is one of the strongest inferences in medicine and it is still an inference. It matters because the same absence of trial data extends to questions that could be answered: which glucocorticoid, what exposure profile, and whether modified-release formulations improve outcomes rather than curves.',
        evidenceSource:
          'United States prescribing information for hydrocortisone tablets (CORTEF), Indications section 1, "Endocrine Disorders"; historical case-fatality record of untreated primary adrenal insufficiency',
        inferredClaim:
          'That current replacement regimens are optimal — the fact that replacement is necessary is beyond doubt, and the fact that any particular regimen is the best one has not been tested',
        auditFlag: 'caution',
      },
      {
        id: 'hc-a2',
        category: 'measured',
        title: 'Treated Addison’s disease still carries more than double the expected mortality',
        laymanSummary:
          'Replacement therapy is usually described as returning life expectancy to normal. A Swedish study followed every diagnosed case in the country for fourteen years and found more than twice as many deaths as expected, from heart disease, cancer and infection.',
        technicalDetails:
          'A population-based retrospective study using the Swedish National Hospital and Cause of Death registers identified 1,675 patients with primary adrenal insufficiency between 1987 and 2001, followed for an average of 6.5 years from diagnosis. There were 507 deaths against 199 expected. The all-cause mortality risk ratio was 2.19 (95% CI 1.91 to 2.51) in men and 2.86 (95% CI 2.54 to 3.20) in women. The excess was attributed to cardiovascular, malignant and infectious disease. Concomitant diabetes was present in 12% and contributed only slightly.',
        evidenceSource: 'Bergthorsdottir R et al., J Clin Endocrinol Metab 2006;91:4849-4853',
        doi: '10.1210/jc.2006-0076',
        measuredMetric:
          'All-cause mortality risk ratio against the matched national background population',
        auditFlag: 'verified',
      },
      {
        id: 'hc-a3',
        category: 'failed',
        title: 'ADRENAL: no mortality benefit in 3,800 patients with septic shock',
        laymanSummary:
          'The largest trial of steroids in septic shock ever run gave hydrocortisone or a placebo to nearly four thousand ventilated patients. The same proportion died in each group. Shock reversed a day faster on the drug, and that did not translate into anyone surviving who would not have.',
        technicalDetails:
          'ADRENAL randomised 3,800 patients with septic shock undergoing mechanical ventilation to a continuous infusion of hydrocortisone 200 mg per day for 7 days or placebo, with primary outcome ascertained in 3,658. Death from any cause at 90 days was 511 (27.9%) against 526 (28.8%), odds ratio 0.95 (95% CI 0.82 to 1.10, P=0.50), with a similar effect across all six prespecified subgroups. Shock resolved faster (median 3 against 4 days, hazard ratio 1.32, 95% CI 1.23 to 1.41, P<0.001) and the initial ventilation episode was shorter, but days alive and free of ventilation did not differ once recurrences were counted. Fewer patients received a transfusion (37.0% against 41.7%). There was no difference in 28-day mortality, shock recurrence, ICU or hospital days, renal replacement, or new bacteraemia or fungaemia.',
        evidenceSource: 'Venkatesh B et al., N Engl J Med 2018;378:797-808 (ADRENAL, NCT01448109)',
        doi: '10.1056/NEJMoa1705835',
        measuredMetric: 'All-cause mortality at 90 days, against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'hc-a4',
        category: 'conclusion_shift',
        title: 'APROCCHSS reached the opposite conclusion in the same month',
        laymanSummary:
          'Three weeks after the trial that found nothing, a French trial of 1,241 patients found hydrocortisone with a second hormone cut deaths at ninety days from 49.1% to 43.0%. The two trials were published in the same journal in the same year and the field has not fully reconciled them.',
        technicalDetails:
          'APROCCHSS randomised 1,241 patients with septic shock in a 2-by-2 factorial design that became a two-group comparison after drotrecogin alfa was withdrawn. Ninety-day mortality was 43.0% (264 of 614) with hydrocortisone plus fludrocortisone against 49.1% (308 of 627) with placebo, relative risk 0.88 (95% CI 0.78 to 0.99, P=0.03). Mortality was also lower at ICU discharge (35.4% against 41.0%, P=0.04), hospital discharge (39.0% against 45.3%, P=0.02) and day 180 (46.6% against 52.5%, P=0.04), but not at day 28 (33.7% against 38.9%, P=0.06). Vasopressor-free and organ-failure-free days both favoured treatment. Hyperglycaemia was more common. Three differences from ADRENAL are usually offered: APROCCHSS added fludrocortisone, enrolled a sicker population with a placebo mortality of 49.1% against 28.8%, and used bolus rather than continuous infusion. None of the three has been tested as the explanation.',
        evidenceSource:
          'Annane D et al., N Engl J Med 2018;378:809-818 (APROCCHSS, NCT00625209); Venkatesh B et al., N Engl J Med 2018;378:797-808 (ADRENAL, NCT01448109)',
        doi: '10.1056/NEJMoa1705716',
        inferredClaim:
          'That one of the two trials is simply right — the honest reading is that hydrocortisone reliably reverses shock faster and unreliably changes whether people die, and the conditions separating the two results have not been identified',
        auditFlag: 'contested',
      },
      {
        id: 'hc-a5',
        category: 'failed',
        title: 'CORTICUS: no survival benefit, faster shock reversal, more superinfection',
        laymanSummary:
          'The trial that came ten years before both of the others tested whether a cortisol stimulation test could identify who would benefit. It could not. Nobody survived at a different rate, and there were more new infections in the steroid group.',
        technicalDetails:
          'CORTICUS randomised 499 patients with septic shock to hydrocortisone 50 mg intravenously every 6 hours for 5 days then tapered, or placebo. At 28 days there was no significant difference in mortality among the 233 patients who did not respond to corticotropin (39.2% against 36.1%, P=0.69), among those who did respond (28.8% against 28.7%, P=1.00), or overall (34.3% against 31.5%, P=0.51). Shock reversed more quickly on hydrocortisone. There were more episodes of superinfection, including new sepsis and septic shock. The trial closed the question of whether the corticotropin test selects responders: it does not, and the test was subsequently dropped from guidance.',
        evidenceSource: 'Sprung CL et al., N Engl J Med 2008;358:111-124 (CORTICUS, NCT00147004)',
        doi: '10.1056/NEJMoa071366',
        measuredMetric:
          'Death at 28 days among corticotropin non-responders, and overall, against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'hc-a6',
        category: 'failed',
        title: 'Preterm infants: no improvement in survival without lung disease in 800 babies',
        laymanSummary:
          'Extremely premature babies still on a ventilator after two weeks were given hydrocortisone or a placebo. Slightly more survived without serious lung disease on the drug, but not enough to be a real difference, and at two years there was no difference in survival free of disability either.',
        technicalDetails:
          'A National Institutes of Health trial enrolled 800 infants under 30 weeks’ gestation intubated for at least 7 days at age 14 to 28 days, randomised to hydrocortisone 4 mg/kg/day tapered over 10 days or placebo. Survival without moderate or severe bronchopulmonary dysplasia at 36 weeks postmenstrual age was 66 of 398 (16.6%) against 53 of 402 (13.2%), adjusted rate ratio 1.27 (95% CI 0.93 to 1.74). Survival without moderate or severe neurodevelopmental impairment at 22 to 26 months was 132 of 358 (36.9%) against 134 of 359 (37.3%), adjusted rate ratio 0.98 (95% CI 0.81 to 1.18). Hypertension requiring treatment was more frequent on hydrocortisone (4.3% against 1.0%).',
        evidenceSource:
          'Watterberg KL et al., N Engl J Med 2022;386:1121-1131 (NICHD Neonatal Research Network, NCT01353313)',
        doi: '10.1056/NEJMoa2114897',
        measuredMetric:
          'Survival without moderate or severe bronchopulmonary dysplasia at 36 weeks, and survival without neurodevelopmental impairment at 22 to 26 months',
        auditFlag: 'verified',
      },
      {
        id: 'hc-a7',
        category: 'inferred',
        title: 'Faster shock reversal is not the same as a life saved, and this is where they diverge',
        laymanSummary:
          'Every large trial of hydrocortisone in septic shock agrees on one thing: blood pressure recovers faster on the drug. The trials disagree about whether anyone lives longer as a result. The surrogate is consistent; the outcome is not.',
        technicalDetails:
          'ADRENAL found shock resolution a median day faster (hazard ratio 1.32, 95% CI 1.23 to 1.41, P<0.001) with a 90-day mortality odds ratio of 0.95 (0.82 to 1.10). CORTICUS found faster shock reversal with no mortality difference at 28 days and more superinfection. APROCCHSS found both faster vasopressor withdrawal and a mortality benefit. A surrogate that moves reliably while the outcome moves inconsistently is the definition of an unvalidated surrogate, and haemodynamic response to steroid in septic shock is one — mechanistically the mineralocorticoid effect on vascular tone and catecholamine sensitivity is straightforward and immediate, and it does not by itself determine survival.',
        evidenceSource:
          'Venkatesh B et al., N Engl J Med 2018;378:797-808; Sprung CL et al., N Engl J Med 2008;358:111-124; Annane D et al., N Engl J Med 2018;378:809-818',
        doi: '10.1056/NEJMoa1705835',
        inferredClaim:
          'That reversing shock faster means saving lives — the haemodynamic effect is reproducible across every trial and the mortality effect is not',
        auditFlag: 'contested',
      },
      {
        id: 'hc-a8',
        category: 'measured',
        title: 'The 1952 fermentation step is why the whole class costs cents',
        laymanSummary:
          'The first cortisone was made through a 31-step chemical synthesis and was one of the most expensive substances on earth. A single fungal enzyme that could add one oxygen atom to the right carbon replaced most of those steps, and the price collapsed. Every drug in this class exists at its current price because of that.',
        technicalDetails:
          'Introducing an 11-beta hydroxyl group into a steroid nucleus chemically requires selective functionalisation of an unactivated carbon and was the bottleneck in Sarett’s original synthesis. The Upjohn discovery that Rhizopus and later Curvularia species perform this hydroxylation in a single fermentation step converted the problem into a biotransformation. Hydrocortisone is now among the cheapest prescription medicines available, at a median United States pharmacy acquisition cost of US$0.1824 per tablet across 122 listed products, and the topical 1% preparation is sold without prescription. The measured claim here is the price, not the history: what the fermentation route made possible is visible in the NADAC file today.',
        evidenceSource:
          'CMS National Average Drug Acquisition Cost file, effective 19 August 2026; Hill AM, Barber MJ, Gotham D, BMJ Glob Health 2018;3:e000571',
        doi: '10.1136/bmjgh-2017-000571',
        measuredMetric:
          'United States pharmacy acquisition cost per tablet, median across 122 listed generic products',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'It is the hormone, not an imitation of it',
        laymanDesc:
          'Every other drug in this group is a modified version of cortisol. Hydrocortisone is cortisol. Swallowed or injected, the body cannot distinguish it from what the adrenal glands would have released.',
        molecularDetail:
          'Identical to endogenous cortisol, C21H30O5. Oral bioavailability is high and peak concentrations arrive within about an hour. Roughly 90% is protein bound, principally to corticosteroid-binding globulin, which saturates in the upper physiological range and makes free cortisol rise disproportionately once total cortisol exceeds it.',
        iconName: 'Droplet',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'A gatekeeper enzyme decides which receptor it reaches',
        laymanDesc:
          'Cortisol binds two different receptors equally well. In the kidney and the colon an enzyme destroys it on arrival so it cannot reach the second one, which is reserved for a different hormone.',
        molecularDetail:
          '11-beta-hydroxysteroid dehydrogenase type 2 oxidises cortisol to inactive cortisone in mineralocorticoid target tissues, protecting NR3C2, which binds cortisol and aldosterone with equal affinity. Inhibiting the enzyme — with glycyrrhetinic acid from liquorice, or by congenital deficiency — produces apparent mineralocorticoid excess: hypertension and low potassium driven by cortisol acting where aldosterone should.',
        iconName: 'Filter',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The glucocorticoid receptor is released and moves to the nucleus',
        laymanDesc:
          'Where the enzyme does not intervene, cortisol binds the receptor waiting in the cytoplasm, frees it from its chaperones, and it travels into the nucleus.',
        molecularDetail:
          'Dissociation of the HSP90-HSP70-p23-immunophilin complex on NR3C1, FKBP51 to FKBP52 exchange, dynein-mediated nuclear import. The same pathway as every other glucocorticoid on this site, driven by the endogenous ligand.',
        iconName: 'Unlock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'It sets the metabolic baseline as well as suppressing inflammation',
        laymanDesc:
          'Cortisol does not only quieten inflammation. It tells the liver to make glucose, tells fat and muscle to release fuel, and keeps blood vessels responsive to the signals that maintain blood pressure. Losing all of that at once is what makes adrenal failure fatal.',
        molecularDetail:
          'Transactivation induces PEPCK and glucose-6-phosphatase for hepatic gluconeogenesis, and permits catecholamine-mediated vasoconstriction by maintaining adrenergic receptor expression and inhibiting inducible nitric oxide synthase. Transrepression of NF-kappaB and AP-1 produces the anti-inflammatory effect. In adrenal insufficiency the failure is of both arms, plus aldosterone, which is why replacement needs a mineralocorticoid alongside.',
        iconName: 'Activity',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'In replacement, the goal is normality; in shock, it is a haemodynamic effect',
        laymanDesc:
          'Given to someone whose adrenal glands have failed, the aim is to reproduce a normal day. Given to someone in septic shock, the aim is to get their blood pressure back — and that part works consistently.',
        molecularDetail:
          'Across ADRENAL, CORTICUS and APROCCHSS, faster shock reversal is the one finding all three share; ADRENAL measured a hazard ratio of 1.32 (95% CI 1.23 to 1.41) for resolution of shock. The mechanism is the mineralocorticoid and vascular arm rather than the anti-inflammatory one, and it acts within hours.',
        iconName: 'HeartPulse',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What the haemodynamic effect does not settle',
        laymanDesc:
          'Blood pressure recovering faster did not mean fewer people died in the largest trial. The two things came apart, and the field has not agreed on why.',
        molecularDetail:
          '90-day mortality odds ratio 0.95 (95% CI 0.82 to 1.10) in 3,658 patients in ADRENAL against a relative risk of 0.88 (0.78 to 0.99) in 1,241 patients in APROCCHSS. CORTICUS additionally recorded more superinfection, including new sepsis and septic shock — the predictable cost of suppressing an immune response during an infection.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'ADRENAL (NCT01448109)',
        phase: 'Phase 3, international, randomised, double-blind, placebo-controlled',
        sampleSize: 3800,
        primaryEndpoint: 'Death from any cause at 90 days in septic shock',
        endpointMet: false,
        statisticalPValue: '27.9% against 28.8%; odds ratio 0.95 (95% CI 0.82 to 1.10), P=0.50',
        unreportedAdverseSignals:
          'Shock resolved a median day faster (hazard ratio 1.32, 95% CI 1.23 to 1.41) and the initial ventilation episode was shorter, but days alive and free of ventilation did not differ once recurrences were counted. Secondary findings that move without the primary endpoint moving are the ones most often quoted as if the trial were positive.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'APROCCHSS (NCT00625209)',
        phase: 'Phase 3, multicentre, randomised, double-blind, 2-by-2 factorial reduced to two groups',
        sampleSize: 1241,
        primaryEndpoint: 'All-cause mortality at 90 days in septic shock',
        endpointMet: true,
        statisticalPValue: '43.0% against 49.1%; relative risk 0.88 (95% CI 0.78 to 0.99), P=0.03',
        unreportedAdverseSignals:
          'Day-28 mortality was not significantly different (33.7% against 38.9%, P=0.06). The regimen included fludrocortisone, the population was substantially sicker than in ADRENAL, and the factorial design collapsed mid-trial when drotrecogin alfa was withdrawn from the market.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'CORTICUS (NCT00147004)',
        phase: 'Phase 3, multicentre, randomised, double-blind, placebo-controlled',
        sampleSize: 499,
        primaryEndpoint:
          'Death at 28 days among patients without a response to a corticotropin stimulation test',
        endpointMet: false,
        statisticalPValue:
          '39.2% against 36.1% in non-responders, P=0.69; 34.3% against 31.5% overall, P=0.51',
        unreportedAdverseSignals:
          'More episodes of superinfection, including new sepsis and new septic shock, in the hydrocortisone group. The trial also under-recruited against its planned sample size.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'NICHD Hydrocortisone trial (NCT01353313)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 800,
        primaryEndpoint:
          'Survival without moderate or severe bronchopulmonary dysplasia at 36 weeks postmenstrual age',
        endpointMet: false,
        statisticalPValue: '16.6% against 13.2%; adjusted rate ratio 1.27 (95% CI 0.93 to 1.74)',
        unreportedAdverseSignals:
          'Hypertension requiring medication occurred in 4.3% against 1.0%. The two-year safety outcome — survival without moderate or severe neurodevelopmental impairment — was flat at 36.9% against 37.3%.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Septic shock 90-day mortality 27.9% against 28.8% in 3,658 analysed patients, odds ratio 0.95 (95% CI 0.82 to 1.10) — no benefit',
        'Septic shock 90-day mortality 43.0% against 49.1% in 1,241 patients with added fludrocortisone, relative risk 0.88 (0.78 to 0.99) — benefit',
        'Faster shock resolution in every trial: hazard ratio 1.32 (95% CI 1.23 to 1.41) in ADRENAL',
        'All-cause mortality risk ratio 2.19 in men and 2.86 in women with treated Addison’s disease against the Swedish background population',
        'Survival without bronchopulmonary dysplasia 16.6% against 13.2% in 800 preterm infants, adjusted rate ratio 1.27 (0.93 to 1.74) — not significant',
      ],
      unsupportedInferences: [
        'That faster reversal of shock means more people survive it — the surrogate moves in every trial and the outcome does not',
        'That current replacement regimens are optimal; that replacement is necessary is certain, that any particular schedule is best has never been tested',
        'That replacement restores normal life expectancy — the Swedish cohort found more than double the expected mortality',
        'That the corticotropin stimulation test identifies patients who will benefit, an idea CORTICUS tested directly and refuted',
      ],
      whatFailedInitially: [
        'ADRENAL, the largest septic shock steroid trial ever run, found no mortality difference at 90 days or 28 days',
        'CORTICUS found no benefit in any group and more superinfection, and eliminated the corticotropin test from guidance',
        'Hydrocortisone in ventilated preterm infants did not improve survival free of bronchopulmonary dysplasia or of neurodevelopmental impairment',
        'The two definitive septic shock trials published within weeks of each other reached opposite conclusions and the discrepancy is unresolved',
      ],
      realWorldOutcome: [
        'On the WHO Model List of Essential Medicines; a median United States pharmacy acquisition cost of about 18 cents a tablet across 122 products',
        'The 1% topical cream is sold over the counter in most countries, making this the most widely used prescription-origin steroid in the world',
        'Sepsis guidance now suggests hydrocortisone for shock unresponsive to fluids and vasopressors, a conditional recommendation reflecting exactly the trial disagreement above',
        'A paediatric granule formulation was approved in 2020 under NDA 213876 because a 1951 molecule still had no accurate way to dose an infant',
      ],
    },
    deliverySystem: {
      type:
        'Oral tablet, taste-masked oral granules for infants and children, sodium succinate powder for intravenous and intramuscular injection, sodium phosphate injection, rectal foam and enema, and topical creams and ointments including over-the-counter 1%',
      description:
        'Absorbed rapidly and almost completely by mouth, with a short biological half-life of 8 to 12 hours that requires divided daily administration for replacement and makes it the most controllable systemic glucocorticoid. The water-soluble sodium succinate ester is the standard intravenous form. Rectal foams deliver it to the distal colon with reduced systemic exposure, and topical formulations exploit the fact that inflamed skin absorbs far more than intact skin.',
      safetyProfile:
        'At replacement exposure the risks are of too little rather than too much: adrenal crisis during intercurrent illness or surgery is the principal cause of avoidable death, and treated Addison’s disease still carries more than double the expected mortality. At pharmacological exposure the full class profile applies — infection risk and masking, hyperglycaemia, hypertension and fluid retention (more prominent than with any other systemic glucocorticoid because of its mineralocorticoid activity), osteoporosis, myopathy, cataract, psychiatric disturbance. In CORTICUS, superinfection including new sepsis was more common on hydrocortisone.',
    },
    commonQuestions: [
      {
        q: 'Is hydrocortisone the same thing as cortisol?',
        a: 'Yes, exactly. The two words name the same molecule, C21H30O5. "Cortisol" is used when it is the hormone your adrenal glands made and "hydrocortisone" when it came out of a factory, and nothing else distinguishes them. That is why this drug occupies a category of its own in this batch: in adrenal insufficiency it is not a drug acting on a system, it is a missing molecule being put back. Cortisone is a different compound — it has a ketone where cortisol has a hydroxyl and must be converted by the liver before it does anything.',
      },
      {
        q: 'Does hydrocortisone work in septic shock?',
        a: 'It reliably reverses shock faster and it does not reliably change whether people die. Three large randomised trials agree on the first point and disagree on the second. ADRENAL randomised 3,800 ventilated patients and found 90-day mortality of 27.9% against 28.8% on placebo, an odds ratio of 0.95 with a confidence interval comfortably spanning one. APROCCHSS randomised 1,241 sicker patients, added fludrocortisone, and found 43.0% against 49.1%, a relative risk of 0.88 that was significant. CORTICUS, a decade earlier, found no benefit and more new infections. Three explanations are usually offered for the split — the added fludrocortisone, the sicker population, and bolus against continuous infusion — and none of them has been tested.',
        auditNote:
          'This is a genuine unresolved disagreement between two well-conducted trials, not a case of one being better than the other. Guidance describes the recommendation as conditional for that reason.',
      },
      {
        q: 'Why does someone with Addison’s disease also need fludrocortisone?',
        a: 'Because primary adrenal insufficiency destroys the whole adrenal cortex, and the cortex makes two hormones that matter: cortisol and aldosterone. Hydrocortisone at replacement exposure does not replace aldosterone, because the enzyme 11-beta-hydroxysteroid dehydrogenase type 2 in the kidney destroys cortisol before it reaches the mineralocorticoid receptor — that enzyme is the reason cortisol does not act like aldosterone in a healthy person. Fludrocortisone resists that enzyme and occupies the receptor. In secondary adrenal insufficiency, where the pituitary has failed but the adrenal aldosterone pathway is intact, it is usually not needed.',
      },
      {
        q: 'Is the cream I buy over the counter the same drug?',
        a: 'Chemically, yes. A 1% hydrocortisone cream contains the same molecule as the tablet, applied where absorption is limited by intact skin. That limit is the whole safety argument, and it fails in three situations: on thin skin such as eyelids and skin folds, on broken or inflamed skin, and under an occlusive dressing or a nappy, all of which raise absorption substantially. Repeated application to thin skin causes visible thinning, stretch marks and small dilated vessels, and those changes are not always reversible. Applied to infected skin it suppresses the local response and lets the infection spread while making it look better.',
      },
      {
        q: 'Should I take it for "adrenal fatigue"?',
        a: 'Adrenal insufficiency and "adrenal fatigue" are not the same thing and the difference is diagnostic, not semantic. Adrenal insufficiency is defined by a measured failure of cortisol to rise on stimulation, is confirmed in a laboratory, and is fatal untreated. "Adrenal fatigue" has no diagnostic criteria, no laboratory definition and no agreed test, and endocrine societies have stated that the evidence does not support it as an entity. Taking glucocorticoid for it is not a neutral experiment: exogenous cortisol suppresses your own production within weeks, so a course taken on that basis creates the deficiency it was meant to treat, and stopping it then becomes the dangerous part.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Venkatesh B et al. Adjunctive glucocorticoid therapy in patients with septic shock. N Engl J Med 2018;378:797-808 (ADRENAL)',
        identifier: '10.1056/NEJMoa1705835',
        kind: 'doi',
      },
      {
        label:
          'Annane D et al. Hydrocortisone plus fludrocortisone for adults with septic shock. N Engl J Med 2018;378:809-818 (APROCCHSS)',
        identifier: '10.1056/NEJMoa1705716',
        kind: 'doi',
      },
      {
        label:
          'Sprung CL et al. Hydrocortisone therapy for patients with septic shock. N Engl J Med 2008;358:111-124 (CORTICUS)',
        identifier: '10.1056/NEJMoa071366',
        kind: 'doi',
      },
      {
        label:
          'Watterberg KL et al. Hydrocortisone to improve survival without bronchopulmonary dysplasia. N Engl J Med 2022;386:1121-1131',
        identifier: '10.1056/NEJMoa2114897',
        kind: 'doi',
      },
      {
        label:
          'Bergthorsdottir R, Leonsson-Zachrisson M, Odén A, Johannsson G. Premature mortality in patients with Addison’s disease: a population-based study. J Clin Endocrinol Metab 2006;91:4849-4853',
        identifier: '10.1210/jc.2006-0076',
        kind: 'doi',
      },
      {
        label: 'ADRENAL: adjunctive corticosteroid treatment in critically ill patients with septic shock',
        identifier: 'NCT01448109',
        kind: 'nct',
      },
      {
        label: 'APROCCHSS: activated protein C and corticosteroids for human septic shock',
        identifier: 'NCT00625209',
        kind: 'nct',
      },
      {
        label:
          'Drugs@FDA: ALKINDI SPRINKLE (hydrocortisone) oral granules, NDA 213876, Eton Pharmaceuticals — original approval 29 September 2020',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=213876',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 5754 — hydrocortisone structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5754',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 4. Methylprednisolone — the glucocorticoid with a randomised trial showing it kills people,
  //    and a lost indication that stood for twenty-three years on a subgroup.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'methylprednisolone',
    name: 'Methylprednisolone',
    tradeName:
      'Medrol / Solu-Medrol / Depo-Medrol / A-Methapred / Methylprednisolone Sodium Succinate',
    sponsor:
      'Originally The Upjohn Company, now Pfizer, which still holds Solu-Medrol under NDA 011856 and the Depo-Medrol and Medrol brands. Off patent; dozens of generic manufacturers make the injectable succinate and the oral tablet.',
    targetGene: 'NR3C1',
    targetProtein:
      'Glucocorticoid receptor (NR3C1). The 6-alpha methyl group raises glucocorticoid potency over prednisolone and further reduces the residual mineralocorticoid activity.',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1957,
    indication:
      'Endocrine, rheumatic, collagen, dermatologic, allergic, ophthalmic, respiratory, haematologic, neoplastic, oedematous, gastrointestinal and nervous system disorders, given orally, intravenously, intramuscularly, intra-articularly, intralesionally or into soft tissue, including acute exacerbations of multiple sclerosis',
    patientFriendlyIndication:
      'Severe inflammation, autoimmune flares and allergic reactions, particularly where a high dose is needed quickly by injection',
    anatomicalSite:
      'Cytoplasm and nucleus of nucleated cells throughout the body. The depot acetate formulation acts additionally as a local reservoir at the injection site — a joint, an epidural space, a lesion.',
    conditionContext: {
      conditionExplainer:
        'Methylprednisolone occupies the same mechanism as prednisolone with about a 25% higher potency per milligram and less salt retention. Its distinguishing feature is not chemistry but delivery: a water-soluble succinate ester that can be pushed into a vein at very high dose, and a poorly soluble acetate that stays where it is injected for weeks.',
      whyItMatters:
        'That delivery flexibility is why it became the standard high-dose intravenous steroid — for multiple sclerosis relapses, transplant rejection, and for two conditions where large randomised trials later found it did not help and in one case did harm. It is also the drug at the centre of the worst pharmaceutical contamination event in modern United States history.',
      whoTakesThis:
        'People having a multiple sclerosis relapse, an acute transplant rejection episode, a severe asthma or autoimmune flare, or a joint or epidural injection.',
      clinicalGoals:
        'Deliver a large, brief glucocorticoid exposure to shorten an inflammatory event, or a small, sustained one to a single anatomical site. Both goals attract the same objection: the drug does not distinguish the inflammation you want suppressed from the immune function you need.',
    },
    oneSentenceVerdict:
      'Prednisolone with an added methyl group, formulated so that very large doses can be given intravenously — it shortens multiple sclerosis relapses with oral and intravenous routes proving equivalent in 199 randomised patients, and in the 10,008-patient CRASH trial it raised death within two weeks after head injury from 17.9% to 21.1% (relative risk 1.18, 95% CI 1.09 to 1.27, p=0.0001).',
    laymanHowItWorks:
      'Methylprednisolone works exactly the way prednisolone does: it enters cells, frees a receptor that travels into the nucleus, and switches off the genes that produce inflammatory signals. One extra methyl group makes it slightly stronger per milligram and removes most of the salt-retaining effect, which matters when very large amounts are given at once. What sets it apart is how it can be delivered — a water-soluble form that goes into a vein by the gram, and an oily form that sits in a joint for weeks releasing slowly. Neither of those changes what the drug does inside a cell; they change how much of it arrives, and where.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 62,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$2.87 per unit at United States pharmacy acquisition cost (CMS NADAC, generic, median across 46 listed products, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Introduced by Upjohn in 1957 and out of patent for decades; Solu-Medrol remains listed under NDA 011856 alongside many generic sodium succinate products. The pricing question that matters for this molecule is not patent but supply: preservative-free methylprednisolone acetate for epidural use was, in 2012, being produced in bulk by a compounding pharmacy operating outside the manufacturing standards that apply to an approved product, and the resulting contamination killed 61 people. The Drug Quality and Security Act of 2013 was written in response.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Within the class, prednisolone does the same job orally at about four-fifths the potency per milligram and dexamethasone does it with a longer duration and no salt retention. The evidence that most changes practice here is that for a multiple sclerosis relapse, high-dose oral methylprednisolone was not inferior to the intravenous route — the substitute for the infusion is the same drug swallowed. Outside the class, nothing substitutes for a high-dose glucocorticoid in an acute autoimmune flare, and for the two indications where methylprednisolone was tested hardest — head injury and acute spinal cord injury — the substitute recommended by current guidance is not giving it.',
      conventionalRx: [
        {
          name: 'Oral methylprednisolone at the same total dose',
          class: 'Same molecule, different route',
          howItCompares:
            'In the COPOUSEP trial, 1,000 mg daily for three days given orally was non-inferior to the same given intravenously for multiple sclerosis relapse: 81% against 80% improved by day 28, absolute difference 0.5% (90% CI -9.5 to 10.4). Insomnia was more frequent orally (77% against 64%).',
          typicalCost:
            'Tablets are substantially cheaper than an infusion once administration costs are counted; the molecule itself is generic in both forms',
          prosAndCons:
            'Pros: no infusion, no day unit, no cannula, same measured outcome. Cons: more insomnia, and it depends on being able to swallow a large tablet load.',
        },
        {
          name: 'Prednisolone or prednisone',
          class: 'Glucocorticoid, intermediate-acting',
          howItCompares:
            'About four-fifths of methylprednisolone’s potency per milligram, with a little more mineralocorticoid activity. For ordinary oral courses the two are near-interchangeable, and prednisolone has the larger randomised evidence base in rheumatoid arthritis and in Bell’s palsy.',
          typicalCost:
            'Generic tablets cost cents; the oral solution has a United States pharmacy acquisition cost of US$4.39 per millilitre',
          prosAndCons:
            'Pros: cheapest, most studied. Cons: more fluid retention, and no water-soluble ester allowing gram-scale intravenous administration.',
        },
        {
          name: 'Dexamethasone',
          class: 'Fluorinated glucocorticoid, long-acting',
          howItCompares:
            'Roughly five times more potent per milligram than methylprednisolone with a much longer half-life and no mineralocorticoid activity at all. It is the steroid with the strongest randomised mortality evidence in any condition, and the one used where fluid retention would be harmful.',
          typicalCost:
            'US$0.2461 per tablet at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: no salt retention, long duration, best outcome evidence in the class. Cons: harder to taper, faster accumulation of adrenal suppression.',
        },
        {
          name: 'No steroid at all (for acute traumatic brain and spinal cord injury)',
          class: 'Withholding a treatment on the basis of trial evidence',
          howItCompares:
            'CRASH randomised 10,008 adults with head injury and found more deaths on methylprednisolone at two weeks and at six months. The 2013 AANS/CNS guideline on acute spinal cord injury issued a Level I recommendation that methylprednisolone is not recommended, on the grounds that no Class I or Class II evidence supports a benefit and that harmful side effects are consistently documented.',
          typicalCost: 'No cost',
          prosAndCons:
            'Pros: avoids a demonstrated increase in mortality after head injury and a documented complication rate after spinal injury. Cons: nothing has replaced it, and the neuroprotection those trials were looking for is still an unsolved problem.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Ask what an injection contains and where it was made',
          action:
            'Before an epidural or joint steroid injection, ask whether the product is an FDA-approved manufactured preparation or a compounded one.',
          patientImpact:
            'In 2012, preservative-free methylprednisolone acetate from a single compounding pharmacy caused 749 fungal infections across 20 states, with 61 deaths and 40 strokes. The median time from injection to diagnosis was 47 days, so the harm appeared long after the procedure.',
          clinicalPrecaution:
            'This is a manufacturing failure, not a property of the molecule. The relevant law changed afterwards, and the question is still a reasonable one to ask about any compounded injectable.',
        },
        {
          name: 'Expect a "steroid flush" and insomnia after a high-dose course',
          action:
            'Plan for two or three disturbed nights after a high-dose pulse, and mention palpitations or a metallic taste rather than assuming they are abnormal.',
          patientImpact:
            'Insomnia occurred in 77% of patients given high-dose oral methylprednisolone and 64% of those given it intravenously in the COPOUSEP trial. Facial flushing and altered taste are common and self-limiting.',
          clinicalPrecaution:
            'Persistent agitation, mania or marked mood change is a different matter and is on the label for the class; it warrants a call rather than waiting it out.',
        },
        {
          name: 'Report new hip or groin pain after a high-dose course, even months later',
          action:
            'Mention deep groin, buttock or thigh pain that started weeks or months after a high-dose steroid course.',
          patientImpact:
            'Osteonecrosis of the femoral head is a recognised complication of high-dose glucocorticoid exposure and typically presents long after treatment ends, when the connection is no longer obvious to the patient.',
          clinicalPrecaution:
            'Early imaging changes the options available. This is listed among the musculoskeletal adverse reactions on the label for the class.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'C[C@H]1C[C@H]2[C@@H]3CC[C@@]([C@]3(C[C@@H]([C@@H]2[C@@]4(C1=CC(=O)C=C4)C)O)C)(C(=O)CO)O',
      chemicalFormula: 'C22H30O5',
      molecularWeight: '374.50 g/mol',
      targetReceptorAffinity:
        'Roughly five times the anti-inflammatory potency of cortisol per milligram and about 1.25 times that of prednisolone, with lower mineralocorticoid activity than prednisolone. Biological half-life 12 to 36 hours, in the intermediate-acting band with prednisolone. The 6-alpha methyl group is the only difference from prednisolone.',
      structureSource: {
        label:
          'PubChem CID 6741 (methylprednisolone) — canonical SMILES, molecular formula C22H30O5 and molecular weight 374.5 g/mol, re-checked against the PUG REST property endpoint',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/6741',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'mp-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the 6-alpha methyl group and its orientation',
          description:
            'Establish that the methyl group is present at C6 and in the alpha configuration. The 6-beta epimer has markedly lower activity, and the des-methyl compound is prednisolone — a different marketed drug at a different potency. None of the three separates on molecular weight.',
          reagentsAndBuffer:
            'Methylprednisolone USP reference standard, 1H NMR in DMSO-d6 with attention to the C6 methyl doublet, reversed-phase HPLC resolving prednisolone and the 6-beta epimer, ultraviolet detection at 243 nm',
        },
        {
          id: 'mp-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Introduce the 6-alpha methyl, then dehydrogenate ring A',
          description:
            'Methylate at C6 through the 3-enol ether or a 4,6-dien-3-one intermediate with stereochemical control, then install the 1,2-double bond by microbial delta-1-dehydrogenation as for the rest of the class. Order matters: dehydrogenating first makes the C6 position far harder to functionalise selectively.',
          dependsOnStepId: 'mp-w1',
          reagentsAndBuffer:
            'Hydrocortisone or a 6-dehydro intermediate, methyl Grignard or methanol-acid enol ether route, hydrogenation catalyst for stereochemical control at C6, Arthrobacter simplex culture for the delta-1 step',
        },
        {
          id: 'mp-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallise away from prednisolone and the 6-beta epimer',
          description:
            'Separate the target from unmethylated prednisolone and from the 6-beta epimer. This is a potency-determining separation: a batch contaminated with prednisolone assays as active steroid and delivers a lower effective potency than labelled.',
          dependsOnStepId: 'mp-w2',
          reagentsAndBuffer:
            'Fractional crystallisation from acetone-water or ethanol, preparative reversed-phase HPLC against USP related-compounds standards, 1H NMR for epimeric ratio',
        },
        {
          id: 'mp-w4',
          stepNumber: 4,
          phase: 'Conjugation',
          name: 'Esterify to the sodium succinate and to the acetate',
          description:
            'Form the 21-hemisuccinate sodium salt for intravenous use and the 21-acetate for depot injection. These two esters are the reason this molecule occupies its clinical niche: the succinate is freely water-soluble and can be pushed into a vein at gram scale, and the acetate is a poorly soluble crystal suspension that stays at the injection site for weeks. Both are prodrugs requiring esterase hydrolysis to release the parent.',
          dependsOnStepId: 'mp-w3',
          reagentsAndBuffer:
            'Succinic anhydride in pyridine followed by sodium bicarbonate neutralisation for the succinate; acetic anhydride with a base catalyst for the acetate; lyophilisation for the succinate powder, controlled crystal-size micronisation for the acetate suspension',
        },
        {
          id: 'mp-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Sterility and endotoxin testing appropriate to the route of administration',
          description:
            'A product intended for intrathecal, epidural or intra-articular delivery must be tested to the standard the route demands, not the standard the facility finds convenient. This step is on this workflow because of the 2012 outbreak: three lots of compounded preservative-free methylprednisolone acetate with visible fungus in unopened vials produced 749 infections and 61 deaths, and the failure was one of manufacturing controls rather than of chemistry.',
          dependsOnStepId: 'mp-w4',
          reagentsAndBuffer:
            'USP <71> sterility testing by membrane filtration, USP <85> bacterial endotoxin test, fungal culture on Sabouraud dextrose agar with extended incubation, PCR panel for Exserohilum and Aspergillus species, container-closure integrity testing',
        },
      ],
    },
    keyAudits: [
      {
        id: 'mp-a1',
        category: 'failed',
        title: 'CRASH: more people died on methylprednisolone after head injury',
        laymanSummary:
          'Steroids had been given after severe head injury for thirty years on the reasoning that they reduce brain swelling. A trial of just over ten thousand patients was stopped early because more of the people getting the drug were dying. The excess was still there six months later.',
        technicalDetails:
          'MRC CRASH randomised 10,008 adults with head injury and a Glasgow Coma Scale of 14 or less, within 8 hours of injury, to a 48-hour methylprednisolone infusion or placebo. Death from all causes within 2 weeks was 1,052 (21.1%) against 893 (17.9%), relative risk 1.18 (95% CI 1.09 to 1.27, P=0.0001). The increase did not differ by injury severity (P=0.22) or by time since injury (P=0.05). At 6 months, with data on 9,673 patients (96.7%), death was 1,248 (25.7%) against 1,075 (22.3%), relative risk 1.15 (95% CI 1.07 to 1.24, P=0.0001), and death or severe disability 38.1% against 36.3% (1.05, 0.99 to 1.10, P=0.079). The data monitoring committee stopped recruitment. The authors state the cause of the excess mortality is unclear.',
        evidenceSource:
          'MRC CRASH Trial Collaborators, Lancet 2004;364:1321-1328 and Lancet 2005;365:1957-1959 (ISRCTN74459797)',
        doi: '10.1016/S0140-6736(04)17188-2',
        measuredMetric:
          'All-cause mortality at 2 weeks and at 6 months, against placebo, in 10,008 randomised patients',
        auditFlag: 'verified',
      },
      {
        id: 'mp-a2',
        category: 'conclusion_shift',
        title: 'Acute spinal cord injury: a standard of care built on a subgroup, then withdrawn',
        laymanSummary:
          'For more than twenty years, anyone with a fresh spinal cord injury was given high-dose methylprednisolone. The trial behind that practice reported a benefit only in patients treated within eight hours — a slice of the trial, not the trial. In 2013 the neurosurgical guideline reversed the recommendation entirely.',
        technicalDetails:
          'NASCIS II randomised 487 patients with acute spinal cord injury to methylprednisolone, naloxone or placebo. The published benefit was confined to the subgroup treated within 8 hours of injury: at six months, motor function change scores of 16.0 against 11.2 (P=0.03), pinprick 11.4 against 6.6 (P=0.02) and touch 8.9 against 4.3 (P=0.03). Patients treated after 8 hours did not differ from placebo, and mortality and major morbidity were similar in all three groups. The 8-hour threshold was not the trial’s prespecified primary comparison, and the whole-cohort analysis did not show benefit. The 2013 AANS/CNS guideline on pharmacological therapy for acute spinal cord injury reviewed the accumulated evidence and issued a Level I recommendation that administration of methylprednisolone is not recommended, noting no Class I or Class II evidence of benefit and consistent Class I, II and III evidence of harmful side effects including death.',
        evidenceSource:
          'Bracken MB et al., N Engl J Med 1990;322:1405-1411 (NASCIS II); Hurlbert RJ et al., Neurosurgery 2013;72 Suppl 2:93-105',
        doi: '10.1227/NEU.0b013e31827765c6',
        inferredClaim:
          'That a timing-defined subgroup result in 487 patients established a standard of care — the field held that position for twenty-three years and then formally reversed it',
        auditFlag: 'retracted',
      },
      {
        id: 'mp-a3',
        category: 'failed',
        title: 'The 2012 fungal meningitis outbreak: 749 infections and 61 deaths from one pharmacy',
        laymanSummary:
          'A compounding pharmacy in Massachusetts made preservative-free methylprednisolone for spinal injections. Three batches were contaminated with fungus, visible in unopened vials. Seven hundred and forty-nine people across twenty states became infected and sixty-one died, most of them from meningitis, on average seven weeks after their injection.',
        technicalDetails:
          'Following the September 2012 recall of three lots of preservative-free methylprednisolone acetate from a single compounding pharmacy, more than 99% of 13,534 potentially exposed persons were contacted by 19 October 2012. As of 1 July 2013 there were 749 reported infections across 20 states with 61 deaths (8%). Laboratory evidence of Exserohilum rostratum was found in specimens from 153 patients (20%). Of 728 patients with additional data, 229 (31%) had meningitis with no other documented infection. Median age was 64 years, median number of implicated injections was 1, median incubation from last injection to first diagnosis was 47 days (range 0 to 249), and 40 patients (5%) had a stroke.',
        evidenceSource:
          'Smith RM et al., Multistate Fungal Infection Outbreak Response Team, N Engl J Med 2013;369:1598-1609',
        doi: '10.1056/NEJMoa1213978',
        measuredMetric:
          'Confirmed fungal infections, deaths and strokes attributable to contaminated lots, in a public health outbreak investigation',
        auditFlag: 'caution',
      },
      {
        id: 'mp-a4',
        category: 'measured',
        title: 'Multiple sclerosis relapse: the tablet matched the drip',
        laymanSummary:
          'High-dose steroid for a multiple sclerosis relapse had always meant three days attached to a drip. A blinded French trial gave the same total amount by mouth instead. Eight in ten improved either way, and the difference was half a percentage point.',
        technicalDetails:
          'COPOUSEP was a multicentre, double-blind, randomised non-inferiority trial at 13 French multiple sclerosis centres. 199 patients aged 18 to 55 with a relapse in the previous 15 days were assigned to oral or intravenous methylprednisolone 1,000 mg once daily for three days, with saline and placebo capsules maintaining blinding in both directions. In the per-protocol population, 66 of 82 (81%) in the oral group and 72 of 90 (80%) in the intravenous group met the primary endpoint of improvement by day 28 without retreatment, absolute difference 0.5% (90% CI -9.5 to 10.4), inside the prespecified 15% non-inferiority margin. Adverse event rates were similar; insomnia was more frequent orally (77% against 64%).',
        evidenceSource: 'Le Page E et al., Lancet 2015;386:974-981 (COPOUSEP, NCT00984984)',
        doi: '10.1016/S0140-6736(15)61137-0',
        measuredMetric:
          'Proportion improving by day 28 without corticosteroid retreatment, oral against intravenous, non-inferiority',
        auditFlag: 'verified',
      },
      {
        id: 'mp-a5',
        category: 'inferred',
        title: 'Shortening a relapse is not the same as changing the disease',
        laymanSummary:
          'High-dose steroid speeds recovery from a multiple sclerosis attack. It has not been shown to change how much disability a person accumulates over the years, and the trials that established the practice were not designed to look.',
        technicalDetails:
          'The COPOUSEP endpoint was improvement of at least one point on the most affected Kurtzke Functional System Scale score at 28 days without retreatment — a short-term functional measure in a relapsing-remitting population. Neither that trial nor the intravenous-route trials it was benchmarked against were powered or designed to measure long-term disability accumulation, conversion to secondary progressive disease, or lesion burden years later. The claim that glucocorticoid treatment of relapses alters the long-run course of multiple sclerosis is a separate proposition from the one the trials tested, and it is the disease-modifying therapies rather than the relapse steroids that carry that evidence.',
        evidenceSource: 'Le Page E et al., Lancet 2015;386:974-981 (COPOUSEP)',
        doi: '10.1016/S0140-6736(15)61137-0',
        inferredClaim:
          'That faster recovery from a relapse translates into less disability over decades — the measured endpoint is a functional score at 28 days, and nothing in these trials speaks to the longer question',
        auditFlag: 'caution',
      },
      {
        id: 'mp-a6',
        category: 'inferred',
        title: 'The epidural route is used far more than its evidence supports',
        laymanSummary:
          'Depot methylprednisolone is injected into the space around the spinal cord for back and leg pain millions of times a year. No formulation of any steroid is approved by the FDA for that route, and the agency warned in 2014 that it can cause rare but serious neurological injury.',
        technicalDetails:
          'Methylprednisolone acetate is labelled for intramuscular, intra-articular, intralesional and soft-tissue injection. Epidural administration is not an approved route for it or for any other corticosteroid product, and the label for the acetate suspension states that it is not for intrathecal use. The label’s Warnings section carries a subsection headed "Epidural Administration" which states that serious neurologic events, some resulting in death, have been reported with epidural injection of corticosteroids — spinal cord infarction, paraplegia, quadriplegia, cortical blindness and stroke — with and without the use of fluoroscopy, and that the safety and effectiveness of epidural administration of corticosteroids have not been established and corticosteroids are not approved for this use. The practice continues at scale regardless.',
        evidenceSource:
          'United States prescribing information for methylprednisolone acetate injectable suspension (DEPO-MEDROL), Indications and Warnings sections, "Epidural Administration"',
        inferredClaim:
          'That epidural corticosteroid injection is an established use of this product — it is an unapproved route carrying an explicit label warning about spinal cord infarction, paralysis, blindness and stroke',
        auditFlag: 'contested',
      },
      {
        id: 'mp-a7',
        category: 'measured',
        title: 'The harm signal in CRASH was not explained, only measured',
        laymanSummary:
          'The trial that found methylprednisolone increasing deaths after head injury said plainly that it did not know why. That is unusual and it is honest. The excess did not track with how badly injured people were or how quickly they were treated.',
        technicalDetails:
          'In CRASH the relative increase in death did not differ by injury severity on the Glasgow Coma Scale (P=0.22) or by time from injury to randomisation (P=0.05), so the harm was not concentrated in a subgroup that could be excluded. The authors wrote that the cause of the rise in risk of death within 2 weeks is unclear. Candidate mechanisms discussed in the surrounding literature — infection, hyperglycaemia, gastrointestinal bleeding — were not established by the trial. What the trial establishes is the effect, not the mechanism, and the distinction matters because "we do not know why" is a different statement from "the effect is not real".',
        evidenceSource:
          'MRC CRASH Trial Collaborators, Lancet 2004;364:1321-1328; Edwards P et al., Lancet 2005;365:1957-1959',
        doi: '10.1016/S0140-6736(05)66552-X',
        measuredMetric:
          'Subgroup interaction tests for injury severity and time to treatment on the mortality effect',
        auditFlag: 'verified',
      },
      {
        id: 'mp-a8',
        category: 'conclusion_shift',
        title: 'From "steroids reduce brain swelling, therefore they help brain injury" to the opposite',
        laymanSummary:
          'Steroids genuinely do reduce the swelling around a brain tumour. The reasoning that they would therefore help a swollen injured brain held for three decades and was wrong: the two kinds of swelling are different, and the trial that finally tested the idea found more deaths.',
        technicalDetails:
          'Glucocorticoids reduce vasogenic oedema, which arises from a leaky blood-brain barrier around a tumour or abscess and is driven by VEGF and endothelial permeability. Traumatic brain injury produces predominantly cytotoxic oedema, which is intracellular water accumulation following energy failure, and there is no mechanism by which transcriptional suppression of inflammatory genes reverses it. The inference from one to the other was made in the 1970s, sustained by small trials and by physiological plausibility, and tested definitively only in 2004 in 10,008 patients, where it produced a relative risk of death of 1.18 at two weeks and 1.15 at six months. This is the clearest case in this batch of a mechanism-based inference surviving for decades because the trial to refute it was expensive.',
        evidenceSource:
          'MRC CRASH Trial Collaborators, Lancet 2004;364:1321-1328; DEPO-MEDROL and SOLU-MEDROL United States prescribing information, Indications section',
        doi: '10.1016/S0140-6736(04)17188-2',
        inferredClaim:
          'That the anti-oedema effect demonstrated around brain tumours transfers to traumatic brain injury — refuted at a relative risk of 1.18 for death, and the two oedema mechanisms are now understood to be different',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Two esters decide where the drug goes',
        laymanDesc:
          'The molecule itself barely dissolves in water. Attaching one chemical group makes it dissolve freely so it can be injected into a vein in large amounts; attaching a different one makes it dissolve even less, so it stays where it is put.',
        molecularDetail:
          'The 21-hemisuccinate sodium salt is freely water-soluble and is the form used for intravenous and intramuscular administration at doses up to grams. The 21-acetate is a poorly soluble crystalline suspension with a depot effect lasting one to several weeks at the injection site. Both are prodrugs: plasma and tissue esterases hydrolyse them to release free methylprednisolone.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Free drug crosses into cells everywhere it reaches',
        laymanDesc:
          'Once the ester is cleaved the drug behaves like any other steroid: it diffuses through cell membranes with no transporter and no gate.',
        molecularDetail:
          'Passive diffusion across the lipid bilayer, consistent with the logP of about 2.1 held on this record. From a depot injection this happens progressively over weeks; from an intravenous infusion it happens within minutes and at concentrations far above anything the adrenal glands could produce.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The receptor is freed and moves to the nucleus',
        laymanDesc:
          'The same step as every other steroid on this site: the drug binds a receptor held by chaperone proteins, the chaperones let go, and the receptor travels into the nucleus.',
        molecularDetail:
          'Dissociation of the HSP90-HSP70-p23-immunophilin complex on NR3C1, FKBP51 to FKBP52 exchange, dynein-mediated nuclear import. The 6-alpha methyl group raises affinity modestly over prednisolone and lowers mineralocorticoid receptor cross-reactivity.',
        iconName: 'Unlock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'At gram-scale exposure, non-genomic effects appear as well',
        laymanDesc:
          'At the very high doses used for a relapse or a rejection episode, the drug does more than change which genes are read. It also acts directly on cell membranes within minutes, faster than any gene could respond.',
        molecularDetail:
          'Above roughly 100 mg prednisolone-equivalent, non-genomic mechanisms contribute: direct physicochemical interaction with plasma and mitochondrial membranes altering cation transport, and interaction with membrane-bound glucocorticoid receptors. These act within minutes rather than the hours transcriptional effects require, and they are the usual explanation for the speed of pulse therapy. They are also less well characterised than the genomic pathway.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The inflammatory event is shortened',
        laymanDesc:
          'In a multiple sclerosis relapse or a transplant rejection episode, a short burst of very high exposure ends the attack faster than leaving it alone would.',
        molecularDetail:
          'COPOUSEP measured improvement of at least one point on the most affected Kurtzke Functional System Scale score by day 28 without retreatment in 81% of orally treated and 80% of intravenously treated patients. The endpoint is recovery from the relapse, not the long-run course of the disease.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Where the target was not inflammation, the same exposure did harm',
        laymanDesc:
          'Given after a head injury, on the theory that it would reduce brain swelling, more people died. The trial that showed it was large enough that there is no serious argument with the result.',
        molecularDetail:
          '10,008 patients randomised; death within 2 weeks 21.1% against 17.9%, relative risk 1.18 (95% CI 1.09 to 1.27, P=0.0001), sustained at 6 months at 25.7% against 22.3%. The oedema of traumatic brain injury is predominantly cytotoxic and does not respond to the mechanism that reduces vasogenic oedema around a tumour.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'MRC CRASH (ISRCTN74459797)',
        phase: 'Phase 3, international, randomised, placebo-controlled',
        sampleSize: 10008,
        primaryEndpoint: 'Death within 2 weeks of injury; death or disability at 6 months',
        endpointMet: false,
        statisticalPValue:
          'Death at 2 weeks 21.1% against 17.9%, relative risk 1.18 (95% CI 1.09 to 1.27), P=0.0001 — favouring placebo; death at 6 months 25.7% against 22.3%, RR 1.15 (1.07 to 1.24), P=0.0001',
        unreportedAdverseSignals:
          'Recruitment was stopped by the steering committee on the data monitoring committee’s recommendation. The trial reports that the cause of the excess mortality is unclear, and the effect did not differ by injury severity or time since injury, so no subgroup can be carved out to preserve the indication.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'NASCIS II (Bracken 1990)',
        phase: 'Multicentre, randomised, double-blind, placebo-controlled, three-arm',
        sampleSize: 487,
        primaryEndpoint:
          'Motor and sensory function change from admission at six weeks and six months after acute spinal cord injury',
        endpointMet: false,
        statisticalPValue:
          'Benefit reported only in the subgroup treated within 8 hours: motor change 16.0 against 11.2 (P=0.03), pinprick 11.4 against 6.6 (P=0.02), touch 8.9 against 4.3 (P=0.03). Patients treated after 8 hours did not differ from placebo.',
        unreportedAdverseSignals:
          'The 8-hour threshold was not the prespecified primary comparison and the whole-cohort analysis did not show benefit. The 2013 AANS/CNS guideline subsequently issued a Level I recommendation against administering methylprednisolone in acute spinal cord injury.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'COPOUSEP (NCT00984984)',
        phase: 'Phase 3, multicentre, randomised, double-blind, non-inferiority',
        sampleSize: 199,
        primaryEndpoint:
          'Improvement of at least one point on the most affected Kurtzke Functional System Scale score by day 28 without corticosteroid retreatment',
        endpointMet: true,
        statisticalPValue:
          '81% oral against 80% intravenous; absolute difference 0.5% (90% CI -9.5 to 10.4), within the prespecified 15% non-inferiority margin',
        unreportedAdverseSignals:
          'Insomnia was more frequent in the oral group (77% against 64%). The per-protocol population was 172 of 199 randomised, which is the appropriate analysis for non-inferiority but discards 14% of participants.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Death within 2 weeks of head injury 21.1% against 17.9% on placebo in 10,008 patients, relative risk 1.18 (95% CI 1.09 to 1.27), P=0.0001',
        'Death at 6 months 25.7% against 22.3%, relative risk 1.15 (95% CI 1.07 to 1.24), in 9,673 followed patients',
        'Multiple sclerosis relapse improvement by day 28: 81% oral against 80% intravenous, difference 0.5% (90% CI -9.5 to 10.4)',
        '749 fungal infections, 61 deaths and 40 strokes across 20 states from three contaminated compounded lots, median incubation 47 days',
        'Insomnia in 77% of orally and 64% of intravenously treated patients in a blinded trial',
      ],
      unsupportedInferences: [
        'That reducing vasogenic oedema around a tumour means reducing the cytotoxic oedema of traumatic brain injury',
        'That a subgroup defined by treatment within 8 hours in 487 patients established a standard of care in spinal cord injury',
        'That shortening a multiple sclerosis relapse changes long-term disability accumulation — nothing in these trials measured it',
        'That epidural injection is an established use, when no corticosteroid product is approved for that route and the label warns of paralysis, blindness and stroke by it',
      ],
      whatFailedInitially: [
        'CRASH was stopped early because methylprednisolone increased death after head injury, and the excess persisted at six months',
        'The spinal cord injury indication was formally reversed by a Level I guideline recommendation in 2013 after twenty-three years of use',
        'The 2012 compounding contamination produced the largest healthcare-associated outbreak in modern United States history and led to new federal legislation',
        'CRASH could offer no mechanism for the harm it measured, and the effect did not concentrate in any subgroup that could be excluded',
      ],
      realWorldOutcome: [
        'Still the standard high-dose intravenous glucocorticoid for multiple sclerosis relapses and acute transplant rejection',
        'The COPOUSEP result moved relapse treatment towards tablets, removing infusion visits without changing the measured outcome',
        'The Drug Quality and Security Act of 2013 was passed in direct response to the outbreak traced to this molecule',
        'A median United States pharmacy acquisition cost of US$2.87 per unit across 46 listed generic products',
      ],
    },
    deliverySystem: {
      type:
        'Oral tablet including dose packs, sodium succinate powder for intravenous and intramuscular injection, and acetate suspension for intramuscular, intra-articular, intralesional and soft-tissue depot injection',
      description:
        'The molecule is poorly water-soluble, and the two esters solve opposite problems. The succinate dissolves freely and allows gram-scale intravenous administration over minutes. The acetate is a micronised crystal suspension that dissolves slowly and acts as a local depot for one to several weeks. The acetate suspension is explicitly not for intrathecal use, and no corticosteroid product is approved for epidural administration.',
      safetyProfile:
        'Full class profile: adrenal suppression, infection risk and masking, hyperglycaemia, hypertension, osteoporosis and osteonecrosis, myopathy, cataract and glaucoma, peptic ulceration with NSAIDs, and psychiatric disturbance. Specific to this molecule: a randomised trial in 10,008 patients found increased mortality when given after head injury; the 2013 AANS/CNS guideline recommends against its use in acute spinal cord injury; the label warns that epidural injection of corticosteroids has caused serious neurologic events including spinal cord infarction, paraplegia, quadriplegia, cortical blindness and stroke, some resulting in death, and that corticosteroids are not approved for that route; and depot injections carry the infection risk of any injectable, which in 2012 produced 749 fungal infections and 61 deaths from contaminated compounded product.',
    },
    commonQuestions: [
      {
        q: 'Why does this drug have a trial showing it killed people?',
        a: 'Because it was given for thirty years on a mechanism argument that nobody had tested at scale. Steroids reduce the swelling around a brain tumour, so it was assumed they would reduce the swelling of an injured brain. CRASH randomised 10,008 adults with head injury and found death within two weeks in 21.1% on methylprednisolone against 17.9% on placebo, relative risk 1.18, and the excess was still there at six months. Recruitment was stopped early. The two kinds of brain swelling turn out to be different: a tumour leaks fluid out of blood vessels, which steroids act on, while an injured brain accumulates water inside its own cells, which they do not. The trial did not identify why the deaths happened, and said so.',
        auditNote:
          'This is the clearest demonstration on this site that a plausible mechanism is not evidence of benefit. Nothing about the pharmacology was wrong; the inference from one kind of oedema to another was.',
      },
      {
        q: 'Is it still given for spinal cord injury?',
        a: 'Not as a standard of care, and the change is documented rather than informal. NASCIS II in 1990 reported improved motor and sensory scores at six months, but only in patients treated within eight hours of injury — a subgroup, not the trial’s primary comparison, and patients treated later did not differ from placebo. That eight-hour window became practice worldwide. In 2013 the American Association of Neurological Surgeons and Congress of Neurological Surgeons guideline issued a Level I recommendation that methylprednisolone is not recommended in acute spinal cord injury, on the grounds that no Class I or Class II evidence supports a benefit and that harmful side effects including death are consistently documented. Practice varies, and the guideline position is unambiguous.',
      },
      {
        q: 'Do I need to be on a drip for a multiple sclerosis relapse?',
        a: 'The evidence says no. COPOUSEP randomised 199 patients with a relapse to 1,000 mg of methylprednisolone daily for three days, given orally or intravenously, with placebo capsules and saline maintaining the blind in both directions. Eighty-one percent of the oral group and 80% of the intravenous group had improved by day 28 without needing retreatment, an absolute difference of half a percentage point. Insomnia was more common on the tablets. The practical consequence is that a relapse can be treated at home rather than in a day unit, which is the whole reason the trial was run.',
      },
      {
        q: 'What happened in the 2012 meningitis outbreak?',
        a: 'A compounding pharmacy in Massachusetts was producing preservative-free methylprednisolone acetate in bulk for spinal injections, outside the manufacturing standards that apply to an approved product. Three lots were contaminated with fungus — visible in unopened vials on later examination. More than 13,500 people had been exposed. As of July 2013 there were 749 reported infections in 20 states, 61 deaths, 229 cases of meningitis with no other documented infection, and 40 strokes. The median time from the last injection to diagnosis was 47 days, which is why the outbreak was slow to be recognised. Congress passed the Drug Quality and Security Act the following year. Nothing about this was a property of methylprednisolone itself.',
      },
      {
        q: 'Are epidural steroid injections approved?',
        a: 'No corticosteroid product is FDA-approved for epidural injection, including this one. The methylprednisolone acetate label covers intramuscular, intra-articular, intralesional and soft-tissue routes, and states the suspension is not for intrathecal use. The label’s Warnings section states that serious neurologic events, some resulting in death, have been reported with epidural injection of corticosteroids — spinal cord infarction, paraplegia, quadriplegia, cortical blindness and stroke — with and without fluoroscopy, and that safety and effectiveness by that route have not been established. The procedure is nevertheless performed at very large scale. That combination — widespread use, no approved product, an explicit label warning — is the audit finding, not a recommendation either way about an individual procedure.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'MRC CRASH Trial Collaborators. Effect of intravenous corticosteroids on death within 14 days in 10008 adults with clinically significant head injury. Lancet 2004;364:1321-1328',
        identifier: '10.1016/S0140-6736(04)17188-2',
        kind: 'doi',
      },
      {
        label:
          'Edwards P et al. Final results of MRC CRASH, a randomised placebo-controlled trial of intravenous corticosteroid in adults with head injury — outcomes at 6 months. Lancet 2005;365:1957-1959',
        identifier: '10.1016/S0140-6736(05)66552-X',
        kind: 'doi',
      },
      {
        label:
          'Bracken MB et al. A randomized, controlled trial of methylprednisolone or naloxone in the treatment of acute spinal-cord injury (NASCIS II). N Engl J Med 1990;322:1405-1411',
        identifier: '10.1056/NEJM199005173222001',
        kind: 'doi',
      },
      {
        label:
          'Hurlbert RJ et al. Pharmacological therapy for acute spinal cord injury. Neurosurgery 2013;72 Suppl 2:93-105',
        identifier: '10.1227/NEU.0b013e31827765c6',
        kind: 'doi',
      },
      {
        label:
          'Smith RM et al. Fungal infections associated with contaminated methylprednisolone injections. N Engl J Med 2013;369:1598-1609',
        identifier: '10.1056/NEJMoa1213978',
        kind: 'doi',
      },
      {
        label:
          'Le Page E et al. Oral versus intravenous high-dose methylprednisolone for treatment of relapses in patients with multiple sclerosis (COPOUSEP). Lancet 2015;386:974-981',
        identifier: '10.1016/S0140-6736(15)61137-0',
        kind: 'doi',
      },
      {
        label: 'COPOUSEP: oral versus intravenous methylprednisolone for multiple sclerosis relapse',
        identifier: 'NCT00984984',
        kind: 'nct',
      },
      {
        label:
          'Drugs@FDA: SOLU-MEDROL (methylprednisolone sodium succinate) for injection, NDA 011856, Pharmacia and Upjohn — label and approval history',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=011856',
        kind: 'regulatory',
      },
      {
        label:
          'DailyMed: DEPO-MEDROL (methylprednisolone acetate) injectable suspension, Pharmacia and Upjohn — Warnings, "Epidural Administration"',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=823b0010-2b57-4e76-b5ac-4a8c2963438f',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 6741 — methylprednisolone structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/6741',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
]
