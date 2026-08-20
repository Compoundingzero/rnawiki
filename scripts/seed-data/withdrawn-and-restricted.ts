import type { SeedDossier } from '@/lib/seed-types'

/**
 * Curated flagship dossiers — drugs that were approved, prescribed at scale, and then withdrawn,
 * restricted, or brought back on different terms.
 *
 * This is the group the rest of a drug reference is measured against. Every substance here was once
 * the standard of care, which means every page is a record of a conclusion changing while millions
 * of people were already taking the drug. Five conventions apply to the whole file.
 *
 * 1. THE STATUS FIELD DESCRIBES TODAY, THE AUDITS CARRY THE HISTORY. `approvalStatus` is
 *    'Withdrawn from Market' only for drugs that are still off the market. Fenfluramine, thalidomide,
 *    tegaserod and natalizumab are marketed right now, under different indications or different
 *    controls, and it would be false to record them as withdrawn. Their withdrawal is a
 *    `conclusion_shift` audit point, which is where it belongs.
 *
 * 2. NO PRICING BLOCK, ANYWHERE. `SeedPricing` requires a per-dose synthesis cost with a citable
 *    source, and for a drug that no longer has a market there is no defensible number to give. Where
 *    a current price matters to the story — Makena's, Aduhelm's — it is stated inside the narrative
 *    with the source that published it, because a list price is a published fact and a manufacturing
 *    cost would be a guess.
 *
 * 3. THE SMILES STRINGS ARE PUBCHEM CANONICAL SMILES, PASTED, NOT RETYPED. Each was pulled from the
 *    PubChem PUG REST `SMILES` property and then run through this repository's own deterministic
 *    sweep; the formula the engine derives from the string matches the formula PubChem prints for
 *    that CID in every case. The three antibodies here carry an `antibody_structure` schema with the
 *    isotype and mass from the label, because an IgG has no SMILES.
 *
 * 4. WITHDRAWAL DATES AND APPLICATION NUMBERS COME FROM DRUGS@FDA. Every NDA and BLA number below
 *    was resolved against the openFDA `drug/drugsfda` endpoint at the time of writing, and the
 *    marketing status the endpoint reports is recorded as it stands. Where a drug predates that
 *    dataset — terfenadine, astemizole, efalizumab — the citation is the Federal Register notice or
 *    the FDA safety communication instead.
 *
 * 5. THE FAILURE IS STATED AS A MEASUREMENT, NOT A WARNING. Rofecoxib's thrombotic excess,
 *    cerivastatin's rhabdomyolysis, troglitazone's liver failure and DES's clear-cell adenocarcinoma
 *    are recorded the same way an efficacy result is recorded: the trial or the cohort, the number,
 *    the confidence interval, the citation. A page that moralises instead of counting is less useful,
 *    not more careful.
 */

export const WITHDRAWN_AND_RESTRICTED_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // 1. Rofecoxib — the defining case
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'rofecoxib',
    name: 'Rofecoxib',
    tradeName: 'Vioxx',
    sponsor: 'Merck & Co (NDA 021042)',
    targetGene: 'PTGS2',
    targetProtein: 'Prostaglandin G/H synthase 2 (cyclooxygenase-2, COX-2)',
    modality: 'Small Molecule',
    approvalStatus: 'Withdrawn from Market',
    approvalYear: 1999,
    indication:
      'Osteoarthritis, acute pain in adults, primary dysmenorrhoea, and from 2002 rheumatoid arthritis. Voluntarily withdrawn worldwide on 30 September 2004.',
    patientFriendlyIndication:
      'Arthritis and pain relief, from a painkiller designed to spare the stomach',
    anatomicalSite: 'Vascular endothelium and inflamed synovium; COX-2 in endothelial cells',
    conditionContext: {
      conditionExplainer:
        'Ordinary anti-inflammatory painkillers block two enzymes at once. COX-1 protects the stomach lining and helps platelets clot. COX-2 makes the prostaglandins of inflammation and pain. Blocking both relieves pain and also causes ulcers and bleeding.',
      whyItMatters:
        'The coxibs were designed to block only COX-2 and leave COX-1 alone, so the stomach would be spared. That worked. What it also did was leave platelet thromboxane untouched while suppressing endothelial prostacyclin, which is the mechanism that explains what happened next.',
      whoTakesThis:
        'Nobody now. Between 1999 and 2004 it was taken by an estimated 80 million people worldwide, mostly for osteoarthritis, and disproportionately by exactly the older population most exposed to cardiovascular risk.',
      clinicalGoals:
        'The stated goal was equal analgesia with fewer gastrointestinal complications. The trial that proved the gastrointestinal benefit also produced the cardiovascular signal, in the same table.',
    },
    oneSentenceVerdict:
      'A COX-2 selective anti-inflammatory that did exactly what it was designed to do to the stomach, showed a five-fold myocardial infarction excess in its own pivotal safety trial in 2000, and stayed on the market for four more years while that finding was attributed to the comparator drug.',
    laymanHowItWorks:
      'Blood vessel walls make a substance that keeps platelets from sticking together. Platelets themselves make a substance that makes them stick. Ordinary painkillers suppress both. Rofecoxib suppressed only the one the vessel wall makes, because that one comes from COX-2 and the platelet one comes from COX-1. The result was a slight tilt of the blood towards clotting, in a drug taken daily for years by people whose arteries were already narrowed.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 94,
    substitutes: {
      summary:
        'Celecoxib is the surviving coxib and was compared head to head with ibuprofen and naproxen in PRECISION, a 24,081-patient non-inferiority trial. Naproxen has the least cardiovascular signal of the traditional anti-inflammatories. Paracetamol has no gastrointestinal or cardiovascular signal and a much smaller analgesic effect in osteoarthritis.',
      conventionalRx: [
        {
          name: 'Celecoxib',
          class: 'COX-2 selective NSAID',
          howItCompares:
            'The only coxib still marketed in the United States. In PRECISION, at moderate doses, it was non-inferior to ibuprofen and naproxen for the composite cardiovascular endpoint, with fewer gastrointestinal events.',
          typicalCost: 'Generic, available at low cost; not priced here',
          prosAndCons:
            'Pros: the only member of the class with a large prospective cardiovascular safety trial behind it. Cons: PRECISION dosed celecoxib at the low end of its range while dosing the comparators fully, which its critics say flattered it.',
        },
        {
          name: 'Naproxen',
          class: 'Non-selective NSAID',
          howItCompares:
            'The comparator in VIGOR. Blocks COX-1 nearly completely for most of the dosing interval, which is why it was proposed as cardioprotective. Observational data put that protective effect at about 14%, far too small to explain the VIGOR result.',
          typicalCost: 'Generic and over the counter; not priced here',
          prosAndCons:
            'Pros: the smallest cardiovascular signal among traditional NSAIDs. Cons: the full COX-1 gastrointestinal risk that rofecoxib was designed to avoid.',
        },
        {
          name: 'Paracetamol (acetaminophen)',
          class: 'Non-NSAID analgesic',
          howItCompares:
            'No meaningful COX-1 or COX-2 inhibition at therapeutic doses in peripheral tissue, so neither the ulcer risk nor the thrombotic risk. Its effect size in osteoarthritis is small.',
          typicalCost: 'Generic and over the counter; not priced here',
          prosAndCons:
            'Pros: no gastrointestinal or thrombotic signal. Cons: hepatotoxic in overdose, and repeatedly found close to placebo for osteoarthritis pain.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CS(=O)(=O)C1=CC=C(C=C1)C2=C(C(=O)OC2)C3=CC=CC=C3',
      chemicalFormula: 'C17H14O4S',
      molecularWeight: '314.4 g/mol',
      targetReceptorAffinity:
        'Selective inhibition of COX-2 over COX-1. The methylsulfonyl group occupies the side pocket that COX-2 has and COX-1 does not, which is the structural basis of the selectivity and, indirectly, of the prostacyclin-thromboxane imbalance.',
      structureSource: {
        label: 'PubChem CID 5090 (rofecoxib) — canonical SMILES, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5090',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'rof-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity confirmation against a certified reference standard',
          description:
            'Confirm the furanone core and the para-methylsulfonylphenyl substitution by mass spectrometry and proton NMR against a certified reference standard. Rofecoxib is still supplied as an analytical reference material for forensic and pharmacovigilance work even though the medicine is gone.',
          reagentsAndBuffer:
            'Rofecoxib certified reference standard, deuterated DMSO for NMR, LC-MS with electrospray ionisation in positive mode, expected protonated molecular ion at m/z 315',
        },
        {
          id: 'rof-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Purity and related-substance assay by reversed-phase HPLC',
          description:
            'Quantify rofecoxib and resolve its known degradation products, principally the ring-opened hydroxy acid formed under alkaline conditions. Area-normalised purity is read at 254 nm.',
          dependsOnStepId: 'rof-w1',
          reagentsAndBuffer:
            'C18 column, acetonitrile and 0.1% formic acid in water gradient, UV detection at 254 nm, system suitability against the reference standard',
        },
        {
          id: 'rof-w3',
          stepNumber: 3,
          phase: 'Assay_Quantification',
          name: 'COX-1 and COX-2 whole-blood selectivity assay',
          description:
            'Measure serum thromboxane B2 generation during whole-blood clotting as the COX-1 readout, and lipopolysaccharide-stimulated prostaglandin E2 in the same donor blood as the COX-2 readout. The ratio of the two IC50 values is the selectivity number, and it is the assay that made this drug class.',
          dependsOnStepId: 'rof-w2',
          reagentsAndBuffer:
            'Fresh heparinised and native human whole blood, lipopolysaccharide from E. coli, aspirin to block platelet COX-1 in the stimulated arm, thromboxane B2 and prostaglandin E2 enzyme immunoassay kits',
        },
        {
          id: 'rof-w4',
          stepNumber: 4,
          phase: 'Assay_Quantification',
          name: 'Urinary prostacyclin and thromboxane metabolite quantification',
          description:
            'Quantify 2,3-dinor-6-keto-prostaglandin F1-alpha and 11-dehydro-thromboxane B2 in urine by mass spectrometry. This is the human measurement that showed rofecoxib suppresses systemic prostacyclin production while leaving thromboxane intact — the imbalance that the outcome trials later scored in events.',
          dependsOnStepId: 'rof-w3',
          reagentsAndBuffer:
            'Deuterated internal standards for both metabolites, solid-phase extraction, LC-MS/MS in negative-ion multiple reaction monitoring mode, results normalised to urinary creatinine',
        },
      ],
    },
    keyAudits: [
      {
        id: 'rof-a1',
        category: 'measured',
        title: 'VIGOR: the gastrointestinal benefit was real and it was large',
        laymanSummary:
          'In 8,076 rheumatoid arthritis patients, serious stomach and bowel complications happened at half the rate on rofecoxib that they did on naproxen. The drug did the job it was designed for.',
        technicalDetails:
          'Randomised, double-blind, 8,076 patients aged 50 or older (or 40 or older on long-term glucocorticoids) with rheumatoid arthritis, assigned to rofecoxib 50 mg daily or naproxen 500 mg twice daily. Over a median 9.0 months, confirmed upper gastrointestinal events occurred at 2.1 per 100 patient-years on rofecoxib against 4.5 on naproxen (RR 0.5, 95% CI 0.3 to 0.6, p<0.001). Complicated events — perforation, obstruction, severe bleeding — were 0.6 against 1.4 per 100 patient-years (RR 0.4, 95% CI 0.2 to 0.8, p=0.005). Rheumatoid arthritis efficacy was similar in both arms.',
        evidenceSource: 'Bombardier C et al., N Engl J Med 2000;343:1520-1528 (VIGOR)',
        doi: '10.1056/NEJM200011233432103',
        measuredMetric:
          'Confirmed upper gastrointestinal events per 100 patient-years, rofecoxib versus naproxen',
        auditFlag: 'verified',
      },
      {
        id: 'rof-a2',
        category: 'measured',
        title: 'The same trial reported a four-fold excess of myocardial infarction, in 2000',
        laymanSummary:
          'The trial that proved the stomach benefit also reported that heart attacks were four times more common on rofecoxib. That was published in November 2000, four years before the drug was pulled.',
        technicalDetails:
          'In the VIGOR results section: "The incidence of myocardial infarction was lower among patients in the naproxen group than among those in the rofecoxib group (0.1 percent vs. 0.4 percent; relative risk, 0.2; 95 percent confidence interval, 0.1 to 0.7)." Overall mortality and cardiovascular mortality were similar between arms. The finding was framed in the paper as naproxen lowering risk rather than rofecoxib raising it, and the trial had no placebo arm that could have distinguished the two readings.',
        evidenceSource: 'Bombardier C et al., N Engl J Med 2000;343:1520-1528 (VIGOR)',
        doi: '10.1056/NEJM200011233432103',
        measuredMetric: 'Myocardial infarction incidence, 0.4% rofecoxib versus 0.1% naproxen',
        auditFlag: 'verified',
      },
      {
        id: 'rof-a3',
        category: 'inferred',
        title: 'The naproxen-cardioprotection explanation was an inference, and it did not survive',
        laymanSummary:
          'The heart attack difference was explained away as naproxen protecting the heart rather than rofecoxib damaging it. When someone finally measured how protective naproxen actually is, it was far too small to account for the gap.',
        technicalDetails:
          "Jüni et al. pooled 18 randomised trials and 11 observational studies of rofecoxib and of naproxen. The combined observational estimate for naproxen against remote NSAID use was a relative risk of 0.86 (95% CI 0.75 to 0.99) — a roughly 14% reduction, which cannot generate the four-fold VIGOR gap. They also found little evidence that rofecoxib's relative risk varied by comparator arm (placebo, non-naproxen NSAID or naproxen; p=0.41) or by trial duration (p=0.82). Graham's Kaiser Permanente cohort reached the same conclusion from the other direction: naproxen versus remote NSAID use gave an adjusted odds ratio of 1.14 (1.00 to 1.30), not below 1.",
        evidenceSource:
          'Jüni P et al., Lancet 2004;364:2021-2029; Graham DJ et al., Lancet 2005;365:475-481',
        doi: '10.1016/S0140-6736(04)17514-4',
        inferredClaim:
          'That naproxen was cardioprotective enough to explain the VIGOR myocardial infarction difference, so rofecoxib carried no thrombotic risk of its own',
        auditFlag: 'caution',
      },
      {
        id: 'rof-a4',
        category: 'measured',
        title: 'APPROVe: placebo-controlled, and the relative risk was 1.92',
        laymanSummary:
          'A three-year trial against a dummy pill found nearly twice the rate of clots, heart attacks and strokes on rofecoxib. This is the result that ended the drug.',
        technicalDetails:
          'Multicentre, randomised, double-blind, placebo-controlled; 2,586 patients with a history of colorectal adenomas assigned to rofecoxib 25 mg daily (n=1,287) or placebo (n=1,299). Confirmed thrombotic events, adjudicated blind by an external committee: 46 events in 3,059 patient-years on rofecoxib (1.50 per 100 patient-years) against 26 in 3,327 patient-years on placebo (0.78 per 100 patient-years), relative risk 1.92 (95% CI 1.19 to 3.11, p=0.008). Non-adjudicated congestive heart failure, pulmonary oedema and cardiac failure separated earlier, at about five months, with a hazard ratio of 4.61 (95% CI 1.50 to 18.83). Overall and cardiovascular mortality were similar. Merck withdrew rofecoxib worldwide on 30 September 2004.',
        evidenceSource: 'Bresalier RS et al., N Engl J Med 2005;352:1092-1102 (APPROVe)',
        doi: '10.1056/NEJMoa050493',
        measuredMetric:
          'Adjudicated thrombotic cardiovascular events per 100 patient-years versus placebo',
        auditFlag: 'verified',
      },
      {
        id: 'rof-a5',
        category: 'measured',
        title: 'The chemoprevention endpoint APPROVe was actually designed to test was met',
        laymanSummary:
          'APPROVe was not a heart study. It was testing whether rofecoxib prevented bowel polyps from coming back, and it did — recurrence fell from 55% to 41%.',
        technicalDetails:
          'In the modified intention-to-treat analysis of 2,587 randomised subjects with a recent history of histologically confirmed adenomas, adenoma recurrence over three years was 41% on rofecoxib against 55% on placebo (RR 0.76, 95% CI 0.69 to 0.83, p<0.0001), with a reduction in advanced adenomas as well (p<0.01). The effect was larger in year one (RR 0.65, 0.57 to 0.73) than in years two and three (RR 0.81, 0.71 to 0.93). The authors\' own conclusion was that rofecoxib significantly reduced adenoma risk "but also had serious toxicity". Both halves are the result.',
        evidenceSource: 'Baron JA et al., Gastroenterology 2006;131:1674-1682',
        doi: '10.1053/j.gastro.2006.08.079',
        measuredMetric: 'Adenoma recurrence over three years, 41% versus 55%',
        auditFlag: 'verified',
      },
      {
        id: 'rof-a6',
        category: 'conclusion_shift',
        title: 'The evidence was statistically sufficient by the end of 2000',
        laymanSummary:
          'Someone went back and added the trials up in the order they were published. By December 2000 the risk was already clear at conventional significance. The drug came off the market in September 2004.',
        technicalDetails:
          'Jüni et al. ran a cumulative random-effects meta-analysis with myocardial infarction as the primary endpoint. By the end of 2000, across 52 myocardial infarctions in 20,742 patients, the pooled relative risk from randomised trials was 2.30 (95% CI 1.22 to 4.33, p=0.010). One year later, at 64 events in 21,432 patients, it was 2.24 (1.24 to 4.02, p=0.007). Their stated interpretation: "rofecoxib should have been withdrawn several years earlier." The paper is not a new dataset; it is the existing dataset read in chronological order, which is the part nobody was doing.',
        evidenceSource: 'Jüni P et al., Lancet 2004;364:2021-2029',
        doi: '10.1016/S0140-6736(04)17514-4',
        measuredMetric:
          'Cumulative pooled relative risk of myocardial infarction by calendar date of evidence',
        auditFlag: 'verified',
      },
      {
        id: 'rof-a7',
        category: 'conclusion_shift',
        title: 'The New England Journal issued an Expression of Concern about its own VIGOR paper',
        laymanSummary:
          'Five years after publishing the trial, the journal said three heart attacks had been deleted from the manuscript before it went to press, and that the editors only learned of it during litigation.',
        technicalDetails:
          "In December 2005 the editors published an Expression of Concern regarding Bombardier et al. It stated that three myocardial infarctions in the rofecoxib group were not included in the version submitted for publication, that the editors had learned this from materials disclosed in litigation, and that the omission made the difference between the arms appear smaller than it was. The Expression of Concern was reaffirmed in 2006 after the authors' response. The trial's gastrointestinal conclusion was not retracted; the cardiovascular table was the disputed part.",
        evidenceSource:
          'Curfman GD, Morrissey S, Drazen JM. Expression of Concern: Bombardier et al. N Engl J Med 2005;353:2813-2814',
        doi: '10.1056/NEJMe058314',
        auditFlag: 'contested',
      },
      {
        id: 'rof-a8',
        category: 'measured',
        title: 'Kaiser Permanente: 1.59-fold risk against celecoxib, 3.58-fold above 25 mg daily',
        laymanSummary:
          'An FDA scientist matched every serious heart event in a 1.4-million-person health plan against controls. Rofecoxib carried more risk than celecoxib, and the high dose carried three and a half times as much.',
        technicalDetails:
          'Nested case-control study within a Kaiser Permanente California cohort of all patients aged 18 to 84 treated with an NSAID between 1 January 1999 and 31 December 2001. Over 2,302,029 person-years, 8,143 cases of serious coronary heart disease occurred, 2,210 of them (27.1%) fatal; each case was risk-set matched to four controls. Multivariate adjusted odds ratios against celecoxib: rofecoxib all doses 1.59 (95% CI 1.10 to 2.32, p=0.015); rofecoxib 25 mg/day or less 1.47 (0.99 to 2.17, p=0.054); rofecoxib above 25 mg/day 3.58 (1.27 to 10.11, p=0.016). The dose-response is the part that matters, because VIGOR used 50 mg.',
        evidenceSource: 'Graham DJ et al., Lancet 2005;365:475-481',
        doi: '10.1016/S0140-6736(05)17864-7',
        measuredMetric:
          'Adjusted odds ratio for acute myocardial infarction and sudden cardiac death versus celecoxib',
        auditFlag: 'verified',
      },
      {
        id: 'rof-a9',
        category: 'inferred',
        title: 'The claim that risk only appeared after 18 months rested on a fragile analysis',
        laymanSummary:
          'The trial report said the danger did not start until a year and a half in. That reassurance came from a statistical test that the journal itself later revisited, and the original paper was corrected.',
        technicalDetails:
          'The APPROVe report stated that the increased relative risk "became apparent after 18 months of treatment" and that event rates were similar during the first 18 months. PubMed records an erratum to the paper at N Engl J Med 2006;355:221. The journal separately published a methodological Perspective, Lagakos, "Time-to-Event Analyses for Long-Term Treatments — The APPROVe Trial", examining the time-to-event methods behind that delayed-effect claim. The point is narrow and worth stating precisely: the 1.92 relative risk over the whole trial is the robust result, and the reassuring subdivision of it in time is the part that was not.',
        evidenceSource:
          'Lagakos SW. N Engl J Med 2006;355:113-117; erratum to Bresalier et al., N Engl J Med 2006;355:221',
        doi: '10.1056/NEJMp068137',
        inferredClaim:
          'That rofecoxib was cardiovascularly safe for the first 18 months of continuous use, so short courses carried no excess risk',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed once a day and absorbed almost completely',
        laymanDesc:
          'A tablet taken once daily. It stays in the body long enough that one dose covers a full day.',
        molecularDetail:
          'Oral bioavailability approximately 93% at 12.5 to 50 mg. Elimination half-life around 17 hours, which supports once-daily dosing and means the COX-2 blockade is continuous rather than intermittent.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Reaches inflamed joint tissue and the lining of blood vessels',
        laymanDesc:
          'It spreads into the inflamed joint, where it relieves pain, and also into the walls of blood vessels, where the trouble started.',
        molecularDetail:
          'Distributes into synovial tissue and vascular endothelium. COX-2 is inducible in inflamed synovium, which is the therapeutic target, but it is also constitutively expressed in endothelial cells, which is the off-target site that determined the outcome.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Occupies the COX-2 side pocket that COX-1 does not have',
        laymanDesc:
          'COX-2 has a small extra cavity that its cousin COX-1 lacks. A bulky part of the molecule fits into it, so the drug sticks to one enzyme and not the other.',
        molecularDetail:
          'The methylsulfonyl group binds the hydrophilic side pocket created by the Val523-for-Ile523 substitution in COX-2. COX-1, with the bulkier isoleucine, cannot accommodate it. This single-residue difference is the entire structural basis of coxib selectivity.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Prostacyclin falls, thromboxane does not',
        laymanDesc:
          'Vessel walls stop making the substance that keeps platelets apart. Platelets carry on making the substance that makes them stick. The balance tips towards clotting.',
        molecularDetail:
          'Endothelial COX-2 supplies most systemic prostacyclin (PGI2), an inhibitor of platelet aggregation and a vasodilator. Platelet thromboxane A2 comes from COX-1 and is untouched. Urinary metabolite studies in humans show suppression of the prostacyclin metabolite with no change in the thromboxane metabolite, leaving unopposed prothrombotic tone.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Fewer ulcers, more myocardial infarctions',
        laymanDesc:
          'The stomach protection was real and measured. So was the extra rate of heart attacks and strokes. Both were in the trial data.',
        molecularDetail:
          'Measured endpoints, not mechanism: 2.1 versus 4.5 confirmed upper gastrointestinal events per 100 patient-years in VIGOR, and 1.50 versus 0.78 adjudicated thrombotic events per 100 patient-years against placebo in APPROVe.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'VIGOR (Vioxx Gastrointestinal Outcomes Research)',
        phase: 'Phase 4 randomised outcomes trial',
        sampleSize: 8076,
        primaryEndpoint:
          'Confirmed clinical upper gastrointestinal events over a median 9.0 months, rofecoxib 50 mg versus naproxen 1000 mg daily',
        endpointMet: true,
        statisticalPValue: 'RR 0.5 (95% CI 0.3 to 0.6), P < 0.001',
        unreportedAdverseSignals:
          'Myocardial infarction 0.4% on rofecoxib versus 0.1% on naproxen was reported in the paper but attributed to naproxen cardioprotection. The journal later stated in an Expression of Concern that three myocardial infarctions in the rofecoxib arm were absent from the submitted manuscript.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'APPROVe (Adenomatous Polyp Prevention on Vioxx)',
        phase: 'Phase 3 randomised placebo-controlled chemoprevention trial',
        sampleSize: 2586,
        primaryEndpoint:
          'Recurrent colorectal adenomas over three years; adjudicated thrombotic cardiovascular events reported as a pre-specified safety analysis',
        endpointMet: true,
        statisticalPValue:
          'Adenoma recurrence RR 0.76 (0.69 to 0.83), P < 0.0001; thrombotic events RR 1.92 (1.19 to 3.11), P = 0.008',
        unreportedAdverseSignals:
          'Congestive heart failure, pulmonary oedema and cardiac failure were not adjudicated and separated at about five months with a hazard ratio of 4.61 (1.50 to 18.83).',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Kaiser Permanente nested case-control (Graham et al.)',
        phase: 'Observational nested case-control study',
        sampleSize: 8143,
        primaryEndpoint:
          'Acute myocardial infarction and sudden cardiac death during current NSAID exposure, over 2,302,029 person-years',
        endpointMet: true,
        statisticalPValue:
          'Rofecoxib versus celecoxib, all doses OR 1.59 (1.10 to 2.32), P = 0.015; above 25 mg/day OR 3.58 (1.27 to 10.11), P = 0.016',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Confirmed upper gastrointestinal events halved against naproxen, 2.1 versus 4.5 per 100 patient-years in 8,076 patients',
        'Adjudicated thrombotic cardiovascular events nearly doubled against placebo, RR 1.92 (1.19 to 3.11) over three years in 2,586 patients',
        'Colorectal adenoma recurrence reduced from 55% to 41%, RR 0.76 (0.69 to 0.83)',
        'Serious coronary heart disease odds 1.59-fold higher than celecoxib in a 2.3-million-person-year health-plan cohort, and 3.58-fold above 25 mg per day',
      ],
      unsupportedInferences: [
        'That naproxen cardioprotection explained the VIGOR myocardial infarction gap — the measured naproxen effect in observational data is about 14%, not 400%',
        'That the excess thrombotic risk only began after 18 months of continuous treatment, a subdivision the original paper was later corrected on',
        'That COX-2 selectivity implied general safety, when the same selectivity that spares gastric COX-1 also spares platelet thromboxane',
      ],
      whatFailedInitially: [
        'The drug was withdrawn worldwide on 30 September 2004 after its own placebo-controlled trial was stopped early for cardiovascular events',
        'Cumulative meta-analysis showed the randomised evidence reached RR 2.30 (1.22 to 4.33) by the end of 2000, four years before withdrawal',
        'The New England Journal of Medicine issued and then reaffirmed an Expression of Concern about the pivotal publication',
      ],
      realWorldOutcome: [
        'Drugs@FDA records NDA 021042 (Merck) with VIOXX in Discontinued marketing status',
        'The case produced lasting regulatory change: FDA class labelling for cardiovascular risk across all NSAIDs, mandatory registration of trials, and the creation of standing drug-safety oversight independent of the review divisions',
        'Celecoxib survived the class and was later tested prospectively in PRECISION, which is the trial VIGOR should have been',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet and oral suspension, once daily (12.5, 25 and 50 mg)',
      description:
        'Once-daily oral dosing with roughly 93% bioavailability and a 17-hour half-life. The 50 mg strength was licensed for acute pain and short-term use, and was the dose used continuously for months in VIGOR.',
      safetyProfile:
        'Withdrawn worldwide on 30 September 2004 for thrombotic cardiovascular events. The measured harms are an adjudicated thrombotic event rate of 1.50 versus 0.78 per 100 patient-years against placebo, a congestive heart failure hazard ratio of 4.61 in the same trial, and a dose-dependent excess of serious coronary heart disease in cohort data. The gastrointestinal benefit that justified the drug was equally real and is not in dispute.',
    },
    commonQuestions: [
      {
        q: 'If the heart attack signal was published in 2000, why was the drug on sale until 2004?',
        a: 'Because the signal was published with an explanation attached. VIGOR had no placebo arm, so the myocardial infarction difference between rofecoxib and naproxen was consistent with two readings: rofecoxib raising risk, or naproxen lowering it. The paper and the sponsor took the second. Distinguishing them needed a placebo-controlled trial, and APPROVe — which was designed to test polyp prevention, not cardiac safety — was the one that eventually delivered it. Jüni and colleagues later showed the naproxen reading was never quantitatively plausible: the protective effect of naproxen measured in observational data is about 14%.',
        auditNote:
          'This is the single most instructive fact on the page. The data were public for four years. What was missing was not evidence but the willingness to read the ambiguous result the less convenient way.',
      },
      {
        q: 'Was this a bad drug, or a good drug used in the wrong people?',
        a: 'The trial record supports the second reading more than the first. Rofecoxib halved serious gastrointestinal complications, which kill people, and reduced adenoma recurrence by a quarter. It also produced roughly one extra thrombotic event per 140 patient-years of treatment against placebo. For a 45-year-old with rheumatoid arthritis and a bleeding history the arithmetic points one way; for a 72-year-old with coronary disease taking it daily for knee osteoarthritis it points the other. The drug was marketed to the second group without that arithmetic ever being put in front of them.',
      },
      {
        q: 'Does this mean other COX-2 inhibitors are unsafe?',
        a: 'It means the mechanism is shared and the magnitude is not automatically shared. Valdecoxib was withdrawn in 2005. Celecoxib stayed, and was later tested head to head against ibuprofen and naproxen in PRECISION, a 24,081-patient trial, where at the doses used it was non-inferior for the composite cardiovascular endpoint. The class effect on prostacyclin is real; how much it costs in events depends on dose, duration and the baseline risk of the person swallowing it.',
      },
      {
        q: 'Why does this page not show a price?',
        a: 'Because the drug has had no market since 30 September 2004, so there is no current list price to cite, and quoting the 2004 price as though it were live information would be misleading. Drugs@FDA records the application as Discontinued. This site prints numbers it can source to a document a reader can open.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Bombardier C et al. Comparison of upper gastrointestinal toxicity of rofecoxib and naproxen in patients with rheumatoid arthritis (VIGOR). N Engl J Med 2000;343:1520-1528',
        identifier: '10.1056/NEJM200011233432103',
        kind: 'doi',
      },
      {
        label:
          'Bresalier RS et al. Cardiovascular events associated with rofecoxib in a colorectal adenoma chemoprevention trial (APPROVe). N Engl J Med 2005;352:1092-1102',
        identifier: '10.1056/NEJMoa050493',
        kind: 'doi',
      },
      {
        label:
          'Baron JA et al. A randomized trial of rofecoxib for the chemoprevention of colorectal adenomas. Gastroenterology 2006;131:1674-1682',
        identifier: '10.1053/j.gastro.2006.08.079',
        kind: 'doi',
      },
      {
        label:
          'Jüni P et al. Risk of cardiovascular events and rofecoxib: cumulative meta-analysis. Lancet 2004;364:2021-2029',
        identifier: '10.1016/S0140-6736(04)17514-4',
        kind: 'doi',
      },
      {
        label:
          'Graham DJ et al. Risk of acute myocardial infarction and sudden cardiac death in patients treated with cyclo-oxygenase 2 selective and non-selective NSAIDs: nested case-control study. Lancet 2005;365:475-481',
        identifier: '10.1016/S0140-6736(05)17864-7',
        kind: 'doi',
      },
      {
        label:
          'Curfman GD, Morrissey S, Drazen JM. Expression of Concern: Bombardier et al. N Engl J Med 2005;353:2813-2814',
        identifier: '10.1056/NEJMe058314',
        kind: 'doi',
      },
      {
        label:
          'Lagakos SW. Time-to-event analyses for long-term treatments — the APPROVe trial. N Engl J Med 2006;355:113-117',
        identifier: '10.1056/NEJMp068137',
        kind: 'doi',
      },
      {
        label: 'Drugs@FDA: VIOXX (rofecoxib), NDA 021042, Merck — marketing status Discontinued',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021042',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 5090 — rofecoxib structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5090',
        kind: 'url',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 2. Sibutramine
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'sibutramine',
    name: 'Sibutramine',
    tradeName: 'Meridia / Reductil',
    sponsor: 'Knoll, then Abbott Laboratories (NDA 020632)',
    targetGene: 'SLC6A2 and SLC6A4',
    targetProtein: 'Norepinephrine transporter (NET) and serotonin transporter (SERT)',
    modality: 'Small Molecule',
    approvalStatus: 'Withdrawn from Market',
    approvalYear: 1997,
    indication:
      'Weight management in obesity, as an adjunct to a reduced-calorie diet. Suspended across Europe on 6 August 2010 and voluntarily withdrawn from the United States market on 8 October 2010.',
    patientFriendlyIndication: 'A prescription appetite suppressant for obesity',
    anatomicalSite: 'Hypothalamic satiety centres; also peripheral sympathetic nerve terminals',
    conditionContext: {
      conditionExplainer:
        'Sibutramine is a reuptake inhibitor that was repurposed. It was developed as an antidepressant, failed at that, and was noticed to cause weight loss instead. The same monoamine reuptake blockade that produces early satiety also raises heart rate and blood pressure.',
      whyItMatters:
        'Obesity drugs are prescribed to people who are, by definition, at raised cardiovascular risk. A drug that reduces weight while raising blood pressure and pulse is making two opposite bets on the same outcome, and only a hard-endpoint trial can settle which one wins.',
      whoTakesThis:
        'Nobody now. Between 1997 and 2010 it was the most widely used prescription weight-loss drug in much of the world after the fen-phen withdrawal removed the alternatives.',
      clinicalGoals:
        'The registration endpoint was kilograms lost and maintained. The endpoint that mattered turned out to be nonfatal myocardial infarction and stroke, and it was not measured until the drug had been on sale for twelve years.',
    },
    oneSentenceVerdict:
      'A serotonin-noradrenaline reuptake inhibitor that reliably produced and maintained modest weight loss, and in the only trial that ever measured hard cardiovascular outcomes produced a 16% excess of major events in 9,804 randomised patients.',
    laymanHowItWorks:
      'Nerve cells in the part of the brain that judges fullness use two chemical messengers. Sibutramine stops both from being cleared away, so the fullness signal stays switched on longer and people eat less. The same messengers also drive the sympathetic nervous system, so the heart beats faster and blood pressure rises a little. Over three and a half years in people who already had heart disease, that second effect cost more than the weight loss saved.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 90,
    substitutes: {
      summary:
        'The category sibutramine occupied has been rebuilt from scratch by the GLP-1 receptor agonists, which are the first weight-loss drugs to show a cardiovascular benefit rather than a cost. Orlistat works in the gut and never had a cardiovascular signal. Phentermine remains licensed for short-term use in the United States.',
      conventionalRx: [
        {
          name: 'Semaglutide 2.4 mg',
          class: 'GLP-1 receptor agonist',
          howItCompares:
            'The direct answer to the question sibutramine failed. In SELECT, semaglutide reduced major adverse cardiovascular events in overweight and obese patients with established cardiovascular disease and no diabetes. Sibutramine, tested in almost the same population, increased them.',
          typicalCost: 'Not priced here — list price varies by country and by payer',
          prosAndCons:
            'Pros: the only weight-loss pharmacology with a positive cardiovascular outcome trial. Cons: injectable, expensive, gastrointestinal side effects, weight regain on stopping.',
        },
        {
          name: 'Orlistat',
          class: 'Gastrointestinal lipase inhibitor',
          howItCompares:
            'Acts in the gut lumen with minimal systemic absorption, so it has no monoamine effect on heart rate or blood pressure. Weight loss is smaller than sibutramine achieved.',
          typicalCost: 'Generic prescription and over-the-counter forms; not priced here',
          prosAndCons:
            'Pros: no cardiovascular signal, over-the-counter at low dose. Cons: steatorrhoea and faecal urgency limit adherence, and fat-soluble vitamin absorption falls.',
        },
        {
          name: 'Phentermine',
          class: 'Sympathomimetic anorectic',
          howItCompares:
            'Still licensed in the United States for short-term use. Raises heart rate and blood pressure by a related mechanism, and has never been through a cardiovascular outcome trial of its own.',
          typicalCost: 'Generic; not priced here',
          prosAndCons:
            'Pros: cheap, effective for short-term appetite suppression. Cons: schedule IV, sympathomimetic, and carries the same untested long-term cardiovascular question sibutramine answered badly.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(C)CC(C1(CCC1)C2=CC=C(C=C2)Cl)N(C)C',
      chemicalFormula: 'C17H26ClN',
      molecularWeight: '279.8 g/mol (free base); marketed as sibutramine hydrochloride monohydrate',
      targetReceptorAffinity:
        'Sibutramine itself is a prodrug. Its two desmethyl metabolites, M1 and M2, carry most of the activity and inhibit norepinephrine and serotonin reuptake with substantially greater potency than the parent, with weaker dopamine reuptake inhibition.',
      structureSource: {
        label: 'PubChem CID 5210 (sibutramine) — canonical SMILES, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5210',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'sib-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity confirmation against a certified reference standard',
          description:
            'Confirm the cyclobutane ring, the para-chlorophenyl substitution and the dimethylamino group by high-resolution mass spectrometry and proton NMR. The cyclobutyl quaternary carbon gives a diagnostic NMR pattern that separates sibutramine from its ring-opened analogues.',
          reagentsAndBuffer:
            'Sibutramine hydrochloride certified reference standard, deuterated methanol, high-resolution LC-MS with electrospray in positive mode, expected protonated ion at m/z 280 with the chlorine isotope pattern',
        },
        {
          id: 'sib-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Screening for sibutramine as an undeclared adulterant in slimming products',
          description:
            'This is now the dominant analytical use of the molecule. Sibutramine is among the most frequently detected undeclared pharmaceutical adulterants in products sold as herbal weight-loss supplements, and detecting it in a matrix that is not supposed to contain it is a different problem from assaying a tablet. LC-ESI-MS/MS with polarity switching, and validated multi-analyte HPLC-MS panels covering fifteen or more slimming-product adulterants at once, are the published approaches.',
          dependsOnStepId: 'sib-w1',
          reagentsAndBuffer:
            'Methanolic sonication extract of the capsule or tea matrix, C18 column, acetonitrile and ammonium formate gradient, triple-quadrupole MS in multiple reaction monitoring with polarity switching, matrix-matched calibration and deuterated internal standard',
        },
        {
          id: 'sib-w3',
          stepNumber: 3,
          phase: 'Assay_Quantification',
          name: 'Monoamine transporter uptake inhibition for parent and M1/M2 metabolites',
          description:
            'Measure inhibition of tritiated norepinephrine, serotonin and dopamine uptake in cells expressing the respective human transporter, running sibutramine alongside its mono- and didesmethyl metabolites. Testing the parent alone understates potency, because the parent is largely a prodrug.',
          dependsOnStepId: 'sib-w2',
          reagentsAndBuffer:
            'HEK293 cells stably expressing human SLC6A2, SLC6A4 or SLC6A3, [3H]-norepinephrine, [3H]-5-hydroxytryptamine and [3H]-dopamine, Krebs-HEPES buffer with ascorbate and pargyline, glass-fibre filtration and scintillation counting',
        },
        {
          id: 'sib-w4',
          stepNumber: 4,
          phase: 'Assay_Quantification',
          name: 'Plasma quantification of sibutramine, M1 and M2 by LC-MS/MS',
          description:
            'Quantify parent and both active metabolites in plasma simultaneously. Because the metabolites carry the pharmacology, a bioanalytical method that measures only the parent describes the wrong exposure.',
          dependsOnStepId: 'sib-w3',
          reagentsAndBuffer:
            'Protein precipitation with acetonitrile, deuterated sibutramine internal standard, reversed-phase separation, triple-quadrupole MS in positive multiple reaction monitoring',
        },
      ],
    },
    keyAudits: [
      {
        id: 'sib-a1',
        category: 'measured',
        title: 'STORM: weight loss was maintained for two years, with an odds ratio of 4.6',
        laymanSummary:
          'Of the people who finished a two-year trial, 43% on sibutramine kept off at least four fifths of the weight they had lost, against 16% on placebo. The drug worked at the thing it was licensed for.',
        technicalDetails:
          'Eight European centres recruited 605 obese patients (BMI 30 to 45 kg/m2) for six months of open sibutramine 10 mg daily plus an individualised 600 kcal/day deficit programme. The 467 patients (77%) who lost more than 5% were then randomised double-blind to sibutramine (n=352) or placebo (n=115) for a further 18 months. Of trial completers, 89 of 204 (43%) on sibutramine maintained 80% or more of their original weight loss against 9 of 57 (16%) on placebo (odds ratio 4.64, p<0.001). Dropout was 42% and 50% respectively. HDL cholesterol rose 20.7% against 11.7% (p<0.001).',
        evidenceSource: 'James WPT et al., Lancet 2000;356:2119-2125 (STORM)',
        doi: '10.1016/S0140-6736(00)03491-7',
        measuredMetric: 'Proportion maintaining at least 80% of six-month weight loss at two years',
        auditFlag: 'verified',
      },
      {
        id: 'sib-a2',
        category: 'measured',
        title: 'The blood pressure and pulse signal was visible in STORM in 2000',
        laymanSummary:
          'The same two-year trial recorded that diastolic blood pressure and pulse rose on the drug, and that 3% of patients had to be withdrawn because their blood pressure went up. It was published a decade before the withdrawal.',
        technicalDetails:
          'In STORM, 20 patients (3%) were withdrawn because of increases in blood pressure. In the sibutramine group, from baseline to two years, systolic blood pressure rose by 0.1 mm Hg (SD 12.9), diastolic by 2.3 mm Hg (SD 9.4), and pulse rate by 4.1 beats per minute (SD 11.9). These are small mean shifts in a population already at elevated cardiovascular risk, and they are the pharmacological fingerprint of noradrenaline reuptake blockade rather than an idiosyncratic reaction.',
        evidenceSource: 'James WPT et al., Lancet 2000;356:2119-2125 (STORM)',
        doi: '10.1016/S0140-6736(00)03491-7',
        measuredMetric: 'Change in diastolic blood pressure and pulse rate over two years',
        auditFlag: 'verified',
      },
      {
        id: 'sib-a3',
        category: 'failed',
        title: 'SCOUT: 11.4% versus 10.0% major cardiovascular events, hazard ratio 1.16',
        laymanSummary:
          'The one trial that measured heart attacks and strokes rather than kilograms found more of them on the drug. It enrolled nearly ten thousand people and ran three and a half years.',
        technicalDetails:
          'SCOUT (NCT00234832) enrolled 10,744 overweight or obese subjects aged 55 or older with pre-existing cardiovascular disease, type 2 diabetes, or both. All received sibutramine during a six-week single-blind lead-in; 9,804 were then randomised double-blind to sibutramine (n=4,906) or placebo (n=4,898). Mean treatment duration 3.4 years. The primary composite — nonfatal myocardial infarction, nonfatal stroke, resuscitated cardiac arrest, or cardiovascular death — occurred in 11.4% on sibutramine against 10.0% on placebo (HR 1.16, 95% CI 1.03 to 1.31, p=0.02). Nonfatal myocardial infarction 4.1% versus 3.2% (HR 1.28, 1.04 to 1.57, p=0.02); nonfatal stroke 2.6% versus 1.9% (HR 1.36, 1.04 to 1.77, p=0.03). Cardiovascular death and all-cause death were not increased.',
        evidenceSource: 'James WPT et al., N Engl J Med 2010;363:905-917 (SCOUT, NCT00234832)',
        doi: '10.1056/NEJMoa1003114',
        measuredMetric:
          'Time to first nonfatal MI, nonfatal stroke, resuscitated cardiac arrest or cardiovascular death',
        auditFlag: 'verified',
      },
      {
        id: 'sib-a4',
        category: 'measured',
        title: 'The weight advantage after randomisation was 1.7 kg',
        laymanSummary:
          'After everyone had already lost weight in the run-in, the extra weight loss the drug delivered over three and a half years averaged 1.7 kilograms. That is the benefit side of the trade the trial priced.',
        technicalDetails:
          'In SCOUT, mean weight loss during the six-week lead-in, when everyone received sibutramine, was 2.6 kg. After randomisation the sibutramine group achieved and maintained a further mean reduction of 1.7 kg relative to placebo. Mean blood pressure fell in both groups but less on sibutramine, a mean difference of 1.2/1.4 mm Hg favouring placebo. The trial therefore put a number on both sides of the mechanism at once: modest sustained weight loss, and a modest sustained blood pressure penalty, in the same 9,804 people.',
        evidenceSource: 'James WPT et al., N Engl J Med 2010;363:905-917 (SCOUT)',
        doi: '10.1056/NEJMoa1003114',
        measuredMetric: 'Mean post-randomisation weight difference and blood pressure difference',
        auditFlag: 'verified',
      },
      {
        id: 'sib-a5',
        category: 'conclusion_shift',
        title: 'Regulators reversed within nine months of the SCOUT data',
        laymanSummary:
          'Europe suspended the drug in August 2010 and the FDA asked the manufacturer to pull it in October 2010. The trial that triggered it had been requested by regulators as a condition of keeping the drug on sale.',
        technicalDetails:
          'The SCOUT data safety monitoring board reported in October 2009 that sibutramine was associated with more cardiovascular problems than placebo. Germany requested a European review in November 2009; the CHMP opinion followed on 21 January 2010, concluding that the benefits of sibutramine did not outweigh its risks and that all European marketing authorisations should be suspended. The European Commission suspension took effect on 6 August 2010. On 8 October 2010 the FDA issued a Drug Safety Communication recommending against continued prescribing and use, and Abbott agreed to voluntary withdrawal. Drugs@FDA now records NDA 020632 (MERIDIA, Abbott) as Discontinued.',
        evidenceSource:
          'EMA sibutramine Article 107 referral outcome, 2010; FDA Drug Safety Communication, 8 October 2010',
        auditFlag: 'verified',
      },
      {
        id: 'sib-a6',
        category: 'inferred',
        title:
          'Weight loss was assumed to buy cardiovascular benefit. It was never tested until SCOUT',
        laymanSummary:
          'The whole case for the drug rested on the idea that losing weight protects the heart, so a drug that causes weight loss must protect the heart. Nobody checked for thirteen years, and when they did the answer was the opposite.',
        technicalDetails:
          'Sibutramine was approved in 1997 on weight and metabolic surrogate endpoints: kilograms, waist circumference, triglycerides, HDL cholesterol, glycaemic indices. Every one of those moved in the favourable direction and STORM confirmed they stayed moved. The inference that this would translate into fewer cardiovascular events treats the surrogate as though it carried the whole causal chain, and ignores that the same molecule was simultaneously raising pulse and diastolic pressure. SCOUT measured the endpoint directly and found a 16% relative increase in the composite. The surrogates were not wrong about weight; they were the wrong quantity to be measuring.',
        evidenceSource:
          'James WPT et al., Lancet 2000;356:2119-2125; James WPT et al., N Engl J Med 2010;363:905-917',
        doi: '10.1056/NEJMoa1003114',
        inferredClaim:
          'That drug-induced weight loss and improved metabolic surrogates would produce fewer cardiovascular events, when the same drug also raised heart rate and blood pressure',
        auditFlag: 'caution',
      },
      {
        id: 'sib-a7',
        category: 'measured',
        title: 'It did not disappear — it became one of the commonest supplement adulterants',
        laymanSummary:
          'Sibutramine is repeatedly found in products sold as herbal slimming teas and capsules, undeclared on the label. The analytical literature on finding it in those products is now larger than the clinical literature.',
        technicalDetails:
          'Sibutramine appears consistently in surveillance of undeclared pharmaceutical adulterants in slimming supplements. Published detection work includes validated LC-ESI-MS/MS with polarity switching for synthetic adulterants in natural and herbal slimming products, and rapid HPLC-ESI-MS methods for simultaneous analysis of fifteen key chemicals in slimming foods and herbal products. The FDA maintains a public list of tainted weight-loss products in which sibutramine is among the most frequently named undeclared ingredients. This matters clinically because the people buying an "herbal" product are not being monitored for the blood pressure and pulse effects that ended the licensed drug.',
        evidenceSource:
          'Kim HJ et al., J AOAC Int 2016;99:929-940; Wang J et al., J Chromatogr Sci 2018;56:912-919; FDA tainted weight-loss products list',
        doi: '10.5740/jaoacint.15-0295',
        measuredMetric: 'Detection of undeclared sibutramine in marketed slimming products',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed once daily and converted into its active forms',
        laymanDesc:
          'The capsule itself does little. The liver turns it into two related molecules that do the work.',
        molecularDetail:
          'Sibutramine is a prodrug. First-pass CYP3A4 metabolism yields the mono-desmethyl (M1) and di-desmethyl (M2) metabolites, which are substantially more potent reuptake inhibitors than the parent and have longer half-lives.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Reaches hypothalamic satiety circuits',
        laymanDesc:
          'The active molecules cross into the brain and reach the region that decides when you have eaten enough.',
        molecularDetail:
          'M1 and M2 distribute into the central nervous system and act at nerve terminals in hypothalamic nuclei that regulate energy intake, alongside peripheral sympathetic terminals.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Blocks the noradrenaline and serotonin transporters',
        laymanDesc:
          'They plug the two pumps that clear these messengers away, so both stay in the gap between nerve cells for longer.',
        molecularDetail:
          'Inhibition of SLC6A2 (norepinephrine transporter) and SLC6A4 (serotonin transporter), with weaker inhibition of SLC6A3 (dopamine transporter). Unlike the fenfluramines, sibutramine does not act as a releasing agent — it blocks reuptake only, which is why it does not carry their valvular signal.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Satiety rises, and so does sympathetic tone',
        laymanDesc:
          'Meals end sooner. At the same time the heart beats faster and blood pressure sits slightly higher, because the same messengers drive both.',
        molecularDetail:
          'Enhanced satiety signalling reduces energy intake; there is also evidence of a small thermogenic contribution. The identical noradrenergic mechanism raises resting heart rate and diastolic blood pressure, measured in STORM at 4.1 beats per minute and 2.3 mm Hg over two years.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Weight falls; nonfatal myocardial infarction and stroke rise',
        laymanDesc:
          'Both outcomes were measured in the same trial. The weight difference was 1.7 kilograms. The excess in heart attacks and strokes was 1.4 percentage points.',
        molecularDetail:
          'Measured endpoints: post-randomisation weight difference 1.7 kg, primary composite cardiovascular event 11.4% versus 10.0% (HR 1.16, 95% CI 1.03 to 1.31), nonfatal MI HR 1.28, nonfatal stroke HR 1.36, no increase in cardiovascular or all-cause mortality.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'STORM (Sibutramine Trial of Obesity Reduction and Maintenance)',
        phase: 'Phase 3 randomised withdrawal trial',
        sampleSize: 467,
        primaryEndpoint:
          'Proportion of patients at year 2 maintaining at least 80% of the weight lost between baseline and month 6',
        endpointMet: true,
        statisticalPValue: 'Odds ratio 4.64, P < 0.001 (43% versus 16% of completers)',
        unreportedAdverseSignals:
          'Twenty patients (3%) were withdrawn for rising blood pressure; diastolic pressure rose 2.3 mm Hg and pulse 4.1 beats per minute over two years. Dropout reached 42% on drug and 50% on placebo, so the headline maintenance figures describe completers.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'SCOUT (NCT00234832)',
        phase: 'Phase 4 cardiovascular outcomes trial',
        sampleSize: 9804,
        primaryEndpoint:
          'Time to first nonfatal myocardial infarction, nonfatal stroke, resuscitation after cardiac arrest, or cardiovascular death over a mean 3.4 years',
        endpointMet: false,
        statisticalPValue: 'Hazard ratio 1.16 (95% CI 1.03 to 1.31), P = 0.02, against sibutramine',
        unreportedAdverseSignals:
          'All 10,744 enrolled subjects received open-label sibutramine during the six-week lead-in before randomisation, which removed from the randomised comparison anyone who reacted badly early.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Maintenance of at least 80% of six-month weight loss at two years in 43% of completers versus 16% on placebo, odds ratio 4.64',
        'Post-randomisation weight difference of 1.7 kg over a mean 3.4 years in 9,804 patients',
        'Primary composite cardiovascular event in 11.4% versus 10.0%, hazard ratio 1.16 (95% CI 1.03 to 1.31)',
        'Diastolic blood pressure up 2.3 mm Hg and pulse up 4.1 beats per minute over two years',
      ],
      unsupportedInferences: [
        'That weight loss and improved lipid and glycaemic surrogates would translate into fewer cardiovascular events',
        'That the small mean rises in pulse and diastolic pressure recorded from 2000 onwards were clinically negligible in a population selected for cardiovascular risk',
      ],
      whatFailedInitially: [
        'SCOUT missed its primary endpoint in the wrong direction: more nonfatal myocardial infarctions and strokes on the drug',
        'European marketing authorisations suspended 6 August 2010; United States withdrawal 8 October 2010',
      ],
      realWorldOutcome: [
        'Drugs@FDA records NDA 020632 (MERIDIA, Abbott) as Discontinued',
        'Sibutramine is now one of the most frequently detected undeclared adulterants in products sold as herbal slimming supplements, which is where most current human exposure occurs',
        'SCOUT reset the regulatory bar for obesity drugs: cardiovascular outcome data became an expectation rather than an afterthought, which is the reason the GLP-1 agonists arrived with SELECT-style trials already run',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule, once daily (5, 10 and 15 mg)',
      description:
        'Once-daily oral capsule taken as an adjunct to a reduced-calorie diet. The parent compound is a prodrug converted by CYP3A4 to two longer-lived active metabolites, so the effective exposure outlasts the parent by a wide margin and interacts with CYP3A4 inhibitors.',
      safetyProfile:
        'Withdrawn worldwide in 2010 for excess nonfatal myocardial infarction and stroke. The measured harms are a hazard ratio of 1.16 for the composite cardiovascular endpoint, 1.28 for nonfatal MI and 1.36 for nonfatal stroke, over a mean 3.4 years, with no excess of cardiovascular or all-cause death. Dose-related increases in pulse and blood pressure are consistent findings, and the drug was contraindicated with monoamine oxidase inhibitors and other serotonergic agents.',
    },
    commonQuestions: [
      {
        q: 'If it caused more heart attacks, why did deaths not go up?',
        a: 'Because SCOUT counted nonfatal events, and those are the ones that rose. Nonfatal myocardial infarction went from 3.2% to 4.1% and nonfatal stroke from 1.9% to 2.6%; cardiovascular death and death from any cause were not increased. That distinction is real and worth stating plainly rather than smoothing over. It does not rescue the drug — a nonfatal stroke is not a minor outcome — but it does mean the harm is best described as more disabling events, not more deaths, over three and a half years.',
        auditNote:
          'The composite endpoint is what regulators acted on. Reporting only the mortality result would have understated the finding; reporting only the composite would have overstated it.',
      },
      {
        q: 'SCOUT enrolled people who already had heart disease. Does the result apply to healthy people?',
        a: "Not directly, and that is the honest limitation. SCOUT deliberately recruited a high-risk population — aged 55 or over with existing cardiovascular disease, type 2 diabetes, or both — precisely because that is where events accumulate fast enough to measure. Many of those patients would have been outside the drug's licensed population. The counter-argument regulators made is that a drug for obesity is prescribed overwhelmingly to people accumulating exactly those risk factors, so a population that pure does not exist in practice. No trial of comparable size was ever run in lower-risk patients, so the question stays open on the evidence and closed on the regulation.",
      },
      {
        q: 'Is sibutramine the same thing as fen-phen?',
        a: 'No, and the difference is mechanistic. Fenfluramine is a serotonin releasing agent that floods the synapse and acts at 5-HT2B receptors on heart valves, which is what caused valvular fibrosis. Sibutramine only blocks reuptake; it does not release stored monoamines and does not carry the valvular signal. Its problem was different — sympathetic activation raising pulse and blood pressure over years. Two obesity drugs, two distinct mechanisms, two distinct cardiac injuries, both discovered after approval.',
      },
      {
        q: 'Why does this page not show a price?',
        a: 'Because the drug has had no legal market anywhere since 2010, so there is no list price to cite. Drugs@FDA records the application as Discontinued. The only sibutramine most people could encounter now is undeclared adulterant in a supplement, which has no published price for the sibutramine content because the label denies it is there.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'James WPT et al. Effect of sibutramine on cardiovascular outcomes in overweight and obese subjects (SCOUT). N Engl J Med 2010;363:905-917',
        identifier: '10.1056/NEJMoa1003114',
        kind: 'doi',
      },
      {
        label: 'SCOUT — A Long Term Study of Sibutramine and the Role of Obesity Management',
        identifier: 'NCT00234832',
        kind: 'nct',
      },
      {
        label:
          'James WPT et al. Effect of sibutramine on weight maintenance after weight loss: a randomised trial (STORM). Lancet 2000;356:2119-2125',
        identifier: '10.1016/S0140-6736(00)03491-7',
        kind: 'doi',
      },
      {
        label:
          'Kim HJ et al. Detection of synthetic drugs as adulterants in natural and herbal slimming products by LC-ESI-MS/MS with polarity switching. J AOAC Int 2016;99:929-940',
        identifier: '10.5740/jaoacint.15-0295',
        kind: 'doi',
      },
      {
        label:
          'Validation of a rapid HPLC-ESI-MS method for simultaneous analysis of 15 key chemicals in slimming foods and herbal products. J Chromatogr Sci 2018;56:912-919',
        identifier: '10.1093/chromsci/bmy068',
        kind: 'doi',
      },
      {
        label:
          'EMA: sibutramine referral — European Commission suspension of all marketing authorisations, 6 August 2010, following the CHMP opinion of 21 January 2010',
        identifier: 'https://www.ema.europa.eu/en/medicines/human/referrals/sibutramine',
        kind: 'regulatory',
      },
      {
        label:
          'FDA Drug Safety Communication: FDA recommends against the continued use of Meridia (sibutramine), 8 October 2010',
        identifier:
          'https://wayback.archive-it.org/7993/20170112031610/http://www.fda.gov/Drugs/DrugSafety/ucm228746.htm',
        kind: 'regulatory',
      },
      {
        label: 'Drugs@FDA: MERIDIA (sibutramine hydrochloride), NDA 020632, Abbott — Discontinued',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020632',
        kind: 'regulatory',
      },
      {
        label: 'FDA: Tainted weight-loss products list',
        identifier:
          'https://www.fda.gov/drugs/medication-health-fraud/tainted-weight-loss-products',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 5210 — sibutramine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5210',
        kind: 'url',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 3. Cerivastatin
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'cerivastatin',
    name: 'Cerivastatin',
    tradeName: 'Baycol / Lipobay',
    sponsor: 'Bayer (NDA 020740)',
    targetGene: 'HMGCR',
    targetProtein: '3-hydroxy-3-methylglutaryl-coenzyme A reductase (HMG-CoA reductase)',
    modality: 'Small Molecule',
    approvalStatus: 'Withdrawn from Market',
    approvalYear: 1997,
    indication:
      'Reduction of elevated total and LDL cholesterol in primary hypercholesterolaemia. Voluntarily withdrawn worldwide by Bayer on 8 August 2001.',
    patientFriendlyIndication: 'A cholesterol-lowering statin',
    anatomicalSite: 'Hepatocyte cytoplasm; the toxicity site is skeletal muscle',
    conditionContext: {
      conditionExplainer:
        'All statins block the same liver enzyme and all of them can damage skeletal muscle. Muscle injury runs on a spectrum from aching, through a raised creatine kinase, to rhabdomyolysis — muscle cells rupturing and releasing myoglobin, which can destroy the kidneys.',
      whyItMatters:
        'Cerivastatin is the case that shows a class effect is not a class constant. Its rhabdomyolysis rate was roughly ten times that of the other statins on the market, and in combination with gemfibrozil it was of a different order entirely.',
      whoTakesThis:
        'Nobody now. It was prescribed from 1997 to 2001 as a cheaper, more potent-per-milligram alternative to the established statins.',
      clinicalGoals:
        'The licensed goal was LDL cholesterol reduction, a surrogate. Cerivastatin was approved and withdrawn without ever completing a cardiovascular outcome trial, so no one knows whether it prevented a single myocardial infarction.',
    },
    oneSentenceVerdict:
      'A statin approved on cholesterol numbers alone that produced hospitalised rhabdomyolysis at roughly twelve times the rate of atorvastatin, pravastatin or simvastatin, and about one case per ten patients per year when combined with a fibrate.',
    laymanHowItWorks:
      'Statins block the enzyme the liver uses to build cholesterol, so the liver pulls more cholesterol out of the blood to compensate. They also reach muscle, where the same blocked pathway can make muscle cells fail. Cerivastatin was unusually potent per milligram and, critically, cleared by two liver enzyme routes that gemfibrozil interferes with. Combine the two and blood levels of the statin climb far above what the dose implies, which is how a rare complication became a common one.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 92,
    substitutes: {
      summary:
        'The rest of the statin class stayed, and the same FDA cohort study that condemned cerivastatin gave atorvastatin, pravastatin and simvastatin a hospitalised rhabdomyolysis rate of 0.44 per 10,000 person-years — a number needed to harm of about 22,727 patient-years. Fenofibrate replaced gemfibrozil as the fibrate of choice for combination use, precisely because it does not produce the same interaction.',
      conventionalRx: [
        {
          name: 'Atorvastatin, pravastatin or simvastatin',
          class: 'HMG-CoA reductase inhibitor',
          howItCompares:
            'Pooled in the FDA cohort study at 0.44 hospitalised rhabdomyolysis cases per 10,000 person-years of monotherapy, against 5.34 for cerivastatin. All three have cardiovascular outcome trials behind them; cerivastatin never had one.',
          typicalCost: 'Generic; not priced here',
          prosAndCons:
            'Pros: outcome data, decades of use, low absolute myopathy rate. Cons: the same class mechanism, and simvastatin at 80 mg carries its own dose-related myopathy restriction.',
        },
        {
          name: 'Fenofibrate',
          class: 'PPAR-alpha agonist fibrate',
          howItCompares:
            'The fibrate that can be combined with a statin. Gemfibrozil inhibits the glucuronidation and OATP1B1-mediated uptake that statins depend on; fenofibrate does not to the same degree, which is why guidelines shifted to it for combination therapy after cerivastatin.',
          typicalCost: 'Generic; not priced here',
          prosAndCons:
            'Pros: much weaker statin interaction than gemfibrozil. Cons: still raises creatinine and still adds myopathy risk in combination, especially in older diabetic patients.',
        },
        {
          name: 'Ezetimibe',
          class: 'NPC1L1 cholesterol absorption inhibitor',
          howItCompares:
            'Lowers LDL by blocking intestinal absorption rather than hepatic synthesis, so it adds LDL reduction without adding to the statin muscle burden. IMPROVE-IT showed added outcome benefit on top of simvastatin.',
          typicalCost: 'Generic; not priced here',
          prosAndCons: 'Pros: no myopathy signal of its own. Cons: modest effect as monotherapy.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(C)C1=C(C(=C(C(=N1)C(C)C)COC)C2=CC=C(C=C2)F)/C=C/[C@H](C[C@H](CC(=O)O)O)O',
      chemicalFormula: 'C26H34FNO5',
      molecularWeight: '459.5 g/mol (free acid); marketed as the sodium salt',
      targetReceptorAffinity:
        'A fully synthetic pyridine-based statin with an open dihydroxyheptenoic acid side chain, so it needs no lactone hydrolysis to become active. It was the most potent statin per milligram ever marketed, dosed at 0.2 to 0.8 mg where the others are dosed in tens of milligrams.',
      structureSource: {
        label: 'PubChem CID 446156 (cerivastatin) — canonical SMILES, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/446156',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'cer-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity and stereochemical confirmation',
          description:
            'Confirm the 3R,5S configuration of the dihydroxy acid side chain and the E-geometry of the vinyl linker. The 3,5-dihydroxy motif is the pharmacophore that mimics the HMG-CoA tetrahedral intermediate; the wrong diastereomer is inactive, so identity work on a statin is a stereochemical exercise, not just a mass check.',
          reagentsAndBuffer:
            'Cerivastatin sodium certified reference standard, chiral stationary-phase HPLC, circular dichroism, LC-MS with electrospray in negative-ion mode for the carboxylate',
        },
        {
          id: 'cer-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Degradation and lactone-content assay',
          description:
            'Quantify the closed-ring lactone that forms from the hydroxy acid under acidic conditions, and the photodegradation products of the fluorophenyl chromophore. Statin stability assays must resolve acid and lactone forms because they interconvert and have different potency.',
          dependsOnStepId: 'cer-w1',
          reagentsAndBuffer:
            'C18 column, acetonitrile with ammonium acetate at pH 4.0, UV detection at 245 nm, forced-degradation samples under acid, base, oxidative and photolytic stress',
        },
        {
          id: 'cer-w3',
          stepNumber: 3,
          phase: 'Assay_Quantification',
          name: 'HMG-CoA reductase inhibition assay',
          description:
            'Measure IC50 against purified human HMG-CoA reductase catalytic domain by following NADPH oxidation spectrophotometrically. Run cerivastatin head to head with atorvastatin and simvastatin on the same plate, because the whole point of this molecule was potency per milligram.',
          dependsOnStepId: 'cer-w2',
          reagentsAndBuffer:
            'Recombinant human HMG-CoA reductase catalytic domain, HMG-CoA substrate, NADPH, potassium phosphate buffer with EDTA and DTT, absorbance monitored at 340 nm',
        },
        {
          id: 'cer-w4',
          stepNumber: 4,
          phase: 'Assay_Quantification',
          name: 'CYP2C8, CYP3A4 and OATP1B1 interaction panel',
          description:
            'This is the assay that would have predicted the disaster. Cerivastatin is cleared by both CYP2C8 and CYP3A4 and taken into hepatocytes by OATP1B1; gemfibrozil and its glucuronide inhibit CYP2C8 and OATP1B1. Measure cerivastatin depletion in human liver microsomes with and without gemfibrozil glucuronide, and uptake into OATP1B1-transfected cells, to quantify the exposure increase the combination produces.',
          dependsOnStepId: 'cer-w3',
          reagentsAndBuffer:
            'Pooled human liver microsomes with NADPH regenerating system, recombinant CYP2C8 and CYP3A4, gemfibrozil 1-O-beta-glucuronide, OATP1B1-transfected HEK293 cells and vector control, LC-MS/MS quantification of remaining cerivastatin',
        },
        {
          id: 'cer-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Myotoxicity readout in differentiated human myotubes',
          description:
            'Expose differentiated human skeletal myotubes to a concentration series and measure creatine kinase release and ATP depletion. This converts the pharmacokinetic interaction into the tissue-level event that the clinical reports describe.',
          dependsOnStepId: 'cer-w4',
          reagentsAndBuffer:
            'Primary human skeletal muscle myoblasts differentiated in low-serum medium, creatine kinase activity assay, luminescent ATP assay, mevalonate rescue arm to confirm the effect runs through the mevalonate pathway',
        },
      ],
    },
    keyAudits: [
      {
        id: 'cer-a1',
        category: 'measured',
        title: 'FDA cohort: 5.34 hospitalised rhabdomyolysis cases per 10,000 person-years',
        laymanSummary:
          'Across a quarter of a million patients in eleven health plans, cerivastatin caused hospitalised muscle breakdown at about twelve times the rate of the three statins it competed with.',
        technicalDetails:
          'Drug-specific inception cohorts built from claims data across 11 US managed care plans, patients entered between 1 January 1998 and 30 June 2001. Among 252,460 patients treated with lipid-lowering agents there were 24 hospitalised rhabdomyolysis cases during treatment. Incidence per 10,000 person-years of monotherapy: atorvastatin, pravastatin or simvastatin pooled 0.44 (95% CI 0.20 to 0.84); cerivastatin 5.34 (95% CI 1.46 to 13.68); fibrate 2.82 (95% CI 0.58 to 8.24). Incidence during unexposed person-time was 0 (95% CI 0 to 0.48, p=0.056). The number needed to treat for one year to produce one case was 22,727 for statin monotherapy.',
        evidenceSource: 'Graham DJ et al., JAMA 2004;292:2585-2590',
        doi: '10.1001/jama.292.21.2585',
        measuredMetric: 'Hospitalised rhabdomyolysis per 10,000 person-years by drug',
        auditFlag: 'verified',
      },
      {
        id: 'cer-a2',
        category: 'measured',
        title: 'With a fibrate the rate was 1,035 per 10,000 person-years — about 1 in 10 per year',
        laymanSummary:
          'Taken together with a fibrate, roughly one in ten patients per year was hospitalised with muscle breakdown. That is not a rare adverse event; that is what the drug did in that combination.',
        technicalDetails:
          'In the same cohort, combined cerivastatin-fibrate use gave an incidence of 1,035 per 10,000 person-years (95% CI 389 to 2,117), against 5.98 (95% CI 0.72 to 216.0) for atorvastatin, pravastatin or simvastatin combined with a fibrate. The number needed to treat for one year to observe one case ranged from 9.7 to 12.7 for cerivastatin plus fibrate, against 484 for older diabetic patients on any other statin plus fibrate. The authors\' stated conclusion: "Cerivastatin combined with fibrate conferred a risk of approximately 1 in 10 treated patients per year."',
        evidenceSource: 'Graham DJ et al., JAMA 2004;292:2585-2590',
        doi: '10.1001/jama.292.21.2585',
        measuredMetric:
          'Hospitalised rhabdomyolysis per 10,000 person-years, cerivastatin plus fibrate',
        auditFlag: 'verified',
      },
      {
        id: 'cer-a3',
        category: 'measured',
        title: 'Fifty-two deaths, and rhabdomyolysis ten times more common than with other statins',
        laymanSummary:
          'The withdrawal followed 52 deaths from muscle breakdown leading to kidney failure. The rate was about ten times that of the five other statins then approved.',
        technicalDetails:
          'Furberg and Pitt, writing immediately after the August 2001 withdrawal, recorded 52 deaths attributed to drug-related rhabdomyolysis progressing to renal failure. Risk was concentrated at the full 0.8 mg daily dose and in patients taking gemfibrozil concomitantly. Rhabdomyolysis was approximately ten times more common with cerivastatin than with the other five approved statins. The FDA also received and analysed fatal-rhabdomyolysis reports for cerivastatin specifically, published as a research letter in the New England Journal of Medicine in February 2002.',
        evidenceSource:
          'Furberg CD, Pitt B. Curr Control Trials Cardiovasc Med 2001;2:205-207; Staffa JA, Chang J, Green L. N Engl J Med 2002;346:539-540',
        doi: '10.1186/cvm-2-5-205',
        measuredMetric: 'Deaths from drug-related rhabdomyolysis reported at withdrawal',
        auditFlag: 'verified',
      },
      {
        id: 'cer-a4',
        category: 'conclusion_shift',
        title: 'The interaction was visible in company files about 100 days after launch',
        laymanSummary:
          'Internal documents released in litigation showed the manufacturer had case reports pointing to the gemfibrozil interaction within roughly a hundred days of launch. The contraindication was added more than eighteen months later.',
        technicalDetails:
          "Psaty and colleagues reviewed internal company documents that entered the public record during litigation in Nueces County, Texas, alongside the published literature. Their findings: multiple case reports suggested a drug-drug interaction within approximately 100 days of the 1998 launch, but a contraindication for concomitant gemfibrozil was not added to the package insert for more than 18 months. Unpublished data available in July 1999 also indicated increased rhabdomyolysis risk with high-dose cerivastatin monotherapy. In late 1999 and early 2000 company scientists ran high-quality analyses of FDA adverse event reporting system data showing cerivastatin monotherapy substantially increased rhabdomyolysis risk compared with atorvastatin; to the authors' knowledge those analyses were never disseminated or published.",
        evidenceSource: 'Psaty BM, Furberg CD, Ray WA, Weiss NS. JAMA 2004;292:2622-2631',
        doi: '10.1001/jama.292.21.2622',
        auditFlag: 'verified',
      },
      {
        id: 'cer-a5',
        category: 'inferred',
        title: 'Approved on LDL cholesterol, withdrawn before any outcome trial reported',
        laymanSummary:
          'The drug was licensed because it lowered a cholesterol number. Whether it prevented a single heart attack was never established, because it left the market before the trial that would have shown it finished.',
        technicalDetails:
          'Cerivastatin was approved on the surrogate endpoint of LDL cholesterol reduction. Furberg and Pitt used the withdrawal to pose the question directly — "Should we continue to approve drugs on surrogate efficacy?" — and answered that decisions about drug use should rest on direct evidence from long-term clinical outcome trials. Their second question, "Are all statins interchangeable?", is answered by the same episode: the class shares a mechanism but not a safety profile, and the drug with the highest potency per milligram and the most interaction-prone clearance route was the one that failed. The benefit side of cerivastatin\'s risk-benefit calculation was, and remains, an inference from other statins\' trials.',
        evidenceSource: 'Furberg CD, Pitt B. Curr Control Trials Cardiovasc Med 2001;2:205-207',
        doi: '10.1186/cvm-2-5-205',
        inferredClaim:
          'That LDL cholesterol reduction by cerivastatin implied the cardiovascular outcome benefit demonstrated for other statins, so the risk was worth accepting',
        auditFlag: 'caution',
      },
      {
        id: 'cer-a6',
        category: 'measured',
        title: 'The interaction is pharmacokinetic and was demonstrated in a three-day study',
        laymanSummary:
          'A short pharmacokinetic study confirmed that gemfibrozil raises cerivastatin blood levels sharply. The problem was mechanical and predictable, not mysterious.',
        technicalDetails:
          'Psaty et al. record that although only a small percentage of cerivastatin users also took gemfibrozil, approximately half of the published rhabdomyolysis case reports came from that combination, and that a cerivastatin-gemfibrozil interaction was supported by the results of a three-day pharmacokinetic study. Mechanistically, cerivastatin is cleared by both CYP2C8 and CYP3A4 and taken up into hepatocytes by OATP1B1; gemfibrozil and particularly its 1-O-beta-glucuronide inhibit CYP2C8 and OATP1B1, so systemic exposure rises well beyond what the milligram dose predicts and muscle sees a concentration the label never contemplated.',
        evidenceSource: 'Psaty BM, Furberg CD, Ray WA, Weiss NS. JAMA 2004;292:2622-2631',
        doi: '10.1001/jama.292.21.2622',
        measuredMetric:
          'Proportion of published rhabdomyolysis case reports occurring on cerivastatin plus gemfibrozil',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A sub-milligram tablet, taken once daily',
        laymanDesc:
          'Doses were a fraction of a milligram, where other statins are given in tens of milligrams. It was the most potent statin per milligram ever sold.',
        molecularDetail:
          'Licensed doses of 0.2, 0.3, 0.4 and 0.8 mg daily. The open dihydroxy acid form needs no lactone hydrolysis, so it is active on absorption.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Carried into liver cells by a transporter',
        laymanDesc:
          'A pump on the surface of liver cells drags the drug inside, which is where it is supposed to act.',
        molecularDetail:
          'Hepatic uptake is mediated principally by OATP1B1 (SLCO1B1). This transporter step concentrates statins in the liver and is also the first point at which the gemfibrozil interaction bites.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Blocks HMG-CoA reductase',
        laymanDesc:
          'It occupies the site where the enzyme normally grips its substrate, so the liver cannot make cholesterol from scratch.',
        molecularDetail:
          'The 3,5-dihydroxyheptenoic acid side chain mimics the tetrahedral intermediate of HMG-CoA reduction and binds the catalytic site of HMG-CoA reductase with high affinity, blocking mevalonate synthesis.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'LDL receptors go up; muscle mevalonate goes down',
        laymanDesc:
          'The liver compensates by pulling more cholesterol out of the blood. Muscle cells, which also need the blocked pathway, run short of the products that keep them intact.',
        molecularDetail:
          'Depleted hepatic sterol triggers SREBP-2 activation and LDL receptor upregulation, lowering plasma LDL. In skeletal muscle the same mevalonate blockade depletes ubiquinone and the prenylated small GTPases needed for membrane maintenance, which is the accepted route to statin myopathy.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'LDL falls; in some patients the muscle dissolves',
        laymanDesc:
          'Cholesterol came down as designed. In a fraction of patients — far larger than for other statins — muscle broke down enough to injure the kidneys.',
        molecularDetail:
          'Measured endpoints: LDL reduction, versus 5.34 hospitalised rhabdomyolysis cases per 10,000 person-years on monotherapy and 1,035 per 10,000 person-years with a fibrate. Myoglobin released from ruptured myocytes precipitates in renal tubules and causes acute kidney injury, which is the mechanism of the 52 reported deaths.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'FDA / HMO Research Network rhabdomyolysis cohort (Graham et al.)',
        phase: 'Retrospective inception-cohort study across 11 managed care plans',
        sampleSize: 252460,
        primaryEndpoint:
          'Incidence of hospitalised rhabdomyolysis per 10,000 person-years by lipid-lowering drug and combination',
        endpointMet: true,
        statisticalPValue:
          'Cerivastatin monotherapy 5.34 per 10,000 person-years (95% CI 1.46 to 13.68) versus 0.44 (0.20 to 0.84) for atorvastatin, pravastatin or simvastatin; cerivastatin plus fibrate 1,035 (389 to 2,117)',
        unreportedAdverseSignals:
          'The cohort ends 30 June 2001, five weeks before withdrawal, so it captures the drug at its peak use and cannot include events after market removal.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Postmarketing surveillance review (Psaty et al., including litigation documents)',
        phase: 'Systematic review of published and unpublished postmarketing data',
        sampleSize: 0,
        primaryEndpoint:
          'Timing and content of the evidence available to the sponsor versus to prescribers on cerivastatin-associated rhabdomyolysis',
        endpointMet: true,
        statisticalPValue:
          'Not a hypothesis test; the finding is documentary — interaction case reports within ~100 days of launch, contraindication added after more than 18 months',
        unreportedAdverseSignals:
          "Company analyses of FDA adverse event reporting data from late 1999 and early 2000, showing increased rhabdomyolysis risk versus atorvastatin, were to the authors' knowledge never published.",
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Hospitalised rhabdomyolysis at 5.34 per 10,000 person-years on cerivastatin monotherapy versus 0.44 for atorvastatin, pravastatin or simvastatin',
        '1,035 cases per 10,000 person-years on cerivastatin plus a fibrate, a number needed to harm of 9.7 to 12.7 patient-years',
        '52 deaths attributed to drug-related rhabdomyolysis with renal failure at the time of withdrawal',
        'Rhabdomyolysis approximately ten times more common than with the other five statins then approved',
      ],
      unsupportedInferences: [
        'That LDL reduction by this particular statin implied the outcome benefit demonstrated for others in the class — cerivastatin never completed a cardiovascular outcome trial',
        'That statins are interchangeable within the class, when clearance route, potency per milligram and interaction profile differ enough to change the safety profile by an order of magnitude',
      ],
      whatFailedInitially: [
        'Voluntary worldwide withdrawal by Bayer on 8 August 2001, less than four years after United States approval',
        'The gemfibrozil contraindication was added more than 18 months after case reports first pointed to the interaction',
      ],
      realWorldOutcome: [
        'Drugs@FDA records NDA 020740 (BAYCOL, Bayer) as Discontinued',
        'Combination lipid therapy shifted from gemfibrozil to fenofibrate, because the interaction is with gemfibrozil glucuronide at CYP2C8 and OATP1B1 rather than with fibrates as a class',
        'The episode became the standard case for independent postmarketing safety analysis, and Psaty et al. used it to argue that appraisal of suspected adverse reactions should not sit with the sponsor',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, once daily in the evening (0.2 to 0.8 mg)',
      description:
        'Sub-milligram once-daily tablet. Dual clearance by CYP2C8 and CYP3A4 with OATP1B1-mediated hepatic uptake, which is an unusually interaction-exposed disposition for a drug given to patients who are frequently on several other agents.',
      safetyProfile:
        'Withdrawn worldwide on 8 August 2001 for rhabdomyolysis. The measured harms are 5.34 hospitalised cases per 10,000 person-years on monotherapy, 1,035 per 10,000 person-years with a fibrate, and 52 deaths from rhabdomyolysis with renal failure reported at withdrawal. Risk concentrated at the 0.8 mg dose and in concomitant gemfibrozil use.',
    },
    commonQuestions: [
      {
        q: 'Does this mean statins are dangerous?',
        a: 'The same study that condemned cerivastatin is one of the better arguments that they are not. Atorvastatin, pravastatin and simvastatin produced 0.44 hospitalised rhabdomyolysis cases per 10,000 person-years, which is one case per roughly 22,700 patient-years of treatment. Cerivastatin produced twelve times that on its own and more than two thousand times that in combination with a fibrate. The class shares a mechanism; it does not share a rate. The useful lesson is the opposite of "avoid statins" — it is that a within-class comparison is a real measurement and a class assumption is not.',
        auditNote:
          'Both numbers come from the same cohort, the same investigators and the same claims dataset, which is what makes the comparison usable.',
      },
      {
        q: 'Why was the fibrate combination so much worse?',
        a: 'Because it is a pharmacokinetic collision, not an additive toxicity. Cerivastatin is cleared by CYP2C8 and CYP3A4 and taken into liver cells by the OATP1B1 transporter. Gemfibrozil, and especially its glucuronide metabolite, inhibits CYP2C8 and OATP1B1. Block both the uptake route and the metabolic route and plasma concentrations rise well above what the milligram dose implies, so skeletal muscle is exposed to a level the label never contemplated. A three-day pharmacokinetic study confirmed the interaction, and about half of published rhabdomyolysis case reports involved the combination even though only a small fraction of users took it.',
      },
      {
        q: 'Did cerivastatin prevent heart attacks?',
        a: 'Nobody knows, and that is the striking part. It was approved on LDL cholesterol reduction and withdrawn before any cardiovascular outcome trial reported. Every claim about its benefit is an extrapolation from trials of other statins. That asymmetry — measured harm, inferred benefit — is exactly what Furberg and Pitt seized on when they asked whether drugs should be approved on surrogate efficacy at all.',
      },
      {
        q: 'Why does this page not show a price?',
        a: 'Because the drug has had no market since August 2001 and Drugs@FDA lists the application as Discontinued. There is no current price to cite and no verified per-dose manufacturing cost, so the field is left out rather than filled with an estimate.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Graham DJ et al. Incidence of hospitalized rhabdomyolysis in patients treated with lipid-lowering drugs. JAMA 2004;292:2585-2590',
        identifier: '10.1001/jama.292.21.2585',
        kind: 'doi',
      },
      {
        label:
          'Psaty BM, Furberg CD, Ray WA, Weiss NS. Potential for conflict of interest in the evaluation of suspected adverse drug reactions: use of cerivastatin and risk of rhabdomyolysis. JAMA 2004;292:2622-2631',
        identifier: '10.1001/jama.292.21.2622',
        kind: 'doi',
      },
      {
        label:
          'Furberg CD, Pitt B. Withdrawal of cerivastatin from the world market. Curr Control Trials Cardiovasc Med 2001;2:205-207',
        identifier: '10.1186/cvm-2-5-205',
        kind: 'doi',
      },
      {
        label:
          'Staffa JA, Chang J, Green L. Cerivastatin and reports of fatal rhabdomyolysis. N Engl J Med 2002;346:539-540',
        identifier: '10.1056/NEJM200202143460721',
        kind: 'doi',
      },
      {
        label: 'Drugs@FDA: BAYCOL (cerivastatin sodium), NDA 020740, Bayer — Discontinued',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020740',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 446156 — cerivastatin structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/446156',
        kind: 'url',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 4. Troglitazone
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'troglitazone',
    name: 'Troglitazone',
    tradeName: 'Rezulin / Romozin / Noscal',
    sponsor: 'Sankyo, licensed to Parke-Davis / Warner-Lambert (NDA 020720)',
    targetGene: 'PPARG',
    targetProtein: 'Peroxisome proliferator-activated receptor gamma (PPAR-gamma)',
    modality: 'Small Molecule',
    approvalStatus: 'Withdrawn from Market',
    approvalYear: 1997,
    indication:
      'Type 2 diabetes mellitus, as monotherapy and in combination with sulfonylureas, metformin or insulin. Withdrawn in the United Kingdom within weeks of its late-1997 launch and from the United States market on 21 March 2000.',
    patientFriendlyIndication: 'A tablet for type 2 diabetes that made the body respond to insulin',
    anatomicalSite: 'Adipocyte and hepatocyte nuclei; the toxicity site is the hepatocyte',
    conditionContext: {
      conditionExplainer:
        'Type 2 diabetes is not primarily a shortage of insulin. It is a failure of tissues to respond to it, followed by the exhaustion of the beta cells that have been compensating. Troglitazone was the first drug that attacked the resistance rather than pushing more insulin out.',
      whyItMatters:
        'It worked. In two independent prevention trials it cut new diabetes by more than half. It also caused fulminant liver failure at a rate that no glucose-lowering drug can justify, and the monitoring scheme designed to catch that failure did not work either.',
      whoTakesThis:
        'Nobody now. Pioglitazone and rosiglitazone, which share the mechanism without the hepatotoxicity, took its place from 1999.',
      clinicalGoals:
        'Lower HbA1c by restoring insulin sensitivity. The prevention trials went further and showed it could stop diabetes appearing at all — which is what makes the withdrawal a genuine loss rather than a simple correction.',
    },
    oneSentenceVerdict:
      'The first thiazolidinedione: it cut new-onset diabetes from 12.0 to 3.0 cases per 100 person-years in the Diabetes Prevention Program, and caused 94 reported cases of liver failure of which only 13% recovered without a transplant.',
    laymanHowItWorks:
      'Fat cells carry a switch that decides how much fat they store and how sensitively the whole body responds to insulin. Troglitazone flips that switch on. Fat gets pulled back into fat cells and out of muscle and liver, so insulin starts working again and blood sugar falls without the pancreas being pushed harder. The liver injury was separate from all of that: an unpredictable reaction, in a minority of patients, that could go from normal liver tests to irreversible failure inside a month.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 91,
    substitutes: {
      summary:
        'Pioglitazone and rosiglitazone are the same receptor mechanism without the chromanol group implicated in troglitazone hepatotoxicity, and both remain licensed. Metformin was the direct comparator in the Diabetes Prevention Program and prevented less diabetes than troglitazone did. Intensive lifestyle intervention outperformed metformin in the same trial.',
      conventionalRx: [
        {
          name: 'Pioglitazone',
          class: 'Thiazolidinedione PPAR-gamma agonist',
          howItCompares:
            'Same nuclear receptor target, no chromanol tail, and no comparable hepatotoxicity signal in two decades of use. It also has a positive secondary-prevention outcome trial in stroke patients with insulin resistance.',
          typicalCost: 'Generic; not priced here',
          prosAndCons:
            'Pros: durable glycaemic effect, outcome data. Cons: weight gain, fluid retention and heart failure risk, bone fracture risk in women.',
        },
        {
          name: 'Metformin',
          class: 'Biguanide',
          howItCompares:
            'Randomised head to head against troglitazone inside the Diabetes Prevention Program: 6.7 versus 3.0 diabetes cases per 100 person-years during the period both were given (p=0.02 favouring troglitazone).',
          typicalCost: 'Generic; not priced here',
          prosAndCons:
            'Pros: cheap, decades of outcome data, weight-neutral. Cons: gastrointestinal intolerance, contraindicated in significant renal impairment.',
        },
        {
          name: 'Intensive lifestyle intervention',
          class: 'Structured diet and physical activity programme',
          howItCompares:
            "The fourth arm of the same trial, at 5.1 cases per 100 person-years against troglitazone's 3.0 — a difference that did not reach significance (p=0.18) over the short troglitazone exposure.",
          typicalCost: 'Not priced here — cost is programme delivery, not a drug',
          prosAndCons:
            'Pros: no hepatotoxicity, benefits beyond glucose, effect persists. Cons: requires sustained support to deliver at trial intensity.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC1=C(C2=C(CCC(O2)(C)COC3=CC=C(C=C3)CC4C(=O)NC(=O)S4)C(=C1O)C)C',
      chemicalFormula: 'C24H27NO5S',
      molecularWeight: '441.5 g/mol',
      targetReceptorAffinity:
        'Thiazolidinedione head group binds the PPAR-gamma ligand-binding domain. Troglitazone is the only marketed glitazone carrying an alpha-tocopherol-derived chromanol tail, and that tail is the structural feature implicated in the reactive quinone metabolites associated with its hepatotoxicity.',
      structureSource: {
        label: 'PubChem CID 5591 (troglitazone) — canonical SMILES, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5591',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'tro-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity confirmation of the chromanol and thiazolidinedione halves',
          description:
            'Confirm both ends of the molecule separately: the trimethyl-hydroxychromanol, which is the vitamin E fragment, and the 2,4-thiazolidinedione head. Most structural analogues in this class differ only in the tail, so a mass check alone is not identification.',
          reagentsAndBuffer:
            'Troglitazone certified reference standard, deuterated DMSO for NMR, high-resolution LC-MS with electrospray in negative-ion mode, expected deprotonated ion at m/z 440',
        },
        {
          id: 'tro-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Purity and oxidative-degradation profiling of the chromanol',
          description:
            'Profile the oxidation products of the phenolic chromanol under forced oxidative stress. The same phenol that makes the tail a radical scavenger also makes it a quinone precursor, so this assay reads directly onto the hepatotoxicity hypothesis.',
          dependsOnStepId: 'tro-w1',
          reagentsAndBuffer:
            'C18 column, acetonitrile with 0.1% formic acid gradient, photodiode array detection, hydrogen peroxide and metal-catalysed oxidative stress samples, LC-MS/MS identification of quinone and quinone methide products',
        },
        {
          id: 'tro-w3',
          stepNumber: 3,
          phase: 'Assay_Quantification',
          name: 'PPAR-gamma ligand binding and transactivation',
          description:
            'Measure competitive displacement of a labelled PPAR-gamma ligand from the recombinant ligand-binding domain, then confirm functional agonism in a GAL4-PPAR-gamma transactivation reporter. Run pioglitazone and rosiglitazone alongside, because the clinical question this drug leaves behind is what differs between them and it is not the receptor.',
          dependsOnStepId: 'tro-w2',
          reagentsAndBuffer:
            'Recombinant human PPAR-gamma ligand-binding domain, fluorescent or radiolabelled reference ligand, GAL4-PPAR-gamma LBD reporter construct with UAS-luciferase in HEK293 cells, dual-luciferase readout',
        },
        {
          id: 'tro-w4',
          stepNumber: 4,
          phase: 'Assay_Quantification',
          name: 'Reactive-metabolite trapping in human liver microsomes',
          description:
            'Incubate with NADPH-fortified human liver microsomes in the presence of glutathione and trap the reactive intermediates. Troglitazone forms quinone and quinone methide species from the chromanol and a reactive sulphur species from the thiazolidinedione ring; identifying which adducts form, and whether the comparator glitazones form them, is the mechanistic core of the whole case.',
          dependsOnStepId: 'tro-w3',
          reagentsAndBuffer:
            'Pooled human liver microsomes, NADPH regenerating system, reduced glutathione and potassium cyanide as trapping agents, LC-MS/MS neutral-loss and precursor-ion scanning for glutathione adducts',
        },
        {
          id: 'tro-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Hepatocyte viability and mitochondrial function panel',
          description:
            'Expose primary human hepatocytes or HepaRG cells to a concentration series and measure ATP content, mitochondrial membrane potential and bile salt export pump inhibition. This converts the reactive-metabolite chemistry into the cellular injury the clinical reports describe.',
          dependsOnStepId: 'tro-w4',
          reagentsAndBuffer:
            'Primary human hepatocytes or differentiated HepaRG cells, luminescent ATP assay, TMRM mitochondrial membrane potential dye, inverted membrane vesicles expressing BSEP with taurocholate transport readout',
        },
      ],
    },
    keyAudits: [
      {
        id: 'tro-a1',
        category: 'measured',
        title: 'DPP: 3.0 versus 12.0 diabetes cases per 100 person-years against placebo',
        laymanSummary:
          'In the largest diabetes prevention trial ever run, troglitazone cut new diabetes to a quarter of the placebo rate. It beat metformin. It also beat the intensive lifestyle programme, though not significantly.',
        technicalDetails:
          'The Diabetes Prevention Program randomised participants from 1996 to 1998 to metformin (n=587), troglitazone (n=585), double placebo (n=582) or intensive lifestyle intervention (n=589). The troglitazone arm was discontinued in June 1998 over liver toxicity, after a mean 0.9 years of treatment (range 0.5 to 1.5 years). During that exposure the diabetes incidence rate was 3.0 cases per 100 person-years on troglitazone against 12.0 on placebo (p<0.001), 6.7 on metformin (p=0.02 favouring troglitazone) and 5.1 on intensive lifestyle (p=0.18). The mechanism was improved insulin sensitivity with maintained insulin secretion.',
        evidenceSource:
          'Knowler WC et al., Diabetes 2005;54:1150-1156 (Diabetes Prevention Program Research Group)',
        doi: '10.2337/diabetes.54.4.1150',
        measuredMetric: 'Diabetes incidence per 100 person-years during troglitazone exposure',
        auditFlag: 'verified',
      },
      {
        id: 'tro-a2',
        category: 'failed',
        title: 'The prevention effect vanished the moment the drug stopped',
        laymanSummary:
          'In the three years after the troglitazone arm was stopped, new diabetes appeared at almost exactly the placebo rate. The drug had suppressed the disease, not altered its course.',
        technicalDetails:
          'Following withdrawal of troglitazone in June 1998, the DPP continued follow-up of all participants. Over the subsequent three years the diabetes incidence rate in the former troglitazone group was almost identical to that of the placebo group. The authors\' conclusion is precise and worth quoting in structure: troglitazone "markedly reduced the incidence of diabetes during its limited period of use, but this action did not persist." Whether a longer safe exposure to another thiazolidinedione would produce a durable effect they explicitly left undetermined.',
        evidenceSource: 'Knowler WC et al., Diabetes 2005;54:1150-1156',
        doi: '10.2337/diabetes.54.4.1150',
        measuredMetric: 'Diabetes incidence in the three years after troglitazone withdrawal',
        auditFlag: 'verified',
      },
      {
        id: 'tro-a3',
        category: 'measured',
        title: 'TRIPOD: annual diabetes incidence halved in women with prior gestational diabetes',
        laymanSummary:
          'In 266 Hispanic women who had had diabetes in pregnancy, the yearly rate of developing type 2 diabetes fell from 12.1% to 5.4%. Here the protection did persist for eight months after stopping.',
        technicalDetails:
          'Double-blind randomisation of women with previous gestational diabetes to placebo (n=133) or troglitazone 400 mg daily (n=133), with oral glucose tolerance tests annually and intravenous glucose tolerance tests at baseline and three months. Among the 236 women who returned for at least one follow-up visit, average annual diabetes incidence over a median 30 months on blinded medication was 12.1% on placebo and 5.4% on troglitazone (p<0.01). Protection was closely related to the reduction in endogenous insulin requirement at three months, persisted eight months after study medication stopped, and was associated with preserved beta-cell compensation for insulin resistance.',
        evidenceSource: 'Buchanan TA et al., Diabetes 2002;51:2796-2803 (TRIPOD)',
        doi: '10.2337/diabetes.51.9.2796',
        measuredMetric: 'Average annual diabetes incidence over a median 30 months',
        auditFlag: 'verified',
      },
      {
        id: 'tro-a4',
        category: 'failed',
        title: '94 cases of liver failure; 13% of acute cases recovered without transplantation',
        laymanSummary:
          'The FDA reviewed every reported case. Ninety-four people went into liver failure. Of the acute cases, only eleven recovered without needing a new liver.',
        technicalDetails:
          'Graham and colleagues at the FDA Office of Drug Safety abstracted all liver failure cases reported to the agency. Ninety-four cases were reported (89 acute, 5 chronic). Of the acute cases 58 (67%) were women and only 11 (13%) recovered without liver transplantation. The incidence of liver failure was elevated from the first month through at least the 26th month of use, so risk did not decline with continued exposure — it accumulated. Accounting for under-reporting, the estimated number needed to harm was between 600 and 1,500 patients treated for 26 months.',
        evidenceSource: 'Graham DJ, Green L, Senior JR, Nourjah P. Am J Med 2003;114:299-306',
        doi: '10.1016/S0002-9343(02)01529-2',
        measuredMetric: 'Reported liver failure cases and proportion recovering without transplant',
        auditFlag: 'verified',
      },
      {
        id: 'tro-a5',
        category: 'conclusion_shift',
        title: 'Monthly liver monitoring could not have worked, and it was not being done anyway',
        laymanSummary:
          'The plan for managing the risk was monthly blood tests. Nineteen patients went from normal liver function to irreversible injury inside a single month, and fewer than one user in twenty ever got the full test schedule.',
        technicalDetails:
          'Two findings, from the same FDA group, dismantle the risk-management strategy from both ends. Biologically: progression from normal hepatic function to irreversible liver injury occurred within one month in 19 patients, who were clinically indistinguishable from the 70 whose time course was unknown, leading the authors to cast doubt on the value of monthly aminotransferase monitoring as a means of prevention. Operationally: across four cohorts totalling 7,603 patients spanning April 1997 to September 1999, baseline testing rose from 15% before any FDA recommendation to 44.6% after four separate interventions, but follow-up testing after one month reached only 33.4% and fell to 13% by five months, and in every cohort fewer than 5% received all recommended tests by the third month. The conclusion was that FDA risk management efforts did not achieve meaningful or sustained improvement.',
        evidenceSource:
          'Graham DJ et al., Am J Med 2003;114:299-306; Graham DJ et al., JAMA 2001;286:831-833',
        doi: '10.1001/jama.286.7.831',
        auditFlag: 'verified',
      },
      {
        id: 'tro-a6',
        category: 'conclusion_shift',
        title: 'Withdrawn in the UK within weeks; sold in the US for two and a half more years',
        laymanSummary:
          'Britain pulled the drug within weeks of launching it. In the United States it went on to earn over two billion dollars before being withdrawn in March 2000.',
        technicalDetails:
          "Gale's contemporaneous account records the sequence: launched in the USA in March 1997, reached Europe later that year and was withdrawn within weeks on the grounds of liver toxicity, while generating sales of over US$2 billion in the USA and causing at least 90 cases of liver failure, 70 of which resulted in death or transplantation, before United States withdrawal in March 2000. His broader question about the class — how the glitazones achieved blockbuster status without clear evidence of advantage over existing therapy — was aimed at rosiglitazone and pioglitazone, and was answered seven years later by the rosiglitazone meta-analysis.",
        evidenceSource:
          'Gale EAM. Lessons from the glitazones: a story of drug development. Lancet 2001;357:1870-1875',
        doi: '10.1016/S0140-6736(00)04960-6',
        auditFlag: 'verified',
      },
      {
        id: 'tro-a7',
        category: 'inferred',
        title: 'The hepatotoxicity was inferred to be a class effect. It was not',
        laymanSummary:
          'When troglitazone was pulled there was a reasonable fear that all drugs of its type would poison the liver. Two others in the same class have now been used for over twenty years without that signal.',
        technicalDetails:
          "Troglitazone, pioglitazone and rosiglitazone share the thiazolidinedione head group and the PPAR-gamma target. Only troglitazone carries the alpha-tocopherol-derived chromanol tail, and only troglitazone produced fulminant hepatic failure at a measurable population rate. The distinction matters both ways: it means the receptor mechanism is not intrinsically hepatotoxic, and it means a shared pharmacological class tells you nothing reliable about a metabolic liability that arises from a substituent the other members do not have. The successor glitazones went on to fail for a different reason entirely — cardiovascular, in rosiglitazone's case — which is the same lesson from the other side.",
        evidenceSource:
          'Gale EAM. Lancet 2001;357:1870-1875; Graham DJ et al., Am J Med 2003;114:299-306',
        doi: '10.1016/S0140-6736(00)04960-6',
        inferredClaim:
          "That fulminant hepatotoxicity is a property of PPAR-gamma agonism, rather than of troglitazone's chromanol substituent",
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A once-daily tablet with food',
        laymanDesc:
          'Taken once a day with a meal, because it is fat-soluble and absorbed much better that way.',
        molecularDetail:
          'Highly lipophilic; oral absorption is substantially increased by food. Extensively metabolised in the liver, principally by sulfation and glucuronidation with a CYP3A4-mediated oxidative route that generates the reactive species.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Enters fat cells and liver cells and reaches the nucleus',
        laymanDesc:
          'Because it is greasy it passes straight through cell membranes and into the cell nucleus, where the switch it acts on lives.',
        molecularDetail:
          'Passive diffusion into adipocytes, hepatocytes and skeletal muscle. The target is a nuclear receptor, so the drug must reach the nuclear compartment rather than a surface receptor.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Binds PPAR-gamma and recruits the transcription machinery',
        laymanDesc:
          'It clamps onto a protein that sits on DNA and turns a whole programme of genes on at once.',
        molecularDetail:
          'The thiazolidinedione head binds the PPAR-gamma ligand-binding domain, stabilising helix 12, releasing corepressors and recruiting coactivators. The PPAR-gamma:RXR heterodimer then drives transcription at peroxisome proliferator response elements.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Fat is redistributed and insulin sensitivity returns',
        laymanDesc:
          'Fat is pulled back into fat cells and out of muscle and liver, so insulin starts working properly again without the pancreas being pushed harder.',
        molecularDetail:
          'Upregulation of adipocyte lipid storage genes, adiponectin secretion and GLUT4 expression, with reduced circulating free fatty acids and reduced ectopic lipid in liver and skeletal muscle. In DPP the effect was attributed to improved insulin sensitivity with maintenance of insulin secretion; in TRIPOD it was closely tied to reduced endogenous insulin requirement at three months.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Diabetes incidence falls; in a minority, the liver fails',
        laymanDesc:
          'New diabetes dropped to a quarter of the placebo rate. In a much smaller number of people the liver failed, sometimes within a month of being normal.',
        molecularDetail:
          'Measured endpoints: 3.0 versus 12.0 diabetes cases per 100 person-years in DPP, 5.4% versus 12.1% annual incidence in TRIPOD, against 94 reported liver failures with 13% of acute cases recovering without transplantation and a number needed to harm of 600 to 1,500 at 26 months.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Diabetes Prevention Program, troglitazone arm',
        phase: 'Phase 3 randomised prevention trial',
        sampleSize: 2343,
        primaryEndpoint:
          'Incidence of type 2 diabetes across four arms — troglitazone, metformin, placebo and intensive lifestyle intervention',
        endpointMet: true,
        statisticalPValue:
          '3.0 versus 12.0 cases/100 person-years against placebo, P < 0.001; versus metformin 6.7, P = 0.02; versus lifestyle 5.1, P = 0.18',
        unreportedAdverseSignals:
          'The troglitazone arm was terminated in June 1998 after a mean 0.9 years for liver toxicity, so the comparison rests on a much shorter exposure than the other three arms. The prevention effect did not persist after withdrawal.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'TRIPOD (Troglitazone in Prevention of Diabetes)',
        phase: 'Phase 3 randomised placebo-controlled prevention trial',
        sampleSize: 266,
        primaryEndpoint:
          'Onset of type 2 diabetes in Hispanic women with previous gestational diabetes, over a median 30 months on blinded medication',
        endpointMet: true,
        statisticalPValue: 'Average annual incidence 5.4% versus 12.1%, P < 0.01',
        unreportedAdverseSignals:
          'Thirty of the 266 randomised women did not return for any follow-up visit, so the incidence figures describe the 236 who did.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'FDA liver failure case series (Graham et al.)',
        phase: 'Postmarketing case series with survival analysis',
        sampleSize: 94,
        primaryEndpoint:
          'Clinical features, time course and cumulative incidence of troglitazone-associated liver failure',
        endpointMet: true,
        statisticalPValue:
          'Not a hypothesis test; estimated number needed to harm 600 to 1,500 patients at 26 months after adjustment for under-reporting',
        unreportedAdverseSignals:
          'Nineteen patients progressed from normal liver function to irreversible injury within one month and were clinically indistinguishable beforehand from those with a longer course.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Diabetes incidence 3.0 versus 12.0 cases per 100 person-years against placebo in the Diabetes Prevention Program',
        'Average annual diabetes incidence 5.4% versus 12.1% over a median 30 months in TRIPOD',
        '94 reported cases of liver failure, 89 acute, with only 13% of acute cases recovering without transplantation',
        'Fewer than 5% of users received the full recommended liver enzyme monitoring schedule by the third month of continuous use',
      ],
      unsupportedInferences: [
        'That monthly aminotransferase monitoring could prevent troglitazone hepatic failure, when 19 documented patients went from normal to irreversible inside one month',
        "That fulminant hepatotoxicity was a PPAR-gamma class effect rather than a property of troglitazone's chromanol tail",
        'That a prevention effect measured during treatment implies a lasting change in disease course — DPP showed the incidence returned to placebo levels after withdrawal',
      ],
      whatFailedInitially: [
        'Withdrawn in the United Kingdom within weeks of its 1997 European launch on liver toxicity grounds',
        'The Diabetes Prevention Program terminated its troglitazone arm in June 1998, less than two years into the trial',
        'United States withdrawal on 21 March 2000, after over US$2 billion of sales',
      ],
      realWorldOutcome: [
        'Drugs@FDA records NDA 020720 (REZULIN, Parke-Davis) as Discontinued',
        'Pioglitazone and rosiglitazone inherited the mechanism and the market, and neither has reproduced the hepatotoxicity',
        'The case is the standard example that a laboratory monitoring requirement is a risk-management strategy only if patients actually receive the tests and the injury is slow enough for the tests to catch it',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, once daily with food (200, 300 and 400 mg)',
      description:
        'Once-daily lipophilic tablet whose absorption depends on being taken with a meal. Hepatic metabolism by sulfation and glucuronidation with a CYP3A4 oxidative route; troglitazone is also a CYP3A4 inducer, which reduced the exposure of co-administered oral contraceptives.',
      safetyProfile:
        'Withdrawn from the United States on 21 March 2000 for idiosyncratic hepatocellular injury progressing to acute liver failure. The measured harms are 94 reported liver failure cases, 67% of acute cases in women, 13% recovering without transplantation, and an estimated number needed to harm of 600 to 1,500 at 26 months. Risk was elevated from the first month through at least the 26th, and progression to irreversibility within a single month was documented.',
    },
    commonQuestions: [
      {
        q: 'Was withdrawing it the right call, given that it prevented diabetes?',
        a: 'On the numbers, yes, and the numbers are unusually clear on both sides. The prevention effect was large — a drop from 12.0 to 3.0 diabetes cases per 100 person-years — but it disappeared entirely once the drug stopped, so it was suppression rather than cure. Against that sits an irreversible liver injury with a number needed to harm somewhere between 600 and 1,500 at 26 months, in which 87% of acute cases needed a transplant or died. Two other drugs hitting the same receptor were already available by 1999 without that liability. The trade only looks close if you stop reading at the efficacy result.',
        auditNote:
          'This page states both results at full strength deliberately. Presenting only the hepatotoxicity would make the withdrawal look obvious in a way the 1997 evidence was not.',
      },
      {
        q: 'Why did monthly liver tests not catch it?',
        a: 'Two separate reasons, both measured. The first is biological: in 19 documented patients the progression from normal liver function to irreversible injury happened inside a single month, and those patients looked no different beforehand from anyone else, so a monthly test can be normal and the patient can still be beyond rescue before the next one. The second is operational: across 7,603 patients, even after four escalating FDA interventions, fewer than 5% received the complete recommended testing schedule by month three. A monitoring plan is only a safety measure if the test frequency beats the disease speed and the tests actually happen. Neither held.',
      },
      {
        q: 'Are pioglitazone and rosiglitazone dangerous for the same reason?',
        a: 'No, and this is one of the clearer within-class distinctions in pharmacology. All three bind PPAR-gamma through the same thiazolidinedione head group, but only troglitazone carries a chromanol tail derived from vitamin E, and that phenolic tail forms reactive quinone species on oxidation. Pioglitazone and rosiglitazone have been used for more than twenty years without a comparable hepatic failure signal. Rosiglitazone did run into serious trouble, but the trouble was cardiovascular, which is a different question with a different answer.',
      },
      {
        q: 'Why does this page not show a price?',
        a: "Because the drug has had no market since March 2000 and Drugs@FDA lists the application as Discontinued. The one price figure that is documented and worth stating is the sales total: over US$2 billion in the United States before withdrawal, recorded in Gale's 2001 Lancet account.",
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Knowler WC et al. Prevention of type 2 diabetes with troglitazone in the Diabetes Prevention Program. Diabetes 2005;54:1150-1156',
        identifier: '10.2337/diabetes.54.4.1150',
        kind: 'doi',
      },
      {
        label:
          'Buchanan TA et al. Preservation of pancreatic beta-cell function and prevention of type 2 diabetes by pharmacological treatment of insulin resistance in high-risk Hispanic women (TRIPOD). Diabetes 2002;51:2796-2803',
        identifier: '10.2337/diabetes.51.9.2796',
        kind: 'doi',
      },
      {
        label:
          'Graham DJ, Green L, Senior JR, Nourjah P. Troglitazone-induced liver failure: a case study. Am J Med 2003;114:299-306',
        identifier: '10.1016/S0002-9343(02)01529-2',
        kind: 'doi',
      },
      {
        label:
          'Graham DJ et al. Liver enzyme monitoring in patients treated with troglitazone. JAMA 2001;286:831-833',
        identifier: '10.1001/jama.286.7.831',
        kind: 'doi',
      },
      {
        label:
          'Gale EAM. Lessons from the glitazones: a story of drug development. Lancet 2001;357:1870-1875',
        identifier: '10.1016/S0140-6736(00)04960-6',
        kind: 'doi',
      },
      {
        label:
          'Watkins PB, Whitcomb RW. Hepatic dysfunction associated with troglitazone. N Engl J Med 1998;338:916-917',
        identifier: '10.1056/NEJM199803263381314',
        kind: 'doi',
      },
      {
        label: 'Drugs@FDA: REZULIN (troglitazone), NDA 020720 — Discontinued',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020720',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 5591 — troglitazone structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5591',
        kind: 'url',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 5. Rimonabant
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'rimonabant',
    name: 'Rimonabant',
    tradeName: 'Acomplia / Zimulti',
    sponsor: 'Sanofi-Aventis',
    targetGene: 'CNR1',
    targetProtein: 'Cannabinoid receptor type 1 (CB1)',
    modality: 'Small Molecule',
    approvalStatus: 'Withdrawn from Market',
    approvalYear: 2006,
    indication:
      'Adjunct to diet and exercise for obesity (BMI at least 30 kg/m2) or overweight (BMI above 27 kg/m2) with associated risk factors such as type 2 diabetes or dyslipidaemia. Authorised in the European Union on 19 June 2006, marketing suspended on 13 November 2008 and the authorisation withdrawn on 16 January 2009. Never approved in the United States.',
    patientFriendlyIndication:
      'A weight-loss tablet that blocked the brain receptor cannabis acts on',
    anatomicalSite: 'Hypothalamic and mesolimbic CB1 receptors; also adipocyte and hepatic CB1',
    conditionContext: {
      conditionExplainer:
        'Cannabis increases appetite through the CB1 receptor. Rimonabant was the reverse: a molecule designed to block that receptor and suppress appetite, on the reasoning that if switching the system on makes people eat, switching it off should make them stop.',
      whyItMatters:
        'The reasoning was right about eating and did not account for what else the endocannabinoid system does. CB1 signalling is also involved in mood regulation, and blocking it produced depression, anxiety and suicide at rates that ended the drug in twenty-eight months.',
      whoTakesThis:
        'Nobody. It was marketed in Europe and in some fifty other countries between 2006 and late 2008, and was never available in the United States.',
      clinicalGoals:
        'Weight loss and improvement in metabolic risk factors. The trial that measured cardiovascular events instead of surrogates found no benefit and was stopped for psychiatric harm.',
    },
    oneSentenceVerdict:
      'A cannabinoid CB1 receptor blocker that produced 4.7 kg more weight loss than placebo at one year and doubled the rate of depressive-mood discontinuation, and whose 18,695-patient outcome trial was terminated early with a hazard ratio of 0.97 and four suicides against one.',
    laymanHowItWorks:
      'The body makes its own cannabis-like signalling molecules. They act on a receptor that, among other things, makes food more rewarding and increases appetite. Rimonabant blocked that receptor, so eating became less compelling and people lost weight. The same receptor is involved in mood, and blocking it made a substantial minority of people depressed or anxious. The two effects come from the same action and could not be separated.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 90,
    substitutes: {
      summary:
        'The GLP-1 receptor agonists occupy this space now and reach larger weight loss with a cardiovascular outcome benefit rather than a psychiatric cost. Orlistat acts in the gut and has no central effect at all. Peripherally restricted CB1 antagonists that do not cross the blood-brain barrier remain an active research route precisely because the metabolic benefit was real.',
      conventionalRx: [
        {
          name: 'Semaglutide 2.4 mg',
          class: 'GLP-1 receptor agonist',
          howItCompares:
            'Larger weight loss than rimonabant achieved, and a positive cardiovascular outcome trial where rimonabant returned a hazard ratio of 0.97. No comparable psychiatric signal has been established.',
          typicalCost: 'Not priced here — list price varies by country and payer',
          prosAndCons:
            'Pros: outcome benefit demonstrated, large effect size. Cons: injectable, expensive, gastrointestinal side effects.',
        },
        {
          name: 'Orlistat',
          class: 'Gastrointestinal lipase inhibitor',
          howItCompares:
            'Minimal systemic absorption and no central nervous system exposure, so no mood liability. Weight loss is smaller than the 4.7 kg placebo-adjusted figure rimonabant achieved.',
          typicalCost: 'Generic prescription and over-the-counter forms; not priced here',
          prosAndCons:
            'Pros: no psychiatric or cardiovascular signal. Cons: steatorrhoea, faecal urgency, reduced fat-soluble vitamin absorption.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC1=C(N(N=C1C(=O)NN2CCCCC2)C3=C(C=C(C=C3)Cl)Cl)C4=CC=C(C=C4)Cl',
      chemicalFormula: 'C22H21Cl3N4O',
      molecularWeight: '463.8 g/mol',
      targetReceptorAffinity:
        'A selective CB1 inverse agonist rather than a neutral antagonist — it suppresses constitutive receptor activity as well as blocking endocannabinoid binding, which is one proposed reason its mood effects exceeded what simple competitive blockade would predict. Selective for CB1 over CB2.',
      structureSource: {
        label: 'PubChem CID 104850 (rimonabant) — canonical SMILES, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/104850',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'rim-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity confirmation of the trichlorinated pyrazole carboxamide',
          description:
            'Confirm the three chlorine positions and the piperidinyl hydrazide by high-resolution mass spectrometry, reading the chlorine isotope envelope. With three chlorines the M+2 and M+4 pattern is diagnostic and separates rimonabant from the many pyrazole analogues that circulate as research chemicals.',
          reagentsAndBuffer:
            'Rimonabant certified reference standard, deuterated chloroform for NMR, high-resolution LC-MS with electrospray in positive mode, expected protonated ion at m/z 463 with a three-chlorine isotope cluster',
        },
        {
          id: 'rim-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Purity assay and screening in unlicensed weight-loss products',
          description:
            'Rimonabant has appeared as an undeclared ingredient in products sold online for weight loss since its withdrawal, so the assay problem is both tablet purity and detection in an uncontrolled matrix. Reversed-phase HPLC with photodiode array and MS confirmation is the standard approach.',
          dependsOnStepId: 'rim-w1',
          reagentsAndBuffer:
            'C18 column, acetonitrile with ammonium formate gradient, photodiode array detection at 220 and 254 nm, triple-quadrupole MS confirmation with matrix-matched calibration',
        },
        {
          id: 'rim-w3',
          stepNumber: 3,
          phase: 'Assay_Quantification',
          name: 'CB1 and CB2 radioligand binding for selectivity',
          description:
            'Measure displacement of a labelled cannabinoid ligand from membranes expressing human CB1 and, separately, CB2, to derive Ki values at both. Selectivity is the number that defines this molecule, and testing only CB1 records half of it.',
          dependsOnStepId: 'rim-w2',
          reagentsAndBuffer:
            'Membranes from CHO or HEK293 cells stably expressing human CNR1 or CNR2, [3H]-CP-55,940 as radioligand, Tris-HCl binding buffer with bovine serum albumin, glass-fibre filtration and scintillation counting',
        },
        {
          id: 'rim-w4',
          stepNumber: 4,
          phase: 'Assay_Quantification',
          name: 'Inverse-agonism readout by cAMP accumulation and GTP-gamma-S',
          description:
            'Distinguish inverse agonism from neutral antagonism: measure whether the compound raises basal cAMP above the unliganded level in CB1-expressing cells, and whether it reduces basal GTP-gamma-S binding. This is the assay that separates rimonabant from a plain blocker and is central to the mechanistic argument about its psychiatric effects.',
          dependsOnStepId: 'rim-w3',
          reagentsAndBuffer:
            'CB1-expressing CHO cells, forskolin-stimulated and unstimulated cAMP HTRF assay, [35S]-GTP-gamma-S with membrane preparations and GDP, reference neutral antagonist as comparator',
        },
      ],
    },
    keyAudits: [
      {
        id: 'rim-a1',
        category: 'measured',
        title: 'RIO-Europe: 6.6 kg lost at one year on 20 mg against 1.8 kg on placebo',
        laymanSummary:
          'In the European registration trial, patients on the full dose lost about six and a half kilograms in a year against under two on placebo, with better waist, HDL cholesterol and triglycerides.',
        technicalDetails:
          'Patients with BMI at least 30 kg/m2, or above 27 kg/m2 with treated or untreated dyslipidaemia or hypertension, randomised double-blind to placebo, rimonabant 5 mg or rimonabant 20 mg once daily on a 600 kcal/day deficit diet. Weight change at one year in the intention-to-treat population was -6.6 kg (SD 7.2) on 20 mg (p<0.001 versus placebo), -3.4 kg (SD 5.7) on 5 mg (p=0.002), and -1.8 kg (SD 6.4) on placebo. Significantly more patients on 20 mg achieved 5% and 10% weight loss (both p<0.001), with greater improvements in waist circumference, HDL cholesterol, triglycerides, insulin resistance and metabolic syndrome prevalence. The paper described rimonabant as "generally well tolerated with mild and transient side effects".',
        evidenceSource: 'Van Gaal LF et al., Lancet 2005;365:1389-1397 (RIO-Europe)',
        doi: '10.1016/S0140-6736(05)66374-X',
        measuredMetric: 'Weight change from baseline at one year, intention to treat',
        auditFlag: 'verified',
      },
      {
        id: 'rim-a2',
        category: 'measured',
        title:
          'Meta-analysis: 4.7 kg placebo-adjusted weight loss, and a number needed to harm of 25',
        laymanSummary:
          'Pooling four trials in 4,105 people, the drug produced 4.7 kilograms more weight loss than placebo. It also produced one extra adverse event for every twenty-five people treated.',
        technicalDetails:
          'Christensen et al. pooled four double-blind randomised controlled trials of rimonabant 20 mg daily against placebo, 4,105 participants, searched to July 2007. Placebo-adjusted weight reduction at one year was 4.7 kg (95% CI 4.1 to 5.3, p<0.0001). Adverse events were significantly more common on rimonabant (OR 1.4, p=0.0007, number needed to harm 25, 95% CI 17 to 58) and serious adverse events 1.4 times more common (OR 1.4, p=0.03, NNH 59, 95% CI 27 to 830).',
        evidenceSource: 'Christensen R et al., Lancet 2007;370:1706-1713',
        doi: '10.1016/S0140-6736(07)61721-8',
        measuredMetric: 'Placebo-adjusted weight reduction at one year and number needed to harm',
        auditFlag: 'verified',
      },
      {
        id: 'rim-a3',
        category: 'measured',
        title:
          'Depression discontinuation was 2.5 times more likely — in trials that excluded depressed patients',
        laymanSummary:
          'People on the drug were two and a half times more likely to stop it because of depressed mood. That happened even though anyone with depression had been kept out of the trials to begin with.',
        technicalDetails:
          'In the same pooled analysis, patients given rimonabant were 2.5 times more likely to discontinue treatment because of depressive mood disorders (OR 2.5, p=0.01, number needed to harm 49, 95% CI 19 to 316), and anxiety caused significantly more discontinuation on rimonabant than placebo (OR 3.0, p=0.03, NNH 166, 95% CI 47 to 3,716). The authors flag the crucial qualifier themselves: this occurred "despite depressed mood being an exclusion criterion in these trials", so the trial populations were selected to under-represent exactly the risk that materialised. They coupled the finding to the contemporaneous FDA determination of increased suicide risk during rimonabant treatment.',
        evidenceSource: 'Christensen R et al., Lancet 2007;370:1706-1713',
        doi: '10.1016/S0140-6736(07)61721-8',
        measuredMetric:
          'Odds ratio for treatment discontinuation due to depressive mood disorders and anxiety',
        auditFlag: 'verified',
      },
      {
        id: 'rim-a4',
        category: 'failed',
        title: 'CRESCENDO: no cardiovascular benefit, hazard ratio 0.97, and the trial was stopped',
        laymanSummary:
          'The 18,695-patient trial that was supposed to prove the drug prevented heart attacks and strokes found no difference at all, and was halted early because regulators in three countries were concerned about suicides.',
        technicalDetails:
          'Double-blind, placebo-controlled, 974 hospitals in 42 countries, 18,695 patients with manifest or increased risk of vascular disease randomised to rimonabant 20 mg (n=9,381) or placebo (n=9,314). At a mean follow-up of 13.8 months (95% CI 13.6 to 14.0) the trial was prematurely discontinued because of concerns raised by health regulatory authorities in three countries about suicide in patients receiving rimonabant. At trial close on 6 November 2008 the composite primary endpoint of cardiovascular death, myocardial infarction or stroke had occurred in 364 (3.9%) on rimonabant and 375 (4.0%) on placebo, hazard ratio 0.97 (95% CI 0.84 to 1.12, p=0.68). Gastrointestinal events 33% versus 22%, neuropsychiatric events 32% versus 21%, serious psychiatric side effects 232 (2.5%) versus 120 (1.3%). Four patients on rimonabant and one on placebo died by suicide.',
        evidenceSource: 'Topol EJ et al., Lancet 2010;376:517-523 (CRESCENDO, NCT00263042)',
        doi: '10.1016/S0140-6736(10)60935-X',
        measuredMetric:
          'Composite of cardiovascular death, myocardial infarction or stroke, centrally adjudicated',
        auditFlag: 'verified',
      },
      {
        id: 'rim-a5',
        category: 'inferred',
        title: 'Metabolic surrogates moved. The endpoint they were standing in for did not',
        laymanSummary:
          'Weight, waist, HDL cholesterol, triglycerides and insulin resistance all improved. When the trial finally measured heart attacks and strokes directly, the result was exactly nothing.',
        technicalDetails:
          'RIO-Europe reported significant improvements against placebo in waist circumference, HDL cholesterol, triglycerides, insulin resistance and metabolic syndrome prevalence alongside the weight result, and the drug was authorised in Europe on that basis in June 2006. CRESCENDO tested the endpoint those surrogates were proxies for, in 18,695 patients at elevated vascular risk, and returned a hazard ratio of 0.97 (0.84 to 1.12). The surrogate improvements were real measurements; the inference that they carried a cardiovascular benefit was not supported when tested. Topol and colleagues drew the general lesson explicitly: a drug marketed for weight loss but tested for cardiovascular outcomes turned out to have a level of serious neuropsychiatric effect that regulators judged unacceptable.',
        evidenceSource:
          'Van Gaal LF et al., Lancet 2005;365:1389-1397; Topol EJ et al., Lancet 2010;376:517-523',
        doi: '10.1016/S0140-6736(10)60935-X',
        inferredClaim:
          'That improvement in weight, waist circumference, HDL cholesterol, triglycerides and insulin resistance would translate into fewer cardiovascular events',
        auditFlag: 'caution',
      },
      {
        id: 'rim-a6',
        category: 'conclusion_shift',
        title: 'Authorised June 2006, suspended November 2008, withdrawn January 2009',
        laymanSummary:
          'Europe licensed the drug and then took it off the market twenty-eight months later. The United States never approved it at all.',
        technicalDetails:
          'The European Commission granted marketing authorisation for Acomplia on 19 June 2006 as an adjunct to diet and exercise in obese patients or overweight patients with associated risk factors. Marketing was suspended on 13 November 2008. Sanofi-Aventis then withdrew the authorisation on 16 January 2009, stating that no additional clinical data would become available to lift the suspension following the decision to discontinue the rimonabant clinical development programme in all indications. The United States never approved the drug; Christensen et al. cite the contemporaneous FDA finding of increased suicide risk during rimonabant treatment.',
        evidenceSource:
          'European Medicines Agency, Acomplia (rimonabant) EPAR — authorisation 19 June 2006, suspension 13 November 2008, withdrawal 16 January 2009',
        auditFlag: 'verified',
      },
      {
        id: 'rim-a7',
        category: 'inferred',
        title:
          'The first trial called it "generally well tolerated". The pooled data did not agree',
        laymanSummary:
          'The registration trial described side effects as mild and transient. Two years later, pooling four trials showed one extra adverse event per twenty-five treated and two and a half times the depression dropout.',
        technicalDetails:
          'RIO-Europe\'s published interpretation described rimonabant as "generally well tolerated with mild and transient side effects". The characterisation was not fabricated — it reflected what a single one-year trial with depressed mood as an exclusion criterion could see. What it could not see was the pooled signal: OR 1.4 for any adverse event with a number needed to harm of 25, OR 2.5 for depressive-mood discontinuation, OR 3.0 for anxiety discontinuation, and ultimately serious psychiatric events at 2.5% versus 1.3% in 18,695 patients. The gap between the two statements is the gap between a registration trial\'s power for safety and its power for efficacy, which are never the same number.',
        evidenceSource:
          'Van Gaal LF et al., Lancet 2005;365:1389-1397; Christensen R et al., Lancet 2007;370:1706-1713',
        doi: '10.1016/S0140-6736(07)61721-8',
        inferredClaim:
          'That "generally well tolerated with mild and transient side effects" in a one-year trial with depression excluded described the drug\'s safety profile in the population that would receive it',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A once-daily 20 mg tablet',
        laymanDesc: 'One tablet a day alongside a reduced-calorie diet.',
        molecularDetail:
          'Oral once-daily dosing at 5 or 20 mg. Highly lipophilic with a long half-life and extensive hepatic metabolism, principally by CYP3A4 and amidohydrolase.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Crosses into the brain',
        laymanDesc:
          'It passes readily into brain tissue, which is where the appetite effect comes from and also where the mood problem comes from.',
        molecularDetail:
          'High blood-brain barrier penetration reaching hypothalamic and mesolimbic CB1 populations. Peripheral CB1 in adipose tissue, liver and skeletal muscle is also engaged, which is the basis of the current interest in peripherally restricted successors.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Blocks and inverts CB1 signalling',
        laymanDesc:
          "It occupies the receptor that the body's own cannabis-like molecules use, and pushes it below its resting level of activity rather than simply blocking it.",
        molecularDetail:
          'Selective CB1 inverse agonism: it displaces anandamide and 2-arachidonoylglycerol from the orthosteric site and additionally suppresses constitutive CB1 activity, raising basal cAMP above the unliganded baseline in CB1-expressing cells.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Food reward falls — and so does mood, in a minority',
        laymanDesc:
          'Eating becomes less rewarding and appetite drops. The same receptor is part of the system that regulates mood, so a substantial minority became depressed or anxious.',
        molecularDetail:
          'Reduced endocannabinoid tone in hypothalamic feeding circuits and mesolimbic reward pathways lowers energy intake; peripheral CB1 blockade improves adipocyte and hepatic lipid handling, which is why HDL and triglycerides moved more than weight alone would predict. The same loss of endocannabinoid tone in limbic circuits is the accepted explanation for the depression and anxiety.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Weight falls; cardiovascular events do not; psychiatric events rise',
        laymanDesc:
          'Weight loss was real and repeated. Heart attacks and strokes were unchanged. Serious psychiatric events roughly doubled.',
        molecularDetail:
          'Measured endpoints: 4.7 kg placebo-adjusted weight loss at one year across four trials; composite cardiovascular hazard ratio 0.97 (0.84 to 1.12) in 18,695 patients; serious psychiatric side effects 2.5% versus 1.3%; four suicides against one.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'RIO-Europe',
        phase: 'Phase 3 randomised placebo-controlled trial',
        sampleSize: 4105,
        primaryEndpoint:
          'Weight change from baseline after one year of treatment, intention to treat (pooled figure below is the four-trial meta-analysis population)',
        endpointMet: true,
        statisticalPValue:
          '-6.6 kg on 20 mg versus -1.8 kg on placebo, P < 0.001; pooled placebo-adjusted 4.7 kg (95% CI 4.1 to 5.3)',
        unreportedAdverseSignals:
          'Depressed mood was an exclusion criterion, so the trial population was selected against the risk that later ended the drug. The published interpretation described tolerability as "mild and transient".',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'CRESCENDO (NCT00263042)',
        phase: 'Phase 3 cardiovascular outcomes trial',
        sampleSize: 18695,
        primaryEndpoint:
          'Composite of cardiovascular death, myocardial infarction or stroke, centrally adjudicated',
        endpointMet: false,
        statisticalPValue: 'Hazard ratio 0.97 (95% CI 0.84 to 1.12), P = 0.68',
        unreportedAdverseSignals:
          'Terminated early at a mean 13.8 months on regulatory concern about suicide. Serious psychiatric side effects 2.5% versus 1.3%; four suicides on rimonabant against one on placebo.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Placebo-adjusted weight reduction of 4.7 kg at one year across four trials and 4,105 participants',
        'Odds ratio 2.5 for discontinuation due to depressive mood disorders, in trials that excluded depressed patients',
        'Composite cardiovascular hazard ratio 0.97 (95% CI 0.84 to 1.12) in 18,695 patients',
        'Serious psychiatric side effects in 2.5% versus 1.3%, and four suicides against one',
      ],
      unsupportedInferences: [
        'That improvements in weight, waist circumference, HDL cholesterol, triglycerides and insulin resistance would produce fewer cardiovascular events',
        'That "generally well tolerated with mild and transient side effects" in a one-year registration trial described the safety profile of the marketed drug',
      ],
      whatFailedInitially: [
        'CRESCENDO missed its primary endpoint outright and was terminated early for psychiatric harm',
        'European marketing suspended 13 November 2008 and the authorisation withdrawn 16 January 2009, 28 months after approval',
        'Never approved in the United States',
      ],
      realWorldOutcome: [
        'Sanofi-Aventis discontinued the rimonabant clinical development programme in all indications',
        'The episode is one of the strongest arguments in the modern record for requiring cardiovascular outcome data before, not after, approval of a metabolic drug',
        'CB1 remains a validated metabolic target; the research route that survived is peripherally restricted antagonists that do not enter the brain',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, once daily (5 and 20 mg)',
      description:
        'Once-daily oral tablet taken with a reduced-calorie diet. Highly lipophilic with substantial brain penetration, which is both the source of the appetite effect and the reason the psychiatric liability could not be engineered away without changing the molecule.',
      safetyProfile:
        'Suspended and withdrawn in Europe in 2008 and 2009 for psychiatric adverse events including depression, anxiety and suicide. The measured harms are an odds ratio of 2.5 for depressive-mood discontinuation and 3.0 for anxiety discontinuation in pooled trials, serious psychiatric side effects in 2.5% versus 1.3% of 18,695 patients, and four suicides against one. Gastrointestinal events occurred in 33% versus 22%.',
    },
    commonQuestions: [
      {
        q: 'If it caused depression, why did the registration trials not show it?',
        a: 'They partly did, and their design partly prevented it. RIO-Europe excluded people with depressed mood at entry, which removes the most susceptible group from the sample before randomisation. It also ran for one year in roughly 1,500 people, which gives ample power for a weight endpoint and very little for an uncommon psychiatric one. When four such trials were pooled into 4,105 participants, depressive-mood discontinuation showed an odds ratio of 2.5 even in that filtered population. When 18,695 unfiltered patients were followed, serious psychiatric events came in at 2.5% against 1.3%. The signal did not appear from nowhere; it appeared as soon as the sample was large enough and unselected enough to show it.',
        auditNote:
          'The exclusion criterion is the load-bearing detail here, and Christensen et al. flag it themselves. A safety result from a population screened to remove the relevant risk factor describes a different population from the one that gets the prescription.',
      },
      {
        q: 'Was the weight loss worth anything?',
        a: 'It was real and it was repeatable — 4.7 kg more than placebo at one year, pooled across four randomised trials, with better waist circumference, HDL cholesterol and triglycerides alongside it. What it was not is evidence of benefit at the level people actually care about. CRESCENDO enrolled 18,695 patients at elevated vascular risk to find out whether all that translated into fewer heart attacks and strokes, and the answer was a hazard ratio of 0.97 with a confidence interval sitting squarely across 1. Weight came down; the thing weight is a proxy for did not move.',
      },
      {
        q: 'Is blocking the cannabinoid receptor a dead idea?',
        a: 'Not entirely, and the reason is anatomical rather than pharmacological. CB1 receptors sit in the brain, where blocking them suppresses appetite and disturbs mood, and also in fat, liver and muscle, where blocking them improves lipid handling and insulin sensitivity directly. Rimonabant hit both because it crossed the blood-brain barrier freely. The research route that survived the withdrawal is peripherally restricted CB1 antagonists designed not to enter the brain at all, on the argument that the metabolic benefit and the psychiatric harm are separable by distribution even though they were not separable by dose.',
      },
      {
        q: 'Why does this page not show a price?',
        a: 'Because the drug has had no legal market anywhere since the European authorisation was withdrawn on 16 January 2009, and it was never approved in the United States, so there is no current list price and no verified per-dose manufacturing cost to quote.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Van Gaal LF et al. Effects of the cannabinoid-1 receptor blocker rimonabant on weight reduction and cardiovascular risk factors in overweight patients: 1-year experience from the RIO-Europe study. Lancet 2005;365:1389-1397',
        identifier: '10.1016/S0140-6736(05)66374-X',
        kind: 'doi',
      },
      {
        label:
          'Christensen R et al. Efficacy and safety of the weight-loss drug rimonabant: a meta-analysis of randomised trials. Lancet 2007;370:1706-1713',
        identifier: '10.1016/S0140-6736(07)61721-8',
        kind: 'doi',
      },
      {
        label:
          'Topol EJ et al. Rimonabant for prevention of cardiovascular events (CRESCENDO): a randomised, multicentre, placebo-controlled trial. Lancet 2010;376:517-523',
        identifier: '10.1016/S0140-6736(10)60935-X',
        kind: 'doi',
      },
      {
        label:
          'CRESCENDO — Comprehensive Rimonabant Evaluation Study of Cardiovascular Endpoints and Outcomes',
        identifier: 'NCT00263042',
        kind: 'nct',
      },
      {
        label:
          'European Medicines Agency: Acomplia (rimonabant) — authorised 19 June 2006, marketing suspended 13 November 2008, authorisation withdrawn 16 January 2009',
        identifier: 'https://www.ema.europa.eu/en/medicines/human/EPAR/acomplia',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 104850 — rimonabant structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/104850',
        kind: 'url',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 6. Fenfluramine — withdrawn 1997, re-approved 2020
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'fenfluramine',
    name: 'Fenfluramine',
    tradeName: 'Fintepla (2020); formerly Pondimin, and half of "fen-phen"',
    sponsor: 'Zogenix, acquired by UCB (NDA 212102); originally A.H. Robins / Wyeth-Ayerst',
    targetGene: 'SLC6A4 and HTR2C',
    targetProtein:
      'Serotonin transporter (SERT) as a substrate-type releasing agent, with agonism at 5-HT2C and 5-HT1D and activity at the sigma-1 receptor',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2020,
    indication:
      'Seizures associated with Dravet syndrome and Lennox-Gastaut syndrome in patients aged 2 years and older, under a restricted REMS with mandatory echocardiography. Approved as an appetite suppressant in 1973 and withdrawn on 15 September 1997 for valvular heart disease; re-approved as Fintepla on 25 June 2020, with the Lennox-Gastaut indication added 25 March 2022.',
    patientFriendlyIndication:
      'Seizures in two severe childhood epilepsies — the same molecule that was once a diet pill',
    anatomicalSite:
      'Serotonergic nerve terminals; the toxicity site is the 5-HT2B receptor on cardiac valve fibroblasts',
    conditionContext: {
      conditionExplainer:
        'Dravet syndrome is a genetic epilepsy that begins in the first year of life, is resistant to most anticonvulsants, and carries a high rate of sudden unexpected death. Lennox-Gastaut syndrome is a similarly refractory childhood epileptic encephalopathy with multiple seizure types.',
      whyItMatters:
        'This is the same molecule, at a tenth of the anorectic dose, in a different disease, with mandatory echocardiography and a restricted distribution programme. Nothing about the pharmacology changed. What changed was the illness on the other side of the trade, and the monitoring around it.',
      whoTakesThis:
        'Children and adults aged two and over with Dravet or Lennox-Gastaut syndrome, dispensed only through the FINTEPLA REMS. Between 1973 and 1997 it was taken by millions of people for weight loss, most famously in the unapproved fenfluramine-phentermine combination.',
      clinicalGoals:
        'Reduce convulsive seizure frequency in an epilepsy where most drugs do not work. Not weight loss, and not at anything like the weight-loss dose.',
    },
    oneSentenceVerdict:
      'The clearest reversal in modern pharmacology: withdrawn in 1997 after echocardiography found valve disease in fen-phen users, and re-approved in 2020 after cutting median convulsive seizures in Dravet syndrome by 74.9% against 19.2% on placebo, with echocardiography now built into the label.',
    laymanHowItWorks:
      'Fenfluramine forces nerve cells to dump their stored serotonin into the gap between cells and then stops it being cleared away. At the doses used for weight loss, the flood of serotonin reached receptors on heart valve tissue and made the valves thicken and leak. At the much lower doses used in epilepsy, the same serotonin release calms the runaway electrical activity that produces seizures — and every patient has their valves scanned before, during and after treatment because the mechanism that caused the damage has not gone anywhere.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 88,
    substitutes: {
      summary:
        'In Dravet syndrome the realistic alternatives are stiripentol, cannabidiol and clobazam, and fenfluramine has been tested added on top of stiripentol-inclusive regimens rather than against them. As an appetite suppressant the molecule has no successor: the whole serotonin-releasing anorectic class was abandoned after 1997.',
      conventionalRx: [
        {
          name: 'Stiripentol',
          class: 'Anticonvulsant, GABA-A positive allosteric modulator and CYP inhibitor',
          howItCompares:
            'Standard of care in Dravet syndrome in much of Europe. Fenfluramine was tested as an add-on in patients already on stiripentol-inclusive regimens, which is a harder test than a comparison against it.',
          typicalCost: 'Not priced here — orphan drug pricing varies by country and payer',
          prosAndCons:
            'Pros: established in Dravet, no valvular signal. Cons: substantial drug interactions through CYP inhibition, sedation.',
        },
        {
          name: 'Cannabidiol (pharmaceutical grade)',
          class: 'Anticonvulsant of uncertain mechanism',
          howItCompares:
            'Also approved for Dravet and Lennox-Gastaut syndrome on randomised placebo-controlled trials, with no cardiac monitoring requirement.',
          typicalCost: 'Not priced here',
          prosAndCons:
            'Pros: no echocardiography requirement, separate mechanism. Cons: transaminase elevations, sedation, and a major interaction with clobazam.',
        },
        {
          name: 'Clobazam',
          class: 'Benzodiazepine',
          howItCompares:
            'Background therapy in most Dravet regimens rather than an alternative. Both fenfluramine trials were add-on designs on top of existing antiepileptics.',
          typicalCost: 'Generic; not priced here',
          prosAndCons:
            'Pros: cheap, familiar, effective. Cons: tolerance, sedation, and behavioural effects in children.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CCNC(C)CC1=CC(=CC=C1)C(F)(F)F',
      chemicalFormula: 'C12H16F3N',
      molecularWeight: '231.26 g/mol (free base); marketed as fenfluramine hydrochloride',
      targetReceptorAffinity:
        'A substrate-type serotonin releasing agent rather than a reuptake blocker: it is transported into the terminal by SERT and reverses the transporter. Its metabolite norfenfluramine is a potent 5-HT2B agonist, and 5-HT2B on cardiac valve fibroblasts is the receptor that produces the valvulopathy. Fenfluramine also has sigma-1 receptor activity that has been proposed as part of the anticonvulsant effect.',
      structureSource: {
        label: 'PubChem CID 3337 (fenfluramine) — canonical SMILES, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3337',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'fen-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity and enantiomeric purity',
          description:
            'Confirm the meta-trifluoromethyl substitution and resolve the enantiomers. Fenfluramine is marketed as the racemate; dexfenfluramine, the separately withdrawn S-enantiomer, has a different receptor profile, so a chiral assay is identification and not just purity.',
          reagentsAndBuffer:
            'Fenfluramine hydrochloride certified reference standard, chiral stationary-phase HPLC, 19F NMR for the trifluoromethyl group, LC-MS with electrospray in positive mode',
        },
        {
          id: 'fen-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Norfenfluramine content and stability',
          description:
            'Quantify the N-de-ethylated metabolite norfenfluramine, which carries the 5-HT2B agonism responsible for valvulopathy. Any assay that reports only the parent understates the pharmacologically important exposure.',
          dependsOnStepId: 'fen-w1',
          reagentsAndBuffer:
            'C18 column, acetonitrile with ammonium formate gradient, triple-quadrupole MS in multiple reaction monitoring, deuterated fenfluramine and norfenfluramine internal standards',
        },
        {
          id: 'fen-w3',
          stepNumber: 3,
          phase: 'Assay_Quantification',
          name: '5-HT2B receptor functional assay — the valvulopathy screen',
          description:
            'This is the assay that turned an epidemiological association into a mechanism, and it is now run routinely on any candidate with serotonergic activity. Measure inositol phosphate accumulation or calcium mobilisation at recombinant human 5-HT2B for fenfluramine and, critically, for norfenfluramine. A compound with meaningful 5-HT2B agonist activity is presumed valvulopathic until shown otherwise.',
          dependsOnStepId: 'fen-w2',
          reagentsAndBuffer:
            'CHO or HEK293 cells stably expressing human HTR2B, IP-One HTRF accumulation assay or Fluo-4 calcium flux, serotonin as reference full agonist, 5-HT2B antagonist for specificity',
        },
        {
          id: 'fen-w4',
          stepNumber: 4,
          phase: 'Assay_Quantification',
          name: 'Serotonin release and transporter reversal',
          description:
            'Distinguish releasing agent from reuptake inhibitor: preload SERT-expressing cells or synaptosomes with tritiated serotonin and measure efflux rather than uptake blockade. This is the pharmacological difference between fenfluramine and sibutramine, and it is the difference that explains why only one of them damaged heart valves.',
          dependsOnStepId: 'fen-w3',
          reagentsAndBuffer:
            'Rat brain synaptosomes or HEK293 cells expressing human SLC6A4, [3H]-5-hydroxytryptamine preload, superfusion apparatus, reference releaser and reference reuptake inhibitor as controls',
        },
        {
          id: 'fen-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Valve interstitial cell proliferation assay',
          description:
            'Expose primary human cardiac valve interstitial cells to norfenfluramine and measure mitogenesis, transforming growth factor beta signalling and glycosaminoglycan deposition. This reproduces in a dish the plaque-like leaflet encasement that the 1997 pathology described.',
          dependsOnStepId: 'fen-w4',
          reagentsAndBuffer:
            'Primary human aortic or mitral valve interstitial cells, bromodeoxyuridine incorporation assay, TGF-beta and alpha-smooth muscle actin immunoblot, 5-HT2B antagonist rescue arm',
        },
      ],
    },
    keyAudits: [
      {
        id: 'fen-a1',
        category: 'measured',
        title: 'Twenty-four women, valve disease in every one, and carcinoid-identical pathology',
        laymanSummary:
          'A Mayo Clinic series described 24 women on fen-phen with no prior heart disease. Every one had abnormal, leaking heart valves. Under the microscope the damage was indistinguishable from carcinoid or ergot valve disease.',
        technicalDetails:
          'Twenty-four women, mean age 44 (SD 8), evaluated a mean 12.3 (SD 7.1) months after starting fenfluramine-phentermine, all with no history of cardiac disease, presenting with cardiovascular symptoms or a murmur. Echocardiography showed unusual valvular morphology and regurgitation in all 24, involving both right- and left-sided valves. Eight also had newly documented pulmonary hypertension, and five required cardiac surgery. The valves had a glistening white appearance, with plaque-like encasement of leaflets and chordal structures and intact underlying valve architecture — histopathological features the authors describe as identical to carcinoid or ergotamine-induced valve disease. That identity is what pointed at the 5-HT2B receptor and turned a case series into a mechanism. In 1996, United States prescriptions for fenfluramine and phentermine exceeded 18 million.',
        evidenceSource: 'Connolly HM et al., N Engl J Med 1997;337:581-588',
        doi: '10.1056/NEJM199708283370901',
        measuredMetric: 'Echocardiographic valvular regurgitation and histopathology in 24 women',
        auditFlag: 'verified',
      },
      {
        id: 'fen-a2',
        category: 'measured',
        title:
          'Population data: 35 per 10,000 at four months or more, and zero for phentermine alone',
        laymanSummary:
          'A study of nearly twenty thousand people found the valve risk rose sharply with duration, and found no cases at all in people who took only phentermine or no appetite suppressant.',
        technicalDetails:
          'Population-based follow-up with nested case-control analysis: 6,532 subjects on dexfenfluramine, 2,371 on fenfluramine, 862 on phentermine, and 9,281 obese controls matched for age, sex and weight who had taken no appetite suppressant, all free of diagnosed cardiovascular disease at baseline, mean follow-up about four years. Eleven newly diagnosed idiopathic valvular disorders occurred, five after dexfenfluramine and six after fenfluramine — six aortic, two mitral, three combined. Five-year cumulative incidence per 10,000: 0 in untreated controls (95% CI 0 to 15.4), 0 in phentermine-only users (95% CI 0 to 76.6), 7.1 for fenfluramine or dexfenfluramine under four months (95% CI 3.6 to 17.8, p=0.02), and 35.0 for four months or more (95% CI 16.4 to 76.2, p<0.001).',
        evidenceSource: 'Jick H et al., N Engl J Med 1998;339:719-724',
        doi: '10.1056/NEJM199809103391102',
        measuredMetric:
          'Five-year cumulative incidence of idiopathic valvular disorders per 10,000',
        auditFlag: 'verified',
      },
      {
        id: 'fen-a3',
        category: 'measured',
        title: 'Pulmonary hypertension odds ratio 23.1 beyond three months of use',
        laymanSummary:
          'A separate European study found that appetite suppressants raised the risk of primary pulmonary hypertension six-fold overall, and twenty-three-fold in people who took them for more than three months.',
        technicalDetails:
          'Case-control study of 95 patients with primary pulmonary hypertension from 35 centres in France, Belgium, the United Kingdom and the Netherlands, against 355 general-practice controls matched for age and sex. Any anorexic drug use gave an odds ratio of 6.3 (95% CI 3.0 to 13.2); use in the preceding year 10.1 (3.4 to 29.9); total use exceeding three months 23.1 (6.9 to 77.7). The drugs involved were mainly fenfluramine derivatives. The paper appeared in August 1996, a year before the valvular findings, and its closing recommendation — active surveillance, "particularly since their use is expected to increase in the near future" — reads very differently in hindsight.',
        evidenceSource:
          'Abenhaim L et al., N Engl J Med 1996;335:609-616 (International Primary Pulmonary Hypertension Study Group)',
        doi: '10.1056/NEJM199608293350901',
        measuredMetric:
          'Odds ratio for primary pulmonary hypertension by duration of anorexic drug use',
        auditFlag: 'verified',
      },
      {
        id: 'fen-a4',
        category: 'conclusion_shift',
        title:
          'Withdrawn 1997, re-approved 2020 — same molecule, different disease, different dose',
        laymanSummary:
          'The FDA asked for fenfluramine to be pulled in September 1997. Twenty-three years later it approved the same drug for a severe childhood epilepsy, at a fraction of the dose, with heart scans written into the label.',
        technicalDetails:
          'Fenfluramine was approved as an anorectic in 1973 and withdrawn at FDA request on 15 September 1997 alongside dexfenfluramine. Zogenix took the same molecule into Dravet syndrome at 0.2 to 0.7 mg/kg per day — roughly a tenth of typical anorectic exposure — and NDA 212102 was approved as FINTEPLA on 25 June 2020, with a Lennox-Gastaut efficacy supplement approved 25 March 2022. The current label opens with a boxed warning: "FINTEPLA can cause valvular heart disease and pulmonary arterial hypertension. Echocardiogram assessments are required before, during, and after treatment with FINTEPLA." Distribution is restricted through the FINTEPLA REMS. The risk was never declared absent; it was made a condition of use.',
        evidenceSource:
          'FINTEPLA (fenfluramine) US Prescribing Information, boxed warning and REMS; Drugs@FDA NDA 212102, original approval 25 June 2020',
        auditFlag: 'verified',
      },
      {
        id: 'fen-a5',
        category: 'measured',
        title: 'Dravet syndrome: 74.9% median seizure reduction against 19.2% on placebo',
        laymanSummary:
          'In 119 children and young adults with a drug-resistant epilepsy, the higher dose cut convulsive seizures by three quarters. On placebo they fell by a fifth.',
        technicalDetails:
          'Randomised, double-blind, placebo-controlled trial in children and young adults with Dravet syndrome, run under two identical protocols (NCT02682927 and NCT02826863). After a six-week baseline observation period, 119 patients (mean age 9.0 years, 54% male) were randomised 1:1:1 to placebo (n=40), fenfluramine 0.2 mg/kg/day (n=39) or fenfluramine 0.7 mg/kg/day (n=40), added to existing antiepileptic drugs, for 14 weeks. Median reduction in monthly convulsive seizure frequency was 74.9% on 0.7 mg/kg (median 20.7 to 4.7 seizures per 28 days), 42.3% on 0.2 mg/kg (17.5 to 12.6), and 19.2% on placebo (27.3 to 22.0). The primary endpoint was met: 0.7 mg/kg gave a 62.3% greater reduction in mean monthly convulsive seizure frequency than placebo (95% CI 47.7 to 72.8, p<0.0001); 0.2 mg/kg gave 32.4% (95% CI 6.2 to 52.3, p=0.0209).',
        evidenceSource: 'Lagae L et al., Lancet 2019;394:2243-2254 (NCT02682927 and NCT02826863)',
        doi: '10.1016/S0140-6736(19)32500-0',
        measuredMetric: 'Change in mean monthly convulsive seizure frequency versus placebo',
        auditFlag: 'verified',
      },
      {
        id: 'fen-a6',
        category: 'measured',
        title:
          'Echocardiography in every trial patient found no valve disease and no pulmonary hypertension',
        laymanSummary:
          'Every child in the epilepsy trial had their heart scanned. Valve function stayed within the normal range in all of them, and none developed lung artery hypertension.',
        technicalDetails:
          'Echocardiographic examinations in the Dravet trial revealed valve function within the normal physiological range in all patients during the trial and no signs of pulmonary arterial hypertension. Commonest adverse events, occurring in at least 10% and more often on fenfluramine, were decreased appetite, diarrhoea, fatigue, lethargy, somnolence and decreased weight — the anorectic pharmacology showing through at a tenth of the anorectic dose. The scope of this result needs stating precisely: 119 patients over 14 weeks is the right size to detect a common problem and the wrong size to exclude an uncommon one, which is exactly why the label mandates echocardiography before, during and after treatment rather than treating the trial as settling the question.',
        evidenceSource: 'Lagae L et al., Lancet 2019;394:2243-2254',
        doi: '10.1016/S0140-6736(19)32500-0',
        measuredMetric:
          'Echocardiographic valve function and pulmonary arterial pressure during 14 weeks of treatment',
        auditFlag: 'verified',
      },
      {
        id: 'fen-a7',
        category: 'measured',
        title: 'Replicated on top of stiripentol, the hardest available background',
        laymanSummary:
          'A second randomised trial added fenfluramine to patients already taking the standard European treatment for this epilepsy, and it still worked.',
        technicalDetails:
          'Double-blind, placebo-controlled, parallel-group randomised trial in children aged 2 to 18 with confirmed Dravet syndrome on stable stiripentol-inclusive regimens and at least six convulsive seizures during a six-week baseline. Eighty-seven patients (mean age 9.1 years, 57% male, roughly 25 convulsive seizures per month at baseline) were randomised to fenfluramine 0.4 mg/kg/day, maximum 17 mg/day (n=43), or placebo (n=44), with three weeks of titration and twelve weeks of maintenance. Fenfluramine produced a 54.0% greater reduction in mean monthly convulsive seizure frequency than placebo (95% CI 35.6 to 67.2, p<0.001); 54% versus 5% achieved a reduction of 50% or more (p<0.001); the median longest seizure-free interval was 22 days against 13 (p=0.004). Cardiac monitoring showed no clinical or echocardiographic evidence of valvular heart disease or pulmonary arterial hypertension. Testing an add-on against an active, already-effective background rather than against bare standard care is a substantially harder design, and this is what raises the Dravet evidence from a single positive trial to a replicated finding.',
        evidenceSource: 'Nabbout R et al., JAMA Neurol 2020;77:300-308',
        doi: '10.1001/jamaneurol.2019.4113',
        measuredMetric:
          'Convulsive seizure frequency reduction on fenfluramine added to stiripentol-inclusive regimens',
        auditFlag: 'verified',
      },
      {
        id: 'fen-a8',
        category: 'inferred',
        title:
          'Fen-phen was never approved as a combination, and the phentermine half was blameless',
        laymanSummary:
          'The famous diet combination was never licensed. Doctors put two separately approved drugs together, and the population data show the valve damage came from the fenfluramine half alone.',
        technicalDetails:
          'Fenfluramine and phentermine were each individually approved; the combination was not, and Connolly et al. note it explicitly while recording that 1996 United States prescriptions for the two drugs exceeded 18 million. The inference that the combination was safe because both components were approved was never tested. The Jick population study then separated the two: five-year cumulative incidence of idiopathic valvular disorders was 0 per 10,000 among phentermine-only users (95% CI 0 to 76.6), identical to untreated controls, against 35.0 per 10,000 for four or more months of fenfluramine or dexfenfluramine. Phentermine is a noradrenaline releasing agent with no meaningful 5-HT2B activity, and it remains licensed today.',
        evidenceSource:
          'Connolly HM et al., N Engl J Med 1997;337:581-588; Jick H et al., N Engl J Med 1998;339:719-724',
        doi: '10.1056/NEJM199809103391102',
        inferredClaim:
          'That combining two individually approved anorectics was safe because each had been approved separately',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'An oral solution, dosed by body weight',
        laymanDesc:
          "A liquid measured against the child's weight, twice a day, on top of their existing epilepsy drugs.",
        molecularDetail:
          'Oral solution dosed in mg/kg per day with a maximum daily cap, given as an adjunct. Trial doses were 0.2 and 0.7 mg/kg/day, roughly an order of magnitude below typical anorectic exposure.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Taken up into serotonin nerve terminals',
        laymanDesc:
          'The molecule is not just blocking a pump — it rides the pump into the nerve cell.',
        molecularDetail:
          'Fenfluramine is a SERT substrate: it is transported into the presynaptic terminal rather than merely occupying the transporter. This is the defining pharmacological difference from an SSRI or from sibutramine.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Reverses the transporter and empties the vesicles',
        laymanDesc:
          'Once inside, it makes the pump run backwards, so stored serotonin pours out into the gap between cells instead of being taken in.',
        molecularDetail:
          'Disrupts vesicular storage and reverses SERT, producing carrier-mediated efflux of 5-HT into the synapse, then inhibits reuptake of what it has released. The N-de-ethylated metabolite norfenfluramine is a potent 5-HT2B agonist.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Two receptor populations, two completely different outcomes',
        laymanDesc:
          'In the brain the extra serotonin damps down seizure activity. On heart valves, a different serotonin receptor tells the tissue to grow, which is what thickened the valves.',
        molecularDetail:
          'Central 5-HT2C and 5-HT1D agonism, with a proposed sigma-1 receptor contribution, is the accepted basis of the anticonvulsant effect. Peripherally, norfenfluramine agonism at 5-HT2B on cardiac valve interstitial cells drives mitogenesis and glycosaminoglycan deposition, producing plaque-like leaflet encasement with intact underlying architecture — the same lesion as carcinoid and ergot valvulopathy.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Seizures fall by three quarters; valves are scanned for life',
        laymanDesc:
          'Convulsive seizures dropped 74.9% against 19.2% on placebo. Every patient has an echocardiogram before, during and after treatment.',
        molecularDetail:
          'Measured endpoints: 62.3% greater reduction in mean monthly convulsive seizure frequency than placebo (95% CI 47.7 to 72.8, p<0.0001); echocardiographic valve function within normal physiological range in all trial patients with no pulmonary arterial hypertension over 14 weeks; a boxed warning and REMS-mandated echocardiography in the marketed product.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Dravet syndrome trial (NCT02682927 / NCT02826863)',
        phase: 'Phase 3 randomised double-blind placebo-controlled add-on trial',
        sampleSize: 119,
        primaryEndpoint:
          'Change in mean monthly convulsive seizure frequency, fenfluramine 0.7 mg/kg/day versus placebo, over 14 weeks',
        endpointMet: true,
        statisticalPValue:
          '62.3% greater reduction than placebo (95% CI 47.7 to 72.8), P < 0.0001; 0.2 mg/kg/day 32.4% (6.2 to 52.3), P = 0.0209',
        unreportedAdverseSignals:
          'Decreased appetite and decreased weight occurred at 10% or more and more often on fenfluramine — the anorectic pharmacology persisting at a tenth of the anorectic dose. Fourteen weeks in 119 patients cannot exclude an uncommon valvular effect, which is why the label mandates lifelong echocardiographic monitoring.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Stiripentol add-on trial (Nabbout et al.)',
        phase: 'Phase 3 randomised placebo-controlled add-on trial',
        sampleSize: 87,
        primaryEndpoint:
          'Convulsive seizure frequency in Dravet syndrome patients on stiripentol-inclusive regimens',
        endpointMet: true,
        statisticalPValue:
          '54.0% greater reduction in mean monthly convulsive seizure frequency than placebo (95% CI 35.6 to 67.2), P < .001; 54% versus 5% achieved a 50% or greater reduction, P < .001',
        unreportedAdverseSignals:
          'Decreased appetite in 44% versus 11%, fatigue 26% versus 5%, diarrhoea 23% versus 7%, pyrexia 26% versus 9%. Cardiac monitoring showed no clinical or echocardiographic evidence of valvular heart disease or pulmonary arterial hypertension.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Mayo Clinic valvulopathy case series (Connolly et al.)',
        phase: 'Observational case series with histopathology',
        sampleSize: 24,
        primaryEndpoint:
          'Echocardiographic valve morphology and regurgitation in fen-phen users with no prior cardiac disease',
        endpointMet: true,
        statisticalPValue:
          'Not a hypothesis test; abnormal valve morphology and regurgitation in 24 of 24, with 8 also showing pulmonary hypertension and 5 requiring surgery',
        unreportedAdverseSignals:
          'The series was ascertained from symptomatic patients, so it establishes that the lesion occurs and what it looks like, not how often it occurs. The Jick cohort supplied the rate.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Abnormal valve morphology and regurgitation in 24 of 24 fen-phen users, with carcinoid-identical histopathology',
        'Five-year cumulative incidence of idiopathic valvular disorders of 35.0 per 10,000 after four or more months, against 0 for phentermine alone and 0 for untreated controls',
        'Odds ratio 23.1 for primary pulmonary hypertension after more than three months of anorexic drug use',
        '74.9% median reduction in monthly convulsive seizures on 0.7 mg/kg/day against 19.2% on placebo in Dravet syndrome',
      ],
      unsupportedInferences: [
        'That combining two individually approved anorectics was safe because each component had been approved separately',
        'That 119 patients over 14 weeks with normal echocardiograms establishes that low-dose fenfluramine does not cause valvulopathy — the trial is the right size for efficacy and the wrong size for a rare structural harm',
      ],
      whatFailedInitially: [
        'Withdrawn from the United States market at FDA request on 15 September 1997, alongside dexfenfluramine',
        'The pulmonary hypertension signal was published in August 1996, more than a year before withdrawal',
      ],
      realWorldOutcome: [
        'Approved as FINTEPLA on 25 June 2020 for Dravet syndrome, with Lennox-Gastaut added 25 March 2022, under NDA 212102',
        'The label carries a boxed warning for valvular heart disease and pulmonary arterial hypertension and requires echocardiograms before, during and after treatment; distribution is restricted through the FINTEPLA REMS',
        'The 5-HT2B functional assay that explained the 1997 valvulopathy is now a routine screen applied to any candidate drug with serotonergic activity, which is the durable scientific legacy of the episode',
      ],
    },
    deliverySystem: {
      type: 'Oral solution, twice daily, dosed by body weight',
      description:
        'Oral solution given as an adjunct to existing antiepileptic therapy, dosed in mg/kg per day with a maximum daily amount and a lower cap in patients on stiripentol. Available only through the FINTEPLA REMS, which ties dispensing to documented echocardiographic monitoring.',
      safetyProfile:
        'Boxed warning for valvular heart disease and pulmonary arterial hypertension: echocardiogram assessments are required before, during and after treatment, and the benefit-risk of starting or continuing must be reconsidered on the basis of those findings. Common adverse effects in the Dravet trial were decreased appetite, diarrhoea, fatigue, lethargy, somnolence and decreased weight. The 1997 withdrawal-era harms — 35.0 valvular disorders per 10,000 at four months or more, and a 23.1-fold odds ratio for pulmonary hypertension beyond three months — are the reason the monitoring exists.',
    },
    commonQuestions: [
      {
        q: 'How can the same drug be banned for one use and approved for another?',
        a: 'Because approval is a judgement about a trade, not a verdict on a molecule. For weight loss, the benefit was a few kilograms and the cost was a five-year valvular disorder incidence of 35 per 10,000 at four months or more, plus a 23-fold odds ratio for pulmonary hypertension. For Dravet syndrome, the benefit is a 74.9% median reduction in convulsive seizures in an epilepsy that resists almost everything and carries a high rate of sudden death, at roughly a tenth of the dose, with mandatory echocardiography and restricted distribution. Same pharmacology, different disease on the other side of the scale, and a monitoring system that did not exist in 1996.',
        auditNote:
          'The label does not claim the risk is gone. It says the drug "can cause valvular heart disease and pulmonary arterial hypertension" and makes echocardiography a condition of dispensing.',
      },
      {
        q: 'The epilepsy trial found no valve damage. Does that mean low doses are safe?',
        a: "It means no valve damage was detected in 119 patients over 14 weeks, and that is a genuinely reassuring result that does not answer the question. Detecting a structural change that took a mean of 12 months to become symptomatic in the 1997 series, at an incidence measured in tens per ten thousand, needs far more patients followed for far longer. The FDA drew exactly that distinction: it approved the drug and simultaneously required echocardiograms before, during and after treatment for every patient. Read the monitoring requirement as the agency's own statement of how much the trial settled.",
      },
      {
        q: 'Was phentermine the problem in fen-phen?',
        a: 'No, and the data separate the two cleanly. In the population study, five-year cumulative incidence of idiopathic valvular disorders was 0 per 10,000 among people who took phentermine alone — identical to people who took no appetite suppressant at all — against 35.0 per 10,000 for four or more months of fenfluramine or dexfenfluramine. Phentermine releases noradrenaline and has no meaningful 5-HT2B activity, which is the receptor that drives the valve lesion. It remains a licensed drug. The combination was never approved in the first place; it was assembled in practice from two separately approved components.',
      },
      {
        q: 'What was actually learned from this?',
        a: 'A specific, portable piece of pharmacology: agonism at the 5-HT2B receptor causes cardiac valve fibrosis. The histopathology in the 1997 series was identical to carcinoid and ergotamine valve disease, and that identity is what pointed at the shared receptor. Screening candidate compounds for 5-HT2B activity is now routine, and it is the reason later serotonergic drugs — including the drug in this same file, lorcaserin — were designed and licensed on explicit 5-HT2B selectivity arguments. One withdrawal produced a permanent screening assay.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Connolly HM et al. Valvular heart disease associated with fenfluramine-phentermine. N Engl J Med 1997;337:581-588',
        identifier: '10.1056/NEJM199708283370901',
        kind: 'doi',
      },
      {
        label:
          'Jick H et al. A population-based study of appetite-suppressant drugs and the risk of cardiac-valve regurgitation. N Engl J Med 1998;339:719-724',
        identifier: '10.1056/NEJM199809103391102',
        kind: 'doi',
      },
      {
        label:
          'Abenhaim L et al. Appetite-suppressant drugs and the risk of primary pulmonary hypertension. N Engl J Med 1996;335:609-616',
        identifier: '10.1056/NEJM199608293350901',
        kind: 'doi',
      },
      {
        label:
          'Lagae L et al. Fenfluramine hydrochloride for the treatment of seizures in Dravet syndrome: a randomised, double-blind, placebo-controlled trial. Lancet 2019;394:2243-2254',
        identifier: '10.1016/S0140-6736(19)32500-0',
        kind: 'doi',
      },
      {
        label: 'Fenfluramine in Dravet syndrome, protocol 1',
        identifier: 'NCT02682927',
        kind: 'nct',
      },
      {
        label:
          'Nabbout R et al. Fenfluramine for treatment-resistant seizures in patients with Dravet syndrome receiving stiripentol-inclusive regimens: a randomized clinical trial. JAMA Neurol 2020;77:300-308',
        identifier: '10.1001/jamaneurol.2019.4113',
        kind: 'doi',
      },
      {
        label:
          'Drugs@FDA: FINTEPLA (fenfluramine) oral solution, NDA 212102, UCB — original approval 25 June 2020, Lennox-Gastaut efficacy supplement 25 March 2022',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=212102',
        kind: 'regulatory',
      },
      {
        label:
          'FINTEPLA US Prescribing Information — boxed warning for valvular heart disease and pulmonary arterial hypertension, and the FINTEPLA REMS',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22FINTEPLA%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 3337 — fenfluramine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3337',
        kind: 'url',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 7. Phentermine — the half of fen-phen that was never at fault
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'phentermine',
    name: 'Phentermine',
    tradeName: 'Adipex-P; also the phentermine half of Qsymia',
    sponsor: 'Multiple generic sponsors; Teva markets ADIPEX-P, Vivus markets QSYMIA (NDA 022580)',
    targetGene: 'SLC6A2',
    targetProtein:
      'Norepinephrine transporter (NET), acting as a substrate-type releasing agent; weaker dopamine release, negligible serotonin release',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1959,
    indication:
      'Short-term adjunct in a regimen of weight reduction for exogenous obesity. Schedule IV controlled substance. Also licensed since 17 July 2012 in fixed combination with extended-release topiramate as QSYMIA for chronic weight management.',
    patientFriendlyIndication: 'A short-term prescription appetite suppressant',
    anatomicalSite: 'Hypothalamic feeding centres and peripheral sympathetic nerve terminals',
    conditionContext: {
      conditionExplainer:
        'Phentermine is the drug most often mistaken for a withdrawn one. It was half of "fen-phen", the unapproved combination that caused heart valve disease in the 1990s. The other half, fenfluramine, was withdrawn in 1997. Phentermine was not, and the population data explain why.',
      whyItMatters:
        'It is a releasing agent like fenfluramine, but for a different monoamine. It releases noradrenaline, not serotonin, so it never engaged the 5-HT2B receptor on heart valves. That single pharmacological distinction is the whole reason one of the two drugs is still on the market.',
      whoTakesThis:
        'Adults with obesity, as a short-term adjunct. It remains the most prescribed weight-loss drug in the United States by volume, and it is prescribed off-label for far longer than the licensed few weeks.',
      clinicalGoals:
        'Short-term appetite suppression to support a reduced-calorie diet. There has never been a cardiovascular outcome trial of phentermine, which is the honest limit on what can be said about long-term use.',
    },
    oneSentenceVerdict:
      'A noradrenaline releasing agent that produced zero cases of idiopathic valvular disease in the population study that condemned its fen-phen partner, and that after sixty-five years on the market still has no cardiovascular outcome trial of its own.',
    laymanHowItWorks:
      'Phentermine makes nerve endings dump their stored noradrenaline into the synapse. In the part of the brain that regulates feeding, that suppresses appetite. Elsewhere it does what adrenaline does — raises heart rate, raises blood pressure, keeps you awake. It is structurally close to amphetamine and is a schedule IV controlled substance for that reason, though its abuse potential in practice is low.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 66,
    substitutes: {
      summary:
        'Phentermine is by far the cheapest option in this category and the one with the weakest long-term evidence. The fixed combination with extended-release topiramate roughly triples the weight effect. The GLP-1 receptor agonists produce more weight loss than either and are the only agents in the field with cardiovascular outcome data.',
      conventionalRx: [
        {
          name: 'Phentermine plus extended-release topiramate (Qsymia)',
          class: 'Fixed-dose sympathomimetic plus anticonvulsant combination',
          howItCompares:
            'In CONQUER, 56 weeks of phentermine 15 mg with topiramate 92 mg produced -10.2 kg against -1.4 kg on placebo, with 70% versus 21% reaching 5% weight loss. That is a far larger effect than phentermine alone.',
          typicalCost: 'Not priced here — brand product, price varies by payer',
          prosAndCons:
            'Pros: much larger effect than either component, once daily. Cons: teratogenic through the topiramate component with a pregnancy testing requirement, paraesthesia in about a fifth of patients, dysgeusia, cognitive effects.',
        },
        {
          name: 'Semaglutide 2.4 mg',
          class: 'GLP-1 receptor agonist',
          howItCompares:
            'Larger weight loss than phentermine or Qsymia and the only weight-management pharmacology with a positive cardiovascular outcome trial.',
          typicalCost: 'Not priced here — list price varies by country and payer',
          prosAndCons:
            'Pros: outcome benefit, large effect. Cons: injectable, expensive, gastrointestinal side effects, regain on stopping.',
        },
        {
          name: 'Orlistat',
          class: 'Gastrointestinal lipase inhibitor',
          howItCompares:
            'Acts in the gut lumen with negligible systemic absorption, so no sympathomimetic effect on heart rate or blood pressure and no controlled-substance scheduling.',
          typicalCost: 'Generic and over-the-counter; not priced here',
          prosAndCons:
            'Pros: no cardiovascular or abuse liability. Cons: steatorrhoea, faecal urgency, reduced fat-soluble vitamin absorption.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(C)(CC1=CC=CC=C1)N',
      chemicalFormula: 'C10H15N',
      molecularWeight:
        '149.23 g/mol (free base); marketed as the hydrochloride and as a resin complex',
      targetReceptorAffinity:
        'A substrate-type releasing agent at the norepinephrine transporter with weaker dopamine release and negligible serotonin release. The alpha,alpha-dimethyl substitution that distinguishes it from amphetamine blocks metabolism at that position and sharply reduces its potency as a dopamine releaser, which is the structural basis of both its lower abuse liability and its lack of 5-HT2B involvement.',
      structureSource: {
        label: 'PubChem CID 4771 (phentermine) — canonical SMILES, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4771',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'phe-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity confirmation and differentiation from amphetamine analogues',
          description:
            'Confirm the gem-dimethyl quaternary carbon that distinguishes phentermine from amphetamine and methamphetamine. This is the analytical problem that matters most in practice: phentermine cross-reacts in amphetamine immunoassay screens, so confirmatory chromatography is required before any positive is interpreted.',
          reagentsAndBuffer:
            'Phentermine hydrochloride certified reference standard, GC-MS after derivatisation with heptafluorobutyric anhydride, deuterated phentermine internal standard, amphetamine and methamphetamine reference standards run in the same sequence',
        },
        {
          id: 'phe-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Purity and related-substance assay',
          description:
            'Quantify phentermine and resolve process-related impurities and the N-oxide degradation product. Also confirm salt form, since the resin complex and the hydrochloride have different dissolution profiles.',
          dependsOnStepId: 'phe-w1',
          reagentsAndBuffer:
            'C18 column, phosphate buffer and acetonitrile gradient, UV detection at 210 nm, dissolution testing in 0.1 N hydrochloric acid',
        },
        {
          id: 'phe-w3',
          stepNumber: 3,
          phase: 'Assay_Quantification',
          name: 'Monoamine release panel — the assay that separates it from fenfluramine',
          description:
            'Preload synaptosomes with tritiated noradrenaline, dopamine or serotonin and measure efflux for each. Phentermine releases noradrenaline potently, dopamine weakly, and serotonin negligibly; fenfluramine is the mirror image. Running all three transmitters on the same preparation is what turns "both are releasing agents" into a distinction that predicts the clinical outcome.',
          dependsOnStepId: 'phe-w2',
          reagentsAndBuffer:
            'Rat brain synaptosomes, [3H]-norepinephrine, [3H]-dopamine and [3H]-5-hydroxytryptamine preloads, superfusion apparatus, reference releasers for each transmitter',
        },
        {
          id: 'phe-w4',
          stepNumber: 4,
          phase: 'Assay_Quantification',
          name: '5-HT2B counter-screen',
          description:
            'Run phentermine and its metabolites against recombinant human 5-HT2B in a functional assay. A negative result here is the mechanistic counterpart of the epidemiological finding that phentermine-only users had no excess valvular disease, and it is the reason this counter-screen is now standard for any anorectic candidate.',
          dependsOnStepId: 'phe-w3',
          reagentsAndBuffer:
            'HEK293 or CHO cells stably expressing human HTR2B, IP-One HTRF or calcium flux readout, serotonin as reference full agonist, norfenfluramine as positive control',
        },
      ],
    },
    keyAudits: [
      {
        id: 'phe-a1',
        category: 'measured',
        title: 'Zero idiopathic valvular disorders among phentermine-only users',
        laymanSummary:
          'In the population study that established the valve risk of fen-phen, nobody who took phentermine alone developed valve disease. The rate was the same as in people who took no appetite suppressant at all.',
        technicalDetails:
          'Population-based follow-up with nested case-control analysis: 862 subjects on phentermine, 6,532 on dexfenfluramine, 2,371 on fenfluramine, and 9,281 obese controls matched for age, sex and weight, all free of diagnosed cardiovascular disease at baseline, mean follow-up about four years. Of 11 newly diagnosed idiopathic valvular disorders, none occurred among phentermine-only users and none among untreated controls. Five-year cumulative incidence per 10,000 was 0 for phentermine alone (95% CI 0 to 76.6) and 0 for untreated controls (95% CI 0 to 15.4), against 35.0 (16.4 to 76.2) for four or more months of fenfluramine or dexfenfluramine. The wide confidence interval on the phentermine estimate is the honest caveat: 862 users cannot exclude a small effect, only a large one.',
        evidenceSource: 'Jick H et al., N Engl J Med 1998;339:719-724',
        doi: '10.1056/NEJM199809103391102',
        measuredMetric:
          'Five-year cumulative incidence of idiopathic valvular disorders per 10,000, by drug',
        auditFlag: 'verified',
      },
      {
        id: 'phe-a2',
        category: 'measured',
        title: 'CONQUER: with topiramate, 10.2 kg lost at 56 weeks against 1.4 kg on placebo',
        laymanSummary:
          'Combined with a low dose of an anticonvulsant, phentermine produced about ten kilograms of weight loss in a year. Seven in ten patients lost at least 5% of their body weight; two in ten did on placebo.',
        technicalDetails:
          '56-week phase 3 trial in 93 US centres, 2,487 overweight or obese adults aged 18 to 70 with BMI 27 to 45 kg/m2 and two or more comorbidities, randomised 2:1:2 to placebo (n=994), phentermine 7.5 mg plus topiramate 46.0 mg (n=498), or phentermine 15.0 mg plus topiramate 92.0 mg (n=995). At 56 weeks, weight change was -1.4 kg on placebo (least-squares mean -1.2%), -8.1 kg (-7.8%, p<0.0001) on the lower dose and -10.2 kg (-9.8%, p<0.0001) on the higher. At least 5% weight loss was achieved by 21%, 62% (OR 6.3, 95% CI 4.9 to 8.0) and 70% (OR 9.0, 7.3 to 11.1); at least 10% by 7%, 37% and 48%. Commonest adverse events were dry mouth (2%, 13%, 21%), paraesthesia (2%, 14%, 21%), constipation, insomnia, dizziness and dysgeusia, all dose-related.',
        evidenceSource: 'Gadde KM et al., Lancet 2011;377:1341-1352 (CONQUER, NCT00553787)',
        doi: '10.1016/S0140-6736(11)60205-5',
        measuredMetric:
          'Percentage change in bodyweight at 56 weeks and proportion losing 5% or more',
        auditFlag: 'verified',
      },
      {
        id: 'phe-a3',
        category: 'measured',
        title:
          'A 13,972-patient cohort found more weight loss with longer use and no excess events',
        laymanSummary:
          'Following nearly fourteen thousand patients for up to three years, people who stayed on phentermine longer lost more weight, and heart events and deaths were no more common than in short-term users.',
        technicalDetails:
          'Electronic health record cohort of 13,972 adults with a first phentermine fill between 2010 and 2015, categorised by duration of continuous use with three months or less as referent. The cohort was 84% female and 45% white, mean baseline age 43.5 years (SD 10.7) and BMI 37.8 kg/m2 (SD 7.2). In multivariable models, patients using continuously for more than 12 months lost 7.4% more weight than the referent group at 24 months (p<0.001). The composite of cardiovascular disease or death was rare — 0.3%, 41 events — with no significant difference in hazard ratios between duration groups over up to three years. The authors state the limitation themselves: this is observational, so channelling of healthier patients to longer treatment cannot be excluded.',
        evidenceSource: 'Lewis KH et al., Obesity (Silver Spring) 2019;27:591-602',
        doi: '10.1002/oby.22430',
        measuredMetric:
          'Percent weight loss at 24 months and composite cardiovascular disease or death by duration of use',
        auditFlag: 'verified',
      },
      {
        id: 'phe-a4',
        category: 'inferred',
        title: 'Licensed for a few weeks, prescribed for years, tested for neither',
        laymanSummary:
          'The label says short-term use. Real prescribing runs for months or years. The evidence for that longer use is a database study, not a randomised trial.',
        technicalDetails:
          'Phentermine has been licensed since 1959 as a short-term adjunct, a limitation dating from an era when obesity was not treated as a chronic disease. Actual practice diverged, which is why the 13,972-patient cohort study exists at all. That study supports effectiveness and safety of longer-term use in low-risk individuals, and its own authors qualify it as observational. What does not exist for phentermine monotherapy, after sixty-five years, is a randomised cardiovascular outcome trial. Given that the drug is a sympathomimetic that raises heart rate and blood pressure, and that sibutramine — a different monoamine drug in the same indication — failed exactly that trial, the absence is worth stating rather than glossing.',
        evidenceSource:
          'Lewis KH et al., Obesity 2019;27:591-602; ADIPEX-P (phentermine hydrochloride) US Prescribing Information, ANDA 085128',
        doi: '10.1002/oby.22430',
        inferredClaim:
          'That decades of widespread long-term use, without a randomised cardiovascular outcome trial, establish long-term cardiovascular safety',
        auditFlag: 'caution',
      },
      {
        id: 'phe-a5',
        category: 'conclusion_shift',
        title: 'Fen-phen was blamed on both drugs. The mechanism convicted only one',
        laymanSummary:
          'When fen-phen was withdrawn, both components were under suspicion. Working out the receptor responsible cleared phentermine, which is why it is still prescribed today.',
        technicalDetails:
          "The valvular lesion in fen-phen users was histopathologically identical to carcinoid and ergotamine valve disease, which pointed at 5-HT2B agonism on cardiac valve interstitial cells. Fenfluramine's metabolite norfenfluramine is a potent 5-HT2B agonist; phentermine releases noradrenaline with negligible serotonin release and no meaningful 5-HT2B activity. The epidemiology matched the mechanism exactly: zero idiopathic valvular disorders among phentermine-only users. Only fenfluramine and dexfenfluramine were withdrawn on 15 September 1997. Phentermine kept its licence, and in 2012 the FDA approved it as half of a new fixed-dose combination — fifteen years after the episode that made its name notorious.",
        evidenceSource:
          'Connolly HM et al., N Engl J Med 1997;337:581-588; Jick H et al., N Engl J Med 1998;339:719-724; Drugs@FDA NDA 022580 (QSYMIA), approved 17 July 2012',
        doi: '10.1056/NEJM199708283370901',
        auditFlag: 'verified',
      },
      {
        id: 'phe-a6',
        category: 'measured',
        title: 'The combination adds a teratogen, and the label handles that explicitly',
        laymanSummary:
          'Adding topiramate roughly triples the weight loss and also adds a drug known to cause birth defects, so the combination product comes with pregnancy testing requirements phentermine alone does not have.',
        technicalDetails:
          'Topiramate exposure in the first trimester is associated with oral clefts, which is why QSYMIA carries pregnancy-related contraindications and requirements that phentermine monotherapy does not. The dose-related adverse events measured in CONQUER are consistent with the topiramate contribution: paraesthesia rose from 2% on placebo to 14% and 21% across the two combination doses, and dysgeusia from 1% to 7% and 10%. The trade in the combination product is therefore not simply "more weight loss" — it is more weight loss plus a distinct reproductive-safety obligation, and the two have to be read together.',
        evidenceSource:
          'Gadde KM et al., Lancet 2011;377:1341-1352; QSYMIA US Prescribing Information, NDA 022580',
        doi: '10.1016/S0140-6736(11)60205-5',
        measuredMetric: 'Dose-related incidence of paraesthesia and dysgeusia in CONQUER',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A once-daily capsule or tablet, taken in the morning',
        laymanDesc:
          'Taken early in the day, because taken late it keeps people awake. Available as the hydrochloride and as a slower-releasing resin complex.',
        molecularDetail:
          'Oral immediate-release tablets and capsules and an ion-exchange resin complex. Largely excreted unchanged in urine, with excretion rate dependent on urinary pH — alkaline urine slows elimination substantially.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Crosses into the brain and enters noradrenergic terminals',
        laymanDesc:
          'It passes into brain tissue and is carried inside the nerve endings that store noradrenaline.',
        molecularDetail:
          'Lipophilic and centrally penetrant. Transported into presynaptic terminals as a NET substrate rather than merely occupying the transporter, in the same way fenfluramine is a SERT substrate.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Reverses the noradrenaline transporter',
        laymanDesc:
          'Once inside, it makes the pump run backwards, so stored noradrenaline floods out into the synapse.',
        molecularDetail:
          'Disrupts vesicular storage and reverses NET, producing carrier-mediated noradrenaline efflux with weaker dopamine efflux. Serotonin release is negligible, and there is no meaningful 5-HT2B agonism — the pharmacological fact that separates it from fenfluramine.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Appetite falls, and sympathetic tone rises',
        laymanDesc:
          'In feeding circuits the effect is reduced hunger. Everywhere else it is the ordinary adrenaline effect: faster pulse, higher blood pressure, less sleep.',
        molecularDetail:
          'Noradrenergic signalling in hypothalamic feeding centres suppresses energy intake. Peripheral sympathetic activation raises heart rate and blood pressure, which is why the label contraindicates use in patients with established cardiovascular disease and why it is not combined with monoamine oxidase inhibitors.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Modest weight loss alone; substantial in combination',
        laymanDesc:
          'Alone the effect is modest and short-term. With topiramate it reaches about ten kilograms over a year.',
        molecularDetail:
          'Measured endpoints: -10.2 kg versus -1.4 kg at 56 weeks for phentermine 15 mg plus topiramate 92 mg; 7.4% greater weight loss at 24 months for more than 12 months of monotherapy versus 3 months or less in an observational cohort; composite cardiovascular disease or death 0.3% across 13,972 patients with no difference by duration.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'CONQUER (NCT00553787)',
        phase: 'Phase 3 randomised placebo-controlled trial of phentermine plus topiramate',
        sampleSize: 2487,
        primaryEndpoint:
          'Percentage change in bodyweight and proportion achieving at least 5% weight loss at 56 weeks',
        endpointMet: true,
        statisticalPValue:
          '-9.8% versus -1.2% on placebo for phentermine 15 mg plus topiramate 92 mg, P < 0.0001; 70% versus 21% achieving 5% loss, OR 9.0 (7.3 to 11.1)',
        unreportedAdverseSignals:
          'Paraesthesia rose to 21% and dysgeusia to 10% at the top dose, both attributable to topiramate. Topiramate is a first-trimester teratogen, which the fixed-dose product manages through pregnancy testing requirements rather than through the trial.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Longer-term phentermine EHR cohort (Lewis et al.)',
        phase: 'Retrospective electronic health record cohort study',
        sampleSize: 13972,
        primaryEndpoint:
          'Percent weight loss at 6, 12 and 24 months, and composite cardiovascular disease or death up to three years, by duration of continuous phentermine use',
        endpointMet: true,
        statisticalPValue:
          '7.4% greater weight loss at 24 months for more than 12 months of use versus 3 months or less, P < 0.001; composite CVD or death 0.3% (41 events) with no significant hazard ratio difference between groups',
        unreportedAdverseSignals:
          'Observational design with no randomisation, so clinicians choosing to continue phentermine in healthier patients would produce this pattern in the absence of any true safety difference.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Zero idiopathic valvular disorders among 862 phentermine-only users over about four years, matching untreated controls',
        '-10.2 kg at 56 weeks with topiramate 92 mg against -1.4 kg on placebo, and 70% versus 21% reaching 5% weight loss',
        '7.4% greater weight loss at 24 months with more than 12 months of continuous monotherapy in a 13,972-patient cohort',
        'Composite cardiovascular disease or death in 0.3% of that cohort with no difference by duration of use',
      ],
      unsupportedInferences: [
        'That sixty-five years of use without a randomised cardiovascular outcome trial establishes long-term cardiovascular safety for a sympathomimetic',
        'That an observational finding of no excess events with longer use is equivalent to a randomised safety result, when clinicians choose who continues treatment',
        'That the 1998 phentermine valvular result excludes a small effect — 862 users give a 95% confidence interval reaching 76.6 per 10,000',
      ],
      whatFailedInitially: [
        'The unapproved fen-phen combination was assembled in practice from two separately approved drugs and caused valvular heart disease; only the fenfluramine half was withdrawn',
        'The licensed indication remains short-term use, a limitation that has never been reconciled with how the drug is actually prescribed',
      ],
      realWorldOutcome: [
        'Phentermine remains licensed and is the most prescribed weight-loss drug in the United States by volume, as a schedule IV controlled substance',
        'The FDA approved it as half of QSYMIA on 17 July 2012, fifteen years after the fen-phen withdrawal',
        'It is the standard example of a drug whose reputation was damaged by a combination partner rather than by its own pharmacology',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, capsule, orally disintegrating tablet and resin complex, once daily',
      description:
        'Taken in the morning as a short-term adjunct to a reduced-calorie diet. Largely renally excreted unchanged, with elimination markedly slowed by alkaline urine. Also formulated with extended-release topiramate in a once-daily fixed-dose capsule.',
      safetyProfile:
        "Schedule IV controlled substance. Sympathomimetic effects — raised heart rate, raised blood pressure, insomnia, dry mouth — are the expected pharmacology rather than idiosyncratic reactions, and the label contraindicates use in established cardiovascular disease and with monoamine oxidase inhibitors. It does not carry fenfluramine's valvular signal: the population study that measured it found zero idiopathic valvular disorders among phentermine-only users. The combination product adds topiramate's first-trimester teratogenicity and its own pregnancy-testing requirements.",
    },
    commonQuestions: [
      {
        q: 'Is phentermine the drug that damaged heart valves?',
        a: 'No. That was fenfluramine, the other half of fen-phen. The distinction is mechanistic and the epidemiology confirms it. Fenfluramine releases serotonin, and its metabolite norfenfluramine is a potent agonist at the 5-HT2B receptor found on heart valve tissue, which is what caused the fibrosis. Phentermine releases noradrenaline, releases essentially no serotonin, and has no meaningful 5-HT2B activity. In the 1998 population study, five-year cumulative incidence of idiopathic valvular disorders was 0 per 10,000 among phentermine-only users — identical to people who took no appetite suppressant at all — against 35.0 per 10,000 for four or more months of fenfluramine. Only fenfluramine and dexfenfluramine were withdrawn.',
        auditNote:
          'The 95% confidence interval on the phentermine estimate runs from 0 to 76.6 per 10,000, because only 862 phentermine-only users were followed. That excludes a large effect, not a small one.',
      },
      {
        q: 'The label says short-term. Why is it prescribed for months?',
        a: 'Because the label reflects 1959, when obesity was not managed as a chronic condition, and practice has moved without the licence following. The best evidence on the gap is a 13,972-patient electronic health record cohort in which people who continued past twelve months lost 7.4% more weight at two years than those who stopped within three, with composite cardiovascular disease or death occurring in 0.3% overall and no difference by duration. That is a genuinely reassuring observational result and it is not a randomised one. The people who stayed on the drug were selected by their clinicians, and healthier patients staying on longer would produce the same pattern with no true safety difference.',
      },
      {
        q: 'Why does it show up on drug tests as amphetamine?',
        a: 'Because it is structurally an amphetamine — specifically alpha,alpha-dimethylphenethylamine — and immunoassay screens for amphetamines cross-react with it. This is a well-known analytical problem, not evidence of misuse, and it is why a positive amphetamine screen in someone with a phentermine prescription must be resolved by confirmatory chromatography before it is interpreted. The gem-dimethyl group that distinguishes phentermine from amphetamine also blocks the metabolic step and sharply reduces dopamine release, which is why its abuse liability in practice is low despite the family resemblance.',
      },
      {
        q: 'Why does this page not show a price?',
        a: 'Because this file does not carry a pricing block for any of its drugs: the format requires a per-dose synthesis cost with a citable source, and no verified per-dose manufacturing cost for phentermine could be sourced. Generic phentermine is among the cheapest prescription drugs in the United States; the branded combination product is not, and both figures vary by payer and formulary.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Jick H et al. A population-based study of appetite-suppressant drugs and the risk of cardiac-valve regurgitation. N Engl J Med 1998;339:719-724',
        identifier: '10.1056/NEJM199809103391102',
        kind: 'doi',
      },
      {
        label:
          'Gadde KM et al. Effects of low-dose, controlled-release, phentermine plus topiramate combination on weight and associated comorbidities in overweight and obese adults (CONQUER): a randomised, placebo-controlled, phase 3 trial. Lancet 2011;377:1341-1352',
        identifier: '10.1016/S0140-6736(11)60205-5',
        kind: 'doi',
      },
      {
        label: 'CONQUER — phentermine/topiramate in overweight and obese adults',
        identifier: 'NCT00553787',
        kind: 'nct',
      },
      {
        label:
          'Allison DB et al. Controlled-release phentermine/topiramate in severely obese adults: a randomized controlled trial (EQUIP). Obesity (Silver Spring) 2012;20:330-342',
        identifier: '10.1038/oby.2011.330',
        kind: 'doi',
      },
      {
        label:
          'Lewis KH et al. Safety and effectiveness of longer-term phentermine use: clinical outcomes from an electronic health record cohort. Obesity (Silver Spring) 2019;27:591-602',
        identifier: '10.1002/oby.22430',
        kind: 'doi',
      },
      {
        label:
          'Connolly HM et al. Valvular heart disease associated with fenfluramine-phentermine. N Engl J Med 1997;337:581-588',
        identifier: '10.1056/NEJM199708283370901',
        kind: 'doi',
      },
      {
        label:
          'Drugs@FDA: QSYMIA (phentermine and topiramate extended-release), NDA 022580, Vivus — original approval 17 July 2012',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=022580',
        kind: 'regulatory',
      },
      {
        label: 'DEA Controlled Substances Alphabetical Order list — phentermine, schedule IV',
        identifier: 'https://www.deadiversion.usdoj.gov/schedules/orangebook/c_cs_alpha.pdf',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 4771 — phentermine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4771',
        kind: 'url',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 8. Thalidomide — the reason modern drug regulation exists, and a myeloma drug
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'thalidomide',
    name: 'Thalidomide',
    tradeName: 'Thalomid (1998); formerly Contergan, Distaval, Softenon',
    sponsor: 'Celgene, now Bristol Myers Squibb (NDA 020785); originally Chemie Grünenthal',
    targetGene: 'CRBN',
    targetProtein:
      'Cereblon, the substrate receptor of a CRL4 E3 ubiquitin ligase complex with DDB1 and Cul4A',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1998,
    indication:
      'Newly diagnosed multiple myeloma in combination with dexamethasone, and acute treatment and maintenance suppression of the cutaneous manifestations of erythema nodosum leprosum. Marketed as a sedative and anti-emetic from 1957 and withdrawn worldwide in 1961; approved for erythema nodosum leprosum on 16 July 1998, with the myeloma indication added by a supplement approved 25 May 2006.',
    patientFriendlyIndication:
      'Multiple myeloma and a painful inflammatory complication of leprosy — from the drug that caused the birth-defect disaster of 1961',
    anatomicalSite:
      'Bone marrow plasma cells and the tumour microenvironment; the teratogenic site is the developing limb bud',
    conditionContext: {
      conditionExplainer:
        'Thalidomide was sold from 1957 as a safe sedative, including for morning sickness. Over 10,000 children were born with severe malformations before it was withdrawn in 1961. It is the reason drug regulators worldwide require pre-approval evidence of safety and the reason teratogenicity testing exists.',
      whyItMatters:
        'It is also, today, an effective drug for multiple myeloma and for erythema nodosum leprosum, and the parent of a whole therapeutic class. The two facts are not in tension: they are the same molecular mechanism seen in two different tissues, and it took until 2010 to identify the protein responsible for both.',
      whoTakesThis:
        'Adults with newly diagnosed multiple myeloma, in combination with dexamethasone, and patients with the cutaneous manifestations of erythema nodosum leprosum. Dispensing is restricted through the THALOMID REMS programme with mandatory pregnancy testing.',
      clinicalGoals:
        'Paraprotein response and survival in myeloma; suppression of skin lesions in erythema nodosum leprosum. In both cases the governing constraint is that a single capsule taken during pregnancy can cause severe birth defects.',
    },
    oneSentenceVerdict:
      'The drug that created modern drug regulation by malforming over 10,000 children, and that in 1999 produced a 32% paraprotein response rate in 84 patients with refractory myeloma — with cereblon, identified in 2010, turning out to be the target of both effects.',
    laymanHowItWorks:
      'Thalidomide sticks to a protein called cereblon, which is part of the machinery a cell uses to tag other proteins for destruction. With thalidomide bound, that machinery destroys a different set of proteins than it normally would. In a developing embryo, the proteins it stops destroying — and the ones it starts — are needed for limbs to form, which is why limbs failed to form. In a myeloma cell, the proteins it destroys are ones the cancer depends on to survive. Same glue, different tissue, opposite consequence.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 93,
    substitutes: {
      summary:
        'Thalidomide is the first of the immunomodulatory drugs, and its own successors — lenalidomide and pomalidomide — are more potent at the same target with less neuropathy and less sedation. In erythema nodosum leprosum, corticosteroids and clofazimine are the alternatives and neither works as well on the skin lesions.',
      conventionalRx: [
        {
          name: 'Lenalidomide',
          class: 'Immunomodulatory drug, cereblon E3 ligase modulator',
          howItCompares:
            'A direct thalidomide analogue at the same cereblon target, more potent, without the same degree of peripheral neuropathy and sedation. It has displaced thalidomide in most myeloma regimens in high-income settings.',
          typicalCost: 'Not priced here — generic and brand prices vary widely by market',
          prosAndCons:
            'Pros: greater potency, better tolerated neurologically. Cons: myelosuppression, still teratogenic and still under a REMS, second primary malignancy signal.',
        },
        {
          name: 'Pomalidomide',
          class: 'Immunomodulatory drug, cereblon E3 ligase modulator',
          howItCompares:
            'The third-generation analogue, active in disease refractory to both thalidomide and lenalidomide.',
          typicalCost: 'Not priced here',
          prosAndCons:
            'Pros: activity after failure of the earlier two. Cons: teratogenic, myelosuppressive, expensive.',
        },
        {
          name: 'Corticosteroids and clofazimine',
          class: 'Anti-inflammatory therapy for erythema nodosum leprosum',
          howItCompares:
            "The alternatives in the leprosy indication. Thalidomide's effect on the cutaneous manifestations is what got it a licence in 1998, and neither alternative matches it on that endpoint.",
          typicalCost: 'Not priced here',
          prosAndCons:
            'Pros: not teratogenic, widely available. Cons: long-term steroid toxicity; clofazimine causes marked skin pigmentation and works slowly.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1CC(=O)NC(=O)C1N2C(=O)C3=CC=CC=C3C2=O',
      chemicalFormula: 'C13H10N2O4',
      molecularWeight: '258.23 g/mol',
      targetReceptorAffinity:
        'Binds the tri-tryptophan pocket of cereblon through its glutarimide ring, converting the CRL4-CRBN E3 ubiquitin ligase into one that degrades neosubstrates it would not otherwise touch. The single stereocentre racemises rapidly in plasma, which is why separating the enantiomers cannot separate the sedative effect from the teratogenic one.',
      structureSource: {
        label: 'PubChem CID 5426 (thalidomide) — canonical SMILES, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5426',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'tha-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity confirmation and chiral analysis',
          description:
            'Confirm the phthalimide and glutarimide rings and characterise the single stereocentre. The chiral assay carries an unusual conclusion: thalidomide racemises in aqueous media with a half-life of minutes to hours, so an enantiomerically pure batch does not stay pure in the body, and this fact settled a long-running argument about whether one enantiomer could be marketed safely.',
          reagentsAndBuffer:
            'Thalidomide certified reference standard, chiral stationary-phase HPLC with an amylose or cellulose derivative, phosphate buffer at physiological pH for racemisation kinetics, LC-MS confirmation at m/z 259',
        },
        {
          id: 'tha-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Hydrolytic degradation profile',
          description:
            'Profile the spontaneous hydrolysis products of both imide rings. Thalidomide is chemically unstable at physiological pH and generates a dozen or more hydrolysis products, several of which have been proposed as the proximate teratogen, so a stability-indicating method has to resolve them rather than integrate them together.',
          dependsOnStepId: 'tha-w1',
          reagentsAndBuffer:
            'C18 column, acetonitrile with ammonium acetate gradient, photodiode array detection, forced degradation at pH 2, 7.4 and 10, LC-MS/MS identification of ring-opened products',
        },
        {
          id: 'tha-w3',
          stepNumber: 3,
          phase: 'Assay_Quantification',
          name: 'Cereblon binding and ternary complex formation',
          description:
            'Measure direct binding to recombinant cereblon and, more informatively, the formation of the ternary complex between CRBN, thalidomide and a neosubstrate such as IKZF1 or SALL4. Ternary complex formation, not simple affinity, is what predicts biological effect for a molecular glue.',
          dependsOnStepId: 'tha-w2',
          reagentsAndBuffer:
            'Recombinant human CRBN-DDB1 complex, purified IKZF1 or SALL4 zinc-finger domains, TR-FRET or surface plasmon resonance, thalidomide-conjugated affinity beads as used in the original target identification',
        },
        {
          id: 'tha-w4',
          stepNumber: 4,
          phase: 'Assay_Quantification',
          name: 'Neosubstrate degradation in myeloma cells',
          description:
            'Treat myeloma cell lines and measure loss of the cereblon neosubstrates by immunoblot, with a cereblon-knockout line as the specificity control. A compound that kills myeloma cells without degrading the neosubstrates is not working through this mechanism, and the knockout arm is what proves the difference.',
          dependsOnStepId: 'tha-w3',
          reagentsAndBuffer:
            'Human myeloma cell lines and isogenic CRBN-knockout controls, IKZF1 and IKZF3 antibodies, proteasome inhibitor rescue arm, cell viability readout run in parallel',
        },
        {
          id: 'tha-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Developmental toxicity readout in zebrafish and chick limb bud',
          description:
            'Reproduce the teratogenic phenotype in the two model systems in which the cereblon mechanism was established, scoring limb and fin outgrowth and Fgf8 expression. This is the assay in which a thalidomide analogue must be shown clean before any claim of a non-teratogenic derivative can be taken seriously.',
          dependsOnStepId: 'tha-w4',
          reagentsAndBuffer:
            'Zebrafish embryos and chick embryo limb bud cultures, whole-mount in situ hybridisation for Fgf8, cereblon morpholino or drug-binding-deficient CRBN mutant as the mechanistic control',
        },
      ],
    },
    keyAudits: [
      {
        id: 'tha-a1',
        category: 'failed',
        title: 'Over 10,000 children born with severe malformations before withdrawal in 1961',
        laymanSummary:
          'Thalidomide was sold as a safe sedative, including for morning sickness. More than ten thousand children were born with severe limb and organ malformations before it was taken off the market.',
        technicalDetails:
          'Marketed from 1957 and prescribed to pregnant women for nausea. Vargesson\'s review states the scale plainly: "over 10,000 children were born with a range of severe and debilitating malformations", making it the largest man-made medical disaster of its kind. The characteristic phenotype was phocomelia — shortened or absent long bones — accompanied by defects of the ears, eyes, heart, kidneys and gastrointestinal tract, with the malformation pattern depending sharply on the day of gestation at exposure. The drug was withdrawn in 1961 after the independent reports of McBride in Australia and Lenz in Germany. Vargesson also records that a new generation of thalidomide-damaged children has been identified in Brazil, where the drug is used for leprosy.',
        evidenceSource:
          'Vargesson N. Thalidomide-induced teratogenesis: history and mechanisms. Birth Defects Res C Embryo Today 2015;105:140-156',
        doi: '10.1002/bdrc.21096',
        measuredMetric: 'Number of children born with thalidomide-associated malformations',
        auditFlag: 'verified',
      },
      {
        id: 'tha-a2',
        category: 'conclusion_shift',
        title: 'The disaster created the regulatory system that would have prevented it',
        laymanSummary:
          'Thalidomide was never approved in the United States, and the near miss produced the 1962 law that requires drugs to be shown effective and safe before they go on sale.',
        technicalDetails:
          "The episode is the origin of the modern pre-approval evidence requirement. Before 1962, United States law required a demonstration of safety but not of efficacy, and review timelines allowed a drug to be marketed by default if the agency did not act. The Kefauver-Harris amendments of 1962 required proof of efficacy, informed consent in clinical trials, and reporting of adverse reactions, and comparable requirements followed in Europe. Reproductive toxicology testing became a standard pre-approval requirement as a direct consequence. Kim and Scialli's review treats the two halves of the story together, and the title states the shape of the record: the tragedy of birth defects and the effective treatment of disease.",
        evidenceSource:
          'Kim JH, Scialli AR. Thalidomide: the tragedy of birth defects and the effective treatment of disease. Toxicol Sci 2011;122:1-6',
        doi: '10.1093/toxsci/kfr088',
        auditFlag: 'verified',
      },
      {
        id: 'tha-a3',
        category: 'measured',
        title: 'Refractory myeloma: 32% paraprotein response in 84 previously treated patients',
        laymanSummary:
          'In patients whose myeloma had come back after high-dose chemotherapy and who had no options left, a third responded to thalidomide, and two went into complete remission.',
        technicalDetails:
          'Eighty-four previously treated patients with refractory myeloma, 76 of whom had relapsed after high-dose chemotherapy, received oral thalidomide as a single agent for a median of 80 days (range 2 to 465), starting at 200 mg daily and escalating by 200 mg every two weeks to 800 mg. Serum or urine paraprotein fell by at least 90% in eight patients (two complete remissions), at least 75% in six, at least 50% in seven and at least 25% in six — a total response rate of 32%. Responses appeared within two months in 78% of responders and were accompanied by fewer marrow plasma cells and higher haemoglobin. At twelve months, Kaplan-Meier estimates were 22% (SE 5) event-free survival and 58% (SE 5) overall survival. At least a third of patients had mild or moderate constipation, weakness or fatigue, or somnolence; severe adverse effects occurred in under 10% and haematological effects were rare.',
        evidenceSource: 'Singhal S et al., N Engl J Med 1999;341:1565-1571',
        doi: '10.1056/NEJM199911183412102',
        measuredMetric:
          'Paraprotein reduction of at least 25% sustained six weeks, in refractory multiple myeloma',
        auditFlag: 'verified',
      },
      {
        id: 'tha-a4',
        category: 'inferred',
        title:
          'The myeloma trial was run on an antiangiogenesis hypothesis the results did not support',
        laymanSummary:
          'Thalidomide was tried in myeloma because it was thought to starve tumours of blood vessels. It worked — but the blood vessel density in responding patients did not actually change.',
        technicalDetails:
          'Singhal and colleagues state the rationale explicitly: increased bone marrow vascularity carries a poor prognosis in myeloma, and thalidomide has antiangiogenic properties, so they evaluated it in refractory disease. The trial then reported, in the same results section, that "the microvascular density of bone marrow did not change significantly in patients with a response." The drug worked and the stated mechanism did not account for it. The actual mechanism — cereblon-directed degradation of transcription factors the myeloma cell depends on — was not identified for another eleven years. This is a clean example of a correct clinical prediction reached from a hypothesis the trial itself failed to confirm.',
        evidenceSource: 'Singhal S et al., N Engl J Med 1999;341:1565-1571',
        doi: '10.1056/NEJM199911183412102',
        inferredClaim:
          "That thalidomide's antimyeloma activity is caused by inhibition of bone marrow angiogenesis",
        auditFlag: 'caution',
      },
      {
        id: 'tha-a5',
        category: 'measured',
        title: 'Cereblon identified in 2010 — half a century after the withdrawal',
        laymanSummary:
          'The protein thalidomide binds to, and the reason it deforms limbs, was not identified until 2010. Fifty years passed between the disaster and the explanation.',
        technicalDetails:
          'Ito and colleagues used thalidomide-conjugated affinity beads to identify cereblon (CRBN) as a thalidomide-binding protein. CRBN forms an E3 ubiquitin ligase complex with damaged DNA binding protein 1 (DDB1) and Cul4A which is required for limb outgrowth and for expression of the fibroblast growth factor Fgf8 in zebrafish and chicks. Thalidomide initiates its teratogenic effects by binding CRBN and inhibiting the associated ubiquitin ligase activity. The paper states its own forward-looking claim carefully — that the finding "may contribute to the development of new thalidomide derivatives without teratogenic activity" — and the same target turned out to explain the antimyeloma effect, which is why the class is now described as cereblon E3 ligase modulators rather than antiangiogenics.',
        evidenceSource: 'Ito T et al., Science 2010;327:1345-1350',
        doi: '10.1126/science.1177319',
        measuredMetric:
          'Identification of cereblon as the thalidomide-binding protein, with loss of limb outgrowth and Fgf8 expression as the functional readout',
        auditFlag: 'verified',
      },
      {
        id: 'tha-a6',
        category: 'measured',
        title: 'The current label states the risk in absolute terms: one capsule',
        laymanSummary:
          'The boxed warning does not hedge. A single capsule taken during pregnancy can cause severe birth defects, and the drug is dispensed only through a restricted programme with mandatory pregnancy testing.',
        technicalDetails:
          'The THALOMID boxed warning covers embryo-fetal toxicity and venous thromboembolism. On the first: "If THALOMID is taken during pregnancy, it can cause severe birth defects or embryo-fetal death... Even a single dose [1 capsule (regardless of strength)] taken by a pregnant woman during her pregnancy can cause severe birth defects. Pregnancy must be excluded before start of treatment. Prevent pregnancy thereafter by the use of two reliable methods of contraception." Distribution is restricted through the THALOMID REMS programme. On the second: significantly increased risk of deep vein thrombosis and pulmonary embolism in myeloma patients receiving thalidomide with dexamethasone, which is the reason thromboprophylaxis is standard in those regimens.',
        evidenceSource:
          'THALOMID (thalidomide) US Prescribing Information, boxed warning and THALOMID REMS, NDA 020785',
        measuredMetric:
          'Labelled minimum teratogenic exposure and required risk-management controls',
        auditFlag: 'verified',
      },
      {
        id: 'tha-a7',
        category: 'conclusion_shift',
        title:
          'Approved for leprosy in 1998 and for myeloma in 2006, by the agency that kept it out in 1961',
        laymanSummary:
          'The FDA never let thalidomide onto the American market in the first place. Thirty-seven years later it approved the same drug, with a distribution system built around the risk.',
        technicalDetails:
          'Drugs@FDA records NDA 020785 (Celgene, now Bristol Myers Squibb) with original approval on 16 July 1998 for the cutaneous manifestations of moderate to severe erythema nodosum leprosum. A supplement approved on 25 May 2006 added multiple myeloma in combination with dexamethasone, now labelled for newly diagnosed disease. The marketing status is Prescription. The approval did not rest on the risk having been resolved — it rests on the risk being contained by a restricted distribution programme with mandatory pregnancy testing and dual contraception, in patients for whom the alternative is an incurable cancer or a disabling inflammatory complication.',
        evidenceSource:
          'Drugs@FDA: THALOMID (thalidomide), NDA 020785, original approval 16 July 1998, supplement 31 approved 25 May 2006',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'An oral capsule, dispensed only through a restricted programme',
        laymanDesc:
          'A capsule taken once daily, usually at bedtime because it is sedating. It can only be dispensed through a controlled programme with pregnancy testing.',
        molecularDetail:
          'Oral capsules in 50, 100, 150 and 200 mg strengths. Slow absorption with a terminal half-life of roughly 5 to 7 hours. Elimination is dominated by non-enzymatic hydrolysis rather than by hepatic metabolism.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Enters cells and racemises on the way',
        laymanDesc:
          'The molecule exists as two mirror-image forms, and it flips between them in the bloodstream within minutes. You cannot give one form only.',
        molecularDetail:
          'Rapid spontaneous racemisation at physiological pH means the administered enantiomer is irrelevant to exposure. Passive cellular entry; the target is intracellular, in the cytoplasm and nucleus.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Binds cereblon and reprogrammes an E3 ubiquitin ligase',
        laymanDesc:
          "It glues itself into a pocket on cereblon, part of the cell's protein disposal machinery, and changes which proteins that machinery throws away.",
        molecularDetail:
          'The glutarimide ring inserts into the tri-tryptophan pocket of CRBN within the CRL4-CRBN complex with DDB1 and Cul4A. The bound drug forms a new surface that recruits neosubstrates the ligase would not otherwise engage — a molecular glue rather than an inhibitor.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The same reprogramming, two different tissues, two different results',
        laymanDesc:
          'In a myeloma cell it destroys proteins the cancer needs. In a developing limb it disrupts the signalling that makes the limb grow.',
        molecularDetail:
          'In myeloma, ubiquitination and proteasomal degradation of the Ikaros-family transcription factors on which the malignant plasma cell depends, with downstream immunomodulatory and anti-inflammatory effects including TNF-alpha suppression. In the embryo, CRBN-dependent disruption of limb outgrowth and Fgf8 expression, demonstrated in zebrafish and chick.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Myeloma responds; embryos are catastrophically harmed',
        laymanDesc:
          'A third of patients with refractory myeloma responded. A single capsule in pregnancy can cause severe birth defects.',
        molecularDetail:
          'Measured endpoints: 32% paraprotein response rate in 84 refractory patients with 58% twelve-month overall survival; over 10,000 children malformed between 1957 and 1961; labelled minimum teratogenic exposure of one capsule; increased deep vein thrombosis and pulmonary embolism in combination with dexamethasone.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Singhal et al. refractory myeloma phase 2 study',
        phase: 'Phase 2 single-arm dose-escalation study',
        sampleSize: 84,
        primaryEndpoint:
          'Reduction of serum or urine paraprotein by at least 25%, sustained for at least six weeks',
        endpointMet: true,
        statisticalPValue:
          'Total response rate 32% (8 patients with 90% or greater reduction including 2 complete remissions); 12-month event-free survival 22% (SE 5), overall survival 58% (SE 5)',
        unreportedAdverseSignals:
          'Bone marrow microvascular density did not change significantly in responders, contradicting the antiangiogenic rationale on which the trial was designed. At least a third of patients had constipation, weakness or fatigue, or somnolence.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Ito et al. target identification (Science 2010)',
        phase: 'Preclinical target identification with zebrafish and chick developmental models',
        sampleSize: 0,
        primaryEndpoint:
          'Identification of the thalidomide-binding protein and demonstration that its ubiquitin ligase activity is required for limb outgrowth and Fgf8 expression',
        endpointMet: true,
        statisticalPValue:
          'Not a clinical hypothesis test; the result is affinity-bead identification of cereblon plus loss-of-function phenotypes in two vertebrate models',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Over 10,000 children born with severe malformations between 1957 and 1961',
        '32% paraprotein response rate in 84 patients with refractory multiple myeloma, with two complete remissions',
        'Cereblon identified as the thalidomide-binding protein, with loss of limb outgrowth and Fgf8 expression as the functional consequence in zebrafish and chick',
        'Increased deep vein thrombosis and pulmonary embolism when combined with dexamethasone in myeloma, per the current boxed warning',
      ],
      unsupportedInferences: [
        'That the antimyeloma effect is caused by inhibition of bone marrow angiogenesis — the trial that established the effect found no significant change in microvascular density in responders',
        'That a "safe sedative" claim made without reproductive toxicology testing described the drug\'s safety in pregnancy',
        'That identifying cereblon means non-teratogenic derivatives follow — the original paper says only that it "may contribute" to that goal, and lenalidomide and pomalidomide remain teratogenic',
      ],
      whatFailedInitially: [
        'Withdrawn worldwide in 1961 after independent reports from McBride in Australia and Lenz in Germany',
        'Never approved in the United States as a sedative, which is why the American cohort of affected children was small',
        'Fifty years elapsed between the withdrawal and the identification of the molecular target',
      ],
      realWorldOutcome: [
        'The Kefauver-Harris amendments of 1962 and their international equivalents made pre-approval proof of efficacy and reproductive toxicology testing mandatory',
        'Drugs@FDA records NDA 020785 (THALOMID) as Prescription, approved 16 July 1998 for erythema nodosum leprosum with multiple myeloma added by supplement on 25 May 2006',
        'Cereblon became a drug target in its own right: lenalidomide, pomalidomide and the wider molecular-glue degrader field all descend from the 2010 identification',
        'Vargesson records a new generation of thalidomide-damaged children in Brazil, where the drug is used for leprosy — the risk-management problem is not historical',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule, once daily, usually at bedtime (50, 100, 150 and 200 mg)',
      description:
        'Once-daily capsule taken with water, generally at night because of sedation. Eliminated largely by spontaneous hydrolysis rather than hepatic metabolism. Available only through the THALOMID REMS restricted distribution programme, which ties dispensing to documented pregnancy testing and contraception.',
      safetyProfile:
        'Boxed warning for embryo-fetal toxicity and venous thromboembolism. A single capsule taken during pregnancy can cause severe birth defects or embryo-fetal death; pregnancy must be excluded before treatment and prevented afterwards by two reliable methods of contraception. Dose-limiting peripheral neuropathy is common with prolonged use and may be irreversible. Sedation, constipation, fatigue and neutropenia are frequent. Deep vein thrombosis and pulmonary embolism risk is significantly increased in combination with dexamethasone.',
    },
    commonQuestions: [
      {
        q: 'How is a drug that caused thousands of birth defects legally prescribed today?',
        a: 'Because the risk was contained rather than resolved, and the containment is explicit. The label states that a single capsule taken during pregnancy can cause severe birth defects. Dispensing runs through the THALOMID REMS programme, which requires pregnancy exclusion before treatment and two reliable contraceptive methods thereafter. The patients receiving it have multiple myeloma or a disabling inflammatory complication of leprosy, not morning sickness. The 1961 disaster happened because a drug with no reproductive toxicology testing was given to pregnant women for a self-limiting symptom; every element of that sentence is different now.',
        auditNote:
          'Vargesson records a new generation of thalidomide-damaged children in Brazil, where the drug is distributed for leprosy. The control system is what makes the difference, and control systems can fail.',
      },
      {
        q: 'Why did nobody know it was teratogenic before 1961?',
        a: "Because nobody was required to look. Before the Kefauver-Harris amendments of 1962 there was no obligation to test a drug for effects on the developing embryo, and animal reproductive toxicology was not a standard part of a submission. There is also a species trap: thalidomide is not strongly teratogenic in rats and mice, the routine test species, and is teratogenic in rabbits and primates. Even a conscientious 1957 programme might have missed it. That is precisely why the regulatory response was to mandate the testing rather than to blame the individual company's judgement.",
      },
      {
        q: 'Could you separate the good effect from the birth defects?',
        a: 'Two ideas were tried, and the honest answer so far is no. The first was chirality: thalidomide has one stereocentre, and it was hoped one mirror image was sedative and the other teratogenic. That failed for a chemical reason — the molecule racemises in plasma within minutes, so administering one enantiomer does not keep it pure. The second is analogue design, made possible by the 2010 identification of cereblon. Ito and colleagues framed it cautiously as work that "may contribute to the development of new thalidomide derivatives without teratogenic activity". Both marketed successors, lenalidomide and pomalidomide, are more potent and better tolerated neurologically and both remain teratogenic and REMS-restricted.',
      },
      {
        q: 'Did the myeloma discovery come from understanding the mechanism?',
        a: 'No, and the sequence is worth stating in order. Thalidomide was tried in myeloma in the late 1990s on the reasoning that bone marrow vascularity predicts poor prognosis and thalidomide is antiangiogenic. It produced a 32% response rate — and the same paper reported that microvascular density did not change significantly in responders. So the drug worked and the stated mechanism did not explain it. Cereblon was not identified until 2010, eleven years later. A clinically correct decision was reached from a hypothesis the trial itself disconfirmed, which is a more common pattern in drug development than the tidy version admits.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Singhal S et al. Antitumor activity of thalidomide in refractory multiple myeloma. N Engl J Med 1999;341:1565-1571',
        identifier: '10.1056/NEJM199911183412102',
        kind: 'doi',
      },
      {
        label:
          'Ito T et al. Identification of a primary target of thalidomide teratogenicity. Science 2010;327:1345-1350',
        identifier: '10.1126/science.1177319',
        kind: 'doi',
      },
      {
        label:
          'Vargesson N. Thalidomide-induced teratogenesis: history and mechanisms. Birth Defects Res C Embryo Today 2015;105:140-156',
        identifier: '10.1002/bdrc.21096',
        kind: 'doi',
      },
      {
        label:
          'Kim JH, Scialli AR. Thalidomide: the tragedy of birth defects and the effective treatment of disease. Toxicol Sci 2011;122:1-6',
        identifier: '10.1093/toxsci/kfr088',
        kind: 'doi',
      },
      {
        label:
          'Drugs@FDA: THALOMID (thalidomide), NDA 020785, Celgene / Bristol Myers Squibb — original approval 16 July 1998, myeloma supplement approved 25 May 2006',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020785',
        kind: 'regulatory',
      },
      {
        label:
          'THALOMID US Prescribing Information — boxed warning for embryo-fetal toxicity and venous thromboembolism, and the THALOMID REMS programme',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22THALOMID%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 5426 — thalidomide structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5426',
        kind: 'url',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 9. Diethylstilbestrol
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'diethylstilbestrol',
    name: 'Diethylstilbestrol',
    tradeName: 'DES; formerly Stilbestrol, Stilphostrol',
    sponsor: 'Never patented — manufactured by many companies; Eli Lilly held NDA 004041',
    targetGene: 'ESR1 and ESR2',
    targetProtein: 'Estrogen receptor alpha and beta',
    modality: 'Small Molecule',
    approvalStatus: 'Withdrawn from Market',
    approvalYear: 1941,
    indication:
      'Formerly prescribed to prevent miscarriage and pregnancy complications, and later for prostate and breast cancer. The FDA notified prescribers in 1971 that DES should not be given to pregnant women. All United States applications are recorded in Drugs@FDA as Discontinued.',
    patientFriendlyIndication:
      'A synthetic oestrogen once given to pregnant women to prevent miscarriage',
    anatomicalSite:
      'Estrogen receptors throughout the body; the injury site is the Müllerian duct of the developing female fetus',
    conditionContext: {
      conditionExplainer:
        "DES is the first drug proven to be a transplacental carcinogen: taken by a pregnant woman, it produced cancer in her daughter two decades later. Nothing in the pharmacology of 1940 predicted that a drug's harm could skip a generation and take twenty years to appear.",
      whyItMatters:
        'It was prescribed to an estimated 5 to 10 million Americans between 1940 and 1971 for an indication a randomised trial had already shown it did not achieve. The evidence that it did not work was published in 1953; the evidence that it caused cancer arrived in 1971.',
      whoTakesThis:
        'Nobody, in pregnancy or otherwise, in the United States. The population that matters now is the DES daughters and sons still under surveillance, and the third generation.',
      clinicalGoals:
        'The stated goal was preventing miscarriage and prematurity. The 1953 double-blind placebo-controlled trial asked in its title whether the drug had therapeutic value, and answered no.',
    },
    oneSentenceVerdict:
      'A synthetic oestrogen given to millions of pregnant women for an effect a 1953 randomised trial had already failed to find, which turned out to be a transplacental carcinogen and to raise the lifetime risk of infertility, preterm delivery, ectopic pregnancy and breast cancer in the daughters exposed in the womb.',
    laymanHowItWorks:
      'DES is not a steroid but it fits the oestrogen receptor and switches it on. In an adult that produces ordinary oestrogen effects. In a female fetus, the tissue that will become the vagina, cervix and uterus is being laid down, and a strong oestrogen signal at that moment permanently rewires it — leaving misplaced glandular tissue that can become cancer twenty years later, and a uterus shaped wrongly enough to make pregnancies fail.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 95,
    substitutes: {
      summary:
        'There is no substitute because the indication no longer exists: no oestrogen is used to prevent miscarriage. Progesterone supplementation has its own contested evidence in specific settings. In advanced prostate cancer, where DES was also used, GnRH agonists and antagonists replaced it.',
      conventionalRx: [
        {
          name: 'Vaginal progesterone',
          class: 'Progestogen',
          howItCompares:
            'The modern candidate in threatened miscarriage and short cervix, on a far more careful evidence base than DES ever had, with benefit confined to defined subgroups rather than claimed universally.',
          typicalCost: 'Not priced here',
          prosAndCons:
            'Pros: no transplacental carcinogenicity signal, effect limited to specific indications. Cons: benefit is modest and restricted, and general use in unselected threatened miscarriage is not supported.',
        },
        {
          name: 'GnRH agonists and antagonists',
          class: 'Hypothalamic-pituitary axis suppressants',
          howItCompares:
            'Replaced DES in advanced prostate cancer, delivering androgen suppression without the thromboembolic and cardiovascular burden that high-dose oestrogen carried.',
          typicalCost: 'Not priced here',
          prosAndCons:
            'Pros: far lower thromboembolic risk. Cons: hot flushes, bone loss, metabolic effects.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC/C(=C(/CC)\\C1=CC=C(C=C1)O)/C2=CC=C(C=C2)O',
      chemicalFormula: 'C18H20O2',
      molecularWeight: '268.3 g/mol',
      targetReceptorAffinity:
        'A non-steroidal stilbene that binds estrogen receptor alpha and beta with affinity comparable to or greater than estradiol. The trans (E) isomer is the active form; the cis isomer is far weaker. Its non-steroidal skeleton is the reason it is orally active where estradiol largely is not, and the reason it was never patented — the structure was published openly in 1938.',
      structureSource: {
        label:
          'PubChem CID 448537 (diethylstilbestrol) — canonical SMILES, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/448537',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'des-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity and geometric isomer confirmation',
          description:
            'Confirm the (E) configuration across the central double bond. The E and Z isomers differ several-fold in receptor affinity and interconvert under ultraviolet light, so an assay that does not resolve them does not measure potency.',
          reagentsAndBuffer:
            'Diethylstilbestrol certified reference standard, reversed-phase HPLC capable of resolving E and Z isomers, UV detection at 240 nm, NMR nuclear Overhauser experiments for configuration, samples protected from light throughout',
        },
        {
          id: 'des-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Residue screening in food-producing animals',
          description:
            'DES was used as a growth promoter in cattle and poultry and is banned for that purpose. Residue surveillance in tissue is now a routine regulatory assay and is the main analytical context in which the compound is still measured at scale.',
          dependsOnStepId: 'des-w1',
          reagentsAndBuffer:
            'Tissue homogenate with enzymatic deconjugation, solid-phase extraction, derivatisation for GC-MS/MS or direct LC-MS/MS in negative electrospray, deuterated diethylstilbestrol internal standard, confirmation against regulatory decision limits',
        },
        {
          id: 'des-w3',
          stepNumber: 3,
          phase: 'Assay_Quantification',
          name: 'Estrogen receptor binding and transactivation',
          description:
            'Measure competitive displacement of labelled estradiol from recombinant ER-alpha and ER-beta, then confirm functional agonism in an estrogen response element reporter. Running both receptor subtypes matters: subtype selectivity is one of the variables that distinguishes DES from estradiol in developing tissue.',
          dependsOnStepId: 'des-w2',
          reagentsAndBuffer:
            'Recombinant human ER-alpha and ER-beta ligand-binding domains, [3H]-17-beta-estradiol, hydroxyapatite or dextran-coated charcoal separation, ERE-luciferase reporter in MCF-7 or HEK293 cells',
        },
        {
          id: 'des-w4',
          stepNumber: 4,
          phase: 'Assay_Quantification',
          name: 'Developmental reprogramming readout in the murine reproductive tract',
          description:
            'The neonatal mouse model reproduces the human phenotype: DES exposure during Müllerian duct differentiation produces persistent vaginal adenosis and uterine abnormalities that appear long after exposure ends. Score epithelial phenotype and the HOX gene expression pattern that governs regional identity in the tract.',
          dependsOnStepId: 'des-w3',
          reagentsAndBuffer:
            'Neonatal mouse reproductive tract, immunohistochemistry for cytokeratins and p63, quantitative PCR for Hoxa9, Hoxa10 and Hoxa11, ER-alpha knockout controls to establish receptor dependence',
        },
      ],
    },
    keyAudits: [
      {
        id: 'des-a1',
        category: 'failed',
        title: 'The 1953 randomised trial asked whether it worked, and the answer was no',
        laymanSummary:
          'A double-blind placebo-controlled trial published in 1953 tested whether DES prevented pregnancy complications. It did not. The drug went on being prescribed for another eighteen years.',
        technicalDetails:
          'Dieckmann, Davis, Rynkiewicz and Pottinger reported a controlled trial at the Chicago Lying-In Hospital under the title "Does the administration of diethylstilbestrol during pregnancy have therapeutic value?" — and concluded that it did not. The study is unusual for its era in being placebo-controlled and blinded, and its trial records were durable enough that the Titus-Ernstoff cancer follow-up later used them to establish exposure status for the mothers. The finding did not change prescribing. DES continued to be given to pregnant women in the United States until the FDA notified prescribers against it in 1971, following the cancer report rather than the efficacy failure.',
        evidenceSource:
          'Dieckmann WJ, Davis ME, Rynkiewicz LM, Pottinger RE. Am J Obstet Gynecol 1953;66:1062-1081',
        doi: '10.1016/S0002-9378(16)38617-3',
        measuredMetric:
          'Pregnancy outcomes on diethylstilbestrol versus placebo in a blinded controlled trial',
        auditFlag: 'verified',
      },
      {
        id: 'des-a2',
        category: 'measured',
        title: 'Herbst 1971: clear-cell adenocarcinoma of the vagina in the daughters',
        laymanSummary:
          'A cluster of a cancer that essentially never occurs in young women turned out to trace back to what their mothers had taken while pregnant with them, twenty years earlier.',
        technicalDetails:
          'Herbst, Ulfelder and Poskanzer reported the association between maternal stilbestrol therapy and the appearance of adenocarcinoma of the vagina in young women. Clear-cell adenocarcinoma of the vagina in adolescents and women in their early twenties was, before this, close to unheard of, and it was the improbability of the tumour type in that age group that made a small case series decisive. This is the first established example of a transplacental carcinogen in humans: exposure in one generation, malignancy in the next, with a latency of two decades. The FDA notified prescribers soon afterwards that DES should not be given to pregnant women.',
        evidenceSource: 'Herbst AL, Ulfelder H, Poskanzer DC. N Engl J Med 1971;284:878-881',
        doi: '10.1056/NEJM197104222841604',
        measuredMetric:
          'Association between maternal stilbestrol exposure and vaginal adenocarcinoma in young women',
        auditFlag: 'verified',
      },
      {
        id: 'des-a3',
        category: 'measured',
        title: 'About 40 times the risk of clear-cell adenocarcinoma, at about 1 in 1,000',
        laymanSummary:
          'Daughters exposed before birth have roughly forty times the usual risk of this cancer. In absolute terms, about one in a thousand developed it.',
        technicalDetails:
          'The National Cancer Institute states that DES daughters have about 40 times the risk of developing clear cell adenocarcinoma of the lower genital tract as unexposed women, while noting that the cancer remains rare: approximately 1 in 1,000 DES daughters developed it. Both numbers belong on the page. The relative risk is what identified the drug as a carcinogen; the absolute risk is what an individual DES daughter is actually facing, and the two answer different questions. NCI estimates that 5 to 10 million Americans — pregnant women and the children born to them — were exposed between 1940 and 1971.',
        evidenceSource: 'National Cancer Institute, Diethylstilbestrol (DES) and Cancer fact sheet',
        measuredMetric:
          'Relative and absolute risk of clear cell adenocarcinoma of the lower genital tract in DES daughters',
        auditFlag: 'verified',
      },
      {
        id: 'des-a4',
        category: 'measured',
        title: 'Twelve adverse outcomes measured in 4,653 exposed women over four decades',
        laymanSummary:
          'The cancer was the headline and it was not the biggest burden. Infertility, preterm delivery, ectopic pregnancy and second-trimester loss were all several times more common in exposed daughters.',
        technicalDetails:
          'Hoover and colleagues combined three cohorts begun in the 1970s: 4,653 women exposed in utero to DES and 1,927 unexposed controls, with cumulative risks calculated to age 45 for reproductive outcomes and to age 55 for others. Exposed versus unexposed cumulative risks were: infertility 33.3% versus 15.5% (HR 2.37, 95% CI 2.05 to 2.75); spontaneous abortion 50.3% versus 38.6% (HR 1.64, 1.42 to 1.88); preterm delivery 53.3% versus 17.8% (HR 4.68, 3.74 to 5.86); loss of second-trimester pregnancy 16.4% versus 1.7% (HR 3.77, 2.56 to 5.54); ectopic pregnancy 14.6% versus 2.9% (HR 3.72, 2.58 to 5.38); pre-eclampsia 26.4% versus 13.7% (HR 1.42, 1.07 to 1.89); stillbirth 8.9% versus 2.6% (HR 2.45, 1.33 to 4.54); early menopause 5.1% versus 1.7% (HR 2.35, 1.67 to 3.31); CIN grade 2 or higher 6.9% versus 3.4% (HR 2.28, 1.59 to 3.27); and breast cancer at age 40 or older 3.9% versus 2.2% (HR 1.82, 1.04 to 3.18). For most outcomes risk was higher in those with baseline vaginal epithelial changes, which correlate with higher dose and earlier exposure.',
        evidenceSource: 'Hoover RN et al., N Engl J Med 2011;365:1304-1314',
        doi: '10.1056/NEJMoa1013961',
        measuredMetric:
          'Cumulative risk of twelve adverse outcomes to ages 45 and 55, exposed versus unexposed',
        auditFlag: 'verified',
      },
      {
        id: 'des-a5',
        category: 'measured',
        title: 'A dose-response gradient inside the exposed cohort',
        laymanSummary:
          'Within the exposed group, the women whose tissue showed the most evidence of early high-dose exposure had the highest risk of nearly every outcome. That gradient is what makes the association causal rather than coincidental.',
        technicalDetails:
          'Hoover et al. stratified by the baseline presence or absence of vaginal epithelial changes, a marker correlated with higher dose of, and earlier exposure to, DES in utero. For most of the twelve outcomes, risks among exposed women were higher for those with vaginal epithelial changes than for those without. An internal dose-response gradient of this kind is among the strongest observational evidence available for causation, because it cannot easily be produced by confounding between exposed and unexposed groups — the comparison is entirely within the exposed cohort.',
        evidenceSource: 'Hoover RN et al., N Engl J Med 2011;365:1304-1314',
        doi: '10.1056/NEJMoa1013961',
        measuredMetric:
          'Outcome risk stratified by baseline vaginal epithelial changes within the exposed cohort',
        auditFlag: 'verified',
      },
      {
        id: 'des-a6',
        category: 'measured',
        title: 'The mothers were harmed too, at a modest relative risk',
        laymanSummary:
          'The women who took the drug, not just their daughters, had a slightly raised risk of breast cancer — about 27% higher.',
        technicalDetails:
          'Titus-Ernstoff and colleagues combined two cohorts of women exposed to DES during pregnancy, with exposure status established from medical records of the Mothers Study cohort or from the clinical trial records of the Dieckmann Study. Poisson regression gave a relative risk for breast cancer of 1.27 (95% CI 1.07 to 1.52). The increase was not exacerbated by family history of breast cancer, oral contraceptive use or hormone replacement therapy. No association was found with ovarian, endometrial or other cancers. The size of this effect is worth keeping in proportion: it is a modest excess in the mothers, against a 40-fold relative risk of a specific rare cancer and a broad spectrum of reproductive harm in the daughters.',
        evidenceSource: 'Titus-Ernstoff L et al., Br J Cancer 2001;84:126-133',
        doi: '10.1054/bjoc.2000.1521',
        measuredMetric: 'Relative risk of breast cancer in women given DES during pregnancy',
        auditFlag: 'verified',
      },
      {
        id: 'des-a7',
        category: 'inferred',
        title:
          'The whole indication was an inference from endocrinology that was never tested first',
        laymanSummary:
          'The reasoning was that miscarriage follows low hormone levels, so giving a strong hormone should prevent it. The reasoning came first, the prescribing came second, and the trial came eleven years after that.',
        technicalDetails:
          'DES was licensed in 1941 and promoted for the prevention of miscarriage on a physiological argument: pregnancy loss was associated with low oestrogen, therefore supplementing oestrogen should reduce loss. The argument moved from mechanism to prescription without an intervening controlled trial. When the trial was finally run and published in 1953 it found no therapeutic value, and prescribing continued regardless for a further eighteen years. Two distinct failures are stacked here — an untested causal inference, and then the failure of a negative trial to change practice — and it is the second that turned a useless drug into a generational injury.',
        evidenceSource:
          'Dieckmann WJ et al., Am J Obstet Gynecol 1953;66:1062-1081; National Cancer Institute DES fact sheet',
        doi: '10.1016/S0002-9378(16)38617-3',
        inferredClaim:
          'That supplementing oestrogen would prevent miscarriage, because miscarriage is associated with lower oestrogen levels',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Taken orally, and it survives the first pass',
        laymanDesc:
          "Unlike the body's own oestrogen, this one works well as a tablet, which is a large part of why it was used so widely.",
        molecularDetail:
          'Non-steroidal stilbene structure gives good oral bioavailability where natural estradiol is largely inactivated on first pass. It was never patented, so it was manufactured cheaply by many companies at once.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Crosses the placenta into the fetus',
        laymanDesc:
          "It passes from the mother's bloodstream into the developing baby, which is where the lasting damage happened.",
        molecularDetail:
          'Freely transplacental. The exposure window that matters is Müllerian duct differentiation in the first trimester, which is why outcome severity in the cohort data tracks with earlier exposure.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Binds the oestrogen receptor',
        laymanDesc:
          "It fits the same receptor the body's own oestrogen uses and switches it on, in tissue that was never meant to receive that signal yet.",
        molecularDetail:
          'Binds ER-alpha and ER-beta with affinity comparable to or exceeding estradiol; the ligand-receptor complex acts as a transcription factor at estrogen response elements throughout the genome.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The developing reproductive tract is permanently rewired',
        laymanDesc:
          'The tissue that becomes the vagina, cervix and uterus takes its instructions during a narrow window. A strong oestrogen signal in that window changes those instructions for life.',
        molecularDetail:
          'Disrupted HOX gene expression along the Müllerian duct alters regional identity, producing vaginal adenosis — glandular epithelium where squamous epithelium belongs — cervical and uterine structural abnormalities including the T-shaped uterus, and persistently altered epithelial differentiation. The change is developmental and permanent, not pharmacological and reversible.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Cancer at twenty, and a lifetime of reproductive failure',
        laymanDesc:
          'Around one in a thousand exposed daughters developed a rare vaginal cancer. Far more had infertility, premature births, ectopic pregnancies and second-trimester losses.',
        molecularDetail:
          'Measured endpoints: about 40-fold relative risk of clear cell adenocarcinoma at an absolute risk near 1 in 1,000; infertility 33.3% versus 15.5%; preterm delivery 53.3% versus 17.8%; ectopic pregnancy 14.6% versus 2.9%; second-trimester loss 16.4% versus 1.7%; breast cancer at 40 or older 3.9% versus 2.2%.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Dieckmann et al. Chicago Lying-In Hospital controlled trial (1953)',
        phase: 'Blinded placebo-controlled trial in pregnancy',
        sampleSize: 0,
        primaryEndpoint:
          'Pregnancy complications and losses on diethylstilbestrol versus placebo — "Does the administration of diethylstilbestrol during pregnancy have therapeutic value?"',
        endpointMet: false,
        statisticalPValue:
          'The trial found no therapeutic value; its records were durable enough to establish maternal exposure status in the later Titus-Ernstoff cancer follow-up',
        unreportedAdverseSignals:
          'No adverse outcome then known could have been detected, because the injury appeared in the offspring roughly two decades after the trial ended.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'NCI Combined DES Cohort Follow-up (Hoover et al.)',
        phase: 'Combined prospective cohort study with 40 years of follow-up',
        sampleSize: 6580,
        primaryEndpoint:
          'Cumulative risk of twelve adverse outcomes to age 45 (reproductive) and age 55 (other) in 4,653 exposed women versus 1,927 unexposed controls',
        endpointMet: true,
        statisticalPValue:
          'Hazard ratios from 1.42 for pre-eclampsia to 4.68 for preterm delivery, all with confidence intervals excluding 1',
        unreportedAdverseSignals:
          'Risk was higher in exposed women with baseline vaginal epithelial changes, a marker of higher dose and earlier exposure — an internal dose-response gradient.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Combined maternal cohorts (Titus-Ernstoff et al.)',
        phase: 'Combined cohort analysis of women who took DES in pregnancy',
        sampleSize: 0,
        primaryEndpoint:
          'Cancer incidence, particularly hormonally mediated tumours, in exposed mothers',
        endpointMet: true,
        statisticalPValue:
          'Breast cancer relative risk 1.27 (95% CI 1.07 to 1.52); no association with ovarian, endometrial or other cancer',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'No therapeutic value in preventing pregnancy complications, in a blinded placebo-controlled trial published in 1953',
        'About 40 times the relative risk of clear cell adenocarcinoma of the lower genital tract, at an absolute risk of roughly 1 in 1,000 DES daughters',
        'Infertility 33.3% versus 15.5%, preterm delivery 53.3% versus 17.8%, ectopic pregnancy 14.6% versus 2.9% and second-trimester loss 16.4% versus 1.7% in 4,653 exposed women',
        'Breast cancer relative risk 1.27 (1.07 to 1.52) in the mothers who took the drug',
      ],
      unsupportedInferences: [
        'That supplementing oestrogen prevents miscarriage, because miscarriage is associated with lower oestrogen',
        'That a drug shown to be safe in the woman taking it is safe for the fetus she is carrying — DES is the case that established transplacental carcinogenesis as a category',
      ],
      whatFailedInitially: [
        'The 1953 randomised trial found no therapeutic value and prescribing continued for eighteen more years',
        'The FDA acted in 1971 on the cancer report, not on the 1953 efficacy failure',
        'An estimated 5 to 10 million Americans were exposed between 1940 and 1971',
      ],
      realWorldOutcome: [
        'All United States diethylstilbestrol applications are recorded in Drugs@FDA as Discontinued',
        "DES established that a drug's harm can appear in the next generation after a two-decade latency, which is why reproductive and developmental toxicology now examines offspring outcomes rather than only maternal ones",
        'DES daughters remain under gynaecological surveillance, and third-generation follow-up through the NCI cohorts is ongoing',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet; also an injectable diphosphate form for prostate cancer',
      description:
        'Orally active because its non-steroidal stilbene skeleton escapes the first-pass inactivation that limits natural estradiol. It was never patented, so it was made cheaply by many manufacturers, which is part of why exposure reached the scale it did.',
      safetyProfile:
        'Contraindicated in pregnancy since 1971. The measured harms in daughters exposed in utero are an approximately 40-fold relative risk of clear cell adenocarcinoma of the lower genital tract, and cumulative risks of infertility, preterm delivery, ectopic pregnancy, second-trimester loss, pre-eclampsia, stillbirth, early menopause, high-grade cervical intraepithelial neoplasia and breast cancer after 40, all significantly raised. In the mothers, breast cancer relative risk was 1.27. High-dose oestrogen also carries substantial thromboembolic and cardiovascular risk, which is why it was displaced in prostate cancer.',
    },
    commonQuestions: [
      {
        q: 'Why did prescribing continue after the 1953 trial showed it did not work?',
        a: 'That is the hardest question on this page and the record does not offer a comfortable answer. The trial was published in a major obstetrics journal, was blinded and placebo-controlled, and its title asked the question directly. What it lacked was any mechanism to force the conclusion into practice: no regulatory obligation to withdraw an approved indication on negative efficacy data, no systematic evidence review, and a strong physiological story that felt more compelling than a single trial. Prescribing ran for another eighteen years, and it stopped in 1971 because of a cancer report rather than because the drug had been shown not to work.',
        auditNote:
          'This is the clearest case in this file of a negative efficacy result failing to change anything. Every subsequent drug on this page was withdrawn for harm; DES should have been withdrawn for uselessness eighteen years earlier.',
      },
      {
        q: 'How can a drug cause cancer in someone who never took it?',
        a: 'DES is the case that established the category. It crosses the placenta freely and reaches the fetus during the window in which the Müllerian duct — the tissue that becomes the vagina, cervix and uterus — is being patterned. A strong oestrogen signal at that moment permanently alters the regional identity of that tissue, leaving glandular epithelium in places that should be squamous. That misplaced tissue is what becomes clear cell adenocarcinoma, typically in the late teens or early twenties. The exposure is in one generation, the malignancy is in the next, and the latency is about twenty years — a shape of harm that no drug safety system before 1971 was built to detect.',
      },
      {
        q: 'Is the cancer the main problem for DES daughters?',
        a: 'No, and this is where the numbers correct the headline. Clear cell adenocarcinoma is what identified the drug, and it affected roughly 1 in 1,000 exposed daughters. The reproductive burden was far more widespread: in the combined cohort of 4,653 exposed women, infertility reached 33.3% against 15.5% in controls, preterm delivery 53.3% against 17.8%, ectopic pregnancy 14.6% against 2.9%, and second-trimester loss 16.4% against 1.7%. A drug given to prevent pregnancy loss made pregnancy loss dramatically more likely in the next generation.',
      },
      {
        q: 'Why does this page not show a price?',
        a: 'Because DES was never patented and was made by many manufacturers, and every United States application is now recorded in Drugs@FDA as Discontinued. There is no current list price to cite and no verified per-dose manufacturing cost. Its cheapness is historically relevant — it is part of why exposure reached millions — but that is a fact about the era, not a number this page can source per dose.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Herbst AL, Ulfelder H, Poskanzer DC. Adenocarcinoma of the vagina: association of maternal stilbestrol therapy with tumor appearance in young women. N Engl J Med 1971;284:878-881',
        identifier: '10.1056/NEJM197104222841604',
        kind: 'doi',
      },
      {
        label:
          'Hoover RN et al. Adverse health outcomes in women exposed in utero to diethylstilbestrol. N Engl J Med 2011;365:1304-1314',
        identifier: '10.1056/NEJMoa1013961',
        kind: 'doi',
      },
      {
        label:
          'Dieckmann WJ, Davis ME, Rynkiewicz LM, Pottinger RE. Does the administration of diethylstilbestrol during pregnancy have therapeutic value? Am J Obstet Gynecol 1953;66:1062-1081',
        identifier: '10.1016/S0002-9378(16)38617-3',
        kind: 'doi',
      },
      {
        label:
          'Titus-Ernstoff L et al. Long-term cancer risk in women given diethylstilbestrol (DES) during pregnancy. Br J Cancer 2001;84:126-133',
        identifier: '10.1054/bjoc.2000.1521',
        kind: 'doi',
      },
      {
        label:
          'National Cancer Institute: Diethylstilbestrol (DES) and Cancer — exposure estimate, 40-fold relative risk and approximately 1 in 1,000 absolute risk of clear cell adenocarcinoma',
        identifier:
          'https://www.cancer.gov/about-cancer/causes-prevention/risk/hormones/des-fact-sheet',
        kind: 'regulatory',
      },
      {
        label: 'Drugs@FDA: DIETHYLSTILBESTROL, NDA 004041, Eli Lilly — Discontinued',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=004041',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 448537 — diethylstilbestrol structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/448537',
        kind: 'url',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 10. Cisapride
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'cisapride',
    name: 'Cisapride',
    tradeName: 'Propulsid',
    sponsor: 'Janssen Pharmaceutica (NDA 020210)',
    targetGene: 'HTR4',
    targetProtein:
      'Serotonin 5-HT4 receptor (therapeutic target); hERG / KCNH2 potassium channel (toxicity target)',
    modality: 'Small Molecule',
    approvalStatus: 'Withdrawn from Market',
    approvalYear: 1993,
    indication:
      'Symptomatic treatment of nocturnal heartburn due to gastro-oesophageal reflux disease. Withdrawn from the United States market in 2000 and listed by the FDA among drug products withdrawn for reasons of safety or effectiveness (81 FR 69668).',
    patientFriendlyIndication:
      'A tablet for night-time heartburn that made the stomach empty faster',
    anatomicalSite:
      'Enteric nervous system of the gut wall; the toxicity site is the ventricular myocyte',
    conditionContext: {
      conditionExplainer:
        'Cisapride was a prokinetic: it made the gut push contents along faster, which reduced reflux. The indication it was licensed for — nocturnal heartburn — is uncomfortable and not dangerous.',
      whyItMatters:
        'That asymmetry is the whole case. A drug that blocks the hERG cardiac potassium channel at nanomolar concentrations, and that is cleared by an enzyme dozens of common drugs inhibit, was being taken for a symptom that acid suppression treats safely.',
      whoTakesThis:
        'Nobody by prescription in the United States. It remains available in veterinary medicine and, in some countries, through limited-access programmes.',
      clinicalGoals:
        'Faster gastric emptying and fewer reflux symptoms. The endpoint that ended it was torsades de pointes.',
    },
    oneSentenceVerdict:
      'A heartburn drug that blocked the hERG cardiac potassium channel with a half-maximal inhibitory concentration of 6.5 nanomolar, and that the FDA linked to 341 reported patients with QT prolongation or ventricular arrhythmia, 80 of whom died.',
    laymanHowItWorks:
      'Cisapride told the nerve network in the gut wall to release more acetylcholine, so the stomach emptied faster and less acid washed back up. Separately, and by a completely different route, it plugged the potassium channel that heart muscle uses to reset itself after each beat. Because it was broken down by a liver enzyme that many common drugs — including some antibiotics and antifungals — block, ordinary co-prescribing could raise its blood level into the range where the heart effect became lethal.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 91,
    substitutes: {
      summary:
        'Proton pump inhibitors treat the licensed indication more effectively and have no QT signal. Among prokinetics, metoclopramide carries tardive dyskinesia rather than arrhythmia, domperidone has its own QT concerns, and prucalopride was designed as a 5-HT4 agonist with the hERG affinity engineered out.',
      conventionalRx: [
        {
          name: 'Proton pump inhibitors',
          class: 'Gastric H+/K+-ATPase inhibitors',
          howItCompares:
            'Treat nocturnal reflux by removing the acid rather than speeding transit, with no cardiac channel activity. They are the reason losing cisapride cost patients almost nothing.',
          typicalCost: 'Generic and over the counter; not priced here',
          prosAndCons:
            'Pros: effective, no QT signal, widely available. Cons: long-term use is associated with several debated risks including fracture and enteric infection.',
        },
        {
          name: 'Prucalopride',
          class: 'Selective 5-HT4 receptor agonist',
          howItCompares:
            'The direct answer to cisapride: same therapeutic target, designed for high 5-HT4 selectivity and negligible hERG affinity. It is licensed for chronic constipation and has been through dedicated cardiovascular safety assessment.',
          typicalCost: 'Not priced here',
          prosAndCons:
            'Pros: the therapeutic mechanism without the cardiac one. Cons: headache, nausea and diarrhoea are common; the licensed indication is constipation rather than reflux.',
        },
        {
          name: 'Metoclopramide',
          class: 'Dopamine D2 antagonist and weak 5-HT4 agonist',
          howItCompares:
            'The prokinetic that remained. Its dose-limiting harm is neurological rather than cardiac, and it carries a boxed warning for tardive dyskinesia.',
          typicalCost: 'Generic; not priced here',
          prosAndCons:
            'Pros: no comparable arrhythmia signal. Cons: tardive dyskinesia risk rises with duration, which is why courses are limited to twelve weeks.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CO[C@H]1CN(CC[C@H]1NC(=O)C2=CC(=C(C=C2)N)Cl)CCCOC3=CC=C(C=C3)F',
      chemicalFormula: 'C23H29ClFN3O4',
      molecularWeight: '465.9 g/mol',
      targetReceptorAffinity:
        'A substituted benzamide 5-HT4 receptor agonist. Its clinically decisive affinity, however, is at the hERG channel: half-maximal inhibition at 6.5 nM in HEK293 cells at 22 degrees Celsius, which is an unusually potent block for a drug given for heartburn. Cleared principally by CYP3A4.',
      structureSource: {
        label: 'PubChem CID 6917698 (cisapride) — canonical SMILES, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/6917698',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'cis-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity and stereochemical confirmation',
          description:
            'Confirm the cis relative configuration across the piperidine 3,4-positions — the feature the drug is named for — and the chloro-amino-methoxybenzamide head. Cisapride was marketed as a racemate of the cis diastereomer, so both relative and absolute configuration have to be reported.',
          reagentsAndBuffer:
            'Cisapride monohydrate certified reference standard, chiral stationary-phase HPLC, proton and 19F NMR, LC-MS with electrospray in positive mode showing the chlorine isotope pattern at m/z 466',
        },
        {
          id: 'cis-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Purity assay and veterinary formulation testing',
          description:
            'Cisapride remains in veterinary use and is compounded for animals, so purity and content-uniformity testing of compounded preparations is the main routine assay context. Reversed-phase HPLC with UV detection against the reference standard.',
          dependsOnStepId: 'cis-w1',
          reagentsAndBuffer:
            'C18 column, acetonitrile with phosphate buffer at pH 3, UV detection at 275 nm, content uniformity across compounded units',
        },
        {
          id: 'cis-w3',
          stepNumber: 3,
          phase: 'Assay_Quantification',
          name: 'hERG patch-clamp assay — the assay this drug created',
          description:
            'Whole-cell patch clamp of hERG channels stably expressed in HEK293 cells, measuring tail-current amplitude across a concentration series to derive IC50, with voltage-dependence and washout characterised. Cisapride is now one of the standard positive controls in this assay worldwide, and the assay itself became a regulatory requirement largely because of drugs like this one.',
          dependsOnStepId: 'cis-w2',
          reagentsAndBuffer:
            'HEK293 cells stably expressing hERG (KCNH2), whole-cell patch-clamp rig, external solution with 4 mM potassium, internal pipette solution with EGTA and ATP, step-and-tail voltage protocol, recordings at controlled temperature',
        },
        {
          id: 'cis-w4',
          stepNumber: 4,
          phase: 'Assay_Quantification',
          name: '5-HT4 receptor functional assay for therapeutic selectivity',
          description:
            'Measure cAMP accumulation at recombinant human 5-HT4 to establish agonist potency, then set it against the hERG IC50 from the previous step. The ratio of the two is the number that matters, and for cisapride it is unfavourable — which is exactly what the successor 5-HT4 agonists were designed to fix.',
          dependsOnStepId: 'cis-w3',
          reagentsAndBuffer:
            'HEK293 or CHO cells expressing human HTR4, forskolin-stimulated cAMP HTRF assay, serotonin as reference agonist, prucalopride as a selectivity comparator',
        },
        {
          id: 'cis-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'CYP3A4 interaction and exposure modelling',
          description:
            'Quantify cisapride depletion in human liver microsomes with and without ketoconazole, erythromycin and other CYP3A4 inhibitors, and model the resulting plasma concentration against the hERG IC50. This converts an in vitro channel number into the clinical scenario that killed people: a normal dose plus a common co-prescription.',
          dependsOnStepId: 'cis-w4',
          reagentsAndBuffer:
            'Pooled human liver microsomes with NADPH regenerating system, recombinant CYP3A4, ketoconazole and erythromycin as index inhibitors, LC-MS/MS quantification, physiologically based pharmacokinetic model for exposure projection',
        },
      ],
    },
    keyAudits: [
      {
        id: 'cis-a1',
        category: 'failed',
        title: 'FDA received reports on 341 patients; 80 of them died',
        laymanSummary:
          'Over six years on the market, the FDA collected reports of 341 patients who developed dangerous heart rhythm disturbances on cisapride. Eighty of them died.',
        technicalDetails:
          'Between 1993 and 1999 the FDA received reports of 117 patients with QT prolongation, 107 with torsades de pointes, 16 with polymorphic ventricular tachycardia, 18 with ventricular fibrillation, 27 with ventricular tachycardia, 25 with cardiac arrest, 16 with unspecified serious arrhythmia and 15 with sudden death — 341 individual patients in total. Eighty (23%) died, with deaths directly or indirectly associated with an arrhythmic event. The evidence supporting attribution included temporal relationship, absence of other identified risk factors in some patients, and cases of positive dechallenge and rechallenge. In most patients the arrhythmia occurred in the presence of risk factors, meaning other drugs or medical conditions.',
        evidenceSource: 'Wysowski DK et al., Am J Gastroenterol 2001;96:1698-1703',
        doi: '10.1111/j.1572-0241.2001.03927.x',
        measuredMetric:
          'Postmarketing reports of QT prolongation and ventricular arrhythmia, and associated deaths',
        auditFlag: 'verified',
      },
      {
        id: 'cis-a2',
        category: 'measured',
        title: 'hERG block at 6.5 nanomolar — the mechanism, measured directly',
        laymanSummary:
          "Patch-clamp recording showed cisapride plugs the heart's repolarising potassium channel at billionths-of-a-mole concentrations. That is extraordinarily potent for a heartburn drug.",
        technicalDetails:
          'Whole-cell patch clamp of hERG channels stably expressed in HEK293 cells gave dose-dependent block with a half-maximal inhibitory concentration of 6.5 nM at 22 degrees Celsius across 25 cells. Currents recovered rapidly on washout. Onset of block required channel activation, indicating open- or inactivated-state block, and the block was voltage dependent: at -20 mV, 10 nM cisapride reduced tail-current amplitude by 5%, while at +20 mV the same concentration reduced it by 45%; 100 nM reduced tail current by 66% and 90% at those two voltages. The authors concluded that hERG block may account for the clinical QT prolongation and ventricular arrhythmias.',
        evidenceSource: 'Mohammad S, Zhou Z, Gong Q, January CT. Am J Physiol 1997;273:H2534-H2538',
        doi: '10.1152/ajpheart.1997.273.5.H2534',
        measuredMetric: 'Half-maximal inhibitory concentration for hERG channel block',
        auditFlag: 'verified',
      },
      {
        id: 'cis-a3',
        category: 'conclusion_shift',
        title: 'The benefit-risk judgement turned on the indication, not the effect size',
        laymanSummary:
          'The drug worked. It was withdrawn because it was being taken for night-time heartburn, and a risk of fatal arrhythmia cannot be justified for that.',
        technicalDetails:
          'The FDA\'s stated conclusion was that the risk of fatal arrhythmia with cisapride was believed to outweigh the benefit for the approved indication — treatment of nocturnal heartburn due to gastro-oesophageal reflux disease — leading to discontinuation in the United States. That framing is precise and unusual: the finding was not that the drug failed, but that the harm was disproportionate to what the benefit was for. Cisapride now appears in the FDA\'s codified list of drug products withdrawn or removed from the market for reasons of safety or effectiveness, published at 81 FR 69668 on 7 October 2016, as "all drug products containing cisapride".',
        evidenceSource:
          'Wysowski DK et al., Am J Gastroenterol 2001;96:1698-1703; FDA final rule 81 FR 69668, 7 October 2016',
        doi: '10.1111/j.1572-0241.2001.03927.x',
        auditFlag: 'verified',
      },
      {
        id: 'cis-a4',
        category: 'failed',
        title: 'Four rounds of labelling changes did not stop the co-prescribing',
        laymanSummary:
          'Regulators tried repeatedly to fix the problem with warnings and contraindications rather than withdrawal. The reports kept coming, and most of them involved exactly the interactions the label warned about.',
        technicalDetails:
          'Wysowski and colleagues set out the FDA regulatory actions taken while cisapride was marketed, alongside the accumulating reports. The pattern is the important part: in most affected individuals the arrhythmia occurred in the presence of risk factors — concomitant drugs or medical conditions — which are precisely the circumstances successive label revisions had contraindicated. A contraindication is only a control if it changes prescribing, and here the same interaction categories kept appearing in reports after each revision. The eventual conclusion was that labelling could not manage the risk for this indication and the product had to come off the market.',
        evidenceSource: 'Wysowski DK et al., Am J Gastroenterol 2001;96:1698-1703',
        doi: '10.1111/j.1572-0241.2001.03927.x',
        measuredMetric:
          'Proportion of arrhythmia reports occurring in the presence of contraindicated risk factors',
        auditFlag: 'verified',
      },
      {
        id: 'cis-a5',
        category: 'inferred',
        title: 'Spontaneous reports count events, and they cannot give you a rate',
        laymanSummary:
          'The 341 figure is the number of reports the FDA received, not the number of people harmed. Under-reporting means the true count is higher, and without knowing how many people took the drug it is not a risk per patient.',
        technicalDetails:
          'The FDA case series is a spontaneous reporting analysis, and its own field has documented the limits. Pharmacoepidemiological studies of cisapride and QT prolongation have been criticised specifically for the difficulty of establishing incidence from these data. Spontaneous reports have no denominator, capture an unknown and variable fraction of true events, and are subject to stimulated reporting after publicity. What they establish well is that the events occur, that they are temporally associated, and — through positive dechallenge and rechallenge — that individual cases are drug-related. What they cannot supply is the per-patient risk, which is the number a prescriber would actually want.',
        evidenceSource:
          'Wysowski DK et al., Am J Gastroenterol 2001;96:1698-1703; Hennessy S. Pharmacoepidemiol Drug Saf 2003;12:31-40',
        doi: '10.1002/pds.781',
        inferredClaim:
          'That 341 reported patients and 80 deaths is a measure of how often cisapride caused fatal arrhythmia, rather than a count of reports with no denominator',
        auditFlag: 'caution',
      },
      {
        id: 'cis-a6',
        category: 'conclusion_shift',
        title:
          'Cisapride is now a standard positive control in the assay that would have caught it',
        laymanSummary:
          'Screening drugs for this heart channel effect was not routine when cisapride was approved. It is now mandatory, and cisapride itself is one of the reference compounds used to check the test works.',
        technicalDetails:
          'The identification of hERG as the molecular target of QT-prolonging drugs, published for terfenadine in 1996 and for cisapride in 1997, arrived after both were already marketed. Systematic preclinical assessment of hERG block and of clinical QT effect subsequently became a standard regulatory expectation for new drugs. Cisapride, with an IC50 of 6.5 nM, is now widely used as a reference blocker in hERG assay validation. The successor 5-HT4 agonist prucalopride was designed against exactly this liability. The scientific yield of the withdrawal was therefore a screening method, and the method arrived because the drugs failed first.',
        evidenceSource:
          'Mohammad S et al., Am J Physiol 1997;273:H2534-H2538; Roy M, Dumaine R, Brown AM. Circulation 1996;94:817-823',
        doi: '10.1152/ajpheart.1997.273.5.H2534',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'An oral tablet before meals and at bedtime',
        laymanDesc: 'Taken shortly before eating and at night, to work on the meal that follows.',
        molecularDetail:
          'Oral tablets and suspension. Absorbed rapidly and cleared principally by CYP3A4, the enzyme responsible for metabolising a very large share of prescription drugs and the point at which the fatal interactions occurred.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Reaches the nerve network in the gut wall',
        laymanDesc:
          "It acts on the gut's own nervous system, which runs the wave of contraction that moves food along.",
        molecularDetail:
          'Distributes to the myenteric plexus of the enteric nervous system, where 5-HT4 receptors sit on cholinergic neurons.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Agonist at 5-HT4 — and blocker at hERG',
        laymanDesc:
          'It switches on a serotonin receptor in the gut. Quite separately, it plugs a potassium channel in heart muscle.',
        molecularDetail:
          'Agonism at HTR4 on enteric cholinergic neurons enhances acetylcholine release. Independently, open- and inactivated-state block of the hERG (KCNH2) channel with an IC50 of 6.5 nM, voltage dependent and rapidly reversible on washout.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The gut speeds up; the heart takes longer to reset',
        laymanDesc:
          'Stomach emptying accelerates and reflux falls. In the heart, each beat takes longer to recover, which shows on an ECG as a longer QT interval.',
        molecularDetail:
          'Increased acetylcholine release enhances antral and oesophageal motility and lower oesophageal sphincter tone. In ventricular myocytes, reduced IKr prolongs repolarisation and the action potential duration, widening the QT interval and creating the substrate for early afterdepolarisations and torsades de pointes.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Heartburn improves; some patients go into torsades',
        laymanDesc:
          'The symptom it was licensed for got better. In hundreds of reported patients the heart rhythm broke down, and about a quarter of those reported died.',
        molecularDetail:
          'Measured endpoints: symptomatic improvement in nocturnal heartburn, against 341 reported patients with QT prolongation or ventricular arrhythmia between 1993 and 1999, of whom 80 (23%) died.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'FDA postmarketing surveillance analysis (Wysowski et al.)',
        phase: 'Spontaneous adverse event report analysis, 1993 to 1999',
        sampleSize: 341,
        primaryEndpoint:
          'Reports of QT prolongation, torsades de pointes and ventricular arrhythmia in association with cisapride, with assessment of probable aetiology and risk factors',
        endpointMet: true,
        statisticalPValue:
          'Not a hypothesis test; 341 individual patients reported, 80 (23%) died, with positive dechallenge and rechallenge in some cases',
        unreportedAdverseSignals:
          'Spontaneous reporting has no denominator and captures an unknown fraction of true events, so the count cannot be converted into a per-patient risk. In most affected individuals other drugs or medical conditions were present.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'hERG patch-clamp characterisation (Mohammad et al.)',
        phase: 'In vitro electrophysiology',
        sampleSize: 25,
        primaryEndpoint:
          'Concentration-dependent block of hERG tail current in stably transfected HEK293 cells',
        endpointMet: true,
        statisticalPValue:
          'IC50 6.5 nM at 22 degrees Celsius across 25 cells; 100 nM reduced tail-current amplitude by 66% at -20 mV and 90% at +20 mV',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'hERG channel block with a half-maximal inhibitory concentration of 6.5 nM in stably transfected HEK293 cells',
        'Voltage-dependent block: 10 nM reduced tail current by 5% at -20 mV and by 45% at +20 mV',
        '341 individual patients reported to the FDA with QT prolongation or ventricular arrhythmia between 1993 and 1999',
        '80 of those 341 patients (23%) died, with deaths directly or indirectly associated with an arrhythmic event',
      ],
      unsupportedInferences: [
        'That 341 reports and 80 deaths represent the incidence of harm — spontaneous reports have no denominator and under-capture events by an unknown factor',
        'That labelling contraindications would control an interaction-driven risk, when most reported events occurred in exactly the contraindicated circumstances',
      ],
      whatFailedInitially: [
        'Four rounds of FDA regulatory action while the drug was marketed did not stop arrhythmia reports arising from contraindicated co-prescribing',
        'Withdrawn from the United States market in 2000 and codified in the FDA withdrawn-for-safety list at 81 FR 69668',
      ],
      realWorldOutcome: [
        'Systematic hERG screening and clinical QT assessment became standard regulatory expectations for new drugs, and cisapride is now a routine positive control in the hERG assay',
        'Prucalopride was developed as a selective 5-HT4 agonist with the hERG liability engineered out — the therapeutic target survived the molecule',
        'Cisapride remains in veterinary use and in limited-access human programmes in some countries',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet and suspension, taken before meals and at bedtime',
      description:
        'Oral prokinetic taken 15 minutes before meals and at bedtime. Cleared principally by CYP3A4, which is the disposition feature that made it dangerous: azole antifungals, macrolide antibiotics, protease inhibitors and grapefruit juice all raise its plasma concentration towards the range where hERG block becomes clinically significant.',
      safetyProfile:
        'Withdrawn from the United States market in 2000 for QT prolongation and torsades de pointes. The measured harms are hERG block at 6.5 nM and 341 reported patients with QT prolongation or ventricular arrhythmia between 1993 and 1999, of whom 80 died. Risk was concentrated in patients taking CYP3A4 inhibitors or with electrolyte abnormalities, structural heart disease or existing QT prolongation.',
    },
    commonQuestions: [
      {
        q: 'Did cisapride actually work?',
        a: 'Yes, and the FDA\'s own framing says so. The stated conclusion was that the risk of fatal arrhythmia outweighed "the benefit for the approved indication" — not that there was no benefit. Cisapride accelerated gastric emptying and reduced reflux symptoms by a real mechanism. What defeated it is that the approved indication was nocturnal heartburn, which is unpleasant and not dangerous, and which proton pump inhibitors treat at least as well without touching cardiac potassium channels. A drug is judged against what it is for, and this one was being asked to justify a mortal risk against an entirely manageable symptom.',
        auditNote:
          'This is a benefit-risk withdrawal, not an efficacy failure. Recording it as "the drug did not work" would be wrong.',
      },
      {
        q: 'Why did warnings not solve the problem?',
        a: 'Because the risk was created by co-prescribing, and co-prescribing is a systems problem rather than a knowledge problem. Cisapride is cleared by CYP3A4, which is inhibited by common antifungals, macrolide antibiotics and protease inhibitors, and successive label revisions contraindicated exactly those combinations. The FDA analysis then found that in most affected individuals the arrhythmia occurred in the presence of risk factors — the very ones already contraindicated. A prescriber writing an antibiotic for a patient who takes a heartburn tablet is not consulting a contraindication list. Four rounds of labelling did not change that, which is why the product was eventually removed instead.',
      },
      {
        q: 'Is the whole class dangerous?',
        a: 'No. The therapeutic target and the toxic target are different proteins and can be separated by design, which is what happened next. Prucalopride is a selective 5-HT4 agonist developed specifically with high receptor selectivity and negligible hERG affinity, and it is licensed today. The lesson generalised into a method rather than an abandonment: run the hERG patch-clamp assay early, set the channel IC50 against the therapeutic potency, and do not proceed if the ratio is unfavourable. Cisapride is now one of the standard positive controls in that assay.',
      },
      {
        q: 'Why does this page not show a price?',
        a: 'Because the drug has had no United States human market since 2000 and is codified in the FDA withdrawn-for-safety list at 81 FR 69668. There is no current human list price to cite and no verified per-dose manufacturing cost.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Wysowski DK, Corken A, Gallo-Torres H, Talarico L, Rodriguez EM. Postmarketing reports of QT prolongation and ventricular arrhythmia in association with cisapride and Food and Drug Administration regulatory actions. Am J Gastroenterol 2001;96:1698-1703',
        identifier: '10.1111/j.1572-0241.2001.03927.x',
        kind: 'doi',
      },
      {
        label:
          'Mohammad S, Zhou Z, Gong Q, January CT. Blockage of the HERG human cardiac K+ channel by the gastrointestinal prokinetic agent cisapride. Am J Physiol 1997;273:H2534-H2538',
        identifier: '10.1152/ajpheart.1997.273.5.H2534',
        kind: 'doi',
      },
      {
        label:
          'Hennessy S. Prolongation of the QT interval and cardiac arrhythmias associated with cisapride: limitations of the pharmacoepidemiological studies conducted and proposals for the future. Pharmacoepidemiol Drug Saf 2003;12:31-40',
        identifier: '10.1002/pds.781',
        kind: 'doi',
      },
      {
        label:
          'FDA final rule: Additions and Modifications to the List of Drug Products That Have Been Withdrawn or Removed From the Market for Reasons of Safety or Effectiveness, 81 FR 69668, 7 October 2016 — "Cisapride: All drug products containing cisapride"',
        identifier:
          'https://www.federalregister.gov/documents/2016/10/07/2016-24333/additions-and-modifications-to-the-list-of-drug-products-that-have-been-withdrawn-or-removed-from',
        kind: 'regulatory',
      },
      {
        label: 'Drugs@FDA: PROPULSID (cisapride), NDA 020210, Janssen — Discontinued',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020210',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 6917698 — cisapride structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/6917698',
        kind: 'url',
      },
    ],
  },
]
