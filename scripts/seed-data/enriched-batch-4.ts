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
      structureType: 'peptide_sequence',
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
          dependsOnStepId: 'ddavp-w3',
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
        iconName: 'Magnet',
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
]
