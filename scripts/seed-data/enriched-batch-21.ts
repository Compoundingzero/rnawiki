import type { SeedDossier } from '@/lib/seed-types'

/**
 * Curated flagship dossiers — the analgesics everyone takes: the six non-steroidal
 * anti-inflammatory drugs that sit at the top of every dispensing table, the paracetamol that
 * outsells all of them, the aspirin that changed indication twice, the injectable NSAID with a
 * boxed five-day ceiling, and the opioid that was sold for twenty years as though it were not one.
 *
 * Editorial layer written over the machine-enriched records: the verdict, the mechanism carousel
 * and the audits, which no pipeline can produce. The identity facts — slug, trade name, sponsor,
 * approval year, SMILES, molecular formula — are copied from the enriched record rather than
 * researched again.
 *
 * Every DOI, PMID, NCT number and FDA application number below was resolved against the NCBI
 * E-utilities, the ClinicalTrials.gov registry, the openFDA label endpoint or the Drugs@FDA
 * application record at the time of writing. Sample sizes, hazard ratios, confidence intervals,
 * numbers needed to treat and p-values are copied from the published abstract or from the label
 * text returned by the openFDA endpoint, never from memory. Where a number could not be sourced,
 * the field is absent.
 *
 * Six conventions apply to the whole group.
 *
 * 1. PAIN IS A SELF-REPORT AND EVERY PAGE SAYS SO. The endpoint behind almost every analgesic
 *    licence is a person marking a line on a scale, converted into a proportion reaching "at
 *    least 50% pain relief" and then into a number needed to treat. That is a real measurement of
 *    a real experience, and it is not a measurement of tissue healing, of function months later,
 *    or of anything a scan would show. Where a drug has been tested against a hard endpoint —
 *    death, infarction, bleeding, liver failure — that trial is on the page at the same weight as
 *    the pain result.
 *
 * 2. THE CLASS WARNING IS A MEASUREMENT, NOT A FORMALITY. Every prescription NSAID in the United
 *    States carries the same boxed warning for cardiovascular thrombotic events and for
 *    gastrointestinal bleeding, ulceration and perforation. The individual-participant
 *    meta-analysis behind it (CNT Collaboration, Lancet 2013) put numbers on each molecule
 *    separately, and those numbers are not interchangeable: naproxen did not significantly raise
 *    major vascular events, diclofenac raised them by about 41%, ibuprofen raised major coronary
 *    events by a factor of 2.2. Each page carries its own molecule’s figure.
 *
 * 3. PRICING IS A PRICE, NOT A COST. Every price here is the CMS National Average Drug Acquisition
 *    Cost — what a United States retail pharmacy pays a wholesaler — and is labelled as such.
 *    `synthesisCostPerDose` is empty on every dossier in this file: the cost-of-production
 *    literature for the WHO Essential Medicines List publishes a method and an aggregate, and its
 *    per-molecule figures sit in a supplementary appendix that could not be resolved and verified
 *    at the time of writing. An unverified cost is worse than an absent one.
 *
 * 4. NO DOSING, TITRATION, MONITORING OR PROCUREMENT GUIDANCE. Milligram figures appear only where
 *    they are part of a trial’s description, a label statement or a product’s identity — the
 *    2,045 mg mean daily ibuprofen dose in PRECISION, the 4 g paracetamol ceiling, the 325 mg
 *    combination-product limit. Nothing here tells a reader what to take or how much of it.
 *
 * 5. THE MOST INSTRUCTIVE RECORD IN THIS GROUP IS A PUBLICATION. The CLASS trial of celecoxib
 *    reported six months of a twelve-month study in JAMA in 2000, and the gastrointestinal
 *    advantage that made the drug’s reputation did not survive the full dataset the FDA already
 *    held. That story is on the celecoxib page because it is the clearest demonstration in this
 *    therapeutic area of the difference between what was measured and what was published.
 *
 * 6. FOUR OF THESE TEN CHANGED INDICATION AFTER APPROVAL, AND NOT UPWARDS. Aspirin lost routine
 *    primary prevention, paracetamol lost first-line status in low back pain and osteoarthritis
 *    guidelines, diclofenac lost over-the-counter status in several countries, and tramadol lost
 *    its unscheduled status. Each of those is a `conclusion_shift` audit, not a footnote.
 */

const NADAC_SOURCE = {
  label:
    'CMS National Average Drug Acquisition Cost (NADAC) survey — what United States retail pharmacies pay to acquire a drug',
  identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
  kind: 'url' as const,
}

const COST_OF_PRODUCTION_SOURCE = {
  label:
    'Hill AM, Barber MJ, Gotham D. Estimated costs of production and potential prices for the WHO Essential Medicines List. BMJ Glob Health 2018;3:e000571 — the cost-of-production literature checked for this group. It publishes an estimation method over the Essential Medicines List and an aggregate result in the range US$0.01 to US$1.45 per unit; its per-molecule analgesic figures are in a supplementary appendix that could not be resolved at the time of writing, so no per-dose cost is stated on these pages',
  identifier: '10.1136/bmjgh-2017-000571',
  kind: 'doi' as const,
}

const CNT_SOURCE = {
  label:
    'Coxib and traditional NSAID Trialists’ (CNT) Collaboration. Vascular and upper gastrointestinal effects of non-steroidal anti-inflammatory drugs: meta-analyses of individual participant data from randomised trials. Lancet 2013;382:769-779 — 280 trials against placebo (124,513 participants) and 474 trials of one NSAID against another (229,296 participants)',
  identifier: '10.1016/S0140-6736(13)60900-9',
  kind: 'doi' as const,
}

const PRECISION_SOURCE = {
  label:
    'Nissen SE, Yeomans ND, Solomon DH, et al. Cardiovascular Safety of Celecoxib, Naproxen, or Ibuprofen for Arthritis (PRECISION). N Engl J Med 2016;375:2519-2529',
  identifier: '10.1056/NEJMoa1611593',
  kind: 'doi' as const,
}

export const ENRICHED_BATCH_21_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // 1. Ibuprofen — the over-the-counter NSAID with the largest single-dose evidence base in
  //    medicine, which cancels the aspirin a heart patient is taking and whose own label says so.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'ibuprofen',
    name: 'Ibuprofen',
    tradeName: 'Advil, Motrin, Nurofen, Caldolor',
    sponsor:
      'Discovered at the Boots Pure Drug Company in Nottingham by Stewart Adams and John Nicholson; United States NDA 017463 (MOTRIN) held by McNeil Consumer, over-the-counter since 1984 and made by several hundred manufacturers',
    targetGene: 'PTGS1 and PTGS2',
    targetProtein:
      'Prostaglandin-endoperoxide synthase 1 and 2 (cyclooxygenase-1 and cyclooxygenase-2), inhibited reversibly and competitively rather than covalently',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1974,
    indication:
      'Relief of the signs and symptoms of rheumatoid arthritis and osteoarthritis, relief of mild to moderate pain, and treatment of primary dysmenorrhoea; over-the-counter for temporary relief of minor aches and pains and for reduction of fever',
    patientFriendlyIndication: 'Pain, fever and inflammation',
    anatomicalSite:
      'The hydrophobic cyclooxygenase channel of COX-1 and COX-2 — in inflamed peripheral tissue, in the stomach lining, in the kidney medulla and in circulating platelets, all at once',
    conditionContext: {
      conditionExplainer:
        'Injured or inflamed tissue makes prostaglandins, which do not themselves cause pain but lower the threshold at which nerve endings fire. Ibuprofen blocks the enzyme that makes them, so the same injury hurts less. It does not treat the injury.',
      whyItMatters:
        'This is the most-taken anti-inflammatory drug in the world and one of the few whose short-term efficacy is not in dispute. The argument is entirely about what it costs elsewhere in the body: the same enzyme it blocks in an inflamed knee is the enzyme that protects the stomach lining, maintains renal blood flow under stress, and — in platelets — is the target of the low-dose aspirin a heart patient may be taking.',
      whoTakesThis:
        'Adults and children with pain, fever or inflammatory arthritis. Not people in the setting of coronary artery bypass graft surgery, which is a contraindication, and not people with aspirin-sensitive asthma, in whom cross-reactive bronchospasm has been fatal.',
      clinicalGoals:
        'Less pain for a few hours, or less swelling and stiffness over weeks. Nothing about joint structure, disease course or survival has been shown to change.',
    },
    oneSentenceVerdict:
      'A reversible non-selective cyclooxygenase inhibitor with among the best-quantified short-term analgesia in medicine — 52% of postoperative patients reach at least 50% pain relief on a single 400 mg dose against 7% on placebo — bought at the price of a 3.97-fold increase in upper gastrointestinal complications, a 2.22-fold increase in major coronary events at high dose, and a documented ability to cancel the antiplatelet effect of the aspirin a cardiac patient is taking.',
    laymanHowItWorks:
      'Damaged tissue releases prostaglandins, chemical messengers that make nerve endings fire more easily and blood vessels leak. Ibuprofen sits in the channel of the two enzymes that build prostaglandins and blocks it, so less of the messenger is made and the same injury signals less pain, less swelling and less fever. The catch is that those enzymes are not only in injured tissue: the same block thins the protective mucus in the stomach, reduces blood flow to the kidney when the body is already short of fluid, and occupies the exact site inside platelets that low-dose aspirin needs to reach. Unlike aspirin, ibuprofen lets go of the enzyme again, so the effect lasts hours rather than the life of the platelet.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 84,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0391 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 244 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'The Boots patent expired in the mid-1980s and ibuprofen moved to over-the-counter status in the United States in 1984. It has been off patent for four decades, is on the WHO Model List of Essential Medicines, and is manufactured at scale by a very large number of firms — the reason a tablet costs under four United States cents at acquisition. Ibuprofen is one of the small number of medicines whose price is genuinely close to the cost of making it.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The alternatives to ibuprofen are not obviously better; they are differently bad, and the trade-offs are measured. Naproxen is the one non-selective NSAID that did not significantly raise major vascular events in the individual-participant meta-analysis, and it raised upper gastrointestinal complications slightly more. Celecoxib had significantly fewer gastrointestinal and renal events than ibuprofen in a head-to-head trial of 24,081 people. Paracetamol has almost no anti-inflammatory effect and, in the highest-quality evidence, no measurable benefit at all in low back pain. Topical NSAIDs deliver the same molecule with a fraction of the systemic exposure.',
      conventionalRx: [
        {
          name: 'Naproxen (Naprosyn, Aleve)',
          class: 'Non-selective cyclooxygenase inhibitor, long half-life',
          howItCompares:
            'The only traditional NSAID in the CNT meta-analysis that did not significantly increase major vascular events (rate ratio 0.93, 95% CI 0.69 to 1.27), against ibuprofen’s 2.22-fold rise in major coronary events at high dose. It paid for that with the highest upper gastrointestinal complication rate in the analysis (4.22, 2.71 to 6.56, against ibuprofen’s 3.97).',
          typicalCost:
            'US$0.0669 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 110 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: the least vascular risk of the group on randomised data; twice-daily rather than three or four times. Cons: the most gastrointestinal risk of the group; it also blocks platelet COX-1 for longer, which is a bleeding problem rather than a benefit.',
        },
        {
          name: 'Celecoxib (Celebrex)',
          class: 'COX-2 selective inhibitor',
          howItCompares:
            'In PRECISION, at a mean 209 mg daily against ibuprofen’s mean 2,045 mg daily, celecoxib produced significantly fewer gastrointestinal events (p=0.002) and significantly fewer renal events (p=0.004) than ibuprofen, and was non-inferior on the cardiovascular composite. The dose comparison is not symmetrical and the result should be read with that in mind.',
          typicalCost:
            'US$0.0760 per capsule at United States pharmacy acquisition cost (CMS NADAC, median across 112 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: fewer measured gastrointestinal and renal events at the doses compared; does not interfere with aspirin. Cons: same boxed cardiovascular warning; the drug’s own foundational publication understated its gastrointestinal risk, which is on the celecoxib page.',
        },
        {
          name: 'Topical NSAID (diclofenac gel or solution)',
          class: 'Cyclooxygenase inhibitor applied to the skin over the joint',
          howItCompares:
            'Delivers the same enzyme block to a superficial joint with a small fraction of the plasma concentration, which is why it is the only NSAID formulation available over the counter in the United States for arthritis without the systemic warnings dominating the label. It is useless for anything deeper than a hand, knee or elbow.',
          typicalCost:
            'US$0.0829 per gram of diclofenac sodium at United States pharmacy acquisition cost (CMS NADAC, median across 149 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: much lower systemic exposure; no useful role for the aspirin interaction to play at these concentrations. Cons: only reaches joints close to the skin; local skin reactions are common.',
        },
        {
          name: 'Paracetamol / acetaminophen',
          class:
            'Analgesic and antipyretic of unresolved mechanism, negligible anti-inflammatory effect',
          howItCompares:
            'Weaker, and for two of the commonest reasons people reach for ibuprofen it is measurably no better than placebo: high-quality evidence found a weighted mean difference of -0.5 points on a 100-point pain scale in low back pain. Its advantage is that it does not touch the stomach, the kidney or the platelet.',
          typicalCost:
            'US$0.0349 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 170 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: no gastrointestinal, renal or antiplatelet effect; safe in aspirin-sensitive asthma. Cons: ineffective in low back pain and barely effective in osteoarthritis on randomised data; the leading single cause of acute liver failure in the United States and the United Kingdom.',
        },
      ],
      naturalFoods: [
        {
          name: 'Ginger (Zingiber officinale) as a standardised oral extract',
          activeCompound: 'Gingerols and shogaols',
          biologicalMechanism:
            'Gingerols inhibit cyclooxygenase and 5-lipoxygenase in vitro, which is the same enzyme family ibuprofen acts on, at concentrations far above those reached by dietary intake.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: the meta-analysis pooling five randomised placebo-controlled trials in 593 osteoarthritis patients found a standardised mean difference in pain of -0.30 (95% CI -0.50 to -0.09, p=0.005) and in disability of -0.22 (-0.39 to -0.04, p=0.01) — a real but small effect, from short trials, with more withdrawals for adverse events than placebo.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'If you take low-dose aspirin for your heart, the order matters — and it may not be enough',
          action:
            'Say so before any regular ibuprofen is started, and ask whether a different analgesic is appropriate.',
          patientImpact:
            'The prescription label states that pharmacodynamic studies demonstrated interference with the antiplatelet activity of aspirin when ibuprofen 400 mg three times daily was given with enteric-coated low-dose aspirin, and that the interaction exists even on a once-daily ibuprofen regimen, particularly when ibuprofen is dosed before aspirin.',
          clinicalPrecaution:
            'The label says the interaction is alleviated if immediate-release low-dose aspirin is taken at least two hours before a once-daily ibuprofen regimen, and states explicitly that this finding cannot be extended to enteric-coated low-dose aspirin. It directs prescribers to consider an NSAID that does not interfere with aspirin, or a non-NSAID analgesic.',
        },
        {
          name: 'Do not treat "with food" as protection',
          action: 'Take it as the label directs, and do not assume a meal has removed the risk.',
          patientImpact:
            'Food slows absorption and reduces immediate stomach upset. The ulcer and bleeding risk in the boxed warning comes from systemic prostaglandin suppression reaching the mucosa through the bloodstream, not from the tablet touching the stomach wall, and food does not undo it.',
          clinicalPrecaution:
            'The boxed warning states that serious gastrointestinal events can occur at any time during use and without warning symptoms, and that elderly patients are at greater risk.',
        },
        {
          name: 'Watch fluid status, not just the dose',
          action:
            'Mention any diuretic, ACE inhibitor or angiotensin receptor blocker, and any illness with vomiting, diarrhoea or poor intake.',
          patientImpact:
            'Prostaglandins maintain renal blood flow precisely when perfusion pressure is low. In PRECISION, renal events were significantly more common on ibuprofen than on celecoxib (p=0.004), and the label records that ibuprofen reduces the natriuretic effect of furosemide and thiazides.',
          clinicalPrecaution:
            'The label directs close observation for signs of renal failure during concomitant NSAID and diuretic therapy, and notes that NSAIDs may diminish the antihypertensive effect of ACE inhibitors.',
        },
        {
          name: 'Aspirin-sensitive asthma is an absolute stop',
          action: 'Report any history of wheeze, urticaria or nasal polyps after aspirin.',
          patientImpact:
            'The label states that the use of aspirin in patients with aspirin-sensitive asthma has been associated with severe bronchospasm which can be fatal, and that cross-reactivity including bronchospasm between aspirin and NSAIDs has been reported in such patients.',
          clinicalPrecaution:
            'The label directs that ibuprofen should not be administered to patients with this form of aspirin sensitivity and should be used with caution in patients with pre-existing asthma.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(C)CC1=CC=C(C=C1)C(C)C(=O)O',
      chemicalFormula: 'C13H18O2',
      molecularWeight: '206.28 g/mol',
      targetReceptorAffinity:
        'A 2-arylpropionic acid with one stereocentre, marketed as the racemate. Cyclooxygenase inhibition resides almost entirely in the S-(+) enantiomer; the R-(-) enantiomer is largely inactive at the enzyme but is converted to the S form in vivo by a unidirectional acyl-CoA thioester racemase pathway, so a racemic dose behaves as more than half an active dose. Inhibition is competitive and reversible — the drug occupies the hydrophobic channel above the catalytic tyrosine and then leaves — which is the single structural fact that explains both its short duration and its ability to block aspirin from reaching the serine it must acetylate. Plasma protein binding exceeds 99%.',
      structureSource: {
        label:
          'PubChem CID 3672 (ibuprofen) — canonical SMILES, molecular formula and weight, as carried on the enriched record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3672',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ibu-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Establish enantiomeric ratio and identify the 4-isobutylacetophenone impurity',
          description:
            'Racemic ibuprofen is a 50:50 mixture and the release specification is on the racemate, not on the active enantiomer. The synthesis intermediate 4-isobutylacetophenone is the impurity that matters and must be quantified separately from the drug itself; it is not detected by a method optimised for the acid.',
          reagentsAndBuffer:
            'Ibuprofen reference standard, chiral HPLC on an amylose or cellulose stationary phase, achiral reverse-phase HPLC with ultraviolet detection at 264 nm for the acetophenone impurity, Karl Fischer titration for water content',
        },
        {
          id: 'ibu-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Friedel-Crafts acylation then carbonylation of isobutylbenzene',
          description:
            'The industrial route is three steps: acylate isobutylbenzene to 4-isobutylacetophenone, hydrogenate the ketone to the secondary alcohol, then carbonylate the alcohol with carbon monoxide over a palladium catalyst to install the propionic acid. It replaced a six-step stoichiometric route and is the reason a tablet costs pennies. It produces the racemate; no step sets the stereocentre.',
          dependsOnStepId: 'ibu-w1',
          reagentsAndBuffer:
            'Isobutylbenzene, acetic anhydride with hydrogen fluoride as catalyst and solvent, Raney nickel under hydrogen for the ketone reduction, carbon monoxide with a palladium-phosphine catalyst under pressure, corrosion-resistant reactors',
        },
        {
          id: 'ibu-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallise the free acid and control polymorph and particle size',
          description:
            'Ibuprofen free acid melts at about 76 °C, which is low enough that milling can melt it and low enough that a compressed tablet can stick to punches. Crystallisation solvent and cooling profile set the habit, and the habit sets whether the material can be tabletted at all.',
          dependsOnStepId: 'ibu-w2',
          reagentsAndBuffer:
            'Recrystallisation from heptane or aqueous methanol, controlled cooling ramp, differential scanning calorimetry to confirm melting endotherm, laser diffraction particle sizing, X-ray powder diffraction',
        },
        {
          id: 'ibu-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Measure COX-1 against COX-2 inhibition in whole human blood, not on isolated enzyme',
          description:
            'Selectivity ratios measured on purified enzyme do not predict what happens in a person, because plasma protein binding above 99% changes the free concentration by two orders of magnitude. The whole-blood assay — serum thromboxane B2 for COX-1 in clotting platelets, lipopolysaccharide-stimulated prostaglandin E2 for COX-2 in monocytes — is the assay that reproduces the clinical ratio.',
          dependsOnStepId: 'ibu-w3',
          reagentsAndBuffer:
            'Fresh heparinised and non-anticoagulated human whole blood, lipopolysaccharide from E. coli, aspirin-free donors, thromboxane B2 and prostaglandin E2 immunoassay kits, racemic and resolved S-(+) ibuprofen as separate test articles',
        },
        {
          id: 'ibu-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Test the aspirin interaction directly, in the order a patient would take them',
          description:
            'The clinically important interaction is not a plasma-level effect and cannot be found in a pharmacokinetic study. It is competitive occupancy of the COX-1 channel that denies aspirin access to Ser-529, and the only assay that detects it is serum thromboxane B2 and platelet aggregation measured after both drugs, in both sequences, on repeated dosing.',
          dependsOnStepId: 'ibu-w4',
          reagentsAndBuffer:
            'Healthy volunteers on 81 mg immediate-release and enteric-coated aspirin, ibuprofen 400 mg once and three times daily, crossover with a two-hour separation in each direction, serum thromboxane B2 immunoassay, arachidonic-acid-induced platelet aggregometry',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ibu-a1',
        category: 'measured',
        title: 'The single-dose analgesic effect is one of the best-quantified numbers in medicine',
        laymanSummary:
          'In pooled randomised trials, 52% of people with post-surgical pain got at least half their pain relieved by a single 400 mg ibuprofen tablet. On placebo the figure was 7%.',
        technicalDetails:
          'The Cochrane review of single-dose oral ibuprofen plus paracetamol for acute postoperative pain pooled three studies in 1,647 participants and reported, in the arm comparisons it made, that 52% of participants given ibuprofen 400 mg alone achieved at least 50% of maximum pain relief over six hours, against 7% on placebo. Adding paracetamol 1000 mg raised that to 73%, giving a number needed to treat against placebo of 1.5 (95% CI 1.4 to 1.7) for the combination and 5.4 (3.5 to 12) for the combination against ibuprofen alone. Median time to rescue medication was 8.3 hours for the higher combination dose. A number needed to treat of 1.5 is among the lowest recorded for any drug against any endpoint; the endpoint is a self-reported pain score over six hours in mostly dental-extraction models, and it says nothing about weeks of arthritis or about anything structural.',
        evidenceSource:
          'Derry CJ, Derry S, Moore RA. Single dose oral ibuprofen plus paracetamol (acetaminophen) for acute postoperative pain. Cochrane Database Syst Rev 2013;(6):CD010210',
        doi: '10.1002/14651858.CD010210.pub2',
        measuredMetric:
          'Proportion achieving at least 50% of maximum pain relief over six hours, and the derived number needed to treat',
        auditFlag: 'verified',
      },
      {
        id: 'ibu-a2',
        category: 'failed',
        title: 'Ibuprofen cancels the aspirin a heart patient is taking, and the label says so',
        laymanSummary:
          'Low-dose aspirin works by permanently disabling an enzyme inside platelets. Ibuprofen sits in the same slot without disabling anything, and while it is there aspirin cannot get in. Take the ibuprofen first and the aspirin does nothing that day.',
        technicalDetails:
          'Aspirin acetylates Ser-529 of platelet COX-1 irreversibly; because a platelet has no nucleus it cannot make new enzyme, which is why 81 mg once daily suffices for a week-long effect. Ibuprofen occupies the same channel competitively and reversibly, and while it is bound the acetylation cannot occur. In the controlled crossover study, inhibition of serum thromboxane B2 formation and of platelet aggregation by aspirin was blocked when a single daily dose of ibuprofen preceded aspirin and when multiple daily doses of ibuprofen were given; rofecoxib, acetaminophen and delayed-release diclofenac given concomitantly did not affect aspirin pharmacodynamics. The prescription ibuprofen label carries this: pharmacodynamic studies demonstrated interference with the antiplatelet activity of aspirin at ibuprofen 400 mg three times daily with enteric-coated low-dose aspirin, the interaction exists even with once-daily ibuprofen, it is alleviated by taking immediate-release aspirin at least two hours before ibuprofen, and — the sentence that matters — this finding cannot be extended to enteric-coated low-dose aspirin. The label directs that a patient on cardioprotective aspirin who needs an analgesic should be considered for an NSAID that does not interfere, or a non-NSAID.',
        evidenceSource:
          'Catella-Lawson F, Reilly MP, Kapoor SC, et al. Cyclooxygenase inhibitors and the antiplatelet effects of aspirin. N Engl J Med 2001;345:1809-1817; ibuprofen tablets United States prescribing information, Drug Interactions section (openFDA label endpoint, ANDA 202413)',
        doi: '10.1056/NEJMoa003199',
        measuredMetric:
          'Serum thromboxane B2 suppression and arachidonate-induced platelet aggregation after aspirin, with and without preceding ibuprofen',
        auditFlag: 'caution',
      },
      {
        id: 'ibu-a3',
        category: 'inferred',
        title: 'Over-the-counter is a regulatory category, not a safety measurement',
        laymanSummary:
          'Ibuprofen sits next to the sweets because a short course at a low dose is unusually safe. In randomised trials at arthritis doses it more than doubled major coronary events and nearly quadrupled serious gastric bleeding, and the risk of a heart attack was measurable within the first week of taking it.',
        technicalDetails:
          'The CNT individual-participant meta-analysis of 280 placebo-controlled trials (124,513 participants) found that high-dose ibuprofen significantly increased major coronary events — non-fatal myocardial infarction or coronary death — with a rate ratio of 2.22 (95% CI 1.10 to 4.48, p=0.0253), while the broader composite of major vascular events did not reach significance (1.44, 0.89 to 2.33). Upper gastrointestinal complications rose 3.97-fold (2.22 to 7.10, p<0.0001), the second highest in the analysis after naproxen. Heart failure risk was roughly doubled by all NSAID regimens studied. Separately, the Bayesian individual-patient meta-analysis of 446,763 people including 61,460 with acute myocardial infarction found that one to seven days of ibuprofen carried an odds ratio for first myocardial infarction of 1.48 (95% credible interval 1.00 to 2.26), with a 97% posterior probability of an odds ratio above 1.0 — the risk was greatest in the first month of use, not after prolonged exposure. The over-the-counter dose is lower than the doses in these analyses and the exposure is usually shorter; that is a reason to expect a smaller effect, and it is not the same thing as having measured one.',
        evidenceSource:
          'CNT Collaboration, Lancet 2013;382:769-779; Bally M, Dendukuri N, Rich B, et al. Risk of acute myocardial infarction with NSAIDs in real world use: bayesian meta-analysis of individual patient data. BMJ 2017;357:j1909',
        doi: '10.1016/S0140-6736(13)60900-9',
        inferredClaim:
          'That the doses and durations people actually buy over the counter carry a risk small enough to disregard — plausible, extrapolated downward from trials run at higher doses, and not itself the subject of an outcome trial',
        auditFlag: 'caution',
      },
      {
        id: 'ibu-a4',
        category: 'measured',
        title: 'PRECISION: ibuprofen lost to celecoxib on the stomach and the kidney',
        laymanSummary:
          'A 24,081-person trial ran ibuprofen, naproxen and celecoxib head to head in arthritis patients at raised cardiac risk for an average of nearly three years. On heart events the three were statistically indistinguishable. On stomach and kidney events ibuprofen came off worst.',
        technicalDetails:
          'PRECISION randomised 24,081 patients with osteoarthritis or rheumatoid arthritis and increased cardiovascular risk to celecoxib (mean daily dose 209±37 mg), naproxen (852±103 mg) or ibuprofen (2,045±246 mg), treated for a mean 20.3±16.0 months and followed a mean 34.1±13.4 months. In the intention-to-treat analysis the primary composite of cardiovascular death, non-fatal myocardial infarction or non-fatal stroke occurred in 2.3% on celecoxib, 2.5% on naproxen and 2.7% on ibuprofen; hazard ratio for celecoxib against ibuprofen 0.85 (95% CI 0.70 to 1.04), against naproxen 0.93 (0.76 to 1.13), both meeting non-inferiority at p<0.001. Gastrointestinal events were significantly lower with celecoxib than with ibuprofen (p=0.002) and than with naproxen (p=0.01); renal events were significantly lower with celecoxib than with ibuprofen (p=0.004) but not significantly lower than with naproxen (p=0.19). The trial is the largest randomised comparison these three molecules will ever have.',
        evidenceSource:
          'Nissen SE, Yeomans ND, Solomon DH, et al. Cardiovascular Safety of Celecoxib, Naproxen, or Ibuprofen for Arthritis. N Engl J Med 2016;375:2519-2529 (NCT00346216)',
        doi: '10.1056/NEJMoa1611593',
        measuredMetric:
          'Adjudicated cardiovascular composite, gastrointestinal events and renal events across 24,081 randomised patients',
        auditFlag: 'verified',
      },
      {
        id: 'ibu-a5',
        category: 'conclusion_shift',
        title: 'The doses in PRECISION were not comparable, and that cuts both ways',
        laymanSummary:
          'Celecoxib was given at roughly its lowest useful dose and ibuprofen at close to its highest. Any conclusion that celecoxib is the safer drug has to survive that, and any conclusion that ibuprofen is the more dangerous one has to survive it too.',
        technicalDetails:
          'The mean daily doses achieved were celecoxib 209 mg, naproxen 852 mg and ibuprofen 2,045 mg. Celecoxib was capped at 200 mg daily for osteoarthritis patients — the low end of its licensed range — while ibuprofen ran near its maximum. Two further features constrain what the trial can be asked: 68.8% of patients stopped taking the study drug during the trial and 27.4% discontinued follow-up altogether, which is the highest attrition of any cardiovascular outcome trial of this size, and non-inferiority under that much drop-out biases toward the null. The honest reading is narrow: at these doses, over this duration, in this population, celecoxib was not worse on cardiovascular events and was better on gastrointestinal and renal ones. Read as a general statement that COX-2 selectivity is cardiovascularly safe, or that ibuprofen is uniquely dangerous, the trial does not support either.',
        evidenceSource:
          'Nissen SE et al., N Engl J Med 2016;375:2519-2529, Results section — achieved doses, 68.8% study-drug discontinuation and 27.4% loss to follow-up as reported in the abstract',
        doi: '10.1056/NEJMoa1611593',
        inferredClaim:
          'That PRECISION established a general ranking of NSAID cardiovascular safety — an extrapolation from one dose pairing, with two-thirds of participants off study drug, to the whole class at all doses',
        auditFlag: 'contested',
      },
      {
        id: 'ibu-a6',
        category: 'failed',
        title:
          'It raises blood pressure, and in a quarter of normotensive users it makes them hypertensive',
        laymanSummary:
          'A 444-person substudy fitted arthritis patients with 24-hour blood pressure monitors. Ibuprofen raised average daytime-and-night systolic pressure by 3.7 mmHg, and 23% of those who started with normal pressure ended the four months hypertensive.',
        technicalDetails:
          'PRECISION-ABPM randomised 444 patients (mean age 62±10, 54% female, 92% osteoarthritis) with or at increased risk of coronary artery disease to celecoxib 100-200 mg twice daily, ibuprofen 600-800 mg three times daily or naproxen 375-500 mg twice daily with matching placebos, and measured 24-hour ambulatory blood pressure at four months. Change in mean 24-hour systolic pressure was -0.3 mmHg (95% CI -2.25 to 1.74) on celecoxib, +3.7 mmHg (1.72 to 5.58) on ibuprofen and +1.6 mmHg (-0.40 to 3.57) on naproxen, a celecoxib-to-ibuprofen difference of -3.9 mmHg (p=0.0009). Among patients with normal baseline pressure, the proportion developing hypertension by 24-hour criteria was 23.2% on ibuprofen, 19.0% on naproxen and 10.3% on celecoxib (odds ratio 0.39 against ibuprofen, p=0.004). This is the mechanism by which an analgesic taken for a knee shows up as a cardiovascular event three years later, and it is invisible to a clinic cuff reading.',
        evidenceSource:
          'Ruschitzka F, Borer JS, Krum H, et al. Differential blood pressure effects of ibuprofen, naproxen, and celecoxib in patients with arthritis: the PRECISION-ABPM trial. Eur Heart J 2017;38:3282-3292',
        doi: '10.1093/eurheartj/ehx508',
        measuredMetric:
          'Change in 24-hour ambulatory systolic blood pressure at four months, and incident hypertension among normotensive patients',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Half the tablet becomes the other half',
        laymanDesc:
          'The tablet contains equal amounts of two mirror-image forms. Only one blocks the enzyme — but the body converts a large part of the inactive one into the active one, so a racemic dose delivers more than half a dose.',
        molecularDetail:
          'Racemic 2-(4-isobutylphenyl)propionic acid. Cyclooxygenase inhibition resides in the S-(+) enantiomer. The R-(-) enantiomer undergoes unidirectional chiral inversion through an acyl-CoA thioester intermediate; the reverse conversion does not occur. Plasma protein binding exceeds 99%, so free drug concentration, not total, determines enzyme occupancy.',
        iconName: 'Split',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It plugs the channel rather than breaking the enzyme',
        laymanDesc:
          'Ibuprofen slides into a narrow tunnel in the enzyme and physically blocks the way through. It does not damage the enzyme, and it leaves again after a few hours — which is why the effect wears off, and why the enzyme is still there afterwards.',
        molecularDetail:
          'Competitive, reversible occupancy of the hydrophobic cyclooxygenase channel of PTGS1 and PTGS2 above Tyr-385, preventing arachidonic acid from reaching the catalytic site. Contrast aspirin, which acetylates Ser-529 covalently and permanently. The reversibility is the entire basis of both the short duration of action and the aspirin interaction.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'Less prostaglandin means the same injury hurts less',
        laymanDesc:
          'Prostaglandins do not create pain themselves; they lower the threshold at which pain nerves fire and let blood vessels leak. Cut the supply and the injury is unchanged but the signal it sends is smaller.',
        molecularDetail:
          'Blocking the conversion of arachidonic acid to prostaglandin G2 and then H2 removes the substrate for PGE2 and PGI2 synthesis. The label states that prostaglandins sensitise afferent nerves and potentiate the action of bradykinin in inducing pain, and are mediators of inflammation, and that ibuprofen’s mode of action may be due to a decrease of prostaglandins in peripheral tissues.',
        iconName: 'Activity',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'The same block reaches the stomach, the kidney and the platelet',
        laymanDesc:
          'The enzyme is not only in the sore knee. It maintains the stomach’s protective mucus, keeps the kidney’s filtering pressure up when the body is short of fluid, and makes the clotting signal inside platelets. All three are suppressed by the same tablet.',
        molecularDetail:
          'COX-1-derived PGE2 and PGI2 maintain gastric mucosal bicarbonate and mucus and gastric mucosal blood flow; renal prostaglandins preserve afferent arteriolar tone under low-perfusion states; platelet COX-1 generates thromboxane A2. In the CNT analysis, upper gastrointestinal complications rose 3.97-fold on high-dose ibuprofen and heart failure risk roughly doubled across all NSAID regimens.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
      {
        step: 5,
        title: 'And it occupies the slot aspirin needs',
        laymanDesc:
          'A heart patient’s low-dose aspirin works by permanently disabling the platelet enzyme. If ibuprofen is sitting in the tunnel when the aspirin arrives, the aspirin passes through the bloodstream and out again, having done nothing.',
        molecularDetail:
          'Aspirin must reach Ser-529 within the same channel ibuprofen occupies. In the crossover study, ibuprofen given before aspirin — once or three times daily — abolished aspirin’s suppression of serum thromboxane B2 and of platelet aggregation, while rofecoxib, acetaminophen and delayed-release diclofenac did not. The label states the interaction is not alleviated by two-hour separation when the aspirin is enteric-coated.',
        iconName: 'Ban',
        visualStage: 'cellular_entry',
      },
      {
        step: 6,
        title: 'What has been measured, and what has not',
        laymanDesc:
          'Measured: a single 400 mg dose halves pain for about half of people, against 7% on placebo. Measured: it raises 24-hour blood pressure by 3.7 mmHg. Not measured: whether the over-the-counter pattern of use — a few tablets, a few days — carries any of the risk found at arthritis doses.',
        molecularDetail:
          'Efficacy: 52% reaching at least 50% maximum pain relief on 400 mg against 7% on placebo (Cochrane CD010210). Harm at arthritis doses: major coronary events RR 2.22 (1.10 to 4.48), upper gastrointestinal complications RR 3.97 (2.22 to 7.10) in CNT; 24-hour systolic pressure +3.7 mmHg and 23.2% incident hypertension in PRECISION-ABPM. No randomised outcome trial has been run at over-the-counter doses and durations.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'NCT00346216 (PRECISION)',
        phase: 'Phase 4, randomised, double-blind, active-controlled non-inferiority',
        sampleSize: 24081,
        primaryEndpoint:
          'Antiplatelet Trialists Collaboration composite of cardiovascular death, non-fatal myocardial infarction or non-fatal stroke, adjudicated by a clinical events committee',
        endpointMet: true,
        statisticalPValue:
          'Ibuprofen 2.7%, naproxen 2.5%, celecoxib 2.3% in the intention-to-treat analysis; hazard ratio celecoxib against ibuprofen 0.85 (95% CI 0.70 to 1.04), p<0.001 for non-inferiority. Gastrointestinal events lower on celecoxib than ibuprofen (p=0.002); renal events lower on celecoxib than ibuprofen (p=0.004)',
        unreportedAdverseSignals:
          'Mean achieved doses were asymmetric: celecoxib 209±37 mg daily against ibuprofen 2,045±246 mg daily. 68.8% of patients stopped taking study drug and 27.4% discontinued follow-up entirely, which biases a non-inferiority comparison toward the null.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'PRECISION-ABPM (Eur Heart J 2017;38:3282-3292)',
        phase: 'Phase 4 substudy, randomised, double-blind, double-dummy',
        sampleSize: 444,
        primaryEndpoint: 'Change in mean 24-hour ambulatory systolic blood pressure at four months',
        endpointMet: false,
        statisticalPValue:
          'Ibuprofen +3.7 mmHg (95% CI 1.72 to 5.58) against celecoxib -0.3 mmHg (-2.25 to 1.74); difference -3.9 mmHg, p=0.0009. Incident hypertension among normotensive patients 23.2% on ibuprofen against 10.3% on celecoxib (odds ratio 0.39, p=0.004)',
        unreportedAdverseSignals:
          'The endpoint is a surrogate. A 3.7 mmHg rise in 24-hour systolic pressure is the size of effect that a first-line antihypertensive is licensed to reverse, but the substudy was not powered for any clinical event.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '52% of postoperative patients achieved at least 50% of maximum pain relief over six hours on a single 400 mg dose, against 7% on placebo (Cochrane CD010210)',
        'Major coronary events rate ratio 2.22 (95% CI 1.10 to 4.48) for high-dose ibuprofen against placebo in 280 randomised trials',
        'Upper gastrointestinal complications rate ratio 3.97 (2.22 to 7.10) for high-dose ibuprofen against placebo',
        'Significantly fewer gastrointestinal (p=0.002) and renal (p=0.004) events on celecoxib than on ibuprofen in 24,081 randomised patients',
        '24-hour ambulatory systolic pressure rose 3.7 mmHg on ibuprofen and fell 0.3 mmHg on celecoxib over four months',
        'Ibuprofen given before aspirin abolished aspirin’s suppression of serum thromboxane B2 and platelet aggregation, on single and multiple daily dosing',
      ],
      unsupportedInferences: [
        'That over-the-counter doses and durations carry a negligible share of the risk measured at arthritis doses — a downward extrapolation, never itself the subject of an outcome trial',
        'That PRECISION established a general ranking of NSAID cardiovascular safety, when celecoxib ran at a mean 209 mg and ibuprofen at a mean 2,045 mg',
        'That taking it with food protects the stomach, when the boxed warning describes systemic prostaglandin suppression reaching the mucosa through the bloodstream',
        'That separating ibuprofen and aspirin by two hours restores aspirin’s effect, which the label states cannot be extended to enteric-coated aspirin',
      ],
      whatFailedInitially: [
        'Ibuprofen antagonises the cardioprotective effect of low-dose aspirin — the label directs choosing a different analgesic rather than managing the timing',
        'Renal events were significantly more common on ibuprofen than on celecoxib in the head-to-head trial',
        '23.2% of normotensive arthritis patients on ibuprofen became hypertensive by ambulatory criteria within four months',
        'Heart failure risk was roughly doubled by every NSAID regimen studied in the individual-participant meta-analysis, ibuprofen included',
        'Cross-reactive bronchospasm with aspirin-sensitive asthma has been fatal, and the label bars use in those patients',
      ],
      realWorldOutcome: [
        'Approved in the United States in 1974 under NDA 017463 and available over the counter since 1984; on the WHO Model List of Essential Medicines',
        'Under four United States cents per tablet at pharmacy acquisition cost, across 244 listed generic products — one of the few medicines priced close to what it costs to make',
        'The FDA required all prescription NSAID labels to carry a boxed cardiovascular thrombotic warning, and over-the-counter Drug Facts labels to carry heart attack and stroke information',
        'The three-step palladium carbonylation route that replaced the original six-step synthesis is a standard teaching example of atom economy, and is why the price is what it is',
      ],
    },
    deliverySystem: {
      type: 'Oral tablets, capsules, chewables and suspensions; also an intravenous formulation (Caldolor) and a topical formulation outside the United States',
      description:
        'Rapidly and almost completely absorbed after oral dosing, with peak plasma concentration typically within one to two hours; food slows the rate of absorption without much reducing the extent. Plasma half-life is about two hours, which is why analgesic dosing is every four to six hours and why the aspirin interaction depends on timing. Metabolism is oxidative, principally by CYP2C9, with negligible unchanged renal excretion.',
      safetyProfile:
        'Boxed warning on prescription products for cardiovascular thrombotic events including fatal myocardial infarction and stroke, with risk that may occur early in treatment, and for gastrointestinal bleeding, ulceration and perforation that can occur at any time and without warning symptoms; elderly patients are at greater risk. Contraindicated in the setting of coronary artery bypass graft surgery. Should not be given to patients with aspirin-sensitive asthma because of cross-reactive bronchospasm which can be fatal. Interferes with the antiplatelet activity of low-dose aspirin. Reduces the natriuretic effect of furosemide and thiazides, may diminish the antihypertensive effect of ACE inhibitors, raises plasma lithium concentrations, and acts synergistically with warfarin on gastrointestinal bleeding risk.',
    },
    commonQuestions: [
      {
        q: 'I take a baby aspirin for my heart. Is ibuprofen a problem?',
        a: 'Yes, and this is the clearest single interaction on the ibuprofen label. Low-dose aspirin works by permanently acetylating an enzyme inside platelets, which have no nucleus and cannot replace it. Ibuprofen occupies the same channel reversibly, and while it is there the aspirin cannot reach its target — so the aspirin is metabolised away having done nothing. In the controlled study, ibuprofen taken before aspirin, either once or three times a day, abolished aspirin’s effect on platelet aggregation, while acetaminophen, rofecoxib and delayed-release diclofenac did not. The label says the interaction is alleviated by taking immediate-release aspirin at least two hours before a once-daily ibuprofen regimen — and states that this cannot be extended to enteric-coated aspirin, which is the form most people are given. Its own recommendation is to consider a different analgesic.',
        auditNote:
          'This is not a theoretical interaction inferred from a mechanism. It was measured directly as loss of thromboxane suppression and loss of platelet aggregation inhibition, and the regulator put it in the label.',
      },
      {
        q: 'Does taking it with food protect my stomach?',
        a: 'It reduces immediate indigestion; there is no good reason to think it prevents the ulcer. The bleeding and perforation in the boxed warning are caused by prostaglandin suppression in the stomach lining delivered through the bloodstream, not by the tablet resting against the mucosa — which is why intravenous and rectal NSAIDs cause ulcers too. The warning states that these events can occur at any time during use and without warning symptoms, and that elderly patients are at greater risk. Anything genuinely protective works by a different route.',
      },
      {
        q: 'How much better is ibuprofen than paracetamol?',
        a: 'For short-term pain, clearly better, and the two together are better than either. Pooled randomised data put 52% of postoperative patients at half their pain or less on a single 400 mg ibuprofen dose against 7% on placebo, and the combination of ibuprofen 400 mg with paracetamol 1000 mg at 73%, a number needed to treat of 1.5 against placebo. For chronic use the picture reverses in importance: paracetamol does not touch the stomach, the kidney or the platelet, and for low back pain high-quality evidence found it no better than placebo at all. The choice is not really about which is stronger.',
      },
      {
        q: 'Is it safe if I only take it occasionally?',
        a: 'Almost certainly safer than the trials suggest, and nobody has measured it. The alarming numbers — a 2.22-fold rise in major coronary events, a 3.97-fold rise in serious gastric bleeding — come from randomised trials at arthritis doses over months. The real-world myocardial infarction analysis of 446,763 people found the risk was highest in the first month of use rather than after prolonged exposure, and rose with dose, which cuts in both directions for occasional use. What is clear: if you are dehydrated, on a diuretic or an ACE inhibitor, over 65, on warfarin, or taking cardioprotective aspirin, the occasional tablet is not a neutral act.',
        auditNote:
          'No randomised outcome trial has ever been run at over-the-counter doses and durations. The safety of that pattern of use is an extrapolation, and a reasonable one, but it is an extrapolation.',
      },
      {
        q: 'Why does it wear off in a few hours when aspirin lasts for days?',
        a: 'Because of how each one binds. Aspirin chemically attaches an acetyl group to the enzyme and destroys it; a platelet cannot build a new one, so aspirin’s antiplatelet effect lasts the platelet’s lifespan of roughly a week. Ibuprofen just sits in the enzyme’s channel and then leaves, and its plasma half-life is about two hours. That single structural difference explains the four-to-six-hour dosing interval, the fact that ibuprofen is not used for heart protection, and the reason it blocks aspirin from working.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      PRECISION_SOURCE,
      CNT_SOURCE,
      {
        label:
          'Catella-Lawson F, Reilly MP, Kapoor SC, et al. Cyclooxygenase inhibitors and the antiplatelet effects of aspirin. N Engl J Med 2001;345:1809-1817',
        identifier: '10.1056/NEJMoa003199',
        kind: 'doi',
      },
      {
        label:
          'Derry CJ, Derry S, Moore RA. Single dose oral ibuprofen plus paracetamol (acetaminophen) for acute postoperative pain. Cochrane Database Syst Rev 2013;(6):CD010210',
        identifier: '10.1002/14651858.CD010210.pub2',
        kind: 'doi',
      },
      {
        label:
          'Ruschitzka F, Borer JS, Krum H, et al. Differential blood pressure effects of ibuprofen, naproxen, and celecoxib in patients with arthritis: PRECISION-ABPM. Eur Heart J 2017;38:3282-3292',
        identifier: '10.1093/eurheartj/ehx508',
        kind: 'doi',
      },
      {
        label:
          'Bally M, Dendukuri N, Rich B, et al. Risk of acute myocardial infarction with NSAIDs in real world use: bayesian meta-analysis of individual patient data. BMJ 2017;357:j1909',
        identifier: '10.1136/bmj.j1909',
        kind: 'doi',
      },
      {
        label:
          'Bartels EM, Folmer VN, Bliddal H, et al. Efficacy and safety of ginger in osteoarthritis patients: a meta-analysis of randomized placebo-controlled trials. Osteoarthritis Cartilage 2015;23:13-21',
        identifier: '10.1016/j.joca.2014.09.024',
        kind: 'doi',
      },
      {
        label:
          'PRECISION trial registration — Prospective Randomized Evaluation of Celecoxib Integrated Safety versus Ibuprofen Or Naproxen, 24,081 participants',
        identifier: 'NCT00346216',
        kind: 'nct',
      },
      {
        label:
          'MOTRIN (ibuprofen) Drugs@FDA application record, NDA 017463 — approval history and labelling',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=017463',
        kind: 'regulatory',
      },
      {
        label:
          'Ibuprofen tablets United States prescribing information — boxed warning and Drug Interactions section, retrieved from the openFDA drug label endpoint (ANDA 202413 and ANDA 213794)',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22IBUPROFEN%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 3672 (ibuprofen) — structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3672',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 2. Naproxen — the NSAID with a reputation for being kind to the heart, built on an indirect
  //    comparison an FDA advisory committee voted 16-9 not to put in the label.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'naproxen',
    name: 'Naproxen',
    tradeName: 'Naprosyn, Anaprox, Aleve, Naprelan',
    sponsor:
      'Developed at Syntex; United States NDA 017581 (NAPROSYN) and NDA 018164 (ANAPROX) now held by Atnahs Pharma US, and NDA 020204 (ALEVE, over-the-counter naproxen sodium) by Bayer; generic and made by many manufacturers',
    targetGene: 'PTGS1 and PTGS2',
    targetProtein:
      'Prostaglandin-endoperoxide synthase 1 and 2 (cyclooxygenase-1 and cyclooxygenase-2), inhibited reversibly and non-selectively by the single S-(+) enantiomer',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1976,
    indication:
      'Relief of the signs and symptoms of rheumatoid arthritis, osteoarthritis, ankylosing spondylitis, polyarticular juvenile idiopathic arthritis, tendonitis, bursitis and acute gout; relief of mild to moderate pain and of primary dysmenorrhoea; over-the-counter as naproxen sodium for temporary relief of minor aches and pains and for reduction of fever',
    patientFriendlyIndication: 'Pain, fever and inflammation, especially where it needs to last',
    anatomicalSite:
      'The cyclooxygenase channel of COX-1 and COX-2 in inflamed tissue, gastric mucosa, kidney and platelets — occupied for far longer than by any other common NSAID because of a 12-to-17-hour half-life',
    conditionContext: {
      conditionExplainer:
        'Naproxen does the same thing as ibuprofen — block the enzyme that makes prostaglandins — but stays in the body several times longer. That is why it is taken twice a day rather than four times, and why it also suppresses platelets for much longer.',
      whyItMatters:
        'Naproxen is the NSAID most often described as the safe one for the heart. That reputation rests on one genuine randomised finding — it was the only traditional NSAID in the individual-participant meta-analysis that did not significantly raise major vascular events — and on a great deal of indirect inference layered on top of it. In February 2014 an FDA advisory committee voted 16 to 9 that the data do not support a lower cardiovascular thrombotic risk for naproxen, and the label still does not say it.',
      whoTakesThis:
        'Adults and children with inflammatory arthritis or pain, and very large numbers of people buying naproxen sodium over the counter. Not people in the setting of coronary artery bypass graft surgery, and not people with aspirin-sensitive asthma.',
      clinicalGoals:
        'Less pain and stiffness, lasting most of a working day from one dose. No effect on disease progression, joint structure or survival has been shown.',
    },
    oneSentenceVerdict:
      'A long-acting non-selective cyclooxygenase inhibitor that relieves at least half of postoperative pain in enough patients to give a number needed to treat of 2.7, and is widely believed to be the heart-safe NSAID on the strength of a single non-significant randomised result — while the same meta-analysis gave it the highest upper gastrointestinal complication rate of the class at 4.22, a randomised prevention trial found a cardiovascular hazard ratio of 1.63, and its own label states it is not a substitute for low-dose aspirin.',
    laymanHowItWorks:
      'Naproxen blocks the two enzymes that turn a fatty acid released by injured tissue into prostaglandins — the messengers that make nerve endings fire more easily, blood vessels leak and the body raise its temperature. What separates it from ibuprofen is not the mechanism but the clock: naproxen stays in the blood for twelve to seventeen hours instead of two, so one dose covers most of a day. That long occupancy also means it holds platelets down for longer, which looks like heart protection and is in fact a bleeding risk, and its own label warns it is not a replacement for the aspirin that actually protects hearts.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 74,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0669 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 110 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States in 1976 under NDA 017581; naproxen sodium moved to over-the-counter status as ALEVE under NDA 020204 in 1994. Long off patent, on the WHO Model List of Essential Medicines, and about seven United States cents per tablet at acquisition cost — roughly 70% more than ibuprofen and still among the cheapest prescription drugs in existence.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Naproxen is usually chosen over ibuprofen for one of two reasons: it lasts longer, or it is believed to be kinder to the heart. The first is measured and true. The second is an inference an FDA advisory committee declined to endorse. What is measured is that naproxen has the worst upper gastrointestinal record of the common NSAIDs, which is precisely the trade the reader is making.',
      conventionalRx: [
        {
          name: 'Ibuprofen (Advil, Motrin)',
          class: 'Non-selective cyclooxygenase inhibitor, short half-life',
          howItCompares:
            'Faster on and faster off — a two-hour half-life against naproxen’s twelve to seventeen — so more doses per day but a shorter window of platelet suppression and a shorter window in which anything can go wrong. In the CNT meta-analysis it raised major coronary events 2.22-fold where naproxen did not significantly raise major vascular events; in the same analysis it caused slightly fewer upper gastrointestinal complications (3.97 against 4.22).',
          typicalCost:
            'US$0.0391 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 244 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: about 40% cheaper; shorter exposure; better evidence at over-the-counter doses. Cons: dosed three or four times daily; interferes with aspirin more clearly than naproxen does.',
        },
        {
          name: 'Celecoxib (Celebrex)',
          class: 'COX-2 selective inhibitor',
          howItCompares:
            'In the 24,081-patient head-to-head trial, celecoxib produced significantly fewer gastrointestinal events than naproxen (p=0.01) and was non-inferior on the cardiovascular composite (hazard ratio 0.93, 95% CI 0.76 to 1.13). Renal events were not significantly different between the two (p=0.19). If the reason for choosing naproxen is stomach safety, that reason does not survive the comparison.',
          typicalCost:
            'US$0.0760 per capsule at United States pharmacy acquisition cost (CMS NADAC, median across 112 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: measurably fewer gastrointestinal events; no antiplatelet effect and so no aspirin interaction. Cons: same boxed cardiovascular warning; more expensive; the trial that built its reputation understated its own risk.',
        },
        {
          name: 'Low-dose aspirin, where the goal is actually cardiac protection',
          class: 'Irreversible platelet COX-1 inhibitor',
          howItCompares:
            'Naproxen suppresses platelet thromboxane and is sometimes assumed to substitute for aspirin in someone who is taking both. The naproxen label states in terms that naproxen tablets and naproxen sodium tablets are not substitutes for low dose aspirin for cardiovascular protection, and describes a pharmacodynamic study in which naproxen interfered with aspirin’s antiplatelet effect, most markedly during naproxen’s washout.',
          typicalCost:
            'US$0.0164 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 68 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: the only one of these with randomised secondary-prevention outcome evidence. Cons: it is not an analgesic at that dose, and taking both together raises gastrointestinal bleeding above either alone.',
        },
      ],
      naturalFoods: [
        {
          name: 'Ginger (Zingiber officinale) as a standardised oral extract',
          activeCompound: 'Gingerols and shogaols',
          biologicalMechanism:
            'Gingerols inhibit cyclooxygenase and 5-lipoxygenase in vitro — the same enzyme family naproxen blocks — at concentrations well above those reached from food.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: five randomised placebo-controlled trials in 593 osteoarthritis patients pooled to a standardised mean difference in pain of -0.30 (95% CI -0.50 to -0.09, p=0.005). That is roughly a fifth to a quarter of the effect size an NSAID produces in the same setting, from short trials, with more withdrawals for adverse events than placebo.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'The long half-life is the whole story — treat it as such',
          action:
            'Do not top up with another NSAID because the naproxen "has not worked yet", and expect the effect to persist after you stop.',
          patientImpact:
            'Naproxen has an elimination half-life of roughly twelve to seventeen hours against ibuprofen’s two, so the drug and its effects on the stomach, the kidney and the platelet remain for a day or more after the last dose. The label describes an aspirin interaction that was most prominent during naproxen’s washout, on days 11 to 13 of a study.',
          clinicalPrecaution:
            'Two NSAIDs together give no more pain relief and multiply gastrointestinal risk. Controlled studies cited in the label found that combining an NSAID with analgesic doses of aspirin produced no greater therapeutic effect and significantly more gastrointestinal adverse reactions.',
        },
        {
          name: 'It is not your aspirin',
          action: 'Do not stop cardioprotective aspirin because you are taking naproxen.',
          patientImpact:
            'The label states plainly that naproxen tablets and naproxen sodium tablets are not substitutes for low dose aspirin for cardiovascular protection. Naproxen inhibits platelet COX-1 reversibly and incompletely; aspirin does so covalently and permanently, which is why 81 mg once daily is enough.',
          clinicalPrecaution:
            'The label goes further: because of the interference during naproxen’s washout, a patient on cardioprotective aspirin who needs intermittent analgesia should be considered for an NSAID that does not interfere with aspirin, or a non-NSAID analgesic.',
        },
        {
          name: 'Tell whoever prescribes about the water tablets and the blood pressure tablets',
          action:
            'Name every diuretic, ACE inhibitor, angiotensin receptor blocker and beta-blocker before starting.',
          patientImpact:
            'The label states that in patients who are elderly, volume-depleted or have renal impairment, co-administering an NSAID with an ACE inhibitor or ARB may cause deterioration of renal function including possible acute renal failure, and that NSAIDs reduce the natriuretic effect of loop and thiazide diuretics.',
          clinicalPrecaution:
            'It directs assessing renal function at the start of concomitant treatment and periodically after, and keeping the patient adequately hydrated.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C[C@@H](C1=CC2=C(C=C1)C=C(C=C2)OC)C(=O)O',
      chemicalFormula: 'C14H14O3',
      molecularWeight: '230.26 g/mol',
      targetReceptorAffinity:
        'Unlike ibuprofen, ketoprofen and flurbiprofen, naproxen is marketed as the single S-(+) enantiomer rather than the racemate — the stereocentre is set in the synthesis and not left to metabolism. Plasma protein binding exceeds 99%, absolute bioavailability is about 95%, and the elimination half-life of twelve to seventeen hours is the longest of the widely used non-selective NSAIDs. The sodium salt is the same molecule formulated for faster dissolution: 220 mg naproxen sodium contains 200 mg of naproxen, and 550 mg naproxen sodium is equivalent to 500 mg of naproxen.',
      structureSource: {
        label:
          'PubChem CID 156391 (naproxen, the S-(+) enantiomer) — canonical SMILES, molecular formula and weight, as carried on the enriched record; bioavailability and half-life from the naproxen prescribing information, section 12.3',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/156391',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'nap-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm enantiomeric purity, not just chemical purity',
          description:
            'Naproxen is one of the few arylpropionic acids sold as a single enantiomer. The R-enantiomer is an impurity, not a co-drug, and a routine achiral assay cannot see it — a batch can be 99.9% naproxen by mass and still carry a percentage point of the wrong hand.',
          reagentsAndBuffer:
            'Naproxen reference standard, chiral HPLC on a cellulose tris(3,5-dimethylphenylcarbamate) phase, optical rotation and circular dichroism confirmation, ultraviolet detection at 262 and 331 nm exploiting the naphthalene chromophore',
        },
        {
          id: 'nap-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Set the stereocentre during synthesis rather than after it',
          description:
            'The industrial routes build 6-methoxy-2-naphthalene and install the propionic acid asymmetrically — by asymmetric hydrogenation of a naphthylacrylic acid, or by resolution of a racemic intermediate with a chiral amine and recycling of the unwanted hand. Getting the stereochemistry from the reaction rather than from a final separation is what makes single-enantiomer naproxen economic at commodity prices.',
          dependsOnStepId: 'nap-w1',
          reagentsAndBuffer:
            '2-methoxynaphthalene, Friedel-Crafts acylation catalyst, chiral ruthenium-BINAP hydrogenation catalyst or a resolving amine such as cinchonidine or N-alkylglucamine, racemisation-recycle loop for the unwanted enantiomer',
        },
        {
          id: 'nap-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Isolate the acid and, separately, the sodium salt',
          description:
            'The free acid and the sodium salt are different products with different dissolution behaviour and different labels, and they are not interchangeable at the same milligram number: 220 mg of the sodium salt carries 200 mg of naproxen. Salt formation must be controlled for residual solvent, water content and polymorph.',
          dependsOnStepId: 'nap-w2',
          reagentsAndBuffer:
            'Recrystallisation from aqueous methanol or ethyl acetate, sodium hydroxide for salt formation with controlled stoichiometry, Karl Fischer titration, X-ray powder diffraction, dissolution testing in pH 1.2 and pH 6.8 media',
        },
        {
          id: 'nap-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Measure COX-1 and COX-2 inhibition in whole human blood across a full dosing interval',
          description:
            'A single time-point selectivity ratio is misleading for a drug with a twelve-to-seventeen-hour half-life, because the ratio of COX-1 to COX-2 occupancy changes across the interval. The assay must sample trough as well as peak.',
          dependsOnStepId: 'nap-w3',
          reagentsAndBuffer:
            'Fresh human whole blood from aspirin-free donors, lipopolysaccharide-stimulated monocyte prostaglandin E2 for COX-2 and clotted-serum thromboxane B2 for COX-1, sampling at peak and at 12 and 24 hours, immunoassay quantification',
        },
        {
          id: 'nap-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Test the aspirin interaction through the washout, not only during dosing',
          description:
            'The naproxen label’s own pharmacodynamic study found the interference with aspirin was minimal during twice-daily naproxen dosing and most prominent after naproxen was stopped, on days 11 to 13. Any protocol that ends when the naproxen ends will report no interaction and be wrong.',
          dependsOnStepId: 'nap-w4',
          reagentsAndBuffer:
            'Healthy volunteers on 81 mg immediate-release aspirin, naproxen 220 mg once and twice daily, dosing sequences 30 minutes apart in each direction, serum thromboxane B2 inhibition measured at 24 hours after dosing and continued through days 11 to 13 of washout',
        },
      ],
    },
    keyAudits: [
      {
        id: 'nap-a1',
        category: 'inferred',
        title:
          'An FDA advisory committee voted 16 to 9 against the claim that naproxen is safer for the heart',
        laymanSummary:
          'The belief that naproxen is the heart-friendly NSAID is the single most widespread thing said about it. In February 2014 the FDA convened its arthritis and drug safety committees to decide whether the label should say so. They voted 16 to 9 that the data do not support it.',
        technicalDetails:
          'The committee’s objection was about the shape of the evidence, not the direction of it. Naproxen’s apparent cardiovascular advantage comes overwhelmingly from trials in which naproxen was the comparator arm for a coxib, so the finding is a difference between two drugs rather than a measurement of naproxen against placebo — and dissenters noted that preferential labelling might inadvertently cause harm by increasing use and with it naproxen’s gastrointestinal risk, which is the highest of the class. The published summary of the meeting records the vote as 16 to nine that the data do not support naproxen’s lower cardiovascular thrombotic risk as compared with other NSAIDs, and concludes that there is insufficient evidence to conclude from a population perspective that there are differences between the major marketed NSAIDs in regard to their potential for cardiovascular events. The label was not changed. Every prescription naproxen product still carries the same boxed cardiovascular thrombotic warning as every other NSAID.',
        evidenceSource:
          'Bello AE, Holt RJ. Cardiovascular risk with non-steroidal anti-inflammatory drugs: clinical implications. Drug Saf 2014;37:897-902 — reporting the February 2014 joint FDA Arthritis Advisory Committee and Drug Safety and Risk Management Advisory Committee vote',
        doi: '10.1007/s40264-014-0207-2',
        inferredClaim:
          'That naproxen carries a lower cardiovascular thrombotic risk than other NSAIDs — an inference from indirect comparisons that a regulator’s advisory committee examined and declined to place in the label',
        auditFlag: 'contested',
      },
      {
        id: 'nap-a2',
        category: 'measured',
        title: 'The one randomised result the reputation is built on, stated exactly',
        laymanSummary:
          'In the biggest pooled analysis of randomised NSAID trials ever assembled, naproxen was the only traditional anti-inflammatory that did not significantly increase major vascular events. That result is real, and it is a non-significant finding, not a demonstration of safety.',
        technicalDetails:
          'The CNT Collaboration pooled individual participant data from 280 trials of an NSAID against placebo (124,513 participants, 68,342 person-years) and 474 trials of one NSAID against another (229,296 participants). Major vascular events — non-fatal myocardial infarction, non-fatal stroke or vascular death — were increased by about a third by a coxib (rate ratio 1.37, 95% CI 1.14 to 1.66) and by diclofenac (1.41, 1.12 to 1.78). For naproxen the rate ratio was 0.93 (0.69 to 1.27), which is not a significant increase; vascular death alone was 1.08 (0.48 to 2.47). Two things must be said alongside it. The confidence interval reaches 1.27, so a 27% increase is not excluded. And heart failure risk was roughly doubled by all NSAID regimens in the analysis, naproxen included — the vascular composite is not the only cardiac endpoint.',
        evidenceSource:
          'Coxib and traditional NSAID Trialists’ (CNT) Collaboration. Lancet 2013;382:769-779',
        doi: '10.1016/S0140-6736(13)60900-9',
        measuredMetric:
          'Rate ratio for major vascular events, major coronary events, vascular death and heart failure, by molecule, against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'nap-a3',
        category: 'failed',
        title: 'Naproxen has the worst upper gastrointestinal record of the common NSAIDs',
        laymanSummary:
          'The same analysis that gave naproxen its heart reputation gave it the highest rate of serious stomach and duodenal complications of every drug it examined — a 4.22-fold increase, worse than ibuprofen, worse than diclofenac, worse than the coxibs.',
        technicalDetails:
          'Upper gastrointestinal complications — perforation, obstruction or bleed — rose against placebo by a rate ratio of 4.22 (95% CI 2.71 to 6.56, p<0.0001) for naproxen, 3.97 (2.22 to 7.10) for ibuprofen, 1.89 (1.16 to 3.09) for diclofenac and 1.81 (1.17 to 2.81) for coxibs. In the head-to-head PRECISION trial, gastrointestinal events were significantly lower with celecoxib than with naproxen (p=0.01). This is the trade being made whenever naproxen is chosen for its cardiovascular profile, and it is rarely stated in those terms: the drug with the least measured vascular signal has the most measured bleeding.',
        evidenceSource:
          'CNT Collaboration, Lancet 2013;382:769-779; Nissen SE et al., N Engl J Med 2016;375:2519-2529 (PRECISION)',
        doi: '10.1016/S0140-6736(13)60900-9',
        measuredMetric:
          'Rate ratio for upper gastrointestinal perforation, obstruction or bleed against placebo, by molecule',
        auditFlag: 'caution',
      },
      {
        id: 'nap-a4',
        category: 'failed',
        title:
          'ADAPT: randomised to naproxen, more cardiovascular events, and no protection against dementia',
        laymanSummary:
          'A prevention trial randomised 2,528 people over seventy to naproxen, celecoxib or placebo to see whether anti-inflammatories prevent Alzheimer’s. They do not. And the naproxen group had a 63% higher rate of cardiovascular and cerebrovascular events than placebo.',
        technicalDetails:
          'ADAPT randomised 2,528 participants aged 70 and over with a family history of Alzheimer’s dementia to celecoxib 200 mg twice daily, naproxen sodium 220 mg twice daily or placebo, and was suspended in December 2004 after the APC trial reported cardiovascular harm with celecoxib. The composite of cardiovascular or cerebrovascular death, myocardial infarction, stroke, congestive heart failure or transient ischaemic attack occurred in 28/717 on celecoxib (three-year incidence 5.54%), 40/713 on naproxen (8.25%) and 37/1,070 on placebo (5.68%) — hazard ratio 1.10 (95% CI 0.67 to 1.79) for celecoxib and 1.63 (1.04 to 2.55) for naproxen. Antihypertensive treatment was started in 45.0% on naproxen against 34.1% on placebo, hazard ratio 1.40 (1.12 to 1.75). The trial’s own conclusion was that the naproxen data, although not definitive, are suggestive of increased cardiovascular and cerebrovascular risk. On the question it was designed to answer, neither drug improved cognitive function, and there was weak evidence of a detrimental effect of naproxen on the global summary score (-0.05 SD, p=0.02); the ten-year follow-up study confirmed no protection.',
        evidenceSource:
          'ADAPT Research Group. Cardiovascular and cerebrovascular events in the randomized, controlled Alzheimer’s Disease Anti-Inflammatory Prevention Trial (ADAPT). PLoS Clin Trials 2006;1(7):e33; ADAPT Research Group, Arch Neurol 2008;65:896-905',
        doi: '10.1371/journal.pctr.0010033',
        measuredMetric:
          'Three-year incidence of a cardiovascular and cerebrovascular composite, and initiation of antihypertensive treatment, in 2,528 randomised elderly participants',
        auditFlag: 'caution',
      },
      {
        id: 'nap-a5',
        category: 'conclusion_shift',
        title: 'The over-the-counter dose was never shown to be weaker than the prescription dose',
        laymanSummary:
          'The pharmacy sells 220 mg and the prescription pad writes 500 mg. In the pooled single-dose trials, no dose-response could be demonstrated anywhere between them — though the data at the low end were thin.',
        technicalDetails:
          'The Cochrane review of single-dose oral naproxen and naproxen sodium for acute postoperative pain included 15 studies in 1,509 participants. In the nine studies using 500 or 550 mg (784 participants) the number needed to treat for at least 50% pain relief over four to six hours was 2.7 (95% CI 2.3 to 3.2), with median time to rescue medication of 8.9 hours against 2.0 hours on placebo. The review states that no dose response was demonstrated over the range 200/220 mg to 500/550 mg, and immediately qualifies it: limited data were identified at the lower doses. That is an absence of evidence for a difference and not evidence of no difference — but it does mean that the more-than-doubled dose separating the over-the-counter product from the prescription one has never been shown to buy more analgesia in this setting, while it does buy proportionally more exposure to the gastrointestinal and renal effects.',
        evidenceSource:
          'Derry C, Derry S, Moore RA, McQuay HJ. Single dose oral naproxen and naproxen sodium for acute postoperative pain in adults. Cochrane Database Syst Rev 2009;(1):CD004234',
        doi: '10.1002/14651858.CD004234.pub3',
        measuredMetric:
          'Number needed to treat for at least 50% pain relief over four to six hours, and dose-response across 200/220 mg to 500/550 mg',
        auditFlag: 'caution',
      },
      {
        id: 'nap-a6',
        category: 'measured',
        title: 'It interferes with aspirin too — and the interference is worst after you stop it',
        laymanSummary:
          'Naproxen blocks aspirin from reaching its target in platelets, the same way ibuprofen does. The unexpected part, measured in the study printed in naproxen’s own label, is that the worst interference came in the days after naproxen was stopped.',
        technicalDetails:
          'Section 12.2 of the naproxen label reports a healthy-volunteer study: ten days of naproxen 220 mg once daily with 81 mg immediate-release aspirin reduced serum thromboxane B2 inhibition at 24 hours after the day-10 dose from 98.7% with aspirin alone to 93.1%. The interaction was greater when naproxen was given 30 minutes before aspirin (98.7% against 87.7%) and minimal in the reverse order (95.4%). On naproxen 220 mg twice daily the interaction was minimal during dosing (95.7%) but far more prominent after naproxen was discontinued on day 11 (84.3%), and had still not normalised by day 13 (90.7%). The label draws the conclusion explicitly: because there may be an increased risk of cardiovascular events following discontinuation of naproxen due to the interference with the antiplatelet effect of aspirin during the washout period, a patient on cardioprotective aspirin who needs intermittent analgesia should be considered for a non-interfering NSAID or a non-NSAID. The same section states that naproxen is not a substitute for low dose aspirin for cardiovascular protection.',
        evidenceSource:
          'Naproxen tablets United States prescribing information, sections 7 and 12.2 (openFDA label endpoint, ANDA 078250)',
        measuredMetric:
          'Percentage serum thromboxane B2 inhibition at 24 hours with aspirin alone against aspirin plus naproxen, during dosing and through washout',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'One hand only, set in the factory',
        laymanDesc:
          'Most drugs in this family are sold as a mixture of two mirror-image forms and the body sorts it out. Naproxen is sold as the active form alone, because the synthesis sets it.',
        molecularDetail:
          'The single S-(+) enantiomer of 2-(6-methoxynaphthalen-2-yl)propanoic acid. Absolute bioavailability about 95%; plasma protein binding above 99%. Naproxen sodium is the same molecule as a salt for faster dissolution — 220 mg of the sodium salt carries 200 mg of naproxen.',
        iconName: 'Hand',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It blocks the same channel — and then does not leave for half a day',
        laymanDesc:
          'Naproxen sits in the enzyme’s tunnel and blocks it, like ibuprofen. The difference is the clock: it clears in twelve to seventeen hours rather than two, so one dose covers most of a day.',
        molecularDetail:
          'Reversible competitive inhibition of the cyclooxygenase site of PTGS1 and PTGS2, without selectivity between them. The elimination half-life of twelve to seventeen hours is the longest among widely used non-selective NSAIDs and is the reason for twice-daily dosing and for a prolonged platelet effect.',
        iconName: 'Clock',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'Prostaglandin production falls, and so does pain',
        laymanDesc:
          'Less prostaglandin means nerve endings need a stronger stimulus before they fire, and inflamed tissue leaks less fluid. In pooled trials, one 500 mg dose halved pain in enough patients to give a number needed to treat of 2.7.',
        molecularDetail:
          'The label states that prostaglandins sensitise afferent nerves and potentiate the action of bradykinin in inducing pain, and are mediators of inflammation, and that naproxen’s mode of action may be due to a decrease of prostaglandins in peripheral tissues. Cochrane CD004234: NNT 2.7 (95% CI 2.3 to 3.2) for at least 50% pain relief over four to six hours at 500/550 mg, median time to rescue 8.9 hours against 2.0 on placebo.',
        iconName: 'TrendingDown',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'The stomach pays the most of any drug in the class',
        laymanDesc:
          'The same enzyme keeps the stomach lining protected. Because naproxen occupies it for so much longer than ibuprofen does, the lining gets less recovery time — and naproxen has the highest measured rate of serious gastric bleeding of the common anti-inflammatories.',
        molecularDetail:
          'Upper gastrointestinal complications rate ratio 4.22 (95% CI 2.71 to 6.56) against placebo, the highest in the CNT analysis of 280 placebo-controlled trials. In PRECISION, gastrointestinal events were significantly lower on celecoxib than on naproxen (p=0.01).',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
      {
        step: 5,
        title: 'Platelets stay suppressed — which is not the same as heart protection',
        laymanDesc:
          'Long occupancy of the platelet enzyme looks like what aspirin does, and it is not. Naproxen lets go again; aspirin does not. Its own label says naproxen is not a substitute for low-dose aspirin.',
        molecularDetail:
          'Reversible platelet COX-1 inhibition producing incomplete thromboxane suppression that recovers as drug clears, against aspirin’s covalent acetylation of Ser-529 which the anucleate platelet cannot repair. Label section 12.2 documents naproxen reducing aspirin’s thromboxane inhibition from 98.7% to as low as 84.3%, worst during naproxen washout.',
        iconName: 'ShieldOff',
        visualStage: 'cellular_entry',
      },
      {
        step: 6,
        title: 'What was measured, and what was voted down',
        laymanDesc:
          'Measured: no significant increase in major vascular events in pooled randomised trials, and a 63% higher cardiovascular event rate in a randomised prevention trial in the elderly. Voted down: putting a lower-cardiovascular-risk claim in the label, 16 to 9.',
        molecularDetail:
          'CNT: major vascular events rate ratio 0.93 (95% CI 0.69 to 1.27), not significant; heart failure roughly doubled as with every NSAID. ADAPT: cardiovascular and cerebrovascular composite hazard ratio 1.63 (1.04 to 2.55) against placebo in 2,528 participants. FDA joint advisory committee, February 2014: 16 to 9 that the data do not support a lower cardiovascular thrombotic risk for naproxen.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'NCT00346216 (PRECISION)',
        phase: 'Phase 4, randomised, double-blind, active-controlled non-inferiority',
        sampleSize: 24081,
        primaryEndpoint:
          'Antiplatelet Trialists Collaboration composite of cardiovascular death, non-fatal myocardial infarction or non-fatal stroke, adjudicated',
        endpointMet: true,
        statisticalPValue:
          'Naproxen 2.5%, celecoxib 2.3%, ibuprofen 2.7% in the intention-to-treat analysis; hazard ratio celecoxib against naproxen 0.93 (95% CI 0.76 to 1.13), p<0.001 for non-inferiority. Gastrointestinal events significantly lower on celecoxib than naproxen (p=0.01); renal events not significantly different (p=0.19)',
        unreportedAdverseSignals:
          'Mean naproxen dose achieved was 852±103 mg daily, below the 1,000 mg used in the CNT high-dose analyses. 68.8% of patients stopped study drug and 27.4% discontinued follow-up entirely.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'ADAPT (PLoS Clin Trials 2006;1(7):e33)',
        phase: 'Randomised, double-masked, placebo-controlled primary prevention trial',
        sampleSize: 2528,
        primaryEndpoint:
          'Primary prevention of Alzheimer’s dementia; cardiovascular and cerebrovascular events reported as a safety analysis after the trial was suspended',
        endpointMet: false,
        statisticalPValue:
          'Cardiovascular or cerebrovascular composite three-year incidence 8.25% on naproxen against 5.68% on placebo, hazard ratio 1.63 (95% CI 1.04 to 2.55). Antihypertensive initiation 45.0% against 34.1%, hazard ratio 1.40 (1.12 to 1.75). No improvement in cognitive function; weak evidence of a detrimental effect of naproxen on the global summary score (-0.05 SD, p=0.02)',
        unreportedAdverseSignals:
          'The trial was suspended in December 2004 after the celecoxib arm of a different trial reported cardiovascular harm, so follow-up ranged from 1 to 46 months and the cardiovascular analysis was unplanned. It is the only randomised placebo-controlled cardiovascular signal that exists for naproxen at an over-the-counter dose, and it points the opposite way from the drug’s reputation.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Cochrane CD004234 — pooled single-dose postoperative pain trials',
        phase: 'Systematic review of 15 randomised, double-blind, placebo-controlled trials',
        sampleSize: 1509,
        primaryEndpoint:
          'Proportion of participants with at least 50% pain relief over four to six hours after a single oral dose',
        endpointMet: true,
        statisticalPValue:
          'Number needed to treat 2.7 (95% CI 2.3 to 3.2) at 500/550 mg across nine studies and 784 participants; median time to rescue medication 8.9 hours against 2.0 hours on placebo',
        unreportedAdverseSignals:
          'No dose response was demonstrated over the range 200/220 mg to 500/550 mg, on limited data at the lower doses. The models are predominantly dental extraction and the horizon is six hours.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Number needed to treat 2.7 (95% CI 2.3 to 3.2) for at least 50% pain relief over four to six hours from a single 500/550 mg dose',
        'Major vascular events rate ratio 0.93 (0.69 to 1.27) against placebo — not a significant increase, and an interval that does not exclude a 27% one',
        'Upper gastrointestinal complications rate ratio 4.22 (2.71 to 6.56), the highest of any NSAID in the analysis',
        'Cardiovascular and cerebrovascular composite hazard ratio 1.63 (1.04 to 2.55) against placebo in 2,528 randomised elderly participants',
        'Serum thromboxane B2 inhibition by aspirin fell from 98.7% to 84.3% during naproxen washout in the label’s own pharmacodynamic study',
      ],
      unsupportedInferences: [
        'That naproxen carries a lower cardiovascular thrombotic risk than other NSAIDs — an FDA advisory committee voted 16 to 9 that the data do not support it and the label does not say it',
        'That naproxen can stand in for cardioprotective aspirin, which the label explicitly denies',
        'That a non-significant rate ratio of 0.93 is a demonstration of cardiovascular safety rather than an absence of a demonstrated increase',
        'That the vascular composite settles the cardiac question, when heart failure risk was roughly doubled by every NSAID regimen studied including naproxen',
      ],
      whatFailedInitially: [
        'ADAPT: naproxen did not prevent Alzheimer’s dementia, showed weak evidence of cognitive harm, and had a higher cardiovascular event rate than placebo',
        'The gastrointestinal record is the worst of the common NSAIDs on randomised data',
        'The aspirin interaction persists after naproxen is stopped and had not normalised by day 13 in the label’s study',
        'No dose response could be demonstrated between the over-the-counter and prescription strengths in pooled single-dose trials',
      ],
      realWorldOutcome: [
        'Approved in the United States in 1976 under NDA 017581 and available over the counter as naproxen sodium since 1994 under NDA 020204',
        'About seven United States cents per tablet at pharmacy acquisition cost across 110 listed generic products; on the WHO Model List of Essential Medicines',
        'Carries the same boxed cardiovascular thrombotic and gastrointestinal warnings as every other prescription NSAID, and is contraindicated in the setting of coronary artery bypass graft surgery',
        'Remains the NSAID most often recommended when a patient has cardiac risk factors — a practice that rests on an indirect comparison rather than on a label claim',
      ],
    },
    deliverySystem: {
      type: 'Oral tablets, delayed-release tablets, controlled-release tablets and oral suspension, as naproxen or as the more rapidly dissolving naproxen sodium; taken twice daily',
      description:
        'Rapidly and completely absorbed with an in vivo bioavailability of about 95%; the different dosage forms are bioequivalent for total exposure but differ in the pattern of absorption, which is why the sodium salt is used where speed of onset matters. Plasma protein binding exceeds 99% and elimination half-life is twelve to seventeen hours — several times longer than ibuprofen, and the source of both its convenience and its prolonged platelet and gastric effects.',
      safetyProfile:
        'Boxed warning for cardiovascular thrombotic events including fatal myocardial infarction and stroke, and for gastrointestinal bleeding, ulceration and perforation which can occur at any time and without warning symptoms. Contraindicated in the setting of coronary artery bypass graft surgery. Synergistic bleeding risk with warfarin, and increased bleeding risk with SSRIs and SNRIs. Interferes with the antiplatelet effect of low-dose aspirin, most markedly during naproxen washout, and is not a substitute for it. May diminish the antihypertensive effect of ACE inhibitors, ARBs and beta-blockers, and co-administration with an ACE inhibitor or ARB in elderly, volume-depleted or renally impaired patients may cause deterioration of renal function including acute renal failure. Raises serum digoxin and lithium concentrations.',
    },
    commonQuestions: [
      {
        q: 'Is naproxen really the safest NSAID for your heart?',
        a: 'It is the one with the least measured vascular signal, and that is a weaker claim than the reputation. In the pooled analysis of 280 placebo-controlled randomised trials, naproxen was the only traditional NSAID whose major vascular event rate ratio did not reach significance — 0.93, with a confidence interval running to 1.27. In February 2014 the FDA convened its arthritis and drug safety advisory committees specifically to consider putting a lower-cardiovascular-risk statement in the naproxen label, and they voted 16 to 9 against, on the grounds that most of the evidence came indirectly from trials where naproxen was the comparator for a coxib. Meanwhile a randomised placebo-controlled prevention trial in 2,528 people over seventy found a cardiovascular and cerebrovascular hazard ratio of 1.63 on naproxen sodium 220 mg twice daily. And whatever the vascular answer is, heart failure risk was roughly doubled by every NSAID in the analysis, naproxen included.',
        auditNote:
          'A non-significant result is an absence of a demonstrated increase, not a demonstration of absence. The distinction is the whole of this question.',
      },
      {
        q: 'Can naproxen replace my low-dose aspirin?',
        a: 'No, and the label says so in one sentence: naproxen tablets and naproxen sodium tablets are not substitutes for low dose aspirin for cardiovascular protection. Aspirin permanently disables the enzyme inside platelets, which cannot make a new one; naproxen only occupies it and lets go. Worse, the label’s own pharmacodynamic study found naproxen interferes with the aspirin you are taking — reducing thromboxane suppression from 98.7% to as low as 84.3% — and that the interference was most prominent in the days after naproxen was stopped, not while it was being taken. If you take cardioprotective aspirin and need an occasional painkiller, that is a conversation to have rather than a decision to make alone.',
      },
      {
        q: 'Why does naproxen last so much longer than ibuprofen?',
        a: 'Elimination half-life: twelve to seventeen hours against about two. That is a property of the molecule, not the formulation. It means twice-daily dosing instead of four times, and it means everything else about the drug — the stomach effect, the kidney effect, the platelet effect — is also sustained rather than intermittent. The gastric lining gets less recovery time between doses, which is one plausible reason naproxen has the highest upper gastrointestinal complication rate of the common NSAIDs at 4.22 times placebo.',
      },
      {
        q: 'The pharmacy sells 220 mg and my prescription is 500 mg. Am I getting less?',
        a: 'Less drug, and in the single-dose pain trials, not obviously less relief. The Cochrane review of 15 trials in 1,509 people reported a number needed to treat of 2.7 at 500 or 550 mg, and states that no dose response could be demonstrated anywhere between 200/220 mg and 500/550 mg — while immediately noting that the data at the lower doses were limited. So the honest answer is that the higher dose has not been shown to relieve more acute pain, and it has not been shown not to either. What is not in doubt is that the higher dose delivers proportionally more of the exposure that causes the gastrointestinal and renal effects.',
        auditNote:
          'Absence of a demonstrated dose response on thin data is not evidence that the doses are equivalent. It is a gap in the evidence, and worth naming as one.',
      },
      {
        q: 'It did not prevent Alzheimer’s. Was it ever supposed to?',
        a: 'It was seriously tested for it. Observational studies had repeatedly found lower rates of Alzheimer’s dementia among long-term NSAID users, and ADAPT was built to find out whether that was cause or coincidence. It randomised 2,528 people aged seventy and over with a family history to naproxen sodium, celecoxib or placebo. Neither drug improved cognitive function; there was weak evidence that naproxen made the global summary score slightly worse; and a follow-up study reassessing participants in 2010 to 2011 confirmed no protection. It is a clean example of an association that did not survive randomisation — and the trial also produced the cardiovascular signal that sits awkwardly against naproxen’s reputation.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      CNT_SOURCE,
      PRECISION_SOURCE,
      {
        label:
          'Bello AE, Holt RJ. Cardiovascular risk with non-steroidal anti-inflammatory drugs: clinical implications. Drug Saf 2014;37:897-902 — reports the February 2014 joint FDA advisory committee vote of 16 to 9 against a lower-cardiovascular-risk statement for naproxen',
        identifier: '10.1007/s40264-014-0207-2',
        kind: 'doi',
      },
      {
        label:
          'ADAPT Research Group. Cardiovascular and cerebrovascular events in the randomized, controlled Alzheimer’s Disease Anti-Inflammatory Prevention Trial (ADAPT). PLoS Clin Trials 2006;1(7):e33',
        identifier: '10.1371/journal.pctr.0010033',
        kind: 'doi',
      },
      {
        label:
          'ADAPT Research Group. Cognitive function over time in the Alzheimer’s Disease Anti-inflammatory Prevention Trial (ADAPT). Arch Neurol 2008;65:896-905',
        identifier: '10.1001/archneur.2008.65.7.nct70006',
        kind: 'doi',
      },
      {
        label:
          'ADAPT Research Group. Follow-up evaluation of cognitive function in the randomized ADAPT and its Follow-up Study. Alzheimers Dement 2015;11:216-225',
        identifier: '10.1016/j.jalz.2014.03.009',
        kind: 'doi',
      },
      {
        label:
          'Derry C, Derry S, Moore RA, McQuay HJ. Single dose oral naproxen and naproxen sodium for acute postoperative pain in adults. Cochrane Database Syst Rev 2009;(1):CD004234',
        identifier: '10.1002/14651858.CD004234.pub3',
        kind: 'doi',
      },
      {
        label:
          'NAPROSYN (naproxen) Drugs@FDA application record, NDA 017581 — approval history and labelling',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=017581',
        kind: 'regulatory',
      },
      {
        label:
          'ALEVE (naproxen sodium) Drugs@FDA application record, NDA 020204 — the over-the-counter product',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020204',
        kind: 'regulatory',
      },
      {
        label:
          'Naproxen tablets United States prescribing information — sections 7 (Drug Interactions), 12.1, 12.2 and 12.3, retrieved from the openFDA drug label endpoint (ANDA 078250)',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22NAPROXEN%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 156391 (naproxen) — structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/156391',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 3. Acetaminophen / paracetamol — the most-taken drug in the world, whose own label says the
  //    site and mechanism of its analgesic effect has not been determined, and which failed
  //    outright in the two conditions it is most often recommended for.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'acetaminophen',
    name: 'Acetaminophen',
    tradeName: 'Tylenol, Panadol, Calpol, Ofirmev (intravenous); paracetamol outside North America',
    sponsor:
      'Marketed since 1955 by McNeil as Tylenol; regulated in the United States chiefly under the over-the-counter internal analgesic-antipyretic monograph rather than a single new drug application, and made by hundreds of manufacturers. The intravenous product OFIRMEV was approved under NDA 022450',
    targetGene:
      'Not established — no molecular target has been confirmed for the analgesic effect. PTGS1 and PTGS2 are the most-cited candidates and neither is stated in the label',
    targetProtein:
      'Undetermined. The United States label states that the site and mechanism for the analgesic effect of acetaminophen has not been determined; the antipyretic effect is attributed to inhibition of endogenous pyrogen action on the hypothalamic heat-regulating centres',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1968,
    indication:
      'Temporary relief of minor aches and pains and reduction of fever; as an adjunct to opioid analgesia in prescription combination products; the intravenous formulation for management of mild to moderate pain, of moderate to severe pain with adjunctive opioids, and for reduction of fever',
    patientFriendlyIndication: 'Pain and fever',
    anatomicalSite:
      'Not established. The antipyretic action is placed at the hypothalamic heat-regulating centres; the analgesic site is unknown, with candidate mechanisms proposed in the central nervous system rather than in inflamed peripheral tissue',
    conditionContext: {
      conditionExplainer:
        'Paracetamol lowers fever and takes the edge off pain. It is not an anti-inflammatory in any useful clinical sense, which is why it does nothing for a swollen joint that ibuprofen would help, and why it also does nothing to the stomach, the kidney or the platelet.',
      whyItMatters:
        'This is the drug people are told to take first: the safe one, the one for children, the one to reach for if NSAIDs are a problem. Two of the three conditions it is most often recommended for — acute low back pain and osteoarthritis — now have high-quality randomised evidence that single-agent paracetamol is either no better than placebo or better by an amount too small to feel. At the same time it is the single largest cause of acute liver failure in the United States and Europe.',
      whoTakesThis:
        'Almost everyone, at some point, including infants and pregnant women, for whom it remains the recommended first-line antipyretic. People with liver disease, chronic alcohol use or malnutrition sit closer to the toxic threshold than the label’s milligram numbers suggest.',
      clinicalGoals:
        'A lower temperature, and some reduction in pain. No effect on inflammation, on disease course, or on any hard outcome has been demonstrated.',
    },
    oneSentenceVerdict:
      'The world’s most-taken analgesic, whose United States label states that the site and mechanism for its analgesic effect has not been determined, which failed to beat placebo for acute low back pain in a 1,652-patient randomised trial (median recovery 17 days against 16), produces a pain effect in osteoarthritis of -3.7 points on a 100-point scale that its own meta-analysts call not clinically important, raises daytime systolic blood pressure by 4.7 mmHg at 4 g daily in hypertensive patients, and accounts for 46% of acute liver failure in the United States.',
    laymanHowItWorks:
      'Nobody knows exactly how paracetamol relieves pain, and its official prescribing information says so outright. What is reasonably established is that it acts centrally rather than at the site of injury — it resets the brain’s temperature set-point to bring a fever down, and does something to pain processing in the brain and spinal cord that has never been pinned to a specific protein. What it does not do is block inflammation in a swollen joint the way ibuprofen does, which is why it leaves the stomach, the kidney and the platelet alone, and also why it does so little for arthritis. The liver clears most of a normal dose harmlessly; a small fraction becomes a reactive molecule that is mopped up by glutathione, and when the dose outruns the glutathione supply that molecule destroys liver cells.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 52,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0349 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 170 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Never meaningfully patent-protected in its modern era: paracetamol was first synthesised in 1878 and reintroduced clinically in the 1950s, and in the United States it is regulated under an over-the-counter monograph rather than through exclusivity. It is on the WHO Model List of Essential Medicines. Under four United States cents per tablet at acquisition cost — and the brand premium a consumer pays over that at a supermarket shelf is among the largest in retail pharmacy for a chemically identical product.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'For most of the conditions paracetamol is recommended for, an NSAID is measurably more effective and measurably more dangerous, and the two together beat either alone. The honest framing is not "which is stronger" but "which organ are you willing to put at risk": paracetamol puts the liver on the line and leaves the stomach, kidney and platelet alone; the NSAIDs do the reverse. In osteoarthritis specifically, the largest network meta-analysis concluded there is no role for single-agent paracetamol at any dose.',
      conventionalRx: [
        {
          name: 'Ibuprofen 400 mg, or ibuprofen with paracetamol together',
          class: 'Non-selective cyclooxygenase inhibitor, alone or combined',
          howItCompares:
            'In pooled single-dose postoperative trials, ibuprofen 400 mg alone gave at least 50% pain relief to 52% of patients against 7% on placebo; ibuprofen 400 mg with paracetamol 1000 mg reached 73%, a number needed to treat against placebo of 1.5 (95% CI 1.4 to 1.7). The combination beat ibuprofen alone with a number needed to treat of 5.4 (3.5 to 12) — so paracetamol adds something real on top of an NSAID even where it does little on its own.',
          typicalCost:
            'US$0.0391 per ibuprofen tablet at United States pharmacy acquisition cost (CMS NADAC, median across 244 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: substantially more effective, alone or in combination. Cons: boxed cardiovascular and gastrointestinal warnings; interferes with cardioprotective aspirin; raises blood pressure by a similar amount to paracetamol.',
        },
        {
          name: 'Diclofenac 150 mg daily, in osteoarthritis specifically',
          class: 'Non-selective cyclooxygenase inhibitor with high COX-2 affinity',
          howItCompares:
            'In the network meta-analysis of 76 trials and 58,451 osteoarthritis patients, diclofenac 150 mg daily had the largest pain effect of any preparation at a maximally approved dose (effect size -0.57, 95% credible interval -0.69 to -0.45) with a 100% probability of reaching the minimum clinically important difference. Paracetamol, at any dose, did not reach it.',
          typicalCost:
            'US$0.0829 per gram of diclofenac sodium at United States pharmacy acquisition cost (CMS NADAC, median across 149 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: the most effective NSAID for osteoarthritis pain on this evidence. Cons: the same analysis’s authors immediately qualify it with the safety profile — diclofenac raised major vascular events 41% in the randomised meta-analysis, on a par with the coxibs.',
        },
        {
          name: 'Topical NSAID over the affected joint',
          class: 'Cyclooxygenase inhibitor applied to the skin',
          howItCompares:
            'For a hand, knee or elbow, delivers an anti-inflammatory effect paracetamol simply does not have, at a small fraction of the systemic exposure that produces the NSAID class warnings. It does nothing for fever, and nothing for pain in a deep structure.',
          typicalCost:
            'US$0.0829 per gram at United States pharmacy acquisition cost (CMS NADAC, diclofenac sodium, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: local effect, minimal systemic exposure, no liver burden. Cons: superficial joints only; skin reactions; no antipyretic effect.',
        },
      ],
      naturalFoods: [
        {
          name: 'White willow bark (Salix alba) standardised to salicin',
          activeCompound: 'Salicin, hydrolysed and oxidised in the body to salicylic acid',
          biologicalMechanism:
            'Salicin is a glycoside pro-drug of salicylic acid — the same active species aspirin delivers — so the mechanism is cyclooxygenase inhibition, not whatever paracetamol does. It is included here because of the irony: for low back pain, the condition in which paracetamol was found no better than placebo, willow bark was.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: the Cochrane review of herbal medicine for low-back pain graded as moderate quality the finding that daily doses standardised to 120 mg or 240 mg salicin are probably better than placebo for short-term pain and rescue medication use, across two trials and 261 participants. One trial in 51 participants found that willow bark minimally affected platelet thrombosis compared with a cardioprotective dose of acetylsalicylate — so it is not a substitute for aspirin either.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Count every product, not every tablet',
          action:
            'Add up the acetaminophen in the cold remedy, the sleep aid, the prescription opioid combination and the plain tablets before deciding anything.',
          patientImpact:
            'The boxed warning states that most cases of liver injury are associated with doses exceeding 4,000 mg per day and often involve more than one acetaminophen-containing product. The unintentional-overdose phenotype is the person who took a therapeutic dose of three different products at once, not the person who took a bottle.',
          clinicalPrecaution:
            'Since January 2014 the FDA has limited prescription combination products to 325 mg of acetaminophen per dosage unit, down from formulations that had carried 500, 650 or even 750 mg. That regulatory change exists precisely because the arithmetic was going wrong in ordinary use.',
        },
        {
          name: 'Alcohol, fasting and liver disease move the threshold, not the label',
          action:
            'Say if you drink regularly, have been eating poorly, or have any liver condition, before anyone recommends a dose.',
          patientImpact:
            'Toxicity is caused by a reactive metabolite that is neutralised by glutathione. Chronic alcohol use induces the enzyme that produces it, and fasting or malnutrition depletes the glutathione that removes it. The milligram number in the label assumes neither.',
          clinicalPrecaution:
            'The boxed warning covers dose; it does not carry a personalised threshold, and no such threshold is published. This is one of the few places in common medicine where the same dose is genuinely a different drug in different people.',
        },
        {
          name: 'If you have high blood pressure, this is not a neutral choice',
          action: 'Mention regular daily use to whoever manages your blood pressure.',
          patientImpact:
            'In a randomised crossover trial in 110 hypertensive people, two weeks of 1 g four times daily raised mean daytime systolic pressure by 4.7 mmHg against placebo (95% CI 2.9 to 6.6, p<0.0001) — an effect of the same order as the ibuprofen rise that paracetamol is often chosen to avoid.',
          clinicalPrecaution:
            'The trial studied regular daily 4 g dosing over two weeks, not occasional use. Its authors concluded the finding calls into question the safety of regular acetaminophen use in this situation.',
        },
        {
          name: 'For a child’s fever, treat the child, not the thermometer',
          action:
            'Use it because the child is uncomfortable, not to bring a number down or to prevent anything.',
          patientImpact:
            'The label attributes the antipyretic effect to inhibition of endogenous pyrogen action on the hypothalamic heat-regulating centres. Lowering a temperature is a measured effect. Preventing febrile convulsions is not something antipyretics have been shown to do.',
          clinicalPrecaution:
            'Paediatric dosing is by weight, and paediatric liquid concentrations have differed between products — the arithmetic error that causes harm here is a concentration error, not a frequency error.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(=O)NC1=CC=C(C=C1)O',
      chemicalFormula: 'C8H9NO2',
      molecularWeight: '151.16 g/mol',
      targetReceptorAffinity:
        'No binding affinity can honestly be stated, because no target has been established. The label records that absorption from the gastrointestinal tract is rapid and almost complete, that distribution is relatively uniform through most body fluids, and that plasma protein binding is variable — only 20% to 50% may be bound at the concentrations reached during acute intoxication, which is unusually low and is part of why the drug distributes so freely into the central nervous system. About 80 to 85% of an ordinary dose is conjugated in the liver, principally with glucuronic acid and to a lesser extent with sulfate; a minor fraction is oxidised by cytochrome P450 to N-acetyl-p-benzoquinone imine, which is the toxic species.',
      structureSource: {
        label:
          'PubChem CID 1983 (acetaminophen) — canonical SMILES, molecular formula and weight, as carried on the enriched record; absorption, distribution, protein binding and metabolism from the acetaminophen-containing prescribing information, Clinical Pharmacology section',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/1983',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'apap-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Limit the p-aminophenol, which is the impurity that matters',
          description:
            'Paracetamol is made by acetylating 4-aminophenol, and unreacted or hydrolysed 4-aminophenol is both nephrotoxic and the main degradation product on storage in humid conditions. It is controlled at a tight limit and is not visible in an assay optimised for the drug, because the two co-elute on a badly chosen method.',
          reagentsAndBuffer:
            'Paracetamol reference standard, 4-aminophenol reference standard, reverse-phase HPLC with a method resolving the two, ultraviolet detection at 245 nm, Karl Fischer titration, accelerated humidity stability chambers',
        },
        {
          id: 'apap-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Acetylate 4-aminophenol',
          description:
            'One step from a commodity intermediate: 4-aminophenol plus acetic anhydride gives paracetamol and acetic acid. The 4-aminophenol itself comes from catalytic hydrogenation of nitrobenzene with Bamberger rearrangement, or from reduction of 4-nitrophenol. This is the shortest synthesis of any drug in this file and is the reason a tablet costs three United States cents.',
          dependsOnStepId: 'apap-w1',
          reagentsAndBuffer:
            '4-aminophenol, acetic anhydride or glacial acetic acid, aqueous reaction medium, controlled addition to limit di-acetylation, activated carbon treatment for colour bodies',
        },
        {
          id: 'apap-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Recrystallise to a low-residual-aminophenol, tabletting-grade solid',
          description:
            'Paracetamol has poor compressibility in its stable monoclinic form and the orthorhombic form compacts better, so crystallisation is doing formulation work as well as purification. Residual 4-aminophenol must be driven below the limit here, because there is no later step that removes it.',
          dependsOnStepId: 'apap-w2',
          reagentsAndBuffer:
            'Recrystallisation from water or aqueous ethanol, controlled cooling profile, X-ray powder diffraction to identify polymorph, laser diffraction particle sizing, HPLC release testing against the 4-aminophenol limit',
        },
        {
          id: 'apap-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Reproduce the glutathione-depletion threshold in primary hepatocytes',
          description:
            'The clinically important property of this molecule is not its potency but the shape of its toxicity curve: harmless until glutathione is exhausted, then catastrophic. That threshold is what a cell model has to reproduce, and it moves with CYP2E1 induction and with glutathione status — which is why the same dose is a different exposure in a person who drinks or has not eaten.',
          dependsOnStepId: 'apap-w3',
          reagentsAndBuffer:
            'Primary human hepatocytes or HepaRG cells, paracetamol across a wide concentration range, buthionine sulfoximine to deplete glutathione and ethanol pretreatment to induce CYP2E1, intracellular glutathione assay, N-acetyl-p-benzoquinone imine protein-adduct measurement, N-acetylcysteine rescue arm',
        },
        {
          id: 'apap-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Test the analgesic mechanism candidates against a negative control that can fail',
          description:
            'Because no target is established, mechanism work here is unusually prone to confirming whatever it set out to find. A candidate mechanism — central cyclooxygenase inhibition, the AM404 metabolite acting at TRPV1 or cannabinoid receptors, descending serotonergic modulation — is only informative if the experiment includes a condition in which the candidate would be shown to be wrong: a receptor knockout, a selective antagonist, or a tissue where the candidate is absent.',
          dependsOnStepId: 'apap-w4',
          reagentsAndBuffer:
            'Whole-blood COX-1 and COX-2 assays for the peripheral hypothesis, TRPV1 and CB1 antagonists and receptor-null preparations for the AM404 hypothesis, spinal and supraspinal administration compared with systemic, fatty acid amide hydrolase inhibition to test AM404 dependence',
        },
      ],
    },
    keyAudits: [
      {
        id: 'apap-a1',
        category: 'inferred',
        title: 'Nobody knows how it relieves pain, and the label says so',
        laymanSummary:
          'Paracetamol has been in use for seventy years and is taken billions of times a year. Its own prescribing information states that the site and mechanism for its analgesic effect has not been determined.',
        technicalDetails:
          'The Clinical Pharmacology section of United States acetaminophen-containing prescribing information reads: "Acetaminophen is a non-opiate, non-salicylate analgesic and antipyretic. The site and mechanism for the analgesic effect of acetaminophen has not been determined. The antipyretic effect of acetaminophen is accomplished through the inhibition of endogenous pyrogen action on the hypothalamic heat-regulating centers." So the regulator will name a mechanism for the fever effect and will not name one for the pain effect. The candidate explanations in the literature are genuine and mutually inconsistent: inhibition of a central cyclooxygenase in a low-peroxide environment; the deacetylated metabolite recombining with arachidonic acid to form AM404, which acts at TRPV1 and cannabinoid CB1 receptors; and modulation of descending serotonergic inhibition. None has been established, and the practical consequence is not academic — a drug with no known target cannot have its dose, its interactions or its ceiling reasoned about from first principles.',
        evidenceSource:
          'Acetaminophen-containing prescribing information, Clinical Pharmacology section (openFDA drug label endpoint, ANDA 202677)',
        inferredClaim:
          'That paracetamol is a peripheral prostaglandin inhibitor like the NSAIDs, or that any single named mechanism explains its analgesia — the label declines to name one at all',
        auditFlag: 'contested',
      },
      {
        id: 'apap-a2',
        category: 'failed',
        title: 'PACE: it did not beat placebo for acute low back pain',
        laymanSummary:
          'Paracetamol was the recommended first choice for a bad back in almost every guideline in the world. A 1,652-person randomised trial compared it with placebo and found no difference whatsoever — 17 days to recovery against 16.',
        technicalDetails:
          'PACE randomised 1,652 patients with acute low back pain across 235 primary care centres in Sydney to regular paracetamol three times daily (equivalent to 3,990 mg per day), as-needed paracetamol up to 4,000 mg per day, or placebo, all with best-evidence advice, followed for three months. Median time to recovery — defined as a pain score of 0 or 1 sustained for seven consecutive days — was 17 days (95% CI 14 to 19) in the regular group, 17 days (15 to 20) as-needed, and 16 days (14 to 20) on placebo. Hazard ratio regular against placebo 0.99 (0.87 to 1.14); adjusted p=0.79 across groups. Adherence was equivalent across arms (median 4.0 of a maximum 6 tablets per day in the regular and placebo groups alike), so this is not a compliance failure. Adverse events were reported by 18.5% on regular paracetamol and 18.5% on placebo. The authors’ own conclusion was that the findings question the universal endorsement of paracetamol in this patient group, and guidelines subsequently moved away from it.',
        evidenceSource:
          'Williams CM, Maher CG, Latimer J, et al. Efficacy of paracetamol for acute low-back pain: a double-blind, randomised controlled trial. Lancet 2014;384:1586-1596',
        doi: '10.1016/S0140-6736(14)60805-9',
        measuredMetric:
          'Median time to recovery from acute low back pain, paracetamol against placebo, in 1,652 randomised primary-care patients',
        auditFlag: 'verified',
      },
      {
        id: 'apap-a3',
        category: 'conclusion_shift',
        title: 'In osteoarthritis the effect is real, and too small to feel',
        laymanSummary:
          'Two large syntheses reached the same place from different directions: paracetamol produces a statistically detectable improvement in arthritis pain that is below the threshold anyone can notice, and the larger of the two concluded there is no role for it in osteoarthritis at any dose.',
        technicalDetails:
          'The 2015 systematic review of 13 randomised placebo-controlled trials graded the evidence "high quality" and reported, for hip or knee osteoarthritis, a weighted mean difference in pain of -3.7 points on a 0-to-100 scale (95% CI -5.5 to -1.9) and in disability of -2.9 (-4.9 to -0.9) — statistically significant and, in the authors’ own words, not clinically important. For low back pain the corresponding figure was -0.5 (-2.9 to 1.9): nothing at all. The 2017 network meta-analysis went further, pooling 76 randomised trials with 58,451 patients across 23 treatment nodes and comparing every NSAID preparation and paracetamol dose against placebo with a prespecified minimum clinically important effect size of -0.37. Six NSAID preparations cleared it with at least 95% probability; diclofenac 150 mg daily was the best at -0.57 (95% credible interval -0.69 to -0.45). Its interpretation opens: "On the basis of the available data, we see no role for single-agent paracetamol for the treatment of patients with osteoarthritis irrespective of dose." Guideline bodies that had listed paracetamol as first-line for osteoarthritis for two decades revised that position after these analyses.',
        evidenceSource:
          'Machado GC, Maher CG, Ferreira PH, et al. Efficacy and safety of paracetamol for spinal pain and osteoarthritis: systematic review and meta-analysis. BMJ 2015;350:h1225; da Costa BR, Reichenbach S, Keller N, et al. Effectiveness of non-steroidal anti-inflammatory drugs for the treatment of pain in knee and hip osteoarthritis: a network meta-analysis. Lancet 2017;390:e21-e33',
        doi: '10.1136/bmj.h1225',
        measuredMetric:
          'Weighted mean difference in pain on a 0-100 scale, and effect size against a prespecified minimum clinically important difference of -0.37',
        auditFlag: 'caution',
      },
      {
        id: 'apap-a4',
        category: 'failed',
        title: 'It raises blood pressure about as much as the NSAID it is chosen to avoid',
        laymanSummary:
          'Paracetamol is recommended over ibuprofen for people with high blood pressure on the assumption it does not affect it. A randomised crossover trial in 110 hypertensive patients found 4 g a day raised daytime systolic pressure by 4.7 mmHg.',
        technicalDetails:
          'PATH-BP was a double-blind placebo-controlled crossover trial: 110 individuals with hypertension received 1 g acetaminophen four times daily or matched placebo for two weeks, with a two-week washout before crossing over, and 24-hour ambulatory blood pressure at the start and end of each period. In the 103 who completed both arms, mean daytime systolic pressure rose from 132.8±10.5 to 136.5±10.1 mmHg on acetaminophen against 133.9±10.3 to 132.5±9.9 mmHg on placebo (p<0.0001), a placebo-corrected increase of 4.7 mmHg (95% CI 2.9 to 6.6). Daytime diastolic rose by a placebo-corrected 1.6 mmHg (0.5 to 2.7, p=0.005), with similar findings on 24-hour and clinic measurements. For comparison, ibuprofen raised 24-hour systolic pressure by 3.7 mmHg in the PRECISION-ABPM substudy. The trial’s own conclusion is that this increases cardiovascular risk and calls into question the safety of regular acetaminophen use in this situation. It studied regular 4 g daily dosing, not occasional use, and it was not powered for any clinical event.',
        evidenceSource:
          'MacIntyre IM, Turtle EJ, Farrah TE, et al. Regular Acetaminophen Use and Blood Pressure in People With Hypertension: The PATH-BP Trial. Circulation 2022;145:416-423 (NCT01997112)',
        doi: '10.1161/CIRCULATIONAHA.121.056015',
        measuredMetric:
          'Placebo-corrected change in mean daytime ambulatory systolic blood pressure after two weeks of 4 g daily',
        auditFlag: 'verified',
      },
      {
        id: 'apap-a5',
        category: 'measured',
        title: 'It is the leading cause of acute liver failure in the United States',
        laymanSummary:
          'Acetaminophen accounts for 46% of all acute liver failure in the United States and between 40% and 70% in Britain and Europe — more than every prescription drug combined, several times over.',
        technicalDetails:
          'The hepatology review states: "APAP toxicity accounts for 46% of all acute liver failure (ALF) in the United States and between 40 and 70% of all cases in Great Britain and Europe", and that acetaminophen is "responsible for nearly 500 deaths annually in the U.S. alone, as well as 100,000 calls to US Poison Control Centers, 50,000 emergency room visits and 10,000 hospitalizations per year". The mechanism is well understood even though the analgesic mechanism is not: 80 to 85% of a dose is conjugated with glucuronic acid or sulfate and excreted, while a minor fraction is oxidised by cytochrome P450 to N-acetyl-p-benzoquinone imine, which is detoxified by conjugation with glutathione. When the dose exceeds the rate at which glutathione can be regenerated, the reactive metabolite binds hepatocyte proteins and centrilobular necrosis follows. The curve is flat and then vertical, which is what makes the drug feel safe right up until it is not. Two clinical phenotypes exist: intentional single-time-point overdose, and unintentional therapeutic misadventure — the person taking a therapeutic dose of several acetaminophen-containing products at once. The second is the harder to prevent and the reason for the regulatory limit.',
        evidenceSource:
          'Lee WM. Acetaminophen (APAP) hepatotoxicity — Isn’t it time for APAP to go away? J Hepatol 2017;67:1324-1331',
        doi: '10.1016/j.jhep.2017.07.005',
        measuredMetric:
          'Proportion of acute liver failure cases attributable to acetaminophen, and annual United States deaths, poison-centre calls, emergency visits and hospitalisations',
        auditFlag: 'caution',
      },
      {
        id: 'apap-a6',
        category: 'conclusion_shift',
        title:
          'The pregnancy and neurodevelopment association did not survive a sibling comparison',
        laymanSummary:
          'A run of studies reported that paracetamol in pregnancy was linked to autism and ADHD in the child. A Swedish study of 2.48 million children found the same small association — and then compared siblings within the same family, where it vanished entirely.',
        technicalDetails:
          'The nationwide cohort covered 2,480,797 children born in Sweden between 1995 and 2019, of whom 185,909 (7.49%) were exposed to acetaminophen in pregnancy, followed to the end of 2021. In conventional models, ever-use against no use was associated with hazard ratios of 1.05 (95% CI 1.02 to 1.08) for autism, 1.07 (1.05 to 1.10) for ADHD and 1.05 (1.00 to 1.10) for intellectual disability — small, statistically significant, and consistent with the earlier literature. The analysis then restricted to matched full sibling pairs, which holds constant everything shared within a family that a covariate list cannot capture. In that comparison the hazard ratios were 0.98 (0.93 to 1.04) for autism, 0.98 (0.94 to 1.02) for ADHD and 1.01 (0.92 to 1.10) for intellectual disability, with no dose-response pattern; for autism, low, medium and high mean daily use gave hazard ratios of 0.85, 0.96 and 0.88 against no use. The conclusion is that the associations observed in other models may have been attributable to familial confounding — the reasons a woman needs paracetamol in pregnancy, and the genetics she shares with her child, travel together. This is a conclusion shift in the direction of reassurance, and it is worth stating as clearly as the shifts that go the other way.',
        evidenceSource:
          'Ahlqvist VH, Sjöqvist H, Dalman C, et al. Acetaminophen Use During Pregnancy and Children’s Risk of Autism, ADHD, and Intellectual Disability. JAMA 2024;331:1205-1214',
        doi: '10.1001/jama.2024.3172',
        measuredMetric:
          'Hazard ratios for autism, ADHD and intellectual disability, in a population cohort and in a matched full-sibling comparison of 2,480,797 children',
        auditFlag: 'verified',
      },
      {
        id: 'apap-a7',
        category: 'measured',
        title: 'It adds something real on top of an NSAID even where it does little alone',
        laymanSummary:
          'Paracetamol alone underperforms in most of the settings it is recommended for. Combined with ibuprofen, it produced the lowest number needed to treat recorded for any single-dose analgesic comparison: 1.5.',
        technicalDetails:
          'The Cochrane review of single-dose oral ibuprofen plus paracetamol for acute postoperative pain pooled three studies in 1,647 participants. At least 50% of maximum pain relief over six hours was achieved by 69% on ibuprofen 200 mg with paracetamol 500 mg, 73% on ibuprofen 400 mg with paracetamol 1000 mg, and 7% on placebo — numbers needed to treat of 1.6 (95% CI 1.5 to 1.8) and 1.5 (1.4 to 1.7). Ibuprofen 400 mg alone achieved 52%, giving a number needed to treat for the combination over ibuprofen alone of 5.4 (3.5 to 12), and the median time to rescue medication extended to 8.3 hours. So the additive effect is measured and it is modest: about one extra patient benefiting for every five treated, on top of the NSAID. That an additive effect exists is also indirect evidence that paracetamol is not acting through the same mechanism as the NSAID — which remains the most interesting unanswered question about the drug.',
        evidenceSource:
          'Derry CJ, Derry S, Moore RA. Single dose oral ibuprofen plus paracetamol (acetaminophen) for acute postoperative pain. Cochrane Database Syst Rev 2013;(6):CD010210',
        doi: '10.1002/14651858.CD010210.pub2',
        measuredMetric:
          'Proportion achieving at least 50% maximum pain relief over six hours and the derived number needed to treat, for the combination against placebo and against ibuprofen alone',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'It is absorbed almost completely, and binds to almost nothing',
        laymanDesc:
          'Paracetamol is absorbed quickly and near-completely from the gut, and unlike most drugs it barely sticks to blood proteins — so it spreads freely through body water, including into the brain.',
        molecularDetail:
          'The label states that absorption from the gastrointestinal tract is rapid and almost complete, that the drug is relatively uniformly distributed throughout most body fluids, and that plasma protein binding is variable, with only 20% to 50% bound at concentrations encountered during acute intoxication. Contrast ibuprofen and naproxen at above 99% bound.',
        iconName: 'Droplet',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The fever effect has an address',
        laymanDesc:
          'For temperature, the mechanism is known: paracetamol blocks the action of the signals that tell the brain’s thermostat to raise the set-point, and the body then sheds the extra heat.',
        molecularDetail:
          'The label attributes the antipyretic effect to inhibition of endogenous pyrogen action on the hypothalamic heat-regulating centres. This is the one mechanistic claim the regulator will make for the molecule.',
        iconName: 'Thermometer',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'The pain effect does not',
        laymanDesc:
          'For pain, the same document says the site and mechanism have not been determined. Several explanations are seriously proposed and none has been established.',
        molecularDetail:
          'Candidates include inhibition of cyclooxygenase in the low-peroxide environment of the central nervous system, the metabolite AM404 formed by conjugation of p-aminophenol with arachidonic acid acting at TRPV1 and CB1, and enhancement of descending serotonergic inhibition. The absence of any anti-inflammatory effect at analgesic doses is the observation every candidate has to explain.',
        iconName: 'HelpCircle',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'Most of the dose leaves harmlessly',
        laymanDesc:
          'Eighty-odd per cent of a normal dose is stuck to a sugar or a sulfate group in the liver and passed out in urine. That path has effectively unlimited capacity at ordinary doses.',
        molecularDetail:
          'About 80 to 85% is conjugated, principally with glucuronic acid and to a lesser extent with sulfate, and excreted renally. These pathways saturate only at high exposure, at which point a larger fraction is diverted to oxidation.',
        iconName: 'Recycle',
        visualStage: 'cellular_entry',
      },
      {
        step: 5,
        title: 'A small fraction becomes something that destroys liver cells',
        laymanDesc:
          'The rest is oxidised into a reactive molecule that would attack liver cells, except that a scavenger called glutathione mops it up. When the dose outruns the glutathione supply, it stops being mopped up.',
        molecularDetail:
          'Cytochrome P450, chiefly CYP2E1, oxidises a minor fraction to N-acetyl-p-benzoquinone imine, detoxified by conjugation with glutathione. Beyond the rate at which glutathione is regenerated, NAPQI forms covalent adducts with hepatocyte proteins and causes centrilobular necrosis. CYP2E1 induction by chronic alcohol and glutathione depletion by fasting or malnutrition both move the threshold downward without changing the milligram number on the box.',
        iconName: 'AlertOctagon',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What was measured, and where it failed',
        laymanDesc:
          'Measured: it lowers fever, and combined with ibuprofen it is one of the most effective single-dose analgesic regimens known. Failed: acute low back pain, where it matched placebo exactly, and osteoarthritis, where the effect is smaller than anyone can feel.',
        molecularDetail:
          'PACE: median recovery 17 days on regular paracetamol against 16 on placebo, hazard ratio 0.99 (0.87 to 1.14), n=1,652. Machado meta-analysis: osteoarthritis pain -3.7 on a 0-100 scale, low back pain -0.5. Network meta-analysis of 58,451 patients: no role for single-agent paracetamol in osteoarthritis at any dose. Combination with ibuprofen 400 mg: number needed to treat 1.5 (1.4 to 1.7).',
        iconName: 'ClipboardCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'PACE (Lancet 2014;384:1586-1596; ACTRN12609000966291)',
        phase: 'Randomised, double-dummy, placebo-controlled, three-arm primary care trial',
        sampleSize: 1652,
        primaryEndpoint:
          'Time until recovery from acute low back pain, recovery defined as a pain score of 0 or 1 on a 0-10 scale sustained for seven consecutive days',
        endpointMet: false,
        statisticalPValue:
          'Median 17 days (95% CI 14 to 19) on regular paracetamol, 17 days (15 to 20) as-needed and 16 days (14 to 20) on placebo; hazard ratio regular against placebo 0.99 (0.87 to 1.14), adjusted p=0.79',
        unreportedAdverseSignals:
          'Adherence was identical across arms (median 4.0 of a maximum 6 tablets per day in both the regular paracetamol and placebo groups), which excludes non-adherence as the explanation. Adverse events were reported by 18.5% on regular paracetamol and 18.5% on placebo.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'PATH-BP (NCT01997112)',
        phase: 'Randomised, double-blind, placebo-controlled crossover',
        sampleSize: 110,
        primaryEndpoint:
          'Change in mean daytime ambulatory systolic blood pressure from baseline to end of treatment, acetaminophen 1 g four times daily against placebo for two weeks',
        endpointMet: true,
        statisticalPValue:
          'Placebo-corrected increase of 4.7 mmHg in mean daytime systolic pressure (95% CI 2.9 to 6.6, p<0.0001) and 1.6 mmHg diastolic (0.5 to 2.7, p=0.005), in the 103 who completed both arms',
        unreportedAdverseSignals:
          'The endpoint is a surrogate and the trial was not powered for any clinical event. It tested regular 4 g daily dosing for two weeks in people already hypertensive, and says nothing directly about occasional use.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Cochrane CD010210 — pooled single-dose ibuprofen plus paracetamol trials',
        phase: 'Systematic review of three randomised, double-blind, placebo-controlled trials',
        sampleSize: 1647,
        primaryEndpoint:
          'Proportion of participants achieving at least 50% of maximum pain relief over six hours',
        endpointMet: true,
        statisticalPValue:
          '73% on ibuprofen 400 mg with paracetamol 1000 mg, 52% on ibuprofen 400 mg alone, 7% on placebo; number needed to treat 1.5 (95% CI 1.4 to 1.7) against placebo and 5.4 (3.5 to 12) against ibuprofen alone',
        unreportedAdverseSignals:
          'The models are predominantly dental extraction and the horizon is six hours. The review reports no arm of paracetamol alone against placebo at these doses, so the single-agent contribution cannot be read directly from it.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Median time to recovery from acute low back pain 17 days on paracetamol against 16 on placebo, hazard ratio 0.99 (0.87 to 1.14), in 1,652 randomised patients',
        'Osteoarthritis pain -3.7 points on a 0-100 scale (95% CI -5.5 to -1.9) — significant, and described by its own authors as not clinically important',
        'Placebo-corrected rise of 4.7 mmHg in daytime systolic blood pressure on 4 g daily in hypertensive patients',
        '46% of United States acute liver failure attributable to acetaminophen, with about 500 deaths, 50,000 emergency visits and 10,000 hospitalisations a year',
        'Number needed to treat 1.5 for ibuprofen 400 mg with paracetamol 1000 mg against placebo in postoperative pain',
        'No association with autism, ADHD or intellectual disability in a matched full-sibling analysis of 2,480,797 children',
      ],
      unsupportedInferences: [
        'That paracetamol works by inhibiting prostaglandin synthesis, or by any named mechanism — the label states the site and mechanism of the analgesic effect has not been determined',
        'That it is the appropriate first choice for low back pain or osteoarthritis, a guideline position that the randomised evidence has since reversed',
        'That being kind to the stomach makes it cardiovascularly neutral, when 4 g daily raised systolic pressure as much as ibuprofen did',
        'That the 4,000 mg daily ceiling is a threshold rather than a population average — chronic alcohol use, fasting and liver disease move the real threshold and the label carries no personalised figure',
      ],
      whatFailedInitially: [
        'PACE: no difference from placebo on time to recovery from acute low back pain, with adherence identical across arms',
        'The 2017 network meta-analysis of 58,451 osteoarthritis patients found no role for single-agent paracetamol at any dose',
        'The blood pressure effect that was assumed not to exist was measured at 4.7 mmHg in a randomised crossover trial',
        'The pregnancy neurodevelopment association reported in earlier cohorts disappeared under sibling control',
        'High-quality evidence found patients on paracetamol nearly four times as likely to have abnormal liver function tests as those on placebo (risk ratio 3.8, 1.9 to 7.4), of uncertain clinical significance',
      ],
      realWorldOutcome: [
        'Regulated in the United States chiefly under an over-the-counter monograph; the intravenous product OFIRMEV under NDA 022450; on the WHO Model List of Essential Medicines',
        'Under four United States cents per tablet at pharmacy acquisition cost across 170 listed generic products',
        'Since January 2014 prescription combination products have been limited to 325 mg of acetaminophen per dosage unit, down from 500, 650 and 750 mg formulations, following two FDA advisory committee meetings',
        'Remains the recommended first-line antipyretic in pregnancy and in infancy, positions that the sibling-control evidence supports',
        'Guideline bodies that listed it first-line for osteoarthritis and low back pain for two decades moved it down or off after 2015',
      ],
    },
    deliverySystem: {
      type: 'Oral tablets, caplets, chewables, oral suspensions and effervescent forms; rectal suppositories; an intravenous solution; and as a component of a very large number of combination products, prescription and over-the-counter',
      description:
        'Absorption from the gastrointestinal tract is rapid and almost complete, and complete within four hours in overdose. Distribution is relatively uniform through most body fluids and plasma protein binding is unusually low and variable — 20% to 50% at intoxication concentrations. Metabolism is hepatic: 80 to 85% conjugated with glucuronic acid and sulfate, a minor fraction oxidised by cytochrome P450 to the reactive N-acetyl-p-benzoquinone imine.',
      safetyProfile:
        'Boxed warning for hepatotoxicity: acetaminophen has been associated with cases of acute liver failure, at times resulting in liver transplant and death, and most cases of liver injury are associated with doses exceeding 4,000 mg per day and often involve more than one acetaminophen-containing product. It has none of the NSAID gastrointestinal, renal or antiplatelet effects and does not interfere with cardioprotective aspirin. Regular 4 g daily dosing raised daytime systolic blood pressure by 4.7 mmHg in hypertensive patients. The antidote to overdose is N-acetylcysteine, which is effective in proportion to how early it is given.',
    },
    commonQuestions: [
      {
        q: 'Does anyone actually know how paracetamol works?',
        a: 'No, and this is not a rhetorical flourish. The Clinical Pharmacology section of United States acetaminophen labelling states that the site and mechanism for the analgesic effect of acetaminophen has not been determined. It will name a mechanism for the fever effect — inhibition of endogenous pyrogen action on the hypothalamic heat-regulating centres — and it declines to name one for pain. The serious candidates in the literature include inhibition of a cyclooxygenase in the low-peroxide environment of the brain and spinal cord, an active metabolite called AM404 that acts at TRPV1 and cannabinoid receptors, and enhancement of the descending pathways that damp pain signals in the cord. They are mutually inconsistent and none is established. Seventy years and several billion doses a year have not settled it.',
        auditNote:
          'A drug without an identified target cannot have its dose, its ceiling or its interactions reasoned out from first principles. Everything known about paracetamol’s dosing is empirical.',
      },
      {
        q: 'My guideline says take paracetamol first for back pain. Is that still right?',
        a: 'Most guidelines have changed, and the reason is a single trial. PACE randomised 1,652 people with acute low back pain in Australian primary care to regular paracetamol, as-needed paracetamol, or placebo, all with the same advice. Median time to recovery was 17 days, 17 days and 16 days respectively — hazard ratio 0.99 against placebo, adjusted p=0.79 across the three groups. Adherence was identical in all three arms, so it was not that people failed to take it. Adverse events were identical too. The authors wrote that their findings question the universal endorsement of paracetamol in this patient group, and guideline bodies subsequently moved away from it as a first-line recommendation for acute low back pain.',
      },
      {
        q: 'Is it safe for my blood pressure? I was told to take it instead of ibuprofen.',
        a: 'That advice rests on an assumption that has now been tested and did not hold. PATH-BP gave 110 people with hypertension 1 g four times daily or matching placebo for two weeks each, in a crossover, with 24-hour ambulatory monitoring. Paracetamol raised mean daytime systolic pressure by a placebo-corrected 4.7 mmHg. For comparison, ibuprofen raised 24-hour systolic pressure by 3.7 mmHg in the PRECISION substudy. The trial studied regular maximum daily dosing for two weeks in people already hypertensive, and it says nothing directly about two tablets for a headache — but the assumption that paracetamol is blood-pressure neutral is no longer available.',
        auditNote:
          'This is a surrogate endpoint, not an outcome. Nobody has shown that this rise causes events. The point is that it is the same size as the rise from the drug it was chosen to replace.',
      },
      {
        q: 'How dangerous is it really? Everyone takes it.',
        a: 'At the doses on the box, for most people, it is very safe. The problem is the shape of the curve. Eighty-odd per cent of a dose is conjugated and excreted harmlessly; a small fraction becomes a reactive metabolite mopped up by glutathione. Below the glutathione limit, nothing happens; above it, liver cells die. That flat-then-vertical curve is why acetaminophen accounts for 46% of acute liver failure in the United States and 40 to 70% in Britain and Europe, with about 500 deaths, 50,000 emergency department visits and 10,000 hospitalisations a year. A large share of those are unintentional — someone taking a therapeutic dose of a cold remedy, a sleep aid and a prescription opioid combination that all contained acetaminophen. That is why the FDA capped prescription combination products at 325 mg per dosage unit from January 2014.',
      },
      {
        q: 'Is it safe in pregnancy? I have seen alarming headlines.',
        a: 'The strongest study to date says yes. A Swedish cohort followed 2,480,797 children born between 1995 and 2019, of whom 7.49% were exposed in utero. In conventional analysis, exposure was associated with slightly higher risk of autism (hazard ratio 1.05), ADHD (1.07) and intellectual disability (1.05) — small, and consistent with the earlier literature that produced the headlines. The study then compared full siblings within the same family, which controls for everything the family shares including genetics and the reasons a mother needed the drug. In that comparison the hazard ratios were 0.98, 0.98 and 1.01, with no dose-response. The authors concluded the earlier associations may have been familial confounding. Paracetamol remains the recommended first-line option for pain and fever in pregnancy.',
        auditNote:
          'A sibling-control design cannot rule out exposures that differ between pregnancies in the same family, and it reduces statistical power. It is still the most rigorous test the question has had.',
      },
      {
        q: 'If it barely works for arthritis, why take it at all?',
        a: 'Because "barely works alone" is not the same as "useless". It reliably lowers fever, it works for headache and for a range of acute pain, and combined with ibuprofen it produces one of the lowest numbers needed to treat ever recorded for a single-dose analgesic — 1.5 against placebo, against 52% response for ibuprofen alone. It also has none of the NSAID risks: no gastric bleeding, no renal effect, no interference with cardioprotective aspirin, so for someone on anticoagulants or with kidney disease it may be the only oral option. What the evidence has removed is the specific claim that single-agent paracetamol is an appropriate treatment for osteoarthritis or acute low back pain.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Williams CM, Maher CG, Latimer J, et al. Efficacy of paracetamol for acute low-back pain: a double-blind, randomised controlled trial (PACE). Lancet 2014;384:1586-1596',
        identifier: '10.1016/S0140-6736(14)60805-9',
        kind: 'doi',
      },
      {
        label:
          'Machado GC, Maher CG, Ferreira PH, et al. Efficacy and safety of paracetamol for spinal pain and osteoarthritis: systematic review and meta-analysis of randomised placebo controlled trials. BMJ 2015;350:h1225',
        identifier: '10.1136/bmj.h1225',
        kind: 'doi',
      },
      {
        label:
          'da Costa BR, Reichenbach S, Keller N, et al. Effectiveness of non-steroidal anti-inflammatory drugs for the treatment of pain in knee and hip osteoarthritis: a network meta-analysis. Lancet 2017;390:e21-e33',
        identifier: '10.1016/S0140-6736(17)31744-0',
        kind: 'doi',
      },
      {
        label:
          'MacIntyre IM, Turtle EJ, Farrah TE, et al. Regular Acetaminophen Use and Blood Pressure in People With Hypertension: The PATH-BP Trial. Circulation 2022;145:416-423',
        identifier: '10.1161/CIRCULATIONAHA.121.056015',
        kind: 'doi',
      },
      {
        label:
          'Lee WM. Acetaminophen (APAP) hepatotoxicity — Isn’t it time for APAP to go away? J Hepatol 2017;67:1324-1331',
        identifier: '10.1016/j.jhep.2017.07.005',
        kind: 'doi',
      },
      {
        label:
          'Ahlqvist VH, Sjöqvist H, Dalman C, et al. Acetaminophen Use During Pregnancy and Children’s Risk of Autism, ADHD, and Intellectual Disability. JAMA 2024;331:1205-1214',
        identifier: '10.1001/jama.2024.3172',
        kind: 'doi',
      },
      {
        label:
          'Derry CJ, Derry S, Moore RA. Single dose oral ibuprofen plus paracetamol (acetaminophen) for acute postoperative pain. Cochrane Database Syst Rev 2013;(6):CD010210',
        identifier: '10.1002/14651858.CD010210.pub2',
        kind: 'doi',
      },
      {
        label:
          'Oltean H, Robbins C, van Tulder MW, et al. Herbal medicine for low-back pain. Cochrane Database Syst Rev 2014;(12):CD004504',
        identifier: '10.1002/14651858.CD004504.pub4',
        kind: 'doi',
      },
      {
        label:
          'PATH-BP trial registration — randomised double-blind crossover of acetaminophen 1 g four times daily against placebo in people with hypertension',
        identifier: 'NCT01997112',
        kind: 'nct',
      },
      {
        label:
          'OFIRMEV (acetaminophen) injection Drugs@FDA application record, NDA 022450 — the intravenous product',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=022450',
        kind: 'regulatory',
      },
      {
        label:
          'Acetaminophen-containing prescribing information — boxed hepatotoxicity warning and Clinical Pharmacology section, retrieved from the openFDA drug label endpoint (ANDA 202677)',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22ACETAMINOPHEN%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 1983 (acetaminophen) — structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/1983',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 4. Aspirin — the drug that lost an indication. Three randomised trials in 2018 removed routine
  //    primary prevention; one of them found more deaths on aspirin than on placebo.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'aspirin',
    name: 'Aspirin',
    tradeName: 'Bayer Aspirin, Ecotrin, Durlaza; acetylsalicylic acid',
    sponsor:
      'Introduced by Bayer in 1899 and long out of patent. In the United States it is regulated chiefly under the over-the-counter internal analgesic and antiplatelet monographs rather than a single new drug application, and is made by a very large number of manufacturers; the enriched record lists Endo Operations among current sponsors',
    targetGene: 'PTGS1, and at higher concentrations PTGS2',
    targetProtein:
      'Prostaglandin-endoperoxide synthase 1 (cyclooxygenase-1), inactivated irreversibly by acetylation of the serine residue in the cyclooxygenase channel — the only NSAID that modifies the enzyme covalently rather than occupying it',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1950,
    indication:
      'Temporary relief of minor aches, pains and fever at analgesic doses; at low dose, for reducing the risk of death and recurrent events in people with established cardiovascular disease and in the setting of acute myocardial infarction, transient ischaemic attack and ischaemic stroke',
    patientFriendlyIndication:
      'Pain and fever; and, at low dose, preventing clots in people who already have heart or artery disease',
    anatomicalSite:
      'The cyclooxygenase channel of COX-1 inside the circulating platelet, which has no nucleus and therefore cannot replace the enzyme once it is acetylated',
    conditionContext: {
      conditionExplainer:
        'A heart attack or an ischaemic stroke usually begins with a platelet clump forming on a damaged artery wall. Aspirin permanently disables the enzyme platelets use to build the signal that recruits more platelets, so the clump is less likely to grow. The same permanence is why aspirin also causes bleeding that does not stop when you want it to.',
      whyItMatters:
        'Aspirin is the clearest example in modern medicine of an indication being withdrawn on evidence. For decades a daily low-dose aspirin was standard advice for healthy middle-aged and older adults. Three large randomised trials reported in 2018 — in the healthy elderly, in people at moderate risk, and in people with diabetes — and none of them found a net benefit. One found more deaths on aspirin than on placebo. In 2022 the US Preventive Services Task Force recommended against starting it for primary prevention at 60 and over.',
      whoTakesThis:
        'People with established atherosclerotic cardiovascular disease, for whom the case remains strong; and a very large number of people taking it for prevention who may no longer be advised to start it today. Not children or teenagers during viral illness, because of Reye’s syndrome.',
      clinicalGoals:
        'In established disease: fewer myocardial infarctions and strokes, at the cost of more bleeding, with the balance clearly favourable. In primary prevention: a small reduction in non-fatal myocardial infarction, no reduction in vascular death, and an increase in major bleeding — a balance that three trials found does not come out ahead.',
    },
    oneSentenceVerdict:
      'The only NSAID that inactivates its enzyme permanently, which is why 81 mg once a day suppresses platelets for a week — worth 6.7% against 8.2% serious vascular events per year in people who already have vascular disease, and not worth it in people who do not: in 19,114 healthy elderly adults it produced a cardiovascular hazard ratio of 0.95, a major-haemorrhage hazard ratio of 1.38 and an all-cause mortality hazard ratio of 1.14.',
    laymanHowItWorks:
      'Aspirin does something no other anti-inflammatory does: instead of sitting in the enzyme and then leaving, it chemically attaches a fragment of itself to the enzyme and wrecks it for good. In most cells that hardly matters, because the cell simply builds a new enzyme. A platelet cannot — it has no nucleus and no way to make new protein — so one small daily dose keeps every platelet in the bloodstream disarmed for its whole seven-to-ten-day life. That is the entire basis of low-dose aspirin for the heart. It is also why aspirin bleeding is different from other NSAID bleeding: you cannot switch it off by stopping the tablet, only by waiting for new platelets.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 70,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0164 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 68 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Patented by Bayer in 1900 and out of protection for over a century; the United States trademark was forfeited as a generic term in 1921. On the WHO Model List of Essential Medicines. At about one and a half United States cents per tablet it is the cheapest drug in this file, and among the cheapest medicines in existence — which is precisely what made the primary-prevention question worth settling with three trials costing many orders of magnitude more than the drug.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'What aspirin should be compared against depends entirely on why it is being taken. As a painkiller it has been superseded — ibuprofen and paracetamol are at least as effective and neither carries Reye’s syndrome or a week-long bleeding tail. As an antiplatelet in established disease it remains the reference standard and the cheapest option by a wide margin. As primary prevention in a healthy person, the comparator that beat it in three randomised trials was placebo.',
      conventionalRx: [
        {
          name: 'No antiplatelet at all, in primary prevention',
          class: 'The comparator arm of ASPREE, ARRIVE and ASCEND',
          howItCompares:
            'In 19,114 healthy adults aged 70 and over, aspirin gave a cardiovascular hazard ratio of 0.95 (95% CI 0.83 to 1.08) and a major haemorrhage hazard ratio of 1.38 (1.18 to 1.62, p<0.001). In 12,546 people at moderate risk, the primary endpoint occurred in 4.29% on aspirin against 4.48% on placebo (p=0.60) with gastrointestinal bleeding doubled. In 15,480 people with diabetes, serious vascular events fell from 9.6% to 8.5% (p=0.01) while major bleeding rose from 3.2% to 4.1% (p=0.003) — the trial’s own conclusion being that the absolute benefits were largely counterbalanced by the bleeding hazard.',
          typicalCost: 'Free',
          prosAndCons:
            'Pros: no bleeding excess; no drug. Cons: forgoes a real, small reduction in non-fatal myocardial infarction. The USPSTF now recommends against initiating aspirin for primary prevention at 60 and over, and calls it an individual decision at 40 to 59 with 10-year risk at or above 10%.',
        },
        {
          name: 'Clopidogrel and other P2Y12 inhibitors',
          class: 'Platelet ADP receptor antagonists',
          howItCompares:
            'Block a different platelet activation pathway and are used where aspirin is not tolerated, or alongside it after stenting. They do not acetylate anything and their effect recovers with drug clearance rather than with platelet turnover. They are substantially more expensive and, for clopidogrel, depend on CYP2C19 activation that a meaningful minority of people lack.',
          typicalCost:
            'Generic and inexpensive in the United States, though several-fold the price of aspirin at pharmacy acquisition cost',
          prosAndCons:
            'Pros: an option in true aspirin intolerance; no salicylate sensitivity or Reye’s risk. Cons: bleeding risk remains; clopidogrel requires metabolic activation; none has aspirin’s century of outcome data at this price.',
        },
        {
          name: 'Ibuprofen or paracetamol, where the purpose is pain or fever',
          class: 'Reversible cyclooxygenase inhibitor, or an analgesic of undetermined mechanism',
          howItCompares:
            'For pain and fever there is no remaining reason to choose aspirin. Both alternatives are at least as effective, neither is associated with Reye’s syndrome in children, and neither leaves a week-long antiplatelet tail before surgery or dentistry. Note the interaction in the other direction: ibuprofen taken before aspirin blocks aspirin’s antiplatelet effect entirely.',
          typicalCost:
            'US$0.0391 per ibuprofen tablet and US$0.0349 per acetaminophen tablet at United States pharmacy acquisition cost (CMS NADAC, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: no Reye’s risk, no irreversible platelet effect. Cons: ibuprofen carries the NSAID boxed warnings and cancels cardioprotective aspirin; paracetamol failed to beat placebo in acute low back pain.',
        },
      ],
      naturalFoods: [
        {
          name: 'White willow bark (Salix alba) standardised to salicin',
          activeCompound:
            'Salicin, hydrolysed to saligenin and oxidised to salicylic acid — the metabolite aspirin itself becomes',
          biologicalMechanism:
            'Willow bark is where salicylate medicine began, and it delivers salicylic acid rather than acetylsalicylic acid. That distinction is the whole point: without the acetyl group there is nothing to transfer to the platelet enzyme, so the anti-inflammatory effect is present and the irreversible antiplatelet effect is not.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: the Cochrane review of herbal medicine for low-back pain graded as moderate quality that daily doses standardised to 120 mg or 240 mg salicin are probably better than placebo for short-term pain, across two trials and 261 participants. The same review records a single 51-participant trial finding that willow bark minimally affected platelet thrombosis compared with a cardioprotective dose of acetylsalicylate — which is the clearest available statement that it is not a heart drug.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Never for a child or teenager with a viral illness',
          action:
            'Check every combination product for aspirin or salicylate before giving anything to a child with flu or chickenpox.',
          patientImpact:
            'Reye’s syndrome — encephalopathy with fatty degeneration of the liver, usually following influenza or varicella — was reported in 555 United States children in 1980 and in no more than 36 a year since 1987, after warnings about salicylates in children began. Detectable blood salicylate was found in 82% of reported cases and the overall case fatality rate was 31%.',
          clinicalPrecaution:
            'The decline followed the warnings so closely that it is one of the strongest natural experiments in drug safety. It is also why any child now suspected of Reye’s syndrome should be investigated for the treatable inborn metabolic disorders that mimic it.',
        },
        {
          name: 'Stopping it is not instant, and stopping it may be the risk',
          action:
            'Do not stop cardioprotective aspirin before a procedure without asking the person who prescribed it.',
          patientImpact:
            'Because the enzyme is destroyed rather than blocked, the antiplatelet effect persists until enough new platelets have entered the circulation — roughly seven to ten days. Conversely, stopping aspirin in someone with established vascular disease removes a protection that the randomised evidence shows is real.',
          clinicalPrecaution:
            'In established disease the balance is clear: serious vascular events fell from 8.2% to 6.7% per year on aspirin across 16 secondary prevention trials. The bleeding decision belongs with whoever knows both risks.',
        },
        {
          name: 'If you also take ibuprofen, the order matters',
          action: 'Say so if you regularly take ibuprofen alongside a cardioprotective aspirin.',
          patientImpact:
            'Ibuprofen occupies the same enzyme channel reversibly, and while it is there aspirin cannot reach the serine it must acetylate. Measured directly, ibuprofen given before aspirin abolished aspirin’s suppression of platelet aggregation, on single and on multiple daily dosing.',
          clinicalPrecaution:
            'Ibuprofen’s label says the interaction is alleviated by taking immediate-release aspirin at least two hours before once-daily ibuprofen, and that this cannot be extended to enteric-coated aspirin — which is the form most cardioprotective aspirin comes in.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(=O)OC1=CC=CC=C1C(=O)O',
      chemicalFormula: 'C9H8O4',
      molecularWeight: '180.16 g/mol',
      targetReceptorAffinity:
        'Affinity is the wrong measure for this molecule. Aspirin is a suicide substrate: it transfers its acetyl group to the serine hydroxyl in the cyclooxygenase channel and leaves as salicylic acid, so what matters is the rate of acetylation, not a dissociation constant. Acetylation of platelet COX-1 is essentially complete at doses far below the anti-inflammatory range, which is why 81 mg protects the heart and 3 g is needed for inflammation. In COX-2 the acetylated enzyme is not fully dead: it stops making prostaglandin H2 and starts making 15R-hydroxyeicosatetraenoic acid, the precursor of the aspirin-triggered lipoxins. Plasma half-life of aspirin itself is only about 15 to 20 minutes; the pharmacological effect outlives the molecule by a week because the damage is permanent.',
      structureSource: {
        label:
          'PubChem CID 2244 (aspirin) — canonical SMILES, molecular formula and weight, as carried on the enriched record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2244',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'asa-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Limit free salicylic acid, which is both an impurity and a hydrolysis product',
          description:
            'Aspirin hydrolyses to salicylic acid and acetic acid in the presence of moisture, so free salicylic acid measures both how well the batch was made and how well it has been stored. A bottle that smells of vinegar has already lost part of its acetyl content, and with it part of the only property that distinguishes aspirin from salicylate.',
          reagentsAndBuffer:
            'Aspirin and salicylic acid reference standards, ferric chloride colorimetric test or HPLC with ultraviolet detection at 280 nm, Karl Fischer titration, controlled-humidity stability chambers',
        },
        {
          id: 'asa-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Acetylate salicylic acid',
          description:
            'Salicylic acid plus acetic anhydride, with an acid catalyst, gives acetylsalicylic acid and acetic acid. It is a single step from a commodity feedstock and has been run industrially since 1899. Every downstream property of the drug follows from that one acetyl group.',
          dependsOnStepId: 'asa-w1',
          reagentsAndBuffer:
            'Salicylic acid, acetic anhydride, catalytic sulfuric or phosphoric acid, controlled temperature to limit di-acetyl and polymeric by-products, quench and crystallisation',
        },
        {
          id: 'asa-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallise dry, and keep it dry',
          description:
            'Purification and stability are the same problem for aspirin. Residual water and residual acid both drive hydrolysis, and the excipients chosen for a tablet — particularly basic ones — accelerate it. This is why aspirin is one of the few tablets with a genuine shelf-life smell test.',
          dependsOnStepId: 'asa-w2',
          reagentsAndBuffer:
            'Recrystallisation from ethanol or ethyl acetate, thorough drying under vacuum, excipient compatibility screening against basic diluents, X-ray powder diffraction, dissolution testing on plain and enteric-coated forms',
        },
        {
          id: 'asa-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Measure platelet COX-1 inactivation as serum thromboxane B2, at trough',
          description:
            'The pharmacologically meaningful measurement is not plasma aspirin concentration, which is gone within an hour, but the fraction of platelet thromboxane capacity destroyed. It must be measured at trough, 24 hours after a dose, because that is when the effect either persists or does not.',
          dependsOnStepId: 'asa-w3',
          reagentsAndBuffer:
            'Whole blood allowed to clot at 37 °C for one hour, serum thromboxane B2 immunoassay, sampling 24 hours after the last dose, arachidonic-acid-induced light transmission aggregometry as a functional confirmation',
        },
        {
          id: 'asa-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Distinguish true pharmacodynamic failure from non-adherence and formulation failure',
          description:
            'So-called aspirin resistance is a mixed category. Some of it is not taking the tablet, some is enteric-coated formulations absorbing poorly in a high-turnover setting, some is accelerated platelet turnover in diabetes or inflammation, and some is a concomitant ibuprofen. The assay only helps if the protocol can separate those, which means witnessed dosing and a parallel plain-aspirin arm.',
          dependsOnStepId: 'asa-w4',
          reagentsAndBuffer:
            'Witnessed dosing arm, plain against enteric-coated aspirin comparison, reticulated platelet fraction by flow cytometry, serum thromboxane B2 with a plasma salicylate level to confirm ingestion, ibuprofen exposure history',
        },
      ],
    },
    keyAudits: [
      {
        id: 'asa-a1',
        category: 'conclusion_shift',
        title: 'Three randomised trials in one year removed routine primary prevention',
        laymanSummary:
          'A daily aspirin for healthy adults was standard advice for a generation. In 2018, three large randomised trials reported — in healthy over-seventies, in people at moderate risk, and in people with diabetes — and none of them found a net benefit. In 2022 the US Preventive Services Task Force recommended against starting it at 60 and over.',
        technicalDetails:
          'ASPREE randomised 19,114 community-dwelling adults aged 70 and over (65 and over for black and Hispanic participants in the United States) with no cardiovascular disease, dementia or disability, to 100 mg enteric-coated aspirin or placebo, median follow-up 4.7 years. Cardiovascular disease occurred at 10.7 against 11.3 events per 1,000 person-years, hazard ratio 0.95 (95% CI 0.83 to 1.08); major haemorrhage at 8.6 against 6.2, hazard ratio 1.38 (1.18 to 1.62, p<0.001). ARRIVE randomised 12,546 people at moderate estimated risk to 100 mg or placebo over a median 60 months: primary endpoint 4.29% against 4.48% (hazard ratio 0.96, 0.81 to 1.13, p=0.60), gastrointestinal bleeding 0.97% against 0.46% (hazard ratio 2.11, 1.36 to 3.28, p=0.0007). ASCEND randomised 15,480 people with diabetes and no evident cardiovascular disease over a mean 7.4 years: serious vascular events 8.5% against 9.6% (rate ratio 0.88, 0.79 to 0.97, p=0.01) but major bleeding 4.1% against 3.2% (rate ratio 1.29, 1.09 to 1.52, p=0.003), with the trial concluding that the absolute benefits were largely counterbalanced by the bleeding hazard. The 2022 USPSTF statement concluded with moderate certainty that initiating aspirin for primary prevention at 60 or over has no net benefit, and made it an individual decision with small net benefit at 40 to 59 with 10-year risk at or above 10%.',
        evidenceSource:
          'McNeil JJ et al., N Engl J Med 2018;379:1509-1518 (ASPREE cardiovascular and bleeding); Gaziano JM et al., Lancet 2018;392:1036-1046 (ARRIVE); ASCEND Study Collaborative Group, N Engl J Med 2018;379:1529-1539; US Preventive Services Task Force, JAMA 2022;327:1577-1584',
        doi: '10.1056/NEJMoa1805819',
        measuredMetric:
          'Cardiovascular composite and major bleeding across 47,140 randomised primary-prevention participants in three trials',
        auditFlag: 'verified',
      },
      {
        id: 'asa-a2',
        category: 'failed',
        title: 'ASPREE found more deaths on aspirin than on placebo, driven by cancer',
        laymanSummary:
          'The healthy-elderly trial found a higher all-cause death rate on aspirin than on placebo — 12.7 against 11.1 per thousand person-years — and the excess was mostly cancer deaths. The investigators called it unexpected and said it should be interpreted with caution.',
        technicalDetails:
          'Among the 19,114 ASPREE participants there were 1,052 deaths over a median 4.7 years. All-cause mortality was 12.7 events per 1,000 person-years on aspirin against 11.1 on placebo, hazard ratio 1.14 (95% CI 1.01 to 1.29). Cancer was the major contributor, accounting for 1.6 excess deaths per 1,000 person-years; cancer-related death occurred in 3.1% of the aspirin group against 2.3% of placebo, hazard ratio 1.31 (1.10 to 1.56). This runs directly against a substantial prior literature suggesting aspirin reduces cancer incidence and mortality, and the authors said so, writing that in the context of previous studies the result was unexpected and should be interpreted with caution. Two honest readings coexist: this was a secondary endpoint with post hoc cause-of-death exploration in a trial not designed for it, and it is nevertheless the largest randomised mortality dataset in healthy older adults that exists. ASCEND, over a mean 7.4 years in 15,480 diabetic participants, found no difference in gastrointestinal tract cancer (2.0% against 2.0%) or in all cancers (11.6% against 11.5%).',
        evidenceSource:
          'McNeil JJ, Nelson MR, Woods RL, et al. Effect of Aspirin on All-Cause Mortality in the Healthy Elderly. N Engl J Med 2018;379:1519-1528',
        doi: '10.1056/NEJMoa1803955',
        measuredMetric:
          'All-cause and cancer-specific mortality per 1,000 person-years, aspirin against placebo, in 19,114 healthy older adults',
        auditFlag: 'caution',
      },
      {
        id: 'asa-a3',
        category: 'measured',
        title: 'In people who already have vascular disease, the case is unambiguous',
        laymanSummary:
          'The argument is only about healthy people. In those who have already had a heart attack or stroke, pooled individual data from 16 trials show serious vascular events falling from 8.2% a year to 6.7% — a much larger absolute benefit than any bleeding cost.',
        technicalDetails:
          'The Antithrombotic Trialists’ Collaboration pooled individual participant data from 16 secondary prevention trials — 17,000 individuals at high average risk, 43,000 person-years, 3,306 serious vascular events. Aspirin allocation gave serious vascular events at 6.7% against 8.2% per year (p<0.0001), total stroke 2.08% against 2.54% (p=0.002) and coronary events 4.3% against 5.3% (p<0.0001), with a non-significant increase in haemorrhagic stroke. The proportional reductions were similar in men and women. This is the indication that survives every reanalysis, and the reason the primary-prevention retreat is not an argument for stopping aspirin in someone who has established disease. Separately, ADAPTABLE randomised 15,076 patients with established atherosclerotic cardiovascular disease to 81 mg or 325 mg daily and found no significant difference in the composite of death, myocardial infarction or stroke (7.28% against 7.51%, hazard ratio 1.02, 0.91 to 1.14) — though 41.6% of those assigned 325 mg switched dose, which limits what the comparison can carry.',
        evidenceSource:
          'Antithrombotic Trialists’ (ATT) Collaboration. Aspirin in the primary and secondary prevention of vascular disease: collaborative meta-analysis of individual participant data from randomised trials. Lancet 2009;373:1849-1860; Jones WS et al., N Engl J Med 2021;384:1981-1990 (ADAPTABLE)',
        doi: '10.1016/S0140-6736(09)60503-1',
        measuredMetric:
          'Annual rate of serious vascular events, total stroke and coronary events in 16 secondary prevention trials',
        auditFlag: 'verified',
      },
      {
        id: 'asa-a4',
        category: 'inferred',
        title: 'The people most likely to benefit are the same people most likely to bleed',
        laymanSummary:
          'The old advice assumed you could target aspirin at people whose heart risk was high enough to justify the bleeding. The pooled data say the two risks travel together: the things that make a heart attack likely also make a bleed likely, so the targeting does not separate them.',
        technicalDetails:
          'In the six primary prevention trials pooled by the Antithrombotic Trialists’ Collaboration — 95,000 individuals, 660,000 person-years, 3,554 serious vascular events — aspirin gave a 12% proportional reduction in serious vascular events (0.51% against 0.57% per year, p=0.0001), almost entirely from a fifth reduction in non-fatal myocardial infarction (0.18% against 0.23%, p<0.0001). The net effect on stroke was not significant (0.20% against 0.21%, p=0.4) and vascular mortality did not differ at all (0.19% against 0.19%, p=0.7). Major gastrointestinal and extracranial bleeds rose from 0.07% to 0.10% per year (p<0.0001). The sentence that matters for practice is the collaboration’s own: the main risk factors for coronary disease were also risk factors for bleeding. That is why a risk-stratification strategy does not rescue primary prevention — moving up the cardiovascular risk scale moves you up the bleeding scale at the same time.',
        evidenceSource:
          'Antithrombotic Trialists’ (ATT) Collaboration, Lancet 2009;373:1849-1860, primary prevention analysis',
        doi: '10.1016/S0140-6736(09)60503-1',
        inferredClaim:
          'That people at high cardiovascular risk can be selected for aspirin prophylaxis on the assumption their bleeding risk is independent — an assumption the pooled data contradict',
        auditFlag: 'caution',
      },
      {
        id: 'asa-a5',
        category: 'conclusion_shift',
        title:
          'Reye’s syndrome removed aspirin from childhood, and the case count followed within years',
        laymanSummary:
          'Aspirin was the standard children’s fever medicine. After the association with a rare fatal encephalopathy was recognised in 1980, warnings were issued and reported cases fell from 555 a year to fewer than 36 — and stayed there.',
        technicalDetails:
          'National surveillance in the United States recorded 1,207 cases of Reye’s syndrome in people under 18 between December 1980 and November 1997. Reported cases peaked at 555 in children in 1980 and there have been no more than 36 per year since 1987. Antecedent illness was reported in 93% and detectable blood salicylate in 82%; the overall case fatality rate was 31%, highest in children under five (relative risk 1.8, 95% CI 1.5 to 2.1) and in those with a serum ammonia above 45 µg/dL (relative risk 3.4, 1.9 to 6.2). The decline tracked the warnings closely enough that this is among the cleanest natural experiments in pharmacovigilance — and because Reye’s syndrome is now very rare, the surveillance authors note that any child suspected of it should be investigated for the treatable inborn metabolic disorders that mimic it. Aspirin remains contraindicated in children and teenagers with viral illness, and its role as a paediatric antipyretic is gone entirely.',
        evidenceSource:
          'Belay ED, Bresee JS, Holman RC, et al. Reye’s syndrome in the United States from 1981 through 1997. N Engl J Med 1999;340:1377-1382',
        doi: '10.1056/NEJM199905063401801',
        measuredMetric:
          'Annual reported Reye’s syndrome cases before and after salicylate warnings, salicylate detection rate and case fatality',
        auditFlag: 'verified',
      },
      {
        id: 'asa-a6',
        category: 'conclusion_shift',
        title: 'The cancer story goes both ways, and the dose and population decide which',
        laymanSummary:
          'Aspirin genuinely prevents colorectal cancer in people with an inherited predisposition, at a high dose, over years. In healthy older adults on a low dose, the largest randomised trial found more cancer deaths, not fewer. Both results are real and they are about different questions.',
        technicalDetails:
          'CAPP2 randomised 861 carriers of Lynch syndrome to 600 mg aspirin daily or placebo for up to four years. At a mean 55.7 months, 48 participants had developed 53 primary colorectal cancers — 18 of 427 on aspirin against 30 of 434 on placebo. Intention-to-treat time-to-first-cancer gave a hazard ratio of 0.63 (95% CI 0.35 to 1.13, p=0.12); Poisson regression accounting for multiple primaries gave an incidence rate ratio of 0.56 (0.32 to 0.99, p=0.05); per protocol among those completing two years of intervention, hazard ratio 0.41 (0.19 to 0.86, p=0.02). Against that, ASPREE in 19,114 healthy older adults on 100 mg found cancer-related death in 3.1% against 2.3% on placebo (hazard ratio 1.31, 1.10 to 1.56), and ASCEND in 15,480 diabetic participants on 100 mg over 7.4 years found no difference in gastrointestinal tract cancer (2.0% against 2.0%) or all cancers (11.6% against 11.5%). The honest summary is that a high-dose, high-genetic-risk, long-duration chemoprevention result does not transfer to a low-dose, average-risk, older population, and the field has stopped treating "aspirin prevents cancer" as a single claim.',
        evidenceSource:
          'Burn J, Gerdes AM, Macrae F, et al. Long-term effect of aspirin on cancer risk in carriers of hereditary colorectal cancer: an analysis from the CAPP2 randomised controlled trial. Lancet 2011;378:2081-2087; McNeil JJ et al., N Engl J Med 2018;379:1519-1528',
        doi: '10.1016/S0140-6736(11)61049-0',
        measuredMetric:
          'Colorectal cancer incidence in Lynch syndrome carriers at 600 mg daily, against cancer mortality in healthy older adults at 100 mg daily',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A drug that destroys its target and then leaves',
        laymanDesc:
          'Aspirin does not block the enzyme. It hands over a small chemical group, permanently jams the enzyme with it, and departs as a different molecule. The aspirin is gone from the blood within an hour; the damage stays.',
        molecularDetail:
          'Acetylsalicylic acid transfers its acetyl group to the serine hydroxyl in the cyclooxygenase channel of PTGS1 and leaves as salicylic acid. Plasma half-life of the parent is about 15 to 20 minutes. This is a suicide-substrate mechanism, unique among the NSAIDs, and the reason a dissociation constant is not the right way to describe its potency.',
        iconName: 'Zap',
        visualStage: 'target_binding',
      },
      {
        step: 2,
        title: 'A platelet cannot repair itself',
        laymanDesc:
          'Most cells shrug this off and build a new enzyme within hours. A platelet has no nucleus and cannot make new protein, so it stays disarmed for its whole seven-to-ten-day life. That single fact is why 81 mg once a day works.',
        molecularDetail:
          'Anucleate platelets cannot resynthesise COX-1, so cumulative daily dosing at levels far below the anti-inflammatory range produces near-complete and sustained suppression of platelet thromboxane A2 generation. Nucleated cells recover within hours, which is why low-dose aspirin is antiplatelet without being anti-inflammatory.',
        iconName: 'BatteryLow',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Less thromboxane, smaller clumps',
        laymanDesc:
          'Thromboxane is the signal a platelet releases to recruit other platelets to a damaged artery wall. Suppress it and the growing clump stays smaller — which prevents some heart attacks and strokes, and also means some bleeds do not stop.',
        molecularDetail:
          'Thromboxane A2 amplifies platelet activation and causes vasoconstriction. Its suppression is measured as serum thromboxane B2 at trough. The therapeutic effect and the haemorrhagic effect are the same pharmacology observed at different sites, which is why no dose separates them.',
        iconName: 'Activity',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'At high dose it becomes an ordinary anti-inflammatory, with ordinary costs',
        laymanDesc:
          'The gram-level doses used for pain and inflammation also block the enzyme in the stomach lining and everywhere else. That is the aspirin people took for headaches for a century, and it is the reason it has been superseded for that job.',
        molecularDetail:
          'Anti-inflammatory activity requires sustained inhibition of COX-2 and of COX-1 in nucleated cells, which needs doses roughly thirty to forty times the antiplatelet dose. Acetylated COX-2 is not inert: it stops producing prostaglandin H2 and begins producing 15R-HETE, the precursor of aspirin-triggered lipoxins.',
        iconName: 'Layers',
        visualStage: 'delivery',
      },
      {
        step: 5,
        title: 'The benefit depends entirely on who is taking it',
        laymanDesc:
          'In someone who has already had a heart attack, aspirin cuts serious vascular events from about 8.2% a year to 6.7%. In a healthy seventy-year-old, it changes cardiovascular events not at all and raises major bleeding by 38%.',
        molecularDetail:
          'Secondary prevention, 16 trials: 6.7% against 8.2% per year (p<0.0001). ASPREE primary prevention, 19,114 participants: cardiovascular hazard ratio 0.95 (0.83 to 1.08), major haemorrhage hazard ratio 1.38 (1.18 to 1.62, p<0.001), all-cause mortality hazard ratio 1.14 (1.01 to 1.29). The pharmacology is identical in both populations; only the baseline event rate differs.',
        iconName: 'Users',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What was measured, and what was withdrawn',
        laymanDesc:
          'Measured and kept: secondary prevention, and the acute treatment of a heart attack. Withdrawn: routine primary prevention in healthy adults, and all paediatric use during viral illness.',
        molecularDetail:
          'USPSTF 2022: initiating aspirin for primary prevention at 60 and over has no net benefit; at 40 to 59 with 10-year risk of 10% or more the net benefit is small and the decision individual. Reye’s syndrome surveillance: 555 reported paediatric cases in 1980, no more than 36 a year since 1987, salicylate detectable in 82% of cases, case fatality 31%.',
        iconName: 'FileMinus',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'NCT01038583 (ASPREE)',
        phase: 'Phase 4, randomised, double-blind, placebo-controlled primary prevention',
        sampleSize: 19114,
        primaryEndpoint:
          'Disability-free survival — a composite of death, dementia or persistent physical disability; cardiovascular disease, major haemorrhage and all-cause mortality reported as secondary endpoints',
        endpointMet: false,
        statisticalPValue:
          'Cardiovascular disease 10.7 against 11.3 events per 1,000 person-years, hazard ratio 0.95 (95% CI 0.83 to 1.08); major haemorrhage 8.6 against 6.2, hazard ratio 1.38 (1.18 to 1.62), p<0.001; all-cause mortality 12.7 against 11.1, hazard ratio 1.14 (1.01 to 1.29)',
        unreportedAdverseSignals:
          'Cancer accounted for 1.6 excess deaths per 1,000 person-years, with cancer-related death in 3.1% on aspirin against 2.3% on placebo (hazard ratio 1.31, 1.10 to 1.56). The investigators described this as unexpected in the context of previous studies and said it should be interpreted with caution; the cause-of-death analyses were post hoc.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'NCT00501059 (ARRIVE)',
        phase: 'Randomised, double-blind, placebo-controlled, multicentre',
        sampleSize: 12546,
        primaryEndpoint:
          'Time to first occurrence of cardiovascular death, myocardial infarction, unstable angina, stroke or transient ischaemic attack, in people at moderate estimated risk',
        endpointMet: false,
        statisticalPValue:
          '269 (4.29%) on aspirin against 281 (4.48%) on placebo, hazard ratio 0.96 (95% CI 0.81 to 1.13), p=0.6038, over a median 60 months; gastrointestinal bleeding 0.97% against 0.46%, hazard ratio 2.11 (1.36 to 3.28), p=0.0007',
        unreportedAdverseSignals:
          'The observed event rate was much lower than the design assumed, which the investigators attributed to contemporary risk management and which makes the enrolled population effectively low-risk rather than moderate-risk. Their own interpretation is that the role of aspirin at moderate risk could therefore not be addressed by this trial.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'NCT00135226 / ISRCTN60635500 (ASCEND)',
        phase: 'Randomised, double-blind, placebo-controlled primary prevention in diabetes',
        sampleSize: 15480,
        primaryEndpoint:
          'First serious vascular event — myocardial infarction, stroke or transient ischaemic attack, or death from any vascular cause excluding confirmed intracranial haemorrhage',
        endpointMet: true,
        statisticalPValue:
          'Serious vascular events 658 (8.5%) against 743 (9.6%), rate ratio 0.88 (95% CI 0.79 to 0.97), p=0.01, over a mean 7.4 years; major bleeding 314 (4.1%) against 245 (3.2%), rate ratio 1.29 (1.09 to 1.52), p=0.003',
        unreportedAdverseSignals:
          'The efficacy endpoint was met and the trial still concluded against routine use: the absolute benefits were largely counterbalanced by the bleeding hazard. No difference was seen in gastrointestinal tract cancer (2.0% against 2.0%) or all cancers (11.6% against 11.5%).',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Serious vascular events 6.7% against 8.2% per year in 16 secondary prevention trials (p<0.0001)',
        'Cardiovascular hazard ratio 0.95 (0.83 to 1.08) and major haemorrhage hazard ratio 1.38 (1.18 to 1.62) in 19,114 healthy adults aged 70 and over',
        'All-cause mortality hazard ratio 1.14 (1.01 to 1.29) in the same trial, with cancer death 3.1% against 2.3%',
        'Serious vascular events 8.5% against 9.6% and major bleeding 4.1% against 3.2% in 15,480 people with diabetes',
        'Primary prevention: a 12% proportional reduction in serious vascular events, no reduction in vascular mortality, and major bleeds rising from 0.07% to 0.10% per year',
        'Reported paediatric Reye’s syndrome fell from 555 cases in 1980 to no more than 36 a year from 1987, with salicylate detectable in 82% of cases',
      ],
      unsupportedInferences: [
        'That a daily aspirin is a sensible default for a healthy adult — three randomised trials totalling 47,140 participants found no net benefit',
        'That people at higher cardiovascular risk can be selected for prophylaxis, when the main risk factors for coronary disease are also risk factors for bleeding',
        'That aspirin prevents cancer as a general proposition — the effect is demonstrated at 600 mg in Lynch syndrome carriers and reversed in direction in healthy older adults on 100 mg',
        'That the antiplatelet effect can be judged from the plasma level of a drug with a 15-to-20-minute half-life',
      ],
      whatFailedInitially: [
        'Primary prevention in the healthy elderly: no cardiovascular benefit, 38% more major haemorrhage, 14% higher all-cause mortality',
        'Primary prevention at moderate risk: no difference in the composite, with gastrointestinal bleeding doubled',
        'Primary prevention in diabetes: the vascular endpoint was met and the bleeding excess cancelled it',
        'Paediatric antipyretic use, withdrawn entirely after the Reye’s syndrome association',
        'The cancer-prevention claim, which reversed direction between populations and doses',
      ],
      realWorldOutcome: [
        'Introduced by Bayer in 1899; the United States trademark was ruled generic in 1921 and the drug has been off patent for over a century',
        'About one and a half United States cents per tablet at pharmacy acquisition cost, across 68 listed generic products; on the WHO Model List of Essential Medicines',
        'Remains standard of care in established atherosclerotic cardiovascular disease and in acute myocardial infarction, where the randomised evidence is unambiguous',
        'The 2022 USPSTF statement recommends against initiating it for primary prevention at 60 and over, reversing decades of population advice',
        'ADAPTABLE could not separate 81 mg from 325 mg in established disease, in part because 41.6% of those assigned the higher dose switched to the lower one',
      ],
    },
    deliverySystem: {
      type: 'Oral immediate-release, enteric-coated, chewable and extended-release tablets, and rectal suppositories; low-dose (typically 75-100 mg) for antiplatelet use and gram-level doses for analgesia',
      description:
        'Absorbed rapidly from the stomach and upper small intestine, with a plasma half-life for the parent molecule of only about 15 to 20 minutes before hydrolysis to salicylic acid. The pharmacological effect is entirely disconnected from that half-life because platelet inhibition is irreversible and lasts the platelet’s seven-to-ten-day lifespan. Enteric coating reduces gastric contact but also slows and can reduce absorption, which matters when a rapid effect is wanted — chewing an immediate-release tablet is the standard approach in a suspected acute coronary syndrome.',
      safetyProfile:
        'Bleeding is the dominant risk and it cannot be reversed by stopping the drug; only new platelets restore function. Major haemorrhage rose 38% against placebo in healthy older adults and gastrointestinal bleeding roughly doubled at moderate risk. Contraindicated in children and teenagers with viral illness because of Reye’s syndrome. Cross-reactive bronchospasm occurs in aspirin-sensitive asthma and can be fatal. Ibuprofen taken before aspirin abolishes the antiplatelet effect. Risk of bleeding is additive with anticoagulants, with other NSAIDs and with SSRIs.',
    },
    commonQuestions: [
      {
        q: 'Should I take a daily aspirin to prevent a heart attack?',
        a: 'If you have never had one, the answer has changed and the change is well evidenced. Three randomised trials reported in 2018 in a combined 47,140 people — healthy over-seventies, people at moderate risk, and people with diabetes — and none found a net benefit. In the healthy elderly, cardiovascular events were unchanged (hazard ratio 0.95) while major haemorrhage rose 38% and all-cause mortality was higher on aspirin than placebo. In diabetes, the vascular benefit was real and statistically significant, and the trial still concluded that the absolute benefit was largely counterbalanced by the bleeding. In 2022 the US Preventive Services Task Force recommended against initiating aspirin for primary prevention from age 60, and made it an individual decision from 40 to 59 for people with a 10-year risk of 10% or more. If you have already had a heart attack or stroke, none of this applies to you and the case for aspirin remains strong.',
        auditNote:
          'This is a genuine reversal on randomised evidence, not a shift in fashion. The trials were designed to answer this exact question and they answered it.',
      },
      {
        q: 'I have been taking one for years. Should I stop?',
        a: 'Not on the basis of a web page. The 2018 trials and the 2022 recommendation are about initiating aspirin, and they say very little about someone who has been taking it for a decade without a bleed — a group those trials did not enrol. Stopping is also not a neutral act: there is evidence that discontinuation in people with established vascular disease raises event rates. The distinction that matters is whether you have established cardiovascular disease. If you do, the pooled evidence from 16 trials shows serious vascular events falling from 8.2% to 6.7% per year and the case is clear. If you do not, it is a conversation worth having.',
      },
      {
        q: 'Why does a tiny 81 mg dose work when a painkiller dose is 300 mg or more?',
        a: 'Because the two doses are doing different jobs to different cells. Aspirin permanently destroys the enzyme rather than blocking it. A normal cell simply builds a replacement within hours, so you need a large, repeated dose to keep inflammation suppressed. A platelet has no nucleus and cannot build anything, so once its enzyme is acetylated it stays disarmed for its entire seven-to-ten-day life. A small daily dose is enough to catch each new platelet as it enters the circulation. That is also why the antiplatelet effect has nothing to do with aspirin’s blood level — the molecule is cleared within about twenty minutes and the effect lasts a week.',
      },
      {
        q: 'Can children take aspirin?',
        a: 'No, not during a viral illness, and in practice not as a routine antipyretic at all. Reye’s syndrome — encephalopathy with fatty degeneration of the liver, typically after influenza or chickenpox — killed about a third of the children who developed it. After warnings about salicylates in children began in 1980, reported United States cases fell from 555 in that year to no more than 36 a year from 1987 onward, and stayed there. Detectable blood salicylate was found in 82% of reported cases. Paracetamol and ibuprofen carry no such association and have replaced it entirely.',
      },
      {
        q: 'Does aspirin prevent cancer?',
        a: 'In one specific setting, yes, and the general claim has not held up. CAPP2 randomised 861 carriers of Lynch syndrome — an inherited predisposition to colorectal cancer — to 600 mg of aspirin daily or placebo for up to four years, and at a mean of 55.7 months found colorectal cancers in 18 of 427 on aspirin against 30 of 434 on placebo, an incidence rate ratio of 0.56 (p=0.05), with a stronger per-protocol result. That is a high dose, in a high-risk genetic population, for years. In the opposite direction, ASPREE found more cancer deaths on 100 mg daily in healthy older adults (3.1% against 2.3%), and ASCEND found no difference in cancer at all over 7.4 years. The field has stopped treating this as one question.',
        auditNote:
          'The ASPREE cancer signal was a post hoc analysis of a secondary endpoint and the investigators themselves called it unexpected. It is reported here because a page that omitted it would be reporting only the reassuring half.',
      },
      {
        q: 'Is enteric-coated aspirin safer for my stomach?',
        a: 'It reduces direct contact between the tablet and the gastric lining, which reduces immediate irritation. It does not remove the bleeding risk, because most of that risk comes from systemic suppression of the prostaglandins that protect the mucosa, reaching the stomach through the bloodstream. Enteric coating also has a cost the label makes explicit elsewhere: absorption is slower and can be less complete, which is why an immediate-release tablet is chewed rather than swallowed in a suspected heart attack, and why the ibuprofen label says the two-hour separation trick that rescues plain aspirin cannot be extended to the enteric-coated form.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'McNeil JJ, Wolfe R, Woods RL, et al. Effect of Aspirin on Cardiovascular Events and Bleeding in the Healthy Elderly (ASPREE). N Engl J Med 2018;379:1509-1518',
        identifier: '10.1056/NEJMoa1805819',
        kind: 'doi',
      },
      {
        label:
          'McNeil JJ, Nelson MR, Woods RL, et al. Effect of Aspirin on All-Cause Mortality in the Healthy Elderly (ASPREE). N Engl J Med 2018;379:1519-1528',
        identifier: '10.1056/NEJMoa1803955',
        kind: 'doi',
      },
      {
        label:
          'Gaziano JM, Brotons C, Coppolecchia R, et al. Use of aspirin to reduce risk of initial vascular events in patients at moderate risk of cardiovascular disease (ARRIVE). Lancet 2018;392:1036-1046',
        identifier: '10.1016/S0140-6736(18)31924-X',
        kind: 'doi',
      },
      {
        label:
          'ASCEND Study Collaborative Group. Effects of Aspirin for Primary Prevention in Persons with Diabetes Mellitus. N Engl J Med 2018;379:1529-1539',
        identifier: '10.1056/NEJMoa1804988',
        kind: 'doi',
      },
      {
        label:
          'Antithrombotic Trialists’ (ATT) Collaboration. Aspirin in the primary and secondary prevention of vascular disease: collaborative meta-analysis of individual participant data from randomised trials. Lancet 2009;373:1849-1860',
        identifier: '10.1016/S0140-6736(09)60503-1',
        kind: 'doi',
      },
      {
        label:
          'US Preventive Services Task Force. Aspirin Use to Prevent Cardiovascular Disease: US Preventive Services Task Force Recommendation Statement. JAMA 2022;327:1577-1584',
        identifier: '10.1001/jama.2022.4983',
        kind: 'doi',
      },
      {
        label:
          'Belay ED, Bresee JS, Holman RC, et al. Reye’s syndrome in the United States from 1981 through 1997. N Engl J Med 1999;340:1377-1382',
        identifier: '10.1056/NEJM199905063401801',
        kind: 'doi',
      },
      {
        label:
          'Burn J, Gerdes AM, Macrae F, et al. Long-term effect of aspirin on cancer risk in carriers of hereditary colorectal cancer: an analysis from the CAPP2 randomised controlled trial. Lancet 2011;378:2081-2087',
        identifier: '10.1016/S0140-6736(11)61049-0',
        kind: 'doi',
      },
      {
        label:
          'Jones WS, Mulder H, Wruck LM, et al. Comparative Effectiveness of Aspirin Dosing in Cardiovascular Disease (ADAPTABLE). N Engl J Med 2021;384:1981-1990',
        identifier: '10.1056/NEJMoa2102137',
        kind: 'doi',
      },
      {
        label:
          'Catella-Lawson F, Reilly MP, Kapoor SC, et al. Cyclooxygenase inhibitors and the antiplatelet effects of aspirin. N Engl J Med 2001;345:1809-1817',
        identifier: '10.1056/NEJMoa003199',
        kind: 'doi',
      },
      {
        label:
          'Oltean H, Robbins C, van Tulder MW, et al. Herbal medicine for low-back pain. Cochrane Database Syst Rev 2014;(12):CD004504',
        identifier: '10.1002/14651858.CD004504.pub4',
        kind: 'doi',
      },
      {
        label: 'ASPREE trial registration — 19,114 participants aged 70 and over',
        identifier: 'NCT01038583',
        kind: 'nct',
      },
      {
        label: 'PubChem CID 2244 (aspirin) — structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2244',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 5. Diclofenac — the world’s most-used NSAID, whose randomised cardiovascular risk profile is
  //    the one that got rofecoxib withdrawn, and which is also the most effective of the class.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'diclofenac',
    name: 'Diclofenac',
    tradeName: 'Voltaren, Cataflam, Voltaren Arthritis Pain (topical gel), Solaraze',
    sponsor:
      'Developed at Geigy and marketed by Novartis; United States NDA 019201 (VOLTAREN, diclofenac sodium delayed-release) and NDA 020142 (CATAFLAM, diclofenac potassium), with the topical gel approved under NDA 022122 and now held by Haleon US Holdings following its switch to over-the-counter status',
    targetGene: 'PTGS2, and PTGS1',
    targetProtein:
      'Prostaglandin-endoperoxide synthase 2 (cyclooxygenase-2), inhibited with a selectivity ratio in whole-blood assays comparable to that of celecoxib, and cyclooxygenase-1 at higher occupancy',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1988,
    indication:
      'Relief of the signs and symptoms of osteoarthritis, rheumatoid arthritis and ankylosing spondylitis; treatment of acute pain and primary dysmenorrhoea; topically for the relief of osteoarthritis pain in joints amenable to topical treatment',
    patientFriendlyIndication: 'Arthritis pain and inflammation',
    anatomicalSite:
      'The cyclooxygenase channel, preferentially COX-2 in inflamed synovium and vascular endothelium; the topical formulation acts in the joint tissue under the skin it is applied to',
    conditionContext: {
      conditionExplainer:
        'Diclofenac blocks the enzyme that manufactures the inflammatory messengers in an arthritic joint, and it does so with an unusual bias toward the form of the enzyme that appears during inflammation. That bias is what makes it the most effective NSAID for osteoarthritis pain, and it is also what makes it behave like a coxib in the cardiovascular system.',
      whyItMatters:
        'Diclofenac is the most-used non-steroidal anti-inflammatory in the world, with a market share across fifteen countries close to that of the next three drugs combined. Its measured cardiovascular risk is very similar to that of rofecoxib, which was withdrawn from every market on earth for cardiovascular toxicity. Both statements are from the same peer-reviewed literature and they are usually not put next to each other.',
      whoTakesThis:
        'People with osteoarthritis, rheumatoid arthritis and ankylosing spondylitis, and enormous numbers of people worldwide buying it over the counter. It is contraindicated in the setting of coronary artery bypass graft surgery and, in several jurisdictions, in established ischaemic heart disease, cerebrovascular disease, peripheral arterial disease and moderate-to-severe heart failure.',
      clinicalGoals:
        'Measurably better pain and function in an arthritic joint than any other NSAID at a maximally approved dose. No effect on joint structure or disease course.',
    },
    oneSentenceVerdict:
      'The most effective NSAID for osteoarthritis pain in a network meta-analysis of 58,451 patients (effect size -0.57, 100% probability of clinical relevance) and the one whose cardiovascular risk profile is closest to the withdrawn rofecoxib — major vascular events up 41% in randomised trials, major adverse cardiovascular events up 50% within 30 days of starting it in 1.37 million Danish initiators, including at low doses.',
    laymanHowItWorks:
      'Diclofenac blocks the two enzymes that build prostaglandins, the messengers that make an inflamed joint hurt and swell. What separates it from ibuprofen is which of the two enzymes it prefers: diclofenac leans heavily toward COX-2, the form that appears during inflammation, in about the same ratio as the drugs that were designed and marketed as selective COX-2 inhibitors. That bias buys the best pain relief of any NSAID in arthritis. It also tips the balance in blood vessels — the same shift that made the coxibs raise heart attack risk — and the measured cardiovascular numbers for diclofenac sit alongside theirs rather than alongside ibuprofen’s.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 66,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0829 per gram of diclofenac sodium at United States pharmacy acquisition cost (CMS NADAC, median across 149 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States in 1988 under NDA 019201 and long generic. The topical gel completed a prescription-to-over-the-counter switch in the United States under NDA 022122, so the formulation with the least systemic exposure is the one now sold without a prescription there. In much of the rest of the world the oral tablet is available over the counter, and it is not on the WHO Model List of Essential Medicines — while being listed on 74 national essential medicines lists as of 2013.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Diclofenac is the drug you choose when arthritis pain is the whole problem and the cardiovascular ledger is genuinely empty, and the drug you avoid when it is not. The substitution that changes the most is not to another molecule but to another route: topical diclofenac delivers a measured benefit in a superficial joint with a small fraction of the systemic exposure that produces the vascular numbers.',
      conventionalRx: [
        {
          name: 'Topical diclofenac gel or solution — the same molecule, a different route',
          class: 'Cyclooxygenase inhibitor applied over the joint',
          howItCompares:
            'In the Cochrane review of topical NSAIDs for chronic musculoskeletal pain — 39 studies and 10,631 participants, all in osteoarthritis — topical diclofenac over 6 to 12 weeks gave a number needed to treat for clinical success of 9.8 (95% CI 7.1 to 16) across six trials and 2,343 participants, with about 60% of participants having much reduced pain. That is a smaller effect than oral diclofenac, delivered at a small fraction of the plasma concentration that drives the cardiovascular numbers.',
          typicalCost:
            'US$0.0829 per gram at United States pharmacy acquisition cost (CMS NADAC, diclofenac sodium, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: minimal systemic exposure; available without prescription in the United States. Cons: only useful for joints close to the skin; local skin reactions; the effect size is real but modest.',
        },
        {
          name: 'Naproxen (Naprosyn, Aleve)',
          class: 'Non-selective cyclooxygenase inhibitor',
          howItCompares:
            'The mirror image of diclofenac on the two axes that matter. Naproxen did not significantly increase major vascular events in randomised trials (rate ratio 0.93) where diclofenac raised them 41%; naproxen has the worst upper gastrointestinal record (4.22) where diclofenac has among the best of the non-selective drugs (1.89). In the Danish emulated-trial series, diclofenac initiators had a 30% higher rate of major adverse cardiovascular events than naproxen initiators at 30 days.',
          typicalCost:
            'US$0.0669 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 110 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: the least vascular signal of the class on randomised data. Cons: the most gastrointestinal risk; less effective for osteoarthritis pain than diclofenac 150 mg in the network meta-analysis.',
        },
        {
          name: 'Celecoxib (Celebrex)',
          class: 'COX-2 selective inhibitor',
          howItCompares:
            'The comparison is more awkward than it looks, because diclofenac’s whole-blood COX-2 selectivity is in the same range as celecoxib’s — so the choice is not selective against non-selective but two similarly selective drugs with different amounts of outcome evidence. Celecoxib has a 24,081-patient randomised cardiovascular safety trial; diclofenac has none, and the European Society of Cardiology position is that current concerns now make such a trial unethical to conduct.',
          typicalCost:
            'US$0.0760 per capsule at United States pharmacy acquisition cost (CMS NADAC, median across 112 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: a dedicated cardiovascular outcome trial exists; fewer measured gastrointestinal events than the non-selective drugs. Cons: same boxed warning; its foundational publication understated its own gastrointestinal risk.',
        },
      ],
      naturalFoods: [
        {
          name: 'Topical capsaicin from Capsicum frutescens (cayenne) cream or plaster',
          activeCompound: 'Capsaicin, acting at the TRPV1 ion channel on sensory nerve endings',
          biologicalMechanism:
            'Not a cyclooxygenase inhibitor at all. Repeated capsaicin application defunctionalises TRPV1-expressing nociceptors, so the mechanism is depletion of the nerve’s ability to signal rather than suppression of the inflammatory chemistry. It is included here as the topical comparator to topical diclofenac, since both are local treatments with no meaningful systemic exposure.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: the Cochrane review of herbal medicine for low-back pain graded as moderate quality that Capsicum frutescens cream or plaster probably produces more favourable results than placebo in chronic low back pain, across three trials and 755 participants. For acute low back pain the same review found the evidence unclear, from a single 40-participant trial.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'If a heart, a stroke or an artery is already in your history, say so first',
          action:
            'Name any myocardial infarction, stroke, transient ischaemic attack, peripheral arterial disease or heart failure before diclofenac is started, including a topical product.',
          patientImpact:
            'In the Danish emulated-trial series, the relative risk of a major adverse cardiovascular event within 30 days was highest in people with low or moderate baseline risk, but the absolute risk was highest in those with high baseline risk — previous myocardial infarction or heart failure. Relative risk decides the argument; absolute risk decides what happens to you.',
          clinicalPrecaution:
            'Diclofenac is contraindicated in the setting of coronary artery bypass graft surgery. Several European regulators additionally contraindicate it in established ischaemic heart disease, cerebrovascular disease, peripheral arterial disease and moderate-to-severe heart failure.',
        },
        {
          name: 'A low dose is not a safe dose here',
          action: 'Do not assume the smallest tablet carries a proportionally small risk.',
          patientImpact:
            'The Danish study specifically reported that the rate of major adverse cardiovascular events was increased for low doses of diclofenac as well as higher ones, compared with non-initiators, and that the increase appeared within 30 days of starting.',
          clinicalPrecaution:
            'The general NSAID principle — lowest effective dose for the shortest duration — still applies. It is a way of reducing exposure, not a way of reaching a threshold below which nothing happens.',
        },
        {
          name: 'For a knee, a hand or an elbow, ask about the gel before the tablet',
          action:
            'Where the painful joint is close to the skin, ask whether the topical form is appropriate.',
          patientImpact:
            'Topical diclofenac produced clinical success with a number needed to treat of 9.8 in pooled osteoarthritis trials, at plasma concentrations far below those from the oral tablet. In the United States it is the topical form that was switched to over-the-counter status, not the tablet.',
          clinicalPrecaution:
            'Topical does not mean risk-free — the systemic warnings remain on the label — and it does nothing for hip, spine or any deep structure.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1=CC=C(C(=C1)CC(=O)O)NC2=C(C=CC=C2Cl)Cl',
      chemicalFormula: 'C14H11Cl2NO2',
      molecularWeight: '296.10 g/mol',
      targetReceptorAffinity:
        'A phenylacetic acid with an ortho-dichlorinated aniline ring. The two chlorine atoms force the rings out of plane, and that twist is the structural reason diclofenac fits the larger COX-2 active site better than the narrower COX-1 one. In whole-blood assays its COX-2 selectivity ratio falls in the same range as the drugs designed and marketed as selective COX-2 inhibitors, which is the single most consequential and least advertised fact about the molecule. Plasma protein binding exceeds 99%, and it is marketed as the sodium salt in delayed-release form and as the potassium salt where faster onset is wanted.',
      structureSource: {
        label:
          'PubChem CID 3033 (diclofenac) — canonical SMILES, molecular formula and weight, as carried on the enriched record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3033',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'dic-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identify the salt and control the intramolecular lactam impurity',
          description:
            'Diclofenac sodium and diclofenac potassium are different products with different dissolution behaviour and different labelled onsets, and both cyclise on storage to an indolinone lactam by losing water. That lactam is the specified degradation product, and its level is the real measure of how the batch has been handled.',
          reagentsAndBuffer:
            'Diclofenac sodium and potassium reference standards, HPLC with ultraviolet detection at 254 and 276 nm, flame photometry or ion chromatography for the counter-ion, Karl Fischer titration, accelerated humidity stability chambers',
        },
        {
          id: 'dic-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Build the diarylamine, then install the acetic acid side chain',
          description:
            'The core is 2-(2,6-dichloroanilino)phenylacetic acid. Routes go through an N-phenyl-2,6-dichloroaniline formed by Ullmann-type coupling or by Smiles rearrangement of an intermediate, followed by introduction and hydrolysis of the acetic acid arm. The 2,6-dichloro substitution is not decoration: it sets the ring twist that produces the COX-2 preference.',
          dependsOnStepId: 'dic-w1',
          reagentsAndBuffer:
            '2,6-dichloroaniline, copper-catalysed Ullmann coupling reagents or a Smiles rearrangement sequence, chloroacetyl chloride, Lewis acid cyclisation, alkaline hydrolysis, anhydrous solvents',
        },
        {
          id: 'dic-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Form and isolate the salt, then control the enteric coat',
          description:
            'Diclofenac free acid is poorly soluble and gastrically irritant, so the marketed oral products are salts, and the sodium form is enterically coated. Coating weight and integrity determine both where the drug is released and how fast — a failed coat turns a delayed-release tablet into an immediate-release one with the gastric exposure that was being avoided.',
          dependsOnStepId: 'dic-w2',
          reagentsAndBuffer:
            'Sodium or potassium hydroxide with controlled stoichiometry, recrystallisation from aqueous alcohol, methacrylic acid copolymer enteric coating, two-stage dissolution testing in pH 1.2 then pH 6.8, coating weight gain measurement',
        },
        {
          id: 'dic-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Measure the COX-2 to COX-1 ratio in whole blood against a coxib control',
          description:
            'The claim that matters about diclofenac is comparative, so the experiment has to be comparative. Running diclofenac alongside celecoxib and ibuprofen in the same whole-blood assay on the same donors is the only way the selectivity ratio means anything; a ratio quoted from a different laboratory, on isolated enzyme, is not evidence about this drug.',
          dependsOnStepId: 'dic-w3',
          reagentsAndBuffer:
            'Fresh human whole blood from aspirin-free donors, lipopolysaccharide-stimulated monocyte prostaglandin E2 for COX-2 and clotted-serum thromboxane B2 for COX-1, diclofenac, celecoxib and ibuprofen run in parallel on the same donors, immunoassay quantification',
        },
        {
          id: 'dic-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Quantify systemic exposure from the topical product, not just local delivery',
          description:
            'The case for topical diclofenac is that it reaches the joint without reaching the circulation. That is a pharmacokinetic claim and it has to be measured as one: plasma concentration under maximal-use conditions, on the largest area and the most frequent application the label permits, in the population that will actually use it.',
          dependsOnStepId: 'dic-w4',
          reagentsAndBuffer:
            'Maximal-use pharmacokinetic protocol with the labelled maximum daily gram quantity across multiple joints, serial plasma sampling with LC-MS/MS quantification against oral reference dosing, synovial fluid sampling where an arthroscopic population is available',
        },
      ],
    },
    keyAudits: [
      {
        id: 'dic-a1',
        category: 'measured',
        title: 'In randomised trials it behaves like a coxib, because chemically it is one',
        laymanSummary:
          'Diclofenac is filed as a traditional anti-inflammatory, alongside ibuprofen and naproxen. In the pooled randomised evidence its heart numbers sit with the selective COX-2 drugs, not with the traditional ones — and its enzyme preference explains why.',
        technicalDetails:
          'In the CNT individual-participant meta-analysis of 280 placebo-controlled trials, major vascular events rose by about a third with a coxib (rate ratio 1.37, 95% CI 1.14 to 1.66, p=0.0009) and by a very similar amount with diclofenac (1.41, 1.12 to 1.78, p=0.0036). Major coronary events rose 1.76-fold (1.31 to 2.37) with coxibs and 1.70-fold (1.19 to 2.41, p=0.0032) with diclofenac. Vascular death rose significantly with coxibs (1.58, 99% CI 1.00 to 2.49) and with diclofenac (1.65, 0.95 to 2.85, p=0.0187). The collaboration’s own interpretation opens: the vascular risks of high-dose diclofenac, and possibly ibuprofen, are comparable to coxibs. On the other side of the ledger diclofenac was among the gentler drugs on the stomach — upper gastrointestinal complications 1.89 (1.16 to 3.09) against ibuprofen’s 3.97 and naproxen’s 4.22 — which is the same COX-2 preference showing up as a benefit. The classification "traditional NSAID" is a regulatory and historical category, not a pharmacological one.',
        evidenceSource:
          'Coxib and traditional NSAID Trialists’ (CNT) Collaboration. Lancet 2013;382:769-779',
        doi: '10.1016/S0140-6736(13)60900-9',
        measuredMetric:
          'Rate ratios for major vascular events, major coronary events, vascular death and upper gastrointestinal complications against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'dic-a2',
        category: 'measured',
        title: 'A 1.37-million-person emulated trial: risk within 30 days, and at low doses',
        laymanSummary:
          'Danish registry data were used to reconstruct 252 trial-like comparisons among 1.37 million people starting diclofenac. Major cardiovascular events were 50% more common within thirty days than in people starting nothing — and 20% more common than in people starting ibuprofen or paracetamol.',
        technicalDetails:
          'The study included 1,370,832 diclofenac initiators, 3,878,454 ibuprofen initiators, 291,490 naproxen initiators, 764,781 propensity-matched paracetamol initiators and 1,303,209 propensity-matched non-initiators, all adults without malignancy, schizophrenia, dementia, or cardiovascular, kidney, liver or ulcer disease — that is, a deliberately low-risk population. Major adverse cardiovascular events within 30 days of initiation gave an incidence rate ratio of 1.5 (95% CI 1.4 to 1.7) against non-initiators, 1.2 (1.1 to 1.3) against both paracetamol and ibuprofen initiators, and 1.3 (1.1 to 1.5) against naproxen initiators. Every component moved in the same direction: atrial fibrillation or flutter 1.2 (1.1 to 1.4), ischaemic stroke 1.6 (1.3 to 2.0), heart failure 1.7 (1.4 to 2.0), myocardial infarction 1.9 (1.6 to 2.2), cardiac death 1.7 (1.4 to 2.1). The increase was present for low doses of diclofenac as well. Upper gastrointestinal bleeding at 30 days rose approximately 4.5-fold against no initiation and 2.5-fold against ibuprofen or paracetamol. The relative risk was highest in people at low or moderate baseline risk; the absolute risk was highest in those with previous myocardial infarction or heart failure. This is observational, and its design deliberately mimics a randomised trial that, as the European Society of Cardiology has stated, current concerns now make unethical to run.',
        evidenceSource:
          'Schmidt M, Sørensen HT, Pedersen L. Diclofenac use and cardiovascular risks: series of nationwide cohort studies. BMJ 2018;362:k3426',
        doi: '10.1136/bmj.k3426',
        measuredMetric:
          'Incidence rate ratio for major adverse cardiovascular events and upper gastrointestinal bleeding within 30 days of initiation, against non-initiation and against three active comparators',
        auditFlag: 'caution',
      },
      {
        id: 'dic-a3',
        category: 'conclusion_shift',
        title:
          'Its risk is comparable to the drug that was withdrawn worldwide — and it is the world’s best-selling NSAID',
        laymanSummary:
          'Rofecoxib was pulled from every market on earth in 2004 for cardiovascular toxicity. A published comparison of the same evidence base ranks diclofenac alongside it, and the same paper found diclofenac on 74 national essential medicines lists with a market share close to the next three NSAIDs combined.',
        technicalDetails:
          'The analysis compared relative risks of cardiovascular events for individual NSAIDs, derived from meta-analyses of randomised trials and controlled observational studies, against national essential medicines list entries and against sales or prescription data from 15 low-, middle- and high-income countries. Three drugs ranked consistently highest for cardiovascular risk against non-use: rofecoxib, diclofenac and etoricoxib. Naproxen was associated with a low risk. Diclofenac was listed on 74 national essential medicines lists and naproxen on 27. Diclofenac and etoricoxib together accounted for a third of all NSAID use across the 15 countries (median 33.2%, range 14.7% to 58.7%), and that proportion did not vary between low- and high-income countries; diclofenac alone had a market share close to that of the next three most popular drugs combined, while naproxen averaged under 10%. The authors’ conclusion is unambiguous: diclofenac has a risk very similar to rofecoxib, which was withdrawn from worldwide markets owing to cardiovascular toxicity, and diclofenac should be removed from essential medicines lists. It is not on the WHO Model List. The conclusion shift here is one the market has not yet made.',
        evidenceSource:
          'McGettigan P, Henry D. Use of non-steroidal anti-inflammatory drugs that elevate cardiovascular risk: an examination of sales and essential medicines lists in low-, middle-, and high-income countries. PLoS Med 2013;10:e1001388',
        doi: '10.1371/journal.pmed.1001388',
        measuredMetric:
          'Relative cardiovascular risk ranking by molecule, national essential medicines list entries, and NSAID market share across 15 countries',
        auditFlag: 'contested',
      },
      {
        id: 'dic-a4',
        category: 'measured',
        title: 'It is also, by a clear margin, the most effective NSAID for arthritis pain',
        laymanSummary:
          'The case against diclofenac would be easy if it were no better than the alternatives. It is better. In the largest network comparison, diclofenac 150 mg a day produced the biggest pain reduction of any anti-inflammatory at a maximally approved dose.',
        technicalDetails:
          'The network meta-analysis pooled 76 randomised trials with 58,451 patients across 23 treatment nodes covering seven NSAIDs and paracetamol at specified daily doses, with a prespecified minimum clinically important effect size for pain of -0.37. Six preparations cleared that threshold with at least 95% probability: diclofenac 150 mg/day, etoricoxib at 30, 60 and 90 mg/day, and rofecoxib at 25 and 50 mg/day. Among maximally approved daily doses, diclofenac 150 mg/day (effect size -0.57, 95% credible interval -0.69 to -0.45) and etoricoxib 60 mg/day (-0.58, -0.74 to -0.43) had the highest probability of being the best intervention, both with 100% probability of reaching the minimum clinically important difference. Treatment effects increased with dose, though the test for a linear dose effect reached significance only for naproxen. The authors state plainly that diclofenac 150 mg/day is the most effective NSAID available — and immediately add that in view of the safety profile of these drugs, physicians need to consider the result together with all known safety information. Both halves of that sentence belong on this page.',
        evidenceSource:
          'da Costa BR, Reichenbach S, Keller N, et al. Effectiveness of non-steroidal anti-inflammatory drugs for the treatment of pain in knee and hip osteoarthritis: a network meta-analysis. Lancet 2017;390:e21-e33',
        doi: '10.1016/S0140-6736(17)31744-0',
        measuredMetric:
          'Effect size for osteoarthritis pain against placebo, by preparation and daily dose, with probability of exceeding a minimum clinically important difference of -0.37',
        auditFlag: 'verified',
      },
      {
        id: 'dic-a5',
        category: 'measured',
        title: 'The topical form works, modestly, and is the one that went over the counter',
        laymanSummary:
          'Rubbing diclofenac on a knee is not a placebo. In pooled trials about 60% of patients had much reduced pain, giving a number needed to treat of about 10 — a smaller effect than the tablet, at a fraction of the exposure that drives the heart numbers.',
        technicalDetails:
          'The Cochrane review of topical NSAIDs for chronic musculoskeletal pain included 39 studies and 10,631 participants, all in osteoarthritis, with 33 studies comparing a topical NSAID against carrier. In studies lasting 6 to 12 weeks, topical diclofenac and topical ketoprofen were significantly more effective than carrier, with about 60% of participants achieving much reduced pain. For topical diclofenac the number needed to treat for clinical success — at least a 50% reduction in pain or an equivalent global assessment — was 9.8 (95% CI 7.1 to 16) across six trials and 2,343 participants, rated moderate quality evidence. The regulatory consequence is that in the United States the formulation switched to over-the-counter status is the gel, under NDA 022122, not the tablet. That is an unusually rational allocation: the route with the least systemic exposure is the one available without a consultation.',
        evidenceSource:
          'Derry S, Conaghan P, Da Silva JAP, Wiffen PJ, Moore RA. Topical NSAIDs for chronic musculoskeletal pain in adults. Cochrane Database Syst Rev 2016;(4):CD007400',
        doi: '10.1002/14651858.CD007400.pub3',
        measuredMetric:
          'Number needed to treat for clinical success with topical diclofenac over 6 to 12 weeks in osteoarthritis',
        auditFlag: 'verified',
      },
      {
        id: 'dic-a6',
        category: 'measured',
        title: 'Diclofenac residues collapsed the vulture populations of South Asia',
        laymanSummary:
          'Three species of Gyps vulture declined by more than 95% across the Indian subcontinent from the 1990s. The cause was traced to veterinary diclofenac in livestock carcasses, which caused renal failure in birds that fed on them, and reproduced experimentally.',
        technicalDetails:
          'The Oriental white-backed vulture (Gyps bengalensis) was once one of the most common raptors in the Indian subcontinent. A population decline exceeding 95% beginning in the 1990s, also involving Gyps indicus and Gyps tenuirostris, left all three listed as critically endangered. Study sites at 16 colonies in Pakistan measuring mortality at over 2,400 active nest sites recorded annual adult and subadult mortality of 5% to 86% and population declines of 34% to 95% between 2000 and 2003, associated with renal failure and visceral gout. The authors directly correlated diclofenac residues with renal failure, and reproduced both the residues and the renal disease experimentally by direct oral exposure and by feeding vultures diclofenac-treated livestock. Veterinary diclofenac was subsequently banned across several South Asian countries. This is on a human drug page for a reason: it is the clearest demonstration that the renal prostaglandin dependence which makes NSAIDs hazardous to a dehydrated human kidney is not a small-print effect, and it is a rare case where a drug’s toxicity was established by a controlled experiment in the affected population.',
        evidenceSource:
          'Oaks JL, Gilbert M, Virani MZ, et al. Diclofenac residues as the cause of vulture population decline in Pakistan. Nature 2004;427:630-633',
        doi: '10.1038/nature02317',
        measuredMetric:
          'Vulture colony mortality and population decline correlated with tissue diclofenac residues, with experimental reproduction of renal failure',
        auditFlag: 'verified',
      },
      {
        id: 'dic-a7',
        category: 'inferred',
        title: 'The gel is assumed to be free of the systemic risk. Nothing has measured that.',
        laymanSummary:
          'Topical diclofenac is sold over the counter in the United States on the reasoning that very little of it reaches the bloodstream. That reasoning is sound and it has never been tested against a cardiovascular or gastrointestinal outcome — every trial of the gel measured pain over six to twelve weeks.',
        technicalDetails:
          'The Cochrane review of topical NSAIDs opens by stating the premise directly: use of topical non-steroidal anti-inflammatory drugs to treat chronic musculoskeletal conditions has become widely accepted because they can provide pain relief without associated systemic adverse events. What the review then contains is 39 studies in 10,631 participants, all in osteoarthritis, with pooled analyses over 6 to 12 weeks and some studies judged at risk of bias from short duration and small size. No trial of that design in that population could detect a myocardial infarction signal, and none set out to. The pharmacokinetic argument is real — topical application produces a small fraction of the plasma concentration of an oral dose — but a small fraction of a risk that rises 41% for major vascular events and appears within 30 days of starting the oral drug is a quantity nobody has put a number on. The regulator has not adopted the inference either: the topical products retain the NSAID cardiovascular thrombotic and gastrointestinal warnings on their labels rather than dropping them. This audit is not an argument against topical diclofenac, which has a measured benefit at a number needed to treat of 9.8. It is a statement that "topical, therefore systemically safe" is an inference from a pharmacokinetic property, not a finding.',
        evidenceSource:
          'Derry S, Conaghan P, Da Silva JAP, Wiffen PJ, Moore RA. Topical NSAIDs for chronic musculoskeletal pain in adults. Cochrane Database Syst Rev 2016;(4):CD007400, Background and Main Results; VOLTAREN ARTHRITIS PAIN topical gel, Drugs@FDA NDA 022122',
        doi: '10.1002/14651858.CD007400.pub3',
        inferredClaim:
          'That topical diclofenac carries no meaningful systemic cardiovascular or gastrointestinal risk — a widely accepted premise supported by pharmacokinetics, never tested against a clinical outcome, and not adopted by the product label',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Two chlorines twist the molecule, and the twist picks the enzyme',
        laymanDesc:
          'Diclofenac carries two chlorine atoms that force its two rings out of alignment. That shape fits the roomier inflammation enzyme better than the tighter housekeeping one — which is the whole of its character.',
        molecularDetail:
          '2-(2,6-dichloroanilino)phenylacetic acid. The ortho-dichloro substitution enforces a dihedral twist that favours the larger COX-2 active site. In whole-blood assays the resulting COX-2 selectivity ratio falls in the same range as drugs designed and marketed as selective COX-2 inhibitors. Plasma protein binding exceeds 99%.',
        iconName: 'GitBranch',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'In the joint, that preference is exactly what you want',
        laymanDesc:
          'The enzyme that appears during inflammation is the one doing the damage in an arthritic joint. Blocking it preferentially is why diclofenac outperformed every other anti-inflammatory in the largest comparison of arthritis pain.',
        molecularDetail:
          'COX-2 is induced in inflamed synovium and is the dominant source of prostaglandin E2 there. Network meta-analysis of 76 trials and 58,451 patients: diclofenac 150 mg/day effect size -0.57 (95% credible interval -0.69 to -0.45), the largest of any maximally approved NSAID dose, with 100% probability of exceeding the minimum clinically important difference.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'And it spares the stomach more than ibuprofen or naproxen',
        laymanDesc:
          'The housekeeping enzyme that protects the stomach lining is left relatively alone, so serious gastric complications are lower than with the non-selective drugs.',
        molecularDetail:
          'Upper gastrointestinal complications against placebo: diclofenac 1.89 (95% CI 1.16 to 3.09), against ibuprofen 3.97 (2.22 to 7.10) and naproxen 4.22 (2.71 to 6.56). The same selectivity that produces the arthritis efficacy produces the gastric advantage.',
        iconName: 'ShieldCheck',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'In blood vessels the same preference is the problem',
        laymanDesc:
          'The vessel wall makes a substance that keeps platelets calm using the inflammation enzyme; platelets make the opposing clotting signal using the housekeeping one. Blocking one and not the other tips the balance toward clotting.',
        molecularDetail:
          'Endothelial prostacyclin is largely COX-2-derived; platelet thromboxane A2 is COX-1-derived. Preferential COX-2 inhibition without matching platelet COX-1 inhibition shifts the prostacyclin-thromboxane balance — the mechanism proposed for the coxib cardiovascular signal, and the one diclofenac shares. Major vascular events rate ratio 1.41 (1.12 to 1.78) against placebo.',
        iconName: 'AlertTriangle',
        visualStage: 'cellular_entry',
      },
      {
        step: 5,
        title: 'The signal appears within a month, and at low doses',
        laymanDesc:
          'This is not a slow accumulation over years. In 1.37 million people starting diclofenac, the excess in heart attacks, strokes, heart failure and cardiac deaths was measurable in the first thirty days, including in those on small doses.',
        molecularDetail:
          'Danish emulated-trial series: incidence rate ratio at 30 days 1.5 (1.4 to 1.7) against non-initiators, with myocardial infarction 1.9 (1.6 to 2.2), heart failure 1.7 (1.4 to 2.0), ischaemic stroke 1.6 (1.3 to 2.0) and cardiac death 1.7 (1.4 to 2.1), and the increase present for low doses as well.',
        iconName: 'Timer',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What was measured, and what nobody will now measure',
        laymanDesc:
          'Measured: the best arthritis pain relief of the class, and a cardiovascular risk profile alongside a drug that was withdrawn from every market. Not measured, and now unlikely ever to be: a randomised cardiovascular outcome trial of diclofenac.',
        molecularDetail:
          'Celecoxib has PRECISION, 24,081 patients. Diclofenac has no equivalent. The European Society of Cardiology working group position, cited by the Danish investigators as their reason for an emulated-trial design, is that current concerns about diclofenac’s cardiovascular risks now make such a trial unethical to conduct.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'CNT Collaboration pooled randomised trials (Lancet 2013;382:769-779)',
        phase:
          'Individual-participant meta-analysis of 280 placebo-controlled and 474 active-comparator randomised trials',
        sampleSize: 124513,
        primaryEndpoint:
          'Major vascular events — non-fatal myocardial infarction, non-fatal stroke or vascular death — with major coronary events, stroke, mortality, heart failure and upper gastrointestinal complications as further outcomes',
        endpointMet: false,
        statisticalPValue:
          'Diclofenac major vascular events rate ratio 1.41 (95% CI 1.12 to 1.78), p=0.0036; major coronary events 1.70 (1.19 to 2.41), p=0.0032; vascular death 1.65 (0.95 to 2.85), p=0.0187; upper gastrointestinal complications 1.89 (1.16 to 3.09), p=0.0106',
        unreportedAdverseSignals:
          'Heart failure risk was roughly doubled by all NSAID regimens in the analysis. The proportional effects on major vascular events were independent of baseline characteristics including vascular risk, which means a low-risk patient gets the same proportional increase on a smaller base.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Danish nationwide emulated trial series (BMJ 2018;362:k3426)',
        phase: 'Series of 252 nationwide cohort studies with emulated-trial design, 1996-2016',
        sampleSize: 1370832,
        primaryEndpoint:
          'Intention-to-treat incidence rate ratio of major adverse cardiovascular events within 30 days of initiation',
        endpointMet: false,
        statisticalPValue:
          '1.5 (95% CI 1.4 to 1.7) against non-initiators, 1.2 (1.1 to 1.3) against paracetamol and against ibuprofen initiators, 1.3 (1.1 to 1.5) against naproxen initiators; myocardial infarction 1.9 (1.6 to 2.2), cardiac death 1.7 (1.4 to 2.1)',
        unreportedAdverseSignals:
          'This is observational and cannot exclude confounding by indication despite propensity matching and the deliberate restriction to a low-baseline-risk population. It exists because a randomised cardiovascular outcome trial of diclofenac is now regarded as unethical to run.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId:
          'Network meta-analysis of NSAIDs in knee and hip osteoarthritis (Lancet 2017;390:e21-e33)',
        phase:
          'Bayesian network meta-analysis of 76 randomised trials with at least 100 patients per group',
        sampleSize: 58451,
        primaryEndpoint: 'Osteoarthritis pain, with physical function as secondary outcome',
        endpointMet: true,
        statisticalPValue:
          'Diclofenac 150 mg/day effect size -0.57 (95% credible interval -0.69 to -0.45) against placebo, 100% probability of exceeding the prespecified minimum clinically important difference of -0.37 and the highest probability of being the best maximally approved dose',
        unreportedAdverseSignals:
          'The comparison is of efficacy only. The authors explicitly direct that the result be considered together with all known safety information, and the same analysis includes rofecoxib — withdrawn worldwide — among the preparations exceeding the clinical relevance threshold.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Major vascular events rate ratio 1.41 (1.12 to 1.78) and major coronary events 1.70 (1.19 to 2.41) against placebo in randomised trials',
        'Major adverse cardiovascular events 1.5-fold higher within 30 days of initiation in 1,370,832 diclofenac initiators against non-initiators, including at low doses',
        'Upper gastrointestinal bleeding approximately 4.5-fold higher at 30 days against no initiation, and 2.5-fold against ibuprofen or paracetamol',
        'Osteoarthritis pain effect size -0.57 at 150 mg/day, the largest of any maximally approved NSAID dose across 76 trials and 58,451 patients',
        'Topical diclofenac number needed to treat 9.8 (7.1 to 16) for clinical success over 6 to 12 weeks',
        'Diclofenac residues correlated with, and experimentally reproduced, the renal failure behind a greater than 95% Gyps vulture population decline',
      ],
      unsupportedInferences: [
        'That "traditional NSAID" describes diclofenac’s pharmacology — its whole-blood COX-2 selectivity sits with the drugs marketed as selective',
        'That the risk is confined to high doses or long courses, when the 30-day analysis found it at low doses within a month',
        'That over-the-counter availability in much of the world reflects a favourable risk assessment rather than historical inertia',
        'That efficacy rankings settle the question of which NSAID to use, when the most effective preparation list in the network analysis includes a drug withdrawn worldwide',
      ],
      whatFailedInitially: [
        'No randomised cardiovascular outcome trial of diclofenac exists, and the European Society of Cardiology position is that one would now be unethical to conduct',
        'The published recommendation that diclofenac be removed from essential medicines lists has largely not been acted on; it was on 74 national lists as of 2013',
        'Veterinary use was banned across South Asian countries only after three vulture species had been driven to critically endangered status',
        'Every component of the cardiovascular composite moved against diclofenac in the 30-day analysis, including atrial fibrillation and heart failure, not only infarction',
      ],
      realWorldOutcome: [
        'Approved in the United States in 1988 under NDA 019201; the topical gel switched to over-the-counter status under NDA 022122, while the tablet did not',
        'The most-used NSAID in the world, with a market share across 15 countries close to that of the next three drugs combined',
        'Not on the WHO Model List of Essential Medicines, and listed on 74 national essential medicines lists as of 2013',
        'About eight United States cents per gram of diclofenac sodium at pharmacy acquisition cost across 149 listed products',
      ],
    },
    deliverySystem: {
      type: 'Oral delayed-release tablets (diclofenac sodium) and immediate-release tablets (diclofenac potassium), extended-release tablets, capsules, topical gel and solution, transdermal patch, ophthalmic solution and injection',
      description:
        'The sodium salt is enterically coated so that release occurs beyond the stomach, which delays onset; the potassium salt is used where faster absorption is wanted, as in acute pain and dysmenorrhoea. Plasma protein binding exceeds 99% and metabolism is hepatic, principally by CYP2C9 with subsequent glucuronidation. The topical route achieves therapeutic tissue concentrations in superficial joints at plasma concentrations far below those from oral dosing, which is the pharmacological basis for its separate regulatory treatment.',
      safetyProfile:
        'Boxed warning for cardiovascular thrombotic events including fatal myocardial infarction and stroke, and for gastrointestinal bleeding, ulceration and perforation. Contraindicated in the setting of coronary artery bypass graft surgery, and in several European jurisdictions additionally in established ischaemic heart disease, cerebrovascular disease, peripheral arterial disease and moderate-to-severe heart failure. Diclofenac carries a higher rate of transaminase elevation than most NSAIDs and labels direct liver monitoring. Renal effects follow the class pattern and are amplified by volume depletion, diuretics, ACE inhibitors and angiotensin receptor blockers.',
    },
    commonQuestions: [
      {
        q: 'Is diclofenac really as risky as the drug that got withdrawn?',
        a: 'On the published comparisons, close to it. Rofecoxib was withdrawn worldwide in 2004 because it raised cardiovascular events. In the pooled randomised evidence, coxibs as a class raised major vascular events by a rate ratio of 1.37 and diclofenac by 1.41 — statistically indistinguishable. A 2013 analysis that ranked NSAIDs by cardiovascular risk against sales and essential medicines lists put rofecoxib, diclofenac and etoricoxib consistently at the top, and concluded that diclofenac has a risk very similar to rofecoxib and should be removed from essential medicines lists. It was on 74 national lists at the time. The reason is not mysterious: diclofenac’s enzyme selectivity is in the same range as the drugs that were designed to be selective, so it produces the same shift in the vascular balance.',
        auditNote:
          'The classification "traditional NSAID" versus "coxib" is historical and regulatory. It does not track the pharmacology, and on this drug it actively misleads.',
      },
      {
        q: 'Then why is it the most prescribed anti-inflammatory in the world?',
        a: 'Partly because it works better than the alternatives, and partly inertia. In the network meta-analysis of 76 randomised trials and 58,451 osteoarthritis patients, diclofenac 150 mg a day produced the largest pain reduction of any anti-inflammatory at a maximally approved dose — effect size -0.57, with a 100% probability of exceeding the threshold for a clinically meaningful difference. Paracetamol did not reach that threshold at any dose. So the drug that carries the worst cardiovascular numbers is also the one that most reliably helps an arthritic knee, which is exactly why the decision is hard rather than obvious. The same analysis’s authors immediately tell readers to weigh their efficacy result against all known safety information.',
      },
      {
        q: 'Is the low dose safe?',
        a: 'The 30-day analysis of 1.37 million initiators specifically reported that the increased rate of major adverse cardiovascular events was present for low doses of diclofenac as well as high ones, compared with people starting nothing. The risk also appeared within the first month, not after years. That does not make a low dose equivalent to a high one — exposure still matters, and taking less for less time is still the right principle — but it does remove the idea of a threshold below which the drug is inert.',
      },
      {
        q: 'What about the gel? Is that the same drug?',
        a: 'Same molecule, very different exposure. The Cochrane review of topical NSAIDs in osteoarthritis pooled 39 studies and 10,631 participants and found topical diclofenac significantly better than carrier over 6 to 12 weeks, with about 60% of participants having much reduced pain and a number needed to treat of 9.8 for clinical success. That is a genuine, modest effect delivered at plasma concentrations far below the oral tablet’s. It is not coincidence that in the United States it is the gel, not the tablet, that was switched to over-the-counter status. It only helps joints close to the skin, and the systemic warnings remain on the label.',
      },
      {
        q: 'What happened with the vultures?',
        a: 'It is the strangest and best-documented fact about this molecule. Three species of Gyps vulture across the Indian subcontinent declined by more than 95% from the 1990s and became critically endangered. Field study at 16 colonies in Pakistan, monitoring over 2,400 active nest sites, found the birds were dying of renal failure with visceral gout. Investigators correlated tissue diclofenac residues with the renal failure and then reproduced it experimentally, both by direct oral exposure and by feeding vultures livestock that had been treated with diclofenac. Veterinary diclofenac was banned across several South Asian countries afterwards. It is a reminder that NSAID renal toxicity is not a small-print effect: it is the reason a dehydrated person on a diuretic should not casually add one.',
      },
      {
        q: 'Will there ever be a proper trial of diclofenac and heart attacks?',
        a: 'Almost certainly not, and that absence is itself an audit finding. Celecoxib has PRECISION, a 24,081-patient randomised cardiovascular safety trial. Diclofenac, which has been on the market longer and is used far more, has no equivalent. The Danish investigators who built the 252-cohort emulated-trial series explained their design choice directly: current concerns about diclofenac’s cardiovascular risks, as stated by the European Society of Cardiology, now make such a trial unethical to conduct. So the best evidence available for the world’s most-used NSAID will remain a reconstruction from registries rather than a randomised comparison.',
        auditNote:
          'A drug that reached the market before its risks were understood can become impossible to study properly afterwards. That is a permanent gap, not a temporary one.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      CNT_SOURCE,
      {
        label:
          'Schmidt M, Sørensen HT, Pedersen L. Diclofenac use and cardiovascular risks: series of nationwide cohort studies. BMJ 2018;362:k3426',
        identifier: '10.1136/bmj.k3426',
        kind: 'doi',
      },
      {
        label:
          'McGettigan P, Henry D. Use of non-steroidal anti-inflammatory drugs that elevate cardiovascular risk: an examination of sales and essential medicines lists in low-, middle-, and high-income countries. PLoS Med 2013;10:e1001388',
        identifier: '10.1371/journal.pmed.1001388',
        kind: 'doi',
      },
      {
        label:
          'da Costa BR, Reichenbach S, Keller N, et al. Effectiveness of non-steroidal anti-inflammatory drugs for the treatment of pain in knee and hip osteoarthritis: a network meta-analysis. Lancet 2017;390:e21-e33',
        identifier: '10.1016/S0140-6736(17)31744-0',
        kind: 'doi',
      },
      {
        label:
          'Derry S, Conaghan P, Da Silva JAP, Wiffen PJ, Moore RA. Topical NSAIDs for chronic musculoskeletal pain in adults. Cochrane Database Syst Rev 2016;(4):CD007400',
        identifier: '10.1002/14651858.CD007400.pub3',
        kind: 'doi',
      },
      {
        label:
          'Oaks JL, Gilbert M, Virani MZ, et al. Diclofenac residues as the cause of vulture population decline in Pakistan. Nature 2004;427:630-633',
        identifier: '10.1038/nature02317',
        kind: 'doi',
      },
      {
        label:
          'Schmidt M, Lamberts M, Olsen AM, et al. Cardiovascular safety of non-aspirin non-steroidal anti-inflammatory drugs: review and position paper by the working group for Cardiovascular Pharmacotherapy of the European Society of Cardiology. Eur Heart J 2016;37:1015-1023',
        identifier: '10.1093/eurheartj/ehv505',
        kind: 'doi',
      },
      {
        label:
          'Oltean H, Robbins C, van Tulder MW, et al. Herbal medicine for low-back pain. Cochrane Database Syst Rev 2014;(12):CD004504 — the Capsicum frutescens evidence cited under natural comparators',
        identifier: '10.1002/14651858.CD004504.pub4',
        kind: 'doi',
      },
      {
        label:
          'VOLTAREN (diclofenac sodium delayed-release) Drugs@FDA application record, NDA 019201',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=019201',
        kind: 'regulatory',
      },
      {
        label:
          'VOLTAREN ARTHRITIS PAIN (diclofenac sodium topical gel) Drugs@FDA application record, NDA 022122 — the over-the-counter topical product',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=022122',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 3033 (diclofenac) — structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3033',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 6. Celecoxib — the drug whose reputation was built on six months of a longer trial, at two to
  //    four times its own maximum dose, and rebuilt fifteen years later at a quarter of that dose.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'celecoxib',
    name: 'Celecoxib',
    tradeName: 'Celebrex, Elyxyb',
    sponsor:
      'Discovered at Searle and developed with Monsanto and Pfizer; United States NDA 020998 (CELEBREX), now held by Upjohn, a Pfizer division. Generic since 2014 and made by many manufacturers',
    targetGene: 'PTGS2',
    targetProtein:
      'Prostaglandin-endoperoxide synthase 2 (cyclooxygenase-2), inhibited selectively by occupying a side pocket in the COX-2 channel that the narrower COX-1 channel does not have',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1998,
    indication:
      'Management of the signs and symptoms of osteoarthritis, rheumatoid arthritis, juvenile rheumatoid arthritis in patients 2 years and older and ankylosing spondylitis; management of acute pain in adults and of primary dysmenorrhoea',
    patientFriendlyIndication: 'Arthritis pain and inflammation, with less stomach damage',
    anatomicalSite:
      'The COX-2 side pocket in inflamed synovium and in vascular endothelium; platelet COX-1 is left untouched, which is the source of both the gastric advantage and the vascular problem',
    conditionContext: {
      conditionExplainer:
        'Celecoxib blocks only the version of the prostaglandin-making enzyme that appears during inflammation, and leaves alone the version that protects the stomach lining and makes the platelet clotting signal. That is the whole design, and every measured consequence follows from it.',
      whyItMatters:
        'Celecoxib is the last surviving member of a drug class built on a single promise: the same pain relief without the gastric bleeding. Rofecoxib and valdecoxib were withdrawn. Celecoxib’s own foundational publication reported six months of a longer trial, at a dose two to four times its maximum approved one, and the gastrointestinal advantage it claimed did not reach significance on the endpoint that mattered most. Fifteen years later a 24,081-patient trial vindicated it — at a mean dose of 209 mg a day, roughly a quarter of the dose used in the trial that had shown it caused harm.',
      whoTakesThis:
        'Adults with arthritis, particularly those at higher risk of gastrointestinal bleeding or already on aspirin. Contraindicated in people with sulfonamide allergy, in aspirin- or NSAID-triggered asthma or urticaria, and in the setting of coronary artery bypass graft surgery.',
      clinicalGoals:
        'Comparable pain and function to a non-selective NSAID with fewer measured gastrointestinal and renal events, and no interference with cardioprotective aspirin.',
    },
    oneSentenceVerdict:
      'A COX-2 selective inhibitor whose gastrointestinal advantage was published from six months of a longer trial at two to four times its maximum approved dose — and where the complication endpoint that mattered did not reach significance (0.76% against 1.45%, P=0.09) and vanished entirely in aspirin users (P=0.92) — which then produced a dose-related tripling of cardiovascular events at 400 mg twice daily in a prevention trial stopped early, and was finally shown non-inferior to ibuprofen and naproxen in 24,081 patients at a mean dose of 209 mg a day.',
    laymanHowItWorks:
      'There are two versions of the enzyme that makes prostaglandins. One is always present and keeps the stomach lining protected and the platelets working; the other appears when tissue is inflamed. Celecoxib was designed to fit a small side pocket that only the inflammation version has, so it blocks that one and leaves the housekeeping one alone. The stomach benefit is real and measured. The problem is that blood vessels also use the inflammation enzyme, to make a substance that keeps platelets calm — so blocking it without touching the platelet enzyme tips the balance toward clotting. That is why the entire class carries a cardiovascular warning, and why two of its members were withdrawn.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 63,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0760 per capsule at United States pharmacy acquisition cost (CMS NADAC, median across 112 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States on 31 December 1998 under NDA 020998 and generic since 2014. Through its branded years it was one of the highest-revenue prescription drugs in the world, sold largely on a gastrointestinal safety argument whose foundational publication was disputed in the pages of the journal that carried it. It is now about eight United States cents a capsule — roughly twice ibuprofen and a fraction of what it cost when the argument was being made.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Celecoxib exists to solve one problem — NSAID gastric bleeding — and there are two other ways to solve it: use a non-selective NSAID with a proton pump inhibitor, or use a topical NSAID where the joint allows. The comparison that matters is not celecoxib against ibuprofen in general but celecoxib against those two strategies in the specific patient whose stomach is the reason for the question.',
      conventionalRx: [
        {
          name: 'Naproxen (Naprosyn, Aleve)',
          class: 'Non-selective cyclooxygenase inhibitor',
          howItCompares:
            'In PRECISION, gastrointestinal events were significantly lower on celecoxib than on naproxen (p=0.01) and renal events were not significantly different (p=0.19), with the cardiovascular composite non-inferior (hazard ratio 0.93, 95% CI 0.76 to 1.13). Against that, naproxen was the only traditional NSAID in the randomised meta-analysis that did not significantly raise major vascular events, while coxibs as a class raised them 37%.',
          typicalCost:
            'US$0.0669 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 110 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: least vascular signal on randomised data; cheaper. Cons: worst upper gastrointestinal record of the class (rate ratio 4.22), which is usually the reason celecoxib was being considered.',
        },
        {
          name: 'Ibuprofen (Advil, Motrin)',
          class: 'Non-selective cyclooxygenase inhibitor',
          howItCompares:
            'Lost to celecoxib on both gastrointestinal (p=0.002) and renal (p=0.004) events in PRECISION, and raised 24-hour systolic blood pressure by 3.7 mmHg against celecoxib’s -0.3 mmHg in the ambulatory substudy. The comparison is confounded by dose: celecoxib ran at a mean 209 mg daily and ibuprofen at 2,045 mg.',
          typicalCost:
            'US$0.0391 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 244 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: half the price; the largest single-dose analgesic evidence base of any NSAID. Cons: more gastrointestinal and renal events in the head-to-head trial; cancels cardioprotective aspirin, which celecoxib does not.',
        },
        {
          name: 'A non-selective NSAID plus a proton pump inhibitor',
          class: 'Combination gastroprotection strategy',
          howItCompares:
            'Addresses the same problem by a different route — suppressing acid rather than sparing mucosal prostaglandins — and does not require giving up the platelet effect that a coxib forgoes. It is the strategy celecoxib has to beat rather than the strategy of using an NSAID alone, and in a patient already taking aspirin it may be the only one that helps, because in CLASS the celecoxib gastrointestinal advantage disappeared entirely among aspirin users (2.01% against 2.12%, P=0.92).',
          typicalCost:
            'Both components are among the cheapest generics in the United States at pharmacy acquisition cost',
          prosAndCons:
            'Pros: preserves whatever antiplatelet effect the NSAID provides; addresses acid-mediated injury directly. Cons: two drugs; proton pump inhibitors have their own long-term questions; does not prevent lower gastrointestinal injury.',
        },
      ],
      naturalFoods: [
        {
          name: 'Standardised turmeric (Curcuma longa) extract',
          activeCompound: 'Curcuminoids, principally curcumin',
          biologicalMechanism:
            'Curcumin inhibits COX-2 expression and NF-κB signalling in vitro, which is the same node celecoxib acts downstream of, though at concentrations that oral curcumin reaches poorly because of very low bioavailability.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: a meta-analysis of 16 randomised trials of up to 16 weeks in 1,810 adults with knee osteoarthritis found turmeric extracts reduced knee pain against placebo with a standardised mean difference of -0.82 (95% CI -1.17 to -0.47) and improved physical function by -0.75 (-1.18 to -0.33), with similar effects to NSAIDs in the five active-comparator trials and 12% fewer adverse events than NSAIDs. Heterogeneity was very high (I² above 86%), the trials were short, and no differences were seen in biochemical markers or imaging outcomes — so this is a symptom result on noisy data, not a disease-modifying one.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'A sulfa allergy is an absolute contraindication here and only here',
          action:
            'Report any allergic-type reaction to sulfonamide antibiotics before celecoxib is prescribed.',
          patientImpact:
            'Celecoxib carries a benzenesulfonamide group, and its label contraindicates it in patients who have demonstrated allergic-type reactions to sulfonamides. No other NSAID in this file carries that contraindication.',
          clinicalPrecaution:
            'The label also contraindicates it after asthma, urticaria or other allergic-type reactions to aspirin or other NSAIDs, noting that severe and sometimes fatal anaphylactic reactions have been reported in such patients.',
        },
        {
          name: 'It does not replace your aspirin, and it does not block it either',
          action:
            'Keep taking cardioprotective aspirin if it has been prescribed, and say that you are.',
          patientImpact:
            'Celecoxib has no meaningful effect on platelet COX-1, so it neither provides antiplatelet protection nor interferes with aspirin’s — unlike ibuprofen, which abolishes it. That is a genuine practical advantage of this molecule.',
          clinicalPrecaution:
            'Adding aspirin removes much of the gastric advantage: in CLASS, ulcer complication rates among aspirin users were 2.01% on celecoxib against 2.12% on the comparator NSAIDs (P=0.92).',
        },
        {
          name: 'Ask what dose, and compare it with the trial you are being quoted',
          action: 'When told celecoxib is cardiovascularly safe, ask which trial and at what dose.',
          patientImpact:
            'The reassuring result came from a mean daily dose of 209 mg. The harm signal came from 400 mg twice daily — nearly four times as much — in a prevention trial the data monitoring board stopped early. The two results are not in conflict; they are about different doses.',
          clinicalPrecaution:
            'The boxed cardiovascular thrombotic warning applies at every dose, and the label contraindicates use in the setting of coronary artery bypass graft surgery.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC1=CC=C(C=C1)C2=CC(=NN2C3=CC=C(C=C3)S(=O)(=O)N)C(F)(F)F',
      chemicalFormula: 'C17H14F3N3O2S',
      molecularWeight: '381.40 g/mol',
      targetReceptorAffinity:
        'A 1,5-diarylpyrazole carrying a benzenesulfonamide and a trifluoromethyl group. Selectivity comes from a single amino acid difference: COX-2 has valine at position 523 where COX-1 has the bulkier isoleucine, opening a side pocket that the sulfonamide occupies. That one substitution is the entire molecular basis of the drug class. The sulfonamide is also why celecoxib is contraindicated in sulfonamide allergy, a restriction no other drug in this file carries. Plasma protein binding is about 97%, and metabolism is principally by CYP2C9, so poor metabolisers and CYP2C9 inhibitors raise exposure substantially.',
      structureSource: {
        label:
          'PubChem CID 2662 (celecoxib) — canonical SMILES, molecular formula and weight, as carried on the enriched record; contraindications from the CELEBREX label section 4 (NDA 020998)',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2662',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'cel-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm pyrazole regiochemistry and control the polymorph',
          description:
            'The pyrazole ring can close in two orientations and only one of them is celecoxib; the regioisomer is a specified impurity that ordinary assay conditions can miss because the two have identical mass. Celecoxib also has multiple crystal forms with different dissolution behaviour, and the drug is poorly water-soluble enough that the form matters for exposure.',
          reagentsAndBuffer:
            'Celecoxib reference standard, regioisomer reference standard, HPLC with a method validated to resolve the pair, LC-MS/MS with fragmentation to distinguish isobaric species, X-ray powder diffraction and differential scanning calorimetry for polymorph identity',
        },
        {
          id: 'cel-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Condense a trifluoromethyl diketone with a sulfonamide-bearing hydrazine',
          description:
            'The pyrazole is formed by cyclocondensation of 4,4,4-trifluoro-1-(4-methylphenyl)butane-1,3-dione with 4-sulfamoylphenylhydrazine hydrochloride. Reaction conditions decide the regiochemical ratio, so this is the step that determines how much work the purification has to do.',
          dependsOnStepId: 'cel-w1',
          reagentsAndBuffer:
            '4-methylacetophenone, ethyl trifluoroacetate with sodium methoxide for the diketone, 4-hydrazinylbenzenesulfonamide hydrochloride, ethanol under reflux with acid catalysis, controlled temperature and water content',
        },
        {
          id: 'cel-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Remove the regioisomer and fix the particle size',
          description:
            'The unwanted regioisomer must come out here, because it is not removable later and is not pharmacologically equivalent. Celecoxib’s aqueous solubility is low enough that particle size and crystal form set the absorbed dose, so milling specification is part of the drug substance, not the formulation.',
          dependsOnStepId: 'cel-w2',
          reagentsAndBuffer:
            'Recrystallisation from isopropanol or ethanol-water, seeding with the target polymorph, jet milling to a specified particle size distribution, laser diffraction sizing, biorelevant dissolution media',
        },
        {
          id: 'cel-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Establish the COX-2 to COX-1 ratio in whole blood, with diclofenac in the same run',
          description:
            'The selectivity claim is the drug’s entire identity, and it is only meaningful comparatively. Running celecoxib alongside diclofenac on the same donors is the experiment that matters, because diclofenac’s whole-blood ratio falls in the same range — which reframes the class distinction the marketing rested on.',
          dependsOnStepId: 'cel-w3',
          reagentsAndBuffer:
            'Fresh human whole blood from aspirin-free donors, lipopolysaccharide-stimulated monocyte prostaglandin E2 for COX-2 and clotted-serum thromboxane B2 for COX-1, celecoxib, diclofenac, ibuprofen and naproxen run in parallel, immunoassay quantification',
        },
        {
          id: 'cel-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Measure the prostacyclin-to-thromboxane ratio, which is the harm mechanism',
          description:
            'The gastric benefit and the vascular harm are the same selectivity read at two sites. The assay that tests the harm hypothesis directly is urinary excretion of the stable metabolites of prostacyclin and thromboxane, measured across a dose range — because the proposed mechanism predicts a dose-dependent shift, which is exactly what the adenoma prevention trial found clinically.',
          dependsOnStepId: 'cel-w4',
          reagentsAndBuffer:
            'Urinary 2,3-dinor-6-keto-prostaglandin F1α for prostacyclin and 11-dehydro-thromboxane B2 for thromboxane, quantified by LC-MS/MS, sampled across at least three celecoxib dose levels with a non-selective NSAID and placebo arm',
        },
      ],
    },
    keyAudits: [
      {
        id: 'cel-a1',
        category: 'conclusion_shift',
        title: 'CLASS: six months of a longer trial, at up to four times the maximum approved dose',
        laymanSummary:
          'The trial that made celecoxib’s reputation reported six months of a study that ran longer, gave celecoxib at two to four times its own maximum licensed dose, and did not reach statistical significance on the endpoint that mattered most — serious ulcer complications.',
        technicalDetails:
          'CLASS randomised 8,059 patients with osteoarthritis or rheumatoid arthritis at 386 sites; 7,968 received at least one dose. Celecoxib was given at 400 mg twice daily — described in the publication itself as two and four times the maximum rheumatoid arthritis and osteoarthritis dosages respectively — against ibuprofen 800 mg three times daily and diclofenac 75 mg twice daily. Only 4,573 patients (57%) received treatment for six months. The reported outcome measures were confined to that six-month treatment period. For all patients, annualised upper gastrointestinal ulcer complications alone were 0.76% on celecoxib against 1.45% on NSAIDs, P=0.09 — not significant. Only the softer composite of complications plus symptomatic ulcers reached significance (2.08% against 3.54%, P=0.02). Among patients taking aspirin, there was no advantage at all: complications 2.01% against 2.12% (P=0.92) and the combined endpoint 4.70% against 6.00% (P=0.49). The publication also reported no difference in cardiovascular events between celecoxib and the comparator NSAIDs. Correspondence published in the same journal the following year was titled "Reporting of 6-month vs 12-month data in a clinical trial of celecoxib", and a BMJ editorial in 2002 was subtitled "Adequate analysis of the CLASS trial indicates that this may not be the case". A subsequent review of both CLASS and the rofecoxib VIGOR trial records that several discrepancies were noted between the results submitted to the FDA and those used for publication in scientific journals.',
        evidenceSource:
          'Silverstein FE, Faich G, Goldstein JL, et al. Gastrointestinal toxicity with celecoxib vs nonsteroidal anti-inflammatory drugs for osteoarthritis and rheumatoid arthritis: the CLASS study. JAMA 2000;284:1247-1255; Hrachovec JB, Mora M. Reporting of 6-month vs 12-month data in a clinical trial of celecoxib. JAMA 2001;286:2398; Jüni P, Rutjes AW, Dieppe PA. Are selective COX 2 inhibitors superior to traditional non steroidal anti-inflammatory drugs? BMJ 2002;324:1287-1288',
        doi: '10.1001/jama.284.10.1247',
        measuredMetric:
          'Annualised upper gastrointestinal ulcer complication rates over the reported six-month period, overall and stratified by aspirin use',
        auditFlag: 'contested',
      },
      {
        id: 'cel-a2',
        category: 'failed',
        title: 'APC: a dose-related tripling of cardiovascular events, and the trial was stopped',
        laymanSummary:
          'A trial testing celecoxib for preventing bowel polyps found cardiovascular events rising with dose — 1.0% on placebo, 2.3% at 200 mg twice daily, 3.4% at 400 mg twice daily. The safety monitoring board stopped the drug early.',
        technicalDetails:
          'The Adenoma Prevention with Celecoxib trial enrolled 2,035 patients with a history of colorectal neoplasia, randomised to celecoxib 200 mg twice daily, 400 mg twice daily, or placebo, with 2.8 to 3.1 years of follow-up available for all patients except those who died. A composite of cardiovascular death, myocardial infarction, stroke or heart failure occurred in 7 of 679 on placebo (1.0%), 16 of 685 on 200 mg twice daily (2.3%; hazard ratio 2.3, 95% CI 0.9 to 5.5) and 23 of 671 on 400 mg twice daily (3.4%; hazard ratio 3.4, 1.4 to 7.8). Similar trends appeared for other composite endpoints. On the basis of these observations the data and safety monitoring board recommended early discontinuation of the study drug. The dose-response is the important part: it is what a mechanism-based effect looks like, and it is why the later reassuring trial at a mean 209 mg daily does not contradict this one.',
        evidenceSource:
          'Solomon SD, McMurray JJV, Pfeffer MA, et al. Cardiovascular risk associated with celecoxib in a clinical trial for colorectal adenoma prevention. N Engl J Med 2005;352:1071-1080',
        doi: '10.1056/NEJMoa050405',
        measuredMetric:
          'Composite of cardiovascular death, myocardial infarction, stroke or heart failure by celecoxib dose against placebo over 2.8 to 3.1 years',
        auditFlag: 'caution',
      },
      {
        id: 'cel-a3',
        category: 'measured',
        title: 'PRECISION vindicated it — at a mean of 209 mg a day',
        laymanSummary:
          'The largest NSAID safety trial ever run put celecoxib head to head with ibuprofen and naproxen in 24,081 arthritis patients at raised cardiac risk. Celecoxib was not worse on heart events and was better on stomach and kidney ones. It was also given at about a quarter of the dose that had shown harm.',
        technicalDetails:
          'PRECISION randomised 24,081 patients to celecoxib (mean daily dose 209±37 mg), naproxen (852±103 mg) or ibuprofen (2,045±246 mg), treated a mean 20.3±16.0 months and followed a mean 34.1±13.4 months. The primary composite of cardiovascular death, non-fatal myocardial infarction or non-fatal stroke occurred in 2.3% on celecoxib, 2.5% on naproxen and 2.7% on ibuprofen; hazard ratio against naproxen 0.93 (95% CI 0.76 to 1.13) and against ibuprofen 0.85 (0.70 to 1.04), both meeting non-inferiority at p<0.001. Gastrointestinal events were significantly lower with celecoxib than with naproxen (p=0.01) or ibuprofen (p=0.002); renal events were significantly lower than with ibuprofen (p=0.004) but not naproxen (p=0.19). In the ambulatory blood pressure substudy of 444 patients, 24-hour systolic pressure changed by -0.3 mmHg on celecoxib against +3.7 mmHg on ibuprofen (difference -3.9 mmHg, p=0.0009), and incident hypertension among normotensive patients was 10.3% against 23.2%. The result is real and the conditions are narrow: 68.8% of participants stopped study drug and 27.4% discontinued follow-up entirely.',
        evidenceSource:
          'Nissen SE, Yeomans ND, Solomon DH, et al. Cardiovascular Safety of Celecoxib, Naproxen, or Ibuprofen for Arthritis. N Engl J Med 2016;375:2519-2529 (NCT00346216); Ruschitzka F et al., Eur Heart J 2017;38:3282-3292 (PRECISION-ABPM)',
        doi: '10.1056/NEJMoa1611593',
        measuredMetric:
          'Cardiovascular, gastrointestinal and renal event rates against two active comparators in 24,081 randomised patients',
        auditFlag: 'verified',
      },
      {
        id: 'cel-a4',
        category: 'inferred',
        title: 'Celecoxib is safe at 200 mg. That is not the same claim as celecoxib is safe.',
        laymanSummary:
          'The trial that showed harm used 800 mg a day. The trial that showed safety used a mean of 209 mg. Both are correct, and the sentence "celecoxib is cardiovascularly safe" quietly drops the dose from the claim.',
        technicalDetails:
          'The adenoma prevention trial found a dose-response — hazard ratio 2.3 at 400 mg daily and 3.4 at 800 mg daily against placebo — which is precisely the pattern the prostacyclin-thromboxane imbalance mechanism predicts. PRECISION achieved a mean 209 mg daily because osteoarthritis patients, the large majority of the enrolled population, were capped at 200 mg daily, the low end of the licensed range. So the two trials are not in conflict and neither generalises to the other: the drug has a randomised cardiovascular non-inferiority result at approximately a quarter of the dose at which it has a randomised harm result. Three further constraints on the reassuring reading: the comparators were run near their maximum doses, 68.8% of PRECISION participants stopped study drug, and non-inferiority under that much attrition is biased toward the null. The label reflects none of this asymmetry — the boxed cardiovascular thrombotic warning applies at every dose, as it does for every NSAID.',
        evidenceSource:
          'Solomon SD et al., N Engl J Med 2005;352:1071-1080 (APC dose-response); Nissen SE et al., N Engl J Med 2016;375:2519-2529 (PRECISION achieved doses and discontinuation)',
        doi: '10.1056/NEJMoa050405',
        inferredClaim:
          'That PRECISION established celecoxib as cardiovascularly safe as a molecule, when it established non-inferiority at a mean dose roughly a quarter of the one that produced a dose-related harm signal in a trial stopped early',
        auditFlag: 'contested',
      },
      {
        id: 'cel-a5',
        category: 'failed',
        title:
          'The cancer-prevention indication was withdrawn because the confirmatory study was never done',
        laymanSummary:
          'Celecoxib held an accelerated approval for reducing polyps in an inherited bowel cancer syndrome from 1999. The study required to confirm that it actually helped patients was never completed, and the indication was withdrawn in 2012.',
        technicalDetails:
          'The Federal Register notice records that the FDA approved the familial adenomatous polyposis indication for CELEBREX on 23 December 1999 under the agency’s accelerated approval regulations, 21 CFR part 314 subpart H. On 2 February 2011 the FDA requested that Pfizer voluntarily withdraw the indication "because the postmarketing study intended to verify clinical benefit and required as a condition of approval under subpart H was never completed". Pfizer requested withdrawal by letter of 3 February 2011, waived its opportunity for a hearing, and noted that the withdrawal was not "due to any new efficacy or safety data". Approval of the indication was withdrawn effective 8 June 2012. The current CELEBREX label lists six indications — osteoarthritis, rheumatoid arthritis, juvenile rheumatoid arthritis in patients 2 years and older, ankylosing spondylitis, acute pain and primary dysmenorrhoea — and familial adenomatous polyposis is not among them. Accelerated approval trades a surrogate endpoint for a promise of confirmation. This is what it looks like when the promise is not kept: twelve and a half years of an indication that was never verified, ended administratively rather than by evidence.',
        evidenceSource:
          'Pfizer, Inc.; Withdrawal of Approval of Familial Adenomatous Polyposis Indication for CELEBREX. Federal Register 2012;77(111):34052 (Docket FDA-2012-N-0494); CELEBREX prescribing information section 1 (NDA 020998)',
        measuredMetric:
          'Regulatory status of an accelerated-approval indication and completion status of its required confirmatory postmarketing study',
        auditFlag: 'retracted',
      },
      {
        id: 'cel-a6',
        category: 'failed',
        title:
          'ADAPT: no cognitive benefit, and the most blood-pressure treatment of the three arms',
        laymanSummary:
          'A prevention trial randomised 2,528 people over seventy to celecoxib, naproxen or placebo to see whether anti-inflammatories prevent Alzheimer’s. They do not. And celecoxib produced the highest rate of new blood pressure treatment of the three groups.',
        technicalDetails:
          'ADAPT randomised 2,528 participants aged 70 and over with a family history of Alzheimer’s dementia to celecoxib 200 mg twice daily, naproxen sodium 220 mg twice daily or placebo, and was suspended in December 2004 after the adenoma prevention trial reported cardiovascular harm. The cardiovascular and cerebrovascular composite gave a hazard ratio for celecoxib of 1.10 (95% CI 0.67 to 1.79) — reassuring relative to the adenoma trial, and the ADAPT investigators said so, noting that their data do not show the same level of risk. But antihypertensive treatment was initiated in 47.4% of the celecoxib group against 34.1% on placebo, hazard ratio 1.56 (1.26 to 1.94) — the highest of the three arms, above naproxen’s 1.40. On the question the trial was built for, neither drug improved cognitive function, and lower Modified Mini-Mental State Examination scores over time were seen for both treatment groups against placebo (-0.33 points for celecoxib, P=0.04). Follow-up reassessment in 2010-2011 confirmed no protection against cognitive decline.',
        evidenceSource:
          'ADAPT Research Group. Cardiovascular and cerebrovascular events in the randomized, controlled Alzheimer’s Disease Anti-Inflammatory Prevention Trial (ADAPT). PLoS Clin Trials 2006;1(7):e33; ADAPT Research Group, Arch Neurol 2008;65:896-905; Alzheimers Dement 2015;11:216-225',
        doi: '10.1371/journal.pctr.0010033',
        measuredMetric:
          'Cardiovascular composite hazard ratio, incident antihypertensive treatment and cognitive test trajectories over 1 to 46 months in 2,528 randomised elderly participants',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'One amino acid is the entire drug class',
        laymanDesc:
          'The inflammation enzyme has a small extra pocket that the housekeeping enzyme does not, because one bulky amino acid is swapped for a smaller one. Celecoxib was designed to plug that pocket.',
        molecularDetail:
          'COX-2 carries valine at position 523 where COX-1 has isoleucine, opening a side pocket into which celecoxib’s benzenesulfonamide inserts. That single substitution is the structural basis of COX-2 selectivity and of the whole coxib class.',
        iconName: 'Key',
        visualStage: 'target_binding',
      },
      {
        step: 2,
        title: 'The stomach lining is left alone',
        laymanDesc:
          'Because the housekeeping enzyme is untouched, the mucus and bicarbonate that protect the stomach keep being made. That is the measured advantage and it is real.',
        molecularDetail:
          'COX-1-derived prostaglandins maintain gastric mucosal defence and are spared. In PRECISION, gastrointestinal events were significantly lower on celecoxib than on naproxen (p=0.01) or ibuprofen (p=0.002); in the CNT meta-analysis, coxibs had the lowest upper gastrointestinal complication rate ratio of any group at 1.81 (1.17 to 2.81).',
        iconName: 'ShieldCheck',
        visualStage: 'catalytic_action',
      },
      {
        step: 3,
        title: 'So are the platelets — for better and worse',
        laymanDesc:
          'Celecoxib does not touch the platelet enzyme, so it neither thins the blood nor gets in the way of aspirin. That is a practical advantage over ibuprofen, which cancels aspirin outright.',
        molecularDetail:
          'Platelet thromboxane A2 generation is COX-1-dependent and is essentially unaffected by celecoxib at therapeutic concentrations. Consequently there is no antiplatelet effect and no competition with aspirin for the COX-1 channel — the interaction that makes ibuprofen problematic in aspirin users.',
        iconName: 'Unlink',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'In the vessel wall, sparing the platelet is the problem',
        laymanDesc:
          'The vessel lining uses the inflammation enzyme to make a substance that keeps platelets calm. Blocking that while leaving the platelet’s own clotting signal intact tips the balance toward clot formation.',
        molecularDetail:
          'Endothelial prostacyclin is largely COX-2-derived and is suppressed; platelet thromboxane A2 is COX-1-derived and is not. The resulting prostacyclin-to-thromboxane imbalance is the mechanism proposed for the class cardiovascular signal, and it predicts a dose-response — which is what the adenoma prevention trial found.',
        iconName: 'AlertTriangle',
        visualStage: 'delivery',
      },
      {
        step: 5,
        title: 'Dose decides which result you get',
        laymanDesc:
          'At 800 mg a day in a prevention trial, cardiovascular events roughly tripled and the trial was stopped. At a mean 209 mg a day in 24,081 arthritis patients, it was no worse than ibuprofen or naproxen.',
        molecularDetail:
          'APC: composite cardiovascular endpoint 1.0% on placebo, 2.3% at 400 mg daily (hazard ratio 2.3, 0.9 to 5.5), 3.4% at 800 mg daily (hazard ratio 3.4, 1.4 to 7.8). PRECISION: mean achieved dose 209±37 mg daily, primary composite 2.3%, non-inferior to both comparators. Neither result generalises to the other dose.',
        iconName: 'SlidersHorizontal',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What was measured, and what was published',
        laymanDesc:
          'Measured and holding: fewer stomach and kidney events, no aspirin interference, non-inferior heart outcomes at low dose. Published and disputed: the six-month gastrointestinal result that built the drug’s reputation, at up to four times its maximum approved dose.',
        molecularDetail:
          'CLASS as published: ulcer complications alone 0.76% against 1.45% (P=0.09, not significant); among aspirin users 2.01% against 2.12% (P=0.92). Celecoxib dose 400 mg twice daily, stated in the paper as two to four times the maximum approved dosages; 57% of patients reached six months of treatment. The accelerated-approval familial adenomatous polyposis indication was withdrawn in 2012 because the required confirmatory study was never completed.',
        iconName: 'FileWarning',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'CLASS (JAMA 2000;284:1247-1255)',
        phase: 'Phase 4, double-blind, randomised controlled trial at 386 North American sites',
        sampleSize: 8059,
        primaryEndpoint:
          'Incidence of prospectively defined symptomatic upper gastrointestinal ulcers and ulcer complications — bleeding, perforation and obstruction — during the six-month treatment period',
        endpointMet: false,
        statisticalPValue:
          'Ulcer complications alone 0.76% against 1.45% annualised, P=0.09 — not significant; complications plus symptomatic ulcers 2.08% against 3.54%, P=0.02. Among aspirin users, complications 2.01% against 2.12% (P=0.92) and the combined endpoint 4.70% against 6.00% (P=0.49)',
        unreportedAdverseSignals:
          'Celecoxib was given at 400 mg twice daily, described in the publication as two and four times the maximum rheumatoid arthritis and osteoarthritis dosages. Only 4,573 patients (57%) received treatment for six months. Correspondence in the same journal the following year was titled "Reporting of 6-month vs 12-month data in a clinical trial of celecoxib", and a subsequent review records discrepancies between the results submitted to the FDA and those published.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'APC — Adenoma Prevention with Celecoxib (N Engl J Med 2005;352:1071-1080)',
        phase: 'Randomised, double-blind, placebo-controlled chemoprevention trial',
        sampleSize: 2035,
        primaryEndpoint:
          'Prevention of colorectal adenomas; cardiovascular events reported as a prespecified blinded safety analysis',
        endpointMet: false,
        statisticalPValue:
          'Composite of cardiovascular death, myocardial infarction, stroke or heart failure: 1.0% on placebo, 2.3% at 200 mg twice daily (hazard ratio 2.3, 95% CI 0.9 to 5.5) and 3.4% at 400 mg twice daily (hazard ratio 3.4, 1.4 to 7.8)',
        unreportedAdverseSignals:
          'The data and safety monitoring board recommended early discontinuation of study drug on the basis of these observations, so follow-up was truncated at 2.8 to 3.1 years. The dose-response pattern is the finding, not the point estimate at either dose.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'NCT00346216 (PRECISION)',
        phase: 'Phase 4, randomised, double-blind, active-controlled non-inferiority',
        sampleSize: 24081,
        primaryEndpoint:
          'Antiplatelet Trialists Collaboration composite of cardiovascular death, non-fatal myocardial infarction or non-fatal stroke, adjudicated',
        endpointMet: true,
        statisticalPValue:
          'Celecoxib 2.3% against naproxen 2.5% and ibuprofen 2.7%; hazard ratio against naproxen 0.93 (0.76 to 1.13) and against ibuprofen 0.85 (0.70 to 1.04), both p<0.001 for non-inferiority. Gastrointestinal events lower than naproxen (p=0.01) and ibuprofen (p=0.002); renal events lower than ibuprofen (p=0.004)',
        unreportedAdverseSignals:
          'Mean achieved celecoxib dose was 209±37 mg daily — approximately a quarter of the 800 mg daily that produced the harm signal in APC — while comparators ran near maximum. 68.8% of patients stopped study drug and 27.4% discontinued follow-up, which biases a non-inferiority comparison toward the null.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Non-inferior to naproxen and ibuprofen on the adjudicated cardiovascular composite in 24,081 patients at a mean dose of 209 mg daily',
        'Significantly fewer gastrointestinal events than naproxen (p=0.01) and ibuprofen (p=0.002), and fewer renal events than ibuprofen (p=0.004)',
        'A dose-related cardiovascular composite of 1.0%, 2.3% and 3.4% on placebo, 400 mg and 800 mg daily in a prevention trial stopped early',
        '24-hour systolic blood pressure change of -0.3 mmHg against ibuprofen’s +3.7 mmHg, with incident hypertension 10.3% against 23.2%',
        'In CLASS, ulcer complications alone did not differ significantly from comparator NSAIDs (0.76% against 1.45%, P=0.09) and did not differ at all among aspirin users (P=0.92)',
        'The accelerated-approval familial adenomatous polyposis indication was withdrawn effective 8 June 2012 because the required confirmatory study was never completed',
      ],
      unsupportedInferences: [
        'That celecoxib is cardiovascularly safe as a molecule, when the reassuring result is at roughly a quarter of the dose that produced a randomised harm signal',
        'That CLASS demonstrated a gastrointestinal advantage, when its complication endpoint was not significant and its advantage disappeared entirely in aspirin users',
        'That COX-2 selectivity distinguishes celecoxib from "traditional" NSAIDs, when diclofenac’s whole-blood selectivity ratio falls in the same range',
        'That being gentler on the stomach makes the drug safer overall, when the same selectivity is the proposed mechanism of the vascular harm',
      ],
      whatFailedInitially: [
        'The adenoma prevention trial was stopped early by its data monitoring board for cardiovascular harm',
        'The familial adenomatous polyposis indication was withdrawn after twelve years because the confirmatory study was never done',
        'ADAPT found no cognitive benefit and the highest rate of new antihypertensive treatment of its three arms (hazard ratio 1.56 against placebo)',
        'Two other members of the class, rofecoxib and valdecoxib, were withdrawn from the market entirely',
        'The gastrointestinal advantage does not survive concurrent aspirin, which is the situation many candidate patients are in',
      ],
      realWorldOutcome: [
        'Approved in the United States on 31 December 1998 under NDA 020998, generic since 2014, now about eight United States cents a capsule',
        'The only COX-2 selective inhibitor still marketed in the United States from the original class',
        'Carries the same boxed cardiovascular thrombotic and gastrointestinal warnings as every other NSAID, plus a unique contraindication in sulfonamide allergy',
        'The only NSAID in this file with a dedicated randomised cardiovascular outcome trial — a distinction it earned by having been suspected first',
      ],
    },
    deliverySystem: {
      type: 'Oral capsules at 50, 100, 200 and 400 mg, and an oral solution (Elyxyb) for acute migraine; taken once or twice daily',
      description:
        'Poorly water-soluble, so absorption depends on particle size and formulation; peak plasma concentration comes at about three hours. Plasma protein binding is about 97%. Metabolism is principally by CYP2C9, so CYP2C9 poor metabolisers and patients on CYP2C9 inhibitors reach substantially higher exposure at the same dose, and the label directs dose reduction accordingly.',
      safetyProfile:
        'Boxed warning for cardiovascular thrombotic events including fatal myocardial infarction and stroke, and for gastrointestinal bleeding, ulceration and perforation. Contraindicated in known hypersensitivity to celecoxib or sulfonamides; after asthma, urticaria or other allergic-type reactions to aspirin or other NSAIDs, in which severe and sometimes fatal anaphylactic reactions have been reported; and in the setting of coronary artery bypass graft surgery. No antiplatelet effect, so it neither substitutes for nor interferes with cardioprotective aspirin — but adding aspirin removes most of the gastric advantage.',
    },
    commonQuestions: [
      {
        q: 'Is celecoxib actually easier on the stomach?',
        a: 'Yes, on the best evidence — but the evidence people usually mean is not the good evidence. The trial that built the reputation, CLASS, reported six months of a longer study at 400 mg twice daily, which its own publication describes as two to four times the maximum approved arthritis doses. On the endpoint that matters — serious ulcer complications, meaning bleeding, perforation or obstruction — the difference was 0.76% against 1.45% at P=0.09, which is not statistically significant. Among patients also taking aspirin there was no difference whatsoever. The good evidence came sixteen years later: in PRECISION, with 24,081 patients, gastrointestinal events were significantly lower on celecoxib than on either naproxen (p=0.01) or ibuprofen (p=0.002). So the answer is yes, on a trial that was run properly, at ordinary doses.',
        auditNote:
          'Correspondence published in JAMA the year after CLASS was titled "Reporting of 6-month vs 12-month data in a clinical trial of celecoxib". A BMJ editorial two years later carried the subtitle "Adequate analysis of the CLASS trial indicates that this may not be the case".',
      },
      {
        q: 'Isn’t this the class where drugs got withdrawn for heart attacks?',
        a: 'It is. Rofecoxib and valdecoxib were both withdrawn, and celecoxib has its own randomised harm signal: in a bowel polyp prevention trial, the cardiovascular composite was 1.0% on placebo, 2.3% at 400 mg a day and 3.4% at 800 mg a day, and the safety monitoring board stopped the drug. What makes celecoxib different is that it then got the trial the others never had. PRECISION found it non-inferior to ibuprofen and naproxen on cardiovascular events. The catch, and it is a real one, is that PRECISION ran at a mean dose of 209 mg a day — about a quarter of the dose that produced the harm. Both results stand; they are answers to different questions.',
      },
      {
        q: 'I take aspirin for my heart. Does celecoxib work with it?',
        a: 'Better than ibuprofen does, and with a caveat. Celecoxib has essentially no effect on platelet COX-1, so unlike ibuprofen it does not block aspirin from reaching its target — a genuine practical advantage. The caveat is the stomach: in CLASS, among patients taking aspirin, ulcer complication rates were 2.01% on celecoxib against 2.12% on the comparator NSAIDs, a difference of nothing at all. So if you are on aspirin, the main reason to choose celecoxib largely disappears, and acid suppression alongside a cheaper NSAID may make more sense. That is a discussion to have rather than a rule.',
      },
      {
        q: 'Why does the label mention sulfa allergy?',
        a: 'Because celecoxib contains a benzenesulfonamide group — the same chemical family as sulfonamide antibiotics — and it is the part of the molecule that plugs the COX-2 side pocket. The label contraindicates it in patients who have demonstrated allergic-type reactions to sulfonamides. No other drug in this file carries that restriction. The label separately contraindicates it after asthma, urticaria or other allergic-type reactions to aspirin or other NSAIDs, noting severe and sometimes fatal anaphylactic reactions in such patients.',
      },
      {
        q: 'Didn’t celecoxib also prevent bowel cancer?',
        a: 'It held an indication for reducing polyps in familial adenomatous polyposis from December 1999, granted under accelerated approval — a mechanism that allows a drug onto the market on a surrogate endpoint on condition that a study confirming real clinical benefit follows. That study was never completed. In February 2011 the FDA asked Pfizer to withdraw the indication for exactly that reason; Pfizer agreed, noting the withdrawal was not due to any new efficacy or safety data, and approval was withdrawn effective 8 June 2012. The current label lists six indications and familial adenomatous polyposis is not among them. Separately, the trial that was testing celecoxib for preventing sporadic colorectal adenomas is the one that found the dose-related cardiovascular harm.',
        auditNote:
          'Accelerated approval trades a surrogate for a promise. This is what it looks like when the promise is not kept — twelve and a half years of an unverified indication, ended by an administrative notice rather than by data.',
      },
      {
        q: 'Is celecoxib really different from diclofenac?',
        a: 'Less than the labels suggest. Celecoxib is classified as a selective COX-2 inhibitor and diclofenac as a traditional NSAID, but diclofenac’s COX-2 selectivity ratio in whole-blood assays falls in the same range as celecoxib’s, and in the pooled randomised trials their cardiovascular figures are similar — coxibs 1.37 for major vascular events, diclofenac 1.41. The meaningful difference is not chemical but evidential: celecoxib has a 24,081-patient randomised cardiovascular outcome trial and diclofenac has none, and a European Society of Cardiology position now regards such a trial for diclofenac as unethical to run.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Silverstein FE, Faich G, Goldstein JL, et al. Gastrointestinal toxicity with celecoxib vs nonsteroidal anti-inflammatory drugs for osteoarthritis and rheumatoid arthritis: the CLASS study. JAMA 2000;284:1247-1255',
        identifier: '10.1001/jama.284.10.1247',
        kind: 'doi',
      },
      {
        label:
          'Hrachovec JB, Mora M. Reporting of 6-month vs 12-month data in a clinical trial of celecoxib. JAMA 2001;286(19):2398',
        identifier: '11712924',
        kind: 'pmid',
      },
      {
        label:
          'Jüni P, Rutjes AW, Dieppe PA. Are selective COX 2 inhibitors superior to traditional non steroidal anti-inflammatory drugs? BMJ 2002;324:1287-1288',
        identifier: '10.1136/bmj.324.7349.1287',
        kind: 'doi',
      },
      {
        label:
          'Malhotra S, Shafiq N, Pandhi P. COX-2 inhibitors: a CLASS act or just VIGORously promoted. MedGenMed 2004;6(1):6 — records that discrepancies were noted between the CLASS and VIGOR results submitted to the FDA and those published',
        identifier: '15208519',
        kind: 'pmid',
      },
      {
        label:
          'Solomon SD, McMurray JJV, Pfeffer MA, et al. Cardiovascular risk associated with celecoxib in a clinical trial for colorectal adenoma prevention (APC). N Engl J Med 2005;352:1071-1080',
        identifier: '10.1056/NEJMoa050405',
        kind: 'doi',
      },
      PRECISION_SOURCE,
      CNT_SOURCE,
      {
        label:
          'Ruschitzka F, Borer JS, Krum H, et al. Differential blood pressure effects of ibuprofen, naproxen, and celecoxib in patients with arthritis: PRECISION-ABPM. Eur Heart J 2017;38:3282-3292',
        identifier: '10.1093/eurheartj/ehx508',
        kind: 'doi',
      },
      {
        label:
          'ADAPT Research Group. Cardiovascular and cerebrovascular events in the randomized, controlled Alzheimer’s Disease Anti-Inflammatory Prevention Trial (ADAPT). PLoS Clin Trials 2006;1(7):e33',
        identifier: '10.1371/journal.pctr.0010033',
        kind: 'doi',
      },
      {
        label:
          'Wang Z, Singh A, Jones G, et al. Efficacy and Safety of Turmeric Extracts for the Treatment of Knee Osteoarthritis: a Systematic Review and Meta-analysis of Randomised Controlled Trials. Curr Rheumatol Rep 2021;23:11',
        identifier: '10.1007/s11926-020-00975-8',
        kind: 'doi',
      },
      {
        label:
          'Pfizer, Inc.; Withdrawal of Approval of Familial Adenomatous Polyposis Indication for CELEBREX. Federal Register 2012;77(111):34052, Docket FDA-2012-N-0494, effective 8 June 2012',
        identifier: 'https://www.govinfo.gov/content/pkg/FR-2012-06-08/html/2012-13900.htm',
        kind: 'regulatory',
      },
      {
        label:
          'CELEBREX (celecoxib) Drugs@FDA application record, NDA 020998 — approval history and labelling',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020998',
        kind: 'regulatory',
      },
      {
        label:
          'CELEBREX prescribing information — sections 1 (Indications) and 4 (Contraindications), retrieved from the openFDA drug label endpoint (NDA 020998)',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22CELEBREX%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 2662 (celecoxib) — structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2662',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 7. Meloxicam — prescribed daily as a fast, gentle painkiller. Its label carries no acute pain
  //    indication, no claim of COX-2 selectivity, and a time-to-peak of four to five hours.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'meloxicam',
    name: 'Meloxicam',
    tradeName: 'Mobic, Vivlodex, Qmiiz ODT, Anjeso (intravenous)',
    sponsor:
      'Developed by Boehringer Ingelheim; United States NDA 020938 (MOBIC). Generic since 2006 and made by many manufacturers, with later low-dose and orally disintegrating formulations approved separately',
    targetGene: 'PTGS2 and PTGS1',
    targetProtein:
      'Prostaglandin-endoperoxide synthase 1 and 2. The United States label states only that the mechanism involves inhibition of cyclooxygenase COX-1 and COX-2 — it makes no selectivity claim',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2000,
    indication:
      'Relief of the signs and symptoms of osteoarthritis and rheumatoid arthritis, and of pauciarticular or polyarticular course juvenile rheumatoid arthritis in patients who weigh 60 kg or more. The oral label carries no acute pain indication',
    patientFriendlyIndication: 'Arthritis pain and inflammation, taken once a day',
    anatomicalSite:
      'The cyclooxygenase channel of COX-1 and COX-2 in inflamed synovium, gastric mucosa, kidney and platelets, held for a long time — the elimination half-life is about 20 hours',
    conditionContext: {
      conditionExplainer:
        'Meloxicam is a once-daily anti-inflammatory for arthritis. It takes four to five hours to reach peak blood levels and five days to reach steady state, which makes it a maintenance drug rather than something that works on the afternoon you take it.',
      whyItMatters:
        'Meloxicam is prescribed constantly for acute pain — a wrenched back, a dental extraction, a sprain — on a reputation for being both fast and gentle on the stomach. Its United States oral label has no acute pain indication, states no COX-2 selectivity, and records a time to peak concentration of four to five hours with steady state reached on day five. On hard gastrointestinal endpoints in observational data it sits with diclofenac, not with celecoxib.',
      whoTakesThis:
        'Adults with osteoarthritis or rheumatoid arthritis, and children with juvenile rheumatoid arthritis weighing at least 60 kg. Contraindicated in the setting of coronary artery bypass graft surgery and after aspirin- or NSAID-triggered asthma or urticaria.',
      clinicalGoals:
        'Sustained reduction in arthritis pain and stiffness from a single daily dose. No effect on joint structure or disease course.',
    },
    oneSentenceVerdict:
      'A long-half-life once-daily NSAID whose reputation for being a gentle, selective, fast-acting painkiller survives none of the three checks: its label claims no selectivity, its time to peak concentration is four to five hours with steady state on day five and no acute pain indication, and in pooled observational data its upper gastrointestinal complication risk is 3.47-fold — above ibuprofen at 1.84 and celecoxib at 1.45, and level with diclofenac.',
    laymanHowItWorks:
      'Meloxicam blocks the enzymes that make prostaglandins, the messengers that make an inflamed joint hurt and swell. What distinguishes it is timing rather than mechanism: it is absorbed slowly, peaks four to five hours after a dose, has a second smaller peak around twelve hours because the liver recycles it through the bile, and takes about five days of daily dosing to reach a steady level. That makes it a good maintenance drug for arthritis and a poor choice for pain you want gone this afternoon. It is often described as preferring the inflammation enzyme over the housekeeping one, which is supported by laboratory work and is not a claim its prescribing information makes.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 58,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0186 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 45 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States on 13 April 2000 under NDA 020938 and generic since 2006. At under two United States cents a tablet it is the cheapest NSAID in this file after aspirin, which is part of why it is so widely prescribed. Later branded formulations — a low-dose submicron capsule and an orally disintegrating tablet — were approved separately and are priced far above the generic tablet without an outcome advantage.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The question to ask before substituting is which of meloxicam’s two reputations you are actually relying on. If it is once-daily convenience in arthritis, meloxicam is cheap and does that well. If it is speed, an ordinary short-acting NSAID reaches peak concentration in one to two hours instead of four to five. If it is stomach safety, the observational data put meloxicam at 3.47 for upper gastrointestinal complications against celecoxib’s 1.45 and ibuprofen’s 1.84.',
      conventionalRx: [
        {
          name: 'Ibuprofen (Advil, Motrin)',
          class: 'Non-selective cyclooxygenase inhibitor, short half-life',
          howItCompares:
            'Reaches peak plasma concentration in one to two hours against meloxicam’s four to five, and in the pooled observational analysis of upper gastrointestinal complications sits at a relative risk of 1.84 (95% CI 1.54 to 2.20) against meloxicam’s 3.47 (2.19 to 5.50). For myocardial infarction the same programme put ibuprofen at 1.14 (0.98 to 1.31, not significant) and meloxicam at 1.25 (1.04 to 1.49, significant).',
          typicalCost:
            'US$0.0391 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 244 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: faster onset; lower measured gastrointestinal and myocardial infarction risk in observational data; an enormous single-dose evidence base. Cons: three or four doses a day; cancels cardioprotective aspirin.',
        },
        {
          name: 'Celecoxib (Celebrex)',
          class: 'COX-2 selective inhibitor',
          howItCompares:
            'If the reason for choosing meloxicam is COX-2 preference, celecoxib is the drug that actually has the label claim, the randomised gastrointestinal comparison and the cardiovascular outcome trial. In the same observational meta-analysis, celecoxib had the second-lowest upper gastrointestinal risk of any NSAID examined at 1.45 (1.17 to 1.81), less than half meloxicam’s.',
          typicalCost:
            'US$0.0760 per capsule at United States pharmacy acquisition cost (CMS NADAC, median across 112 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: the selectivity claim is in the label and supported by randomised gastrointestinal endpoints; no aspirin interference. Cons: four times the price; sulfonamide contraindication; its foundational publication was disputed.',
        },
        {
          name: 'Naproxen (Naprosyn, Aleve)',
          class: 'Non-selective cyclooxygenase inhibitor, long half-life',
          howItCompares:
            'The other long-acting option, at twice daily rather than once, with the lowest myocardial infarction relative risk of any NSAID in the observational meta-analysis at 1.06 (0.94 to 1.20) — and the worst gastrointestinal record at 4.10 (3.22 to 5.23), which is in meloxicam’s range rather than below it.',
          typicalCost:
            'US$0.0669 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 110 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: the least cardiovascular signal of the group; available over the counter. Cons: twice-daily; gastrointestinal risk comparable to or above meloxicam.',
        },
      ],
      naturalFoods: [
        {
          name: 'Boswellia serrata (Indian frankincense) standardised extract',
          activeCompound: 'Boswellic acids, principally acetyl-11-keto-β-boswellic acid',
          biologicalMechanism:
            'Boswellic acids inhibit 5-lipoxygenase rather than cyclooxygenase, so the proposed mechanism targets the leukotriene branch of the same arachidonic acid cascade that NSAIDs act on at the prostaglandin branch.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: the systematic review of 20 supplements across 69 randomised trials in hip, hand and knee osteoarthritis found Boswellia serrata extract among seven supplements showing large short-term effects on pain (effect size above 0.80). The same review found no supplement with a clinically important effect on pain at long term, which is the horizon that matters in a chronic condition.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Do not expect it to work this afternoon',
          action:
            'If the pain is acute and you need relief in an hour, ask whether meloxicam is the right choice at all.',
          patientImpact:
            'The label records mean peak concentration reached four to five hours after a 7.5 mg tablet under fasted conditions, describing it as indicating prolonged drug absorption, with steady-state concentrations reached by day five and an elimination half-life of about 20 hours.',
          clinicalPrecaution:
            'The United States oral label lists three indications — osteoarthritis, rheumatoid arthritis and juvenile rheumatoid arthritis in patients weighing at least 60 kg — and acute pain is not among them.',
        },
        {
          name: 'The long half-life cuts both ways',
          action:
            'Do not double up if a dose feels ineffective, and expect effects to persist after stopping.',
          patientImpact:
            'With a half-life around 20 hours and a second concentration peak at 12 to 14 hours from biliary recycling, meloxicam accumulates over the first five days. A dose that felt inadequate on day one may be adequate on day five without any change.',
          clinicalPrecaution:
            'The pooled observational data show upper gastrointestinal complication risk rising two to three times between low and high daily NSAID doses. Escalating to reach an effect faster is exactly the move that buys that increase.',
        },
        {
          name: 'Elderly, renal and hepatic status change the exposure substantially',
          action:
            'Mention age, kidney function and liver disease before starting, and any diuretic, ACE inhibitor or angiotensin receptor blocker.',
          patientImpact:
            'The label’s pharmacokinetic table shows peak concentration on 15 mg varying roughly five-fold across healthy adults, elderly men, elderly women, renal failure and hepatic insufficiency, with clearance ranging from 5.1 to 19 mL/min across those groups.',
          clinicalPrecaution:
            'Renal prostaglandin dependence is highest exactly when perfusion is marginal — volume depletion, diuretics, renin-angiotensin blockade — and a 20-hour half-life gives that less recovery time than a short-acting NSAID does.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC1=CN=C(S1)NC(=O)C2=C(C3=CC=CC=C3S(=O)(=O)N2C)O',
      chemicalFormula: 'C14H13N3O4S2',
      molecularWeight: '351.40 g/mol',
      targetReceptorAffinity:
        'An enolic acid of the oxicam class, structurally related to piroxicam and tenoxicam, carrying a methylthiazolyl amide in place of piroxicam’s pyridine. Absolute bioavailability is 89% against intravenous dosing. Time to peak concentration is four to five hours at 7.5 mg, the label describing this as prolonged absorption; a second peak appears at 12 to 14 hours post-dose, attributed to biliary recycling; steady state is reached by day five and the elimination half-life is about 20 hours. Pharmacokinetics are dose-proportional between 7.5 mg and 15 mg. The frequently repeated description of meloxicam as a preferential COX-2 inhibitor rests on in vitro and whole-blood selectivity work and is not a claim made in the United States label.',
      structureSource: {
        label:
          'PubChem CID 54677470 (meloxicam) — canonical SMILES, molecular formula and weight, as carried on the enriched record; bioavailability, absorption profile and half-life from the meloxicam prescribing information section 12.3',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/54677470',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'mel-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identify the polymorph, because dissolution is the rate-limiting step',
          description:
            'Meloxicam is poorly soluble and its absorption is already slow — peak at four to five hours. Crystal form and particle size therefore set the absorption profile more than the dose does, which is precisely why the low-dose submicron formulation exists as a separate product. A polymorph shift in a batch is a change in the drug, not a cosmetic finding.',
          reagentsAndBuffer:
            'Meloxicam reference standard, X-ray powder diffraction, differential scanning calorimetry, laser diffraction particle sizing, biorelevant dissolution media at pH 1.2 and pH 6.8, HPLC with ultraviolet detection at 362 nm',
        },
        {
          id: 'mel-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Build the benzothiazine dioxide core and amidate it with the aminothiazole',
          description:
            'The oxicam scaffold is a 4-hydroxy-2-methyl-2H-1,2-benzothiazine-3-carboxamide 1,1-dioxide. Meloxicam differs from piroxicam only in the amine attached at the carboxamide — 2-amino-5-methylthiazole rather than 2-aminopyridine — and that single substitution is what the entire selectivity argument rests on.',
          dependsOnStepId: 'mel-w1',
          reagentsAndBuffer:
            'Methyl 4-hydroxy-2-methyl-2H-1,2-benzothiazine-3-carboxylate 1,1-dioxide, 2-amino-5-methylthiazole, xylene or toluene under reflux with azeotropic water removal, controlled temperature to limit decarboxylation',
        },
        {
          id: 'mel-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallise to a defined form and control the piroxicam-analogue impurities',
          description:
            'Related oxicams and unreacted aminothiazole are the specified impurities, and they are chromatographically close to the drug. Crystallisation must deliver both chemical purity and the intended solid form, since a different form will produce a different absorption curve at the same label claim.',
          dependsOnStepId: 'mel-w2',
          reagentsAndBuffer:
            'Recrystallisation from dimethylformamide-water or acetone-water with controlled cooling, seeding with the target form, HPLC release testing against related-substance limits, Karl Fischer titration',
        },
        {
          id: 'mel-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Measure the COX ratio at 7.5 mg and at 15 mg exposures, not at a single concentration',
          description:
            'The selectivity claim is the reason meloxicam is chosen over ibuprofen, and it is a concentration-dependent property. An assay run at one concentration cannot distinguish a drug that is preferential at the low licensed dose from one that is non-selective at the high licensed dose, which is the question that actually matters.',
          dependsOnStepId: 'mel-w3',
          reagentsAndBuffer:
            'Whole human blood from aspirin-free donors, lipopolysaccharide-stimulated monocyte prostaglandin E2 for COX-2 and clotted-serum thromboxane B2 for COX-1, meloxicam across the plasma concentration range spanned by 7.5 mg and 15 mg steady-state dosing, celecoxib and ibuprofen as parallel controls',
        },
        {
          id: 'mel-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Characterise the enterohepatic second peak and its variability',
          description:
            'The 12-to-14-hour second concentration peak attributed to biliary recycling is not a curiosity: it means exposure depends on bile flow and gut transit, which vary with food, disease and other drugs. A pharmacokinetic profile sampled only to eight hours will miss it entirely and will underestimate total exposure.',
          dependsOnStepId: 'mel-w4',
          reagentsAndBuffer:
            'Serial plasma sampling to at least 72 hours with LC-MS/MS quantification, fed and fasted arms including a high-fat breakfast condition, bile-sequestrant co-administration arm to test the recycling hypothesis, separate elderly and renal-impairment cohorts',
        },
      ],
    },
    keyAudits: [
      {
        id: 'mel-a1',
        category: 'inferred',
        title: 'The COX-2 selectivity claim is not in the label',
        laymanSummary:
          'Meloxicam is almost always described as a COX-2 preferential anti-inflammatory, which is why people believe it is gentler than ibuprofen. Its United States prescribing information says only that its mechanism involves inhibition of COX-1 and COX-2, with no selectivity claim of any kind.',
        technicalDetails:
          'Section 12.1 of the meloxicam label reads: "Meloxicam has analgesic, anti-inflammatory, and antipyretic properties. The mechanism of action of meloxicam, like that of other NSAIDs, is not completely understood but involves inhibition of cyclooxygenase (COX-1 and COX-2)." It is word-for-word the same paragraph the label carries for ibuprofen and for naproxen. The laboratory literature on meloxicam’s COX-2 preference is genuine — whole-blood assays do show a ratio favouring COX-2 at lower concentrations — but it is concentration-dependent, and the licensed dose range spans a factor of two, from 7.5 mg to 15 mg. The comparison that would settle it, meloxicam against celecoxib on gastrointestinal outcomes at both doses, has never been run. What is on record instead is observational: in the pooled analysis of 28 observational studies, meloxicam’s upper gastrointestinal complication relative risk was 3.47 (95% CI 2.19 to 5.50), against celecoxib’s 1.45 (1.17 to 1.81) and ibuprofen’s 1.84 (1.54 to 2.20).',
        evidenceSource:
          'Meloxicam tablets United States prescribing information section 12.1 (openFDA drug label endpoint, ANDA 077944); Castellsague J et al., Drug Saf 2012;35:1127-1146 (SOS project)',
        inferredClaim:
          'That meloxicam is a selective or preferential COX-2 inhibitor in the clinically meaningful sense, and therefore gastrointestinally safer — an in vitro property extrapolated to patients, absent from the label, and contradicted by the observational hard-endpoint data',
        auditFlag: 'contested',
      },
      {
        id: 'mel-a2',
        category: 'failed',
        title: 'On hard gastrointestinal endpoints it sits with diclofenac, not with celecoxib',
        laymanSummary:
          'The reason to choose meloxicam is usually the stomach. In the largest pooled analysis of observational studies, meloxicam’s risk of serious upper gastrointestinal complications was 3.47 times that of non-use — nearly double ibuprofen’s and more than double celecoxib’s.',
        technicalDetails:
          'The SOS project meta-analysis pooled 28 cohort and case-control studies providing adjusted estimates for upper gastrointestinal complications against non-use of NSAIDs. Pooled relative risks ranged from 1.43 for aceclofenac to 18.45 for azapropazone. Below 2: aceclofenac, celecoxib 1.45 (95% CI 1.17 to 1.81) and ibuprofen 1.84 (1.54 to 2.20). Between 2 and 4: rofecoxib 2.32, sulindac 2.89, diclofenac 3.34 (2.79 to 3.99), meloxicam 3.47 (2.19 to 5.50), nimesulide 3.83 and ketoprofen 3.92. Between 4 and 5: tenoxicam, naproxen 4.10 (3.22 to 5.23), indometacin 4.14 and diflunisal. Above 5: piroxicam 7.43, ketorolac 11.50 and azapropazone. High daily doses carried risks two to three times those of low daily doses. So meloxicam is better than the older oxicams it descends from — piroxicam is at 7.43 — and worse than the two drugs it is most often chosen over. These are observational data with the confounding that implies, and they are the only hard-endpoint data comparing these molecules directly.',
        evidenceSource:
          'Castellsague J, Riera-Guardia N, Calingaert B, et al. Individual NSAIDs and upper gastrointestinal complications: a systematic review and meta-analysis of observational studies (the SOS project). Drug Saf 2012;35:1127-1146',
        doi: '10.2165/11633470-000000000-00000',
        measuredMetric:
          'Pooled adjusted relative risk of upper gastrointestinal complications against non-use, by individual NSAID',
        auditFlag: 'caution',
      },
      {
        id: 'mel-a3',
        category: 'conclusion_shift',
        title: 'MELISSA and SELECT measured dyspepsia over 28 days, and meloxicam lost on efficacy',
        laymanSummary:
          'The two trials that made meloxicam’s reputation enrolled nearly eighteen thousand people — for twenty-eight days, measuring reported side effects rather than bleeds. Serious ulcer complications were not significantly different, and in one trial pain relief consistently favoured the comparator, with significantly more people quitting meloxicam because it was not working.',
        technicalDetails:
          'MELISSA randomised 9,323 osteoarthritis patients to meloxicam 7.5 mg or diclofenac slow-release 100 mg for 28 days. Gastrointestinal adverse events were 13% against 19% (P<0.001), driven by dyspepsia, nausea, abdominal pain and diarrhoea. Perforations, ulcers or bleeds were 5 on meloxicam against 7 on diclofenac — explicitly reported as not significant — though no endoscopically verified ulcer complication occurred on meloxicam against four on diclofenac, and hospitalisation was 5 patient-days against 121. The trial also reported that differences in efficacy on visual analogue scales consistently favoured diclofenac with 95% confidence intervals not crossing zero, and that significantly more patients discontinued meloxicam for lack of efficacy (80 of 4,635 against 49 of 4,688, P<0.01). SELECT randomised 8,656 patients to meloxicam 7.5 mg or piroxicam 20 mg for 28 days: adverse events 22.5% against 27.9% (P<0.001), gastrointestinal adverse events 10.3% against 15.4% (P<0.001), and perforations, ulcers or bleeds 7 against 16 (relative risk 1.4), with four complicated events all in the piroxicam arm. Three limits define what these trials can support: the endpoints are tolerability rather than complications, the duration is one month in a disease treated for decades, and the comparators are a diclofenac dose below its most-used one and piroxicam, which the observational data later placed at a relative risk of 7.43 — the second worst NSAID examined.',
        evidenceSource:
          'Hawkey C et al. Gastrointestinal tolerability of meloxicam compared to diclofenac in osteoarthritis patients (MELISSA). Br J Rheumatol 1998;37:937-945; Dequeker J et al. Improvement in gastrointestinal tolerability of the selective COX-2 inhibitor meloxicam compared with piroxicam (SELECT). Br J Rheumatol 1998;37:946-951',
        doi: '10.1093/rheumatology/37.9.937',
        measuredMetric:
          'Gastrointestinal adverse event rates, hard ulcer complication counts, efficacy on visual analogue scales and withdrawal for lack of efficacy over 28 days',
        auditFlag: 'caution',
      },
      {
        id: 'mel-a4',
        category: 'failed',
        title: 'The oral label has no acute pain indication, and the pharmacokinetics say why',
        laymanSummary:
          'Meloxicam is handed out constantly for a wrenched back or after a tooth extraction. Peak blood concentration comes four to five hours after the dose, steady state takes five days, and the label’s three indications are all chronic arthritis.',
        technicalDetails:
          'Section 1 of the meloxicam tablet label lists osteoarthritis, rheumatoid arthritis and pauciarticular or polyarticular course juvenile rheumatoid arthritis in patients weighing at least 60 kg. There is no acute pain indication, in contrast to celecoxib, ibuprofen, naproxen, diclofenac potassium and ketorolac, all of which carry one. Section 12.3 explains the pharmacology behind that: mean peak concentration is achieved within four to five hours of a 7.5 mg tablet under fasted conditions, which the label itself describes as indicating prolonged drug absorption; steady-state concentrations are reached by day five; the elimination half-life is about 20 hours; and a second concentration peak occurs around 12 to 14 hours post-dose, suggesting biliary recycling. A drug that peaks at four to five hours and stabilises on day five is a maintenance analgesic. Prescribing it for pain that needs to be gone within the hour is an extrapolation the label does not support and the pharmacokinetics contradict.',
        evidenceSource:
          'Meloxicam tablets United States prescribing information, sections 1 and 12.3 (openFDA drug label endpoint, ANDA 077944)',
        measuredMetric:
          'Licensed indications, time to peak plasma concentration, time to steady state and elimination half-life',
        auditFlag: 'caution',
      },
      {
        id: 'mel-a5',
        category: 'measured',
        title: 'Myocardial infarction risk is significantly raised, above ibuprofen and celecoxib',
        laymanSummary:
          'In the pooled observational analysis of heart attacks, meloxicam’s relative risk was 1.25 and the confidence interval excluded no effect. Ibuprofen and celecoxib did not reach significance; naproxen was lowest.',
        technicalDetails:
          'The SOS project meta-analysis of 25 publications covering 18 independent study populations reported random-effects relative risks for acute myocardial infarction against non-use: naproxen 1.06 (95% CI 0.94 to 1.20), celecoxib 1.12 (1.00 to 1.24), ibuprofen 1.14 (0.98 to 1.31), meloxicam 1.25 (1.04 to 1.49), rofecoxib 1.34 (1.22 to 1.48), diclofenac 1.38 (1.26 to 1.52), indometacin 1.40 (1.21 to 1.62), etodolac 1.55 (1.16 to 2.06) and etoricoxib 1.97 (1.35 to 2.89). Heterogeneity between studies was present. Except for naproxen, higher risk was generally associated with higher doses, and in patients with prior coronary heart disease, use of three months or less was already associated with increased risk. Meloxicam therefore sits above the two drugs it is most often preferred to on both axes at once — gastrointestinal complications and myocardial infarction — which is the opposite of the trade-off its reputation implies.',
        evidenceSource:
          'Varas-Lorenzo C, Riera-Guardia N, Calingaert B, et al. Myocardial infarction and individual nonsteroidal anti-inflammatory drugs: meta-analysis of observational studies. Pharmacoepidemiol Drug Saf 2013;22:559-570',
        doi: '10.1002/pds.3437',
        measuredMetric:
          'Pooled random-effects relative risk of acute myocardial infarction against non-use, by individual NSAID',
        auditFlag: 'caution',
      },
      {
        id: 'mel-a6',
        category: 'measured',
        title: 'Exposure varies about five-fold between the populations that take it',
        laymanSummary:
          'The same 15 mg tablet produces very different blood levels in a healthy young man, an elderly woman, someone with kidney failure and someone with liver disease — and the label’s own table shows the range.',
        technicalDetails:
          'The label’s pharmacokinetic table reports peak concentration on 15 mg meloxicam capsules of 2.3 µg/mL (CV 59%) in elderly males, 3.2 µg/mL (24%) in elderly females, 0.59 µg/mL (36%) in renal failure and 0.84 µg/mL (29%) in hepatic insufficiency, against 1.05 µg/mL (20%) for a 7.5 mg tablet in healthy male adults. Apparent clearance ranges from 5.1 mL/min in elderly females to 19 mL/min in renal failure. Time to peak stretches to 10 hours (CV 87%) in hepatic insufficiency. Absolute bioavailability is 89%. A high-fat breakfast raises peak concentration of the capsule by about 22% without changing total exposure. The practical consequence is that "7.5 mg" and "15 mg" describe the tablet, not the exposure, and the population in whom exposure is highest — elderly women — is also the population at highest baseline risk of the gastrointestinal and renal effects that exposure drives.',
        evidenceSource:
          'Meloxicam tablets United States prescribing information section 12.3, Table 4 (openFDA drug label endpoint, ANDA 077944)',
        measuredMetric:
          'Peak concentration, time to peak and apparent clearance across healthy adults, elderly males and females, renal failure and hepatic insufficiency',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'One substitution away from piroxicam',
        laymanDesc:
          'Meloxicam is chemically an oxicam, the same family as piroxicam. The difference is a single ring swapped at one position — and that swap is the whole basis of the claim that it is gentler.',
        molecularDetail:
          'A 4-hydroxy-2-methyl-2H-1,2-benzothiazine-3-carboxamide 1,1-dioxide carrying 2-amino-5-methylthiazole where piroxicam carries 2-aminopyridine. Piroxicam’s pooled observational upper gastrointestinal relative risk is 7.43 (5.19 to 10.63); meloxicam’s is 3.47 (2.19 to 5.50). Better, and not in the range of celecoxib at 1.45.',
        iconName: 'GitCompare',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Absorbed slowly, and then recycled',
        laymanDesc:
          'It takes four to five hours to reach peak blood levels, and a second smaller peak arrives around twelve hours later because the liver sends it out in bile and the gut absorbs it again.',
        molecularDetail:
          'Absolute bioavailability 89%. Time to peak four to five hours at 7.5 mg fasted, described in the label as prolonged absorption. A second concentration peak occurs at 12 to 14 hours post-dose, attributed to biliary recycling. Steady state by day five; elimination half-life about 20 hours.',
        iconName: 'Repeat',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It blocks both enzymes — with a lean, at low concentrations',
        laymanDesc:
          'Laboratory work shows meloxicam prefers the inflammation enzyme when the concentration is low. That preference weakens as concentration rises, and the licensed dose range doubles.',
        molecularDetail:
          'Whole-blood COX-2 preference is real in vitro and concentration-dependent. The label makes no selectivity claim, stating only that the mechanism involves inhibition of cyclooxygenase COX-1 and COX-2 — the identical wording used for ibuprofen and naproxen. Pharmacokinetics are dose-proportional from 7.5 mg to 15 mg, so a doubled dose is a doubled concentration.',
        iconName: 'Scale',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Prostaglandin falls and arthritis pain falls with it',
        laymanDesc:
          'Once steady levels are reached, a single daily tablet keeps inflammatory messenger production down around the clock. That is what the drug is licensed for and what it does well.',
        molecularDetail:
          'The label states that prostaglandins sensitise afferent nerves and potentiate the action of bradykinin in inducing pain, and are mediators of inflammation, and that meloxicam’s mode of action may be due to a decrease of prostaglandins in peripheral tissues. Licensed for osteoarthritis, rheumatoid arthritis and juvenile rheumatoid arthritis at 60 kg or above.',
        iconName: 'Activity',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'And the stomach and kidney get no time off',
        laymanDesc:
          'A twenty-hour half-life means the protective prostaglandins in the stomach lining and the kidney are suppressed continuously rather than in pulses, which is the likely reason a "preferential" drug ends up with diclofenac-range bleeding numbers.',
        molecularDetail:
          'Pooled observational upper gastrointestinal complication relative risk 3.47 (2.19 to 5.50) against diclofenac 3.34 (2.79 to 3.99), ibuprofen 1.84 (1.54 to 2.20) and celecoxib 1.45 (1.17 to 1.81). Acute myocardial infarction relative risk 1.25 (1.04 to 1.49), above ibuprofen 1.14 and celecoxib 1.12.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What was measured, and what the label will not say',
        laymanDesc:
          'Measured: fewer episodes of indigestion over 28 days than diclofenac or piroxicam, and slightly worse pain relief than diclofenac. Not stated in the label: any COX-2 selectivity, and any indication for acute pain.',
        molecularDetail:
          'MELISSA: gastrointestinal adverse events 13% against 19% (P<0.001) but hard ulcer complications 5 against 7, not significant; efficacy consistently favoured diclofenac and more patients discontinued meloxicam for lack of efficacy (P<0.01). SELECT: adverse events 22.5% against 27.9% against piroxicam. Both trials ran 28 days.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'MELISSA (Br J Rheumatol 1998;37:937-945)',
        phase: 'Large-scale, double-blind, randomised, international, prospective, 28 days',
        sampleSize: 9323,
        primaryEndpoint:
          'Profile of adverse events with meloxicam 7.5 mg against diclofenac slow-release 100 mg in symptomatic osteoarthritis, with efficacy assessed alongside',
        endpointMet: true,
        statisticalPValue:
          'Gastrointestinal adverse events 13% against 19% (P<0.001); withdrawal for adverse events 5.48% against 7.96% (P<0.001); perforations, ulcers or bleeds 5 against 7 (not significant); five patient-days of hospitalisation against 121',
        unreportedAdverseSignals:
          'Efficacy on visual analogue scales consistently favoured diclofenac, with 95% confidence intervals not crossing zero, and significantly more patients discontinued meloxicam for lack of efficacy (80 of 4,635 against 49 of 4,688, P<0.01). The comparator dose was diclofenac 100 mg slow-release rather than the 150 mg used in the efficacy literature, and the trial ran 28 days in a disease treated for decades.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'SELECT (Br J Rheumatol 1998;37:946-951)',
        phase:
          'Large-scale, prospective, international, multicentre, double-blind, double-dummy, randomised, parallel-group, 28 days',
        sampleSize: 8656,
        primaryEndpoint:
          'Adverse event incidence with meloxicam 7.5 mg against piroxicam 20 mg once daily in exacerbation of osteoarthritis',
        endpointMet: true,
        statisticalPValue:
          'Adverse events 22.5% against 27.9% (P<0.001); gastrointestinal adverse events 10.3% against 15.4% (P<0.001); dyspepsia 3.4% against 5.8% (P<0.001); perforations, ulcers or bleeds 7 against 16 (relative risk 1.4), with four complicated events all on piroxicam',
        unreportedAdverseSignals:
          'The comparator, piroxicam, was later assigned a pooled observational upper gastrointestinal complication relative risk of 7.43 — the second highest of any NSAID examined — so beating it is a weak benchmark. Efficacy was equivalent, and the trial ran 28 days.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId:
          'SOS project pooled observational analyses (Drug Saf 2012 and Pharmacoepidemiol Drug Saf 2013)',
        phase:
          'Systematic review and meta-analysis of cohort and case-control studies, 28 studies for gastrointestinal and 18 independent populations for myocardial infarction',
        sampleSize: 28,
        primaryEndpoint:
          'Adjusted relative risk of upper gastrointestinal complications, and of acute myocardial infarction, for individual NSAIDs against non-use',
        endpointMet: false,
        statisticalPValue:
          'Meloxicam upper gastrointestinal complications relative risk 3.47 (95% CI 2.19 to 5.50); acute myocardial infarction relative risk 1.25 (1.04 to 1.49)',
        unreportedAdverseSignals:
          'These are observational data and cannot exclude confounding by indication — meloxicam may be preferentially prescribed to patients already thought to be at gastrointestinal risk, which would bias against it. The sample-size field records the number of pooled studies, not participants. They remain the only hard-endpoint comparison across these molecules.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Gastrointestinal adverse events 13% against diclofenac’s 19% over 28 days in 9,323 patients, with hard ulcer complications not significantly different (5 against 7)',
        'Adverse events 22.5% against piroxicam’s 27.9% over 28 days in 8,656 patients',
        'Pooled observational upper gastrointestinal complication relative risk 3.47 (2.19 to 5.50), above ibuprofen’s 1.84 and celecoxib’s 1.45',
        'Pooled observational acute myocardial infarction relative risk 1.25 (1.04 to 1.49), significantly raised',
        'Time to peak plasma concentration four to five hours, steady state by day five, elimination half-life about 20 hours',
        'Peak concentration varying roughly five-fold across healthy adults, the elderly, renal failure and hepatic insufficiency at the same dose',
      ],
      unsupportedInferences: [
        'That meloxicam is a clinically meaningful COX-2 selective agent — a claim absent from its label and using the identical mechanism wording as ibuprofen and naproxen',
        'That it is gentler on the stomach than ibuprofen, when the hard-endpoint observational data put it at roughly double ibuprofen’s risk',
        'That it is suitable for acute pain, when the oral label has no such indication and peak concentration takes four to five hours',
        'That the 28-day tolerability trials measured bleeding — they measured dyspepsia, nausea and abdominal pain, and the ulcer complication counts were not significant in MELISSA',
      ],
      whatFailedInitially: [
        'Hard ulcer complications in MELISSA were 5 against 7 and explicitly not statistically significant',
        'Efficacy in MELISSA consistently favoured diclofenac, and significantly more patients quit meloxicam for lack of efficacy',
        'Myocardial infarction risk is significantly raised where ibuprofen’s and celecoxib’s did not reach significance',
        'The comparator in SELECT, piroxicam, was subsequently found to have the second-worst gastrointestinal profile of any NSAID studied',
        'No trial has compared meloxicam with celecoxib on gastrointestinal outcomes at both licensed meloxicam doses',
      ],
      realWorldOutcome: [
        'Approved in the United States on 13 April 2000 under NDA 020938 and generic since 2006',
        'Under two United States cents a tablet at pharmacy acquisition cost across 45 listed generic products — the cheapest NSAID in this file after aspirin',
        'Very widely prescribed for acute musculoskeletal and dental pain, a use its oral label does not cover',
        'Carries the same boxed cardiovascular thrombotic and gastrointestinal warnings as every other prescription NSAID',
      ],
    },
    deliverySystem: {
      type: 'Oral tablets at 7.5 and 15 mg, capsules, an oral suspension, a low-dose submicron capsule formulation and an orally disintegrating tablet; also an intravenous formulation. Taken once daily',
      description:
        'Absolute bioavailability 89% against intravenous dosing, with dose-proportional pharmacokinetics from 7.5 to 15 mg orally. Absorption is slow: peak concentration at four to five hours, described in the label as prolonged, with a second peak at 12 to 14 hours attributed to biliary recycling and steady state reached by day five. Elimination half-life about 20 hours. A high-fat meal raises capsule peak concentration by about 22% without changing total exposure; the suspension is unaffected.',
      safetyProfile:
        'Boxed warning for cardiovascular thrombotic events including fatal myocardial infarction and stroke, and for gastrointestinal bleeding, ulceration and perforation which can occur at any time and without warning symptoms. Contraindicated in the setting of coronary artery bypass graft surgery and after asthma, urticaria or other allergic-type reactions to aspirin or other NSAIDs. The long half-life means gastric, renal and platelet effects are sustained rather than intermittent, and exposure varies several-fold with age, sex, renal function and hepatic function at the same nominal dose.',
    },
    commonQuestions: [
      {
        q: 'Is meloxicam gentler on the stomach than ibuprofen?',
        a: 'On indigestion, probably. On bleeding, the data say the opposite. The 28-day trials that built meloxicam’s reputation measured adverse events — dyspepsia, nausea, abdominal pain — and meloxicam did better than diclofenac and piroxicam on those. But serious ulcer complications in the diclofenac trial were 5 against 7 and explicitly not statistically significant. The hard-endpoint data come from a pooled analysis of 28 observational studies, which put meloxicam’s relative risk of upper gastrointestinal complications at 3.47, against ibuprofen at 1.84 and celecoxib at 1.45. Those are observational and carry the usual caveats, and they are the only comparison of these molecules on complications rather than symptoms that exists.',
        auditNote:
          'Tolerability and toxicity are different endpoints. A drug can cause less indigestion and more bleeding, because the two have different mechanisms — one is local irritation, the other is systemic prostaglandin suppression.',
      },
      {
        q: 'My doctor gave me meloxicam for a pulled muscle. Will it work today?',
        a: 'Probably not today. The label records peak blood concentration four to five hours after a 7.5 mg tablet, describes that as prolonged absorption, and states that steady-state concentrations are reached by day five with an elimination half-life of about 20 hours. That is a maintenance profile. It is also why the United States oral label’s three indications are osteoarthritis, rheumatoid arthritis and juvenile rheumatoid arthritis — there is no acute pain indication, unlike celecoxib, ibuprofen, naproxen, diclofenac potassium and ketorolac. Meloxicam is a reasonable drug to be on for weeks. It is a poor choice for an afternoon.',
      },
      {
        q: 'Is it a COX-2 inhibitor or not?',
        a: 'It leans that way in the laboratory and its label declines to say so. Section 12.1 reads that the mechanism "is not completely understood but involves inhibition of cyclooxygenase (COX-1 and COX-2)" — the identical sentence the FDA uses for ibuprofen and naproxen, with no selectivity language anywhere. Whole-blood assays do show a COX-2 preference at lower concentrations, but the preference is concentration-dependent and the licensed dose range doubles from 7.5 to 15 mg with dose-proportional pharmacokinetics. So the honest answer is: preferential at low concentration in vitro, unclaimed in the label, and not borne out on hard clinical endpoints.',
      },
      {
        q: 'Why does the same dose seem to affect people so differently?',
        a: 'Because it does, and the label’s own table shows the spread. On 15 mg capsules, mean peak concentration was 2.3 µg/mL in elderly men, 3.2 µg/mL in elderly women, 0.59 µg/mL in renal failure and 0.84 µg/mL in hepatic insufficiency, with apparent clearance running from 5.1 to 19 mL/min across those groups and time to peak stretching to ten hours in liver impairment. Add a second absorption peak at 12 to 14 hours from biliary recycling, which depends on bile flow and gut transit, and the variability compounds. The group with the highest exposure — elderly women — is also the group at highest baseline risk from that exposure.',
      },
      {
        q: 'Is it safe for my heart?',
        a: 'It carries the same boxed cardiovascular warning as every other NSAID, and the observational data are not reassuring relative to the alternatives. The pooled analysis of 18 independent study populations put meloxicam’s relative risk of acute myocardial infarction at 1.25 with a confidence interval of 1.04 to 1.49 — significantly raised — against naproxen at 1.06, celecoxib at 1.12 and ibuprofen at 1.14, none of which reached significance. It is below diclofenac at 1.38 and etoricoxib at 1.97. The same analysis found that in people with prior coronary heart disease, three months or less of use was already associated with increased risk for every drug except naproxen.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Hawkey C, Kahan A, Steinbrück K, et al. Gastrointestinal tolerability of meloxicam compared to diclofenac in osteoarthritis patients. International MELISSA Study Group. Br J Rheumatol 1998;37:937-945',
        identifier: '10.1093/rheumatology/37.9.937',
        kind: 'doi',
      },
      {
        label:
          'Dequeker J, Hawkey C, Kahan A, et al. Improvement in gastrointestinal tolerability of the selective cyclooxygenase (COX)-2 inhibitor meloxicam compared with piroxicam: the SELECT trial in osteoarthritis. Br J Rheumatol 1998;37:946-951',
        identifier: '10.1093/rheumatology/37.9.946',
        kind: 'doi',
      },
      {
        label:
          'Castellsague J, Riera-Guardia N, Calingaert B, et al. Individual NSAIDs and upper gastrointestinal complications: a systematic review and meta-analysis of observational studies (the SOS project). Drug Saf 2012;35:1127-1146',
        identifier: '10.2165/11633470-000000000-00000',
        kind: 'doi',
      },
      {
        label:
          'Varas-Lorenzo C, Riera-Guardia N, Calingaert B, et al. Myocardial infarction and individual nonsteroidal anti-inflammatory drugs: meta-analysis of observational studies. Pharmacoepidemiol Drug Saf 2013;22:559-570',
        identifier: '10.1002/pds.3437',
        kind: 'doi',
      },
      {
        label:
          'Liu X, Machado GC, Eyles JP, Ravi V, Hunter DJ. Dietary supplements for treating osteoarthritis: a systematic review and meta-analysis. Br J Sports Med 2018;52:167-175',
        identifier: '10.1136/bjsports-2016-097333',
        kind: 'doi',
      },
      CNT_SOURCE,
      {
        label:
          'MOBIC (meloxicam) Drugs@FDA application record, NDA 020938 — approval history and labelling',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020938',
        kind: 'regulatory',
      },
      {
        label:
          'Meloxicam tablets United States prescribing information — sections 1 (Indications), 12.1 (Mechanism of Action) and 12.3 (Pharmacokinetics, Table 4), retrieved from the openFDA drug label endpoint (ANDA 077944)',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22MELOXICAM%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 54677470 (meloxicam) — structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/54677470',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 8. Indomethacin — the strongest and least tolerated NSAID, licensed for arthritis by a label
  //    that also states it is not indicated for long-term treatment.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'indomethacin',
    name: 'Indomethacin',
    tradeName: 'Indocin, Tivorbex, Indocin IV',
    sponsor:
      'Developed at Merck Sharp & Dohme and introduced in 1963-1965; United States NDA 016059 (INDOCIN capsules) now held by Zyla Life Sciences and NDA 018332 (INDOCIN oral suspension) by Cosette. Generic and made by several manufacturers',
    targetGene: 'PTGS1 and PTGS2',
    targetProtein:
      'Prostaglandin-endoperoxide synthase 1 and 2, inhibited non-selectively and with high potency; indomethacin is among the most potent cyclooxygenase inhibitors in clinical use',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1965,
    indication:
      'Moderate to severe rheumatoid arthritis including acute flares of chronic disease; moderate to severe ankylosing spondylitis; moderate to severe osteoarthritis; acute painful shoulder (bursitis or tendinitis); and acute gouty arthritis. The intravenous formulation is used to close a haemodynamically significant patent ductus arteriosus in preterm infants',
    patientFriendlyIndication: 'Severe arthritis, gout attacks and inflamed shoulders',
    anatomicalSite:
      'The cyclooxygenase channel throughout the body, including the central nervous system, which it enters readily — the source of the headache and drowsiness that distinguish it from other NSAIDs',
    conditionContext: {
      conditionExplainer:
        'Indomethacin is the blunt instrument of the anti-inflammatory drugs: an old, very potent, entirely non-selective cyclooxygenase inhibitor, kept in use for the conditions where a weaker drug is not enough — an acute gout attack, an inflamed shoulder, ankylosing spondylitis.',
      whyItMatters:
        'Its label is unusual in three respects, all of which point the same way. It carries central nervous system warnings no other NSAID in this file has, an ocular warning about corneal and retinal changes with prolonged therapy, and a sentence stating outright that indomethacin capsules are not indicated for long-term treatment — in a document whose indications are three chronic arthritides. In pooled observational data it has among the worst gastrointestinal and myocardial infarction profiles of any NSAID still widely used.',
      whoTakesThis:
        'Adults with severe inflammatory arthritis, acute gout or acute shoulder bursitis; and, as an intravenous formulation, preterm infants with a patent ductus arteriosus. Contraindicated in the setting of coronary artery bypass graft surgery and after aspirin- or NSAID-triggered asthma or urticaria.',
      clinicalGoals:
        'Rapid suppression of intense inflammation, for as short a period as possible. Nothing about disease course or joint structure.',
    },
    oneSentenceVerdict:
      'The most potent and least tolerated of the common NSAIDs — pooled observational relative risk 4.14 for upper gastrointestinal complications and 1.40 for myocardial infarction, with label warnings for aggravation of depression, epilepsy and parkinsonism, corneal deposits and retinal changes, and a statement that it is not indicated for long-term treatment — and whose flagship neonatal use met both its surrogate endpoints in a 1,202-infant randomised trial while leaving death or neurosensory impairment at 18 months unchanged (47% against 46%).',
    laymanHowItWorks:
      'Indomethacin blocks the prostaglandin-making enzymes harder than almost any other drug of its type, and it does so everywhere — the inflamed joint, the stomach lining, the kidney, and the brain, which it enters more freely than most NSAIDs. That is why it puts out an acute gout attack quickly, and why roughly one user in twenty or more gets a headache from it that the label says should end treatment if reducing the dose does not fix it. The same lack of selectivity is why its stomach bleeding and heart attack numbers in observational studies sit near the top of the class.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 60,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1353 per capsule at United States pharmacy acquisition cost (CMS NADAC, median across 25 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States in 1965 under NDA 016059 and long generic. At about fourteen United States cents a capsule it is the most expensive oral NSAID in this file — roughly seven times meloxicam — which reflects a thin generic market of 25 listed products rather than any remaining exclusivity. A separately approved low-dose submicron formulation is priced far above the generic capsule.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Indomethacin is rarely the only option and is often chosen out of habit for indications where alternatives now have equal or better evidence. For an acute gout attack, colchicine and oral corticosteroids are alternatives with their own trial literature. For chronic arthritis, its own label says it is not indicated for long-term treatment. For a preterm patent ductus arteriosus, high-dose oral ibuprofen outranked it in the largest network comparison, and no pharmacotherapy changed mortality or the major complications at all.',
      conventionalRx: [
        {
          name: 'Naproxen or ibuprofen for an acute gout attack',
          class: 'Non-selective cyclooxygenase inhibitors',
          howItCompares:
            'Both carry acute pain or arthritis indications and both sit well below indomethacin in the pooled observational risk tables: upper gastrointestinal complications 4.10 for naproxen and 1.84 for ibuprofen against indomethacin’s 4.14, and acute myocardial infarction 1.06 and 1.14 against indomethacin’s 1.40. Neither carries indomethacin’s central nervous system or ocular warnings.',
          typicalCost:
            'US$0.0669 per naproxen tablet and US$0.0391 per ibuprofen tablet at United States pharmacy acquisition cost (CMS NADAC, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: cheaper, better tolerated, no headache-mandated discontinuation rule. Cons: naproxen’s gastrointestinal risk is essentially the same; the class warnings apply equally.',
        },
        {
          name: 'Colchicine',
          class: 'Microtubule polymerisation inhibitor — not an NSAID',
          howItCompares:
            'Works by a completely different mechanism: it blocks the neutrophil response to urate crystals rather than the prostaglandin cascade, so it does not touch the stomach lining, the kidney or the platelet. Its problems are its own — diarrhoea at higher doses, and serious interactions with CYP3A4 and P-glycoprotein inhibitors.',
          typicalCost:
            'Widely variable in the United States; historically the subject of a well-documented price rise after a single-product approval',
          prosAndCons:
            'Pros: no NSAID class risk; an option where renal function or gastrointestinal history rules NSAIDs out. Cons: narrow therapeutic margin; dose-limiting diarrhoea; dangerous interactions.',
        },
        {
          name: 'High-dose oral ibuprofen, for a preterm patent ductus arteriosus',
          class:
            'Cyclooxygenase inhibitor, the same pharmacology by a different molecule and route',
          howItCompares:
            'In a Bayesian network meta-analysis of 68 randomised trials and 4,802 preterm infants, high-dose oral ibuprofen had significantly higher odds of ductal closure than standard-dose intravenous indomethacin (odds ratio 2.35, 95% credible interval 1.08 to 5.31; absolute risk difference 124 more closures per 1,000 infants) and ranked best of the fourteen regimens compared.',
          typicalCost:
            'Not comparable at unit price; both are inexpensive generics in this setting',
          prosAndCons:
            'Pros: higher closure rate and best ranking for avoiding surgical ligation. Cons: the same analysis found no significant difference in mortality, necrotising enterocolitis or intraventricular haemorrhage between any treatment and placebo or no treatment.',
        },
      ],
      naturalFoods: [
        {
          name: 'Cherries and cherry extract, in gout specifically',
          activeCompound: 'Anthocyanins; the mechanism has not been established',
          biologicalMechanism:
            'Not a cyclooxygenase inhibitor in any demonstrated sense. Cherry intake has been associated with fewer recurrent gout attacks, and whether that reflects an effect on urate handling, on the inflammatory response to crystals, or on something unmeasured is unknown.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: a case-crossover study of 633 people with gout followed online for a year found cherry intake over a two-day period associated with a 35% lower risk of an attack (multivariate odds ratio 0.65, 95% CI 0.50 to 0.85), and cherry extract with a similar association (0.55, 0.30 to 0.98). This is observational and self-reported, in a design that controls for stable personal characteristics but not for what else changed in those two days.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'A persistent headache is a stopping rule, not a side effect to endure',
          action:
            'Report any headache that continues after the dose is reduced, and any drowsiness.',
          patientImpact:
            'The label states that indomethacin may cause headache, and that headache which persists despite dosage reduction requires cessation of therapy. It also states the drug may cause drowsiness and cautions against driving.',
          clinicalPrecaution:
            'Headache and dizziness are listed among the most common adverse reactions at an incidence of 3% or more, alongside dyspepsia and nausea. No other NSAID in this file carries an explicit discontinuation instruction for headache.',
        },
        {
          name: 'Say if you have depression, epilepsy or Parkinson’s disease',
          action: 'Name any psychiatric or neurological condition before starting.',
          patientImpact:
            'Section 5.15 states that indomethacin may aggravate depression or other psychiatric disturbances, epilepsy and parkinsonism, and should be used with considerable caution in patients with these conditions, with discontinuation if severe central nervous system reactions develop.',
          clinicalPrecaution:
            'This is a distinguishing feature of the molecule rather than a class effect, and it follows from how readily indomethacin enters the central nervous system.',
        },
        {
          name: 'If it is being used for months, ask about your eyes',
          action:
            'Report blurred vision, and ask whether periodic ophthalmological examination is appropriate on prolonged therapy.',
          patientImpact:
            'Section 5.16 records corneal deposits and retinal disturbances including macular changes in some patients on prolonged therapy, notes that these may be asymptomatic, and states that blurred vision warrants a thorough ophthalmological examination.',
          clinicalPrecaution:
            'The same section ends with a sentence worth reading twice: indomethacin capsules are not indicated for long-term treatment.',
        },
        {
          name: 'Aspirin does not protect you here, and adding it makes the stomach worse',
          action:
            'Do not assume a daily cardioprotective aspirin offsets the cardiovascular warning.',
          patientImpact:
            'The label states there is no consistent evidence that concurrent use of aspirin mitigates the increased risk of serious cardiovascular thrombotic events associated with NSAID use, and that concurrent aspirin and an NSAID increases the risk of serious gastrointestinal events.',
          clinicalPrecaution:
            'The same section records that in the Danish National Registry, death in the first year after a myocardial infarction occurred at 20 per 100 person-years in NSAID-treated patients against 12 per 100 person-years in the unexposed, with the elevated relative risk persisting over at least four further years.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC1=C(C2=C(N1C(=O)C3=CC=C(C=C3)Cl)C=CC(=C2)OC)CC(=O)O',
      chemicalFormula: 'C19H16ClNO4',
      molecularWeight: '357.80 g/mol',
      targetReceptorAffinity:
        'A 1-(4-chlorobenzoyl)-5-methoxy-2-methylindole-3-acetic acid — an indole acetic acid rather than an arylpropionic acid, which is why it sits in a class of its own among the drugs here. Inhibition is non-selective and among the most potent in clinical use, and the molecule is lipophilic enough to enter the central nervous system readily, which is the structural basis for the headache, drowsiness and psychiatric warnings that distinguish it. Plasma protein binding is approximately 99%. The label records that a gastroscopic study in 45 healthy subjects found significantly more gastric mucosal abnormalities with capsules than with suppositories or placebo, while a 175-patient clinical comparison found upper gastrointestinal adverse effects comparable between the two routes and lower gastrointestinal effects more common with suppositories.',
      structureSource: {
        label:
          'PubChem CID 3715 (indomethacin) — canonical SMILES, molecular formula and weight, as carried on the enriched record; route comparison and protein binding from the indomethacin prescribing information',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3715',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ind-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Control the hydrolysis products, because the amide bond is the weak point',
          description:
            'Indomethacin hydrolyses at the N-aroyl bond to 4-chlorobenzoic acid and 5-methoxy-2-methylindole-3-acetic acid, and it does so in aqueous suspension and at alkaline pH. Those two are the specified degradants and their level is the honest measure of how a suspension or a compounded preparation has been handled.',
          reagentsAndBuffer:
            'Indomethacin reference standard, 4-chlorobenzoic acid and 5-methoxy-2-methylindole-3-acetic acid reference standards, reverse-phase HPLC with ultraviolet detection at 254 and 320 nm, pH-stability profiling, light-protected storage validation',
        },
        {
          id: 'ind-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Build the indole by Fischer synthesis, then acylate the nitrogen',
          description:
            'The route condenses 4-methoxyphenylhydrazine with a levulinic acid derivative under Fischer indole conditions to give 5-methoxy-2-methylindole-3-acetic acid, which is then N-acylated with 4-chlorobenzoyl chloride. Acylating an indole nitrogen that already carries an acid side chain is the step where selectivity is lost, and it determines how much purification the next step must do.',
          dependsOnStepId: 'ind-w1',
          reagentsAndBuffer:
            '4-methoxyphenylhydrazine hydrochloride, levulinic acid or its ester, acid catalysis under Fischer indole conditions, 4-chlorobenzoyl chloride with a hindered base, anhydrous aprotic solvent under nitrogen',
        },
        {
          id: 'ind-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallise and protect from light and moisture',
          description:
            'Indomethacin is photosensitive and hydrolytically labile, and it has well-characterised polymorphs including a readily formed amorphous state with quite different dissolution behaviour. Purification here is inseparable from setting the solid form and from the packaging decision that follows.',
          dependsOnStepId: 'ind-w2',
          reagentsAndBuffer:
            'Recrystallisation from ethanol or ethyl acetate with controlled cooling, X-ray powder diffraction to confirm the crystalline gamma form, differential scanning calorimetry to exclude amorphous content, amber packaging and photostability testing to ICH conditions',
        },
        {
          id: 'ind-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Measure central nervous system penetration alongside cyclooxygenase potency',
          description:
            'For most NSAIDs the interesting number is the COX-2 to COX-1 ratio. For indomethacin the number that distinguishes it clinically is how much of it reaches the brain, because the headache, drowsiness and psychiatric warnings are the reason it is chosen last. Potency without a penetration measurement does not describe this drug.',
          dependsOnStepId: 'ind-w3',
          reagentsAndBuffer:
            'Whole human blood COX-1 and COX-2 assays for potency, in vitro blood-brain barrier permeability model with paired ibuprofen and naproxen controls, unbound fraction determination by equilibrium dialysis given approximately 99% protein binding',
        },
        {
          id: 'ind-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Quantify renal and mesenteric flow reduction, which is the neonatal mechanism',
          description:
            'The reason indomethacin closes a ductus arteriosus is prostaglandin-dependent vascular tone, and the reason it is hazardous in a preterm infant is the same mechanism acting on renal, intestinal and cerebral beds. Any assessment of the neonatal use must measure both together, because they are one effect at different sites.',
          dependsOnStepId: 'ind-w4',
          reagentsAndBuffer:
            'Doppler measurement of renal, superior mesenteric and cerebral artery flow velocity before and after dosing, urine output and creatinine, paired ibuprofen comparator arm, echocardiographic ductal shunt assessment',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ind-a1',
        category: 'failed',
        title: 'TIPP: both surrogate endpoints were met and the outcome that mattered did not move',
        laymanSummary:
          'Giving indomethacin to extremely small newborns halved the rate of a persistent fetal blood vessel and cut severe brain bleeds. At eighteen months, the proportion who had died or were left with cerebral palsy, cognitive delay, deafness or blindness was identical to placebo.',
        technicalDetails:
          'The Trial of Indomethacin Prophylaxis in Preterms randomised 1,202 infants with birth weights of 500 to 999 g to intravenous indomethacin 0.1 mg/kg or placebo once daily for three days. The primary outcome — a composite of death, cerebral palsy, cognitive delay, deafness and blindness at a corrected age of 18 months — occurred in 271 of 574 indomethacin infants (47%) against 261 of 569 placebo infants (46%), odds ratio 1.1 (95% CI 0.8 to 1.4, P=0.61). Indomethacin did what it was expected to do on the way there: patent ductus arteriosus fell from 50% to 24% (odds ratio 0.3, P<0.001) and severe periventricular and intraventricular haemorrhage from 13% to 9% (odds ratio 0.6, P=0.02). No other outcome was altered. This is the cleanest surrogate-endpoint failure in neonatal medicine: two intermediate measures moved decisively, in the expected direction, by convincing margins, and survival without neurosensory impairment did not change at all.',
        evidenceSource:
          'Schmidt B, Davis P, Moddemann D, et al. Long-term effects of indomethacin prophylaxis in extremely-low-birth-weight infants. N Engl J Med 2001;344:1966-1972',
        doi: '10.1056/NEJM200106283442602',
        measuredMetric:
          'Composite of death, cerebral palsy, cognitive delay, deafness and blindness at 18 months corrected age, against the surrogate endpoints of ductal patency and intraventricular haemorrhage',
        auditFlag: 'verified',
      },
      {
        id: 'ind-a2',
        category: 'conclusion_shift',
        title:
          'For a preterm ductus, ibuprofen now outranks it — and nothing changes the hard outcomes',
        laymanSummary:
          'Indomethacin was the standard drug for closing a persistent vessel in premature babies. The largest comparison of 68 trials and 4,802 infants put high-dose oral ibuprofen ahead of it — and found that treating with anything, versus not treating at all, made no difference to death, gut necrosis or brain haemorrhage.',
        technicalDetails:
          'The Bayesian network meta-analysis covered 68 randomised trials of 4,802 preterm infants across 14 different regimens of indomethacin, ibuprofen or acetaminophen. Overall closure was 67.4% (2,867 of 4,256 infants). High-dose oral ibuprofen had significantly higher odds of closure than standard-dose intravenous ibuprofen (odds ratio 3.59, 95% credible interval 1.64 to 8.17; absolute risk difference 199 more per 1,000 infants) and than standard-dose intravenous indomethacin (odds ratio 2.35, 1.08 to 5.31; absolute risk difference 124 more per 1,000). On ranking statistics, high-dose oral ibuprofen ranked best both for closure (mean SUCRA 0.89) and for preventing surgical ligation (0.98). The finding that reframes the whole field is the last one: there was no significant difference in the odds of mortality, necrotising enterocolitis or intraventricular haemorrhage between placebo or no treatment and any of the treatment modalities. So the drug that closes the duct best is not indomethacin, and closing the duct has not been shown to change what happens to the infant.',
        evidenceSource:
          'Mitra S, Florez ID, Tamayo ME, et al. Association of Placebo, Indomethacin, Ibuprofen, and Acetaminophen With Closure of Hemodynamically Significant Patent Ductus Arteriosus in Preterm Infants: A Systematic Review and Meta-analysis. JAMA 2018;319:1221-1238',
        doi: '10.1001/jama.2018.1896',
        measuredMetric:
          'Odds of ductal closure by regimen across 68 randomised trials, and odds of mortality, necrotising enterocolitis and intraventricular haemorrhage against placebo or no treatment',
        auditFlag: 'contested',
      },
      {
        id: 'ind-a3',
        category: 'failed',
        title:
          'Among the worst gastrointestinal and cardiac profiles of any NSAID still in wide use',
        laymanSummary:
          'In the pooled observational data, indomethacin ranks near the top for both serious stomach bleeding and heart attacks — 4.14-fold and 1.40-fold against non-use, worse on both counts than ibuprofen, celecoxib and naproxen.',
        technicalDetails:
          'The SOS project meta-analysis of 28 observational studies gave indometacin a pooled relative risk of upper gastrointestinal complications of 4.14 (95% CI 2.91 to 5.90) against non-use, placing it in the 4-to-5 band alongside tenoxicam (4.10), naproxen (4.10) and diflunisal (4.37), above diclofenac (3.34) and meloxicam (3.47), and far above ibuprofen (1.84) and celecoxib (1.45). The companion analysis of acute myocardial infarction across 18 independent study populations gave indometacin 1.40 (1.21 to 1.62), above diclofenac (1.38), rofecoxib (1.34), meloxicam (1.25), ibuprofen (1.14), celecoxib (1.12) and naproxen (1.06). Both estimates carry the confounding-by-indication caveat that applies to all observational NSAID comparisons, and indomethacin is plausibly reserved for more severe disease. What is not in doubt is that nothing in the randomised record offsets these numbers — indomethacin has no cardiovascular outcome trial and no head-to-head gastrointestinal outcome trial against a modern comparator.',
        evidenceSource:
          'Castellsague J et al., Drug Saf 2012;35:1127-1146 (SOS project, upper gastrointestinal complications); Varas-Lorenzo C et al., Pharmacoepidemiol Drug Saf 2013;22:559-570 (SOS project, myocardial infarction)',
        doi: '10.2165/11633470-000000000-00000',
        measuredMetric:
          'Pooled adjusted relative risk of upper gastrointestinal complications and of acute myocardial infarction against non-use, by individual NSAID',
        auditFlag: 'caution',
      },
      {
        id: 'ind-a4',
        category: 'measured',
        title: 'The label warns about the brain and the eye, and says it is not for long-term use',
        laymanSummary:
          'Indomethacin’s prescribing information carries warnings no other NSAID here has: it may worsen depression, epilepsy and Parkinson’s disease, it causes headaches that require stopping the drug, and prolonged use has produced corneal deposits and retinal changes. It then states that it is not indicated for long-term treatment.',
        technicalDetails:
          'Section 5.15 states that indomethacin capsules may aggravate depression or other psychiatric disturbances, epilepsy and parkinsonism, and should be used with considerable caution in patients with these conditions; that severe central nervous system adverse reactions require discontinuation; that the drug may cause drowsiness, with a caution against driving; and that headache which persists despite dosage reduction requires cessation of therapy. Section 5.16 records corneal deposits and retinal disturbances including macular changes in some patients on prolonged therapy, notes that these may be asymptomatic, advises periodic ophthalmological examination on prolonged therapy, and closes with the sentence: "Indomethacin capsules are not indicated for long-term treatment." Section 6.1 lists headache and dizziness alongside dyspepsia and nausea as the most common adverse reactions at an incidence of 3% or more. Read together with indications covering three chronic arthritides, this is a label describing a drug whose licensed uses and its own duration advice do not fit each other.',
        evidenceSource:
          'Indomethacin capsules United States prescribing information, sections 5.15, 5.16 and 6.1 (openFDA drug label endpoint, ANDA 091276)',
        measuredMetric:
          'Labelled central nervous system and ocular warnings, common adverse reaction incidence, and the stated duration limitation against the licensed indications',
        auditFlag: 'caution',
      },
      {
        id: 'ind-a5',
        category: 'inferred',
        title: 'Changing the route does not move the risk where it matters',
        laymanSummary:
          'Suppositories are often assumed to spare the stomach because the tablet never touches it. In the label’s own comparison, endoscopic damage was lower with suppositories but actual upper gastrointestinal side effects were the same — and lower gut side effects were worse.',
        technicalDetails:
          'The adverse reactions section records two studies side by side. In a gastroscopic study in 45 healthy subjects, the number of gastric mucosal abnormalities was significantly higher with indomethacin capsules than with suppositories or placebo. In a double-blind comparative clinical study of 175 patients with rheumatoid arthritis, the incidence of upper gastrointestinal adverse effects with capsules or suppositories was comparable, and the incidence of lower gastrointestinal adverse effects was greater in the suppository group. The label also states that the adverse reactions reported with capsules may occur with suppositories, and that rectal irritation and tenesmus have additionally been reported. This is a clean demonstration that NSAID gastrointestinal injury is systemic rather than contact-mediated: removing the tablet from the stomach improves what an endoscope sees and does not improve what a patient reports.',
        evidenceSource:
          'Indomethacin capsules United States prescribing information, section 6.1 (openFDA drug label endpoint, ANDA 091276)',
        inferredClaim:
          'That a rectal or parenteral route avoids NSAID gastrointestinal toxicity by bypassing the stomach — an inference from a mucosal appearance endpoint that the clinical comparison in the same label contradicts',
        auditFlag: 'caution',
      },
      {
        id: 'ind-a6',
        category: 'measured',
        title:
          'Cardioprotective aspirin does not offset the class risk, and adding it worsens the stomach',
        laymanSummary:
          'A common assumption is that someone already taking a daily aspirin is protected against the NSAID heart warning. The label says there is no consistent evidence of that, and that combining the two raises serious gastrointestinal events.',
        technicalDetails:
          'Section 5.1 of the indomethacin label states: "There is no consistent evidence that concurrent use of aspirin mitigates the increased risk of serious CV thrombotic events associated with NSAID use. The concurrent use of aspirin and an NSAID, such as indomethacin, increases the risk of serious gastrointestinal (GI) events." The same section carries the class post-infarction data: observational studies in the Danish National Registry demonstrated that patients treated with NSAIDs in the post-myocardial-infarction period were at increased risk of reinfarction, cardiovascular death and all-cause mortality beginning in the first week of treatment, with death in the first year post-infarction at 20 per 100 person-years in NSAID-treated patients against 12 per 100 person-years in the unexposed, and the elevated relative risk persisting over at least four further years of follow-up. These statements appear in every prescription NSAID label; they belong on this page because indomethacin is the molecule most often reached for when an inflammatory problem is severe, which is also when a cardiac history is most likely to be set aside.',
        evidenceSource:
          'Indomethacin capsules United States prescribing information, section 5.1 (openFDA drug label endpoint, ANDA 091276)',
        measuredMetric:
          'First-year post-infarction mortality per 100 person-years in NSAID-treated against unexposed patients, from the Danish National Registry as cited in the label',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'An indole, not a propionic acid',
        laymanDesc:
          'Indomethacin belongs to a different chemical family from ibuprofen and naproxen, and it is more potent at the target than either.',
        molecularDetail:
          '1-(4-chlorobenzoyl)-5-methoxy-2-methyl-1H-indol-3-yl acetic acid. Non-selective and among the most potent cyclooxygenase inhibitors in clinical use. Plasma protein binding approximately 99%. The N-aroyl bond hydrolyses in aqueous and alkaline conditions, which is why formulation and storage matter more here than for most NSAIDs.',
        iconName: 'Hexagon',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It gets into the brain, and the brain notices',
        laymanDesc:
          'Indomethacin crosses into the central nervous system more readily than other anti-inflammatories. That is why headache and drowsiness are among its commonest effects and why its label warns about depression, epilepsy and Parkinson’s disease.',
        molecularDetail:
          'Lipophilicity supports central nervous system penetration. Section 5.15 warns of aggravation of depression and other psychiatric disturbances, epilepsy and parkinsonism, of drowsiness affecting driving, and directs cessation for headache persisting despite dose reduction. Headache and dizziness are listed among adverse reactions occurring at 3% or more.',
        iconName: 'Brain',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Prostaglandin production falls sharply, everywhere',
        laymanDesc:
          'The strength that puts out a gout attack in hours is the same strength applied to the stomach lining, the kidney and the platelets. There is no selectivity to soften it.',
        molecularDetail:
          'Non-selective inhibition of PTGS1 and PTGS2. Licensed for moderate to severe rheumatoid arthritis including acute flares, moderate to severe ankylosing spondylitis and osteoarthritis, acute painful shoulder and acute gouty arthritis — indications chosen for intensity of inflammation rather than for duration of treatment.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'In a preterm infant, that same block closes a blood vessel',
        laymanDesc:
          'The ductus arteriosus is held open by prostaglandins after birth. Blocking them closes it — and blocks them in the kidney, gut and brain at the same time.',
        molecularDetail:
          'Prostaglandin-mediated ductal patency is the target; drug-induced reductions in renal, intestinal and cerebral blood flow are the same mechanism at other sites. In TIPP, three daily doses of 0.1 mg/kg reduced patent ductus arteriosus from 50% to 24% and severe intraventricular haemorrhage from 13% to 9%.',
        iconName: 'Baby',
        visualStage: 'target_binding',
      },
      {
        step: 5,
        title: 'And it did not change how those children were at eighteen months',
        laymanDesc:
          'Both intermediate measures improved decisively. Death, cerebral palsy, cognitive delay, deafness and blindness at eighteen months came out at 47% against 46%.',
        molecularDetail:
          'TIPP primary composite: 271 of 574 (47%) against 261 of 569 (46%), odds ratio 1.1 (95% CI 0.8 to 1.4, P=0.61). The 2018 network meta-analysis of 68 trials and 4,802 infants found no significant difference in mortality, necrotising enterocolitis or intraventricular haemorrhage between placebo or no treatment and any pharmacotherapy.',
        iconName: 'MinusCircle',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What was measured, and what the label concedes',
        laymanDesc:
          'Measured: strong, fast suppression of severe inflammation, at the cost of the worst tolerability of the group. Conceded in the label: corneal and retinal changes on prolonged therapy, and that the drug is not indicated for long-term treatment.',
        molecularDetail:
          'Pooled observational upper gastrointestinal complications 4.14 (2.91 to 5.90) and acute myocardial infarction 1.40 (1.21 to 1.62). Section 5.16: corneal deposits and retinal disturbances including macular changes on prolonged therapy, often asymptomatic, with periodic ophthalmological examination advised — followed by the statement that indomethacin capsules are not indicated for long-term treatment.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'TIPP — Trial of Indomethacin Prophylaxis in Preterms (N Engl J Med 2001;344:1966-1972)',
        phase: 'Randomised, double-blind, placebo-controlled multicentre trial',
        sampleSize: 1202,
        primaryEndpoint:
          'Composite of death, cerebral palsy, cognitive delay, deafness and blindness at a corrected age of 18 months',
        endpointMet: false,
        statisticalPValue:
          '271 of 574 (47%) on indomethacin against 261 of 569 (46%) on placebo; odds ratio 1.1 (95% CI 0.8 to 1.4), P=0.61',
        unreportedAdverseSignals:
          'Both surrogate endpoints moved decisively in the expected direction — patent ductus arteriosus 24% against 50% (odds ratio 0.3, P<0.001) and severe periventricular and intraventricular haemorrhage 9% against 13% (odds ratio 0.6, P=0.02) — and no other outcome was altered. The gap between the surrogates and the outcome is the finding.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'Network meta-analysis of pharmacotherapy for patent ductus arteriosus (JAMA 2018;319:1221-1238)',
        phase: 'Bayesian random-effects network meta-analysis of 68 randomised clinical trials',
        sampleSize: 4802,
        primaryEndpoint: 'Closure of a haemodynamically significant patent ductus arteriosus',
        endpointMet: true,
        statisticalPValue:
          'High-dose oral ibuprofen against standard-dose intravenous indomethacin: odds ratio 2.35 (95% credible interval 1.08 to 5.31), absolute risk difference 124 more closures per 1,000 infants. Overall closure rate 67.4%',
        unreportedAdverseSignals:
          'There was no significant difference in the odds of mortality, necrotising enterocolitis or intraventricular haemorrhage between placebo or no treatment and any treatment modality. The endpoint that separates the drugs is a surrogate; the endpoints that matter did not separate at all.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'SOS project pooled observational analyses (Drug Saf 2012 and Pharmacoepidemiol Drug Saf 2013)',
        phase:
          'Systematic review and meta-analysis of cohort and case-control studies, 28 studies for gastrointestinal and 18 independent populations for myocardial infarction',
        sampleSize: 28,
        primaryEndpoint:
          'Adjusted relative risk of upper gastrointestinal complications, and of acute myocardial infarction, for individual NSAIDs against non-use',
        endpointMet: false,
        statisticalPValue:
          'Indometacin upper gastrointestinal complications relative risk 4.14 (95% CI 2.91 to 5.90); acute myocardial infarction relative risk 1.40 (1.21 to 1.62)',
        unreportedAdverseSignals:
          'Observational, with confounding by indication that plausibly runs against indomethacin because it is reserved for more severe disease. The sample-size field records pooled studies, not participants.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Death or neurosensory impairment at 18 months in 1,202 extremely-low-birth-weight infants: 47% on indomethacin against 46% on placebo (odds ratio 1.1, P=0.61)',
        'Patent ductus arteriosus 24% against 50% and severe intraventricular haemorrhage 9% against 13% in the same trial',
        'High-dose oral ibuprofen had 2.35 times the odds of ductal closure of standard-dose intravenous indomethacin across 68 trials',
        'Pooled observational upper gastrointestinal complication relative risk 4.14 (2.91 to 5.90) and acute myocardial infarction 1.40 (1.21 to 1.62)',
        'Headache and dizziness listed among adverse reactions at an incidence of 3% or more',
        'Gastric mucosal abnormalities significantly fewer with suppositories than capsules in 45 healthy subjects, with no difference in reported upper gastrointestinal adverse effects in 175 patients',
      ],
      unsupportedInferences: [
        'That closing a patent ductus arteriosus improves what happens to a preterm infant — the surrogate moved and the outcome did not, in a randomised trial and in a network meta-analysis',
        'That rectal or parenteral administration avoids NSAID gastrointestinal toxicity, which the label’s own clinical comparison contradicts',
        'That a daily cardioprotective aspirin offsets the NSAID cardiovascular warning, which the label states there is no consistent evidence for',
        'That indomethacin is an appropriate long-term arthritis treatment, when its label states it is not indicated for long-term treatment',
      ],
      whatFailedInitially: [
        'The primary 18-month outcome in the largest randomised trial of neonatal indomethacin prophylaxis',
        'Its position as the first-choice pharmacotherapy for a preterm patent ductus arteriosus, displaced by high-dose oral ibuprofen',
        'Tolerability: headache severe enough that the label makes it a discontinuation criterion, plus warnings for depression, epilepsy and parkinsonism',
        'Prolonged use: corneal deposits and retinal disturbances including macular changes, often asymptomatic',
        'It has no cardiovascular outcome trial and no head-to-head gastrointestinal outcome trial against a modern comparator',
      ],
      realWorldOutcome: [
        'Approved in the United States in 1965 under NDA 016059 and long generic, with an oral suspension and an intravenous neonatal formulation approved separately',
        'About fourteen United States cents a capsule at pharmacy acquisition cost across only 25 listed generic products — the most expensive oral NSAID in this file',
        'Still widely used for acute gout and acute shoulder bursitis, indications most other NSAIDs do not carry',
        'Carries the same boxed cardiovascular thrombotic and gastrointestinal warnings as every other prescription NSAID, plus central nervous system and ocular warnings unique among the drugs here',
      ],
    },
    deliverySystem: {
      type: 'Oral capsules and extended-release capsules, an oral suspension, rectal suppositories, a low-dose submicron capsule formulation, and an intravenous solution for neonatal use',
      description:
        'Plasma protein binding is approximately 99%. The molecule is lipophilic enough to enter the central nervous system readily, which is the basis of its distinctive neurological adverse effect profile. Route affects what an endoscope sees more than what a patient reports: the label records significantly fewer gastric mucosal abnormalities with suppositories than capsules in 45 healthy subjects, but comparable upper gastrointestinal adverse effects and more lower gastrointestinal adverse effects with suppositories in a 175-patient clinical comparison.',
      safetyProfile:
        'Boxed warning for cardiovascular thrombotic events including fatal myocardial infarction and stroke, and for gastrointestinal bleeding, ulceration and perforation. Contraindicated in the setting of coronary artery bypass graft surgery. Additional labelled warnings for hepatotoxicity, hypertension, heart failure and oedema, renal toxicity and hyperkalaemia, anaphylactic reactions, serious skin reactions, haematologic toxicity, central nervous system effects and ocular effects. May aggravate depression, epilepsy and parkinsonism. Persistent headache despite dose reduction requires cessation. Corneal deposits and retinal disturbances have been observed on prolonged therapy, and the label states the capsules are not indicated for long-term treatment.',
    },
    commonQuestions: [
      {
        q: 'Why does indomethacin give me a headache when ibuprofen does not?',
        a: 'Because it gets into your brain more readily. Indomethacin is lipophilic enough to cross into the central nervous system in a way most NSAIDs do not, and the consequences are on the label: headache and dizziness are listed among the most common adverse reactions at 3% or more, alongside dyspepsia and nausea, and there is a specific instruction that headache persisting despite dose reduction requires cessation of therapy. The same section warns that the drug may cause drowsiness and cautions against driving, and that it may aggravate depression, other psychiatric disturbances, epilepsy and parkinsonism. This is genuinely distinctive to the molecule rather than a general NSAID effect.',
      },
      {
        q: 'Is indomethacin stronger than other anti-inflammatories?',
        a: 'At the enzyme, yes — it is among the most potent cyclooxygenase inhibitors in clinical use, and that is why it survives for acute gout and acute shoulder bursitis, indications most other NSAIDs do not carry. Whether that translates to better pain relief in ordinary arthritis is a different question, and the answer is not clearly yes. What is clear is what the potency costs: in the pooled observational data, upper gastrointestinal complications at 4.14 times non-use and myocardial infarction at 1.40, both above ibuprofen, celecoxib and naproxen, plus a tolerability profile that produces the headache and drowsiness warnings.',
      },
      {
        q: 'My label says it is not for long-term treatment, but I have rheumatoid arthritis. Which is it?',
        a: 'Both sentences are in the same document, and the tension is real. The indications section lists moderate to severe rheumatoid arthritis including acute flares, moderate to severe ankylosing spondylitis and moderate to severe osteoarthritis — all chronic conditions. Section 5.16, on ocular effects, ends with "Indomethacin capsules are not indicated for long-term treatment", in the context of corneal deposits and retinal disturbances observed with prolonged therapy that may be asymptomatic. The practical reading most clinicians take is that indomethacin is for flares rather than for maintenance, with periodic eye examination if it is used for long. That is a conversation to have rather than something to resolve from a page.',
        auditNote:
          'A label that indicates a drug for three chronic diseases and separately states it is not indicated for long-term treatment is describing a drug whose licensed use and its own advice have drifted apart over sixty years.',
      },
      {
        q: 'It is used in premature babies. Does it help them?',
        a: 'It closes the vessel it is meant to close, and that has not been shown to change what happens to the child. TIPP randomised 1,202 infants weighing 500 to 999 g to three days of indomethacin or placebo. Patent ductus arteriosus fell from 50% to 24% and severe brain haemorrhage from 13% to 9% — both convincing. The primary outcome, death or cerebral palsy, cognitive delay, deafness or blindness at eighteen months, was 47% against 46%, odds ratio 1.1, P=0.61. The 2018 network meta-analysis of 68 trials and 4,802 infants went further: high-dose oral ibuprofen closed ducts better than intravenous indomethacin, and there was no significant difference in mortality, necrotising enterocolitis or intraventricular haemorrhage between any treatment and no treatment at all.',
        auditNote:
          'This is the textbook example of a surrogate endpoint that does not convert. Two intermediate measures moved decisively in the right direction, and the outcome they were standing in for did not move at all.',
      },
      {
        q: 'Would a suppository be easier on my stomach?',
        a: 'It looks better on endoscopy and does not feel better to the patient. The label reports both studies next to each other: in 45 healthy subjects, gastric mucosal abnormalities were significantly more common with capsules than with suppositories or placebo; in 175 patients with rheumatoid arthritis, the incidence of upper gastrointestinal adverse effects was comparable between capsules and suppositories, and lower gastrointestinal adverse effects were more common with suppositories. Rectal irritation and tenesmus have also been reported. The reason is that NSAID gut injury is caused mainly by systemic prostaglandin suppression reaching the mucosa through the bloodstream, not by the tablet touching it.',
      },
      {
        q: 'I take a daily aspirin. Does that protect me from the heart warning?',
        a: 'The label answers this directly and the answer is no: there is no consistent evidence that concurrent use of aspirin mitigates the increased risk of serious cardiovascular thrombotic events associated with NSAID use, and combining aspirin with an NSAID increases the risk of serious gastrointestinal events. The same section records that in the Danish National Registry, patients treated with NSAIDs after a myocardial infarction had increased reinfarction, cardiovascular death and all-cause mortality beginning in the first week, with first-year mortality of 20 per 100 person-years against 12 in the unexposed, and the elevated relative risk persisting over at least four further years.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Schmidt B, Davis P, Moddemann D, et al. Long-term effects of indomethacin prophylaxis in extremely-low-birth-weight infants (TIPP). N Engl J Med 2001;344:1966-1972',
        identifier: '10.1056/NEJM200106283442602',
        kind: 'doi',
      },
      {
        label:
          'Mitra S, Florez ID, Tamayo ME, et al. Association of Placebo, Indomethacin, Ibuprofen, and Acetaminophen With Closure of Hemodynamically Significant Patent Ductus Arteriosus in Preterm Infants: A Systematic Review and Meta-analysis. JAMA 2018;319:1221-1238',
        identifier: '10.1001/jama.2018.1896',
        kind: 'doi',
      },
      {
        label:
          'Castellsague J, Riera-Guardia N, Calingaert B, et al. Individual NSAIDs and upper gastrointestinal complications: a systematic review and meta-analysis of observational studies (the SOS project). Drug Saf 2012;35:1127-1146',
        identifier: '10.2165/11633470-000000000-00000',
        kind: 'doi',
      },
      {
        label:
          'Varas-Lorenzo C, Riera-Guardia N, Calingaert B, et al. Myocardial infarction and individual nonsteroidal anti-inflammatory drugs: meta-analysis of observational studies. Pharmacoepidemiol Drug Saf 2013;22:559-570',
        identifier: '10.1002/pds.3437',
        kind: 'doi',
      },
      {
        label:
          'Zhang Y, Neogi T, Chen C, Chaisson C, Hunter DJ, Choi HK. Cherry consumption and decreased risk of recurrent gout attacks. Arthritis Rheum 2012;64:4004-4011',
        identifier: '10.1002/art.34677',
        kind: 'doi',
      },
      CNT_SOURCE,
      {
        label:
          'INDOCIN (indomethacin) Drugs@FDA application record, NDA 016059 — approval history and labelling',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=016059',
        kind: 'regulatory',
      },
      {
        label:
          'Indomethacin capsules United States prescribing information — sections 1, 5.1, 5.15, 5.16 and 6.1, retrieved from the openFDA drug label endpoint (ANDA 091276)',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22INDOMETHACIN%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 3715 (indomethacin) — structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3715',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 9. Ketorolac — the injectable NSAID with a five-day ceiling, whose own boxed warning states
  //    that raising the dose will not improve efficacy and will increase serious harm.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'ketorolac',
    name: 'Ketorolac',
    tradeName: 'Toradol, Sprix (intranasal), Acular and Acuvail (ophthalmic)',
    sponsor:
      'Developed at Syntex; United States NDA 019645 and NDA 019698 (TORADOL) held by Roche Palo. Generic and made by many manufacturers, with intranasal and ophthalmic formulations approved separately',
    targetGene: 'PTGS1 and PTGS2',
    targetProtein:
      'Prostaglandin-endoperoxide synthase 1 and 2, inhibited non-selectively; platelet function is inhibited, which is why the label contraindicates the drug before major surgery',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1989,
    indication:
      'Short-term management, not exceeding five days in adults, of moderately severe acute pain requiring analgesia at the opioid level, usually postoperatively. Oral ketorolac is licensed only as continuation of intravenous or intramuscular dosing. Ophthalmic and intranasal formulations are approved separately',
    patientFriendlyIndication: 'Severe short-term pain, usually after surgery or in hospital',
    anatomicalSite:
      'The cyclooxygenase channel throughout the body, reached rapidly by injection — including in platelets, gastric mucosa and kidney, all three of which appear in the boxed warning',
    conditionContext: {
      conditionExplainer:
        'Ketorolac is an anti-inflammatory given by injection for pain severe enough that an opioid would otherwise be used. It is not stronger than other NSAIDs at the enzyme; it is delivered faster and at a higher effective dose, and the entire regulatory apparatus around it exists to stop that being continued.',
      whyItMatters:
        'Almost every restriction on this drug is unusual, and each one is an evidence finding rather than a formality. The boxed warning states that increasing the dose beyond label recommendations will not improve efficacy and will increase serious adverse events — a claim confirmed by a randomised trial in which 10 mg, 15 mg and 30 mg intravenously produced identical pain relief. The five-day limit comes from a 20,519-course surveillance study in which gastrointestinal bleeding risk almost doubled beyond day five. And in pooled observational data its upper gastrointestinal complication risk is 11.50 — the second highest of any NSAID examined.',
      whoTakesThis:
        'Adults with severe acute pain, usually in hospital or an emergency department. The label states it is not indicated for paediatric patients, not for minor or chronic pain, and is contraindicated as a prophylactic analgesic before any major surgery.',
      clinicalGoals:
        'Opioid-level analgesia for up to five days without an opioid, or with a reduced opioid dose. Nothing beyond that period is licensed and nothing about the underlying condition changes.',
    },
    oneSentenceVerdict:
      'A parenteral non-selective NSAID licensed for no more than five days, whose own boxed warning states that exceeding the recommended dose will not improve efficacy but will increase serious harm — a claim a 240-patient randomised trial confirmed by finding 10 mg, 15 mg and 30 mg intravenously identical at 30 minutes — and whose pooled observational upper gastrointestinal complication risk of 11.50 is the second highest of any NSAID studied.',
    laymanHowItWorks:
      'Ketorolac blocks the same prostaglandin-making enzymes as ibuprofen. What makes it different is delivery: given into a vein or muscle it reaches a high blood concentration quickly, which produces pain relief comparable to what an opioid dose would give, without touching opioid receptors — so no sedation, no respiratory depression, no dependence. The cost is that every NSAID effect arrives at that same intensity: platelets stop working, the stomach lining loses its protection and the kidney loses its backup blood-flow control, all at once. That is why the licensed course is five days and why the list of people who must not receive it is longer than for any other drug in this group.',
    auditConfidence: 'High Confidence',
    confidenceScore: 78,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.9459 per millilitre at United States pharmacy acquisition cost (CMS NADAC, median across 72 listed generic products, survey effective 26 March 2025)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States in 1989 under NDA 019645 and NDA 019698 and long generic. Priced per millilitre of injection rather than per tablet, so it is not directly comparable with the oral NSAIDs in this file; it remains inexpensive. The intranasal and ophthalmic formulations were approved separately and are priced far above the injection.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The comparison that matters for ketorolac is not against other NSAIDs but against the opioid it is being used to avoid, and against a lower dose of itself. On the second point the evidence is unusually clear: 10 mg intravenously relieved pain as well as 30 mg in a randomised trial, and the label says the same thing in its boxed warning. No botanical or dietary alternative belongs in this section — nothing of that kind has been tested against opioid-level acute pain, and listing one would imply an equivalence that does not exist.',
      conventionalRx: [
        {
          name: 'A lower dose of ketorolac itself',
          class: 'The same drug at its analgesic ceiling',
          howItCompares:
            'In a randomised double-blind trial of 240 emergency department patients with moderate to severe acute pain, intravenous ketorolac at 10, 15 and 30 mg produced indistinguishable pain reduction at 30 minutes — mean numeric rating scale scores falling from 7.7, 7.5 and 7.8 to 5.1, 5.0 and 4.8 respectively — with similar rescue analgesia rates and similar adverse effects. The boxed warning makes the same point in one sentence.',
          typicalCost: 'A third of the drug at a third of the dose, with the same measured effect',
          prosAndCons:
            'Pros: identical analgesia with less exposure to the gastrointestinal, renal and platelet effects, which are dose-related. Cons: none identified in that trial; the finding is single-centre and in a population aged 18 to 65 with exclusions for ulcer, renal and hepatic disease.',
        },
        {
          name: 'An opioid, which is what ketorolac is being used instead of',
          class: 'Mu-opioid receptor agonist',
          howItCompares:
            'In the postmarketing surveillance study that produced the five-day rule, ketorolac was compared directly with parenteral opiates across 20,519 matched courses: gastrointestinal bleeding odds ratio 1.30 (95% CI 1.11 to 1.52) against the opioid, and operative site bleeding 1.02 (0.95 to 1.10) — essentially no difference on surgical bleeding. Ketorolac has no respiratory depression, no sedation and no dependence liability; the opioid has no gastric, renal or platelet effect.',
          typicalCost:
            'Widely variable; most parenteral opioids are inexpensive generics in the United States',
          prosAndCons:
            'Pros of ketorolac: no respiratory depression, no dependence, an opioid-sparing effect the label recognises. Cons: bleeding, ulceration and renal risk arriving at full intensity, and a hard five-day ceiling that opioids do not have.',
        },
        {
          name: 'Oral ibuprofen with paracetamol, where the pain is not opioid-level',
          class: 'Oral cyclooxygenase inhibitor plus an analgesic of undetermined mechanism',
          howItCompares:
            'The combination achieved at least 50% pain relief in 73% of postoperative patients against 7% on placebo, a number needed to treat of 1.5. Ketorolac is explicitly not indicated for minor or chronic painful conditions, and its pooled observational upper gastrointestinal complication relative risk of 11.50 is more than six times ibuprofen’s 1.84.',
          typicalCost:
            'US$0.0391 per ibuprofen tablet and US$0.0349 per acetaminophen tablet at United States pharmacy acquisition cost (CMS NADAC, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: far lower risk, oral, no duration limit of this kind. Cons: not equivalent for pain requiring analgesia at the opioid level, which is the population ketorolac is licensed for.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Five days is a limit, not a suggestion, and it has a study behind it',
          action: 'Count the days across every route, including any oral continuation tablets.',
          patientImpact:
            'In the postmarketing surveillance study, when analgesic therapy lasted five days or fewer the ketorolac-associated gastrointestinal bleeding odds ratio against opiates was 1.17 (95% CI 0.99 to 1.30); beyond five days it was 2.20 (1.36 to 3.57). Operative site bleeding was not affected by duration.',
          clinicalPrecaution:
            'The boxed warning states the total combined duration of injection and oral tablets is not to exceed five days, and that oral ketorolac is indicated only as continuation of parenteral dosing.',
        },
        {
          name: 'More is not stronger — the label says so outright',
          action:
            'Do not expect or request a higher dose for inadequate relief; ask about a different drug instead.',
          patientImpact:
            'The boxed warning reads: "Increasing the dose of ketorolac tromethamine beyond the label recommendations will not provide better efficacy but will increase the risk of developing serious adverse events." A randomised trial of 240 patients found 10, 15 and 30 mg intravenously equally effective at 30 minutes.',
          clinicalPrecaution:
            'The surveillance study found a dose-response relationship between average daily ketorolac dose and both gastrointestinal and operative site bleeding, with a trend test of P<0.001 for both.',
        },
        {
          name: 'Say if you are already on aspirin or another anti-inflammatory',
          action: 'List every NSAID, including over-the-counter ones and low-dose aspirin.',
          patientImpact:
            'The boxed warning contraindicates ketorolac in patients currently receiving aspirin or NSAIDs, because of the cumulative risk of inducing serious NSAID-related side effects. This is a contraindication, not a caution.',
          clinicalPrecaution:
            'It is also contraindicated in active or previous peptic ulcer disease or gastrointestinal bleeding, in advanced renal impairment or risk of renal failure from volume depletion, in suspected cerebrovascular bleeding, haemorrhagic diathesis or incomplete haemostasis, in labour and delivery, and as a prophylactic analgesic before any major surgery.',
        },
        {
          name: 'It is not licensed for children, and it is not for a headache',
          action:
            'Ask what the indication is if it is offered for anything other than severe acute pain in an adult.',
          patientImpact:
            'The boxed warning states that ketorolac is not indicated for use in paediatric patients and is NOT indicated for minor or chronic painful conditions. The licensed indication is moderately severe acute pain requiring analgesia at the opioid level, usually postoperatively.',
          clinicalPrecaution:
            'Doses must be reduced for patients 65 or older, under 50 kg, or with moderately elevated serum creatinine, with injection not exceeding 60 mg total per day in those groups.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1CN2C(=CC=C2C(=O)C3=CC=CC=C3)C1C(=O)O',
      chemicalFormula: 'C15H13NO3',
      molecularWeight: '255.27 g/mol',
      targetReceptorAffinity:
        'A pyrrolizine carboxylic acid, marketed as the tromethamine salt to give the water solubility an injection requires. It is a racemate and, as with the arylpropionic acids, cyclooxygenase inhibition resides in the S-enantiomer. Its distinguishing property is not potency at the enzyme but the plasma concentration a parenteral dose reaches, which is why the same molecule is an ordinary NSAID as an eye drop and a boxed-warning drug as an injection. The label sets a maximum daily injection dose of 120 mg against a maximum oral daily dose of 40 mg, and reduces the injection ceiling to 60 mg in patients 65 or older, under 50 kg, or with moderately elevated serum creatinine. Intrathecal and epidural administration are contraindicated because of the formulation’s alcohol content.',
      structureSource: {
        label:
          'PubChem CID 3826 (ketorolac) — canonical SMILES, molecular formula and weight, as carried on the enriched record; dose ceilings and route contraindications from the ketorolac tromethamine prescribing information boxed warning',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3826',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ket-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Release-test the injection for particulates, pH and alcohol content',
          description:
            'For an injectable the specification is as much about the solution as the molecule. The alcohol in the formulation is not incidental: it is the stated reason the label contraindicates intrathecal and epidural administration, so its content is a safety specification, not a solvent detail.',
          reagentsAndBuffer:
            'Ketorolac tromethamine reference standard, HPLC with ultraviolet detection at 313 nm, gas chromatography for ethanol content, light-obscuration particulate counting, pH and osmolality determination, sterility and bacterial endotoxin testing',
        },
        {
          id: 'ket-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Build the pyrrolizine core and acylate it with benzoyl',
          description:
            'The scaffold is 5-benzoyl-2,3-dihydro-1H-pyrrolizine-1-carboxylic acid: a bicyclic pyrrolizine carrying a benzoyl group at one position and a carboxylic acid at another. The acid is what binds the cyclooxygenase channel; the benzoyl is what makes it potent enough to give parenterally at tens of milligrams.',
          dependsOnStepId: 'ket-w1',
          reagentsAndBuffer:
            'Pyrrolizine ring precursors, Friedel-Crafts benzoylation reagents with a Lewis acid catalyst, ester hydrolysis under controlled alkaline conditions, anhydrous aprotic solvents under nitrogen',
        },
        {
          id: 'ket-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Form the tromethamine salt and control the racemate',
          description:
            'The free acid is not soluble enough for injection; the tromethamine salt is, and salt stoichiometry sets both solubility and solution pH. The marketed product is the racemate, so enantiomeric ratio is a release specification even though no separation is performed.',
          dependsOnStepId: 'ket-w2',
          reagentsAndBuffer:
            'Tromethamine with controlled stoichiometry, recrystallisation from aqueous alcohol, chiral HPLC to confirm the racemic ratio, Karl Fischer titration, sterile filtration and aseptic filling',
        },
        {
          id: 'ket-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Measure platelet inhibition at the doses actually given, not at a nominal one',
          description:
            'The label contraindicates ketorolac before major surgery and in any bleeding-risk state, so platelet inhibition is a primary safety endpoint rather than an incidental finding. It must be measured across the full clinical range — 10 mg to 30 mg intravenously — because the trial that found analgesia identical across that range did not measure whether platelet inhibition was identical too.',
          dependsOnStepId: 'ket-w3',
          reagentsAndBuffer:
            'Arachidonic-acid-induced platelet aggregometry and serum thromboxane B2 immunoassay, sampled before and at intervals after 10, 15 and 30 mg intravenous doses, bleeding time or platelet function analyser as a functional confirmation',
        },
        {
          id: 'ket-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Establish the analgesic dose-response curve with a rescue-medication endpoint',
          description:
            'A ceiling effect is only demonstrated by a study designed to detect one: several doses, a prespecified primary time point, and an objective downstream measure such as the proportion requiring rescue analgesia. Comparing one dose against placebo can never show a ceiling, which is why the ceiling went undocumented in randomised form for decades after the label asserted it.',
          dependsOnStepId: 'ket-w4',
          reagentsAndBuffer:
            'Randomised double-blind allocation to at least three intravenous doses, numeric rating scale pain scores at baseline and to 120 minutes, prespecified rescue morphine at 30 minutes as an objective endpoint, mixed-model regression analysis',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ket-a1',
        category: 'measured',
        title: 'A randomised trial confirmed the ceiling the label had asserted for decades',
        laymanSummary:
          'Ketorolac’s boxed warning has always said that raising the dose will not work better and will cause more harm. In 2017 someone tested it: 10 mg, 15 mg and 30 mg into a vein relieved pain identically in 240 emergency patients.',
        technicalDetails:
          'The randomised double-blind trial enrolled 240 patients aged 18 to 65 presenting with moderate to severe acute pain (numeric rating scale 5 or above), 80 per dose group, excluding peptic ulcer disease, gastrointestinal haemorrhage, renal or hepatic insufficiency, NSAID allergy, pregnancy, and extremes of blood pressure or pulse. Mean baseline pain scores were 7.7, 7.5 and 7.8 in the 10, 15 and 30 mg groups, improving to 5.1, 5.0 and 4.8 at 30 minutes, with overlapping confidence intervals (4.5 to 5.7, 4.5 to 5.6 and 4.2 to 5.4) and no difference between groups. Rescue analgesia rates were similar, adverse effect rates were similar — most commonly dizziness, nausea and headache — and there were no serious adverse events. The authors’ conclusion is that intravenous ketorolac at the analgesic ceiling dose of 10 mg provided effective relief. This is the rare case of a boxed-warning assertion — "increasing the dose beyond the label recommendations will not provide better efficacy but will increase the risk of developing serious adverse events" — being tested prospectively and holding.',
        evidenceSource:
          'Motov S, Yasavolian M, Likourezos A, et al. Comparison of Intravenous Ketorolac at Three Single-Dose Regimens for Treating Acute Pain in the Emergency Department: A Randomized Controlled Trial. Ann Emerg Med 2017;70:177-184; ketorolac tromethamine prescribing information, boxed warning',
        doi: '10.1016/j.annemergmed.2016.10.014',
        measuredMetric:
          'Pain reduction on a numeric rating scale at 30 minutes across intravenous doses of 10, 15 and 30 mg, with rescue analgesia rates',
        auditFlag: 'verified',
      },
      {
        id: 'ket-a2',
        category: 'measured',
        title:
          'The five-day rule comes from a 20,519-course study, and the risk doubles at day six',
        laymanSummary:
          'The famous five-day limit is not arbitrary. A surveillance study across 35 hospitals compared ten thousand courses of ketorolac with ten thousand matched courses of injectable opioid: within five days the bleeding difference was marginal; beyond five days it more than doubled.',
        technicalDetails:
          'The postmarketing surveillance inception cohort study covered 10,272 courses of parenteral ketorolac and 10,247 courses of a parenteral opiate, matched by hospital, admitting service and start date, across 35 hospitals in the Philadelphia region between 1991 and 1993. The multivariate adjusted odds ratio comparing ketorolac with opiates was 1.30 (95% CI 1.11 to 1.52) for gastrointestinal bleeding and 1.02 (0.95 to 1.10) for operative site bleeding. In patients aged 75 or older both rose — gastrointestinal bleeding 1.66 (1.23 to 2.25), operative site bleeding 1.12 (0.94 to 1.35). A dose-response relationship was evident between average daily dose and both bleeding endpoints (trend test P<0.001 for both). Duration was decisive for gastrointestinal bleeding and irrelevant for operative site bleeding: at five days or fewer the odds ratio was 1.17 (0.99 to 1.30), and beyond five days it was 2.20 (1.36 to 3.57). The authors concluded that the overall associations were small but that risk becomes clinically important at higher doses, in older patients and beyond five days. That sentence is the boxed warning, and it is unusual for a labelling restriction to have a study this specific behind it.',
        evidenceSource:
          'Strom BL, Berlin JA, Kinman JL, et al. Parenteral ketorolac and risk of gastrointestinal and operative site bleeding: a postmarketing surveillance study. JAMA 1996;275:376-382',
        measuredMetric:
          'Adjusted odds ratio for gastrointestinal and operative site bleeding against parenteral opiates, stratified by age, dose and duration',
        auditFlag: 'verified',
      },
      {
        id: 'ket-a3',
        category: 'failed',
        title: 'The highest gastrointestinal complication risk of any NSAID here, by a wide margin',
        laymanSummary:
          'In the pooled analysis of observational studies, ketorolac’s risk of serious upper gastrointestinal complications was 11.50 times that of non-use — second only to a drug withdrawn from most markets, and more than six times ibuprofen’s.',
        technicalDetails:
          'The SOS project meta-analysis of 28 observational studies ranked individual NSAIDs by pooled adjusted relative risk of upper gastrointestinal complications against non-use. The range ran from 1.43 for aceclofenac to 18.45 for azapropazone. Ketorolac came second highest at 11.50 (95% CI 5.56 to 23.78), above piroxicam at 7.43 and far above indometacin 4.14, naproxen 4.10, meloxicam 3.47, diclofenac 3.34, ibuprofen 1.84 and celecoxib 1.45. The confidence interval is wide, reflecting how few studies capture a drug used mostly in hospital for short courses, and the estimate carries the confounding-by-indication problem in an acute form — ketorolac is given to postoperative and severely injured patients whose baseline bleeding risk is not that of a community NSAID user. Even discounting heavily for both, this is the drug in this file whose gastrointestinal warning is most firmly grounded, and the label reflects it with an absolute contraindication in active or previous peptic ulcer disease or gastrointestinal bleeding.',
        evidenceSource:
          'Castellsague J, Riera-Guardia N, Calingaert B, et al. Individual NSAIDs and upper gastrointestinal complications: a systematic review and meta-analysis of observational studies (the SOS project). Drug Saf 2012;35:1127-1146',
        doi: '10.2165/11633470-000000000-00000',
        measuredMetric:
          'Pooled adjusted relative risk of upper gastrointestinal complications against non-use, by individual NSAID',
        auditFlag: 'caution',
      },
      {
        id: 'ket-a4',
        category: 'measured',
        title:
          'The contraindication list is the longest of any drug in this file, and it is specific',
        laymanSummary:
          'Most NSAID labels warn. This one forbids: before major surgery, alongside any other NSAID or aspirin, in labour, in children, into the spine, in anyone with a bleeding tendency or advanced kidney disease.',
        technicalDetails:
          'The boxed warning contraindicates ketorolac in active peptic ulcer disease, recent gastrointestinal bleeding or perforation and any history of either; in advanced renal impairment and in patients at risk of renal failure from volume depletion; in suspected or confirmed cerebrovascular bleeding, haemorrhagic diathesis, incomplete haemostasis and high bleeding risk; as a prophylactic analgesic before any major surgery; in the setting of coronary artery bypass graft surgery; in previously demonstrated hypersensitivity to ketorolac or allergic manifestations to aspirin or other NSAIDs; for intrathecal or epidural administration, because of the formulation’s alcohol content; in labour and delivery, because it may adversely affect fetal circulation and inhibit uterine contractions; and in patients currently receiving aspirin or NSAIDs, because of cumulative risk. It further states the drug is not indicated for paediatric patients and not indicated for minor or chronic painful conditions, and sets a reduced injection ceiling of 60 mg total daily for patients 65 or older, under 50 kg, or with moderately elevated serum creatinine. Each of these is a place where an ordinary NSAID would carry a caution and this one carries a prohibition — a reasonable proxy for how much drug a parenteral dose actually delivers.',
        evidenceSource:
          'Ketorolac tromethamine United States prescribing information, boxed warning and Indications and Usage (openFDA drug label endpoint, ANDA 074802)',
        measuredMetric:
          'Labelled contraindications, population exclusions and dose ceilings against the corresponding warnings in other NSAID labels',
        auditFlag: 'verified',
      },
      {
        id: 'ket-a5',
        category: 'inferred',
        title: '"As strong as morphine" is a route effect, and the label does not say it',
        laymanSummary:
          'Ketorolac is often described as being as powerful as morphine. What its label actually says is that it is for pain requiring analgesia at the opioid level and that it has an opioid-sparing effect — which is a different and weaker claim.',
        technicalDetails:
          'The Indications section states that ketorolac is indicated for the short-term management of moderately severe acute pain that requires analgesia at the opioid level, that it has been used concomitantly with morphine and meperidine and shown an opioid-sparing effect, and that for breakthrough pain the lower end of the ketorolac dosage range should be supplemented with low doses of narcotics as needed. None of that asserts equivalence to an opioid; it describes a drug used in a setting where an opioid would otherwise be, alongside one when needed. At the enzyme ketorolac is not extraordinary — it is a non-selective cyclooxygenase inhibitor like ibuprofen. What is extraordinary is the plasma concentration a parenteral dose reaches, which is why the maximum daily injection dose is 120 mg against 40 mg orally, and why the same molecule is an unremarkable eye drop and a boxed-warning drug in a syringe. Reading the parenteral effect as intrinsic potency leads directly to the error the boxed warning was written to prevent: escalating the dose for inadequate relief.',
        evidenceSource:
          'Ketorolac tromethamine United States prescribing information, Indications and Usage and boxed warning (openFDA drug label endpoint, ANDA 074802)',
        inferredClaim:
          'That ketorolac is pharmacologically equivalent to an opioid analgesic — an inference from the clinical setting in which it is used, which the label describes as opioid-sparing rather than opioid-equivalent',
        auditFlag: 'caution',
      },
      {
        id: 'ket-a6',
        category: 'measured',
        title: 'It did not increase surgical site bleeding — and that finding is often forgotten',
        laymanSummary:
          'Surgeons frequently avoid ketorolac for fear of bleeding at the operation site. In the 20,519-course study that fear was not borne out: the odds ratio for operative site bleeding was 1.02, essentially identical to opioids.',
        technicalDetails:
          'In the postmarketing surveillance study the multivariate adjusted odds ratio for operative site bleeding comparing ketorolac with parenteral opiates was 1.02 (95% CI 0.95 to 1.10) — no detectable increase — against 1.30 (1.11 to 1.52) for gastrointestinal bleeding. In patients aged 75 or older it rose to 1.12 (0.94 to 1.35), still not significant. Two qualifications keep this from being a licence: a dose-response relationship with average daily dose was evident for operative site bleeding as well as gastrointestinal bleeding (trend test P<0.001 for both), and the label separately contraindicates ketorolac as a prophylactic analgesic before any major surgery and in incomplete haemostasis. So the correct reading is narrow — postoperative ketorolac at licensed doses was not associated with more surgical bleeding in this cohort — rather than a general statement that platelet inhibition does not matter. This audit is included because an evidence audit that only reports findings unfavourable to a drug is not an audit either.',
        evidenceSource:
          'Strom BL, Berlin JA, Kinman JL, et al. Parenteral ketorolac and risk of gastrointestinal and operative site bleeding: a postmarketing surveillance study. JAMA 1996;275:376-382',
        measuredMetric:
          'Adjusted odds ratio for operative site bleeding, ketorolac against parenteral opiates, overall and in patients aged 75 or older',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'An ordinary NSAID delivered in an extraordinary way',
        laymanDesc:
          'At the enzyme, ketorolac is nothing special — a non-selective blocker like ibuprofen. What makes it different is that it goes into a vein or a muscle and reaches a high concentration within minutes.',
        molecularDetail:
          'A pyrrolizine carboxylic acid given as the tromethamine salt for solubility. Non-selective PTGS1 and PTGS2 inhibition, activity residing in the S-enantiomer of the marketed racemate. Maximum daily injection dose 120 mg against 40 mg orally — a threefold difference that is the whole basis of the drug’s clinical position.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Pain relief arrives at opioid-level intensity, without an opioid receptor',
        laymanDesc:
          'It relieves pain severe enough that an opioid would otherwise be used, and it does so without sedation, without slowing breathing and without dependence.',
        molecularDetail:
          'The label indicates it for moderately severe acute pain requiring analgesia at the opioid level, usually postoperatively, and records an opioid-sparing effect when used with morphine or meperidine. There is no opioid receptor interaction; the mechanism is prostaglandin suppression at a high plasma concentration.',
        iconName: 'Activity',
        visualStage: 'catalytic_action',
      },
      {
        step: 3,
        title: 'And it stops there — the curve is flat above 10 mg',
        laymanDesc:
          'Tripling the intravenous dose does not triple the relief. In a randomised trial, 10, 15 and 30 mg gave identical pain scores at thirty minutes.',
        molecularDetail:
          'Randomised double-blind trial in 240 emergency department patients: mean numeric rating scale 7.7, 7.5 and 7.8 at baseline falling to 5.1, 5.0 and 4.8 at 30 minutes for 10, 15 and 30 mg, with overlapping confidence intervals, similar rescue analgesia and similar adverse effects. The boxed warning had asserted this ceiling since approval.',
        iconName: 'Minimize2',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Every other cyclooxygenase effect arrives at the same intensity',
        laymanDesc:
          'Platelets stop clumping, the stomach lining loses its protection and the kidney loses its backup blood-flow control — all at the concentration that produced the pain relief.',
        molecularDetail:
          'Platelet function inhibition is why the label contraindicates use before major surgery and in any bleeding-risk state. Gastric mucosal prostaglandin suppression underlies the absolute contraindication in peptic ulcer disease or prior gastrointestinal bleeding. Renal prostaglandin dependence underlies the contraindication in advanced renal impairment and volume depletion.',
        iconName: 'AlertOctagon',
        visualStage: 'cellular_entry',
      },
      {
        step: 5,
        title: 'Which is why the clock starts on day one',
        laymanDesc:
          'Within five days, the bleeding difference against an opioid is marginal. Past five days it more than doubles. That is where the limit comes from.',
        molecularDetail:
          'Gastrointestinal bleeding odds ratio against parenteral opiates: 1.17 (0.99 to 1.30) at five days or fewer, 2.20 (1.36 to 3.57) beyond five days, across 20,519 matched courses. Age 75 or older raised the overall odds ratio to 1.66 (1.23 to 2.25). Operative site bleeding was unaffected by duration at 1.02 (0.95 to 1.10).',
        iconName: 'Timer',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What was measured, and what was assumed',
        laymanDesc:
          'Measured: the dose ceiling, the five-day threshold, the absence of extra surgical bleeding, and the highest gastrointestinal complication risk in this file. Assumed: that it is as powerful as morphine, which its label describes only as opioid-sparing.',
        molecularDetail:
          'Pooled observational upper gastrointestinal complication relative risk 11.50 (5.56 to 23.78), second highest of any NSAID examined. Label: not indicated for paediatric patients, not for minor or chronic painful conditions, contraindicated alongside aspirin or any other NSAID, and contraindicated as a prophylactic analgesic before major surgery.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Three-dose intravenous ketorolac trial (Ann Emerg Med 2017;70:177-184)',
        phase: 'Randomised, double-blind, three-arm dose comparison',
        sampleSize: 240,
        primaryEndpoint: 'Pain reduction on a numeric rating scale at 30 minutes',
        endpointMet: true,
        statisticalPValue:
          'No differences between 10, 15 and 30 mg intravenously — 95% confidence intervals 4.5 to 5.7, 4.5 to 5.6 and 4.2 to 5.4 respectively; mean scores falling from 7.7, 7.5 and 7.8 at baseline to 5.1, 5.0 and 4.8 at 30 minutes',
        unreportedAdverseSignals:
          'The trial demonstrates equal analgesia and did not measure whether platelet inhibition, renal effects or gastric prostaglandin suppression were also equal across the three doses — and the surveillance data show a dose-response for bleeding. Single-centre, ages 18 to 65, with ulcer, renal and hepatic disease excluded.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Parenteral ketorolac postmarketing surveillance cohort (JAMA 1996;275:376-382)',
        phase: 'Postmarketing surveillance inception cohort study across 35 hospitals, 1991-1993',
        sampleSize: 20519,
        primaryEndpoint:
          'Gastrointestinal and operative site bleeding with parenteral ketorolac against matched courses of a parenteral opiate',
        endpointMet: false,
        statisticalPValue:
          'Gastrointestinal bleeding adjusted odds ratio 1.30 (95% CI 1.11 to 1.52); operative site bleeding 1.02 (0.95 to 1.10). Beyond five days of therapy, gastrointestinal bleeding 2.20 (1.36 to 3.57) against 1.17 (0.99 to 1.30) at five days or fewer. Age 75 or older: 1.66 (1.23 to 2.25)',
        unreportedAdverseSignals:
          'Observational, with courses matched by hospital, admitting service and start date rather than randomised. A dose-response relationship was evident for both bleeding endpoints (trend test P<0.001). This is the study behind the five-day boxed limit.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'SOS project pooled observational analysis (Drug Saf 2012;35:1127-1146)',
        phase:
          'Systematic review and meta-analysis of 28 cohort and case-control studies of upper gastrointestinal complications',
        sampleSize: 28,
        primaryEndpoint:
          'Adjusted relative risk of upper gastrointestinal complications for individual NSAIDs against non-use',
        endpointMet: false,
        statisticalPValue:
          'Ketorolac relative risk 11.50 (95% CI 5.56 to 23.78) — second highest of any NSAID examined, behind azapropazone at 18.45',
        unreportedAdverseSignals:
          'The confidence interval is very wide and confounding by indication is acute: ketorolac is given to postoperative and severely injured inpatients whose baseline bleeding risk differs sharply from a community NSAID user’s. The sample-size field records pooled studies, not participants.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Intravenous ketorolac at 10, 15 and 30 mg produced indistinguishable pain reduction at 30 minutes in 240 randomised patients',
        'Gastrointestinal bleeding odds ratio 1.30 (1.11 to 1.52) against parenteral opiates across 20,519 matched courses',
        'Beyond five days of therapy that odds ratio rose to 2.20 (1.36 to 3.57), against 1.17 (0.99 to 1.30) at five days or fewer',
        'Operative site bleeding odds ratio 1.02 (0.95 to 1.10) — no detectable increase against opioids',
        'A dose-response relationship between average daily dose and both bleeding endpoints, trend test P<0.001 for each',
        'Pooled observational upper gastrointestinal complication relative risk 11.50 (5.56 to 23.78), second highest of any NSAID examined',
      ],
      unsupportedInferences: [
        'That ketorolac is pharmacologically as strong as an opioid — the label describes it as opioid-sparing and as indicated for pain requiring analgesia at the opioid level, which is a statement about the setting rather than the molecule',
        'That a higher dose gives better relief, contradicted by both the boxed warning and a randomised three-dose comparison',
        'That because operative site bleeding was not increased, platelet inhibition is clinically unimportant — the label still contraindicates prophylactic use before major surgery and in incomplete haemostasis',
        'That the observational gastrointestinal figure of 11.50 transfers to a community outpatient setting, when the exposed population is postoperative and hospitalised',
      ],
      whatFailedInitially: [
        'Dose escalation: three doses spanning a threefold range produced the same analgesia',
        'Any use beyond five days: gastrointestinal bleeding risk against opioids more than doubles at that boundary',
        'Use in patients already taking aspirin or another NSAID, which is a contraindication rather than a caution',
        'Paediatric use and use for minor or chronic pain, both explicitly excluded in the boxed warning',
        'Intrathecal and epidural routes, contraindicated because of the formulation’s alcohol content',
      ],
      realWorldOutcome: [
        'Approved in the United States in 1989 under NDA 019645 and NDA 019698 and long generic, with intranasal and ophthalmic formulations approved separately',
        'About ninety-five United States cents per millilitre of injection at pharmacy acquisition cost across 72 listed generic products',
        'Widely used in emergency departments and postoperative care as an opioid-sparing analgesic, which is the role its label describes',
        'One of very few drugs whose boxed warning states an efficacy ceiling as well as a safety limit, and one of fewer still where both have been tested and held',
      ],
    },
    deliverySystem: {
      type: 'Intravenous and intramuscular injection, oral tablets licensed only as continuation of parenteral dosing, an intranasal spray, and ophthalmic solutions',
      description:
        'Given as the tromethamine salt for water solubility. The maximum daily injection dose is 120 mg against 40 mg for the oral tablets, and the injection ceiling falls to 60 mg total daily in patients 65 or older, under 50 kg, or with moderately elevated serum creatinine. Oral ketorolac is not a stand-alone product: the label states it is indicated only as continuation treatment following intravenous or intramuscular dosing, with a combined five-day maximum across both routes.',
      safetyProfile:
        'Boxed warning covering gastrointestinal, cardiovascular, renal, bleeding, hypersensitivity, route, obstetric and drug-interaction risks. Contraindicated in active or previous peptic ulcer disease or gastrointestinal bleeding; in advanced renal impairment or risk of renal failure from volume depletion; in suspected cerebrovascular bleeding, haemorrhagic diathesis, incomplete haemostasis or high bleeding risk; as a prophylactic analgesic before any major surgery; in the setting of coronary artery bypass graft surgery; in aspirin or NSAID hypersensitivity; for intrathecal or epidural administration because of alcohol content; in labour and delivery; and in patients currently receiving aspirin or any other NSAID. Not indicated in paediatric patients or for minor or chronic painful conditions. Total duration across all routes must not exceed five days.',
    },
    commonQuestions: [
      {
        q: 'Is ketorolac as strong as morphine?',
        a: 'It is used where morphine would otherwise be used, which is not the same claim. The label indicates it for moderately severe acute pain requiring analgesia at the opioid level, records an opioid-sparing effect when combined with morphine or meperidine, and advises supplementing the lower end of the ketorolac dose range with low-dose narcotics for breakthrough pain. At the enzyme it is an ordinary non-selective NSAID; what is unusual is the plasma concentration an injection reaches, which is why the maximum daily injectable dose is 120 mg against 40 mg orally. The practical difference from an opioid is real and worth stating: no sedation, no respiratory depression, no dependence — and, in exchange, bleeding, ulcer and kidney risk at full intensity.',
      },
      {
        q: 'Why only five days?',
        a: 'Because a study measured where the risk turns. A postmarketing surveillance cohort compared 10,272 courses of parenteral ketorolac with 10,247 matched courses of a parenteral opioid across 35 hospitals. For gastrointestinal bleeding the odds ratio against opioids was 1.17 (95% CI 0.99 to 1.30) when therapy lasted five days or fewer, and 2.20 (1.36 to 3.57) when it went beyond five days. Risk also rose with dose and with age — 1.66 in patients 75 or older. The authors concluded that limiting dose and duration, especially in the elderly, would improve the drug’s risk-benefit balance, and that is essentially what the boxed warning now says. It is one of the few labelling restrictions in this file with a specific published study behind it.',
      },
      {
        q: 'The 30 mg dose did not help much. Can I have more?',
        a: 'The label answers this before the question is asked: "Increasing the dose of ketorolac tromethamine beyond the label recommendations will not provide better efficacy but will increase the risk of developing serious adverse events." A randomised double-blind trial of 240 emergency department patients tested it directly — 10, 15 and 30 mg intravenously produced identical pain reduction at 30 minutes, with mean scores falling from around 7.7 to around 5.0 in every group and similar rescue analgesia rates. Meanwhile the surveillance data show bleeding risk rising with average daily dose. So a higher dose buys risk and nothing else, and the right response to inadequate relief is a different drug rather than more of this one.',
        auditNote:
          'This is a genuine ceiling effect, asserted by the regulator for nearly thirty years before anyone ran the trial that confirmed it.',
      },
      {
        q: 'Is it safe to give before an operation?',
        a: 'The label contraindicates it as a prophylactic analgesic before any major surgery, and contraindicates it in incomplete haemostasis and any high bleeding risk, because it inhibits platelet function. What the evidence says about after an operation is more reassuring than most people expect: in the 20,519-course surveillance study, operative site bleeding with ketorolac had an odds ratio of 1.02 against parenteral opioids, with a confidence interval of 0.95 to 1.10 — no detectable increase. Gastrointestinal bleeding, not surgical bleeding, was where ketorolac differed. That distinction is often lost, and it matters in both directions.',
      },
      {
        q: 'Can children have it?',
        a: 'The boxed warning states that ketorolac tromethamine is not indicated for use in paediatric patients. It is nevertheless used off-label in children in some settings, which is a decision for the clinician making it and not something this page can adjudicate. What the page can say is that the licensed indication is adults, the licensed duration is five days, the licensed indication excludes minor and chronic pain, and the contraindication list — bleeding risk, renal impairment, concurrent aspirin or NSAIDs, labour and delivery, intrathecal or epidural administration — is the longest of any drug on this site’s analgesic pages.',
      },
      {
        q: 'How does its stomach risk compare with ibuprofen?',
        a: 'Much worse, on the available data, though the comparison is not like for like. In the pooled analysis of 28 observational studies, ketorolac’s relative risk of serious upper gastrointestinal complications against non-use was 11.50 (95% CI 5.56 to 23.78), against ibuprofen at 1.84 and celecoxib at 1.45. Only azapropazone, at 18.45, was higher. Two things temper that: the confidence interval is very wide, and the people receiving ketorolac are hospitalised postoperative or severely injured patients whose baseline risk of a gastrointestinal bleed is not that of someone taking ibuprofen at home. Even allowing generously for both, this is the drug in this group whose gastrointestinal restrictions are best supported.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: false,
    sources: [
      {
        label:
          'Motov S, Yasavolian M, Likourezos A, et al. Comparison of Intravenous Ketorolac at Three Single-Dose Regimens for Treating Acute Pain in the Emergency Department: A Randomized Controlled Trial. Ann Emerg Med 2017;70:177-184',
        identifier: '10.1016/j.annemergmed.2016.10.014',
        kind: 'doi',
      },
      {
        label:
          'Strom BL, Berlin JA, Kinman JL, et al. Parenteral ketorolac and risk of gastrointestinal and operative site bleeding: a postmarketing surveillance study. JAMA 1996;275:376-382',
        identifier: '8569017',
        kind: 'pmid',
      },
      {
        label:
          'Castellsague J, Riera-Guardia N, Calingaert B, et al. Individual NSAIDs and upper gastrointestinal complications: a systematic review and meta-analysis of observational studies (the SOS project). Drug Saf 2012;35:1127-1146',
        identifier: '10.2165/11633470-000000000-00000',
        kind: 'doi',
      },
      {
        label:
          'Derry CJ, Derry S, Moore RA. Single dose oral ibuprofen plus paracetamol (acetaminophen) for acute postoperative pain. Cochrane Database Syst Rev 2013;(6):CD010210',
        identifier: '10.1002/14651858.CD010210.pub2',
        kind: 'doi',
      },
      {
        label:
          'TORADOL (ketorolac tromethamine) Drugs@FDA application record, NDA 019645 — approval history and labelling',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=019645',
        kind: 'regulatory',
      },
      {
        label:
          'Ketorolac tromethamine United States prescribing information — boxed warning and Indications and Usage, retrieved from the openFDA drug label endpoint (ANDA 074802)',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22KETOROLAC+TROMETHAMINE%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 3826 (ketorolac) — structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3826',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 10. Tramadol — sold for nineteen years as the opioid that was not really an opioid, scheduled
  //     in 2014, and found in randomised trials to give a 4% absolute improvement in pain.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'tramadol',
    name: 'Tramadol',
    tradeName: 'Ultram, Ultram ER, Conzip, Qdolo, Ryzolt',
    sponsor:
      'Developed by Grünenthal in Germany in the 1960s; United States NDA 020281 (ULTRAM) held by Janssen Pharmaceuticals. Generic and made by many manufacturers, in immediate-release, extended-release and oral solution forms',
    targetGene: 'OPRM1, SLC6A2 and SLC6A4',
    targetProtein:
      'Mu-opioid receptor, bound weakly by tramadol itself and far more strongly by its CYP2D6-derived metabolite M1; plus the noradrenaline and serotonin transporters, inhibited weakly',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1995,
    indication:
      'Management of pain severe enough to require an opioid analgesic and for which alternative treatments are inadequate; the extended-release forms for pain requiring around-the-clock, long-term opioid treatment',
    patientFriendlyIndication: 'Moderate to severe pain, as an opioid',
    anatomicalSite:
      'Mu-opioid receptors in the brain and spinal cord, reached mainly by the metabolite the liver makes; and the monoamine transporters of the descending pain-modulating pathways',
    conditionContext: {
      conditionExplainer:
        'Tramadol is an opioid with a second, weaker mechanism attached: it also blocks the reuptake of noradrenaline and serotonin, the same transporters some antidepressants act on. Both mechanisms contribute to the pain relief, and both contribute to the harms.',
      whyItMatters:
        'For nineteen years after its United States approval tramadol was not a controlled substance, and it was prescribed as the safe middle option between an anti-inflammatory and a real opioid. The DEA placed it in schedule IV in August 2014. In the randomised evidence its benefit in osteoarthritis is a 4% absolute improvement in pain; in a propensity-matched cohort of 88,902 osteoarthritis patients, one-year all-cause mortality was 71% higher than on naproxen — and no different from codeine.',
      whoTakesThis:
        'Adults with pain severe enough to require an opioid where alternatives are inadequate. Contraindicated in children under 12, and in anyone under 18 after tonsillectomy or adenoidectomy, because of deaths from respiratory depression in ultra-rapid metabolisers.',
      clinicalGoals:
        'Pain relief. Nothing about the underlying condition changes, and the randomised benefit in the commonest indication is small enough that its own Cochrane review describes it as no important benefit.',
    },
    oneSentenceVerdict:
      'An opioid prodrug whose activity depends on a liver enzyme that varies enormously between people — the M1 metabolite binds the mu receptor about 200 times more tightly than tramadol itself — sold unscheduled in the United States for nineteen years before being placed in schedule IV, producing a 4% absolute improvement in osteoarthritis pain in pooled randomised trials and a 71% higher one-year all-cause mortality than naproxen in 88,902 propensity-matched patients.',
    laymanHowItWorks:
      'Tramadol itself barely touches the opioid receptor. The liver converts part of each dose into a metabolite called M1 that binds it roughly two hundred times more tightly, and how much M1 you make depends on a liver enzyme whose activity varies from almost none to several times normal between people. On top of that, tramadol blocks the reuptake of noradrenaline and serotonin, which adds pain relief through the brain’s own descending damping system — and adds the risk of seizures and of serotonin syndrome. That dual mechanism is why the drug was described for years as something gentler than an opioid, and it is also why an overdose is only partially reversed by naloxone.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 55,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0245 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 44 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States in 1995 under NDA 020281 and generic since 2002. It remained outside the Controlled Substances Act until the DEA placed it in schedule IV effective 18 August 2014 — nineteen years during which it could be prescribed and refilled with none of the controls applying to other opioids. At under three United States cents a tablet it is cheaper than every NSAID in this file except aspirin and meloxicam.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Tramadol occupies a position — between an anti-inflammatory and a strong opioid — that the evidence does not support as a distinct category. In osteoarthritis its randomised benefit is smaller than an NSAID’s and its measured one-year mortality is higher; against codeine, an ordinary weak opioid, mortality is the same. The honest alternatives are therefore either an NSAID with its own well-characterised risks, a non-opioid drug with independent evidence in chronic pain, or an explicit decision that an opioid is warranted.',
      conventionalRx: [
        {
          name: 'Naproxen or celecoxib',
          class: 'Cyclooxygenase inhibitors',
          howItCompares:
            'In the propensity-matched cohort of 88,902 osteoarthritis patients aged 50 and over, one-year all-cause mortality was 23.5 per 1,000 person-years on tramadol against 13.8 on naproxen (hazard ratio 1.71, 95% CI 1.41 to 2.07) and 31.2 against 18.4 on celecoxib (hazard ratio 1.70, 1.33 to 2.17). The authors caution that confounding by indication may explain part of this. On efficacy, tramadol’s pooled randomised benefit in osteoarthritis pain was a 4% absolute improvement over placebo.',
          typicalCost:
            'US$0.0669 per naproxen tablet and US$0.0760 per celecoxib capsule at United States pharmacy acquisition cost (CMS NADAC, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: no dependence, no respiratory depression, no seizure or serotonin syndrome risk, larger measured effect on osteoarthritis pain. Cons: boxed cardiovascular and gastrointestinal warnings; unusable in significant renal impairment or active ulcer disease.',
        },
        {
          name: 'Codeine',
          class: 'Opioid prodrug, also CYP2D6-dependent',
          howItCompares:
            'Included here because it is the comparison that tells you what tramadol is. In the same 88,902-patient cohort, one-year all-cause mortality on tramadol against codeine was 32.2 against 34.6 per 1,000 person-years, hazard ratio 0.94 (95% CI 0.83 to 1.05) — no difference. Codeine is unambiguously an opioid, requires CYP2D6 conversion to morphine exactly as tramadol requires it to M1, and carries the same paediatric contraindications.',
          typicalCost: 'Inexpensive generic in the United States, usually in combination products',
          prosAndCons:
            'Pros: nothing that distinguishes it favourably. Cons: none that distinguishes it unfavourably either — which is the point. Whatever category tramadol was thought to occupy, its mortality signal is the same as an ordinary weak opioid’s.',
        },
        {
          name: 'A non-opioid with independent evidence in chronic pain',
          class: 'Serotonin-noradrenaline reuptake inhibitors, topical NSAIDs, exercise therapy',
          howItCompares:
            'Half of tramadol’s mechanism is monoamine reuptake inhibition, which is what an SNRI does without the opioid half. Where the pain is a superficial joint, topical diclofenac produced clinical success with a number needed to treat of 9.8 in pooled osteoarthritis trials at a fraction of the systemic exposure.',
          typicalCost:
            'US$0.0829 per gram of topical diclofenac sodium at United States pharmacy acquisition cost (CMS NADAC, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: no scheduled-substance controls, no dependence, no respiratory depression. Cons: SNRIs have their own adverse effects and discontinuation syndrome; topical treatment reaches only superficial joints.',
        },
      ],
      naturalFoods: [
        {
          name: 'Undenatured type II collagen, in knee osteoarthritis',
          activeCompound: 'Native type II collagen peptides',
          biologicalMechanism:
            'The proposed mechanism is oral tolerance rather than analgesia — presenting native joint collagen to gut-associated lymphoid tissue is hypothesised to damp the immune response to cartilage antigens. It is not established, and it has nothing in common with tramadol’s mechanism.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: the systematic review of 20 supplements across 69 randomised osteoarthritis trials identified undenatured type II collagen as one of only two supplements with a clinically important effect on pain at medium term, alongside green-lipped mussel extract. The same review found no supplement with a clinically important effect on pain at long term, and rated the evidence base as generally poor.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Never for a child, and never after a tonsillectomy in anyone under 18',
          action:
            'Check that no tramadol-containing product is given to a child, including for pain after throat surgery.',
          patientImpact:
            'The boxed warning states that life-threatening respiratory depression and death have occurred in children who received tramadol, some following tonsillectomy or adenoidectomy, and in at least one case the child had evidence of being an ultra-rapid metaboliser of tramadol due to a CYP2D6 polymorphism.',
          clinicalPrecaution:
            'Tramadol is contraindicated in children younger than 12, and in anyone younger than 18 following tonsillectomy or adenoidectomy. Use is to be avoided in adolescents 12 to 18 with other risk factors for sensitivity to respiratory depression.',
        },
        {
          name: 'List every antidepressant and every drug that lowers the seizure threshold',
          action:
            'Name any SSRI, SNRI, tricyclic, MAO inhibitor, antipsychotic, triptan or other opioid before tramadol is started.',
          patientImpact:
            'The label states that the increased risk of seizures is present within the recommended dosage range, and rises with higher doses and with concomitant SSRIs, SNRIs, anorectics, tricyclic antidepressants and other tricyclic compounds, other opioids, MAO inhibitors, neuroleptics and other drugs that reduce seizure threshold, and in patients with epilepsy or at risk of seizures.',
          clinicalPrecaution:
            'Serotonin syndrome, a potentially life-threatening condition, can result from concomitant serotonergic drug administration, and the label directs discontinuation if it is suspected. Both risks come from the same half of the drug’s mechanism.',
        },
        {
          name: 'Naloxone does not fully reverse a tramadol overdose',
          action:
            'Anyone responding to a tramadol overdose should know that the standard opioid antidote is only partly effective.',
          patientImpact:
            'The label states that tramadol-induced analgesia is only partially antagonised by the opioid antagonist naloxone in several animal tests, because part of the effect is monoaminergic rather than opioid. The seizure risk is also not naloxone-reversible.',
          clinicalPrecaution:
            'This does not mean naloxone should be withheld — respiratory depression from tramadol is opioid-mediated and does respond. It means the non-opioid component, including seizures, needs separate management.',
        },
        {
          name: 'Do not swallow an extended-release tablet broken, and never combine with a benzodiazepine casually',
          action:
            'Swallow extended-release tablets whole, and report any benzodiazepine, sleeping tablet or regular alcohol use.',
          patientImpact:
            'The boxed warning instructs patients to swallow extended-release tablets whole to avoid exposure to a potentially fatal dose, and states that accidental ingestion of even one dose, especially by a child, can result in a fatal overdose.',
          clinicalPrecaution:
            'Concomitant use of opioids with benzodiazepines or other central nervous system depressants including alcohol may result in profound sedation, respiratory depression, coma and death; the label directs reserving such combinations for patients with no adequate alternative.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CN(C)C[C@H]1CCCC[C@@]1(C2=CC(=CC=C2)OC)O',
      chemicalFormula: 'C16H25NO2',
      molecularWeight: '263.37 g/mol',
      targetReceptorAffinity:
        'A cyclohexanol with two stereocentres, marketed as the racemate of the (1R,2R) and (1S,2S) enantiomers, which have different mechanistic emphases — one favouring opioid and serotonergic activity, the other noradrenergic. The label states that opioid activity is due to both low-affinity binding of the parent compound and higher-affinity binding of the O-desmethyl metabolite M1, and that in animal models M1 is up to 6 times more potent than tramadol in producing analgesia and 200 times more potent in mu-opioid binding. M1 is formed by CYP2D6, whose activity spans poor to ultra-rapid metaboliser phenotypes, so the same tablet delivers substantially different opioid exposure to different people. The label also records that tramadol-induced analgesia is only partially antagonised by naloxone in several animal tests, and that tramadol inhibits reuptake of noradrenaline and serotonin in vitro.',
      structureSource: {
        label:
          'PubChem CID 33741 (tramadol) — canonical SMILES, molecular formula and weight, as carried on the enriched record; metabolite potency ratios and naloxone antagonism from the tramadol hydrochloride prescribing information section 12.1',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/33741',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'tra-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the racemic ratio and exclude the trans-diastereomer',
          description:
            'Tramadol has two stereocentres and the marketed product is a specific pair of enantiomers at equal proportion. The other diastereomeric pair is not the drug, and because the two enantiomers of the marketed racemate have different mechanistic emphases, a shifted ratio is a shifted pharmacology rather than a purity footnote.',
          reagentsAndBuffer:
            'Tramadol hydrochloride reference standard, chiral HPLC on a polysaccharide stationary phase, achiral reverse-phase HPLC for the diastereomer, ultraviolet detection at 271 nm, Karl Fischer titration',
        },
        {
          id: 'tra-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Mannich reaction onto cyclohexanone, then Grignard addition of the aryl group',
          description:
            'The route builds 2-[(dimethylamino)methyl]cyclohexanone by Mannich condensation, then adds 3-methoxyphenylmagnesium bromide to the ketone to install the aryl group and the tertiary alcohol in one step. That addition sets the second stereocentre and determines the diastereomeric ratio the purification must then correct.',
          dependsOnStepId: 'tra-w1',
          reagentsAndBuffer:
            'Cyclohexanone, formaldehyde and dimethylamine hydrochloride for the Mannich step, 3-bromoanisole and magnesium for the Grignard reagent, anhydrous diethyl ether or tetrahydrofuran under nitrogen, controlled low-temperature addition',
        },
        {
          id: 'tra-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Separate the diastereomers and form the hydrochloride',
          description:
            'The cis pair is the drug and the trans pair is not; they are separated by fractional crystallisation of the hydrochloride salt. This is where most of the process yield is lost and where the identity of the product is actually established.',
          dependsOnStepId: 'tra-w2',
          reagentsAndBuffer:
            'Hydrogen chloride in isopropanol or diethyl ether, fractional crystallisation from isopropanol, chiral and achiral HPLC release testing, X-ray powder diffraction for the salt form',
        },
        {
          id: 'tra-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Quantify M1 formation across CYP2D6 phenotypes, not in a pooled microsome preparation',
          description:
            'The clinically decisive property of tramadol is how much M1 a given person makes, and a pooled human liver microsome preparation averages that away. The experiment must use genotyped preparations spanning poor, intermediate, extensive and ultra-rapid metaboliser status, because those are the four different drugs the same tablet becomes.',
          dependsOnStepId: 'tra-w3',
          reagentsAndBuffer:
            'CYP2D6-genotyped human liver microsomes or recombinant CYP2D6 variants, NADPH regenerating system, LC-MS/MS quantification of tramadol and O-desmethyltramadol, quinidine as a CYP2D6 inhibitor control, parallel CYP3A4 incubations for the N-desmethyl route',
        },
        {
          id: 'tra-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Separate the opioid and monoaminergic components with a naloxone-blocked arm',
          description:
            'Tramadol is habitually described as having a dual mechanism, and the label records that its analgesia is only partially antagonised by naloxone. That partial antagonism is the measurement that separates the two components, and any characterisation that reports a single analgesic effect without a naloxone-blocked comparison cannot say which half produced it.',
          dependsOnStepId: 'tra-w4',
          reagentsAndBuffer:
            'Paired analgesic assays with and without naloxone pretreatment, monoamine transporter binding and uptake assays for SLC6A2 and SLC6A4 using resolved enantiomers, mu-opioid receptor binding for tramadol and M1 as separate test articles',
        },
      ],
    },
    keyAudits: [
      {
        id: 'tra-a1',
        category: 'conclusion_shift',
        title: 'It was an unscheduled opioid in the United States for nineteen years',
        laymanSummary:
          'Tramadol was approved in 1995 and was not a controlled substance. It could be prescribed and refilled without any of the rules that apply to other opioids. The DEA placed it into schedule IV effective 18 August 2014.',
        technicalDetails:
          'The final rule placing tramadol into schedule IV was published at 79 Federal Register 37623 on 2 July 2014, Docket DEA-351, effective 18 August 2014. It placed 2-[(dimethylamino)methyl]-1-(3-methoxyphenyl)cyclohexanol, including its salts, isomers and salts of isomers, into schedule IV of the Controlled Substances Act, imposing the regulatory controls and administrative, civil and criminal sanctions applicable to schedule IV substances on everyone who handles it. For nineteen years before that, tramadol’s regulatory status carried the implication that it was categorically different from other opioids — an implication its own label does not support. Section 12.1 describes it as an opioid agonist whose activity comes from mu-opioid receptor binding by the parent compound and, far more strongly, by the metabolite M1. The scheduling decision did not follow new pharmacology; it followed accumulated evidence of abuse and dependence in a drug that had been positioned as the safe intermediate step.',
        evidenceSource:
          'Schedules of Controlled Substances: Placement of Tramadol Into Schedule IV. Final rule, Drug Enforcement Administration. Federal Register 2014;79(127):37623-37630, Docket DEA-351, effective 18 August 2014',
        measuredMetric:
          'Regulatory status of tramadol under the Controlled Substances Act, before and after 18 August 2014',
        auditFlag: 'verified',
      },
      {
        id: 'tra-a2',
        category: 'failed',
        title: 'In osteoarthritis the randomised benefit is a 4% absolute improvement',
        laymanSummary:
          'Pooled across 22 randomised trials, tramadol improved osteoarthritis pain by 4% more than placebo. Fifteen people in a hundred improved meaningfully, against ten in a hundred on placebo. The review’s own phrase is "no important benefit".',
        technicalDetails:
          'The Cochrane review included 22 randomised trials, 21 in meta-analysis, covering 3,871 participants on tramadol alone or with another analgesic and 2,625 on placebo or active control. Doses ranged from 37.5 mg to 400 mg daily and were pooled; mean trial duration was two months; participants were predominantly women with hip or knee osteoarthritis, mean age 63, with moderate to severe pain. Moderate quality evidence — downgraded for risk of bias — showed tramadol alone gave a 4% absolute improvement in pain over placebo (95% CI 3% to 5%; 8 studies, 3,972 participants) and tramadol with acetaminophen 4% (2% to 6%; 2 studies, 614 participants). Expressed as responders, 15 of 100 on tramadol improved by 20% against 10 of 100 on placebo. Physical function showed the same 4% absolute improvement, with 21 of 100 improving by 20% against 16 of 100. Adverse events were more common: risk ratio 1.34 (1.24 to 1.46) for tramadol alone and 1.91 (1.32 to 2.76) for the combination. The review noted a high risk of selection bias, with only four of 22 trials reporting both adequate sequence generation and allocation concealment, a high risk of attrition bias in ten trials, and that most trials were funded by the pharmaceutical industry.',
        evidenceSource:
          'Toupin April K, Bisaillon J, Welch V, et al. Tramadol for osteoarthritis. Cochrane Database Syst Rev 2019;(5):CD005522',
        doi: '10.1002/14651858.CD005522.pub3',
        measuredMetric:
          'Absolute improvement in pain and physical function against placebo, responder proportions at a 20% improvement threshold, and adverse event risk ratio',
        auditFlag: 'caution',
      },
      {
        id: 'tra-a3',
        category: 'failed',
        title: 'One-year mortality was 71% higher than naproxen — and identical to codeine',
        laymanSummary:
          'A propensity-matched study of 88,902 osteoarthritis patients over 50 compared what happened in the year after a first prescription. Deaths were substantially more common on tramadol than on any of four anti-inflammatories, and no different from codeine.',
        technicalDetails:
          'The sequential propensity-score-matched cohort study used United Kingdom general practice records from the Health Improvement Network, covering individuals aged at least 50 with osteoarthritis diagnosed between January 2000 and December 2015, followed to December 2016. Initial prescriptions were tramadol (n=44,451), naproxen (12,397), diclofenac (6,512), celecoxib (5,674), etoricoxib (2,946) or codeine (16,922); after matching, 88,902 patients were analysed, mean age 70.1 years, 61.2% women. Over one year of follow-up, 278 deaths occurred in the tramadol cohort (23.5 per 1,000 person-years) against 164 in the naproxen cohort (13.8 per 1,000) — a rate difference of 9.7 deaths per 1,000 person-years (95% CI 6.3 to 13.2) and a hazard ratio of 1.71 (1.41 to 2.07). Against diclofenac the hazard ratio was 1.88 (1.51 to 2.35), against celecoxib 1.70 (1.33 to 2.17) and against etoricoxib 2.04 (1.37 to 3.03). Against codeine there was no significant difference: 32.2 against 34.6 per 1,000 person-years, hazard ratio 0.94 (0.83 to 1.05). The authors state plainly that these findings may be susceptible to confounding by indication and that further research is needed to determine whether the association is causal — tramadol may be prescribed preferentially to frailer patients in whom NSAIDs are avoided. The codeine comparison is the part that is hardest to explain away, because it holds the opioid indication roughly constant.',
        evidenceSource:
          'Zeng C, Dubreuil M, LaRochelle MR, et al. Association of Tramadol With All-Cause Mortality Among Patients With Osteoarthritis. JAMA 2019;321:969-982',
        doi: '10.1001/jama.2019.1347',
        measuredMetric:
          'All-cause mortality per 1,000 person-years within one year of initial prescription, tramadol against four NSAIDs and against codeine, in 88,902 propensity-matched patients',
        auditFlag: 'caution',
      },
      {
        id: 'tra-a4',
        category: 'measured',
        title:
          'The same tablet is a different opioid dose in different people, and children have died of it',
        laymanSummary:
          'Tramadol barely binds the opioid receptor. The liver turns some of it into a metabolite that binds about two hundred times more tightly, and how much you make depends on an enzyme that varies enormously between people. Children who convert unusually fast have died.',
        technicalDetails:
          'Section 12.1 states that opioid activity is due to both low-affinity binding of the parent compound and higher-affinity binding of the O-desmethyl metabolite M1 to mu-opioid receptors, and that in animal models M1 is up to 6 times more potent than tramadol in producing analgesia and 200 times more potent in mu-opioid binding, with the relative contribution of each depending on their plasma concentrations. M1 is formed by CYP2D6, which has poor, intermediate, extensive and ultra-rapid metaboliser phenotypes; an ultra-rapid metaboliser converts a standard dose into a much larger effective opioid dose. The boxed warning records the consequence: life-threatening respiratory depression and death have occurred in children who received tramadol, some following tonsillectomy or adenoidectomy, with at least one documented case of CYP2D6 ultra-rapid metabolism. Tramadol is now contraindicated in children younger than 12 and in anyone younger than 18 following tonsillectomy or adenoidectomy, and is to be avoided in adolescents 12 to 18 with other risk factors. The boxed warning also notes that the effects of CYP3A4 inducers, CYP3A4 inhibitors and CYP2D6 inhibitors on tramadol are complex and require careful consideration of the effects on both parent drug and metabolite.',
        evidenceSource:
          'Tramadol hydrochloride extended-release tablets United States prescribing information, boxed warning and section 12.1 (openFDA drug label endpoint, ANDA 201384)',
        measuredMetric:
          'Relative mu-opioid binding potency of M1 against tramadol, and the labelled paediatric contraindications arising from CYP2D6 ultra-rapid metabolism',
        auditFlag: 'caution',
      },
      {
        id: 'tra-a5',
        category: 'failed',
        title: 'The second mechanism causes seizures within the recommended dose range',
        laymanSummary:
          'Tramadol’s block of noradrenaline and serotonin reuptake was sold as the feature that made it gentler than a pure opioid. It is also the source of two risks no other opioid carries in the same way: seizures and serotonin syndrome. The label says the seizure risk is present at recommended doses.',
        technicalDetails:
          'Section 5.10 states that the increased risk of seizures is present within the recommended dosage range, and that risk rises with higher than recommended doses and with concomitant SSRIs, SNRIs, anorectics, tricyclic antidepressants and other tricyclic compounds, other opioids, MAO inhibitors, neuroleptics and other drugs that reduce seizure threshold, and in patients with epilepsy or at risk of seizures. Section 5.9 states that serotonin syndrome, a potentially life-threatening condition, could result from concomitant serotonergic drug administration, with discontinuation directed if it is suspected. Section 5.11 directs that tramadol not be used in suicidal or addiction-prone patients, and be used with caution in those taking tranquillisers or antidepressants or who abuse alcohol. The mechanistic point is that these are not incidental: section 12.1 states that tramadol inhibits reuptake of noradrenaline and serotonin in vitro and that these mechanisms may contribute independently to the overall analgesic profile. The half of the drug that was presented as the safety feature is the half that produces its two most distinctive harms — and the patients most likely to be co-prescribed an SSRI or a tricyclic are chronic pain patients, which is the population the drug is aimed at.',
        evidenceSource:
          'Tramadol hydrochloride extended-release tablets United States prescribing information, sections 5.9, 5.10, 5.11 and 12.1 (openFDA drug label endpoint, ANDA 201384)',
        measuredMetric:
          'Labelled seizure and serotonin syndrome risk, dose relationship and interacting drug classes',
        auditFlag: 'caution',
      },
      {
        id: 'tra-a6',
        category: 'inferred',
        title: '"Weak opioid" is a description of receptor affinity, not of what the drug does',
        laymanSummary:
          'Tramadol is called a weak opioid because tramadol itself binds the receptor weakly. That is true of the molecule you swallow and not of the metabolite your liver makes, and the label’s full boxed warning is the same one carried by any other opioid.',
        technicalDetails:
          'The boxed warning covers addiction, abuse and misuse leading to overdose and death; serious, life-threatening or fatal respiratory depression, especially on initiation or dose increase; fatal overdose from accidental ingestion of even one extended-release dose, especially by a child; profound sedation, respiratory depression, coma and death from concomitant benzodiazepines, other central nervous system depressants or alcohol; neonatal opioid withdrawal syndrome after prolonged use in pregnancy, which may be life-threatening if not recognised and treated; and an Opioid Analgesic Risk Evaluation and Mitigation Strategy education programme. None of that is qualified by the word weak. The affinity statement is real — the parent compound binds the mu receptor with low affinity — and it describes the prodrug rather than the active species. The label’s own arithmetic, that M1 binds about 200 times more tightly, is the correction. The clinical consequence of the misreading was nineteen unscheduled years, guideline positions recommending tramadol as a first-line option in knee osteoarthritis, and the mortality signal that followed.',
        evidenceSource:
          'Tramadol hydrochloride extended-release tablets United States prescribing information, boxed warning and section 12.1 (openFDA drug label endpoint, ANDA 201384); Zeng C et al., JAMA 2019;321:969-982, which opens by noting the guideline recommendations it set out to test',
        inferredClaim:
          'That tramadol is categorically safer than other opioids because the parent molecule binds the mu receptor weakly — an inference from the prodrug’s affinity that the metabolite, the boxed warning and the scheduling decision all contradict',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'What you swallow is not what acts',
        laymanDesc:
          'Tramadol itself binds the opioid receptor only weakly. The liver converts part of the dose into a metabolite called M1, which binds it about two hundred times more tightly.',
        molecularDetail:
          'The label states that opioid activity is due to both low-affinity binding of the parent compound and higher-affinity binding of the O-desmethyl metabolite M1, that M1 is up to 6 times more potent than tramadol in producing analgesia and 200 times more potent in mu-opioid binding in animal models, and that the relative contribution of each depends on plasma concentrations.',
        iconName: 'Shuffle',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'How much you make depends on an enzyme that varies enormously',
        laymanDesc:
          'CYP2D6 does the conversion, and people range from having almost none of it to several working copies. The same tablet therefore delivers very different opioid doses to different people.',
        molecularDetail:
          'M1 formation is CYP2D6-dependent, spanning poor, intermediate, extensive and ultra-rapid metaboliser phenotypes. The boxed warning records deaths in children who received tramadol, some after tonsillectomy or adenoidectomy, with at least one documented ultra-rapid metaboliser, and adds that the effects of CYP3A4 inducers, CYP3A4 inhibitors and CYP2D6 inhibitors are complex and require consideration of both parent and metabolite.',
        iconName: 'Filter',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'M1 acts on the opioid receptor like any other opioid',
        laymanDesc:
          'Once formed, the metabolite works the way opioids work — damping the pain signal in the brain and spinal cord, and damping the drive to breathe alongside it.',
        molecularDetail:
          'Mu-opioid receptor agonism in central pain pathways. The boxed warning covers addiction, abuse and misuse; life-threatening respiratory depression on initiation or dose increase; fatal overdose from accidental ingestion of a single extended-release dose; and neonatal opioid withdrawal syndrome after prolonged use in pregnancy.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'And the parent drug does something else entirely',
        laymanDesc:
          'Separately, tramadol blocks the reuptake of noradrenaline and serotonin, strengthening the brain’s own descending pain-damping pathways. That is a real second mechanism and it is not an opioid one.',
        molecularDetail:
          'The label states that tramadol inhibits reuptake of noradrenaline and serotonin in vitro, as have some other opioid analgesics, and that these mechanisms may contribute independently to the overall analgesic profile. It also states that tramadol-induced analgesia is only partially antagonised by naloxone in several animal tests — the direct evidence that part of the effect is non-opioid.',
        iconName: 'Waves',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Which is where the seizures and the serotonin syndrome come from',
        laymanDesc:
          'The second mechanism was presented as the reason tramadol is gentler. It is the reason tramadol causes seizures at ordinary doses and can trigger serotonin syndrome with common antidepressants.',
        molecularDetail:
          'Section 5.10: the increased risk of seizures is present within the recommended dosage range, rising with higher doses and with SSRIs, SNRIs, tricyclics, MAO inhibitors, neuroleptics, other opioids and other threshold-lowering drugs. Section 5.9: serotonin syndrome, potentially life-threatening, from concomitant serotonergic drugs, with discontinuation directed if suspected.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What was measured, and what was assumed for nineteen years',
        laymanDesc:
          'Measured: a 4% absolute improvement in osteoarthritis pain, and one-year mortality 71% higher than naproxen but identical to codeine. Assumed: that it was categorically safer than other opioids, until the DEA scheduled it in 2014.',
        molecularDetail:
          'Cochrane CD005522: 4% absolute pain improvement (95% CI 3% to 5%), 15 of 100 responders against 10 of 100 on placebo, adverse event risk ratio 1.34. JAMA 2019: hazard ratio for one-year all-cause mortality 1.71 against naproxen, 1.88 against diclofenac, 2.04 against etoricoxib, 0.94 against codeine. Federal Register 79 FR 37623: schedule IV effective 18 August 2014.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Cochrane CD005522 — pooled randomised trials of tramadol in osteoarthritis',
        phase: 'Systematic review and meta-analysis of 22 randomised controlled trials',
        sampleSize: 6496,
        primaryEndpoint:
          'Pain reduction and physical function against placebo or active control in hip or knee osteoarthritis',
        endpointMet: false,
        statisticalPValue:
          'Tramadol alone: 4% absolute improvement in pain (95% CI 3% to 5%; 8 studies, 3,972 participants) and 4% in physical function (2% to 6%). Responders improving by 20%: 15 of 100 on tramadol against 10 of 100 on placebo for pain, 21 against 16 for function. Adverse events risk ratio 1.34 (1.24 to 1.46)',
        unreportedAdverseSignals:
          'High risk of selection bias — only 4 of 22 trials reported both adequate sequence generation and allocation concealment. High risk of attrition bias in 10 of 22. Most trials were funded by the pharmaceutical industry. Doses from 37.5 mg to 400 mg daily were pooled and mean duration was two months.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Tramadol and all-cause mortality in osteoarthritis (JAMA 2019;321:969-982)',
        phase: 'Sequential propensity-score-matched cohort study, UK general practice, 2000-2016',
        sampleSize: 88902,
        primaryEndpoint:
          'All-cause mortality within one year of an initial prescription, tramadol against five other analgesics',
        endpointMet: false,
        statisticalPValue:
          'Tramadol 23.5 against naproxen 13.8 deaths per 1,000 person-years, hazard ratio 1.71 (95% CI 1.41 to 2.07); against diclofenac 1.88 (1.51 to 2.35); against celecoxib 1.70 (1.33 to 2.17); against etoricoxib 2.04 (1.37 to 3.03); against codeine 0.94 (0.83 to 1.05), not significant',
        unreportedAdverseSignals:
          'Observational. The authors state the findings may be susceptible to confounding by indication and that further research is needed to determine causality — tramadol is plausibly prescribed to frailer patients in whom NSAIDs are avoided. The null codeine comparison is the result least explicable by that bias.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '4% absolute improvement in osteoarthritis pain against placebo (95% CI 3% to 5%) across 8 randomised trials and 3,972 participants',
        '15 of 100 tramadol patients improved by 20% against 10 of 100 on placebo; adverse events risk ratio 1.34 (1.24 to 1.46)',
        'One-year all-cause mortality 23.5 against 13.8 per 1,000 person-years versus naproxen, hazard ratio 1.71 (1.41 to 2.07), in 88,902 propensity-matched patients',
        'No mortality difference against codeine: hazard ratio 0.94 (0.83 to 1.05)',
        'The M1 metabolite binds the mu-opioid receptor about 200 times more tightly than tramadol and is up to 6 times more potent analgesically in animal models',
        'Placed into schedule IV of the Controlled Substances Act effective 18 August 2014, nineteen years after approval',
      ],
      unsupportedInferences: [
        'That tramadol is categorically safer than other opioids because the parent compound binds the mu receptor weakly — the active species is the metabolite, which does not',
        'That it is an appropriate first-line option for knee osteoarthritis, a guideline position the mortality study was designed to examine',
        'That the dual mechanism reduces risk, when it is the source of the seizure and serotonin syndrome risks that no pure opioid carries in the same way',
        'That naloxone fully reverses a tramadol overdose, when the label records that its analgesia is only partially antagonised by naloxone',
      ],
      whatFailedInitially: [
        'Efficacy in osteoarthritis: the pooled randomised benefit is described by its own systematic review as no important benefit',
        'Unscheduled status, ended by the DEA in August 2014',
        'Paediatric use, now contraindicated under 12 and under 18 after tonsillectomy or adenoidectomy after deaths in ultra-rapid metabolisers',
        'The premise of a seizure-free opioid: the label states the increased seizure risk is present within the recommended dosage range',
        'Its position as a category between NSAIDs and opioids — its one-year mortality is indistinguishable from codeine’s',
      ],
      realWorldOutcome: [
        'Approved in the United States in 1995 under NDA 020281 and generic since 2002; under three United States cents a tablet at pharmacy acquisition cost',
        'Schedule IV since 18 August 2014 under Federal Register 79 FR 37623, Docket DEA-351',
        'Carries the full opioid boxed warning, including addiction, respiratory depression, accidental paediatric ingestion, benzodiazepine interaction, neonatal opioid withdrawal syndrome and a REMS education requirement',
        'Remains one of the most prescribed analgesics in the world, in the position that the evidence assembled here does not support as a distinct category',
      ],
    },
    deliverySystem: {
      type: 'Oral immediate-release tablets, extended-release tablets and capsules, an oral solution, and fixed combinations with acetaminophen',
      description:
        'Absorbed orally and converted by CYP2D6 to the active O-desmethyl metabolite M1, with a parallel CYP3A4 route to inactive N-desmethyl products. Because activity depends on that conversion, exposure to the active species varies substantially with CYP2D6 phenotype and with any CYP2D6 or CYP3A4 inhibitor or inducer — an interaction the boxed warning describes as complex and requiring consideration of both parent drug and metabolite. Extended-release tablets must be swallowed whole; chewing or crushing exposes the patient to a potentially fatal dose.',
      safetyProfile:
        'Full opioid boxed warning: addiction, abuse and misuse leading to overdose and death; life-threatening respiratory depression, especially on initiation or dose increase; fatal overdose from accidental ingestion of even one extended-release dose, especially by a child; profound sedation, respiratory depression, coma and death with benzodiazepines, other central nervous system depressants or alcohol; neonatal opioid withdrawal syndrome; a REMS education requirement; and paediatric contraindications arising from CYP2D6 ultra-rapid metabolism. Additional labelled risks include seizures within the recommended dose range, serotonin syndrome, opioid-induced hyperalgesia, adrenal insufficiency, severe hypotension and suicide risk. Contraindicated in children under 12 and in anyone under 18 after tonsillectomy or adenoidectomy.',
    },
    commonQuestions: [
      {
        q: 'Is tramadol an opioid or not?',
        a: 'It is an opioid, and the confusion is historically specific. Its label describes it as an opioid agonist, and although tramadol itself binds the mu receptor only weakly, the metabolite the liver makes from it — M1 — binds about 200 times more tightly and is up to six times more potent analgesically in animal models. For nineteen years after United States approval it was not a controlled substance, which gave the impression it was categorically different; the DEA placed it in schedule IV effective 18 August 2014. Its boxed warning is the standard opioid one: addiction, abuse and misuse, life-threatening respiratory depression, fatal overdose from a single accidental dose in a child, deadly interaction with benzodiazepines and alcohol, neonatal withdrawal syndrome, and a REMS education requirement.',
        auditNote:
          'The "weak opioid" description is a true statement about the molecule you swallow and a misleading one about the drug that acts. The prodrug is weak; the metabolite is not.',
      },
      {
        q: 'Does it actually work for arthritis?',
        a: 'A little, and less than most people expect. The Cochrane review pooled 22 randomised trials covering 3,871 people on tramadol and 2,625 controls, at doses from 37.5 to 400 mg daily over a mean of two months. Tramadol produced a 4% absolute improvement in pain over placebo (95% CI 3% to 5%) and 4% in physical function. Put as responders: 15 of every 100 people on tramadol improved by 20% — the threshold for a difference a person can feel — against 10 of every 100 on placebo. The review’s own summary phrase is "no important benefit". Adverse events were 34% more common than on placebo. Most of the trials were industry-funded and only four of 22 reported adequate randomisation and allocation concealment.',
      },
      {
        q: 'Is it true that tramadol increases your risk of dying?',
        a: 'One large study found that, and it comes with a caveat its own authors insist on. A propensity-matched cohort of 88,902 people aged 50 and over with osteoarthritis in United Kingdom general practice compared one-year mortality after a first prescription. Deaths per 1,000 person-years were 23.5 on tramadol against 13.8 on naproxen — a hazard ratio of 1.71 — with similar excesses against diclofenac (1.88), celecoxib (1.70) and etoricoxib (2.04). The authors state the findings may be susceptible to confounding by indication, meaning tramadol may be given to frailer people in whom NSAIDs are avoided. The comparison that is hardest to explain that way is codeine, where the hazard ratio was 0.94 with no significant difference — the same indication, the same kind of patient, the same result.',
        auditNote:
          'The codeine comparison is the informative one. Whatever category tramadol was believed to occupy between NSAIDs and opioids, on this endpoint it behaves like the opioid.',
      },
      {
        q: 'Why does it affect some people so much more than others?',
        a: 'Because the drug you take is not the drug that acts. Tramadol has to be converted by the liver enzyme CYP2D6 into M1, and CYP2D6 activity ranges from essentially absent to several times normal depending on which copies of the gene you have. A poor metaboliser makes little M1 and may get little opioid effect; an ultra-rapid metaboliser converts a standard dose into a much larger effective opioid dose. That is not theoretical: the boxed warning records life-threatening respiratory depression and death in children given tramadol, some after tonsillectomy or adenoidectomy, with at least one documented ultra-rapid metaboliser. Tramadol is now contraindicated in children under 12 and in anyone under 18 after those operations. Common drugs that inhibit CYP2D6, including several antidepressants, shift the same person from one category to another.',
      },
      {
        q: 'I was told tramadol is safer because it works two ways. Is that right?',
        a: 'The second mechanism is real and it is not a safety feature. Tramadol blocks the reuptake of noradrenaline and serotonin, which does contribute independently to pain relief — and it is the reason for two risks that pure opioids do not carry in the same way. The label states that the increased risk of seizures is present within the recommended dosage range, and rises with concomitant SSRIs, SNRIs, tricyclics, MAO inhibitors, neuroleptics and other opioids. It separately warns of serotonin syndrome, a potentially life-threatening condition, from combination with serotonergic drugs. The people most likely to be on an SSRI or a tricyclic are chronic pain patients, which is exactly who tramadol is prescribed to.',
      },
      {
        q: 'If someone overdoses, does naloxone work?',
        a: 'Partly, and that is worth knowing in advance. The label states that tramadol-induced analgesia is only partially antagonised by naloxone in several animal tests, because part of the effect is monoaminergic rather than opioid. Respiratory depression from tramadol is opioid-mediated and does respond to naloxone, so naloxone should absolutely be given. What naloxone will not address is the non-opioid component, including seizures, which need separate management. This is one of several places where treating tramadol as an ordinary weak opioid produces the wrong expectation.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Zeng C, Dubreuil M, LaRochelle MR, et al. Association of Tramadol With All-Cause Mortality Among Patients With Osteoarthritis. JAMA 2019;321:969-982',
        identifier: '10.1001/jama.2019.1347',
        kind: 'doi',
      },
      {
        label:
          'Toupin April K, Bisaillon J, Welch V, et al. Tramadol for osteoarthritis. Cochrane Database Syst Rev 2019;(5):CD005522',
        identifier: '10.1002/14651858.CD005522.pub3',
        kind: 'doi',
      },
      {
        label:
          'da Costa BR, Nüesch E, Kasteler R, et al. Oral or transdermal opioids for osteoarthritis of the knee or hip. Cochrane Database Syst Rev 2014;(9):CD003115 — the opioid class comparison against which tramadol’s effect size sits',
        identifier: '10.1002/14651858.CD003115.pub4',
        kind: 'doi',
      },
      {
        label:
          'Liu X, Machado GC, Eyles JP, Ravi V, Hunter DJ. Dietary supplements for treating osteoarthritis: a systematic review and meta-analysis. Br J Sports Med 2018;52:167-175',
        identifier: '10.1136/bjsports-2016-097333',
        kind: 'doi',
      },
      {
        label:
          'Derry S, Conaghan P, Da Silva JAP, Wiffen PJ, Moore RA. Topical NSAIDs for chronic musculoskeletal pain in adults. Cochrane Database Syst Rev 2016;(4):CD007400',
        identifier: '10.1002/14651858.CD007400.pub3',
        kind: 'doi',
      },
      {
        label:
          'Schedules of Controlled Substances: Placement of Tramadol Into Schedule IV. Drug Enforcement Administration final rule. Federal Register 2014;79(127):37623-37630, Docket DEA-351, effective 18 August 2014',
        identifier: 'https://www.govinfo.gov/content/pkg/FR-2014-07-02/html/2014-15548.htm',
        kind: 'regulatory',
      },
      {
        label:
          'ULTRAM (tramadol hydrochloride) Drugs@FDA application record, NDA 020281 — approval history and labelling',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020281',
        kind: 'regulatory',
      },
      {
        label:
          'Tramadol hydrochloride extended-release tablets United States prescribing information — boxed warning and sections 5.9, 5.10, 5.11 and 12.1, retrieved from the openFDA drug label endpoint (ANDA 201384)',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22TRAMADOL+HYDROCHLORIDE%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 33741 (tramadol) — structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/33741',
        kind: 'url',
      },
    ],
  },
]
