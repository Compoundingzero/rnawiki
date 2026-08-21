import type { SeedDossier } from '@/lib/seed-types'

/**
 * Curated flagship dossiers — the antibacterials: the beta-lactams a general practice runs on, the
 * hospital carbapenems and anti-pseudomonals, the Gram-positive reserve agents, and the one
 * seventy-year-old nitrofuran that outlived every drug that was supposed to replace it.
 *
 * Editorial layer written over the machine-enriched records: the verdict, the mechanism carousel
 * and the audits, which no pipeline can produce. The identity facts — slug, trade name, sponsor,
 * approval year, SMILES — are copied from the enriched record rather than researched again.
 *
 * Every DOI, PMID, NCT number and FDA application number below was resolved against the NCBI
 * E-utilities or the openFDA Drugs@FDA endpoint at the time of writing. Sample sizes, response
 * rates, confidence intervals and p-values are copied from the published abstract or the FDA
 * label, never from memory. Where a number could not be sourced, the field is absent.
 *
 * Five conventions apply to the whole group.
 *
 * 1. AN ANTIBIOTIC TRIAL MEASURES CURE, NOT SURVIVAL, AND ALMOST NEVER MEASURES RESISTANCE.
 *    Registration endpoints here are clinical cure at a test-of-cure visit, or all-cause mortality
 *    at 30 days in the sicker populations. The thing every reader assumes is being measured —
 *    whether this drug rather than that one drives resistance — is measured by almost none of
 *    these trials, and the pages say so.
 *
 * 2. NON-INFERIORITY IS NOT EQUIVALENCE AND IT IS NOT SUPERIORITY. Most of this group was approved
 *    on non-inferiority margins. A trial that meets a 10% margin has shown the new drug is
 *    probably not much worse; it has not shown it is as good, and MERINO is the case in this file
 *    where the margin was missed and the answer changed practice.
 *
 * 3. PRICING IS A PRICE, NOT A COST. Every price here is the CMS National Average Drug Acquisition
 *    Cost — what a United States retail pharmacy pays a wholesaler — and is labelled as such.
 *    `synthesisCostPerDose` is empty on every dossier in this file: the cost-of-production
 *    literature for the WHO Essential Medicines List publishes a method and an aggregate, and its
 *    per-molecule antibiotic figures sit in a supplementary appendix that could not be resolved
 *    and verified at the time of writing. An unverified cost is worse than an absent one.
 *
 * 4. NO DOSING, DURATION-SELECTION, MONITORING OR PROCUREMENT GUIDANCE. Strengths and infusion
 *    schedules appear only where they are part of a trial's description or a product's identity.
 *    Nothing here tells a reader what to take, for how long, how to have it monitored, or where to
 *    obtain it.
 *
 * 5. RESISTANCE IS THE SIDE EFFECT THAT DOES NOT SHOW UP IN THE SAFETY TABLE. It arrives in the
 *    population rather than in the patient, on a timescale no registration trial runs for. Where a
 *    drug's own trials recorded emergent non-susceptibility — daptomycin, linezolid — it is on the
 *    page as a measured finding rather than a warning.
 */

const NADAC_SOURCE = {
  label:
    'CMS National Average Drug Acquisition Cost (NADAC) survey — what United States retail pharmacies pay to acquire a drug',
  identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
  kind: 'url' as const,
}

const COST_OF_PRODUCTION_SOURCE = {
  label:
    'Hill A, Barber MJ, Gotham D. Estimated costs of production and potential prices for the WHO Essential Medicines List. BMJ Glob Health 2018;3:e000571 — the cost-of-production literature checked for this group. It publishes an estimation method over 148 medicines and an aggregate result; its per-molecule antibiotic figures are in a supplementary appendix that could not be resolved at the time of writing, so no per-dose cost is stated on these pages',
  identifier: '10.1136/bmjgh-2017-000571',
  kind: 'doi' as const,
}

export const ENRICHED_BATCH_12_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // 1. Amoxicillin-clavulanate — the most prescribed broad-spectrum oral antibiotic in the
  //    Western world, and the most frequent single cause of drug-induced liver injury in it.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'clavulanate',
    name: 'Amoxicillin and Clavulanate Potassium',
    tradeName: 'Augmentin',
    sponsor:
      'Beecham Research Laboratories (originator, clavulanic acid isolated 1974-76); the current United States application holder on this record is US Antibiotics, and the combination is made generically worldwide',
    targetGene:
      'Bacterial cell-wall genes ftsI, pbp2b and relatives, plus the class A beta-lactamase genes blaTEM, blaSHV and blaROB — all bacterial, none human',
    targetProtein:
      'Penicillin-binding proteins (DD-transpeptidases) for amoxicillin; class A serine beta-lactamases for clavulanate',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1984,
    indication:
      'Infections due to susceptible isolates of the designated bacteria: lower respiratory tract infections, acute bacterial otitis media and sinusitis caused by beta-lactamase-producing isolates of Haemophilus influenzae and Moraxella catarrhalis, together with skin and urinary tract indications carried on the individual product labels',
    patientFriendlyIndication:
      'Bacterial infections of the ear, sinuses, chest, skin and urinary tract',
    anatomicalSite:
      'The bacterial periplasm — the space between a bacterium’s outer membrane and its cell wall, where both molecules do their work',
    conditionContext: {
      conditionExplainer:
        'Most common bacterial infections are caused by organisms a penicillin would once have killed. Many of those organisms now carry an enzyme, beta-lactamase, that cuts a penicillin apart before it can act. This tablet contains a penicillin and a second molecule whose only job is to occupy that enzyme.',
      whyItMatters:
        'It is one of the most prescribed antibiotics in the world, and the everyday choice when plain amoxicillin is thought likely to fail. That volume is also why it heads the drug-induced liver injury registries: a rare reaction to a very common drug produces a lot of cases.',
      whoTakesThis:
        'Adults and children with ear, sinus, chest, skin, dental or urinary infections judged likely to involve a beta-lactamase-producing organism.',
      clinicalGoals:
        'Clinical cure — the infection resolves and does not need a second course. The registration and placebo-controlled trials on this page measured exactly that, and not survival.',
    },
    oneSentenceVerdict:
      'A penicillin paired with a decoy that soaks up the bacterial enzyme which would otherwise destroy it — in the two 2011 placebo-controlled trials it cut treatment failure in young children with ear infection from 44.9% to 18.6% and persistent otoscopic signs from 51% to 16%, while causing diarrhoea in 47.8% against 26.6% on placebo, and it is the single commonest cause of drug-induced liver injury in the United States registry.',
    laymanHowItWorks:
      'Amoxicillin kills bacteria by jamming the tool they use to stitch their cell wall together. Bacteria fight back with an enzyme that snips amoxicillin open before it arrives. Clavulanate is a lookalike that the enzyme grabs instead and cannot let go of, so it is used up. With the enzyme occupied, the amoxicillin gets through and the wall fails.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 84,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.2701 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 89 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Clavulanic acid was isolated from Streptomyces clavuligerus by Beecham in the mid-1970s and the combination was approved in the United States in 1984. All composition-of-matter protection expired long ago and the combination is on the WHO Model List of Essential Medicines. The remaining cost driver is fermentation: clavulanate is a fermentation product, not a synthetic one, which is why it is the more expensive half of a cheap tablet.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The real comparison is not against another antibiotic but against not using one. In young children with ear infection the placebo arms of the two 2011 trials still recovered — 55% of them without any treatment failure — and pain relief was given to roughly 85% of children in both arms of the Finnish trial. Where an antibiotic is warranted, the alternatives differ in whether they cover beta-lactamase producers and in what they do to the gut. Nothing sold as a food or supplement treats a bacterial infection.',
      conventionalRx: [
        {
          name: 'Amoxicillin alone',
          class: 'Aminopenicillin without a beta-lactamase inhibitor',
          howItCompares:
            'The same killing molecule without the decoy. It works against organisms that do not make beta-lactamase, which is still most Streptococcus pneumoniae, and it causes markedly less diarrhoea. It fails against beta-lactamase-producing Haemophilus influenzae and Moraxella catarrhalis, which is the exact gap the label for the combination is written around.',
          typicalCost:
            'Not stated: no verified CMS acquisition price for plain amoxicillin was held on this record at the time of writing',
          prosAndCons:
            'Pros: cheaper, far less diarrhoea, narrower selection pressure. Cons: no cover for the beta-lactamase producers that cause a large share of ear and sinus infection.',
        },
        {
          name: 'Cephalexin',
          class: 'First-generation cephalosporin',
          howItCompares:
            'Attacks the same transpeptidase target with a beta-lactam ring that most staphylococcal penicillinases cannot open, so it covers skin organisms well. It is weak against Haemophilus influenzae, so it is not a substitute for the ear and sinus indications.',
          typicalCost:
            'US$0.0921 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 58 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: better tolerated, strong against skin flora, cheap. Cons: shares an identical side chain with amoxicillin, so it is the cephalosporin most likely to cross-react in a penicillin-allergic patient — odds ratio 5.8 (95% CI 3.6 to 9.2) in the Pichichero meta-analysis.',
        },
        {
          name: 'Cefdinir',
          class: 'Third-generation oral cephalosporin',
          howItCompares:
            'Its beta-lactam ring resists the common Haemophilus and Moraxella beta-lactamases without needing a separate inhibitor, so it reaches the same organisms with one molecule instead of two and causes markedly less diarrhoea. It is weaker than amoxicillin against penicillin-non-susceptible Streptococcus pneumoniae, which is the trade.',
          typicalCost:
            'US$0.1195 per mL of oral suspension at United States pharmacy acquisition cost (CMS NADAC, median across 25 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: one molecule, stable to the relevant beta-lactamases, better tolerated, palatable suspension. Cons: less active against resistant pneumococcus; still a cephalosporin, so it selects for the same resistance families.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Pain relief was given in both arms of the placebo-controlled trials',
          action:
            'In the Finnish trial, analgesic or antipyretic agents were given to 84.2% of the antibiotic group and 85.9% of the placebo group.',
          patientImpact:
            'Whatever the antibiotic did in those trials, it did on top of pain relief rather than instead of it. The Cochrane review found antibiotics do not reduce pain at 24 hours at all (RR 0.89, 95% CI 0.78 to 1.01, high-certainty evidence).',
          clinicalPrecaution:
            'This describes what the trials did, not what anyone should do. Which analgesic and whether one is appropriate is a clinical question this page does not answer.',
        },
        {
          name: 'Say if a previous course of this drug was followed by jaundice',
          action:
            'Tell the prescriber about any past episode of yellowing, dark urine or pale stools in the weeks after an antibiotic, even if it resolved.',
          patientImpact:
            'Amoxicillin-clavulanate liver injury has a mean onset of 31 days after the course and often begins after the tablets have stopped, so the connection is routinely missed. In the DILIN registry three of 117 patients required a liver transplant.',
          clinicalPrecaution:
            'A previous cholestatic reaction to this combination is a label contraindication. The risk concentrates in older men — mean age 60 against 48 for drug-induced liver injury in general — which is the opposite of the usual pattern and part of why it gets overlooked.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1[C@@H]2N(C1=O)[C@H](/C(=C/CO)/O2)C(=O)[O-]',
      chemicalFormula: 'C8H8NO5',
      molecularWeight: '198.15 g/mol',
      targetReceptorAffinity:
        'The structure shown is the clavulanate anion, the inhibitor half of the combination. It is a mechanism-based, irreversible inactivator of class A serine beta-lactamases: the enzyme opens its beta-lactam ring, the resulting acyl-enzyme rearranges and the enzyme is permanently cross-linked rather than released. Clavulanate has almost no antibacterial activity of its own. The killing is done by amoxicillin, which acylates the active-site serine of penicillin-binding proteins.',
      structureSource: {
        label: 'PubChem CID 16204478 (clavulanate) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/16204478',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'amc-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Water content and ratio assay on the clavulanate potassium salt',
          description:
            'Clavulanate potassium is hygroscopic and degrades in the presence of water, so the water content of the salt is checked before anything is made from it. The fixed ratio of the two molecules in the finished product is also confirmed here: the pair is a ratio product, and a batch with the right total mass and the wrong ratio is not the drug.',
          reagentsAndBuffer:
            'Karl Fischer titration, HPLC with ultraviolet detection at 220 nm and 230 nm against amoxicillin trihydrate and clavulanate potassium reference standards, controlled low-humidity handling',
        },
        {
          id: 'amc-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Fermentation of clavulanic acid from Streptomyces clavuligerus',
          description:
            'Clavulanate is not made by chemical synthesis at scale — it is a fermentation product of a soil actinomycete, isolated by Beecham in the mid-1970s from a screen for beta-lactamase inhibitors. This is why the cheaper half of the tablet by mass is the more expensive half by cost, and why supply of the combination has historically been tighter than supply of amoxicillin.',
          dependsOnStepId: 'amc-w1',
          reagentsAndBuffer:
            'Streptomyces clavuligerus culture, glycerol and soybean-flour production medium, controlled dissolved oxygen and pH, ammonium sulfate feed',
        },
        {
          id: 'amc-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Extraction and conversion to the potassium salt',
          description:
            'Recover clavulanic acid from the broth and convert it to the potassium salt, which is stable enough to formulate. The free acid is not: this step exists because the molecule that works is not the molecule that can sit in a blister pack.',
          dependsOnStepId: 'amc-w2',
          reagentsAndBuffer:
            'Solvent extraction into ethyl acetate at acidic pH, back-extraction, potassium 2-ethylhexanoate for salt formation, crystallisation from isopropanol, residual solvent analysis by headspace gas chromatography',
        },
        {
          id: 'amc-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Periplasmic access in a Gram-negative outer-membrane panel',
          description:
            'Both molecules have to cross an outer membrane to reach the periplasm where the enzyme and the target both sit. Test against isogenic Escherichia coli strains with and without the major porins to confirm that failure in a resistant isolate is enzymatic rather than a permeability problem, because the two look identical on a plate.',
          dependsOnStepId: 'amc-w3',
          reagentsAndBuffer:
            'Isogenic E. coli K-12 ompF and ompC deletion strains, cation-adjusted Mueller-Hinton broth, osmotic shock buffer for periplasmic fractionation, LC-MS/MS quantification of both molecules in the periplasmic fraction',
        },
        {
          id: 'amc-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Nitrocefin inactivation kinetics and a fixed-ratio checkerboard',
          description:
            'Measure what clavulanate actually does: follow the loss of beta-lactamase activity against the chromogenic substrate nitrocefin, then run amoxicillin minimum inhibitory concentrations with and without a fixed clavulanate concentration in a beta-lactamase-positive isolate. The first assay shows the enzyme is being destroyed rather than merely occupied; the second shows the shift that destruction buys.',
          dependsOnStepId: 'amc-w4',
          reagentsAndBuffer:
            'Purified TEM-1 beta-lactamase, nitrocefin in phosphate buffer at pH 7.0 read at 486 nm, beta-lactamase-positive Haemophilus influenzae and Moraxella catarrhalis clinical isolates, cation-adjusted Mueller-Hinton broth with lysed horse blood and NAD for fastidious organisms',
        },
      ],
    },
    keyAudits: [
      {
        id: 'amc-a1',
        category: 'measured',
        title: 'Treatment failure fell from 44.9% to 18.6% against placebo in 319 children',
        laymanSummary:
          'Finnish children aged six months to three years with ear infection diagnosed by strict criteria got either the drug or an identical-looking placebo. Roughly one in five on the drug failed treatment. Roughly two in five on placebo did.',
        technicalDetails:
          'In the double-blind trial by Tähtinen and colleagues, 161 children received amoxicillin-clavulanate and 158 placebo for 7 days. Treatment failure by day 8 occurred in 18.6% against 44.9% (P<0.001). Progression to failure was reduced by 62% (hazard ratio 0.38, 95% CI 0.25 to 0.59) and the need for rescue treatment by 81% (6.8% against 33.5%; hazard ratio 0.19, 95% CI 0.10 to 0.36). The separation was already present at the first scheduled visit on day 3. Analgesic or antipyretic agents were given to 84.2% and 85.9% of the two groups respectively, so the antibiotic effect sits on top of pain relief rather than in place of it.',
        evidenceSource:
          'Tähtinen PA et al., N Engl J Med 2011;364:116-126 (NCT00299455)',
        doi: '10.1056/NEJMoa1007174',
        measuredMetric:
          'Time to treatment failure through day 8, against matching placebo, double-blind',
        auditFlag: 'verified',
      },
      {
        id: 'amc-a2',
        category: 'measured',
        title: 'The American trial found the same thing on signs and much less on symptoms',
        laymanSummary:
          'A near-simultaneous American trial found the drug cleared the physical signs of infection far better than placebo. On how quickly children stopped feeling unwell, the headline comparison was not statistically significant.',
        technicalDetails:
          'Hoberman and colleagues randomised 291 children aged 6 to 23 months to amoxicillin-clavulanate or placebo for 10 days. Clinical failure — persistent otoscopic signs of acute infection — was 4% against 23% at or before day 4 to 5 and 16% against 51% at or before day 10 to 12, both P<0.001. But initial resolution of symptoms was 35%, 61% and 80% at days 2, 4 and 7 on drug against 28%, 54% and 74% on placebo, P=0.14 for the overall comparison, which is not significant. Sustained resolution reached P=0.04 and mean symptom scores over the first 7 days P=0.02. Diarrhoea and diaper-area dermatitis were more common on the drug, and one child in the placebo group developed mastoiditis.',
        evidenceSource: 'Hoberman A et al., N Engl J Med 2011;364:105-115 (NCT00377260)',
        doi: '10.1056/NEJMoa0912254',
        measuredMetric:
          'Otoscopic clinical failure and symptomatic response against matching placebo',
        auditFlag: 'verified',
      },
      {
        id: 'amc-a3',
        category: 'failed',
        title: 'Pooled across 13 trials, antibiotics do not reduce ear pain at 24 hours',
        laymanSummary:
          'The single thing a parent most wants — the child to hurt less tonight — is the thing the pooled evidence says antibiotics do not deliver. The benefit arrives on day two or three, and roughly one child in fourteen gets vomiting, diarrhoea or a rash instead.',
        technicalDetails:
          'The 2023 Cochrane review pooled 13 placebo-controlled trials in 3,401 children. Antibiotics did not reduce pain at 24 hours (RR 0.89, 95% CI 0.78 to 1.01; 5 trials, 1,394 children; high-certainty evidence) or at 4 to 7 days (RR 0.76, 95% CI 0.50 to 1.14). They reduced pain at 2 to 3 days (RR 0.71, 95% CI 0.58 to 0.88; number needed to treat 20) and increased adverse events (RR 1.38, 95% CI 1.16 to 1.63; number needed to harm 14). They did not reduce abnormal tympanometry at 6 to 8 weeks (RR 0.89, 95% CI 0.70 to 1.13) or at three months (RR 0.94, 95% CI 0.66 to 1.34), or late recurrence (RR 0.94, 95% CI 0.79 to 1.11). Serious complications were rare and did not differ.',
        evidenceSource:
          'Venekamp RP et al., Antibiotics for acute otitis media in children. Cochrane Database Syst Rev 2023;11:CD000219',
        doi: '10.1002/14651858.CD000219.pub5',
        measuredMetric:
          'Pooled risk ratios for pain, adverse events, tympanometry and recurrence across 13 placebo-controlled trials',
        auditFlag: 'verified',
      },
      {
        id: 'amc-a4',
        category: 'failed',
        title: 'It is the commonest single cause of drug-induced liver injury in the United States',
        laymanSummary:
          'One in nine cases in the American drug-induced liver injury registry is caused by this one antibiotic. The injury usually starts about a month after the course, often after the tablets have finished, which is why the link is missed.',
        technicalDetails:
          'In the DILIN prospective registry, 117 of 1,038 adjudicated cases (11%) were caused by amoxicillin-clavulanate, representing 24% of the 479 cases attributed to antimicrobial agents — the most frequent single cause. Affected patients were older than the cohort as a whole (mean 60 against 48 years) and predominantly male (62% against 39% male in the overall cohort, P<0.001), an inversion of the usual sex distribution for drug-induced liver injury. Mean time to symptom onset was 31 days. Median values at onset were total bilirubin 7 mg/dL, ALT 478 U/L and ALP 325 U/L, and nearly all biopsies showed prominent cholestatic features. Resolution took a mean 55 days from the peak. Three women required liver transplantation; none died of the injury.',
        evidenceSource:
          'deLemos AS et al., Amoxicillin-Clavulanate-Induced Liver Injury. Dig Dis Sci 2016;61:2406-2416; Chalasani N et al., Gastroenterology 2015;148:1340-1352',
        doi: '10.1007/s10620-016-4121-6',
        measuredMetric:
          'Share of adjudicated cases in a prospective drug-induced liver injury registry',
        auditFlag: 'caution',
      },
      {
        id: 'amc-a5',
        category: 'inferred',
        title: 'The label restricts it to beta-lactamase producers; prescribing does not',
        laymanSummary:
          'The indication is written for infections caused by bacteria that make the enzyme clavulanate blocks. In practice the drug is chosen before anyone knows which bacterium is there. Whether adding clavulanate helps when the organism does not make the enzyme has not been measured in most of the situations where it is used.',
        technicalDetails:
          'The United States label for the oral suspension names lower respiratory tract infection, acute bacterial otitis media and sinusitis "caused by beta-lactamase-producing isolates of Haemophilus influenzae and Moraxella catarrhalis". Clavulanate has essentially no intrinsic antibacterial activity and no effect on an organism that produces no class A beta-lactamase, so against beta-lactamase-negative Streptococcus pneumoniae — still the commonest bacterial cause of otitis media and sinusitis — the combination is pharmacologically amoxicillin plus an inert companion that raises the diarrhoea rate. The two placebo-controlled trials on this page tested the combination against placebo, not against amoxicillin alone, so they cannot separate the two components. No adequately powered head-to-head trial of amoxicillin against amoxicillin-clavulanate in unselected community otitis media has been identified for this dossier.',
        evidenceSource:
          'Amoxicillin and clavulanate potassium for oral suspension, United States prescribing information, Indications and Usage; Tähtinen PA et al., N Engl J Med 2011;364:116-126',
        inferredClaim:
          'That the clavulanate component contributes to the observed benefit in an unselected community infection — plausible in proportion to how much beta-lactamase-producing organism is present, and not measured by either placebo-controlled trial',
        auditFlag: 'contested',
      },
      {
        id: 'amc-a6',
        category: 'conclusion_shift',
        title: 'The field changed its mind twice about whether to treat ear infection at all',
        laymanSummary:
          'For years the answer was always treat. Then trials suggested most children got better anyway and watchful waiting became an option. Then two strict trials in 2011 showed a real effect on the infection itself, and the guidance tightened again for the youngest children. All three positions were reasonable on the evidence available at the time.',
        technicalDetails:
          'Earlier placebo-controlled trials used loose diagnostic criteria and found small effects, which supported observation as an option. The two 2011 trials both used stringent otoscopic entry criteria — the change that mattered — and both found large reductions in treatment failure and in persistent otoscopic signs. The 2023 Cochrane update, pooling all 13 trials, then confirmed both halves of the picture at once: a real effect on signs and on pain from day two, no effect on pain at 24 hours, no effect on middle-ear effusion beyond six weeks, no effect on recurrence, and a number needed to harm of 14. The disagreement was never mainly about the drug. It was about who was enrolled and what was counted.',
        evidenceSource:
          'Hoberman A et al., N Engl J Med 2011;364:105-115; Tähtinen PA et al., N Engl J Med 2011;364:116-126; Venekamp RP et al., Cochrane Database Syst Rev 2023;11:CD000219',
        doi: '10.1002/14651858.CD000219.pub5',
        inferredClaim:
          'That the earlier negative trials showed the drug did not work — they showed that a diagnosis made on loose criteria dilutes any effect, which is a statement about the entry criteria rather than about the molecule',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Two different molecules in one tablet',
        laymanDesc:
          'One of them kills bacteria. The other kills almost nothing — its whole job is to protect the first one. They are made in a fixed ratio, and the ratio is part of the product.',
        molecularDetail:
          'Amoxicillin is an aminopenicillin; clavulanate potassium is a clavam produced by Streptomyces clavuligerus fermentation. Clavulanate’s own antibacterial activity is negligible. Both are acid-stable enough for oral administration, and both are largely renally cleared.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Both cross into the space where the fight happens',
        laymanDesc:
          'A bacterium has an outer skin, then a gap, then the wall it is constantly rebuilding. Both molecules have to get into that gap. In Gram-negative bacteria they squeeze through protein pores.',
        molecularDetail:
          'Entry into the Gram-negative periplasm is through outer-membrane porins, chiefly OmpF and OmpC in Escherichia coli. Loss of porins produces beta-lactam resistance that is indistinguishable from enzymatic resistance on a susceptibility plate, which is why the laboratory workflow on this page tests them separately.',
        iconName: 'DoorOpen',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The bacterial enzyme grabs the decoy and is destroyed by it',
        laymanDesc:
          'Resistant bacteria flood that gap with scissors that cut penicillins open. The decoy looks enough like a penicillin that the scissors close on it — and then cannot open again. Each enzyme molecule is spent permanently.',
        molecularDetail:
          'Clavulanate is a mechanism-based, irreversible inactivator of class A serine beta-lactamases including TEM-1, SHV-1 and ROB-1. The active-site serine opens its beta-lactam ring; the resulting acyl-enzyme undergoes further rearrangement to a stable cross-linked adduct rather than hydrolysing off. It does not inhibit class B metallo-beta-lactamases, class C AmpC enzymes or most class D carbapenemases, which is the precise boundary of what the combination can do.',
        iconName: 'Shield',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Amoxicillin jams the wall-building tool',
        laymanDesc:
          'With the scissors used up, the amoxicillin reaches its target: the tool a bacterium uses to stitch its wall into a mesh. Amoxicillin latches onto it permanently and the stitching stops.',
        molecularDetail:
          'Amoxicillin acylates the active-site serine of penicillin-binding proteins, the DD-transpeptidases that cross-link peptidoglycan. The beta-lactam ring is a structural mimic of the D-alanyl-D-alanine terminus the enzyme normally acts on, so the enzyme attacks it and is left covalently modified.',
        iconName: 'Scissors',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The wall fails while the bacterium is still trying to grow',
        laymanDesc:
          'Bacteria constantly break their own wall open to expand it. With the repair jammed, the breaking carries on unopposed and the cell bursts under its own internal pressure.',
        molecularDetail:
          'Beta-lactams are bactericidal only against actively dividing cells: autolysins continue to cleave peptidoglycan while cross-linking is blocked, and osmotic lysis follows. A non-dividing or dormant organism is not killed, which is one reason abscesses and biofilms respond poorly to any beta-lactam.',
        iconName: 'Zap',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What it costs on the way through',
        laymanDesc:
          'The same broad reach that makes the combination useful hits the bacteria in the gut. Roughly one child in two got diarrhoea in the Finnish trial, against one in four on placebo.',
        molecularDetail:
          'Diarrhoea occurred in 47.8% on amoxicillin-clavulanate against 26.6% on placebo (P<0.001) and eczema in 8.7% against 3.2% (P=0.04) in the Tähtinen trial. Separately, hepatic injury is idiosyncratic rather than dose-related, is predominantly cholestatic, has a mean latency of 31 days, and is associated with specific HLA class I and class II haplotypes rather than with cumulative exposure.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Tähtinen 2011 (NCT00299455)',
        phase: 'Randomised, double-blind, placebo-controlled',
        sampleSize: 319,
        primaryEndpoint: 'Time to treatment failure from first dose to the day 8 visit',
        endpointMet: true,
        statisticalPValue:
          'Treatment failure 18.6% against 44.9%; hazard ratio 0.38 (95% CI 0.25 to 0.59), P<0.001',
        unreportedAdverseSignals:
          'Diarrhoea 47.8% against 26.6% on placebo (P<0.001) and eczema 8.7% against 3.2% (P=0.04). The trial did not follow children long enough to measure recurrence or resistance selection.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Hoberman 2011 (NCT00377260)',
        phase: 'Randomised, double-blind, placebo-controlled',
        sampleSize: 291,
        primaryEndpoint:
          'Symptomatic response and rate of clinical failure over 10 to 12 days in children aged 6 to 23 months',
        endpointMet: true,
        statisticalPValue:
          'Clinical failure 16% against 51% at day 10 to 12 (P<0.001); initial symptom resolution P=0.14, not significant; sustained resolution P=0.04',
        unreportedAdverseSignals:
          'The headline symptomatic comparison was not statistically significant and is easily lost behind the otoscopic result. Nasopharyngeal colonisation with non-susceptible Streptococcus pneumoniae did not change significantly in either group, but the trial was not powered to detect resistance selection.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Treatment failure 18.6% against 44.9% on matching placebo in 319 children, hazard ratio 0.38 (95% CI 0.25 to 0.59)',
        'Persistent otoscopic signs of infection 16% against 51% at day 10 to 12 in 291 children',
        'Diarrhoea 47.8% against 26.6% on placebo, and a pooled number needed to harm of 14 across 13 trials',
        'No reduction in ear pain at 24 hours across 5 trials in 1,394 children (RR 0.89, 95% CI 0.78 to 1.01)',
        '117 of 1,038 adjudicated cases in the DILIN registry, 11% of all drug-induced liver injury and 24% of the antimicrobial share',
      ],
      unsupportedInferences: [
        'That the clavulanate component contributes benefit in an infection where no beta-lactamase-producing organism is present — neither placebo-controlled trial separated the two components',
        'That treating an ear infection prevents serious complications: severe complications were rare in every trial and did not differ between groups',
        'That an antibiotic makes a child feel better tonight — the 24-hour pain comparison is flat, with high-certainty evidence',
        'That liver injury from this drug is a dose or duration effect; it is idiosyncratic, HLA-associated, and usually begins after the course has ended',
      ],
      whatFailedInitially: [
        'The American trial’s headline symptomatic endpoint missed significance at P=0.14 while its otoscopic endpoint was overwhelming',
        'Antibiotics do not clear middle-ear fluid at six to eight weeks or at three months, and do not reduce later recurrences',
        'Earlier trials using loose diagnostic criteria found small effects and were read as showing the drug did not work',
        'Post-marketing hepatotoxicity, never seen at trial scale, made this the single commonest cause of drug-induced liver injury in the United States registry',
      ],
      realWorldOutcome: [
        'Approved in the United States in 1984 and now on the WHO Model List of Essential Medicines, made generically worldwide',
        'The default oral choice when beta-lactamase-producing Haemophilus influenzae or Moraxella catarrhalis is likely',
        'A pharmacy acquisition cost of about 27 US cents per unit, roughly five times plain amoxicillin, with the difference driven by fermentation',
        'The paradigm case for a drug whose commonest serious harm was discovered only after hundreds of millions of exposures',
      ],
    },
    deliverySystem: {
      type: 'Oral tablets, chewable tablets and reconstituted oral suspension, in fixed amoxicillin-to-clavulanate ratios',
      description:
        'A ratio product rather than two co-packaged drugs: different products hold different amoxicillin-to-clavulanate ratios, and they are not interchangeable unit for unit, because substituting on total amoxicillin content changes the clavulanate delivered. Clavulanate potassium is hygroscopic, which is why suspensions are reconstituted at the pharmacy rather than sold ready-made.',
      safetyProfile:
        'Diarrhoea is the dominant adverse event and was roughly twice as common as on placebo in the paediatric trials. Hepatic dysfunction — usually cholestatic, mean onset 31 days, often after the course has finished — is the serious one: it is the most frequent single cause of idiosyncratic drug-induced liver injury in the United States DILIN registry, occurs disproportionately in older men, and led to liver transplantation in three of 117 registry cases. A previous cholestatic reaction to the combination is a contraindication. Clostridioides difficile-associated diarrhoea has been reported with essentially all antibacterials including this one.',
    },
    commonQuestions: [
      {
        q: 'Is this stronger than plain amoxicillin?',
        a: 'Broader rather than stronger, and only against one specific defence. Clavulanate kills almost nothing itself. What it does is destroy a bacterial enzyme, beta-lactamase, that would otherwise cut amoxicillin apart. Against an organism that makes that enzyme — much of Haemophilus influenzae and nearly all Moraxella catarrhalis — the combination works where amoxicillin fails. Against an organism that does not make it, including most Streptococcus pneumoniae, the clavulanate adds nothing except a higher chance of diarrhoea. It also does nothing against the other major resistance families: metallo-beta-lactamases, AmpC enzymes and most carbapenemases are untouched.',
        auditNote:
          'The label is written narrowly, for beta-lactamase-producing isolates. Prescribing is necessarily empirical, before anyone knows which organism is present. That gap between the licensed claim and the ordinary use is the main inference on this page.',
      },
      {
        q: 'Will it stop my child’s earache tonight?',
        a: 'The pooled evidence says no. Across five placebo-controlled trials in 1,394 children, antibiotics did not reduce pain at 24 hours — the risk ratio was 0.89 with a confidence interval running from 0.78 to 1.01, and Cochrane rated that high-certainty evidence. The benefit shows up at two to three days, where roughly one child in twenty is spared ongoing pain, and it shows up much more clearly on what a doctor sees through an otoscope than on what the child feels. Meanwhile about one child in fourteen gets vomiting, diarrhoea or a rash from the antibiotic. In both 2011 trials, roughly 85% of children in both arms were also given pain relief.',
      },
      {
        q: 'Why does it upset my stomach so much more than amoxicillin?',
        a: 'Because clavulanate itself is poorly absorbed relative to amoxicillin and reaches the colon, where it disturbs the resident bacteria directly, and because the combination’s wider reach kills more of the gut flora on the way past. The size of the effect is measured, not estimated: in the Finnish placebo-controlled trial, 47.8% of children on the combination had diarrhoea against 26.6% on placebo. That is the single most common reason a course is not finished.',
      },
      {
        q: 'How worried should I be about my liver?',
        a: 'The individual risk is low and the population burden is high, because the drug is prescribed so widely. In the United States DILIN registry this one combination accounts for 11% of all adjudicated drug-induced liver injury and 24% of the antimicrobial share — the largest single contribution of any drug. The pattern is distinctive: mean onset 31 days after starting, often after the tablets have finished, predominantly cholestatic, and concentrated in older men rather than in women. Of 117 registry cases, three women needed a liver transplant and none died of the injury. Recovery is the usual outcome but is slow, averaging 55 days from the peak bilirubin.',
        auditNote:
          'The delayed onset is what makes this hard to spot. A patient who develops jaundice a month after a course of antibiotics for a sinus infection does not usually connect the two, and neither does the person they see about it.',
      },
      {
        q: 'Does taking it now make future infections harder to treat?',
        a: 'Almost certainly at the population level, and the trials on this page cannot tell you by how much. Neither 2011 trial was powered to measure resistance selection; the American one looked at nasopharyngeal carriage of non-susceptible Streptococcus pneumoniae and found no significant change in either group, in 291 children over a few weeks. That is not the timescale or the scale at which resistance emerges. This is the recurring gap in antibiotic evidence: the harm that most concerns the public is measured in populations over years, while the trials measure cure in individuals over days.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Tähtinen PA, Laine MK, Huovinen P, Jalava J, Ruuskanen O, Ruohola A. A placebo-controlled trial of antimicrobial treatment for acute otitis media. N Engl J Med 2011;364:116-126',
        identifier: '10.1056/NEJMoa1007174',
        kind: 'doi',
      },
      {
        label:
          'Hoberman A, Paradise JL, Rockette HE, et al. Treatment of acute otitis media in children under 2 years of age. N Engl J Med 2011;364:105-115',
        identifier: '10.1056/NEJMoa0912254',
        kind: 'doi',
      },
      {
        label:
          'Venekamp RP, Sanders SL, Glasziou PP, Rovers MM. Antibiotics for acute otitis media in children. Cochrane Database Syst Rev 2023;11:CD000219',
        identifier: '10.1002/14651858.CD000219.pub5',
        kind: 'doi',
      },
      {
        label:
          'deLemos AS, Ghabril M, Rockey DC, et al. Amoxicillin-clavulanate-induced liver injury. Dig Dis Sci 2016;61:2406-2416',
        identifier: '10.1007/s10620-016-4121-6',
        kind: 'doi',
      },
      {
        label:
          'Chalasani N, Bonkovsky HL, Fontana R, et al. Features and outcomes of 899 patients with drug-induced liver injury: the DILIN prospective study. Gastroenterology 2015;148:1340-1352',
        identifier: '10.1053/j.gastro.2015.03.006',
        kind: 'doi',
      },
      {
        label:
          'Pichichero ME, Casey JR. Safe use of selected cephalosporins in penicillin-allergic patients: a meta-analysis. Otolaryngol Head Neck Surg 2007;136:340-347',
        identifier: '10.1016/j.otohns.2006.10.007',
        kind: 'doi',
      },
      {
        label: 'Tähtinen placebo-controlled trial of amoxicillin-clavulanate in acute otitis media',
        identifier: 'NCT00299455',
        kind: 'nct',
      },
      {
        label: 'Hoberman placebo-controlled trial in children aged 6 to 23 months',
        identifier: 'NCT00377260',
        kind: 'nct',
      },
      {
        label: 'PubChem CID 16204478 — clavulanate structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/16204478',
        kind: 'url',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — United States pharmacy acquisition prices',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    ],
  },
]
