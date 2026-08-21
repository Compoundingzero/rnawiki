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
        label:
          'PubChem CID 16204478 (clavulanate) — canonical SMILES, molecular formula and weight',
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
        evidenceSource: 'Tähtinen PA et al., N Engl J Med 2011;364:116-126 (NCT00299455)',
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
  // ---------------------------------------------------------------------------------------------
  // 2. Cephalexin — approved in 1971, still the default oral antibiotic for skin infection, and
  //    the one first-generation cephalosporin the modern penicillin-allergy reassurance excludes.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'cephalexin',
    name: 'Cephalexin',
    tradeName: 'Keflex',
    sponsor:
      'Eli Lilly (originator, from the Cephalosporium acremonium nucleus); the current United States application holder on NDA 050405 and NDA 050406 is Pragma, and the drug is made generically worldwide',
    targetGene:
      'Bacterial cell-wall genes ftsI, pbp2 and relatives — bacterial penicillin-binding-protein genes, not human ones',
    targetProtein: 'Bacterial penicillin-binding proteins (DD-transpeptidases)',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1971,
    indication:
      'Respiratory tract, otitis media, skin and skin structure, bone and genitourinary tract infections caused by susceptible isolates of the designated bacteria',
    patientFriendlyIndication:
      'Skin, throat, ear, bone and urinary infections caused by susceptible bacteria',
    anatomicalSite:
      'The bacterial cell envelope — the cross-linking machinery on the outer face of the cytoplasmic membrane',
    conditionContext: {
      conditionExplainer:
        'Cellulitis is a bacterial infection of the skin and the tissue just beneath it. It spreads sideways rather than forming a pocket, which is what separates it from an abscess. Most cases are caused by streptococci or by ordinary Staphylococcus aureus, both of which cephalexin kills.',
      whyItMatters:
        'It is one of the most-prescribed oral antibiotics in the world for a condition diagnosed by eye, with no test to confirm it. That makes the question of what it adds — and what it does not — unusually worth measuring, and unusually rarely measured.',
      whoTakesThis:
        'Adults and children with cellulitis, other skin and soft-tissue infection, streptococcal pharyngitis, bone infection or urinary infection due to a susceptible organism.',
      clinicalGoals:
        'Clinical cure: the redness, swelling and tenderness resolve without a second course, a hospital admission or a drainage procedure.',
    },
    oneSentenceVerdict:
      'A first-generation cephalosporin that jams the same wall-building enzyme a penicillin does, with a ring the common staphylococcal penicillinase cannot open — in the largest randomised trial it cured 85.5% of per-protocol patients with uncomplicated cellulitis on its own, and adding an antibiotic active against MRSA changed the cure rate by -2.0 percentage points (95% CI -9.7 to 5.7).',
    laymanHowItWorks:
      'Bacteria hold themselves together with a mesh wall that they constantly cut open and re-stitch as they grow. Cephalexin latches onto the stitching tool and will not let go. The cutting carries on, the stitching does not, and the cell bursts under its own pressure. Its ring is shaped so that the enzyme most staphylococci use to destroy penicillin cannot get at it.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 81,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0921 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 58 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States on 4 January 1971 under NDA 050405 and NDA 050406. All composition-of-matter protection expired decades ago; the drug is on the WHO Model List of Essential Medicines and dozens of manufacturers make it. At roughly nine United States cents a unit it is among the cheapest antibiotics in wide hospital and community use.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'For non-purulent cellulitis the evidence says the alternatives are interchangeable at the level of cure rate, and the choice turns on allergy history, cost and what the local staphylococci look like. The finding that matters more than any comparison between drugs is from the paediatric trial: where an abscess was drained, cure was 94 to 97% whether or not the antibiotic covered the organism that was actually cultured. Nothing sold as a food treats cellulitis, and a spreading red area with fever is not a condition to manage at home.',
      conventionalRx: [
        {
          name: 'Clindamycin',
          class: 'Lincosamide — a ribosome inhibitor, not a beta-lactam',
          howItCompares:
            'Covers community MRSA, which cephalexin does not, and is an option in true penicillin allergy because it shares no structure with a beta-lactam. In the head-to-head paediatric trial in a population where 69% grew MRSA, it produced no better outcome than cephalexin: 97% against 94% improved at 48 to 72 hours (P=.50).',
          typicalCost:
            'US$0.1684 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 96 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: MRSA cover, no beta-lactam cross-reactivity, suppresses toxin production. Cons: the antibiotic most strongly associated with Clostridioides difficile colitis; inducible resistance in some staphylococci is not visible on a routine plate.',
        },
        {
          name: 'Dicloxacillin',
          class: 'Antistaphylococcal penicillin',
          howItCompares:
            'The narrowest option against methicillin-susceptible Staphylococcus aureus, and the one with the least effect on anything else. It is a penicillin, so it is unavailable in penicillin allergy, and it is now more than ten times the price of cephalexin per unit in the United States.',
          typicalCost:
            'US$1.01 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 4 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: narrow spectrum, excellent against methicillin-susceptible S. aureus. Cons: no MRSA cover, poor tolerability on an empty stomach, and only four listed products, which is a supply risk in itself.',
        },
        {
          name: 'Cefadroxil',
          class: 'First-generation oral cephalosporin',
          howItCompares:
            'The same generation and essentially the same spectrum, with a longer half-life. It shares an identical side chain with amoxicillin rather than with ampicillin, so it carries the same side-chain cross-reactivity concern as cephalexin does, not less of one.',
          typicalCost:
            'US$0.2781 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 23 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: longer-acting, same spectrum. Cons: three times the price for no measured advantage; the same penicillin side-chain issue.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Ask whether it needs draining rather than which antibiotic',
          action:
            'If there is a pocket of pus, ask whether drainage is the treatment and the antibiotic the adjunct rather than the other way round.',
          patientImpact:
            'In the paediatric trial, spontaneous or performed drainage occurred in 97% of children, and all of them had improved by day 7 regardless of which antibiotic they received — even though 69% grew MRSA, which cephalexin cannot kill.',
          clinicalPrecaution:
            'This is a description of what a trial found, not advice to do anything to a skin lesion. The authors concluded that close follow-up and wound care mattered more than the antibiotic choice, which is not the same as saying the antibiotic is optional.',
        },
        {
          name: 'Be specific about what "penicillin allergy" meant',
          action:
            'Describe what actually happened — rash, hives, swelling, breathing difficulty, how long after the dose — rather than reporting the label alone.',
          patientImpact:
            'The blanket rule that penicillin-allergic patients react to cephalosporins about 10% of the time did not survive scrutiny, but cephalexin is the specific exception it does not rescue: it shares an identical side chain with ampicillin, and the pooled odds ratio for a reaction in a penicillin-allergic patient is 5.8 (95% CI 3.6 to 9.2).',
          clinicalPrecaution:
            'Second- and third-generation cephalosporins showed no increased risk in the same analysis (OR 1.1 and 0.5). The decision belongs to a clinician with the history in front of them; this page only records what the pooled data show.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC1=C(N2[C@@H]([C@@H](C2=O)NC(=O)[C@@H](C3=CC=CC=C3)N)SC1)C(=O)O',
      chemicalFormula: 'C16H17N3O4S',
      molecularWeight: '347.40 g/mol',
      targetReceptorAffinity:
        'Cephalexin acylates the active-site serine of bacterial DD-transpeptidases, forming a covalent penicilloyl-type adduct that hydrolyses back only very slowly. It has no human receptor: the target enzyme family has no mammalian counterpart, which is the structural reason beta-lactams are among the least intrinsically toxic drug classes in medicine. It is not hydrolysed by most staphylococcal penicillinase but is hydrolysed by extended-spectrum and AmpC beta-lactamases, and it does not bind PBP2a, the altered target that defines MRSA.',
      structureSource: {
        label: 'PubChem CID 27447 (cephalexin) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/27447',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'cfx-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Configuration check at the 6R,7R centres and the D-phenylglycine side chain',
          description:
            'Confirm the stereochemistry of the bicyclic nucleus and of the phenylglycine side chain before anything else. The side chain is not incidental: it is the exact feature cephalexin shares with ampicillin, and it is the reason a penicillin-allergic patient can react to this molecule and not to a third-generation cephalosporin.',
          reagentsAndBuffer:
            'Cephalexin monohydrate reference standard, chiral HPLC, 1H NMR in D2O, optical rotation, Karl Fischer titration',
        },
        {
          id: 'cfx-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Enzymatic acylation of 7-aminodeacetoxycephalosporanic acid',
          description:
            'Couple the D-phenylglycine side chain onto the 7-ADCA nucleus. Modern manufacture does this with an immobilised penicillin G acylase in water rather than by the older route through acid chlorides in organic solvent — a green-chemistry substitution that removed most of the solvent burden from one of the highest-tonnage antibiotics in the world.',
          dependsOnStepId: 'cfx-w1',
          reagentsAndBuffer:
            'Immobilised penicillin G acylase, 7-aminodeacetoxycephalosporanic acid, D-phenylglycine methyl ester, aqueous buffer at pH 6.5 to 7.0 with controlled temperature',
        },
        {
          id: 'cfx-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation as the monohydrate and residual-nucleus control',
          description:
            'Crystallise the monohydrate and quantify residual 7-ADCA and the phenylglycine ester. Unreacted nucleus is a specific concern in a beta-lactam: degradation and polymerisation products of this class are the immunogens that drive beta-lactam allergy, not the intact drug.',
          dependsOnStepId: 'cfx-w2',
          reagentsAndBuffer:
            'Isoelectric crystallisation with pH control, water-acetone antisolvent system, gradient HPLC for related substances, size-exclusion chromatography for polymeric impurities',
        },
        {
          id: 'cfx-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'PEPT1 transport assay in a Caco-2 intestinal monolayer',
          description:
            'Cephalexin is not passively absorbed. It is a substrate for PEPT1, the intestinal di- and tripeptide transporter, which is why an ionised molecule of this size achieves near-complete oral bioavailability. Confirm carrier-mediated uptake and its saturability across a differentiated monolayer, because a formulation change that alters dissolution rate can alter absorption far more than passive-uptake intuition predicts.',
          dependsOnStepId: 'cfx-w3',
          reagentsAndBuffer:
            'Caco-2 cells on permeable supports, Hanks balanced salt solution at apical pH 6.0 and basolateral pH 7.4, glycylsarcosine as competing substrate, transepithelial electrical resistance monitoring, LC-MS/MS quantification',
        },
        {
          id: 'cfx-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Penicillin-binding-protein competition and a mecA counter-screen',
          description:
            'Measure what the drug binds and what it cannot. Compete cephalexin against a labelled penicillin for the PBP set of a methicillin-susceptible Staphylococcus aureus, then repeat in a mecA-positive isolate. The second run is the point: PBP2a, the transpeptidase MRSA encodes, has an active site that essentially does not accept this molecule, and that single negative result defines the boundary of everything cephalexin can treat.',
          dependsOnStepId: 'cfx-w4',
          reagentsAndBuffer:
            'Membrane preparations from methicillin-susceptible and mecA-positive S. aureus, Bocillin FL fluorescent penicillin, SDS-PAGE with fluorescence imaging, cation-adjusted Mueller-Hinton broth with 2% NaCl for MIC confirmation',
        },
      ],
    },
    keyAudits: [
      {
        id: 'cfx-a1',
        category: 'measured',
        title: 'Cephalexin alone cured 85.5% of uncomplicated cellulitis; MRSA cover added nothing',
        laymanSummary:
          'Five American emergency departments randomised patients with plain cellulitis — no pus, no abscess — to cephalexin plus an antibiotic that kills MRSA, or cephalexin plus a placebo. The two groups came out the same. If anything the cephalexin-alone group did slightly better.',
        technicalDetails:
          'Moran and colleagues randomised 500 outpatients older than 12 with cellulitis and no wound, drainage or abscess, with ultrasound at enrolment to exclude an occult abscess. In the pre-specified per-protocol population, clinical cure occurred in 182 of 218 (83.5%) on cephalexin plus trimethoprim-sulfamethoxazole against 165 of 193 (85.5%) on cephalexin plus placebo — a difference of -2.0 percentage points (95% CI -9.7 to 5.7, P=.50). Adverse events, overnight hospitalisation, recurrent skin infection and similar infection in household contacts did not differ through 7 to 9 weeks.',
        evidenceSource: 'Moran GJ et al., JAMA 2017;317:2088-2096 (NCT00729937)',
        doi: '10.1001/jama.2017.5653',
        measuredMetric:
          'Clinical cure at 14 to 21 days, cephalexin plus trimethoprim-sulfamethoxazole against cephalexin plus placebo',
        auditFlag: 'verified',
      },
      {
        id: 'cfx-a2',
        category: 'measured',
        title: 'In children where 69% grew MRSA, a drug with no MRSA activity matched one with it',
        laymanSummary:
          'Two hundred children with skin infections were given either cephalexin, which cannot kill MRSA, or clindamycin, which can. Most of them turned out to have MRSA. It made no measurable difference which antibiotic they got.',
        technicalDetails:
          'Chen and colleagues randomised 200 patients aged 6 months to 18 years with uncomplicated skin and soft-tissue infection to 7 days of cephalexin or clindamycin. MRSA was cultured from 69% of wounds, mostly USA300, Panton-Valentine leukocidin-positive and clindamycin-susceptible. By 48 to 72 hours, 94% of the cephalexin arm and 97% of the clindamycin arm had improved (P=.50); by day 7 every patient had improved, with complete resolution in 97% and 94% respectively (P=.33). Spontaneous drainage occurred or a drainage procedure was performed in 97% of subjects. Fever and age under one year predicted early failure; initial erythema greater than 5 cm did not.',
        evidenceSource: 'Chen AE et al., Pediatrics 2011;127:e573-e580',
        doi: '10.1542/peds.2010-2053',
        measuredMetric:
          'Clinical improvement at 48 to 72 hours and resolution at 7 days, cephalexin against clindamycin',
        auditFlag: 'verified',
      },
      {
        id: 'cfx-a3',
        category: 'failed',
        title: 'Roughly a quarter of cellulitis patients were not cured by either arm',
        laymanSummary:
          'The headline of the cellulitis trial is that the two arms matched. The number underneath it is that in the population as randomised, only about seven in ten were cured — by a week of oral antibiotics, in an infection generally treated as straightforward.',
        technicalDetails:
          'In the modified intention-to-treat population of the Moran trial, clinical cure occurred in 189 of 248 (76.2%) on cephalexin plus trimethoprim-sulfamethoxazole and 171 of 248 (69.0%) on cephalexin plus placebo. Failure was defined against explicit criteria at scheduled visits — fever, more than 25% increase in erythema at days 3 to 4, no decrease at days 8 to 10, more than minimal residual signs at days 14 to 21 — so the figure reflects a strict definition rather than clinical judgement. Median erythema at enrolment was 13.0 cm by 10.0 cm; 10.9% of participants had diabetes. Roughly 18% of randomised patients did not complete per protocol, and the gap between the two populations is where most of the trial’s ambiguity lives.',
        evidenceSource: 'Moran GJ et al., JAMA 2017;317:2088-2096 (NCT00729937)',
        doi: '10.1001/jama.2017.5653',
        measuredMetric:
          'Clinical cure in the modified intention-to-treat population under pre-specified failure criteria',
        auditFlag: 'caution',
      },
      {
        id: 'cfx-a4',
        category: 'inferred',
        title: 'The trial did not rule out a real benefit from adding MRSA cover',
        laymanSummary:
          'This trial is widely quoted as showing MRSA coverage is unnecessary in plain cellulitis. In the population as randomised, the confidence interval reached as high as a fifteen-point advantage for adding it. The authors said so themselves.',
        technicalDetails:
          'In the per-protocol analysis the difference was -2.0 percentage points (95% CI -9.7 to 5.7, P=.50), consistent with no benefit. In the modified intention-to-treat analysis the difference was +7.3 percentage points (95% CI -1.0 to 15.5, P=.07), an interval whose upper bound exceeds the 10% the investigators had pre-specified as clinically significant. The published conclusion is explicit: because imprecision around the intention-to-treat finding included a clinically important difference favouring the combination, further research may be needed. A negative per-protocol result in a trial with 18% protocol deviation is a weaker statement than "it does not help".',
        evidenceSource: 'Moran GJ et al., JAMA 2017;317:2088-2096, Conclusions and Relevance',
        doi: '10.1001/jama.2017.5653',
        inferredClaim:
          'That covering MRSA adds nothing in non-purulent cellulitis — supported in the per-protocol analysis, not excluded by the intention-to-treat analysis, and quoted far more confidently than either supports',
        auditFlag: 'contested',
      },
      {
        id: 'cfx-a5',
        category: 'conclusion_shift',
        title:
          'The 10% penicillin cross-reactivity rule collapsed — and cephalexin is the exception',
        laymanSummary:
          'For decades doctors were taught that anyone allergic to penicillin had about a one-in-ten chance of reacting to any cephalosporin. That figure came from a period when cephalosporins were contaminated with traces of penicillin. The modern answer is that the risk depends on whether the two drugs share the same side chain — and cephalexin shares one with ampicillin.',
        technicalDetails:
          'Pichichero and Casey pooled nine studies from a 1960 to 2005 literature search. Penicillin-allergic patients showed significantly increased reactions to cephalothin (OR 2.5, 95% CI 1.1 to 5.5), cephaloridine (OR 8.7, 95% CI 5.9 to 12.8) and cephalexin (OR 5.8, 95% CI 3.6 to 9.2), and to first-generation cephalosporins plus cefamandole taken together (OR 4.8, 95% CI 3.7 to 6.2). No increase was seen with second-generation agents (OR 1.1, 95% CI 0.6 to 2.1) or third-generation agents (OR 0.5, 95% CI 0.2 to 1.1). Clinical challenge, skin testing and monoclonal antibody work all point to R1 side-chain similarity rather than to the shared beta-lactam ring as the determinant. Cephalexin carries a D-phenylglycine side chain identical to ampicillin’s, and cefadroxil carries one identical to amoxicillin’s.',
        evidenceSource:
          'Pichichero ME, Casey JR. Safe use of selected cephalosporins in penicillin-allergic patients: a meta-analysis. Otolaryngol Head Neck Surg 2007;136:340-347',
        doi: '10.1016/j.otohns.2006.10.007',
        inferredClaim:
          'That the collapse of the class-wide 10% figure means cephalosporins are broadly safe after penicillin allergy — true for the second and third generations in this analysis, and specifically not shown for cephalexin, the most-prescribed member of the generation it exonerates least',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Carried across the gut wall by a transporter, not by diffusion',
        laymanDesc:
          'Most drugs seep through the gut lining. This one is picked up by a pump the body built to absorb fragments of digested protein, which mistakes it for one. That is why an otherwise poorly absorbable molecule ends up almost completely absorbed.',
        molecularDetail:
          'Cephalexin is a substrate for PEPT1 (SLC15A1), the proton-coupled intestinal di- and tripeptide transporter, and for PEPT2 in the renal tubule. Carrier-mediated uptake gives near-complete oral bioavailability for a zwitterionic beta-lactam that would otherwise cross membranes poorly, and it is saturable, which is a different absorption profile from a passively absorbed drug.',
        iconName: 'ArrowRightLeft',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It reaches the outside of the bacterial membrane',
        laymanDesc:
          'The target is not inside the bacterium. The wall-stitching tools sit on the outer face of the bacterial membrane, so the drug never has to get into the cell at all.',
        molecularDetail:
          'Penicillin-binding proteins are anchored in the cytoplasmic membrane with their catalytic domains facing outward into the peptidoglycan layer. In Gram-positive organisms the drug reaches them directly; in Gram-negatives it must first cross the outer membrane through porins, which is one reason cephalexin’s Gram-negative range is narrow.',
        iconName: 'Layers',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It impersonates the piece the enzyme is looking for',
        laymanDesc:
          'The stitching enzyme grabs a specific two-unit tail on the wall material. The drug’s ring is shaped like that tail. The enzyme grabs it, opens the ring, and is left permanently attached.',
        molecularDetail:
          'The strained four-membered beta-lactam ring mimics the D-alanyl-D-alanine terminus of the peptidoglycan pentapeptide. Nucleophilic attack by the active-site serine opens the ring and produces a covalent acyl-enzyme that deacylates orders of magnitude more slowly than the natural intermediate. The cephem sulfur and the 3-methyl substituent are what make this ring a poor substrate for most staphylococcal penicillinase.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Building stops while demolition continues',
        laymanDesc:
          'A growing bacterium is constantly cutting its own wall open to expand it. With the repair enzymes jammed, the cutting proceeds unopposed and the wall thins until the cell bursts.',
        molecularDetail:
          'Autolysins continue to hydrolyse peptidoglycan while cross-linking is blocked, producing osmotic lysis. Killing is therefore time-dependent and requires actively dividing cells; a dormant organism inside a biofilm or a walled-off collection is not killed by any concentration.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'What it cannot reach at all',
        laymanDesc:
          'MRSA carries a replacement stitching tool with a differently shaped grip. Cephalexin cannot get hold of it. No dose changes that — it is a shape mismatch, not a strength problem.',
        molecularDetail:
          'The mecA gene encodes PBP2a, a transpeptidase whose active site adopts a closed conformation with very low acylation efficiency for essentially all beta-lactams except the fifth-generation cephalosporins designed against it. Cephalexin also lacks useful activity against Enterococcus, Haemophilus influenzae, Pseudomonas and organisms producing extended-spectrum or AmpC beta-lactamases.',
        iconName: 'Ban',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What the trials measured on the other side',
        laymanDesc:
          'In the two head-to-head trials, adding cover for the organism cephalexin cannot kill did not improve the outcome. In one of them, nearly everyone had the pus drained, and that may be what did the work.',
        molecularDetail:
          'Per-protocol cure was 85.5% with cephalexin plus placebo against 83.5% with added trimethoprim-sulfamethoxazole in 411 adults with non-purulent cellulitis. In 200 children with 69% MRSA prevalence and 97% drainage, day-7 resolution was 97% with cephalexin against 94% with clindamycin. Neither trial measured whether antibiotic choice affected subsequent resistance carriage.',
        iconName: 'BarChart3',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Moran 2017 (NCT00729937)',
        phase: 'Phase 4, multicentre, double-blind, randomised superiority',
        sampleSize: 500,
        primaryEndpoint:
          'Clinical cure of uncomplicated non-purulent cellulitis in the per-protocol population',
        endpointMet: false,
        statisticalPValue:
          'Per protocol 83.5% against 85.5%, difference -2.0 percentage points (95% CI -9.7 to 5.7), P=.50; modified intention-to-treat 76.2% against 69.0%, difference 7.3 points (95% CI -1.0 to 15.5), P=.07',
        unreportedAdverseSignals:
          'The superiority hypothesis failed, but the intention-to-treat interval reached +15.5 points, above the 10% the investigators had called clinically significant. An 18% protocol-deviation rate separates the two populations, and the trial is routinely cited on the per-protocol result alone.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Chen 2011 paediatric skin and soft-tissue infection trial',
        phase: 'Randomised, controlled, single-centre',
        sampleSize: 200,
        primaryEndpoint: 'Clinical improvement at 48 to 72 hours',
        endpointMet: true,
        statisticalPValue:
          'Cephalexin 94% against clindamycin 97% improved at 48 to 72 hours (P=.50); resolution at day 7 97% against 94% (P=.33)',
        unreportedAdverseSignals:
          'Drainage occurred spontaneously or was performed in 97% of children, so the trial cannot separate the antibiotic effect from the effect of drainage. It was powered to detect superiority of clindamycin, not to establish equivalence.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Clinical cure 85.5% with cephalexin plus placebo against 83.5% with added trimethoprim-sulfamethoxazole in 411 per-protocol adults with cellulitis',
        'Difference of -2.0 percentage points (95% CI -9.7 to 5.7) for adding MRSA coverage in the per-protocol analysis',
        'Day-7 resolution 97% on cephalexin against 94% on clindamycin in 200 children of whom 69% grew MRSA',
        'Odds ratio 5.8 (95% CI 3.6 to 9.2) for an allergic reaction to cephalexin in penicillin-allergic patients, against 1.1 and 0.5 for second- and third-generation agents',
      ],
      unsupportedInferences: [
        'That MRSA coverage is unnecessary in non-purulent cellulitis — the intention-to-treat interval reached +15.5 percentage points and the authors called for further research',
        'That the collapse of the 10% cross-reactivity figure exonerates cephalexin, when cephalexin is the first-generation agent the same analysis flagged',
        'That the paediatric result shows the antibiotic did not matter, when 97% of those children also had the lesion drained',
        'That a 1971 approval implies the same evidentiary base as a modern one — the label carries no efficacy figures at all',
      ],
      whatFailedInitially: [
        'The Moran superiority hypothesis failed: adding MRSA coverage did not raise the per-protocol cure rate',
        'Roughly a quarter to a third of intention-to-treat patients were not cured in either arm under strict failure criteria',
        'Cephalexin has no activity against MRSA, Enterococcus, Pseudomonas or extended-spectrum beta-lactamase producers, and no dose changes that',
        'The class-wide reassurance about cephalosporins after penicillin allergy does not extend to this molecule, because of a shared side chain',
      ],
      realWorldOutcome: [
        'Approved 4 January 1971 under NDA 050405 and NDA 050406 and still among the most-prescribed oral antibiotics in the world',
        'On the WHO Model List of Essential Medicines at roughly nine United States cents per unit',
        'The default oral choice for non-purulent cellulitis in the guidelines of most high-income countries',
        'Manufactured by an enzymatic route that replaced the older solvent-heavy chemistry, at a scale of thousands of tonnes a year',
      ],
    },
    deliverySystem: {
      type: 'Oral capsules, tablets and reconstituted oral suspension',
      description:
        'Absorbed by the PEPT1 peptide transporter rather than by passive diffusion, which gives near-complete oral bioavailability and makes the drug unusual among beta-lactams in not needing an intravenous route for ordinary infections. Cleared largely unchanged by the kidney, so exposure rises substantially when renal function is reduced.',
      safetyProfile:
        'One of the better-tolerated antibiotics in wide use. Gastrointestinal upset and rash are the common events. The serious concerns are hypersensitivity — including reactions in penicillin-allergic patients, where cephalexin’s shared side chain with ampicillin gives a pooled odds ratio of 5.8 — and Clostridioides difficile-associated diarrhoea, reported with essentially all antibacterials. It can produce false-positive urine glucose tests with copper-reduction methods and a positive direct Coombs test.',
    },
    commonQuestions: [
      {
        q: 'Does it work if I have MRSA?',
        a: 'No, and no dose changes that. MRSA carries a gene, mecA, encoding a replacement wall-stitching enzyme called PBP2a whose active site essentially does not accept cephalexin. It is a shape mismatch rather than a matter of concentration. What is genuinely surprising is what happened when that was tested: in 200 children with skin infections of whom 69% grew MRSA, cephalexin produced the same outcomes as clindamycin, which does kill MRSA — 97% against 94% resolved at day 7. The likely explanation is in the same paper: 97% of those children had the lesion drained, and drainage is what treats a walled-off collection.',
        auditNote:
          'The trial was designed to show clindamycin was superior. It did not, but it also was not powered to prove equivalence, and a trial that fails to find a difference is not a trial that found sameness.',
      },
      {
        q: 'I am allergic to penicillin. Can I take this?',
        a: 'That is a clinician’s decision with your history in front of them, and this is the cephalosporin where the modern reassurance applies least. The old teaching — about a 10% chance of cross-reaction with any cephalosporin — came from an era when cephalosporins were contaminated with traces of penicillin, and it did not survive scrutiny. But the replacement understanding is that risk tracks the side chain rather than the shared ring, and cephalexin carries a D-phenylglycine side chain identical to ampicillin’s. In the pooled analysis, penicillin-allergic patients had an odds ratio of 5.8 (95% CI 3.6 to 9.2) for a reaction to cephalexin, while second-generation agents came in at 1.1 and third-generation at 0.5.',
      },
      {
        q: 'Why is it still used when it was approved in 1971?',
        a: 'Because the organisms it was designed against — streptococci and methicillin-susceptible Staphylococcus aureus — have not developed widespread resistance to it, and nothing since has been shown to cure ordinary cellulitis better. Its longevity is also a warning about the evidence base: a 1971 label carries no efficacy figures, no trial descriptions and no confidence intervals, because it was not required to. Almost everything numerical on this page comes from investigator-led trials run decades after approval, and there are only a handful of them.',
      },
      {
        q: 'The redness has not gone after a week. Has it failed?',
        a: 'Not necessarily, and the trials show how common that is. In the largest randomised trial of cellulitis, under strict pre-specified criteria, cure at 14 to 21 days occurred in 69.0% to 76.2% of the population as randomised — roughly a quarter of people did not meet the cure definition in either arm. Residual redness and discoloration can persist well after the infection is controlled, which is one reason the trial used explicit criteria at scheduled visits rather than clinical judgement. Whether a given case is failing is a question for the person who examined it.',
      },
      {
        q: 'Does taking it change what I might catch later?',
        a: 'Nobody measured that in either trial on this page, and it is the honest answer rather than a hedge. The Moran trial followed household contacts for similar infections through 7 to 9 weeks and found no difference between groups, but that is contact transmission, not resistance selection. Neither trial cultured participants afterwards to see what antibiotic-resistant organisms they were carrying. This gap is not specific to cephalexin: it is the standard shape of antibiotic evidence, where cure in one person over days is measured and resistance in a population over years is not.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Moran GJ, Krishnadasan A, Mower WR, et al. Effect of cephalexin plus trimethoprim-sulfamethoxazole vs cephalexin alone on clinical cure of uncomplicated cellulitis: a randomized clinical trial. JAMA 2017;317:2088-2096',
        identifier: '10.1001/jama.2017.5653',
        kind: 'doi',
      },
      {
        label:
          'Chen AE, Carroll KC, Diener-West M, et al. Randomized controlled trial of cephalexin versus clindamycin for uncomplicated pediatric skin infections. Pediatrics 2011;127:e573-e580',
        identifier: '10.1542/peds.2010-2053',
        kind: 'doi',
      },
      {
        label:
          'Pichichero ME, Casey JR. Safe use of selected cephalosporins in penicillin-allergic patients: a meta-analysis. Otolaryngol Head Neck Surg 2007;136:340-347',
        identifier: '10.1016/j.otohns.2006.10.007',
        kind: 'doi',
      },
      {
        label: 'Moran cellulitis trial: cephalexin plus trimethoprim-sulfamethoxazole or placebo',
        identifier: 'NCT00729937',
        kind: 'nct',
      },
      {
        label:
          'Drugs@FDA: KEFLEX (cephalexin), NDA 050405 and NDA 050406, Pragma — original approval 4 January 1971',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=050405',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 27447 — cephalexin structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/27447',
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
  // ---------------------------------------------------------------------------------------------
  // 3. Ceftriaxone — the once-daily injectable that runs emergency medicine, and the only drug in
  //    this file whose commonest serious harm was quantified by a placebo-controlled trial in a
  //    disease it does not treat.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'ceftriaxone',
    name: 'Ceftriaxone',
    tradeName: 'Rocephin',
    sponsor:
      'Hoffmann-La Roche (originator, approved 1984); now made generically by dozens of manufacturers worldwide',
    targetGene:
      'Bacterial cell-wall genes ftsI (PBP3) and relatives — bacterial penicillin-binding-protein genes, not human ones',
    targetProtein:
      'Bacterial penicillin-binding proteins, principally PBP3 in Gram-negative organisms (DD-transpeptidases)',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1984,
    indication:
      'Lower respiratory tract, skin and skin structure, urinary tract, intra-abdominal and gynaecologic infections, bacterial septicaemia, bone and joint infection, bacterial meningitis, acute bacterial otitis media, uncomplicated gonorrhoea and surgical prophylaxis, caused by susceptible organisms',
    patientFriendlyIndication:
      'Serious bacterial infections given by injection — pneumonia, meningitis, bloodstream, bone, urinary and sexually transmitted infection',
    anatomicalSite:
      'The bacterial cell envelope. Clinically the other site that matters is the biliary tree and the renal collecting system, where the drug precipitates as an insoluble calcium salt.',
    conditionContext: {
      conditionExplainer:
        'Ceftriaxone is not for one disease. It is the drug reached for when someone is admitted with a serious infection and nobody yet knows which bacterium it is — pneumonia, meningitis, a bloodstream infection, a bone infection, gonorrhoea.',
      whyItMatters:
        'It is one of a very small number of antibiotics that reach the fluid around the brain in useful amounts, and it is the last agent that reliably cures gonorrhoea. Both of those positions are being eroded from different directions.',
      whoTakesThis:
        'Adults, children and newborns with serious bacterial infection, given by injection or infusion. It is used at enormous volume in emergency departments because it lasts long enough to give once a day.',
      clinicalGoals:
        'Clinical cure, and in meningitis and bloodstream infection, survival. Most of its indications were approved on cure rates in the mid-1980s rather than on mortality.',
    },
    oneSentenceVerdict:
      'A third-generation cephalosporin whose side chain resists the beta-lactamases that destroy older penicillins and whose long half-life allows once-daily injection — it cured 87.9% of clinically evaluable community-acquired pneumonia patients in two pooled phase 3 trials, and in the only large placebo-controlled trial it has ever had, 62% of the 340 people who received it developed hepatobiliary adverse events against 11% on placebo.',
    laymanHowItWorks:
      'Bacteria hold their shape with a mesh wall they constantly rebuild. Ceftriaxone jams the tool that does the rebuilding, so the wall thins and the cell bursts. It is built with a chemical shield that stops most bacterial defence enzymes from cutting it apart, and it sticks to blood proteins so tightly that one injection lasts a day. It leaves partly through the bile, and in the gallbladder it can clump into sludge.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 83,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$1.44 per vial at United States pharmacy acquisition cost (CMS NADAC, median across 39 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States in 1984 as Rocephin. Composition-of-matter protection expired long ago and the drug is on the WHO Model List of Essential Medicines. At about US$1.44 a vial it is one of the cheapest ways to deliver a full day of broad-spectrum antibacterial cover, which is a large part of why it is prescribed as heavily as it is.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Ceftriaxone is chosen for a combination of spectrum, brain penetration and once-a-day convenience, and every alternative gives up at least one of those. The narrower agents are better where the organism is known; the carbapenems cover what ceftriaxone has lost to extended-spectrum beta-lactamases; the oral agents avoid a cannula. Nothing sold as a food or a supplement treats meningitis, pneumonia or gonorrhoea, and this is a page where that has to be said plainly.',
      conventionalRx: [
        {
          name: 'Cefazolin',
          class: 'First-generation cephalosporin',
          howItCompares:
            'Far narrower, and better where the organism is known to be methicillin-susceptible Staphylococcus aureus — it binds staphylococcal penicillin-binding proteins more effectively than ceftriaxone does. It does not enter the cerebrospinal fluid usefully, so it is not an option in meningitis, and it needs more frequent administration.',
          typicalCost:
            'US$1.03 per vial at United States pharmacy acquisition cost (CMS NADAC, median across 9 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: narrower selection pressure, stronger against staphylococci, similar cost. Cons: no meningeal penetration, no useful cover for the Gram-negative range ceftriaxone was built for.',
        },
        {
          name: 'Ertapenem',
          class: 'Carbapenem, once daily',
          howItCompares:
            'Keeps the once-daily schedule and covers the extended-spectrum beta-lactamase producers that ceftriaxone has lost — the exact organisms the MERINO trial was built around. It has no useful activity against Pseudomonas, which the other carbapenems do.',
          typicalCost:
            'US$27.76 per vial at United States pharmacy acquisition cost (CMS NADAC, median across 14 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: covers ESBL producers, once daily. Cons: about nineteen times the price per day, and every carbapenem prescription is selection pressure on the class held in reserve for organisms nothing else reaches.',
        },
        {
          name: 'Levofloxacin',
          class: 'Fluoroquinolone',
          howItCompares:
            'Covers the respiratory organisms including the atypicals ceftriaxone misses entirely, and is absorbed so well by mouth that it removes the need for a cannula. It carries class warnings for tendon rupture, peripheral neuropathy and aortic events that ceftriaxone does not.',
          typicalCost:
            'US$0.1339 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 26 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: oral, atypical cover, a tenth of the cost. Cons: serious class-wide adverse events, QT prolongation, and rapid resistance selection in Enterobacterales.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Report right upper abdominal pain during or after a course',
          action:
            'Tell the treating team about new pain under the right ribs, nausea after fatty food, or pain on passing urine during or shortly after a course of ceftriaxone.',
          patientImpact:
            'Ceftriaxone forms an insoluble calcium salt in bile and in urine. In the placebo-controlled ALS trial, 62% of ceftriaxone recipients had hepatobiliary adverse events against 11% on placebo, and 12% had serious ones — despite every one of them also receiving ursodeoxycholic acid specifically to prevent this.',
          clinicalPrecaution:
            'Most sludge is reversible when the drug is stopped, and the pooled paediatric urolithiasis frequency is about 7% with wide uncertainty. This is a reason to report a symptom, not a reason to stop an antibiotic without advice.',
        },
        {
          name: 'Say if the patient is a newborn, or is receiving calcium-containing fluids',
          action:
            'Make sure the team knows the exact age in days for a newborn, and flag any calcium-containing intravenous fluid running at the same time.',
          patientImpact:
            'Ceftriaxone and intravenous calcium can precipitate together. The FDA warned against the combination in all patients in 2007 and narrowed the warning in April 2009 to neonates aged 28 days or younger, in whom the combination remains contraindicated.',
          clinicalPrecaution:
            'The narrowing was based on evidence that the adult risk was not supported. It was not a withdrawal of the neonatal contraindication, which stands.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CN1C(=NC(=O)C(=O)N1)SCC2=C(N3[C@@H]([C@@H](C3=O)NC(=O)/C(=N\\OC)/C4=CSC(=N4)N)SC2)C(=O)O',
      chemicalFormula: 'C18H18N8O7S3',
      molecularWeight: '554.60 g/mol',
      targetReceptorAffinity:
        'Ceftriaxone acylates bacterial DD-transpeptidases, with highest affinity for PBP3 in Gram-negative organisms — the enzyme that builds the septum during division, which is why sub-lethal exposure produces filamentous cells. Its aminothiazolyl methoxyimino side chain sterically obstructs hydrolysis by staphylococcal penicillinase and by the common TEM-1 and SHV-1 enzymes, but not by extended-spectrum derivatives of those same enzymes or by AmpC. Human protein binding is concentration-dependent and high, around 85 to 95%, which is the source of the long half-life rather than slow clearance.',
      structureSource: {
        label: 'PubChem CID 5479530 (ceftriaxone) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5479530',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'cro-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Syn-oxime geometry and triazinedione tautomer confirmation',
          description:
            'Confirm the methoxyimino group is in the syn configuration and check the tautomeric state of the triazinedione leaving group. The anti isomer is markedly less stable to beta-lactamase and markedly less active, so this is not a purity check but an identity one: the geometry at that double bond is most of what separates a third-generation cephalosporin from a first.',
          reagentsAndBuffer:
            'Ceftriaxone sodium reference standard, 1H and 13C NMR in D2O and DMSO-d6, ultraviolet spectroscopy, gradient HPLC for related substances',
        },
        {
          id: 'cro-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Acylation of the 7-ACA nucleus and installation of the triazinedione thiol',
          description:
            'Acylate the 7-aminocephalosporanic acid nucleus with the activated aminothiazolyl methoxyimino acid, then displace the 3-acetoxy group with the triazinedione thiol. The second substitution is what gives ceftriaxone its half-life and, unavoidably, its calcium-binding behaviour: the same electron-rich heterocycle that slows clearance is the group that chelates.',
          dependsOnStepId: 'cro-w1',
          reagentsAndBuffer:
            'Activated 2-(2-aminothiazol-4-yl)-2-methoxyiminoacetic acid ester, 7-aminocephalosporanic acid, 2-methyl-1,2,4-triazine-3,5-dione-6-thiol, sodium bicarbonate buffer, controlled temperature under nitrogen',
        },
        {
          id: 'cro-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Isolation as the disodium hemiheptahydrate and polymer control',
          description:
            'Crystallise the sodium salt and quantify polymeric degradation products by size-exclusion chromatography. Beta-lactam polymers, not the intact drug, are a principal immunogen in beta-lactam hypersensitivity, so this assay is a safety specification rather than a cosmetic one.',
          dependsOnStepId: 'cro-w2',
          reagentsAndBuffer:
            'Sodium 2-ethylhexanoate, aqueous-ethanol crystallisation, size-exclusion chromatography with ultraviolet detection, Karl Fischer titration for the hydrate stoichiometry',
        },
        {
          id: 'cro-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Outer-membrane transit and a calcium-precipitation counter-screen',
          description:
            'Confirm porin-mediated entry into the Gram-negative periplasm, then run the same drug against physiological calcium concentrations in simulated bile and urine. The second half of this step exists because ceftriaxone has two delivery problems, not one: getting into the bacterium, and staying in solution on the way out of the body.',
          dependsOnStepId: 'cro-w3',
          reagentsAndBuffer:
            'Isogenic Escherichia coli porin-deletion panel, simulated bile with taurocholate and physiological calcium chloride, artificial urine at pH 5.5 and 7.0, dynamic light scattering and polarised light microscopy for precipitate detection',
        },
        {
          id: 'cro-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'PBP3 affinity, filamentation imaging and an ESBL panel',
          description:
            'Measure binding to the penicillin-binding-protein set and image the morphological signature: preferential PBP3 inhibition stops septum formation, so Gram-negative rods elongate into filaments before they lyse. Then run minimum inhibitory concentrations against a defined panel of TEM, SHV, CTX-M and AmpC producers, because the boundary of what ceftriaxone can still treat is defined entirely by which enzyme an isolate carries.',
          dependsOnStepId: 'cro-w4',
          reagentsAndBuffer:
            'Membrane preparations from Escherichia coli, Bocillin FL fluorescent penicillin, SDS-PAGE with fluorescence imaging, phase-contrast microscopy, characterised CTX-M-15, SHV-12 and AmpC-hyperproducing clinical isolates in cation-adjusted Mueller-Hinton broth',
        },
      ],
    },
    keyAudits: [
      {
        id: 'cro-a1',
        category: 'measured',
        title:
          'Ceftriaxone cured 87.9% of evaluable pneumonia patients in two pooled phase 3 trials',
        laymanSummary:
          'In two randomised trials designed to test a rival drug, ceftriaxone was the comparator and won. Roughly nine in ten evaluable patients hospitalised with pneumonia were cured.',
        technicalDetails:
          'Two double-blind phase 3 trials in adults hospitalised with community-acquired pneumonia randomised patients to intravenous daptomycin or ceftriaxone once daily for 5 to 14 days. Pooled, the intent-to-treat population held 421 ceftriaxone and 413 daptomycin patients and the clinically evaluable population held 371 and 369. Clinical cure at test of cure was 87.9% with ceftriaxone against 79.4% with daptomycin in the clinically evaluable population (95% CI for the difference -13.8% to -3.2%) and 77.4% against 70.9% in the intent-to-treat population (95% CI -12.4% to -0.6%). Both intervals exclude zero in ceftriaxone’s favour.',
        evidenceSource: 'Pertel PE et al., Clin Infect Dis 2008;46:1142-1151',
        doi: '10.1086/533441',
        measuredMetric:
          'Clinical cure at test of cure in hospitalised community-acquired pneumonia, ceftriaxone against daptomycin',
        auditFlag: 'verified',
      },
      {
        id: 'cro-a2',
        category: 'measured',
        title: '62% hepatobiliary adverse events against 11% on placebo, with prophylaxis in place',
        laymanSummary:
          'The best measurement of ceftriaxone’s gallbladder problem comes from a trial in a completely different disease, because it is the only large placebo-controlled trial the drug has ever had. Nearly two in three people on ceftriaxone had a liver or gallbladder problem. One in nine had a serious one. Every one of them was also taking a drug meant to prevent exactly that.',
        technicalDetails:
          'In the three-stage ALS trial, 340 participants received intravenous ceftriaxone and 173 placebo, at home through a central venous catheter, for a median of many months. Hepatobiliary adverse events occurred in 211 of 340 (62%) against 19 of 173 (11%), P<0.0001, and serious hepatobiliary adverse events in 41 participants (12%). Gastrointestinal adverse events occurred in 245 of 340 (72%) against 97 of 173 (56%), P=0.0004. Every ceftriaxone participant also received 300 mg ursodeoxycholic acid twice daily specifically to minimise biliary effects, and placebo participants received matched placebo capsules — so these rates are on top of prophylaxis, not instead of it.',
        evidenceSource:
          'Cudkowicz ME et al., Lancet Neurol 2014;13:1083-1091 (NCT00349622), Safety findings',
        doi: '10.1016/S1474-4422(14)70222-4',
        measuredMetric:
          'Hepatobiliary and gastrointestinal adverse event rates against matching placebo over prolonged exposure',
        auditFlag: 'caution',
      },
      {
        id: 'cro-a3',
        category: 'failed',
        title: 'Roughly one child in fourteen forms a stone in the urinary tract',
        laymanSummary:
          'The gallbladder problem is well known. The kidney one is less so. Pooling eight studies, about seven in a hundred children given ceftriaxone developed a stone in the urinary tract — with the caveat that the studies disagree wildly and the smallest ones are probably missing.',
        technicalDetails:
          'A 2026 systematic review and meta-analysis pooled eight studies of urolithiasis in children receiving ceftriaxone. The pooled frequency was 7% (95% CI 2 to 12%), with substantial heterogeneity (I2 = 89.8%) and a 95% prediction interval of 2.7 to 15.8%. Retrospective studies from Asian regions reported rates up to 34% while prospective Western studies reported consistently lower ones. Excluding the main outlier reduced the pooled estimate to 4% (p=0.004). Egger’s test detected publication bias (p=0.006) in the direction of underreporting low-event studies, which cuts against the headline figure rather than for it. The authors concluded that well-powered prospective studies with standardised imaging are still required.',
        evidenceSource:
          'Pooled frequency of ceftriaxone-induced urolithiasis in pediatric patients: a systematic review and meta-analysis. Pediatr Nephrol 2026, published online 9 June 2026',
        doi: '10.1007/s00467-026-07358-8',
        measuredMetric:
          'Pooled proportion of paediatric ceftriaxone recipients developing urolithiasis across eight studies',
        auditFlag: 'caution',
      },
      {
        id: 'cro-a4',
        category: 'conclusion_shift',
        title: 'The 2007 calcium contraindication was narrowed to newborns in 2009',
        laymanSummary:
          'In 2007 regulators told clinicians never to give ceftriaxone and intravenous calcium to any patient, after fatal precipitation in newborns. In April 2009 that was narrowed to newborns only, because the evidence that adults were at risk did not hold up when it was examined.',
        technicalDetails:
          'The original warning asserted that ceftriaxone and intravenous calcium products should not be coadministered to any patient. In April 2009 the FDA retracted the universal form of that assertion, leaving the contraindication in place for neonates aged 28 days or younger. A subsequent structured analysis of the FDA Adverse Event Reporting System compared 104 ceftriaxone-calcium events against 99 ceftazidime-calcium events as a comparator. Among ceftriaxone-calcium reports, 7.7% were classified probable and 20.2% possible for embolism; ceftazidime-calcium produced fewer probable (4%) but more possible (30.3%) events. Restricting to cases where either drug was primary or secondary suspect left a single probable embolic event — a patient who received ceftriaxone and calcium and died, with causality not attributable. The authors concluded the analysis supported the revised, narrower recommendation.',
        evidenceSource:
          'Steadman E et al., Evaluation of a potential clinical interaction between ceftriaxone and calcium. Antimicrob Agents Chemother 2010;54:1534-1540',
        doi: '10.1128/AAC.01111-09',
        inferredClaim:
          'That an in vitro precipitation risk demonstrated in neonates generalises to adults — the inference the 2007 warning rested on, and the one the pharmacovigilance analysis did not support',
        auditFlag: 'verified',
      },
      {
        id: 'cro-a5',
        category: 'conclusion_shift',
        title: 'The ALS signal was real at stage 2 and gone at stage 3',
        laymanSummary:
          'Ceftriaxone raises the level of a protein that clears glutamate from around nerve cells, and in mice that slowed motor neurone disease. A trial ran in three stages. The middle stage found a statistically significant slowing of decline. The final stage, in five hundred people, found nothing at all.',
        technicalDetails:
          'In stages 1 and 2 of the trial, mean ALSFRS-R declined more slowly on 4 g daily ceftriaxone than on placebo — a difference of 0.51 units per month (95% CI 0.02 to 1.00, P=0.0416). In stage 3, which included 66 continuing participants and 448 new ones, with 340 allocated to ceftriaxone and 173 to placebo, the difference in functional decline was 0.09 units per month (95% CI -0.06 to 0.24, P=0.2370) and there was no survival difference (hazard ratio 0.90, 95% CI 0.71 to 1.15, P=0.4146). The trial stopped for futility. The stage 2 result was not fraud or error: it is what a borderline P value in a small cohort looks like when the underlying effect is zero.',
        evidenceSource: 'Cudkowicz ME et al., Lancet Neurol 2014;13:1083-1091 (NCT00349622)',
        doi: '10.1016/S1474-4422(14)70222-4',
        inferredClaim:
          'That raising EAAT2 glutamate-transporter activity, which delays onset and prolongs survival in mouse models, would slow human amyotrophic lateral sclerosis — a mechanistically strong inference that a 513-person randomised trial did not support',
        auditFlag: 'verified',
      },
      {
        id: 'cro-a6',
        category: 'inferred',
        title: 'In gonorrhoea, cure is inferred from a laboratory number that is moving',
        laymanSummary:
          'Ceftriaxone is the last drug that reliably cures gonorrhoea. What is measured routinely is not cure but a laboratory value — the concentration needed to stop the bacterium growing in a dish — and that value is rising in several countries.',
        technicalDetails:
          'Surveillance rather than trials carries this indication. In a Hangzhou surveillance series, high-level ceftriaxone resistance defined as a minimum inhibitory concentration of 0.5 mg/L or above reached 35% of surveyed isolates in 2024 and 19% in 2025, driven by expansion of strains carrying penA allele 60.001. Genomic analysis showed a shift in which lineage carries that allele: early isolates from 2019 to 2021 belonged to the internationally disseminated FC428 clone (ST1903), but from 2022 the resistant isolates were predominantly the endemic ST8123 lineage, a genetically distinct clade. Whether an isolate above a breakpoint predicts an individual treatment failure is supported by case reports and by pharmacodynamic reasoning rather than by any randomised comparison, because no such trial exists or is likely to.',
        evidenceSource:
          'Rapid expansion of penA allele 60.001-containing endemic ceftriaxone-resistant gonococcal ST8123 lineage in Hangzhou, China. Infection 2026, published online 10 July 2026',
        doi: '10.1007/s15010-026-02889-6',
        inferredClaim:
          'That a minimum inhibitory concentration below the breakpoint predicts cure in gonorrhoea and one above it predicts failure — the surrogate the entire treatment guideline rests on, validated by mechanism and case reports rather than by a randomised endpoint',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Given by injection, because it cannot survive the gut',
        laymanDesc:
          'There is no tablet form. The molecule is destroyed by stomach acid and is too charged to be absorbed, so it goes in through a vein or a muscle. One injection covers a day.',
        molecularDetail:
          'Ceftriaxone is administered intravenously or intramuscularly only. Its terminal half-life of roughly 6 to 9 hours in adults comes from concentration-dependent plasma protein binding of about 85 to 95%, not from slow intrinsic clearance — bound drug is a reservoir rather than a cleared fraction.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It reaches places most antibiotics cannot',
        laymanDesc:
          'Very few antibiotics cross into the fluid around the brain and spinal cord in useful amounts. This one does, especially when the lining is inflamed — which is exactly when it is needed.',
        molecularDetail:
          'Penetration into cerebrospinal fluid is limited under normal conditions and rises substantially when the meninges are inflamed, which is what makes ceftriaxone a first-line agent in bacterial meningitis. It also concentrates in bile, reaching many times the plasma concentration, and that biliary concentration is the origin of the pseudolithiasis on this page.',
        iconName: 'Brain',
        visualStage: 'delivery',
      },
      {
        step: 3,
        title: 'Its shield deflects the older bacterial defences',
        laymanDesc:
          'Bacteria carry enzymes that chop penicillins in half. Ceftriaxone carries a bulky chemical group positioned so those enzymes cannot get a grip. Newer versions of the same enzymes can.',
        molecularDetail:
          'The 2-aminothiazolyl ring with a syn-methoxyimino group sterically hinders hydrolysis by staphylococcal penicillinase and by classical TEM-1 and SHV-1 beta-lactamases. Extended-spectrum derivatives of those enzymes, the CTX-M family and AmpC cephalosporinases hydrolyse it efficiently, and that is the entire definition of the "ceftriaxone-nonsusceptible" organisms around which the MERINO trial was designed.',
        iconName: 'Shield',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'It jams the enzyme that builds the dividing wall',
        laymanDesc:
          'When a rod-shaped bacterium divides it builds a wall across its middle. Ceftriaxone preferentially blocks the tool that builds that cross-wall, so the cell keeps growing longer without ever splitting.',
        molecularDetail:
          'Highest affinity in Gram-negative organisms is for PBP3, the septal transpeptidase. Selective PBP3 inhibition produces the characteristic filamentation seen at sub-lethal concentrations, and lysis follows as autolysins continue to cleave peptidoglycan that is no longer being cross-linked.',
        iconName: 'Scissors',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The bacterium bursts',
        laymanDesc:
          'With repair blocked and demolition continuing, internal pressure does the rest. This only works on bacteria that are actively growing.',
        molecularDetail:
          'Killing is time-dependent and requires active division. In meningitis, rapid lysis releases cell-wall fragments that drive the inflammatory response, which is the pharmacological reason adjunctive dexamethasone was studied in that setting at all.',
        iconName: 'Zap',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'On the way out, it can turn solid',
        laymanDesc:
          'Ceftriaxone leaves partly through the bile and partly through the kidneys. In both places it can bind calcium and drop out of solution as sludge or as a stone.',
        molecularDetail:
          'Roughly 33 to 67% is excreted unchanged in urine and the remainder in bile. The triazinedione moiety chelates calcium, forming a poorly soluble calcium-ceftriaxone salt that precipitates in concentrated bile and in urine. This is the mechanism behind biliary pseudolithiasis, paediatric urolithiasis at a pooled 7%, the 62% hepatobiliary adverse event rate in the ALS trial, and the neonatal contraindication with intravenous calcium.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Pertel 2008 pooled community-acquired pneumonia programme',
        phase: 'Two phase 3, randomised, double-blind, active-controlled trials pooled',
        sampleSize: 834,
        primaryEndpoint:
          'Clinical response at the test-of-cure visit in the intent-to-treat and clinically evaluable populations',
        endpointMet: true,
        statisticalPValue:
          'Clinically evaluable 87.9% ceftriaxone against 79.4% daptomycin (95% CI for the difference -13.8% to -3.2%); intent-to-treat 77.4% against 70.9% (95% CI -12.4% to -0.6%)',
        unreportedAdverseSignals:
          'The trials were designed to test daptomycin, not ceftriaxone, so ceftriaxone’s own adverse-event profile is reported as a comparator arm rather than as a primary safety analysis. A post-hoc finding that as little as 24 hours of prior effective therapy erased the difference between arms is a warning about how pneumonia trials are read generally.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Ceftriaxone in amyotrophic lateral sclerosis (NCT00349622)',
        phase: 'Combined phase 1, 2 and 3, randomised, double-blind, placebo-controlled',
        sampleSize: 513,
        primaryEndpoint:
          'Coprimary: survival and rate of functional decline on the ALSFRS-R over stage 3',
        endpointMet: false,
        statisticalPValue:
          'Functional decline difference 0.09 units per month (95% CI -0.06 to 0.24), P=0.2370; survival hazard ratio 0.90 (95% CI 0.71 to 1.15), P=0.4146. Stopped for futility.',
        unreportedAdverseSignals:
          'The stage 2 signal that justified stage 3 was 0.51 units per month (95% CI 0.02 to 1.00, P=0.0416) and did not survive. Hepatobiliary adverse events reached 62% against 11% on placebo despite universal ursodeoxycholic acid prophylaxis in the ceftriaxone arm — the largest placebo-controlled quantification of this harm anywhere in the literature.',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Clinical cure 87.9% in 371 clinically evaluable pneumonia patients, against 79.4% for the comparator, with the confidence interval excluding zero',
        'Hepatobiliary adverse events 62% against 11% on matching placebo in 513 participants, with ursodeoxycholic acid prophylaxis in every ceftriaxone recipient',
        'Serious hepatobiliary adverse events in 41 of 340 ceftriaxone participants (12%)',
        'Pooled paediatric urolithiasis frequency of 7% (95% CI 2 to 12%) across eight studies, falling to 4% when the main outlier is removed',
        'High-level ceftriaxone-resistant gonococci at 35% of surveyed isolates in one Chinese city in 2024',
      ],
      unsupportedInferences: [
        'That raising EAAT2 glutamate-transporter activity would slow human ALS — a strong animal-model inference that a 513-person trial refuted',
        'That the neonatal calcium precipitation risk generalises to adults, the basis of the 2007 universal warning that was narrowed in 2009',
        'That a minimum inhibitory concentration below the breakpoint predicts cure in gonorrhoea — the surrogate the whole guideline rests on, never validated against a randomised endpoint',
        'That once-daily convenience and a broad in vitro spectrum imply outcome superiority; most of ceftriaxone’s indications were approved on cure rates without a mortality comparison',
      ],
      whatFailedInitially: [
        'The ALS programme failed outright at stage 3 after a significant stage 2 signal, and stopped for futility',
        'Biliary and urinary precipitation were not designed out of the molecule: the triazinedione group that gives the long half-life is the group that chelates calcium',
        'Extended-spectrum beta-lactamases and AmpC enzymes hydrolyse ceftriaxone efficiently, and ceftriaxone-nonsusceptible Enterobacterales are now common enough to build a nine-country trial around',
        'Gonococcal minimum inhibitory concentrations are rising, and the resistance determinant has moved out of an imported clone into endemic lineages',
      ],
      realWorldOutcome: [
        'Approved in 1984, on the WHO Model List of Essential Medicines, and available at about US$1.44 a vial',
        'A first-line agent in bacterial meningitis, one of a small number of antibacterials that reach cerebrospinal fluid usefully',
        'The last remaining reliable single-agent treatment for gonorrhoea, and under measurable pressure',
        'Contraindicated with intravenous calcium in neonates aged 28 days or younger; the wider 2007 warning was narrowed in April 2009',
      ],
    },
    deliverySystem: {
      type: 'Intravenous infusion or intramuscular injection; no oral formulation exists',
      description:
        'Given once daily in most indications because concentration-dependent plasma protein binding of about 85 to 95% holds the drug in circulation, not because it is cleared slowly. Eliminated by two routes at once — roughly a third to two-thirds unchanged in urine and the balance in bile — which is why it needs no dose reduction for moderate impairment of either organ alone, and why both organs are where its characteristic harm appears.',
      safetyProfile:
        'Contraindicated in neonates aged 28 days or younger who are receiving or expected to receive calcium-containing intravenous solutions, and in hyperbilirubinaemic neonates, because ceftriaxone displaces bilirubin from albumin. Biliary pseudolithiasis and urolithiasis are the characteristic harms: the only large placebo-controlled trial recorded hepatobiliary adverse events in 62% against 11% on placebo, and serious ones in 12%, despite universal ursodeoxycholic acid prophylaxis. Immune haemolytic anaemia is rare and has been fatal. Clostridioides difficile-associated diarrhoea is reported as with essentially all antibacterials. Hypersensitivity reactions occur and cross-reactivity with penicillins is far lower for third-generation agents than for first-generation ones.',
    },
    commonQuestions: [
      {
        q: 'Why is it given as an injection when other antibiotics are tablets?',
        a: 'Because it cannot survive the journey. Ceftriaxone is broken down by stomach acid and is too polar to be absorbed across the gut wall in useful amounts, and unlike cephalexin it is not carried across by the intestinal peptide transporter. There is no oral form of the molecule anywhere in the world. What it offers in exchange is a once-daily schedule: it binds plasma proteins so extensively that a single injection maintains active concentrations for about a day, which is why it dominates emergency departments and outpatient parenteral antibiotic services.',
      },
      {
        q: 'Can it damage my gallbladder?',
        a: 'It can form sludge in it, and the size of that effect is better measured than for almost any other antibiotic harm — from an unlikely source. The only large placebo-controlled trial ceftriaxone has ever had was in motor neurone disease, where 340 people received it for months at a time. Hepatobiliary adverse events occurred in 62% of them against 11% on placebo, and 12% had serious ones. Every ceftriaxone participant was also given ursodeoxycholic acid specifically to prevent this, so those figures are on top of prophylaxis. The mechanism is straightforward: ceftriaxone concentrates in bile and binds calcium to form a poorly soluble salt. In ordinary short courses the sludge is usually silent and reverses when the drug stops.',
        auditNote:
          'That trial gave the drug for far longer than any infection would. It quantifies the mechanism, not the risk of a three-day course, and this page does not treat the two as the same number.',
      },
      {
        q: 'Is it safe to give to a newborn?',
        a: 'That depends on two specific things, and both are label contraindications rather than cautions. Ceftriaxone must not be given to a neonate aged 28 days or younger who is receiving or expected to receive calcium-containing intravenous fluids, because the two can precipitate together and this has been fatal. It is also contraindicated in hyperbilirubinaemic neonates, because ceftriaxone competes with bilirubin for albumin binding and can raise free bilirubin. In 2007 the FDA extended the calcium warning to every patient of any age; in April 2009 it narrowed it back to neonates, after the evidence for an adult risk did not hold up when examined in the adverse-event reporting system.',
      },
      {
        q: 'Why does gonorrhoea keep being mentioned with this drug?',
        a: 'Because ceftriaxone is the last one that reliably works, and that is not a stable position. Gonorrhoea has already defeated sulphonamides, penicillins, tetracyclines, fluoroquinolones and the oral cephalosporins in turn. Surveillance is now picking up high-level resistance: in one Chinese city, isolates needing a minimum inhibitory concentration of 0.5 mg/L or more reached 35% of those surveyed in 2024. What has changed genetically is the more worrying part — the resistance gene variant driving it has moved out of an imported international clone and into locally common lineages, which is how a rarity becomes an epidemiology.',
      },
      {
        q: 'It was tested in motor neurone disease. Did that work?',
        a: 'No. Ceftriaxone raises the activity of EAAT2, a transporter that clears glutamate from around nerve cells, and in mouse models of ALS that delayed onset and prolonged survival. A three-stage trial ran from 2006 to 2012 across 59 sites. Stage 2 found decline was slower on ceftriaxone by 0.51 ALSFRS-R units per month, with a confidence interval of 0.02 to 1.00 and a P value of 0.0416 — statistically significant, barely. Stage 3, with 513 participants, found a difference of 0.09 units per month, a confidence interval spanning zero, and no survival difference at all. The trial stopped for futility. It is a clean illustration of what a borderline result in a small cohort looks like when the true effect is nothing.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Pertel PE, Bernardo P, Fogarty C, et al. Effects of prior effective therapy on the efficacy of daptomycin and ceftriaxone for the treatment of community-acquired pneumonia. Clin Infect Dis 2008;46:1142-1151',
        identifier: '10.1086/533441',
        kind: 'doi',
      },
      {
        label:
          'Cudkowicz ME, Titus S, Kearney M, et al. Safety and efficacy of ceftriaxone for amyotrophic lateral sclerosis: a multi-stage, randomised, double-blind, placebo-controlled trial. Lancet Neurol 2014;13:1083-1091',
        identifier: '10.1016/S1474-4422(14)70222-4',
        kind: 'doi',
      },
      {
        label:
          'Steadman E, Raisch DW, Bennett CL, et al. Evaluation of a potential clinical interaction between ceftriaxone and calcium. Antimicrob Agents Chemother 2010;54:1534-1540',
        identifier: '10.1128/AAC.01111-09',
        kind: 'doi',
      },
      {
        label:
          'Pooled frequency of ceftriaxone-induced urolithiasis in pediatric patients: a systematic review and meta-analysis. Pediatr Nephrol 2026, published online 9 June 2026',
        identifier: '10.1007/s00467-026-07358-8',
        kind: 'doi',
      },
      {
        label:
          'Rapid expansion of penA allele 60.001-containing endemic ceftriaxone-resistant gonococcal ST8123 lineage in Hangzhou, China. Infection 2026, published online 10 July 2026',
        identifier: '10.1007/s15010-026-02889-6',
        kind: 'doi',
      },
      {
        label: 'Ceftriaxone in amyotrophic lateral sclerosis, three-stage placebo-controlled trial',
        identifier: 'NCT00349622',
        kind: 'nct',
      },
      {
        label: 'PubChem CID 5479530 — ceftriaxone structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5479530',
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
  // ---------------------------------------------------------------------------------------------
  // 4. Cefepime — accused of killing people by one meta-analysis, cleared by the regulator's own,
  //    and then shown by a 2,511-patient randomised trial to cause the harm nobody was arguing
  //    about.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'cefepime',
    name: 'Cefepime',
    tradeName: 'Maxipime',
    sponsor:
      'Bristol-Myers Squibb (originator); the current United States application holder on NDA 050679 is Hospira, and generics are widely marketed',
    targetGene:
      'Bacterial cell-wall genes ftsI (PBP3), mrcA/mrcB and relatives — bacterial penicillin-binding-protein genes, not human ones',
    targetProtein:
      'Bacterial penicillin-binding proteins, principally PBP3 and PBP2 in Gram-negative organisms',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1996,
    indication:
      'Pneumonia, empirical therapy of febrile neutropenia, complicated and uncomplicated urinary tract infection including pyelonephritis, uncomplicated skin and skin structure infection, and complicated intra-abdominal infection, caused by susceptible strains of the designated microorganisms',
    patientFriendlyIndication:
      'Serious hospital infections, including pneumonia and fever in patients whose white cell count has collapsed',
    anatomicalSite:
      'The bacterial cell envelope. In humans the organ that matters most for its harms is the brain, where accumulation produces encephalopathy and non-convulsive seizures.',
    conditionContext: {
      conditionExplainer:
        'Cefepime is a hospital antibiotic used when the infection could be caused by almost anything, including Pseudomonas, and there is no time to wait for a culture. Febrile neutropenia — fever in someone whose white cells have been wiped out by chemotherapy — is the situation it was designed for.',
      whyItMatters:
        'It sits in the middle of the two biggest empirical-therapy arguments in hospital medicine: whether it increases mortality, which took thirteen years and two meta-analyses to resolve, and whether it or piperacillin-tazobactam is the safer default, which took a 2,511-patient randomised trial in 2023.',
      whoTakesThis:
        'Hospitalised adults and children with serious infection, and patients with fever during chemotherapy-induced neutropenia.',
      clinicalGoals:
        'Clinical cure and survival. The debates on this page are not about whether it kills bacteria — it does — but about what it does to the patient while doing so.',
    },
    oneSentenceVerdict:
      'A fourth-generation cephalosporin whose zwitterionic charge lets it cross the Gram-negative outer membrane quickly and whose ring resists AmpC enzymes — a 2007 meta-analysis of 57 trials reported higher all-cause mortality than other beta-lactams (RR 1.26, 95% CI 1.08 to 1.49), the FDA’s own analysis of 88 trials in 17,755 patients found no significant increase, and the 2,511-patient ACORN trial in 2023 found no kidney difference against piperacillin-tazobactam but fewer days free of delirium and coma (OR 0.79, 95% CI 0.65 to 0.95).',
    laymanHowItWorks:
      'Cefepime carries a positive and a negative charge at the same time, which lets it slip through the pores in a Gram-negative bacterium’s outer skin far faster than older cephalosporins. Once inside, it jams the tools the bacterium uses to build its wall, and the cell bursts. It is shaped so that one common family of bacterial defence enzymes cannot destroy it. Its own weakness is that it is cleared by the kidneys, and when it builds up it reaches the brain.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 72,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$3.73 per vial at United States pharmacy acquisition cost (CMS NADAC, median across 8 listed generic products, survey effective 20 August 2025)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States in 1996 under NDA 050679. Composition-of-matter protection has expired and generics are marketed, but only eight products appear in the acquisition-cost survey — a thin supply base for an antibiotic in this position, and thin supply is itself a clinical risk for a drug used empirically in neutropenic fever.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The comparison that matters is against piperacillin-tazobactam, and for once it has been settled by a randomised trial rather than by databases: no difference in kidney injury or death, more neurological dysfunction on cefepime. Beyond that pair, the alternatives are the carbapenems, which cover more and cost more in resistance terms, and ceftazidime, which covers less. None of these is a food, and nothing in a supplement aisle treats neutropenic fever.',
      conventionalRx: [
        {
          name: 'Piperacillin-tazobactam',
          class: 'Antipseudomonal penicillin plus beta-lactamase inhibitor',
          howItCompares:
            'Covers anaerobes, which cefepime does not, and in the ACORN trial produced no more acute kidney injury or death than cefepime (odds ratio 0.95, 95% CI 0.80 to 1.13) while producing less neurological dysfunction. It is the more common empirical choice in intra-abdominal infection for the anaerobic cover.',
          typicalCost:
            'US$3.49 per vial at United States pharmacy acquisition cost (CMS NADAC, median across 12 listed generic tazobactam-containing products, survey effective 21 January 2026)',
          prosAndCons:
            'Pros: anaerobic cover, no measured excess kidney injury, less delirium in the head-to-head trial. Cons: failed its non-inferiority comparison against meropenem in ceftriaxone-resistant bloodstream infection; more frequent administration.',
        },
        {
          name: 'Meropenem',
          class: 'Carbapenem',
          howItCompares:
            'Covers the extended-spectrum beta-lactamase producers that hydrolyse cefepime, plus anaerobes, and has the lowest seizure liability of the carbapenems. It is the drug cefepime is meant to spare, and every prescription of it is selection pressure on the last broadly reliable class.',
          typicalCost:
            'US$4.67 per vial at United States pharmacy acquisition cost (CMS NADAC, median across 13 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: broadest reliable cover, best evidence in ceftriaxone-resistant bloodstream infection. Cons: carbapenem selection pressure; reserved for a reason.',
        },
        {
          name: 'Ceftazidime',
          class: 'Third-generation antipseudomonal cephalosporin',
          howItCompares:
            'The older antipseudomonal cephalosporin cefepime was built to improve on. It is readily hydrolysed by AmpC enzymes that cefepime resists, and has essentially no Gram-positive activity, so it is a narrower and less reliable empirical choice.',
          typicalCost:
            'US$3.70 per vial at United States pharmacy acquisition cost (CMS NADAC, median across 2 listed generic products, survey effective 17 December 2025)',
          prosAndCons:
            'Pros: long track record, similar price. Cons: no useful Gram-positive cover, vulnerable to AmpC derepression, only two listed products.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Report new confusion in someone receiving it',
          action:
            'Tell the treating team about new confusion, twitching, unusual drowsiness or a change in speech in a patient on cefepime, especially if their kidney function is reduced.',
          patientImpact:
            'Cefepime neurotoxicity presents as encephalopathy, aphasia, myoclonus, seizures or non-convulsive status epilepticus, and the label records life-threatening and fatal cases. In the randomised ACORN trial, patients on cefepime had fewer days alive and free of delirium and coma than those on piperacillin-tazobactam.',
          clinicalPrecaution:
            'Most cases occurred in renal impairment without appropriate adjustment, but the label states explicitly that some occurred in patients whose dosage was appropriately adjusted. Symptoms are usually reversible on stopping. Nothing here is a monitoring or dosing instruction.',
        },
        {
          name: 'Make sure the fever is being treated as an emergency during chemotherapy',
          action:
            'If a patient on chemotherapy develops fever, treat it as an emergency rather than waiting to see how it develops.',
          patientImpact:
            'Febrile neutropenia is the indication cefepime exists for. It is a situation where the antibiotic is started before any organism is known, because the delay costs more than the wrong choice does.',
          clinicalPrecaution:
            'This describes why the drug is given empirically. It is not advice about what to take, and the decision belongs to the treating oncology team.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'C[N+]1(CCCC1)CC2=C(N3[C@@H]([C@@H](C3=O)NC(=O)/C(=N\\OC)/C4=CSC(=N4)N)SC2)C(=O)[O-]',
      chemicalFormula: 'C19H24N6O5S2',
      molecularWeight: '480.60 g/mol',
      targetReceptorAffinity:
        'Cefepime acylates bacterial DD-transpeptidases with high affinity for PBP3 and PBP2 in Gram-negative organisms. The structural feature that defines it is the quaternary N-methylpyrrolidinium group at position 3: it makes the molecule a zwitterion, which accelerates passage through outer-membrane porins, and it lowers affinity for AmpC cephalosporinases so that derepressed AmpC producers remain susceptible. It is still hydrolysed by extended-spectrum beta-lactamases and by carbapenemases. It has no mammalian receptor; its central nervous system toxicity is instead concentration-dependent antagonism at the GABA-A receptor, shared across beta-lactams.',
      structureSource: {
        label: 'PubChem CID 5479537 (cefepime) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5479537',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'fep-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Zwitterion confirmation and syn-oxime geometry',
          description:
            'Confirm the quaternary pyrrolidinium cation and the carboxylate anion are both present and that the methoxyimino group is syn. The permanent positive charge is not a formulation detail: it is the entire reason cefepime crosses the Gram-negative outer membrane faster than ceftazidime, and a batch that has lost it is a third-generation cephalosporin wearing a fourth-generation name.',
          reagentsAndBuffer:
            'Cefepime hydrochloride reference standard, 1H and 13C NMR in D2O, capillary electrophoresis for charge-state confirmation, gradient HPLC for related substances',
        },
        {
          id: 'fep-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Acylation of the 7-ACA nucleus and quaternisation at position 3',
          description:
            'Acylate the aminocephalosporanic nucleus with the aminothiazolyl methoxyimino side chain, then displace the 3-acetoxy group with N-methylpyrrolidine to install the quaternary ammonium centre. The order matters: quaternising first leaves a substrate that resists clean acylation.',
          dependsOnStepId: 'fep-w1',
          reagentsAndBuffer:
            'Activated 2-(2-aminothiazol-4-yl)-2-methoxyiminoacetic acid derivative, 7-aminocephalosporanic acid, N-methylpyrrolidine, sodium iodide catalysis, controlled temperature under nitrogen',
        },
        {
          id: 'fep-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Isolation as the hydrochloride with L-arginine and degradant control',
          description:
            'Isolate the salt and control the degradation products, particularly N-methylpyrrolidine released by hydrolysis at position 3. The commercial product is co-formulated with L-arginine as a pH buffer, and the finished vial specification includes limits on that released amine.',
          dependsOnStepId: 'fep-w2',
          reagentsAndBuffer:
            'L-arginine, aqueous-alcohol crystallisation, ion chromatography for N-methylpyrrolidine, size-exclusion chromatography for polymeric impurities, Karl Fischer titration',
        },
        {
          id: 'fep-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Porin flux measurement against a third-generation comparator',
          description:
            'Measure the rate of periplasmic accumulation in an intact Gram-negative organism against ceftazidime as a comparator. This is the step that either demonstrates or fails to demonstrate cefepime’s actual design claim: not that it binds the target better, but that it arrives faster and in higher periplasmic concentration for the same external concentration.',
          dependsOnStepId: 'fep-w3',
          reagentsAndBuffer:
            'Enterobacter cloacae and Pseudomonas aeruginosa with defined porin genotypes, osmotic shock periplasmic fractionation, LC-MS/MS quantification, ceftazidime as paired comparator in the same assay',
        },
        {
          id: 'fep-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'AmpC stability panel and inoculum-effect testing against ESBL producers',
          description:
            'Run minimum inhibitory concentrations against derepressed AmpC producers, where cefepime should hold and ceftazidime should fail, then repeat against extended-spectrum beta-lactamase producers at standard and hundred-fold inoculum. The second test is the one that matters clinically: cefepime shows a marked inoculum effect against ESBL producers, so a susceptible result at standard inoculum can overstate what happens in a high-burden infection.',
          dependsOnStepId: 'fep-w4',
          reagentsAndBuffer:
            'Characterised AmpC-derepressed Enterobacter and CTX-M-producing Escherichia coli isolates, cation-adjusted Mueller-Hinton broth at 5x10^5 and 5x10^7 CFU/mL, broth microdilution panels read at 16 to 20 hours',
        },
      ],
    },
    keyAudits: [
      {
        id: 'fep-a1',
        category: 'conclusion_shift',
        title: 'Accused of increasing mortality in 2007, cleared by the regulator’s data in 2010',
        laymanSummary:
          'A pooled analysis of 57 trials reported that more people died on cefepime than on other antibiotics of the same family. It caused a genuine scare. The FDA then went back to the raw data from 88 trials, including unpublished ones, and found no significant difference.',
        technicalDetails:
          'Yahav and colleagues systematically reviewed randomised trials comparing cefepime with another beta-lactam and found all-cause mortality higher with cefepime across 57 trials (risk ratio 1.26, 95% CI 1.08 to 1.49). Sensitivity analysis by methodological quality made the signal larger, not smaller: RR 1.52 (1.20 to 1.92) in trials reporting adequate allocation-sequence generation and 1.36 (1.09 to 1.70) with adequate concealment. There were no significant differences in treatment failure, superinfection or adverse events. The FDA then accessed published and unpublished trial data directly. The trial-level meta-analysis covered 88 trials, 9,467 cefepime and 8,288 comparator patients: 30-day all-cause mortality was 6.21% against 6.00%, adjusted risk difference 5.38 per 1,000 (95% CI -1.53 to 12.28). The patient-level analysis covered 35 trials, 5,058 and 3,976 patients: 5.63% against 5.68%, adjusted risk difference 4.83 per 1,000 (95% CI -4.72 to 14.38). A sensitivity analysis restricted to the 24 febrile neutropenia trials also showed no significant increase (9.67 per 1,000, 95% CI -2.87 to 22.21).',
        evidenceSource:
          'Yahav D et al., Lancet Infect Dis 2007;7:338-348; Kim PW et al., Clin Infect Dis 2010;51:381-389',
        doi: '10.1086/655131',
        inferredClaim:
          'That cefepime increases mortality relative to other beta-lactams — a signal that survived quality-based sensitivity analysis in the published literature and did not survive access to the underlying patient-level data',
        auditFlag: 'verified',
      },
      {
        id: 'fep-a2',
        category: 'measured',
        title: 'No kidney difference against piperacillin-tazobactam in 2,511 randomised patients',
        laymanSummary:
          'For years hospitals switched patients from piperacillin-tazobactam to cefepime to protect their kidneys, on the strength of database studies. When it was finally tested by randomisation, there was no kidney difference at all.',
        technicalDetails:
          'The ACORN trial randomised 2,511 adults for whom a clinician ordered antipseudomonal antibiotics within 12 hours of presenting to an emergency department or medical intensive care unit at a United States academic centre. The primary outcome, the highest stage of acute kidney injury or death by day 14 on a five-level ordinal scale, did not differ: 85 of 1,214 in the cefepime group (7.0%) reached stage 3 acute kidney injury and 92 (7.6%) died, against 97 of 1,297 (7.5%) and 78 (6.0%) with piperacillin-tazobactam — odds ratio 0.95 (95% CI 0.80 to 1.13), P=.56. Major adverse kidney events at day 14 were 10.2% against 8.8%, absolute difference 1.4% (95% CI -1.0 to 3.8). Median age was 58, 42.7% were female, 94.7% were enrolled in the emergency department, and 77.2% were receiving vancomycin at enrolment.',
        evidenceSource: 'Qian ET et al., JAMA 2023;330:1557-1567 (ACORN, NCT05094154)',
        doi: '10.1001/jama.2023.20583',
        measuredMetric:
          'Highest stage of acute kidney injury or death by day 14 on a five-level ordinal scale',
        auditFlag: 'verified',
      },
      {
        id: 'fep-a3',
        category: 'failed',
        title: 'The same trial found cefepime caused more delirium and coma',
        laymanSummary:
          'The trial was designed to settle a kidney argument. It settled it, and then found the harm nobody was arguing about: patients on cefepime spent fewer days awake and clear-headed.',
        technicalDetails:
          'In ACORN, days alive and free of delirium and coma within 14 days were a mean 11.9 (SD 4.6) in the cefepime group against 12.2 (SD 4.3) with piperacillin-tazobactam, odds ratio 0.79 (95% CI 0.65 to 0.95). The published conclusion states it directly: treatment with cefepime resulted in more neurological dysfunction. This is consistent with the label, which records life-threatening and fatal encephalopathy, aphasia, myoclonus, seizures and non-convulsive status epilepticus, and which notes that although most cases occurred in renal impairment without appropriate dosage adjustment, some occurred in patients whose dosage was appropriately adjusted. The mechanism is concentration-dependent GABA-A receptor antagonism.',
        evidenceSource:
          'Qian ET et al., JAMA 2023;330:1557-1567 (ACORN, NCT05094154); Cefepime for Injection United States prescribing information, Warnings and Precautions 5.2',
        doi: '10.1001/jama.2023.20583',
        measuredMetric: 'Days alive and free of delirium and coma within 14 days',
        auditFlag: 'caution',
      },
      {
        id: 'fep-a4',
        category: 'inferred',
        title: 'A decade of substitution to protect kidneys rested on database associations',
        laymanSummary:
          'The reason so many patients were switched to cefepime was a set of observational studies linking piperacillin-tazobactam plus vancomycin to kidney injury. Those studies could not separate the drug from the patients who received it. The randomised answer, when it came, was no difference.',
        technicalDetails:
          'The hypothesis that piperacillin-tazobactam causes acute kidney injury, particularly with vancomycin, came from retrospective cohorts and pharmacovigilance analyses in which treatment assignment was decided by clinicians who could see how sick each patient was. ACORN removed that by randomising, and found the primary ordinal outcome unchanged (OR 0.95, 95% CI 0.80 to 1.13) and major adverse kidney events at 14 days statistically indistinguishable. Notably 77.2% of ACORN participants were receiving vancomycin at enrolment, so the trial tested the combination that generated the concern rather than an artificial monotherapy comparison. What the substitution did buy, measurably, was more delirium and coma.',
        evidenceSource: 'Qian ET et al., JAMA 2023;330:1557-1567 (ACORN, NCT05094154)',
        doi: '10.1001/jama.2023.20583',
        inferredClaim:
          'That piperacillin-tazobactam causes acute kidney injury and cefepime avoids it — an inference from non-randomised cohorts that a 2,511-patient randomised trial did not confirm, and which came with an unmeasured neurological cost',
        auditFlag: 'contested',
      },
      {
        id: 'fep-a5',
        category: 'failed',
        title: 'A susceptible laboratory result overstates what happens in a heavy infection',
        laymanSummary:
          'Against bacteria carrying extended-spectrum defence enzymes, cefepime can look effective in the laboratory at the standard bacterial density and much less effective when there are far more bacteria — which is the situation in a real abscess or bloodstream infection.',
        technicalDetails:
          'Cefepime remains stable to AmpC cephalosporinases, which is the advantage it was designed around, but it is hydrolysed by extended-spectrum beta-lactamases. Against ESBL producers it shows a pronounced inoculum effect: minimum inhibitory concentrations rise substantially when the test inoculum is raised from the standard 5x10^5 CFU/mL toward the densities found in undrained infection, so an isolate reported susceptible on a routine plate may not behave that way clinically. This is why cefepime is not the agent supported by the randomised evidence in ceftriaxone-resistant bloodstream infection, and why that evidence points to a carbapenem instead.',
        evidenceSource:
          'Cefepime for Injection United States prescribing information, Microbiology and Warnings and Precautions; Harris PNA et al., JAMA 2018;320:984-994 (MERINO, for the comparative bloodstream evidence)',
        doi: '10.1001/jama.2018.12163',
        measuredMetric:
          'Shift in minimum inhibitory concentration with increasing inoculum against ESBL-producing Enterobacterales',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Given into a vein, carrying two opposite charges at once',
        laymanDesc:
          'The molecule has a permanent positive charge at one end and a negative one at the other. That balance is deliberate, and it is what lets the drug slip through the pores of a bacterium’s outer skin faster than its predecessors.',
        molecularDetail:
          'The quaternary N-methylpyrrolidinium group at position 3 gives cefepime a permanent cation and, with the C4 carboxylate, a zwitterionic character. Zwitterions traverse Gram-negative porin channels more rapidly than anionic cephalosporins, which raises the periplasmic concentration achieved for a given plasma concentration.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It reaches the periplasm before the defences can act',
        laymanDesc:
          'Bacteria keep their defence enzymes in the gap between the outer skin and the wall. A drug that crosses quickly is exposed to them for less time, which is part of how cefepime survives where older cephalosporins do not.',
        molecularDetail:
          'Rapid porin flux reduces the residence time available for periplasmic beta-lactamase hydrolysis. Combined with poor affinity for AmpC enzymes, this is why derepressed AmpC producers such as Enterobacter that defeat ceftazidime often remain susceptible to cefepime.',
        iconName: 'DoorOpen',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Its ring is a poor meal for one whole enzyme family',
        laymanDesc:
          'Bacteria have several different families of enzyme that destroy this class of drug. Cefepime is built to be a bad fit for one of the most troublesome families. It remains vulnerable to the others.',
        molecularDetail:
          'Low affinity for class C AmpC cephalosporinases is the defining resistance advantage. Class A extended-spectrum beta-lactamases including the CTX-M family, and class B and class D carbapenemases, hydrolyse cefepime efficiently, so the advantage is enzyme-specific rather than general.',
        iconName: 'Shield',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'It jams the wall-building tools',
        laymanDesc:
          'Inside the periplasm it latches onto the enzymes that stitch the bacterial wall together, chiefly the one that builds the wall across the middle when the cell divides.',
        molecularDetail:
          'Cefepime acylates PBP3 preferentially and PBP2 substantially in Gram-negative organisms, and retains meaningful activity against Gram-positive penicillin-binding proteins, which is the basis of its unusual dual-spectrum profile compared with ceftazidime.',
        iconName: 'Lock',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The cell lyses',
        laymanDesc:
          'With cross-linking blocked, the bacterium keeps cutting its own wall to grow and cannot repair it. Internal pressure does the rest.',
        molecularDetail:
          'Killing is time-dependent, driven by the fraction of the dosing interval during which free drug concentration exceeds the minimum inhibitory concentration, and requires actively dividing organisms.',
        iconName: 'Zap',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What happens when it does not leave',
        laymanDesc:
          'Cefepime is cleared almost entirely by the kidneys. When the kidneys are not working, it accumulates, reaches the brain, and interferes with the signal that quietens nerve cells — producing confusion, twitching, or seizures that do not look like seizures.',
        molecularDetail:
          'Elimination is predominantly renal and unchanged. Accumulation produces concentration-dependent GABA-A receptor antagonism and the syndrome described in the label: encephalopathy, aphasia, myoclonus, seizures and non-convulsive status epilepticus, life-threatening or fatal in reported cases, mostly reversible on discontinuation or after haemodialysis. In the randomised ACORN comparison, cefepime recipients had fewer days alive and free of delirium and coma (OR 0.79, 95% CI 0.65 to 0.95).',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'ACORN (NCT05094154)',
        phase: 'Phase 4, pragmatic, randomised, unblinded, single-centre',
        sampleSize: 2511,
        primaryEndpoint:
          'Highest stage of acute kidney injury or death by day 14, on a five-level ordinal scale',
        endpointMet: false,
        statisticalPValue: 'Odds ratio 0.95 (95% CI 0.80 to 1.13), P=.56 — no difference detected',
        unreportedAdverseSignals:
          'The trial found what it was not looking for: days alive and free of delirium and coma were fewer with cefepime, odds ratio 0.79 (95% CI 0.65 to 0.95). It was run at a single academic centre, 94.7% of enrolment was in the emergency department, and 77.2% of participants were receiving vancomycin, so it tests the combination in practice rather than either drug alone.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'FDA cefepime mortality meta-analysis (88 trials, trial- and patient-level)',
        phase: 'Regulatory meta-analysis of published and unpublished randomised trials',
        sampleSize: 17755,
        primaryEndpoint: '30-day all-cause mortality, cefepime against other antibacterials',
        endpointMet: true,
        statisticalPValue:
          'Trial level 6.21% against 6.00%, adjusted risk difference 5.38 per 1,000 (95% CI -1.53 to 12.28); patient level 5.63% against 5.68%, 4.83 per 1,000 (95% CI -4.72 to 14.38)',
        unreportedAdverseSignals:
          'This analysis is the answer to a published meta-analysis that reached the opposite conclusion from the same literature. It was performed by the regulator with access to unpublished trials, which is both its strength and the reason it cannot be independently reproduced from public data.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'All-cause mortality 6.21% against 6.00% across 88 trials in 17,755 patients, adjusted risk difference 5.38 per 1,000 (95% CI -1.53 to 12.28)',
        'No difference in the highest stage of acute kidney injury or death by day 14 against piperacillin-tazobactam in 2,511 randomised patients (OR 0.95, 95% CI 0.80 to 1.13)',
        'Fewer days alive and free of delirium and coma on cefepime, odds ratio 0.79 (95% CI 0.65 to 0.95)',
        'Major adverse kidney events at day 14: 10.2% against 8.8%, absolute difference 1.4% (95% CI -1.0 to 3.8)',
      ],
      unsupportedInferences: [
        'That cefepime increases mortality — a published signal of RR 1.26 that did not survive access to patient-level data from 88 trials',
        'That piperacillin-tazobactam damages kidneys and cefepime spares them, the inference behind a decade of substitution, unconfirmed by randomisation',
        'That an in vitro susceptible result predicts clinical success against ESBL producers, where cefepime shows a marked inoculum effect',
        'That a single-centre pragmatic trial in one American academic hospital transfers unchanged to other systems and case mixes',
      ],
      whatFailedInitially: [
        'The 2007 meta-analysis signal was strengthened rather than weakened by restricting to higher-quality trials, and still did not replicate in patient-level data',
        'Neurotoxicity is not confined to unadjusted dosing in renal impairment; the label states some cases occurred with appropriate adjustment',
        'The substitution away from piperacillin-tazobactam achieved no measurable kidney benefit and produced measurable neurological harm',
        'Only eight generic products appear in the United States acquisition-cost survey, a thin base for an empirical agent in neutropenic fever',
      ],
      realWorldOutcome: [
        'Approved in 1996 under NDA 050679 and still a first-line empirical agent in febrile neutropenia',
        'Available at about US$3.73 a vial, comparable to piperacillin-tazobactam and cheaper than meropenem',
        'The 2007 mortality controversy is settled in the negative and is still routinely cited as though it were open',
        'ACORN made neurological dysfunction, not renal injury, the measured reason to prefer the alternative',
      ],
    },
    deliverySystem: {
      type: 'Intravenous infusion or intramuscular injection, supplied as cefepime hydrochloride with L-arginine',
      description:
        'Parenteral only; there is no oral form. Eliminated almost entirely by the kidney as unchanged drug, which is why exposure rises steeply when renal function falls and why the drug is removed by haemodialysis. Co-formulated with L-arginine as a buffer.',
      safetyProfile:
        'The distinctive harm is neurological: the label records life-threatening and fatal encephalopathy, aphasia, myoclonus, seizures and non-convulsive status epilepticus, mostly but not exclusively in renal impairment without appropriate dosage adjustment, and usually reversible on discontinuation or after haemodialysis. The randomised ACORN comparison quantified this as fewer days alive and free of delirium and coma than piperacillin-tazobactam. Cross-hypersensitivity among beta-lactams may occur in up to 10% of patients with a history of penicillin allergy, per the label. Clostridioides difficile-associated diarrhoea is reported as with essentially all antibacterials. The mortality question raised in 2007 was not confirmed by the regulator’s analysis of 88 trials.',
    },
    commonQuestions: [
      {
        q: 'Is it true that cefepime kills people?',
        a: 'No, and the story of how that question was raised and answered is worth knowing. In 2007 a systematic review of 57 randomised trials found all-cause mortality higher with cefepime than with other beta-lactams — a risk ratio of 1.26, confidence interval 1.08 to 1.49 — and the signal got stronger, not weaker, when the authors restricted to the better-conducted trials. That is exactly the pattern that usually means a finding is real. The FDA then obtained the underlying data from 88 trials, including unpublished ones. At the trial level, 30-day mortality was 6.21% on cefepime against 6.00% on comparators; at the patient level, 5.63% against 5.68%. Neither difference was statistically significant, and neither was the febrile neutropenia subset. The published-literature signal did not survive contact with the full dataset.',
        auditNote:
          'The regulator’s analysis is the more complete one and cannot be independently reproduced from public data, because part of what makes it more complete is access to trials nobody else can see. That is a real limitation of the answer, not a reason to prefer the question.',
      },
      {
        q: 'I was switched from piperacillin-tazobactam to cefepime to protect my kidneys. Did that help?',
        a: 'On the randomised evidence, no. That practice grew out of observational studies in which patients given piperacillin-tazobactam with vancomycin appeared to have more kidney injury — studies that could not separate the drug from how sick the patients were. The ACORN trial randomised 2,511 adults, three-quarters of whom were also on vancomycin, and found no difference at all in the highest stage of kidney injury or death by day 14: odds ratio 0.95, confidence interval 0.80 to 1.13. Major adverse kidney events at 14 days were 10.2% against 8.8%. What the trial did find was that the cefepime group spent fewer days alive and free of delirium and coma.',
      },
      {
        q: 'Why does it cause confusion?',
        a: 'Cefepime, like other beta-lactams, blocks the GABA-A receptor, the main brake on electrical activity in the brain. Ordinarily almost none of the drug reaches the brain in a concentration that matters. Cefepime is cleared almost entirely by the kidneys as unchanged drug, so when kidney function is reduced it accumulates, and at high enough concentrations that braking system is antagonised. The result can be confusion, hallucinations, stupor, coma, difficulty speaking, muscle jerking, seizures, or non-convulsive status epilepticus — seizure activity without visible convulsions, which is easy to mistake for delirium. The label records life-threatening and fatal cases. Most occurred where dosing had not been adjusted for kidney function, but the label states explicitly that some occurred where it had been.',
      },
      {
        q: 'What can it not treat?',
        a: 'Three important gaps. It has no useful activity against anaerobic bacteria, which is why it is generally paired with something else in intra-abdominal infection while piperacillin-tazobactam is not. It is hydrolysed by extended-spectrum beta-lactamases and by carbapenemases, so it is not the agent supported by randomised evidence in ceftriaxone-resistant bloodstream infection. And against ESBL producers it shows a marked inoculum effect: an isolate reported susceptible at the standard laboratory bacterial density can behave very differently at the densities found in an undrained collection. Its real advantage is narrower than "broad-spectrum" suggests — it is stability to AmpC enzymes, which is a specific and genuine one.',
      },
      {
        q: 'Only eight products are listed. Does that matter?',
        a: 'It is a risk that does not appear in any safety table. Cefepime is off patent and cheap, at about US$3.73 a vial, but the United States acquisition-cost survey lists only eight generic products. A drug used empirically for fever in patients whose immune systems have been destroyed by chemotherapy is one where a supply interruption is a clinical event, and a thin manufacturer base is how supply interruptions happen. That is a structural fact about the market rather than about the molecule, and it is the sort of thing an evidence audit ought to record.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Yahav D, Paul M, Fraser A, Sarid N, Leibovici L. Efficacy and safety of cefepime: a systematic review and meta-analysis. Lancet Infect Dis 2007;7:338-348',
        identifier: '10.1016/S1473-3099(07)70109-3',
        kind: 'doi',
      },
      {
        label:
          'Kim PW, Wu YT, Cooper C, et al. Meta-analysis of a possible signal of increased mortality associated with cefepime use. Clin Infect Dis 2010;51:381-389',
        identifier: '10.1086/655131',
        kind: 'doi',
      },
      {
        label:
          'Qian ET, Casey JD, Wright A, et al. Cefepime vs piperacillin-tazobactam in adults hospitalized with acute infection: the ACORN randomized clinical trial. JAMA 2023;330:1557-1567',
        identifier: '10.1001/jama.2023.20583',
        kind: 'doi',
      },
      {
        label:
          'Harris PNA, Tambyah PA, Lye DC, et al. Effect of piperacillin-tazobactam vs meropenem on 30-day mortality for patients with E coli or Klebsiella pneumoniae bloodstream infection and ceftriaxone resistance. JAMA 2018;320:984-994',
        identifier: '10.1001/jama.2018.12163',
        kind: 'doi',
      },
      {
        label: 'ACORN: cefepime against piperacillin-tazobactam in hospitalised adults',
        identifier: 'NCT05094154',
        kind: 'nct',
      },
      {
        label:
          'Drugs@FDA: MAXIPIME (cefepime hydrochloride), NDA 050679 — United States prescribing information, Warnings and Precautions 5.2 Neurotoxicity',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=050679',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 5479537 — cefepime structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5479537',
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
  // ---------------------------------------------------------------------------------------------
  // 5. Meropenem — the reserve antibiotic that won the one trial designed to make it unnecessary,
  //    and whose most confident pharmacological prediction failed in 607 patients.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'meropenem',
    name: 'Meropenem',
    tradeName: 'Merrem IV',
    sponsor:
      'Sumitomo Pharmaceuticals (discovery) with Zeneca, later AstraZeneca, as developer; the current United States application holder on NDA 050706 is Pfizer, and generics are widely marketed',
    targetGene:
      'Bacterial cell-wall genes ftsI (PBP3), mrcB (PBP1b) and relatives — bacterial penicillin-binding-protein genes, not human ones',
    targetProtein:
      'Bacterial penicillin-binding proteins, principally PBP2 and PBP3 in Gram-negative organisms',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1996,
    indication:
      'Complicated skin and skin structure infections, complicated intra-abdominal infections, and bacterial meningitis in paediatric patients, caused by susceptible isolates of the designated microorganisms',
    patientFriendlyIndication:
      'Severe hospital infections, including infections in the abdomen, skin and the lining of the brain',
    anatomicalSite:
      'The bacterial periplasm and cell envelope, reached through outer-membrane porins that admit meropenem where other beta-lactams are excluded',
    conditionContext: {
      conditionExplainer:
        'Meropenem is one of the last antibiotics that reliably works when the common ones have failed. It is used in severe hospital infections, in the abdomen, in the bloodstream, and in meningitis, especially when the organism carries enzymes that destroy penicillins and cephalosporins.',
      whyItMatters:
        'The whole logic of antibiotic stewardship is to use meropenem as little as possible so that it still works when it is needed. The most important trial about it was designed to show a cheaper drug could take its place. It showed the opposite, and the argument about carbapenem-sparing has never fully recovered.',
      whoTakesThis:
        'Hospitalised adults and children with severe infection, including infections caused by extended-spectrum beta-lactamase-producing Enterobacterales and by Pseudomonas aeruginosa.',
      clinicalGoals:
        'Survival in the sickest populations, and clinical cure in the rest. Unusually for an antibiotic, its most important trials used 30-day and 28-day mortality as the primary endpoint rather than a cure rate.',
    },
    oneSentenceVerdict:
      'A carbapenem with a methyl group that blocks the human kidney enzyme which destroyed its predecessor, and a ring that resists almost every bacterial beta-lactamase — in the MERINO trial, 30-day mortality was 3.7% on meropenem against 12.3% on piperacillin-tazobactam in ceftriaxone-resistant bloodstream infection, and in MERCY, the continuous infusion that pharmacology predicted would work better made no difference at all in 607 patients with sepsis.',
    laymanHowItWorks:
      'Meropenem jams the machinery bacteria use to build their cell wall, and it is shaped so that almost none of the enzymes bacteria use to destroy antibiotics can get a grip on it. An earlier drug of the same type was destroyed by an enzyme in the human kidney; meropenem carries an extra methyl group in exactly the place that stops that happening, so it can be given on its own.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 86,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$4.67 per vial at United States pharmacy acquisition cost (CMS NADAC, median across 13 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States on 21 June 1996 under NDA 050706. Composition-of-matter protection has expired and thirteen generic products appear in the acquisition-cost survey. At about US$4.67 a vial, price is not what restricts meropenem use — stewardship is. It is the clearest case in this file of a drug whose scarcity is deliberately manufactured rather than economic.',
      synthesisComplexity: 'High',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The honest summary is that there is often no substitute, and that is the problem. Piperacillin-tazobactam was the designated carbapenem-sparing option and lost its head-to-head trial in bloodstream infection. Ertapenem is a carbapenem too, so substituting it saves nothing in class terms. Cefepime is narrower against the enzymes that matter. Nothing sold as food or a supplement treats a carbapenem-requiring infection, and this is a page where the alternatives question has an uncomfortable answer.',
      conventionalRx: [
        {
          name: 'Piperacillin-tazobactam',
          class: 'Antipseudomonal penicillin plus beta-lactamase inhibitor',
          howItCompares:
            'The designated carbapenem-sparing option, and the one that was tested. In MERINO, definitive therapy with piperacillin-tazobactam produced 30-day mortality of 12.3% against 3.7% with meropenem in ceftriaxone-resistant Escherichia coli and Klebsiella bloodstream infection, and did not meet its 5% non-inferiority margin.',
          typicalCost:
            'US$3.49 per vial at United States pharmacy acquisition cost (CMS NADAC, median across 12 listed generic tazobactam-containing products, survey effective 21 January 2026)',
          prosAndCons:
            'Pros: cheaper, spares the carbapenem class, no measured excess kidney injury in ACORN. Cons: failed the definitive bloodstream trial; susceptibility testing for it is unreliable, which is part of why it failed.',
        },
        {
          name: 'Ertapenem',
          class: 'Carbapenem, once daily',
          howItCompares:
            'The same class with a longer half-life and no useful antipseudomonal activity. Substituting it for meropenem simplifies administration but does nothing for carbapenem stewardship, because it exerts selection pressure on the same class.',
          typicalCost:
            'US$27.76 per vial at United States pharmacy acquisition cost (CMS NADAC, median across 14 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: once daily, suits outpatient parenteral therapy. Cons: about six times the price, no Pseudomonas cover, and no stewardship advantage.',
        },
        {
          name: 'Cefepime',
          class: 'Fourth-generation cephalosporin',
          howItCompares:
            'Resists AmpC enzymes but is hydrolysed by the extended-spectrum beta-lactamases that meropenem is used for, and shows a marked inoculum effect against them. It is the reasonable choice when the organism is an AmpC producer and the wrong one when it is a CTX-M producer.',
          typicalCost:
            'US$3.73 per vial at United States pharmacy acquisition cost (CMS NADAC, median across 8 listed generic products, survey effective 20 August 2025)',
          prosAndCons:
            'Pros: spares the carbapenem class, similar price, stable to AmpC. Cons: hydrolysed by ESBLs; the ACORN trial found more delirium and coma than with piperacillin-tazobactam.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Flag valproate or divalproex before the first dose',
          action:
            'Tell the treating team about any epilepsy medication, and name valproic acid or divalproex sodium specifically if they are being taken.',
          patientImpact:
            'Carbapenems including meropenem drop valproic acid concentrations, often below the range that controls seizures, and the label warns of breakthrough seizures. The mechanism is not fully established; in vitro and animal data suggest carbapenems block the conversion of the valproate glucuronide metabolite back into active drug.',
          clinicalPrecaution:
            'The label states that antibacterial drugs other than carbapenems should be considered in patients whose seizures are well controlled on valproate. This is a description of a documented interaction, not advice about any medicine.',
        },
        {
          name: 'Ask whether a narrower antibiotic could finish the course',
          action:
            'Once a culture result is back, ask whether the same infection could be treated with something narrower.',
          patientImpact:
            'Meropenem’s usefulness is a shared resource that erodes with use. Every trial on this page measures what happens to the patient in front of the clinician; none of them measures what happens to the next patient.',
          clinicalPrecaution:
            'De-escalation is a clinical judgement that depends on the organism, the site and the patient. This is a question worth asking, not an action to take.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'C[C@@H]1[C@@H]2[C@H](C(=O)N2C(=C1S[C@H]3C[C@H](NC3)C(=O)N(C)C)C(=O)O)[C@@H](C)O',
      chemicalFormula: 'C17H25N3O5S',
      molecularWeight: '383.50 g/mol',
      targetReceptorAffinity:
        'Meropenem acylates bacterial DD-transpeptidases with high affinity for PBP2 and PBP3 in Gram-negative organisms — binding two essential targets rather than one is part of why carbapenem resistance is hard for a bacterium to reach by point mutation. The trans-hydroxyethyl side chain at C6 is the feature that makes the acyl-enzyme resistant to hydrolysis by almost all serine beta-lactamases, including extended-spectrum and AmpC enzymes. The 1-beta-methyl group is a human-pharmacology feature rather than an antibacterial one: it blocks hydrolysis by renal dehydropeptidase-1, which is why meropenem needs no cilastatin while imipenem does.',
      structureSource: {
        label: 'PubChem CID 441130 (meropenem) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/441130',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'mem-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Configuration check at C1, C5, C6 and the pyrrolidinyl centres',
          description:
            'Confirm the 1-beta-methyl configuration and the trans relationship of the C6 hydroxyethyl side chain before anything else. These are the two substituents that define the molecule: one stops the human kidney destroying it, the other stops bacteria destroying it. An epimer at either is a different drug, not a weaker one.',
          reagentsAndBuffer:
            'Meropenem trihydrate reference standard, chiral HPLC, 1H NMR in D2O, optical rotation, Karl Fischer titration for the trihydrate stoichiometry',
        },
        {
          id: 'mem-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Construction of the carbapenem bicycle and thiol side-chain coupling',
          description:
            'Build the strained bicyclic carbapenem nucleus, then couple the dimethylcarbamoyl pyrrolidinyl thiol at C2. Carbapenem manufacture is the most demanding chemistry in this file: the ring system is more strained than a penicillin’s, the intermediates are thermally labile, and the process runs cold.',
          dependsOnStepId: 'mem-w1',
          reagentsAndBuffer:
            'Protected 4-nitrobenzyl carbapenem enol phosphate intermediate, (2S,4S)-4-mercapto-N,N-dimethylpyrrolidine-2-carboxamide, diisopropylethylamine in acetonitrile at sub-zero temperature under nitrogen',
        },
        {
          id: 'mem-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Deprotection, crystallisation as the trihydrate and open-ring control',
          description:
            'Remove the protecting groups under conditions mild enough to leave the beta-lactam intact, then crystallise the trihydrate. The critical specification is the ring-opened hydrolysis product: carbapenems degrade in solution faster than most beta-lactams, which is why reconstituted vials have short in-use limits.',
          dependsOnStepId: 'mem-w2',
          reagentsAndBuffer:
            'Catalytic hydrogenation over palladium on carbon, aqueous buffer at controlled pH, crystallisation from water-acetone, stability-indicating HPLC for the ring-opened degradant',
        },
        {
          id: 'mem-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'OprD-dependent uptake in Pseudomonas aeruginosa',
          description:
            'Confirm entry through the specific porin that admits carbapenems in Pseudomonas, using an OprD-deficient strain as the negative control. This step exists because the commonest route to carbapenem resistance in Pseudomonas is not an enzyme but the loss of a doorway — an organism that never lets the drug in does not need to destroy it.',
          dependsOnStepId: 'mem-w3',
          reagentsAndBuffer:
            'Pseudomonas aeruginosa PAO1 with an isogenic oprD deletion mutant, cation-adjusted Mueller-Hinton broth, osmotic shock periplasmic fractionation, LC-MS/MS quantification of intracellular meropenem',
        },
        {
          id: 'mem-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Carbapenemase hydrolysis panel and dehydropeptidase-1 stability assay',
          description:
            'Measure hydrolysis by the enzymes that do defeat meropenem — KPC, NDM, VIM, OXA-48 — and, separately, run the drug against purified human renal dehydropeptidase-1 with imipenem as the paired comparator. The second assay is the historical one: it is the experiment that showed a single methyl group could turn a drug that needed a co-administered enzyme inhibitor into one that did not.',
          dependsOnStepId: 'mem-w4',
          reagentsAndBuffer:
            'Purified KPC-2, NDM-1, VIM-2 and OXA-48 enzymes, spectrophotometric hydrolysis assay at 298 nm, porcine or recombinant human dehydropeptidase-1, imipenem as paired substrate, phosphate buffer at pH 7.4',
        },
      ],
    },
    keyAudits: [
      {
        id: 'mem-a1',
        category: 'measured',
        title: 'MERINO: 3.7% mortality on meropenem against 12.3% on the carbapenem-sparing option',
        laymanSummary:
          'A trial across nine countries set out to show that a cheaper, older antibiotic could replace meropenem in serious bloodstream infections, so that meropenem could be saved for later. It found that three times as many patients died on the alternative.',
        technicalDetails:
          'MERINO enrolled at 26 sites in 9 countries. Of 1,646 patients screened, 391 were randomised: adults with at least one blood culture growing Escherichia coli or Klebsiella non-susceptible to ceftriaxone but susceptible to piperacillin-tazobactam. In the primary analysis population of 379 patients (mean age 66.5, 47.8% women), 30-day all-cause mortality was 23 of 187 (12.3%) with piperacillin-tazobactam against 7 of 191 (3.7%) with meropenem — a risk difference of 8.6% with a one-sided 97.5% confidence bound of 14.5%, against a pre-specified non-inferiority margin of 5%. P for non-inferiority was .90. The effect was consistent in the per-protocol population. Non-fatal serious adverse events were 2.7% and 1.6%.',
        evidenceSource: 'Harris PNA et al., JAMA 2018;320:984-994 (MERINO, NCT02176122)',
        doi: '10.1001/jama.2018.12163',
        measuredMetric:
          'All-cause mortality 30 days after randomisation, non-inferiority design with a 5% margin',
        auditFlag: 'verified',
      },
      {
        id: 'mem-a2',
        category: 'conclusion_shift',
        title: 'Half the MERINO effect was a susceptibility-testing artefact — and the answer held',
        laymanSummary:
          'When the blood isolates were retested in a single central laboratory, some had been wrongly called susceptible to the comparator drug. Correcting that cut the mortality gap roughly in half. It did not close it, and the conclusion did not change.',
        technicalDetails:
          'Central broth microdilution and whole genome sequencing were performed on 320 of 379 isolates. Piperacillin-tazobactam susceptibility was 94% and meropenem susceptibility 100%. The piperacillin-tazobactam non-susceptible breakpoint of MIC above 16 mg/L best predicted 30-day mortality after adjustment for confounders (odds ratio 14.9, 95% CI 2.8 to 87.2). The absolute risk increase for piperacillin-tazobactam against meropenem was 9% (95% CI 3 to 15%) in the original primary analysis population and 8% (95% CI 2 to 15%) in the microbiologically assessable population, falling to 5% (95% CI -1 to 10%) once strains with MIC above 16 mg/L were excluded. Isolates co-harbouring an extended-spectrum beta-lactamase and OXA-1 had elevated MICs and the highest risk increase at 14% (95% CI 2 to 28%). The authors concluded that poor reliability of piperacillin-tazobactam susceptibility testing, and the high prevalence of OXA-1 alongside ESBLs, mean meropenem remains the preferred choice.',
        evidenceSource: 'Henderson A et al., Clin Infect Dis 2021;73:e3842-e3850 (MERINO post hoc)',
        doi: '10.1093/cid/ciaa1479',
        inferredClaim:
          'That MERINO measured a pure drug-versus-drug difference — a substantial part of it was the comparator being given to patients whose organism was not actually susceptible, which is a finding about diagnostic reliability as much as about pharmacology',
        auditFlag: 'verified',
      },
      {
        id: 'mem-a3',
        category: 'failed',
        title:
          'Continuous infusion: the strongest pharmacological prediction in the field, and null',
        laymanSummary:
          'Beta-lactams kill best when the drug level stays above a threshold, so giving meropenem as a slow continuous drip rather than short doses should work better. In 607 critically ill patients it made no difference to anything. Two larger studies since have pulled in the other direction without settling it.',
        technicalDetails:
          'MERCY was a double-blind randomised trial in 607 critically ill patients with sepsis or septic shock across 31 intensive care units in Croatia, Italy, Kazakhstan and Russia, receiving an equal daily dose of meropenem by continuous (n=303) or intermittent (n=304) administration. Sixty-one percent had septic shock; median time from admission to randomisation was 9 days and median therapy duration 11 days. The composite primary outcome of all-cause mortality plus emergence of pandrug-resistant or extensively drug-resistant bacteria at day 28 occurred in 142 (47%) against 149 (49%), relative risk 0.96 (95% CI 0.81 to 1.13), P=.60. None of the four secondary outcomes was statistically significant. Mortality at 90 days was 42% in both groups — 127 of 303 against 127 of 304. The question did not end there: BLING III later randomised 7,031 critically ill adults to continuous or intermittent piperacillin-tazobactam or meropenem and found 90-day mortality of 24.9% against 26.8%, odds ratio 0.91 (95% CI 0.81 to 1.01), P=.08, with higher clinical cure on continuous infusion; a Bayesian pooling of 18 trials in 9,108 patients then estimated a mortality risk ratio of 0.86 (95% credible interval 0.72 to 0.98) at high certainty. MERCY is null, the largest trial missed significance, and the pooled estimate favours prolonged infusion.',
        evidenceSource: 'Monti G et al., JAMA 2023;330:141-151 (MERCY, NCT03452839)',
        doi: '10.1001/jama.2023.10598',
        measuredMetric:
          'Composite of 28-day all-cause mortality and emergence of pandrug-resistant or extensively drug-resistant bacteria',
        auditFlag: 'verified',
      },
      {
        id: 'mem-a4',
        category: 'measured',
        title:
          'No seizures attributed to the drug in 607 critically ill patients over a median 11 days',
        laymanSummary:
          'Carbapenems have a reputation for causing seizures, earned by the first drug in the class. In a trial giving meropenem to six hundred severely ill patients for a median of eleven days, no seizures or allergic reactions were attributed to it.',
        technicalDetails:
          'MERCY recorded seizures, allergic reactions and mortality as adverse events by protocol. In 607 patients with sepsis or septic shock, median meropenem duration 11 days (IQR 6 to 17), no adverse events of seizures or allergic reactions related to the study drug were reported. This is consistent with the structural difference: the 1-beta-methyl group that confers dehydropeptidase-1 stability also reduces the central nervous system liability that characterised imipenem. The label nonetheless carries a seizure warning, records severe cutaneous adverse reactions including Stevens-Johnson syndrome and toxic epidermal necrolysis, and warns that meropenem lowers valproic acid concentrations enough to cause breakthrough seizures.',
        evidenceSource:
          'Monti G et al., JAMA 2023;330:141-151 (MERCY); Meropenem for Injection United States prescribing information, Warnings and Precautions 5.2 to 5.4 and Drug Interactions 7.2',
        doi: '10.1001/jama.2023.10598',
        measuredMetric:
          'Protocol-recorded seizures and allergic reactions attributed to study drug in a 607-patient randomised trial',
        auditFlag: 'verified',
      },
      {
        id: 'mem-a5',
        category: 'inferred',
        title: 'Every trial measures this patient; none measures the next one',
        laymanSummary:
          'The entire reason meropenem is rationed is that using it breeds bacteria that resist it. Not one of the trials on this page measured that. The case for restraint rests on mechanism and on population surveillance, not on any randomised comparison.',
        technicalDetails:
          'MERINO’s stated purpose was to identify a carbapenem-sparing option, precisely because treating ESBL producers with carbapenems is expected to select for carbapenem resistance. The trial measured 30-day mortality and did not measure subsequent carbapenem-resistant colonisation or infection in either arm, in participants or in their units. MERCY came closest of any trial in this file: it made emergence of pandrug-resistant or extensively drug-resistant bacteria at day 28 part of its composite primary outcome — and found no difference between infusion strategies, which answers a question about how to give the drug rather than whether to. The proposition that restricting meropenem preserves its usefulness is supported by mechanism, by ecological surveillance and by the observed spread of KPC, NDM, VIM and OXA-48 enzymes, and it has never been tested by randomising patients or units to different stewardship policies with resistance as the primary endpoint.',
        evidenceSource:
          'Harris PNA et al., JAMA 2018;320:984-994 (MERINO); Monti G et al., JAMA 2023;330:141-151 (MERCY)',
        doi: '10.1001/jama.2018.12163',
        inferredClaim:
          'That restricting meropenem preserves its future effectiveness — the entire premise of carbapenem stewardship, mechanistically compelling, ecologically supported, and not measured as a randomised endpoint by any trial on this page',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Given into a vein, with nothing added to protect it',
        laymanDesc:
          'The first drug of this type was destroyed by an enzyme in the human kidney and had to be given with a second drug to block that enzyme. Meropenem carries one extra methyl group in exactly the right place, and needs no companion.',
        molecularDetail:
          'The 1-beta-methyl substituent sterically blocks hydrolysis by renal dehydropeptidase-1, the brush-border enzyme that degrades imipenem. Imipenem is therefore co-formulated with cilastatin, a dehydropeptidase inhibitor; meropenem is given alone. The same substituent reduces the central nervous system liability that gave the class its seizure reputation.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It enters through a doorway most antibiotics cannot use',
        laymanDesc:
          'Gram-negative bacteria control what gets in through specific protein channels. Meropenem is small and compact enough to use them. Losing one of those doorways is how Pseudomonas becomes resistant without needing any enzyme at all.',
        molecularDetail:
          'Entry into Pseudomonas aeruginosa is largely through the OprD porin. Loss or downregulation of OprD is the commonest mechanism of carbapenem resistance in that organism and confers resistance without any beta-lactamase, which is why a resistant isolate can still test susceptible to every other class.',
        iconName: 'DoorOpen',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Almost no bacterial enzyme can open its ring',
        laymanDesc:
          'The side arm on meropenem’s ring points the wrong way for the usual bacterial scissors. Enzymes that shred penicillins and cephalosporins simply cannot complete the reaction on it.',
        molecularDetail:
          'The trans-orientated 6-alpha-hydroxyethyl side chain leaves the acyl-enzyme intermediate in a conformation that resists deacylation by serine beta-lactamases, including extended-spectrum and AmpC enzymes. Only the dedicated carbapenemases — KPC, NDM, VIM, IMP and OXA-48 — hydrolyse it efficiently, and those are the enzymes whose global spread defines the current resistance emergency.',
        iconName: 'Shield',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'It jams two essential tools at once',
        laymanDesc:
          'Most beta-lactams block one wall-building enzyme. Meropenem blocks two of the essential ones, which is part of why bacteria find it so hard to escape by a single mutation.',
        molecularDetail:
          'High affinity for both PBP2, which maintains rod shape, and PBP3, which builds the division septum, produces rapid killing with characteristic morphological change. Binding two independently essential targets means a single point mutation in either does not confer resistance.',
        iconName: 'Lock',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The cell lyses',
        laymanDesc: 'Wall repair stops, wall demolition does not, and the bacterium bursts.',
        molecularDetail:
          'Killing is time-dependent on the fraction of the dosing interval during which free concentration exceeds the minimum inhibitory concentration — the pharmacodynamic rationale that predicted continuous infusion would be superior, and that MERCY tested and did not confirm.',
        iconName: 'Zap',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What is spent when it is used',
        laymanDesc:
          'Meropenem works partly because it is used sparingly. Every course adds pressure toward the enzymes that destroy it, and those enzymes are spreading. That cost falls on future patients, and no trial has measured it.',
        molecularDetail:
          'Carbapenemase genes — blaKPC, blaNDM, blaVIM, blaIMP and blaOXA-48 — are carried on mobile genetic elements and spread horizontally between species. MERCY included emergence of pandrug-resistant or extensively drug-resistant bacteria at day 28 in its composite primary outcome and found no difference between infusion strategies; no trial in this file randomised patients to different stewardship policies with resistance as the primary endpoint.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'MERINO (NCT02176122, ACTRN12613000532707)',
        phase: 'Phase 4, randomised, parallel-group, non-inferiority, 26 sites in 9 countries',
        sampleSize: 379,
        primaryEndpoint: 'All-cause mortality 30 days after randomisation',
        endpointMet: true,
        statisticalPValue:
          '3.7% (7 of 191) on meropenem against 12.3% (23 of 187) on piperacillin-tazobactam; risk difference 8.6%, one-sided 97.5% CI upper bound 14.5%, non-inferiority margin 5%, P=.90 for non-inferiority',
        unreportedAdverseSignals:
          'A post-hoc central laboratory reanalysis found piperacillin-tazobactam susceptibility testing unreliable: excluding isolates with MIC above 16 mg/L reduced the absolute risk increase from 9% to 5% with an interval crossing zero. The trial answered a clinical question and exposed a diagnostic one.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'MERCY (NCT03452839)',
        phase: 'Phase 4, double-blind, randomised, 31 intensive care units in 4 countries',
        sampleSize: 607,
        primaryEndpoint:
          'Composite of all-cause mortality and emergence of pandrug-resistant or extensively drug-resistant bacteria at day 28',
        endpointMet: false,
        statisticalPValue:
          '47% against 49%, relative risk 0.96 (95% CI 0.81 to 1.13), P=.60; 90-day mortality 42% in both groups',
        unreportedAdverseSignals:
          'None of the four secondary outcomes was significant either. The trial randomised the administration schedule, not the drug, so it says nothing about whether meropenem was the right agent — only that the pharmacokinetic argument for infusing it continuously did not translate into outcome.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '30-day mortality 3.7% on meropenem against 12.3% on piperacillin-tazobactam in 379 randomised patients with ceftriaxone-resistant bloodstream infection',
        'Piperacillin-tazobactam MIC above 16 mg/L predicted 30-day mortality with an odds ratio of 14.9 (95% CI 2.8 to 87.2) after adjustment',
        'Continuous against intermittent administration: 47% against 49% composite outcome, relative risk 0.96 (95% CI 0.81 to 1.13), in 607 critically ill patients',
        'No seizures or allergic reactions attributed to study drug across 607 patients treated for a median of 11 days',
      ],
      unsupportedInferences: [
        'That restricting meropenem preserves its effectiveness — the premise of stewardship, never tested with resistance as a randomised primary endpoint',
        'That keeping free drug concentrations continuously above the minimum inhibitory concentration improves outcome — null in MERCY, P=.08 in the 7,031-patient BLING III trial, and supported at high certainty only by Bayesian pooling of 18 trials',
        'That MERINO measured a clean drug-versus-drug difference, when a substantial part of it was comparator given to organisms that were not truly susceptible',
        'That a single 391-patient trial settles definitive therapy for all ESBL bloodstream infections; MERINO has not been independently replicated',
      ],
      whatFailedInitially: [
        'The carbapenem-sparing strategy failed its own definitive trial: piperacillin-tazobactam missed a 5% non-inferiority margin with a mortality difference of 8.6 percentage points',
        'Continuous infusion produced no benefit on any outcome in the 607-patient MERCY trial, and the 7,031-patient BLING III trial missed significance on mortality at P=.08',
        'Routine susceptibility testing for the comparator was shown to be unreliable enough to distort a multinational randomised trial',
        'Carbapenemases that hydrolyse meropenem are carried on mobile elements and have spread globally, which is the ceiling on everything above',
      ],
      realWorldOutcome: [
        'Approved 21 June 1996 under NDA 050706 and on the WHO Model List of Essential Medicines as a Reserve or Watch group antibiotic',
        'Available at about US$4.67 a vial: what restricts its use is policy, not price',
        'MERINO reversed the direction of carbapenem-sparing practice for ESBL bloodstream infection',
        'Needs no dehydropeptidase inhibitor, unlike imipenem, because of one methyl group added in the 1980s',
      ],
    },
    deliverySystem: {
      type: 'Intravenous infusion or bolus injection; no oral formulation exists',
      description:
        'Parenteral only. Unlike imipenem it requires no co-administered dehydropeptidase inhibitor, because the 1-beta-methyl group blocks the renal enzyme that would otherwise degrade it. Predominantly renally cleared. Reconstituted solutions are less stable than most beta-lactams, which constrains how it can be given.',
      safetyProfile:
        'Better tolerated than its class reputation suggests: in 607 critically ill patients treated for a median 11 days, no seizures or allergic reactions were attributed to the drug. The label nonetheless warns of seizures and other central nervous system events, of serious and occasionally fatal anaphylaxis, and of severe cutaneous adverse reactions including Stevens-Johnson syndrome, toxic epidermal necrolysis, DRESS, erythema multiforme and acute generalised exanthematous pustulosis. Thrombocytopenia has been observed in renal dysfunction. The interaction that most often matters is with valproic acid or divalproex: meropenem lowers valproate concentrations, potentially below the range that controls seizures, and the label advises considering a non-carbapenem alternative in patients whose epilepsy is controlled on valproate.',
    },
    commonQuestions: [
      {
        q: 'Why is it kept in reserve if it is cheap?',
        a: 'Because what is scarce about meropenem is not the molecule, it is the susceptibility. At about US$4.67 a vial it costs less than many antibiotics used without a second thought. What restricts it is that the enzymes capable of destroying it — KPC, NDM, VIM, IMP, OXA-48 — sit on mobile genetic elements that move between bacterial species, and every course of meropenem is selection pressure in their favour. Once an organism carries one, there is very little left. That makes meropenem an unusual case in this file: a drug whose scarcity is deliberately manufactured by policy rather than imposed by price.',
      },
      {
        q: 'Was the trial that made meropenem preferred a fair one?',
        a: 'Fair, and more complicated than its headline. MERINO randomised 379 patients with bloodstream infection caused by ceftriaxone-resistant E. coli or Klebsiella and found 30-day mortality of 12.3% with piperacillin-tazobactam against 3.7% with meropenem, missing its 5% non-inferiority margin decisively. A later central-laboratory reanalysis retested the isolates and found that piperacillin-tazobactam susceptibility results from local laboratories were unreliable. Excluding isolates whose true MIC was above 16 mg/L cut the absolute risk increase from 9% to 5%, with the interval now crossing zero. So part of what MERINO measured was the comparator being given to organisms it could not treat. The authors’ conclusion did not change — if you cannot reliably tell which isolates are susceptible, that unreliability is part of the treatment decision.',
        auditNote:
          'MERINO has not been independently replicated. A single 391-patient trial is a thin foundation for a global change in practice, and that is true even when the result is as clean as this one looks.',
      },
      {
        q: 'Should it be given as a continuous drip?',
        a: 'The pharmacology says yes and the trial says it makes no difference. Beta-lactams kill in proportion to how long the drug concentration stays above the threshold that inhibits the organism, so a continuous infusion should outperform intermittent doses of the same total amount. MERCY tested exactly that in 607 critically ill patients with sepsis, double-blind, with the same daily amount in both arms. The composite of 28-day death and emergence of extensively or pandrug-resistant bacteria occurred in 47% against 49%, relative risk 0.96. None of the four secondary outcomes differed. Ninety-day mortality was 42% in both arms — 127 patients in each. Two larger studies have since pulled the other way without settling it: BLING III, in 7,031 patients receiving piperacillin-tazobactam or meropenem, found 90-day mortality of 24.9% against 26.8% with a P value of .08 and clearly higher clinical cure, and a Bayesian pooling of 18 trials in 9,108 patients estimated a mortality risk ratio of 0.86 (credible interval 0.72 to 0.98) at high certainty. So the honest position is that MERCY found nothing, the largest single trial missed, and the pooled estimate favours the infusion.',
      },
      {
        q: 'Does it cause seizures?',
        a: 'Much less than the class reputation suggests, and the reputation was earned by a different drug. Imipenem, the first carbapenem, has a genuine seizure liability. Meropenem carries an extra methyl group at position 1 that both protects it from a human kidney enzyme and reduces its central nervous system effects. In MERCY, 607 critically ill patients received it for a median of eleven days and no seizures or allergic reactions were attributed to the study drug. The label still warns about seizures, and there is one interaction worth knowing: meropenem drives valproic acid concentrations down, sometimes below the level that controls epilepsy, and the label suggests considering a non-carbapenem antibiotic in someone whose seizures are well controlled on valproate.',
      },
      {
        q: 'Does using it now make resistance worse later?',
        a: 'Almost certainly, and no trial on this page measured it. That is the honest shape of the evidence. MERINO existed because of this concern — its whole purpose was to find a carbapenem-sparing option — but its endpoint was 30-day mortality, and neither arm was followed for subsequent carbapenem-resistant colonisation. MERCY came closest, building emergence of pandrug-resistant or extensively drug-resistant bacteria into its composite primary outcome, and found no difference between two ways of giving the same drug. What supports restraint is the mechanism, the mobility of carbapenemase genes between species, and worldwide surveillance showing them spreading. That is a strong case. It is not the same kind of evidence as the mortality figures on this page, and this record keeps them apart.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Harris PNA, Tambyah PA, Lye DC, et al. Effect of piperacillin-tazobactam vs meropenem on 30-day mortality for patients with E coli or Klebsiella pneumoniae bloodstream infection and ceftriaxone resistance: the MERINO randomized clinical trial. JAMA 2018;320:984-994',
        identifier: '10.1001/jama.2018.12163',
        kind: 'doi',
      },
      {
        label:
          'Henderson A, Paterson DL, Chatfield MD, et al. Association between minimum inhibitory concentration, beta-lactamase genes and mortality for patients treated with piperacillin/tazobactam or meropenem from the MERINO study. Clin Infect Dis 2021;73:e3842-e3850',
        identifier: '10.1093/cid/ciaa1479',
        kind: 'doi',
      },
      {
        label:
          'Monti G, Bradic N, Marzaroli M, et al. Continuous vs intermittent meropenem administration in critically ill patients with sepsis: the MERCY randomized clinical trial. JAMA 2023;330:141-151',
        identifier: '10.1001/jama.2023.10598',
        kind: 'doi',
      },
      {
        label:
          'MERINO: piperacillin-tazobactam against meropenem in ceftriaxone-resistant bacteraemia',
        identifier: 'NCT02176122',
        kind: 'nct',
      },
      {
        label:
          'Dulhunty JM, Brett SJ, De Waele JJ, et al. Continuous vs intermittent beta-lactam antibiotic infusions in critically ill patients with sepsis: the BLING III randomized clinical trial. JAMA 2024;332:629-637',
        identifier: '10.1001/jama.2024.9779',
        kind: 'doi',
      },
      {
        label:
          'Abdul-Aziz MH, Hammond NE, Brett SJ, et al. Prolonged vs intermittent infusions of beta-lactam antibiotics in adults with sepsis or septic shock: a systematic review and meta-analysis. JAMA 2024;332:638-648',
        identifier: '10.1001/jama.2024.9803',
        kind: 'doi',
      },
      {
        label: 'MERCY: continuous against intermittent meropenem in sepsis',
        identifier: 'NCT03452839',
        kind: 'nct',
      },
      {
        label: 'BLING III: continuous against intermittent beta-lactam infusion in sepsis',
        identifier: 'NCT03213990',
        kind: 'nct',
      },
      {
        label:
          'Drugs@FDA: MERREM IV (meropenem), NDA 050706 — original approval 21 June 1996; United States prescribing information, Warnings and Precautions 5.1 to 5.8 and Drug Interactions 7.2',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=050706',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 441130 — meropenem structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/441130',
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
  // ---------------------------------------------------------------------------------------------
  // 6. Piperacillin-tazobactam — the most-used empirical antibiotic in Western intensive care,
  //    blamed for kidney injury it does not cause and cleared of a failure it did.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'piperacillin-tazobactam',
    name: 'Piperacillin and Tazobactam',
    tradeName: 'Zosyn',
    sponsor:
      'Lederle and Wyeth (originator, NDA 050684 approved 22 October 1993); the enriched record for this page lists the generic holder Eugia Pharma and a 2023 ANDA date, which is a manufacturing approval rather than the drug’s approval',
    targetGene:
      'Bacterial cell-wall genes ftsI, mrcA/mrcB and relatives, plus class A beta-lactamase genes including blaTEM and blaSHV — all bacterial',
    targetProtein:
      'Bacterial penicillin-binding proteins for piperacillin; class A serine beta-lactamases for tazobactam',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1993,
    indication:
      'Moderate to severe appendicitis complicated by rupture or abscess and peritonitis, uncomplicated and complicated skin and skin structure infections, postpartum endometritis or pelvic inflammatory disease, community-acquired pneumonia and nosocomial pneumonia, caused by susceptible beta-lactamase-producing isolates of the designated organisms',
    patientFriendlyIndication:
      'Severe hospital infections of the abdomen, skin, lungs and pelvis, given by drip',
    anatomicalSite:
      'The bacterial periplasm — where tazobactam intercepts the enzyme and piperacillin reaches the wall-building machinery',
    conditionContext: {
      conditionExplainer:
        'This is the drug most often started when someone is admitted to intensive care with an infection and nobody yet knows what it is. It covers a very wide range, including bowel organisms, Pseudomonas and anaerobes, which is why it is the default in abdominal infection.',
      whyItMatters:
        'It sits at the centre of two of the largest arguments in hospital antibiotic practice: whether it damages kidneys, which a 2,511-patient trial answered in 2023, and whether it can replace a carbapenem in resistant bloodstream infection, which a nine-country trial answered in 2018. The answers went in opposite directions.',
      whoTakesThis:
        'Hospitalised adults and children with severe infection, particularly intra-abdominal infection, hospital-acquired pneumonia and neutropenic fever.',
      clinicalGoals:
        'Clinical cure, and survival in the critically ill. Its two most consequential trials both used mortality as the primary endpoint, which is unusual for an antibiotic.',
    },
    oneSentenceVerdict:
      'An antipseudomonal penicillin paired with a beta-lactamase inhibitor that covers Gram-negatives, Gram-positives and anaerobes in one bag — the ACORN trial in 2,511 patients found it caused no more acute kidney injury or death than cefepime (OR 0.95, 95% CI 0.80 to 1.13) and less neurological dysfunction, and the MERINO trial found 30-day mortality of 12.3% against meropenem’s 3.7% in ceftriaxone-resistant bloodstream infection, missing its non-inferiority margin decisively.',
    laymanHowItWorks:
      'Piperacillin is a wide-reaching penicillin that jams the tool bacteria use to build their cell wall. Many bacteria destroy penicillins with an enzyme, so the bag also contains tazobactam, a decoy that the enzyme attacks and is destroyed by. Between them they cover almost everything a hospital infection is likely to be, which is exactly why the drug is started before anyone knows what the infection is.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 80,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$3.49 per vial at United States pharmacy acquisition cost, recorded in the CMS NADAC survey against tazobactam-containing products (median across 12 listed generic products, survey effective 21 January 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Zosyn was approved in the United States on 22 October 1993 under NDA 050684, held by Wyeth. Composition-of-matter protection has long expired and generics are widely marketed; the enriched record behind this page carries a 2023 date and a generic sponsor, which is that manufacturer’s abbreviated application rather than the drug’s approval, and the discrepancy is recorded here rather than propagated. Tazobactam is not marketed alone in the United States, so the acquisition-cost survey line for tazobactam is a line for this combination.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Two comparisons matter and both have been settled by randomisation. Against cefepime, in 2,511 patients, there was no kidney difference and less delirium with piperacillin-tazobactam. Against meropenem, in ceftriaxone-resistant bloodstream infection, it lost. Its unique advantage over both is anaerobic cover in one agent. Nothing sold as a food or supplement treats an intra-abdominal infection, and this is a page where that has to be said without qualification.',
      conventionalRx: [
        {
          name: 'Cefepime',
          class: 'Fourth-generation cephalosporin',
          howItCompares:
            'Similar Gram-negative and antipseudomonal reach with no useful anaerobic cover, so it is usually paired with a second agent in abdominal infection. In the head-to-head ACORN trial it produced no less kidney injury and more neurological dysfunction: days alive and free of delirium and coma were fewer on cefepime, odds ratio 0.79 (95% CI 0.65 to 0.95).',
          typicalCost:
            'US$3.73 per vial at United States pharmacy acquisition cost (CMS NADAC, median across 8 listed generic products, survey effective 20 August 2025)',
          prosAndCons:
            'Pros: stable to AmpC enzymes, similar price. Cons: no anaerobic cover, more delirium and coma in the randomised comparison, hydrolysed by extended-spectrum beta-lactamases.',
        },
        {
          name: 'Meropenem',
          class: 'Carbapenem',
          howItCompares:
            'Covers everything this combination covers plus the extended-spectrum beta-lactamase producers it cannot reliably treat. In MERINO, definitive therapy with meropenem produced 30-day mortality of 3.7% against 12.3% with piperacillin-tazobactam in ceftriaxone-resistant Escherichia coli and Klebsiella bloodstream infection.',
          typicalCost:
            'US$4.67 per vial at United States pharmacy acquisition cost (CMS NADAC, median across 13 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: reliable against ESBL producers, the evidence-supported choice in that setting. Cons: it is the class held in reserve, and every course spends some of that reserve.',
        },
        {
          name: 'Ertapenem',
          class: 'Carbapenem, once daily',
          howItCompares:
            'Matches the anaerobic and Enterobacterales cover, including ESBL producers, and adds once-daily administration, but has no useful activity against Pseudomonas — which is a large part of why piperacillin-tazobactam is chosen empirically in the first place.',
          typicalCost:
            'US$27.76 per vial at United States pharmacy acquisition cost (CMS NADAC, median across 14 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: once daily, covers ESBL producers and anaerobes. Cons: about eight times the price, no Pseudomonas cover, carbapenem selection pressure.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Ask what the culture grew before assuming the drip is still needed',
          action:
            'Once cultures are back, ask whether the same infection could be finished with something narrower or by mouth.',
          patientImpact:
            'This combination is chosen because nobody knows the organism yet. Once the organism is known, the reason for the breadth has usually gone, and breadth is not free — it is the selection pressure that produces the resistant organisms the next patient meets.',
          clinicalPrecaution:
            'De-escalation depends on the organism, the site and how the patient is doing. This is a question to ask the team, not a decision to make.',
        },
        {
          name: 'Do not accept a kidney-injury story as settled fact',
          action:
            'If someone is switched off this drug specifically to protect their kidneys, it is reasonable to ask what that is based on.',
          patientImpact:
            'The belief that piperacillin-tazobactam plus vancomycin damages kidneys came from retrospective studies in which the sicker patients received the combination. When 2,511 patients were randomised, three-quarters of them on vancomycin, there was no difference in the highest stage of kidney injury or death by day 14.',
          clinicalPrecaution:
            'One randomised trial at one academic centre is not the last word, and there may be good reasons to switch in a particular patient. The point is that the general claim is weaker than its currency suggests.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CCN1CCN(C(=O)C1=O)C(=O)N[C@@](C)(C2=CC=CC=C2)C(=O)N[C@H]3[C@@H]4N(C3=O)[C@H](C(S4)(C)C)C(=O)O.C[C@@]1([C@@H](N2[C@H](S1(=O)=O)CC2=O)C(=O)O)CN3C=CN=N3',
      chemicalFormula: 'C34H41N9O12S2',
      molecularWeight: '831.90 g/mol',
      targetReceptorAffinity:
        'The structure is a two-component mixture and is written as one: the piperacillin ureidopenicillin and the tazobactam penicillanic acid sulfone, separated by the period in the connection table. Piperacillin acylates bacterial DD-transpeptidases across an unusually wide range including Pseudomonas aeruginosa and the anaerobes. Tazobactam is a mechanism-based inactivator of class A serine beta-lactamases with a sulfone that drives irreversible enzyme modification; it is a weaker inhibitor of AmpC than sulbactam is and does not touch metallo-beta-lactamases or most carbapenemases. Neither component has a mammalian receptor.',
      structureSource: {
        label:
          'PubChem CID 461573 (piperacillin and tazobactam mixture) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/461573',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'tzp-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Component ratio and sulfone integrity assay',
          description:
            'Confirm the fixed 8:1 mass ratio of piperacillin to tazobactam and check that the tazobactam sulfone group is intact. This is a ratio product: a vial with the correct total mass and the wrong ratio delivers either an unprotected penicillin or a wasted inhibitor, and neither failure is visible without the assay.',
          reagentsAndBuffer:
            'Piperacillin sodium and tazobactam sodium reference standards, gradient HPLC with ultraviolet detection, 1H NMR in D2O, Karl Fischer titration',
        },
        {
          id: 'tzp-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Ureido side-chain acylation and separate sulfone oxidation',
          description:
            'Build the two molecules by unrelated routes. Piperacillin is made by acylating ampicillin with the ethyl-dioxopiperazinyl carbamoyl chloride that gives it its Pseudomonas reach; tazobactam is made by oxidising a triazolylmethyl penicillanic acid to the sulfone. They meet for the first time in the blending step.',
          dependsOnStepId: 'tzp-w1',
          reagentsAndBuffer:
            '4-ethyl-2,3-dioxopiperazine-1-carbonyl chloride, ampicillin, trimethylsilyl protection in dichloromethane; separately, peracid oxidation of 2-beta-(1,2,3-triazol-1-ylmethyl)penicillanic acid, controlled temperature under nitrogen',
        },
        {
          id: 'tzp-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Lyophilisation of the blended sodium salts with EDTA and citrate control',
          description:
            'Freeze-dry the two sodium salts together to the specified ratio. The commercial formulation contains edetate disodium and sodium citrate, which is why this product is compatible with lactated Ringer’s solution while the older formulation was not — a formulation change with a real bedside consequence.',
          dependsOnStepId: 'tzp-w2',
          reagentsAndBuffer:
            'Edetate disodium, sodium citrate, sterile water for injection, lyophilisation with controlled shelf temperature, residual moisture by Karl Fischer, sub-visible particle counting',
        },
        {
          id: 'tzp-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Paired periplasmic accumulation in Pseudomonas and Enterobacterales',
          description:
            'Measure how much of each component reaches the periplasm in an organism with efflux pumps intact and in an efflux-deficient mutant. Piperacillin is a MexAB-OprM substrate in Pseudomonas, so periplasmic concentration depends on export as much as on entry, and an assay run only in Escherichia coli will miss that entirely.',
          dependsOnStepId: 'tzp-w3',
          reagentsAndBuffer:
            'Pseudomonas aeruginosa PAO1 with an isogenic mexAB-oprM deletion, Escherichia coli reference strain, osmotic shock periplasmic fractionation, LC-MS/MS quantification of both components',
        },
        {
          id: 'tzp-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Fixed-ratio MIC panel with inoculum escalation and OXA-1 genotyping',
          description:
            'Run minimum inhibitory concentrations at the fixed inhibitor concentration used clinically, at standard and raised inoculum, against isolates genotyped for extended-spectrum beta-lactamases and for OXA-1. This is the assay the MERINO reanalysis showed was going wrong in routine laboratories: isolates co-carrying an ESBL and OXA-1 had elevated MICs, were sometimes reported susceptible, and carried the highest excess mortality of any subgroup.',
          dependsOnStepId: 'tzp-w4',
          reagentsAndBuffer:
            'Broth microdilution at a fixed 4 mg/L tazobactam concentration, cation-adjusted Mueller-Hinton broth at 5x10^5 and 5x10^7 CFU/mL, PCR or whole genome sequencing for blaCTX-M, blaSHV and blaOXA-1',
        },
      ],
    },
    keyAudits: [
      {
        id: 'tzp-a1',
        category: 'failed',
        title: 'MERINO: 12.3% mortality against meropenem’s 3.7%, and non-inferiority not met',
        laymanSummary:
          'A nine-country trial tested whether this cheaper, more familiar drug could replace a carbapenem in serious bloodstream infections caused by resistant bacteria. Three times as many patients died on it. The trial’s own conclusion is that its findings do not support using it in that setting.',
        technicalDetails:
          'MERINO screened 1,646 patients at 26 sites in 9 countries and randomised 391 adults with at least one blood culture growing Escherichia coli or Klebsiella non-susceptible to ceftriaxone but susceptible to piperacillin-tazobactam. Among 379 in the primary analysis population, 30-day all-cause mortality was 23 of 187 (12.3%) with piperacillin-tazobactam against 7 of 191 (3.7%) with meropenem — a risk difference of 8.6% with a one-sided 97.5% confidence bound of 14.5%, against a pre-specified non-inferiority margin of 5%. P for non-inferiority was .90. The result was consistent in the per-protocol population. Non-fatal serious adverse events were 5 of 188 (2.7%) and 3 of 191 (1.6%).',
        evidenceSource: 'Harris PNA et al., JAMA 2018;320:984-994 (MERINO, NCT02176122)',
        doi: '10.1001/jama.2018.12163',
        measuredMetric:
          'All-cause mortality 30 days after randomisation in a non-inferiority design with a 5% margin',
        auditFlag: 'verified',
      },
      {
        id: 'tzp-a2',
        category: 'conclusion_shift',
        title: 'Much of that failure was the laboratory, not the drug — and the advice stood',
        laymanSummary:
          'When every blood isolate was retested centrally, some had been wrongly reported as susceptible. Excluding those cut the mortality gap almost in half and its confidence interval crossed zero. The recommendation did not change, because a drug you cannot reliably test for is a drug you cannot reliably use.',
        technicalDetails:
          'Central broth microdilution and whole genome sequencing covered 320 of 379 isolates. Piperacillin-tazobactam susceptibility was 94% against meropenem’s 100%. A piperacillin-tazobactam MIC above 16 mg/L was the strongest predictor of 30-day mortality after adjustment for confounders (odds ratio 14.9, 95% CI 2.8 to 87.2). The absolute risk increase for piperacillin-tazobactam was 9% (95% CI 3 to 15%) in the original primary analysis population and 8% (95% CI 2 to 15%) in the microbiologically assessable population, falling to 5% (95% CI -1 to 10%) once strains above that MIC were excluded. Isolates co-harbouring an extended-spectrum beta-lactamase and OXA-1 had elevated MICs and the highest risk increase of any subgroup, 14% (95% CI 2 to 28%). The authors concluded that poor reliability of piperacillin-tazobactam susceptibility testing, together with the high prevalence of OXA-1 alongside ESBLs, means meropenem remains preferred.',
        evidenceSource: 'Henderson A et al., Clin Infect Dis 2021;73:e3842-e3850 (MERINO post hoc)',
        doi: '10.1093/cid/ciaa1479',
        inferredClaim:
          'That MERINO measured the drug — a large part of what it measured was a diagnostic failure, which changes the explanation without changing the recommendation',
        auditFlag: 'verified',
      },
      {
        id: 'tzp-a3',
        category: 'measured',
        title: 'It does not damage kidneys more than cefepime, in 2,511 randomised patients',
        laymanSummary:
          'For a decade hospitals moved patients off this drug to protect their kidneys. Randomised, against the drug they moved them to, there was no difference at all.',
        technicalDetails:
          'ACORN randomised 2,511 adults for whom antipseudomonal antibiotics were ordered within 12 hours of presenting to an emergency department or medical intensive care unit. On the five-level ordinal primary outcome of highest stage of acute kidney injury or death by day 14, 97 of 1,297 in the piperacillin-tazobactam group (7.5%) reached stage 3 acute kidney injury and 78 (6.0%) died, against 85 of 1,214 (7.0%) and 92 (7.6%) with cefepime — odds ratio 0.95 (95% CI 0.80 to 1.13), P=.56. Major adverse kidney events at day 14 were 114 (8.8%) against 124 (10.2%), absolute difference 1.4% (95% CI -1.0 to 3.8). Crucially, 77.2% of participants were receiving vancomycin at enrolment, so the trial tested the combination that generated the original concern. Days alive and free of delirium and coma favoured piperacillin-tazobactam: mean 12.2 (SD 4.3) against 11.9 (SD 4.6), odds ratio 0.79 (95% CI 0.65 to 0.95) against cefepime.',
        evidenceSource: 'Qian ET et al., JAMA 2023;330:1557-1567 (ACORN, NCT05094154)',
        doi: '10.1001/jama.2023.20583',
        measuredMetric:
          'Highest stage of acute kidney injury or death by day 14, and days alive and free of delirium and coma',
        auditFlag: 'verified',
      },
      {
        id: 'tzp-a4',
        category: 'conclusion_shift',
        title:
          'The nephrotoxicity reputation came from studies that could not control for sickness',
        laymanSummary:
          'The claim that this drug plus vancomycin wrecks kidneys came from looking back at records. In those records, the sickest patients got the combination — and the sickest patients get kidney injury. Randomisation removed the confusion and the effect vanished.',
        technicalDetails:
          'The hypothesis arose from retrospective cohorts and pharmacovigilance disproportionality analyses in which treatment was assigned by clinicians who could see how ill each patient was, a form of confounding by indication that no statistical adjustment fully removes. It changed prescribing at scale. ACORN tested it directly by randomisation, in a population where three-quarters were on vancomycin, and found the primary ordinal outcome unchanged (OR 0.95, 95% CI 0.80 to 1.13) and major adverse kidney events statistically indistinguishable. A second mechanism worth noting is measurement rather than injury: piperacillin-tazobactam interferes with creatinine secretion and some assay methods, so part of the historical signal may be a creatinine rise without a fall in glomerular filtration.',
        evidenceSource: 'Qian ET et al., JAMA 2023;330:1557-1567 (ACORN, NCT05094154)',
        doi: '10.1001/jama.2023.20583',
        inferredClaim:
          'That piperacillin-tazobactam, especially with vancomycin, causes acute kidney injury — a strongly held inference from non-randomised data that the randomised comparison did not support',
        auditFlag: 'verified',
      },
      {
        id: 'tzp-a5',
        category: 'inferred',
        title: 'Prolonged infusion: the biggest trial missed, the pooled analysis says it works',
        laymanSummary:
          'Giving this class of antibiotic slowly rather than in short bursts should work better, because they kill in proportion to how long the level stays high. The largest trial ever run on the question, in seven thousand patients, missed statistical significance on survival. A pooled analysis published in the same journal weeks later concluded, with high certainty, that it does save lives.',
        technicalDetails:
          'BLING III randomised 7,031 critically ill adults with sepsis across 104 intensive care units in seven countries to an equivalent 24-hour dose of piperacillin-tazobactam or meropenem by continuous or intermittent infusion. Ninety-day all-cause mortality was 864 of 3,474 (24.9%) against 939 of 3,507 (26.8%) — absolute difference -1.9% (95% CI -4.9 to 1.1), odds ratio 0.91 (95% CI 0.81 to 1.01), P=.08. Clinical cure was higher with continuous infusion, 55.7% against 50.0%, absolute difference 5.7% (95% CI 2.4 to 9.1). Other secondary outcomes did not differ. A Bayesian systematic review of 18 randomised trials in 9,108 critically ill adults, with 17 trials contributing to the primary outcome, then estimated a risk ratio for 90-day mortality of 0.86 (95% credible interval 0.72 to 0.98, I2 21.5%, high certainty), with a 99.1% posterior probability of benefit, alongside intensive care unit mortality 0.84 (0.70 to 0.97) and clinical cure 1.16 (1.07 to 1.31). The earlier MERCY trial of continuous meropenem alone, in 607 patients, had found nothing on its composite endpoint (RR 0.96, 95% CI 0.81 to 1.13).',
        evidenceSource:
          'Dulhunty JM et al., JAMA 2024;332:629-637 (BLING III, NCT03213990); Abdul-Aziz MH et al., JAMA 2024;332:638-648',
        doi: '10.1001/jama.2024.9779',
        inferredClaim:
          'That prolonged infusion reduces mortality — supported at high certainty by a Bayesian pooling of 18 trials, and not established by the single largest trial in that pool, which returned P=.08 on its primary endpoint',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Two molecules in a fixed ratio, given by drip',
        laymanDesc:
          'One of the pair kills bacteria across an unusually wide range. The other kills almost nothing and exists only to absorb the enzyme that would otherwise destroy the first. They are freeze-dried together in a fixed proportion.',
        molecularDetail:
          'Piperacillin is a ureidopenicillin; tazobactam is a penicillanic acid sulfone with negligible intrinsic antibacterial activity. The combination is supplied lyophilised at a fixed 8:1 ratio with edetate disodium and sodium citrate, a formulation that made the product compatible with lactated Ringer’s solution.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Both cross into the periplasm, and one of them can be pumped back out',
        laymanDesc:
          'The drugs have to reach the space between a bacterium’s outer skin and its wall. Pseudomonas has pumps that push the killing molecule straight back out again, which is one of the ways it becomes resistant without changing its target at all.',
        molecularDetail:
          'Entry is through outer-membrane porins. In Pseudomonas aeruginosa, piperacillin is a substrate of the MexAB-OprM efflux system, so periplasmic concentration is set by the balance of influx and export. Efflux upregulation confers resistance with no change in penicillin-binding proteins and no beta-lactamase.',
        iconName: 'ArrowRightLeft',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Tazobactam is spent destroying the enzyme',
        laymanDesc:
          'Resistant bacteria fill the periplasm with enzymes that cut penicillins apart. Tazobactam is shaped enough like a penicillin that the enzyme attacks it, and the reaction leaves the enzyme permanently broken.',
        molecularDetail:
          'Tazobactam is a mechanism-based inactivator of class A serine beta-lactamases including TEM and SHV enzymes. It has limited activity against class C AmpC cephalosporinases, none against class B metallo-beta-lactamases, and it is overwhelmed when an isolate carries an extended-spectrum enzyme alongside OXA-1 — the combination the MERINO reanalysis identified as carrying the highest excess mortality.',
        iconName: 'Shield',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Piperacillin jams the wall-building enzymes',
        laymanDesc:
          'With the defence enzymes used up, piperacillin reaches the tools that stitch the bacterial wall together and locks onto them.',
        molecularDetail:
          'Piperacillin acylates bacterial DD-transpeptidases across an unusually wide range: Gram-positive cocci, Enterobacterales, anaerobes including Bacteroides fragilis, and Pseudomonas aeruginosa. Anaerobic cover in a single agent is the property that makes this the default in intra-abdominal infection.',
        iconName: 'Lock',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The cell lyses',
        laymanDesc:
          'Wall repair stops, wall demolition continues, and the bacterium bursts under its own pressure.',
        molecularDetail:
          'Killing is time-dependent on the fraction of the dosing interval with free concentration above the minimum inhibitory concentration — the argument for prolonged infusion, supported at high certainty by pooled analysis of 18 trials and not reached by the largest single trial in that pool.',
        iconName: 'Zap',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Where the reputation and the evidence part company',
        laymanDesc:
          'For years this drug was blamed for kidney damage on the basis of records rather than trials. When it was finally randomised against its main rival, kidneys came out the same and brains came out better.',
        molecularDetail:
          'In 2,511 randomised patients, 77.2% of whom were also receiving vancomycin, the highest stage of acute kidney injury or death by day 14 was unchanged (OR 0.95, 95% CI 0.80 to 1.13) and major adverse kidney events at day 14 were 8.8% against cefepime’s 10.2%. Days alive and free of delirium and coma favoured piperacillin-tazobactam. Piperacillin also interferes with tubular creatinine secretion and with some creatinine assays, which can raise a measured creatinine without a fall in filtration.',
        iconName: 'BarChart3',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'MERINO (NCT02176122)',
        phase: 'Phase 4, randomised, parallel-group, non-inferiority, 26 sites in 9 countries',
        sampleSize: 379,
        primaryEndpoint: 'All-cause mortality 30 days after randomisation',
        endpointMet: false,
        statisticalPValue:
          '12.3% (23 of 187) against meropenem 3.7% (7 of 191); risk difference 8.6%, one-sided 97.5% CI upper bound 14.5% against a 5% margin, P=.90 for non-inferiority',
        unreportedAdverseSignals:
          'Central retesting later showed local susceptibility results for piperacillin-tazobactam were unreliable; excluding isolates with MIC above 16 mg/L reduced the absolute risk increase from 9% to 5% with an interval crossing zero. The trial is a drug result and a diagnostic result at the same time, and it is usually quoted only as the first.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'ACORN (NCT05094154)',
        phase: 'Phase 4, pragmatic, randomised, unblinded, single-centre',
        sampleSize: 2511,
        primaryEndpoint:
          'Highest stage of acute kidney injury or death by day 14 on a five-level ordinal scale',
        endpointMet: true,
        statisticalPValue:
          'Odds ratio 0.95 (95% CI 0.80 to 1.13), P=.56 — no excess kidney injury against cefepime; major adverse kidney events 8.8% against 10.2%, absolute difference 1.4% (95% CI -1.0 to 3.8)',
        unreportedAdverseSignals:
          'Single centre, 94.7% enrolled in the emergency department, unblinded. Days alive and free of delirium and coma favoured this arm, which was a secondary outcome and is the finding that changed practice more than the primary one did.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'BLING III (NCT03213990)',
        phase: 'Phase 4, international, open-label, randomised, 104 intensive care units',
        sampleSize: 7031,
        primaryEndpoint: 'All-cause mortality within 90 days of randomisation',
        endpointMet: false,
        statisticalPValue:
          'Continuous 24.9% (864 of 3,474) against intermittent 26.8% (939 of 3,507); absolute difference -1.9% (95% CI -4.9 to 1.1), odds ratio 0.91 (95% CI 0.81 to 1.01), P=.08',
        unreportedAdverseSignals:
          'Clinical cure was higher with continuous infusion, 55.7% against 50.0% (absolute difference 5.7%, 95% CI 2.4 to 9.1), while the mortality primary endpoint missed. The authors state the confidence interval includes both no important effect and a clinically important benefit — an unusually honest way to describe P=.08.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '30-day mortality 12.3% against meropenem’s 3.7% in 379 randomised patients with ceftriaxone-resistant bloodstream infection',
        'No difference in highest stage of acute kidney injury or death against cefepime in 2,511 randomised patients (OR 0.95, 95% CI 0.80 to 1.13)',
        'Major adverse kidney events at day 14: 8.8% against cefepime’s 10.2%, absolute difference 1.4% (95% CI -1.0 to 3.8)',
        '90-day mortality 24.9% with continuous against 26.8% with intermittent infusion in 7,031 critically ill adults, P=.08',
        'Clinical cure 55.7% against 50.0% with continuous infusion, absolute difference 5.7% (95% CI 2.4 to 9.1)',
      ],
      unsupportedInferences: [
        'That this combination causes acute kidney injury, particularly with vancomycin — the belief that reshaped a decade of prescribing, unconfirmed by randomisation',
        'That prolonged infusion reduces mortality, which pooled Bayesian analysis supports at high certainty and the largest single trial did not reach',
        'That susceptibility reported by a routine laboratory means the drug will work — central retesting found 6% of MERINO isolates non-susceptible, concentrated in the deaths',
        'That a 1993 combination approval implies contemporary evidence for every listed indication; most of them were approved on cure rates without mortality comparison',
      ],
      whatFailedInitially: [
        'It failed its own carbapenem-sparing trial, with a mortality difference of 8.6 percentage points against a 5% non-inferiority margin',
        'Routine susceptibility testing for it proved unreliable enough to distort a multinational randomised trial',
        'Isolates co-carrying an extended-spectrum beta-lactamase and OXA-1 had the highest excess mortality of any subgroup, 14% (95% CI 2 to 28%)',
        'The mortality endpoint of the largest infusion trial ever conducted in this class returned P=.08 and did not meet significance',
      ],
      realWorldOutcome: [
        'Approved 22 October 1993 under NDA 050684 and now the most-used empirical antibiotic in many Western intensive care units',
        'Available at about US$3.49 a vial, comparable to cefepime and cheaper than meropenem',
        'ACORN removed the main reason clinicians were switching away from it, and gave them a reason to switch toward it',
        'MERINO removed it from consideration as definitive therapy in ceftriaxone-resistant bloodstream infection',
      ],
    },
    deliverySystem: {
      type: 'Intravenous infusion, supplied as a lyophilised fixed-ratio powder with edetate disodium and sodium citrate',
      description:
        'Parenteral only. The current formulation contains edetate disodium and sodium citrate, which made it compatible with lactated Ringer’s solution where the earlier formulation was not. Predominantly renally cleared, with a minor biliary route for piperacillin. It is the agent most often combined with vancomycin in empirical intensive care regimens, which is why the kidney question mattered so much.',
      safetyProfile:
        'The reputation for nephrotoxicity, particularly alongside vancomycin, was not confirmed when 2,511 patients were randomised, three-quarters of them on vancomycin. Part of the historical signal is likely analytical: piperacillin interferes with tubular creatinine secretion and with some creatinine assays. Real and documented harms include hypersensitivity as with any penicillin, Clostridioides difficile-associated diarrhoea, thrombocytopenia and other cytopenias with prolonged use, and hypokalaemia from the sodium load. Neurological toxicity is less than with cefepime in the randomised comparison. It is not reliable against extended-spectrum beta-lactamase producers and should not be inferred to be from a routine susceptibility report.',
    },
    commonQuestions: [
      {
        q: 'Is it true that this drug damages the kidneys?',
        a: 'The randomised evidence says no, and it is a good illustration of why the distinction matters. The belief came from retrospective studies showing that patients given this combination with vancomycin had more acute kidney injury. Those studies could not separate the drug from the patient: clinicians choose broad-spectrum combinations for the sickest people, and the sickest people get kidney injury. The ACORN trial randomised 2,511 adults, 77.2% of whom were on vancomycin, and found the highest stage of kidney injury or death by day 14 was no different from cefepime — odds ratio 0.95, confidence interval 0.80 to 1.13. Major adverse kidney events at 14 days were 8.8% against 10.2%. There is also a measurement wrinkle worth knowing: piperacillin interferes with how the kidney secretes creatinine and with some laboratory assays, so it can raise a creatinine number without the kidney actually filtering less.',
        auditNote:
          'ACORN was a single-centre unblinded trial. That is a genuine limitation. It is still a far better instrument for this question than any number of database studies, because the confounding it removes is exactly the confounding that produced the belief.',
      },
      {
        q: 'Why was it dropped for resistant bloodstream infections?',
        a: 'Because it lost the trial designed to promote it. MERINO randomised 379 patients with bloodstream infection caused by ceftriaxone-resistant E. coli or Klebsiella that tested susceptible to this combination. Thirty-day mortality was 12.3% against meropenem’s 3.7%, well outside the 5% non-inferiority margin. The published conclusion is unusually blunt: the findings do not support use in this setting. A later central-laboratory reanalysis found part of the answer — local laboratories had reported some isolates susceptible when central testing showed they were not, and excluding those cut the excess mortality from 9% to 5% with an interval crossing zero. That is a diagnostic failure rather than a pharmacological one, but the practical conclusion is the same: if you cannot reliably tell which isolates it will work on, you cannot rely on it here.',
      },
      {
        q: 'Should it be given as a slow continuous infusion?',
        a: 'This is the most interesting open question in the file, and the two best papers on it were published in the same issue of the same journal. BLING III randomised 7,031 critically ill adults with sepsis across 104 intensive care units to the same daily amount by continuous or intermittent infusion. Ninety-day mortality was 24.9% against 26.8% — an absolute difference of -1.9%, confidence interval -4.9 to 1.1, P=.08. Not significant. Clinical cure, a secondary outcome, was clearly higher with continuous infusion: 55.7% against 50.0%. A Bayesian pooled analysis of 18 trials in 9,108 patients then estimated a mortality risk ratio of 0.86, credible interval 0.72 to 0.98, rated high certainty, with a 99.1% posterior probability of benefit. Both papers are honest. They just answer slightly different questions about the same data.',
      },
      {
        q: 'What does it cover that cefepime does not?',
        a: 'Anaerobes, and that is most of the reason it is the default in abdominal infection. Piperacillin has meaningful activity against Bacteroides fragilis and the other gut anaerobes, so one bag covers the mixed flora that leaks from a perforated bowel. Cefepime does not, and is usually paired with a second agent for that reason. The two are otherwise closely matched on Gram-negative and antipseudomonal reach, and the head-to-head trial found no kidney difference and less delirium with piperacillin-tazobactam. What neither covers reliably is the extended-spectrum beta-lactamase producers, and for those the randomised evidence points to a carbapenem.',
      },
      {
        q: 'Why does this record say 1993 when the database says 2023?',
        a: 'Because the pipeline that built the underlying record picked up a generic manufacturer’s abbreviated application from 2023 rather than the drug’s original approval. Zosyn was approved in the United States on 22 October 1993 under NDA 050684, held by Wyeth. A 2023 date on a drug that has been in intensive care units for thirty years is the kind of error that looks harmless and is not: it would make a reader think the evidence base is a third of its actual age. The corrected date is used on this page and the discrepancy is recorded rather than quietly overwritten.',
        auditNote:
          'This is the kind of thing an audit layer exists to catch. Automated identity extraction is reliable for structures and prices and unreliable for approval history, because a drug accumulates dozens of applications and only one of them is the first.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Harris PNA, Tambyah PA, Lye DC, et al. Effect of piperacillin-tazobactam vs meropenem on 30-day mortality for patients with E coli or Klebsiella pneumoniae bloodstream infection and ceftriaxone resistance: the MERINO randomized clinical trial. JAMA 2018;320:984-994',
        identifier: '10.1001/jama.2018.12163',
        kind: 'doi',
      },
      {
        label:
          'Henderson A, Paterson DL, Chatfield MD, et al. Association between minimum inhibitory concentration, beta-lactamase genes and mortality for patients treated with piperacillin/tazobactam or meropenem from the MERINO study. Clin Infect Dis 2021;73:e3842-e3850',
        identifier: '10.1093/cid/ciaa1479',
        kind: 'doi',
      },
      {
        label:
          'Qian ET, Casey JD, Wright A, et al. Cefepime vs piperacillin-tazobactam in adults hospitalized with acute infection: the ACORN randomized clinical trial. JAMA 2023;330:1557-1567',
        identifier: '10.1001/jama.2023.20583',
        kind: 'doi',
      },
      {
        label:
          'Dulhunty JM, Brett SJ, De Waele JJ, et al. Continuous vs intermittent beta-lactam antibiotic infusions in critically ill patients with sepsis: the BLING III randomized clinical trial. JAMA 2024;332:629-637',
        identifier: '10.1001/jama.2024.9779',
        kind: 'doi',
      },
      {
        label:
          'Abdul-Aziz MH, Hammond NE, Brett SJ, et al. Prolonged vs intermittent infusions of beta-lactam antibiotics in adults with sepsis or septic shock: a systematic review and meta-analysis. JAMA 2024;332:638-648',
        identifier: '10.1001/jama.2024.9803',
        kind: 'doi',
      },
      {
        label: 'ACORN: cefepime against piperacillin-tazobactam in hospitalised adults',
        identifier: 'NCT05094154',
        kind: 'nct',
      },
      {
        label: 'BLING III: continuous against intermittent beta-lactam infusion in sepsis',
        identifier: 'NCT03213990',
        kind: 'nct',
      },
      {
        label:
          'Drugs@FDA: ZOSYN (piperacillin and tazobactam), NDA 050684, Wyeth — original approval 22 October 1993',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=050684',
        kind: 'regulatory',
      },
      {
        label:
          'PubChem CID 461573 — piperacillin and tazobactam mixture structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/461573',
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
  // ---------------------------------------------------------------------------------------------
  // 7. Vancomycin — sixty years in use, and the number the whole world monitors it against comes
  //    from one retrospective pharmacokinetic analysis.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'vancomycin',
    name: 'Vancomycin',
    tradeName: 'Vancocin',
    sponsor:
      'Eli Lilly (originator, isolated 1953 from Amycolatopsis orientalis); the current United States application holder on this record is ANI Pharmaceuticals, and the drug is made generically worldwide',
    targetGene:
      'None — vancomycin binds a structure, not a protein. Resistance is conferred by the bacterial vanA and vanB operons, which rebuild that structure.',
    targetProtein:
      'No enzyme target: vancomycin binds the D-alanyl-D-alanine terminus of the peptidoglycan precursor itself',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1964,
    indication:
      'Intravenously, serious or severe infections caused by susceptible strains of methicillin-resistant staphylococci, including bloodstream infection, endocarditis, bone infection, pneumonia and skin infection. Orally, Clostridioides difficile-associated diarrhoea and staphylococcal enterocolitis — a separate drug in the same molecule, because oral vancomycin is not absorbed.',
    patientFriendlyIndication:
      'Serious infections caused by MRSA and other resistant Gram-positive bacteria, and, taken by mouth, severe antibiotic-associated bowel infection',
    anatomicalSite:
      'The outer face of the bacterial cytoplasmic membrane, where peptidoglycan precursors are assembled. Taken by mouth it stays in the gut lumen and goes nowhere else.',
    conditionContext: {
      conditionExplainer:
        'MRSA is Staphylococcus aureus that has swapped its wall-building enzyme for a version no penicillin can grip. Vancomycin gets around that by ignoring the enzyme entirely and grabbing the building material instead, so it does not matter which enzyme the bacterium uses.',
      whyItMatters:
        'Vancomycin has been the backbone of MRSA treatment for four decades, and almost everything about how it is used — including the laboratory value the entire world monitors it against — was worked out after approval, retrospectively, rather than in the trials that approved it.',
      whoTakesThis:
        'Hospitalised adults and children with serious Gram-positive infection, especially MRSA bloodstream infection and endocarditis. Taken by mouth, patients with Clostridioides difficile infection.',
      clinicalGoals:
        'Clearance of bacteria from blood and survival for the intravenous indication; resolution of diarrhoea without recurrence for the oral one.',
    },
    oneSentenceVerdict:
      'A glycopeptide that binds the bacterial wall’s building block rather than the enzyme that assembles it, so resistance requires rebuilding the block itself — in the head-to-head MRSA pneumonia trial it achieved clinical success in 46.6% of per-protocol patients against linezolid’s 57.6% (P=.042) with nephrotoxicity in 18.2% against 8.4%, and the exposure target the entire world monitors it against comes from a retrospective pharmacokinetic analysis rather than a randomised trial.',
    laymanHowItWorks:
      'Most antibiotics of this kind jam the tool a bacterium uses to build its wall. Vancomycin does something different: it clamps onto the bricks themselves, so the tool has nothing it can pick up. That is why it still works against bacteria that have swapped their tool for one penicillins cannot grip. The molecule is far too big to be absorbed from the gut, so swallowing it treats only the bowel and injecting it treats everywhere else.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 74,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$2.31 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 35 listed generic products, survey effective 17 December 2025)',
      markupEstimate: '',
      openPatentNotes:
        'Isolated in 1953 from a soil actinomycete collected in Borneo and approved in the United States in the following decade. It is a fermentation product, not a synthetic one, and remains on the WHO Model List of Essential Medicines. The intravenous product is inexpensive; the oral capsules, treating a different disease with the same molecule, have historically been priced very differently, which is one of the clearest illustrations in medicine that price tracks market position rather than manufacturing cost.',
      synthesisComplexity: 'High',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Vancomycin has three fairly distinct jobs and a different competitor for each. In MRSA pneumonia linezolid beat it on clinical success. In MRSA bloodstream infection daptomycin matched it with less kidney injury. In Clostridioides difficile fidaxomicin matched it on cure and halved recurrence. It survives as the default not because it wins these comparisons but because it is cheap, familiar and has sixty years of accumulated experience behind it. Nothing sold as a food or supplement treats MRSA.',
      conventionalRx: [
        {
          name: 'Linezolid',
          class: 'Oxazolidinone — a ribosome inhibitor',
          howItCompares:
            'In the ZEPHyR trial of MRSA nosocomial pneumonia, clinical success in the per-protocol population at end of study was 57.6% with linezolid against 46.6% with dose-optimised vancomycin (95% CI for the difference 0.5% to 21.6%, P=.042). Sixty-day mortality was the same, 15.7% against 17.0%. Nephrotoxicity was 8.4% against 18.2%.',
          typicalCost:
            'US$1.38 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 17 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: better lung penetration, oral and intravenous forms are interchangeable, no kidney monitoring. Cons: reversible myelosuppression after two weeks, serotonin syndrome with serotonergic drugs, optic and peripheral neuropathy with prolonged use.',
        },
        {
          name: 'Daptomycin',
          class: 'Cyclic lipopeptide',
          howItCompares:
            'In the randomised trial of Staphylococcus aureus bacteraemia and endocarditis, success was 44.2% with daptomycin against 41.7% with standard therapy — an antistaphylococcal penicillin or vancomycin plus initial low-dose gentamicin. Clinically significant renal dysfunction was 11.0% against 26.3% (P=.004). It is inactivated by lung surfactant and cannot be used for pneumonia.',
          typicalCost:
            'US$21.85 per vial at United States pharmacy acquisition cost (CMS NADAC, median across 41 listed generic products, survey effective 20 May 2026)',
          prosAndCons:
            'Pros: far less renal dysfunction, once daily, no monitoring of drug levels. Cons: useless in pneumonia; creatine kinase elevation and rare rhabdomyolysis; emergent non-susceptibility appeared in 6 of 19 microbiological failures in the trial.',
        },
        {
          name: 'Fidaxomicin (for the oral indication only)',
          class: 'Macrocyclic RNA polymerase inhibitor, minimally absorbed',
          howItCompares:
            'For Clostridioides difficile infection it matched oral vancomycin on clinical cure — 88.2% against 85.8% by modified intention to treat — and halved recurrence, 15.4% against 25.3% (P=0.005). It has a narrower spectrum and disturbs the surrounding gut flora less, which is the likely reason.',
          typicalCost:
            'US$95.02 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 4 listed products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: same cure, roughly ten percentage points fewer recurrences. Cons: many times the price per course; the recurrence advantage was seen with non-NAP1 strains rather than uniformly.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Ask for the infusion to be slowed if flushing starts',
          action:
            'Report flushing of the face and upper body, itching, or chest and back muscle pain during an infusion.',
          patientImpact:
            'This is an infusion-rate reaction caused by direct histamine release, not an allergy, and it is the reason vancomycin is given slowly. The label records that in studies of normal volunteers, infusion-related events did not occur at slower rates, and that stopping the infusion usually stops the reaction promptly.',
          clinicalPrecaution:
            'Rapid bolus administration has caused exaggerated hypotension, shock and rarely cardiac arrest. Mistaking this reaction for a penicillin-style allergy leads to patients being labelled vancomycin-allergic for life, which removes an option they may badly need later.',
        },
        {
          name: 'Ask what the drug level is being used for',
          action:
            'If blood levels are being taken, it is reasonable to ask what target they are aimed at and where that target came from.',
          patientImpact:
            'Vancomycin is one of very few antibiotics whose blood concentration is routinely measured. The exposure target underlying that practice was derived from a retrospective pharmacokinetic analysis of Staphylococcus aureus lower respiratory tract infections, not from a randomised trial, and the monitoring approach was formally revised in 2020.',
          clinicalPrecaution:
            'How a patient is monitored is a decision for the treating team and depends on kidney function, the infection and local practice. This page describes where the target came from and does not recommend one.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'C[C@H]1[C@H]([C@@](C[C@@H](O1)O[C@@H]2[C@H]([C@@H]([C@H](O[C@H]2OC3=C4C=C5C=C3OC6=C(C=C(C=C6)[C@H]([C@H](C(=O)N[C@H](C(=O)N[C@H]5C(=O)N[C@@H]7C8=CC(=C(C=C8)O)C9=C(C=C(C=C9O)O)[C@H](NC(=O)[C@H]([C@@H](C1=CC(=C(O4)C=C1)Cl)O)NC7=O)C(=O)O)CC(=O)N)NC(=O)[C@@H](CC(C)C)NC)O)Cl)CO)O)O)(C)N)O',
      chemicalFormula: 'C66H75Cl2N9O24',
      molecularWeight: '1449.20 g/mol',
      targetReceptorAffinity:
        'Vancomycin has no enzyme target. Its rigid cup-shaped heptapeptide aglycone forms five hydrogen bonds with the D-alanyl-D-alanine terminus of the lipid II peptidoglycan precursor, sequestering the substrate so that transglycosylation and transpeptidation cannot proceed. Because the target is a substrate rather than a protein, resistance requires remodelling the substrate: the vanA and vanB operons substitute D-alanyl-D-lactate, which loses one hydrogen bond and reduces affinity roughly a thousandfold. At 1,449 daltons the molecule is far too large to cross the Gram-negative outer membrane, which is why its spectrum is Gram-positive only, and far too large to be absorbed from the gut, which is why oral and intravenous vancomycin are effectively two different drugs.',
      structureSource: {
        label: 'PubChem CID 14969 (vancomycin) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/14969',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'van-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Aglycone integrity and CDP-1 degradant quantification',
          description:
            'Confirm the intact heptapeptide cup and quantify crystalline degradation product 1, the rearranged form that arises when the asparagine residue deamidates. CDP-1 is far less active and accumulates in stored or improperly handled material, so this assay is a potency specification rather than a purity nicety.',
          reagentsAndBuffer:
            'Vancomycin hydrochloride reference standard, gradient reversed-phase HPLC with ultraviolet detection at 280 nm, mass spectrometric confirmation, Karl Fischer titration',
        },
        {
          id: 'van-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Fermentation from Amycolatopsis orientalis',
          description:
            'Vancomycin is not synthesised. It is a fermentation product of a soil actinomycete originally isolated from a Borneo soil sample in 1953, and total chemical synthesis of the molecule, achieved in the 1990s, remains a landmark of organic chemistry rather than a manufacturing route. Everything about the cost structure of this drug follows from that.',
          dependsOnStepId: 'van-w1',
          reagentsAndBuffer:
            'Amycolatopsis orientalis production strain, complex nitrogen and glucose feed medium, controlled dissolved oxygen and pH, antifoam, submerged aerobic fermentation',
        },
        {
          id: 'van-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Ion-exchange capture and removal of the early "Mississippi mud" impurities',
          description:
            'Capture the product on ion-exchange resin and polish it. Early preparations were brown and impure enough to be nicknamed Mississippi mud, and much of the drug’s reputation for kidney and ear toxicity was formed against material that would not pass a modern specification. Separating what the impurities did from what the molecule does is a live question in interpreting the older literature.',
          dependsOnStepId: 'van-w2',
          reagentsAndBuffer:
            'Cation-exchange resin, aqueous ammonia elution, activated carbon polishing, reversed-phase preparative chromatography, spray drying or lyophilisation',
        },
        {
          id: 'van-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Cell-wall access in Gram-positive organisms and an outer-membrane exclusion control',
          description:
            'Confirm that the molecule reaches lipid II at the outer face of the cytoplasmic membrane in a Gram-positive organism, and confirm it does not reach anything in a Gram-negative one. The negative control is the informative half: at 1,449 daltons vancomycin is excluded by the Gram-negative outer membrane, and that single physical fact defines the entire clinical spectrum.',
          dependsOnStepId: 'van-w3',
          reagentsAndBuffer:
            'Staphylococcus aureus and Enterococcus faecium reference strains, Escherichia coli as exclusion control, fluorescently labelled vancomycin (BODIPY-vancomycin) for membrane localisation, confocal microscopy, Mueller-Hinton broth',
        },
        {
          id: 'van-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'D-Ala-D-Ala binding affinity against a D-Ala-D-Lac vanA counter-screen',
          description:
            'Measure binding to a synthetic D-alanyl-D-alanine peptide and repeat against the D-alanyl-D-lactate depsipeptide that vanA-carrying organisms make instead. The loss of a single hydrogen bond between those two ligands is worth roughly a thousandfold in affinity, and that number is the entire molecular explanation of vancomycin-resistant enterococci.',
          dependsOnStepId: 'van-w4',
          reagentsAndBuffer:
            'Synthetic N-acetyl-D-Ala-D-Ala and N-acetyl-D-Ala-D-Lac ligands, isothermal titration calorimetry or ultraviolet difference spectroscopy, vanA-positive Enterococcus faecium clinical isolate, broth microdilution panels',
        },
      ],
    },
    keyAudits: [
      {
        id: 'van-a1',
        category: 'failed',
        title: 'ZEPHyR: 46.6% clinical success against linezolid’s 57.6% in MRSA pneumonia',
        laymanSummary:
          'In the only large head-to-head trial of vancomycin against linezolid in hospital-acquired MRSA pneumonia, with vancomycin doses adjusted by blood levels, fewer than half the vancomycin patients were counted as successes. More than twice as many had kidney injury. The same proportion of each group was alive at sixty days.',
        technicalDetails:
          'ZEPHyR was a prospective, double-blind, controlled, multicentre trial in hospitalised adults with hospital-acquired or healthcare-associated MRSA pneumonia. Of 1,184 patients treated, 448 entered the modified intention-to-treat population and 348 the per-protocol population. Clinical success at end of study in the per-protocol population was 95 of 165 (57.6%) with linezolid against 81 of 174 (46.6%) with vancomycin — 95% confidence interval for the difference 0.5% to 21.6%, P=.042. All-cause 60-day mortality was similar at 15.7% and 17.0%, and overall adverse event rates were similar. Nephrotoxicity was more frequent with vancomycin, 18.2% against 8.4%. Vancomycin dosing was adjusted on trough levels, so this is not a comparison against under-dosed vancomycin.',
        evidenceSource: 'Wunderink RG et al., Clin Infect Dis 2012;54:621-629 (ZEPHyR)',
        doi: '10.1093/cid/cir895',
        measuredMetric:
          'Clinical outcome at end of study in the per-protocol population, and nephrotoxicity incidence',
        auditFlag: 'verified',
      },
      {
        id: 'van-a2',
        category: 'inferred',
        title: 'The exposure target the world monitors it against is retrospective',
        laymanSummary:
          'Vancomycin is one of the very few antibiotics whose blood level is routinely measured, and the number those levels are aimed at was worked out by looking back at what happened to patients who happened to receive different amounts. No trial randomised anyone to different targets and counted the outcomes.',
        technicalDetails:
          'The pharmacodynamic index used for vancomycin is the ratio of the 24-hour area under the concentration-time curve to the minimum inhibitory concentration, and the threshold value in general use derives from Moise-Broder and colleagues’ retrospective pharmacokinetic and pharmacodynamic analysis of patients with Staphylococcus aureus lower respiratory tract infections. That is an observational exposure-response analysis in a single infection type, generalised since to bloodstream infection, endocarditis, bone infection and skin infection, none of which it studied. The 2020 revised consensus guideline from the Infectious Diseases Society of America, the Society of Infectious Diseases Pharmacists, the American Society of Health-System Pharmacists and the Pediatric Infectious Diseases Society is built on this index, and it states its own evidence base rather than concealing it. No randomised trial has compared clinical outcomes between exposure targets.',
        evidenceSource:
          'Moise-Broder PA et al., Clin Pharmacokinet 2004;43:925-942; Rybak MJ et al., Clin Infect Dis 2020;71:1361-1364 (revised consensus guideline)',
        doi: '10.2165/00003088-200443130-00005',
        inferredClaim:
          'That achieving a specific area-under-the-curve to minimum-inhibitory-concentration ratio improves clinical outcome across the range of infections vancomycin treats — extrapolated from one retrospective respiratory-infection cohort and never tested by randomising patients to different targets',
        auditFlag: 'contested',
      },
      {
        id: 'van-a3',
        category: 'conclusion_shift',
        title: 'Monitoring moved from a single trough value to total exposure in 2020',
        laymanSummary:
          'For years vancomycin was monitored by one blood level taken just before the next dose, because it was easy. In 2020 the guideline moved to estimating total drug exposure instead. The evidence for the change is a set of observational comparisons rated low-certainty, not a trial.',
        technicalDetails:
          'The 2020 revised consensus guideline replaced trough-only monitoring with area-under-the-curve-guided monitoring for serious MRSA infection. A systematic review and meta-analysis of 10 studies in 4,231 patients found area-under-the-curve-guided strategies associated with significantly less vancomycin-induced acute kidney injury than trough-guided strategies: odds ratio 0.625 (95% CI 0.469 to 0.834, p=0.001, I2 25.5%), and 0.475 (95% CI 0.261 to 0.863, p=0.015) in the three studies reporting adjusted odds ratios. Stratified by definition, the association reached significance using the guideline definition of acute kidney injury (OR 0.552, 95% CI 0.341 to 0.894, p=0.016) and not using the alternatives. The authors graded the overall certainty as low and named confounding bias and inconsistent injury definitions as the limitations. The change was made on this evidence, which is better than what preceded it and is not a randomised comparison.',
        evidenceSource:
          'Oda K et al. and successors, Pharmacotherapy 2022;42:741-753; Rybak MJ et al., Clin Infect Dis 2020;71:1361-1364',
        doi: '10.1002/phar.2722',
        inferredClaim:
          'That trough-guided monitoring was causing avoidable kidney injury and exposure-guided monitoring prevents it — supported by pooled observational comparison at low certainty, and adopted worldwide on that basis',
        auditFlag: 'caution',
      },
      {
        id: 'van-a4',
        category: 'measured',
        title: 'Renal dysfunction in 26.3% of the standard-therapy arm against 11.0% on daptomycin',
        laymanSummary:
          'In the randomised trial of bloodstream infection and heart-valve infection caused by Staphylococcus aureus, roughly a quarter of the patients on the older regimen — which was vancomycin or an antistaphylococcal penicillin, plus gentamicin — developed clinically significant kidney problems. On the newer drug it was about one in nine.',
        technicalDetails:
          'The trial randomised 124 patients with Staphylococcus aureus bacteraemia with or without endocarditis to daptomycin and 122 to initial low-dose gentamicin plus either an antistaphylococcal penicillin or vancomycin. Success at 42 days after end of therapy in the modified intention-to-treat analysis was 53 of 120 (44.2%) against 48 of 115 (41.7%) — absolute difference 2.4%, 95% CI -10.2 to 15.1, meeting the pre-specified non-inferiority criteria. Clinically significant renal dysfunction occurred in 11.0% on daptomycin against 26.3% on standard therapy, P=.004. The comparator arm mixes vancomycin with beta-lactams and adds gentamicin, so the renal figure is not attributable to vancomycin alone — but gentamicin was low-dose and brief, and the direction is consistent with ZEPHyR’s 18.2% against 8.4%.',
        evidenceSource: 'Fowler VG Jr et al., N Engl J Med 2006;355:653-665 (NCT00093067)',
        doi: '10.1056/NEJMoa053783',
        measuredMetric:
          'Clinically significant renal dysfunction and 42-day treatment success in randomised Staphylococcus aureus bacteraemia',
        auditFlag: 'caution',
      },
      {
        id: 'van-a5',
        category: 'failed',
        title: 'For bowel infection it cures as well as fidaxomicin and relapses far more often',
        laymanSummary:
          'Swallowed vancomycin treats a completely different disease from injected vancomycin, because none of it is absorbed. In the head-to-head trial for that disease it cured just as many people as the newer drug and then had them come back with it roughly ten percentage points more often.',
        technicalDetails:
          'A phase 3 trial randomised 629 adults with acute Clostridioides difficile infection and a positive stool toxin test to oral fidaxomicin or oral vancomycin for 10 days, with 548 evaluable per protocol. Clinical cure with fidaxomicin was non-inferior in both the modified intention-to-treat analysis (88.2% against 85.8%) and the per-protocol analysis (92.1% against 89.8%). Recurrence within four weeks was significantly lower with fidaxomicin in both: 15.4% against 25.3% (P=0.005) and 13.3% against 24.0% (P=0.004). The recurrence advantage was seen in patients with non-NAP1 strains rather than uniformly. Adverse event profiles were similar. The likely explanation is spectrum: vancomycin suppresses the surrounding colonic flora that would otherwise resist recolonisation, and fidaxomicin disturbs it less.',
        evidenceSource: 'Louie TJ et al., N Engl J Med 2011;364:422-431',
        doi: '10.1056/NEJMoa0910812',
        measuredMetric:
          'Clinical cure and 4-week recurrence of Clostridioides difficile infection, oral vancomycin against fidaxomicin',
        auditFlag: 'verified',
      },
      {
        id: 'van-a6',
        category: 'measured',
        title: 'Resistance requires rebuilding the target, which is why it took so long',
        laymanSummary:
          'Vancomycin does not attack an enzyme, it grabs the building material. A bacterium cannot escape by tweaking a protein — it has to manufacture a different brick. That is a much bigger genetic undertaking, and it is why sixty years of heavy use has produced widespread resistance in enterococci and almost none in Staphylococcus aureus.',
        technicalDetails:
          'The vanA and vanB operons encode a set of enzymes that replace the D-alanyl-D-alanine terminus of the peptidoglycan precursor with D-alanyl-D-lactate. That single substitution removes one of the five hydrogen bonds vancomycin makes with its ligand and reduces binding affinity by roughly three orders of magnitude. Acquiring it requires horizontal transfer of a multi-gene operon plus the regulatory machinery to switch it on, not a point mutation — which is the structural reason vancomycin-resistant enterococci are common while fully vancomycin-resistant Staphylococcus aureus remains vanishingly rare despite decades of exposure.',
        evidenceSource:
          'Vancomycin Hydrochloride for Injection United States prescribing information, Microbiology; mechanism as characterised in the glycopeptide resistance literature',
        measuredMetric:
          'Fold change in binding affinity between the D-Ala-D-Ala and D-Ala-D-Lac ligands',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Two completely different drugs in one molecule',
        laymanDesc:
          'Injected, it treats infections anywhere in the body. Swallowed, it treats only the bowel, because the molecule is far too big to be absorbed. The same powder is two medicines depending on the route.',
        molecularDetail:
          'At 1,449 daltons vancomycin has negligible oral bioavailability. Oral capsules deliver high luminal colonic concentrations with essentially no systemic exposure, which is why they treat Clostridioides difficile infection and nothing else, and why the intravenous form does not treat it.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It cannot get into Gram-negative bacteria at all',
        laymanDesc:
          'Some bacteria have an extra outer skin with small pores. Vancomycin is simply too large to fit through them, so it never reaches its target in those organisms. That is a physical limit, not a resistance mechanism.',
        molecularDetail:
          'Exclusion by the Gram-negative outer membrane is a size limitation, which is why the spectrum is Gram-positive only and why no Gram-negative organism has ever needed to evolve resistance to it.',
        iconName: 'Ban',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It clamps onto the brick, not the bricklayer',
        laymanDesc:
          'Penicillins jam the tool that lays the bricks. Vancomycin grips the end of the brick itself, so no tool can pick it up. It does not matter which tool the bacterium has.',
        molecularDetail:
          'The rigid cup of the heptapeptide aglycone forms five hydrogen bonds with the D-alanyl-D-alanine terminus of lipid II, the membrane-anchored peptidoglycan precursor. Sequestering the substrate blocks both transglycosylation and transpeptidation. Because MRSA’s resistance mechanism is an altered transpeptidase, and vancomycin does not touch transpeptidases, MRSA is fully susceptible.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Wall assembly stops',
        laymanDesc:
          'With the building material locked up, the wall cannot be extended or repaired, and the growing bacterium fails.',
        molecularDetail:
          'Killing is slow relative to beta-lactams, time-dependent, and requires active growth. The comparatively slow bactericidal action is one proposed explanation for its underperformance against beta-lactams in methicillin-susceptible infection.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Escaping it means building a different brick',
        laymanDesc:
          'A bacterium cannot dodge vancomycin by changing a protein. It has to manufacture a different building block, which takes a whole set of borrowed genes. That is why resistance is common in enterococci and almost unheard of in Staphylococcus aureus.',
        molecularDetail:
          'The vanA and vanB operons substitute D-alanyl-D-lactate for D-alanyl-D-alanine, losing one hydrogen bond and roughly a thousandfold of affinity. Acquisition requires horizontal transfer of a multi-gene operon with its regulatory system, not a point mutation.',
        iconName: 'Dna',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What it costs the kidneys and the ears',
        laymanDesc:
          'Vancomycin can damage the kidneys, and rarely hearing, and the risk rises with how much drug the body is exposed to. That is why it is one of the few antibiotics whose blood level is measured routinely.',
        molecularDetail:
          'The label states that systemic exposure may result in acute kidney injury and that risk increases as systemic exposure and serum levels increase; interstitial nephritis is also reported. Ototoxicity, transient or permanent, has occurred mostly with excessive exposure, pre-existing hearing loss or concomitant ototoxic agents. Nephrotoxicity was 18.2% against linezolid’s 8.4% in ZEPHyR. Infusion-rate reactions are separate and are direct histamine release rather than allergy.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'ZEPHyR (Wunderink 2012)',
        phase: 'Phase 4, prospective, double-blind, controlled, multicentre',
        sampleSize: 1184,
        primaryEndpoint:
          'Clinical outcome at end of study in evaluable per-protocol patients with MRSA nosocomial pneumonia',
        endpointMet: false,
        statisticalPValue:
          'Vancomycin 46.6% (81 of 174) against linezolid 57.6% (95 of 165); 95% CI for the difference 0.5% to 21.6%, P=.042 in favour of linezolid',
        unreportedAdverseSignals:
          '1,184 patients were treated but only 448 entered the modified intention-to-treat and 348 the per-protocol population, so the primary result rests on under a third of those exposed. Sixty-day mortality was identical between arms, which is the outcome most readers care about and the one the trial did not separate.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Fowler 2006 Staphylococcus aureus bacteraemia trial (NCT00093067)',
        phase: 'Phase 3, randomised, open-label, non-inferiority',
        sampleSize: 246,
        primaryEndpoint: 'Treatment success 42 days after the end of therapy',
        endpointMet: true,
        statisticalPValue:
          'Standard therapy 41.7% (48 of 115) against daptomycin 44.2% (53 of 120); absolute difference 2.4%, 95% CI -10.2 to 15.1, non-inferiority met',
        unreportedAdverseSignals:
          'The comparator arm mixed vancomycin with antistaphylococcal penicillins and added initial low-dose gentamicin, so its 26.3% renal dysfunction rate cannot be attributed to vancomycin alone. Success rates in both arms were below 45%, which is the more striking number and is rarely quoted.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Louie 2011 fidaxomicin against oral vancomycin',
        phase: 'Phase 3, randomised, double-blind, non-inferiority',
        sampleSize: 629,
        primaryEndpoint: 'Clinical cure of Clostridioides difficile infection',
        endpointMet: true,
        statisticalPValue:
          'Vancomycin 85.8% against fidaxomicin 88.2% by modified intention to treat, non-inferiority met; recurrence 25.3% against 15.4%, P=0.005',
        unreportedAdverseSignals:
          'The primary endpoint was cure, on which the drugs matched. The recurrence difference, a secondary endpoint, is what changed practice, and it was concentrated in patients with non-NAP1 strains rather than distributed evenly.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Clinical success 46.6% against linezolid’s 57.6% in per-protocol MRSA nosocomial pneumonia, P=.042',
        'Nephrotoxicity 18.2% against linezolid’s 8.4% in the same trial, with vancomycin dosing adjusted on trough levels',
        'Clinically significant renal dysfunction 26.3% in the vancomycin-containing standard-therapy arm against 11.0% on daptomycin, P=.004',
        'Clostridioides difficile recurrence 25.3% against fidaxomicin’s 15.4% (P=0.005) with equivalent cure rates',
        'A roughly thousandfold loss of binding affinity between the D-Ala-D-Ala and D-Ala-D-Lac ligands',
      ],
      unsupportedInferences: [
        'That achieving a specific exposure-to-MIC ratio improves outcomes across all the infections vancomycin treats — derived retrospectively from one respiratory cohort and never randomised',
        'That exposure-guided monitoring prevents kidney injury, supported by pooled observational data the reviewers themselves graded low certainty',
        'That the 26.3% renal dysfunction rate in the bacteraemia trial is attributable to vancomycin, when the arm also contained beta-lactams and gentamicin',
        'That sixty years of safe use implies the drug is well characterised; most of what is known about how to use it was worked out after approval, without trials',
      ],
      whatFailedInitially: [
        'It lost the only large head-to-head trial in MRSA nosocomial pneumonia on clinical success, though not on mortality',
        'It relapses roughly ten percentage points more often than fidaxomicin in Clostridioides difficile infection despite matching it on cure',
        'Success in Staphylococcus aureus bacteraemia was under 45% in both arms of the randomised trial — the disease remains poorly treated by any agent',
        'Early preparations were impure enough to be nicknamed Mississippi mud, and much of the drug’s toxicity reputation was formed against material no modern specification would pass',
      ],
      realWorldOutcome: [
        'Isolated in 1953 from Borneo soil, approved in the United States in the following decade, and still the default for serious MRSA infection',
        'On the WHO Model List of Essential Medicines at about US$2.31 per intravenous unit',
        'Monitoring practice was formally revised in 2020, from a single trough value to estimated total exposure',
        'Sixty years of heavy use has produced widespread resistance in enterococci and almost none in Staphylococcus aureus, because the target is a substrate rather than a protein',
      ],
    },
    deliverySystem: {
      type: 'Intravenous infusion for systemic infection; oral capsules and solution for Clostridioides difficile infection, which are not absorbed',
      description:
        'The two routes are effectively two drugs. Intravenous vancomycin does not reach useful concentrations in the colonic lumen and does not treat Clostridioides difficile infection; oral vancomycin achieves high luminal concentrations with essentially no systemic exposure and treats nothing outside the gut. Intravenous administration must be given slowly diluted, over not less than 60 minutes, because rapid infusion causes direct histamine release.',
      safetyProfile:
        'Rapid bolus administration may cause exaggerated hypotension including shock and rarely cardiac arrest; the characteristic flushing of the upper body is an infusion-rate reaction rather than an allergy, and mislabelling it as one costs patients an option they may need. Systemic exposure may cause acute kidney injury, with risk rising as exposure rises; interstitial nephritis is also reported. Ototoxicity, transient or permanent, has occurred mostly with excessive exposure, pre-existing hearing loss or concomitant ototoxic drugs. Severe dermatologic reactions including toxic epidermal necrolysis, Stevens-Johnson syndrome, DRESS, acute generalised exanthematous pustulosis and linear IgA bullous dermatosis have been reported. Reversible neutropenia has been reported, usually a week or more into therapy.',
    },
    commonQuestions: [
      {
        q: 'Why do they keep taking blood samples while I am on it?',
        a: 'Because vancomycin is one of a small number of antibiotics where the amount in the blood is measured rather than assumed, and because kidney injury risk rises as exposure rises. What is worth knowing is where the target came from. The exposure threshold in use worldwide derives from a retrospective pharmacokinetic analysis of patients with Staphylococcus aureus lower respiratory tract infections — an observational exposure-response study in one infection type, later generalised to bloodstream infection, endocarditis and bone infection, none of which it examined. No trial has randomised patients to different targets and compared what happened to them. That does not make the monitoring pointless; it makes the precision of the number less than it appears.',
        auditNote:
          'Guidelines built on retrospective exposure-response data are not unusual in antibiotics. What is unusual here is how precisely the number is quoted and how little of it was ever tested prospectively.',
      },
      {
        q: 'Is it still the best drug for MRSA?',
        a: 'It is the default, which is not the same thing. In the only large head-to-head trial in MRSA hospital-acquired pneumonia, clinical success was 46.6% with dose-optimised vancomycin against 57.6% with linezolid, and nephrotoxicity was 18.2% against 8.4%. Sixty-day mortality was the same in both arms. In MRSA bloodstream infection, daptomycin matched the vancomycin-containing standard regimen with less than half the renal dysfunction. Vancomycin holds its position because it is cheap, because sixty years of experience means everyone knows how it behaves, and because the alternatives each have a hole in them — linezolid suppresses the bone marrow after a couple of weeks, and daptomycin is inactivated in the lung.',
      },
      {
        q: 'I got flushed and itchy during the drip. Am I allergic?',
        a: 'Probably not, and this matters because being labelled vancomycin-allergic removes an option you may need badly one day. The characteristic reaction — flushing of the face and upper body, itching, sometimes chest or back muscle pain — is caused by vancomycin directly triggering histamine release from mast cells, not by an immune response to the drug. It is a rate phenomenon: the label records that in studies of normal volunteers, infusion-related events did not occur at slower infusion rates, and that stopping the infusion usually stops the reaction promptly. A genuine immune-mediated allergy to vancomycin exists but is much rarer.',
      },
      {
        q: 'Why has resistance taken so long to appear?',
        a: 'Because vancomycin does not attack a protein. Almost every antibiotic binds an enzyme, and an enzyme can be altered by a single mutation. Vancomycin grips the building block itself — the D-alanyl-D-alanine tail on the wall precursor — so a bacterium can only escape by manufacturing a different building block. That means acquiring a whole operon of genes and the regulatory machinery to control them, usually by horizontal transfer from another organism. Enterococci have done it, through the vanA and vanB operons, and vancomycin-resistant enterococci are now common. Staphylococcus aureus has almost never managed it: fully vancomycin-resistant S. aureus remains vanishingly rare after four decades of intense selection pressure.',
      },
      {
        q: 'Why do the capsules and the drip treat different diseases?',
        a: 'Because the molecule weighs almost 1,450 daltons, which is enormous for a drug, and essentially none of it crosses the gut wall. Swallowed vancomycin travels the length of the intestine and arrives in the colon at very high concentration with almost nothing in the bloodstream, so it treats Clostridioides difficile infection and nothing else. Injected vancomycin reaches the whole body but not the colonic lumen, so it does not treat C. difficile at all. It is the same compound doing two unrelated jobs, and confusing the routes is a genuine clinical error rather than a technicality.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Wunderink RG, Niederman MS, Kollef MH, et al. Linezolid in methicillin-resistant Staphylococcus aureus nosocomial pneumonia: a randomized, controlled study. Clin Infect Dis 2012;54:621-629',
        identifier: '10.1093/cid/cir895',
        kind: 'doi',
      },
      {
        label:
          'Fowler VG Jr, Boucher HW, Corey GR, et al. Daptomycin versus standard therapy for bacteremia and endocarditis caused by Staphylococcus aureus. N Engl J Med 2006;355:653-665',
        identifier: '10.1056/NEJMoa053783',
        kind: 'doi',
      },
      {
        label:
          'Louie TJ, Miller MA, Mullane KM, et al. Fidaxomicin versus vancomycin for Clostridium difficile infection. N Engl J Med 2011;364:422-431',
        identifier: '10.1056/NEJMoa0910812',
        kind: 'doi',
      },
      {
        label:
          'Moise-Broder PA, Forrest A, Birmingham MC, Schentag JJ. Pharmacodynamics of vancomycin and other antimicrobials in patients with Staphylococcus aureus lower respiratory tract infections. Clin Pharmacokinet 2004;43:925-942',
        identifier: '10.2165/00003088-200443130-00005',
        kind: 'doi',
      },
      {
        label:
          'Rybak MJ, Le J, Lodise TP, et al. Therapeutic monitoring of vancomycin for serious methicillin-resistant Staphylococcus aureus infections: a revised consensus guideline and review. Clin Infect Dis 2020;71:1361-1364',
        identifier: '10.1093/cid/ciaa303',
        kind: 'doi',
      },
      {
        label:
          'Vancomycin area under the curve versus trough only guided dosing and the risk of acute kidney injury: systematic review and meta-analysis. Pharmacotherapy 2022;42:741-753',
        identifier: '10.1002/phar.2722',
        kind: 'doi',
      },
      {
        label: 'Daptomycin against standard therapy in Staphylococcus aureus bacteraemia',
        identifier: 'NCT00093067',
        kind: 'nct',
      },
      {
        label: 'PubChem CID 14969 — vancomycin structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/14969',
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
  // ---------------------------------------------------------------------------------------------
  // 8. Linezolid — the first genuinely new antibacterial class in thirty-five years, which beat
  //    vancomycin on cure without changing who died, and became a tuberculosis drug instead.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'linezolid',
    name: 'Linezolid',
    tradeName: 'Zyvox',
    sponsor:
      'Pharmacia & Upjohn (originator; the oxazolidinone scaffold came from a DuPont monoamine oxidase inhibitor programme), now Pfizer on NDA 021130, 021131 and 021132',
    targetGene:
      'Bacterial 23S ribosomal RNA genes (rrl) and the ribosomal protein gene rplC — resistance arises from mutations there or from the transferable cfr methyltransferase',
    targetProtein: 'The bacterial 50S ribosomal subunit, at the peptidyl transferase centre A site',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2000,
    indication:
      'Nosocomial pneumonia, community-acquired pneumonia, complicated and uncomplicated skin and skin structure infections, and vancomycin-resistant Enterococcus faecium infections, caused by susceptible Gram-positive bacteria. It is not approved for catheter-related bloodstream infection and has no activity against Gram-negative organisms.',
    patientFriendlyIndication:
      'Serious infections caused by resistant Gram-positive bacteria, including MRSA and vancomycin-resistant enterococci',
    anatomicalSite:
      'The bacterial ribosome. Its harms come from the human mitochondrial ribosome, which is close enough in structure to be affected too.',
    conditionContext: {
      conditionExplainer:
        'Linezolid stops bacteria from making proteins, by blocking the very first step rather than the assembly line further along. It was the first antibiotic of a genuinely new class to reach the market since the 1960s.',
      whyItMatters:
        'It is one of very few options against MRSA and vancomycin-resistant enterococci that works by mouth as well as by drip. It has also become one of the three drugs in the regimen that made extensively drug-resistant tuberculosis curable, which is not what it was licensed for.',
      whoTakesThis:
        'Adults and children with serious Gram-positive infection, and — outside its licensed indications — patients with highly drug-resistant tuberculosis.',
      clinicalGoals:
        'Clinical cure. For tuberculosis, a favourable outcome six months after the end of treatment, meaning no relapse.',
    },
    oneSentenceVerdict:
      'The first new antibacterial class in thirty-five years, blocking assembly of the bacterial ribosome before protein synthesis can begin — it achieved clinical success in 57.6% of per-protocol MRSA pneumonia patients against vancomycin’s 46.6% (P=.042) without changing 60-day mortality, and in the Nix-TB study 90% of 109 patients with highly drug-resistant tuberculosis had a favourable outcome while 81% developed peripheral neuropathy and 48% myelosuppression.',
    laymanHowItWorks:
      'Bacteria build proteins on a two-part machine. Linezolid wedges itself into the larger part at the point where the first amino acid is loaded, so the machine can never start. Nothing else in medicine works at that step, which is why bacteria resistant to everything else are often still susceptible. Human cells have their own version of that machine inside their mitochondria, and it is similar enough that long courses damage nerves, eyes and bone marrow.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 82,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$1.38 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 17 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States on 18 April 2000 under NDA 021130, 021131 and 021132. It launched as an expensive branded hospital drug and is now generic at about US$1.38 a unit — the price collapse is why it became usable for months-long tuberculosis regimens in high-burden countries, which is a case of a patent expiry changing what a drug is for rather than merely what it costs.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Against MRSA the comparison is with vancomycin and daptomycin, and each wins somewhere: linezolid on clinical success in pneumonia, daptomycin on kidneys in bloodstream infection, vancomycin on price and familiarity. The distinguishing property is that linezolid is the only one of the three that works by mouth, which is what makes months-long treatment possible at all. Nothing sold as a food or supplement treats MRSA or tuberculosis.',
      conventionalRx: [
        {
          name: 'Vancomycin',
          class: 'Glycopeptide',
          howItCompares:
            'In the ZEPHyR trial of MRSA nosocomial pneumonia, dose-optimised vancomycin achieved clinical success in 46.6% of per-protocol patients against linezolid’s 57.6% (P=.042), with nephrotoxicity of 18.2% against 8.4%. Sixty-day mortality was the same. It is intravenous only, and cheap.',
          typicalCost:
            'US$2.31 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 35 listed generic products, survey effective 17 December 2025)',
          prosAndCons:
            'Pros: sixty years of experience, no marrow suppression, no serotonin interaction. Cons: intravenous only, more nephrotoxicity, requires blood-level monitoring, poorer lung penetration.',
        },
        {
          name: 'Daptomycin',
          class: 'Cyclic lipopeptide',
          howItCompares:
            'Matches vancomycin in Staphylococcus aureus bacteraemia with far less renal dysfunction and requires no marrow monitoring. It is inactivated by pulmonary surfactant, so it cannot be used in pneumonia — the exact indication where linezolid is strongest.',
          typicalCost:
            'US$21.85 per vial at United States pharmacy acquisition cost (CMS NADAC, median across 41 listed generic products, survey effective 20 May 2026)',
          prosAndCons:
            'Pros: once daily, no marrow toxicity, no serotonin interaction. Cons: useless in pneumonia; intravenous only; creatine kinase elevation.',
        },
        {
          name: 'Tedizolid',
          class: 'Second-generation oxazolidinone',
          howItCompares:
            'The same mechanism with a shorter course and less marrow suppression, and it retains activity against some cfr-mediated linezolid-resistant strains. Its approved indication is narrower — acute bacterial skin and skin structure infection — and it costs orders of magnitude more per unit.',
          typicalCost:
            'US$472.95 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 3 listed products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: less myelosuppression, shorter course, active against some cfr-positive isolates. Cons: roughly three hundred times the unit price; a much narrower licensed indication.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'List every antidepressant, migraine drug and opioid before starting',
          action:
            'Name every serotonergic medication being taken — SSRIs, SNRIs, tricyclics, triptans, buspirone, and opioids including pethidine.',
          patientImpact:
            'Linezolid is a reversible non-selective monoamine oxidase inhibitor. The label records spontaneous reports of serotonin syndrome, including fatal cases, when it is combined with serotonergic agents.',
          clinicalPrecaution:
            'Symptoms include high temperature, sweating, agitation, exaggerated reflexes, clonus, muscle rigidity and tremor. Whether and how to combine these drugs is a clinical decision; the point here is that the interaction is real, documented and easily missed because linezolid is not thought of as a psychiatric drug.',
        },
        {
          name: 'Report any change in vision during a long course',
          action:
            'Report blurring, changes in colour vision, loss of sharpness or any change in the visual field, at any point during treatment.',
          patientImpact:
            'The label records peripheral and optic neuropathy, primarily in patients treated beyond the maximum recommended 28 days, and notes that in cases of optic neuropathy progressing to loss of vision, patients had been treated for extended periods beyond that limit. Visual blurring has been reported in some patients treated for less than 28 days.',
          clinicalPrecaution:
            'In the Nix-TB tuberculosis study, where linezolid was given for 26 weeks, peripheral neuropathy occurred in 81% of patients. Prompt ophthalmic evaluation is advised by the label if visual symptoms occur; this page records that and does not give monitoring instructions.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(=O)NC[C@H]1CN(C(=O)O1)C2=CC(=C(C=C2)N3CCOCC3)F',
      chemicalFormula: 'C16H20FN3O4',
      molecularWeight: '337.35 g/mol',
      targetReceptorAffinity:
        'Linezolid binds the A site of the peptidyl transferase centre in the 50S ribosomal subunit, in a pocket formed by 23S ribosomal RNA. It prevents formation of the 70S initiation complex, so it acts before the first peptide bond rather than during elongation — a step no other clinically used antibacterial targets, which is why cross-resistance with other classes does not occur. Resistance arises from G2576T and related 23S rRNA mutations, from rplC mutations, or from the transferable cfr methyltransferase. The molecule also inhibits human mitochondrial ribosomes, which are bacterial in ancestry, and that off-target activity is the mechanistic origin of its myelosuppression, optic and peripheral neuropathy and lactic acidosis. It is additionally a reversible, non-selective monoamine oxidase inhibitor, a legacy of the DuPont antidepressant programme the scaffold came from.',
      structureSource: {
        label: 'PubChem CID 441401 (linezolid) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/441401',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'lzd-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'S-enantiomer purity of the oxazolidinone ring',
          description:
            'Confirm the (S) configuration at C5 of the oxazolidinone. The (R) enantiomer is essentially inactive against the ribosome, so enantiomeric purity is a potency specification. This is the first checkpoint because everything downstream assumes it.',
          reagentsAndBuffer:
            'Linezolid reference standard, chiral HPLC on an amylose or cellulose stationary phase, 19F NMR, optical rotation, gradient HPLC for related substances',
        },
        {
          id: 'lzd-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Construction of the oxazolidinone from the fluorinated morpholinoaniline',
          description:
            'Couple the 3-fluoro-4-morpholinylaniline to a chiral glycidyl building block and close the oxazolidinone ring, then acetylate the aminomethyl group. Every substituent here was earned by structure-activity work: the fluorine and the morpholine raised potency and oral exposure over the earlier DuPont oxazolidinones, which were abandoned for toxicity.',
          dependsOnStepId: 'lzd-w1',
          reagentsAndBuffer:
            '3-fluoro-4-morpholinylaniline, benzyl chloroformate, (R)-glycidyl butyrate, n-butyllithium in tetrahydrofuran at low temperature, acetic anhydride for the final acetylation',
        },
        {
          id: 'lzd-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation and control of the enantiomeric and des-fluoro impurities',
          description:
            'Crystallise the product and quantify the (R) enantiomer and the des-fluoro analogue. Both are pharmacologically distinct rather than merely inert, and the specification treats them as such.',
          dependsOnStepId: 'lzd-w2',
          reagentsAndBuffer:
            'Ethyl acetate and heptane crystallisation, chiral HPLC for enantiomeric excess, gradient reversed-phase HPLC for organic impurities, Karl Fischer titration',
        },
        {
          id: 'lzd-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Intracellular and alveolar-lining-fluid accumulation',
          description:
            'Measure accumulation inside macrophages and in alveolar lining fluid relative to plasma. This is the pharmacological reason linezolid outperformed vancomycin on clinical success in MRSA pneumonia, and the reason it works in tuberculosis, where the organism lives inside macrophages that most antibiotics never enter usefully.',
          dependsOnStepId: 'lzd-w3',
          reagentsAndBuffer:
            'Human monocyte-derived macrophages, THP-1 cell line, bronchoalveolar lavage fluid with urea correction, LC-MS/MS quantification, plasma protein binding by ultrafiltration',
        },
        {
          id: 'lzd-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Bacterial ribosome inhibition against a human mitochondrial ribosome counter-screen',
          description:
            'Measure inhibition of bacterial 70S initiation complex formation, then run the identical assay against isolated human mitochondrial ribosomes. The second half is the whole safety story of this drug in one experiment: the mitochondrial ribosome is bacterial in ancestry, linezolid inhibits it, and that is why marrow, optic nerves and peripheral nerves fail on long courses.',
          dependsOnStepId: 'lzd-w4',
          reagentsAndBuffer:
            'Purified Staphylococcus aureus 70S ribosomes, coupled transcription-translation reporter system, isolated human mitochondrial ribosomes from HepG2 or platelet preparations, radiolabelled or luminescent readout, lactate measurement in treated cell culture',
        },
      ],
    },
    keyAudits: [
      {
        id: 'lzd-a1',
        category: 'measured',
        title: 'ZEPHyR: 57.6% clinical success against vancomycin’s 46.6% in MRSA pneumonia',
        laymanSummary:
          'In the only large head-to-head trial in hospital-acquired MRSA pneumonia, more patients on linezolid were counted as cured, and less than half as many had kidney injury. The same proportion of each group was alive at sixty days.',
        technicalDetails:
          'ZEPHyR was a prospective, double-blind, controlled, multicentre trial in hospitalised adults with hospital-acquired or healthcare-associated MRSA pneumonia, comparing linezolid with a dose-optimised vancomycin regimen adjusted on trough levels. Of 1,184 patients treated, 448 entered the modified intention-to-treat population and 348 the per-protocol population. Clinical success at end of study in the per-protocol population was 95 of 165 (57.6%) with linezolid against 81 of 174 (46.6%) with vancomycin — 95% confidence interval for the difference 0.5% to 21.6%, P=.042. Nephrotoxicity occurred in 8.4% against 18.2%.',
        evidenceSource: 'Wunderink RG et al., Clin Infect Dis 2012;54:621-629 (ZEPHyR)',
        doi: '10.1093/cid/cir895',
        measuredMetric: 'Clinical outcome at end of study in evaluable per-protocol patients',
        auditFlag: 'verified',
      },
      {
        id: 'lzd-a2',
        category: 'inferred',
        title: 'Better cure did not become better survival',
        laymanSummary:
          'Linezolid won on the endpoint the trial was designed around and did not change the number of people who died. That result is routinely reported as though it settled which drug is better.',
        technicalDetails:
          'In ZEPHyR, all-cause 60-day mortality was 15.7% with linezolid and 17.0% with vancomycin — similar, and not the primary endpoint. The primary endpoint was investigator-assessed clinical outcome in the per-protocol population, which comprised 348 of the 1,184 patients treated, under 30% of those exposed. A clinical-response endpoint assessed in a subset that excludes protocol deviations is more susceptible to differential dropout than an all-cause mortality endpoint in everyone randomised. The published conclusion states both results plainly; the citation practice that followed generally did not.',
        evidenceSource:
          'Wunderink RG et al., Clin Infect Dis 2012;54:621-629 (ZEPHyR), Results and Conclusions',
        doi: '10.1093/cid/cir895',
        inferredClaim:
          'That linezolid is the better drug for MRSA nosocomial pneumonia — supported on a per-protocol clinical-response endpoint in under a third of treated patients, and not on 60-day mortality, which was the same',
        auditFlag: 'contested',
      },
      {
        id: 'lzd-a3',
        category: 'measured',
        title: 'Nix-TB: 90% favourable outcomes, and 81% peripheral neuropathy',
        laymanSummary:
          'In patients with tuberculosis that had defeated everything else, a three-drug regimen containing linezolid produced a good outcome in nine out of ten — a result nothing had achieved before. Four in five of them developed nerve damage in the process, and half had their bone marrow suppressed.',
        technicalDetails:
          'Nix-TB was an open-label, single-group study at three South African sites in 109 patients with extensively drug-resistant tuberculosis, or multidrug-resistant tuberculosis that had failed or been discontinued for side effects. The regimen was bedaquiline, pretomanid and linezolid for 26 weeks. Six months after the end of treatment, in the intention-to-treat analysis, 98 patients (90%, 95% CI 83 to 95) had a favourable outcome and 11 (10%) an unfavourable one — seven deaths, one withdrawal of consent, two relapses and one loss to follow-up. The expected linezolid toxic effects occurred in most participants: peripheral neuropathy in 81% and myelosuppression in 48%, described by the investigators as manageable and often leading to linezolid dose reduction or interruption.',
        evidenceSource: 'Conradie F et al., N Engl J Med 2020;382:893-902 (Nix-TB, NCT02333799)',
        doi: '10.1056/NEJMoa1901814',
        measuredMetric:
          'Favourable outcome six months after end of therapy, and incidence of peripheral neuropathy and myelosuppression',
        auditFlag: 'verified',
      },
      {
        id: 'lzd-a4',
        category: 'failed',
        title: 'The toxicity is the human mitochondrial ribosome, and it is time-dependent',
        laymanSummary:
          'Linezolid works by jamming the bacterial protein factory. Human cells have an almost identical factory inside their mitochondria, inherited from bacteria a billion years ago, and linezolid jams that too. The longer the course, the more it shows.',
        technicalDetails:
          'Pooled clinical trial data showed thrombocytopenia and a slight increase in anaemia risk becoming evident at two weeks or more of treatment, with abnormalities consistent with mild, reversible, duration-dependent myelosuppression. The label records myelosuppression including anaemia, leukopenia, pancytopenia and thrombocytopenia, more often in severe renal impairment and moderate to severe hepatic impairment, with recovery toward pretreatment levels when the drug is stopped. It records peripheral and optic neuropathy primarily beyond the maximum recommended duration of 28 days, and notes that where optic neuropathy progressed to loss of vision, patients had been treated for extended periods beyond that limit. Lactic acidosis, rhabdomyolysis, hypoglycaemia in patients on insulin or oral hypoglycaemics, and hyponatraemia with SIADH are also recorded. All of these are consistent with inhibition of mitochondrial protein synthesis.',
        evidenceSource:
          'Gerson SL et al., Antimicrob Agents Chemother 2002;46:2723-2726; Linezolid United States prescribing information, Warnings and Precautions 5.1, 5.2, 5.9 to 5.11',
        doi: '10.1128/AAC.46.8.2723-2726.2002',
        measuredMetric:
          'Onset of thrombocytopenia and anaemia by treatment duration in pooled phase 3 data',
        auditFlag: 'caution',
      },
      {
        id: 'lzd-a5',
        category: 'failed',
        title: 'A mortality imbalance in catheter infections it was never approved for',
        laymanSummary:
          'An open-label study in seriously ill patients with infected intravascular catheters found more deaths on linezolid than on the comparators. The excess was in patients whose infection turned out to be Gram-negative or unidentified — organisms linezolid cannot touch at all.',
        technicalDetails:
          'In an open-label investigational study in seriously ill patients with intravascular catheter-related infections, mortality was 78 of 363 (21.5%) with linezolid against 58 of 363 (16.0%) with vancomycin, dicloxacillin or oxacillin — odds ratio 1.426, 95% CI 0.97 to 2.098. The label states causality has not been established, and that the imbalance occurred primarily in linezolid-treated patients in whom Gram-negative pathogens, mixed Gram-negative and Gram-positive pathogens, or no pathogen were identified at baseline, and was not seen in patients with Gram-positive infections only. Linezolid has no clinical activity against Gram-negative organisms. The label states it is not approved and should not be used for catheter-related bloodstream infection or catheter-site infection.',
        evidenceSource:
          'Linezolid United States prescribing information, Warnings and Precautions 5.4 (NDA 021130)',
        measuredMetric:
          'All-cause mortality in an open-label investigational study of catheter-related infection',
        auditFlag: 'caution',
      },
      {
        id: 'lzd-a6',
        category: 'conclusion_shift',
        title: 'It was licensed as a hospital Gram-positive drug and became a tuberculosis drug',
        laymanSummary:
          'Linezolid was approved in 2000 for skin infections, pneumonia and resistant enterococci. Twenty years later its most important use is in a regimen for the most drug-resistant tuberculosis, which is not on its label and was not what anyone designed it for.',
        technicalDetails:
          'The approved indications remain nosocomial and community-acquired pneumonia, skin and skin structure infection, and vancomycin-resistant Enterococcus faecium infection. Mycobacterium tuberculosis was not among them. Three things converged: linezolid accumulates inside macrophages, where the organism lives; the oral formulation makes months-long treatment feasible; and generic pricing at about US$1.38 a unit brought it within reach of programmes in high-burden countries. Nix-TB then demonstrated 90% favourable outcomes at six months post-treatment in 109 patients with extensively drug-resistant or treatment-failed tuberculosis, an outcome without precedent in that population. The toxicity that constrains it — peripheral neuropathy in 81% and myelosuppression in 48% over 26 weeks — is the same mitochondrial mechanism that made 28 days the licensed ceiling for its original indications.',
        evidenceSource:
          'Conradie F et al., N Engl J Med 2020;382:893-902 (Nix-TB, NCT02333799); Linezolid United States prescribing information, Indications and Usage',
        doi: '10.1056/NEJMoa1901814',
        inferredClaim:
          'That a drug’s licensed indications describe what it is for — here the most consequential use lies outside them, at a duration the label describes as beyond the maximum recommended, with the toxicity that implies',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed or infused, with no difference between them',
        laymanDesc:
          'Linezolid is absorbed essentially completely from the gut, so a tablet delivers what a drip delivers. That is rare among drugs for resistant infections, and it is why treatment can continue for months outside hospital.',
        molecularDetail:
          'Oral bioavailability is approximately 100%, so intravenous and oral forms are interchangeable at the same amount. Metabolism is non-enzymatic oxidation rather than cytochrome P450 mediated, which removes a large class of drug interactions.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It concentrates where the bacteria hide',
        laymanDesc:
          'It builds up inside the immune cells that engulf bacteria and in the fluid lining the lungs. That is why it does well in pneumonia and why it works in tuberculosis, where the organism lives inside those cells.',
        molecularDetail:
          'Alveolar lining fluid and intracellular macrophage concentrations exceed plasma concentrations. This distribution is the pharmacological basis of its performance in MRSA nosocomial pneumonia and of its role in intracellular mycobacterial infection.',
        iconName: 'Layers',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It blocks the machine before it can start',
        laymanDesc:
          'Other antibiotics interfere with protein-building once it is under way. Linezolid wedges into the point where the first amino acid is loaded, so the machine never begins. Nothing else in use works there.',
        molecularDetail:
          'Linezolid binds the A site of the peptidyl transferase centre in the 50S subunit, formed by 23S ribosomal RNA, and prevents formation of the functional 70S initiation complex. Because the binding site and step are unique among clinical antibacterials, there is no cross-resistance with macrolides, tetracyclines, aminoglycosides or beta-lactams.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Bacteria stop growing rather than bursting',
        laymanDesc:
          'It stops bacteria multiplying rather than killing them outright against most organisms, which means the immune system has to finish the job.',
        molecularDetail:
          'Linezolid is bacteriostatic against staphylococci and enterococci and bactericidal against most streptococci. Bacteriostatic action is one proposed reason for the mortality imbalance seen in the catheter-infection study, alongside the absence of Gram-negative activity.',
        iconName: 'Ban',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Escaping it needs a change to the ribosome itself',
        laymanDesc:
          'Because the target is part of the bacterium’s protein factory, resistance means altering that factory — either by mutation or by borrowing a gene that chemically masks the binding site.',
        molecularDetail:
          'Resistance arises from 23S rRNA mutations, most commonly G2576T, from rplC mutations affecting ribosomal protein L3, or from acquisition of the transferable cfr methyltransferase, which methylates A2503 of 23S rRNA and confers cross-resistance across several classes. Because staphylococci carry multiple copies of the 23S rRNA gene, mutational resistance emerges slowly and needs sustained exposure.',
        iconName: 'Dna',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'The same mechanism in human mitochondria',
        laymanDesc:
          'Mitochondria descend from ancient bacteria and still build proteins on a bacterial-style machine. Linezolid jams that too. Given for weeks it suppresses the bone marrow; given for months it damages nerves and, sometimes permanently, the optic nerve.',
        molecularDetail:
          'Inhibition of mitochondrial ribosomes underlies duration-dependent myelosuppression, peripheral and optic neuropathy, lactic acidosis and rhabdomyolysis. Thrombocytopenia and anaemia become evident from two weeks; the label sets 28 days as the maximum recommended duration for licensed indications, and in tuberculosis regimens run for 26 weeks, with peripheral neuropathy in 81% of Nix-TB participants. Separately, linezolid is a reversible non-selective monoamine oxidase inhibitor, with fatal serotonin syndrome reported alongside serotonergic drugs.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'ZEPHyR (Wunderink 2012)',
        phase: 'Phase 4, prospective, double-blind, controlled, multicentre',
        sampleSize: 1184,
        primaryEndpoint:
          'Clinical outcome at end of study in evaluable per-protocol patients with MRSA nosocomial pneumonia',
        endpointMet: true,
        statisticalPValue:
          '57.6% (95 of 165) against vancomycin 46.6% (81 of 174); 95% CI for the difference 0.5% to 21.6%, P=.042',
        unreportedAdverseSignals:
          'All-cause 60-day mortality was 15.7% against 17.0% — no difference. The primary endpoint rests on 348 of 1,184 treated patients, and the mortality result on the larger population, so the trial’s most robust comparison is its least favourable one.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Nix-TB (NCT02333799)',
        phase: 'Open-label, single-group, three South African sites',
        sampleSize: 109,
        primaryEndpoint:
          'Incidence of an unfavourable outcome — treatment failure or relapse — through six months after end of treatment',
        endpointMet: true,
        statisticalPValue:
          '90% favourable outcome (95% CI 83 to 95); 11 unfavourable outcomes comprising 7 deaths, 1 withdrawal, 2 relapses and 1 loss to follow-up',
        unreportedAdverseSignals:
          'Single-group with no control arm, in a population where historical outcomes were very poor, so the comparison is against history rather than a concurrent group. Peripheral neuropathy occurred in 81% and myelosuppression in 48%, frequently requiring linezolid dose reduction or interruption — so the regimen as delivered was not the regimen as designed.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Clinical success 57.6% against vancomycin’s 46.6% in per-protocol MRSA nosocomial pneumonia, P=.042',
        'Nephrotoxicity 8.4% against vancomycin’s 18.2% in the same trial',
        '90% favourable outcome (95% CI 83 to 95) six months after treatment in 109 patients with highly drug-resistant tuberculosis',
        'Peripheral neuropathy in 81% and myelosuppression in 48% of those patients over 26 weeks',
        'Mortality 21.5% against 16.0% in an open-label catheter-infection study, odds ratio 1.426 (95% CI 0.97 to 2.098)',
      ],
      unsupportedInferences: [
        'That linezolid is the better drug for MRSA pneumonia — established on clinical response in under a third of treated patients, with identical 60-day mortality',
        'That the Nix-TB result is attributable to linezolid, when it is a three-drug regimen tested with no control arm against historical outcomes',
        'That myelosuppression is the limiting toxicity, when optic neuropathy progressing to vision loss is the one that does not reverse',
        'That an oral drug with complete bioavailability is a safe drug for long courses; complete absorption is exactly what makes prolonged mitochondrial exposure possible',
      ],
      whatFailedInitially: [
        'Mortality was higher on linezolid than on comparators in an open-label catheter-infection study, concentrated in patients with Gram-negative or unidentified organisms',
        'It has no activity whatever against Gram-negative bacteria, and the label states it must not be used where they may be present without specific cover',
        'Duration-dependent myelosuppression appears from two weeks and sets 28 days as the licensed ceiling, which the tuberculosis regimens exceed by design',
        'Transferable cfr-mediated resistance appeared, conferring cross-resistance across several unrelated classes at once',
      ],
      realWorldOutcome: [
        'Approved 18 April 2000, the first genuinely new antibacterial class to reach the market since the 1960s',
        'Now generic at about US$1.38 a unit, which is what made months-long tuberculosis regimens affordable',
        'A core component of the regimen that made extensively drug-resistant tuberculosis treatable, outside its licensed indications',
        'One of very few options against vancomycin-resistant Enterococcus faecium, and the only one that works by mouth',
      ],
    },
    deliverySystem: {
      type: 'Oral tablets, oral suspension and intravenous infusion, interchangeable at the same amount',
      description:
        'Oral bioavailability of approximately 100% makes tablet and infusion equivalent, which is unusual for a drug used against resistant organisms and is the single feature that makes months-long outpatient treatment possible. Metabolism is non-enzymatic rather than cytochrome P450 mediated, so the usual hepatic interaction list does not apply — but the monoamine oxidase inhibition does. The oral suspension contains phenylalanine and is unsuitable in phenylketonuria.',
      safetyProfile:
        'Myelosuppression including anaemia, leukopenia, pancytopenia and thrombocytopenia, becoming evident from about two weeks and reversing when the drug is stopped, more frequent in severe renal or moderate to severe hepatic impairment. Peripheral and optic neuropathy, reported primarily beyond the maximum recommended 28-day duration, with vision loss in patients treated well beyond it; visual blurring has occurred inside 28 days. Serotonin syndrome, including fatal cases, with serotonergic drugs — linezolid is a reversible non-selective monoamine oxidase inhibitor. Lactic acidosis, rhabdomyolysis, hypoglycaemia in patients on insulin or oral hypoglycaemics, hyponatraemia and SIADH. A mortality imbalance was seen in an investigational study in catheter-related bloodstream infection, an indication for which the drug is not approved.',
    },
    commonQuestions: [
      {
        q: 'Why can I take it as a tablet when other MRSA drugs need a drip?',
        a: 'Because it is absorbed essentially completely — oral bioavailability is around 100%, so a tablet delivers what an infusion delivers. Vancomycin is far too large a molecule to be absorbed and daptomycin is not orally available either, so linezolid is the only one of the three that can be taken at home. That single property is what turned it into a tuberculosis drug: no regimen lasting six months is practical if it requires a cannula. It is also the property that makes prolonged toxicity possible, because complete absorption means uninterrupted exposure of your mitochondria as well as the bacteria.',
      },
      {
        q: 'Is it better than vancomycin?',
        a: 'On the endpoint the trial measured, yes; on the endpoint most people care about, no difference was found. ZEPHyR compared linezolid with dose-optimised vancomycin in MRSA hospital-acquired pneumonia. Clinical success in the per-protocol population was 57.6% against 46.6%, P=.042, and kidney injury was 8.4% against 18.2%. All-cause 60-day mortality was 15.7% against 17.0% — similar. The clinical-success figure comes from 348 of the 1,184 patients treated; the mortality figure comes from a larger group. When a trial’s most robust comparison is also its least favourable, both belong in the summary, and only one of them usually survives into practice.',
        auditNote:
          'This trial has not been independently replicated. It is the largest head-to-head comparison in this indication and it is also the only one.',
      },
      {
        q: 'Why is there a two-week limit talked about?',
        a: 'Because of your mitochondria. Mitochondria descend from bacteria absorbed by our ancestors, and they still make proteins on a bacterial-style ribosome — the exact machine linezolid was designed to jam. Pooled trial data showed thrombocytopenia and a slight rise in anaemia risk becoming evident from two weeks, mild, reversible and duration-dependent. The label sets 28 days as the maximum recommended duration and reports peripheral and optic neuropathy primarily beyond it, including optic neuropathy progressing to loss of vision in patients treated for extended periods past that ceiling. Marrow suppression recovers. Optic nerve damage may not.',
      },
      {
        q: 'Why does it interact with antidepressants?',
        a: 'Because of where the molecule came from. The oxazolidinone scaffold originated in a DuPont programme aimed at monoamine oxidase inhibitors — antidepressants — and linezolid retains that activity as a reversible, non-selective monoamine oxidase inhibitor. Combining it with serotonergic drugs has produced serotonin syndrome, including fatal cases, according to the label. The list of relevant drugs is long: SSRIs, SNRIs, tricyclics, buspirone, triptans and opioids including pethidine. The interaction is easy to miss precisely because nobody thinks of an antibiotic as a psychiatric drug, and the antibiotic is often started urgently by a team that does not have the psychiatric history.',
      },
      {
        q: 'How did an antibiotic for skin infections become a tuberculosis drug?',
        a: 'Three things converged. Linezolid accumulates inside macrophages, which is where Mycobacterium tuberculosis lives and where most antibiotics never reach a useful concentration. It is fully orally available, so a six-month regimen is feasible without hospital. And it went generic, dropping to around US$1.38 a unit, which put it within reach of programmes in high-burden countries. The Nix-TB study then combined it with bedaquiline and pretomanid in 109 patients with extensively drug-resistant tuberculosis or multidrug-resistant disease that had already failed treatment, and 90% had a favourable outcome six months after finishing — a result without precedent in that population. The cost was measured too: peripheral neuropathy in 81%, myelosuppression in 48%, and frequent dose reduction or interruption of the linezolid itself.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Wunderink RG, Niederman MS, Kollef MH, et al. Linezolid in methicillin-resistant Staphylococcus aureus nosocomial pneumonia: a randomized, controlled study. Clin Infect Dis 2012;54:621-629',
        identifier: '10.1093/cid/cir895',
        kind: 'doi',
      },
      {
        label:
          'Conradie F, Diacon AH, Ngubane N, et al. Treatment of highly drug-resistant pulmonary tuberculosis. N Engl J Med 2020;382:893-902',
        identifier: '10.1056/NEJMoa1901814',
        kind: 'doi',
      },
      {
        label:
          'Gerson SL, Kaplan SL, Bruss JB, et al. Hematologic effects of linezolid: summary of clinical experience. Antimicrob Agents Chemother 2002;46:2723-2726',
        identifier: '10.1128/AAC.46.8.2723-2726.2002',
        kind: 'doi',
      },
      {
        label:
          'Nix-TB: bedaquiline, pretomanid and linezolid in highly drug-resistant tuberculosis',
        identifier: 'NCT02333799',
        kind: 'nct',
      },
      {
        label:
          'Drugs@FDA: ZYVOX (linezolid), NDA 021130, 021131 and 021132, Pfizer — original approval 18 April 2000; United States prescribing information, Warnings and Precautions 5.1 to 5.12',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021130',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 441401 — linezolid structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/441401',
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
  // ---------------------------------------------------------------------------------------------
  // 9. Daptomycin — the only antibiotic known to be switched off by a specific human organ, and
  //    the record behind this page named that organ as its indication.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'daptomycin',
    name: 'Daptomycin',
    tradeName: 'Cubicin',
    sponsor:
      'Eli Lilly (discovery, from Streptomyces roseosporus, shelved in the 1980s over muscle toxicity), licensed to and developed by Cubist Pharmaceuticals on NDA 021572, now part of Merck',
    targetGene:
      'None — daptomycin binds the membrane itself. Reduced susceptibility arises from mutations in mprF, yycFG/walKR and cls, which change membrane charge and composition.',
    targetProtein:
      'No protein target: daptomycin inserts calcium-dependently into the bacterial cytoplasmic membrane and disorganises it',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2003,
    indication:
      'Complicated skin and skin structure infections, and Staphylococcus aureus bloodstream infection including right-sided infective endocarditis, caused by susceptible isolates. It is explicitly not indicated for pneumonia.',
    patientFriendlyIndication:
      'Serious skin infections and bloodstream infections caused by resistant Gram-positive bacteria — not lung infections, which it cannot treat',
    anatomicalSite:
      'The bacterial cytoplasmic membrane. The human organ that matters most is the lung, where surfactant inactivates the drug, and skeletal muscle, where it causes myopathy.',
    conditionContext: {
      conditionExplainer:
        'Daptomycin punches holes in the outer membrane of Gram-positive bacteria rather than interfering with any enzyme. It needs calcium to do it, and it does not work in the lung because the fluid lining the airways binds it and switches it off.',
      whyItMatters:
        'It is one of a handful of options for MRSA bloodstream infection and endocarditis, and it is the clearest known example of an antibiotic being inactivated by a specific human organ. That failure was found by a trial, explained by a laboratory experiment, and written into the label.',
      whoTakesThis:
        'Adults and children with complicated skin infection or Staphylococcus aureus bloodstream infection, including right-sided endocarditis.',
      clinicalGoals:
        'Clearance of bacteria from blood and clinical resolution. The registration trial in bacteraemia used treatment success 42 days after the end of therapy.',
    },
    oneSentenceVerdict:
      'A calcium-dependent lipopeptide that inserts into the bacterial membrane and disorganises it rather than binding any protein — it was non-inferior to standard therapy in Staphylococcus aureus bacteraemia at 44.2% against 41.7% success with far less renal dysfunction (11.0% against 26.3%, P=.004), and it failed outright in community-acquired pneumonia because pulmonary surfactant binds and inactivates it.',
    laymanHowItWorks:
      'Daptomycin has a fatty tail. With the help of calcium, that tail buries itself in the outer wrapping of a Gram-positive bacterium and pulls the wrapping out of shape, so the cell leaks its contents and dies. The lungs are lined with a soapy substance that keeps the air sacs open, and that substance grabs daptomycin’s fatty tail and holds onto it — so in the lung the drug never reaches any bacteria at all.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 83,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$21.85 per vial at United States pharmacy acquisition cost (CMS NADAC, median across 41 listed generic products, survey effective 20 May 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States on 12 September 2003 under NDA 021572. Discovered at Eli Lilly and abandoned in the 1980s after muscle toxicity at the schedules then being tested; Cubist licensed it, found that once-daily administration separated efficacy from myopathy, and brought it to market. It is now generic with 41 listed products at about US$21.85 a vial — roughly five times meropenem and ten times vancomycin, but a small fraction of its branded price.',
      synthesisComplexity: 'High',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The choice is driven almost entirely by where the infection is. In the bloodstream daptomycin matches vancomycin with much less kidney injury. In the lung it does not work at all and vancomycin or linezolid is the answer. In skin infection all three work and price decides. Nothing sold as a food or supplement treats a bloodstream infection, and this is a page where the alternatives question has a short answer.',
      conventionalRx: [
        {
          name: 'Vancomycin',
          class: 'Glycopeptide',
          howItCompares:
            'The comparator in the registration trial, where it formed part of the standard-therapy arm. Success at 42 days was 41.7% against daptomycin’s 44.2%, but clinically significant renal dysfunction was 26.3% against 11.0% (P=.004). Unlike daptomycin it works in the lung.',
          typicalCost:
            'US$2.31 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 35 listed generic products, survey effective 17 December 2025)',
          prosAndCons:
            'Pros: about a tenth of the price, works in pneumonia, sixty years of experience. Cons: more than twice the renal dysfunction, requires blood-level monitoring, slower killing.',
        },
        {
          name: 'Linezolid',
          class: 'Oxazolidinone',
          howItCompares:
            'The option when the infection is in the lung, where daptomycin cannot work. It is also the only one of the three available by mouth. Its limit is time rather than site: myelosuppression appears from about two weeks and neuropathy beyond 28 days.',
          typicalCost:
            'US$1.38 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 17 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: works in pneumonia, oral, no calcium dependence. Cons: duration-limited by marrow and nerve toxicity; serotonin syndrome with serotonergic drugs; bacteriostatic rather than bactericidal.',
        },
        {
          name: 'Cefazolin',
          class: 'First-generation cephalosporin',
          howItCompares:
            'Not an alternative for MRSA at all, but the preferred agent when the organism turns out to be methicillin-susceptible Staphylococcus aureus, where beta-lactams outperform the MRSA-active drugs. Identifying that the organism is susceptible is the single most consequential result in a staphylococcal bloodstream infection.',
          typicalCost:
            'US$1.03 per vial at United States pharmacy acquisition cost (CMS NADAC, median across 9 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: narrower, cheaper, the evidence-favoured choice in methicillin-susceptible infection. Cons: useless against MRSA; requires the culture result before it can be chosen.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Report muscle aching or weakness, especially in the hands and feet',
          action:
            'Report new muscle pain or weakness during treatment, particularly in the distal limbs.',
          patientImpact:
            'The label defines myopathy as muscle aching or weakness alongside creatine phosphokinase above ten times the upper limit of normal, and records rhabdomyolysis with and without acute renal failure. This is the toxicity that caused Eli Lilly to shelve the drug in the 1980s.',
          clinicalPrecaution:
            'The label advises weekly creatine phosphokinase monitoring and more frequent monitoring in patients on or recently on a statin. How that is done is a clinical matter; the point here is that muscle symptoms on this drug are a specific signal rather than a general complaint.',
        },
        {
          name: 'Report new breathlessness or fever during a course',
          action:
            'Report new or worsening breathlessness, cough or fever appearing after several days of treatment.',
          patientImpact:
            'Daptomycin causes eosinophilic pneumonia — an inflammatory reaction in the lung to the drug itself, distinct from infection, and one the label directs be managed by stopping the drug and considering systemic steroids.',
          clinicalPrecaution:
            'The irony is exact: a drug that cannot treat pneumonia can cause one. New respiratory symptoms during daptomycin treatment need a diagnosis rather than an assumption that the infection is spreading.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CCCCCCCCCC(=O)N[C@@H](CC1=CNC2=CC=CC=C21)C(=O)N[C@H](CC(=O)N)C(=O)N[C@@H](CC(=O)O)C(=O)N[C@H]3[C@H](OC(=O)[C@@H](NC(=O)[C@@H](NC(=O)[C@H](NC(=O)CNC(=O)[C@@H](NC(=O)[C@H](NC(=O)[C@@H](NC(=O)[C@@H](NC(=O)CNC3=O)CCCN)CC(=O)O)C)CC(=O)O)CO)[C@H](C)CC(=O)O)CC(=O)C4=CC=CC=C4N)C',
      chemicalFormula: 'C72H101N17O26',
      molecularWeight: '1620.70 g/mol',
      targetReceptorAffinity:
        'Daptomycin has no protein target and no receptor. It is a 13-residue cyclic lipopeptide with a decanoyl tail; in the presence of physiological calcium it oligomerises and inserts into the bacterial cytoplasmic membrane, preferentially at regions rich in phosphatidylglycerol, causing membrane depolarisation, potassium efflux and rapid concentration-dependent killing without lysis. Reduced susceptibility comes from mutations in mprF, which lysinylates phosphatidylglycerol and makes the membrane more positively charged, and in yycFG/walKR and cls. Because the target is a membrane rather than a protein, the same mutations that reduce daptomycin binding can also alter vancomycin susceptibility, and cross-resistance between the two has been observed. The structure is supplied as a connection table rather than a residue sequence: it is a cyclic, non-ribosomal peptide with a lipid tail and non-standard residues, which no linear sequence notation represents.',
      structureSource: {
        label: 'PubChem CID 21585658 (daptomycin) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/21585658',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'dap-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Anhydro and beta-isomer quantification',
          description:
            'Quantify the anhydro-daptomycin and beta-isomer degradants, which form on storage and in solution and are the principal related substances for this molecule. A cyclic depsipeptide with an ester linkage in the ring has a specific failure mode — the ring opens — and this assay is what detects it.',
          reagentsAndBuffer:
            'Daptomycin reference standard, gradient reversed-phase HPLC with ultraviolet detection at 214 nm and 364 nm, mass spectrometric confirmation, Karl Fischer titration',
        },
        {
          id: 'dap-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Fermentation from Streptomyces roseosporus with decanoate feeding',
          description:
            'Daptomycin is a non-ribosomal peptide made by fermentation, with the decanoyl side chain directed by feeding decanoic acid to the culture. Feeding a different fatty acid produces a different lipopeptide, which is how the A21978C factor series was resolved and why the tail length is a manufacturing parameter rather than a synthetic choice.',
          dependsOnStepId: 'dap-w1',
          reagentsAndBuffer:
            'Streptomyces roseosporus production strain, decanoic acid feed, complex fermentation medium with controlled dissolved oxygen and pH, antifoam',
        },
        {
          id: 'dap-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Anion-exchange capture and lyophilisation',
          description:
            'Capture on anion-exchange resin, polish, and freeze-dry. The molecule is strongly anionic at neutral pH, which is what the capture exploits and also what makes it calcium-dependent in action — the calcium neutralises that charge so the peptide can approach a negatively charged bacterial membrane.',
          dependsOnStepId: 'dap-w2',
          reagentsAndBuffer:
            'Anion-exchange resin, salt gradient elution, reversed-phase preparative chromatography, lyophilisation with controlled shelf temperature, endotoxin and sub-visible particle testing',
        },
        {
          id: 'dap-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Calcium-dependent membrane insertion with a pulmonary surfactant counter-condition',
          description:
            'Measure oligomerisation and insertion into a model bacterial membrane at physiological calcium, then repeat the same experiment in the presence of pulmonary surfactant. This is the experiment that explained a failed phase 3 trial after the fact: surfactant binds daptomycin and abolishes its activity, and it is the first documented case of an antibiotic being inactivated by a specific human organ.',
          dependsOnStepId: 'dap-w3',
          reagentsAndBuffer:
            'Phosphatidylglycerol-rich liposomes, physiological calcium chloride, fluorescence resonance energy transfer or perylene fluorescence for oligomerisation, bovine or synthetic pulmonary surfactant, Staphylococcus aureus and Streptococcus pneumoniae in cation- and calcium-adjusted Mueller-Hinton broth',
        },
        {
          id: 'dap-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Membrane depolarisation kinetics and an mprF resistance counter-screen',
          description:
            'Track membrane potential collapse and potassium efflux to confirm the killing mechanism, then repeat against isolates carrying mprF gain-of-function mutations. The second run explains the emergent non-susceptibility seen in the registration trial: increased lysinylation of phosphatidylglycerol makes the membrane more positive and repels the calcium-daptomycin complex before it can insert.',
          dependsOnStepId: 'dap-w4',
          reagentsAndBuffer:
            'DiSC3(5) or DiOC2(3) membrane-potential dye, potassium-selective electrode, characterised mprF gain-of-function Staphylococcus aureus isolates, calcium-supplemented Mueller-Hinton broth at 50 mg/L calcium as required for daptomycin susceptibility testing',
        },
      ],
    },
    keyAudits: [
      {
        id: 'dap-a1',
        category: 'measured',
        title: 'Non-inferior in Staphylococcus aureus bacteraemia, with half the renal dysfunction',
        laymanSummary:
          'In the trial that approved it for bloodstream infection, daptomycin matched the older regimen. What separated them was the kidneys: about one patient in nine on daptomycin had significant kidney trouble, against about one in four on the older combination.',
        technicalDetails:
          'The trial randomised 124 patients with Staphylococcus aureus bacteraemia with or without endocarditis to daptomycin and 122 to initial low-dose gentamicin plus either an antistaphylococcal penicillin or vancomycin. Treatment success 42 days after the end of therapy in the modified intention-to-treat analysis was 53 of 120 (44.2%) against 48 of 115 (41.7%) — absolute difference 2.4%, 95% CI -10.2 to 15.1, meeting the pre-specified non-inferiority criteria. Success rates were similar in the subgroups with complicated bacteraemia, right-sided endocarditis and MRSA. Clinically significant renal dysfunction occurred in 11.0% against 26.3% (P=.004). Standard therapy was associated with a non-significantly higher rate of adverse events leading to discontinuation, 17 against 8 (P=.06).',
        evidenceSource: 'Fowler VG Jr et al., N Engl J Med 2006;355:653-665 (NCT00093067)',
        doi: '10.1056/NEJMoa053783',
        measuredMetric:
          'Treatment success 42 days after end of therapy, and clinically significant renal dysfunction',
        auditFlag: 'verified',
      },
      {
        id: 'dap-a2',
        category: 'failed',
        title: 'It failed community-acquired pneumonia outright, in two phase 3 trials',
        laymanSummary:
          'Two trials tested daptomycin against ceftriaxone in patients hospitalised with pneumonia. It lost both. The published conclusion is that daptomycin is not effective for treating community-acquired pneumonia.',
        technicalDetails:
          'Two double-blind phase 3 trials randomised adults hospitalised with community-acquired pneumonia to intravenous daptomycin or ceftriaxone once daily for 5 to 14 days. Pooled, the intent-to-treat population held 413 daptomycin and 421 ceftriaxone patients and the clinically evaluable population 369 and 371. Clinical cure in the intent-to-treat population was 70.9% with daptomycin against 77.4% with ceftriaxone (95% CI for the difference -12.4% to -0.6%), and in the clinically evaluable population 79.4% against 87.9% (95% CI -13.8% to -3.2%). Both intervals exclude zero against daptomycin. A post-hoc analysis found that among patients who had received up to 24 hours of prior effective therapy, cure rates were similar — 90.7% against 88.0%, 95% CI -6.1% to 11.5% — which the authors read as a warning about how pneumonia trials enrol rather than as a rescue of the drug.',
        evidenceSource: 'Pertel PE et al., Clin Infect Dis 2008;46:1142-1151',
        doi: '10.1086/533441',
        measuredMetric:
          'Clinical response at test of cure in the intent-to-treat and clinically evaluable populations',
        auditFlag: 'verified',
      },
      {
        id: 'dap-a3',
        category: 'measured',
        title: 'The reason it failed: the lung switches it off',
        laymanSummary:
          'After the pneumonia trials failed, a laboratory experiment found the explanation. The soapy substance that keeps the air sacs of the lung open binds daptomycin and stops it working. It is the only antibiotic known to be inactivated by a specific human organ.',
        technicalDetails:
          'Daptomycin showed an unusual pattern in animal pulmonary models: efficacy in Staphylococcus aureus haematogenous pneumonia and in inhalation anthrax, but no activity against Streptococcus pneumoniae in simple bronchial-alveolar pneumonia. In vitro, daptomycin interacts with pulmonary surfactant, inhibiting its antibacterial activity — an effect specific to daptomycin and consistent with its known mechanism, since surfactant phospholipids sequester the lipid tail that must insert into the bacterial membrane. The authors describe this as the first example of organ-specific inhibition of an antibiotic. The finding is why the label carries an explicit statement that daptomycin is not indicated for pneumonia.',
        evidenceSource: 'Silverman JA et al., J Infect Dis 2005;191:2149-2152',
        doi: '10.1086/430352',
        measuredMetric:
          'Loss of daptomycin antibacterial activity in the presence of pulmonary surfactant in vitro',
        auditFlag: 'verified',
      },
      {
        id: 'dap-a4',
        category: 'failed',
        title: 'Reduced susceptibility emerged during the registration trial itself',
        laymanSummary:
          'In the trial that approved the drug, more patients on daptomycin failed microbiologically than on the older regimen, and in six of those failures the bacteria had become less susceptible to daptomycin while the patient was on it.',
        technicalDetails:
          'Daptomycin therapy was associated with a higher rate of microbiological failure than standard therapy — 19 patients against 11, P=0.17, not statistically significant. In 6 of the 19 daptomycin microbiological failures, isolates with reduced susceptibility to daptomycin emerged during treatment; reduced susceptibility to vancomycin was similarly noted in isolates from vancomycin-treated patients. The mechanism is now understood as gain-of-function mutation in mprF and related loci, which increases the positive charge of the membrane and repels the calcium-daptomycin complex. The label carries a specific warning about persisting or relapsing Staphylococcus aureus bacteraemia or endocarditis, directing susceptibility testing and a search for sequestered foci of infection.',
        evidenceSource:
          'Fowler VG Jr et al., N Engl J Med 2006;355:653-665; Daptomycin for Injection United States prescribing information, Warnings and Precautions 5.9',
        doi: '10.1056/NEJMoa053783',
        measuredMetric:
          'Emergent reduced daptomycin susceptibility among microbiological failures in a randomised trial',
        auditFlag: 'caution',
      },
      {
        id: 'dap-a5',
        category: 'failed',
        title: 'It causes the lung disease it cannot treat, and the muscle injury that shelved it',
        laymanSummary:
          'Daptomycin cannot treat pneumonia and can cause one — an inflammatory reaction in the lung that looks like infection and is treated by stopping the drug. Separately, it damages muscle, which is why Eli Lilly abandoned it in the 1980s.',
        technicalDetails:
          'The label carries warnings for anaphylaxis and hypersensitivity, myopathy and rhabdomyolysis, eosinophilic pneumonia, DRESS, tubulointerstitial nephritis, peripheral neuropathy, potential nervous and muscular system effects in children under 12 months in whom use is to be avoided, Clostridioides difficile-associated diarrhoea, persisting or relapsing Staphylococcus aureus infection, and decreased efficacy in adults with moderate baseline renal impairment. Myopathy is defined as muscle aching or weakness with creatine phosphokinase above ten times the upper limit of normal. The label states that in phase 1 and phase 2 studies creatine phosphokinase elevations appeared more frequent when daptomycin was given more than once daily, and that it should therefore not be given more often than once a day — the observation that turned a shelved Lilly compound into a marketed drug.',
        evidenceSource:
          'Daptomycin for Injection United States prescribing information, Warnings and Precautions 5.1 to 5.10 (NDA 021572)',
        auditFlag: 'caution',
      },
      {
        id: 'dap-a6',
        category: 'conclusion_shift',
        title: 'The enriched record named pneumonia as this drug’s indication',
        laymanSummary:
          'The automated record behind this page listed daptomycin’s patient-facing indication as pneumonia. Pneumonia is the one thing this drug is documented not to treat, in two failed trials and an explicit label statement. The error is recorded here rather than quietly corrected.',
        technicalDetails:
          'The machine-enriched record for this drug carried "Pneumonia" as its patient-friendly indication. The approved indications are complicated skin and skin structure infections and Staphylococcus aureus bloodstream infection including right-sided infective endocarditis. Two pooled phase 3 trials found clinical cure of 70.9% against ceftriaxone’s 77.4% in the intent-to-treat population, with the confidence interval excluding zero, and concluded that daptomycin is not effective for community-acquired pneumonia. The mechanism was subsequently characterised as inactivation by pulmonary surfactant. This is a case where automated indication extraction produced not an incomplete answer but an inverted one, and it is the reason this dossier is flagged as carrying a discrepancy.',
        evidenceSource:
          'Pertel PE et al., Clin Infect Dis 2008;46:1142-1151; Silverman JA et al., J Infect Dis 2005;191:2149-2152; Daptomycin for Injection United States prescribing information, Indications and Usage',
        doi: '10.1086/533441',
        inferredClaim:
          'That an indication extracted automatically from a label or a trial registry describes what a drug treats — here it named the one organ where the drug is known to be pharmacologically inert',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Given once a day, and never more often',
        laymanDesc:
          'The drug was abandoned in the 1980s because it damaged muscle. What rescued it was the discovery that giving it once a day rather than in split doses kept the antibacterial effect and largely removed the muscle injury.',
        molecularDetail:
          'Killing is concentration-dependent while myopathy tracks the time muscle spends exposed, so consolidating the same amount into a single daily administration separates the two. The label states that creatine phosphokinase elevations appeared more frequent when daptomycin was given more than once daily and that it should not be dosed more frequently than once a day.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Calcium turns it into a membrane-seeking molecule',
        laymanDesc:
          'On its own, daptomycin is strongly negatively charged and a bacterial membrane is negatively charged too, so they repel. Calcium sits between them and neutralises the repulsion, letting the fatty tail reach the membrane.',
        molecularDetail:
          'Calcium binding neutralises the anionic charge of the cyclic peptide and promotes oligomerisation, allowing the decanoyl tail to insert into phosphatidylglycerol-rich regions of the cytoplasmic membrane. Susceptibility testing must be performed in calcium-supplemented medium, or the result is meaningless.',
        iconName: 'Sparkles',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It disorganises the membrane instead of binding a protein',
        laymanDesc:
          'There is no enzyme to jam. Daptomycin buries itself in the bacterium’s outer wrapping and pulls it out of shape, so the electrical gradient the cell depends on collapses.',
        molecularDetail:
          'Inserted oligomers cause membrane depolarisation and potassium efflux, disrupting the ion gradients that drive transport and synthesis. Killing is rapid and concentration-dependent and occurs without cell lysis, which reduces release of inflammatory cell-wall fragments compared with beta-lactams.',
        iconName: 'Zap',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The bacterium dies without bursting',
        laymanDesc:
          'The cell shuts down rather than exploding, so less bacterial debris is released into the bloodstream.',
        molecularDetail:
          'Non-lytic killing is unusual for a bactericidal agent and is one proposed advantage in high-burden infection, where beta-lactam-induced lysis releases peptidoglycan and lipoteichoic acid that drive the inflammatory response.',
        iconName: 'Ban',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The lung switches it off completely',
        laymanDesc:
          'The air sacs of the lung are lined with a soapy substance that keeps them from collapsing. That substance binds daptomycin’s fatty tail and holds it, so the drug never reaches bacteria in the lung. This is the only antibiotic known to be inactivated by a particular organ.',
        molecularDetail:
          'Pulmonary surfactant phospholipids sequester the decanoyl tail required for membrane insertion, abolishing antibacterial activity in vitro and in bronchial-alveolar animal models, while activity is retained in haematogenous pneumonia and inhalation anthrax. Two pooled phase 3 trials in community-acquired pneumonia found clinical cure of 79.4% against ceftriaxone’s 87.9% in evaluable patients, and the label states the drug is not indicated for pneumonia.',
        iconName: 'Ban',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What it costs, and how bacteria escape',
        laymanDesc:
          'It damages muscle and can inflame the lung. Bacteria escape it not by changing a protein but by making their membrane more positively charged, so the calcium-loaded drug is pushed away before it can insert.',
        molecularDetail:
          'Gain-of-function mutations in mprF increase lysinylation of phosphatidylglycerol and raise membrane positive charge; yycFG/walKR and cls mutations contribute. Emergent reduced susceptibility appeared in 6 of 19 microbiological failures in the registration trial. Labelled harms include myopathy and rhabdomyolysis, eosinophilic pneumonia, DRESS, tubulointerstitial nephritis, peripheral neuropathy, and reduced efficacy in moderate baseline renal impairment.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Fowler 2006 Staphylococcus aureus bacteraemia trial (NCT00093067)',
        phase: 'Phase 3, randomised, open-label, non-inferiority',
        sampleSize: 246,
        primaryEndpoint: 'Treatment success 42 days after the end of therapy',
        endpointMet: true,
        statisticalPValue:
          '44.2% (53 of 120) against standard therapy 41.7% (48 of 115); absolute difference 2.4%, 95% CI -10.2 to 15.1, non-inferiority criteria met',
        unreportedAdverseSignals:
          'Success in both arms was below 45%, which is the more striking figure and is rarely quoted. Microbiological failure was more frequent with daptomycin (19 against 11, P=0.17) and reduced daptomycin susceptibility emerged during treatment in 6 of those 19.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Pertel 2008 pooled community-acquired pneumonia programme',
        phase: 'Two phase 3, randomised, double-blind, active-controlled trials pooled',
        sampleSize: 834,
        primaryEndpoint:
          'Clinical response at the test-of-cure visit in the intent-to-treat and clinically evaluable populations',
        endpointMet: false,
        statisticalPValue:
          'Intent-to-treat 70.9% against ceftriaxone 77.4% (95% CI for the difference -12.4% to -0.6%); clinically evaluable 79.4% against 87.9% (95% CI -13.8% to -3.2%)',
        unreportedAdverseSignals:
          'A post-hoc subgroup of patients who had received up to 24 hours of prior effective therapy showed similar cure rates in both arms, 90.7% against 88.0%. That is a finding about trial enrolment rather than about the drug, and the authors presented it as such.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Treatment success 44.2% against standard therapy’s 41.7% at 42 days in 235 evaluable randomised patients with Staphylococcus aureus bacteraemia',
        'Clinically significant renal dysfunction 11.0% against 26.3% (P=.004) in the same trial',
        'Clinical cure 70.9% against ceftriaxone’s 77.4% in community-acquired pneumonia, confidence interval excluding zero',
        'Loss of antibacterial activity in the presence of pulmonary surfactant in vitro, with retained activity in haematogenous pneumonia models',
        'Emergent reduced daptomycin susceptibility in 6 of 19 microbiological failures during the registration trial',
      ],
      unsupportedInferences: [
        'That the record’s stated indication of pneumonia describes what this drug treats — it names the one organ in which the drug is documented to be inert',
        'That non-inferiority at 44.2% against 41.7% means the treatment works well; both arms failed more than half their patients',
        'That less renal dysfunction than a vancomycin-and-gentamicin arm isolates a daptomycin advantage, when the comparator contained two nephrotoxic agents',
        'That a post-hoc subgroup showing similar cure rates rescues the pneumonia result; the authors offered it as a criticism of trial design',
      ],
      whatFailedInitially: [
        'Eli Lilly shelved the compound in the 1980s over muscle toxicity, and it was only revived when once-daily administration was found to separate efficacy from myopathy',
        'It failed two phase 3 trials in community-acquired pneumonia and the label now states it is not indicated for pneumonia',
        'Reduced susceptibility emerged during the registration trial itself, in patients being treated',
        'It causes eosinophilic pneumonia, an inflammatory lung reaction, in an organ where it cannot treat infection',
      ],
      realWorldOutcome: [
        'Approved 12 September 2003 under NDA 021572, now generic with 41 listed products at about US$21.85 a vial',
        'A first-line option for MRSA bloodstream infection and right-sided endocarditis, and specifically excluded from pneumonia',
        'The only antibiotic known to be inactivated by a specific human organ, characterised after the trial that found the failure',
        'Susceptibility testing for it must be done in calcium-supplemented medium, or the result means nothing',
      ],
    },
    deliverySystem: {
      type: 'Intravenous infusion or injection, once daily and never more often',
      description:
        'Parenteral only. The once-daily restriction is a safety requirement rather than a convenience: creatine phosphokinase elevations were more frequent when the drug was given more than once a day, and the once-daily schedule is what made a shelved compound marketable. Predominantly renally cleared, with reduced efficacy reported in adults with moderate baseline renal impairment. It must not be used for pneumonia, and its susceptibility testing requires calcium-supplemented medium.',
      safetyProfile:
        'Myopathy — muscle aching or weakness with creatine phosphokinase above ten times the upper limit of normal — and rhabdomyolysis with or without acute renal failure, with weekly creatine phosphokinase monitoring advised and more frequent monitoring alongside statins. Eosinophilic pneumonia, managed by discontinuation and consideration of systemic steroids. Anaphylaxis and hypersensitivity, DRESS, tubulointerstitial nephritis and peripheral neuropathy. Use is to be avoided in children under 12 months because of potential nervous and muscular system effects. Persisting or relapsing Staphylococcus aureus infection should prompt susceptibility testing and a search for sequestered foci, because reduced susceptibility can emerge during treatment.',
    },
    commonQuestions: [
      {
        q: 'Why can it not be used for pneumonia?',
        a: 'Because the lung inactivates it, and this is the clearest example of that phenomenon in all of antibiotic therapy. The air sacs are lined with pulmonary surfactant, a phospholipid film that stops them collapsing. Daptomycin kills bacteria by burying a fatty tail in their membrane, and surfactant binds that same fatty tail and holds onto it, so the drug never reaches any bacteria. The sequence in which this was discovered matters: two phase 3 trials in community-acquired pneumonia failed first — clinical cure 79.4% against ceftriaxone’s 87.9% in evaluable patients — and the laboratory explanation came afterwards. The animal data fit precisely: daptomycin worked in pneumonia that arrived through the bloodstream and in inhalation anthrax, and did nothing against pneumococcus in ordinary bronchial-alveolar pneumonia.',
        auditNote:
          'The record this page was built from listed pneumonia as the drug’s indication. That is not a small error, and it is recorded on this page as an audit rather than silently corrected.',
      },
      {
        q: 'Is it better than vancomycin?',
        a: 'For bloodstream infection it is about equal on cure and clearly better on kidneys; for pneumonia it is not an option at all. In the registration trial, treatment success 42 days after therapy was 44.2% with daptomycin against 41.7% with standard therapy, meeting non-inferiority with a confidence interval from -10.2 to 15.1. Clinically significant renal dysfunction was 11.0% against 26.3%, P=.004. The comparator arm was vancomycin or an antistaphylococcal penicillin plus initial low-dose gentamicin, so some of that renal difference belongs to the gentamicin. The number worth sitting with is that both arms succeeded in under 45% of patients: Staphylococcus aureus bloodstream infection remains badly treated by everything available.',
      },
      {
        q: 'Why does it have to be given only once a day?',
        a: 'Because that is what makes it safe enough to use. Eli Lilly discovered the compound and abandoned it in the 1980s when it damaged skeletal muscle at the schedules being tested. Cubist licensed it and found that killing is concentration-dependent — it depends on how high the peak gets — while muscle injury tracks how long muscle is exposed. Consolidating the same total amount into one administration a day raises the peak and shortens the exposure, keeping the antibacterial effect and largely removing the myopathy. The label states directly that creatine phosphokinase elevations were more frequent when the drug was given more than once daily and that it should not be dosed more often than once a day.',
      },
      {
        q: 'Can bacteria become resistant to it during treatment?',
        a: 'Yes, and it happened in the trial that approved the drug. Daptomycin had more microbiological failures than standard therapy — 19 against 11, a difference that did not reach statistical significance — and in 6 of those 19, isolates with reduced daptomycin susceptibility emerged while the patient was being treated. The mechanism is not a change in any protein target, because there is no protein target: the bacterium alters the electrical charge of its own membrane, chiefly through gain-of-function mutations in mprF, so that the calcium-loaded drug is repelled before it can insert. The label carries a specific warning to test susceptibility again and look for a sequestered focus of infection if a staphylococcal bloodstream infection persists or relapses.',
      },
      {
        q: 'It cannot treat pneumonia but can it cause one?',
        a: 'Yes, and the label treats that as a distinct warning. Eosinophilic pneumonia is an inflammatory reaction of the lung to the drug itself, not an infection, and it typically appears after several days of treatment with new breathlessness, cough, fever and infiltrates on imaging. The label directs that daptomycin be discontinued and systemic steroids considered. The trap is obvious once stated: a patient on an antibiotic who develops new lung signs is assumed to have a spreading infection, and the reflex is to escalate the antibiotic rather than stop it. On this drug that reflex is exactly wrong.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Fowler VG Jr, Boucher HW, Corey GR, et al. Daptomycin versus standard therapy for bacteremia and endocarditis caused by Staphylococcus aureus. N Engl J Med 2006;355:653-665',
        identifier: '10.1056/NEJMoa053783',
        kind: 'doi',
      },
      {
        label:
          'Pertel PE, Bernardo P, Fogarty C, et al. Effects of prior effective therapy on the efficacy of daptomycin and ceftriaxone for the treatment of community-acquired pneumonia. Clin Infect Dis 2008;46:1142-1151',
        identifier: '10.1086/533441',
        kind: 'doi',
      },
      {
        label:
          'Silverman JA, Mortin LI, Vanpraagh AD, Li T, Alder J. Inhibition of daptomycin by pulmonary surfactant: in vitro modeling and clinical impact. J Infect Dis 2005;191:2149-2152',
        identifier: '10.1086/430352',
        kind: 'doi',
      },
      {
        label: 'Daptomycin against standard therapy in Staphylococcus aureus bacteraemia',
        identifier: 'NCT00093067',
        kind: 'nct',
      },
      {
        label:
          'Drugs@FDA: CUBICIN (daptomycin), NDA 021572, Cubist Pharmaceuticals — original approval 12 September 2003; United States prescribing information, Warnings and Precautions 5.1 to 5.10',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021572',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 21585658 — daptomycin structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/21585658',
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
  // ---------------------------------------------------------------------------------------------
  // 10. Nitrofurantoin — approved in 1953, displaced twice, restored twice, and its own label
  //     states that its pharmacodynamic effects are unknown.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'nitrofurantoin',
    name: 'Nitrofurantoin',
    tradeName: 'Furadantin / Macrodantin / Macrobid',
    sponsor:
      'Eaton Laboratories and Norwich Pharmacal (originator, from 1950s nitrofuran chemistry); the current United States application holder on this record is Casper Pharma, and dozens of generic products are marketed',
    targetGene:
      'None specific — the reduced drug damages DNA, ribosomal RNA and proteins at once. Activation depends on the bacterial nitroreductase genes nfsA and nfsB, and loss of both is the main route to resistance.',
    targetProtein:
      'No single target: bacterial flavoprotein nitroreductases convert the drug into reactive intermediates that attack macromolecules indiscriminately',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1953,
    indication:
      'Urinary tract infections when due to susceptible strains of Escherichia coli, enterococci, Staphylococcus aureus and certain susceptible strains of Klebsiella and Enterobacter species. It treats the bladder and nothing else, because it does not distribute into tissue.',
    patientFriendlyIndication: 'Bladder infections caused by susceptible bacteria',
    anatomicalSite:
      'The bladder urine. Nitrofurantoin achieves antibacterial concentrations only in urine, and the label states plainly that it lacks the broader tissue distribution of other urinary tract agents.',
    conditionContext: {
      conditionExplainer:
        'An uncomplicated urinary tract infection is bacteria multiplying in the bladder, usually Escherichia coli from the bowel. It is one of the most common bacterial infections in the world and one of the very few where the drug can be concentrated at the site of infection without going anywhere else.',
      whyItMatters:
        'Nitrofurantoin is over seventy years old, has been displaced twice by newer drugs and restored to first line twice, and has accumulated remarkably little resistance in that time. It is also the drug whose label openly states that its pharmacodynamic effects are unknown.',
      whoTakesThis:
        'Non-pregnant adults, mostly women, with uncomplicated bladder infection, and, in some countries, women with recurrent infection taking it long term.',
      clinicalGoals:
        'Resolution of symptoms without needing another antibiotic. The modern randomised trial measured exactly that, at 28 days after finishing treatment.',
    },
    oneSentenceVerdict:
      'A nitrofuran that bacterial enzymes convert into reactive fragments which damage DNA, ribosomes and proteins simultaneously, concentrated in urine and essentially nowhere else — in the only large modern randomised trial it resolved symptoms in 70% of 244 women against single-dose fosfomycin’s 58% (difference 12%, 95% CI 4 to 21%, P=.004), and in a single interstitial lung disease service ten women, mean age 80, developed pulmonary fibrosis a mean of 17 months after being prescribed it.',
    laymanHowItWorks:
      'Nitrofurantoin is swallowed, absorbed, and then dumped almost immediately into the urine, where it becomes very concentrated. Bacteria in the bladder take it up and their own enzymes chop it into reactive fragments — and those fragments attack everything at once: the bacterium’s genetic material, its protein factory, its enzymes. There is no single target to mutate away from, which is why seventy years of use has produced so little resistance.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 76,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.2421 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 49 listed generic products, survey effective 17 June 2026)',
      markupEstimate: '',
      openPatentNotes:
        'First marketed in the United States in 1953. All composition-of-matter protection expired decades ago, forty-nine generic products appear in the acquisition-cost survey, and the drug is on the WHO Model List of Essential Medicines. It is roughly a hundredth the unit price of fosfomycin, the other revived old drug it was tested against, and beat it.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The alternatives divide into drugs that treat the infection and measures that reduce how often it happens. Among the treatments, nitrofurantoin beat single-dose fosfomycin head to head and costs a fraction as much; trimethoprim is cheaper still where local resistance permits. Where the aim is prevention rather than cure, methenamine hippurate is a different kind of agent that acidifies urine into formaldehyde rather than acting as an antibiotic. No food or supplement has been shown to cure a urinary tract infection.',
      conventionalRx: [
        {
          name: 'Fosfomycin trometamol',
          class: 'Phosphonic acid derivative, single oral dose',
          howItCompares:
            'Its advantage is a single dose. In the head-to-head randomised trial its clinical resolution through day 28 was 58% against nitrofurantoin’s 70% (difference 12%, 95% CI 4 to 21%, P=.004), and microbiologic resolution 63% against 74% (difference 11%, 95% CI 1 to 20%, P=.04).',
          typicalCost:
            'US$26.75 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 8 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: one dose, so adherence is not a variable; retains activity against many resistant Gram-negatives. Cons: more than a hundred times the unit price and measurably lower resolution in the only large head-to-head trial.',
        },
        {
          name: 'Trimethoprim',
          class: 'Dihydrofolate reductase inhibitor',
          howItCompares:
            'Cheaper than nitrofurantoin and effective where local Escherichia coli resistance is low, which in many regions it no longer is. Unlike nitrofurantoin it distributes into tissue, so it can treat kidney infection, which nitrofurantoin cannot.',
          typicalCost:
            'US$0.0448 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 32 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: about a fifth of the price, reaches tissue, shorter courses. Cons: widespread resistance in community Escherichia coli in many regions; contraindicated in early pregnancy as a folate antagonist.',
        },
        {
          name: 'Methenamine hippurate',
          class: 'Urinary antiseptic — not an antibiotic',
          howItCompares:
            'A prevention agent rather than a treatment. In acidic urine it hydrolyses to formaldehyde, which is bactericidal non-specifically, so no resistance develops to it. It does not treat an established infection and does not work if urine is not acidic.',
          typicalCost:
            'US$0.3114 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 11 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: no resistance selection, an alternative to long-term antibiotics for recurrence. Cons: prevention only; depends on urinary pH; no role in an acute infection.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Report new breathlessness or a persistent dry cough, at any point',
          action:
            'Report new breathlessness on exertion or a persistent dry cough during or after nitrofurantoin, and say that you are taking or have taken it.',
          patientImpact:
            'Nitrofurantoin causes both an acute lung reaction and a chronic interstitial one. In a single interstitial lung disease service, ten patients — mean age 80, all women — were diagnosed with nitrofurantoin-induced interstitial lung disease over eight years, a mean of 17 months after the prescription. Seven of ten had ground-glass opacity and traction bronchiectasis on CT.',
          clinicalPrecaution:
            'Those patients improved symptomatically after stopping the drug, with or without steroids, but the authors note that irreversible imaging changes may contribute to long-term illness. Their conclusion was that counselling should happen before prescription regardless of kidney function.',
        },
        {
          name: 'Say if there is fever, back pain or feeling systemically unwell',
          action:
            'Distinguish bladder symptoms — burning, urgency, frequency — from fever, flank pain or feeling generally ill.',
          patientImpact:
            'Nitrofurantoin reaches antibacterial concentrations only in urine. The label states directly that it lacks the broader tissue distribution of other agents approved for urinary tract infection, so it does not treat a kidney infection or a bloodstream infection arising from one.',
          clinicalPrecaution:
            'Whether an infection has moved beyond the bladder is a clinical judgement, not a self-assessment. The point recorded here is that this is a drug defined by where it goes, and the boundary of where it goes is the boundary of what it treats.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1C(=O)NC(=O)N1/N=C/C2=CC=C(O2)[N+](=O)[O-]',
      chemicalFormula: 'C8H6N4O5',
      molecularWeight: '238.16 g/mol',
      targetReceptorAffinity:
        'Nitrofurantoin has no receptor and no single molecular target. The label states the mechanism directly: the drug is reduced by a wide range of enzymes including bacterial flavoproteins to reactive intermediates that damage macromolecules such as DNA and proteins. Because a bacterium must lose activity at multiple nitroreductases to escape, and because those enzymes have metabolic roles, resistance carries a fitness cost and has remained uncommon across seventy years of heavy use. The drug is not active against most Proteus or Serratia species and has no activity against Pseudomonas. The label also records in vitro antagonism between nitrofurantoin and quinolones.',
      structureSource: {
        label:
          'PubChem CID 6604200 (nitrofurantoin) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/6604200',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'nit-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Crystal size distribution and E-hydrazone geometry',
          description:
            'Confirm the E geometry of the hydrazone linkage and, critically, measure the crystal size distribution. Macrocrystalline and monohydrate-macrocrystal products dissolve more slowly than the microcrystalline form, which changes nausea rates and administration frequency without changing the molecule at all. For this drug, particle size is a clinically meaningful specification.',
          reagentsAndBuffer:
            'Nitrofurantoin reference standard, laser diffraction particle sizing, X-ray powder diffraction for the monohydrate form, ultraviolet spectroscopy at 367 nm, dissolution testing in simulated gastric fluid',
        },
        {
          id: 'nit-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Condensation of 5-nitrofurfural with 1-aminohydantoin',
          description:
            'Condense 5-nitrofurfural, or its diacetate, with 1-aminohydantoin to form the hydrazone. This is one of the simplest syntheses in this file — two commodity intermediates and a condensation — and it is a direct reason the finished drug costs about twenty-four United States cents a unit.',
          dependsOnStepId: 'nit-w1',
          reagentsAndBuffer:
            '5-nitrofurfural diacetate, 1-aminohydantoin hydrochloride, dilute sulfuric acid catalysis in aqueous medium, controlled temperature',
        },
        {
          id: 'nit-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Controlled crystallisation to the target habit and nitrofurfural control',
          description:
            'Crystallise to the intended particle size and quantify residual 5-nitrofurfural. The crystallisation is not a cleanup step here but a formulation step: the macrocrystalline and microcrystalline products are the same compound with different clinical tolerability, and the crystallisation is where that is decided.',
          dependsOnStepId: 'nit-w2',
          reagentsAndBuffer:
            'Controlled cooling crystallisation from dimethylformamide-water or acetone-water, seeded to the target habit, gradient HPLC for related substances, light protection throughout',
        },
        {
          id: 'nit-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Urinary concentration against tissue partitioning',
          description:
            'Measure the concentration achieved in urine against plasma and tissue. This is the defining pharmacological experiment for nitrofurantoin, and the informative result is the negative one: blood concentrations at therapeutic amounts are usually low, and the drug does not partition into tissue. Everything the drug treats and everything it cannot treat follows from that single distribution profile.',
          dependsOnStepId: 'nit-w3',
          reagentsAndBuffer:
            'Timed urine and plasma collection, LC-MS/MS quantification, renal tissue homogenate for partition measurement, artificial urine at pH 5.5 and 7.0 for activity confirmation',
        },
        {
          id: 'nit-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Nitroreductase-dependent activation with an nfsA/nfsB knockout counter-screen',
          description:
            'Confirm that killing requires bacterial nitroreductase activity by repeating the susceptibility assay in isogenic nfsA and nfsB deletion strains. The counter-screen is the whole resistance story: a bacterium must lose both enzymes to escape, those enzymes have other jobs, and the resulting fitness cost is the best explanation for why a drug in continuous use since 1953 still works.',
          dependsOnStepId: 'nit-w4',
          reagentsAndBuffer:
            'Escherichia coli K-12 with isogenic nfsA and nfsB single and double deletions, cation-adjusted Mueller-Hinton broth, artificial urine medium, competitive fitness assay against the wild type in mixed culture',
        },
      ],
    },
    keyAudits: [
      {
        id: 'nit-a1',
        category: 'measured',
        title: 'It beat single-dose fosfomycin, 70% against 58%, in 513 randomised women',
        laymanSummary:
          'The two old drugs that came back into first-line use for bladder infection were finally tested against each other. Five days of nitrofurantoin resolved symptoms in seven women in ten. A single dose of fosfomycin resolved them in fewer than six in ten.',
        technicalDetails:
          'A multinational, open-label, analyst-blinded randomised trial enrolled 513 non-pregnant women aged 18 and over with lower urinary tract symptoms, a positive urine dipstick, and no known colonisation or previous infection with organisms resistant to the study drugs, at sites in Geneva, Lodz and Petah-Tiqva between October 2013 and April 2017. Clinical resolution through day 28 after completing therapy was 171 of 244 (70%) with 5-day nitrofurantoin against 139 of 241 (58%) with single-dose fosfomycin — difference 12% (95% CI 4 to 21%), P=.004. Microbiologic resolution was 129 of 175 (74%) against 103 of 163 (63%) — difference 11% (95% CI 1 to 20%), P=.04. Adverse events were few and mainly gastrointestinal: nausea in 3% against 2%, diarrhoea in 1% in both arms.',
        evidenceSource: 'Huttner A et al., JAMA 2018;319:1781-1789 (NCT01966653)',
        doi: '10.1001/jama.2018.3627',
        measuredMetric:
          'Clinical resolution through 28 days after completing therapy, and microbiologic resolution',
        auditFlag: 'verified',
      },
      {
        id: 'nit-a2',
        category: 'failed',
        title: 'Three women in ten were not resolved, and a quarter may not have had an infection',
        laymanSummary:
          'The winning arm still left nearly a third of women without resolution at four weeks. And only about three-quarters of the participants had a urine culture confirming a bacterial infection in the first place, which is how urinary infection is actually diagnosed and treated in practice.',
        technicalDetails:
          'In the same trial, 70% clinical resolution means 73 of 244 women in the nitrofurantoin arm did not achieve resolution through day 28. Entry required lower urinary tract symptoms plus a positive dipstick for nitrites or leukocyte esterase; only 377 of 513 participants (73%) had a confirmed positive baseline culture. That is representative of real practice rather than a flaw — urinary infection is usually treated on symptoms and a dipstick — but it means roughly a quarter of the randomised population may not have had a culture-confirmed bacterial infection for either drug to resolve. The trial was open-label with analyst blinding rather than double-blind, unavoidable given a five-day course against a single dose.',
        evidenceSource:
          'Huttner A et al., JAMA 2018;319:1781-1789, Design and Results (NCT01966653)',
        doi: '10.1001/jama.2018.3627',
        measuredMetric:
          'Proportion without clinical resolution, and proportion with a confirmed positive baseline culture',
        auditFlag: 'caution',
      },
      {
        id: 'nit-a3',
        category: 'failed',
        title: 'Ten women, mean age 80, with lung fibrosis a mean of 17 months after prescription',
        laymanSummary:
          'Nitrofurantoin can scar the lungs. In one specialist clinic over eight years, ten patients were diagnosed with it — all women, average age eighty, and on average nearly a year and a half after the prescription that caused it. Stopping the drug helped, but the scarring on the scans did not always reverse.',
        technicalDetails:
          'A case series from a single interstitial lung disease service reviewed its database from 2012 to 2020 and identified ten patients with nitrofurantoin-induced interstitial lung disease. Mean age was 80 years and all were female. Mean time from prescription to presentation was 17 months. Mean pre-treatment eGFR was 76 mL/min/1.73m2 — that is, normal kidney function, which is the usual reassurance and did not protect them. Seven of ten had ground-glass opacity and traction bronchiectasis on CT; four received prednisolone. Patients improved symptomatically after stopping the drug with or without steroids, but the authors record that irreversible imaging changes may contribute to long-term morbidity, and conclude that counselling should precede prescription regardless of renal function. The context they give is that national prescribing of nitrofurantoin in England rose significantly over the preceding decade, largely as prophylaxis in women with recurrent infection.',
        evidenceSource:
          'Long term nitrofurantoin induced interstitial lung disease: a case series and literature review. Sarcoidosis Vasc Diffuse Lung Dis 2023;40:e2023050',
        doi: '10.36141/svdld.v40i4.13827',
        measuredMetric:
          'Case count, latency, renal function and CT findings in a single-service interstitial lung disease cohort',
        auditFlag: 'caution',
      },
      {
        id: 'nit-a4',
        category: 'inferred',
        title: 'The label states its pharmacodynamic effects are unknown',
        laymanSummary:
          'The current FDA label says, in the section that is supposed to describe what the drug does to the body, that its pharmacodynamic effects are unknown. It also says its pharmacokinetics are unknown in older people, children, people with liver disease and pregnant women. This is a drug taken by millions.',
        technicalDetails:
          'Section 12.2 of the label reads in full that pharmacodynamic effects of nitrofurantoin are unknown. Section 12.3 states that the pharmacokinetics of nitrofurantoin are unknown for geriatric patients, paediatric patients, patients with hepatic impairment or pregnant women, and that differences between male and female patients and between racial or ethnic groups are unknown. What is documented is distribution and excretion: nitrofurantoin is highly soluble in urine, lacks the broader tissue distribution of other agents approved for urinary tract infection, is rapidly excreted in urine to which it may impart a brown colour, and recovered roughly 42.7% to 43.6% of a daily amount in the first 24 hours. The therapeutic rationale is therefore that urinary concentration exceeds what the organism needs, rather than any measured concentration-effect relationship. That is a reasonable inference for a drug that acts only in urine. It is still an inference, and the label says so.',
        evidenceSource:
          'Nitrofurantoin United States prescribing information, Clinical Pharmacology 12.2 and 12.3',
        inferredClaim:
          'That the concentration achieved in urine translates into a predictable clinical effect — the assumption the whole indication rests on, with the label itself stating that the pharmacodynamics are unknown and the pharmacokinetics unstudied in most groups who take it',
        auditFlag: 'contested',
      },
      {
        id: 'nit-a5',
        category: 'conclusion_shift',
        title: 'Displaced twice, restored twice, and still not resistant after seventy years',
        laymanSummary:
          'Nitrofurantoin was pushed aside first by trimethoprim-sulfamethoxazole and then by the fluoroquinolones, both newer and easier to take. Both of those then ran into resistance and, in the quinolones’ case, serious safety warnings. Nitrofurantoin came back — and unlike them, it had barely accumulated any resistance in the intervening decades.',
        technicalDetails:
          'The reason is mechanistic and is stated in the label: nitrofurantoin is reduced by a wide range of enzymes including bacterial flavoproteins to reactive intermediates that damage macromolecules such as DNA and proteins. There is no single target to alter. Escape requires losing activity at multiple nitroreductases, principally nfsA and nfsB, and those enzymes have metabolic roles, so the resistant organism pays a fitness cost. Trimethoprim inhibits one enzyme and fluoroquinolones inhibit two related ones; single-step target mutations therefore work against both, and community Escherichia coli resistance to them rose accordingly. The 2018 head-to-head trial against fosfomycin is the modern evidence base for a drug whose original approval predates the framework that would now be required to obtain one.',
        evidenceSource:
          'Nitrofurantoin United States prescribing information, Microbiology 12.4; Huttner A et al., JAMA 2018;319:1781-1789',
        doi: '10.1001/jama.2018.3627',
        inferredClaim:
          'That newer antibacterials supersede older ones — here two successors were displaced by resistance and safety findings while the 1953 drug held, because a multi-target mechanism is harder to escape than a single-enzyme one',
        auditFlag: 'verified',
      },
      {
        id: 'nit-a6',
        category: 'failed',
        title: 'It is contraindicated in four populations, three of them for the same reason',
        laymanSummary:
          'The drug must not be used when the kidneys are not working, because it is cleared by the kidneys and cannot reach the urine — and it accumulates instead. It must not be used at the very end of pregnancy or in newborns, because their red blood cells cannot defend themselves against it.',
        technicalDetails:
          'The label contraindicates nitrofurantoin in known hypersensitivity; in a previous history of cholestatic jaundice or hepatic dysfunction associated with the drug; in anuria, oliguria or significant renal impairment defined as creatinine clearance under 60 mL per minute or a clinically significant elevated serum creatinine, because impaired excretion increases toxicity; in pregnancy at term from 38 to 42 weeks, during labour and delivery, or when labour is imminent; and in infants under one month of age. The last two share a mechanism: immature erythrocyte enzyme systems with unstable glutathione cannot withstand the drug’s oxidative intermediates, and haemolytic anaemia results. The renal contraindication is a double bind — the same failure that prevents the drug from reaching the urine where it works also prevents it leaving the body. The label additionally records in vitro antagonism between nitrofurantoin and quinolones, and no activity against Pseudomonas or most Proteus and Serratia species.',
        evidenceSource:
          'Nitrofurantoin United States prescribing information, Contraindications 4 and Microbiology 12.4',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Absorbed, then dumped straight into the urine',
        laymanDesc:
          'Nitrofurantoin is absorbed from the gut and then cleared by the kidney almost immediately. Blood levels stay low. Urine levels get very high. That is the entire design.',
        molecularDetail:
          'The label states that blood concentrations at therapeutic amounts are usually low, that the drug is highly soluble in urine, that it lacks the broader tissue distribution of other agents approved for urinary tract infection, and that roughly 42.7% to 43.6% of a daily amount is recovered in urine in the first 24 hours. Food or anything delaying gastric emptying increases bioavailability.',
        iconName: 'Droplet',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The crystal size decides how it is tolerated',
        laymanDesc:
          'The same compound is sold in different crystal sizes. The larger crystals dissolve more slowly, which causes less nausea. Nothing about the molecule changes — only how fast it goes into solution.',
        molecularDetail:
          'Microcrystalline, macrocrystalline and monohydrate-macrocrystal products differ in dissolution rate and hence in gastrointestinal tolerability and administration frequency. Particle size is a clinically relevant specification for this drug in a way it is not for most.',
        iconName: 'Layers',
        visualStage: 'delivery',
      },
      {
        step: 3,
        title: 'Bacteria take it up and activate it themselves',
        laymanDesc:
          'The drug arriving in the bladder is inert. Bacteria absorb it and their own enzymes convert it into something reactive. The bacterium manufactures its own poison.',
        molecularDetail:
          'Bacterial flavoprotein nitroreductases, principally NfsA and NfsB, reduce the nitro group to reactive intermediates. Human cells reduce it far less efficiently, which is the basis of selectivity.',
        iconName: 'Sparkles',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'The fragments attack everything at once',
        laymanDesc:
          'Those reactive fragments do not have a single target. They damage the bacterium’s genetic material, its protein-building machinery and its enzymes simultaneously.',
        molecularDetail:
          'The label states that the reactive intermediates damage macromolecules such as DNA and proteins. Ribosomal RNA, cell-wall synthesis and aerobic energy metabolism are all affected. There is no discrete binding site, so there is no discrete resistance mutation.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Escaping it costs the bacterium something',
        laymanDesc:
          'To resist, a bacterium has to switch off the enzymes that activate the drug — but those enzymes do other jobs, so the resistant organism is worse at being a bacterium. That is the best explanation for seventy years without widespread resistance.',
        molecularDetail:
          'Resistance requires loss of function at both nfsA and nfsB, a two-step process with an associated fitness cost, in contrast with single-step target mutations that confer trimethoprim and fluoroquinolone resistance. Nitrofurantoin has no useful activity against Pseudomonas and most Proteus and Serratia species — an intrinsic limit rather than acquired resistance.',
        iconName: 'Dna',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What the reactive chemistry does to the person',
        laymanDesc:
          'The same reactive fragments that kill bacteria can damage lungs, liver, nerves and, in newborns, red blood cells. Lung damage on long courses is the one to know about, and it can appear more than a year after starting.',
        molecularDetail:
          'Acute pulmonary hypersensitivity and chronic interstitial lung disease both occur; in one specialist series of ten patients, mean age 80, all female, mean latency was 17 months and mean pre-treatment eGFR was 76 mL/min/1.73m2. Chronic active hepatitis and peripheral neuropathy are also documented. Haemolytic anaemia in neonates and at term reflects immature erythrocyte glutathione systems and is the basis of two label contraindications.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Huttner 2018 nitrofurantoin against fosfomycin (NCT01966653)',
        phase: 'Phase 4, multinational, open-label, analyst-blinded, randomised',
        sampleSize: 513,
        primaryEndpoint:
          'Clinical response in the 28 days following completion of therapy in non-pregnant women with uncomplicated lower urinary tract infection',
        endpointMet: true,
        statisticalPValue:
          'Clinical resolution 70% (171 of 244) against fosfomycin 58% (139 of 241); difference 12% (95% CI 4 to 21%), P=.004. Microbiologic resolution 74% against 63%; difference 11% (95% CI 1 to 20%), P=.04',
        unreportedAdverseSignals:
          'Open-label rather than double-blind, unavoidable when comparing a five-day course with a single dose. Only 377 of 513 participants (73%) had a confirmed positive baseline culture, so roughly a quarter of the population may not have had culture-confirmed bacterial infection. Thirty percent of the winning arm did not achieve resolution.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Clinical resolution 70% against single-dose fosfomycin’s 58% through day 28, difference 12% (95% CI 4 to 21%), P=.004',
        'Microbiologic resolution 74% against 63%, difference 11% (95% CI 1 to 20%), P=.04',
        'Roughly 42.7% to 43.6% of a daily amount recovered in urine within 24 hours, with low blood concentrations',
        'Ten cases of nitrofurantoin-induced interstitial lung disease over eight years at one service, mean age 80, mean latency 17 months, mean pre-treatment eGFR 76',
      ],
      unsupportedInferences: [
        'That urinary concentration predicts clinical effect — the label states the pharmacodynamic effects of nitrofurantoin are unknown',
        'That the pharmacokinetics are understood in the people who take it; the label states they are unknown in older adults, children, hepatic impairment and pregnancy',
        'That normal kidney function protects against pulmonary toxicity — mean pre-treatment eGFR in the fibrosis series was 76 mL/min/1.73m2',
        'That a trial enrolling on symptoms and a dipstick measures the drug against a confirmed bacterial infection in every participant',
      ],
      whatFailedInitially: [
        'Three women in ten in the winning arm did not achieve clinical resolution at 28 days',
        'It cannot treat pyelonephritis, bloodstream infection or anything outside the bladder, because it does not distribute into tissue',
        'It is contraindicated below a creatinine clearance of 60 mL per minute, at term pregnancy and under one month of age, and after any previous cholestatic reaction to it',
        'Long-term prophylactic prescribing, which rose substantially in England over a decade, is the pattern that produced the pulmonary fibrosis series',
      ],
      realWorldOutcome: [
        'First marketed in 1953, displaced twice by newer agents and restored to first line twice',
        'On the WHO Model List of Essential Medicines at about twenty-four United States cents a unit, roughly a hundredth of fosfomycin',
        'Still has low resistance in community Escherichia coli after seventy years, because there is no single target to mutate',
        'The only large modern randomised trial supporting it was published in 2018, sixty-five years after approval',
      ],
    },
    deliverySystem: {
      type: 'Oral capsules and suspension, in microcrystalline, macrocrystalline and monohydrate-macrocrystal forms',
      description:
        'Absorbed readily and then cleared rapidly into urine, where it reaches antibacterial concentrations that plasma and tissue never do. Bioavailability rises with food or anything delaying gastric emptying. The crystalline form is a genuine clinical variable rather than a manufacturing detail: larger crystals dissolve more slowly, which reduces nausea and changes how often the drug is given. Nitrofurantoin is dialysable, and it may turn urine brown.',
      safetyProfile:
        'Contraindicated in known hypersensitivity, in previous cholestatic jaundice or hepatic dysfunction associated with the drug, in anuria, oliguria or creatinine clearance under 60 mL per minute, in pregnancy at term from 38 to 42 weeks and during labour, and in infants under one month of age — the last two because immature erythrocyte enzyme systems cannot withstand oxidative stress and haemolytic anaemia results. Acute pulmonary hypersensitivity and chronic interstitial lung disease with fibrosis both occur, the chronic form typically after months of prophylactic use and with a mean latency of 17 months in one specialist series, in patients whose kidney function was normal. Chronic active hepatitis and peripheral neuropathy are also documented. The label records in vitro antagonism with quinolones.',
    },
    commonQuestions: [
      {
        q: 'Why does it only treat bladder infections?',
        a: 'Because that is the only place it goes. The label states it directly: nitrofurantoin lacks the broader tissue distribution of other therapeutic agents approved for urinary tract infections, and blood concentrations at therapeutic amounts are usually low. It is absorbed from the gut and then cleared into urine so rapidly that it never builds up anywhere else, with roughly 43% of a daily amount recovered in urine within 24 hours. That is what makes it a good bladder drug — very high concentration exactly where the bacteria are, and almost no exposure elsewhere — and it is also why it does nothing for a kidney infection or a bloodstream infection. The boundary of where the drug goes is the boundary of what it treats.',
      },
      {
        q: 'How has it avoided resistance for seventy years?',
        a: 'Because there is nothing single to mutate. Most antibiotics bind one target, and a bacterium that alters that target escapes. Nitrofurantoin arrives inert and is converted by the bacterium’s own enzymes into reactive fragments that damage DNA, RNA, proteins and cell-wall synthesis all at once. To escape, an organism has to lose function at multiple nitroreductase enzymes, and those enzymes have other metabolic jobs, so the resistant bacterium is a less capable bacterium. Compare that with trimethoprim, which inhibits one enzyme, or the fluoroquinolones, which inhibit two related ones: both accumulated community resistance in Escherichia coli within decades. Both were once considered to have superseded nitrofurantoin.',
      },
      {
        q: 'Can it really damage my lungs?',
        a: 'Yes, in two different ways, and the chronic one is the one people do not see coming. There is an acute reaction, an allergic-type pneumonitis within days to weeks, and a chronic one that develops over months of continuous use and can scar the lung. A single specialist interstitial lung disease service reviewed eight years of its database and found ten patients with nitrofurantoin-induced disease — all women, mean age 80, presenting a mean of 17 months after the prescription. Their mean kidney function before treatment was normal, at 76 mL/min/1.73m2, which is the reassurance that usually gets offered and did not protect them. Seven had ground-glass changes and traction bronchiectasis on CT. Everyone improved symptomatically once the drug was stopped, but the authors record that irreversible imaging changes may cause long-term problems, and they specifically concluded that counselling should happen before prescription regardless of kidney function.',
        auditNote:
          'This is a single-centre case series, not an incidence estimate. It tells you the reaction is real and characterises what it looks like; it cannot tell you how often it happens per prescription.',
      },
      {
        q: 'Why is it contraindicated if my kidneys are not working well?',
        a: 'Because the same problem does two things at once. Nitrofurantoin only works because the kidney concentrates it into urine. If filtration falls, less drug reaches the urine — so the antibacterial effect drops — while more stays in the body, where the reactive chemistry that kills bacteria has nothing useful to do and can damage nerves and other tissue. The label puts the threshold at a creatinine clearance under 60 mL per minute, or a clinically significant elevated serum creatinine, and describes it as a contraindication rather than a caution. The trap is that reduced efficacy and increased toxicity move together, so there is no window in which giving less would help.',
      },
      {
        q: 'The label says its effects are unknown. What does that mean?',
        a: 'It means what it says, and it is worth reading directly. Section 12.2 of the current label states that pharmacodynamic effects of nitrofurantoin are unknown. Section 12.3 states that its pharmacokinetics are unknown in older adults, in children, in people with liver impairment and in pregnant women, and that differences between male and female patients and between racial and ethnic groups are unknown. This is a drug approved in 1953, before any of that was required, and taken since by an enormous number of people — predominantly women, and often older women. What is known is where it goes and how fast it leaves. The rest is inference from the fact that it works, plus one large randomised trial published in 2018, sixty-five years after approval.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Huttner A, Kowalczyk A, Turjeman A, et al. Effect of 5-day nitrofurantoin vs single-dose fosfomycin on clinical resolution of uncomplicated lower urinary tract infection in women: a randomized clinical trial. JAMA 2018;319:1781-1789',
        identifier: '10.1001/jama.2018.3627',
        kind: 'doi',
      },
      {
        label:
          'Long term nitrofurantoin induced interstitial lung disease: a case series and literature review. Sarcoidosis Vasc Diffuse Lung Dis 2023;40:e2023050',
        identifier: '10.36141/svdld.v40i4.13827',
        kind: 'doi',
      },
      {
        label: 'Nitrofurantoin against fosfomycin in uncomplicated lower urinary tract infection',
        identifier: 'NCT01966653',
        kind: 'nct',
      },
      {
        label:
          'Nitrofurantoin United States prescribing information — Contraindications 4, Clinical Pharmacology 12.2 and 12.3, Microbiology 12.4 (openFDA drug label endpoint)',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22nitrofurantoin%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 6604200 — nitrofurantoin structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/6604200',
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
