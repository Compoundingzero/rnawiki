import type { SeedDossier } from '@/lib/seed-types'

/**
 * Curated dossiers — haemostatics and anticoagulant reversal agents.
 *
 * These are the drugs given when someone is bleeding, or when the drug stopping them from clotting
 * has to be switched off in a hurry. As a group they share one problem, and this file is organised
 * around it: almost every one of them was licensed on a laboratory number rather than on a patient
 * outcome. Protamine reverses the activated clotting time. Vitamin K brings down the INR.
 * Idarucizumab normalises the dilute thrombin time. Andexanet drops anti-factor-Xa activity.
 * Prothrombin complex concentrate corrects the INR faster than plasma does. Fibrinogen concentrate
 * raises maximum clot firmness. Every one of those is a surrogate, and the two agents in this group
 * that were eventually tested against a hard endpoint — aprotinin in BART and recombinant factor
 * VIIa in FAST and CONTROL — did not survive the test.
 *
 * So the editorial job on these pages is a narrow one, repeated twelve times: say what the number
 * was, say what the number is not, and say whether anybody ever went and checked.
 *
 * Conventions for the group.
 *
 * 1. EVERY CITATION WAS RESOLVED AT THE TIME OF WRITING. DOIs against doi.org, PMIDs against the
 *    NCBI E-utilities efetch endpoint, NCT numbers against the ClinicalTrials.gov v2 API, and
 *    application numbers against the openFDA Drugs@FDA endpoint. Effect sizes, arm sizes, risk
 *    ratios, confidence intervals and p-values are copied out of the published abstract or the
 *    posted registry result, never from memory. Where a figure could not be sourced, the field is
 *    absent rather than estimated.
 *
 * 2. NO PER-DOSE SYNTHESIS COST IS CLAIMED ANYWHERE. `SeedPricing` requires a cost figure with a
 *    citable source, and the standard published cost-of-production analysis for essential medicines
 *    — Hill, Barber and Gotham, BMJ Global Health 2018 — does not cover any drug in this group.
 *    Where a pricing block appears, `synthesisCostPerDose` is an empty string and `costSource`
 *    points at that paper so a reader can see exactly which analysis was checked and came up empty.
 *    The figure in `retailPricePerDoseOrYear` is a United States pharmacy acquisition cost from the
 *    CMS National Average Drug Acquisition Cost survey, which is a price and emphatically not a
 *    cost of manufacture. A missing cost beats an invented one.
 *
 * 3. NO DOSING, TITRATION, REVERSAL PROTOCOL OR PROCUREMENT GUIDANCE. This is the group where that
 *    rule bites hardest, because reversal agents are dosed off nomograms and a reader in trouble
 *    would very much like to be told the nomogram. Nothing here tells anyone what to give. Weights
 *    and strengths appear only where they are part of a trial's identity and cannot be removed
 *    without making the trial unrecognisable.
 *
 * 4. SINGLE-ARM AND SURROGATE-ONLY EVIDENCE IS LABELLED AS SUCH IN THE VERDICT, not buried in the
 *    audit list. RE-VERSE AD and the original ANNEXA-4 cohort had no control group at all; saying
 *    so in the first sentence of the page is the whole point of the page.
 */

/** Pharmacy acquisition cost survey. Cited wherever a price appears in this file. */
const NADAC_SOURCE = {
  label:
    'CMS National Average Drug Acquisition Cost (NADAC) survey — what United States retail pharmacies report paying to acquire a product',
  identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
  kind: 'url' as const,
}

/**
 * The cost-of-production analysis that was checked and does not cover these drugs. It is cited as
 * `costSource` wherever `synthesisCostPerDose` is empty, so the empty field has a provenance.
 */
const NO_COST_STUDY_SOURCE = {
  label:
    'Hill AM, Barber MJ, Gotham D. Estimated costs of production and potential prices for the WHO Essential Medicines List. BMJ Glob Health 2018;3:e000571 — the standard published cost-of-production analysis, checked for this drug and silent on it, which is why no synthesis cost is stated',
  identifier: '10.1136/bmjgh-2017-000571',
  kind: 'doi' as const,
}

/**
 * Hospital-administered products in this group are billed to Medicare Part B and never appear in
 * the retail NADAC survey, because no community pharmacy buys them. Where that is the case the
 * price cited is CMS's own average Medicare spending per dosage unit, which is a payment and not a
 * cost of manufacture.
 */
const CMS_PART_B_SOURCE = {
  label:
    'CMS Medicare Part B Spending by Drug — average Medicare spending per dosage unit by HCPCS code, 2024 reporting year, alongside the published average sales price',
  identifier:
    'https://data.cms.gov/summary-statistics-on-use-and-payments/medicare-medicaid-spending-by-drug/medicare-part-b-spending-by-drug',
  kind: 'url' as const,
}

/** The equivalent dataset for drugs dispensed through a pharmacy benefit rather than a clinic. */
const CMS_PART_D_SOURCE = {
  label:
    'CMS Medicare Part D Spending by Drug — average spending per dosage unit weighted by claim, 2023 reporting year',
  identifier:
    'https://data.cms.gov/summary-statistics-on-use-and-payments/medicare-medicaid-spending-by-drug/medicare-part-d-spending-by-drug',
  kind: 'url' as const,
}

/**
 * The dataset that covers plasma-derived and recombinant products dispensed to Medicaid
 * beneficiaries. Its per-claim figure is used where a per-dosage-unit figure would be ambiguous,
 * because the "dosage unit" of a lyophilised vial is not the same thing across products.
 */
const CMS_MEDICAID_SOURCE = {
  label:
    'CMS Medicaid Spending by Drug — total spending, claim count and average spending per claim by product, 2023 reporting year',
  identifier:
    'https://data.cms.gov/summary-statistics-on-use-and-payments/medicaid-drug-spending/medicaid-spending-by-drug',
  kind: 'url' as const,
}

export const ENRICHED_BATCH_4_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // 1. Aminocaproic acid — the older lysine analogue, and the one nobody ever powered for death.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'aminocaproic-acid',
    name: 'Aminocaproic Acid',
    tradeName: 'Amicar',
    sponsor:
      'Epic Pharma LLC (current US labeller); originated by Lederle Laboratories under NDA 015197',
    targetGene: 'PLG',
    targetProtein:
      'Plasminogen and plasmin — specifically the lysine-binding sites in their kringle domains',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1964,
    indication:
      'Enhancement of haemostasis when fibrinolysis contributes to bleeding, including fibrinolytic bleeding after cardiac surgery and portacaval shunt, in aplastic anaemia, abruptio placentae, hepatic cirrhosis and certain neoplastic disease',
    patientFriendlyIndication:
      'Bleeding that will not stop because the body is dissolving its own clots too fast',
    anatomicalSite: 'Blood plasma and the surface of the forming fibrin clot',
    conditionContext: {
      conditionExplainer:
        'A clot is not a permanent structure. As soon as one forms, the body starts taking it apart again with an enzyme called plasmin, so that blood vessels do not silently seal shut. In some situations — after cardiac bypass, in advanced liver disease, after a placental abruption, in some cancers — that dismantling machinery runs far ahead of the clotting machinery, and clots come apart faster than they can be built.',
      whyItMatters:
        'When clot breakdown is what is driving the bleeding, giving more clotting factors is pouring water into a bucket with a hole in it. Blocking the breakdown addresses the actual mechanism. The separate question, which this page keeps separate, is whether blocking it makes the patient better rather than merely making the bleeding stop.',
      whoTakesThis:
        'Given in hospital, usually intravenously, by surgeons, haematologists and intensivists. In the United States it is also used off-label in orthopaedic and cardiac surgery, and topically or systemically for bleeding into the front chamber of the eye after blunt trauma.',
      clinicalGoals:
        'Reduce measured blood loss and the number of units of red cells transfused. No trial of this drug has ever been powered for survival.',
    },
    oneSentenceVerdict:
      'A lysine look-alike that plugs the docking site plasmin uses to attach to a clot, licensed in 1964 on the strength of reduced bleeding: it demonstrably lowers transfusion requirement and cuts rebleeding into the eye by roughly two-thirds, and in sixty-two years on the market no trial has ever been powered to find out whether it saves a life.',
    laymanHowItWorks:
      'Your body dissolves its own clots using an enzyme called plasmin, which has to grab hold of the clot before it can cut it up. It grabs on at spots shaped to fit an amino acid called lysine. Aminocaproic acid is very nearly the same shape as lysine, so it sits in those spots and occupies them. Plasmin can still exist, but it can no longer get a grip on the clot, so the clot lasts.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 61,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$2.68 per unit at United States pharmacy acquisition cost, median across 21 listed generic products in the CMS NADAC survey effective 19 August 2026',
      markupEstimate:
        'Not calculable. No published per-dose cost of production exists for this molecule, so there is no denominator to divide the acquisition cost by.',
      openPatentNotes:
        'Patent protection expired decades ago. The molecule is 6-aminohexanoic acid, made industrially by hydrolysing caprolactam, the same commodity feedstock that nylon-6 is polymerised from, and it is supplied by more than twenty generic labellers in the United States alone.',
      synthesisComplexity: 'Low',
      costSource: NO_COST_STUDY_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The direct comparator is tranexamic acid, the same trick executed by a more rigid molecule that binds the same site with far higher affinity. Tranexamic acid has two randomised trials of more than twenty thousand patients each with mortality endpoints; aminocaproic acid has nothing of the sort. Head-to-head trials in cardiac and orthopaedic surgery have repeatedly found the two indistinguishable on blood loss, which is the endpoint they were sized for.',
      conventionalRx: [
        {
          name: 'Tranexamic acid (Cyklokapron, Lysteda)',
          class: 'Lysine analogue antifibrinolytic',
          howItCompares:
            'Identical mechanism, higher affinity for the same lysine-binding sites. It has the outcome evidence this drug lacks: a 9% relative reduction in all-cause death in 20,211 randomised trauma patients in CRASH-2, and a 19% relative reduction in death due to bleeding in 20,060 women with post-partum haemorrhage in WOMAN. Head-to-head against aminocaproic acid in a 64-patient thoracic aortic trial, blood loss and transfusion were comparable.',
          typicalCost:
            'US$0.3868 per mL at United States pharmacy acquisition cost, median across 27 listed generic products (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: two very large randomised mortality trials, one positive in trauma and one positive for death due to bleeding in obstetrics. Cons: a dose-dependent seizure signal, 0.7% versus 0.1% against placebo in 4,631 coronary surgery patients in ATACAS.',
        },
        {
          name: 'Aprotinin (Trasylol)',
          class: 'Bovine serine protease inhibitor',
          howItCompares:
            'A broader and stronger antifibrinolytic that inhibits plasmin directly rather than blocking its docking. It was the standard of care in cardiac surgery until the BART trial found more deaths on aprotinin than on the lysine analogues and was stopped early. It has never returned to the United States market.',
          typicalCost:
            'Not marketed in the United States. Reinstated in the European Union in 2012 and in Canada in 2011 under restricted conditions.',
          prosAndCons:
            'Pros: the most effective agent in the class on blood loss. Cons: a 53% relative increase in 30-day all-cause death against the lysine analogues in a 2,331-patient randomised trial, which is why it is not on the shelf.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C(CCC(=O)O)CCN',
      chemicalFormula: 'C6H13NO2',
      molecularWeight: '131.17 g/mol',
      targetReceptorAffinity:
        'No receptor. It is a competitive occupant of the lysine-binding sites in the kringle domains of plasminogen and plasmin, and it is a weaker occupant than tranexamic acid, which is why the two drugs are given at very different amounts to achieve the same effect.',
      structureSource: {
        label:
          'PubChem CID 564 (6-aminohexanoic acid) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/564',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'eaca-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Incoming control of the caprolactam feedstock',
          description:
            'Confirm identity, water content and oligomer burden of the epsilon-caprolactam before hydrolysis. Caprolactam is a bulk nylon intermediate rather than a pharmaceutical starting material, so the incoming specification, not the reaction, is what separates drug-grade material from polymer-grade.',
          reagentsAndBuffer:
            'Epsilon-caprolactam reference standard, Karl Fischer titration, gas chromatography with flame ionisation detection, cyclic oligomer reference impurities',
        },
        {
          id: 'eaca-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Ring-opening hydrolysis of caprolactam to 6-aminohexanoic acid',
          description:
            'Hydrolyse the seven-membered lactam ring under aqueous acid or base with heat. The amide bond opens to give a free amine at one end and a carboxylic acid at the other, which is the whole molecule. One bond is broken and nothing is built, which is why this drug has never been expensive.',
          dependsOnStepId: 'eaca-w1',
          reagentsAndBuffer:
            'Epsilon-caprolactam in aqueous hydrochloric acid or sodium hydroxide, heated under reflux; nitrogen blanket',
        },
        {
          id: 'eaca-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Ion-exchange capture and recrystallisation of the zwitterion',
          description:
            'The product is a zwitterion at neutral pH, so it is captured on a cation-exchange resin, eluted with ammonia and recrystallised from aqueous alcohol. Unreacted caprolactam and the linear oligomers formed during the melt are the two things the monograph is written to exclude.',
          dependsOnStepId: 'eaca-w2',
          reagentsAndBuffer:
            'Strong-acid cation-exchange resin, aqueous ammonia eluent, ethanol and purified water for recrystallisation, reversed-phase HPLC with refractive-index or derivatised UV detection',
        },
        {
          id: 'eaca-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Distribution into red cells and the extravascular space',
          description:
            'Confirm the compound partitions into erythrocytes and tissue cells rather than staying confined to plasma. The FDA label reports an apparent volume of distribution around 23 L after an oral dose, which is larger than plasma volume and is the observation this step is checking.',
          dependsOnStepId: 'eaca-w3',
          reagentsAndBuffer:
            'Fresh human whole blood, isotonic phosphate-buffered saline, haematocrit determination, LC-MS/MS quantification of drug in packed cells versus plasma supernatant',
        },
        {
          id: 'eaca-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Euglobulin clot lysis and plasminogen-binding readout',
          description:
            'Measure the time a euglobulin clot takes to dissolve in the presence and absence of the compound, and in parallel measure displacement from immobilised lysine-Sepharose. Reporting both matters: the lysis time is the effect and the displacement is the proposed explanation, and only one of them is what the licensed indication is about.',
          dependsOnStepId: 'eaca-w4',
          reagentsAndBuffer:
            'Pooled citrated normal human plasma, euglobulin fraction precipitated at low ionic strength, bovine thrombin, lysine-Sepharose 4B affinity matrix, purified Glu-plasminogen, chromogenic plasmin substrate S-2251',
        },
      ],
    },
    keyAudits: [
      {
        id: 'eaca-a1',
        category: 'measured',
        title: 'It reduces the chance of needing a red cell transfusion by about a fifth',
        laymanSummary:
          'Pooling every randomised surgical trial Cochrane could find, patients given aminocaproic acid were about 19% less likely to need a blood transfusion than untreated controls. That is the effect the drug actually owns.',
        technicalDetails:
          'Henry et al. summarised 252 randomised controlled trials recruiting more than 25,000 participants scheduled for non-urgent surgery. Against control, epsilon-aminocaproic acid reduced the probability of requiring red blood cell transfusion with a relative risk of 0.81 (95% CI 0.67 to 0.99). Re-operation for bleeding showed the same direction (RR 0.32, 95% CI 0.11 to 0.99), though on far fewer events. The reviewers note the transfusion data were heterogeneous and that funnel plots indicated the lysine-analogue trials may be subject to publication bias, and that data on uncommon harms were sparse across the small trials contributing to the pool.',
        evidenceSource:
          'Henry DA et al., Anti-fibrinolytic use for minimising perioperative allogeneic blood transfusion. Cochrane Database Syst Rev 2011;(3):CD001886',
        doi: '10.1002/14651858.CD001886.pub4',
        measuredMetric:
          'Relative risk of requiring an allogeneic red blood cell transfusion, pooled across randomised surgical trials',
        auditFlag: 'verified',
      },
      {
        id: 'eaca-a2',
        category: 'inferred',
        title:
          'It stops the eye rebleeding and does not change what the patient can see three years later',
        laymanSummary:
          'For bleeding into the front of the eye after a blow, aminocaproic acid cuts the chance of a second bleed by roughly two-thirds. Pooled across the trials that measured it, the vision people ended up with was no different at all.',
        technicalDetails:
          'The 2023 Cochrane review of medical interventions for traumatic hyphema included 23 randomised and seven quasi-randomised studies totalling 2,969 participants. Systemic aminocaproic acid reduced the rate of recurrent haemorrhage with a relative risk of 0.28 (95% CI 0.13 to 0.60) across six trials and 330 participants; a sensitivity analysis omitting two studies that did not use intention-to-treat weakened this to RR 0.43 (95% CI 0.17 to 1.08). Topical aminocaproic acid gave RR 0.48 (95% CI 0.20 to 1.10). On the endpoint that matters, a meta-analysis of two trials found no effect on long-term visual acuity (RR 1.03, 95% CI 0.82 to 1.29) or on final visual acuity measured up to three years after the injury (RR 1.05, 95% CI 0.93 to 1.18). The reviewers graded the certainty of the evidence as low to very low and state that no intervention studied showed an effect on visual acuity, whether short-term or longer.',
        evidenceSource:
          'Woreta FA, Lindsley KB, Gharaibeh A, Ng SM, Scherer RW, Goldberg MF. Medical interventions for traumatic hyphema. Cochrane Database Syst Rev 2023;3(3):CD005431',
        doi: '10.1002/14651858.CD005431.pub5',
        measuredMetric:
          'Rate of recurrent anterior chamber haemorrhage, and visual acuity at up to three years',
        inferredClaim:
          'That preventing the rebleed preserves sight — the mechanistic step everyone assumes and the pooled trials do not show',
        auditFlag: 'caution',
      },
      {
        id: 'eaca-a3',
        category: 'inferred',
        title: 'Sixty-two years on the market and no trial has ever been powered for death',
        laymanSummary:
          'Aminocaproic acid was approved in 1964. Its sibling drug tranexamic acid has been tested in two trials of more than twenty thousand patients each with survival as the endpoint. Aminocaproic acid has never had one.',
        technicalDetails:
          'The FDA approved Amicar under NDA 015197 on 3 June 1964 as a Type 1 new molecular entity under priority review, on the basis of reduced fibrinolytic bleeding. The registered randomised evidence since has been surgical and small: the largest completed randomised comparison on ClinicalTrials.gov with posted results is a 246-participant Duke trial in hip and knee arthroplasty (NCT02030821) whose three registered primary outcomes are total blood loss, number of transfusions and the fall in haemoglobin. By contrast the same drug class in the form of tranexamic acid has CRASH-2 (20,211 randomised trauma patients, all-cause mortality) and WOMAN (20,060 randomised women, death due to bleeding). The absence is not evidence of no effect; it is an absence, and it is the central fact about this drug.',
        evidenceSource:
          'openFDA Drugs@FDA record for NDA 015197 (AMICAR), original approval 3 June 1964; ClinicalTrials.gov NCT02030821',
        inferredClaim:
          'That reducing measured blood loss with this specific agent translates into fewer deaths — an extrapolation from a sibling molecule that has been tested, to one that has not',
        auditFlag: 'caution',
      },
      {
        id: 'eaca-a4',
        category: 'conclusion_shift',
        title: 'It inherited cardiac surgery when aprotinin was withdrawn, not by winning a trial',
        laymanSummary:
          'Until 2007 the standard antifibrinolytic in heart surgery was aprotinin. It was pulled after a trial found more deaths. The lysine analogues took over the space by default, and the evidence that they are safer comes mostly from observational data, not from randomised comparisons.',
        technicalDetails:
          'Hutton et al. ran a network meta-analysis of 106 randomised controlled trials and 11 propensity-matched or adjusted observational studies, 43,270 patients in total, explicitly to estimate comparative harm after aprotinin was suspended in 2008 and then reintroduced in Europe and Canada. In the randomised data alone the comparisons were largely inconclusive, with tranexamic acid showing a lower risk of death than aprotinin (OR 0.64, 95% credible interval 0.41 to 0.99). Once observational data were incorporated, aprotinin carried an increased mortality risk relative to tranexamic acid (OR 0.71, 95% CrI 0.50 to 0.98) and to epsilon-aminocaproic acid (OR 0.60, 95% CrI 0.43 to 0.87), and an increased risk of renal failure or dysfunction against every comparator including no treatment. The authors\' own summary is that the randomised meta-analyses were "largely inconclusive" and that the concern rests on the observational layer.',
        evidenceSource:
          'Hutton B, Joseph L, Fergusson D, Mazer CD, Shapiro S, Tinmouth A. Risks of harms using antifibrinolytics in cardiac surgery: systematic review and network meta-analysis. BMJ 2012;345:e5798',
        doi: '10.1136/bmj.e5798',
        inferredClaim:
          'That aminocaproic acid is the safe choice in cardiac surgery — a position established by a competitor being removed and supported mainly by non-randomised comparisons',
        auditFlag: 'contested',
      },
      {
        id: 'eaca-a5',
        category: 'failed',
        title: 'A randomised head-to-head found more kidney injury on aminocaproic acid',
        laymanSummary:
          'In a small randomised trial in aortic surgery, the two drugs stopped bleeding equally well. Significant kidney injury was more than twice as common in the aminocaproic acid group, and every case of kidney failure was in that group.',
        technicalDetails:
          'Makhija et al. randomised 64 consecutive adults undergoing thoracic aortic surgery on cardiopulmonary bypass to epsilon-aminocaproic acid or tranexamic acid. Cumulative mean blood loss, packed red cell use and total blood product requirement to 24 hours were comparable between groups. Significant renal injury occurred in 40% of the aminocaproic acid group against 16% of the tranexamic acid group (p=0.04), and renal failure in 10% against 0% (p=0.11, relative risk 2.15). Seizure ran the other way, 3.3% on aminocaproic acid against 10% on tranexamic acid, not statistically significant. D-dimer rose significantly from pre- to post-operative values in the aminocaproic acid group (p<0.01). This is 64 patients at a single centre, and the authors close by calling for adequately sized placebo-controlled trials, which have not been done.',
        evidenceSource:
          'Makhija N, Sarupria A, Kumar Choudhary S, Das S, Lakshmy R, Kiran U. Comparison of epsilon aminocaproic acid and tranexamic acid in thoracic aortic surgery. J Cardiothorac Vasc Anesth 2013;27(6):1201-1207',
        doi: '10.1053/j.jvca.2013.04.003',
        measuredMetric:
          'Incidence of significant post-operative renal injury and renal failure, and cumulative blood loss at 24 hours',
        auditFlag: 'caution',
      },
      {
        id: 'eaca-a6',
        category: 'measured',
        title:
          'In 1,544 real cardiac surgery patients it was indistinguishable from tranexamic acid',
        laymanSummary:
          'When a drug shortage forced one hospital to switch between the two agents, the records of more than fifteen hundred heart surgery patients showed no difference in how much they bled.',
        technicalDetails:
          'Dannemiller et al. conducted a single-centre retrospective chart review at a 793-bed academic hospital comparing fixed-dose tranexamic acid with epsilon-aminocaproic acid in cardiac surgery, 1,544 patients in total, a natural experiment created by a drug shortage. Chest tube output at 12 hours, 24 hours and 7 days was similar between groups. The tranexamic acid group required more intraoperative blood product transfusions (22.7% versus 18.2%, p=0.03), with no difference in the median quantity of total blood products at 24 hours or 7 days. Reported safety events were similar. This is a retrospective cohort, not a randomised comparison, and the transfusion difference is the kind of finding that appears and disappears between such cohorts.',
        evidenceSource:
          'Dannemiller RE et al. Comparison of trauma-dosed tranexamic acid versus aminocaproic acid in cardiac surgery in the setting of drug shortage. J Card Surg 2022;37(10):3243-3249',
        doi: '10.1111/jocs.16782',
        measuredMetric:
          'Chest tube output at 12 hours, 24 hours and 7 days, and incidence of blood product transfusion',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'It goes in by drip or by mouth, and it is absorbed completely',
        laymanDesc:
          'Given intravenously it is in the bloodstream immediately. Swallowed, all of it is absorbed, and blood levels peak a little over an hour later.',
        molecularDetail:
          'The FDA label reports oral absorption as a zero-order process at 5.2 g/hr with a mean lag of 10 minutes and complete bioavailability (F=1). Peak plasma concentration after a single oral dose was 164 ± 28 mcg/mL at 1.2 ± 0.45 hours. Apparent volume of distribution was 23.1 ± 6.6 L.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It spreads out of the blood and into cells',
        laymanDesc:
          'It does not stay in the bloodstream. The volume it occupies in the body is several times the volume of blood, because it moves into red cells and into tissue.',
        molecularDetail:
          'An apparent volume of distribution near 23 L against a plasma volume of roughly 3 L indicates extensive extravascular distribution, including into erythrocytes. The molecule is a small zwitterionic amino acid analogue, and it is eliminated largely unchanged by the kidney, which is why renal impairment raises exposure.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It occupies the handhold that plasmin uses to grab a clot',
        laymanDesc:
          'Plasmin, the enzyme that dissolves clots, has to hold on to the clot before it can cut. It holds on at pockets shaped for the amino acid lysine. This drug is shaped almost exactly like lysine and sits in those pockets.',
        molecularDetail:
          'Aminocaproic acid is 6-aminohexanoic acid: a six-carbon chain with a free amine at one end and a carboxylate at the other, the same distance apart as in the side chain and backbone of a lysine residue. It occupies the lysine-binding sites in the kringle domains of plasminogen and plasmin. Its affinity for those sites is substantially lower than that of the conformationally constrained cyclohexane analogue tranexamic acid.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Plasminogen can no longer dock on the fibrin surface',
        laymanDesc:
          'Blocking the handhold means the enzyme and its inactive precursor float free in the blood instead of assembling on the clot. The cutting still could happen; it just has nothing to hold on to.',
        molecularDetail:
          'Fibrinolysis is a surface-assembly reaction: plasminogen and tissue plasminogen activator both bind lysine residues exposed on partially degraded fibrin, and that colocalisation is what accelerates plasmin generation by orders of magnitude. Occupying the lysine-binding sites prevents the assembly rather than inhibiting the catalytic site, which is why the label describes the effect as principally inhibition of plasminogen activators with a lesser antiplasmin component.',
        iconName: 'ShieldOff',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The clot survives, and less blood is lost',
        laymanDesc:
          'Clots that would have been taken apart stay in place. Measured blood loss falls and fewer units of blood are transfused. Whether the patient does better is a different measurement, and it has largely not been made.',
        molecularDetail:
          'Pooled across randomised surgical trials the relative risk of requiring an allogeneic red cell transfusion is 0.81 (95% CI 0.67 to 0.99). In traumatic hyphema, recurrent haemorrhage falls (RR 0.28, 95% CI 0.13 to 0.60) while pooled visual acuity at up to three years does not move (RR 1.05, 95% CI 0.93 to 1.18). The gap between those two sentences is the whole audit.',
        iconName: 'Droplet',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'Cochrane pooled analysis of six randomised trials of systemic aminocaproic acid in traumatic hyphema (CD005431.pub5)',
        phase: 'Systematic review and meta-analysis of randomised and quasi-randomised trials',
        sampleSize: 330,
        primaryEndpoint: 'Rate of recurrent anterior chamber haemorrhage',
        endpointMet: true,
        statisticalPValue:
          'RR 0.28, 95% CI 0.13 to 0.60; sensitivity analysis excluding two non-intention-to-treat studies gives RR 0.43, 95% CI 0.17 to 1.08',
        unreportedAdverseSignals:
          'Certainty of evidence graded low. The result is fragile to the exclusion of two studies that did not analyse by intention to treat.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId:
          'Cochrane pooled analysis of visual acuity after aminocaproic acid for traumatic hyphema (CD005431.pub5)',
        phase: 'Meta-analysis of two randomised trials within the same review',
        sampleSize: 2969,
        primaryEndpoint: 'Long-term and final visual acuity up to three years after the injury',
        endpointMet: false,
        statisticalPValue:
          'Long-term visual acuity RR 1.03, 95% CI 0.82 to 1.29; final visual acuity RR 1.05, 95% CI 0.93 to 1.18',
        unreportedAdverseSignals:
          'The 2,969 figure is the whole review population across all interventions; the visual acuity meta-analysis for aminocaproic acid rests on two trials within it. The reviewers found no evidence of an effect on visual acuity for any intervention studied.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Makhija thoracic aortic surgery head-to-head against tranexamic acid',
        phase: 'Prospective randomised trial, single tertiary centre',
        sampleSize: 64,
        primaryEndpoint:
          'Cumulative blood loss and blood product requirement to 24 hours, with renal and neurological safety',
        endpointMet: true,
        statisticalPValue:
          'Blood loss and transfusion comparable; significant renal injury 40% versus 16%, p = 0.04',
        unreportedAdverseSignals:
          'Renal failure occurred in 10% of the aminocaproic acid arm and 0% of the tranexamic acid arm (p=0.11, RR 2.15). At 64 patients the trial cannot exclude or establish this.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'NCT02030821 — tranexamic acid versus Amicar in total knee and hip arthroplasty',
        phase: 'Phase 4 randomised trial, Duke University, results posted',
        sampleSize: 246,
        primaryEndpoint:
          'Total blood loss over the hospital stay, number of transfusions, and the fall from pre-operative to lowest post-operative haemoglobin',
        endpointMet: true,
        statisticalPValue:
          'Registry posting reports p < 0.05 for the primary outcome comparisons without identifying which pairwise contrast each belongs to',
        unreportedAdverseSignals:
          'All three registered primary outcomes are surrogates. No clinical outcome — function, revision, thrombosis or death — was registered as a primary endpoint.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Relative risk 0.81 (95% CI 0.67 to 0.99) of requiring a red cell transfusion against control, pooled across randomised surgical trials in a Cochrane review of 252 trials and more than 25,000 participants',
        'Relative risk 0.28 (95% CI 0.13 to 0.60) of recurrent anterior chamber haemorrhage in traumatic hyphema across six trials and 330 participants',
        'Complete oral bioavailability with peak plasma concentration of 164 ± 28 mcg/mL at 1.2 hours, and an apparent volume of distribution of 23.1 ± 6.6 L',
        'Comparable blood loss and transfusion against tranexamic acid in a 64-patient randomised aortic surgery trial and in a 1,544-patient retrospective cardiac surgery cohort',
      ],
      unsupportedInferences: [
        'That preventing a rebleed into the eye preserves vision — pooled visual acuity at up to three years was unchanged (RR 1.05, 95% CI 0.93 to 1.18)',
        'That reducing measured blood loss reduces death — no trial of this drug has ever been powered for mortality in sixty-two years on the market',
        'That the mortality evidence belonging to tranexamic acid transfers to aminocaproic acid because the mechanism is shared',
        'That aminocaproic acid is the safer antifibrinolytic — the comparison that established this rests mainly on observational data, and the randomised layer was inconclusive',
      ],
      whatFailedInitially: [
        'A randomised head-to-head in thoracic aortic surgery found significant renal injury in 40% of the aminocaproic acid arm against 16% on tranexamic acid (p=0.04), with all cases of renal failure in the aminocaproic acid arm',
        'The Cochrane reviewers graded the hyphema evidence low to very low certainty and found the rebleeding benefit fragile to the exclusion of two non-intention-to-treat studies',
        'Cochrane funnel plots indicate the lysine-analogue surgical trials may be subject to publication bias, and data on uncommon harms across those small trials were sparse',
      ],
      realWorldOutcome: [
        'Still stocked and used in cardiac, orthopaedic and ophthalmic surgery in the United States, largely because aprotinin left the market in 2007 and tranexamic acid periodically goes into shortage',
        'About US$2.68 per unit at United States pharmacy acquisition cost, supplied by more than twenty generic labellers',
        'Where a large randomised mortality trial was eventually run in this drug class, it was run on tranexamic acid, and the guidelines that came out of it name tranexamic acid',
      ],
    },
    deliverySystem: {
      type: 'Intravenous infusion, oral tablet and oral solution',
      description:
        'Given intravenously in the operating theatre and the intensive care unit, and by mouth for longer courses such as mucosal bleeding in haemophilia or bleeding into the eye. Oral absorption is complete, so the route is chosen by how quickly the effect is wanted, not by how much reaches the blood.',
      safetyProfile:
        'Eliminated largely unchanged by the kidney, so renal impairment raises exposure. Rapid intravenous administration is associated with hypotension, bradycardia and arrhythmia. Prolonged use has been associated with myopathy and rhabdomyolysis with raised creatine kinase, and the label directs that creatine kinase be monitored during long courses. It should not be given where there is active intravascular clotting. Its use in upper urinary tract bleeding risks obstructing the ureter with a clot that cannot dissolve.',
    },
    commonQuestions: [
      {
        q: 'Is this the same as tranexamic acid?',
        a: 'Same idea, different molecule, and a very different evidence base. Both are shaped like the amino acid lysine and both work by occupying the pockets plasmin uses to grip a clot. Tranexamic acid is the more rigid version and binds those pockets far more tightly, which is why the two are given in very different quantities. Where they genuinely differ is what has been proven: tranexamic acid has been randomised against placebo in more than twenty thousand trauma patients and more than twenty thousand women with post-partum haemorrhage, with death as the endpoint. Aminocaproic acid has never had a trial of that kind. In the head-to-head trials that do exist, both drugs reduce bleeding by about the same amount.',
        auditNote:
          'The commonest error on this drug is to quote CRASH-2 or WOMAN on an aminocaproic acid page. Those trials studied a different molecule.',
      },
      {
        q: 'Does it save sight after an eye injury?',
        a: 'It reduces the chance of a second bleed into the front of the eye by roughly two-thirds, and pooled across the trials that measured it, the vision people ended up with was no different. The 2023 Cochrane review found a relative risk of 0.28 for recurrent haemorrhage across six trials, and relative risks of 1.03 and 1.05 for long-term and final visual acuity — both indistinguishable from no effect. The reviewers state plainly that they found no evidence of an effect on visual acuity for any of the interventions they studied. The rebleed is real and it is worth avoiding; the claim that avoiding it saves sight has not been demonstrated.',
        auditNote:
          'This is the clearest measured-versus-inferred gap on the page. The measurement everyone reports is not the measurement anyone cares about.',
      },
      {
        q: 'Does it cause clots?',
        a: 'The theoretical concern is obvious — a drug that stops clots dissolving should leave more of them — and the randomised data have never been large enough to settle it. The Cochrane reviewers report that data on uncommon harms across the small trials were sparse and specifically flag concerns about the adequacy of reporting. The one place a thrombotic signal has been convincingly measured in this drug class is tranexamic acid in gastrointestinal bleeding, where the 12,009-patient HALT-IT trial found venous thromboembolism in 0.8% on treatment against 0.4% on placebo. That is a different drug in a different setting, and it is the best available evidence that the concern is not purely theoretical.',
      },
      {
        q: 'Why does this page not show a manufacturing cost?',
        a: 'Because no published per-dose cost of production for this molecule could be found and cited. The standard analysis for essential medicines, Hill and colleagues in BMJ Global Health in 2018, does not cover it. What is shown instead is a United States pharmacy acquisition cost from the CMS survey, which is what a pharmacy pays a wholesaler and not what it costs to make. The chemistry itself is the hydrolysis of caprolactam, a bulk nylon feedstock, in one step — which is consistent with the cost being very low, but consistency is not a measurement.',
      },
      {
        q: 'Why is a drug from 1964 still in use if nobody has proven it saves lives?',
        a: 'Because the endpoint it was licensed on — less bleeding, fewer transfusions — is a real endpoint that clinicians can see, and because for most of its life there was no competitor with better evidence. That changed twice. Aprotinin displaced it in cardiac surgery in the 1990s, then was withdrawn in 2007 after a trial found more deaths. Tranexamic acid then acquired the two large mortality trials this drug never had. Aminocaproic acid persists in the gaps: hospitals that stocked it, indications tranexamic acid was never tested in, and periods when tranexamic acid is in shortage.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          "Henry DA, Carless PA, Moxey AJ, O'Connell D, Stokes BJ, Fergusson DA, Ker K. Anti-fibrinolytic use for minimising perioperative allogeneic blood transfusion. Cochrane Database Syst Rev 2011;(3):CD001886",
        identifier: '10.1002/14651858.CD001886.pub4',
        kind: 'doi',
      },
      {
        label:
          'Woreta FA, Lindsley KB, Gharaibeh A, Ng SM, Scherer RW, Goldberg MF. Medical interventions for traumatic hyphema. Cochrane Database Syst Rev 2023;3(3):CD005431',
        identifier: '10.1002/14651858.CD005431.pub5',
        kind: 'doi',
      },
      {
        label:
          'Hutton B, Joseph L, Fergusson D, Mazer CD, Shapiro S, Tinmouth A. Risks of harms using antifibrinolytics in cardiac surgery: systematic review and network meta-analysis of randomised and observational studies. BMJ 2012;345:e5798',
        identifier: '10.1136/bmj.e5798',
        kind: 'doi',
      },
      {
        label:
          'Makhija N, Sarupria A, Kumar Choudhary S, Das S, Lakshmy R, Kiran U. Comparison of epsilon aminocaproic acid and tranexamic acid in thoracic aortic surgery: clinical efficacy and safety. J Cardiothorac Vasc Anesth 2013;27(6):1201-1207',
        identifier: '10.1053/j.jvca.2013.04.003',
        kind: 'doi',
      },
      {
        label:
          'Dannemiller RE, Knowles DM, Cook BM, Goodberlet MZ, Kelly JM, Malloy R. Comparison of trauma-dosed tranexamic acid versus aminocaproic acid in cardiac surgery in the setting of drug shortage. J Card Surg 2022;37(10):3243-3249',
        identifier: '10.1111/jocs.16782',
        kind: 'doi',
      },
      {
        label:
          'CRASH-2 trial collaborators. Effects of tranexamic acid on death, vascular occlusive events, and blood transfusion in trauma patients with significant haemorrhage. Lancet 2010;376:23-32 — cited here for the comparator drug',
        identifier: '10.1016/S0140-6736(10)60835-5',
        kind: 'doi',
      },
      {
        label:
          'HALT-IT trial collaborators. Effects of a high-dose 24-h infusion of tranexamic acid on death and thromboembolic events in patients with acute gastrointestinal bleeding. Lancet 2020;395:1927-1936 — cited here for the class thrombosis signal',
        identifier: '10.1016/S0140-6736(20)30848-5',
        kind: 'doi',
      },
      {
        label:
          'Drugs@FDA: AMICAR (aminocaproic acid), NDA 015197, original approval 3 June 1964, Type 1 new molecular entity, priority review',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=015197',
        kind: 'regulatory',
      },
      {
        label: 'Tranexamic acid versus Amicar in total knee and hip arthroplasty (Duke University)',
        identifier: 'NCT02030821',
        kind: 'nct',
      },
      {
        label:
          'PubChem CID 564 — 6-aminohexanoic acid structure, molecular formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/564',
        kind: 'url',
      },
      NADAC_SOURCE,
      NO_COST_STUDY_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 2. Tranexamic acid — two trials of twenty thousand each, and a primary endpoint nobody quotes.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'tranexamic-acid',
    name: 'Tranexamic Acid',
    tradeName: 'Cyklokapron / Lysteda',
    sponsor:
      'Pharmacia and Upjohn, now Pfizer (Cyklokapron injection, NDA 019281); Ferring held Lysteda tablets, NDA 022430. Off-patent and made generically worldwide.',
    targetGene: 'PLG',
    targetProtein:
      'Plasminogen and plasmin — the lysine-binding sites in their kringle domains, and at high concentration the glycine receptor in the central nervous system',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1986,
    indication:
      'Short-term use in patients with haemophilia to reduce or prevent haemorrhage and reduce the need for replacement therapy during and following tooth extraction (injection); cyclic heavy menstrual bleeding (oral tablets)',
    patientFriendlyIndication:
      'Heavy bleeding — from injury, after childbirth, during surgery, during periods, or after a dental extraction in haemophilia',
    anatomicalSite:
      'Blood plasma and the fibrin clot surface; it also crosses into cerebrospinal fluid, which is where the seizures come from',
    conditionContext: {
      conditionExplainer:
        'Bleeding stops when a mesh of fibrin forms across the torn vessel. From the moment it forms, an enzyme called plasmin starts taking it apart. Serious injury, childbirth and surgery all release large amounts of the activators that switch plasmin on, so in exactly the situations where a clot is most needed the body is most aggressively dismantling it.',
      whyItMatters:
        'Haemorrhage is one of the leading causes of preventable death after injury and the leading cause of maternal death worldwide. Tranexamic acid is cheap, does not need refrigeration, and can be given by a paramedic. If it works, it works in the places with the fewest other options — which is exactly why it has been tested more rigorously than almost any other drug in this file.',
      whoTakesThis:
        'Trauma patients within three hours of injury, women with post-partum haemorrhage, surgical patients at risk of significant bleeding, people with haemophilia undergoing dental work, and women with heavy periods. It is on the WHO Model List of Essential Medicines.',
      clinicalGoals:
        'In trauma and obstetrics the goal is survival, and that has been measured directly. In surgery the goal is fewer transfusions, and the trials were sized for that and not for death.',
    },
    oneSentenceVerdict:
      'A rigid lysine mimic that blocks plasmin from docking on a clot, and the only drug in this group with a randomised all-cause mortality reduction — 14.5% versus 16.0% in 20,211 trauma patients in CRASH-2 — while the obstetric trial it is most often credited with missed its registered primary endpoint, the gastrointestinal bleeding trial found no benefit and more venous thrombosis, and the head injury trial did not reach significance on the outcome it was designed around.',
    laymanHowItWorks:
      'A clot is a mesh, and the enzyme that dissolves it has to hold on to the mesh before it can cut. It holds on at spots shaped to fit the amino acid lysine. Tranexamic acid is a stiff, ring-shaped copy of lysine that fits those spots tightly and does not let go easily. The dissolving enzyme is still there and still working, but it cannot get a grip, so clots that form stay formed.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 80,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.3868 per mL of injection at United States pharmacy acquisition cost, median across 27 listed generic products in the CMS NADAC survey effective 19 August 2026',
      markupEstimate:
        'Not calculable. No published per-dose cost of production exists for this molecule, so there is no denominator to divide the acquisition cost by.',
      openPatentNotes:
        'Discovered by Utako and Shosuke Okamoto in Japan in the early 1960s. Composition-of-matter protection expired long ago; the US injection was approved in 1986 and the oral tablet, a new dosage form of an old molecule, in 2009. It is on the WHO Model List of Essential Medicines and is made generically worldwide.',
      synthesisComplexity: 'Moderate',
      costSource: NO_COST_STUDY_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Within the drug class the alternative is aminocaproic acid, which does the same thing more weakly and has never had a mortality trial. Outside it, for heavy menstrual bleeding the comparators are hormonal — a levonorgestrel intrauterine system reduces measured blood loss far more than any antifibrinolytic — and for surgical bleeding the alternative that used to win on blood loss, aprotinin, left the market after a trial found more deaths on it.',
      conventionalRx: [
        {
          name: 'Aminocaproic acid (Amicar)',
          class: 'Lysine analogue antifibrinolytic',
          howItCompares:
            'Same mechanism, weaker binding to the same site, and no trial in sixty-two years powered for death. Head-to-head in a 64-patient randomised aortic surgery trial the two were indistinguishable on blood loss and transfusion, with more renal injury on aminocaproic acid.',
          typicalCost:
            'US$2.68 per unit at United States pharmacy acquisition cost, median across 21 listed generic products (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: interchangeable on the surrogate endpoints, useful when tranexamic acid is in shortage. Cons: no mortality evidence of its own, and it antagonises the same glycine receptors, so it is not a way to avoid the seizure mechanism.',
        },
        {
          name: 'Levonorgestrel intrauterine system (Mirena)',
          class: 'Progestogen-releasing intrauterine device',
          howItCompares:
            'For heavy menstrual bleeding specifically, it acts on the endometrium rather than on the clot and reduces measured menstrual blood loss by far more than an antifibrinolytic does. It is not an option for acute haemorrhage and has nothing to say about trauma or surgery.',
          typicalCost: 'Device cost, fitted in clinic; not comparable on a per-dose basis',
          prosAndCons:
            'Pros: much larger reduction in menstrual blood loss, lasts years, contraceptive. Cons: requires a fitting procedure, irregular bleeding in early months, irrelevant outside this one indication.',
        },
        {
          name: 'Aprotinin (Trasylol)',
          class: 'Bovine serine protease inhibitor',
          howItCompares:
            'Inhibits plasmin directly rather than blocking its docking, and reduced blood loss more than the lysine analogues in head-to-head trials. The BART trial found a higher rate of death on aprotinin than on tranexamic acid or aminocaproic acid and was stopped early; aprotinin has not returned to the United States market.',
          typicalCost:
            'Not marketed in the United States; reinstated in the European Union in 2012 and in Canada in 2011 under restricted conditions',
          prosAndCons:
            'Pros: the most effective agent in the class on the bleeding endpoint. Cons: the mortality signal that removed it.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1CC(CCC1CN)C(=O)O',
      chemicalFormula: 'C8H15NO2',
      molecularWeight: '157.21 g/mol',
      targetReceptorAffinity:
        'Only the trans isomer is active. Locking the lysine-like amine and carboxylate onto a cyclohexane ring in the trans configuration fixes them at the separation the kringle lysine-binding site wants, which is why tranexamic acid binds that site far more tightly than the freely rotating chain of aminocaproic acid. The cis isomer is not the drug. Separately, and at the much higher concentrations reached in cerebrospinal fluid, the same lysine-like shape makes it a competitive antagonist at the glycine receptor.',
      structureSource: {
        label:
          'PubChem CID 5526 (4-(aminomethyl)cyclohexanecarboxylic acid) — canonical SMILES, molecular formula and weight; the string is unstereospecified, as dispensed material is the trans isomer',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5526',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'txa-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Incoming control of the aromatic precursor',
          description:
            'Confirm identity and purity of 4-(aminomethyl)benzoic acid or the corresponding nitrile before hydrogenation. The aromatic starting material is flat, so it carries no isomer problem of its own; every stereochemical question in this process is created by the next step.',
          reagentsAndBuffer:
            '4-(aminomethyl)benzoic acid reference standard, reversed-phase HPLC with UV detection, Karl Fischer titration, residual solvent determination by headspace gas chromatography',
        },
        {
          id: 'txa-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Catalytic ring hydrogenation to the cyclohexane',
          description:
            'Hydrogenate the benzene ring to cyclohexane over a noble metal catalyst under pressure. This is where the molecule becomes a drug and also where the problem is created: reduction of a flat ring gives a mixture of cis and trans isomers, and only the trans one is pharmacologically active.',
          dependsOnStepId: 'txa-w1',
          reagentsAndBuffer:
            'Ruthenium or rhodium on carbon, hydrogen under pressure, aqueous alkaline medium, stainless steel pressure reactor with nitrogen purge',
        },
        {
          id: 'txa-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Isomer separation and epimerisation to the trans form',
          description:
            'Separate the trans isomer from the cis by fractional crystallisation, and recycle the cis fraction by base-catalysed epimerisation rather than discarding it. Isomeric purity, not chemical purity, is the specification that matters here, and the assay has to be able to see cis in the presence of a large excess of trans.',
          dependsOnStepId: 'txa-w2',
          reagentsAndBuffer:
            'Water and lower alcohols for fractional crystallisation, alkoxide base for epimerisation, ion-exchange desalting, HPLC or derivatised gas chromatography capable of resolving the cis and trans isomers',
        },
        {
          id: 'txa-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Distribution into cerebrospinal fluid',
          description:
            'Measure how much of the compound crosses into the central nervous system and when. In patients undergoing major cardiovascular surgery, peak cerebrospinal fluid concentration occurred after the infusion had already ended, and in one patient that peak coincided with the onset of seizures. This step exists because the safety signal on this drug is a distribution finding, not a fibrinolysis finding.',
          dependsOnStepId: 'txa-w3',
          reagentsAndBuffer:
            'Paired plasma and cerebrospinal fluid sampling, protein precipitation with acetonitrile, LC-MS/MS with a deuterated internal standard',
        },
        {
          id: 'txa-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Clot lysis and glycine receptor readout side by side',
          description:
            'Run the euglobulin clot lysis time that measures the intended effect, and in parallel run whole-cell patch clamp on glycine receptor currents that measures the unintended one. Both are concentration-dependent, they have different thresholds, and reporting only the first is how a drug acquires a reputation for being free of side effects.',
          dependsOnStepId: 'txa-w4',
          reagentsAndBuffer:
            'Pooled citrated normal human plasma, euglobulin fraction, bovine thrombin, chromogenic plasmin substrate S-2251; separately, HEK293 cells expressing recombinant glycine receptors, glycine, whole-cell patch clamp recording solution',
        },
      ],
    },
    keyAudits: [
      {
        id: 'txa-a1',
        category: 'measured',
        title: 'CRASH-2: all-cause death fell from 16.0% to 14.5% in 20,211 randomised patients',
        laymanSummary:
          'In the largest trial ever run in trauma, giving tranexamic acid within eight hours of injury reduced deaths from any cause. It is the clearest survival result of any drug on these twelve pages.',
        technicalDetails:
          'CRASH-2 randomised 20,211 adult trauma patients with, or at risk of, significant bleeding across 274 hospitals in 40 countries within eight hours of injury, to tranexamic acid or matching placebo, both participants and staff masked. 10,060 and 10,067 patients respectively were analysed. All-cause mortality within four weeks was 1,463 (14.5%) against 1,613 (16.0%), relative risk 0.91 (95% CI 0.85 to 0.97, p=0.0035). Death due to bleeding was 489 (4.9%) against 574 (5.7%), RR 0.85 (95% CI 0.76 to 0.96, p=0.0077). Vascular occlusive events were not increased. All analyses were by intention to treat.',
        evidenceSource:
          'CRASH-2 trial collaborators, Lancet 2010;376(9734):23-32 (ISRCTN86750102, NCT00375258)',
        doi: '10.1016/S0140-6736(10)60835-5',
        measuredMetric: 'All-cause death in hospital within four weeks of injury',
        auditFlag: 'verified',
      },
      {
        id: 'txa-a2',
        category: 'failed',
        title: 'WOMAN missed its registered primary endpoint, and is cited as though it had not',
        laymanSummary:
          'The trial of tranexamic acid for bleeding after childbirth is quoted everywhere as a success. Its actual primary endpoint — death from any cause or hysterectomy — was not reduced. Hysterectomy was not reduced at all.',
        technicalDetails:
          'WOMAN randomised 20,060 women with clinically diagnosed post-partum haemorrhage across 193 hospitals in 21 countries. The composite primary endpoint of death from all causes or hysterectomy within 42 days occurred in 534 (5.3%) on tranexamic acid against 546 (5.5%) on placebo, RR 0.97 (95% CI 0.87 to 1.09, p=0.65). Hysterectomy alone was 358 (3.6%) against 351 (3.5%), RR 1.02 (95% CI 0.88 to 1.07, p=0.84). Death due to bleeding, which is the number everyone quotes, was 155 (1.5%) against 191 (1.9%), RR 0.81 (95% CI 0.65 to 1.00, p=0.045), and 1.2% against 1.7% in women treated within three hours, RR 0.69 (95% CI 0.52 to 0.91, p=0.008). The investigators state in the paper why: during the trial it became apparent that the decision to perform a hysterectomy was often taken at the same moment as randomisation, so the drug could not influence it, and the sample size was raised from 15,000 to 20,000 to power the death-due-to-bleeding estimate instead. That is a defensible change, transparently reported. It is still a primary endpoint that was not met, and almost nothing citing this trial says so.',
        evidenceSource:
          'WOMAN Trial Collaborators, Lancet 2017;389(10084):2105-2116 (ISRCTN76912190, NCT00872469)',
        doi: '10.1016/S0140-6736(17)30638-4',
        measuredMetric:
          'Composite of death from all causes or hysterectomy within 42 days of giving birth',
        inferredClaim:
          'That WOMAN showed tranexamic acid prevents hysterectomy or reduces overall maternal mortality — it showed neither',
        auditFlag: 'caution',
      },
      {
        id: 'txa-a3',
        category: 'failed',
        title: 'HALT-IT: no benefit in gastrointestinal bleeding, and more venous thrombosis',
        laymanSummary:
          'Twelve thousand patients bleeding from the gut were randomised. Deaths from bleeding were identical. Clots in the legs and lungs were nearly twice as common on the drug.',
        technicalDetails:
          'HALT-IT randomised 12,009 patients with significant upper or lower gastrointestinal bleeding across 164 hospitals in 15 countries. Death due to bleeding within five days occurred in 222 of 5,956 (4%) on tranexamic acid and 226 of 5,981 (4%) on placebo, RR 0.99 (95% CI 0.82 to 1.18). Arterial thromboembolic events were similar (0.7% versus 0.8%, RR 0.92, 95% CI 0.60 to 1.39). Venous thromboembolic events were higher on tranexamic acid: 48 of 5,952 (0.8%) against 26 of 5,977 (0.4%), RR 1.85 (95% CI 1.15 to 2.98). The investigators concluded that tranexamic acid should not be used for gastrointestinal bleeding outside a randomised trial. This is the same investigator group, the same design and the same drug as CRASH-2, and it is why the trauma result cannot be generalised to bleeding as a category.',
        evidenceSource:
          'HALT-IT trial collaborators, Lancet 2020;395(10241):1927-1936 (NCT01658124)',
        doi: '10.1016/S0140-6736(20)30848-5',
        measuredMetric:
          'Death due to bleeding within five days of randomisation, and venous thromboembolic events',
        auditFlag: 'verified',
      },
      {
        id: 'txa-a4',
        category: 'inferred',
        title: 'CRASH-3 did not reach significance on the endpoint it was designed around',
        laymanSummary:
          'The head injury trial is widely described as positive. Its primary result — deaths from the head injury — had a confidence interval that crossed no effect. The positive number people quote comes from a subgroup.',
        technicalDetails:
          'CRASH-3 randomised 12,737 patients with traumatic brain injury across 175 hospitals in 29 countries; 9,202 (72.2%) were treated within three hours, the prespecified primary population. Head injury-related death in hospital within 28 days was 18.5% on tranexamic acid against 19.8% on placebo, risk ratio 0.94 (95% CI 0.86 to 1.02) — the interval includes 1. A prespecified sensitivity analysis excluding patients with a Glasgow Coma Scale of 3 or bilateral unreactive pupils gave 12.5% against 14.0%, RR 0.89 (95% CI 0.80 to 1.00). The result that is quoted comes from a subgroup split: RR 0.78 (95% CI 0.64 to 0.95) in mild-to-moderate head injury against 0.99 (95% CI 0.91 to 1.07) in severe injury, p for heterogeneity 0.030. Vascular occlusive events and seizures were not increased. The subgroup was prespecified and the heterogeneity test supports it, which is the strongest version of this argument; it is still a subgroup, and the trial as designed did not clear its own threshold.',
        evidenceSource:
          'CRASH-3 trial collaborators, Lancet 2019;394(10210):1713-1723 (ISRCTN15088122, NCT01402882)',
        doi: '10.1016/S0140-6736(19)32233-0',
        measuredMetric:
          'Head injury-related death in hospital within 28 days, in patients treated within three hours',
        inferredClaim:
          'That tranexamic acid reduces death after traumatic brain injury — a conclusion carried by a prespecified subgroup rather than by the primary comparison',
        auditFlag: 'contested',
      },
      {
        id: 'txa-a5',
        category: 'measured',
        title:
          'ATACAS: half the blood products, twice the reoperations avoided, and seven times the seizures',
        laymanSummary:
          'In 4,631 coronary bypass patients the drug halved transfusion and halved reoperation for bleeding. It also raised post-operative seizures from one in a thousand to seven in a thousand, and did not change death or thrombosis.',
        technicalDetails:
          'ATACAS randomly assigned patients scheduled for coronary artery surgery at risk of complications, in a two-by-two factorial design with aspirin; 4,631 underwent surgery with available outcome data, 2,311 on tranexamic acid and 2,320 on placebo. The primary composite of death and thrombotic complications within 30 days occurred in 386 (16.7%) against 420 (18.1%), relative risk 0.92 (95% CI 0.81 to 1.05, p=0.22) — no difference. Total units of blood products transfused were 4,331 against 7,994 (p<0.001). Major haemorrhage or cardiac tamponade leading to reoperation occurred in 1.4% against 2.8% (p=0.001). Seizures occurred in 0.7% against 0.1% (p=0.002 by Fisher exact test). The mechanism is understood: tranexamic acid is a competitive antagonist at glycine receptors, its cerebrospinal fluid concentration peaks after the infusion has stopped, and in one patient in the pharmacokinetic study that peak coincided with the seizure.',
        evidenceSource:
          'Myles PS et al., Tranexamic Acid in Patients Undergoing Coronary-Artery Surgery. N Engl J Med 2017;376(2):136-148 (ACTRN12605000557639); mechanism from Lecker I et al., J Clin Invest 2012;122(12):4654-4666',
        doi: '10.1056/NEJMoa1606424',
        measuredMetric:
          'Units of blood product transfused, reoperation for major haemorrhage, and incidence of post-operative seizure',
        auditFlag: 'verified',
      },
      {
        id: 'txa-a6',
        category: 'failed',
        title: 'POISE-3: cardiovascular non-inferiority was not established in 9,535 patients',
        laymanSummary:
          'In the largest surgical trial of the drug, bleeding fell clearly. The safety test — proving it does not cause more heart attacks, strokes and clots — was set up in advance and the drug did not pass it.',
        technicalDetails:
          'POISE-3 randomised 9,535 patients undergoing noncardiac surgery to a tranexamic acid bolus at the start and end of surgery or placebo. The composite bleeding outcome at 30 days occurred in 433 of 4,757 (9.1%) against 561 of 4,778 (11.7%), hazard ratio 0.76 (95% CI 0.67 to 0.87), absolute difference -2.6 percentage points, two-sided p<0.001 for superiority. The composite cardiovascular outcome occurred in 649 of 4,581 (14.2%) against 639 of 4,601 (13.9%), hazard ratio 1.02 (95% CI 0.92 to 1.14). Non-inferiority required the upper boundary of the one-sided 97.5% confidence interval to fall below 1.125 and the one-sided p value to be below 0.025; the observed upper boundary was 1.14 and the one-sided p was 0.04. The authors state directly that non-inferiority was not established. The point estimate is close to 1 and the absolute difference is 0.3 percentage points, so this is a failure to exclude harm rather than a demonstration of it — but it is a prespecified test that the drug did not pass, and it is rarely mentioned alongside the bleeding result.',
        evidenceSource:
          'Devereaux PJ et al., Tranexamic Acid in Patients Undergoing Noncardiac Surgery. N Engl J Med 2022;386(21):1986-1997 (NCT03505723)',
        doi: '10.1056/NEJMoa2201171',
        measuredMetric:
          'Composite of myocardial injury after noncardiac surgery, nonhaemorrhagic stroke, peripheral arterial thrombosis or symptomatic proximal venous thromboembolism at 30 days',
        inferredClaim:
          'That tranexamic acid is thrombotically neutral in surgery — the trial designed to demonstrate that did not demonstrate it',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A drip, a tablet, or a paramedic at the roadside',
        laymanDesc:
          'It is a small, stable, water-soluble molecule that needs no refrigeration. That is why it can be given in an ambulance in a country with no blood bank, and it is the reason the trials could be run at the scale they were.',
        molecularDetail:
          'Given intravenously in trauma, obstetric and surgical bleeding, and orally as tablets for cyclic heavy menstrual bleeding. Elimination is renal and largely of unchanged drug, so exposure rises in renal impairment. The molecule is a zwitterionic amino acid analogue with no chiral centre in the pharmacological sense but a critical ring geometry.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It reaches the clot, and it also reaches the brain',
        laymanDesc:
          'Most of it circulates in the blood where the clots are. A fraction crosses into the fluid around the brain and spinal cord, and that fraction arrives late — the peak comes after the drip has been switched off.',
        molecularDetail:
          'In patients undergoing major cardiovascular surgery, peak cerebrospinal fluid concentration occurred after termination of the infusion, and in one patient coincided with the onset of seizures. The central compartment lags the plasma compartment, which is why post-operative seizures happen hours after the drug is stopped.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The ring locks into the pocket plasmin uses as a handhold',
        laymanDesc:
          'The molecule is a stiff ring with a lysine-shaped arm. That stiffness is the whole trick: it holds the shape the target pocket wants instead of having to be bent into it, so it binds tightly.',
        molecularDetail:
          'Trans-4-(aminomethyl)cyclohexanecarboxylic acid occupies the lysine-binding sites in the kringle domains of plasminogen and plasmin. The cyclohexane ring fixes the amine and the carboxylate at the separation the site requires, giving far higher affinity than the freely rotating chain of aminocaproic acid. The FDA label describes native plasminogen as carrying four to five low-affinity sites with a dissociation constant near 750 micromol/L and one high-affinity site near 1.1 micromol/L.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Plasmin cannot assemble on the fibrin surface',
        laymanDesc:
          'Clot dissolution is not something plasmin does from a distance. It has to line up on the clot alongside the enzyme that activates it. Blocking the handhold prevents the line-up, so the reaction never gets going.',
        molecularDetail:
          'Fibrinolysis is a surface-templated reaction: plasminogen and tissue plasminogen activator both bind lysine residues exposed on partially degraded fibrin, and that colocalisation accelerates plasmin generation by orders of magnitude. Occupying the lysine-binding sites blocks assembly rather than catalysis, which is why the effect is described as preserving and stabilising the fibrin matrix rather than as inhibiting an enzyme.',
        iconName: 'ShieldOff',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Bleeding slows — and in trauma, fewer people die',
        laymanDesc:
          'Clots that would have come apart hold. In injured patients treated within a few hours that translated into fewer deaths. In people bleeding from the gut it translated into nothing, and into more clots in the legs and lungs.',
        molecularDetail:
          'All-cause mortality 14.5% against 16.0% in 20,211 trauma patients (RR 0.91, 95% CI 0.85-0.97). Death due to bleeding 4% against 4% in 12,009 patients with gastrointestinal bleeding (RR 0.99, 95% CI 0.82-1.18), with venous thromboembolism 0.8% against 0.4% (RR 1.85, 95% CI 1.15-2.98). The mechanism is the same in both trials. The outcome is not.',
        iconName: 'Droplet',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'CRASH-2 (NCT00375258, ISRCTN86750102)',
        phase: 'Phase 3 randomised placebo-controlled trial, 274 hospitals in 40 countries',
        sampleSize: 20211,
        primaryEndpoint: 'Death in hospital within four weeks of injury',
        endpointMet: true,
        statisticalPValue:
          'All-cause mortality 14.5% vs 16.0%, RR 0.91 (95% CI 0.85-0.97), p = 0.0035',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'WOMAN (NCT00872469, ISRCTN76912190)',
        phase: 'Phase 3 randomised double-blind placebo-controlled trial, 193 hospitals',
        sampleSize: 20060,
        primaryEndpoint:
          'Composite of death from all causes or hysterectomy within 42 days of giving birth',
        endpointMet: false,
        statisticalPValue: '5.3% vs 5.5%, RR 0.97 (95% CI 0.87-1.09), p = 0.65',
        unreportedAdverseSignals:
          "The primary endpoint was missed and hysterectomy alone was unchanged (RR 1.02, p=0.84). The widely quoted result — death due to bleeding, RR 0.81, p=0.045 — became the trial's focus after the sample size was raised from 15,000 to 20,000 mid-study, a change the investigators report and explain in the paper.",
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'CRASH-3 (NCT01402882, ISRCTN15088122)',
        phase: 'Randomised placebo-controlled trial, 175 hospitals in 29 countries',
        sampleSize: 12737,
        primaryEndpoint:
          'Head injury-related death in hospital within 28 days, in patients treated within three hours',
        endpointMet: false,
        statisticalPValue: '18.5% vs 19.8%, RR 0.94 (95% CI 0.86-1.02) — interval includes 1',
        unreportedAdverseSignals:
          'The reported benefit rests on the prespecified mild-to-moderate subgroup (RR 0.78, 95% CI 0.64-0.95) against no effect in severe injury (RR 0.99), p for heterogeneity 0.030.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'HALT-IT (NCT01658124, ISRCTN11225767)',
        phase: 'Randomised placebo-controlled trial, 164 hospitals in 15 countries',
        sampleSize: 12009,
        primaryEndpoint: 'Death due to bleeding within five days of randomisation',
        endpointMet: false,
        statisticalPValue: '4% vs 4%, RR 0.99 (95% CI 0.82-1.18)',
        unreportedAdverseSignals:
          'Venous thromboembolic events were higher on tranexamic acid, 0.8% vs 0.4%, RR 1.85 (95% CI 1.15-2.98). The investigators recommended against use in gastrointestinal bleeding outside a trial.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'ATACAS (ACTRN12605000557639)',
        phase: 'Randomised placebo-controlled trial with a two-by-two factorial aspirin comparison',
        sampleSize: 4631,
        primaryEndpoint:
          'Composite of death and thrombotic complications within 30 days after coronary artery surgery',
        endpointMet: false,
        statisticalPValue: '16.7% vs 18.1%, relative risk 0.92 (95% CI 0.81-1.05), p = 0.22',
        unreportedAdverseSignals:
          'Seizures occurred in 0.7% on tranexamic acid against 0.1% on placebo (p=0.002). Blood product use fell from 7,994 to 4,331 units (p<0.001) and reoperation for major haemorrhage from 2.8% to 1.4% (p=0.001), which is what the trial is remembered for.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'POISE-3 tranexamic acid comparison (NCT03505723)',
        phase:
          'Randomised placebo-controlled trial in noncardiac surgery, partial factorial design',
        sampleSize: 9535,
        primaryEndpoint:
          'Composite bleeding outcome at 30 days, with a coprimary non-inferiority safety test on a composite cardiovascular outcome',
        endpointMet: false,
        statisticalPValue:
          'Bleeding 9.1% vs 11.7%, HR 0.76 (95% CI 0.67-0.87), p<0.001 for superiority; cardiovascular HR 1.02, upper bound of the one-sided 97.5% CI 1.14 against a prespecified margin of 1.125, one-sided p = 0.04 against a required 0.025',
        unreportedAdverseSignals:
          'Non-inferiority on the cardiovascular safety composite was prespecified and was not established. This is a failure to exclude harm, not a demonstration of harm, and it is seldom quoted next to the bleeding result.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'All-cause death 14.5% against 16.0% in 20,211 randomised trauma patients (RR 0.91, 95% CI 0.85-0.97, p=0.0035), with death due to bleeding 4.9% against 5.7%',
        'Death due to bleeding after childbirth 1.5% against 1.9% in 20,060 randomised women (RR 0.81, 95% CI 0.65-1.00, p=0.045), and 1.2% against 1.7% when given within three hours',
        'Blood product use in coronary surgery cut from 7,994 to 4,331 units and reoperation for haemorrhage from 2.8% to 1.4% in 4,631 randomised patients',
        'A composite bleeding outcome of 9.1% against 11.7% in 9,535 noncardiac surgery patients (HR 0.76, 95% CI 0.67-0.87)',
        "Seizures in 0.7% against 0.1% in coronary surgery, with a mechanism identified: competitive antagonism at glycine receptors at the concentrations measured in patients' cerebrospinal fluid",
      ],
      unsupportedInferences: [
        'That WOMAN showed a reduction in maternal death overall or in hysterectomy — the registered primary composite was not reduced (RR 0.97, p=0.65) and hysterectomy was unchanged (RR 1.02, p=0.84)',
        'That CRASH-3 showed a mortality benefit in traumatic brain injury — the primary comparison did not exclude no effect (RR 0.94, 95% CI 0.86-1.02) and the quoted number is a subgroup',
        'That a benefit in trauma generalises to bleeding as a category — the same investigators found nothing in 12,009 patients bleeding from the gut',
        'That the drug is thrombotically neutral — the prespecified non-inferiority test in 9,535 surgical patients was not passed, and venous thromboembolism nearly doubled in HALT-IT',
      ],
      whatFailedInitially: [
        'HALT-IT found no reduction in death due to gastrointestinal bleeding and a near-doubling of venous thromboembolism, and its investigators recommended against the use they had set out to support',
        'ATACAS missed its primary composite of death and thrombotic complications (p=0.22) while succeeding decisively on the bleeding endpoints it is remembered for',
        'POISE-3 failed its prespecified cardiovascular non-inferiority test',
        'The first oral formulation in the United States arrived in 2009, twenty-three years after the injection, as a Type 3 new dosage form rather than as a new molecule',
      ],
      realWorldOutcome: [
        'On the WHO Model List of Essential Medicines, carried on ambulances, and given at the roadside in trauma systems worldwide',
        'About US$0.39 per mL of injection at United States pharmacy acquisition cost across 27 listed generic products',
        'Guidelines recommend it in trauma within three hours and in post-partum haemorrhage as early as possible, and recommend against it in gastrointestinal bleeding — three different answers from four trials by the same group',
      ],
    },
    deliverySystem: {
      type: 'Intravenous infusion, oral tablet, and topical or mouthwash preparations',
      description:
        'Stable at room temperature and given as a slow intravenous injection or infusion in bleeding emergencies, as oral tablets for cyclic heavy menstrual bleeding, and as a mouthwash for mucosal bleeding in people on anticoagulants or with bleeding disorders. The tablet formulation reached the United States in 2009, twenty-three years after the injection.',
      safetyProfile:
        'Rapid intravenous injection causes hypotension. Post-operative seizures are the characteristic serious adverse effect and are concentration-dependent, mediated by competitive antagonism at glycine receptors; in coronary surgery the rate was 0.7% against 0.1% on placebo. Venous thromboembolism was increased in gastrointestinal bleeding (0.8% against 0.4%). It is cleared renally, so exposure rises with impaired kidney function. It is contraindicated in active intravascular clotting, and its use in upper urinary tract bleeding risks a clot that cannot be dissolved obstructing the ureter. Colour vision disturbance is described with prolonged use.',
    },
    commonQuestions: [
      {
        q: 'Does tranexamic acid save lives in childbirth?',
        a: "It reduced deaths from bleeding, and it did not reduce deaths overall or hysterectomies. In the WOMAN trial of 20,060 women, death due to bleeding fell from 1.9% to 1.5% (p=0.045), and to 1.2% from 1.7% when the drug was given within three hours. The trial's registered primary endpoint, though — death from any cause or hysterectomy within 42 days — was 5.3% against 5.5%, which is no difference, and hysterectomy on its own was slightly more common on the drug. The investigators explain why in the paper: the decision to remove the uterus was usually made at the same moment the woman was randomised, so no drug could have changed it. That is an honest account of a real design problem. It does not turn a missed primary endpoint into a met one.",
        auditNote:
          'This is the most-cited trial on this page and the one most often misdescribed. Both facts belong on the page: the bleeding-death reduction is real, and so is the missed primary.',
      },
      {
        q: 'If it works in trauma, why not use it for any bleeding?',
        a: 'Because the same investigators tested exactly that and it did not hold. HALT-IT randomised 12,009 patients bleeding from the stomach or bowel using the same design that produced CRASH-2. Deaths from bleeding were 4% in both arms. Clots in the legs and lungs went from 0.4% to 0.8%. The trial report says tranexamic acid should not be used for gastrointestinal bleeding outside a randomised trial. The lesson is specific and worth stating plainly: the drug does not treat "bleeding", it blocks fibrinolysis, and whether blocking fibrinolysis helps depends on whether excessive fibrinolysis was the problem.',
      },
      {
        q: 'Can it cause seizures?',
        a: "Yes, and the mechanism is known. In 4,631 coronary artery surgery patients, seizures occurred in 0.7% on tranexamic acid against 0.1% on placebo. Lecker and colleagues showed that tranexamic acid is a competitive antagonist at glycine receptors — the molecule is shaped like glycine as well as like lysine — and that the concentrations reached in patients' cerebrospinal fluid are enough to block those receptors. They also found that the peak concentration in cerebrospinal fluid arrives after the infusion has finished, and in one patient it coincided with the onset of the seizure. Aminocaproic acid antagonises the same receptors, so switching drugs within the class is not a way around the mechanism.",
        auditNote:
          'This is one of the few adverse effects anywhere in this file where the clinical signal and the molecular explanation were both established and match each other.',
      },
      {
        q: 'Does it increase the risk of clots?',
        a: 'The honest answer is that it depends on the setting and that the largest test designed to rule it out did not rule it out. CRASH-2 found no increase in vascular occlusive events in trauma. HALT-IT found venous thromboembolism nearly doubled, 0.8% against 0.4%, in gastrointestinal bleeding. POISE-3 set a prespecified non-inferiority margin for a composite of heart attack, stroke, arterial thrombosis and venous thromboembolism in 9,535 surgical patients, and the drug did not clear it — the hazard ratio was 1.02, essentially no difference, but the confidence interval was too wide to exclude the margin. That is a failure to demonstrate safety rather than a demonstration of harm, and the distinction matters in both directions.',
      },
      {
        q: 'Is the tablet for heavy periods the same drug as the trauma injection?',
        a: 'The same molecule, a different formulation and a very different evidence base. The United States injection was approved in 1986 and the oral tablet for cyclic heavy menstrual bleeding in 2009, as a Type 3 new dosage form. The tablet was licensed on reduction in measured menstrual blood loss, not on any outcome, and for that indication a levonorgestrel intrauterine system reduces blood loss considerably more. None of the large mortality trials on this page involved the tablet.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'CRASH-2 trial collaborators. Effects of tranexamic acid on death, vascular occlusive events, and blood transfusion in trauma patients with significant haemorrhage (CRASH-2): a randomised, placebo-controlled trial. Lancet 2010;376(9734):23-32',
        identifier: '10.1016/S0140-6736(10)60835-5',
        kind: 'doi',
      },
      {
        label:
          'WOMAN Trial Collaborators. Effect of early tranexamic acid administration on mortality, hysterectomy, and other morbidities in women with post-partum haemorrhage (WOMAN): an international, randomised, double-blind, placebo-controlled trial. Lancet 2017;389(10084):2105-2116',
        identifier: '10.1016/S0140-6736(17)30638-4',
        kind: 'doi',
      },
      {
        label:
          'CRASH-3 trial collaborators. Effects of tranexamic acid on death, disability, vascular occlusive events and other morbidities in patients with acute traumatic brain injury (CRASH-3). Lancet 2019;394(10210):1713-1723',
        identifier: '10.1016/S0140-6736(19)32233-0',
        kind: 'doi',
      },
      {
        label:
          'HALT-IT trial collaborators. Effects of a high-dose 24-h infusion of tranexamic acid on death and thromboembolic events in patients with acute gastrointestinal bleeding (HALT-IT). Lancet 2020;395(10241):1927-1936',
        identifier: '10.1016/S0140-6736(20)30848-5',
        kind: 'doi',
      },
      {
        label:
          'Myles PS et al. Tranexamic Acid in Patients Undergoing Coronary-Artery Surgery. N Engl J Med 2017;376(2):136-148',
        identifier: '10.1056/NEJMoa1606424',
        kind: 'doi',
      },
      {
        label:
          'Devereaux PJ et al. Tranexamic Acid in Patients Undergoing Noncardiac Surgery (POISE-3). N Engl J Med 2022;386(21):1986-1997',
        identifier: '10.1056/NEJMoa2201171',
        kind: 'doi',
      },
      {
        label:
          'Lecker I et al. Tranexamic acid concentrations associated with human seizures inhibit glycine receptors. J Clin Invest 2012;122(12):4654-4666',
        identifier: '10.1172/JCI63375',
        kind: 'doi',
      },
      {
        label:
          'Drugs@FDA: CYKLOKAPRON (tranexamic acid injection), NDA 019281, original approval 30 December 1986',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=019281',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA: LYSTEDA (tranexamic acid tablets), NDA 022430, original approval 13 November 2009 as a Type 3 new dosage form',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=022430',
        kind: 'regulatory',
      },
      {
        label:
          'PubChem CID 5526 — 4-(aminomethyl)cyclohexanecarboxylic acid structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5526',
        kind: 'url',
      },
      NADAC_SOURCE,
      NO_COST_STUDY_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 3. Desmopressin — one receptor, two completely different jobs, and a boxed warning that
  //    eventually removed four of its own formulations from the market.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'desmopressin',
    name: 'Desmopressin',
    tradeName: 'DDAVP / Stimate / Nocdurna / Noctiva',
    sponsor: 'Ferring Pharmaceuticals Inc.',
    targetGene: 'AVPR2',
    targetProtein:
      'Vasopressin V2 receptor — a Gs-coupled receptor found both on kidney collecting duct principal cells and on vascular endothelium',
    modality: 'Peptide / GLP-1 Agonist',
    approvalStatus: 'FDA Approved',
    approvalYear: 1978,
    indication:
      'Central diabetes insipidus as antidiuretic replacement; haemophilia A with factor VIII coagulant activity above 5% and no factor VIII antibodies; mild to moderate type I von Willebrand disease with factor VIII above 5%',
    patientFriendlyIndication:
      'Passing far too much urine because the body is missing the hormone that concentrates it — and, separately, bleeding in mild haemophilia A or mild von Willebrand disease',
    anatomicalSite:
      'Kidney collecting duct principal cells, and the Weibel-Palade bodies inside vascular endothelial cells',
    conditionContext: {
      conditionExplainer:
        'The pituitary normally releases a hormone that tells the kidney to hold on to water. Without it, the kidney lets water straight through and a person passes several litres of dilute urine a day and is permanently thirsty. Quite separately, the same hormone signal makes blood vessel linings dump a stored protein — von Willebrand factor — into the blood, and that protein is both the glue platelets stick with and the carrier that keeps factor VIII from being destroyed.',
      whyItMatters:
        'One drug is doing two unrelated jobs through the same receptor on two different tissues. That is why a bleeding patient can end up with dangerously low blood sodium: the kidney effect does not switch off while the bleeding effect is being used.',
      whoTakesThis:
        'People with central diabetes insipidus, who take it indefinitely; people with mild haemophilia A or mild type I von Willebrand disease around surgery or after injury; and, until recently, adults with night-time urination and children who wet the bed.',
      clinicalGoals:
        'Concentrate the urine, or raise circulating factor VIII and von Willebrand factor enough to get through a procedure. Both goals are laboratory measurements, and both are met.',
    },
    oneSentenceVerdict:
      'A redesigned vasopressin that hits the V2 receptor and leaves the blood-pressure receptor alone, raising factor VIII activity by 300 to 400 percent within two hours and concentrating the urine reliably — and the low-sodium harm that comes with the kidney half of that mechanism has now driven the original nasal spray, the haemostatic nasal spray and both nocturia products off the United States market.',
    laymanHowItWorks:
      'Desmopressin is a rebuilt copy of the hormone your pituitary releases when you are dehydrated. Two small changes to the original hormone make it last much longer and stop it squeezing blood vessels, so all that is left is the water-saving signal. It lands on a receptor that sits on two different tissues: kidney tubes, which respond by pulling water back out of the urine, and the lining of blood vessels, which respond by emptying a stored packet of clotting protein into the blood.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 66,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$9.28 per mL at United States pharmacy acquisition cost, median across 32 listed generic products in the CMS NADAC survey effective 19 August 2026',
      markupEstimate:
        'Not calculable. No published per-dose cost of production exists for this peptide, so there is no denominator to divide the acquisition cost by.',
      openPatentNotes:
        'A nine-amino-acid cyclic peptide with a disulphide bridge, made by solid-phase synthesis. Off patent, with more than thirty generic listings in the United States, though the branded nasal and sublingual formulations have been discontinued rather than genericised.',
      synthesisComplexity: 'Moderate',
      costSource: NO_COST_STUDY_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'For bleeding, desmopressin only works if there is something stored to release, which is why it is confined to mild disease: in severe von Willebrand disease or haemophilia A there is nothing in the endothelium to empty, and the alternative is to give the missing protein directly. For diabetes insipidus there is no alternative — it is hormone replacement, and nothing else replaces the hormone.',
      conventionalRx: [
        {
          name: 'Von Willebrand factor / factor VIII concentrate (Humate-P, Wilate)',
          class: 'Plasma-derived clotting factor concentrate',
          howItCompares:
            'Supplies the protein rather than asking the body to release its own, so it works in severe and type 3 disease where desmopressin does nothing, and it does not carry a sodium risk. It is a blood product, it is far more expensive, and it must be infused.',
          typicalCost:
            'Priced per international unit of von Willebrand factor ristocetin cofactor activity; not listed in the CMS acquisition-cost survey used elsewhere on this page',
          prosAndCons:
            'Pros: works regardless of endogenous stores, no tachyphylaxis, no hyponatraemia. Cons: plasma-derived, intravenous only, orders of magnitude more expensive.',
        },
        {
          name: 'Recombinant von Willebrand factor (Vonvendi)',
          class: 'Recombinant clotting factor',
          howItCompares:
            'A manufactured version of the same protein with no human plasma in it, for people in whom desmopressin does not raise levels enough or cannot be used.',
          typicalCost: 'Priced per international unit; not in the CMS acquisition-cost survey',
          prosAndCons:
            'Pros: no plasma exposure, ultra-large multimers preserved. Cons: cost, intravenous administration, and a much shorter track record than the plasma-derived concentrates.',
        },
        {
          name: 'Tranexamic acid',
          class: 'Lysine analogue antifibrinolytic',
          howItCompares:
            'Attacks the problem from the other end — it stops the clot dissolving rather than helping it form — and is routinely used alongside desmopressin for mucosal and dental bleeding in mild bleeding disorders. It has no effect on factor VIII levels.',
          typicalCost:
            'US$0.3868 per mL of injection at United States pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: cheap, oral or topical, no sodium risk, large randomised evidence base in other settings. Cons: a different mechanism, so it does not correct the underlying factor deficiency.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Ask when your sodium was last checked',
          action:
            'If you are on desmopressin for any reason, ask whether a serum sodium has been measured since you started and how often it will be repeated.',
          patientImpact:
            'The drug carries a boxed warning for hyponatraemia, which the label describes as potentially life-threatening and capable of causing seizures, coma, respiratory arrest or death. The label directs that sodium be normal before starting, measured within a week and again around a month, and monitored more often in people over 65.',
          clinicalPrecaution:
            'Early hyponatraemia is vague — headache, nausea, confusion, feeling off — and is easily mistaken for whatever the drug was prescribed for. Only a blood test distinguishes them.',
        },
      ],
    },
    molecularSchema: {
      // A connection table, not a sequence. Desmopressin is a cyclic nonapeptide with a
      // disulfide bridge and a D-arginine, none of which a one-letter sequence expresses — so the
      // structure is given as a SMILES and the type has to say so, or Layer 1 routes it to the
      // peptide branch and reads the bracket characters as illegal residues.
      structureType: 'small_molecule_smiles',
      smilesString:
        'C1C[C@H](N(C1)C(=O)[C@@H]2CSSCCC(=O)N[C@H](C(=O)N[C@H](C(=O)N[C@H](C(=O)N[C@H](C(=O)N2)CC(=O)N)CCC(=O)N)CC3=CC=CC=C3)CC4=CC=C(C=C4)O)C(=O)N[C@H](CCCN=C(N)N)C(=O)NCC(=O)N',
      chemicalFormula: 'C46H64N14O12S2',
      molecularWeight: '1069.20 g/mol (free base); dispensed as the acetate',
      targetReceptorAffinity:
        'Two deliberate edits to arginine vasopressin produce the whole drug: removing the amino group at position 1 lengthens the duration of action, and swapping L-arginine for D-arginine at position 8 strips out the V1-mediated pressor effect. What is left is selective V2 agonism, so an antidiuretic amount no longer reaches the threshold for squeezing blood vessels or gut smooth muscle.',
      structureSource: {
        label:
          'PubChem CID 5311065 (desmopressin) — canonical SMILES, molecular formula and weight, as stored on the enriched record for this drug',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5311065',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ddavp-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Incoming control of protected amino acids and resin',
          description:
            'Confirm identity, enantiomeric purity and loading of each Fmoc-protected residue and of the solid support before the chain is built. The D-arginine at position 8 is the residue the whole design rests on; any L-arginine contaminating it produces a peptide with pressor activity, which is precisely what this molecule exists to avoid.',
          reagentsAndBuffer:
            'Fmoc-protected amino acids including Fmoc-D-Arg(Pbf)-OH, Rink amide or chlorotrityl resin, chiral HPLC for enantiomeric purity, resin loading determination by Fmoc release at 301 nm',
        },
        {
          id: 'ddavp-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Solid-phase assembly of the nine-residue chain',
          description:
            'Build the peptide one residue at a time from the carboxy terminus, capping any unreacted chains at each cycle so that deletion sequences do not accumulate. Nine residues is short by peptide standards, which is why this drug is cheap by peptide standards.',
          dependsOnStepId: 'ddavp-w1',
          reagentsAndBuffer:
            'Dimethylformamide, piperidine for Fmoc removal, HBTU or DIC/Oxyma coupling reagents, acetic anhydride capping, ninhydrin or chloranil completion tests',
        },
        {
          id: 'ddavp-w3',
          stepNumber: 3,
          phase: 'Conjugation',
          name: 'Oxidative closure of the disulphide bridge',
          description:
            'Cyclise the molecule by oxidising the two cysteine-derived thiols into a single disulphide, under dilute conditions so that chains bridge to themselves rather than to each other. The ring is not decoration: the open-chain peptide does not fold into the shape the V2 receptor recognises.',
          dependsOnStepId: 'ddavp-w2',
          reagentsAndBuffer:
            'High-dilution aqueous buffer at mildly alkaline pH, iodine or air oxidation, Ellman reagent to confirm the absence of free thiol, size-exclusion HPLC to detect dimers',
        },
        {
          id: 'ddavp-w4',
          stepNumber: 4,
          phase: 'Purification',
          name: 'Preparative reversed-phase separation and acetate salt exchange',
          description:
            'Separate the cyclic monomer from deletion sequences, the linear precursor and the intermolecular dimers, then exchange the trifluoroacetate counter-ion for acetate. The dispensed drug is desmopressin acetate, and the counter-ion is part of the identity.',
          dependsOnStepId: 'ddavp-w2',
          reagentsAndBuffer:
            'Preparative C18 reversed-phase column, water and acetonitrile with trifluoroacetic acid, ion-exchange or repeated lyophilisation from acetic acid for salt exchange, residual TFA determination by ion chromatography',
        },
        {
          id: 'ddavp-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Parallel V2 potency and factor VIII release readouts',
          description:
            'Measure cyclic AMP accumulation in cells expressing the human V2 receptor, and separately measure von Willebrand factor released from cultured endothelial cells. Running both is the point: the same receptor produces the therapeutic effect on one tissue and the boxed-warning effect on the other, and a potency assay on only one of them describes half the drug.',
          dependsOnStepId: 'ddavp-w4',
          reagentsAndBuffer:
            'HEK293 cells stably expressing human AVPR2, homogeneous time-resolved fluorescence cyclic AMP kit, IBMX; separately human umbilical vein endothelial cells, endothelial growth medium, ELISA for released von Willebrand factor antigen',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ddavp-a1',
        category: 'measured',
        title: 'Factor VIII activity rises 300 to 400 percent, and it rises within half an hour',
        laymanSummary:
          'In people with mild haemophilia A or mild von Willebrand disease, an infusion pushes the missing clotting protein up three to four times over baseline, starting within thirty minutes and peaking around two hours.',
        technicalDetails:
          'The DDAVP injection label reports that the factor VIII and plasminogen activator response is dose-related, with maximal plasma levels of 300 to 400 percent change from baseline. The increase is evident within 30 minutes and reaches a maximum between 90 minutes and two hours. The duration of the haemostatic effect follows the half-life of factor VIII coagulant activity, about 8 to 12 hours. The percentage increase in patients with mild haemophilia A and von Willebrand disease was not significantly different from that seen in healthy individuals. The terminal half-life of the drug itself is 2.8 hours in normal renal function, rising to 4, 6.6 and 8.7 hours in mild, moderate and severe renal impairment, with area under the curve 1.5-, 2.4- and 3.6-fold higher respectively.',
        evidenceSource:
          'DDAVP (desmopressin acetate) injection, FDA-approved prescribing information, sections 12.2 and 12.3',
        measuredMetric:
          'Percentage change from baseline in factor VIII coagulant activity, and time to peak',
        auditFlag: 'verified',
      },
      {
        id: 'ddavp-a2',
        category: 'inferred',
        title:
          'The whole haemostatic indication rests on that laboratory rise, not on a bleeding trial',
        laymanSummary:
          'The evidence that desmopressin helps bleeding in mild haemophilia and von Willebrand disease is that it raises a number in a test tube. No randomised trial has measured whether people bleed less.',
        technicalDetails:
          "The label's clinical basis for the haemophilia A and type I von Willebrand indications is the factor VIII response, and the indications are written around a laboratory threshold — factor VIII coagulant activity above 5% and no factor VIII antibodies. There is no randomised placebo-controlled trial with a bleeding outcome underpinning either indication. The nearest randomised evidence in any bleeding population is Desborough and colleagues' meta-analysis of ten trials and 596 participants, all in cardiac surgery and all in patients whose problem was platelet dysfunction rather than a factor deficiency; the GRADE quality of that evidence was graded very low to moderate, which the authors describe as considerable uncertainty. The mechanism is not in doubt. The clinical inference from the mechanism has not been tested in the licensed population.",
        evidenceSource:
          'DDAVP injection prescribing information, sections 1.2 and 1.3; Desborough MJ et al., J Thromb Haemost 2017;15(2):263-272',
        doi: '10.1111/jth.13576',
        inferredClaim:
          'That a 300 to 400 percent rise in factor VIII translates into less bleeding — the step everyone takes and nobody has randomised',
        auditFlag: 'caution',
      },
      {
        id: 'ddavp-a3',
        category: 'measured',
        title: 'In cardiac surgery it removes about two thirds of a unit of blood per patient',
        laymanSummary:
          'Pooled across ten randomised trials of heart surgery patients whose platelets were not working properly, desmopressin cut transfusion by roughly two thirds of a unit each, cut blood loss by about 250 mL, and more than halved the odds of going back to theatre for bleeding.',
        technicalDetails:
          'Desborough et al. pooled ten randomised trials with 596 participants, all in cardiac surgery, with platelet dysfunction due to antiplatelet agents in six trials and to cardiopulmonary bypass in four. Patients receiving desmopressin were transfused fewer red cells (mean difference -0.65 units, 95% CI -1.16 to -0.13), lost less blood (mean difference -253.93 mL, 95% CI -408.01 to -99.85) and had lower odds of re-operation for bleeding (Peto odds ratio 0.39, 95% CI 0.18 to 0.84). The authors state there were too few events to determine whether thrombotic risk changed, and grade the evidence very low to moderate certainty, "suggesting considerable uncertainty over the results". A separate 2023 Cochrane overview of interventions to reduce transfusion in hip fracture surgery searched specifically for desmopressin among other agents and found no systematic review of it in that setting at all.',
        evidenceSource:
          'Desborough MJ, Oakland K, Brierley C, et al. Desmopressin for treatment of platelet dysfunction and reversal of antiplatelet agents: a systematic review and meta-analysis of randomized controlled trials. J Thromb Haemost 2017;15(2):263-272',
        doi: '10.1111/jth.13576',
        measuredMetric:
          'Units of red cells transfused, millilitres of blood lost, and odds of re-operation for bleeding',
        auditFlag: 'verified',
      },
      {
        id: 'ddavp-a4',
        category: 'conclusion_shift',
        title: 'The FDA removed bedwetting from the nasal spray label in December 2007',
        laymanSummary:
          'For years the nasal spray was a standard treatment for children who wet the bed. After repeated reports of dangerously low blood sodium and seizures, the FDA required the label to be changed and the indication went away.',
        technicalDetails:
          'Following a United States FDA request in December 2007 that the prescribing information for desmopressin nasal spray be updated, the spray is no longer indicated for primary monosymptomatic nocturnal enuresis or for use in patients at risk of hyponatraemia. Multiple reports of hyponatraemia in patients treated for nocturia, mainly elderly, drove the wider awareness. Vande Walle and colleagues, reviewing the safety question, note that hyponatraemia is reported far more often with the nasal spray than with the tablet, and attribute that partly to the spray having been the only available route in many countries for over a decade and partly to its higher and more variable bioavailability. Their own position is that the risk reflects misuse rather than an inherent property of the molecule — which is an argument about attribution, not a dispute about the events.',
        evidenceSource:
          'Vande Walle J, Van Herzeele C, Raes A. Is there still a role for desmopressin in children with primary monosymptomatic nocturnal enuresis? A focus on safety issues. Drug Saf 2010;33(4):261-271',
        doi: '10.2165/11319110-000000000-00000',
        inferredClaim:
          'That an effective antidiuretic is a safe antidiuretic in a population that is otherwise well — the assumption the enuresis indication was built on',
        auditFlag: 'verified',
      },
      {
        id: 'ddavp-a5',
        category: 'failed',
        title: 'Stimate was recalled as a superpotent drug in 2020 and never came back',
        laymanSummary:
          'The concentrated nasal spray used specifically for bleeding disorders was pulled from the market in July 2020 because vials contained more drug than the label said. It is a Class I recall — the FDA category for a product that can cause serious harm or death — and the product is now discontinued.',
        technicalDetails:
          'On 21 July 2020 Ferring Pharmaceuticals initiated a voluntary Class I recall of Stimate (desmopressin acetate) nasal spray 1.5 mg/mL, manufactured for CSL Behring, recall number D-1506-2020, with the stated reason "Superpotent Drug". Stimate was approved as NDA 020355 on 7 March 1994 and every product under that application is now listed as discontinued in Drugs@FDA. A superpotency failure in this particular drug is not a routine quality deviation: the entire hazard of desmopressin is dose-dependent water retention, so a vial delivering more than its label states delivers exactly the harm the boxed warning describes.',
        evidenceSource:
          'openFDA drug enforcement record D-1506-2020, Class I, recall initiated 21 July 2020; Drugs@FDA NDA 020355 (STIMATE)',
        measuredMetric: 'Recall classification and stated reason for recall',
        auditFlag: 'verified',
      },
      {
        id: 'ddavp-a6',
        category: 'failed',
        title: 'Four formulations approved for urinary indications are all now discontinued',
        laymanSummary:
          'Every product built around desmopressin for night-time urination has left the United States market: the original 1978 nasal spray, the 1994 haemostatic spray, and both of the nocturia products approved in 2017 and 2018.',
        technicalDetails:
          'Drugs@FDA lists all products under NDA 017922 (DDAVP nasal solution and spray, approved 21 February 1978) as discontinued; all products under NDA 020355 (Stimate, approved 7 March 1994) as discontinued; all products under NDA 201656 (Noctiva nasal spray for nocturia due to nocturnal polyuria, approved 3 March 2017) as discontinued; and all products under NDA 022517 (Nocdurna sublingual tablets, approved 21 June 2018) as discontinued. The injection (NDA 018938, approved 30 March 1984) and the oral tablets (NDA 019955, approved 6 September 1995) remain marketed. The pattern is not random: the formulations that survived are the ones used for hormone replacement and for bleeding, and the ones that did not are the ones aimed at a symptom in an older population where the boxed hyponatraemia warning bites hardest.',
        evidenceSource:
          'openFDA Drugs@FDA marketing status for NDA 017922, NDA 020355, NDA 201656, NDA 022517, NDA 018938 and NDA 019955',
        measuredMetric: 'Marketing status of each approved application',
        auditFlag: 'verified',
      },
      {
        id: 'ddavp-a7',
        category: 'inferred',
        title: 'It cannot work where there is nothing stored, and in one subtype it causes clots',
        laymanSummary:
          'Desmopressin does not manufacture clotting protein, it empties a store. If the store is empty, or if the protein in it is the wrong shape, releasing it either does nothing or makes things worse.',
        technicalDetails:
          'The DDAVP label limits both haemostatic indications to patients with factor VIII coagulant activity above 5%, states that the drug is not indicated for severe type I von Willebrand disease or where there is evidence of an abnormal molecular form of factor VIII antigen, and warns that use in type IIB von Willebrand disease may cause thrombosis through platelet aggregation. It is also explicitly ineffective in nephrogenic diabetes insipidus, where the receptor itself is the problem. Repeated administration produces a diminishing response as endothelial stores are depleted. Every one of these limits follows directly from the mechanism being release of a pre-existing store rather than synthesis of a protein — which is the strongest argument for teaching the mechanism rather than the indication list.',
        evidenceSource:
          'DDAVP (desmopressin acetate) injection, FDA-approved prescribing information, sections 1.2, 1.3 and 5.3',
        inferredClaim:
          'That a drug which raises factor VIII in mild disease will do something useful in severe disease — the extrapolation the label exists to block',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Injected, sprayed or swallowed — and very little of a tablet gets in',
        laymanDesc:
          'It is a small peptide, so the gut destroys most of it. The injection puts all of it into the blood at once; the tablet needs far more of it to achieve the same thing.',
        molecularDetail:
          "A nine-residue cyclic peptide, not metabolised by CYP450, with a terminal half-life of 2.8 hours and 52% of an intravenous dose recovered unchanged in urine within 24 hours. Renal impairment extends the half-life to 8.7 hours in severe impairment and raises exposure 3.6-fold, which matters because the drug's hazard is cumulative water retention.",
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It docks on the V2 receptor — on two entirely different tissues',
        laymanDesc:
          'The receptor it activates sits on kidney tubes and on the lining of blood vessels. The drug cannot tell them apart, which is why treating a bleed also switches on water retention.',
        molecularDetail:
          'Desmopressin is a selective agonist at the V2 vasopressin receptor. Deamination at position 1 and substitution of D-arginine at position 8 remove the V1-mediated vasopressor and visceral smooth muscle effects, so that antidiuretic concentrations sit below the threshold for vascular action. The V2 receptor is expressed on collecting duct principal cells and on vascular endothelium.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'Inside the kidney cell, water channels are moved to the surface',
        laymanDesc:
          'The receptor sets off a chemical messenger inside the cell, which causes ready-made water channels stored in little bubbles to be pushed into the cell wall. Water then flows back out of the urine.',
        molecularDetail:
          'V2 activation couples through Gs to adenylate cyclase, raising cyclic AMP and activating protein kinase A, which phosphorylates aquaporin-2 and drives trafficking of aquaporin-2-bearing vesicles to the apical membrane of the collecting duct principal cell. Water then follows the medullary osmotic gradient out of the tubular lumen. Urine output falls, urine osmolality rises and plasma osmolality falls.',
        iconName: 'Droplets',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'Inside the blood vessel lining, a stored packet of clotting protein is emptied',
        laymanDesc:
          'The same signal in a different cell causes storage granules to fuse with the cell surface and release von Willebrand factor into the blood. That protein carries factor VIII and glues platelets to a wound.',
        molecularDetail:
          'The same cyclic AMP rise triggers exocytosis of Weibel-Palade bodies from vascular endothelium, releasing stored von Willebrand factor multimers. Because von Willebrand factor is the circulating chaperone for factor VIII, factor VIII activity rises with it. This is release of a pre-formed store, not synthesis, which is why the response is exhausted by repeated dosing and absent where the store is absent.',
        iconName: 'PackageOpen',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The urine concentrates, the clotting numbers rise, and the sodium falls',
        laymanDesc:
          'Both intended effects happen and both are easy to measure. So does the third one: holding on to water dilutes the blood, and if fluid keeps going in, the sodium level can drop far enough to cause seizures.',
        molecularDetail:
          'Factor VIII activity reaches 300 to 400 percent of baseline within 90 minutes to two hours. Urine output falls and urine osmolality rises. The label carries a boxed warning for hyponatraemia, which it describes as capable of causing seizures, coma, respiratory arrest or death, with contraindications in excessive fluid intake, loop diuretic or glucocorticoid use, and known or suspected SIADH.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'Desborough meta-analysis of desmopressin for platelet dysfunction in cardiac surgery',
        phase: 'Systematic review and meta-analysis of ten randomised controlled trials',
        sampleSize: 596,
        primaryEndpoint: 'Perioperative allogeneic red cell transfusion and blood loss',
        endpointMet: true,
        statisticalPValue:
          'Red cells: mean difference -0.65 units (95% CI -1.16 to -0.13). Blood loss: -253.93 mL (95% CI -408.01 to -99.85). Re-operation for bleeding: Peto OR 0.39 (95% CI 0.18-0.84)',
        unreportedAdverseSignals:
          'The authors state there were too few events to determine whether thrombotic risk changed, and grade the evidence very low to moderate certainty.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId:
          'FDA-approved labelling basis for the haemophilia A and type I von Willebrand indications',
        phase: 'Pharmacodynamic characterisation, no randomised bleeding-outcome trial',
        sampleSize: 0,
        primaryEndpoint:
          'Percentage change from baseline in factor VIII coagulant activity and plasminogen activator',
        endpointMet: true,
        statisticalPValue:
          'Maximal 300 to 400 percent change from baseline; increase evident within 30 minutes, maximum at 90 minutes to two hours',
        unreportedAdverseSignals:
          'A sample size of zero is the accurate entry: there is no randomised controlled trial with a bleeding endpoint behind either haemostatic indication. The licensing evidence is a laboratory response.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Cochrane overview of transfusion-reducing interventions in hip fracture surgery',
        phase: 'Overview of 26 systematic reviews covering 36 randomised trials',
        sampleSize: 3923,
        primaryEndpoint:
          'Number of people requiring allogeneic blood transfusion after hip fracture surgery',
        endpointMet: false,
        statisticalPValue:
          'No result for desmopressin. The overview searched for it explicitly and found no systematic review of desmopressin in this population; only tranexamic acid and iron had any.',
        unreportedAdverseSignals:
          '`endpointMet: false` here means the evidence does not exist, not that the drug failed a test.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Factor VIII coagulant activity rising to 300 to 400 percent of baseline, evident within 30 minutes and maximal between 90 minutes and two hours',
        'Reduced urine output, raised urine osmolality and lowered plasma osmolality in central diabetes insipidus',
        '0.65 fewer units of red cells and 254 mL less blood lost per patient across ten randomised cardiac surgery trials in 596 participants',
        'Terminal half-life of 2.8 hours rising to 8.7 hours in severe renal impairment, with exposure 3.6-fold higher',
      ],
      unsupportedInferences: [
        'That the factor VIII rise reduces bleeding in mild haemophilia A or type I von Willebrand disease — the licensed indications rest on the laboratory response, with no randomised bleeding-outcome trial behind them',
        'That an agent effective in mild disease will help in severe disease — the label excludes severe type I von Willebrand disease, and in type IIB it warns of thrombosis from platelet aggregation',
        'That hyponatraemia is a manageable inconvenience rather than the effect that removed four formulations from the market',
      ],
      whatFailedInitially: [
        'The FDA required the nasal spray label to be revised in December 2007, after which it is no longer indicated for primary monosymptomatic nocturnal enuresis or in patients at risk of hyponatraemia',
        'Stimate nasal spray was subject to a Class I recall on 21 July 2020 for superpotency and is now discontinued',
        'Noctiva (approved 2017) and Nocdurna (approved 2018), both aimed at nocturia, are both discontinued, as is the original 1978 DDAVP nasal formulation',
        'A 2023 Cochrane overview looking specifically for desmopressin evidence in hip fracture surgery found no systematic review of it at all',
      ],
      realWorldOutcome: [
        'The injection and the oral tablets remain marketed and are the mainstay of treatment for central diabetes insipidus, where nothing else replaces the missing hormone',
        'About US$9.28 per mL at United States pharmacy acquisition cost across 32 listed generic products',
        'In bleeding disorders it has been progressively confined to mild disease with a documented response, with factor concentrates used where the store cannot be relied on',
      ],
    },
    deliverySystem: {
      type: 'Intravenous or subcutaneous injection, oral tablet, sublingual tablet and nasal spray',
      description:
        'The injection is used in hospital for bleeding and for acute management of diabetes insipidus. Tablets are the long-term route for diabetes insipidus. The nasal formulations delivered the drug efficiently and variably, and that variability is a large part of why they no longer exist in the United States.',
      safetyProfile:
        'A boxed warning for hyponatraemia, which the label describes as potentially life-threatening and capable of causing seizures, coma, respiratory arrest or death. Contraindicated with excessive fluid intake, in known or suspected SIADH, and with loop diuretics or systemic or inhaled glucocorticoids. May cause hypotension with reflex tachycardia, or hypertension. Use in type IIB von Willebrand disease may cause thrombosis through platelet aggregation. Fluid retention can destabilise heart failure and is not recommended where intracranial pressure may be raised. Exposure rises substantially with renal impairment.',
    },
    commonQuestions: [
      {
        q: 'How can one drug treat both bedwetting and bleeding?',
        a: 'Because the receptor it activates sits on two different tissues that respond to it in two different ways. On kidney collecting duct cells, switching on the V2 receptor pushes water channels into the cell surface and the kidney reclaims water, so less urine is made. On the cells lining blood vessels, switching on the same receptor causes storage granules to empty von Willebrand factor into the blood, and since that protein carries factor VIII, both clotting measurements rise. The drug is not doing two things; it is doing one thing in two places. That also explains the central safety problem: you cannot use the bleeding effect without also getting the water effect.',
      },
      {
        q: 'Why did the nasal sprays disappear?',
        a: 'Different reasons that point the same way. In December 2007 the FDA required the nasal spray labelling to be revised after reports of dangerously low blood sodium, and the bedwetting indication went away. In July 2020 Stimate — the concentrated spray used for bleeding disorders — was recalled as a Class I superpotent drug, meaning vials contained more than the label said, and it has not returned. Noctiva and Nocdurna, both approved for night-time urination in 2017 and 2018, are discontinued. So is the original 1978 nasal formulation. What survives is the injection and the tablet, and what they are used for is hormone replacement and bleeding, not symptom control in otherwise healthy people.',
        auditNote:
          'Six approved applications, four of them now fully discontinued. That is a market answering a safety question that no single trial answered.',
      },
      {
        q: 'Has anyone proved it stops bleeding?',
        a: 'Not in the people it is licensed for. The haemophilia A and type I von Willebrand indications rest on a pharmacodynamic measurement — factor VIII activity rising to three or four times baseline — rather than on a randomised trial with a bleeding endpoint. The best randomised evidence in any bleeding population is a meta-analysis of ten trials and 596 cardiac surgery patients whose platelets were not working, which found about two thirds of a unit less blood transfused per patient and lower odds of returning to theatre, at very low to moderate certainty. That is a real result in a different population for a different reason. The mechanism is not in question. The clinical step from mechanism to outcome has not been randomised in the licensed indication.',
        auditNote:
          'The measurement is excellent and the inference from it is untested. This is the single most common shape of evidence in this entire drug group.',
      },
      {
        q: 'Does it stop working if it is used repeatedly?',
        a: 'The response gets smaller. Desmopressin does not make von Willebrand factor, it empties a store of it out of the cells lining blood vessels. Once that store is depleted, another dose has less to release, and the store takes time to refill. This is a direct consequence of the mechanism and it is why the drug is used around a specific event rather than continuously for bleeding, and why the label restricts the haemostatic indications to people whose factor VIII is already above a threshold — there has to be something there to mobilise.',
      },
      {
        q: 'Is low sodium really that serious?',
        a: 'It carries a boxed warning, which is the strongest warning the FDA applies to a label, and the wording is that severe hyponatraemia can be life-threatening and lead to seizures, coma, respiratory arrest or death. The label directs that serum sodium be normal before starting, checked within a week, checked again around a month, and monitored more frequently in people aged 65 and over. It is contraindicated in people taking loop diuretics or glucocorticoids, in known or suspected SIADH, and in anyone drinking excessive fluid. The reason this warning is so prominent is not that the effect is rare or exotic — it is the drug working exactly as designed on the kidney while being used for something else.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'DDAVP (desmopressin acetate) injection — FDA-approved prescribing information, boxed warning and sections 1, 5 and 12, retrieved from the openFDA drug label endpoint',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22DDAVP%22',
        kind: 'regulatory',
      },
      {
        label:
          'Desborough MJ, Oakland K, Brierley C, et al. Desmopressin for treatment of platelet dysfunction and reversal of antiplatelet agents: a systematic review and meta-analysis of randomized controlled trials. J Thromb Haemost 2017;15(2):263-272',
        identifier: '10.1111/jth.13576',
        kind: 'doi',
      },
      {
        label:
          'Vande Walle J, Van Herzeele C, Raes A. Is there still a role for desmopressin in children with primary monosymptomatic nocturnal enuresis? A focus on safety issues. Drug Saf 2010;33(4):261-271',
        identifier: '10.2165/11319110-000000000-00000',
        kind: 'doi',
      },
      {
        label:
          'Brunskill SJ et al. Interventions for reducing red blood cell transfusion in adults undergoing hip fracture surgery: an overview of systematic reviews. Cochrane Database Syst Rev 2023;6(6):CD013737',
        identifier: '10.1002/14651858.CD013737.pub2',
        kind: 'doi',
      },
      {
        label:
          'openFDA drug enforcement report D-1506-2020 — Class I recall of STIMATE (desmopressin acetate) nasal spray 1.5 mg/mL for superpotency, initiated 21 July 2020 by Ferring Pharmaceuticals',
        identifier:
          'https://api.fda.gov/drug/enforcement.json?search=product_description:%22STIMATE%22',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA: DDAVP nasal solution and spray, NDA 017922, original approval 21 February 1978; all products discontinued',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=017922',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA: DDAVP injection, NDA 018938, original approval 30 March 1984; and DDAVP tablets, NDA 019955, original approval 6 September 1995',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=018938',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA: NOCTIVA, NDA 201656, approved 3 March 2017, discontinued; and NOCDURNA, NDA 022517, approved 21 June 2018, discontinued',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=201656',
        kind: 'regulatory',
      },
      {
        label:
          'PubChem CID 5311065 — desmopressin structure, molecular formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5311065',
        kind: 'url',
      },
      NADAC_SOURCE,
      NO_COST_STUDY_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 4. Phytonadione (vitamin K1) — the newborn injection that was never randomised for the
  //    thing it prevents, and the cancer scare that took a decade to unwind.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'vitamin-k',
    name: 'Phytonadione (Vitamin K1)',
    tradeName: 'Mephyton / AquaMEPHYTON / Konakion',
    sponsor:
      'Bausch (Mephyton tablets, NDA 010104); the injectable emulsion is supplied by multiple generic manufacturers',
    targetGene: 'GGCX',
    targetProtein:
      'Gamma-glutamyl carboxylase — the enzyme that uses reduced vitamin K as its cofactor, with VKORC1 regenerating that cofactor after each round',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1955,
    indication:
      'Coagulation disorders due to faulty formation of factors II, VII, IX and X caused by vitamin K deficiency or interference with vitamin K activity: anticoagulant-induced prothrombin deficiency from coumarin derivatives, prophylaxis and therapy of haemorrhagic disease of the newborn, hypoprothrombinaemia from antibacterial therapy, and hypoprothrombinaemia from impaired absorption in obstructive jaundice, biliary fistula, sprue, ulcerative colitis, coeliac disease, intestinal resection, cystic fibrosis and regional enteritis',
    patientFriendlyIndication:
      'Bleeding, or a risk of bleeding, because the body cannot finish building four of its clotting proteins — from warfarin, from a newborn gut that has not started making vitamin K yet, or from a condition that stops fat being absorbed',
    anatomicalSite:
      'Liver hepatocyte endoplasmic reticulum, where the clotting factors are assembled and carboxylated',
    conditionContext: {
      conditionExplainer:
        'Four of the clotting factors are made in the liver as unfinished proteins. Before they can work they need a chemical handle added to a set of glutamate residues, and the enzyme that adds it uses vitamin K as a cofactor. Without vitamin K, the liver still makes the proteins and still releases them, but they cannot grip calcium, so they cannot assemble on a membrane surface and the clotting cascade does not fire.',
      whyItMatters:
        'Newborn babies are born with almost no vitamin K: it crosses the placenta poorly, breast milk contains little, and the gut bacteria that make some of it have not arrived yet. A small number of otherwise healthy infants bleed into the brain in the first months of life for this reason alone, and about a fifth of them die.',
      whoTakesThis:
        'Almost every baby born in a country with a functioning maternity system receives it once at birth. Adults receive it to reverse warfarin, and long-term where fat absorption is impaired.',
      clinicalGoals:
        'In adults, bring the INR down — a laboratory measurement. In newborns, prevent bleeding — an outcome that has been measured, though not by the study design people assume.',
    },
    oneSentenceVerdict:
      'The cofactor four clotting factors cannot be finished without, given once to virtually every newborn on the strength of surveillance data showing a fiftyfold reduction in late haemorrhagic disease — a benefit no randomised trial has ever measured, attached to an injection whose boxed warning describes fatal anaphylactoid reactions that come from the solubiliser rather than the vitamin.',
    laymanHowItWorks:
      'Four of your clotting proteins leave the liver unfinished. An enzyme has to add a chemical clip to them before they can grab calcium and stick to the surface of an injured blood vessel, and that enzyme cannot work without vitamin K. Give vitamin K and the liver starts finishing proteins again. It is not a clotting factor and it does not stop bleeding directly — it restarts a production line, which is why it takes hours rather than minutes.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 72,
    substitutes: {
      summary:
        'For a person actively bleeding on warfarin, vitamin K is the slow half of the answer and cannot be the whole of it: it restarts synthesis, and the factors already in circulation are still uncarboxylated. That is why prothrombin complex concentrate or plasma is given alongside, to supply finished factors immediately while the vitamin restarts the line. For newborn prophylaxis the alternative is oral dosing, which surveillance data say is worse.',
      conventionalRx: [
        {
          name: 'Four-factor prothrombin complex concentrate (Kcentra)',
          class: 'Plasma-derived concentrate of factors II, VII, IX and X with proteins C and S',
          howItCompares:
            'Supplies the finished, carboxylated factors directly rather than restarting their manufacture, so the INR falls in minutes rather than hours. It is given with vitamin K, not instead of it, because the concentrate is consumed within hours while the warfarin is still present.',
          typicalCost:
            'Priced per international unit of factor IX; not listed in the CMS pharmacy acquisition-cost survey',
          prosAndCons:
            'Pros: immediate correction, small volume. Cons: plasma-derived, thromboembolic events reported in roughly 7-8% of recipients in its registration trials, and it does nothing about the warfarin still circulating.',
        },
        {
          name: 'Fresh frozen plasma',
          class: 'Whole plasma component',
          howItCompares:
            'The older way of supplying finished clotting factors. It works, but it must be thawed and cross-matched, it corrects the INR far more slowly and less completely than concentrate, and it delivers a large fluid volume to patients who often cannot take one.',
          typicalCost: 'Blood component, priced per unit by the supplying blood service',
          prosAndCons:
            'Pros: universally available, no specialist stock required. Cons: slow to prepare, large volume load, transfusion-related acute lung injury and circulatory overload.',
        },
        {
          name: 'Oral vitamin K for newborn prophylaxis',
          class: 'Same molecule, different route',
          howItCompares:
            'A single oral dose was associated with a 24.5-fold higher risk of vitamin K deficiency bleeding than the intramuscular injection in pooled surveillance data; multiple oral doses were not significantly worse, but the confidence interval is wide. It exists because it avoids an injection, and that is its only advantage.',
          typicalCost: 'Negligible per dose; the same drug substance',
          prosAndCons:
            'Pros: no needle, no anaphylactoid vehicle. Cons: depends on complete adherence to a repeated schedule at home, and the single-dose version performs badly.',
        },
      ],
      naturalFoods: [
        {
          name: 'Green leafy vegetables (kale, spinach, collards, broccoli)',
          activeCompound: 'Phylloquinone (vitamin K1) — chemically identical to the drug',
          biologicalMechanism:
            'Dietary phylloquinone is the same molecule as the injection and feeds the same gamma-glutamyl carboxylase reaction. This is why people on warfarin are told to keep their intake steady rather than to avoid these foods: it is not that greens are dangerous, it is that a changing supply of cofactor moves the INR.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage:
            'Not stated here. The relevant clinical fact is consistency of intake in people taking a vitamin K antagonist, which is a conversation with a prescriber and not a number this page will supply.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC1=C(C(=O)C2=CC=CC=C2C1=O)C/C=C(\\C)/CCC[C@H](C)CCC[C@H](C)CCCC(C)C',
      chemicalFormula: 'C31H46O2',
      molecularWeight: '450.70 g/mol',
      targetReceptorAffinity:
        'Not a receptor ligand. The naphthoquinone head is the chemically active part: it is reduced to a hydroquinone, and the oxidation of that hydroquinone to an epoxide is what powers the carboxylation of glutamate residues. The long phytyl tail is what makes the molecule fat-soluble, which is why absorption fails in obstructive jaundice and why the injectable formulation needs a solubiliser at all.',
      structureSource: {
        label:
          'PubChem CID 5284607 (phylloquinone) — canonical SMILES, molecular formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5284607',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'vitk-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Incoming control of menadiol and phytol, and exclusion of light',
          description:
            'Confirm identity and purity of the naphthoquinone and isoprenoid halves, and establish light-protected handling from the outset. The label states the substance is oxygen sensitive; it is also light sensitive, and the trans double-bond geometry of the tail is the specification that photodegradation destroys.',
          reagentsAndBuffer:
            'Menadiol reference standard, isophytol, amber glassware, nitrogen-sparged solvents, reversed-phase HPLC with UV detection at 248 nm, cis-isomer reference standard',
        },
        {
          id: 'vitk-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Friedel-Crafts alkylation of the naphthoquinone with the phytyl chain',
          description:
            'Couple the isoprenoid tail onto the reduced naphthalenediol under Lewis acid catalysis, then reoxidise to the quinone. The reaction sets the double bond that defines the natural trans isomer, and the cis isomer produced alongside it is inactive as a carboxylase cofactor.',
          dependsOnStepId: 'vitk-w1',
          reagentsAndBuffer:
            'Menadiol or its diacetate, isophytol, boron trifluoride etherate or a solid acid catalyst, anhydrous dioxane, silver oxide or air for reoxidation, nitrogen atmosphere',
        },
        {
          id: 'vitk-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Chromatographic removal of the cis isomer',
          description:
            'Separate trans-phylloquinone from the cis isomer and from unreacted menadione derivatives by chromatography, under light protection throughout. Isomeric ratio, not chemical purity, is the release specification that matters, and it is invisible to a simple assay.',
          dependsOnStepId: 'vitk-w2',
          reagentsAndBuffer:
            'Normal-phase or reversed-phase preparative chromatography, degassed hexane or methanol systems, amber vessels, antioxidant blanket, HPLC method resolving cis and trans phylloquinone',
        },
        {
          id: 'vitk-w4',
          stepNumber: 4,
          phase: 'Conjugation',
          name: 'Emulsification with the polyoxyethylated solubiliser',
          description:
            'Disperse the oil-soluble vitamin into an injectable aqueous emulsion using a polyoxyethylated fatty acid derivative, with dextrose and a preservative. This step, and not the vitamin, is the origin of the boxed warning: the anaphylactoid reactions attributed to intravenous phytonadione are attributed to the solubilising vehicle.',
          dependsOnStepId: 'vitk-w3',
          reagentsAndBuffer:
            'Polyoxyethylated fatty acid derivative, hydrous dextrose, benzyl alcohol as preservative, water for injection, hydrochloric acid for pH adjustment to about 6.3, high-shear homogenisation under nitrogen',
        },
        {
          id: 'vitk-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Carboxylase activity and undercarboxylated prothrombin readout',
          description:
            'Measure gamma-carboxylation directly in a liver microsomal carboxylase assay, and in parallel measure circulating undercarboxylated prothrombin, which is the species that accumulates when the cofactor is missing. Reporting the second matters because the INR — the number everyone actually uses — is an indirect readout of the first and moves hours later.',
          dependsOnStepId: 'vitk-w4',
          reagentsAndBuffer:
            'Rat or bovine liver microsomes, FLEEL pentapeptide substrate, sodium bicarbonate with carbon-14 label, dithiothreitol as reductant; separately, immunoassay for des-gamma-carboxy prothrombin (PIVKA-II) and a standard prothrombin time reagent',
        },
      ],
    },
    keyAudits: [
      {
        id: 'vitk-a1',
        category: 'measured',
        title: 'Surveillance shows a fiftyfold reduction in late newborn bleeding — from no trial',
        laymanSummary:
          'Countries that give the injection at birth report roughly one fiftieth the rate of late vitamin K deficiency bleeding of those that do not. That comparison comes from surveillance programmes, not from a randomised trial, and no randomised trial of it has ever been done.',
        technicalDetails:
          'Sankar and colleagues systematically reviewed the burden of late vitamin K deficiency bleeding and the effect of prophylaxis. The median burden without prophylaxis was 35 per 100,000 live births (interquartile range 10.5 to 80), rising to 80 per 100,000 in low- and middle-income countries against 8.8 per 100,000 in high-income countries. Two randomised trials evaluated intramuscular prophylaxis, but only against classical vitamin K deficiency bleeding: one found a reduction in any bleeding (RR 0.73, 95% CI 0.56 to 0.96) and in moderate-to-severe bleeding (RR 0.19, 95% CI 0.08 to 0.46, number needed to treat 74), and the other a reduction in secondary bleeding after circumcision (RR 0.18, 95% CI 0.08 to 0.42, NNT 9). The reviewers state plainly that no randomised trial has evaluated the effect of vitamin K prophylaxis on late vitamin K deficiency bleeding, which is the outcome the whole practice exists to prevent. The estimate for that outcome comes from four surveillance studies pooled: relative risk 0.02 (95% CI 0.00 to 0.10). They grade the evidence as low quality from observational studies, and still recommend universal intramuscular prophylaxis, because the outcome being prevented is intracranial haemorrhage in a healthy infant.',
        evidenceSource:
          'Sankar MJ, Chandrasekaran A, Kumar P, Thukral A, Agarwal R, Paul VK. Vitamin K prophylaxis for prevention of vitamin K deficiency bleeding: a systematic review. J Perinatol 2016;36(Suppl 1):S29-S35',
        doi: '10.1038/jp.2016.30',
        measuredMetric:
          'Incidence of late vitamin K deficiency bleeding per 100,000 live births, with and without prophylaxis',
        auditFlag: 'verified',
      },
      {
        id: 'vitk-a2',
        category: 'conclusion_shift',
        title: 'The 1992 childhood cancer scare was real, published, and did not survive pooling',
        laymanSummary:
          'A study in 1992 reported that babies given the vitamin K injection were about twice as likely to develop cancer, and recommended switching to oral dosing. A pooled analysis of six studies and nearly nine thousand children found no convincing association.',
        technicalDetails:
          'Golding and colleagues compared 195 children diagnosed with cancer between 1971 and 1991 with 558 controls, all born in two Bristol maternity hospitals. They reported an odds ratio of 1.97 (95% CI 1.3 to 3.0, p=0.002) for intramuscular vitamin K against oral or none, with no increased risk for oral vitamin K (OR 1.15, 95% CI 0.5 to 2.7), and concluded that "the prophylactic benefits against haemorrhagic disease are unlikely to exceed the potential adverse effects from intramuscular vitamin K". Roman and colleagues then pooled individual patient data from six case-control studies in Great Britain and Germany, 2,431 children with cancer and 6,338 controls. Where no written record of vitamin K was found and absence was assumed, adjusted odds ratios were 1.09 (95% CI 0.92 to 1.28) for leukaemia and 1.05 (0.92 to 1.20) for other cancers. Where administration was imputed from hospital policy, the leukaemia estimate rose to 1.21 (1.02 to 1.44) — but the shift did not occur in all studies, and excluding the hypothesis-generating Bristol data returned it to 1.06 (0.89 to 1.25) and 1.16 (0.97 to 1.39) under the two analyses. Their conclusion is that small effects cannot be entirely ruled out but there is no convincing evidence of an association.',
        evidenceSource:
          'Golding J, Greenwood R, Birmingham K, Mott M. Childhood cancer, intramuscular vitamin K, and pethidine given during labour. BMJ 1992;305(6849):341-346; Roman E et al. Vitamin K and childhood cancer: analysis of individual patient data from six case-control studies. Br J Cancer 2002;86(1):63-69',
        doi: '10.1038/sj.bjc.6600007',
        inferredClaim:
          'That intramuscular vitamin K causes childhood leukaemia — an association from a single hypothesis-generating case-control study that the pooled individual patient data did not support',
        auditFlag: 'verified',
      },
      {
        id: 'vitk-a3',
        category: 'failed',
        title:
          'Vitamin K corrects the INR twice as fast as placebo and does not reduce bleeding at all',
        laymanSummary:
          'In 724 patients on warfarin whose blood was too thin but who were not bleeding, low-dose oral vitamin K halved the raised clotting number in a day. Bleeding over the next three months was identical to placebo — and major bleeding was numerically more common on vitamin K.',
        technicalDetails:
          "Crowther and colleagues randomised non-bleeding patients with INR values of 4.5 to 10.0 at 14 anticoagulant clinics in Canada, the United States and Italy to low-dose oral vitamin K (355 assigned, 347 analysed) or matching placebo (369 assigned, 365 analysed). The day after treatment the INR had fallen by a mean of 2.8 on vitamin K against 1.4 on placebo (p<0.001). Over 90 days, at least one bleeding complication occurred in 56 patients (15.8%) on vitamin K and 60 (16.3%) on placebo, absolute difference -0.5 percentage points (95% CI -6.1 to 5.1). Major bleeding occurred in 9 (2.5%) against 4 (1.1%), absolute difference 1.5 percentage points (95% CI -0.8 to 3.7). Thromboembolism occurred in 4 (1.1%) against 3 (0.8%). The authors' conclusion is one sentence long: low-dose oral vitamin K did not reduce bleeding in warfarin recipients with INRs of 4.5 to 10.0. This is the cleanest demonstration in this entire file that correcting a laboratory number is not the same as preventing the event the number predicts.",
        evidenceSource:
          'Crowther MA et al. Oral vitamin K versus placebo to correct excessive anticoagulation in patients receiving warfarin: a randomized trial. Ann Intern Med 2009;150(5):293-300',
        doi: '10.7326/0003-4819-150-5-200903030-00005',
        measuredMetric:
          'Bleeding events over 90 days (primary outcome), and change in INR at 24 hours',
        inferredClaim:
          'That bringing down a raised INR prevents bleeding — the assumption the practice was built on, tested directly and not supported',
        auditFlag: 'verified',
      },
      {
        id: 'vitk-a4',
        category: 'failed',
        title: 'The boxed warning is about the solubiliser, not the vitamin',
        laymanSummary:
          "Vitamin K injection carries the FDA's strongest warning because people have died of anaphylactic-type reactions during and just after intravenous injection. The reactions are attributed to the detergent used to make an oily vitamin injectable, not to the vitamin itself.",
        technicalDetails:
          'The phytonadione injectable emulsion label carries a boxed warning stating that severe reactions including fatalities have occurred during and immediately after intravenous injection, even when the product has been diluted and infused slowly, and following intramuscular administration; that these reactions have typically resembled hypersensitivity or anaphylaxis including shock and cardiac or respiratory arrest; and that some patients reacted on first exposure. The formulation contains a polyoxyethylated fatty acid derivative as solubiliser, with dextrose and benzyl alcohol, at a pH of about 6.3. Riegert-Johnson and Volcheck reviewed 6,572 intravenous doses given over 58 months at a large academic centre under a defined administration protocol and identified two cases of anaphylaxis, an incidence of 3 per 10,000 doses (95% CI 0.04 to 11 per 10,000). They attribute the reaction to the polyethoxylated castor oil vehicle, note that the incidence is comparable to or slightly less than other drugs known to cause anaphylaxis, and recommend against routine pretreatment with antihistamines or corticosteroids.',
        evidenceSource:
          'Phytonadione injectable emulsion USP, FDA-approved prescribing information, boxed warning and description; Riegert-Johnson DL, Volcheck GW. The incidence of anaphylaxis following intravenous phytonadione (vitamin K1): a 5-year retrospective review. Ann Allergy Asthma Immunol 2002;89(4):400-406',
        doi: '10.1016/S1081-1206(10)62042-X',
        measuredMetric: 'Cases of anaphylaxis per intravenous dose administered',
        auditFlag: 'verified',
      },
      {
        id: 'vitk-a5',
        category: 'inferred',
        title: 'It is not a reversal agent, and treating it as one wastes the hours that matter',
        laymanSummary:
          'Vitamin K does not neutralise warfarin and it does not supply clotting factors. It restarts a manufacturing process in the liver, and manufacturing takes hours. For someone bleeding into their head right now, that is the wrong timescale.',
        technicalDetails:
          'Phytonadione acts as the cofactor for gamma-glutamyl carboxylase, so its effect requires new synthesis and carboxylation of factors II, VII, IX and X. The uncarboxylated factors already in circulation are unaffected. The label\'s own clinical pharmacology section frames the indications around "faulty formation" of those four factors rather than around neutralising an anticoagulant. This is why guideline reversal of vitamin K antagonists in major bleeding pairs vitamin K with a source of finished factors — four-factor prothrombin complex concentrate or plasma — rather than using vitamin K alone: the concentrate supplies the factors immediately and is consumed within hours, and the vitamin keeps the liver making them once the concentrate is gone. Neither on its own is sufficient, and the commonest error is to give one and consider the problem solved.',
        evidenceSource:
          'Phytonadione injectable emulsion USP, FDA-approved prescribing information, clinical pharmacology and indications',
        inferredClaim:
          'That vitamin K reverses warfarin — it restores the capacity to make factors, which is a different claim on a different timescale',
        auditFlag: 'caution',
      },
      {
        id: 'vitk-a6',
        category: 'measured',
        title: 'A single oral dose is 24 times worse than the injection in surveillance data',
        laymanSummary:
          'Parents who decline the injection are sometimes offered drops instead. Pooled surveillance data show one oral dose carries about twenty-four times the risk of vitamin K deficiency bleeding compared with the injection. Repeated oral doses did much better, but the estimate is imprecise.',
        technicalDetails:
          'In the same systematic review, a single oral dose of vitamin K carried a relative risk of vitamin K deficiency bleeding of 24.5 (95% CI 7.4 to 81.0) compared with intramuscular prophylaxis. Multiple oral doses did not show a statistically significant increase (RR 3.64, 95% CI 0.82 to 16.3) — but the point estimate is above 3 and the interval reaches 16, so this is a failure to demonstrate a difference rather than a demonstration of equivalence. The mechanism is straightforward: an intramuscular depot releases over weeks, an oral dose is absorbed once and depends on bile for absorption, and a multiple-dose oral schedule depends on the schedule being completed at home.',
        evidenceSource:
          'Sankar MJ et al. Vitamin K prophylaxis for prevention of vitamin K deficiency bleeding: a systematic review. J Perinatol 2016;36(Suppl 1):S29-S35',
        doi: '10.1038/jp.2016.30',
        measuredMetric:
          'Relative risk of vitamin K deficiency bleeding, oral versus intramuscular prophylaxis',
        auditFlag: 'caution',
      },
      {
        id: 'vitk-a7',
        category: 'measured',
        title: 'Both original brands are discontinued; only generics remain',
        laymanSummary:
          'Mephyton tablets, approved in 1955, and AquaMEPHYTON injection, approved in 1960, are both listed as discontinued. The drug is entirely generic now, which is why no brand holder has any reason to run the randomised trial that has never been run.',
        technicalDetails:
          'Drugs@FDA lists MEPHYTON (phytonadione tablets) under NDA 010104, originally approved 30 September 1955, with the product marked discontinued, and AQUAMEPHYTON (phytonadione injectable) under NDA 012223, originally approved 28 June 1960, with all products marked discontinued. Supply is from abbreviated new drug applications. This is a structural observation rather than a clinical one, and it belongs on the page: the evidence gap identified in the 2016 systematic review — no randomised trial against late vitamin K deficiency bleeding — sits on a molecule with no patent, no brand sponsor and no commercial party with a reason to close it.',
        evidenceSource:
          'openFDA Drugs@FDA records for NDA 010104 (MEPHYTON) and NDA 012223 (AQUAMEPHYTON), marketing status as of the August 2026 dataset',
        measuredMetric: 'Marketing status of the two originator applications',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'An oily vitamin has to be forced into an injectable form',
        laymanDesc:
          'Vitamin K1 does not dissolve in water at all. To inject it, it has to be emulsified with a detergent — and that detergent is where the serious allergic reactions come from.',
        molecularDetail:
          'The injectable emulsion contains phytonadione with a polyoxyethylated fatty acid derivative as solubiliser, hydrous dextrose and benzyl alcohol as preservative, at pH about 6.3. The substance is oxygen sensitive. Given by mouth, absorption requires bile salts and normal fat absorption, which is exactly what is missing in obstructive jaundice, biliary fistula and cystic fibrosis — three of the indications on the label.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It is taken up by liver cells and reduced',
        laymanDesc:
          'The vitamin reaches the liver, where it is converted into a chemically reactive form. Only that reduced form can drive the reaction the clotting factors need.',
        molecularDetail:
          'Phylloquinone is reduced to vitamin K hydroquinone (KH2) in the hepatocyte endoplasmic reticulum. The reduction is carried out by VKOR and by NAD(P)H-dependent quinone reductases; the VKOR route is the one warfarin blocks, which is why warfarin causes a functional vitamin K deficiency in the presence of plenty of vitamin K.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The reactive vitamin powers a chemical clip onto four clotting factors',
        laymanDesc:
          'The reduced vitamin is consumed to add a small chemical group to specific spots on the unfinished clotting proteins. That group is what lets them grip calcium.',
        molecularDetail:
          'Gamma-glutamyl carboxylase uses the oxidation of vitamin K hydroquinone to vitamin K 2,3-epoxide to abstract a proton from the gamma carbon of specific glutamate residues, allowing carbon dioxide to be added and producing gamma-carboxyglutamate. Factors II, VII, IX and X, along with proteins C, S and Z, each carry a cluster of these residues in their amino-terminal Gla domain.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'The finished factors can now stick to a damaged vessel wall',
        laymanDesc:
          'The new chemical group lets each factor hold a calcium ion, and the calcium bridges it onto the surface of injured cells. Clotting is a surface reaction, and this is the ticket to the surface.',
        molecularDetail:
          'Gamma-carboxyglutamate residues chelate calcium ions, which bridge the Gla domain to negatively charged phospholipid exposed on activated platelets and damaged endothelium. Colocalisation on that surface accelerates the tenase and prothrombinase reactions by orders of magnitude. Uncarboxylated factors circulate at normal concentration and are functionally inert, which is why the immunoassay for des-gamma-carboxy prothrombin detects deficiency that a factor level does not.',
        iconName: 'Zap',
        visualStage: 'target_binding',
      },
      {
        step: 5,
        title: 'The clotting time normalises — over hours, not minutes',
        laymanDesc:
          'Because the vitamin restarts manufacturing rather than supplying the product, the effect appears as new factors accumulate. That is fine for a raised number on a blood test and much too slow for someone bleeding into their brain.',
        molecularDetail:
          'The INR falls as newly carboxylated factor VII, the shortest-lived of the four, enters the circulation, followed by the others. In the Crowther trial the INR fell by a mean of 2.8 in 24 hours on oral vitamin K against 1.4 on placebo. Over the following 90 days, bleeding events were 15.8% against 16.3% — the number moved and the outcome did not.',
        iconName: 'Clock',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Crowther oral vitamin K versus placebo in over-anticoagulated warfarin patients',
        phase: 'Multicentre randomised double-blind placebo-controlled trial, 14 clinics, 90 days',
        sampleSize: 724,
        primaryEndpoint: 'Bleeding events over 90 days',
        endpointMet: false,
        statisticalPValue:
          '15.8% versus 16.3%, absolute difference -0.5 percentage points (95% CI -6.1 to 5.1). INR fell 2.8 versus 1.4 at 24 hours, p<0.001',
        unreportedAdverseSignals:
          'Major bleeding was numerically higher on vitamin K, 2.5% against 1.1% (absolute difference 1.5 percentage points, 95% CI -0.8 to 3.7). Warfarin dosing after enrolment was neither mandated nor recorded.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'Pooled surveillance estimate of intramuscular vitamin K against late vitamin K deficiency bleeding',
        phase:
          'Four surveillance studies pooled within a systematic review — no randomised trial exists',
        sampleSize: 0,
        primaryEndpoint: 'Incidence of late vitamin K deficiency bleeding',
        endpointMet: true,
        statisticalPValue: 'Pooled relative risk 0.02 (95% CI 0.00 to 0.10)',
        unreportedAdverseSignals:
          'A sample size of zero is the accurate entry for the randomised evidence: the reviewers state that no randomised trial has evaluated the effect of vitamin K prophylaxis on late vitamin K deficiency bleeding. The estimate is observational and graded low quality.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'Randomised trials of intramuscular prophylaxis against classical vitamin K deficiency bleeding',
        phase: 'Two randomised controlled trials identified in the systematic review',
        sampleSize: 0,
        primaryEndpoint:
          'Any bleeding, moderate-to-severe bleeding, and secondary bleeding after circumcision in the first week',
        endpointMet: true,
        statisticalPValue:
          'Any bleeding RR 0.73 (95% CI 0.56-0.96); moderate-to-severe RR 0.19 (0.08-0.46), NNT 74; post-circumcision bleeding RR 0.18 (0.08-0.42), NNT 9',
        unreportedAdverseSignals:
          'Participant counts for the two individual trials are not stated in the review abstract, so the sample size field is left at zero rather than guessed. These trials address classical, not late, vitamin K deficiency bleeding.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId:
          'Golding Bristol case-control study of childhood cancer and intramuscular vitamin K',
        phase: 'Hospital-based case-control study, cases diagnosed 1971-1991',
        sampleSize: 753,
        primaryEndpoint:
          'Odds of childhood cancer after intramuscular vitamin K compared with oral or none',
        endpointMet: true,
        statisticalPValue: 'Odds ratio 1.97 (95% CI 1.3 to 3.0), p = 0.002',
        unreportedAdverseSignals:
          'This is the hypothesis-generating study. Pooled individual patient data from six studies (2,431 cases, 6,338 controls) did not confirm it, and excluding the Bristol data returned the leukaemia odds ratio to 1.06 (0.89-1.25).',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'Riegert-Johnson and Volcheck retrospective review of intravenous phytonadione',
        phase: 'Single-centre retrospective review over 58 months',
        sampleSize: 6572,
        primaryEndpoint: 'Incidence of anaphylaxis per intravenous dose administered',
        endpointMet: true,
        statisticalPValue: '2 cases in 6,572 doses — 3 per 10,000 (95% CI 0.04 to 11 per 10,000)',
        unreportedAdverseSignals:
          'The sample size is doses, not patients. A defined administration protocol was in place throughout, so this is the incidence under controlled administration rather than under routine practice.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A pooled relative risk of 0.02 (95% CI 0.00 to 0.10) for late vitamin K deficiency bleeding with intramuscular prophylaxis, from four surveillance studies',
        'Median late vitamin K deficiency bleeding burden of 35 per 100,000 live births without prophylaxis, 80 per 100,000 in low- and middle-income countries',
        'A mean INR fall of 2.8 in 24 hours on oral vitamin K against 1.4 on placebo in 724 randomised patients',
        'Anaphylaxis in 2 of 6,572 intravenous doses, 3 per 10,000 (95% CI 0.04 to 11 per 10,000)',
        'A relative risk of 24.5 (95% CI 7.4 to 81.0) for vitamin K deficiency bleeding with a single oral dose compared with intramuscular prophylaxis',
      ],
      unsupportedInferences: [
        'That correcting a raised INR prevents bleeding — the randomised trial designed to show it found 15.8% against 16.3% over 90 days',
        'That the newborn prophylaxis benefit has been demonstrated in a randomised trial — for late vitamin K deficiency bleeding, the outcome the practice exists to prevent, none has ever been run',
        'That vitamin K reverses warfarin — it restores the ability to make factors, and does nothing about the uncarboxylated factors already circulating',
        'That intramuscular vitamin K causes childhood leukaemia — a 1992 case-control finding that pooled individual patient data from six studies did not support',
      ],
      whatFailedInitially: [
        'The Golding case-control study reported an odds ratio of 1.97 for childhood cancer after intramuscular vitamin K and recommended switching to oral prophylaxis; the pooled reanalysis a decade later found no convincing association',
        "Crowther's randomised trial found no reduction in bleeding despite halving the INR, with major bleeding numerically higher on vitamin K",
        'The injectable formulation carries a boxed warning for fatal anaphylactoid reactions attributed to its solubilising vehicle rather than to the vitamin',
        'Both originator applications — Mephyton tablets from 1955 and AquaMEPHYTON injection from 1960 — are listed as discontinued',
      ],
      realWorldOutcome: [
        'Given once at birth to essentially every infant born in a country with a functioning maternity service, on the strength of surveillance evidence graded low quality',
        'Paired with prothrombin complex concentrate or plasma for major bleeding on a vitamin K antagonist, because on its own it is too slow',
        'Entirely generic, with no brand sponsor and therefore no commercial party with a reason to run the randomised trial the 2016 review identified as missing',
      ],
    },
    deliverySystem: {
      type: 'Injectable emulsion for subcutaneous, intramuscular or intravenous use, and oral tablets',
      description:
        'The label restricts the intravenous and intramuscular routes to situations where the subcutaneous route is not feasible and the risk is judged justified. Newborn prophylaxis is a single intramuscular injection. Oral absorption requires bile, so the oral route fails in exactly the malabsorption states that cause the deficiency.',
      safetyProfile:
        'A boxed warning for severe reactions including fatalities during and immediately after intravenous injection, and also after intramuscular administration, typically resembling hypersensitivity or anaphylaxis with shock and cardiac or respiratory arrest, sometimes on first exposure. Measured incidence under a defined protocol was 3 per 10,000 intravenous doses. The reactions are attributed to the polyoxyethylated solubiliser. The formulation contains benzyl alcohol. In patients on a vitamin K antagonist, correction can be excessive and leave them resistant to re-anticoagulation for a period.',
    },
    commonQuestions: [
      {
        q: 'Does the newborn injection cause cancer?',
        a: 'The evidence says no, and the reason people ask is a real published study. In 1992, Golding and colleagues in Bristol compared 195 children with cancer against 558 controls and found roughly double the odds of cancer among those given the intramuscular injection, recommending oral dosing instead. That finding was taken seriously and investigated properly. Roman and colleagues pooled the individual records of 2,431 children with cancer and 6,338 controls across six studies in Britain and Germany. Adjusted odds ratios for leukaemia were 1.09 in the primary analysis, and when the original hypothesis-generating Bristol data were removed the estimate sat at 1.06. Their conclusion is that small effects cannot be entirely ruled out but there is no convincing evidence of an association. That is the honest state of it: a scare that was worth checking, checked, and not confirmed.',
        auditNote:
          'This is a model of how a safety signal should be handled, and the page keeps both halves — the original finding and its non-replication — rather than deleting the first.',
      },
      {
        q: 'Has a randomised trial ever shown the newborn injection works?',
        a: 'Not for the bleeding it is actually given to prevent. Two randomised trials tested intramuscular vitamin K against classical vitamin K deficiency bleeding in the first week, and both were positive. But late vitamin K deficiency bleeding — the bleeding into the brain that occurs weeks after birth and kills or disables a large fraction of the infants it affects — has never been the subject of a randomised trial. The 2016 systematic review says so directly. The evidence for it is four surveillance studies pooled, giving a relative risk of 0.02, graded low quality. The reviewers still recommend universal prophylaxis, and the reasoning is not statistical: the harm being prevented is catastrophic, the intervention is a single injection, and there is no plausible route to a placebo-controlled trial now.',
        auditNote:
          'A low-quality evidence base and a correct recommendation are not incompatible. Saying which one you are looking at is the job.',
      },
      {
        q: 'Does vitamin K reverse warfarin?',
        a: 'Not in the sense most people mean. Warfarin works by blocking the enzyme that recycles vitamin K, so giving vitamin K overwhelms the block and lets the liver start making working clotting factors again. But making them takes hours, and the defective factors already in the blood are unaffected. For someone bleeding badly right now, that is the wrong timescale — which is why guidelines pair vitamin K with a source of finished clotting factors, usually four-factor prothrombin complex concentrate. The concentrate works in minutes and is used up in hours; the vitamin keeps production going after it is gone. Giving one without the other is the classic error.',
      },
      {
        q: 'My INR is high but I am not bleeding. Should I take vitamin K?',
        a: "That exact question was randomised. Crowther and colleagues enrolled 724 non-bleeding patients on warfarin with INR values between 4.5 and 10 and gave half of them low-dose oral vitamin K and half a placebo. The vitamin K group's INR fell twice as far in the first day. Over the next 90 days, 15.8% of the vitamin K group and 16.3% of the placebo group had a bleeding complication — no difference — and major bleeding was numerically more common in the vitamin K arm, 2.5% against 1.1%. The trial does not tell you what to do, and this page will not either; it tells you that the number moving is not the same as the risk moving.",
        auditNote:
          'The single most useful trial on this page, and the one that most directly undermines the reason the drug is given in this situation.',
      },
      {
        q: "Why does the injection carry the FDA's strongest warning?",
        a: "Because people have died from anaphylactic-type reactions during and immediately after intravenous injection, sometimes on first exposure, and the boxed warning says so in those words. The reactions are attributed not to vitamin K but to the polyoxyethylated detergent needed to make an oil-soluble vitamin injectable at all. A five-year review of 6,572 intravenous doses at one academic centre found two cases, an incidence of 3 per 10,000 doses, which the authors describe as comparable to or slightly less than other drugs known to cause anaphylaxis. The label's response is to restrict the intravenous and intramuscular routes to situations where the subcutaneous route is not feasible.",
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Sankar MJ, Chandrasekaran A, Kumar P, Thukral A, Agarwal R, Paul VK. Vitamin K prophylaxis for prevention of vitamin K deficiency bleeding: a systematic review. J Perinatol 2016;36(Suppl 1):S29-S35',
        identifier: '10.1038/jp.2016.30',
        kind: 'doi',
      },
      {
        label:
          'Crowther MA, Ageno W, Garcia D, et al. Oral vitamin K versus placebo to correct excessive anticoagulation in patients receiving warfarin: a randomized trial. Ann Intern Med 2009;150(5):293-300',
        identifier: '10.7326/0003-4819-150-5-200903030-00005',
        kind: 'doi',
      },
      {
        label:
          'Golding J, Greenwood R, Birmingham K, Mott M. Childhood cancer, intramuscular vitamin K, and pethidine given during labour. BMJ 1992;305(6849):341-346',
        identifier: '10.1136/bmj.305.6849.341',
        kind: 'doi',
      },
      {
        label:
          'Roman E, Fear NT, Ansell P, et al. Vitamin K and childhood cancer: analysis of individual patient data from six case-control studies. Br J Cancer 2002;86(1):63-69',
        identifier: '10.1038/sj.bjc.6600007',
        kind: 'doi',
      },
      {
        label:
          'Riegert-Johnson DL, Volcheck GW. The incidence of anaphylaxis following intravenous phytonadione (vitamin K1): a 5-year retrospective review. Ann Allergy Asthma Immunol 2002;89(4):400-406',
        identifier: '10.1016/S1081-1206(10)62042-X',
        kind: 'doi',
      },
      {
        label:
          'Phytonadione injectable emulsion USP — FDA-approved prescribing information, boxed warning, description and clinical pharmacology, retrieved from the openFDA drug label endpoint',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22PHYTONADIONE%22',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA: MEPHYTON (phytonadione tablets), NDA 010104, original approval 30 September 1955; product discontinued',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=010104',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA: AQUAMEPHYTON (phytonadione injectable), NDA 012223, original approval 28 June 1960; all products discontinued',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=012223',
        kind: 'regulatory',
      },
      {
        label:
          'PubChem CID 5284607 — phylloquinone structure, molecular formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5284607',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 5. Protamine sulfate — fifty-seven years of universal use, and one placebo-controlled trial.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'protamine',
    name: 'Protamine Sulfate',
    sponsor:
      'Eli Lilly and Company held the original NDA 006460, approved 13 August 1969 and since discontinued; the marketed United States product is Fresenius Kabi USA under ANDA 089454',
    targetGene:
      'None. The target is heparin, a sulfated polysaccharide drug, and no gene encodes it',
    targetProtein:
      'Unfractionated heparin itself. Protamine neutralises it by ionic complexation between its arginine side chains and heparin sulfate groups, not by binding any receptor or enzyme',
    modality: 'Recombinant Protein / Biologic',
    approvalStatus: 'FDA Approved',
    approvalYear: 1969,
    indication: 'Treatment of heparin overdosage',
    patientFriendlyIndication:
      'Switching off heparin when someone has had too much of it, or when the operation using it has finished',
    anatomicalSite: 'Blood plasma. The drug never enters a cell and has no intracellular target',
    conditionContext: {
      conditionExplainer:
        'Heparin does not thin blood by itself. It works by grabbing a natural brake called antithrombin and making it thousands of times faster at shutting down the enzymes that build a clot. Heparin is one of the most negatively charged molecules in biology, and that charge is what lets it grip antithrombin.',
      whyItMatters:
        'Every heart-lung bypass machine runs on heparin, because blood clots the moment it touches plastic tubing. At the end of the operation the heparin has to come off, or the patient bleeds. Protamine is the only agent licensed anywhere to do that, which means it has never had to compete for the job.',
      whoTakesThis:
        'Given in the operating theatre and the catheterisation laboratory by anaesthetists and cardiologists, at the end of cardiopulmonary bypass, after vascular and structural heart procedures, and occasionally on the ward for accidental heparin overdose.',
      clinicalGoals:
        'Return the activated clotting time to its pre-heparin value and stop the puncture site bleeding. No licensing trial used death or transfusion as an endpoint.',
    },
    oneSentenceVerdict:
      'A salmon-sperm peptide so densely positively charged that it sticks to heparin and cancels it by pure electrostatics, licensed in 1969 on a clotting-time reading and only randomised against placebo half a century later, in a 410-patient valve trial where it raised the rate of successful haemostasis from 91.6% to 97.9% — while a separate randomised trial showed that giving too much of it makes patients bleed more, not less.',
    laymanHowItWorks:
      'Heparin is one of the most negatively charged molecules the body ever encounters. Protamine is a short peptide that is almost nothing but arginine, an amino acid that carries a positive charge. Put the two in the same bloodstream and they snap together like magnets, forming a stable salt in which neither one works any more. The complex is then cleared, and clotting resumes within about five minutes.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 64,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$1.53 per 10 mg of average Medicare Part B spending in 2024 under HCPCS J2720, against a 2024 average sales price of US$1.438 per 10 mg',
      markupEstimate:
        'Not calculable. No published per-dose cost of production exists for this peptide, so there is no denominator to divide the Medicare figure by.',
      openPatentNotes:
        'Off patent for decades. The original Lilly NDA is discontinued and every marketed United States product is an abbreviated application, the oldest of them from 1986. The drug is extracted from the sperm of salmonid fish rather than synthesised, and that single-source biological supply chain is why protamine goes into national shortage more often than its price would suggest.',
      synthesisComplexity: 'Moderate',
      costSource: NO_COST_STUDY_SOURCE,
      priceSource: CMS_PART_B_SOURCE,
    },
    substitutes: {
      summary:
        'There is no second agent. Protamine is the only licensed heparin antidote in any major jurisdiction, and the alternatives are all either withdrawn, unapproved or non-pharmacological: heparinase I was taken into trials and abandoned, methylene blue and hexadimethrine were dropped for toxicity, and the practical fallback is to stop the heparin and wait out its short half-life while supporting the patient with blood products.',
      conventionalRx: [
        {
          name: 'Waiting for heparin to clear, with transfusion support',
          class: 'Supportive management, no antidote',
          howItCompares:
            'Unfractionated heparin has a short and dose-dependent half-life, so anticoagulation resolves without treatment in a patient who can afford to wait. This is the only option in someone with a documented protamine anaphylaxis history, and it is not an option at all at the end of cardiopulmonary bypass.',
          typicalCost:
            'The cost of the blood products used, which varies with how much the patient bleeds while waiting.',
          prosAndCons:
            'Pros: no anaphylaxis risk, no rebound. Cons: does nothing for an actively bleeding surgical field, and is unusable in the setting where protamine is actually given.',
        },
        {
          name: 'Andexanet alfa, idarucizumab and other targeted reversal agents',
          class: 'Anticoagulant-specific reversal agents',
          howItCompares:
            'They reverse different drugs, not heparin. Idarucizumab binds dabigatran and andexanet alfa decoys factor Xa inhibitors; neither touches unfractionated heparin. They are listed here because readers looking for a reversal agent frequently land on the wrong one.',
          typicalCost:
            'Both are hospital-supplied biologics whose acquisition cost is orders of magnitude above protamine.',
          prosAndCons:
            'Pros: each is specific to the drug it was designed for. Cons: giving either to a heparinised patient does nothing at all.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'peptide_sequence',
      sequence5to3: 'MPRRRRSSSRPVRRRRRPRVSRRRRRRGGRRRR',
      molecularWeight:
        '4,381 Da for the UniProt P69014 salmine-AI entry shown here; the initiator methionine is removed in the mature 32-residue chain, and the licensed drug is a mixture of closely related arginine-rich peptides standardised by heparin-neutralising potency rather than by mass',
      targetReceptorAffinity:
        'Not a receptor interaction and not expressible as a dissociation constant. Binding is charge-driven complexation between roughly twenty arginine residues and the sulfate and carboxylate groups of the heparin chain.',
      structureSource: {
        label:
          'UniProtKB P69014 (PRT1_ONCKE) — protamine, salmine-AI, Oncorhynchus keta; 33-residue sequence, initiator methionine removed, 4,381 Da',
        identifier: 'https://rest.uniprot.org/uniprotkb/P69014',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'prot-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Species identity and viral-safety control of the salmonid milt',
          description:
            'Confirm the fish species and the absence of adventitious agents in the incoming sperm before extraction. This is the step that distinguishes protamine from a synthetic drug: the raw material is an animal tissue, and its identity is established at goods-in rather than by a synthetic route.',
          reagentsAndBuffer:
            'Frozen salmonid milt, species-specific PCR primers, bioburden and endotoxin testing, cold acid extraction buffer',
        },
        {
          id: 'prot-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Acid extraction of the protamine fraction from sperm chromatin',
          description:
            'Protamine replaces histone in mature fish sperm, packing the DNA into a near-crystalline state. Dilute acid dissociates the peptide from the DNA and releases it into solution. Nothing is built in this step; the molecule is removed from the nucleus it was already in.',
          dependsOnStepId: 'prot-w1',
          reagentsAndBuffer:
            'Dilute sulfuric or hydrochloric acid, cold homogenisation buffer, protease inhibitors, centrifugation to clear the DNA pellet',
        },
        {
          id: 'prot-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Cation-exchange capture and precipitation as the sulfate salt',
          description:
            'The extreme positive charge that makes the peptide a heparin antidote also makes it trivial to capture on a cation exchanger. It is eluted at high salt and precipitated as the sulfate. Residual DNA and host protein are the two impurities the monograph is written around.',
          dependsOnStepId: 'prot-w2',
          reagentsAndBuffer:
            'Strong cation-exchange resin, sodium chloride gradient, sulfuric acid for salt formation, ethanol precipitation, reversed-phase HPLC for peptide profile',
        },
        {
          id: 'prot-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Plasma complexation and clearance of the heparin-protamine salt',
          description:
            'Confirm the complex forms in whole blood and is removed from circulation. The label states that neutralisation occurs within five minutes of intravenous administration and that the metabolic fate of the complex has not been elucidated, which is an unusual admission for a drug in its sixth decade.',
          dependsOnStepId: 'prot-w3',
          reagentsAndBuffer:
            'Fresh heparinised human whole blood, activated clotting time cartridges, anti-factor-Xa chromogenic assay, turbidimetric complex-formation readout',
        },
        {
          id: 'prot-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'United States Pharmacopeia heparin-neutralising potency assay',
          description:
            'Potency is defined functionally, not by mass: one milligram must neutralise a specified number of heparin units in a clotting assay. Reporting both the potency and the intrinsic anticoagulant effect of the peptide alone matters, because excess protamine is itself an anticoagulant.',
          dependsOnStepId: 'prot-w4',
          reagentsAndBuffer:
            'USP heparin sodium reference standard, pooled citrated sheep or human plasma, thrombin time and activated clotting time endpoints, rotational thromboelastometry for the intrinsic-effect arm',
        },
      ],
    },
    keyAudits: [
      {
        id: 'prot-a1',
        category: 'measured',
        title: 'The first placebo-controlled trial of protamine was published in 2024',
        laymanSummary:
          'In 410 patients having a heart valve replaced through the groin, protamine or a dummy injection was given at the end. Successful haemostasis went from 91.6% on placebo to 97.9% on protamine, and bleeding and vascular complications at 30 days fell.',
        technicalDetails:
          'ACE-PROTAVI was an investigator-initiated, double-blind, placebo-controlled randomised trial at three Australian hospitals, December 2021 to June 2023, in patients undergoing transfemoral transcatheter aortic valve implantation. Of 410 randomised, 199 received protamine and 211 placebo. Haemostasis success was 188 of 192 (97.9%) against 186 of 203 (91.6%), an absolute risk difference of 6.3% (95% CI 2.0% to 10.6%, p=0.006). Median time to haemostasis was 181 seconds (IQR 120-420) against 279 seconds (IQR 122-600), p=0.002. The major secondary composite of death, bleeding and vascular complications at 30 days occurred in 10 of 192 (5.2%) against 26 of 203 (12.8%), OR 0.37 (95% CI 0.1 to 0.8, p=0.01), predominantly driven by minor vascular complications. The investigators report no adverse events associated with protamine use. This is a percutaneous valve population, not the cardiopulmonary bypass population the drug is mostly used in.',
        evidenceSource:
          'Vriesendorp PA, Nanayakkara S, Heuts S, et al. Routine Protamine Administration for Bleeding in Transcatheter Aortic Valve Implantation: The ACE-PROTAVI Randomized Clinical Trial. JAMA Cardiol 2024;9(10):901-908',
        doi: '10.1001/jamacardio.2024.2454',
        measuredMetric:
          'Rate of haemostasis success and time to haemostasis after transfemoral valve implantation',
        auditFlag: 'verified',
      },
      {
        id: 'prot-a2',
        category: 'inferred',
        title: 'Nobody has ever randomised protamine against placebo in cardiac surgery',
        laymanSummary:
          'The place protamine is used most, and the place it was licensed for, is the end of a heart-lung bypass operation. There is no placebo-controlled trial there, and there never will be, because withholding it is not considered testable.',
        technicalDetails:
          'The FDA-approved indication is the single sentence "treatment of heparin overdosage", granted to Eli Lilly under NDA 006460 on 13 August 1969, before the 1962 efficacy requirements were applied retrospectively to most older products. The randomised evidence that exists is in percutaneous procedures where the comparator is a short wait rather than an open chest: ACE-PROTAVI and PS TAVI. Within cardiac surgery the randomised literature compares protamine doses against each other, never against nothing. The 2008 systematic review that went looking found only 25 studies conducted in an evidence-based manner across the entire literature, of which three had what the reviewers considered an optimal design.',
        evidenceSource:
          'Drugs@FDA record for NDA 006460 (PROTAMINE SULFATE, Eli Lilly), original approval 13 August 1969; Nybo M, Madsen JS. Basic Clin Pharmacol Toxicol 2008;103(2):192-196',
        doi: '10.1111/j.1742-7843.2008.00274.x',
        inferredClaim:
          'That the haemostatic benefit measured in transcatheter valve patients is the benefit obtained at the end of cardiopulmonary bypass — a transfer between two populations whose bleeding risk, heparin dose and surgical field have almost nothing in common',
        auditFlag: 'caution',
      },
      {
        id: 'prot-a3',
        category: 'failed',
        title: 'Too much of the antidote causes the bleeding it was given to stop',
        laymanSummary:
          'Patients randomised to the higher protamine dose bled more, not less: 615 mL over 24 hours against 470 mL on the lower dose. More of them needed plasma and platelets. The clotting time looked the same in both groups, which is exactly the problem.',
        technicalDetails:
          'Meesters et al. randomised 96 on-pump coronary bypass patients to a protamine-to-heparin dosing ratio of 0.8 (n=49) or 1.3 (n=47) in an open-label, multicentre, single-blinded trial. The low-ratio group received 329 ± 95 mg against 539 ± 117 mg (p<0.001), yet post-protamine activated clotting times were similar between groups. The high-dose group had longer intrinsic clotting times on thromboelastometry (236 ± 74 s versus 196 ± 64 s, p=0.006), and maximum post-protamine thrombin generation was suppressed far more (6 ± 9% of baseline versus 38 ± 40%, p=0.001). Twenty-four-hour blood loss was 615 mL (95% CI 500 to 830) against 470 mL (95% CI 420 to 530), p=0.021. Fresh frozen plasma went to 11% versus 0% (p=0.02) and platelet concentrate to 21% versus 6% (p=0.04). The activated clotting time, which is the number the dose is titrated against in most operating theatres, did not detect any of this.',
        evidenceSource:
          'Meesters MI, Veerhoek D, de Lange F, et al. Effect of high or low protamine dosing on postoperative bleeding following heparin anticoagulation in cardiac surgery. A randomised clinical trial. Thromb Haemost 2016;116(2):251-261',
        doi: '10.1160/TH16-02-0117',
        measuredMetric:
          'Twenty-four-hour postoperative blood loss, thrombin generation and transfusion rates at two protamine-to-heparin dosing ratios',
        auditFlag: 'verified',
      },
      {
        id: 'prot-a4',
        category: 'conclusion_shift',
        title: 'The field abandoned the ratio it dosed by for forty years',
        laymanSummary:
          'Protamine was traditionally matched milligram-for-milligram against the heparin given. A blinded trial gave one group a flat dose instead and found the clotting time and the bleeding identical, while the matched group received roughly two extra vials each.',
        technicalDetails:
          'Jain et al. ran a single-centre, double-blinded randomised trial in 125 elective adult cardiac surgical patients receiving at least 27,500 units of initial heparin, comparing a fixed 250 mg protamine dose (n=62) against a 1 mg per 100 unit ratio-based dose (n=63). The mean post-protamine activated clotting time did not differ (-2.0 s; 95% CI -7.2 to 3.3; p=0.47). The fixed-dose group used 2.1 fewer 50 mg vials per case (95% CI -2.4 to -1.8; p<0.0001). Cumulative 24-hour chest tube output did not differ (-77 mL; 95% CI -220 to 65; p=0.28). Read alongside Meesters, the direction of travel is unambiguous: the ratio-based convention that governed practice for decades delivers more drug than the physiology needs, and the intrinsic anticoagulant effect of the excess is a real harm rather than a textbook footnote. The trial was single-centre and excluded patients already anticoagulated or coagulopathic.',
        evidenceSource:
          'Jain P, Silva-De Las Salas A, Bedi K, Lamelas J, Epstein RH, Fabbro M 2nd. Protamine Dosing for Heparin Reversal after Cardiopulmonary Bypass: A Double-blinded Prospective Randomized Control Trial Comparing Two Strategies. Anesthesiology 2025;142(1):98-106',
        doi: '10.1097/ALN.0000000000005256',
        inferredClaim:
          'That neutralising heparin unit-for-unit is the correct target — a dosing convention that survived four decades on arithmetic rather than on a trial, and that both randomised comparisons now contradict',
        auditFlag: 'verified',
      },
      {
        id: 'prot-a5',
        category: 'failed',
        title: 'The trial that tried to show protamine prevents major bleeding did not',
        laymanSummary:
          'A Polish trial randomised 100 valve patients to protamine or saline and looked at serious bleeding in the first two days. Bleeding was lower on protamine, but not by enough to rule out chance.',
        technicalDetails:
          'PS TAVI was a single-centre, single-blind, randomised placebo-controlled trial at the Medical University of Warsaw. Of 311 patients screened between December 2016 and July 2020, 100 met the inclusion criteria and 47 were randomised to protamine sulfate. The primary endpoint, a composite of life-threatening and major bleeding by Valve Academic Research Consortium criteria within 48 hours, occurred in 29% of the population overall: 21% on protamine against 36% on placebo, OR 0.48 (95% CI 0.2 to 1.2, p=0.11). No secondary endpoint differed significantly. The authors conclude that routine protamine did not significantly decrease major and life-threatening bleeding and that larger studies are required. The effect estimate points the same way as ACE-PROTAVI; the trial was a quarter of the size.',
        evidenceSource:
          'Zbroński K, Grodecki K, Gozdowska R, et al. Protamine sulfate during transcatheter aortic valve implantation (PS TAVI) - a single-center, single-blind, randomized placebo-controlled trial. Kardiol Pol 2021;79(9):995-1002',
        doi: '10.33963/KP.a2021.0070',
        measuredMetric:
          'Composite of life-threatening and major bleeding by VARC criteria within 48 hours of valve implantation',
        auditFlag: 'caution',
      },
      {
        id: 'prot-a6',
        category: 'inferred',
        title: 'Blood pressure changes after protamine track with death, and nobody knows why',
        laymanSummary:
          'In nearly 7,000 bypass patients, the bigger the drop in blood pressure and the bigger the rise in lung artery pressure after protamine, the higher the chance of dying in hospital. The link held even for small changes. It is an association, not a demonstrated cause.',
        technicalDetails:
          'Welsby et al. analysed 6,921 coronary bypass patients at a single university hospital using automated anaesthesia records. Degree-duration integrals of systemic hypotension below 100 mmHg and pulmonary hypertension above 30 mmHg over the 30 minutes after protamine were tested against in-hospital mortality in logistic models adjusted for risk factors. Overall mortality was 2%. Each 150 mmHg-minute increment carried an odds ratio of 1.28 for systemic hypotension (95% CI 1.14 to 1.43, p<0.001) and 1.27 for pulmonary hypertension (95% CI 1.06 to 1.48, p<0.001). Proximity of the haemodynamic response to the protamine dose strengthened the relation, and it persisted after excluding major disturbances. The authors state explicitly that randomised trials are necessary to address causality, and none has been done. Separately, the systematic review of anaphylaxis found an incidence of 0.69% in prospective studies against 0.19% in retrospective ones, with pronounced heterogeneity.',
        evidenceSource:
          'Welsby IJ, Newman MF, Phillips-Bute B, Messier RH, Kakkis ED, Stafford-Smith M. Hemodynamic changes after protamine administration: association with mortality after coronary artery bypass surgery. Anesthesiology 2005;102(2):308-314',
        doi: '10.1097/00000542-200502000-00011',
        measuredMetric:
          'Degree-duration integrals of systemic hypotension and pulmonary hypertension in the 30 minutes after protamine, against in-hospital mortality',
        inferredClaim:
          'That the haemodynamic reaction causes the excess deaths rather than marking the patients who were already sickest — an unresolved question in an observational cohort',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'It is injected slowly into a vein, and slowness is the whole safety strategy',
        laymanDesc:
          'Given straight into the bloodstream at the end of the operation. The rate matters more than almost anything else about it: pushed fast, it can drop the blood pressure to nothing.',
        molecularDetail:
          'The FDA label carries a boxed warning naming severe hypotension, cardiovascular collapse, noncardiogenic pulmonary oedema, catastrophic pulmonary vasoconstriction and pulmonary hypertension, and lists rapid administration and high dose among the risk factors. Complement activation by the heparin-protamine complex, lysosomal enzyme release from neutrophils and thromboxane generation are the mechanisms the label associates with anaphylactoid reactions.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It stays in the bloodstream — there is nothing for it to do inside a cell',
        laymanDesc:
          'Its target is another drug floating in the plasma, so it never has to cross a membrane or enter tissue. Everything happens in the blood.',
        molecularDetail:
          'Protamine is a peptide of about 32 residues carrying roughly twenty arginines, giving it one of the highest positive charge densities in pharmacology. That charge makes membrane crossing energetically prohibitive, which is why the drug has no intracellular pharmacology and why its distribution volume is essentially the plasma space.',
        iconName: 'Droplet',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Positive meets negative and the two drugs lock together',
        laymanDesc:
          'Heparin is the most negatively charged molecule in the bloodstream. Protamine is almost pure positive charge. They snap together into a stable salt, and inside that salt neither one works.',
        molecularDetail:
          'The label states that protamine has an anticoagulant effect when given alone, but that in the presence of heparin a stable salt is formed and the anticoagulant activity of both drugs is lost. Binding is a cooperative electrostatic interaction along the length of the heparin chain rather than a defined receptor contact, which is why potency is specified as heparin units neutralised per milligram and not as an affinity constant.',
        iconName: 'Zap',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Antithrombin is released and clotting restarts',
        laymanDesc:
          'Heparin worked by supercharging a natural brake on clotting. Pulled away into the complex, it stops supercharging anything, and the brake returns to its normal slow speed.',
        molecularDetail:
          'Heparin accelerates antithrombin inactivation of thrombin and factor Xa by several orders of magnitude through a template and conformational mechanism. Sequestering the polysaccharide removes that acceleration. The label reports neutralisation within five minutes of an appropriate intravenous dose, and adds that the metabolic fate of the heparin-protamine complex has not been elucidated.',
        iconName: 'ShieldOff',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The clotting time comes back — and past that point the drug turns on you',
        laymanDesc:
          'Once all the heparin is bound, any protamine left over is itself a mild blood thinner and a platelet poison. That is not a theoretical concern: the higher-dose arm of a randomised trial bled more.',
        molecularDetail:
          'Free protamine impairs thrombin generation and platelet function. In the Meesters trial the high-ratio arm had maximum post-protamine thrombin generation suppressed to 6 ± 9% of baseline against 38 ± 40% in the low-ratio arm (p=0.001), longer intrinsic clotting times, and 615 mL versus 470 mL of 24-hour blood loss (p=0.021), while activated clotting times were indistinguishable between the groups.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Heparin can come back hours later',
        laymanDesc:
          'Sometimes the bleeding returns half an hour to eighteen hours after surgery even though the heparin looked fully neutralised at the end. The label says so and does not explain it.',
        molecularDetail:
          'The FDA label reports hyperheparinaemia or bleeding in experimental animals and in some patients 30 minutes to 18 hours after cardiopulmonary bypass despite complete neutralisation by an adequate protamine dose. The label directs continued observation and repeat coagulation studies. The proposed explanations, including partial metabolism of the complex or attack on it by fibrinolysin, are stated in the label as postulates rather than findings.',
        iconName: 'Repeat',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'ACE-PROTAVI (ACTRN12621001261808) — routine protamine after transfemoral TAVI',
        phase: 'Investigator-initiated double-blind placebo-controlled randomised trial, 3 centres',
        sampleSize: 410,
        primaryEndpoint: 'Co-primary: rate of haemostasis success, and time to haemostasis',
        endpointMet: true,
        statisticalPValue:
          'Haemostasis success 97.9% versus 91.6%, absolute risk difference 6.3% (95% CI 2.0% to 10.6%), p = 0.006; median time to haemostasis 181 s versus 279 s, p = 0.002',
        unreportedAdverseSignals:
          'Both primary endpoints are procedural surrogates. The 30-day composite benefit (OR 0.37, 95% CI 0.1 to 0.8) was driven predominantly by minor vascular complications, not by death or major bleeding.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId:
          'PS TAVI — protamine sulfate versus saline during transcatheter aortic valve implantation',
        phase: 'Single-centre single-blind randomised placebo-controlled trial',
        sampleSize: 100,
        primaryEndpoint:
          'Composite of life-threatening and major bleeding by VARC criteria within 48 hours',
        endpointMet: false,
        statisticalPValue: 'OR 0.48, 95% CI 0.2 to 1.2, p = 0.11',
        unreportedAdverseSignals:
          '311 patients were screened to randomise 100, so the enrolled population is a narrow slice of the procedural population. No secondary endpoint reached significance.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Meesters protamine-to-heparin dosing ratio trial (0.8 versus 1.3)',
        phase: 'Open-label multicentre single-blinded randomised controlled trial',
        sampleSize: 96,
        primaryEndpoint: 'Twenty-four-hour postoperative blood loss',
        endpointMet: true,
        statisticalPValue:
          '615 mL (95% CI 500 to 830) on the high ratio versus 470 mL (95% CI 420 to 530) on the low ratio, p = 0.021',
        unreportedAdverseSignals:
          'The endpoint was met in the direction opposite to the one a reader assumes: more antidote produced more bleeding. Post-protamine activated clotting times were similar in both arms, so the monitoring test used in routine practice was blind to the harm.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Jain fixed-dose versus ratio-based protamine after cardiopulmonary bypass',
        phase: 'Single-centre double-blinded randomised controlled trial',
        sampleSize: 125,
        primaryEndpoint: 'Activated clotting time after the initial protamine dose',
        endpointMet: true,
        statisticalPValue:
          'Difference in mean post-protamine activated clotting time -2.0 s (95% CI -7.2 to 3.3), p = 0.47; 2.1 fewer 50 mg vials per case on fixed dosing (95% CI -2.4 to -1.8), p < 0.0001',
        unreportedAdverseSignals:
          'A comparability trial, not a superiority trial, and its primary endpoint is a laboratory number. Patients already anticoagulated or coagulopathic were excluded, which is a population in which the answer could differ.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Haemostasis success after transfemoral valve implantation rose from 91.6% on placebo to 97.9% on protamine in 410 randomised patients, an absolute difference of 6.3% (95% CI 2.0% to 10.6%)',
        'Median time to haemostasis fell from 279 seconds to 181 seconds in the same trial (p=0.002)',
        'A protamine-to-heparin ratio of 1.3 produced 615 mL of 24-hour blood loss against 470 mL at a ratio of 0.8 (p=0.021), with more plasma and platelet transfusion in the high-dose arm',
        'A fixed 250 mg dose and a 1:1 ratio dose gave indistinguishable post-protamine activated clotting times (difference -2.0 s, 95% CI -7.2 to 3.3) while using 2.1 fewer vials per case',
        'Anaphylactic reaction incidence of 0.69% across prospective studies and 0.19% across retrospective studies in a systematic review of 272 relevant articles',
      ],
      unsupportedInferences: [
        'That the licensed indication, treatment of heparin overdosage, rests on a controlled trial — it rests on a 1969 approval and on the drug doing visibly what it says on the vial',
        'That the benefit measured in transcatheter valve patients transfers to the end of cardiopulmonary bypass, where the drug is mostly given and where no placebo-controlled trial exists',
        'That the activated clotting time is an adequate guide to how much to give — two randomised trials now show it is identical across doses that produce very different bleeding',
        'That the haemodynamic collapse seen after protamine causes the associated excess mortality rather than marking sicker patients; the authors of the 6,921-patient cohort say so themselves',
      ],
      whatFailedInitially: [
        'PS TAVI, the first randomised placebo-controlled trial of routine protamine, missed its primary bleeding endpoint (OR 0.48, 95% CI 0.2 to 1.2, p=0.11) at 100 patients',
        'Higher protamine dosing increased 24-hour blood loss and transfusion in a randomised trial, reversing the drug’s intended effect',
        'Heparinase I was investigated as a replacement and found unsuitable in the one study identified by the 2008 systematic review',
        'The FDA label reports bleeding returning 30 minutes to 18 hours after bypass despite complete neutralisation, and offers only postulates for why',
      ],
      realWorldOutcome: [
        'The only licensed heparin antidote anywhere, given at the end of essentially every cardiopulmonary bypass operation performed worldwide',
        'About US$1.53 per 10 mg of average Medicare Part B spending in 2024 — among the cheapest drugs on any operating theatre trolley',
        'Extracted from salmonid sperm rather than synthesised, a single-source biological supply chain that has repeatedly put the drug into national shortage',
        'Practice has moved from ratio-based to lower fixed dosing at many centres on the strength of the two randomised dosing trials, without any change to the 1969 label',
      ],
    },
    deliverySystem: {
      type: 'Slow intravenous injection, given by a clinician with resuscitation equipment present',
      description:
        'Supplied as a ready-to-use aqueous solution and given directly into a vein at the end of a procedure using heparin, or after accidental overdose. Onset is within about five minutes. There is no oral, subcutaneous or intramuscular route: the molecule is a polycationic peptide and would be destroyed or sequestered before reaching the plasma by any other path.',
      safetyProfile:
        'Carries a boxed warning for severe hypotension, cardiovascular collapse, noncardiogenic pulmonary oedema, catastrophic pulmonary vasoconstriction and pulmonary hypertension. Named risk factors are high dose or overdose, rapid administration, repeated doses, previous protamine exposure and current or previous use of protamine-containing drugs such as NPH insulin; allergy to fish, previous vasectomy, severe left ventricular dysfunction and abnormal preoperative pulmonary haemodynamics may also be risk factors. The label directs that vasopressors and resuscitation equipment be immediately available, and states the drug should not be given when bleeding occurs without prior heparin use. Given alone or in excess it is itself an anticoagulant and impairs platelet function.',
    },
    commonQuestions: [
      {
        q: 'Does protamine reverse the newer blood thinners?',
        a: 'No, and this is the single most consequential misunderstanding about it. Protamine works by electrostatically neutralising unfractionated heparin, so it only reverses drugs built from that same heavily sulfated polysaccharide. It has no effect on warfarin, on dabigatran, on apixaban, on rivaroxaban or on fondaparinux, each of which has either its own antidote or none. Against low-molecular-weight heparins it is partial rather than complete, because the shorter chains present less surface for the peptide to grip. If the anticoagulant is not unfractionated heparin, protamine is the wrong drug.',
        auditNote:
          'The label indication is one sentence long and says "heparin overdosage". Every wider use of protamine is an extrapolation from that sentence.',
      },
      {
        q: 'Is more protamine safer than less?',
        a: 'The randomised evidence says the opposite. In a trial randomising cardiac surgery patients to a higher or lower protamine-to-heparin dosing ratio, the higher-dose arm bled 615 mL in 24 hours against 470 mL, needed more plasma and more platelets, and had thrombin generation suppressed to 6% of baseline against 38%. The activated clotting time, which is what most theatres titrate against, was the same in both arms and detected none of it. A second blinded trial found a flat dose matched a ratio-based dose on clotting time and on chest tube output while using roughly two fewer vials per patient.',
        auditNote:
          'This is the clearest example on the page of a monitoring test that cannot see the harm it is being used to prevent.',
      },
      {
        q: 'How likely is a severe reaction?',
        a: 'The best available estimate comes from a systematic review that screened 487 articles and analysed 272: anaphylactic reactions occurred in 0.69% of patients in prospective studies and 0.19% in retrospective ones, with the reviewers warning of pronounced heterogeneity between studies. Separately, in a cohort of 6,921 bypass patients, the size of the blood pressure fall and the pulmonary pressure rise in the half hour after protamine tracked with in-hospital death, with odds ratios near 1.28 per increment, and the relationship held even at small values. That second finding is an association in observational data; the authors state plainly that randomised trials would be needed to establish cause.',
      },
      {
        q: 'Why is a drug this old still not properly tested?',
        a: 'Because withholding it was never considered testable in the setting it matters most. At the end of a heart-lung bypass operation the patient is fully anticoagulated with an open chest, and no ethics committee would approve a placebo arm. The randomised trials that do exist were possible only in percutaneous procedures, where the alternative to protamine is manual pressure and a wait. That is why the first placebo-controlled trial of routine protamine appeared in 2021 and the first adequately sized one in 2024, fifty-five years after approval.',
      },
      {
        q: 'Where does it come from?',
        a: 'From the sperm of salmon and related fish. In mature fish sperm, protamine replaces the histones that normally package DNA, compressing the genome into a dense, almost crystalline state — a job that requires exactly the extreme positive charge that makes it a heparin antidote. The drug is extracted from milt with dilute acid and purified on a cation exchanger. That biological origin is also why it periodically goes into shortage: there is no synthetic route in production, and supply depends on fish.',
        auditNote:
          'The FDA label’s boxed warning lists allergy to fish among the possible risk factors for a severe reaction, which follows directly from the source material.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Vriesendorp PA, Nanayakkara S, Heuts S, et al. Routine Protamine Administration for Bleeding in Transcatheter Aortic Valve Implantation: The ACE-PROTAVI Randomized Clinical Trial. JAMA Cardiol 2024;9(10):901-908',
        identifier: '10.1001/jamacardio.2024.2454',
        kind: 'doi',
      },
      {
        label:
          'Zbroński K, Grodecki K, Gozdowska R, et al. Protamine sulfate during transcatheter aortic valve implantation (PS TAVI) - a single-center, single-blind, randomized placebo-controlled trial. Kardiol Pol 2021;79(9):995-1002',
        identifier: '10.33963/KP.a2021.0070',
        kind: 'doi',
      },
      {
        label:
          'Meesters MI, Veerhoek D, de Lange F, et al. Effect of high or low protamine dosing on postoperative bleeding following heparin anticoagulation in cardiac surgery. A randomised clinical trial. Thromb Haemost 2016;116(2):251-261',
        identifier: '10.1160/TH16-02-0117',
        kind: 'doi',
      },
      {
        label:
          'Jain P, Silva-De Las Salas A, Bedi K, Lamelas J, Epstein RH, Fabbro M 2nd. Protamine Dosing for Heparin Reversal after Cardiopulmonary Bypass: A Double-blinded Prospective Randomized Control Trial Comparing Two Strategies. Anesthesiology 2025;142(1):98-106',
        identifier: '10.1097/ALN.0000000000005256',
        kind: 'doi',
      },
      {
        label:
          'Welsby IJ, Newman MF, Phillips-Bute B, Messier RH, Kakkis ED, Stafford-Smith M. Hemodynamic changes after protamine administration: association with mortality after coronary artery bypass surgery. Anesthesiology 2005;102(2):308-314',
        identifier: '10.1097/00000542-200502000-00011',
        kind: 'doi',
      },
      {
        label:
          'Nybo M, Madsen JS. Serious anaphylactic reactions due to protamine sulfate: a systematic literature review. Basic Clin Pharmacol Toxicol 2008;103(2):192-196',
        identifier: '10.1111/j.1742-7843.2008.00274.x',
        kind: 'doi',
      },
      {
        label:
          'Protamine Sulfate Injection USP — FDA-approved prescribing information, boxed warning, indications, warnings and adverse reactions, retrieved from the openFDA drug label endpoint',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22protamine%20sulfate%22',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA: PROTAMINE SULFATE (Eli Lilly), NDA 006460, original approval 13 August 1969, all products discontinued; the marketed product is ANDA 089454 (Fresenius Kabi USA), original approval 7 April 1987',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=006460',
        kind: 'regulatory',
      },
      {
        label:
          'UniProtKB P69014 (PRT1_ONCKE) — protamine, salmine-AI, Oncorhynchus keta; 33 residues, 4,381 Da, initiator methionine removed',
        identifier: 'https://rest.uniprot.org/uniprotkb/P69014',
        kind: 'url',
      },
      {
        label:
          'CMS Medicare Part B Spending by Drug — HCPCS J2720, injection protamine sulfate per 10 mg; average spending per dosage unit US$1.5309 in 2024 and 2024 average sales price US$1.438',
        identifier:
          'https://data.cms.gov/summary-statistics-on-use-and-payments/medicare-medicaid-spending-by-drug/medicare-part-b-spending-by-drug',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 6. Idarucizumab — a perfect surrogate endpoint, measured in a trial with no control group.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'idarucizumab',
    name: 'Idarucizumab',
    tradeName: 'Praxbind',
    sponsor: 'Boehringer Ingelheim, under BLA 761025',
    targetGene:
      'None. The target is dabigatran, a synthetic small molecule, and no gene encodes it',
    targetProtein:
      'Dabigatran and its acylglucuronide metabolites. The Fab binds the drug itself, not thrombin, and has no measurable activity in coagulation tests on its own',
    modality: 'Monoclonal Antibody (mAb)',
    approvalStatus: 'FDA Approved',
    approvalYear: 2015,
    indication:
      'Patients treated with dabigatran when reversal of the anticoagulant effect is needed, for emergency surgery or urgent procedures, or in life-threatening or uncontrolled bleeding',
    patientFriendlyIndication:
      'Switching off the blood thinner dabigatran in an emergency — a serious bleed, or an operation that cannot wait',
    anatomicalSite: 'Blood plasma, then the interstitial space where dabigatran is redistributing',
    conditionContext: {
      conditionExplainer:
        'Dabigatran blocks thrombin, the enzyme that turns soluble fibrinogen into the fibrin mesh of a clot. It is taken every day by people with atrial fibrillation or previous clots. Most of the time that is exactly what is wanted; occasionally the person falls, bleeds into the brain, or needs an operation within hours.',
      whyItMatters:
        'Before 2015 there was nothing to do about it but wait for the kidneys to clear the drug, which takes twelve to twenty-four hours in someone with normal renal function and considerably longer in someone without. An antidote turns an eighteen-hour wait into a five-minute infusion.',
      whoTakesThis:
        'Given once, in an emergency department, operating theatre or intensive care unit, by the team looking after a bleeding or pre-operative patient known to be taking dabigatran.',
      clinicalGoals:
        'Bring the diluted thrombin time and ecarin clotting time back to normal, so surgery can proceed or bleeding can be controlled. Survival was never a trial endpoint.',
    },
    oneSentenceVerdict:
      'An antibody fragment engineered to bind dabigatran about 350 times more tightly than thrombin does, and which strips it out of the plasma so completely that the median reversal of the clotting test was 100% with a confidence interval of 100 to 100 — measured, as the FDA label itself describes it, in a single-cohort case series with no control group, in which 101 of the 503 patients died.',
    laymanHowItWorks:
      'Dabigatran works by sitting in the pocket of thrombin, the enzyme that finishes a clot. Idarucizumab is a fragment of an antibody shaped like that same pocket, only better: it grips dabigatran roughly 350 times more tightly than thrombin can. Infused into a vein, it mops the drug out of the bloodstream in minutes and holds it in a complex the kidneys then clear. Thrombin is left alone and clotting resumes.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 66,
    substitutes: {
      summary:
        'There is one licensed antidote for dabigatran and this is it. What competed with it before 2015, and what is still used where it is unavailable, is haemodialysis — dabigatran is only about 35% protein bound and can be filtered out — plus non-specific factor replacement that has never been shown to work for this drug.',
      conventionalRx: [
        {
          name: 'Haemodialysis',
          class: 'Extracorporeal drug removal',
          howItCompares:
            'Dabigatran is the only direct oral anticoagulant that is meaningfully dialysable, because it is small and only lightly bound to plasma protein. Dialysis removes it over hours rather than minutes, requires vascular access, and is difficult in a patient who is haemodynamically unstable — which describes most patients who need it.',
          typicalCost:
            'The cost of an urgent dialysis session and the access line, which is far below the cost of the antidote.',
          prosAndCons:
            'Pros: no drug cost, no rebound from redistribution because the drug is actually removed from the body. Cons: hours not minutes, needs a functioning circulation and a dialysis service at 3am.',
        },
        {
          name: 'Prothrombin complex concentrate and activated PCC',
          class: 'Non-specific clotting factor replacement',
          howItCompares:
            'Adds clotting factors rather than removing the drug, so it works downstream of a thrombin blockade that is still in place. It was the pre-2015 fallback and remains the fallback where idarucizumab is not stocked, on thin evidence: the label for idarucizumab notes only that coagulation factor concentrates do not interfere with its own action in vitro.',
          typicalCost:
            'Kcentra averaged US$3,150.56 per claim in 2023 Medicaid spending, at US$1.68 per international unit of factor IX activity.',
          prosAndCons:
            'Pros: on the shelf in every hospital, works for several anticoagulants rather than one. Cons: does not touch the drug causing the problem, and carries its own thrombotic risk.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'antibody_structure',
      molecularWeight:
        'Approximately 47,766 Da. A humanised Fab derived from an IgG1 isotype: a 219-residue light chain and a 225-residue heavy chain fragment joined by one disulfide bond between heavy chain cysteine 225 and light chain cysteine 219',
      targetReceptorAffinity:
        'Approximately 350-fold higher affinity for dabigatran than dabigatran has for thrombin, determined by X-ray crystallography and binding studies of the humanised Fab. It does not bind known thrombin substrates and has no activity in coagulation tests or platelet aggregation on its own',
      structureSource: {
        label:
          'Schiele F, van Ryn J, Canada K, et al. A specific antidote for dabigatran: functional and structural characterization. Blood 2013;121(18):3554-3562',
        identifier: '10.1182/blood-2012-11-468207',
        kind: 'doi',
      },
      laboratoryWorkflow: [
        {
          id: 'ida-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Release of the CHO master and working cell banks',
          description:
            'Confirm identity, copy number and freedom from adventitious agents in the recombinant Chinese hamster ovary line before any production run. For a Fab that will be infused as a five-gram dose in a single sitting, host cell protein and endotoxin limits are set at the cell bank rather than argued about at the end.',
          reagentsAndBuffer:
            'Characterised recombinant CHO cell bank, mycoplasma and in vitro adventitious agent assays, quantitative PCR for transgene copy number, limulus amoebocyte lysate endotoxin assay',
        },
        {
          id: 'ida-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Fed-batch expression of the humanised Fab',
          description:
            'Express the light chain and the heavy chain fragment in the same cell so that they assemble and form the single interchain disulfide before secretion. The molecule has no Fc, which is deliberate: an Fc would give it a long half-life and effector functions that a one-shot antidote has no use for.',
          dependsOnStepId: 'ida-w1',
          reagentsAndBuffer:
            'Chemically defined animal-component-free fed-batch medium, controlled dissolved oxygen and pH bioreactor, glucose and amino acid feeds',
        },
        {
          id: 'ida-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Affinity capture, polishing and viral clearance',
          description:
            'Capture the Fab on an affinity resin, polish by ion exchange to remove aggregates and charge variants, then apply the two orthogonal viral clearance steps a mammalian-expressed biologic requires. Aggregate content is the parameter that matters most for a protein given as a rapid bolus.',
          dependsOnStepId: 'ida-w2',
          reagentsAndBuffer:
            'Kappa-select or CH1-select affinity resin, low-pH viral inactivation buffer, cation-exchange polishing, small-virus retentive filtration, size-exclusion HPLC for aggregate quantification',
        },
        {
          id: 'ida-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Capture of unbound dabigatran in whole blood',
          description:
            'Confirm the Fab removes free dabigatran from plasma rather than merely binding it in a buffer. In healthy subjects, unbound dabigatran fell below the limit of quantification immediately after infusion and stayed there for at least 24 hours; the assay has to be able to see that, and to see the redistribution rebound that follows in some patients.',
          dependsOnStepId: 'ida-w3',
          reagentsAndBuffer:
            'Dabigatran-spiked human whole blood and plasma, ultrafiltration to separate unbound drug, LC-MS/MS quantification of free dabigatran, serial sampling to 24 hours',
        },
        {
          id: 'ida-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Diluted thrombin time and ecarin clotting time reversal',
          description:
            'Measure the two clotting assays the licence was granted on. Both are specific to thrombin inhibition, which is why they were chosen, and neither says anything about whether the patient stops bleeding. Reporting the endogenous thrombin potential alongside them shows the antidote is not itself procoagulant.',
          dependsOnStepId: 'ida-w4',
          reagentsAndBuffer:
            'Diluted thrombin time reagent, ecarin from Echis carinatus venom, activated partial thromboplastin time and thrombin time reagents, calibrated automated thrombogram for endogenous thrombin potential',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ida-a1',
        category: 'measured',
        title: 'The clotting test went back to normal in essentially every patient',
        laymanSummary:
          'Across 503 emergency patients, the median reversal of dabigatran’s effect on the clotting test within four hours was 100%, with a confidence interval of 100 to 100. As laboratory results go, that is about as clean as medicine gets.',
        technicalDetails:
          'RE-VERSE AD was a multicentre, prospective, open-label study of a single 5 g intravenous dose in patients with uncontrolled bleeding (group A, n=301) or requiring an urgent procedure (group B, n=202). The primary endpoint was the maximum percentage reversal of dabigatran’s anticoagulant effect within 4 hours, measured by diluted thrombin time or ecarin clotting time; the median was 100% (95% CI 100 to 100). In healthy volunteers given dabigatran 220 mg twice daily, a 5 g infusion took the diluted thrombin time from 66.6 s to 32.1 s and the ecarin clotting time from 122 s to 34.7 s by the end of the infusion, with unbound dabigatran below the limit of quantification for at least 24 hours.',
        evidenceSource:
          'Pollack CV Jr, Reilly PA, van Ryn J, et al. Idarucizumab for Dabigatran Reversal - Full Cohort Analysis. N Engl J Med 2017;377(5):431-441',
        doi: '10.1056/NEJMoa1707278',
        measuredMetric:
          'Maximum percentage reversal of dabigatran anticoagulant effect within 4 hours, by diluted thrombin time or ecarin clotting time',
        auditFlag: 'verified',
      },
      {
        id: 'ida-a2',
        category: 'inferred',
        title: 'The FDA label calls the pivotal trial a case series, because that is what it was',
        laymanSummary:
          'RE-VERSE AD had no control group. Everyone enrolled got the drug. There is therefore no measurement anywhere of what would have happened to the same patients without it.',
        technicalDetails:
          'The Clinical Studies section of the PRAXBIND label describes RE-VERSE AD (NCT02104947) as "a single cohort case series trial". The FDA granted accelerated approval under BLA 761025 on 16 October 2015 on the basis of the interim cohort, converting to traditional approval on 12 April 2018 after the full cohort was published. A surrogate endpoint of 100% reversal in an uncontrolled cohort establishes that the antidote does what the chemistry says it does. It does not establish that giving it changes the outcome of a brain haemorrhage, because the counterfactual was never observed. No randomised trial of idarucizumab against usual care has been performed, and given that dabigatran now has an antidote and the comparator would be no antidote, none is likely.',
        evidenceSource:
          'PRAXBIND (idarucizumab) FDA-approved prescribing information, section 14 Clinical Studies; Drugs@FDA BLA 761025, original approval 16 October 2015, supplement 2 approved 12 April 2018',
        inferredClaim:
          'That normalising the diluted thrombin time is the same thing as improving the outcome of the bleed or the operation — an inference the trial design makes untestable rather than merely untested',
        auditFlag: 'caution',
      },
      {
        id: 'ida-a3',
        category: 'failed',
        title: 'One in five patients died, and the drug was not designed to stop that',
        laymanSummary:
          'Of the 503 patients given idarucizumab, 101 died. Nineteen died within a day of the infusion. The mortality rate at 90 days was about 19% in both groups.',
        technicalDetails:
          'The PRAXBIND label states that of the 503 dabigatran-treated patients across the entire study period, 101 died, 19 of them within the first day after dosing, and attributes each death either to a complication of the index event or to comorbidity. The published full-cohort analysis reports 90-day mortality of 18.8% in the bleeding group and 18.9% in the procedure group. This is a population presenting with intracranial haemorrhage or major gastrointestinal bleeding on an anticoagulant, so a high death rate is expected; the point of the audit is that the trial cannot separate deaths the drug failed to prevent from deaths it had no bearing on, because there was no comparison arm. A subsequent meta-analysis of 30 studies and 3,602 real-world patients found pooled all-cause mortality of 13.6% (95% CI 9.6% to 17.9%) and haemostatic effectiveness of 77.7% (95% CI 66.7% to 87.2%) — appreciably lower than the near-universal laboratory reversal.',
        evidenceSource:
          'van der Horst SFB, Martens ESL, den Exter PL, et al. Idarucizumab for dabigatran reversal: A systematic review and meta-analysis of indications and outcomes. Thromb Res 2023;228:21-32',
        doi: '10.1016/j.thromres.2023.05.020',
        measuredMetric:
          'Pooled all-cause mortality and haemostatic effectiveness across 30 real-world studies and 3,602 patients',
        auditFlag: 'caution',
      },
      {
        id: 'ida-a4',
        category: 'measured',
        title: 'Clotting comes back hours later in some patients as the drug redistributes',
        laymanSummary:
          'The antidote clears the bloodstream, but dabigatran is also sitting in the tissues. In some patients it seeps back in over the next twelve to twenty-four hours and the clotting tests drift up again.',
        technicalDetails:
          'The label reports that in a limited number of patients in the clinical programme, elevated coagulation parameters — activated partial thromboplastin time or ecarin clotting time — reappeared between 12 and 24 hours after the 5 g dose, and attributes this to redistribution of dabigatran from the periphery into plasma. The stated response is that an additional 5 g dose may be considered, with the explicit caveat that the safety and effectiveness of repeat treatment have not been established. This is a mechanistic consequence of an antidote that binds a drug in one compartment while the drug is distributed across two, and it is one of the few places where the label states a limitation of its own recommendation.',
        evidenceSource:
          'PRAXBIND (idarucizumab) FDA-approved prescribing information, sections 5.2 Re-elevation of Coagulation Parameters and 12.2 Pharmacodynamics',
        measuredMetric:
          'Reappearance of elevated aPTT and ecarin clotting time between 12 and 24 hours after a single 5 g dose',
        auditFlag: 'verified',
      },
      {
        id: 'ida-a5',
        category: 'inferred',
        title: 'Thrombosis after reversal: 33 events in 503 patients, cause unresolved',
        laymanSummary:
          'Taking away someone’s anticoagulant returns them to the clotting risk it was preventing. Thirty-three of the 503 patients had a clot; eleven of those within five days. Whether the antidote contributed, or simply the loss of anticoagulation, has never been separated.',
        technicalDetails:
          'The label reports 33 of 503 patients with thrombotic events, 11 within 5 days of treatment and 22 at 6 days or more, and notes that most of these patients were not back on antithrombotic therapy. The full-cohort publication reports thrombotic events in 6.3% of the bleeding group and 7.4% of the procedure group at 90 days. A systematic review pooling 13 idarucizumab studies (1,384 patients) with 3 andexanet alfa studies (390 patients) found a combined thrombotic event rate of 5.5% (95% CI 2.0% to 10.1%) to 30-90 days and all-cause mortality of 13.3% (95% CI 9.6% to 17.5%), and concluded explicitly that causality of harm attributable to the antidotes remains to be established. The label’s own framing is that reversing dabigatran exposes the patient to the thrombotic risk of their underlying disease.',
        evidenceSource:
          'Rodrigues AO, David C, Ferreira JJ, Pinto FJ, Costa J, Caldeira D. The incidence of thrombotic events with idarucizumab and andexanet alfa: A systematic review and meta-analysis. Thromb Res 2020;196:291-296',
        doi: '10.1016/j.thromres.2020.09.003',
        measuredMetric:
          'Pooled incidence of thrombotic events to 30-90 days across 16 studies and 1,774 patients receiving a specific reversal agent',
        inferredClaim:
          'That the post-reversal clots reflect the underlying disease rather than a procoagulant effect of the antidote — plausible, stated in the label, and not demonstrated by any controlled comparison',
        auditFlag: 'contested',
      },
      {
        id: 'ida-a6',
        category: 'conclusion_shift',
        title: 'It became a stroke drug, which is not what it was licensed for',
        laymanSummary:
          'Idarucizumab was approved for bleeding and emergency surgery. A large share of real-world use is now something else entirely: clearing dabigatran out of the way so a stroke patient can be given a clot-busting drug.',
        technicalDetails:
          'The pooled real-world analysis of 30 studies found that between 2.0% and 27.3% of idarucizumab prescriptions across cohorts were given to enable thrombolysis, an indication that appears nowhere in the label, alongside 63.1% for bleeding and 30.5% for invasive procedures. Registry-based work has since compared thrombolysis after dabigatran reversal against alternative strategies in patients with recent direct oral anticoagulant intake. The shift is a reasonable one on mechanism, and it is also a demonstration that the licensed indication stopped describing the drug’s use within a few years of approval. The same review found that 2.8% (95% CI 0.5% to 6.2%) of prescriptions were judged inappropriate on post-hoc review.',
        evidenceSource:
          'van der Horst SFB, et al. Thromb Res 2023;228:21-32; Neurology 2024;103(7):e209862, Thrombolysis After Dabigatran Reversal for Acute Ischemic Stroke: A National Registry-Based Study and Meta-Analysis',
        doi: '10.1212/WNL.0000000000209862',
        inferredClaim:
          'That reversal-then-thrombolysis is safe and effective because reversal is complete — an off-label pathway built on the same surrogate the licence was built on',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Five grams of antibody fragment, infused over about five minutes',
        laymanDesc:
          'Given as two vials into a vein, one after the other. It is a large dose by the standards of antibody drugs, because it has to outnumber every molecule of dabigatran in the body.',
        molecularDetail:
          'Each vial contains 2.5 g of idarucizumab in 50 mL. The dose is stoichiometric rather than pharmacological: the Fab binds dabigatran one-to-one, so the amount required is set by the amount of drug present rather than by a receptor occupancy curve. The formulation contains 2004.20 mg of sorbitol per vial, which is why the label carries a specific warning for patients with hereditary fructose intolerance.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It stays in the blood — no cell has to be entered',
        laymanDesc:
          'Its target is a drug circulating in the plasma, so the antibody fragment never needs to cross into a cell. It works entirely in the bloodstream.',
        molecularDetail:
          'Idarucizumab is a Fab with no Fc region. That removes neonatal Fc receptor recycling and gives it a short half-life, which is appropriate for a molecule intended to act once and leave. It also removes complement and Fc receptor engagement, so the bound complex is cleared renally rather than by immune effector mechanisms.',
        iconName: 'Droplet',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It grips dabigatran about 350 times harder than thrombin can',
        laymanDesc:
          'The fragment was engineered to copy the shape of the pocket in thrombin that dabigatran normally sits in, and then to hold on far more tightly. Dabigatran leaves thrombin and goes to the antidote.',
        molecularDetail:
          'The X-ray crystal structure of dabigatran bound to the humanised Fab shows structural similarities to how thrombin recognises the drug, but a tighter network of interactions that yields an affinity roughly 350-fold greater than dabigatran’s affinity for thrombin. The Fab does not bind known thrombin substrates and shows no activity in coagulation assays or platelet aggregation on its own.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Thrombin is released and starts making fibrin again',
        laymanDesc:
          'With the blocker pulled off, thrombin returns to normal and can convert fibrinogen into the mesh that holds a clot together. The clotting tests fall back to baseline within minutes.',
        molecularDetail:
          'Unbound dabigatran plasma concentration fell below the limit of quantification immediately after infusion in healthy subjects. In 14 dabigatran-exposed volunteers the thrombin time went from 127 s to 12.5 s, the ecarin clotting time from 122 s to 34.7 s, and the activated clotting time from 236 s to 116 s by the end of the infusion. Idarucizumab alone showed no procoagulant effect on endogenous thrombin potential.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The complex is cleared, and the patient is no longer anticoagulated',
        laymanDesc:
          'The antidote and the drug leave together through the kidneys. From that moment the patient has none of the protection the anticoagulant was giving them, which is its own risk.',
        molecularDetail:
          'The label states plainly that reversing dabigatran exposes patients to the thrombotic risk of their underlying disease and directs that anticoagulation be resumed as soon as medically appropriate. Thirty-three of 503 patients in RE-VERSE AD had a thrombotic event, most of them not back on antithrombotic therapy at the time.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Some of the drug comes back out of the tissues',
        laymanDesc:
          'Dabigatran is not only in the blood. In some patients enough seeps back from the tissues over the next twelve to twenty-four hours to push the clotting tests up again.',
        molecularDetail:
          'Redistribution of dabigatran from the peripheral compartment produced re-elevation of diluted thrombin time, ecarin clotting time, aPTT and thrombin time between 12 and 24 hours in a limited number of patients. A further 5 g dose may be considered, and the label states that the safety and effectiveness of repeat treatment have not been established.',
        iconName: 'Repeat',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'RE-VERSE AD (NCT02104947) — full cohort',
        phase:
          'Multicentre prospective open-label single-cohort case series, as described in the FDA label',
        sampleSize: 503,
        primaryEndpoint:
          'Maximum percentage reversal of the anticoagulant effect of dabigatran within 4 hours, by diluted thrombin time or ecarin clotting time',
        endpointMet: true,
        statisticalPValue:
          'Median maximum reversal 100% (95% CI 100 to 100). No p-value is reported because there was no comparator arm',
        unreportedAdverseSignals:
          '101 of 503 patients died, 19 within the first day of dosing. Thrombotic events occurred in 33 of 503. Neither figure can be attributed or exonerated, because no control group was enrolled.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'RE-VERSE AD interim cohort — the accelerated approval basis',
        phase: 'Prespecified interim analysis of the same single-arm cohort',
        sampleSize: 90,
        primaryEndpoint:
          'Maximum percentage reversal of dabigatran anticoagulant effect within 4 hours',
        endpointMet: true,
        statisticalPValue:
          'Complete normalisation of the diluted thrombin time or ecarin clotting time in 88% to 98% of patients depending on the assay',
        unreportedAdverseSignals:
          'Accelerated approval was granted on 90 patients with no control group and a laboratory endpoint, on 16 October 2015. Traditional approval followed on 12 April 2018 on the strength of the same trial, enlarged.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'Pooled real-world experience — 30 studies of idarucizumab in routine practice, to September 2022',
        phase: 'Systematic review and random-effects meta-analysis of observational studies',
        sampleSize: 3602,
        primaryEndpoint: 'Haemostatic effectiveness, all-cause mortality and thromboembolic events',
        endpointMet: true,
        statisticalPValue:
          'Haemostatic effectiveness 77.7% (95% CI 66.7% to 87.2%); all-cause mortality 13.6% (95% CI 9.6% to 17.9%); thromboembolic events 2.0% (95% CI 0.8% to 3.4%)',
        unreportedAdverseSignals:
          'Haemostatic effectiveness in practice is more than twenty percentage points below the near-universal laboratory reversal that the licence rests on. Between 2.0% and 27.3% of prescriptions across cohorts were for thrombolysis enablement, which is not a licensed indication.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Pooled thrombotic event rate across idarucizumab and andexanet alfa studies',
        phase: 'Systematic review and meta-analysis of 16 prospective and retrospective studies',
        sampleSize: 1774,
        primaryEndpoint: 'Incidence of thrombotic events after specific anticoagulant reversal',
        endpointMet: true,
        statisticalPValue:
          'Pooled thrombotic events 5.5% (95% CI 2.0% to 10.1%) to 30-90 days; all-cause mortality 13.3% (95% CI 9.6% to 17.5%)',
        unreportedAdverseSignals:
          'The authors state that causality of harm attributable to the antidotes cannot be established from these data, because none of the included studies had an untreated comparison group.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Median maximum reversal of dabigatran’s anticoagulant effect within 4 hours of 100% (95% CI 100 to 100) across 503 emergency patients',
        'Unbound dabigatran below the limit of quantification immediately after a 5 g infusion in healthy subjects, sustained for at least 24 hours',
        'Approximately 350-fold higher affinity for dabigatran than dabigatran has for thrombin, from the crystal structure and binding studies',
        'Median time to cessation of bleeding of 2.5 hours in assessable group A patients, and median time to the intended procedure of 1.6 hours in group B',
        'Haemostatic effectiveness of 77.7% (95% CI 66.7% to 87.2%) pooled across 3,602 real-world patients',
      ],
      unsupportedInferences: [
        'That normalising the diluted thrombin time improves the outcome of the bleed — untestable in a trial design with no control arm, which the FDA label itself calls a single-cohort case series',
        'That the 101 deaths among 503 patients were all attributable to the index event and comorbidity; that attribution is the sponsor’s, made without a comparator',
        'That the 33 thrombotic events reflect the underlying disease rather than any effect of the antidote — the pooled meta-analysis says causality remains to be established',
        'That reversal followed by thrombolysis in acute stroke is safe because reversal is complete; that is an off-label pathway resting on the same laboratory surrogate',
      ],
      whatFailedInitially: [
        'Coagulation parameters re-elevated between 12 and 24 hours in a limited number of patients as dabigatran redistributed from the tissues, and the label concedes that repeat dosing has not been shown to be safe or effective',
        'Real-world haemostatic effectiveness of 77.7% sits far below the near-total laboratory reversal, which is the gap between a surrogate and an outcome made visible',
        'Post-hoc review found 2.8% (95% CI 0.5% to 6.2%) of real-world prescriptions inappropriate for the indication given',
      ],
      realWorldOutcome: [
        'The first specific antidote to a direct oral anticoagulant, approved on 16 October 2015 under accelerated approval and converted to traditional approval on 12 April 2018',
        'Stocked as an emergency-department and theatre item rather than dispensed, which is why it appears in no CMS pharmacy or Part B pricing dataset',
        'A substantial and growing share of use is off-label, to permit thrombolysis in acute ischaemic stroke in someone taking dabigatran',
        'Its existence is part of the argument for prescribing dabigatran at all, which makes the antidote a commercial asset as well as a clinical one',
      ],
    },
    deliverySystem: {
      type: 'Intravenous infusion or bolus, given once as two consecutive 2.5 g vials',
      description:
        'Supplied as two single-dose 50 mL vials, each containing 2.5 g. Given as two consecutive infusions of no more than five to ten minutes each, or as a bolus injection. There is no other route: it is a 48 kDa protein and would not survive the gut or reach plasma from a subcutaneous depot fast enough to matter in the situations it is used in.',
      safetyProfile:
        'No boxed warning. The principal risk is the one the drug is designed to create: removing anticoagulation returns the patient to the thrombotic risk of the disease that put them on dabigatran, and the label directs resumption of anticoagulation as soon as medically appropriate. Coagulation parameters can re-elevate between 12 and 24 hours from redistribution. Hypersensitivity reactions have been reported and clinical experience is described in the label as insufficient to quantify the risk. Each vial contains 2004.20 mg of sorbitol, which is a specific hazard in hereditary fructose intolerance. The commonest reported reactions in patients were constipation (7%) and nausea (5%).',
    },
    commonQuestions: [
      {
        q: 'Does it work on the other new blood thinners?',
        a: 'No. Idarucizumab binds dabigatran and its acylglucuronide metabolites and nothing else. Apixaban, rivaroxaban and edoxaban block factor Xa rather than thrombin, are chemically unrelated, and need a different agent — andexanet alfa. Warfarin needs vitamin K and factor replacement. Heparin needs protamine. Giving idarucizumab to a patient on any of those does precisely nothing, and the several minutes spent giving it are not free in a brain haemorrhage.',
        auditNote:
          'The specificity that makes this drug clean is the same property that makes it useless one drug over.',
      },
      {
        q: 'If it reverses the drug completely, why did a fifth of the patients still die?',
        a: 'Because the trial enrolled people who were already in serious trouble: nearly a third of the bleeding group had bled into the brain and nearly half had major gastrointestinal bleeding. Reversing the anticoagulant removes one contributor to a catastrophe that has usually already happened. The honest limit of the evidence is that we know the laboratory number was corrected and we do not know what the death rate would have been without the antidote, because nobody was randomised to go without it.',
        auditNote:
          'This is the central measured-versus-inferred gap on the page: a perfect surrogate endpoint and an unobserved counterfactual.',
      },
      {
        q: 'Can the anticoagulant effect come back?',
        a: 'Yes, in some patients. Dabigatran is distributed between the blood and the tissues, and the antidote only reaches the blood. Between twelve and twenty-four hours after a dose, enough can move back into the plasma to push the clotting tests up again. The label acknowledges this, suggests a second 5 g dose may be considered, and then states that the safety and effectiveness of repeat treatment have not been established — an unusually candid pair of sentences to find next to each other.',
      },
      {
        q: 'Why is there no price on this page?',
        a: 'Because no public CMS dataset carries one. It is given once, in hospital, to an inpatient in an emergency, so it is bundled into the hospital payment rather than billed as a pharmacy claim or a Part B outpatient drug. It appears in neither the retail acquisition cost survey, the Part B spending file, nor the Medicaid spending file. Rather than publish an estimate, this page leaves the field out. What can be said is that the pricing of reversal agents is part of the commercial case for the anticoagulants they reverse, and that argument is made by the same company that sells both.',
      },
      {
        q: 'Is it used for anything other than what it says on the label?',
        a: 'Yes, and increasingly so. The label covers life-threatening bleeding and emergency surgery. In practice, somewhere between one in fifty and one in four prescriptions across published cohorts are given to clear dabigatran out of the way so that a stroke patient can receive thrombolysis, an indication that appears nowhere in the licence. The mechanistic argument is sound and the outcome evidence for that pathway is registry data, not trials.',
        auditNote:
          'A pooled review of 30 real-world studies found 2.8% of prescriptions were judged inappropriate for the indication recorded.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Pollack CV Jr, Reilly PA, van Ryn J, et al. Idarucizumab for Dabigatran Reversal - Full Cohort Analysis. N Engl J Med 2017;377(5):431-441',
        identifier: '10.1056/NEJMoa1707278',
        kind: 'doi',
      },
      {
        label:
          'Pollack CV Jr, Reilly PA, Eikelboom J, et al. Idarucizumab for Dabigatran Reversal. N Engl J Med 2015;373(6):511-520 — the interim cohort on which accelerated approval was granted',
        identifier: '10.1056/NEJMoa1502000',
        kind: 'doi',
      },
      {
        label:
          'Schiele F, van Ryn J, Canada K, et al. A specific antidote for dabigatran: functional and structural characterization. Blood 2013;121(18):3554-3562',
        identifier: '10.1182/blood-2012-11-468207',
        kind: 'doi',
      },
      {
        label:
          'van der Horst SFB, Martens ESL, den Exter PL, et al. Idarucizumab for dabigatran reversal: A systematic review and meta-analysis of indications and outcomes. Thromb Res 2023;228:21-32',
        identifier: '10.1016/j.thromres.2023.05.020',
        kind: 'doi',
      },
      {
        label:
          'Rodrigues AO, David C, Ferreira JJ, Pinto FJ, Costa J, Caldeira D. The incidence of thrombotic events with idarucizumab and andexanet alfa: A systematic review and meta-analysis. Thromb Res 2020;196:291-296',
        identifier: '10.1016/j.thromres.2020.09.003',
        kind: 'doi',
      },
      {
        label:
          'Thrombolysis After Dabigatran Reversal for Acute Ischemic Stroke: A National Registry-Based Study and Meta-Analysis. Neurology 2024;103(7):e209862',
        identifier: '10.1212/WNL.0000000000209862',
        kind: 'doi',
      },
      {
        label: 'RE-VERSE AD — Reversal Effects of Idarucizumab on Active Dabigatran',
        identifier: 'NCT02104947',
        kind: 'nct',
      },
      {
        label:
          'PRAXBIND (idarucizumab) injection — FDA-approved prescribing information, sections 5, 6.1, 11, 12 and 14, retrieved from the openFDA drug label endpoint',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22PRAXBIND%22',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA: PRAXBIND (idarucizumab), BLA 761025, Boehringer Ingelheim; original approval 16 October 2015, supplement 2 approved 12 April 2018',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=761025',
        kind: 'regulatory',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 7. Andexanet alfa — the one reversal agent that was finally randomised, and what that showed.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'andexanet-alfa',
    name: 'Andexanet Alfa',
    tradeName: 'Andexxa',
    sponsor:
      'AstraZeneca Pharmaceuticals LP under BLA 125586; originated by Portola Pharmaceuticals and acquired through Alexion',
    targetGene: 'F10 — the gene for human coagulation factor X, from which the decoy is engineered',
    targetProtein:
      'The factor Xa inhibitors themselves: apixaban, rivaroxaban and, off-label, edoxaban and enoxaparin. It also binds and inhibits tissue factor pathway inhibitor, which is a second and separate procoagulant action',
    modality: 'Recombinant Protein / Biologic',
    approvalStatus: 'Accelerated Approval',
    approvalYear: 2018,
    indication:
      'Patients treated with rivaroxaban or apixaban when reversal of anticoagulation is needed due to life-threatening or uncontrolled bleeding. Approved under accelerated approval based on the change from baseline in anti-factor-Xa activity in healthy volunteers; an improvement in haemostasis has not been established',
    patientFriendlyIndication:
      'Switching off apixaban or rivaroxaban when someone on one of them has a bleed that will not stop',
    anatomicalSite:
      'Blood plasma — the decoy circulates and captures the drug before it reaches real factor Xa',
    conditionContext: {
      conditionExplainer:
        'Apixaban and rivaroxaban work by blocking factor Xa, the enzyme that sits at the junction of the clotting cascade and converts prothrombin into thrombin. Millions of people take one of them daily for atrial fibrillation or previous clots. When such a person bleeds into the brain, the anticoagulant keeps the bleed growing.',
      whyItMatters:
        'Haematoma expansion in the first twelve hours is one of the strongest predictors of death and disability after an intracerebral haemorrhage. The argument for a reversal agent is that stopping the expansion should stop the harm. Andexanet alfa is the only drug in this group where that argument has actually been put to a randomised test.',
      whoTakesThis:
        'Given once, in an emergency department or neurocritical care unit, to a patient with life-threatening bleeding — most often into the brain — who took a factor Xa inhibitor within the previous 15 to 18 hours.',
      clinicalGoals:
        'Reduce anti-factor-Xa activity and limit haematoma growth. The randomised trial met that goal and did not change how patients were at 30 days.',
    },
    oneSentenceVerdict:
      'A deliberately broken copy of factor Xa that circulates as a decoy and soaks up apixaban and rivaroxaban, licensed in 2018 on a blood test in healthy volunteers with the FDA stating on the label that an improvement in haemostasis had not been established — and when it was finally randomised in 530 patients with brain haemorrhage, it did control the bleed better than usual care while doubling thrombotic events, quadrupling ischaemic stroke, and leaving disability and death at 30 days unchanged.',
    laymanHowItWorks:
      'Apixaban and rivaroxaban work by jamming an enzyme called factor Xa. Andexanet alfa is a copy of that same enzyme with two deliberate breaks: the part that does the cutting is disabled, and the part that anchors it into the clotting machinery has been cut off. So it cannot clot your blood and it cannot thin it. What it can still do is look exactly like the enzyme the drug is hunting for, so the drug binds to the decoy instead and is taken out of circulation.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 52,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$8,806.75 in average Medicaid spending per claim in 2023, across 55 claims nationally',
      markupEstimate:
        'Not calculable. No published per-dose cost of production exists for this recombinant protein, so there is no denominator to divide the payment by.',
      openPatentNotes:
        'On patent and single-source. The molecule is a genetically modified variant of human factor Xa expressed in Chinese hamster ovary cells, with two engineered changes to the native sequence, and there is no biosimilar. The low national claim count reflects a drug reserved for catastrophic bleeding rather than a drug in wide use.',
      synthesisComplexity: 'High',
      costSource: NO_COST_STUDY_SOURCE,
      priceSource: CMS_MEDICAID_SOURCE,
    },
    substitutes: {
      summary:
        'The real-world comparator is four-factor prothrombin complex concentrate, which is what 85.5% of the usual-care arm of the randomised trial received. That trial is the only head-to-head evidence that exists, and it found andexanet better at controlling the haematoma, worse on thrombosis, and indistinguishable on how the patient was a month later.',
      conventionalRx: [
        {
          name: 'Four-factor prothrombin complex concentrate (Kcentra)',
          class: 'Pooled human clotting factor concentrate',
          howItCompares:
            'Adds factors II, VII, IX and X rather than removing the drug, so it overwhelms the blockade instead of lifting it. In ANNEXA-I it made up 85.5% of the usual-care arm: haemostatic efficacy 53.1% against 67.0% for andexanet, thrombotic events 5.6% against 10.3%, and no difference in modified Rankin score or death at 30 days.',
          typicalCost:
            'US$3,150.56 in average Medicaid spending per claim in 2023, at US$1.68 per international unit of factor IX activity.',
          prosAndCons:
            'Pros: on the shelf everywhere, a third of the cost, fewer thrombotic events in the one randomised comparison. Cons: worse haematoma control, and its own warfarin-reversal evidence is also built on the INR.',
        },
        {
          name: 'Supportive care and time',
          class: 'No reversal agent',
          howItCompares:
            'Apixaban and rivaroxaban have half-lives of roughly 6 to 12 hours in a patient with normal renal function, so anticoagulation wears off without intervention. Neither is meaningfully dialysable, because both are heavily protein bound.',
          typicalCost:
            'The cost of intensive care and blood products, which depends entirely on how the bleed behaves.',
          prosAndCons:
            'Pros: no thrombotic or ischaemic risk added on top of a stroke. Cons: does nothing about haematoma expansion in the twelve hours when expansion happens.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'peptide_sequence',
      molecularWeight:
        'Approximately 41 kDa. A genetically modified variant of human factor Xa in which the active site serine is substituted with alanine, so it cannot cleave and activate prothrombin, and the gamma-carboxyglutamic acid domain is deleted, so it cannot assemble into the prothrombinase complex',
      targetReceptorAffinity:
        'Binds apixaban and rivaroxaban in a one-to-one, essentially irreversible fashion at the factor Xa active site, which is why dosing is stoichiometric and set by how much anticoagulant is on board rather than by receptor occupancy',
      structureSource: {
        label:
          'ANDEXXA (coagulation factor Xa (recombinant), inactivated-zhzo) FDA-approved prescribing information, section 11 Description; label effective 23 May 2025',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22ANDEXXA%22',
        kind: 'regulatory',
      },
      laboratoryWorkflow: [
        {
          id: 'anx-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Sequence verification of the two engineered defects',
          description:
            'Confirm at the cell bank that both deliberate changes are present and stable: the active-site serine to alanine substitution and the deletion of the gamma-carboxyglutamic acid domain. Either reverting would turn an antidote into a procoagulant enzyme, so this is the identity test that matters most.',
          reagentsAndBuffer:
            'Characterised recombinant CHO cell bank, Sanger and next-generation sequencing of the integrated construct, peptide mapping by LC-MS/MS, chromogenic factor Xa substrate to confirm absence of catalytic activity',
        },
        {
          id: 'anx-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'CHO expression of the inactivated factor Xa variant',
          description:
            'Express the modified protein in a Chinese hamster ovary system with no additives of human or animal origin. Removing the Gla domain also removes the vitamin-K-dependent gamma-carboxylation step that limits the yield of every other recombinant clotting factor, which is a manufacturing consequence of a design choice made for safety.',
          dependsOnStepId: 'anx-w1',
          reagentsAndBuffer:
            'Chemically defined animal-component-free medium, controlled perfusion or fed-batch bioreactor, no human or animal derived additives at any stage',
        },
        {
          id: 'anx-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Chromatographic purification with two validated viral clearance steps',
          description:
            'Purify to a lyophilised powder, incorporating the two validated virus clearance operations the manufacturing process specifies. The product is presented as 200 mg single-dose vials with no preservative.',
          dependsOnStepId: 'anx-w2',
          reagentsAndBuffer:
            'Ion-exchange and hydrophobic-interaction chromatography, validated viral inactivation and small-virus filtration, formulation in tromethamine, L-arginine hydrochloride, sucrose, mannitol and polysorbate 80 at pH 7.8',
        },
        {
          id: 'anx-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Sequestration of the inhibitor in circulating plasma',
          description:
            'Confirm the decoy captures apixaban and rivaroxaban in plasma without generating thrombin itself. This step also has to detect the second, less-advertised action: binding and inhibition of tissue factor pathway inhibitor, which raises tissue-factor-initiated thrombin generation independently of any drug being reversed.',
          dependsOnStepId: 'anx-w3',
          reagentsAndBuffer:
            'Anticoagulated human plasma spiked with apixaban or rivaroxaban, ultrafiltration for unbound drug, recombinant tissue factor pathway inhibitor binding assay, LC-MS/MS quantification',
        },
        {
          id: 'anx-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Anti-factor-Xa activity and endogenous thrombin potential',
          description:
            'Measure the licensing endpoint — the fall in anti-factor-Xa activity from baseline to nadir — alongside thrombin generation. Reporting both is the point: the anti-Xa fall is what the approval was granted on, and thrombin generation is where the procoagulant tail of the drug becomes visible.',
          dependsOnStepId: 'anx-w4',
          reagentsAndBuffer:
            'Chromogenic anti-factor-Xa assay calibrated separately for apixaban, rivaroxaban and edoxaban, calibrated automated thrombogram for endogenous thrombin potential, tissue factor trigger',
        },
      ],
    },
    keyAudits: [
      {
        id: 'anx-a1',
        category: 'inferred',
        title: 'The FDA wrote the caveat into the indication itself',
        laymanSummary:
          'The label does not merely omit an outcome claim. It states in the indication that approval was based on a blood test in healthy volunteers and that an improvement in haemostasis has not been established.',
        technicalDetails:
          'The ANDEXXA indication reads, in full: reversal of anticoagulation in patients treated with rivaroxaban or apixaban due to life-threatening or uncontrolled bleeding, "approved under accelerated approval based on the change from baseline in anti-FXa activity in healthy volunteers... An improvement in hemostasis has not been established. Continued approval for this indication may be contingent upon the results of studies that demonstrate an improvement in hemostasis in patients." The healthy volunteers in question were not bleeding, were not on the drug for a medical reason, and were young. Accelerated approval was granted under BLA 125586 in 2018, and the label carrying this language was still in effect on 23 May 2025.',
        evidenceSource:
          'ANDEXXA FDA-approved prescribing information, section 1 Indications and Usage, label effective 23 May 2025, BLA 125586',
        inferredClaim:
          'That a fall in anti-factor-Xa activity in a healthy volunteer predicts benefit in a patient bleeding into the brain — the inference the accelerated approval pathway explicitly permits and explicitly does not endorse',
        auditFlag: 'caution',
      },
      {
        id: 'anx-a2',
        category: 'measured',
        title: 'Randomised at last, it did control the bleed better than usual care',
        laymanSummary:
          'In 530 patients with a brain haemorrhage on a factor Xa inhibitor, andexanet met the primary endpoint: 67.0% achieved haemostatic control against 53.1% on usual care, most of whom got clotting factor concentrate instead.',
        technicalDetails:
          'ANNEXA-I randomised patients 1:1 within 15 hours of taking a factor Xa inhibitor to andexanet or usual care. The primary endpoint combined haematoma volume expansion of 35% or less at 12 hours, an increase of fewer than 7 points on the NIH Stroke Scale at 12 hours, and no rescue therapy between 3 and 12 hours. Efficacy was assessed in an interim analysis of 452 patients: 150 of 224 (67.0%) on andexanet against 121 of 228 (53.1%) on usual care, adjusted difference 13.4 percentage points (95% CI 4.6 to 22.2, p=0.003). The median reduction in anti-factor-Xa activity from baseline to the 1-to-2-hour nadir was 94.5% against 26.9% (p<0.001). Of the usual-care patients, 85.5% received prothrombin complex concentrate, so this is a comparison against active treatment, not against nothing.',
        evidenceSource:
          'Connolly SJ, Sharma M, Cohen AT, et al. Andexanet for Factor Xa Inhibitor-Associated Acute Intracerebral Hemorrhage. N Engl J Med 2024;390(19):1745-1755',
        doi: '10.1056/NEJMoa2313040',
        measuredMetric:
          'Composite haemostatic efficacy at 12 hours, and median reduction in anti-factor-Xa activity to nadir',
        auditFlag: 'verified',
      },
      {
        id: 'anx-a3',
        category: 'failed',
        title: 'The same trial showed four times the ischaemic stroke rate',
        laymanSummary:
          'Thrombotic events happened in 10.3% of the andexanet group against 5.6% on usual care. Ischaemic stroke — a clot blocking an artery in the brain, in patients already having a brain bleed — occurred in 6.5% against 1.5%.',
        technicalDetails:
          'In the 530-patient safety population of ANNEXA-I, thrombotic events occurred in 27 of 263 (10.3%) on andexanet and 15 of 267 (5.6%) on usual care, a difference of 4.6 percentage points (95% CI 0.1 to 9.2, p=0.048). Ischaemic stroke occurred in 17 patients (6.5%) against 4 (1.5%). The trial authors state the conclusion themselves: andexanet resulted in better control of haematoma expansion than usual care but was associated with thrombotic events, including ischaemic stroke. The mechanism is not only the removal of anticoagulation — andexanet also binds and inhibits tissue factor pathway inhibitor, which raises tissue-factor-initiated thrombin generation independently of the drug being reversed, an effect the label describes as a separate procoagulant action.',
        evidenceSource:
          'Connolly SJ, Sharma M, Cohen AT, et al. N Engl J Med 2024;390(19):1745-1755; ANDEXXA prescribing information, boxed warning and section 12.1',
        doi: '10.1056/NEJMoa2313040',
        measuredMetric:
          'Thrombotic events and ischaemic stroke at 30 days in the randomised safety population',
        auditFlag: 'caution',
      },
      {
        id: 'anx-a4',
        category: 'failed',
        title: 'Better haematoma control did not make the patients better',
        laymanSummary:
          'The bleed was controlled more often, and at thirty days there was no appreciable difference in how disabled the patients were or in how many had died.',
        technicalDetails:
          'The ANNEXA-I report states that there were no appreciable differences between the groups in the score on the modified Rankin scale or in death within 30 days. This is the exact junction the entire reversal-agent field rests on: haematoma expansion is a strong prognostic marker, and reducing it in a randomised trial did not move the outcome it is a marker for. The trial was not powered for functional outcome, and it was stopped early once the interim efficacy analysis met its threshold, which limits what can be concluded about the null result on disability. That limitation cuts both ways — early stopping on a surrogate is precisely how a trial ends up unable to answer the question that matters.',
        evidenceSource:
          'Connolly SJ, Sharma M, Cohen AT, et al. Andexanet for Factor Xa Inhibitor-Associated Acute Intracerebral Hemorrhage. N Engl J Med 2024;390(19):1745-1755',
        doi: '10.1056/NEJMoa2313040',
        measuredMetric:
          'Modified Rankin scale score and all-cause death within 30 days in the randomised population',
        auditFlag: 'contested',
      },
      {
        id: 'anx-a5',
        category: 'measured',
        title: 'In the uncontrolled cohort, 80% achieved haemostasis and 18% died',
        laymanSummary:
          'The single-arm study that supported approval enrolled 479 patients with major bleeding. Four in five had good or excellent haemostasis. One in ten had a clot. Of those on apixaban or rivaroxaban, 18% were dead within 45 days.',
        technicalDetails:
          'ANNEXA-4 was a multicentre, prospective, phase 3b/4 single-group cohort study, mean age 78, 81% anticoagulated for atrial fibrillation, bleeding predominantly intracranial (69%) or gastrointestinal (23%). Median anti-factor-Xa activity fell from 146.9 to 10.0 ng/mL in evaluable apixaban patients (93% reduction) and from 214.6 to 10.8 ng/mL in rivaroxaban patients (94%). Excellent or good haemostasis occurred in 274 of 342 evaluable patients, 80% (95% CI 75 to 84). Thrombotic events occurred in 50 of 479 (10%). In the 419-patient apixaban-or-rivaroxaban safety population described in the label there were 75 deaths (18%), average time to death 15 days, all before day 45. There was no control group, so none of these numbers can be compared to anything.',
        evidenceSource:
          'Connolly SJ, Sharma M, Milling TJ Jr, et al. Final Study Report of Andexanet Alfa for Major Bleeding With Factor Xa Inhibitors. Circulation 2023;147(13):1026-1038',
        doi: '10.1161/CIRCULATIONAHA.121.057844',
        measuredMetric:
          'Anti-factor-Xa activity reduction from baseline and adjudicated excellent or good haemostatic efficacy at 12 hours',
        auditFlag: 'verified',
      },
      {
        id: 'anx-a6',
        category: 'conclusion_shift',
        title: 'After andexanet, heparin can stop working — discovered after approval',
        laymanSummary:
          'Patients who received andexanet and then needed heparin, for instance to go on bypass, were sometimes found not to respond to it at all, with serious clots as a result. This was added to the label from postmarketing reports, not from the trials.',
        technicalDetails:
          'Section 5.2 of the ANDEXXA label reports unresponsiveness to unfractionated heparin leading to non-prolongation of activated clotting times and serious thrombotic events following administration, sourced to postmarketing experience rather than to the clinical programme, with the warnings section revised as recently as March 2025. The mechanism follows from the design: andexanet sequesters the heparin-antithrombin complex as well as direct inhibitors, so the anticoagulant a cardiac surgeon depends on cannot be established. The label also warns that re-elevation or incomplete reversal of anticoagulant activity can occur, and states that safety has not been evaluated in patients who received prothrombin complex concentrate, recombinant factor VIIa or whole blood products within the preceding seven days — which is a large share of the patients the drug is used in.',
        evidenceSource:
          'ANDEXXA FDA-approved prescribing information, sections 5.2 Unresponsiveness to Unfractionated Heparin and 5.3 Re-elevation or Incomplete Reversal, warnings revised March 2025',
        inferredClaim:
          'That a decoy specific to direct factor Xa inhibitors would leave other anticoagulation strategies intact — an assumption that survived the trials and failed in practice',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A bolus followed by an infusion, because the decoy runs out',
        laymanDesc:
          'Given straight into a vein as an initial dose and then a continuous drip. The drip exists because the decoy is cleared quickly while the anticoagulant is still being absorbed from the gut.',
        molecularDetail:
          'Supplied as 200 mg lyophilised single-dose vials reconstituted with sterile water. The two-phase regimen reflects a short plasma half-life against a factor Xa inhibitor that may still be absorbing; the label warns that re-elevation or incomplete reversal of anticoagulant activity can occur.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It circulates in the plasma and enters nothing',
        laymanDesc:
          'The target is a drug dissolved in the blood, so the decoy works entirely in the bloodstream. No cell is entered and no receptor is engaged.',
        molecularDetail:
          'A 41 kDa recombinant protein with the Gla domain deleted. That deletion is what stops it docking onto phospholipid membranes and assembling into the prothrombinase complex — the very feature that would have made it a clotting factor rather than a decoy.',
        iconName: 'Droplet',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The anticoagulant binds the decoy instead of the real enzyme',
        laymanDesc:
          'Apixaban and rivaroxaban cannot tell the difference between real factor Xa and this broken copy. They bind the copy, one molecule to one molecule, and are taken out of play.',
        molecularDetail:
          'The active-site serine is substituted with alanine, so the protein binds the inhibitor at the catalytic site but cannot cleave prothrombin. Binding is stoichiometric and effectively irreversible over the timescale of treatment, which is why the dose is set by how much anticoagulant is present rather than by a concentration-response relationship.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Real factor Xa is freed and thrombin generation restarts',
        laymanDesc:
          'With the drug diverted, the patient’s own factor Xa is free to work again, and the cascade that builds a clot resumes within minutes.',
        molecularDetail:
          'Median anti-factor-Xa activity fell 93% in apixaban patients and 94% in rivaroxaban patients in ANNEXA-4, and by 94.5% to the 1-to-2-hour nadir in ANNEXA-I against 26.9% on usual care. Median endogenous thrombin potential returned to the normal range by the end of the bolus and stayed there through 24 hours for every inhibitor studied.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'A second, less-advertised push towards clotting',
        laymanDesc:
          'Beyond mopping up the drug, the decoy also blocks one of the body’s own brakes on clotting. That is an extra shove towards a clot in someone who has just had their anticoagulant removed.',
        molecularDetail:
          'The label states that another observed procoagulant effect of the ANDEXXA protein is its ability to bind to and inhibit tissue factor pathway inhibitor, and that inhibiting TFPI can increase tissue-factor-initiated thrombin generation. This action is independent of how much anticoagulant is being reversed, and it is the most plausible explanation for a thrombotic rate above what loss of anticoagulation alone would predict.',
        iconName: 'AlertTriangle',
        visualStage: 'catalytic_action',
      },
      {
        step: 6,
        title: 'The haematoma stops growing — and the patient is where they were',
        laymanDesc:
          'The bleed is controlled more often than with standard treatment. Thirty days later, how disabled the patient is and whether they are alive look the same in both groups.',
        molecularDetail:
          'Haemostatic efficacy 67.0% against 53.1% (adjusted difference 13.4 percentage points, 95% CI 4.6 to 22.2, p=0.003), with no appreciable difference in modified Rankin scale score or 30-day death, alongside thrombotic events of 10.3% against 5.6% and ischaemic stroke of 6.5% against 1.5%. This step is the whole audit: a surrogate that moved and an outcome that did not.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'ANNEXA-I (NCT03661528) — andexanet versus usual care in intracerebral haemorrhage',
        phase: 'Phase 4 randomised open-label trial, stopped early at a positive interim analysis',
        sampleSize: 530,
        primaryEndpoint:
          'Composite haemostatic efficacy at 12 hours: haematoma expansion 35% or less, NIH Stroke Scale increase under 7 points, and no rescue therapy between 3 and 12 hours',
        endpointMet: true,
        statisticalPValue:
          '67.0% versus 53.1%, adjusted difference 13.4 percentage points (95% CI 4.6 to 22.2), p = 0.003',
        unreportedAdverseSignals:
          'Thrombotic events 10.3% versus 5.6% (p=0.048) and ischaemic stroke 6.5% versus 1.5%. No appreciable difference in modified Rankin scale or 30-day death. Efficacy was judged on an interim analysis of 452 of the 530 patients, and the trial was stopped early.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'ANNEXA-4 (NCT02329327) — final study report',
        phase: 'Phase 3b/4 multicentre prospective single-group cohort study, no control arm',
        sampleSize: 479,
        primaryEndpoint:
          'Co-primary: change in anti-factor-Xa activity from baseline during treatment, and adjudicated excellent or good haemostatic efficacy at 12 hours',
        endpointMet: true,
        statisticalPValue:
          'Anti-factor-Xa reduction 93% (95% CI 94 to 93) for apixaban and 94% (95% CI 95 to 93) for rivaroxaban; excellent or good haemostasis in 274 of 342 evaluable patients, 80% (95% CI 75 to 84)',
        unreportedAdverseSignals:
          'Thrombotic events in 50 of 479 (10%). Among the 419 apixaban or rivaroxaban patients in the label safety population there were 75 deaths (18%), all before day 45. With no control group these figures have no comparator.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'ANNEXA-A (NCT02207725) bolus phase — the healthy-volunteer basis for accelerated approval',
        phase: 'Two-part randomised placebo-controlled study in healthy older volunteers',
        sampleSize: 33,
        primaryEndpoint: 'Mean percent change in anti-factor-Xa activity',
        endpointMet: true,
        statisticalPValue:
          'Anti-factor-Xa activity reduced by 94% on andexanet against 21% on placebo (p<0.001); thrombin generation fully restored in 100% against 11% of participants within 2 to 5 minutes',
        unreportedAdverseSignals:
          'Transient increases in d-dimer and prothrombin fragments 1 and 2 were observed in a subgroup, resolving within 24 to 72 hours. Participants were healthy older volunteers who were not bleeding and had no indication for anticoagulation. The companion rivaroxaban study ANNEXA-R (NCT02220725) reported a 92% reduction against 18% in its 41 bolus participants.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Composite haemostatic efficacy of 67.0% against 53.1% on usual care in a randomised trial of 530 patients with factor-Xa-inhibitor-associated intracerebral haemorrhage (adjusted difference 13.4 percentage points, 95% CI 4.6 to 22.2)',
        'Median anti-factor-Xa activity reduction of 94.5% to nadir against 26.9% on usual care (p<0.001)',
        'Excellent or good haemostasis in 80% (95% CI 75 to 84) of 342 evaluable patients in the uncontrolled ANNEXA-4 cohort',
        'Thrombotic events in 10.3% against 5.6%, and ischaemic stroke in 6.5% against 1.5%, in the randomised safety population',
        'Endogenous thrombin potential within the normal range from the end of the bolus through 24 hours for every factor Xa inhibitor studied',
      ],
      unsupportedInferences: [
        'That reducing anti-factor-Xa activity improves haemostasis — the FDA states on the label that this has not been established, and made continued approval contingent on studies that show it',
        'That better haematoma control translates into better function or survival — the randomised trial found no appreciable difference in modified Rankin score or 30-day death',
        'That a 94% fall in a blood test in healthy volunteers describes what happens in an elderly patient bleeding into the brain',
        'That the excess thrombosis is entirely the loss of anticoagulation rather than the drug’s own inhibition of tissue factor pathway inhibitor',
      ],
      whatFailedInitially: [
        'Modified Rankin scale and 30-day mortality were unchanged in the only randomised trial, despite the primary surrogate endpoint being met',
        'Ischaemic stroke occurred four times as often on andexanet as on usual care in patients who were already having a brain haemorrhage',
        'Unresponsiveness to unfractionated heparin with serious thrombotic consequences was identified only after approval, from postmarketing reports, and added to the warnings section',
        'The label states that safety has not been evaluated in patients given prothrombin complex concentrate, recombinant factor VIIa or whole blood in the preceding seven days — a common situation for the patients who receive it',
      ],
      realWorldOutcome: [
        'Still marketed under accelerated approval in 2025, with the label’s own statement that an improvement in haemostasis has not been established still in the indication',
        'US$8,806.75 in average Medicaid spending per claim in 2023 across 55 national claims, against US$3,150.56 per claim for the prothrombin complex concentrate it is usually compared to',
        'Carries a boxed warning for arterial and venous thromboembolism, ischaemic events including myocardial infarction and ischaemic stroke, cardiac arrest and sudden death',
        'Guideline bodies have had to weigh a drug that demonstrably controls the bleed against one randomised trial showing no functional benefit and a doubling of thrombosis',
      ],
    },
    deliverySystem: {
      type: 'Intravenous bolus followed by a continuous infusion, given once in an emergency setting',
      description:
        'Supplied as 200 mg lyophilised single-dose vials, reconstituted with sterile water for injection and given as an initial bolus followed by a continuous infusion. There is no other route and no repeat course: the drug is given during the acute bleed and stopped.',
      safetyProfile:
        'Carries a boxed warning for arterial and venous thromboembolic events, ischaemic events including myocardial infarction and ischaemic stroke, cardiac arrest and sudden death. In the randomised trial thrombotic events occurred in 10.3% against 5.6% on usual care. Unresponsiveness to unfractionated heparin, with non-prolongation of activated clotting times and serious thrombotic events, has been reported after administration. Re-elevation or incomplete reversal of anticoagulant activity can occur. Safety has not been evaluated in patients who had a thromboembolic event or disseminated intravascular coagulation in the preceding two weeks, or who received prothrombin complex concentrate, recombinant factor VIIa or whole blood products in the preceding seven days. The commonest adverse reactions at 5% or more were urinary tract infection and pneumonia.',
    },
    commonQuestions: [
      {
        q: 'Does it reverse every blood thinner?',
        a: 'No. The licensed indication is apixaban and rivaroxaban only. It has been used off-label against edoxaban and enoxaparin, with a smaller anti-factor-Xa reduction in both — 71% for edoxaban and 75% for enoxaparin in the ANNEXA-4 cohort, against 93% and 94% for the two licensed drugs. It does nothing for dabigatran, which blocks thrombin rather than factor Xa and has its own antidote, and nothing for warfarin. And after it has been given, unfractionated heparin may not work at all, which is a serious problem if the patient then needs cardiac surgery.',
        auditNote:
          'The heparin interaction was found after approval, from postmarketing reports, and sits in section 5.2 of the label.',
      },
      {
        q: 'The trial was positive. Why does this page read as cautious?',
        a: 'Because of which endpoint was positive. ANNEXA-I met its primary endpoint, a composite that is mostly about haematoma size at twelve hours. On the outcomes a patient would recognise — how disabled they were and whether they were alive at thirty days — the report states there were no appreciable differences between the groups. Meanwhile thrombotic events roughly doubled and ischaemic strokes went from four patients to seventeen. A trial can be positive and still leave the central question open, and this one did.',
        auditNote:
          'This is the clearest measured-versus-inferred gap in the reversal-agent field: a surrogate moved by 13.4 percentage points, and an outcome that did not move at all.',
      },
      {
        q: 'What does "accelerated approval" mean here?',
        a: 'It means the FDA licensed the drug on a laboratory measurement while requiring the sponsor to go and demonstrate clinical benefit afterwards. The measurement was the fall in anti-factor-Xa activity, and it was made in healthy volunteers rather than in bleeding patients. The label says so in the indication itself and adds that continued approval may be contingent on studies demonstrating improved haemostasis. That confirmatory trial, ANNEXA-I, reported in 2024, met a haematoma endpoint and did not change disability or death.',
      },
      {
        q: 'Why would an antidote cause strokes?',
        a: 'Two reasons, and only one of them is obvious. The obvious one is that these patients were anticoagulated for a reason — usually atrial fibrillation — and taking that protection away returns them to the clotting risk it was holding back. The less obvious one is written in the label: beyond mopping up the anticoagulant, andexanet binds and inhibits tissue factor pathway inhibitor, one of the body’s own brakes on clotting, and that raises thrombin generation independently of how much drug is being reversed. The randomised trial cannot separate the two.',
      },
      {
        q: 'Is it worth nearly three times the price of clotting factor concentrate?',
        a: 'The only randomised comparison is ANNEXA-I, where 85.5% of the usual-care arm received prothrombin complex concentrate. Andexanet controlled the haematoma more often, caused more clots, and produced the same functional outcome and the same 30-day mortality. On Medicaid data for 2023 the andexanet claim averaged US$8,806.75 against US$3,150.56 for Kcentra. Those are the numbers; the trade-off between a surrogate benefit and an ischaemic harm at three times the cost is a judgement this page will not make for a reader.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Connolly SJ, Sharma M, Cohen AT, et al. Andexanet for Factor Xa Inhibitor-Associated Acute Intracerebral Hemorrhage. N Engl J Med 2024;390(19):1745-1755',
        identifier: '10.1056/NEJMoa2313040',
        kind: 'doi',
      },
      {
        label:
          'Connolly SJ, Sharma M, Milling TJ Jr, et al. Final Study Report of Andexanet Alfa for Major Bleeding With Factor Xa Inhibitors. Circulation 2023;147(13):1026-1038',
        identifier: '10.1161/CIRCULATIONAHA.121.057844',
        kind: 'doi',
      },
      {
        label:
          'Connolly SJ, Crowther M, Eikelboom JW, et al. Full Study Report of Andexanet Alfa for Bleeding Associated with Factor Xa Inhibitors. N Engl J Med 2019;380(14):1326-1335',
        identifier: '10.1056/NEJMoa1814051',
        kind: 'doi',
      },
      {
        label:
          'Rodrigues AO, David C, Ferreira JJ, Pinto FJ, Costa J, Caldeira D. The incidence of thrombotic events with idarucizumab and andexanet alfa: A systematic review and meta-analysis. Thromb Res 2020;196:291-296',
        identifier: '10.1016/j.thromres.2020.09.003',
        kind: 'doi',
      },
      {
        label: 'ANNEXA-I — Andexanet Alfa in Acute Intracranial Haemorrhage',
        identifier: 'NCT03661528',
        kind: 'nct',
      },
      {
        label: 'ANNEXA-4 — Andexanet Alfa in Patients With Acute Major Bleeding',
        identifier: 'NCT02329327',
        kind: 'nct',
      },
      {
        label:
          'Siegal DM, Curnutte JT, Connolly SJ, et al. Andexanet Alfa for the Reversal of Factor Xa Inhibitor Activity. N Engl J Med 2015;373(25):2413-2424 — the ANNEXA-A and ANNEXA-R healthy-volunteer studies',
        identifier: '10.1056/NEJMoa1510991',
        kind: 'doi',
      },
      {
        label: 'ANNEXA-A — andexanet alfa reversal of apixaban in healthy older volunteers',
        identifier: 'NCT02207725',
        kind: 'nct',
      },
      {
        label:
          'ANDEXXA (coagulation factor Xa (recombinant), inactivated-zhzo) — FDA-approved prescribing information, boxed warning, indication, sections 5.1 to 5.3, 6.1, 11 and 12.1; BLA 125586, label effective 23 May 2025',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22ANDEXXA%22',
        kind: 'regulatory',
      },
      {
        label:
          'CMS Medicaid Spending by Drug — Andexxa, 55 claims and US$484,371.52 total spending in 2023, US$8,806.75 average per claim',
        identifier:
          'https://data.cms.gov/summary-statistics-on-use-and-payments/medicaid-drug-spending/medicaid-spending-by-drug',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 8. Recombinant factor VIIa — three randomised trials, twenty-one years, the same wrong answer.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'recombinant-factor-viia',
    name: 'Recombinant Factor VIIa',
    tradeName: 'NovoSeven RT / Sevenfact',
    sponsor:
      'Novo Nordisk markets NovoSeven RT; Laboratoire Français du Fractionnement et des Biotechnologies markets the second recombinant product, Sevenfact, under BLA 125641',
    targetGene: 'F7 — the gene for human coagulation factor VII',
    targetProtein:
      'Tissue factor, with which factor VIIa forms the complex that activates factor X to Xa and factor IX to IXa. At the pharmacological concentrations used it also generates thrombin on the surface of activated platelets',
    modality: 'Recombinant Protein / Biologic',
    approvalStatus: 'FDA Approved',
    indication:
      'Treatment of bleeding episodes and prevention of bleeding in surgery or invasive procedures, in haemophilia A or B with inhibitors to factor VIII or factor IX, in acquired haemophilia, and in congenital factor VII deficiency',
    patientFriendlyIndication:
      'Stopping bleeding in people with haemophilia whose bodies have learned to destroy the replacement clotting factor they used to be given',
    anatomicalSite:
      'The surface of the injured vessel wall and of activated platelets, where tissue factor is exposed',
    conditionContext: {
      conditionExplainer:
        'People with severe haemophilia are treated by replacing the clotting factor they lack. In roughly a quarter of them the immune system starts treating that replacement as foreign and makes antibodies — inhibitors — that destroy it. From that point the standard treatment stops working, and a bleed into a joint or the brain has nothing standing in its way.',
      whyItMatters:
        'Factor VIIa gets around the blockade entirely. Instead of replacing the missing factor, it starts the cascade at a different point, one the inhibitor antibodies do not recognise. For that population it is genuinely a bypass, and the evidence for it there is real.',
      whoTakesThis:
        'Haemophilia patients with inhibitors, people with acquired haemophilia, and people with the rare inherited deficiency of factor VII itself. Everything else this drug has been given for is off-label.',
      clinicalGoals:
        'Stop or prevent a specific bleed in a specific patient who has no other bypassing option. Trials outside that population have consistently reduced bleeding without improving outcome.',
    },
    oneSentenceVerdict:
      'A recombinant clotting factor that bypasses the missing links in haemophilia and works there, which was then given for twenty years to people bleeding into the brain on the strength of a 399-patient trial that found lower mortality — an effect that vanished in an 841-patient phase 3 in 2008 and vanished again in a 626-patient trial stopped for futility in 2026, both of which confirmed the haematoma shrinks and neither of which found any benefit to the patient.',
    laymanHowItWorks:
      'Clotting normally runs as a chain of enzymes, each switching on the next. Haemophilia breaks one link in the middle of that chain, and in some people the replacement for that link is destroyed by their own antibodies. Factor VIIa joins the chain higher up, at the point where an injured blood vessel first exposes a protein called tissue factor. Given in large amounts it generates thrombin directly on the surface of platelets gathered at the wound, skipping the broken link entirely.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 47,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$2.75 per microgram of average Medicare Part B spending in 2024 under HCPCS J7189 (NovoSeven RT), against a 2024 average sales price of US$2.483 per microgram; the average Medicaid claim in 2023 was US$75,625.52',
      markupEstimate:
        'Not calculable. No published per-dose cost of production exists for this recombinant glycoprotein, so there is no denominator to divide the payment by.',
      openPatentNotes:
        'Two recombinant products are licensed in the United States, NovoSeven RT and Sevenfact, which are not interchangeable and are priced separately. The protein is a 406-residue vitamin-K-dependent glycoprotein expressed in baby hamster kidney cells and requires gamma-carboxylation, which is one of the harder post-translational modifications to achieve at scale and part of why the drug is priced where it is.',
      synthesisComplexity: 'High',
      costSource: NO_COST_STUDY_SOURCE,
      priceSource: CMS_PART_B_SOURCE,
    },
    substitutes: {
      summary:
        'Within haemophilia with inhibitors the alternatives are activated prothrombin complex concentrate, which does the same bypassing job with pooled human factors, and — for prevention rather than treatment — emicizumab, which removes most of the need for a bypassing agent at all. Outside haemophilia there is no substitute question to answer, because the evidence says not to use it.',
      conventionalRx: [
        {
          name: 'Activated prothrombin complex concentrate (FEIBA)',
          class: 'Plasma-derived bypassing agent',
          howItCompares:
            'Pooled human factors including activated factor VII, achieving the same bypass from a different starting material. The two are broadly interchangeable in practice, with individual patients responding better to one than the other. Giving both together, or either alongside emicizumab, raises thrombotic risk substantially.',
          typicalCost:
            'A plasma-derived concentrate priced per unit of factor activity; both bypassing agents are among the most expensive treatments in haematology.',
          prosAndCons:
            'Pros: long experience, an alternative when factor VIIa fails. Cons: plasma-derived, and the NovoSeven label specifically flags concomitant prothrombin complex concentrate as a thrombotic risk factor.',
        },
        {
          name: 'Emicizumab (Hemlibra)',
          class: 'Bispecific antibody, factor VIII mimetic',
          howItCompares:
            'Prevents bleeds rather than treating them, and works whether or not inhibitors are present because it is not factor VIII and the antibodies do not recognise it. It has largely replaced routine bypassing-agent prophylaxis; factor VIIa remains for breakthrough bleeds and surgery.',
          typicalCost:
            'US$52.49 per 0.5 mg of average Medicare Part B spending in 2024 under HCPCS J7170.',
          prosAndCons:
            'Pros: subcutaneous, given weekly to monthly, an 87% reduction in treated bleeds against no prophylaxis. Cons: thrombotic microangiopathy occurred when it was combined with activated prothrombin complex concentrate.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'peptide_sequence',
      molecularWeight:
        'Approximately 50 kDa. A vitamin-K-dependent glycoprotein of 406 amino acid residues, structurally similar to plasma-derived factor VIIa',
      targetReceptorAffinity:
        'Acts through complex formation with tissue factor at the site of vessel injury. At therapeutic concentrations it also increases thrombin generation on activated platelets independently of tissue factor, with an effect demonstrable in vitro at concentrations as low as 10 nM',
      structureSource: {
        label:
          'NovoSeven RT (Coagulation Factor VIIa, Recombinant) FDA-approved prescribing information, section 11 Description and section 12 Clinical Pharmacology',
        identifier: 'https://api.fda.gov/drug/label.json?search=%22NovoSeven%22',
        kind: 'regulatory',
      },
      laboratoryWorkflow: [
        {
          id: 'f7-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Release of the BHK cell bank and the bovine-serum-containing medium',
          description:
            'Confirm identity and adventitious-agent freedom of the baby hamster kidney line, and qualify the newborn calf serum in the culture medium. That serum is unusual for a modern biologic and is the reason the viral clearance package for this product is written the way it is.',
          reagentsAndBuffer:
            'Characterised BHK cell bank, qualified newborn calf serum with country-of-origin documentation, bovine viral diarrhoea and other adventitious agent panels, endotoxin testing',
        },
        {
          id: 'f7-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Expression of single-chain factor VII with gamma-carboxylation',
          description:
            'Express the cloned human factor VII gene so that the Gla domain is gamma-carboxylated, which is the vitamin-K-dependent modification the protein needs in order to bind calcium and dock onto membranes. Under-carboxylated material is inactive, and carboxylation capacity is what caps the yield.',
          dependsOnStepId: 'f7-w1',
          reagentsAndBuffer:
            'Baby hamster kidney culture in medium containing newborn calf serum, vitamin K supplementation, controlled bioreactor with secretion into the medium in single-chain form',
        },
        {
          id: 'f7-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Chromatographic purification with autocatalytic activation to the two-chain form',
          description:
            'Purify the single-chain precursor and let it convert itself to the active two-chain form by autocatalysis during chromatography. The activation step is not a separate reaction added by the manufacturer; it is the protein cleaving itself once concentrated on the column. Validated removal of murine leukaemia virus, SV40, pox virus, reovirus, bovine enterovirus and infectious bovine rhinotracheitis virus is demonstrated across the process.',
          dependsOnStepId: 'f7-w2',
          reagentsAndBuffer:
            'Ion-exchange and immunoaffinity chromatography, calcium-containing elution buffers, viral clearance validation panel, SDS-PAGE for single-chain to two-chain conversion',
        },
        {
          id: 'f7-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Docking onto tissue factor and the activated platelet surface',
          description:
            'Confirm the calcium-dependent Gla domain binds anionic phospholipid and that the protein forms a functional complex with tissue factor. The second half of this step is the pharmacologically distinctive one: at the concentrations achieved by dosing, thrombin is generated on activated platelets even where tissue factor is scarce.',
          dependsOnStepId: 'f7-w3',
          reagentsAndBuffer:
            'Relipidated recombinant tissue factor, calcium chloride, platelet-rich plasma from normal and haemophilic donors adjusted to 200,000 platelets per microlitre, corn trypsin inhibitor to block the contact pathway',
        },
        {
          id: 'f7-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Thrombin generation and prothrombin time in factor-deficient plasma',
          description:
            'Measure the rate and peak of thrombin generation against a tissue factor trigger, and the prothrombin time in factor-VII-deficient plasma for potency. Both are laboratory endpoints, and the distinction between them and a clinical outcome is the entire subject of this drug’s history.',
          dependsOnStepId: 'f7-w4',
          reagentsAndBuffer:
            'Calibrated automated thrombogram with fluorogenic thrombin substrate, tissue factor and phospholipid trigger, congenitally factor-VII-deficient plasma, international factor VIIa reference standard',
        },
      ],
    },
    keyAudits: [
      {
        id: 'f7-a1',
        category: 'conclusion_shift',
        title: 'A 399-patient trial said it cut deaths by a third. It did not.',
        laymanSummary:
          'In 2005 a randomised trial of 399 patients with brain haemorrhage reported 18% mortality on factor VIIa against 29% on placebo, and better function at 90 days. Three years later a trial twice the size, testing the same doses, found nothing.',
        technicalDetails:
          'The phase 2 trial randomised 399 patients within three hours of onset to placebo or 40, 80 or 160 micrograms per kilogram. Haematoma growth was reduced by 3.3, 4.5 and 5.8 mL respectively (p=0.01), death or severe disability fell from 69% to 55%, 49% and 54% (p=0.004 for the pooled comparison), and 90-day mortality fell from 29% to 18% pooled across the treatment arms (p=0.02). Serious thromboembolic events, mainly myocardial or cerebral infarction, occurred in 7% against 2% (p=0.12). The phase 3 FAST trial then randomised 841 patients within four hours to placebo, 20 or 80 micrograms per kilogram. The 80 microgram arm again reduced haematoma growth — 11% expansion against 26% on placebo, p<0.001, a 3.8 mL absolute reduction (95% CI 0.9 to 6.7, p=0.009) — and produced no difference whatever in poor clinical outcome: 24% on placebo, 26% at 20 micrograms, 29% at 80 micrograms. Arterial thromboembolic events were more frequent at 80 micrograms than on placebo, 9% against 4% (p=0.04).',
        evidenceSource:
          'Mayer SA, Brun NC, Begtrup K, et al. Efficacy and safety of recombinant activated factor VII for acute intracerebral hemorrhage. N Engl J Med 2008;358(20):2127-2137',
        doi: '10.1056/NEJMoa0707534',
        measuredMetric:
          'Poor outcome (severe disability or death on the modified Rankin scale) at 90 days, and mean percentage haematoma growth at 24 hours',
        inferredClaim:
          'That the mortality benefit seen in a 399-patient phase 2 was real — an inference that did not survive its own confirmatory trial and has now failed twice',
        auditFlag: 'contested',
      },
      {
        id: 'f7-a2',
        category: 'failed',
        title: 'Given within two hours, it still failed — and tripled life-threatening clots',
        laymanSummary:
          'The last objection was that the drug had been given too late. FASTEST gave it within two hours of the stroke, in patients selected to be the ones most likely to benefit. It was stopped for futility. Life-threatening clots were more than three times as common.',
        technicalDetails:
          'FASTEST was a multicentre, double-blind, randomised, placebo-controlled, adaptive phase 3 trial at 93 sites across six countries, screening 3,288 patients to randomise 626 between December 2021 and October 2025. Entry required a spontaneous intracerebral haemorrhage of 2 to 60 mL, limited intraventricular extension, a Glasgow Coma Scale of at least 8, no anticoagulation and no recent ischaemic event, with study drug given within two hours of onset — mean time to administration was 100 minutes. The trial met its prespecified futility stopping criteria at the second interim analysis. The adjusted common odds ratio for modified Rankin scale at 180 days was 1.09 (95% CI 0.79 to 1.51, p=0.61). Life-threatening thromboembolic complications within four days occurred in 15 of 328 on treatment against 4 of 298 on placebo, relative risk 3.41 (95% CI 1.14 to 10.15, p=0.020). Haematoma growth was again reduced, by 3.7 mL (95% CI 1.9 to 5.4), and combined intracerebral plus intraventricular growth by 5.2 mL (95% CI 2.8 to 7.6).',
        evidenceSource:
          'Recombinant factor VIIa versus placebo for spontaneous intracerebral haemorrhage within 2 h of symptom onset (FASTEST): a multicentre, double-blind, randomised, placebo-controlled, phase 3 trial. Lancet 2026;407(10530):773-783',
        doi: '10.1016/S0140-6736(26)00097-8',
        measuredMetric:
          'Modified Rankin scale at 180 days, and life-threatening thromboembolic events within four days',
        auditFlag: 'verified',
      },
      {
        id: 'f7-a3',
        category: 'measured',
        title: 'The haematoma really does stop growing. Three times over.',
        laymanSummary:
          'Every one of the three randomised trials found the same thing: give this drug and the bleed in the brain grows less. The size of that effect has been remarkably consistent across twenty-one years — and it has never once translated into a better patient.',
        technicalDetails:
          'Absolute reductions in 24-hour haematoma growth against placebo: 3.3 to 5.8 mL across dose arms in the 2005 phase 2 (p=0.01); 3.8 mL at 80 micrograms per kilogram in the 2008 phase 3 (95% CI 0.9 to 6.7, p=0.009); 3.7 mL in FASTEST (95% CI 1.9 to 5.4), with 5.2 mL for combined intracerebral and intraventricular volume. This is one of the most reproducible pharmacodynamic effects in acute stroke medicine. Haematoma expansion is also one of the strongest prognostic markers in intracerebral haemorrhage. The two facts together are exactly what makes this drug the definitive case study in the difference between a marker and a mechanism of harm you can intervene on.',
        evidenceSource:
          'Mayer SA, Brun NC, Begtrup K, et al. N Engl J Med 2005;352(8):777-785; N Engl J Med 2008;358(20):2127-2137; Lancet 2026;407(10530):773-783',
        doi: '10.1056/NEJMoa042991',
        measuredMetric:
          'Absolute reduction in intracerebral haematoma volume growth at 24 hours against placebo, across three randomised trials',
        auditFlag: 'verified',
      },
      {
        id: 'f7-a4',
        category: 'failed',
        title: 'Off-label, across five indications, it reduced no deaths and added clots',
        laymanSummary:
          'A systematic review looked at every off-label use — brain haemorrhage, cardiac surgery, trauma, liver transplantation, prostate surgery. No mortality benefit anywhere. Arterial clots increased with medium and high doses.',
        technicalDetails:
          'Yank et al. searched ten databases through December 2010 and included 16 randomised controlled trials, 26 comparative observational studies and 22 non-comparative observational studies across five off-label in-hospital indications. For intracranial haemorrhage, mortality was not improved at any dose, while arterial thromboembolism increased at medium dose (risk difference 0.03, 95% CI 0.01 to 0.06) and high dose (risk difference 0.06, 95% CI 0.01 to 0.11). For adult cardiac surgery there was no mortality difference and an increased risk of thromboembolism (risk difference 0.05, 95% CI 0.01 to 0.10). For body trauma there was no difference in mortality or thromboembolism, with a reduced risk of acute respiratory distress syndrome. Mortality was consistently higher in the observational studies than in the trials. The reviewers rated the amount and strength of evidence low for most outcomes and could not exclude publication bias.',
        evidenceSource:
          'Yank V, Tuohy CV, Logan AC, et al. Systematic review: benefits and harms of in-hospital use of recombinant factor VIIa for off-label indications. Ann Intern Med 2011;154(8):529-540',
        doi: '10.7326/0003-4819-154-8-201104190-00004',
        measuredMetric:
          'Mortality and arterial thromboembolism risk differences across five off-label indications',
        auditFlag: 'verified',
      },
      {
        id: 'f7-a5',
        category: 'measured',
        title: 'Inside its licence the thrombosis rate is 0.28% of bleeds treated',
        laymanSummary:
          'Used for what it is approved for, the drug is comparatively safe: about three thrombotic events per thousand bleeding episodes treated. The number is much higher in acquired haemophilia, at four in a hundred.',
        technicalDetails:
          'The NovoSeven RT label reports that in clinical trials within the approved indications, thrombotic events of possible or probable relationship occurred in 0.28% of bleeding episodes treated: 0.20% in haemophilia patients with inhibitors and 4% in acquired haemophilia. Patients with disseminated intravascular coagulation, advanced atherosclerotic disease, crush injury or septicaemia, and those given prothrombin complex concentrates concomitantly, are identified as being at increased risk because of circulating tissue factor or predisposing coagulopathy. The contrast between 0.28% inside the licence and a tripled relative risk of life-threatening thromboembolism in FASTEST is the central safety fact about this molecule: the risk is a function of who receives it.',
        evidenceSource:
          'NovoSeven RT FDA-approved prescribing information, section 5.1 Thrombotic Events within the Licensed Indications',
        measuredMetric:
          'Rate of thrombotic events of possible or probable relationship, per bleeding episode treated, within the approved indications',
        auditFlag: 'verified',
      },
      {
        id: 'f7-a6',
        category: 'conclusion_shift',
        title: 'The FDA put the off-label problem in the boxed warning itself',
        laymanSummary:
          'Most boxed warnings describe a risk of the drug. This one describes a risk of using the drug for things it was not approved for, and says the evidence for that risk comes from the trials of those very uses.',
        technicalDetails:
          'The NovoSeven RT boxed warning reads: "Serious thrombotic adverse events are associated with the use of NovoSeven RT outside labeled indications... Clinical studies have shown an increased risk of arterial thromboembolic adverse events with NovoSeven RT when administered outside the current approved indications. Fatal and non-fatal thrombotic events have been reported... Safety and efficacy of NovoSeven RT has not been established outside the approved indications." Section 5.2 attributes the finding to two meta-analyses of placebo-controlled trials in populations outside the approved indications, and separately records thrombosis in women treated for post-partum haemorrhage. A regulator writing a boxed warning about prescribing behaviour rather than about the molecule is unusual, and it is a direct consequence of a decade in which the drug was used far outside its licence on the strength of one phase 2 trial.',
        evidenceSource:
          'NovoSeven RT FDA-approved prescribing information, boxed warning and section 5.2 Thrombotic Events outside the Licensed Indications',
        inferredClaim:
          'That a drug which improves a coagulation endpoint in one disease will help anyone who is bleeding — the generalisation the boxed warning exists to stop',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Reconstituted from a powder and injected over a couple of minutes',
        laymanDesc:
          'Supplied as a freeze-dried powder in vials of one, two or five milligrams, mixed with its own diluent and given straight into a vein.',
        molecularDetail:
          'Each vial contains rFVIIa with sodium chloride, calcium chloride, glycylglycine, polysorbate 80, mannitol, sucrose and methionine, reconstituted in 10 mmol histidine to approximately 1 mg/mL. In FASTEST the dose was 80 micrograms per kilogram given intravenously over two minutes.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Calcium anchors it to the injured surface',
        laymanDesc:
          'The protein carries a specialised end that only works when it is loaded with calcium. That end lets it stick to the membranes exposed where a vessel has been torn.',
        molecularDetail:
          'The gamma-carboxyglutamic acid domain, produced by vitamin-K-dependent carboxylation during manufacture, binds calcium ions and through them the anionic phospholipid exposed on damaged membranes and activated platelets. Without carboxylation the molecule is inert, which is why that modification governs the yield of the whole process.',
        iconName: 'Lock',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It pairs with tissue factor, the body’s own alarm protein',
        laymanDesc:
          'Tissue factor is normally hidden inside vessel walls and is only exposed when one is damaged. Factor VIIa partners with it, and that partnership is what starts clotting at the site of an injury and nowhere else.',
        molecularDetail:
          'The factor VIIa-tissue factor complex activates factor X to Xa and factor IX to IXa. Restricting the reaction to sites of tissue factor exposure is the design feature that is supposed to keep the effect local, and it is also why circulating tissue factor in sepsis, disseminated intravascular coagulation or crush injury converts the drug into a systemic thrombotic hazard.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'At high doses it works on platelets directly, skipping the broken link',
        laymanDesc:
          'Given in the amounts used clinically, it also makes thrombin straight on the surface of platelets already gathered at the wound — which is how it works in haemophilia, where the usual route through the cascade is blocked.',
        molecularDetail:
          'In an in vitro model of tissue-factor-initiated coagulation with the contact pathway blocked by corn trypsin inhibitor, added rFVIIa increased both the rate and level of thrombin generation in normal and haemophilia A blood, with an effect at concentrations as low as 10 nM. Escalating doses in haemophilic platelet-rich plasma produce a dose-dependent rise in thrombin generation. This platelet-surface pathway is independent of factors VIII and IX, and therefore of the inhibitor antibodies against them.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Thrombin builds the fibrin plug — and the bleed grows less',
        laymanDesc:
          'The thrombin generated converts fibrinogen into fibrin and a plug forms. In brain haemorrhage this reliably makes the bleed smaller than it would have been.',
        molecularDetail:
          'Absolute reductions in 24-hour haematoma growth against placebo of 3.3 to 5.8 mL in the 2005 phase 2, 3.8 mL in the 2008 phase 3 and 3.7 mL in FASTEST — three independent randomised confirmations of the same pharmacodynamic effect across twenty-one years.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And the patient is no better, and more likely to have a clot',
        laymanDesc:
          'None of that made people less disabled or more likely to survive. What it did do was raise the rate of dangerous clots — three times over in the most recent trial.',
        molecularDetail:
          'Poor outcome at 90 days in FAST: 24% on placebo, 29% at 80 micrograms per kilogram. Modified Rankin at 180 days in FASTEST: adjusted common odds ratio 1.09 (95% CI 0.79 to 1.51, p=0.61). Life-threatening thromboembolism within four days in FASTEST: relative risk 3.41 (95% CI 1.14 to 10.15, p=0.020). Arterial thromboembolic events in FAST at 80 micrograms per kilogram: 9% against 4% on placebo (p=0.04).',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'FASTEST (NCT03496883) — rFVIIa within 2 hours of intracerebral haemorrhage',
        phase:
          'Phase 3 multicentre double-blind randomised placebo-controlled adaptive trial, 93 sites, stopped for futility',
        sampleSize: 626,
        primaryEndpoint: 'Functional outcome at 180 days by modified Rankin Scale',
        endpointMet: false,
        statisticalPValue:
          'Adjusted common odds ratio 1.09 (95% CI 0.79 to 1.51), p = 0.61; prespecified futility stopping criteria met at the second interim analysis',
        unreportedAdverseSignals:
          'Life-threatening thromboembolic complications within 4 days in 15 of 328 on treatment against 4 of 298 on placebo, relative risk 3.41 (95% CI 1.14 to 10.15, p=0.020). Haematoma growth was again reduced, by 3.7 mL, which is the endpoint that has never mattered.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'FAST (NCT00127283) — phase 3 rFVIIa for acute intracerebral haemorrhage',
        phase: 'Phase 3 randomised placebo-controlled trial, three arms',
        sampleSize: 841,
        primaryEndpoint:
          'Poor outcome, defined as severe disability or death on the modified Rankin scale at 90 days',
        endpointMet: false,
        statisticalPValue:
          'Poor outcome 24% on placebo, 26% at 20 micrograms per kilogram, 29% at 80 micrograms per kilogram — no significant difference; haematoma growth reduced by 3.8 mL at the high dose (95% CI 0.9 to 6.7, p=0.009)',
        unreportedAdverseSignals:
          'Arterial thromboembolic events were more frequent at 80 micrograms per kilogram than on placebo, 9% against 4% (p=0.04), while overall thromboembolic serious adverse events were similar across arms.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Phase 2 dose-ranging trial of rFVIIa in intracerebral haemorrhage',
        phase: 'Phase 2 randomised placebo-controlled dose-ranging trial, four arms',
        sampleSize: 399,
        primaryEndpoint: 'Percent change in intracerebral haemorrhage volume at 24 hours',
        endpointMet: true,
        statisticalPValue:
          'Mean volume increase 29% on placebo against 16%, 14% and 11% at 40, 80 and 160 micrograms per kilogram (p=0.01); 90-day mortality 29% against 18% pooled (p=0.02); death or severe disability 69% against 55%, 49% and 54% (p=0.004)',
        unreportedAdverseSignals:
          'Serious thromboembolic events, mainly myocardial or cerebral infarction, occurred in 7% of treated patients against 2% on placebo (p=0.12). The clinical benefits reported here were secondary outcomes and failed to replicate in two subsequent trials totalling 1,467 patients.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'Pooled off-label evidence across five in-hospital indications, to December 2010',
        phase:
          'Systematic review of 16 randomised trials, 26 comparative and 22 non-comparative observational studies',
        sampleSize: 64,
        primaryEndpoint:
          'Mortality and thromboembolism in intracranial haemorrhage, cardiac surgery, trauma, liver transplantation and prostatectomy',
        endpointMet: false,
        statisticalPValue:
          'No mortality reduction at any dose or indication; arterial thromboembolism risk difference 0.03 (95% CI 0.01 to 0.06) at medium dose and 0.06 (95% CI 0.01 to 0.11) at high dose in intracranial haemorrhage; 0.05 (95% CI 0.01 to 0.10) in cardiac surgery',
        unreportedAdverseSignals:
          'The sample size field here is the number of included studies, not patients, because the review pools heterogeneous populations across five indications. The reviewers rated the strength of evidence low for most outcomes and could not exclude publication bias.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Haematoma growth at 24 hours reduced by 3.3 to 5.8 mL in 2005, 3.8 mL in 2008 and 3.7 mL in 2026 — the same effect, three independent randomised confirmations',
        'Thrombotic events in 0.28% of bleeding episodes treated within the licensed indications, 0.20% in haemophilia with inhibitors and 4% in acquired haemophilia',
        'Life-threatening thromboembolism within four days at a relative risk of 3.41 (95% CI 1.14 to 10.15) against placebo when given for intracerebral haemorrhage',
        'Increased thrombin generation in haemophilic blood at concentrations as low as 10 nM in a tissue-factor-initiated in vitro model',
      ],
      unsupportedInferences: [
        'That limiting haematoma expansion improves survival or function after intracerebral haemorrhage — reduced in three trials, beneficial in none',
        'That the mortality benefit in the 399-patient phase 2 was a real effect rather than a secondary endpoint in a small trial',
        'That giving the drug earlier was the missing ingredient; FASTEST gave it at a mean of 100 minutes from onset and stopped for futility',
        'That a bypassing agent which works in haemophilia will help any bleeding patient — the generalisation the boxed warning was written to stop',
      ],
      whatFailedInitially: [
        'FAST, the confirmatory phase 3, found no difference in poor outcome at 90 days across 841 patients while confirming the haematoma effect',
        'FASTEST met its prespecified futility stopping criteria at the second interim analysis after 626 patients',
        'A systematic review of five off-label indications found no mortality benefit anywhere and increased arterial thromboembolism in intracranial haemorrhage and cardiac surgery',
        'Thrombosis has been reported in women given the drug for post-partum haemorrhage, an off-label use recorded in the label’s own warnings section',
      ],
      realWorldOutcome: [
        'Still the standard bypassing agent for haemophilia with inhibitors, acquired haemophilia and congenital factor VII deficiency, where the evidence supports it',
        'US$2.75 per microgram of average Medicare Part B spending in 2024, with the average Medicaid claim at US$75,625.52',
        'Carries a boxed warning that is about prescribing outside the licence rather than about the molecule itself',
        'Largely displaced for routine haemophilia prophylaxis by emicizumab, which prevents the bleeds this drug was used to treat',
      ],
    },
    deliverySystem: {
      type: 'Intravenous bolus injection after reconstitution, repeated at intervals for a bleed',
      description:
        'Supplied as a lyophilised powder in 1 mg, 2 mg and 5 mg vials with a histidine diluent, reconstituted to approximately 1 mg/mL and given as a slow intravenous injection. Repeat doses are given until the bleeding episode is controlled. Room-temperature stability is what the RT designation refers to and is a genuine advance for a patient who has to carry the drug.',
      safetyProfile:
        'Carries a boxed warning for serious thrombotic adverse events with use outside the labelled indications, citing clinical studies showing increased arterial thromboembolic events outside the approved indications and both fatal and non-fatal thrombotic events in postmarketing surveillance. Within the licence, thrombotic events of possible or probable relationship occurred in 0.28% of bleeding episodes treated. Risk is increased by disseminated intravascular coagulation, advanced atherosclerotic disease, crush injury, septicaemia and concomitant prothrombin complex concentrate, all of which supply circulating tissue factor. Patients with factor VII deficiency should be monitored for prothrombin time, factor VII coagulant activity and antibody formation. Hypersensitivity has been reported and the product is manufactured in medium containing newborn calf serum.',
    },
    commonQuestions: [
      {
        q: 'If it makes the bleed smaller, why does it not help?',
        a: 'That question is the reason this page exists. Haematoma expansion is one of the strongest predictors of death and disability after a brain haemorrhage, so reducing it looks like it must help. Three randomised trials over twenty-one years reduced it by three to six millilitres and none of them improved how patients were at 90 or 180 days. The most likely explanation is that most of the damage is done by the original bleed within minutes, and the marginal millilitres the drug prevents were never the ones deciding the outcome. A strong prognostic marker is not automatically a target worth hitting.',
        auditNote:
          'This is the cleanest example in the whole reversal and haemostatic field of a surrogate that moves reliably and an outcome that does not follow.',
      },
      {
        q: 'Does it work for haemophilia?',
        a: 'Yes, and that is the licensed use. In haemophilia A or B where inhibitor antibodies have destroyed the usefulness of replacement factor VIII or IX, factor VIIa bypasses the blocked step by generating thrombin directly on the surface of platelets at the wound. The same applies to acquired haemophilia and to the rare inherited deficiency of factor VII itself. Within those indications the thrombotic event rate is about 0.28% of bleeding episodes treated. The evidence problems on this page are all about what happened when the drug was taken outside that population.',
      },
      {
        q: 'Why did the first trial get it so wrong?',
        a: 'Because the encouraging findings were secondary outcomes in a trial of 399 patients designed to measure something else. The primary endpoint was haematoma volume, and that was met. Mortality and function were additional analyses, and a difference of 29% versus 18% in 399 patients is exactly the size of effect that appears by chance often enough to mislead. It took 841 patients in 2008 and another 626 in 2026 to establish that it was not real, and in between the drug was given off-label to a great many people.',
        auditNote:
          'The 2005 trial has an independent replication status of Failed to Replicate on this page. That is the accurate description.',
      },
      {
        q: 'Why does the boxed warning talk about how doctors use it rather than about the drug?',
        a: 'Because that turned out to be the risk. The warning states that serious thrombotic adverse events are associated with use outside the labelled indications, that clinical studies have shown increased arterial thromboembolic events in those settings, and that safety and efficacy outside the approved indications have not been established. Regulators rarely write a warning about prescribing behaviour. They did here because the same molecule is comparatively safe in haemophilia and hazardous in patients with atherosclerosis, sepsis or crush injury, whose blood already carries the tissue factor the drug needs to start clotting.',
      },
      {
        q: 'Is the trial evidence for it in trauma any better?',
        a: 'No. The systematic review of off-label use found no difference in mortality or thromboembolism in body trauma, with a reduced risk of acute respiratory distress syndrome, and rated the strength of evidence low. The larger trauma programme was discontinued without demonstrating a survival benefit. As with brain haemorrhage, bleeding measurements improved and the outcomes patients care about did not follow.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Recombinant factor VIIa versus placebo for spontaneous intracerebral haemorrhage within 2 h of symptom onset (FASTEST): a multicentre, double-blind, randomised, placebo-controlled, phase 3 trial. Lancet 2026;407(10530):773-783',
        identifier: '10.1016/S0140-6736(26)00097-8',
        kind: 'doi',
      },
      {
        label:
          'Mayer SA, Brun NC, Begtrup K, et al. Efficacy and safety of recombinant activated factor VII for acute intracerebral hemorrhage. N Engl J Med 2008;358(20):2127-2137',
        identifier: '10.1056/NEJMoa0707534',
        kind: 'doi',
      },
      {
        label:
          'Mayer SA, Brun NC, Begtrup K, et al. Recombinant activated factor VII for acute intracerebral hemorrhage. N Engl J Med 2005;352(8):777-785',
        identifier: '10.1056/NEJMoa042991',
        kind: 'doi',
      },
      {
        label:
          'Yank V, Tuohy CV, Logan AC, et al. Systematic review: benefits and harms of in-hospital use of recombinant factor VIIa for off-label indications. Ann Intern Med 2011;154(8):529-540',
        identifier: '10.7326/0003-4819-154-8-201104190-00004',
        kind: 'doi',
      },
      {
        label:
          'Recombinant factor VIIa for hemorrhagic stroke treatment at earliest possible time (FASTEST): Protocol for a phase III, double-blind, randomized, placebo-controlled trial. Int J Stroke 2022;17(7):806-809',
        identifier: '10.1177/17474930211042700',
        kind: 'doi',
      },
      {
        label: 'FASTEST — Recombinant Factor VIIa for Hemorrhagic Stroke Trial',
        identifier: 'NCT03496883',
        kind: 'nct',
      },
      {
        label: 'FAST — Factor Seven for Acute Hemorrhagic Stroke',
        identifier: 'NCT00127283',
        kind: 'nct',
      },
      {
        label:
          'NovoSeven RT (Coagulation Factor VIIa, Recombinant) — FDA-approved prescribing information, boxed warning, indications, sections 5.1, 5.2, 11 and 12, retrieved from the openFDA drug label endpoint',
        identifier: 'https://api.fda.gov/drug/label.json?search=%22NovoSeven%22',
        kind: 'regulatory',
      },
      {
        label:
          'CMS Medicare Part B Spending by Drug — HCPCS J7189, factor VIIa recombinant (NovoSeven RT) per microgram; average spending per dosage unit US$2.7505 in 2024, 2024 average sales price US$2.483',
        identifier:
          'https://data.cms.gov/summary-statistics-on-use-and-payments/medicare-medicaid-spending-by-drug/medicare-part-b-spending-by-drug',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 9. Prothrombin complex concentrate — licensed on the INR, adopted everywhere else on nothing.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'prothrombin-complex-concentrate',
    name: 'Four-Factor Prothrombin Complex Concentrate',
    tradeName: 'Kcentra / Beriplex / Confidex; Octaplex and Balfaxar are separate products',
    sponsor: 'CSL Behring GmbH, US License No. 1765',
    targetGene:
      'F2, F7, F9 and F10 — the four vitamin-K-dependent clotting factor genes whose products the concentrate supplies, together with PROC and PROS1',
    targetProtein:
      'None. This is replacement of missing proteins rather than inhibition of a target: it supplies coagulation factors II, VII, IX and X, plus the anticoagulant proteins C and S',
    modality: 'Recombinant Protein / Biologic',
    approvalStatus: 'FDA Approved',
    approvalYear: 2013,
    indication:
      'Urgent reversal of acquired coagulation factor deficiency induced by vitamin K antagonist therapy in adult patients with acute major bleeding or need for an urgent surgery or invasive procedure',
    patientFriendlyIndication:
      'Putting back the clotting proteins that warfarin has switched off, in someone who is bleeding badly or needs surgery within hours',
    anatomicalSite: 'Blood plasma — the factors circulate and are consumed at the site of injury',
    conditionContext: {
      conditionExplainer:
        'Warfarin does not thin blood directly. It stops the liver finishing four clotting factors — II, VII, IX and X — so that they circulate in an unusable form. The INR is a laboratory measure of how far that process has gone. Reversing warfarin means either waiting for the liver to make new factors, which takes hours to days, or putting the finished factors straight into the bloodstream.',
      whyItMatters:
        'Before 2013 the way to do that in the United States was fresh frozen plasma: several units, thawed, cross-matched, infused over hours, with a litre or more of fluid going into someone who may have a failing heart. A concentrate delivers the same factors in a fraction of the volume in minutes.',
      whoTakesThis:
        'Adults on warfarin who arrive with major bleeding — most often into the brain or the gut — or who need an operation that cannot wait. Very large amounts of its actual use are off-label, for bleeding on drugs it has never been licensed to reverse.',
      clinicalGoals:
        'Correct the INR quickly and stop the bleeding. The INR correction is dramatic and reproducible; whether the patient lives longer has never been tested against plasma.',
    },
    oneSentenceVerdict:
      'A concentrate of the four clotting factors warfarin switches off, licensed in 2013 on two open-label trials that showed it corrects the INR six times as often as plasma and stops bleeding about as well — a genuine advance in speed and fluid volume that has never been shown to save a life, and which is now given far more often for anticoagulants it was never tested against than for the one it was.',
    laymanHowItWorks:
      'Warfarin works by stopping your liver from finishing four of the proteins that make blood clot. This product is those four proteins, purified from donated human plasma and freeze-dried into a small vial. Injected, it puts the finished proteins straight back into circulation, so clotting resumes within minutes rather than waiting for the liver to catch up. It also contains proteins C and S, the body’s own brakes, which are included precisely because a bolus of pure clotting factors would otherwise be dangerous.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 63,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$1.68 per international unit of factor IX activity, and US$3,150.56 average Medicaid spending per claim in 2023 across 888 claims nationally',
      markupEstimate:
        'Not calculable. No published per-dose cost of production exists for a plasma-derived factor concentrate, so there is no denominator to divide the payment by.',
      openPatentNotes:
        'Not a patented molecule but a fractionation process, and the barrier to entry is the plasma supply chain rather than the chemistry. Several four-factor products exist internationally — Beriplex and Confidex are the same product under different names, and Octaplex and Balfaxar are separate licences — but they are not interchangeable and each requires its own approval.',
      synthesisComplexity: 'High',
      costSource: NO_COST_STUDY_SOURCE,
      priceSource: CMS_MEDICAID_SOURCE,
    },
    substitutes: {
      summary:
        'The comparator it was licensed against is fresh frozen plasma, and it beats plasma on speed, on INR correction and on fluid load. For bleeding caused by a direct oral anticoagulant, the specific antidotes idarucizumab and andexanet alfa exist and this product is used off-label instead — a comparison that has now been made once, in a randomised trial, with a result that does not simply favour the newer drug.',
      conventionalRx: [
        {
          name: 'Fresh frozen plasma',
          class: 'Whole plasma transfusion',
          howItCompares:
            'Contains the same factors at physiological concentration, so several units and a litre or more of fluid are needed. In the surgical trial, rapid INR reduction to 1.3 or below within 30 minutes was achieved in 55% on concentrate against 10% on plasma, and fluid overload or similar cardiac events occurred in 3% against 13%.',
          typicalCost:
            'The cost of several units of thawed, cross-matched plasma and the time to obtain them.',
          prosAndCons:
            'Pros: universally available, no separate licence needed, cheaper per unit. Cons: slow, large volume, and effective haemostasis in 65.4% to 75% against 72.4% to 90% for the concentrate.',
        },
        {
          name: 'Andexanet alfa (Andexxa)',
          class: 'Specific factor Xa inhibitor reversal agent',
          howItCompares:
            'Licensed for apixaban and rivaroxaban, where this concentrate is not. In ANNEXA-I, where 85.5% of the usual-care arm received prothrombin complex concentrate, andexanet achieved haemostatic efficacy in 67.0% against 53.1% — and had thrombotic events in 10.3% against 5.6%, with no difference in disability or death at 30 days.',
          typicalCost:
            'US$8,806.75 average Medicaid spending per claim in 2023, roughly three times this product.',
          prosAndCons:
            'Pros: actually removes the anticoagulant, better haematoma control. Cons: nearly twice the thrombotic event rate in the one head-to-head, and no better outcome at 30 days.',
        },
        {
          name: 'Vitamin K (phytonadione)',
          class: 'Cofactor replacement',
          howItCompares:
            'Given alongside the concentrate rather than instead of it, and always was in the licensing trials. Vitamin K restores the liver’s ability to finish new factors, which takes hours; the concentrate covers the gap until it does. Without vitamin K the INR rebounds as the infused factors are cleared.',
          typicalCost: 'A few dollars per dose for a generic injectable.',
          prosAndCons:
            'Pros: cheap, addresses the cause rather than the symptom, prevents rebound. Cons: far too slow on its own for someone bleeding into the brain.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'generic_formula',
      targetReceptorAffinity:
        'Not applicable and deliberately so. The product is not a ligand for anything; potency is defined and labelled by international units of factor IX activity, and the other factors are present in proportion to it',
      structureSource: {
        label:
          'KCENTRA (Prothrombin Complex Concentrate, Human) prescribing information, DailyMed SPL set id eee1afb8-324c-42e4-8bf0-f0c9da5e6d42; CSL Behring GmbH, US License No. 1765, initial US approval 2013',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=eee1afb8-324c-42e4-8bf0-f0c9da5e6d42',
        kind: 'regulatory',
      },
      laboratoryWorkflow: [
        {
          id: 'pcc-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Release of the source plasma pool',
          description:
            'Screen and release the donor plasma pool before fractionation. Everything downstream — the viral safety argument, the batch potency, the traceability — is anchored here, because the starting material is thousands of human donations rather than a cell bank.',
          reagentsAndBuffer:
            'Screened source plasma, nucleic acid testing for HIV, hepatitis B and C and parvovirus B19, serology panel, pool-level bioburden and endotoxin testing',
        },
        {
          id: 'pcc-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Cryoprecipitation and capture of the vitamin-K-dependent fraction',
          description:
            'Separate the prothrombin complex from the rest of the plasma proteins. Factors II, VII, IX and X share the gamma-carboxyglutamic acid domain, which binds calcium and anion exchangers alike, so the same chemical feature that makes them work is the feature used to isolate them together.',
          dependsOnStepId: 'pcc-w1',
          reagentsAndBuffer:
            'Cryoprecipitate-poor plasma, anion-exchange resin, calcium-containing wash and elution buffers, controlled low temperature throughout',
        },
        {
          id: 'pcc-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Heat treatment, calcium phosphate adsorption and virus filtration',
          description:
            'Apply the three orthogonal viral safety operations the licence specifies: pasteurisation in aqueous solution for 10 hours at 60°C, precipitation and adsorption to calcium phosphate, and virus filtration, before lyophilisation. Proteins C and S are retained rather than removed, which is a formulation decision made to limit the thrombogenicity of a pure procoagulant bolus.',
          dependsOnStepId: 'pcc-w2',
          reagentsAndBuffer:
            'Stabiliser solution for pasteurisation at 60°C for 10 hours, calcium phosphate adsorbent, nanofiltration membrane, heparin and antithrombin III as formulation components, lyophilisation cycle',
        },
        {
          id: 'pcc-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Restoration of circulating factor levels in anticoagulated plasma',
          description:
            'Confirm the infused factors reach and persist in the circulation. This step also has to detect the mismatch that defines the drug: factor VII has a half-life of a few hours while factor II lasts days, so the INR and the actual haemostatic capacity come apart over the first day.',
          dependsOnStepId: 'pcc-w3',
          reagentsAndBuffer:
            'Warfarinised human plasma, one-stage clotting assays for factors II, VII, IX and X, chromogenic protein C assay, serial sampling from 0.5 to 24 hours',
        },
        {
          id: 'pcc-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'INR correction and thrombin generation',
          description:
            'Measure the INR, which is what the licence turns on, alongside thrombin generation, which is closer to what the patient needs. Reporting both is the point: the INR is exquisitely sensitive to factor VII and therefore overstates how much haemostatic capacity has been restored once factor VII starts clearing.',
          dependsOnStepId: 'pcc-w4',
          reagentsAndBuffer:
            'Thromboplastin with a defined international sensitivity index, calibrated automated thrombogram, factor IX international standard for potency assignment',
        },
      ],
    },
    keyAudits: [
      {
        id: 'pcc-a1',
        category: 'measured',
        title: 'It corrects the INR six times as often as plasma does',
        laymanSummary:
          'In warfarin patients with major bleeding, the INR came down to 1.3 or below within half an hour in 62.2% of those given the concentrate against 9.6% of those given plasma. Bleeding control was similar in both groups.',
        technicalDetails:
          'Sarode et al. ran a phase 3b, multicentre, open-label, non-inferiority trial in non-surgical patients on vitamin K antagonists presenting with major bleeding. The intention-to-treat efficacy population was 202 patients (98 concentrate, 104 plasma), median baseline INR 3.90 and 3.60. Effective haemostasis over 24 hours was achieved in 72.4% against 65.4%, meeting non-inferiority (difference 7.1%, 95% CI -5.8 to 19.9). Rapid INR reduction to 1.3 or below at 0.5 hours was achieved in 62.2% against 9.6%, meeting superiority (difference 52.6%, 95% CI 39.4 to 65.9). Measured coagulation factor levels were higher in the concentrate group from 0.5 to 3 hours after infusion. Adverse events, serious adverse events, thromboembolic events and deaths were similar between groups.',
        evidenceSource:
          'Sarode R, Milling TJ Jr, Refaai MA, et al. Efficacy and safety of a 4-factor prothrombin complex concentrate in patients on vitamin K antagonists presenting with major bleeding: a randomized, plasma-controlled, phase IIIb study. Circulation 2013;128(11):1234-1243',
        doi: '10.1161/CIRCULATIONAHA.113.002283',
        measuredMetric:
          'Twenty-four-hour effective haemostasis and INR correction to 1.3 or below at 0.5 hours after infusion',
        auditFlag: 'verified',
      },
      {
        id: 'pcc-a2',
        category: 'measured',
        title: 'Before urgent surgery it beat plasma on bleeding as well as on the blood test',
        laymanSummary:
          'In 181 patients needing an operation within hours, effective haemostasis was achieved in 90% on the concentrate against 75% on plasma. Fluid overload happened in 3% against 13%.',
        technicalDetails:
          'Goldstein et al. randomised 181 vitamin-K-antagonist-treated patients needing rapid reversal before an urgent surgical or invasive procedure, with vitamin K given to both arms. In the 168-patient intention-to-treat efficacy population, effective haemostasis was achieved in 78 of 87 (90%) on concentrate against 61 of 81 (75%) on plasma, demonstrating both non-inferiority and superiority (difference 14.3%, 95% CI 2.8 to 25.8). Rapid INR reduction was achieved in 55% against 10% (difference 45.3%, 95% CI 31.9 to 56.4). Thromboembolic adverse events occurred in 7% against 8%, fluid overload or similar cardiac events in 3% against 13%, and late bleeding in 3% against 5%. The trial was funded by CSL Behring and was open-label, which matters for an endpoint adjudicated as effective haemostasis.',
        evidenceSource:
          'Goldstein JN, Refaai MA, Milling TJ Jr, et al. Four-factor prothrombin complex concentrate versus plasma for rapid vitamin K antagonist reversal in patients needing urgent surgical or invasive interventions: a phase 3b, open-label, non-inferiority, randomised trial. Lancet 2015;385(9982):2077-2087',
        doi: '10.1016/S0140-6736(14)61685-8',
        measuredMetric:
          'Effective haemostasis and rapid INR reduction before an urgent surgical or invasive procedure',
        auditFlag: 'verified',
      },
      {
        id: 'pcc-a3',
        category: 'inferred',
        title: 'Thirteen years on the United States market and no mortality comparison',
        laymanSummary:
          'Neither licensing trial was designed to find out whether patients given the concentrate were more likely to survive than patients given plasma. Neither was any trial since.',
        technicalDetails:
          'Both pivotal trials were non-inferiority studies with co-primary endpoints of adjudicated haemostatic efficacy and INR correction, in 202 and 181 patients respectively. Deaths were reported as a safety outcome and were similar between arms, which at those sample sizes excludes almost nothing. The INR itself is a problematic surrogate here for a specific reason: it is dominated by factor VII, which has a half-life of a few hours, while factor II persists for days. An INR of 1.3 at thirty minutes therefore reports the arrival of the shortest-lived factor in the bottle rather than the durable restoration of haemostatic capacity, and the same INR can be reached with quite different amounts of underlying thrombin generation.',
        evidenceSource:
          'Sarode R, et al. Circulation 2013;128(11):1234-1243; Goldstein JN, et al. Lancet 2015;385(9982):2077-2087 — both trial designs and endpoint definitions',
        doi: '10.1016/S0140-6736(14)61685-8',
        inferredClaim:
          'That correcting the INR six times faster than plasma translates into fewer deaths — the reason the drug is stocked, and a comparison that has never been made',
        auditFlag: 'caution',
      },
      {
        id: 'pcc-a4',
        category: 'failed',
        title: 'In trauma it saved no blood products and caused more clots',
        laymanSummary:
          'A blinded French trial gave the concentrate or saline to 324 badly injured patients at risk of massive transfusion. Blood product use was identical. Thromboembolic events happened in 35% of the treated group against 24% of the placebo group.',
        technicalDetails:
          'PROCOAG was a double-blind, randomised, placebo-controlled superiority trial at 12 French level I trauma centres from December 2017 to August 2021. Of 4,313 patients with the highest trauma activation, 327 were randomised and 324 analysed (164 concentrate, 160 placebo). Median Injury Severity Score was 36, median admission lactate 4.6 mmol/L, and 59% had a prehospital systolic pressure below 90 mmHg. Median 24-hour total blood product consumption was 12 units against 11 units, absolute difference 0.2 units (95% CI -2.99 to 3.33, p=0.72). At least one thromboembolic event occurred in 56 patients (35%) against 37 (24%), absolute difference 11% (95% CI 1% to 21%), relative risk 1.48 (95% CI 1.04 to 2.10, p=0.03). The authors conclude the findings do not support systematic use in patients at risk of massive transfusion.',
        evidenceSource:
          'Bouzat P, Charbit J, Abback PS, et al. Efficacy and Safety of Early Administration of 4-Factor Prothrombin Complex Concentrate in Patients With Trauma at Risk of Massive Transfusion: The PROCOAG Randomized Clinical Trial. JAMA 2023;329(16):1367-1375',
        doi: '10.1001/jama.2023.4080',
        measuredMetric:
          'Twenty-four-hour total blood product consumption, and incidence of arterial or venous thromboembolic events',
        auditFlag: 'verified',
      },
      {
        id: 'pcc-a5',
        category: 'conclusion_shift',
        title: 'It became the default reversal agent for drugs it was never tested against',
        laymanSummary:
          'The licence covers warfarin. Most of the direct oral anticoagulants now in use have no licensed reversal agent stocked in most hospitals, so this concentrate is given instead — an entirely off-label practice that has become standard care.',
        technicalDetails:
          'In ANNEXA-I, the randomised trial of andexanet alfa in factor-Xa-inhibitor-associated intracerebral haemorrhage, 85.5% of the 267 patients in the usual-care arm received prothrombin complex concentrate. That trial is therefore the largest controlled dataset in existence on this product for direct oral anticoagulant reversal, and it exists only because the concentrate was the control. In it, usual care achieved haemostatic efficacy in 53.1% against 67.0% for andexanet, with thrombotic events in 5.6% against 10.3% and no appreciable difference in modified Rankin score or 30-day death. The concentrate is inferior on the surrogate, better on thrombosis, and indistinguishable on outcome — which is not the result either side of the argument wanted.',
        evidenceSource:
          'Connolly SJ, Sharma M, Cohen AT, et al. Andexanet for Factor Xa Inhibitor-Associated Acute Intracerebral Hemorrhage. N Engl J Med 2024;390(19):1745-1755',
        doi: '10.1056/NEJMoa2313040',
        inferredClaim:
          'That replacing clotting factors will reverse an anticoagulant that is still circulating and still blocking factor Xa — a mechanistically different proposition from replacing factors warfarin prevented the liver from making',
        auditFlag: 'contested',
      },
      {
        id: 'pcc-a6',
        category: 'measured',
        title: 'The boxed warning names the risk the product is built to contain',
        laymanSummary:
          'Injecting a bolus of clotting factors into someone whose blood was deliberately thinned causes clots in some of them. The label says both fatal and non-fatal arterial and venous thromboembolic complications have been reported.',
        technicalDetails:
          'The Kcentra boxed warning states that patients on vitamin K antagonist therapy have underlying disease states predisposing them to thromboembolic events, and that both fatal and non-fatal arterial and venous thromboembolic complications have been reported with Kcentra in clinical trials and postmarketing surveillance. The formulation is designed around that risk: the antithrombotic proteins C and S are deliberately retained in the product rather than purified away, and heparin is included. In the two licensing trials thromboembolic event rates were similar to plasma, 7% against 8% in the surgical trial. In PROCOAG, in a trauma population, they were 35% against 24% on placebo. The same product, the same dose scheme, and a risk that depends almost entirely on who is receiving it.',
        evidenceSource:
          'KCENTRA (Prothrombin Complex Concentrate, Human) prescribing information, boxed warning and Description; DailyMed SPL set id eee1afb8-324c-42e4-8bf0-f0c9da5e6d42',
        measuredMetric:
          'Thromboembolic event rates across the licensing trials and the trauma trial',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A small vial of powder instead of several bags of plasma',
        laymanDesc:
          'Freeze-dried, reconstituted at the bedside and given over minutes. The whole point is that it is concentrated: the same clotting factors as several units of plasma in a fraction of the fluid.',
        molecularDetail:
          'The product is lyophilised and reconstituted immediately before use. In the surgical trial, fluid overload or similar cardiac events occurred in 3% of the concentrate group against 13% of the plasma group, which is the clearest quantification of what the concentration buys.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The factors join the circulating pool immediately',
        laymanDesc:
          'These are proteins the blood already contains, just not in working form. Infused, they mix straight into the plasma. Nothing has to be absorbed, converted or transported.',
        molecularDetail:
          'Administration rapidly increases plasma levels of the vitamin-K-dependent factors II, VII, IX and X together with proteins C and S. Measured factor levels were higher in the concentrate arm than the plasma arm from 0.5 to 3 hours after infusion start (p<0.02).',
        iconName: 'Droplet',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Calcium locks them onto the damaged surface',
        laymanDesc:
          'All four factors carry a special calcium-binding tail. That tail is what warfarin stops the liver from building, and it is what lets the factors stick to the site of an injury rather than clotting the whole bloodstream.',
        molecularDetail:
          'The gamma-carboxyglutamic acid domain, made by the vitamin-K-dependent carboxylase that warfarin inhibits, binds calcium and through it the anionic phospholipid exposed on damaged membranes and activated platelets. The same domain is what the manufacturing process uses to capture all four factors together on an anion exchanger.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The cascade runs again and thrombin is made',
        laymanDesc:
          'With the finished factors present, the chain of reactions that ends in a clot can proceed. Thrombin appears, fibrinogen becomes fibrin, and the bleeding site is sealed.',
        molecularDetail:
          'Factor Xa assembled with factor Va on a phospholipid surface converts prothrombin to thrombin; factor IXa with factor VIIIa amplifies factor X activation. Restoring all four zymogens at once restores the whole sequence rather than one step of it, which is why the effect appears within minutes rather than over the hours vitamin K requires.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The INR falls — faster than the actual clotting capacity returns',
        laymanDesc:
          'The blood test comes back to normal within half an hour. That number is dominated by the shortest-lived of the four factors, so it looks better than the underlying situation and starts drifting up again as that factor clears.',
        molecularDetail:
          'Rapid INR reduction to 1.3 or below at 0.5 hours in 62.2% against 9.6% on plasma in major bleeding, and 55% against 10% before urgent surgery. Factor VII has a plasma half-life of a few hours against days for factor II, so the INR reports the arrival and departure of factor VII more than the durable haemostatic state. Vitamin K is given alongside in every protocol for exactly this reason.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Whether anyone lives longer has not been measured',
        laymanDesc:
          'Bleeding was controlled about as well as with plasma, or better before surgery, and much faster. Neither trial was built to find out whether that means fewer deaths, and no trial since has been either.',
        molecularDetail:
          'Effective haemostasis 72.4% against 65.4% in major bleeding (difference 7.1%, 95% CI -5.8 to 19.9) and 90% against 75% before urgent surgery (difference 14.3%, 95% CI 2.8 to 25.8). Deaths were reported as a safety outcome and were similar between arms in trials of 202 and 181 patients, which excludes essentially nothing.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'NCT00708435 — four-factor prothrombin complex concentrate versus plasma in major bleeding on vitamin K antagonists',
        phase: 'Phase 3b multicentre open-label randomised non-inferiority trial',
        sampleSize: 202,
        primaryEndpoint:
          'Co-primary: 24-hour haemostatic efficacy from start of infusion, and INR correction to 1.3 or below at 0.5 hours',
        endpointMet: true,
        statisticalPValue:
          'Effective haemostasis 72.4% versus 65.4% (difference 7.1%, 95% CI -5.8 to 19.9, non-inferior); rapid INR reduction 62.2% versus 9.6% (difference 52.6%, 95% CI 39.4 to 65.9, superior)',
        unreportedAdverseSignals:
          'Open-label design with an adjudicated haemostatic efficacy endpoint. Deaths and thromboembolic events were similar between arms at a sample size that could not have detected a difference in either.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'NCT00803101 — four-factor prothrombin complex concentrate versus plasma before urgent surgery',
        phase: 'Phase 3b multicentre open-label randomised non-inferiority then superiority trial',
        sampleSize: 181,
        primaryEndpoint:
          'Co-primary: effective haemostasis, and rapid INR reduction to 1.3 or below at 0.5 hours after infusion end',
        endpointMet: true,
        statisticalPValue:
          'Effective haemostasis 90% versus 75% (difference 14.3%, 95% CI 2.8 to 25.8, superior); rapid INR reduction 55% versus 10% (difference 45.3%, 95% CI 31.9 to 56.4, superior)',
        unreportedAdverseSignals:
          'Funded by the manufacturer and open-label. Thromboembolic adverse events 7% versus 8%; fluid overload or similar cardiac events 3% versus 13%, which is the advantage that comes from volume rather than from pharmacology.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'PROCOAG (NCT03218722) — 4F-PCC in trauma at risk of massive transfusion',
        phase:
          'Double-blind randomised placebo-controlled superiority trial, 12 level I trauma centres',
        sampleSize: 324,
        primaryEndpoint: 'Twenty-four-hour all blood product consumption',
        endpointMet: false,
        statisticalPValue:
          'Median 12 units versus 11 units, absolute difference 0.2 units (95% CI -2.99 to 3.33), p = 0.72',
        unreportedAdverseSignals:
          'At least one thromboembolic event in 35% versus 24%, relative risk 1.48 (95% CI 1.04 to 2.10), p = 0.03. The authors state the findings do not support systematic use in this population.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'ANNEXA-I usual-care arm (NCT03661528) — the largest controlled dataset on this product for direct oral anticoagulant reversal',
        phase: 'Randomised comparator arm within a phase 4 trial of andexanet alfa',
        sampleSize: 267,
        primaryEndpoint:
          'Composite haemostatic efficacy at 12 hours, as the comparator against andexanet alfa',
        endpointMet: false,
        statisticalPValue:
          'Haemostatic efficacy 53.1% on usual care against 67.0% on andexanet; thrombotic events 5.6% against 10.3%; no appreciable difference in modified Rankin scale or 30-day death',
        unreportedAdverseSignals:
          'This is not a trial of prothrombin complex concentrate; it is a trial in which the concentrate happened to be what 85.5% of the control arm received. There has never been a randomised trial of this product against placebo or against no reversal in direct oral anticoagulant bleeding.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'INR correction to 1.3 or below within 30 minutes in 62.2% against 9.6% on plasma in major bleeding, and 55% against 10% before urgent surgery',
        'Effective haemostasis in 72.4% against 65.4% in major bleeding (non-inferior) and 90% against 75% before urgent surgery (superior, difference 14.3%, 95% CI 2.8 to 25.8)',
        'Fluid overload or similar cardiac events in 3% against 13% on plasma',
        'No reduction in 24-hour blood product consumption in trauma (12 versus 11 units, p=0.72), with thromboembolic events at 35% against 24% (relative risk 1.48, 95% CI 1.04 to 2.10)',
      ],
      unsupportedInferences: [
        'That faster INR correction than plasma means fewer deaths — never compared, in thirteen years on the United States market',
        'That an INR of 1.3 at thirty minutes represents restored haemostatic capacity, when the INR is dominated by the shortest-lived factor in the product',
        'That replacing clotting factors reverses a direct oral anticoagulant that is still present and still blocking factor Xa — the mechanism is different from warfarin reversal, and the practice is entirely off-label',
        'That the thromboembolic safety seen in elderly warfarin patients transfers to a young trauma population; PROCOAG says it does not',
      ],
      whatFailedInitially: [
        'PROCOAG found no reduction in blood product consumption in trauma and a 48% relative increase in thromboembolic events',
        'Both licensing trials were open-label with adjudicated haemostatic endpoints and manufacturer funding, and neither was powered for any clinical outcome',
        'In the only randomised comparison against a specific antidote, the concentrate achieved haemostatic efficacy in 53.1% against 67.0%',
      ],
      realWorldOutcome: [
        'The standard of care for warfarin reversal in major bleeding across the United States and Europe, and the reason plasma is now rarely used for it',
        'US$1.68 per international unit of factor IX activity, US$3,150.56 per Medicaid claim in 2023 — around a third of the cost of a specific factor Xa inhibitor antidote',
        'Its largest single use is off-label, for anticoagulants it has never been licensed or trialled against',
        'Carries a boxed warning for fatal and non-fatal arterial and venous thromboembolic complications',
      ],
    },
    deliverySystem: {
      type: 'Intravenous infusion of a reconstituted lyophilised concentrate, given once',
      description:
        'Supplied as a freeze-dried powder with diluent, reconstituted at the bedside and infused over minutes. Vitamin K is given alongside it in every protocol, because the concentrate covers only the hours until the liver resumes making its own factors. There is no other route.',
      safetyProfile:
        'Carries a boxed warning stating that patients on vitamin K antagonist therapy have underlying disease states predisposing them to thromboembolic events, and that both fatal and non-fatal arterial and venous thromboembolic complications have been reported in clinical trials and postmarketing surveillance. The product is plasma-derived, so it carries the residual theoretical risk of transmissible agents despite pasteurisation at 60°C for 10 hours, calcium phosphate adsorption and virus filtration. It contains heparin and is therefore contraindicated where heparin-induced thrombocytopenia is suspected. Thromboembolic event rates were similar to plasma in the elderly warfarin populations of the licensing trials and markedly higher than placebo in the trauma population of PROCOAG.',
    },
    commonQuestions: [
      {
        q: 'Is this better than plasma?',
        a: 'On everything that was measured, yes. It corrects the INR within half an hour in the majority of patients where plasma does so in about one in ten. It achieves effective haemostasis at least as often in major bleeding and more often before urgent surgery. It delivers the same factors in a fraction of the fluid, which matters enormously in an elderly patient with a weak heart — fluid overload occurred in 3% against 13%. What has never been shown is that any of this makes a patient more likely to survive, because no trial has ever compared the two on that endpoint.',
        auditNote:
          'Both licensing trials were open-label and manufacturer-funded, with haemostatic efficacy adjudicated rather than measured objectively.',
      },
      {
        q: 'Can it reverse apixaban or rivaroxaban?',
        a: 'It is not licensed for that and it has never been tested against placebo for it, but it is used for it constantly, because most hospitals stock it and many do not stock the specific antidote. The best evidence available is indirect: in the randomised trial of andexanet alfa, 85.5% of the usual-care arm received this concentrate, and that arm achieved haemostatic control in 53.1% against 67.0%, with fewer thrombotic events and identical disability and death at thirty days. Mechanistically it is a different proposition from warfarin reversal — the anticoagulant is still there, still blocking factor Xa, and the concentrate is trying to outnumber it rather than remove it.',
        auditNote:
          'This is the largest controlled dataset on the product for this use, and it exists only because the product was somebody else’s control group.',
      },
      {
        q: 'Why does it contain proteins C and S, which stop clotting?',
        a: 'Because a bolus of pure clotting factors into a patient who was anticoagulated for a reason is a thrombotic hazard, and the natural brakes are retained deliberately to limit it. Protein C is also a vitamin-K-dependent factor and is suppressed by warfarin alongside the procoagulants, so replacing the procoagulants without it would leave the balance tilted further than nature ever tilts it. Heparin is in the formulation for the same reason, which is why the product cannot be used in someone with suspected heparin-induced thrombocytopenia.',
      },
      {
        q: 'Should it be given to trauma patients who are bleeding heavily?',
        a: 'The one trial that asked says no. PROCOAG randomised 324 severely injured patients at risk of massive transfusion to the concentrate or saline, all of them already receiving ratio-based transfusion. Twenty-four-hour blood product use was 12 units against 11 — no difference at all. Thromboembolic events occurred in 35% against 24%, a relative risk of 1.48. The investigators concluded that the findings do not support systematic use in this population, and the contrast with the elderly warfarin trials is instructive: the same product carried a very different risk in a different population.',
      },
      {
        q: 'Why is the INR a weak endpoint here?',
        a: 'Because the INR is far more sensitive to factor VII than to the other three factors, and factor VII has by far the shortest half-life in the product — hours, against days for factor II. So the INR falls dramatically as soon as factor VII arrives and starts climbing again as it leaves, while the durable clotting capacity is governed by factors that the INR barely registers. An INR of 1.3 at thirty minutes is a real measurement of a real thing; it is just not a measurement of whether the patient will keep bleeding.',
        auditNote:
          'This is why vitamin K is given alongside in every protocol: it restores the liver’s own production before the infused factor VII clears.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Sarode R, Milling TJ Jr, Refaai MA, et al. Efficacy and safety of a 4-factor prothrombin complex concentrate in patients on vitamin K antagonists presenting with major bleeding: a randomized, plasma-controlled, phase IIIb study. Circulation 2013;128(11):1234-1243',
        identifier: '10.1161/CIRCULATIONAHA.113.002283',
        kind: 'doi',
      },
      {
        label:
          'Goldstein JN, Refaai MA, Milling TJ Jr, et al. Four-factor prothrombin complex concentrate versus plasma for rapid vitamin K antagonist reversal in patients needing urgent surgical or invasive interventions: a phase 3b, open-label, non-inferiority, randomised trial. Lancet 2015;385(9982):2077-2087',
        identifier: '10.1016/S0140-6736(14)61685-8',
        kind: 'doi',
      },
      {
        label:
          'Bouzat P, Charbit J, Abback PS, et al. Efficacy and Safety of Early Administration of 4-Factor Prothrombin Complex Concentrate in Patients With Trauma at Risk of Massive Transfusion: The PROCOAG Randomized Clinical Trial. JAMA 2023;329(16):1367-1375',
        identifier: '10.1001/jama.2023.4080',
        kind: 'doi',
      },
      {
        label:
          'Connolly SJ, Sharma M, Cohen AT, et al. Andexanet for Factor Xa Inhibitor-Associated Acute Intracerebral Hemorrhage. N Engl J Med 2024;390(19):1745-1755 — cited here for the usual-care arm, 85.5% of which received prothrombin complex concentrate',
        identifier: '10.1056/NEJMoa2313040',
        kind: 'doi',
      },
      {
        label: 'Kcentra versus plasma in acute major bleeding on vitamin K antagonists',
        identifier: 'NCT00708435',
        kind: 'nct',
      },
      {
        label: 'Kcentra versus plasma before urgent surgical or invasive procedures',
        identifier: 'NCT00803101',
        kind: 'nct',
      },
      {
        label: 'PROCOAG — 4-factor prothrombin complex concentrate in severe trauma',
        identifier: 'NCT03218722',
        kind: 'nct',
      },
      {
        label:
          'KCENTRA (Prothrombin Complex Concentrate, Human) — prescribing information: boxed warning, indications, description and mechanism of action. CSL Behring GmbH, US License No. 1765, initial US approval 2013',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=eee1afb8-324c-42e4-8bf0-f0c9da5e6d42',
        kind: 'regulatory',
      },
      {
        label:
          'CMS Medicaid Spending by Drug — Kcentra, 888 claims and US$2,797,696.70 total spending in 2023, US$3,150.56 average per claim, US$1.6825 per dosage unit',
        identifier:
          'https://data.cms.gov/summary-statistics-on-use-and-payments/medicaid-drug-spending/medicaid-spending-by-drug',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 10. Fibrinogen concentrate — licensed on clot firmness in 36 people, used far beyond that.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'fibrinogen-human',
    name: 'Fibrinogen Concentrate (Human)',
    tradeName: 'Riastap / Fibryga',
    sponsor:
      'CSL Behring GmbH markets Riastap; Octapharma USA markets Fibryga as a separate, non-interchangeable licence',
    targetGene:
      'FGA, FGB and FGG — the three genes encoding the alpha, beta and gamma chains of fibrinogen, all clustered on chromosome 4',
    targetProtein:
      'None. This is replacement of a missing structural protein: purified human fibrinogen, the soluble precursor that thrombin converts into the fibrin mesh of a clot',
    modality: 'Recombinant Protein / Biologic',
    approvalStatus: 'FDA Approved',
    approvalYear: 2009,
    indication:
      'Treatment of acute bleeding episodes in paediatric and adult patients with congenital fibrinogen deficiency, including afibrinogenaemia and hypofibrinogenaemia. Not indicated for dysfibrinogenaemia',
    patientFriendlyIndication:
      'Replacing the protein that clots are actually made of, in people born without enough of it',
    anatomicalSite: 'Blood plasma, and the growing fibrin mesh at the site of injury',
    conditionContext: {
      conditionExplainer:
        'Fibrinogen is not an enzyme or a signal. It is the raw material a clot is built from — a soluble protein that circulates at higher concentration than any other clotting factor and that thrombin snips into fibrin, which then polymerises into the mesh that holds a wound closed. A person born unable to make it bleeds because there is nothing to build with.',
      whyItMatters:
        'Congenital afibrinogenaemia is very rare. Acquired fibrinogen depletion is not: it happens routinely in major trauma, in post-partum haemorrhage and after cardiopulmonary bypass, where fibrinogen is the first clotting factor to fall to a critical level. That gap between a rare licensed indication and a common unlicensed one is the whole story of this product.',
      whoTakesThis:
        'A small number of people with an inherited deficiency, and a far larger number of bleeding surgical, obstetric and trauma patients treated off-label in intensive care and the operating theatre.',
      clinicalGoals:
        'Raise the plasma fibrinogen level and the firmness of the clot. Both are measurable in minutes. Whether raising them changes what happens to the patient is a separate question with a mixed answer.',
    },
    oneSentenceVerdict:
      'Purified human fibrinogen, licensed in the United States in 2009 for a rare inherited deficiency on the strength of a thromboelastometry measurement in 36 subjects, and now given mostly to bleeding surgical and trauma patients it was never tested in — where one randomised trial found it as good as cryoprecipitate, another found it increased transfusion rather than reducing it, and a 1,604-patient trauma trial of the same replacement strategy found no survival benefit at all.',
    laymanHowItWorks:
      'A clot is a mesh, and fibrinogen is the thread it is woven from. It circulates dissolved in the blood until thrombin cuts two short pieces off each molecule, at which point the remainder becomes sticky and links up with its neighbours into an insoluble net. This product is that thread, purified from donated plasma and freeze-dried. Injected, it restores the supply of raw material so that a clot can actually be built.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 58,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$1.42 per milligram of average Medicare Part B spending in 2024 under HCPCS J7178 (Riastap) and US$1.17 per milligram under J7177 (Fibryga); the average Medicaid claim in 2023 was US$6,710.45 for Riastap and US$4,844.79 for Fibryga',
      markupEstimate:
        'Not calculable. No published per-dose cost of production exists for a plasma-derived fibrinogen concentrate, so there is no denominator to divide the payment by.',
      openPatentNotes:
        'Not a patented molecule. The barrier is plasma supply and the fractionation licence, not the chemistry, and the two United States products are separately licensed and not interchangeable. The competing option, cryoprecipitate, is produced by blood services from donated plasma and is not a licensed medicinal product at all in most jurisdictions, which is why the comparison between them was for many years an argument rather than a trial.',
      synthesisComplexity: 'High',
      costSource: NO_COST_STUDY_SOURCE,
      priceSource: CMS_PART_B_SOURCE,
    },
    substitutes: {
      summary:
        'The direct competitor is cryoprecipitate, the fibrinogen-rich fraction that blood services make by thawing frozen plasma slowly. The 735-patient FIBRES trial compared them head to head in cardiac surgery and found the concentrate non-inferior — the same transfusion requirement, at a standardised dose, without needing a freezer, a thaw or a blood group match.',
      conventionalRx: [
        {
          name: 'Cryoprecipitate',
          class: 'Blood component, fibrinogen-rich plasma fraction',
          howItCompares:
            'Contains fibrinogen plus factor VIII, von Willebrand factor and factor XIII, at a concentration that varies from pool to pool. In FIBRES, mean 24-hour post-bypass allogeneic transfusion was 16.3 units on concentrate against 17.0 on cryoprecipitate (ratio 0.96, non-inferior), with thromboembolic events in 7.0% against 9.6%.',
          typicalCost:
            'Priced as a blood component by the supplying blood service rather than as a licensed medicine, so the comparison depends on the health system.',
          prosAndCons:
            'Pros: supplies factor XIII and von Willebrand factor as well, and is available wherever there is a blood bank. Cons: must be thawed and blood-group matched, the fibrinogen content of each pool is not known in advance, and it is not pathogen-reduced in most jurisdictions.',
        },
        {
          name: 'Fresh frozen plasma',
          class: 'Whole plasma transfusion',
          howItCompares:
            'Contains fibrinogen at physiological concentration, so raising a depleted level meaningfully requires a volume that most bleeding patients cannot take. It is the default in major haemorrhage protocols because it supplies everything at once, not because it is an efficient way to give fibrinogen.',
          typicalCost: 'The cost of thawed, cross-matched plasma units.',
          prosAndCons:
            'Pros: universally available, replaces all factors. Cons: an inefficient fibrinogen source, and a large fluid load in a patient who may already be overloaded.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'peptide_sequence',
      molecularWeight:
        'A hexamer of two alpha, two beta and two gamma chains held together by disulfide bonds. UniProt gives the individual chain masses as 94,973 Da for the alpha chain (P02671), 55,928 Da for the beta chain (P02675) and 51,512 Da for the gamma chain (P02679)',
      targetReceptorAffinity:
        'Not a receptor interaction. Thrombin cleaves fibrinopeptides A and B from the amino-terminal ends of the alpha and beta chains, exposing polymerisation sites that engage complementary pockets on neighbouring molecules; factor XIIIa then cross-links the assembled mesh',
      structureSource: {
        label:
          'UniProtKB P02671 (FIBA_HUMAN), P02675 (FIBB_HUMAN) and P02679 (FIBG_HUMAN) — human fibrinogen alpha, beta and gamma chains with sequence lengths and masses',
        identifier: 'https://rest.uniprot.org/uniprotkb/P02671',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'fib-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Release of the source plasma pool',
          description:
            'Screen and release the donor plasma pool before fractionation. As with every plasma-derived product, the viral safety case begins with what is allowed into the pool rather than with what is removed later.',
          reagentsAndBuffer:
            'Screened source plasma, nucleic acid testing for HIV, hepatitis B and C and parvovirus B19, serology panel, pool-level bioburden and endotoxin testing',
        },
        {
          id: 'fib-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Cryoprecipitation of the fibrinogen-rich fraction',
          description:
            'Thaw frozen plasma slowly so that fibrinogen, factor VIII and von Willebrand factor come out of solution together. This is the same physical step that produces cryoprecipitate as a transfusion product; the difference between the two is everything that happens afterwards.',
          dependsOnStepId: 'fib-w1',
          reagentsAndBuffer:
            'Frozen source plasma, controlled slow-thaw at 1 to 6°C, refrigerated centrifugation, resuspension buffer',
        },
        {
          id: 'fib-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Glycine precipitation, pasteurisation and lyophilisation',
          description:
            'Purify the cryoprecipitate through two glycine precipitation steps with heat treatment at 60°C for 20 hours, then freeze-dry. The manufacturer reports cumulative virus reduction of at least 9.6 log10 for HIV and 11.2 log10 for hepatitis C models — the step that separates a licensed medicine from a blood component.',
          dependsOnStepId: 'fib-w2',
          reagentsAndBuffer:
            'Glycine precipitation buffers, stabilised aqueous solution for pasteurisation at 60°C for 20 hours, clarifying filtration, lyophilisation cycle, clottable protein assay for potency',
        },
        {
          id: 'fib-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Incorporation into the growing fibrin network',
          description:
            'Confirm the reconstituted protein is clottable and polymerises normally, not merely that it is present by immunoassay. A fibrinogen molecule that antigen assays can see but thrombin cannot use is exactly the failure mode the dysfibrinogenaemia exclusion on the label exists for.',
          dependsOnStepId: 'fib-w3',
          reagentsAndBuffer:
            'Fibrinogen-depleted human plasma, bovine or human thrombin, calcium chloride, factor XIIIa for cross-linking, turbidimetric polymerisation kinetics',
        },
        {
          id: 'fib-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Maximum clot firmness by thromboelastometry',
          description:
            'Measure the parameter the licence was granted on: the maximum firmness of the clot formed in whole blood. Reporting the Clauss fibrinogen concentration alongside it matters, because the two can move apart, and only one of them is what the approval was based on.',
          dependsOnStepId: 'fib-w4',
          reagentsAndBuffer:
            'Rotational thromboelastometry with a fibrin-specific channel, Clauss clottable fibrinogen assay, tissue factor activator, cytochalasin D for platelet inhibition',
        },
      ],
    },
    keyAudits: [
      {
        id: 'fib-a1',
        category: 'inferred',
        title: 'The licence rests on clot firmness measured in thirty-six people',
        laymanSummary:
          'Approval in 2009 was based on a pharmacokinetic study of 14 subjects and a retrospective cohort of 22, with the main efficacy measurement being how firm a clot got in a laboratory device — not whether anybody stopped bleeding faster.',
        technicalDetails:
          'The RiaSTAP clinical studies section describes a prospective pharmacokinetic study in 14 subjects aged 8 to 61 and a multicentre non-interventional retrospective cohort study with 12-month prospective follow-up in 22 subjects, 11 paediatric and 11 adult. The primary efficacy endpoint was maximum clot firmness measured by thromboelastometry, which rose by a mean of 8.9 mm after infusion. Haemostatic efficacy was rated effective in 97% of bleeding events and 97.5% of surgical bleeding, in a retrospective, uncontrolled cohort. Congenital afibrinogenaemia is rare enough that a controlled trial is not realistically possible, so the approval pathway is defensible. What is not defensible is treating that evidence base as though it licenses the far larger acquired-deficiency population the product is actually used in.',
        evidenceSource:
          'RIASTAP (Fibrinogen Concentrate, Human) prescribing information, Clinical Studies; CSL Behring GmbH, initial US approval 2009',
        measuredMetric:
          'Maximum clot firmness by thromboelastometry, mean increase of 8.9 mm after infusion',
        inferredClaim:
          'That a licence granted on clot firmness in 36 people with an inherited deficiency says anything about a bleeding trauma or cardiac surgery patient whose fibrinogen has been consumed',
        auditFlag: 'caution',
      },
      {
        id: 'fib-a2',
        category: 'measured',
        title: 'Against cryoprecipitate in cardiac surgery it is genuinely equivalent',
        laymanSummary:
          'In 735 cardiac surgery patients bleeding with a low fibrinogen level, the concentrate and cryoprecipitate produced the same transfusion requirement over the next 24 hours. The trial stopped early because non-inferiority was already established.',
        technicalDetails:
          'FIBRES randomised adult patients with clinically significant bleeding and hypofibrinogenaemia after cardiopulmonary bypass at 11 Canadian hospitals to 4 g of fibrinogen concentrate or 10 units of cryoprecipitate per ordered dose. Of 827 randomised, 735 were treated and analysed: median age 64, 72% complex operations, 95% moderate to severe bleeding, pretreatment fibrinogen 1.6 g/L. Mean 24-hour post-bypass allogeneic transfusion was 16.3 units (95% CI 14.9 to 17.8) against 17.0 units (95% CI 15.6 to 18.6), ratio 0.96 (one-sided 97.5% CI to 1.09, p<0.001 for non-inferiority; two-sided 95% CI 0.84 to 1.09, p=0.50 for superiority). The trial met its a priori stopping criterion for non-inferiority at the interim analysis after 827 of a planned 1,200 patients. Thromboembolic events occurred in 7.0% against 9.6%.',
        evidenceSource:
          'Callum J, Farkouh ME, Scales DC, et al. Effect of Fibrinogen Concentrate vs Cryoprecipitate on Blood Component Transfusion After Cardiac Surgery: The FIBRES Randomized Clinical Trial. JAMA 2019;322(20):1966-1976',
        doi: '10.1001/jama.2019.17312',
        measuredMetric:
          'Total red cell, platelet and plasma units transfused during the 24 hours after cardiopulmonary bypass',
        auditFlag: 'verified',
      },
      {
        id: 'fib-a3',
        category: 'failed',
        title: 'In aortic surgery it increased transfusion instead of reducing it',
        laymanSummary:
          'A blinded trial gave fibrinogen concentrate or placebo to bleeding aortic surgery patients. The treated group received more blood products over the next day, not fewer, and fewer of them avoided transfusion entirely.',
        technicalDetails:
          'REPLACE randomised 519 patients undergoing elective aortic surgery on cardiopulmonary bypass across 34 centres, of whom 152 (29%) met the bleeding criterion for study medication — a five-minute bleeding mass of 60 to 250 g after separation from bypass and surgical haemostasis. Median pretreatment five-minute bleeding mass was 107 g on concentrate and 91 g on placebo (p=0.13). Allogeneic blood product units in the first 24 hours were 5.0 (IQR 2.0 to 11.0) on concentrate against 3.0 (IQR 0.0 to 7.0) on placebo, p=0.026. Fewer patients avoided transfusion altogether on concentrate, 15.4% against 28.4%, p=0.047. The concentrate did exactly what it says on the vial — plasma fibrinogen concentration and fibrin-based clot strength rose immediately — and the patients received more blood. The authors describe the result as unexpected and contrary to previous studies, and point to low bleeding rates, normal-range pretreatment fibrinogen and variable adherence to the transfusion algorithm.',
        evidenceSource:
          'Rahe-Meyer N, Levy JH, Mazer CD, et al. Randomized evaluation of fibrinogen vs placebo in complex cardiovascular surgery (REPLACE): a double-blind phase III study of haemostatic therapy. Br J Anaesth 2016;117(1):41-51',
        doi: '10.1093/bja/aew169',
        measuredMetric:
          'Allogeneic blood product units administered in the first 24 hours, and proportion of patients avoiding transfusion',
        auditFlag: 'verified',
      },
      {
        id: 'fib-a4',
        category: 'failed',
        title: 'Early fibrinogen replacement in trauma did not save a single extra life',
        laymanSummary:
          'CRYOSTAT-2 gave every bleeding trauma patient a large early dose of fibrinogen replacement on top of standard care. Death at 28 days was 25.3% against 26.1% on standard care — no difference.',
        technicalDetails:
          'CRYOSTAT-2 randomised 1,604 injured adults requiring activation of a major haemorrhage protocol at 26 UK and US major trauma centres between August 2017 and November 2021, to standard care or standard care plus three pools of cryoprecipitate — six grams of fibrinogen equivalent — within 90 minutes of randomisation and three hours of injury. Median Injury Severity Score was 29, 36% had penetrating injury and 33% arrived with a systolic pressure below 90 mmHg. All-cause 28-day mortality in the intention-to-treat population was 26.1% on standard care against 25.3% with cryoprecipitate, odds ratio 0.96 (95% CI 0.75 to 1.23, p=0.74). Thrombotic events were 12.9% against 12.7%. The trial tested the strategy of early empirical fibrinogen replacement rather than this specific product, and that strategy is the one on which most off-label use of fibrinogen concentrate rests.',
        evidenceSource:
          'Davenport R, Curry N, Fox EE, et al. Early and Empirical High-Dose Cryoprecipitate for Hemorrhage After Traumatic Injury: The CRYOSTAT-2 Randomized Clinical Trial. JAMA 2023;330(19):1882-1891',
        doi: '10.1001/jama.2023.21019',
        measuredMetric: 'All-cause mortality at 28 days in the intention-to-treat population',
        auditFlag: 'verified',
      },
      {
        id: 'fib-a5',
        category: 'inferred',
        title: 'Almost all of its use is for a deficiency it is not licensed to treat',
        laymanSummary:
          'The label covers people born without enough fibrinogen — a very rare condition. Most of the product goes to people who had normal fibrinogen until they bled it away, which is a different problem with different evidence.',
        technicalDetails:
          'The RiaSTAP indication is confined to acute bleeding episodes in congenital fibrinogen deficiency, including afibrinogenaemia and hypofibrinogenaemia, with dysfibrinogenaemia explicitly excluded. Acquired hypofibrinogenaemia after cardiopulmonary bypass, in post-partum haemorrhage and in trauma is orders of magnitude more common, and it is where the randomised evidence sits — FIBRES, REPLACE and, for the strategy rather than the product, CRYOSTAT-2. The distinction is not pedantic. In congenital deficiency the protein is simply absent and replacing it restores something that was never there. In acquired depletion the fibrinogen was consumed by a process that is still running, and replacing it feeds a fire that is still burning. REPLACE and CRYOSTAT-2 are what that difference looks like when it is measured.',
        evidenceSource:
          'RIASTAP prescribing information, Indications and Usage with limitation of use; Br J Anaesth 2016;117(1):41-51; JAMA 2023;330(19):1882-1891',
        doi: '10.1093/bja/aew169',
        inferredClaim:
          'That replacing a consumed clotting protein in a bleeding patient works the way replacing an absent one does in a patient born without it',
        auditFlag: 'caution',
      },
      {
        id: 'fib-a6',
        category: 'measured',
        title: 'The clot firmness rises every time. That part is not in doubt.',
        laymanSummary:
          'Across every study, giving the concentrate raises the fibrinogen level and the measured firmness of the clot within minutes. What varies is whether that helps.',
        technicalDetails:
          'Maximum clot firmness rose by a mean of 8.9 mm after infusion in the licensing studies. In REPLACE, the concentrate immediately increased plasma fibrinogen concentration and fibrin-based clot strength — in the arm that then received more blood products. This is the most direct pharmacodynamic relationship in this whole group of drugs: a structural protein is missing, it is put back, and the mechanical property it determines improves in proportion. The audit finding is not that the mechanism is doubtful. It is that a mechanically firmer clot in a viscoelastic device and a patient who stops bleeding are two different measurements, and the trials that measured the second one have split.',
        evidenceSource:
          'RIASTAP prescribing information, Clinical Studies; Rahe-Meyer N, et al. Br J Anaesth 2016;117(1):41-51',
        doi: '10.1093/bja/aew169',
        measuredMetric:
          'Maximum clot firmness by thromboelastometry and plasma fibrinogen concentration after infusion',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Freeze-dried powder, reconstituted and infused',
        laymanDesc:
          'Comes as a vial of powder with a known amount of protein in it, mixed with water and given into a vein. The known amount is the point: the alternative, cryoprecipitate, varies from bag to bag.',
        molecularDetail:
          'Potency is assigned by clottable protein content, so the dose delivered is defined in grams of functional fibrinogen rather than in pooled units of unknown concentration. There is no thawing and no blood group matching, because the product contains no cells and no antibodies.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It joins the plasma pool immediately',
        laymanDesc:
          'Fibrinogen already circulates dissolved in blood, at a higher concentration than any other clotting protein. The infused material simply adds to that pool.',
        molecularDetail:
          'Fibrinogen circulates at roughly 2 to 4 g/L in health, an order of magnitude above the other coagulation factors by mass, which is why depletion is measured in grams and replacement is dosed in grams. It is a 340 kDa hexamer of two alpha, two beta and two gamma chains held together by disulfide bonds.',
        iconName: 'Droplet',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Thrombin snips two short pieces off each molecule',
        laymanDesc:
          'Fibrinogen is deliberately unsticky while it circulates. Thrombin cuts off the small caps that keep it that way, and what is left is sticky at both ends.',
        molecularDetail:
          'Thrombin cleaves fibrinopeptide A from the amino terminus of each alpha chain and fibrinopeptide B from each beta chain, exposing polymerisation knobs that fit complementary holes in the gamma and beta nodules of neighbouring molecules. Nothing is consumed catalytically; the protein becomes the structure.',
        iconName: 'Scissors',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The molecules link up into a mesh and are then welded together',
        laymanDesc:
          'The sticky ends interlock into long strands that branch into a net. A separate enzyme then cross-links the strands so the net can resist being pulled apart.',
        molecularDetail:
          'Half-staggered double-stranded protofibrils aggregate laterally into fibres and branch into a three-dimensional network. Factor XIIIa introduces covalent gamma-glutamyl-epsilon-lysyl cross-links between gamma chains and within the alpha chains, which is what converts a soluble mesh into one that resists both mechanical disruption and plasmin. Cryoprecipitate supplies factor XIII as well; the concentrate does not, which is a real difference between the two products.',
        iconName: 'Network',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The clot measurably firms up',
        laymanDesc:
          'Put a sample in a device that measures how stiff the clot becomes, and the number goes up within minutes. This is the measurement the licence was granted on.',
        molecularDetail:
          'Maximum clot firmness rose by a mean of 8.9 mm after infusion in the licensing studies, and REPLACE confirmed an immediate rise in both plasma fibrinogen concentration and fibrin-based clot strength. Clot firmness in a viscoelastic assay is close to a direct readout of fibrinogen concentration, which is what makes it such an attractive and such a circular endpoint.',
        iconName: 'Gauge',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And then the trials disagree about the patient',
        laymanDesc:
          'Against cryoprecipitate in cardiac surgery, equivalent. Against placebo in aortic surgery, more transfusion, not less. As an early strategy in trauma, no lives saved.',
        molecularDetail:
          'FIBRES: 16.3 against 17.0 units transfused, ratio 0.96, non-inferior. REPLACE: 5.0 against 3.0 units, p=0.026, with fewer patients avoiding transfusion, 15.4% against 28.4%, p=0.047. CRYOSTAT-2: 28-day mortality 25.3% against 26.1%, odds ratio 0.96 (95% CI 0.75 to 1.23). Three randomised trials, three populations, and a clot-firmness effect that is identical in all of them.',
        iconName: 'Split',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'FIBRES (NCT03037424) — fibrinogen concentrate versus cryoprecipitate in cardiac surgery',
        phase:
          'Randomised non-inferiority trial at 11 Canadian hospitals, stopped early for non-inferiority',
        sampleSize: 735,
        primaryEndpoint:
          'Red cell, platelet and plasma units administered during the 24 hours after cardiopulmonary bypass',
        endpointMet: true,
        statisticalPValue:
          '16.3 units (95% CI 14.9 to 17.8) versus 17.0 units (95% CI 15.6 to 18.6), ratio 0.96, p < 0.001 for non-inferiority and p = 0.50 for superiority',
        unreportedAdverseSignals:
          'Stopped at an interim analysis after 827 of a planned 1,200 randomisations. The comparator is a blood component of variable fibrinogen content, so the trial establishes equivalence to an imprecise standard rather than efficacy against no treatment.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'REPLACE (NCT01475669) — fibrinogen concentrate versus placebo in complex aortic surgery',
        phase: 'Double-blind phase 3 randomised placebo-controlled trial, 34 centres',
        sampleSize: 152,
        primaryEndpoint: 'Allogeneic blood product units administered in the first 24 hours',
        endpointMet: false,
        statisticalPValue:
          '5.0 units (IQR 2.0 to 11.0) on concentrate versus 3.0 units (IQR 0.0 to 7.0) on placebo, p = 0.026 — in the direction opposite to the hypothesis',
        unreportedAdverseSignals:
          'Fewer patients avoided transfusion altogether on the concentrate, 15.4% versus 28.4% (p=0.047). Only 152 of 519 randomised patients met the bleeding criterion to receive study medication, and pretreatment fibrinogen concentrations were in the normal range.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'CRYOSTAT-2 (NCT04704869) — early empirical high-dose fibrinogen replacement in trauma',
        phase:
          'International randomised open-label parallel-group controlled trial, 26 trauma centres',
        sampleSize: 1604,
        primaryEndpoint: 'All-cause mortality at 28 days in the intention-to-treat population',
        endpointMet: false,
        statisticalPValue:
          '25.3% on cryoprecipitate versus 26.1% on standard care, odds ratio 0.96 (95% CI 0.75 to 1.23), p = 0.74',
        unreportedAdverseSignals:
          'Thrombotic events 12.7% versus 12.9%, so the null result is not explained by offsetting harm. The trial tested cryoprecipitate rather than the concentrate, and therefore the strategy of early fibrinogen replacement rather than this product.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Licensing studies in congenital fibrinogen deficiency',
        phase:
          'Prospective pharmacokinetic study plus a multicentre non-interventional retrospective cohort with 12-month prospective follow-up',
        sampleSize: 36,
        primaryEndpoint: 'Maximum clot firmness measured by thromboelastometry',
        endpointMet: true,
        statisticalPValue:
          'Mean increase in maximum clot firmness of 8.9 mm after infusion; haemostatic efficacy rated effective in 97% of bleeding events and 97.5% of surgical bleeding',
        unreportedAdverseSignals:
          'Fourteen subjects in the pharmacokinetic study and 22 in the retrospective cohort, with no control group and a laboratory primary endpoint. The efficacy ratings are retrospective investigator assessments.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Maximum clot firmness by thromboelastometry rose by a mean of 8.9 mm after infusion in the licensing studies',
        'Non-inferiority to cryoprecipitate in cardiac surgery: 16.3 against 17.0 units transfused over 24 hours, ratio 0.96, in 735 randomised patients',
        'More allogeneic blood product units in the first 24 hours on concentrate than on placebo in aortic surgery, 5.0 against 3.0 (p=0.026)',
        'No difference in 28-day mortality from early empirical high-dose fibrinogen replacement in 1,604 randomised trauma patients (odds ratio 0.96, 95% CI 0.75 to 1.23)',
        'Cumulative virus reduction of at least 9.6 log10 for HIV and 11.2 log10 for hepatitis C model viruses across the manufacturing process',
      ],
      unsupportedInferences: [
        'That a licence granted on clot firmness in 36 people with an inherited deficiency extends to bleeding surgical, obstetric and trauma patients whose fibrinogen has been consumed',
        'That a firmer clot in a viscoelastic assay means less bleeding in the patient — the most direct pharmacodynamic effect in this group, and the one whose clinical translation has failed twice',
        'That the non-inferiority shown against cryoprecipitate establishes efficacy; the comparator itself has never beaten standard care on mortality in trauma',
        'That replacing fibrinogen consumed by an ongoing process works the way replacing fibrinogen that was never made does',
      ],
      whatFailedInitially: [
        'REPLACE found more allogeneic transfusion on the concentrate than on placebo, with fewer patients avoiding transfusion entirely (15.4% against 28.4%)',
        'CRYOSTAT-2 found no survival benefit from early empirical fibrinogen replacement in 1,604 bleeding trauma patients',
        'FIBRES was stopped early at an interim analysis, having demonstrated non-inferiority but not superiority (p=0.50)',
        'The label explicitly excludes dysfibrinogenaemia, where the protein is present but does not work — the one deficiency state that replacement cannot fix',
      ],
      realWorldOutcome: [
        'Stocked in cardiac theatres, obstetric units and trauma centres in Europe and increasingly in North America, overwhelmingly for the acquired deficiency it is not licensed to treat',
        'US$1.42 per milligram of average Medicare Part B spending in 2024 for Riastap and US$1.17 for Fibryga',
        'Has displaced cryoprecipitate in many centres on the strength of standardised dosing, no thawing and no blood group matching, rather than on any demonstrated outcome advantage',
        'Carries a thrombosis warning noting that thrombosis occurs spontaneously in congenital fibrinogen deficiency with or without replacement therapy',
      ],
    },
    deliverySystem: {
      type: 'Intravenous infusion of a reconstituted lyophilised concentrate',
      description:
        'Supplied as a freeze-dried powder reconstituted with sterile water and infused slowly into a vein. Because it is a purified protein with no cells and no plasma antibodies, it requires no blood group matching and no thawing, which is the practical advantage that has driven its adoption over cryoprecipitate more than any trial result has.',
      safetyProfile:
        'No boxed warning. The label warns that thrombosis may occur spontaneously in patients with congenital fibrinogen deficiency with or without fibrinogen replacement therapy, and that thromboembolic events have been reported with the product; it directs that benefits be weighed against thrombosis risk and that patients be monitored for unexplained chest or leg pain, haemoptysis and breathlessness. It is plasma-derived, so a residual theoretical risk of transmissible agents remains despite heat treatment at 60°C for 20 hours, two glycine precipitation steps and a reported cumulative virus reduction of at least 9.6 log10 for HIV. Hypersensitivity reactions can occur. It supplies fibrinogen alone, not the factor XIII or von Willebrand factor that cryoprecipitate also contains.',
    },
    commonQuestions: [
      {
        q: 'Is this better than cryoprecipitate?',
        a: 'It is more convenient and, on the one head-to-head trial, not more effective. FIBRES randomised 735 bleeding cardiac surgery patients and found the same 24-hour transfusion requirement, 16.3 units against 17.0, with the trial explicitly failing to show superiority (p=0.50). What the concentrate does offer is a known dose in every vial, no thawing, no blood group matching and a pathogen inactivation step that cryoprecipitate does not have. Those are real advantages for a hospital. They are logistical advantages, not clinical ones, and the distinction is worth keeping straight.',
        auditNote:
          'Cryoprecipitate also supplies factor XIII and von Willebrand factor, which the concentrate does not.',
      },
      {
        q: 'Why did giving fibrinogen make bleeding worse in one trial?',
        a: 'REPLACE did not show that fibrinogen made bleeding worse; it showed that patients given it received more blood products. The concentrate raised plasma fibrinogen and clot strength immediately, exactly as expected, and the treated group still ended up transfused more. The investigators point to three things: the patients had pretreatment fibrinogen concentrations in the normal range, the bleeding threshold used to trigger treatment let in patients who were not bleeding much, and adherence to the complex transfusion algorithm varied. In other words, giving a replacement protein to people who were not short of it did not help and may have shifted how the rest of the protocol was applied.',
        auditNote:
          'The authors describe the finding as unexpected and contrary to previous studies, which is the honest way to report it.',
      },
      {
        q: 'Does it help in major trauma?',
        a: 'The largest trial of the strategy says no. CRYOSTAT-2 gave 1,604 severely injured patients an early, empirical six-gram-equivalent dose of fibrinogen replacement within three hours of injury, on top of standard major haemorrhage care. Twenty-eight-day mortality was 25.3% against 26.1% — an odds ratio of 0.96 with a confidence interval that comfortably includes no effect, and no difference in thrombotic events either. That trial used cryoprecipitate rather than the concentrate, so it tests the idea rather than the product, but the idea is what most off-label use is based on.',
      },
      {
        q: 'What is it actually licensed for?',
        a: 'Acute bleeding episodes in people with congenital fibrinogen deficiency — afibrinogenaemia and hypofibrinogenaemia — and explicitly not dysfibrinogenaemia, where the protein is made but does not work properly. That is a rare inherited condition. The great majority of the product used worldwide goes to patients who were making normal fibrinogen until surgery, childbirth or injury consumed it, which is a different biological situation and a different evidence base.',
        auditNote:
          'This is the widest gap on the page between what the licence covers and what the drug is used for.',
      },
      {
        q: 'Why is clot firmness a weak endpoint here?',
        a: 'Because it is close to a direct measurement of how much fibrinogen is in the sample. Giving fibrinogen and then measuring how much fibrin the sample can form is very nearly measuring the dose. That is not a criticism of the assay, which is genuinely useful for deciding whether someone is short of fibrinogen. It is a caution about using it as evidence of benefit: the number is guaranteed to move, and whether the patient does is a separate question that three randomised trials have answered three different ways.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Callum J, Farkouh ME, Scales DC, et al. Effect of Fibrinogen Concentrate vs Cryoprecipitate on Blood Component Transfusion After Cardiac Surgery: The FIBRES Randomized Clinical Trial. JAMA 2019;322(20):1966-1976',
        identifier: '10.1001/jama.2019.17312',
        kind: 'doi',
      },
      {
        label:
          'Rahe-Meyer N, Levy JH, Mazer CD, et al. Randomized evaluation of fibrinogen vs placebo in complex cardiovascular surgery (REPLACE): a double-blind phase III study of haemostatic therapy. Br J Anaesth 2016;117(1):41-51',
        identifier: '10.1093/bja/aew169',
        kind: 'doi',
      },
      {
        label:
          'Davenport R, Curry N, Fox EE, et al. Early and Empirical High-Dose Cryoprecipitate for Hemorrhage After Traumatic Injury: The CRYOSTAT-2 Randomized Clinical Trial. JAMA 2023;330(19):1882-1891',
        identifier: '10.1001/jama.2023.21019',
        kind: 'doi',
      },
      {
        label: 'FIBRES — Fibrinogen Replenishment in Surgery',
        identifier: 'NCT03037424',
        kind: 'nct',
      },
      {
        label: 'REPLACE — fibrinogen concentrate versus placebo in complex cardiovascular surgery',
        identifier: 'NCT01475669',
        kind: 'nct',
      },
      {
        label: 'CRYOSTAT-2 — early cryoprecipitate in major trauma haemorrhage',
        identifier: 'NCT04704869',
        kind: 'nct',
      },
      {
        label:
          'RIASTAP (Fibrinogen Concentrate, Human) — prescribing information: indications with limitation of use, thrombosis warning, description and clinical studies. CSL Behring GmbH, initial US approval 2009',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=903dc8d0-39da-462c-9dac-004e0c7a26cc',
        kind: 'regulatory',
      },
      {
        label: 'FIBRYGA (Fibrinogen (Human)) — prescribing information, Octapharma USA',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=e3422d2a-2cb6-6f49-0be7-cb960b3d5bd5',
        kind: 'regulatory',
      },
      {
        label:
          'UniProtKB P02671, P02675 and P02679 — human fibrinogen alpha, beta and gamma chains, sequence lengths and masses',
        identifier: 'https://rest.uniprot.org/uniprotkb/P02671',
        kind: 'url',
      },
      {
        label:
          'CMS Medicare Part B Spending by Drug — HCPCS J7178 (Riastap) and J7177 (Fibryga), human fibrinogen concentrate per 1 mg; average spending per dosage unit US$1.4216 and US$1.1724 in 2024',
        identifier:
          'https://data.cms.gov/summary-statistics-on-use-and-payments/medicare-medicaid-spending-by-drug/medicare-part-b-spending-by-drug',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 11. Eltrombopag — a platelet count that always rises, and three settings where that was wrong.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'eltrombopag',
    name: 'Eltrombopag',
    tradeName: 'Promacta / Promacta Kit',
    sponsor: 'Novartis; originated at GlaxoSmithKline as SB-497115',
    targetGene: 'MPL — the gene encoding the thrombopoietin receptor, c-Mpl',
    targetProtein:
      'The transmembrane domain of the human thrombopoietin receptor (c-Mpl). It does not compete with thrombopoietin, which binds the extracellular domain, and it activates only the human and chimpanzee receptor',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2008,
    indication:
      'Thrombocytopenia in adults and children aged 1 year and older with persistent or chronic immune thrombocytopenia after insufficient response to corticosteroids, immunoglobulins or splenectomy; thrombocytopenia in chronic hepatitis C to allow initiation and maintenance of interferon-based therapy; and severe aplastic anaemia, both first-line with immunosuppressive therapy and after insufficient response to it. Not indicated for myelodysplastic syndrome',
    patientFriendlyIndication:
      'Raising a dangerously low platelet count by telling the bone marrow to make more, rather than by stopping the body destroying them',
    anatomicalSite: 'Bone marrow — the megakaryocyte, the giant cell that platelets are shed from',
    conditionContext: {
      conditionExplainer:
        'Platelets are made by megakaryocytes in the bone marrow, which shed thousands of fragments each into the bloodstream. A hormone called thrombopoietin tells the marrow how many to make. In immune thrombocytopenia the platelets are destroyed by antibodies faster than they can be replaced; in aplastic anaemia the marrow itself has failed.',
      whyItMatters:
        'Every previous treatment for immune thrombocytopenia worked by suppressing the immune system or removing the spleen. This one leaves the destruction untouched and simply orders the factory to work harder. That is a genuinely different idea, and it is why the drug works in patients who have failed everything else.',
      whoTakesThis:
        'People with chronic immune thrombocytopenia who have already failed steroids, immunoglobulin or splenectomy, and people with severe aplastic anaemia. It is taken by mouth, daily, often for years.',
      clinicalGoals:
        'Raise the platelet count enough to reduce bleeding risk. The count is the endpoint in almost every trial; bleeding is measured much less often and moved much less clearly.',
    },
    oneSentenceVerdict:
      'An oral molecule that jams itself into the transmembrane part of the thrombopoietin receptor and switches the platelet factory on without competing with the hormone that normally does it, raising the platelet count in about four out of five people with chronic immune thrombocytopenia against about one in four on placebo — a reliable effect that failed to reduce bleeding when it was finally measured in liver disease, caused portal vein thrombosis there, and raised both death and leukaemia progression in myelodysplastic syndrome.',
    laymanHowItWorks:
      'Platelets are shed by giant cells in the bone marrow, which are told how many to make by a hormone called thrombopoietin. Eltrombopag switches the same receptor on, but it binds a different part of it — the section buried in the cell membrane rather than the part the hormone docks to. So it acts as an extra signal rather than a substitute one. The marrow makes more megakaryocytes, the megakaryocytes shed more platelets, and the count rises over about two weeks.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 66,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$397.68 per tablet of average Medicare Part D spending in 2023, and US$97,700.79 per beneficiary for the year across 5,708 beneficiaries',
      markupEstimate:
        'Not calculable. No published per-dose cost of production exists for this molecule, so there is no denominator to divide the payment by.',
      openPatentNotes:
        'A second product, eltrombopag choline (Alvaiz, Teva), was approved in 2023 under a separate application at different tablet strengths, and is not a substitutable generic of the olamine salt. The synthesis is a conventional diazonium coupling to a pyrazolone, which is not the reason the drug is priced where it is.',
      synthesisComplexity: 'Moderate',
      costSource: NO_COST_STUDY_SOURCE,
      priceSource: CMS_PART_D_SOURCE,
    },
    substitutes: {
      summary:
        'The nearest comparator is romiplostim, a peptide agonist of the same receptor given by weekly injection, and the newer oral agent avatrombopag. All three raise the platelet count; none has been shown to reduce death, and only one head-to-head consideration really matters clinically — route, food restrictions and cost rather than efficacy.',
      conventionalRx: [
        {
          name: 'Romiplostim (Nplate)',
          class: 'Peptibody thrombopoietin receptor agonist',
          howItCompares:
            'Binds the extracellular domain of the same receptor, competing with thrombopoietin where eltrombopag does not. Given as a weekly subcutaneous injection rather than a daily tablet, with no food restrictions and no hepatotoxicity warning.',
          typicalCost:
            'US$96.80 per 10 micrograms of average Medicare Part B spending in 2024, and US$2,473.63 per Medicaid claim in 2023.',
          prosAndCons:
            'Pros: weekly rather than daily, no interaction with food or polyvalent cations, no boxed warning. Cons: an injection, and it carries its own bone marrow reticulin concerns.',
        },
        {
          name: 'Avatrombopag (Doptelet)',
          class: 'Oral thrombopoietin receptor agonist',
          howItCompares:
            'The same mechanism in a molecule that does not chelate cations, so it can be taken with food and without the two-hour separation from dairy and antacids that eltrombopag requires. Licensed for chronic liver disease before procedures as well as for immune thrombocytopenia.',
          typicalCost:
            'US$406.25 per tablet of average Medicare Part D spending in 2023, US$59,691.84 per beneficiary for the year.',
          prosAndCons:
            'Pros: no food separation, licensed in liver disease. Cons: the same class-wide gap between a platelet count and a bleeding outcome.',
        },
        {
          name: 'Corticosteroids, immunoglobulin and splenectomy',
          class: 'Immunosuppression and platelet-destruction control',
          howItCompares:
            'The prior lines of treatment, all of which attack the destruction rather than boosting production. Eltrombopag is licensed only after these have been insufficient, and in the pivotal trial 59% of patients on it were able to reduce concomitant immune thrombocytopenia treatment against 32% on placebo.',
          typicalCost:
            'Generic corticosteroids are inexpensive; immunoglobulin and splenectomy are not.',
          prosAndCons:
            'Pros: can produce durable remission, which thrombopoietin receptor agonists generally do not. Cons: the toxicity of long-term steroids, and splenectomy is irreversible.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC1=C(C=C(C=C1)N2C(=O)C(=C(N2)C)N=NC3=CC=CC(=C3O)C4=CC(=CC=C4)C(=O)O)C',
      chemicalFormula: 'C25H22N4O4',
      molecularWeight:
        '442.50 g/mol for the eltrombopag free acid; the marketed salt is eltrombopag olamine, C25H22N4O4 • 2(C2H7NO), 564.65 g/mol',
      targetReceptorAffinity:
        'Interacts with the transmembrane domain of the human thrombopoietin receptor without competing with thrombopoietin itself. Species-restricted: it activates STAT signalling only in human and chimpanzee platelets, so no rodent efficacy model exists',
      structureSource: {
        label:
          'PROMACTA (eltrombopag) tablets FDA-approved prescribing information, section 11 Description — biphenyl hydrazone, molecular formula and molecular weights; structure cross-checked against the PubChem record for eltrombopag',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22PROMACTA%22',
        kind: 'regulatory',
      },
      laboratoryWorkflow: [
        {
          id: 'elt-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Control of the aniline and pyrazolone starting materials',
          description:
            'Confirm identity and impurity profile of the substituted aniline and the pyrazolone before coupling. Aromatic amines carry genotoxic impurity concerns, so the specification here is written around what must not be present rather than what must.',
          reagentsAndBuffer:
            '3,4-dimethylaniline and pyrazolone reference standards, gas chromatography with mass detection for residual aromatic amines, HPLC purity profiling, Karl Fischer water determination',
        },
        {
          id: 'elt-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Diazotisation and azo coupling to form the hydrazone',
          description:
            'Diazotise the aromatic amine at low temperature and couple it to the pyrazolone to give the biphenyl hydrazone core. The diazonium intermediate is unstable and the reaction is run cold and used immediately, which is the operational constraint that defines the whole route.',
          dependsOnStepId: 'elt-w1',
          reagentsAndBuffer:
            'Sodium nitrite in aqueous acid at 0 to 5°C, biphenyl carboxylic acid coupling partner, controlled pH buffer, nitrogen atmosphere',
        },
        {
          id: 'elt-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Formation and crystallisation of the bis-olamine salt',
          description:
            'Convert the free acid to the bis-ethanolamine salt and crystallise. This is not cosmetic: the free acid is practically insoluble in aqueous buffer from pH 1 to 7.4, and the salt form is what makes an oral tablet possible at all.',
          dependsOnStepId: 'elt-w2',
          reagentsAndBuffer:
            '2-aminoethanol in a 1:2 stoichiometry, controlled anti-solvent crystallisation, X-ray powder diffraction for polymorph identity, reversed-phase HPLC for related substances',
        },
        {
          id: 'elt-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Activation of the human thrombopoietin receptor in a cellular assay',
          description:
            'Confirm the compound activates STAT and MAP kinase signalling through the receptor in human cells, and confirm it does so without displacing thrombopoietin. The species restriction has to be demonstrated here, because it is the reason no rodent model can be used downstream.',
          dependsOnStepId: 'elt-w3',
          reagentsAndBuffer:
            'Thrombopoietin-receptor-expressing human cell line, phospho-STAT and phospho-ERK immunoassays, recombinant human thrombopoietin for competition controls, platelets from human, chimpanzee and rodent donors',
        },
        {
          id: 'elt-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Megakaryocyte differentiation from CD34-positive progenitors',
          description:
            'Measure the endpoint that actually matters biologically: whether primary human bone marrow progenitors proliferate and differentiate into megakaryocytes. Counting CD41-positive cells is a step closer to the therapeutic effect than a phosphorylation signal, and still two steps away from a patient not bleeding.',
          dependsOnStepId: 'elt-w4',
          reagentsAndBuffer:
            'Primary human CD34-positive bone marrow cells, serum-free megakaryocyte differentiation medium, anti-CD41 flow cytometry, colony-forming unit megakaryocyte assay',
        },
      ],
    },
    keyAudits: [
      {
        id: 'elt-a1',
        category: 'measured',
        title: 'Four in five responded against fewer than one in three on placebo',
        laymanSummary:
          'In 197 patients with chronic immune thrombocytopenia, 79% on eltrombopag reached a platelet count in the target range at least once over six months, against 28% on placebo. Fewer needed rescue treatment and fewer had serious bleeds.',
        technicalDetails:
          'RAISE was a phase 3, double-blind, placebo-controlled trial in adults with previously treated immune thrombocytopenia of more than six months’ duration and baseline platelet counts below 30,000 per microlitre, randomised 2:1 to local standard of care plus 50 mg eltrombopag or matching placebo for six months. Of 197 randomised, 106 of 135 (79%) on eltrombopag responded at least once against 17 of 62 (28%) on placebo; the odds of responding across the treatment period gave an odds ratio of 8.2 (99% CI 3.59 to 18.73, p<0.0001). Concomitant immune thrombocytopenia treatment was reduced in 59% against 32% (p=0.016) and rescue treatment was needed by 18% against 40% (p=0.001). Serious bleeding events occurred in 1 of 135 (<1%) against 4 of 62 (7%). Three eltrombopag patients had thromboembolic events against none on placebo, and nine had mild alanine aminotransferase rises against two.',
        evidenceSource:
          'Cheng G, Saleh MN, Marcher C, et al. Eltrombopag for management of chronic immune thrombocytopenia (RAISE): a 6-month, randomised, phase 3 study. Lancet 2011;377(9763):393-402',
        doi: '10.1016/S0140-6736(10)60959-2',
        measuredMetric:
          'Odds of achieving a platelet count of 50,000 to 400,000 per microlitre during six months of treatment',
        auditFlag: 'verified',
      },
      {
        id: 'elt-a2',
        category: 'failed',
        title: 'In liver disease it avoided transfusions, changed no bleeding, and caused clots',
        laymanSummary:
          'Given before procedures in cirrhosis, eltrombopag let 72% of patients avoid a platelet transfusion against 19% on placebo — and bleeding was no different. Six patients developed clots in the portal vein against one on placebo, and the trial was stopped early.',
        technicalDetails:
          'ELEVATE randomised 292 patients with chronic liver disease of diverse causes and platelet counts below 50,000 per cubic millimetre to eltrombopag 75 mg daily or placebo for 14 days before an elective invasive procedure. A platelet transfusion was avoided in 104 of 145 (72%) against 28 of 147 (19%), p<0.001. The key secondary endpoint, bleeding of WHO grade 2 or higher, showed no significant difference: 17% against 23%. Thrombotic events of the portal venous system occurred in 6 patients on eltrombopag against 1 on placebo, which caused the study to be terminated early. This is the cleanest natural experiment in the whole thrombopoietin agonist class: the surrogate moved enormously, the clinical endpoint did not move at all, and the harm was real.',
        evidenceSource:
          'Afdhal NH, Giannini EG, Tayyab G, et al. Eltrombopag before procedures in patients with cirrhosis and thrombocytopenia. N Engl J Med 2012;367(8):716-724',
        doi: '10.1056/NEJMoa1110709',
        measuredMetric:
          'Avoidance of platelet transfusion before, during and up to 7 days after an elective invasive procedure; WHO grade 2 or higher bleeding',
        auditFlag: 'caution',
      },
      {
        id: 'elt-a3',
        category: 'failed',
        title: 'In myelodysplastic syndrome it increased leukaemia progression and death',
        laymanSummary:
          'A trial adding eltrombopag to azacitidine in 356 patients with myelodysplastic syndrome was terminated. Progression to acute myeloid leukaemia was 12% against 6%, and deaths were 32% against 29%.',
        technicalDetails:
          'The PROMACTA label reports a randomised, double-blind, placebo-controlled, multicentre trial in patients with IPSS intermediate-1, intermediate-2 or high risk myelodysplastic syndrome with thrombocytopenia receiving azacitidine plus either eltrombopag (n=179) or placebo (n=177), at 200 mg daily rising to a maximum of 300 mg for at least six cycles. It was terminated for lack of efficacy and for safety, including increased progression to acute myeloid leukaemia. Death occurred in 57 of 179 (32%) against 51 of 177 (29%), hazard ratio 1.42 (95% CI 0.97 to 2.08). Progression to acute myeloid leukaemia occurred in 21 of 179 (12%) against 10 of 177 (6%), hazard ratio 2.66 (95% CI 1.31 to 5.41). The label now carries an explicit limitation of use stating the drug is not indicated for myelodysplastic syndrome. A receptor agonist that drives proliferation of a marrow progenitor lineage was always going to raise this question in a pre-leukaemic marrow, and the trial answered it.',
        evidenceSource:
          'PROMACTA (eltrombopag) prescribing information, section 5.3 Increased Risk of Death and Progression of Myelodysplastic Syndromes to Acute Myeloid Leukemia, and section 1.4 Limitations of Use',
        measuredMetric:
          'Overall survival and incidence of progression to acute myeloid leukaemia in myelodysplastic syndrome',
        auditFlag: 'caution',
      },
      {
        id: 'elt-a4',
        category: 'measured',
        title: 'Added to standard therapy in aplastic anaemia it doubled complete responses',
        laymanSummary:
          'In 197 previously untreated patients with severe aplastic anaemia, adding eltrombopag to horse antithymocyte globulin and ciclosporin raised complete responses at three months from 10% to 22%, and the responses came about six months sooner.',
        technicalDetails:
          'RACE was a prospective, investigator-led, open-label, multicentre randomised phase 3 trial comparing horse antithymocyte globulin plus ciclosporin with or without eltrombopag as front-line therapy. Complete response at three months, the primary endpoint, was 10% in 101 patients on immunosuppression alone against 22% in 96 patients with eltrombopag added, odds ratio 3.2 (95% CI 1.3 to 7.8, p=0.01). Overall response at six months was 41% against 68%, and median time to first response 8.8 months against 3.0 months. Severe adverse events were similar. At a median 24 months, a karyotypic abnormality classified as myelodysplastic syndrome developed in 1 patient against 2, and event-free survival was 34% against 46%. Somatic mutations were present at baseline in 29% and 31% and rose to 66% and 55% at six months without affecting response or two-year outcome. This is the strongest efficacy evidence the drug has, and the endpoint is a haematological response rather than survival.',
        evidenceSource:
          'Peffault de Latour R, Kulasekararaj A, Iacobelli S, et al. Eltrombopag Added to Immunosuppression in Severe Aplastic Anemia. N Engl J Med 2022;386(1):11-23',
        doi: '10.1056/NEJMoa2109965',
        measuredMetric:
          'Haematologic complete response at 3 months in previously untreated severe aplastic anaemia',
        auditFlag: 'verified',
      },
      {
        id: 'elt-a5',
        category: 'conclusion_shift',
        title: 'A licensed indication that outlived the therapy it was licensed to enable',
        laymanSummary:
          'The label still carries an indication for raising platelets in hepatitis C so that interferon treatment can be given. Interferon has not been standard hepatitis C treatment for a decade, and the label says the drug has not been shown safe or effective with the drugs that replaced it.',
        technicalDetails:
          'Section 1.2 of the PROMACTA label indicates the drug for thrombocytopenia in chronic hepatitis C to allow initiation and maintenance of interferon-based therapy. Section 1.4 states that safety and efficacy have not been established in combination with direct-acting antiviral agents used without interferon. Direct-acting antivirals displaced interferon-based regimens for hepatitis C from around 2014, so the indication describes a treatment pathway that has essentially ceased to exist, while the drug carries a boxed warning specifically about hepatic decompensation in that same population — ascites and encephalopathy in 7% on eltrombopag plus antivirals against 4% on placebo plus antivirals in two controlled trials. The indication remains on a label effective 18 December 2025.',
        evidenceSource:
          'PROMACTA (eltrombopag) prescribing information, sections 1.2, 1.4 and 5.1, label effective 18 December 2025',
        inferredClaim:
          'That a licensed indication reflects current practice; here it preserves a use case that the field abandoned more than a decade ago',
        auditFlag: 'caution',
      },
      {
        id: 'elt-a6',
        category: 'inferred',
        title: 'No animal can tell you whether it works',
        laymanSummary:
          'Eltrombopag activates the platelet receptor in humans and chimpanzees and in no other species tested. There is no mouse or rat model of its efficacy, which is unusual for a small molecule and shaped what the early evidence could be.',
        technicalDetails:
          'Preclinical characterisation showed that the compound depends on thrombopoietin receptor expression and activates STAT and MAP kinase signalling, and that measurements in platelets across several species indicated it specifically activates only the human and chimpanzee STAT pathways. In vivo activity was demonstrated by up to a 100% increase in platelet numbers in chimpanzees given 10 mg/kg per day orally for five days. The authors also report that it interacts with the receptor without competing with thrombopoietin, which is the pharmacological basis for the two acting additively. The consequence for the evidence base is that rodent toxicology cannot address efficacy, and that the transition from cell culture to human trials happened with an unusually thin animal layer in between.',
        evidenceSource:
          'Erickson-Miller CL, Delorme E, Tian SS, et al. Preclinical activity of eltrombopag (SB-497115), an oral, nonpeptide thrombopoietin receptor agonist. Stem Cells 2009;27(2):424-430',
        doi: '10.1634/stemcells.2008-0366',
        measuredMetric:
          'Species-specific STAT pathway activation in platelets, and platelet count increase in chimpanzees',
        inferredClaim:
          'That effects observed in human cell culture and in chimpanzees predict long-term safety in humans — an inference no rodent carcinogenicity or reproductive model can independently support for efficacy-linked effects',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A daily tablet, taken well away from food',
        laymanDesc:
          'Swallowed once a day, but it must be separated by several hours from dairy, antacids and mineral supplements, because it grabs onto calcium, magnesium and iron and stops being absorbed.',
        molecularDetail:
          'The free acid is practically insoluble in aqueous buffer from pH 1 to 7.4, which is why the marketed form is the bis-olamine salt. The molecule chelates polyvalent cations, so co-administration with calcium-rich food, antacids or mineral supplements substantially reduces absorption. The tablets contain eltrombopag olamine equivalent to 12.5, 25, 50 or 75 mg of free acid.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It reaches the bone marrow and enters the cell membrane itself',
        laymanDesc:
          'Its target is not on the outside of the cell but inside the greasy membrane that surrounds it, so the molecule has to partition into that membrane rather than dock onto a surface.',
        molecularDetail:
          'The binding site is in the transmembrane domain of c-Mpl, which is why a lipophilic small molecule can do a job that otherwise requires a protein hormone. Its distribution and its food interaction both follow from the same physical chemistry: high lipophilicity and avid chelation of divalent cations.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It switches the receptor on at a different place from the hormone',
        laymanDesc:
          'Thrombopoietin docks onto the outside of the receptor. Eltrombopag pushes on a part buried in the membrane. Because they act at different places, the two can work together rather than getting in each other’s way.',
        molecularDetail:
          'The label states that eltrombopag interacts with the transmembrane domain of the human thrombopoietin receptor and initiates signalling cascades that induce megakaryocyte proliferation and differentiation. Preclinical work confirms it acts without competing with thrombopoietin, and that it activates STAT signalling only in human and chimpanzee platelets among the species tested.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Marrow progenitors turn into megakaryocytes',
        laymanDesc:
          'The signal tells stem cells in the marrow to become the giant platelet-producing cells, and tells the ones already there to mature further.',
        molecularDetail:
          'Receptor engagement activates the STAT and mitogen-activated protein kinase pathways, driving proliferation and differentiation of primary human CD34-positive bone marrow cells into CD41-positive megakaryocytes. The effect requires receptor expression, so it is confined to the megakaryocyte lineage and the progenitors that carry c-Mpl.',
        iconName: 'Dna',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The platelet count climbs over about two weeks — and falls back just as fast',
        laymanDesc:
          'Counts rise steadily and peak roughly a fortnight after starting. Stop the drug and they are back to baseline within about another fortnight. It is a tap, not a cure.',
        molecularDetail:
          'The label reports dose-dependent increases in platelet count reaching a maximum approximately two weeks after initiation and returning to baseline within approximately two weeks after the last dose. That reversibility is why treatment is generally continuous, and why patients in the pivotal trials who stopped simply relapsed.',
        iconName: 'TrendingUp',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Whether that stops bleeding depends entirely on why the count was low',
        laymanDesc:
          'In immune thrombocytopenia, rescue treatment and serious bleeding both fell. In cirrhosis, the same rise in count avoided transfusions and changed bleeding not at all, while causing clots in the portal vein.',
        molecularDetail:
          'RAISE: serious bleeding in <1% against 7% on placebo, rescue treatment in 18% against 40%. ELEVATE: transfusion avoided in 72% against 19% (p<0.001), WHO grade 2 or higher bleeding 17% against 23% — not significant — and portal venous thrombosis in 6 patients against 1, terminating the study. The pharmacology is identical in both; the clinical consequence is not.',
        iconName: 'Split',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'RAISE (NCT00370331) — eltrombopag in chronic immune thrombocytopenia',
        phase: 'Phase 3 double-blind placebo-controlled randomised trial, 6 months',
        sampleSize: 197,
        primaryEndpoint:
          'Odds of achieving a platelet count between 50,000 and 400,000 per microlitre during the treatment period',
        endpointMet: true,
        statisticalPValue: 'Odds ratio 8.2 (99% CI 3.59 to 18.73), p < 0.0001',
        unreportedAdverseSignals:
          'Three thromboembolic events on eltrombopag against none on placebo, nine mild alanine aminotransferase rises against two, and five total bilirubin rises against none. The primary endpoint is a platelet count, not a bleeding outcome.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'ELEVATE (NCT00678587) — eltrombopag before procedures in cirrhosis',
        phase: 'Randomised double-blind placebo-controlled trial, terminated early for safety',
        sampleSize: 292,
        primaryEndpoint:
          'Avoidance of a platelet transfusion before, during and up to 7 days after an elective invasive procedure',
        endpointMet: true,
        statisticalPValue: '72% versus 19%, p < 0.001',
        unreportedAdverseSignals:
          'The key secondary endpoint, WHO grade 2 or higher bleeding, showed no significant difference (17% versus 23%). Portal venous system thrombosis occurred in 6 patients on eltrombopag against 1 on placebo, which terminated the study.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'RACE (NCT02099747) — eltrombopag added to immunosuppression in severe aplastic anaemia',
        phase: 'Investigator-led open-label multicentre randomised phase 3 trial',
        sampleSize: 197,
        primaryEndpoint: 'Haematologic complete response at 3 months',
        endpointMet: true,
        statisticalPValue: '22% versus 10%, odds ratio 3.2 (95% CI 1.3 to 7.8), p = 0.01',
        unreportedAdverseSignals:
          'Open-label. Somatic mutations rose from 29% and 31% at baseline to 66% and 55% at six months in the two arms without affecting response or two-year outcome; a karyotypic abnormality classified as myelodysplastic syndrome developed in 1 and 2 patients at a median 24 months.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'SUPPORT — eltrombopag plus azacitidine in intermediate-1, intermediate-2 and high risk myelodysplastic syndrome',
        phase: 'Randomised double-blind placebo-controlled multicentre trial, terminated early',
        sampleSize: 356,
        primaryEndpoint:
          'Platelet response and safety in myelodysplastic syndrome with thrombocytopenia receiving azacitidine',
        endpointMet: false,
        statisticalPValue:
          'Death 32% versus 29%, hazard ratio 1.42 (95% CI 0.97 to 2.08); progression to acute myeloid leukaemia 12% versus 6%, hazard ratio 2.66 (95% CI 1.31 to 5.41)',
        unreportedAdverseSignals:
          'Terminated for lack of efficacy and for safety, including increased progression to acute myeloid leukaemia. The label now carries an explicit limitation of use excluding myelodysplastic syndrome.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Odds ratio 8.2 (99% CI 3.59 to 18.73) for achieving a target platelet count over six months in chronic immune thrombocytopenia, with 79% responding against 28% on placebo',
        'Serious bleeding in fewer than 1% against 7% on placebo, and rescue treatment in 18% against 40%, in the same trial',
        'Platelet transfusion avoided in 72% against 19% before procedures in cirrhosis (p<0.001), with no significant difference in WHO grade 2 or higher bleeding',
        'Haematologic complete response at three months of 22% against 10% when added to standard immunosuppression in severe aplastic anaemia (odds ratio 3.2, 95% CI 1.3 to 7.8)',
        'Platelet counts peak about two weeks after starting and return to baseline about two weeks after stopping',
      ],
      unsupportedInferences: [
        'That raising the platelet count reduces bleeding wherever the count is low — in cirrhosis it demonstrably did not, and the same manoeuvre caused portal vein thrombosis',
        'That a receptor agonist which drives megakaryocyte proliferation is safe in a marrow that is already pre-malignant; in myelodysplastic syndrome the hazard ratio for progression to acute myeloid leukaemia was 2.66',
        'That the licensed hepatitis C indication describes current practice, when it specifies interferon-based therapy that has not been standard for over a decade',
        'That efficacy demonstrated in human cell culture and in chimpanzees can be corroborated in any conventional animal model — the drug does not work in any other species tested',
      ],
      whatFailedInitially: [
        'ELEVATE was terminated early after six portal venous thromboses against one on placebo, having met its transfusion endpoint and missed its bleeding endpoint',
        'The myelodysplastic syndrome trial was terminated for lack of efficacy and for increased progression to acute myeloid leukaemia, and the label now excludes that population outright',
        'Two controlled trials in chronic hepatitis C found ascites and encephalopathy in 7% on eltrombopag plus antivirals against 4% on placebo plus antivirals, producing half of the boxed warning',
      ],
      realWorldOutcome: [
        'A first-line addition to immunosuppression in severe aplastic anaemia and a standard second-line option in chronic immune thrombocytopenia across most guidelines',
        'US$397.68 per tablet of average Medicare Part D spending in 2023 and US$97,700.79 per beneficiary for the year',
        'Carries a boxed warning for hepatic decompensation in chronic hepatitis C and for severe, potentially life-threatening hepatotoxicity',
        'Displaced in some settings by avatrombopag, largely because eltrombopag chelates dietary calcium and iron and must be taken hours away from food',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, taken once daily on an empty stomach',
      description:
        'A film-coated tablet containing eltrombopag olamine equivalent to 12.5, 25, 50 or 75 mg of free acid, taken once a day. It must be separated by several hours from dairy products, antacids and mineral supplements, because it chelates calcium, magnesium, aluminium, iron, selenium and zinc, and absorption falls sharply when they are present. A powder for oral suspension exists for young children.',
      safetyProfile:
        'Carries a boxed warning with two parts: risk of hepatic decompensation when combined with interferon and ribavirin in chronic hepatitis C, and risk of severe and potentially life-threatening hepatotoxicity generally, with liver function monitoring required before and during therapy. The label also warns of increased risk of death and progression of myelodysplastic syndrome to acute myeloid leukaemia, and of thrombotic and thromboembolic complications including portal vein thrombosis in chronic liver disease. It inhibits UGT1A1 and OATP1B1, which can produce indirect hyperbilirubinaemia that is not itself liver injury. Platelet counts must be monitored regularly, both to guide dosing and because they fall back to baseline within about two weeks of stopping.',
    },
    commonQuestions: [
      {
        q: 'Does raising the platelet count stop bleeding?',
        a: 'It depends entirely on why the count was low, and this drug provides the clearest demonstration of that in medicine. In chronic immune thrombocytopenia, where platelets are being destroyed but the rest of clotting is intact, serious bleeding fell from 7% to under 1% and the need for rescue treatment fell by more than half. In cirrhosis, where the platelet count is only one of several things wrong with haemostasis, the same rise in count let 72% of patients avoid a transfusion against 19% — and bleeding of WHO grade 2 or higher was 17% against 23%, which is no difference at all. Same drug, same effect on the number, opposite clinical meaning.',
        auditNote:
          'The cirrhosis trial was stopped early because six patients on eltrombopag developed portal vein thrombosis against one on placebo.',
      },
      {
        q: 'Why can it not be taken with dairy or antacids?',
        a: 'Because the molecule binds metal ions tightly. Calcium, magnesium, aluminium, iron, selenium and zinc all form complexes with it in the gut, and a complexed molecule is not absorbed. A glass of milk or an antacid tablet taken at the wrong time can reduce the amount that reaches the bloodstream enough to matter clinically. This is also the practical reason some patients are switched to avatrombopag, which has the same mechanism without the chelation problem.',
      },
      {
        q: 'Why is it not used in myelodysplastic syndrome, where platelets are also low?',
        a: 'Because it was tried and the trial was stopped. In 356 patients with intermediate-to-high risk myelodysplastic syndrome receiving azacitidine, adding eltrombopag produced deaths in 32% against 29% (hazard ratio 1.42) and progression to acute myeloid leukaemia in 12% against 6% (hazard ratio 2.66, 95% CI 1.31 to 5.41). The label now states outright that the drug is not indicated for myelodysplastic syndrome. The concern is mechanistically obvious in hindsight: a drug whose job is to drive proliferation of marrow progenitors is a poor choice in a marrow whose progenitors are already becoming malignant.',
        auditNote:
          'This is the most consequential negative finding on the page, and it sits in the label rather than in a journal.',
      },
      {
        q: 'Is it a cure?',
        a: 'No. It is a continuously acting stimulus, not a change in the underlying disease. Platelet counts peak about two weeks after starting and return to baseline about two weeks after the last dose, so most patients take it indefinitely. That is different from corticosteroids or splenectomy, which attack the destruction and can produce lasting remission in some people. The relevant advantage is that it works in patients for whom those approaches have already failed, and that 59% of patients on it in the pivotal trial were able to reduce their other immune thrombocytopenia treatment.',
      },
      {
        q: 'Why does the label still mention interferon for hepatitis C?',
        a: 'It is a fossil. The indication authorises raising platelets so that interferon-based hepatitis C therapy can be started or maintained, and interferon has not been standard hepatitis C treatment since direct-acting antivirals arrived around 2014. The same label states that safety and efficacy have not been established in combination with those newer drugs. So the licence covers a pathway that has essentially disappeared and does not cover the one that replaced it — while the boxed warning about hepatic decompensation in that same population remains.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Cheng G, Saleh MN, Marcher C, et al. Eltrombopag for management of chronic immune thrombocytopenia (RAISE): a 6-month, randomised, phase 3 study. Lancet 2011;377(9763):393-402',
        identifier: '10.1016/S0140-6736(10)60959-2',
        kind: 'doi',
      },
      {
        label:
          'Afdhal NH, Giannini EG, Tayyab G, et al. Eltrombopag before procedures in patients with cirrhosis and thrombocytopenia. N Engl J Med 2012;367(8):716-724',
        identifier: '10.1056/NEJMoa1110709',
        kind: 'doi',
      },
      {
        label:
          'Peffault de Latour R, Kulasekararaj A, Iacobelli S, et al. Eltrombopag Added to Immunosuppression in Severe Aplastic Anemia. N Engl J Med 2022;386(1):11-23',
        identifier: '10.1056/NEJMoa2109965',
        kind: 'doi',
      },
      {
        label:
          'Erickson-Miller CL, Delorme E, Tian SS, et al. Preclinical activity of eltrombopag (SB-497115), an oral, nonpeptide thrombopoietin receptor agonist. Stem Cells 2009;27(2):424-430',
        identifier: '10.1634/stemcells.2008-0366',
        kind: 'doi',
      },
      {
        label: 'RAISE — eltrombopag in previously treated chronic immune thrombocytopenia',
        identifier: 'NCT00370331',
        kind: 'nct',
      },
      {
        label: 'ELEVATE — eltrombopag before elective invasive procedures in chronic liver disease',
        identifier: 'NCT00678587',
        kind: 'nct',
      },
      {
        label: 'RACE — eltrombopag added to immunosuppressive therapy in severe aplastic anaemia',
        identifier: 'NCT02099747',
        kind: 'nct',
      },
      {
        label:
          'PROMACTA (eltrombopag) tablets — FDA-approved prescribing information: boxed warning, indications and limitations of use, sections 5.1 to 5.4, 11 and 12; label effective 18 December 2025',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22PROMACTA%22',
        kind: 'regulatory',
      },
      {
        label:
          'CMS Medicare Part D Spending by Drug — Promacta, average spending per dosage unit US$397.68 and per beneficiary US$97,700.79 across 5,708 beneficiaries in 2023',
        identifier:
          'https://data.cms.gov/summary-statistics-on-use-and-payments/medicare-medicaid-spending-by-drug/medicare-part-d-spending-by-drug',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 12. Romiplostim — a survival claim licensed on forty monkeys, and a leukaemia scare that faded.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'romiplostim',
    name: 'Romiplostim',
    tradeName: 'Nplate',
    sponsor: 'Amgen, Inc, under BLA 125268',
    targetGene: 'MPL — the gene encoding the thrombopoietin receptor, c-Mpl',
    targetProtein:
      'The extracellular domain of the thrombopoietin receptor. The peptide portion binds where thrombopoietin binds, despite having no amino acid sequence homology to it at all',
    modality: 'Recombinant Protein / Biologic',
    approvalStatus: 'FDA Approved',
    approvalYear: 2008,
    indication:
      'Thrombocytopenia in adults, and in children aged 1 year and older with immune thrombocytopenia of at least 6 months, after insufficient response to corticosteroids, immunoglobulins or splenectomy; and to increase survival in adults and children, including term neonates, acutely exposed to myelosuppressive doses of radiation. Not indicated for thrombocytopenia due to myelodysplastic syndrome or any cause other than immune thrombocytopenia',
    patientFriendlyIndication:
      'A weekly injection that tells the bone marrow to make more platelets — and, separately, the drug stockpiled to keep people alive after a radiation accident',
    anatomicalSite: 'Bone marrow — the megakaryocyte and its progenitors',
    conditionContext: {
      conditionExplainer:
        'In immune thrombocytopenia the body makes antibodies against its own platelets and destroys them, while also suppressing the marrow that should be replacing them. Standard treatments suppress the immune system or remove the spleen, where much of the destruction happens. Neither addresses the production side.',
      whyItMatters:
        'Romiplostim is a designed molecule: an antibody stalk with an entirely synthetic peptide bolted on that happens to fit the thrombopoietin receptor. It shares no sequence at all with the natural hormone, which was a deliberate choice after an earlier engineered thrombopoietin caused patients to make antibodies against their own.',
      whoTakesThis:
        'Adults and children with chronic immune thrombocytopenia who have failed earlier lines. It is also held in national stockpiles for use after a radiological or nuclear incident, an indication no human has ever been treated for in a trial.',
      clinicalGoals:
        'Raise the platelet count into a safe range and keep it there, so that other treatments can be reduced and splenectomy avoided. Bleeding and splenectomy rates were measured in one large trial and both improved.',
    },
    oneSentenceVerdict:
      'A synthetic peptide grafted onto an antibody stalk that switches on the platelet receptor without resembling the hormone that normally does, producing durable platelet responses in 38 to 56 percentage points more patients than placebo and cutting splenectomy from 36% to 9% — and separately carrying a licensed claim to increase survival after radiation exposure that rests entirely on eighty irradiated rhesus monkeys, because the human trial can never be done.',
    laymanHowItWorks:
      'The bone marrow decides how many platelets to make based on a hormone signal. Romiplostim is a manufactured protein in two parts: a stalk borrowed from an antibody, which keeps it in the bloodstream for days, and a short peptide that was designed from scratch to fit the hormone’s receptor. It has no resemblance to the real hormone, which is the point — an earlier attempt that did resemble it taught some patients’ immune systems to attack their own hormone. Injected weekly under the skin, it tells the marrow to build more platelet-producing cells.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 68,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$96.80 per 10 micrograms of average Medicare Part B spending in 2024 under HCPCS J2796, against a 2024 average sales price of US$98.57 per 10 micrograms; the average Medicaid claim in 2023 was US$2,473.63',
      markupEstimate:
        'Not calculable. No published per-dose cost of production exists for this fusion protein, so there is no denominator to divide the payment by.',
      openPatentNotes:
        'A biologic with no United States biosimilar as of this audit. It is expressed in Escherichia coli rather than in mammalian cells, which is unusual for an Fc fusion protein and reflects the fact that the receptor-binding portion is a short synthetic peptide requiring no glycosylation.',
      synthesisComplexity: 'High',
      costSource: NO_COST_STUDY_SOURCE,
      priceSource: CMS_PART_B_SOURCE,
    },
    substitutes: {
      summary:
        'Eltrombopag and avatrombopag hit the same receptor from a tablet; romiplostim is the injectable option and the only member of the class with a licensed indication after radiation exposure. Nothing in the class has been shown to change survival in immune thrombocytopenia, and the choice between them is largely about route, food restrictions and liver monitoring.',
      conventionalRx: [
        {
          name: 'Eltrombopag (Promacta)',
          class: 'Oral thrombopoietin receptor agonist',
          howItCompares:
            'Binds the transmembrane domain of the same receptor rather than the extracellular domain, so it does not compete with thrombopoietin. Taken daily by mouth but must be separated from dairy, antacids and mineral supplements, and it carries a boxed warning for hepatotoxicity that romiplostim does not.',
          typicalCost:
            'US$397.68 per tablet of average Medicare Part D spending in 2023, US$97,700.79 per beneficiary for the year.',
          prosAndCons:
            'Pros: no injection, also licensed in severe aplastic anaemia. Cons: daily dosing with awkward food separation, and a boxed warning for liver injury.',
        },
        {
          name: 'Corticosteroids, immunoglobulin, rituximab and splenectomy',
          class: 'Immunosuppression and destruction control',
          howItCompares:
            'The earlier lines, all of which attack platelet destruction. The 234-patient open-label trial against standard of care is the key comparison: treatment failure occurred in 11% on romiplostim against 30% (odds ratio 0.31), and splenectomy in 9% against 36% (odds ratio 0.17).',
          typicalCost:
            'Generic corticosteroids are inexpensive; immunoglobulin, rituximab and splenectomy are not.',
          prosAndCons:
            'Pros: can produce durable remission after treatment stops, which thrombopoietin agonists generally do not. Cons: long-term steroid toxicity, and splenectomy cannot be undone.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'peptide_sequence',
      targetReceptorAffinity:
        'Binds and activates the thrombopoietin receptor by a mechanism the label describes as analogous to endogenous thrombopoietin, while having no amino acid sequence homology to it. Each molecule carries two receptor-binding domains per subunit, so a single molecule can cross-link and dimerise the receptor',
      structureSource: {
        label:
          'Nplate (romiplostim) for injection FDA-approved prescribing information, section 11 Description — Fc-peptide fusion protein (peptibody) produced in Escherichia coli; BLA 125268, label effective 23 June 2026',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22NPLATE%22',
        kind: 'regulatory',
      },
      laboratoryWorkflow: [
        {
          id: 'rom-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Release of the Escherichia coli expression bank',
          description:
            'Confirm construct identity and plasmid stability in the bacterial host. Producing an Fc fusion in E. coli is a deliberate choice available only because the receptor-binding element is a short synthetic peptide with no glycosylation requirement, and the release testing is written around endotoxin and host cell protein accordingly.',
          reagentsAndBuffer:
            'Characterised E. coli master and working cell banks, plasmid restriction mapping and sequencing, limulus amoebocyte lysate endotoxin assay, host cell protein immunoassay',
        },
        {
          id: 'rom-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Bacterial expression and refolding of the peptibody',
          description:
            'Express the fusion and recover it, which for an Fc-containing protein made in bacteria means controlled refolding and correct disulfide pairing rather than simple secretion. The two identical single-chain subunits must assemble, each carrying an IgG1 Fc domain linked at its C-terminus to a peptide bearing two receptor-binding domains.',
          dependsOnStepId: 'rom-w1',
          reagentsAndBuffer:
            'Fed-batch fermentation, inclusion body solubilisation with chaotrope, redox refolding buffer with oxidised and reduced glutathione, controlled dilution refold',
        },
        {
          id: 'rom-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Affinity capture, polishing and lyophilisation',
          description:
            'Capture on Protein A through the Fc, polish away misfolded and aggregated species, and freeze-dry into 125, 250 or 500 microgram single-dose vials. Aggregate control matters twice over here: for infusion safety and because aggregates are the classic driver of the immunogenicity this molecule was designed to avoid.',
          dependsOnStepId: 'rom-w2',
          reagentsAndBuffer:
            'Protein A resin, ion-exchange polishing, size-exclusion HPLC for aggregate quantification, formulation in L-histidine, mannitol, sucrose and polysorbate 20 at pH 5, lyophilisation cycle',
        },
        {
          id: 'rom-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Receptor dimerisation on megakaryocyte progenitors',
          description:
            'Confirm the peptibody engages and dimerises the receptor on cells that express it, and confirm the property the whole design exists for: that antibodies raised against the drug do not cross-react with endogenous thrombopoietin. That cross-reaction is what ended the earlier pegylated thrombopoietin programmes.',
          dependsOnStepId: 'rom-w3',
          reagentsAndBuffer:
            'Thrombopoietin-receptor-expressing cell line, phospho-STAT5 immunoassay, primary human CD34-positive progenitors, anti-drug antibody assay with recombinant human thrombopoietin cross-reactivity panel',
        },
        {
          id: 'rom-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Platelet count response and bone marrow reticulin grading',
          description:
            'Measure the platelet response, and separately grade bone marrow reticulin and collagen on the modified Bauermeister scale. The second measurement is the one this drug specifically needs: driving a marrow lineage hard for years is exactly the kind of thing that can leave fibrous tissue behind.',
          dependsOnStepId: 'rom-w4',
          reagentsAndBuffer:
            'Automated platelet counting, bone marrow trephine biopsy with silver impregnation for reticulin and trichrome for collagen, modified Bauermeister grading scale',
        },
      ],
    },
    keyAudits: [
      {
        id: 'rom-a1',
        category: 'measured',
        title: 'Durable platelet responses where placebo produced almost none',
        laymanSummary:
          'In two parallel trials, 16 of 42 patients who had had their spleen removed achieved a durable platelet response against none of 21 on placebo, and 25 of 41 who had not against one of 21.',
        technicalDetails:
          'Kuter et al. ran two parallel double-blind randomised trials in 63 splenectomised and 62 non-splenectomised patients with immune thrombocytopenia and a mean of three platelet counts at or below 30 × 10⁹/L, randomised 2:1 to weekly subcutaneous romiplostim or placebo for 24 weeks, with doses adjusted to maintain counts between 50 and 200 × 10⁹/L. Durable platelet response — a count of at least 50 × 10⁹/L during six or more of the last eight weeks — was achieved by 16 of 42 splenectomised patients against 0 of 21 (difference 38%, 95% CI 23.4 to 52.8, p=0.0013) and by 25 of 41 non-splenectomised patients against 1 of 21 (difference 56%, 95% CI 38.7 to 73.7, p<0.0001). Overall platelet response was 79% and 88% against 0% and 14%. Concurrent therapy was reduced or stopped by 20 of 23 patients on romiplostim against 6 of 16 on placebo. No antibodies against romiplostim or thrombopoietin were detected.',
        evidenceSource:
          'Kuter DJ, Bussel JB, Lyons RM, et al. Efficacy of romiplostim in patients with chronic immune thrombocytopenic purpura: a double-blind randomised controlled trial. Lancet 2008;371(9610):395-403',
        doi: '10.1016/S0140-6736(08)60203-2',
        measuredMetric:
          'Durable platelet response, defined as a count of at least 50 × 10⁹/L in six or more of the last eight treatment weeks',
        auditFlag: 'verified',
      },
      {
        id: 'rom-a2',
        category: 'measured',
        title: 'It cut splenectomy from more than a third to under one in ten',
        laymanSummary:
          'In a 234-patient open trial against whatever the treating doctor would otherwise have used, 9% of the romiplostim group had their spleen removed against 36% of the standard-care group. Bleeding events and transfusions were also lower.',
        technicalDetails:
          'This open-label 52-week trial randomised 234 non-splenectomised adults with immune thrombocytopenia to standard of care (77) or weekly subcutaneous romiplostim (157), with co-primary endpoints of treatment failure and splenectomy. Platelet response rate was 2.3 times that of standard care (95% CI 2.0 to 2.6, p<0.001). Treatment failure occurred in 18 of 157 (11%) against 23 of 77 (30%), odds ratio 0.31 (95% CI 0.15 to 0.61, p<0.001). Splenectomy was performed in 14 of 157 (9%) against 28 of 77 (36%), odds ratio 0.17 (95% CI 0.08 to 0.35, p<0.001). The romiplostim group had fewer bleeding events, fewer transfusions and greater quality-of-life improvement, and serious adverse events in 23% against 37%. The trial was open-label, and splenectomy is a decision an unblinded clinician makes, which is a real limitation on an otherwise unusually patient-centred endpoint.',
        evidenceSource:
          'Kuter DJ, Rummel M, Boccia R, et al. Romiplostim or standard of care in patients with immune thrombocytopenia. N Engl J Med 2010;363(20):1889-1899',
        doi: '10.1056/NEJMoa1002625',
        measuredMetric: 'Incidence of treatment failure and of splenectomy over 52 weeks',
        auditFlag: 'verified',
      },
      {
        id: 'rom-a3',
        category: 'inferred',
        title: 'The radiation survival claim rests on eighty monkeys',
        laymanSummary:
          'Nplate is licensed to increase survival after radiation exposure. No human has ever been treated in a trial for it. The evidence is forty irradiated rhesus monkeys given the drug and forty given saline.',
        technicalDetails:
          'The label states plainly that efficacy studies could not be conducted in humans with acute radiation syndrome for ethical and feasibility reasons, and that approval was based on animal efficacy studies, the effect on platelet count in healthy human volunteers, and data from immune thrombocytopenia patients. In the pivotal study, rhesus monkeys were randomised to control (n=40) or treatment (n=40) and exposed to 6.8 Gy total body irradiation, a dose lethal to 70% of animals by 60 days. A single subcutaneous dose was given 24 hours after irradiation alongside full supportive medical management. Sixty-day survival was 72.5% (29 of 40) against 32.5% (13 of 40), one-sided p=0.0002. The human dose of 10 micrograms per kilogram is derived from population modelling and simulation aimed at producing a platelet response similar to that seen in the animals, and the paediatric dose including term neonates is extrapolated from immune thrombocytopenia data. This is the Animal Rule working as designed, and it is also the largest inferential leap on any page in this group.',
        evidenceSource:
          'Nplate (romiplostim) prescribing information, section 14.3 Patients with Hematopoietic Syndrome of Acute Radiation Syndrome',
        measuredMetric:
          'Sixty-day survival in rhesus monkeys after 6.8 Gy total body irradiation, 72.5% against 32.5%',
        inferredClaim:
          'That a survival benefit measured in 80 irradiated monkeys, at a dose chosen by modelling rather than by trial, extends to adults, children and term neonates after a radiological incident',
        auditFlag: 'caution',
      },
      {
        id: 'rom-a4',
        category: 'conclusion_shift',
        title: 'A leukaemia signal stopped a trial, and five years later it was gone',
        laymanSummary:
          'A trial in myelodysplastic syndrome was terminated because more patients on romiplostim progressed to acute leukaemia. With five years of follow-up the difference had disappeared — and the exclusion stayed on the label anyway.',
        technicalDetails:
          'A randomised, double-blind, placebo-controlled trial in adults with severe thrombocytopenia and IPSS low or intermediate-1 risk myelodysplastic syndrome randomised 167 to romiplostim and 83 to placebo, and was terminated because of more cases of acute myelogenous leukaemia in the romiplostim arm. During the 58-week study period, progression to acute myelogenous leukaemia occurred in 10 of 167 (6.0%) against 4 of 83 (4.8%), hazard ratio 1.20 (95% CI 0.38 to 3.84). Of 250 patients, 210 entered the five-year follow-up phase: progression occurred in 20 of 168 (11.9%) against 9 of 82 (11.0%), hazard ratio 1.06 (95% CI 0.48 to 2.33), and death in 93 of 167 (55.7%) against 45 of 83 (54.2%), hazard ratio 1.03 (95% CI 0.72 to 1.47). The limitation of use excluding myelodysplastic syndrome remains on the label. Whether that is appropriate caution or a decision the long-term data no longer support is a live question, and the contrast with eltrombopag — where the leukaemia hazard ratio was 2.66 with a confidence interval excluding one — is the reason it matters.',
        evidenceSource:
          'Nplate (romiplostim) prescribing information, section 5.1 Risk of Progression of Myelodysplastic Syndromes to Acute Myelogenous Leukemia, and section 1 Limitations of Use',
        measuredMetric:
          'Progression to acute myelogenous leukaemia and overall survival at 58 weeks and at 5 years in low and intermediate-1 risk myelodysplastic syndrome',
        inferredClaim:
          'That the early leukaemia signal that stopped the trial represented a real drug effect — an interim finding whose hazard ratio moved to 1.06 with full follow-up',
        auditFlag: 'contested',
      },
      {
        id: 'rom-a5',
        category: 'failed',
        title: 'Driving the marrow for years leaves fibre behind in some patients',
        laymanSummary:
          'A study that biopsied the bone marrow of patients on romiplostim for up to three years found reticulin fibre had progressed in 7% of them, and 2% had developed collagen — the more serious kind of scarring.',
        technicalDetails:
          'An open-label trial prospectively evaluated changes in bone marrow reticulin and collagen in adults with immune thrombocytopenia treated weekly for up to three years, with biopsies at year 1, 2 or 3 by cohort against baseline, graded on the modified Bauermeister scale. Of 169 patients enrolled, 132 were evaluable for collagen and 131 for reticulin. Progression of reticulin formation, defined as an increase of two or more grades or an increase to grade 4, was reported in 9 of 131 (7%). Grade 4 findings indicating collagen developed in 2 of 132 (2%), both in the three-year cohort, and one of those had no detectable collagen on repeat testing 12 weeks after stopping the drug. In children, increased reticulin was reported in 18.5% at year 1 and 47.2% at year 2, with a maximum grade of 2 and no collagen fibrosis. Separately, one patient with immune thrombocytopenia and haemolytic anaemia developed marrow fibrosis with collagen during therapy in an earlier trial.',
        evidenceSource:
          'Nplate (romiplostim) prescribing information, section 6.1, Bone Marrow Reticulin Formation and Collagen Fibrosis',
        measuredMetric:
          'Progression of bone marrow reticulin formation and incidence of collagen fibrosis on the modified Bauermeister scale',
        auditFlag: 'caution',
      },
      {
        id: 'rom-a6',
        category: 'inferred',
        title: 'The molecule was designed to look nothing like the hormone it imitates',
        laymanSummary:
          'Earlier engineered versions of thrombopoietin taught some patients’ immune systems to attack their own hormone, leaving them worse off than before. Romiplostim shares no sequence with it at all, which is a design decision made from that failure.',
        technicalDetails:
          'The label states that romiplostim has no amino acid sequence homology to endogenous thrombopoietin, while increasing platelet production through binding and activation of the same receptor by a mechanism it describes as analogous. In the pivotal trials no antibodies against romiplostim or thrombopoietin were detected. The label nonetheless warns that severe thrombocytopenia may persist during treatment because of neutralising antibodies or other causes. Absence of detected antibodies in trials of 125 patients over 24 weeks is a much weaker statement than absence of the risk, and the failure mode being guarded against — a neutralising antibody that cross-reacts with the patient’s own hormone — is one that appears late and in small numbers.',
        evidenceSource:
          'Nplate (romiplostim) prescribing information, sections 11 Description, 12.1 Mechanism of Action and 5.3 Lack of Response or Loss of Response to Nplate',
        inferredClaim:
          'That sequence dissimilarity guarantees no cross-reactive immune response over years of use — a design rationale supported by trial-length data rather than by long-term surveillance',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A weekly injection under the skin',
        laymanDesc:
          'Given once a week as a small subcutaneous injection, reconstituted from a powder. Weekly rather than daily because the antibody stalk keeps it in circulation.',
        molecularDetail:
          'Supplied as 125, 250 or 500 microgram single-dose lyophilised vials reconstituted with sterile water to 500 micrograms per millilitre. The IgG1 Fc domain engages neonatal Fc receptor recycling, which is what converts a short synthetic peptide into a once-weekly drug.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It travels to the bone marrow and stays outside the cell',
        laymanDesc:
          'Its target sits on the outside surface of marrow cells, so the protein never has to get inside anything. It docks from the bloodstream.',
        molecularDetail:
          'Unlike the small-molecule agonists in the same class, the peptibody binds the extracellular domain of c-Mpl. That difference in binding site is why it competes with endogenous thrombopoietin where eltrombopag does not, and why the two classes are pharmacologically additive rather than redundant only in one direction.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'A peptide that resembles nothing in nature fits the hormone’s socket',
        laymanDesc:
          'The business end is a short peptide designed from scratch. It has no similarity to the natural hormone whatsoever, yet it fits the same receptor and switches it on the same way.',
        molecularDetail:
          'Each of the two identical subunits carries an IgG1 Fc domain linked at its C-terminus to a peptide containing two thrombopoietin receptor-binding domains, giving four binding domains per molecule. The label records both facts side by side: no amino acid sequence homology to endogenous thrombopoietin, and activation by a mechanism analogous to it.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The receptor pairs up and the growth signal fires',
        laymanDesc:
          'The receptor only works when two copies are brought together. With four binding sites per molecule, the drug does exactly that, and the cell reads it as an instruction to make platelets.',
        molecularDetail:
          'Receptor dimerisation activates the associated JAK2 and downstream STAT5 signalling, driving proliferation and maturation of megakaryocytic progenitors. Multivalency is the design principle: a monovalent peptide would occupy the receptor without dimerising it, and would be an antagonist rather than an agonist.',
        iconName: 'Network',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The platelet count rises, and other treatments can be reduced',
        laymanDesc:
          'Counts climb into the safe range and stay there with weekly dosing. In the pivotal trials most patients were able to cut back or stop the steroids and other drugs they had been on.',
        molecularDetail:
          'Durable platelet response in 38 and 56 percentage points more patients than placebo across the two pivotal trials, with 20 of 23 romiplostim patients reducing or discontinuing concurrent therapy against 6 of 16 on placebo. Against standard of care over 52 weeks, treatment failure 11% against 30% and splenectomy 9% against 36%.',
        iconName: 'TrendingUp',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Stop it, and the count can fall below where it started',
        laymanDesc:
          'This is a continuous stimulus, not a cure. After stopping, thrombocytopenia can return worse than before treatment, and years of driving the marrow can leave fibre behind.',
        molecularDetail:
          'The label warns that following discontinuation, thrombocytopenia and bleeding risk may develop that are worse than before treatment. Reticulin progression of two or more grades or to grade 4 was reported in 7% of 131 evaluable adults biopsied over up to three years, with collagen in 2% of 132 — one of whom had no detectable collagen 12 weeks after stopping.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'NCT00102336 and NCT00102323 — parallel phase 3 trials in chronic immune thrombocytopenia',
        phase: 'Two parallel double-blind placebo-controlled randomised trials, 24 weeks',
        sampleSize: 125,
        primaryEndpoint:
          'Durable platelet response: a count of at least 50 × 10⁹/L during six or more of the last eight weeks of treatment',
        endpointMet: true,
        statisticalPValue:
          'Splenectomised: 16 of 42 versus 0 of 21, difference 38% (95% CI 23.4 to 52.8), p = 0.0013. Non-splenectomised: 25 of 41 versus 1 of 21, difference 56% (95% CI 38.7 to 73.7), p < 0.0001',
        unreportedAdverseSignals:
          'The endpoint is a platelet count sustained over eight weeks, not a bleeding outcome. Twenty-four weeks of exposure in 125 patients cannot address the marrow fibrosis or immunogenicity questions the molecule raises.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'NCT00415532 — romiplostim versus standard of care in immune thrombocytopenia',
        phase: 'Open-label randomised trial over 52 weeks',
        sampleSize: 234,
        primaryEndpoint: 'Incidence of treatment failure and incidence of splenectomy',
        endpointMet: true,
        statisticalPValue:
          'Treatment failure 11% versus 30%, odds ratio 0.31 (95% CI 0.15 to 0.61), p < 0.001; splenectomy 9% versus 36%, odds ratio 0.17 (95% CI 0.08 to 0.35), p < 0.001',
        unreportedAdverseSignals:
          'Open-label, and splenectomy is a decision made by an unblinded clinician who knows which arm the patient is in. Serious adverse events were nonetheless lower on romiplostim, 23% versus 37%.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'Rhesus macaque total body irradiation study — the sole efficacy evidence for the radiation indication',
        phase:
          'Randomised blinded placebo-controlled non-human primate study under the FDA Animal Rule',
        sampleSize: 80,
        primaryEndpoint: 'Sixty-day survival after 6.8 Gy total body irradiation',
        endpointMet: true,
        statisticalPValue: '72.5% (29 of 40) versus 32.5% (13 of 40), one-sided p = 0.0002',
        unreportedAdverseSignals:
          'No human has been treated for this indication in a trial and none ever will be. The human dose of 10 micrograms per kilogram comes from population modelling and simulation, and the paediatric and neonatal dose is extrapolated from immune thrombocytopenia data.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Randomised trial in low and intermediate-1 risk myelodysplastic syndrome',
        phase:
          'Randomised double-blind placebo-controlled trial, terminated early, with 5-year long-term follow-up',
        sampleSize: 250,
        primaryEndpoint:
          'Platelet response and safety, with progression to acute myelogenous leukaemia and overall survival followed for five years',
        endpointMet: false,
        statisticalPValue:
          'Progression to acute myelogenous leukaemia at 58 weeks 6.0% versus 4.8%, hazard ratio 1.20 (95% CI 0.38 to 3.84); at 5 years 11.9% versus 11.0%, hazard ratio 1.06 (95% CI 0.48 to 2.33); death 55.7% versus 54.2%, hazard ratio 1.03 (95% CI 0.72 to 1.47)',
        unreportedAdverseSignals:
          'Terminated on an interim leukaemia signal that did not persist. The limitation of use excluding myelodysplastic syndrome remains on the label despite five-year hazard ratios centred on one.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Durable platelet response in 16 of 42 splenectomised patients against 0 of 21 on placebo, and 25 of 41 non-splenectomised against 1 of 21',
        'Treatment failure 11% against 30% and splenectomy 9% against 36% over 52 weeks against standard of care',
        'Sixty-day survival of 72.5% against 32.5% in 80 rhesus macaques irradiated at a dose lethal to 70% of untreated animals',
        'Progression of bone marrow reticulin by two or more grades in 7% of 131 adults biopsied over up to three years, with collagen in 2% of 132',
        'Progression to acute myelogenous leukaemia in myelodysplastic syndrome at five years, hazard ratio 1.06 (95% CI 0.48 to 2.33)',
      ],
      unsupportedInferences: [
        'That a survival benefit in 80 irradiated monkeys transfers to adults, children and term neonates exposed to radiation — licensed as a survival claim with no human efficacy data of any kind',
        'That the human dose is correct, when it was chosen by population modelling to reproduce an animal platelet response rather than tested',
        'That sequence dissimilarity from thrombopoietin guarantees no cross-reactive neutralising antibody over years of use',
        'That the myelodysplastic syndrome exclusion still reflects the evidence, when five-year hazard ratios for leukaemia progression and death both sit at approximately one',
      ],
      whatFailedInitially: [
        'The myelodysplastic syndrome trial was terminated early for excess acute myelogenous leukaemia, on a hazard ratio of 1.20 with a confidence interval from 0.38 to 3.84',
        'Bone marrow reticulin progressed in 7% of adults biopsied over up to three years, and in 47.2% of children in the second-year cohort, with a maximum grade of 2 and no collagen',
        'Discontinuation can leave thrombocytopenia worse than before treatment, which the label warns about explicitly',
      ],
      realWorldOutcome: [
        'A standard second-line option in chronic immune thrombocytopenia in adults and children, and the reason many patients now avoid splenectomy',
        'US$96.80 per 10 micrograms of average Medicare Part B spending in 2024, and US$2,473.63 per Medicaid claim in 2023',
        'Held in national medical countermeasure stockpiles for radiological and nuclear incidents on the strength of the primate study',
        'No boxed warning, in contrast to the oral agent in the same class',
      ],
    },
    deliverySystem: {
      type: 'Weekly subcutaneous injection, reconstituted from a lyophilised powder',
      description:
        'Supplied as 125, 250 or 500 microgram single-dose vials reconstituted with sterile water for injection to 500 micrograms per millilitre and given as a small weekly subcutaneous injection, with the dose titrated to platelet count. For acute radiation exposure the label describes a single 10 microgram per kilogram subcutaneous dose. There is no oral route: it is a protein and would not survive the gut.',
      safetyProfile:
        'No boxed warning. The label warns that in some patients with myelodysplastic syndrome the drug increases blast cell counts and the risk of progression to acute myelogenous leukaemia, and excludes that population from the licence. Thrombotic and thromboembolic complications can follow increases in platelet count, and portal vein thrombosis has been reported in chronic liver disease. Severe thrombocytopenia may persist because of neutralising antibodies or other causes. Bone marrow reticulin formation and collagen fibrosis can develop and may improve after stopping. After discontinuation, thrombocytopenia and bleeding risk may be worse than before treatment started. The label states explicitly that the drug should not be used in an attempt to normalise platelet counts.',
    },
    commonQuestions: [
      {
        q: 'How can a drug be licensed to save lives after radiation when nobody has been treated?',
        a: 'Through the FDA’s Animal Rule, which exists for exactly this situation: a condition where a human efficacy trial would be unethical and could not be conducted. The evidence is a blinded randomised study in 80 rhesus macaques irradiated at a dose lethal to 70% of them, in which a single injection given 24 hours later raised 60-day survival from 32.5% to 72.5%. The human dose was then chosen by population modelling to produce a comparable platelet response, and the paediatric and neonatal dose extrapolated from immune thrombocytopenia data. The label states all of this openly. It is the most transparent large inference in this whole group of drugs, and it is still an inference.',
        auditNote:
          'The alternative to the Animal Rule here is no licensed treatment at all, which is why the pathway exists.',
      },
      {
        q: 'Is it better than the tablet version?',
        a: 'Neither has beaten the other on any patient outcome, and no adequately powered head-to-head trial exists. The differences are practical. Romiplostim is a weekly injection with no food restrictions and no boxed warning. Eltrombopag is a daily tablet that must be kept hours away from dairy, antacids and mineral supplements, and it carries a boxed warning for liver injury. They also bind different parts of the same receptor, which means romiplostim competes with the natural hormone and eltrombopag does not. In practice the choice is usually made on route and on liver monitoring.',
      },
      {
        q: 'Does it cause leukaemia?',
        a: 'The honest answer is that a trial was stopped because it looked like it might, and five years of follow-up did not confirm it. In low and intermediate-1 risk myelodysplastic syndrome, progression to acute myelogenous leukaemia at 58 weeks was 6.0% against 4.8% on placebo, a hazard ratio of 1.20 with a confidence interval from 0.38 to 3.84 — which is to say, almost no information. At five years it was 11.9% against 11.0%, hazard ratio 1.06, and deaths were 55.7% against 54.2%. The exclusion of myelodysplastic syndrome remains on the label. For immune thrombocytopenia, which is where the drug is actually used, there is no comparable signal.',
        auditNote:
          'The contrast with eltrombopag matters: there the leukaemia hazard ratio was 2.66 with a confidence interval that excluded one.',
      },
      {
        q: 'What is a peptibody?',
        a: 'A manufactured protein with two borrowed halves. One is the Fc stalk of an antibody, which does nothing pharmacologically but is recycled by cells rather than degraded, so it keeps the molecule in the bloodstream for days instead of minutes. The other is a short peptide selected to fit a target — here, the thrombopoietin receptor. The peptide shares no sequence with the natural hormone, which was deliberate: earlier engineered thrombopoietins provoked antibodies that cross-reacted with patients’ own hormone and left them with worse thrombocytopenia than they started with.',
      },
      {
        q: 'Can it be stopped once the count is normal?',
        a: 'Usually not, and the label warns about what happens when it is. This is a continuous stimulus rather than a treatment of the underlying immune problem, so counts fall when it is withdrawn — and the label states that thrombocytopenia and bleeding risk after discontinuation may be worse than before treatment began. It also says the drug should not be used in an attempt to normalise platelet counts, only to keep them high enough to reduce bleeding risk. Aiming for a normal count means overshooting into thrombosis territory for no additional benefit.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Kuter DJ, Bussel JB, Lyons RM, et al. Efficacy of romiplostim in patients with chronic immune thrombocytopenic purpura: a double-blind randomised controlled trial. Lancet 2008;371(9610):395-403',
        identifier: '10.1016/S0140-6736(08)60203-2',
        kind: 'doi',
      },
      {
        label:
          'Kuter DJ, Rummel M, Boccia R, et al. Romiplostim or standard of care in patients with immune thrombocytopenia. N Engl J Med 2010;363(20):1889-1899',
        identifier: '10.1056/NEJMoa1002625',
        kind: 'doi',
      },
      {
        label:
          'Romiplostim in splenectomised patients with chronic immune thrombocytopenic purpura',
        identifier: 'NCT00102323',
        kind: 'nct',
      },
      {
        label:
          'Romiplostim in non-splenectomised patients with chronic immune thrombocytopenic purpura',
        identifier: 'NCT00102336',
        kind: 'nct',
      },
      {
        label: 'Romiplostim versus standard of care in non-splenectomised immune thrombocytopenia',
        identifier: 'NCT00415532',
        kind: 'nct',
      },
      {
        label:
          'Nplate (romiplostim) for injection — FDA-approved prescribing information: indications and limitations of use, sections 5.1 to 5.3, 6.1, 11, 12.1 and 14.3; BLA 125268, label effective 23 June 2026',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22NPLATE%22',
        kind: 'regulatory',
      },
      {
        label:
          'CMS Medicare Part B Spending by Drug — HCPCS J2796, injection romiplostim per 10 micrograms; average spending per dosage unit US$96.80 in 2024 and 2024 average sales price US$98.57',
        identifier:
          'https://data.cms.gov/summary-statistics-on-use-and-payments/medicare-medicaid-spending-by-drug/medicare-part-b-spending-by-drug',
        kind: 'url',
      },
      {
        label:
          'CMS Medicaid Spending by Drug — Nplate, 24,834 claims and US$61,430,023.72 total spending in 2023, US$2,473.63 average per claim',
        identifier:
          'https://data.cms.gov/summary-statistics-on-use-and-payments/medicaid-drug-spending/medicaid-spending-by-drug',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 13. Emicizumab — the rare case where the surrogate was abandoned and bleeds were counted.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'emicizumab',
    name: 'Emicizumab',
    tradeName: 'Hemlibra',
    sponsor: 'Genentech, Inc, under BLA 761083; developed with Chugai Pharmaceutical and Roche',
    targetGene:
      'F9 and F10 — the genes for factors IX and X, the two proteins the antibody binds simultaneously. It does not act on F8',
    targetProtein:
      'Activated factor IX and factor X, held together by one bispecific antibody so that factor IXa can cleave factor X. It substitutes for the scaffolding job of activated factor VIII without being factor VIII',
    modality: 'Monoclonal Antibody (mAb)',
    approvalStatus: 'FDA Approved',
    approvalYear: 2017,
    indication:
      'Routine prophylaxis to prevent or reduce the frequency of bleeding episodes in adults and children from birth with haemophilia A, with or without factor VIII inhibitors',
    patientFriendlyIndication:
      'A subcutaneous injection, given as rarely as monthly, that stops the joint and muscle bleeds of haemophilia A without replacing the missing clotting factor',
    anatomicalSite:
      'The surface of activated platelets at a site of injury, where the two clotting factors must be brought together',
    conditionContext: {
      conditionExplainer:
        'Haemophilia A is a shortage of factor VIII. Factor VIII is not an enzyme; it is a clamp that holds factor IXa next to factor X so the reaction between them can run fast enough. Without it the cascade still works, just thousands of times too slowly, and bleeding into joints does permanent damage over years.',
      whyItMatters:
        'For decades the only treatment was to replace factor VIII by intravenous infusion several times a week, and in about a quarter of severely affected people the immune system learned to destroy it. Emicizumab does the clamping job with an antibody that shares no sequence with factor VIII at all, so the inhibitor antibodies cannot see it.',
      whoTakesThis:
        'Adults and children from birth with haemophilia A, with or without inhibitors, as continuous prophylaxis. It does not treat a bleed that is already happening — that still needs factor concentrate or a bypassing agent.',
      clinicalGoals:
        'Prevent bleeds. Unusually for this whole group of drugs, the trials counted bleeding episodes rather than a clotting-time surrogate, largely because the drug makes those surrogates unreadable.',
    },
    oneSentenceVerdict:
      'A bispecific antibody with one arm on factor IXa and one on factor X, holding them together in place of the missing factor VIII, which cut treated bleeding by 87% against no prophylaxis in patients with inhibitors and by 68% against a patient’s own previous factor VIII prophylaxis — measured as bleeds rather than laboratory numbers, because the drug makes the laboratory numbers meaningless, and carrying a boxed warning for the clotting catastrophe that follows when it is combined with the bypassing agent it replaced.',
    laymanHowItWorks:
      'Clotting depends on two proteins meeting each other at the right moment. Factor VIII is the clamp that holds them together, and in haemophilia A the clamp is missing. Emicizumab is an antibody built with two different arms: one grabs the first protein, the other grabs the second, and by holding both it does the clamp’s job. It is not factor VIII and looks nothing like it, so the antibodies that destroy factor VIII in some patients simply do not recognise it.',
    auditConfidence: 'High Confidence',
    confidenceScore: 82,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$52.49 per 0.5 mg of average Medicare Part B spending in 2024 under HCPCS J7170, against a 2024 average sales price of US$51.67; the average Medicaid claim in 2023 was US$29,816.71 across 31,366 claims',
      markupEstimate:
        'Not calculable. No published per-dose cost of production exists for this bispecific antibody, so there is no denominator to divide the payment by.',
      openPatentNotes:
        'On patent and single-source. Manufacturing a bispecific IgG4 requires forcing two different heavy chains to pair with each other rather than with themselves, which is a genuinely harder problem than making a conventional antibody, and there is no biosimilar. Total United States Medicaid spending on the product in 2023 was US$935 million across 31,366 claims.',
      synthesisComplexity: 'High',
      costSource: NO_COST_STUDY_SOURCE,
      priceSource: CMS_PART_B_SOURCE,
    },
    substitutes: {
      summary:
        'The alternative is what emicizumab replaced: intravenous factor VIII several times a week for people without inhibitors, or a bypassing agent for those with them. The head-to-head evidence is an intra-individual comparison in patients who switched, where bleeding fell 68% against their own previous factor VIII prophylaxis and 79% against their own previous bypassing-agent prophylaxis.',
      conventionalRx: [
        {
          name: 'Factor VIII concentrate prophylaxis',
          class: 'Recombinant or plasma-derived clotting factor replacement',
          howItCompares:
            'Replaces the missing protein directly, given intravenously two to three times a week or more. In the intra-individual comparison within HAVEN 3, 48 participants who switched had an annualised bleeding rate 68% lower on emicizumab than on their own previous factor VIII prophylaxis (p<0.001).',
          typicalCost:
            'Priced per international unit of factor VIII activity; lifetime cost for severe haemophilia runs to seven figures either way.',
          prosAndCons:
            'Pros: still required to treat an actual bleed and for surgery, and it does not interfere with laboratory tests. Cons: intravenous access several times weekly, and roughly a quarter of severely affected patients develop inhibitors against it.',
        },
        {
          name: 'Bypassing agents — recombinant factor VIIa and activated prothrombin complex concentrate',
          class: 'Haemostatic agents that circumvent the factor VIII step',
          howItCompares:
            'What patients with inhibitors used before 2017. In HAVEN 1, emicizumab reduced bleeding by 79% against a patient’s own previous bypassing-agent prophylaxis. They remain necessary for breakthrough bleeds — and combining activated prothrombin complex concentrate with emicizumab is the subject of the boxed warning.',
          typicalCost:
            'Recombinant factor VIIa runs at US$2.75 per microgram of average Medicare Part B spending in 2024, with the average Medicaid claim at US$75,625.52.',
          prosAndCons:
            'Pros: treat a bleed in progress, which emicizumab cannot. Cons: thrombotic microangiopathy occurred in 8.1% of patients who received at least one dose of activated prothrombin complex concentrate while on emicizumab.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'antibody_structure',
      molecularWeight:
        'Approximately 145.6 kDa. A humanised modified immunoglobulin G4 bispecific antibody binding factor IXa with one arm and factor X with the other, produced in Chinese hamster ovary cells',
      targetReceptorAffinity:
        'Deliberately modest affinity for both targets. Binding too tightly would sequester the factors rather than present them to each other, so the molecule was engineered to hold them transiently and let go — an antibody optimised away from maximum affinity, which is unusual',
      structureSource: {
        label:
          'HEMLIBRA (emicizumab-kxwh) injection FDA-approved prescribing information, section 11 Description and 12.1 Mechanism of Action; BLA 761083, label effective 11 July 2025',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22HEMLIBRA%22',
        kind: 'regulatory',
      },
      laboratoryWorkflow: [
        {
          id: 'emi-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Release of the two heavy chain and common light chain cell lines',
          description:
            'Confirm the identity of both heavy chain constructs and the shared light chain. A bispecific antibody has a failure mode a normal antibody does not: heavy chains pairing with their own kind, producing two monospecific antibodies that do nothing. Identity control here is what makes the rest of the process meaningful.',
          reagentsAndBuffer:
            'Characterised recombinant CHO cell banks, next-generation sequencing of both heavy chain constructs, intact and reduced mass spectrometry for chain pairing, mycoplasma and adventitious agent panels',
        },
        {
          id: 'emi-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Co-expression with engineered heavy chain pairing',
          description:
            'Express both heavy chains and the light chain so that the correct heterodimer dominates. The IgG4 backbone is modified to control Fab arm exchange, which IgG4 does naturally in the bloodstream and which would randomise the specificity of the product after injection.',
          dependsOnStepId: 'emi-w1',
          reagentsAndBuffer:
            'Chemically defined fed-batch CHO culture, controlled dissolved oxygen and pH bioreactor, hinge-stabilised IgG4 construct, glucose and amino acid feeds',
        },
        {
          id: 'emi-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Protein A capture, heterodimer resolution and viral clearance',
          description:
            'Capture on Protein A, then resolve the correctly paired bispecific from the two monospecific by-products by charge, and apply orthogonal viral clearance. The percentage of correctly paired product is the parameter that governs both potency and cost of goods for this molecule.',
          dependsOnStepId: 'emi-w2',
          reagentsAndBuffer:
            'Protein A resin, low-pH viral inactivation, cation-exchange separation of charge variants, small-virus retentive filtration, imaged capillary isoelectric focusing, formulation in L-arginine, L-histidine and poloxamer 188 at pH 6.0',
        },
        {
          id: 'emi-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Bridging factor IXa and factor X on a phospholipid surface',
          description:
            'Confirm the antibody brings both factors together on a membrane and accelerates the reaction, rather than simply binding either one. The negative control matters as much as the positive: an arm that binds too tightly sequesters its target and inhibits the reaction it was meant to catalyse.',
          dependsOnStepId: 'emi-w3',
          reagentsAndBuffer:
            'Purified human factor IXa and factor X, phospholipid vesicles, calcium chloride, chromogenic factor Xa substrate, factor-VIII-deficient plasma with and without inhibitor',
        },
        {
          id: 'emi-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Chromogenic factor VIII activity with bovine reagents',
          description:
            'Quantify activity using a chromogenic assay built on bovine factor IXa and factor X, because the antibody does not recognise the bovine proteins and therefore does not distort the reading. This is not a technical curiosity: it is the only way to measure factor VIII activity in a patient taking this drug.',
          dependsOnStepId: 'emi-w4',
          reagentsAndBuffer:
            'Bovine-based chromogenic factor VIII assay reagents, human-based chromogenic assay as the contrasting control, activated partial thromboplastin time reagent to demonstrate the interference',
        },
      ],
    },
    keyAudits: [
      {
        id: 'emi-a1',
        category: 'measured',
        title: 'Bleeding fell by 87%, and two in three patients had no bleeds at all',
        laymanSummary:
          'In patients with haemophilia A and inhibitors, the annual bleeding rate was 2.9 events on emicizumab against 23.3 on no prophylaxis. Twenty-two of 35 treated patients had zero bleeds; one of 18 untreated did.',
        technicalDetails:
          'HAVEN 1 enrolled 109 male participants aged 12 or older with haemophilia A and factor VIII inhibitors. Those previously on episodic bypassing-agent treatment were randomised 2:1 to once-weekly subcutaneous emicizumab (group A, 35) or no prophylaxis (group B, 18). The annualised bleeding rate was 2.9 events (95% CI 1.7 to 5.0) against 23.3 events (95% CI 12.3 to 43.9), a difference of 87% in favour of emicizumab (p<0.001). Zero bleeding events occurred in 22 of 35 (63%) against 1 of 18 (6%). Among 24 participants in group C who had previously received bypassing-agent prophylaxis and had taken part in a non-interventional study, emicizumab reduced the bleeding rate by 79% against their own prior prophylaxis (p<0.001). The most frequent adverse events were injection-site reactions in 15%. No antidrug antibodies were detected in the primary analysis.',
        evidenceSource:
          'Oldenburg J, Mahlangu JN, Kim B, et al. Emicizumab Prophylaxis in Hemophilia A with Inhibitors. N Engl J Med 2017;377(9):809-818',
        doi: '10.1056/NEJMoa1703068',
        measuredMetric: 'Annualised rate of treated bleeding events',
        auditFlag: 'verified',
      },
      {
        id: 'emi-a2',
        category: 'measured',
        title: 'It beat patients’ own previous factor VIII prophylaxis by 68%',
        laymanSummary:
          'In people without inhibitors, bleeding fell 96 to 97% against no prophylaxis. More striking, in 48 people who switched from their own factor VIII regimen, bleeding fell by a further 68%.',
        technicalDetails:
          'HAVEN 3 randomised 152 participants aged 12 or older, previously on episodic factor VIII, in a 2:2:1 ratio to emicizumab 1.5 mg/kg weekly (group A), 3.0 mg/kg every two weeks (group B), or no prophylaxis (group C). Annualised bleeding rates were 1.5 events (95% CI 0.9 to 2.5) and 1.3 events (95% CI 0.8 to 2.3) against 38.2 events (95% CI 22.9 to 63.8), reductions of 96% and 97% (p<0.001 for both). No treated bleeding occurred in 56% and 60% of the two prophylaxis groups, against 0% of the control group. The intra-individual comparison in 48 participants who had been on factor VIII prophylaxis in a prior non-interventional study found an annualised bleeding rate 68% lower on emicizumab (p<0.001). There were no thrombotic or thrombotic microangiopathy events, no antidrug antibodies and no new factor VIII inhibitors in this trial.',
        evidenceSource:
          'Mahlangu J, Oldenburg J, Paz-Priel I, et al. Emicizumab Prophylaxis in Patients Who Have Hemophilia A without Inhibitors. N Engl J Med 2018;379(9):811-822',
        doi: '10.1056/NEJMoa1803550',
        measuredMetric:
          'Annualised rate of treated bleeding events, including an intra-individual comparison against prior factor VIII prophylaxis',
        auditFlag: 'verified',
      },
      {
        id: 'emi-a3',
        category: 'failed',
        title: 'Combined with the drug it replaced, it destroys small blood vessels',
        laymanSummary:
          'Patients who had a breakthrough bleed and were given activated prothrombin complex concentrate on top of emicizumab developed thrombotic microangiopathy — clots in the smallest vessels, destroying red cells and damaging the kidneys. Three of 37 such patients, against three in the whole 391-patient programme.',
        technicalDetails:
          'The HEMLIBRA boxed warning states that thrombotic microangiopathy and thrombotic events were reported when on average a cumulative amount of more than 100 U/kg per 24 hours of activated prothrombin complex concentrate was given for 24 hours or more to patients on emicizumab prophylaxis. In clinical trials thrombotic microangiopathy occurred in 0.8% of patients overall (3 of 391) and in 8.1% (3 of 37) of those who received at least one dose of activated prothrombin complex concentrate. Patients presented with thrombocytopenia, microangiopathic haemolytic anaemia and acute kidney injury without severe ADAMTS13 deficiency, and improved within a week of stopping the concentrate; one resumed emicizumab after resolution. The mechanism is additive: the antibody is already substituting for factor VIII, and the concentrate supplies activated factors on top of it. The drug’s long half-life means the interaction persists for weeks after the last dose.',
        evidenceSource:
          'HEMLIBRA (emicizumab-kxwh) prescribing information, boxed warning and section 5.1 Thrombotic Microangiopathy Associated with HEMLIBRA and aPCC',
        measuredMetric:
          'Incidence of thrombotic microangiopathy in patients receiving activated prothrombin complex concentrate while on emicizumab prophylaxis',
        auditFlag: 'caution',
      },
      {
        id: 'emi-a4',
        category: 'measured',
        title: 'It makes the standard clotting tests read wrong, permanently',
        laymanSummary:
          'Emicizumab interferes with the activated partial thromboplastin time and every test built on it — including the test used to detect factor VIII inhibitors and to measure factor VIII activity. Those tests cannot be used at all in a patient taking it.',
        technicalDetails:
          'The label states that the drug interferes with the activated clotting time, the activated partial thromboplastin time, and coagulation tests based on aPTT including one-stage single-factor assays, aPTT-based activated protein C resistance and clotting-based Bethesda assays for factor VIII inhibitor titre, and directs that intrinsic pathway clotting-based laboratory tests should not be used. This is a direct consequence of the mechanism: the antibody restores the clotting reaction the aPTT measures, so it normalises or shortens the aPTT regardless of how much factor VIII is present. Monitoring is possible only with a chromogenic assay using bovine reagents, which the antibody does not recognise. The audit point here is unusual: the drug did not have a surrogate endpoint problem because it removed the possibility of using surrogates at all, and the trials were therefore forced to count bleeds.',
        evidenceSource:
          'HEMLIBRA (emicizumab-kxwh) prescribing information, section 5.4 Laboratory Coagulation Test Interference and section 7.2',
        measuredMetric:
          'Interference with activated clotting time, activated partial thromboplastin time and all aPTT-derived assays',
        auditFlag: 'verified',
      },
      {
        id: 'emi-a5',
        category: 'inferred',
        title: 'Fewer bleeds is not the same as fewer damaged joints',
        laymanSummary:
          'The trials counted bleeding episodes over about a year. The reason bleeds matter in haemophilia is the joint destruction that accumulates over decades, and that takes decades to measure.',
        technicalDetails:
          'HAVEN 1 and HAVEN 3 measured annualised bleeding rate as the primary endpoint over trial periods of roughly six months to a year. Annualised bleeding rate is a real clinical outcome and a far better one than a clotting time, which is why this page grades the drug more favourably than most in this file. It is nonetheless an intermediate: the endpoint that governs a person’s life with haemophilia A is arthropathy, and joint health in patients started on emicizumab from infancy will not be known for twenty years. The intra-individual comparison against prior factor VIII prophylaxis is the strongest evidence available that the difference is likely to matter, and it is a within-patient comparison in 48 people, not a randomised one.',
        evidenceSource:
          'Oldenburg J, et al. N Engl J Med 2017;377(9):809-818; Mahlangu J, et al. N Engl J Med 2018;379(9):811-822 — trial designs and primary endpoint definitions',
        doi: '10.1056/NEJMoa1803550',
        inferredClaim:
          'That an 87% reduction in bleeding episodes over a year translates into preserved joints over a lifetime — highly plausible, mechanistically expected, and not yet measured',
        auditFlag: 'verified',
      },
      {
        id: 'emi-a6',
        category: 'inferred',
        title: 'It prevents bleeds and cannot treat one',
        laymanSummary:
          'Emicizumab is prophylaxis only. When a bleed happens anyway, it still needs factor concentrate or a bypassing agent — which is precisely the situation the boxed warning is about.',
        technicalDetails:
          'The indication is confined to routine prophylaxis to prevent or reduce the frequency of bleeding episodes. The antibody provides a low, constant level of factor-VIII-like activity, which is enough to prevent spontaneous bleeding but not to secure haemostasis in trauma or surgery. So the population most exposed to the boxed warning is defined by the drug’s own limitation: a patient with inhibitors, on emicizumab, who has a breakthrough bleed and therefore needs a bypassing agent. The label directs that if activated prothrombin complex concentrate must be used, it be discontinued and emicizumab suspended if symptoms of thrombotic microangiopathy appear, and notes that the antibody’s long half-life means the interaction persists well beyond the last dose.',
        evidenceSource:
          'HEMLIBRA (emicizumab-kxwh) prescribing information, section 1 Indications and Usage and section 5.1',
        inferredClaim:
          'That prophylaxis alone is sufficient management — it is not, and the necessary supplementary treatment is the one that carries the boxed warning',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'An injection under the skin, as rarely as once a month',
        laymanDesc:
          'Given subcutaneously, weekly, fortnightly or monthly depending on the schedule chosen. For a family used to finding a vein in a small child several times a week, that is the headline change.',
        molecularDetail:
          'Supplied as single-dose vials at 12 mg/0.4 mL, 30 mg/mL, 60 mg/0.4 mL, 105 mg/0.7 mL, 150 mg/mL and 300 mg/2 mL. Subcutaneous administration is possible because the molecule is a stable IgG4 with antibody pharmacokinetics, unlike factor VIII, which has a half-life measured in hours and must be given intravenously.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It circulates for weeks and works in the plasma',
        laymanDesc:
          'The antibody stays in the bloodstream for a long time, which is why dosing can be so infrequent. It never enters a cell; the whole reaction it enables happens on surfaces in the blood.',
        molecularDetail:
          'A 145.6 kDa IgG4 with neonatal Fc receptor recycling gives a half-life of several weeks. The consequence appears twice on this page: it permits monthly dosing, and it means the interaction with activated prothrombin complex concentrate persists for weeks after the last injection.',
        iconName: 'Droplet',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'One arm grabs factor IXa, the other grabs factor X',
        laymanDesc:
          'Ordinary antibodies have two identical arms. This one was built with two different arms, each recognising a different clotting protein, so a single molecule can hold both at once.',
        molecularDetail:
          'A humanised modified IgG4 bispecific antibody binding factor IXa and factor X. The label notes it has no structural relationship or sequence homology to factor VIII and therefore does not induce or enhance the development of direct inhibitors to factor VIII — which is the entire reason it works in the inhibitor population.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Held together, the two proteins can finally react',
        laymanDesc:
          'Factor IXa can cut factor X, but only if something holds them in position. That is all factor VIII ever did. The antibody does the same job by geometry rather than by chemistry.',
        molecularDetail:
          'The label describes it as bridging activated factor IX and factor X to restore the function of missing activated factor VIII. Affinity for both arms is deliberately modest: an antibody that bound either factor tightly would sequester it, and the molecule had to be engineered away from maximum affinity to work as a catalyst rather than an inhibitor.',
        iconName: 'Network',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Factor Xa appears, thrombin follows, and bleeds stop happening',
        laymanDesc:
          'The cascade runs at something approaching normal speed. Spontaneous bleeds into joints and muscles largely stop: nearly two in three patients with inhibitors had none at all over the trial.',
        molecularDetail:
          'Annualised bleeding rate 2.9 against 23.3 in the inhibitor population, an 87% reduction, with 63% having zero bleeds against 6%. In the non-inhibitor population 1.5 and 1.3 against 38.2, reductions of 96% and 97%, with 56% and 60% having no treated bleeds against 0%.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And the clotting tests stop telling the truth',
        laymanDesc:
          'Because the drug restores the very reaction the standard clotting test measures, that test now reads normal no matter what. Every assay built on it, including the one that detects inhibitors, becomes unusable.',
        molecularDetail:
          'The label directs that intrinsic pathway clotting-based laboratory tests should not be used, listing activated clotting time, aPTT, one-stage aPTT-based single-factor assays, aPTT-based activated protein C resistance and clotting-based Bethesda assays. Monitoring requires a chromogenic factor VIII assay using bovine reagents, which the antibody does not bind.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'HAVEN 1 (NCT02622321) — emicizumab prophylaxis in haemophilia A with inhibitors',
        phase:
          'Phase 3 multicentre randomised open-label trial with an intra-individual comparison cohort',
        sampleSize: 109,
        primaryEndpoint:
          'Difference in treated bleeding rate between emicizumab prophylaxis and no prophylaxis',
        endpointMet: true,
        statisticalPValue:
          'Annualised bleeding rate 2.9 (95% CI 1.7 to 5.0) versus 23.3 (95% CI 12.3 to 43.9), an 87% reduction, p < 0.001',
        unreportedAdverseSignals:
          'Thrombotic microangiopathy and thrombosis in 2 participants each, all of whom had received multiple infusions of activated prothrombin complex concentrate for breakthrough bleeding. The control arm was no prophylaxis, which was the standard of care in this population but is a low bar.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'HAVEN 3 (NCT02847637) — emicizumab prophylaxis in haemophilia A without inhibitors',
        phase:
          'Phase 3 multicentre randomised trial, 2:2:1, with an intra-individual comparison cohort',
        sampleSize: 152,
        primaryEndpoint:
          'Difference in treated bleeding rate between each emicizumab schedule and no prophylaxis',
        endpointMet: true,
        statisticalPValue:
          '1.5 events (95% CI 0.9 to 2.5) weekly and 1.3 events (95% CI 0.8 to 2.3) fortnightly versus 38.2 events (95% CI 22.9 to 63.8), reductions of 96% and 97%, p < 0.001 for both',
        unreportedAdverseSignals:
          'No thrombotic or thrombotic microangiopathy events, no antidrug antibodies and no new factor VIII inhibitors in this trial. The comparison against no prophylaxis in a population for whom factor VIII prophylaxis already existed is a weaker control than the intra-individual analysis.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'HAVEN 3 intra-individual comparison against prior factor VIII prophylaxis',
        phase: 'Within-patient comparison in participants from a prior non-interventional study',
        sampleSize: 48,
        primaryEndpoint:
          'Annualised bleeding rate on emicizumab against the same patient’s previous factor VIII prophylaxis',
        endpointMet: true,
        statisticalPValue: '68% lower annualised bleeding rate on emicizumab, p < 0.001',
        unreportedAdverseSignals:
          'Not randomised. Each patient is their own control, which removes between-patient variation but not the effect of time, of changing adherence, or of the difference between a non-interventional observation period and a trial.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId:
          'Pooled clinical trial safety experience for thrombotic microangiopathy with concomitant activated prothrombin complex concentrate',
        phase: 'Pooled safety analysis across the emicizumab clinical programme',
        sampleSize: 391,
        primaryEndpoint:
          'Incidence of thrombotic microangiopathy and thrombotic events with concomitant activated prothrombin complex concentrate',
        endpointMet: false,
        statisticalPValue:
          'Thrombotic microangiopathy in 3 of 391 patients (0.8%) overall and 3 of 37 (8.1%) of those receiving at least one dose of activated prothrombin complex concentrate',
        unreportedAdverseSignals:
          'The denominator that matters is 37, not 391. Presentations were thrombocytopenia, microangiopathic haemolytic anaemia and acute kidney injury without severe ADAMTS13 deficiency, improving within a week of stopping the concentrate.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Annualised bleeding rate of 2.9 against 23.3 events with no prophylaxis in haemophilia A with inhibitors, an 87% reduction (p<0.001)',
        'Zero treated bleeds in 63% of the treated arm against 6% of the untreated arm in the same trial',
        'Annualised bleeding rates of 1.5 and 1.3 against 38.2 without inhibitors, reductions of 96% and 97%',
        'A 68% lower bleeding rate on emicizumab than on the same 48 patients’ own previous factor VIII prophylaxis',
        'Thrombotic microangiopathy in 8.1% of patients who received at least one dose of activated prothrombin complex concentrate while on emicizumab',
      ],
      unsupportedInferences: [
        'That an 87% reduction in bleeding over a year translates into preserved joint function over decades — the outcome that actually defines life with haemophilia and one that no trial has yet run long enough to measure',
        'That the intra-individual comparison against prior factor VIII prophylaxis is equivalent to a randomised head-to-head; it is a within-patient before-and-after in 48 people',
        'That the absence of detected antidrug antibodies in the pivotal trials establishes long-term immunogenicity safety; the label warns that neutralising antibodies have since developed in treated patients',
      ],
      whatFailedInitially: [
        'Thrombotic microangiopathy and thrombosis appeared in the pivotal trial in patients given activated prothrombin complex concentrate for breakthrough bleeding, producing the boxed warning',
        'The drug abolishes the usability of every aPTT-based coagulation test, including the assay used to detect factor VIII inhibitors, so patients on it cannot be monitored by conventional means',
        'Anti-emicizumab antibodies including neutralising antibodies have developed in treated patients despite none being detected in the pivotal trials',
      ],
      realWorldOutcome: [
        'Standard prophylaxis for haemophilia A with inhibitors and, increasingly, without, in most high-income health systems within five years of approval',
        'US$52.49 per 0.5 mg of average Medicare Part B spending in 2024, with United States Medicaid spending of US$935 million across 31,366 claims in 2023',
        'Has largely displaced routine bypassing-agent prophylaxis, and with it much of the demand for recombinant factor VIIa',
        'Carries a boxed warning for thrombotic microangiopathy and thromboembolism with concomitant activated prothrombin complex concentrate',
      ],
    },
    deliverySystem: {
      type: 'Subcutaneous injection, weekly, fortnightly or every four weeks',
      description:
        'A ready-to-use solution in single-dose vials at several strengths, injected under the skin of the abdomen, upper arm or thigh, and self-administered or given by a carer. The schedule is chosen by the patient and clinician; all three maintenance regimens were evaluated in the trial programme. No intravenous access is needed, which for infants and small children is the practical difference between the treatment being feasible and not.',
      safetyProfile:
        'Carries a boxed warning for thrombotic microangiopathy and thromboembolism when a cumulative average of more than 100 U/kg per 24 hours of activated prothrombin complex concentrate is given for 24 hours or more to a patient on emicizumab; the label directs that the concentrate be stopped and emicizumab suspended if symptoms occur. Thrombotic microangiopathy occurred in 8.1% of trial patients who received at least one dose of the concentrate. Anti-emicizumab antibodies including neutralising antibodies have developed in treated patients, and loss of efficacy should prompt investigation. The drug interferes with the activated clotting time, the aPTT and every assay derived from it, including clotting-based Bethesda assays for factor VIII inhibitor titre; those tests must not be used. The commonest adverse event in trials was a low-grade injection-site reaction.',
    },
    commonQuestions: [
      {
        q: 'Does it replace factor VIII?',
        a: 'It replaces what factor VIII does, not factor VIII itself. Factor VIII is a scaffold that holds two other clotting proteins in position so they can react; emicizumab is an antibody with two different arms that grips those same two proteins and holds them together. Because it shares no sequence with factor VIII, the inhibitor antibodies that destroy factor VIII in about a quarter of severely affected patients cannot recognise it. The label states outright that it has no structural relationship or sequence homology to factor VIII and does not induce or enhance factor VIII inhibitors.',
      },
      {
        q: 'Why can it not be used to treat a bleed?',
        a: 'Because it provides a modest, constant level of factor-VIII-like activity rather than the surge that stopping an active bleed requires. It is licensed for routine prophylaxis only. When a breakthrough bleed happens, or surgery is needed, factor concentrate or a bypassing agent is still required — and that is exactly the situation the boxed warning covers, because combining it with activated prothrombin complex concentrate caused thrombotic microangiopathy in three of the 37 trial patients who received that combination.',
        auditNote:
          'The drug’s half-life of several weeks means the interaction persists long after the last injection.',
      },
      {
        q: 'Why can the usual blood tests not be used?',
        a: 'Because the drug restores the exact reaction that the activated partial thromboplastin time is designed to measure. The aPTT therefore reads normal or short in a patient whose factor VIII is still absent, and every assay built on it inherits the error — including one-stage factor assays and the clotting-based Bethesda assay used to detect inhibitors. The label instructs that intrinsic pathway clotting-based tests should not be used at all. Measurement is possible only with a chromogenic assay using bovine factor IXa and factor X, which the antibody does not bind.',
        auditNote:
          'This is why the pivotal trials counted bleeding episodes: the drug made the usual surrogate endpoints unusable, which turned out to be a methodological gift.',
      },
      {
        q: 'Is it better than factor VIII prophylaxis?',
        a: 'On bleeding rate, in the people who switched, yes. Forty-eight patients who had been on their own factor VIII prophylaxis in a previous observational study had a 68% lower annualised bleeding rate on emicizumab. That is a within-patient comparison rather than a randomised head-to-head, so it carries the usual caveats about time and adherence. There has never been a randomised trial of emicizumab against factor VIII prophylaxis, and the control arm in both pivotal trials was no prophylaxis at all.',
      },
      {
        q: 'Will it protect people’s joints?',
        a: 'Almost certainly, and it has not been measured. Bleeding into joints is what destroys them, and this drug reduces bleeding by a very large amount, so the mechanistic expectation is strong. But joint damage accumulates over decades and the trials ran for months to a year, with annualised bleeding rate as the endpoint. Children started on emicizumab in infancy will not have adult joint outcomes on record until the 2040s. This page grades the drug highly because bleeding episodes are a real clinical outcome rather than a laboratory number — but they are still one step short of the thing that matters.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: false,
    sources: [
      {
        label:
          'Oldenburg J, Mahlangu JN, Kim B, et al. Emicizumab Prophylaxis in Hemophilia A with Inhibitors. N Engl J Med 2017;377(9):809-818',
        identifier: '10.1056/NEJMoa1703068',
        kind: 'doi',
      },
      {
        label:
          'Mahlangu J, Oldenburg J, Paz-Priel I, et al. Emicizumab Prophylaxis in Patients Who Have Hemophilia A without Inhibitors. N Engl J Med 2018;379(9):811-822',
        identifier: '10.1056/NEJMoa1803550',
        kind: 'doi',
      },
      {
        label: 'HAVEN 1 — emicizumab prophylaxis in haemophilia A with inhibitors',
        identifier: 'NCT02622321',
        kind: 'nct',
      },
      {
        label: 'HAVEN 3 — emicizumab prophylaxis in haemophilia A without inhibitors',
        identifier: 'NCT02847637',
        kind: 'nct',
      },
      {
        label:
          'HEMLIBRA (emicizumab-kxwh) injection — FDA-approved prescribing information: boxed warning, indications, sections 5.1, 5.3, 5.4, 7.2, 11 and 12.1; BLA 761083, label effective 11 July 2025',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22HEMLIBRA%22',
        kind: 'regulatory',
      },
      {
        label:
          'CMS Medicare Part B Spending by Drug — HCPCS J7170, injection emicizumab-kxwh per 0.5 mg; average spending per dosage unit US$52.49 in 2024 and 2024 average sales price US$51.67',
        identifier:
          'https://data.cms.gov/summary-statistics-on-use-and-payments/medicare-medicaid-spending-by-drug/medicare-part-b-spending-by-drug',
        kind: 'url',
      },
      {
        label:
          'CMS Medicaid Spending by Drug — Hemlibra, 31,366 claims and US$935,230,965.23 total spending in 2023, US$29,816.71 average per claim',
        identifier:
          'https://data.cms.gov/summary-statistics-on-use-and-payments/medicaid-drug-spending/medicaid-spending-by-drug',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 14. Caplacizumab — a primary endpoint won by four and a half hours, and a course costing
  //     two hundred thousand dollars.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'caplacizumab-yhdp',
    name: 'Caplacizumab',
    tradeName: 'Cablivi',
    sponsor:
      'Genzyme Corporation, a Sanofi company, under BLA 761112; originated at Ablynx NV as a Nanobody',
    targetGene: 'VWF — the gene for von Willebrand factor',
    targetProtein:
      'The A1 domain of von Willebrand factor, the site through which the multimer grips the platelet glycoprotein Ib receptor',
    modality: 'Monoclonal Antibody (mAb)',
    approvalStatus: 'FDA Approved',
    approvalYear: 2019,
    indication:
      'Treatment of adults and children aged 12 years and older with acquired thrombotic thrombocytopenic purpura, in combination with plasma exchange and immunosuppressive therapy',
    patientFriendlyIndication:
      'Stopping the microscopic clots of acquired TTP by cutting the tether that platelets are being dragged onto',
    anatomicalSite:
      'The lumen of small blood vessels, on the ultralarge von Willebrand factor strings anchored to damaged endothelium',
    conditionContext: {
      conditionExplainer:
        'Von Willebrand factor circulates as long strings that are normally trimmed to a safe length by an enzyme called ADAMTS13. In acquired thrombotic thrombocytopenic purpura the immune system destroys that enzyme, the strings stay ultralarge, and platelets are dragged onto them all over the body. Platelets vanish from the blood, red cells are shredded as they squeeze past the microclots, and organs starve.',
      whyItMatters:
        'Untreated, acquired TTP kills the great majority of people who get it. Plasma exchange, which removes the antibodies and supplies fresh enzyme, brought mortality down to around 10 to 20% and has been the backbone of treatment since the 1990s. Caplacizumab does not address the enzyme or the antibody at all; it blocks the sticking itself, buying time while the immunosuppression works.',
      whoTakesThis:
        'Adults and adolescents in hospital with an acute episode of acquired TTP, given alongside plasma exchange and immunosuppression, and continued for a period after exchange stops.',
      clinicalGoals:
        'Get the platelet count back to normal and prevent the disease flaring again while the underlying autoimmunity is treated. Survival has never been an endpoint any trial was sized for.',
    },
    oneSentenceVerdict:
      'A two-domain antibody fragment that clamps the A1 domain of von Willebrand factor so platelets cannot be dragged onto it, which won its pivotal trial’s primary endpoint by a median of four and a half hours — 2.69 days to platelet normalisation against 2.88 — while cutting a composite of death, recurrence and thrombosis from 49% to 12%, raising mucocutaneous bleeding from 48% to 65%, and leaving relapse to follow within weeks in patients whose underlying enzyme deficiency had not yet been corrected.',
    laymanHowItWorks:
      'In this disease, long sticky strings of a protein called von Willebrand factor stay uncut in the bloodstream, and platelets are pulled onto them and consumed until almost none are left. Caplacizumab is a very small antibody fragment with two identical grippers joined by a short linker. It clamps onto the exact patch of the string that platelets stick to, so the platelets simply flow past. It does not repair the missing enzyme or remove the antibodies causing the problem; it holds the line while other treatments do that.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 64,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$200,436.99 in average Medicaid spending per claim in 2023, at US$7,921.55 per dosage unit, across 109 claims nationally',
      markupEstimate:
        'Not calculable. No published per-dose cost of production exists for this antibody fragment, so there is no denominator to divide the payment by.',
      openPatentNotes:
        'On patent and single-source. The molecule is a 28 kDa fragment expressed in Escherichia coli — technically among the simpler biologics to manufacture, since it needs no glycosylation, no Fc and no mammalian cell culture — and it is among the most expensive drugs per course in haematology. Those two facts sit side by side and this page does not attempt to reconcile them.',
      synthesisComplexity: 'Moderate',
      costSource: NO_COST_STUDY_SOURCE,
      priceSource: CMS_MEDICAID_SOURCE,
    },
    substitutes: {
      summary:
        'Plasma exchange and immunosuppression are not substitutes but the foundation; caplacizumab is licensed only in combination with them. The genuine alternative approach is recombinant ADAMTS13, which replaces the missing enzyme rather than blocking the consequence of its absence, and which is licensed for the congenital form of the disease.',
      conventionalRx: [
        {
          name: 'Therapeutic plasma exchange with corticosteroids and rituximab',
          class: 'Antibody removal, enzyme replacement and immunosuppression',
          howItCompares:
            'The backbone of treatment and the comparator arm in both trials — caplacizumab was added to it, never tested against it. Plasma exchange removes the autoantibody and supplies functional ADAMTS13; immunosuppression stops the antibody being remade. Caplacizumab reduced the number of plasma exchange days and shortened hospitalisation.',
          typicalCost:
            'The cost of daily apheresis sessions, plasma units and generic immunosuppression, which is far below the drug.',
          prosAndCons:
            'Pros: addresses the cause, and is what actually resolves the episode. Cons: requires a large-bore central line, takes days to work, and platelets keep being consumed in the meantime.',
        },
        {
          name: 'Recombinant ADAMTS13',
          class: 'Enzyme replacement',
          howItCompares:
            'Supplies the protease the patient is missing, which is a mechanistically upstream fix rather than a block on the downstream consequence. It is licensed for congenital thrombotic thrombocytopenic purpura, where there is no autoantibody to destroy it, and its role in the acquired form is still being established.',
          typicalCost:
            'A recombinant enzyme priced per unit of activity; there is no CMS spending figure for this indication in the datasets cited on this page.',
          prosAndCons:
            'Pros: replaces what is actually missing. Cons: in acquired disease the same autoantibody that destroyed the native enzyme will attack the recombinant one.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'antibody_structure',
      molecularWeight:
        'Approximately 28 kDa. Two identical humanised single-variable-domain building blocks joined by a three-alanine linker, produced in Escherichia coli — roughly a fifth the mass of a conventional antibody and small enough to be cleared renally',
      targetReceptorAffinity:
        'Binds the A1 domain of von Willebrand factor, the site through which the multimer engages platelet glycoprotein Ib, and inhibits that interaction. Bivalency matters: two binding domains on one small molecule occupy the adhesive site with far greater avidity than a single domain would',
      structureSource: {
        label:
          'CABLIVI (caplacizumab-yhdp) for injection FDA-approved prescribing information, section 11 Description and 12.1 Mechanism of Action; BLA 761112, label effective 24 April 2026',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22CABLIVI%22',
        kind: 'regulatory',
      },
      laboratoryWorkflow: [
        {
          id: 'cap-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Release of the Escherichia coli expression bank',
          description:
            'Confirm construct identity and plasmid stability for the bivalent single-domain construct. Expressing an antibody-derived molecule in bacteria is only possible because a single variable domain folds without glycosylation and without a partner chain, and the release specification is written around endotoxin and host cell protein rather than around glycan profile.',
          reagentsAndBuffer:
            'Characterised E. coli master and working cell banks, plasmid sequencing across the three-alanine linker, limulus amoebocyte lysate endotoxin assay, host cell protein immunoassay',
        },
        {
          id: 'cap-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Bacterial expression of the bivalent single-domain fragment',
          description:
            'Express the two identical building blocks as one continuous chain joined by the alanine linker. Because there is no light chain to pair with and no Fc to assemble, the folding problem is far simpler than for a conventional antibody — which is what makes bacterial production viable at all.',
          dependsOnStepId: 'cap-w1',
          reagentsAndBuffer:
            'Fed-batch fermentation, periplasmic or inclusion body recovery depending on construct, redox refolding buffer, controlled induction',
        },
        {
          id: 'cap-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Chromatographic purification and lyophilisation to 11 mg vials',
          description:
            'Purify and freeze-dry into single-dose vials delivering 11 mg, reconstituted to 11 mg/mL at pH 6.5. Aggregate and truncated-species control are the release-critical parameters, as for any protein given repeatedly by subcutaneous injection.',
          dependsOnStepId: 'cap-w2',
          reagentsAndBuffer:
            'Ion-exchange and hydrophobic-interaction chromatography, size-exclusion HPLC for aggregates, formulation in anhydrous citric acid, trisodium citrate dihydrate, sucrose and polysorbate 80, lyophilisation cycle',
        },
        {
          id: 'cap-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Blockade of platelet adhesion to von Willebrand factor under shear',
          description:
            'Confirm the fragment prevents platelets binding von Willebrand factor under flow, not merely in a static binding assay. Shear is essential: the A1 domain only becomes accessible when the multimer is stretched by flowing blood, which is why this disease happens in small vessels and why a static assay would miss the effect entirely.',
          dependsOnStepId: 'cap-w3',
          reagentsAndBuffer:
            'Parallel-plate or microfluidic flow chamber at arterial shear rates, immobilised human von Willebrand factor, washed human platelets, ristocetin cofactor assay, recombinant A1 domain for binding confirmation',
        },
        {
          id: 'cap-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Ristocetin cofactor activity and ADAMTS13 activity in parallel',
          description:
            'Measure suppression of von Willebrand factor activity, which tracks the drug, alongside ADAMTS13 activity, which tracks the disease. Reporting them together is the whole clinical argument: the first can be fully suppressed while the second remains below 10%, and that combination is exactly the patient who relapses when the drug is stopped.',
          dependsOnStepId: 'cap-w4',
          reagentsAndBuffer:
            'Von Willebrand factor ristocetin cofactor activity assay, FRETS-VWF73 or equivalent ADAMTS13 activity assay, anti-ADAMTS13 inhibitor titre, automated platelet counting',
        },
      ],
    },
    keyAudits: [
      {
        id: 'cap-a1',
        category: 'inferred',
        title: 'The primary endpoint was won by about four and a half hours',
        laymanSummary:
          'The trial’s main measurement was how long it took the platelet count to come back to normal. On caplacizumab it took 2.69 days; on placebo, 2.88. That difference is statistically significant and about four and a half hours long.',
        technicalDetails:
          'HERCULES randomised 145 patients with acquired thrombotic thrombocytopenic purpura to caplacizumab or placebo during plasma exchange and for 30 days afterwards. The primary outcome was time to normalisation of the platelet count with discontinuation of daily plasma exchange within five days thereafter. Median time to normalisation was 2.69 days (95% CI 1.89 to 2.83) against 2.88 days (95% CI 2.68 to 3.56), p=0.01, with patients on caplacizumab 1.55 times as likely to normalise. A median difference of 0.19 days is roughly four and a half hours. Whether that endpoint should ever have been the primary one is the central editorial question about this trial: the case for the drug rests almost entirely on secondary outcomes, which is the reverse of how a pivotal trial is meant to read.',
        evidenceSource:
          'Scully M, Cataland SR, Peyvandi F, et al. Caplacizumab Treatment for Acquired Thrombotic Thrombocytopenic Purpura. N Engl J Med 2019;380(4):335-346',
        doi: '10.1056/NEJMoa1806311',
        measuredMetric:
          'Median time to normalisation of the platelet count, with discontinuation of daily plasma exchange within 5 days thereafter',
        inferredClaim:
          'That a four-and-a-half-hour median difference in platelet recovery is what justifies the drug — it is the licensed primary endpoint, and it is not the reason anyone prescribes it',
        auditFlag: 'caution',
      },
      {
        id: 'cap-a2',
        category: 'measured',
        title: 'The composite of death, recurrence and thrombosis fell from 49% to 12%',
        laymanSummary:
          'The secondary outcome that actually matters combined TTP-related death, the disease coming back, and clots. It happened to 49% of the placebo group and 12% of the caplacizumab group.',
        technicalDetails:
          'The key secondary composite of TTP-related death, recurrence of TTP or a thromboembolic event during the treatment period occurred in 12% of the caplacizumab group against 49% of the placebo group, a 74% relative reduction (p<0.001). Recurrence at any point during the trial was 12% against 38%, a 67% reduction (p<0.001). Refractory disease developed in no caplacizumab patients and three placebo patients. Patients on caplacizumab required fewer plasma exchange procedures and had shorter hospital stays. The composite is heavily weighted by recurrence, which is the most frequent of its three components, so most of the apparent effect on a composite that includes death is in fact an effect on relapse.',
        evidenceSource:
          'Scully M, Cataland SR, Peyvandi F, et al. Caplacizumab Treatment for Acquired Thrombotic Thrombocytopenic Purpura. N Engl J Med 2019;380(4):335-346',
        doi: '10.1056/NEJMoa1806311',
        measuredMetric:
          'Composite of TTP-related death, recurrence of TTP or thromboembolic event during the treatment period',
        auditFlag: 'verified',
      },
      {
        id: 'cap-a3',
        category: 'inferred',
        title: 'Four deaths in the whole trial is not a mortality result',
        laymanSummary:
          'Three placebo patients died during treatment and one caplacizumab patient died afterwards, of a stroke. That is the entire mortality dataset. No trial of this drug has been sized to detect a survival difference.',
        technicalDetails:
          'HERCULES reports three deaths in the placebo group during the trial treatment period and one death in the caplacizumab group, from cerebral ischaemia after the end of the treatment period. The phase 2 TITAN trial, with 75 patients, reports two deaths in the placebo group and none on caplacizumab. Across both randomised trials the total is six deaths in 220 patients. Acquired thrombotic thrombocytopenic purpura at modern standards of care has a mortality of roughly 10 to 20%, and detecting a halving of that with any confidence would require several hundred patients per arm in a disease with an incidence of a few cases per million per year. The absence of a mortality trial is a structural feature of a rare disease, not an oversight — but it means the survival claim frequently attached to this drug is not something either trial measured.',
        evidenceSource:
          'Scully M, et al. N Engl J Med 2019;380(4):335-346; Peyvandi F, Scully M, Kremer Hovinga JA, et al. Caplacizumab for Acquired Thrombotic Thrombocytopenic Purpura. N Engl J Med 2016;374(6):511-522',
        doi: '10.1056/NEJMoa1505533',
        measuredMetric:
          'All deaths reported across the two randomised trials, 220 patients in total',
        inferredClaim:
          'That the reduction in a composite containing death represents a survival benefit — the composite moved, and the death component within it comprises four events',
        auditFlag: 'caution',
      },
      {
        id: 'cap-a4',
        category: 'failed',
        title: 'Stop it before the autoimmunity is treated and the disease comes straight back',
        laymanSummary:
          'In the phase 2 trial, eight patients relapsed within a month of stopping the drug, and seven of those still had almost no ADAMTS13 activity. The drug had been holding the disease down without touching its cause.',
        technicalDetails:
          'In TITAN, 75 patients were randomised to subcutaneous caplacizumab or placebo during plasma exchange and for 30 days afterwards. Time to response was 39% shorter on caplacizumab (p=0.005) and exacerbations occurred in 3 patients against 11. Eight patients in the caplacizumab group relapsed in the first month after stopping the study drug, of whom seven had ADAMTS13 activity that remained below 10% — which the investigators identify as unresolved autoimmune activity. This is the defining limitation of the mechanism: blocking platelet adhesion suppresses every manifestation of the disease while the autoantibody against ADAMTS13 persists untouched, so the drug both masks the disease and defers it. Practice has adapted by monitoring ADAMTS13 recovery before stopping, which is a change in how the drug is used derived directly from this finding.',
        evidenceSource:
          'Peyvandi F, Scully M, Kremer Hovinga JA, et al. Caplacizumab for Acquired Thrombotic Thrombocytopenic Purpura. N Engl J Med 2016;374(6):511-522',
        doi: '10.1056/NEJMoa1505533',
        measuredMetric:
          'Relapses in the first month after stopping study drug, and ADAMTS13 activity in those patients',
        auditFlag: 'caution',
      },
      {
        id: 'cap-a5',
        category: 'failed',
        title: 'It makes people bleed, and after approval some of that bleeding was fatal',
        laymanSummary:
          'Bleeding from the nose, gums and gut was reported in 65% of patients on caplacizumab against 48% on placebo. Since approval, life-threatening and fatal bleeding has been reported.',
        technicalDetails:
          'The most common adverse event in HERCULES was mucocutaneous bleeding, in 65% of the caplacizumab group against 48% on placebo; in TITAN, bleeding-related adverse events occurred in 54% against 38%. The label reports bleeding events in approximately 58% against 43%, with severe reactions of epistaxis, gingival bleeding, upper gastrointestinal haemorrhage and metrorrhagia each in 1% of subjects, and states that in the postmarketing setting cases of life-threatening and fatal bleeding have been reported. Risk is increased by underlying coagulopathy and by concomitant antiplatelet agents, thrombolytics, heparin or anticoagulants, all of which the label directs be avoided. The drug is to be withheld seven days before elective surgery or dental procedures, and von Willebrand factor concentrate can be given to correct haemostasis rapidly — which is the closest thing this drug has to an antidote.',
        evidenceSource:
          'CABLIVI (caplacizumab-yhdp) prescribing information, section 5.1 Hemorrhage; Scully M, et al. N Engl J Med 2019;380(4):335-346',
        doi: '10.1056/NEJMoa1806311',
        measuredMetric:
          'Incidence of bleeding adverse events on caplacizumab against placebo, and postmarketing reports of fatal bleeding',
        auditFlag: 'caution',
      },
      {
        id: 'cap-a6',
        category: 'inferred',
        title: 'Two hundred thousand dollars a course, for a 28 kDa bacterial protein',
        laymanSummary:
          'The average Medicaid claim for caplacizumab in 2023 was just over US$200,000. The molecule is a small antibody fragment grown in ordinary bacteria, which is among the least demanding ways to make a biologic.',
        technicalDetails:
          'CMS Medicaid data for 2023 record 109 claims and US$21,847,632.73 of spending on Cablivi, an average of US$200,436.99 per claim at US$7,921.55 per dosage unit. The product is a 28 kDa fragment of two identical humanised single variable domains joined by a three-alanine linker, produced in Escherichia coli — requiring no glycosylation, no Fc assembly, no mammalian cell culture and no chain pairing. Nothing in the manufacturing description explains the price, and no published cost-of-production study covers it, which is why `synthesisCostPerDose` on this page is empty rather than estimated. The price reflects the rarity of the disease and the absence of an alternative, not the difficulty of making the molecule, and this page states that plainly rather than implying a cost basis it cannot document.',
        evidenceSource:
          'CMS Medicaid Spending by Drug, 2023 reporting year — Cablivi; CABLIVI prescribing information section 11 Description',
        measuredMetric:
          'Average Medicaid spending per claim and per dosage unit in 2023, against the labelled manufacturing description',
        inferredClaim:
          'That a price of this magnitude reflects a cost of production — a connection this page cannot make, because no cost-of-production analysis covers the molecule',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A loading dose into a vein, then a daily injection under the skin',
        laymanDesc:
          'The first dose goes into a vein so it works immediately; after that it is a small daily injection under the skin, continued for a period after plasma exchange finishes.',
        molecularDetail:
          'In the pivotal trial the regimen was a 10 mg intravenous loading bolus followed by 10 mg daily subcutaneously during plasma exchange and for 30 days afterwards. Supplied as a lyophilised powder in single-dose vials delivering 11 mg, reconstituted with 1 mL of sterile water to 11 mg/mL at pH 6.5.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'A fragment small enough to leave through the kidneys',
        laymanDesc:
          'At about a fifth the size of an ordinary antibody, it moves quickly into the bloodstream from under the skin and is cleared quickly too — which is why it has to be given every day.',
        molecularDetail:
          'Approximately 28 kDa, below the renal filtration threshold that keeps full antibodies in circulation for weeks. It has no Fc domain and so no neonatal Fc receptor recycling, which is what makes daily dosing necessary and also what makes the effect wear off quickly once stopped.',
        iconName: 'Droplet',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It clamps the exact patch platelets stick to',
        laymanDesc:
          'Von Willebrand factor grips platelets through one specific region. The drug has two identical grippers that cover that region, so the platelet has nothing to hold onto.',
        molecularDetail:
          'The label states that caplacizumab targets the A1 domain of von Willebrand factor and inhibits the interaction between the factor and platelets, reducing both adhesion and consumption. The A1 domain engages platelet glycoprotein Ib. Bivalency through the three-alanine linker gives avidity that a single domain would not achieve.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Platelets stop being dragged out of circulation',
        laymanDesc:
          'The uncut strings are still there, still stretched across small vessels — but nothing sticks to them. Platelets that were being consumed by the thousand simply flow past.',
        molecularDetail:
          'The A1 domain is only exposed when the multimer is stretched by shear, which is why the disease manifests in the microvasculature and why blockade of this one domain is enough to stop the whole process. The uncleaved ultralarge multimers persist, and so does the ADAMTS13 deficiency that produced them.',
        iconName: 'ShieldOff',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The platelet count recovers — a few hours sooner than without it',
        laymanDesc:
          'Counts come back to normal in about 2.7 days rather than about 2.9. The bigger differences are in what happens next: fewer relapses, fewer plasma exchange sessions, shorter hospital stay.',
        molecularDetail:
          'Median time to platelet normalisation 2.69 days (95% CI 1.89 to 2.83) against 2.88 days (95% CI 2.68 to 3.56), p=0.01. The composite of TTP-related death, recurrence or thromboembolic event during treatment 12% against 49% (p<0.001), and recurrence at any point 12% against 38% (p<0.001), with no refractory disease on caplacizumab against three cases on placebo.',
        iconName: 'TrendingUp',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Stop too early and the disease is still there, waiting',
        laymanDesc:
          'Because the drug never touches the missing enzyme or the antibody destroying it, withdrawing it before the immune problem is fixed simply uncovers the disease again.',
        molecularDetail:
          'In TITAN, eight caplacizumab patients relapsed within a month of stopping, seven of them with ADAMTS13 activity still below 10%, which the investigators attribute to unresolved autoimmune activity. Practice now monitors ADAMTS13 recovery before withdrawal — a treatment rule derived from a trial finding rather than from the label.',
        iconName: 'Repeat',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'HERCULES (NCT02553317) — caplacizumab in acquired thrombotic thrombocytopenic purpura',
        phase: 'Phase 3 double-blind randomised placebo-controlled trial',
        sampleSize: 145,
        primaryEndpoint:
          'Time to normalisation of the platelet count, with discontinuation of daily plasma exchange within 5 days thereafter',
        endpointMet: true,
        statisticalPValue:
          'Median 2.69 days (95% CI 1.89 to 2.83) versus 2.88 days (95% CI 2.68 to 3.56), p = 0.01; rate ratio 1.55 for platelet normalisation',
        unreportedAdverseSignals:
          'The primary endpoint difference is a median of about four and a half hours. Mucocutaneous bleeding occurred in 65% versus 48%. Three placebo patients died during the treatment period and one caplacizumab patient died of cerebral ischaemia afterwards — four deaths in total, far too few to say anything about survival.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'HERCULES key secondary composite endpoint',
        phase: 'Prespecified key secondary analysis within the phase 3 trial',
        sampleSize: 145,
        primaryEndpoint:
          'Composite of TTP-related death, recurrence of TTP, or a thromboembolic event during the treatment period',
        endpointMet: true,
        statisticalPValue: '12% versus 49%, a 74% relative reduction, p < 0.001',
        unreportedAdverseSignals:
          'The composite is dominated by recurrence, its most frequent component; recurrence alone was 12% versus 38%. Reading the composite as a mortality effect is not supported by the four deaths that occurred.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'TITAN (NCT01151423) — phase 2 caplacizumab in acquired TTP',
        phase: 'Phase 2 randomised controlled study',
        sampleSize: 75,
        primaryEndpoint:
          'Time to response, defined as confirmed normalisation of the platelet count',
        endpointMet: true,
        statisticalPValue: '39% reduction in median time to response, p = 0.005',
        unreportedAdverseSignals:
          'Eight caplacizumab patients relapsed in the first month after stopping the drug, seven with ADAMTS13 activity still below 10%. Bleeding-related adverse events occurred in 54% versus 38%. Two placebo patients died and none on caplacizumab.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Median time to platelet normalisation 2.69 days against 2.88 days (p=0.01) — a difference of roughly four and a half hours',
        'Composite of TTP-related death, recurrence or thromboembolic event during treatment in 12% against 49% (p<0.001)',
        'Recurrence of TTP at any point during the trial in 12% against 38% (p<0.001), with no refractory disease against three cases',
        'Mucocutaneous bleeding in 65% against 48%, and bleeding-related adverse events in 54% against 38% in the phase 2 trial',
        'Eight relapses within a month of stopping the drug in the phase 2 trial, seven of them with ADAMTS13 activity still below 10%',
      ],
      unsupportedInferences: [
        'That the drug reduces mortality — four deaths occurred across 145 randomised patients in the pivotal trial and six across both trials, which cannot support any survival claim',
        'That a composite endpoint containing death demonstrates an effect on death; the composite moved because recurrence moved',
        'That the licensed primary endpoint, a four-and-a-half-hour median gain in platelet recovery, is the clinical reason to use the drug',
        'That the price reflects a cost of production, for a 28 kDa non-glycosylated fragment expressed in bacteria',
      ],
      whatFailedInitially: [
        'Relapse followed withdrawal in eight phase 2 patients within a month, seven with unresolved ADAMTS13 deficiency — the drug suppresses the disease without treating it',
        'Bleeding was substantially more common on treatment in both trials, and life-threatening and fatal bleeding has been reported since approval',
        'The primary endpoint of the pivotal trial was met by a margin most clinicians would not be able to observe at the bedside',
      ],
      realWorldOutcome: [
        'Adopted into acquired TTP guidelines within a few years of approval, alongside plasma exchange and immunosuppression rather than in place of either',
        'US$200,436.99 in average Medicaid spending per claim in 2023 across 109 national claims, one of the highest per-course figures in haematology',
        'Practice has settled on monitoring ADAMTS13 recovery before withdrawal, a rule derived from the phase 2 relapse data rather than from the label',
        'Von Willebrand factor concentrate is used to reverse the effect when bleeding is serious, which is the nearest thing the drug has to an antidote',
      ],
    },
    deliverySystem: {
      type: 'Intravenous loading dose followed by daily subcutaneous injection',
      description:
        'A lyophilised powder in single-dose vials delivering 11 mg, reconstituted with 1 mL of sterile water. The first dose is given intravenously for immediate effect and subsequent doses subcutaneously once daily, continuing through plasma exchange and for a period afterwards. The daily schedule is a direct consequence of the molecule’s size: at 28 kDa it is cleared renally rather than recycled like a full antibody.',
      safetyProfile:
        'No boxed warning, but bleeding is the defining risk. Bleeding events occurred in approximately 58% of treated patients against 43% on placebo, with severe epistaxis, gingival bleeding, upper gastrointestinal haemorrhage and metrorrhagia each reported in 1%. In the postmarketing setting, life-threatening and fatal bleeding has been reported. Risk is increased by underlying coagulopathy and by concomitant antiplatelet agents, thrombolytics, heparin or anticoagulants, which the label directs be avoided. Treatment should be interrupted for clinically significant bleeding and withheld for seven days before elective surgery, dental work or other invasive procedures. Von Willebrand factor concentrate may be given to correct haemostasis rapidly.',
    },
    commonQuestions: [
      {
        q: 'Does it treat the disease?',
        a: 'No, and the distinction matters clinically. Acquired thrombotic thrombocytopenic purpura is caused by an antibody that destroys the enzyme ADAMTS13. Caplacizumab does nothing to that antibody and does not replace the enzyme; it blocks the downstream consequence by covering the patch of von Willebrand factor that platelets stick to. That is why the phase 2 trial saw eight relapses within a month of stopping, seven of them in patients whose ADAMTS13 activity was still below 10%. The drug buys time; plasma exchange and immunosuppression are what resolve the episode.',
        auditNote:
          'Clinical practice now checks ADAMTS13 recovery before withdrawing the drug — a rule that comes from the trial data rather than from the label.',
      },
      {
        q: 'Does it save lives?',
        a: 'Nobody knows, and no trial has been able to ask. Across both randomised trials — 220 patients in total — there were six deaths: three on placebo during the treatment period in the phase 3 trial, one on caplacizumab afterwards from a stroke, and two on placebo in the phase 2 trial. That is not a mortality dataset. The frequently quoted 74% reduction refers to a composite of death, recurrence and thromboembolism, and it moved because recurrence moved. In a disease affecting a few people per million per year, a properly powered survival trial may simply never be possible.',
        auditNote:
          'This is the most common misreading of HERCULES, and it comes from reading a composite endpoint as though it were its rarest component.',
      },
      {
        q: 'The primary endpoint was met. Why does this page call that weak?',
        a: 'Because of the size of the difference rather than its statistical significance. Median time to platelet normalisation was 2.69 days on the drug and 2.88 days on placebo — about four and a half hours apart, with a p-value of 0.01. A result can be real, reproducible and clinically invisible all at once. The reasons clinicians actually use this drug are in the secondary outcomes: recurrence falling from 38% to 12%, no refractory disease, fewer plasma exchange sessions, shorter hospital stays. That is an unusual structure for a pivotal trial, and worth knowing about before quoting the headline result.',
      },
      {
        q: 'Why does it make people bleed?',
        a: 'Because the interaction it blocks is the one that normally starts a clot. Von Willebrand factor grabbing platelets through its A1 domain is the first step of haemostasis wherever a vessel is damaged, not just where the disease is causing microthrombi. Blocking it stops the pathological platelet consumption and also stops the physiological plugging of small injuries — hence nosebleeds, gum bleeding and gastrointestinal haemorrhage in the majority of treated patients. If serious bleeding occurs, giving von Willebrand factor concentrate can overwhelm the block and restore haemostasis quickly.',
      },
      {
        q: 'Why is it so expensive?',
        a: 'This page cannot tell you, and says so rather than guessing. The average Medicaid claim in 2023 was just over US$200,000. The molecule is a 28 kDa fragment made of two identical single antibody domains joined by three alanines, expressed in ordinary Escherichia coli, requiring no glycosylation, no Fc assembly and no mammalian cell culture — which is among the least demanding biologic manufacturing routes there is. No published cost-of-production analysis covers it, so the cost field on this page is empty. What can be said is that the price is consistent with a rare disease and no alternative, and not with the difficulty of making the protein.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Scully M, Cataland SR, Peyvandi F, et al. Caplacizumab Treatment for Acquired Thrombotic Thrombocytopenic Purpura. N Engl J Med 2019;380(4):335-346',
        identifier: '10.1056/NEJMoa1806311',
        kind: 'doi',
      },
      {
        label:
          'Peyvandi F, Scully M, Kremer Hovinga JA, et al. Caplacizumab for Acquired Thrombotic Thrombocytopenic Purpura. N Engl J Med 2016;374(6):511-522',
        identifier: '10.1056/NEJMoa1505533',
        kind: 'doi',
      },
      {
        label: 'HERCULES — caplacizumab in acquired thrombotic thrombocytopenic purpura',
        identifier: 'NCT02553317',
        kind: 'nct',
      },
      {
        label: 'TITAN — phase 2 caplacizumab in acquired thrombotic thrombocytopenic purpura',
        identifier: 'NCT01151423',
        kind: 'nct',
      },
      {
        label:
          'CABLIVI (caplacizumab-yhdp) for injection — FDA-approved prescribing information: indications, section 5.1 Hemorrhage, section 11 Description and section 12.1 Mechanism of Action; BLA 761112, label effective 24 April 2026',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22CABLIVI%22',
        kind: 'regulatory',
      },
      {
        label:
          'CMS Medicaid Spending by Drug — Cablivi, 109 claims and US$21,847,632.73 total spending in 2023, US$200,436.99 average per claim and US$7,921.55 per dosage unit',
        identifier:
          'https://data.cms.gov/summary-statistics-on-use-and-payments/medicaid-drug-spending/medicaid-spending-by-drug',
        kind: 'url',
      },
    ],
  },
]
