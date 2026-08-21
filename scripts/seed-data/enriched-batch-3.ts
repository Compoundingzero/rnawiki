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
        measuredMetric:
          'Sustained virologic response, sofosbuvir-ribavirin against peginterferon-ribavirin',
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
        title:
          'No randomised trial has shown that curing hepatitis C prevents death or liver cancer',
        laymanSummary:
          'Every trial on this page measures virus in blood. None of them counted deaths, cancers or transplants for long enough to say anything. The link between clearing the virus and living longer is inferred from observational follow-up, not from a randomised comparison.',
        technicalDetails:
          'The Cochrane review by Jakobsen and colleagues pooled 138 randomised trials of 51 direct-acting antivirals in 25,232 participants, 128 of them placebo-controlled. It found no data at all on hepatitis C-related morbidity, and only limited mortality data from 11 trials (15 of 2,377 on DAA against 1 of 617 on control; OR 3.72, 95% CI 0.53 to 26.18, very low-quality evidence). None of the 138 trials provided usable data on ascites, variceal bleeding, hepato-renal syndrome, hepatic encephalopathy or hepatocellular carcinoma. Only one of 84 trials of marketed drugs measured quality of life. The authors concluded that SVR remains an outcome needing proper validation in randomised trials. The review was contested in print, and the counter-argument is that withholding a curative drug to run such a trial would now be unethical. Both things are true at once.',
        evidenceSource: 'Jakobsen JC et al., Cochrane Database Syst Rev 2017;9:CD012143',
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
        statisticalPValue:
          '90% (95% CI 87 to 93); no concurrent control arm, historical comparison',
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
        label:
          'NEUTRINO: sofosbuvir plus peginterferon alfa-2a and ribavirin, previously untreated',
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
      {
        label: 'ION-1: ledipasvir/sofosbuvir in untreated genotype 1',
        identifier: 'NCT01701401',
        kind: 'nct',
      },
      {
        label: 'ION-2: ledipasvir/sofosbuvir in previously treated genotype 1',
        identifier: 'NCT01768286',
        kind: 'nct',
      },
      {
        label: 'ION-3: 8 weeks against 12 weeks without cirrhosis',
        identifier: 'NCT01851330',
        kind: 'nct',
      },
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
        label:
          'PubChem CID 67683363 (velpatasvir) — canonical SMILES, molecular formula and weight',
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
      {
        label: 'ASTRAL-1: placebo-controlled, genotypes 1, 2, 4, 5 and 6',
        identifier: 'NCT02201940',
        kind: 'nct',
      },
      {
        label: 'ASTRAL-3: genotype 3 against sofosbuvir plus ribavirin',
        identifier: 'NCT02201953',
        kind: 'nct',
      },
      {
        label: 'ASTRAL-4: decompensated (Child-Pugh class B) cirrhosis',
        identifier: 'NCT02201901',
        kind: 'nct',
      },
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
        label:
          'PubChem CID 66828839 (glecaprevir) — canonical SMILES, molecular formula and weight',
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
        evidenceSource: 'Zeuzem S et al., N Engl J Med 2018;378:354-369 (ENDURANCE-1, NCT02604017)',
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
        evidenceSource:
          'Gane E et al., N Engl J Med 2017;377:1448-1455 (EXPEDITION-4, NCT02651194)',
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
        title:
          'The Q80K substitution that killed the previous protease inhibitor does nothing here',
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
      {
        label: 'ENDURANCE-1: 8 against 12 weeks in genotype 1',
        identifier: 'NCT02604017',
        kind: 'nct',
      },
      {
        label: 'ENDURANCE-3: genotype 3 against sofosbuvir-daclatasvir',
        identifier: 'NCT02640157',
        kind: 'nct',
      },
      {
        label: 'EXPEDITION-4: stage 4 or 5 chronic kidney disease',
        identifier: 'NCT02651194',
        kind: 'nct',
      },
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
  // ---------------------------------------------------------------------------------------------
  // 5. Pibrentasvir — the picomolar NS5A inhibitor that carries the pan-genotypic claim, and the
  //    one subtype, 3b, where the claim measurably fails.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'pibrentasvir',
    name: 'Pibrentasvir',
    tradeName: 'Mavyret',
    sponsor: 'AbbVie',
    targetGene: 'HCV NS5A — a hepatitis C viral gene, not a human one',
    targetProtein:
      'Hepatitis C virus NS5A phosphoprotein — a protein with no enzymatic activity of its own that organises the viral replication complex and directs assembly of new virus particles',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2017,
    indication:
      'Chronic hepatitis C virus genotype 1, 2, 3, 4, 5 or 6 infection in adults and children aged 3 years and older without cirrhosis or with compensated cirrhosis, given as a fixed-dose combination with glecaprevir; and genotype 1 infection previously treated with a regimen containing an NS5A inhibitor or an NS3/4A protease inhibitor, but not both',
    patientFriendlyIndication: 'Long-standing hepatitis C infection, any of the six genotypes',
    anatomicalSite:
      'Hepatocyte cytoplasm — the membranous web of remodelled endoplasmic reticulum where NS5A holds the replication complex together',
    conditionContext: {
      conditionExplainer:
        'Hepatitis C builds a private compartment inside the liver cell out of folded membrane, and copies itself there. NS5A is the protein that organises that compartment: it has no cutting or copying job of its own, it holds the machinery in place and hands finished genomes to the assembly line.',
      whyItMatters:
        'Because NS5A does nothing catalytic, nobody expected a drug against it to work at all. NS5A inhibitors turned out to be the most potent antivirals ever measured against any virus, and pibrentasvir is the most potent of them. That potency is what allows a curative course to be eight weeks rather than a year of interferon.',
      whoTakesThis:
        'Adults and children aged 3 and over with any of the six genotypes. It is never taken alone: it is only sold fixed together with glecaprevir, because a single direct-acting antiviral selects resistance.',
      clinicalGoals:
        'Sustained virologic response at 12 weeks — no detectable virus in blood twelve weeks after the last tablet. That is a laboratory endpoint, not a count of deaths, cancers or transplants.',
    },
    oneSentenceVerdict:
      'An NS5A inhibitor of extraordinary potency — median replicon EC50 of 0.5 to 15.6 picomolar across thirteen viral subtypes, roughly a thousandfold below its own protease-inhibitor partner — which cured 99.5% of genotype 2 patients in the rare placebo-controlled ENDURANCE-2 and 97.7% of 343 previously untreated patients with compensated cirrhosis in eight weeks in EXPEDITION-8, and which loses 6,336-fold of that potency against a genotype 3b virus carrying a single Y93H change.',
    laymanHowItWorks:
      'Hepatitis C cannot copy itself out in the open. It first folds the liver cell’s own internal membranes into a private workshop, and one viral protein, NS5A, is what holds that workshop together and passes finished copies to the packing line. Pibrentasvir sticks to NS5A in vanishingly small amounts and stops it doing either job, so the workshop never assembles and no virus is packed. It is always given fixed together with a second drug that attacks a different viral protein, because hitting one target alone lets the virus escape.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 86,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$152.92 per tablet, median across the three listed products at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'What pharmacies pay to acquire the drug, not what a patient is charged: United States list prices are not published and net prices after rebates are confidential by contract. The tablet is a fixed combination, so the figure buys glecaprevir as well and cannot be split between the two. No markup is stated because no per-dose cost of production has been published for pibrentasvir.',
      synthesisComplexity: 'High',
      costSource: {
        label:
          'Nearest published cost-of-production analysis for this drug class: Hill A, Simmons B, Gotham D, Fortunak J. Rapid reductions in prices for generic sofosbuvir and daclatasvir to treat hepatitis C. J Virus Erad 2016;2:28-31. It covers sofosbuvir and daclatasvir and does NOT cover pibrentasvir, which is why the synthesis cost field on this page is empty.',
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
        'The alternative NS5A inhibitor is velpatasvir, sold fixed with sofosbuvir. The two pan-genotypic regimens split the population by which organ has failed rather than by genotype, and neither is a rescue for the other after both drug classes have already been tried — that is a third regimen.',
      conventionalRx: [
        {
          name: 'Velpatasvir, in sofosbuvir/velpatasvir (Epclusa)',
          class: 'Pan-genotypic NS5A inhibitor with an NS5B nucleotide inhibitor',
          howItCompares:
            'The same target and the same pan-genotypic claim, in a one-tablet regimen rather than three, but twelve weeks rather than eight for most patients. It is the option usable in decompensated cirrhosis, where a protease inhibitor is contraindicated; its nucleotide partner is renally cleared, which is the mirror-image limitation.',
          typicalCost:
            'US$866.40 per tablet, median across the two listed products at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: one tablet; usable in Child-Pugh B and C. Cons: 12 weeks; renally cleared metabolite.',
        },
        {
          name: 'Elbasvir, in elbasvir/grazoprevir (Zepatier)',
          class: 'NS5A inhibitor with a different NS3/4A protease inhibitor',
          howItCompares:
            'Restricted to genotypes 1 and 4 rather than all six, and requires baseline NS5A resistance testing in genotype 1a, which this combination does not. Also usable in advanced kidney disease.',
          typicalCost:
            'US$54,600 per 12-week course at the United States wholesale acquisition cost recorded in the published price comparison',
          prosAndCons:
            'Pros: lower list price per course. Cons: two genotypes only; baseline resistance testing needed in genotype 1a.',
        },
        {
          name: 'Sofosbuvir/velpatasvir/voxilaprevir (Vosevi)',
          class: 'Triple regimen, the designated salvage after direct-acting antiviral failure',
          howItCompares:
            'This is what the label points to when both an NS5A inhibitor and a protease inhibitor have already failed — the population glecaprevir/pibrentasvir is explicitly not indicated for.',
          typicalCost:
            'Not listed in the CMS National Average Drug Acquisition Cost survey consulted for this page',
          prosAndCons:
            'Pros: covers the double-class failure gap. Cons: three drugs; contains a protease inhibitor, so the same decompensated-cirrhosis exclusion applies.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Say which subtype, not just which genotype',
          action:
            'If you were told you have genotype 3, ask whether the laboratory reported a subtype — 3a or 3b — and whether resistance testing was done.',
          patientImpact:
            'Subtype 3b carries natural changes at two positions in NS5A that cut pibrentasvir potency 24-fold before treatment even starts, and a further Y93H change cuts it 6,336-fold. Genotype 3 accounted for 20 of the 24 virologic failures in the whole registrational programme.',
          clinicalPrecaution:
            'Most United States and European laboratories report genotype only. Subtype 3b is uncommon in those regions and much more common in parts of South, Southeast and East Asia.',
        },
        {
          name: 'Say exactly which hepatitis C drugs you have taken before',
          action:
            'Name every previous antiviral course, and ask which class each drug belonged to.',
          patientImpact:
            'The retreatment indication covers genotype 1 patients who previously failed an NS5A inhibitor OR a protease inhibitor, but not both. Failing both classes puts you outside this regimen’s label.',
          clinicalPrecaution:
            'In MAGELLAN-1 Part 2 the patients with past exposure to both classes had the lowest response rate in the trial. This is a label restriction, not a caution.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'C[C@H]([C@@H](C(=O)N1CCC[C@H]1C2=NC3=C(N2)C=C(C(=C3)F)[C@H]4CC[C@@H](N4C5=CC(=C(C(=C5)F)N6CCC(CC6)C7=CC=C(C=C7)F)F)C8=CC9=C(C=C8F)N=C(N9)[C@@H]1CCCN1C(=O)[C@H]([C@@H](C)OC)NC(=O)OC)NC(=O)OC)OC',
      chemicalFormula: 'C57H65F5N10O8',
      molecularWeight: '1113.20 g/mol',
      targetReceptorAffinity:
        'Median EC50 values of 0.5 to 15.6 pM against laboratory and clinical isolates from subtypes 1a, 1b, 2a, 2b, 3a, 3b, 4a, 4b, 4d, 5a, 6a, 6e and 6p in HCV replicon assays. Picomolar, not nanomolar: its partner glecaprevir is reported over the same panel at 0.08 to 4.6 nM, so pibrentasvir is roughly three orders of magnitude more potent per molecule against its own target.',
      structureSource: {
        label:
          'PubChem CID 58031952 (pibrentasvir) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/58031952',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'pib-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity of the two benzimidazole-pyrrolidine arms and the fluorine count',
          description:
            'Confirm identity, enantiomeric purity and fluorine placement of the two proline-derived benzimidazole fragments and the fluorophenyl-piperidine core before coupling. The molecule carries five fluorines at four distinct environments, so 19F NMR is a faster identity check than mass alone and will catch a regiochemical error the mass spectrum cannot.',
          reagentsAndBuffer:
            'Chiral HPLC against single-enantiomer reference standards, 19F and 1H NMR in DMSO-d6, methyl carbamate and 4-(4-fluorophenyl)piperidine reference standards, Karl Fischer titration',
        },
        {
          id: 'pib-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Sequential coupling of the two arms onto the fluorinated core',
          description:
            'Join each benzimidazole-pyrrolidine arm to the polyfluorinated central aryl ring, then cap both prolinamide nitrogens as methyl carbamates. The two arms are not identical, so the couplings must be performed in order rather than in one pot; a symmetrical by-product from a double coupling is the commonest impurity and is difficult to separate later.',
          dependsOnStepId: 'pib-w1',
          reagentsAndBuffer:
            'Palladium precatalyst with a biaryl phosphine ligand for the C-N coupling, caesium or potassium carbonate base, anhydrous dioxane or toluene under nitrogen, methyl chloroformate with N-methylmorpholine for carbamate capping, HATU for the amide bond',
        },
        {
          id: 'pib-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Palladium scavenging and separation of the symmetrical by-product',
          description:
            'Strip residual palladium to the elemental impurity limit and resolve the target from the double-coupled symmetrical analogue and from any epimer at the pyrrolidine centres. A single epimerised proline stereocentre changes potency without changing mass, so chiral analysis, not just purity by area, is the release test.',
          dependsOnStepId: 'pib-w2',
          reagentsAndBuffer:
            'Thiol- or thiourea-functionalised silica scavenger, activated charcoal, preparative reversed-phase chromatography, chiral stationary phase for stereochemical purity, ICP-MS for residual palladium',
        },
        {
          id: 'pib-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Picomolar dosing of a thirteen-subtype replicon panel',
          description:
            'Dose Huh-7 replicon lines carrying NS5A from all thirteen reported subtypes in one experiment. At picomolar concentrations the practical limit is not the biology but the plasticware: a lipophilic molecule of this size adsorbs measurably to untreated polystyrene, and an uncorrected adsorption loss reads out as a falsely weak EC50.',
          dependsOnStepId: 'pib-w3',
          reagentsAndBuffer:
            'Huh-7 subgenomic replicon panel covering subtypes 1a, 1b, 2a, 2b, 3a, 3b, 4a, 4b, 4d, 5a, 6a, 6e and 6p, low-binding polypropylene dilution plates, DMEM with 10% fetal bovine serum and G418, DMSO held at or below 0.5% final, serial dilution verified by LC-MS/MS at the lowest points',
        },
        {
          id: 'pib-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'The genotype 3b resistance panel, run against genotype 3a as reference',
          description:
            'Repeat the potency measurement against site-directed NS5A mutants and against the natural genotype 3b background. Reporting only the wild-type picomolar figure would misstate the drug: the naturally occurring K30 and M31 polymorphisms of genotype 3b already cost 24-fold relative to genotype 3a, and adding Y93H on that background costs 6,336-fold.',
          dependsOnStepId: 'pib-w4',
          reagentsAndBuffer:
            'Site-directed NS5A mutants at positions 24, 28, 29, 30, 31, 32, 58, 92 and 93 including the genotype 1b P32 deletion and the genotype 3b K30 plus M31 plus Y93H combination, luciferase or neomycin phosphotransferase replicon readout, next-generation sequencing at 15% detection threshold for treatment-emergent substitutions',
        },
      ],
    },
    keyAudits: [
      {
        id: 'pib-a1',
        category: 'measured',
        title: 'ENDURANCE-2: a direct-acting antiviral trial that actually used a placebo',
        laymanSummary:
          'Almost no modern hepatitis C trial has a placebo group, because withholding a cure is hard to justify. This one did, for twelve weeks, in genotype 2. Nearly everyone on the drug was cured and the side effect rate was no different from placebo.',
        technicalDetails:
          'ENDURANCE-2 randomised adults with untreated or previously treated genotype 2 infection without cirrhosis 2:1 to once-daily glecaprevir 300 mg with pibrentasvir 120 mg (n = 202) or placebo (n = 100) for 12 weeks, double-blind. SVR12 in the intention-to-treat population was 99.5% (95% CI 98.5 to 100). The frequency and severity of adverse events on active treatment were similar to placebo, which is the specific claim a single-arm trial cannot make and this one can.',
        evidenceSource:
          'Asselah T et al., Clin Gastroenterol Hepatol 2018;16:417-426 (ENDURANCE-2, NCT02640482)',
        doi: '10.1016/j.cgh.2017.09.027',
        measuredMetric:
          'Sustained virologic response at 12 weeks, against a concurrent double-blind placebo arm',
        auditFlag: 'verified',
      },
      {
        id: 'pib-a2',
        category: 'measured',
        title: 'EXPEDITION-8: eight weeks worked in 343 patients who already had cirrhosis',
        laymanSummary:
          'Cirrhosis had always meant longer treatment. This trial gave the eight-week course to 343 previously untreated people who already had scarred livers. One person relapsed.',
        technicalDetails:
          'EXPEDITION-8 was a single-arm, multicentre phase 3b trial of 8 weeks of glecaprevir/pibrentasvir in treatment-naive patients with genotypes 1 to 6 and compensated cirrhosis. SVR12 was 99.7% (334 of 335; 95% CI 98.3 to 99.9) per protocol and 97.7% (335 of 343; 95% CI 96.1 to 99.3) by intention to treat. One patient, genotype 3a, relapsed at post-treatment week 4. Serious adverse events occurred in 2% and none were assessed as related; no adverse event led to discontinuation. The gap between the two figures is the eight patients who did not complete per-protocol follow-up, not eight treatment failures.',
        evidenceSource: 'Brown RS Jr et al., J Hepatol 2020;72:441-449 (EXPEDITION-8, NCT03089944)',
        doi: '10.1016/j.jhep.2019.10.020',
        measuredMetric:
          'Sustained virologic response at 12 weeks after an 8-week course in compensated cirrhosis',
        auditFlag: 'verified',
      },
      {
        id: 'pib-a3',
        category: 'measured',
        title: 'Picomolar potency across thirteen subtypes, which is not a marketing adjective',
        laymanSummary:
          'The concentration needed to halve viral copying is measured in trillionths of a gram per litre. Its partner drug needs about a thousand times more. NS5A inhibitors are the most potent antivirals anyone has measured.',
        technicalDetails:
          'In HCV replicon assays pibrentasvir had median EC50 values of 0.5 to 15.6 pM against laboratory and clinical isolates from subtypes 1a, 1b, 2a, 2b, 3a, 3b, 4a, 4b, 4d, 5a, 6a, 6e and 6p. Glecaprevir over an overlapping panel was 0.08 to 4.6 nM. The range within the pibrentasvir panel is itself 31-fold, so "pan-genotypic" describes clinical adequacy across the panel, not equal potency across it.',
        evidenceSource:
          'MAVYRET United States prescribing information, Microbiology 12.4, antiviral activity (NDA 209394)',
        measuredMetric: 'Median replicon EC50 by viral subtype',
        auditFlag: 'verified',
      },
      {
        id: 'pib-a4',
        category: 'failed',
        title: 'Genotype 3b: the subtype where the pan-genotypic claim measurably breaks',
        laymanSummary:
          'One subtype of genotype 3 carries two natural changes that blunt the drug before treatment starts, and a third change makes it more than six thousand times weaker. This is not a rare escape mutant — the first two changes are ordinary features of that subtype.',
        technicalDetails:
          'In a genotype 3b replicon the naturally occurring NS5A polymorphisms K30 and M31 reduced pibrentasvir susceptibility 24-fold relative to its activity in a genotype 3a replicon. Introducing NS5A Y93H into that genotype 3b background reduced susceptibility a further 6,336-fold. A genotype 1b P32 deletion cost 1,036-fold, and in genotype 1a, M28G cost 244-fold and Q30D 94-fold. Subtype 3b is uncommon in North America and western Europe and substantially more common in parts of South, Southeast and East Asia, so the registrational population under-represents the subtype in which the drug is weakest.',
        evidenceSource:
          'MAVYRET United States prescribing information, Microbiology 12.4, resistance in cell culture (NDA 209394)',
        measuredMetric:
          'Fold-change in pibrentasvir susceptibility on a genotype 3b background: 24-fold from natural K30 and M31, 6,336-fold with Y93H added',
        auditFlag: 'caution',
      },
      {
        id: 'pib-a5',
        category: 'failed',
        title: 'Retreatment after both drug classes was the worst arm in its own trial',
        laymanSummary:
          'For people whose earlier treatment failed, this combination worked well if they had been exposed to one class of hepatitis C drug. Those exposed to both classes did worse, and the label now excludes them.',
        technicalDetails:
          'MAGELLAN-1 Part 2 randomised 91 treated patients with past virologic failure on at least one NS3/4A protease or NS5A inhibitor regimen to 12 or 16 weeks of ribavirin-free glecaprevir/pibrentasvir. SVR12 was 89% (39 of 44) at 12 weeks and 91% (43 of 47) at 16 weeks; relapse occurred in 9% (4 of 44) at 12 weeks and in none at 16 weeks. Past treatment with one class had no impact on SVR12, whereas past treatment with both classes was associated with a lower SVR12 rate. The approved retreatment indication is correspondingly restricted to genotype 1 patients previously treated with an NS5A inhibitor or a protease inhibitor, but not both.',
        evidenceSource:
          'Poordad F et al., Hepatology 2018;67:1253-1260 (MAGELLAN-1 Part 2, NCT02446717)',
        doi: '10.1002/hep.29671',
        measuredMetric:
          'SVR12 by number of prior direct-acting antiviral classes failed, and the resulting label restriction',
        auditFlag: 'caution',
      },
      {
        id: 'pib-a6',
        category: 'failed',
        title: 'One in fourteen failed again after a previous sofosbuvir plus NS5A regimen',
        laymanSummary:
          'A separate trial retreated 177 people whose earlier sofosbuvir-plus-NS5A course had failed. Thirteen failed a second time. Adding ribavirin caused more side effects and did not raise the cure rate.',
        technicalDetails:
          'This phase 3b open-label study randomised 177 genotype 1 patients with prior failure on sofosbuvir plus an NS5A inhibitor: without cirrhosis to 12 weeks (n = 78) or 16 weeks (n = 49), and with compensated cirrhosis to 12 weeks with ribavirin (n = 21) or 16 weeks without (n = 29). SVR12 was 90%, 94%, 86% and 97% across the four groups. Treatment failed in 13 patients (7.3%), all genotype 1a. Most patients had baseline NS5A resistance-associated substitutions; treatment-emergent substitutions appeared in NS3 in 9 and in NS5A in 10 of those who failed. Ribavirin increased adverse events without increasing efficacy.',
        evidenceSource: 'Lok AS et al., Gastroenterology 2019;157:1506-1517 (NCT03092375)',
        doi: '10.1053/j.gastro.2019.08.008',
        measuredMetric: 'SVR12 on retreatment after sofosbuvir plus an NS5A inhibitor failure',
        auditFlag: 'caution',
      },
      {
        id: 'pib-a7',
        category: 'inferred',
        title: 'No number on this page belongs to pibrentasvir alone',
        laymanSummary:
          'Every cure rate quoted here comes from a fixed tablet containing two drugs. Pibrentasvir has never been given by itself in a registrational trial, so its individual contribution to the result is inferred, not measured.',
        technicalDetails:
          'Pibrentasvir is not marketed separately and was not studied as monotherapy in the registrational programme; the ENDURANCE, EXPEDITION, SURVEYOR and MAGELLAN trials all tested the fixed combination. What is measured separately is the biochemistry: replicon EC50 by subtype, resistance selection, and the observation that combining the two showed no antagonism in genotype 1 replicon assays. The clinical attribution — that the picomolar potency is what buys the eight-week duration — is a mechanistic inference consistent with the data rather than a finding from a trial that isolated it.',
        evidenceSource:
          'MAVYRET United States prescribing information, Microbiology 12.4, combination antiviral activity (NDA 209394)',
        inferredClaim:
          'That the trial cure rates measure pibrentasvir’s efficacy — they measure a two-drug fixed combination, and no arm separated the two',
        auditFlag: 'caution',
      },
      {
        id: 'pib-a8',
        category: 'inferred',
        title: 'Every endpoint is a blood test twelve weeks after the last tablet',
        laymanSummary:
          'The trials counted whether virus was still detectable in blood. None of them counted deaths, liver cancers or transplants.',
        technicalDetails:
          'The 2017 Cochrane review of 138 randomised direct-acting antiviral trials in 25,232 participants found no usable randomised evidence on hepatitis C-related morbidity or on hepatocellular carcinoma, and mortality data from only 11 trials. EXPEDITION-8 is where the gap is most visible in this programme: it enrolled the patients with the most to lose — 343 with established cirrhosis — was single-arm, and stopped measuring twelve weeks after the last dose.',
        evidenceSource: 'Jakobsen JC et al., Cochrane Database Syst Rev 2017;9:CD012143',
        doi: '10.1002/14651858.CD012143.pub3',
        inferredClaim:
          'That an undetectable blood test at twelve weeks in a cirrhotic patient predicts fewer cancers, transplants or deaths — plausible, and not what these trials measured',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed fixed to a second drug, with food',
        laymanDesc:
          'Pibrentasvir is not sold on its own. It is pressed into the same tablet as glecaprevir, and the tablets are taken with food because absorption is much lower on an empty stomach.',
        molecularDetail:
          'Fixed-dose combination of 40 mg pibrentasvir with 100 mg glecaprevir per tablet, three tablets once daily; oral pellets exist for children from age 3. Both components are substrates and inhibitors of P-glycoprotein and BCRP.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Carried into the liver cell and kept there',
        laymanDesc:
          'Transporters on the liver-cell surface draw the drug in, and it leaves the body in bile rather than urine. Almost none of it is cleared by the kidney.',
        molecularDetail:
          'Hepatic uptake with biliary elimination and negligible renal clearance, which is why the combination is usable across the full range of kidney function including dialysis. Unlike glecaprevir, pibrentasvir exposure is not meaningfully reduced by high-dose proton pump inhibitors.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It binds NS5A, the protein that has no job you can point at',
        laymanDesc:
          'NS5A does not cut or copy anything. It organises: it holds the viral workshop together and hands finished genomes to the packing line. Pibrentasvir sticks to it in trillionths of a gram.',
        molecularDetail:
          'Binds the NS5A phosphoprotein with median replicon EC50 of 0.5 to 15.6 pM across thirteen subtypes. NS5A has no catalytic site, so the binding surface is a protein-protein interface at domain I rather than an enzyme pocket — the reason this class was not obvious to look for and the reason its potency was a surprise.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The replication workshop never forms and nothing gets packed',
        laymanDesc:
          'Two things stop at once: the membrane compartment where the virus copies itself is never properly built, and the genomes already made are never loaded into new particles.',
        molecularDetail:
          'NS5A is required both for viral RNA replication on the membranous web and for virion assembly through its domain III interaction with core protein. Inhibiting it collapses replication complex formation and blocks assembly, which is why NS5A inhibitors clear viral RNA from serum faster in the first days of treatment than any other class.',
        iconName: 'Ban',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Cured in eight weeks, cirrhosis or not',
        laymanDesc:
          'Eight weeks is the standard course for most previously untreated people, including those who already have a scarred liver.',
        molecularDetail:
          'SVR12 was 99.5% at 12 weeks in genotype 2 against a placebo arm, 98% at 8 weeks in genotype 2 and 93% at 8 weeks in genotypes 4, 5 and 6 without cirrhosis, and 97.7% by intention to treat at 8 weeks in 343 treatment-naive patients with compensated cirrhosis across genotypes 1 to 6.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Where it stops working is a subtype, not a genotype',
        laymanDesc:
          'Genotype 3b carries natural changes that blunt the drug from the outset, and one further change makes it thousands of times weaker. Genotype 3 accounted for twenty of the twenty-four failures in the whole approval programme.',
        molecularDetail:
          'Natural K30 and M31 in genotype 3b NS5A cost 24-fold against genotype 3a; adding Y93H costs 6,336-fold. A genotype 1b P32 deletion costs 1,036-fold. Of the 24 registrational virologic failures, 20 were genotype 3 and none were genotype 4, 5 or 6.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'ENDURANCE-2 (NCT02640482)',
        phase: 'Phase 3, randomised 2:1, double-blind, placebo-controlled',
        sampleSize: 302,
        primaryEndpoint: 'Sustained virologic response 12 weeks after end of treatment, genotype 2',
        endpointMet: true,
        statisticalPValue: '99.5% (95% CI 98.5 to 100) on treatment; the comparator was placebo',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'EXPEDITION-8 (NCT03089944)',
        phase: 'Phase 3b, single-arm, open-label, treatment-naive compensated cirrhosis',
        sampleSize: 343,
        primaryEndpoint:
          'Sustained virologic response 12 weeks after an 8-week course, genotypes 1 to 6',
        endpointMet: true,
        statisticalPValue:
          '97.7% (335/343; 95% CI 96.1 to 99.3) by intention to treat; 99.7% (334/335; 95% CI 98.3 to 99.9) per protocol',
        unreportedAdverseSignals:
          'Single-arm, so the 2% serious adverse event rate in a cirrhotic population has no concurrent comparator. The comparison that established the 8-week duration was against historical 12-week rates, not a randomised control.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'MAGELLAN-1 Part 2 (NCT02446717)',
        phase: 'Phase 3, randomised 1:1, open-label, prior direct-acting antiviral failure',
        sampleSize: 91,
        primaryEndpoint: 'Sustained virologic response 12 weeks after end of treatment',
        endpointMet: true,
        statisticalPValue: '89% (39/44) at 12 weeks and 91% (43/47) at 16 weeks',
        unreportedAdverseSignals:
          'Prior failure of both a protease inhibitor and an NS5A inhibitor was associated with a lower SVR12 rate; that subgroup is excluded from the approved retreatment indication.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'SURVEYOR-II Part 3 (NCT02243293)',
        phase:
          'Phase 3, partially randomised, open-label, genotype 3 with cirrhosis or prior treatment',
        sampleSize: 131,
        primaryEndpoint: 'Sustained virologic response 12 weeks after end of treatment, genotype 3',
        endpointMet: true,
        statisticalPValue:
          '91% (20/22) at 12 weeks and 95% (21/22) at 16 weeks in treatment-experienced patients without cirrhosis; 98% (39/40) in treatment-naive cirrhosis at 12 weeks; 96% (45/47) in treatment-experienced cirrhosis at 16 weeks',
        unreportedAdverseSignals:
          'Only the treatment-experienced non-cirrhotic patients were randomised; the two cirrhotic groups were assigned by prior treatment status, so duration and population are confounded.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '99.5% sustained virologic response in genotype 2 against a concurrent double-blind placebo arm, with an adverse event profile similar to placebo',
        '97.7% by intention to treat and 99.7% per protocol after 8 weeks in 343 treatment-naive patients with compensated cirrhosis',
        'Median replicon EC50 of 0.5 to 15.6 pM across thirteen subtypes, roughly a thousandfold below the partner protease inhibitor',
        '24-fold loss of susceptibility from natural K30 and M31 in genotype 3b, and 6,336-fold with Y93H added',
        '89% and 91% SVR12 at 12 and 16 weeks after prior direct-acting antiviral failure, with lower rates after failure of both drug classes',
      ],
      unsupportedInferences: [
        'That any cure rate here measures pibrentasvir — every registrational arm tested the fixed two-drug combination and none isolated it',
        'That "pan-genotypic" means uniform potency: the replicon range spans 31-fold across subtypes before any resistance substitution is added',
        'That an 8-week course in cirrhosis was shown non-inferior to 12 weeks — EXPEDITION-8 was single-arm against pre-defined historical thresholds',
        'That clearing virus from the blood of a cirrhotic patient has been shown to reduce cancers, transplants or deaths; that outcome was not measured',
      ],
      whatFailedInitially: [
        'Genotype 3b carries natural NS5A polymorphisms that blunt the drug before treatment starts, and a Y93H addition costs a further 6,336-fold',
        'A genotype 1b NS5A P32 deletion costs 1,036-fold, and genotype 1a M28G and Q30D cost 244-fold and 94-fold',
        'Twenty of the 24 registrational virologic failures were genotype 3; two genotype 2 failures had no treatment-emergent substitution at all',
        'Retreatment after failure of both a protease inhibitor and an NS5A inhibitor performed worst and is excluded from the label; 13 of 177 failed again in the sofosbuvir plus NS5A retreatment study',
        'Adding ribavirin to retreatment increased adverse events without increasing efficacy',
      ],
      realWorldOutcome: [
        'Approved August 2017 under NDA 209394 as half of the first pan-genotypic 8-week regimen, and never marketed separately',
        'Usable across the full range of kidney function including dialysis, because clearance is biliary rather than renal',
        'Now indicated down to age 3, with oral pellets for children who cannot swallow tablets',
        'Contraindicated in Child-Pugh B or C liver disease and with atazanavir or rifampin — restrictions that come from the protease-inhibitor half of the tablet',
      ],
    },
    deliverySystem: {
      type: 'Oral fixed-dose combination tablet with glecaprevir, and oral pellets for children',
      description:
        'Three tablets once daily with food; absorption falls substantially when taken fasting. Pibrentasvir is not sold separately and has no single-agent presentation. Pellets exist for children from age 3.',
      safetyProfile:
        'In ENDURANCE-2, the only placebo-controlled arm in the programme, adverse event frequency and severity on treatment were similar to placebo. In EXPEDITION-8 the commonest events were fatigue (9%), pruritus (8%), headache (8%) and nausea (6%); serious adverse events occurred in 2%, none assessed as related, and none led to discontinuation. In MAGELLAN-1 Part 2 the only adverse event reported in at least 10% was headache, with no drug-related serious events. The contraindications carried by the tablet — Child-Pugh B or C hepatic impairment, prior hepatic decompensation, atazanavir and rifampin — arise from glecaprevir, not from pibrentasvir. A boxed warning for hepatitis B virus reactivation applies to the class.',
    },
    commonQuestions: [
      {
        q: 'How can a drug work at picomolar concentrations?',
        a: 'By binding a target that has no spare copies. NS5A is not an enzyme — it does not turn over substrate, so there is no throughput to out-compete. It is a scaffold that has to be present in the right place at the right time, and occupying a small fraction of it appears to be enough to stop the replication complex assembling. Measured in replicon assays the median half-maximal concentration is 0.5 to 15.6 picomolar across thirteen viral subtypes; the protease inhibitor in the same tablet needs roughly a thousand times more. That potency is real and reproducible, and it is also the reason the drug can only be studied as part of a combination: on its own, a molecule this potent selects resistant virus quickly.',
      },
      {
        q: 'Does "pan-genotypic" mean it works equally well against every hepatitis C?',
        a: 'No, and the label’s own numbers say so. Across thirteen subtypes the measured potency spans a 31-fold range before any resistance mutation is involved. The clear exception is subtype 3b, which carries two ordinary, naturally occurring changes in NS5A — at positions 30 and 31 — that cut susceptibility 24-fold compared with subtype 3a, and a further change at position 93 that cuts it 6,336-fold. Subtype 3b is uncommon in North America and western Europe and much more common in parts of Asia, which is why the registrational trials contained few of these patients. Genotype 3 as a whole accounted for twenty of the twenty-four treatment failures in the entire approval programme.',
        auditNote:
          'Most laboratories report a genotype number, not a subtype letter. The difference between 3a and 3b is the difference between the drug’s best and worst measured performance.',
      },
      {
        q: 'Is there any trial where the comparison was against a placebo?',
        a: 'Yes, one, and it is unusual. ENDURANCE-2 randomised 302 people with genotype 2 hepatitis C two-to-one to twelve weeks of the combination or to twelve weeks of placebo, double-blind. Almost every other modern hepatitis C trial compares one active drug against another, or against nothing at all, because withholding a highly effective cure is difficult to justify to an ethics committee. The placebo arm is what allows a claim the single-arm trials cannot make: that the side effects reported on treatment occurred at a similar rate in people taking nothing.',
      },
      {
        q: 'What if I have already been treated and it did not work?',
        a: 'It depends on what you took. In MAGELLAN-1 Part 2, ninety-one people whose previous treatment had failed were retreated: 89% were cured with twelve weeks and 91% with sixteen, and prior exposure to a single class of drug made no measurable difference. Prior exposure to both classes — an NS5A inhibitor and a protease inhibitor — was associated with a lower cure rate, and the approved retreatment indication excludes that group. A separate study of 177 people who had failed sofosbuvir plus an NS5A inhibitor found 13 failed a second time. Adding ribavirin caused more side effects and cured no more people.',
      },
      {
        q: 'Can I take pibrentasvir on its own?',
        a: 'It does not exist on its own. There is no single-agent product, and there was no monotherapy arm in the registrational programme. Everything measured clinically — every cure rate on this page — belongs to the fixed tablet containing both pibrentasvir and glecaprevir. What has been measured about pibrentasvir alone is biochemical: how tightly it binds NS5A in each subtype, which mutations defeat it, and the finding that the two drugs showed no antagonism when combined in genotype 1 replicon assays. The claim that its potency is what shortens the course to eight weeks is a reasonable inference from that biochemistry, not a result from a trial designed to test it.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Asselah T et al. Efficacy of glecaprevir/pibrentasvir for 8 or 12 weeks in patients with hepatitis C virus genotype 2, 4, 5, or 6 infection without cirrhosis. Clin Gastroenterol Hepatol 2018;16:417-426 (ENDURANCE-2, ENDURANCE-4, SURVEYOR-II Part 4)',
        identifier: '10.1016/j.cgh.2017.09.027',
        kind: 'doi',
      },
      {
        label:
          'Brown RS Jr et al. Glecaprevir/pibrentasvir for 8 weeks in treatment-naive patients with chronic HCV genotypes 1-6 and compensated cirrhosis: the EXPEDITION-8 trial. J Hepatol 2020;72:441-449',
        identifier: '10.1016/j.jhep.2019.10.020',
        kind: 'doi',
      },
      {
        label:
          'Poordad F et al. Glecaprevir/pibrentasvir in patients with hepatitis C virus genotype 1 or 4 and past direct-acting antiviral treatment failure. Hepatology 2018;67:1253-1260 (MAGELLAN-1 Part 2)',
        identifier: '10.1002/hep.29671',
        kind: 'doi',
      },
      {
        label:
          'Wyles D et al. Glecaprevir/pibrentasvir for hepatitis C virus genotype 3 patients with cirrhosis and/or prior treatment experience: a partially randomized phase 3 clinical trial. Hepatology 2018;67:514-523 (SURVEYOR-II Part 3)',
        identifier: '10.1002/hep.29541',
        kind: 'doi',
      },
      {
        label:
          'Lok AS et al. Efficacy of glecaprevir and pibrentasvir in patients with genotype 1 hepatitis C virus infection with treatment failure after NS5A inhibitor plus sofosbuvir therapy. Gastroenterology 2019;157:1506-1517',
        identifier: '10.1053/j.gastro.2019.08.008',
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
          'Rosenthal ES, Graham CS. Price and affordability of direct-acting antiviral regimens for hepatitis C virus in the United States. Infect Agent Cancer 2016;11:24',
        identifier: '10.1186/s13027-016-0071-z',
        kind: 'doi',
      },
      {
        label: 'ENDURANCE-2: genotype 2 against placebo',
        identifier: 'NCT02640482',
        kind: 'nct',
      },
      {
        label: 'EXPEDITION-8: 8 weeks in treatment-naive compensated cirrhosis',
        identifier: 'NCT03089944',
        kind: 'nct',
      },
      {
        label: 'MAGELLAN-1: retreatment after direct-acting antiviral failure',
        identifier: 'NCT02446717',
        kind: 'nct',
      },
      {
        label: 'SURVEYOR-II: genotypes 2, 3, 4, 5 and 6',
        identifier: 'NCT02243293',
        kind: 'nct',
      },
      {
        label: 'Retreatment after sofosbuvir plus an NS5A inhibitor',
        identifier: 'NCT03092375',
        kind: 'nct',
      },
      {
        label:
          'Drugs@FDA: MAVYRET (glecaprevir and pibrentasvir), NDA 209394, AbbVie — original approval 3 August 2017',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=209394',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 58031952 — pibrentasvir structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/58031952',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 6. Ribavirin — approved in 1985, indispensable for fifteen years, and still without an
  //    established mechanism of action. The clearest inference-overreach record in antiviral
  //    medicine: five proposed mechanisms, three indications, and one boxed warning saying it does
  //    not work on its own.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'ribavirin',
    name: 'Ribavirin',
    tradeName: 'Rebetol / Copegus / Virazole / Ribasphere',
    sponsor:
      'Bausch Health (originated at ICN Pharmaceuticals; oral forms developed by Schering-Plough and Roche)',
    targetGene:
      'No single target gene has been established — proposed targets include the host genes IMPDH1 and IMPDH2 and the viral RNA-dependent RNA polymerase',
    targetProtein:
      'Contested. Inosine monophosphate dehydrogenase (host), viral RNA-dependent RNA polymerase, and the viral RNA capping machinery have each been proposed, alongside two indirect immunological mechanisms',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1985,
    indication:
      'Chronic hepatitis C virus infection in patients aged 5 years and older with compensated liver disease, in combination with peginterferon alfa or with certain direct-acting antiviral regimens; and, as an inhalation solution, hospitalised infants and young children with severe lower respiratory tract infection due to respiratory syncytial virus',
    patientFriendlyIndication:
      'An older broad-spectrum antiviral, now used mainly as an add-on in hepatitis C and as an inhaled treatment for severe RSV in infants',
    anatomicalSite:
      'Everywhere the nucleoside transporters reach — hepatocyte cytoplasm for the antiviral effect, and the red blood cell, where the phosphorylated drug accumulates and causes the toxicity',
    conditionContext: {
      conditionExplainer:
        'Ribavirin is not a drug built for one virus. It is a counterfeit version of guanosine, one of the four letters of RNA, and it has measurable activity against a long list of unrelated RNA viruses in a dish. Which of its several possible effects actually does the work has never been settled.',
      whyItMatters:
        'For fifteen years ribavirin was the difference between a hepatitis C cure and a failed course, and it is still the only drug given for Lassa fever. Both of those roles rest on evidence of very different quality, and this page separates them.',
      whoTakesThis:
        'In hepatitis C, patients aged 5 and over on a combination regimen — a role that has shrunk close to nothing since 2014. As an aerosol, hospitalised infants with severe RSV. Never anyone who is pregnant, whose partner is pregnant, or who has significant cardiac disease.',
      clinicalGoals:
        'In hepatitis C, sustained virologic response — no detectable virus in blood after treatment. In RSV, shorter ventilation and hospitalisation. The strength of evidence behind those two goals is not remotely comparable.',
    },
    oneSentenceVerdict:
      'A guanosine mimic with five separate proposed mechanisms and none established, which tripled interferon’s hepatitis C cure rate in a 912-patient randomised trial (38% against 13% at 48 weeks) and added 27 points on top of peginterferon in a 1,121-patient trial (56% against 29%), while carrying a boxed warning that it does not work alone, that its hemolytic anemia has caused fatal myocardial infarction, and that it is teratogenic in every animal species tested.',
    laymanHowItWorks:
      'Ribavirin looks enough like guanosine, one of the four building blocks of RNA, that cells and viruses both pick it up and phosphorylate it. After that the story becomes genuinely unsettled: it can starve the cell of real guanosine, it can be inserted into viral genomes and cause so many copying errors that the virus mutates itself to death, it can interfere with the cap a virus puts on its messages, it can slow the copying enzyme directly, and it shifts the immune response. Five mechanisms have been proposed and evidence exists for each; which one matters in a given infection is still argued. What is not in doubt is the side effect: the phosphorylated drug builds up inside red blood cells, which cannot remove it, and they break apart.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 54,
    pricing: {
      synthesisCostPerDose:
        'US$21 to US$63 per 12-week course, projected minimum cost of manufacture at a scale of one million courses per year (Hill et al., Clin Infect Dis 2014), where ribavirin was ranked the least complex to synthesise of the five hepatitis C drugs assessed',
      retailPricePerDoseOrYear:
        'US$0.4507 per tablet, the one listed product at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'No markup is stated because the two figures are not in the same units: the published cost is per 12-week course and the surveyed price is per tablet, and converting between them requires a daily dose this page does not supply. The surveyed figure is also what pharmacies pay to acquire the generic oral tablet, not what a patient is charged, and it does not describe the aerosol formulation, which is a different product at a different price. Ribavirin has been generic in the United States for many years and is on the WHO Model List of Essential Medicines.',
      synthesisComplexity: 'Low',
      costSource: {
        label:
          'Hill A, Khoo S, Fortunak J, Simmons B, Ford N. Minimum costs for producing hepatitis C direct-acting antivirals for use in large-scale treatment access programs in developing countries. Clin Infect Dis 2014;58:928-936',
        identifier: '10.1093/cid/ciu012',
        kind: 'doi',
      },
      priceSource: {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey, generic listing effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    },
    substitutes: {
      summary:
        'In hepatitis C the substitute for ribavirin is not another drug but the whole modern regimen: the direct-acting antivirals cure more people in eight to twelve weeks than interferon with ribavirin did in forty-eight, without the anemia. In Lassa fever and in severe RSV there is no approved alternative at all, which is the reason ribavirin is still given for both despite the state of the evidence.',
      conventionalRx: [
        {
          name: 'Sofosbuvir/velpatasvir (Epclusa)',
          class: 'Pan-genotypic direct-acting antiviral combination',
          howItCompares:
            'Cures well over 90% of all six genotypes in 12 weeks with no interferon and, in most patients, no ribavirin. This is what removed ribavirin from routine hepatitis C care rather than any trial that tested ribavirin against it directly.',
          typicalCost:
            'US$866.40 per tablet, median across the two listed products at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: far higher cure rate, far shorter course, no hemolytic anemia. Cons: several thousand times the acquisition price per tablet.',
        },
        {
          name: 'Glecaprevir/pibrentasvir (Mavyret)',
          class: 'Pan-genotypic direct-acting antiviral combination',
          howItCompares:
            'Eight weeks for most previously untreated patients, including those with compensated cirrhosis, and usable on dialysis. Ribavirin is not part of it.',
          typicalCost:
            'US$152.92 per tablet, median across the three listed products at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: shortest curative course available. Cons: three tablets daily; contraindicated in Child-Pugh B or C liver disease.',
        },
        {
          name: 'Supportive care alone, in Lassa fever and in RSV',
          class: 'Not a drug',
          howItCompares:
            'For Lassa fever, systematic review of 13 published and unpublished comparative studies found all of them at critical or serious risk of bias, and the authors concluded that robust evidence supporting ribavirin is lacking. For RSV, pooled randomised mortality data across four trials did not reach significance.',
          typicalCost: 'No acquisition cost',
          prosAndCons:
            'Pros: no hemolysis, no teratogenic exposure. Cons: in Lassa fever this means withdrawing the only treatment that exists, on the strength of an absence of evidence rather than evidence of absence.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Settle contraception before the first dose, not after',
          action:
            'Confirm a negative pregnancy test and an agreed contraception plan covering both partners, and know that the requirement continues long after the last dose.',
          patientImpact:
            'Ribavirin has a multiple-dose half-life of 12 days and may persist in non-plasma compartments for as long as six months. The label requires avoiding pregnancy during therapy and for nine months afterwards in female patients, and for six months in the female partners of male patients.',
          clinicalPrecaution:
            'This is a boxed warning and a contraindication, not advice. Significant teratogenic and embryocidal effects have been demonstrated in every animal species tested.',
        },
        {
          name: 'Say whether you have ever had heart trouble',
          action:
            'Report any angina, previous heart attack, heart failure or arrhythmia before starting, and ask when your hemoglobin will next be checked.',
          patientImpact:
            'Ribavirin causes hemolytic anemia, and the label records that the resulting anemia has led to fatal and non-fatal myocardial infarction. Patients with a history of significant or unstable cardiac disease should not be treated with it.',
          clinicalPrecaution:
            'The anemia is dose-related and predictable rather than idiosyncratic, which is why it is monitored rather than merely watched for.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1=NC(=NN1[C@H]2[C@@H]([C@@H]([C@H](O2)CO)O)O)C(=O)N',
      chemicalFormula: 'C8H12N4O5',
      molecularWeight: '244.20 g/mol',
      targetReceptorAffinity:
        'No single binding affinity can be quoted, because no single target is established. Against Lassa virus in cell culture the systematically reviewed EC50 values ranged from 0.6 to 21.72 micrograms per millilitre with a mean of 7, and EC90 values from 1.5 to 29 with a mean of 15 — a spread of more than thirtyfold across published in-vitro studies of the same virus.',
      structureSource: {
        label: 'PubChem CID 37542 (ribavirin) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/37542',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'rbv-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Anomeric configuration of the ribose, not just the mass',
          description:
            'Confirm that the sugar is attached in the beta configuration at the anomeric carbon and that the heterocycle is 1,2,4-triazole-3-carboxamide rather than a regioisomer. The alpha anomer and the N2-linked regioisomer have the same molecular formula and the same mass spectrum as the drug and are not the drug.',
          reagentsAndBuffer:
            '1H and 13C NMR in DMSO-d6 with NOE correlation across the glycosidic bond, optical rotation against a reference standard, HPLC against USP ribavirin reference standard, Karl Fischer titration',
        },
        {
          id: 'rbv-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Vorbrüggen glycosylation and ammonolysis',
          description:
            'Couple the silylated triazole ester to a peracetylated ribofuranose under Lewis acid catalysis, which sets the beta configuration by neighbouring-group participation from the 2-acetate, then convert the ester to the primary carboxamide with ammonia. Ribavirin was ranked the least complex to synthesise of the five hepatitis C antivirals costed by Hill and colleagues, and this two-step route is why.',
          dependsOnStepId: 'rbv-w1',
          reagentsAndBuffer:
            '1,2,4-triazole-3-carboxylic acid methyl ester, 1,2,3,5-tetra-O-acetyl-beta-D-ribofuranose, N,O-bis(trimethylsilyl)acetamide, trimethylsilyl trifluoromethanesulfonate in acetonitrile, then methanolic ammonia',
        },
        {
          id: 'rbv-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation away from the anomer and the free base',
          description:
            'Recrystallise to remove the alpha anomer, unreacted triazole carboxamide and partially deacetylated intermediates. Ribavirin is highly water-soluble and poorly retained on standard reversed-phase columns, so crystallisation rather than preparative chromatography is the practical purification.',
          dependsOnStepId: 'rbv-w2',
          reagentsAndBuffer:
            'Hot methanol or aqueous ethanol recrystallisation, activated charcoal treatment, HILIC or ion-pair HPLC for purity because the compound is too polar for conventional C18 retention',
        },
        {
          id: 'rbv-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Dosing with the guanosine content of the medium controlled',
          description:
            'Dose virus-infected or replicon-bearing cells in defined medium, running a parallel arm supplemented with exogenous guanosine. Ribavirin enters cells through equilibrative nucleoside transporters, so a line with low ENT1 expression will read as resistant for reasons that have nothing to do with the virus, and any effect that runs through depletion of the guanosine pool is reversed by adding guanosine back.',
          dependsOnStepId: 'rbv-w3',
          reagentsAndBuffer:
            'Defined nucleoside-free medium, exogenous guanosine rescue arm, ENT1 expression confirmed by transporter inhibition with dipyridamole or NBMPR, replicon or infectious virus system with matched multiplicity of infection',
        },
        {
          id: 'rbv-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Measure mutation frequency alongside viral titre',
          description:
            'Report the antiviral effect and the mutation rate of the surviving viral population in the same experiment, with and without guanosine rescue. This is the experiment that discriminates between the proposed mechanisms: if the antiviral effect tracks mutation frequency and survives guanosine rescue it is lethal mutagenesis, and if it disappears on rescue it was depletion of the guanosine pool. Reporting only a titre reduction cannot tell the two apart, which is a large part of why the mechanism is still argued after forty years.',
          dependsOnStepId: 'rbv-w4',
          reagentsAndBuffer:
            'Plaque assay or TCID50 for infectious titre, quantitative PCR for genome copies, deep sequencing of the viral population for transition mutation frequency, specific infectivity calculated as plaque-forming units per genome copy',
        },
      ],
    },
    keyAudits: [
      {
        id: 'rbv-a1',
        category: 'measured',
        title: 'Adding ribavirin to interferon tripled the hepatitis C cure rate',
        laymanSummary:
          'In 1998, 912 people were randomly assigned to interferon alone or interferon with ribavirin. At forty-eight weeks, 13% of those on interferon alone were cured, against 38% of those who also took ribavirin.',
        technicalDetails:
          'The Hepatitis Interventional Therapy Group randomised 912 patients with chronic hepatitis C to interferon alfa-2b alone or with ribavirin, for 24 or 48 weeks. Sustained virologic response was 38% (87 of 228) with combination therapy for 48 weeks and 31% (70 of 228) for 24 weeks, against 13% (29 of 225) and 6% (13 of 231) with interferon alone, P<0.001 for both comparisons. Histologic improvement was also more common on combination therapy: 61% and 57% against 41% and 44%. Dose reduction and discontinuation were more frequent with ribavirin.',
        evidenceSource: 'McHutchison JG et al., N Engl J Med 1998;339:1485-1492',
        doi: '10.1056/NEJM199811193392101',
        measuredMetric:
          'Sustained virologic response at 24 weeks post-treatment, ribavirin added to interferon against interferon alone',
        auditFlag: 'verified',
      },
      {
        id: 'rbv-a2',
        category: 'measured',
        title: 'A placebo arm isolated ribavirin’s own contribution: 56% against 29%',
        laymanSummary:
          'Four years later a larger trial gave everyone the same peginterferon and randomised only whether they also got ribavirin or a matching placebo. Ribavirin nearly doubled the cure rate on its own.',
        technicalDetails:
          'Fried and colleagues randomised 1,121 patients to peginterferon alfa-2a with daily ribavirin, peginterferon alfa-2a with daily placebo, or interferon alfa-2b with ribavirin, all for 48 weeks. Sustained virologic response was 56% with peginterferon plus ribavirin against 29% with peginterferon plus placebo (P<0.001) and 44% with interferon alfa-2b plus ribavirin (P<0.001). In genotype 1 the corresponding figures were 46%, 21% and 36%; in genotype 1 with high baseline viral load, 41%, 13% and 33%. The placebo arm is what makes this a measurement of ribavirin rather than of a regimen.',
        evidenceSource: 'Fried MW et al., N Engl J Med 2002;347:975-982',
        doi: '10.1056/NEJMoa020047',
        measuredMetric:
          'Sustained virologic response with ribavirin against matching placebo on identical peginterferon',
        auditFlag: 'verified',
      },
      {
        id: 'rbv-a3',
        category: 'inferred',
        title: 'Forty years in, the mechanism of action is still five hypotheses',
        laymanSummary:
          'Nobody has established how ribavirin works. Five separate explanations have been proposed, evidence exists for each of them, and which one applies probably differs between viruses.',
        technicalDetails:
          'The five proposed mechanisms are two indirect — inhibition of inosine monophosphate dehydrogenase, which depletes the intracellular GTP pool, and immunomodulatory effects — and three direct: interference with viral RNA capping, direct polymerase inhibition, and lethal mutagenesis. The mutagenesis case is the best characterised: ribavirin triphosphate is used by poliovirus 3Dpol and templates cytidine and uridine with equal efficiency, reducing infectious virus production to as little as 0.00001% in cell culture, with antiviral activity correlating directly with mutagenic activity. That is a clean result in poliovirus. It has never been established as the operative mechanism in hepatitis C, where ribavirin alone barely moves viral load at all.',
        evidenceSource:
          'Graci JD, Cameron CE. Mechanisms of action of ribavirin against distinct viruses. Rev Med Virol 2006;16:37-48; and Crotty S et al., Nat Med 2000;6:1375-1379',
        doi: '10.1002/rmv.483',
        inferredClaim:
          'That ribavirin’s clinical benefit in hepatitis C is explained by any one of its five proposed mechanisms — evidence exists for each and none has been established as the operative one in this disease',
        auditFlag: 'contested',
      },
      {
        id: 'rbv-a4',
        category: 'failed',
        title: 'The label carries a boxed warning that the drug does not work alone',
        laymanSummary:
          'One of the three boxed warnings on ribavirin says, in plain terms, that ribavirin by itself does not treat chronic hepatitis C and must not be used that way.',
        technicalDetails:
          'The boxed warning is headed EMBRYO-FETAL TOXICITY, HEMOLYTIC ANEMIA, and MONOTHERAPY NOT RECOMMENDED, and states that ribavirin monotherapy is not effective for the treatment of chronic hepatitis C virus infection and should not be used alone for this indication. This is a rare thing for a label to say about its own product, and it is the single clearest statement of the gap between ribavirin’s broad in-vitro activity and its narrow clinical effect: against hepatitis C the measurable benefit appears only in combination, largely as a reduction in relapse after treatment stops rather than as faster viral clearance during it.',
        evidenceSource:
          'Ribavirin tablets United States prescribing information, boxed warning (Aurobindo Pharma Limited labelling, openFDA)',
        auditFlag: 'caution',
      },
      {
        id: 'rbv-a5',
        category: 'failed',
        title: 'Hemolytic anemia that has led to fatal myocardial infarction',
        laymanSummary:
          'Ribavirin destroys red blood cells. In people whose hearts were already struggling, the resulting anemia has caused heart attacks, some of them fatal. It is also teratogenic in every animal species that has been tested, and it stays in the body for months.',
        technicalDetails:
          'The boxed warning records that hemolytic anemia has been reported with ribavirin therapy and may result in worsening of cardiac disease that has led to fatal and non-fatal myocardial infarctions; patients with a history of significant or unstable cardiac disease should not be treated. Separately, significant teratogenic and embryocidal effects have been demonstrated in all animal species exposed to ribavirin; the multiple-dose half-life is 12 days and the drug may persist in non-plasma compartments for as long as six months, which is why the contraception requirement extends nine months beyond treatment in female patients and six months in the female partners of male patients. The mechanism of the anemia is straightforward and follows from the drug’s chemistry: erythrocytes phosphorylate ribavirin and lack the phosphatase to reverse it, so the triphosphate accumulates and the cell is destroyed.',
        evidenceSource:
          'Ribavirin tablets United States prescribing information, boxed warning and Warnings and Precautions 5.1 and 5.2 (openFDA)',
        measuredMetric: 'Multiple-dose half-life of 12 days; persistence in tissue up to 6 months',
        auditFlag: 'caution',
      },
      {
        id: 'rbv-a6',
        category: 'conclusion_shift',
        title: 'Lassa fever: the only treatment there is, and the evidence for it has collapsed',
        laymanSummary:
          'Ribavirin has been the standard treatment for Lassa fever in West Africa since the 1980s, on the strength of a single study. Reanalysis of that study and of every other comparison found all of them critically biased, and one reanalysis raised the possibility that ribavirin is harmful in some patients.',
        technicalDetails:
          'A systematic review searching published and unpublished literature to March 2022, including data obtained from a Sierra Leone study through a United States Freedom of Information Act request, identified 13 studies comparing ribavirin against no ribavirin on mortality. Ribavirin was associated with decreased mortality in these studies, but every one was at critical or serious risk of bias on the ROBINS-I tool, with problems of uncontrolled confounding, immortal time bias and missing outcome data. The authors concluded that robust evidence supporting the use of ribavirin in Lassa fever is lacking. A companion systematic review of pre-clinical and pharmacokinetic data found in-vitro EC50 values spanning 0.6 to 21.72 micrograms per millilitre and modelling suggesting current regimens exceed the mean EC50 for less than 20% of the time and the mean EC90 for less than 10% — meaning the doses in clinical use may not reach the concentrations that inhibit the virus. The same authors, writing separately, stated that reanalysis of previously unpublished data reveals ribavirin may actually be harmful in some Lassa fever patients.',
        evidenceSource:
          'Cheng HY et al., Emerg Infect Dis 2022;28:1559-1568; Salam AP et al., PLoS Negl Trop Dis 2022;16:e0010289; Salam AP et al., PLoS Negl Trop Dis 2021;15:e0009522',
        doi: '10.3201/eid2808.211787',
        measuredMetric:
          'Risk-of-bias assessment of all 13 comparative studies: critical or serious on ROBINS-I',
        auditFlag: 'contested',
      },
      {
        id: 'rbv-a7',
        category: 'failed',
        title: 'The 1985 approval, for RSV, was never confirmed by an adequately powered trial',
        laymanSummary:
          'Ribavirin’s original approval was as a mist for infants with severe RSV. Twenty-five years and twelve randomised trials later, the pooled mortality difference was still not statistically significant, and the reviewers said the trials were too small to answer the question.',
        technicalDetails:
          'The Cochrane review of aerosolised ribavirin for RSV lower respiratory tract infection included 12 randomised trials, all in infants under six months. Across four trials with 158 participants, mortality was 5.8% with ribavirin against 9.7% with placebo, odds ratio 0.58 (95% CI 0.18 to 1.85). Across three trials with 116 participants, respiratory deterioration was 7.1% against 18.3%, odds ratio 0.37 (95% CI 0.12 to 1.18). In three studies of 104 ventilated participants the mean difference was 1.9 fewer days of hospitalisation (95% CI -4.6 to +0.9) and 1.8 fewer days of ventilation (95% CI -3.4 to -0.2). The reviewers concluded that trials of ribavirin for RSV lack sufficient power to provide reliable estimates of the effects. The aerosol label carries its own separate warnings about drug precipitate causing mechanical ventilator dysfunction and about sudden deterioration of respiratory function in infants.',
        evidenceSource:
          'Ventre K, Randolph AG. Ribavirin for respiratory syncytial virus infection of the lower respiratory tract in infants and young children. Cochrane Database Syst Rev 2010;(5):CD000181',
        doi: '10.1002/14651858.CD000181.pub4',
        measuredMetric:
          'Pooled mortality odds ratio 0.58 (95% CI 0.18 to 1.85) across four randomised trials, 158 participants',
        auditFlag: 'contested',
      },
      {
        id: 'rbv-a8',
        category: 'conclusion_shift',
        title: 'From the backbone of every hepatitis C regimen to almost nothing',
        laymanSummary:
          'Between 1998 and 2013 no hepatitis C regimen omitted ribavirin. Within about five years of the direct-acting antivirals arriving, it had been designed out of nearly every recommended course.',
        technicalDetails:
          'The change was not driven by a trial that tested ribavirin and found it wanting. It was driven by regimens that reached cure rates in the high nineties without it: where an eight or twelve week all-oral course cures more than 95%, the 27-point contribution ribavirin made on top of peginterferon has no room left to act, and its hemolytic anemia becomes pure cost. Ribavirin survives in a small number of specific situations named in direct-acting antiviral labels, and as the only agent for Lassa fever. The trajectory is the ordinary one for an adjunct whose value was always relative to a weak backbone, but it is worth recording that a drug can go from indispensable to near-obsolete without any new evidence about the drug itself.',
        evidenceSource:
          'Contrast between Fried MW et al., N Engl J Med 2002;347:975-982 and the direct-acting antiviral registrational programmes summarised in Jakobsen JC et al., Cochrane Database Syst Rev 2017;9:CD012143',
        doi: '10.1002/14651858.CD012143.pub3',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Taken as a tablet, or breathed in as a mist',
        laymanDesc:
          'Two completely different products share the same molecule: an oral tablet or capsule used in hepatitis C, and an aerosol given to hospitalised infants with RSV.',
        molecularDetail:
          'Oral ribavirin is well absorbed and widely distributed, with a multiple-dose half-life of 12 days and persistence in non-plasma compartments for up to six months. The inhalation solution is delivered by small-particle aerosol generator and carries separate warnings about drug precipitate obstructing mechanical ventilators.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Carried into cells by the transporters meant for real nucleosides',
        laymanDesc:
          'Because it looks like guanosine, the cell’s own nucleoside doorways let it in. Red blood cells let it in too, and that is where the trouble starts.',
        molecularDetail:
          'Uptake is via equilibrative nucleoside transporters, principally ENT1. Intracellular kinases phosphorylate it to the mono-, di- and triphosphate. Erythrocytes phosphorylate it but lack the phosphatase to reverse the reaction, so the triphosphate accumulates and causes dose-dependent hemolysis.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Five things it could be doing, and nobody has settled which',
        laymanDesc:
          'It can starve the cell of real guanosine, get inserted into viral genomes and cause copying errors, interfere with the cap a virus puts on its messages, slow the copying enzyme directly, or shift the immune response. Evidence exists for all five.',
        molecularDetail:
          'Proposed mechanisms: inhibition of inosine monophosphate dehydrogenase depleting the GTP pool; lethal mutagenesis, since ribavirin triphosphate templates cytidine and uridine with equal efficiency; interference with RNA capping; direct RNA-dependent RNA polymerase inhibition; and immunomodulation. Distinct virus and host combinations may favour different mechanisms.',
        iconName: 'HelpCircle',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'In hepatitis C the visible effect is on relapse, not on viral load',
        laymanDesc:
          'Ribavirin alone barely changes the amount of virus in the blood. What it changes is how many people relapse after interferon stops, which is why it only ever worked as a partner.',
        molecularDetail:
          'The label’s own boxed warning states that ribavirin monotherapy is not effective for chronic hepatitis C. Its measurable contribution appears as a difference in sustained response rather than in on-treatment viral kinetics, which is one of the reasons the mechanism has resisted identification in this disease.',
        iconName: 'Ban',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'It tripled the cure rate for fifteen years',
        laymanDesc:
          'With interferon alone, roughly one in eight people were cured. Adding ribavirin took that to roughly two in five, and adding it to peginterferon took 29% to 56%.',
        molecularDetail:
          'SVR was 38% against 13% at 48 weeks in 912 randomised patients on interferon alfa-2b, and 56% against 29% in 1,121 randomised patients on peginterferon alfa-2a with matching placebo. In genotype 1 the peginterferon figures were 46% against 21%.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'The price was anemia, teratogenicity and a long tail',
        laymanDesc:
          'Red cells break apart, and in people with heart disease the anemia has caused fatal heart attacks. It also damages developing embryos in every animal species tested and lingers in the body for months after the last dose.',
        molecularDetail:
          'Three boxed warnings: embryo-fetal toxicity, hemolytic anemia leading to fatal and non-fatal myocardial infarction, and monotherapy not recommended. Contraception is required for nine months after treatment in female patients and six months in the female partners of male patients.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Hepatitis Interventional Therapy Group (McHutchison 1998, N Engl J Med)',
        phase: 'Phase 3, randomised, interferon alfa-2b with or without ribavirin',
        sampleSize: 912,
        primaryEndpoint:
          'Sustained virologic response, undetectable serum HCV RNA 24 weeks after treatment',
        endpointMet: true,
        statisticalPValue:
          '38% (87/228) at 48 weeks and 31% (70/228) at 24 weeks with ribavirin, against 13% (29/225) and 6% (13/231) without; P<0.001',
        unreportedAdverseSignals:
          'Dose reduction and discontinuation were more frequent with ribavirin, and the paper does not resolve how much of the added benefit was offset by the added toxicity.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Fried 2002, N Engl J Med — peginterferon alfa-2a with ribavirin or placebo',
        phase: 'Phase 3, randomised, three-arm, with a matching placebo arm',
        sampleSize: 1121,
        primaryEndpoint:
          'Sustained virologic response, undetectable HCV RNA 24 weeks after cessation of therapy',
        endpointMet: true,
        statisticalPValue:
          '56% with peginterferon plus ribavirin against 29% with peginterferon plus placebo and 44% with interferon alfa-2b plus ribavirin; P<0.001 for both comparisons',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Cochrane CD000181 — aerosolised ribavirin for RSV in infants',
        phase: 'Systematic review of 12 randomised placebo-controlled trials',
        sampleSize: 158,
        primaryEndpoint: 'Mortality in infants with RSV lower respiratory tract infection',
        endpointMet: false,
        statisticalPValue:
          'Mortality 5.8% against 9.7%, odds ratio 0.58 (95% CI 0.18 to 1.85) across four trials with 158 participants — the confidence interval crosses 1',
        unreportedAdverseSignals:
          'The reviewers state the trials lack sufficient power to provide reliable estimates. Occupational exposure of ward staff to aerosolised ribavirin, a known teratogen, is a documented concern that the efficacy trials were not designed to quantify.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'Cheng 2022, Emerg Infect Dis — ribavirin for Lassa fever',
        phase: 'Systematic review of 13 published and unpublished comparative studies',
        sampleSize: 13,
        primaryEndpoint: 'Mortality with ribavirin against no ribavirin in Lassa fever',
        endpointMet: false,
        statisticalPValue:
          'Ribavirin was associated with decreased mortality, but every one of the 13 studies was at critical or serious risk of bias on ROBINS-I, so no pooled estimate was considered reliable',
        unreportedAdverseSignals:
          'Unpublished data from a Sierra Leone study had to be obtained through a Freedom of Information Act request. Uncontrolled confounding, immortal time bias and missing outcome data were the recurring problems.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Sustained virologic response 38% against 13% at 48 weeks when ribavirin was added to interferon alfa-2b in 912 randomised patients',
        '56% against 29% when ribavirin was added to peginterferon alfa-2a against a matching placebo in 1,121 randomised patients',
        'Multiple-dose half-life of 12 days, with persistence in non-plasma compartments up to six months',
        'Ribavirin triphosphate templates cytidine and uridine with equal efficiency in poliovirus 3Dpol, reducing infectious virus to as little as 0.00001% in cell culture',
        'In-vitro Lassa virus EC50 across published studies ranged from 0.6 to 21.72 micrograms per millilitre',
      ],
      unsupportedInferences: [
        'That the mechanism of action is known — five mechanisms have been proposed, evidence exists for each, and none is established in hepatitis C',
        'That lethal mutagenesis, demonstrated cleanly in poliovirus, is what ribavirin does in hepatitis C',
        'That ribavirin reduces mortality in Lassa fever — the association exists in every comparative study and every one of those studies is at critical or serious risk of bias',
        'That broad in-vitro activity against many RNA viruses predicts clinical benefit against them; the drug is active in a dish against far more viruses than it treats',
        'That doses in clinical use for Lassa fever reach inhibitory concentrations — modelling suggests they exceed the mean EC90 less than 10% of the time',
      ],
      whatFailedInitially: [
        'Ribavirin monotherapy does not treat chronic hepatitis C, and the label says so in a boxed warning',
        'Hemolytic anemia has caused fatal and non-fatal myocardial infarction; patients with significant or unstable cardiac disease must not receive it',
        'Teratogenic and embryocidal in every animal species tested, with a contraception requirement extending nine months past the last dose',
        'The original 1985 RSV indication was never confirmed: twelve randomised trials pooled to an odds ratio for mortality of 0.58 with a confidence interval from 0.18 to 1.85',
        'The Lassa fever evidence base, reassessed with unpublished data obtained by Freedom of Information request, was judged incapable of supporting the recommendation it has carried since the 1980s',
      ],
      realWorldOutcome: [
        'Approved 1985 as an aerosol for RSV; oral forms for hepatitis C followed in 1998 and 2002',
        'The backbone of every hepatitis C regimen from 1998 until the direct-acting antivirals, then designed out of nearly all of them within about five years',
        'Long generic, inexpensive, and on the WHO Model List of Essential Medicines',
        'Still the only drug given for Lassa fever, because nothing else exists — not because the evidence improved',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, capsule and solution; separately, an inhalation solution given by small-particle aerosol',
      description:
        'The oral forms are used in hepatitis C in combination with peginterferon or with certain direct-acting antiviral regimens. The inhalation solution is a distinct product for hospitalised infants and young children with severe RSV lower respiratory tract infection and is not indicated in adults.',
      safetyProfile:
        'Three boxed warnings on the oral product: embryo-fetal toxicity, hemolytic anemia, and monotherapy not recommended. Contraindicated in pregnancy, in the male partners of pregnant women, and in patients with a history of significant or unstable cardiac disease. The anemia is dose-related and monitored rather than merely watched for. The aerosol product carries separate warnings: accumulated drug precipitate has caused mechanical ventilator dysfunction with raised pulmonary pressures, and sudden deterioration of respiratory function has followed initiation in infants. Occupational exposure of healthcare staff to a teratogenic aerosol is a recognised handling concern.',
    },
    commonQuestions: [
      {
        q: 'How does ribavirin work?',
        a: 'That is genuinely unresolved, and it has been unresolved since before the drug was approved in 1985. Five mechanisms have been proposed and there is published evidence for each: it inhibits an enzyme called IMPDH and so starves the cell of guanosine; it gets built into viral genomes and causes so many copying errors that the virus mutates itself into extinction; it interferes with the protective cap a virus puts on its messenger RNA; it slows the viral copying enzyme directly; and it shifts the immune response. The mutagenesis mechanism has been demonstrated cleanly in poliovirus. Whether it is what ribavirin does in hepatitis C has never been established, and the fact that ribavirin alone barely changes hepatitis C viral load argues against a simple direct antiviral explanation there.',
      },
      {
        q: 'Why does the label say it does not work on its own?',
        a: 'Because it does not, and the FDA required that to be stated in a boxed warning rather than buried in the text. Given alone against chronic hepatitis C, ribavirin lowers liver enzymes somewhat and does not clear the virus. Its measurable benefit appears only in combination, and it shows up as fewer relapses after treatment ends rather than as faster clearance during treatment. This is unusual enough to be worth noticing: a drug can carry a real, replicated, randomised benefit as a partner and no benefit at all by itself.',
        auditNote:
          'The boxed warning is the label contradicting the intuitive reading of the drug’s broad in-vitro activity. It is the most useful sentence on the document.',
      },
      {
        q: 'Is ribavirin still used for hepatitis C?',
        a: 'Rarely. Between 1998 and 2013 nothing else was on offer and every regimen included it. The direct-acting antivirals now cure well over 90% of people in eight to twelve weeks without interferon and, in most cases, without ribavirin. Nothing was discovered about ribavirin that made it worse — the 56% against 29% result still stands. It simply had nothing left to add once the backbone regimen was curing almost everyone, and its hemolytic anemia stopped being a price worth paying. It survives in a handful of specific situations named in modern antiviral labels.',
      },
      {
        q: 'Is it safe in pregnancy?',
        a: 'No, and the restriction is stricter and longer than most people expect. Significant teratogenic and embryocidal effects have been demonstrated in all animal species tested. Ribavirin has a multiple-dose half-life of 12 days and may remain in non-plasma compartments for as long as six months, so the label requires avoiding pregnancy during treatment and for nine months after it in female patients, and for six months in the female partners of male patients. It is contraindicated in women who are pregnant and in the male partners of women who are pregnant. The same teratogenicity is why the aerosol form raises occupational handling concerns for hospital staff.',
      },
      {
        q: 'Why is it still the treatment for Lassa fever if the evidence is that weak?',
        a: 'Because there is nothing else. Ribavirin became the standard of care in West Africa in the 1980s on the strength of one clinical study, and that recommendation was never revisited for thirty years. When it finally was, a systematic review that went as far as obtaining unpublished data through a Freedom of Information Act request found thirteen comparative studies, every one of them at critical or serious risk of bias from uncontrolled confounding, immortal time bias or missing outcomes. A companion analysis of the pharmacology suggested that the doses actually given may not reach the concentrations that inhibit the virus in a dish for most of the dosing interval, and the same group reported that reanalysis raised the possibility of harm in some patients. None of that proves ribavirin does not work. It establishes that after forty years nobody knows, which for the only available treatment for a fatal viral hemorrhagic fever is its own kind of finding.',
        auditNote:
          'Absence of reliable evidence is not evidence of absence of effect. The reviewers called for well-conducted trials, not for withdrawal.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'McHutchison JG et al. Interferon alfa-2b alone or in combination with ribavirin as initial treatment for chronic hepatitis C. N Engl J Med 1998;339:1485-1492',
        identifier: '10.1056/NEJM199811193392101',
        kind: 'doi',
      },
      {
        label:
          'Fried MW et al. Peginterferon alfa-2a plus ribavirin for chronic hepatitis C virus infection. N Engl J Med 2002;347:975-982',
        identifier: '10.1056/NEJMoa020047',
        kind: 'doi',
      },
      {
        label:
          'Graci JD, Cameron CE. Mechanisms of action of ribavirin against distinct viruses. Rev Med Virol 2006;16:37-48',
        identifier: '10.1002/rmv.483',
        kind: 'doi',
      },
      {
        label:
          'Crotty S et al. The broad-spectrum antiviral ribonucleoside ribavirin is an RNA virus mutagen. Nat Med 2000;6:1375-1379',
        identifier: '10.1038/82191',
        kind: 'doi',
      },
      {
        label:
          'Ventre K, Randolph AG. Ribavirin for respiratory syncytial virus infection of the lower respiratory tract in infants and young children. Cochrane Database Syst Rev 2010;(5):CD000181',
        identifier: '10.1002/14651858.CD000181.pub4',
        kind: 'doi',
      },
      {
        label:
          'Cheng HY et al. Lack of evidence for ribavirin treatment of Lassa fever in systematic review of published and unpublished studies. Emerg Infect Dis 2022;28:1559-1568',
        identifier: '10.3201/eid2808.211787',
        kind: 'doi',
      },
      {
        label:
          'Salam AP et al. Ribavirin for treating Lassa fever: a systematic review of pre-clinical studies and implications for human dosing. PLoS Negl Trop Dis 2022;16:e0010289',
        identifier: '10.1371/journal.pntd.0010289',
        kind: 'doi',
      },
      {
        label:
          'Salam AP, Cheng V, Edwards T, Olliaro P, Sterne J, Horby P. Time to reconsider the role of ribavirin in Lassa fever. PLoS Negl Trop Dis 2021;15:e0009522',
        identifier: '10.1371/journal.pntd.0009522',
        kind: 'doi',
      },
      {
        label:
          'Hill A, Khoo S, Fortunak J, Simmons B, Ford N. Minimum costs for producing hepatitis C direct-acting antivirals for use in large-scale treatment access programs in developing countries. Clin Infect Dis 2014;58:928-936',
        identifier: '10.1093/cid/ciu012',
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
          'Ribavirin tablets United States prescribing information — boxed warning for embryo-fetal toxicity, hemolytic anemia and monotherapy not recommended (openFDA drug label endpoint)',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22RIBAVIRIN%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 37542 — ribavirin structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/37542',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 7. Entecavir — the highest resistance barrier in hepatitis B, a suppression rather than a cure,
  //    and a trial in which the virological endpoint separated by a mile while the clinical score
  //    did not separate at all.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'entecavir',
    name: 'Entecavir',
    tradeName: 'Baraclude',
    sponsor: 'Bristol Myers Squibb',
    targetGene:
      'HBV P gene, reverse transcriptase domain — a hepatitis B viral gene, not a human one',
    targetProtein:
      'Hepatitis B virus reverse transcriptase, the polymerase domain of the viral P protein, which copies the pregenomic RNA back into DNA inside the assembling virus particle',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2005,
    indication:
      'Chronic hepatitis B virus infection in adults and children aged 2 years and older with evidence of active viral replication and either persistently elevated serum aminotransferases or histologically active disease, including patients with compensated or decompensated liver disease and patients with lamivudine-resistant virus',
    patientFriendlyIndication: 'Long-standing hepatitis B infection of the liver',
    anatomicalSite:
      'Hepatocyte cytoplasm, inside the assembling viral core particle — and pointedly not the nucleus, where the covalently closed circular DNA reservoir sits untouched',
    conditionContext: {
      conditionExplainer:
        'Hepatitis B keeps a master copy of itself in the nucleus of the liver cell, as a small ring of DNA called cccDNA. Everything else the virus makes is printed from that master. No approved drug removes it, which is why hepatitis B is suppressed rather than cured, and why the virus comes back when treatment stops.',
      whyItMatters:
        'Hepatitis B kills through cirrhosis and liver cancer over decades, and the risk tracks how much virus is circulating. Entecavir drives circulating virus below the limit of detection in most people and keeps it there for years without the virus learning to escape, which is the single hardest thing to achieve in this disease.',
      whoTakesThis:
        'Adults and children aged 2 and over with active chronic hepatitis B, usually indefinitely. Anyone co-infected with untreated HIV should not take it alone, and anyone stopping it needs months of monitoring.',
      clinicalGoals:
        'Undetectable HBV DNA and normal liver enzymes, sustained. Loss of hepatitis B surface antigen — the closest thing to a cure — happens in a small minority. In the pivotal trials the endpoint was a liver biopsy score, not a count of cancers or deaths.',
    },
    oneSentenceVerdict:
      'A deoxyguanosine analogue that blocks all three activities of the hepatitis B reverse transcriptase and has the highest resistance barrier of any drug in this disease — a cumulative 1.2% resistance at five years in previously untreated patients — which beat lamivudine on liver histology in two 700-patient double-blind trials, but which in patients whose livers were already failing suppressed virus three times better than adefovir (57% against 20% undetectable) while their Child-Turcotte-Pugh scores improved slightly less often (61% against 67%).',
    laymanHowItWorks:
      'Hepatitis B copies itself in an unusual way for a DNA virus: it first makes an RNA transcript, then copies that back into DNA using an enzyme it carries inside its own shell. Entecavir is a counterfeit version of one of the four DNA building blocks, and the cell converts it into an active form that the viral enzyme picks up instead of the real thing. It jams all three of the jobs that enzyme does, so no new viral DNA is finished. What it does not touch is the master ring of viral DNA already parked in the cell nucleus, which is why the virus returns when the tablets stop.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 72,
    pricing: {
      synthesisCostPerDose:
        'US$36 per person-year as a projected minimum sustainable generic price — US$4 a year of active ingredient at the 0.5 mg daily dose modelled, plus US$20 for formulation and packaging and a 50% margin (Hill et al., J Virus Erad 2015)',
      retailPricePerDoseOrYear:
        'US$0.2134 per tablet, median across the 21 listed products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
      markupEstimate:
        'Roughly twofold. On the same one-tablet-a-day basis the cost analysis used, the surveyed acquisition price comes to about US$78 a year against the US$36 projected minimum — the closest any drug in this group comes to its modelled floor, and a useful contrast with the several-hundredfold gaps on the hepatitis C pages',
      openPatentNotes:
        'Entecavir came off patent in the United States, China, Brazil and South Africa, with European expiry in 2017, and the price collapsed accordingly. The cost analysis notes that because the daily dose is 0.5 mg rather than 300 mg, the active ingredient tonnage needed to treat a given number of people is about 600 times lower than for tenofovir disoproxil fumarate — a structural reason this molecule is cheap to supply at scale that has nothing to do with negotiation.',
      synthesisComplexity: 'Moderate',
      costSource: {
        label:
          'Hill A, Gotham D, Cooke G, Bhagani S, Andrieux-Meyer I, Cohn J, Fortunak J. Analysis of minimum target prices for production of entecavir to treat hepatitis B in high- and low-income countries. J Virus Erad 2015;1:103-110',
        identifier: '10.1016/S2055-6640(20)30484-2',
        kind: 'doi',
      },
      priceSource: {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey, generic listing effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    },
    substitutes: {
      summary:
        'The realistic alternative is tenofovir, in either of its two forms, and international guidelines list both it and entecavir as first-line. The choice between them is the live argument in hepatitis B, and it turns on observational cancer data that no randomised trial has tested.',
      conventionalRx: [
        {
          name: 'Tenofovir disoproxil fumarate (Viread)',
          class: 'Nucleotide analogue reverse transcriptase inhibitor',
          howItCompares:
            'Equally recommended as first-line and equally effective on the surrogate endpoints. A large Korean cohort and a 20-study meta-analysis report lower hepatocellular carcinoma incidence on tenofovir; every one of those studies is observational. It works against lamivudine-resistant virus, where entecavir largely does not.',
          typicalCost:
            'Not listed in the CMS National Average Drug Acquisition Cost survey consulted for this page',
          prosAndCons:
            'Pros: retains activity against lamivudine-resistant HBV; the observational cancer signal favours it. Cons: kidney and bone effects with long-term use of this form.',
        },
        {
          name: 'Tenofovir alafenamide (Vemlidy)',
          class: 'Prodrug of the same nucleotide, at roughly a tenth of the plasma exposure',
          howItCompares:
            'Delivers the same active molecule to the hepatocyte with far lower circulating drug, which is what reduces the renal and bone signal. Same activity against lamivudine-resistant virus.',
          typicalCost:
            'Not listed in the CMS National Average Drug Acquisition Cost survey consulted for this page',
          prosAndCons:
            'Pros: better renal and bone profile than the older form. Cons: still on patent in most markets, so far more expensive than generic entecavir.',
        },
        {
          name: 'Peginterferon alfa-2a (Pegasys)',
          class: 'Immune-stimulating protein, given by injection for a fixed course',
          howItCompares:
            'The only hepatitis B treatment with a defined stopping point rather than indefinite duration, and the only one with a meaningful chance of surface antigen loss. It works in a minority and its side effects are systemic and severe.',
          typicalCost:
            'US$1,070.90 per millilitre at United States pharmacy acquisition cost (CMS NADAC, brand, effective 23 April 2025)',
          prosAndCons:
            'Pros: finite course; higher rate of functional cure in selected patients. Cons: injections, flu-like illness, depression, cytopenias; contraindicated in decompensated cirrhosis.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Do not stop without telling the person who prescribed it',
          action:
            'Treat stopping as a medical decision that needs monitoring, not as something to do because you feel well or ran out.',
          patientImpact:
            'Severe acute exacerbations of hepatitis B have been reported after anti-hepatitis B therapy is discontinued, including entecavir. The label requires liver function to be monitored closely for at least several months afterwards.',
          clinicalPrecaution:
            'This is a boxed warning. The flare happens because the virus rebounds from the untouched cccDNA reservoir and the immune system attacks the newly infected cells.',
        },
        {
          name: 'Get an HIV test before the first tablet',
          action:
            'Ask whether your HIV status is known and documented, even if you consider yourself low risk.',
          patientImpact:
            'Entecavir has weak activity against HIV. Given to someone with untreated HIV, it can select the M184V resistance substitution and compromise future HIV treatment options.',
          clinicalPrecaution:
            'The label states entecavir is not recommended for HIV/HBV co-infected patients who are not also receiving antiretroviral therapy. This is part of the boxed warning.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C=C1[C@H](C[C@@H]([C@H]1CO)O)N2C=NC3=C2N=C(NC3=O)N',
      chemicalFormula: 'C12H15N5O3',
      molecularWeight: '277.28 g/mol',
      targetReceptorAffinity:
        'Entecavir triphosphate competes with the natural substrate deoxyguanosine triphosphate and functionally inhibits all three activities of the HBV reverse transcriptase: base priming, reverse transcription of the negative strand from pregenomic messenger RNA, and synthesis of the positive strand. Its intracellular half-life is 15 hours. Selectivity for the viral enzyme is wide: it is only a weak inhibitor of cellular DNA polymerases alpha, beta and delta and of mitochondrial polymerase gamma, with Ki values from 18 to more than 160 micromolar.',
      structureSource: {
        label: 'PubChem CID 135398508 (entecavir) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/135398508',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'etv-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the carbocycle and the exocyclic methylene, not just the guanine',
          description:
            'Verify that the sugar has been replaced by a cyclopentane ring carrying an exocyclic alkene, and confirm all three stereocentres. Entecavir is a carbocyclic nucleoside: there is no ring oxygen, which is what makes it resistant to the phosphorylases that cleave ordinary nucleosides. A guanine-positive assay says nothing about whether the correct carbocycle is attached.',
          reagentsAndBuffer:
            'Chiral HPLC against reference standard, 1H and 13C NMR in DMSO-d6 with attention to the exocyclic methylene protons near 5 ppm, optical rotation, Karl Fischer titration',
        },
        {
          id: 'etv-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Build the chiral cyclopentane, then couple the purine',
          description:
            'Assemble the enantiopure carbocyclic core with its exocyclic methylene and hydroxymethyl group, then attach 2-amino-6-substituted purine at the correct nitrogen and unmask to guanine. Regiochemistry at the purine is the failure point: coupling at N7 instead of N9 gives an isomer with identical mass, identical elemental analysis and no antiviral activity.',
          dependsOnStepId: 'etv-w1',
          reagentsAndBuffer:
            'Enantiopure cyclopentanone or Wittig methylenation precursor, 2-amino-6-chloropurine, Mitsunobu conditions with triphenylphosphine and a dialkyl azodicarboxylate or a palladium-catalysed allylic substitution, then acid or base hydrolysis of the 6-chloro group',
        },
        {
          id: 'etv-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Separate the N7 regioisomer and the enantiomer',
          description:
            'Resolve the product from its N7-coupled regioisomer and from any enantiomeric contamination, then crystallise as the monohydrate. Both impurities co-elute on ordinary reversed-phase columns and both share the parent mass, so orthogonal methods are required rather than a single purity number.',
          dependsOnStepId: 'etv-w2',
          reagentsAndBuffer:
            'Preparative reversed-phase chromatography, chiral stationary phase for enantiomeric excess, ion-pair HPLC with ultraviolet detection at 254 nm to resolve N7 from N9, aqueous recrystallisation to the monohydrate',
        },
        {
          id: 'etv-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Dose HepG2.2.15 cells and confirm intracellular phosphorylation',
          description:
            'Dose a hepatoblastoma line stably transfected with the hepatitis B genome and measure both the extracellular virion DNA and the intracellular triphosphate. A carbocyclic nucleoside that is not phosphorylated is inert, and cell lines differ in the kinases that do it, so an apparent lack of potency in one line can be a kinase problem rather than a viral one.',
          dependsOnStepId: 'etv-w3',
          reagentsAndBuffer:
            'HepG2.2.15 or HepAD38 cells, DMEM with 10% fetal bovine serum and G418, LC-MS/MS quantification of entecavir triphosphate in cell lysate, parallel cytotoxicity readout to establish a selectivity index',
        },
        {
          id: 'etv-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'The lamivudine-resistance panel, which is where this drug fails',
          description:
            'Repeat the potency measurement against reverse transcriptase carrying rtM204I/V with and without rtL180M, and then with rtT184, rtS202 or rtM250 added. Reporting only wild-type potency would badly misdescribe entecavir: lamivudine-resistant backbones alone cost 8- to 30-fold, and adding a second-site change costs more than 70-fold. That single measurement predicts the clinical result — 1.2% resistance at five years in previously untreated patients against 12% by 96 weeks in lamivudine-refractory ones.',
          dependsOnStepId: 'etv-w4',
          reagentsAndBuffer:
            'Site-directed HBV reverse transcriptase mutants rtM204I/V, rtL180M, rtT184, rtS202, rtM250, rtI169 and rtA181C, transient transfection into Huh7 or HepG2, quantitative PCR of secreted HBV DNA, EC50 fold-change calculated against matched wild-type',
        },
      ],
    },
    keyAudits: [
      {
        id: 'etv-a1',
        category: 'measured',
        title: 'Beat lamivudine on liver biopsy in 715 double-blind patients',
        laymanSummary:
          'In the main trial, 715 people who had never taken a hepatitis B antiviral were randomly assigned entecavir or lamivudine for at least a year, with neither they nor their doctors knowing which. More of the entecavir group had measurably less inflammation on biopsy, and nearly twice as many had undetectable virus.',
        technicalDetails:
          'Study AI463022 randomised 715 nucleoside-naive HBeAg-positive patients to entecavir 0.5 mg or lamivudine 100 mg once daily for a minimum of 52 weeks, double-blind. Histologic improvement at week 48, defined as a decrease of at least two points in the Knodell necroinflammatory score without worsening of fibrosis, occurred in 226 of 314 (72%) on entecavir against 195 of 314 (62%) on lamivudine, P=0.009. Undetectable HBV DNA by PCR was 67% against 36% (P<0.001) and ALT normalisation 68% against 60% (P=0.02). Mean HBV DNA reduction was 6.9 against 5.4 log10 copies/mL, P<0.001. HBeAg seroconversion, the endpoint closest to a durable off-treatment response, was 21% against 18% and did not separate (P=0.33).',
        evidenceSource:
          'Chang TT et al., N Engl J Med 2006;354:1001-1010 (BEHoLD AI463022, NCT00035633)',
        doi: '10.1056/NEJMoa051285',
        measuredMetric:
          'Histologic improvement at week 48 on the Knodell necroinflammatory score, double-blind against lamivudine',
        auditFlag: 'verified',
      },
      {
        id: 'etv-a2',
        category: 'measured',
        title: 'Replicated in the HBeAg-negative population, 648 patients',
        laymanSummary:
          'The companion trial in a different form of the disease found the same pattern: better biopsies, and nine in ten with undetectable virus against seven in ten on the older drug.',
        technicalDetails:
          'Study AI463027 randomised 648 nucleoside-naive HBeAg-negative patients to entecavir 0.5 mg or lamivudine 100 mg for a minimum of 52 weeks, double-blind. Histologic improvement occurred in 208 of 296 evaluable patients (70%) against 174 of 287 (61%), P=0.01. Undetectable HBV DNA was 90% against 72% (P<0.001) and ALT normalisation 78% against 71% (P=0.045). No resistance to entecavir was detected in either trial at 48 weeks.',
        evidenceSource:
          'Lai CL et al., N Engl J Med 2006;354:1011-1020 (BEHoLD AI463027, NCT00035789)',
        doi: '10.1056/NEJMoa051287',
        measuredMetric: 'Histologic improvement at week 48 in HBeAg-negative disease',
        auditFlag: 'verified',
      },
      {
        id: 'etv-a3',
        category: 'measured',
        title: 'A cumulative 1.2% resistance at five years — the best barrier in the disease',
        laymanSummary:
          'Across five years of continuous treatment in people who had never taken a hepatitis B antiviral before, just over one in a hundred developed resistance. Lamivudine, the drug it replaced, reaches roughly half in the same period.',
        technicalDetails:
          'Genotypic evaluation of 562 nucleoside-naive subjects treated for up to 96 weeks found emerging resistance substitutions in fewer than 1%. In the long-term rollover cohort the cumulative probability of developing rtT184, rtS202 or rtM250 substitutions in the presence of rtL180M and rtM204V was 0.2%, 0.5%, 1.2%, 1.2% and 1.2% at weeks 48, 96, 144, 192 and 240. For comparison, in the lamivudine outcome trial in advanced fibrosis, genotypic YMDD resistance emerged in 49% of lamivudine-treated patients. The structural reason is that entecavir resistance requires the lamivudine-resistance substitutions plus a second-site change, so three or more mutations must accumulate before the virus escapes.',
        evidenceSource:
          'BARACLUDE United States prescribing information, Clinical Pharmacology, resistance in clinical studies (NDA 021797); lamivudine comparison from Liaw YF et al., N Engl J Med 2004;351:1521-1531',
        measuredMetric:
          'Cumulative probability of entecavir resistance substitutions at 48 to 240 weeks in nucleoside-naive patients',
        auditFlag: 'verified',
      },
      {
        id: 'etv-a4',
        category: 'failed',
        title:
          'In lamivudine-refractory patients the barrier collapses and most are never suppressed',
        laymanSummary:
          'The same drug that almost never fails in a fresh patient fails often in someone whose virus already escaped lamivudine. Twelve per cent developed resistance within two years, and only four in ten ever got their virus down to undetectable.',
        technicalDetails:
          'Genotypic evaluation of 190 lamivudine-refractory subjects treated for up to 96 weeks found resistance substitutions at rtT184, rtS202 or rtM250 in 22 subjects (12%), of whom 16 had virologic rebound and 4 were never suppressed below 300 copies/mL. Among those who rebounded with emergent resistance, the median fold-change in entecavir EC50 was 19-fold at baseline and 106-fold at rebound — meaning these viruses were already partly resistant before entecavir was started. Of subjects continuing beyond 48 weeks, only 40% (31 of 77) reached HBV DNA below 300 copies/mL. In cell culture, lamivudine-resistant strains alone cost 8- to 30-fold, and adding rtT184, rtS202 or rtM250 costs more than 70-fold.',
        evidenceSource:
          'BARACLUDE United States prescribing information, Clinical Pharmacology, lamivudine-refractory subjects (NDA 021797)',
        measuredMetric:
          '12% resistance by week 96 and 40% virologic suppression in lamivudine-refractory patients, against 1.2% and near-universal suppression in naive patients',
        auditFlag: 'caution',
      },
      {
        id: 'etv-a5',
        category: 'inferred',
        title: 'In failing livers the virology separated and the clinical score did not',
        laymanSummary:
          'In patients whose livers were already decompensating, entecavir cleared the virus in 57% against 20% on the comparator. The score that describes how well the liver is actually working improved in 61% against 67% — slightly fewer.',
        technicalDetails:
          'Study AI463048 randomised 195 adults with HBeAg-positive or -negative chronic hepatitis B and hepatic decompensation, defined as a Child-Turcotte-Pugh score of 7 or higher, to entecavir 1 mg or adefovir dipivoxil 10 mg, open-label; 191 were treated and analysed by intention to treat. At week 48, HBV DNA was undetectable in 57% on entecavir against 20% on adefovir, and ALT normalised in 63% against 46%. Stable or improved CTP score — defined as a decrease or no change from baseline — occurred in 61% against 67%. HBsAg loss was 5% against 0. The trial was not powered for the CTP comparison and the difference is not presented as significant in either direction; the point is not that adefovir was better but that a nearly threefold difference in viral suppression produced no corresponding difference in the measure of liver function at one year.',
        evidenceSource:
          'BARACLUDE United States prescribing information, Clinical Studies, subjects with decompensated liver disease, Study AI463048 (NCT00065507)',
        inferredClaim:
          'That the size of the virological advantage translates proportionally into clinical benefit — over 48 weeks in decompensated patients it visibly did not',
        auditFlag: 'contested',
      },
      {
        id: 'etv-a6',
        category: 'inferred',
        title: 'The randomised evidence that treatment prevents cancer belongs to a different drug',
        laymanSummary:
          'One placebo-controlled trial has shown that suppressing hepatitis B reduces liver failure and liver cancer. It tested lamivudine, not entecavir. Entecavir has never been randomised against placebo for those outcomes, and it never will be.',
        technicalDetails:
          'Liaw and colleagues randomised 651 patients with histologically confirmed cirrhosis or advanced fibrosis 2:1 to lamivudine or placebo for up to five years. The trial was stopped early at a median 32.4 months: disease progression endpoints were reached by 7.8% on lamivudine against 17.7% on placebo (hazard ratio 0.45, P=0.001), and hepatocellular carcinoma occurred in 3.9% against 7.4% (hazard ratio 0.49, P=0.047). That is the randomised foundation for treating hepatitis B at all. Entecavir was approved on histologic, virologic and biochemical endpoints against an active comparator; once lamivudine had shown benefit, a placebo arm in this disease became unethical. The inference that a drug which suppresses virus better than lamivudine must also prevent cancer better is reasonable, widely made, and untested by randomisation.',
        evidenceSource:
          'Liaw YF et al., N Engl J Med 2004;351:1521-1531 (Cirrhosis Asian Lamivudine Multicentre Study)',
        doi: '10.1056/NEJMoa033364',
        inferredClaim:
          'That entecavir reduces hepatocellular carcinoma and hepatic decompensation — demonstrated by randomisation for lamivudine, extrapolated to entecavir from surrogate superiority',
        auditFlag: 'caution',
      },
      {
        id: 'etv-a7',
        category: 'conclusion_shift',
        title:
          'The liver cancer argument against entecavir, from a paper that was retracted and replaced',
        laymanSummary:
          'A large Korean study reported that people on entecavir developed liver cancer more often than people on tenofovir. That paper was retracted and republished after an error, and its conclusion survived. Later reviews mostly agree with it — and every single study involved is observational.',
        technicalDetails:
          'Choi and colleagues analysed 24,156 treatment-naive patients from the Korean National Health Insurance Service who started entecavir (n=11,464) or tenofovir disoproxil fumarate (n=12,692) between 2012 and 2014, with a 2,701-patient hospital cohort as validation. Annual hepatocellular carcinoma incidence was 1.06 per 100 person-years on entecavir against 0.64 on tenofovir; adjusted hazard ratio for tenofovir 0.61 (95% CI 0.54 to 0.70) for HCC and 0.77 (95% CI 0.65 to 0.92) for death or transplant, with the effect holding in a 10,923-pair propensity-matched analysis. The article was formally retracted and replaced in June 2019 and the replacement retained the finding. A 2023 meta-analysis of 20 cohort studies covering 62,860 entecavir-treated and 27,544 tenofovir-treated patients reported a pooled odds ratio of 1.66 (95% CI 1.35 to 2.05) for hepatocellular carcinoma on entecavir relative to tenofovir. None of the 20 was randomised, and channelling by prescriber, era and comorbidity is not removed by propensity matching. International guidelines continue to list both as first-line.',
        evidenceSource:
          'Choi J et al., JAMA Oncol 2019;5:30-36 (retracted and replaced, JAMA Oncol 2019;5:913-914); Tang K et al., Medicine (Baltimore) 2023;102:e32894',
        doi: '10.1001/jamaoncol.2018.4070',
        measuredMetric:
          'Adjusted hazard ratio 0.61 (95% CI 0.54 to 0.70) favouring tenofovir in the Korean cohort; pooled odds ratio 1.66 (95% CI 1.35 to 2.05) across 20 cohort studies',
        auditFlag: 'contested',
      },
      {
        id: 'etv-a8',
        category: 'failed',
        title: 'Positive for carcinogenic findings in both mouse and rat',
        laymanSummary:
          'In the standard two-year animal cancer studies, entecavir produced tumours in both species tested. Lung tumours appeared in mice at only three times the human exposure. Nobody knows how much of this applies to people.',
        technicalDetails:
          'Long-term oral carcinogenicity studies at exposures up to 42 times (mice) and 35 times (rats) those at the highest recommended human dose were positive in both species. Lung adenomas were increased in male and female mice at exposures 3 and 40 times human, and lung carcinomas at 40 times; tumour development was preceded by pneumocyte proliferation not seen in rats, dogs or monkeys, which supports a species-specific mechanism. Hepatocellular carcinomas were increased in male mice at 42 times human exposure, vascular tumours in female mice at 40 times, hepatocellular adenomas in female rats at 24 times, and brain gliomas in rats. The label states plainly that it is not known how predictive the rodent findings are for humans. The temptation to connect this to the observational human hepatocellular carcinoma signal should be resisted: the rodent liver tumours occurred at 42 times human exposure in animals without hepatitis B, and no mechanistic link between the two observations has been established.',
        evidenceSource:
          'BARACLUDE United States prescribing information, Nonclinical Toxicology 13.1, carcinogenesis (NDA 021797)',
        measuredMetric:
          'Lung adenomas increased in mice at 3 times human exposure; positive carcinogenic findings in both rodent species',
        auditFlag: 'caution',
      },
      {
        id: 'etv-a9',
        category: 'failed',
        title: 'Three boxed warnings, and the first one is about stopping',
        laymanSummary:
          'Coming off entecavir can trigger a severe flare of hepatitis. It can also compromise future HIV treatment if given to someone whose HIV is untreated. And it belongs to a class associated with a rare, sometimes fatal metabolic complication.',
        technicalDetails:
          'The boxed warning covers three things. Severe acute exacerbations of hepatitis B have been reported after discontinuation of anti-hepatitis B therapy including entecavir, and hepatic function must be monitored clinically and biochemically for at least several months afterwards. Entecavir has weak anti-HIV activity and can select the M184V substitution, so it is not recommended in HIV/HBV co-infected patients who are not also receiving antiretroviral therapy — HIV variants carrying M184V show loss of susceptibility to entecavir in vitro. Lactic acidosis and severe hepatomegaly with steatosis, including fatal cases, have been reported with nucleoside analogues as a class. The discontinuation flare is a direct consequence of the mechanism: entecavir never removes the nuclear cccDNA, so stopping releases an intact template into an immune system that has been primed.',
        evidenceSource:
          'BARACLUDE United States prescribing information, boxed warning and Warnings and Precautions 5.1 to 5.3 (NDA 021797)',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'One small tablet daily, on an empty stomach',
        laymanDesc:
          'The dose is half a milligram — hundreds of times smaller than most antivirals — and food substantially reduces how much is absorbed.',
        molecularDetail:
          'Oral tablet or solution, 0.5 mg once daily in nucleoside-naive patients and 1 mg in lamivudine-refractory or decompensated patients. The very small daily dose is why one year of active ingredient was costed at about US$4 and why supply tonnage is roughly 600 times lower than for tenofovir disoproxil fumarate.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Phosphorylated inside the liver cell and held there',
        laymanDesc:
          'The tablet itself does nothing. The cell attaches three phosphate groups to it, and that active form persists for most of a day.',
        molecularDetail:
          'Efficiently phosphorylated to entecavir triphosphate, which has an intracellular half-life of 15 hours. Because entecavir is a carbocyclic nucleoside with no ring oxygen, it resists the phosphorylases that degrade ordinary nucleoside analogues.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It jams all three jobs of one enzyme',
        laymanDesc:
          'Hepatitis B uses a single enzyme to start the copy, to write DNA from RNA, and to finish the second strand. Entecavir blocks all three.',
        molecularDetail:
          'Entecavir triphosphate competes with deoxyguanosine triphosphate and functionally inhibits base priming, reverse transcription of the negative strand from the pregenomic messenger RNA, and synthesis of the positive strand of HBV DNA. It is only a weak inhibitor of human polymerases alpha, beta, delta and mitochondrial gamma, with Ki values of 18 to more than 160 micromolar.',
        iconName: 'Ban',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Escape needs three mutations at once, which is why it almost never happens',
        laymanDesc:
          'The virus cannot become resistant with one change. It needs the lamivudine escape mutations first, and then a second, separate change on top. Very few viruses manage all of it.',
        molecularDetail:
          'Resistance requires rtM204I/V with or without rtL180M, plus a change at rtT184, rtS202 or rtM250. Lamivudine-resistant backbones alone cost 8- to 30-fold; adding the second-site change costs more than 70-fold. Cumulative resistance in nucleoside-naive patients was 1.2% at 240 weeks.',
        iconName: 'ShieldCheck',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Virus disappears from the blood, and the liver inflammation settles',
        laymanDesc:
          'Nine in ten HBeAg-negative patients had undetectable virus at a year, and seven in ten had measurably less inflammation on biopsy.',
        molecularDetail:
          'Undetectable HBV DNA by PCR in 67% (HBeAg-positive) and 90% (HBeAg-negative) at week 48, against 36% and 72% on lamivudine. Histologic improvement in 72% and 70% against 62% and 61%.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'The master copy in the nucleus is never touched',
        laymanDesc:
          'Entecavir stops the virus making new copies. It does not remove the original ring of viral DNA sitting in the cell nucleus, so treatment is indefinite and stopping can cause a severe flare.',
        molecularDetail:
          'Covalently closed circular DNA persists in the hepatocyte nucleus and is not a substrate for reverse transcriptase inhibition. HBsAg loss — functional cure — occurred in 5% at week 48 even in the decompensated study. Severe acute exacerbations of hepatitis B after discontinuation are a boxed warning.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'BEHoLD AI463022 (NCT00035633)',
        phase: 'Phase 3, randomised, double-blind, active-controlled against lamivudine',
        sampleSize: 715,
        primaryEndpoint:
          'Histologic improvement at week 48 — decrease of at least two points in the Knodell necroinflammatory score without worsening of fibrosis',
        endpointMet: true,
        statisticalPValue: '72% (226/314) against 62% (195/314) on lamivudine, P=0.009',
        unreportedAdverseSignals:
          'HBeAg seroconversion, the endpoint closest to a durable off-treatment response, was 21% against 18% and did not separate (P=0.33). The trial measured a biopsy score at one year, not clinical events.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'BEHoLD AI463027 (NCT00035789)',
        phase: 'Phase 3, randomised, double-blind, active-controlled against lamivudine',
        sampleSize: 648,
        primaryEndpoint: 'Histologic improvement at week 48 in HBeAg-negative chronic hepatitis B',
        endpointMet: true,
        statisticalPValue: '70% (208/296 evaluable) against 61% (174/287), P=0.01',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'AI463048 (NCT00065507)',
        phase:
          'Phase 3, randomised, open-label, against adefovir dipivoxil, decompensated liver disease',
        sampleSize: 195,
        primaryEndpoint:
          'HBV DNA below 300 copies/mL at week 48 in patients with a Child-Turcotte-Pugh score of 7 or higher',
        endpointMet: true,
        statisticalPValue:
          '57% against 20% undetectable HBV DNA; stable or improved Child-Turcotte-Pugh score 61% against 67%; HBsAg loss 5% against 0',
        unreportedAdverseSignals:
          'The virological endpoint separated by nearly threefold while the clinical score did not separate. The trial was open-label and was not powered for the Child-Turcotte-Pugh comparison.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Histologic improvement at 48 weeks in 72% against 62% (HBeAg-positive) and 70% against 61% (HBeAg-negative), double-blind against lamivudine',
        'Undetectable HBV DNA in 67% and 90% against 36% and 72% on lamivudine',
        'Cumulative resistance of 1.2% at 240 weeks in nucleoside-naive patients, against 12% by week 96 in lamivudine-refractory ones',
        'Intracellular triphosphate half-life of 15 hours, with weak inhibition of human polymerases (Ki 18 to >160 micromolar)',
        'In decompensated liver disease, 57% against 20% undetectable HBV DNA with 61% against 67% stable or improved Child-Turcotte-Pugh score',
      ],
      unsupportedInferences: [
        'That entecavir prevents hepatocellular carcinoma — the placebo-controlled outcome evidence in hepatitis B tested lamivudine, not entecavir',
        'That a threefold virological advantage produces a proportional clinical one; in decompensated patients at 48 weeks it produced none',
        'That the observational cancer difference between entecavir and tenofovir is causal — all 20 studies in the pooled analysis are cohort studies subject to channelling',
        'That the rodent carcinogenicity findings and the human hepatocellular carcinoma cohort signal are the same phenomenon; no mechanistic link has been shown',
        'That a high resistance barrier in a naive patient transfers to a lamivudine-experienced one — the same drug, the same dose, a tenfold difference in failure',
      ],
      whatFailedInitially: [
        'In lamivudine-refractory patients only 40% reached undetectable HBV DNA and 12% developed resistance within 96 weeks',
        'HBeAg seroconversion, the endpoint that would allow treatment to stop, did not separate from lamivudine (21% against 18%, P=0.33)',
        'Positive for carcinogenic findings in both mice and rats, with mouse lung adenomas at three times human exposure',
        'Severe acute exacerbations of hepatitis B on discontinuation, because the nuclear cccDNA reservoir is never cleared',
        'Selects HIV resistance substitution M184V if given to a co-infected patient whose HIV is untreated',
      ],
      realWorldOutcome: [
        'Approved March 2005 under NDA 021797; long generic, and one of the least expensive antivirals in wide use',
        'A first-line treatment in international guidelines alongside tenofovir, taken indefinitely rather than for a course',
        'Off patent in the United States, China, Brazil and South Africa, with European expiry in 2017; surveyed acquisition price is roughly twice the modelled production floor',
        'The entecavir-versus-tenofovir cancer question remains open, argued entirely on observational data since a randomised comparison for that endpoint has not been run',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet and oral solution, taken on an empty stomach',
      description:
        'Once daily, at least two hours before or after a meal, because food substantially reduces absorption. The oral solution exists for children from age 2 and for adults who cannot swallow tablets. Treatment is indefinite in most patients: there is no defined stopping point in the way there is for interferon.',
      safetyProfile:
        'Boxed warnings for severe acute exacerbations of hepatitis B after discontinuation, for the risk of selecting HIV resistance in untreated HIV co-infection, and for lactic acidosis and severe hepatomegaly with steatosis as a nucleoside analogue class effect. Day-to-day tolerability in the pivotal trials was similar to lamivudine. Rodent carcinogenicity studies were positive in both species; the label states it is not known how predictive those findings are for humans. Renal dose adjustment is required.',
    },
    commonQuestions: [
      {
        q: 'Does entecavir cure hepatitis B?',
        a: 'No, and the reason is structural rather than a matter of potency. Hepatitis B parks a small ring of its DNA — cccDNA — in the nucleus of the liver cell, and every viral product is printed from that master copy. Entecavir blocks the enzyme that makes new viral DNA, so circulating virus falls below detection, often for years. It has no way to reach or degrade the ring itself. That is why treatment is indefinite, why stopping can cause a severe flare of hepatitis, and why loss of surface antigen — the closest thing to a cure — happens in only a small minority. Suppression is a real and worthwhile goal; it is not the same thing as the cure that hepatitis C now has.',
      },
      {
        q: 'Why is entecavir so hard for the virus to escape?',
        a: 'Because escape requires three changes rather than one. Lamivudine needs a single substitution in the viral enzyme, which is why roughly half of lamivudine-treated patients in the five-year cirrhosis trial developed resistance. Entecavir needs those same lamivudine substitutions plus a further change at one of three other positions, and only that full combination costs it more than seventyfold in potency. Requiring three simultaneous mutations is a much steeper hill for the virus. The measured result is a cumulative 1.2% resistance at five years in people who had never taken a hepatitis B antiviral. The same argument works in reverse: in someone whose virus already carries the lamivudine mutations, entecavir is one change away from failure, and 12% failed within two years.',
        auditNote:
          'The same drug at the same dose has a resistance rate that differs tenfold depending on what the patient took before. Prior treatment history is not a footnote here.',
      },
      {
        q: 'Should I be on tenofovir instead because of the liver cancer studies?',
        a: 'That question is genuinely unresolved and worth asking your doctor rather than deciding from a page. A Korean national cohort of 24,156 patients found liver cancer in 1.06 per 100 person-years on entecavir against 0.64 on tenofovir, an adjusted hazard ratio of 0.61 favouring tenofovir; that paper was retracted and republished after an error, and the replacement kept the finding. A 2023 pooled analysis of 20 cohort studies covering more than 90,000 patients found a similar direction. What none of that includes is a randomised comparison. Patients are not assigned to these drugs at random: prescriber preference, era, kidney function, prior treatment and comorbidity all differ between the groups, and propensity matching narrows those differences rather than removing them. International guidelines still list both as first-line, which is what a field does when a consistent observational signal has no randomised test behind it.',
      },
      {
        q: 'What happens if I stop taking it?',
        a: 'The virus comes back, and in some people the return is dangerous. Because the master copy of the viral genome remains in the nucleus, removing the drug lets replication restart from an intact template. Severe acute exacerbations of hepatitis B after stopping anti-hepatitis B therapy are the first item in entecavir’s boxed warning, and the label requires liver function to be monitored clinically and biochemically for at least several months afterwards. That flare is an immune response to the newly reinfected cells rather than a direct drug effect, which is why it can be severe in people whose immune systems are intact. Stopping is a decision that needs supervision, not something to do because you feel well.',
      },
      {
        q: 'Was the drug ever shown to prevent liver cancer?',
        a: 'Not by randomisation, and it probably never will be. The one placebo-controlled trial showing that suppressing hepatitis B reduces liver failure and liver cancer tested lamivudine: 651 patients with cirrhosis or advanced fibrosis, stopped early at a median 32 months because disease progression had occurred in 7.8% on treatment against 17.7% on placebo, with liver cancer in 3.9% against 7.4%. Once that result existed, giving anyone a placebo for hepatitis B became indefensible, so entecavir was approved on liver biopsy scores, viral load and enzyme levels against an active comparator. The step from "suppresses virus better than lamivudine" to "prevents more cancer than lamivudine" is an inference. It is a reasonable one and it is not a measurement.',
        auditNote:
          'This is the ordinary shape of evidence in a disease where the first effective drug makes placebo unethical. It is worth knowing that the strongest outcome data belong to the weakest drug in the class.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Chang TT et al. A comparison of entecavir and lamivudine for HBeAg-positive chronic hepatitis B. N Engl J Med 2006;354:1001-1010',
        identifier: '10.1056/NEJMoa051285',
        kind: 'doi',
      },
      {
        label:
          'Lai CL et al. Entecavir versus lamivudine for patients with HBeAg-negative chronic hepatitis B. N Engl J Med 2006;354:1011-1020',
        identifier: '10.1056/NEJMoa051287',
        kind: 'doi',
      },
      {
        label:
          'Liaw YF et al. Lamivudine for patients with chronic hepatitis B and advanced liver disease. N Engl J Med 2004;351:1521-1531',
        identifier: '10.1056/NEJMoa033364',
        kind: 'doi',
      },
      {
        label:
          'Choi J, Kim HJ, Lee J, Cho S, Ko MJ, Lim YS. Risk of hepatocellular carcinoma in patients treated with entecavir vs tenofovir for chronic hepatitis B: a Korean nationwide cohort study. JAMA Oncol 2019;5:30-36 — retracted and replaced, JAMA Oncol 2019;5:913-914',
        identifier: '10.1001/jamaoncol.2018.4070',
        kind: 'doi',
      },
      {
        label:
          'Tang K, Cheng H, Wang H, Guo Y. Meta-analysis of the occurrence of hepatocellular carcinoma after the treatment of entecavir and tenofovir for chronic hepatitis B. Medicine (Baltimore) 2023;102:e32894',
        identifier: '10.1097/MD.0000000000032894',
        kind: 'doi',
      },
      {
        label:
          'Hill A, Gotham D, Cooke G, Bhagani S, Andrieux-Meyer I, Cohn J, Fortunak J. Analysis of minimum target prices for production of entecavir to treat hepatitis B in high- and low-income countries. J Virus Erad 2015;1:103-110',
        identifier: '10.1016/S2055-6640(20)30484-2',
        kind: 'doi',
      },
      {
        label: 'BEHoLD AI463022: entecavir against lamivudine, HBeAg-positive',
        identifier: 'NCT00035633',
        kind: 'nct',
      },
      {
        label: 'BEHoLD AI463027: entecavir against lamivudine, HBeAg-negative',
        identifier: 'NCT00035789',
        kind: 'nct',
      },
      {
        label: 'AI463048: entecavir against adefovir dipivoxil in hepatic decompensation',
        identifier: 'NCT00065507',
        kind: 'nct',
      },
      {
        label:
          'Drugs@FDA: BARACLUDE (entecavir), NDA 021797, Bristol-Myers Squibb — original approval 29 March 2005',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021797',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 135398508 — entecavir structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/135398508',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 8. Peginterferon alfa-2a — the only drug in this group with no viral target at all. It acts on
  //    the patient’s own receptor, works in a minority, and in 2009 that minority turned out to be
  //    largely determined by a common genetic variant nobody had looked for.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'peginterferon-alfa-2a',
    name: 'Peginterferon Alfa-2a',
    tradeName: 'Pegasys',
    sponsor: 'Pharmaand GmbH (developed and marketed by Roche/Genentech until divestment in 2022)',
    targetGene: 'IFNAR1 and IFNAR2 — human receptor genes. This drug has no viral target',
    targetProtein:
      'The type I interferon receptor, an IFNAR1/IFNAR2 heterodimer on the surface of the patient’s own cells',
    modality: 'Recombinant Protein / Biologic',
    approvalStatus: 'FDA Approved',
    approvalYear: 2002,
    indication:
      'Chronic hepatitis C in adults with compensated liver disease, in combination with other hepatitis C antivirals, or as monotherapy only where those are contraindicated or not tolerated; and chronic hepatitis B in adults and children, HBeAg-positive or HBeAg-negative, with compensated liver disease and evidence of viral replication and liver inflammation',
    patientFriendlyIndication:
      'Long-standing hepatitis B or hepatitis C, treated by stimulating the immune system rather than by attacking the virus directly',
    anatomicalSite:
      'The surface of essentially every nucleated cell in the body — which is why the side effects are systemic rather than hepatic',
    conditionContext: {
      conditionExplainer:
        'Interferon is a signal the body makes itself when a cell detects a virus. It does not kill anything; it tells neighbouring cells to switch on hundreds of defensive genes at once. Giving it as a drug means running that alarm continuously for months.',
      whyItMatters:
        'For hepatitis B, peginterferon remains the only treatment given for a fixed course rather than indefinitely, and the only one with a real chance of clearing surface antigen. For hepatitis C it was the entire treatment for fifteen years, and it has now been almost completely displaced.',
      whoTakesThis:
        'In hepatitis B, a selected minority of patients suited to a finite course. In hepatitis C, now very few. It is contraindicated in decompensated cirrhosis, in autoimmune hepatitis, and in neonates and infants.',
      clinicalGoals:
        'In hepatitis C, sustained virologic response. In hepatitis B, HBeAg seroconversion and sustained suppression after treatment stops, with loss of surface antigen as the best available outcome. All are laboratory endpoints.',
    },
    oneSentenceVerdict:
      'A recombinant human interferon with a 40 kDa branched polyethylene glycol chain bolted on to slow its clearance, which does not touch the virus at all but switches on the patient’s own antiviral genes — producing sustained virologic response in 40.9% of 3,070 genotype 1 hepatitis C patients after 48 weeks of weekly injections, HBeAg seroconversion in 32% against 19% on lamivudine in 814 hepatitis B patients, and a boxed warning that alpha interferons may cause or aggravate fatal or life-threatening neuropsychiatric, autoimmune, ischemic and infectious disorders.',
    laymanHowItWorks:
      'When a cell notices a virus it releases interferon, a chemical shout that tells every cell nearby to switch on its defences. This drug is that shout, manufactured in bacteria and given by injection. It binds a receptor on the outside of your cells and turns on several hundred defensive genes, which between them make the cell a hostile place for a virus to copy itself. Because that receptor is on nearly every cell in the body, the defences switch on everywhere — which is why the treatment feels like a months-long case of influenza.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 63,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$1,070.90 per millilitre, the one listed product at United States pharmacy acquisition cost (CMS NADAC, brand, effective 23 April 2025)',
      markupEstimate: '',
      openPatentNotes:
        'What pharmacies pay to acquire the drug, not what a patient is charged: United States list prices are not published and net prices after rebates are confidential by contract. This is a pegylated recombinant protein made by bacterial fermentation and chemical conjugation, so the small-molecule retrosynthesis costing that produced published floors for sofosbuvir, entecavir and ribavirin does not apply to it, and no equivalent analysis has been published.',
      synthesisComplexity: 'High',
      costSource: {
        label:
          'Nearest published cost-of-production analysis in this disease area: van de Ven N, Fortunak J, Simmons B, Ford N, Cooke GS, Khoo S, Hill A. Minimum target prices for production of direct-acting antivirals and associated diagnostics to combat hepatitis C virus. Hepatology 2015;61:1174-1182. It costs small-molecule direct-acting antivirals by retrosynthesis and does NOT cover pegylated recombinant proteins, which is why the synthesis cost field on this page is empty.',
        identifier: '10.1002/hep.27641',
        kind: 'doi',
      },
      priceSource: {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey, brand listing effective 23 April 2025',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    },
    substitutes: {
      summary:
        'In hepatitis C the substitute is any modern direct-acting antiviral regimen, and the replacement was total. In hepatitis B the alternatives are the nucleos(t)ide analogues, and the trade is a genuine one: tablets that suppress almost everyone indefinitely against injections that produce a lasting response in a minority and then stop.',
      conventionalRx: [
        {
          name: 'Sofosbuvir/velpatasvir (Epclusa) and the other direct-acting antivirals',
          class: 'Oral pan-genotypic antiviral combinations',
          howItCompares:
            'Cure rates well above 90% in 8 to 12 weeks with no injections and no interferon side effects, against 40.9% after 48 weeks of weekly injections in genotype 1. This is not a close comparison and it is why interferon left hepatitis C care.',
          typicalCost:
            'US$866.40 per tablet, median across the two listed products at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: far higher cure rate, far shorter, orally administered, tolerable. Cons: none clinically relevant against interferon in hepatitis C.',
        },
        {
          name: 'Entecavir (Baraclude)',
          class: 'Nucleoside analogue reverse transcriptase inhibitor for hepatitis B',
          howItCompares:
            'Suppresses hepatitis B DNA below detection in most patients with a 1.2% resistance rate at five years, but must be taken indefinitely and rarely clears surface antigen. Peginterferon is given for 48 weeks and then stopped.',
          typicalCost:
            'US$0.2134 per tablet, median across the 21 listed products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: oral, cheap, very well tolerated, works in almost everyone. Cons: indefinite; stopping can cause a severe flare; surface antigen loss is rare.',
        },
        {
          name: 'Tenofovir disoproxil fumarate or alafenamide',
          class: 'Nucleotide analogue reverse transcriptase inhibitor for hepatitis B',
          howItCompares:
            'The same trade-off as entecavir, and the alternative first-line option. Active against lamivudine-resistant virus.',
          typicalCost:
            'Not listed in the CMS National Average Drug Acquisition Cost survey consulted for this page',
          prosAndCons:
            'Pros: oral, high barrier to resistance. Cons: indefinite treatment; renal and bone monitoring with the older prodrug.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Name any history of depression before the first injection',
          action:
            'Report previous depression, self-harm, psychosis, or a family history of any of them, and agree in advance who to contact if mood changes.',
          patientImpact:
            'The boxed warning states that alpha interferons may cause or aggravate fatal or life-threatening neuropsychiatric disorders. Depression during treatment is common enough that it is monitored routinely rather than waited for.',
          clinicalPrecaution:
            'The label directs withdrawal of therapy in patients with persistently severe or worsening signs or symptoms. In many but not all cases these resolve after stopping.',
        },
        {
          name: 'Name any autoimmune or thyroid condition',
          action:
            'Report thyroid disease, psoriasis, rheumatoid arthritis, colitis or any autoimmune diagnosis, and ask whether thyroid function will be checked during treatment.',
          patientImpact:
            'The same boxed warning covers autoimmune disorders. Interferon works by switching on the immune system, so an immune condition that was quiet can become active.',
          clinicalPrecaution:
            'Autoimmune hepatitis is a contraindication rather than a caution. Thyroid dysfunction on interferon is often permanent even after the drug is stopped.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'peptide_sequence',
      sequence5to3:
        'CDLPQTHSLGSRRTLMLLAQMRKISLFSCLKDRHDFGFPQEEFGNQFQKAETIPVLHEMIQQIFNLFSTKDSSAAWDETLLDKFYTELYQQLNDLEACVIQGVGVTETPLMKEDSILAVRKYFQRITLYLKEKKYSPCAWEVVRAEIMRSFSLSTNLQESLRSKE',
      molecularWeight:
        'Approximately 60,000 daltons — a roughly 20 kDa recombinant interferon alfa-2a joined to a single branched bis-monomethoxy polyethylene glycol chain of roughly 40 kDa',
      targetReceptorAffinity:
        'Binds the type I interferon receptor IFNAR1/IFNAR2 on human cells and induces the JAK-STAT pathway; the label describes it simply as an inducer of the innate antiviral immune response. There is no viral binding partner. The mature protein is 165 amino acids; interferon alfa-2a differs from alfa-2b at a single residue, lysine rather than arginine at position 23 of the mature chain, which is annotated in UniProt as the alpha-2A allele.',
      structureSource: {
        label:
          'UniProt P01563 (IFNA2_HUMAN), mature chain 24-188 with the annotated alpha-2A allele substitution at position 46 of the precursor; PEG conjugation described in the PEGASYS prescribing information, Description 11',
        identifier: 'https://rest.uniprot.org/uniprotkb/P01563.txt',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'peg2a-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Working cell bank identity and endotoxin clearance plan',
          description:
            'Confirm identity, plasmid retention and freedom from adventitious agents in the Escherichia coli working cell bank carrying the cloned human leukocyte interferon gene, and fix the endotoxin specification before fermentation. Endotoxin from a Gram-negative host is itself a potent immune stimulant, and in a drug whose entire purpose is immune stimulation, contamination would not look like an impurity — it would look like efficacy.',
          reagentsAndBuffer:
            'Restriction mapping and plasmid sequencing of the working cell bank, sterility and mycoplasma testing, Limulus amoebocyte lysate endotoxin assay, host cell protein ELISA reference reagents',
        },
        {
          id: 'peg2a-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Fermentation, inclusion body recovery and refolding',
          description:
            'Express interferon alfa-2a in E. coli, recover the insoluble inclusion bodies, solubilise and refold to the native fold with the two correct disulfide bonds. Interferon alfa-2 has four cysteines and only one pairing is active; a misfolded batch has the right mass and the wrong biology, which no mass-based assay will catch.',
          dependsOnStepId: 'peg2a-w1',
          reagentsAndBuffer:
            'Fed-batch fermentation, mechanical lysis, guanidine hydrochloride or urea solubilisation, oxidative refolding with a reduced/oxidised glutathione couple at controlled dilution, peptide mapping to confirm the Cys1-Cys98 and Cys29-Cys138 disulfide pattern',
        },
        {
          id: 'peg2a-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Chromatographic purification to the unmodified protein',
          description:
            'Purify the refolded monomer away from aggregates, misfolded isomers, host cell protein and endotoxin. Aggregates matter beyond the usual yield argument here: protein aggregates are the principal driver of anti-drug antibody formation, and neutralising antibodies against an interferon can abolish its effect and, in principle, cross-react with the patient’s own.',
          dependsOnStepId: 'peg2a-w2',
          reagentsAndBuffer:
            'Ion exchange and hydrophobic interaction chromatography, size exclusion polishing, size-exclusion HPLC and analytical ultracentrifugation for aggregate content, endotoxin removal by anion exchange',
        },
        {
          id: 'peg2a-w4',
          stepNumber: 4,
          phase: 'Conjugation',
          name: 'Single-site attachment of the 40 kDa branched PEG to a lysine',
          description:
            'Attach one branched bis-monomethoxy polyethylene glycol chain of about 40 kDa to a single lysine through a stable amide bond, then separate the wanted positional isomer from the others. This step is the drug: unpegylated interferon alfa-2a is cleared within hours and must be injected three times a week, while the 60 kDa conjugate is dosed once weekly. Lysine conjugation is intrinsically not site-specific, so the product is a defined mixture of positional isomers and controlling that distribution is a release specification, not an optimisation.',
          dependsOnStepId: 'peg2a-w3',
          reagentsAndBuffer:
            'Branched 40 kDa mPEG2-N-hydroxysuccinimidyl ester, borate or phosphate buffer at controlled pH and protein-to-PEG ratio, ion exchange chromatography to resolve mono-, di- and unpegylated species, peptide mapping with mass spectrometry to assign the conjugation site',
        },
        {
          id: 'peg2a-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Cytopathic-effect bioassay, because mass says nothing about potency',
          description:
            'Measure biological potency as protection of a cell monolayer against a challenge virus, calibrated against the international interferon standard, and report it alongside the interferon-stimulated gene response. Pegylation reduces intrinsic receptor binding while increasing exposure, so a conjugate can be less potent per molecule and more effective per week. Only a bioassay captures that trade; a protein concentration does not.',
          dependsOnStepId: 'peg2a-w4',
          reagentsAndBuffer:
            'A549 or MDBK cell monolayers with encephalomyocarditis or vesicular stomatitis virus challenge, WHO international standard for human interferon alfa, crystal violet or MTT viability readout, quantitative PCR for MxA and OAS1 induction as an orthogonal potency measure',
        },
      ],
    },
    keyAudits: [
      {
        id: 'peg2a-a1',
        category: 'measured',
        title: 'Pegylation itself was worth 12 percentage points in hepatitis C',
        laymanSummary:
          'In a 1,121-patient trial, attaching a polymer chain to interferon so it lasted a week instead of a day raised the cure rate from 44% to 56% when both groups also took ribavirin.',
        technicalDetails:
          'Fried and colleagues randomised 1,121 patients to peginterferon alfa-2a with ribavirin, peginterferon alfa-2a with placebo, or conventional interferon alfa-2b with ribavirin, all for 48 weeks. Sustained virologic response was 56% with peginterferon plus ribavirin against 44% with conventional interferon plus ribavirin, P<0.001, and 29% with peginterferon plus placebo. In genotype 1 the figures were 46%, 36% and 21%. Influenza-like symptoms and depression were less frequent in the peginterferon groups than in the conventional interferon group, so the improvement was not bought with worse tolerability.',
        evidenceSource: 'Fried MW et al., N Engl J Med 2002;347:975-982',
        doi: '10.1056/NEJMoa020047',
        measuredMetric:
          'Sustained virologic response, pegylated against conventional interferon on identical ribavirin',
        auditFlag: 'verified',
      },
      {
        id: 'peg2a-a2',
        category: 'measured',
        title: 'In hepatitis B it beat lamivudine on the endpoint that lets treatment stop',
        laymanSummary:
          'Across 814 patients, a 48-week course of injections produced the immune change that allows treatment to end in 32%, against 19% on a daily tablet. Sixteen patients cleared surface antigen; none on the tablet did.',
        technicalDetails:
          'Lau and colleagues randomised 814 HBeAg-positive patients, 87% Asian, to peginterferon alfa-2a 180 micrograms weekly plus oral placebo, peginterferon plus lamivudine, or lamivudine alone, for 48 weeks with 24 weeks of follow-up. HBeAg seroconversion 24 weeks after treatment was 32% with peginterferon monotherapy and 27% with the combination, against 19% with lamivudine (P<0.001 and P=0.02). HBV DNA below 100,000 copies/mL was 32% and 34% against 22%. Sixteen patients receiving peginterferon had HBsAg seroconversion against 0 on lamivudine alone (P=0.001). Serious adverse events occurred in 4%, 6% and 2% respectively. Two lamivudine patients had irreversible liver failure after stopping treatment, one transplanted and one died.',
        evidenceSource: 'Lau GK et al., N Engl J Med 2005;352:2682-2695',
        doi: '10.1056/NEJMoa043470',
        measuredMetric: 'HBeAg seroconversion 24 weeks after a finite 48-week course',
        auditFlag: 'verified',
      },
      {
        id: 'peg2a-a3',
        category: 'measured',
        title: 'Adding lamivudine to it did nothing, and that negative result held twice',
        laymanSummary:
          'Two large hepatitis B trials tested the obvious idea of giving the injection and the tablet together. In both, the combination was no better after treatment stopped than the injection alone.',
        technicalDetails:
          'In the HBeAg-negative trial, 177 patients received peginterferon alfa-2a plus placebo, 179 peginterferon plus lamivudine and 181 lamivudine alone, for 48 weeks with 24 weeks of follow-up. ALT normalisation was 59% and 60% against 44% (P=0.004 and P=0.003) and HBV DNA below 20,000 copies/mL was 43% and 44% against 29% (P=0.007 and P=0.003). Sustained suppression below 400 copies/mL was 19%, 20% and 7%. HBsAg loss occurred in 12 patients in the peginterferon groups against 0 on lamivudine alone. The authors state directly that the addition of lamivudine to peginterferon alfa-2a did not improve post-therapy response rates. The HBeAg-positive trial found the same, with the combination arm numerically below monotherapy on seroconversion, 27% against 32%.',
        evidenceSource: 'Marcellin P et al., N Engl J Med 2004;351:1206-1217',
        doi: '10.1056/NEJMoa040431',
        measuredMetric:
          'Post-treatment response with peginterferon alone against peginterferon plus lamivudine',
        auditFlag: 'verified',
      },
      {
        id: 'peg2a-a4',
        category: 'conclusion_shift',
        title:
          'In 2009 the reason some people never responded turned out to be a common gene variant',
        laymanSummary:
          'For twenty years, why interferon worked in some people and not others was explained by dose, adherence, viral load and liver damage. A genome-wide scan found a single common variant near one gene that roughly doubled the chance of cure — and it explained about half of the long-observed difference in response rates between patients of African and European ancestry.',
        technicalDetails:
          'Ge and colleagues reported that a polymorphism near IL28B, encoding interferon-lambda-3, was associated with an approximately twofold change in treatment response in patients of European ancestry (P = 1.06 x 10^-25) and in African-Americans (P = 2.06 x 10^-3). Because the favourable genotype is substantially more frequent in European than African populations, the variant explained roughly half of the difference in response rates between the two groups. This reframed a difference that had been discussed for two decades in terms of adherence, body weight, dosing and viral kinetics. It also arrived at almost exactly the moment the direct-acting antivirals made it clinically irrelevant: IL28B testing was briefly standard and is now essentially unused.',
        evidenceSource: 'Ge D et al., Nature 2009;461:399-401',
        doi: '10.1038/nature08309',
        measuredMetric:
          'Approximately twofold change in sustained virologic response by IL28B genotype; roughly half the ancestry gap explained',
        auditFlag: 'verified',
      },
      {
        id: 'peg2a-a5',
        category: 'measured',
        title: 'Head to head against its rival in 3,070 patients, the two were the same',
        laymanSummary:
          'Two pegylated interferons had been marketed against each other for years. When they were finally compared directly in 3,070 patients, the cure rates were 40.9% and 39.8%, a difference well inside chance.',
        technicalDetails:
          'The IDEAL trial randomised 3,070 previously untreated genotype 1 patients at 118 sites to 48 weeks of standard-dose peginterferon alfa-2b, low-dose peginterferon alfa-2b, or peginterferon alfa-2a, each with ribavirin. Sustained virologic response was 39.8%, 38.0% and 40.9%; the estimated difference between standard-dose alfa-2b and alfa-2a was -1.1% (95% CI -5.3 to 3.0), P=0.57. Serious adverse events occurred in 8.6% to 11.7% across the three groups. One difference did emerge: relapse after end of treatment was 31.5% (95% CI 27.9 to 35.2) on alfa-2a against 23.5% (95% CI 19.9 to 27.2) on standard-dose alfa-2b, meaning alfa-2a suppressed more virus during treatment and lost more of it afterwards, ending at the same place.',
        evidenceSource: 'McHutchison JG et al., N Engl J Med 2009;361:580-593 (IDEAL, NCT00081770)',
        doi: '10.1056/NEJMoa0808010',
        measuredMetric:
          'Sustained virologic response and relapse rate, peginterferon alfa-2a against alfa-2b, head to head',
        auditFlag: 'verified',
      },
      {
        id: 'peg2a-a6',
        category: 'failed',
        title: 'A boxed warning that names four categories of fatal disorder',
        laymanSummary:
          'The label warns that this class of drug may cause or worsen neuropsychiatric, autoimmune, ischemic and infectious disorders, any of which can be fatal or life-threatening. That is unusually broad for a single warning.',
        technicalDetails:
          'The boxed warning states that alpha interferons, including PEGASYS, may cause or aggravate fatal or life-threatening neuropsychiatric, autoimmune, ischemic and infectious disorders, that patients should be monitored closely with periodic clinical and laboratory evaluations, and that therapy should be withdrawn in patients with persistently severe or worsening signs or symptoms — adding that in many, but not all, cases these disorders resolve after stopping. The breadth follows directly from the mechanism: the drug acts on a receptor present on essentially every nucleated cell, so there is no anatomical restriction on where its effects appear. In the pivotal hepatitis B trials serious adverse events occurred in 4% to 6% of interferon recipients against 2% on lamivudine.',
        evidenceSource:
          'PEGASYS United States prescribing information, boxed warning: risk of serious disorders (BLA 103964)',
        auditFlag: 'caution',
      },
      {
        id: 'peg2a-a7',
        category: 'failed',
        title: 'Even at its best, it worked in a minority',
        laymanSummary:
          'Forty-eight weeks of weekly injections, with all the side effects, cured about four in ten people with the commonest form of hepatitis C. In hepatitis B, three in ten reached the immune milestone that lets treatment stop.',
        technicalDetails:
          'In genotype 1 hepatitis C, sustained virologic response was 40.9% in the 3,070-patient IDEAL trial and 46% in the 1,121-patient registrational trial. In HBeAg-positive hepatitis B, seroconversion 24 weeks after a 48-week course was 32%. In HBeAg-negative hepatitis B, sustained HBV DNA suppression below 400 copies/mL was 19%. Loss of surface antigen — the closest thing to a functional cure — occurred in 16 of roughly 540 peginterferon-treated patients in one hepatitis B trial and 12 of roughly 356 in the other, which is a real and reproducible effect at a low single-digit rate. These are the numbers that made a 48-week course of injections a rational offer, and they are also the numbers a modern reader should hold beside the direct-acting antivirals.',
        evidenceSource:
          'McHutchison JG et al., N Engl J Med 2009;361:580-593; Lau GK et al., N Engl J Med 2005;352:2682-2695; Marcellin P et al., N Engl J Med 2004;351:1206-1217',
        doi: '10.1056/NEJMoa0808010',
        measuredMetric:
          'Response rates across the pivotal programmes: 40.9% and 46% in hepatitis C genotype 1, 32% and 19% in hepatitis B',
        auditFlag: 'verified',
      },
      {
        id: 'peg2a-a8',
        category: 'inferred',
        title: 'Every endpoint is a laboratory value, and the surrogate has never been validated',
        laymanSummary:
          'The trials measured virus, antigens and liver enzymes. None of them counted deaths, cancers or transplants.',
        technicalDetails:
          'The 2017 Cochrane review of 138 randomised direct-acting antiviral trials in 25,232 participants found no usable randomised evidence that sustained virologic response predicts hepatitis C-related morbidity or hepatocellular carcinoma, with mortality data from only 11 trials. The same objection applies with more force to the hepatitis B endpoints used here: HBeAg seroconversion is an immunological marker whose link to survival is inferred from cohort studies, not from randomisation. The one randomised outcome trial in hepatitis B tested lamivudine, not interferon.',
        evidenceSource: 'Jakobsen JC et al., Cochrane Database Syst Rev 2017;9:CD012143',
        doi: '10.1002/14651858.CD012143.pub3',
        inferredClaim:
          'That seroconversion, viral suppression or sustained virologic response on this drug translates into fewer cancers, transplants or deaths — not measured in any of its registrational trials',
        auditFlag: 'contested',
      },
      {
        id: 'peg2a-a9',
        category: 'conclusion_shift',
        title: 'From the whole of hepatitis C treatment to a residual role, in about four years',
        laymanSummary:
          'Peginterferon was hepatitis C treatment for fifteen years. Between 2011 and 2015 it was removed from the recommended regimens almost entirely, and it survives mainly in hepatitis B and in hepatitis D.',
        technicalDetails:
          'The displacement was not caused by any new finding about interferon. The direct-acting antivirals reached cure rates above 90% in 8 to 12 weeks without injections, against 40.9% after 48 weeks. The label reflects the change: peginterferon alfa-2a is now indicated in hepatitis C in combination with other hepatitis C antivirals, with monotherapy indicated only if the patient has a contraindication to or significant intolerance of those drugs. Its remaining roles are in selected hepatitis B patients wanting a finite course with a chance of surface antigen loss, and in hepatitis D, where interferon alfa remains the only agent with meaningful activity and no interferon product carries a hepatitis D indication in the United States.',
        evidenceSource:
          'PEGASYS United States prescribing information, Indications and Usage 1.1 (BLA 103964)',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'One injection a week, under the skin',
        laymanDesc:
          'A polymer chain attached to the protein slows how fast the body clears it, turning a three-times-weekly injection into a weekly one.',
        molecularDetail:
          'Recombinant interferon alfa-2a of about 20 kDa, produced in Escherichia coli, joined through a stable amide bond at a single lysine to a branched bis-monomethoxy polyethylene glycol chain of about 40 kDa, giving a conjugate of roughly 60 kDa. Given subcutaneously at 180 micrograms once weekly.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It never meets the virus',
        laymanDesc:
          'Unlike every other hepatitis drug, this one has no viral target. It binds a receptor on the outside of your own cells.',
        molecularDetail:
          'Binds the type I interferon receptor, an IFNAR1/IFNAR2 heterodimer expressed on essentially every nucleated cell. The label describes it as an inducer of the innate antiviral immune response rather than as an antiviral.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'A signal runs to the nucleus and switches on hundreds of genes',
        laymanDesc:
          'Binding the receptor sends a chemical relay into the cell nucleus, which turns on several hundred defensive genes at once.',
        molecularDetail:
          'Receptor engagement activates JAK1 and TYK2, which phosphorylate STAT1 and STAT2; with IRF9 these form ISGF3, which binds interferon-stimulated response elements and induces several hundred interferon-stimulated genes including MxA, OAS and PKR.',
        iconName: 'Zap',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'The cell becomes an inhospitable place to copy a virus',
        laymanDesc:
          'The induced genes degrade viral RNA, shut down protein production and mark infected cells for the immune system. No single one of them is the mechanism.',
        molecularDetail:
          'The induced proteins act by several routes at once: OAS activates RNase L to degrade viral RNA, PKR phosphorylates eIF2-alpha to arrest translation, MxA interferes with viral nucleocapsids, and MHC class I upregulation improves presentation of infected cells. The antiviral effect is the sum, which is why no resistance mutation defeats it the way one defeats a direct-acting antiviral.',
        iconName: 'ShieldCheck',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'In a minority the immune system takes over and keeps control',
        laymanDesc:
          'When it works, the benefit lasts after the injections stop — which is why hepatitis B treatment with interferon has an end date and tablet treatment does not.',
        molecularDetail:
          'HBeAg seroconversion in 32% at 24 weeks after a 48-week course against 19% on lamivudine; sustained HBV DNA below 400 copies/mL in 19% of HBeAg-negative patients against 7%; HBsAg loss in a low single-digit percentage against none on lamivudine. In hepatitis C genotype 1, sustained virologic response 40.9%.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And the alarm rings everywhere else too',
        laymanDesc:
          'Because the receptor is on nearly every cell, the same signal that fights the virus in the liver produces fever, exhaustion, low blood counts, thyroid disease and depression throughout the body.',
        molecularDetail:
          'Boxed warning for fatal or life-threatening neuropsychiatric, autoimmune, ischemic and infectious disorders. Serious adverse events occurred in 4% to 6% of interferon recipients against 2% on lamivudine in the hepatitis B trials, and in 8.6% to 11.7% across arms of the 3,070-patient IDEAL trial.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'IDEAL (NCT00081770)',
        phase: 'Phase 3, randomised, three-arm, head-to-head against peginterferon alfa-2b',
        sampleSize: 3070,
        primaryEndpoint:
          'Sustained virologic response after 48 weeks of treatment in previously untreated genotype 1 hepatitis C',
        endpointMet: true,
        statisticalPValue:
          '40.9% with peginterferon alfa-2a against 39.8% with standard-dose peginterferon alfa-2b; difference -1.1% (95% CI -5.3 to 3.0), P=0.57',
        unreportedAdverseSignals:
          'Relapse after end of treatment was 31.5% on alfa-2a against 23.5% on standard-dose alfa-2b — a real difference in durability that cancels out in the headline response rate.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Lau 2005, N Engl J Med — peginterferon alfa-2a in HBeAg-positive hepatitis B',
        phase: 'Phase 3, randomised, three-arm, partially placebo-controlled',
        sampleSize: 814,
        primaryEndpoint:
          'HBeAg seroconversion 24 weeks after the end of a 48-week course of treatment',
        endpointMet: true,
        statisticalPValue:
          '32% with peginterferon monotherapy and 27% with peginterferon plus lamivudine against 19% with lamivudine alone; P<0.001 and P=0.02',
        unreportedAdverseSignals:
          'Serious adverse events in 4% and 6% of interferon arms against 2% on lamivudine. 87% of the population was Asian and most were infected with HBV genotype B or C, which limits how far the result generalises to genotype A or D populations.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Marcellin 2004, N Engl J Med — HBeAg-negative hepatitis B',
        phase: 'Phase 3, randomised, three-arm, partially placebo-controlled',
        sampleSize: 537,
        primaryEndpoint:
          'ALT normalisation and HBV DNA below 20,000 copies/mL 24 weeks after the end of treatment',
        endpointMet: true,
        statisticalPValue:
          '59% and 43% with peginterferon monotherapy against 44% and 29% with lamivudine; P=0.004 and P=0.007. Sustained HBV DNA below 400 copies/mL 19% against 7%, P<0.001',
        unreportedAdverseSignals:
          'Adding lamivudine to peginterferon did not improve post-therapy response rates. Pyrexia, fatigue, myalgia and headache were markedly more frequent on interferon-containing arms.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Sustained virologic response 40.9% in 3,070 previously untreated genotype 1 hepatitis C patients, statistically indistinguishable from peginterferon alfa-2b',
        '56% against 44% when pegylated interferon replaced conventional interferon on identical ribavirin',
        'HBeAg seroconversion 32% against 19% on lamivudine 24 weeks after a finite 48-week course',
        'HBsAg loss or seroconversion in a low single-digit percentage of peginterferon recipients against none on lamivudine alone, in both hepatitis B trials',
        'An IL28B polymorphism associated with an approximately twofold change in response (P = 1.06 x 10^-25 in patients of European ancestry)',
      ],
      unsupportedInferences: [
        'That seroconversion or sustained virologic response on interferon translates into fewer cancers, transplants or deaths — no registrational trial measured any of those',
        'That the two pegylated interferons differ clinically; 3,070 patients found a 1.1-point difference with a confidence interval spanning zero',
        'That combining interferon with a nucleoside analogue should help, an intuition both hepatitis B trials tested and neither supported',
        'That the hepatitis B results generalise across viral genotypes; 87% of the HBeAg-positive population was Asian and mostly infected with HBV genotype B or C',
      ],
      whatFailedInitially: [
        'Boxed warning for fatal or life-threatening neuropsychiatric, autoimmune, ischemic and infectious disorders — four categories in one warning',
        'Sixty per cent of genotype 1 hepatitis C patients were not cured after 48 weeks of weekly injections',
        'Adding lamivudine to peginterferon did not improve post-therapy response in either hepatitis B trial',
        'Contraindicated in decompensated cirrhosis and in autoimmune hepatitis, excluding the patients with the most advanced liver disease',
        'Interferon-induced thyroid dysfunction is frequently permanent after the drug is stopped',
      ],
      realWorldOutcome: [
        'Approved 2002 under BLA 103964; divested from Roche/Genentech to Pharmaand GmbH in 2022',
        'Displaced from hepatitis C within about four years of the direct-acting antivirals, with monotherapy now indicated only where those drugs cannot be used',
        'Retained in hepatitis B as the only treatment given for a fixed course rather than indefinitely, and the only one with a meaningful chance of surface antigen loss',
        'IL28B genotyping became briefly standard in 2010 and is now effectively unused, having been made irrelevant by the drugs that replaced the drug it predicted',
      ],
    },
    deliverySystem: {
      type: 'Subcutaneous injection, once weekly, from a prefilled syringe or autoinjector',
      description:
        'Given weekly rather than three times weekly because the attached 40 kDa branched polyethylene glycol chain slows renal clearance. Treatment is for a defined course — typically 48 weeks — rather than indefinitely, which is the feature that distinguishes it from the oral hepatitis B drugs.',
      safetyProfile:
        'Boxed warning that alpha interferons may cause or aggravate fatal or life-threatening neuropsychiatric, autoimmune, ischemic and infectious disorders, with instruction to monitor closely and withdraw therapy on persistently severe or worsening signs. Contraindicated in autoimmune hepatitis and in decompensated cirrhosis, and in neonates and infants because the injection contains benzyl alcohol. Common reactions are systemic rather than hepatic: fever, fatigue, myalgia, headache, neutropenia, thrombocytopenia, depression and thyroid dysfunction. Serious adverse events occurred in 4% to 6% of interferon arms in the hepatitis B trials against 2% on lamivudine, and in 8.6% to 11.7% across the arms of IDEAL.',
    },
    commonQuestions: [
      {
        q: 'Does this drug attack the virus?',
        a: 'No, and that is the single most important thing to understand about it. Every other drug on these hepatitis pages binds something the virus makes — a polymerase, a protease, a scaffolding protein. Peginterferon binds a receptor on your own cells. It is a manufactured copy of a signal your body already produces when a cell detects a virus, and its effect is to switch on several hundred defensive genes at once. That is why no resistance mutation defeats it: there is no single target for the virus to change. It is also why the side effects are everywhere. The receptor it binds sits on essentially every nucleated cell in the body, so the antiviral state it creates in the liver is also created in bone marrow, thyroid and brain.',
      },
      {
        q: 'Why does it make people feel so ill?',
        a: 'Because the sensation of having a virus is largely the sensation of interferon. Fever, aching muscles, exhaustion and low mood are not side effects in the incidental sense; they are what the interferon response feels like, produced continuously for months instead of for a few days. Beyond that, the boxed warning names four categories of serious disorder — neuropsychiatric, autoimmune, ischemic and infectious — any of which can be fatal or life-threatening. Depression is monitored routinely rather than waited for. Thyroid disease is common and often does not reverse when the drug stops. In the hepatitis B trials, serious adverse events occurred in 4% to 6% of interferon recipients against 2% on the tablet comparator.',
      },
      {
        q: 'Why would anyone choose injections over a tablet for hepatitis B?',
        a: 'For one reason: an end date. Entecavir and tenofovir suppress hepatitis B in almost everyone, but the virus returns when they stop, so treatment is indefinite and stopping can trigger a severe flare. Peginterferon is given for 48 weeks and then stopped, and in a minority the immune system holds the line afterwards. In the HBeAg-positive trial, 32% had seroconverted 24 weeks after finishing, against 19% on lamivudine, and sixteen patients cleared surface antigen against none on the tablet. Those are minority outcomes bought with a genuinely difficult year. Whether the trade is worth making depends on the individual, which is exactly why this is a conversation with a hepatologist rather than a rule.',
        auditNote:
          'The comparison in those trials was against lamivudine, a drug no longer first-line. Neither hepatitis B trial compared peginterferon against entecavir or tenofovir.',
      },
      {
        q: 'Why did response rates differ so much between patients?',
        a: 'For twenty years this was explained by dose, body weight, adherence, viral load and how much liver damage there was. In 2009 a genome-wide association study found a common polymorphism near IL28B, the gene for interferon-lambda-3, associated with roughly a twofold difference in the chance of cure. Because the favourable version is much more frequent in European than African populations, it accounted for about half of the long-observed difference in response rates between patients of African and European ancestry — a gap that had been discussed in every other register first. Genotyping for it briefly became standard practice around 2010. Within five years the direct-acting antivirals had made the whole question moot, because they cure people regardless of their IL28B genotype.',
      },
      {
        q: 'Is peginterferon alfa-2a better than alfa-2b?',
        a: 'No. The two were marketed against each other for most of a decade before anyone ran the comparison properly. IDEAL randomised 3,070 previously untreated genotype 1 patients across 118 sites and found sustained virologic response of 40.9% with alfa-2a against 39.8% with standard-dose alfa-2b — a difference of about one point with a confidence interval running from -5.3 to +3.0, and a P value of 0.57. Tolerability was also similar. One real difference did appear underneath the headline: alfa-2a suppressed more virus during treatment and then lost more of it, with relapse in 31.5% against 23.5%. The two routes arrived at the same destination.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Fried MW et al. Peginterferon alfa-2a plus ribavirin for chronic hepatitis C virus infection. N Engl J Med 2002;347:975-982',
        identifier: '10.1056/NEJMoa020047',
        kind: 'doi',
      },
      {
        label:
          'Lau GK et al. Peginterferon alfa-2a, lamivudine, and the combination for HBeAg-positive chronic hepatitis B. N Engl J Med 2005;352:2682-2695',
        identifier: '10.1056/NEJMoa043470',
        kind: 'doi',
      },
      {
        label:
          'Marcellin P et al. Peginterferon alfa-2a alone, lamivudine alone, and the two in combination in patients with HBeAg-negative chronic hepatitis B. N Engl J Med 2004;351:1206-1217',
        identifier: '10.1056/NEJMoa040431',
        kind: 'doi',
      },
      {
        label:
          'McHutchison JG et al. Peginterferon alfa-2b or alfa-2a with ribavirin for treatment of hepatitis C infection. N Engl J Med 2009;361:580-593 (IDEAL)',
        identifier: '10.1056/NEJMoa0808010',
        kind: 'doi',
      },
      {
        label:
          'Ge D et al. Genetic variation in IL28B predicts hepatitis C treatment-induced viral clearance. Nature 2009;461:399-401',
        identifier: '10.1038/nature08309',
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
          'van de Ven N et al. Minimum target prices for production of direct-acting antivirals and associated diagnostics to combat hepatitis C virus. Hepatology 2015;61:1174-1182',
        identifier: '10.1002/hep.27641',
        kind: 'doi',
      },
      {
        label: 'IDEAL: peginterferon alfa-2b or alfa-2a with ribavirin in genotype 1',
        identifier: 'NCT00081770',
        kind: 'nct',
      },
      {
        label:
          'Drugs@FDA: PEGASYS (peginterferon alfa-2a), BLA 103964 — original approval 16 October 2002',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=103964',
        kind: 'regulatory',
      },
      {
        label:
          'UniProt P01563 (IFNA2_HUMAN) — interferon alpha-2 precursor, mature chain 24-188 and the annotated alpha-2A allele variant at position 46',
        identifier: 'https://rest.uniprot.org/uniprotkb/P01563.txt',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 9. Elbasvir — the only modern hepatitis C drug whose label asks for a resistance test before
  //    the first tablet, and the reason is printed in its own clinical data: 98% against 70%.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'elbasvir',
    name: 'Elbasvir',
    tradeName: 'Zepatier',
    sponsor: 'Merck Sharp & Dohme, a subsidiary of Merck & Co.',
    targetGene: 'HCV NS5A — a hepatitis C viral gene, not a human one',
    targetProtein:
      'Hepatitis C virus NS5A phosphoprotein, the non-enzymatic protein that organises the viral replication complex and directs virion assembly',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2016,
    indication:
      'Chronic hepatitis C virus genotype 1 or 4 infection in adults and children aged 12 years and older or weighing at least 30 kg, as a fixed-dose combination with grazoprevir, with ribavirin in certain populations',
    patientFriendlyIndication: 'Long-standing hepatitis C infection, genotype 1 or 4 only',
    anatomicalSite:
      'Hepatocyte cytoplasm — the membranous web of remodelled endoplasmic reticulum where NS5A holds the replication complex together',
    conditionContext: {
      conditionExplainer:
        'Hepatitis C folds the liver cell’s own membranes into a private workshop and copies itself inside it. NS5A is the protein that holds that workshop together and hands finished genomes to the packing line, and it is the target of an entire drug class.',
      whyItMatters:
        'Elbasvir is where the industry ran into a wall it had been able to ignore. Some people carry hepatitis C that is already partly resistant to NS5A inhibitors before they have taken a single tablet, because those changes occur naturally in the virus population. For this drug the effect was large enough that the regulator asked for a test.',
      whoTakesThis:
        'Adults and children aged 12 and over with genotype 1 or 4. Not for genotypes 2, 3, 5 or 6. Contraindicated in anyone with moderate or severe liver impairment or a history of hepatic decompensation.',
      clinicalGoals:
        'Sustained virologic response at 12 weeks. What is different here is what has to happen before treatment: a hepatitis B test for everyone, and in genotype 1a a resistance test that decides both the duration and whether ribavirin is added.',
    },
    oneSentenceVerdict:
      'An NS5A inhibitor of picomolar potency — 4 pM against genotype 1a and 0.3 pM against genotype 4 — that cured 95% of 316 previously untreated patients in C-EDGE and 99% of 116 with stage 4 or 5 kidney disease in C-SURFER, but whose own label reports 98% cure in genotype 1a without baseline NS5A polymorphisms against 70% with them, which is why it is the one modern hepatitis C drug that asks for a resistance test before the first tablet.',
    laymanHowItWorks:
      'Hepatitis C cannot copy itself in the open cytoplasm. It first folds the liver cell’s membranes into a sealed workshop, and one viral protein called NS5A is what holds that structure together and loads finished genomes into new virus particles. Elbasvir binds NS5A at concentrations measured in trillionths of a gram and stops it doing either job. It is always given fixed together with grazoprevir, which attacks a different viral protein, because hitting one target alone lets the virus escape.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 78,
    pricing: {
      synthesisCostPerDose:
        'US$115 per 12-week course of elbasvir with grazoprevir, projected minimum cost of large-scale generic production at a scale of at least five million patients per year, costed from molecular structure, dose, duration and retrosynthesis (van de Ven et al., Hepatology 2015, where the pair appear under their development codes MK-8742 and MK-5172)',
      retailPricePerDoseOrYear:
        'US$54,600 per 12-week course at the United States wholesale acquisition cost recorded in the published price comparison',
      markupEstimate:
        'Roughly 475-fold the projected minimum cost of production for the same 12-week course',
      openPatentNotes:
        'The US$54,600 launch price was set deliberately below the sofosbuvir-based regimens already on the market — the first time a hepatitis C entrant competed on list price rather than matching it. It was still the highest markup over modelled production cost of any regimen the same analysis costed, which is a useful measure of how little the discount actually meant.',
      synthesisComplexity: 'High',
      costSource: {
        label:
          'van de Ven N, Fortunak J, Simmons B, Ford N, Cooke GS, Khoo S, Hill A. Minimum target prices for production of direct-acting antivirals and associated diagnostics to combat hepatitis C virus. Hepatology 2015;61:1174-1182',
        identifier: '10.1002/hep.27641',
        kind: 'doi',
      },
      priceSource: {
        label:
          'Rosenthal ES, Graham CS. Price and affordability of direct-acting antiviral regimens for hepatitis C virus in the United States. Infect Agent Cancer 2016;11:24',
        identifier: '10.1186/s13027-016-0071-z',
        kind: 'doi',
      },
    },
    substitutes: {
      summary:
        'The pan-genotypic regimens replaced this one for most patients, and they did it partly by removing the resistance test. Where elbasvir with grazoprevir still competes is advanced kidney disease, where it has a strong result — and so does glecaprevir with pibrentasvir.',
      conventionalRx: [
        {
          name: 'Pibrentasvir, in glecaprevir/pibrentasvir (Mavyret)',
          class: 'Pan-genotypic NS5A inhibitor with an NS3/4A protease inhibitor',
          howItCompares:
            'Covers all six genotypes rather than two, needs no baseline resistance testing, treats most previously untreated patients in 8 weeks rather than 12, and is equally usable in dialysis. The same protease-inhibitor contraindication in decompensated cirrhosis applies to both.',
          typicalCost:
            'US$152.92 per tablet, median across the three listed products at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: all genotypes, no pre-treatment resistance test, 8 weeks. Cons: three tablets daily rather than one.',
        },
        {
          name: 'Velpatasvir, in sofosbuvir/velpatasvir (Epclusa)',
          class: 'Pan-genotypic NS5A inhibitor with an NS5B nucleotide inhibitor',
          howItCompares:
            'All six genotypes, one tablet, 12 weeks, and the only pan-genotypic option usable in decompensated cirrhosis because it contains no protease inhibitor. Its nucleotide partner is renally cleared, which limits it in advanced kidney disease.',
          typicalCost:
            'US$866.40 per tablet, median across the two listed products at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: usable in Child-Pugh B and C. Cons: renally cleared metabolite; 12 weeks.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Ask whether the resistance test was done, and what it found',
          action:
            'If you have genotype 1a, ask specifically whether NS5A resistance testing was performed and whether polymorphisms were found at positions 28, 30, 31 or 93.',
          patientImpact:
            'The label reports 98% cure in genotype 1a patients without those polymorphisms and 70% in those with them on the standard 12-week course. If they are present the regimen changes to 16 weeks with ribavirin.',
          clinicalPrecaution:
            'This is a pre-treatment test recommended in the label’s dosing section, not an optional refinement. No other current hepatitis C regimen asks for it.',
        },
        {
          name: 'Get tested for hepatitis B first, even if you think you are negative',
          action: 'Ask for both HBsAg and anti-HBc, not just one of them.',
          patientImpact:
            'Hepatitis B reactivation during hepatitis C treatment has caused fulminant hepatitis, liver failure and death. Cases have occurred in patients who were HBsAg negative but anti-HBc positive — that is, in people whose hepatitis B was considered resolved.',
          clinicalPrecaution:
            'This is a boxed warning applying to the whole direct-acting antiviral class, and the two-test requirement is the point: one test alone misses the resolved-infection group.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CC(C)[C@@H](C(=O)N1CCC[C@H]1C2=NC=C(N2)C3=CC4=C(C=C3)N5[C@@H](OC6=C(C5=C4)C=CC(=C6)C7=CN=C(N7)[C@@H]8CCCN8C(=O)[C@H](C(C)C)NC(=O)OC)C9=CC=CC=C9)NC(=O)OC',
      chemicalFormula: 'C49H55N9O7',
      molecularWeight: '882.00 g/mol',
      targetReceptorAffinity:
        'EC50 of 4 pM against full-length genotype 1a replicons, 3 pM against genotype 1b and 0.3 pM against genotype 4. Against chimeric replicons carrying NS5A from clinical isolates the picture fractures by subtype: median 5 pM for genotype 1a, 9 pM for 1b, 0.2 pM for 4a, 0.45 pM for 4d — and 3,600 pM for genotype 4b, with a range from 17 to 34,000 pM across three isolates. That is a ten-thousandfold spread inside a genotype the label covers.',
      structureSource: {
        label: 'PubChem CID 71661251 (elbasvir) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/71661251',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'elb-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity of the two imidazole-proline arms and the tetracyclic indole core',
          description:
            'Confirm identity and stereochemistry of the two methyl-carbamate-capped valine-proline-imidazole arms and of the fused tetracyclic indole-benzoxazine core, including the benzylic stereocentre that carries the pendant phenyl ring. Elbasvir is pseudo-symmetric rather than symmetric, so a fragment assay that confirms one arm proves nothing about the other.',
          reagentsAndBuffer:
            'Chiral HPLC against single-enantiomer standards, 1H and 13C NMR in DMSO-d6, methyl N-methoxycarbonyl-valine and proline-imidazole reference standards, Karl Fischer titration',
        },
        {
          id: 'elb-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Build the tetracycle, then couple both arms and cap',
          description:
            'Assemble the fused indole-benzoxazine tetracycle carrying the benzylic aryl group, install both imidazole units by cross-coupling, then attach the proline-valine arms and cap the amines as methyl carbamates. The benzylic stereocentre in the tetracycle is set early and carried through every subsequent step, so any epimerisation late in the route is expensive to detect and impossible to correct.',
          dependsOnStepId: 'elb-w1',
          reagentsAndBuffer:
            'Palladium precatalyst with a biaryl phosphine ligand for Suzuki or direct arylation, caesium or potassium carbonate base, anhydrous dioxane or DMF under nitrogen, HATU or a mixed anhydride for the amide couplings, methyl chloroformate with N-methylmorpholine',
        },
        {
          id: 'elb-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Palladium removal and separation of the diastereomers',
          description:
            'Strip residual palladium to the elemental impurity limit and resolve the target from diastereomers differing at the benzylic or proline centres. Diastereomers of a molecule this size share the parent mass and often co-elute on C18, so a single-method purity number is not a release criterion here.',
          dependsOnStepId: 'elb-w2',
          reagentsAndBuffer:
            'Thiourea- or thiol-functionalised silica scavenger, activated charcoal, preparative reversed-phase chromatography, chiral stationary phase for diastereomeric purity, ICP-MS for residual palladium',
        },
        {
          id: 'elb-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Chimeric replicons carrying NS5A from real clinical isolates, not laboratory strains',
          description:
            'Dose replicons in which the NS5A gene has been replaced with sequences amplified from patient isolates, covering multiple subtypes within each genotype. This is the step that exposed the genotype 4b problem: the laboratory genotype 4 reference reads 0.3 pM, and clinical 4b isolates read a median of 3,600 pM. A programme that tested only reference strains would have carried that gap into the label unnoticed.',
          dependsOnStepId: 'elb-w3',
          reagentsAndBuffer:
            'Huh-7 replicon backbone with patient-derived NS5A inserts from subtypes 1a, 1b, 4a, 4b, 4d, 4f, 4g, 4m, 4o and 4q, low-binding dilution plates for picomolar work, DMEM with 10% fetal bovine serum and G418, luciferase readout',
        },
        {
          id: 'elb-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Baseline polymorphism panel at NS5A positions 28, 30, 31 and 93',
          description:
            'Measure potency against every naturally occurring substitution at NS5A positions M28, Q30, L31 and Y93, singly and in combination, and report the fold-change rather than only the wild-type figure. These are the four positions the label names, and the clinical consequence is already published: 98% cure without them and 70% with them on the 12-week regimen. Deep sequencing of pre-treatment isolates at a 15% detection threshold is the same assay the clinical test uses.',
          dependsOnStepId: 'elb-w4',
          reagentsAndBuffer:
            'Site-directed NS5A mutants M28A/G/T/V, Q30D/E/H/K/R, L31F/M/V and Y93C/H/N in genotype 1a and 1b backbones, single and paired combinations, next-generation sequencing at a 15% detection threshold, matched wild-type controls run in the same plate',
        },
      ],
    },
    keyAudits: [
      {
        id: 'elb-a1',
        category: 'measured',
        title: 'C-EDGE: 95% cured in 316 previously untreated patients, against a placebo arm',
        laymanSummary:
          'A randomised, blinded, placebo-controlled trial of 421 people found 95% of those treated were cured, including 97% of those who already had cirrhosis. Serious side effects occurred at the same rate on the drug as on placebo.',
        technicalDetails:
          'C-EDGE TREATMENT-NAIVE randomised 421 cirrhotic and non-cirrhotic treatment-naive adults with genotype 1, 4 or 6 infection 3:1 to immediate or deferred fixed-dose grazoprevir 100 mg with elbasvir 50 mg for 12 weeks, blinded and placebo-controlled, at 60 centres. Of 316 receiving immediate treatment, 299 (95%, 95% CI 92 to 97) achieved SVR12: 92% (144/157) in genotype 1a, 97% (68/70) with cirrhosis, 94% (231/246) without cirrhosis, and 80% (8/10) in genotype 6. Virologic failure occurred in 13 patients (4%) — one breakthrough and twelve relapses — and was associated with baseline NS5A polymorphisms and emergent NS3 or NS5A variants. Serious adverse events occurred in 2.8% on active treatment and 2.9% on placebo, none considered drug related.',
        evidenceSource:
          'Zeuzem S et al., Ann Intern Med 2015;163:1-13 (C-EDGE TREATMENT-NAIVE, NCT02105467)',
        doi: '10.7326/M15-0785',
        measuredMetric:
          'Sustained virologic response at 12 weeks, against a concurrent blinded placebo arm',
        auditFlag: 'verified',
      },
      {
        id: 'elb-a2',
        category: 'failed',
        title: 'The label’s own numbers: 98% without baseline polymorphisms, 70% with them',
        laymanSummary:
          'In genotype 1a, cure rates depended heavily on changes the virus already carried before treatment. Without them, 441 of 450 patients were cured. With them, 39 of 56 — a drop of 28 points.',
        technicalDetails:
          'Table 12 of the prescribing information reports SVR12 in genotype 1a-infected subjects on the 12-week regimen as 98% (441/450) without any baseline NS5A polymorphism at M28, Q30, L31 or Y93, against 70% (39/56) with one or more. Genotype 1b was far less affected: 94% (48/51) with polymorphisms against 99% (247/248) without. In genotype 1a the NS3 Q80K polymorphism, which defeated an earlier protease inhibitor, did not affect response, so the vulnerability is specific to the NS5A component. This is the reason the dosing section recommends testing for NS5A resistance-associated polymorphisms in genotype 1a before treatment — a requirement no other current hepatitis C regimen carries.',
        evidenceSource:
          'ZEPATIER United States prescribing information, Microbiology 12.4, Table 12, and Dosage and Administration 2.1 (NDA 208261)',
        measuredMetric:
          'SVR12 in genotype 1a by baseline NS5A polymorphism status: 98% (441/450) against 70% (39/56)',
        auditFlag: 'caution',
      },
      {
        id: 'elb-a3',
        category: 'inferred',
        title: 'The rescue regimen was validated in six patients and then tested in ninety-three',
        laymanSummary:
          'For patients carrying those changes, the label prescribes a longer course with ribavirin. In the trials that worked in six out of six people. In a later cohort of ninety-three real patients it worked in 81%, and in those with more than one change, 64%.',
        technicalDetails:
          'The 16-week regimen with ribavirin achieved SVR12 in 100% (6/6) of genotype 1a subjects with baseline NS5A polymorphisms in the clinical trial dataset, and 100% (49/49) of those without. In postmarketing observational data the same regimen achieved 93% (27/29) in Protocol 095, and 81% (75/93) in a retrospective Veterans Administration cohort — falling to 64% (18/28) in patients with polymorphisms at more than one of the four positions. Within the VA cohort, single polymorphisms at M28, Q30, L31 and Y93 gave 94%, 100%, 84% and 81%. The label states that effectiveness in observational studies is subject to bias and confounding, which is true; it is also true that a six-patient trial denominator is a thin basis for the strategy that rescues the population the primary regimen fails.',
        evidenceSource:
          'ZEPATIER United States prescribing information, Microbiology 12.4, clinical trial data and postmarketing observational studies including Protocol 095 and the VA NS5A cohort (NDA 208261)',
        inferredClaim:
          'That extending to 16 weeks with ribavirin restores full efficacy in genotype 1a patients with baseline NS5A polymorphisms — 100% of six in trial, 81% of ninety-three in practice',
        auditFlag: 'contested',
      },
      {
        id: 'elb-a4',
        category: 'failed',
        title: 'Genotype 4b: a ten-thousandfold potency gap inside an approved genotype',
        laymanSummary:
          'Against the reference genotype 4 virus, elbasvir is one of the most potent antivirals ever measured. Against clinical isolates of one subtype of genotype 4, it is roughly ten thousand times weaker.',
        technicalDetails:
          'Against chimeric replicons encoding NS5A from clinical isolates, median EC50 values were 5 pM for genotype 1a (range 3 to 9, N=5), 9 pM for 1b (5 to 10, N=4), 0.2 pM for 4a (N=2), 0.45 pM for 4d (N=2), 1.9 pM for 4f, 0.6 pM for 4m and 0.5 pM for 4q — and 3,600 pM for genotype 4b, with a range of 17 to 34,000 pM across three isolates. The full-length laboratory genotype 4 replicon reads 0.3 pM. The label indication covers genotype 4 without subtype qualification. The number of genotype 4 patients in the registrational programme was small: C-EDGE enrolled 91% genotype 1 and the pooled genotype 4 phylogenetic analysis covered 71 subjects, and the paper itself lists relatively few genotype 4 and 6 infections as a limitation.',
        evidenceSource:
          'ZEPATIER United States prescribing information, Microbiology 12.4, antiviral activity against chimeric replicons (NDA 208261)',
        measuredMetric:
          'Median elbasvir EC50 by genotype 4 subtype: 0.2 pM (4a), 0.45 pM (4d), 3,600 pM (4b)',
        auditFlag: 'caution',
      },
      {
        id: 'elb-a5',
        category: 'measured',
        title: 'C-SURFER: 99% cured in stage 4 and 5 kidney disease',
        laymanSummary:
          'A hundred and sixteen people with failing kidneys or on dialysis were treated and 115 were cured. Before this, the comparison was a 45% response rate from interferon.',
        technicalDetails:
          'C-SURFER enrolled patients with genotype 1 hepatitis C and stage 4 or 5 chronic kidney disease, randomising 224 to immediate (n=111) or deferred (n=113) grazoprevir 100 mg with elbasvir 50 mg for 12 weeks, plus 11 in an intensive pharmacokinetic cohort. SVR12 in the combined immediate treatment and pharmacokinetic population was 99% (115/116; 95% CI 95.3 to 100.0), with one relapse. No patient in that group discontinued for an adverse event, against five (4%) in the deferred group. The most common events — headache, nausea, fatigue — occurred at similar frequencies on active drug and placebo.',
        evidenceSource: 'Roth D et al., Lancet 2015;386:1537-1545 (C-SURFER, NCT02092350)',
        doi: '10.1016/S0140-6736(15)00349-9',
        measuredMetric:
          'Sustained virologic response at 12 weeks in stage 4 or 5 chronic kidney disease',
        auditFlag: 'verified',
      },
      {
        id: 'elb-a6',
        category: 'inferred',
        title: 'C-SURFER randomised for safety and compared efficacy against a historical control',
        laymanSummary:
          'The kidney trial did have a placebo group, but it was not used to judge whether the drug worked. The cure rate was compared instead against a 45% figure taken from older interferon studies.',
        technicalDetails:
          'The paper describes itself as a phase 3 randomised study of safety and observational study of efficacy. The primary efficacy outcome was a non-randomised comparison of SVR12 in the combined immediate-treatment and pharmacokinetic populations against a historical control of 45%, derived from meta-analyses of interferon-based regimens in haemodialysis patients. The randomised comparison between immediate and deferred groups was the primary safety outcome. This is a defensible design and it is not the same thing as a randomised efficacy result: the 99% figure has no concurrent control, and the 45% comparator comes from a different era, a different drug class and a different population.',
        evidenceSource: 'Roth D et al., Lancet 2015;386:1537-1545 (C-SURFER, NCT02092350)',
        doi: '10.1016/S0140-6736(15)00349-9',
        inferredClaim:
          'That the 99% cure rate in advanced kidney disease was established against a concurrent control — the concurrent control existed and was used for safety, not efficacy',
        auditFlag: 'caution',
      },
      {
        id: 'elb-a7',
        category: 'failed',
        title: 'Two genotypes out of six, and the field moved past that',
        laymanSummary:
          'This regimen treats genotypes 1 and 4 only. Within two years of its launch, two combinations that treat all six and need no resistance test were approved.',
        technicalDetails:
          'The indication covers chronic hepatitis C genotype 1 or 4 in patients aged 12 and over. Sofosbuvir/velpatasvir was approved in June 2016 and glecaprevir/pibrentasvir in August 2017, both covering genotypes 1 through 6 with no pre-treatment resistance testing requirement. The clinical case for elbasvir with grazoprevir narrowed to advanced kidney disease, where its C-SURFER result is strong — and where glecaprevir with pibrentasvir subsequently produced 98% in EXPEDITION-4 across all six genotypes.',
        evidenceSource:
          'ZEPATIER United States prescribing information, Indications and Usage 1 (NDA 208261)',
        auditFlag: 'caution',
      },
      {
        id: 'elb-a8',
        category: 'inferred',
        title: 'Every endpoint is a blood test twelve weeks after the last tablet',
        laymanSummary:
          'C-EDGE and C-SURFER measured virus in blood. Neither counted deaths, cancers, transplants or dialysis outcomes.',
        technicalDetails:
          'The 2017 Cochrane review of 138 randomised direct-acting antiviral trials in 25,232 participants found no usable randomised evidence on hepatitis C-related morbidity or hepatocellular carcinoma, and mortality data from only 11 trials. C-SURFER makes the gap concrete: the population is defined by stage 4 or 5 kidney disease, the trial’s own rationale cites increased risk of death and renal graft failure, and the endpoint measured was viral RNA at twelve weeks.',
        evidenceSource: 'Jakobsen JC et al., Cochrane Database Syst Rev 2017;9:CD012143',
        doi: '10.1002/14651858.CD012143.pub3',
        inferredClaim:
          'That curing hepatitis C in advanced kidney disease reduces death or graft failure — the stated reason for running C-SURFER, and not something C-SURFER measured',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Two tests, then one tablet a day',
        laymanDesc:
          'Before the first dose, everyone is tested for hepatitis B and, in genotype 1a, for resistance changes in the virus. Those results decide the length of the course.',
        molecularDetail:
          'Fixed-dose combination of 50 mg elbasvir with 100 mg grazoprevir, one tablet once daily with or without food. Testing for NS5A resistance-associated polymorphisms at positions 28, 30, 31 and 93 is recommended in genotype 1a; their presence changes the regimen to 16 weeks with ribavirin.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Concentrated in the liver and cleared into bile',
        laymanDesc:
          'The drug is taken up by liver cells and leaves in bile rather than urine, which is why it can be used when the kidneys have failed.',
        molecularDetail:
          'Hepatic uptake with biliary elimination and negligible renal clearance, which is the pharmacological basis for the stage 4 and 5 chronic kidney disease result in C-SURFER. Elbasvir is a substrate of P-glycoprotein.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It binds NS5A, the protein with no enzyme pocket',
        laymanDesc:
          'NS5A does not cut or copy anything. It organises. Elbasvir sticks to it at trillionths of a gram per litre.',
        molecularDetail:
          'EC50 of 4 pM against genotype 1a, 3 pM against 1b and 0.3 pM against genotype 4 in full-length replicons. NS5A has no catalytic site, so the binding surface is a protein-protein interface at domain I rather than an enzyme active site.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The workshop never forms and nothing is packaged',
        laymanDesc:
          'The membrane compartment where the virus copies itself is never properly built, and the genomes already made are never loaded into new particles.',
        molecularDetail:
          'NS5A is required both for replication complex formation on the membranous web and for virion assembly through its domain III interaction with core protein. Inhibiting it blocks both, which is why NS5A inhibitors clear serum viral RNA faster in the first days of treatment than any other class.',
        iconName: 'Ban',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Cured in twelve weeks, including on dialysis',
        laymanDesc:
          'Ninety-five per cent of previously untreated patients and ninety-nine per cent of those with failing kidneys were cured.',
        molecularDetail:
          'SVR12 95% (299/316) in C-EDGE TREATMENT-NAIVE including 97% with cirrhosis, and 99% (115/116) in C-SURFER in stage 4 or 5 chronic kidney disease.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Unless the virus already carried the changes',
        laymanDesc:
          'Naturally occurring variations at four positions in NS5A cut the cure rate in genotype 1a from 98% to 70%. That is why the test exists.',
        molecularDetail:
          'Baseline polymorphisms at M28, Q30, L31 or Y93 reduced 12-week SVR12 from 98% (441/450) to 70% (39/56) in genotype 1a. Against clinical isolates of subtype 4b, median EC50 was 3,600 pM against 0.2 pM for subtype 4a.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'C-EDGE TREATMENT-NAIVE (NCT02105467)',
        phase:
          'Phase 3, randomised 3:1 to immediate or deferred therapy, blinded, placebo-controlled',
        sampleSize: 421,
        primaryEndpoint:
          'Unquantifiable HCV RNA 12 weeks after the end of treatment in the immediate-treatment group',
        endpointMet: true,
        statisticalPValue:
          '95% (299/316; 95% CI 92 to 97), including 92% (144/157) in genotype 1a and 97% (68/70) with cirrhosis',
        unreportedAdverseSignals:
          'The paper lists as limitations the absence of an active-comparator control and relatively few genotype 4 and 6 infections; genotype 6 SVR12 was 80% (8/10). All 13 virologic failures were associated with baseline NS5A polymorphisms or emergent variants.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'C-SURFER (NCT02092350)',
        phase:
          'Phase 3, randomised for safety against deferred treatment, observational for efficacy against a historical control',
        sampleSize: 235,
        primaryEndpoint:
          'Sustained virologic response 12 weeks after treatment in genotype 1 with stage 4 or 5 chronic kidney disease',
        endpointMet: true,
        statisticalPValue:
          '99% (115/116; 95% CI 95.3 to 100.0) against a historical control of 45% from interferon-based meta-analyses',
        unreportedAdverseSignals:
          'The efficacy comparison was explicitly non-randomised. The placebo-controlled randomisation was used for the safety endpoint only, so the 99% figure has no concurrent control.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Veterans Administration NS5A cohort (postmarketing, cited in the label)',
        phase: 'Retrospective observational cohort of the 16-week plus ribavirin rescue regimen',
        sampleSize: 93,
        primaryEndpoint:
          'SVR12 in genotype 1a patients with one or more baseline NS5A polymorphisms at M28, Q30, L31 or Y93',
        endpointMet: false,
        statisticalPValue:
          '81% (75/93) overall, falling to 64% (18/28) in patients with polymorphisms at more than one position — against 100% (6/6) in the corresponding clinical trial dataset',
        unreportedAdverseSignals:
          'Retrospective and uncontrolled. The label notes observational effectiveness data are subject to bias and confounding; the trial denominator it is being compared against is six patients.',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '95% sustained virologic response in 316 previously untreated patients, blinded and placebo-controlled, including 97% with cirrhosis',
        '99% (115/116) in genotype 1 patients with stage 4 or 5 chronic kidney disease',
        'Replicon EC50 of 4 pM (genotype 1a), 3 pM (1b) and 0.3 pM (genotype 4)',
        '98% (441/450) against 70% (39/56) in genotype 1a without and with baseline NS5A polymorphisms on the 12-week regimen',
        'Median EC50 of 3,600 pM against clinical genotype 4b isolates, against 0.2 pM for genotype 4a',
      ],
      unsupportedInferences: [
        'That the 16-week plus ribavirin rescue restores full efficacy — 100% of six patients in trial against 81% of ninety-three in a postmarketing cohort',
        'That the 99% kidney-disease result was established against a concurrent control; the comparator was a 45% historical rate from interferon studies',
        'That an indication covering "genotype 4" implies uniform activity across genotype 4; subtype 4b differs from 4a by four orders of magnitude in the label’s own table',
        'That curing hepatitis C in advanced kidney disease reduces death or graft failure, the stated rationale for C-SURFER and not its endpoint',
      ],
      whatFailedInitially: [
        'Naturally occurring NS5A polymorphisms at four positions cost 28 percentage points of cure rate in genotype 1a, which is why a pre-treatment resistance test is recommended',
        'The rescue regimen fell to 64% in patients carrying polymorphisms at more than one position in the Veterans Administration cohort',
        'Genotype 4b isolates showed a median EC50 ten thousand times higher than genotype 4a',
        'Genotype 6 SVR12 was 80% (8/10) in C-EDGE, and the label covers only genotypes 1 and 4',
        'Contraindicated in Child-Pugh B or C liver disease and in any history of hepatic decompensation, on account of its protease-inhibitor partner',
      ],
      realWorldOutcome: [
        'Approved January 2016 under NDA 208261; launched at US$54,600 per course, deliberately below the incumbent regimens',
        'The only current hepatitis C regimen whose label recommends baseline resistance testing before treatment',
        'Displaced for most patients within eighteen months by two pan-genotypic regimens that need no such test',
        'Retains a place in advanced kidney disease, where its biliary clearance and the C-SURFER result still apply',
      ],
    },
    deliverySystem: {
      type: 'Oral fixed-dose combination tablet with grazoprevir',
      description:
        'One tablet once daily, with or without food. Elbasvir is not sold separately. Duration is 12 or 16 weeks depending on genotype, prior treatment and, in genotype 1a, the result of a baseline NS5A resistance test; ribavirin is added in defined populations.',
      safetyProfile:
        'Boxed warning for hepatitis B virus reactivation, which has caused fulminant hepatitis, hepatic failure and death, including in patients whose hepatitis B was considered resolved — so both HBsAg and anti-HBc must be checked before treatment. Contraindicated in Child-Pugh B or C hepatic impairment, in any history of hepatic decompensation, with OATP1B1/3 inhibitors, with strong CYP3A inducers and with efavirenz. Around 1% of subjects had ALT rise from normal to more than five times the upper limit of normal, generally at or after week 8, with higher rates in women (2%), Asian patients (2%) and those aged 65 or older (2%); this is attributed to grazoprevir exposure and drives the requirement for liver testing before treatment and at week 8. Serious adverse events in C-EDGE were 2.8% on active treatment against 2.9% on placebo.',
    },
    commonQuestions: [
      {
        q: 'Why does this drug need a resistance test when the newer ones do not?',
        a: 'Because its own registrational data showed the difference was too large to ignore. In genotype 1a, patients whose virus carried no naturally occurring change at NS5A positions 28, 30, 31 or 93 were cured in 98% of cases — 441 out of 450. Patients whose virus carried one or more were cured in 70% — 39 out of 56. Those changes are not caused by previous treatment; they occur naturally in the circulating virus population, which is why they can be present in someone who has never taken a hepatitis C tablet. The label therefore recommends testing genotype 1a patients before starting, and prescribes a longer course with ribavirin if the changes are found. The pan-genotypic regimens that followed have a wider margin against the same polymorphisms and carry no such requirement.',
      },
      {
        q: 'If the test is positive, does the longer course fix it?',
        a: 'Partly, and less completely than the trial suggested. In the registrational dataset the 16-week regimen with ribavirin cured 100% of the genotype 1a patients with baseline polymorphisms — but that was six patients. Two postmarketing cohorts tested the same strategy at scale: one found 93% of 29 patients cured, the other 81% of 93. In the larger cohort, patients carrying polymorphisms at more than one of the four positions were cured 64% of the time. Observational data have their own biases and the label says so. It is still the case that the strategy relied on for the harder population was validated on a denominator of six.',
        auditNote:
          'A 100% result from six patients and an 81% result from ninety-three are not in conflict statistically. The point is which one should have been carried into practice as the expectation.',
      },
      {
        q: 'Does it work for genotype 4?',
        a: 'It is approved for genotype 4, and the potency figures inside genotype 4 vary by four orders of magnitude. Against the laboratory reference the concentration needed is 0.3 picomolar. Against clinical isolates it is 0.2 picomolar for subtype 4a and 0.45 for 4d — and a median of 3,600 picomolar for subtype 4b, with one isolate at 34,000. The registrational programme was 91% genotype 1 and the pooled genotype 4 analysis covered 71 patients, so the clinical experience behind the genotype 4 indication is thin relative to the genotype 1 experience, and thinner still at the subtype level. If you have genotype 4, it is reasonable to ask whether a subtype was reported.',
      },
      {
        q: 'Why do I need a hepatitis B test before taking a hepatitis C drug?',
        a: 'Because clearing hepatitis C can wake up hepatitis B. Reactivation has been reported in co-infected patients during and after direct-acting antiviral treatment, and some cases have resulted in fulminant hepatitis, liver failure and death. Critically, this has happened not only in people who knew they had active hepatitis B but also in people who were surface-antigen negative and core-antibody positive — that is, in people whose hepatitis B was considered resolved and who would test negative on the commoner single test. That is why the label requires both HBsAg and anti-HBc. It is a boxed warning across the whole drug class, not something specific to this regimen.',
      },
      {
        q: 'Is it still used?',
        a: 'Much less than it was. It treats two genotypes out of six, needs a pre-treatment resistance test in the commonest subtype it treats, and takes 12 to 16 weeks. Within eighteen months of its January 2016 approval, two regimens were available that treat all six genotypes with no resistance testing, one of them in eight weeks. Where it still holds ground is advanced kidney disease, where its C-SURFER result of 99% in 116 patients on or near dialysis remains one of the strongest in that population — although glecaprevir with pibrentasvir has since produced 98% across all six genotypes in the same setting.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Zeuzem S et al. Grazoprevir-elbasvir combination therapy for treatment-naive cirrhotic and noncirrhotic patients with chronic hepatitis C virus genotype 1, 4, or 6 infection: a randomized trial. Ann Intern Med 2015;163:1-13',
        identifier: '10.7326/M15-0785',
        kind: 'doi',
      },
      {
        label:
          'Roth D et al. Grazoprevir plus elbasvir in treatment-naive and treatment-experienced patients with hepatitis C virus genotype 1 infection and stage 4-5 chronic kidney disease (C-SURFER). Lancet 2015;386:1537-1545',
        identifier: '10.1016/S0140-6736(15)00349-9',
        kind: 'doi',
      },
      {
        label:
          'van de Ven N et al. Minimum target prices for production of direct-acting antivirals and associated diagnostics to combat hepatitis C virus. Hepatology 2015;61:1174-1182',
        identifier: '10.1002/hep.27641',
        kind: 'doi',
      },
      {
        label:
          'Rosenthal ES, Graham CS. Price and affordability of direct-acting antiviral regimens for hepatitis C virus in the United States. Infect Agent Cancer 2016;11:24',
        identifier: '10.1186/s13027-016-0071-z',
        kind: 'doi',
      },
      {
        label:
          'Jakobsen JC et al. Direct-acting antivirals for chronic hepatitis C. Cochrane Database Syst Rev 2017;9:CD012143',
        identifier: '10.1002/14651858.CD012143.pub3',
        kind: 'doi',
      },
      {
        label: 'C-EDGE TREATMENT-NAIVE: genotype 1, 4 or 6, placebo-controlled',
        identifier: 'NCT02105467',
        kind: 'nct',
      },
      {
        label: 'C-SURFER: genotype 1 with stage 4 or 5 chronic kidney disease',
        identifier: 'NCT02092350',
        kind: 'nct',
      },
      {
        label:
          'Drugs@FDA: ZEPATIER (elbasvir and grazoprevir), NDA 208261, Merck Sharp & Dohme — original approval 28 January 2016',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=208261',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 71661251 — elbasvir structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/71661251',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 10. Grazoprevir — a protease inhibitor that beat the mutation which killed its predecessor,
  //     and that is contraindicated in severe liver impairment because its own concentration rises
  //     twelvefold there.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'grazoprevir',
    name: 'Grazoprevir',
    tradeName: 'Zepatier',
    sponsor: 'Merck Sharp & Dohme, a subsidiary of Merck & Co.',
    targetGene: 'HCV NS3/4A — a hepatitis C viral gene, not a human one',
    targetProtein:
      'Hepatitis C virus NS3/4A serine protease, the enzyme that cuts the viral polyprotein into its working parts and also disables part of the cell’s own viral alarm',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2016,
    indication:
      'Chronic hepatitis C virus genotype 1 or 4 infection in adults and children aged 12 years and older or weighing at least 30 kg, as a fixed-dose combination with elbasvir, with ribavirin in certain populations',
    patientFriendlyIndication: 'Long-standing hepatitis C infection, genotype 1 or 4 only',
    anatomicalSite:
      'Hepatocyte cytoplasm at the endoplasmic reticulum membrane — and the drug is actively pumped into the liver, which is why liver failure makes it dangerous and kidney failure does not',
    conditionContext: {
      conditionExplainer:
        'Hepatitis C makes all its proteins as one long chain and cuts them apart with a molecular scissor of its own, NS3/4A. Without that cut, none of the parts work. The same scissor also cuts a human protein the cell uses to raise the alarm about viral RNA, so blocking it does two things at once.',
      whyItMatters:
        'The first generation of these scissor-blockers was defeated by a single common natural variant, Q80K, present in a large share of genotype 1a infections. Grazoprevir was designed against that problem and the label confirms Q80K does not affect it. Its limit turned out to be elsewhere: the liver it is concentrated in.',
      whoTakesThis:
        'Adults and children aged 12 and over with genotype 1 or 4, including those with HIV co-infection and those with advanced kidney disease. Contraindicated in anyone with moderate or severe liver impairment or any history of hepatic decompensation.',
      clinicalGoals:
        'Sustained virologic response at 12 weeks, with liver enzymes checked before treatment and again at week 8 because a small fraction of patients develop a late rise.',
    },
    oneSentenceVerdict:
      'An NS3/4A protease inhibitor that blocks the recombinant enzyme at 7, 4 and 62 picomolar across genotypes 1a, 1b and 4a and is untouched by the Q80K variant that defeated simeprevir, curing 95% of 316 previously untreated patients, 96% of 218 with HIV co-infection and 99% of 116 with stage 4 or 5 kidney disease — and contraindicated in Child-Pugh C liver disease because grazoprevir exposure rises twelvefold there.',
    laymanHowItWorks:
      'Hepatitis C builds all its proteins as one long strip and then cuts the strip into working parts with its own molecular scissors. Grazoprevir jams the scissors, so the strip is never cut and the virus cannot assemble the machinery it needs to copy itself. Blocking those scissors also restores part of the cell’s own alarm system, which the virus normally disables. It is given fixed together with elbasvir, which blocks a second, unrelated viral protein, so escaping one is not enough.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 78,
    pricing: {
      synthesisCostPerDose:
        'US$115 per 12-week course of grazoprevir with elbasvir, projected minimum cost of large-scale generic production at a scale of at least five million patients per year, costed from molecular structure, dose, duration and retrosynthesis (van de Ven et al., Hepatology 2015, where the pair appear under their development codes MK-5172 and MK-8742)',
      retailPricePerDoseOrYear:
        'US$54,600 per 12-week course at the United States wholesale acquisition cost recorded in the published price comparison',
      markupEstimate:
        'Roughly 475-fold the projected minimum cost of production for the same 12-week course',
      openPatentNotes:
        'The same analysis costed sofosbuvir with daclatasvir at US$122 and sofosbuvir with ledipasvir at US$192 for equivalent 12-week courses, so the projected floor for this pair was the lowest of the group. Its United States launch price was set below the incumbent regimens and was still tens of thousands of dollars above every modelled production cost in the paper.',
      synthesisComplexity: 'High',
      costSource: {
        label:
          'van de Ven N, Fortunak J, Simmons B, Ford N, Cooke GS, Khoo S, Hill A. Minimum target prices for production of direct-acting antivirals and associated diagnostics to combat hepatitis C virus. Hepatology 2015;61:1174-1182',
        identifier: '10.1002/hep.27641',
        kind: 'doi',
      },
      priceSource: {
        label:
          'Rosenthal ES, Graham CS. Price and affordability of direct-acting antiviral regimens for hepatitis C virus in the United States. Infect Agent Cancer 2016;11:24',
        identifier: '10.1186/s13027-016-0071-z',
        kind: 'doi',
      },
    },
    substitutes: {
      summary:
        'The other protease inhibitor in routine use is glecaprevir, and the two divide along the same fault line: both are contraindicated when the liver has decompensated, both are usable when the kidneys have failed, and only one of them covers all six genotypes.',
      conventionalRx: [
        {
          name: 'Glecaprevir, in glecaprevir/pibrentasvir (Mavyret)',
          class: 'Pan-genotypic NS3/4A protease inhibitor with an NS5A inhibitor',
          howItCompares:
            'Covers all six genotypes rather than two, needs no baseline resistance testing, and treats most previously untreated patients in 8 weeks. Equally usable on dialysis and carries the same Child-Pugh B and C contraindication.',
          typicalCost:
            'US$152.92 per tablet, median across the three listed products at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: six genotypes, 8 weeks, no pre-treatment resistance test. Cons: three tablets daily rather than one.',
        },
        {
          name: 'Sofosbuvir/velpatasvir (Epclusa)',
          class: 'Pan-genotypic combination containing no protease inhibitor',
          howItCompares:
            'The option for patients this regimen is contraindicated in — decompensated cirrhosis — precisely because it contains no protease inhibitor. Its nucleotide component is renally cleared, which is the mirror-image constraint.',
          typicalCost:
            'US$866.40 per tablet, median across the two listed products at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: usable in Child-Pugh B and C. Cons: renally cleared metabolite; 12 weeks.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Ask for your Child-Pugh class, not just whether you have cirrhosis',
          action:
            'If you have cirrhosis, ask whether it is class A, B or C, and whether you have ever had ascites, jaundice or confusion from the liver.',
          patientImpact:
            'This regimen is contraindicated in Child-Pugh B and C and in any history of hepatic decompensation. In non-infected Child-Pugh C subjects, grazoprevir exposure was twelve times higher than normal.',
          clinicalPrecaution:
            'A past episode of decompensation counts even if the liver has since improved. Postmarketing cases of hepatic decompensation and failure have been reported in patients with advanced liver disease.',
        },
        {
          name: 'Bring the complete medicine list, including HIV and tuberculosis drugs',
          action:
            'Name any efavirenz, rifampin, atazanavir, ciclosporin or St John’s wort specifically.',
          patientImpact:
            'Drugs that inhibit the OATP1B1/3 liver uptake transporter push grazoprevir concentrations up; strong CYP3A inducers strip it out. Both are outright contraindications rather than cautions, and efavirenz is named separately.',
          clinicalPrecaution:
            'Grazoprevir is actively transported into the liver by OATP1B1/3, so an interaction at that transporter changes exposure far more than a plasma-protein interaction would.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CC(C)(C)[C@H]1C(=O)N2C[C@@H](C[C@H]2C(=O)N[C@@]3(C[C@H]3C=C)C(=O)NS(=O)(=O)C4CC4)OC5=NC6=C(C=CC(=C6)OC)N=C5CCCCC[C@@H]7C[C@H]7OC(=O)N1',
      chemicalFormula: 'C38H50N6O9S',
      molecularWeight: '766.90 g/mol',
      targetReceptorAffinity:
        'Inhibits the recombinant NS3/4A protease of genotypes 1a, 1b and 4a with IC50 values of 7 pM, 4 pM and 62 pM in a biochemical assay. In full-length replicons the same drug reads 0.4 nM, 0.5 nM and 0.3 nM — roughly fifty- to hundredfold weaker in cells than against isolated enzyme, which is what membrane permeability, protein binding and transporter handling cost in practice. Q80K, the genotype 1a polymorphism that reduced simeprevir enough to require pre-treatment testing, has no impact on grazoprevir in cell culture.',
      structureSource: {
        label:
          'PubChem CID 44603531 (grazoprevir) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/44603531',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'gzr-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity of the quinoxaline ether and the cyclopropyl acylsulfonamide warhead',
          description:
            'Confirm identity and stereochemistry of the methoxyquinoxaline that occupies the P2 position, the vinyl-cyclopropyl aminoacid bearing the acylsulfonamide, and the tert-butyl glycine cap before macrocyclisation. Grazoprevir is a P2-to-P4 macrocycle rather than the P1-to-P3 type used by earlier protease inhibitors, and that architectural difference is the reason Q80K does not affect it — verifying the quinoxaline linkage is therefore verifying the drug’s defining property.',
          reagentsAndBuffer:
            'Chiral HPLC against single-enantiomer standards, 1H and 13C NMR in CDCl3, cyclopropanesulfonamide and 3-methoxyquinoxaline reference standards, Karl Fischer titration',
        },
        {
          id: 'gzr-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Ring-closing metathesis to the P2-P4 macrocycle, then warhead installation',
          description:
            'Close the eighteen-membered ring by ruthenium-catalysed alkene metathesis between the quinoxaline-bearing proline ether and the distal cyclopropane, hydrogenate the resulting alkene, and install the acylsulfonamide. Macrocyclisation at high dilution is the yield-determining step and the ring geometry it fixes is what pre-organises the molecule into the shape the protease groove accepts.',
          dependsOnStepId: 'gzr-w1',
          reagentsAndBuffer:
            'Second-generation Grubbs or Hoveyda-Grubbs ruthenium catalyst, high dilution in toluene or dichloroethane under nitrogen, heterogeneous hydrogenation catalyst, N,N-carbonyldiimidazole with DBU for acylsulfonamide formation',
        },
        {
          id: 'gzr-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Ruthenium scavenging and separation of the ring-contracted by-products',
          description:
            'Strip residual ruthenium to the elemental impurity limit and resolve the macrocycle from dimeric and ring-contracted metathesis by-products. Metathesis catalysts are coloured, tenacious and toxicologically controlled, so scavenging is a release specification rather than a cosmetic step.',
          dependsOnStepId: 'gzr-w2',
          reagentsAndBuffer:
            'Isocyanide or thiourea-functionalised silica scavenger, activated charcoal, preparative reversed-phase chromatography, ICP-MS for residual ruthenium, crystallisation from an alcohol-water system',
        },
        {
          id: 'gzr-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Replicon dosing with the OATP transporter arm run in parallel',
          description:
            'Dose Huh-7 replicons alongside an OATP1B1/3-transfected uptake assay. Grazoprevir distributes predominantly to the liver by active transport through OATP1B1/3, so cellular potency in a line lacking those transporters underestimates hepatic exposure — and the same transporter dependence is why OATP inhibitors are an outright contraindication rather than a dose adjustment.',
          dependsOnStepId: 'gzr-w3',
          reagentsAndBuffer:
            'Huh-7 replicon panel carrying NS3/4A from genotypes 1a, 1b and 4, OATP1B1- and OATP1B3-transfected HEK293 uptake assay with rifampicin as a reference inhibitor, DMEM with 10% fetal bovine serum and G418, LC-MS/MS for intracellular drug',
        },
        {
          id: 'gzr-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'The D168 and A156 panel, with Q80K run as the negative control',
          description:
            'Measure inhibition against site-directed NS3 mutants and report fold-change by genotype. This panel contains both halves of the drug’s story: Q80K and Q80R have no effect, which is the design goal met, while D168A and D168V cost 110- to 320-fold in genotype 4 and A156 substitutions up to 375-fold in genotype 1b. Reporting the picomolar enzyme figure without this panel would state the best case and omit the failure mode.',
          dependsOnStepId: 'gzr-w4',
          reagentsAndBuffer:
            'Recombinant NS3/4A enzyme from genotypes 1a, 1b and 4a with a FRET peptide substrate, site-directed replicon mutants Y56H/F, F43S, R155K, A156G/S/T/V, D168A/E/G/N/S/V/Y, V36L/M, Q80K/R and V107I, next-generation sequencing for treatment-emergent substitutions',
        },
      ],
    },
    keyAudits: [
      {
        id: 'gzr-a1',
        category: 'measured',
        title: 'Q80K, which forced testing before simeprevir, has no effect here',
        laymanSummary:
          'A common natural variant in genotype 1a hepatitis C had crippled the previous generation of protease inhibitors badly enough that patients had to be screened for it. Grazoprevir is unaffected by it, and that was the point of the molecule.',
        technicalDetails:
          'In genotype 1a replicons, single NS3 substitutions V36L/M, Q80K/R and V107I had no impact on grazoprevir antiviral activity in cell culture, and in the clinical dataset the NS3 Q80K polymorphism did not affect treatment response in genotype 1a-infected subjects. The structural reason is architectural: grazoprevir is a P2-to-P4 macrocycle, whereas simeprevir and the first-generation inhibitors span P1 to P3 and make contact near position 80. The advance is real, measured, and specific — it does not extend to the positions that do matter, where single substitutions Y56H, R155K, A156G/T/V and D168A/E/G/N/S/V/Y cost 2- to 81-fold in genotype 1a, up to 375-fold in genotype 1b at A156, and 110- to 320-fold in genotype 4 at D168.',
        evidenceSource:
          'ZEPATIER United States prescribing information, Microbiology 12.4, resistance in cell culture and in clinical studies (NDA 208261)',
        measuredMetric:
          'Fold-change in grazoprevir activity by NS3 substitution: none at Q80K/R, 110- to 320-fold at genotype 4 D168A/V',
        auditFlag: 'verified',
      },
      {
        id: 'gzr-a2',
        category: 'measured',
        title: 'C-EDGE: 95% cured, with serious adverse events no more common than on placebo',
        laymanSummary:
          'A blinded, placebo-controlled trial of 421 previously untreated people found 95% of those treated were cured, including 97% of those with cirrhosis, and serious side effects at 2.8% against 2.9% on placebo.',
        technicalDetails:
          'C-EDGE TREATMENT-NAIVE randomised 421 treatment-naive adults with genotype 1, 4 or 6 infection 3:1 to immediate or deferred fixed-dose grazoprevir 100 mg with elbasvir 50 mg for 12 weeks, at 60 centres. SVR12 in the immediate-treatment group was 95% (299/316; 95% CI 92 to 97), with 92% (144/157) in genotype 1a, 97% (68/70) with cirrhosis and 80% (8/10) in genotype 6. Serious adverse events occurred in 9 patients (2.8%) on active treatment and 3 (2.9%) on placebo, difference under 0.05 percentage points (95% CI -5.4 to 3.1), none considered drug related. The commonest events were headache (17%), fatigue (16%) and nausea (9%).',
        evidenceSource:
          'Zeuzem S et al., Ann Intern Med 2015;163:1-13 (C-EDGE TREATMENT-NAIVE, NCT02105467)',
        doi: '10.7326/M15-0785',
        measuredMetric:
          'Sustained virologic response at 12 weeks and serious adverse events, against a concurrent blinded placebo arm',
        auditFlag: 'verified',
      },
      {
        id: 'gzr-a3',
        category: 'measured',
        title:
          'C-EDGE CO-INFECTION: 96% of 218 patients with HIV, and every cirrhotic patient cured',
        laymanSummary:
          'In 218 people living with HIV and hepatitis C, 210 were cured. All 35 who had cirrhosis were cured. Nobody stopped treatment because of a side effect.',
        technicalDetails:
          'C-EDGE CO-INFECTION was a non-randomised, open-label, single-arm phase 3 study in 218 treatment-naive patients with genotype 1, 4 or 6 hepatitis C and HIV co-infection, either antiretroviral-naive or stable on therapy for at least 8 weeks, at 37 centres in nine countries. SVR12 was 96% (210/218; 95% CI 92.9 to 98.4). One failure was for a non-virological reason and seven non-cirrhotic patients relapsed, two of which were subsequently confirmed as reinfections rather than treatment failures. All 35 patients with cirrhosis achieved SVR12. Commonest events were fatigue (13%), headache (12%) and nausea (9%), with no discontinuations for adverse events. Two patients on antiretroviral therapy had transient HIV viraemia.',
        evidenceSource:
          'Rockstroh JK et al., Lancet HIV 2015;2:e319-e327 (C-EDGE CO-INFECTION, NCT02105662)',
        doi: '10.1016/S2352-3018(15)00114-9',
        measuredMetric: 'Sustained virologic response at 12 weeks in HIV/HCV co-infection',
        auditFlag: 'verified',
      },
      {
        id: 'gzr-a4',
        category: 'failed',
        title: 'Twelvefold higher exposure in severe liver impairment, hence a contraindication',
        laymanSummary:
          'The drug is actively pumped into the liver and leaves in bile. When the liver fails, it accumulates: in people with the most severe liver impairment, blood levels were twelve times higher than normal. The label forbids its use there.',
        technicalDetails:
          'ZEPATIER is contraindicated in moderate hepatic impairment (Child-Pugh B) for lack of clinical safety and efficacy experience, and in severe hepatic impairment (Child-Pugh C) because of a twelvefold increase in grazoprevir exposure measured in non-HCV-infected Child-Pugh C subjects. It is also contraindicated in any patient with a history of hepatic decompensation, and postmarketing cases of hepatic decompensation and failure have been reported in patients with advanced liver disease. The mechanism is the drug’s own design: grazoprevir distributes predominantly to the liver by active transport through OATP1B1/3, more than 90% of a radiolabelled dose is recovered in faeces and less than 1% in urine, so hepatic clearance is the only meaningful exit. The same property that makes it usable in kidney failure makes it unusable in liver failure.',
        evidenceSource:
          'ZEPATIER United States prescribing information, Contraindications 4, Use in Specific Populations 8.9 and Clinical Pharmacology 12.3 (NDA 208261)',
        measuredMetric:
          'Twelvefold increase in grazoprevir exposure in Child-Pugh C subjects; >90% faecal and <1% urinary excretion',
        auditFlag: 'caution',
      },
      {
        id: 'gzr-a5',
        category: 'failed',
        title: 'Late liver enzyme rises in about one in a hundred, and unevenly distributed',
        laymanSummary:
          'About 1% of people had liver enzymes rise from normal to more than five times the upper limit, usually after week 8. The rate was double that in women, in Asian patients and in people over 65.',
        technicalDetails:
          'During clinical trials with or without ribavirin, 1% of subjects experienced elevations of ALT from normal levels to greater than five times the upper limit of normal, generally at or after treatment week 8. The elevations were typically asymptomatic and most resolved with ongoing or completed therapy. Higher rates occurred in three subpopulations: female sex 2% (10/608), Asian race 2% (4/164), and age 65 or older 2% (3/177). The label therefore requires hepatic laboratory testing before therapy, at treatment week 8, and again at week 12 for patients on the 16-week regimen, with discontinuation if ALT stays above ten times the upper limit or if elevation is accompanied by signs of liver inflammation or rising conjugated bilirubin. The subgroup denominators are small — 4 of 164 and 3 of 177 — so the twofold differences are unstable estimates rather than established risk factors.',
        evidenceSource:
          'ZEPATIER United States prescribing information, Warnings and Precautions 5.2 (NDA 208261)',
        measuredMetric:
          'ALT rise from normal to more than 5x upper limit of normal in 1% overall; 2% in women, Asian patients and those aged 65 or older',
        auditFlag: 'caution',
      },
      {
        id: 'gzr-a6',
        category: 'inferred',
        title: 'A picomolar enzyme number and a nanomolar cell number, both on the same label',
        laymanSummary:
          'Against the isolated viral enzyme, grazoprevir works at seven trillionths of a gram per litre. Inside a living cell it needs about fifty to a hundred times more. Both figures are printed in the label, and only one of them describes what happens in a patient.',
        technicalDetails:
          'In the biochemical assay grazoprevir inhibited recombinant NS3/4A protease from genotypes 1a, 1b and 4a with IC50 values of 7 pM, 4 pM and 62 pM. In full-length replicon assays the EC50 values for the same genotypes were 0.4 nM, 0.5 nM and 0.3 nM. The gap is not an error and it is not unusual — it is what membrane permeability, plasma-protein binding, active transport and intracellular sequestration cost between a purified enzyme and a living cell. It matters because the picomolar figure is the one most likely to be quoted, and because a comparison between two drugs is meaningless unless both numbers come from the same kind of assay. Elbasvir, quoted at 4 pM in this batch, is a replicon number; grazoprevir at 7 pM is an enzyme number.',
        evidenceSource:
          'ZEPATIER United States prescribing information, Microbiology 12.4, mechanism of action and antiviral activity (NDA 208261)',
        inferredClaim:
          'That a picomolar biochemical IC50 describes potency in a patient — the same drug reads roughly a hundredfold weaker in a cell, and the label reports both',
        auditFlag: 'caution',
      },
      {
        id: 'gzr-a7',
        category: 'failed',
        title: 'Three categories of outright contraindicated co-medication',
        laymanSummary:
          'Some medicines cannot be taken with this one at all: drugs that push its levels up through the liver uptake pump, drugs that strip it out, and efavirenz by name.',
        technicalDetails:
          'The regimen is contraindicated with inhibitors of the organic anion transporting polypeptides OATP1B1/3 that are known or expected to significantly increase grazoprevir concentrations, with strong inducers of CYP3A, and with efavirenz. The transporter dependence explains the shape of the list: because grazoprevir is delivered into hepatocytes by OATP1B1/3 rather than by passive diffusion, blocking that transporter raises systemic exposure of a drug whose liver toxicity is already exposure-related and whose Child-Pugh C exposure is twelvefold elevated. Both elbasvir and grazoprevir are partially eliminated by CYP3A oxidation, which is the second half of the list.',
        evidenceSource:
          'ZEPATIER United States prescribing information, Contraindications 4 and Clinical Pharmacology 12.3 (NDA 208261)',
        auditFlag: 'caution',
      },
      {
        id: 'gzr-a8',
        category: 'inferred',
        title: 'Neither co-infection nor kidney-disease efficacy was established against a control',
        laymanSummary:
          'The HIV trial had no comparison group at all. The kidney trial had a placebo group but used it only to judge safety; the cure rate was compared against a number from older interferon studies.',
        technicalDetails:
          'C-EDGE CO-INFECTION describes itself as an uncontrolled, non-randomised, open-label, single-arm study. C-SURFER describes itself as a phase 3 randomised study of safety and observational study of efficacy: the primary efficacy outcome was a non-randomised comparison of SVR12 against a historical control of 45% derived from meta-analyses of interferon-based regimens in haemodialysis patients, while the randomised immediate-against-deferred comparison served the safety endpoint. Both designs were reasonable in 2015 and both produced strong numbers — 96% and 99%. Neither number is a randomised efficacy result, and the 45% comparator comes from a different drug class, a different era and a differently selected population.',
        evidenceSource:
          'Rockstroh JK et al., Lancet HIV 2015;2:e319-e327; Roth D et al., Lancet 2015;386:1537-1545',
        doi: '10.1016/S0140-6736(15)00349-9',
        inferredClaim:
          'That the 96% and 99% figures in co-infection and kidney disease were established against concurrent controls — one trial had none, and the other used its control arm for safety only',
        auditFlag: 'contested',
      },
      {
        id: 'gzr-a9',
        category: 'inferred',
        title: 'Every endpoint is a blood test twelve weeks after the last tablet',
        laymanSummary:
          'C-EDGE, C-EDGE CO-INFECTION and C-SURFER all measured virus in blood. None counted deaths, cancers, transplants, graft failures or dialysis outcomes.',
        technicalDetails:
          'The 2017 Cochrane review of 138 randomised direct-acting antiviral trials in 25,232 participants found no usable randomised evidence on hepatitis C-related morbidity or on hepatocellular carcinoma, and mortality data from only 11 trials. C-SURFER states its own rationale as the increased risk of death and renal graft failure in this population, and then measures viral RNA at twelve weeks. C-EDGE CO-INFECTION notes that two of its seven relapses were subsequently confirmed as reinfections rather than treatment failures — a reminder that even the surrogate is measuring something slightly different from what it is read as.',
        evidenceSource: 'Jakobsen JC et al., Cochrane Database Syst Rev 2017;9:CD012143',
        doi: '10.1002/14651858.CD012143.pub3',
        inferredClaim:
          'That an undetectable blood test twelve weeks after treatment predicts fewer deaths, cancers or graft failures — plausible, and not what any of these trials measured',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'One tablet a day, after two pre-treatment tests',
        laymanDesc:
          'Everyone is tested for hepatitis B and has liver enzymes checked before the first dose, and the enzymes are checked again at week 8.',
        molecularDetail:
          'Fixed-dose combination of 100 mg grazoprevir with 50 mg elbasvir, one tablet once daily with or without food. Apparent terminal half-life is approximately 31 hours for grazoprevir and 24 hours for elbasvir in infected subjects.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Actively pumped into liver cells',
        laymanDesc:
          'Grazoprevir does not simply diffuse into the liver. A transporter on the liver-cell surface pulls it in, which concentrates it exactly where the virus is.',
        molecularDetail:
          'Distributes predominantly to the liver, facilitated by active transport through the OATP1B1/3 uptake transporter. More than 90% of a radiolabelled dose is recovered in faeces and less than 1% in urine. Apparent volume of distribution approximately 1,250 L.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title:
          'It jams the viral scissors, and unlike its predecessors Q80K does not save the virus',
        laymanDesc:
          'The virus makes all its proteins as one strip that must be cut apart. Grazoprevir sits in the cutting groove. The common natural variant that defeated the earlier drugs of this class does not affect it.',
        molecularDetail:
          'A P2-to-P4 macrocyclic acylsulfonamide binding the NS3/4A active site, with biochemical IC50 of 7 pM (genotype 1a), 4 pM (1b) and 62 pM (4a), and replicon EC50 of 0.4, 0.5 and 0.3 nM. V36L/M, Q80K/R and V107I have no effect in cell culture.',
        iconName: 'Scissors',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The polyprotein is never cut, and the cell’s alarm comes back on',
        laymanDesc:
          'None of the individual viral proteins are released, so the copying machinery is never assembled. Blocking the same enzyme also restores part of the cell’s own antiviral alarm, which the virus normally disables.',
        molecularDetail:
          'NS3/4A cleaves the polyprotein at the NS3-NS4A, NS4A-NS4B, NS4B-NS5A and NS5A-NS5B junctions, and also cleaves the host adaptor MAVS, blunting RIG-I-mediated interferon induction. Protease inhibition removes both the maturation step and the virus’s suppression of innate sensing.',
        iconName: 'Ban',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Cured in twelve weeks, including with HIV and on dialysis',
        laymanDesc:
          'Ninety-five per cent of previously untreated patients, ninety-six per cent of those also living with HIV, and ninety-nine per cent of those with failing kidneys.',
        molecularDetail:
          'SVR12 95% (299/316) in C-EDGE TREATMENT-NAIVE, 96% (210/218) in C-EDGE CO-INFECTION with all 35 cirrhotic patients cured, and 99% (115/116) in C-SURFER in stage 4 or 5 chronic kidney disease.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'The limit is the liver, and it is the same property that helps the kidneys',
        laymanDesc:
          'Because the drug leaves only through the liver, a badly damaged liver lets it build up — twelvefold in the most severe cases. It is contraindicated there, and it is precisely that route of exit which makes it safe in kidney failure.',
        molecularDetail:
          'Contraindicated in Child-Pugh B and C and in any history of hepatic decompensation, with a twelvefold exposure increase measured in Child-Pugh C subjects. Also contraindicated with OATP1B1/3 inhibitors, strong CYP3A inducers and efavirenz. ALT rose above five times the upper limit of normal in 1% of subjects, generally at or after week 8.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'C-EDGE TREATMENT-NAIVE (NCT02105467)',
        phase:
          'Phase 3, randomised 3:1 to immediate or deferred therapy, blinded, placebo-controlled',
        sampleSize: 421,
        primaryEndpoint:
          'Unquantifiable HCV RNA 12 weeks after the end of treatment in the immediate-treatment group',
        endpointMet: true,
        statisticalPValue:
          '95% (299/316; 95% CI 92 to 97); serious adverse events 2.8% on active treatment against 2.9% on placebo',
        unreportedAdverseSignals:
          'The authors list the absence of an active comparator and the small number of genotype 4 and 6 patients as limitations; genotype 6 SVR12 was 80% (8/10).',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'C-EDGE CO-INFECTION (NCT02105662)',
        phase: 'Phase 3, uncontrolled, non-randomised, open-label, single-arm',
        sampleSize: 218,
        primaryEndpoint:
          'HCV RNA below 15 IU/mL 12 weeks after the end of therapy in HIV/HCV co-infection',
        endpointMet: true,
        statisticalPValue:
          '96% (210/218; 95% CI 92.9 to 98.4), with all 35 cirrhotic patients cured',
        unreportedAdverseSignals:
          'Single-arm with no comparator of any kind. Two of the seven relapses were later confirmed as reinfections, so the true virologic failure count is five rather than seven. Two patients on antiretroviral therapy had transient HIV viraemia.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'C-SURFER (NCT02092350)',
        phase:
          'Phase 3, randomised for safety against deferred treatment, observational for efficacy against a historical control',
        sampleSize: 235,
        primaryEndpoint:
          'Sustained virologic response 12 weeks after treatment in genotype 1 with stage 4 or 5 chronic kidney disease',
        endpointMet: true,
        statisticalPValue:
          '99% (115/116; 95% CI 95.3 to 100.0) against a historical control of 45% from interferon-based meta-analyses',
        unreportedAdverseSignals:
          'The efficacy comparison was explicitly non-randomised; the placebo randomisation served the safety endpoint. Five patients (4%) in the deferred group discontinued for an adverse event against none in the treated group.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Biochemical IC50 of 7 pM, 4 pM and 62 pM against recombinant NS3/4A from genotypes 1a, 1b and 4a; replicon EC50 of 0.4, 0.5 and 0.3 nM',
        'Q80K and Q80R have no impact on grazoprevir activity in cell culture, and Q80K did not affect clinical response in genotype 1a',
        '95% sustained virologic response in 316 previously untreated patients, with serious adverse events at 2.8% against 2.9% on placebo',
        '96% (210/218) in HIV co-infection, including all 35 patients with cirrhosis',
        'Twelvefold increase in grazoprevir exposure in Child-Pugh C subjects; more than 90% faecal and under 1% urinary excretion',
      ],
      unsupportedInferences: [
        'That a 7 pM biochemical IC50 describes potency in a patient; the same drug reads about a hundredfold weaker in a replicon',
        'That the 96% co-infection and 99% kidney-disease results were established against concurrent controls — one study had no comparator, the other used its control arm for safety',
        'That the ALT subgroup differences in women, Asian patients and older patients are established risk factors; the denominators are 4 of 164 and 3 of 177',
        'That curing hepatitis C in advanced kidney disease reduces death or graft failure, which C-SURFER cites as its rationale and did not measure',
      ],
      whatFailedInitially: [
        'Contraindicated in Child-Pugh B and C and in any history of hepatic decompensation, with postmarketing cases of decompensation and failure in advanced liver disease',
        'ALT rose from normal to more than five times the upper limit in 1% of subjects, generally at or after week 8, requiring scheduled liver testing during treatment',
        'D168A and D168V cost 110- to 320-fold in genotype 4, and A156 substitutions up to 375-fold in genotype 1b',
        'Outright contraindicated with OATP1B1/3 inhibitors, strong CYP3A inducers and efavirenz',
        'Two genotypes out of six, and displaced for most patients by pan-genotypic regimens within eighteen months',
      ],
      realWorldOutcome: [
        'Approved January 2016 under NDA 208261, launched at US$54,600 per course against a modelled production floor of US$115',
        'The protease inhibitor that solved Q80K, which is a genuine and specific structural advance over the first generation',
        'Usable across the full range of kidney function including dialysis, because clearance is entirely hepatobiliary',
        'Now indicated down to age 12, with the same contraindications',
      ],
    },
    deliverySystem: {
      type: 'Oral fixed-dose combination tablet with elbasvir',
      description:
        'One tablet once daily, with or without food, for 12 or 16 weeks depending on genotype, prior treatment and the baseline NS5A resistance test in genotype 1a. Grazoprevir is not sold separately.',
      safetyProfile:
        'Boxed warning for hepatitis B virus reactivation, which has caused fulminant hepatitis, hepatic failure and death, requiring both HBsAg and anti-HBc before treatment. Contraindicated in Child-Pugh B or C hepatic impairment, in any history of hepatic decompensation, with OATP1B1/3 inhibitors, with strong CYP3A inducers and with efavirenz. Liver enzymes must be checked before therapy and at week 8, with a further check at week 12 on the 16-week regimen; about 1% of subjects developed ALT above five times the upper limit of normal, generally late in treatment and usually asymptomatic. In C-EDGE, serious adverse events were 2.8% on treatment against 2.9% on placebo, and in C-EDGE CO-INFECTION no patient discontinued for an adverse event.',
    },
    commonQuestions: [
      {
        q: 'What was the point of another protease inhibitor?',
        a: 'Q80K. Roughly a third of genotype 1a hepatitis C in some populations carries a natural change at position 80 of the NS3 protease, and that single change reduced simeprevir enough that patients had to be screened for it before treatment. Grazoprevir was built with a different ring architecture — a macrocycle spanning the P2 to P4 positions rather than P1 to P3 — which moves its contacts away from position 80. The label confirms the result twice over: Q80K and Q80R have no impact in cell culture, and Q80K did not affect treatment response in genotype 1a patients in the clinical programme. It is a specific structural fix to a specific problem, and it does not make the drug invulnerable: changes at positions 156 and 168 still cost it a hundredfold or more.',
      },
      {
        q: 'Why can I take this on dialysis but not with a failing liver?',
        a: 'Both facts come from the same property. Grazoprevir is actively pumped into liver cells by a transporter called OATP1B1/3 and leaves the body in bile: more than 90% of a dose is recovered in stool and less than 1% in urine. Kidneys are therefore almost irrelevant to clearing it, which is why C-SURFER could treat 116 people with stage 4 or 5 kidney disease and cure 115. The liver is the only exit, so when the liver fails the drug accumulates — twelvefold in people with severe impairment. That is why it is contraindicated in Child-Pugh B and C and in anyone who has ever had a liver decompensation, even if the liver has since improved.',
        auditNote:
          'The same sentence in the pharmacology section explains both the indication in kidney disease and the contraindication in liver disease. That is unusually tidy and worth noticing.',
      },
      {
        q: 'Why do my liver enzymes need checking during treatment?',
        a: 'Because about one person in a hundred develops a late rise. In the trials, 1% of subjects had ALT climb from a normal starting value to more than five times the upper limit of normal, and it usually happened at or after week 8 rather than early. The elevations were typically asymptomatic and most settled either during treatment or after it ended, but a small number needed the drug stopped. The label therefore schedules liver testing before treatment and at week 8, with another check at week 12 for anyone on the longer course, and gives explicit stopping rules. Rates were reported as 2% in women, in Asian patients and in people aged 65 or older, though those figures rest on four and three patients respectively.',
      },
      {
        q: 'How can the same drug be 7 picomolar and 0.4 nanomolar?',
        a: 'Because those are two different experiments, and both are on the label. Seven picomolar is the concentration that halves the activity of purified NS3/4A enzyme in a test tube. Zero point four nanomolar — about sixty times higher — is what it takes to halve viral replication inside a living cell. The difference is everything that stands between a drug molecule and its target in a real cell: crossing a membrane, being bound by plasma proteins, being pumped in or out by transporters. Neither number is wrong. The one worth quoting depends on the question, and a comparison between two drugs is only meaningful if both figures come from the same kind of assay.',
      },
      {
        q: 'Is this regimen still a first choice?',
        a: 'For most patients, no. It covers genotypes 1 and 4 out of six, and in genotype 1a it needs a resistance test before treatment that decides the length of the course. Within eighteen months of its approval, two pan-genotypic regimens were available that treat all six genotypes without that test, one of them in eight weeks. Where it still competes is advanced kidney disease and HIV co-infection, and both of those results are strong: 99% of 116 patients on or near dialysis, and 96% of 218 patients with HIV including every one of the 35 with cirrhosis. The pan-genotypic alternatives have since produced comparable numbers in the same populations.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Zeuzem S et al. Grazoprevir-elbasvir combination therapy for treatment-naive cirrhotic and noncirrhotic patients with chronic hepatitis C virus genotype 1, 4, or 6 infection: a randomized trial. Ann Intern Med 2015;163:1-13',
        identifier: '10.7326/M15-0785',
        kind: 'doi',
      },
      {
        label:
          'Rockstroh JK et al. Efficacy and safety of grazoprevir (MK-5172) and elbasvir (MK-8742) in patients with hepatitis C virus and HIV co-infection (C-EDGE CO-INFECTION). Lancet HIV 2015;2:e319-e327',
        identifier: '10.1016/S2352-3018(15)00114-9',
        kind: 'doi',
      },
      {
        label:
          'Roth D et al. Grazoprevir plus elbasvir in treatment-naive and treatment-experienced patients with hepatitis C virus genotype 1 infection and stage 4-5 chronic kidney disease (C-SURFER). Lancet 2015;386:1537-1545',
        identifier: '10.1016/S0140-6736(15)00349-9',
        kind: 'doi',
      },
      {
        label:
          'van de Ven N et al. Minimum target prices for production of direct-acting antivirals and associated diagnostics to combat hepatitis C virus. Hepatology 2015;61:1174-1182',
        identifier: '10.1002/hep.27641',
        kind: 'doi',
      },
      {
        label:
          'Rosenthal ES, Graham CS. Price and affordability of direct-acting antiviral regimens for hepatitis C virus in the United States. Infect Agent Cancer 2016;11:24',
        identifier: '10.1186/s13027-016-0071-z',
        kind: 'doi',
      },
      {
        label:
          'Jakobsen JC et al. Direct-acting antivirals for chronic hepatitis C. Cochrane Database Syst Rev 2017;9:CD012143',
        identifier: '10.1002/14651858.CD012143.pub3',
        kind: 'doi',
      },
      {
        label: 'C-EDGE TREATMENT-NAIVE: genotype 1, 4 or 6, placebo-controlled',
        identifier: 'NCT02105467',
        kind: 'nct',
      },
      {
        label: 'C-EDGE CO-INFECTION: HIV/HCV co-infection, single-arm',
        identifier: 'NCT02105662',
        kind: 'nct',
      },
      {
        label: 'C-SURFER: genotype 1 with stage 4 or 5 chronic kidney disease',
        identifier: 'NCT02092350',
        kind: 'nct',
      },
      {
        label:
          'Drugs@FDA: ZEPATIER (elbasvir and grazoprevir), NDA 208261, Merck Sharp & Dohme — original approval 28 January 2016',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=208261',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 44603531 — grazoprevir structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/44603531',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 11. Daclatasvir — the first NS5A inhibitor, and the origin of the class that every other
  //     hepatitis C combination on this site is built around. Discontinued in the United States by
  //     the company that discovered it.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'daclatasvir',
    name: 'Daclatasvir',
    tradeName: 'Daklinza',
    sponsor: 'Bristol-Myers Squibb',
    targetGene: 'HCV NS5A — a hepatitis C viral gene, not a human one',
    targetProtein:
      'Hepatitis C virus NS5A phosphoprotein — the first protein with no known enzymatic function ever validated as a clinical antiviral target',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2015,
    indication:
      'Chronic hepatitis C virus genotype 1 or 3 infection in adults, in combination with sofosbuvir, with or without ribavirin',
    patientFriendlyIndication: 'Long-standing hepatitis C infection, genotype 1 or 3',
    anatomicalSite:
      'Hepatocyte cytoplasm — the membranous web of remodelled endoplasmic reticulum where NS5A holds the replication complex together',
    conditionContext: {
      conditionExplainer:
        'Hepatitis C folds the liver cell’s own membranes into a private workshop and copies itself there. NS5A is the protein that organises that workshop. It cuts nothing and copies nothing, which is exactly why nobody expected it to be druggable.',
      whyItMatters:
        'Daclatasvir is the molecule that proved an entire class was possible. Every other hepatitis C combination on this site — ledipasvir, velpatasvir, pibrentasvir, elbasvir — contains a descendant of it. The proof came from a single 100 mg dose that cut viral load a thousandfold in a day.',
      whoTakesThis:
        'Adults with genotype 1 or 3, always with sofosbuvir. It was never sold as a single-drug treatment and is no longer marketed in the United States.',
      clinicalGoals:
        'Sustained virologic response at 12 weeks. In genotype 3, the population it was chiefly approved for, cirrhosis made a very large difference to whether that was reached.',
    },
    oneSentenceVerdict:
      'The first-in-class NS5A inhibitor, found by chemical genetics against a protein with no known enzymatic function, whose single 100 mg dose produced a 3.3 log10 fall in viral load within 24 hours in phase 1 and which with sofosbuvir cured 96% of 109 genotype 3 patients without cirrhosis in ALLY-3 — but only 63% of the 32 with cirrhosis, and which was priced at US$147,000 per 12-week course with sofosbuvir against a modelled production cost of US$122 before being discontinued in the United States.',
    laymanHowItWorks:
      'Hepatitis C cannot copy itself out in the open. It first folds the liver cell’s internal membranes into a sealed workshop, and one viral protein, NS5A, is what holds that workshop together and loads finished copies into new virus particles. Daclatasvir sticks to NS5A in vanishingly small amounts and stops both jobs. It was the first drug to prove this could be done at all, because NS5A has no chemistry of its own to interfere with — there is no pocket, no reaction, nothing to block in the usual sense. It is always given with sofosbuvir, which attacks the copying enzyme, because one drug alone lets the virus escape.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 74,
    pricing: {
      synthesisCostPerDose:
        'US$122 per 12-week course of daclatasvir with sofosbuvir, projected minimum cost of large-scale generic production (van de Ven et al., Hepatology 2015). An earlier analysis costed daclatasvir alone at US$10 to US$30 per 12-week course and ranked it the second least complex to synthesise of the five hepatitis C drugs assessed (Hill et al., Clin Infect Dis 2014)',
      retailPricePerDoseOrYear:
        'US$147,000 per 12-week course of daclatasvir with sofosbuvir at United States wholesale acquisition cost, of which US$84,000 is the sofosbuvir component',
      markupEstimate:
        'Roughly 1,200-fold the projected minimum cost of production for the same 12-week two-drug course',
      openPatentNotes:
        'The generic price for the same combination fell far faster than the branded one: an analysis published in 2016 tracked generic sofosbuvir and daclatasvir prices in low- and middle-income countries collapsing towards the modelled floor within about two years of launch, while the United States wholesale figure did not move. Daklinza was subsequently discontinued in the United States; the molecule remains widely available as a generic elsewhere and is on the WHO Model List of Essential Medicines.',
      synthesisComplexity: 'Moderate',
      costSource: {
        label:
          'van de Ven N, Fortunak J, Simmons B, Ford N, Cooke GS, Khoo S, Hill A. Minimum target prices for production of direct-acting antivirals and associated diagnostics to combat hepatitis C virus. Hepatology 2015;61:1174-1182',
        identifier: '10.1002/hep.27641',
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
        'Every alternative is a later NS5A inhibitor that daclatasvir made possible. The pan-genotypic combinations cover more genotypes, need no separate second tablet, and were specifically designed to hold up in the cirrhotic genotype 3 patients where this regimen fell to 63%.',
      conventionalRx: [
        {
          name: 'Velpatasvir, in sofosbuvir/velpatasvir (Epclusa)',
          class: 'Pan-genotypic NS5A inhibitor with the same NS5B nucleotide partner',
          howItCompares:
            'The direct successor: the same drug pairing in one tablet, covering all six genotypes rather than two, and holding up far better in cirrhotic genotype 3. It is also the only pan-genotypic option usable in decompensated cirrhosis.',
          typicalCost:
            'US$866.40 per tablet, median across the two listed products at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: one tablet, six genotypes, better in cirrhosis. Cons: renally cleared nucleotide metabolite.',
        },
        {
          name: 'Pibrentasvir, in glecaprevir/pibrentasvir (Mavyret)',
          class: 'Pan-genotypic NS5A inhibitor with a protease inhibitor',
          howItCompares:
            'Eight weeks rather than twelve for most previously untreated patients, all six genotypes, and usable on dialysis. Genotype 3 remains its weakest genotype too — 20 of its 24 registrational failures were genotype 3.',
          typicalCost:
            'US$152.92 per tablet, median across the three listed products at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: shortest course available. Cons: contraindicated in Child-Pugh B or C liver disease.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Say if you take amiodarone, and do not stop it on your own',
          action:
            'Name amiodarone specifically before the first dose, and ask what cardiac monitoring is planned for the first 48 hours.',
          patientImpact:
            'Extreme bradycardia has been reported within two hours of the first dose of sofosbuvir with daclatasvir in patients on amiodarone, including one cardiac asystole 30 minutes after the first dose. A published rechallenge reproduced the effect, and it did not recur once amiodarone had been stopped for eight weeks.',
          clinicalPrecaution:
            'Amiodarone has a half-life measured in weeks, so stopping it shortly before treatment does not remove the risk. This is a decision for a cardiologist and a hepatologist together, not a self-adjustment.',
        },
        {
          name: 'Ask whether you have cirrhosis before agreeing to twelve weeks',
          action:
            'If you have genotype 3, ask specifically whether cirrhosis has been established and by what test.',
          patientImpact:
            'In ALLY-3, patients without cirrhosis reached 96% cure and patients with cirrhosis 63% on the identical 12-week regimen. That is the single largest predictor of outcome in the trial.',
          clinicalPrecaution:
            'The trial reported the cirrhosis subgroup separately for exactly this reason, and the follow-up study was designed around it.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CC(C)[C@@H](C(=O)N1CCC[C@H]1C2=NC=C(N2)C3=CC=C(C=C3)C4=CC=C(C=C4)C5=CN=C(N5)[C@@H]6CCCN6C(=O)[C@H](C(C)C)NC(=O)OC)NC(=O)OC.Cl.Cl',
      chemicalFormula: 'C40H52Cl2N8O6',
      molecularWeight: '811.80 g/mol',
      targetReceptorAffinity:
        'Picomolar half-maximal effective concentrations against replicons expressing a broad range of hepatitis C genotypes and against the JFH-1 genotype 2a infectious virus in cell culture, as reported in the discovery paper. Uniquely among this batch, the potency claim was confirmed in humans before the molecule had a name: a single 100 mg dose produced a mean 3.3 log10 reduction in viral load at 24 hours in chronically infected patients.',
      structureSource: {
        label:
          'PubChem CID 25154713 (daclatasvir dihydrochloride) — canonical SMILES, molecular formula and weight; free base is CID 25154714, C40H50N8O6, 738.9 g/mol',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/25154713',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'dcv-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity of the biphenyl core and the two proline-valine arms, and the salt count',
          description:
            'Confirm the symmetrical 4,4-biphenyl-bis-imidazole core, the stereochemistry of both proline and valine centres, and the stoichiometry of the dihydrochloride salt. Daclatasvir is genuinely C2-symmetric, which simplifies synthesis and complicates analysis: a half-molecule impurity and a mono-arm intermediate share most of the spectroscopic signature of the product.',
          reagentsAndBuffer:
            'Chiral HPLC against single-enantiomer standards, 1H and 13C NMR in DMSO-d6, ion chromatography or argentometric titration for chloride stoichiometry, methyl N-methoxycarbonyl-valine reference standard, Karl Fischer titration',
        },
        {
          id: 'dcv-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Double imidazole formation on the biphenyl, then symmetrical capping',
          description:
            'Build both imidazole rings onto the 4,4-biphenyl core from a bis-bromoketone and an N-Boc-proline carboxylate, deprotect, and cap both prolines with the same methoxycarbonyl-valine unit in a single amide coupling. The symmetry is the reason the earlier cost analysis ranked daclatasvir as one of the simplest hepatitis C antivirals to make and projected US$10 to US$30 per 12-week course.',
          dependsOnStepId: 'dcv-w1',
          reagentsAndBuffer:
            '4,4-bis(bromoacetyl)biphenyl, N-Boc-L-proline with a hindered base for the ester displacement, ammonium acetate in xylene or toluene for imidazole cyclisation, HCl or TFA for Boc removal, HATU or a mixed anhydride with N-methoxycarbonyl-L-valine, then HCl in an alcohol for salt formation',
        },
        {
          id: 'dcv-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallise the dihydrochloride and reject the mono-capped intermediate',
          description:
            'Crystallise the dihydrochloride salt and resolve it from the mono-capped and mono-deprotected intermediates and from any epimer. A single-arm impurity has half the potency and none of the resistance profile, and on reversed phase it elutes close enough to the product that crystallisation rather than chromatography is the practical control.',
          dependsOnStepId: 'dcv-w2',
          reagentsAndBuffer:
            'Ethanol or isopropanol-water crystallisation with HCl, activated charcoal treatment, preparative reversed-phase chromatography for the reference impurity standards, chiral stationary phase for diastereomeric purity',
        },
        {
          id: 'dcv-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Replicon panel and the JFH-1 infectious virus system in parallel',
          description:
            'Dose subgenomic replicons across genotypes and, separately, the JFH-1 genotype 2a infectious cell-culture system. Running both matters for an NS5A inhibitor specifically: replicons report replication only, while JFH-1 produces infectious particles, so the assembly half of NS5A’s job is invisible in a replicon and measurable in JFH-1. Daclatasvir was characterised in both in the discovery paper.',
          dependsOnStepId: 'dcv-w3',
          reagentsAndBuffer:
            'Huh-7 and Huh-7.5 subgenomic replicon panel across genotypes, JFH-1 genotype 2a infectious virus system, low-binding dilution plates for picomolar work, luciferase and focus-forming unit readouts, DMEM with 10% fetal bovine serum',
        },
        {
          id: 'dcv-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Map the resistance positions, then check they match what appears in patients',
          description:
            'Select resistant replicons, identify the substituted positions, and compare them against sequences from treated patients. This is the step that made the discovery paper unusual: the major variants seen in patients 24 and 144 hours after a single dose carried substitutions at the same amino acid positions the replicon system had already identified. A resistance map that predicts the clinic before the clinic has happened is the strongest available evidence that the assay is measuring the right thing.',
          dependsOnStepId: 'dcv-w4',
          reagentsAndBuffer:
            'Serial passage under drug selection, site-directed NS5A mutants at positions 28, 30, 31, 58 and 93 in genotype 1a, 1b and 3a backbones, population and clonal sequencing of patient isolates at baseline, 24 h and 144 h, matched wild-type controls',
        },
      ],
    },
    keyAudits: [
      {
        id: 'dcv-a1',
        category: 'measured',
        title: 'One 100 mg dose, a thousandfold fall in virus, and a whole drug class validated',
        laymanSummary:
          'A single tablet given to patients in a phase 1 study cut the amount of virus in their blood by a factor of about two thousand within 24 hours. Nobody had shown that a protein with no chemical activity of its own could be a drug target until then.',
        technicalDetails:
          'The discovery paper reports BMS-790052 as a small-molecule inhibitor of NS5A with picomolar EC50 values against replicons across a broad range of genotypes and against the JFH-1 genotype 2a infectious virus in cell culture. In a phase 1 trial in chronically infected patients, a single 100 mg dose produced a mean 3.3 log10 reduction in viral load at 24 hours, sustained for a further 120 hours in two patients with genotype 1b. Genotypic analysis of samples at baseline, 24 and 144 hours showed the major variants carried substitutions at the same amino acid positions the replicon system had already identified. The authors describe this as the first clinical validation of an NS5A inhibitor — a protein with no known enzymatic function — as an approach to suppressing viral replication.',
        evidenceSource: 'Gao M et al., Nature 2010;465:96-100',
        doi: '10.1038/nature08960',
        measuredMetric:
          'Mean 3.3 log10 reduction in HCV RNA 24 hours after a single 100 mg dose in phase 1',
        auditFlag: 'verified',
      },
      {
        id: 'dcv-a2',
        category: 'measured',
        title: 'ALLY-3: 96% cured in genotype 3 without cirrhosis, in twelve weeks',
        laymanSummary:
          'Genotype 3 had been the hardest form to treat, needing 24 weeks with ribavirin. Twelve weeks of two tablets cured 105 of 109 patients who did not have cirrhosis, and no one had the virus break through during treatment.',
        technicalDetails:
          'ALLY-3 was a phase 3 study of daclatasvir 60 mg with sofosbuvir 400 mg once daily for 12 weeks in 152 genotype 3 patients — 101 treatment-naive and 51 treatment-experienced. SVR12 was 90% (91/101) in treatment-naive and 86% (44/51) in treatment-experienced patients. No virological breakthrough occurred and at least 99% of patients had a virological response at end of treatment. Five of seven patients who had previously failed a sofosbuvir-containing regimen and both patients who had failed an alisporivir-containing regimen achieved SVR12. Gender, age, HCV RNA level and IL28B genotype did not affect the outcome. There were no adverse events leading to discontinuation and one on-treatment serious adverse event, unrelated to study medication.',
        evidenceSource: 'Nelson DR et al., Hepatology 2015;61:1127-1135 (ALLY-3, NCT02032901)',
        doi: '10.1002/hep.27726',
        measuredMetric:
          'Sustained virologic response at 12 weeks in genotype 3, treatment-naive and treatment-experienced',
        auditFlag: 'verified',
      },
      {
        id: 'dcv-a3',
        category: 'failed',
        title: 'Cirrhosis cut the cure rate from 96% to 63% on the identical regimen',
        laymanSummary:
          'The same twelve weeks of the same two drugs cured 105 of 109 patients without cirrhosis and 20 of 32 with it. Nothing else in the trial came close to mattering as much.',
        technicalDetails:
          'SVR12 was 96% (105/109) in patients without cirrhosis against 63% (20/32) in those with cirrhosis. The authors’ own conclusion states the regimen achieved SVR12 in 96% of genotype 3 patients without cirrhosis and that additional evaluation to optimise efficacy in cirrhotic patients was under way — an unusually direct acknowledgement that the trial had not solved its hardest subgroup. The gap is not explained by baseline viral load, IL28B genotype, age or sex, all of which the paper reports as non-contributory. Genotype 3 with cirrhosis remained the acknowledged weak point of hepatitis C treatment for several years after this trial, and it is the population the later pan-genotypic regimens were explicitly designed around.',
        evidenceSource: 'Nelson DR et al., Hepatology 2015;61:1127-1135 (ALLY-3, NCT02032901)',
        doi: '10.1002/hep.27726',
        measuredMetric: 'SVR12 96% (105/109) without cirrhosis against 63% (20/32) with cirrhosis',
        auditFlag: 'caution',
      },
      {
        id: 'dcv-a4',
        category: 'failed',
        title: 'Cardiac asystole thirty minutes after the first dose, in a patient on amiodarone',
        laymanSummary:
          'Two patients taking the heart drug amiodarone had their hearts slow dangerously within two hours of the first dose. One stopped entirely for a period. When one patient was given the drugs again, it happened again — and it stopped happening once the amiodarone had been out of his system for eight weeks.',
        technicalDetails:
          'A published case series reports extreme bradycardia within two hours of taking sofosbuvir with daclatasvir in two patients receiving amiodarone. The first had cardiac asystole 30 minutes after the dose; all three drugs were stopped and cardiac evaluation was normal after ten days. The second, on amiodarone and propranolol, had extreme sinus node dysfunction with a heart rate of 27 beats per minute two hours after dosing; bradycardia recurred each day for three days, resolved when the antivirals were stopped, recurred on rechallenge at day 13, and did not recur on a further rechallenge eight weeks after amiodarone had been stopped. Dechallenge and rechallenge in the same patient is about as strong as causal evidence gets outside a randomised trial. The regulators had warned about this interaction in 2015 before any case report had been published; these are the cases that followed.',
        evidenceSource:
          'Renet S et al., Gastroenterology 2015;149:1378-1380 (two cases including a rechallenge)',
        doi: '10.1053/j.gastro.2015.07.051',
        measuredMetric:
          'Heart rate of 27 beats per minute and one cardiac asystole within two hours of the first dose, with positive rechallenge',
        auditFlag: 'caution',
      },
      {
        id: 'dcv-a5',
        category: 'measured',
        title: 'A 1,200-fold gap between the price of the course and the cost of making it',
        laymanSummary:
          'The two-drug course was listed at US$147,000 in the United States. The published estimate of what it costs to manufacture at scale was US$122.',
        technicalDetails:
          'The published price comparison lists daclatasvir with sofosbuvir at a United States wholesale acquisition cost of US$147,000 per 12-week course, of which US$84,000 is the sofosbuvir component. The retrosynthesis-based cost analysis projected a minimum production cost of US$122 for the same 12-week two-drug course at a scale of at least five million patients per year, and an earlier analysis costed daclatasvir alone at US$10 to US$30 per course, ranking it second least complex to synthesise of the five hepatitis C drugs it assessed. Neither figure is a claim about what a company should charge; both are checkable statements about what the molecules cost to make.',
        evidenceSource:
          'Rosenthal ES, Graham CS, Infect Agent Cancer 2016;11:24, Table 2; van de Ven N et al., Hepatology 2015;61:1174-1182; Hill A et al., Clin Infect Dis 2014;58:928-936',
        doi: '10.1002/hep.27641',
        measuredMetric:
          'US$147,000 wholesale acquisition cost against US$122 projected minimum production cost for the same 12-week two-drug course',
        auditFlag: 'verified',
      },
      {
        id: 'dcv-a6',
        category: 'conclusion_shift',
        title: 'The company that invented the class stopped selling its own first-in-class drug',
        laymanSummary:
          'Daclatasvir proved a whole new type of hepatitis C drug was possible. Four years after approval, the company that discovered it discontinued it in the United States, because the drugs it made possible had overtaken it.',
        technicalDetails:
          'Daclatasvir reached the United States market in 2015, after being approved in Japan and Europe earlier — it was already behind its own successors when it arrived. It requires a second, separately purchased tablet, covers two genotypes, and in its principal indication of genotype 3 falls to 63% in cirrhosis. Within eighteen months, sofosbuvir/velpatasvir and glecaprevir/pibrentasvir offered all six genotypes in a single fixed tablet with far better cirrhotic performance. Bristol-Myers Squibb subsequently discontinued Daklinza in the United States. The molecule itself did not fail: it is on the WHO Model List of Essential Medicines and remains in wide generic use internationally, where its low production cost matters more than its two-genotype label.',
        evidenceSource:
          'Contrast between Nelson DR et al., Hepatology 2015;61:1127-1135 and the pan-genotypic registrational programmes; pricing from Rosenthal ES, Graham CS, Infect Agent Cancer 2016;11:24',
        doi: '10.1186/s13027-016-0071-z',
        auditFlag: 'verified',
      },
      {
        id: 'dcv-a7',
        category: 'inferred',
        title: 'No trial ever isolated daclatasvir from sofosbuvir',
        laymanSummary:
          'Every cure rate here belongs to two drugs taken together. Daclatasvir was never given alone in a registrational trial, so its individual share of the result is inferred rather than measured.',
        technicalDetails:
          'ALLY-3 and the other registrational studies tested daclatasvir with sofosbuvir; there was no daclatasvir monotherapy arm, and there could not have been, because the phase 1 data that validated the class also showed resistant variants emerging within 144 hours of a single dose. What is separately measured is the pharmacology — picomolar replicon EC50, the resistance positions, and the phase 1 viral load drop — and that phase 1 result is the one genuine single-agent measurement in the record. The clinical attribution, that daclatasvir supplies the second barrier that lets sofosbuvir cure in twelve weeks rather than twenty-four with ribavirin, is a mechanistic inference consistent with the data and not a finding from a trial that separated the two.',
        evidenceSource:
          'Gao M et al., Nature 2010;465:96-100; Nelson DR et al., Hepatology 2015;61:1127-1135',
        doi: '10.1038/nature08960',
        inferredClaim:
          'That the ALLY-3 cure rates measure daclatasvir — they measure a two-drug regimen, and the only single-agent human data are 144 hours of phase 1 with resistance already emerging',
        auditFlag: 'caution',
      },
      {
        id: 'dcv-a8',
        category: 'inferred',
        title: 'Every endpoint is a blood test twelve weeks after the last tablet',
        laymanSummary:
          'ALLY-3 measured virus in blood. It did not count deaths, liver cancers or transplants — including in the cirrhotic patients, for whom those outcomes are the reason to treat.',
        technicalDetails:
          'The 2017 Cochrane review of 138 randomised direct-acting antiviral trials in 25,232 participants found no usable randomised evidence on hepatitis C-related morbidity or on hepatocellular carcinoma, and mortality data from only 11 trials. ALLY-3 is single-arm and open-label with a 12-week virological endpoint. The cirrhotic subgroup makes the gap sharpest: those 32 patients are the ones whose cancer and decompensation risk justifies treating at all, and the trial reports only whether their blood was clear twelve weeks afterwards.',
        evidenceSource: 'Jakobsen JC et al., Cochrane Database Syst Rev 2017;9:CD012143',
        doi: '10.1002/14651858.CD012143.pub3',
        inferredClaim:
          'That an undetectable blood test at twelve weeks in a cirrhotic genotype 3 patient predicts fewer cancers, transplants or deaths — plausible, and not what ALLY-3 measured',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Two separate tablets, bought separately',
        laymanDesc:
          'Unlike the regimens that followed, daclatasvir was never combined into one tablet with its partner. Patients took one of each, and paid for each.',
        molecularDetail:
          'Daclatasvir 60 mg once daily with sofosbuvir 400 mg once daily, for 12 weeks, with or without ribavirin. The two are separate products from separate companies, which is one reason the combined course carried a US$147,000 wholesale acquisition cost.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Taken up into liver cells',
        laymanDesc:
          'The drug reaches the liver, where the virus lives, and is metabolised there rather than cleared by the kidney.',
        molecularDetail:
          'Daclatasvir is a substrate of P-glycoprotein and is metabolised by CYP3A4, which is the origin of its interaction profile. It reaches the hepatocyte cytoplasm where the viral replication complex is assembled on remodelled endoplasmic reticulum membrane.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It binds a protein that does no chemistry at all',
        laymanDesc:
          'NS5A has no reaction to block and no pocket built for a small molecule. Daclatasvir binds it anyway, at trillionths of a gram per litre, and that discovery opened a whole drug class.',
        molecularDetail:
          'Picomolar EC50 against replicons across a broad range of genotypes and against JFH-1 genotype 2a infectious virus. NS5A has no known enzymatic function; the binding surface is a protein-protein interface at domain I, near the dimer interface, rather than a catalytic site.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The replication complex collapses and assembly stops',
        laymanDesc:
          'Two things fail at once: the folded-membrane workshop is never properly built, and the genomes already made are never loaded into new particles.',
        molecularDetail:
          'NS5A is required both for replication complex formation on the membranous web and for virion assembly through domain III. Blocking it produces the fastest first-phase viral decline of any antiviral class — the 3.3 log10 fall in 24 hours after a single dose is the measurement that established this.',
        iconName: 'Ban',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Twelve weeks instead of twenty-four, in the hardest genotype',
        laymanDesc:
          'Before this, genotype 3 needed six months of treatment with ribavirin. Two tablets for twelve weeks cured 96% of patients without cirrhosis.',
        molecularDetail:
          'SVR12 was 90% (91/101) in treatment-naive and 86% (44/51) in treatment-experienced genotype 3 patients overall, and 96% (105/109) in those without cirrhosis. No virological breakthrough occurred during treatment.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Unless the liver was already scarred',
        laymanDesc:
          'In patients with cirrhosis the same regimen cured 20 of 32. That gap is why the drugs that came next were designed the way they were.',
        molecularDetail:
          'SVR12 63% (20/32) with cirrhosis against 96% (105/109) without, on the identical 12-week regimen. Baseline viral load, IL28B genotype, age and sex did not affect the outcome; cirrhosis did.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Phase 1 single-dose study reported in Gao 2010, Nature',
        phase: 'Phase 1, single ascending dose in chronically infected patients',
        sampleSize: 2,
        primaryEndpoint: 'Change in HCV RNA 24 hours after a single 100 mg dose',
        endpointMet: true,
        statisticalPValue:
          'Mean 3.3 log10 reduction at 24 hours, sustained for a further 120 hours in two patients with genotype 1b',
        unreportedAdverseSignals:
          'Resistant variants carrying substitutions at the positions previously mapped in the replicon system were already detectable in patient samples at 24 and 144 hours after a single dose — the clearest possible demonstration that this drug could never be used alone.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'ALLY-3 (NCT02032901)',
        phase: 'Phase 3, open-label, single-arm, genotype 3',
        sampleSize: 152,
        primaryEndpoint:
          'Sustained virologic response 12 weeks after treatment, co-primary in treatment-naive and treatment-experienced patients',
        endpointMet: true,
        statisticalPValue:
          '90% (91/101) treatment-naive and 86% (44/51) treatment-experienced; 96% (105/109) without cirrhosis against 63% (20/32) with cirrhosis',
        unreportedAdverseSignals:
          'Single-arm and open-label with no comparator. The cirrhotic subgroup of 32 patients drove the entire difference between the headline and the non-cirrhotic figure, and the authors state that further work to optimise efficacy in that group was under way.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Mean 3.3 log10 fall in HCV RNA 24 hours after a single 100 mg dose in phase 1',
        'Picomolar EC50 across a broad range of replicon genotypes and against JFH-1 genotype 2a infectious virus',
        'Resistance substitutions in patients after a single dose occurred at the same positions the replicon system had already identified',
        'SVR12 96% (105/109) in genotype 3 without cirrhosis and 63% (20/32) with cirrhosis, on the identical regimen',
        'US$147,000 wholesale acquisition cost for the 12-week two-drug course against a US$122 projected minimum production cost',
      ],
      unsupportedInferences: [
        'That the ALLY-3 cure rates measure daclatasvir; no registrational arm separated it from sofosbuvir',
        'That a 12-week virological endpoint in cirrhotic genotype 3 patients predicts fewer cancers or transplants — the reason to treat them, and not what was measured',
        'That the 63% cirrhotic figure is a stable estimate; it rests on 32 patients in a single-arm trial',
        'That validating NS5A as a target implies all NS5A inhibitors behave alike; the successors differ by orders of magnitude in subtype coverage and resistance barrier',
      ],
      whatFailedInitially: [
        'Cirrhosis cut the genotype 3 cure rate by 33 percentage points, and the authors flagged it as unresolved in their own conclusion',
        'Extreme bradycardia including one cardiac asystole within two hours of the first dose in patients taking amiodarone, confirmed by rechallenge',
        'Never available as a fixed combination, so patients bought and took two separate products',
        'Two genotypes out of six on the United States label, at a time when pan-genotypic regimens were about to arrive',
        'Resistant variants appeared in patients within 144 hours of a single dose, which permanently ruled out monotherapy',
      ],
      realWorldOutcome: [
        'Approved in the United States in 2015, after Japan and Europe; the first-in-class NS5A inhibitor and the ancestor of every NS5A drug that followed',
        'Discontinued in the United States by Bristol-Myers Squibb after the pan-genotypic fixed combinations arrived',
        'On the WHO Model List of Essential Medicines and in wide generic use internationally, where its low production cost matters more than its narrow label',
        'Generic sofosbuvir-daclatasvir prices in low- and middle-income countries fell towards the modelled production floor within about two years, while the United States wholesale figure did not move',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, taken with a separate sofosbuvir tablet',
      description:
        'One 60 mg tablet once daily with or without food, alongside sofosbuvir 400 mg once daily, for 12 weeks. Never sold as a fixed-dose combination and never indicated as a single agent. No longer marketed in the United States.',
      safetyProfile:
        'In ALLY-3 there were no adverse events leading to discontinuation and one on-treatment serious adverse event, unrelated to study medication; the commonest events were headache, fatigue and nausea. The serious risk is an interaction rather than a direct toxicity: extreme bradycardia, including cardiac asystole, has been reported within two hours of the first dose in patients taking amiodarone, confirmed by rechallenge in a published case. Amiodarone has a half-life measured in weeks, so recent discontinuation does not remove the risk. Daclatasvir is metabolised by CYP3A4 and is a P-glycoprotein substrate, so strong inducers reduce its exposure substantially.',
    },
    commonQuestions: [
      {
        q: 'What made this drug important?',
        a: 'It proved that a protein with no chemistry could be a drug target. Every classical drug target does something you can interfere with — an enzyme catalysing a reaction, a receptor transmitting a signal. NS5A does neither. It has no known enzymatic function; it organises. Nobody had a good reason to believe a small molecule could usefully bind it, and the programme that found daclatasvir did so by screening for antiviral activity and then working backwards to the target rather than by designing against a known site. The proof arrived unusually early: a single 100 mg dose in phase 1 cut viral load by 3.3 log10 — about two thousandfold — within 24 hours. Every NS5A inhibitor that followed, and therefore every modern hepatitis C combination, descends from that result.',
      },
      {
        q: 'Why does cirrhosis matter so much here?',
        a: 'In ALLY-3 it was the only thing that mattered much. Patients without cirrhosis were cured 96% of the time — 105 of 109. Patients with cirrhosis were cured 63% of the time — 20 of 32. Same drugs, same twelve weeks, same dose. Age, sex, baseline viral load and IL28B genotype made no measurable difference. The authors said in their own conclusion that further work to improve results in cirrhotic patients was under way, which is a plain acknowledgement that the trial had not solved its hardest group. Genotype 3 with cirrhosis stayed the acknowledged weak spot of hepatitis C treatment for several years afterwards, and the pan-genotypic regimens were designed with it in mind.',
        auditNote:
          'A 63% figure from 32 patients in a single-arm trial is a wide estimate. The direction is not in doubt; the precise number is.',
      },
      {
        q: 'What is the amiodarone problem?',
        a: 'It is the most clearly documented dangerous interaction in modern hepatitis C treatment, and the evidence for it is unusually strong for a case report. Two patients on amiodarone developed extreme slowing of the heart within two hours of their first dose of sofosbuvir with daclatasvir. One had cardiac asystole thirty minutes after the dose. The second dropped to 27 beats per minute, recovered when the antivirals were stopped, had it happen again when the antivirals were restarted, and did not have it happen on a further rechallenge once amiodarone had been out of his system for eight weeks. A dechallenge and a rechallenge in the same patient is close to the strongest causal evidence obtainable without a trial. The mechanism is still not fully explained. Amiodarone persists for weeks after being stopped, so this is a conversation to have before treatment, not a last-minute adjustment.',
      },
      {
        q: 'Why is it no longer sold in the United States?',
        a: 'Because the drugs it made possible overtook it. Daclatasvir reached the United States market in 2015, later than in Japan and Europe, and it arrived with three structural disadvantages: it treats two genotypes rather than six, it is a separate tablet that must be bought alongside sofosbuvir rather than combined with it, and in its principal indication of genotype 3 it falls to 63% when cirrhosis is present. Within eighteen months, two single-tablet regimens covering all six genotypes were available with much better cirrhotic performance. Bristol-Myers Squibb discontinued Daklinza in the United States. The molecule is not obsolete everywhere: it is on the WHO Model List of Essential Medicines and remains in wide generic use, because it is cheap to make and works well in patients without cirrhosis.',
      },
      {
        q: 'Could daclatasvir be used on its own?',
        a: 'No, and the reason was visible from the very first study. In the phase 1 work that validated the class, viral sequencing at 24 and 144 hours after a single 100 mg dose already showed resistant variants dominating the population, carrying substitutions at the positions the laboratory replicon system had predicted. That is not a slow accumulation of resistance over weeks; it is escape within days of one tablet. NS5A inhibitors are extremely potent and have a low barrier to resistance on their own, which is exactly why every drug in this class — daclatasvir, ledipasvir, velpatasvir, pibrentasvir, elbasvir — is only ever sold in combination.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Gao M et al. Chemical genetics strategy identifies an HCV NS5A inhibitor with a potent clinical effect. Nature 2010;465:96-100',
        identifier: '10.1038/nature08960',
        kind: 'doi',
      },
      {
        label:
          'Nelson DR et al. All-oral 12-week treatment with daclatasvir plus sofosbuvir in patients with hepatitis C virus genotype 3 infection: ALLY-3 phase III study. Hepatology 2015;61:1127-1135',
        identifier: '10.1002/hep.27726',
        kind: 'doi',
      },
      {
        label:
          'Renet S et al. Extreme bradycardia after first doses of sofosbuvir and daclatasvir in patients receiving amiodarone: 2 cases including a rechallenge. Gastroenterology 2015;149:1378-1380',
        identifier: '10.1053/j.gastro.2015.07.051',
        kind: 'doi',
      },
      {
        label:
          'van de Ven N et al. Minimum target prices for production of direct-acting antivirals and associated diagnostics to combat hepatitis C virus. Hepatology 2015;61:1174-1182',
        identifier: '10.1002/hep.27641',
        kind: 'doi',
      },
      {
        label:
          'Hill A, Khoo S, Fortunak J, Simmons B, Ford N. Minimum costs for producing hepatitis C direct-acting antivirals for use in large-scale treatment access programs in developing countries. Clin Infect Dis 2014;58:928-936',
        identifier: '10.1093/cid/ciu012',
        kind: 'doi',
      },
      {
        label:
          'Hill A, Simmons B, Gotham D, Fortunak J. Rapid reductions in prices for generic sofosbuvir and daclatasvir to treat hepatitis C. J Virus Erad 2016;2:28-31',
        identifier: '10.1016/S2055-6640(20)30691-9',
        kind: 'doi',
      },
      {
        label:
          'Rosenthal ES, Graham CS. Price and affordability of direct-acting antiviral regimens for hepatitis C virus in the United States. Infect Agent Cancer 2016;11:24, Table 2',
        identifier: '10.1186/s13027-016-0071-z',
        kind: 'doi',
      },
      {
        label:
          'Jakobsen JC et al. Direct-acting antivirals for chronic hepatitis C. Cochrane Database Syst Rev 2017;9:CD012143',
        identifier: '10.1002/14651858.CD012143.pub3',
        kind: 'doi',
      },
      {
        label: 'ALLY-3: daclatasvir with sofosbuvir in genotype 3',
        identifier: 'NCT02032901',
        kind: 'nct',
      },
      {
        label:
          'PubChem CID 25154713 — daclatasvir dihydrochloride structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/25154713',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 12. Simeprevir — the drug defeated by a single letter. Q80K is carried by roughly three in ten
  //     genotype 1a infections before treatment starts, and its label ended up telling doctors to
  //     use something else. No longer licensed in the United States.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'simeprevir',
    name: 'Simeprevir',
    tradeName: 'Olysio',
    sponsor: 'Janssen Products (developed with Medivir AB)',
    targetGene: 'HCV NS3/4A — a hepatitis C viral gene, not a human one',
    targetProtein:
      'Hepatitis C virus NS3/4A serine protease, the enzyme that cuts the viral polyprotein into its working parts',
    modality: 'Small Molecule',
    approvalStatus: 'Withdrawn from Market',
    approvalYear: 2013,
    indication:
      'Chronic hepatitis C virus genotype 1 or 4 infection in adults with compensated liver disease, in combination with sofosbuvir or with peginterferon alfa and ribavirin. No longer licensed for use in the United States',
    patientFriendlyIndication:
      'Long-standing hepatitis C infection, genotype 1 or 4 — a drug that is no longer sold in the United States',
    anatomicalSite:
      'Hepatocyte cytoplasm at the endoplasmic reticulum membrane, where the viral polyprotein is processed',
    conditionContext: {
      conditionExplainer:
        'Hepatitis C makes all its proteins as one long chain and cuts them apart with a molecular scissor of its own, NS3/4A. Blocking that scissor stops the virus assembling anything. Simeprevir was one of the first drugs of that kind to be given once daily as a single tablet.',
      whyItMatters:
        'Simeprevir is the clearest case in modern antiviral medicine of a drug beaten by a naturally occurring variant. A single amino acid change at position 80 of the viral protease, present in roughly three of every ten genotype 1a infections before any treatment, cost it about tenfold of potency and eventually cost it its place in practice.',
      whoTakesThis:
        'Nobody in the United States. The NCBI Medical Genetics Summaries entry on simeprevir was archived in July 2020 with the note that simeprevir is no longer licensed for use in the USA. The record is kept here because the Q80K story is the reason later drugs were designed the way they were.',
      clinicalGoals:
        'Sustained virologic response at 12 weeks. Uniquely for its era, reaching it required a pre-treatment genetic test of the virus — and if the test was positive, the label pointed elsewhere.',
    },
    oneSentenceVerdict:
      'A once-daily NS3/4A protease inhibitor that raised sustained virologic response from 50% to 80% and 81% against placebo in two double-blind trials totalling 785 patients, and that was then undone by Q80K — a naturally occurring change present in 29.5% of genotype 1a infections before treatment, costing about tenfold of potency, prompting a label that told doctors to consider alternative therapy if the test was positive, and ending with the drug no longer licensed in the United States.',
    laymanHowItWorks:
      'Hepatitis C builds all its proteins as one long strip and then cuts the strip into working parts with its own molecular scissors. Simeprevir jams the scissors, so the strip is never cut and the virus cannot assemble the machinery to copy itself. The problem is where it grips. Its contact point includes a spot on the enzyme that varies naturally between viruses, and in about three in ten of the commonest form of genotype 1 that spot is already different — enough that the drug binds roughly ten times less well before anyone has taken anything.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 46,
    substitutes: {
      summary:
        'Everything replaced it. The specific lesson simeprevir taught — design the molecule so a common natural polymorphism cannot defeat it — is written into the drugs that came after, and both current protease inhibitors state explicitly that Q80K does not affect them.',
      conventionalRx: [
        {
          name: 'Glecaprevir, in glecaprevir/pibrentasvir (Mavyret)',
          class: 'Pan-genotypic NS3/4A protease inhibitor with an NS5A inhibitor',
          howItCompares:
            'A macrocyclic protease inhibitor built so that Q80K, including the genotype 1a form, does not reduce susceptibility at all. Covers all six genotypes, needs no pre-treatment resistance test, and treats most previously untreated patients in 8 weeks.',
          typicalCost:
            'US$152.92 per pibrentasvir-containing tablet at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: unaffected by Q80K; six genotypes; 8 weeks. Cons: contraindicated in Child-Pugh B or C liver disease.',
        },
        {
          name: 'Grazoprevir, in elbasvir/grazoprevir (Zepatier)',
          class: 'NS3/4A protease inhibitor with an NS5A inhibitor',
          howItCompares:
            'The other protease inhibitor designed around this problem: its label records that Q80K and Q80R have no impact in cell culture and that Q80K did not affect clinical response in genotype 1a. It carries a different pre-treatment test — for NS5A polymorphisms, on account of its partner drug.',
          typicalCost:
            'US$54,600 per 12-week course at the United States wholesale acquisition cost recorded in the published price comparison',
          prosAndCons:
            'Pros: unaffected by Q80K; strong result in advanced kidney disease. Cons: two genotypes; needs baseline NS5A testing in genotype 1a.',
        },
        {
          name: 'Sofosbuvir/velpatasvir (Epclusa)',
          class: 'Pan-genotypic combination containing no protease inhibitor at all',
          howItCompares:
            'Sidesteps the entire NS3 resistance question by not targeting NS3. All six genotypes, one tablet, and usable in decompensated cirrhosis where protease inhibitors are contraindicated.',
          typicalCost:
            'US$866.40 per tablet, median across the two listed products at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: no NS3 involvement; usable in Child-Pugh B and C. Cons: renally cleared nucleotide metabolite; 12 weeks.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CC1=C(C=CC2=C1N=C(C=C2O[C@@H]3C[C@@H]4[C@@H](C3)C(=O)N(CCCC/C=C\\[C@@H]5C[C@]5(NC4=O)C(=O)NS(=O)(=O)C6CC6)C)C7=NC(=CS7)C(C)C)OC',
      chemicalFormula: 'C38H47N5O7S2',
      molecularWeight: '749.90 g/mol',
      targetReceptorAffinity:
        'The number that matters for this molecule is not its wild-type potency but its loss against one substitution: the NS3 Q80K polymorphism confers an approximately tenfold reduction in simeprevir activity in vitro, and Q80K was present at baseline in 13.7% of 2,007 genotype 1 patients sequenced across the phase 2b and 3 programme — 29.5% of genotype 1a (269 of 911) and 0.5% of genotype 1b (5 of 1,096). Emerging mutations at NS3 positions 80, 122, 155 and 168 at failure conferred high-level resistance, with EC50 fold-changes above 50.',
      structureSource: {
        label: 'PubChem CID 24873435 (simeprevir) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/24873435',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'smv-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity of the quinoline, the thiazole and the two sulfur atoms',
          description:
            'Confirm the 7-methoxy-8-methylquinoline bearing an isopropyl-thiazole, the cyclopentane-proline ether linkage, and the cyclopropanesulfonamide warhead. Simeprevir carries two sulfur atoms in different oxidation environments — a thiazole ring and a sulfonamide — and both are structurally load-bearing: the sulfonamide is the warhead, and the aryl system is what makes the molecule photosensitising.',
          reagentsAndBuffer:
            'Chiral HPLC against reference standard, 1H and 13C NMR in CDCl3, cyclopropanesulfonamide and 4-isopropylthiazole reference standards, elemental sulfur analysis, Karl Fischer titration',
        },
        {
          id: 'smv-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Ring-closing metathesis to the fourteen-membered macrocycle, then the sulfonamide',
          description:
            'Couple the quinoline-thiazole fragment to the hydroxycyclopentane-proline by aromatic nucleophilic substitution, assemble the diene, close the macrocycle by ruthenium-catalysed metathesis to give the cis-alkene, and install the acylsulfonamide. The cis geometry of the macrocyclic alkene is fixed by the ring size and is part of the bound conformation; the trans isomer is a real and separable impurity.',
          dependsOnStepId: 'smv-w1',
          reagentsAndBuffer:
            'Caesium carbonate in NMP for the SNAr coupling to the chloroquinoline, second-generation Grubbs or Hoveyda-Grubbs catalyst at high dilution in toluene under nitrogen, N,N-carbonyldiimidazole with DBU and cyclopropanesulfonamide',
        },
        {
          id: 'smv-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Ruthenium scavenging, alkene geometry control, and light exclusion',
          description:
            'Strip residual ruthenium to the elemental impurity limit, separate the trans-alkene isomer and dimeric metathesis by-products, and handle the material under reduced light. The photosensitivity seen clinically is a property of the molecule’s extended aromatic system, and photodegradation products formed during processing are impurities in their own right, so amber glassware is a specification rather than a habit.',
          dependsOnStepId: 'smv-w2',
          reagentsAndBuffer:
            'Isocyanide or thiourea-functionalised silica scavenger, activated charcoal, preparative reversed-phase chromatography, ICP-MS for residual ruthenium, amber glassware and controlled lighting, forced photodegradation study per ICH Q1B',
        },
        {
          id: 'smv-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Chimeric replicons carrying NS3 from patient isolates, Q80K prevalence measured first',
          description:
            'Dose replicons in which the NS3 protease has been replaced by sequences amplified from patient samples, and establish how common each baseline polymorphism actually is before interpreting the potency data. The programme did exactly this and found Q80K in 29.5% of genotype 1a isolates — a frequency high enough that a tenfold potency loss stops being a laboratory curiosity and becomes a population-level problem.',
          dependsOnStepId: 'smv-w3',
          reagentsAndBuffer:
            'Transient replicon assay in Huh-7 cells with patient-derived NS3 protease inserts, site-directed mutants at positions 43, 80, 122, 155, 156 and 168, DMEM with 10% fetal bovine serum, luciferase readout, population sequencing of baseline isolates',
        },
        {
          id: 'smv-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Track resistance after failure, and record when it stops being detectable',
          description:
            'Sequence the viral population at failure and again at long follow-up, and report both. In the pooled programme, 91.4% of failures carried emerging mutations at positions 80, 122, 155 or 168 conferring more than fiftyfold resistance — and in half of those patients the mutations were no longer detectable by population sequencing a median of 28.4 weeks later. Disappearing from a population sequence is not the same as being gone, and reporting only the later timepoint would understate what the failure left behind.',
          dependsOnStepId: 'smv-w4',
          reagentsAndBuffer:
            'Population sequencing at baseline, failure and study end, deep sequencing for minority variants below the population threshold, site-directed R155K and D168V replicons for phenotypic confirmation, matched wild-type controls',
        },
      ],
    },
    keyAudits: [
      {
        id: 'smv-a1',
        category: 'measured',
        title: 'QUEST-1 and QUEST-2: 80% and 81% against 50% on placebo',
        laymanSummary:
          'Two double-blind trials gave everyone the same interferon and ribavirin and randomised only whether they also took simeprevir. Half the placebo patients were cured; four in five of the simeprevir patients were.',
        technicalDetails:
          'QUEST-1 randomised 394 treatment-naive genotype 1 patients 2:1 to simeprevir 150 mg daily or placebo, each with peginterferon alfa-2a and ribavirin, double-blind, in 13 countries. SVR12 was 80% (210/264) against 50% (65/130), adjusted difference 29.3% (95% CI 20.1 to 38.6), p<0.0001. QUEST-2 randomised 391 patients on the same design with peginterferon alfa-2a or alfa-2b: SVR12 81% (209/257) against 50% (67/134), adjusted difference 32.2% (95% CI 23.3 to 41.2), p<0.0001. Adverse events led to discontinuation of simeprevir in under 1% in QUEST-1. These are properly controlled results and they are the reason the drug was approved.',
        evidenceSource:
          'Jacobson IM et al., Lancet 2014;384:403-413 (QUEST-1, NCT01289782); Manns M et al., Lancet 2014;384:414-426 (QUEST-2, NCT01290679)',
        doi: '10.1016/S0140-6736(14)60494-3',
        measuredMetric:
          'Sustained virologic response at 12 weeks against a concurrent double-blind placebo arm',
        auditFlag: 'verified',
      },
      {
        id: 'smv-a2',
        category: 'failed',
        title: 'Q80K: present in 29.5% of genotype 1a before treatment, worth about tenfold',
        laymanSummary:
          'One naturally occurring change at position 80 of the viral enzyme makes simeprevir roughly ten times weaker. It is not caused by treatment — nearly three in ten people with the commonest form of genotype 1 already have it.',
        technicalDetails:
          'Baseline sequencing was available for 2,007 genotype 1 simeprevir-treated patients across the phase 2b and 3 programme. Baseline NS3 polymorphisms at positions associated with reduced in vitro susceptibility — 43, 80, 122, 155, 156 or 168, defined as an EC50 fold-change above 2.0 — were uncommon at 1.3% (26/2,007), with one exception. Q80K, which confers approximately a tenfold reduction in simeprevir activity in vitro, was present in 13.7% overall (274/2,007): 29.5% of genotype 1a (269/911) and 0.5% of genotype 1b (5/1,096). The authors report that baseline Q80K had only a minor effect on initial response but resulted in lower sustained virologic response rates. The distinction matters: a variant that does not change the early viral decline but changes the cure rate is invisible in the on-treatment data and only appears at the endpoint.',
        evidenceSource: 'Lenz O et al., J Hepatol 2015;62:1008-1014',
        doi: '10.1016/j.jhep.2014.11.032',
        measuredMetric:
          'Baseline Q80K prevalence 29.5% in genotype 1a (269/911), conferring an approximately tenfold in-vitro potency loss',
        auditFlag: 'caution',
      },
      {
        id: 'smv-a3',
        category: 'failed',
        title: 'A label that told prescribers to consider a different drug',
        laymanSummary:
          'The approved label strongly recommended testing genotype 1a patients for Q80K before treatment, and strongly recommended considering alternative therapy if it was found. Very few labels tell a doctor to use something else.',
        technicalDetails:
          'The NCBI Medical Genetics Summaries entry on simeprevir records that the FDA-approved label strongly recommends that patients with HCV genotype 1a infection be screened for the presence of virus with the NS3 Q80K polymorphism, and that if Q80K is detected, the label strongly recommends that alternative therapy be considered. The same entry notes the label’s IFNL3 (formerly IL28B) pharmacogenetic information, with lower response rates in CT and TT genotypes than in CC. Two separate pre-treatment genetic tests — one on the virus, one on the patient — for a single twelve-week drug is a strong signal about how narrow the population of reliable responders was.',
        evidenceSource:
          'Dean L. Simeprevir therapy and IFNL3 genotype. In: Medical Genetics Summaries. Bethesda (MD): NCBI; 2016, updated 2020 (PMID 28520373)',
        auditFlag: 'caution',
      },
      {
        id: 'smv-a4',
        category: 'failed',
        title:
          'Nine in ten failures ended with high-level resistance, and half of it then vanished from view',
        laymanSummary:
          'Almost every patient in whom the drug failed ended up carrying virus that was more than fifty times less susceptible to it. Half of those mutations were no longer detectable six months later — not necessarily gone, just below what the test can see.',
        technicalDetails:
          'Among simeprevir-treated patients without sustained virologic response, 91.4% (180/197) had emerging mutations at NS3 positions 80, 122, 155 and/or 168 at failure, mainly R155K in genotype 1a with and without Q80K and D168V in genotype 1b, conferring EC50 fold-changes above 50. Emerging mutations were no longer detectable by population sequencing at study end in 50% (90/180), at a median follow-up of 28.4 weeks. Population sequencing detects variants above roughly 15 to 20% of the viral population; disappearance from that assay means the variant fell below the threshold, not that it was cleared, and archived resistance can persist in the replication-competent pool. Reporting only the later timepoint would understate what a simeprevir failure leaves behind for the next regimen.',
        evidenceSource: 'Lenz O et al., J Hepatol 2015;62:1008-1014',
        doi: '10.1016/j.jhep.2014.11.032',
        measuredMetric:
          '91.4% (180/197) of failures with emerging high-level resistance; undetectable by population sequencing in 50% at median 28.4 weeks',
        auditFlag: 'caution',
      },
      {
        id: 'smv-a5',
        category: 'inferred',
        title: 'OPTIMIST-2 declared superiority against a historical control of 70%',
        laymanSummary:
          'The trial in cirrhotic patients cured 83% and was reported as beating its comparator. The comparator was a 70% figure assembled from earlier studies, not a group of patients treated at the same time.',
        technicalDetails:
          'OPTIMIST-2 was a phase 3, open-label, single-arm study of 12 weeks of simeprevir with sofosbuvir in 103 genotype 1 patients with documented cirrhosis. The primary endpoint was SVR12 against a composite historical control of 70%. SVR12 was 83% (95% CI 76 to 91), meeting superiority against that benchmark; treatment-naive patients reached 88% (44/50) and treatment-experienced 79% (42/53). Adverse events occurred in 70%, mostly grade 1 or 2, and 3% discontinued all study treatment for adverse events. The design is the audit: 83% was a statistically superior result against a constructed benchmark at a moment when contemporaneous regimens in cirrhotic genotype 1 patients were reporting figures in the mid-nineties. Superiority against a historical control is a claim about a number, not about a comparison a patient would recognise.',
        evidenceSource: 'Lawitz E et al., Hepatology 2016;64:360-369 (OPTIMIST-2, NCT02114151)',
        doi: '10.1002/hep.28422',
        inferredClaim:
          'That an 83% cure rate in cirrhosis represented a competitive result — it was superior to a 70% historical benchmark and below what concurrent alternatives were reporting',
        auditFlag: 'contested',
      },
      {
        id: 'smv-a6',
        category: 'failed',
        title: 'Rash in a quarter of patients and photosensitivity in one in twenty-five',
        laymanSummary:
          'A quarter of people on simeprevir developed a rash, against one in nine on placebo, and photosensitivity reactions were several times more common.',
        technicalDetails:
          'In QUEST-2, rash occurred in 24% (61/257) of simeprevir patients against 11% (15/134) on placebo, and photosensitivity in 4% (10/257) against under 1% (1/134). In QUEST-1, using peginterferon alfa-2a alone as the backbone, rash frequencies were similar between groups at 27% and 25%, and anaemia at 16% and 11%. The photosensitivity is chemically unsurprising: simeprevir carries an extended methoxy-quinoline and thiazole aromatic system that absorbs in the near-ultraviolet, and the effect is a property of the molecule rather than of the combination.',
        evidenceSource:
          'Manns M et al., Lancet 2014;384:414-426 (QUEST-2); Jacobson IM et al., Lancet 2014;384:403-413 (QUEST-1)',
        doi: '10.1016/S0140-6736(14)60538-9',
        measuredMetric: 'Rash 24% against 11% and photosensitivity 4% against under 1% in QUEST-2',
        auditFlag: 'caution',
      },
      {
        id: 'smv-a7',
        category: 'conclusion_shift',
        title: 'From approved in 2013 to unlicensed in the United States by 2020',
        laymanSummary:
          'Simeprevir was approved in late 2013, and within a few years it had been removed from the American market. Nothing was discovered that made it dangerous; better drugs simply made its limitations unacceptable.',
        technicalDetails:
          'The NCBI Medical Genetics Summaries entry on simeprevir was archived on 15 July 2020 with the explicit note that simeprevir is no longer licensed for use in the USA. The reasons are all visible in the data above: a pre-treatment viral genetic test whose positive result pointed to a different drug, a second pharmacogenetic marker in the patient, a 29.5% baseline prevalence of the defeating polymorphism in the commonest subtype it treated, 83% in cirrhosis when competitors were reporting mid-nineties, and photosensitivity. This is what a drug being outcompeted looks like from the inside, and it is worth recording because the specific failure — a common natural polymorphism at the binding interface — became a design constraint every subsequent protease inhibitor was built against.',
        evidenceSource:
          'Dean L. Simeprevir therapy and IFNL3 genotype. In: Medical Genetics Summaries. Bethesda (MD): NCBI; 2016, updated and archived 15 July 2020 (PMID 28520373)',
        auditFlag: 'verified',
      },
      {
        id: 'smv-a8',
        category: 'measured',
        title: 'The most complex hepatitis C molecule to make of the five that were costed',
        laymanSummary:
          'An independent analysis ranked simeprevir the hardest to synthesise of the five hepatitis C drugs it examined, and projected a manufacturing cost of US$130 to US$270 per twelve-week course.',
        technicalDetails:
          'The retrosynthesis-based cost analysis ranked complexity of chemical synthesis from lowest to highest as ribavirin, daclatasvir, sofosbuvir, faldaprevir and simeprevir, and projected minimum manufacturing costs per 12-week course of US$21 to US$63 for ribavirin, US$10 to US$30 for daclatasvir, US$68 to US$136 for sofosbuvir, US$100 to US$210 for faldaprevir and US$130 to US$270 for simeprevir. The complexity is visible in the structure: a fourteen-membered macrocycle formed by ruthenium-catalysed metathesis, three contiguous stereocentres on a cyclopentane, an aryl ether coupling to a substituted quinoline, and an acylsulfonamide warhead. No pricing block appears on this page because the drug is no longer marketed in the United States and no current acquisition price could be verified against a checkable dataset.',
        evidenceSource:
          'Hill A, Khoo S, Fortunak J, Simmons B, Ford N. Minimum costs for producing hepatitis C direct-acting antivirals for use in large-scale treatment access programs in developing countries. Clin Infect Dis 2014;58:928-936',
        doi: '10.1093/cid/ciu012',
        measuredMetric:
          'Projected minimum manufacturing cost US$130 to US$270 per 12-week course, the highest of the five drugs assessed',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A test first, then one tablet a day',
        laymanDesc:
          'Genotype 1a patients were meant to be screened for the Q80K variant before starting, and if it was found the label pointed to a different drug.',
        molecularDetail:
          'Simeprevir 150 mg once daily with food, in combination with sofosbuvir or with peginterferon alfa and ribavirin. The label strongly recommended NS3 Q80K screening in genotype 1a and consideration of alternative therapy if detected, and carried separate IFNL3 pharmacogenetic information about the patient.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Concentrated in the liver',
        laymanDesc:
          'The drug is taken up by liver cells and leaves in bile, and it is heavily bound to proteins in the blood.',
        molecularDetail:
          'Taken up by OATP1B1 and metabolised by CYP3A, with biliary elimination. Very high plasma protein binding, and an extended aromatic system that absorbs in the near-ultraviolet — the chemical basis of the photosensitivity reported in trials.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It grips the viral scissors — at a spot that varies between viruses',
        laymanDesc:
          'Simeprevir sits in the enzyme’s cutting groove and blocks it. Its grip includes position 80, which naturally differs in about three in ten genotype 1a infections.',
        molecularDetail:
          'A fourteen-membered macrocyclic acylsulfonamide spanning the P1 to P3 subsites of the NS3/4A active site, which brings it into contact near residue 80. The Q80K substitution confers an approximately tenfold reduction in activity in vitro; the later P2-to-P4 macrocycles grazoprevir and glecaprevir move that contact away and are unaffected.',
        iconName: 'Scissors',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The polyprotein is never cut',
        laymanDesc:
          'None of the individual viral proteins are released, so the copying machinery is never assembled.',
        molecularDetail:
          'NS3/4A cleaves the viral polyprotein at the NS3-NS4A, NS4A-NS4B, NS4B-NS5A and NS5A-NS5B junctions and also cleaves the host adaptor MAVS, so protease inhibition removes both the maturation step and the virus’s suppression of innate sensing.',
        iconName: 'Ban',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Cure rates rose from one in two to four in five',
        laymanDesc:
          'Added to the interferon regimens of the time, it took sustained response from around 50% to around 80% — a real and properly controlled gain.',
        molecularDetail:
          'SVR12 80% (210/264) against 50% (65/130) in QUEST-1 and 81% (209/257) against 50% (67/134) in QUEST-2, both double-blind and placebo-controlled, with adjusted differences of 29.3 and 32.2 percentage points.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And then one letter of the virus decided the outcome',
        laymanDesc:
          'Q80K was present in nearly three in ten genotype 1a infections before treatment, lowered cure rates, and led to a label that recommended using something else. The drug is no longer licensed in the United States.',
        molecularDetail:
          'Baseline Q80K in 29.5% of genotype 1a (269/911) and 0.5% of genotype 1b (5/1,096), conferring roughly tenfold potency loss. At failure, 91.4% of patients carried emerging mutations at positions 80, 122, 155 or 168 with more than fiftyfold resistance.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'QUEST-1 (NCT01289782)',
        phase: 'Phase 3, randomised 2:1, double-blind, placebo-controlled',
        sampleSize: 394,
        primaryEndpoint:
          'Sustained virologic response 12 weeks after the planned end of treatment, intention to treat',
        endpointMet: true,
        statisticalPValue:
          '80% (210/264) against 50% (65/130); adjusted difference 29.3% (95% CI 20.1 to 38.6), p<0.0001',
        unreportedAdverseSignals:
          'Treatment duration in the simeprevir arm was response-guided (24 or 48 weeks) while the placebo arm was fixed at 48 weeks, so duration was not held constant between the groups being compared.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'QUEST-2 (NCT01290679)',
        phase: 'Phase 3, randomised 2:1, double-blind, placebo-controlled',
        sampleSize: 391,
        primaryEndpoint: 'Sustained virologic response 12 weeks after the planned end of treatment',
        endpointMet: true,
        statisticalPValue:
          '81% (209/257) against 50% (67/134); adjusted difference 32.2% (95% CI 23.3 to 41.2), p<0.0001',
        unreportedAdverseSignals:
          'Rash 24% against 11% and photosensitivity 4% against under 1%. The same response-guided duration asymmetry as QUEST-1 applies.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'OPTIMIST-2 (NCT02114151)',
        phase: 'Phase 3, open-label, single-arm, against a composite historical control',
        sampleSize: 103,
        primaryEndpoint:
          'SVR12 in genotype 1 patients with cirrhosis, against a historical control rate of 70%',
        endpointMet: true,
        statisticalPValue:
          '83% (95% CI 76 to 91) against the 70% historical benchmark; 88% (44/50) treatment-naive and 79% (42/53) treatment-experienced',
        unreportedAdverseSignals:
          'Single-arm and open-label with a constructed comparator. Adverse events in 70% of patients and 3% discontinued all treatment for adverse events. Contemporaneous alternatives in the same population were reporting mid-nineties cure rates.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'SVR12 80% against 50% and 81% against 50% in two double-blind placebo-controlled trials totalling 785 patients',
        'Baseline Q80K in 29.5% of genotype 1a isolates (269/911) and 0.5% of genotype 1b (5/1,096), from 2,007 sequenced patients',
        'Q80K confers approximately a tenfold reduction in simeprevir activity in vitro',
        '91.4% (180/197) of failures carried emerging NS3 mutations conferring more than fiftyfold resistance',
        'Rash 24% against 11% and photosensitivity 4% against under 1% in QUEST-2',
      ],
      unsupportedInferences: [
        'That 83% in cirrhosis was a competitive result — it was superiority against a 70% historical benchmark, not against a concurrent comparator',
        'That resistance had resolved in the half of failures where it became undetectable; population sequencing sees only variants above roughly 15 to 20% of the population',
        'That the QUEST comparisons isolate simeprevir cleanly; the simeprevir arm used response-guided durations of 24 or 48 weeks against a fixed 48 weeks on placebo',
        'That a tenfold in-vitro potency loss predicts the size of the clinical loss; the authors report Q80K had only a minor effect on initial response and a larger one on sustained response',
      ],
      whatFailedInitially: [
        'Q80K, a naturally occurring polymorphism present in nearly three in ten genotype 1a infections before any treatment',
        'A label that strongly recommended screening for it and strongly recommended considering alternative therapy if found',
        'A second pharmacogenetic marker, IFNL3, with lower response in CT and TT genotypes',
        'Photosensitivity and rash attributable to the molecule’s own aromatic system',
        'The highest projected manufacturing cost of the five hepatitis C antivirals independently costed',
      ],
      realWorldOutcome: [
        'Approved November 2013 as one of the first once-daily single-tablet protease inhibitors, replacing the twice-daily boceprevir and telaprevir era',
        'No longer licensed for use in the United States; the NCBI pharmacogenetics summary was archived on that basis in July 2020',
        'Its failure mode became a design specification: both current protease inhibitors state explicitly that Q80K does not reduce their activity',
        'The clearest worked example on this site of a drug defeated by a variant that was present in the population before the drug existed',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule, once daily with food — no longer marketed in the United States',
      description:
        'One 150 mg capsule once daily with food, in combination with sofosbuvir or with peginterferon alfa and ribavirin, for 12 weeks. Never available as a fixed-dose combination. The product has been discontinued in the United States.',
      safetyProfile:
        'Rash occurred in 24% against 11% on placebo and photosensitivity in 4% against under 1% in QUEST-2; the photosensitivity follows from the molecule’s extended aromatic system rather than from the regimen. Transient hyperbilirubinaemia without transaminase change is characteristic and reflects inhibition of bilirubin transporters rather than liver injury. Simeprevir is an OATP1B1 substrate and a CYP3A substrate, so strong inducers reduce exposure substantially. Discontinuation for adverse events was under 1% in QUEST-1 and 3% in the cirrhotic OPTIMIST-2 population.',
    },
    commonQuestions: [
      {
        q: 'What is Q80K and why did it matter so much?',
        a: 'It is a single amino acid difference at position 80 of the hepatitis C protease — glutamine replaced by lysine — and it is not caused by treatment. It occurs naturally in the circulating virus population, and when the simeprevir programme sequenced 2,007 patients before treatment it found Q80K in 29.5% of genotype 1a infections and 0.5% of genotype 1b. In the laboratory it makes simeprevir about ten times less potent. The reason it lands on this drug and not on the ones that followed is architectural: simeprevir is a macrocycle spanning the P1 to P3 subsites of the enzyme, which brings its contacts close to residue 80. Grazoprevir and glecaprevir are macrocycles spanning P2 to P4, and both of their labels record that Q80K does not reduce their activity.',
      },
      {
        q: 'Did the drug actually work?',
        a: 'Yes, and the evidence for it is better controlled than for several drugs still in use. QUEST-1 and QUEST-2 were double-blind and placebo-controlled: everyone received the same interferon and ribavirin backbone, and only the simeprevir-or-placebo assignment was randomised. Sustained response was 80% against 50% in one trial and 81% against 50% in the other, with adjusted differences of about thirty percentage points and p values below 0.0001. That is a real effect measured properly. What ended the drug was not that it failed to work but that a third of the patients it was chiefly meant for carried a variant that blunted it, and that better drugs arrived within two years.',
      },
      {
        q: 'What happened to resistance after treatment failed?',
        a: 'It appeared almost universally and then became hard to see. Among patients in whom simeprevir failed, 91.4% carried emerging mutations at NS3 positions 80, 122, 155 or 168 — mainly R155K in genotype 1a and D168V in genotype 1b — conferring more than fiftyfold resistance. At the end of the studies, a median of about 28 weeks later, half of those mutations were no longer detectable by population sequencing. That is not the same as being gone. Population sequencing only reports variants making up roughly a fifth or more of the viral population; a resistant strain that has been outcompeted back down to a few per cent is invisible on that assay and still present in the pool. It is a good example of a result that reads as reassuring and means something narrower than it sounds.',
        auditNote:
          'The paper reports both timepoints, which is the right thing to do. Quoting only the follow-up figure would be the error.',
      },
      {
        q: 'Was 83% in cirrhosis a good result?',
        a: 'It depends entirely on the comparator, and the comparator was constructed. OPTIMIST-2 was a single-arm, open-label study of 103 cirrhotic genotype 1 patients whose primary endpoint was SVR12 measured against a composite historical control of 70%. It reached 83% and was reported as superior. There was no concurrent control group. At the time, other regimens in the same population were reporting cure rates in the mid-nineties, so a statistically superior result against a historical benchmark and a competitive result in clinical practice were two different things. Superiority against a number assembled from earlier trials is a legitimate regulatory design and a weak basis for choosing between drugs available at the same moment.',
      },
      {
        q: 'Why keep a page for a drug nobody can get?',
        a: 'Because the failure is more instructive than most successes. Simeprevir is the cleanest worked example of a drug defeated by variation that already existed in the population before the drug did. That is not a manufacturing problem or a trial-design problem; it is a consequence of where the molecule chose to grip its target. The lesson was absorbed directly: the two protease inhibitors in routine use today were designed with a different ring architecture specifically so that this polymorphism could not touch them, and both labels say so. A reader trying to understand why glecaprevir’s label bothers to state that Q80K has no effect is reading a sentence written about this drug.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Jacobson IM et al. Simeprevir with pegylated interferon alfa 2a plus ribavirin in treatment-naive patients with chronic hepatitis C virus genotype 1 infection (QUEST-1): a phase 3, randomised, double-blind, placebo-controlled trial. Lancet 2014;384:403-413',
        identifier: '10.1016/S0140-6736(14)60494-3',
        kind: 'doi',
      },
      {
        label:
          'Manns M et al. Simeprevir with pegylated interferon alfa 2a or 2b plus ribavirin in treatment-naive patients with chronic hepatitis C virus genotype 1 infection (QUEST-2). Lancet 2014;384:414-426',
        identifier: '10.1016/S0140-6736(14)60538-9',
        kind: 'doi',
      },
      {
        label:
          'Lenz O et al. Virology analyses of HCV isolates from genotype 1-infected patients treated with simeprevir plus peginterferon/ribavirin in Phase IIb/III studies. J Hepatol 2015;62:1008-1014',
        identifier: '10.1016/j.jhep.2014.11.032',
        kind: 'doi',
      },
      {
        label:
          'Lawitz E et al. Simeprevir plus sofosbuvir in patients with chronic hepatitis C virus genotype 1 infection and cirrhosis: a phase 3 study (OPTIMIST-2). Hepatology 2016;64:360-369',
        identifier: '10.1002/hep.28422',
        kind: 'doi',
      },
      {
        label:
          'Dean L. Simeprevir therapy and IFNL3 genotype. In: Medical Genetics Summaries [Internet]. Bethesda (MD): National Center for Biotechnology Information; 2016, updated and archived 15 July 2020 because simeprevir is no longer licensed for use in the USA',
        identifier: '28520373',
        kind: 'pmid',
      },
      {
        label:
          'Hill A, Khoo S, Fortunak J, Simmons B, Ford N. Minimum costs for producing hepatitis C direct-acting antivirals for use in large-scale treatment access programs in developing countries. Clin Infect Dis 2014;58:928-936',
        identifier: '10.1093/cid/ciu012',
        kind: 'doi',
      },
      {
        label: 'QUEST-1: simeprevir against placebo on peginterferon alfa-2a plus ribavirin',
        identifier: 'NCT01289782',
        kind: 'nct',
      },
      {
        label: 'QUEST-2: simeprevir against placebo on peginterferon alfa-2a or 2b plus ribavirin',
        identifier: 'NCT01290679',
        kind: 'nct',
      },
      {
        label: 'OPTIMIST-2: simeprevir with sofosbuvir in genotype 1 cirrhosis',
        identifier: 'NCT02114151',
        kind: 'nct',
      },
      {
        label: 'PubChem CID 24873435 — simeprevir structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/24873435',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 13. Adefovir dipivoxil — a drug that failed in HIV at 120 mg with 17% renal tubular damage and
  //     no benefit, and was approved for hepatitis B at a twelfth of that dose. The trial that
  //     approved it also shows what the higher dose would have bought, and what it would have cost.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'adefovir-dipivoxil',
    name: 'Adefovir Dipivoxil',
    tradeName: 'Hepsera',
    sponsor: 'Gilead Sciences',
    targetGene:
      'HBV P gene, reverse transcriptase domain — a hepatitis B viral gene, not a human one',
    targetProtein:
      'Hepatitis B virus reverse transcriptase, the polymerase domain of the viral P protein',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2002,
    indication:
      'Chronic hepatitis B in patients aged 12 years and older with evidence of active viral replication and either persistently elevated serum aminotransferases or histologically active disease, including patients with lamivudine-resistant virus and compensated or decompensated liver function',
    patientFriendlyIndication: 'Long-standing hepatitis B infection of the liver',
    anatomicalSite:
      'Hepatocyte cytoplasm for the antiviral effect — and the proximal tubule of the kidney, which is where the dose-limiting damage happens',
    conditionContext: {
      conditionExplainer:
        'Hepatitis B copies itself by first making an RNA transcript and then reverse-transcribing it back into DNA inside its own shell. Nucleotide analogues jam that step. What varies between them is how much of the drug the body will tolerate before the kidney complains.',
      whyItMatters:
        'Adefovir is the clearest case in this collection of a drug whose dose was set by toxicity rather than by efficacy. Its own registrational trial tested 10 mg and 30 mg side by side: the higher dose worked visibly better and produced more renal abnormalities, and the lower one was approved.',
      whoTakesThis:
        'Very few people now. It has been superseded by entecavir and tenofovir, which suppress the virus far more completely and select resistance far less often. Anyone taking it needs renal monitoring, and anyone stopping it needs hepatic monitoring.',
      clinicalGoals:
        'Histologic improvement, reduced HBV DNA and normalised liver enzymes — the endpoints its trials measured. Cure is not among them: like every hepatitis B nucleos(t)ide, it never reaches the cccDNA in the nucleus.',
    },
    oneSentenceVerdict:
      'A nucleotide analogue that failed in HIV at 120 mg — no virologic or immunologic benefit against placebo in 505 patients with advanced disease, and proximal renal tubular dysfunction in 17% against 0.4% — and was then approved for hepatitis B at 10 mg, where it produced histologic improvement in 53% against 25% on placebo but suppressed HBV DNA below detection in only 21% of patients and reached a cumulative 30% resistance by five years.',
    laymanHowItWorks:
      'Adefovir is a counterfeit version of one of the four DNA building blocks, wrapped in two chemical groups that let it be swallowed. The gut and blood strip those groups off, cells add two phosphates, and the resulting molecule is picked up by the hepatitis B copying enzyme instead of the real building block. Once it is inserted, the chain cannot be extended and copying stops. The problem is that the kidney’s proximal tubule concentrates this class of molecule, and at the doses that would suppress the virus completely, it damages that tubule.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 52,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$21.73 per tablet, median across the two listed products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'What pharmacies pay to acquire the generic tablet, not what a patient is charged: United States list prices are not published and net prices after rebates are confidential by contract. Worth noting against the neighbouring entecavir page, which is surveyed at US$0.2134 per tablet — a hundredfold less for a drug that is better on every measured endpoint. No per-dose cost of production has been published for adefovir dipivoxil, so no markup is stated.',
      synthesisComplexity: 'Moderate',
      costSource: {
        label:
          'Nearest published cost-of-production analysis in this disease area: Hill A, Gotham D, Cooke G, Bhagani S, Andrieux-Meyer I, Cohn J, Fortunak J. Analysis of minimum target prices for production of entecavir to treat hepatitis B in high- and low-income countries. J Virus Erad 2015;1:103-110. It costs entecavir and tenofovir disoproxil fumarate and does NOT cover adefovir dipivoxil, which is why the synthesis cost field on this page is empty.',
        identifier: '10.1016/S2055-6640(20)30484-2',
        kind: 'doi',
      },
      priceSource: {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey, generic listing effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    },
    substitutes: {
      summary:
        'Both first-line hepatitis B drugs are better than this one on every measured endpoint, and one of them is a close chemical relative that solved the exact problem adefovir could not. Tenofovir is the same kind of nucleotide with a prodrug that delivers far more active drug to the liver per unit of kidney exposure.',
      conventionalRx: [
        {
          name: 'Tenofovir disoproxil fumarate (Viread)',
          class: 'Nucleotide analogue reverse transcriptase inhibitor — the successor molecule',
          howItCompares:
            'The same chemical family, given at 300 mg where adefovir stops at 10 mg, because its prodrug and its therapeutic index allow it. Far more complete viral suppression, no clinically significant resistance identified after years of use, and active against lamivudine-resistant virus.',
          typicalCost:
            'Not listed in the CMS National Average Drug Acquisition Cost survey consulted for this page',
          prosAndCons:
            'Pros: much stronger suppression, no established resistance pathway. Cons: still requires renal and bone monitoring with long-term use of this prodrug form.',
        },
        {
          name: 'Entecavir (Baraclude)',
          class: 'Nucleoside analogue reverse transcriptase inhibitor',
          howItCompares:
            'Undetectable HBV DNA in 67% of HBeAg-positive and 90% of HBeAg-negative patients at 48 weeks, against 21% and 51% for adefovir, and cumulative resistance of 1.2% at five years against 30%. It is also roughly a hundred times cheaper per tablet at surveyed acquisition cost.',
          typicalCost:
            'US$0.2134 per tablet, median across the 21 listed products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: better on every endpoint and far cheaper. Cons: largely inactive against lamivudine-resistant virus, where adefovir retains activity.',
        },
        {
          name: 'Tenofovir alafenamide (Vemlidy)',
          class: 'A second-generation prodrug of the same nucleotide',
          howItCompares:
            'Delivers the same active molecule with roughly a tenth of the circulating drug exposure, which is what reduces the renal and bone signal that limits this whole chemical class.',
          typicalCost:
            'Not listed in the CMS National Average Drug Acquisition Cost survey consulted for this page',
          prosAndCons:
            'Pros: the best renal profile in the class. Cons: on patent in most markets, so far more expensive than the generics above.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Ask when your kidney function is next being checked',
          action:
            'Ask specifically for serum creatinine and phosphate, and mention any other drug you take that affects the kidney.',
          patientImpact:
            'In patients at risk of or with underlying renal dysfunction, chronic administration may cause nephrotoxicity, which is one of four items in this drug’s boxed warning. In the HIV programme at a twelvefold higher dose, proximal renal tubular dysfunction occurred in 17% of patients within a year.',
          clinicalPrecaution:
            'The damage is to the proximal tubule, so it can appear as phosphate wasting before creatinine moves. Dose adjustment is required as renal function falls.',
        },
        {
          name: 'Get an HIV test before the first tablet, and do not stop without supervision',
          action:
            'Confirm your HIV status is documented, and treat stopping this drug as a decision that needs monitoring for several months afterwards.',
          patientImpact:
            'HIV resistance can emerge in someone with unrecognised or untreated HIV given a hepatitis B drug with anti-HIV activity. Separately, severe acute exacerbations of hepatitis have been reported after stopping anti-hepatitis B therapy.',
          clinicalPrecaution:
            'Both are in the boxed warning. The post-discontinuation flare happens because the nuclear cccDNA reservoir is untouched and replication restarts from an intact template.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(C)(C)C(=O)OCOP(=O)(COCCN1C=NC2=C(N=CN=C21)N)OCOC(=O)C(C)(C)C',
      chemicalFormula: 'C20H32N5O8P',
      molecularWeight: '501.50 g/mol',
      targetReceptorAffinity:
        'Adefovir diphosphate competes with deoxyadenosine triphosphate at the HBV reverse transcriptase and terminates the growing DNA chain. The clinically decisive numbers are the resistance fold-changes rather than the wild-type potency: the rtN236T substitution confers a 4- to 14-fold reduction in susceptibility, rtA181V 2.5- to 4.2-fold and rtA181T 1.3- to 1.9-fold. Those are small numbers by the standards of this collection, and they were enough — because the approved dose leaves so little margin above the concentration needed to suppress the virus.',
      structureSource: {
        label:
          'PubChem CID 60871 (adefovir dipivoxil) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/60871',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'adv-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm both pivaloyloxymethyl groups are present, and count the free adefovir',
          description:
            'Verify the adenine, the acyclic phosphonate, and both pivaloyloxymethyl esters, and quantify free adefovir as an impurity. The two ester groups are the entire reason the drug can be swallowed — the parent phosphonate carries a permanent negative charge and is essentially not absorbed orally — and each one releases a molecule of pivalic acid when it is cleaved in vivo, which is why the HIV trials of this molecule co-administered L-carnitine.',
          reagentsAndBuffer:
            'HPLC with ultraviolet detection at 260 nm against adefovir and adefovir dipivoxil reference standards, 1H and 31P NMR in DMSO-d6, ion chromatography for pivalate, Karl Fischer titration',
        },
        {
          id: 'adv-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Alkylate adenine, install the phosphonate, then double-esterify',
          description:
            'Alkylate the N9 of adenine with a 2-haloethyl ether, attach the phosphonomethyl group, then convert the phosphonic acid to the bis(pivaloyloxymethyl) ester. Regiochemistry at adenine is the classic failure point: N7 alkylation gives an isomer with identical mass and no antiviral activity, and it is the impurity that has to be controlled from the first step rather than the last.',
          dependsOnStepId: 'adv-w1',
          reagentsAndBuffer:
            'Adenine with sodium hydride or caesium carbonate in DMF, 2-chloroethyl or 2-bromoethyl ether reagent, diethyl p-toluenesulfonyloxymethylphosphonate with a strong base, bromotrimethylsilane for dealkylation, chloromethyl pivalate with triethylamine in NMP',
        },
        {
          id: 'adv-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallise, and control hydrolysis back to the parent phosphonate',
          description:
            'Crystallise the diester and separate it from the mono-ester and from free adefovir. The compound hydrolyses in water — which is the point of the design in vivo and a liability on the bench — so purification and storage are moisture-controlled, and the mono-ester is both a synthetic intermediate and a degradation product, meaning its level says nothing about the route unless the stability data are read alongside.',
          dependsOnStepId: 'adv-w2',
          reagentsAndBuffer:
            'Anhydrous crystallisation from methanol or ethyl acetate-heptane, N7 regioisomer and mono-ester reference standards, HPLC purity with forced-degradation stress testing, controlled humidity storage',
        },
        {
          id: 'adv-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Dose HepG2.2.15 cells alongside a renal proximal tubule model',
          description:
            'Measure antiviral activity in a hepatitis B-producing hepatocyte line and, in the same experiment, cytotoxicity in a proximal renal tubule model expressing the organic anion transporter OAT1. For this molecule the therapeutic index is the whole story: OAT1 actively concentrates acyclic nucleotide phosphonates into the proximal tubule, so a potency number without a matched tubular toxicity number describes half the drug.',
          dependsOnStepId: 'adv-w3',
          reagentsAndBuffer:
            'HepG2.2.15 or HepAD38 cells with quantitative PCR of secreted HBV DNA, OAT1-transfected proximal tubule cells with probenecid as a transport-inhibition control, LC-MS/MS for intracellular adefovir diphosphate, matched viability readout for a selectivity index',
        },
        {
          id: 'adv-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'The rtN236T and rtA181 panel, and why small fold-changes matter here',
          description:
            'Measure susceptibility against rtN236T, rtA181V and rtA181T mutants and report the fold-change against the drug exposure the approved dose actually achieves. The fold-changes are modest — 4 to 14, 2.5 to 4.2 and 1.3 to 1.9 — and the clinical resistance rate reached a cumulative 30% by five years. That combination is only intelligible if the exposure headroom is reported too: a dose capped by kidney toxicity leaves almost no margin, so a fourfold shift is enough to fail.',
          dependsOnStepId: 'adv-w4',
          reagentsAndBuffer:
            'Site-directed HBV reverse transcriptase mutants rtN236T, rtA181V and rtA181T and the double combinations, transient transfection into Huh7 or HepG2, quantitative PCR of secreted HBV DNA, EC50 fold-change against matched wild-type, plasma exposure data from the 10 mg and 30 mg arms for context',
        },
      ],
    },
    keyAudits: [
      {
        id: 'adv-a1',
        category: 'failed',
        title: 'It failed in HIV first: no benefit, and renal tubular damage in 17%',
        laymanSummary:
          'Before it was a hepatitis B drug, adefovir was tested for HIV at twelve times the dose. In 505 patients with advanced disease it produced no survival benefit, no CD4 benefit and no measurable fall in HIV levels — and damaged the kidney tubules of 17% of them within a year.',
        technicalDetails:
          'A randomised, double-blind, placebo-controlled trial assigned 253 patients with advanced HIV to adefovir dipivoxil 120 mg daily and 252 to placebo, added to background antiretroviral therapy. Deaths were 17 and 16 (P=0.88) and cytomegalovirus disease 4 and 8 (P=0.25). Mean change in log10 plasma HIV RNA was +0.09 with adefovir against -0.03 with placebo at 6 months (P=0.22) and +0.06 against -0.02 at 12 months (P=0.87). CD4 changes did not differ. Cumulative proximal renal tubular dysfunction at 12 months was 17% with adefovir against 0.4% with placebo (P<0.0001, log rank). Median time to resolution was 15 weeks and 16% of affected patients had not fully resolved 41 weeks after onset. The authors concluded the study did not support the use of adefovir for advanced HIV disease. A separate 442-patient trial at the same dose found a 0.4 log10 HIV RNA decline with no CD4 change, alongside elevated hepatic enzymes, gastrointestinal complaints and weight loss — and every patient in it received supplementary L-carnitine, because the prodrug releases pivalic acid.',
        evidenceSource:
          'Fisher EJ et al., AIDS 2001;15:1695-1700; Kahn J et al., JAMA 1999;282:2305-2312',
        doi: '10.1097/00002030-200109070-00013',
        measuredMetric:
          'Proximal renal tubular dysfunction 17% against 0.4% at 12 months at the 120 mg HIV dose, with no virologic or immunologic benefit',
        auditFlag: 'caution',
      },
      {
        id: 'adv-a2',
        category: 'measured',
        title: 'At 10 mg in hepatitis B it beat placebo on liver biopsy, 53% against 25%',
        laymanSummary:
          'Five hundred and fifteen patients were randomly assigned adefovir or a dummy tablet for a year. Just over half the treated patients had measurably less inflammation on biopsy, against a quarter on placebo.',
        technicalDetails:
          'Study GS-98-437 randomised 515 HBeAg-positive patients to adefovir dipivoxil 10 mg (n=172), 30 mg (n=173) or placebo (n=170) daily for 48 weeks, with histologic improvement in the 10 mg group against placebo as the primary endpoint. Histologic improvement occurred in 53%, 59% and 25% (both P<0.001). Median HBV DNA reduction was 3.52, 4.76 and 0.55 log copies/mL. Undetectable HBV DNA below 400 copies/mL was 21%, 39% and 0%. ALT normalisation was 48%, 55% and 16%. HBeAg seroconversion was 12%, 14% and 6% (P=0.049 and P=0.01). No adefovir resistance mutations were identified at week 48. A placebo-controlled trial with a liver biopsy endpoint is a stronger design than most hepatitis B evidence, and it is worth crediting.',
        evidenceSource:
          'Marcellin P et al., N Engl J Med 2003;348:808-816 (Adefovir Dipivoxil 437 Study Group)',
        doi: '10.1056/NEJMoa020681',
        measuredMetric:
          'Histologic improvement at week 48: 53% at 10 mg and 59% at 30 mg against 25% on placebo',
        auditFlag: 'verified',
      },
      {
        id: 'adv-a3',
        category: 'measured',
        title: 'The same trial shows exactly what the higher dose bought, and what it cost',
        laymanSummary:
          'The trial tested two doses. The triple dose suppressed nearly twice as many patients’ virus below detection — and produced more side effects and more kidney abnormalities. The lower dose was the one approved.',
        technicalDetails:
          'Within study 437, the 30 mg arm reached 39% undetectable HBV DNA against 21% at 10 mg, a median 4.76 against 3.52 log reduction, and 59% against 53% histologic improvement. The authors record that the safety profile of the 10 mg dose was similar to placebo, whereas there was a higher frequency of adverse events and renal laboratory abnormalities at 30 mg, and they conclude that the 10 mg dose has a favourable risk-benefit profile for long-term treatment. This is unusually explicit: a registrational trial that measured its own dose-response for both efficacy and toxicity and published the trade-off rather than presenting only the chosen dose. It also explains everything downstream — the incomplete suppression and the resistance rate are consequences of a dose set by the kidney rather than by the virus.',
        evidenceSource:
          'Marcellin P et al., N Engl J Med 2003;348:808-816 (Adefovir Dipivoxil 437 Study Group)',
        doi: '10.1056/NEJMoa020681',
        measuredMetric:
          'Undetectable HBV DNA 39% at 30 mg against 21% at 10 mg, with more adverse events and renal laboratory abnormalities at 30 mg',
        auditFlag: 'verified',
      },
      {
        id: 'adv-a4',
        category: 'measured',
        title: 'Replicated in HBeAg-negative disease, also against placebo',
        laymanSummary:
          'A second placebo-controlled trial in a different form of hepatitis B found the same pattern: 64% improved on biopsy against 33%, and half the treated patients had undetectable virus against none on placebo.',
        technicalDetails:
          'Study GS-98-438 randomised 185 HBeAg-negative patients 2:1 to adefovir dipivoxil 10 mg or placebo for 48 weeks, double-blind, with histologic improvement as the primary endpoint. Improvement occurred in 64% (77/121 evaluable) against 33% (19/57), P<0.001. HBV DNA fell below 400 copies/mL in 51% (63/123) against 0% (0/61), P<0.001, and ALT normalised in 72% (84/116) against 29%. The safety profile was similar to placebo and no adefovir resistance mutations were identified at 48 weeks. Placed beside the entecavir programme, which reached 90% undetectable in the same population, the gap in antiviral potency between the two drugs is visible in the same units.',
        evidenceSource:
          'Hadziyannis SJ et al., N Engl J Med 2003;348:800-807 (Adefovir Dipivoxil 438 Study Group)',
        doi: '10.1056/NEJMoa021812',
        measuredMetric:
          'Histologic improvement 64% against 33% and undetectable HBV DNA 51% against 0% at week 48',
        auditFlag: 'verified',
      },
      {
        id: 'adv-a5',
        category: 'failed',
        title: 'Cumulative resistance of 30% at five years, against 1.2% for entecavir',
        laymanSummary:
          'By the fifth year of continuous treatment, three in ten patients had developed resistance. The drug that replaced it reaches just over one in a hundred over the same period, measured the same way.',
        technicalDetails:
          'In HBeAg-negative nucleoside-naive patients in study GS-98-438, isolates from 30 patients carried adefovir resistance-associated substitutions with a cumulative probability of 0%, 3%, 11%, 19% and 30% at weeks 48, 96, 144, 192 and 240. Twenty-two of those 30 had confirmed virologic failure and eight had substitutions without failure. In HBeAg-positive patients continuing long term after a median 235 weeks, 16 of 38 (42%) developed resistance substitutions in the setting of virologic failure. The substitutions are rtN236T and rtA181T/V, conferring only 4- to 14-fold, 1.3- to 1.9-fold and 2.5- to 4.2-fold reductions in susceptibility respectively. The entecavir label, using the same cumulative-probability method over identical weeks, reports 0.2%, 0.5%, 1.2%, 1.2% and 1.2%. The two figures are directly comparable and differ by a factor of twenty-five at five years.',
        evidenceSource:
          'Adefovir dipivoxil United States prescribing information, Microbiology, resistance (openFDA); entecavir comparison from BARACLUDE United States prescribing information, Clinical Pharmacology',
        measuredMetric:
          'Cumulative resistance probability 0%, 3%, 11%, 19%, 30% at weeks 48 to 240, against 0.2% to 1.2% for entecavir',
        auditFlag: 'caution',
      },
      {
        id: 'adv-a6',
        category: 'failed',
        title:
          'Four boxed warnings, one of them about the kidney the drug was already known to damage',
        laymanSummary:
          'The label carries four boxed warnings: hepatitis flares on stopping, kidney toxicity with long-term use, HIV resistance if HIV is present but untreated, and a rare metabolic complication shared by the whole drug class.',
        technicalDetails:
          'The boxed warning covers severe acute exacerbations of hepatitis after discontinuation, requiring hepatic monitoring for at least several months; nephrotoxicity from chronic administration in patients at risk of or with underlying renal dysfunction, requiring close renal monitoring and dose adjustment; emergence of HIV resistance in patients with unrecognised or untreated HIV infection given a hepatitis B therapy with anti-HIV activity; and lactic acidosis with severe hepatomegaly and steatosis, including fatal cases, as a nucleoside analogue class effect. The nephrotoxicity warning is the one worth reading against the history: the renal signal was established in the HIV programme years before this indication existed, and the hepatitis B dose was chosen to stay under it rather than to eliminate it.',
        evidenceSource:
          'Adefovir dipivoxil United States prescribing information, boxed warning and Warnings and Precautions 5.1 to 5.4 (openFDA drug label endpoint)',
        auditFlag: 'caution',
      },
      {
        id: 'adv-a7',
        category: 'conclusion_shift',
        title:
          'A drug rejected at one dose, approved at a twelfth of it, then superseded by its own relative',
        laymanSummary:
          'Adefovir failed in HIV at 120 mg, was approved for hepatitis B at 10 mg, and was then displaced by tenofovir — a chemically similar nucleotide that could safely be given at 300 mg because its delivery chemistry was better.',
        technicalDetails:
          'The three facts in sequence tell one story about therapeutic index rather than three separate stories. At 120 mg adefovir produced 17% proximal renal tubular dysfunction with no HIV benefit. At 10 mg it produced 21% and 51% undetectable HBV DNA in the two hepatitis B populations — real efficacy, incompletely delivered, because the dose was capped by the kidney. Tenofovir disoproxil fumarate, the same acyclic nucleotide phosphonate class with a different oral prodrug, is given at 300 mg and suppresses hepatitis B far more completely with no clinically significant resistance pathway identified. Tenofovir alafenamide went further, delivering the same active molecule at roughly a tenth of the plasma exposure. Adefovir is not a failed molecule; it is a molecule whose delivery chemistry was solved by its successors, and it retains a niche only where lamivudine resistance rules out entecavir.',
        evidenceSource:
          'Fisher EJ et al., AIDS 2001;15:1695-1700; Marcellin P et al., N Engl J Med 2003;348:808-816; adefovir dipivoxil United States prescribing information',
        doi: '10.1056/NEJMoa020681',
        auditFlag: 'verified',
      },
      {
        id: 'adv-a8',
        category: 'inferred',
        title: 'The endpoint was a biopsy score, and the outcome evidence belongs to lamivudine',
        laymanSummary:
          'Both approval trials measured what the liver looked like under a microscope after a year. Neither counted deaths, cancers or transplants — and the only hepatitis B trial that did tested a different drug.',
        technicalDetails:
          'Studies 437 and 438 used histologic improvement at week 48 as the primary endpoint, with viral load, ALT and seroconversion as secondary measures. The single randomised placebo-controlled trial in hepatitis B that measured clinical outcomes — hepatic decompensation, hepatocellular carcinoma, death — randomised 651 patients with cirrhosis or advanced fibrosis to lamivudine or placebo and found progression in 7.8% against 17.7% and cancer in 3.9% against 7.4%. Adefovir has never been randomised against placebo for those endpoints, and after that lamivudine result a placebo arm in hepatitis B became indefensible. The inference that better histology and lower viral load on adefovir translate into fewer cancers is reasonable and untested by randomisation — and it is a weaker inference here than for entecavir, because adefovir suppresses so much less completely.',
        evidenceSource:
          'Marcellin P et al., N Engl J Med 2003;348:808-816; Hadziyannis SJ et al., N Engl J Med 2003;348:800-807; Liaw YF et al., N Engl J Med 2004;351:1521-1531',
        doi: '10.1056/NEJMoa033364',
        inferredClaim:
          'That adefovir reduces hepatocellular carcinoma or decompensation — demonstrated by randomisation for lamivudine, extrapolated to adefovir from a biopsy score and a partial viral suppression',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'One 10 mg tablet a day — a dose set by the kidney',
        laymanDesc:
          'The approved dose is a twelfth of what was tested in HIV. The trial that approved it also tested triple this dose, which worked better and caused more kidney abnormalities.',
        molecularDetail:
          'Adefovir dipivoxil 10 mg once daily. In study 437 the 30 mg arm reached 39% undetectable HBV DNA against 21% at 10 mg, with a higher frequency of adverse events and renal laboratory abnormalities. Dose interval must be extended as creatinine clearance falls.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Two chemical wrappers come off on the way in',
        laymanDesc:
          'The molecule that works cannot be absorbed from the gut, so it is given wrapped in two ester groups that are stripped off after absorption.',
        molecularDetail:
          'Adefovir dipivoxil is the bis(pivaloyloxymethyl) prodrug of adefovir, an acyclic nucleotide phosphonate whose permanent negative charge prevents oral absorption. Each ester cleaved releases a molecule of pivalic acid, which depletes carnitine — the reason the HIV trials at 120 mg co-administered L-carnitine.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Phosphorylated twice and inserted into the growing viral DNA',
        laymanDesc:
          'Cells add two phosphates. The result looks enough like a real DNA building block that the viral copying enzyme picks it up.',
        molecularDetail:
          'Adefovir is converted to adefovir diphosphate, which competes with deoxyadenosine triphosphate at the HBV reverse transcriptase. Because the molecule is acyclic and lacks a 3-hydroxyl, incorporation terminates the chain.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Copying stops — but not completely at this dose',
        laymanDesc:
          'Viral DNA falls sharply but reaches undetectable in only a minority: one in five HBeAg-positive patients and half of HBeAg-negative ones after a year.',
        molecularDetail:
          'Median HBV DNA reduction 3.52 log copies/mL at 10 mg, with 21% below 400 copies/mL in HBeAg-positive and 51% in HBeAg-negative patients at week 48. For comparison, entecavir reached 67% and 90% in the same populations.',
        iconName: 'Ban',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Liver inflammation settles on biopsy',
        laymanDesc:
          'The endpoint the trials were built on was what the liver looked like under a microscope, and on that measure it clearly beat placebo.',
        molecularDetail:
          'Histologic improvement in 53% against 25% on placebo in HBeAg-positive disease and 64% against 33% in HBeAg-negative disease, both at week 48 and both P<0.001. ALT normalised in 48% and 72%.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And then the virus catches up',
        laymanDesc:
          'Because the dose is capped by kidney safety, there is very little margin. By five years, three in ten patients had resistant virus — twenty-five times the rate of the drug that replaced it.',
        molecularDetail:
          'Cumulative resistance probability 0%, 3%, 11%, 19% and 30% at weeks 48 to 240, driven by rtN236T and rtA181T/V, which confer only 1.3- to 14-fold reductions in susceptibility. Small fold-changes suffice when there is no exposure headroom.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'GS-98-437 (Marcellin 2003, N Engl J Med)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, three-arm dose comparison',
        sampleSize: 515,
        primaryEndpoint:
          'Histologic improvement at week 48 in the 10 mg group compared with placebo, HBeAg-positive chronic hepatitis B',
        endpointMet: true,
        statisticalPValue:
          '53% at 10 mg and 59% at 30 mg against 25% on placebo, both P<0.001; undetectable HBV DNA 21%, 39% and 0%',
        unreportedAdverseSignals:
          'The 30 mg arm was more effective on every virologic measure and produced a higher frequency of adverse events and renal laboratory abnormalities. The approved dose is therefore the less effective of the two the trial tested.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'GS-98-438 (Hadziyannis 2003, N Engl J Med)',
        phase: 'Phase 3, randomised 2:1, double-blind, placebo-controlled',
        sampleSize: 185,
        primaryEndpoint: 'Histologic improvement at week 48 in HBeAg-negative chronic hepatitis B',
        endpointMet: true,
        statisticalPValue:
          '64% (77/121) against 33% (19/57), P<0.001; HBV DNA below 400 copies/mL in 51% (63/123) against 0% (0/61)',
        unreportedAdverseSignals:
          'Long-term follow-up of this same cohort produced the cumulative resistance figures of 3%, 11%, 19% and 30% at years two through five, which the 48-week report could not show.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Fisher 2001, AIDS — adefovir dipivoxil 120 mg in advanced HIV',
        phase: 'Randomised, double-blind, placebo-controlled multicentre trial',
        sampleSize: 505,
        primaryEndpoint:
          'Survival, cytomegalovirus disease, plasma HIV RNA, CD4 count and grade 4 toxicity',
        endpointMet: false,
        statisticalPValue:
          '17 deaths against 16 (P=0.88); mean log10 HIV RNA change +0.09 against -0.03 at 6 months (P=0.22); proximal renal tubular dysfunction 17% against 0.4% at 12 months (P<0.0001)',
        unreportedAdverseSignals:
          'Median time to resolution of renal tubular dysfunction was 15 weeks and 16% of affected patients had not fully resolved 41 weeks after onset. The authors concluded the study did not support use of adefovir in advanced HIV disease.',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Histologic improvement 53% against 25% on placebo (HBeAg-positive) and 64% against 33% (HBeAg-negative) at week 48',
        'Undetectable HBV DNA in 21% and 51% at 10 mg, against 39% at 30 mg in the same trial',
        'Proximal renal tubular dysfunction 17% against 0.4% at the 120 mg HIV dose, with no virologic or immunologic benefit in 505 patients',
        'Cumulative resistance probability of 30% at 240 weeks, driven by rtN236T and rtA181T/V',
        'Resistance substitutions confer only 1.3- to 14-fold reductions in susceptibility in cell culture',
      ],
      unsupportedInferences: [
        'That adefovir reduces hepatocellular carcinoma or decompensation; the randomised outcome evidence in hepatitis B belongs to lamivudine',
        'That histologic improvement at 48 weeks predicts the five-year course, when 30% of the same cohort had developed resistance by then',
        'That 10 mg is the effective dose rather than the tolerable one — the trial’s own 30 mg arm suppressed nearly twice as many patients',
        'That a modest resistance fold-change implies a modest clinical problem; with no exposure headroom, fourfold was enough',
      ],
      whatFailedInitially: [
        'Rejected in HIV: no survival, CD4 or viral load benefit at 120 mg, with 17% proximal renal tubular dysfunction',
        'Kidney toxicity capped the hepatitis B dose below the dose the same trial showed to be more effective',
        'Undetectable HBV DNA in only 21% of HBeAg-positive patients at a year, against 67% for entecavir',
        'Cumulative resistance of 30% at five years, twenty-five times the entecavir figure measured the same way',
        'Four boxed warnings, including nephrotoxicity and severe hepatitis flares on discontinuation',
      ],
      realWorldOutcome: [
        'Approved September 2002 under NDA 021449 as the first nucleotide analogue for hepatitis B, and the first drug with activity against lamivudine-resistant virus',
        'Superseded by tenofovir disoproxil fumarate — the same chemical class with a prodrug that allows a thirtyfold higher dose',
        'Long generic; surveyed acquisition price of US$21.73 per tablet against US$0.2134 for entecavir, which is better on every endpoint',
        'Retains a narrow role where lamivudine resistance rules out entecavir and tenofovir is unavailable',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, once daily, with or without food',
      description:
        'One 10 mg tablet once daily, taken indefinitely. The dosing interval must be lengthened as creatinine clearance falls, and renal function is monitored throughout because the dose sits close to the threshold at which this chemical class damages the proximal tubule.',
      safetyProfile:
        'Four boxed warnings: severe acute exacerbations of hepatitis after discontinuation, requiring hepatic monitoring for at least several months; nephrotoxicity with chronic administration in patients at risk of or with underlying renal dysfunction; emergence of HIV resistance if given to someone with unrecognised or untreated HIV; and lactic acidosis with severe hepatomegaly and steatosis as a nucleoside analogue class effect. At the approved 10 mg dose the trial safety profile was similar to placebo over 48 weeks; the renal signal is a long-term and dose-related one, established at 120 mg in the HIV programme where 17% developed proximal renal tubular dysfunction within a year.',
    },
    commonQuestions: [
      {
        q: 'Why is the hepatitis B dose so much lower than the HIV dose was?',
        a: 'Because the kidney set the ceiling and hepatitis B happened to be treatable underneath it. At 120 mg for HIV, adefovir produced proximal renal tubular dysfunction in 17% of patients within a year against 0.4% on placebo, and no benefit at all — no survival difference, no CD4 change, no fall in HIV RNA. At 10 mg for hepatitis B, the safety profile over 48 weeks was similar to placebo and the drug still worked, because hepatitis B is more susceptible to this molecule than HIV is. The registrational trial makes the trade explicit: it also tested 30 mg, which suppressed the virus in nearly twice as many patients and produced more renal laboratory abnormalities. The approved dose is the tolerable one, not the most effective one the trial found.',
        auditNote:
          'It is unusual for a registrational trial to publish the dose it did not choose alongside the one it did. Study 437 does, and the whole shape of the drug follows from it.',
      },
      {
        q: 'Why does resistance develop so much faster than with entecavir?',
        a: 'Because there is no margin. The resistance substitutions themselves are unimpressive: rtN236T costs 4- to 14-fold in cell culture, rtA181V 2.5- to 4.2-fold and rtA181T only 1.3- to 1.9-fold. Against a drug with plenty of headroom over the concentration needed to suppress the virus, a fourfold shift is survivable. Against a drug whose dose is capped by kidney toxicity and which only drives one in five patients below the limit of detection, fourfold is enough to let the virus back. The result, measured by the same cumulative-probability method over the same weeks in both labels, is a resistance rate of 30% at five years for adefovir against 1.2% for entecavir.',
      },
      {
        q: 'Is this still a reasonable drug to be on?',
        a: 'For most people, no, and the comparison is not close. Entecavir drives hepatitis B DNA below the limit of detection in 67% of HBeAg-positive and 90% of HBeAg-negative patients at a year, against 21% and 51% for adefovir, with a five-year resistance rate of 1.2% against 30%, and at a surveyed acquisition price of about twenty cents a tablet against twenty-one dollars. Tenofovir is stronger still and retains activity against lamivudine-resistant virus, which is the one setting where adefovir was genuinely useful. If you are taking adefovir, that is a reasonable thing to raise with whoever prescribes it, not a reason to stop on your own — stopping abruptly can trigger a severe hepatitis flare.',
      },
      {
        q: 'What is pivalic acid and why did the HIV trials give people carnitine?',
        a: 'The active molecule, adefovir, carries a permanently charged phosphonate group and is essentially not absorbed when swallowed. To make an oral drug, two pivaloyloxymethyl groups were attached, and those are cleaved off after absorption to release the working molecule. Each cleavage also releases pivalic acid, which the body clears by conjugating it to carnitine and excreting the pair — so a sustained dose steadily depletes carnitine. At the 120 mg HIV dose this mattered enough that every patient in the JAMA trial received 500 mg of L-carnitine daily alongside the drug. At the 10 mg hepatitis B dose the pivalate burden is twelve times smaller and is not managed this way. It is a good example of a side effect that belongs to the delivery chemistry rather than to the drug.',
      },
      {
        q: 'Was adefovir a failure?',
        a: 'It is better described as an unfinished molecule than a failed one. What it demonstrated was real: the first nucleotide analogue for hepatitis B, the first drug with activity against lamivudine-resistant virus, and two properly placebo-controlled trials with liver biopsy endpoints — a stronger design than much of what is on this site. What limited it was delivery. Tenofovir disoproxil fumarate is the same class of acyclic nucleotide phosphonate with a different oral prodrug, and that difference alone allows a 300 mg dose rather than 10 mg, with far more complete suppression and no established resistance pathway. Tenofovir alafenamide refined the delivery further. The chemistry adefovir proved was right; the way it was wrapped was not good enough.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Marcellin P et al. Adefovir dipivoxil for the treatment of hepatitis B e antigen-positive chronic hepatitis B. N Engl J Med 2003;348:808-816',
        identifier: '10.1056/NEJMoa020681',
        kind: 'doi',
      },
      {
        label:
          'Hadziyannis SJ et al. Adefovir dipivoxil for the treatment of hepatitis B e antigen-negative chronic hepatitis B. N Engl J Med 2003;348:800-807',
        identifier: '10.1056/NEJMoa021812',
        kind: 'doi',
      },
      {
        label:
          'Fisher EJ et al. The safety and efficacy of adefovir dipivoxil in patients with advanced HIV disease: a randomized, placebo-controlled trial. AIDS 2001;15:1695-1700',
        identifier: '10.1097/00002030-200109070-00013',
        kind: 'doi',
      },
      {
        label:
          'Kahn J et al. Efficacy and safety of adefovir dipivoxil with antiretroviral therapy: a randomized controlled trial. JAMA 1999;282:2305-2312',
        identifier: '10.1001/jama.282.24.2305',
        kind: 'doi',
      },
      {
        label:
          'Liaw YF et al. Lamivudine for patients with chronic hepatitis B and advanced liver disease. N Engl J Med 2004;351:1521-1531',
        identifier: '10.1056/NEJMoa033364',
        kind: 'doi',
      },
      {
        label:
          'Hill A, Gotham D, Cooke G, Bhagani S, Andrieux-Meyer I, Cohn J, Fortunak J. Analysis of minimum target prices for production of entecavir to treat hepatitis B in high- and low-income countries. J Virus Erad 2015;1:103-110',
        identifier: '10.1016/S2055-6640(20)30484-2',
        kind: 'doi',
      },
      {
        label:
          'Adefovir dipivoxil United States prescribing information — boxed warning and Microbiology resistance section (openFDA drug label endpoint)',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22ADEFOVIR+DIPIVOXIL%22',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA: HEPSERA (adefovir dipivoxil), NDA 021449, Gilead Sciences — original approval 20 September 2002',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021449',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 60871 — adefovir dipivoxil structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/60871',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 14. Telbivudine — approved for being better than the weakest drug in its class, a year after a
  //     far better one already existed. Discontinued, and the trial that would have made its best
  //     case was stopped early for nerve damage.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'telbivudine',
    name: 'Telbivudine',
    tradeName: 'Tyzeka (Sebivo outside the United States)',
    sponsor: 'Novartis (discovered at Idenix Pharmaceuticals)',
    targetGene:
      'HBV P gene, reverse transcriptase domain — a hepatitis B viral gene, not a human one',
    targetProtein:
      'Hepatitis B virus reverse transcriptase, the polymerase domain of the viral P protein',
    modality: 'Small Molecule',
    approvalStatus: 'Withdrawn from Market',
    approvalYear: 2006,
    indication:
      'Chronic hepatitis B in adults with evidence of viral replication and either persistently elevated serum aminotransferases or histologically active disease. Both United States presentations are recorded as discontinued in Drugs@FDA',
    patientFriendlyIndication:
      'Long-standing hepatitis B infection — a drug that is no longer marketed in the United States',
    anatomicalSite:
      'Hepatocyte cytoplasm for the antiviral effect — and skeletal muscle and peripheral nerve, which is where its characteristic toxicity appears',
    conditionContext: {
      conditionExplainer:
        'Hepatitis B copies itself by reverse-transcribing an RNA transcript back into DNA. Nucleoside analogues jam that step. What separates the drugs in this class is how many mutations the virus needs before it escapes.',
      whyItMatters:
        'Telbivudine is the clearest example in this collection of a comparator problem. It was approved on the strength of being better than lamivudine, the weakest drug in its class, in a trial that ran while entecavir — approved a year earlier and dramatically better than both — was already on the market.',
      whoTakesThis:
        'Nobody in the United States. Both Tyzeka presentations are recorded as discontinued in Drugs@FDA. The record is kept because the reasons it lost are measurable and instructive.',
      clinicalGoals:
        'Its trials used a composite "therapeutic response": HBV DNA below 5 log10 copies per millilitre, plus either HBeAg loss or normalised liver enzymes. That threshold is more than a hundred times above the limit of detection, and the composite is the audit.',
    },
    oneSentenceVerdict:
      'An L-nucleoside that beat lamivudine in a 1,370-patient double-blind trial — 63% against 48% therapeutic response and 25.1% against 39.5% resistance at two years — while entecavir, approved a year earlier, was already reaching 1.2% resistance at five; its combination trial with peginterferon was stopped early after peripheral neuropathy in 7 of 50 patients, and both United States presentations are now discontinued.',
    laymanHowItWorks:
      'Telbivudine is a mirror-image version of thymidine, one of the four building blocks of DNA. Cells add three phosphates to it, and the hepatitis B copying enzyme picks it up instead of the real thing. Once it is in the chain, the chain cannot be extended, so copying stops. Being a mirror image is what makes it selective for the viral enzyme rather than the human one — and it is also, in ways that were never fully explained, connected to the muscle and nerve problems that ended the drug.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 42,
    substitutes: {
      summary:
        'Both first-line hepatitis B drugs were available before telbivudine was withdrawn and both are better than it on the measure that decides long-term outcome, which is resistance. Neither was ever the comparator in its registrational programme.',
      conventionalRx: [
        {
          name: 'Entecavir (Baraclude)',
          class: 'Nucleoside analogue reverse transcriptase inhibitor',
          howItCompares:
            'Approved in 2005, a year before telbivudine. Cumulative resistance of 1.2% at five years against telbivudine’s 25.1% at two, and undetectable HBV DNA in 67% and 90% of the two populations at one year. It was never used as a comparator in the telbivudine programme.',
          typicalCost:
            'US$0.2134 per tablet, median across the 21 listed products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: a resistance barrier roughly twenty times higher, and generic. Cons: largely inactive against lamivudine-resistant virus.',
        },
        {
          name: 'Tenofovir disoproxil fumarate (Viread)',
          class: 'Nucleotide analogue reverse transcriptase inhibitor',
          howItCompares:
            'Also first-line, with no clinically significant resistance pathway identified after years of use, and active against lamivudine-resistant virus. Requires renal and bone monitoring in this prodrug form.',
          typicalCost:
            'Not listed in the CMS National Average Drug Acquisition Cost survey consulted for this page',
          prosAndCons:
            'Pros: no established resistance pathway; covers lamivudine-resistant virus. Cons: renal and bone monitoring.',
        },
        {
          name: 'Peginterferon alfa-2a (Pegasys)',
          class: 'Immune-stimulating protein given for a fixed course',
          howItCompares:
            'The only hepatitis B option with a defined end date and a real chance of surface antigen loss. Notably, the trial combining it with telbivudine was terminated early for peripheral neuropathy, so this pairing is specifically ruled out.',
          typicalCost:
            'US$1,070.90 per millilitre at United States pharmacy acquisition cost (CMS NADAC, brand, effective 23 April 2025)',
          prosAndCons:
            'Pros: finite course. Cons: injections and systemic toxicity; must never be combined with telbivudine.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC1=CN(C(=O)NC1=O)[C@@H]2C[C@H]([C@@H](O2)CO)O',
      chemicalFormula: 'C10H14N2O5',
      molecularWeight: '242.23 g/mol',
      targetReceptorAffinity:
        'Telbivudine is the beta-L enantiomer of thymidine — the unnatural mirror image of a natural DNA building block. Its triphosphate competes with thymidine triphosphate at the HBV reverse transcriptase and terminates the chain. Selectivity for the viral over the human polymerases follows from that unnatural stereochemistry. Resistance is conferred by a single substitution, rtM204I, which is the same position lamivudine resistance maps to, and a single-mutation escape route is what produced a 25.1% resistance rate at two years.',
      structureSource: {
        label: 'PubChem CID 159269 (telbivudine) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/159269',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ldt-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Prove the sugar is the L enantiomer, not the D',
          description:
            'Confirm that the deoxyribose is in the unnatural beta-L configuration. This is the single most important release test for the molecule: the beta-D compound with the identical formula and identical mass spectrum is thymidine, a normal human metabolite with no antiviral activity. Optical rotation and chiral chromatography, not mass spectrometry, are what distinguish the drug from a food component.',
          reagentsAndBuffer:
            'Optical rotation against a reference standard, chiral HPLC resolving beta-L from beta-D thymidine, 1H and 13C NMR in DMSO-d6, thymidine reference standard run as a deliberate negative control, Karl Fischer titration',
        },
        {
          id: 'ldt-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Build from an L-sugar, then glycosylate thymine',
          description:
            'Start from an L-configured sugar precursor rather than the abundant D-ribose pool, elaborate to the protected 2-deoxy-L-ribofuranose donor, and glycosylate thymine with beta selectivity. The chirality has to be built in from the starting material; it cannot be installed later. That constraint, not the coupling chemistry, is what makes L-nucleosides more expensive to manufacture than their natural counterparts.',
          dependsOnStepId: 'ldt-w1',
          reagentsAndBuffer:
            'L-configured sugar precursor such as L-arabinose or L-ribose, protecting groups for the 3- and 5-hydroxyls, silylated thymine with N,O-bis(trimethylsilyl)acetamide, trimethylsilyl triflate or a Lewis acid promoter, then deprotection',
        },
        {
          id: 'ldt-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallise, and set the specification for D-thymidine as an impurity',
          description:
            'Recrystallise and quantify residual beta-D thymidine and the alpha anomer. An enantiomeric impurity here is not merely inert: it is a natural nucleoside that will be incorporated into host DNA by normal salvage pathways, so the specification is written against a compound the assay must be able to see at low levels and the routine method cannot.',
          dependsOnStepId: 'ldt-w2',
          reagentsAndBuffer:
            'Aqueous ethanol or methanol recrystallisation, chiral stationary phase for enantiomeric excess, ion-pair or HILIC HPLC for the polar impurity profile, activated charcoal treatment',
        },
        {
          id: 'ldt-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Dose HepG2.2.15 cells alongside a skeletal muscle model',
          description:
            'Measure antiviral activity in a hepatitis B-producing hepatocyte line and, in parallel, mitochondrial function and creatine kinase release in differentiated myotubes. For this molecule the muscle arm is not optional: grade 3 or 4 creatine kinase elevations occurred in 12.9% of patients in the two-year trial against 4.1% on the comparator, and myopathy was the toxicity that defined the drug.',
          dependsOnStepId: 'ldt-w3',
          reagentsAndBuffer:
            'HepG2.2.15 or HepAD38 cells with quantitative PCR of secreted HBV DNA, differentiated C2C12 or primary human myotubes, mitochondrial DNA copy-number assay by quantitative PCR, lactate production and creatine kinase release readouts, LC-MS/MS for the triphosphate',
        },
        {
          id: 'ldt-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'The rtM204I panel, and report how many mutations escape actually needs',
          description:
            'Measure susceptibility against rtM204I with and without rtL180M and report the number of substitutions required for escape, not only the fold-change. That count is the number that predicted this drug’s trajectory: telbivudine, like lamivudine, is defeated by a single change at position 204, while entecavir requires those same changes plus a second-site substitution at 184, 202 or 250. One mutation against three is the whole difference between 25.1% resistance at two years and 1.2% at five.',
          dependsOnStepId: 'ldt-w4',
          reagentsAndBuffer:
            'Site-directed HBV reverse transcriptase mutants rtM204I and rtM204V with and without rtL180M, transient transfection into Huh7 or HepG2, quantitative PCR of secreted HBV DNA, EC50 fold-change against matched wild-type, entecavir and lamivudine run as reference comparators in the same plate',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ldt-a1',
        category: 'measured',
        title: 'GLOBE: it genuinely did beat lamivudine, in 1,370 double-blind patients',
        laymanSummary:
          'A large double-blind trial compared telbivudine against lamivudine for a year. Telbivudine did better on the trial’s composite endpoint and on liver biopsy, and reduced the virus further.',
        technicalDetails:
          'GLOBE randomised 1,370 patients with chronic hepatitis B to telbivudine 600 mg or lamivudine 100 mg once daily, double-blind. The primary endpoint was non-inferiority for therapeutic response, defined as HBV DNA below 5 log10 copies/mL together with either HBeAg loss or ALT normalisation. At week 52, HBeAg-positive patients had a therapeutic response in 75.3% against 67.0% (P=0.005) and a histologic response in 64.7% against 56.3% (P=0.01); telbivudine was non-inferior in HBeAg-negative patients. Telbivudine was superior in both populations on mean HBV DNA reduction, on the proportion reaching undetectable by PCR, and on resistance. Elevated creatine kinase was more common on telbivudine and elevated ALT and AST more common on lamivudine.',
        evidenceSource: 'Lai CL et al., N Engl J Med 2007;357:2576-2588 (GLOBE Study Group)',
        doi: '10.1056/NEJMoa066422',
        measuredMetric:
          'Therapeutic response 75.3% against 67.0% and histologic response 64.7% against 56.3% at week 52',
        auditFlag: 'verified',
      },
      {
        id: 'ldt-a2',
        category: 'inferred',
        title:
          'The comparator was the weakest drug in the class, a year after a far better one arrived',
        laymanSummary:
          'Telbivudine was measured against lamivudine, which by then was known to fail in about half of patients within five years. Entecavir had been approved a year earlier and was far better than either. The two were never compared.',
        technicalDetails:
          'GLOBE ran against lamivudine 100 mg. In the randomised cirrhosis trial that established the value of treating hepatitis B at all, genotypic YMDD resistance emerged in 49% of lamivudine-treated patients over a median 32 months, so lamivudine’s resistance liability was published and known before GLOBE reported. Entecavir was approved in March 2005, more than a year before telbivudine’s October 2006 approval, with cumulative resistance of 0.5% at 96 weeks and 1.2% at 240 weeks in nucleoside-naive patients. No registrational trial compared telbivudine with entecavir. A superiority claim against the weakest available agent is a true statement about a comparison nobody needed made, and it is the single fact that best explains this drug’s commercial trajectory.',
        evidenceSource:
          'Lai CL et al., N Engl J Med 2007;357:2576-2588; Liaw YF et al., N Engl J Med 2004;351:1521-1531; BARACLUDE United States prescribing information, resistance in clinical studies',
        doi: '10.1056/NEJMoa066422',
        inferredClaim:
          'That superiority to lamivudine implied a competitive place in therapy — the relevant comparator was already approved and was never tested against it',
        auditFlag: 'contested',
      },
      {
        id: 'ldt-a3',
        category: 'failed',
        title: 'A quarter of patients had resistant virus by two years',
        laymanSummary:
          'By the end of the second year, 25% of HBeAg-positive patients on telbivudine carried resistant virus. That was better than lamivudine’s 40%, and roughly twenty-five times the rate of the drug already on the market.',
        technicalDetails:
          'At week 104 of GLOBE, viral resistance had emerged in 25.1% of HBeAg-positive telbivudine patients against 39.5% on lamivudine (P<0.001), and in 10.8% against 25.9% of HBeAg-negative patients (P<0.001). Therapeutic response was 63% against 48% (P<0.001) and 78% against 66% (P=0.007), with undetectable viraemia below 300 copies/mL in 55.6% against 38.5% and 82.0% against 56.7%. The reason for the resistance rate is structural: telbivudine escape requires a single substitution at rtM204, the same position lamivudine resistance maps to, whereas entecavir requires those substitutions plus a further change at rtT184, rtS202 or rtM250. Escape that needs one mutation rather than three is a categorical difference, and it shows up as 25.1% at two years against 1.2% at five.',
        evidenceSource:
          'Liaw YF et al., Gastroenterology 2009;136:486-495 (2-year GLOBE results); entecavir comparison from BARACLUDE United States prescribing information',
        doi: '10.1053/j.gastro.2008.10.026',
        measuredMetric:
          'Viral resistance 25.1% (HBeAg-positive) and 10.8% (HBeAg-negative) at week 104',
        auditFlag: 'caution',
      },
      {
        id: 'ldt-a4',
        category: 'failed',
        title: 'The combination trial was stopped early for peripheral neuropathy in 7 of 50',
        laymanSummary:
          'A trial combining telbivudine with peginterferon was suppressing the virus better than either drug alone, and was terminated anyway because seven of the fifty patients on the combination developed nerve damage.',
        technicalDetails:
          'A randomised, open-label, multicentre study in treatment-naive HBeAg-positive patients compared telbivudine with peginterferon alfa-2a, telbivudine alone and peginterferon alone. It was terminated early after 159 of a planned 300 patients were randomised, because of increased rates of peripheral neuropathy in the combination group. Peripheral neuropathy occurred in 7 of 50 on combination therapy, 1 of 54 on telbivudine and 0 of 54 on peginterferon. At week 24, undetectable HBV DNA below 300 copies/mL was reached by 71% (12/17) on combination therapy, 35% (17/48) on telbivudine and 7% (3/42) on peginterferon (P=0.022 and P<0.0001). The authors state that despite the rapid and profound reductions in HBV DNA, combination therapy with telbivudine and peginterferon should not be used. This is the rare case where the most effective arm in a trial is the one that gets it stopped.',
        evidenceSource: 'Marcellin P et al., J Hepatol 2015;62:41-47',
        doi: '10.1016/j.jhep.2014.08.021',
        measuredMetric:
          'Peripheral neuropathy in 7 of 50 on combination therapy against 1 of 54 and 0 of 54; trial terminated at 159 of 300 planned patients',
        auditFlag: 'caution',
      },
      {
        id: 'ldt-a5',
        category: 'failed',
        title: 'Grade 3 or 4 creatine kinase elevations in one patient in eight',
        laymanSummary:
          'Muscle enzyme levels rose to severe grades in nearly 13% of patients on telbivudine, against 4% on the comparator. Muscle and nerve toxicity is the characteristic problem of this molecule.',
        technicalDetails:
          'Over the two-year GLOBE period, grade 3 or 4 increases in creatine kinase occurred in 12.9% of telbivudine patients against 4.1% on lamivudine (P<0.001), while overall adverse event frequency was similar. Creatine kinase is released from damaged skeletal muscle, and myopathy is the recognised class problem for this molecule; the separate peripheral neuropathy signal in the peginterferon combination trial is the nerve counterpart. A 12.9% rate of severe biochemical muscle injury in a drug taken indefinitely, when a better-tolerated and more effective alternative was already licensed, is the practical explanation for why this drug did not survive.',
        evidenceSource: 'Liaw YF et al., Gastroenterology 2009;136:486-495 (2-year GLOBE results)',
        doi: '10.1053/j.gastro.2008.10.026',
        measuredMetric: 'Grade 3 or 4 creatine kinase elevation 12.9% against 4.1% over two years',
        auditFlag: 'caution',
      },
      {
        id: 'ldt-a6',
        category: 'inferred',
        title: 'The primary endpoint was a composite, and its viral threshold was not undetectable',
        laymanSummary:
          'The trial’s main endpoint counted a patient as a success at a viral load more than a hundred times above the limit of detection, provided one of two other things had also happened.',
        technicalDetails:
          'Therapeutic response was defined as HBV DNA below 5 log10 copies/mL — that is, below 100,000 copies/mL — together with either HBeAg loss or ALT normalisation. The assay’s limit of detection in the same trial was 300 copies/mL, and the trial reports undetectable viraemia separately at 55.6% and 82.0%. So the headline 75.3% and 63% figures include patients still carrying tens of thousands of viral copies per millilitre. The composite also joins an immunological event (HBeAg loss) and a biochemical one (ALT normalisation) with an "or", meaning two patients counted as responders may share nothing except the viral threshold. None of this is hidden — the paper reports the components — but the number most often quoted is the composite.',
        evidenceSource:
          'Lai CL et al., N Engl J Med 2007;357:2576-2588; Liaw YF et al., Gastroenterology 2009;136:486-495',
        doi: '10.1056/NEJMoa066422',
        inferredClaim:
          'That a 75.3% or 63% "therapeutic response" means the virus was controlled — the threshold was 100,000 copies/mL, and undetectable viraemia was reported separately and lower',
        auditFlag: 'caution',
      },
      {
        id: 'ldt-a7',
        category: 'conclusion_shift',
        title: 'Both United States presentations are recorded as discontinued',
        laymanSummary:
          'Tyzeka is gone from the American market. The tablet and the oral solution are both listed as discontinued in the FDA’s own database.',
        technicalDetails:
          'Drugs@FDA records NDA 022011 (TYZEKA, telbivudine 600 mg tablet, Novartis) and NDA 022154 (TYZEKA, telbivudine 100 mg/5 mL oral solution, Novartis) with a marketing status of Discontinued. Nothing about the drug changed to cause this; what changed was the comparison. It was approved in October 2006 on superiority to lamivudine, with a single-mutation resistance pathway giving 25.1% resistance at two years, a 12.9% rate of severe creatine kinase elevation, and a combination trial subsequently stopped for peripheral neuropathy — in a field where entecavir had been licensed since March 2005 with 1.2% resistance at five years. The withdrawal is the field completing an arithmetic it could have done at approval.',
        evidenceSource:
          'Drugs@FDA application records NDA 022011 and NDA 022154 (TYZEKA, Novartis), marketing status Discontinued',
        auditFlag: 'verified',
      },
      {
        id: 'ldt-a8',
        category: 'inferred',
        title: 'The randomised outcome evidence in hepatitis B still belongs to lamivudine',
        laymanSummary:
          'Telbivudine was never randomised against placebo for deaths, cancers or liver failure. The one trial that measured those things tested lamivudine — the drug telbivudine was compared against.',
        technicalDetails:
          'GLOBE measured a composite of viral load, HBeAg status and liver enzymes at one and two years, with a histologic secondary endpoint. The only randomised placebo-controlled hepatitis B trial with clinical outcomes randomised 651 patients with cirrhosis or advanced fibrosis to lamivudine or placebo and found disease progression in 7.8% against 17.7% and hepatocellular carcinoma in 3.9% against 7.4%. The chain of inference for telbivudine therefore runs: lamivudine beats placebo on hard outcomes, telbivudine beats lamivudine on a surrogate composite, therefore telbivudine improves hard outcomes. Each link is real and the chain has never been tested end to end — and the middle link is undermined by the resistance data, since 25.1% of patients had escaped the drug by the point at which the lamivudine outcome trial was still accruing events.',
        evidenceSource:
          'Liaw YF et al., N Engl J Med 2004;351:1521-1531; Lai CL et al., N Engl J Med 2007;357:2576-2588',
        doi: '10.1056/NEJMoa033364',
        inferredClaim:
          'That telbivudine reduces cancer or decompensation — inferred through two links, neither of which measured that outcome for this drug',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'One 600 mg tablet a day',
        laymanDesc:
          'A single daily tablet, taken indefinitely, with creatine kinase checked because of the muscle problem.',
        molecularDetail:
          'Telbivudine 600 mg once daily with or without food. Renally cleared, so the dosing interval must be lengthened as creatinine clearance falls. Both United States presentations — the 600 mg tablet under NDA 022011 and the 100 mg/5 mL oral solution under NDA 022154 — are recorded as discontinued.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'A mirror image of a natural building block',
        laymanDesc:
          'Telbivudine is thymidine built the wrong way round. That reversed geometry is what lets the viral enzyme accept it while human enzymes largely do not.',
        molecularDetail:
          'The beta-L enantiomer of thymidine, phosphorylated by cellular kinases to the triphosphate. The unnatural L configuration is the basis of its selectivity for HBV reverse transcriptase over human DNA polymerases — and it is why an enantiomeric impurity in manufacture would simply be thymidine.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It is inserted, and the chain stops',
        laymanDesc:
          'The viral copying enzyme picks it up instead of the real building block, and then finds it has nothing to attach the next piece to.',
        molecularDetail:
          'Telbivudine triphosphate competes with thymidine triphosphate at the HBV reverse transcriptase and terminates the growing DNA chain. It has no meaningful activity against HIV or other viruses.',
        iconName: 'Ban',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Virus falls further than on lamivudine',
        laymanDesc:
          'More patients reached undetectable virus than on the older drug — 56% against 39% in one group and 82% against 57% in the other.',
        molecularDetail:
          'Undetectable viraemia below 300 copies/mL at week 104 in 55.6% of HBeAg-positive telbivudine patients against 38.5% on lamivudine, and 82.0% against 56.7% in HBeAg-negative patients. Therapeutic response 63% against 48% and 78% against 66%.',
        iconName: 'Activity',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'But escape needs only one mutation',
        laymanDesc:
          'The virus needs a single change at one position to get past it — the same position that defeats lamivudine. A quarter of patients had made that change within two years.',
        molecularDetail:
          'Resistance maps to rtM204I, a single substitution, giving 25.1% resistance at week 104 in HBeAg-positive patients. Entecavir requires the rtM204 substitutions plus a second-site change at rtT184, rtS202 or rtM250, and reaches 1.2% at week 240.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And the muscles and nerves paid for it',
        laymanDesc:
          'Severe muscle enzyme rises in one patient in eight, and a combination trial with interferon stopped early after seven of fifty patients developed nerve damage.',
        molecularDetail:
          'Grade 3 or 4 creatine kinase elevation in 12.9% against 4.1% on lamivudine over two years. Peripheral neuropathy in 7 of 50 on telbivudine with peginterferon alfa-2a against 1 of 54 and 0 of 54 in the monotherapy arms, terminating that trial at 159 of 300 planned patients.',
        iconName: 'ShieldAlert',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'GLOBE (Lai 2007, N Engl J Med; Liaw 2009, Gastroenterology)',
        phase: 'Phase 3, randomised, double-blind, active-controlled against lamivudine',
        sampleSize: 1370,
        primaryEndpoint:
          'Therapeutic response — HBV DNA below 5 log10 copies/mL with either HBeAg loss or ALT normalisation — tested for non-inferiority to lamivudine',
        endpointMet: true,
        statisticalPValue:
          'Week 52: 75.3% against 67.0% (P=0.005) in HBeAg-positive patients. Week 104: 63% against 48% (P<0.001) and 78% against 66% (P=0.007); resistance 25.1% against 39.5% and 10.8% against 25.9%',
        unreportedAdverseSignals:
          'The composite endpoint threshold of 5 log10 copies/mL is more than a hundredfold above the assay’s 300 copies/mL limit of detection. Grade 3 or 4 creatine kinase elevations occurred in 12.9% against 4.1%. The comparator was the weakest licensed agent, and entecavir had been approved a year before this trial reported.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Telbivudine plus peginterferon alfa-2a (Marcellin 2015, J Hepatol)',
        phase: 'Randomised, open-label, three-arm — terminated early',
        sampleSize: 159,
        primaryEndpoint:
          'Antiviral efficacy and safety of telbivudine with peginterferon alfa-2a against either alone',
        endpointMet: false,
        statisticalPValue:
          'Undetectable HBV DNA at week 24 in 71% (12/17) on combination against 35% (17/48) on telbivudine (P=0.022) and 7% (3/42) on peginterferon (P<0.0001)',
        unreportedAdverseSignals:
          'Terminated at 159 of 300 planned patients because of peripheral neuropathy in 7 of 50 on combination therapy against 1 of 54 and 0 of 54. The most virologically effective arm was the reason the trial was stopped, and the authors conclude the combination should not be used.',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Therapeutic response 75.3% against 67.0% at week 52 and 63% against 48% at week 104 in HBeAg-positive patients, double-blind against lamivudine',
        'Undetectable viraemia below 300 copies/mL in 55.6% against 38.5% and 82.0% against 56.7% at week 104',
        'Viral resistance 25.1% against 39.5% and 10.8% against 25.9% at week 104',
        'Grade 3 or 4 creatine kinase elevation in 12.9% against 4.1% over two years',
        'Peripheral neuropathy in 7 of 50 on telbivudine with peginterferon, against 1 of 54 and 0 of 54 on either alone',
      ],
      unsupportedInferences: [
        'That superiority to lamivudine implied a competitive place in therapy — entecavir was already approved and was never the comparator',
        'That a 63% "therapeutic response" describes viral control; the threshold was 100,000 copies/mL and undetectable viraemia was reported separately',
        'That telbivudine reduces cancer or decompensation — inferred through lamivudine’s outcome trial and telbivudine’s surrogate superiority, never tested directly',
        'That a two-year resistance figure describes the long run; the curve was still rising and treatment is indefinite',
      ],
      whatFailedInitially: [
        'A single-mutation escape route at rtM204I, the same position that defeats lamivudine, giving 25.1% resistance by two years',
        'Grade 3 or 4 creatine kinase elevations in 12.9% of patients, three times the comparator rate',
        'The peginterferon combination trial terminated early for peripheral neuropathy, despite being the most effective arm',
        'A composite primary endpoint whose viral threshold sat more than a hundredfold above the limit of detection',
        'Both United States presentations recorded as discontinued in Drugs@FDA',
      ],
      realWorldOutcome: [
        'Approved October 2006 under NDA 022011, sixteen months after entecavir, on superiority to lamivudine',
        'Never compared with entecavir or tenofovir in a registrational trial',
        'Combination with peginterferon alfa-2a specifically ruled out by its own trial, which was stopped early',
        'Discontinued in the United States; the tablet and the oral solution are both listed as such in Drugs@FDA',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet and oral solution — both discontinued in the United States',
      description:
        'One 600 mg tablet once daily, or the 100 mg/5 mL oral solution, taken indefinitely, with the dosing interval lengthened as renal function falls. Both presentations are recorded as discontinued in Drugs@FDA under NDA 022011 and NDA 022154.',
      safetyProfile:
        'Myopathy is the characteristic toxicity: grade 3 or 4 creatine kinase elevations occurred in 12.9% of patients over two years against 4.1% on lamivudine, and unexplained muscle aches, tenderness or weakness are the symptoms to report. Peripheral neuropathy is the nerve counterpart, and the trial combining telbivudine with peginterferon alfa-2a was terminated early after it occurred in 7 of 50 combination-arm patients; that combination should not be used. As with every hepatitis B nucleos(t)ide, severe acute exacerbations of hepatitis have been reported after discontinuation, because the nuclear cccDNA reservoir is never cleared, and lactic acidosis with severe hepatomegaly and steatosis is a class effect. Overall adverse event frequency in GLOBE was similar to lamivudine.',
    },
    commonQuestions: [
      {
        q: 'If the trial showed it was better, why did the drug disappear?',
        a: 'Because of what it was better than. GLOBE compared telbivudine with lamivudine, and telbivudine won — 63% against 48% on the composite endpoint at two years, with resistance in 25.1% against 39.5%. Both of those are real results from a properly double-blind trial of 1,370 patients. The problem is that entecavir had been approved in March 2005, sixteen months before telbivudine, with cumulative resistance of 1.2% at five years measured the same way. Telbivudine was never compared with it. A drug can be genuinely superior to the weakest option in its class and still have no place in therapy, and this is the clearest example of that on this site.',
      },
      {
        q: 'What does "therapeutic response" actually mean in these results?',
        a: 'Less than it sounds. The trial defined it as hepatitis B DNA below 5 log10 copies per millilitre — that is, below 100,000 copies per millilitre — together with either loss of HBeAg or normalisation of liver enzymes. The assay used in the same trial could detect down to 300 copies per millilitre, and the paper reports undetectable viraemia separately: 55.6% in HBeAg-positive patients at two years, against the 63% composite. So a patient carrying 50,000 viral copies per millilitre with normal liver enzymes counted as a therapeutic response. The trial is transparent about all of this; the number that travels is the composite.',
        auditNote:
          'Composite endpoints joining a loose threshold to an "or" of two dissimilar events are common in this era of hepatitis B trials. Reading the components separately is usually more informative than reading the headline.',
      },
      {
        q: 'Why did the virus become resistant so quickly?',
        a: 'Because it only needed one change. Telbivudine resistance maps to a single substitution at position 204 of the viral reverse transcriptase — the same position that defeats lamivudine. A virus population replicating at high turnover produces every single-point mutant continuously, so any drug that a single mutation defeats will eventually be defeated, and the only question is how fast. Twenty-five per cent of HBeAg-positive patients had escaped within two years. Entecavir requires the same position-204 changes plus a further substitution at one of three other sites, so the virus needs to accumulate three mutations rather than one, and its five-year resistance rate is 1.2%. One mutation against three is not a small difference of degree.',
      },
      {
        q: 'Why was the combination trial stopped when it was working best?',
        a: 'Because it was causing nerve damage. The trial randomised treatment-naive patients to telbivudine with peginterferon alfa-2a, telbivudine alone, or peginterferon alone. The combination was clearly the most effective arm on viral suppression: 71% reached undetectable hepatitis B DNA at 24 weeks against 35% and 7%. It was also producing peripheral neuropathy in 7 of the 50 patients assigned to it, against 1 of 54 on telbivudine alone and none of 54 on peginterferon alone. The trial was terminated at 159 of a planned 300 patients, and the authors wrote plainly that despite the rapid and profound reductions in viral DNA, this combination should not be used. It is an unusually clean illustration that efficacy and benefit are not the same quantity.',
      },
      {
        q: 'Should this drug have been approved?',
        a: 'It met its endpoint honestly against an approved comparator, which is what the regulatory standard asked for, so the more useful question is what the standard measures. Non-inferiority and superiority trials are run against a licensed active control, and licensed does not mean current. In October 2006 lamivudine was a legitimate comparator by that rule and a poor one by any clinical reading, since its 49% five-year resistance rate had been published two years earlier and a much better drug had been approved sixteen months earlier. Everything that followed — the resistance curve, the creatine kinase, the terminated combination trial, the discontinuation — was consistent with what the comparison choice already implied. The page is kept because the comparator question is the most portable lesson here, and it applies well beyond hepatitis B.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Lai CL et al. Telbivudine versus lamivudine in patients with chronic hepatitis B. N Engl J Med 2007;357:2576-2588 (GLOBE Study Group)',
        identifier: '10.1056/NEJMoa066422',
        kind: 'doi',
      },
      {
        label:
          'Liaw YF et al. 2-Year GLOBE trial results: telbivudine is superior to lamivudine in patients with chronic hepatitis B. Gastroenterology 2009;136:486-495',
        identifier: '10.1053/j.gastro.2008.10.026',
        kind: 'doi',
      },
      {
        label:
          'Marcellin P et al. Telbivudine plus pegylated interferon alfa-2a in a randomized study in chronic hepatitis B is associated with an unexpected high rate of peripheral neuropathy. J Hepatol 2015;62:41-47',
        identifier: '10.1016/j.jhep.2014.08.021',
        kind: 'doi',
      },
      {
        label:
          'Liaw YF et al. Lamivudine for patients with chronic hepatitis B and advanced liver disease. N Engl J Med 2004;351:1521-1531',
        identifier: '10.1056/NEJMoa033364',
        kind: 'doi',
      },
      {
        label:
          'Drugs@FDA: TYZEKA (telbivudine) 600 mg tablet, NDA 022011, Novartis — marketing status Discontinued',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=022011',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA: TYZEKA (telbivudine) 100 mg/5 mL oral solution, NDA 022154, Novartis — marketing status Discontinued',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=022154',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 159269 — telbivudine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/159269',
        kind: 'url',
      },
    ],
  },
]
