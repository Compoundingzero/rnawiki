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
        evidenceSource: 'Sullivan FM et al., N Engl J Med 2007;357:1598-1607 (ISRCTN71548196)',
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
        measuredMetric:
          'All-cause mortality at 28 days, 90 days and 1 year, against matched placebo',
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
        measuredMetric:
          'Time to first relapse over a minimum 24 months, extended against standard course',
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
        title:
          'The "steroid-equivalent dose" table is a potency conversion, not an outcome equivalence',
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
      type: 'Oral solution, oral tablet, orally disintegrating tablet, ophthalmic suspension and emulsion, and injectable sodium phosphate and acetate salts',
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
        title:
          'RECOVERY: 28-day mortality fell from 41.4% to 29.3% in ventilated COVID-19 patients',
        laymanSummary:
          'This is the strongest randomised result any drug in this batch has. Patients in hospital with COVID-19 were randomly given dexamethasone or the usual care. Among those on a ventilator, roughly three in ten on the drug died against four in ten without it.',
        technicalDetails:
          'RECOVERY assigned 2,104 patients to dexamethasone 6 mg once daily for up to 10 days and 4,321 to usual care alone. Death within 28 days occurred in 482 (22.9%) against 1,110 (25.7%), age-adjusted rate ratio 0.83 (95% CI 0.75 to 0.93, P<0.001). The effect varied sharply with respiratory support at randomisation: 29.3% against 41.4% on invasive mechanical ventilation (rate ratio 0.64, 95% CI 0.51 to 0.81) and 23.3% against 26.2% on oxygen without ventilation (0.82, 0.72 to 0.94).',
        evidenceSource:
          'RECOVERY Collaborative Group, N Engl J Med 2021;384:693-704 (NCT04381936, ISRCTN50189673)',
        doi: '10.1056/NEJMoa2021436',
        measuredMetric:
          'All-cause mortality at 28 days, against usual care, in an open-label randomised comparison',
        auditFlag: 'verified',
      },
      {
        id: 'dex-a2',
        category: 'failed',
        title:
          'The same trial found no benefit, and a point estimate favouring harm, without oxygen',
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
        title:
          'ACT: widening antenatal use in the community raised neonatal deaths and maternal infection',
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
        measuredMetric:
          'Return to a medical care provider for croup within seven days, against placebo',
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
      type: 'Oral tablet including a 20 mg high-strength presentation, oral solution, sodium phosphate solution for intravenous, intramuscular, intra-articular and soft-tissue injection, ophthalmic suspension, and a biodegradable intravitreal implant',
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
          typicalCost: 'Generic tablets cost cents at United States pharmacy acquisition cost',
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
        title:
          'Faster shock reversal is not the same as a life saved, and this is where they diverge',
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
        phase:
          'Phase 3, multicentre, randomised, double-blind, 2-by-2 factorial reduced to two groups',
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
      type: 'Oral tablet, taste-masked oral granules for infants and children, sodium succinate powder for intravenous and intramuscular injection, sodium phosphate injection, rectal foam and enema, and topical creams and ointments including over-the-counter 1%',
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
        label:
          'ADRENAL: adjunctive corticosteroid treatment in critically ill patients with septic shock',
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
        title:
          'The 2012 fungal meningitis outbreak: 749 infections and 61 deaths from one pharmacy',
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
        title:
          'From "steroids reduce brain swelling, therefore they help brain injury" to the opposite',
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
      type: 'Oral tablet including dose packs, sodium succinate powder for intravenous and intramuscular injection, and acetate suspension for intramuscular, intra-articular, intralesional and soft-tissue depot injection',
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
        label:
          'COPOUSEP: oral versus intravenous methylprednisolone for multiple sclerosis relapse',
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

  // ---------------------------------------------------------------------------------------------
  // 5. Azathioprine — a 1962 prodrug that made organ transplantation possible, carries a boxed
  //    warning for lymphoma, and lost to placebo in newly diagnosed Crohn's disease.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'azathioprine',
    name: 'Azathioprine',
    tradeName: 'Imuran / Azasan',
    sponsor:
      'Discovered at Burroughs Wellcome by Gertrude Elion and George Hitchings, whose work on purine antimetabolites won the 1988 Nobel Prize in Physiology or Medicine. IMURAN is now held under NDA 016324; the molecule has been generic for decades.',
    targetGene:
      'IMPDH1 / IMPDH2 (through the active metabolite), with TPMT and NUDT15 governing who tolerates it',
    targetProtein:
      'De novo purine synthesis enzymes, reached through the thioguanine nucleotides formed from 6-mercaptopurine. The clinically decisive proteins are the two that inactivate it: thiopurine S-methyltransferase (TPMT) and the nucleotide diphosphatase NUDT15.',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1968,
    indication:
      'Adjunct for the prevention of rejection in renal homotransplantation, and management of active rheumatoid arthritis to reduce signs and symptoms in patients who have not responded adequately to rest, aspirin or other non-steroidal anti-inflammatory drugs',
    patientFriendlyIndication:
      'Stopping the immune system rejecting a transplanted kidney, and severe rheumatoid arthritis that has not responded to other treatment',
    anatomicalSite:
      'Dividing lymphocytes. The drug works because T and B cells depend almost entirely on de novo purine synthesis, while most other tissues can use the salvage pathway instead.',
    conditionContext: {
      conditionExplainer:
        'A transplanted organ carries proteins the recipient’s immune system has never seen and treats as foreign. Lymphocytes must divide rapidly to mount that attack, and dividing cells need a supply of purines to build DNA.',
      whyItMatters:
        'Azathioprine was the drug that made organ transplantation something other than an experiment. Between 1962 and the arrival of cyclosporine in 1983 it was, with steroids, essentially the whole of transplant immunosuppression. It is still widely used, and it carries a boxed warning for malignancy that the drugs which replaced it also carry.',
      whoTakesThis:
        'Kidney transplant recipients, people with rheumatoid arthritis unresponsive to other treatment, and — off the licensed indication but at very large scale — people with inflammatory bowel disease, autoimmune hepatitis, myasthenia gravis, vasculitis and lupus.',
      clinicalGoals:
        'Suppress lymphocyte proliferation enough to prevent rejection or control autoimmunity, without suppressing the bone marrow, and without the cumulative cancer risk outweighing the benefit. Whether a given patient can achieve that is partly decided by two genes before the first tablet.',
    },
    oneSentenceVerdict:
      'A purine antimetabolite prodrug that starves dividing lymphocytes of the building blocks for DNA — it made kidney transplantation survivable in the 1960s and still prevents rejection, and it failed to beat placebo for sustained corticosteroid-free remission in newly diagnosed Crohn’s disease (44.1% against 36.5%, difference 7.6%, 95% CI -9.2 to 24.4, P=0.48) while carrying a boxed warning for lymphoma and a measured hazard ratio of 5.28 for lymphoproliferative disorder in 19,486 followed patients.',
    laymanHowItWorks:
      'Azathioprine is swallowed as an inert molecule and broken apart in the body into 6-mercaptopurine, which cells then convert into counterfeit versions of the building blocks used to make DNA. Immune cells are hit hardest because when they are activated they must divide fast, and unlike most cells in the body they cannot recycle old building blocks — they have to make new ones. Starving that supply stops the immune response before it can be mounted. Two enzymes decide how much of the counterfeit accumulates in any given person, and the genes for them vary enough that some people accumulate a dangerous amount at an ordinary dose.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 68,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1249 per tablet at United States pharmacy acquisition cost (CMS NADAC, generic, median across 14 listed products, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Synthesised at Burroughs Wellcome in 1957 and long out of patent, with generic tablets at about 12 cents each. Azathioprine appears on the WHO Model List of Essential Medicines. The cost that matters here is not the tablet but the test: TPMT and NUDT15 genotyping or phenotyping before starting is recommended by the label, and access to that testing rather than to the drug is what varies between health systems.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'In transplantation azathioprine has largely been displaced by mycophenolate, which acts on the same pathway more selectively; in inflammatory bowel disease and rheumatology the alternatives are methotrexate, mycophenolate, and — where the evidence is strongest — the biologics. The comparison that matters most is SONIC, where azathioprine alone put 30.0% of Crohn’s patients into corticosteroid-free remission at 26 weeks against 44.4% for infliximab alone and 56.8% for the two together. Nothing sold as a food or supplement substitutes for an immunosuppressant, and stopping one to try an alternative risks rejection or an uncontrolled flare.',
      conventionalRx: [
        {
          name: 'Mycophenolate mofetil or mycophenolic acid',
          class: 'Inosine monophosphate dehydrogenase inhibitor',
          howItCompares:
            'Blocks the same de novo purine pathway one step further along, and inhibits the type II isoform of the enzyme that lymphocytes preferentially express, so it is more selective for lymphocytes than azathioprine is. It replaced azathioprine as the standard antimetabolite in kidney transplantation in the 1990s. It is strongly teratogenic and carries a pregnancy risk-management programme that azathioprine does not.',
          typicalCost:
            'US$0.2265 per unit for mycophenolic acid and US$0.2698 for mycophenolate mofetil at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: more lymphocyte-selective, better rejection outcomes in the transplant trials that displaced azathioprine. Cons: gastrointestinal intolerance, and an embryo-fetal toxicity profile severe enough to require a REMS programme.',
        },
        {
          name: 'Methotrexate',
          class: 'Dihydrofolate reductase inhibitor and antifolate',
          howItCompares:
            'The first-line conventional disease-modifying drug in rheumatoid arthritis, with a far larger randomised evidence base in that disease than azathioprine has. It is also used in Crohn’s disease. It is teratogenic and requires the same kind of blood monitoring.',
          typicalCost:
            'Generic; among the cheapest disease-modifying antirheumatic drugs available',
          prosAndCons:
            'Pros: the reference DMARD in rheumatoid arthritis, weekly rather than daily. Cons: teratogenic, hepatotoxic, and interacts badly with alcohol.',
        },
        {
          name: 'Infliximab and other anti-TNF biologics',
          class: 'Monoclonal antibodies against tumour necrosis factor alpha',
          howItCompares:
            'In SONIC, a blinded trial in 508 patients with moderate-to-severe Crohn’s disease who had never had immunosuppressive or biologic therapy, corticosteroid-free clinical remission at week 26 was 30.0% on azathioprine alone, 44.4% on infliximab alone (P=0.006 against combination) and 56.8% on the two combined (P<0.001 against azathioprine). Mucosal healing was 16.5%, 30.1% and 43.9% respectively.',
          typicalCost:
            'Substantially more expensive than azathioprine even after biosimilar entry; administered by infusion or injection',
          prosAndCons:
            'Pros: markedly better remission and mucosal healing in Crohn’s disease. Cons: cost, infusion burden, and serious infection rates in SONIC were similar across all three arms at 3.9% to 5.6%.',
        },
        {
          name: 'Tacrolimus-based regimens without an antimetabolite',
          class: 'Calcineurin inhibitor',
          howItCompares:
            'A different mechanism entirely — blocking the signal that activates T cells rather than starving them of DNA precursors. In practice the two are used together rather than as alternatives, because their toxicities do not overlap: calcineurin inhibitors damage the kidney, antimetabolites damage the marrow.',
          typicalCost:
            'US$0.6591 per unit at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: no myelosuppression, no thiopurine pharmacogenetics. Cons: nephrotoxicity, new-onset diabetes, narrow therapeutic window requiring blood level monitoring.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Ask whether TPMT and NUDT15 have been checked before the first tablet',
          action:
            'Confirm that thiopurine methyltransferase and NUDT15 status has been tested, as the label directs, before treatment starts.',
          patientImpact:
            'About 1 in 300 people of European or African ancestry carry two loss-of-function TPMT alleles and have essentially no enzyme activity; among people of East Asian ancestry, 2% carry two loss-of-function NUDT15 alleles and about 21% carry one. In those people an ordinary dose accumulates toxic thioguanine nucleotides and can destroy the bone marrow.',
          clinicalPrecaution:
            'The label states that patients with TPMT or NUDT15 deficiency require alternative therapy or dose modification. This is a description of a labelled testing requirement, not dosing guidance.',
        },
        {
          name: 'Never take allopurinol or febuxostat alongside it without the prescriber knowing',
          action:
            'Tell whoever prescribes a gout drug that you are taking azathioprine, and tell the azathioprine prescriber if a gout drug is added.',
          patientImpact:
            'Xanthine oxidase is one of the two routes that dispose of the active metabolite. Blocking it with allopurinol or febuxostat causes the metabolite to accumulate, and the interaction has caused fatal bone marrow failure.',
          clinicalPrecaution:
            'The label addresses this interaction explicitly. The combination is sometimes used deliberately under specialist supervision with a reduced thiopurine dose, which is precisely why it must never happen by accident.',
        },
        {
          name: 'Cover up in the sun and get skin checks',
          action:
            'Use sun protection routinely and have new or changing skin lesions looked at rather than watched.',
          patientImpact:
            'Thiopurines sensitise skin to ultraviolet A and the associated non-melanoma skin cancer risk is one of the best-documented harms of long-term use. The boxed warning on the label covers malignancy generally, including post-transplant lymphoma and hepatosplenic T-cell lymphoma.',
          clinicalPrecaution:
            'The risk relates to ongoing exposure and accumulates with duration, which is one of the arguments for periodically reviewing whether the drug is still needed.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CN1C=NC(=C1SC2=NC=NC3=C2NC=N3)[N+](=O)[O-]',
      chemicalFormula: 'C9H7N7O2S',
      molecularWeight: '277.27 g/mol',
      targetReceptorAffinity:
        'Azathioprine binds nothing. It is a nitroimidazolyl derivative of 6-mercaptopurine designed to survive the gut and release 6-MP after non-enzymatic attack by glutathione and other thiols. The active species are the 6-thioguanine nucleotides formed several steps later, which are incorporated into DNA and RNA and inhibit de novo purine synthesis; their intracellular concentration, not any binding affinity, is what determines both effect and toxicity.',
      structureSource: {
        label:
          'PubChem CID 2265 (azathioprine) — canonical SMILES, molecular formula C9H7N7O2S and molecular weight 277.27 g/mol, re-checked against the PUG REST property endpoint',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2265',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'aza-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the nitroimidazole carrier and its thioether linkage',
          description:
            'Verify that the 1-methyl-4-nitroimidazol-5-yl group is attached to the purine sulphur. That linkage is the entire design: it protects 6-mercaptopurine from first-pass metabolism and is cleaved by thiols in vivo. Free 6-mercaptopurine as an impurity is a different marketed drug with different kinetics.',
          reagentsAndBuffer:
            'Azathioprine USP reference standard, 1H and 13C NMR in DMSO-d6, reversed-phase HPLC resolving free 6-mercaptopurine, ultraviolet detection at 280 nm',
        },
        {
          id: 'aza-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Nucleophilic aromatic substitution of 6-mercaptopurine onto the nitroimidazole',
          description:
            'Couple the thiolate of 6-mercaptopurine to 5-chloro-1-methyl-4-nitroimidazole. The nitro group activates the ring for substitution and later makes the thioether labile to glutathione. This is a single-step coupling and is why azathioprine is one of the cheapest immunosuppressants in existence.',
          dependsOnStepId: 'aza-w1',
          reagentsAndBuffer:
            '6-mercaptopurine monohydrate, 5-chloro-1-methyl-4-nitroimidazole, sodium hydroxide or sodium carbonate base, aqueous dimethylformamide or ethanol, controlled pH to avoid purine ring hydrolysis',
        },
        {
          id: 'aza-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Remove residual 6-mercaptopurine and the hydrolysed imidazole',
          description:
            'Recrystallise away from unreacted 6-mercaptopurine and from the hydroxy-imidazole formed by hydrolysis. Free 6-mercaptopurine matters as an impurity because it bypasses the intended slow release and delivers a bolus of active drug.',
          dependsOnStepId: 'aza-w2',
          reagentsAndBuffer:
            'Recrystallisation from aqueous dimethylformamide or acetone-water, reversed-phase HPLC against USP related-compounds standards, limit test for 6-mercaptopurine',
        },
        {
          id: 'aza-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Thiol-mediated release and thioguanine nucleotide accumulation in lymphocytes',
          description:
            'Incubate with activated primary human lymphocytes and measure intracellular 6-thioguanine nucleotide accumulation. The assay must be run in cells with known TPMT and NUDT15 genotype, because those two enzymes set the accumulation rate and a cell line with normal activity will not predict what happens in a deficient patient.',
          dependsOnStepId: 'aza-w3',
          reagentsAndBuffer:
            'Phytohaemagglutinin-activated peripheral blood mononuclear cells, RPMI-1640 with 10% fetal bovine serum, reduced glutathione to model thiolytic release, LC-MS/MS quantification of 6-TGN and 6-methylmercaptopurine nucleotides, TPMT and NUDT15 genotyping of each donor',
        },
        {
          id: 'aza-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Lymphocyte proliferation inhibition with a salvage-pathway control',
          description:
            'Measure inhibition of activated lymphocyte proliferation, and repeat it with hypoxanthine supplied in the medium. The selectivity of this whole drug class rests on lymphocytes lacking an effective salvage pathway; if adding hypoxanthine rescues proliferation, the assay is measuring de novo purine blockade and not general cytotoxicity.',
          dependsOnStepId: 'aza-w4',
          reagentsAndBuffer:
            'CFSE dilution or tritiated thymidine incorporation in activated lymphocytes, hypoxanthine-supplemented and unsupplemented parallel arms, mycophenolic acid as a mechanistic comparator, allopurinol arm to demonstrate the xanthine oxidase interaction',
        },
      ],
    },
    keyAudits: [
      {
        id: 'aza-a1',
        category: 'failed',
        title: 'AZTEC: early azathioprine did not beat placebo in newly diagnosed Crohn’s disease',
        laymanSummary:
          'The reasoning was that starting an immunosuppressant early, before damage accumulates, would change the course of Crohn’s disease. A blinded trial gave azathioprine or placebo to adults diagnosed within the previous eight weeks. After a year and a half, the two groups were not meaningfully different, and more people stopped the drug because of side effects.',
        technicalDetails:
          'AZTEC randomised 131 adults diagnosed with Crohn’s disease within the previous 8 weeks at 31 Spanish hospitals to azathioprine 2.5 mg/kg/day (n=68) or placebo (n=63), with corticosteroids permitted but no other concomitant medication. After 76 weeks, sustained corticosteroid-free remission was achieved by 30 (44.1%) against 23 (36.5%), a difference of 7.6% (95% CI -9.2 to 24.4, P=0.48). Relapse rates using a Crohn’s Disease Activity Index threshold of 175 and corticosteroid requirements were similar. A post hoc analysis using a threshold of 220 did favour azathioprine (11.8% against 30.2%, P=0.01). Serious adverse events occurred in 20.6% against 11.1% (P=0.16), and discontinuation for adverse events in 20.6% against 6.35% (P=0.02).',
        evidenceSource: 'Panés J et al., AZTEC Study Group, Gastroenterology 2013;145:766-774',
        doi: '10.1053/j.gastro.2013.06.009',
        measuredMetric: 'Sustained corticosteroid-free remission at 76 weeks, against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'aza-a2',
        category: 'measured',
        title: 'SONIC: azathioprine alone was the weakest of the three arms',
        laymanSummary:
          'Five hundred and eight people with moderate to severe Crohn’s disease who had never had either drug were randomly given azathioprine, infliximab, or both. Three in ten were in remission off steroids at six months on azathioprine, four and a half in ten on infliximab, and nearly six in ten on the combination.',
        technicalDetails:
          'SONIC randomised 508 immunosuppressive-naive and biologic-naive adults with moderate-to-severe Crohn’s disease. Corticosteroid-free clinical remission at week 26 was 51 of 170 (30.0%) on azathioprine 2.5 mg/kg/day alone, 75 of 169 (44.4%) on infliximab alone, and 96 of 169 (56.8%) on the combination — P<0.001 for combination against azathioprine and P=0.006 for infliximab against combination. Mucosal healing at week 26 was 18 of 109 (16.5%), 28 of 93 (30.1%) and 47 of 107 (43.9%) respectively. Serious infections were 5.6%, 4.9% and 3.9% — no worse on combination therapy.',
        evidenceSource: 'Colombel JF et al., N Engl J Med 2010;362:1383-1395 (SONIC, NCT00094458)',
        doi: '10.1056/NEJMoa0904492',
        measuredMetric:
          'Corticosteroid-free clinical remission and mucosal healing at week 26, three-arm randomised comparison',
        auditFlag: 'verified',
      },
      {
        id: 'aza-a3',
        category: 'measured',
        title: 'CESAME: a fivefold hazard for lymphoproliferative disorder on current thiopurine',
        laymanSummary:
          'A French cohort followed nearly twenty thousand people with inflammatory bowel disease. Those currently taking a thiopurine developed lymphoma at about five times the rate of those who never had. Those who had stopped were back near baseline. The absolute numbers are small — about nine cases per ten thousand patient-years — and the ratio is large.',
        technicalDetails:
          'A prospective nationwide French observational cohort enrolled 19,486 patients with inflammatory bowel disease reported by 680 gastroenterologists, with a median follow-up of 35 months. At baseline 5,867 (30.1%) were receiving thiopurines, 2,809 (14.4%) had discontinued and 10,810 (55.5%) had never received them. Twenty-three lymphoproliferative disorders were diagnosed. Incidence was 0.90 per 1,000 patient-years (95% CI 0.50 to 1.49) in current users, 0.20 (0.02 to 0.72) in past users and 0.26 (0.10 to 0.57) in never-users (P=0.0054). The multivariate-adjusted hazard ratio for current against never use was 5.28 (95% CI 2.01 to 13.9, P=0.0007). Most cases matched the pathological range of post-transplant lymphoproliferative disease, consistent with an Epstein-Barr-driven mechanism.',
        evidenceSource: 'Beaugerie L et al., CESAME Study Group, Lancet 2009;374:1617-1625',
        doi: '10.1016/S0140-6736(09)61302-7',
        measuredMetric:
          'Incidence of lymphoproliferative disorder per 1,000 patient-years by thiopurine exposure status, with multivariate adjustment',
        auditFlag: 'verified',
      },
      {
        id: 'aza-a4',
        category: 'failed',
        title: 'PANTHER-IPF: prednisone with azathioprine killed patients with pulmonary fibrosis',
        laymanSummary:
          'A steroid plus azathioprine plus an antioxidant had been standard treatment for idiopathic pulmonary fibrosis for years without ever being tested against placebo. When it finally was, the trial stopped that arm early: eight deaths against one, and three times as many hospitalisations.',
        technicalDetails:
          'PANTHER-IPF randomised patients with idiopathic pulmonary fibrosis and mild-to-moderate lung function impairment to prednisone plus azathioprine plus N-acetylcysteine, to N-acetylcysteine alone, or to placebo. At a planned interim analysis with about half the data collected — 77 patients in the combination group and 78 in the placebo group — the combination arm showed an increased rate of death (8 against 1, P=0.01) and hospitalisation (23 against 7, P<0.001), with no evidence of physiological or clinical benefit. The independent data and safety monitoring board recommended termination of the combination arm at a mean follow-up of 32 weeks.',
        evidenceSource:
          'Idiopathic Pulmonary Fibrosis Clinical Research Network, Raghu G et al., N Engl J Med 2012;366:1968-1977 (PANTHER-IPF, NCT00650091)',
        doi: '10.1056/NEJMoa1113354',
        measuredMetric:
          'Death and hospitalisation at planned interim analysis, combination therapy against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'aza-a5',
        category: 'measured',
        title: 'Two genes decide who can take it, and the label says so',
        laymanSummary:
          'A small proportion of people inherit two broken copies of one of the enzymes that disposes of this drug. In them, a normal dose accumulates until it destroys the bone marrow. Which gene matters depends on ancestry, and the label carries the numbers.',
        technicalDetails:
          'Azathioprine releases 6-mercaptopurine, which is inactivated by two routes: thiol methylation by thiopurine S-methyltransferase and oxidation by xanthine oxidase, while NUDT15 converts active thioguanine nucleotides to inactive monophosphates. The label states that approximately 0.3% (1 in 300) of patients of European or African ancestry carry two loss-of-function TPMT alleles with little or no activity, and approximately 10% carry one; the TPMT*2, *3A and *3C alleles account for about 95% of reduced-activity individuals. NUDT15 deficiency is found in under 1% of patients of European or African ancestry, but among patients of East Asian ancestry 2% carry two loss-of-function alleles and approximately 21% carry one, most commonly the p.R139C variant. The label states that patients with TPMT or NUDT15 deficiency require alternative therapy or dose modification because of the risk of severe myelosuppression.',
        evidenceSource:
          'IMURAN (azathioprine) tablets United States prescribing information, Clinical Pharmacology and Warnings sections (NDA 016324)',
        measuredMetric:
          'Population frequencies of loss-of-function TPMT and NUDT15 alleles, and their association with severe myelosuppression, as stated on the label',
        auditFlag: 'verified',
      },
      {
        id: 'aza-a6',
        category: 'inferred',
        title:
          'A boxed warning for malignancy, on a risk that is hard to separate from the disease',
        laymanSummary:
          'The label warns that long-term use raises the risk of cancer, including two specific lymphomas. That warning rests on observational data, and the diseases the drug treats also raise cancer risk on their own. Untangling the two has proved difficult and the field has not fully done it.',
        technicalDetails:
          'The IMURAN boxed warning states that chronic immunosuppression with a purine antimetabolite increases the risk of malignancy in humans, and specifically names post-transplant lymphoma and hepatosplenic T-cell lymphoma in patients with inflammatory bowel disease. The supporting evidence is observational: transplant registries, and cohorts such as CESAME, which measured an adjusted hazard ratio of 5.28 for lymphoproliferative disorder in current thiopurine users. Confounding by indication and by disease severity is the standing objection — people on thiopurines have more active disease — and the CESAME finding that past users return to near-baseline incidence (0.20 against 0.26 per 1,000 patient-years) is the strongest argument against that objection, since disease severity does not reverse when the drug stops. Hepatosplenic T-cell lymphoma in particular is reported overwhelmingly in young men on combined thiopurine and anti-TNF therapy, which makes attribution to either drug alone unresolvable from case series.',
        evidenceSource:
          'IMURAN (azathioprine) tablets United States prescribing information, boxed warning; Beaugerie L et al., Lancet 2009;374:1617-1625',
        doi: '10.1016/S0140-6736(09)61302-7',
        inferredClaim:
          'That the measured lymphoma excess is caused by the drug rather than by the disease it treats — the reversal on discontinuation supports the drug, and the trials that would settle it have not been run',
        auditFlag: 'contested',
      },
      {
        id: 'aza-a7',
        category: 'conclusion_shift',
        title: 'From first-line immunosuppressant to a drug used because it is cheap',
        laymanSummary:
          'For twenty years azathioprine and steroids were the whole of transplant medicine. Cyclosporine displaced it as the main agent in the 1980s, mycophenolate displaced it as the antimetabolite in the 1990s, and the biologics beat it in Crohn’s disease in 2010. It is still used, and the reason has changed from being the best option to being an affordable one.',
        technicalDetails:
          'Azathioprine was introduced into clinical transplantation in 1962 and, with corticosteroids, constituted standard immunosuppression until cyclosporine arrived in 1983. Mycophenolate mofetil, which inhibits the same de novo purine pathway with selectivity for the type II isoform of inosine monophosphate dehydrogenase expressed preferentially in lymphocytes, replaced it in most kidney transplant protocols after trials in the mid-1990s. In inflammatory bowel disease, SONIC established in 2010 that infliximab alone outperformed azathioprine alone on corticosteroid-free remission (44.4% against 30.0%) and on mucosal healing (30.1% against 16.5%), and AZTEC established in 2013 that early azathioprine did not beat placebo in newly diagnosed disease. The drug remains in wide use, and at US$0.12 a tablet the reason is not obscure.',
        evidenceSource:
          'Colombel JF et al., N Engl J Med 2010;362:1383-1395; Panés J et al., Gastroenterology 2013;145:766-774; CMS National Average Drug Acquisition Cost file, effective 19 August 2026',
        doi: '10.1056/NEJMoa0904492',
        inferredClaim:
          'That continued widespread use reflects continued first-line efficacy — each of the three head-to-head comparisons in this batch places it behind the alternative, and the case for it now rests substantially on cost and on familiarity',
        auditFlag: 'caution',
      },
      {
        id: 'aza-a8',
        category: 'inferred',
        title: 'The licensed indications are two; the actual uses are a dozen',
        laymanSummary:
          'The label covers kidney transplant rejection and rheumatoid arthritis. The drug is used routinely for Crohn’s disease, ulcerative colitis, autoimmune hepatitis, myasthenia gravis, lupus, vasculitis and several skin diseases, none of which is on the label. Some of those have good trial support and some have almost none, and the label does not distinguish.',
        technicalDetails:
          'The IMURAN indications section covers adjunctive prevention of rejection in renal homotransplantation and the management of active rheumatoid arthritis in patients who have not responded adequately to rest, aspirin or other non-steroidal anti-inflammatory drugs. Inflammatory bowel disease, autoimmune hepatitis, myasthenia gravis, systemic lupus erythematosus, ANCA-associated vasculitis, bullous pemphigoid and atopic dermatitis are all treated with azathioprine off-label. The evidence quality across those uses is highly uneven: maintenance of remission in ANCA vasculitis and in autoimmune hepatitis has randomised support, while induction of remission in Crohn’s disease does not — Cochrane review evidence and the AZTEC result both point against it. Off-label use is lawful and often appropriate; the audit point is that a reader looking at the label learns nothing about which of these uses is well supported.',
        evidenceSource:
          'IMURAN (azathioprine) tablets United States prescribing information, Indications and Usage section (NDA 016324); Panés J et al., Gastroenterology 2013;145:766-774',
        inferredClaim:
          'That because the drug is widely used for a condition it is effective for that condition — the licensed indications and the actual indications overlap only partly, and the evidence behind the unlicensed ones ranges from randomised to almost none',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed with a chemical wrapper that survives the stomach',
        laymanDesc:
          'Azathioprine is a delivery device for a second molecule. On its own it does nothing; it exists so that 6-mercaptopurine can survive being swallowed and reach the bloodstream.',
        molecularDetail:
          'A nitroimidazolyl thioether of 6-mercaptopurine, designed by Elion and Hitchings specifically to slow the release of 6-MP and reduce its first-pass loss. Cleavage is largely non-enzymatic, by glutathione and other cellular thiols attacking the activated nitroimidazole ring.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Cellular thiols cut it in half',
        laymanDesc:
          'Inside cells, the body’s own antioxidant molecules break the link and release the working drug. This happens throughout the body, not in one organ.',
        molecularDetail:
          'Glutathione-mediated nucleophilic attack releases 6-mercaptopurine and 1-methyl-4-nitro-5-thioimidazole. Roughly 88% of an oral dose is absorbed; the released 6-MP then enters a branching metabolic network with three competing fates.',
        iconName: 'Scissors',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Three enzymes compete for it, and two of them are gatekeepers',
        laymanDesc:
          'The released drug can be turned into the active form, methylated into an inactive form, or oxidised into waste. How much ends up active depends on two enzymes whose genes vary between people.',
        molecularDetail:
          'Hypoxanthine-guanine phosphoribosyltransferase begins the activation route to 6-thioguanine nucleotides. Thiopurine S-methyltransferase diverts 6-MP to inactive 6-methylmercaptopurine, and xanthine oxidase oxidises it to 6-thiouric acid. NUDT15 additionally dephosphorylates active thioguanine triphosphates back to inactive monophosphates. TPMT and NUDT15 loss-of-function variants shift the balance towards accumulation, and xanthine oxidase inhibition by allopurinol does the same.',
        iconName: 'GitBranch',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Counterfeit nucleotides go into DNA and block new purine synthesis',
        laymanDesc:
          'The active form is incorporated into the cell’s DNA in place of a real building block, and it also shuts down the factory that makes those building blocks from scratch.',
        molecularDetail:
          '6-thioguanine nucleotides are incorporated into DNA and RNA, and the intermediate 6-thioinosine monophosphate inhibits the first committed step of de novo purine synthesis, amidophosphoribosyltransferase. A separate and probably important mechanism is 6-thio-GTP binding to Rac1 in T cells, blocking the co-stimulatory signal and inducing apoptosis — the effect that best explains the drug’s selectivity for activated T cells.',
        iconName: 'Dna',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Activated lymphocytes cannot divide, so the immune attack does not happen',
        laymanDesc:
          'Immune cells must multiply rapidly to mount a response. Most other cells in the body can recycle old building blocks; lymphocytes largely cannot, which is why they are hit hardest.',
        molecularDetail:
          'Lymphocytes depend disproportionately on de novo purine synthesis rather than the hypoxanthine salvage pathway, which is the basis of the therapeutic window for this whole antimetabolite class. The clinical effect takes weeks to months to develop because it depends on turnover of the existing lymphocyte pool, not on immediate inhibition.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Bone marrow and long-term cancer risk come from the same mechanism',
        laymanDesc:
          'The bone marrow is also full of rapidly dividing cells, so it is affected too. And a mechanism that damages DNA and suppresses immune surveillance over years carries a measured cancer risk.',
        molecularDetail:
          'Myelosuppression is dose-limiting and is severe in TPMT- or NUDT15-deficient patients. Thioguanine incorporated into DNA sensitises skin to ultraviolet A, and prolonged suppression of Epstein-Barr-specific T-cell surveillance underlies the lymphoproliferative signal — an adjusted hazard ratio of 5.28 in current users against never-users in 19,486 followed patients, returning towards baseline after discontinuation.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'SONIC (NCT00094458)',
        phase: 'Phase 3, randomised, double-blind, three-arm',
        sampleSize: 508,
        primaryEndpoint: 'Corticosteroid-free clinical remission at week 26 in Crohn’s disease',
        endpointMet: false,
        statisticalPValue:
          'Azathioprine alone 30.0% against infliximab alone 44.4% and combination 56.8%; P<0.001 for combination against azathioprine',
        unreportedAdverseSignals:
          'Azathioprine monotherapy was the comparator arm and lost on both remission and mucosal healing (16.5% against 43.9%). Serious infections were similar across arms at 3.9% to 5.6%, which undercuts the usual assumption that combining immunosuppressants necessarily multiplies infection risk.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'AZTEC (Panés 2013)',
        phase: 'Phase 3, multicentre, randomised, double-blind, placebo-controlled',
        sampleSize: 131,
        primaryEndpoint:
          'Sustained corticosteroid-free remission at 76 weeks in Crohn’s disease diagnosed within the previous 8 weeks',
        endpointMet: false,
        statisticalPValue: '44.1% against 36.5%; difference 7.6% (95% CI -9.2 to 24.4), P=0.48',
        unreportedAdverseSignals:
          'Discontinuation for adverse events was 20.6% against 6.35% (P=0.02). A post hoc analysis using a higher activity threshold did favour azathioprine (11.8% against 30.2%, P=0.01) and is frequently cited as though it were the trial result.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'PANTHER-IPF combination arm (NCT00650091)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, three-arm',
        sampleSize: 155,
        primaryEndpoint: 'Change in forced vital capacity over 60 weeks',
        endpointMet: false,
        statisticalPValue:
          'Terminated at interim analysis: 8 deaths against 1 (P=0.01) and 23 hospitalisations against 7 (P<0.001) with no physiological or clinical benefit',
        unreportedAdverseSignals:
          'The combination — prednisone, azathioprine and N-acetylcysteine — had been standard practice for idiopathic pulmonary fibrosis for years without a placebo-controlled trial. The arm was stopped at a mean follow-up of 32 weeks with roughly half the planned data.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'CESAME prospective cohort (Beaugerie 2009)',
        phase: 'Prospective nationwide observational cohort, not randomised',
        sampleSize: 19486,
        primaryEndpoint: 'Incidence of lymphoproliferative disorder by thiopurine exposure status',
        endpointMet: true,
        statisticalPValue:
          'Multivariate-adjusted hazard ratio 5.28 (95% CI 2.01 to 13.9), P=0.0007, current users against never-users; incidence 0.90 against 0.26 per 1,000 patient-years',
        unreportedAdverseSignals:
          'Observational and therefore open to confounding by indication. Only 23 events occurred in total, which is why the confidence interval spans a sevenfold range. Median follow-up was 35 months, short for a cancer endpoint.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Corticosteroid-free remission at week 26 in Crohn’s disease: 30.0% on azathioprine against 44.4% on infliximab and 56.8% on both, in 508 randomised patients',
        'Sustained corticosteroid-free remission at 76 weeks in new Crohn’s disease: 44.1% against 36.5% on placebo, difference 7.6% (95% CI -9.2 to 24.4), P=0.48',
        'Lymphoproliferative disorder hazard ratio 5.28 (95% CI 2.01 to 13.9) in current thiopurine users against never-users, in 19,486 followed patients',
        '8 deaths against 1 and 23 hospitalisations against 7 in the prednisone-azathioprine-acetylcysteine arm of PANTHER-IPF',
        'Loss-of-function TPMT alleles in about 0.3% of people of European or African ancestry, and loss-of-function NUDT15 in 2% of people of East Asian ancestry, both stated on the label',
      ],
      unsupportedInferences: [
        'That starting the drug early in Crohn’s disease changes the course of the disease — the trial designed to show it did not',
        'That the measured lymphoma excess is entirely attributable to the drug rather than partly to the disease it treats',
        'That an unlicensed use with long-standing practice behind it has evidence behind it; the label covers two indications and the drug is used for a dozen',
        'That the drug remains a first-line choice on efficacy, when all three head-to-head comparisons on this page place it behind the alternative',
      ],
      whatFailedInitially: [
        'AZTEC found no significant benefit over placebo at 76 weeks in newly diagnosed Crohn’s disease, with three times the discontinuation rate for adverse events',
        'SONIC placed azathioprine monotherapy last of three arms on both remission and mucosal healing',
        'PANTHER-IPF was stopped early because the combination containing azathioprine increased death and hospitalisation in pulmonary fibrosis',
        'Mycophenolate displaced it as the standard transplant antimetabolite in the 1990s on the strength of head-to-head rejection data',
      ],
      realWorldOutcome: [
        'With corticosteroids, the drug that made organ transplantation a routine procedure between 1962 and 1983',
        'On the WHO Model List of Essential Medicines, at about 12 cents a tablet at United States pharmacy acquisition cost',
        'Its discoverers, Gertrude Elion and George Hitchings, shared the 1988 Nobel Prize in Physiology or Medicine for the rational drug design that produced it',
        'One of the first drugs anywhere to carry a genotype-based safety statement on its label, for TPMT and later for NUDT15',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet (50 mg, and 75 mg and 100 mg as Azasan) and intravenous sodium salt',
      description:
        'Roughly 88% of an oral dose is absorbed. The molecule is a prodrug twice over: azathioprine releases 6-mercaptopurine, which must then be converted to thioguanine nucleotides inside cells before anything happens. The clinical effect takes weeks to months to appear because it depends on turnover of the existing lymphocyte population, which is why it is never used to treat an acute flare on its own.',
      safetyProfile:
        'Boxed warning for malignancy: chronic immunosuppression with a purine antimetabolite increases the risk of malignancy in humans, with post-transplant lymphoma and hepatosplenic T-cell lymphoma specifically named. Dose-limiting myelosuppression, severe and potentially fatal in patients deficient in TPMT or NUDT15, whose testing the label addresses. Serious and fatal interaction with xanthine oxidase inhibitors, allopurinol and febuxostat. Increased susceptibility to infection, hepatotoxicity, pancreatitis, a hypersensitivity syndrome with fever and rash that can mimic sepsis, and photosensitivity with an associated non-melanoma skin cancer risk.',
    },
    commonQuestions: [
      {
        q: 'Why do I need a blood test before I can start it?',
        a: 'Because two genes decide whether a normal dose is safe for you. Azathioprine releases 6-mercaptopurine, which cells convert into the active molecules. Two enzymes — thiopurine methyltransferase and NUDT15 — dispose of the excess. About 1 in 300 people of European or African ancestry carry two broken copies of the TPMT gene and have essentially no enzyme; among people of East Asian ancestry, 2% carry two broken copies of NUDT15 and about 21% carry one. In those people the active metabolite accumulates until it destroys the bone marrow. The label states that patients with either deficiency require alternative therapy or dose modification. It is one of the earliest and clearest examples of pharmacogenetics changing a label.',
      },
      {
        q: 'Does it cause cancer?',
        a: 'The label says chronic immunosuppression with this drug increases the risk of malignancy in humans, and names post-transplant lymphoma and hepatosplenic T-cell lymphoma. The best single measurement is a French cohort of 19,486 people with inflammatory bowel disease: lymphoproliferative disorder occurred at 0.90 per 1,000 patient-years in current thiopurine users against 0.26 in never-users, an adjusted hazard ratio of 5.28. Two things temper that. The absolute numbers are small — 23 cases in the whole cohort — and the diseases the drug treats carry their own cancer risk. What argues for the drug being causal is that people who had stopped taking it had an incidence of 0.20 per 1,000 patient-years, close to never-users. Disease severity does not reverse when a drug is stopped. Non-melanoma skin cancer is the other well-documented risk, and it is the reason sun protection is advised.',
        auditNote:
          'A hazard ratio of 5 on a base rate of 0.26 per 1,000 patient-years is a large relative increase on a small absolute risk. Both halves of that sentence belong in any honest description.',
      },
      {
        q: 'Is it as good as the newer drugs for Crohn’s disease?',
        a: 'The head-to-head trial says no. SONIC randomised 508 people with moderate-to-severe Crohn’s disease who had never had either drug. At 26 weeks, corticosteroid-free remission was 30.0% on azathioprine alone, 44.4% on infliximab alone and 56.8% on both. Mucosal healing — actual visible repair of the bowel lining — was 16.5%, 30.1% and 43.9%. Serious infections were similar in all three arms. A separate trial, AZTEC, tested whether starting azathioprine early in newly diagnosed disease helps and found 44.1% in sustained corticosteroid-free remission against 36.5% on placebo, a difference that was not significant, with three times the rate of stopping for side effects.',
      },
      {
        q: 'Why must I not take allopurinol with it?',
        a: 'Because allopurinol blocks one of the two disposal routes for the active metabolite. Azathioprine releases 6-mercaptopurine, which is cleared partly by methylation and partly by oxidation through xanthine oxidase — the enzyme allopurinol and febuxostat are designed to inhibit. Blocking it pushes the whole load down the activation pathway and the active thioguanine nucleotides accumulate, with fatal bone marrow failure the documented outcome. The combination is sometimes used deliberately, under specialist supervision, with a substantially reduced thiopurine dose and close blood monitoring. That is precisely why it must never happen because two prescribers did not know about each other.',
      },
      {
        q: 'How long before it works?',
        a: 'Weeks to months, and that is inherent to the mechanism rather than a matter of dose. The drug works by preventing lymphocytes from dividing, so the existing population of activated lymphocytes has to turn over before any effect appears. Nothing about that can be accelerated. It is the reason azathioprine is never used to control an acute flare on its own, and the reason it is almost always started alongside a corticosteroid that works within hours — with the intention that the steroid can be withdrawn once the slower drug has taken hold.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Colombel JF et al. Infliximab, azathioprine, or combination therapy for Crohn’s disease. N Engl J Med 2010;362:1383-1395 (SONIC)',
        identifier: '10.1056/NEJMoa0904492',
        kind: 'doi',
      },
      {
        label:
          'Panés J et al. Early azathioprine therapy is no more effective than placebo for newly diagnosed Crohn’s disease. Gastroenterology 2013;145:766-774 (AZTEC)',
        identifier: '10.1053/j.gastro.2013.06.009',
        kind: 'doi',
      },
      {
        label:
          'Beaugerie L et al. Lymphoproliferative disorders in patients receiving thiopurines for inflammatory bowel disease: a prospective observational cohort study. Lancet 2009;374:1617-1625 (CESAME)',
        identifier: '10.1016/S0140-6736(09)61302-7',
        kind: 'doi',
      },
      {
        label:
          'Idiopathic Pulmonary Fibrosis Clinical Research Network. Prednisone, azathioprine, and N-acetylcysteine for pulmonary fibrosis. N Engl J Med 2012;366:1968-1977 (PANTHER-IPF)',
        identifier: '10.1056/NEJMoa1113354',
        kind: 'doi',
      },
      {
        label: 'SONIC: study of biologic and immunomodulator naive patients in Crohn’s disease',
        identifier: 'NCT00094458',
        kind: 'nct',
      },
      {
        label: 'PANTHER-IPF: prednisone, azathioprine and N-acetylcysteine in pulmonary fibrosis',
        identifier: 'NCT00650091',
        kind: 'nct',
      },
      {
        label:
          'DailyMed: IMURAN (azathioprine) tablets — boxed warning for malignancy, TPMT and NUDT15 pharmacogenetics, and xanthine oxidase inhibitor interaction',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=606101a0-6244-7eff-e053-2a91aa0acadd',
        kind: 'regulatory',
      },
      {
        label: 'Drugs@FDA: IMURAN (azathioprine), NDA 016324 — label and approval history',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=016324',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 2265 — azathioprine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2265',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 6. Mycophenolate (mycophenolic acid, Myfortic) — approved on equivalence to the drug it was
  //    designed to improve on, for a benefit its two blinded pivotal trials did not find.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'mycophenolate',
    name: 'Mycophenolate',
    tradeName: 'Myfortic (mycophenolic acid, enteric-coated mycophenolate sodium)',
    sponsor:
      'Novartis Pharmaceuticals. The parent molecule, mycophenolic acid, was isolated from Penicillium in 1893 by Bartolomeo Gosio and rediscovered as an immunosuppressant nearly a century later; the enteric-coated sodium salt was approved in the United States in 2004.',
    targetGene: 'IMPDH2',
    targetProtein:
      'Inosine-5-monophosphate dehydrogenase, with roughly fivefold greater potency against the type II isoform (IMPDH2) that activated lymphocytes preferentially express than against the type I isoform found in most other cells',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2004,
    indication:
      'Prophylaxis of organ rejection in adult patients receiving a kidney transplant, and in paediatric patients 5 years of age and older who are at least 6 months post kidney transplant, in combination with cyclosporine and corticosteroids',
    patientFriendlyIndication: 'Stopping the body rejecting a transplanted kidney',
    anatomicalSite:
      'The cytoplasm of activated T and B lymphocytes, where the type II isoform of inosine monophosphate dehydrogenase is the rate-limiting enzyme for making guanosine nucleotides from scratch',
    conditionContext: {
      conditionExplainer:
        'A transplanted kidney carries surface proteins the recipient has never encountered. Lymphocytes recognise them, multiply, and destroy the graft. Multiplying requires guanosine nucleotides, and activated lymphocytes must build those from scratch because they have almost no capacity to recycle them.',
      whyItMatters:
        'Mycophenolate exploits that dependence more selectively than azathioprine does, and it displaced azathioprine as the standard antimetabolite in kidney transplantation. This particular product, the enteric-coated sodium salt, was developed for a narrower reason: to reduce the upper gastrointestinal side effects of mycophenolate mofetil. Both of its pivotal blinded trials found gastrointestinal adverse events at similar rates in both arms.',
      whoTakesThis:
        'Kidney transplant recipients, alongside cyclosporine and a corticosteroid. Mycophenolate is also used extensively off the licensed indication in lupus nephritis, other autoimmune kidney disease, vasculitis and interstitial lung disease.',
      clinicalGoals:
        'Prevent acute rejection without the marrow suppression of azathioprine and without adding to the kidney damage caused by the calcineurin inhibitor it is given with. The unavoidable cost is infection risk, and, for anyone who could become pregnant, one of the most severe teratogenic profiles of any widely used drug.',
    },
    oneSentenceVerdict:
      'A fungal metabolite that blocks the enzyme activated lymphocytes need to build guanosine nucleotides, hitting the isoform those cells express about five times harder than the one everything else uses — it was approved not on superiority but on therapeutic equivalence to mycophenolate mofetil (efficacy failure 25.8% against 26.2% at six months in 423 de novo kidney transplant patients), and the upper gastrointestinal tolerability it was designed to improve was no better in either pivotal blinded trial.',
    laymanHowItWorks:
      'To divide, a cell needs a supply of the four chemical letters that make up DNA. Immune cells that have just been activated cannot recycle the letter G from old material the way most cells can; they have to manufacture it, and one enzyme controls that manufacture. Mycophenolate blocks that enzyme, and it blocks the particular version of it that activated immune cells make far more strongly than the version found elsewhere in the body. The result is that dividing lymphocytes run out of raw material and stop, while cells that can recycle carry on largely unaffected.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 71,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.2265 per tablet at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Mycophenolic acid itself has been known since 1893 and is not patentable; the protected asset was the enteric-coated sodium salt formulation approved in 2004, and generic delayed-release mycophenolic acid tablets are now available at about 23 cents each. The label states that Myfortic delayed-release tablets and mycophenolate mofetil tablets and capsules should not be used interchangeably, because the salts deliver different molar amounts of mycophenolic acid — which means the formulation distinction survives the loss of exclusivity as a prescribing constraint.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The immediate alternative is mycophenolate mofetil, which delivers the same active molecule through a different ester and has the larger evidence base and the broader licence. Azathioprine is the older antimetabolite it replaced, and in lupus nephritis maintenance the head-to-head result goes the other way — mycophenolate mofetil beat azathioprine on time to treatment failure with a hazard ratio of 0.44. For anyone who might become pregnant, the substitute question is not about efficacy: azathioprine is the drug most often moved to, because mycophenolate causes first-trimester pregnancy loss in 45% to 49% of exposed pregnancies and congenital malformations in 23% to 27% of live births.',
      conventionalRx: [
        {
          name: 'Mycophenolate mofetil (CellCept)',
          class: 'Morpholinoethyl ester prodrug of the same active molecule',
          howItCompares:
            'Delivers identical mycophenolic acid. In the pivotal de novo trial the two were therapeutically equivalent: efficacy failure at 6 months 25.8% against 26.2% (95% CI -8.7 to +8.0). It carries the broader licence, covering kidney, heart and liver transplantation, and it is what the great majority of the published outcome literature actually studied.',
          typicalCost:
            'US$0.2698 per unit at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: broader indications, far larger evidence base, more formulations including intravenous and oral suspension. Cons: the upper gastrointestinal intolerance that motivated the enteric-coated alternative in the first place.',
        },
        {
          name: 'Azathioprine',
          class: 'Purine antimetabolite prodrug',
          howItCompares:
            'The drug mycophenolate displaced in kidney transplantation, blocking the same pathway less selectively. In lupus nephritis maintenance it lost decisively to mycophenolate mofetil: treatment failure 32.4% against 16.4%, hazard ratio 0.44 (95% CI 0.25 to 0.77, P=0.003). Its advantage is that it is not a known human teratogen at the same level, which makes it the usual substitute in pregnancy.',
          typicalCost:
            'US$0.1249 per tablet at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: cheaper, usable in pregnancy, decades of accumulated experience. Cons: less selective, TPMT and NUDT15 pharmacogenetic risk, worse on the one head-to-head maintenance endpoint measured.',
        },
        {
          name: 'Intravenous cyclophosphamide (for lupus nephritis induction)',
          class: 'Alkylating agent',
          howItCompares:
            'The comparator in the ALMS induction study, which randomised 370 patients with class III to V lupus nephritis. Response was 56.2% on mycophenolate mofetil against 53.0% on cyclophosphamide, with similar secondary endpoints and similar adverse event, serious adverse event and infection rates. The trial did not meet its objective of showing mycophenolate superior.',
          typicalCost: 'Generic; administered as monthly intravenous pulses in a hospital setting',
          prosAndCons:
            'Pros: equivalent measured response, long track record. Cons: gonadal toxicity and infertility risk, cumulative bladder and malignancy risk, and the need for infusion visits.',
        },
        {
          name: 'Belatacept-based or mTOR-inhibitor-based regimens',
          class: 'Costimulation blocker or mTOR inhibitor',
          howItCompares:
            'Different mechanisms used when the standard combination cannot be tolerated — belatacept avoids calcineurin-inhibitor nephrotoxicity, sirolimus and everolimus avoid it differently. Neither substitutes for the antimetabolite in most protocols; they substitute for the calcineurin inhibitor alongside it.',
          typicalCost:
            'Belatacept is an intravenous biologic and substantially more expensive; sirolimus and everolimus are generic oral drugs',
          prosAndCons:
            'Pros: spare the kidney from calcineurin inhibitor damage. Cons: belatacept requires monthly infusion and is contraindicated in Epstein-Barr-seronegative recipients because of post-transplant lymphoproliferative disease risk.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Pregnancy prevention is not optional advice with this drug',
          action:
            'Anyone of reproductive potential should have the pregnancy risk discussed before the first dose, and should raise it again before any planned pregnancy.',
          patientImpact:
            'Published pregnancy registry data report first-trimester pregnancy loss in 45% to 49% of exposed pregnancies and a spectrum of congenital malformations in 23% to 27% of live births — external ear, eye and other facial abnormalities including cleft lip and palate, and anomalies of the distal limbs, heart, oesophagus, kidney and nervous system. Background rates are 15% to 20% and 2% to 4%.',
          clinicalPrecaution:
            'This is the first item in the boxed warning. The label also advises against blood donation during treatment and for six weeks after, and against semen donation during treatment and for 90 days after.',
        },
        {
          name: 'Report unexplained tiredness or breathlessness rather than attributing it to the transplant',
          action:
            'Mention new fatigue, pallor or breathlessness promptly; do not assume it is a normal part of recovery.',
          patientImpact:
            'Pure red cell aplasia — a specific and reversible shutdown of red cell production — is a labelled adverse reaction of mycophenolate products, alongside more general blood dyscrasias. It is detected on a blood count, not by how a person feels.',
          clinicalPrecaution:
            'The label lists blood dyscrasias including pure red cell aplasia among its Warnings and Precautions, and cases have resolved on dose reduction or withdrawal.',
        },
        {
          name: 'Take vaccination timing seriously and avoid live vaccines',
          action:
            'Ask which vaccines are safe and get non-live ones scheduled where possible before immunosuppression starts.',
          patientImpact:
            'Immunosuppression reduces the response to vaccination and makes live vaccines hazardous. The label addresses immunisations directly and advises that live attenuated vaccines should be avoided.',
          clinicalPrecaution:
            'This applies to household contacts’ live vaccines in some circumstances too, which is a question worth asking rather than assuming.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC1=C2COC(=O)C2=C(C(=C1OC)C/C=C(\\C)/CCC(=O)[O-])O',
      chemicalFormula: 'C17H19O6',
      molecularWeight: '319.30 g/mol',
      targetReceptorAffinity:
        'Mycophenolic acid is an uncompetitive, reversible inhibitor of inosine-5-monophosphate dehydrogenase, and is roughly five times more potent against the type II isoform than the type I. Activated lymphocytes upregulate the type II isoform, which is the structural basis for the drug’s selectivity. The stored structure is the mycophenolate anion, the form present at physiological pH; the sodium salt is what the delayed-release tablet contains.',
      structureSource: {
        label:
          'PubChem CID 6918995 (mycophenolate anion) — canonical SMILES, molecular formula C17H19O6- and molecular weight 319.3 g/mol, re-checked against the PUG REST property endpoint; the parent acid is CID 446541',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/6918995',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'mpa-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the E-geometry of the side-chain double bond',
          description:
            'Establish that the trisubstituted alkene in the hexenoic acid side chain is in the E configuration. The Z isomer has substantially reduced activity, and because it is identical in mass and nearly identical by ultraviolet spectrum, only chromatography or NMR will separate it from the drug.',
          reagentsAndBuffer:
            'Mycophenolic acid reference standard, 1H NMR in DMSO-d6 with nuclear Overhauser measurement across the alkene, reversed-phase HPLC resolving the Z isomer, ultraviolet detection at 250 nm',
        },
        {
          id: 'mpa-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Fermentation of Penicillium brevicompactum and recovery of the free acid',
          description:
            'Mycophenolic acid is a natural product, produced by submerged fermentation of Penicillium species rather than by total synthesis. It holds the distinction of being the first antibiotic ever isolated in crystalline form, by Gosio in 1893, and the manufacturing route is still fermentation because the phthalide-hexenoic acid framework is awkward to build chemically.',
          dependsOnStepId: 'mpa-w1',
          reagentsAndBuffer:
            'Penicillium brevicompactum or P. stoloniferum submerged culture, glucose and corn steep liquor medium, controlled pH and dissolved oxygen, acidified solvent extraction into ethyl acetate or butyl acetate',
        },
        {
          id: 'mpa-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation and removal of co-metabolites',
          description:
            'Separate mycophenolic acid from the structurally related metabolites Penicillium produces alongside it, and from the Z isomer generated during processing. Purity here determines the mass of active moiety per tablet, which matters more than usual for this drug because the two marketed salts deliver different molar amounts and are not interchangeable.',
          dependsOnStepId: 'mpa-w2',
          reagentsAndBuffer:
            'Activated charcoal treatment, crystallisation from aqueous methanol or acetone, preparative reversed-phase chromatography, potentiometric assay of the free acid content',
        },
        {
          id: 'mpa-w4',
          stepNumber: 4,
          phase: 'Conjugation',
          name: 'Form the sodium salt and apply the enteric coat',
          description:
            'Convert the free acid to the sodium salt and coat the tablet with a polymer that does not dissolve until it leaves the stomach. This is the entire product concept: mycophenolic acid irritates the upper gastrointestinal tract, so release is delayed past it. Whether that translated into fewer gastrointestinal adverse events is the central audit on this page, and in two blinded trials it did not.',
          dependsOnStepId: 'mpa-w3',
          reagentsAndBuffer:
            'Sodium hydroxide or sodium carbonate for salt formation, methacrylic acid copolymer enteric film, USP <711> dissolution testing in pH 1.2 acid stage followed by pH 6.8 buffer stage',
        },
        {
          id: 'mpa-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'IMPDH isoform selectivity assay with a guanosine rescue arm',
          description:
            'Measure inhibition of the type I and type II isoforms separately, and repeat the lymphocyte proliferation assay with exogenous guanosine supplied. Adding guanosine bypasses the blocked de novo pathway through salvage; if proliferation is rescued, the assay is measuring the intended mechanism rather than general cytotoxicity.',
          dependsOnStepId: 'mpa-w4',
          reagentsAndBuffer:
            'Recombinant human IMPDH1 and IMPDH2 with IMP and NAD substrates, NADH absorbance readout at 340 nm, activated peripheral blood mononuclear cells with and without guanosine supplementation, mizoribine as a mechanistic comparator',
        },
      ],
    },
    keyAudits: [
      {
        id: 'mpa-a1',
        category: 'measured',
        title: 'ERL B301: approved on equivalence, not on being better',
        laymanSummary:
          'The registration trial did not ask whether this drug worked better than the one already on the market. It asked whether it worked the same. Four hundred and twenty-three kidney transplant patients were randomised, and the two arms came out within half a percentage point of each other.',
        technicalDetails:
          'A 12-month double-blind study in 423 de novo kidney transplant patients compared enteric-coated mycophenolate sodium 720 mg twice daily against mycophenolate mofetil 1,000 mg twice daily, both with cyclosporine microemulsion and corticosteroids. Efficacy failure at 6 months — biopsy-proven acute rejection, graft loss, death or loss to follow-up — was 25.8% against 26.2% (95% CI -8.7 to +8.0), demonstrating therapeutic equivalence. At 12 months, biopsy-proven acute rejection, graft loss or death was 26.3% against 28.1%, and biopsy-proven acute rejection alone 22.5% against 24.3%. Among those with rejection, severe acute rejection was 2.1% against 9.8%, not statistically significant.',
        evidenceSource: 'Salvadori M et al., ERL B301 Study Groups, Am J Transplant 2004;4:231-236',
        doi: '10.1046/j.1600-6143.2003.00337.x',
        measuredMetric:
          'Efficacy failure at 6 months against mycophenolate mofetil, equivalence design with a prespecified confidence interval',
        auditFlag: 'verified',
      },
      {
        id: 'mpa-a2',
        category: 'failed',
        title: 'The gastrointestinal advantage it was designed for was not found in either trial',
        laymanSummary:
          'The whole reason this version exists is that ordinary mycophenolate upsets the stomach, and coating it so it dissolves further down should help. Both blinded trials measured that directly. In neither did the coated version produce significantly fewer gastrointestinal side effects.',
        technicalDetails:
          'In the de novo trial, the safety profile and incidence of gastrointestinal adverse events were similar in both groups, and within 12 months 15.0% of enteric-coated mycophenolate sodium patients and 19.5% of mycophenolate mofetil patients required dose changes for gastrointestinal adverse events, not significant. In the conversion trial, the primary endpoint was the incidence of gastrointestinal adverse events at 3 months: 26.4% against 20.9%, not significant, numerically favouring mycophenolate mofetil; at 12 months 29.6% against 24.5%, also not significant. The adjusted increase from baseline in mean gastrointestinal adverse event severity score tended lower with the enteric-coated product (0.23 against 0.47 at 12 months) but did not reach significance. Serious infections were significantly lower with the enteric-coated product in the conversion study (8.8% against 16.0%, P<0.05), a finding not predicted by the product’s rationale and not replicated in the de novo study.',
        evidenceSource:
          'Salvadori M et al., Am J Transplant 2004;4:231-236; Budde K et al., ERL B302 Study Group, Am J Transplant 2004;4:237-243',
        doi: '10.1046/j.1600-6143.2003.00321.x',
        measuredMetric:
          'Incidence of gastrointestinal adverse events at 3 and 12 months, the prespecified primary endpoint of the conversion study',
        auditFlag: 'caution',
      },
      {
        id: 'mpa-a3',
        category: 'measured',
        title: 'The teratogenic risk is among the largest quantified for any prescribed drug',
        laymanSummary:
          'Registry data put first-trimester pregnancy loss after exposure at roughly one in two, against a background of about one in six. Birth defects were reported in around a quarter of live births, against a background of two to four in a hundred. This is the first thing on the boxed warning.',
        technicalDetails:
          'The label states that a spectrum of congenital malformations, including multiple malformations in individual newborns, has been reported in 23% to 27% of live births in mycophenolate-exposed pregnancies based on published pregnancy registry data, and that the risk of first-trimester pregnancy loss has been reported at 45% to 49%. Documented malformations include external ear, eye and other facial abnormalities including cleft lip and palate, and anomalies of the distal limbs, heart, oesophagus, kidney and nervous system. The label gives the United States general-population background risks as 2% to 4% for major birth defects and 15% to 20% for miscarriage in clinically recognised pregnancies. In rats, malformations including anophthalmia, exencephaly and umbilical hernia occurred at a systemic exposure 0.05 times the clinical exposure at 1,440 mg per day.',
        evidenceSource:
          'MYFORTIC (mycophenolic acid) delayed-release tablets United States prescribing information, boxed warning, Warnings and Precautions 5.1 and Use in Specific Populations 8.1',
        measuredMetric:
          'Rates of first-trimester pregnancy loss and congenital malformation in exposed pregnancies from published registries, against stated background rates',
        auditFlag: 'verified',
      },
      {
        id: 'mpa-a4',
        category: 'failed',
        title: 'ALMS induction: mycophenolate did not beat cyclophosphamide in lupus nephritis',
        laymanSummary:
          'The largest international trial in lupus kidney disease set out to show mycophenolate was better than the older intravenous chemotherapy drug. Response rates were 56% against 53%. The trial says plainly that it did not meet its objective.',
        technicalDetails:
          'The Aspreva Lupus Management Study randomised 370 patients with class III to V lupus nephritis to open-label mycophenolate mofetil at a target of 3 g per day or intravenous cyclophosphamide 0.5 to 1.0 g/m2 in monthly pulses, both with tapering prednisone, over a 24-week induction phase. The primary endpoint combined a prespecified decrease in urine protein-to-creatinine ratio with stabilisation or improvement in serum creatinine. Response was 104 of 185 (56.2%) on mycophenolate against 98 of 185 (53.0%) on cyclophosphamide. Secondary endpoints were similar. There were nine deaths in the mycophenolate group and five in the cyclophosphamide group. Rates of adverse events, serious adverse events and infections did not differ significantly. The authors state the study did not meet its primary objective of showing superiority.',
        evidenceSource:
          'Appel GB et al., Aspreva Lupus Management Study Group, J Am Soc Nephrol 2009;20:1103-1112 (ALMS, NCT00377637)',
        doi: '10.1681/ASN.2008101028',
        measuredMetric:
          'Composite renal response at 24 weeks, mycophenolate mofetil against intravenous cyclophosphamide, superiority design',
        auditFlag: 'verified',
      },
      {
        id: 'mpa-a5',
        category: 'measured',
        title: 'ALMS maintenance: it clearly beat azathioprine at keeping the response',
        laymanSummary:
          'The second half of the same study asked a different question and got a clear answer. Among patients who had responded, those kept on mycophenolate failed treatment half as often as those switched to azathioprine, and fewer of them stopped because of side effects.',
        technicalDetails:
          'The maintenance phase re-randomised 227 patients who had met response criteria during induction to mycophenolate mofetil (n=116) or azathioprine 2 mg/kg/day (n=111), with matching placebo in each group and up to 10 mg prednisone daily permitted. The primary endpoint was time to treatment failure, defined as death, end-stage renal disease, doubling of serum creatinine, renal flare or rescue therapy. Mycophenolate was superior: hazard ratio 0.44 (95% CI 0.25 to 0.77, P=0.003), with observed treatment failure in 19 of 116 (16.4%) against 36 of 111 (32.4%). Time to renal flare and time to rescue therapy also favoured mycophenolate. Adverse events occurred in more than 95% of patients in both groups. Withdrawal due to adverse events was 25.2% against 39.6% (P=0.02).',
        evidenceSource:
          'Dooley MA et al., ALMS Group, N Engl J Med 2011;365:1886-1895 (NCT00377637)',
        doi: '10.1056/NEJMoa1014460',
        measuredMetric:
          'Time to treatment failure in lupus nephritis maintenance, against azathioprine, in a double-blind randomised comparison',
        auditFlag: 'verified',
      },
      {
        id: 'mpa-a6',
        category: 'inferred',
        title: 'The lupus evidence is for mycophenolate mofetil, and this product is not it',
        laymanSummary:
          'Almost everything published about mycophenolate in lupus was done with the older ester, not with this enteric-coated salt. The label itself says the two are not interchangeable. That has not stopped the evidence being read across.',
        technicalDetails:
          'ALMS, both phases, used mycophenolate mofetil. The Myfortic licence covers kidney transplant prophylaxis only, in combination with cyclosporine and corticosteroids, and its Limitations of Use section states that Myfortic delayed-release tablets and mycophenolate mofetil tablets and capsules should not be used interchangeably. The two salts deliver different molar quantities of mycophenolic acid per milligram of product, and their release profiles differ by design. The pharmacological argument that both deliver the same active moiety is sound; the regulatory position is that substitution is not automatic; and the clinical literature in lupus, vasculitis and interstitial lung disease was generated almost entirely with the mofetil ester. A reader told "mycophenolate works in lupus nephritis" is being told something true about a related product.',
        evidenceSource:
          'MYFORTIC delayed-release tablets United States prescribing information, Indications and Usage 1.1 and Limitations of Use 1.2; Appel GB et al., J Am Soc Nephrol 2009;20:1103-1112',
        inferredClaim:
          'That trial evidence generated with mycophenolate mofetil transfers unchanged to enteric-coated mycophenolate sodium — pharmacologically defensible, and explicitly not what the label permits',
        auditFlag: 'contested',
      },
      {
        id: 'mpa-a7',
        category: 'measured',
        title: 'A 3.6-fold difference in severe rejection that was not statistically significant',
        laymanSummary:
          'Among patients who did reject the kidney, severe rejection happened in 2.1% on the enteric-coated version and 9.8% on the comparator. That looks like a large advantage. The trial reported it as not significant, and the honest reading is that the trial was not built to answer that question.',
        technicalDetails:
          'In the de novo study, among patients with biopsy-proven acute rejection, severe acute rejection occurred in 2.1% of enteric-coated mycophenolate sodium patients and 9.8% of mycophenolate mofetil patients, reported as not significant. The trial was powered for equivalence on a composite efficacy-failure endpoint in 423 patients, not for a subgroup comparison of rejection severity among the roughly one quarter who rejected. A difference of this size on a small denominator with a non-significant p-value is exactly the kind of finding that gets quoted forward as though it were established. It is a hypothesis the trial generated, not a result the trial demonstrated, and no subsequent adequately powered study has tested it.',
        evidenceSource: 'Salvadori M et al., Am J Transplant 2004;4:231-236',
        doi: '10.1046/j.1600-6143.2003.00337.x',
        measuredMetric:
          'Incidence of severe acute rejection among patients with biopsy-proven acute rejection, an unpowered subgroup comparison',
        auditFlag: 'caution',
      },
      {
        id: 'mpa-a8',
        category: 'conclusion_shift',
        title: 'From "a better-tolerated mycophenolate" to "a second mycophenolate"',
        laymanSummary:
          'The product was launched on a tolerability promise that its own trials did not deliver. Twenty years on, the case for it is that some individual patients do better on it, which is a much smaller claim than the one it was built on.',
        technicalDetails:
          'The stated development objective of enteric-coated mycophenolate sodium, in both pivotal publications, was improving the upper gastrointestinal tolerability of mycophenolic acid. The de novo study found gastrointestinal adverse events and dose changes for them similar between arms. The conversion study made gastrointestinal adverse event incidence at 3 months its primary endpoint and found 26.4% against 20.9%, not significant and numerically the wrong way. Subsequent open-label conversion studies reported symptom improvement, but open-label symptom endpoints in patients converted because of symptoms are subject to regression to the mean and to expectation effects in a way that the blinded incidence comparison is not. The position the field has settled into — that the two are equivalent and that individual tolerance varies — is defensible and is not the claim the product was introduced with.',
        evidenceSource:
          'Salvadori M et al., Am J Transplant 2004;4:231-236; Budde K et al., Am J Transplant 2004;4:237-243',
        doi: '10.1046/j.1600-6143.2003.00321.x',
        inferredClaim:
          'That enteric coating delivers better gastrointestinal tolerability — the mechanism is plausible, the blinded incidence data did not show it, and the supportive evidence that followed was open-label',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'The tablet is built not to dissolve in the stomach',
        laymanDesc:
          'Mycophenolic acid irritates the upper gut. The tablet is coated in a polymer that stays intact in stomach acid and only breaks down further along, in the small intestine.',
        molecularDetail:
          'A methacrylic acid copolymer enteric film delays release until the pH rises above roughly 5.5. The active moiety is mycophenolate sodium rather than the morpholinoethyl ester used in mycophenolate mofetil, so the milligram strengths are not interchangeable: 720 mg of the sodium salt is the counterpart of 1,000 mg of the mofetil ester.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Absorbed and then recycled through the liver and back',
        laymanDesc:
          'The drug is absorbed, processed by the liver, sent out in bile, and then reabsorbed from the gut hours later. That second wave is why blood levels rise twice from a single dose.',
        molecularDetail:
          'Mycophenolic acid is glucuronidated by UGT enzymes to the inactive 7-O-glucuronide, excreted in bile, and deconjugated by gut bacterial beta-glucuronidase, producing enterohepatic recirculation and a secondary plasma peak at 6 to 12 hours. Antibiotics that suppress gut flora reduce that second peak and therefore total exposure, which is a real and underappreciated interaction.',
        iconName: 'Repeat',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It jams one enzyme in the guanosine assembly line',
        laymanDesc:
          'Building the DNA letter G from scratch requires one particular enzyme. The drug locks that enzyme in a dead-end state so the assembly line stops.',
        molecularDetail:
          'Mycophenolic acid is an uncompetitive, reversible inhibitor of inosine-5-monophosphate dehydrogenase, trapping the covalent enzyme-IMP intermediate and blocking conversion of IMP to xanthosine monophosphate, the rate-limiting step of de novo guanosine nucleotide synthesis.',
        iconName: 'Ban',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'It picks the version of that enzyme immune cells use',
        laymanDesc:
          'There are two versions of the enzyme. Activated immune cells make far more of one of them, and this drug blocks that one about five times more strongly. That is where the selectivity comes from.',
        molecularDetail:
          'Roughly fivefold greater potency against IMPDH2, upregulated in activated lymphocytes, than against the constitutively expressed IMPDH1. Combined with the fact that lymphocytes depend on de novo synthesis rather than the hypoxanthine-guanine phosphoribosyltransferase salvage pathway available to most other cells, this gives a therapeutic window that azathioprine, acting further upstream, does not have.',
        iconName: 'Target',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Lymphocytes cannot proliferate, and the graft is not attacked',
        laymanDesc:
          'Without a supply of that building block, activated T and B cells cannot multiply, so the immune attack on the transplanted kidney does not get off the ground.',
        molecularDetail:
          'Cytostatic rather than cytotoxic: proliferation is arrested rather than cells killed. In the pivotal trial, efficacy failure at 6 months — biopsy-proven acute rejection, graft loss, death or loss to follow-up — was 25.8%, statistically equivalent to 26.2% on mycophenolate mofetil.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'The same block acts on any dividing cell that cannot salvage',
        laymanDesc:
          'Gut lining cells, bone marrow and a developing embryo all divide fast. The gut effects are why the enteric coating exists; the marrow effects are monitored with blood tests; the embryo effects are the reason for the boxed warning.',
        molecularDetail:
          'Gastrointestinal mucosal turnover produces the diarrhoea and gastritis that motivated this formulation. Marrow effects include neutropenia and pure red cell aplasia. Embryo-fetal toxicity is the most severe: 45% to 49% first-trimester pregnancy loss and 23% to 27% congenital malformation in live births from published registry data, against background rates of 15% to 20% and 2% to 4%.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'ERL B301 de novo kidney transplant study (Salvadori 2004)',
        phase: 'Phase 3, 12-month, randomised, double-blind, therapeutic equivalence',
        sampleSize: 423,
        primaryEndpoint:
          'Efficacy failure at 6 months — biopsy-proven acute rejection, graft loss, death or loss to follow-up',
        endpointMet: true,
        statisticalPValue:
          '25.8% against 26.2%; 95% CI for the difference -8.7 to +8.0, meeting the prespecified equivalence margin',
        unreportedAdverseSignals:
          'An equivalence design cannot show superiority and was not intended to. The incidence of gastrointestinal adverse events — the reason the product was developed — was similar in both arms, and dose changes for gastrointestinal adverse events were 15.0% against 19.5%, not significant.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'ERL B302 maintenance conversion study (Budde 2004)',
        phase: 'Phase 3, 12-month, randomised, double-blind',
        sampleSize: 322,
        primaryEndpoint:
          'Incidence of gastrointestinal adverse events at 3 months after conversion',
        endpointMet: false,
        statisticalPValue:
          '26.4% against 20.9% at 3 months, not significant; 29.6% against 24.5% at 12 months, not significant',
        unreportedAdverseSignals:
          'The primary endpoint numerically favoured the comparator. Serious infections were significantly lower on the enteric-coated product (8.8% against 16.0%, P<0.05) — a finding the product’s rationale does not predict, from a trial of 322 patients, not replicated in the de novo study.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'ALMS induction phase (NCT00377637)',
        phase: 'Phase 3, multinational, randomised, open-label, superiority',
        sampleSize: 370,
        primaryEndpoint:
          'Prespecified decrease in urine protein-to-creatinine ratio with stabilisation or improvement in serum creatinine at 24 weeks',
        endpointMet: false,
        statisticalPValue:
          '56.2% against 53.0% for intravenous cyclophosphamide; the study did not meet its objective of showing superiority',
        unreportedAdverseSignals:
          'Nine deaths in the mycophenolate group against five in the cyclophosphamide group, in an open-label trial. Adverse event, serious adverse event and infection rates did not differ significantly. The trial used mycophenolate mofetil, not the enteric-coated sodium salt.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'ALMS maintenance phase (NCT00377637)',
        phase: 'Phase 3, randomised, double-blind, double-dummy',
        sampleSize: 227,
        primaryEndpoint:
          'Time to treatment failure — death, end-stage renal disease, doubling of serum creatinine, renal flare or rescue therapy',
        endpointMet: true,
        statisticalPValue:
          'Hazard ratio 0.44 (95% CI 0.25 to 0.77), P=0.003; observed treatment failure 16.4% against 32.4% on azathioprine',
        unreportedAdverseSignals:
          'Adverse events occurred in more than 95% of patients in both arms. Only patients who had already responded to induction were re-randomised, so the result applies to maintenance of a response and not to achieving one.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Efficacy failure at 6 months 25.8% against 26.2% for mycophenolate mofetil in 423 de novo kidney transplant patients, 95% CI -8.7 to +8.0',
        'Gastrointestinal adverse events at 3 months after conversion 26.4% against 20.9%, the primary endpoint, not significant',
        'First-trimester pregnancy loss 45% to 49% and congenital malformation in 23% to 27% of live births after exposure, from published registries',
        'Lupus nephritis induction response 56.2% against 53.0% for intravenous cyclophosphamide in 370 patients — superiority not shown',
        'Lupus nephritis maintenance treatment failure 16.4% against 32.4% for azathioprine, hazard ratio 0.44 (95% CI 0.25 to 0.77)',
      ],
      unsupportedInferences: [
        'That the enteric coating produces better gastrointestinal tolerability — neither blinded trial found it, and the supportive evidence that followed was open-label',
        'That trial results generated with mycophenolate mofetil apply to this product, when the label states the two should not be used interchangeably',
        'That 2.1% against 9.8% severe rejection is an advantage, when it is an unpowered subgroup comparison reported as not significant',
        'That the lupus, vasculitis and interstitial lung disease uses are covered by this licence; the licence covers kidney transplant prophylaxis and nothing else',
      ],
      whatFailedInitially: [
        'The conversion study missed its own primary endpoint, with gastrointestinal adverse events numerically higher on the enteric-coated product',
        'ALMS induction failed to show mycophenolate superior to intravenous cyclophosphamide in lupus nephritis',
        'The product was approved on equivalence to an existing drug rather than on any demonstrated advantage over it',
        'The embryo-fetal toxicity was severe enough to move to the front of the boxed warning and to generate a risk-management programme',
      ],
      realWorldOutcome: [
        'Mycophenolate displaced azathioprine as the standard antimetabolite in kidney transplantation, and this salt is one of two ways to deliver it',
        'Generic delayed-release mycophenolic acid is now about 23 cents a tablet at United States pharmacy acquisition cost',
        'Used far beyond its licence — lupus nephritis, vasculitis, interstitial lung disease — on evidence generated with the other ester',
        'The pregnancy risk is now managed through a formal programme, and it is the reason many patients of reproductive potential are moved to azathioprine',
      ],
    },
    deliverySystem: {
      type: 'Delayed-release (enteric-coated) oral tablet, 180 mg and 360 mg of mycophenolic acid',
      description:
        'The enteric coat holds the tablet intact through the stomach and releases mycophenolic acid in the small intestine, the design intended to spare the upper gastrointestinal tract. Absorption is followed by glucuronidation in the liver, biliary excretion and bacterial deconjugation in the gut, giving a second plasma peak 6 to 12 hours after a dose. The label states this product and mycophenolate mofetil should not be used interchangeably, because equal milligram amounts do not deliver equal amounts of mycophenolic acid.',
      safetyProfile:
        'Boxed warning covering embryo-fetal toxicity, malignancies and serious infections. Pregnancy exposure carries a reported 45% to 49% risk of first-trimester loss and 23% to 27% risk of congenital malformation in live births. Increased risk of lymphoma and other malignancies, particularly of the skin. Increased susceptibility to bacterial, viral, fungal and protozoal infection including opportunistic infection, with BK virus nephropathy and progressive multifocal leukoencephalopathy specifically relevant. Blood dyscrasias including pure red cell aplasia, serious gastrointestinal tract complications including bleeding and perforation, an acute inflammatory syndrome associated with mycophenolate products, and hypersensitivity reactions. Live vaccines should be avoided. The label advises against blood donation during treatment and for six weeks after, and against semen donation during treatment and for 90 days after.',
    },
    commonQuestions: [
      {
        q: 'What is the difference between this and CellCept?',
        a: 'They deliver the same active molecule, mycophenolic acid, through different chemistry. CellCept is mycophenolate mofetil, an ester that the body cleaves to release the acid. Myfortic is the sodium salt of the acid itself, in a tablet coated so it does not dissolve until it has left the stomach. Because the salt and the ester have different molecular weights, equal milligram amounts do not deliver equal amounts of drug — 720 mg of the sodium salt corresponds to 1,000 mg of the mofetil ester — and the label states the two should not be used interchangeably. The registration trial found them therapeutically equivalent on efficacy: failure at six months was 25.8% against 26.2%.',
      },
      {
        q: 'Does the enteric coating actually reduce stomach side effects?',
        a: 'The blinded trials did not show that it does. That was the stated development objective, and the conversion study made it the primary endpoint: gastrointestinal adverse events at three months were 26.4% on the enteric-coated product against 20.9% on mycophenolate mofetil, not significant and numerically the wrong way. The de novo study found similar gastrointestinal rates in both arms and dose changes for gastrointestinal reasons in 15.0% against 19.5%, also not significant. Later open-label conversion studies did report symptom improvement, but converting people because they have symptoms and then asking them whether their symptoms improved is not the same evidence as a blinded incidence comparison. Some individual patients genuinely do better on one than the other; that is a smaller claim than the one the product launched with.',
        auditNote:
          'A severity score did trend lower with the enteric-coated product (0.23 against 0.47 at 12 months) without reaching significance. That is a real signal in an underpowered secondary endpoint, and it is not a demonstrated benefit.',
      },
      {
        q: 'Why is pregnancy such a serious issue with this drug?',
        a: 'Because the numbers are large enough to be unmistakable. Published pregnancy registry data report first-trimester pregnancy loss in 45% to 49% of exposed pregnancies, against a background of 15% to 20%, and a spectrum of congenital malformations in 23% to 27% of live births, against a background of 2% to 4%. The pattern is characteristic: external ear, eye and other facial abnormalities including cleft lip and palate, and anomalies of the distal limbs, heart, oesophagus, kidney and nervous system. The mechanism is straightforward — an embryo is entirely composed of rapidly dividing cells that need the guanosine nucleotides this drug blocks. Azathioprine is the immunosuppressant most often used instead, which is one of the few situations where the older drug in this batch is clearly preferred.',
      },
      {
        q: 'Is it used for lupus?',
        a: 'Very widely, and not under this licence. The Myfortic indication is prophylaxis of organ rejection in kidney transplant recipients, in combination with cyclosporine and corticosteroids, and nothing else. The lupus evidence comes from the Aspreva Lupus Management Study, which used mycophenolate mofetil. In induction it did not beat intravenous cyclophosphamide — response was 56.2% against 53.0% in 370 patients, and the paper states the study did not meet its objective. In maintenance it clearly beat azathioprine: treatment failure 16.4% against 32.4%, hazard ratio 0.44. Both of those are real results and neither was generated with this product.',
      },
      {
        q: 'Why do antibiotics change how well it works?',
        a: 'Because part of the dose is delivered twice. Mycophenolic acid is processed by the liver into an inactive glucuronide, sent out in bile, and then converted back to the active drug by bacteria in the gut, from where it is reabsorbed. That recycling produces a second peak in the blood six to twelve hours after a dose and contributes a substantial share of total exposure. Antibiotics that suppress gut bacteria interrupt it, and total drug exposure falls. It is one of the reasons transplant teams want to know about any antibiotic course, and it is an interaction that comes from the microbiome rather than from any enzyme in the patient.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Salvadori M et al. Enteric-coated mycophenolate sodium is therapeutically equivalent to mycophenolate mofetil in de novo renal transplant patients. Am J Transplant 2004;4:231-236',
        identifier: '10.1046/j.1600-6143.2003.00337.x',
        kind: 'doi',
      },
      {
        label:
          'Budde K et al. Enteric-coated mycophenolate sodium can be safely administered in maintenance renal transplant patients: results of a 1-year study. Am J Transplant 2004;4:237-243',
        identifier: '10.1046/j.1600-6143.2003.00321.x',
        kind: 'doi',
      },
      {
        label:
          'Appel GB et al. Mycophenolate mofetil versus cyclophosphamide for induction treatment of lupus nephritis. J Am Soc Nephrol 2009;20:1103-1112 (ALMS induction)',
        identifier: '10.1681/ASN.2008101028',
        kind: 'doi',
      },
      {
        label:
          'Dooley MA et al. Mycophenolate versus azathioprine as maintenance therapy for lupus nephritis. N Engl J Med 2011;365:1886-1895 (ALMS maintenance)',
        identifier: '10.1056/NEJMoa1014460',
        kind: 'doi',
      },
      {
        label: 'ALMS: Aspreva Lupus Management Study, induction and maintenance phases',
        identifier: 'NCT00377637',
        kind: 'nct',
      },
      {
        label:
          'DailyMed: MYFORTIC (mycophenolic acid) delayed-release tablets, Novartis — boxed warning, embryo-fetal toxicity data and Limitations of Use',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=eed26501-890d-4ff6-88e7-6dbea4726e53',
        kind: 'regulatory',
      },
      {
        label:
          'PubChem CID 6918995 — mycophenolate anion structure, formula and molecular weight (parent acid CID 446541)',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/6918995',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 7. Tacrolimus — fewer rejections than cyclosporine, more diabetes and more nephrotoxicity, and
  //    a chronic kidney injury that was called universal and then called overstated.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'tacrolimus',
    name: 'Tacrolimus',
    tradeName: 'Prograf / Astagraf XL / Envarsus XR / Protopic',
    sponsor:
      'Astellas Pharma, formerly Fujisawa Pharmaceutical, which isolated the compound from Streptomyces tsukubaensis in a soil sample from Tsukuba, Japan, in 1984. Prograf was approved in the United States in 1994; the molecule is now generic in its immediate-release form.',
    targetGene: 'FKBP1A, acting on PPP3CA/PPP3CB (calcineurin) and NFATC1/NFATC2',
    targetProtein:
      'FK506-binding protein 12 (FKBP12). The tacrolimus-FKBP12 complex, not tacrolimus itself, is what inhibits the phosphatase calcineurin and so prevents dephosphorylation of nuclear factor of activated T cells.',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1994,
    indication:
      'Prophylaxis of organ rejection in patients receiving allogeneic liver, kidney, heart or lung transplants, in combination with other immunosuppressants; and, as a topical ointment, moderate to severe atopic dermatitis in patients who have failed or cannot tolerate conventional therapies',
    patientFriendlyIndication:
      'Stopping the body rejecting a transplanted organ, and severe eczema that has not responded to steroid creams',
    anatomicalSite:
      'The cytoplasm of T lymphocytes, where the drug-protein complex blocks a phosphatase before the cell has committed to making interleukin-2',
    conditionContext: {
      conditionExplainer:
        'A T cell recognising a foreign organ has to convert that recognition into a decision: to divide, and to recruit other cells by releasing interleukin-2. That conversion runs through a calcium signal and an enzyme called calcineurin, which switches on the transcription factor that turns the interleukin-2 gene on.',
      whyItMatters:
        'Tacrolimus blocks that step, and it does so upstream of everything else in this batch — before the cell divides, before the antimetabolites would have any target. It halved corticosteroid-resistant rejection compared with cyclosporine and became the backbone of transplant immunosuppression. It also damages the kidney it is often protecting, causes diabetes, and has a therapeutic window narrow enough to require blood level monitoring for life.',
      whoTakesThis:
        'Recipients of liver, kidney, heart and lung transplants, generally for the rest of the graft’s life; people with severe eczema, as an ointment; and, off-licence, people with myasthenia gravis, membranous nephropathy and several other autoimmune conditions.',
      clinicalGoals:
        'Keep blood levels inside a narrow band that prevents rejection without poisoning the kidney or precipitating diabetes. Almost every clinical decision about this drug is about that trade, and it never resolves.',
    },
    oneSentenceVerdict:
      'A macrolide from a Japanese soil bacterium that binds FKBP12 and, as that complex, blocks calcineurin so T cells cannot switch on interleukin-2 — it reduced corticosteroid-resistant liver-transplant rejection from 82 to 43 patients out of 529 randomised against cyclosporine with identical one-year survival, gave the best kidney function and lowest rejection rate of four regimens in 1,645 kidney recipients, and caused new-onset diabetes or impaired fasting glucose in 33.6% against 26.0% on cyclosporine at six months.',
    laymanHowItWorks:
      'When an immune cell spots something foreign, calcium floods in and switches on an enzyme that releases the cell’s instruction to multiply and call for reinforcements. Tacrolimus does not touch that enzyme directly. It first grabs a small carrier protein inside the cell, and the pair of them together jam the enzyme. The instruction never gets sent, so the immune attack never assembles. The same carrier protein and the same enzyme exist in kidney and pancreas cells too, which is why the drug damages kidneys and raises blood sugar at doses close to the ones that protect the transplant.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 76,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.6591 per unit at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Discovered by Fujisawa in 1984 and approved in 1994; immediate-release tacrolimus capsules have been generic in the United States since 2009 and cost about 66 cents a unit. The extended-release products Astagraf XL and Envarsus XR remain separately branded and priced, and their claimed advantage is once-daily administration and a smoother concentration profile rather than a different molecule. Because the therapeutic window is narrow and the products are not bioequivalent to one another, substitution between tacrolimus formulations is a clinical decision requiring level monitoring, not a pharmacy one.',
      synthesisComplexity: 'High',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The direct alternative is cyclosporine, the other calcineurin inhibitor, and the honest comparison is a set of trades rather than a winner: tacrolimus gives fewer and less refractory rejections and better kidney function in the head-to-head trials, cyclosporine gives less diabetes and worse lipids. The mTOR inhibitors sirolimus and everolimus and the costimulation blocker belatacept exist largely to avoid calcineurin inhibition altogether, and each buys that with a different problem. Nothing sold as a food or supplement substitutes for transplant immunosuppression, and grapefruit and St John’s wort do the opposite of substituting: they change tacrolimus blood levels enough to cause rejection or toxicity.',
      conventionalRx: [
        {
          name: 'Cyclosporine',
          class: 'Calcineurin inhibitor, cyclic peptide',
          howItCompares:
            'Same target reached through a different intracellular partner, cyclophilin rather than FKBP12. In the 529-patient liver transplant trial, one-year patient survival was 88% in both arms; acute rejection occurred in 154 against 173 patients (P<0.002), corticosteroid-resistant rejection in 43 against 82 (P<0.001) and refractory rejection in 6 against 32 (P<0.001), favouring tacrolimus. In DIRECT, new-onset diabetes or impaired fasting glucose at six months was 26.0% on cyclosporine against 33.6% on tacrolimus (P=0.046), favouring cyclosporine.',
          typicalCost:
            'US$1.24 per unit at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: less new-onset diabetes. Cons: more rejection including steroid-resistant rejection, worse lipid profile, gum hypertrophy and hirsutism, and lower measured GFR in the four-arm comparison.',
        },
        {
          name: 'Sirolimus or everolimus',
          class: 'mTOR inhibitors',
          howItCompares:
            'Bind the same FKBP12 protein but then inhibit mTOR rather than calcineurin, so they suppress proliferation without the direct vascular effect on the kidney. In ELITE-Symphony, low-dose sirolimus performed worst of the four arms: biopsy-proven acute rejection 37.2% against 12.3% for low-dose tacrolimus, allograft survival 89.3% against 94.2%, and serious adverse events in 53.2% against 43.4% to 44.3% in the other arms.',
          typicalCost: 'Both are generic oral drugs in the United States',
          prosAndCons:
            'Pros: avoid calcineurin-mediated vasoconstriction of the kidney. Cons: impaired wound healing, proteinuria, mouth ulcers, pneumonitis, and clearly worse rejection and graft survival in the one large four-arm comparison.',
        },
        {
          name: 'Belatacept',
          class: 'Selective T-cell costimulation blocker, intravenous fusion protein',
          howItCompares:
            'Blocks the second signal a T cell needs rather than the calcium signal, and so avoids calcineurin nephrotoxicity entirely. It is contraindicated in Epstein-Barr-seronegative recipients because of post-transplant lymphoproliferative disease risk, which is a hard exclusion rather than a caution.',
          typicalCost:
            'Substantially more expensive than generic tacrolimus and requires monthly intravenous infusion indefinitely',
          prosAndCons:
            'Pros: better long-term measured kidney function, no drug-level monitoring, no diabetes signal of this size. Cons: infusion for life, higher rates of early acute rejection, and an absolute contraindication in EBV-seronegative patients.',
        },
        {
          name: 'Topical corticosteroids (for eczema)',
          class: 'Topical glucocorticoids',
          howItCompares:
            'The first-line comparison for the ointment formulation, which is licensed as second-line. Topical tacrolimus does not cause skin thinning, which is its main advantage on the face and in skin folds. In the JOELLE cohort, adults using moderate- to high-potency topical corticosteroids had a substantially higher incidence of cutaneous T-cell lymphoma than untreated subjects (IRR 10.66, 95% CI 2.60 to 43.75), a finding usually attributed to misdiagnosed early lymphoma being treated as eczema.',
          typicalCost:
            'US$0.1824 per unit for oral hydrocortisone at United States pharmacy acquisition cost; topical preparations are separate products and the over-the-counter 1% cream is inexpensive',
          prosAndCons:
            'Pros: cheaper, faster acting, decades of use. Cons: dermal atrophy, telangiectasia and striae with repeated use on thin skin, which is precisely where the calcineurin inhibitor ointments were developed to be used.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Do not eat grapefruit or take St John’s wort',
          action:
            'Avoid grapefruit and grapefruit juice entirely, and check any herbal product with the transplant team before taking it.',
          patientImpact:
            'Tacrolimus is cleared almost entirely by CYP3A4 and CYP3A5. Grapefruit inhibits intestinal CYP3A4 and can raise levels into the toxic range; St John’s wort induces CYP3A4 and can drop them low enough for the graft to be rejected.',
          clinicalPrecaution:
            'The therapeutic window is narrow enough that this is not a theoretical interaction. It applies to any CYP3A inhibitor or inducer, including some antifungals, some antibiotics and some anticonvulsants.',
        },
        {
          name: 'Treat sun protection as part of the treatment',
          action:
            'Use high-factor sun protection daily and have skin checked regularly, indefinitely.',
          patientImpact:
            'Skin cancer is the commonest malignancy after organ transplantation, and the risk rises with the duration and intensity of immunosuppression rather than with any single drug. The label carries a boxed warning for malignancies and serious infections.',
          clinicalPrecaution:
            'This applies to the systemic drug. For the topical ointment the label also advises minimising sun exposure, on the basis of animal photocarcinogenicity data rather than a demonstrated human effect.',
        },
        {
          name: 'Take it the same way every time and never switch product without being told',
          action:
            'Keep the timing consistent relative to food, and never accept a different tacrolimus product at the pharmacy without the transplant team knowing.',
          patientImpact:
            'Food substantially reduces tacrolimus absorption, and the immediate-release, extended-release and once-daily products are not interchangeable milligram for milligram. An unannounced switch can move blood levels enough to cause rejection or toxicity.',
          clinicalPrecaution:
            'This is a description of why level monitoring exists, not instruction about timing or amount. Both belong to the prescriber.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'C[C@@H]1C[C@@H]([C@@H]2[C@H](C[C@H]([C@@](O2)(C(=O)C(=O)N3CCCC[C@H]3C(=O)O[C@@H]([C@@H]([C@H](CC(=O)[C@@H](/C=C(/C1)\\C)CC=C)O)C)/C(=C/[C@@H]4CC[C@H]([C@@H](C4)OC)O)/C)O)C)OC)OC',
      chemicalFormula: 'C44H69NO12',
      molecularWeight: '804.00 g/mol',
      targetReceptorAffinity:
        'Binds FK506-binding protein 12 with high affinity; the resulting complex, not the free drug, inhibits calcineurin phosphatase activity. Roughly 100 times more potent than cyclosporine on a molar basis in mixed lymphocyte reaction assays. It is a 23-membered macrolide lactone with 14 stereocentres, which is why it is produced by fermentation rather than synthesis.',
      structureSource: {
        label:
          'PubChem CID 445643 (tacrolimus) — canonical SMILES, molecular formula C44H69NO12 and molecular weight 804 g/mol, re-checked against the PUG REST property endpoint',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/445643',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'tac-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Resolve the tautomers and confirm all fourteen stereocentres',
          description:
            'Tacrolimus exists in solution as an equilibrium of rotamers about the pipecolate amide, which broadens NMR signals and can be mistaken for impurity. Confirm the stereochemistry of all fourteen centres and check for the 8-epi and 19-epi isomers, which the fermentation produces and which have markedly lower activity.',
          reagentsAndBuffer:
            'Tacrolimus reference standard, variable-temperature 1H and 13C NMR in DMSO-d6 or benzene-d6 to coalesce rotamers, reversed-phase HPLC at elevated column temperature, high-resolution mass spectrometry',
        },
        {
          id: 'tac-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Fermentation of Streptomyces tsukubaensis',
          description:
            'Tacrolimus is a polyketide-nonribosomal peptide hybrid with a 23-membered macrolactone and fourteen stereocentres, and total synthesis is a research exercise rather than a manufacturing route. Production is by submerged fermentation of Streptomyces tsukubaensis, the organism isolated from a Tsukuba soil sample in 1984.',
          dependsOnStepId: 'tac-w1',
          reagentsAndBuffer:
            'Streptomyces tsukubaensis production strain, complex medium with glucose or soluble starch and soybean meal, controlled dissolved oxygen and pH over a multi-day fed-batch run, resin adsorption or solvent extraction for recovery',
        },
        {
          id: 'tac-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Chromatographic separation from ascomycin and the epimers',
          description:
            'Separate tacrolimus from the closely related fermentation products, principally ascomycin (FK520), which differs by a single substituent and is itself a drug scaffold, and from the 8-epi and 19-epi isomers. These co-metabolites are not removable by crystallisation alone.',
          dependsOnStepId: 'tac-w2',
          reagentsAndBuffer:
            'Silica and reversed-phase preparative chromatography, acetonitrile-water gradients, crystallisation from ethanol-water, LC-MS confirmation against ascomycin and epimer standards',
        },
        {
          id: 'tac-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'FKBP12 complex formation and calcineurin inhibition in T cells',
          description:
            'Confirm that the compound forms the ternary complex rather than merely binding FKBP12. This distinction is the whole pharmacology: rapamycin also binds FKBP12 with high affinity, and the resulting complex inhibits mTOR instead of calcineurin. An assay that measures only FKBP12 binding cannot tell the two apart.',
          dependsOnStepId: 'tac-w3',
          reagentsAndBuffer:
            'Recombinant human FKBP12, purified calcineurin A and B with calmodulin and calcium, RII phosphopeptide substrate with malachite green phosphate detection, rapamycin as a discriminating control, Jurkat T cells for the cellular arm',
        },
        {
          id: 'tac-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'NFAT nuclear translocation and interleukin-2 output',
          description:
            'Measure both the translocation of nuclear factor of activated T cells into the nucleus and the interleukin-2 the cell actually secretes. Reporting only IL-2 suppression conflates calcineurin inhibition with general toxicity; reporting only translocation misses whether the functional consequence follows.',
          dependsOnStepId: 'tac-w4',
          reagentsAndBuffer:
            'Anti-CD3 and anti-CD28 stimulated primary human T cells, NFAT nuclear translocation imaging or NFAT-luciferase reporter, IL-2 ELISA on culture supernatant, cyclosporine as a mechanistic comparator, viability counterscreen',
        },
      ],
    },
    keyAudits: [
      {
        id: 'tac-a1',
        category: 'measured',
        title: 'Liver transplantation: fewer refractory rejections, identical survival',
        laymanSummary:
          'Five hundred and twenty-nine liver transplant patients were randomly given tacrolimus or cyclosporine. The same proportion were alive a year later. But rejection that resisted steroid treatment happened half as often on tacrolimus, and rejection that resisted everything happened five times less often.',
        technicalDetails:
          'An open-label randomised multicentre trial assigned 478 adults and 51 children receiving a first liver transplant to tacrolimus (n=263) or cyclosporine (n=266) and followed them for a year. One-year patient survival was 88% in both groups (P=0.85, 95% CI for the difference -5.4 to +6.6) and graft survival 82% against 79% (P=0.55, 95% CI -4.8 to +9.7). Acute rejection occurred in 154 against 173 patients (P<0.002), corticosteroid-resistant rejection in 43 against 82 (P<0.001) and refractory rejection in 6 against 32 (P<0.001). Withdrawal for adverse events, primarily nephrotoxicity and neurotoxicity, was 37 against 13 patients (P<0.001).',
        evidenceSource: 'US Multicenter FK506 Liver Study Group, N Engl J Med 1994;331:1110-1115',
        doi: '10.1056/NEJM199410273311702',
        measuredMetric:
          'Patient and graft survival at one year, and rates of acute, corticosteroid-resistant and refractory rejection, against cyclosporine',
        auditFlag: 'verified',
      },
      {
        id: 'tac-a2',
        category: 'measured',
        title:
          'ELITE-Symphony: best kidney function, lowest rejection, best graft survival of four arms',
        laymanSummary:
          'A trial of 1,645 kidney transplant patients compared four regimens head to head. Low-dose tacrolimus came first on every measure that mattered: kidney function, rejection rate and graft survival. This is the trial that made it the default.',
        technicalDetails:
          'ELITE-Symphony randomised 1,645 renal transplant recipients to standard-dose cyclosporine with mycophenolate mofetil and corticosteroids, or to daclizumab induction with mycophenolate mofetil and corticosteroids plus low-dose cyclosporine, low-dose tacrolimus or low-dose sirolimus. Mean calculated glomerular filtration rate at 12 months, the primary endpoint, was 65.4 mL/min on low-dose tacrolimus against 56.7 to 59.4 in the other three arms. Biopsy-proven acute rejection was 12.3% against 25.8% for standard-dose cyclosporine, 24.0% for low-dose cyclosporine and 37.2% for low-dose sirolimus. Allograft survival differed across arms (P=0.02) and was highest on low-dose tacrolimus at 94.2%. Serious adverse events were commonest in the sirolimus arm at 53.2%.',
        evidenceSource: 'Ekberg H et al., N Engl J Med 2007;357:2562-2575 (NCT00231764)',
        doi: '10.1056/NEJMoa067411',
        measuredMetric:
          'Estimated glomerular filtration rate at 12 months, biopsy-proven acute rejection and allograft survival, four-arm randomised comparison',
        auditFlag: 'verified',
      },
      {
        id: 'tac-a3',
        category: 'failed',
        title: 'DIRECT: more new-onset diabetes than cyclosporine',
        laymanSummary:
          'A trial designed specifically to measure blood sugar problems found that a third of patients on tacrolimus had developed diabetes or pre-diabetes by six months, against a quarter on cyclosporine. The rejection rates were not significantly different.',
        technicalDetails:
          'DIRECT was a six-month, open-label, randomised multicentre study using American Diabetes Association and WHO criteria, in 682 de novo renal transplant patients (336 cyclosporine microemulsion with C2 monitoring, 346 tacrolimus), 567 of whom were non-diabetic at baseline, all with mycophenolic acid, steroids and basiliximab. The primary safety endpoint — new-onset diabetes after transplant or impaired fasting glucose at 6 months — occurred in 73 cyclosporine patients (26.0%) and 96 tacrolimus patients (33.6%, P=0.046). The primary efficacy endpoint of biopsy-proven acute rejection, graft loss or death was 12.8% against 9.8% (P=0.211). Mean GFR did not differ significantly (63.6 against 65.9 mL/min/1.73 m2, P=0.285) though serum creatinine did (139 against 133 micromol/L, P=0.005). Total cholesterol, LDL and triglycerides were significantly higher on cyclosporine.',
        evidenceSource: 'Vincenti F et al., DIRECT Investigators, Am J Transplant 2007;7:1506-1514',
        doi: '10.1111/j.1600-6143.2007.01749.x',
        measuredMetric:
          'New-onset diabetes after transplant or impaired fasting glucose at 6 months by ADA/WHO criteria, against cyclosporine',
        auditFlag: 'caution',
      },
      {
        id: 'tac-a4',
        category: 'conclusion_shift',
        title: 'Calcineurin nephrotoxicity: called almost universal, then called overstated',
        laymanSummary:
          'A landmark Australian study took kidney biopsies from transplant patients every year for a decade and found drug-related kidney damage in essentially all of them by ten years. That finding drove a generation of attempts to withdraw the drug. A rebuttal in the same journal argued the damage had been attributed to the drug when other causes fit as well.',
        technicalDetails:
          'Nankivell and colleagues obtained 961 protocol biopsies from 120 kidney-pancreas recipients from transplantation to ten years. They described two phases: early tubulointerstitial damage from ischaemic injury and rejection, present as mild disease in 94.2% by one year; then a later phase of microvascular and glomerular injury with progressive high-grade arteriolar hyalinosis accompanied by calcineurin inhibitor use, with nephrotoxicity "almost universal at 10 years, even in grafts with excellent early histologic findings". Severe chronic allograft nephropathy was present in 58.4% at ten years with sclerosis of 37.3% of glomeruli. Matas subsequently argued in the same journal that chronic progressive calcineurin nephrotoxicity is an overstated concept, on the grounds that arteriolar hyalinosis is not specific to calcineurin inhibitors, that donor age, hypertension and diabetes produce the same histology, and that trials of calcineurin withdrawal did not reliably improve long-term function.',
        evidenceSource:
          'Nankivell BJ et al., N Engl J Med 2003;349:2326-2333; Matas AJ, Am J Transplant 2011;11:687-692',
        doi: '10.1056/NEJMoa020009',
        inferredClaim:
          'That the arteriolar and glomerular damage seen on late protocol biopsies is caused by the calcineurin inhibitor — the histology is real and consistent, the attribution rests on association rather than on a randomised comparison, and it has been formally disputed in print',
        auditFlag: 'contested',
      },
      {
        id: 'tac-a5',
        category: 'inferred',
        title: 'A boxed malignancy warning on the ointment, from animal data and case reports',
        laymanSummary:
          'The eczema ointment carries a warning about lymphoma and skin cancer. It was added on the basis of animal studies and scattered case reports rather than a study showing it happens in people. A large European cohort later found a raised lymphoma rate in children, on very small numbers, and the authors themselves listed several explanations other than the drug.',
        technicalDetails:
          'The JOELLE cohort study across databases in the Netherlands, Denmark, Sweden and the United Kingdom included 19,948 children and 66,127 adults initiating topical tacrolimus, 23,840 children and 37,417 adults initiating pimecrolimus, 584,121 topical corticosteroid users and 257,074 untreated subjects. Lymphoma incidence per 100,000 person-years was 10.4 in children and 41.0 in adults on tacrolimus. The incidence rate ratio for lymphoma against topical corticosteroids was 3.74 (95% CI 1.00 to 14.06) in children and 1.27 (0.94 to 1.71) in adults. Adults using moderate- to high-potency topical corticosteroids had a markedly raised cutaneous T-cell lymphoma rate against untreated subjects (IRR 10.66, 95% CI 2.60 to 43.75), which points to reverse causation — early cutaneous lymphoma misdiagnosed and treated as eczema. The authors concluded that the low absolute incidence means that even a causal excess would be small per patient, and named residual confounding by eczema severity, increased monitoring and reverse causation as alternative explanations.',
        evidenceSource: 'Castellsague J et al., Clin Epidemiol 2018;10:299-310 (JOELLE)',
        doi: '10.2147/CLEP.S146442',
        inferredClaim:
          'That topical tacrolimus causes lymphoma — a boxed warning built on animal photocarcinogenicity and case reports, with the largest observational study finding a wide, barely significant ratio on very small numbers and offering three non-causal explanations for it',
        auditFlag: 'contested',
      },
      {
        id: 'tac-a6',
        category: 'measured',
        title: 'The window is narrow enough that food and grapefruit are clinical events',
        laymanSummary:
          'The gap between too little and too much is small, and both ends are serious: too little means the transplant is rejected, too much means the kidney is damaged. What a person ate, and which version of the tablet the pharmacy handed over, can move levels across that gap.',
        technicalDetails:
          'Tacrolimus is metabolised almost entirely by CYP3A4 and CYP3A5 and is a P-glycoprotein substrate, giving high inter-individual and intra-individual variability in exposure from the same dose. Food substantially reduces absorption. CYP3A5 expressers, more common in people of African ancestry, require substantially higher doses to reach the same trough concentration, and the label addresses this. Strong CYP3A inhibitors — azole antifungals, some macrolides, grapefruit — raise concentrations, and inducers such as rifampicin and St John’s wort lower them. Immediate-release, extended-release and once-daily formulations are not bioequivalent to one another. Whole-blood trough monitoring is therefore continuous and lifelong rather than an initial titration exercise.',
        evidenceSource:
          'PROGRAF (tacrolimus) United States prescribing information, Clinical Pharmacology, Drug Interactions and Dosage sections',
        measuredMetric:
          'Whole-blood trough concentration as the routine surrogate governing every dosing decision for this drug',
        auditFlag: 'verified',
      },
      {
        id: 'tac-a7',
        category: 'inferred',
        title: 'Trough concentration is a surrogate that has never been validated against outcomes',
        laymanSummary:
          'Every tacrolimus dose in the world is decided by a blood level taken just before the next dose. That single number is a convenient stand-in for total drug exposure, and no trial has shown that targeting one range rather than another changes how long grafts survive.',
        technicalDetails:
          'The trough concentration correlates reasonably with the area under the concentration-time curve, which is the exposure measure that pharmacology would prefer, but it is a single point on a curve. The target ranges in use were derived from early trial experience and from association studies relating troughs to rejection and toxicity, not from randomised comparisons of one target against another with graft survival as an endpoint. Randomised trials of genotype-guided initial dosing have shown faster attainment of target concentration without demonstrating better clinical outcomes, which illustrates the same gap: the surrogate can be hit more reliably without the thing the surrogate stands for improving. This does not mean monitoring is useless — the toxicity relationship is real — but the specific numbers are convention supported by association.',
        evidenceSource:
          'PROGRAF (tacrolimus) United States prescribing information, Dosage and Administration and Clinical Pharmacology sections; Ekberg H et al., N Engl J Med 2007;357:2562-2575',
        doi: '10.1056/NEJMoa067411',
        inferredClaim:
          'That the conventional trough target ranges are the ranges that maximise graft survival — they were derived from association and early experience, and no randomised comparison of target ranges against a hard endpoint has established them',
        auditFlag: 'caution',
      },
      {
        id: 'tac-a8',
        category: 'failed',
        title: 'Every attempt to get off it has cost something',
        laymanSummary:
          'If calcineurin inhibitors damage kidneys over years, the obvious answer is to stop using them. Every large trial that tried a substitute paid for it somewhere: more rejection with the mTOR inhibitors, an absolute contraindication and monthly infusions with the costimulation blocker.',
        technicalDetails:
          'In ELITE-Symphony the low-dose sirolimus arm — the calcineurin-free option — had biopsy-proven acute rejection of 37.2% against 12.3% for low-dose tacrolimus, allograft survival of 89.3% against 94.2%, a mean GFR of 56.7 to 59.4 rather than 65.4 mL/min, and serious adverse events in 53.2% against 43.4% to 44.3% elsewhere. Belatacept avoids calcineurin inhibition and produces better long-term measured renal function, at the cost of higher early acute rejection rates, indefinite monthly intravenous administration, and an absolute contraindication in Epstein-Barr-seronegative recipients because of post-transplant lymphoproliferative disease. Twenty years after the nephrotoxicity literature made calcineurin withdrawal an explicit goal, low-dose tacrolimus remains the standard, which is itself the finding.',
        evidenceSource:
          'Ekberg H et al., N Engl J Med 2007;357:2562-2575; PROGRAF United States prescribing information',
        doi: '10.1056/NEJMoa067411',
        measuredMetric:
          'Biopsy-proven acute rejection, allograft survival and GFR in the calcineurin-free arm of a four-arm randomised comparison',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A fungal-scale molecule that has to be fermented',
        laymanDesc:
          'Tacrolimus is far too complicated to build in a factory from simple chemicals. It is made by growing the bacterium that produces it naturally, in a soil organism found in Japan in 1984.',
        molecularDetail:
          'A 23-membered macrolide lactone of 804 g/mol with fourteen stereocentres, produced by Streptomyces tsukubaensis as a polyketide-nonribosomal peptide hybrid. Absorption is variable and substantially reduced by food; clearance is almost entirely through CYP3A4 and CYP3A5 with P-glycoprotein efflux.',
        iconName: 'FlaskConical',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Inside the T cell, it grabs a small carrier protein',
        laymanDesc:
          'On its own the drug does nothing useful. Its first move is to bind a small protein that is abundant inside cells, and that pair is the actual working unit.',
        molecularDetail:
          'Binds FK506-binding protein 12, a peptidyl-prolyl isomerase, forming a composite surface neither molecule has alone. Rapamycin binds the same protein and forms a different composite surface, which is why two drugs sharing an intracellular partner have entirely different targets.',
        iconName: 'Link',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The pair jams the enzyme that reads the calcium signal',
        laymanDesc:
          'When a T cell recognises something foreign, calcium floods in and switches on an enzyme. The drug-protein pair sits on that enzyme and stops it working.',
        molecularDetail:
          'The tacrolimus-FKBP12 complex binds at the interface of the calcineurin A catalytic and calcineurin B regulatory subunits, blocking substrate access to the phosphatase active site. Calcineurin is a calcium- and calmodulin-dependent serine-threonine phosphatase, and this inhibition is non-competitive with respect to substrate.',
        iconName: 'Ban',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The order to make interleukin-2 is never issued',
        laymanDesc:
          'That enzyme’s job is to unlock a transcription factor so it can enter the nucleus and turn on the gene for the immune system’s main recruitment signal. Blocked, the factor stays in the cytoplasm and the gene stays off.',
        molecularDetail:
          'Nuclear factor of activated T cells remains phosphorylated and cytoplasmic, so transcription of IL2, IL4, IFNG, TNF and CD40LG is not initiated. The block is at the earliest committed step of T-cell activation, upstream of the proliferation the antimetabolites in this batch act on.',
        iconName: 'Dna',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The transplant is not attacked, and less often needs rescuing',
        laymanDesc:
          'Rejection episodes happen less often than with the older drug in the class, and when they do happen they respond to steroids more often.',
        molecularDetail:
          'In 529 randomised liver transplant patients, corticosteroid-resistant rejection occurred in 43 against 82 and refractory rejection in 6 against 32 with cyclosporine. In 1,645 kidney recipients, biopsy-proven acute rejection was 12.3% on low-dose tacrolimus against 24.0% to 37.2% in the other three arms.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Calcineurin is also in the kidney and the pancreatic beta cell',
        laymanDesc:
          'The same enzyme does other jobs elsewhere. In the kidney it helps control the tone of small arteries; in the pancreas it is part of how insulin is produced. Blocking it there is where the two big harms come from.',
        molecularDetail:
          'Afferent arteriolar vasoconstriction produces acute, reversible falls in glomerular filtration; chronic exposure is associated with arteriolar hyalinosis, striped interstitial fibrosis and glomerulosclerosis, described as almost universal at ten years on protocol biopsy and subsequently disputed as an attribution. Calcineurin-NFAT signalling in the pancreatic beta cell supports insulin gene transcription and beta-cell mass, which is the mechanistic basis of the 33.6% against 26.0% new-onset diabetes finding.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'US Multicenter FK506 Liver Study (1994)',
        phase: 'Phase 3, randomised, open-label, multicentre, active-controlled',
        sampleSize: 529,
        primaryEndpoint: 'Patient and graft survival at one year after first liver transplant',
        endpointMet: true,
        statisticalPValue:
          'Patient survival 88% in both arms (P=0.85, 95% CI -5.4 to +6.6); graft survival 82% against 79% (P=0.55). Corticosteroid-resistant rejection 43 against 82 patients (P<0.001); refractory rejection 6 against 32 (P<0.001)',
        unreportedAdverseSignals:
          'Withdrawal for adverse events was 37 against 13 patients (P<0.001), primarily for nephrotoxicity and neurotoxicity. The primary endpoint was survival and it was identical; the rejection advantage is a secondary endpoint.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'ELITE-Symphony (NCT00231764)',
        phase: 'Phase 4, randomised, open-label, four-arm',
        sampleSize: 1645,
        primaryEndpoint:
          'Estimated glomerular filtration rate by Cockcroft-Gault at 12 months after renal transplantation',
        endpointMet: true,
        statisticalPValue:
          'Mean GFR 65.4 mL/min on low-dose tacrolimus against 56.7 to 59.4 in the other three arms; biopsy-proven acute rejection 12.3% against 24.0% to 37.2%; allograft survival 94.2%, P=0.02 across arms',
        unreportedAdverseSignals:
          'Open-label, and the four arms differ in more than one component — the standard-dose cyclosporine arm had no induction agent while the three low-dose arms all received daclizumab, so the comparison is between regimens rather than between drugs.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'DIRECT (Vincenti 2007)',
        phase: 'Phase 4, randomised, open-label, multicentre',
        sampleSize: 682,
        primaryEndpoint:
          'New-onset diabetes after transplant or impaired fasting glucose at 6 months, by ADA/WHO criteria',
        endpointMet: false,
        statisticalPValue:
          '33.6% on tacrolimus against 26.0% on cyclosporine microemulsion, P=0.046',
        unreportedAdverseSignals:
          'Open-label, six months only, and glucose endpoints in the first months after transplantation are heavily influenced by corticosteroid exposure, which was reported as similar between arms. Cyclosporine produced significantly worse lipids, which the diabetes headline tends to displace.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Nankivell protocol biopsy cohort (2003)',
        phase: 'Prospective protocol-biopsy cohort study, not randomised',
        sampleSize: 120,
        primaryEndpoint:
          'Natural history of chronic allograft nephropathy on serial protocol biopsy to ten years',
        endpointMet: true,
        statisticalPValue:
          '961 biopsies; mild chronic allograft nephropathy in 94.2% at one year, severe in 58.4% at ten years with 37.3% glomerulosclerosis; calcineurin inhibitor nephrotoxicity described as almost universal at ten years',
        unreportedAdverseSignals:
          'Observational, in 120 patients almost all of whom received simultaneous kidney-pancreas transplants for type 1 diabetes — a population with its own vascular risk. Attribution of the late arteriolar hyalinosis to the drug rather than to donor age, hypertension or diabetes has been formally disputed.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'One-year liver transplant patient survival 88% on both tacrolimus and cyclosporine in 529 randomised patients',
        'Corticosteroid-resistant rejection in 43 against 82 patients and refractory rejection in 6 against 32, favouring tacrolimus (both P<0.001)',
        'Mean GFR 65.4 mL/min against 56.7 to 59.4 and acute rejection 12.3% against 24.0% to 37.2% in 1,645 kidney recipients across four regimens',
        'New-onset diabetes or impaired fasting glucose 33.6% against 26.0% on cyclosporine at six months, P=0.046',
        'Withdrawal for adverse events in 37 against 13 liver transplant patients, primarily nephrotoxicity and neurotoxicity, P<0.001',
      ],
      unsupportedInferences: [
        'That late arteriolar hyalinosis and glomerulosclerosis on protocol biopsy are caused by the calcineurin inhibitor — an attribution disputed in print by the same journal',
        'That conventional trough target ranges are the ranges that maximise graft survival; they come from association and early experience, not from a randomised comparison of targets',
        'That the topical ointment causes lymphoma, on a boxed warning derived from animal data and case reports and an observational ratio of 3.74 with a lower bound of 1.00',
        'That the survival benefit follows from the rejection benefit — survival was identical in the trial that measured both',
      ],
      whatFailedInitially: [
        'DIRECT met its primary safety endpoint against tacrolimus: a third of patients developed diabetes or impaired fasting glucose by six months',
        'The calcineurin-free sirolimus arm of ELITE-Symphony was worst of four on rejection, graft survival, kidney function and serious adverse events',
        'Nephrotoxicity and neurotoxicity forced nearly three times as many withdrawals as cyclosporine in the pivotal liver trial',
        'Twenty years of trying to withdraw calcineurin inhibitors on nephrotoxicity grounds has not displaced low-dose tacrolimus as the standard',
      ],
      realWorldOutcome: [
        'The backbone of transplant immunosuppression worldwide since ELITE-Symphony reported in 2007',
        'Generic immediate-release capsules cost about 66 cents a unit at United States pharmacy acquisition cost',
        'Lifelong whole-blood trough monitoring is standard, making this one of very few chronic drugs whose dose is set by a laboratory number rather than by a schedule',
        'The topical ointment remains second-line for eczema on thin skin, carrying a boxed warning whose evidential basis is still contested',
      ],
    },
    deliverySystem: {
      type: 'Immediate-release oral capsules, granules for oral suspension, extended-release capsules and tablets, intravenous solution, and 0.03% and 0.1% topical ointment',
      description:
        'Oral absorption is incomplete and highly variable between people and within the same person, and is substantially reduced by food. Clearance is almost entirely hepatic and intestinal CYP3A4 and CYP3A5, with P-glycoprotein efflux, so any CYP3A inhibitor or inducer moves concentrations. The immediate-release, extended-release and once-daily products are not bioequivalent to one another and are not interchangeable milligram for milligram. The topical ointment exploits the molecule’s size: at 804 g/mol it penetrates inflamed skin adequately and intact skin poorly, which limits systemic absorption as the barrier repairs.',
      safetyProfile:
        'Boxed warning for malignancies and serious infections due to immunosuppression, including lymphoma; for the extended-release products, an additional boxed warning against use in liver transplant recipients because of increased mortality in female patients in a trial. Nephrotoxicity is dose-related and both acute and chronic. New-onset diabetes after transplantation occurred in 33.6% against 26.0% on cyclosporine in a dedicated trial. Neurotoxicity ranges from tremor and headache to posterior reversible encephalopathy syndrome. Hyperkalaemia, hypertension, hypomagnesaemia, QT prolongation, pure red cell aplasia and anaphylaxis to the intravenous vehicle are all labelled. The topical ointment carries a boxed warning about long-term safety and reported cases of lymphoma and skin malignancy.',
    },
    commonQuestions: [
      {
        q: 'Why do I need blood tests forever?',
        a: 'Because the gap between too little and too much is narrow, and both ends are serious. Below the target range the graft can be rejected; above it the kidney is damaged. Tacrolimus absorption varies a great deal between people and even within the same person from week to week, it is cut substantially by food, and it is cleared by an enzyme system that dozens of other drugs and grapefruit interfere with. Genetics matter too: people who express the CYP3A5 enzyme need substantially more drug to reach the same level, and that is on the label. The blood level is measured just before a dose, which is called a trough, and every dose decision is made from it.',
        auditNote:
          'The trough is a surrogate for total exposure and the target ranges come from association studies and early trial experience, not from randomised comparisons of one target against another with graft survival as the endpoint.',
      },
      {
        q: 'Is tacrolimus better than cyclosporine?',
        a: 'On rejection, clearly. On everything, no. The 529-patient liver transplant trial found identical one-year survival — 88% in both arms — while corticosteroid-resistant rejection occurred in 43 patients on tacrolimus against 82 on cyclosporine, and refractory rejection in 6 against 32. In the four-arm kidney trial, low-dose tacrolimus gave the best kidney function, the lowest rejection rate and the best graft survival. Against that, DIRECT found new-onset diabetes or impaired fasting glucose in 33.6% on tacrolimus against 26.0% on cyclosporine, and the pivotal liver trial had nearly three times as many withdrawals for adverse events, mostly nephrotoxicity and neurotoxicity. It is a better drug on the endpoint transplantation cares most about and a worse one on metabolic harm.',
      },
      {
        q: 'Does it damage the kidney it is meant to protect?',
        a: 'The acute effect is not in doubt: tacrolimus constricts the small artery entering the filtering unit of the kidney, which lowers filtration and is reversible. The chronic question is genuinely contested. A study that took nearly a thousand protocol biopsies from 120 patients over ten years described calcineurin inhibitor nephrotoxicity as almost universal by ten years, even in grafts that looked excellent early on. That finding drove two decades of attempts to withdraw the drug. A rebuttal published in the same journal argued the concept is overstated: the arteriolar hyalinosis being attributed to the drug is not specific to it, donor age, hypertension and diabetes produce the same picture, and calcineurin withdrawal trials did not reliably improve long-term function. Both positions are in the literature and neither has been settled by a randomised comparison.',
      },
      {
        q: 'Why can I not eat grapefruit?',
        a: 'Because grapefruit inhibits the enzyme in the gut wall that would otherwise destroy a large part of each dose before it reaches the bloodstream. Removing that first-pass destruction can raise tacrolimus concentrations substantially, and this is a drug where a substantial rise means kidney injury, tremor and, at the extreme, encephalopathy. The interaction runs the other way too: St John’s wort and rifampicin induce the same enzyme and can drop levels far enough for the graft to be rejected. This is why transplant teams want to know about every new medicine, including things bought without a prescription.',
      },
      {
        q: 'Is the eczema ointment dangerous?',
        a: 'It carries a boxed warning about lymphoma and skin cancer, and the evidence behind that warning is weaker than the warning’s prominence suggests. It was added on the basis of animal studies and case reports. The largest observational study, covering nearly 20,000 children and 66,000 adults starting topical tacrolimus across four European countries, found a lymphoma incidence rate ratio against topical steroids of 3.74 in children with a confidence interval from 1.00 to 14.06, and 1.27 in adults. The same study found that adults on potent topical steroids had ten times the cutaneous T-cell lymphoma rate of untreated people, which strongly suggests that early lymphoma being mistaken for eczema explains part of the signal in both groups. The authors named residual confounding, monitoring and reverse causation as explanations. The absolute rate is about 10 lymphomas per 100,000 child-years.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'US Multicenter FK506 Liver Study Group. A comparison of tacrolimus (FK 506) and cyclosporine for immunosuppression in liver transplantation. N Engl J Med 1994;331:1110-1115',
        identifier: '10.1056/NEJM199410273311702',
        kind: 'doi',
      },
      {
        label:
          'Ekberg H et al. Reduced exposure to calcineurin inhibitors in renal transplantation. N Engl J Med 2007;357:2562-2575 (ELITE-Symphony)',
        identifier: '10.1056/NEJMoa067411',
        kind: 'doi',
      },
      {
        label:
          'Vincenti F et al. Results of an international, randomized trial comparing glucose metabolism disorders and outcome with cyclosporine versus tacrolimus. Am J Transplant 2007;7:1506-1514 (DIRECT)',
        identifier: '10.1111/j.1600-6143.2007.01749.x',
        kind: 'doi',
      },
      {
        label:
          'Nankivell BJ et al. The natural history of chronic allograft nephropathy. N Engl J Med 2003;349:2326-2333',
        identifier: '10.1056/NEJMoa020009',
        kind: 'doi',
      },
      {
        label:
          'Matas AJ. Chronic progressive calcineurin nephrotoxicity: an overstated concept. Am J Transplant 2011;11:687-692',
        identifier: '10.1111/j.1600-6143.2011.03505.x',
        kind: 'doi',
      },
      {
        label:
          'Castellsague J et al. A cohort study on the risk of lymphoma and skin cancer in users of topical tacrolimus, pimecrolimus, and corticosteroids (JOELLE). Clin Epidemiol 2018;10:299-310',
        identifier: '10.2147/CLEP.S146442',
        kind: 'doi',
      },
      {
        label: 'ELITE-Symphony: efficacy limiting toxicity elimination in renal transplantation',
        identifier: 'NCT00231764',
        kind: 'nct',
      },
      {
        label: 'PubChem CID 445643 — tacrolimus structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/445643',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 8. Cyclosporine — the drug that created modern transplantation, then lost to its successor in
  //    a four-arm trial, failed a 970-patient heart-attack trial, and had its eye-drop patents
  //    transferred to a sovereign tribe to keep generics out.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'cyclosporine',
    name: 'Cyclosporine',
    tradeName: 'Sandimmune / Neoral / Gengraf / Restasis / Cequa / Verkazia',
    sponsor:
      'Novartis, formerly Sandoz, which isolated the compound in 1970 from the fungus Tolypocladium inflatum found in a Norwegian soil sample. Sandimmune was approved in 1983; the ophthalmic emulsion Restasis was developed by Allergan.',
    targetGene: 'PPIA (cyclophilin A), acting on PPP3CA/PPP3CB (calcineurin) and NFATC1/NFATC2',
    targetProtein:
      'Cyclophilin A. As with tacrolimus, the drug-protein complex rather than the drug is the inhibitor: the cyclosporine-cyclophilin complex blocks calcineurin, preventing dephosphorylation of nuclear factor of activated T cells.',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1983,
    indication:
      'Prophylaxis of organ rejection in kidney, liver and heart transplantation; severe active rheumatoid arthritis unresponsive to methotrexate; severe recalcitrant plaque psoriasis in non-immunocompromised adults who have failed at least one systemic therapy; and, as an ophthalmic emulsion, increased tear production in patients whose tear production is presumed suppressed by ocular inflammation',
    patientFriendlyIndication:
      'Preventing rejection of a transplanted organ, severe rheumatoid arthritis and psoriasis, and chronic dry eye',
    anatomicalSite:
      'The cytoplasm of T lymphocytes. For the ophthalmic emulsion, the conjunctiva and lacrimal gland surface, where the intended effect is local and systemic blood levels are below the limit of quantification.',
    conditionContext: {
      conditionExplainer:
        'Before 1978, a transplanted kidney from an unrelated donor was rejected more often than not, and the only drugs available — azathioprine and steroids — suppressed the whole immune system indiscriminately. Cyclosporine acted on the T cell specifically, and it did so at the moment of activation.',
      whyItMatters:
        'This is the drug that turned transplantation from an experiment into a service. One-year kidney graft survival in the pivotal Canadian trial was 80.4% against 64.0% on the old regimen. It is also the drug that established that calcineurin inhibition damages the kidney, and it has since been beaten by tacrolimus on nearly every transplant endpoint measured head to head.',
      whoTakesThis:
        'Transplant recipients, though far fewer than in the 1990s; people with severe psoriasis or rheumatoid arthritis; people with severe steroid-refractory ulcerative colitis; and, in a completely different formulation and at a completely different scale, millions of people with chronic dry eye.',
      clinicalGoals:
        'In transplantation, prevent rejection while limiting the kidney damage and hypertension the drug itself causes. In dry eye, raise tear production measurably. The two uses share a molecule and almost nothing else.',
    },
    oneSentenceVerdict:
      'A cyclic fungal peptide that binds cyclophilin and, as that complex, blocks calcineurin so T cells cannot transcribe interleukin-2 — it raised one-year kidney graft survival from 64.0% to 80.4% in 209 randomised patients and created modern transplantation, then came last or second-last on kidney function, rejection and graft survival against tacrolimus in a 1,645-patient four-arm trial, and failed outright in a 970-patient trial of reperfusion injury after heart attack (59.0% against 58.1%, odds ratio 1.04, 95% CI 0.78 to 1.39).',
    laymanHowItWorks:
      'When an immune cell recognises a transplanted organ as foreign, a calcium signal switches on an enzyme that releases the cell’s call for reinforcements. Cyclosporine first binds a small protein inside the cell called cyclophilin, and the two of them together block that enzyme. The call is never made, and the attack never assembles. It reaches the same enzyme by a different route than tacrolimus does, through a different partner protein, which is why the two drugs share a mechanism and differ in their side effects. The same enzyme regulates blood vessel tone in the kidney, which is where the drug’s main harm comes from.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 69,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$1.24 per unit at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'The oral formulations have been generic since the 1990s. The ophthalmic emulsion is a different story and is one of the clearest patent cases in modern pharmacy: in September 2017 Allergan assigned the Restasis patents to the Saint Regis Mohawk Tribe and licensed them back, with the stated aim of asserting tribal sovereign immunity against inter partes review at the Patent Trial and Appeal Board. The Federal Circuit held in 2018 that tribal sovereign immunity does not apply to inter partes review, the patents were separately held invalid in district court, and the first generic ophthalmic cyclosporine emulsion was approved in February 2022 — more than twenty years after the pivotal trials.',
      synthesisComplexity: 'High',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'In transplantation the substitute is tacrolimus, and the head-to-head evidence favours it on rejection, kidney function and graft survival, while cyclosporine causes less new-onset diabetes and worse lipids. In psoriasis and rheumatoid arthritis the biologics have largely displaced it. In severe steroid-refractory ulcerative colitis the modern comparison is infliximab, and the two have been found broadly similar. For dry eye the alternatives are artificial tears, lifitegrast, and now generic ophthalmic cyclosporine itself. Nothing sold as a food or supplement substitutes for immunosuppression, and grapefruit and St John’s wort move cyclosporine levels enough to matter.',
      conventionalRx: [
        {
          name: 'Tacrolimus',
          class: 'Calcineurin inhibitor, macrolide',
          howItCompares:
            'Same target through a different intracellular partner. In the 1,645-patient ELITE-Symphony trial, low-dose tacrolimus gave a mean GFR of 65.4 mL/min against 56.7 to 59.4 for the cyclosporine arms, biopsy-proven acute rejection of 12.3% against 24.0% and 25.8%, and allograft survival of 94.2% against 93.1% and 89.3%. Against that, DIRECT found new-onset diabetes or impaired fasting glucose in 26.0% on cyclosporine against 33.6% on tacrolimus, and significantly better lipids on tacrolimus.',
          typicalCost:
            'US$0.6591 per unit at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: better on rejection, kidney function and graft survival in the largest head-to-head comparison. Cons: more new-onset diabetes, more neurotoxicity.',
        },
        {
          name: 'Azathioprine with corticosteroids',
          class: 'The regimen cyclosporine replaced',
          howItCompares:
            'The comparator in the 1983 Canadian trial: one-year predicted graft survival 64.0% against 80.4% with cyclosporine (P=0.003), and predicted patient survival 86.4% against 96.6%. That single comparison is the historical basis for the whole calcineurin inhibitor class.',
          typicalCost:
            'US$0.1249 per azathioprine tablet at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: no nephrotoxicity, no drug-level monitoring, far cheaper. Cons: markedly worse graft survival, which is the reason it stopped being the backbone in 1983.',
        },
        {
          name: 'Infliximab (for severe steroid-refractory ulcerative colitis)',
          class: 'Anti-TNF monoclonal antibody',
          howItCompares:
            'The modern alternative to intravenous cyclosporine as rescue therapy. The cyclosporine evidence rests on a 20-patient randomised trial from 1994 in which 9 of 11 responded against 0 of 9 on placebo — a striking result on a very small denominator, in a setting where the alternative was immediate colectomy.',
          typicalCost:
            'Substantially more expensive per course than cyclosporine even after biosimilar entry',
          prosAndCons:
            'Pros: no nephrotoxicity, no drug-level monitoring, transitions more naturally to maintenance therapy. Cons: cost, and contraindicated in undiagnosed infection.',
        },
        {
          name: 'Lifitegrast or artificial tears (for dry eye)',
          class: 'LFA-1 antagonist eye drop, or lubricant',
          howItCompares:
            'The cyclosporine emulsion’s pivotal evidence is two identical 6-month trials in 877 patients showing significantly greater improvement than vehicle in two objective signs — corneal staining and categorised Schirmer values — with no dose-response between the 0.05% and 0.1% strengths. Artificial tears treat the symptom without acting on inflammation; lifitegrast acts on a different inflammatory step.',
          typicalCost:
            'Generic ophthalmic cyclosporine emulsion has been available in the United States since February 2022; artificial tears are inexpensive and sold over the counter',
          prosAndCons:
            'Pros of the emulsion: acts on the inflammation presumed to suppress tear production rather than replacing tears. Cons: burning on instillation is the commonest complaint, and the effect takes months.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Avoid grapefruit, and check every new medicine',
          action:
            'Do not take grapefruit or grapefruit juice, and clear any new prescription, over-the-counter product or herbal remedy with the transplant team.',
          patientImpact:
            'Cyclosporine is cleared by CYP3A4 and is a P-glycoprotein substrate. Grapefruit inhibits intestinal CYP3A4 and raises levels; St John’s wort and rifampicin induce it and can lower levels far enough for rejection.',
          clinicalPrecaution:
            'The interaction list is long and includes statins, where cyclosporine raises exposure enough to cause rhabdomyolysis. This is a description of why monitoring exists, not dosing advice.',
        },
        {
          name: 'Have blood pressure and kidney function checked, not just drug levels',
          action:
            'Ask that blood pressure and creatinine are tracked alongside the drug level, and raise any new swelling or reduced urine output.',
          patientImpact:
            'Hypertension and nephrotoxicity are the two dose-related harms that define this drug. In the pivotal Canadian trial serum creatinine at 90 days was 2.6 mg/dL on cyclosporine against 2.0 on the older regimen (P=0.03) — the nephrotoxicity was visible in the trial that established the benefit.',
          clinicalPrecaution:
            'The acute component is reversible; the chronic component is the subject of a long-running dispute in the transplant literature and is discussed on this page.',
        },
        {
          name: 'Expect gum swelling and increased body hair, and mention them',
          action:
            'Report gum overgrowth and excessive hair growth rather than assuming they cannot be addressed.',
          patientImpact:
            'Gingival hyperplasia and hypertrichosis are characteristic of cyclosporine and not of tacrolimus, and both are cosmetically significant enough to affect whether people keep taking the drug.',
          clinicalPrecaution:
            'Gum overgrowth is worsened by poor oral hygiene and by concurrent calcium channel blockers, and dental review helps. Whether to switch drugs is a transplant team decision.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CC[C@H]1C(=O)N(CC(=O)N([C@H](C(=O)N[C@H](C(=O)N([C@H](C(=O)N[C@H](C(=O)N[C@@H](C(=O)N([C@H](C(=O)N([C@H](C(=O)N([C@H](C(=O)N([C@H](C(=O)N1)[C@@H]([C@H](C)C/C=C/C)O)C)C(C)C)C)CC(C)C)C)CC(C)C)C)C)C)CC(C)C)C)C(C)C)CC(C)C)C)C',
      chemicalFormula: 'C62H111N11O12',
      molecularWeight: '1202.60 g/mol',
      targetReceptorAffinity:
        'Binds cyclophilin A with high affinity; the resulting complex inhibits calcineurin phosphatase. Roughly 100-fold less potent than tacrolimus on a molar basis in mixed lymphocyte reaction assays. The stored structure is declared as a SMILES connection table rather than a peptide sequence because cyclosporine is an eleven-residue cyclic undecapeptide containing seven N-methylated residues and the non-proteinogenic residue MeBmt, none of which can be written in one-letter code.',
      structureSource: {
        label:
          'PubChem CID 5284373 (cyclosporin A) — canonical SMILES, molecular formula C62H111N11O12 and molecular weight 1202.6 g/mol, re-checked against the PUG REST property endpoint',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5284373',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'csa-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the MeBmt residue and the seven N-methylations',
          description:
            'Verify the unusual residue at position 1 — (4R)-4-[(E)-2-butenyl]-4-methyl-L-threonine, universally abbreviated MeBmt — and the pattern of N-methylation across the ring. Cyclosporins B through I differ from cyclosporin A by single residues and are co-produced by the same fungus; they are not separable by molecular formula alone in every case.',
          reagentsAndBuffer:
            'Cyclosporin A reference standard, high-temperature reversed-phase HPLC to sharpen the conformer-broadened peaks, high-resolution LC-MS/MS, 1H NMR in benzene-d6 at elevated temperature',
        },
        {
          id: 'csa-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Fermentation of Tolypocladium inflatum',
          description:
            'Cyclosporine is a non-ribosomal peptide assembled by a single 1.6-megadalton synthetase enzyme in the fungus, and it is produced commercially by fermentation. Total synthesis has been achieved and is not a manufacturing route: eleven residues, seven N-methylations, a macrocyclisation and a non-proteinogenic amino acid make it uncompetitive with the mould.',
          dependsOnStepId: 'csa-w1',
          reagentsAndBuffer:
            'Tolypocladium inflatum production strain, glucose and casein peptone medium with L-valine feeding to favour cyclosporin A over the other congeners, extended fed-batch fermentation, solvent extraction into ethyl acetate or butyl acetate',
        },
        {
          id: 'csa-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Separate cyclosporin A from congeners B through I',
          description:
            'Resolve the target from the other naturally co-produced cyclosporins, several of which are substantially less active but chromatographically close. This separation, and the fact that the peptide adopts multiple slowly interconverting conformations that broaden chromatographic peaks, is what makes purification the cost-determining step.',
          dependsOnStepId: 'csa-w2',
          reagentsAndBuffer:
            'Silica gel and preparative reversed-phase chromatography at 60 to 80 degrees C to sharpen conformer peaks, acetonitrile-water gradients, crystallisation from acetone-hexane, LC-MS against congener standards',
        },
        {
          id: 'csa-w4',
          stepNumber: 4,
          phase: 'Conjugation',
          name: 'Formulate as a self-microemulsifying preparation',
          description:
            'The molecule is highly lipophilic and essentially insoluble in water, and the original oil-based Sandimmune formulation gave erratic absorption dependent on bile flow. The Neoral microemulsion preformulation was developed to make absorption reproducible. The two are not bioequivalent and the label treats them as different products, which is why the formulation is a pharmacological step and not a packaging one.',
          dependsOnStepId: 'csa-w3',
          reagentsAndBuffer:
            'Corn oil mono- and diglycerides, polyoxyl 40 hydrogenated castor oil or similar non-ionic surfactant, ethanol and propylene glycol co-solvents, droplet-size measurement on aqueous dispersion, comparative dissolution and bioavailability testing',
        },
        {
          id: 'csa-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Calcineurin inhibition with a cyclophilin-dependence control',
          description:
            'Measure calcineurin phosphatase inhibition in the presence and absence of cyclophilin. Free cyclosporine does not inhibit calcineurin; only the complex does. An assay run without cyclophilin will report the drug as inactive, and one run without that control cannot distinguish complex-mediated inhibition from direct enzyme poisoning.',
          dependsOnStepId: 'csa-w4',
          reagentsAndBuffer:
            'Recombinant human cyclophilin A, purified calcineurin A and B with calmodulin and calcium, RII phosphopeptide substrate with malachite green detection, tacrolimus with FKBP12 as a parallel mechanistic control, anti-CD3 stimulated T cells with IL-2 ELISA',
        },
      ],
    },
    keyAudits: [
      {
        id: 'csa-a1',
        category: 'measured',
        title: 'The 1983 trial that created modern transplantation',
        laymanSummary:
          'Two hundred and nine people receiving a kidney from a deceased donor were randomly given the new drug or the existing combination. Four out of five kept the kidney for a year on cyclosporine, against roughly two out of three on the old regimen. Transplantation stopped being an experiment.',
        technicalDetails:
          'The Canadian Multicentre Transplant Study Group randomised 209 recipients of cadaveric renal transplants to cyclosporine with prednisone or to standard therapy with azathioprine and prednisone. Predicted graft survival at one year was 80.4% against 64.0% (P=0.003) and predicted patient survival 96.6% against 86.4%. The trial also recorded the drug’s cost in the same paper: serum creatinine at 90 days was 2.6 mg/dL on cyclosporine against 2.0 on standard therapy (P=0.03), and graft survival on cyclosporine was worse where cold ischaemia exceeded 24 hours (70% against 88%, P=0.005) or the anastomosis took longer than 45 minutes (60% against 89%, P=0.002) — an interaction between the drug’s nephrotoxicity and pre-existing ischaemic injury.',
        evidenceSource:
          'Canadian Multicentre Transplant Study Group, N Engl J Med 1983;309:809-815',
        doi: '10.1056/NEJM198310063091401',
        measuredMetric:
          'Predicted graft and patient survival at one year, against azathioprine and prednisone',
        auditFlag: 'verified',
      },
      {
        id: 'csa-a2',
        category: 'failed',
        title: 'ELITE-Symphony: beaten by tacrolimus on every endpoint that mattered',
        laymanSummary:
          'A four-arm trial in 1,645 kidney recipients compared two cyclosporine regimens against low-dose tacrolimus and low-dose sirolimus. Both cyclosporine arms came out behind tacrolimus on kidney function, rejection and graft survival. This is the trial that ended cyclosporine’s status as the default.',
        technicalDetails:
          'Mean calculated glomerular filtration rate at 12 months, the primary endpoint, was 65.4 mL/min on low-dose tacrolimus against a range of 56.7 to 59.4 in the other three arms, which included standard-dose and low-dose cyclosporine. Biopsy-proven acute rejection was 25.8% on standard-dose cyclosporine and 24.0% on low-dose cyclosporine, against 12.3% on low-dose tacrolimus. Allograft survival differed significantly across arms (P=0.02): 93.1% low-dose cyclosporine, 89.3% standard-dose cyclosporine, 94.2% low-dose tacrolimus. The standard-dose cyclosporine arm was the only one without daclizumab induction, so it is a comparison of regimens rather than of molecules — but the low-dose cyclosporine arm, which did receive induction, still trailed tacrolimus on all three measures.',
        evidenceSource: 'Ekberg H et al., N Engl J Med 2007;357:2562-2575 (NCT00231764)',
        doi: '10.1056/NEJMoa067411',
        measuredMetric:
          'GFR at 12 months, biopsy-proven acute rejection and allograft survival, four-arm randomised comparison',
        auditFlag: 'verified',
      },
      {
        id: 'csa-a3',
        category: 'conclusion_shift',
        title: 'CIRCUS: a promising 58-patient pilot that a 970-patient trial demolished',
        laymanSummary:
          'A small trial suggested that giving cyclosporine just before opening a blocked coronary artery limited the damage to the heart muscle. It was published in a major journal and generated a decade of work. The definitive trial randomised 970 patients and found no difference at all in anything.',
        technicalDetails:
          'The pilot randomised 58 patients with ST-elevation myocardial infarction to an intravenous cyclosporine bolus of 2.5 mg/kg or saline before percutaneous coronary intervention. Creatine kinase release was significantly lower (P=0.04) and infarct mass on day-5 MRI in a 27-patient subgroup was 37 g against 46 g (P=0.04), though troponin I release was not significantly different (P=0.15). The authors described the data as preliminary and requiring confirmation. CIRCUS then randomised 970 patients with anterior STEMI, of whom 395 and 396 were evaluable, to the same intervention. The primary composite outcome at one year occurred in 59.0% against 58.1% (odds ratio 1.04, 95% CI 0.78 to 1.39, P=0.77). Cyclosporine did not reduce any separate component, including recurrent infarction, unstable angina and stroke, and did not prevent adverse left ventricular remodelling. Safety profiles did not differ.',
        evidenceSource:
          'Piot C et al., N Engl J Med 2008;359:473-481; Cung TT et al., N Engl J Med 2015;373:1021-1031 (CIRCUS, NCT01502774)',
        doi: '10.1056/NEJMoa1505489',
        inferredClaim:
          'That inhibiting the mitochondrial permeability transition pore limits reperfusion injury in humans — a mechanism supported by a biomarker and an imaging endpoint in 58 patients, and refuted on clinical outcomes in 970',
        auditFlag: 'verified',
      },
      {
        id: 'csa-a4',
        category: 'measured',
        title: 'Severe ulcerative colitis: 9 of 11 against 0 of 9, in twenty patients',
        laymanSummary:
          'Twenty people with ulcerative colitis so severe that steroids had failed and surgery was next were given intravenous cyclosporine or a placebo. Nine of eleven on the drug responded within about a week. None of nine on placebo did. It is one of the smallest trials that ever changed a standard of care.',
        technicalDetails:
          'A randomised, double-blind, controlled trial gave intravenous cyclosporine 4 mg/kg/day or placebo by continuous infusion to 20 patients with severe ulcerative colitis unimproved after at least 7 days of intravenous corticosteroids. Response, defined as symptom-score improvement allowing hospital discharge on oral medication, occurred in 9 of 11 (82%) on cyclosporine within a mean of seven days against 0 of 9 on placebo (P<0.001). Mean clinical activity score fell from 13 to 6 against 14 to 13. All five placebo non-responders who subsequently received open cyclosporine responded. Failure to respond meant colectomy, which is why the placebo arm could not be continued and why the trial is this small.',
        evidenceSource: 'Lichtiger S et al., N Engl J Med 1994;330:1841-1845',
        doi: '10.1056/NEJM199406303302601',
        measuredMetric:
          'Clinical response permitting discharge on oral therapy, against placebo, in steroid-refractory disease',
        auditFlag: 'caution',
      },
      {
        id: 'csa-a5',
        category: 'inferred',
        title:
          'The dry eye result is a sign, and the symptom evidence is thinner than the marketing',
        laymanSummary:
          'The eye-drop trials measured how much the eye stained with dye and how far a paper strip wetted. Both improved against the vehicle. The things patients actually notice — burning, grittiness, dryness — mostly did not separate, and doubling the concentration did nothing at all.',
        technicalDetails:
          'Two identical multicentre, randomised, double-masked, vehicle-controlled six-month trials in 877 patients with moderate to severe dry eye compared cyclosporine ophthalmic emulsion 0.05% and 0.1% against vehicle. Both strengths gave significantly greater improvement than vehicle in two objective signs — corneal staining and categorised Schirmer values — at P at or below 0.05. The 0.05% strength additionally improved three subjective measures: blurred vision, need for concomitant artificial tears and the physician’s global response evaluation. The remaining subjective measures, including the Ocular Surface Disease Index and the patient rating scale, are not among the endpoints reported as significant. There was no dose-response effect between 0.05% and 0.1%, which is unusual for a real pharmacological effect and is a finding the paper reports plainly.',
        evidenceSource: 'Sall K et al., CsA Phase 3 Study Group, Ophthalmology 2000;107:631-639',
        doi: '10.1016/s0161-6420(99)00176-1',
        inferredClaim:
          'That an improvement in corneal staining and Schirmer score is an improvement in dry eye as a patient experiences it — the objective signs separated from vehicle, most patient-reported measures did not, and there was no dose-response',
        auditFlag: 'contested',
      },
      {
        id: 'csa-a6',
        category: 'conclusion_shift',
        title: 'The Restasis patents were assigned to a sovereign tribe, and it did not work',
        laymanSummary:
          'Facing challenges to the patents on its dry-eye drops, Allergan transferred them to the Saint Regis Mohawk Tribe in 2017 and licensed them straight back, so the tribe’s sovereign immunity would block the challenge. A federal court held that sovereign immunity does not apply to that kind of review. The patents were separately found invalid, and a generic finally arrived in 2022.',
        technicalDetails:
          'In September 2017 Allergan assigned six Restasis patents to the Saint Regis Mohawk Tribe of New York in exchange for payments, and took an exclusive licence back, with the express purpose of asserting tribal sovereign immunity as a bar to inter partes review at the Patent Trial and Appeal Board. In October 2017 the Eastern District of Texas held the patents invalid for obviousness. In July 2018 the Federal Circuit held in Saint Regis Mohawk Tribe v. Mylan Pharmaceuticals that tribal sovereign immunity cannot be asserted in inter partes review proceedings, and the Supreme Court denied certiorari in 2019. The first generic cyclosporine ophthalmic emulsion 0.05% was approved by the FDA in February 2022. The molecule dates from 1970 and the pivotal trials were published in 2000.',
        evidenceSource:
          'Sall K et al., Ophthalmology 2000;107:631-639 (the pivotal trials whose product the patents covered); Drugs@FDA record for RESTASIS (cyclosporine ophthalmic emulsion), NDA 050790',
        inferredClaim:
          'That patent term on a formulation of a 1970 molecule reflects the cost of developing it — the assignment to a sovereign tribe for the stated purpose of blocking validity review is difficult to characterise as anything other than a term-extension manoeuvre, and the courts treated it as one',
        auditFlag: 'contested',
      },
      {
        id: 'csa-a7',
        category: 'measured',
        title: 'The pivotal trial reported the nephrotoxicity in the same paper as the benefit',
        laymanSummary:
          'The 1983 trial did not hide the kidney damage. Creatinine was measurably worse on cyclosporine at ninety days, and grafts that had already suffered a long time without blood supply did substantially worse on the drug than on the old regimen. Both facts are in the abstract.',
        technicalDetails:
          'Serum creatinine 90 days after transplantation was 2.6 mg/dL on cyclosporine against 2.0 mg/dL on azathioprine and prednisone (P=0.03). Predicted one-year graft survival was worse on cyclosporine where the kidney had been machine-perfused for more than 24 hours (70% against 88%, P=0.005) or where the surgical anastomosis took longer than 45 minutes (60% against 89%, P=0.002). Lymphoma developed in one cyclosporine patient. The interaction with ischaemic injury is mechanistically coherent: cyclosporine constricts the afferent arteriole, and a kidney already injured by prolonged ischaemia has less reserve. That interaction, visible in the very first trial, is the origin of the entire subsequent literature on calcineurin inhibitor nephrotoxicity.',
        evidenceSource:
          'Canadian Multicentre Transplant Study Group, N Engl J Med 1983;309:809-815',
        doi: '10.1056/NEJM198310063091401',
        measuredMetric:
          'Serum creatinine at 90 days, and graft survival stratified by cold ischaemia time and anastomosis time',
        auditFlag: 'verified',
      },
      {
        id: 'csa-a8',
        category: 'inferred',
        title: 'Two formulations of the same molecule that are not interchangeable',
        laymanSummary:
          'The original oil-based capsules were absorbed erratically, depending on how much bile the person happened to be producing. A microemulsion version fixed that. They contain the same drug and cannot be swapped one for one, and the label says so.',
        technicalDetails:
          'Sandimmune, the original formulation, depends on bile for emulsification and gives absorption that varies substantially between and within patients, particularly in liver transplant recipients with impaired bile flow. Neoral is a self-microemulsifying preconcentrate that forms a fine dispersion on contact with aqueous fluid and gives markedly higher and more consistent bioavailability. The label states the two are not bioequivalent and must not be used interchangeably without physician supervision and blood level monitoring. The generic Gengraf is a modified formulation bioequivalent to Neoral, not to Sandimmune. A reader encountering "cyclosporine" in a paper, a guideline or a pharmacy record is encountering one of at least three products whose exposure profiles differ.',
        evidenceSource:
          'NEORAL and SANDIMMUNE (cyclosporine) United States prescribing information, Description, Dosage and Administration and Clinical Pharmacology sections',
        inferredClaim:
          'That "cyclosporine" names one exposure profile — the oil-based and microemulsion formulations are explicitly not interchangeable, and much of the older transplant literature used the formulation with the erratic absorption',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A ring of eleven amino acids, made by a mould',
        laymanDesc:
          'Cyclosporine is a closed loop of eleven building blocks, produced by a fungus found in Norwegian soil in 1970. Its shape is what lets it slip through cell membranes despite being enormous by drug standards.',
        molecularDetail:
          'A cyclic undecapeptide of 1,202.6 g/mol with seven N-methylated amide bonds and the non-proteinogenic residue MeBmt at position 1. The N-methylation removes hydrogen-bond donors and lets the molecule adopt a closed, internally hydrogen-bonded conformation in lipid environments — the reason a 1.2-kilodalton peptide is orally absorbed at all.',
        iconName: 'CircleDot',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Absorption depends heavily on the formulation',
        laymanDesc:
          'The original capsules needed bile to be absorbed properly, which made blood levels unpredictable. A later formulation pre-mixes the drug into microscopic droplets so it does not depend on the gut’s own emulsifying.',
        molecularDetail:
          'The Sandimmune oil formulation requires biliary emulsification and shows wide inter- and intra-patient variability, especially in liver transplant recipients. The Neoral self-microemulsifying preconcentrate forms a fine dispersion on contact with aqueous fluid and gives higher, more reproducible exposure. The two are not bioequivalent.',
        iconName: 'Droplets',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Inside the T cell it binds cyclophilin',
        laymanDesc:
          'The drug pairs up with an abundant small protein in the cell. Neither one alone blocks anything; the pair is the working unit.',
        molecularDetail:
          'Binds cyclophilin A, a peptidyl-prolyl cis-trans isomerase. The composite surface of the cyclosporine-cyclophilin complex is what recognises calcineurin — structurally distinct from, but functionally parallel to, the tacrolimus-FKBP12 complex.',
        iconName: 'Link',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The complex blocks calcineurin and interleukin-2 is never transcribed',
        laymanDesc:
          'That pair sits on the enzyme that would otherwise unlock the transcription factor for the immune system’s main recruitment signal. Blocked, the signal is never made and the response never assembles.',
        molecularDetail:
          'The complex binds at the calcineurin A and B subunit interface and blocks substrate access. Nuclear factor of activated T cells stays phosphorylated and cytoplasmic, so IL2, IL4, IFNG and CD40LG transcription is not initiated. Cyclophilin binding also underlies a second, unrelated action: inhibition of the mitochondrial permeability transition pore through cyclophilin D, which was the rationale for the heart-attack trials.',
        iconName: 'Ban',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Rejection rates fall, and transplantation becomes routine',
        laymanDesc:
          'The first randomised trial raised one-year kidney survival from about two-thirds to about four-fifths. Every solid organ transplant programme in the world dates from that result.',
        molecularDetail:
          'Predicted one-year graft survival 80.4% against 64.0% on azathioprine and prednisone (P=0.003) in 209 randomised cadaveric kidney recipients, with predicted patient survival 96.6% against 86.4%.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Calcineurin in the kidney arteriole is the price',
        laymanDesc:
          'The same enzyme controls the tone of the small artery feeding each filtering unit of the kidney. Blocking it narrows that artery, which is why the drug that saves the transplanted kidney also damages it.',
        molecularDetail:
          'Afferent arteriolar vasoconstriction with reduced renal blood flow and glomerular filtration, reversible acutely and associated on chronic exposure with arteriolar hyalinosis and striped interstitial fibrosis. The first trial already measured it — creatinine 2.6 against 2.0 mg/dL at 90 days — and showed it interacting with pre-existing ischaemic injury. Hypertension, gingival hyperplasia and hypertrichosis complete the characteristic profile.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Canadian Multicentre Transplant Study (1983)',
        phase: 'Randomised, multicentre, active-controlled',
        sampleSize: 209,
        primaryEndpoint: 'Graft survival at one year after cadaveric renal transplantation',
        endpointMet: true,
        statisticalPValue:
          'Predicted one-year graft survival 80.4% against 64.0%, P=0.003; predicted patient survival 96.6% against 86.4%',
        unreportedAdverseSignals:
          'Serum creatinine at 90 days was worse on cyclosporine (2.6 against 2.0 mg/dL, P=0.03), and graft survival on cyclosporine was substantially worse where cold ischaemia exceeded 24 hours (70% against 88%, P=0.005). The nephrotoxicity was in the founding trial, not discovered later.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'ELITE-Symphony, cyclosporine arms (NCT00231764)',
        phase: 'Phase 4, randomised, open-label, four-arm',
        sampleSize: 1645,
        primaryEndpoint: 'Estimated glomerular filtration rate at 12 months',
        endpointMet: false,
        statisticalPValue:
          'Both cyclosporine arms fell in the 56.7 to 59.4 mL/min band against 65.4 for low-dose tacrolimus; acute rejection 24.0% and 25.8% against 12.3%; allograft survival 93.1% and 89.3% against 94.2%, P=0.02 across arms',
        unreportedAdverseSignals:
          'The standard-dose cyclosporine arm alone received no induction agent, which confounds that comparison. The low-dose cyclosporine arm did receive daclizumab and still trailed tacrolimus on all three endpoints.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'CIRCUS (NCT01502774, EudraCT 2009-013713-99)',
        phase: 'Phase 3, multicentre, randomised, double-blind, placebo-controlled',
        sampleSize: 970,
        primaryEndpoint:
          'Composite of death, worsening heart failure during initial hospitalisation, rehospitalisation for heart failure, or adverse left ventricular remodelling at 1 year',
        endpointMet: false,
        statisticalPValue: '59.0% against 58.1%; odds ratio 1.04 (95% CI 0.78 to 1.39), P=0.77',
        unreportedAdverseSignals:
          'No separate component of the composite moved, including recurrent infarction, unstable angina and stroke. The 58-patient pilot that motivated this trial had reported significant reductions in creatine kinase release and MRI infarct mass, on endpoints that are not clinical outcomes.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'Lichtiger 1994 severe ulcerative colitis trial',
        phase: 'Randomised, double-blind, placebo-controlled',
        sampleSize: 20,
        primaryEndpoint:
          'Clinical response permitting hospital discharge on oral medication, in steroid-refractory severe ulcerative colitis',
        endpointMet: true,
        statisticalPValue: '9 of 11 (82%) against 0 of 9, P<0.001, within a mean of seven days',
        unreportedAdverseSignals:
          'Twenty patients in total. The trial could not run longer or larger because non-response meant colectomy, and five placebo non-responders were crossed over to open cyclosporine. It is a genuine result on a denominator too small to estimate an effect size from.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'CsA Phase 3 dry eye programme (Sall 2000)',
        phase: 'Two identical randomised, double-masked, vehicle-controlled 6-month trials',
        sampleSize: 877,
        primaryEndpoint:
          'Objective signs of dry eye — corneal and interpalpebral dye staining and Schirmer tear test — and subjective symptom measures',
        endpointMet: true,
        statisticalPValue:
          'Significantly greater improvement than vehicle in corneal staining and categorised Schirmer values at P at or below 0.05 for both 0.05% and 0.1%; no dose-response between the two strengths',
        unreportedAdverseSignals:
          'Only three of the reported subjective measures separated from vehicle for the 0.05% strength, and the absence of any dose-response between a strength and double that strength is a finding that argues against a straightforward pharmacological effect.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Predicted one-year kidney graft survival 80.4% against 64.0% on azathioprine and prednisone, P=0.003, in 209 randomised patients',
        'Serum creatinine 2.6 against 2.0 mg/dL at 90 days in the same trial, P=0.03',
        'GFR 56.7 to 59.4 mL/min and acute rejection 24.0% to 25.8% for cyclosporine arms against 65.4 and 12.3% for low-dose tacrolimus in 1,645 patients',
        'No effect on the composite clinical outcome after anterior STEMI: 59.0% against 58.1%, odds ratio 1.04 (95% CI 0.78 to 1.39) in 970 patients',
        'Clinical response in 9 of 11 against 0 of 9 in steroid-refractory severe ulcerative colitis, P<0.001',
      ],
      unsupportedInferences: [
        'That inhibiting the mitochondrial permeability transition pore limits human reperfusion injury — supported by biomarkers in 58 patients, refuted on outcomes in 970',
        'That improvement in corneal staining and Schirmer score amounts to the improvement in dry eye a patient would report; most symptom endpoints did not separate and there was no dose-response',
        'That "cyclosporine" names a single exposure profile, when the oil-based and microemulsion formulations are explicitly not interchangeable',
        'That the patent term on the ophthalmic emulsion reflected development cost, given the 2017 assignment to a sovereign tribe for the stated purpose of blocking validity review',
      ],
      whatFailedInitially: [
        'CIRCUS found no effect on any component of its composite outcome in 970 patients after a promising 58-patient pilot',
        'ELITE-Symphony placed both cyclosporine arms behind low-dose tacrolimus on kidney function, rejection and graft survival',
        'The nephrotoxicity that defines the class was measurable in the founding 1983 trial, and interacted with prolonged cold ischaemia to cut graft survival to 70% against 88%',
        'The Saint Regis Mohawk assignment was held ineffective by the Federal Circuit, and the patents were separately invalidated',
      ],
      realWorldOutcome: [
        'The drug that made solid organ transplantation a routine service rather than an experimental procedure',
        'Displaced by tacrolimus as the default calcineurin inhibitor after ELITE-Symphony reported in 2007',
        'Still used in severe psoriasis, steroid-refractory ulcerative colitis and aplastic anaemia, and at very large scale as a dry eye drop',
        'A generic ophthalmic emulsion finally reached the United States market in February 2022, twenty-two years after the pivotal trials were published',
      ],
    },
    deliverySystem: {
      type: 'Oil-based soft gelatin capsules and oral solution (Sandimmune), self-microemulsifying capsules and oral solution (Neoral, Gengraf), intravenous concentrate, and 0.05% and 0.09% ophthalmic emulsions and solutions',
      description:
        'Oral absorption of the original oil formulation depends on bile and is highly variable; the microemulsion preconcentrate was developed to remove that dependence and gives higher and more consistent exposure. The two are not bioequivalent and the label forbids interchange without supervision and level monitoring. Clearance is by CYP3A4 with P-glycoprotein efflux, giving an extensive interaction list. The ophthalmic emulsion is designed to keep a lipophilic molecule on the ocular surface; blood concentrations after topical use are below the limit of quantification.',
      safetyProfile:
        'Boxed warnings covering administration only by physicians experienced in immunosuppressive therapy, increased susceptibility to infection and lymphoma, hypertension and nephrotoxicity — the last of which was measurable in the founding trial — and, for the psoriasis indication, an additional warning about malignancy in patients previously treated with PUVA and other immunosuppressants. Characteristic and largely cyclosporine-specific effects include gingival hyperplasia, hypertrichosis and tremor. Hyperkalaemia, hypomagnesaemia, hyperuricaemia and gout, hyperlipidaemia and posterior reversible encephalopathy syndrome are all labelled. The ophthalmic emulsion’s commonest adverse effect is ocular burning on instillation.',
    },
    commonQuestions: [
      {
        q: 'Is cyclosporine still the standard transplant drug?',
        a: 'No, and the date it stopped being one is documented. ELITE-Symphony randomised 1,645 kidney transplant recipients across four regimens in 2007. Low-dose tacrolimus produced a mean glomerular filtration rate of 65.4 mL/min against 56.7 to 59.4 for the other arms, biopsy-proven acute rejection of 12.3% against 24.0% and 25.8% for the two cyclosporine arms, and the highest allograft survival at 94.2%. Cyclosporine remains in use where tacrolimus cannot be tolerated, most often because of new-onset diabetes, and it is still used in psoriasis, steroid-refractory ulcerative colitis and aplastic anaemia. Its historical importance is not in question; its current position is second.',
      },
      {
        q: 'How is it different from tacrolimus if they do the same thing?',
        a: 'They inhibit the same enzyme through different partners. Cyclosporine binds cyclophilin; tacrolimus binds FKBP12; both resulting complexes block calcineurin. The clinical differences follow from everything else the two molecules do. Cyclosporine causes gum overgrowth, excess body hair, worse cholesterol and more hypertension. Tacrolimus causes more tremor, more neurotoxicity and substantially more new-onset diabetes — 33.6% against 26.0% at six months in the trial designed to measure it. Tacrolimus produces fewer rejections and better kidney function in the head-to-head comparisons. Neither is free of nephrotoxicity, because that comes from the shared target.',
      },
      {
        q: 'Why did it fail in heart attacks?',
        a: 'Because the mechanism it was tested on turned out not to determine the outcome. Cyclophilin D sits in the mitochondrion and helps open a pore that kills cells when blood flow returns to starved tissue. Cyclosporine blocks it, and a 58-patient pilot found lower creatine kinase release and a smaller infarct on MRI. Those are markers of tissue damage, not clinical outcomes, and the authors said explicitly the results needed confirmation. CIRCUS then randomised 970 patients with anterior STEMI. The composite outcome at one year was 59.0% against 58.1%, an odds ratio of 1.04 with a confidence interval from 0.78 to 1.39. Not one component moved. It is a clean illustration of a surrogate that responded to a drug while the outcome did not.',
        auditNote:
          'The pilot was correctly labelled preliminary by its own authors. The failure here is not of that paper but of how confidently a 58-patient biomarker result was read forward.',
      },
      {
        q: 'What was the Mohawk tribe patent story?',
        a: 'In September 2017 Allergan assigned six patents on Restasis, its cyclosporine eye drop, to the Saint Regis Mohawk Tribe in New York in exchange for payments, and immediately took an exclusive licence back. The stated purpose was to assert tribal sovereign immunity as a bar to inter partes review — the administrative process by which a competitor can challenge a patent’s validity. In October 2017 a federal district court held the patents invalid for obviousness anyway. In July 2018 the Federal Circuit held that tribal sovereign immunity cannot be asserted in inter partes review, and the Supreme Court declined to hear the appeal. The first generic ophthalmic cyclosporine emulsion was approved in February 2022. The molecule itself was isolated in 1970 and the pivotal dry eye trials were published in 2000.',
      },
      {
        q: 'Do the dry eye drops work?',
        a: 'They move the objective measures. In two identical six-month trials in 877 patients, both the 0.05% and 0.1% emulsions produced significantly greater improvement than the vehicle in corneal staining and in categorised Schirmer scores, which measure how much the eye stains with dye and how far a paper strip wets. On the things a patient notices, the picture is thinner: for the 0.05% strength three subjective measures separated from vehicle — blurred vision, need for artificial tears, and the physician’s global assessment — and the rest did not. There was also no dose-response: doubling the concentration produced no additional effect, which is unusual for a straightforward pharmacological action and is reported plainly in the paper. Burning on instillation is the commonest complaint, and the effect takes months rather than days.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Canadian Multicentre Transplant Study Group. A randomized clinical trial of cyclosporine in cadaveric renal transplantation. N Engl J Med 1983;309:809-815',
        identifier: '10.1056/NEJM198310063091401',
        kind: 'doi',
      },
      {
        label:
          'Ekberg H et al. Reduced exposure to calcineurin inhibitors in renal transplantation. N Engl J Med 2007;357:2562-2575 (ELITE-Symphony)',
        identifier: '10.1056/NEJMoa067411',
        kind: 'doi',
      },
      {
        label:
          'Cung TT et al. Cyclosporine before PCI in patients with acute myocardial infarction. N Engl J Med 2015;373:1021-1031 (CIRCUS)',
        identifier: '10.1056/NEJMoa1505489',
        kind: 'doi',
      },
      {
        label:
          'Piot C et al. Effect of cyclosporine on reperfusion injury in acute myocardial infarction. N Engl J Med 2008;359:473-481',
        identifier: '10.1056/NEJMoa071142',
        kind: 'doi',
      },
      {
        label:
          'Lichtiger S et al. Cyclosporine in severe ulcerative colitis refractory to steroid therapy. N Engl J Med 1994;330:1841-1845',
        identifier: '10.1056/NEJM199406303302601',
        kind: 'doi',
      },
      {
        label:
          'Sall K, Stevenson OD, Mundorf TK, Reis BL. Two multicenter, randomized studies of the efficacy and safety of cyclosporine ophthalmic emulsion in moderate to severe dry eye disease. Ophthalmology 2000;107:631-639',
        identifier: '10.1016/s0161-6420(99)00176-1',
        kind: 'doi',
      },
      {
        label: 'CIRCUS: cyclosporine and prognosis in acute myocardial infarction patients',
        identifier: 'NCT01502774',
        kind: 'nct',
      },
      {
        label:
          'Drugs@FDA: RESTASIS (cyclosporine ophthalmic emulsion) 0.05%, NDA 050790, Allergan — label and approval history',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=050790',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 5284373 — cyclosporin A structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5284373',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 9. Sulfasalazine — designed in 1938 on a hypothesis that was wrong, and it works anyway, with
  //    a different half of the molecule doing the work in each of its two diseases.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'sulfasalazine',
    name: 'Sulfasalazine',
    tradeName: 'Azulfidine / Azulfidine EN-tabs / Salazopyrin',
    sponsor:
      'Designed by Nanna Svartz at the Karolinska Institute with Pharmacia in the late 1930s and first reported in 1942. Now off patent and made by many manufacturers; the United States brand Azulfidine is a Pfizer legacy product.',
    targetGene:
      'No single target. The two moieties act separately: 5-aminosalicylic acid on colonic epithelium (PPARG, NFKB1), sulfapyridine on the systemic process in rheumatoid arthritis',
    targetProtein:
      'Multiple and incompletely defined. Documented actions include inhibition of NF-kappaB activation, inhibition of folate-dependent enzymes including AICAR transformylase, adenosine release, and inhibition of dihydropteroate synthase by the sulfapyridine moiety.',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1950,
    indication:
      'Mild to moderate ulcerative colitis and adjunctive therapy in severe ulcerative colitis; prolongation of the remission period between acute attacks of ulcerative colitis; and, as the delayed-release formulation, rheumatoid arthritis in patients who have responded inadequately to salicylates or other non-steroidal anti-inflammatory drugs, and polyarticular-course juvenile idiopathic arthritis',
    patientFriendlyIndication: 'Ulcerative colitis and rheumatoid arthritis',
    anatomicalSite:
      'Two different places, depending on the disease. For colitis the colon lumen and epithelium, where gut bacteria split the molecule and release the active half locally. For rheumatoid arthritis, the systemic circulation, which the other half reaches after absorption.',
    conditionContext: {
      conditionExplainer:
        'Sulfasalazine is two drugs joined by a chemical bond that only bacteria in the colon can break: a sulfa antibiotic, sulfapyridine, and an aspirin relative, 5-aminosalicylic acid. Almost none of the intact molecule is absorbed in the small intestine, so the split happens where the colon starts.',
      whyItMatters:
        'It was designed in the late 1930s on the theory that rheumatoid arthritis was caused by a streptococcal infection — an antibiotic bolted to an anti-inflammatory. The theory was wrong. The drug works, and the reason it works turned out to be different in each of its two licensed diseases: the salicylate half in colitis, the antibiotic half in arthritis.',
      whoTakesThis:
        'People with ulcerative colitis, particularly where the disease is confined to the colon; people with rheumatoid arthritis, usually as part of triple therapy with methotrexate and hydroxychloroquine; and people with ankylosing spondylitis with peripheral joint involvement.',
      clinicalGoals:
        'In colitis, induce and maintain remission with a locally acting drug. In arthritis, slow the disease as part of a combination that a large trial found equal to a biologic at a small fraction of the cost.',
    },
    oneSentenceVerdict:
      'A sulfa antibiotic tied to an aspirin relative by a bond only colonic bacteria can cut — designed on a bacterial theory of rheumatoid arthritis that proved false, it works in both of its diseases through opposite halves of the molecule (5-aminosalicylic acid produced histological improvement in about 30% of colitis patients against 5% for sulfapyridine, while sulfapyridine carried the arthritis effect), and in 353 randomised patients it was part of a triple regimen non-inferior to etanercept plus methotrexate, DAS28 change -2.1 against -2.3, P=0.26.',
    laymanHowItWorks:
      'Sulfasalazine is two molecules chemically welded together by a bond that human enzymes cannot cut and gut bacteria can. Swallowed, it passes almost untouched through the stomach and small intestine and arrives in the colon, where bacteria break the weld and release both halves. One half, an aspirin relative, stays in the colon and calms the inflamed lining there. The other half, a sulfa antibiotic, is absorbed into the bloodstream and is the part that acts on rheumatoid arthritis. Which half matters depends entirely on which disease is being treated.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 73,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.2003 per tablet at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'First reported in 1942 and out of patent for many decades; sulfasalazine appears on the WHO Model List of Essential Medicines. At about 20 cents a tablet it is one of the cheapest disease-modifying drugs in rheumatology, which is the fact that makes the RACAT result economically significant: a regimen built on it was found non-inferior to a biologic whose annual cost is measured in tens of thousands of dollars.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'In ulcerative colitis the substitute is mesalazine, which is the active half without the antibiotic half that causes most of the side effects — a direct consequence of the 1977 experiment that identified which moiety worked. In rheumatoid arthritis the substitute is a different disease-modifying drug or a biologic, and the head-to-head evidence is that a triple regimen containing sulfasalazine matched etanercept plus methotrexate over 48 weeks. Nothing sold as a food or supplement substitutes for a disease-modifying antirheumatic drug or for colitis maintenance therapy.',
      conventionalRx: [
        {
          name: 'Mesalazine (mesalamine, 5-aminosalicylic acid)',
          class: 'Aminosalicylate',
          howItCompares:
            'The active moiety of sulfasalazine in ulcerative colitis, delivered without the sulfapyridine carrier by pH-dependent or time-dependent release formulations. It exists because the 1977 rectal-enema experiment showed 5-ASA produced the therapeutic effect and sulfapyridine did not. It causes fewer of the sulfa-related adverse effects — rash, headache, nausea, reversible male infertility — and it has no effect in rheumatoid arthritis.',
          typicalCost:
            'Generic oral mesalazine is available but is substantially more expensive per day than sulfasalazine in most markets',
          prosAndCons:
            'Pros: markedly better tolerated in colitis, no reversible oligospermia. Cons: costs more, needs a formulation to get it to the right part of the bowel, and does nothing for joints.',
        },
        {
          name: 'Methotrexate',
          class: 'Antifolate disease-modifying antirheumatic drug',
          howItCompares:
            'The first-line conventional DMARD in rheumatoid arthritis and the backbone that sulfasalazine is added to rather than a competitor to it. In RACAT, every patient was already failing methotrexate; the question was what to add.',
          typicalCost:
            'Generic; among the cheapest disease-modifying antirheumatic drugs available',
          prosAndCons:
            'Pros: the reference DMARD, weekly dosing, largest evidence base. Cons: teratogenic, hepatotoxic, and in this trial insufficient on its own by definition.',
        },
        {
          name: 'Etanercept plus methotrexate',
          class: 'TNF inhibitor plus antifolate',
          howItCompares:
            'The comparator in RACAT. At 48 weeks the change in DAS28 was -2.3 with etanercept plus methotrexate and -2.1 with triple therapy, P=0.26, with a 95% upper confidence limit of 0.41 against a non-inferiority margin of 0.6 (P=0.002). There were no significant differences in radiographic progression, pain, quality of life, or major adverse events.',
          typicalCost:
            'Tens of thousands of United States dollars per year at list price, against roughly 20 cents a tablet for sulfasalazine',
          prosAndCons:
            'Pros: subcutaneous injection rather than multiple daily tablets, and no sulfa intolerance. Cons: cost, injection, and no measured clinical advantage over triple therapy in the one large blinded head-to-head trial.',
        },
        {
          name: 'Hydroxychloroquine',
          class: 'Antimalarial disease-modifying antirheumatic drug',
          howItCompares:
            'The third component of triple therapy rather than an alternative to sulfasalazine. It is the mildest of the conventional DMARDs and the one with the fewest monitoring requirements, though it needs periodic retinal screening.',
          typicalCost: 'Generic; inexpensive',
          prosAndCons:
            'Pros: well tolerated, no blood monitoring. Cons: weakest single-agent effect, and cumulative retinal toxicity over years.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Men planning a pregnancy should know about the sperm effect',
          action:
            'Anyone taking sulfasalazine who is trying to conceive should raise it, because the effect is real, common and reversible.',
          patientImpact:
            'Sulfasalazine causes reversible oligospermia in a substantial proportion of men taking it, attributed to the sulfapyridine moiety. Sperm counts recover within a few months of stopping or of switching to mesalazine.',
          clinicalPrecaution:
            'This is a labelled adverse reaction and it is one of the main reasons a man with ulcerative colitis may be moved to mesalazine, which does not have the effect.',
        },
        {
          name: 'Report a rash with fever as urgent, not as a nuisance',
          action:
            'Any rash accompanied by fever, facial swelling, mouth ulcers or feeling generally unwell needs same-day attention rather than a wait-and-see.',
          patientImpact:
            'Sulfasalazine contains a sulfonamide and the label warns of severe cutaneous reactions including Stevens-Johnson syndrome and toxic epidermal necrolysis, and of drug reaction with eosinophilia and systemic symptoms. These present as a rash before they present as anything else.',
          clinicalPrecaution:
            'Blood dyscrasias including agranulocytosis are also labelled, which is why blood counts are checked in the first months of treatment.',
        },
        {
          name: 'Do not be alarmed by orange urine or stained contact lenses',
          action:
            'Expect urine, and sometimes skin, to take on a yellow-orange colour, and be aware that soft contact lenses can be stained permanently.',
          patientImpact:
            'The molecule is an azo dye, and the colouration is a direct consequence of its chemistry rather than a sign of liver or kidney trouble.',
          clinicalPrecaution:
            'Harmless in itself. Yellowing of the whites of the eyes is a different matter and does need reporting, because that is jaundice.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1=CC=NC(=C1)NS(=O)(=O)C2=CC=C(C=C2)N=NC3=CC(=C(C=C3)O)C(=O)O',
      chemicalFormula: 'C18H14N4O5S',
      molecularWeight: '398.40 g/mol',
      targetReceptorAffinity:
        'No defined receptor affinity, and the drug is best described as a colon-targeted delivery system for two separate agents. The azo bond linking sulfapyridine to 5-aminosalicylic acid is cleaved by bacterial azoreductases in the colon; only about 10 to 30% of the intact molecule is absorbed in the small intestine, and most of that is returned to the gut in bile.',
      structureSource: {
        label:
          'PubChem CID 5339 (sulfasalazine) — canonical SMILES, molecular formula C18H14N4O5S and molecular weight 398.4 g/mol, re-checked against the PUG REST property endpoint',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5339',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ssz-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the azo linkage and quantify free sulfapyridine and free 5-ASA',
          description:
            'Verify the intact azo bond and set limits on the two free moieties. Free sulfapyridine or free 5-aminosalicylic acid in the tablet defeats the entire design, because both would be absorbed in the small intestine and neither would reach the colon.',
          reagentsAndBuffer:
            'Sulfasalazine USP reference standard, reversed-phase HPLC with ultraviolet detection at 359 nm for the azo chromophore and at 303 nm for the moieties, limit tests against sulfapyridine and 5-ASA standards',
        },
        {
          id: 'ssz-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Diazotisation of sulfapyridine and azo coupling to salicylic acid',
          description:
            'Diazotise the aromatic amine of sulfapyridine with nitrous acid at low temperature, then couple the diazonium salt to salicylic acid. This is textbook azo dye chemistry from the 1930s, done at scale in a single vessel, which is the reason the finished drug costs about twenty cents a tablet.',
          dependsOnStepId: 'ssz-w1',
          reagentsAndBuffer:
            'Sulfapyridine, sodium nitrite and hydrochloric acid at 0 to 5 degrees C for diazotisation, salicylic acid in sodium hydroxide for the coupling, controlled pH to direct coupling to the 5-position, acidification to precipitate the product',
        },
        {
          id: 'ssz-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Recrystallise and check for positional isomers of the coupling',
          description:
            'Remove unreacted sulfapyridine and salicylic acid and confirm that coupling occurred at the intended position on the salicylate ring. A differently coupled isomer would still be an azo compound cleaved by the same bacteria, and would release a different aminosalicylate.',
          dependsOnStepId: 'ssz-w2',
          reagentsAndBuffer:
            'Recrystallisation from aqueous dimethylformamide or ethanol-water, activated charcoal treatment, HPLC against USP related-compounds standards, 1H NMR to confirm the substitution pattern',
        },
        {
          id: 'ssz-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Anaerobic faecal incubation to measure azoreductase cleavage',
          description:
            'Incubate the drug with human faecal flora under strict anaerobic conditions and measure the release of both moieties over time. This is the step that decides whether the drug works at all, and it is a microbiological property rather than a chemical one: an antibiotic course that suppresses colonic flora reduces cleavage and therefore reduces the delivered dose of the active moiety.',
          dependsOnStepId: 'ssz-w3',
          reagentsAndBuffer:
            'Fresh human faecal slurry in anaerobic phosphate buffer, anaerobic chamber at 37 degrees C, LC-MS/MS quantification of sulfasalazine, sulfapyridine and 5-aminosalicylic acid, sterile-flora and antibiotic-suppressed controls',
        },
        {
          id: 'ssz-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Separate the two moieties in every downstream assay',
          description:
            'Run any pharmacodynamic readout — NF-kappaB activation, cytokine release, epithelial barrier function — against sulfasalazine, sulfapyridine and 5-ASA separately, never against the parent alone. The whole clinical history of this drug turns on the fact that different moieties are responsible in different diseases, and an assay of the intact molecule cannot detect that.',
          dependsOnStepId: 'ssz-w4',
          reagentsAndBuffer:
            'Colonic epithelial cell line and stimulated peripheral blood mononuclear cells in parallel, NF-kappaB reporter and cytokine ELISA panels, all three compounds tested individually at matched molar concentrations',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ssz-a1',
        category: 'conclusion_shift',
        title: 'Designed on a wrong hypothesis, and it works for a different reason',
        laymanSummary:
          'Nanna Svartz built this drug in the late 1930s from a sulfa antibiotic and an aspirin relative, because she thought rheumatoid arthritis was caused by a streptococcal infection. That theory was abandoned. The drug turned out to work in two diseases, and the antibiotic half is the part that does the work in arthritis — which is not evidence that the theory was right, and is the reason the question keeps being asked.',
        technicalDetails:
          'Sulfasalazine was synthesised as a deliberate conjugate of sulfapyridine, an antibacterial sulfonamide, and 5-aminosalicylic acid, an anti-inflammatory salicylate, on the working hypothesis that rheumatoid arthritis had a bacterial aetiology and that a drug combining antibacterial and anti-inflammatory activity would target it. The infectious theory of rheumatoid arthritis was not sustained. Two separate moiety experiments, decades apart, then established that different halves carry the effect in the drug’s two diseases. In the arthritis experiment the authors noted explicitly that the efficacy of the antibacterial component "yet again permits speculation about the role of a bacterial pathogen in the aetiopathogenesis of rheumatoid disease" — a speculation that remains unresolved, with the modern version framed around the gut and oral microbiome rather than around a single organism.',
        evidenceSource:
          'Pullar T, Hunter JA, Capell HA, Br Med J (Clin Res Ed) 1985;290:1535-1538; Azad Khan AK, Piris J, Truelove SC, Lancet 1977;2:892-895',
        doi: '10.1136/bmj.290.6481.1535',
        inferredClaim:
          'That sulfapyridine working in rheumatoid arthritis supports a bacterial cause of the disease — the observation is real and the inference has never been closed either way',
        auditFlag: 'contested',
      },
      {
        id: 'ssz-a2',
        category: 'measured',
        title: 'The 1977 enema experiment: 5-ASA is the active half in colitis',
        laymanSummary:
          'Three groups of patients with active ulcerative colitis were given nightly enemas of either the whole drug, or one half, or the other half, for two weeks. The whole drug and the salicylate half produced about the same improvement on biopsy. The antibiotic half produced almost none.',
        technicalDetails:
          'Retention enemas of sulfasalazine, sulfapyridine or 5-aminosalicylic acid were given daily for two weeks to patients with sigmoidoscopic evidence of active ulcerative colitis, in a blind controlled trial with each patient receiving one preparation. Pronounced histological improvement was observed in approximately 30% of patients receiving sulfasalazine or 5-aminosalicylic acid, and in only 5% of those receiving sulfapyridine. The authors concluded that the active therapeutic moiety is 5-ASA and that sulfapyridine functions as a carrier ensuring the 5-ASA is liberated in the colon. That conclusion created the entire mesalazine class, which is sulfasalazine with the carrier removed and a formulation put in its place.',
        evidenceSource: 'Azad Khan AK, Piris J, Truelove SC, Lancet 1977;2:892-895',
        doi: '10.1016/s0140-6736(77)90831-5',
        measuredMetric:
          'Histological improvement on biopsy after two weeks of moiety-specific retention enemas',
        auditFlag: 'verified',
      },
      {
        id: 'ssz-a3',
        category: 'measured',
        title: 'The 1985 experiment: sulfapyridine is the active half in arthritis',
        laymanSummary:
          'The same question was asked in rheumatoid arthritis and got the opposite answer. Given separately over twenty-four weeks, the antibiotic half worked about as well as the whole drug. The salicylate half — the one that works in colitis — barely did anything.',
        technicalDetails:
          'Sulfapyridine and 5-aminosalicylic acid were assessed separately over 24 weeks in the treatment of rheumatoid arthritis. Sulfapyridine showed a pronounced second-line effect comparable with sulfasalazine and with a similar toxicity profile, whereas 5-aminosalicylic acid showed only a weak first-line effect. The authors concluded that sulfapyridine is the active moiety responsible for the second-line effect in rheumatoid arthritis. Taken with the 1977 colitis experiment, this establishes that a single marketed molecule delivers its benefit through opposite halves in its two licensed indications — an unusual situation, and the reason the mesalazine class replaced sulfasalazine in colitis while sulfasalazine itself remains in rheumatology.',
        evidenceSource: 'Pullar T, Hunter JA, Capell HA, Br Med J (Clin Res Ed) 1985;290:1535-1538',
        doi: '10.1136/bmj.290.6481.1535',
        measuredMetric:
          'Second-line disease-modifying effect over 24 weeks with each moiety administered separately',
        auditFlag: 'verified',
      },
      {
        id: 'ssz-a4',
        category: 'measured',
        title: 'RACAT: triple therapy matched a biologic over 48 weeks',
        laymanSummary:
          'Three hundred and fifty-three people with rheumatoid arthritis still active on methotrexate were randomly given either two cheap old tablets added on, or an injected biologic. After a year the disease scores were the same, and so were the X-rays. The tablets cost cents; the biologic costs tens of thousands a year.',
        technicalDetails:
          'RACAT was a 48-week double-blind non-inferiority trial in 353 participants with rheumatoid arthritis active despite methotrexate, randomised to triple therapy — methotrexate, sulfasalazine and hydroxychloroquine — or to etanercept plus methotrexate, with blinded switching at 24 weeks for those below a prespecified improvement threshold. Twenty-seven percent in each group switched. The change in DAS28 between baseline and 48 weeks was -2.1 with triple therapy and -2.3 with etanercept plus methotrexate (P=0.26); non-inferiority was met, with the 95% upper confidence limit of 0.41 below the prespecified margin of 0.6 (P=0.002). There were no significant between-group differences in radiographic progression, pain, health-related quality of life, or major adverse events. Response after switching did not differ significantly between groups (P=0.08).',
        evidenceSource:
          'O’Dell JR et al., CSP 551 RACAT Investigators, N Engl J Med 2013;369:307-318 (NCT00405275)',
        doi: '10.1056/NEJMoa1303006',
        measuredMetric:
          'Change in DAS28 from baseline to week 48, non-inferiority against etanercept plus methotrexate, double-blind',
        auditFlag: 'verified',
      },
      {
        id: 'ssz-a5',
        category: 'inferred',
        title: 'Non-inferiority is not equivalence, and the trial says what it says',
        laymanSummary:
          'RACAT showed the cheap combination was not meaningfully worse than the biologic. It did not show the two were identical, and it was not designed to. The distinction matters because the result is often reported as though the biologic had been beaten.',
        technicalDetails:
          'The prespecified non-inferiority margin was a DAS28 difference of 0.6. The observed difference favoured etanercept plus methotrexate by 0.2 points with a 95% upper confidence limit of 0.41 — inside the margin, and pointing the same direction. A non-inferiority design establishes that the difference is smaller than a stated threshold of clinical importance; it does not establish that there is no difference, and it cannot establish superiority. Both arms also included a blinded switch at 24 weeks for non-responders, which was used by 27% of each group, so the 48-week comparison is of strategies rather than of fixed regimens. The finding is important and the correct statement of it is narrower than the headline.',
        evidenceSource: 'O’Dell JR et al., N Engl J Med 2013;369:307-318 (RACAT)',
        doi: '10.1056/NEJMoa1303006',
        inferredClaim:
          'That triple therapy is as good as, or better than, a TNF inhibitor — the trial established non-inferiority within a 0.6 DAS28 margin, with the point estimate favouring the biologic by 0.2',
        auditFlag: 'caution',
      },
      {
        id: 'ssz-a6',
        category: 'failed',
        title: 'The carrier half causes most of the harm, which is why it was removed',
        laymanSummary:
          'The sulfa half of the molecule is responsible for most of the side effects — rash, headache, nausea and a reversible drop in sperm count. Once it was established that this half did nothing useful in colitis, the obvious move was to deliver the other half on its own, and that is what the mesalazine drugs are.',
        technicalDetails:
          'Adverse effects attributable to the sulfapyridine moiety include nausea, headache, rash and reversible oligospermia, with incidence related to serum sulfapyridine concentration and therefore to acetylator phenotype: slow acetylators reach higher concentrations and experience more toxicity. Severe reactions on the label include Stevens-Johnson syndrome, toxic epidermal necrolysis, drug reaction with eosinophilia and systemic symptoms, agranulocytosis and aplastic anaemia. The 1977 finding that 5-ASA carried the colitis effect made the carrier’s toxicity indefensible in that indication and created the mesalazine class — pH-dependent, time-dependent and azo-bonded formulations of 5-ASA without any sulfonamide. In rheumatoid arthritis the same reasoning cannot be applied, because there the sulfapyridine is the active moiety.',
        evidenceSource:
          'Azad Khan AK et al., Lancet 1977;2:892-895; Pullar T et al., Br Med J 1985;290:1535-1538; AZULFIDINE (sulfasalazine) United States prescribing information, Warnings and Adverse Reactions',
        doi: '10.1016/s0140-6736(77)90831-5',
        measuredMetric:
          'Histological response by moiety in colitis, and the consequent removal of the sulfonamide carrier from the treatment class',
        auditFlag: 'verified',
      },
      {
        id: 'ssz-a7',
        category: 'inferred',
        title: 'The drug depends on the patient’s gut bacteria to work at all',
        laymanSummary:
          'Nothing happens until bacteria in the colon cut the molecule in half. That means the delivered dose depends on the person’s microbiome, and a course of antibiotics can reduce it. This is rarely discussed and has never been measured against a clinical outcome.',
        technicalDetails:
          'Sulfasalazine is cleaved by bacterial azoreductases, an activity concentrated in the colon and absent from the human enzyme repertoire. Only about 10 to 30% of an oral dose is absorbed intact in the small intestine, and much of that returns to the gut in bile. Antibiotic-induced suppression of colonic flora reduces azoreduction and therefore reduces liberation of both moieties. The pharmacological consequence — a dose delivered that varies with the composition of an individual microbiome, and that a course of antibiotics can alter — is well described in vitro and in pharmacokinetic studies. What has not been done is a clinical study relating measured azoreductase activity or microbiome composition to disease outcome, so the practical significance is inferred from the mechanism rather than measured.',
        evidenceSource:
          'Azad Khan AK, Piris J, Truelove SC, Lancet 1977;2:892-895; AZULFIDINE United States prescribing information, Clinical Pharmacology',
        doi: '10.1016/s0140-6736(77)90831-5',
        inferredClaim:
          'That variation in colonic azoreductase activity meaningfully changes clinical response — mechanistically certain, and never measured against an outcome',
        auditFlag: 'caution',
      },
      {
        id: 'ssz-a8',
        category: 'measured',
        title: 'A twenty-cent tablet is on the essential medicines list for two diseases',
        laymanSummary:
          'The whole molecule is made in one step of nineteen-thirties dye chemistry, and it costs about twenty cents a tablet at what American pharmacies pay. That price is the reason a trial comparing it against a biologic mattered.',
        technicalDetails:
          'Sulfasalazine is manufactured by diazotisation of sulfapyridine and azo coupling to salicylic acid — a single-vessel reaction sequence developed for the dye industry. The CMS National Average Drug Acquisition Cost file lists generic sulfasalazine at US$0.2003 per tablet. Sulfasalazine appears on the WHO Model List of Essential Medicines. The economic significance of RACAT follows directly: a regimen whose two added components cost a few dollars a month was found non-inferior over 48 weeks to a biologic priced at tens of thousands of dollars a year, with no significant difference in radiographic progression, pain, quality of life or major adverse events.',
        evidenceSource:
          'CMS National Average Drug Acquisition Cost file, effective 19 August 2026; O’Dell JR et al., N Engl J Med 2013;369:307-318',
        doi: '10.1056/NEJMoa1303006',
        measuredMetric:
          'United States pharmacy acquisition cost per tablet, alongside a 48-week non-inferiority result against a biologic',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed whole and almost entirely not absorbed',
        laymanDesc:
          'Most drugs are designed to be absorbed. This one is designed not to be. Between seven and nine tenths of a dose passes through the stomach and small intestine untouched.',
        molecularDetail:
          'Only about 10 to 30% of intact sulfasalazine is absorbed from the small intestine, and much of that is returned to the gut lumen in bile. The molecule is large, dianionic at intestinal pH and a poor passive-diffusion substrate — properties that would normally count as a formulation failure and are here the whole point.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Colonic bacteria cut it in half',
        laymanDesc:
          'The bond joining the two halves can only be broken by bacterial enzymes, and those bacteria live in the colon. The drug therefore releases itself exactly where colitis is.',
        molecularDetail:
          'Bacterial azoreductases reduce the azo bond, liberating sulfapyridine and 5-aminosalicylic acid. Humans have no equivalent enzyme, which makes the colon the only site of activation. Suppression of colonic flora by antibiotics reduces cleavage and therefore the delivered dose of both moieties.',
        iconName: 'Scissors',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'One half stays in the colon and acts there',
        laymanDesc:
          'The aspirin relative is poorly absorbed from the colon, so it sits on the inflamed lining at high concentration and low body-wide exposure.',
        molecularDetail:
          '5-aminosalicylic acid acts locally on colonic epithelium, with described actions including PPAR-gamma agonism, inhibition of NF-kappaB activation, scavenging of reactive oxygen species and inhibition of leukotriene synthesis. It is largely acetylated in the mucosa and excreted in faeces. In the moiety experiment it produced pronounced histological improvement in about 30% of patients against 5% for sulfapyridine.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The other half is absorbed and acts on the joints',
        laymanDesc:
          'The sulfa antibiotic is absorbed from the colon into the bloodstream. It is the part that treats rheumatoid arthritis, and nobody is entirely sure how.',
        molecularDetail:
          'Sulfapyridine is absorbed, acetylated in the liver at a rate set by NAT2 acetylator phenotype, and excreted renally. Slow acetylators reach higher serum concentrations and experience more toxicity. Its disease-modifying mechanism in rheumatoid arthritis is not established; candidate actions include inhibition of NF-kappaB, inhibition of AICAR transformylase with consequent adenosine release, suppression of angiogenesis, and an effect on gut or oral bacteria.',
        iconName: 'Dna',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Both diseases improve, through different halves',
        laymanDesc:
          'The colitis improvement comes from the half that stayed behind, and the arthritis improvement from the half that travelled. Two moiety experiments, done eight years apart, established which was which.',
        molecularDetail:
          'Histological improvement in ulcerative colitis in about 30% with sulfasalazine or 5-ASA against 5% with sulfapyridine; a pronounced second-line effect in rheumatoid arthritis with sulfapyridine comparable to sulfasalazine, and only a weak first-line effect with 5-ASA. In RACAT, a regimen containing sulfasalazine produced a DAS28 change of -2.1 against -2.3 for etanercept plus methotrexate.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'The carrier half carries most of the toxicity too',
        laymanDesc:
          'Nausea, headache, rash and a reversible drop in sperm count all track with the sulfa half. In colitis, that half does no useful work, which is why a whole class of successor drugs exists to deliver the other half alone.',
        molecularDetail:
          'Sulfapyridine-related adverse effects scale with serum concentration and therefore with acetylator phenotype. Severe labelled reactions include Stevens-Johnson syndrome, toxic epidermal necrolysis, DRESS, agranulocytosis and aplastic anaemia. Reversible oligospermia resolves within months of stopping. The mesalazine class exists precisely because the 1977 experiment made this trade-off indefensible in colitis.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'RACAT / CSP 551 (NCT00405275)',
        phase:
          'Phase 4, randomised, double-blind, non-inferiority, with blinded switch at 24 weeks',
        sampleSize: 353,
        primaryEndpoint: 'Change in DAS28 from baseline to week 48',
        endpointMet: true,
        statisticalPValue:
          '-2.1 with triple therapy against -2.3 with etanercept plus methotrexate, P=0.26; non-inferiority met with a 95% upper confidence limit of 0.41 against a margin of 0.6, P=0.002',
        unreportedAdverseSignals:
          'Non-inferiority, not equivalence or superiority: the point estimate favoured the biologic by 0.2 DAS28 points. Twenty-seven percent of each group required a blinded switch at 24 weeks, so this compares strategies rather than fixed regimens.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'TEAR (NCT00259610)',
        phase: 'Phase 3, 2-year randomised, double-blind, 2-by-2 factorial',
        sampleSize: 755,
        primaryEndpoint:
          'Observed-group DAS28-ESR from week 48 to week 102 in early rheumatoid arthritis',
        endpointMet: true,
        statisticalPValue:
          'No difference in mean DAS28-ESR over weeks 48 to 102 between methotrexate plus etanercept and oral triple therapy, whether started immediately or stepped up at week 24',
        unreportedAdverseSignals:
          'Radiographic progression did differ and favoured the biologic: change from baseline 0.64 with methotrexate plus etanercept against 1.69 with oral triple therapy, P=0.047. A clinical equivalence with a radiographic difference is exactly the finding most likely to be quoted as one thing or the other.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Histological improvement in ulcerative colitis in about 30% with sulfasalazine or 5-ASA against about 5% with sulfapyridine, by moiety-specific enema',
        'A pronounced second-line effect in rheumatoid arthritis from sulfapyridine, and only a weak first-line effect from 5-ASA, over 24 weeks',
        'DAS28 change -2.1 with triple therapy against -2.3 with etanercept plus methotrexate at 48 weeks, P=0.26, non-inferiority met',
        'No significant difference in radiographic progression, pain, quality of life or major adverse events between those two regimens in RACAT',
        'In TEAR, no DAS28-ESR difference between the same two regimens over weeks 48 to 102 in 755 patients, with radiographic change of 0.64 against 1.69 favouring the biologic (P=0.047)',
        'A United States pharmacy acquisition cost of US$0.2003 per tablet',
      ],
      unsupportedInferences: [
        'That sulfapyridine working in rheumatoid arthritis supports a bacterial cause of the disease — the observation is real and the inference is still open',
        'That triple therapy is as good as or better than a TNF inhibitor; the trial established non-inferiority within a 0.6 margin with the point estimate favouring the biologic',
        'That variation in colonic azoreductase activity changes clinical outcome — mechanistically certain and never measured against one',
        'That the same molecule works the same way in both its licensed diseases; two experiments established the opposite',
      ],
      whatFailedInitially: [
        'The bacterial theory of rheumatoid arthritis that the drug was designed around was abandoned; the drug survived it',
        'Sulfapyridine, the carrier, produces most of the adverse effects and does no useful work in colitis, which cost sulfasalazine that indication to the mesalazine class',
        'Separating the moieties in rheumatoid arthritis identified the active half but not a better-tolerated one: sulfapyridine alone had a similar toxicity profile to the parent',
        'The drug does nothing at all until bacteria act on it, so its delivered dose is outside both the prescriber’s and the patient’s control',
      ],
      realWorldOutcome: [
        'On the WHO Model List of Essential Medicines, at about 20 cents a tablet at United States pharmacy acquisition cost',
        'Largely replaced by mesalazine in ulcerative colitis, and still standard in rheumatology as part of triple therapy',
        'The 1977 moiety experiment created the entire aminosalicylate class used in inflammatory bowel disease today',
        'RACAT made a twenty-cent tablet the comparator that a TNF inhibitor had to beat, and it did not',
      ],
    },
    deliverySystem: {
      type: 'Immediate-release oral tablet and delayed-release (enteric-coated) oral tablet',
      description:
        'A colon-targeted prodrug in which the targeting is biological rather than pharmaceutical: the azo bond is cleaved only by bacterial azoreductases, which exist in the colon and not in human tissue. Only about 10 to 30% of an oral dose is absorbed intact, and much of that returns to the gut in bile. The enteric-coated form exists to reduce upper gastrointestinal irritation and is the presentation used for rheumatoid arthritis. Absorption of the liberated sulfapyridine, and therefore systemic toxicity, depends on NAT2 acetylator phenotype.',
      safetyProfile:
        'Most adverse effects track the sulfapyridine moiety and its serum concentration: nausea, headache, rash, and reversible oligospermia in men, which resolves within months of stopping. Labelled serious reactions include Stevens-Johnson syndrome, toxic epidermal necrolysis, drug reaction with eosinophilia and systemic symptoms, agranulocytosis, aplastic anaemia and hepatotoxicity, which is why blood counts and liver tests are monitored in the early months. Contraindicated in sulfonamide or salicylate hypersensitivity and in intestinal or urinary obstruction. It interferes with folate absorption, and it turns urine and sometimes skin yellow-orange and can permanently stain soft contact lenses.',
    },
    commonQuestions: [
      {
        q: 'Why does one drug treat both bowel disease and arthritis?',
        a: 'Because it is really two drugs joined together, and a different one does the work in each disease. Sulfasalazine is a sulfa antibiotic, sulfapyridine, chemically welded to an aspirin relative, 5-aminosalicylic acid, by a bond only colonic bacteria can break. In 1977 an experiment gave patients with active colitis enemas of the whole drug, or one half, or the other. About 30% improved on biopsy with the whole drug or with 5-ASA, and about 5% with sulfapyridine. In 1985 the same question was asked in rheumatoid arthritis and the answer reversed: sulfapyridine produced an effect comparable to the whole drug, and 5-ASA barely did anything. Two diseases, one molecule, opposite halves.',
      },
      {
        q: 'Should I be on mesalazine instead?',
        a: 'For ulcerative colitis, that is exactly the question the 1977 experiment set up. Mesalazine is 5-aminosalicylic acid delivered to the colon without the sulfa carrier, and it exists because the carrier turned out to do no useful work in that disease while causing most of the side effects — rash, headache, nausea and reversible reduction in sperm count. For rheumatoid arthritis the same substitution makes no sense, because there the carrier is the active drug. Sulfasalazine is also considerably cheaper than mesalazine, which is why it has not disappeared from colitis practice. The decision belongs with the prescriber and this page does not make it.',
      },
      {
        q: 'Is triple therapy really as good as a biologic?',
        a: 'The trial says not meaningfully worse, which is a slightly narrower claim. RACAT randomised 353 people whose rheumatoid arthritis was still active on methotrexate to either triple therapy — methotrexate, sulfasalazine and hydroxychloroquine — or etanercept plus methotrexate, and kept everyone blinded for 48 weeks. The change in disease activity score was -2.1 with triple therapy and -2.3 with the biologic, and non-inferiority was met with a comfortable margin. X-ray progression, pain, quality of life and major adverse events did not differ. The point estimate did favour the biologic by 0.2 points, and a non-inferiority design cannot show one treatment beating another. What it does show is that the difference is smaller than the threshold rheumatologists agreed in advance would matter, between a regimen costing a few dollars a month and one costing tens of thousands a year.',
        auditNote:
          'Twenty-seven percent of patients in each arm switched treatments at 24 weeks under blinding, so this is a comparison of treatment strategies rather than of two fixed regimens held for a year.',
      },
      {
        q: 'Why is my urine orange?',
        a: 'Because the molecule is literally an azo dye — the same chemistry that produced the industrial colourants of the early twentieth century, applied to a drug. Sulfasalazine and its metabolites colour urine yellow-orange and can tint skin, and they will permanently stain soft contact lenses. None of that indicates a problem. Yellowing of the whites of the eyes is entirely different and does need reporting, because that is jaundice and this drug can cause liver injury.',
      },
      {
        q: 'Does it affect fertility?',
        a: 'In men, yes, and reversibly. Sulfasalazine causes a reduction in sperm count and motility in a substantial proportion of men who take it, attributed to the sulfapyridine half. It resolves within a few months of stopping the drug or switching to mesalazine, which does not have the effect. It is a labelled adverse reaction and one of the more common practical reasons for changing treatment in a man with ulcerative colitis. There is no equivalent effect described in women, and unlike several other drugs in this batch — mycophenolate, leflunomide, methotrexate — sulfasalazine is not a recognised teratogen, though it does interfere with folate absorption.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Azad Khan AK, Piris J, Truelove SC. An experiment to determine the active therapeutic moiety of sulphasalazine. Lancet 1977;2:892-895',
        identifier: '10.1016/s0140-6736(77)90831-5',
        kind: 'doi',
      },
      {
        label:
          'Pullar T, Hunter JA, Capell HA. Which component of sulphasalazine is active in rheumatoid arthritis? Br Med J (Clin Res Ed) 1985;290:1535-1538',
        identifier: '10.1136/bmj.290.6481.1535',
        kind: 'doi',
      },
      {
        label:
          'O’Dell JR et al. Therapies for active rheumatoid arthritis after methotrexate failure. N Engl J Med 2013;369:307-318 (RACAT)',
        identifier: '10.1056/NEJMoa1303006',
        kind: 'doi',
      },
      {
        label:
          'Moreland LW et al. A randomized comparative effectiveness study of oral triple therapy versus etanercept plus methotrexate in early aggressive rheumatoid arthritis: the TEAR trial. Arthritis Rheum 2012;64:2824-2835',
        identifier: '10.1002/art.34498',
        kind: 'doi',
      },
      {
        label: 'RACAT / CSP 551: rheumatoid arthritis comparison of active therapies',
        identifier: 'NCT00405275',
        kind: 'nct',
      },
      {
        label: 'TEAR: treatment of early aggressive rheumatoid arthritis',
        identifier: 'NCT00259610',
        kind: 'nct',
      },
      {
        label: 'PubChem CID 5339 — sulfasalazine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5339',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 10. Leflunomide — equivalent to methotrexate rather than better than it, with a half-life
  //     measured in weeks that needs a chemical procedure to reverse, and two boxed warnings.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'leflunomide',
    name: 'Leflunomide',
    tradeName: 'Arava',
    sponsor:
      'Sanofi-Aventis, originally Hoechst Marion Roussel. Approved in the United States in September 1998 and generic since 2005; the active metabolite teriflunomide was separately developed and approved for relapsing multiple sclerosis in 2012.',
    targetGene: 'DHODH',
    targetProtein:
      'Dihydroorotate dehydrogenase, the mitochondrial inner-membrane enzyme catalysing the rate-limiting step of de novo pyrimidine synthesis. Inhibition is by the active metabolite teriflunomide, not by leflunomide itself.',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1998,
    indication:
      'Treatment of adults with active rheumatoid arthritis, to reduce signs and symptoms, inhibit structural damage as evidenced by radiographic erosions and joint space narrowing, and improve physical function',
    patientFriendlyIndication: 'Active rheumatoid arthritis',
    anatomicalSite:
      'The mitochondrial inner membrane of activated lymphocytes, where dihydroorotate dehydrogenase sits and where the pyrimidine supply for a dividing immune cell is decided',
    conditionContext: {
      conditionExplainer:
        'Rheumatoid arthritis is an immune attack on the lining of joints that erodes cartilage and bone. Mounting and sustaining it requires lymphocytes to divide, and dividing requires both purine and pyrimidine building blocks. The antimetabolites in this batch block the purine side; leflunomide is the one that blocks the pyrimidine side.',
      whyItMatters:
        'It was the first genuinely new conventional disease-modifying drug for rheumatoid arthritis in years when it arrived in 1998, and its registration trial showed it equal to methotrexate rather than better. What distinguishes it clinically is not potency but persistence: the active metabolite is recycled through the liver and gut so efficiently that it can take up to two years to clear, which is why stopping it requires a chemical procedure rather than simply stopping.',
      whoTakesThis:
        'Adults with active rheumatoid arthritis, usually where methotrexate has failed or cannot be tolerated. It is also used off-label in psoriatic arthritis and, at times, in BK virus nephropathy after transplantation.',
      clinicalGoals:
        'Reduce symptoms and slow radiographic erosion. The two constraints that shape every decision about it are liver injury, monitored monthly at first, and the fact that it must not reach a pregnancy.',
    },
    oneSentenceVerdict:
      'A prodrug whose active metabolite blocks the rate-limiting enzyme of pyrimidine synthesis and so starves dividing lymphocytes of the other half of the DNA alphabet — in its 482-patient registration trial it produced an ACR20 response in 52% against 26% on placebo and 46% on methotrexate, statistically superior to placebo and equivalent to methotrexate, and it carries boxed warnings for embryo-fetal toxicity and for severe liver injury including fatal liver failure.',
    laymanHowItWorks:
      'DNA is built from two families of chemical letters, and an immune cell preparing to divide has to manufacture both. Leflunomide is inert until the body converts it into its working form, which then blocks the single enzyme that controls production of one of those families. Immune cells, which cannot get enough of these letters by recycling, stall. Most other cells can recycle enough to carry on. The working form is reabsorbed from the gut over and over instead of being excreted, so it stays in the body for months to years after the last tablet — which is why coming off it usually means taking a second drug to strip it out.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 66,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.3247 per tablet at United States pharmacy acquisition cost (CMS NADAC, generic, median across 20 listed products, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in 1998 and generic in the United States since 2005, at about 32 cents a tablet. The commercially interesting move came later: teriflunomide, the active metabolite that leflunomide converts into, was developed as a separate product and approved for relapsing multiple sclerosis in 2012 under its own patents. A metabolite of a generic drug, marketed as a new medicine for a different disease, is a legitimate development path and also a recognisable one.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The comparator that matters is methotrexate, and the registration trial found the two statistically equivalent — 52% against 46% ACR20 response, with both clearly better than placebo at 26%. That makes leflunomide an alternative to methotrexate rather than an advance on it, chosen mostly when methotrexate has failed or cannot be tolerated. Sulfasalazine is the other conventional option and is part of the triple regimen that matched a biologic in RACAT. Nothing sold as a food or supplement modifies rheumatoid arthritis, and this is one of the drugs where delay has a measurable cost, because erosion accumulates.',
      conventionalRx: [
        {
          name: 'Methotrexate',
          class: 'Antifolate disease-modifying antirheumatic drug',
          howItCompares:
            'The active comparator in the registration trial. ACR20 response was 46% on methotrexate against 52% on leflunomide and 26% on placebo, described as statistically equivalent between the two active drugs, with mean time to initial response of 9.5 weeks against 8.4. Both slowed radiographic progression against placebo (P=0.02 and P=0.001).',
          typicalCost:
            'Generic; among the cheapest disease-modifying antirheumatic drugs available',
          prosAndCons:
            'Pros: weekly rather than daily, the reference drug against which everything else is measured, decades of accumulated data. Cons: also hepatotoxic, also teratogenic, and it was the drug the patients in most modern trials had already failed.',
        },
        {
          name: 'Sulfasalazine, with methotrexate and hydroxychloroquine',
          class: 'Conventional triple therapy',
          howItCompares:
            'The combination found non-inferior to etanercept plus methotrexate over 48 weeks in 353 patients, with a DAS28 change of -2.1 against -2.3. It is the cheapest effective regimen in rheumatology and it is not hepatotoxic in the way leflunomide is.',
          typicalCost:
            'US$0.2003 per sulfasalazine tablet at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: no leflunomide-scale hepatotoxicity, no two-year washout, evidence against a biologic. Cons: multiple tablets several times daily, sulfa intolerance, and reversible male infertility.',
        },
        {
          name: 'TNF inhibitors and other biologics',
          class: 'Biologic disease-modifying antirheumatic drugs',
          howItCompares:
            'The next step where conventional drugs fail. RACAT and TEAR both found a conventional triple regimen clinically comparable to etanercept plus methotrexate, though TEAR found a small radiographic advantage for the biologic (0.64 against 1.69 change from baseline, P=0.047).',
          typicalCost:
            'Tens of thousands of United States dollars per year at list price, against roughly 32 cents a tablet for leflunomide',
          prosAndCons:
            'Pros: no hepatotoxicity of this kind, no washout problem. Cons: cost, injection or infusion, and serious infection risk including tuberculosis reactivation.',
        },
        {
          name: 'Teriflunomide (Aubagio)',
          class: 'The active metabolite of leflunomide, marketed for multiple sclerosis',
          howItCompares:
            'Not a substitute in rheumatoid arthritis — it is the same active molecule reaching the same enzyme, developed and priced as a separate product for a different disease. Anyone taking leflunomide is already producing teriflunomide, which is why the two are never combined and why the same accelerated elimination procedure applies to both.',
          typicalCost:
            'Marketed as a branded multiple sclerosis therapy; generics have since entered',
          prosAndCons:
            'Pros: none over leflunomide in rheumatoid arthritis; it is the same active species. Cons: the same boxed warnings for hepatotoxicity and embryo-fetal toxicity, for the same reason.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Pregnancy must be excluded before starting, not discovered afterwards',
          action:
            'Anyone of reproductive potential should confirm they are not pregnant before the first tablet and use reliable contraception throughout.',
          patientImpact:
            'The label contraindicates leflunomide in pregnancy, and teratogenicity and embryo-lethality occurred in animals at exposures below the human level. Because the active metabolite persists for months to years, stopping the drug is not by itself sufficient.',
          clinicalPrecaution:
            'The label directs that if pregnancy occurs, the drug is stopped and an accelerated drug elimination procedure is started. That procedure exists because ordinary discontinuation does not clear the drug on any useful timescale.',
        },
        {
          name: 'Monthly liver tests are part of the treatment, not an optional extra',
          action:
            'Keep the blood test appointments in the first six months, and report dark urine, pale stools, itching or yellowing of the eyes at once.',
          patientImpact:
            'The label carries a boxed warning for severe liver injury including fatal liver failure. It directs ALT monitoring at least monthly for six months after starting and every six to eight weeks thereafter, and it names patients with pre-existing liver disease or a baseline ALT above twice the upper limit of normal as people who should not be treated.',
          clinicalPrecaution:
            'If liver injury is suspected the label directs stopping the drug, starting the accelerated elimination procedure and monitoring liver tests weekly until they normalise.',
        },
        {
          name: 'Understand that stopping is a two-step process',
          action:
            'If the drug needs to come out — for pregnancy, for liver injury, or to switch to something else — ask about the elimination procedure rather than simply stopping.',
          patientImpact:
            'The active metabolite is reabsorbed from the gut instead of being excreted, and plasma concentrations can remain detectable for up to two years after the last tablet. Cholestyramine or activated charcoal interrupts that recycling and brings the level down in about eleven days.',
          clinicalPrecaution:
            'This is a description of a labelled procedure, not instruction on how to carry one out. It matters because it is the single most surprising practical fact about this drug.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC1=C(C=NO1)C(=O)NC2=CC=C(C=C2)C(F)(F)F',
      chemicalFormula: 'C12H9F3N2O2',
      molecularWeight: '270.21 g/mol',
      targetReceptorAffinity:
        'Leflunomide has no meaningful activity at the target. It opens under physiological conditions to teriflunomide, the malononitrilamide that inhibits dihydroorotate dehydrogenase. Teriflunomide is over 99% protein bound with a very small volume of distribution and a half-life of roughly two weeks, sustained by extensive enterohepatic recirculation; plasma concentrations can remain measurable for up to two years after the last dose.',
      structureSource: {
        label:
          'PubChem CID 3899 (leflunomide) — canonical SMILES, molecular formula C12H9F3N2O2 and molecular weight 270.21 g/mol, re-checked against the PUG REST property endpoint',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3899',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'lef-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Set a limit on teriflunomide already present in the tablet',
          description:
            'The isoxazole ring opens to teriflunomide under mild conditions, including on storage in humidity. Because teriflunomide is the active species with a two-week half-life, a batch carrying it as an impurity is not a slightly degraded product; it is a partially pre-activated one with different early kinetics.',
          reagentsAndBuffer:
            'Leflunomide reference standard and teriflunomide reference standard, reversed-phase HPLC with ultraviolet detection at 260 nm, forced-degradation study under humidity and acid, Karl Fischer water content',
        },
        {
          id: 'lef-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Amide coupling of 5-methylisoxazole-4-carboxylic acid to 4-trifluoromethylaniline',
          description:
            'Activate 5-methylisoxazole-4-carboxylic acid and couple it to 4-(trifluoromethyl)aniline. A two-step sequence from commercial starting materials, which is why the finished tablet costs about thirty cents. The trifluoromethyl group is what gives the metabolite its long residence on the enzyme and its resistance to metabolic clearance.',
          dependsOnStepId: 'lef-w1',
          reagentsAndBuffer:
            '5-methylisoxazole-4-carboxylic acid, thionyl chloride or a carbodiimide coupling agent, 4-(trifluoromethyl)aniline, triethylamine base in dichloromethane or toluene, anhydrous conditions to prevent premature ring opening',
        },
        {
          id: 'lef-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallise under conditions that do not open the ring',
          description:
            'Purify and dry without exposing the isoxazole to the base or moisture that would convert it to teriflunomide. Purification conditions here are constrained by the same chemistry that makes the prodrug work, which is unusual: the instability being avoided in the factory is the instability being relied on in the patient.',
          dependsOnStepId: 'lef-w2',
          reagentsAndBuffer:
            'Recrystallisation from ethanol or ethyl acetate-heptane at controlled pH, vacuum drying at moderate temperature, HPLC against the teriflunomide standard as the critical related-substance limit',
        },
        {
          id: 'lef-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Ring opening and DHODH occupancy in activated lymphocytes',
          description:
            'Confirm conversion to teriflunomide and measure inhibition of dihydroorotate dehydrogenase in intact activated lymphocytes rather than in isolated enzyme. The enzyme is on the inner mitochondrial membrane and is coupled to the respiratory chain through ubiquinone, so an isolated-enzyme assay omits the compartment the drug actually has to reach.',
          dependsOnStepId: 'lef-w3',
          reagentsAndBuffer:
            'Anti-CD3 activated primary human lymphocytes, LC-MS/MS quantification of leflunomide and teriflunomide, dihydroorotate to orotate conversion measured by 2,6-dichloroindophenol reduction in permeabilised cells, brequinar as a mechanistic comparator',
        },
        {
          id: 'lef-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Uridine rescue, to prove the effect is pyrimidine starvation',
          description:
            'Repeat the proliferation assay with uridine added to the medium. Supplying uridine bypasses the blocked de novo pathway through salvage; if proliferation recovers, the assay is measuring pyrimidine starvation rather than general toxicity. Without this control, the tyrosine kinase inhibition that teriflunomide also shows at higher concentrations cannot be excluded as the explanation.',
          dependsOnStepId: 'lef-w4',
          reagentsAndBuffer:
            'CFSE dilution or tritiated thymidine incorporation in activated lymphocytes, uridine-supplemented and unsupplemented parallel arms, viability counterscreen, matched-concentration teriflunomide control',
        },
      ],
    },
    keyAudits: [
      {
        id: 'lef-a1',
        category: 'measured',
        title: 'US301: better than placebo, statistically equivalent to methotrexate',
        laymanSummary:
          'The registration trial compared leflunomide against a dummy tablet and against methotrexate in 482 patients over a year. About half responded on leflunomide, about half on methotrexate, and about a quarter on placebo. The new drug beat placebo clearly, and did not beat the old drug.',
        technicalDetails:
          'A randomised, double-blind, placebo- and active-controlled 12-month study at 47 centres in the United States and Canada enrolled 482 patients with rheumatoid arthritis of at least six months’ duration and no previous methotrexate treatment, randomised to leflunomide 20 mg daily, placebo, or methotrexate 7.5 to 15 mg weekly. ACR20 response and success rates were 52% and 41% for leflunomide, 46% and 35% for methotrexate, and 26% and 19% for placebo (P<0.001 against placebo for both active arms), with the two active treatments described as statistically equivalent. Mean time to initial response was 8.4 weeks on leflunomide against 9.5 on methotrexate. Radiographic progression was less with leflunomide (P=0.001) and methotrexate (P=0.02) than placebo. Asymptomatic transaminase elevations caused discontinuation in 7.1% on leflunomide, 3.3% on methotrexate and 1.7% on placebo.',
        evidenceSource:
          'Strand V et al., Leflunomide Rheumatoid Arthritis Investigators Group, Arch Intern Med 1999;159:2542-2550',
        doi: '10.1001/archinte.159.21.2542',
        measuredMetric:
          'ACR20 response and success rate at 52 weeks, and radiographic progression, against placebo and against methotrexate',
        auditFlag: 'verified',
      },
      {
        id: 'lef-a2',
        category: 'failed',
        title:
          'Hepatotoxicity: transaminase discontinuations at four times the placebo rate, then a boxed warning',
        laymanSummary:
          'Even in the registration trial, liver enzyme rises made people stop the drug four times as often as placebo. Severe liver injury including fatal liver failure was reported afterwards, and the label now carries a boxed warning and a monthly blood test schedule.',
        technicalDetails:
          'In the registration trial, asymptomatic transaminase elevations resulted in treatment discontinuation for 7.1% of leflunomide patients against 3.3% on methotrexate and 1.7% on placebo. The label now carries a boxed warning stating that severe liver injury, including fatal liver failure, has been reported in patients treated with the drug; that it is contraindicated in severe hepatic impairment; that concomitant use with other potentially hepatotoxic drugs may increase risk; and that patients with pre-existing acute or chronic liver disease or a baseline ALT above twice the upper limit of normal are at increased risk and should not be treated. It directs ALT monitoring at least monthly for six months after starting and every six to eight weeks thereafter, and, if drug-induced liver injury is suspected, stopping the drug, starting the accelerated elimination procedure and monitoring liver tests weekly.',
        evidenceSource:
          'ARAVA (leflunomide) tablets United States prescribing information, boxed warning "Hepatotoxicity"; Strand V et al., Arch Intern Med 1999;159:2542-2550',
        doi: '10.1001/archinte.159.21.2542',
        measuredMetric:
          'Discontinuation for asymptomatic transaminase elevation, 7.1% against 1.7% on placebo, in the registration trial',
        auditFlag: 'caution',
      },
      {
        id: 'lef-a3',
        category: 'measured',
        title: 'A drug you cannot simply stop taking',
        laymanSummary:
          'The active form is reabsorbed from the gut over and over rather than being excreted, so it can still be detectable up to two years after the last tablet. Getting it out requires taking a second drug that interrupts the recycling, which brings the level down in about eleven days.',
        technicalDetails:
          'Teriflunomide is over 99% protein bound with a small volume of distribution and undergoes extensive enterohepatic recirculation, giving a half-life of roughly two weeks and plasma concentrations that may remain measurable for up to two years after discontinuation. The label describes an accelerated drug elimination procedure — cholestyramine or activated charcoal, which interrupt the recirculation — that reduces plasma concentrations substantially over about eleven days. The label directs that this procedure be used if pregnancy occurs, if serious liver injury is suspected, and before switching to certain other agents. This kinetic property, not potency, is what most distinguishes the drug clinically.',
        evidenceSource:
          'ARAVA (leflunomide) tablets United States prescribing information, boxed warning, Warnings and Precautions and Clinical Pharmacology sections',
        measuredMetric:
          'Plasma teriflunomide concentration decline with and without an accelerated elimination procedure, as described on the label',
        auditFlag: 'verified',
      },
      {
        id: 'lef-a4',
        category: 'failed',
        title: 'The embryo-fetal warning has to be read together with the half-life',
        laymanSummary:
          'The drug is contraindicated in pregnancy, and animal studies showed harm at exposures below what a person receives. The difficulty is that stopping the tablets does not remove the drug for a very long time, so avoiding pregnancy has to be planned rather than reacted to.',
        technicalDetails:
          'The boxed warning states that the drug is contraindicated for use in pregnant women because of the potential for fetal harm, that teratogenicity and embryo-lethality occurred in animals administered leflunomide at doses lower than the human exposure level, and that pregnancy must be excluded before starting treatment in females of reproductive potential. It directs effective contraception during treatment and during an accelerated drug elimination procedure after treatment, and directs stopping the drug and starting that procedure if a patient becomes pregnant. The clinical consequence of combining a contraindication in pregnancy with a metabolite detectable for up to two years is that discontinuation alone does not make the drug safe to conceive on, and the label handles this by making elimination an explicit procedure rather than a matter of waiting.',
        evidenceSource:
          'ARAVA (leflunomide) tablets United States prescribing information, boxed warning "Embryo-Fetal Toxicity"',
        measuredMetric:
          'Teratogenicity and embryo-lethality in animals at exposures below the human clinical level, as stated on the label',
        auditFlag: 'caution',
      },
      {
        id: 'lef-a5',
        category: 'inferred',
        title:
          'Equivalence to methotrexate is not superiority, and the trial reported both drugs plainly',
        laymanSummary:
          'Leflunomide arrived as the first new conventional drug for rheumatoid arthritis in years, and it was often described that way. What its own registration trial showed was that it performed about the same as the drug already in use, with more liver-enzyme problems.',
        technicalDetails:
          'The registration trial reported ACR20 response of 52% for leflunomide and 46% for methotrexate and described them as statistically equivalent — a term that in this design means no significant difference was detected between the active arms, in a trial powered to distinguish each from placebo rather than from each other. A trial with 482 patients across three arms has limited power to detect a modest difference between two active drugs. What the trial does establish is that leflunomide is clearly better than nothing on both symptoms and radiographs. What it does not establish, and was not designed to, is a reason to prefer it over methotrexate in a patient who tolerates methotrexate — and the discontinuation figures for transaminase elevation, 7.1% against 3.3%, point the other way.',
        evidenceSource: 'Strand V et al., Arch Intern Med 1999;159:2542-2550',
        doi: '10.1001/archinte.159.21.2542',
        inferredClaim:
          'That leflunomide is an improvement on methotrexate — the registration trial found the two statistically equivalent on response, with more transaminase-driven discontinuation on leflunomide',
        auditFlag: 'caution',
      },
      {
        id: 'lef-a6',
        category: 'conclusion_shift',
        title: 'The metabolite became a separate drug for a different disease',
        laymanSummary:
          'Leflunomide is inert until the body turns it into teriflunomide. In 2012 teriflunomide itself was approved as a new medicine for multiple sclerosis, under its own patents, more than a decade after leflunomide had gone generic. The molecule doing the work was the same one all along.',
        technicalDetails:
          'Leflunomide is a prodrug that opens to teriflunomide, the malononitrilamide that inhibits dihydroorotate dehydrogenase. Teriflunomide was developed separately, tested in relapsing multiple sclerosis, and approved in 2012 with its own labelling, its own price and its own patent protection, while leflunomide had been generic in the United States since 2005. Both carry boxed warnings for hepatotoxicity and embryo-fetal toxicity, and both are subject to the same accelerated elimination procedure, because they are the same active species. Developing a known active metabolite for a new indication is a legitimate and reasonably common path, and the resulting situation — a generic drug and a branded drug that a patient’s liver cannot distinguish between — is worth stating plainly.',
        evidenceSource:
          'ARAVA (leflunomide) United States prescribing information, Clinical Pharmacology (conversion to teriflunomide); Drugs@FDA record for ARAVA, NDA 020905',
        inferredClaim:
          'That teriflunomide represents a distinct therapeutic advance over leflunomide — it is the active metabolite leflunomide produces, developed for a different disease and priced accordingly',
        auditFlag: 'contested',
      },
      {
        id: 'lef-a7',
        category: 'measured',
        title: 'Radiographic progression slowed, which is the endpoint that matters most',
        laymanSummary:
          'Beyond how people felt, the trial measured joint damage on X-ray after a year. Both leflunomide and methotrexate showed less progression than placebo, and leflunomide’s result was the stronger of the two by p-value.',
        technicalDetails:
          'X-ray analyses in the registration trial demonstrated less disease progression with leflunomide (P=0.001) and with methotrexate (P=0.02) than with placebo. Both active treatments also improved physical function and health-related quality of life significantly more than placebo (P<0.001 and P<0.05 respectively). A structural endpoint is the strongest evidence available in rheumatoid arthritis short of long-term disability, because erosion is irreversible and symptom scores are not. The p-values should not be read as ranking the two active drugs against each other: each is a comparison against placebo, and a smaller p-value in one comparison does not establish superiority in a comparison that was not made.',
        evidenceSource: 'Strand V et al., Arch Intern Med 1999;159:2542-2550',
        doi: '10.1001/archinte.159.21.2542',
        measuredMetric:
          'Radiographic disease progression at 12 months against placebo, in the intent-to-treat population',
        auditFlag: 'verified',
      },
      {
        id: 'lef-a8',
        category: 'inferred',
        title: 'The selectivity argument depends on a salvage pathway the assays have to test for',
        laymanSummary:
          'The reason this drug is supposed to hit immune cells and spare everything else is that most cells can recycle the building blocks it blocks, and activated immune cells cannot. That is well supported in cell culture and it is an inference about what happens in a person.',
        technicalDetails:
          'Teriflunomide inhibits dihydroorotate dehydrogenase, the rate-limiting enzyme of de novo pyrimidine synthesis. Resting and most somatic cells meet their pyrimidine needs through the salvage pathway and are relatively unaffected; activated lymphocytes expand their pyrimidine pool roughly eightfold and depend on de novo synthesis to do so. This is demonstrable in vitro by the uridine rescue experiment, in which adding uridine to the medium restores proliferation. In humans the corresponding demonstration does not exist, and the drug additionally inhibits several tyrosine kinases at higher concentrations, an activity whose clinical contribution is unquantified. The observed toxicity profile — hepatic injury, diarrhoea, hypertension, peripheral neuropathy, interstitial lung disease — is not obviously confined to tissues lacking salvage capacity.',
        evidenceSource:
          'ARAVA (leflunomide) United States prescribing information, Clinical Pharmacology, Mechanism of Action; Strand V et al., Arch Intern Med 1999;159:2542-2550',
        inferredClaim:
          'That lymphocyte selectivity explains the clinical effect and the toxicity profile — the pathway dependence is established in cell culture, the human demonstration does not exist, and the drug has activities beyond DHODH',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed as a closed ring that opens in the body',
        laymanDesc:
          'The tablet contains an inert molecule. Almost as soon as it is absorbed, a chemical ring in it opens up, and the opened form is the drug.',
        molecularDetail:
          'Leflunomide is an isoxazole that undergoes ring opening to teriflunomide, a malononitrilamide, largely in the gut wall and liver and partly non-enzymatically. Conversion is essentially complete, and leflunomide itself is undetectable in plasma at steady state.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The active form is recycled instead of excreted',
        laymanDesc:
          'Rather than being cleared, the working molecule is sent into the bile, reabsorbed from the gut, and sent round again. This is why it lasts for months.',
        molecularDetail:
          'Teriflunomide is over 99% protein bound with a very small volume of distribution and undergoes extensive enterohepatic recirculation, giving an elimination half-life of roughly two weeks and detectable plasma concentrations for up to two years. Cholestyramine or activated charcoal binds it in the gut, interrupts the loop and reduces concentrations over about eleven days.',
        iconName: 'Repeat',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It blocks one enzyme on the mitochondrial membrane',
        laymanDesc:
          'Deep inside the cell, on the surface of the mitochondrion, sits the enzyme that controls production of one of the two families of DNA building blocks. The drug binds it and stops it.',
        molecularDetail:
          'Teriflunomide binds dihydroorotate dehydrogenase, an inner mitochondrial membrane flavoenzyme coupled to the respiratory chain through ubiquinone, which catalyses the fourth and rate-limiting step of de novo pyrimidine synthesis — oxidation of dihydroorotate to orotate.',
        iconName: 'Ban',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Activated lymphocytes cannot expand their pyrimidine pool',
        laymanDesc:
          'Most cells in the body can recycle enough building blocks to get by. An immune cell that has just been activated needs roughly eight times more than usual and cannot recycle its way there, so it stalls.',
        molecularDetail:
          'Resting and most somatic cells meet their pyrimidine requirement through the salvage pathway; activated lymphocytes expand their pyrimidine pool approximately eightfold and depend on de novo synthesis. The dependence is demonstrable in vitro by uridine rescue. Teriflunomide additionally inhibits several tyrosine kinases at higher concentrations, with unquantified clinical contribution.',
        iconName: 'Target',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Symptoms improve and joint erosion slows',
        laymanDesc:
          'About half of patients met the standard response threshold at a year, against a quarter on placebo, and X-rays showed less new joint damage.',
        molecularDetail:
          'ACR20 response 52% against 26% on placebo and 46% on methotrexate in 482 patients over 52 weeks, with mean time to initial response of 8.4 weeks. Radiographic progression was less than placebo at P=0.001, and physical function and quality of life improved at P<0.001.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'The liver and a possible pregnancy are the two hard limits',
        laymanDesc:
          'The drug can injure the liver badly, and it must not reach a pregnancy. Both of those are made harder by the fact that stopping the tablets does not remove the drug for a very long time.',
        molecularDetail:
          'Boxed warnings for embryo-fetal toxicity and for severe liver injury including fatal liver failure. Discontinuation for asymptomatic transaminase elevation was 7.1% against 1.7% on placebo in the registration trial. Because teriflunomide persists for up to two years, both problems are managed with an accelerated elimination procedure rather than by discontinuation alone.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'US301 leflunomide registration trial (Strand 1999)',
        phase: 'Phase 3, randomised, double-blind, placebo- and active-controlled, 12 months',
        sampleSize: 482,
        primaryEndpoint:
          'American College of Rheumatology success rate — completing 52 weeks of treatment and meeting ACR20 response criteria',
        endpointMet: true,
        statisticalPValue:
          'ACR20 response 52% leflunomide, 46% methotrexate, 26% placebo; success rate 41%, 35%, 19%; P<0.001 for both active arms against placebo, active arms statistically equivalent to each other',
        unreportedAdverseSignals:
          'Discontinuation for asymptomatic transaminase elevation was 7.1% on leflunomide against 3.3% on methotrexate and 1.7% on placebo. The trial was powered against placebo, not to distinguish the two active drugs, so "statistically equivalent" describes an absence of detected difference rather than a demonstrated equivalence.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'ACR20 response 52% on leflunomide against 26% on placebo and 46% on methotrexate in 482 patients over 52 weeks, P<0.001 against placebo',
        'ACR success rate — completing 52 weeks and meeting ACR20 — of 41%, 19% and 35% respectively',
        'Less radiographic progression than placebo with leflunomide (P=0.001) and methotrexate (P=0.02)',
        'Discontinuation for asymptomatic transaminase elevation in 7.1% on leflunomide against 1.7% on placebo',
        'Mean time to initial response 8.4 weeks on leflunomide against 9.5 weeks on methotrexate',
      ],
      unsupportedInferences: [
        'That leflunomide is an improvement on methotrexate — its own registration trial found the two statistically equivalent, with more liver-driven discontinuation',
        'That lymphocyte selectivity through salvage-pathway dependence explains both the effect and the toxicity profile in humans; the demonstration is in cell culture',
        'That teriflunomide is a distinct therapeutic advance, when it is the active metabolite leflunomide already produces',
        'That a smaller p-value against placebo for radiographic progression ranks leflunomide above methotrexate; that comparison was not made',
      ],
      whatFailedInitially: [
        'Severe liver injury including fatal liver failure was reported after approval and is now the second half of a boxed warning',
        'Transaminase elevations forced discontinuation in more than four times as many patients as placebo in the registration trial itself',
        'The drug cannot be reliably withdrawn by stopping it: the active metabolite persists for up to two years and needs a chemical elimination procedure',
        'It did not displace methotrexate as first-line conventional therapy, because it never showed a reason to',
      ],
      realWorldOutcome: [
        'Generic in the United States since 2005, at about 32 cents a tablet at pharmacy acquisition cost',
        'Established as a genuine alternative for patients in whom methotrexate fails or cannot be tolerated',
        'Its active metabolite was separately developed and approved for relapsing multiple sclerosis in 2012',
        'One of very few drugs whose label describes a procedure for removing it from the body, which is the practical fact most often missed',
      ],
    },
    deliverySystem: {
      type: 'Oral film-coated tablet, 10 mg and 20 mg',
      description:
        'Rapidly and almost completely converted to teriflunomide, so leflunomide itself is not detectable in plasma at steady state. Teriflunomide is more than 99% protein bound with a very small volume of distribution and is cleared slowly through extensive enterohepatic recirculation, giving a half-life of roughly two weeks and measurable concentrations for up to two years after the last dose. Because of that, the label describes an accelerated drug elimination procedure using cholestyramine or activated charcoal, which reduces plasma concentrations substantially over about eleven days and is directed for pregnancy, suspected liver injury and certain treatment switches.',
      safetyProfile:
        'Two boxed warnings. Embryo-fetal toxicity: contraindicated in pregnancy, with teratogenicity and embryo-lethality in animals at exposures below the human level; pregnancy must be excluded before starting and effective contraception used during treatment and during the elimination procedure. Hepatotoxicity: severe liver injury including fatal liver failure has been reported; contraindicated in severe hepatic impairment; patients with pre-existing liver disease or baseline ALT above twice the upper limit of normal should not be treated; ALT monitored at least monthly for six months and then every six to eight weeks. Other labelled risks include serious infection including tuberculosis reactivation, interstitial lung disease, peripheral neuropathy, hypertension, severe cutaneous reactions including Stevens-Johnson syndrome and toxic epidermal necrolysis, and blood dyscrasias.',
    },
    commonQuestions: [
      {
        q: 'Is leflunomide better than methotrexate?',
        a: 'Its own registration trial says the two are statistically equivalent. In 482 patients over a year, ACR20 response was 52% on leflunomide, 46% on methotrexate and 26% on placebo; both active drugs clearly beat placebo and neither beat the other. Both slowed X-ray progression. Where they differed was tolerability of a specific kind: discontinuation for raised liver enzymes was 7.1% on leflunomide against 3.3% on methotrexate and 1.7% on placebo. Leflunomide is a real alternative for someone in whom methotrexate has failed or cannot be tolerated. It is not an upgrade, and the trial that introduced it did not claim to be showing one.',
      },
      {
        q: 'Why can I not just stop taking it?',
        a: 'Because stopping the tablets does not remove the drug. Leflunomide converts to teriflunomide, which is over 99% bound to plasma proteins and is repeatedly secreted into bile and reabsorbed from the gut instead of being excreted. Its half-life is about two weeks, and the label states that plasma concentrations may remain detectable for up to two years after the last dose. That is why the label describes an accelerated drug elimination procedure — cholestyramine or activated charcoal, which bind the drug in the gut and break the recycling loop, reducing concentrations substantially over about eleven days. The procedure is directed if pregnancy occurs, if serious liver injury is suspected, and before certain treatment switches.',
        auditNote:
          'This is the single most practically important fact about the drug and the one least likely to be understood in advance. It turns "I stopped taking it" into a statement that says nothing about whether the drug is still present.',
      },
      {
        q: 'How dangerous is it for the liver?',
        a: 'Enough to have a boxed warning of its own. The label states that severe liver injury, including fatal liver failure, has been reported. It contraindicates the drug in severe hepatic impairment, says that patients with pre-existing acute or chronic liver disease or a baseline ALT above twice the upper limit of normal should not be treated, and warns that other potentially hepatotoxic drugs increase the risk. Monitoring is monthly for the first six months and then every six to eight weeks. If injury is suspected the label directs stopping the drug, starting the elimination procedure, and checking liver tests weekly until they normalise. In the registration trial, before any of this was known, asymptomatic enzyme rises caused 7.1% of patients to stop.',
      },
      {
        q: 'What if I want to have a baby?',
        a: 'That conversation needs to happen before starting the drug, not after. Leflunomide is contraindicated in pregnancy, and animal studies showed teratogenicity and embryo-lethality at exposures below the human level. The difficulty specific to this drug is the persistence: because the active metabolite can remain detectable for up to two years, simply stopping does not make conception safe. The label handles that by directing effective contraception during treatment and during an accelerated elimination procedure afterwards, and by directing that the procedure be started if a patient becomes pregnant while taking it. This page describes the labelled position; the planning belongs with the prescriber.',
      },
      {
        q: 'Is Aubagio the same drug?',
        a: 'It is the same active molecule. Leflunomide is inert until the body opens a chemical ring in it to produce teriflunomide, and teriflunomide is what Aubagio contains. It was developed separately, tested in relapsing multiple sclerosis, and approved in 2012 with its own patents and its own price, seven years after leflunomide had gone generic in the United States. Both carry boxed warnings for hepatotoxicity and embryo-fetal toxicity, and the same accelerated elimination procedure applies to both, because at the level of the enzyme they are indistinguishable. Developing a known active metabolite for a new indication is legitimate; what this page records is that the molecule doing the work was the same one throughout.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Strand V et al. Treatment of active rheumatoid arthritis with leflunomide compared with placebo and methotrexate. Arch Intern Med 1999;159:2542-2550',
        identifier: '10.1001/archinte.159.21.2542',
        kind: 'doi',
      },
      {
        label:
          'DailyMed: ARAVA (leflunomide) tablets, Sanofi-Aventis — boxed warnings for embryo-fetal toxicity and hepatotoxicity, and the accelerated drug elimination procedure',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=320f63f2-fac3-4aee-aff8-85724e00ef52',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA: ARAVA (leflunomide), NDA 020905, Sanofi-Aventis — label and approval history',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020905',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 3899 — leflunomide structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3899',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
]
