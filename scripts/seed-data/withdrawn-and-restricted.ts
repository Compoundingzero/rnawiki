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

  // ---------------------------------------------------------------------------------------------
  // 11. Terfenadine
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'terfenadine',
    name: 'Terfenadine',
    tradeName: 'Seldane / Triludan',
    sponsor: 'Marion Merrell Dow, then Hoechst Marion Roussel',
    targetGene: 'HRH1',
    targetProtein:
      'Histamine H1 receptor (therapeutic target); hERG / KCNH2 potassium channel (toxicity target)',
    modality: 'Small Molecule',
    approvalStatus: 'Withdrawn from Market',
    approvalYear: 1985,
    indication:
      'Seasonal allergic rhinitis and chronic idiopathic urticaria. Withdrawn from the United States market in the late 1990s and listed by the FDA among drug products withdrawn for reasons of safety or effectiveness (81 FR 69668).',
    patientFriendlyIndication: 'A hay fever tablet that did not make you drowsy',
    anatomicalSite:
      'Peripheral H1 receptors in nasal mucosa and skin; the toxicity site is the ventricular myocyte',
    conditionContext: {
      conditionExplainer:
        'Terfenadine was the first non-sedating antihistamine, and it worked because the active drug never reached the brain. What almost nobody realised until 1990 is that the tablet you swallow is not the active drug — it is a prodrug, converted almost completely to a different molecule on first pass through the liver.',
      whyItMatters:
        'The prodrug blocks a cardiac potassium channel. The metabolite does not. Under normal conditions almost no parent drug survives, so the heart never sees it. Block the enzyme that does the conversion — with an antifungal, an antibiotic, or grapefruit juice — and the parent accumulates.',
      whoTakesThis:
        'Nobody. Its active metabolite, fexofenadine, is available over the counter worldwide and is the same antihistamine without the cardiac liability.',
      clinicalGoals:
        'Relief of allergic rhinitis and urticaria without sedation. It achieved that entirely, which is what makes the drug\'s replacement by its own metabolite such an unusually clean resolution.',
    },
    oneSentenceVerdict:
      'A non-sedating antihistamine that turned out to be a prodrug whose parent molecule blocks the hERG channel as potently as quinidine while its active metabolite does not block it at all — so the drug was withdrawn and the metabolite was licensed in its place as fexofenadine.',
    laymanHowItWorks:
      'Terfenadine is converted in the liver, almost entirely and almost immediately, into a different molecule that blocks histamine receptors in the nose and skin without entering the brain. That metabolite is what actually relieves the symptoms. The unconverted parent, which normally exists only in trace amounts, blocks the potassium channel the heart uses to reset between beats. If anything stops the liver doing the conversion, the parent builds up and the heart rhythm can break down.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 92,
    substitutes: {
      summary:
        'The substitute is the drug\'s own active metabolite. Fexofenadine is terfenadine carboxylate, sold over the counter, with no cardiac potassium channel effect at clinically achievable concentrations. Loratadine, desloratadine and cetirizine were shown in the same comparative work to have no QT signal either.',
      conventionalRx: [
        {
          name: 'Fexofenadine',
          class: 'Second-generation H1 antihistamine',
          howItCompares:
            'It is terfenadine carboxylate — the active metabolite of terfenadine, marketed directly. In vitro it does not inhibit the delayed rectifier potassium current even at 30 times the concentration at which terfenadine produces half-maximal block.',
          typicalCost: 'Generic and over the counter; not priced here',
          prosAndCons:
            'Pros: identical antihistamine effect, no QT liability, no prodrug conversion step to be interfered with. Cons: absorption is reduced by fruit juices and by antacids containing aluminium or magnesium.',
        },
        {
          name: 'Loratadine and desloratadine',
          class: 'Second-generation H1 antihistamines',
          howItCompares:
            'Neither loratadine nor desloratadine significantly inhibits cardiac potassium channels at clinically achievable blood levels, and human volunteer studies found no electrocardiographic effect at several times the recommended dose or with metabolic inhibitors.',
          typicalCost: 'Generic and over the counter; not priced here',
          prosAndCons:
            'Pros: no arrhythmia signal, once daily. Cons: mild sedation in a minority at higher doses.',
        },
        {
          name: 'Cetirizine',
          class: 'Second-generation H1 antihistamine',
          howItCompares:
            'Also confirmed free of electrocardiographic effect in human volunteers at several times the recommended dose or with metabolic inhibitors present.',
          typicalCost: 'Generic and over the counter; not priced here',
          prosAndCons:
            'Pros: potent, no QT signal, renally cleared. Cons: more sedating than fexofenadine or loratadine.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CC(C)(C)C1=CC=C(C=C1)C(CCCN2CCC(CC2)C(C3=CC=CC=C3)(C4=CC=CC=C4)O)O',
      chemicalFormula: 'C32H41NO2',
      molecularWeight: '471.7 g/mol',
      targetReceptorAffinity:
        'A prodrug. Terfenadine itself is equipotent with quinidine as a blocker of the delayed rectifier potassium current in isolated myocytes, with an apparent hERG dissociation constant of 350 nmol/L against 2.7 micromol/L for Kv1.5 — a ten-fold selectivity for the ventricular channel. Its major metabolite, terfenadine carboxylate (fexofenadine), does not block either channel.',
      structureSource: {
        label: 'PubChem CID 5405 (terfenadine) — canonical SMILES, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5405',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ter-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity confirmation and separation from the carboxylate metabolite',
          description:
            'Confirm the tert-butylphenyl carbinol and diphenylmethanol piperidine halves, and — critically — resolve terfenadine from terfenadine carboxylate. The two differ by oxidation of a single tert-butyl methyl group to a carboxylic acid, and confusing them is the difference between the cardiotoxic molecule and the safe one.',
          reagentsAndBuffer:
            'Terfenadine and fexofenadine certified reference standards, C18 reversed-phase HPLC with the pair resolved to baseline, LC-MS/MS in positive electrospray at m/z 472 and 502 respectively, deuterated internal standards',
        },
        {
          id: 'ter-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Plasma quantification with a low limit of detection for the parent',
          description:
            'The clinically important measurement is unmetabolised parent terfenadine, which is normally undetectable. An assay whose limit of quantification is too high will report "none detected" in exactly the patients who are at risk, so method sensitivity is the whole point here.',
          dependsOnStepId: 'ter-w1',
          reagentsAndBuffer:
            'Plasma with liquid-liquid or solid-phase extraction, LC-MS/MS in multiple reaction monitoring with a sub-nanogram-per-millilitre limit of quantification for the parent, matrix-matched calibration',
        },
        {
          id: 'ter-w3',
          stepNumber: 3,
          phase: 'Assay_Quantification',
          name: 'hERG and Kv1.5 block, parent versus metabolite side by side',
          description:
            'Express hERG and Kv1.5 heterologously and measure block by terfenadine and by terfenadine carboxylate on the same preparation. Running both compounds is not optional: the entire scientific resolution of this drug is that one blocks the channel and the other does not.',
          dependsOnStepId: 'ter-w2',
          reagentsAndBuffer:
            'Xenopus oocytes or HEK293 cells expressing hERG (KCNH2) and Kv1.5 (KCNA5), two-electrode voltage clamp or whole-cell patch clamp, quinidine as a reference blocker, terfenadine carboxylate tested to at least 30-fold the terfenadine half-maximal concentration',
        },
        {
          id: 'ter-w4',
          stepNumber: 4,
          phase: 'Assay_Quantification',
          name: 'CYP3A4 conversion and inhibition study',
          description:
            'Quantify the rate of terfenadine to terfenadine carboxylate conversion in human liver microsomes, then repeat with ketoconazole or erythromycin present. This is the assay that reproduces in a tube the clinical study in which four of six healthy volunteers had to have their ketoconazole course shortened for repolarisation abnormalities.',
          dependsOnStepId: 'ter-w3',
          reagentsAndBuffer:
            'Pooled human liver microsomes with NADPH regenerating system, recombinant CYP3A4, ketoconazole and erythromycin as index inhibitors, LC-MS/MS quantification of parent and carboxylate',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ter-a1',
        category: 'measured',
        title: 'Ketoconazole made all six volunteers accumulate the parent drug and prolong their QT',
        laymanSummary:
          'Six healthy people took terfenadine for a week, then added a common antifungal. All six began accumulating the unconverted drug and their ECGs changed. Only two could finish the study.',
        technicalDetails:
          'Prospective cohort study with each subject as their own control: six healthy volunteers, four men and two women aged 24 to 35, taking no other medication, reached steady state on terfenadine 60 mg every 12 hours for seven days, then added ketoconazole 200 mg every 12 hours. All six had detectable levels of unmetabolised terfenadine after ketoconazole was added, associated with QT prolongation. Only two of the six could complete the full course of ketoconazole coadministration; four received a shortened course because of significant electrocardiographic repolarisation abnormalities. The area under the curve of the acid metabolite changed significantly. The authors\' conclusion was that the combination should be avoided.',
        evidenceSource:
          'Honig PK, Wortham DC, Zamani K, Conner DP, Mullin JC, Cantilena LR. JAMA 1993;269:1513-1518',
        measuredMetric:
          'Unmetabolised terfenadine plasma concentration and corrected QT interval before and after ketoconazole',
        auditFlag: 'verified',
      },
      {
        id: 'ter-a2',
        category: 'measured',
        title: 'The parent is as potent as quinidine; the metabolite does nothing to the channel',
        laymanSummary:
          'Laboratory recordings showed the swallowed drug blocks the heart\'s potassium current as strongly as a classic anti-arrhythmic. The molecule it turns into does not block it at all, even at thirty times the concentration.',
        technicalDetails:
          'Woosley and colleagues examined FDA Spontaneous Reporting System cases — 25 reports of torsades de pointes as of 1 April 1992 — and then tested the resulting hypothesis in isolated feline myocytes. Terfenadine proved equipotent with quinidine as a blocker of the delayed rectifier potassium current. Terfenadine carboxylate, the major metabolite, did not inhibit that current even at concentrations 30 times higher than the terfenadine concentration producing a half-maximal effect. Their conclusion was that torsades de pointes results from a quinidine-like action of the parent drug plus factors that impair its normally rapid metabolism.',
        evidenceSource:
          'Woosley RL, Chen Y, Freiman JP, Gillis RA. Mechanism of the cardiotoxic actions of terfenadine. JAMA 1993;269:1532-1536',
        measuredMetric:
          'Delayed rectifier potassium current block by terfenadine versus terfenadine carboxylate',
        auditFlag: 'verified',
      },
      {
        id: 'ter-a3',
        category: 'measured',
        title: 'hERG identified as the specific channel, at 350 nanomolar',
        laymanSummary:
          'Three years later the exact channel was named. Terfenadine blocks it at concentrations only a few times above what circulates in patients, and ten times more readily than the atrial channel.',
        technicalDetails:
          'Roy, Dumaine and Brown expressed Kv1.5 and hERG heterologously in Xenopus oocytes to compare sensitivity. hERG was ten times more sensitive than Kv1.5 to terfenadine block, with apparent dissociation constants of 350 nmol/L and 2.7 micromol/L respectively — values that agree with terfenadine block of IKr and IKur currents measured in human atrial myocytes. They noted the clinical relevance directly: terfenadine concentrations in human plasma may reach the 100 nmol/L range. Terfenadine carboxylate blocked neither channel. Their closing proposal — that hERG is likely the primary target for the cardiotoxic effects of other related antihistamines — was borne out by astemizole.',
        evidenceSource: 'Roy M, Dumaine R, Brown AM. Circulation 1996;94:817-823',
        doi: '10.1161/01.CIR.94.4.817',
        measuredMetric:
          'Apparent dissociation constant for hERG and Kv1.5 block by terfenadine',
        auditFlag: 'verified',
      },
      {
        id: 'ter-a4',
        category: 'conclusion_shift',
        title: 'Withdrawn and replaced by its own metabolite',
        laymanSummary:
          'Rather than lose the drug entirely, the manufacturer licensed the molecule terfenadine turns into. Fexofenadine is now sold over the counter worldwide.',
        technicalDetails:
          'Because the antihistamine activity resides in terfenadine carboxylate and the cardiac liability resides in the parent, the clean solution was to market the metabolite directly. Fexofenadine was developed and licensed, and terfenadine was withdrawn; it now appears in the FDA\'s codified withdrawn-for-safety list at 81 FR 69668 as "all drug products containing terfenadine". This is the most complete resolution of any case in this file: the therapeutic benefit was preserved intact and the harm was removed, because the two lived in different molecules that happened to be linked by one metabolic step.',
        evidenceSource:
          'Roy M et al., Circulation 1996;94:817-823; FDA final rule 81 FR 69668, 7 October 2016',
        doi: '10.1161/01.CIR.94.4.817',
        auditFlag: 'verified',
      },
      {
        id: 'ter-a5',
        category: 'inferred',
        title: 'Arrhythmia was assumed to be a class effect of non-sedating antihistamines. It is not',
        laymanSummary:
          'After terfenadine and astemizole, the whole class fell under suspicion. Comparative testing showed loratadine, cetirizine and fexofenadine have no such effect.',
        technicalDetails:
          'DuBuske reviewed the comparative evidence directly to test whether ventricular arrhythmia is a class effect of second-generation antihistamines. Electrocardiographic studies showed that terfenadine and astemizole, but not loratadine or cetirizine, prolong the QT interval in laboratory animals. In vitro, terfenadine and astemizole block cardiac potassium channels while neither loratadine nor desloratadine significantly inhibits them at clinically achievable blood levels. Human volunteer studies confirmed the absence of electrocardiographic effects of azelastine, cetirizine, fexofenadine and loratadine, given at several times the recommended dose or together with agents inhibiting their metabolism. The conclusion is explicit: the potential to cause ventricular arrhythmias is not a class effect.',
        evidenceSource:
          'DuBuske LM. Second-generation antihistamines: the risk of ventricular arrhythmias. Clin Ther 1999;21:281-295',
        doi: '10.1016/S0149-2918(00)88286-7',
        inferredClaim:
          'That QT prolongation and torsades de pointes are a class property of non-sedating H1 antihistamines',
        auditFlag: 'caution',
      },
      {
        id: 'ter-a6',
        category: 'inferred',
        title: 'A drug with an enormous safety margin has none once the margin depends on an enzyme',
        laymanSummary:
          'Under normal conditions almost no unconverted drug reaches the bloodstream, so the safety margin looked huge. That margin was not a property of the dose — it was a property of one liver enzyme continuing to work.',
        technicalDetails:
          'Terfenadine undergoes near-complete first-pass metabolism by CYP3A4, so parent drug concentrations in normal use are very low relative to the 350 nmol/L hERG dissociation constant. That apparent margin was the basis on which the drug was considered safe. It is conditional rather than intrinsic: it disappears whenever CYP3A4 is inhibited by an azole antifungal, a macrolide antibiotic, grapefruit juice, or by hepatic impairment, and it disappears in overdose. Honig\'s study demonstrated the collapse experimentally in six healthy volunteers. The generalisable point is that a safety margin created by metabolism is only as robust as the metabolism, and prodrugs whose parent carries the toxicity have no floor beneath them.',
        evidenceSource:
          'Honig PK et al., JAMA 1993;269:1513-1518; Woosley RL et al., JAMA 1993;269:1532-1536',
        inferredClaim:
          'That extensive first-pass metabolism provides a reliable safety margin against a toxicity carried by the parent drug',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A tablet twice a day, and almost none of it survives the liver',
        laymanDesc:
          'Swallowed twice daily. Nearly all of it is converted on the first pass through the liver, so barely any of the original molecule ever reaches the bloodstream.',
        molecularDetail:
          'Oral 60 mg twice daily. Near-complete first-pass oxidation by CYP3A4 to terfenadine carboxylate, with parent drug typically below the limit of quantification in normal use.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The metabolite reaches nose and skin, and not the brain',
        laymanDesc:
          'The converted molecule circulates to the tissues where allergy symptoms come from. It does not cross into the brain, which is why it does not cause drowsiness.',
        molecularDetail:
          'Terfenadine carboxylate is a zwitterion and a P-glycoprotein substrate, so it is effectively excluded from the central nervous system — the structural basis of non-sedation.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The metabolite blocks H1; the parent blocks hERG',
        laymanDesc:
          'The converted form blocks histamine receptors and relieves symptoms. The unconverted form blocks a heart potassium channel and does nothing useful.',
        molecularDetail:
          'Terfenadine carboxylate is an inverse agonist at the histamine H1 receptor. Terfenadine itself blocks hERG with an apparent dissociation constant of 350 nmol/L, ten-fold selectively over Kv1.5, and is equipotent with quinidine at the delayed rectifier current in isolated myocytes.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Block the enzyme and the wrong molecule accumulates',
        laymanDesc:
          'An antifungal, an antibiotic or grapefruit juice can stop the conversion. Then the original drug builds up to levels that reach the heart.',
        molecularDetail:
          'CYP3A4 inhibition by azoles, macrolides, protease inhibitors or furanocoumarins, or hepatic impairment or overdose, raises parent terfenadine towards and past the 350 nmol/L range. Reduced IKr prolongs ventricular repolarisation, widening the QT interval and permitting early afterdepolarisations.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Hay fever relieved without drowsiness; torsades in the wrong combination',
        laymanDesc:
          'The antihistamine effect was excellent. In patients taking interacting drugs the heart rhythm could break down into a potentially fatal arrhythmia.',
        molecularDetail:
          'Measured endpoints: symptomatic relief of allergic rhinitis and urticaria without sedation, against QT prolongation in all six volunteers given concomitant ketoconazole and 25 spontaneous reports of torsades de pointes to the FDA as of April 1992.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Terfenadine-ketoconazole interaction study (Honig et al.)',
        phase: 'Prospective clinical pharmacology cohort, subjects as their own controls',
        sampleSize: 6,
        primaryEndpoint:
          'Terfenadine and terfenadine carboxylate serum concentrations and corrected QT interval before and after adding ketoconazole',
        endpointMet: true,
        statisticalPValue:
          'All six subjects developed detectable unmetabolised terfenadine with associated QT prolongation; significant change in acid metabolite area under the curve',
        unreportedAdverseSignals:
          'Four of the six volunteers had their ketoconazole course shortened because of significant electrocardiographic repolarisation abnormalities. Only two completed the intended protocol.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'FDA Spontaneous Reporting System analysis with myocyte electrophysiology (Woosley et al.)',
        phase: 'Spontaneous report analysis with in vitro mechanistic testing',
        sampleSize: 25,
        primaryEndpoint:
          'Predisposing factors in reported torsades de pointes cases, and delayed rectifier potassium current block by parent versus metabolite',
        endpointMet: true,
        statisticalPValue:
          'Terfenadine equipotent with quinidine at the delayed rectifier current; terfenadine carboxylate inactive at 30-fold the terfenadine half-maximal concentration',
        unreportedAdverseSignals:
          'Spontaneous reports have no denominator, so 25 cases as of April 1992 establishes that the event occurs, not how often.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Detectable unmetabolised terfenadine with QT prolongation in all six volunteers after adding ketoconazole, four of whom needed the course shortened',
        'Terfenadine equipotent with quinidine as a delayed rectifier potassium current blocker in isolated myocytes',
        'hERG apparent dissociation constant 350 nmol/L against 2.7 micromol/L for Kv1.5, with plasma concentrations reaching the 100 nmol/L range',
        'Terfenadine carboxylate blocks neither channel, even at 30-fold the terfenadine half-maximal concentration',
      ],
      unsupportedInferences: [
        'That near-complete first-pass metabolism gives a durable safety margin against a toxicity carried by the parent drug',
        'That QT prolongation is a class effect of second-generation antihistamines — loratadine, cetirizine, azelastine and fexofenadine were shown free of it',
      ],
      whatFailedInitially: [
        'Twenty-five torsades de pointes reports had reached the FDA by April 1992, seven years after approval',
        'Dose restriction and interaction warnings preceded, and did not prevent, eventual withdrawal',
        'Codified in the FDA withdrawn-for-safety list at 81 FR 69668 as "all drug products containing terfenadine"',
      ],
      realWorldOutcome: [
        'Fexofenadine — terfenadine carboxylate — was licensed in its place and is sold over the counter worldwide',
        'The parent-versus-metabolite experiment became a template: for a prodrug, the safety question is which species carries the liability, and it must be asked of both',
        'Together with cisapride and astemizole, terfenadine drove hERG screening and clinical QT assessment into standard regulatory practice',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, 60 mg twice daily',
      description:
        'Twice-daily oral tablet subject to near-complete first-pass CYP3A4 metabolism to the active carboxylate. That single metabolic step is both the mechanism of action and the entire safety margin, which is why anything inhibiting CYP3A4 — azole antifungals, macrolide antibiotics, protease inhibitors, grapefruit juice — or any degree of hepatic impairment converts a well-tolerated drug into a proarrhythmic one.',
      safetyProfile:
        'Withdrawn for QT prolongation and torsades de pointes. The measured harms are hERG block at an apparent dissociation constant of 350 nmol/L, potency equal to quinidine at the delayed rectifier current, and QT prolongation in all six volunteers given concomitant ketoconazole. Risk is concentrated in CYP3A4 inhibition, hepatic impairment and overdose. The antihistamine effect itself is carried entirely by the metabolite and is not implicated.',
    },
    commonQuestions: [
      {
        q: 'Is fexofenadine safe if terfenadine was not?',
        a: 'Yes, and the reason is mechanical rather than reassuring rhetoric. Fexofenadine is terfenadine carboxylate — the molecule terfenadine becomes in the liver. All the antihistamine activity is in it. None of the cardiac potassium channel activity is: in isolated myocytes it failed to inhibit the delayed rectifier current even at 30 times the concentration at which terfenadine produced half-maximal block, and in the hERG and Kv1.5 comparison it blocked neither channel. Giving the metabolite directly also removes the metabolic step entirely, so there is nothing for an antifungal or an antibiotic to interfere with.',
        auditNote:
          'This is the cleanest resolution in the whole file. The benefit and the harm lived in two different molecules separated by one oxidation, and the fix was to sell the other one.',
      },
      {
        q: 'How did a drug this dangerous get approved in 1985?',
        a: 'Because under ordinary conditions it was not dangerous, and the conditions that made it dangerous were not being tested for. Terfenadine\'s first-pass metabolism is so nearly complete that parent drug is usually undetectable, so ordinary clinical studies saw no cardiac effect. The hERG channel had not been identified as the shared target of QT-prolonging drugs — that came in 1996, eleven years after approval — and there was no requirement to screen for it. What the 1985 dossier could not show is that the safety margin was conditional on one enzyme continuing to work, in patients who would go on to be prescribed antibiotics and antifungals by other doctors.',
      },
      {
        q: 'Are all non-drowsy antihistamines a risk?',
        a: 'No, and this was tested rather than assumed. Comparative work found that terfenadine and astemizole prolong the QT interval in animals and block cardiac potassium channels in vitro, while loratadine and cetirizine do neither, and desloratadine does not significantly inhibit cardiac potassium channels at clinically achievable levels. Human volunteer studies gave azelastine, cetirizine, fexofenadine and loratadine at several times the recommended dose, and with metabolic inhibitors present, and found no electrocardiographic effect. The reviewer\'s conclusion is explicit: the potential to cause ventricular arrhythmias is not a class effect.',
      },
      {
        q: 'Why does this page not show a price?',
        a: 'Because terfenadine has had no market since the late 1990s and is codified in the FDA withdrawn-for-safety list at 81 FR 69668. Its metabolite fexofenadine is sold over the counter at low cost, but that is a price for a different product, and this file does not carry a pricing block without a citable per-dose manufacturing cost.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Honig PK, Wortham DC, Zamani K, Conner DP, Mullin JC, Cantilena LR. Terfenadine-ketoconazole interaction: pharmacokinetic and electrocardiographic consequences. JAMA 1993;269:1513-1518',
        identifier: '8445813',
        kind: 'pmid',
      },
      {
        label:
          'Woosley RL, Chen Y, Freiman JP, Gillis RA. Mechanism of the cardiotoxic actions of terfenadine. JAMA 1993;269:1532-1536',
        identifier: '8445816',
        kind: 'pmid',
      },
      {
        label:
          'Roy M, Dumaine R, Brown AM. HERG, a primary human ventricular target of the nonsedating antihistamine terfenadine. Circulation 1996;94:817-823',
        identifier: '10.1161/01.CIR.94.4.817',
        kind: 'doi',
      },
      {
        label:
          'DuBuske LM. Second-generation antihistamines: the risk of ventricular arrhythmias. Clin Ther 1999;21:281-295',
        identifier: '10.1016/S0149-2918(00)88286-7',
        kind: 'doi',
      },
      {
        label:
          'FDA final rule 81 FR 69668, 7 October 2016 — "Terfenadine: All drug products containing terfenadine"',
        identifier:
          'https://www.federalregister.gov/documents/2016/10/07/2016-24333/additions-and-modifications-to-the-list-of-drug-products-that-have-been-withdrawn-or-removed-from',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 5405 — terfenadine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5405',
        kind: 'url',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 12. Astemizole
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'astemizole',
    name: 'Astemizole',
    tradeName: 'Hismanal',
    sponsor: 'Janssen Pharmaceutica',
    targetGene: 'HRH1',
    targetProtein:
      'Histamine H1 receptor (therapeutic target); hERG / KCNH2 potassium channel (toxicity target)',
    modality: 'Small Molecule',
    approvalStatus: 'Withdrawn from Market',
    approvalYear: 1988,
    indication:
      'Seasonal allergic rhinitis and chronic idiopathic urticaria. Withdrawn from the United States market in 1999 and listed by the FDA among drug products withdrawn for reasons of safety or effectiveness (81 FR 69668).',
    patientFriendlyIndication: 'A once-daily hay fever tablet that did not cause drowsiness',
    anatomicalSite:
      'Peripheral H1 receptors in nasal mucosa and skin; the toxicity site is the ventricular myocyte',
    conditionContext: {
      conditionExplainer:
        'Astemizole was the second non-sedating antihistamine after terfenadine and shared its fate for the same reason: it blocks the hERG cardiac potassium channel at nanomolar concentrations. What distinguishes it is its pharmacokinetics.',
      whyItMatters:
        'Terfenadine\'s risk was created by an interaction lasting as long as the interacting drug did. Astemizole and its active metabolite have elimination half-lives measured in days to weeks, so an interaction or an overdose creates an exposure that persists long after the trigger has gone.',
      whoTakesThis:
        'Nobody. Loratadine, cetirizine and fexofenadine replaced it and none of them carries a meaningful hERG signal.',
      clinicalGoals:
        'Once-daily relief of allergic rhinitis and urticaria without sedation. It achieved that, and it was withdrawn on the arrhythmia risk rather than on any failure of the antihistamine effect.',
    },
    oneSentenceVerdict:
      'A once-daily non-sedating antihistamine that blocks the hERG channel with an IC50 around 480 nanomolar and has an active metabolite with a half-life of days, so a single interaction or overdose produced torsades de pointes that outlasted its own trigger.',
    laymanHowItWorks:
      'Astemizole blocks histamine receptors in the nose and skin and does not enter the brain, so it stops allergy symptoms without causing drowsiness. It also plugs the potassium channel that heart muscle uses to reset between beats. Two things made it harder to manage than its predecessor: it stays in the body for a very long time, and its main metabolite is active and blocks the same channel. A dose too many, or one interacting drug, produced an exposure that took weeks to fall.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 88,
    substitutes: {
      summary:
        'Cetirizine, loratadine and fexofenadine all deliver the same non-sedating antihistamine effect without the channel block. Cetirizine is the informative comparator: it was tested head to head with astemizole in the same hERG preparation and showed no inhibition at all up to 30 micromolar.',
      conventionalRx: [
        {
          name: 'Cetirizine',
          class: 'Piperazine second-generation H1 antihistamine',
          howItCompares:
            'Completely devoid of inhibitory action on hERG channels up to 30 micromolar in the same experiment where astemizole gave an IC50 of about 480 nM. Applied to the intracellular side of the membrane, astemizole caused complete block and cetirizine had no effect at all.',
          typicalCost: 'Generic and over the counter; not priced here',
          prosAndCons:
            'Pros: no hERG activity, potent, renally cleared. Cons: more sedating than fexofenadine or loratadine.',
        },
        {
          name: 'Fexofenadine',
          class: 'Second-generation H1 antihistamine',
          howItCompares:
            'The active metabolite of the other withdrawn antihistamine, terfenadine, marketed directly and free of cardiac channel activity.',
          typicalCost: 'Generic and over the counter; not priced here',
          prosAndCons:
            'Pros: no QT signal, no prodrug conversion step. Cons: absorption reduced by fruit juices and by aluminium- or magnesium-containing antacids.',
        },
        {
          name: 'Loratadine',
          class: 'Second-generation H1 antihistamine',
          howItCompares:
            'Roughly 300-fold less potent than astemizole at hERG, with an estimated IC50 near 100 micromolar, and no electrocardiographic effect in human volunteers at several times the recommended dose.',
          typicalCost: 'Generic and over the counter; not priced here',
          prosAndCons:
            'Pros: once daily, no clinically relevant QT signal. Cons: mild sedation in a minority at higher doses.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'COC1=CC=C(C=C1)CCN2CCC(CC2)NC3=NC4=CC=CC=C4N3CC5=CC=C(C=C5)F',
      chemicalFormula: 'C28H31FN4O',
      molecularWeight: '458.6 g/mol',
      targetReceptorAffinity:
        'Potent H1 receptor antagonist. Its cardiac liability is hERG block at an estimated IC50 of about 480 nM in Xenopus oocytes — comparable to terfenadine\'s 330 nM in the same experiment, and roughly 300-fold more potent than loratadine. Applied intracellularly at 3 micromolar it produced complete block of hERG current. Its principal metabolite, desmethylastemizole, is pharmacologically active and long-lived.',
      structureSource: {
        label: 'PubChem CID 2247 (astemizole) — canonical SMILES, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2247',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ast-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity confirmation of the benzimidazole and piperidine components',
          description:
            'Confirm the 2-aminobenzimidazole core, the para-fluorobenzyl and para-methoxyphenethyl substituents. Astemizole is structurally distant from the other second-generation antihistamines, so identity work does not rely on differentiating close analogues in the way terfenadine does.',
          reagentsAndBuffer:
            'Astemizole certified reference standard, proton and 19F NMR, high-resolution LC-MS with electrospray in positive mode, expected protonated ion at m/z 459',
        },
        {
          id: 'ast-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Simultaneous quantification of astemizole and desmethylastemizole',
          description:
            'Measure parent and the N-desmethyl metabolite together over an extended sampling window. The original pharmacokinetic work followed plasma concentrations to 504 hours after a single dose, which tells you how long a validated method has to remain stable and how low its limit of quantification must go.',
          dependsOnStepId: 'ast-w1',
          reagentsAndBuffer:
            'Plasma with solid-phase extraction, LC-MS/MS in multiple reaction monitoring for both analytes, deuterated internal standards, calibration extending to sub-nanogram-per-millilitre concentrations',
        },
        {
          id: 'ast-w3',
          stepNumber: 3,
          phase: 'Assay_Quantification',
          name: 'hERG block with extracellular and intracellular application',
          description:
            'Measure hERG current inhibition with the compound applied outside the cell and, separately, inside it through the patch pipette. Astemizole blocks completely from the intracellular side at 3 micromolar while cetirizine does nothing from either side — the experiment that tied the difference to the physicochemistry of the tertiary amine substituents rather than to the antihistamine pharmacology.',
          dependsOnStepId: 'ast-w2',
          reagentsAndBuffer:
            'Xenopus laevis oocytes and HEK293 cells stably transfected with hERG cDNA, SH-SY5Y neuroblastoma cells as a native IHERG preparation, two-electrode voltage clamp and whole-cell patch clamp, cetirizine and terfenadine as comparators',
        },
        {
          id: 'ast-w4',
          stepNumber: 4,
          phase: 'Assay_Quantification',
          name: 'Antiplasmodial growth inhibition assay',
          description:
            'Astemizole and its principal human metabolite inhibit chloroquine-sensitive and multidrug-resistant Plasmodium falciparum, which is now the main reason the compound is still handled in laboratories. Measure parasite growth inhibition by hypoxanthine incorporation or SYBR Green fluorescence against reference strains.',
          dependsOnStepId: 'ast-w3',
          reagentsAndBuffer:
            'Plasmodium falciparum 3D7 (chloroquine-sensitive) and Dd2 or W2 (multidrug-resistant) cultures in human erythrocytes, RPMI with AlbuMAX, tritiated hypoxanthine incorporation or SYBR Green I readout, chloroquine and artemisinin as reference compounds',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ast-a1',
        category: 'measured',
        title: 'hERG block at about 480 nanomolar, against cetirizine at none',
        laymanSummary:
          'In one experiment testing four non-drowsy antihistamines on the same channel, astemizole and terfenadine blocked it at nanomolar concentrations, loratadine was three hundred times weaker, and cetirizine did nothing at all.',
        technicalDetails:
          'Taglialatela and colleagues compared cetirizine with astemizole, terfenadine and loratadine on hERG channels expressed in Xenopus laevis oocytes. Estimated IC50 values were 330 nM for terfenadine and 480 nM for astemizole; loratadine was approximately 300-fold less potent at around 100 micromolar; cetirizine was completely devoid of inhibitory action up to 30 micromolar. In SH-SY5Y cells expressing native hERG current and in stably transfected HEK293 cells, 3 micromolar astemizole was highly effective while 3 micromolar cetirizine had no effect. Applied to the intracellular side of the membrane, 3 micromolar astemizole caused complete block and cetirizine again had none. The authors attributed cetirizine\'s exemption to its more polar and smaller substituent groups on the tertiary amine.',
        evidenceSource: 'Taglialatela M et al., Mol Pharmacol 1998;54:113-121',
        doi: '10.1124/mol.54.1.113',
        measuredMetric:
          'Estimated IC50 for hERG channel block across four second-generation antihistamines',
        auditFlag: 'verified',
      },
      {
        id: 'ast-a2',
        category: 'measured',
        title: 'Torsades de pointes in overdose, only above a corrected QT of 500 ms',
        laymanSummary:
          'The case reports share a pattern: young patients, an overdose, and arrhythmia only in those whose ECG showed the repolarisation interval stretched past half a second.',
        technicalDetails:
          'Rao and colleagues described a case of astemizole-induced torsades de pointes ventricular tachycardia and reviewed the previous case reports. Across the series, all patients were young and dysrhythmias developed only in those with corrected QT intervals greater than 500 ms. Treatment comprised stopping astemizole, intravenous magnesium sulfate and isoproterenol, temporary cardiac pacing and, when necessary, direct current cardioversion. The authors add a practical warning that reads as a diagnostic trap: a cardiac cause of syncope or convulsions must not be overlooked in patients taking H1 antagonists, because those symptoms often precede hospitalisation or the detection of torsades.',
        evidenceSource: 'Rao KA, Adlakha A, Verma-Ansil B, Meloy TD, Stanton MS. Mayo Clin Proc 1994;69:589-593',
        doi: '10.1016/S0025-6196(12)62252-6',
        measuredMetric:
          'Corrected QT interval threshold above which dysrhythmias occurred in reported cases',
        auditFlag: 'verified',
      },
      {
        id: 'ast-a3',
        category: 'measured',
        title: 'Itraconazole raised total exposure nearly three-fold and lengthened the half-life to 3.6 days',
        laymanSummary:
          'An antifungal did not raise the peak level much, but it nearly tripled the total drug exposure and stretched the elimination half-life from two days to more than three and a half.',
        technicalDetails:
          'Twelve male volunteers took itraconazole 200 mg twice daily or placebo for 14 days with a four-week washout, receiving a single 10 mg dose of astemizole on day 11. Itraconazole did not significantly change the peak concentration (0.74 versus 0.81 ng/ml) but increased area under the curve from 0 to 24 hours (5.46 to 9.95 ng/ml/h) and from 0 to infinity (17.4 to 48.2 ng/ml/h), and lengthened the elimination half-life from 2.1 to 3.6 days. Systemic bioavailability of desmethylastemizole also rose. The QTc interval did not increase after the single dose and did not differ between sessions. The authors\' conclusion is the important nuance: a single dose showed no repolarisation change, but reduced clearance under itraconazole "may result in a marked increase in astemizole plasma concentrations and QTc alterations during chronic combined intake".',
        evidenceSource: 'Lefebvre RA et al., Br J Clin Pharmacol 1997;43:319-322',
        doi: '10.1046/j.1365-2125.1997.00548.x',
        measuredMetric:
          'Area under the concentration-time curve and elimination half-life with and without itraconazole',
        auditFlag: 'verified',
      },
      {
        id: 'ast-a4',
        category: 'inferred',
        title: 'A negative single-dose interaction study is not a negative interaction study',
        laymanSummary:
          'The formal interaction trial gave one dose of astemizole and saw no ECG change. That result was reassuring about one dose and said nothing about taking the drug every day for a fortnight.',
        technicalDetails:
          'The itraconazole study found no QTc increase after a single 10 mg astemizole dose, and no difference between itraconazole and placebo sessions over 24 hours. Taken alone that reads as a null interaction finding. The same study measured a near-three-fold rise in total exposure and an elimination half-life extended to 3.6 days, and the authors drew the correct conclusion themselves: chronic combined intake could produce a marked concentration increase and QTc alterations. For a drug with a multi-day half-life and an active long-lived metabolite, single-dose pharmacodynamics measured over 24 hours are structurally incapable of showing the risk, because accumulation has not happened yet.',
        evidenceSource: 'Lefebvre RA et al., Br J Clin Pharmacol 1997;43:319-322',
        doi: '10.1046/j.1365-2125.1997.00548.x',
        inferredClaim:
          'That absence of QTc change after a single dose with itraconazole present indicates the combination is safe in continued use',
        auditFlag: 'caution',
      },
      {
        id: 'ast-a5',
        category: 'conclusion_shift',
        title: 'The whole class was suspected; the block turned out to depend on molecular detail',
        laymanSummary:
          'For a while it looked as though blocking histamine receptors somehow also blocked heart channels. The comparison showed it depends on small chemical features, not on being an antihistamine.',
        technicalDetails:
          'Astemizole and terfenadine both block hERG at nanomolar concentrations. Loratadine is around 300-fold weaker and cetirizine is inactive up to 30 micromolar. Since all four are effective H1 antagonists, the channel block cannot be a consequence of the therapeutic pharmacology. Taglialatela and colleagues located the difference in the substituents on the tertiary amine: cetirizine carries more polar and smaller groups, and lacks hERG-blocking properties. The practical result was that the class survived: loratadine, cetirizine and fexofenadine are among the most widely used medicines in the world, and only the two hERG blockers were withdrawn.',
        evidenceSource:
          'Taglialatela M et al., Mol Pharmacol 1998;54:113-121; DuBuske LM. Clin Ther 1999;21:281-295',
        doi: '10.1124/mol.54.1.113',
        auditFlag: 'verified',
      },
      {
        id: 'ast-a6',
        category: 'measured',
        title: 'Rediscovered in 2006 as an antimalarial in a library screen of existing drugs',
        laymanSummary:
          'A screen of nearly 2,700 approved and withdrawn drugs against the malaria parasite picked out astemizole. It and its main human metabolite killed drug-resistant parasites and worked in two mouse models.',
        technicalDetails:
          'Chong and colleagues assembled a library of 2,687 existing drugs and screened it for inhibitors of Plasmodium falciparum. Astemizole and its principal human metabolite emerged as inhibitors of both chloroquine-sensitive and multidrug-resistant parasites, with efficacy in two mouse models of malaria. The finding is a real result and its ceiling should be stated with it: the hERG liability that ended the drug as an antihistamine does not disappear because the indication changed, and malaria is treated in settings where electrocardiographic monitoring is not available. The compound\'s value here has been mainly as a chemical starting point rather than as a candidate for redeployment.',
        evidenceSource: 'Chong CR, Chen X, Shi L, Liu JO, Sullivan DJ Jr. Nat Chem Biol 2006;2:415-416',
        doi: '10.1038/nchembio806',
        measuredMetric:
          'Inhibition of chloroquine-sensitive and multidrug-resistant Plasmodium falciparum, and efficacy in two mouse models',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A once-daily tablet that lingers for weeks',
        laymanDesc:
          'Taken once a day. It clears very slowly, and it turns into another active molecule that clears more slowly still.',
        molecularDetail:
          'Oral 10 mg once daily. Elimination half-life of the parent measured at 2.1 days in healthy volunteers and 3.6 days with itraconazole present; the principal metabolite desmethylastemizole is active and longer-lived, with plasma sampling in interaction studies extending to 504 hours after a single dose.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Reaches peripheral tissue and stays out of the brain',
        laymanDesc:
          'It circulates to the nose and skin where allergy symptoms arise, and does not appreciably enter the brain, so it does not cause drowsiness.',
        molecularDetail:
          'Poor central nervous system penetration relative to first-generation antihistamines, which is the basis of the non-sedating profile. Hepatic metabolism principally by CYP3A4 to desmethylastemizole.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Blocks H1 — and blocks hERG from either side of the membrane',
        laymanDesc:
          'It occupies histamine receptors and relieves symptoms. It also plugs the heart\'s potassium channel, and it can do that from inside the cell as well as outside.',
        molecularDetail:
          'H1 receptor antagonism at peripheral sites. Separately, hERG block with an estimated IC50 of about 480 nM extracellularly, and complete block at 3 micromolar applied to the intracellular face of the membrane in transfected HEK293 cells.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Repolarisation slows, and the exposure does not fall quickly',
        laymanDesc:
          'The heart takes longer to reset between beats. Because the drug leaves the body so slowly, that state persists for days after the last dose.',
        molecularDetail:
          'Reduced IKr prolongs ventricular action potential duration and widens the QT interval, permitting early afterdepolarisations and torsades de pointes. Reported dysrhythmias occurred only at corrected QT intervals above 500 ms. Multi-day half-lives for parent and active metabolite mean an accumulated exposure resolves over weeks, not hours.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Allergy symptoms controlled; torsades in overdose or interaction',
        laymanDesc:
          'It worked as a once-daily antihistamine. In overdose or with an interacting drug it produced a potentially fatal arrhythmia that outlasted its own cause.',
        molecularDetail:
          'Measured endpoints: effective H1 antagonism without sedation, against hERG IC50 of about 480 nM, reported torsades de pointes confined to corrected QT above 500 ms, and a near three-fold rise in total exposure with itraconazole.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Comparative hERG block study (Taglialatela et al.)',
        phase: 'In vitro electrophysiology across four second-generation antihistamines',
        sampleSize: 0,
        primaryEndpoint:
          'IC50 for hERG channel block by cetirizine, astemizole, terfenadine and loratadine in Xenopus oocytes, SH-SY5Y cells and transfected HEK293 cells',
        endpointMet: true,
        statisticalPValue:
          'Astemizole IC50 approximately 480 nM, terfenadine 330 nM, loratadine approximately 100 micromolar, cetirizine inactive to 30 micromolar',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Astemizole-itraconazole interaction study (Lefebvre et al.)',
        phase: 'Randomised crossover clinical pharmacology study',
        sampleSize: 12,
        primaryEndpoint:
          'Astemizole and desmethylastemizole plasma concentrations and QTc interval with and without 14 days of itraconazole',
        endpointMet: true,
        statisticalPValue:
          'Area under the curve to infinity rose from 17.4 to 48.2 ng/ml/h and elimination half-life from 2.1 to 3.6 days; QTc unchanged over 24 hours after a single dose',
        unreportedAdverseSignals:
          'A single 10 mg dose measured over 24 hours cannot show accumulation in a drug with a multi-day half-life and a long-lived active metabolite. The authors state that chronic combined intake may produce marked concentration increases and QTc alterations.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'hERG block with an estimated IC50 of approximately 480 nM, against cetirizine showing no inhibition up to 30 micromolar',
        'Complete hERG block by 3 micromolar astemizole applied to the intracellular face of the membrane',
        'Elimination half-life 2.1 days alone and 3.6 days with itraconazole, with total exposure rising from 17.4 to 48.2 ng/ml/h',
        'Reported dysrhythmias occurred only in patients with corrected QT intervals above 500 ms',
      ],
      unsupportedInferences: [
        'That absence of QTc change after a single dose with itraconazole indicates the combination is safe in continued use, for a drug with multi-day accumulation',
        'That QT prolongation is a class property of non-sedating antihistamines, when cetirizine and loratadine show no meaningful hERG block',
      ],
      whatFailedInitially: [
        'Torsades de pointes in overdose and in interaction, with case reports accumulating through the 1990s',
        'Withdrawn from the United States market in 1999 and codified in the FDA withdrawn-for-safety list at 81 FR 69668',
      ],
      realWorldOutcome: [
        'Loratadine, cetirizine and fexofenadine took the market and none carries a comparable hERG signal',
        'The cetirizine comparison localised the channel block to the substituents on the tertiary amine, turning a class fear into a structure-activity relationship',
        'Astemizole was rediscovered in 2006 as an inhibitor of chloroquine-sensitive and multidrug-resistant Plasmodium falciparum, and remains a chemical starting point rather than a redeployment candidate',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, 10 mg once daily',
      description:
        'Once-daily oral tablet, taken on an empty stomach because food substantially reduces absorption. Metabolised principally by CYP3A4 to the active, long-lived desmethylastemizole. The multi-day half-lives of both species are the feature that made the risk hard to manage: an accumulated exposure takes weeks to resolve, so stopping the drug does not promptly remove the hazard.',
      safetyProfile:
        'Withdrawn in 1999 for QT prolongation and torsades de pointes. The measured harms are hERG block at an estimated IC50 near 480 nM, complete block from the intracellular face at 3 micromolar, and reported torsades in patients with corrected QT above 500 ms. Risk concentrates in overdose, hepatic impairment, and CYP3A4 inhibition by azole antifungals, macrolide antibiotics or grapefruit juice, and persists for days after the last dose.',
    },
    commonQuestions: [
      {
        q: 'Why was astemizole harder to manage than terfenadine?',
        a: 'Pharmacokinetics. Terfenadine\'s risk appears when CYP3A4 is inhibited and recedes when the inhibitor stops, because terfenadine itself is cleared quickly. Astemizole has an elimination half-life of about two days on its own, 3.6 days with itraconazole present, and an active metabolite that is longer-lived still — the interaction study followed plasma concentrations for 504 hours after a single dose. So an accumulated exposure resolves over weeks. Stopping the drug does not promptly remove the hazard, and neither does stopping the interacting agent.',
        auditNote:
          'This is why the formal single-dose interaction study read as negative while the drug was still dangerous. The study measured 24 hours of a process that takes weeks.',
      },
      {
        q: 'Does this mean non-drowsy antihistamines are risky?',
        a: 'No, and the experiment that settles it tested four of them on the same channel in the same laboratory. Astemizole gave an IC50 of about 480 nM and terfenadine 330 nM; loratadine was roughly 300-fold weaker at around 100 micromolar, and cetirizine showed no inhibition at all up to 30 micromolar. Since all four block histamine receptors effectively, the channel activity cannot come from the therapeutic pharmacology. The authors traced cetirizine\'s exemption to its more polar and smaller substituents on the tertiary amine. Loratadine, cetirizine and fexofenadine remain among the most widely used medicines in the world.',
      },
      {
        q: 'Could astemizole be used for malaria?',
        a: 'It was identified as an antimalarial in a 2,687-compound screen of existing drugs, and it and its principal human metabolite inhibit both chloroquine-sensitive and multidrug-resistant Plasmodium falciparum with efficacy in two mouse models. That is a genuine finding. What it does not do is remove the hERG block, which does not care what the drug is being given for, and malaria is largely treated in settings where electrocardiographic monitoring is unavailable and where interacting antibiotics and antifungals are commonly used. The realistic value of the result is as a chemical starting point, not as a redeployment of the marketed drug.',
      },
      {
        q: 'Why does this page not show a price?',
        a: 'Because astemizole has had no market since 1999 and is codified in the FDA withdrawn-for-safety list at 81 FR 69668. There is no current list price to cite and no verified per-dose manufacturing cost.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Taglialatela M et al. Molecular basis for the lack of HERG K+ channel block-related cardiotoxicity by the H1 receptor blocker cetirizine compared with other second-generation antihistamines. Mol Pharmacol 1998;54:113-121',
        identifier: '10.1124/mol.54.1.113',
        kind: 'doi',
      },
      {
        label:
          'Rao KA, Adlakha A, Verma-Ansil B, Meloy TD, Stanton MS. Torsades de pointes ventricular tachycardia associated with overdose of astemizole. Mayo Clin Proc 1994;69:589-593',
        identifier: '10.1016/S0025-6196(12)62252-6',
        kind: 'doi',
      },
      {
        label:
          'Lefebvre RA et al. Influence of itraconazole on the pharmacokinetics and electrocardiographic effects of astemizole. Br J Clin Pharmacol 1997;43:319-322',
        identifier: '10.1046/j.1365-2125.1997.00548.x',
        kind: 'doi',
      },
      {
        label:
          'Chong CR, Chen X, Shi L, Liu JO, Sullivan DJ Jr. A clinical drug library screen identifies astemizole as an antimalarial agent. Nat Chem Biol 2006;2:415-416',
        identifier: '10.1038/nchembio806',
        kind: 'doi',
      },
      {
        label:
          'DuBuske LM. Second-generation antihistamines: the risk of ventricular arrhythmias. Clin Ther 1999;21:281-295',
        identifier: '10.1016/S0149-2918(00)88286-7',
        kind: 'doi',
      },
      {
        label:
          'FDA final rule 81 FR 69668, 7 October 2016 — "Astemizole: All drug products containing astemizole"',
        identifier:
          'https://www.federalregister.gov/documents/2016/10/07/2016-24333/additions-and-modifications-to-the-list-of-drug-products-that-have-been-withdrawn-or-removed-from',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 2247 — astemizole structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2247',
        kind: 'url',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 13. Valdecoxib
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'valdecoxib',
    name: 'Valdecoxib',
    tradeName: 'Bextra',
    sponsor: 'G.D. Searle / Pharmacia, then Pfizer (NDA 021341)',
    targetGene: 'PTGS2',
    targetProtein: 'Prostaglandin G/H synthase 2 (cyclooxygenase-2, COX-2)',
    modality: 'Small Molecule',
    approvalStatus: 'Withdrawn from Market',
    approvalYear: 2001,
    indication:
      'Osteoarthritis, adult rheumatoid arthritis and primary dysmenorrhoea. Withdrawn from the United States market in April 2005 and listed by the FDA among drug products withdrawn for reasons of safety or effectiveness (81 FR 69668).',
    patientFriendlyIndication: 'An arthritis and period-pain tablet designed to spare the stomach',
    anatomicalSite: 'Inflamed synovium and vascular endothelium; the skin is the second injury site',
    conditionContext: {
      conditionExplainer:
        'Valdecoxib is the third coxib and the one that carried two separate liabilities. It shares the prostacyclin-thromboxane imbalance of the class with rofecoxib, and it adds something the class does not share: a sulfonamide group.',
      whyItMatters:
        'The sulfonamide is what makes this page different from the rofecoxib page. Stevens-Johnson syndrome and toxic epidermal necrolysis were reported at roughly 25 times the background rate and 8 to 9 times the rate for celecoxib, which is also a sulfonamide but a weaker signal, while non-sulfonamide rofecoxib was lower still.',
      whoTakesThis:
        'Nobody. Its intravenous prodrug parecoxib remains available in some countries outside the United States.',
      clinicalGoals:
        'Analgesia and anti-inflammatory effect with fewer gastrointestinal complications. It was withdrawn on two grounds at once: cardiovascular events and serious skin reactions.',
    },
    oneSentenceVerdict:
      'A COX-2 inhibitor withdrawn in 2005 on two independent grounds — a 3.7-fold cardiovascular risk ratio after coronary bypass surgery, and Stevens-Johnson syndrome and toxic epidermal necrolysis reported at about 25 times the background rate.',
    laymanHowItWorks:
      'Valdecoxib blocks the enzyme that makes the prostaglandins of inflammation and pain, and leaves the enzyme that protects the stomach lining alone. That is the coxib idea and it works. Two problems came with it. The first is shared with the class: blocking the vessel-wall enzyme without touching the platelet one tilts blood towards clotting. The second is specific to this molecule: it contains a sulfonamide group, the chemical feature associated with the severe skin reactions that sulfa drugs cause.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 90,
    substitutes: {
      summary:
        'Celecoxib is the surviving coxib and, though also a sulfonamide, had a Stevens-Johnson reporting rate 8 to 9 times lower than valdecoxib in the same FDA analysis. Naproxen carries the least cardiovascular signal among traditional anti-inflammatories. Neither is a sulfonamide-free equivalent of valdecoxib with the same potency profile.',
      conventionalRx: [
        {
          name: 'Celecoxib',
          class: 'COX-2 selective NSAID, sulfonamide',
          howItCompares:
            'Also a sulfonamide coxib, but with a Stevens-Johnson and toxic epidermal necrolysis reporting rate of 6 per million person-years in the first two years of marketing against valdecoxib\'s 49. It is the only coxib with a large prospective cardiovascular outcome trial.',
          typicalCost: 'Generic; not priced here',
          prosAndCons:
            'Pros: PRECISION cardiovascular data, much lower serious-skin-reaction reporting rate. Cons: still a sulfonamide, still a COX-2 inhibitor with the class prostacyclin effect.',
        },
        {
          name: 'Naproxen',
          class: 'Non-selective NSAID',
          howItCompares:
            'Not a sulfonamide and not COX-2 selective. It has the smallest cardiovascular signal of the traditional NSAIDs and the full COX-1 gastrointestinal risk.',
          typicalCost: 'Generic and over the counter; not priced here',
          prosAndCons:
            'Pros: no sulfonamide, smallest cardiovascular signal in its class. Cons: gastrointestinal ulceration and bleeding, which is the problem coxibs were built to solve.',
        },
        {
          name: 'Meloxicam',
          class: 'Oxicam NSAID with relative COX-2 preference',
          howItCompares:
            'The comparator in the FDA skin-reaction analysis, chosen because it reached the market at a similar time. It generated no Stevens-Johnson or toxic epidermal necrolysis reports at all in that dataset.',
          typicalCost: 'Generic; not priced here',
          prosAndCons:
            'Pros: no serious-skin-reaction reports in the FDA comparison. Cons: COX-2 preference is relative rather than absolute, so gastrointestinal risk is reduced rather than removed.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC1=C(C(=NO1)C2=CC=CC=C2)C3=CC=C(C=C3)S(=O)(=O)N',
      chemicalFormula: 'C16H14N2O3S',
      molecularWeight: '314.4 g/mol',
      targetReceptorAffinity:
        'A COX-2 selective isoxazole. The benzenesulfonamide group occupies the COX-2 side pocket that COX-1 lacks, giving the selectivity — and it is the same sulfonamide moiety associated with severe cutaneous adverse reactions. Rofecoxib, which uses a methylsulfonyl group instead, produced far fewer such reports. Parecoxib is the injectable prodrug that hydrolyses to valdecoxib.',
      structureSource: {
        label: 'PubChem CID 119607 (valdecoxib) — canonical SMILES, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/119607',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'val-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity confirmation of the isoxazole and the free sulfonamide',
          description:
            'Confirm the 4,5-diaryl isoxazole core and, specifically, the primary benzenesulfonamide. Distinguishing a free sulfonamide from the N-substituted sulfonamides and methylsulfones used in other coxibs is not a formality here — that distinction is the structural basis of the skin-reaction difference across the class.',
          reagentsAndBuffer:
            'Valdecoxib certified reference standard, proton and carbon-13 NMR in deuterated DMSO showing the exchangeable sulfonamide protons, infrared spectroscopy for the S=O stretch, LC-MS at m/z 315',
        },
        {
          id: 'val-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Parecoxib hydrolysis and purity assay',
          description:
            'Where the injectable prodrug is in use, quantify parecoxib and its hydrolysis to valdecoxib. The prodrug is a propionyl amide of the sulfonamide nitrogen and converts enzymatically in the liver, so an assay must resolve both species and characterise the conversion rate.',
          dependsOnStepId: 'val-w1',
          reagentsAndBuffer:
            'C18 column, acetonitrile with formic acid gradient, UV detection at 250 nm, LC-MS/MS confirmation, human liver microsomes or plasma for hydrolysis kinetics',
        },
        {
          id: 'val-w3',
          stepNumber: 3,
          phase: 'Assay_Quantification',
          name: 'COX-1 and COX-2 whole-blood selectivity assay',
          description:
            'Serum thromboxane B2 generation during whole-blood clotting as the COX-1 readout, and lipopolysaccharide-stimulated prostaglandin E2 in the same donor blood as the COX-2 readout, with the ratio of IC50 values reported as the selectivity index. Run valdecoxib alongside celecoxib and a non-selective comparator so the number means something.',
          dependsOnStepId: 'val-w2',
          reagentsAndBuffer:
            'Fresh heparinised and native human whole blood, lipopolysaccharide from E. coli, aspirin in the stimulated arm, thromboxane B2 and prostaglandin E2 enzyme immunoassay kits',
        },
        {
          id: 'val-w4',
          stepNumber: 4,
          phase: 'Assay_Quantification',
          name: 'Reactive-metabolite and HLA-association work for the sulfonamide liability',
          description:
            'Screen for bioactivation of the arylsulfonamide to reactive species in human liver microsomes with glutathione trapping, and genotype affected-case cohorts for HLA class I associations. Severe cutaneous adverse reactions to sulfonamides are immune-mediated and HLA-restricted, so the mechanistic assay here is immunogenetic rather than purely chemical.',
          dependsOnStepId: 'val-w3',
          reagentsAndBuffer:
            'Pooled human liver microsomes with NADPH regenerating system and reduced glutathione, LC-MS/MS neutral-loss scanning for adducts, high-resolution HLA class I typing in case and control cohorts',
        },
      ],
    },
    keyAudits: [
      {
        id: 'val-a1',
        category: 'failed',
        title: 'After coronary bypass surgery, cardiovascular events were 2.0% against 0.5%',
        laymanSummary:
          'In 1,671 patients recovering from heart bypass surgery, serious cardiovascular events were nearly four times more common on the drug than on placebo.',
        technicalDetails:
          'Randomised, double-blind trial with 10 days of treatment and 30 days of follow-up in 1,671 patients after coronary-artery bypass grafting, assigned to intravenous parecoxib for at least three days followed by oral valdecoxib through day 10, intravenous placebo followed by oral valdecoxib, or placebo for 10 days, all with access to standard opioids. The primary endpoint was the frequency of predefined adverse events including cardiovascular events, renal failure or dysfunction, gastroduodenal ulceration and wound-healing complications. Both active groups had a higher proportion of patients with at least one confirmed adverse event — 7.4% in each against 4.0% on placebo, risk ratio 1.9 (95% CI 1.1 to 3.2, p=0.02 for each comparison). Cardiovascular events specifically, comprising myocardial infarction, cardiac arrest, stroke and pulmonary embolism, occurred in 2.0% of the parecoxib-plus-valdecoxib group against 0.5% on placebo, risk ratio 3.7 (95% CI 1.0 to 13.5, p=0.03).',
        evidenceSource: 'Nussmeier NA et al., N Engl J Med 2005;352:1081-1091',
        doi: '10.1056/NEJMoa050330',
        measuredMetric:
          'Frequency of predefined adverse events and of cardiovascular events after CABG',
        auditFlag: 'verified',
      },
      {
        id: 'val-a2',
        category: 'measured',
        title: 'Stevens-Johnson syndrome reported at 49 cases per million person-years',
        laymanSummary:
          'The FDA compared four anti-inflammatory drugs. Valdecoxib produced severe skin reactions at about twenty-five times the background rate, eight to nine times celecoxib\'s rate, and meloxicam produced none.',
        technicalDetails:
          'The FDA reviewed all United States Adverse Event Reporting System cases of Stevens-Johnson syndrome and toxic epidermal necrolysis for celecoxib, rofecoxib, valdecoxib and meloxicam since first marketing. Up to the end of March 2004 there were 63 cases with valdecoxib, 43 with celecoxib, 17 with rofecoxib — the non-sulfonamide coxib — and none with meloxicam. Reporting rates over the first two years of marketing were 49 cases per million person-years for valdecoxib, 6 for celecoxib and 3 for rofecoxib, against a background incidence of 1.9 cases per million population per year taken from the literature. The valdecoxib rate is 8 to 9 times that of celecoxib and approximately 25 times background. The authors\' conclusion names the chemistry: a strong association between these reactions and the sulfonamide COX-2 inhibitors, particularly valdecoxib.',
        evidenceSource: 'La Grenade L et al., Drug Saf 2005;28:917-924',
        doi: '10.2165/00002018-200528100-00008',
        measuredMetric:
          'Reported cases of Stevens-Johnson syndrome and toxic epidermal necrolysis per million person-years of use',
        auditFlag: 'verified',
      },
      {
        id: 'val-a3',
        category: 'conclusion_shift',
        title: 'Two independent grounds, either of which would have been enough',
        laymanSummary:
          'Most withdrawn drugs have one problem. Valdecoxib had two unrelated ones: a class cardiovascular effect and a chemistry-specific skin reaction.',
        technicalDetails:
          'The cardiovascular signal arises from COX-2 selectivity itself — suppressed endothelial prostacyclin with platelet thromboxane intact — and is shared with rofecoxib. The severe cutaneous reactions arise from the benzenesulfonamide group and are not shared with rofecoxib, which uses a methylsulfonyl group and had a reporting rate of 3 per million person-years against valdecoxib\'s 49. Two mechanistically independent liabilities in one molecule is unusual, and it is why the withdrawal in April 2005 was less contested than rofecoxib\'s. Valdecoxib appears in the FDA\'s codified withdrawn-for-safety list at 81 FR 69668 as "all drug products containing valdecoxib".',
        evidenceSource:
          'Nussmeier NA et al., N Engl J Med 2005;352:1081-1091; La Grenade L et al., Drug Saf 2005;28:917-924; FDA final rule 81 FR 69668',
        doi: '10.2165/00002018-200528100-00008',
        auditFlag: 'verified',
      },
      {
        id: 'val-a4',
        category: 'inferred',
        title: 'A CABG population is the wrong denominator for the ordinary arthritis patient',
        laymanSummary:
          'The cardiovascular trial studied people who had just had heart surgery. That is a group at exceptional risk, and the numbers do not transfer directly to someone taking the drug for arthritis.',
        technicalDetails:
          'The Nussmeier trial enrolled patients in the 10 days after coronary-artery bypass grafting — a period of maximal thrombotic risk, in patients with established coronary disease, on a background of surgical inflammation. The 3.7 risk ratio has a 95% confidence interval running from 1.0 to 13.5, which is wide, and the absolute difference is 2.0% versus 0.5% over 30 days. Applying that directly to a 60-year-old taking valdecoxib for osteoarthritis overstates the risk to that person. What it does establish, unambiguously, is a contraindication after cardiac surgery, and — read alongside the rofecoxib data — that the class effect is real rather than idiosyncratic to one molecule.',
        evidenceSource: 'Nussmeier NA et al., N Engl J Med 2005;352:1081-1091',
        doi: '10.1056/NEJMoa050330',
        inferredClaim:
          'That a 3.7-fold cardiovascular risk ratio measured in the 30 days after coronary bypass grafting is the risk faced by an outpatient taking valdecoxib for arthritis',
        auditFlag: 'caution',
      },
      {
        id: 'val-a5',
        category: 'inferred',
        title: 'Spontaneous reporting rates are not incidence, and the comparison is what carries the weight',
        laymanSummary:
          'The 49-per-million figure counts reports, not cases, and reporting is influenced by publicity. What makes it convincing is that all four drugs were counted the same way at the same time.',
        technicalDetails:
          'The FDA analysis uses spontaneous reports with drug-use data as a denominator, which yields a reporting rate rather than an incidence rate. Spontaneous reporting under-captures events by an unknown factor and is subject to stimulated reporting after publicity, so 49 cases per million person-years is a floor of unknown depth rather than a measurement of true incidence. The design compensates by comparing four drugs from the same database, over the same first-two-years-of-marketing window, with meloxicam deliberately chosen because it reached the market at a similar time. The internal comparison — 49 versus 6 versus 3 versus zero — is far more robust than any single number in it.',
        evidenceSource: 'La Grenade L et al., Drug Saf 2005;28:917-924',
        doi: '10.2165/00002018-200528100-00008',
        inferredClaim:
          'That 49 reported cases per million person-years is the incidence of Stevens-Johnson syndrome on valdecoxib',
        auditFlag: 'caution',
      },
      {
        id: 'val-a6',
        category: 'measured',
        title: 'The non-sulfonamide coxib had the lowest skin-reaction rate of the three',
        laymanSummary:
          'Rofecoxib, which was withdrawn for heart risk, had the fewest severe skin reactions of the three coxibs — because it is the one without a sulfonamide group.',
        technicalDetails:
          'In the same FDA dataset, rofecoxib — explicitly identified as the non-sulfonamide coxib — accounted for 17 Stevens-Johnson syndrome or toxic epidermal necrolysis cases and a first-two-years reporting rate of 3 per million person-years, against celecoxib\'s 6 and valdecoxib\'s 49. This is a clean structure-activity observation running across three drugs with the same therapeutic target: the cardiovascular liability tracks the pharmacology and is shared, while the cutaneous liability tracks the sulfonamide substituent and is not. Two drugs in the same class can fail for entirely different chemical reasons, and this dataset shows both at once.',
        evidenceSource: 'La Grenade L et al., Drug Saf 2005;28:917-924',
        doi: '10.2165/00002018-200528100-00008',
        measuredMetric:
          'Serious cutaneous adverse reaction reporting rate by coxib, stratified by sulfonamide status',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'An oral tablet, or an injection of its prodrug',
        laymanDesc:
          'Taken as a tablet, or given as an injection of a related compound that the body converts into it.',
        molecularDetail:
          'Oral valdecoxib 10 and 20 mg. Parecoxib sodium is a water-soluble injectable prodrug, an N-propionyl amide of the sulfonamide, hydrolysed enzymatically in the liver to valdecoxib.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Reaches inflamed joint tissue and vascular endothelium',
        laymanDesc:
          'It spreads into the inflamed joint where it relieves pain, and also into the lining of blood vessels.',
        molecularDetail:
          'Distributes into synovial tissue and vascular endothelium. COX-2 is inducible in inflamed synovium and constitutively expressed in endothelial cells, which is the anatomical basis of the split between benefit and harm.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The sulfonamide occupies the COX-2 side pocket',
        laymanDesc:
          'A sulfur-containing group fits into a small cavity that COX-2 has and COX-1 does not, which is what makes the drug selective — and is also the chemical group that sulfa allergies react to.',
        molecularDetail:
          'The benzenesulfonamide binds the hydrophilic side pocket created by the Val523-for-Ile523 substitution in COX-2. The same free arylsulfonamide is the moiety associated with severe cutaneous adverse reactions in the sulfonamide drug class.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Prostacyclin falls; separately, an immune reaction can start in the skin',
        laymanDesc:
          'Vessel walls stop making the substance that keeps platelets apart, tilting blood towards clotting. Independently, the sulfonamide can trigger an immune attack on the skin.',
        molecularDetail:
          'Suppressed endothelial COX-2-derived prostacyclin with platelet COX-1 thromboxane intact leaves unopposed prothrombotic tone. Severe cutaneous adverse reactions to arylsulfonamides are immune-mediated, HLA-restricted, and mechanistically unrelated to prostaglandin synthesis.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Pain relieved; cardiovascular events and skin failure raised',
        laymanDesc:
          'The analgesic effect was real. After heart surgery, cardiovascular events quadrupled. Severe skin reactions ran at about twenty-five times background.',
        molecularDetail:
          'Measured endpoints: at least one confirmed adverse event in 7.4% versus 4.0% after CABG (RR 1.9, 95% CI 1.1 to 3.2); cardiovascular events 2.0% versus 0.5% (RR 3.7, 95% CI 1.0 to 13.5); Stevens-Johnson syndrome and toxic epidermal necrolysis reported at 49 per million person-years against a background of 1.9 per million population per year.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Parecoxib/valdecoxib after CABG (Nussmeier et al.)',
        phase: 'Phase 3 randomised double-blind placebo-controlled safety trial',
        sampleSize: 1671,
        primaryEndpoint:
          'Frequency of predefined adverse events — cardiovascular, renal, gastroduodenal ulceration and wound healing — over 10 days of treatment and 30 days of follow-up after coronary-artery bypass grafting',
        endpointMet: false,
        statisticalPValue:
          'At least one confirmed adverse event 7.4% versus 4.0%, RR 1.9 (95% CI 1.1 to 3.2), P = 0.02; cardiovascular events 2.0% versus 0.5%, RR 3.7 (95% CI 1.0 to 13.5), P = 0.03',
        unreportedAdverseSignals:
          'The cardiovascular confidence interval runs from 1.0 to 13.5, so the point estimate is imprecise. The population is at exceptional thrombotic risk and does not represent the outpatient arthritis population the drug was licensed for.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'FDA AERS serious cutaneous reaction comparison (La Grenade et al.)',
        phase: 'Spontaneous adverse event report analysis with drug-use denominators',
        sampleSize: 123,
        primaryEndpoint:
          'Reporting rates of Stevens-Johnson syndrome and toxic epidermal necrolysis for celecoxib, rofecoxib, valdecoxib and meloxicam over the first two years of marketing',
        endpointMet: true,
        statisticalPValue:
          'Valdecoxib 49, celecoxib 6, rofecoxib 3 cases per million person-years, meloxicam none; background 1.9 cases per million population per year',
        unreportedAdverseSignals:
          'Reporting rates are not incidence rates: spontaneous reporting under-captures events by an unknown factor and is affected by publicity. The four-drug internal comparison is what carries the conclusion.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'At least one confirmed adverse event in 7.4% versus 4.0% of 1,671 patients after coronary bypass grafting, risk ratio 1.9',
        'Cardiovascular events in 2.0% versus 0.5%, risk ratio 3.7 (95% CI 1.0 to 13.5)',
        '63 reported Stevens-Johnson syndrome or toxic epidermal necrolysis cases, a reporting rate of 49 per million person-years in the first two years of marketing',
        'Rofecoxib, the non-sulfonamide coxib, reported at 3 per million person-years and meloxicam at zero over the same window',
      ],
      unsupportedInferences: [
        'That a 3.7-fold cardiovascular risk ratio measured after cardiac surgery is the risk facing an outpatient taking the drug for arthritis',
        'That 49 reported cases per million person-years is the true incidence of Stevens-Johnson syndrome rather than a floor set by reporting behaviour',
      ],
      whatFailedInitially: [
        'The dedicated post-CABG safety trial found more cardiovascular events on active treatment than on placebo',
        'Withdrawn from the United States market in April 2005 and codified in the FDA withdrawn-for-safety list at 81 FR 69668',
      ],
      realWorldOutcome: [
        'Drugs@FDA records NDA 021341 (BEXTRA, G.D. Searle) as Discontinued',
        'The coxib class survived in celecoxib, which was later tested prospectively for cardiovascular outcomes in PRECISION',
        'The comparison across three coxibs separated a shared pharmacological liability from a molecule-specific chemical one, which is a template for reading class-effect questions rather than assuming them',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet (10 and 20 mg); intravenous parecoxib as a prodrug in some countries',
      description:
        'Once- or twice-daily oral tablet. Parecoxib sodium is a water-soluble injectable prodrug hydrolysed to valdecoxib in the liver, developed for perioperative use — which is how a coxib came to be tested in patients recovering from cardiac surgery in the first place.',
      safetyProfile:
        'Withdrawn in April 2005 on two grounds. Cardiovascular: at least one confirmed adverse event in 7.4% versus 4.0% and cardiovascular events in 2.0% versus 0.5% in the 30 days after coronary bypass grafting. Cutaneous: Stevens-Johnson syndrome and toxic epidermal necrolysis reported at 49 cases per million person-years, approximately 25 times the background rate and 8 to 9 times the celecoxib rate. The cutaneous risk is attributed to the sulfonamide group and is not a property of COX-2 inhibition.',
    },
    commonQuestions: [
      {
        q: 'Was valdecoxib withdrawn for the same reason as rofecoxib?',
        a: 'Partly, and the difference is the interesting half. Both share the class cardiovascular liability that comes from suppressing endothelial prostacyclin while leaving platelet thromboxane intact, and valdecoxib\'s trial after coronary bypass surgery found cardiovascular events in 2.0% against 0.5% on placebo. Valdecoxib also carried a second, unrelated problem: it is a sulfonamide, and Stevens-Johnson syndrome and toxic epidermal necrolysis were reported at 49 cases per million person-years, about 25 times the background rate. Rofecoxib, which is not a sulfonamide, reported at 3 per million person-years. One class effect, one chemistry effect, in the same molecule.',
        auditNote:
          'The FDA analysis deliberately included meloxicam, a non-coxib that reached the market at a similar time, as a reference. It generated no such reports at all.',
      },
      {
        q: 'Does the cardiovascular result apply to ordinary arthritis patients?',
        a: 'Not directly, and the trial design is the reason to be careful. Patients were enrolled in the 10 days after coronary-artery bypass grafting, which is a period of maximal thrombotic risk in people with established coronary disease and a large surgical inflammatory load. The risk ratio was 3.7 with a confidence interval from 1.0 to 13.5, and the absolute difference was 2.0% against 0.5% over 30 days. That establishes a firm contraindication after cardiac surgery and, alongside the rofecoxib data, confirms the class effect is real. It does not give the number an outpatient with osteoarthritis is facing, and no trial of that population was ever run for this drug.',
      },
      {
        q: 'If I am allergic to sulfa drugs, does that mean celecoxib is dangerous too?',
        a: 'The data say the risk differs by a large margin within the sulfonamide coxibs rather than being uniform. In the FDA comparison, valdecoxib reported at 49 cases per million person-years and celecoxib at 6 — an 8 to 9 fold difference between two drugs that both carry a sulfonamide group. Both are above the 1.9 per million background. That is a genuine signal for the class and a much smaller one for celecoxib specifically. It is a question for a prescriber who knows the individual history, and the numbers here are reporting rates rather than personal risks.',
      },
      {
        q: 'Why does this page not show a price?',
        a: 'Because the drug has had no market since April 2005, Drugs@FDA records NDA 021341 as Discontinued, and it is codified in the FDA withdrawn-for-safety list at 81 FR 69668. There is no current list price to cite and no verified per-dose manufacturing cost.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Nussmeier NA et al. Complications of the COX-2 inhibitors parecoxib and valdecoxib after cardiac surgery. N Engl J Med 2005;352:1081-1091',
        identifier: '10.1056/NEJMoa050330',
        kind: 'doi',
      },
      {
        label:
          'La Grenade L et al. Comparison of reporting of Stevens-Johnson syndrome and toxic epidermal necrolysis in association with selective COX-2 inhibitors. Drug Saf 2005;28:917-924',
        identifier: '10.2165/00002018-200528100-00008',
        kind: 'doi',
      },
      {
        label:
          'Layton D, Marshall V, Boshier A, Friedmann P, Shakir SA. Serious skin reactions and selective COX-2 inhibitors: a case series from prescription-event monitoring in England. Drug Saf 2006;29:687-696',
        identifier: '10.2165/00002018-200629080-00005',
        kind: 'doi',
      },
      {
        label:
          'FDA final rule 81 FR 69668, 7 October 2016 — "Valdecoxib: All drug products containing valdecoxib"',
        identifier:
          'https://www.federalregister.gov/documents/2016/10/07/2016-24333/additions-and-modifications-to-the-list-of-drug-products-that-have-been-withdrawn-or-removed-from',
        kind: 'regulatory',
      },
      {
        label: 'Drugs@FDA: BEXTRA (valdecoxib), NDA 021341, G.D. Searle — Discontinued',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021341',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 119607 — valdecoxib structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/119607',
        kind: 'url',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 14. Pergolide
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'pergolide',
    name: 'Pergolide',
    tradeName: 'Permax',
    sponsor: 'Eli Lilly, later Valeant Pharmaceuticals International (NDA 019385)',
    targetGene: 'DRD2 and HTR2B',
    targetProtein:
      'Dopamine D1 and D2 receptors (therapeutic target); serotonin 5-HT2B receptor (toxicity target)',
    modality: 'Small Molecule',
    approvalStatus: 'Withdrawn from Market',
    approvalYear: 1988,
    indication:
      'Adjunctive treatment of Parkinson\'s disease with levodopa and carbidopa. Withdrawn from the United States market in March 2007 and listed by the FDA among drug products withdrawn for reasons of safety or effectiveness (81 FR 69668). It remains in veterinary use for equine pituitary pars intermedia dysfunction.',
    patientFriendlyIndication: 'A Parkinson\'s disease tablet taken alongside levodopa',
    anatomicalSite:
      'Striatal dopamine receptors; the toxicity site is the 5-HT2B receptor on cardiac valve fibroblasts',
    conditionContext: {
      conditionExplainer:
        'Pergolide is an ergot derivative, and ergot alkaloids have been known to cause fibrotic valve disease since the 1960s. Its dopamine agonism treated Parkinson\'s disease; its off-target agonism at the 5-HT2B receptor thickened heart valves.',
      whyItMatters:
        'This is the second time on this page that 5-HT2B agonism destroyed a drug. Fenfluramine was withdrawn for it in 1997; pergolide was withdrawn for it in 2007, ten years later, in a different therapeutic class. The receptor does not care what the drug was for.',
      whoTakesThis:
        'No human patient in the United States. Pergolide remains widely used in veterinary medicine for equine pituitary pars intermedia dysfunction, where the risk calculus differs.',
      clinicalGoals:
        'Reduce off time and motor fluctuations in Parkinson\'s disease alongside levodopa. The non-ergot dopamine agonists achieve the same goal, and in the key echocardiographic study produced no valvular regurgitation at all.',
    },
    oneSentenceVerdict:
      'An ergot-derived dopamine agonist withdrawn in 2007 after two independent studies published in the same journal issue found a 7.1-fold incidence-rate ratio for new valve regurgitation and clinically important regurgitation in 23.4% of treated patients against 5.6% of controls — while non-ergot agonists produced none.',
    laymanHowItWorks:
      'Pergolide stimulates the dopamine receptors that Parkinson\'s disease depletes, which improves movement. It is built on an ergot skeleton, and ergot compounds also stimulate a serotonin receptor found on heart valve tissue. Stimulating that receptor tells valve cells to grow and stiffen, so the valve thickens and stops closing properly. The dopamine agonists that are not built on an ergot skeleton do the first thing and not the second.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 92,
    substitutes: {
      summary:
        'The non-ergot dopamine agonists are the direct replacements and were the internal control in both 2007 studies: pramipexole, ropinirole and rotigotine. In the Italian echocardiographic study, clinically important regurgitation occurred in 0% of patients on non-ergot agonists.',
      conventionalRx: [
        {
          name: 'Pramipexole',
          class: 'Non-ergot dopamine D2/D3 receptor agonist',
          howItCompares:
            'Same therapeutic role, no ergot skeleton, no 5-HT2B agonism. In the Zanettini echocardiographic study, patients on non-ergot agonists had 0% clinically important valve regurgitation against 23.4% on pergolide.',
          typicalCost: 'Generic; not priced here',
          prosAndCons:
            'Pros: no valvular signal, effective in Parkinson\'s disease and restless legs syndrome. Cons: impulse control disorders, sudden onset of sleep, orthostatic hypotension.',
        },
        {
          name: 'Ropinirole',
          class: 'Non-ergot dopamine D2/D3 receptor agonist',
          howItCompares:
            'The other principal non-ergot alternative, with the same absence of ergot-related fibrotic risk.',
          typicalCost: 'Generic; not priced here',
          prosAndCons:
            'Pros: no valvular or retroperitoneal fibrosis signal. Cons: nausea, somnolence, impulse control disorders.',
        },
        {
          name: 'Rotigotine transdermal patch',
          class: 'Non-ergot dopamine agonist',
          howItCompares:
            'Delivers continuous dopaminergic stimulation through the skin, avoiding both the ergot chemistry and the peaks and troughs of oral dosing.',
          typicalCost: 'Not priced here',
          prosAndCons:
            'Pros: continuous delivery, no ergot liability. Cons: application-site reactions, and the same class impulse-control risk.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CCCN1C[C@@H](C[C@H]2[C@H]1CC3=CNC4=CC=CC2=C34)CSC',
      chemicalFormula: 'C19H26N2S',
      molecularWeight: '314.5 g/mol',
      targetReceptorAffinity:
        'An ergoline with agonist activity at dopamine D1 and D2 receptors, which is the therapeutic mechanism. The ergoline scaffold also confers agonism at the serotonin 5-HT2B receptor, the same receptor through which fenfluramine\'s metabolite norfenfluramine causes valve fibrosis. Non-ergot dopamine agonists lack this activity entirely.',
      structureSource: {
        label: 'PubChem CID 47811 (pergolide) — canonical SMILES, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/47811',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'per-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity and stereochemical confirmation of the ergoline',
          description:
            'Confirm the tetracyclic ergoline skeleton and all three stereocentres, plus the methylthiomethyl side chain and N-propyl substituent. Ergolines epimerise at C-8 under mild conditions, so a chiral or diastereomer-resolving method is required rather than a simple assay.',
          reagentsAndBuffer:
            'Pergolide mesylate certified reference standard, chiral or diastereomer-resolving HPLC, proton NMR in deuterated methanol, LC-MS with electrospray in positive mode at m/z 315',
        },
        {
          id: 'per-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Purity, oxidation products and veterinary formulation testing',
          description:
            'Profile the sulfoxide and sulfone oxidation products of the thioether side chain and the indole oxidation products. Pergolide is compounded for equine use, so content uniformity and stability of compounded preparations is now the routine assay context.',
          dependsOnStepId: 'per-w1',
          reagentsAndBuffer:
            'C18 column, acetonitrile with ammonium acetate gradient, photodiode array detection with the indole chromophore monitored, forced oxidative degradation samples, light-protected handling throughout',
        },
        {
          id: 'per-w3',
          stepNumber: 3,
          phase: 'Assay_Quantification',
          name: '5-HT2B functional assay — the valvulopathy screen',
          description:
            'Measure inositol phosphate accumulation or calcium mobilisation at recombinant human 5-HT2B, running pergolide and cabergoline alongside pramipexole and ropinirole. This assay is exactly what separates the withdrawn drugs from the surviving ones, and it is the same screen that the fenfluramine episode established.',
          dependsOnStepId: 'per-w2',
          reagentsAndBuffer:
            'CHO or HEK293 cells stably expressing human HTR2B, IP-One HTRF accumulation assay or Fluo-4 calcium flux, serotonin as reference full agonist, non-ergot dopamine agonists as negative comparators',
        },
        {
          id: 'per-w4',
          stepNumber: 4,
          phase: 'Assay_Quantification',
          name: 'Dopamine receptor binding and functional selectivity',
          description:
            'Radioligand displacement at D1 and D2 receptors to establish therapeutic potency, then express the result as a ratio against the 5-HT2B potency from the previous step. A dopamine agonist whose 5-HT2B potency is comparable to its D2 potency has no usable therapeutic window against valve fibrosis.',
          dependsOnStepId: 'per-w3',
          reagentsAndBuffer:
            'Membranes from cells expressing human DRD1 and DRD2, [3H]-SCH-23390 and [3H]-spiperone radioligands, Tris-HCl binding buffer with magnesium, glass-fibre filtration and scintillation counting',
        },
        {
          id: 'per-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Valve interstitial cell proliferation assay',
          description:
            'Expose primary human cardiac valve interstitial cells to pergolide and measure mitogenesis, transforming growth factor beta signalling and glycosaminoglycan deposition, with a 5-HT2B antagonist rescue arm. This reproduces in a dish the leaflet stiffening that the echocardiographic mitral tenting area measures in patients.',
          dependsOnStepId: 'per-w4',
          reagentsAndBuffer:
            'Primary human mitral or aortic valve interstitial cells, bromodeoxyuridine incorporation assay, TGF-beta and alpha-smooth muscle actin immunoblot, selective 5-HT2B antagonist as rescue control',
        },
      ],
    },
    keyAudits: [
      {
        id: 'per-a1',
        category: 'measured',
        title: 'Incidence-rate ratio 7.1 for new valve regurgitation in 11,417 patients',
        laymanSummary:
          'In a UK primary care database covering over eleven thousand people on Parkinson\'s drugs, new valve leakage was seven times more likely in those currently taking pergolide.',
        technicalDetails:
          'Population-based cohort from the United Kingdom General Practice Research Database: 11,417 subjects aged 40 to 80 prescribed antiparkinsonian drugs between 1988 and 2005, with a nested case-control analysis matching each patient with newly diagnosed cardiac-valve regurgitation to up to 25 controls by age, sex and year of cohort entry. Of 31 case patients, 6 were currently exposed to pergolide, 6 to cabergoline, and 19 had not been exposed to any dopamine agonist in the previous year. The incidence-rate ratio was 7.1 for current pergolide use (95% CI 2.3 to 22.3) and 4.9 for cabergoline (95% CI 1.5 to 15.6). Current use of other dopamine agonists showed no increase.',
        evidenceSource: 'Schade R et al., N Engl J Med 2007;356:29-38',
        doi: '10.1056/NEJMoa062222',
        measuredMetric:
          'Incidence-rate ratio for newly diagnosed cardiac-valve regurgitation by dopamine agonist',
        auditFlag: 'verified',
      },
      {
        id: 'per-a2',
        category: 'measured',
        title: 'Echocardiography: 23.4% clinically important regurgitation, against 0% on non-ergot agonists',
        laymanSummary:
          'Scanning 155 patients directly, about a quarter of those on pergolide had moderate or severe valve leakage. Among those on the non-ergot alternatives, not one did.',
        technicalDetails:
          'Echocardiographic prevalence study in 155 patients taking dopamine agonists for Parkinson\'s disease — pergolide 64, cabergoline 49, non-ergot agonists 42 — and 90 control subjects, with regurgitation graded by American Society of Echocardiography criteria. Clinically important regurgitation (moderate to severe, grade 3 to 4) in any valve occurred in 23.4% on pergolide and 28.6% on cabergoline, against 0% on non-ergot-derived agonists and 5.6% in controls. Relative risks in the pergolide group were 6.3 for mitral regurgitation (p=0.008), 4.2 for aortic (p=0.01) and 5.6 for tricuspid (p=0.16); in the cabergoline group 4.6 (p=0.09), 7.3 (p<0.001) and 5.5 (p=0.12).',
        evidenceSource: 'Zanettini R et al., N Engl J Med 2007;356:39-46',
        doi: '10.1056/NEJMoa054830',
        measuredMetric:
          'Prevalence of grade 3 to 4 valve regurgitation on echocardiography, by dopamine agonist class',
        auditFlag: 'verified',
      },
      {
        id: 'per-a3',
        category: 'measured',
        title: 'A cumulative-dose relationship, and a quantitative index of leaflet stiffening',
        laymanSummary:
          'Patients with the worst valve leakage had taken more of the drug in total, and a direct measurement of how stiff the valve leaflets were tracked the severity.',
        technicalDetails:
          'Zanettini and colleagues measured mitral-valve tenting area as a quantitative index of leaflet stiffening and apical displacement of leaflet coaptation. Mean tenting area was significantly greater in ergot-treated patients and showed a linear relationship with the severity of mitral regurgitation. Separately, ergot-treated patients with grade 3 to 4 regurgitation of any valve had received a significantly higher mean cumulative dose of pergolide or cabergoline than those with lower grades. A dose-response relationship plus a continuous structural measurement that tracks the graded outcome is a substantially stronger causal case than the regurgitation grades alone.',
        evidenceSource: 'Zanettini R et al., N Engl J Med 2007;356:39-46',
        doi: '10.1056/NEJMoa054830',
        measuredMetric:
          'Mitral-valve tenting area against regurgitation severity, and cumulative dose against regurgitation grade',
        auditFlag: 'verified',
      },
      {
        id: 'per-a4',
        category: 'conclusion_shift',
        title: 'Two independent designs, same journal issue, withdrawal within months',
        laymanSummary:
          'A database study and a direct scanning study, done by different groups in different countries, were published together in January 2007. The drug was withdrawn in March.',
        technicalDetails:
          'The Schade nested case-control study drew on 11,417 UK primary care records and measured clinically diagnosed regurgitation; the Zanettini study scanned 155 Italian patients and 90 controls and measured echocardiographic grade and a structural index. The two designs have almost non-overlapping weaknesses — the first has a real denominator and depends on clinical diagnosis, the second detects subclinical disease and has a small sample — and they agreed. Both appeared in the New England Journal of Medicine on 4 January 2007. Pergolide was withdrawn from the United States market in March 2007 and appears in the FDA\'s codified withdrawn-for-safety list at 81 FR 69668 as "all drug products containing pergolide mesylate".',
        evidenceSource:
          'Schade R et al., N Engl J Med 2007;356:29-38; Zanettini R et al., N Engl J Med 2007;356:39-46; FDA final rule 81 FR 69668',
        doi: '10.1056/NEJMoa062222',
        auditFlag: 'verified',
      },
      {
        id: 'per-a5',
        category: 'conclusion_shift',
        title: 'The same receptor that ended fenfluramine, ten years later, in a different class',
        laymanSummary:
          'Fenfluramine was withdrawn in 1997 for valve damage caused by a specific serotonin receptor. Pergolide was withdrawn in 2007 for valve damage caused by the same receptor.',
        technicalDetails:
          'Fenfluramine\'s valvulopathy was traced to 5-HT2B agonism by its metabolite norfenfluramine, and the lesion was histopathologically identical to carcinoid and ergotamine valve disease. Pergolide is an ergoline and carries 5-HT2B agonism as a property of that scaffold. The non-ergot dopamine agonists do not, and produced 0% clinically important regurgitation in the echocardiographic study. So the pattern that was established for one indication in 1997 recurred in an entirely different indication a decade later, in a drug that had been marketed since 1988. The 5-HT2B counter-screen that the fenfluramine episode created is now applied to any candidate with serotonergic or ergoline chemistry, and it exists precisely because this failure repeats across classes.',
        evidenceSource:
          'Zanettini R et al., N Engl J Med 2007;356:39-46; Connolly HM et al., N Engl J Med 1997;337:581-588',
        doi: '10.1056/NEJMoa054830',
        auditFlag: 'verified',
      },
      {
        id: 'per-a6',
        category: 'inferred',
        title: 'Fibrotic risk was assumed to belong to ergots generally, and clinically it does not divide that cleanly',
        laymanSummary:
          'Both ergot-derived agonists caused valve damage, but not identically — pergolide hit the mitral valve hardest and cabergoline the aortic. Grouping them as one risk loses information a patient might need.',
        technicalDetails:
          'The two ergot agonists differed by valve in the echocardiographic study. Pergolide relative risks were 6.3 for mitral (p=0.008), 4.2 for aortic (p=0.01) and 5.6 for tricuspid (p=0.16); cabergoline were 4.6 for mitral (p=0.09), 7.3 for aortic (p<0.001) and 5.5 for tricuspid (p=0.12). Only some of these reach significance, and the tricuspid estimates in both groups do not, on 64 and 49 patients respectively. Reporting "ergot agonists cause valve disease" is correct as a class statement and flattens a pattern in which the significant findings differ by drug and by valve, on samples small enough that the non-significant estimates are uninformative rather than negative.',
        evidenceSource: 'Zanettini R et al., N Engl J Med 2007;356:39-46',
        doi: '10.1056/NEJMoa054830',
        inferredClaim:
          'That the ergot dopamine agonists carry an identical, interchangeable valvular risk profile',
        auditFlag: 'caution',
      },
      {
        id: 'per-a7',
        category: 'measured',
        title: 'It is still in use — in horses',
        laymanSummary:
          'Pergolide remains a standard veterinary treatment for a pituitary disorder in horses, where the same dopamine agonism is what is wanted and the risk calculus is different.',
        technicalDetails:
          'Pergolide is used in equine medicine for pituitary pars intermedia dysfunction, where D2 agonism suppresses the pars intermedia melanotrope hyperactivity that drives the condition. The withdrawal recorded at 81 FR 69668 applies to human drug products. This is a straightforward illustration of the point the whole file makes: a withdrawal is a judgement about a specific benefit-risk trade in a specific population, not a statement that a molecule is inherently unfit. Change the species, the alternatives available and the life expectancy of the patient, and the arithmetic changes with them.',
        evidenceSource:
          'FDA final rule 81 FR 69668, 7 October 2016 — human drug products containing pergolide mesylate',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'An oral tablet, titrated slowly upward',
        laymanDesc:
          'Taken by mouth several times a day, with the dose built up gradually alongside levodopa.',
        molecularDetail:
          'Oral tablets titrated over weeks as an adjunct to levodopa and carbidopa. Extensively metabolised, with a plasma half-life of roughly 27 hours.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Crosses into the brain and reaches the striatum',
        laymanDesc:
          'It enters brain tissue and reaches the region whose dopamine-producing cells are dying in Parkinson\'s disease.',
        molecularDetail:
          'Lipophilic ergoline with good central nervous system penetration, reaching postsynaptic dopamine receptors in the striatum. It also circulates to cardiac valve tissue, which has no barrier equivalent.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Agonist at dopamine D1 and D2 — and at 5-HT2B',
        laymanDesc:
          'It switches on the dopamine receptors that improve movement. The ergot skeleton also switches on a serotonin receptor found on heart valve cells.',
        molecularDetail:
          'Direct agonism at dopamine D1 and D2 receptors substitutes for lost endogenous dopaminergic tone. The ergoline scaffold confers agonism at 5-HT2B, a Gq-coupled receptor expressed on cardiac valve interstitial cells and largely absent from adult myocardium.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Motor symptoms improve; valve leaflets thicken and stiffen',
        laymanDesc:
          'Movement gets better. Meanwhile, valve tissue is being told to grow, so leaflets thicken, stiffen and stop meeting properly, and blood leaks backwards.',
        molecularDetail:
          'Striatal dopamine receptor stimulation reduces off time and motor fluctuation. At the valve, 5-HT2B-driven mitogenesis and TGF-beta signalling in interstitial cells cause plaque-like leaflet thickening and apical displacement of coaptation, measurable as increased mitral tenting area with a linear relationship to regurgitation severity.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Parkinson symptoms controlled; a quarter of patients develop significant valve leak',
        laymanDesc:
          'The drug worked for Parkinson\'s disease. On echocardiography, 23.4% of patients had moderate or severe valve leakage against 5.6% of controls and none on the non-ergot alternatives.',
        molecularDetail:
          'Measured endpoints: clinically important regurgitation in 23.4% on pergolide versus 5.6% of controls and 0% on non-ergot agonists; incidence-rate ratio 7.1 (95% CI 2.3 to 22.3) for newly diagnosed regurgitation in an 11,417-patient cohort.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'UK General Practice Research Database nested case-control (Schade et al.)',
        phase: 'Population-based cohort with nested case-control analysis',
        sampleSize: 11417,
        primaryEndpoint:
          'Incidence-rate ratio for newly diagnosed cardiac-valve regurgitation with current use of individual dopamine agonists, 1988 to 2005',
        endpointMet: true,
        statisticalPValue:
          'Pergolide incidence-rate ratio 7.1 (95% CI 2.3 to 22.3); cabergoline 4.9 (1.5 to 15.6); no increase with other dopamine agonists',
        unreportedAdverseSignals:
          'Only 31 case patients were identified across the whole cohort, so the confidence intervals are wide and the analysis detects clinically diagnosed regurgitation rather than subclinical disease.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Echocardiographic prevalence study (Zanettini et al.)',
        phase: 'Cross-sectional echocardiographic prevalence study with controls',
        sampleSize: 245,
        primaryEndpoint:
          'Prevalence of grade 3 to 4 valve regurgitation on echocardiography in patients on pergolide, cabergoline or non-ergot agonists versus controls',
        endpointMet: true,
        statisticalPValue:
          '23.4% on pergolide and 28.6% on cabergoline versus 0% on non-ergot agonists and 5.6% in controls; mitral relative risk 6.3, P = 0.008; aortic 4.2, P = 0.01',
        unreportedAdverseSignals:
          'Tricuspid estimates did not reach significance in either ergot group (P = 0.16 and P = 0.12) on 64 and 49 patients, so those figures are uninformative rather than negative.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Incidence-rate ratio 7.1 (95% CI 2.3 to 22.3) for newly diagnosed valve regurgitation with current pergolide use in an 11,417-patient cohort',
        'Clinically important regurgitation on echocardiography in 23.4% on pergolide, 28.6% on cabergoline, 0% on non-ergot agonists and 5.6% of controls',
        'Mitral relative risk 6.3 (P = 0.008) and aortic 4.2 (P = 0.01) in the pergolide group',
        'Mitral tenting area greater in ergot-treated patients with a linear relationship to regurgitation severity, and higher cumulative dose in those with grade 3 to 4 disease',
      ],
      unsupportedInferences: [
        'That the two ergot dopamine agonists carry interchangeable valvular risk — the significant findings differ by drug and by valve',
        'That non-significant tricuspid estimates on 64 and 49 patients constitute evidence of no tricuspid effect',
      ],
      whatFailedInitially: [
        'Marketed from 1988 and withdrawn in March 2007, nineteen years later, for a mechanism the ergot literature had described since the 1960s',
        'Codified in the FDA withdrawn-for-safety list at 81 FR 69668 as "all drug products containing pergolide mesylate"',
      ],
      realWorldOutcome: [
        'Non-ergot dopamine agonists — pramipexole, ropinirole, rotigotine — took the indication and carry no valvular signal',
        'Cabergoline survived at the much lower doses used in hyperprolactinaemia, where cumulative exposure is a fraction of the Parkinson\'s dose, with echocardiographic monitoring recommended',
        'Pergolide remains in veterinary use for equine pituitary pars intermedia dysfunction',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, three times daily, titrated over weeks',
      description:
        'Oral ergoline given as an adjunct to levodopa and carbidopa, titrated slowly from a low starting dose to limit nausea and orthostatic hypotension. Plasma half-life around 27 hours with extensive hepatic metabolism.',
      safetyProfile:
        'Withdrawn from the United States market in March 2007 for cardiac valvulopathy. The measured harms are an incidence-rate ratio of 7.1 for newly diagnosed valve regurgitation and clinically important regurgitation in 23.4% of treated patients on echocardiography, both against a background where non-ergot dopamine agonists produced none. Risk increases with cumulative dose. Ergolines also carry retroperitoneal, pleural and pericardial fibrosis risk, and the class-wide dopamine agonist effects — impulse control disorders, sudden onset of sleep, orthostatic hypotension, hallucinations — apply as well.',
    },
    commonQuestions: [
      {
        q: 'How did a drug marketed since 1988 take nineteen years to be withdrawn?',
        a: 'Because the harm is silent until it is severe. Valve regurgitation develops slowly, produces no symptoms for years, and requires an echocardiogram to detect — and echocardiograms are not routinely performed on Parkinson\'s patients. The clinically diagnosed cases were few enough that the UK cohort of 11,417 patients yielded only 31 in total. What broke the case open was scanning patients who had no cardiac complaint, and finding that 23.4% of those on pergolide had moderate to severe regurgitation against 5.6% of controls. Once someone looked with the right instrument, the answer took one cross-sectional study.',
        auditNote:
          'The two 2007 papers appeared in the same journal issue with different designs in different countries. That agreement is what made the withdrawal quick once the evidence existed.',
      },
      {
        q: 'Does this apply to all dopamine agonists?',
        a: 'No, and the studies were designed to answer exactly that. Both included non-ergot dopamine agonists as an internal comparison group. In the UK cohort, current use of dopamine agonists other than pergolide and cabergoline showed no increase in valve regurgitation. In the echocardiographic study, clinically important regurgitation occurred in 0% of the 42 patients on non-ergot agonists, against 23.4% on pergolide. The liability tracks the ergoline scaffold and its 5-HT2B agonism, not dopamine agonism. Pramipexole, ropinirole and rotigotine remain in wide use.',
      },
      {
        q: 'Why is cabergoline still available if it was implicated too?',
        a: 'Because dose and duration differ enormously between its indications. In Parkinson\'s disease, cabergoline was given daily at doses in the milligram range for years, and the echocardiographic study found 28.6% with clinically important regurgitation and a significant relationship between cumulative dose and severity. In hyperprolactinaemia it is given at a small fraction of that, often weekly, so cumulative exposure is far lower. Cabergoline remains licensed for hyperprolactinaemia with echocardiographic monitoring recommended, and is not used for Parkinson\'s disease in most countries. The withdrawal decision was about a dose regime, not the molecule alone.',
      },
      {
        q: 'Why does this page not show a price?',
        a: 'Because pergolide has had no human market in the United States since March 2007 and is codified in the FDA withdrawn-for-safety list at 81 FR 69668. Veterinary preparations are priced, but that is a different product for a different species and not a figure this page would present as a human drug price.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Schade R, Andersohn F, Suissa S, Haverkamp W, Garbe E. Dopamine agonists and the risk of cardiac-valve regurgitation. N Engl J Med 2007;356:29-38',
        identifier: '10.1056/NEJMoa062222',
        kind: 'doi',
      },
      {
        label:
          'Zanettini R, Antonini A, Gatto G, Gentile R, Tesei S, Pezzoli G. Valvular heart disease and the use of dopamine agonists for Parkinson\'s disease. N Engl J Med 2007;356:39-46',
        identifier: '10.1056/NEJMoa054830',
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
          'FDA final rule 81 FR 69668, 7 October 2016 — "Pergolide mesylate: All drug products containing pergolide mesylate"',
        identifier:
          'https://www.federalregister.gov/documents/2016/10/07/2016-24333/additions-and-modifications-to-the-list-of-drug-products-that-have-been-withdrawn-or-removed-from',
        kind: 'regulatory',
      },
      {
        label: 'Drugs@FDA: PERMAX (pergolide mesylate), NDA 019385, Valeant — Discontinued',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=019385',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 47811 — pergolide structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/47811',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 15. Tegaserod — withdrawn on an internal adjudication, returned on two external ones
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'tegaserod',
    name: 'Tegaserod',
    tradeName: 'Zelnorm',
    sponsor: 'Novartis (NDA 021200), later Alfasigma; US Worldmeds and Alfasigma after 2019',
    targetGene: 'HTR4',
    targetProtein: 'Serotonin 5-HT4 receptor',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2002,
    indication:
      'Irritable bowel syndrome with constipation in women under 65 with no history of cardiovascular ischaemic events. Voluntarily withdrawn in March 2007 over a cardiovascular ischaemic signal, reapproved in March 2019 with the population narrowed to that group.',
    patientFriendlyIndication:
      'A tablet for irritable bowel syndrome with constipation, in women under 65 without heart disease',
    anatomicalSite:
      'Enteric nervous system of the gastrointestinal tract; 5-HT4 receptors on interneurons and motor neurons of the myenteric plexus',
    conditionContext: {
      conditionExplainer:
        'Irritable bowel syndrome with constipation combines infrequent, hard stools with abdominal pain and bloating. It has no structural lesion, so treatment targets motility and visceral sensation rather than a repairable defect.',
      whyItMatters:
        'The withdrawal and the return rest on the same 18,645 patients. Nothing new was measured. What changed was who adjudicated the events, and how the eligible population was drawn.',
      whoTakesThis:
        'Women under 65 with irritable bowel syndrome with constipation, no history of myocardial infarction, stroke, transient ischaemic attack or angina, and at most one cardiovascular risk factor.',
      clinicalGoals:
        'Increase stool frequency and reduce abdominal discomfort and bloating. The endpoint used in registration was a subject global assessment of relief over four weeks.',
    },
    oneSentenceVerdict:
      'A 5-HT4 agonist withdrawn in 2007 on an internal adjudication that found cardiovascular ischaemic events in 13 of 11,614 tegaserod patients against 1 of 7,031 on placebo, and reapproved in 2019 after two independent external adjudications of the same dataset put the coronary and cerebrovascular signal at an odds ratio of 4.24 with a confidence interval from 0.52 to 34.74.',
    laymanHowItWorks:
      'Serotonin is a signalling molecule the gut uses to coordinate the wave of muscle contraction that moves food along. Tegaserod switches on one particular serotonin receptor in the gut wall, which makes that wave stronger and more frequent, so stool moves faster and the gut becomes less sensitive to stretch. The same receptor family exists in blood vessels and platelets, which is where the cardiovascular question came from.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 62,
    substitutes: {
      summary:
        'For irritable bowel syndrome with constipation the alternatives act on chloride secretion rather than motility: linaclotide, plecanatide and lubiprostone. None carries a cardiovascular ischaemic question, and none has tegaserod\'s prokinetic mechanism.',
      conventionalRx: [
        {
          name: 'Linaclotide',
          class: 'Guanylate cyclase-C agonist',
          howItCompares:
            'Increases intestinal fluid secretion and transit through cyclic GMP rather than through serotonin receptors. Minimally absorbed, so it has no systemic cardiovascular exposure at all.',
          typicalCost: '',
          prosAndCons:
            'Pros: no systemic exposure, robust trial evidence in IBS-C. Cons: diarrhoea is the dose-limiting effect and is common.',
        },
        {
          name: 'Lubiprostone',
          class: 'Chloride channel type 2 activator',
          howItCompares:
            'Also a secretagogue rather than a prokinetic. Approved for IBS-C in women, which makes it the closest licensed comparator by population.',
          typicalCost: '',
          prosAndCons:
            'Pros: long post-marketing record. Cons: nausea is frequent and dose-related.',
        },
        {
          name: 'Plecanatide',
          class: 'Guanylate cyclase-C agonist',
          howItCompares:
            'Same target as linaclotide with a uroguanylin-like pH-dependent activity profile. Another secretory route to the same clinical goal.',
          typicalCost: '',
          prosAndCons: 'Pros: no cardiovascular signal. Cons: diarrhoea, contraindicated under six.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CCCCCN=C(N)N/N=C/C1=CNC2=C1C=C(C=C2)OC',
      chemicalFormula: 'C16H23N5O',
      molecularWeight: '301.39 g/mol',
      targetReceptorAffinity:
        'An aminoguanidine indole and a selective partial agonist at the serotonin 5-HT4 receptor. It is an indole rather than a benzamide, which distinguishes it from cisapride: cisapride blocked the hERG potassium channel and prolonged the QT interval, and tegaserod does not. The two gastrointestinal prokinetics on this page failed for entirely different reasons.',
      structureSource: {
        label: 'PubChem CID 135409453 (tegaserod) — canonical SMILES, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/135409453',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'teg-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity of the aminoguanidine hydrazone and its E geometry',
          description:
            'Confirm the methoxy-indole core, the pentyl aminoguanidine and the E configuration of the hydrazone double bond. Hydrazones isomerise, so a method that resolves E from Z is required rather than a total-tegaserod assay.',
          reagentsAndBuffer:
            'Tegaserod maleate certified reference standard, reversed-phase HPLC with photodiode array detection, proton and carbon NMR in deuterated dimethyl sulfoxide, LC-MS electrospray positive mode at m/z 302',
        },
        {
          id: 'teg-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Related substances and maleate counter-ion assay',
          description:
            'Quantify the hydrazone Z isomer, the indole aldehyde hydrolysis product and residual aminoguanidine. Separately confirm maleate stoichiometry, since the marketed salt is the maleate and the free base mass differs.',
          dependsOnStepId: 'teg-w1',
          reagentsAndBuffer:
            'C18 column with acetonitrile and ammonium formate gradient, ion chromatography or capillary electrophoresis for maleate, forced degradation samples under acid, base, oxidative and photolytic stress',
        },
        {
          id: 'teg-w3',
          stepNumber: 3,
          phase: 'Cellular_Delivery',
          name: 'Colonic smooth muscle and enteric neuron preparation',
          description:
            'Prepare isolated segments of human or guinea pig colon with the myenteric plexus intact, mounted in organ baths, to measure the peristaltic reflex that 5-HT4 agonism is meant to enhance. This is the functional preparation the receptor binding numbers have to explain.',
          reagentsAndBuffer:
            'Krebs-Henseleit solution gassed with 95% oxygen and 5% carbon dioxide at 37 degrees, isometric force transducers, tetrodotoxin and a selective 5-HT4 antagonist as mechanism controls',
        },
        {
          id: 'teg-w4',
          stepNumber: 4,
          phase: 'Assay_Quantification',
          name: '5-HT4 binding and functional selectivity against 5-HT2B and hERG',
          description:
            'Radioligand displacement at recombinant human 5-HT4 to establish potency, then counter-screen at 5-HT2B and at the hERG potassium channel. The 5-HT2B screen exists because of fenfluramine and pergolide; the hERG screen exists because of cisapride, the prokinetic tegaserod was intended to replace.',
          dependsOnStepId: 'teg-w3',
          reagentsAndBuffer:
            'Membranes from cells expressing human HTR4, [3H]-GR113808 radioligand, cyclic AMP accumulation assay for functional agonism, hERG patch-clamp in stably transfected HEK293 cells with cisapride as positive control',
        },
        {
          id: 'teg-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Platelet aggregation and vascular contractility screen',
          description:
            'Measure platelet aggregation in platelet-rich plasma and contractile responses in isolated coronary artery rings across the clinically relevant concentration range. This is the assay that addresses the mechanism proposed for the 2007 ischaemic signal, and its results are what an adjudication panel has to weigh against thirteen events in eleven thousand patients.',
          dependsOnStepId: 'teg-w4',
          reagentsAndBuffer:
            'Human platelet-rich plasma, light transmission aggregometry with ADP and collagen agonists, isolated coronary or mesenteric artery ring myography, serotonin and a 5-HT2A antagonist as reference compounds',
        },
      ],
    },
    keyAudits: [
      {
        id: 'teg-a1',
        category: 'measured',
        title: 'Thirteen ischaemic events in 11,614 patients against one in 7,031 on placebo',
        laymanSummary:
          'Pooling every placebo-controlled trial, thirteen people on tegaserod had a cardiovascular ischaemic event and one person on placebo did. That is 0.11% against 0.014%.',
        technicalDetails:
          'The 2007 withdrawal rested on an internal adjudication of pooled placebo-controlled tegaserod data covering 18,645 patients — 11,614 on tegaserod and 7,031 on placebo. Twenty-four possible cardiovascular ischaemic events were identified internally, twenty on tegaserod and four on placebo. The first adjudication classified 14 of these (0.075% of the pooled population) as events: 13 on tegaserod (0.11%) and 1 on placebo (0.014%). Every one of the 14 patients had at least one cardiovascular risk factor and 11 had two or more. The absolute numbers are what make this a hard case: thirteen events is a small enough count that a single reclassification moves the ratio substantially.',
        evidenceSource: 'Lacy BE, Brenner DM, Chey WD. Clin Gastroenterol Hepatol 2022;20:e682-e695',
        doi: '10.1016/j.cgh.2021.05.040',
        measuredMetric:
          'Adjudicated cardiovascular ischaemic events in pooled placebo-controlled trials, tegaserod versus placebo',
        auditFlag: 'verified',
      },
      {
        id: 'teg-a2',
        category: 'conclusion_shift',
        title: 'Two external adjudications of the same data reached a different answer',
        laymanSummary:
          'Independent committees re-reviewed the same patient records. Restricted to coronary and cerebrovascular events, the difference was 7 against 1, and the confidence interval ran from 0.52 to 34.74 — it crosses 1.',
        technicalDetails:
          'For the 2018 advisory committee an independent committee re-adjudicated the 24 possible events, and a second independent external adjudication followed. The second adjudication reviewed 390 events, of which 24 (0.13%) were classified as probable new or worsening cardiovascular events: 18 on tegaserod (0.16%) and 6 on placebo (0.09%). Restricting to coronary or cerebrovascular ischaemic events gave 7 on tegaserod (0.06%) against 1 on placebo (0.01%), an odds ratio of 4.24 with a 95% confidence interval of 0.52 to 34.74 and P = 0.273. Among women under 65 with no history of cardiovascular ischaemic events and at most one risk factor, there were no major adverse cardiovascular events at all. The dataset did not change between 2007 and 2018. The classification of the events, and the definition of the population, did.',
        evidenceSource: 'Lacy BE, Brenner DM, Chey WD. Clin Gastroenterol Hepatol 2022;20:e682-e695',
        doi: '10.1016/j.cgh.2021.05.040',
        measuredMetric:
          'Odds ratio 4.24 (95% CI 0.52 to 34.74, P = 0.273) for coronary or cerebrovascular ischaemic events on external re-adjudication',
        auditFlag: 'verified',
      },
      {
        id: 'teg-a3',
        category: 'inferred',
        title: 'A non-significant odds ratio of 4.24 is not evidence of no effect',
        laymanSummary:
          'The re-adjudicated result did not reach statistical significance, but its central estimate is still a fourfold difference. Failing to reach significance on eight events is not the same as showing there is no risk.',
        technicalDetails:
          'The confidence interval on the re-adjudicated coronary and cerebrovascular comparison runs from 0.52 to 34.74. It includes 1, which is why P = 0.273, and it also includes 30, which is why the result cannot be read as reassurance. Eight events in 18,645 patients is close to the limit of what a pooled trial programme can resolve. The 2019 approval is better described as a decision that the residual uncertainty is acceptable in a low-risk population than as a finding that the 2007 signal was spurious. The label carries the restriction precisely because the uncertainty was not eliminated.',
        evidenceSource:
          'Lacy BE, Brenner DM, Chey WD. Clin Gastroenterol Hepatol 2022;20:e682-e695; FDA notice of the joint Gastrointestinal Drugs and Drug Safety and Risk Management advisory committee meeting, 11 September 2018',
        doi: '10.1016/j.cgh.2021.05.040',
        inferredClaim:
          'That the external re-adjudication showed tegaserod carries no cardiovascular ischaemic risk',
        auditFlag: 'caution',
      },
      {
        id: 'teg-a4',
        category: 'measured',
        title: 'Efficacy in the reapproval population: 44.1% responded against 36.5% on placebo',
        laymanSummary:
          'In the four trials pooled for the 2019 label, 44.1% of women rated themselves relieved on tegaserod against 36.5% on placebo. The odds ratio is 1.38.',
        technicalDetails:
          'A pooled analysis of four 12-week randomised placebo-controlled trials of tegaserod 6 mg twice daily. The indicated population — women under 65 with IBS-C and no history of cardiovascular ischaemic events — comprised 2,752 participants, 1,386 on tegaserod and 1,366 on placebo. The primary endpoint was subjective global assessment of symptom relief, with a responder rating themselves considerably or completely relieved at least half the time, or at least somewhat relieved all of the time, over the final four weeks. Clinical response during the last four weeks was 44.1% on tegaserod against 36.5% on placebo, pooled odds ratio 1.38 (95% CI 1.18 to 1.61, P < 0.001). In the overall female population the figures were 43.3% against 35.9%, odds ratio 1.37 (1.18 to 1.59). The effect size here is the other half of the benefit-risk arithmetic the adjudication argument was about.',
        evidenceSource: 'Shah ED, Lacy BE, Chey WD, Chang L, Brenner DM. Am J Gastroenterol 2021;116:1601-1611',
        doi: '10.14309/ajg.0000000000001313',
        measuredMetric:
          'Pooled 12-week subjective global assessment responder rate, tegaserod 6 mg twice daily versus placebo, in women under 65 without cardiovascular ischaemic history',
        auditFlag: 'verified',
      },
      {
        id: 'teg-a5',
        category: 'conclusion_shift',
        title: 'It is on the market and still on the federal withdrawn-for-safety list',
        laymanSummary:
          'Tegaserod has been approved again since 2019, but the federal regulation listing drugs withdrawn for safety reasons still names it. Both statements are currently true.',
        technicalDetails:
          '21 CFR 216.24, the codified list of drug products withdrawn or removed from the market for reasons of safety or effectiveness, still carries the entry "Tegaserod maleate: All drug products containing tegaserod maleate", added after the 2007 withdrawal. That list governs which substances may be used in pharmacy compounding; it is not a statement about the current marketing status of the approved product, which is a separate determination. The result is that a reader checking the regulation and a reader checking the label get opposite impressions, and both are reading a current federal document. Recording only one of them would misrepresent the record.',
        evidenceSource: '21 CFR 216.24, current as of August 2026',
        auditFlag: 'contested',
      },
      {
        id: 'teg-a6',
        category: 'measured',
        title: 'It is not cisapride: the mechanism of failure is different',
        laymanSummary:
          'The previous gut prokinetic to be withdrawn, cisapride, caused fatal heart rhythm disturbances by blocking a specific cardiac potassium channel. Tegaserod does not do that.',
        technicalDetails:
          'Cisapride is a substituted benzamide that blocks the hERG potassium channel, prolonging cardiac repolarisation and producing torsades de pointes; it was withdrawn in 2000 for that reason. Tegaserod is an aminoguanidine indole with no comparable hERG activity and no QT signal in its trial programme. The 2007 tegaserod question was ischaemic — myocardial infarction, unstable angina, stroke — not arrhythmic. Two 5-HT4 agonists for the same indication were removed from the United States market seven years apart for two unrelated cardiac mechanisms, which is why "5-HT4 agonists are cardiotoxic" is not a usable summary of either case.',
        evidenceSource:
          'Lacy BE, Brenner DM, Chey WD. Clin Gastroenterol Hepatol 2022;20:e682-e695; 21 CFR 216.24 entries for cisapride and tegaserod maleate',
        doi: '10.1016/j.cgh.2021.05.040',
        auditFlag: 'verified',
      },
      {
        id: 'teg-a7',
        category: 'failed',
        title: 'The original NDA was withdrawn outright in 2022',
        laymanSummary:
          'The 2019 return did not revive the old application. Novartis\'s original approval was formally withdrawn in December 2022, after the drug was already back on sale under new ownership.',
        technicalDetails:
          'Zelnorm returned to the market in 2019 under a new sponsor arrangement, and the original application, NDA 021200, appears in Drugs@FDA with all listed Zelnorm products in Discontinued marketing status. The Federal Register notice of 8 December 2022 records the withdrawal of approval of 35 new drug applications by Teva Branded Pharmaceutical Products R and D and others. The administrative history and the commercial history of this drug diverge, which is why an approval-status field alone cannot describe it.',
        evidenceSource:
          'Drugs@FDA NDA 021200 (ZELNORM, Alfasigma) — all products Discontinued; Federal Register 87 FR (8 December 2022) withdrawal notice',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'An oral tablet taken before meals',
        laymanDesc: 'Swallowed twice a day, shortly before eating.',
        molecularDetail:
          'Oral tegaserod maleate 6 mg twice daily before meals. Absolute bioavailability is low and food reduces absorption further, which is why the timing is specified.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Reaches the nerve network in the gut wall',
        laymanDesc:
          'It reaches the layer of nerve cells embedded between the muscle coats of the intestine.',
        molecularDetail:
          'Distributes to the myenteric plexus, the enteric neuronal network lying between the circular and longitudinal muscle layers, where 5-HT4 receptors sit on interneurons and motor neurons.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Partial agonist at the 5-HT4 receptor',
        laymanDesc:
          'It switches on a serotonin receptor on those nerve cells — partly, not fully, which limits how far the effect can be pushed.',
        molecularDetail:
          'Selective partial agonism at 5-HT4, a Gs-coupled receptor. Receptor occupancy raises intracellular cyclic AMP in enteric neurons and enhances release of acetylcholine and calcitonin gene-related peptide.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The peristaltic reflex is amplified',
        laymanDesc:
          'The coordinated squeeze that moves contents along the gut becomes stronger and more frequent, and the gut becomes less sensitive to stretch.',
        molecularDetail:
          'Enhanced neurotransmitter release amplifies the peristaltic reflex: contraction above the bolus and relaxation below it. Intestinal secretion increases and visceral afferent sensitivity to distension falls.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Faster transit, fewer symptoms — and the ischaemic question',
        laymanDesc:
          'Stool frequency rises and pain and bloating fall. The unresolved question is whether the same receptor family acting outside the gut raises cardiovascular risk.',
        molecularDetail:
          'Measured: subjective global assessment response 44.1% against 36.5% on placebo, odds ratio 1.38 (95% CI 1.18 to 1.61), in the indicated population. Unresolved: adjudicated coronary and cerebrovascular ischaemic events 7 versus 1, odds ratio 4.24 (95% CI 0.52 to 34.74).',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Pooled placebo-controlled tegaserod safety database (internal adjudication, 2007)',
        phase: 'Pooled analysis of the placebo-controlled programme',
        sampleSize: 18645,
        primaryEndpoint:
          'Adjudicated cardiovascular ischaemic events in 11,614 tegaserod and 7,031 placebo patients',
        endpointMet: false,
        statisticalPValue:
          '13 events (0.11%) on tegaserod against 1 (0.014%) on placebo; all 14 patients had at least one cardiovascular risk factor and 11 had two or more',
        unreportedAdverseSignals:
          'Fourteen events across 18,645 patients is close to the resolution limit of the dataset; a single reclassification moves the ratio substantially, which is what the later adjudications demonstrated.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'External re-adjudication for the 2018 advisory committee',
        phase: 'Independent external adjudication of the same pooled dataset',
        sampleSize: 18645,
        primaryEndpoint:
          'Probable new or worsening cardiovascular events, and coronary or cerebrovascular ischaemic events specifically',
        endpointMet: true,
        statisticalPValue:
          'Coronary or cerebrovascular ischaemic events 7 (0.06%) versus 1 (0.01%); odds ratio 4.24, 95% CI 0.52 to 34.74, P = 0.273',
        unreportedAdverseSignals:
          'The interval extends to 34.74. A non-significant result on eight events is uninformative rather than reassuring, and the restricted label reflects that.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Pooled efficacy analysis in the indicated population (Shah et al.)',
        phase: 'Pooled analysis of four 12-week randomised placebo-controlled trials',
        sampleSize: 2752,
        primaryEndpoint:
          'Subjective global assessment of IBS-C symptom relief over the final four weeks, in women under 65 without a history of cardiovascular ischaemic events',
        endpointMet: true,
        statisticalPValue:
          '44.1% versus 36.5%; pooled odds ratio 1.38 (95% CI 1.18 to 1.61), P < 0.001',
        unreportedAdverseSignals:
          'Diarrhoea was the most frequent adverse event. The trials were not powered for cardiovascular outcomes and were never intended to settle that question.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Internal adjudication: 13 cardiovascular ischaemic events in 11,614 tegaserod patients (0.11%) against 1 in 7,031 on placebo (0.014%)',
        'External re-adjudication: 7 coronary or cerebrovascular ischaemic events (0.06%) against 1 (0.01%), odds ratio 4.24, 95% CI 0.52 to 34.74, P = 0.273',
        'No major adverse cardiovascular events in women under 65 with no ischaemic history and at most one risk factor',
        'Pooled subjective global assessment response 44.1% versus 36.5% on placebo, odds ratio 1.38 (95% CI 1.18 to 1.61), P < 0.001, in 2,752 women in the indicated population',
      ],
      unsupportedInferences: [
        'That a non-significant odds ratio of 4.24 with an upper bound of 34.74 demonstrates the absence of cardiovascular risk',
        'That the 2007 withdrawal was refuted by new evidence — no new patients were studied; the same records were re-adjudicated',
        'That "5-HT4 agonists are cardiotoxic" summarises both this drug and cisapride, whose failure was hERG-mediated arrhythmia rather than ischaemia',
      ],
      whatFailedInitially: [
        'Voluntarily withdrawn from the United States market in March 2007 on the internal adjudication',
        'The original application, NDA 021200, is recorded in Drugs@FDA with all Zelnorm products Discontinued',
        'The entry "Tegaserod maleate: All drug products containing tegaserod maleate" remains in 21 CFR 216.24 today',
      ],
      realWorldOutcome: [
        'Reapproved in March 2019 for women under 65 with IBS-C and no history of cardiovascular ischaemic events',
        'The restriction is the mechanism by which the residual uncertainty is managed rather than resolved',
        'Secretagogues — linaclotide, plecanatide, lubiprostone — took most of the indication during the twelve-year absence',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, 6 mg twice daily before meals',
      description:
        'Tegaserod maleate tablets taken twice daily shortly before eating. Low absolute bioavailability, reduced further by food, with rapid absorption and a short elimination half-life.',
      safetyProfile:
        'Diarrhoea is the most common adverse effect and the dose-limiting one; ischaemic colitis has been reported. The cardiovascular ischaemic signal that caused the 2007 withdrawal was not eliminated by re-adjudication — the point estimate remained an odds ratio of 4.24 with a confidence interval from 0.52 to 34.74 — and the current label manages it by excluding women 65 and over, anyone with a history of myocardial infarction, stroke, transient ischaemic attack or angina, and anyone with more than one cardiovascular risk factor. Contraindicated in severe renal impairment and moderate or severe hepatic impairment.',
    },
    commonQuestions: [
      {
        q: 'If no new trial was run, what actually changed between 2007 and 2019?',
        a: 'Who classified the events, and who the drug is for. The 2007 decision came from an adjudication run inside the sponsor, applied to the whole treated population. The 2018 case rested on two independent external adjudications of the identical records, which reclassified enough events that the coronary and cerebrovascular comparison fell to 7 against 1 with a confidence interval crossing 1, and on restricting the label to the subgroup in which no major adverse cardiovascular events had occurred at all. Both of those are legitimate moves. Neither is new evidence about the drug.',
        auditNote:
          'The dataset is identical in both directions: 18,645 patients, 11,614 on tegaserod and 7,031 on placebo.',
      },
      {
        q: 'Is the drug safe now?',
        a: 'The honest answer is that the question was narrowed rather than answered. In the population the label now covers — women under 65, no history of cardiovascular ischaemic events, at most one risk factor — no major adverse cardiovascular events occurred in the pooled programme. That is a real observation, and it is also an observation about a subgroup within a dataset containing eight adjudicated ischaemic events in total. The restriction exists because the uncertainty was not removed.',
      },
      {
        q: 'Why does a federal regulation still list it as withdrawn for safety?',
        a: 'Because 21 CFR 216.24 governs pharmacy compounding rather than marketing. A substance enters that list when it is withdrawn or removed for reasons of safety or effectiveness, and the entry for tegaserod maleate added after 2007 has not been removed. The approved product is separately marketed under its current label. Both records are current; they answer different questions.',
      },
      {
        q: 'Why is there no price on this page?',
        a: 'Because this file does not carry pricing. A per-dose manufacturing cost would be an estimate rather than a published figure, and this page states published figures with their sources.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Lacy BE, Brenner DM, Chey WD. Re-evaluation of the cardiovascular safety profile of tegaserod: a review of the clinical data. Clin Gastroenterol Hepatol 2022;20:e682-e695',
        identifier: '10.1016/j.cgh.2021.05.040',
        kind: 'doi',
      },
      {
        label:
          'Shah ED, Lacy BE, Chey WD, Chang L, Brenner DM. Tegaserod for irritable bowel syndrome with constipation in women younger than 65 years without cardiovascular disease: pooled analyses of 4 controlled trials. Am J Gastroenterol 2021;116:1601-1611',
        identifier: '10.14309/ajg.0000000000001313',
        kind: 'doi',
      },
      {
        label:
          'FDA notice of the joint meeting of the Gastrointestinal Drugs Advisory Committee and the Drug Safety and Risk Management Advisory Committee on tegaserod, 11 September 2018',
        identifier:
          'https://www.federalregister.gov/documents/2018/09/11/2018-19669/joint-meeting-of-the-gastrointestinal-drugs-advisory-committee-and-the-drug-safety-and-risk',
        kind: 'regulatory',
      },
      {
        label:
          '21 CFR 216.24 — Drug products withdrawn or removed from the market for reasons of safety or effectiveness (entry: tegaserod maleate)',
        identifier: 'https://www.ecfr.gov/current/title-21/section-216.24',
        kind: 'regulatory',
      },
      {
        label: 'Drugs@FDA: ZELNORM (tegaserod maleate), NDA 021200, Alfasigma — Discontinued',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021200',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 135409453 — tegaserod structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/135409453',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 16. Efalizumab — the anti-integrin that did not come back
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'efalizumab',
    name: 'Efalizumab',
    tradeName: 'Raptiva',
    sponsor: 'Genentech in the United States, Merck Serono in Europe (BLA 125075)',
    targetGene: 'ITGAL',
    targetProtein:
      'Integrin alpha-L chain (CD11a), the alpha subunit of leukocyte function-associated antigen 1 (LFA-1, alphaLbeta2)',
    modality: 'Monoclonal Antibody (mAb)',
    approvalStatus: 'Withdrawn from Market',
    approvalYear: 2003,
    indication:
      'Chronic moderate to severe plaque psoriasis in adults who were candidates for systemic therapy or phototherapy. Suspended by the EMA in February 2009 and voluntarily withdrawn from the United States market in 2009 after four reports of progressive multifocal leukoencephalopathy.',
    patientFriendlyIndication: 'A weekly injection for severe plaque psoriasis',
    anatomicalSite:
      'Circulating T lymphocytes and the dermal vascular endothelium; the toxicity site is central nervous system white matter',
    conditionContext: {
      conditionExplainer:
        'Plaque psoriasis is driven by T cells that leave the bloodstream, enter the skin, and sustain an inflammatory loop that makes keratinocytes divide far too fast. Blocking the adhesion step that lets T cells cross the vessel wall was a rational way to interrupt it.',
      whyItMatters:
        'Efalizumab and natalizumab are the same idea applied to two organs: block a leukocyte integrin so lymphocytes cannot enter the tissue. Both produced progressive multifocal leukoencephalopathy. Natalizumab returned under a monitoring programme and efalizumab did not, and the reason is arithmetic rather than principle.',
      whoTakesThis:
        'Nobody. The product is withdrawn worldwide. Patients on it in 2009 were transitioned to other systemic agents, which by then included the TNF inhibitors and ustekinumab.',
      clinicalGoals:
        'A 75% reduction in the Psoriasis Area and Severity Index — PASI-75 — was the registration endpoint, measured at 12 weeks.',
    },
    oneSentenceVerdict:
      'A humanised anti-CD11a antibody that produced PASI-75 in 22 to 28 per cent of patients against 5 per cent on placebo at 12 weeks, withdrawn in 2009 after four reports of progressive multifocal leukoencephalopathy in psoriasis patients — every one of them fatal, and every one after three or more years of continuous treatment.',
    laymanHowItWorks:
      'White blood cells stick to the inside of blood vessels before they squeeze through the wall into tissue. That sticking uses a surface protein pair, and efalizumab is an antibody that covers one half of that pair. T cells then cannot grip the vessel wall properly, so far fewer of them reach the skin and the psoriasis plaques settle. The same grip is used by T cells that patrol the brain for a common dormant virus, and blocking it long enough allowed that virus to reactivate.',
    auditConfidence: 'High Confidence',
    confidenceScore: 88,
    substitutes: {
      summary:
        'By 2009 the biologic alternatives for severe plaque psoriasis were already better: the TNF inhibitors and ustekinumab, and since then the IL-17 and IL-23 antagonists, which reach PASI-75 rates two to three times efalizumab\'s.',
      conventionalRx: [
        {
          name: 'Ustekinumab',
          class: 'Anti-IL-12/IL-23 p40 monoclonal antibody',
          howItCompares:
            'Approved for plaque psoriasis in 2009, the year efalizumab was withdrawn. Blocks a cytokine pathway rather than a leukocyte adhesion step, so it does not impair immune surveillance of the central nervous system in the same way.',
          typicalCost: '',
          prosAndCons:
            'Pros: far higher PASI-75 rates, quarterly dosing. Cons: infection risk, cost, long half-life.',
        },
        {
          name: 'Adalimumab',
          class: 'Anti-TNF-alpha monoclonal antibody',
          howItCompares:
            'The established biologic comparator at the time of withdrawal. In the FDA adverse event review that examined all psoriasis biologics, the PML cases attributed to anti-TNF agents occurred in other conditions and with confounding immunosuppression.',
          typicalCost: '',
          prosAndCons:
            'Pros: long safety record, effective in psoriatic arthritis too. Cons: tuberculosis reactivation, injection-site reactions.',
        },
        {
          name: 'Secukinumab',
          class: 'Anti-IL-17A monoclonal antibody',
          howItCompares:
            'A later generation with PASI-75 rates well above 70 per cent at 12 weeks, against efalizumab\'s 22 to 28 per cent. The efficacy gap is why efalizumab has no argument for return even setting the PML aside.',
          typicalCost: '',
          prosAndCons:
            'Pros: high and rapid clearance rates. Cons: candidiasis, inflammatory bowel disease exacerbation.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'antibody_structure',
      chemicalFormula: 'Humanised IgG1 kappa monoclonal antibody',
      molecularWeight: 'Approximately 150 kDa',
      targetReceptorAffinity:
        'Binds the alpha-L subunit (CD11a) of leukocyte function-associated antigen 1, the alphaLbeta2 integrin expressed on all leukocytes. Blocking CD11a prevents LFA-1 from engaging intercellular adhesion molecule 1 on endothelium and antigen-presenting cells, which blocks both firm adhesion for transendothelial migration and the immunological synapse. Natalizumab targets a different integrin subunit, alpha-4, on the same functional step.',
      structureSource: {
        label:
          'Lebwohl M et al. A novel targeted T-cell modulator, efalizumab, for plaque psoriasis. N Engl J Med 2003;349:2004-2013 — antibody description and target',
        identifier: '10.1056/NEJMoa030002',
        kind: 'doi',
      },
      laboratoryWorkflow: [
        {
          id: 'efa-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity, charge variants and glycan profile',
          description:
            'Confirm the humanised IgG1 kappa framework by peptide mapping and intact mass, then profile charge heterogeneity and the N-linked glycan distribution at the conserved Fc site, which governs effector function.',
          reagentsAndBuffer:
            'Trypsin and Lys-C digestion with LC-MS/MS peptide mapping, imaged capillary isoelectric focusing, released N-glycan analysis by hydrophilic interaction chromatography with fluorescence detection, size-exclusion chromatography for aggregate content',
        },
        {
          id: 'efa-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'CD11a binding affinity and epitope confirmation',
          description:
            'Measure association and dissociation rates against recombinant human CD11a I-domain by surface plasmon resonance, and confirm the antibody does not cross-react with the beta-2 subunit or with alpha-4 integrin, which is a different drug\'s target.',
          dependsOnStepId: 'efa-w1',
          reagentsAndBuffer:
            'Recombinant human ITGAL I-domain on a CM5 sensor chip, HBS-EP running buffer, ELISA plates coated with alphaLbeta2, alphaMbeta2 and alpha4beta1 for selectivity, isotype-matched control antibody',
        },
        {
          id: 'efa-w3',
          stepNumber: 3,
          phase: 'Cellular_Delivery',
          name: 'T-cell transendothelial migration assay',
          description:
            'Culture human brain or dermal microvascular endothelial monolayers on permeable supports, add primary human T cells with the antibody, and measure how many cross. This is the assay that shows the therapeutic mechanism and the PML mechanism are the same event in two tissues.',
          reagentsAndBuffer:
            'Primary human dermal and brain microvascular endothelial cells, transwell inserts with 3 micron pores, TNF-alpha and interferon-gamma to upregulate ICAM-1, CD3-positive T cells from healthy donors, CXCL12 chemotactic gradient',
        },
        {
          id: 'efa-w4',
          stepNumber: 4,
          phase: 'Assay_Quantification',
          name: 'CD11a receptor occupancy and surface downmodulation on circulating T cells',
          description:
            'Flow cytometry on whole blood to quantify free CD11a, bound antibody and total CD11a on CD3-positive lymphocytes. Efalizumab both blocks and downmodulates the receptor, so an occupancy figure alone understates the functional effect and understates how long recovery takes after the last dose.',
          dependsOnStepId: 'efa-w3',
          reagentsAndBuffer:
            'Whole blood with EDTA, non-competing anti-CD11a detection clone, anti-human IgG secondary for bound drug, CD3 and CD4 lineage markers, quantitative calibration beads for antibodies bound per cell',
        },
        {
          id: 'efa-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'JC virus DNA quantification in cerebrospinal fluid and plasma',
          description:
            'Quantitative PCR for JC polyomavirus DNA in cerebrospinal fluid, the diagnostic that confirmed PML in every reported case. Paired with anti-JCV antibody serology and a lymphocyte migration measurement, this is the assay set that a monitoring programme for an anti-integrin antibody has to be built on.',
          dependsOnStepId: 'efa-w4',
          reagentsAndBuffer:
            'Cerebrospinal fluid and EDTA plasma, real-time quantitative PCR targeting the JCV large T antigen region, plasmid standard curve for copy number, anti-JCV antibody ELISA, magnetic resonance imaging correlation',
        },
      ],
    },
    keyAudits: [
      {
        id: 'efa-a1',
        category: 'measured',
        title: 'PASI-75 in 22 to 28 per cent at 12 weeks against 5 per cent on placebo',
        laymanSummary:
          'In the pivotal trial of 597 patients, about a quarter of those on efalizumab had their psoriasis score fall by three quarters at 12 weeks, against one in twenty on placebo.',
        technicalDetails:
          'Phase 3 multicentre randomised placebo-controlled double-blind trial in 597 subjects with moderate to severe plaque psoriasis, randomised to subcutaneous efalizumab 1 mg/kg/week, 2 mg/kg/week, or placebo for 12 weeks. At week 12, an improvement of 75 per cent or more in the Psoriasis Area and Severity Index occurred in 22 per cent at 1 mg/kg and 28 per cent at 2 mg/kg, against 5 per cent on placebo (P < 0.001 for both). Separation from placebo was evident by week 4 (P < 0.001). Among efalizumab-treated responders at week 12, response was maintained through week 24 in 77 per cent of those who continued against 20 per cent of those switched to placebo. After discontinuation at week 24, PASI-50 was maintained in roughly 30 per cent over the following 12 weeks.',
        evidenceSource: 'Lebwohl M et al. N Engl J Med 2003;349:2004-2013',
        doi: '10.1056/NEJMoa030002',
        measuredMetric: 'PASI-75 response rate at 12 weeks, efalizumab versus placebo',
        auditFlag: 'verified',
      },
      {
        id: 'efa-a2',
        category: 'measured',
        title: 'Four PML cases in psoriasis patients, all fatal, all after three or more years',
        laymanSummary:
          'The FDA searched its adverse-event database for brain infections reported with every psoriasis biologic. Efalizumab was the only one with cases in psoriasis patients. All of them died.',
        technicalDetails:
          'FDA Office of Surveillance and Epidemiology searched the Adverse Event Reporting System for post-marketing reports of progressive multifocal leukoencephalopathy associated with the biologics approved for psoriasis — adalimumab, alefacept, efalizumab, etanercept and infliximab — from approval to 30 January 2009. Twelve cases suggestive of PML were identified: adalimumab 1, efalizumab 4, etanercept 3, infliximab 4. Efalizumab was the only drug with cases occurring in the setting of psoriasis. All four efalizumab cases presented three years or more after treatment initiation, and all resulted in death. The cases attributed to the other agents occurred in conditions other than psoriasis and were confounded by concurrent immunosuppression or were not confirmed PML.',
        evidenceSource: 'Kothary N, Diak IL, Brinker A, Bezabeh S, Avigan M, Dal Pan G. J Am Acad Dermatol 2011;65:546-551',
        doi: '10.1016/j.jaad.2010.05.033',
        measuredMetric:
          'Confirmed PML cases by psoriasis biologic in the FDA Adverse Event Reporting System through 30 January 2009',
        auditFlag: 'verified',
      },
      {
        id: 'efa-a3',
        category: 'measured',
        title: 'The mechanism was demonstrated directly in a treated patient',
        laymanSummary:
          'In one patient, researchers measured how well T cells could cross a vessel wall while on the drug, and again after it was removed. Migration recovered as the blocked protein reappeared.',
        technicalDetails:
          'Two patients with severe psoriasis treated for three years or more developed fatal PML with JC virus identified in cerebrospinal fluid; both died two and six months after onset despite plasma exchange and signs of immune reconstitution, with PML confirmed neuropathologically. Serial studies in one patient showed that efalizumab treatment was associated with reduced transendothelial migration by peripheral T cells in vitro, and that as LFA-1 expression on peripheral T cells rose after plasma exchange, in vitro migration increased with it. That is a direct dose-response measurement of the proposed mechanism in the affected patient rather than an inference from the drug\'s target.',
        evidenceSource: 'Schwab N et al. Neurology 2012;78:458-467',
        doi: '10.1212/WNL.0b013e3182478d4b',
        measuredMetric:
          'T-cell transendothelial migration against LFA-1 surface expression, before and after plasma exchange',
        auditFlag: 'verified',
      },
      {
        id: 'efa-a4',
        category: 'conclusion_shift',
        title: 'The same mechanism, the opposite regulatory outcome, in the same years',
        laymanSummary:
          'Natalizumab blocks a closely related adhesion protein, also caused PML, and was brought back under a monitoring programme. Efalizumab was not. The difference is what the alternatives looked like.',
        technicalDetails:
          'Natalizumab, an anti-alpha-4-integrin antibody, was withdrawn in February 2005 after three PML cases and returned in June 2006 under a restricted distribution and monitoring programme. Efalizumab, an anti-CD11a antibody blocking the same functional step in a different integrin, was withdrawn in 2009 and never returned. The distinguishing facts are not mechanistic. Natalizumab reduced the relapse rate by 68 per cent in relapsing multiple sclerosis, a progressive neurological disease with limited alternatives. Efalizumab produced PASI-75 in a quarter of psoriasis patients at a time when ustekinumab was being approved and the TNF inhibitors were established. When the benefit is modest and substitutes exist, a monitoring programme does not change the arithmetic.',
        evidenceSource:
          'Kothary N et al. J Am Acad Dermatol 2011;65:546-551; Polman CH et al. N Engl J Med 2006;354:899-910',
        doi: '10.1016/j.jaad.2010.05.033',
        auditFlag: 'verified',
      },
      {
        id: 'efa-a5',
        category: 'inferred',
        title: 'No incidence rate was ever established, only a numerator',
        laymanSummary:
          'Four cases were reported. Nobody knows how many people had taken the drug for three or more years, so the actual risk per patient was never calculated.',
        technicalDetails:
          'The FDA analysis rests on spontaneous post-marketing reports, which the authors identify as limited by underreporting and by variable quality of information. There is a numerator — four confirmed cases in psoriasis — and no reliable denominator of patients treated for three or more years, which is the exposure window in which every case occurred. Statements of the form "the PML risk with efalizumab was one in N" therefore do not derive from the evidence base that caused the withdrawal. The authors were explicit that a treatment duration which does not place patients at risk has not been defined. The decision was made on four fatal cases with a plausible and later demonstrated mechanism, not on a rate.',
        evidenceSource: 'Kothary N et al. J Am Acad Dermatol 2011;65:546-551',
        doi: '10.1016/j.jaad.2010.05.033',
        inferredClaim: 'That a per-patient PML incidence rate for efalizumab is known',
        auditFlag: 'caution',
      },
      {
        id: 'efa-a6',
        category: 'failed',
        title: 'Withdrawal came from Europe first',
        laymanSummary:
          'The European Medicines Agency recommended suspension in February 2009. The United States withdrawal followed in the same year.',
        technicalDetails:
          'The European Medicines Agency\'s Committee for Medicinal Products for Human Use recommended suspension of the Raptiva marketing authorisation on 19 February 2009, concluding that the benefits no longer outweighed the risks given the reports of PML. Genentech announced a phased voluntary withdrawal from the United States market, completed in 2009. The sequence matters for reading the record: the European suspension is a formal regulatory act with a published assessment, while the United States exit was a sponsor decision, so the two jurisdictions leave different kinds of document behind for the same event.',
        evidenceSource:
          'European Medicines Agency, Raptiva (efalizumab): withdrawn medicine, marketing authorisation withdrawn 2009; Kothary N et al. J Am Acad Dermatol 2011;65:546-551',
        auditFlag: 'verified',
      },
      {
        id: 'efa-a7',
        category: 'measured',
        title: 'Rebound psoriasis on withdrawal was a documented problem of stopping it',
        laymanSummary:
          'Stopping the drug abruptly could make psoriasis flare worse than before, which complicated moving thousands of patients off it at once.',
        technicalDetails:
          'The pivotal trial measured what happens on discontinuation: among subjects who achieved PASI-75 at week 12 and were then switched to placebo, response was maintained in 20 per cent against 77 per cent of those who continued, and after treatment stopped at week 24 only about 30 per cent maintained even PASI-50 over 12 weeks of follow-up. Rebound and severe flares including erythrodermic and pustular presentations were recognised on discontinuation. The 2009 withdrawal therefore required a supervised transition rather than a stop order, which is a class of harm that a withdrawal itself creates and that a withdrawal notice does not usually count.',
        evidenceSource: 'Lebwohl M et al. N Engl J Med 2003;349:2004-2013',
        doi: '10.1056/NEJMoa030002',
        measuredMetric:
          'Maintenance of PASI-75 on continued treatment versus switch to placebo, and PASI-50 maintenance after discontinuation',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A weekly injection under the skin',
        laymanDesc: 'Given once a week as a subcutaneous injection, often self-administered.',
        molecularDetail:
          'Subcutaneous efalizumab, a conditioning dose followed by weekly maintenance dosing at 1 mg/kg. Clearance is target-mediated and saturable, so steady-state exposure rises disproportionately once CD11a is fully occupied.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Binds CD11a on circulating T cells',
        laymanDesc:
          'In the bloodstream it coats a specific protein on the surface of T cells and pulls some of it off the surface entirely.',
        molecularDetail:
          'Binds the alpha-L subunit of LFA-1 on circulating lymphocytes, producing both steric blockade and downmodulation of surface CD11a, which is why lymphocyte counts rise and functional recovery lags the drug\'s clearance.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'T cells lose their grip on the vessel wall',
        laymanDesc:
          'Without that protein working, T cells cannot hold on to the inside of blood vessels long enough to squeeze through into tissue.',
        molecularDetail:
          'LFA-1 can no longer engage ICAM-1 on activated endothelium, so firm adhesion and transendothelial migration fail. The same blockade impairs the LFA-1/ICAM-1 immunological synapse required for T-cell activation by antigen-presenting cells.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'Fewer T cells reach the plaque — and fewer reach the brain',
        laymanDesc:
          'Far fewer T cells enter the skin, so the psoriasis inflammatory loop breaks. The same block applies to the T cells that keep a dormant brain virus in check.',
        molecularDetail:
          'Reduced T-cell trafficking into dermis and epidermis interrupts the IL-23/Th17 keratinocyte loop. The same reduction in transendothelial migration applies at the blood-brain barrier, permitting reactivation of JC polyomavirus in oligodendrocytes.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Plaques clear in a quarter of patients; four developed fatal PML',
        laymanDesc:
          'About a quarter of patients had a major improvement in their skin. Four patients developed a fatal brain infection after three or more years of treatment.',
        molecularDetail:
          'Measured: PASI-75 in 22 to 28 per cent at 12 weeks against 5 per cent on placebo. Measured: four confirmed PML cases in psoriasis patients in the FDA adverse event database, all fatal, all after three or more years of treatment.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Phase 3 placebo-controlled trial of efalizumab in plaque psoriasis (Lebwohl et al.)',
        phase: 'Phase 3',
        sampleSize: 597,
        primaryEndpoint:
          'Improvement of 75 per cent or more in the Psoriasis Area and Severity Index at week 12',
        endpointMet: true,
        statisticalPValue:
          'PASI-75 in 22 per cent at 1 mg/kg/week and 28 per cent at 2 mg/kg/week against 5 per cent on placebo, P < 0.001 for both',
        unreportedAdverseSignals:
          'The trial ran 12 weeks with 24 weeks of treatment in extension. Every PML case reported after approval occurred at three years or more of continuous exposure, a duration the registration programme could not have observed.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'FDA Adverse Event Reporting System review of PML with psoriasis biologics',
        phase: 'Post-marketing pharmacovigilance case series',
        sampleSize: 12,
        primaryEndpoint:
          'Confirmed PML cases by biologic agent approved for psoriasis, from approval to 30 January 2009',
        endpointMet: true,
        statisticalPValue:
          'Efalizumab 4 cases, all in psoriasis, all fatal, all at three or more years of treatment; adalimumab 1, etanercept 3, infliximab 4, none in psoriasis and all confounded or unconfirmed',
        unreportedAdverseSignals:
          'Spontaneous reporting has no denominator and is subject to underreporting, so a per-patient incidence rate was never established.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'PASI-75 at week 12 in 22 per cent (1 mg/kg) and 28 per cent (2 mg/kg) against 5 per cent on placebo, P < 0.001, in 597 patients',
        'Response maintained through week 24 in 77 per cent of continuing responders against 20 per cent switched to placebo',
        'Four confirmed PML cases in efalizumab-treated psoriasis patients, all fatal, all at three or more years of exposure',
        'T-cell transendothelial migration recovered in step with returning LFA-1 surface expression after plasma exchange in a treated patient',
      ],
      unsupportedInferences: [
        'That a per-patient PML incidence rate is known — the analysis has a numerator of four and no denominator of long-duration exposures',
        'That a safe treatment duration exists below three years; the authors state explicitly that none has been defined',
        'That the PML cases reported with anti-TNF agents in the same review are comparable — those occurred in other conditions with confounding immunosuppression',
      ],
      whatFailedInitially: [
        'Marketing authorisation suspended in the European Union in February 2009 and voluntarily withdrawn in the United States the same year',
        'The registration programme observed 12 to 24 weeks; the harm appeared at three years and later',
        'Discontinuation itself carried rebound and severe flare risk, so the withdrawal required managed transition rather than a stop order',
      ],
      realWorldOutcome: [
        'Ustekinumab was approved for plaque psoriasis in 2009, and the IL-17 and IL-23 antagonists followed, all with far higher PASI-75 rates',
        'Natalizumab, blocking the same functional step through a different integrin, returned under a monitoring programme; efalizumab did not',
        'The efalizumab and natalizumab cases together established anti-integrin PML as a class question rather than a single-drug accident',
      ],
    },
    deliverySystem: {
      type: 'Subcutaneous injection, once weekly',
      description:
        'Weekly subcutaneous humanised IgG1 antibody with a conditioning first dose. Target-mediated clearance means exposure rises non-linearly once CD11a occupancy saturates, and surface CD11a downmodulation means immune function recovers more slowly than drug concentrations fall.',
      safetyProfile:
        'Withdrawn worldwide in 2009. The decisive harm was progressive multifocal leukoencephalopathy: four confirmed cases in psoriasis patients in the FDA adverse event database, all fatal, all after three or more years of continuous treatment. Other recognised effects were first-dose flu-like reactions, thrombocytopenia, haemolytic anaemia, immune-mediated arthritis, and rebound or severe flare of psoriasis on discontinuation, including erythrodermic and pustular presentations.',
    },
    commonQuestions: [
      {
        q: 'Why did natalizumab come back and efalizumab did not?',
        a: 'Because the benefit side of the arithmetic was different, not the risk side. Natalizumab cut the annualised relapse rate by 68 per cent in relapsing multiple sclerosis, a disease that accumulates irreversible disability and had limited alternatives in 2006. Efalizumab produced PASI-75 in a quarter of psoriasis patients, and by 2009 ustekinumab was arriving and the TNF inhibitors were established, with substantially better response rates. A monitoring programme lets you keep a drug whose benefit justifies the residual risk. It cannot manufacture benefit that is not there.',
        auditNote:
          'The mechanisms are close relatives: both block a leukocyte integrin subunit required for transendothelial migration.',
      },
      {
        q: 'Was the PML risk knowable before approval?',
        a: 'The mechanism was predictable in outline — blocking lymphocyte entry into tissue includes the central nervous system — but the registration trials ran 12 to 24 weeks and every reported case occurred at three years or more. No trial of that length can observe a harm with that latency. What the case series later established is that the mechanism is real and measurable: in one patient, T-cell migration across an endothelial monolayer recovered in step with LFA-1 returning to the cell surface after plasma exchange.',
      },
      {
        q: 'How many people actually got PML from it?',
        a: 'Four confirmed cases in psoriasis patients were identified in the FDA adverse event database through January 2009, and all four died. That is a count of reports, not a rate. Spontaneous reporting systems under-capture events and there is no reliable count of how many patients had taken the drug for three or more years, so the risk per treated patient is not a figure this page can give.',
      },
      {
        q: 'Why is there no price on this page?',
        a: 'Because the product has had no market anywhere since 2009 and no current list price exists to cite.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Lebwohl M, Tyring SK, Hamilton TK, et al. A novel targeted T-cell modulator, efalizumab, for plaque psoriasis. N Engl J Med 2003;349:2004-2013',
        identifier: '10.1056/NEJMoa030002',
        kind: 'doi',
      },
      {
        label:
          'Kothary N, Diak IL, Brinker A, Bezabeh S, Avigan M, Dal Pan G. Progressive multifocal leukoencephalopathy associated with efalizumab use in psoriasis patients. J Am Acad Dermatol 2011;65:546-551',
        identifier: '10.1016/j.jaad.2010.05.033',
        kind: 'doi',
      },
      {
        label:
          'Schwab N, Ulzheimer JC, Fox RJ, et al. Fatal PML associated with efalizumab therapy: insights into integrin alphaLbeta2 in JC virus control. Neurology 2012;78:458-467',
        identifier: '10.1212/WNL.0b013e3182478d4b',
        kind: 'doi',
      },
      {
        label:
          'Polman CH et al. A randomized, placebo-controlled trial of natalizumab for relapsing multiple sclerosis. N Engl J Med 2006;354:899-910 — the comparator case for anti-integrin PML',
        identifier: '10.1056/NEJMoa044397',
        kind: 'doi',
      },
      {
        label:
          'European Medicines Agency — Raptiva (efalizumab), withdrawn medicine, marketing authorisation withdrawn 2009',
        identifier: 'https://www.ema.europa.eu/en/medicines/human/EPAR/raptiva',
        kind: 'regulatory',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 17. Natalizumab — withdrawn for PML, returned under a monitoring programme
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'natalizumab',
    name: 'Natalizumab',
    tradeName: 'Tysabri',
    sponsor: 'Biogen and Elan Pharmaceuticals (BLA 125104); biosimilar Tyruko, Sandoz (BLA 761322)',
    targetGene: 'ITGA4',
    targetProtein:
      'Integrin alpha-4 subunit, the alpha chain of very late antigen 4 (alpha4beta1) and of alpha4beta7',
    modality: 'Monoclonal Antibody (mAb)',
    approvalStatus: 'FDA Approved',
    approvalYear: 2004,
    indication:
      'Relapsing forms of multiple sclerosis, and moderate to severe Crohn\'s disease with evidence of inflammation in patients who have failed conventional therapy and TNF inhibitors. Voluntarily suspended in February 2005 after three cases of progressive multifocal leukoencephalopathy and returned in June 2006 under a mandatory monitoring programme.',
    patientFriendlyIndication:
      'A monthly infusion for relapsing multiple sclerosis, given under a mandatory monitoring programme',
    anatomicalSite:
      'Blood-brain barrier endothelium and gut vascular endothelium; the toxicity site is oligodendrocytes in central nervous system white matter',
    conditionContext: {
      conditionExplainer:
        'In relapsing multiple sclerosis, lymphocytes cross the blood-brain barrier and attack myelin, producing relapses and, over years, permanent disability. Natalizumab blocks the adhesion step those lymphocytes need to get across.',
      whyItMatters:
        'This is the reference case for managing a rare fatal harm rather than abandoning the drug. The risk was not eliminated. It was stratified into groups that differ by more than a hundredfold, so that a patient and a clinician can see which group they are in before the first infusion.',
      whoTakesThis:
        'Patients with relapsing multiple sclerosis, generally those with inadequate response to or intolerance of other disease-modifying therapies, enrolled in the mandatory monitoring programme. Anti-JC virus antibody status is checked before and during treatment.',
      clinicalGoals:
        'Reduce the annualised relapse rate and delay sustained accumulation of disability on the Expanded Disability Status Scale, while keeping the patient out of the highest PML risk stratum.',
    },
    oneSentenceVerdict:
      'An anti-alpha-4-integrin antibody that cut the relapse rate by 68 per cent at one year and sustained disability progression by 42 per cent over two years, withdrawn in 2005 after three PML cases and returned in 2006 under monitoring that now stratifies PML risk from under 0.09 cases per 1000 patients in the seronegative to 11.1 per 1000 in patients who are seropositive, previously immunosuppressed, and 25 to 48 months into treatment.',
    laymanHowItWorks:
      'Immune cells cannot enter tissue from the bloodstream unless they first grip the vessel wall using a surface protein. Natalizumab is an antibody that covers one part of that protein, so the cells cannot grip and cannot cross into the brain. That stops them attacking myelin. It also stops the immune cells that keep a common dormant virus, JC virus, suppressed in the brain, and in a small fraction of people that virus reactivates and destroys white matter.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 93,
    substitutes: {
      summary:
        'The high-efficacy disease-modifying therapies that followed — the anti-CD20 antibodies and the S1P modulators — reach comparable relapse reduction without blocking lymphocyte entry to the central nervous system, which is why they do not carry natalizumab\'s PML profile.',
      conventionalRx: [
        {
          name: 'Ocrelizumab',
          class: 'Anti-CD20 monoclonal antibody',
          howItCompares:
            'Depletes B cells rather than blocking trafficking, so immune surveillance of the central nervous system by T cells is preserved. High-efficacy in relapsing MS with a far lower PML signal.',
          typicalCost: '',
          prosAndCons:
            'Pros: six-monthly infusion, effective in primary progressive MS too. Cons: infusion reactions, hypogammaglobulinaemia over time, infection risk.',
        },
        {
          name: 'Fingolimod',
          class: 'Sphingosine-1-phosphate receptor modulator',
          howItCompares:
            'Traps lymphocytes in lymph nodes rather than blocking their adhesion at the vessel wall. Oral, and does not require anti-JCV serology, though PML has been reported rarely.',
          typicalCost: '',
          prosAndCons:
            'Pros: oral daily dosing. Cons: first-dose bradycardia, macular oedema, lymphopenia.',
        },
        {
          name: 'Natalizumab-sztn (Tyruko)',
          class: 'Anti-alpha-4-integrin biosimilar',
          howItCompares:
            'The same molecule from a second manufacturer, approved on biosimilarity rather than on a repeat efficacy programme. It carries the identical PML risk and the identical monitoring requirement.',
          typicalCost: '',
          prosAndCons:
            'Pros: a second supply source for the same benefit. Cons: identical PML risk profile and the same programme obligations.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'antibody_structure',
      chemicalFormula: 'Humanised IgG4 kappa monoclonal antibody',
      molecularWeight: 'Approximately 149 kDa',
      targetReceptorAffinity:
        'Binds the alpha-4 subunit shared by two integrin heterodimers: alpha4beta1 (very late antigen 4), which binds VCAM-1 on inflamed brain endothelium, and alpha4beta7, which binds MAdCAM-1 on gut endothelium. One antibody therefore blocks lymphocyte entry into two different tissues, which is why the same molecule treats both multiple sclerosis and Crohn\'s disease. Efalizumab blocked the same functional step through a different integrin, CD11a.',
      structureSource: {
        label:
          'Polman CH et al. A randomized, placebo-controlled trial of natalizumab for relapsing multiple sclerosis. N Engl J Med 2006;354:899-910 — target and class description',
        identifier: '10.1056/NEJMoa044397',
        kind: 'doi',
      },
      laboratoryWorkflow: [
        {
          id: 'nat-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity, IgG4 half-antibody content and glycan profile',
          description:
            'Confirm the humanised IgG4 kappa sequence by peptide mapping and intact mass. IgG4 antibodies undergo Fab-arm exchange and form half-antibodies, so half-molecule content and hinge integrity are release-critical in a way they are not for an IgG1.',
          reagentsAndBuffer:
            'Trypsin and Lys-C digests with LC-MS/MS peptide mapping, non-reduced capillary electrophoresis SDS for half-antibody, size-exclusion chromatography with multi-angle light scattering, released N-glycan HILIC-fluorescence',
        },
        {
          id: 'nat-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Alpha-4 binding affinity and dual-heterodimer selectivity',
          description:
            'Surface plasmon resonance against recombinant alpha4beta1 and alpha4beta7, confirming comparable binding to both, and a counter-screen against alphaLbeta2 and alpha4-free beta1 to establish that the epitope is on the alpha-4 chain.',
          dependsOnStepId: 'nat-w1',
          reagentsAndBuffer:
            'Recombinant human alpha4beta1 and alpha4beta7 ectodomains, CM5 sensor chip, HBS-P buffer with manganese to stabilise the active integrin conformation, isotype control IgG4',
        },
        {
          id: 'nat-w3',
          stepNumber: 3,
          phase: 'Cellular_Delivery',
          name: 'VCAM-1 adhesion and blood-brain barrier migration model',
          description:
            'Primary human brain microvascular endothelial monolayers on permeable supports, cytokine-activated to express VCAM-1, with primary human lymphocytes under physiological shear. Measure firm adhesion and transmigration with and without antibody. This preparation reproduces both the therapeutic effect and the surveillance failure in the same dish.',
          reagentsAndBuffer:
            'Human brain microvascular endothelial cells, transwell inserts or parallel-plate flow chamber, TNF-alpha and interferon-gamma activation, peripheral blood mononuclear cells, CCL19 or CXCL12 chemotactic gradient',
        },
        {
          id: 'nat-w4',
          stepNumber: 4,
          phase: 'Assay_Quantification',
          name: 'Alpha-4 receptor saturation on circulating lymphocytes',
          description:
            'Flow cytometry to measure alpha-4 integrin saturation and surface downmodulation on CD3-positive and CD19-positive cells, alongside trough drug concentration. Saturation is the pharmacodynamic endpoint that governs both efficacy and the loss of central nervous system immune surveillance, and it is the measurement behind extended-interval dosing.',
          dependsOnStepId: 'nat-w3',
          reagentsAndBuffer:
            'EDTA whole blood, non-competing anti-CD49d detection clone, anti-human IgG4 for bound drug, lineage markers, quantitative calibration beads, validated trough serum natalizumab immunoassay',
        },
        {
          id: 'nat-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Anti-JC virus antibody index and cerebrospinal fluid JCV DNA',
          description:
            'Two-step anti-JCV antibody ELISA reported as an index value, plus quantitative PCR for JC virus DNA in cerebrospinal fluid when magnetic resonance imaging raises suspicion. These two assays are the operational core of the monitoring programme: the serology assigns the risk stratum before treatment, the PCR confirms or excludes the diagnosis during it.',
          dependsOnStepId: 'nat-w4',
          reagentsAndBuffer:
            'Two-step anti-JCV antibody ELISA with confirmatory inhibition step and index reporting, cerebrospinal fluid, real-time quantitative PCR for the JCV large T antigen region with plasmid standard curve, contemporaneous MRI',
        },
      ],
    },
    keyAudits: [
      {
        id: 'nat-a1',
        category: 'measured',
        title: 'Relapse rate down 68 per cent at one year, disability progression down 42 per cent',
        laymanSummary:
          'In a two-year trial of 942 patients, relapses fell by about two thirds in the first year and the chance of lasting disability worsening fell from 29 per cent to 17 per cent.',
        technicalDetails:
          'AFFIRM (NCT00027300): 942 patients with relapsing multiple sclerosis randomised 2:1 to natalizumab 300 mg or placebo by intravenous infusion every four weeks for more than two years. Natalizumab reduced the rate of clinical relapse at one year by 68 per cent (P < 0.001) and reduced the risk of sustained disability progression over two years by 42 per cent (hazard ratio 0.58, 95% CI 0.43 to 0.77, P < 0.001); cumulative probability of progression was 17 per cent against 29 per cent. New or enlarging T2 hyperintense lesions fell by 83 per cent over two years — mean 1.9 lesions against 11.0 (P < 0.001) — and gadolinium-enhancing lesions by 92 per cent at both one and two years (P < 0.001).',
        evidenceSource: 'Polman CH et al., AFFIRM Investigators. N Engl J Med 2006;354:899-910',
        doi: '10.1056/NEJMoa044397',
        measuredMetric:
          'Annualised relapse rate at one year and sustained disability progression at two years, natalizumab versus placebo',
        auditFlag: 'verified',
      },
      {
        id: 'nat-a2',
        category: 'failed',
        title: 'Three PML cases, one of them in Crohn\'s disease, and the drug came off the market',
        laymanSummary:
          'Within months of approval, three patients on natalizumab developed a rare fatal brain infection. Two had multiple sclerosis; one had Crohn\'s disease. The drug was suspended.',
        technicalDetails:
          'Three cases of progressive multifocal leukoencephalopathy were reported in early 2005 and published together in the New England Journal of Medicine: two in patients receiving natalizumab with interferon beta-1a in the multiple sclerosis programme, and one in a patient treated for Crohn\'s disease. Natalizumab was voluntarily suspended from marketing and from all clinical trials in February 2005, four months after its accelerated approval in November 2004. The third case, in Crohn\'s disease, is the one that established this as a property of the drug rather than of combination therapy with interferon.',
        evidenceSource:
          'Kleinschmidt-DeMasters BK, Tyler KL. N Engl J Med 2005;353:369-374; Langer-Gould A et al. N Engl J Med 2005;353:375-381; Van Assche G et al. N Engl J Med 2005;353:362-368',
        doi: '10.1056/NEJMoa051586',
        auditFlag: 'verified',
      },
      {
        id: 'nat-a3',
        category: 'conclusion_shift',
        title: 'It returned in 2006 — the risk unchanged, the information about it transformed',
        laymanSummary:
          'The drug came back sixteen months later under a programme that requires prescribers, pharmacies and patients to register and be monitored. The infection risk did not go away.',
        technicalDetails:
          'Natalizumab returned to the United States market in June 2006 under a restricted distribution and monitoring programme, now operated as a risk evaluation and mitigation strategy, requiring enrolment of prescribers, infusion centres and patients, with mandatory reporting and periodic reassessment. Nothing about the molecule changed. What changed was that the drug could only be given inside a system that counts the exposures, checks for the risk factors, and images the brain when symptoms appear. This is the clearest example in this file of a withdrawal reversed by building an information system around a drug rather than by re-analysing its data — which is the opposite of what happened with tegaserod.',
        evidenceSource:
          'Drugs@FDA BLA 125104 (TYSABRI, Biogen); Bloomgren G et al. N Engl J Med 2012;366:1870-1880',
        doi: '10.1056/NEJMoa1107829',
        auditFlag: 'verified',
      },
      {
        id: 'nat-a4',
        category: 'measured',
        title: '2.1 PML cases per 1000 overall — and a 120-fold spread once stratified',
        laymanSummary:
          'By 2012 there were 212 confirmed cases among 99,571 patients treated. But the risk is not one number: it ranges from under 0.09 per 1000 to 11.1 per 1000 depending on three things known before treatment.',
        technicalDetails:
          'As of 29 February 2012 there were 212 confirmed PML cases among 99,571 natalizumab-treated patients, 2.1 per 1000. Stratifying by three factors — anti-JC virus antibody status, prior immunosuppressant use, and treatment duration of 1 to 24 versus 25 to 48 months — separates that average into groups that differ by more than a hundredfold. Anti-JCV antibody negative patients had an estimated incidence of 0.09 cases or fewer per 1000 (95% CI 0 to 0.48). Patients who were antibody positive, had prior immunosuppressant exposure, and had received 25 to 48 months of treatment had an estimated 11.1 cases per 1000 (95% CI 8.3 to 14.5). All 54 PML patients for whom a pre-diagnosis sample existed were anti-JCV antibody positive, without exception.',
        evidenceSource: 'Bloomgren G et al. N Engl J Med 2012;366:1870-1880',
        doi: '10.1056/NEJMoa1107829',
        measuredMetric:
          'PML incidence per 1000 natalizumab-treated patients, stratified by anti-JCV serostatus, prior immunosuppressant use and treatment duration',
        auditFlag: 'verified',
      },
      {
        id: 'nat-a5',
        category: 'inferred',
        title: 'Seronegative does not mean immune, and the confidence interval says so',
        laymanSummary:
          'A negative antibody test puts a patient in the lowest risk group, but the interval around that estimate does not reach zero, and antibody status can change.',
        technicalDetails:
          'The seronegative estimate is 0.09 cases or fewer per 1000 with a 95% confidence interval of 0 to 0.48. The upper bound is not zero, the test has a false-negative rate, and seroconversion occurs during treatment at a measurable annual rate, which is why the programme repeats the serology rather than testing once. A negative result is a statement about the current stratum, not a permanent exemption. Reading "anti-JCV negative" as "cannot develop PML" is the single most consequential inference error available on this drug, and the stratified table exists precisely to prevent one number from standing in for a distribution.',
        evidenceSource: 'Bloomgren G et al. N Engl J Med 2012;366:1870-1880',
        doi: '10.1056/NEJMoa1107829',
        inferredClaim:
          'That an anti-JC virus antibody negative result confers immunity to natalizumab-associated PML',
        auditFlag: 'caution',
      },
      {
        id: 'nat-a6',
        category: 'measured',
        title: 'The combination trial was the one that produced two of the three first cases',
        laymanSummary:
          'The second pivotal trial added natalizumab to an existing interferon treatment. Two of the first three brain infections came out of that trial.',
        technicalDetails:
          'SENTINEL (NCT00030966) randomised 1,171 patients who had relapsed despite interferon beta-1a to continue interferon with added natalizumab 300 mg (589 patients) or placebo (582) every four weeks for up to 116 weeks. Combination therapy reduced the relative risk of sustained disability progression by 24 per cent (hazard ratio 0.76, 95% CI 0.61 to 0.96, P = 0.02), with cumulative progression at two years of 23 per cent against 29 per cent, and lowered the annualised relapse rate from 0.75 to 0.34 (P < 0.001) with 0.9 against 5.4 new or enlarging T2 lesions (P < 0.001). Two cases of progressive multifocal leukoencephalopathy, one fatal, were diagnosed in natalizumab-treated patients in this trial. That initially suggested the harm might belong to the combination rather than to natalizumab itself; the Crohn\'s disease case, in a patient not receiving interferon, removed that explanation. Natalizumab is not used in combination with other disease-modifying therapies today, and the reason is this trial.',
        evidenceSource:
          'Rudick RA et al., SENTINEL Investigators. N Engl J Med 2006;354:911-923; Kleinschmidt-DeMasters BK, Tyler KL. N Engl J Med 2005;353:369-374',
        doi: '10.1056/NEJMoa044396',
        measuredMetric:
          'Relapse rate and disability progression with natalizumab added to interferon beta-1a versus interferon alone',
        auditFlag: 'verified',
      },
      {
        id: 'nat-a7',
        category: 'conclusion_shift',
        title: 'A biosimilar was approved in 2023 for a drug that was withdrawn in 2005',
        laymanSummary:
          'A second manufacturer\'s version of natalizumab was approved in 2023, on the basis that it is the same molecule rather than by repeating the trials.',
        technicalDetails:
          'Natalizumab-sztn (Tyruko, BLA 761322, Sandoz) is listed in Drugs@FDA with prescription marketing status. A biosimilar approval is a statement that the molecule and its clinical behaviour are established well enough that similarity can substitute for a repeat efficacy programme. That a drug suspended for a fatal infection eighteen years earlier reached that point is a measure of how completely the monitoring programme converted an unmanageable risk into a quantified one. The biosimilar carries the identical PML risk and the identical programme obligations.',
        evidenceSource:
          'Drugs@FDA BLA 761322 (TYRUKO, natalizumab-sztn, Sandoz Inc) — Prescription',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'An intravenous infusion every four weeks',
        laymanDesc:
          'Given as a drip in a registered infusion centre, once a month, with the patient enrolled in a monitoring programme.',
        molecularDetail:
          'Natalizumab 300 mg by intravenous infusion every four weeks. Extended-interval dosing at six weeks is used in some settings on the basis of receptor saturation data. Administration is restricted to certified infusion centres.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Binds alpha-4 integrin on circulating lymphocytes',
        laymanDesc:
          'It coats a docking protein on the surface of circulating immune cells, and pulls some of it off the surface.',
        molecularDetail:
          'Binds the alpha-4 subunit of alpha4beta1 and alpha4beta7 on lymphocytes and monocytes, producing near-complete receptor saturation at trough with partial surface downmodulation.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'Lymphocytes can no longer cross the blood-brain barrier',
        laymanDesc:
          'Those cells can no longer stick to inflamed brain blood vessels, so they stop entering the brain.',
        molecularDetail:
          'Blocked alpha4beta1 cannot engage VCAM-1 on cytokine-activated brain endothelium, so firm adhesion under shear and subsequent diapedesis fail. The same blockade at alpha4beta7 and MAdCAM-1 reduces lymphocyte entry to gut mucosa.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'Demyelination stops — and so does viral surveillance',
        laymanDesc:
          'The immune attack on myelin stops, so relapses and new lesions fall sharply. The same block removes the immune patrol that keeps a dormant virus suppressed in brain tissue.',
        molecularDetail:
          'Reduced central nervous system lymphocyte trafficking cuts new inflammatory demyelinating lesions by 83 to 92 per cent on MRI. It also removes CD4 and CD8 surveillance of JC polyomavirus, permitting reactivation and lytic infection of oligodendrocytes in susceptible patients.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Two thirds fewer relapses; PML in 2.1 per 1000, stratified more than a hundredfold',
        laymanDesc:
          'Relapses fall by about two thirds and disability progression by 42 per cent. Two patients per thousand develop PML, but who those two are is largely predictable in advance.',
        molecularDetail:
          'Measured: 68 per cent relapse rate reduction at one year, 42 per cent reduction in sustained disability progression (HR 0.58, 95% CI 0.43 to 0.77). Measured: 212 PML cases in 99,571 patients (2.1 per 1000), ranging from under 0.09 per 1000 seronegative to 11.1 per 1000 in the highest stratum.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'NCT00027300',
        phase: 'Phase 3 (AFFIRM)',
        sampleSize: 942,
        primaryEndpoint:
          'Rate of clinical relapse at one year and rate of sustained disability progression on the Expanded Disability Status Scale at two years',
        endpointMet: true,
        statisticalPValue:
          'Relapse rate reduced 68 per cent at one year, P < 0.001; sustained disability progression hazard ratio 0.58 (95% CI 0.43 to 0.77), P < 0.001',
        unreportedAdverseSignals:
          'Hypersensitivity reactions occurred in 4 per cent and serious hypersensitivity in 1 per cent. The trial was not long enough or large enough to observe PML, which emerged from post-marketing exposure.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'NCT00030966',
        phase: 'Phase 3',
        sampleSize: 1171,
        primaryEndpoint:
          'Rate of clinical relapse at one year and cumulative probability of 12-week sustained disability progression at two years, added to interferon beta-1a',
        endpointMet: true,
        statisticalPValue:
          'Sustained disability progression hazard ratio 0.76 (95% CI 0.61 to 0.96), P = 0.02; annualised relapse rate 0.34 versus 0.75, P < 0.001; new or enlarging T2 lesions 0.9 versus 5.4, P < 0.001',
        unreportedAdverseSignals:
          'Two cases of progressive multifocal leukoencephalopathy, one fatal, were diagnosed in natalizumab-treated patients in this trial. Combination with other disease-modifying therapy is no longer used.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Pooled post-marketing and registry PML risk stratification (Bloomgren et al.)',
        phase: 'Post-marketing epidemiology across clinical studies, spontaneous reports and a Swedish registry',
        sampleSize: 99571,
        primaryEndpoint:
          'PML incidence per 1000 treated patients by anti-JCV serostatus, prior immunosuppressant use and treatment duration',
        endpointMet: true,
        statisticalPValue:
          '212 cases in 99,571 patients (2.1 per 1000); seronegative 0.09 or fewer per 1000 (95% CI 0 to 0.48); highest stratum 11.1 per 1000 (95% CI 8.3 to 14.5)',
        unreportedAdverseSignals:
          'Post-marketing case ascertainment depends on reporting, and the seronegative interval does not exclude zero. Seroconversion during treatment means a stratum assignment is provisional.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Relapse rate at one year reduced 68 per cent (P < 0.001) in 942 patients',
        'Sustained disability progression over two years reduced 42 per cent, hazard ratio 0.58 (95% CI 0.43 to 0.77); cumulative progression 17 per cent versus 29 per cent',
        'New or enlarging T2 lesions 1.9 versus 11.0 over two years (83 per cent reduction); gadolinium-enhancing lesions 92 per cent fewer',
        '212 confirmed PML cases in 99,571 treated patients as of 29 February 2012 (2.1 per 1000)',
        'All 54 PML patients with a pre-diagnosis sample were anti-JC virus antibody positive',
      ],
      unsupportedInferences: [
        'That anti-JCV antibody negative status confers immunity — the estimate is 0.09 or fewer per 1000 with an interval to 0.48, and seroconversion occurs during treatment',
        'That the 2.1 per 1000 average describes any individual patient; the stratified estimates differ by more than a hundredfold',
        'That the 2005 cases reflected combination with interferon — the Crohn\'s disease case, on natalizumab alone, removed that explanation',
      ],
      whatFailedInitially: [
        'Accelerated approval November 2004, voluntary suspension February 2005 after three PML cases, four months on the market',
        'Two of the three index cases came from the combination trial, which is why combination with other disease-modifying therapy is no longer used',
      ],
      realWorldOutcome: [
        'Returned June 2006 under a mandatory prescriber, centre and patient monitoring programme, now a risk evaluation and mitigation strategy',
        'Anti-JCV antibody serology and index reporting turned a single average risk into a stratified one that can be discussed before the first infusion',
        'A biosimilar, natalizumab-sztn, was approved in 2023 and carries the identical risk and the identical programme obligations',
      ],
    },
    deliverySystem: {
      type: 'Intravenous infusion, 300 mg every four weeks, in a certified centre',
      description:
        'One-hour intravenous infusion every four weeks with post-infusion observation, given only through registered infusion centres under the monitoring programme. Extended-interval dosing at approximately six weeks is used in some settings, based on receptor saturation and PML risk considerations.',
      safetyProfile:
        'Progressive multifocal leukoencephalopathy is the defining risk: 212 confirmed cases in 99,571 patients as of February 2012, stratified from 0.09 or fewer per 1000 in anti-JCV antibody negative patients to 11.1 per 1000 in patients who are seropositive, previously immunosuppressed and 25 to 48 months into treatment. Anti-JCV antibody status is checked before and during treatment and MRI is used for surveillance. Other effects include infusion hypersensitivity reactions in about 4 per cent with serious reactions in about 1 per cent, anti-natalizumab antibodies causing loss of efficacy, hepatotoxicity, herpes infections, and immune reconstitution inflammatory syndrome after the drug is removed by plasma exchange.',
    },
    commonQuestions: [
      {
        q: 'Was the risk actually reduced when it came back in 2006?',
        a: 'No. The risk per exposed patient was not changed by the monitoring programme — the molecule and its mechanism are identical. What changed is that exposures are counted, risk factors are measured before treatment starts, and imaging is done when symptoms appear. The 2012 stratification is the payoff: the same drug carries an estimated risk below 0.09 per 1000 in one group and 11.1 per 1000 in another, and both patients can know which group they are in. Managing a risk and reducing it are different things, and only the first one happened here.',
        auditNote:
          'All 54 PML patients with a pre-diagnosis blood sample were anti-JCV antibody positive, which is what makes the serology usable as a stratifier.',
      },
      {
        q: 'What is JC virus and why does blocking a brain-entry protein matter?',
        a: 'JC polyomavirus is a common virus most adults have been exposed to and carry harmlessly, held in check by circulating T cells that patrol tissue. Natalizumab stops lymphocytes crossing the blood-brain barrier, which is exactly the therapeutic effect in multiple sclerosis. The same block removes the surveillance that keeps JC virus suppressed in the central nervous system, so in a susceptible patient it reactivates and lyses oligodendrocytes, destroying white matter. The benefit and the harm are the same event in the same place.',
      },
      {
        q: 'Why did efalizumab, which works the same way, never come back?',
        a: 'Because the benefit differed, not the risk. Natalizumab reduces relapses by 68 per cent and disability progression by 42 per cent in a disease that accumulates permanent damage. Efalizumab produced a 75 per cent skin improvement in about a quarter of psoriasis patients, in a period when better psoriasis biologics were arriving. A monitoring programme is worth building when the benefit justifies accepting a residual fatal risk. It cannot make a modest benefit large enough.',
      },
      {
        q: 'Why is there no price on this page?',
        a: 'Because this file states published figures with their sources and does not carry a pricing block. Natalizumab is currently marketed, and its price varies by country, payer and infusion setting in ways a single number would misrepresent.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Polman CH, O\'Connor PW, Havrdova E, et al. A randomized, placebo-controlled trial of natalizumab for relapsing multiple sclerosis. N Engl J Med 2006;354:899-910',
        identifier: '10.1056/NEJMoa044397',
        kind: 'doi',
      },
      {
        label:
          'Rudick RA, Stuart WH, Calabresi PA, et al. Natalizumab plus interferon beta-1a for relapsing multiple sclerosis. N Engl J Med 2006;354:911-923',
        identifier: '10.1056/NEJMoa044396',
        kind: 'doi',
      },
      {
        label:
          'Kleinschmidt-DeMasters BK, Tyler KL. Progressive multifocal leukoencephalopathy complicating treatment with natalizumab and interferon beta-1a for multiple sclerosis. N Engl J Med 2005;353:369-374',
        identifier: '10.1056/NEJMoa051782',
        kind: 'doi',
      },
      {
        label:
          'Langer-Gould A, Atlas SW, Green AJ, Bollen AW, Pelletier D. Progressive multifocal leukoencephalopathy in a patient treated with natalizumab. N Engl J Med 2005;353:375-381',
        identifier: '10.1056/NEJMoa051847',
        kind: 'doi',
      },
      {
        label:
          'Van Assche G, Van Ranst M, Sciot R, et al. Progressive multifocal leukoencephalopathy after natalizumab therapy for Crohn\'s disease. N Engl J Med 2005;353:362-368',
        identifier: '10.1056/NEJMoa051586',
        kind: 'doi',
      },
      {
        label:
          'Bloomgren G, Richman S, Hotermans C, et al. Risk of natalizumab-associated progressive multifocal leukoencephalopathy. N Engl J Med 2012;366:1870-1880',
        identifier: '10.1056/NEJMoa1107829',
        kind: 'doi',
      },
      {
        label: 'ClinicalTrials.gov NCT00027300 — AFFIRM',
        identifier: 'NCT00027300',
        kind: 'nct',
      },
      {
        label: 'ClinicalTrials.gov NCT00030966 — SENTINEL',
        identifier: 'NCT00030966',
        kind: 'nct',
      },
      {
        label: 'Drugs@FDA: TYSABRI (natalizumab), BLA 125104, Biogen Idec — Prescription',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=125104',
        kind: 'regulatory',
      },
      {
        label: 'Drugs@FDA: TYRUKO (natalizumab-sztn), BLA 761322, Sandoz Inc — Prescription',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=761322',
        kind: 'regulatory',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 18. Aducanumab — approved on a surrogate, discontinued in 2024
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'aducanumab-avwa',
    name: 'Aducanumab-avwa',
    tradeName: 'Aduhelm',
    sponsor: 'Biogen, with Eisai (BLA 761178)',
    targetGene: 'APP',
    targetProtein: 'Aggregated amyloid beta, principally fibrillar plaque and oligomeric species',
    modality: 'Monoclonal Antibody (mAb)',
    approvalStatus: 'Withdrawn from Market',
    approvalYear: 2021,
    indication:
      'Alzheimer\'s disease, granted accelerated approval in June 2021 on reduction of amyloid beta plaque as a surrogate endpoint. Biogen announced discontinuation of the product and of the confirmatory trial in January 2024.',
    patientFriendlyIndication:
      'A monthly infusion for early Alzheimer\'s disease, approved on a brain-scan measurement rather than on symptoms',
    anatomicalSite:
      'Cerebral cortex and leptomeningeal vasculature; amyloid plaque in brain parenchyma and vessel walls',
    conditionContext: {
      conditionExplainer:
        'Alzheimer\'s disease is accompanied by extracellular plaques of aggregated amyloid beta and intracellular tau tangles. Whether removing the plaques changes the disease is the question this drug was supposed to answer, and it is not the question its approval was based on.',
      whyItMatters:
        'This is the clearest case in the file of a surrogate endpoint standing in for a clinical one. Amyloid removal was measured, and measured well. Cognitive benefit was demonstrated in one trial and not in its identical twin, and the approval rested on the amyloid.',
      whoTakesThis:
        'Nobody. Biogen discontinued the product in 2024 and stopped the confirmatory trial. Patients were transitioned to lecanemab or donanemab, later anti-amyloid antibodies with completed phase 3 programmes.',
      clinicalGoals:
        'Slow decline on the Clinical Dementia Rating Sum of Boxes at 78 weeks, with amyloid PET reduction as the accelerated-approval surrogate.',
    },
    oneSentenceVerdict:
      'An anti-amyloid antibody approved on plaque clearance after two identically designed phase 3 trials disagreed — high-dose aducanumab slowed decline on the Clinical Dementia Rating Sum of Boxes by 22 per cent in EMERGE and by nothing at all in ENGAGE — and discontinued by its sponsor in January 2024 with the confirmatory trial unfinished.',
    laymanHowItWorks:
      'Alzheimer\'s brains accumulate clumps of a protein called amyloid beta. Aducanumab is an antibody that grips those clumps, which flags them for immune cells in the brain to engulf and clear. Brain scans show the clumps do shrink, substantially and in proportion to dose and time. Whether that slows memory loss is the part that two large trials of the same drug answered differently.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 34,
    substitutes: {
      summary:
        'Two later anti-amyloid antibodies completed their phase 3 programmes without discordant results and took the indication: lecanemab and donanemab. In a head-to-head study donanemab cleared plaque faster and more completely than aducanumab.',
      conventionalRx: [
        {
          name: 'Lecanemab',
          class: 'Anti-amyloid beta protofibril monoclonal antibody',
          howItCompares:
            'Completed a single phase 3 trial that met its primary clinical endpoint, rather than two trials that disagreed. Traditional approval followed the accelerated one.',
          typicalCost: '',
          prosAndCons:
            'Pros: consistent clinical result. Cons: amyloid-related imaging abnormalities, infusion reactions, APOE4 homozygote risk.',
        },
        {
          name: 'Donanemab',
          class: 'Anti-amyloid beta N3pG monoclonal antibody',
          howItCompares:
            'Directly compared against aducanumab in an open-label randomised study: plaque clearance at 18 months in 76.8 per cent on donanemab against 43.1 per cent on aducanumab (P < 0.001), with median time to clearance 359 against 568 days.',
          typicalCost: '',
          prosAndCons:
            'Pros: faster and deeper plaque clearance, dosing can stop once cleared. Cons: amyloid-related imaging abnormalities, including in that head-to-head study 23.9 per cent ARIA-oedema.',
        },
        {
          name: 'Donepezil',
          class: 'Acetylcholinesterase inhibitor',
          howItCompares:
            'Symptomatic rather than disease-modifying, and makes no claim on amyloid. It remains the baseline against which any anti-amyloid benefit has to be judged.',
          typicalCost: '',
          prosAndCons:
            'Pros: oral, inexpensive, decades of use. Cons: modest symptomatic effect, gastrointestinal effects, bradycardia.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'antibody_structure',
      chemicalFormula: 'Human IgG1 kappa monoclonal antibody',
      molecularWeight: 'Approximately 146 kDa',
      targetReceptorAffinity:
        'A fully human IgG1 derived from B cells of cognitively healthy elderly donors, selecting for an antibody the human immune system had already made. It binds a linear epitope in the amyloid beta N-terminus and shows strong selectivity for aggregated forms — fibrils and oligomers — over monomer, which is the property intended to concentrate its effect on plaque rather than on circulating peptide.',
      structureSource: {
        label:
          'Sevigny J et al. The antibody aducanumab reduces Abeta plaques in Alzheimer\'s disease. Nature 2016;537:50-56',
        identifier: '10.1038/nature19323',
        kind: 'doi',
      },
      laboratoryWorkflow: [
        {
          id: 'adu-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity, aggregate content and Fc glycan profile',
          description:
            'Confirm the human IgG1 kappa sequence by peptide mapping and intact mass, and quantify high molecular weight species. For an antibody whose mechanism depends on microglial Fc receptor engagement, the afucosylated glycan fraction is a functional attribute rather than a cosmetic one.',
          reagentsAndBuffer:
            'Trypsin and Lys-C digestion with LC-MS/MS peptide mapping, size-exclusion chromatography with multi-angle light scattering, released N-glycan HILIC-fluorescence with afucosylation quantitation, imaged capillary isoelectric focusing',
        },
        {
          id: 'adu-w2',
          stepNumber: 2,
          phase: 'QC',
          name: 'Conformational selectivity: aggregate over monomer',
          description:
            'Measure binding to synthetic amyloid beta monomer, oligomer and fibril preparations side by side, and confirm the selectivity ratio that defines this antibody. An assay against monomer alone would report a misleadingly weak affinity and miss the property the drug was selected for.',
          dependsOnStepId: 'adu-w1',
          reagentsAndBuffer:
            'Synthetic amyloid beta 1-42 prepared as monomer, soluble oligomer and mature fibril, surface plasmon resonance and ELISA formats, thioflavin T fluorescence to confirm aggregation state, transmission electron microscopy for fibril morphology',
        },
        {
          id: 'adu-w3',
          stepNumber: 3,
          phase: 'Cellular_Delivery',
          name: 'Microglial phagocytosis of plaque in ex vivo brain sections',
          description:
            'Apply antibody and primary microglia to unfixed cryosections of amyloid-bearing brain tissue and measure plaque clearance over time. This preparation reproduces the proposed mechanism — antibody opsonisation followed by Fc-receptor-mediated microglial phagocytosis — in the tissue where it has to occur.',
          reagentsAndBuffer:
            'Unfixed cryosections of amyloid-bearing transgenic mouse or post-mortem human cortex, primary murine or human microglia, culture medium with the test antibody and isotype control, immunohistochemistry for amyloid beta with quantitative image analysis',
        },
        {
          id: 'adu-w4',
          stepNumber: 4,
          phase: 'Assay_Quantification',
          name: 'Amyloid PET standardised uptake value ratio in centiloids',
          description:
            'Quantify cortical amyloid burden by florbetapir or florbetaben positron emission tomography, expressed on the centiloid scale, with clearance conventionally defined as below 24.1 centiloids. This is the surrogate endpoint on which the accelerated approval was granted, and it is a genuinely reliable measurement of the thing it measures.',
          dependsOnStepId: 'adu-w3',
          reagentsAndBuffer:
            'Florbetapir F 18 or florbetaben F 18 tracer, PET-CT with standardised acquisition window, composite cortical target region normalised to a reference region, centiloid conversion using the standard anchor datasets',
        },
        {
          id: 'adu-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'ARIA surveillance MRI and APOE genotyping',
          description:
            'Serial fluid-attenuated inversion recovery and gradient-echo or susceptibility-weighted MRI to detect amyloid-related imaging abnormalities of oedema and of haemosiderin deposition, with APOE genotype as the principal risk stratifier. This is the safety measurement that governs dosing for the entire anti-amyloid class.',
          dependsOnStepId: 'adu-w4',
          reagentsAndBuffer:
            'FLAIR and T2-star gradient-echo or susceptibility-weighted MRI sequences at fixed intervals, standardised ARIA-E and ARIA-H severity grading, APOE genotyping by PCR-based allelic discrimination',
        },
      ],
    },
    keyAudits: [
      {
        id: 'adu-a1',
        category: 'measured',
        title: 'Amyloid plaque fell, and the measurement is sound',
        laymanSummary:
          'Brain scans showed the drug removes amyloid plaque in a dose- and time-dependent way. That part is not in dispute.',
        technicalDetails:
          'The phase 1b PRIME study established dose- and time-dependent reduction of brain amyloid beta plaque on florbetapir PET in patients with prodromal or mild Alzheimer\'s disease, with the fully human antibody selected for selectivity toward aggregated over monomeric amyloid. In the later head-to-head TRAILBLAZER-ALZ 4 study, amyloid plaque clearance — defined as below 24.1 centiloids — was achieved by 1.6 per cent, 24.6 per cent and 43.1 per cent of aducanumab-treated participants at 6, 12 and 18 months. The surrogate endpoint behaves exactly as claimed. The question the approval turned on is what it predicts.',
        evidenceSource:
          'Sevigny J et al. Nature 2016;537:50-56; Salloway S et al. Alzheimers Dement 2025;21:e70293',
        doi: '10.1038/nature19323',
        measuredMetric:
          'Brain amyloid beta plaque burden on florbetapir PET, dose- and time-dependent reduction',
        auditFlag: 'verified',
      },
      {
        id: 'adu-a2',
        category: 'conclusion_shift',
        title: 'Two identical trials, opposite answers, and a futility stop in between',
        laymanSummary:
          'Two trials of the same drug, run at the same time to the same protocol, were stopped early for futility in March 2019. Later analysis of more data made one of them positive and left the other negative.',
        technicalDetails:
          'EMERGE (NCT02484547) and ENGAGE (NCT02477800) were two phase 3 randomised double-blind placebo-controlled parallel-group studies at 348 sites in 20 countries, enrolling patients aged 50 to 85 with mild cognitive impairment or mild Alzheimer\'s dementia and confirmed amyloid pathology, randomised 1:1:1 to low-dose aducanumab, high-dose aducanumab or placebo every four weeks. The randomised and dosed populations were 1,638 in EMERGE and 1,647 in ENGAGE. Both were terminated for futility in March 2019. On the larger dataset available afterwards, high-dose aducanumab in EMERGE showed significant treatment effects across primary and secondary endpoints, and high-dose aducanumab in ENGAGE did not. Low-dose results were consistent across both studies, non-significant, and intermediate to the EMERGE high-dose arm.',
        evidenceSource:
          'Budd Haeberlein S et al. J Prev Alzheimers Dis 2022;9:197-210; Mallinckrodt C et al. J Prev Alzheimers Dis 2023;10:171-177',
        doi: '10.14283/jpad.2022.30',
        auditFlag: 'contested',
      },
      {
        id: 'adu-a3',
        category: 'inferred',
        title: 'The reconciliation of the two trials is post hoc',
        laymanSummary:
          'The sponsor\'s explanation for why one trial worked and the other did not was worked out after the results were known, by looking for differences that could account for the gap.',
        technicalDetails:
          'The published reconciliation examined four candidate explanations — baseline characteristics, amyloid-related imaging abnormalities, non-normality of the data, and dosing exposure — and concluded that ENGAGE high-dose outcomes were affected by an imbalance in a small number of patients with extremely rapid progression and by lower exposure to the 10 mg/kg target dose, factors that were confounded with each other and concentrated among early-enrolled patients. Baseline characteristics and ARIA were excluded as contributors. Every one of these analyses is post hoc, performed on unblinded data with the discordance already known. Post-hoc reconciliation is a legitimate way to generate a hypothesis for the next trial. It is not a replacement for the trial that would test it, and that trial was never completed.',
        evidenceSource: 'Mallinckrodt C et al. J Prev Alzheimers Dis 2023;10:171-177',
        doi: '10.14283/jpad.2023.6',
        inferredClaim:
          'That the post-hoc identification of rapid progressors and under-dosing in ENGAGE establishes EMERGE as the correct result',
        auditFlag: 'caution',
      },
      {
        id: 'adu-a4',
        category: 'conclusion_shift',
        title: 'Approved against the unified opposition of its own advisory committee',
        laymanSummary:
          'The FDA\'s external expert committee did not support approval. The agency approved the drug anyway, on the amyloid measurement rather than on the cognitive results.',
        technicalDetails:
          'Accelerated approval was granted in June 2021 on reduction of amyloid beta plaque as a surrogate reasonably likely to predict clinical benefit, despite the unified opposition of the agency\'s advisory committee following the early termination of the two efficacy trials. Three members of the Peripheral and Central Nervous System Drugs Advisory Committee resigned afterwards. The published critique frames the central issue precisely: accelerating approval on a surrogate marker in the absence of proven efficacy creates a risk of adverse outcomes even in a devastating condition. The disagreement is not about whether amyloid fell. It is about whether a measurement that reliably tracks the drug\'s pharmacology reliably tracks the patient\'s future.',
        evidenceSource: 'Rizk JG, Lewin JC. BMJ Evid Based Med 2023;28:78-82',
        doi: '10.1136/bmjebm-2022-111914',
        auditFlag: 'contested',
      },
      {
        id: 'adu-a5',
        category: 'measured',
        title: 'ARIA is common, and it is measurable',
        laymanSummary:
          'Brain swelling or small bleeds visible on MRI occurred in about a third of treated patients in the head-to-head comparison. It is monitored with scheduled scans.',
        technicalDetails:
          'Amyloid-related imaging abnormalities of the oedema and effusion type occurred in 34.8 per cent of aducanumab-treated participants in the randomised head-to-head study against donanemab, in which the donanemab figure was 23.9 per cent. ARIA is detected by scheduled MRI rather than by symptoms, is more frequent in APOE4 carriers, and is the reason the whole anti-amyloid class carries a surveillance imaging schedule. It is a genuinely quantified harm with a defined grading scale, which distinguishes it from the efficacy question on the same drug.',
        evidenceSource: 'Salloway S et al. Alzheimers Dement 2025;21:e70293',
        doi: '10.1002/alz.70293',
        measuredMetric:
          'Incidence of amyloid-related imaging abnormalities, oedema and effusion type, in a randomised head-to-head study',
        auditFlag: 'verified',
      },
      {
        id: 'adu-a6',
        category: 'failed',
        title: 'Discontinued in 2024 with the confirmatory trial unfinished',
        laymanSummary:
          'Biogen stopped selling the drug and stopped the trial that was supposed to confirm whether it works. The confirming evidence was never produced.',
        technicalDetails:
          'Accelerated approval is granted on the condition that a confirmatory trial verifies clinical benefit. Biogen announced in January 2024 that it was discontinuing the product and the confirmatory study, and reallocating resources to lecanemab. The consequence is that the question the accelerated approval deferred — does removing amyloid slow the disease — was not answered by this drug. Coverage had already been constrained: the Centers for Medicare and Medicaid Services issued a national coverage determination in April 2022 limiting reimbursement for anti-amyloid monoclonal antibodies approved on the amyloid surrogate to patients enrolled in qualifying clinical studies, which effectively ended routine use.',
        evidenceSource:
          'Drugs@FDA BLA 761178 (ADUHELM, Biogen); Rizk JG, Lewin JC. BMJ Evid Based Med 2023;28:78-82',
        doi: '10.1136/bmjebm-2022-111914',
        auditFlag: 'verified',
      },
      {
        id: 'adu-a7',
        category: 'inferred',
        title: 'A head-to-head comparison settled the surrogate and not the endpoint',
        laymanSummary:
          'A later trial showed a competitor cleared amyloid faster and more completely. It did not show that the competitor helped patients more.',
        technicalDetails:
          'TRAILBLAZER-ALZ 4 (NCT05108922) randomised 148 participants with early symptomatic Alzheimer\'s disease 1:1 to donanemab or aducanumab per label, with amyloid plaque clearance below 24.1 centiloids as the endpoint. Donanemab cleared plaque in 37.9, 70.0 and 76.8 per cent at 6, 12 and 18 months against 1.6, 24.6 and 43.1 per cent for aducanumab (P < 0.001), with median time to clearance 359 versus 568 days. This is a clean comparison of two drugs on a biomarker. It contains no cognitive comparison and cannot be read as evidence that either drug helps patients more than the other — which is the same category error the aducanumab approval turned on, appearing again in the literature that followed it.',
        evidenceSource: 'Salloway S et al. Alzheimers Dement 2025;21:e70293',
        doi: '10.1002/alz.70293',
        inferredClaim:
          'That superior amyloid plaque clearance in a head-to-head study implies superior clinical benefit',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A monthly intravenous infusion, titrated up over months',
        laymanDesc:
          'Given as a drip once a month, starting low and increasing in steps to the target dose.',
        molecularDetail:
          'Intravenous infusion every four weeks with stepwise titration to a 10 mg/kg target. The titration exists to limit amyloid-related imaging abnormalities, and under-exposure to the target dose during titration is one of the factors invoked to explain the ENGAGE result.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'A small fraction crosses into the brain',
        laymanDesc:
          'Most of an antibody this size stays in the bloodstream; only a small percentage reaches brain tissue.',
        molecularDetail:
          'IgG penetration of the intact blood-brain barrier is on the order of a fraction of a per cent of plasma concentration, which is why the doses are large relative to the target burden.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Binds aggregated amyloid, not monomer',
        laymanDesc:
          'It grips the clumped form of the protein and largely ignores the free-floating single molecules.',
        molecularDetail:
          'Binds a linear N-terminal epitope of amyloid beta with strong conformational selectivity for fibrils and oligomers over monomer, concentrating the antibody on parenchymal plaque and on cerebral amyloid angiopathy in vessel walls.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Microglia clear the flagged plaque',
        laymanDesc:
          'The brain\'s resident immune cells recognise the antibody coating and engulf the plaque. Vessel-wall involvement is what produces the swelling seen on scans.',
        molecularDetail:
          'Fc-gamma receptor engagement on microglia drives phagocytosis of opsonised plaque. The same process at perivascular amyloid increases vessel permeability, producing ARIA-oedema, and vessel-wall fragility, producing ARIA-haemosiderin.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Plaque falls in every study; cognition slowed in one trial of two',
        laymanDesc:
          'Amyloid on the scan drops reliably. Whether thinking and memory decline more slowly was answered yes by one trial and no by its twin.',
        molecularDetail:
          'Measured: plaque clearance in 43.1 per cent at 18 months in the head-to-head study. Measured: EMERGE high dose significant on primary and secondary endpoints, ENGAGE high dose not, with low-dose arms consistent and non-significant in both. ARIA-oedema in 34.8 per cent.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'NCT02484547',
        phase: 'Phase 3 (EMERGE)',
        sampleSize: 1638,
        primaryEndpoint:
          'Change from baseline in Clinical Dementia Rating Sum of Boxes at week 78 in early Alzheimer\'s disease',
        endpointMet: true,
        statisticalPValue:
          'High-dose aducanumab showed significant treatment effects across primary and secondary endpoints; low dose non-significant and intermediate',
        unreportedAdverseSignals:
          'The trial was terminated for futility in March 2019 and the positive result comes from the larger dataset assembled after that stop. Its identically designed twin did not reproduce it.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'NCT02477800',
        phase: 'Phase 3 (ENGAGE)',
        sampleSize: 1647,
        primaryEndpoint:
          'Change from baseline in Clinical Dementia Rating Sum of Boxes at week 78 in early Alzheimer\'s disease',
        endpointMet: false,
        statisticalPValue:
          'High-dose aducanumab did not demonstrate a significant treatment effect; low-dose results consistent with EMERGE and non-significant',
        unreportedAdverseSignals:
          'The sponsor attributes the outcome to a small number of extremely rapid progressors and lower exposure to the 10 mg/kg target dose among early-enrolled patients. Both analyses are post hoc.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'NCT05108922',
        phase: 'Phase 3 open-label head-to-head (TRAILBLAZER-ALZ 4)',
        sampleSize: 148,
        primaryEndpoint:
          'Amyloid plaque clearance below 24.1 centiloids on florbetapir PET, donanemab versus aducanumab',
        endpointMet: true,
        statisticalPValue:
          'Clearance at 6, 12 and 18 months: donanemab 37.9, 70.0 and 76.8 per cent versus aducanumab 1.6, 24.6 and 43.1 per cent, P < 0.001; median time to clearance 359 versus 568 days',
        unreportedAdverseSignals:
          'ARIA-oedema or effusion in 34.8 per cent on aducanumab and 23.9 per cent on donanemab. The study compares a biomarker only and reports no cognitive comparison.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Dose- and time-dependent reduction of brain amyloid beta plaque on florbetapir PET',
        'Plaque clearance below 24.1 centiloids in 1.6, 24.6 and 43.1 per cent of aducanumab patients at 6, 12 and 18 months in a randomised head-to-head study',
        'EMERGE high dose significant across primary and secondary endpoints; ENGAGE high dose not significant; low-dose arms consistent and non-significant in both',
        'ARIA-oedema or effusion in 34.8 per cent of aducanumab-treated participants in that head-to-head study',
      ],
      unsupportedInferences: [
        'That amyloid plaque reduction predicts clinical benefit — this is the premise of the accelerated approval, and it is the proposition the confirmatory trial was meant to test',
        'That post-hoc identification of rapid progressors and under-dosing in ENGAGE establishes EMERGE as the correct result',
        'That faster plaque clearance by a competitor implies greater clinical benefit; the head-to-head study measured no cognitive endpoint',
      ],
      whatFailedInitially: [
        'Both phase 3 trials were terminated for futility in March 2019',
        'ENGAGE high dose did not reproduce the EMERGE high-dose result under an identical protocol',
        'The advisory committee opposed approval and three members resigned after it was granted',
        'Biogen discontinued the product and the confirmatory trial in January 2024, so the deferred question was never answered',
      ],
      realWorldOutcome: [
        'The Centers for Medicare and Medicaid Services restricted coverage in April 2022 to patients in qualifying clinical studies, which ended routine use before the discontinuation',
        'Lecanemab and donanemab, later anti-amyloid antibodies with non-discordant phase 3 programmes, took the indication',
        'The episode is now the standard reference case for the limits of surrogate-endpoint approval',
      ],
    },
    deliverySystem: {
      type: 'Intravenous infusion every four weeks, with stepwise titration',
      description:
        'One-hour intravenous infusion every four weeks, titrated over several months to a 10 mg/kg target dose. Serial MRI surveillance for amyloid-related imaging abnormalities is required throughout, and APOE genotype stratifies that risk.',
      safetyProfile:
        'Amyloid-related imaging abnormalities are the principal harm: oedema or effusion in 34.8 per cent of aducanumab-treated participants in a randomised head-to-head study, alongside microhaemorrhage and superficial siderosis. Most ARIA is asymptomatic and detected on scheduled imaging, but symptomatic and serious cases occur, and risk is higher in APOE4 carriers. Headache, falls, diarrhoea and confusion were reported. The product was discontinued by its sponsor in January 2024.',
    },
    commonQuestions: [
      {
        q: 'Did the drug work?',
        a: 'It removed amyloid plaque, reliably and measurably. Whether that helped patients is the question two identically designed trials answered differently: high-dose aducanumab was significant across primary and secondary endpoints in EMERGE and was not significant in ENGAGE, with 1,638 and 1,647 patients respectively. Both trials had already been stopped for futility. The confirmatory trial that was supposed to resolve it was discontinued in 2024. So the honest answer is that the drug reliably does something to the brain that can be photographed, and the question of whether that helps is unresolved for this molecule.',
        auditNote:
          'The low-dose arms agreed across both studies and were non-significant in both. The discordance is confined to the high-dose arms.',
      },
      {
        q: 'What does "accelerated approval on a surrogate endpoint" actually mean here?',
        a: 'It means the FDA accepted amyloid plaque reduction as reasonably likely to predict clinical benefit, and allowed the drug to be sold while a confirmatory trial tested whether it actually does. That is a legitimate mechanism and it was designed for exactly this situation. What makes this case a reference point is that the confirmatory trial was never completed, so the bargain — sell now, prove later — was left with only its first half performed.',
      },
      {
        q: 'Why did the price get so much attention?',
        a: 'Because the launch price applied to a large population with an unresolved efficacy question, and because the infusions require ongoing MRI surveillance on top of the drug itself. The Centers for Medicare and Medicaid Services responded in April 2022 with a national coverage determination limiting reimbursement for anti-amyloid antibodies approved on the amyloid surrogate to patients in qualifying clinical studies. That decision, not the discontinuation two years later, is what ended routine use.',
      },
      {
        q: 'Why is there no price on this page?',
        a: 'Because this file does not carry a pricing block, and the product has been discontinued, so no current list price exists to state.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Budd Haeberlein S et al. Two randomized phase 3 studies of aducanumab in early Alzheimer\'s disease. J Prev Alzheimers Dis 2022;9:197-210',
        identifier: '10.14283/jpad.2022.30',
        kind: 'doi',
      },
      {
        label:
          'Mallinckrodt C, Tian Y, Aisen PS, et al. Investigating partially discordant results in phase 3 studies of aducanumab. J Prev Alzheimers Dis 2023;10:171-177',
        identifier: '10.14283/jpad.2023.6',
        kind: 'doi',
      },
      {
        label:
          'Sevigny J et al. The antibody aducanumab reduces Abeta plaques in Alzheimer\'s disease. Nature 2016;537:50-56',
        identifier: '10.1038/nature19323',
        kind: 'doi',
      },
      {
        label:
          'Salloway S et al. TRAILBLAZER-ALZ 4: a phase 3 trial comparing donanemab with aducanumab on amyloid plaque clearance in early, symptomatic Alzheimer\'s disease. Alzheimers Dement 2025;21:e70293',
        identifier: '10.1002/alz.70293',
        kind: 'doi',
      },
      {
        label:
          'Rizk JG, Lewin JC. FDA\'s dilemma with the aducanumab approval: public pressure and hope, surrogate markers and efficacy, and possible next steps. BMJ Evid Based Med 2023;28:78-82',
        identifier: '10.1136/bmjebm-2022-111914',
        kind: 'doi',
      },
      {
        label: 'ClinicalTrials.gov NCT02484547 — EMERGE',
        identifier: 'NCT02484547',
        kind: 'nct',
      },
      {
        label: 'ClinicalTrials.gov NCT02477800 — ENGAGE',
        identifier: 'NCT02477800',
        kind: 'nct',
      },
      {
        label: 'Drugs@FDA: ADUHELM (aducanumab-avwa), BLA 761178, Biogen Inc',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=761178',
        kind: 'regulatory',
      },
    ],
  },
]
