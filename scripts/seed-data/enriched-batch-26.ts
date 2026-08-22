import type { SeedDossier } from '@/lib/seed-types'

/**
 * Curated flagship dossiers — the anti-infectives and the immunosuppressants. The antibiotics at
 * the top of every dispensing table, the antiviral that made herpes manageable, and the three old
 * cytotoxic and antimalarial molecules that were repurposed into the drugs that hold rheumatoid
 * arthritis, lupus and hormone-receptor-positive breast cancer.
 *
 * Editorial layer written over the machine-enriched records: the verdict, the mechanism carousel
 * and the audits, which no pipeline can produce. The identity facts — slug, trade name, sponsor,
 * approval year, SMILES, molecular formula — are copied from the enriched record rather than
 * researched again.
 *
 * Every DOI, PMID, NCT number and FDA application number below was resolved against the NCBI
 * E-utilities, the ClinicalTrials.gov registry or the openFDA label and Drugs@FDA endpoints at the
 * time of writing. Sample sizes, hazard ratios, risk ratios, confidence intervals and p-values are
 * copied from the published abstract or from the FDA label, never from memory. Where a number
 * could not be sourced, the field is absent.
 *
 * Five conventions apply to the whole group.
 *
 * 1. AN ANTIBIOTIC IS THE ONLY DRUG CLASS WHOSE BENEFIT DECAYS BECAUSE IT WAS USED. Every other
 *    drug on this site works as well in 2026 as it did at approval. These do not: the label of
 *    every antibacterial here opens with the same sentence about reducing the development of
 *    drug-resistant bacteria, and the trials that licensed them were run against susceptibility
 *    patterns that no longer hold. A cure rate from a 1996 registration trial is a historical
 *    measurement, not a current one, and every page here says so.
 *
 * 2. A SYMPTOM ENDPOINT IS NOT A COMPLICATION ENDPOINT. Sore throat resolving a day earlier,
 *    a herpes lesion crusting two days sooner, a fever avoided during chemotherapy — these are
 *    what the trials measured. Rheumatic fever, encephalitis and death from sepsis are what the
 *    drugs are feared into being prescribed for, and they are different measurements taken in
 *    different eras. Where the hard endpoint exists it is on the page; where it does not, or where
 *    it failed — CIRT, the Partners in Prevention HSV/HIV trial, RECOVERY — the failure is on the
 *    page at the same weight as the success.
 *
 * 3. THE MOST INSTRUCTIVE RECORDS IN THIS GROUP ARE THE REVERSALS. Hydroxychloroquine retinopathy
 *    turned out to be roughly ten times commoner than the figure that had been taught for forty
 *    years, and the dosing rule changed because of it. CYP2D6 genotyping was going to personalise
 *    tamoxifen until the two largest analyses found no association. Ninety-five per cent of people
 *    labelled penicillin-allergic are not. Those stories are on their pages because they are the
 *    clearest available demonstration of what an evidence audit is for.
 *
 * 4. PRICING IS A PRICE, NOT A COST. Every price here is the CMS National Average Drug Acquisition
 *    Cost — what a United States retail pharmacy pays a wholesaler — and is labelled as such.
 *    `synthesisCostPerDose` is empty on every dossier in this file: the cost-of-production
 *    literature for the WHO Essential Medicines List publishes a method and an aggregate, and its
 *    per-molecule anti-infective figures sit in a supplementary appendix that could not be
 *    resolved and verified at the time of writing. An unverified cost is worse than an absent one.
 *
 * 5. NO DOSING, MONITORING, TITRATION OR PROCUREMENT GUIDANCE. Strengths and durations appear only
 *    where they are part of a trial's description, a licensed regimen's identity, or a documented
 *    safety reversal. Nothing here tells a reader what to take, how much, or for how long.
 */

const NADAC_SOURCE = {
  label:
    'CMS National Average Drug Acquisition Cost (NADAC) survey — what United States retail pharmacies pay to acquire a drug',
  identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
  kind: 'url' as const,
}

const COST_OF_PRODUCTION_SOURCE = {
  label:
    'Hill A, Barber MJ, Gotham D. Estimated costs of production and potential prices for the WHO Essential Medicines List. BMJ Glob Health 2018;3:e000571 — the cost-of-production literature checked for this group. It publishes an estimation method over 148 medicines and an aggregate result; its per-molecule anti-infective figures are in a supplementary appendix that could not be resolved at the time of writing, so no per-dose cost is stated on these pages',
  identifier: '10.1136/bmjgh-2017-000571',
  kind: 'doi' as const,
}

export const ENRICHED_BATCH_26_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // 1. Levofloxacin — the antibiotic whose own boxed warning tells doctors to reserve it for the
  //    three infections it was most often written for.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'levofloxacin',
    name: 'Levofloxacin',
    tradeName: 'Levaquin / Quixin / Iquix',
    sponsor:
      'Janssen Pharmaceuticals (originator, NDA 020634 tablets and NDA 020635 injection); originated at Daiichi in Japan as the active isomer of ofloxacin; generic in the United States since 2011 and made by many manufacturers',
    targetGene: 'gyrA and parC — bacterial genes, with no human counterpart',
    targetProtein:
      'Bacterial DNA gyrase and topoisomerase IV, the two type II topoisomerases that unwind and re-seal the chromosome during replication',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1996,
    indication:
      'Nosocomial and community-acquired pneumonia; complicated and uncomplicated skin and skin structure infections; chronic bacterial prostatitis; inhalational anthrax post-exposure; plague; complicated and uncomplicated urinary tract infection; acute pyelonephritis; acute bacterial exacerbation of chronic bronchitis; and acute bacterial sinusitis. For the last three of these the label directs that levofloxacin be reserved for patients who have no alternative treatment options',
    patientFriendlyIndication:
      'Serious bacterial infections — pneumonia, kidney and prostate infection, and exposure to anthrax or plague',
    anatomicalSite:
      'Inside the bacterial cell — the DNA gyrase and topoisomerase IV enzymes clamped on the chromosome at the replication fork',
    conditionContext: {
      conditionExplainer:
        'A bacterial infection is a population of organisms dividing faster than the immune system can clear them. Antibiotics do not heal tissue; they stop the population from growing so the immune system can finish. Which antibiotic works depends on which organism is present and on whether that organism has already met the drug, in this patient or in anybody else.',
      whyItMatters:
        'Levofloxacin covers an unusually wide range of organisms in one daily tablet that is almost completely absorbed by mouth, which made it the convenient answer to almost any respiratory or urinary complaint. That convenience is exactly what the FDA moved against in 2016: the drug is as effective as it ever was, and the regulator decided that for self-limiting infections the harm side of the ledger had grown too large.',
      whoTakesThis:
        'Adults with pneumonia, pyelonephritis, complicated urinary infection or chronic bacterial prostatitis; adults and children after anthrax or plague exposure. The label directs that it be avoided in people with a history of myasthenia gravis, tendon disorders or aortic aneurysm risk.',
      clinicalGoals:
        'Clinical cure and eradication of the organism. Those are the endpoints its registration trials measured. Whether it prevents death better than a narrower antibiotic in the same infection is a separate question its trials were not designed to answer.',
    },
    oneSentenceVerdict:
      'A fluoroquinolone that jams the two bacterial enzymes which unwind DNA, achieving 92.4% clinical success in five days at 750 mg against 91.1% in ten days at 500 mg in a 528-patient community-acquired pneumonia trial — and carrying a boxed warning that directs prescribers to reserve it for patients with no alternative in sinusitis, bronchitis and uncomplicated urinary infection, the three complaints it was most often written for.',
    laymanHowItWorks:
      'Bacterial DNA is a long loop that has to be unwound before it can be copied. Two bacterial enzymes, DNA gyrase and topoisomerase IV, cut the loop, pass a strand through and re-seal it. Levofloxacin traps those enzymes at the moment the DNA is cut, so the break is never repaired and the chromosome falls apart. Human cells use different enzymes for the same job, which is why the drug kills bacteria and not you — the serious harms it does cause, to tendons and nerves and the aorta, come from somewhere else and are not fully explained.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 66,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1339 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 22 listed generic tablet products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States on 20 December 1996 under NDA 020634 (tablets) and NDA 020635 (injection), and generic since 2011. It was among the most heavily prescribed branded antibiotics in the United States for the decade before genericisation, largely for respiratory and urinary complaints that its label now tells prescribers to treat with something else first. Levofloxacin is on the WHO Model List of Essential Medicines, in the Watch group — the category reserved for antibiotics with higher resistance potential whose use is to be monitored.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'For the infections levofloxacin is still first-choice for — pyelonephritis, chronic bacterial prostatitis, anthrax and plague exposure — the alternatives are worse or absent. For the three complaints it was most used for, the alternatives are the point. The 2010 IDSA and ESCMID guideline for uncomplicated cystitis names nitrofurantoin, trimethoprim-sulfamethoxazole and fosfomycin as first-line and explicitly ranks fluoroquinolones below them because of what it calls collateral damage, meaning the resistance the class drives in organisms it was not aimed at.',
      conventionalRx: [
        {
          name: 'Nitrofurantoin (Macrobid), trimethoprim-sulfamethoxazole (Bactrim) or fosfomycin',
          class: 'First-line agents for acute uncomplicated cystitis',
          howItCompares:
            'The 2010 IDSA and ESCMID guideline places all three above fluoroquinolones for uncomplicated cystitis, and states that fluoroquinolones should be reserved for other uses because of their propensity for collateral damage. Levofloxacin has no boxed-warning-free version of itself to offer against them.',
          typicalCost:
            'Nitrofurantoin US$0.2428 per capsule (50 listed generic products) and sulfamethoxazole-trimethoprim US$0.0448 per tablet (27 listed generic tablet products) at United States pharmacy acquisition cost (CMS NADAC, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: no tendon, nerve or aortic warning; nitrofurantoin concentrates in urine and drives little systemic resistance. Cons: nitrofurantoin does not treat pyelonephritis and is avoided in poor kidney function; trimethoprim-sulfamethoxazole resistance in E. coli is high enough in many regions that local rates decide whether it can be used empirically.',
        },
        {
          name: 'Amoxicillin-clavulanate or doxycycline',
          class: 'Beta-lactam plus beta-lactamase inhibitor; tetracycline',
          howItCompares:
            'For community-acquired pneumonia in an outpatient without comorbidity, guidelines put a beta-lactam or doxycycline ahead of a respiratory fluoroquinolone, and reserve the fluoroquinolone for patients with comorbidity or recent antibiotic exposure. Levofloxacin covers more organisms; that breadth is the reason to save it, not the reason to start it.',
          typicalCost:
            'Amoxicillin-clavulanate US$0.2856 per tablet (40 listed generic products) and doxycycline hyclate US$0.1129 per capsule (87 listed generic products) at United States pharmacy acquisition cost (CMS NADAC, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: much narrower spectrum, no boxed warning, decades of paediatric safety data. Cons: neither covers Legionella or Pseudomonas; amoxicillin-clavulanate causes more diarrhoea; doxycycline is avoided in pregnancy.',
        },
        {
          name: 'No antibiotic at all',
          class: 'Watchful waiting with a delayed prescription',
          howItCompares:
            'The label itself states that for some patients acute bacterial sinusitis, acute bacterial exacerbation of chronic bronchitis and uncomplicated urinary tract infection are self-limiting, and uses that fact as part of the reason for the reserve instruction. When the comparator is nothing, the harm side of a boxed warning has no benefit to be weighed against.',
          typicalCost: 'None',
          prosAndCons:
            'Pros: no resistance, no C. difficile, no tendon rupture. Cons: some of these infections are not self-limiting, and distinguishing which in advance is exactly what a clinician is for.',
        },
      ],
      naturalFoods: [
        {
          name: 'Cranberry products — juice, capsules and tablets standardised to proanthocyanidins',
          activeCompound:
            'A-type proanthocyanidins, which interfere with adhesion of p-fimbriated Escherichia coli to the bladder lining',
          biologicalMechanism:
            'Prevention of adhesion rather than killing. That is a different mechanism from levofloxacin and it applies only to preventing recurrent urinary infection, never to treating an infection already present.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: the 2023 Cochrane review pooled 50 randomised trials in 8,857 participants and found cranberry products reduced symptomatic culture-verified urinary infection with a risk ratio of 0.70 (95% CI 0.58 to 0.84) overall, 0.74 (0.55 to 0.99) in women with recurrent infection and 0.46 (0.32 to 0.68) in children — and no benefit in institutionalised elderly people (RR 0.93, 0.67 to 1.30), in pregnancy (RR 1.06, 0.75 to 1.50) or in neuromuscular bladder dysfunction (RR 0.97, 0.78 to 1.19). This is a prevention finding in specific populations, not a treatment.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Stop at the first tendon twinge',
          action:
            'If a tendon — most often the Achilles, but also the shoulder, hand, biceps or thumb — becomes painful or swollen, stop taking it and say so immediately.',
          patientImpact:
            'The label directs discontinuing levofloxacin immediately at pain, swelling, inflammation or rupture of a tendon, resting at the first sign, and asking about a non-quinolone alternative. It records that tendinitis or rupture can occur within hours of the first dose or as long as several months after the course has finished, and can occur on both sides at once.',
          clinicalPrecaution:
            'Risk is higher over the age of 60, on corticosteroids, and after kidney, heart or lung transplant. The label notes it has also been reported in people with none of those risk factors.',
        },
        {
          name: 'Keep antacids, iron and calcium several hours away from the dose',
          action:
            'Do not swallow it at the same time as an antacid containing magnesium or aluminium, a multivitamin with iron or zinc, or sucralfate.',
          patientImpact:
            'Fluoroquinolones chelate polyvalent metal cations in the gut, which can cut absorption enough to leave the dose ineffective. The drug interactions section of the label handles this by separation in time.',
          clinicalPrecaution:
            'This is an absorption problem, not a toxicity one. The failure mode is a treated infection that was never actually treated.',
        },
        {
          name: 'Say if you have myasthenia gravis',
          action:
            'Tell the prescriber about any diagnosed neuromuscular weakness before the first dose.',
          patientImpact:
            'The boxed warning states that fluoroquinolones may exacerbate muscle weakness in patients with myasthenia gravis and directs avoiding levofloxacin in anyone with a known history of it.',
          clinicalPrecaution:
            'The exacerbation can involve the breathing muscles, which is why this sits in the boxed warning rather than a routine precaution.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C[C@H]1COC2=C3N1C=C(C(=O)C3=CC(=C2N4CCN(CC4)C)F)C(=O)O',
      chemicalFormula: 'C18H20FN3O4',
      molecularWeight: '361.40 g/mol',
      targetReceptorAffinity:
        'Levofloxacin is the L-isomer of the racemate ofloxacin, and the label states that the antibacterial activity of ofloxacin resides primarily in the L-isomer. It inhibits bacterial topoisomerase IV and DNA gyrase, both type II topoisomerases required for DNA replication, transcription, repair and recombination. Resistance arises through mutation in the quinolone-resistance determining regions of gyrA or parC, or through altered efflux; the label records that resistance by spontaneous mutation in vitro is rare, in the range of 10⁻⁹ to 10⁻¹⁰ per cell division.',
      structureSource: {
        label:
          'PubChem CID 149096 (levofloxacin) — canonical SMILES, molecular formula and weight, as carried on the enriched record; isomer and mechanism statements from the levofloxacin label, section 12.4',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/149096',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'lev-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the single enantiomer, not the racemate',
          description:
            'Ofloxacin is a racemate and levofloxacin is one half of it. Because the activity sits in the L-isomer, a batch contaminated with the D-isomer is a batch of ofloxacin at reduced potency wearing a levofloxacin label. Chiral purity is the identity test that matters and an achiral assay cannot see the failure.',
          reagentsAndBuffer:
            'Levofloxacin reference standard, chiral HPLC on a protein or polysaccharide stationary phase, circular dichroism or optical rotation detection, 19F NMR to confirm the single ring fluorine, Karl Fischer titration for the hemihydrate water content',
        },
        {
          id: 'lev-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Build the tricyclic benzoxazine core and set the methyl stereocentre',
          description:
            'The molecule is a tricyclic pyrido-benzoxazine carboxylic acid with a single methyl-bearing stereocentre in the oxazine ring and an N-methylpiperazine at C-10. The stereocentre is set early, by asymmetric synthesis or by resolution, because carrying a racemate through to the end wastes half of every subsequent step.',
          dependsOnStepId: 'lev-w1',
          reagentsAndBuffer:
            'Difluoro-nitrobenzene precursor, chiral aminopropanol for the oxazine ring closure, N-methylpiperazine for the C-10 displacement, anhydrous polar aprotic solvent, base for the nucleophilic aromatic substitution',
        },
        {
          id: 'lev-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallise as the hemihydrate and profile the metal chelates',
          description:
            'The 3-carboxyl and 4-keto groups chelate divalent and trivalent metals, which is the interaction that ruins oral absorption when the tablet meets an antacid. Residual metal from process equipment produces coloured chelate impurities and shifts the dissolution profile, so the release specification covers metals as well as organic impurities.',
          dependsOnStepId: 'lev-w2',
          reagentsAndBuffer:
            'Recrystallisation from aqueous ethanol to the hemihydrate form, ICP-MS for residual magnesium, aluminium, iron and zinc, HPLC with photodiode array detection for related substances, dissolution testing in simulated gastric fluid',
        },
        {
          id: 'lev-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Minimum inhibitory concentration against current clinical isolates',
          description:
            'The susceptibility breakpoints on the label were fixed against the organism population of the 1990s. A useful potency assay is run against isolates collected this year from the same body sites, because the number that decides whether the drug works is not the MIC against a reference strain but the fraction of the current population sitting below the breakpoint.',
          dependsOnStepId: 'lev-w3',
          reagentsAndBuffer:
            'Cation-adjusted Mueller-Hinton broth, CLSI broth microdilution panels, contemporary clinical isolates of Streptococcus pneumoniae, Haemophilus influenzae, Escherichia coli and Pseudomonas aeruginosa, quality-control reference strains at each run',
        },
        {
          id: 'lev-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Measure the trapped cleavage complex, not just the growth inhibition',
          description:
            'A growth curve shows that bacteria stopped dividing; it does not show why. The mechanism-specific assay is the DNA cleavage complex: gyrase or topoisomerase IV caught mid-reaction with the chromosome cut and the enzyme still covalently attached. An inhibitor that stops growth without stabilising the cleavage complex is working by some other route, and would not share the resistance profile the label describes.',
          dependsOnStepId: 'lev-w4',
          reagentsAndBuffer:
            'Purified bacterial DNA gyrase and topoisomerase IV, supercoiled plasmid substrate, ATP-regenerating system, SDS and proteinase K to trap and reveal the cleavage complex, agarose gel electrophoresis with linear-plasmid quantification',
        },
      ],
    },
    keyAudits: [
      {
        id: 'lev-a1',
        category: 'measured',
        title: 'Five days at 750 mg matched ten days at 500 mg in pneumonia',
        laymanSummary:
          'A 528-person trial found the high-dose five-day course cured pneumonia as often as the standard ten-day course. That is the strongest thing this drug has: a shorter course that works as well.',
        technicalDetails:
          'A multicentre, randomised, double-blind trial enrolled 528 outpatient and hospitalised adults with clinically and radiologically determined mild to severe community-acquired pneumonia and compared levofloxacin 750 mg daily for five days with 500 mg daily for ten days. In the clinically evaluable population, clinical success was 92.4% (183 of 198) on the 750 mg regimen and 91.1% (175 of 192) on the 500 mg regimen, 95% CI for the difference -7.0 to 4.4. Microbiological eradication was 93.2% and 92.4%. The FDA label reports the same trial with clinical success of 90.9% against 91.1% and a 95% CI of -5.9 to 5.4 for the analysis population it used, and adds a signal the abstract does not emphasise: at 31 to 38 days after enrolment, pneumonia was observed in 7 of 151 patients in the 750 mg group against 2 of 147 in the 500 mg group, which the label states cannot be assessed statistically given the small numbers.',
        evidenceSource:
          'Dunbar LM et al., Clin Infect Dis 2003;37:752-760; levofloxacin United States prescribing information, section 14.3',
        doi: '10.1086/377539',
        measuredMetric:
          'Clinical success and bacteriological eradication in community-acquired pneumonia, 5-day 750 mg against 10-day 500 mg',
        auditFlag: 'verified',
      },
      {
        id: 'lev-a2',
        category: 'conclusion_shift',
        title: 'The FDA took back the three infections it was most used for',
        laymanSummary:
          'Sinusitis, bronchitis and simple bladder infection are what most levofloxacin prescriptions were written for. In 2016 the FDA put all three into the boxed warning and told doctors to use this drug for them only when nothing else will do.',
        technicalDetails:
          'The boxed warning now reads: "Because fluoroquinolones, including levofloxacin, have been associated with serious adverse reactions, reserve levofloxacin for use in patients who have no alternative treatment options for the following indications: Uncomplicated urinary tract infection; Acute bacterial exacerbation of chronic bronchitis; Acute bacterial sinusitis." Sections 1.12, 1.13 and 1.14 repeat the reserve instruction for each, and each gives the same second reason: that for some patients the infection is self-limiting. The indications were not withdrawn — the drug still works for them — and that is the point of the change. The regulator did not decide the efficacy evidence was wrong; it decided the harm side of the same ledger had grown large enough to change the answer for infections that mostly get better anyway.',
        evidenceSource:
          'Levofloxacin United States prescribing information, boxed warning and sections 1.12, 1.13, 1.14 (NDA 020634)',
        measuredMetric:
          'Licensed indications carrying a reserve-for-no-alternative instruction in the boxed warning',
        auditFlag: 'caution',
      },
      {
        id: 'lev-a3',
        category: 'inferred',
        title: 'Prophylaxis in chemotherapy cut fevers, not deaths',
        laymanSummary:
          'Given during chemotherapy to prevent infection, levofloxacin clearly reduced fevers and hospital admissions. Severe infections were not significantly reduced, and exactly four people died of infection in each group.',
        technicalDetails:
          'A randomised, double-blind, placebo-controlled trial gave 1,565 patients receiving cyclic chemotherapy for solid tumours or lymphoma either levofloxacin 500 mg daily or placebo for seven days during the expected neutropenic period. Across the whole chemotherapy course, 10.8% on levofloxacin had at least one febrile episode against 15.2% on placebo (p=0.01); probable infection 34.2% against 41.5% (p=0.004); hospitalisation for infection 15.7% against 21.6% (p=0.004). Severe infection was 1.0% against 2.0% and did not reach significance (p=0.15), and there were four infection-related deaths in each arm. The authors state that secondary outcomes did not include a systematic evaluation of antibacterial resistance, so the cost side of prophylaxis was not measured in the trial that measured its benefit.',
        evidenceSource:
          'Cullen M et al. Antibacterial prophylaxis after chemotherapy for solid tumors and lymphomas. N Engl J Med 2005;353:988-998',
        doi: '10.1056/NEJMoa050078',
        inferredClaim:
          'That preventing febrile episodes and admissions with prophylactic levofloxacin prevents deaths from infection — a step the trial itself did not demonstrate, with four infection deaths in each arm and severe infection not significantly different',
        auditFlag: 'caution',
      },
      {
        id: 'lev-a4',
        category: 'failed',
        title: 'A doubled aortic aneurysm rate, in a 720,000-episode cohort',
        laymanSummary:
          'People given a fluoroquinolone were about two-thirds more likely to be admitted with a tear or bulge in the aorta within two months than people given amoxicillin. The absolute numbers are small; the label now says to avoid the drug in anyone already at risk.',
        technicalDetails:
          'A Swedish nationwide register cohort matched 360,088 fluoroquinolone treatment episodes (78% ciprofloxacin) to 360,088 propensity-matched amoxicillin episodes. Within a 60-day risk window the rate of aortic aneurysm or dissection was 1.2 per 1,000 person-years on fluoroquinolone against 0.7 on amoxicillin, hazard ratio 1.66 (95% CI 1.12 to 2.46), an estimated absolute difference of 82 cases (95% CI 15 to 181) per million treatment episodes. The association was driven by aneurysm (HR 1.90, 1.22 to 2.96) rather than dissection (HR 0.93, 0.38 to 2.29). Section 5.9 of the label now states that the annual background risk reaches roughly 300 aneurysm events per 100,000 people at highest risk, that the evidence shows the potential for a 2-fold increase over background, that the cause has not been identified, and that in patients with a known aneurysm or at greater risk the drug should be reserved for when no alternative is available. This is observational evidence in an ageing population where confounding by indication is hard to exclude, and it changed the label anyway.',
        evidenceSource:
          'Pasternak B, Inghammar M, Svanström H. Fluoroquinolone use and risk of aortic aneurysm and dissection: nationwide cohort study. BMJ 2018;360:k678; levofloxacin United States prescribing information, section 5.9',
        doi: '10.1136/bmj.k678',
        measuredMetric:
          'Hospitalisation or death from aortic aneurysm or dissection within 60 days of a fluoroquinolone prescription against a matched amoxicillin comparator',
        auditFlag: 'caution',
      },
      {
        id: 'lev-a5',
        category: 'measured',
        title: 'In children, it worked in leukaemia and did not reach significance in transplant',
        laymanSummary:
          'The same prophylaxis question in children gave two different answers in the same trial. Bloodstream infections fell sharply in children on intensive leukaemia chemotherapy and did not fall significantly in children having a stem-cell transplant.',
        technicalDetails:
          'A multicentre open-label randomised trial at 76 North American centres enrolled 624 patients aged six months to 21 years in two separate strata. Among 195 evaluable patients with acute myeloid leukaemia or relapsed acute lymphoblastic leukaemia, bacteraemia occurred in 21.9% on levofloxacin prophylaxis against 43.4% on no prophylaxis, risk difference 21.6% (95% CI 8.8 to 34.4, p=0.001). Among 418 evaluable haematopoietic stem-cell transplant recipients, bacteraemia was 11.0% against 17.3%, risk difference 6.3% (95% CI 0.3 to 13.0, p=0.06) — not significant at the trial threshold. Fever and neutropenia were less common overall (71.2% against 82.1%, p=0.002). The trial is a clean demonstration that a prophylaxis result does not transfer between populations, even between two arms of the same protocol run at the same sites in the same years.',
        evidenceSource:
          'Alexander S et al. Effect of levofloxacin prophylaxis on bacteremia in children with acute leukemia or undergoing hematopoietic stem cell transplantation: a randomized clinical trial. JAMA 2018;320:995-1004',
        doi: '10.1001/jama.2018.12512',
        measuredMetric:
          'Bacteraemia during two chemotherapy cycles or one transplant procedure, in two separately randomised strata',
        auditFlag: 'verified',
      },
      {
        id: 'lev-a6',
        category: 'inferred',
        title: 'A cure rate from 1996 is a historical measurement',
        laymanSummary:
          'The success rates on the label were measured against the bacteria of the 1990s. Bacteria have changed since. The number on the label has not.',
        technicalDetails:
          'Every antibacterial label opens with the instruction to use the drug only for infections proven or strongly suspected to be caused by susceptible bacteria, and directs that where culture and susceptibility data are unavailable, local epidemiology and susceptibility patterns should guide empiric selection. That sentence is an admission that the registration efficacy figures are conditional on a susceptibility distribution measured at a particular time and place. Section 12.4 records that resistance arises by mutation in the quinolone-resistance determining regions of gyrA or parC or by altered efflux, and that cross-resistance is observed between levofloxacin and some other fluoroquinolones — so a population exposed to any member of the class can lose susceptibility to this one. The trial numbers on this page remain accurate reports of what happened in those trials. They are not predictions about the organism in front of a reader today, and no antibiotic label claims otherwise.',
        evidenceSource:
          'Levofloxacin United States prescribing information, sections 1.15 and 12.4 (NDA 020634)',
        inferredClaim:
          'That a clinical cure rate measured in a 1990s registration trial describes the probability of cure today — an inference the label itself blocks by directing that current local susceptibility patterns guide selection',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed, and almost all of it arrives',
        laymanDesc:
          'Unusually for an antibiotic, nearly the whole tablet reaches the bloodstream, so the oral form is interchangeable with the drip. Antacids, iron and calcium taken at the same time ruin that.',
        molecularDetail:
          'Oral levofloxacin is rapidly and essentially completely absorbed, with peak plasma concentrations at one to two hours; a 750 mg tablet gives a mean Cmax of 9.3 ± 1.6 mcg/mL and AUC of 101 ± 20 mcg·h/mL. The 3-carboxyl and 4-keto groups chelate polyvalent cations, which is the mechanistic basis of the antacid, iron and sucralfate interaction.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It crosses into the bacterium',
        laymanDesc:
          'The drug is small and crosses the bacterial envelope on its own, reaching the inside of the cell where the chromosome is being copied.',
        molecularDetail:
          'Entry into Gram-negative bacteria is largely through outer-membrane porin channels; loss of porins or upregulation of efflux pumps is one of the two named resistance routes in section 12.4, the other being target-site mutation.',
        iconName: 'LogIn',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It traps the enzymes that unwind DNA',
        laymanDesc:
          'Two bacterial enzymes cut the DNA loop, pass a strand through and re-seal it. Levofloxacin freezes them at the moment the cut is open.',
        molecularDetail:
          'Inhibition of bacterial topoisomerase IV and DNA gyrase, both type II topoisomerases, enzymes required for DNA replication, transcription, repair and recombination. The drug stabilises the covalent enzyme-DNA cleavage complex rather than blocking the active site, which converts a normal catalytic intermediate into a permanent double-strand break.',
        iconName: 'Scissors',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The chromosome breaks and the cell dies',
        laymanDesc:
          'Because the break is never repaired, the bacterium cannot finish copying itself and is killed rather than merely stopped.',
        molecularDetail:
          'Concentration-dependent bactericidal activity, with efficacy tracking the ratio of AUC to MIC and of Cmax to MIC. That pharmacodynamic relationship is the entire rationale for the 750 mg five-day regimen: raising the peak buys a shorter course.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The infection clears — in the organisms that are still susceptible',
        laymanDesc:
          'Cure rates in the registration trials were around 90%. Those rates were measured against the bacteria circulating thirty years ago.',
        molecularDetail:
          'Clinical success 92.4% against 91.1% in the 528-patient 5-day 750 mg versus 10-day 500 mg pneumonia trial; bacteriological eradication of 19/20 S. pneumoniae, 12/12 H. influenzae and 26/27 M. pneumoniae in the label 5-day analysis. Resistance by spontaneous mutation in vitro is rare (10⁻⁹ to 10⁻¹⁰), so clinical resistance is acquired through population-level selection, not within a single course.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'The harms have no accepted mechanism',
        laymanDesc:
          'Tendon rupture, nerve damage and aortic tears are all in the label. Nobody has established why a drug that acts on a bacterial enzyme does any of them.',
        molecularDetail:
          'Section 5.9 states plainly that the cause of the aortic aneurysm risk has not been identified. The tendon and peripheral nerve warnings likewise describe an association and a risk-factor profile without a mechanism. The proposed explanations — chelation of matrix metalloproteinase cofactors, mitochondrial topoisomerase effects, oxidative injury to collagen — are hypotheses in the literature, not statements the label makes.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Dunbar LM et al., Clin Infect Dis 2003;37:752-760 (5-day 750 mg CAP trial)',
        phase: 'Phase 3, randomised, double-blind, multicentre',
        sampleSize: 528,
        primaryEndpoint:
          'Clinical success (cure plus improvement) in community-acquired pneumonia, levofloxacin 750 mg daily for 5 days against 500 mg daily for 10 days',
        endpointMet: true,
        statisticalPValue:
          '92.4% (183/198) against 91.1% (175/192) in the clinically evaluable population; 95% CI for the difference -7.0 to 4.4, meeting the non-inferiority margin',
        unreportedAdverseSignals:
          'The FDA label reports that at 31 to 38 days after enrolment, pneumonia was observed in 7 of 151 patients in the 750 mg group against 2 of 147 in the 500 mg group, and states the significance cannot be determined statistically given the small numbers.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Cullen M et al., N Engl J Med 2005;353:988-998 (SIGNIFICANT)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 1565,
        primaryEndpoint:
          'Incidence of clinically documented febrile episodes attributed to infection during cyclic chemotherapy for solid tumours or lymphoma',
        endpointMet: true,
        statisticalPValue:
          'First cycle 3.5% against 7.9% (p<0.001); whole course 10.8% against 15.2% (p=0.01); hospitalisation for infection 15.7% against 21.6% (p=0.004)',
        unreportedAdverseSignals:
          'Severe infection 1.0% against 2.0% was not significant (p=0.15) and infection-related deaths were four in each arm. The authors state secondary outcomes did not include a systematic evaluation of antibacterial resistance.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Alexander S et al., JAMA 2018;320:995-1004 (ACCL0934)',
        phase: 'Phase 3, randomised, open-label, multicentre',
        sampleSize: 624,
        primaryEndpoint:
          'Bacteraemia during two chemotherapy cycles (acute leukaemia stratum) or one transplant procedure (HSCT stratum) in patients aged 6 months to 21 years',
        endpointMet: true,
        statisticalPValue:
          'Acute leukaemia 21.9% against 43.4%, risk difference 21.6% (95% CI 8.8 to 34.4), p=0.001. HSCT 11.0% against 17.3%, risk difference 6.3% (95% CI 0.3 to 13.0), p=0.06',
        unreportedAdverseSignals:
          'The transplant stratum did not reach significance on the primary endpoint. Severe infection did not differ significantly between arms.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Clinical success 92.4% against 91.1% for 5 days at 750 mg versus 10 days at 500 mg in 528 patients with community-acquired pneumonia',
        'Febrile episodes 10.8% against 15.2% and hospitalisation for infection 15.7% against 21.6% with prophylaxis in 1,565 chemotherapy patients',
        'Bacteraemia 21.9% against 43.4% with prophylaxis in 195 children with acute leukaemia; 11.0% against 17.3% (p=0.06) in 418 transplant recipients',
        'Aortic aneurysm or dissection at 1.2 against 0.7 per 1,000 person-years within 60 days, HR 1.66 (95% CI 1.12 to 2.46), in 720,176 matched treatment episodes',
      ],
      unsupportedInferences: [
        'That preventing fevers and admissions with prophylaxis prevents deaths from infection — severe infection was not significantly reduced and infection deaths were four against four',
        'That the registration cure rates describe the probability of cure against organisms circulating today, when the label directs that current local susceptibility patterns guide empiric selection',
        'That a result in one prophylaxis population transfers to another — the same trial found a large effect in leukaemia and no significant effect in transplant',
        'That the tendon, nerve and aortic harms have an established mechanism; section 5.9 states the cause has not been identified',
      ],
      whatFailedInitially: [
        'Three licensed indications — uncomplicated urinary tract infection, acute bacterial exacerbation of chronic bronchitis and acute bacterial sinusitis — were moved into the boxed warning with an instruction to reserve the drug for patients with no alternative',
        'Severe infection and infection-related mortality did not separate from placebo in the 1,565-patient prophylaxis trial',
        'The transplant stratum of the paediatric prophylaxis trial missed its primary endpoint at p=0.06',
        'The 5-day arm of the pneumonia trial showed 7 of 151 versus 2 of 147 late pneumonia at day 31 to 38, a difference the label declines to interpret',
      ],
      realWorldOutcome: [
        'Approved 20 December 1996 under NDA 020634 and generic since 2011; now about thirteen United States cents a tablet at pharmacy acquisition cost',
        'Boxed warning expanded across three separate FDA actions — tendon rupture, then peripheral neuropathy and central nervous system effects, then the 2016 reserve instruction for self-limiting infections',
        'Aortic aneurysm and dissection added as a section 5 warning after the 2018 epidemiological review',
        'Classified in the WHO Watch group of antibiotics, the category whose use is to be monitored because of resistance potential',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet at 250, 500 and 750 mg, oral solution, intravenous infusion in premixed dextrose, and ophthalmic solution — taken once daily by the systemic routes',
      description:
        'Oral levofloxacin is rapidly and essentially completely absorbed, so the oral and intravenous routes are dose-equivalent and a patient can be switched between them without changing the amount. Peak plasma concentration comes at about one to two hours; the mean elimination half-life is roughly 6 to 8 hours in normal renal function and lengthens markedly as creatinine clearance falls, reaching about 27 hours at a clearance of 20 to 49 mL/min. Elimination is largely renal and unchanged.',
      safetyProfile:
        'Carries a boxed warning for disabling and potentially irreversible serious adverse reactions occurring together — tendinitis and tendon rupture, peripheral neuropathy, and central nervous system effects — with an instruction to discontinue immediately and avoid the class in anyone who experiences them; for exacerbation of muscle weakness in myasthenia gravis, with an instruction to avoid the drug in anyone with a known history; and with an instruction to reserve the drug for patients with no alternative treatment options in uncomplicated urinary tract infection, acute bacterial exacerbation of chronic bronchitis and acute bacterial sinusitis. Section 5.9 warns of aortic aneurysm and dissection, with a roughly 2-fold increase over background risk in epidemiological studies and an instruction to reserve the drug in anyone at greater aortic risk. Also carries warnings for Clostridioides difficile-associated diarrhoea, hypersensitivity and other serious reactions, hepatotoxicity, QT prolongation, blood glucose disturbances and photosensitivity. Tendon injury may begin within hours of the first dose or months after the last.',
    },
    commonQuestions: [
      {
        q: 'Why does my doctor seem reluctant to prescribe this?',
        a: 'Because the label tells them to be, for certain infections. In 2016 the FDA moved three indications — uncomplicated urinary tract infection, acute bacterial exacerbation of chronic bronchitis, and acute bacterial sinusitis — into the boxed warning with the instruction to reserve levofloxacin for patients who have no alternative treatment options. The reason given is twofold: the class is associated with disabling and potentially irreversible reactions affecting tendons, nerves and the central nervous system, and for some patients those three infections resolve on their own. Nothing about the drug efficacy changed. What changed is which side of the ledger the regulator thought should decide.',
        auditNote:
          'This is an unusual regulatory act: an indication that was neither withdrawn nor narrowed on efficacy grounds, but demoted on harm grounds while remaining licensed.',
      },
      {
        q: 'Is the tendon rupture risk real, or an internet story?',
        a: 'It is in the boxed warning of the drug own label, which is the strongest warning the FDA issues. The label states that tendinitis and tendon rupture have been associated with fluoroquinolones at all ages, most often the Achilles tendon but also the shoulder, hand, biceps and thumb; that it can occur within hours of starting or as long as several months after finishing; and that it can affect both sides at once. Risk is higher over 60, on corticosteroids, and after a kidney, heart or lung transplant, and the label notes it has also occurred in people with none of those risk factors. The instruction is to stop the drug at the first sign of tendon pain or swelling and ask about a non-quinolone alternative.',
      },
      {
        q: 'Does it work as well as it used to?',
        a: 'Against a susceptible organism, yes — the mechanism has not changed. What has changed is the fraction of organisms that are still susceptible, and that varies by region, by body site and by year. Every antibacterial label opens with the same instruction: use the drug only for infections proven or strongly suspected to be caused by susceptible bacteria, and where culture data are unavailable, let local epidemiology guide the choice. The 90%-odd cure rates on this page are accurate reports of what happened in trials run in the 1990s. They are not a forecast for a specific infection today, and levofloxacin sits in the WHO Watch group precisely because the class drives resistance.',
      },
      {
        q: 'If it prevents infections during chemotherapy, why is it not given to everyone?',
        a: 'Because what it has been shown to prevent is fevers and admissions, not deaths. In the 1,565-patient placebo-controlled trial, febrile episodes fell from 15.2% to 10.8% and hospitalisation for infection from 21.6% to 15.7%, both clearly significant. Severe infection was 1.0% against 2.0% and did not reach significance, and infection-related deaths were four in each arm. The paediatric trial found the same split by population: a large reduction in bacteraemia in children on intensive leukaemia chemotherapy, and no significant reduction in transplant recipients randomised in the same protocol. And the authors of the adult trial state that they did not systematically evaluate antibacterial resistance, which is the main cost of giving an antibiotic to people who are not infected.',
      },
      {
        q: 'What is the aorta warning about?',
        a: 'A Swedish register study matched 360,088 fluoroquinolone treatment episodes to the same number of amoxicillin episodes and found aortic aneurysm or dissection at 1.2 against 0.7 cases per 1,000 person-years within 60 days, a hazard ratio of 1.66. In absolute terms that is about 82 extra cases per million treatment episodes. The FDA added it to section 5 of the label in 2018, states the cause has not been identified, and directs that in anyone with a known aneurysm or at higher aortic risk the drug be reserved for when no alternative exists. The absolute risk for a young person with no vascular disease is very small; the label change is aimed at the older, higher-risk population where the background rate is already about 300 per 100,000 per year.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Levofloxacin United States prescribing information — boxed warning, Indications 1.1 to 1.15, Warnings 5.1 to 5.15, Clinical Pharmacology 12.3 and 12.4, Clinical Studies 14.1 to 14.10 (NDA 020634 / 020635)',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=levofloxacin',
        kind: 'regulatory',
      },
      {
        label:
          'Dunbar LM, Wunderink RG, Habib MP, et al. High-dose, short-course levofloxacin for community-acquired pneumonia: a new treatment paradigm. Clin Infect Dis 2003;37:752-760',
        identifier: '10.1086/377539',
        kind: 'doi',
      },
      {
        label:
          'Cullen M, Steven N, Billingham L, et al. Antibacterial prophylaxis after chemotherapy for solid tumors and lymphomas. N Engl J Med 2005;353:988-998',
        identifier: '10.1056/NEJMoa050078',
        kind: 'doi',
      },
      {
        label:
          'Alexander S, Fisher BT, Gaur AH, et al. Effect of levofloxacin prophylaxis on bacteremia in children with acute leukemia or undergoing hematopoietic stem cell transplantation: a randomized clinical trial. JAMA 2018;320:995-1004',
        identifier: '10.1001/jama.2018.12512',
        kind: 'doi',
      },
      {
        label:
          'Pasternak B, Inghammar M, Svanström H. Fluoroquinolone use and risk of aortic aneurysm and dissection: nationwide cohort study. BMJ 2018;360:k678',
        identifier: '10.1136/bmj.k678',
        kind: 'doi',
      },
      {
        label:
          'Gupta K, Hooton TM, Naber KG, et al. International clinical practice guidelines for the treatment of acute uncomplicated cystitis and pyelonephritis in women: a 2010 update by the IDSA and ESCMID. Clin Infect Dis 2011;52:e103-e120',
        identifier: '10.1093/cid/ciq257',
        kind: 'doi',
      },
      {
        label:
          'Williams G, Hahn D, Stephens JH, Craig JC, Hodson EM. Cranberries for preventing urinary tract infections. Cochrane Database Syst Rev 2023;4:CD001321',
        identifier: '10.1002/14651858.CD001321.pub6',
        kind: 'doi',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — levofloxacin, 22 listed generic tablet products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 149096 — levofloxacin structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/149096',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 2. Sulfamethoxazole / trimethoprim — the combination whose own label recommends a single agent
  //    for the infection it is most often prescribed for.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'sulfamethoxazole',
    name: 'Sulfamethoxazole / Trimethoprim',
    tradeName: 'Bactrim / Bactrim DS / Septra / Gantanol / Urobak / Sulfatrim',
    sponsor:
      'Sun Pharmaceutical Industries (current holder of NDA 017377, Bactrim); the sulfamethoxazole half was marketed by Roche as Gantanol from 1965 and the fixed combination was approved on 30 July 1973',
    targetGene:
      'folP and folA — the bacterial genes for dihydropteroate synthase and dihydrofolate reductase',
    targetProtein:
      'Bacterial dihydropteroate synthase, blocked by sulfamethoxazole competing with para-aminobenzoic acid, and bacterial dihydrofolate reductase, reversibly inhibited by trimethoprim',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1973,
    indication:
      'Urinary tract infections due to susceptible organisms; acute otitis media in children; acute exacerbations of chronic bronchitis in adults; shigellosis; treatment of documented Pneumocystis jirovecii pneumonia and prophylaxis against it in people who are immunosuppressed; and travellers’ diarrhoea in adults due to susceptible enterotoxigenic E. coli. The label recommends that initial episodes of uncomplicated urinary tract infection be treated with a single effective antibacterial agent rather than the combination',
    patientFriendlyIndication:
      'Urinary, ear, chest, gut and skin infections, and the pneumonia that people with weakened immune systems get',
    anatomicalSite:
      'Bacterial cytoplasm — the two consecutive enzymes of the folate pathway, one step apart on the same assembly line',
    conditionContext: {
      conditionExplainer:
        'Every dividing cell needs folate to build the bases of DNA. Bacteria and Pneumocystis cannot absorb folate from their surroundings; they must manufacture it from scratch. Human cells cannot manufacture it and must absorb it from food. That single metabolic difference is the whole basis of this drug.',
      whyItMatters:
        'This is the cheapest broadly useful antibiotic in the world, at about four United States cents a tablet, and it is the only drug that reliably prevents Pneumocystis pneumonia — a fungal infection that killed a large fraction of people with untreated AIDS. It is also the drug whose own label tells prescribers to use something simpler for the infection it is written for most often.',
      whoTakesThis:
        'Adults with urinary infection or bronchitis exacerbation, children with otitis media where the prescriber judges it offers an advantage, travellers with enterotoxigenic diarrhoea, and — the use with the strongest evidence — people who are immunosuppressed and at risk of Pneumocystis pneumonia.',
      clinicalGoals:
        'Cure of the infection, and in the prophylaxis setting, prevention of an infection that has not happened yet. Those two goals have very different evidence behind them and this page separates them.',
    },
    oneSentenceVerdict:
      'Two folate-pathway blockers one step apart, which cut Pneumocystis pneumonia by 91% in a meta-analysis of 12 randomised trials in 1,245 non-HIV immunocompromised patients (RR 0.09, 95% CI 0.02 to 0.32, number needed to treat 15) — and whose own FDA label recommends a single agent rather than this combination for a first uncomplicated urinary tract infection, the thing it is most often prescribed for.',
    laymanHowItWorks:
      'Bacteria have to build folate from raw materials because, unlike your cells, they cannot import it ready-made from food. Building it takes an assembly line, and this tablet contains two drugs that block two consecutive stations on that line: sulfamethoxazole disguises itself as the raw material at the first station, and trimethoprim jams the enzyme at the next one. Blocking one step can be worked around; blocking two consecutive steps is much harder, which is why the label says resistance develops more slowly to the pair than to either alone. Your own cells are untouched because they never run that assembly line — they just eat folate.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 74,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0448 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 27 listed generic tablet products including the double-strength 800/160 mg tablet, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'The fixed combination was approved in the United States on 30 July 1973 under NDA 017377 and has been generic for decades. At roughly four and a half United States cents a tablet it is among the cheapest prescription drugs in the country, and it is on the WHO Model List of Essential Medicines both as an antibacterial and, separately, as the medicine for prevention and treatment of Pneumocystis pneumonia.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The alternatives depend entirely on which of this drug’s several jobs is in question. For a first uncomplicated bladder infection the label itself points at a single agent, and nitrofurantoin is the one guidelines name. For draining a skin abscess the honest comparator is placebo, because that is what the trial used. For preventing Pneumocystis pneumonia there is no equal: the alternatives exist for people who cannot tolerate this one and are less effective, more expensive, or both.',
      conventionalRx: [
        {
          name: 'Nitrofurantoin (Macrobid)',
          class: 'Nitrofuran, concentrated in urine',
          howItCompares:
            'Named first-line alongside this drug in the 2010 IDSA and ESCMID uncomplicated cystitis guideline, and it is a single agent — which is what this drug’s own label recommends for a first uncomplicated urinary infection. It drives very little resistance elsewhere in the body because it barely reaches anywhere else.',
          typicalCost:
            'US$0.2428 per capsule at United States pharmacy acquisition cost (CMS NADAC, median across 50 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: no sulfonamide hypersensitivity risk, no hyperkalaemia, no interaction with the renin-angiotensin drugs. Cons: about five times the price per unit; does not treat pyelonephritis because it does not reach kidney tissue; avoided in poor renal function.',
        },
        {
          name: 'Doxycycline or clindamycin',
          class: 'Tetracycline; lincosamide',
          howItCompares:
            'The other two oral options with reliable activity against community MRSA in skin and soft tissue infection. A 786-patient double-blind trial in adults and children compared clindamycin, this combination and placebo after drainage of an abscess 5 cm or smaller: cure was 83.1% with clindamycin, 81.7% with this drug (p=0.73) and 68.9% with placebo (p<0.001 against each). New infections at one month were less common with clindamycin (6.8% against 13.5%, p=0.03). Neither alternative carries the sulfonamide hypersensitivity profile.',
          typicalCost:
            'Doxycycline hyclate US$0.1129 per capsule (87 listed generic products) and clindamycin hydrochloride US$0.1684 per capsule (32 listed generic products) at United States pharmacy acquisition cost (CMS NADAC, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: alternatives when sulfonamides cannot be used. Cons: clindamycin carries the highest Clostridioides difficile risk of the common oral antibiotics; doxycycline is avoided in pregnancy and causes photosensitivity.',
        },
        {
          name: 'Atovaquone or dapsone, for Pneumocystis prophylaxis only',
          class: 'Hydroxynaphthoquinone; sulfone',
          howItCompares:
            'These exist because some people cannot take sulfamethoxazole, not because they are better. Atovaquone suspension costs roughly twenty times as much per millilitre as a tablet of this drug costs per tablet, and dapsone is itself a sulfone with its own haemolysis risk in G6PD deficiency.',
          typicalCost:
            'Atovaquone suspension US$0.7561 per mL (16 listed generic products) and dapsone US$0.6786 per tablet (20 listed generic products) at United States pharmacy acquisition cost (CMS NADAC, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: usable in documented sulfonamide intolerance. Cons: far more expensive; dapsone needs G6PD testing; neither has the breadth of the meta-analysed prophylaxis evidence this drug has.',
        },
      ],
      naturalFoods: [
        {
          name: 'D-mannose powder, for preventing recurrent urinary infection',
          activeCompound:
            'D-mannose, a simple sugar proposed to occupy the FimH adhesin that E. coli uses to grip the bladder wall',
          biologicalMechanism:
            'Adhesion blockade rather than killing. The mechanism is plausible and specific, and it is not what this page is here to assess — the trial result is.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'Not stated here as advice. For scale only: a double-blind placebo-controlled trial across 99 United Kingdom primary care centres randomised 598 women with recurrent urinary infection to 2 g of D-mannose daily or matched placebo for six months. The proportion contacting ambulatory care with a clinically suspected infection was 51.0% on D-mannose and 55.7% on placebo, a risk difference of -5% (95% CI -13% to 3%, p=0.26). This is a negative trial, and it is here because a substitutes list that reports only the supplements that worked is not a substitutes list.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Stop at the first rash, and mean it',
          action:
            'Any new rash, sore throat, fever, joint pain, unusual pallor, bruising or yellowing — stop and report it the same day.',
          patientImpact:
            'The label directs that sulfonamide-containing products be discontinued at the first appearance of skin rash or any sign of adverse reaction, and states that in rare instances a rash may be followed by Stevens-Johnson syndrome, toxic epidermal necrolysis, hepatic necrosis or serious blood disorders, and that fatalities have occurred.',
          clinicalPrecaution:
            'The label lists rash, sore throat, fever, arthralgia, pallor, purpura and jaundice as possible early indications of a serious reaction. The instruction is to stop, not to wait and see whether it settles.',
        },
        {
          name: 'Say what else you take for blood pressure or heart failure',
          action:
            'Name any ACE inhibitor, angiotensin receptor blocker, spironolactone or potassium supplement before the first dose.',
          patientImpact:
            'The label states that even recommended doses may cause hyperkalaemia when trimethoprim is given to people with disorders of potassium metabolism, renal insufficiency, or on other drugs that raise potassium, and directs close monitoring of serum potassium in those patients.',
          clinicalPrecaution:
            'A population study in Ontario found sudden death within seven days of an antibiotic prescription was commoner with this drug than with amoxicillin in older people on renin-angiotensin inhibitors (adjusted odds ratio 1.38), which the authors attribute to unrecognised severe hyperkalaemia.',
        },
        {
          name: 'Drink enough that you are passing urine',
          action: 'Keep fluid intake up through the course.',
          patientImpact:
            'The label directs that adequate fluid intake and urinary output be ensured during treatment to prevent crystalluria — sulfonamide crystals forming in the urine.',
          clinicalPrecaution:
            'This is a much smaller problem with sulfamethoxazole than with the older, less soluble sulfonamides it replaced, and it is still in the label.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC1=CC(=NO1)NS(=O)(=O)C2=CC=C(C=C2)N',
      chemicalFormula: 'C10H11N3O3S',
      molecularWeight: '253.28 g/mol',
      targetReceptorAffinity:
        'The structure shown is the sulfamethoxazole half only; the marketed product is a fixed 5:1 combination with trimethoprim (C14H18N4O3, 290.32 g/mol), at 400/80 mg or 800/160 mg per tablet. Sulfamethoxazole is a para-aminobenzoic acid mimic and inhibits bacterial synthesis of dihydrofolic acid by competing with PABA at dihydropteroate synthase. Trimethoprim binds and reversibly inhibits dihydrofolate reductase, blocking production of tetrahydrofolic acid from dihydrofolic acid. About 70% of sulfamethoxazole and 44% of trimethoprim are plasma protein bound; mean serum half-lives are 10 hours and 8 to 10 hours respectively, and at steady state on 800/160 mg twice daily the mean plasma trimethoprim concentration is 1.72 mcg/mL against total sulfamethoxazole of 68 mcg/mL.',
      structureSource: {
        label:
          'PubChem CID 5329 (sulfamethoxazole) — canonical SMILES, molecular formula and weight, as carried on the enriched record; combination ratio, protein binding, half-lives and steady-state concentrations from the sulfamethoxazole and trimethoprim label, Clinical Pharmacology and Microbiology',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5329',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'smx-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Verify the 5:1 ratio, not just the presence of both drugs',
          description:
            'The entire pharmacological argument for this product is that the two drugs reach the target at concentrations that block consecutive steps. That depends on the ratio in the tablet, which is fixed at five parts sulfamethoxazole to one part trimethoprim. An assay that confirms both components are present without quantifying the ratio has not tested the thing that makes the product work.',
          reagentsAndBuffer:
            'Sulfamethoxazole and trimethoprim reference standards, reverse-phase HPLC with UV detection at two wavelengths, content uniformity across ten tablets, dissolution testing of both components in the same medium',
        },
        {
          id: 'smx-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Build the sulfonamide and the diaminopyrimidine separately',
          description:
            'These are two unrelated syntheses. Sulfamethoxazole is a sulfanilamide coupled to a 5-methylisoxazol-3-amine; trimethoprim is a 2,4-diaminopyrimidine bearing a trimethoxybenzyl group. They are made in different plants and combined only at formulation, which is why the ratio is a formulation control point rather than a synthetic one.',
          dependsOnStepId: 'smx-w1',
          reagentsAndBuffer:
            'Acetylsulfanilyl chloride and 3-amino-5-methylisoxazole with subsequent deacetylation for the sulfonamide; 3,4,5-trimethoxybenzaldehyde condensation route to the diaminopyrimidine; separate crystallisation and drying trains',
        },
        {
          id: 'smx-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Control the N4-acetyl metabolite precursor and residual aniline',
          description:
            'Sulfamethoxazole is cleared largely as its N4-acetyl metabolite, and the free aromatic amine is the reactive group behind sulfonamide hypersensitivity. Related aromatic amine impurities are therefore a safety specification, not merely a purity one, on a drug whose most feared adverse reactions are immunological.',
          dependsOnStepId: 'smx-w2',
          reagentsAndBuffer:
            'Recrystallisation from aqueous ethanol, HPLC with photodiode array for related aromatic amines, limit tests for residual aniline and for the N4-acetyl derivative, loss on drying',
        },
        {
          id: 'smx-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Demonstrate synergy, do not assume it',
          description:
            'Two drugs given together are not automatically synergistic. The claim that this pair blocks consecutive steps is tested with a checkerboard titration and a fractional inhibitory concentration index; a value at or below 0.5 is synergy, and around 1.0 is mere additivity. Many clinical isolates that are resistant to one component alone show no synergy at all, which is the situation the ratio was designed for and does not always achieve.',
          dependsOnStepId: 'smx-w3',
          reagentsAndBuffer:
            'Cation-adjusted Mueller-Hinton broth with defined low thymidine content, checkerboard microdilution across both drugs, contemporary Escherichia coli and Staphylococcus aureus clinical isolates, lysed horse blood where thymidine scavenging is required',
        },
        {
          id: 'smx-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Rescue with thymidine to prove the pathway',
          description:
            'If the drug pair really works by starving the cell of folate-derived thymidylate, then supplying thymidine from outside should abolish the effect. It does, and that is why susceptibility media must be thymidine-depleted: a broth with thymidine in it makes a fully susceptible organism look resistant. The rescue experiment is simultaneously the mechanism proof and the commonest source of a false laboratory result.',
          dependsOnStepId: 'smx-w4',
          reagentsAndBuffer:
            'Thymidine-supplemented and thymidine-free media in parallel, exogenous folinic acid as a second rescue arm, growth curves by optical density, quantification of intracellular dihydrofolate and tetrahydrofolate pools by LC-MS/MS',
        },
      ],
    },
    keyAudits: [
      {
        id: 'smx-a1',
        category: 'measured',
        title: 'A 91% reduction in Pneumocystis pneumonia, with mortality that did not follow',
        laymanSummary:
          'Across twelve randomised trials in people with weakened immune systems, this drug cut Pneumocystis pneumonia by ninety-one per cent — one case prevented for every fifteen people treated. Deaths from that pneumonia fell too. Deaths from all causes did not change significantly.',
        technicalDetails:
          'A systematic review and meta-analysis of 12 randomised trials in 1,245 immunocompromised patients without HIV — autologous bone marrow or solid organ transplant recipients and people with haematological cancer, half of them children — found a 91% reduction in Pneumocystis pneumonia with trimethoprim-sulfamethoxazole (RR 0.09, 95% CI 0.02 to 0.32), number needed to treat 15 (95% CI 13 to 20), with no heterogeneity. Pneumocystis-related mortality fell significantly (RR 0.17, 95% CI 0.03 to 0.94). All-cause mortality did not differ significantly (RR 0.79, 95% CI 0.18 to 3.46). Adverse events requiring discontinuation occurred in 3.1% of adults and none of the children, all reversible. The authors conclude prophylaxis is warranted when the risk of Pneumocystis pneumonia exceeds 3.5% in adults — a threshold, not a blanket recommendation, and it exists because the benefit is measured against a harm.',
        evidenceSource:
          'Green H, Paul M, Vidal L, Leibovici L. Prophylaxis of Pneumocystis pneumonia in immunocompromised non-HIV-infected patients: systematic review and meta-analysis of randomized controlled trials. Mayo Clin Proc 2007;82:1052-1059',
        doi: '10.4065/82.9.1052',
        measuredMetric:
          'Occurrence of Pneumocystis pneumonia, Pneumocystis-related mortality and all-cause mortality across 12 randomised trials',
        auditFlag: 'verified',
      },
      {
        id: 'smx-a2',
        category: 'measured',
        title: 'After draining an abscess, the antibiotic added seven percentage points',
        laymanSummary:
          'A 1,247-patient trial gave people whose skin abscess had been drained either this drug or a placebo. Cure was 80.5% with the drug and 73.6% with placebo. Most of the benefit was in stopping new infections elsewhere and in household members.',
        technicalDetails:
          'A randomised trial at five United States emergency departments enrolled outpatients over 12 with an uncomplicated abscess treated by drainage; 45.3% had wound cultures positive for MRSA. In the modified intention-to-treat population, clinical cure occurred in 507 of 630 (80.5%) on trimethoprim-sulfamethoxazole against 454 of 617 (73.6%) on placebo, a difference of 6.9 percentage points (95% CI 2.1 to 11.7, p=0.005). Per protocol, 92.9% against 85.7% (difference 7.2 points, 95% CI 3.2 to 11.2, p<0.001). Secondary outcomes favoured the drug: subsequent surgical drainage 3.4% against 8.6%, new-site skin infection 3.1% against 10.3%, infection in a household member 1.7% against 4.1%. Invasive infection was identical — 2 of 524 against 2 of 533 at 7 to 14 days. The honest reading is that drainage does most of the work, the antibiotic adds a modest increment to cure and a larger one to preventing spread, and it changes nothing about the rare serious outcome.',
        evidenceSource:
          'Talan DA, Mower WR, Krishnadasan A, et al. Trimethoprim-sulfamethoxazole versus placebo for uncomplicated skin abscess. N Engl J Med 2016;374:823-832',
        doi: '10.1056/NEJMoa1507476',
        measuredMetric:
          'Clinical cure of a drained uncomplicated skin abscess 7 to 14 days after treatment, against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'smx-a3',
        category: 'failed',
        title: 'Adding it to cephalexin for cellulitis did nothing',
        laymanSummary:
          'For cellulitis without an abscess, doctors often add this drug to cover MRSA. A 500-patient double-blind trial found adding it made no difference: 83.5% cured with it, 85.5% without.',
        technicalDetails:
          'A multicentre double-blind randomised superiority trial in five United States emergency departments enrolled 500 outpatients over 12 with cellulitis and no wound, purulent drainage or abscess — ultrasound was performed on every participant at enrolment to exclude an abscess. Participants received cephalexin plus trimethoprim-sulfamethoxazole or cephalexin plus placebo for seven days. In the pre-specified per-protocol population, clinical cure occurred in 182 of 218 (83.5%) with the combination against 165 of 193 (85.5%) with cephalexin alone, a difference of -2.0% (95% CI -9.7% to 5.7%, p=0.50). In the modified intention-to-treat population the difference was 7.3% (95% CI -1.0% to 15.5%, p=0.07), also not significant. Adverse event rates did not differ. The trial tested a specific and widespread inference — that because MRSA is common in skin infection, a regimen covering MRSA must do better in non-purulent cellulitis — and did not support it.',
        evidenceSource:
          'Moran GJ, Krishnadasan A, Mower WR, et al. Effect of cephalexin plus trimethoprim-sulfamethoxazole vs cephalexin alone on clinical cure of uncomplicated cellulitis: a randomized clinical trial. JAMA 2017;317:2088-2096',
        doi: '10.1001/jama.2017.5653',
        measuredMetric:
          'Clinical cure of non-purulent uncomplicated cellulitis with and without added MRSA coverage',
        auditFlag: 'verified',
      },
      {
        id: 'smx-a4',
        category: 'inferred',
        title: 'The label recommends a single agent for the infection it is most used for',
        laymanSummary:
          'For a first uncomplicated bladder infection, the prescribing information says to use one effective antibiotic rather than this two-drug combination. That is the commonest reason it is prescribed.',
        technicalDetails:
          'The Indications and Usage section, under Urinary Tract Infections, reads: "It is recommended that initial episodes of uncomplicated urinary tract infections be treated with a single effective antibacterial agent rather than the combination." The same section attaches similar qualifications elsewhere: acute otitis media is indicated only "when in the judgment of the physician sulfamethoxazole and trimethoprim tablets offer some advantage over the use of other antimicrobial agents", the product is explicitly "not indicated for prophylactic or prolonged administration in otitis media at any age", and acute exacerbation of chronic bronchitis is indicated only when the prescriber deems the combination "could offer some advantage over the use of a single antimicrobial agent". Three of the drug’s licensed indications therefore carry a written instruction to justify choosing it over something simpler, and those three account for most of its use.',
        evidenceSource:
          'Sulfamethoxazole and trimethoprim tablets United States prescribing information, Indications and Usage (NDA 017377)',
        inferredClaim:
          'That the two-drug combination is the appropriate first choice for an uncomplicated urinary tract infection, otitis media or a bronchitis exacerbation — an inference the label declines to make and, for uncomplicated urinary infection, explicitly reverses',
        auditFlag: 'contested',
      },
      {
        id: 'smx-a5',
        category: 'conclusion_shift',
        title: 'The sulfa allergy that was never a cross-reaction',
        laymanSummary:
          'For decades, people with a sulfa antibiotic allergy were kept away from unrelated sulfur-containing drugs — some diuretics, some diabetes tablets. A 20,000-patient study found the extra risk was not cross-reactivity at all. It was that allergic people are allergic to more things.',
        technicalDetails:
          'A retrospective cohort study in the United Kingdom General Practice Research Database examined allergic reactions within 30 days of receiving a sulfonamide non-antibiotic. Of 969 patients with a prior allergic reaction to a sulfonamide antibiotic, 96 (9.9%) reacted to a subsequent sulfonamide non-antibiotic, against 315 of 19,257 (1.6%) with no prior reaction — adjusted odds ratio 2.8 (95% CI 2.1 to 3.7). The result that broke the cross-reactivity theory is the control: among the same patients with a prior sulfonamide-antibiotic reaction, the risk of reacting to a penicillin was higher still (adjusted OR 3.9, 95% CI 3.5 to 4.3), and lower after a sulfonamide non-antibiotic than after a penicillin (adjusted OR 0.7, 95% CI 0.5 to 0.9). Penicillin shares no sulfonamide chemistry whatever. The authors conclude the association reflects a predisposition to allergic reactions rather than cross-reactivity with sulfonamide-based drugs. The label still contraindicates the drug in known hypersensitivity to sulfonamides, which is correct and is a different statement.',
        evidenceSource:
          'Strom BL, Schinnar R, Apter AJ, et al. Absence of cross-reactivity between sulfonamide antibiotics and sulfonamide nonantibiotics. N Engl J Med 2003;349:1628-1635',
        doi: '10.1056/NEJMoa022963',
        measuredMetric:
          'Allergic reaction within 30 days of a sulfonamide non-antibiotic, with a penicillin comparator arm',
        auditFlag: 'verified',
      },
      {
        id: 'smx-a6',
        category: 'failed',
        title: 'Sudden death in older people already on a blood pressure drug',
        laymanSummary:
          'In Ontario, older people taking an ACE inhibitor or an ARB were about 40% more likely to die suddenly in the week after this antibiotic than after amoxicillin. The suspected cause is a potassium rise nobody measured.',
        technicalDetails:
          'A population-based nested case-control study of Ontario residents aged 66 or over treated with an ACE inhibitor or angiotensin receptor blocker identified 39,879 sudden deaths, of which 1,027 occurred within seven days of an outpatient antibiotic prescription, matched to 3,733 controls. Relative to amoxicillin, co-trimoxazole carried an adjusted odds ratio for sudden death of 1.38 (95% CI 1.09 to 1.76) at seven days and 1.54 (1.29 to 1.84) at fourteen days — approximately three sudden deaths within fourteen days per 1,000 prescriptions. Ciprofloxacin, a known cause of QT prolongation, was also associated (adjusted OR 1.29, 1.03 to 1.62); nitrofurantoin and norfloxacin were not. The authors attribute the finding to unrecognised severe hyperkalaemia. The label already warns that recommended doses may cause hyperkalaemia when trimethoprim is given with drugs known to induce it, and directs close monitoring of serum potassium; the study measures what happens when that instruction is not followed in ordinary practice.',
        evidenceSource:
          'Fralick M, Macdonald EM, Gomes T, et al. Co-trimoxazole and sudden death in patients receiving inhibitors of renin-angiotensin system: population based study. BMJ 2014;349:g6196',
        doi: '10.1136/bmj.g6196',
        measuredMetric:
          'Sudden death within 7 and 14 days of an outpatient antibiotic prescription, against an amoxicillin comparator',
        auditFlag: 'caution',
      },
      {
        id: 'smx-a7',
        category: 'failed',
        title: 'The rescue drug that increased mortality',
        laymanSummary:
          'Leucovorin is given to protect people from folate-blocking drugs. Adding it to this drug during treatment of Pneumocystis pneumonia caused treatment failure and more deaths, and the label now says not to.',
        technicalDetails:
          'The Warnings section states, under Adjunctive Treatment with Leucovorin for Pneumocystis jiroveci Pneumonia: "Treatment failure and excess mortality were observed when trimethoprim-sulfamethoxazole was used concomitantly with leucovorin for the treatment of Pneumocystis jiroveci pneumonia", and the Precautions section directs that co-administration be avoided. The reasoning that led to the practice was mechanically impeccable — this drug blocks folate metabolism, leucovorin is reduced folate, therefore leucovorin should relieve the haematological toxicity without touching the antimicrobial effect, because Pneumocystis cannot take up preformed folate. The clinical result went the other way. It is one of the cleanest examples in the pharmacopoeia of a mechanism argument that survived scrutiny and still produced the wrong answer in patients.',
        evidenceSource:
          'Sulfamethoxazole and trimethoprim tablets United States prescribing information, Warnings and Precautions (NDA 017377)',
        measuredMetric:
          'Treatment failure and mortality with concomitant leucovorin during treatment of Pneumocystis pneumonia',
        auditFlag: 'caution',
      },
      {
        id: 'smx-a8',
        category: 'inferred',
        title: 'It will not prevent rheumatic fever, and the label says so directly',
        laymanSummary:
          'Sulfonamides do not clear strep throat. The label states they will not eradicate the organism and therefore will not prevent rheumatic fever — one of the few places a drug label rules out a use in a single sentence.',
        technicalDetails:
          'Under Warnings, Streptococcal Infections and Rheumatic Fever: "The sulfonamides should not be used for treatment of group A β-hemolytic streptococcal infections. In an established infection, they will not eradicate the streptococcus and, therefore, will not prevent sequelae such as rheumatic fever." The distinction matters because sulfonamides do suppress streptococcal growth well enough to have been used for rheumatic fever prophylaxis in people who already had the disease — a secondary prevention use — while failing at eradication in an active pharyngitis. A drug that improves symptoms without clearing the organism is exactly the shape of failure that produces a confident wrong inference, and this label closes it explicitly.',
        evidenceSource:
          'Sulfamethoxazole and trimethoprim tablets United States prescribing information, Warnings (NDA 017377)',
        inferredClaim:
          'That a broadly active antibacterial which improves a sore throat has treated the streptococcal infection behind it — an inference the label reverses in one sentence',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Two drugs, one assembly line',
        laymanDesc:
          'The tablet holds five parts of one drug to one part of another. They block two stations on the same production line, one immediately after the other.',
        molecularDetail:
          'A fixed 5:1 combination at 400/80 mg or 800/160 mg. The label states the pair blocks two consecutive steps in the biosynthesis of nucleic acids and proteins essential to many bacteria, and that in vitro, resistance develops more slowly to the combination than to either component alone.',
        iconName: 'Layers',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The first drug impersonates the raw material',
        laymanDesc:
          'Bacteria build folate starting from a small molecule called PABA. Sulfamethoxazole looks enough like PABA to occupy the machine that consumes it.',
        molecularDetail:
          'Sulfamethoxazole inhibits bacterial synthesis of dihydrofolic acid by competing with para-aminobenzoic acid at dihydropteroate synthase. It is a structural analogue, so the inhibition is competitive and can be overcome by raising PABA — which is why pus and necrotic tissue, rich in PABA and thymidine, blunt sulfonamide activity.',
        iconName: 'Copy',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'The second drug jams the very next machine',
        laymanDesc:
          'One step further down the line, trimethoprim locks onto the enzyme that turns the intermediate into the usable form of folate.',
        molecularDetail:
          'Trimethoprim blocks production of tetrahydrofolic acid from dihydrofolic acid by binding to and reversibly inhibiting dihydrofolate reductase. Its selectivity comes from affinity: it binds the bacterial enzyme orders of magnitude more tightly than the human one, which is why it is not a human antifolate at these doses and methotrexate is.',
        iconName: 'Lock',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'Without folate the bacterium cannot make DNA',
        laymanDesc:
          'Folate is needed to build one of the four letters of DNA. The organism stops dividing. Your own cells are unaffected because they get folate from food rather than making it.',
        molecularDetail:
          'Tetrahydrofolate is the one-carbon donor for thymidylate synthase. Blocking it starves the cell of dTMP and halts DNA replication. Human cells lack dihydropteroate synthase entirely and import folate, which is the structural basis of selectivity for the sulfonamide half.',
        iconName: 'Dna',
        visualStage: 'therapeutic_result',
      },
      {
        step: 5,
        title: 'Both halves end up concentrated in urine',
        laymanDesc:
          'Most of both drugs leaves through the kidneys, so urine concentrations are far higher than blood concentrations. That is why it works so well for bladder infections.',
        molecularDetail:
          'Excretion is primarily renal by glomerular filtration and tubular secretion, and the label states urine concentrations of both components are considerably higher than blood concentrations. Of a single oral dose, 84.5% of total sulfonamide and 66.8% of free trimethoprim are recovered in urine over 72 hours. Mean serum half-lives are 10 hours for sulfamethoxazole and 8 to 10 for trimethoprim, both prolonged in renal impairment.',
        iconName: 'Droplet',
        visualStage: 'cellular_entry',
      },
      {
        step: 6,
        title: 'Where the harms come from',
        laymanDesc:
          'The dangerous reactions are immune ones to the sulfonamide, and a potassium rise caused by the trimethoprim acting on the kidney.',
        molecularDetail:
          'The label records fatal hypersensitivity reactions including Stevens-Johnson syndrome, toxic epidermal necrolysis, fulminant hepatic necrosis, agranulocytosis and aplastic anaemia, and directs discontinuation at the first rash. Separately, trimethoprim blocks the epithelial sodium channel in the distal nephron in a manner resembling amiloride, and the label states that even recommended doses may cause hyperkalaemia in people with renal insufficiency, disordered potassium metabolism, or on other hyperkalaemic drugs.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Talan DA et al., N Engl J Med 2016;374:823-832 (uncomplicated skin abscess)',
        phase: 'Phase 4, randomised, double-blind, placebo-controlled, multicentre',
        sampleSize: 1247,
        primaryEndpoint:
          'Clinical cure of a drained uncomplicated skin abscess, assessed 7 to 14 days after the end of treatment',
        endpointMet: true,
        statisticalPValue:
          '80.5% (507/630) against 73.6% (454/617) in the modified intention-to-treat population; difference 6.9 percentage points (95% CI 2.1 to 11.7), p=0.005',
        unreportedAdverseSignals:
          'Invasive infection was identical between arms (2 of 524 against 2 of 533 at 7 to 14 days). The trial was run where MRSA was endemic — 45.3% of wound cultures were MRSA-positive — so the increment attributable to the drug is specific to that setting.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Moran GJ et al., JAMA 2017;317:2088-2096 (uncomplicated cellulitis)',
        phase: 'Phase 4, randomised, double-blind, superiority, multicentre',
        sampleSize: 500,
        primaryEndpoint:
          'Clinical cure of non-purulent uncomplicated cellulitis with cephalexin plus trimethoprim-sulfamethoxazole against cephalexin plus placebo',
        endpointMet: false,
        statisticalPValue:
          'Per protocol 83.5% (182/218) against 85.5% (165/193); difference -2.0% (95% CI -9.7% to 5.7%), p=0.50. Modified intention-to-treat 76.2% against 69.0%; difference 7.3% (95% CI -1.0% to 15.5%), p=0.07',
        unreportedAdverseSignals:
          'The two analysis populations point in opposite directions and neither reaches significance, which is the shape of a result that gets cited in whichever direction the citer prefers.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'Green H et al., Mayo Clin Proc 2007;82:1052-1059 (meta-analysis of 12 randomised Pneumocystis prophylaxis trials)',
        phase: 'Systematic review and random-effects meta-analysis of randomised controlled trials',
        sampleSize: 1245,
        primaryEndpoint:
          'Occurrence of Pneumocystis pneumonia in immunocompromised patients without HIV infection',
        endpointMet: true,
        statisticalPValue:
          'RR 0.09 (95% CI 0.02 to 0.32), a 91% reduction, number needed to treat 15 (95% CI 13 to 20), with no heterogeneity',
        unreportedAdverseSignals:
          'All-cause mortality did not differ significantly (RR 0.79, 95% CI 0.18 to 3.46) although Pneumocystis-related mortality did (RR 0.17, 95% CI 0.03 to 0.94). Adverse events requiring discontinuation occurred in 3.1% of adults.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A 91% reduction in Pneumocystis pneumonia (RR 0.09, 95% CI 0.02 to 0.32) with a number needed to treat of 15, across 12 randomised trials in 1,245 patients',
        'Clinical cure of a drained skin abscess 80.5% against 73.6% on placebo in 1,247 patients (difference 6.9 points, 95% CI 2.1 to 11.7, p=0.005)',
        'New-site skin infection 3.1% against 10.3% and household-member infection 1.7% against 4.1% in the same abscess trial',
        'Sudden death within 7 days of a prescription, adjusted odds ratio 1.38 against amoxicillin, in older people taking an ACE inhibitor or ARB',
      ],
      unsupportedInferences: [
        'That the two-drug combination is the right first choice for an uncomplicated urinary tract infection — its own label recommends a single agent instead',
        'That covering MRSA improves outcomes in non-purulent cellulitis; a 500-patient double-blind trial found a difference of -2.0% (p=0.50)',
        'That preventing Pneumocystis pneumonia lowers all-cause mortality; the meta-analysis found RR 0.79 with a confidence interval from 0.18 to 3.46',
        'That relieving a sore throat means the streptococcal infection has been treated — the label states sulfonamides will not eradicate the organism and will not prevent rheumatic fever',
      ],
      whatFailedInitially: [
        'Adding the drug to cephalexin for non-purulent cellulitis produced no significant improvement in cure',
        'Co-administration with leucovorin during Pneumocystis pneumonia treatment produced treatment failure and excess mortality, and the label now directs avoiding it',
        'The forty-year practice of avoiding all sulfur-containing drugs after a sulfa antibiotic reaction was found to reflect a general allergic predisposition, not chemical cross-reactivity',
        'All-cause mortality did not separate from control in the prophylaxis meta-analysis, and invasive infection did not separate from placebo in the abscess trial',
      ],
      realWorldOutcome: [
        'The fixed combination was approved 30 July 1973 under NDA 017377 and now costs about four and a half United States cents a tablet at pharmacy acquisition cost',
        'On the WHO Model List of Essential Medicines twice — as an antibacterial and as the medicine for Pneumocystis pneumonia prevention and treatment',
        'Resistance in Escherichia coli is high enough in many regions that guidelines make empirical use conditional on local susceptibility rates rather than recommending it outright',
        'The label attaches an explicit justify-your-choice qualification to three of its indications: uncomplicated urinary infection, otitis media and bronchitis exacerbation',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet at 400/80 mg and 800/160 mg (double strength), oral suspension at 200/40 mg per 5 mL, and intravenous infusion — usually taken twice daily',
      description:
        'Rapidly absorbed after oral administration, with peak blood levels of each component at one to four hours and steady state reached after three days of twice-daily dosing. Mean serum half-lives are 10 hours for sulfamethoxazole and 8 to 10 hours for trimethoprim, both prolonged in severe renal impairment. Both components distribute into sputum, vaginal fluid and middle ear fluid, cross the placenta and appear in breast milk, and both are excreted primarily by the kidney at urine concentrations considerably higher than blood concentrations.',
      safetyProfile:
        'Contraindicated in known hypersensitivity to trimethoprim or sulfonamides, in a history of drug-induced immune thrombocytopenia with these drugs, in documented megaloblastic anaemia due to folate deficiency, in infants under two months, and in marked hepatic damage or severe renal insufficiency where renal function cannot be monitored. The label warns that fatalities have occurred from Stevens-Johnson syndrome, toxic epidermal necrolysis, fulminant hepatic necrosis, agranulocytosis, aplastic anaemia and other blood dyscrasias, and directs discontinuation at the first appearance of rash or any sign of adverse reaction. Also warns of embryofetal toxicity with epidemiological signals for neural tube, cardiovascular, urinary tract and oral cleft defects; of severe and sometimes fatal thrombocytopenia; of hyperkalaemia and of severe symptomatic hyponatraemia; of Clostridioides difficile-associated diarrhoea; and directs adequate fluid intake to prevent crystalluria. Leucovorin must not be co-administered during treatment of Pneumocystis pneumonia.',
    },
    commonQuestions: [
      {
        q: 'Why two drugs in one tablet?',
        a: 'Because they block consecutive steps of the same pathway, and the label states that in vitro, resistance develops more slowly to the combination than to either component alone. Bacteria must build folate from scratch, in a short assembly line; sulfamethoxazole competes with the raw material at the first step and trimethoprim jams the enzyme at the next. A single mutation can usually get a bacterium around one blocked step. Getting around two consecutive blocked steps generally takes two changes. That is the theory the product was built on, and it is a good one — it is worth knowing that it is a theory about resistance, not about cure rates, and that the label recommends a single agent for a first uncomplicated bladder infection anyway.',
        auditNote:
          'The synergy claim is testable in a laboratory in an afternoon, by checkerboard titration. Many contemporary clinical isolates show additivity rather than synergy.',
      },
      {
        q: 'I was told I am allergic to sulfa. Does that rule out my water tablet too?',
        a: 'Probably not, and the reasoning that said it did has been overturned. A study of more than 20,000 patients in a United Kingdom primary care database found that people who had reacted to a sulfonamide antibiotic were indeed more likely to react to a sulfonamide non-antibiotic — but they were even more likely to react to a penicillin, which shares none of the chemistry. The authors concluded the pattern reflects a general predisposition to allergic reactions rather than cross-reactivity between sulfonamide drugs. A documented hypersensitivity to this drug is still a contraindication to this drug; that is a separate and unchanged statement.',
      },
      {
        q: 'Is this the right drug for a urinary infection?',
        a: 'For some, and the label is unusually specific about it: for a first uncomplicated episode it recommends a single effective antibacterial rather than this combination. The 2010 IDSA and ESCMID guideline lists this drug as a first-line option for uncomplicated cystitis but conditions that on local resistance rates, because resistance in Escherichia coli has risen to the point where empirical use is not safe everywhere. Where it is still reliable it is extremely cheap and works in three days. Where it is not, the failure is silent — the infection simply does not clear.',
      },
      {
        q: 'What is the potassium warning about?',
        a: 'The trimethoprim half blocks a sodium channel in the kidney in much the same way the diuretic amiloride does, and the consequence is retained potassium. The label states that even recommended doses may cause hyperkalaemia in people with renal insufficiency, disordered potassium metabolism, or on other drugs that raise potassium, and directs close monitoring in those patients. An Ontario population study found that in people over 66 already taking an ACE inhibitor or an angiotensin receptor blocker, sudden death within a week of this antibiotic was about 40% commoner than after amoxicillin, corresponding to roughly three extra sudden deaths per thousand prescriptions within a fortnight. The authors attribute this to unrecognised severe hyperkalaemia. This is the reason to name every blood pressure and heart failure medicine before the first dose.',
      },
      {
        q: 'What is it actually best at?',
        a: 'Preventing Pneumocystis pneumonia. That is the one use where the evidence is a meta-analysis of randomised trials with a 91% reduction, no heterogeneity between studies, and a number needed to treat of fifteen — figures that almost no preventive intervention in medicine achieves. Even there the audit is worth stating plainly: deaths from Pneumocystis fell significantly and deaths from all causes did not, and the authors set a threshold, recommending prophylaxis when the risk of the infection exceeds about 3.5% in adults rather than for everyone immunosuppressed. A drug this effective still gets a threshold, because the harm side of the ledger is real.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Sulfamethoxazole and trimethoprim tablets United States prescribing information — Indications and Usage, Clinical Pharmacology and Microbiology, Contraindications, Warnings, Precautions (NDA 017377, Bactrim)',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=sulfamethoxazole+and+trimethoprim',
        kind: 'regulatory',
      },
      {
        label:
          'Green H, Paul M, Vidal L, Leibovici L. Prophylaxis of Pneumocystis pneumonia in immunocompromised non-HIV-infected patients: systematic review and meta-analysis of randomized controlled trials. Mayo Clin Proc 2007;82:1052-1059',
        identifier: '10.4065/82.9.1052',
        kind: 'doi',
      },
      {
        label:
          'Talan DA, Mower WR, Krishnadasan A, et al. Trimethoprim-sulfamethoxazole versus placebo for uncomplicated skin abscess. N Engl J Med 2016;374:823-832',
        identifier: '10.1056/NEJMoa1507476',
        kind: 'doi',
      },
      {
        label:
          'Moran GJ, Krishnadasan A, Mower WR, et al. Effect of cephalexin plus trimethoprim-sulfamethoxazole vs cephalexin alone on clinical cure of uncomplicated cellulitis: a randomized clinical trial. JAMA 2017;317:2088-2096',
        identifier: '10.1001/jama.2017.5653',
        kind: 'doi',
      },
      {
        label:
          'Strom BL, Schinnar R, Apter AJ, et al. Absence of cross-reactivity between sulfonamide antibiotics and sulfonamide nonantibiotics. N Engl J Med 2003;349:1628-1635',
        identifier: '10.1056/NEJMoa022963',
        kind: 'doi',
      },
      {
        label:
          'Fralick M, Macdonald EM, Gomes T, et al. Co-trimoxazole and sudden death in patients receiving inhibitors of renin-angiotensin system: population based study. BMJ 2014;349:g6196',
        identifier: '10.1136/bmj.g6196',
        kind: 'doi',
      },
      {
        label:
          'Hayward G, Mort S, Hay AD, et al. d-Mannose for prevention of recurrent urinary tract infection among women: a randomized clinical trial. JAMA Intern Med 2024;184:619-628',
        identifier: '10.1001/jamainternmed.2024.0264',
        kind: 'doi',
      },
      {
        label:
          'Gupta K, Hooton TM, Naber KG, et al. International clinical practice guidelines for the treatment of acute uncomplicated cystitis and pyelonephritis in women: a 2010 update by the IDSA and ESCMID. Clin Infect Dis 2011;52:e103-e120',
        identifier: '10.1093/cid/ciq257',
        kind: 'doi',
      },
      {
        label:
          'Daum RS, Miller LG, Immergluck L, et al. A placebo-controlled trial of antibiotics for smaller skin abscesses. N Engl J Med 2017;376:2545-2555',
        identifier: '10.1056/NEJMoa1607033',
        kind: 'doi',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — sulfamethoxazole-trimethoprim, 27 listed generic tablet products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 5329 — sulfamethoxazole structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5329',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 3. Acyclovir — the drug that proved a surrogate can fall by 73% while the outcome it was
  //    supposed to predict does not move at all.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'acyclovir',
    name: 'Acyclovir',
    tradeName: 'Zovirax / Sitavig / Avaclyr',
    sponsor:
      'GlaxoSmithKline (originator; the molecule came out of Gertrude Elion’s laboratory at Burroughs Wellcome); generic in the United States for decades and made by many manufacturers',
    targetGene: 'UL23 and UL30 — the herpesvirus thymidine kinase and DNA polymerase genes',
    targetProtein:
      'Herpes simplex and varicella-zoster DNA polymerase, inhibited by acyclovir triphosphate; activation requires the virus’s own thymidine kinase',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1982,
    indication:
      'Acute treatment of herpes zoster (shingles); treatment of initial episodes and management of recurrent episodes of genital herpes; and treatment of chickenpox. The intravenous formulation is additionally indicated for severe initial genital herpes, herpes simplex encephalitis, neonatal herpes and mucocutaneous herpes simplex in immunocompromised patients',
    patientFriendlyIndication: 'Shingles, genital herpes, chickenpox and severe herpes infections',
    anatomicalSite:
      'Inside an infected cell only — the drug is switched on by a viral enzyme that uninfected cells do not have',
    conditionContext: {
      conditionExplainer:
        'Herpesviruses do not leave. After the first infection they retreat into nerve cell bodies and sit there, transcriptionally quiet, for life. What people experience as an outbreak is a reactivation: the virus travels back down the nerve and replicates in skin or mucosa. No licensed drug removes the latent copy.',
      whyItMatters:
        'Acyclovir is the drug that made a lifelong virus manageable, and it did it through a mechanism that is close to the ideal for an antiviral: the drug is inert until a viral enzyme switches it on, so uninfected cells never activate it. It is also the drug that produced one of the most instructive negative results in modern trials, when suppressing herpes reactivation failed to reduce HIV transmission despite cutting genital ulcers by 73%.',
      whoTakesThis:
        'People with shingles, with first or recurrent genital herpes, or with chickenpox; and, by injection, people with herpes encephalitis, neonatal herpes or severe disease while immunosuppressed.',
      clinicalGoals:
        'Faster healing, fewer recurrences and — in encephalitis and neonatal disease — survival. The first two are what the oral trials measured; the third is what the intravenous trial measured, and it is a different and much stronger claim.',
    },
    oneSentenceVerdict:
      'A nucleoside analogue that only becomes active inside a herpes-infected cell, which cut mortality in biopsy-proven herpes simplex encephalitis from 54% to 28% against the previous standard in a 208-patient trial — and which, in 3,408 African couples, reduced herpes genital ulcers by 73% while doing nothing at all to HIV transmission (hazard ratio 0.92, p=0.69).',
    laymanHowItWorks:
      'Acyclovir arrives as a dud. It has to be phosphorylated — switched on — before it can do anything, and the enzyme that performs the first switch is one the herpesvirus brings with it. An uninfected cell has no such enzyme, so the drug sits there inert. Inside an infected cell it becomes acyclovir triphosphate, which the viral DNA-copying machine mistakes for a normal building block, incorporates, and then cannot continue past, because the molecule is missing the chemical hook the next letter would attach to. The copying stops and the polymerase is left jammed on the broken chain.',
    auditConfidence: 'High Confidence',
    confidenceScore: 82,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0985 per capsule or tablet at United States pharmacy acquisition cost (CMS NADAC, median across 53 listed generic oral solid products at 200, 400 and 800 mg, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States in 1982 and generic since the late 1990s. It is on the WHO Model List of Essential Medicines, and at roughly ten United States cents a capsule it is one of the cheapest antivirals in existence. Gertrude Elion shared the 1988 Nobel Prize in Physiology or Medicine for the work on selective nucleoside analogues that produced it.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Every oral alternative is a delivery improvement on the same molecule or a close relative of it, and the price gap between them is the whole comparison. Valacyclovir is a prodrug that converts to acyclovir in the body, costs about two and a third times as much per tablet, and has something acyclovir does not: a randomised trial showing it reduces transmission of genital herpes to an uninfected partner.',
      conventionalRx: [
        {
          name: 'Valacyclovir (Valtrex)',
          class: 'L-valine ester prodrug of acyclovir',
          howItCompares:
            'Converts to acyclovir after absorption, reaching much higher blood levels from the same number of tablets, so it is taken once or twice daily rather than five times. It also carries the transmission evidence acyclovir does not: in 1,484 discordant heterosexual couples, symptomatic genital HSV-2 developed in 4 of 743 partners of valacyclovir-treated source partners against 16 of 741 on placebo (hazard ratio 0.25, 95% CI 0.08 to 0.75, p=0.008), and any HSV-2 acquisition in 1.9% against 3.6% (hazard ratio 0.52, 95% CI 0.27 to 0.99, p=0.04).',
          typicalCost:
            'US$0.2300 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 53 listed generic products at 500 mg and 1 g, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: far fewer doses a day, better adherence, and the only randomised transmission-reduction result in the class. Cons: about two and a third times the price; the same thrombotic thrombocytopenic purpura and haemolytic uraemic syndrome warning in severely immunocompromised patients.',
        },
        {
          name: 'Famciclovir',
          class: 'Prodrug of penciclovir, a different nucleoside analogue',
          howItCompares:
            'A separate molecule with the same activation logic — it also needs viral thymidine kinase — and similar clinical results in zoster and genital herpes. It offers an alternative when acyclovir resistance is suspected only in a limited way, because most acyclovir-resistant isolates are thymidine kinase-deficient and are therefore cross-resistant to it.',
          typicalCost:
            'Generic and inexpensive in the United States; the CMS acquisition price series for it was not resolved at the time of writing, so no figure is stated here',
          prosAndCons:
            'Pros: three-times-daily or twice-daily dosing; useful where acyclovir is not tolerated. Cons: cross-resistance with acyclovir in the commonest resistance mechanism; no transmission-reduction trial.',
        },
        {
          name: 'Recombinant zoster vaccine',
          class: 'Adjuvanted subunit vaccine — prevention rather than treatment',
          howItCompares:
            'Acyclovir treats shingles once it has started and, on the Cochrane evidence, does not prevent the nerve pain that follows. A vaccine prevents the episode from occurring, which is a different and better place in the causal chain to intervene. It is not a substitute for treating an outbreak that is already happening.',
          typicalCost:
            'A two-dose vaccine course, priced as a biologic rather than a generic; it is not in the CMS acquisition price series consulted for this page',
          prosAndCons:
            'Pros: acts before the reactivation rather than after. Cons: prevention only; reactogenic; irrelevant once the rash has appeared.',
        },
      ],
      naturalFoods: [
        {
          name: 'Lysine supplements',
          activeCompound:
            'L-lysine, proposed to compete with arginine, which herpesviruses require in quantity for capsid protein synthesis',
          biologicalMechanism:
            'The mechanistic story is real at the level of amino acid composition and has never converted into a reliable clinical effect. It is listed here because it is the substitute people actually try, not because the evidence supports it.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'Not stated here as advice. For scale only: the randomised trials are small, decades old, inconsistent in dose and outcome definition, and no adequately powered modern trial has been conducted. Nothing here should be read as a comparison to a drug with a mortality trial behind it.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Drink through the course',
          action:
            'Keep fluid intake up, especially with the high-dose shingles regimen or the intravenous form.',
          patientImpact:
            'The label warns that renal failure, in some cases resulting in death, has been observed with acyclovir therapy. Acyclovir is poorly soluble — the label records a maximum water solubility of 2.5 mg/mL at 37°C — and can crystallise in the renal tubules when concentrated.',
          clinicalPrecaution:
            'Risk is higher with rapid intravenous infusion, dehydration, pre-existing renal impairment and older age; the label notes plasma concentrations are higher in geriatric patients because of age-related changes in renal function.',
        },
        {
          name: 'Start early or do not bother',
          action:
            'For shingles, the drug is worth starting only within the first three days of the rash.',
          patientImpact:
            'The label states that treatment was begun within 72 hours of rash onset in the trials and was most effective if started within the first 48 hours, and that adults over 50 showed greater benefit.',
          clinicalPrecaution:
            'This is a description of what the trials did, not a dosing instruction. Outside that window there is no trial evidence of benefit in immunocompetent shingles.',
        },
        {
          name: 'Say if your immune system is suppressed',
          action:
            'Name any transplant, chemotherapy, HIV diagnosis or immunosuppressive drug before starting.',
          patientImpact:
            'The label warns that thrombotic thrombocytopenic purpura and haemolytic uraemic syndrome, which have resulted in death, have occurred in immunocompromised patients receiving acyclovir. It also records that acyclovir-resistant isolates are recovered from immunocompromised patients, especially in advanced HIV infection.',
          clinicalPrecaution:
            'The same population that needs the drug most is the population in which both the rare fatal reaction and treatment-emergent resistance are concentrated.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1=NC2=C(N1COCCO)N=C(NC2=O)N',
      chemicalFormula: 'C8H11N5O3',
      molecularWeight: '225.20 g/mol',
      targetReceptorAffinity:
        'A synthetic purine nucleoside analogue in which the sugar ring of guanosine is replaced by an acyclic hydroxyethoxymethyl side chain — it has the 5′ position needed to be phosphorylated and lacks the 3′ hydroxyl needed to extend a DNA chain. The label states selectivity comes from affinity for the thymidine kinase encoded by HSV and VZV, which converts acyclovir into the monophosphate; cellular guanylate kinase and other cellular enzymes complete the conversion to triphosphate. Acyclovir triphosphate stops herpes DNA replication three ways: competitive inhibition of viral DNA polymerase, incorporation into and termination of the growing chain, and inactivation of the polymerase. IC50 by plaque reduction ranges from 0.02 to 13.5 mcg/mL for HSV-1, 0.01 to 9.9 for HSV-2 and 0.12 to 10.8 for VZV; the greater activity against HSV than VZV reflects more efficient phosphorylation by the HSV thymidine kinase. Maximum water solubility is 2.5 mg/mL at 37°C, with pKa values of 2.27 and 9.25.',
      structureSource: {
        label:
          'PubChem CID 135398513 (acyclovir) — canonical SMILES, molecular formula and weight, as carried on the enriched record; mechanism, IC50 ranges, solubility and pKa from the acyclovir capsules label, Description and Mechanism of Antiviral Action',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/135398513',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'acv-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the guanine base and the missing 3′ hydroxyl',
          description:
            'Everything acyclovir does depends on one absence: there is no 3′ hydroxyl on the side chain, so nothing can be attached after it. An impurity that restores a hydroxyl at that position is not an inactive impurity — it is a molecule that would be incorporated and then allow the chain to continue, which is the opposite of the intended action. Identity testing has to establish the side chain, not just the base.',
          reagentsAndBuffer:
            'Acyclovir reference standard, reverse-phase HPLC with UV detection at 254 nm, 1H and 13C NMR to confirm the acyclic side chain, guanine limit test, loss on drying and residue on ignition',
        },
        {
          id: 'acv-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Alkylate guanine at N9 rather than N7',
          description:
            'Guanine has two ring nitrogens that will accept the side chain, and only the N9 product is the drug. The N7 regioisomer is the principal process-related impurity and it is not an antiviral. Regiochemical control, by protection or by thermodynamic equilibration to the N9 product, is the central problem of the synthesis.',
          dependsOnStepId: 'acv-w1',
          reagentsAndBuffer:
            'Guanine or a protected diacetylguanine, 2-oxa-1,4-butanediol diacetate or an equivalent alkylating agent, acid catalysis, controlled temperature for N7 to N9 equilibration, subsequent deacetylation under base',
        },
        {
          id: 'acv-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallise a compound that barely dissolves',
          description:
            'Acyclovir has a maximum water solubility of 2.5 mg/mL at 37°C. That is why the crystal form matters for dissolution and why the drug precipitates in renal tubules at high plasma concentrations. Purification therefore controls two things at once: the N7 isomer, and the polymorph and particle size that determine how fast it dissolves.',
          dependsOnStepId: 'acv-w2',
          reagentsAndBuffer:
            'Recrystallisation from water or aqueous alkali with controlled cooling, X-ray powder diffraction for polymorph identity, laser diffraction particle sizing, HPLC limit test for the N7 regioisomer and residual guanine',
        },
        {
          id: 'acv-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Show the drug does nothing without the viral kinase',
          description:
            'The selectivity claim is testable directly: run the compound against cells infected with wild-type virus and against cells infected with a thymidine kinase-deficient mutant. If the compound inhibits both, its activity does not depend on viral activation and the entire safety argument collapses. This experiment is also the model for the commonest clinical resistance mechanism, since most acyclovir-resistant clinical isolates are thymidine kinase-deficient.',
          dependsOnStepId: 'acv-w3',
          reagentsAndBuffer:
            'Vero or human foreskin fibroblast monolayers, wild-type HSV-1 and HSV-2 alongside isogenic thymidine kinase-negative mutants, plaque-reduction assay, uninfected-cell cytotoxicity control at the same concentrations',
        },
        {
          id: 'acv-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Measure chain termination on a defined template',
          description:
            'Plaque reduction shows the virus stopped growing. It does not show that the drug terminated a DNA chain. The mechanism-specific readout is a primer extension on a defined template with purified viral polymerase: acyclovir triphosphate should appear as a discrete stop band at every position where the incorporated analogue sits, and the polymerase should remain associated with the terminated primer.',
          dependsOnStepId: 'acv-w4',
          reagentsAndBuffer:
            'Purified HSV DNA polymerase with UL42 processivity factor, synthetic template-primer with a labelled primer, dNTP mix with and without acyclovir triphosphate, denaturing polyacrylamide sequencing gel, human DNA polymerase alpha as the selectivity control',
        },
      ],
    },
    keyAudits: [
      {
        id: 'acv-a1',
        category: 'measured',
        title: 'Halved mortality in herpes encephalitis',
        laymanSummary:
          'In the trial that established it, people with biopsy-proven herpes encephalitis died at 28% on acyclovir against 54% on the drug it replaced. More than twice as many were functioning normally six months later.',
        technicalDetails:
          'Two hundred and eight patients undergoing brain biopsy for presumptive herpes simplex encephalitis were randomised to vidarabine 15 mg/kg/day or acyclovir 30 mg/kg/day for ten days. Sixty-nine (33%) had biopsy-proven disease: 37 on vidarabine, 32 on acyclovir. Mortality was 54% on vidarabine against 28% on acyclovir (p=0.008). Stratified by Glasgow coma score at the start of treatment — above 10, 7 to 10, and 6 or below — six-month mortality was 42%, 46% and 67% on vidarabine against 0%, 25% and 25% on acyclovir. At six months, 12 of 32 acyclovir recipients (38%) were functioning normally against 5 of 37 on vidarabine (14%), p=0.021. This is a hard-endpoint result in a small trial with an active comparator, and it is the strongest single piece of evidence the molecule has.',
        evidenceSource:
          'Whitley RJ, Alford CA, Hirsch MS, et al. Vidarabine versus acyclovir therapy in herpes simplex encephalitis. N Engl J Med 1986;314:144-149',
        doi: '10.1056/NEJM198601163140303',
        measuredMetric:
          'Six-month mortality and functional recovery in biopsy-proven herpes simplex encephalitis',
        auditFlag: 'verified',
      },
      {
        id: 'acv-a2',
        category: 'failed',
        title: 'Genital ulcers fell 73%. HIV transmission did not move.',
        laymanSummary:
          'The reasoning was airtight: herpes sores raise HIV transmission, so suppressing herpes should lower it. In 3,408 African couples, acyclovir cut herpes ulcers by nearly three-quarters and lowered HIV levels in blood — and transmitted HIV at exactly the same rate as placebo.',
        technicalDetails:
          'A randomised placebo-controlled trial enrolled 3,408 serodiscordant couples at 14 African sites in which the HIV-1-positive partner was also HSV-2-positive, had a CD4 count of 250 or above, and was not on antiretroviral therapy. The intervention was acyclovir 400 mg twice daily. Of 132 HIV-1 seroconversions after randomisation (2.7 per 100 person-years), 84 were genetically linked within couples: 41 on acyclovir and 43 on placebo, hazard ratio 0.92 (95% CI 0.60 to 1.41, p=0.69). The drug did what it was supposed to do at every intermediate step: HSV-2-positive genital ulcers fell 73% (risk ratio 0.27, 95% CI 0.20 to 0.36, p<0.001) and mean plasma HIV-1 fell by 0.25 log10 copies/mL (95% CI 0.22 to 0.29, p<0.001). Adherence to dispensed drug was 96% and 92% of the index partners remained in the study for 24 months, so the null result cannot be explained away as a failure of execution. Both surrogates moved. The outcome did not.',
        evidenceSource:
          'Celum C, Wald A, Lingappa JR, et al. Acyclovir and transmission of HIV-1 from persons infected with HIV-1 and HSV-2. N Engl J Med 2010;362:427-439 (Partners in Prevention HSV/HIV Transmission Study)',
        doi: '10.1056/NEJMoa0904849',
        measuredMetric:
          'Genetically linked HIV-1 transmission within serodiscordant couples over 24 months',
        auditFlag: 'verified',
      },
      {
        id: 'acv-a3',
        category: 'failed',
        title: 'And it did not stop people acquiring HIV either',
        laymanSummary:
          'The companion trial asked the other half of the question: does suppressing herpes protect an uninfected person from catching HIV? In 3,172 participants the answer was no, with the numbers pointing slightly the wrong way.',
        technicalDetails:
          'A double-blind randomised placebo-controlled phase 3 trial in HIV-negative, HSV-2-seropositive women in Africa and men who have sex with men in Peru and the United States assigned participants to aciclovir 400 mg twice daily (n=1,637) or placebo (n=1,640) for 12 to 18 months. In the 3,172-participant primary dataset, HIV-1 incidence was 3.9 per 100 person-years on aciclovir (75 events in 1,935 person-years) against 3.3 on placebo (64 events in 1,969 person-years), hazard ratio 1.16 (95% CI 0.83 to 1.62). Genital ulcers on examination fell 47% (relative risk 0.53, 0.46 to 0.62) and HSV-2-positive ulcers 63% (0.37, 0.31 to 0.45). Adherence was 94% in both arms and retention 85% at 18 months in both. Two independently designed trials, one on transmission and one on acquisition, in different populations on two continents, both reduced the surrogate substantially and neither moved the outcome. Registered as NCT00076232.',
        evidenceSource:
          'Celum C, Wald A, Hughes J, et al. Effect of aciclovir on HIV-1 acquisition in herpes simplex virus 2 seropositive women and men who have sex with men: a randomised, double-blind, placebo-controlled trial. Lancet 2008;371:2109-2119 (HPTN 039)',
        doi: '10.1016/S0140-6736(08)60920-4',
        measuredMetric: 'HIV-1 acquisition over 12 to 18 months of herpes suppressive therapy',
        auditFlag: 'verified',
      },
      {
        id: 'acv-a4',
        category: 'inferred',
        title: 'It does not prevent the nerve pain that follows shingles',
        laymanSummary:
          'The thing people fear after shingles is the pain that outlasts the rash. Pooled randomised trials found acyclovir did not significantly reduce it at four months or at six.',
        technicalDetails:
          'A Cochrane review of randomised trials of antiviral treatment started within 72 hours of the herpes zoster rash identified six eligible trials in 1,211 participants, five of oral aciclovir and one of famciclovir. Pooling three trials in 609 participants, there was no significant difference between aciclovir and control in the incidence of postherpetic neuralgia four months after rash onset (risk ratio 0.75, 95% CI 0.51 to 1.11), and none at six months across two trials in 476 participants (risk ratio 1.05, 95% CI 0.87 to 1.27). The FDA label describes what the zoster trials did show: shortened time to lesion scabbing and healing, shortened time to complete cessation of pain during the acute episode, reduced duration of viral shedding and new lesion formation, and reduced prevalence of localised zoster-associated neurological symptoms. Faster healing of the acute episode is measured. Prevention of the chronic pain syndrome is not, and the pooled data do not support it.',
        evidenceSource:
          'Chen N, Li Q, Yang J, Zhou M, Zhou D, He L. Antiviral treatment for preventing postherpetic neuralgia. Cochrane Database Syst Rev 2014;2:CD006866; acyclovir capsules United States prescribing information, Clinical Trials — Herpes Zoster Infections',
        doi: '10.1002/14651858.CD006866.pub3',
        inferredClaim:
          'That treating the acute shingles rash with acyclovir prevents postherpetic neuralgia — an inference the pooled randomised evidence does not support at four or six months',
        auditFlag: 'caution',
      },
      {
        id: 'acv-a5',
        category: 'failed',
        title: 'No benefit in Bell’s palsy, alone or added to a steroid',
        laymanSummary:
          'Facial palsy was widely treated with acyclovir on the theory that a herpesvirus causes it. A 551-patient factorial trial found the steroid worked and the antiviral did not, either by itself or added on top.',
        technicalDetails:
          'A double-blind placebo-controlled factorial trial randomised 551 patients with Bell’s palsy within 72 hours of symptom onset to ten days of prednisolone, acyclovir, both, or placebo, with final outcomes assessed for 496. At three months, complete recovery of facial function on the House-Brackmann scale was 83.0% with prednisolone against 63.6% without (p<0.001), and 71.2% with acyclovir against 75.7% without (adjusted p=0.50). At nine months it was 94.4% against 81.6% for prednisolone (p<0.001) and 85.4% against 90.8% for acyclovir (adjusted p=0.10). The authors conclude there is no evidence of benefit from acyclovir given alone, and no additional benefit from adding it to prednisolone. Both acyclovir point estimates favour the control arm, which is not the same as harm and is not what a widely used treatment is expected to produce.',
        evidenceSource:
          'Sullivan FM, Swan IRC, Donnan PT, et al. Early treatment with prednisolone or acyclovir in Bell’s palsy. N Engl J Med 2007;357:1598-1607',
        doi: '10.1056/NEJMoa072006',
        measuredMetric:
          'Complete recovery of facial function on the House-Brackmann scale at 3 and 9 months',
        auditFlag: 'verified',
      },
      {
        id: 'acv-a6',
        category: 'measured',
        title: 'Suppression works, and the label reports it decaying over three years',
        laymanSummary:
          'Taken daily, it keeps most people free of genital herpes recurrences. The label reports the proportion staying recurrence-free rising each year — 45%, then 52%, then 63% — which is the natural history improving, not the drug getting stronger.',
        technicalDetails:
          'The label states that in double-blind placebo-controlled studies in patients with six or more recurrences a year, daily oral acyclovir given for four months to ten years prevented or reduced the frequency or severity of recurrences in more than 95% of patients. In a three-year study of acyclovir 400 mg twice daily, 45%, 52% and 63% of patients remained free of recurrences in the first, second and third years respectively, and serial three-month analyses showed 71% to 87% recurrence-free in each quarter. The rising annual figures are usually read as increasing efficacy; the more defensible reading is that genital herpes recurrence frequency falls naturally over years, so the same drug in the same people produces a better-looking number each year. That is a confound the label reports and does not resolve, because the study had no concurrent untreated arm running for three years.',
        evidenceSource:
          'Acyclovir capsules United States prescribing information, Clinical Trials — Recurrent Genital Herpes',
        measuredMetric:
          'Proportion of patients free of genital herpes recurrence during each of three years of continuous suppressive therapy',
        auditFlag: 'caution',
      },
      {
        id: 'acv-a7',
        category: 'conclusion_shift',
        title:
          'Resistance is a problem of the immunocompromised, and it is built into the mechanism',
        laymanSummary:
          'The same feature that makes acyclovir safe — it needs a viral enzyme to switch it on — is the feature that lets the virus escape. A virus that discards that enzyme becomes untouchable by the drug.',
        technicalDetails:
          'The label states that resistance can result from qualitative and quantitative changes in the viral thymidine kinase or DNA polymerase, that clinical isolates with reduced susceptibility have been recovered from immunocompromised patients especially in advanced HIV infection, and that most acyclovir-resistant mutants isolated so far are thymidine kinase-deficient. It adds that thymidine kinase-negative mutants may cause severe disease in infants and immunocompromised adults. The selectivity mechanism and the resistance mechanism are the same event viewed from two sides: the drug is inert without viral thymidine kinase, and a virus without viral thymidine kinase is invisible to the drug. It also means every drug that shares the activation step — famciclovir and penciclovir — shares the cross-resistance, and escaping it requires a molecule that does not need viral activation at all.',
        evidenceSource:
          'Acyclovir capsules United States prescribing information, Mechanism of Antiviral Action and Drug Resistance',
        measuredMetric:
          'Thymidine kinase-deficient acyclovir-resistant clinical isolates recovered from immunocompromised patients',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A pro-drug that most of the gut ignores',
        laymanDesc:
          'Only a fraction of a swallowed dose reaches the blood, and the fraction gets smaller as the dose gets bigger. That is why the shingles regimen is five capsules a day.',
        molecularDetail:
          'The label states that increases in plasma acyclovir concentration are less than dose proportional with increasing dose, and that the decrease in bioavailability is a function of the dose and not the dosage form. Food has no effect on absorption. The only known urinary metabolite is 9-[(carboxymethoxy)methyl]guanine; the rest is excreted unchanged by the kidney.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It is switched on only inside an infected cell',
        laymanDesc:
          'The drug arrives inert. A herpes enzyme performs the first chemical step that activates it — and uninfected cells do not have that enzyme.',
        molecularDetail:
          'The label attributes the highly selective inhibitory activity to affinity for the thymidine kinase encoded by HSV and VZV, which converts acyclovir into acyclovir monophosphate. Greater activity against HSV than VZV reflects more efficient phosphorylation by the HSV enzyme.',
        iconName: 'Key',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The cell finishes the job',
        laymanDesc:
          'Two more phosphates are added by the cell’s own enzymes, turning the drug into a counterfeit DNA building block.',
        molecularDetail:
          'Cellular guanylate kinase converts the monophosphate to the diphosphate and a number of cellular enzymes complete the conversion to acyclovir triphosphate. The triphosphate accumulates selectively in infected cells because only they perform the first step.',
        iconName: 'Zap',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'The viral copier takes the counterfeit and jams',
        laymanDesc:
          'The virus’s DNA-copying enzyme grabs the fake letter, attaches it, and then finds there is nothing to attach the next letter to.',
        molecularDetail:
          'The label describes three simultaneous actions: competitive inhibition of viral DNA polymerase, incorporation into and termination of the growing viral DNA chain, and inactivation of the viral DNA polymerase. The termination is obligate because the acyclic side chain has no 3′ hydroxyl.',
        iconName: 'Scissors',
        visualStage: 'target_binding',
      },
      {
        step: 5,
        title: 'The outbreak heals faster — the virus stays',
        laymanDesc:
          'Lesions scab and heal sooner and shedding stops sooner. Nothing about the treatment removes the latent virus sitting in the nerve.',
        molecularDetail:
          'In the zoster trials the label reports shortened times to lesion scabbing, healing and complete cessation of acute pain, reduced viral shedding and reduced new lesion formation, with treatment started within 72 hours and greatest benefit within 48. In the chickenpox trials in 993 children the drug shortened time to 50% healing and reduced maximum lesion count, and did not affect varicella-zoster-specific humoral or cellular immune responses at one month or one year.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What suppressing the virus does not do',
        laymanDesc:
          'Two large trials showed that cutting herpes ulcers sharply had no effect on HIV transmission or acquisition. The intermediate step moved; the thing that mattered did not.',
        molecularDetail:
          'Partners in Prevention: HSV-2-positive genital ulcers down 73% (RR 0.27) and plasma HIV-1 down 0.25 log10, with linked HIV-1 transmission hazard ratio 0.92 (95% CI 0.60 to 1.41, p=0.69) in 3,408 couples. HPTN 039: genital ulcers down 47%, HIV-1 acquisition hazard ratio 1.16 (95% CI 0.83 to 1.62) in 3,172 participants.',
        iconName: 'XCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'Whitley RJ et al., N Engl J Med 1986;314:144-149 (NIAID Collaborative Antiviral Study Group)',
        phase: 'Randomised, active-controlled trial against vidarabine',
        sampleSize: 208,
        primaryEndpoint:
          'Mortality and functional outcome at six months in biopsy-proven herpes simplex encephalitis',
        endpointMet: true,
        statisticalPValue:
          'Mortality 28% on acyclovir against 54% on vidarabine (p=0.008) among 69 biopsy-proven cases; normal function at six months 38% against 14% (p=0.021)',
        unreportedAdverseSignals:
          'Only 69 of the 208 randomised patients (33%) had biopsy-proven disease, so the mortality comparison rests on 32 and 37 patients respectively. The result is large and the trial is small.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'Partners in Prevention HSV/HIV Transmission Study (Celum C et al., N Engl J Med 2010;362:427-439)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, 14 African sites',
        sampleSize: 3408,
        primaryEndpoint:
          'Genetically linked transmission of HIV-1 to the initially uninfected partner in serodiscordant couples',
        endpointMet: false,
        statisticalPValue:
          '41 linked transmissions on acyclovir against 43 on placebo; hazard ratio 0.92 (95% CI 0.60 to 1.41), p=0.69',
        unreportedAdverseSignals:
          'Every intermediate measure moved as predicted — HSV-2-positive genital ulcers fell 73% (RR 0.27, 95% CI 0.20 to 0.36) and mean plasma HIV-1 fell 0.25 log10 copies/mL — with 96% adherence and 92% retention at 24 months. The null result is a mechanism result, not an execution failure.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'HPTN 039 (Celum C et al., Lancet 2008;371:2109-2119; NCT00076232)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 3172,
        primaryEndpoint: 'HIV-1 acquisition in HSV-2-seropositive HIV-negative participants',
        endpointMet: false,
        statisticalPValue:
          'HIV-1 incidence 3.9 per 100 person-years on aciclovir against 3.3 on placebo; hazard ratio 1.16 (95% CI 0.83 to 1.62)',
        unreportedAdverseSignals:
          'Genital ulcers on examination fell 47% and HSV-2-positive ulcers 63%. Adherence was 94% in both arms. The point estimate favours placebo.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'Sullivan FM et al., N Engl J Med 2007;357:1598-1607 (Bell’s palsy factorial trial)',
        phase: 'Randomised, double-blind, placebo-controlled, 2x2 factorial',
        sampleSize: 551,
        primaryEndpoint:
          'Complete recovery of facial function on the House-Brackmann scale at 3 and 9 months',
        endpointMet: false,
        statisticalPValue:
          'Acyclovir 71.2% against 75.7% at 3 months (adjusted p=0.50) and 85.4% against 90.8% at 9 months (adjusted p=0.10). Prednisolone, in the same trial, 83.0% against 63.6% (p<0.001) and 94.4% against 81.6% (p<0.001)',
        unreportedAdverseSignals:
          'Both acyclovir point estimates favour the control arm. The authors report no evidence of benefit from acyclovir alone and no additional benefit when added to prednisolone.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Mortality in biopsy-proven herpes simplex encephalitis 28% against 54% on vidarabine (p=0.008), with normal function at six months 38% against 14%',
        'Reduction of HSV-2-positive genital ulcers by 73% (RR 0.27, 95% CI 0.20 to 0.36) and of plasma HIV-1 by 0.25 log10 copies/mL in 3,408 couples',
        'Shortened time to lesion scabbing, healing and cessation of acute pain in placebo-controlled zoster trials when started within 72 hours',
        'Prevention or reduction of genital herpes recurrences in more than 95% of patients on daily suppressive therapy, per the label',
      ],
      unsupportedInferences: [
        'That suppressing herpes reactivation reduces HIV transmission or acquisition — two large randomised trials found hazard ratios of 0.92 and 1.16',
        'That treating the acute shingles rash prevents postherpetic neuralgia — pooled trials found RR 0.75 (0.51 to 1.11) at four months and 1.05 (0.87 to 1.27) at six',
        'That a herpesvirus aetiology for Bell’s palsy makes an antiviral useful for it — the factorial trial found no benefit alone or added to prednisolone',
        'That the rising year-on-year recurrence-free rates during suppression show increasing efficacy, when the study had no concurrent untreated arm and recurrence frequency falls naturally over time',
      ],
      whatFailedInitially: [
        'HIV-1 transmission was unchanged despite a 73% reduction in the genital ulcers that were supposed to mediate it',
        'HIV-1 acquisition was, if anything, slightly higher on aciclovir than on placebo in HPTN 039',
        'Postherpetic neuralgia was not significantly reduced at four or six months in pooled randomised trials',
        'Bell’s palsy recovery was not improved, with both point estimates favouring no acyclovir',
      ],
      realWorldOutcome: [
        'Approved in the United States in 1982, generic since the late 1990s, and now about ten United States cents a capsule at pharmacy acquisition cost',
        'On the WHO Model List of Essential Medicines; the selective-nucleoside work behind it was recognised in the 1988 Nobel Prize in Physiology or Medicine',
        'Largely displaced in outpatient use by its own prodrug valacyclovir, which is dosed once or twice daily instead of five times and costs about two and a third times as much per tablet',
        'Resistance remains concentrated in immunocompromised patients and is almost always thymidine kinase deficiency, which confers cross-resistance to famciclovir as well',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule at 200 mg, tablet at 400 and 800 mg, oral suspension, intravenous infusion, topical cream and ointment, and a buccal tablet — oral dosing ranges from twice to five times daily depending on indication',
      description:
        'Oral absorption is incomplete and saturable: the label states plasma concentrations rise less than dose proportionally, and that the fall in bioavailability depends on the dose rather than the formulation. Food does not affect absorption. Half-life and total body clearance both depend on renal function, and plasma concentrations are higher in older people because of age-related decline in it. In children aged seven months to seven years, mean half-life after 300 to 600 mg/m² was 2.6 hours.',
      safetyProfile:
        'The label warns that renal failure, in some cases resulting in death, has been observed with acyclovir therapy — the drug is poorly soluble at 2.5 mg/mL in water at 37°C and can crystallise in renal tubules, particularly with rapid intravenous administration or dehydration. It also warns that thrombotic thrombocytopenic purpura and haemolytic uraemic syndrome, which have resulted in death, have occurred in immunocompromised patients receiving acyclovir. Dose reduction is required in renal impairment. Probenecid raises acyclovir exposure by reducing renal clearance. Resistant isolates, almost always thymidine kinase-deficient, are recovered from immunocompromised patients and can cause severe disease in infants and immunocompromised adults.',
    },
    commonQuestions: [
      {
        q: 'Does it cure herpes?',
        a: 'No, and nothing licensed does. After a first infection the virus withdraws into nerve cell bodies and persists there in a form that makes no DNA and therefore presents nothing for this drug to act on — acyclovir only works on a virus that is actively copying itself. What it does is shorten an outbreak that has started and, taken daily, greatly reduce how often outbreaks occur: the label reports more than 95% of people with six or more recurrences a year had them prevented or reduced on suppressive therapy. Stopping the drug returns the pattern to whatever it was.',
        auditNote:
          'The label also reports that the proportion recurrence-free rose from 45% to 52% to 63% across three years of continuous therapy. There was no concurrent untreated arm, and recurrence frequency falls naturally over time, so that rise cannot be attributed to the drug.',
      },
      {
        q: 'Why does it not harm my own cells?',
        a: 'Because it is inert until something switches it on, and the switch belongs to the virus. Acyclovir has to be phosphorylated three times before it becomes the active molecule, and the first of those three steps is performed efficiently only by the thymidine kinase that herpes simplex and varicella-zoster carry with them. An uninfected cell has no such enzyme, so the drug accumulates in its useless form and is excreted. This is unusually clean selectivity for an antiviral and it is the reason a drug that terminates DNA chains can be given to children with chickenpox.',
      },
      {
        q: 'If it stops herpes sores, why did it not reduce HIV transmission?',
        a: 'Nobody fully knows, and that is what makes the result worth reading. The reasoning was as strong as observational reasoning gets: herpes sores break the mucosal barrier and recruit exactly the CD4 cells HIV infects, so suppressing them should lower transmission. Two large randomised trials tested it — 3,408 couples for transmission and 3,172 individuals for acquisition — and both were null despite the drug reducing genital ulcers by 73% and 47% respectively and lowering plasma HIV levels. The leading explanation is that acyclovir suppresses the ulcers without eliminating the sub-clinical inflammation and activated immune cells that persist in genital mucosa between outbreaks. What is certain is the general lesson: a surrogate that moves is not an outcome that moves.',
      },
      {
        q: 'Should I take it for shingles?',
        a: 'The trials on the label say it helps if started early: within 72 hours of the rash appearing and most effectively within 48 hours, with greater benefit in adults over 50. What it shortens is the acute episode — time to scabbing, to healing, to the pain stopping, and how long the virus is shed. What it does not appear to do is prevent postherpetic neuralgia, the nerve pain that outlasts the rash and is what most people actually fear. A Cochrane review pooling six randomised trials in 1,211 people found no significant reduction at four months or six. Those are two different claims and they are often merged into one.',
      },
      {
        q: 'Is valacyclovir better?',
        a: 'It is the same drug with a valine attached, which the body cleaves off after absorption; the difference is how much gets in, not what happens once it is there. The practical consequences are real: once or twice a day instead of five times, which matters for whether a course is actually finished. And valacyclovir has one piece of evidence acyclovir does not — a randomised trial in 1,484 discordant couples showing daily suppressive therapy reduced transmission of symptomatic genital herpes to the uninfected partner (4 of 743 against 16 of 741, hazard ratio 0.25) and any HSV-2 acquisition (1.9% against 3.6%, hazard ratio 0.52). At United States pharmacy acquisition cost it runs about twenty-three cents a tablet against about ten for acyclovir.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Acyclovir capsules and tablets United States prescribing information — Description, Mechanism of Antiviral Action, Drug Resistance, Clinical Pharmacology, Clinical Trials, Indications and Usage, Warnings',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=acyclovir',
        kind: 'regulatory',
      },
      {
        label:
          'Whitley RJ, Alford CA, Hirsch MS, et al. Vidarabine versus acyclovir therapy in herpes simplex encephalitis. N Engl J Med 1986;314:144-149',
        identifier: '10.1056/NEJM198601163140303',
        kind: 'doi',
      },
      {
        label:
          'Celum C, Wald A, Lingappa JR, et al. Acyclovir and transmission of HIV-1 from persons infected with HIV-1 and HSV-2. N Engl J Med 2010;362:427-439',
        identifier: '10.1056/NEJMoa0904849',
        kind: 'doi',
      },
      {
        label:
          'Celum C, Wald A, Hughes J, et al. Effect of aciclovir on HIV-1 acquisition in herpes simplex virus 2 seropositive women and men who have sex with men: a randomised, double-blind, placebo-controlled trial. Lancet 2008;371:2109-2119',
        identifier: '10.1016/S0140-6736(08)60920-4',
        kind: 'doi',
      },
      {
        label: 'HPTN 039 — aciclovir for HIV-1 prevention in HSV-2 seropositive persons',
        identifier: 'NCT00076232',
        kind: 'nct',
      },
      {
        label:
          'Sullivan FM, Swan IRC, Donnan PT, et al. Early treatment with prednisolone or acyclovir in Bell’s palsy. N Engl J Med 2007;357:1598-1607',
        identifier: '10.1056/NEJMoa072006',
        kind: 'doi',
      },
      {
        label:
          'Chen N, Li Q, Yang J, Zhou M, Zhou D, He L. Antiviral treatment for preventing postherpetic neuralgia. Cochrane Database Syst Rev 2014;2:CD006866',
        identifier: '10.1002/14651858.CD006866.pub3',
        kind: 'doi',
      },
      {
        label:
          'Corey L, Wald A, Patel R, et al. Once-daily valacyclovir to reduce the risk of transmission of genital herpes. N Engl J Med 2004;350:11-20',
        identifier: '10.1056/NEJMoa035144',
        kind: 'doi',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — acyclovir, 53 listed generic oral solid products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 135398513 — acyclovir structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/135398513',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 4. Methotrexate — the anchor drug of rheumatology, by a label that says its mechanism in
  //    rheumatoid arthritis is unknown, and a 4,786-patient trial that tested the theory and lost.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'methotrexate',
    name: 'Methotrexate',
    tradeName: 'Trexall / Otrexup / Rasuvo / Reditrex / Xatmep',
    sponsor:
      'Many manufacturers; the oral tablet is generic and the auto-injector presentations are branded. Methotrexate was first synthesised in 1947 and has been in United States use since the 1950s',
    targetGene: 'DHFR',
    targetProtein:
      'Dihydrofolate reductase, competitively inhibited; the label states the mechanism in rheumatoid arthritis and psoriasis is unknown',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1953,
    indication:
      'Acute lymphoblastic leukaemia as part of a combination maintenance regimen; mycosis fungoides; relapsed or refractory non-Hodgkin lymphoma as part of a metronomic combination regimen; rheumatoid arthritis in adults; polyarticular juvenile idiopathic arthritis in children; and severe psoriasis in adults',
    patientFriendlyIndication:
      'Rheumatoid arthritis, juvenile arthritis, severe psoriasis, and some cancers',
    anatomicalSite:
      'Dihydrofolate reductase in the cytoplasm of rapidly dividing cells; at anti-inflammatory doses the relevant site is not established',
    conditionContext: {
      conditionExplainer:
        'Rheumatoid arthritis is the immune system attacking the lining of joints. The inflammation erodes cartilage and bone, and the damage is permanent: a joint destroyed in the first two years stays destroyed however well the disease is controlled afterwards. That is why treatment starts early and why a drug that merely relieves pain is not enough.',
      whyItMatters:
        'Methotrexate is the drug every other rheumatoid arthritis treatment is measured against and, usually, added to. It costs about sixteen United States cents a tablet. The biologics that came after it cost hundreds of dollars a dose, and in the one blinded head-to-head trial, methotrexate in a three-drug combination was non-inferior to methotrexate plus a biologic.',
      whoTakesThis:
        'Adults with rheumatoid arthritis, children with polyarticular juvenile idiopathic arthritis, adults with severe psoriasis, and — at very different doses — people with acute lymphoblastic leukaemia and certain lymphomas.',
      clinicalGoals:
        'Suppression of disease activity and prevention of joint damage in arthritis; remission and cure in the leukaemia setting. These are two different drugs in practice, separated by roughly a hundredfold in dose.',
    },
    oneSentenceVerdict:
      'A dihydrofolate reductase inhibitor whose own label states its mechanism in rheumatoid arthritis is unknown, which in a 353-patient double-blind trial produced a DAS28 fall of 2.1 in a three-drug combination against 2.3 with etanercept added — non-inferior at a hundredth of the price — and which, when the anti-inflammatory theory behind it was tested directly in 4,786 patients with coronary disease, reduced neither interleukin-6, nor C-reactive protein, nor cardiovascular events.',
    laymanHowItWorks:
      'Folate is the raw material cells use to build new DNA. Methotrexate blocks the enzyme that turns folate into the usable form, so cells that are dividing fast run out of the parts they need. At the high doses used in leukaemia, that is exactly the point: the cancer cells divide fastest and die first. At the low weekly doses used in arthritis the drug is doing something else — something anti-inflammatory that is probably about adenosine release rather than about blocking DNA at all — and the official prescribing information says outright that the mechanism in rheumatoid arthritis and psoriasis is unknown.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 76,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1566 per 2.5 mg tablet at United States pharmacy acquisition cost (CMS NADAC, median across 18 listed generic products, survey effective 19 August 2026); the injectable vial presentations run at US$1.7563 per mL across 9 listed products in the same survey',
      markupEstimate: '',
      openPatentNotes:
        'In United States use since the 1950s and generic throughout. It is on the WHO Model List of Essential Medicines as both an antineoplastic and a disease-modifying antirheumatic drug. The branded auto-injector presentations — Otrexup, Rasuvo, Reditrex — are patented delivery devices around an unpatentable molecule, which is the standard route by which an old generic re-enters the market at a new price.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The most instructive comparison in rheumatoid arthritis is not between methotrexate and a biologic but between two ways of building on methotrexate. In a 353-patient blinded non-inferiority trial, adding sulfasalazine and hydroxychloroquine to methotrexate was non-inferior to adding etanercept, on disease activity, on radiographic progression, on pain and on quality of life. The three generic tablets together cost under a dollar a day. The biologic costs several hundred dollars a dose.',
      conventionalRx: [
        {
          name: 'Triple therapy — methotrexate plus sulfasalazine plus hydroxychloroquine',
          class: 'Conventional synthetic disease-modifying antirheumatic drugs in combination',
          howItCompares:
            'The RACAT trial randomised 353 patients with active disease despite methotrexate to triple therapy or etanercept plus methotrexate for 48 weeks. Change in DAS28 was -2.1 with triple therapy against -2.3 with etanercept plus methotrexate (p=0.26); the 95% upper confidence limit of 0.41 fell below the non-inferiority margin of 0.6 (p=0.002). There were no significant differences in radiographic progression, pain, quality of life, or major adverse events.',
          typicalCost:
            'Sulfasalazine US$0.2003 per tablet (14 listed generic products) and hydroxychloroquine US$0.1485 per tablet (32 listed generic products) at United States pharmacy acquisition cost (CMS NADAC, survey effective 19 August 2026), added to methotrexate at US$0.1566 per tablet',
          prosAndCons:
            'Pros: non-inferior in the only blinded head-to-head trial; a fraction of the cost; no injection. Cons: three drugs, three monitoring schedules and three sets of adverse effects; more tablets a day than most people want to take.',
        },
        {
          name: 'Adalimumab or etanercept (TNF inhibitors)',
          class: 'Biologic disease-modifying antirheumatic drugs',
          howItCompares:
            'Faster onset and the option of stopping methotrexate in some patients, at roughly four thousand times the per-dose acquisition cost. The blinded comparison against triple therapy did not show superiority on disease activity or on joint damage.',
          typicalCost:
            'Adalimumab biosimilars US$638.80 per 40 mg pen at United States pharmacy acquisition cost (CMS NADAC, median across 7 listed products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: works where methotrexate alone has failed; usually well tolerated. Cons: serious infection and tuberculosis reactivation risk; injection; a price that in most of the world places it out of reach.',
        },
        {
          name: 'Leflunomide',
          class: 'Pyrimidine synthesis inhibitor',
          howItCompares:
            'Blocks a different biosynthetic pathway — pyrimidines rather than folate-dependent purines and thymidylate — and is the usual choice where methotrexate is not tolerated. It shares the hepatotoxicity and the absolute contraindication in pregnancy, and it has a very long half-life requiring cholestyramine washout.',
          typicalCost:
            'US$0.3082 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 20 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: an alternative mechanism at a generic price. Cons: teratogenic with an elimination half-life measured in weeks; hepatotoxicity; hypertension.',
        },
      ],
      naturalFoods: [
        {
          name: 'Folic acid — a supplement that is part of the regimen, not an alternative to it',
          activeCompound: 'Folic acid, or folinic acid (leucovorin) in some regimens',
          biologicalMechanism:
            'Supplying reduced folate downstream of the blocked enzyme relieves the toxicity of methotrexate on rapidly dividing normal tissue. The surprising finding is that it does this without measurably blunting the anti-arthritic effect, which is itself evidence that the arthritis benefit is not simple antifolate action.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage:
            'Not stated here as advice, and the direction differs by indication. A Cochrane review of six randomised trials in 624 patients found folate supplementation during methotrexate for rheumatoid arthritis reduced gastrointestinal side effects by 26% relative (RR 0.74, 95% CI 0.59 to 0.92), abnormal transaminase elevation by 76.9% relative (RR 0.23, 95% CI 0.15 to 0.34) and withdrawal from methotrexate for any reason by 60.8% relative (RR 0.39, 95% CI 0.28 to 0.53), with no statistically significant effect on efficacy. The label directs folate supplementation for rheumatoid arthritis, juvenile arthritis and psoriasis — and directs the opposite for neoplastic disease, where folic acid products may decrease clinical effectiveness.',
          monthlyCost:
            'US$0.0193 per 1 mg tablet at United States pharmacy acquisition cost (CMS NADAC, median across 26 listed products, survey effective 19 August 2026)',
        },
      ],
      homeRemedies: [
        {
          name: 'Once a week. Not once a day.',
          action:
            'Know which day is your methotrexate day, and never take a second dose because one was missed.',
          patientImpact:
            'The boxed warning states: "Methotrexate tablets when inadvertently administered once daily have resulted in death." Section 5.9 records that deaths occurred as a result of medication errors, most commonly in patients taking methotrexate daily when a weekly regimen had been prescribed.',
          clinicalPrecaution:
            'This is a dosing-frequency error, not an overdose in the usual sense — each individual tablet is a normal tablet. It is the single most dangerous property of the drug in ordinary outpatient use.',
        },
        {
          name: 'Alcohol raises the liver risk, and the label says so',
          action: 'Discuss alcohol intake honestly before starting and while taking it.',
          patientImpact:
            'Section 5.5 states that methotrexate can cause severe and potentially irreversible hepatotoxicity including fibrosis, cirrhosis and fatal liver failure, that the risk is increased with heavy alcohol consumption, and that in psoriasis fibrosis or cirrhosis may occur in the absence of symptoms or abnormal liver tests.',
          clinicalPrecaution:
            'The label attaches the hepatotoxicity risk to total cumulative dose, stating it generally occurs after a cumulative 1.5 g or more, and directs liver testing at baseline and periodically.',
        },
        {
          name: 'Report a new cough or breathlessness the same week',
          action: 'Any new dry cough, shortness of breath or fever needs to be reported promptly.',
          patientImpact:
            'Section 5.6 states that pulmonary toxicity, including acute or chronic interstitial pneumonitis and irreversible or fatal cases, can occur with methotrexate, and directs monitoring with withholding or discontinuation as appropriate.',
          clinicalPrecaution:
            'Methotrexate pneumonitis is not dose-dependent in the way hepatotoxicity is and can appear at any point in treatment. Section 5.11 separately warns of life-threatening or fatal bacterial and fungal infection, so a new respiratory symptom has two serious explanations at once.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CN(CC1=CN=C2C(=N1)C(=NC(=N2)N)N)C3=CC=C(C=C3)C(=O)N[C@@H](CCC(=O)O)C(=O)O',
      chemicalFormula: 'C20H22N8O5',
      molecularWeight: '454.40 g/mol',
      targetReceptorAffinity:
        'A close structural analogue of folic acid, differing at two positions: a 4-amino group in place of the 4-oxo, and an N10 methyl. Those two changes convert a substrate into a tight-binding inhibitor of dihydrofolate reductase. The label states that dihydrofolates must be reduced to tetrahydrofolates by this enzyme before they can carry one-carbon groups in the synthesis of purine nucleotides and thymidylate, so methotrexate interferes with DNA synthesis, repair and cellular replication, and that actively proliferating tissues are in general more sensitive. It then states plainly that the mechanism of action in rheumatoid arthritis and in psoriasis is unknown. Inside cells the drug is polyglutamated, which traps it and extends its intracellular residence far beyond its plasma half-life.',
      structureSource: {
        label:
          'PubChem CID 126941 (methotrexate) — canonical SMILES, molecular formula and weight, as carried on the enriched record; mechanism statements from the methotrexate tablets label, section 12.1',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/126941',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'mtx-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Separate methotrexate from the folic acid it was built from',
          description:
            'Methotrexate differs from folic acid by an amino-for-oxo swap and one methyl group. Folic acid is therefore both the commonest process impurity and a functional antidote, so a batch contaminated with it is a batch of reduced potency for an indication where potency is the difference between remission and progression. The related-substance method must resolve folic acid, 4-amino-4-deoxy-N10-methylpteroic acid and the glutamate diastereomers.',
          reagentsAndBuffer:
            'Methotrexate reference standard, reverse-phase HPLC with gradient elution and UV detection at 302 nm, folic acid and 4-amino-4-deoxy-N10-methylpteroic acid as identified impurity standards, chiral assay for the L-glutamate configuration',
        },
        {
          id: 'mtx-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Couple the pteridine to the methylated aminobenzoyl glutamate',
          description:
            'The molecule is assembled from a 2,4-diaminopteridine fragment and an N10-methyl-para-aminobenzoyl-L-glutamate fragment. The classical route condenses a trihalo-acetone equivalent with 2,4,5,6-tetraaminopyrimidine in the presence of the benzoylglutamate, which is efficient and regiochemically messy — several pteridine isomers form and only one is the drug.',
          dependsOnStepId: 'mtx-w1',
          reagentsAndBuffer:
            '2,4,5,6-tetraaminopyrimidine, a three-carbon dihaloaldehyde equivalent, N-(4-(methylamino)benzoyl)-L-glutamic acid, aqueous buffer under controlled pH, activated carbon treatment',
        },
        {
          id: 'mtx-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Recrystallise and control the glutamate stereochemistry',
          description:
            'Only the L-glutamate is transported by the reduced folate carrier and polyglutamated by folylpolyglutamate synthase. The D-isomer is not taken up efficiently and is dead weight in a dose calculated as total drug. This is the step where the difference between a nominal dose and an effective dose is decided.',
          dependsOnStepId: 'mtx-w2',
          reagentsAndBuffer:
            'Dissolution in dilute alkali and reprecipitation at controlled pH, chiral HPLC or enzymatic assay for glutamate configuration, water content by Karl Fischer, heavy metals and residual solvents to compendial limits',
        },
        {
          id: 'mtx-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Confirm carrier-mediated uptake and polyglutamation',
          description:
            'Methotrexate does not diffuse into cells; it is carried in by the reduced folate carrier and then tagged with additional glutamates that stop it leaving. That retention, not the plasma half-life, is why a weekly tablet works. Cells that lose the carrier or the polyglutamate synthase become resistant while the enzyme target is still perfectly inhibitable, which is a resistance mechanism no enzyme assay would detect.',
          dependsOnStepId: 'mtx-w3',
          reagentsAndBuffer:
            'CCRF-CEM or similar lymphoblast lines alongside reduced-folate-carrier-deficient sublines, tritiated methotrexate for uptake kinetics, LC-MS/MS quantification of methotrexate polyglutamate chain lengths in cell lysate, folate-free medium',
        },
        {
          id: 'mtx-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Test the adenosine hypothesis against the antifolate one',
          description:
            'The anti-inflammatory mechanism at weekly low dose is not established, and the leading candidate — accumulation of AICAR leading to extracellular adenosine release — makes a falsifiable prediction the antifolate account does not: an adenosine receptor antagonist should abolish the anti-inflammatory effect while leaving the antiproliferative effect intact. That is the experiment that distinguishes the two stories, and its outcome is why the label does not commit to either.',
          dependsOnStepId: 'mtx-w4',
          reagentsAndBuffer:
            'Primary human monocytes or an air-pouch inflammation model, methotrexate at low weekly-equivalent exposure, adenosine A2A and A3 receptor antagonists, adenosine deaminase as a scavenger control, LC-MS/MS for extracellular adenosine and intracellular AICAR, cytokine panel by multiplex immunoassay',
        },
      ],
    },
    keyAudits: [
      {
        id: 'mtx-a1',
        category: 'inferred',
        title: 'The label says the mechanism in arthritis is unknown',
        laymanSummary:
          'Methotrexate is described everywhere as a folate blocker. Its own prescribing information says that in rheumatoid arthritis and psoriasis — its two commonest uses — the mechanism of action is unknown.',
        technicalDetails:
          'Section 12.1 sets out the antifolate mechanism in full: dihydrofolates must be reduced to tetrahydrofolates before they can carry one-carbon groups for purine and thymidylate synthesis, so methotrexate interferes with DNA synthesis, repair and cellular replication, and actively proliferating tissues are generally more sensitive. It then adds a single sentence: "The mechanism of action in rheumatoid arthritis and in psoriasis is unknown." The strongest evidence that the arthritis effect is not simple antifolate action comes from the drug’s own regimen: section 5.10 directs folic or folinic acid supplementation for rheumatoid arthritis, juvenile arthritis and psoriasis, and a Cochrane review of six trials in 624 patients found supplementation reduced toxicity substantially with no statistically significant effect on efficacy. If the therapeutic effect were folate depletion, replacing the folate should have removed it.',
        evidenceSource:
          'Methotrexate tablets United States prescribing information, sections 12.1 and 5.10; Shea B et al., Cochrane Database Syst Rev 2013;5:CD000951',
        doi: '10.1002/14651858.CD000951.pub2',
        inferredClaim:
          'That methotrexate treats rheumatoid arthritis by inhibiting dihydrofolate reductase — the mechanism its label describes for proliferating tissue and explicitly declines to extend to arthritis',
        auditFlag: 'contested',
      },
      {
        id: 'mtx-a2',
        category: 'failed',
        title: 'CIRT: the inflammation theory was tested directly and failed',
        laymanSummary:
          'If methotrexate works in arthritis by damping inflammation, and inflammation causes heart attacks, methotrexate should prevent heart attacks. In 4,786 patients it did not — and it did not lower any inflammatory marker either.',
        technicalDetails:
          'The Cardiovascular Inflammation Reduction Trial randomised 4,786 patients with previous myocardial infarction or multivessel coronary disease, plus type 2 diabetes or metabolic syndrome, to low-dose methotrexate at a target of 15 to 20 mg weekly or matching placebo, all with 1 mg of folate daily. It was stopped after a median 2.3 years. The final primary composite occurred in 201 patients on methotrexate against 207 on placebo (4.13 against 4.31 per 100 person-years; hazard ratio 0.96, 95% CI 0.79 to 1.16); the original composite in 170 against 167 (hazard ratio 1.01, 95% CI 0.82 to 1.25). Critically, methotrexate did not lower interleukin-1β, interleukin-6 or C-reactive protein at all. It did cause liver-enzyme elevations, reductions in leucocyte count and haematocrit, and more non-basal-cell skin cancers than placebo. The comparison that makes this instructive is CANTOS, published two years earlier: canakinumab, which does lower interleukin-6 and C-reactive protein, cut the same composite at 150 mg (hazard ratio 0.85, 95% CI 0.74 to 0.98, p=0.021) in 10,061 patients. The inflammatory hypothesis survived; the assumption that methotrexate is a general anti-inflammatory did not. Registered as NCT01594333.',
        evidenceSource:
          'Ridker PM, Everett BM, Pradhan A, et al. Low-dose methotrexate for the prevention of atherosclerotic events. N Engl J Med 2019;380:752-762; Ridker PM et al., N Engl J Med 2017;377:1119-1131 (CANTOS)',
        doi: '10.1056/NEJMoa1809798',
        measuredMetric:
          'Composite of nonfatal myocardial infarction, nonfatal stroke or cardiovascular death, plus interleukin-1β, interleukin-6 and C-reactive protein levels',
        auditFlag: 'verified',
      },
      {
        id: 'mtx-a3',
        category: 'measured',
        title: 'Three generic tablets matched a biologic in a blinded trial',
        laymanSummary:
          'In the only blinded head-to-head trial of its kind, adding two cheap old tablets to methotrexate worked as well as adding an injectable biologic — on disease activity, on joint damage, on pain and on quality of life.',
        technicalDetails:
          'RACAT randomised 353 patients with active rheumatoid arthritis despite methotrexate to triple therapy — methotrexate, sulfasalazine and hydroxychloroquine — or to etanercept plus methotrexate, for 48 weeks, with blinded switching at 24 weeks for those not meeting a pre-specified improvement threshold. Twenty-seven per cent of each group switched. Change in DAS28 from baseline to week 48 was -2.1 with triple therapy and -2.3 with etanercept plus methotrexate (p=0.26); triple therapy met non-inferiority, with the 95% upper confidence limit for the difference at 0.41 against a margin of 0.6 (p=0.002). There were no significant between-group differences in radiographic progression, pain, health-related quality of life, or major adverse events. The acquisition cost difference between the two regimens is roughly three orders of magnitude.',
        evidenceSource:
          'O’Dell JR, Mikuls TR, Taylor TH, et al. Therapies for active rheumatoid arthritis after methotrexate failure. N Engl J Med 2013;369:307-318 (RACAT)',
        doi: '10.1056/NEJMoa1303006',
        measuredMetric:
          'Change in DAS28 at 48 weeks, with radiographic progression, pain and quality of life as secondary endpoints',
        auditFlag: 'verified',
      },
      {
        id: 'mtx-a4',
        category: 'conclusion_shift',
        title: 'The supplement that was supposed to cancel the drug does not',
        laymanSummary:
          'Folic acid is the thing methotrexate blocks. Giving it alongside was expected to undo the treatment. Pooled trials show it removes most of the toxicity and leaves the benefit intact — which is a problem for the standard explanation of how the drug works.',
        technicalDetails:
          'A Cochrane review of six double-blind randomised placebo-controlled trials in 624 rheumatoid arthritis patients on methotrexate at 25 mg weekly or less, restricted to low-dose supplementation of 7 mg weekly or less, found folic or folinic acid reduced gastrointestinal side effects by 26% relative and 9% absolute (RR 0.74, 95% CI 0.59 to 0.92, p=0.008), abnormal serum transaminase elevation by 76.9% relative and 16% absolute (RR 0.23, 95% CI 0.15 to 0.34, p<0.00001), and withdrawal from methotrexate for any reason by 60.8% relative and 15.2% absolute (RR 0.39, 95% CI 0.28 to 0.53, p<0.00001). Stomatitis showed a non-significant trend (RR 0.72, 95% CI 0.49 to 1.06). The review states that supplementation does not appear to have a statistically significant effect on the efficacy of methotrexate as measured by tender and swollen joint counts or physician global assessment. The label mirrors the split: section 5.10 directs supplementation for the arthritis and psoriasis indications and warns that folic acid products may decrease clinical effectiveness in neoplastic disease. The same molecule therefore has two opposite instructions about the same vitamin depending on what it is being used for, which is as clear a signal as the pharmacopoeia offers that it is doing two different things.',
        evidenceSource:
          'Shea B, Swinden MV, Tanjong Ghogomu E, et al. Folic acid and folinic acid for reducing side effects in patients receiving methotrexate for rheumatoid arthritis. Cochrane Database Syst Rev 2013;5:CD000951; methotrexate tablets label section 5.10',
        doi: '10.1002/14651858.CD000951.pub2',
        measuredMetric:
          'Gastrointestinal side effects, transaminase elevation, withdrawal for any reason, and disease activity, with and without folate supplementation',
        auditFlag: 'verified',
      },
      {
        id: 'mtx-a5',
        category: 'failed',
        title: 'People have died from taking it on the wrong schedule',
        laymanSummary:
          'Each tablet is an ordinary tablet. Taken daily instead of weekly, the same tablets kill. That sentence is in the boxed warning.',
        technicalDetails:
          'The boxed warning states: "Methotrexate tablets when inadvertently administered once daily have resulted in death." Section 5.9, Risk of Fatal Adverse Reactions with Medication Error, records that deaths occurred as a result of medication errors, most commonly in patients taking methotrexate daily when a weekly dosing regimen was prescribed. This is a design failure of the dosage form rather than of the molecule: almost every other oral drug a patient encounters is taken at least daily, so the default behaviour a prescription trains is precisely the one that is lethal here. The pharmacology behind it is polyglutamation — methotrexate is retained inside cells far longer than its plasma half-life suggests, so daily dosing accumulates intracellular drug in a way plasma monitoring would not reveal until mucositis and marrow failure appear.',
        evidenceSource:
          'Methotrexate tablets United States prescribing information, boxed warning and section 5.9',
        measuredMetric: 'Deaths reported from once-daily administration of a once-weekly regimen',
        auditFlag: 'caution',
      },
      {
        id: 'mtx-a6',
        category: 'failed',
        title: 'Liver damage that can be invisible until it is permanent',
        laymanSummary:
          'In psoriasis, the label states that scarring and cirrhosis of the liver can develop with no symptoms and with normal blood tests. Monitoring catches some of it, not all.',
        technicalDetails:
          'Section 5.5 states that methotrexate can cause severe and potentially irreversible hepatotoxicity including fibrosis, cirrhosis and fatal liver failure; that the safety of methotrexate in patients with hepatic disease is unknown; that risk increases with heavy alcohol consumption; and — the sentence that matters most — that in patients with psoriasis, fibrosis or cirrhosis may occur in the absence of symptoms or abnormal liver tests. It attaches the risk to total cumulative dose, generally after 1.5 g or more. A monitoring strategy built on liver enzymes is therefore known by the label to have a blind spot in one of the indications, which is the historical reason serial liver biopsy was once standard in dermatological practice and the reason non-invasive fibrosis assessment replaced it rather than nothing replacing it.',
        evidenceSource: 'Methotrexate tablets United States prescribing information, section 5.5',
        measuredMetric:
          'Hepatic fibrosis and cirrhosis as a function of cumulative dose, and their detectability by liver enzyme testing',
        auditFlag: 'caution',
      },
      {
        id: 'mtx-a7',
        category: 'measured',
        title: 'A drug this old carries a modern boxed warning of four separate hazards',
        laymanSummary:
          'Fetal death, anaphylaxis, dosing error and severe organ toxicity all sit in the boxed warning. This is not a mild anti-inflammatory that happens to be old.',
        technicalDetails:
          'The boxed warning covers four distinct hazards: embryo-fetal toxicity including fetal death, with the drug contraindicated in pregnancy for non-neoplastic disease; severe hypersensitivity reactions including anaphylaxis as a contraindication; death from once-daily administration of a weekly regimen; and serious adverse reactions including death affecting bone marrow, gastrointestinal tract, liver, lungs, skin and kidneys. The warnings section adds interstitial pneumonitis that can be irreversible or fatal, fatal dermatologic reactions including toxic epidermal necrolysis and Stevens-Johnson syndrome, life-threatening or fatal bacterial and fungal infection, secondary malignancies, tumour lysis syndrome, a recommendation against live vaccines, and impairment of fertility. The reason to list this in an audit rather than a safety footnote is that methotrexate is routinely described as the safe, cheap, old option relative to biologics, and the comparison that description implies is not one either label supports.',
        evidenceSource:
          'Methotrexate tablets United States prescribing information, boxed warning and sections 5.1 to 5.16',
        measuredMetric: 'Hazards carried in the boxed warning and section 5 of the current label',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A folate with two atoms changed',
        laymanDesc:
          'Methotrexate is folic acid with two small modifications. That is enough to turn the vitamin into a blocker of the enzyme that uses it.',
        molecularDetail:
          'A 4-amino group replaces the 4-oxo of folic acid and an N10 methyl is added. The result binds dihydrofolate reductase far more tightly than the natural substrate and is not turned over, converting a catalytic cycle into a stalled complex.',
        iconName: 'Copy',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It is carried into cells, not diffused',
        laymanDesc:
          'The drug cannot cross the cell membrane on its own. A transporter that normally imports folate brings it in.',
        molecularDetail:
          'Uptake is by the reduced folate carrier, with folate receptor-mediated uptake contributing in some tissues. Loss of the carrier is a resistance mechanism that leaves the enzyme target entirely intact, so an enzyme inhibition assay would report full sensitivity in a resistant cell.',
        iconName: 'LogIn',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The cell tags it so it cannot leave',
        laymanDesc:
          'Once inside, extra glutamates are attached, which traps the drug in the cell for far longer than it stays in the blood. That is why the tablet is weekly.',
        molecularDetail:
          'Folylpolyglutamate synthase adds glutamate residues, generating polyglutamates that are poor substrates for efflux and are themselves potent inhibitors of thymidylate synthase and AICAR transformylase in addition to dihydrofolate reductase. Intracellular residence far exceeds the plasma half-life, which is the pharmacological reason daily dosing accumulates to lethality.',
        iconName: 'Lock',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'Dividing cells run out of DNA parts',
        laymanDesc:
          'With the enzyme blocked, cells cannot make the building blocks for new DNA. The fastest-dividing cells feel it first — which is the point in leukaemia and the source of the side effects everywhere else.',
        molecularDetail:
          'The label states that dihydrofolates must be reduced to tetrahydrofolates before they can carry one-carbon groups in purine nucleotide and thymidylate synthesis, so methotrexate interferes with DNA synthesis, repair and cellular replication, and that actively proliferating tissues — malignant cells, bone marrow, fetal cells, buccal and intestinal mucosa, bladder epithelium — are generally more sensitive.',
        iconName: 'Dna',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'In arthritis, something else is happening',
        laymanDesc:
          'At the low weekly dose used for joints, the drug is not simply starving cells of DNA. The prescribing information says the mechanism there is unknown.',
        molecularDetail:
          'Section 12.1: "The mechanism of action in rheumatoid arthritis and in psoriasis is unknown." The leading candidate is accumulation of AICAR leading to extracellular adenosine release with anti-inflammatory signalling at adenosine receptors. The supporting observation is negative and strong: folate supplementation removes most of the toxicity without significantly reducing efficacy, which an antifolate mechanism would not predict.',
        iconName: 'HelpCircle',
        visualStage: 'target_binding',
      },
      {
        step: 6,
        title: 'Disease activity falls; the inflammation theory did not generalise',
        laymanDesc:
          'Joints improve and damage slows. When the same drug was given to prevent heart attacks on the theory that it damps inflammation generally, it lowered no inflammatory marker and prevented nothing.',
        molecularDetail:
          'CIRT, 4,786 patients: no reduction in interleukin-1β, interleukin-6 or C-reactive protein, and a primary composite hazard ratio of 0.96 (95% CI 0.79 to 1.16). CANTOS, 10,061 patients on canakinumab, which does lower interleukin-6 and C-reactive protein: hazard ratio 0.85 (0.74 to 0.98) at 150 mg. Whatever methotrexate does in a rheumatoid joint, it is not a general suppression of the interleukin-6 axis.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'CIRT (Ridker PM et al., N Engl J Med 2019;380:752-762; NCT01594333)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 4786,
        primaryEndpoint:
          'Composite of nonfatal myocardial infarction, nonfatal stroke, cardiovascular death, and (added before unblinding) hospitalisation for unstable angina leading to urgent revascularisation',
        endpointMet: false,
        statisticalPValue:
          '201 events against 207 (4.13 against 4.31 per 100 person-years); hazard ratio 0.96 (95% CI 0.79 to 1.16). Original composite hazard ratio 1.01 (95% CI 0.82 to 1.25)',
        unreportedAdverseSignals:
          'Methotrexate lowered none of interleukin-1β, interleukin-6 or C-reactive protein, so the intervention did not engage the mechanism the trial was designed around. It did cause liver-enzyme elevations, lower leucocyte counts and haematocrit, and a higher incidence of non-basal-cell skin cancers than placebo. The trial was stopped early at a median 2.3 years.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'RACAT (O’Dell JR et al., N Engl J Med 2013;369:307-318)',
        phase: 'Phase 4, randomised, double-blind, non-inferiority, 48 weeks',
        sampleSize: 353,
        primaryEndpoint:
          'Change in DAS28 at week 48 with triple conventional therapy against etanercept plus methotrexate, in patients with active disease despite methotrexate',
        endpointMet: true,
        statisticalPValue:
          '-2.1 with triple therapy against -2.3 with etanercept plus methotrexate (p=0.26); non-inferiority met, 95% upper confidence limit 0.41 against a margin of 0.6 (p=0.002)',
        unreportedAdverseSignals:
          'Twenty-seven per cent of each group required a blinded switch at 24 weeks. No significant between-group differences in radiographic progression, pain, quality of life or major adverse events.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId:
          'Shea B et al., Cochrane Database Syst Rev 2013;5:CD000951 (folate supplementation, 6 randomised trials)',
        phase:
          'Systematic review and meta-analysis of double-blind randomised placebo-controlled trials',
        sampleSize: 624,
        primaryEndpoint:
          'Mucosal, gastrointestinal, hepatic and haematologic side effects of methotrexate with folic or folinic acid supplementation, and any effect on methotrexate efficacy',
        endpointMet: true,
        statisticalPValue:
          'Gastrointestinal side effects RR 0.74 (95% CI 0.59 to 0.92, p=0.008); transaminase elevation RR 0.23 (95% CI 0.15 to 0.34, p<0.00001); withdrawal for any reason RR 0.39 (95% CI 0.28 to 0.53, p<0.00001)',
        unreportedAdverseSignals:
          'Stomatitis showed a non-significant trend (RR 0.72, 95% CI 0.49 to 1.06), and no meaningful conclusion could be drawn about haematologic side effects because of small event numbers and poor reporting.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Change in DAS28 of -2.1 with triple conventional therapy against -2.3 with etanercept plus methotrexate at 48 weeks, meeting non-inferiority in 353 patients',
        'Folate supplementation reduced transaminase elevation by 76.9% relative (RR 0.23) and withdrawal for any reason by 60.8% relative (RR 0.39) without significantly reducing efficacy',
        'No reduction in interleukin-1β, interleukin-6 or C-reactive protein, and a cardiovascular composite hazard ratio of 0.96, in 4,786 patients with coronary disease',
        'Higher incidence of non-basal-cell skin cancers, liver-enzyme elevations and lower leucocyte counts against placebo in the same trial',
      ],
      unsupportedInferences: [
        'That methotrexate treats rheumatoid arthritis by inhibiting dihydrofolate reductase — the label states the mechanism in rheumatoid arthritis and psoriasis is unknown',
        'That because it is anti-inflammatory in joints it is anti-inflammatory generally — CIRT found no movement in any measured inflammatory marker',
        'That adding a biologic to methotrexate outperforms adding two generic tablets, which the only blinded head-to-head trial did not show',
        'That an old, cheap, familiar drug is therefore a mild one; the boxed warning covers fetal death, anaphylaxis, fatal dosing error and fatal organ toxicity',
      ],
      whatFailedInitially: [
        'Low-dose methotrexate did not prevent cardiovascular events and did not lower any inflammatory marker in 4,786 patients, and the trial was stopped early',
        'Folate supplementation was expected to blunt efficacy and did not, which undermines the standard antifolate explanation for the arthritis effect',
        'Deaths have occurred from taking a weekly regimen daily, and the boxed warning now says so explicitly',
        'Hepatic fibrosis and cirrhosis can develop in psoriasis without symptoms or abnormal liver tests, so routine enzyme monitoring is known to have a blind spot',
      ],
      realWorldOutcome: [
        'In United States use since the 1950s, generic throughout, and on the WHO Model List of Essential Medicines as both an antineoplastic and an antirheumatic',
        'About sixteen United States cents per 2.5 mg tablet at pharmacy acquisition cost, against roughly US$639 per 40 mg adalimumab pen in the same survey',
        'Still the anchor drug of rheumatoid arthritis treatment, added to rather than replaced by almost every biologic that followed it',
        'Branded auto-injector presentations reintroduced the molecule at device prices, which is the usual route by which an unpatentable drug re-enters the market',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet at 2.5 mg (and higher strengths), oral solution, subcutaneous auto-injector and prefilled syringe, intramuscular and intravenous injection, and preservative-free formulation for intrathecal use — dosed once weekly for arthritis and psoriasis, and on entirely different schedules in oncology',
      description:
        'Oral absorption is saturable, so bioavailability falls as the weekly dose rises, which is the practical reason subcutaneous presentations exist. Inside cells the drug is polyglutamated and retained far longer than its plasma half-life implies, which is why weekly dosing works and why daily dosing accumulates. Elimination is predominantly renal, so declining kidney function raises exposure. Products for intrathecal administration must be preservative-free.',
      safetyProfile:
        'Boxed warning for embryo-fetal toxicity including fetal death, with contraindication in pregnancy for non-neoplastic disease; for severe hypersensitivity including anaphylaxis; for death following once-daily administration of a once-weekly regimen; and for serious adverse reactions including death affecting bone marrow, gastrointestinal tract, liver, lungs, skin and kidneys. Section 5 additionally warns of severe and potentially irreversible hepatotoxicity including fibrosis, cirrhosis and fatal liver failure — which in psoriasis may occur without symptoms or abnormal liver tests, generally after a cumulative dose of 1.5 g or more; of acute or chronic interstitial pneumonitis with irreversible or fatal cases; of fatal dermatologic reactions including toxic epidermal necrolysis and Stevens-Johnson syndrome; of life-threatening or fatal bacterial and fungal infection; of secondary malignancies; of tumour lysis syndrome; and of impaired fertility. Live vaccines are not recommended. Folate supplementation is directed for the arthritis and psoriasis indications and warned against in neoplastic disease.',
    },
    commonQuestions: [
      {
        q: 'Is it a chemotherapy drug?',
        a: 'It is the same molecule, at roughly a hundredth of the dose and on a completely different schedule, and the label treats the two uses as separate drugs. In leukaemia it is used for its antifolate effect on dividing cells. In rheumatoid arthritis the label states the mechanism is unknown, and the clearest evidence for that is in the regimen itself: for arthritis and psoriasis the label directs taking folic acid alongside, and for cancer it warns that folic acid may reduce effectiveness. The same vitamin, two opposite instructions, because the drug is doing two different things.',
        auditNote:
          'Being described as chemotherapy makes the drug sound more dangerous than it is at arthritis doses and less dangerous than it is in absolute terms; the boxed warning covers four separate fatal hazards at any dose.',
      },
      {
        q: 'Why once a week? What happens if I take it daily?',
        a: 'People have died. The boxed warning states it directly: "Methotrexate tablets when inadvertently administered once daily have resulted in death", and section 5.9 records that these errors most commonly occurred in patients taking it daily when a weekly regimen had been prescribed. The pharmacological reason is that once the drug is inside a cell it is tagged with extra glutamate residues that stop it leaving, so it persists in tissue long after it has cleared the blood. Daily dosing stacks that intracellular reservoir until the bone marrow and the gut lining fail. This is the most important single fact about taking methotrexate.',
      },
      {
        q: 'Do I really need the folic acid?',
        a: 'For arthritis and psoriasis, the label directs it and the pooled trial evidence is unusually clean. Six randomised placebo-controlled trials in 624 patients found supplementation cut gastrointestinal side effects by about a quarter, cut abnormal liver enzyme elevations by roughly three-quarters, and cut people stopping the drug for any reason by about 60% — with no statistically significant loss of effect on joint counts or physician assessment. The interesting part is that last clause. If the drug worked in arthritis by depleting folate, replacing the folate should have undone it. It did not, which is one of the reasons the label says the mechanism in arthritis is unknown.',
      },
      {
        q: 'Should I be on a biologic instead?',
        a: 'The only blinded head-to-head trial of that question found the cheap answer worked as well. RACAT randomised 353 people whose arthritis was still active on methotrexate to either two more generic tablets — sulfasalazine and hydroxychloroquine — or to methotrexate plus etanercept. At 48 weeks the disease activity change was -2.1 against -2.3, non-inferior, with no significant difference in joint damage on X-ray, pain, quality of life or major adverse events. That is one trial, in one population, and it does not mean biologics are useless; people who fail triple therapy do respond to them. It does mean the step to a biologic is a clinical decision rather than an automatic one.',
      },
      {
        q: 'It is anti-inflammatory. Will it help my heart?',
        a: 'It was tested, and it did not. Inflammation is causally involved in atherosclerosis, and a monoclonal antibody against interleukin-1β had already been shown to reduce cardiovascular events in 10,061 patients. So methotrexate was given to 4,786 people with previous heart attacks or multivessel disease. The result was flat — 201 events against 207, hazard ratio 0.96 — and the reason is visible in the trial itself: methotrexate did not lower interleukin-1β, interleukin-6 or C-reactive protein at all. It did cause more liver-enzyme abnormalities and more non-basal-cell skin cancers than placebo. Whatever it does in an inflamed joint is not general anti-inflammatory action, and this is one of the few trials that has been able to say so with a straight comparison in hand.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Methotrexate tablets United States prescribing information — boxed warning, Indications 1.1 to 1.4, Warnings and Precautions 5.1 to 5.16, Mechanism of Action 12.1',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=methotrexate+tablets',
        kind: 'regulatory',
      },
      {
        label:
          'Ridker PM, Everett BM, Pradhan A, et al. Low-dose methotrexate for the prevention of atherosclerotic events. N Engl J Med 2019;380:752-762',
        identifier: '10.1056/NEJMoa1809798',
        kind: 'doi',
      },
      {
        label: 'CIRT — Cardiovascular Inflammation Reduction Trial',
        identifier: 'NCT01594333',
        kind: 'nct',
      },
      {
        label:
          'Ridker PM, Everett BM, Thuren T, et al. Antiinflammatory therapy with canakinumab for atherosclerotic disease. N Engl J Med 2017;377:1119-1131 (CANTOS)',
        identifier: '10.1056/NEJMoa1707914',
        kind: 'doi',
      },
      {
        label:
          'O’Dell JR, Mikuls TR, Taylor TH, et al. Therapies for active rheumatoid arthritis after methotrexate failure. N Engl J Med 2013;369:307-318',
        identifier: '10.1056/NEJMoa1303006',
        kind: 'doi',
      },
      {
        label:
          'Shea B, Swinden MV, Tanjong Ghogomu E, et al. Folic acid and folinic acid for reducing side effects in patients receiving methotrexate for rheumatoid arthritis. Cochrane Database Syst Rev 2013;5:CD000951',
        identifier: '10.1002/14651858.CD000951.pub2',
        kind: 'doi',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — methotrexate 2.5 mg tablets (18 listed generic products), sulfasalazine, hydroxychloroquine, leflunomide, folic acid and adalimumab biosimilars, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 126941 — methotrexate structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/126941',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 5. Hydroxychloroquine — a drug with a real lupus trial behind it, whose two most famous
  //    stories are both reversals: a retinopathy risk ten times higher than taught, and a
  //    pandemic in which it was the most talked-about medicine on earth and did nothing.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'hydroxychloroquine',
    name: 'Hydroxychloroquine',
    tradeName: 'Plaquenil / Sovuna',
    sponsor:
      'Advanz Pharma (current holder of the Plaquenil registration); originated at Sterling-Winthrop and approved in the United States in 1955; generic and made by many manufacturers',
    targetGene:
      'No single human gene target is established; the antimalarial action is on the parasite’s haem detoxification, not on a host gene product',
    targetProtein:
      'Haem polymerisation in the Plasmodium digestive vacuole for the malaria indication; for rheumatoid arthritis and lupus the label states the mechanisms are not fully known, with endosomal Toll-like receptor signalling the leading candidate',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1955,
    indication:
      'Treatment of uncomplicated malaria due to Plasmodium falciparum, malariae, ovale and vivax, and prophylaxis of malaria in areas where chloroquine resistance is not reported; treatment of acute and chronic rheumatoid arthritis in adults; treatment of systemic lupus erythematosus in adults; and treatment of chronic discoid lupus erythematosus in adults',
    patientFriendlyIndication:
      'Lupus, rheumatoid arthritis, and malaria where the parasite is still susceptible',
    anatomicalSite:
      'Acidic intracellular compartments — the parasite’s digestive vacuole in malaria, and the endosome of immune cells in the autoimmune indications',
    conditionContext: {
      conditionExplainer:
        'Systemic lupus erythematosus is an immune system that has begun reacting to the body’s own nucleic acids. Because those are everywhere, the disease can appear anywhere: skin, joints, kidneys, blood, brain. It runs in flares, and each flare that reaches an organ can leave damage behind.',
      whyItMatters:
        'Hydroxychloroquine is the one drug almost every person with lupus stays on indefinitely, and the trial that established that is a withdrawal trial: people who stopped it flared two and a half times as often as people who continued. It is also the drug whose long-term eye risk was found in 2014 to be roughly ten times what the field had believed for forty years, and the drug that became, briefly, the most argued-about medicine on the planet.',
      whoTakesThis:
        'Adults with systemic or discoid lupus, adults with rheumatoid arthritis, and travellers or residents in malarious areas where chloroquine resistance has not been reported. It is avoided in psoriasis, in porphyria, and in anyone with QT prolongation or the risk factors for it.',
      clinicalGoals:
        'Preventing flares rather than treating them. That is what its randomised evidence measures, and it is a different endpoint from the symptom relief most drugs are judged on.',
    },
    oneSentenceVerdict:
      'A 4-aminoquinoline whose mechanism in lupus its own label says is not fully known, which in a 47-patient double-blind withdrawal trial produced a 2.5-fold higher relative risk of flare in those switched to placebo (95% CI 1.08 to 5.58) — and whose long-term retinal toxicity was reassessed in 2,361 patients at 7.5% overall, rising towards 20% after twenty years, about ten times the risk the field had assumed.',
    laymanHowItWorks:
      'Hydroxychloroquine is a weak base, which means it drifts into any acidic pocket inside a cell and gets stuck there, raising the pH of that pocket. In the malaria parasite, the acidic pocket is the stomach where it digests haemoglobin, and raising the pH poisons it with its own waste. In an immune cell, the acidic pocket is the endosome, where the sensors that detect foreign DNA and RNA live — and in lupus, those sensors are being triggered by the body’s own DNA. Raising the endosome pH is thought to turn the volume down on that false alarm. The prescribing information does not commit to this: it says the mechanisms in rheumatoid arthritis and lupus are not fully known.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 70,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1485 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 32 listed generic products at 100, 200, 300 and 400 mg, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States in 1955 and generic for decades. It is on the WHO Model List of Essential Medicines. In the spring of 2020 it was the subject of a United States emergency use authorisation for COVID-19, which the FDA revoked on 15 June 2020 after the randomised evidence arrived; shortages during that period affected people taking it for lupus, which is the clearest recent example of a supply consequence of an evidence failure.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'In lupus there is no substitute in the ordinary sense — hydroxychloroquine is background therapy that other drugs are added to, not chosen instead of. The genuine comparison is with chloroquine, which is the same pharmacology with a worse therapeutic index, and with the immunosuppressants and biologics that treat flares this drug is meant to prevent.',
      conventionalRx: [
        {
          name: 'Chloroquine',
          class: '4-aminoquinoline, the parent compound',
          howItCompares:
            'The molecule hydroxychloroquine was derived from, differing by one hydroxyl group. That change reduced toxicity enough that hydroxychloroquine displaced it for long-term autoimmune use. The American Academy of Ophthalmology 2016 recommendations note there are no demographic data for chloroquine equivalent to those for hydroxychloroquine, and suggest a maximum of 2.3 mg/kg real weight against 5.0 mg/kg for hydroxychloroquine — less than half the dose per kilogram.',
          typicalCost:
            'US$6.7412 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 6 listed products, survey effective 19 August 2026) — about forty-five times the price of hydroxychloroquine',
          prosAndCons:
            'Pros: still useful where hydroxychloroquine is unavailable. Cons: narrower margin between effective and retinotoxic dose; markedly more expensive in the United States; the same QT and cardiomyopathy concerns.',
        },
        {
          name: 'Methotrexate, azathioprine or mycophenolate',
          class: 'Conventional immunosuppressants',
          howItCompares:
            'These treat active disease and organ involvement; hydroxychloroquine prevents flares in stable disease. In rheumatoid arthritis specifically, hydroxychloroquine is one of the three drugs in the triple therapy that was non-inferior to a biologic in the RACAT trial, where it functions as an addition to methotrexate rather than an alternative.',
          typicalCost:
            'Methotrexate US$0.1566 per 2.5 mg tablet at United States pharmacy acquisition cost (CMS NADAC, median across 18 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: act on active disease, which hydroxychloroquine alone often cannot control. Cons: substantially greater immunosuppression, infection risk and organ toxicity; methotrexate is contraindicated in pregnancy while hydroxychloroquine is generally continued through it.',
        },
        {
          name: 'Sun protection',
          class: 'Non-pharmacological, for the cutaneous manifestations',
          howItCompares:
            'Ultraviolet light is a documented trigger of cutaneous and systemic lupus flares. Avoiding it is not a substitute for the drug and is the one intervention with no adverse effect profile at all to weigh against it.',
          typicalCost: 'The cost of sunscreen and clothing',
          prosAndCons:
            'Pros: no toxicity, no monitoring, additive to anything else. Cons: does nothing for the systemic disease; adherence over years is the same problem as with any preventive measure.',
        },
      ],
      naturalFoods: [
        {
          name: 'Vitamin D',
          activeCompound: 'Cholecalciferol and its metabolite 25-hydroxyvitamin D',
          biologicalMechanism:
            'Vitamin D deficiency is common in lupus, partly because sun avoidance is part of the management, and low levels correlate with disease activity in cohort studies. Whether correcting the deficiency alters the disease is a separate question from whether the correlation exists.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'Not stated here as advice. For scale only: the randomised evidence for supplementation improving lupus disease activity is limited and inconsistent, and the association between low vitamin D and active disease is confounded by the sun avoidance that the disease itself requires. It is included here because the deficiency is real and iatrogenic in part, not because it substitutes for treatment.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Keep the annual eye appointment',
          action:
            'Have the baseline eye examination in the first year and the annual screening on the schedule your ophthalmologist sets.',
          patientImpact:
            'Section 5.2 states that irreversible retinal damage has been observed and is related to cumulative dose and duration; that risk factors include a daily dose at or above 5 mg/kg of actual body weight, use beyond five years, renal impairment, concomitant tamoxifen and concurrent macular disease; and that in patients of Asian descent toxicity may first appear outside the macula, so visual field testing should cover the central 24 degrees rather than 10.',
          clinicalPrecaution:
            'The label states that if ocular toxicity is suspected the drug should be stopped and the patient monitored closely, because retinal changes and visual disturbance may progress even after cessation. Screening exists to catch damage before it reaches the centre of vision, not to reverse it.',
        },
        {
          name: 'Say if you take anything else that affects heart rhythm',
          action:
            'List every medicine, including antibiotics and antidepressants, before starting or when anything is added.',
          patientImpact:
            'Section 5.1 states the drug has a potential to prolong the QT interval, that ventricular arrhythmias including torsades de pointes have been reported, that the magnitude of prolongation may increase with drug concentration, and that it is not recommended in patients taking other QT-prolonging drugs.',
          clinicalPrecaution:
            'The label directs avoiding it in congenital or acquired QT prolongation, in heart failure or recent infarction, in bradycardia below 50 beats per minute, in a history of ventricular dysrhythmias, and in uncorrected low potassium or magnesium — and directs correcting electrolytes before use.',
        },
        {
          name: 'Do not start it if you have psoriasis',
          action: 'Mention any psoriasis diagnosis, however mild, before the first dose.',
          patientImpact:
            'Section 5.4 directs avoiding hydroxychloroquine in patients with psoriasis because it can precipitate a severe attack.',
          clinicalPrecaution:
            'Section 5.5 separately directs avoiding it in porphyria, where hepatotoxicity has been reported in porphyria cutanea tarda. Both are absolute-sounding avoidances in a drug otherwise regarded as gentle.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CCN(CCCC(C)NC1=C2C=CC(=CC2=NC=C1)Cl)CCO',
      chemicalFormula: 'C18H26ClN3O',
      molecularWeight:
        '335.90 g/mol (free base); dispensed as the sulfate at 433.95 g/mol, so a 200 mg sulfate tablet delivers 155 mg of hydroxychloroquine',
      targetReceptorAffinity:
        'A 4-aminoquinoline, chemically 2-[[4-[(7-chloro-4-quinolyl)amino]pentyl]ethylamino]ethanol, differing from chloroquine by a single hydroxyl on the terminal ethyl group. It is a lipophilic weak base and concentrates in acidic compartments by protonation trapping, which is the physical basis of both the antimalarial and the immunomodulatory effects. Mean absolute oral bioavailability is 79% (SD 12%) fasting; whole blood Cmax after a single 200 mg sulfate tablet is 129.6 ng/mL against a plasma Cmax of 50.3 ng/mL, a roughly 2.6-fold blood-to-plasma ratio that makes whole blood the correct matrix for any concentration measurement. Kinetics are linear across the therapeutic range. The label states that the mechanisms underlying the anti-inflammatory and immunomodulatory effects in rheumatoid arthritis and lupus are not fully known.',
      structureSource: {
        label:
          'PubChem CID 3652 (hydroxychloroquine) — canonical SMILES, molecular formula and weight, as carried on the enriched record; salt weight, chemical name, bioavailability and blood-to-plasma ratio from the hydroxychloroquine sulfate tablets label, sections 11 and 12.3',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3652',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'hcq-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the hydroxyl that separates it from chloroquine',
          description:
            'Hydroxychloroquine and chloroquine differ by one oxygen atom. That atom is the entire reason one is given for twenty years and the other is not, because the recommended safe daily dose differs by more than twofold per kilogram. Any identity test that cannot distinguish the two is not testing the thing that matters, and desethyl metabolites of both are structurally close enough to complicate the assay.',
          reagentsAndBuffer:
            'Hydroxychloroquine sulfate reference standard, chloroquine phosphate as a resolution standard, reverse-phase HPLC with UV detection at 343 nm, 1H NMR for the hydroxyethyl side chain, sulfate content by ion chromatography',
        },
        {
          id: 'hcq-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Couple 4,7-dichloroquinoline to the hydroxylated side chain',
          description:
            'The synthesis is a nucleophilic aromatic substitution: 4,7-dichloroquinoline is displaced at the 4-position by the primary amine of a 5-(N-ethyl-N-2-hydroxyethylamino)-2-pentylamine side chain. The 7-chlorine must survive, since it is required for antimalarial activity, so the regioselectivity of the displacement is the control point.',
          dependsOnStepId: 'hcq-w1',
          reagentsAndBuffer:
            '4,7-dichloroquinoline, 5-(N-ethyl-N-2-hydroxyethylamino)-2-pentylamine, phenol or high-boiling polar solvent, elevated temperature, subsequent sulfate salt formation in ethanol',
        },
        {
          id: 'hcq-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Form the sulfate and fix the salt stoichiometry',
          description:
            'The marketed product is the 1:1 sulfate, and a 200 mg tablet of the salt delivers 155 mg of base. A stoichiometry error is a dosing error that no clinical observation would catch quickly, in a drug where the difference between a safe and a retinotoxic milligram-per-kilogram is the whole safety argument.',
          dependsOnStepId: 'hcq-w2',
          reagentsAndBuffer:
            'Sulfuric acid in ethanol with controlled addition, recrystallisation to the USP white crystalline powder, assay of base content against salt content, water solubility and dissolution testing',
        },
        {
          id: 'hcq-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Measure lysosomal trapping, not just cellular uptake',
          description:
            'The drug does not bind a receptor; it accumulates in acidic compartments because it becomes protonated there and can no longer diffuse out. The mechanism-specific measurement is therefore the pH gradient it creates, not the concentration it reaches. A cell whose lysosomes have been pre-alkalinised should take up far less drug, and that experiment distinguishes trapping from any binding interaction.',
          dependsOnStepId: 'hcq-w3',
          reagentsAndBuffer:
            'Human peripheral blood mononuclear cells or macrophage lines, LysoTracker or ratiometric lysosomal pH probes, bafilomycin A1 as a v-ATPase inhibitor to collapse the gradient, LC-MS/MS quantification of intracellular drug in whole-cell and lysosomal fractions',
        },
        {
          id: 'hcq-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Test the endosomal Toll-like receptor hypothesis directly',
          description:
            'The candidate mechanism in lupus is suppression of nucleic-acid sensing by endosomal Toll-like receptors 7 and 9. It makes a testable prediction the label does not endorse: the drug should suppress interferon output driven by TLR7 and TLR9 ligands and leave signalling through surface receptors such as TLR4 intact. A compound that suppresses both is a general immunosuppressant and would carry a different risk profile entirely.',
          dependsOnStepId: 'hcq-w4',
          reagentsAndBuffer:
            'Primary human plasmacytoid dendritic cells, CpG oligonucleotide for TLR9 and imiquimod or single-stranded RNA for TLR7, lipopolysaccharide as the surface-receptor control, interferon-alpha and interleukin-6 by immunoassay, whole-blood drug concentration matched to clinical steady state',
        },
      ],
    },
    keyAudits: [
      {
        id: 'hcq-a1',
        category: 'measured',
        title: 'Stopping it doubled the flare rate',
        laymanSummary:
          'The trial that established hydroxychloroquine in lupus did not start it — it stopped it. Forty-seven people with stable lupus either continued or were switched to placebo. Sixteen of twenty-two on placebo flared, against nine of twenty-five who continued.',
        technicalDetails:
          'A six-month randomised double-blind placebo-controlled withdrawal study in 47 patients with clinically stable systemic lupus erythematosus assigned 25 to continue their existing hydroxychloroquine dose and 22 to placebo for 24 weeks; ten in each group were also on prednisone. The relative risk of clinical flare was 2.5 times higher on placebo (95% CI 1.08 to 5.58) — 16 of 22 against 9 of 25 — and time to flare was shorter (p=0.02). The relative risk of a severe exacerbation requiring withdrawal from the study was 6.1 times higher on placebo, but with a confidence interval spanning 0.72 to 52.44, which is not a significant finding and is frequently quoted as if it were. Prednisone dose changes did not differ between groups. A withdrawal design answers a narrower question than a start-from-scratch trial: it establishes that continuing the drug in already-stable disease prevents flares, and says nothing about what happens if you start it in active disease.',
        evidenceSource:
          'The Canadian Hydroxychloroquine Study Group. A randomized study of the effect of withdrawing hydroxychloroquine sulfate in systemic lupus erythematosus. N Engl J Med 1991;324:150-154',
        doi: '10.1056/NEJM199101173240303',
        measuredMetric:
          'Relative risk of clinical flare and time to flare over 24 weeks after randomised withdrawal',
        auditFlag: 'verified',
      },
      {
        id: 'hcq-a2',
        category: 'conclusion_shift',
        title: 'The eye risk turned out to be about ten times what was taught',
        laymanSummary:
          'For decades, hydroxychloroquine retinopathy was described as rare — well under one per cent. A 2,361-patient study using modern imaging found 7.5% overall, and close to 20% after twenty years of use. The dosing rule changed as a result.',
        technicalDetails:
          'A retrospective case-control study within an integrated health organisation of about 3.4 million members examined 2,361 patients who had taken hydroxychloroquine continuously for at least five years and had visual field testing or spectral-domain optical coherence tomography. Overall prevalence of retinopathy was 7.5%, varying with daily consumption (odds ratio 5.67, 95% CI 4.14 to 7.79 above 5.0 mg/kg) and duration (odds ratio 3.22, 95% CI 2.20 to 4.70 beyond 10 years). At 4.0 to 5.0 mg/kg daily, prevalence stayed under 2% in the first ten years and rose to almost 20% after twenty. Kidney disease (OR 2.08) and concurrent tamoxifen (OR 4.59, 95% CI 2.05 to 10.27) were independent risk factors. Two things changed because of this. First, the dosing basis: real body weight predicted risk better than ideal body weight, and the American Academy of Ophthalmology 2016 revision recommends a maximum of 5.0 mg/kg real weight where the previous rule used ideal weight, a change that lowers the permitted dose for most patients. Second, the screening: automated visual fields plus spectral-domain OCT annually after five years, extended to the central 24 degrees in patients of Asian descent because the damage pattern is often extramacular. The old prevalence figure was not wrong about what it measured — it measured bull’s-eye maculopathy, which is late. Better instruments found the disease earlier and the number changed by an order of magnitude.',
        evidenceSource:
          'Melles RB, Marmor MF. The risk of toxic retinopathy in patients on long-term hydroxychloroquine therapy. JAMA Ophthalmol 2014;132:1453-1460; Marmor MF, Kellner U, Lai TYY, Melles RB, Mieler WF. Recommendations on screening for chloroquine and hydroxychloroquine retinopathy (2016 revision). Ophthalmology 2016;123:1386-1394',
        doi: '10.1001/jamaophthalmol.2014.3459',
        measuredMetric:
          'Prevalence of retinal toxicity by daily dose per kilogram of real body weight and by duration of use',
        auditFlag: 'verified',
      },
      {
        id: 'hcq-a3',
        category: 'failed',
        title: 'RECOVERY: no mortality benefit in COVID-19, and worse on every secondary measure',
        laymanSummary:
          'In the largest randomised trial of the question, 1,561 hospitalised patients received hydroxychloroquine and 3,155 received usual care. Deaths at 28 days were 27.0% against 25.0%. Fewer were discharged alive, and more went on to ventilation or death.',
        technicalDetails:
          'The RECOVERY platform trial randomly assigned 1,561 patients hospitalised with COVID-19 to hydroxychloroquine and 3,155 to usual care. Enrolment into the hydroxychloroquine arm was closed on 5 June 2020 after an interim analysis found lack of efficacy. Death within 28 days occurred in 421 (27.0%) against 790 (25.0%), rate ratio 1.09 (95% CI 0.97 to 1.23, p=0.15), with consistent results in every prespecified subgroup. Patients on hydroxychloroquine were less likely to be discharged alive within 28 days (59.6% against 62.9%; rate ratio 0.90, 95% CI 0.83 to 0.98), and among those not ventilated at baseline, more progressed to invasive mechanical ventilation or death (30.7% against 26.9%; risk ratio 1.14, 95% CI 1.03 to 1.27). There was a small numerical excess of cardiac deaths of 0.4 percentage points and no difference in new major cardiac arrhythmia. The point estimates on mortality and on progression both favour usual care; only the secondary ones reach significance. The FDA revoked the emergency use authorisation on 15 June 2020, ten days after the arm closed.',
        evidenceSource:
          'RECOVERY Collaborative Group (Horby P, Mafham M, Linsell L, et al.). Effect of hydroxychloroquine in hospitalized patients with Covid-19. N Engl J Med 2020;383:2030-2040; ISRCTN50189673',
        doi: '10.1056/NEJMoa2022926',
        measuredMetric: '28-day all-cause mortality in hospitalised COVID-19',
        auditFlag: 'verified',
      },
      {
        id: 'hcq-a4',
        category: 'failed',
        title: 'And it did not work as prophylaxis after exposure either',
        laymanSummary:
          'The other version of the question — take it right after being exposed, before symptoms — was tested in 821 people and was also negative, with two and a half times as many side effects.',
        technicalDetails:
          'A randomised double-blind placebo-controlled trial across the United States and parts of Canada enrolled 821 asymptomatic adults within four days of a household or occupational exposure to a confirmed case at under six feet for more than ten minutes; 87.6% had high-risk exposures. New illness compatible with COVID-19 within 14 days occurred in 49 of 414 (11.8%) on hydroxychloroquine against 58 of 407 (14.3%) on placebo, an absolute difference of -2.4 percentage points (95% CI -7.0 to 2.2, p=0.35). Side effects were more common on hydroxychloroquine (40.1% against 16.8%) with no serious adverse reactions reported. Taken with RECOVERY, the two trials cover both ends of the disease course — before infection is established and after hospitalisation — and neither found benefit.',
        evidenceSource:
          'Boulware DR, Pullen MF, Bangdiwala AS, et al. A randomized trial of hydroxychloroquine as postexposure prophylaxis for Covid-19. N Engl J Med 2020;383:517-525',
        doi: '10.1056/NEJMoa2016638',
        measuredMetric:
          'Laboratory-confirmed COVID-19 or compatible illness within 14 days of a documented exposure',
        auditFlag: 'verified',
      },
      {
        id: 'hcq-a5',
        category: 'inferred',
        title: 'The label does not claim to know how it works in lupus',
        laymanSummary:
          'Every explanation you will read of hydroxychloroquine in lupus — endosomes, Toll-like receptors, interferon — is a hypothesis. The prescribing information states the mechanisms are not fully known.',
        technicalDetails:
          'Section 12.1 handles the two indications separately. For malaria it states that hydroxychloroquine is a 4-aminoquinoline antimalarial. For rheumatoid arthritis, chronic discoid lupus and systemic lupus it states: "The mechanisms underlying the anti-inflammatory and immunomodulatory effects of hydroxychloroquine sulfate tablets in the treatment of rheumatoid arthritis, chronic discoid lupus erythematosus and systemic lupus erythematosus are not fully known." The endosomal Toll-like receptor account is coherent, has laboratory support and explains why a drug that raises the pH of acidic compartments would blunt sensing of self nucleic acids. It also has a specific consequence that has not been demonstrated in patients: if that were the whole mechanism, the drug should be inert against inflammation driven through surface receptors, and its clinical profile does not obviously divide that way. This matters practically because the same uncertainty is what allowed the 2020 argument that a lysosomotropic drug would work against a respiratory virus — the mechanism was flexible enough to justify almost anything.',
        evidenceSource:
          'Hydroxychloroquine sulfate tablets United States prescribing information, section 12.1',
        inferredClaim:
          'That hydroxychloroquine controls lupus by alkalinising endosomes and suppressing Toll-like receptor 7 and 9 signalling — a well-supported hypothesis the label declines to state as the mechanism',
        auditFlag: 'contested',
      },
      {
        id: 'hcq-a6',
        category: 'failed',
        title: 'Fatal cardiomyopathy, and it is not the QT interval',
        laymanSummary:
          'Two separate heart problems are in the label. One is a rhythm risk everyone talks about. The other is a slow accumulation of fatty material in heart muscle, found on biopsy, that can be fatal and is not detected by an ECG.',
        technicalDetails:
          'Section 5.1 reports fatal and life-threatening cardiotoxicity including cardiomyopathy, with signs of cardiac compromise during both acute and chronic treatment. In multiple cases, endomyocardial biopsy showed the cardiomyopathy associated with phospholipidosis in the absence of inflammation, infiltration or necrosis — the drug’s accumulation in lysosomes disrupting phospholipid handling, which is the same lysosomotropic property that is proposed to explain its benefit. Presentations include ventricular hypertrophy, pulmonary hypertension and conduction disorders including sick sinus syndrome, with atrioventricular or bundle branch block on ECG. Separately, the label records QT prolongation whose magnitude may increase with drug concentration, and ventricular arrhythmias including torsades de pointes. Sections 5.8 and 5.11 extend the phospholipidosis concern to other organs, and direct considering it as a cause of renal injury in connective tissue disease and discontinuing if it is demonstrated on biopsy in any organ system. The mechanism that makes the drug useful and the mechanism that makes it toxic are, on the label’s own account, the same physical process in different tissues.',
        evidenceSource:
          'Hydroxychloroquine sulfate tablets United States prescribing information, sections 5.1, 5.8 and 5.11',
        measuredMetric:
          'Biopsy-confirmed phospholipidosis-associated cardiomyopathy, conduction disorders and QT prolongation',
        auditFlag: 'caution',
      },
      {
        id: 'hcq-a7',
        category: 'inferred',
        title: 'Its malaria indication is limited by resistance the label spells out',
        laymanSummary:
          'It is still called an antimalarial, and its label rules out most of the situations a traveller would face: it is not for complicated malaria, not where chloroquine resistance occurs, and not for preventing relapse.',
        technicalDetails:
          'The Limitations of Use under section 1.1 state that hydroxychloroquine is not recommended for treatment of complicated malaria; for treatment of chloroquine- or hydroxychloroquine-resistant Plasmodium; for malaria acquired in geographic areas where chloroquine resistance occurs, or where the species has not been identified; for prophylaxis in areas where chloroquine resistance occurs; or for prevention of relapse of P. vivax or P. ovale, because it is not active against the hypnozoite liver stage — radical cure requires concomitant 8-aminoquinoline therapy. Chloroquine resistance in P. falciparum is now near-universal across sub-Saharan Africa, South and Southeast Asia and the Amazon basin, which leaves the licensed prophylaxis indication applicable to a small and shrinking fraction of the malarious world. The label directs the reader to current CDC recommendations for resistance information rather than stating a geography, which is the correct handling of a fact that changes faster than a label can.',
        evidenceSource:
          'Hydroxychloroquine sulfate tablets United States prescribing information, section 1.1 Limitations of Use',
        inferredClaim:
          'That a drug licensed for malaria treatment and prophylaxis is a usable option for travel to a malarious area — an inference its own Limitations of Use largely close off',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Well absorbed, and it hides in blood cells',
        laymanDesc:
          'About four-fifths of the tablet gets in. Once there, the drug concentrates inside blood cells, so a blood-cell measurement reads more than twice a plasma one.',
        molecularDetail:
          'Mean absolute oral bioavailability is 79% (SD 12%) fasting. After a single 200 mg sulfate tablet, whole blood Cmax is 129.6 ng/mL against a plasma Cmax of 50.3 ng/mL, with Tmax at 3.3 and 3.7 hours respectively. Kinetics are linear across the therapeutic range. Whole blood, not plasma, is the correct matrix for therapeutic monitoring.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It is a weak base, so acid traps it',
        laymanDesc:
          'The molecule drifts freely through membranes until it meets an acidic pocket, where it picks up a proton, becomes charged, and can no longer get out.',
        molecularDetail:
          'Lysosomotropic accumulation: the neutral species diffuses across the membrane, is protonated at the low pH inside lysosomes and endosomes, and the charged form cannot cross back. Intracellular concentrations reach orders of magnitude above plasma, which is why the drug has an elimination half-life measured in weeks and takes months to reach steady state.',
        iconName: 'Droplet',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The trapped drug raises the pH of that pocket',
        laymanDesc:
          'Accumulating base neutralises the acid. Whatever depends on that compartment being acidic stops working properly.',
        molecularDetail:
          'In Plasmodium the affected compartment is the digestive vacuole, where haemoglobin is broken down and the toxic free haem is polymerised into inert haemozoin; raising the pH blocks polymerisation and the parasite is poisoned by its own digestion product. In human immune cells the affected compartment is the endosome.',
        iconName: 'Beaker',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'In lupus, the proposed effect is on self-DNA sensing',
        laymanDesc:
          'The sensors that detect foreign DNA and RNA sit inside those same acidic pockets. In lupus they are being set off by the body’s own DNA. Raising the pH is thought to quiet them.',
        molecularDetail:
          'Toll-like receptors 7 and 9 signal from the endosome and require acidification for ligand binding and proteolytic maturation. Suppressing that pathway would reduce type I interferon output from plasmacytoid dendritic cells, which is the central pathway of lupus. Section 12.1 declines to state this, saying only that the immunomodulatory mechanisms are not fully known.',
        iconName: 'ShieldOff',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Flares become less frequent',
        laymanDesc:
          'The measured benefit is prevention. In the withdrawal trial, people who stopped it flared two and a half times as often as people who stayed on it.',
        molecularDetail:
          'Relative risk of clinical flare 2.5 (95% CI 1.08 to 5.58) on placebo against continued therapy over 24 weeks in 47 patients with stable disease, with shorter time to flare (p=0.02). The severe-exacerbation relative risk of 6.1 had a confidence interval of 0.72 to 52.44 and is not a significant result.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'The same trapping damages the retina and the heart',
        laymanDesc:
          'The drug also accumulates in the retina and in heart muscle, and over years it can cause damage that does not reverse when the drug stops.',
        molecularDetail:
          'Retinal toxicity is dose- and duration-dependent: prevalence 7.5% overall after five years of use, rising towards 20% after twenty years at 4.0 to 5.0 mg/kg. The label states retinal changes and visual disturbance may progress even after cessation. In heart muscle, endomyocardial biopsy in reported cardiomyopathy cases showed phospholipidosis without inflammation or necrosis — the same lysosomal accumulation, in a different tissue.',
        iconName: 'Eye',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'Canadian Hydroxychloroquine Study Group withdrawal trial (N Engl J Med 1991;324:150-154)',
        phase: 'Randomised, double-blind, placebo-controlled withdrawal study, 24 weeks',
        sampleSize: 47,
        primaryEndpoint:
          'Clinical flare of systemic lupus erythematosus after randomised withdrawal of hydroxychloroquine in clinically stable patients',
        endpointMet: true,
        statisticalPValue:
          'Relative risk of flare 2.5 (95% CI 1.08 to 5.58) on placebo — 16 of 22 against 9 of 25 — with shorter time to flare (p=0.02)',
        unreportedAdverseSignals:
          'The severe-exacerbation relative risk of 6.1 had a 95% confidence interval of 0.72 to 52.44 and is not statistically significant, though it is frequently cited as though it were. The trial had 47 patients and ran for six months; it establishes that continuing the drug prevents flares in stable disease, not that starting it controls active disease.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId:
          'RECOVERY hydroxychloroquine arm (N Engl J Med 2020;383:2030-2040; ISRCTN50189673)',
        phase: 'Randomised, controlled, open-label platform trial',
        sampleSize: 4716,
        primaryEndpoint: '28-day all-cause mortality in patients hospitalised with COVID-19',
        endpointMet: false,
        statisticalPValue:
          '421 of 1,561 (27.0%) against 790 of 3,155 (25.0%); rate ratio 1.09 (95% CI 0.97 to 1.23), p=0.15',
        unreportedAdverseSignals:
          'Discharge alive within 28 days was lower on hydroxychloroquine (59.6% against 62.9%; rate ratio 0.90, 95% CI 0.83 to 0.98), and among patients not ventilated at baseline, progression to invasive mechanical ventilation or death was higher (30.7% against 26.9%; risk ratio 1.14, 95% CI 1.03 to 1.27). The arm was closed early for lack of efficacy.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Boulware DR et al., N Engl J Med 2020;383:517-525 (post-exposure prophylaxis)',
        phase: 'Randomised, double-blind, placebo-controlled',
        sampleSize: 821,
        primaryEndpoint:
          'Laboratory-confirmed COVID-19 or compatible illness within 14 days of a high- or moderate-risk exposure',
        endpointMet: false,
        statisticalPValue:
          '49 of 414 (11.8%) against 58 of 407 (14.3%); absolute difference -2.4 percentage points (95% CI -7.0 to 2.2), p=0.35',
        unreportedAdverseSignals:
          'Side effects were more than twice as common on hydroxychloroquine (40.1% against 16.8%), with no serious adverse reactions reported.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Relative risk of lupus flare 2.5 (95% CI 1.08 to 5.58) on placebo against continued hydroxychloroquine over 24 weeks in 47 stable patients',
        'Retinopathy prevalence 7.5% among 2,361 patients treated for at least five years, rising towards 20% after twenty years at 4.0 to 5.0 mg/kg real body weight',
        '28-day mortality 27.0% against 25.0% in 4,716 hospitalised COVID-19 patients, rate ratio 1.09 (95% CI 0.97 to 1.23)',
        'Mean absolute oral bioavailability 79% and a whole-blood to plasma concentration ratio of roughly 2.6',
      ],
      unsupportedInferences: [
        'That hydroxychloroquine works in lupus by alkalinising endosomes and suppressing Toll-like receptor 7 and 9 signalling — the label states the mechanisms are not fully known',
        'That in-vitro antiviral activity of a lysosomotropic drug predicts clinical benefit against a respiratory virus',
        'That the 6.1-fold relative risk of severe exacerbation on withdrawal is an established finding, when its confidence interval runs from 0.72 to 52.44',
        'That being licensed for malaria makes it a usable travel prophylaxis, when the Limitations of Use exclude every chloroquine-resistant region',
      ],
      whatFailedInitially: [
        'No mortality benefit in hospitalised COVID-19, with fewer patients discharged alive and more progressing to ventilation or death',
        'No benefit as post-exposure prophylaxis, with side effects in 40.1% against 16.8% on placebo',
        'The retinopathy risk taught for forty years was found to be roughly an order of magnitude too low once modern imaging was used',
        'Ideal body weight, the basis on which the drug had been dosed, predicted retinal risk less well than real body weight, and the dosing rule was rewritten',
      ],
      realWorldOutcome: [
        'Approved in the United States in 1955, generic for decades, and on the WHO Model List of Essential Medicines at about fifteen United States cents a tablet',
        'The United States emergency use authorisation for COVID-19 was revoked on 15 June 2020, ten days after the RECOVERY arm closed for lack of efficacy',
        'The 2020 demand surge caused shortages for people taking it for lupus and rheumatoid arthritis, in whom it is not readily substitutable',
        'Screening practice changed in 2016 to annual automated visual fields plus spectral-domain OCT after five years, extended to the central 24 degrees in patients of Asian descent',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet of hydroxychloroquine sulfate at 100, 200, 300 and 400 mg — a 200 mg sulfate tablet delivers 155 mg of hydroxychloroquine base — usually taken once or twice daily',
      description:
        'Mean absolute oral bioavailability is 79% fasting and steady-state whole blood concentration is dose proportional from 200 to 400 mg daily. The drug distributes extensively into tissue and accumulates in acidic intracellular compartments, giving an elimination half-life measured in weeks and a time to steady state measured in months — which is why any benefit is slow to appear and any accumulated toxicity is slow to clear. Whole blood concentrations run roughly 2.6 times plasma concentrations.',
      safetyProfile:
        'Section 5.1 warns of fatal and life-threatening cardiomyopathy, with endomyocardial biopsy in multiple cases showing phospholipidosis without inflammation or necrosis, and of QT prolongation and ventricular arrhythmias including torsades de pointes whose magnitude may rise with drug concentration; the drug is not recommended with other QT-prolonging agents and is to be avoided in known QT prolongation, heart failure, recent infarction, bradycardia below 50 beats per minute, prior ventricular dysrhythmia and uncorrected hypokalaemia or hypomagnesaemia. Section 5.2 warns of irreversible retinal damage related to cumulative dose and duration, with baseline and periodic ophthalmic examination, and notes that changes may progress after the drug is stopped. Also warns of Stevens-Johnson syndrome, toxic epidermal necrolysis, DRESS and acute generalised exanthematous pustulosis; directs avoiding the drug in psoriasis and in porphyria; and warns of myelosuppression and of renal phospholipidosis.',
    },
    commonQuestions: [
      {
        q: 'Will it damage my eyes?',
        a: 'It can, and how likely that is depends on dose per kilogram of your actual weight and on how many years you take it. The study that changed the field looked at 2,361 people who had taken it for at least five years using modern imaging, and found retinopathy in 7.5% overall. Below 5 mg/kg of real body weight, prevalence stayed under 2% in the first ten years and rose to nearly 20% by twenty years. Kidney disease roughly doubles the risk and taking tamoxifen at the same time raises it about fourfold. The reason for annual visual fields and OCT scanning is that the damage is not reversible and can continue progressing after the drug is stopped — screening exists to catch it before it reaches the centre of vision, not to undo it.',
        auditNote:
          'The pre-2014 figure of well under 1% was not a fabrication. It measured bull’s-eye maculopathy, which is late-stage. Better instruments found the disease earlier, and the prevalence moved by an order of magnitude without the drug changing at all.',
      },
      {
        q: 'What happened with COVID-19?',
        a: 'It was tested properly and it did not work. The largest trial randomised 4,716 hospitalised patients, 1,561 to hydroxychloroquine, and found 28-day mortality of 27.0% against 25.0% with usual care — a rate ratio of 1.09 that did not reach significance, with the point estimate on the wrong side. Patients on the drug were significantly less likely to be discharged alive and, if not already ventilated, significantly more likely to progress to ventilation or death. A separate 821-person trial of taking it immediately after exposure was also negative, with side effects in 40% against 17% on placebo. The FDA revoked the emergency use authorisation on 15 June 2020. The episode also caused shortages for people who take it for lupus, where the evidence is real.',
      },
      {
        q: 'Why does it take months to work?',
        a: 'Because of how it distributes. Hydroxychloroquine is a weak base that diffuses into acidic compartments inside cells, becomes charged there, and cannot get back out. The result is that tissue concentrations climb far above blood concentrations and keep climbing for a long time: the elimination half-life is measured in weeks and steady state takes months. The same property runs in reverse when you stop — the drug is still there for weeks — which is part of why the retinal changes can progress after discontinuation.',
      },
      {
        q: 'Is it safe in pregnancy?',
        a: 'This is one of the few immunomodulatory drugs generally continued through pregnancy in lupus, and the reason is the counterfactual: an uncontrolled lupus flare is itself dangerous to a pregnancy. That is a clinical judgement made by rheumatologists and obstetricians together, not something this page can settle, and it is worth contrasting with methotrexate, which is contraindicated in pregnancy for non-malignant disease and carries a boxed warning for fetal death. What can be said from the label is what it does not say: hydroxychloroquine carries no such contraindication.',
      },
      {
        q: 'Does anyone actually know how it works in lupus?',
        a: 'No, and the label says so: the mechanisms underlying the anti-inflammatory and immunomodulatory effects in rheumatoid arthritis, discoid lupus and systemic lupus are not fully known. The best current account is that raising the pH of the endosome interferes with Toll-like receptors 7 and 9, the sensors that detect nucleic acids and that, in lupus, are being triggered by the body’s own DNA. It is a good hypothesis with laboratory support. It is worth noticing what that flexibility permitted in 2020: the same lysosomotropic property was the stated rationale for expecting the drug to work against a coronavirus, and a mechanism loose enough to justify that is loose enough to be worth stating as a hypothesis rather than a fact.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Hydroxychloroquine sulfate tablets United States prescribing information — Indications 1.1 to 1.4 with Limitations of Use, Warnings and Precautions 5.1 to 5.11, Description 11, Mechanism of Action 12.1, Pharmacokinetics 12.3',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=hydroxychloroquine+sulfate',
        kind: 'regulatory',
      },
      {
        label:
          'The Canadian Hydroxychloroquine Study Group. A randomized study of the effect of withdrawing hydroxychloroquine sulfate in systemic lupus erythematosus. N Engl J Med 1991;324:150-154',
        identifier: '10.1056/NEJM199101173240303',
        kind: 'doi',
      },
      {
        label:
          'Melles RB, Marmor MF. The risk of toxic retinopathy in patients on long-term hydroxychloroquine therapy. JAMA Ophthalmol 2014;132:1453-1460',
        identifier: '10.1001/jamaophthalmol.2014.3459',
        kind: 'doi',
      },
      {
        label:
          'Marmor MF, Kellner U, Lai TYY, Melles RB, Mieler WF. Recommendations on screening for chloroquine and hydroxychloroquine retinopathy (2016 revision). Ophthalmology 2016;123:1386-1394',
        identifier: '10.1016/j.ophtha.2016.01.058',
        kind: 'doi',
      },
      {
        label:
          'RECOVERY Collaborative Group. Effect of hydroxychloroquine in hospitalized patients with Covid-19. N Engl J Med 2020;383:2030-2040',
        identifier: '10.1056/NEJMoa2022926',
        kind: 'doi',
      },
      {
        label:
          'Boulware DR, Pullen MF, Bangdiwala AS, et al. A randomized trial of hydroxychloroquine as postexposure prophylaxis for Covid-19. N Engl J Med 2020;383:517-525',
        identifier: '10.1056/NEJMoa2016638',
        kind: 'doi',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — hydroxychloroquine (32 listed generic products), chloroquine phosphate and methotrexate, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 3652 — hydroxychloroquine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3652',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 6. Tamoxifen — a third off breast cancer mortality in 21,457 women, a licensed prevention
  //    indication measured only on incidence, and a pharmacogenomic test the field withdrew.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'tamoxifen',
    name: 'Tamoxifen',
    tradeName: 'Nolvadex / Soltamox',
    sponsor:
      'AstraZeneca (originator, as Nolvadex; the molecule was discovered at ICI Pharmaceuticals in 1962); Soltamox oral solution is separately registered; generic since 2002 and made by many manufacturers',
    targetGene: 'ESR1',
    targetProtein:
      'Oestrogen receptor alpha, at which tamoxifen acts as a competitive antagonist in breast tissue and an agonist in endometrium and bone',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1977,
    indication:
      'Treatment of oestrogen receptor-positive metastatic breast cancer; adjuvant treatment of early-stage oestrogen receptor-positive breast cancer, including reduction of contralateral breast cancer; reduction of the risk of invasive breast cancer in women with ductal carcinoma in situ after surgery and radiation; and reduction of the incidence of breast cancer in women at high risk',
    patientFriendlyIndication:
      'Breast cancer that grows on oestrogen — treating it, and reducing the chance of getting it',
    anatomicalSite:
      'The oestrogen receptor in breast epithelium — and the same receptor in the uterine lining, where the drug does the opposite thing',
    conditionContext: {
      conditionExplainer:
        'About two-thirds of breast cancers carry the oestrogen receptor and use circulating oestrogen as a growth signal. That makes them treatable by interrupting the signal rather than by killing the cell — a fundamentally different and gentler kind of cancer therapy than cytotoxic chemotherapy, and one that has to be continued for years because the signal returns when the drug stops.',
      whyItMatters:
        'Tamoxifen is the first targeted cancer drug and still one of the most effective. Pooled individual data from 21,457 women in 20 randomised trials show five years of it cuts breast cancer mortality by about a third across fifteen years. It also causes endometrial cancer and pulmonary embolism, at rates its own boxed warning states numerically, which is why the same drug is unambiguously worth taking after a diagnosis and a genuine judgement call before one.',
      whoTakesThis:
        'Women and men with oestrogen receptor-positive breast cancer, women with ductal carcinoma in situ after surgery and radiation, and women at high risk who choose prevention. It does essentially nothing in oestrogen receptor-negative disease, and the meta-analysis says so.',
      clinicalGoals:
        'In treatment, fewer recurrences and fewer deaths — both measured. In prevention, fewer breast cancers — measured — and that is a different endpoint from fewer deaths, which the prevention trials have not shown.',
    },
    oneSentenceVerdict:
      'A competitive oestrogen receptor antagonist in breast and agonist in uterus, which in pooled individual data from 21,457 women cut breast cancer recurrence by about half in the first five years and breast cancer mortality by about a third across fifteen — while its own boxed warning records endometrial adenocarcinoma at 2.20 against 0.71 per 1,000 women-years and pulmonary embolism at 0.75 against 0.25 in the prevention trial.',
    laymanHowItWorks:
      'Most breast cancers grow because oestrogen docks into a receptor inside the cell and switches on the genes that make it divide. Tamoxifen sits in the same dock and does not switch those genes on, so the growth signal stops. The complication is that the same receptor exists in other tissues and the drug does not behave the same way everywhere: in the lining of the uterus it acts like oestrogen rather than against it, which is why it raises the risk of uterine cancer, and in bone it also acts like oestrogen, which is why it protects against fractures. One molecule, one receptor, opposite effects depending on which tissue it is in.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 88,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.2833 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 15 listed generic products at 10 and 20 mg, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Discovered at ICI Pharmaceuticals in 1962 as a failed contraceptive candidate, approved in the United States in 1977 and generic since 2002. It is on the WHO Model List of Essential Medicines. At about twenty-eight United States cents a tablet, a five-year adjuvant course costs roughly the price of a single day of many modern oncology drugs.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'In postmenopausal women the real alternative is an aromatase inhibitor, which removes oestrogen rather than blocking its receptor, costs about half as much per tablet, and trades one harm profile for another: no endometrial cancer and no clotting, but bone loss and joint pain instead. In premenopausal women aromatase inhibitors do not work on their own, so tamoxifen has no direct competitor there. Raloxifene is the prevention-only alternative and is less effective at preventing invasive cancer.',
      conventionalRx: [
        {
          name: 'Anastrozole or letrozole',
          class:
            'Aromatase inhibitors — they stop oestrogen being made rather than block its receptor',
          howItCompares:
            'For postmenopausal women these give lower recurrence rates than tamoxifen in head-to-head adjuvant trials, at about half the acquisition cost per tablet, and they do not cause endometrial cancer or venous thromboembolism. They do cause bone density loss, fractures and arthralgia, and they are ineffective as monotherapy before menopause because the ovary keeps producing oestrogen faster than the enzyme block can remove it.',
          typicalCost:
            'Anastrozole US$0.1401 per tablet (21 listed generic products) and letrozole US$0.1511 per tablet (14 listed generic products) at United States pharmacy acquisition cost (CMS NADAC, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: cheaper; no uterine cancer signal; no clot signal. Cons: bone loss and fractures; joint pain that causes many women to stop; useless as monotherapy in premenopausal women.',
        },
        {
          name: 'Raloxifene (Evista)',
          class:
            'Selective oestrogen receptor modulator, licensed for prevention and for osteoporosis',
          howItCompares:
            'An alternative for prevention in postmenopausal women only, with a cleaner uterine profile. In the USPSTF evidence review, risk of invasive breast cancer was higher on raloxifene than on tamoxifen in the one trial with long-term follow-up (RR 1.24, 95% CI 1.05 to 1.47, n=19,747) — it is safer and less effective at the thing it is being taken for.',
          typicalCost:
            'US$0.2359 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 25 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: no endometrial cancer signal; reduces vertebral fractures (RR 0.61, 95% CI 0.53 to 0.73). Cons: less effective than tamoxifen at preventing invasive breast cancer; also raises thromboembolic risk; postmenopausal use only.',
        },
        {
          name: 'No preventive medication, with surveillance',
          class: 'Watchful waiting for women considering prevention rather than treatment',
          howItCompares:
            'The USPSTF found the benefit of risk-reducing medication is no greater than small in women not at increased risk, and recommends against routine use in that group. Its recommendation to offer these drugs applies specifically to women at increased risk who are at low risk of adverse medication effects — a two-sided condition that is often quoted as one.',
          typicalCost: 'None',
          prosAndCons:
            'Pros: no endometrial cancer, no clots, no cataracts, no hot flushes. Cons: the risk the drug would have reduced remains; risk assessment tools discriminate poorly between individual women, with areas under the curve of 0.55 to 0.65.',
        },
      ],
      naturalFoods: [
        {
          name: 'Soy isoflavones',
          activeCompound:
            'Genistein and daidzein, phyto-oestrogens with affinity for oestrogen receptor beta',
          biologicalMechanism:
            'These bind the oestrogen receptor family and were, for years, believed on theoretical grounds to interfere with tamoxifen. Observational cohorts of breast cancer survivors have not shown the harm that reasoning predicted, and the mechanism argument cuts both ways — a weak partial agonist could in principle compete with oestrogen or with tamoxifen depending on the local hormonal context.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'Not stated here as advice, and it is included as an example of a mechanism-based fear rather than as a substitute for anything. No randomised trial has tested whether dietary soy alters breast cancer outcomes in women taking tamoxifen, and nothing on this page should be read as recommending or discouraging it.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Report abnormal vaginal bleeding immediately',
          action:
            'Any bleeding after menopause, or a change in menstrual pattern, needs same-week assessment while taking this drug.',
          patientImpact:
            'The boxed warning records endometrial adenocarcinoma at 2.20 against 0.71 per 1,000 women-years and uterine sarcoma at 0.17 against 0.04 in the NSABP P-1 prevention trial, and states that fatal cases of each event type have occurred.',
          clinicalPrecaution:
            'Endometrial cancer detected early is usually curable, which is precisely why the reporting threshold is low. The absolute excess in P-1 is about 1.5 endometrial adenocarcinomas per 1,000 women-years.',
        },
        {
          name: 'Know the clot symptoms before you need them',
          action:
            'Sudden breathlessness, chest pain on breathing in, or a painful swollen calf are emergencies on this drug.',
          patientImpact:
            'The boxed warning records pulmonary embolism at 0.75 against 0.25 per 1,000 women-years and stroke at 1.43 against 1.00 in the prevention trial, with fatal cases of each. In the ATLAS extended-duration trial, pulmonary embolus incidence carried a rate ratio of 1.87 (95% CI 1.13 to 3.07, p=0.01).',
          clinicalPrecaution:
            'Risk rises with immobility, surgery and long-haul travel. The ATLAS data also show ischaemic heart disease going the other way, with a rate ratio of 0.76 (0.60 to 0.95, p=0.02), so the vascular picture is not uniformly adverse.',
        },
        {
          name: 'Mention it before any eye examination',
          action: 'Tell an optometrist or ophthalmologist that you take tamoxifen.',
          patientImpact:
            'The USPSTF evidence review found tamoxifen associated with a higher risk of cataracts than placebo. Separately, concurrent tamoxifen was an independent risk factor for hydroxychloroquine retinopathy in a 2,361-patient study, with an odds ratio of 4.59 (95% CI 2.05 to 10.27).',
          clinicalPrecaution:
            'The hydroxychloroquine interaction matters specifically for women who take both — a combination that occurs in lupus or rheumatoid arthritis with a breast cancer history, and one neither prescriber may be aware of.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC/C(=C(\\C1=CC=CC=C1)/C2=CC=C(C=C2)OCCN(C)C)/C3=CC=CC=C3',
      chemicalFormula: 'C26H29NO',
      molecularWeight: '371.50 g/mol (free base); dispensed as the citrate salt',
      targetReceptorAffinity:
        'A triphenylethylene with defined Z geometry about the double bond — the E isomer is an oestrogen agonist rather than an antagonist, so the alkene configuration is the entire pharmacology. The label describes tamoxifen as an oestrogen agonist/antagonist that competes with oestrogen for binding to the oestrogen receptor. After a single 20 mg oral dose, mean peak plasma concentration is 40 ng/mL at about 5 hours, with a biphasic decline and a terminal elimination half-life of 5 to 7 days; steady state is reached in about 4 weeks for tamoxifen and 8 weeks for N-desmethyltamoxifen, implying a half-life near 14 days for that metabolite. Tamoxifen is extensively metabolised by CYP3A, CYP2D6, CYP2C9, CYP2C19 and CYP2B6. The label states that endoxifen and 4-hydroxytamoxifen, identified as minor metabolites, have 100-fold greater affinity for the oestrogen receptor than the parent, with steady-state concentrations of 29.1 ng/mL (95% CI 24.6 to 33.6) and 3.7 ng/mL (3.3 to 4.1).',
      structureSource: {
        label:
          'PubChem CID 2733526 (tamoxifen) — canonical SMILES, molecular formula and weight, as carried on the enriched record; pharmacokinetics, metabolite affinities and mechanism statement from the SOLTAMOX label, sections 12.1 and 12.3',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2733526',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'tam-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Quantify the E isomer, because it is an agonist',
          description:
            'Tamoxifen is the Z isomer of a triphenylethylene. The E isomer is not an inactive impurity: it acts as an oestrogen agonist, so contamination does not merely dilute the drug, it opposes it. Geometric isomer content is therefore a potency-and-safety specification in a way that most related-substance limits are not, and the isomers interconvert on exposure to light.',
          reagentsAndBuffer:
            'Tamoxifen citrate reference standard with a characterised E-isomer standard, reverse-phase HPLC with UV detection at 240 nm under amber glass, NMR nuclear Overhauser measurement to confirm alkene geometry, photostability testing per ICH Q1B',
        },
        {
          id: 'tam-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Build the tetrasubstituted alkene with the right geometry',
          description:
            'The molecule is a tetrasubstituted alkene bearing three different aryl or alkyl groups, and setting its geometry is the whole synthetic problem. Classical routes proceed through a McMurry coupling or a Grignard addition to a benzophenone followed by dehydration, both of which give a mixture of Z and E that must then be separated or equilibrated.',
          dependsOnStepId: 'tam-w1',
          reagentsAndBuffer:
            '4-hydroxybenzophenone or a protected derivative, propiophenone-derived organometallic reagent, titanium-mediated coupling or Grignard addition with acid-catalysed dehydration, dimethylaminoethyl chloride for the ether side chain, base',
        },
        {
          id: 'tam-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Separate the isomers and form the citrate under light protection',
          description:
            'Z and E tamoxifen differ only in geometry, so they have nearly identical solubility and must be separated by fractional crystallisation of the citrate salt or by chromatography. Because light drives isomerisation, every step after separation is performed and stored protected from light, and the finished product is packaged accordingly.',
          dependsOnStepId: 'tam-w2',
          reagentsAndBuffer:
            'Citric acid in ethanol or acetone, fractional crystallisation with seeding, amber containment throughout, HPLC release testing with a specified E-isomer limit, water content by Karl Fischer',
        },
        {
          id: 'tam-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Test the parent and endoxifen as separate materials',
          description:
            'The label states that endoxifen and 4-hydroxytamoxifen have 100-fold greater oestrogen receptor affinity than tamoxifen itself, and endoxifen circulates at roughly 29 ng/mL at steady state. Assaying the parent alone therefore measures a prodrug and reports the affinity of the wrong molecule. Both must be run separately, and against both receptor subtypes.',
          dependsOnStepId: 'tam-w3',
          reagentsAndBuffer:
            'Recombinant human oestrogen receptor alpha and beta ligand-binding domains, tritiated oestradiol for competitive displacement, authentic endoxifen and 4-hydroxytamoxifen standards, MCF-7 cells for a cellular proliferation readout',
        },
        {
          id: 'tam-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Demonstrate the tissue-selective reversal, do not assume it',
          description:
            'The clinically decisive property of tamoxifen is that it is an antagonist in breast and an agonist in endometrium. That is not a property of the receptor but of which coactivator and corepressor proteins each tissue expresses. The assay that reads it out is a reporter-gene comparison in breast and endometrial cell backgrounds, and it is the experiment that predicts the boxed warning from first principles.',
          dependsOnStepId: 'tam-w4',
          reagentsAndBuffer:
            'MCF-7 breast and Ishikawa endometrial cell lines carrying an oestrogen-response-element luciferase reporter, oestradiol as the reference agonist, ICI 182,780 as a pure antagonist control, coactivator SRC-1 and corepressor NCoR knockdown arms',
        },
      ],
    },
    keyAudits: [
      {
        id: 'tam-a1',
        category: 'measured',
        title: 'A third off breast cancer mortality, sustained for fifteen years',
        laymanSummary:
          'Individual data from 21,457 women in twenty randomised trials show that five years of tamoxifen roughly halves recurrence in the first five years and cuts death from breast cancer by about a third — and the benefit is still there ten and fifteen years later, long after the drug has stopped.',
        technicalDetails:
          'A collaborative patient-level meta-analysis of 20 trials of about five years of adjuvant tamoxifen against none, with about 80% compliance. In oestrogen receptor-positive disease (n=10,645), recurrence rate ratios were 0.53 (SE 0.03) during years 0-4 and 0.68 (0.06) during years 5-9, both 2p<0.00001, and 0.97 (0.10) during years 10-14, indicating neither further gain nor loss after year 10. Breast cancer mortality was reduced by about a third throughout fifteen years: RR 0.71 (0.05) years 0-4, 0.66 (0.05) years 5-9, and 0.68 (0.08) years 10-14, with p<0.0001 for extra mortality reduction in each separate period. The proportional reduction was approximately independent of progesterone receptor status, age, nodal status and chemotherapy use. Non-breast-cancer mortality was little affected despite small absolute increases in thromboembolic and uterine cancer mortality — both only in women over 55 — so all-cause mortality was substantially reduced. In oestrogen receptor-negative disease, tamoxifen had little or no effect on recurrence or mortality. Even marginally positive tumours at 10 to 19 fmol/mg cytosol protein showed a substantial reduction (RR 0.67, 0.08). Receptor status was the only recorded factor importantly predictive of proportional benefit.',
        evidenceSource:
          'Early Breast Cancer Trialists’ Collaborative Group (Davies C, Godwin J, Gray R, et al.). Relevance of breast cancer hormone receptors and other factors to the efficacy of adjuvant tamoxifen: patient-level meta-analysis of randomised trials. Lancet 2011;378:771-784',
        doi: '10.1016/S0140-6736(11)60993-8',
        measuredMetric:
          'Recurrence and breast cancer mortality rate ratios by five-year period across 15 years, in 21,457 women',
        auditFlag: 'verified',
      },
      {
        id: 'tam-a2',
        category: 'inferred',
        title: 'The prevention indication is licensed on incidence, not on deaths',
        laymanSummary:
          'For a woman who already has breast cancer, tamoxifen prevents deaths — that is measured. For a healthy woman at high risk, what has been shown is fewer cancers, not fewer deaths from them.',
        technicalDetails:
          'Section 1.4 of the label reads: "to reduce the incidence of breast cancer in adult women at high risk for breast cancer" — an incidence endpoint, stated as such. IBIS-I randomised 7,154 women at increased risk to tamoxifen 20 mg daily or placebo for five years; after a median 16 years, 251 of 3,579 (7.0%) developed breast cancer against 350 of 3,575 (9.8%), hazard ratio 0.71 (95% CI 0.60 to 0.83, p<0.0001), with protection persisting after treatment stopped (HR 0.69, 0.53 to 0.91 beyond year 10). The reduction was concentrated in oestrogen receptor-positive invasive disease (HR 0.66, 0.54 to 0.81) with no effect on receptor-negative disease (HR 1.05, 0.71 to 1.57). The 2019 USPSTF evidence review pooled four placebo-controlled prevention trials in 28,421 women, finding tamoxifen associated with lower incidence of invasive breast cancer (RR 0.69, 95% CI 0.59 to 0.84) alongside higher endometrial cancer, cataracts and thromboembolic events — and reports no mortality reduction among its outcomes. The USPSTF recommendation is a B, offered specifically to women at increased risk who are at low risk of adverse medication effects, with a recommendation against routine use in women not at increased risk. Preventing a cancer is a real benefit. It is not the same measurement as preventing a death from one, and the prevention literature has only made the first.',
        evidenceSource:
          'Cuzick J, Sestak I, Cawthorn S, et al. Tamoxifen for prevention of breast cancer: extended long-term follow-up of the IBIS-I breast cancer prevention trial. Lancet Oncol 2015;16:67-75; Nelson HD et al., JAMA 2019;322:868-886; SOLTAMOX label section 1.4',
        doi: '10.1016/S1470-2045(14)71171-4',
        inferredClaim:
          'That reducing breast cancer incidence in high-risk women reduces breast cancer deaths — the endpoint the prevention indication is licensed on is incidence, and no mortality reduction has been demonstrated in that setting',
        auditFlag: 'caution',
      },
      {
        id: 'tam-a3',
        category: 'conclusion_shift',
        title: 'CYP2D6 genotyping was going to personalise it, and then it was not',
        laymanSummary:
          'Tamoxifen has to be converted by a liver enzyme into its potent form, so it seemed obvious that people with a slow version of that enzyme would do worse. Two analyses inside large randomised trials, in over 5,500 women, found no such thing — and one found the slow metabolisers doing marginally better.',
        technicalDetails:
          'The hypothesis was mechanistically compelling: CYP2D6 converts tamoxifen to endoxifen, which the label states has 100-fold greater oestrogen receptor affinity than the parent, so poor metabolisers should get less drug effect. Two genotyping analyses embedded in randomised trials tested it. In BIG 1-98, tumour DNA from 4,861 of 8,010 postmenopausal women was genotyped at nine CYP2D6 polymorphisms; among patients on tamoxifen monotherapy without previous chemotherapy there was no association between metaboliser phenotype and breast cancer-free interval (p=0.35), and poor or intermediate metabolisers had a non-significantly reduced risk of recurrence against extensive metabolisers (HR 0.86, 95% CI 0.60 to 1.24) — the opposite direction from the prediction. Reduced-activity phenotypes were, however, associated with more tamoxifen-induced hot flushes (p=0.020), also contrary to the hypothesis. In ATAC, 1,203 patients were genotyped for CYP2D6 and 1,209 for UGT2B7; after a median ten years there was no significant association between CYP2D6 genotype and recurrence in tamoxifen-treated patients (poor against extensive metaboliser, HR for distant recurrence 1.25, 95% CI 0.55 to 3.15, p=0.64; any recurrence 0.99, 0.48 to 2.08, p=0.99), and a near-null association for UGT2B7. Both papers state the results do not support using CYP2D6 genotype to predict benefit. The episode is worth recording precisely because the mechanism was correct — endoxifen really is the potent species — and the clinical inference from it was not.',
        evidenceSource:
          'Regan MM, Leyland-Jones B, Bouzyk M, et al. CYP2D6 genotype and tamoxifen response in postmenopausal women with endocrine-responsive breast cancer: the Breast International Group 1-98 trial. J Natl Cancer Inst 2012;104:441-451; Rae JM, Drury S, Hayes DF, et al. CYP2D6 and UGT2B7 genotype and risk of recurrence in tamoxifen-treated breast cancer patients. J Natl Cancer Inst 2012;104:452-460',
        doi: '10.1093/jnci/djs125',
        measuredMetric:
          'Breast cancer-free interval and distant recurrence by CYP2D6 metaboliser phenotype in two randomised trial populations',
        auditFlag: 'verified',
      },
      {
        id: 'tam-a4',
        category: 'failed',
        title: 'Uterine cancer and pulmonary embolism, with numbers in the boxed warning',
        laymanSummary:
          'The boxed warning does not hedge. In the prevention trial, endometrial cancer occurred at 2.20 per thousand women-years on tamoxifen against 0.71 on placebo, and pulmonary embolism at 0.75 against 0.25. Fatal cases of each occurred.',
        technicalDetails:
          'The boxed warning gives incidence rates per 1,000 women-years from the NSABP P-1 prevention trial: endometrial adenocarcinoma 2.20 against 0.71; uterine sarcoma 0.17 against 0.04; stroke 1.43 against 1.00; pulmonary embolism 0.75 against 0.25 — and states that fatal cases of each type have occurred. It then draws the distinction that the whole risk-benefit argument turns on: discuss the benefits against these risks with women at high risk and women with DCIS considering the drug to reduce risk, and "for most patients already diagnosed with breast cancer, the benefits of tamoxifen outweigh its risks." Two different populations, the same drug, the same harm rates, and a different answer. The ATLAS extended-duration trial quantifies what a further five years costs: cumulative endometrial cancer risk during years 5-14 of 3.1% with continued tamoxifen against 1.6% for controls, with mortality of 0.4% against 0.2% — an absolute mortality increase of 0.2 percentage points, set against an absolute breast cancer mortality reduction of 2.8 percentage points in the same window.',
        evidenceSource:
          'SOLTAMOX (tamoxifen citrate) United States prescribing information, boxed warning and sections 5.1 and 5.2, citing NSABP P-1; Davies C et al., Lancet 2013;381:805-816 (ATLAS)',
        doi: '10.1016/S0140-6736(12)61963-1',
        measuredMetric:
          'Incidence per 1,000 women-years of endometrial adenocarcinoma, uterine sarcoma, stroke and pulmonary embolism against placebo',
        auditFlag: 'caution',
      },
      {
        id: 'tam-a5',
        category: 'measured',
        title: 'Ten years beat five, and most of the extra benefit arrived after year ten',
        laymanSummary:
          'Doubling the course from five years to ten reduced recurrences and deaths further — but almost all of the extra benefit appeared after the tenth year, which is a decade after the decision to continue has to be made.',
        technicalDetails:
          'ATLAS randomised 12,894 women who had completed five years of tamoxifen to continue to ten years or stop, reporting breast cancer outcomes in the 6,846 with oestrogen receptor-positive disease. Continuing reduced recurrence (617 in 3,428 against 711 in 3,418, p=0.002), breast cancer mortality (331 against 397 deaths, p=0.01) and overall mortality (639 against 722, p=0.01). The timing matters: recurrence rate ratio was 0.90 (95% CI 0.79 to 1.02) during years 5-9 and 0.75 (0.62 to 0.90) afterwards; breast cancer mortality rate ratio was 0.97 (0.79 to 1.18) during years 5-9 and 0.71 (0.58 to 0.88) afterwards. Cumulative recurrence during years 5-14 was 21.4% against 25.1%, and breast cancer mortality 12.2% against 15.0%, an absolute reduction of 2.8 percentage points. There was no effect in the 1,248 women with receptor-negative disease and an intermediate effect in the 4,800 with unknown status. Non-breast-cancer mortality without recurrence was little affected (RR 0.99, 0.89 to 1.10). The carried-forward harm is pulmonary embolus (RR 1.87, 1.13 to 3.07) and endometrial cancer (RR 1.74, 1.30 to 2.34); ischaemic heart disease went the other way (RR 0.76, 0.60 to 0.95).',
        evidenceSource:
          'Davies C, Pan H, Godwin J, et al. Long-term effects of continuing adjuvant tamoxifen to 10 years versus stopping at 5 years after diagnosis of oestrogen receptor-positive breast cancer: ATLAS, a randomised trial. Lancet 2013;381:805-816; ISRCTN19652633',
        doi: '10.1016/S0140-6736(12)61963-1',
        measuredMetric:
          'Recurrence, breast cancer mortality and overall mortality with 10 years against 5 years of adjuvant tamoxifen',
        auditFlag: 'verified',
      },
      {
        id: 'tam-a6',
        category: 'inferred',
        title: 'It does essentially nothing without the receptor, and the meta-analysis says so',
        laymanSummary:
          'In tumours without the oestrogen receptor, tamoxifen had little or no effect on recurrence or on death. Receptor status was the only patient factor that predicted whether the drug worked.',
        technicalDetails:
          'The 2011 patient-level meta-analysis states that in oestrogen receptor-negative disease, tamoxifen had little or no effect on breast cancer recurrence or mortality, and that receptor status was the only recorded factor importantly predictive of the proportional reductions — not progesterone receptor status or level, not age, not nodal status, not whether chemotherapy had been given. The practical consequence the authors draw is often skipped: because the proportional reduction is constant across those groups, the absolute benefit depends entirely on the absolute risk without tamoxifen. The same relative risk reduction of a third produces a large absolute benefit in a woman with high recurrence risk and a small one in a woman with low risk, and it is the absolute number that has to be weighed against a boxed warning with fixed absolute harm rates. That is the arithmetic behind the label’s statement that the answer differs between women already diagnosed and women considering prevention.',
        evidenceSource:
          'Early Breast Cancer Trialists’ Collaborative Group. Lancet 2011;378:771-784',
        doi: '10.1016/S0140-6736(11)60993-8',
        inferredClaim:
          'That a relative risk reduction reported from a meta-analysis describes the benefit an individual woman can expect — the proportional reduction is constant, so the absolute benefit varies with her baseline risk while the absolute harm rates do not',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A tablet that takes a month to reach full effect',
        laymanDesc:
          'Tamoxifen stays in the body for a long time — the half-life is measured in days, and its main metabolite in weeks. Steady levels take about a month to build up.',
        molecularDetail:
          'After a single 20 mg dose, mean peak plasma concentration is 40 ng/mL at about 5 hours, with biphasic decline and a terminal half-life of 5 to 7 days. Steady state is reached in about 4 weeks for tamoxifen and about 8 weeks for N-desmethyltamoxifen, implying a half-life near 14 days for the metabolite. Food does not affect absorption of the oral solution.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The liver makes the potent version',
        laymanDesc:
          'The tablet is largely a precursor. Liver enzymes convert a small fraction of it into two metabolites that are a hundred times better at gripping the receptor.',
        molecularDetail:
          'Extensive metabolism by CYP3A, CYP2D6, CYP2C9, CYP2C19 and CYP2B6. N-desmethyltamoxifen, formed predominantly by CYP3A, is the major plasma metabolite with activity similar to the parent. The label states endoxifen and 4-hydroxytamoxifen, identified as minor metabolites, have 100-fold greater oestrogen receptor affinity, with steady-state concentrations of 29.1 and 3.7 ng/mL.',
        iconName: 'Filter',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It occupies the oestrogen dock in the breast cell',
        laymanDesc:
          'Inside the cell, the drug takes the place oestrogen would occupy on the receptor and does not switch on the growth genes.',
        molecularDetail:
          'The label describes tamoxifen as an oestrogen agonist/antagonist that competes with oestrogen for binding to the oestrogen receptor, which can result in decreased oestrogen-receptor-signalling-dependent growth in breast tissue. The bound receptor still dimerises and reaches DNA; what changes is which coregulator proteins it recruits.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'In the uterus, the same drug acts like oestrogen',
        laymanDesc:
          'Endometrium expresses a different set of helper proteins, so the same drug-receptor complex switches genes on there instead of off. That is where the uterine cancer risk comes from.',
        molecularDetail:
          'Tissue selectivity arises from the relative abundance of coactivators such as SRC-1 and corepressors such as NCoR. The consequence is quantified in the boxed warning: endometrial adenocarcinoma at 2.20 against 0.71 per 1,000 women-years and uterine sarcoma at 0.17 against 0.04 in NSABP P-1. Bone is the third tissue, where agonism is protective — tamoxifen was associated with lower nonvertebral fracture risk (RR 0.66, 95% CI 0.45 to 0.98) in the USPSTF review.',
        iconName: 'RefreshCcw',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Recurrence halves; deaths fall by a third',
        laymanDesc:
          'Across twenty trials and more than twenty thousand women, five years of the drug roughly halved recurrence early on and cut breast cancer deaths by about a third for fifteen years.',
        molecularDetail:
          'Recurrence rate ratio 0.53 (SE 0.03) during years 0-4 and 0.68 (0.06) during years 5-9 in oestrogen receptor-positive disease. Breast cancer mortality rate ratio 0.71, 0.66 and 0.68 across three successive five-year periods, p<0.0001 for extra mortality reduction in each. Little or no effect in receptor-negative disease.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'The benefit outlasts the drug — and so does the calculation',
        laymanDesc:
          'Stopping after five years does not end the protection; the mortality benefit continues for at least a decade. Continuing to ten years adds more, but mostly after year ten.',
        molecularDetail:
          'In the meta-analysis, recurrence rate ratio during years 10-14 was 0.97 (0.10) — neither further gain nor loss after year 10 for a five-year course — while breast cancer mortality reduction persisted through years 10-14. In ATLAS, continuing to ten years gave a recurrence rate ratio of 0.90 (0.79 to 1.02) during years 5-9 and 0.75 (0.62 to 0.90) later, with breast cancer mortality 0.97 (0.79 to 1.18) then 0.71 (0.58 to 0.88).',
        iconName: 'Clock',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'EBCTCG patient-level meta-analysis of 20 adjuvant tamoxifen trials (Lancet 2011;378:771-784)',
        phase: 'Collaborative meta-analysis of individual patient data from randomised trials',
        sampleSize: 21457,
        primaryEndpoint:
          'Breast cancer recurrence and breast cancer mortality with about 5 years of adjuvant tamoxifen against none, by oestrogen receptor status',
        endpointMet: true,
        statisticalPValue:
          'Recurrence RR 0.53 (SE 0.03) years 0-4 and 0.68 (0.06) years 5-9 in ER-positive disease (both 2p<0.00001); breast cancer mortality RR 0.71, 0.66 and 0.68 across years 0-4, 5-9 and 10-14 (p<0.0001 for each period)',
        unreportedAdverseSignals:
          'Small absolute increases in thromboembolic and uterine cancer mortality, both confined to women older than 55. Recurrence RR during years 10-14 was 0.97 (0.10), indicating the recurrence benefit of a five-year course neither grows nor reverses after year 10. Compliance was about 80%.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'ATLAS (Davies C et al., Lancet 2013;381:805-816; ISRCTN19652633)',
        phase: 'Randomised, open control, extended-duration trial',
        sampleSize: 12894,
        primaryEndpoint:
          'Breast cancer recurrence and mortality with tamoxifen continued to 10 years against stopping at 5 years, in oestrogen receptor-positive disease',
        endpointMet: true,
        statisticalPValue:
          'Recurrence 617 of 3,428 against 711 of 3,418 (p=0.002); breast cancer mortality 331 against 397 deaths (p=0.01); overall mortality 639 against 722 (p=0.01)',
        unreportedAdverseSignals:
          'Endometrial cancer rate ratio 1.74 (95% CI 1.30 to 2.34, p=0.0002), with cumulative risk during years 5-14 of 3.1% against 1.6% and mortality 0.4% against 0.2%. Pulmonary embolus rate ratio 1.87 (1.13 to 3.07, p=0.01). Ischaemic heart disease went the other way at 0.76 (0.60 to 0.95, p=0.02). Almost all the extra breast cancer benefit appeared after year 10.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'IBIS-I (Cuzick J et al., Lancet Oncol 2015;16:67-75; ISRCTN91879928)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled prevention trial',
        sampleSize: 7154,
        primaryEndpoint:
          'Occurrence of breast cancer (invasive plus ductal carcinoma in situ) in women at increased risk, by intention to treat',
        endpointMet: true,
        statisticalPValue:
          '251 of 3,579 (7.0%) against 350 of 3,575 (9.8%) after a median 16 years; hazard ratio 0.71 (95% CI 0.60 to 0.83), p<0.0001',
        unreportedAdverseSignals:
          'The primary endpoint is incidence, not mortality. No effect was seen on invasive oestrogen receptor-negative breast cancer (HR 1.05, 95% CI 0.71 to 1.57). The harms quantified in the boxed warning — endometrial cancer, stroke and pulmonary embolism — come from the sister prevention trial NSABP P-1.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'CYP2D6 pharmacogenomic analyses within BIG 1-98 and ATAC (J Natl Cancer Inst 2012;104:441-451 and 452-460)',
        phase: 'Prospectively collected genotype analyses within two randomised phase 3 trials',
        sampleSize: 5596,
        primaryEndpoint:
          'Association of CYP2D6 metaboliser phenotype with breast cancer-free interval or distant recurrence in tamoxifen-treated patients',
        endpointMet: false,
        statisticalPValue:
          'BIG 1-98: no association in tamoxifen monotherapy without prior chemotherapy (p=0.35); poor or intermediate against extensive metaboliser HR 0.86 (95% CI 0.60 to 1.24). ATAC: poor against extensive metaboliser HR for distant recurrence 1.25 (0.55 to 3.15, p=0.64) and any recurrence 0.99 (0.48 to 2.08, p=0.99)',
        unreportedAdverseSignals:
          'In BIG 1-98 the reduced-activity phenotypes had more tamoxifen-induced hot flushes (p=0.020), the opposite of what the metabolic hypothesis predicted, which removed the proposed use of hot flushes as a marker of adequate activation.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Breast cancer mortality rate ratio of about 0.68 sustained across fifteen years in oestrogen receptor-positive disease, from 21,457 women in 20 randomised trials',
        'Recurrence rate ratio 0.53 during years 0-4 and 0.68 during years 5-9 with a five-year adjuvant course',
        'Breast cancer incidence 7.0% against 9.8% over a median 16 years in 7,154 high-risk women given five years of prevention (HR 0.71)',
        'Endometrial adenocarcinoma 2.20 against 0.71 and pulmonary embolism 0.75 against 0.25 per 1,000 women-years in the NSABP P-1 prevention trial',
      ],
      unsupportedInferences: [
        'That preventing breast cancers in high-risk women prevents deaths from breast cancer — the prevention indication is licensed on incidence and no mortality reduction has been shown',
        'That CYP2D6 genotype predicts who benefits, which two analyses in over 5,500 randomised patients did not support',
        'That a relative risk reduction of a third describes any individual woman’s benefit, when the proportional effect is constant and the absolute benefit tracks her baseline risk',
        'That the drug is worth taking in oestrogen receptor-negative disease, where the meta-analysis found little or no effect on recurrence or mortality',
      ],
      whatFailedInitially: [
        'CYP2D6-guided tamoxifen dosing, proposed on a correct mechanism, was not supported by either of the two large randomised-trial genotype analyses',
        'Hot flushes as a marker of adequate metabolic activation failed in the opposite direction — reduced-activity phenotypes had more of them',
        'The uterine cancer and pulmonary embolism signals were large enough to put four numeric incidence rates into the boxed warning',
        'Extending treatment from five to ten years produced no significant breast cancer mortality benefit during years 5-9 (RR 0.97) and delivered almost all of it after year 10',
      ],
      realWorldOutcome: [
        'Discovered at ICI in 1962 as a failed contraceptive candidate, approved in the United States in 1977, generic since 2002, and on the WHO Model List of Essential Medicines',
        'About twenty-eight United States cents a tablet at pharmacy acquisition cost — a five-year adjuvant course for roughly the price of a single day of many modern oncology drugs',
        'Largely displaced by aromatase inhibitors in postmenopausal women, which cost about half as much and trade uterine and clotting risk for bone loss and joint pain',
        'Remains the only option of its kind for premenopausal women, in whom aromatase inhibitors do not work as monotherapy',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet at 10 and 20 mg of tamoxifen citrate, and an oral solution (Soltamox) for people who cannot swallow tablets — taken once or twice daily for five to ten years',
      description:
        'A single 20 mg dose gives a mean peak plasma concentration of 40 ng/mL at about 5 hours, declining biphasically with a terminal half-life of 5 to 7 days. Steady state takes about 4 weeks for tamoxifen and 8 weeks for its major metabolite N-desmethyltamoxifen. A 20 mg tablet once daily is bioequivalent to 10 mg twice daily, and the oral solution is bioequivalent to tablets and unaffected by food. Metabolism runs through CYP3A, CYP2D6, CYP2C9, CYP2C19 and CYP2B6, and the two most potent metabolites, endoxifen and 4-hydroxytamoxifen, have 100-fold greater receptor affinity than the parent.',
      safetyProfile:
        'Boxed warning for uterine malignancies, stroke and pulmonary embolism, with fatal cases of each, and with incidence rates per 1,000 women-years quoted from NSABP P-1: endometrial adenocarcinoma 2.20 against 0.71, uterine sarcoma 0.17 against 0.04, stroke 1.43 against 1.00, pulmonary embolism 0.75 against 0.25. The warning directs discussing benefits against these risks with women at high risk and women with ductal carcinoma in situ considering the drug for risk reduction, and states that for most patients already diagnosed with breast cancer the benefits outweigh the risks. Cataracts occur more often than on placebo. Concurrent tamoxifen is an independent risk factor for hydroxychloroquine retinopathy (odds ratio 4.59). Hot flushes are the commonest reason for stopping.',
    },
    commonQuestions: [
      {
        q: 'How much difference does it actually make?',
        a: 'In oestrogen receptor-positive breast cancer, a great deal, and it has been measured about as well as anything in medicine: individual data from 21,457 women in twenty randomised trials show five years of tamoxifen roughly halved recurrence during the first five years and cut breast cancer mortality by about a third, sustained for fifteen years — long after the tablets stopped. That is a proportional reduction, which means the absolute benefit depends on your own baseline risk: the same third off a large risk is a large gain, and the same third off a small risk is a small one. In oestrogen receptor-negative disease it does little or nothing, and receptor status was the only patient factor that predicted whether it worked.',
        auditNote:
          'The constancy of the proportional effect across age, nodal status and chemotherapy is what makes the absolute-risk arithmetic the whole decision. The harm rates in the boxed warning are absolute and do not scale with baseline risk.',
      },
      {
        q: 'What is the uterine cancer risk really?',
        a: 'It is in the boxed warning with numbers attached, which is unusual and useful. In the NSABP P-1 prevention trial, endometrial adenocarcinoma occurred at 2.20 per 1,000 women-years on tamoxifen against 0.71 on placebo, and uterine sarcoma at 0.17 against 0.04 — an absolute excess of roughly 1.5 endometrial cancers per 1,000 women per year, and fatal cases of each occurred. The label then draws the distinction that matters: it directs a careful discussion for women considering the drug to reduce risk, and states that for most patients already diagnosed with breast cancer the benefits outweigh the risks. Same drug, same harm rate, different answer, because the benefit side is different. Abnormal vaginal bleeding is the symptom to report immediately.',
      },
      {
        q: 'Should I be genotyped for CYP2D6 first?',
        a: 'The evidence does not support it, and the story of why is instructive. Tamoxifen is largely a precursor, and CYP2D6 makes endoxifen, which the label says binds the oestrogen receptor a hundred times better than the parent. So poor metabolisers should do worse — a clean prediction from a correct mechanism. Two genotyping analyses inside large randomised trials tested it: in BIG 1-98, 4,861 women genotyped, no association with breast cancer-free interval and poor or intermediate metabolisers if anything doing marginally better; in ATAC, 1,203 genotyped, no significant association with recurrence after a median ten years. Both papers conclude the results do not support using genotype to predict benefit. Strong CYP2D6-inhibiting drugs are still generally avoided where an alternative exists, which is a smaller and different claim.',
      },
      {
        q: 'Five years or ten?',
        a: 'Ten is better on the trial evidence and the benefit is slow to arrive. ATLAS randomised 12,894 women who had already completed five years to continue or stop. Continuing reduced recurrence (617 against 711), breast cancer deaths (331 against 397) and overall deaths (639 against 722). But look at when: during years 5 to 9 the breast cancer mortality rate ratio was 0.97 — essentially nothing — and it was 0.71 only afterwards. Meanwhile the harms accrue throughout: endometrial cancer rate ratio 1.74 and pulmonary embolus 1.87. Over years 5 to 14, breast cancer mortality fell 2.8 percentage points in absolute terms and endometrial cancer mortality rose 0.2. That trade is favourable and it is not automatic, and it depends on how high your recurrence risk is.',
      },
      {
        q: 'I do not have cancer. Should I take it to prevent one?',
        a: 'That is a genuinely different question from the treatment one, and the evidence answers it less completely. IBIS-I randomised 7,154 women at increased risk and found breast cancer in 7.0% on tamoxifen against 9.8% on placebo after a median sixteen years — a hazard ratio of 0.71, concentrated entirely in receptor-positive disease, with protection persisting after the five years of tablets ended. The endpoint there is incidence. The prevention trials have not shown a reduction in deaths from breast cancer, and the US Preventive Services Task Force gives a B recommendation to offer these drugs specifically to women at increased risk who are also at low risk of adverse effects — while recommending against routine use in women not at increased risk. Their evidence review also found that the tools used to decide who is at increased risk discriminate poorly between individual women, with areas under the curve of 0.55 to 0.65.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'SOLTAMOX (tamoxifen citrate) United States prescribing information — boxed warning, Indications 1.1 to 1.4, Warnings and Precautions 5.1 and 5.2, Mechanism of Action 12.1, Pharmacokinetics 12.3',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=tamoxifen+citrate',
        kind: 'regulatory',
      },
      {
        label:
          'Early Breast Cancer Trialists’ Collaborative Group. Relevance of breast cancer hormone receptors and other factors to the efficacy of adjuvant tamoxifen: patient-level meta-analysis of randomised trials. Lancet 2011;378:771-784',
        identifier: '10.1016/S0140-6736(11)60993-8',
        kind: 'doi',
      },
      {
        label:
          'Davies C, Pan H, Godwin J, et al. Long-term effects of continuing adjuvant tamoxifen to 10 years versus stopping at 5 years (ATLAS). Lancet 2013;381:805-816',
        identifier: '10.1016/S0140-6736(12)61963-1',
        kind: 'doi',
      },
      {
        label:
          'Cuzick J, Sestak I, Cawthorn S, et al. Tamoxifen for prevention of breast cancer: extended long-term follow-up of the IBIS-I breast cancer prevention trial. Lancet Oncol 2015;16:67-75',
        identifier: '10.1016/S1470-2045(14)71171-4',
        kind: 'doi',
      },
      {
        label:
          'Regan MM, Leyland-Jones B, Bouzyk M, et al. CYP2D6 genotype and tamoxifen response in postmenopausal women with endocrine-responsive breast cancer: the Breast International Group 1-98 trial. J Natl Cancer Inst 2012;104:441-451',
        identifier: '10.1093/jnci/djs125',
        kind: 'doi',
      },
      {
        label:
          'Rae JM, Drury S, Hayes DF, et al. CYP2D6 and UGT2B7 genotype and risk of recurrence in tamoxifen-treated breast cancer patients. J Natl Cancer Inst 2012;104:452-460',
        identifier: '10.1093/jnci/djs126',
        kind: 'doi',
      },
      {
        label:
          'Nelson HD, Fu R, Zakher B, Pappas M, McDonagh M. Medication use for the risk reduction of primary breast cancer in women: updated evidence report and systematic review for the US Preventive Services Task Force. JAMA 2019;322:868-886',
        identifier: '10.1001/jama.2019.5780',
        kind: 'doi',
      },
      {
        label:
          'US Preventive Services Task Force. Medication use to reduce risk of breast cancer: US Preventive Services Task Force recommendation statement. JAMA 2019;322:857-867',
        identifier: '10.1001/jama.2019.11885',
        kind: 'doi',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — tamoxifen (15 listed generic products), anastrozole, letrozole and raloxifene, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 2733526 — tamoxifen structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2733526',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 7. Cefdinir — a third-generation cephalosporin licensed only against the pneumococci that
  //    penicillin already kills, that lost its own head-to-head trial on the label, and whose
  //    commonest use is a childhood infection that mostly gets better on its own.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'cefdinir',
    name: 'Cefdinir',
    tradeName: 'Omnicef',
    sponsor:
      'AbbVie (successor to the Abbott registration for Omnicef); originated at Fujisawa in Japan; generic in the United States since 2007 and made by many manufacturers',
    targetGene:
      'The bacterial penicillin-binding protein genes — pbp1a, pbp2b, pbp2x and their homologues',
    targetProtein:
      'Bacterial penicillin-binding proteins, the transpeptidases that cross-link peptidoglycan in the cell wall',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1997,
    indication:
      'In adults and adolescents: community-acquired pneumonia, acute exacerbations of chronic bronchitis and acute maxillary sinusitis caused by Haemophilus influenzae, Haemophilus parainfluenzae, penicillin-susceptible Streptococcus pneumoniae and Moraxella catarrhalis; pharyngitis and tonsillitis caused by Streptococcus pyogenes; and uncomplicated skin and skin structure infections. In children: acute bacterial otitis media, pharyngitis and tonsillitis, and uncomplicated skin infections, with the same organism restrictions',
    patientFriendlyIndication:
      'Ear infections in children, and chest, sinus, throat and skin infections',
    anatomicalSite:
      'The bacterial cell wall — the transpeptidase active site where peptidoglycan strands are cross-linked',
    conditionContext: {
      conditionExplainer:
        'Acute otitis media is fluid and infection behind the eardrum, usually following a cold that has blocked the tube draining the middle ear. It is painful, extremely common in small children, and in high-income countries it resolves without antibiotics in most cases — which is what makes the treatment decision genuinely difficult rather than obvious.',
      whyItMatters:
        'Cefdinir became one of the most prescribed antibiotics in American paediatrics because it is taken twice or once daily, tastes tolerable and covers beta-lactamase-producing organisms. Its label restricts every respiratory indication to penicillin-susceptible pneumococcus, records that it lost a head-to-head trial against amoxicillin-clavulanate, and states plainly that only intramuscular penicillin has been shown to prevent rheumatic fever.',
      whoTakesThis:
        'Children with acute otitis media or streptococcal pharyngitis, and adults with sinusitis, bronchitis exacerbation, community-acquired pneumonia or uncomplicated skin infection.',
      clinicalGoals:
        'Clinical cure and eradication of the organism. In otitis media specifically, the pooled randomised evidence says the achievable goal is faster pain relief in a minority of children, not prevention of complications.',
    },
    oneSentenceVerdict:
      'An oral third-generation cephalosporin whose label limits every respiratory indication to penicillin-susceptible Streptococcus pneumoniae, whose absolute bioavailability is 16 to 25%, and which its own Clinical Studies section records as "not equivalent to control" against amoxicillin-clavulanate in a European pneumonia trial (80% against 89% clinical cure) — while beating penicillin on streptococcal eradication in children, 94% against 70%, on a surrogate the same label says has never been linked to rheumatic fever prevention for this drug.',
    laymanHowItWorks:
      'Bacteria hold themselves together with a mesh called peptidoglycan, and they have to keep stitching new mesh as they grow. Cefdinir jams the enzymes that make those stitches, so a dividing bacterium builds a wall it cannot close and bursts under its own internal pressure. Its particular chemistry adds a side group that resists the enzymes some bacteria use to destroy penicillins, which is why it covers organisms amoxicillin alone does not. The catch is that only about a fifth of a swallowed dose reaches the bloodstream, and iron in a supplement or a fortified cereal will bind most of what is left in the gut.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 61,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.4593 per 300 mg capsule at United States pharmacy acquisition cost (CMS NADAC, median across 9 listed generic products, survey effective 19 August 2026); the paediatric oral suspension runs at US$0.1134 per mL across 16 listed generic products in the same survey',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States in 1997 as Omnicef and generic since 2007. It is not on the WHO Model List of Essential Medicines, and the WHO AWaRe classification places oral third-generation cephalosporins in the Watch group — antibiotics with higher resistance potential whose use is to be monitored, in contrast to amoxicillin, which is in the Access group.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'For the indication that accounts for most cefdinir prescriptions — acute otitis media in a child — the two honest comparators are high-dose amoxicillin and no antibiotic at all. Amoxicillin is a quarter of the price per capsule, is in the WHO Access group rather than the Watch group, and is what the American Academy of Pediatrics guideline names first. Watchful waiting is what the pooled randomised evidence supports for many children, since antibiotics do not reduce pain at 24 hours and increase vomiting, diarrhoea and rash.',
      conventionalRx: [
        {
          name: 'Amoxicillin, at high dose',
          class: 'Aminopenicillin',
          howItCompares:
            'Named first-line for acute otitis media in the 2013 American Academy of Pediatrics guideline in children who have not had amoxicillin in the previous 30 days and have no concurrent purulent conjunctivitis or penicillin allergy. It is narrower in spectrum, better absorbed, and it retains activity against pneumococci with reduced penicillin susceptibility at high dose — precisely the organisms cefdinir’s label excludes from its indications.',
          typicalCost:
            'US$0.0783 per capsule or tablet (47 listed generic products) and US$0.0338 per mL of suspension (51 listed generic products) at United States pharmacy acquisition cost (CMS NADAC, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: about a sixth of the capsule price; WHO Access group; the pneumococcal coverage cefdinir does not claim. Cons: no activity against beta-lactamase-producing Haemophilus or Moraxella; three times daily; unusable in true penicillin allergy.',
        },
        {
          name: 'Amoxicillin-clavulanate',
          class: 'Aminopenicillin plus beta-lactamase inhibitor',
          howItCompares:
            'Covers the beta-lactamase producers cefdinir was reached for, and retains the high-dose amoxicillin pneumococcal coverage cefdinir lacks. In the European community-acquired pneumonia trial reported in cefdinir’s own label, amoxicillin-clavulanate gave 89% clinical cure against cefdinir’s 80%, and the label records the outcome as "cefdinir not equivalent to control".',
          typicalCost:
            'US$0.2856 per tablet (40 listed generic products) and US$0.0636 per mL of suspension (66 listed generic products) at United States pharmacy acquisition cost (CMS NADAC, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: beat cefdinir head-to-head on the label; broader pneumococcal cover. Cons: markedly more diarrhoea; three times daily in the standard formulation.',
        },
        {
          name: 'Watchful waiting with analgesia',
          class: 'Delayed or no antibiotic prescribing for acute otitis media',
          howItCompares:
            'The Cochrane review of 13 placebo-controlled trials in 3,401 children found antibiotics do not reduce pain at 24 hours (RR 0.89, 95% CI 0.78 to 1.01, high certainty), reduce pain at two to three days with a number needed to treat of 20, and increase vomiting, diarrhoea or rash with a number needed to harm of 14. Serious complications were rare and did not differ.',
          typicalCost: 'Analgesia only',
          prosAndCons:
            'Pros: no antibiotic adverse events, no resistance selection, no cost. Cons: a minority of children do benefit and identifying them in advance is imperfect; the pooled evidence comes from high-income countries and does not transfer to settings where mastoiditis remains common.',
        },
      ],
      naturalFoods: [
        {
          name: 'Xylitol chewing gum or syrup, for preventing ear infections',
          activeCompound:
            'Xylitol, a five-carbon sugar alcohol that Streptococcus pneumoniae cannot ferment',
          biologicalMechanism:
            'Xylitol inhibits pneumococcal growth and adherence to nasopharyngeal cells. It is a prevention hypothesis, not a treatment, and it has nothing to do with an infection already present.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'Not stated here as advice. For scale only: the randomised trials are mostly in Finnish day-care children, used dosing schedules of five times daily that proved difficult to sustain, and the effect was not maintained when compliance fell. Nothing here should be read as a substitute for treating an infection.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Keep iron two hours away from the dose',
          action:
            'Do not give it at the same time as an iron supplement, an iron-containing multivitamin, or an antacid.',
          patientImpact:
            'The label records that a therapeutic iron supplement containing 60 mg of elemental iron reduced the extent of cefdinir absorption by 80%, and a vitamin with 10 mg by 31%; an aluminium or magnesium antacid reduced both peak level and total exposure by about 40%. It directs a two-hour separation in each case. Iron-fortified infant formula, at 2.2 mg per six ounces, has no significant effect and can be given together.',
          clinicalPrecaution:
            'A drug with 21% bioavailability that loses 80% of that to a vitamin tablet is a treated infection that was never actually treated. This is an efficacy interaction, not a safety one.',
        },
        {
          name: 'Red stools are almost always the iron, not blood',
          action:
            'If stools turn reddish during a course, mention it — but know what the label says before panicking.',
          patientImpact:
            'The label states there have been reports of reddish stools in patients receiving cefdinir, that in many cases patients were also receiving iron-containing products, and that the reddish colour is due to a non-absorbable complex formed between cefdinir or its breakdown products and iron in the gastrointestinal tract.',
          clinicalPrecaution:
            'This is a documented benign chemical reaction that has repeatedly prompted emergency assessment for gastrointestinal bleeding in infants. It should still be reported, because the label statement does not diagnose any individual case.',
        },
        {
          name: 'Expect diarrhoea, and know when it is not ordinary',
          action:
            'Loose stools are common. Watery, persistent or bloody diarrhoea, especially with fever, is different.',
          patientImpact:
            'Diarrhoea occurred in 15% of 3,841 adults and adolescents in the United States capsule trials, and was the commonest reason for discontinuation. The label separately carries the Clostridioides difficile-associated diarrhoea warning common to antibacterials.',
          clinicalPrecaution:
            'The label notes C. difficile-associated diarrhoea has been reported to occur over two months after antibacterial administration, so a careful history matters after the course has finished.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C=CC1=C(N2[C@@H]([C@@H](C2=O)NC(=O)/C(=N\\O)/C3=CSC(=N3)N)SC1)C(=O)O',
      chemicalFormula: 'C14H13N5O5S2',
      molecularWeight: '395.40 g/mol',
      targetReceptorAffinity:
        'An oral third-generation cephalosporin carrying an aminothiazolyl group and a syn-hydroxyimino (oxime) side chain, the two features that confer stability against many beta-lactamases, plus a vinyl group at C-3. Absorption is poor and saturable: estimated bioavailability of capsules is 21% at 300 mg and 16% at 600 mg, with the suspension at 25% absolute and 120% relative to capsules. Peak plasma concentration comes at 2 to 4 hours; a 300 mg capsule gives Cmax 1.6 mcg/mL (SD 0.55) and AUC 7.05 mcg·h/mL. Plasma protein binding is 60 to 70% and independent of concentration; volume of distribution is 0.35 L/kg in adults and 0.67 L/kg in children. The drug does not accumulate on once- or twice-daily dosing in normal renal function.',
      structureSource: {
        label:
          'PubChem CID 6915944 (cefdinir) — canonical SMILES, molecular formula and weight, as carried on the enriched record; bioavailability, pharmacokinetics and protein binding from the cefdinir label, Clinical Pharmacology',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/6915944',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'cfd-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the syn oxime geometry and the intact beta-lactam',
          description:
            'Two features carry the whole molecule: an intact four-membered beta-lactam ring, and the syn configuration of the hydroxyimino side chain. The anti isomer loses most of its beta-lactamase stability, and a hydrolysed ring is not an antibiotic at all — it is the degradation product that also carries the immunological cross-reactivity risk. Both are quality attributes, not academic ones.',
          reagentsAndBuffer:
            'Cefdinir reference standard, reverse-phase HPLC with UV detection at 254 nm, NMR to confirm syn oxime geometry, infrared confirmation of the beta-lactam carbonyl near 1760 cm⁻¹, limit tests for the open-ring hydrolysis product',
        },
        {
          id: 'cfd-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Acylate the 7-amino nucleus with the aminothiazolyl oxime acid',
          description:
            'Cefdinir is built by acylating a 7-amino-3-vinyl-cephalosporanic acid nucleus with an activated 2-(2-aminothiazol-4-yl)-2-(hydroxyimino)acetic acid. The oxime and the thiazole amine both need protection, and every deprotection is an opportunity to open the beta-lactam, so the sequence is constrained to mild conditions throughout.',
          dependsOnStepId: 'cfd-w1',
          reagentsAndBuffer:
            '7-amino-3-vinyl-cephalosporanic acid, activated ester or thioester of the protected aminothiazolyl oxime acid, trityl and silyl protecting groups, mild acid deprotection, low temperature and controlled pH',
        },
        {
          id: 'cfd-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallise a poorly absorbed acid and control its metal chelates',
          description:
            'Cefdinir chelates iron avidly enough that a vitamin tablet removes four-fifths of the absorbed dose, and the same chemistry produces the reddish non-absorbable complex reported in stools. Residual process metals therefore matter twice: as impurities and as a predictor of formulation behaviour. Crystal form and particle size govern dissolution of a molecule that already only manages a fifth absorption.',
          dependsOnStepId: 'cfd-w2',
          reagentsAndBuffer:
            'Controlled-pH crystallisation from aqueous alcohol, ICP-MS for residual iron, aluminium and magnesium, X-ray powder diffraction for polymorph identity, dissolution testing in simulated gastric and intestinal fluid',
        },
        {
          id: 'cfd-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Test against penicillin-nonsusceptible pneumococcus, not just susceptible strains',
          description:
            'The label restricts every respiratory indication to penicillin-susceptible Streptococcus pneumoniae. The experiment that establishes why is a minimum inhibitory concentration panel run against a graded set of pneumococci by penicillin susceptibility: the MIC rises with penicillin-binding protein alteration, because cefdinir binds the same altered proteins less well. A panel of susceptible strains alone will report excellent activity and predict nothing about the clinically difficult organism.',
          dependsOnStepId: 'cfd-w3',
          reagentsAndBuffer:
            'Cation-adjusted Mueller-Hinton broth with lysed horse blood, CLSI broth microdilution, a graded panel of Streptococcus pneumoniae from fully penicillin-susceptible to fully resistant, beta-lactamase-positive Haemophilus influenzae and Moraxella catarrhalis as the comparison arm',
        },
        {
          id: 'cfd-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Measure free drug time above MIC at the actual site of infection',
          description:
            'Beta-lactam efficacy tracks the fraction of the dosing interval during which free drug exceeds the MIC, not the peak concentration. With 21% bioavailability, 60 to 70% protein binding and a Cmax of 1.6 mcg/mL, that fraction is the number that decides whether the drug works — and it should be computed in middle ear fluid or skin blister fluid, not in plasma. The label reports median skin blister concentrations of 0.65 to 1.1 mcg/mL, which is the right kind of measurement.',
          dependsOnStepId: 'cfd-w4',
          reagentsAndBuffer:
            'Suction-induced skin blister or middle ear fluid sampling, LC-MS/MS quantification of total and ultrafiltrable cefdinir, equilibrium dialysis for protein binding, MIC distribution of contemporary clinical isolates for the pharmacodynamic target calculation',
        },
      ],
    },
    keyAudits: [
      {
        id: 'cfd-a1',
        category: 'inferred',
        title: 'Every respiratory indication is limited to penicillin-susceptible pneumococcus',
        laymanSummary:
          'Cefdinir is reached for as a stronger alternative to penicillin. Its label licenses it against pneumococcus only where penicillin still works — which is the situation in which the cheaper, narrower drug would have worked too.',
        technicalDetails:
          'The Indications and Usage section attaches the same parenthesis to Streptococcus pneumoniae in community-acquired pneumonia, acute exacerbations of chronic bronchitis, acute maxillary sinusitis and paediatric acute bacterial otitis media: "(penicillin-susceptible strains only)". The pharmacological reason is that reduced penicillin susceptibility in pneumococcus is caused by mosaic alterations in the penicillin-binding proteins, and those same altered proteins bind cefdinir less well; beta-lactamase stability, which is what cefdinir’s aminothiazolyl-oxime chemistry buys, is irrelevant because pneumococcus does not make beta-lactamase. Where cefdinir genuinely adds coverage is against beta-lactamase-producing Haemophilus influenzae and Moraxella catarrhalis, and the label says so by including those with the qualifier "(including β-lactamase producing strains)". The inference the label blocks is the common one: that a later-generation cephalosporin is a stronger version of amoxicillin against the organism that matters most in these infections.',
        evidenceSource:
          'Cefdinir United States prescribing information, Indications and Usage (Omnicef, NDA 050739 / 050749)',
        inferredClaim:
          'That a third-generation oral cephalosporin covers resistant pneumococcus better than high-dose amoxicillin — the label restricts its pneumococcal indications to penicillin-susceptible strains only',
        auditFlag: 'contested',
      },
      {
        id: 'cfd-a2',
        category: 'failed',
        title: 'It lost a head-to-head trial, and the result is printed on its own label',
        laymanSummary:
          'In a European pneumonia trial against amoxicillin-clavulanate, cefdinir cured 80% against 89%. The label reports the outcome in three words: "cefdinir not equivalent to control".',
        technicalDetails:
          'The Clinical Studies section reports two community-acquired pneumonia trials. In a United States double-blind trial against cefaclor, clinical cure was 150 of 187 (80%) with cefdinir twice daily against 147 of 186 (79%) with cefaclor three times daily, and the label records "cefdinir equivalent to control". In a second, investigator-blind trial conducted primarily in Europe against amoxicillin-clavulanate 500/125 mg three times daily, clinical cure was 83 of 104 (80%) against 86 of 97 (89%) and the label records "cefdinir not equivalent to control" — a documented non-inferiority failure against the comparator most likely to be used instead of it. Microbiological eradication was recorded as equivalent (89% against 93%), so the two endpoints disagree in the same trial. Pneumococcal eradication was near-identical (95% against 98%); Haemophilus influenzae eradication was 74% against 81%. A label that publishes a trial its own drug lost is doing something unusual and correct, and it is a result almost nobody prescribing the drug has read.',
        evidenceSource:
          'Cefdinir United States prescribing information, Clinical Studies — Community-Acquired Bacterial Pneumonia',
        measuredMetric:
          'Clinical cure rate against amoxicillin-clavulanate in community-acquired pneumonia, with the label’s own equivalence determination',
        auditFlag: 'caution',
      },
      {
        id: 'cfd-a3',
        category: 'measured',
        title: 'It clears strep throat better than penicillin — on a surrogate',
        laymanSummary:
          'In children, cefdinir eradicated the streptococcus from the throat in 94% against penicillin’s 70%. The same label then says cefdinir has never been studied for preventing rheumatic fever, and that only injected penicillin has been shown to do that.',
        technicalDetails:
          'Four controlled United States studies compared cefdinir with ten days of penicillin. In adults and adolescents, eradication of S. pyogenes was 192 of 210 (91%) once daily and 199 of 217 (92%) twice daily against 181 of 217 (83%) on penicillin four times daily, with clinical cure 95% and 96% against 89% — recorded as "cefdinir superior to control". In children the gap was larger: eradication 215 of 228 (94%) and 214 of 227 (94%) against 159 of 227 (70%), clinical cure 97% and 96% against 86%, again superior. Then the Indications section adds, twice: "Cefdinir is effective in the eradication of S. pyogenes from the oropharynx. Cefdinir has not, however, been studied for the prevention of rheumatic fever following S. pyogenes pharyngitis/tonsillitis. Only intramuscular penicillin has been demonstrated to be effective for the prevention of rheumatic fever." This is a textbook surrogate-versus-outcome separation stated inside a single regulatory document: the drug is measurably better at the laboratory endpoint and has no evidence at all on the clinical endpoint that is the reason for treating the infection. Note also what the comparator was — penicillin four times daily for ten days — and what adherence to that regimen looks like outside a trial.',
        evidenceSource:
          'Cefdinir United States prescribing information, Indications and Usage and Clinical Studies — Streptococcal Pharyngitis/Tonsillitis',
        measuredMetric:
          'Bacteriological eradication of Streptococcus pyogenes and clinical cure against oral penicillin, with rheumatic fever prevention unstudied',
        auditFlag: 'contested',
      },
      {
        id: 'cfd-a4',
        category: 'failed',
        title: 'One fifth of the dose gets in, and a vitamin removes most of that',
        laymanSummary:
          'Absolute bioavailability is 16 to 25%, and it falls as the dose rises. An iron supplement taken at the same time cuts absorption by a further 80%.',
        technicalDetails:
          'The label states that plasma concentrations increase less than dose-proportionally from 300 mg to 600 mg, that estimated bioavailability of capsules is 21% at 300 mg and 16% at 600 mg, and that estimated absolute bioavailability of the suspension is 25%. Concomitant iron at 60 mg of elemental iron reduced the extent of absorption by 80%, and a 10 mg vitamin by 31%; an aluminium or magnesium antacid reduced Cmax and AUC by about 40%, with a two-hour separation directed in each case. A high-fat meal reduces suspension Cmax and AUC by 44% and 33%. The consequence is a narrow and fragile exposure: peak plasma concentration after a 300 mg capsule is 1.6 mcg/mL with 60 to 70% protein binding, and beta-lactam efficacy depends on how long free drug stays above the organism’s MIC. There is not much headroom in that calculation, and an interaction that removes four-fifths of the absorbed dose does not announce itself — it presents as a treatment failure.',
        evidenceSource:
          'Cefdinir United States prescribing information, Clinical Pharmacology — Absorption, Effect of Food, and Drug Interactions',
        measuredMetric:
          'Absolute oral bioavailability, dose-proportionality, and reduction in absorption with iron, antacid and food',
        auditFlag: 'caution',
      },
      {
        id: 'cfd-a5',
        category: 'conclusion_shift',
        title: 'The commonest reason to prescribe it is an infection that mostly resolves anyway',
        laymanSummary:
          'Pooled randomised trials in 3,401 children found antibiotics do not reduce ear pain at 24 hours, help about one child in twenty at two to three days, and cause vomiting, diarrhoea or rash in about one in fourteen.',
        technicalDetails:
          'A Cochrane review of 13 placebo-controlled trials in 3,401 children from high-income countries, assessed at generally low risk of bias, found antibiotics do not reduce pain at 24 hours (RR 0.89, 95% CI 0.78 to 1.01, high-certainty evidence) or at four to seven days (RR 0.76, 0.50 to 1.14), but result in almost a third fewer children having pain at two to three days (RR 0.71, 0.58 to 0.88; number needed to treat 20, high certainty). They increase vomiting, diarrhoea or rash (RR 1.38, 1.16 to 1.63; number needed to harm 14, high certainty). They reduce abnormal tympanometry at two to four weeks (NNT 11) but not at six to eight weeks or three months, reduce tympanic perforation (NNT 33), halve contralateral otitis (NNT 11), and do not reduce late recurrences. Serious complications were rare and did not differ between antibiotic and placebo. The 2013 American Academy of Pediatrics guideline responded by making observation with close follow-up an explicit option for many children and naming high-dose amoxicillin first where an antibiotic is used. Cefdinir sits below both of those in the guideline sequence, and above both in prescribing volume.',
        evidenceSource:
          'Venekamp RP, Sanders SL, Glasziou PP, Rovers MM. Antibiotics for acute otitis media in children. Cochrane Database Syst Rev 2023;11:CD000219; Lieberthal AS, Carroll AE, Chonmaitree T, et al. The diagnosis and management of acute otitis media. Pediatrics 2013;131:e964-e999',
        doi: '10.1002/14651858.CD000219.pub5',
        measuredMetric:
          'Pain at 24 hours, 2 to 3 days and 4 to 7 days, adverse events, and serious complications with antibiotics against placebo in acute otitis media',
        auditFlag: 'verified',
      },
      {
        id: 'cfd-a6',
        category: 'measured',
        title: 'Diarrhoea in 15% of adults, and it is the reason people stop',
        laymanSummary:
          'Across nearly four thousand adults in the United States trials, fifteen per cent had diarrhoea. It was the commonest reason for stopping the drug.',
        technicalDetails:
          'In the United States capsule trials with 3,841 cefdinir-treated adults and adolescents, diarrhoea occurred in 15%, vaginal candidiasis in 4% of women, nausea in 3%, headache in 2% and abdominal pain in 1%. One hundred and forty-seven of 5,093 patients (3%) discontinued for adverse events attributed to the drug, primarily gastrointestinal, usually diarrhoea or nausea, and 19 of 5,093 (0.4%) for rash. The label states most adverse events were mild and self-limiting and that no deaths or permanent disabilities were attributed to cefdinir. This is a favourable safety profile in absolute terms; it is worth setting beside the Cochrane number needed to harm of 14 for vomiting, diarrhoea or rash in the paediatric otitis media population, because in a condition where the number needed to treat for pain relief is 20, an adverse event rate of this size is not a footnote to the benefit calculation — it is most of it.',
        evidenceSource:
          'Cefdinir United States prescribing information, Adverse Events — Clinical Trials, Cefdinir Capsules (Adult and Adolescent Patients)',
        measuredMetric:
          'Incidence of adverse events and discontinuation in 5,093 adult and adolescent trial patients',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Most of the dose never gets in',
        laymanDesc:
          'Only about a fifth of a swallowed capsule reaches the bloodstream, and the fraction gets smaller as the dose gets bigger.',
        molecularDetail:
          'Estimated bioavailability is 21% for a 300 mg capsule and 16% for 600 mg; the suspension is 25% absolute and 120% relative to capsules. Peak concentration comes at 2 to 4 hours; a 300 mg capsule gives Cmax 1.6 mcg/mL and AUC 7.05 mcg·h/mL. The drug does not accumulate on once- or twice-daily dosing with normal renal function.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Iron in the gut takes most of the rest',
        laymanDesc:
          'The molecule grips iron. A supplement taken at the same time removes four-fifths of what would have been absorbed, and the complex it forms turns stools red.',
        molecularDetail:
          'Sixty milligrams of elemental iron reduced the extent of absorption by 80%; a 10 mg vitamin by 31%; an aluminium or magnesium antacid reduced Cmax and AUC by about 40%. The label attributes reported reddish stools to a non-absorbable complex between cefdinir or its breakdown products and gastrointestinal iron. Iron-fortified infant formula at 2.2 mg per six ounces has no significant effect.',
        iconName: 'Magnet',
        visualStage: 'delivery',
      },
      {
        step: 3,
        title: 'It reaches the bacterium and resists its defence enzyme',
        laymanDesc:
          'Many bacteria carry an enzyme that chews up penicillins. The chemical group hanging off cefdinir gets in that enzyme’s way.',
        molecularDetail:
          'The aminothiazolyl group and the syn-hydroxyimino side chain sterically and electronically hinder hydrolysis by many beta-lactamases, which is why the label includes beta-lactamase-producing Haemophilus influenzae, Haemophilus parainfluenzae and Moraxella catarrhalis among the covered organisms. It confers nothing against pneumococcus, which resists beta-lactams by altering its penicillin-binding proteins rather than by making an enzyme.',
        iconName: 'Shield',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'It jams the enzymes that stitch the cell wall',
        laymanDesc:
          'The beta-lactam ring mimics the end of the peptide chain those enzymes normally grab, so they bind it and stay stuck.',
        molecularDetail:
          'The four-membered beta-lactam ring is a structural mimic of the D-alanyl-D-alanine terminus of the peptidoglycan precursor. Penicillin-binding protein transpeptidases attack it and form a stable acyl-enzyme intermediate that hydrolyses very slowly, so cross-linking stops. Altered penicillin-binding proteins in penicillin-nonsusceptible pneumococcus bind cefdinir poorly, which is why those strains are excluded from the label’s indications.',
        iconName: 'Scissors',
        visualStage: 'target_binding',
      },
      {
        step: 5,
        title: 'The growing bacterium bursts',
        laymanDesc:
          'A cell that is dividing but cannot close its wall fails under its own internal pressure. Cells that are not dividing are untouched.',
        molecularDetail:
          'Bactericidal activity is time-dependent, tracking the fraction of the dosing interval during which free drug exceeds the MIC rather than the peak concentration. With 60 to 70% protein binding and a Cmax of 1.6 mcg/mL, that fraction is the pharmacodynamic quantity that determines success. Median skin blister fluid concentrations were 0.65 to 1.1 mcg/mL after a 300 mg dose.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 6,
        title: 'The organism is eradicated — which is not the same as the outcome',
        laymanDesc:
          'It clears strep from the throat better than penicillin does. Whether it prevents rheumatic fever has never been tested, and the label says only injected penicillin has been shown to.',
        molecularDetail:
          'Paediatric S. pyogenes eradication 94% against 70% on oral penicillin, clinical cure 96 to 97% against 86%, recorded as superior. Indications section: "Cefdinir has not, however, been studied for the prevention of rheumatic fever following S. pyogenes pharyngitis/tonsillitis. Only intramuscular penicillin has been demonstrated to be effective for the prevention of rheumatic fever."',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'European community-acquired pneumonia study, cefdinir against amoxicillin/clavulanate (cefdinir label, Clinical Studies)',
        phase: 'Controlled, investigator-blind, comparator-controlled registration study',
        sampleSize: 201,
        primaryEndpoint:
          'Clinical cure rate 6 to 14 days post-therapy in community-acquired pneumonia, cefdinir twice daily against amoxicillin/clavulanate 500/125 mg three times daily',
        endpointMet: false,
        statisticalPValue:
          '83 of 104 (80%) against 86 of 97 (89%); the label records the outcome as "cefdinir not equivalent to control"',
        unreportedAdverseSignals:
          'Microbiological eradication was recorded as equivalent (89% against 93%) in the same trial, so the clinical and bacteriological endpoints disagree. Haemophilus influenzae eradication was 74% against 81%.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'Paediatric streptococcal pharyngitis/tonsillitis study, cefdinir 10 days against penicillin 10 days (cefdinir label, Clinical Studies)',
        phase: 'Controlled comparator study in paediatric patients',
        sampleSize: 682,
        primaryEndpoint:
          'Eradication of Streptococcus pyogenes from the oropharynx and clinical cure 5 to 10 days post-therapy',
        endpointMet: true,
        statisticalPValue:
          'Eradication 215 of 228 (94%) once daily and 214 of 227 (94%) twice daily against 159 of 227 (70%) on penicillin four times daily; clinical cure 97% and 96% against 86%; the label records "cefdinir superior to control"',
        unreportedAdverseSignals:
          'The endpoint is bacteriological eradication, a surrogate. The same label states cefdinir has not been studied for prevention of rheumatic fever and that only intramuscular penicillin has been demonstrated effective for that. The comparator was oral penicillin four times daily for ten days, a regimen whose real-world adherence is poor.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId:
          'Venekamp RP et al., Cochrane Database Syst Rev 2023;11:CD000219 (antibiotics against placebo in acute otitis media)',
        phase: 'Systematic review and meta-analysis of 13 placebo-controlled randomised trials',
        sampleSize: 3401,
        primaryEndpoint:
          'Pain at 24 hours, 2 to 3 days and 4 to 7 days in children with acute otitis media, antibiotics against placebo',
        endpointMet: false,
        statisticalPValue:
          'Pain at 24 hours RR 0.89 (95% CI 0.78 to 1.01, high certainty) — no reduction. Pain at 2 to 3 days RR 0.71 (0.58 to 0.88), number needed to treat 20. Pain at 4 to 7 days RR 0.76 (0.50 to 1.14)',
        unreportedAdverseSignals:
          'Antibiotics increase vomiting, diarrhoea or rash (RR 1.38, 95% CI 1.16 to 1.63; number needed to harm 14, high certainty). No reduction in abnormal tympanometry at six to eight weeks or three months, and none in late recurrences. Serious complications were rare and did not differ between arms.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Streptococcus pyogenes eradication 94% against 70% on oral penicillin in children, with clinical cure 96 to 97% against 86%',
        'Clinical cure 80% against 89% for amoxicillin/clavulanate in the European pneumonia trial, recorded on the label as not equivalent to control',
        'Absolute oral bioavailability of 21% at 300 mg, 16% at 600 mg and 25% for the suspension, with an 80% reduction in absorption when taken with 60 mg of elemental iron',
        'Diarrhoea in 15% of 3,841 adults and adolescents, with 3% discontinuing for adverse events',
      ],
      unsupportedInferences: [
        'That a third-generation cephalosporin covers resistant pneumococcus better than amoxicillin — every pneumococcal indication on the label reads "penicillin-susceptible strains only"',
        'That superior throat eradication means superior prevention of rheumatic fever, which the label states has not been studied for this drug',
        'That treating acute otitis media with an antibiotic prevents complications; the pooled trials found serious complications rare and no different from placebo',
        'That a bacteriological endpoint and a clinical endpoint agree — in the label’s own pneumonia trial, eradication was equivalent and clinical cure was not',
      ],
      whatFailedInitially: [
        'The European community-acquired pneumonia trial against amoxicillin/clavulanate, recorded on the label as "cefdinir not equivalent to control"',
        'Bioavailability is 16 to 25% and falls with increasing dose, and is reduced by a further 80% by an ordinary iron supplement',
        'Antibiotics in acute otitis media do not reduce pain at 24 hours, and increase adverse events with a number needed to harm of 14 against a number needed to treat of 20',
        'Reddish stools from an iron-cefdinir complex have repeatedly triggered emergency assessment for gastrointestinal bleeding in infants',
      ],
      realWorldOutcome: [
        'Approved in the United States in 1997 as Omnicef and generic since 2007, at about forty-six United States cents per 300 mg capsule at pharmacy acquisition cost',
        'Not on the WHO Model List of Essential Medicines; oral third-generation cephalosporins sit in the WHO AWaRe Watch group while amoxicillin sits in Access',
        'Became one of the most prescribed paediatric antibiotics in the United States on palatability and dosing convenience rather than on comparative outcome evidence',
        'The 2013 American Academy of Pediatrics otitis media guideline names high-dose amoxicillin first and makes observation an explicit option, placing cefdinir below both',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule at 300 mg and oral suspension at 125 and 250 mg per 5 mL — taken once or twice daily, with or without food',
      description:
        'Absorption is poor and saturable, at an estimated 21% for a 300 mg capsule, 16% for 600 mg and 25% for the suspension, with peak plasma concentrations at 2 to 4 hours. A high-fat meal reduces suspension Cmax and AUC by 44% and 33%, which the label judges not clinically significant because the paediatric efficacy studies were conducted without regard to food. Protein binding is 60 to 70%, independent of concentration; volume of distribution is 0.35 L/kg in adults and 0.67 L/kg in children. Elimination is renal and the drug does not accumulate on once- or twice-daily dosing in normal renal function; probenecid roughly doubles exposure.',
      safetyProfile:
        'Most adverse events in the registration programme were mild and self-limiting, and the label states no deaths or permanent disabilities were attributed to cefdinir. Diarrhoea occurred in 15% of adults and adolescents, vaginal candidiasis in 4% of women, nausea in 3%; 3% of 5,093 patients discontinued for adverse events, primarily gastrointestinal, and 0.4% for rash. Carries the Clostridioides difficile-associated diarrhoea warning common to antibacterials, which the label notes can present over two months after the course. Contraindicated in known cephalosporin allergy, with the standard caution about cross-reactivity in penicillin-allergic patients. Absorption is reduced 80% by iron supplements and about 40% by aluminium or magnesium antacids, with a two-hour separation directed; reddish stools reflect a non-absorbable cefdinir-iron complex rather than bleeding.',
    },
    commonQuestions: [
      {
        q: 'Is this stronger than amoxicillin?',
        a: 'Broader, in a specific and limited way, and not stronger against the organism that matters most. Cefdinir covers beta-lactamase-producing Haemophilus influenzae and Moraxella catarrhalis, which plain amoxicillin does not. Against Streptococcus pneumoniae, its label licenses it for "penicillin-susceptible strains only" in every respiratory indication, because pneumococcal resistance works by altering the very proteins cefdinir binds — so the drug is licensed against exactly the pneumococci amoxicillin would also have handled. High-dose amoxicillin, by contrast, retains activity against many pneumococci with reduced susceptibility. And in the one trial on cefdinir’s own label comparing it head-to-head with amoxicillin-clavulanate in pneumonia, cefdinir cured 80% against 89% and the label records it as not equivalent.',
        auditNote:
          'Generation number in a cephalosporin name describes the historical order of development and the Gram-negative spectrum, not potency against Gram-positive organisms — where the later generations are often weaker.',
      },
      {
        q: 'My child’s stool turned red. Is that blood?',
        a: 'Usually it is the drug. The label states there have been reports of reddish stools in patients receiving cefdinir, that in many cases those patients were also taking iron-containing products, and that the colour comes from a non-absorbable complex formed between cefdinir or its breakdown products and iron in the gut. This has repeatedly sent infants to emergency departments for suspected gastrointestinal bleeding. Report it anyway — a label statement about a class of cases does not diagnose any individual one — but know that there is a documented benign explanation.',
      },
      {
        q: 'Does my child need an antibiotic for an ear infection at all?',
        a: 'Often not, and the numbers are unusually clear. Pooled data from 13 placebo-controlled trials in 3,401 children found antibiotics do not reduce pain at 24 hours — high-certainty evidence, risk ratio 0.89 — and reduce pain at two to three days enough that one child in twenty benefits. They increase vomiting, diarrhoea or rash in about one child in fourteen. Serious complications were rare in both arms and did not differ. That is why the American Academy of Pediatrics guideline makes observation with close follow-up an explicit option for many children, and names high-dose amoxicillin first where an antibiotic is used. Some children clearly do benefit — the very young, those with severe symptoms or both ears affected — which is what the consultation is for.',
      },
      {
        q: 'Why must I keep it away from vitamins?',
        a: 'Because iron destroys the dose. Cefdinir already only manages about 21% absorption from a capsule, and taking it with a therapeutic iron supplement containing 60 mg of elemental iron reduces the extent of absorption by a further 80%; a multivitamin with 10 mg reduces it by 31%, and an aluminium or magnesium antacid cuts both peak and total exposure by around 40%. The label directs a two-hour separation. This is not a safety warning — it is an efficacy one, and the failure mode is silent: the infection simply does not respond, and nobody knows why. Iron-fortified infant formula is the exception; at 2.2 mg per six ounces the label says it has no significant effect.',
      },
      {
        q: 'It clears strep throat better than penicillin. Is it the better choice?',
        a: 'That depends entirely on which endpoint you care about. The trials on cefdinir’s label are striking: in children, it eradicated the streptococcus in 94% against penicillin’s 70%, and the label records it as superior. But the reason strep throat is treated at all in high-income countries is to prevent rheumatic fever, and the same label states, twice, that cefdinir has not been studied for that and that only intramuscular penicillin has been demonstrated to be effective for it. Eradicating an organism from a swab is a laboratory measurement; preventing rheumatic heart disease is a clinical one, and they are separated here by decades of evidence that exists for one drug and not the other. It is worth noticing what the comparator regimen was, too: oral penicillin four times daily for ten days, which few people complete.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Cefdinir capsules and oral suspension United States prescribing information — Indications and Usage, Clinical Pharmacology, Drug Interactions, Adverse Events, Clinical Studies (Omnicef)',
        identifier: 'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=cefdinir',
        kind: 'regulatory',
      },
      {
        label:
          'Venekamp RP, Sanders SL, Glasziou PP, Rovers MM. Antibiotics for acute otitis media in children. Cochrane Database Syst Rev 2023;11:CD000219',
        identifier: '10.1002/14651858.CD000219.pub5',
        kind: 'doi',
      },
      {
        label:
          'Lieberthal AS, Carroll AE, Chonmaitree T, et al. The diagnosis and management of acute otitis media. Pediatrics 2013;131:e964-e999',
        identifier: '10.1542/peds.2012-3488',
        kind: 'doi',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — cefdinir 300 mg capsules (9 listed generic products) and oral suspension (16 listed generic products), with amoxicillin and amoxicillin-clavulanate comparators, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 6915944 — cefdinir structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/6915944',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 8. Penicillin V — the oldest drug in this file, whose two great modern findings are that most
  //    people told they are allergic to it are not, and that the ten-day course was never tested.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'penicillin-v',
    name: 'Penicillin V',
    tradeName: 'Pen-Vee K / Veetids / V-Cillin K / Beepen-VK / Ledercillin VK',
    sponsor:
      'Originally Wyeth-Ayerst and Eli Lilly among others; the phenoxymethyl analogue of penicillin G entered United States use in the 1950s and has been generic for decades, made by many manufacturers',
    targetGene:
      'The bacterial penicillin-binding protein genes — pbp1a, pbp2b, pbp2x and their homologues',
    targetProtein:
      'Bacterial penicillin-binding proteins, the transpeptidases that cross-link peptidoglycan; the label describes it as inhibition of biosynthesis of cell-wall mucopeptide',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1958,
    indication:
      'Mild to moderately severe infections due to penicillin G-sensitive organisms: streptococcal infections without bacteraemia including mild-to-moderate upper respiratory infection, scarlet fever and mild erysipelas; mild to moderately severe pneumococcal respiratory infection; mild penicillin G-sensitive staphylococcal skin and soft tissue infection; and fusospirochetosis of the oropharynx. Also indicated for continuing prophylaxis against recurrence of rheumatic fever and chorea',
    patientFriendlyIndication:
      'Strep throat and other streptococcal infections, and long-term prevention of rheumatic fever coming back',
    anatomicalSite:
      'The bacterial cell wall — the transpeptidase active site, in an organism that is actively dividing',
    conditionContext: {
      conditionExplainer:
        'Group A streptococcal pharyngitis is a sore throat that mostly gets better by itself. The reason it is treated is a rare sequel: in a small proportion of untreated cases the immune response to the organism cross-reacts with heart valve tissue, producing acute rheumatic fever and, over years, rheumatic heart disease. That complication is now rare in high-income countries and remains a leading cause of cardiac death in much of the world.',
      whyItMatters:
        'Penicillin V is the narrowest, oldest and cheapest antibiotic in this file, and the one whose target has never developed resistance — group A streptococcus has never produced a penicillin-resistant isolate in eighty years of use. It is also the drug about which the two most consequential modern findings are both about what people believed rather than about the drug: that roughly nineteen in twenty people labelled penicillin-allergic are not, and that the ten-day course written into its own label was never established by trial.',
      whoTakesThis:
        'People with confirmed streptococcal pharyngitis or other streptococcal infection, and people with a history of rheumatic fever taking continuous prophylaxis against recurrence.',
      clinicalGoals:
        'Symptom relief, eradication of the organism, and prevention of rheumatic fever. Those three goals have very different evidence behind them and this page separates them.',
    },
    oneSentenceVerdict:
      'The narrowest and cheapest antibiotic here, against an organism that has never developed resistance to it, whose pooled placebo-controlled trials — mostly conducted in the 1950s — cut acute rheumatic fever with a Peto odds ratio of 0.36 across 12,249 participants while shortening a sore throat by an amount requiring fewer than six people treated to help one at day three and eighteen at one week, and whose label directs a ten-day minimum course that a 433-patient randomised trial found five days matched on clinical cure.',
    laymanHowItWorks:
      'A bacterium is under pressure from the inside, and the only thing holding it together is a mesh wall it has to keep re-stitching while it grows. Penicillin V looks enough like the end of the peptide chain those stitching enzymes normally grab that they grab it instead — and then cannot let go. A dividing bacterium keeps making new wall material it can never cross-link, and it bursts. Human cells have no such wall, which is why the drug is nearly harmless to them, and why the dangerous reactions to it are immune reactions rather than toxic ones.',
    auditConfidence: 'High Confidence',
    confidenceScore: 84,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1059 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 20 listed generic products at 250 and 500 mg, survey effective 19 August 2026); the oral solution runs at US$0.0535 per mL across 4 listed generic products in the same survey',
      markupEstimate: '',
      openPatentNotes:
        'In United States use since the 1950s and generic throughout. It is on the WHO Model List of Essential Medicines and in the WHO AWaRe Access group — the category of first-choice antibiotics with the lowest resistance potential. At about ten United States cents a tablet it is among the cheapest prescription drugs in the country, and unusually for this file, the reason it survives is not price but that nothing has ever beaten it against its target organism.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The honest alternatives divide by what the alternative is for. Amoxicillin is the same chemistry with better absorption and once- or twice-daily dosing, which is why it has largely replaced penicillin V for children. Intramuscular benzathine penicillin G is the option with the rheumatic fever evidence, and it is a single injection rather than ten days of tablets. A cephalosporin or a macrolide is what gets used when a penicillin allergy is recorded — which is the situation the allergy-delabelling literature is about.',
      conventionalRx: [
        {
          name: 'Amoxicillin',
          class: 'Aminopenicillin — the same beta-lactam chemistry with an added amino group',
          howItCompares:
            'Better absorbed, palatable as a suspension, and effective once or twice daily rather than four times, which is the whole practical difference. It is broader than penicillin V without being broad, and it is also in the WHO Access group. The trade is spectrum: amoxicillin selects more resistance in bystander organisms than penicillin V does.',
          typicalCost:
            'US$0.0783 per capsule or tablet (47 listed generic products) and US$0.0338 per mL of suspension (51 listed generic products) at United States pharmacy acquisition cost (CMS NADAC, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: cheaper per unit, far fewer doses a day, better adherence. Cons: broader spectrum than the infection requires; causes rash in Epstein-Barr virus infection, which is a common differential for a sore throat.',
        },
        {
          name: 'Intramuscular benzathine penicillin G',
          class: 'Long-acting depot penicillin',
          howItCompares:
            'This is the formulation with the rheumatic fever evidence. Cefdinir’s label states it directly: "Only intramuscular penicillin has been demonstrated to be effective for the prevention of rheumatic fever." In latent rheumatic heart disease, four-weekly injections for two years produced echocardiographic progression in 3 of 399 participants (0.8%) against 33 of 401 (8.2%) with no prophylaxis, a risk difference of -7.5 percentage points (95% CI -10.2 to -4.7, p<0.001) in a Ugandan trial of 818 children and adolescents.',
          typicalCost:
            'A prefilled syringe rather than a tablet; it is not in the oral CMS acquisition price series consulted for this page',
          prosAndCons:
            'Pros: one injection removes the adherence problem entirely; the only formulation with demonstrated rheumatic fever prevention. Cons: painful; requires a supervised setting; anaphylaxis risk, though in the Ugandan trial one mild anaphylactic reaction occurred across all doses administered, representing under 0.1%.',
        },
        {
          name: 'A cephalosporin or a macrolide',
          class: 'The drugs used when a penicillin allergy is on the record',
          howItCompares:
            'Both work against group A streptococcus, and both are broader than necessary. The relevant comparison is not efficacy but what recording an allergy costs: broad-spectrum substitution raises the risk of MRSA, vancomycin-resistant enterococcus and Clostridioides difficile. Cross-reactivity between penicillins and cephalosporins occurs in about 2% of cases — less than the 8% previously reported — and fewer than 5% of people labelled penicillin-allergic have clinically significant hypersensitivity on evaluation.',
          typicalCost:
            'Cephalexin US$0.1210 per capsule (42 listed generic products) and azithromycin US$0.5605 per tablet (72 listed generic products) at United States pharmacy acquisition cost (CMS NADAC, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: usable in genuine IgE-mediated penicillin allergy. Cons: broader spectrum, more resistance selection, more C. difficile; macrolide resistance in group A streptococcus is real and geographically variable, unlike penicillin resistance, which does not exist.',
        },
      ],
      naturalFoods: [
        {
          name: 'Nothing that treats a streptococcal infection',
          activeCompound: '',
          biologicalMechanism:
            'This entry exists because the absence is the finding. Honey, salt-water gargles, lozenges and warm fluids have modest symptomatic evidence for sore throat generally; none of them eradicates group A streptococcus, and eradication is the mechanism by which rheumatic fever is prevented.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'Not stated here as advice. For scale only: the pooled placebo-controlled antibiotic trials found 82% of untreated participants were symptom-free by one week, which is why symptomatic measures look effective in uncontrolled use — most sore throats resolve regardless of what is done to them.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Ask to have a penicillin allergy label checked',
          action:
            'If you were told as a child that you are allergic to penicillin, ask whether it can be formally evaluated.',
          patientImpact:
            'About 10% of the United States population reports a penicillin allergy, and clinically significant IgE-mediated or T-cell-mediated hypersensitivity is present in under 5% of them. IgE-mediated allergy also wanes: 80% of genuinely allergic patients become tolerant after a decade. Low-risk histories include isolated gastrointestinal symptoms, a family history alone, itching without rash, and a remote unknown reaction more than ten years ago.',
          clinicalPrecaution:
            'A history of anaphylaxis, positive skin testing, recurrent reactions or hypersensitivity to multiple beta-lactams is a high-risk history and is not something to self-assess. Evaluation is a clinical procedure, not a decision to make alone.',
        },
        {
          name: 'Finish it, and know why',
          action:
            'The course is prescribed for a duration for a specific reason in this infection, and it is not the usual one.',
          patientImpact:
            'The Precautions section states: "In streptococcal infections, therapy must be sufficient to eliminate the organism (10-day minimum); otherwise the sequelae of streptococcal disease may occur." The goal is eradication of the organism, not resolution of symptoms, because rheumatic fever follows the immune response to a persisting organism rather than the sore throat itself.',
          clinicalPrecaution:
            'A 433-patient Swedish randomised trial found five days at a higher frequency non-inferior on clinical cure, though with lower bacteriological eradication. That is a live question, not settled practice, and the label still says ten days.',
        },
        {
          name: 'Take it away from food if you can',
          action:
            'Blood levels are slightly higher on an empty stomach, though it may be taken with meals.',
          patientImpact:
            'The label states penicillin V may be given with meals but that blood levels are slightly higher on an empty stomach, and that only about 25% of an oral dose is absorbed even so.',
          clinicalPrecaution:
            'The label also warns that the oral route should not be relied on in severe illness, or with nausea, vomiting, gastric dilatation, cardiospasm or intestinal hypermotility, and that occasionally patients will simply not absorb therapeutic amounts.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC1([C@@H](N2[C@H](S1)[C@@H](C2=O)NC(=O)COC3=CC=CC=C3)C(=O)O)C',
      chemicalFormula: 'C16H18N2O5S',
      molecularWeight:
        '350.40 g/mol (free acid); dispensed as the potassium salt, with a 250 mg tablet equal to 400,000 units and a 500 mg tablet to 800,000 units',
      targetReceptorAffinity:
        'The phenoxymethyl analogue of penicillin G. The label states the potassium salt has the distinct advantage over penicillin G of resistance to inactivation by gastric acid, that average blood levels are two to five times higher than after the same dose of oral penicillin G with much less individual variation, and that once absorbed about 80% is bound to serum protein. Tissue levels are highest in the kidney. The drug is excreted as rapidly as it is absorbed in normal renal function, and recovery from urine indicates only about 25% of an oral dose is absorbed. It is bactericidal only during active multiplication, acting through inhibition of cell-wall mucopeptide biosynthesis, and it is not active against penicillinase-producing bacteria including many staphylococci. Streptococci in groups A, C, G, H, L and M are very sensitive; group D enterococci are resistant.',
      structureSource: {
        label:
          'PubChem CID 6869 (penicillin V) — canonical SMILES, molecular formula and weight, as carried on the enriched record; unit equivalence, absorption, protein binding and spectrum from the penicillin V potassium tablets label, Description and Clinical Pharmacology',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/6869',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'pcv-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the intact beta-lactam and limit the penicilloic acid',
          description:
            'The strained four-membered beta-lactam ring is the drug; the ring-opened penicilloic acid is not an antibiotic and is a principal immunological determinant behind penicillin hypersensitivity. Controlling it is therefore a safety specification, not merely a purity one, in the one drug class where the feared adverse reaction is immunological rather than toxic.',
          reagentsAndBuffer:
            'Penicillin V potassium reference standard, reverse-phase HPLC with UV detection at 254 nm, iodometric assay of intact beta-lactam, infrared confirmation of the beta-lactam carbonyl, limit tests for penicilloic acid and for penicillin G as a cross-contaminant',
        },
        {
          id: 'pcv-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Ferment with the phenoxyacetate precursor, or acylate 6-APA',
          description:
            'Penicillin V is made either by feeding phenoxyacetic acid to Penicillium chrysogenum during fermentation, which directs the organism to make the phenoxymethyl side chain, or semi-synthetically by acylating 6-aminopenicillanic acid. The phenoxymethyl side chain is the whole point: it is what confers stability to stomach acid and makes an oral penicillin possible at all.',
          dependsOnStepId: 'pcv-w1',
          reagentsAndBuffer:
            'Penicillium chrysogenum high-yielding strain, phenoxyacetic acid as side-chain precursor, controlled-pH aerated fermentation; or 6-aminopenicillanic acid with an activated phenoxyacetyl donor under mild aqueous conditions',
        },
        {
          id: 'pcv-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Extract, form the potassium salt, and keep it dry',
          description:
            'Penicillins hydrolyse in water and the reaction accelerates with heat and with either acid or base. Purification and salt formation are therefore fast, cold and pH-controlled, and the finished potassium salt is dried and packaged against moisture. The unit designation on the tablet — 400,000 units for 250 mg — is a survival from the era when potency could only be defined biologically.',
          dependsOnStepId: 'pcv-w2',
          reagentsAndBuffer:
            'Solvent extraction at controlled pH and low temperature, potassium acetate or potassium 2-ethylhexanoate for salt formation, crystallisation from anhydrous solvent, Karl Fischer water determination, moisture-barrier packaging',
        },
        {
          id: 'pcv-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Test acid stability against penicillin G, because that is the claim',
          description:
            'The entire reason penicillin V exists is that it survives the stomach and penicillin G does not. That claim is testable directly: incubate both at gastric pH and assay the surviving intact beta-lactam over time. The label’s quantitative version of the result is that average blood levels after penicillin V are two to five times those after the same oral dose of penicillin G, with much less individual variation.',
          dependsOnStepId: 'pcv-w3',
          reagentsAndBuffer:
            'Simulated gastric fluid at pH 1.2 and simulated intestinal fluid at pH 6.8, penicillin G potassium as the paired comparator, timed sampling with HPLC quantification of intact drug, bioassay against a susceptible Staphylococcus strain as an orthogonal potency readout',
        },
        {
          id: 'pcv-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Screen an eighty-year-old organism for the resistance that has never appeared',
          description:
            'Group A streptococcus has never yielded a penicillin-resistant clinical isolate, which is among the most remarkable facts in antimicrobial chemotherapy and is not guaranteed to hold. Ongoing surveillance is therefore a real experiment rather than a formality: minimum inhibitory concentration distributions on contemporary isolates, with sequencing of pbp2x in any isolate showing an upward shift, which is where reduced susceptibility would first appear.',
          dependsOnStepId: 'pcv-w4',
          reagentsAndBuffer:
            'Cation-adjusted Mueller-Hinton broth with lysed horse blood, CLSI broth microdilution, contemporary group A streptococcal isolates from pharyngeal and invasive sources, pbp2x amplification and sequencing for isolates with elevated MIC, macrolide and clindamycin panels run alongside for comparison',
        },
      ],
    },
    keyAudits: [
      {
        id: 'pcv-a1',
        category: 'conclusion_shift',
        title: 'Almost everyone labelled penicillin-allergic is not',
        laymanSummary:
          'About one American in ten reports a penicillin allergy. Fewer than one in twenty of those turns out to have a real one, and even genuine allergy fades — four in five people lose it within ten years.',
        technicalDetails:
          'Approximately 10% of the United States population reports a penicillin allergy, with higher rates among older and hospitalised patients, while clinically significant IgE-mediated or T-lymphocyte-mediated penicillin hypersensitivity is uncommon, at under 5%. IgE-mediated penicillin allergy wanes over time, with 80% of patients becoming tolerant after a decade, and the rate of IgE-mediated allergy is falling, potentially because parenteral penicillins are used less and severe anaphylaxis to oral amoxicillin is rare. Cross-reactivity between penicillins and cephalosporins occurs in about 2% of cases, less than the 8% previously reported — a figure that matters because penicillin V’s own label carries an all-capitals warning that individuals with a history of penicillin hypersensitivity have experienced severe reactions when treated with cephalosporins. Low-risk histories include isolated non-allergic symptoms such as gastrointestinal upset, a family history alone, pruritus without rash, and a remote unknown reaction more than ten years ago; high-risk histories include anaphylaxis, positive skin testing, recurrent reactions and multiple beta-lactam hypersensitivities. The consequence of an unexamined label is not neutral: substituting broad-spectrum antibiotics raises the risk of MRSA, vancomycin-resistant enterococcus and Clostridioides difficile.',
        evidenceSource:
          'Shenoy ES, Macy E, Rowe T, Blumenthal KG. Evaluation and management of penicillin allergy: a review. JAMA 2019;321:188-199; penicillin V potassium tablets label, Warnings',
        doi: '10.1001/jama.2018.19283',
        measuredMetric:
          'Proportion of reported penicillin allergy that is confirmed hypersensitivity, waning over time, and penicillin-cephalosporin cross-reactivity rate',
        auditFlag: 'verified',
      },
      {
        id: 'pcv-a2',
        category: 'inferred',
        title: 'The ten-day course is in the label and was never established by trial',
        laymanSummary:
          'Ten days is the rule for strep throat, and the label says so. A randomised trial of 433 patients found five days at a higher frequency worked as well on cure, with fewer side effects — and worse organism clearance.',
        technicalDetails:
          'The Precautions section of the label states: "In streptococcal infections, therapy must be sufficient to eliminate the organism (10-day minimum); otherwise the sequelae of streptococcal disease may occur." An open-label randomised non-inferiority trial at 17 Swedish primary care centres enrolled 433 patients aged 6 and over with group A streptococcal pharyngotonsillitis and three or four Centor criteria, comparing penicillin V 800 mg four times daily for five days (16 g total) with 1,000 mg three times daily for ten days (30 g total), with a pre-specified non-inferiority margin of 10 percentage points. Clinical cure in the per-protocol population was 89.6% (181/202) on five days against 93.3% (182/195) on ten, 95% CI -9.7 to 2.2 — non-inferior. Time to symptom relief was shorter on the five-day regimen, and the ten-day group had a higher incidence and longer duration of adverse events. The result that complicates the story is bacteriological: eradication was 80.4% (156/194) on five days against 90.7% (165/182) on ten. Since the mechanism by which treatment prevents rheumatic fever is eradication rather than symptom relief, a regimen that matches on symptoms and loses ten points on eradication is not obviously equivalent for the reason the infection is treated. Relapses were 8 against 7 and complications 0 against 4.',
        evidenceSource:
          'Skoog Ståhlgren G, Tyrstrup M, Edlund C, et al. Penicillin V four times daily for five days versus three times daily for 10 days in patients with pharyngotonsillitis caused by group A streptococci: randomised controlled, open label, non-inferiority study. BMJ 2019;367:l5337; penicillin V potassium tablets label, Precautions',
        doi: '10.1136/bmj.l5337',
        inferredClaim:
          'That the ten-day minimum in the label reflects a duration established by trial — it reflects the eradication-based reasoning of the 1950s, and the one modern randomised comparison found five days non-inferior on clinical cure while worse on eradication',
        auditFlag: 'contested',
      },
      {
        id: 'pcv-a3',
        category: 'measured',
        title: 'It does prevent rheumatic fever — in trials run when rheumatic fever was common',
        laymanSummary:
          'Pooled placebo-controlled trials show antibiotics cut acute rheumatic fever after a sore throat by about two-thirds. Most of those trials were run in the 1950s, when the complication was many times more common than it is now.',
        technicalDetails:
          'A Cochrane review of 29 randomised or quasi-randomised trials in 15,337 cases of sore throat found antibiotics reduced acute rheumatic fever within two months against control (Peto odds ratio 0.36, 95% CI 0.26 to 0.50; 18 studies, 12,249 participants; moderate-certainty evidence). The review states directly that the majority of included studies were conducted in the 1950s, when rates of serious complications — especially acute rheumatic fever — were much higher than today, and that the overall prevalence of acute rheumatic fever was very low, particularly in the later studies. Antibiotics also reduced acute otitis media within 14 days (Peto OR 0.21, 0.11 to 0.40, high certainty) and quinsy within two months (Peto OR 0.16, 0.07 to 0.35, high certainty) but not acute sinusitis (Peto OR 0.46, 0.10 to 2.05), and there were too few cases of acute glomerulonephritis to determine an effect. The relative risk reduction is real and well measured. The absolute benefit it converts into depends entirely on the baseline rate of rheumatic fever in the population being treated, and that rate has fallen by orders of magnitude in high-income countries since the trials were done, while remaining high in much of the world.',
        evidenceSource:
          'Spinks A, Glasziou PP, Del Mar CB. Antibiotics for treatment of sore throat in children and adults. Cochrane Database Syst Rev 2021;12:CD000023',
        doi: '10.1002/14651858.CD000023.pub5',
        measuredMetric:
          'Acute rheumatic fever, suppurative complications and symptoms after antibiotic treatment of sore throat, against placebo or no treatment',
        auditFlag: 'verified',
      },
      {
        id: 'pcv-a4',
        category: 'inferred',
        title: 'For symptoms alone, the benefit is small and most people recover anyway',
        laymanSummary:
          'Eighty-two per cent of untreated people were symptom-free within a week. Antibiotics helped one extra person in about six be free of sore throat at day three, and one in eighteen at one week, and did not reduce fever at day three at all.',
        technicalDetails:
          'In the same Cochrane review, throat soreness at day three was reduced (risk ratio 0.70, 95% CI 0.60 to 0.80; 16 studies, 3,730 participants; moderate certainty) with a number needed to treat below six, and at one week (RR 0.50, 0.34 to 0.75; 14 studies, 3,083 participants) with a number needed to treat of 18 — the larger relative effect at one week reflecting how few cases remained unresolved in either arm by then. Antibiotics did not significantly reduce fever at day three (RR 0.75, 95% CI 0.53 to 1.07; 8 studies, 1,443 participants; high-certainty evidence) but did reduce headache (RR 0.49, 0.34 to 0.70; high certainty). Eighty-two per cent of participants in the placebo or no-treatment arms were symptom-free by one week. The review notes that harms from antibiotics were poorly or inconsistently reported and could not be quantified, so the benefit side of this comparison is measured considerably better than the harm side. The authors conclude that because the effect on symptoms can be small, clinicians must judge case by case whether it is justifiable and whether the cause is likely to be bacterial at all — few of the included studies distinguished bacterial from viral aetiology.',
        evidenceSource:
          'Spinks A, Glasziou PP, Del Mar CB. Antibiotics for treatment of sore throat in children and adults. Cochrane Database Syst Rev 2021;12:CD000023',
        doi: '10.1002/14651858.CD000023.pub5',
        inferredClaim:
          'That treating a sore throat with penicillin produces a symptomatic benefit large enough to justify the prescription on its own — the pooled effect is a number needed to treat below six at day three and 18 at one week, with 82% of untreated participants symptom-free by one week and no significant effect on fever',
        auditFlag: 'caution',
      },
      {
        id: 'pcv-a5',
        category: 'failed',
        title: 'The label admits there are no controlled studies for endocarditis prophylaxis',
        laymanSummary:
          'Penicillin V has been recommended for decades to prevent heart valve infection before dental work. Its own label states that no controlled clinical efficacy studies have been conducted.',
        technicalDetails:
          'The Indications and Usage section states: "Although no controlled clinical efficacy studies have been conducted, penicillin V has been suggested by the American Heart Association and the American Dental Association for use as an oral regimen for prophylaxis against bacterial endocarditis in patients who have congenital heart disease or rheumatic or other acquired valvular heart disease when they undergo dental procedures and surgical procedures of the upper respiratory tract." It then narrows the recommendation twice over: oral penicillin should not be used in patients at particularly high risk, such as those with prosthetic valves or surgically constructed systemic pulmonary shunts, and penicillin V should not be used as adjunctive prophylaxis for genitourinary or gastrointestinal procedures. This is a labelled indication whose evidence base is expert recommendation, stated as such in the document that carries it — which is rarer and more honest than it sounds, and it is the reason guideline bodies on both sides of the Atlantic have progressively narrowed endocarditis prophylaxis over the past two decades.',
        evidenceSource:
          'Penicillin V potassium tablets United States prescribing information, Indications and Usage',
        measuredMetric:
          'Controlled clinical efficacy evidence for oral penicillin prophylaxis against bacterial endocarditis: none, per the label',
        auditFlag: 'caution',
      },
      {
        id: 'pcv-a6',
        category: 'measured',
        title: 'Injected penicillin stopped rheumatic heart disease progressing in Uganda',
        laymanSummary:
          'In 818 Ugandan children found on screening to have early rheumatic heart disease, monthly penicillin injections for two years produced progression in 0.8% against 8.2% with no prophylaxis.',
        technicalDetails:
          'A randomised controlled trial screened 102,200 children and adolescents by echocardiography; 3,327 were initially assessed as having latent rheumatic heart disease and 926 received a definitive diagnosis on confirmatory echocardiography. Of these, 916 underwent randomisation to penicillin G benzathine injections every four weeks for two years or no prophylaxis, with 818 in the modified intention-to-treat analysis and 799 (97.7%) completing. Echocardiographic progression at two years occurred in 3 participants (0.8%) on prophylaxis against 33 (8.2%) in the control group — a risk difference of -7.5 percentage points (95% CI -10.2 to -4.7, p<0.001). Two participants had serious adverse events attributable to prophylaxis, including one mild anaphylactic reaction, representing under 0.1% of all administered doses. Two things are worth separating. This is the strongest modern evidence for penicillin in rheumatic disease and it is for the injected depot formulation, not the oral tablet — the same distinction cefdinir’s label draws when it says only intramuscular penicillin has been demonstrated to prevent rheumatic fever. And it is secondary prophylaxis in people who already have detectable valve damage, which is a different population from a child with a sore throat.',
        evidenceSource:
          'Beaton A, Okello E, Rwebembera J, et al. Secondary antibiotic prophylaxis for latent rheumatic heart disease. N Engl J Med 2022;386:230-240 (GOAL trial)',
        doi: '10.1056/NEJMoa2102074',
        measuredMetric:
          'Echocardiographic progression of latent rheumatic heart disease at 2 years with four-weekly benzathine penicillin G',
        auditFlag: 'verified',
      },
      {
        id: 'pcv-a7',
        category: 'failed',
        title: 'Only a quarter of the dose is absorbed, and four times daily is why',
        laymanSummary:
          'The label states that only about 25% of an oral dose gets in, and that some people simply do not absorb a therapeutic amount at all. That is the reason for a four-times-daily schedule nobody completes.',
        technicalDetails:
          'The Clinical Pharmacology section states that the drug is excreted as rapidly as it is absorbed in people with normal kidney function, and that recovery from urine indicates only about 25% of an oral dose is absorbed. The Precautions section adds that the oral route should not be relied on in severe illness or with nausea, vomiting, gastric dilatation, cardiospasm or intestinal hypermotility, and that "occasionally patients will not absorb therapeutic amounts of orally administered penicillin". Poor and variable absorption, combined with rapid renal clearance and the time-dependent pharmacodynamics of beta-lactams, is what produces the four-times-daily regimen. The clinical consequence is visible in a comparator arm on another drug’s label: in cefdinir’s paediatric pharyngitis registration studies, oral penicillin at 10 mg/kg four times daily for ten days eradicated Streptococcus pyogenes in 159 of 227 children — 70% — against cefdinir’s 94%. Penicillin has not become less active against the organism; the regimen delivering it is simply hard to complete, and a drug that is not taken is indistinguishable from a drug that does not work.',
        evidenceSource:
          'Penicillin V potassium tablets United States prescribing information, Clinical Pharmacology and Precautions; cefdinir United States prescribing information, Clinical Studies — Streptococcal Pharyngitis/Tonsillitis',
        measuredMetric:
          'Fraction of an oral dose absorbed, and bacteriological eradication achieved by oral penicillin four times daily in a paediatric comparator arm',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'It survives the stomach, which penicillin G does not',
        laymanDesc:
          'The whole reason this version exists is a chemical side group that resists stomach acid, so it can be swallowed rather than injected.',
        molecularDetail:
          'Penicillin V is the phenoxymethyl analogue of penicillin G. The label states the potassium salt has the distinct advantage of resistance to inactivation by gastric acid, and that average blood levels are two to five times higher than after the same oral dose of penicillin G, with much less individual variation. It may be taken with meals, though levels are slightly higher fasting.',
        iconName: 'Shield',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Even so, only a quarter gets in',
        laymanDesc:
          'Most of a swallowed dose never reaches the bloodstream, and what does is cleared almost immediately. Hence four doses a day.',
        molecularDetail:
          'Recovery from urine indicates only about 25% of an oral dose is absorbed, and the drug is excreted as rapidly as it is absorbed in normal renal function. About 80% of what is absorbed is bound to serum protein; tissue levels are highest in the kidney, with small amounts everywhere else including cerebrospinal fluid. Excretion is considerably delayed in neonates, young infants and renal impairment.',
        iconName: 'Droplet',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It mimics the end of the cell-wall building block',
        laymanDesc:
          'The drug is shaped like the piece the wall-stitching enzyme expects, so the enzyme grabs it — and then cannot let go.',
        molecularDetail:
          'The beta-lactam ring is a structural mimic of the D-alanyl-D-alanine terminus of the peptidoglycan pentapeptide. Penicillin-binding protein transpeptidases attack it, forming a stable acyl-enzyme intermediate that hydrolyses extremely slowly. The label describes this as inhibition of biosynthesis of cell-wall mucopeptide.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Only a dividing bacterium dies',
        laymanDesc:
          'A cell that is not building new wall has nothing to interrupt. The drug kills only organisms that are actively multiplying.',
        molecularDetail:
          'The label states penicillin V exerts a bactericidal action during the stage of active multiplication. It is not active against penicillinase-producing bacteria, which include many staphylococcal strains. Groups A, C, G, H, L and M streptococci are very sensitive; group D enterococci are resistant.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The streptococcus is cleared — if the course is completed',
        laymanDesc:
          'Eradicating the organism, not relieving the sore throat, is what prevents rheumatic fever. That is why the duration is specified and why missing doses matters more here than usual.',
        molecularDetail:
          'Precautions: "In streptococcal infections, therapy must be sufficient to eliminate the organism (10-day minimum); otherwise the sequelae of streptococcal disease may occur." In a randomised comparison, five days at 800 mg four times daily gave bacteriological eradication of 80.4% against 90.7% for ten days at 1,000 mg three times daily, while matching on clinical cure.',
        iconName: 'CheckCircle',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Eighty years, and the organism has never become resistant',
        laymanDesc:
          'Group A streptococcus has never produced a penicillin-resistant isolate. That is close to unique among antibiotics in continuous use since the 1940s.',
        molecularDetail:
          'Resistance would require alteration of the penicillin-binding proteins, and in this organism such alterations appear to carry an unacceptable fitness cost. Isolates with modestly reduced susceptibility and pbp2x substitutions have been reported and none has established clinical resistance. This is an empirical observation about one species, not a property of the drug, and continued minimum inhibitory concentration surveillance is how it stays known.',
        iconName: 'Award',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'Spinks A et al., Cochrane Database Syst Rev 2021;12:CD000023 (29 randomised trials of antibiotics against placebo or no treatment for sore throat)',
        phase: 'Systematic review and meta-analysis of randomised and quasi-randomised trials',
        sampleSize: 15337,
        primaryEndpoint:
          'Sore throat at day three and at one week, with acute rheumatic fever and suppurative complications as secondary outcomes',
        endpointMet: true,
        statisticalPValue:
          'Sore throat at day three RR 0.70 (95% CI 0.60 to 0.80), number needed to treat below 6; at one week RR 0.50 (0.34 to 0.75), number needed to treat 18. Acute rheumatic fever within two months Peto OR 0.36 (0.26 to 0.50; 18 studies, 12,249 participants)',
        unreportedAdverseSignals:
          'Harms from antibiotics were poorly or inconsistently reported and could not be quantified in the review. Eighty-two per cent of control participants were symptom-free by one week. Fever at day three was not significantly reduced (RR 0.75, 0.53 to 1.07, high certainty). Most included studies date from the 1950s, when rheumatic fever was far commoner, and few distinguished bacterial from viral aetiology.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Skoog Ståhlgren G et al., BMJ 2019;367:l5337 (5-day against 10-day penicillin V)',
        phase:
          'Open-label, randomised, controlled non-inferiority trial in 17 primary care centres',
        sampleSize: 433,
        primaryEndpoint:
          'Clinical cure five to seven days after the end of treatment in group A streptococcal pharyngotonsillitis, penicillin V 800 mg four times daily for 5 days against 1,000 mg three times daily for 10 days',
        endpointMet: true,
        statisticalPValue:
          'Per protocol clinical cure 89.6% (181/202) against 93.3% (182/195); 95% CI -9.7 to 2.2, within the pre-specified 10 percentage point non-inferiority margin',
        unreportedAdverseSignals:
          'Bacteriological eradication was lower on the five-day regimen: 80.4% (156/194) against 90.7% (165/182). Since eradication rather than symptom resolution is the mechanism by which rheumatic fever is prevented, the two endpoints do not support the same conclusion. Relapses were 8 against 7 and complications 0 against 4; the ten-day group had a higher incidence and longer duration of adverse events.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'GOAL trial (Beaton A et al., N Engl J Med 2022;386:230-240)',
        phase: 'Randomised, controlled, open-label trial with blinded outcome adjudication',
        sampleSize: 818,
        primaryEndpoint:
          'Echocardiographic progression of latent rheumatic heart disease at 2 years in Ugandan children and adolescents aged 5 to 17',
        endpointMet: true,
        statisticalPValue:
          '3 of 399 (0.8%) on four-weekly benzathine penicillin G against 33 of 401 (8.2%) with no prophylaxis; risk difference -7.5 percentage points (95% CI -10.2 to -4.7), p<0.001',
        unreportedAdverseSignals:
          'Two participants had serious adverse events attributable to prophylaxis, including one mild anaphylactic reaction, representing under 0.1% of all doses administered. The trial used the injected depot formulation, not oral penicillin V, and enrolled people who already had detectable valve damage.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Acute rheumatic fever within two months reduced with a Peto odds ratio of 0.36 (95% CI 0.26 to 0.50) across 18 trials and 12,249 participants',
        'Sore throat at day three reduced with RR 0.70 and a number needed to treat below six; at one week RR 0.50 with a number needed to treat of 18',
        'Clinical cure 89.6% on five days against 93.3% on ten days, non-inferior; bacteriological eradication 80.4% against 90.7%',
        'Echocardiographic progression of latent rheumatic heart disease 0.8% against 8.2% with four-weekly benzathine penicillin G in 818 Ugandan children',
      ],
      unsupportedInferences: [
        'That the ten-day minimum in the label is a trial-established duration rather than eradication-based reasoning from the 1950s',
        'That oral penicillin V has the rheumatic fever prevention evidence — the demonstrated formulation is intramuscular penicillin, as another drug’s label states outright',
        'That a recorded penicillin allergy is a real one; under 5% of people reporting it have confirmed hypersensitivity and 80% of genuine cases become tolerant within a decade',
        'That oral penicillin prevents bacterial endocarditis before dental procedures — its own label states no controlled clinical efficacy studies have been conducted',
      ],
      whatFailedInitially: [
        'Only about 25% of an oral dose is absorbed, and the label records that some patients do not absorb therapeutic amounts at all',
        'In a comparator arm on another drug’s label, oral penicillin four times daily for ten days eradicated the streptococcus in only 70% of children',
        'The five-day regimen matched on symptoms and lost ten percentage points on eradication, which is the endpoint that matters for the complication being prevented',
        'The cephalosporin cross-reactivity figure in the label’s all-capitals warning reflects an 8% estimate that later work put at about 2%',
      ],
      realWorldOutcome: [
        'In United States use since the 1950s, generic throughout, on the WHO Model List of Essential Medicines and in the WHO AWaRe Access group',
        'About ten United States cents a tablet at pharmacy acquisition cost, and largely displaced in paediatrics by amoxicillin on dosing convenience rather than on efficacy',
        'Group A streptococcus has never produced a penicillin-resistant clinical isolate in eighty years of continuous use',
        'Penicillin allergy delabelling has become a formal antimicrobial stewardship intervention, because the recorded label drives broad-spectrum substitution and with it MRSA, VRE and Clostridioides difficile',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet at 250 mg (400,000 units) and 500 mg (800,000 units) of penicillin V potassium, and an oral solution at 125 and 250 mg per 5 mL — typically taken three or four times daily',
      description:
        'The potassium salt resists gastric acid inactivation, which is the property that makes an oral penicillin possible; average blood levels are two to five times those after the same oral dose of penicillin G with much less individual variation. It may be given with meals, though levels are slightly higher fasting. Only about 25% of an oral dose is absorbed, roughly 80% of the absorbed drug is protein bound, and elimination is renal and as rapid as absorption in normal kidney function. Excretion is considerably delayed in neonates, young infants and renal impairment.',
      safetyProfile:
        'The label carries an all-capitals warning that serious and occasionally fatal hypersensitivity reactions have been reported, that they are more likely in individuals with a history of penicillin hypersensitivity or sensitivity to multiple allergens, and that individuals with a history of penicillin hypersensitivity have experienced severe reactions when treated with cephalosporins — a cross-reactivity now estimated at about 2% rather than the 8% previously reported. Serious anaphylaxis requires immediate epinephrine. Also carries the Clostridioides difficile-associated diarrhoea warning common to antibacterials, which the label notes may present over two months after the last dose. The oral route should not be relied on in severe illness or with vomiting or intestinal hypermotility, and severe pneumonia, empyema, bacteraemia, pericarditis, meningitis and arthritis should not be treated with penicillin V during the acute stage.',
    },
    commonQuestions: [
      {
        q: 'I was told as a child that I am allergic to penicillin. Am I?',
        a: 'Probably not. About one in ten Americans reports a penicillin allergy and fewer than one in twenty of those has clinically significant hypersensitivity when evaluated. Even genuine IgE-mediated allergy fades — 80% of confirmed cases become tolerant after a decade. Histories described as low risk include isolated gastrointestinal symptoms, itching without a rash, a family history alone, and a remote reaction more than ten years ago whose details nobody remembers. Anaphylaxis, positive skin testing, repeated reactions or reactions to several beta-lactams are a different matter and are high risk. This is worth resolving rather than carrying, because the label itself has consequences: it pushes prescribing towards broader antibiotics, and with them a higher risk of MRSA, vancomycin-resistant enterococcus and Clostridioides difficile.',
        auditNote:
          'The label’s all-capitals warning about severe reactions to cephalosporins in penicillin-allergic people reflects a cross-reactivity estimate of about 8%. More recent work puts it near 2%.',
      },
      {
        q: 'Why ten days for a sore throat that is better in three?',
        a: 'Because the target is not the sore throat. The reason strep throat is treated at all is to prevent acute rheumatic fever, and that follows the immune response to an organism that persists, not the symptoms. The label puts it plainly: therapy must be sufficient to eliminate the organism, ten-day minimum, otherwise the sequelae of streptococcal disease may occur. Whether ten days is the right number is a live question. A Swedish randomised trial in 433 patients found five days at a higher dose frequency non-inferior on clinical cure (89.6% against 93.3%) with faster symptom relief and fewer adverse events — but bacteriological eradication was 80.4% against 90.7%, and eradication is the endpoint the whole ten-day rule exists to protect. The trial is a real challenge to the rule and not a resolution of it.',
      },
      {
        q: 'Has it stopped working after eighty years?',
        a: 'Not against its main target, and that is remarkable. Group A streptococcus has never produced a penicillin-resistant clinical isolate despite continuous global use since the 1940s — an outcome that has not held for any other antibiotic-organism pair of comparable age. It has stopped working against organisms it once covered: the label notes that an increasing number of staphylococcal strains are resistant, because they make penicillinase, and that group D enterococci were never susceptible. Where penicillin V appears to fail in strep throat, the usual explanation is not resistance but the regimen: only about a quarter of an oral dose is absorbed, four doses a day for ten days is difficult to complete, and in one registration trial comparator arm oral penicillin cleared the organism in only 70% of children.',
      },
      {
        q: 'Do I need it before dental work to protect my heart valve?',
        a: 'The label is unusually candid about the state of that evidence. It says that although no controlled clinical efficacy studies have been conducted, penicillin V has been suggested by the American Heart Association and the American Dental Association for prophylaxis against bacterial endocarditis in people with congenital heart disease or rheumatic or other acquired valve disease undergoing dental and upper respiratory procedures — and then narrows it, stating that oral penicillin should not be used in those at particularly high risk such as people with prosthetic valves or surgical shunts. Guideline bodies have progressively narrowed the indication over the past two decades for exactly this reason: it rests on plausibility rather than on a trial. Whether it applies to you is a cardiology question.',
      },
      {
        q: 'Should I just take a broader antibiotic to be safe?',
        a: 'For a confirmed streptococcal sore throat, broader is worse, not safer. Penicillin V is in the WHO Access group, the category of narrow first-choice antibiotics, and its target organism has never developed resistance to it. The broad-spectrum alternatives select for resistance in organisms that were never the problem, cause more Clostridioides difficile, and in the case of macrolides have real and geographically variable resistance in group A streptococcus itself. The main reason broader drugs get used in this infection is a recorded penicillin allergy, which is why checking that label is one of the highest-value things a person carrying it can do.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Penicillin V potassium tablets United States prescribing information — Description, Clinical Pharmacology, Indications and Usage, Warnings, Precautions',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=penicillin+v+potassium',
        kind: 'regulatory',
      },
      {
        label:
          'Shenoy ES, Macy E, Rowe T, Blumenthal KG. Evaluation and management of penicillin allergy: a review. JAMA 2019;321:188-199',
        identifier: '10.1001/jama.2018.19283',
        kind: 'doi',
      },
      {
        label:
          'Spinks A, Glasziou PP, Del Mar CB. Antibiotics for treatment of sore throat in children and adults. Cochrane Database Syst Rev 2021;12:CD000023',
        identifier: '10.1002/14651858.CD000023.pub5',
        kind: 'doi',
      },
      {
        label:
          'Skoog Ståhlgren G, Tyrstrup M, Edlund C, et al. Penicillin V four times daily for five days versus three times daily for 10 days in patients with pharyngotonsillitis caused by group A streptococci: randomised controlled, open label, non-inferiority study. BMJ 2019;367:l5337',
        identifier: '10.1136/bmj.l5337',
        kind: 'doi',
      },
      {
        label:
          'Beaton A, Okello E, Rwebembera J, et al. Secondary antibiotic prophylaxis for latent rheumatic heart disease. N Engl J Med 2022;386:230-240',
        identifier: '10.1056/NEJMoa2102074',
        kind: 'doi',
      },
      {
        label:
          'Denny FW, Wannamaker LW, Brink WR, Rammelkamp CH Jr, Custer EA. Prevention of rheumatic fever: treatment of the preceding streptococcic infection. J Am Med Assoc 1950;143:151-153 — the original demonstration that treating the antecedent streptococcal infection prevents rheumatic fever',
        identifier: '10.1001/jama.1950.02910370001001',
        kind: 'doi',
      },
      {
        label:
          'Cefdinir United States prescribing information, Clinical Studies — the paediatric pharyngitis comparator arm in which oral penicillin four times daily eradicated S. pyogenes in 70% of children',
        identifier: 'https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=cefdinir',
        kind: 'regulatory',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — penicillin V potassium (20 listed generic tablet products), with amoxicillin, cephalexin and azithromycin comparators, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 6869 — penicillin V structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/6869',
        kind: 'url',
      },
    ],
  },
]
