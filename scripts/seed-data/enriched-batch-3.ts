import type { SeedDossier } from '@/lib/seed-types'

/**
 * Curated flagship dossiers — the hepatitis drugs: the direct-acting antivirals that made chronic
 * hepatitis C curable, and the nucleos(t)ide analogues and interferon that suppress but do not
 * cure hepatitis B.
 *
 * Editorial layer written over the machine-enriched records: the verdict, the mechanism carousel
 * and the audits, which no pipeline can produce. The identity facts — slug, trade name, sponsor,
 * approval year, SMILES — are copied from the enriched record rather than researched again.
 *
 * Every DOI, PMID, NCT number and FDA application number below was resolved against the NCBI
 * E-utilities, the ClinicalTrials.gov v2 API or the openFDA Drugs@FDA and label endpoints at the
 * time of writing. Sample sizes, response rates, confidence intervals and p-values are copied from
 * the published abstract or from the FDA label, never from memory. Where a number could not be
 * sourced, the field is absent.
 *
 * Four conventions apply to the whole group.
 *
 * 1. SVR12 IS A SURROGATE AND EVERY PAGE SAYS SO. "Sustained virologic response at 12 weeks" means
 *    no virus detectable in blood twelve weeks after the last tablet. It is not a count of deaths,
 *    cancers or transplants. The 2017 Cochrane review of 138 randomised trials in 25,232 people
 *    found no randomised evidence validating SVR as a surrogate for morbidity or mortality, and
 *    that finding is quoted on the pages it applies to rather than buried.
 *
 * 2. PRICING IS SPLIT INTO A COST AND A PRICE, AND THEY ARE NOT THE SAME NUMBER. Where the
 *    hepatitis C literature publishes a real cost-of-production projection — Hill and colleagues in
 *    Clinical Infectious Diseases, which modelled minimum manufacturing costs for sofosbuvir and
 *    ribavirin — that figure sits in `synthesisCostPerDose` with its citation. United States
 *    wholesale acquisition costs come from Rosenthal and Graham's published table or from the CMS
 *    National Average Drug Acquisition Cost survey, and are labelled as prices. Where no
 *    cost-of-production study exists for a molecule, the dossier carries no `pricing` block at all
 *    rather than an invented number.
 *
 * 3. HEPATITIS C IS CURED AND HEPATITIS B IS NOT. The distinction runs through the whole group and
 *    every hepatitis B page states it: entecavir and tenofovir suppress viral DNA to undetectable
 *    and the virus returns when they stop, because covalently closed circular DNA persists in the
 *    hepatocyte nucleus and no approved drug removes it.
 *
 * 4. NO DOSING, DURATION-SELECTION OR PROCUREMENT GUIDANCE. Durations and strengths appear only
 *    where they are part of a trial's description or a label's identity. Nothing here tells a
 *    reader what to take, for how long, or where to obtain it.
 */

export const ENRICHED_BATCH_3_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // 1. Sofosbuvir — the nucleotide that made hepatitis C curable, priced at a thousand dollars a
  //    tablet against a modelled manufacturing cost of about a dollar a day.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'sofosbuvir',
    name: 'Sofosbuvir',
    tradeName: 'Sovaldi',
    sponsor: 'Gilead Sciences Inc. (acquired with Pharmasset in 2011 for US$11.2 billion)',
    targetGene: 'HCV NS5B — a hepatitis C viral gene, not a human one',
    targetProtein: 'Hepatitis C virus NS5B RNA-dependent RNA polymerase',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2013,
    indication:
      'Genotype 1, 2, 3 or 4 chronic hepatitis C virus infection in adults and in children aged 3 years and older, without cirrhosis or with compensated cirrhosis, as a component of a combination antiviral regimen',
    patientFriendlyIndication: 'Long-standing hepatitis C infection of the liver',
    anatomicalSite:
      'Hepatocyte cytoplasm — the viral replication complex on remodelled endoplasmic reticulum membrane',
    conditionContext: {
      conditionExplainer:
        'Hepatitis C is a virus that lives in liver cells and copies itself there for decades without symptoms. The damage comes from the immune system attacking infected cells year after year, which scars the liver. Scarring that becomes extensive is cirrhosis, and cirrhosis is what leads to liver failure and liver cancer.',
      whyItMatters:
        'Before 2011 the only treatment was a year of injected interferon that cured fewer than half of people and made most of them feel severely unwell. Sofosbuvir is the molecule that changed that arithmetic, and the argument about it since has been about price rather than about whether it works.',
      whoTakesThis:
        'Adults and children aged 3 and over with chronic hepatitis C. It is never given alone: the label requires it as a component of a combination regimen, because a single direct-acting antiviral selects resistance.',
      clinicalGoals:
        'Sustained virologic response at 12 weeks — no detectable virus in blood twelve weeks after the last tablet. That is a laboratory endpoint, not a count of deaths or cancers, and the difference is the central audit on this page.',
    },
    oneSentenceVerdict:
      'A uridine nucleotide prodrug that the liver converts into a fake building block, which the hepatitis C polymerase inserts into its own genome and then cannot extend — 90% cure in 327 previously untreated patients in NEUTRINO and 78% against 0% on placebo in POSITRON, launched in the United States at US$84,000 for a twelve-week course against a published minimum manufacturing cost of US$68 to US$136.',
    laymanHowItWorks:
      'Hepatitis C copies its genetic material with an enzyme that strings building blocks together. Sofosbuvir is swallowed as an inert form that liver cells strip down into a counterfeit building block. The viral enzyme cannot tell the difference, picks it up, adds it to the growing chain, and then finds it has nothing to attach the next piece to. Copying stops, and because human enzymes do not accept the counterfeit, healthy cells carry on unaffected.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 89,
    pricing: {
      synthesisCostPerDose:
        'US$68 to US$136 per 12-week course, projected minimum cost of manufacture at a scale of one million courses per year (Hill et al., Clin Infect Dis 2014)',
      retailPricePerDoseOrYear:
        'US$84,000 per 12-week course at the United States wholesale acquisition cost set at launch, equivalent to US$1,000 per 400 mg tablet',
      markupEstimate:
        'Roughly 620-fold to 1,235-fold the projected minimum manufacturing cost, taking the two ends of the published cost range',
      openPatentNotes:
        'The same course was listed at US$54,000 in the United Kingdom and US$25,000 in Spain, against the US$84,000 United States figure, in the published comparison. Price differences of that size across high-income countries are a negotiating outcome, not a manufacturing one.',
      synthesisComplexity: 'Moderate',
      costSource: {
        label:
          'Hill A, Khoo S, Fortunak J, Simmons B, Ford N. Minimum costs for producing hepatitis C direct-acting antivirals for use in large-scale treatment access programs in developing countries. Clin Infect Dis 2014;58:928-936',
        identifier: '10.1093/cid/ciu012',
        kind: 'doi',
      },
      priceSource: {
        label:
          'Rosenthal ES, Graham CS. Price and affordability of direct-acting antiviral regimens for hepatitis C virus in the United States. Infect Agent Cancer 2016;11:24, Table 2',
        identifier: '10.1186/s13027-016-0071-z',
        kind: 'doi',
      },
    },
    substitutes: {
      summary:
        'Sofosbuvir is a backbone, not a regimen. The realistic alternatives are other combinations built on it or around it, and the honest comparison between them is genotype coverage and price rather than cure rate, because they all cure above 95% in the populations they were tested in. Nothing sold as a food or a supplement clears hepatitis C, and this is one of the places where that matters most, because the disease is silent for decades while it does its damage.',
      conventionalRx: [
        {
          name: 'Ledipasvir/sofosbuvir (Harvoni)',
          class: 'NS5A inhibitor plus NS5B nucleotide inhibitor, fixed-dose combination',
          howItCompares:
            'Adds an NS5A inhibitor to the same nucleotide backbone and removes the need for interferon or ribavirin in genotype 1. In ION-1 it cured 99% of 865 previously untreated genotype 1 patients in 12 weeks. It does not cover genotypes 2 and 3, which is why velpatasvir replaced it.',
          typicalCost: 'US$94,500 per 12-week course at United States wholesale acquisition cost',
          prosAndCons:
            'Pros: one tablet daily, 99% cure, no injection. Cons: genotype 1, 4, 5 and 6 only; more expensive per course than sofosbuvir alone; carries the same amiodarone bradycardia warning, and the one reported fatal cardiac arrest was on this combination.',
        },
        {
          name: 'Sofosbuvir/velpatasvir (Epclusa)',
          class: 'Pan-genotypic NS5A inhibitor plus NS5B nucleotide inhibitor',
          howItCompares:
            'The same backbone with an NS5A inhibitor that works across all six genotypes, so genotyping before treatment stops being necessary. In ASTRAL-1 it cured 99% of 624 treated patients across genotypes 1, 2, 4, 5 and 6.',
          typicalCost:
            'US$866.40 per tablet at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: no genotyping needed, 12 weeks for almost everyone, works in decompensated cirrhosis when ribavirin is added. Cons: still priced as a branded course; the decompensated-cirrhosis result rests on ASTRAL-4, which was open-label with no untreated comparator.',
        },
        {
          name: 'Glecaprevir/pibrentasvir (Mavyret)',
          class: 'NS3/4A protease inhibitor plus pan-genotypic NS5A inhibitor',
          howItCompares:
            'Contains no sofosbuvir at all, which is why it is the option in severe kidney disease where sofosbuvir’s renally cleared metabolite accumulates. Treats most previously untreated patients in 8 weeks rather than 12.',
          typicalCost:
            'US$152.92 per pibrentasvir-containing tablet at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: 8 weeks, usable across the full range of kidney function, no nucleotide. Cons: contraindicated in decompensated cirrhosis because it contains a protease inhibitor; three tablets daily rather than one.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Ask whether you have been tested for hepatitis B before starting',
          action:
            'Confirm that HBsAg and anti-HBc have been measured before the first tablet, as the label requires.',
          patientImpact:
            'Clearing hepatitis C can allow a dormant hepatitis B infection to reactivate. The FDA added a boxed warning to sofosbuvir and every other direct-acting antiviral for this in 2016, after cases of fulminant hepatitis, liver failure and death.',
          clinicalPrecaution:
            'The risk applies both to people who are HBsAg positive and to people whose hepatitis B looks resolved, with HBsAg negative and anti-HBc positive. The second group is the one most often missed.',
        },
        {
          name: 'Say if you are taking amiodarone',
          action:
            'Tell the prescriber about amiodarone even if it was stopped recently, because its half-life is measured in weeks.',
          patientImpact:
            'The label reports postmarketing cases of symptomatic bradycardia, cases needing a pacemaker, and one fatal cardiac arrest when amiodarone was combined with a sofosbuvir-containing regimen. Onset was generally within hours to days, and in some cases up to two weeks.',
          clinicalPrecaution:
            'Coadministration is not recommended. The mechanism is stated in the label as unknown, which is a reason for caution rather than against it.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'C[C@@H](C(=O)OC(C)C)N[P@](=O)(OC[C@@H]1[C@H]([C@@]([C@@H](O1)N2C=CC(=O)NC2=O)(C)F)O)OC3=CC=CC=C3',
      chemicalFormula: 'C22H29FN3O9P',
      molecularWeight: '529.50 g/mol',
      targetReceptorAffinity:
        'Sofosbuvir itself binds nothing. Its active triphosphate metabolite GS-461203 inhibits recombinant NS5B polymerase from genotypes 1b, 2a, 3a and 4a with IC50 values of 0.7 to 2.6 micromolar, and the parent drug inhibits full-length replicons with EC50 values of 0.014 to 0.11 micromolar. GS-461203 inhibits neither human DNA and RNA polymerases nor mitochondrial RNA polymerase, which is the structural reason the drug is so well tolerated.',
      structureSource: {
        label: 'PubChem CID 45375808 (sofosbuvir) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/45375808',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'sof-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity and chiral purity of the 2-deoxy-2-fluoro-2-methyl uridine core',
          description:
            'Confirm the configuration at every one of the four stereocentres on the sugar before any coupling. The 2-fluoro-2-methyl quaternary carbon is the feature that makes the finished triphosphate a chain terminator rather than a substrate, and an epimer at that position is not a weaker drug but a different molecule.',
          reagentsAndBuffer:
            'Nucleoside reference standard, chiral HPLC with polysaccharide stationary phase, 19F and 1H NMR in DMSO-d6, Karl Fischer titration for water content',
        },
        {
          id: 'sof-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Phosphoramidate coupling to install the ProTide mask',
          description:
            'Couple the nucleoside 5-hydroxyl to a phenyl phosphorochloridate bearing the isopropyl alanine ester, under base catalysis. This is the ProTide step: it puts a lipophilic mask over the first phosphate so the molecule can enter a hepatocyte, and the mask is what the cell removes later. The phosphorus becomes a stereocentre here and only one epimer is the drug.',
          dependsOnStepId: 'sof-w1',
          reagentsAndBuffer:
            'Phenyl (isopropoxy-L-alaninyl) phosphorochloridate, N-methylimidazole or tert-butylmagnesium chloride as base, anhydrous tetrahydrofuran or dichloromethane, nitrogen atmosphere',
        },
        {
          id: 'sof-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Separation of the phosphorus diastereomers and crystallisation',
          description:
            'Separate the Sp and Rp phosphoramidate diastereomers and crystallise the Sp form, which is sofosbuvir. The other diastereomer is markedly less active, so this separation is the step that decides potency and is where most of the process cost sits.',
          dependsOnStepId: 'sof-w2',
          reagentsAndBuffer:
            'Silica or preparative reversed-phase chromatography, dichloromethane and methanol gradient, crystallisation from isopropyl acetate and heptane, 31P NMR to confirm diastereomeric ratio',
        },
        {
          id: 'sof-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Uptake and intracellular activation in Huh-7 hepatoma cells',
          description:
            'Dose Huh-7 cells carrying a subgenomic HCV replicon and confirm that the active triphosphate GS-461203 actually forms inside them. Activation is a three-enzyme sequence — cathepsin A or carboxylesterase 1 cleaves the ester, HINT1 cleaves the phosphoramidate, then cellular kinases add the last two phosphates — and a cell line missing any of those will read as a false negative.',
          dependsOnStepId: 'sof-w3',
          reagentsAndBuffer:
            'Huh-7 cells with genotype 1b subgenomic replicon, DMEM with 10% fetal bovine serum and G418 selection, cell lysis in 70% methanol at -20C, LC-MS/MS quantification of GS-461203 and GS-331007',
        },
        {
          id: 'sof-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Replicon EC50 and S282T resistance counter-screen',
          description:
            'Measure the concentration that halves replicon RNA, and run the same assay against a replicon carrying the S282T substitution in NS5B. S282T is the one substitution that confers resistance across every genotype tested, and it also cripples the virus, reducing replication capacity by 89% to 99%. A resistance assay that does not also report replication capacity omits the reason S282T is rare in patients.',
          dependsOnStepId: 'sof-w4',
          reagentsAndBuffer:
            'Luciferase-linked HCV replicon reporter, site-directed S282T mutant replicon, luciferase substrate and lysis buffer, human serum at 40% to test protein-binding effects',
        },
      ],
    },
    keyAudits: [
      {
        id: 'sof-a1',
        category: 'measured',
        title: 'POSITRON: 78% cured against 0% on matching placebo',
        laymanSummary:
          'This is the cleanest result the drug has. Patients who could not take interferon were randomised to sofosbuvir with ribavirin or to a dummy tablet. Four in five on the drug cleared the virus. Nobody on placebo did.',
        technicalDetails:
          'In POSITRON, 207 patients with genotype 2 or 3 hepatitis C for whom peginterferon was not an option received sofosbuvir plus ribavirin for 12 weeks and 71 received matching placebo. Sustained virologic response at 12 weeks was 78% (95% CI 72 to 83) on treatment against 0% on placebo, p<0.001. Response was lower in genotype 3 than genotype 2, and lower in cirrhosis than without it. Discontinuation of sofosbuvir for adverse events was 1 to 2%.',
        evidenceSource:
          'Jacobson IM et al., N Engl J Med 2013;368:1867-1877 (POSITRON, NCT01542788)',
        doi: '10.1056/NEJMoa1214854',
        measuredMetric:
          'Sustained virologic response 12 weeks after end of therapy, against matching placebo',
        auditFlag: 'verified',
      },
      {
        id: 'sof-a2',
        category: 'measured',
        title: 'NEUTRINO: 90% cured in 327 previously untreated patients',
        laymanSummary:
          'In the trial that supported approval, nine in ten previously untreated patients cleared the virus after twelve weeks. The comparison was against what earlier drugs had achieved, not against a placebo group in the same trial.',
        technicalDetails:
          'NEUTRINO was a single-group, open-label study of sofosbuvir plus peginterferon alfa-2a and ribavirin for 12 weeks in 327 previously untreated patients with genotype 1, 4, 5 or 6, of whom 98% had genotype 1 or 4. Sustained virologic response at 12 weeks was 90% (95% CI 87 to 93). There was no concurrent control arm; the trial was designed to be compared against a historical response rate.',
        evidenceSource: 'Lawitz E et al., N Engl J Med 2013;368:1878-1887 (NEUTRINO, NCT01641640)',
        doi: '10.1056/NEJMoa1214853',
        measuredMetric: 'Sustained virologic response at 12 weeks in a single-arm study',
        auditFlag: 'verified',
      },
      {
        id: 'sof-a3',
        category: 'failed',
        title: 'FISSION: identical to the old interferon regimen it was meant to replace',
        laymanSummary:
          'In the head-to-head trial against the drug it was replacing, sofosbuvir with ribavirin cured exactly the same proportion — 67% — as twenty-four weeks of interferon. It was better tolerated and shorter. It was not more effective.',
        technicalDetails:
          'FISSION randomised 499 previously untreated patients with genotype 2 or 3 to sofosbuvir plus ribavirin for 12 weeks or peginterferon alfa-2a plus ribavirin for 24 weeks. Sustained virologic response was 67% in both groups. Within the sofosbuvir arm the split was stark: 97% in genotype 2 against 56% in genotype 3. Adverse events including fatigue, headache, nausea and neutropenia were less common with sofosbuvir. The trial met its noninferiority objective and did not show superiority.',
        evidenceSource: 'Lawitz E et al., N Engl J Med 2013;368:1878-1887 (FISSION, NCT01497366)',
        doi: '10.1056/NEJMoa1214853',
        measuredMetric: 'Sustained virologic response, sofosbuvir-ribavirin against peginterferon-ribavirin',
        auditFlag: 'verified',
      },
      {
        id: 'sof-a4',
        category: 'failed',
        title: 'FUSION: half of previously treated patients relapsed at the approved duration',
        laymanSummary:
          'Patients who had already failed interferon were given twelve or sixteen weeks of sofosbuvir with ribavirin. Twelve weeks cured half of them. Sixteen weeks cured nearly three-quarters. Duration, not the drug, decided the outcome.',
        technicalDetails:
          'FUSION randomised 103 previously treated patients with genotype 2 or 3 to 12 weeks and 98 to 16 weeks of sofosbuvir plus ribavirin. Sustained virologic response was 50% at 12 weeks against 73% at 16 weeks, a difference of -23 percentage points (95% CI -35 to -11, p<0.001). In VALENCE the study was unblinded mid-course and genotype 3 treatment extended to 24 weeks on the strength of this signal, reaching 85% (95% CI 80 to 89) in 250 patients, but only 68% in those with cirrhosis against 91% without.',
        evidenceSource:
          'Jacobson IM et al., N Engl J Med 2013;368:1867-1877 (FUSION, NCT01604850); Zeuzem S et al., N Engl J Med 2014;370:1993-2001 (VALENCE, NCT01682720)',
        doi: '10.1056/NEJMoa1214854',
        measuredMetric: 'Sustained virologic response at 12 weeks against 16 weeks of treatment',
        auditFlag: 'caution',
      },
      {
        id: 'sof-a5',
        category: 'inferred',
        title: 'No randomised trial has shown that curing hepatitis C prevents death or liver cancer',
        laymanSummary:
          'Every trial on this page measures virus in blood. None of them counted deaths, cancers or transplants for long enough to say anything. The link between clearing the virus and living longer is inferred from observational follow-up, not from a randomised comparison.',
        technicalDetails:
          'The Cochrane review by Jakobsen and colleagues pooled 138 randomised trials of 51 direct-acting antivirals in 25,232 participants, 128 of them placebo-controlled. It found no data at all on hepatitis C-related morbidity, and only limited mortality data from 11 trials (15 of 2,377 on DAA against 1 of 617 on control; OR 3.72, 95% CI 0.53 to 26.18, very low-quality evidence). None of the 138 trials provided usable data on ascites, variceal bleeding, hepato-renal syndrome, hepatic encephalopathy or hepatocellular carcinoma. Only one of 84 trials of marketed drugs measured quality of life. The authors concluded that SVR remains an outcome needing proper validation in randomised trials. The review was contested in print, and the counter-argument is that withholding a curative drug to run such a trial would now be unethical. Both things are true at once.',
        evidenceSource:
          'Jakobsen JC et al., Cochrane Database Syst Rev 2017;9:CD012143',
        doi: '10.1002/14651858.CD012143.pub3',
        inferredClaim:
          'That sustained virologic response translates into fewer deaths, cirrhosis complications and liver cancers — biologically compelling, supported by cohort follow-up, and never tested against a randomised control',
        auditFlag: 'contested',
      },
      {
        id: 'sof-a6',
        category: 'conclusion_shift',
        title: 'The liver-cancer scare of 2016 did not survive adjustment for age and follow-up',
        laymanSummary:
          'A Spanish study reported that liver cancers came back unusually often after these drugs cleared the virus, and it caused real alarm. A larger analysis found that the patients treated with the new drugs were older and followed for a shorter time, and once that was accounted for the difference disappeared.',
        technicalDetails:
          'Reig and colleagues reported radiologic tumour recurrence in 16 of 58 patients (27.6%) with previously treated hepatocellular carcinoma after interferon-free DAA therapy, at a median follow-up of 5.7 months, and called for large-scale assessment. Waziry and colleagues then meta-analysed 41 studies in 13,875 patients. Crude rates did look higher after DAA — HCC occurrence 2.96 per 100 person-years (95% CI 1.76 to 4.96) against 1.14 (0.86 to 1.52) after interferon; recurrence 12.16 (5.00 to 29.58) against 9.21 (7.18 to 11.81) — but DAA cohorts were older and followed for about a fifth as long. In meta-regression adjusting for follow-up and age, DAA therapy was associated with neither higher occurrence (RR 0.68, 95% CI 0.18 to 2.55, p=0.55) nor higher recurrence (RR 0.62, 95% CI 0.11 to 3.45, p=0.56).',
        evidenceSource:
          'Reig M et al., J Hepatol 2016;65:719-726; Waziry R et al., J Hepatol 2017;67:1204-1212',
        doi: '10.1016/j.jhep.2017.07.025',
        inferredClaim:
          'That direct-acting antivirals promote hepatocellular carcinoma — an inference from uncontrolled single-cohort rates that adjustment for age and follow-up time removes',
        auditFlag: 'verified',
      },
      {
        id: 'sof-a7',
        category: 'failed',
        title: 'Two safety findings arrived after approval, one of them fatal',
        laymanSummary:
          'Neither of these was seen in the trials. Combining sofosbuvir with the heart drug amiodarone can slow the heart dangerously, and one patient died. Separately, clearing hepatitis C can wake up a dormant hepatitis B infection, which has also caused deaths.',
        technicalDetails:
          'The label records postmarketing cases of symptomatic bradycardia and cases requiring pacemaker intervention when amiodarone was coadministered with a sofosbuvir-containing regimen, including one fatal cardiac arrest on ledipasvir/sofosbuvir. Onset was generally within hours to days and in some cases up to two weeks after starting treatment; bradycardia generally resolved on stopping. The label states the mechanism is unknown and does not recommend coadministration. Separately, the drug carries a boxed warning for hepatitis B virus reactivation in HCV/HBV coinfected patients, some cases resulting in fulminant hepatitis, hepatic failure and death, including in patients whose HBV appeared resolved (HBsAg negative, anti-HBc positive). Both findings came from postmarketing surveillance, not from the registration programme.',
        evidenceSource:
          'SOVALDI United States prescribing information, boxed warning and Warnings and Precautions 5.1 and 5.2 (NDA 204671)',
        auditFlag: 'caution',
      },
      {
        id: 'sof-a8',
        category: 'inferred',
        title: 'The price was not derived from the cost of making the drug',
        laymanSummary:
          'A twelve-week course launched at eighty-four thousand US dollars. A published model of what it costs to manufacture the same course at scale put the figure between sixty-eight and a hundred and thirty-six dollars. The same course was listed at twenty-five thousand in Spain.',
        technicalDetails:
          'Hill and colleagues classified four hepatitis C DAAs and ribavirin by chemical structure, molecular weight, daily dose and synthetic complexity, projected manufacturing cost per gram at a volume of one million courses per year, and benchmarked against actual generic antiretroviral costs of US$0.2 to US$2.1 per gram. Projected manufacturing cost for a 12-week course of sofosbuvir was US$68 to US$136, with ribavirin at US$21 to US$63; they ranked sofosbuvir third of five for synthetic complexity, below faldaprevir and simeprevir. Rosenthal and Graham record the United States wholesale acquisition cost at US$84,000 for the same course, against US$54,000 in the United Kingdom and US$25,000 in Spain, and note an average negotiated discount of 46% off WAC that is not public per contract.',
        evidenceSource:
          'Hill A et al., Clin Infect Dis 2014;58:928-936; Rosenthal ES, Graham CS, Infect Agent Cancer 2016;11:24',
        doi: '10.1093/cid/ciu012',
        inferredClaim:
          'That the launch price reflected the cost of developing and making the drug — the published manufacturing projection and the fourfold spread across high-income countries are both inconsistent with it',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed as a disguised molecule',
        laymanDesc:
          'The tablet contains a version of the drug wrapped in a chemical disguise. The disguise does nothing against the virus. Its only job is to let the molecule get inside a liver cell, which the working form could never do on its own.',
        molecularDetail:
          'Sofosbuvir is a phosphoramidate ProTide: an isopropyl alanine ester and a phenol group mask the negatively charged 5-monophosphate. Peak plasma concentration comes at roughly 0.5 to 2 hours, unaffected by a high-fat meal, with 61 to 65% plasma protein binding and a median terminal half-life of 0.4 hours for the parent drug.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Liver cells strip the disguise off in three steps',
        laymanDesc:
          'Once inside a liver cell, three separate enzymes take the wrapping apart one layer at a time. This only happens efficiently inside liver cells, which is why the drug concentrates where the virus lives.',
        molecularDetail:
          'Cathepsin A or carboxylesterase 1 hydrolyses the carboxyl ester; histidine triad nucleotide-binding protein 1 (HINT1) cleaves the phosphoramidate to release the nucleoside monophosphate; cellular pyrimidine kinases add the second and third phosphates to give GS-461203. Dephosphorylation instead yields GS-331007, which cannot be efficiently rephosphorylated and has no antiviral activity; it accounts for more than 90% of circulating drug-related material and is cleared renally with a 27-hour half-life.',
        iconName: 'Scissors',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The virus copies its genome and picks up the counterfeit',
        laymanDesc:
          'Hepatitis C copies itself with an enzyme that reads its own genetic code and builds a matching strand. The activated drug looks close enough to a real building block that the enzyme accepts it.',
        molecularDetail:
          'GS-461203 is a uridine analog triphosphate. NS5B, the viral RNA-dependent RNA polymerase, incorporates it into the nascent RNA strand. In biochemical assay it inhibits recombinant NS5B from genotypes 1b, 2a, 3a and 4a with IC50 values of 0.7 to 2.6 micromolar, and replicon EC50 values span 0.014 to 0.11 micromolar across genotypes 1a to 6a.',
        iconName: 'Dna',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The chain cannot be extended and copying stops',
        laymanDesc:
          'The counterfeit block has no attachment point for the next one. The growing copy is stuck at that position, and the virus cannot finish a genome.',
        molecularDetail:
          'The 2-fluoro-2-methyl substitution on the ribose sterically and electronically blocks the addition of the next nucleotide, making incorporation a non-obligate chain termination. Because GS-461203 inhibits neither human DNA and RNA polymerases nor mitochondrial RNA polymerase, host replication and mitochondrial transcription are unaffected — the structural basis for the drug being essentially free of the toxicity that ended earlier nucleoside programmes.',
        iconName: 'Ban',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Virus falls below detection and stays there',
        laymanDesc:
          'With copying blocked, infected cells are cleared and no new ones are infected. If blood tests still show no virus twelve weeks after the last tablet, relapse after that point is rare.',
        molecularDetail:
          'The endpoint is SVR12: HCV RNA below the lower limit of quantification 12 weeks after end of therapy. Resistance is unusual because the only substitution conferring cross-genotype resistance, S282T, reduces viral replication capacity by 89% to 99% and is outcompeted by wild-type virus.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What the endpoint does not measure',
        laymanDesc:
          'Clearing the virus is not the same as being shown to live longer. No randomised trial has followed patients long enough to count deaths, cancers or transplants, so that part of the story is inference.',
        molecularDetail:
          'SVR12 is a virological surrogate accepted by regulators on observational evidence. The 2017 Cochrane review of 138 trials in 25,232 participants found no usable randomised data on hepatitis C-related morbidity, hepatocellular carcinoma, ascites, variceal bleeding or encephalopathy, and only 11 trials reporting any mortality.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'POSITRON (NCT01542788)',
        phase: 'Phase 3, randomised, placebo-controlled',
        sampleSize: 278,
        primaryEndpoint: 'Sustained virologic response 12 weeks after end of therapy',
        endpointMet: true,
        statisticalPValue: 'P < 0.001 for 78% (95% CI 72 to 83) against 0% on placebo',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'NEUTRINO (NCT01641640)',
        phase: 'Phase 3, single-group, open-label',
        sampleSize: 327,
        primaryEndpoint: 'Sustained virologic response 12 weeks after end of therapy',
        endpointMet: true,
        statisticalPValue: '90% (95% CI 87 to 93); no concurrent control arm, historical comparison',
        unreportedAdverseSignals:
          'Single-arm design. The 90% figure has no internal comparator, and the regimen included peginterferon and ribavirin, so it is not a measurement of sofosbuvir alone.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'FISSION (NCT01497366)',
        phase: 'Phase 3, randomised, active-controlled noninferiority',
        sampleSize: 499,
        primaryEndpoint:
          'Sustained virologic response at 12 weeks, sofosbuvir-ribavirin against peginterferon-ribavirin',
        endpointMet: true,
        statisticalPValue:
          '67% in both arms; noninferiority met, superiority not shown. Genotype 3 56% against genotype 2 97% within the sofosbuvir arm.',
        unreportedAdverseSignals:
          'The genotype 3 result is in the abstract but is easily lost behind the headline 67%. Genotype 3 was the population sofosbuvir-ribavirin served worst.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'FUSION (NCT01604850)',
        phase: 'Phase 3, randomised, double-blind, duration comparison',
        sampleSize: 201,
        primaryEndpoint:
          'Sustained virologic response at 12 weeks, 12-week against 16-week sofosbuvir-ribavirin in previously treated patients',
        endpointMet: false,
        statisticalPValue:
          '50% at 12 weeks against 73% at 16 weeks; difference -23 percentage points (95% CI -35 to -11), P < 0.001',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'VALENCE (NCT01682720)',
        phase: 'Phase 3, randomised then unblinded and redesigned mid-study',
        sampleSize: 419,
        primaryEndpoint: 'Sustained virologic response 12 weeks after end of therapy',
        endpointMet: true,
        statisticalPValue:
          'Genotype 2 at 12 weeks 93% (95% CI 85 to 98); genotype 3 at 24 weeks 85% (95% CI 80 to 89). Descriptive only after unblinding.',
        unreportedAdverseSignals:
          'The placebo group was terminated and hypothesis testing abandoned partway through, on the strength of emerging FUSION data. The result is therefore descriptive, and the paper says so.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '78% sustained virologic response against 0% on matching placebo in 278 randomised patients in POSITRON (p<0.001)',
        '90% sustained virologic response in 327 previously untreated patients in the single-arm NEUTRINO study',
        '67% response in both arms of FISSION, identical to 24 weeks of peginterferon and ribavirin',
        '50% against 73% response at 12 against 16 weeks in previously treated genotype 2 and 3 patients in FUSION',
        'A projected minimum manufacturing cost of US$68 to US$136 per 12-week course against an US$84,000 United States launch price',
      ],
      unsupportedInferences: [
        'That clearing the virus has been shown in a randomised trial to reduce deaths, liver cancers or transplants — no such trial has reported',
        'That the launch price reflects manufacturing or development cost, when the same course was listed at US$25,000 in Spain',
        'That direct-acting antivirals cause liver cancer, an alarm from 2016 that adjustment for age and follow-up time dissolved',
        'That a cure rate measured with peginterferon and ribavirin in the regimen is a measurement of sofosbuvir on its own',
      ],
      whatFailedInitially: [
        'FISSION showed no superiority over the interferon regimen it replaced: 67% in both arms',
        'Genotype 3 responded at 56% against 97% for genotype 2 on sofosbuvir-ribavirin, and cirrhosis dropped genotype 3 to 68% even at 24 weeks',
        'Twelve weeks failed in previously treated patients, curing half of them, and the duration had to be extended',
        'Symptomatic bradycardia with amiodarone, including one fatal cardiac arrest, and hepatitis B reactivation, including deaths, were both found only after approval',
      ],
      realWorldOutcome: [
        'The first regimen to cure hepatitis C without interferon, and the backbone of the combinations that followed it',
        'Approved in 2013 under NDA 204671 and now indicated down to age 3, with genotype 5 and 6 coverage added later',
        'A boxed warning for hepatitis B reactivation was added to sofosbuvir and every other direct-acting antiviral in 2016',
        'The price became the template for the argument about what a cure is allowed to cost, and remains the most cited case in that argument',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet (200 mg and 400 mg) and oral pellets for children',
      description:
        'Taken once daily with or without food; a high-fat meal does not meaningfully change exposure. Pellets exist so the drug can be given to children from age 3, which is why the paediatric indication could be written at all.',
      safetyProfile:
        'Boxed warning for hepatitis B virus reactivation in HCV/HBV coinfected patients, including fulminant hepatitis, hepatic failure and death, and including patients whose HBV appeared resolved. Coadministration with amiodarone is not recommended after postmarketing reports of symptomatic bradycardia, pacemaker intervention and one fatal cardiac arrest. Commonest trial adverse events were fatigue, headache, nausea and insomnia; discontinuation for adverse events was 1 to 2%. At three times the maximum dose the drug did not prolong QTc to a clinically relevant extent.',
    },
    commonQuestions: [
      {
        q: 'Does curing hepatitis C mean I will live longer?',
        a: 'Probably, and it has not been proved the way a drug effect is usually proved. Every registration trial measured virus in blood twelve weeks after the last tablet. None of them counted deaths, liver cancers or transplants for long enough to say anything. The 2017 Cochrane review pooled 138 randomised trials in 25,232 people and found no usable data at all on hepatitis C-related morbidity, and mortality data from only 11 trials. What supports the expectation is observational follow-up of people who cleared the virus, plus the mechanism: no virus means no continuing immune attack on the liver. That is a strong argument. It is not the same kind of evidence as the cure rate itself, and this page keeps the two apart.',
        auditNote:
          'The counter-argument to Cochrane is that a randomised trial with a hard endpoint would now require withholding a curative drug for years. That is a fair objection to running the trial, not evidence that the trial has been run.',
      },
      {
        q: 'Is sofosbuvir taken on its own?',
        a: 'No, and the label forbids it. It is indicated only as a component of a combination antiviral regimen. A single direct-acting antiviral gives the virus one target to escape, and even though the escape substitution here — S282T — is unusually costly to the virus, the principle holds. In practice sofosbuvir is taken as part of a fixed-dose combination with an NS5A inhibitor, most often velpatasvir or ledipasvir, which is why the trials on this page that used peginterferon and ribavirin alongside it are historical rather than current practice.',
      },
      {
        q: 'Why did it cost eighty-four thousand dollars?',
        a: 'That was the United States wholesale acquisition cost set at launch, which works out at a thousand dollars per tablet. A published model of manufacturing cost at a scale of a million courses a year put the figure for the same twelve-week course at sixty-eight to a hundred and thirty-six dollars. The same course was listed at fifty-four thousand dollars in the United Kingdom and twenty-five thousand in Spain. A fourfold spread across high-income countries for an identical product is a negotiating outcome, not a manufacturing one. The list price is also not what anyone paid: the published average negotiated discount was 46% off, and the actual net prices are confidential by contract, so nobody outside the negotiation knows the real figure.',
        auditNote:
          'The comparison people usually reach for — cost of production against list price — is the weakest one available, because it ignores development risk. The stronger comparison is the same product priced at a quarter as much one border away.',
      },
      {
        q: 'Does it cause liver cancer?',
        a: 'The evidence says no. In 2016 a Spanish group reported that 16 of 58 patients with previously treated liver cancer had radiologic recurrence after direct-acting antiviral therapy, at a median follow-up of under six months, and called for larger assessment. It caused genuine alarm. A meta-analysis of 41 studies in 13,875 patients then found that the patients treated with the new drugs were older and followed for roughly a fifth as long as the interferon comparison groups, and once follow-up and age were adjusted for, neither new cancers nor recurrences were more common after direct-acting antivirals. The adjusted risk ratios were 0.68 and 0.62, both with confidence intervals spanning one.',
      },
      {
        q: 'What about hepatitis B?',
        a: 'This is the one thing on the page that has to be checked before the first tablet. Clearing hepatitis C can allow a hepatitis B infection that was being held in check to reactivate, and cases have progressed to fulminant hepatitis, liver failure and death. The FDA added a boxed warning covering the whole direct-acting antiviral class in 2016. The label requires testing for HBsAg and anti-HBc before treatment starts. The group most often missed is people whose hepatitis B looks resolved — HBsAg negative but anti-HBc positive — because there is nothing in their history to prompt the question.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Lawitz E et al. Sofosbuvir for previously untreated chronic hepatitis C infection. N Engl J Med 2013;368:1878-1887 (NEUTRINO and FISSION)',
        identifier: '10.1056/NEJMoa1214853',
        kind: 'doi',
      },
      {
        label:
          'Jacobson IM et al. Sofosbuvir for hepatitis C genotype 2 or 3 in patients without treatment options. N Engl J Med 2013;368:1867-1877 (POSITRON and FUSION)',
        identifier: '10.1056/NEJMoa1214854',
        kind: 'doi',
      },
      {
        label:
          'Zeuzem S et al. Sofosbuvir and ribavirin in HCV genotypes 2 and 3. N Engl J Med 2014;370:1993-2001 (VALENCE)',
        identifier: '10.1056/NEJMoa1316145',
        kind: 'doi',
      },
      {
        label:
          'Jakobsen JC et al. Direct-acting antivirals for chronic hepatitis C. Cochrane Database Syst Rev 2017;9:CD012143',
        identifier: '10.1002/14651858.CD012143.pub3',
        kind: 'doi',
      },
      {
        label:
          'Reig M et al. Unexpected high rate of early tumor recurrence in patients with HCV-related HCC undergoing interferon-free therapy. J Hepatol 2016;65:719-726',
        identifier: '10.1016/j.jhep.2016.04.008',
        kind: 'doi',
      },
      {
        label:
          'Waziry R et al. Hepatocellular carcinoma risk following direct-acting antiviral HCV therapy: a systematic review, meta-analyses, and meta-regression. J Hepatol 2017;67:1204-1212',
        identifier: '10.1016/j.jhep.2017.07.025',
        kind: 'doi',
      },
      {
        label:
          'Hill A, Khoo S, Fortunak J, Simmons B, Ford N. Minimum costs for producing hepatitis C direct-acting antivirals. Clin Infect Dis 2014;58:928-936',
        identifier: '10.1093/cid/ciu012',
        kind: 'doi',
      },
      {
        label:
          'Rosenthal ES, Graham CS. Price and affordability of direct-acting antiviral regimens for hepatitis C virus in the United States. Infect Agent Cancer 2016;11:24',
        identifier: '10.1186/s13027-016-0071-z',
        kind: 'doi',
      },
      {
        label: 'POSITRON: sofosbuvir plus ribavirin against placebo in genotype 2 or 3',
        identifier: 'NCT01542788',
        kind: 'nct',
      },
      {
        label: 'NEUTRINO: sofosbuvir plus peginterferon alfa-2a and ribavirin, previously untreated',
        identifier: 'NCT01641640',
        kind: 'nct',
      },
      {
        label:
          'Drugs@FDA: SOVALDI (sofosbuvir), NDA 204671, Gilead Sciences — original approval 6 December 2013',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=204671',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 45375808 — sofosbuvir structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/45375808',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 2. Ledipasvir — the NS5A inhibitor that made hepatitis C a one-tablet, eight-week illness, and
  //    was obsolete within two years because it could not touch genotypes 2 and 3.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'ledipasvir',
    name: 'Ledipasvir',
    tradeName: 'Harvoni',
    sponsor: 'Gilead Sciences Inc.',
    targetGene: 'HCV NS5A — a hepatitis C viral gene, not a human one',
    targetProtein:
      'Hepatitis C virus NS5A phosphoprotein, domain I — a scaffold with no enzymatic activity of its own',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2014,
    indication:
      'Chronic hepatitis C virus genotype 1, 4, 5 or 6 infection in adults and children aged 3 years and older, given as a fixed-dose combination with sofosbuvir; the combination is also indicated in genotype 1 with decompensated cirrhosis or after liver transplant, with ribavirin',
    patientFriendlyIndication: 'Long-standing hepatitis C infection, mainly genotype 1',
    anatomicalSite:
      'Hepatocyte cytoplasm — the membranous web where NS5A assembles the viral replication complex',
    conditionContext: {
      conditionExplainer:
        'Hepatitis C comes in six main genetic families, called genotypes, and they are different enough that a drug can work superbly against one and barely at all against another. Genotype 1 is the commonest in North America, Europe and Japan. Ledipasvir was built for it.',
      whyItMatters:
        'Combined with sofosbuvir in one daily tablet, ledipasvir turned a year of injections that cured half of people into eight weeks of a pill that cured almost all of them. That is the single largest change in the treatment of any chronic viral infection in the past two decades.',
      whoTakesThis:
        'Adults and children aged 3 and over with genotype 1, 4, 5 or 6. It is never given alone and is not sold alone: ledipasvir exists only inside the fixed-dose combination with sofosbuvir.',
      clinicalGoals:
        'Sustained virologic response at 12 weeks, and — the point of ION-3 — reaching it in eight weeks rather than twelve in people without cirrhosis.',
    },
    oneSentenceVerdict:
      'An NS5A inhibitor of extraordinary potency, active at four picomolar against genotype 1b in cell culture, which combined with sofosbuvir cured 99% of 865 previously untreated genotype 1 patients in ION-1 and 94% in eight weeks in ION-3 — and which has essentially no useful activity against genotypes 2 and 3, so a pan-genotypic replacement displaced it within two years.',
    laymanHowItWorks:
      'Hepatitis C cannot copy itself out in the open. It first builds a private workshop out of folded cell membrane, and a viral protein called NS5A is the foreman that organises that workshop and packages finished genomes into new virus particles. Ledipasvir sticks to NS5A and stops it doing either job. Paired with sofosbuvir, which jams the copying machine itself, the virus loses both the workshop and the machine at once.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 88,
    substitutes: {
      summary:
        'Ledipasvir has been superseded rather than disproved. Everything it does, a pan-genotypic combination does across all six genotypes, which removes the genotype test from the pathway. The comparison worth making is not cure rate — they are all above 95% — but how much has to be known about a patient before treatment can start.',
      conventionalRx: [
        {
          name: 'Sofosbuvir/velpatasvir (Epclusa)',
          class: 'Pan-genotypic NS5A inhibitor plus the same NS5B nucleotide backbone',
          howItCompares:
            'The direct successor from the same company. Velpatasvir covers genotypes 1 through 6 where ledipasvir covers 1, 4, 5 and 6 with subtype-dependent gaps, so genotyping before treatment stops being necessary. In ASTRAL-1 it cured 99% of 624 patients across five genotypes.',
          typicalCost:
            'US$866.40 per tablet at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: one tablet, no genotype test, works in genotype 3, usable in decompensated cirrhosis with ribavirin. Cons: 12 weeks rather than the 8 that ION-3 established for ledipasvir in uncomplicated genotype 1.',
        },
        {
          name: 'Glecaprevir/pibrentasvir (Mavyret)',
          class: 'NS3/4A protease inhibitor plus pan-genotypic NS5A inhibitor',
          howItCompares:
            'Eight weeks for most previously untreated patients across all genotypes, and contains no sofosbuvir, so it is the option when kidney function is severely reduced. Contraindicated in decompensated cirrhosis, where ledipasvir with sofosbuvir and ribavirin still has a place.',
          typicalCost:
            'US$152.92 per pibrentasvir-containing tablet at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: 8 weeks pan-genotypically, no renal restriction. Cons: three tablets daily, protease inhibitor so not usable in decompensated liver disease.',
        },
        {
          name: 'Elbasvir/grazoprevir (Zepatier)',
          class: 'NS5A inhibitor plus NS3/4A protease inhibitor',
          howItCompares:
            'Genotype 1 and 4 only, like ledipasvir, but launched at a substantially lower list price and with a strong result in advanced kidney disease. Requires baseline NS5A resistance testing in genotype 1a, which ledipasvir does not.',
          typicalCost:
            'US$54,600 per 12-week course at United States wholesale acquisition cost, against US$94,500 for ledipasvir/sofosbuvir',
          prosAndCons:
            'Pros: about 40% cheaper per course at list price, works in dialysis. Cons: needs a baseline resistance test in genotype 1a; no genotype 2, 3, 5 or 6 coverage.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Check the acid-reducer you take',
          action:
            'Mention any proton pump inhibitor, H2 blocker or antacid before starting, including ones bought without a prescription.',
          patientImpact:
            'Ledipasvir dissolves poorly as the stomach becomes less acidic. Raising gastric pH lowers how much drug reaches the blood, and that is a mechanism for treatment failure that has nothing to do with the virus.',
          clinicalPrecaution:
            'This is a genuine interaction written into the label, not a precaution invented here. It does not apply to velpatasvir-based regimens in the same way, which is one practical reason they displaced this one.',
        },
        {
          name: 'Say if you are taking amiodarone',
          action: 'Disclose amiodarone use even if it stopped weeks ago.',
          patientImpact:
            'The one fatal cardiac arrest recorded in the sofosbuvir class safety warning occurred in a patient taking amiodarone with this exact combination.',
          clinicalPrecaution:
            'Coadministration is not recommended. The label states the mechanism is unknown.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CC(C)[C@@H](C(=O)N1CC2(CC2)C[C@H]1C3=NC=C(N3)C4=CC5=C(C=C4)C6=C(C5(F)F)C=C(C=C6)C7=CC8=C(C=C7)N=C(N8)[C@@H]9[C@H]1CC[C@H](C1)N9C(=O)[C@H](C(C)C)NC(=O)OC)NC(=O)OC',
      chemicalFormula: 'C49H54F2N8O6',
      molecularWeight: '889.00 g/mol',
      targetReceptorAffinity:
        'Replicon EC50 of 0.031 nM against genotype 1a and 0.004 nM against genotype 1b — four picomolar, among the most potent antiviral activities ever measured. Potency collapses by four to five orders of magnitude in some genotype 6 subtypes: median EC50 60.6 to 430.1 nM for subtypes 6e, 6l, 6n, 6q, 6k and 6m, and 199.6 nM for genotype 4b.',
      structureSource: {
        label: 'PubChem CID 67505836 (ledipasvir) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/67505836',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ldv-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity of the two chiral proline-derived caps',
          description:
            'Confirm the configuration of the azaspiro proline and the bridged bicyclic proline that terminate each arm of the molecule. Ledipasvir is a pseudo-symmetric dimer built around a central difluorofluorene, and the two ends are not identical; a mismatch there is a different compound with different potency.',
          reagentsAndBuffer:
            'Chiral HPLC with amylose stationary phase, 1H and 19F NMR in DMSO-d6, methyl carbamate reference standards, Karl Fischer titration',
        },
        {
          id: 'ldv-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Suzuki coupling of the difluorofluorene core to the two benzimidazole arms',
          description:
            'Build the rigid central spine first, then attach the imidazole and benzimidazole heterocycles by palladium-catalysed cross-coupling, and finally acylate with the N-methoxycarbonyl valine caps. The gem-difluoro fluorene is what holds the two arms at the fixed spacing that matches the NS5A dimer interface.',
          dependsOnStepId: 'ldv-w1',
          reagentsAndBuffer:
            'Palladium tetrakis(triphenylphosphine) or Pd(dppf)Cl2, boronic ester partners, potassium carbonate in dioxane and water, HATU or EDC for the amide couplings, nitrogen atmosphere',
        },
        {
          id: 'ldv-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Chromatography and salt-free crystallisation of the free base',
          description:
            'Remove residual palladium to the parts-per-million specification and crystallise the free base. Metal scavenging is the step that matters at scale: a cross-coupling route leaves catalyst behind, and the elemental impurity limit is the tightest specification on the molecule.',
          dependsOnStepId: 'ldv-w2',
          reagentsAndBuffer:
            'Thiol-functionalised silica metal scavenger, preparative reversed-phase chromatography, acetone and water crystallisation, ICP-MS for residual palladium',
        },
        {
          id: 'ldv-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Dosing genotype 1a and 1b replicon cell lines',
          description:
            'Apply the compound to Huh-7 cells carrying full-length genotype 1a and 1b replicons. Because the expected EC50 is in the picomolar range, the serial dilution has to span eight or nine logs, and carryover between wells becomes the dominant source of error rather than the biology.',
          dependsOnStepId: 'ldv-w3',
          reagentsAndBuffer:
            'Huh-7 cells with genotype 1a and 1b full-length replicons, DMEM with 10% fetal bovine serum and G418, DMSO stock at 0.5% final, low-binding polypropylene dilution plates',
        },
        {
          id: 'ldv-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'EC50 determination and NS5A resistance panel',
          description:
            'Read the replicon reporter and repeat against site-directed mutants at NS5A positions 24, 28, 30, 31, 58, 92 and 93. Reporting the wild-type EC50 alone overstates the drug: isolates carrying these substitutions after treatment failure show 20-fold to more than 243-fold reduced susceptibility.',
          dependsOnStepId: 'ldv-w4',
          reagentsAndBuffer:
            'Luciferase reporter substrate and lysis buffer, site-directed Q30R, L31M and Y93H replicon mutants, deep sequencing at 1% assay sensitivity for emergent substitutions',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ldv-a1',
        category: 'measured',
        title: 'ION-1: 99% cured in 865 previously untreated genotype 1 patients',
        laymanSummary:
          'Almost everyone was cured, and adding ribavirin or doubling the treatment length changed nothing. Not one person in either twelve-week group stopped because of a side effect.',
        technicalDetails:
          'ION-1 randomised 865 previously untreated genotype 1 patients 1:1:1:1 to ledipasvir-sofosbuvir for 12 weeks, with ribavirin for 12 weeks, for 24 weeks, or with ribavirin for 24 weeks. Sixteen per cent had cirrhosis, 12% were black and 67% had genotype 1a. SVR12 was 99% (95% CI 96 to 100), 97% (94 to 99), 98% (95 to 99) and 99% (97 to 100) respectively. No patient in either 12-week group discontinued for an adverse event. Commonest events were fatigue, headache, insomnia and nausea.',
        evidenceSource: 'Afdhal N et al., N Engl J Med 2014;370:1889-1898 (ION-1, NCT01701401)',
        doi: '10.1056/NEJMoa1402454',
        measuredMetric: 'Sustained virologic response 12 weeks after end of therapy',
        auditFlag: 'verified',
      },
      {
        id: 'ldv-a2',
        category: 'measured',
        title: 'ION-2: 94% cured in patients whom interferon had already failed',
        laymanSummary:
          'These were people for whom the previous generation of treatment had not worked, including some who had already failed a protease inhibitor as well. Twelve weeks cured 94% of them and twenty-four weeks cured 99%.',
        technicalDetails:
          'ION-2 randomised 440 genotype 1 patients who had not achieved SVR on peginterferon and ribavirin, with or without a protease inhibitor, to the same four arms. Twenty per cent had cirrhosis and 79% had genotype 1a. SVR12 was 94% (95% CI 87 to 97) at 12 weeks without ribavirin, 96% (91 to 99) at 12 weeks with it, and 99% (95 to 100) in both 24-week arms. No patient discontinued treatment for an adverse event.',
        evidenceSource: 'Afdhal N et al., N Engl J Med 2014;370:1483-1493 (ION-2, NCT01768286)',
        doi: '10.1056/NEJMoa1316366',
        measuredMetric:
          'Sustained virologic response at 12 weeks in previously treated genotype 1 infection',
        auditFlag: 'verified',
      },
      {
        id: 'ldv-a3',
        category: 'inferred',
        title: 'The eight-week regimen was declared noninferior against a twelve-point margin',
        laymanSummary:
          'ION-3 shortened treatment from twelve weeks to eight. The trial was designed so that anything up to twelve percentage points fewer cures would still have counted as a success. The observed difference was one point, but the margin is what the design was willing to accept.',
        technicalDetails:
          'ION-3 randomised 647 previously untreated genotype 1 patients without cirrhosis to ledipasvir-sofosbuvir for 8 weeks, with ribavirin for 8 weeks, or without ribavirin for 12 weeks. SVR12 was 94% (95% CI 90 to 97), 93% (89 to 96) and 95% (92 to 98). The 12-week rate was 1 percentage point higher than the 8-week rate (97.5% CI -4 to 6) and the ribavirin arm 1 point lower (95% CI -6 to 4). Noninferiority was declared on a prespecified margin of 12 percentage points. Relapse, not breakthrough, accounted for almost all failures, and the label reports higher relapse after 8 weeks in patients with high baseline viral load.',
        evidenceSource: 'Kowdley KV et al., N Engl J Med 2014;370:1879-1888 (ION-3, NCT01851330)',
        doi: '10.1056/NEJMoa1402355',
        inferredClaim:
          'That eight weeks is equivalent to twelve — supported by a one-point observed difference, but licensed by a noninferiority margin wide enough to have accepted a twelve-point loss',
        auditFlag: 'caution',
      },
      {
        id: 'ldv-a4',
        category: 'failed',
        title: 'When the combination fails, it is always the NS5A half that broke',
        laymanSummary:
          'Across the three registration trials, thirty-seven people relapsed. In almost all of them the virus had changed the target ledipasvir binds to. Not one of them had a virus resistant to sofosbuvir.',
        technicalDetails:
          'Pooled resistance analysis across ION-1, ION-2 and ION-3 covered 37 virologic failures, 35 of them relapses. Emergent NS5A resistance-associated substitutions appeared in 55% (16 of 29) of genotype 1a failures — commonly Q30R, Y93H or N, and L31M — and in 88% (7 of 8) of genotype 1b failures, commonly Y93H. Two or more NS5A substitutions were present in 38% (14 of 37). Phenotypically these isolates showed 20-fold to more than 243-fold reduced susceptibility to ledipasvir. The sofosbuvir resistance substitution S282T was not detected in any failure isolate from the phase 3 trials. In the SOLAR-1 and SOLAR-2 transplant and decompensated-disease trials the pattern was the same: NS5A substitutions in 82% of genotype 1a and 86% of genotype 1b failures.',
        evidenceSource:
          'HARVONI United States prescribing information, Microbiology 12.4, pooled ION-1/ION-2/ION-3 resistance analysis (NDA 205834)',
        measuredMetric:
          'Emergent NS5A resistance-associated substitutions and fold-change in susceptibility at virologic failure',
        auditFlag: 'verified',
      },
      {
        id: 'ldv-a5',
        category: 'failed',
        title: 'Genotype coverage is subtype-dependent and the label says so in numbers',
        laymanSummary:
          'Ledipasvir is licensed for genotypes 1, 4, 5 and 6. Within genotype 6 there are subtypes against which it is roughly ten thousand times weaker than against genotype 1b, and one subtype of genotype 4 where the same is true.',
        technicalDetails:
          'Replicon EC50 values in the label run from 0.004 nM for genotype 1b and 0.031 nM for 1a, through a median 0.03 nM for genotype 5a and 0.002 to 0.16 nM across eleven genotype 4 subtypes, to a median 199.6 nM for genotype 4b (range 0.66 to 1,799 nM, N=3) and medians of 60.6 to 430.1 nM for genotype 6 subtypes 6e, 6l, 6n, 6q, 6k and 6m. Genotype 6a and 6h sit at 0.55 and 0.17 nM. The genotype 4, 5 and 6 indications rest on small clinical numbers plus this in vitro panel, and the panel is not uniform across the subtypes the indication names.',
        evidenceSource:
          'HARVONI United States prescribing information, Microbiology 12.4, antiviral activity by genotype and subtype (NDA 205834)',
        measuredMetric: 'Replicon EC50 by HCV genotype and subtype',
        auditFlag: 'caution',
      },
      {
        id: 'ldv-a6',
        category: 'conclusion_shift',
        title: 'Superseded by its own successor within two years',
        laymanSummary:
          'Harvoni was launched in October 2014 as the answer to hepatitis C. In June 2016 the same company launched a combination that works against all six genotypes, and the genotype test that Harvoni required stopped being part of the pathway.',
        technicalDetails:
          'Ledipasvir has no useful activity against genotypes 2 and 3, which together account for a large share of infections outside North America and Western Europe, and its genotype 6 activity is subtype-dependent. Sofosbuvir/velpatasvir, approved under NDA 208341 in June 2016, replaced the NS5A component with one active across genotypes 1 to 6 and reported 99% SVR12 in 624 treated patients across genotypes 1, 2, 4, 5 and 6 in ASTRAL-1. The shift is not that ledipasvir was found wanting on its own terms — ION-1 has not been improved on — but that the clinical question changed from "which genotype is this" to "does it matter", and ledipasvir only has an answer to the first.',
        evidenceSource:
          'Feld JJ et al., N Engl J Med 2015;373:2599-2607 (ASTRAL-1); Drugs@FDA NDA 208341 (EPCLUSA)',
        doi: '10.1056/NEJMoa1512610',
        inferredClaim:
          'That a 99% cure rate settles which regimen should be used — it does not, once a competitor reaches the same rate without needing to know the genotype first',
        auditFlag: 'verified',
      },
      {
        id: 'ldv-a7',
        category: 'inferred',
        title: 'A quarter of patients start with a resistance polymorphism already present',
        laymanSummary:
          'Nearly one patient in four is already carrying virus with a change at one of the positions ledipasvir binds, before any treatment. Most are still cured. Nobody knows what happens to those changes in the long run.',
        technicalDetails:
          'In the pooled phase 3 analysis, 23% (370 of 1,589) of subjects had baseline NS5A polymorphisms at resistance-associated positions 24, 28, 30, 31, 58, 92 or 93, detected by population sequencing or by deep sequencing at a 15% frequency threshold. The label further records that certain NS5A inhibitor resistance-associated substitutions persist for more than a year after treatment failure, and states in as many words that the long-term clinical impact of that persistence is unknown. This is the structural asymmetry of the combination: sofosbuvir resistance is rare and self-limiting because S282T cripples the virus, while NS5A resistance is common at baseline and durable after failure.',
        evidenceSource:
          'HARVONI United States prescribing information, Microbiology 12.4, baseline polymorphisms and persistence of resistance-associated substitutions (NDA 205834)',
        inferredClaim:
          'That resistance is not a practical concern with this class — true for cure rates in the trials, unestablished for what a persistent NS5A substitution means for a person who needs retreatment years later',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'One tablet, taken once a day',
        laymanDesc:
          'Ledipasvir is never sold on its own. It comes fixed in a single tablet with sofosbuvir, so the two halves of the regimen cannot be taken apart or taken at different times.',
        molecularDetail:
          'Fixed-dose combination of 90 mg ledipasvir with 400 mg sofosbuvir. Ledipasvir solubility falls steeply as gastric pH rises, so acid-reducing agents lower exposure — an interaction written into the label and a real mechanism of treatment failure.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It reaches the liver cell, where the virus builds its workshop',
        laymanDesc:
          'Hepatitis C does not copy itself out in the open cytoplasm. It first pulls cell membrane into a folded compartment, and does its copying inside that.',
        molecularDetail:
          'HCV remodels endoplasmic reticulum membrane into the membranous web. NS5A is a membrane-anchored phosphoprotein with no catalytic activity; it organises the replication complex, recruits host factors including PI4KIIIalpha and cyclophilin A, and later hands genomes to the core protein for packaging.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It clamps onto the scaffold protein at two points at once',
        laymanDesc:
          'The molecule is shaped like a dumbbell, with two identical grabbing ends held apart by a rigid bar. NS5A works as a pair, and the spacing of the two ends matches the gap between them.',
        molecularDetail:
          'Ledipasvir is a pseudo-symmetric bis-imidazole built on a gem-difluorofluorene spine, binding across the NS5A dimer interface in domain I. The bivalent geometry is why potency is picomolar: replicon EC50 is 0.031 nM against genotype 1a and 0.004 nM against genotype 1b.',
        iconName: 'Link',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The workshop stops being built and finished virus stops being packaged',
        laymanDesc:
          'With the foreman immobilised, the virus can neither maintain the compartment it copies itself in nor package the copies it has already made.',
        molecularDetail:
          'NS5A inhibition blocks both replication complex formation and virion assembly, which is why NS5A inhibitors produce a faster first-phase viral load decline than either polymerase or protease inhibitors. Combined with sofosbuvir-mediated chain termination, the virus loses the replication compartment and the polymerase in the same dose.',
        iconName: 'Ban',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Undetectable in eight to twelve weeks',
        laymanDesc:
          'For most people without cirrhosis, eight weeks is enough. Twelve is used when there is cirrhosis, or previous treatment that did not work.',
        molecularDetail:
          'SVR12 was 94% at 8 weeks and 95% at 12 weeks in ION-3 in non-cirrhotic previously untreated patients, 99% at 12 weeks in ION-1, and 94% at 12 weeks in previously treated patients in ION-2. Almost all failures are post-treatment relapse rather than on-treatment breakthrough.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'When it fails, the scaffold has changed shape',
        laymanDesc:
          'Failure means the virus altered the protein ledipasvir grabs. Those alterations stick around for years afterwards, and what that means for future treatment is not known.',
        molecularDetail:
          'Emergent NS5A substitutions Q30R, Y93H/N and L31M appeared in 55% of genotype 1a and 88% of genotype 1b failures, with 20-fold to >243-fold reduced susceptibility. S282T, the sofosbuvir escape route, appeared in none. Certain NS5A substitutions persist beyond one year; the label states the long-term clinical impact is unknown.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'ION-1 (NCT01701401)',
        phase: 'Phase 3, randomised, open-label, four-arm',
        sampleSize: 865,
        primaryEndpoint: 'Sustained virologic response 12 weeks after end of therapy',
        endpointMet: true,
        statisticalPValue:
          '99% (95% CI 96 to 100) at 12 weeks without ribavirin; all four arms 97% to 99%',
        unreportedAdverseSignals:
          'Open-label with no placebo or active comparator arm. The trial compares four versions of the same regimen against each other, not against anything else.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'ION-2 (NCT01768286)',
        phase: 'Phase 3, randomised, open-label, previously treated',
        sampleSize: 440,
        primaryEndpoint: 'Sustained virologic response 12 weeks after end of therapy',
        endpointMet: true,
        statisticalPValue:
          '94% (95% CI 87 to 97) at 12 weeks without ribavirin; 99% (95 to 100) at 24 weeks',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'ION-3 (NCT01851330)',
        phase: 'Phase 3, randomised, open-label noninferiority',
        sampleSize: 647,
        primaryEndpoint:
          'Sustained virologic response at 12 weeks, 8-week against 12-week treatment in non-cirrhotic previously untreated patients',
        endpointMet: true,
        statisticalPValue:
          '94% at 8 weeks against 95% at 12 weeks; difference 1 percentage point (97.5% CI -4 to 6), noninferiority margin 12 percentage points',
        unreportedAdverseSignals:
          'The prespecified noninferiority margin was 12 percentage points. A regimen curing 83% would have passed. The observed difference was 1 point, but the design licensed far more.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '99% sustained virologic response at 12 weeks in 865 previously untreated genotype 1 patients in ION-1',
        '94% at 12 weeks and 99% at 24 weeks in 440 patients whom interferon-based therapy had already failed, in ION-2',
        '94% at 8 weeks against 95% at 12 weeks in 647 non-cirrhotic previously untreated patients in ION-3',
        'Replicon EC50 of 0.004 nM against genotype 1b, and 60.6 to 430.1 nM against six genotype 6 subtypes',
        'NS5A resistance substitutions in 55% of genotype 1a and 88% of genotype 1b virologic failures; S282T in none',
      ],
      unsupportedInferences: [
        'That eight weeks equals twelve — the observed gap was one point, but noninferiority was declared against a twelve-point margin',
        'That the genotype 4, 5 and 6 indications are supported the way genotype 1 is; they rest on small clinical numbers plus an in vitro panel that is not uniform across the named subtypes',
        'That persistent NS5A resistance substitutions are clinically unimportant — the label states in as many words that their long-term impact is unknown',
        'That a 99% cure rate means the regimen has been shown to prevent deaths or liver cancers; ION-1, ION-2 and ION-3 all measured virus in blood',
      ],
      whatFailedInitially: [
        'No useful activity against genotypes 2 and 3, which is why a pan-genotypic successor displaced it within two years of launch',
        'Potency falls by four to five orders of magnitude against genotype 6 subtypes 6e, 6l, 6n, 6q, 6k and 6m, and against genotype 4b',
        'Twenty-three per cent of trial patients started with an NS5A polymorphism at a resistance-associated position already present',
        'The one fatal cardiac arrest in the sofosbuvir class amiodarone warning occurred on this combination',
      ],
      realWorldOutcome: [
        'Approved October 2014 under NDA 205834; the first single-tablet, interferon-free, ribavirin-free cure for hepatitis C',
        'Launched at a United States wholesale acquisition cost of US$94,500 for a 12-week course',
        'Now indicated down to age 3, and in decompensated cirrhosis and after liver transplant when combined with ribavirin',
        'Largely replaced in practice by pan-genotypic regimens, which removed genotype testing from the treatment pathway',
      ],
    },
    deliverySystem: {
      type: 'Oral fixed-dose combination tablet with sofosbuvir, and oral pellets for children',
      description:
        'One tablet daily, with or without food. Ledipasvir is not available separately, so every statement about it is a statement about the combination. Pellets exist for children from age 3.',
      safetyProfile:
        'Carries the class boxed warning for hepatitis B virus reactivation, including fulminant hepatitis, hepatic failure and death. Coadministration with amiodarone is not recommended: the single fatal cardiac arrest in the class warning occurred on this combination. Exposure falls when gastric pH rises, so acid-reducing agents are a labelled interaction. Commonest trial adverse events were fatigue, headache, insomnia and nausea; no patient in the 12-week arms of ION-1 or in any arm of ION-2 discontinued for an adverse event.',
    },
    commonQuestions: [
      {
        q: 'Can I take ledipasvir on its own?',
        a: 'No. It has never been sold on its own and has never been tested on its own in a registration trial. It exists as one half of a fixed-dose tablet with sofosbuvir. There is a structural reason for that, visible in the resistance data: across the three registration trials every virologic failure that could be sequenced showed changes in NS5A, the protein ledipasvir binds, and none showed the substitution that defeats sofosbuvir. Ledipasvir on its own would be a single target with a common escape route already present in about a quarter of patients before treatment starts.',
      },
      {
        q: 'Why do I keep reading that Harvoni is out of date?',
        a: 'Because of what it cannot do rather than what it does. Nothing has improved on 99% in genotype 1. But ledipasvir has essentially no activity against genotypes 2 and 3, and its activity against several genotype 6 subtypes is four to five orders of magnitude weaker than against genotype 1b. That means the genotype has to be identified before treatment can be chosen. Sofosbuvir/velpatasvir, approved twenty months later, cures across all six genotypes, so the test stops being necessary. In a health system, removing a required test before treatment is worth more than a percentage point of cure rate.',
      },
      {
        q: 'Is eight weeks really as good as twelve?',
        a: 'In ION-3 the eight-week arm cured 94% and the twelve-week arm 95%, a difference of one percentage point. That is the number to remember. The thing worth knowing about the design is that it was set up to declare success if eight weeks came within twelve percentage points of twelve weeks — so a regimen curing 83% would have been called noninferior. The observed result was far better than the margin required, but the margin is what the trial licensed, and it is wide. Eight weeks was also studied only in people without cirrhosis who had never been treated before.',
        auditNote:
          'A noninferiority margin is a design choice, not a finding. Quoting the result without the margin makes the evidence look tighter than the trial was built to be.',
      },
      {
        q: 'Does heartburn medication stop it working?',
        a: 'It can lower how much drug gets into the blood. Ledipasvir dissolves well in an acidic stomach and poorly in a less acidic one, so proton pump inhibitors, H2 blockers and antacids all reduce absorption. This is a labelled interaction with specific instructions, and it includes acid reducers bought over the counter, which people often do not think to mention. It is a mechanism of treatment failure that has nothing to do with the virus at all, and it is one of the practical reasons velpatasvir-based regimens, which are less pH-sensitive, became easier to use.',
      },
      {
        q: 'If it fails, can I be treated again?',
        a: 'Usually yes, with a different combination, and the resistance data is the reason the choice matters. When this regimen fails, the virus that comes back has almost always changed the NS5A protein — most often at positions 30, 31 or 93 — and those changes reduce susceptibility to ledipasvir by twenty-fold to more than two hundred-fold. The label records that some of these changes persist for more than a year and states that the long-term clinical impact is unknown. What does not happen is sofosbuvir resistance: the substitution that would cause it was not found in a single failure isolate in the phase 3 programme.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Afdhal N et al. Ledipasvir and sofosbuvir for untreated HCV genotype 1 infection. N Engl J Med 2014;370:1889-1898 (ION-1)',
        identifier: '10.1056/NEJMoa1402454',
        kind: 'doi',
      },
      {
        label:
          'Afdhal N et al. Ledipasvir and sofosbuvir for previously treated HCV genotype 1 infection. N Engl J Med 2014;370:1483-1493 (ION-2)',
        identifier: '10.1056/NEJMoa1316366',
        kind: 'doi',
      },
      {
        label:
          'Kowdley KV et al. Ledipasvir and sofosbuvir for 8 or 12 weeks for chronic HCV without cirrhosis. N Engl J Med 2014;370:1879-1888 (ION-3)',
        identifier: '10.1056/NEJMoa1402355',
        kind: 'doi',
      },
      {
        label:
          'Feld JJ et al. Sofosbuvir and velpatasvir for HCV genotype 1, 2, 4, 5, and 6 infection. N Engl J Med 2015;373:2599-2607 (ASTRAL-1)',
        identifier: '10.1056/NEJMoa1512610',
        kind: 'doi',
      },
      {
        label:
          'Rosenthal ES, Graham CS. Price and affordability of direct-acting antiviral regimens for hepatitis C virus in the United States. Infect Agent Cancer 2016;11:24',
        identifier: '10.1186/s13027-016-0071-z',
        kind: 'doi',
      },
      { label: 'ION-1: ledipasvir/sofosbuvir in untreated genotype 1', identifier: 'NCT01701401', kind: 'nct' },
      { label: 'ION-2: ledipasvir/sofosbuvir in previously treated genotype 1', identifier: 'NCT01768286', kind: 'nct' },
      { label: 'ION-3: 8 weeks against 12 weeks without cirrhosis', identifier: 'NCT01851330', kind: 'nct' },
      {
        label:
          'Drugs@FDA: HARVONI (ledipasvir and sofosbuvir), NDA 205834, Gilead Sciences — original approval 10 October 2014',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=205834',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 67505836 — ledipasvir structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/67505836',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 3. Velpatasvir — the NS5A inhibitor that made the genotype test unnecessary, with one
  //    documented hole: genotype 3 plus cirrhosis plus a baseline Y93H, where 40% failed.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'velpatasvir',
    name: 'Velpatasvir',
    tradeName: 'Epclusa / Vosevi',
    sponsor: 'Gilead Sciences Inc.',
    targetGene: 'HCV NS5A — a hepatitis C viral gene, not a human one',
    targetProtein: 'Hepatitis C virus NS5A phosphoprotein, domain I, across genotypes 1 to 6',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2016,
    indication:
      'Chronic hepatitis C virus genotype 1, 2, 3, 4, 5 or 6 infection in adults and children aged 3 years and older, as a fixed-dose combination with sofosbuvir, in patients without cirrhosis or with compensated cirrhosis, and with ribavirin in decompensated cirrhosis',
    patientFriendlyIndication: 'Long-standing hepatitis C infection, any of the six genotypes',
    anatomicalSite:
      'Hepatocyte cytoplasm — the membranous web where NS5A assembles the viral replication complex',
    conditionContext: {
      conditionExplainer:
        'Hepatitis C exists as six genetic families. Until 2016 the family had to be identified by a laboratory test before treatment could be chosen, because the available drugs each covered some families and not others. That test is a step, a cost and a delay, and in many parts of the world it is simply not available.',
      whyItMatters:
        'Velpatasvir is the molecule that removed the test. Its clinical significance is less about the cure rate, which was already high, than about how much has to be known before treatment can begin — which is what decides whether a country can treat people at scale.',
      whoTakesThis:
        'Adults and children aged 3 and over with any genotype of chronic hepatitis C, including those with compensated cirrhosis, and with decompensated cirrhosis when ribavirin is added. Velpatasvir is not sold on its own.',
      clinicalGoals:
        'Sustained virologic response at 12 weeks across all six genotypes with a single regimen and a single duration.',
    },
    oneSentenceVerdict:
      'A pan-genotypic NS5A inhibitor active at single-digit picomolar concentrations against every genotype tested, which combined with sofosbuvir cured 99% of 624 patients against 0% of 116 on placebo in ASTRAL-1 and beat sofosbuvir-ribavirin outright in genotype 3 (95% against 80%, p<0.001) — with one documented hole, genotype 3 with cirrhosis and a baseline Y93H substitution, where 40% failed.',
    laymanHowItWorks:
      'Hepatitis C builds itself a private workshop out of folded cell membrane, and a viral protein called NS5A runs it. Velpatasvir jams NS5A. What makes it different from the NS5A blocker that came before it is shape tolerance: the same molecule fits the version of NS5A carried by all six genetic families of the virus, so nobody needs to find out which family a patient has before starting treatment.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 90,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$866.40 per tablet, median across the two listed products at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'What pharmacies pay to acquire the drug, not what a patient is charged: United States list prices are not published and net prices after rebates are confidential by contract. No markup is stated because no per-dose cost of production has been published for velpatasvir, and a markup computed against an estimate this file cannot check would be a manufactured number.',
      synthesisComplexity: 'High',
      costSource: {
        label:
          'Nearest published cost-of-production analysis for this drug class: Hill A, Simmons B, Gotham D, Fortunak J. Rapid reductions in prices for generic sofosbuvir and daclatasvir to treat hepatitis C. J Virus Erad 2016;2:28-31. It covers sofosbuvir and daclatasvir and does NOT cover velpatasvir, which is why the synthesis cost field on this page is empty.',
        identifier: '10.1016/S2055-6640(20)30691-9',
        kind: 'doi',
      },
      priceSource: {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey, brand listing effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    },
    substitutes: {
      summary:
        'The realistic alternative is glecaprevir/pibrentasvir, the other pan-genotypic regimen, and the choice between them turns on two things neither trial measured directly: kidney function and liver decompensation. Velpatasvir with sofosbuvir is the one usable when the liver has decompensated; glecaprevir with pibrentasvir is the one usable when the kidneys have failed. Nothing sold as a food or supplement clears hepatitis C.',
      conventionalRx: [
        {
          name: 'Glecaprevir/pibrentasvir (Mavyret)',
          class: 'NS3/4A protease inhibitor plus pan-genotypic NS5A inhibitor',
          howItCompares:
            'Also pan-genotypic, and treats most previously untreated patients in 8 weeks rather than 12. Contains no nucleotide, so it is usable across the full range of kidney function including dialysis. Contraindicated in decompensated cirrhosis, where this regimen is not.',
          typicalCost:
            'US$152.92 per pibrentasvir-containing tablet at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: 8 weeks, no renal restriction. Cons: three tablets daily; protease inhibitors are not usable in Child-Pugh B or C liver disease.',
        },
        {
          name: 'Ledipasvir/sofosbuvir (Harvoni)',
          class: 'Genotype-restricted NS5A inhibitor plus the same nucleotide backbone',
          howItCompares:
            'The immediate predecessor from the same company, with the same backbone and a genotype-1-focused NS5A inhibitor. Equally effective in genotype 1 — 99% in ION-1 — and of little use in genotypes 2 and 3, which is precisely the gap velpatasvir was made to close.',
          typicalCost: 'US$94,500 per 12-week course at United States wholesale acquisition cost',
          prosAndCons:
            'Pros: 8 weeks in uncomplicated genotype 1. Cons: requires genotyping first; no genotype 2 or 3 activity; more pH-sensitive absorption.',
        },
        {
          name: 'Sofosbuvir/velpatasvir/voxilaprevir (Vosevi)',
          class: 'The same two drugs plus an NS3/4A protease inhibitor',
          howItCompares:
            'The retreatment regimen for people in whom an NS5A inhibitor has already failed. It exists because NS5A resistance substitutions persist after failure, so adding a third mechanism is the way back in.',
          typicalCost:
            'Not stated here — no per-tablet United States pharmacy acquisition cost for this combination was verified for this page',
          prosAndCons:
            'Pros: covers prior NS5A failure. Cons: three mechanisms means three interaction profiles, and the protease inhibitor rules out decompensated cirrhosis.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Ask whether you have been tested for hepatitis B first',
          action: 'Confirm HBsAg and anti-HBc were measured before the first tablet.',
          patientImpact:
            'Clearing hepatitis C can reactivate a dormant hepatitis B infection, and cases across this drug class have ended in fulminant hepatitis, liver failure and death.',
          clinicalPrecaution:
            'The boxed warning applies to the whole direct-acting antiviral class, and covers people whose hepatitis B looks resolved as well as people who are HBsAg positive.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'C[C@H]1CC[C@H](N1C(=O)[C@H](C(C)C)NC(=O)OC)C2=NC3=C(N2)C=CC4=CC5=C(C=C43)OCC6=C5C=CC(=C6)C7=CN=C(N7)[C@@H]8C[C@@H](CN8C(=O)[C@@H](C9=CC=CC=C9)NC(=O)OC)COC',
      chemicalFormula: 'C49H54N8O8',
      molecularWeight: '883.00 g/mol',
      targetReceptorAffinity:
        'Replicon EC50 values of 0.014 nM against genotype 1a, 0.016 nM against 1b, 0.005 to 0.016 nM against 2a, 0.002 to 0.006 nM against 2b and 0.004 nM against 3a. The narrow spread across genotypes is the whole point of the molecule: its predecessor ledipasvir varies by more than four orders of magnitude across the same panel.',
      structureSource: {
        label: 'PubChem CID 67683363 (velpatasvir) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/67683363',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'vel-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Stereochemical control of the four proline-type centres',
          description:
            'Verify configuration at the methylpyrrolidine, the methoxymethyl pyrrolidine and both amino-acid caps before assembly. Velpatasvir carries an asymmetric pair of arms rather than a symmetric one, and the two ends are chemically distinct, so a stereochemical error at one end does not announce itself in a symmetry check.',
          reagentsAndBuffer:
            'Chiral HPLC with cellulose stationary phase, 1H and 13C NMR in DMSO-d6, N-methoxycarbonyl valine and phenylglycine reference standards',
        },
        {
          id: 'vel-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Assembly of the tetracyclic benzofuran-fused core and both amide caps',
          description:
            'Construct the fused tetracyclic indole-benzofuran spine, then couple the imidazole and benzimidazole arms and acylate with the two different carbamate-protected amino acids. The asymmetric arm design is what buys genotype tolerance: it does not depend on both ends contacting an identical pocket.',
          dependsOnStepId: 'vel-w1',
          reagentsAndBuffer:
            'Palladium cross-coupling catalyst with phosphine ligand, potassium carbonate in dioxane and water, HATU or T3P amide coupling reagent, N,N-diisopropylethylamine, anhydrous dimethylformamide under nitrogen',
        },
        {
          id: 'vel-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Metal scavenging and crystallisation of the free base',
          description:
            'Reduce residual palladium to the elemental impurity specification and crystallise. The molecule is large, lipophilic and poorly water-soluble, so the amorphous solid dispersion used in the tablet is decided at this stage, not later.',
          dependsOnStepId: 'vel-w2',
          reagentsAndBuffer:
            'Thiol-functionalised silica scavenger, preparative reversed-phase chromatography, ethanol and water crystallisation, ICP-MS for residual palladium, X-ray powder diffraction for solid form',
        },
        {
          id: 'vel-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Parallel dosing of replicons from all six genotypes',
          description:
            'Dose Huh-7 cells carrying full-length or chimeric replicons encoding NS5A from genotypes 1a, 1b, 2a, 2b, 3a, 4a, 5a and 6a in the same experiment. Running the genotypes in parallel rather than in separate campaigns is the only way a pan-genotypic claim can be made from the data, because between-run variation is larger than the between-genotype differences being measured.',
          dependsOnStepId: 'vel-w3',
          reagentsAndBuffer:
            'Huh-7 cell lines with genotype-specific full-length and chimeric NS5A replicons, DMEM with 10% fetal bovine serum and G418, DMSO stock at 0.5% final concentration',
        },
        {
          id: 'vel-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'EC50 panel and the Y93H counter-screen in genotype 3',
          description:
            'Read the replicon reporters and repeat against a genotype 3a replicon carrying Y93H. This is not an optional extra: 6% of genotype 3 clinical isolates carry Y93H at baseline, and in patients who also had compensated cirrhosis, 40% of those treated for 12 weeks failed.',
          dependsOnStepId: 'vel-w4',
          reagentsAndBuffer:
            'Luciferase reporter substrate and lysis buffer, site-directed genotype 3a Y93H and A30K replicon mutants, deep sequencing at a 15% frequency threshold for baseline polymorphism detection',
        },
      ],
    },
    keyAudits: [
      {
        id: 'vel-a1',
        category: 'measured',
        title: 'ASTRAL-1: 99% cured against 0% on placebo, across five genotypes at once',
        laymanSummary:
          'Six hundred and twenty-four people with five different genetic families of hepatitis C took the drug; six hundred and twenty-two were cured. One hundred and sixteen took a dummy tablet; none were cured. Two relapses in total, both genotype 1.',
        technicalDetails:
          'ASTRAL-1 was a phase 3, double-blind, placebo-controlled trial in untreated and previously treated patients with genotype 1, 2, 4, 5 or 6, including compensated cirrhosis. Genotypes 1, 2, 4 and 6 were randomised 5:1 to sofosbuvir-velpatasvir or matching placebo for 12 weeks; genotype 5 was assigned to active treatment because of low regional prevalence. Of 624 treated, 34% had genotype 1a, 19% 1b, 17% genotype 2, 19% genotype 4, 6% genotype 5 and 7% genotype 6; 19% had cirrhosis and 32% had been treated before. SVR12 was 99% (95% CI 98 to greater than 99), with two virologic relapses, both genotype 1. None of the 116 placebo patients achieved SVR. Serious adverse events occurred in 15 patients (2%) on treatment and none on placebo.',
        evidenceSource: 'Feld JJ et al., N Engl J Med 2015;373:2599-2607 (ASTRAL-1, NCT02201940)',
        doi: '10.1056/NEJMoa1512610',
        measuredMetric:
          'Sustained virologic response 12 weeks after end of therapy, against matching placebo',
        auditFlag: 'verified',
      },
      {
        id: 'vel-a2',
        category: 'measured',
        title: 'ASTRAL-3: superior to the previous standard in genotype 3, 95% against 80%',
        laymanSummary:
          'Genotype 3 was the family the earlier drugs handled worst. Against the regimen it replaced, this one cured fifteen percentage points more people, and in half the time.',
        technicalDetails:
          'ASTRAL-3 randomised 552 patients with genotype 3, previously treated and untreated including compensated cirrhosis, 1:1 to sofosbuvir-velpatasvir for 12 weeks (277 patients) or sofosbuvir plus weight-based ribavirin for 24 weeks (275 patients). SVR12 was 95% (95% CI 92 to 98) against 80% (95% CI 75 to 85), superiority p<0.001. In the parallel ASTRAL-2 trial in genotype 2, 134 patients on sofosbuvir-velpatasvir reached 99% (95% CI 96 to 100) against 94% (88 to 97) on sofosbuvir-ribavirin in 132 patients, superiority p=0.02. Commonest adverse events across both were fatigue, headache, nausea and insomnia.',
        evidenceSource:
          'Foster GR et al., N Engl J Med 2015;373:2608-2617 (ASTRAL-2 NCT02220998, ASTRAL-3 NCT02201953)',
        doi: '10.1056/NEJMoa1512612',
        measuredMetric:
          'Sustained virologic response at 12 weeks against active comparator, superiority tested',
        auditFlag: 'verified',
      },
      {
        id: 'vel-a3',
        category: 'failed',
        title: 'Genotype 3 with cirrhosis and a baseline Y93H: two in five failed',
        laymanSummary:
          'The pan-genotypic claim has one documented hole. About one genotype 3 patient in sixteen starts with a particular change in the target protein. If they also have cirrhosis, twelve weeks of treatment fails four times in ten.',
        technicalDetails:
          'In a pooled analysis of genotype 3 trials the baseline NS5A Y93H polymorphism was present in 6% (104 of 1,842) of subjects. Among genotype 3 subjects with Y93H treated with sofosbuvir-velpatasvir for 12 weeks, 7% (2 of 28) without cirrhosis relapsed, while 40% (6 of 15) with compensated cirrhosis had virologic failure — five relapses and one on-treatment failure. In ASTRAL-3 itself, 4 of the 56 genotype 3 subjects with any baseline NS5A resistance-associated polymorphism relapsed (3 with Y93H, 1 with A30K), and 20% (3 of 15) of all genotype 3 subjects carrying Y93H relapsed. By contrast, baseline polymorphisms did not affect relapse in genotypes 2, 4, 5 or 6, where every such subject achieved SVR12, and all 77 subjects with baseline NS5B nucleoside-inhibitor polymorphisms achieved SVR12.',
        evidenceSource:
          'EPCLUSA United States prescribing information, Microbiology 12.4, effect of baseline HCV polymorphisms on treatment response (NDA 208341)',
        measuredMetric:
          'Virologic failure rate in genotype 3 with baseline NS5A Y93H, stratified by cirrhosis',
        auditFlag: 'caution',
      },
      {
        id: 'vel-a4',
        category: 'inferred',
        title:
          'Adding ribavirin in decompensated cirrhosis rests on a difference that was not significant',
        laymanSummary:
          'In the decompensated-cirrhosis trial, twelve weeks with ribavirin cured 94% and twelve weeks without cured 83%. That eleven-point gap is the reason ribavirin is added. The trial itself found no significant difference between the three arms.',
        technicalDetails:
          'ASTRAL-4 randomised 267 patients with Child-Pugh-Turcotte class B decompensated cirrhosis 1:1:1 to sofosbuvir-velpatasvir for 12 weeks, the same plus ribavirin for 12 weeks, or sofosbuvir-velpatasvir for 24 weeks. SVR12 was 83% (95% CI 74 to 90), 94% (87 to 98) and 86% (77 to 92) respectively. The paper states that post hoc analysis did not detect any significant differences among the three groups. Serious adverse events occurred in 19%, 16% and 18%. Anaemia occurred in 31% of the patients receiving ribavirin. The trial was open-label with no untreated comparator, in a population where spontaneous clinical change is common.',
        evidenceSource: 'Curry MP et al., N Engl J Med 2015;373:2618-2628 (ASTRAL-4, NCT02201901)',
        doi: '10.1056/NEJMoa1512614',
        inferredClaim:
          'That ribavirin adds efficacy in decompensated cirrhosis — an eleven-point numerical gap in a three-arm trial whose own post hoc analysis found no significant difference, bought at 31% anaemia',
        auditFlag: 'caution',
      },
      {
        id: 'vel-a5',
        category: 'inferred',
        title: '"Pan-genotypic" is a statement about laboratory potency plus uneven trial numbers',
        laymanSummary:
          'The word means the drug works against all six families. That is well established for genotypes 1, 2 and 3, which had hundreds of patients each. Genotype 5 had thirty-five patients and was not randomised at all.',
        technicalDetails:
          'ASTRAL-1 enrolled genotype 5 patients into the active arm without randomisation because of low prevalence in the study regions, and genotype 5 made up 6% of the 624 treated, roughly 35 people. Genotype 6 made up 7%. The laboratory basis is uniform — replicon EC50 values of 0.014, 0.016, 0.005 to 0.016, 0.002 to 0.006 and 0.004 nM for genotypes 1a, 1b, 2a, 2b and 3a — and the clinical basis is not uniform, because the rarer genotypes are rare. This is not a criticism of the drug; it is a statement of which parts of the claim rest on hundreds of randomised patients and which rest on tens of unrandomised ones.',
        evidenceSource:
          'Feld JJ et al., N Engl J Med 2015;373:2599-2607; EPCLUSA prescribing information Microbiology 12.4, Table 10',
        doi: '10.1056/NEJMoa1512610',
        inferredClaim:
          'That the evidence for genotypes 5 and 6 is the same strength as for genotypes 1, 2 and 3 — the potency data are comparable, the clinical data are not',
        auditFlag: 'caution',
      },
      {
        id: 'vel-a6',
        category: 'inferred',
        title: 'Every ASTRAL endpoint is a blood test, not a clinical outcome',
        laymanSummary:
          'All four trials measured whether virus could be detected twelve weeks after the last tablet. None of them counted deaths, liver cancers or transplants. The link between the two is inferred.',
        technicalDetails:
          'The 2017 Cochrane review of direct-acting antivirals pooled 138 randomised trials in 25,232 participants and found no usable randomised data on hepatitis C-related morbidity, hepatocellular carcinoma, ascites, variceal bleeding or hepatic encephalopathy, and mortality data from only 11 trials. ASTRAL-4 is the trial where this matters most, because its population — Child-Pugh class B cirrhosis — is the one whose clinical trajectory a cure would most plausibly change, and it was open-label with no untreated arm and a 12-week virological endpoint.',
        evidenceSource: 'Jakobsen JC et al., Cochrane Database Syst Rev 2017;9:CD012143',
        doi: '10.1002/14651858.CD012143.pub3',
        inferredClaim:
          'That a 99% sustained virologic response rate translates into fewer deaths, decompensations and liver cancers — plausible, supported by cohort follow-up, and not measured in these trials',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'One tablet, once a day, whatever the genotype',
        laymanDesc:
          'The same tablet is used for all six families of the virus, so the laboratory test that used to come first is no longer needed to choose treatment.',
        molecularDetail:
          'Fixed-dose combination of 100 mg velpatasvir with 400 mg sofosbuvir. Velpatasvir is formulated as an amorphous solid dispersion because the crystalline free base is too poorly soluble to absorb reliably.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Into the liver cell, where the viral workshop is built',
        laymanDesc:
          'Hepatitis C folds a piece of the cell’s own membrane into a private compartment and copies itself inside it, hidden from much of the cell’s surveillance.',
        molecularDetail:
          'HCV remodels endoplasmic reticulum into the membranous web. NS5A is a membrane-anchored phosphoprotein with no catalytic activity, organising the replication complex and later directing genome packaging.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It grips a part of the protein that all six families share',
        laymanDesc:
          'The six genetic families of the virus differ in most of their proteins. Velpatasvir was designed against the part of NS5A that varies least, which is why one molecule fits all of them.',
        molecularDetail:
          'Velpatasvir binds domain I of the NS5A dimer. Unlike the symmetric ledipasvir, its two arms are chemically different, which relaxes the geometric requirement on the binding surface. Replicon EC50 values sit between 0.002 and 0.016 nM across genotypes 1a, 1b, 2a, 2b and 3a.',
        iconName: 'Link',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The workshop stops working and copying is blocked as well',
        laymanDesc:
          'With NS5A jammed and the copying enzyme separately blocked by sofosbuvir, the virus loses the place it copies itself and the machine it copies itself with in the same dose.',
        molecularDetail:
          'NS5A inhibition blocks replication complex formation and virion assembly; sofosbuvir’s triphosphate metabolite terminates nascent RNA chains. The two mechanisms have no shared resistance pathway, which is why the combination is durable.',
        iconName: 'Ban',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Undetectable at twelve weeks in about 99 of every 100 people',
        laymanDesc:
          'Twelve weeks of treatment, one duration for everyone without cirrhosis or with compensated cirrhosis, whatever the genotype.',
        molecularDetail:
          'SVR12 was 99% in ASTRAL-1 across genotypes 1, 2, 4, 5 and 6, 99% in genotype 2 in ASTRAL-2 and 95% in genotype 3 in ASTRAL-3, against 0% on placebo in the one placebo-controlled arm.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Where it does not reach',
        laymanDesc:
          'One combination of circumstances defeats it: genotype 3, with cirrhosis, in someone whose virus already carries a specific change at position 93. Two in five of those failed.',
        molecularDetail:
          'Baseline NS5A Y93H is present in 6% of genotype 3 isolates. With Y93H and compensated cirrhosis, 40% (6 of 15) failed 12 weeks of treatment, against 7% (2 of 28) with Y93H and no cirrhosis. Baseline polymorphisms did not affect outcome in genotypes 2, 4, 5 or 6.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'ASTRAL-1 (NCT02201940)',
        phase: 'Phase 3, double-blind, placebo-controlled',
        sampleSize: 740,
        primaryEndpoint: 'Sustained virologic response 12 weeks after end of therapy',
        endpointMet: true,
        statisticalPValue:
          '99% (95% CI 98 to >99) on treatment against 0% in 116 placebo patients; two relapses, both genotype 1',
        unreportedAdverseSignals:
          'Genotype 5 patients were assigned to the active arm without randomisation because of low regional prevalence, so the placebo comparison does not cover that genotype.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'ASTRAL-2 (NCT02220998)',
        phase: 'Phase 3, randomised, open-label, active-controlled superiority',
        sampleSize: 266,
        primaryEndpoint:
          'Sustained virologic response at 12 weeks in genotype 2, against sofosbuvir plus ribavirin',
        endpointMet: true,
        statisticalPValue: '99% (95% CI 96 to 100) against 94% (88 to 97), P = 0.02',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'ASTRAL-3 (NCT02201953)',
        phase: 'Phase 3, randomised, open-label, active-controlled superiority',
        sampleSize: 552,
        primaryEndpoint:
          'Sustained virologic response at 12 weeks in genotype 3, against 24 weeks of sofosbuvir plus ribavirin',
        endpointMet: true,
        statisticalPValue: '95% (95% CI 92 to 98) against 80% (75 to 85), P < 0.001',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'ASTRAL-4 (NCT02201901)',
        phase: 'Phase 3, randomised, open-label, three-arm, decompensated cirrhosis',
        sampleSize: 267,
        primaryEndpoint: 'Sustained virologic response 12 weeks after end of therapy',
        endpointMet: true,
        statisticalPValue:
          '83% at 12 weeks, 94% at 12 weeks with ribavirin, 86% at 24 weeks; post hoc analysis found no significant difference among the three groups',
        unreportedAdverseSignals:
          'Serious adverse events in 16% to 19% across arms, and anaemia in 31% of those given ribavirin. Open-label with no untreated comparator in a population whose clinical course changes on its own.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '99% sustained virologic response in 624 treated patients against 0% in 116 on matching placebo in ASTRAL-1',
        '95% against 80% in genotype 3, superiority over sofosbuvir-ribavirin, p<0.001, in 552 randomised patients',
        '99% against 94% in genotype 2, superiority over sofosbuvir-ribavirin, p=0.02, in 266 randomised patients',
        '40% virologic failure (6 of 15) in genotype 3 patients with compensated cirrhosis and a baseline Y93H substitution',
        'Replicon EC50 between 0.002 and 0.016 nM across genotypes 1a, 1b, 2a, 2b and 3a',
      ],
      unsupportedInferences: [
        'That the genotype 5 and 6 evidence is as strong as the genotype 1, 2 and 3 evidence — those arms had tens of patients and genotype 5 was not randomised',
        'That ribavirin adds efficacy in decompensated cirrhosis; ASTRAL-4 found no significant difference between its three arms on its own post hoc analysis',
        'That 99% sustained virologic response has been shown to reduce deaths, decompensations or liver cancers — no trial here measured any of those',
        'That "pan-genotypic" means uniform: it does not cover genotype 3 with cirrhosis and baseline Y93H, where the label reports 40% failure',
      ],
      whatFailedInitially: [
        'Two of 624 patients in ASTRAL-1 relapsed, both genotype 1',
        'Twelve weeks without ribavirin in decompensated cirrhosis reached only 83%, the lowest figure in the programme',
        'Anaemia in 31% of the decompensated-cirrhosis patients given ribavirin, in a group least able to tolerate it',
        'Genotype 3 with cirrhosis and Y93H failed at 40%, the one documented hole in the pan-genotypic claim',
      ],
      realWorldOutcome: [
        'Approved June 2016 under NDA 208341 as the first pan-genotypic single-tablet regimen, removing genotype testing from the treatment pathway',
        'Now indicated down to age 3, and in decompensated cirrhosis when combined with ribavirin',
        'US$866.40 per tablet at United States pharmacy acquisition cost, brand only, with no generic listing in the CMS survey',
        'Carries the class boxed warning for hepatitis B reactivation added across all direct-acting antivirals in 2016',
      ],
    },
    deliverySystem: {
      type: 'Oral fixed-dose combination tablet with sofosbuvir, and oral pellets for children',
      description:
        'One tablet daily with or without food. Velpatasvir is not sold separately, so every claim on this page is a claim about the combination. Velpatasvir is delivered as an amorphous solid dispersion because the crystalline form does not dissolve well enough to absorb reliably.',
      safetyProfile:
        'Class boxed warning for hepatitis B virus reactivation, including fulminant hepatitis, hepatic failure and death. Serious adverse events were 2% on treatment and 0% on placebo in ASTRAL-1; in decompensated cirrhosis they ran 16% to 19% across arms, reflecting the population rather than the drug. Commonest events are fatigue, headache, nausea and insomnia. Adding ribavirin brings anaemia, seen in 31% of ASTRAL-4 patients who received it. The amiodarone bradycardia warning applies, as it does to every sofosbuvir-containing regimen.',
    },
    commonQuestions: [
      {
        q: 'Do I still need a genotype test?',
        a: 'Not to choose this regimen, and that is the main thing velpatasvir changed. The same tablet and the same twelve weeks are used for all six genetic families in people without cirrhosis or with compensated cirrhosis. There is one place where knowing the genotype still helps: genotype 3 with cirrhosis, where a baseline resistance test looking for the Y93H substitution identifies a group in which twelve weeks failed 40% of the time. Outside that combination of circumstances, baseline polymorphisms did not change outcomes in the trials at all.',
      },
      {
        q: 'What does "pan-genotypic" actually mean here?',
        a: 'It means the laboratory potency is nearly the same against all six families — replicon activity between two and sixteen picomolar for genotypes 1a, 1b, 2a, 2b and 3a — and that the trials covered all six. It does not mean the clinical evidence is equally deep for each. Genotypes 1, 2 and 3 were studied in hundreds of randomised patients. Genotype 5 was about thirty-five people who were not randomised at all, because the genotype is too rare in the study regions to fill a randomised arm. The drug is very probably as good there; the evidence behind that sentence is thinner, and this page says which is which.',
        auditNote:
          'Rare-genotype arms are a structural problem, not a company failing. There is no way to randomise a genotype that does not exist in the countries where the trial runs.',
      },
      {
        q: 'Why is ribavirin added when the liver has decompensated?',
        a: 'Because of an eleven-point numerical difference in one trial. ASTRAL-4 put 267 people with Child-Pugh class B cirrhosis into three arms: twelve weeks alone cured 83%, twelve weeks with ribavirin cured 94%, twenty-four weeks alone cured 86%. The paper reports that post hoc analysis found no significant difference between the three groups. Practice followed the highest number. Ribavirin is not free: 31% of the patients who took it in that trial became anaemic, in a population with the least reserve to spare. This is a reasonable clinical judgement built on a difference the trial itself could not distinguish from chance, and it is worth knowing that is what it is.',
      },
      {
        q: 'What is the Y93H thing?',
        a: 'A single amino acid change at position 93 of the NS5A protein — the protein velpatasvir binds. About 6% of people with genotype 3 are already carrying virus with that change before any treatment, from a pooled analysis of 1,842 patients. On its own it matters little: 7% of genotype 3 patients with Y93H and no cirrhosis relapsed. Combined with cirrhosis it matters a great deal: 40%, six of fifteen, failed. It is the one place where the single-regimen-for-everyone approach breaks down, and it is written into the label rather than hidden.',
      },
      {
        q: 'Has it been shown to stop people dying of liver disease?',
        a: 'No trial on this page measured that. All four ASTRAL trials measured virus in blood twelve weeks after the last tablet. The Cochrane review that pooled 138 randomised trials of this whole drug class across 25,232 people found no usable randomised data on liver cancer, ascites, variceal bleeding or encephalopathy, and mortality data from only eleven trials. The expectation that curing the infection prevents those outcomes rests on the mechanism and on observational follow-up, both of which are reasonable, and neither of which is the same as a randomised comparison. ASTRAL-4 is where this bites hardest, because Child-Pugh class B cirrhosis is exactly the population whose future a cure would most plausibly change, and that trial had no untreated arm.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Feld JJ et al. Sofosbuvir and velpatasvir for HCV genotype 1, 2, 4, 5, and 6 infection. N Engl J Med 2015;373:2599-2607 (ASTRAL-1)',
        identifier: '10.1056/NEJMoa1512610',
        kind: 'doi',
      },
      {
        label:
          'Foster GR et al. Sofosbuvir and velpatasvir for HCV genotype 2 and 3 infection. N Engl J Med 2015;373:2608-2617 (ASTRAL-2 and ASTRAL-3)',
        identifier: '10.1056/NEJMoa1512612',
        kind: 'doi',
      },
      {
        label:
          'Curry MP et al. Sofosbuvir and velpatasvir for HCV in patients with decompensated cirrhosis. N Engl J Med 2015;373:2618-2628 (ASTRAL-4)',
        identifier: '10.1056/NEJMoa1512614',
        kind: 'doi',
      },
      {
        label:
          'Jakobsen JC et al. Direct-acting antivirals for chronic hepatitis C. Cochrane Database Syst Rev 2017;9:CD012143',
        identifier: '10.1002/14651858.CD012143.pub3',
        kind: 'doi',
      },
      {
        label:
          'Hill A, Simmons B, Gotham D, Fortunak J. Rapid reductions in prices for generic sofosbuvir and daclatasvir to treat hepatitis C. J Virus Erad 2016;2:28-31',
        identifier: '10.1016/S2055-6640(20)30691-9',
        kind: 'doi',
      },
      { label: 'ASTRAL-1: placebo-controlled, genotypes 1, 2, 4, 5 and 6', identifier: 'NCT02201940', kind: 'nct' },
      { label: 'ASTRAL-3: genotype 3 against sofosbuvir plus ribavirin', identifier: 'NCT02201953', kind: 'nct' },
      { label: 'ASTRAL-4: decompensated (Child-Pugh class B) cirrhosis', identifier: 'NCT02201901', kind: 'nct' },
      {
        label:
          'Drugs@FDA: EPCLUSA (sofosbuvir and velpatasvir), NDA 208341, Gilead Sciences — original approval 28 June 2016',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=208341',
        kind: 'regulatory',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — brand listing effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 67683363 — velpatasvir structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/67683363',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 4. Glecaprevir — the protease inhibitor that made eight weeks standard and dialysis treatable,
  //    and that is contraindicated outright in the patients with the sickest livers.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'glecaprevir',
    name: 'Glecaprevir',
    tradeName: 'Mavyret',
    sponsor: 'AbbVie (discovered in collaboration with Enanta Pharmaceuticals)',
    targetGene: 'HCV NS3/4A — a hepatitis C viral gene, not a human one',
    targetProtein:
      'Hepatitis C virus NS3/4A serine protease, the enzyme that cuts the viral polyprotein into its working parts',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2017,
    indication:
      'Chronic hepatitis C virus genotype 1, 2, 3, 4, 5 or 6 infection in adults and children aged 3 years and older without cirrhosis or with compensated cirrhosis, given as a fixed-dose combination with pibrentasvir, including in patients with any degree of renal impairment and on dialysis',
    patientFriendlyIndication: 'Long-standing hepatitis C infection, any of the six genotypes',
    anatomicalSite:
      'Hepatocyte cytoplasm, at the endoplasmic reticulum membrane where the viral polyprotein is processed',
    conditionContext: {
      conditionExplainer:
        'Hepatitis C makes its proteins as one long chain and then cuts the chain into working pieces with a molecular scissor of its own. Without that cut, none of the pieces work. The scissor is called NS3/4A, and it also disables part of the cell’s own alarm system for detecting viral RNA.',
      whyItMatters:
        'Kidney disease and hepatitis C travel together, and the drugs that came before this one were cleared by the kidney, so the sickest kidneys were the hardest patients to treat. Glecaprevir and its partner are cleared by the liver into bile, which is why they work in dialysis.',
      whoTakesThis:
        'Adults and children aged 3 and over with any genotype, at any level of kidney function. It must not be used in anyone with moderate or severe liver impairment or with any history of hepatic decompensation.',
      clinicalGoals:
        'Sustained virologic response at 12 weeks, reached in eight weeks rather than twelve in most previously untreated patients.',
    },
    oneSentenceVerdict:
      'A pan-genotypic NS3/4A protease inhibitor that, paired with pibrentasvir, cured 99.1% of genotype 1 patients in eight weeks in ENDURANCE-1 and 98% of 104 patients with stage 4 or 5 kidney disease in EXPEDITION-4 — and that is contraindicated outright in Child-Pugh B or C liver disease after reports of hepatic decompensation and failure, including deaths.',
    laymanHowItWorks:
      'Hepatitis C builds all its proteins as one long strip and then cuts the strip into separate working parts using its own scissors. Glecaprevir jams the scissors. The strip never gets cut, none of the parts are released, and the virus cannot assemble the machinery it needs to copy itself. Its partner pibrentasvir blocks a second, unrelated viral protein at the same time, so escaping one is not enough.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 88,
    substitutes: {
      summary:
        'The alternative is sofosbuvir/velpatasvir, and the two regimens divide the population between them by organ rather than by genotype. Glecaprevir with pibrentasvir is the one usable when kidney function has failed; sofosbuvir with velpatasvir is the one usable when the liver has decompensated. Neither works better than the other in a patient who has neither problem.',
      conventionalRx: [
        {
          name: 'Sofosbuvir/velpatasvir (Epclusa)',
          class: 'NS5B nucleotide inhibitor plus pan-genotypic NS5A inhibitor',
          howItCompares:
            'Also pan-genotypic and also one tablet daily, but twelve weeks rather than eight for most patients. It is the regimen for decompensated cirrhosis, where a protease inhibitor is contraindicated. Its nucleotide metabolite is renally cleared, which is the mirror-image limitation.',
          typicalCost:
            'US$866.40 per tablet at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: usable in Child-Pugh B and C; one tablet rather than three. Cons: 12 weeks; renally cleared metabolite.',
        },
        {
          name: 'Elbasvir/grazoprevir (Zepatier)',
          class: 'NS5A inhibitor plus a different NS3/4A protease inhibitor',
          howItCompares:
            'The other protease-inhibitor regimen with a strong result in advanced kidney disease, from C-SURFER. Restricted to genotypes 1 and 4, and requires baseline NS5A resistance testing in genotype 1a, which this regimen does not.',
          typicalCost: 'US$54,600 per 12-week course at United States wholesale acquisition cost',
          prosAndCons:
            'Pros: lower list price per course. Cons: genotypes 1 and 4 only; baseline resistance testing needed in genotype 1a; carries the same hepatic decompensation contraindication as a protease inhibitor.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Ask what your Child-Pugh score is before starting',
          action:
            'If you have cirrhosis, ask specifically whether it is compensated and whether you have ever had fluid in the abdomen, jaundice or confusion from the liver.',
          patientImpact:
            'This combination is contraindicated in Child-Pugh B or C and in anyone with any history of hepatic decompensation. The label records hepatic decompensation and failure with fatal outcomes, mostly in exactly those patients.',
          clinicalPrecaution:
            'A past episode of decompensation counts even if the liver has since improved. This is a contraindication rather than a caution, which is a stronger statement than most labels make.',
        },
        {
          name: 'List every medicine, including tuberculosis and HIV drugs',
          action:
            'Name any rifampin or atazanavir specifically; both are outright contraindicated with this combination.',
          patientImpact:
            'Rifampin strips the drug out of the blood, and atazanavir drives it up. Either can turn a curative course into a failed one or a toxic one.',
          clinicalPrecaution:
            'These are the two named contraindicated drugs in the label, not the whole interaction list.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CC1(CC1)S(=O)(=O)NC(=O)[C@]2(C[C@H]2C(F)F)NC(=O)[C@@H]3C[C@@H]4CN3C(=O)[C@@H](NC(=O)O[C@@H]5CCC[C@H]5OC/C=C/C(C6=NC7=CC=CC=C7N=C6O4)(F)F)C(C)(C)C',
      chemicalFormula: 'C38H46F4N6O9S',
      molecularWeight: '838.90 g/mol',
      targetReceptorAffinity:
        'Inhibits recombinant NS3/4A protease from clinical isolates of genotypes 1a, 1b, 2a, 2b, 3a, 4a, 5a and 6a with IC50 values of 3.5 to 11.3 nM, and full replicons with median EC50 values of 0.08 to 4.6 nM across ten subtypes. Notably, the Q80K substitution that defeated the earlier protease inhibitor simeprevir in genotype 1a does not reduce glecaprevir susceptibility.',
      structureSource: {
        label: 'PubChem CID 66828839 (glecaprevir) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/66828839',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'gle-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity of the difluoromethyl cyclopropyl and quinoxaline fragments',
          description:
            'Confirm identity and stereochemistry of the acylsulfonamide-bearing aminocyclopropane and of the difluoro-substituted quinoxaline before the ring closure. Glecaprevir carries four fluorines placed deliberately: they raise metabolic stability and, at the P1 cyclopropyl, they are part of why the molecule tolerates the A156 and D168 pocket differences between genotypes.',
          reagentsAndBuffer:
            'Chiral HPLC, 19F NMR in CDCl3 for fluorine count and environment, quinoxaline and cyclopropane sulfonamide reference standards, Karl Fischer titration',
        },
        {
          id: 'gle-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Ring-closing metathesis to form the macrocycle',
          description:
            'Close the large ring by ruthenium-catalysed alkene metathesis, then reduce or retain the alkene as required and install the acylsulfonamide warhead. Macrocyclisation is what pre-organises the molecule into the shape the protease groove accepts, and it is the step that most decides overall yield.',
          dependsOnStepId: 'gle-w1',
          reagentsAndBuffer:
            'Second-generation Grubbs or Hoveyda-Grubbs ruthenium catalyst, high dilution in toluene or dichloroethane, N,N-carbonyldiimidazole and DBU for acylsulfonamide formation, nitrogen atmosphere',
        },
        {
          id: 'gle-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Ruthenium removal and crystallisation',
          description:
            'Strip residual ruthenium to the elemental impurity limit and crystallise. Metathesis catalysts are coloured, tenacious and toxicologically controlled, so scavenging is not cosmetic — it is the specification the batch is released against.',
          dependsOnStepId: 'gle-w2',
          reagentsAndBuffer:
            'Isocyanide or thiourea-functionalised silica scavenger, activated charcoal, preparative reversed-phase chromatography, ICP-MS for residual ruthenium',
        },
        {
          id: 'gle-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Replicon dosing across ten subtypes in parallel',
          description:
            'Dose Huh-7 replicon lines carrying NS3/4A from subtypes 1a, 1b, 2a, 2b, 3a, 3b, 4a, 4d, 5a and 6a in one experiment. Because the reported EC50 range spans nearly two orders of magnitude across subtypes, running them separately would let run-to-run variation masquerade as a genotype effect.',
          dependsOnStepId: 'gle-w3',
          reagentsAndBuffer:
            'Huh-7 subgenomic replicon panel with subtype-specific NS3/4A, DMEM with 10% fetal bovine serum and G418, DMSO at 0.5% final, 45% human plasma for a protein-binding-corrected arm',
        },
        {
          id: 'gle-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Biochemical IC50 and the A156 and D168 resistance panel',
          description:
            'Measure inhibition of recombinant NS3/4A enzyme and repeat against site-directed A156 and D/Q168 mutants. A156 substitutions cause more than a hundred-fold loss of susceptibility and D168 substitutions more than thirty-fold in genotypes 1a, 3a and 6a. Reporting wild-type potency without this panel would misstate the drug’s real barrier.',
          dependsOnStepId: 'gle-w4',
          reagentsAndBuffer:
            'Recombinant NS3/4A enzyme from genotypes 1a to 6a, FRET peptide substrate, site-directed A156V/T and D168A/F/V/Y replicon mutants, deep sequencing for treatment-emergent substitutions',
        },
      ],
    },
    keyAudits: [
      {
        id: 'gle-a1',
        category: 'measured',
        title: 'ENDURANCE-1: 99.1% cured in eight weeks in genotype 1',
        laymanSummary:
          'Eight weeks of treatment cured essentially everyone with genotype 1 and no cirrhosis, and twelve weeks added nothing measurable. Fewer than one in a hundred patients in any group stopped because of side effects.',
        technicalDetails:
          'ENDURANCE-1 and ENDURANCE-3 together treated 1,208 patients without cirrhosis. Genotype 1 patients were randomised 1:1 to glecaprevir 300 mg with pibrentasvir 120 mg for 8 or 12 weeks: SVR12 was 99.1% (95% CI 98 to 100) at 8 weeks and 99.7% (95% CI 99 to 100) at 12 weeks. Adverse events led to discontinuation in no more than 1% of patients in any group.',
        evidenceSource:
          'Zeuzem S et al., N Engl J Med 2018;378:354-369 (ENDURANCE-1, NCT02604017)',
        doi: '10.1056/NEJMoa1702417',
        measuredMetric: 'Sustained virologic response 12 weeks after end of treatment',
        auditFlag: 'verified',
      },
      {
        id: 'gle-a2',
        category: 'measured',
        title: 'EXPEDITION-4: 98% cured in stage 4 and 5 kidney disease, with no failures at all',
        laymanSummary:
          'A hundred and four people with failing kidneys or on dialysis were treated. A hundred and two were cured. Not one had the virus break through during treatment, and not one relapsed afterwards.',
        technicalDetails:
          'EXPEDITION-4 was an open-label phase 3 trial in adults with genotype 1 to 6 hepatitis C, compensated liver disease with or without cirrhosis, and stage 4 or 5 chronic kidney disease including dialysis dependence. Of 104 patients, 52% had genotype 1, 16% genotype 2, 11% genotype 3, 19% genotype 4 and 2% genotype 5 or 6. SVR12 was 98% (102 of 104; 95% CI 95 to 100). No patient had virologic failure on treatment and none relapsed after it. Serious adverse events were reported in 24% of patients, and four discontinued early for adverse events, three of whom were still cured.',
        evidenceSource: 'Gane E et al., N Engl J Med 2017;377:1448-1455 (EXPEDITION-4, NCT02651194)',
        doi: '10.1056/NEJMoa1704053',
        measuredMetric:
          'Sustained virologic response at 12 weeks in stage 4 or 5 chronic kidney disease',
        auditFlag: 'verified',
      },
      {
        id: 'gle-a3',
        category: 'failed',
        title: 'Contraindicated in the sickest livers after fatal decompensation reports',
        laymanSummary:
          'This regimen must not be given to anyone whose liver is moderately or severely impaired, or who has ever had a liver decompensation. Cases of liver failure, some fatal, were reported after approval in exactly those patients.',
        technicalDetails:
          'The label contraindicates the combination in Child-Pugh B or C hepatic impairment and in any patient with a history of prior hepatic decompensation. Warnings and Precautions 5.2 records that hepatic decompensation and failure, including fatal outcomes, have been reported mostly in patients with cirrhosis and baseline moderate or severe liver impairment, and directs discontinuation on any evidence of decompensation. Protease inhibitors as a class are cleared hepatically and accumulate as liver function falls, which is the mechanistic reason. This is a contraindication rather than a warning, and it excludes the population in which sofosbuvir-velpatasvir with ribavirin remains usable.',
        evidenceSource:
          'MAVYRET United States prescribing information, Contraindications 4 and Warnings and Precautions 5.2 (NDA 209394)',
        auditFlag: 'caution',
      },
      {
        id: 'gle-a4',
        category: 'failed',
        title: 'Twenty of the twenty-four registrational failures were genotype 3',
        laymanSummary:
          'Across the whole approval programme only twenty-four people failed treatment. Twenty of them had genotype 3. Nobody with genotype 4, 5 or 6 failed at all.',
        technicalDetails:
          'In pooled resistance analyses of protease-inhibitor-naive and NS5A-inhibitor-naive subjects treated for 8, 12 or 16 weeks in the registrational phase 2 and 3 programme, 24 subjects had virologic failure: 2 genotype 1, 2 genotype 2 and 20 genotype 3. No genotype 4, 5 or 6 subject failed. Both genotype 1 failures were subtype 1a and both had treatment-emergent NS5A substitutions; one also had NS3 A156V. Neither genotype 2 failure had any treatment-emergent NS3 or NS5A substitution, meaning the failure was not explained by resistance at all.',
        evidenceSource:
          'MAVYRET United States prescribing information, Microbiology 12.4, pooled registrational resistance analysis (NDA 209394)',
        measuredMetric:
          'Distribution of virologic failures by genotype across the registrational programme',
        auditFlag: 'caution',
      },
      {
        id: 'gle-a5',
        category: 'inferred',
        title: 'The eight-week genotype 3 result came from a non-randomised add-on cohort',
        laymanSummary:
          'The twelve-week genotype 3 comparison was randomised. The eight-week genotype 3 group was not: those patients were enrolled afterwards and assigned to eight weeks without randomisation.',
        technicalDetails:
          'In ENDURANCE-3, genotype 3 patients were randomised 2:1 to 12 weeks of glecaprevir-pibrentasvir or sofosbuvir-daclatasvir, giving SVR12 of 95% (222 of 233; 95% CI 93 to 98) against 97% (111 of 115; 95% CI 93 to 99.9). Additional genotype 3 patients were then, in the paper’s own words, subsequently enrolled and nonrandomly assigned to 8 weeks, reaching 95% (149 of 157; 95% CI 91 to 98). The eight-week number is as high as the randomised twelve-week number, and it comes from a cohort that was not randomised, was recruited later, and has no concurrent comparator.',
        evidenceSource: 'Zeuzem S et al., N Engl J Med 2018;378:354-369 (ENDURANCE-3, NCT02640157)',
        doi: '10.1056/NEJMoa1702417',
        inferredClaim:
          'That eight weeks is established in genotype 3 to the same standard as twelve weeks — the twelve-week arm was randomised against an active comparator, the eight-week arm was not randomised against anything',
        auditFlag: 'caution',
      },
      {
        id: 'gle-a6',
        category: 'measured',
        title: 'The Q80K substitution that killed the previous protease inhibitor does nothing here',
        laymanSummary:
          'An earlier protease inhibitor failed in a large fraction of genotype 1a patients because of one common natural variant. Glecaprevir is unaffected by it, which is a genuine structural advance and not a marketing claim.',
        technicalDetails:
          'Q80 substitutions in genotypes 1a and 1b, including the genotype 1a Q80K polymorphism that reduced simeprevir efficacy enough to require baseline testing, do not reduce glecaprevir susceptibility. Substitutions at NS3 positions 36, 43, 54, 55, 56, 155, 166 or 170 associated with resistance to other protease inhibitors generally do not reduce it either. The exceptions are real and specific: A156 substitutions cost more than 100-fold, D/Q168 substitutions more than 30-fold in genotypes 1a (D168F/Y), 3a (Q168R) and 6a, a genotype 3a Q80R costs 21-fold, and Y56H combined with a D/Q168 change costs more still.',
        evidenceSource:
          'MAVYRET United States prescribing information, Microbiology 12.4, resistance in cell culture (NDA 209394)',
        measuredMetric: 'Fold-change in glecaprevir susceptibility by NS3 substitution',
        auditFlag: 'verified',
      },
      {
        id: 'gle-a7',
        category: 'inferred',
        title: 'Every endpoint in the programme is a blood test',
        laymanSummary:
          'ENDURANCE and EXPEDITION measured virus in blood twelve weeks after treatment. Neither counted deaths, liver cancers, transplants or dialysis outcomes.',
        technicalDetails:
          'The 2017 Cochrane review of 138 randomised direct-acting antiviral trials in 25,232 participants found no usable randomised data on hepatitis C-related morbidity or on hepatocellular carcinoma, and mortality data from only 11 trials. EXPEDITION-4 is where the gap is most visible: its population is defined by stage 4 or 5 kidney disease, the outcome that matters to them is renal and cardiovascular, and the trial was open-label with a 12-week virological endpoint and no comparator.',
        evidenceSource: 'Jakobsen JC et al., Cochrane Database Syst Rev 2017;9:CD012143',
        doi: '10.1002/14651858.CD012143.pub3',
        inferredClaim:
          'That curing hepatitis C in advanced kidney disease changes renal or survival outcomes — the reason the trial was run, and not something the trial measured',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Three tablets a day, taken with food',
        laymanDesc:
          'Glecaprevir is never given alone. It comes fixed together with pibrentasvir, and the tablets are taken with food because absorption is much lower on an empty stomach.',
        molecularDetail:
          'Fixed-dose combination of 100 mg glecaprevir with 40 mg pibrentasvir per tablet, three tablets once daily. Both are substrates of P-glycoprotein and BCRP and inhibitors of them, which is the origin of most of the interaction list, including the outright contraindications with rifampin and atazanavir.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Taken up by the liver and concentrated there',
        laymanDesc:
          'Transport proteins on the liver-cell surface pull the drug in, and it leaves again in bile rather than urine. That is why failing kidneys do not cause it to build up.',
        molecularDetail:
          'Uptake is mediated by OATP1B1 and OATP1B3; elimination is biliary with negligible renal clearance, which is the pharmacological basis for the stage 4 and 5 chronic kidney disease indication established in EXPEDITION-4.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It plugs the viral scissors',
        laymanDesc:
          'The virus makes all its proteins as one long strip that must be cut into separate pieces. Glecaprevir sits in the cutting groove so the cut never happens.',
        molecularDetail:
          'A macrocyclic acylsulfonamide that binds the NS3/4A serine protease active site, inhibiting recombinant enzyme from genotypes 1a through 6a with IC50 values of 3.5 to 11.3 nM and replicons with median EC50 values of 0.08 to 4.6 nM. The macrocycle pre-organises the molecule into the bound conformation, which is what buys potency across subtypes.',
        iconName: 'Scissors',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The polyprotein is never cut and the replication machinery is never built',
        laymanDesc:
          'None of the individual viral proteins are released, so the virus cannot assemble the copying apparatus at all. Blocking NS3/4A also restores part of the cell’s own antiviral alarm.',
        molecularDetail:
          'NS3/4A cleaves the polyprotein at the NS3-NS4A, NS4A-NS4B, NS4B-NS5A and NS5A-NS5B junctions. It also cleaves the host adaptor MAVS, blunting RIG-I-mediated interferon induction, so protease inhibition removes both the maturation step and the virus’s suppression of innate sensing.',
        iconName: 'Ban',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Cured in eight weeks for most people',
        laymanDesc:
          'Eight weeks is the standard course for most previously untreated patients, whatever their genotype and whatever their kidney function.',
        molecularDetail:
          'SVR12 was 99.1% at 8 weeks in genotype 1 without cirrhosis, 95% at 12 weeks and 95% at 8 weeks in genotype 3 without cirrhosis, and 98% at 12 weeks in stage 4 or 5 chronic kidney disease across genotypes 1 to 6.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'The limit is the liver, not the virus',
        laymanDesc:
          'Because the drug is cleared by the liver, a badly damaged liver lets it accumulate. It is contraindicated in moderate or severe liver impairment, and cases of liver failure with fatal outcomes have been reported.',
        molecularDetail:
          'Contraindicated in Child-Pugh B or C and in any history of prior hepatic decompensation. Glecaprevir exposure rises steeply with worsening hepatic function because clearance is hepatic and uptake is transporter-mediated.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'ENDURANCE-1 (NCT02604017)',
        phase: 'Phase 3, randomised, open-label, duration comparison',
        sampleSize: 703,
        primaryEndpoint: 'Sustained virologic response 12 weeks after end of treatment, genotype 1',
        endpointMet: true,
        statisticalPValue:
          '99.1% (95% CI 98 to 100) at 8 weeks against 99.7% (95% CI 99 to 100) at 12 weeks',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'ENDURANCE-3 (NCT02640157)',
        phase: 'Phase 3, randomised 2:1 against an active comparator, plus a non-randomised arm',
        sampleSize: 505,
        primaryEndpoint: 'Sustained virologic response 12 weeks after end of treatment, genotype 3',
        endpointMet: true,
        statisticalPValue:
          '95% (222/233) at 12 weeks against 97% (111/115) on sofosbuvir-daclatasvir; 95% (149/157) in the non-randomised 8-week cohort',
        unreportedAdverseSignals:
          'The 8-week genotype 3 cohort was enrolled after randomisation had closed and assigned without randomisation, so it has no concurrent comparator.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'EXPEDITION-4 (NCT02651194)',
        phase: 'Phase 3, open-label, single-arm, stage 4 or 5 chronic kidney disease',
        sampleSize: 104,
        primaryEndpoint: 'Sustained virologic response 12 weeks after end of treatment',
        endpointMet: true,
        statisticalPValue:
          '98% (102 of 104; 95% CI 95 to 100), with no on-treatment failures and no relapses',
        unreportedAdverseSignals:
          'Serious adverse events in 24% of patients. Single-arm and open-label in a population with high background morbidity, so the serious event rate cannot be attributed either way.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '99.1% sustained virologic response at 8 weeks in genotype 1 without cirrhosis, against 99.7% at 12 weeks',
        '98% (102 of 104) in stage 4 or 5 chronic kidney disease, with no on-treatment failure and no relapse',
        '95% at 12 weeks in randomised genotype 3 patients, against 97% on sofosbuvir-daclatasvir',
        'Biochemical IC50 of 3.5 to 11.3 nM against NS3/4A from all six genotypes; Q80K does not reduce susceptibility',
        'Twenty of 24 registrational virologic failures were genotype 3; none were genotype 4, 5 or 6',
      ],
      unsupportedInferences: [
        'That eight weeks in genotype 3 rests on the same evidence as twelve weeks — the eight-week cohort was assigned without randomisation',
        'That a 98% cure rate in advanced kidney disease has been shown to change renal or survival outcomes; the trial measured virus in blood',
        'That a pan-genotypic label means uniform potency: replicon EC50 spans 0.08 to 4.6 nM, a nearly sixtyfold range across subtypes',
        'That the 24% serious adverse event rate in EXPEDITION-4 is attributable to the drug; the trial was single-arm in a dialysis population',
      ],
      whatFailedInitially: [
        'Hepatic decompensation and failure, including fatal outcomes, reported after approval in patients with moderate or severe liver impairment',
        'Contraindicated outright in Child-Pugh B or C and in any history of prior decompensation, excluding the sickest livers from a pan-genotypic option',
        'Genotype 3 accounted for 20 of 24 virologic failures across the registrational programme',
        'Two genotype 2 failures had no treatment-emergent resistance substitution at all, so the failure has no molecular explanation',
      ],
      realWorldOutcome: [
        'Approved August 2017 under NDA 209394; the first pan-genotypic regimen with an 8-week duration for most previously untreated patients',
        'The regimen of choice in stage 4 and 5 chronic kidney disease and on dialysis, where nucleotide-based regimens are constrained',
        'Now indicated down to age 3, with the same contraindications',
        'Contraindicated with rifampin and atazanavir; both are named in the label rather than left to an interaction table',
      ],
    },
    deliverySystem: {
      type: 'Oral fixed-dose combination tablet with pibrentasvir, and oral pellets for children',
      description:
        'Three tablets once daily with food; absorption falls substantially when taken fasting. Glecaprevir is not sold separately. Pellets exist for children from age 3.',
      safetyProfile:
        'Contraindicated in Child-Pugh B or C hepatic impairment and in any history of prior hepatic decompensation, and contraindicated with atazanavir or rifampin. Boxed warning for hepatitis B virus reactivation, as for the whole class. Warnings and Precautions record hepatic decompensation and failure including fatal outcomes, mostly in patients with cirrhosis and baseline moderate or severe impairment. Adverse events led to discontinuation in no more than 1% of ENDURANCE patients; in the dialysis population of EXPEDITION-4 serious adverse events were reported in 24%, with pruritus, fatigue and nausea the commonest events.',
    },
    commonQuestions: [
      {
        q: 'Can I take this if my kidneys have failed?',
        a: 'This is the regimen designed for that situation. Glecaprevir and pibrentasvir are taken up by the liver and leave in bile, with negligible renal clearance, so failing kidneys do not cause the drug to build up. EXPEDITION-4 treated 104 people with stage 4 or 5 chronic kidney disease, including patients on dialysis, across all six genotypes: 102 were cured, none had the virus break through during treatment, and none relapsed afterwards. What that trial did not do is measure whether curing the infection changed anything about the kidney disease itself, which was the reason for running it.',
      },
      {
        q: 'Why is it forbidden if my liver is badly damaged?',
        a: 'Because the liver is the only route out. Glecaprevir is cleared hepatically, so as liver function falls its concentration rises, and protease inhibitors as a class have caused liver decompensation in patients who were already close to the edge. The label does not merely caution against this — it contraindicates the combination in Child-Pugh B or C impairment and in anyone with any history of hepatic decompensation, even if the liver has since recovered, and records that decompensation and failure with fatal outcomes have been reported. For those patients the alternative is sofosbuvir with velpatasvir, which contains no protease inhibitor.',
        auditNote:
          'The two pan-genotypic regimens are not interchangeable. Which organ has failed decides which one is safe, and that is not a nuance a cure-rate comparison shows.',
      },
      {
        q: 'Is eight weeks proven for genotype 3?',
        a: 'Less firmly than the headline number suggests. In ENDURANCE-3 the genotype 3 patients treated for twelve weeks were randomised two-to-one against an active comparator, and 95% of them were cured against 97% on the comparator. The eight-week genotype 3 patients were a separate group enrolled afterwards and assigned to eight weeks without randomisation, and 95% of them were cured. That is a very good number from a design that cannot rule out the two groups differing in ways nobody measured. Genotype 3 also accounted for twenty of the twenty-four virologic failures in the whole registrational programme, so it is the genotype where a design weakness matters most.',
      },
      {
        q: 'What is different about this protease inhibitor?',
        a: 'Two things, both measurable. It works across all six genotypes, where the earlier protease inhibitors were largely confined to genotype 1: it inhibits the enzyme from genotypes 1a through 6a within a threefold band, 3.5 to 11.3 nanomolar. And it is unaffected by Q80K, the natural variant present in a large fraction of genotype 1a infections that reduced simeprevir enough to require testing before treatment. Substitutions at seven other positions associated with resistance to earlier protease inhibitors also generally do not affect it. It is not invulnerable: changes at position 156 cost more than a hundredfold, and at position 168 more than thirtyfold in several genotypes.',
      },
      {
        q: 'Does it interact with my other medicines?',
        a: 'More than the sofosbuvir-based regimens do, because both halves are substrates and inhibitors of the P-glycoprotein and BCRP transporters. Two drugs are contraindicated by name: rifampin, which strips glecaprevir out of the blood, and atazanavir, which drives it up. Beyond those two the label carries a substantial interaction list including statins, some HIV drugs and some immunosuppressants. This is a practical difference between the two pan-genotypic options rather than a safety scandal, but it is the reason a full medication list matters here more than it does for a nucleotide-based regimen.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Zeuzem S et al. Glecaprevir-pibrentasvir for 8 or 12 weeks in HCV genotype 1 or 3 infection. N Engl J Med 2018;378:354-369 (ENDURANCE-1 and ENDURANCE-3)',
        identifier: '10.1056/NEJMoa1702417',
        kind: 'doi',
      },
      {
        label:
          'Gane E et al. Glecaprevir and pibrentasvir in patients with HCV and severe renal impairment. N Engl J Med 2017;377:1448-1455 (EXPEDITION-4)',
        identifier: '10.1056/NEJMoa1704053',
        kind: 'doi',
      },
      {
        label:
          'Jakobsen JC et al. Direct-acting antivirals for chronic hepatitis C. Cochrane Database Syst Rev 2017;9:CD012143',
        identifier: '10.1002/14651858.CD012143.pub3',
        kind: 'doi',
      },
      { label: 'ENDURANCE-1: 8 against 12 weeks in genotype 1', identifier: 'NCT02604017', kind: 'nct' },
      { label: 'ENDURANCE-3: genotype 3 against sofosbuvir-daclatasvir', identifier: 'NCT02640157', kind: 'nct' },
      { label: 'EXPEDITION-4: stage 4 or 5 chronic kidney disease', identifier: 'NCT02651194', kind: 'nct' },
      {
        label:
          'Drugs@FDA: MAVYRET (glecaprevir and pibrentasvir), NDA 209394, AbbVie — original approval 3 August 2017',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=209394',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 66828839 — glecaprevir structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/66828839',
        kind: 'url',
      },
    ],
  },
]
