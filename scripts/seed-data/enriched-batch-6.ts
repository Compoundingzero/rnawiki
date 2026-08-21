import type { SeedDossier } from '@/lib/seed-types'

/**
 * Curated flagship dossiers — the antipsychotics and mood stabilisers.
 *
 * This is the group where the gap between what was measured and what is claimed is widest in all of
 * medicine. Every drug here is licensed on a rating-scale change over six weeks — PANSS, BPRS, YMRS,
 * MADRS — in patients who were acutely ill and then followed for a month and a half. None of them
 * was licensed on a measurement of whether a person went back to work, stayed out of hospital for a
 * year, or lived longer. Where the long-term, publicly funded, non-industry trials exist — CATIE,
 * CUtLASS, BALANCE, MIND-USA, AID-ICU, the VA lithium suicide trial — they are quoted here in full,
 * including the ones that found nothing.
 *
 * Conventions for the whole group.
 *
 * 1. NO PRICING BLOCK. `SeedPricing` requires a per-dose synthesis cost with a citable source, and
 *    none of these molecules has one that could be verified. What the CMS National Average Drug
 *    Acquisition Cost survey publishes is what a pharmacy pays to buy the drug — a price, not a cost
 *    of manufacture — and those figures appear inside `substitutes`, labelled as prices, with the
 *    NADAC file cited. A missing cost beats an invented one.
 *
 * 2. THE SMILES STRINGS ARE THE STORED PUBCHEM CANONICAL SMILES, unchanged. Each was already put
 *    through this repository's connection-table parser and accepted before these pages were written.
 *
 * 3. EFFECT SIZES ARE COPIED FROM THE PAPER. Standardised mean differences, hazard ratios, rating
 *    scale point changes, numbers needed to treat and p-values come from the published abstract or
 *    the FDA label, never from memory. Where a number could not be checked, the field is absent.
 *
 * 4. EVERY DOSSIER CARRIES AT LEAST ONE 'inferred' OR 'failed' AUDIT, because every drug here has
 *    one. Quetiapine's sleep use has no approval behind it; olanzapine won CATIE and still lost
 *    three-quarters of its patients; risperidone's active metabolite was relaunched as a new drug;
 *    aripiprazole's partial agonism did not stop compulsive gambling; ziprasidone's QT programme
 *    measured milliseconds and inferred safety; haloperidol failed two large randomised ICU
 *    delirium trials; lithium's suicide-prevention trial was stopped for futility; and four of the
 *    five lamotrigine bipolar depression trials were negative before the pooled analysis was
 *    published.
 *
 * 5. NO DOSING, TITRATION OR PROCUREMENT GUIDANCE. Milligram figures appear only where they are part
 *    of a trial arm's identity or a label's identity. Nothing here tells a reader what to take.
 */

const NADAC_SOURCE = {
  label:
    'CMS National Average Drug Acquisition Cost (NADAC) survey — the price United States pharmacies pay to acquire a drug',
  identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
  kind: 'url' as const,
}

export const ENRICHED_BATCH_6_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // 1. Quetiapine — licensed for three psychiatric conditions, prescribed overwhelmingly for a
  //    fourth it has never been approved for.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'quetiapine',
    name: 'Quetiapine',
    tradeName: 'Seroquel',
    sponsor:
      'AstraZeneca (originator, NDA 020639 approved 1997 and NDA 022047 for the extended-release form in 2007); the Seroquel applications are now held by Cheplapharm and the molecule has a large generic market',
    targetGene: 'DRD2',
    targetProtein:
      'Dopamine D2 receptor and serotonin 5-HT2A receptor, both antagonised weakly and transiently. The histamine H1 receptor and the alpha-1 adrenoceptor are bound far more tightly than D2 is, and the active metabolite N-desalkylquetiapine inhibits the noradrenaline transporter.',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1997,
    indication:
      'Schizophrenia in adults and adolescents aged 13 to 17; manic episodes of bipolar I disorder; depressive episodes of bipolar disorder; and, as the extended-release form, adjunctive treatment of major depressive disorder alongside an antidepressant',
    patientFriendlyIndication: 'Schizophrenia, and the high and low phases of bipolar disorder',
    anatomicalSite:
      'Mesolimbic and mesocortical dopamine synapses, plus histamine H1 and alpha-1 adrenergic receptors throughout the brain and blood vessels',
    conditionContext: {
      conditionExplainer:
        'Schizophrenia and bipolar disorder are diagnosed from what a person reports and what a clinician observes. There is no blood test, no scan and no biopsy that establishes either one, so every trial in this field measures a rating scale filled in by an observer rather than a physical quantity.',
      whyItMatters:
        'That fact shapes the whole evidence base. A drug that moves a rating scale by six points over six weeks has met the regulatory standard. Whether the person is working, housed, out of hospital or alive in five years is a different measurement, and almost no licensing trial makes it.',
      whoTakesThis:
        'People with schizophrenia and bipolar disorder, and, in far larger numbers, people prescribed a small nightly amount for sleep, anxiety, agitation in dementia or post-traumatic stress. None of those last uses is an approved indication anywhere.',
      clinicalGoals:
        'The registration trials measured PANSS and BPRS totals in schizophrenia, Young Mania Rating Scale scores in mania, and Montgomery-Asberg Depression Rating Scale scores in bipolar depression, over six to eight weeks.',
    },
    oneSentenceVerdict:
      'A weak, short-acting dopamine D2 blocker whose strongest binding is to the histamine receptor that makes people sleepy, which produced a real 8-week antidepressant effect in bipolar depression (58% response versus 36% on placebo in 542 patients) and the highest dropout rate of any arm in the largest independent schizophrenia trial ever run, and which is now taken mostly for insomnia, an indication it has never been approved for in any country.',
    laymanHowItWorks:
      'Quetiapine blocks dopamine signalling in the brain, which is what dampens hallucinations and delusions, but it holds on to the dopamine receptor loosely and lets go within hours. It binds much more tightly to the histamine receptor, which is the same receptor an old-fashioned antihistamine hits, and that is why it is so sedating. When the liver breaks quetiapine down it produces a second active molecule that blocks the reuptake of noradrenaline, in the way an antidepressant does, which is the leading explanation for why it works in bipolar depression when most antipsychotics do not.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 58,
    substitutes: {
      summary:
        'Quetiapine costs about nine cents a tablet at United States pharmacy acquisition cost, which is part of why it is reached for so often. For schizophrenia, the network meta-analysis that ranked fifteen antipsychotics put quetiapine below olanzapine, risperidone and paliperidone and level with haloperidol, a drug from 1967 that costs sixteen cents. For sleep, which is what most quetiapine is actually prescribed for, the comparators are drugs that were at least tested for sleep.',
      conventionalRx: [
        {
          name: 'Olanzapine (Zyprexa)',
          class: 'Second-generation antipsychotic, multi-receptor antagonist',
          howItCompares:
            'Ranked above quetiapine on overall symptom reduction in the 212-trial network meta-analysis (SMD 0.59 versus 0.44) and had the lowest all-cause discontinuation of any arm in CATIE (64% versus 82% for quetiapine over 18 months). It pays for that with the worst weight gain in the class.',
          typicalCost:
            'US$0.1432 per tablet at pharmacy acquisition cost, median across 167 listed generic products (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: the most effective non-clozapine antipsychotic on both the meta-analytic ranking and the independent effectiveness trial. Cons: the largest weight gain and metabolic disturbance of the fifteen drugs ranked.',
        },
        {
          name: 'Haloperidol (Haldol)',
          class: 'First-generation butyrophenone antipsychotic',
          howItCompares:
            'Scored marginally higher than quetiapine on overall symptom reduction in the same network meta-analysis (SMD 0.45 versus 0.44), which is the finding that undermined the idea that second-generation drugs are more effective. It causes far more movement side effects: the odds ratio for extrapyramidal effects was 4.76 for haloperidol against 0.30 for clozapine.',
          typicalCost:
            'US$0.1579 per tablet at pharmacy acquisition cost, median across 107 listed generic products (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: equal efficacy on the rating scale, sixty years of use, no metabolic penalty. Cons: the highest rate of parkinsonism and akathisia in the ranked set, and a real tardive dyskinesia risk.',
        },
        {
          name: 'Trazodone',
          class: 'Serotonin antagonist and reuptake inhibitor, used off-label for sleep',
          howItCompares:
            'The other drug prescribed in enormous quantities for insomnia without an insomnia licence. Neither drug has an approval for sleep; trazodone at least has no dopamine blockade, so it carries no tardive dyskinesia risk and no antipsychotic boxed warning for mortality in dementia.',
          typicalCost:
            'US$0.0506 per tablet at pharmacy acquisition cost, median across listed generic products (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: cheaper, no movement-disorder risk, no metabolic signal of the same size. Cons: also unlicensed for insomnia, causes orthostatic hypotension, and carries a rare priapism risk.',
        },
        {
          name: 'Doxepin',
          class:
            'Tricyclic antidepressant, licensed at low strength specifically for sleep maintenance',
          howItCompares:
            'The comparison that matters most for the off-label sleep use. Doxepin at low strength is an H1 antagonist with an actual FDA insomnia indication, meaning a regulator has reviewed sleep-endpoint trials for it. Quetiapine has no such review anywhere, and its H1 blockade is the same mechanism.',
          typicalCost:
            'US$0.1535 per capsule at pharmacy acquisition cost, median across listed generic products (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: an approved insomnia indication, so the sleep evidence was examined by a regulator. Cons: anticholinergic effects, and the low-strength branded product is far more expensive than the generic capsule quoted here.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Ask what the prescription is for, and whether it is an approved use',
          action:
            'If quetiapine has been started for sleep, anxiety or agitation rather than for schizophrenia or bipolar disorder, ask which indication it is being used under.',
          patientImpact:
            'The pooled sleep evidence is 21 trials with a standardised mean difference of -0.57 for sleep quality against placebo, and no advantage at all against other psychiatric drugs (mean difference -4.19 minutes of total sleep time, 95% CI -19.43 to 11.05). The single dedicated randomised trial in primary insomnia had thirteen completers and did not reach significance.',
          clinicalPrecaution:
            'Do not stop an antipsychotic on your own. Abrupt discontinuation after long use can cause rebound insomnia, nausea and, rarely, withdrawal dyskinesias.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1CN(CCN1CCOCCO)C2=NC3=CC=CC=C3SC4=CC=CC=C42',
      chemicalFormula: 'C21H25N3O2S',
      molecularWeight: '383.50 g/mol (free base); dispensed as quetiapine fumarate',
      targetReceptorAffinity:
        'Quetiapine is a low-affinity antagonist at dopamine D2 and a moderate one at 5-HT2A, and binds histamine H1 and alpha-1 adrenoceptors more tightly than either. Its metabolite N-desalkylquetiapine has 3.4 nM affinity for H1, inhibits the human noradrenaline transporter with a Ki of 12 nM — about a hundred-fold more potently than the parent drug — and is a more potent and more efficacious 5-HT1A partial agonist than quetiapine itself.',
      structureSource: {
        label: 'PubChem CID 5002 (quetiapine) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5002',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'que-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Incoming control of the thiazepine core and the piperazine side chain',
          description:
            'Confirm identity and purity of 11-chlorodibenzo[b,f][1,4]thiazepine and of 2-(2-piperazin-1-ylethoxy)ethanol before coupling. The chloro-imine hydrolyses on standing to the inactive dibenzothiazepinone, which is the impurity that carries through the whole route and the one the pharmacopoeial monograph is written to catch.',
          reagentsAndBuffer:
            '11-chlorodibenzo[b,f][1,4]thiazepine and 2-(2-piperazin-1-ylethoxy)ethanol reference standards, Karl Fischer titration, reversed-phase HPLC with UV detection, dibenzo[b,f][1,4]thiazepin-11(10H)-one reference impurity',
        },
        {
          id: 'que-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Displacement of the 11-chloro group by the piperazine nitrogen',
          description:
            'Heat the chloro-imine with the hydroxyethoxyethyl piperazine so the secondary amine displaces chloride at position 11 and forms the amidine that carries the whole pharmacology. One bond is made; the tricyclic core and the side chain are both bought in.',
          dependsOnStepId: 'que-w1',
          reagentsAndBuffer:
            '11-chlorodibenzo[b,f][1,4]thiazepine, 2-(2-piperazin-1-ylethoxy)ethanol, an inorganic base such as sodium carbonate, refluxing toluene or xylene under nitrogen',
        },
        {
          id: 'que-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Hemifumarate salt formation and recrystallisation',
          description:
            'Treat the free base with fumaric acid in ethanol to precipitate quetiapine hemifumarate, then recrystallise and assay against the monograph for related substances. The salt exists because the free base is an oil; the marketed product is the fumarate and the strengths on a tablet refer to the free base.',
          dependsOnStepId: 'que-w2',
          reagentsAndBuffer:
            'Fumaric acid in a 0.5 molar equivalent, ethanol and purified water, activated charcoal, phosphate buffer with acetonitrile for the HPLC assay',
        },
        {
          id: 'que-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Blood-brain barrier permeability and efflux screen',
          description:
            'Measure apparent permeability across an MDCK monolayer expressing human P-glycoprotein, in both directions, to establish that the molecule crosses into brain and is not pumped straight back out. A dopamine antagonist that does not reach the striatum has no pharmacology to measure.',
          dependsOnStepId: 'que-w3',
          reagentsAndBuffer:
            'MDCK-MDR1 monolayers on Transwell inserts, Hanks balanced salt solution with HEPES, lucifer yellow as monolayer integrity marker, elacridar as P-glycoprotein inhibitor control, LC-MS/MS quantification',
        },
        {
          id: 'que-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Receptor panel and transporter uptake readout for parent and metabolite',
          description:
            'Run competition binding at D2, 5-HT2A, H1 and alpha-1 for quetiapine, and in parallel a noradrenaline transporter uptake assay for N-desalkylquetiapine. Running both is the point: the parent explains the antipsychotic effect and the metabolite explains the antidepressant one, and a panel that tests only the parent misses half the drug.',
          dependsOnStepId: 'que-w4',
          reagentsAndBuffer:
            'Membranes from HEK293 cells expressing human D2, 5-HT2A, H1 and alpha-1B; [3H]raclopride, [3H]ketanserin and [3H]pyrilamine radioligands; HEK293 cells expressing human noradrenaline transporter with [3H]noradrenaline uptake and nisoxetine as reference inhibitor',
        },
      ],
    },
    keyAudits: [
      {
        id: 'que-a1',
        category: 'measured',
        title:
          'BOLDER I: 58% responded in bipolar depression against 36% on placebo, in 542 patients',
        laymanSummary:
          'In an eight-week randomised trial of 542 outpatients with bipolar depression, roughly six in ten improved by half or more on the depression scale, against roughly three and a half in ten on placebo. This is the clearest positive result quetiapine owns.',
        technicalDetails:
          'Calabrese and colleagues randomised 542 outpatients with bipolar I (n=360) or bipolar II (n=182) disorder in a major depressive episode to quetiapine 600 mg/day, quetiapine 300 mg/day or placebo for eight weeks. The primary measure was mean change in Montgomery-Asberg Depression Rating Scale total score from baseline to week 8; both quetiapine arms separated from placebo statistically from week 1 onward. Response, defined as a 50% or greater MADRS improvement, was 58.2% at 600 mg and 57.6% at 300 mg against 36.1% on placebo. Remission, defined as MADRS 12 or below, was 52.9% in both quetiapine arms against 28.4% on placebo. Treatment-emergent mania was 3.2% on quetiapine and 3.9% on placebo. The higher dose gave no additional benefit over the lower one on any measure, which is a dose-response failure inside a positive trial.',
        evidenceSource: 'Calabrese JR et al., Am J Psychiatry 2005;162:1351-1360 (BOLDER I)',
        doi: '10.1176/appi.ajp.162.7.1351',
        measuredMetric:
          'MADRS response and remission rates at 8 weeks, and mean MADRS change from baseline',
        auditFlag: 'verified',
      },
      {
        id: 'que-a2',
        category: 'failed',
        title: 'CATIE: 82% of the quetiapine arm stopped the drug, the worst of five treatments',
        laymanSummary:
          'In the largest independent schizophrenia trial ever run, patients were given one of five antipsychotics and followed for eighteen months. More people quit quetiapine than any other drug in the trial, including a 1950s drug it was meant to have replaced.',
        technicalDetails:
          'CATIE randomised 1,493 patients with chronic schizophrenia at 57 United States sites to olanzapine, perphenazine, quetiapine, risperidone or ziprasidone for up to 18 months, with time to discontinuation for any cause as the primary outcome. Of the 1,432 who took at least one dose, 74% discontinued before 18 months: 64% on olanzapine, 74% on risperidone, 75% on perphenazine, 79% on ziprasidone and 82% on quetiapine. Time to all-cause discontinuation was significantly longer on olanzapine than on quetiapine (P<0.001) or risperidone (P=0.002). The trial was funded by the National Institute of Mental Health, not by a manufacturer, and perphenazine, a first-generation drug from 1957, performed similarly to quetiapine, risperidone and ziprasidone.',
        evidenceSource: 'Lieberman JA et al., N Engl J Med 2005;353:1209-1223 (CATIE, NCT00014001)',
        doi: '10.1056/NEJMoa051688',
        measuredMetric:
          'Time to discontinuation of assigned treatment for any cause over 18 months',
        auditFlag: 'verified',
      },
      {
        id: 'que-a3',
        category: 'inferred',
        title: 'The commonest reason quetiapine is taken has never been an approved indication',
        laymanSummary:
          'Quetiapine is licensed for schizophrenia and bipolar disorder. It is prescribed in far larger numbers as a nightly sleeping aid, and no regulator anywhere has reviewed sleep trials and approved it for that.',
        technicalDetails:
          'A 2023 systematic review and meta-analysis of 21 clinical trials found low-dose quetiapine improved sleep quality against placebo with a standardised mean difference of -0.57 (95% CI -0.75 to -0.40) and increased total sleep time by 47.91 minutes (95% CI 28.06 to 67.76). Against other psychiatric drugs, the total sleep time difference was -4.19 minutes (95% CI -19.43 to 11.05), which is no difference at all. Adverse events and discontinuation for adverse events were common. The only dedicated double-blind randomised trial in primary insomnia enrolled patients to quetiapine 25 mg or placebo for two weeks and finished with thirteen completers: total sleep time rose 124.92 minutes on quetiapine and 72.24 minutes on placebo, and sleep latency fell 96.16 minutes against 23.72 minutes, with statistical significance not reached between the groups. That is the entire dedicated randomised evidence base for the use that dominates prescribing.',
        evidenceSource:
          'Lin CY et al., Eur Neuropsychopharmacol 2023;67:22-36; Tassniyom K et al., J Med Assoc Thai 2010;93:729-734',
        doi: '10.1016/j.euroneuro.2022.11.008',
        inferredClaim:
          'That quetiapine is an appropriate treatment for insomnia — an inference from sleep-quality secondary endpoints in psychiatric populations, plus one thirteen-patient trial that found nothing significant',
        auditFlag: 'caution',
      },
      {
        id: 'que-a4',
        category: 'conclusion_shift',
        title: 'In dementia the drug lost to placebo on efficacy and beat it on harm',
        laymanSummary:
          'Antipsychotics were used for years to calm agitation in dementia. When the government funded a trial to test that, quetiapine was no better than a dummy pill on the main measure, and a pooled analysis of fifteen trials found more deaths on drug than on placebo.',
        technicalDetails:
          'CATIE-AD randomised 421 outpatients with Alzheimer disease and psychosis, aggression or agitation to olanzapine, quetiapine, risperidone or placebo for up to 36 weeks. Median time to discontinuation for any reason did not differ (quetiapine 5.3 weeks, placebo 8.0 weeks, P=0.52), and minimal improvement on the Clinical Global Impression of Change at 12 weeks was seen in 26% on quetiapine against 21% on placebo (P=0.22 across the four arms). Discontinuation for intolerability was 16% on quetiapine against 5% on placebo (P=0.009). Separately, Schneider and colleagues pooled fifteen randomised placebo-controlled trials, nine of them unpublished, covering 3,353 patients on drug and 1,757 on placebo: death occurred in 3.5% on drug against 2.3% on placebo, odds ratio 1.54 (95% CI 1.06 to 2.23, P=0.02). The FDA added a boxed warning for increased mortality in elderly patients with dementia-related psychosis in 2005, and it applies to quetiapine.',
        evidenceSource:
          'Schneider LS et al., N Engl J Med 2006;355:1525-1538 (CATIE-AD, NCT00015548); Schneider LS et al., JAMA 2005;294:1934-1943',
        doi: '10.1056/NEJMoa061240',
        inferredClaim:
          'That antipsychotics calm agitation in dementia — a practice built on open use and small trials, contradicted by the one large independent randomised trial and offset by a measured mortality signal',
        auditFlag: 'contested',
      },
      {
        id: 'que-a5',
        category: 'measured',
        title: 'Ranked eighth of fifteen antipsychotics, statistically level with haloperidol',
        laymanSummary:
          'When 212 randomised trials covering 43,049 patients were pooled and the fifteen drugs ranked, quetiapine came eighth. The drug immediately above it was haloperidol, a first-generation antipsychotic from 1967.',
        technicalDetails:
          'Leucht and colleagues ran a Bayesian multiple-treatments meta-analysis of 212 blinded randomised trials with 43,049 participants, comparing 15 antipsychotics and placebo for acute schizophrenia. Standardised mean differences against placebo for overall symptom change were clozapine 0.88 (95% CrI 0.73 to 1.03), amisulpride 0.66, olanzapine 0.59, risperidone 0.56, paliperidone 0.50, zotepine 0.49, haloperidol 0.45, quetiapine 0.44 (0.35 to 0.52), aripiprazole 0.43, sertindole 0.39, ziprasidone 0.39, chlorpromazine 0.38, asenapine 0.38, lurasidone 0.33 and iloperidone 0.33. The authors concluded the findings challenge the straightforward split of antipsychotics into first- and second-generation classes. In the larger 2019 update covering 402 trials and 53,463 participants, quetiapine prolonged the QTc interval by 3.43 ms against placebo (95% CrI 0.94 to 6.00), the smallest significant prolongation of the seven drugs that showed one.',
        evidenceSource:
          'Leucht S et al., Lancet 2013;382:951-962; Huhn M et al., Lancet 2019;394:939-951',
        doi: '10.1016/S0140-6736(13)60733-3',
        measuredMetric:
          'Standardised mean difference in overall symptom change against placebo, and QTc prolongation in ms',
        auditFlag: 'verified',
      },
      {
        id: 'que-a6',
        category: 'conclusion_shift',
        title:
          'The off-label uses were promoted, and the promotion was settled for US$520 million in 2010',
        laymanSummary:
          'The pattern of quetiapine being prescribed for things it was never approved for did not arise on its own. In 2010 the manufacturer settled a United States government case over marketing it for uses the FDA had not approved.',
        technicalDetails:
          'The United States Department of Justice announced in April 2010 that AstraZeneca had agreed to pay US$520 million to resolve allegations that it illegally marketed Seroquel for uses not approved as safe and effective by the FDA, including aggression, Alzheimer disease, anger management, anxiety, attention deficit hyperactivity disorder, dementia, depression, mood disorder, post-traumatic stress disorder and sleeplessness. Off-label prescribing by a physician is lawful; promotion of an unapproved use by a manufacturer is not, and this is the mechanism by which a licensed indication and an actual prescribing pattern came apart.',
        evidenceSource:
          'United States Department of Justice, Office of Public Affairs, 27 April 2010: "Pharmaceutical Giant AstraZeneca to Pay $520 Million for Off-label Drug Marketing"',
        inferredClaim:
          'That the sleep, anxiety and dementia uses grew organically from clinical experience — the settlement documents a promotional origin for the same list of indications',
        auditFlag: 'contested',
      },
      {
        id: 'que-a7',
        category: 'inferred',
        title:
          'The antidepressant effect is credited to a metabolite, from receptor data not trials',
        laymanSummary:
          'Quetiapine works in bipolar depression, which most antipsychotics do not. The usual explanation is that the body converts it into a second molecule that behaves like an antidepressant. That explanation comes from test-tube receptor work and mouse behaviour, not from a trial in people.',
        technicalDetails:
          'Jensen and colleagues screened quetiapine, N-desalkylquetiapine and the inactive dibenzothiazepinone against a large panel of G-protein-coupled receptors, ion channels and neurotransmitter transporters. N-desalkylquetiapine had 3.4 nM affinity for histamine H1, inhibited the human noradrenaline transporter with a Ki of 12 nM — roughly a hundred-fold more potently than quetiapine itself — and was ten-fold more potent and more efficacious than quetiapine as a 5-HT1A partial agonist. In mice, N-desalkylquetiapine showed antidepressant-like activity in the tail suspension test at doses as low as 0.1 mg/kg. The chain from a 12 nM transporter Ki and a mouse tail suspension result to the human MADRS change in BOLDER I is inference, and no trial has given the metabolite to people on its own.',
        evidenceSource: 'Jensen NH et al., Neuropsychopharmacology 2008;33:2303-2312',
        doi: '10.1038/sj.npp.1301646',
        inferredClaim:
          'That noradrenaline transporter inhibition by N-desalkylquetiapine causes the observed antidepressant effect — a mechanistic hypothesis supported by binding constants and rodent behaviour, never tested directly in humans',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed, absorbed fast, and largely gone within a day',
        laymanDesc:
          'The tablet dissolves and the drug reaches its peak in the blood within about an hour and a half. The immediate-release form is short-lived, which is why it was originally given more than once a day and why an extended-release version exists.',
        molecularDetail:
          'Rapid oral absorption with a terminal half-life of roughly 6 to 7 hours for the parent compound and about 12 hours for N-desalkylquetiapine. Plasma protein binding is about 83%. Clearance is hepatic and dominated by CYP3A4, so strong CYP3A4 inhibitors and inducers move exposure substantially.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It crosses into the brain and the liver makes a second active drug',
        laymanDesc:
          'The molecule is fat-soluble enough to cross into the brain. At the same time the liver converts part of it into a related molecule that is also active, and behaves differently from the parent.',
        molecularDetail:
          'CYP3A4 sulfoxidation is the main inactivating route; N-dealkylation produces N-desalkylquetiapine, which circulates at concentrations comparable to the parent and has its own receptor profile, including 3.4 nM affinity for histamine H1 and a 12 nM Ki at the noradrenaline transporter.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It sits briefly on the dopamine receptor, then lets go',
        laymanDesc:
          'Quetiapine blocks the dopamine receptor that antipsychotics act on, but it holds on weakly and comes off within hours. That fast release is why it causes fewer stiffness and tremor side effects than older drugs, and it is also why the antipsychotic effect is modest.',
        molecularDetail:
          'Low-affinity, fast-dissociating antagonism at dopamine D2 in the mesolimbic and mesocortical pathways, with transient high occupancy after each dose falling well below the extrapyramidal threshold between doses. 5-HT2A antagonism is more sustained than D2 antagonism, which is the basis of the fast-off hypothesis of atypicality.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'It blocks histamine and adrenaline receptors much more tightly',
        laymanDesc:
          'The receptors quetiapine grips hardest are not the dopamine ones. It blocks the histamine receptor, which produces heavy sedation, and the receptor that keeps blood vessels toned, which is why blood pressure can drop on standing.',
        molecularDetail:
          'Histamine H1 antagonism drives somnolence and, over months, appetite and weight gain; alpha-1 adrenoceptor blockade produces orthostatic hypotension and dizziness. The FDA label attributes the somnolence explicitly to H1 antagonism. The affinity ordering — H1 and alpha-1 above 5-HT2A above D2 — is why a small nightly amount sedates without meaningfully blocking dopamine.',
        iconName: 'Moon',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Symptoms fall on a rating scale, and the metabolite adds an antidepressant effect',
        laymanDesc:
          'Over six to eight weeks, hallucinations, delusions and mania scores come down on the scales the trials use. In bipolar depression the second molecule made by the liver appears to add a separate antidepressant action.',
        molecularDetail:
          'Overall symptom reduction against placebo in acute schizophrenia was a standardised mean difference of 0.44 (95% CrI 0.35 to 0.52) across the pooled randomised evidence. In bipolar depression, MADRS response was 58.2% and 57.6% at the two doses tested against 36.1% on placebo, an effect commonly attributed to noradrenaline transporter inhibition by N-desalkylquetiapine.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'BOLDER I (Calabrese 2005)',
        phase: 'Phase 3 randomised double-blind placebo-controlled trial, 8 weeks',
        sampleSize: 542,
        primaryEndpoint:
          'Mean change from baseline to week 8 in Montgomery-Asberg Depression Rating Scale total score in bipolar I or II depression',
        endpointMet: true,
        statisticalPValue:
          'Both quetiapine arms separated from placebo from week 1 onward; response 58.2% and 57.6% versus 36.1% on placebo, remission 52.9% versus 28.4%',
        unreportedAdverseSignals:
          'The 600 mg arm produced no additional benefit over the 300 mg arm on any efficacy measure — a flat dose-response inside a positive trial.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'CATIE phase 1 (NCT00014001)',
        phase: 'Phase 4 independent randomised double-blind effectiveness trial, up to 18 months',
        sampleSize: 1493,
        primaryEndpoint: 'Time to discontinuation of assigned antipsychotic for any cause',
        endpointMet: false,
        statisticalPValue:
          'P < 0.001 for shorter time to discontinuation on quetiapine than olanzapine; 82% of the quetiapine arm discontinued, the highest of the five treatments',
        unreportedAdverseSignals:
          'Perphenazine, a first-generation drug from 1957, performed similarly to quetiapine, risperidone and ziprasidone. The trial was funded by the National Institute of Mental Health, not by a manufacturer.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'CATIE-AD (NCT00015548)',
        phase: 'Independent randomised double-blind placebo-controlled trial, up to 36 weeks',
        sampleSize: 421,
        primaryEndpoint:
          'Time to discontinuation for any reason, and proportion with at least minimal improvement on the Clinical Global Impression of Change at 12 weeks',
        endpointMet: false,
        statisticalPValue:
          'P = 0.52 for time to discontinuation; CGIC improvement 26% on quetiapine versus 21% on placebo, P = 0.22 across arms',
        unreportedAdverseSignals:
          'Discontinuation for intolerability was 16% on quetiapine against 5% on placebo (P = 0.009). The mean daily amount used was 56.5 mg, far below the schizophrenia range.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Tassniyom primary insomnia trial (2010)',
        phase: 'Double-blind randomised placebo-controlled trial, 2 weeks',
        sampleSize: 13,
        primaryEndpoint:
          'Total sleep time, sleep latency, daytime alertness and sleep satisfaction in DSM-IV primary insomnia',
        endpointMet: false,
        statisticalPValue:
          'Statistical significance not reached between groups; total sleep time rose 124.92 minutes on quetiapine and 72.24 minutes on placebo',
        unreportedAdverseSignals:
          'Thirteen completers. This is the only dedicated randomised trial of quetiapine in primary insomnia, which is the use that dominates prescribing.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'NCT00278941 (quetiapine SR monotherapy, maintenance in major depressive disorder)',
        phase: 'Phase 3 randomised withdrawal trial',
        sampleSize: 3000,
        primaryEndpoint:
          'Time from randomisation to a depressed event on quetiapine SR compared with placebo in major depressive disorder',
        endpointMet: false,
        statisticalPValue:
          'No results are posted on ClinicalTrials.gov for this completed study. `endpointMet: false` here records "no posted result", not a missed endpoint.',
        unreportedAdverseSignals:
          'A completed phase 3 trial of 3,000 participants with no results section on the registry. Quetiapine is licensed in the United States only as an adjunct in major depressive disorder, not as monotherapy.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'MADRS response of 58.2% and 57.6% against 36.1% on placebo in 542 randomised patients with bipolar depression over 8 weeks',
        'A standardised mean difference of 0.44 against placebo for overall symptom change in acute schizophrenia, eighth of fifteen ranked antipsychotics',
        '82% discontinuation over 18 months in the quetiapine arm of CATIE, the highest of the five treatments compared',
        'QTc prolongation of 3.43 ms against placebo (95% CrI 0.94 to 6.00) in the 402-trial network meta-analysis',
        'A 12 nM inhibition constant at the human noradrenaline transporter for the metabolite N-desalkylquetiapine',
      ],
      unsupportedInferences: [
        'That quetiapine is an evidence-based treatment for insomnia — no regulator has approved it for sleep, and the only dedicated primary-insomnia trial had thirteen completers and no significant difference',
        'That it calms agitation in dementia — CATIE-AD found 26% improved against 21% on placebo, P=0.22, with three times the intolerability dropout',
        'That noradrenaline transporter inhibition by the metabolite explains the antidepressant effect — a receptor-panel and mouse-behaviour hypothesis, never tested in people',
        'That being a second-generation drug makes it more effective than an older one — it ranked below haloperidol on the pooled efficacy estimate',
      ],
      whatFailedInitially: [
        'The 600 mg arm of BOLDER I gave no more benefit than the 300 mg arm on any efficacy measure',
        'CATIE-AD found no significant efficacy advantage over placebo in Alzheimer disease and a significant excess of intolerability dropout',
        'A completed phase 3 maintenance monotherapy trial in major depressive disorder with 3,000 participants has never posted results',
      ],
      realWorldOutcome: [
        'About nine cents a tablet at United States pharmacy acquisition cost, which removes cost as a barrier to the off-label uses',
        'A boxed warning for increased mortality in elderly patients with dementia-related psychosis, added by the FDA in 2005 and applying to the whole class',
        'A US$520 million United States settlement in 2010 over promotion of exactly the unapproved uses that now dominate prescribing',
      ],
    },
    deliverySystem: {
      type: 'Oral immediate-release tablet and extended-release tablet',
      description:
        'The immediate-release form has a half-life of about six to seven hours, which is short for a maintenance antipsychotic and is the reason an extended-release tablet was developed and separately approved in 2007. Sedation appears within an hour or two of a dose, which is both the main tolerability complaint in psychiatric use and the entire reason for the off-label sleep use.',
      safetyProfile:
        'The United States label carries a boxed warning for increased mortality in elderly patients with dementia-related psychosis and a boxed warning for suicidal thoughts and behaviours in children, adolescents and young adults. Common effects are somnolence, dizziness, dry mouth, orthostatic hypotension and weight gain. The class carries risks of tardive dyskinesia, neuroleptic malignant syndrome, hyperglycaemia and dyslipidaemia. Cataract monitoring is in the label because of lens changes seen in dogs.',
    },
    commonQuestions: [
      {
        q: 'Is quetiapine a sleeping pill?',
        a: 'It is not licensed as one anywhere, and the evidence behind that use is thinner than most people assume. Pooling 21 trials found it improved sleep quality against placebo with a standardised mean difference of -0.57 and added about 48 minutes of total sleep time, but against other psychiatric drugs the difference in total sleep time was -4.19 minutes with a confidence interval running from -19 to +11, which is no difference. The one dedicated randomised trial in primary insomnia finished with thirteen completers and did not reach statistical significance on any measure. What is well established is why it makes people sleepy: it blocks histamine H1 receptors more tightly than dopamine receptors, which is the mechanism of an old antihistamine.',
        auditNote:
          'This is the largest gap between what the drug is approved for and what it is used for on this page.',
      },
      {
        q: 'Is a low nightly amount safer than a full dose?',
        a: 'Less dopamine blockade almost certainly means less risk of movement disorders, because the dopamine receptor is the low-affinity target and a small amount does not occupy much of it. But the histamine and alpha-1 blockade that produces the sedation is present at small amounts, and so is the weight and metabolic effect that runs through histamine H1 and other appetite pathways. The boxed warning for mortality in elderly patients with dementia is not written around a dose. In CATIE-AD, the mean daily amount was 56.5 mg, well into what would be called low-dose, and the intolerability dropout was still three times that of placebo.',
      },
      {
        q: 'Is it better than the older antipsychotics it replaced?',
        a: 'On the pooled randomised evidence, no. Leucht and colleagues ranked fifteen antipsychotics using 212 trials and 43,049 patients: quetiapine came eighth with a standardised mean difference of 0.44 against placebo, just below haloperidol at 0.45, a first-generation drug approved in 1967. In CATIE, perphenazine, an even older drug, performed similarly to quetiapine, risperidone and ziprasidone, and quetiapine had the highest discontinuation rate of the five. Where quetiapine genuinely does better is movement side effects and prolactin, not symptom control.',
      },
      {
        q: 'Why does this page show a price but no manufacturing cost?',
        a: 'Because no verifiable per-dose cost of production for quetiapine could be found and cited. The figure quoted here is the CMS National Average Drug Acquisition Cost, which is what United States pharmacies pay to buy the drug, surveyed and published by the Centers for Medicare and Medicaid Services. That is a price, not a cost of manufacture, and the gap between the two is exactly what a cost-of-production study would measure. Estimating one would mean this page inventing a number.',
      },
      {
        q: 'Does it work for depression that is not bipolar?',
        a: 'In the United States the extended-release form is approved only as an add-on to an antidepressant in major depressive disorder, not as a treatment on its own. A completed phase 3 trial of quetiapine SR as monotherapy for maintenance in major depressive disorder, registered as NCT00278941 with an enrolment of 3,000, has no results posted on ClinicalTrials.gov. The strong depression result quetiapine owns is in bipolar depression, where BOLDER I is a genuinely positive 542-patient trial.',
        auditNote:
          'A completed 3,000-participant phase 3 trial with no posted results is a hole in the public record, not evidence of failure. It is recorded here as the hole it is.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Calabrese JR et al. A randomized, double-blind, placebo-controlled trial of quetiapine in the treatment of bipolar I or II depression. Am J Psychiatry 2005;162:1351-1360',
        identifier: '10.1176/appi.ajp.162.7.1351',
        kind: 'doi',
      },
      {
        label:
          'Lieberman JA et al. Effectiveness of antipsychotic drugs in patients with chronic schizophrenia. N Engl J Med 2005;353:1209-1223',
        identifier: '10.1056/NEJMoa051688',
        kind: 'doi',
      },
      {
        label: 'CATIE — Clinical Antipsychotic Trials of Intervention Effectiveness, schizophrenia',
        identifier: 'NCT00014001',
        kind: 'nct',
      },
      {
        label:
          "Schneider LS et al. Effectiveness of atypical antipsychotic drugs in patients with Alzheimer's disease (CATIE-AD). N Engl J Med 2006;355:1525-1538",
        identifier: '10.1056/NEJMoa061240',
        kind: 'doi',
      },
      {
        label:
          "CATIE-AD — Clinical Antipsychotic Trials of Intervention Effectiveness, Alzheimer's disease",
        identifier: 'NCT00015548',
        kind: 'nct',
      },
      {
        label:
          'Schneider LS, Dagerman KS, Insel P. Risk of death with atypical antipsychotic drug treatment for dementia: meta-analysis of randomized placebo-controlled trials. JAMA 2005;294:1934-1943',
        identifier: '10.1001/jama.294.15.1934',
        kind: 'doi',
      },
      {
        label:
          'Leucht S et al. Comparative efficacy and tolerability of 15 antipsychotic drugs in schizophrenia: a multiple-treatments meta-analysis. Lancet 2013;382:951-962',
        identifier: '10.1016/S0140-6736(13)60733-3',
        kind: 'doi',
      },
      {
        label:
          'Huhn M et al. Comparative efficacy and tolerability of 32 oral antipsychotics for the acute treatment of adults with multi-episode schizophrenia: a systematic review and network meta-analysis. Lancet 2019;394:939-951',
        identifier: '10.1016/S0140-6736(19)31135-3',
        kind: 'doi',
      },
      {
        label:
          'Lin CY et al. Effects of quetiapine on sleep: a systematic review and meta-analysis of clinical trials. Eur Neuropsychopharmacol 2023;67:22-36',
        identifier: '10.1016/j.euroneuro.2022.11.008',
        kind: 'doi',
      },
      {
        label:
          'Tassniyom K et al. Quetiapine for primary insomnia: a double blind, randomized controlled trial. J Med Assoc Thai 2010;93:729-734',
        identifier: '20572379',
        kind: 'pmid',
      },
      {
        label:
          "Jensen NH et al. N-desalkylquetiapine, a potent norepinephrine reuptake inhibitor and partial 5-HT1A agonist, as a putative mediator of quetiapine's antidepressant activity. Neuropsychopharmacology 2008;33:2303-2312",
        identifier: '10.1038/sj.npp.1301646',
        kind: 'doi',
      },
      {
        label:
          'Quetiapine Fumarate as Monotherapy in the Maintenance Treatment of Patients With Major Depressive Disorder — completed phase 3 trial with no posted results',
        identifier: 'NCT00278941',
        kind: 'nct',
      },
      {
        label:
          'United States Department of Justice. Pharmaceutical Giant AstraZeneca to Pay $520 Million for Off-label Drug Marketing, 27 April 2010',
        identifier:
          'https://www.justice.gov/archives/opa/pr/pharmaceutical-giant-astrazeneca-pay-520-million-label-drug-marketing',
        kind: 'regulatory',
      },
      {
        label: 'Drugs@FDA: SEROQUEL (quetiapine fumarate), NDA 020639, original approval 1997',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020639',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 5002 — quetiapine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5002',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 2. Olanzapine — won the largest independent trial in schizophrenia and lost the argument about
  //    what winning cost.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'olanzapine',
    name: 'Olanzapine',
    tradeName: 'Zyprexa',
    sponsor:
      'Eli Lilly (originator, NDA 020592 approved 1996); the Zyprexa applications are now held by Cheplapharm and the oral molecule has a large generic market',
    targetGene: 'DRD2',
    targetProtein:
      'Dopamine D2 receptor and serotonin 5-HT2A receptor, with high-affinity antagonism also at 5-HT2C, histamine H1, muscarinic M1 to M5 and alpha-1 adrenoceptors. The 5-HT2C and H1 blockade is the leading explanation for the appetite and weight effect.',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1996,
    indication:
      'Schizophrenia in adults and adolescents aged 13 to 17; acute manic or mixed episodes of bipolar I disorder and its maintenance; in combination with fluoxetine for bipolar I depression and for treatment-resistant depression; and as an intramuscular injection for agitation in schizophrenia and bipolar mania',
    patientFriendlyIndication: 'Schizophrenia, and the manic and mixed phases of bipolar disorder',
    anatomicalSite:
      'Mesolimbic and mesocortical dopamine synapses, plus hypothalamic serotonin 5-HT2C and histamine H1 receptors that govern appetite',
    conditionContext: {
      conditionExplainer:
        'Schizophrenia is diagnosed from reported experience and observed behaviour, not from any biological measurement. Every efficacy figure on this page is a change in a score that a trained observer assigned during an interview.',
      whyItMatters:
        'Because symptom scores are what gets measured, the trade-off that decides whether a drug is usable in real life — how much weight it puts on, what it does to blood sugar and lipids over years — is measured in the same trials but is not what the licence turns on. Olanzapine is the clearest case in medicine of a drug winning on the endpoint and losing on the trade-off.',
      whoTakesThis:
        'People with schizophrenia and bipolar disorder, people receiving highly emetogenic chemotherapy, and, in smaller numbers, adults with anorexia nervosa. The oncology use is supported by a National Cancer Institute trial and is not an FDA-approved indication.',
      clinicalGoals:
        'The registration trials measured PANSS and BPRS totals over six weeks. The independent trials measured how long people stayed on the drug, how much weight they gained, and what happened to fasting glucose and lipids.',
    },
    oneSentenceVerdict:
      'The most effective non-clozapine antipsychotic on both the 212-trial pooled ranking (standardised mean difference 0.59) and the largest independent head-to-head trial ever run, where it also had the worst weight gain of fifteen ranked drugs, and whose single cleanest randomised result is in a condition it is not approved for: preventing chemotherapy nausea, 37% versus 22% nausea-free over five days in 380 patients.',
    laymanHowItWorks:
      'Olanzapine blocks dopamine receptors, which is what reduces hallucinations and delusions, and it holds on to them more tightly and for longer than quetiapine does. It also blocks a serotonin receptor and a histamine receptor in the part of the brain that decides when you have eaten enough. Those two receptors are why it works better than most antipsychotics and why it is the hardest of them on body weight and blood sugar. The same appetite effect is what makes it useful against the nausea of chemotherapy and in anorexia nervosa.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 74,
    substitutes: {
      summary:
        'Olanzapine costs about fourteen cents a tablet at United States pharmacy acquisition cost. The choice against it is almost never about symptom control, where it is the strongest of the non-clozapine drugs, and almost always about metabolic cost. Aripiprazole and ziprasidone give up measurable efficacy to avoid the weight gain; clozapine gives up safety monitoring to gain more efficacy; the olanzapine-samidorphan combination charges brand prices to remove about a third of the weight gain.',
      conventionalRx: [
        {
          name: 'Aripiprazole (Abilify)',
          class: 'Dopamine D2 partial agonist',
          howItCompares:
            "Ranked ninth to olanzapine's third on the 15-drug pooled efficacy estimate (SMD 0.43 versus 0.59), and had the smallest prolactin effect of the fifteen. It causes far less weight gain, and it carries an impulse-control warning olanzapine does not.",
          typicalCost:
            'US$0.1251 per tablet at pharmacy acquisition cost, median across 211 listed generic products (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: much less weight gain, no prolactin elevation, similar price. Cons: measurably weaker on overall symptom reduction, akathisia is common, and compulsive gambling and other impulse-control problems are a labelled risk.',
        },
        {
          name: 'Ziprasidone (Geodon)',
          class:
            'Second-generation antipsychotic with 5-HT1A agonism and monoamine reuptake inhibition',
          howItCompares:
            'The one antipsychotic in the 32-drug network meta-analysis whose weight change against placebo was not positive at all: -0.16 kg (95% CrI -0.73 to 0.40). It buys that with the weakest efficacy ranking of the older second-generation drugs and a QT interval effect that required a dedicated 18,154-patient safety study.',
          typicalCost:
            'US$0.3293 per capsule at pharmacy acquisition cost, median across 60 listed generic products (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: metabolically the cleanest drug in the class. Cons: lower pooled efficacy, must be taken with food to be absorbed, QT prolongation.',
        },
        {
          name: 'Clozapine (Clozaril)',
          class: 'Second-generation antipsychotic, the only one licensed for treatment resistance',
          howItCompares:
            'The only drug ranked above olanzapine on both pooled network meta-analyses (SMD 0.88 in 2013, -0.89 in 2019) and the only one with an indication for schizophrenia that has failed other drugs. It requires mandatory blood count monitoring for agranulocytosis, which olanzapine does not.',
          typicalCost:
            'No median generic price is listed for clozapine in the CMS NADAC file consulted for this page',
          prosAndCons:
            'Pros: the highest measured efficacy in the class and the only anti-suicidal indication. Cons: mandatory haematological monitoring, myocarditis, seizures, severe constipation, and weight gain comparable to olanzapine.',
        },
        {
          name: 'Olanzapine with samidorphan (Lybalvi)',
          class: 'Olanzapine combined with a fixed amount of an opioid receptor antagonist',
          howItCompares:
            "Built specifically to keep olanzapine's efficacy and remove its weight gain. In a 561-patient 24-week randomised trial it reduced mean weight gain from 6.59% to 4.21% of body weight and the proportion gaining 10% or more from 29.8% to 17.8%. Symptom improvement was the same as olanzapine alone, because the antipsychotic is the same molecule.",
          typicalCost:
            'A brand-only product; no generic median is listed in the CMS NADAC file consulted for this page',
          prosAndCons:
            'Pros: a third less weight gain, with identical antipsychotic effect. Cons: patients still gained 4.21% of body weight and 27.5% still gained 7% or more, it is contraindicated with opioids, and it is priced as a brand against a fourteen-cent generic.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Ask for the baseline metabolic measurements before the first tablet',
          action:
            'Ask whether weight, waist circumference, fasting glucose or HbA1c, and a lipid panel were recorded before starting, and when they will be repeated.',
          patientImpact:
            'Olanzapine had the largest weight effect of the fifteen antipsychotics ranked in the 2013 pooled analysis (standardised mean difference -0.74 against placebo). Without a baseline, a change over the first year cannot be attributed to anything.',
          clinicalPrecaution:
            'Never stop an antipsychotic on your own to avoid weight gain. Relapse of psychosis is a far larger and faster harm than a metabolic trend, and there are ways to manage the trend that do not involve stopping.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC1=CC2=C(S1)NC3=CC=CC=C3N=C2N4CCN(CC4)C',
      chemicalFormula: 'C17H20N4S',
      molecularWeight: '312.40 g/mol',
      targetReceptorAffinity:
        'A high-affinity antagonist at dopamine D1 to D4, serotonin 5-HT2A, 5-HT2C, 5-HT3 and 5-HT6, histamine H1, muscarinic M1 to M5 and alpha-1 adrenoceptors. Unlike quetiapine it binds D2 tightly and dissociates slowly, which is why its efficacy ranking is higher and its extrapyramidal risk is not negligible. Combined 5-HT2C and H1 antagonism is the standard explanation for the appetite effect.',
      structureSource: {
        label:
          'PubChem CID 135398745 (olanzapine) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/135398745',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ola-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Incoming control of the aminothiophene and the fluoronitrobenzene fragments',
          description:
            'Confirm identity, water content and residual solvent profile of 2-amino-5-methylthiophene-3-carbonitrile and of the ortho-halonitrobenzene coupling partner. The thiophene aminonitrile is oxygen-sensitive and darkens on storage, and the coloured degradants carry into the final crystallisation.',
          reagentsAndBuffer:
            '2-amino-5-methylthiophene-3-carbonitrile and 1-fluoro-2-nitrobenzene reference standards, Karl Fischer titration, headspace gas chromatography for residual solvents, reversed-phase HPLC with UV detection',
        },
        {
          id: 'ola-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Ring closure to the thienobenzodiazepine and amination with N-methylpiperazine',
          description:
            'Couple the aminothiophene to the nitroarene, reduce the nitro group, close the seven-membered diazepine ring to the lactam, then displace the activated position with N-methylpiperazine to install the basic side chain that carries the receptor pharmacology.',
          dependsOnStepId: 'ola-w1',
          reagentsAndBuffer:
            'Sodium hydride or an inorganic base in dimethylformamide for the coupling, stannous chloride or catalytic hydrogenation for the nitro reduction, titanium tetrachloride-mediated cyclisation, N-methylpiperazine in toluene under nitrogen',
        },
        {
          id: 'ola-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Polymorph control and recrystallisation to Form I',
          description:
            'Recrystallise from an anhydrous solvent under controlled cooling to obtain the intended anhydrous crystal form, then confirm by powder X-ray diffraction. Olanzapine has multiple polymorphs and hydrates with different dissolution behaviour, and which one is isolated was the subject of extended patent litigation.',
          dependsOnStepId: 'ola-w2',
          reagentsAndBuffer:
            'Anhydrous ethyl acetate or acetonitrile, controlled cooling ramp, powder X-ray diffraction reference pattern for Form I, differential scanning calorimetry, HPLC assay for related substances',
        },
        {
          id: 'ola-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Brain penetration and hypothalamic exposure check',
          description:
            'Measure unbound brain-to-plasma partitioning in a rodent model and confirm exposure in hypothalamic tissue specifically. The appetite effect is attributed to receptors in the hypothalamus, so a drug concentration measured only in whole brain cannot support or refute that attribution.',
          dependsOnStepId: 'ola-w3',
          reagentsAndBuffer:
            'Rodent plasma and brain homogenate, equilibrium dialysis for unbound fraction determination, phosphate-buffered saline at pH 7.4, LC-MS/MS quantification with a deuterated olanzapine internal standard',
        },
        {
          id: 'ola-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Receptor occupancy panel with 5-HT2C and H1 read out alongside D2',
          description:
            'Run competition binding at D2, 5-HT2A, 5-HT2C, H1 and M1 in parallel. Reporting D2 alone is the specific failure this step exists to prevent: the receptors that predict the metabolic penalty are 5-HT2C and H1, and a panel that omits them describes an olanzapine that does not exist.',
          dependsOnStepId: 'ola-w4',
          reagentsAndBuffer:
            'Membranes from cells expressing human D2, 5-HT2A, 5-HT2C, H1 and M1; [3H]raclopride, [3H]ketanserin, [3H]mesulergine, [3H]pyrilamine and [3H]N-methylscopolamine radioligands; Tris-HCl binding buffer with MgCl2',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ola-a1',
        category: 'measured',
        title: 'CATIE: the only arm where most patients had not quit by 18 months was still 64%',
        laymanSummary:
          'In the largest independent schizophrenia trial ever run, olanzapine kept more people on treatment than any of the other four drugs. It still lost roughly two-thirds of its patients within eighteen months.',
        technicalDetails:
          "CATIE randomised 1,493 patients with chronic schizophrenia at 57 United States sites to olanzapine, perphenazine, quetiapine, risperidone or ziprasidone for up to 18 months, with time to all-cause discontinuation as the primary outcome. Of 1,432 patients who took at least one dose, 74% discontinued: 64% on olanzapine, 74% on risperidone, 75% on perphenazine, 79% on ziprasidone and 82% on quetiapine. Time to discontinuation was significantly longer on olanzapine than on quetiapine (P<0.001) or risperidone (P=0.002), but not significantly longer than on perphenazine (P=0.021) or ziprasidone (P=0.028) at the trial's adjusted threshold. The rates of discontinuation for intolerable side effects differed across groups (P=0.04), with olanzapine accounting for more discontinuation for weight gain or metabolic effects. The trial was funded by the National Institute of Mental Health.",
        evidenceSource: 'Lieberman JA et al., N Engl J Med 2005;353:1209-1223 (CATIE, NCT00014001)',
        doi: '10.1056/NEJMoa051688',
        measuredMetric:
          'Time to discontinuation of assigned treatment for any cause over 18 months',
        auditFlag: 'verified',
      },
      {
        id: 'ola-a2',
        category: 'measured',
        title: 'Third of fifteen on efficacy, last of fifteen on weight',
        laymanSummary:
          'Pooling 212 trials and 43,049 patients, olanzapine was the third most effective antipsychotic on symptom scores, behind only clozapine and amisulpride. In the same analysis it caused more weight gain than any of the other fourteen.',
        technicalDetails:
          'In the Leucht multiple-treatments meta-analysis, standardised mean differences against placebo for overall symptom change were clozapine 0.88 (95% CrI 0.73 to 1.03), amisulpride 0.66 and olanzapine 0.59 (0.53 to 0.65), ahead of risperidone 0.56, paliperidone 0.50, haloperidol 0.45, quetiapine 0.44, aripiprazole 0.43, ziprasidone 0.39 and lurasidone 0.33. On weight gain, the standardised mean differences against placebo ran from -0.09 for haloperidol, the best, to -0.74 for olanzapine, the worst of the fifteen. In the 2019 update covering 402 trials, olanzapine remained among the drugs with significantly increased anticholinergic effects against placebo.',
        evidenceSource:
          'Leucht S et al., Lancet 2013;382:951-962; Huhn M et al., Lancet 2019;394:939-951',
        doi: '10.1016/S0140-6736(13)60733-3',
        measuredMetric:
          'Standardised mean difference against placebo for overall symptom change and for weight gain',
        auditFlag: 'verified',
      },
      {
        id: 'ola-a3',
        category: 'measured',
        title: 'The strongest randomised result is in oncology, for an unapproved use',
        laymanSummary:
          'A National Cancer Institute trial gave olanzapine or a dummy pill to 380 people starting the harshest kind of chemotherapy, on top of the standard anti-sickness drugs. Over five days, 37% on olanzapine had no nausea at all against 22% on placebo.',
        technicalDetails:
          'Navari and colleagues ran a randomised double-blind phase 3 trial in patients with no previous chemotherapy receiving cisplatin at 70 mg/m2 or more, or cyclophosphamide with doxorubicin. All patients received dexamethasone, aprepitant or fosaprepitant and a 5-HT3 antagonist; 192 were assigned olanzapine 10 mg and 188 placebo on days 1 to 4. The proportion with no chemotherapy-induced nausea was 74% versus 45% in the first 24 hours (P=0.002), 42% versus 25% from 25 to 120 hours (P=0.002) and 37% versus 22% over the full 120 hours (P=0.002). Complete response rates were 86% versus 65% (P<0.001), 67% versus 52% (P=0.007) and 64% versus 41% (P<0.001). Severe sedation occurred in 5% on day 2. The trial was funded by the National Cancer Institute. Antiemesis is not an FDA-approved indication for olanzapine.',
        evidenceSource: 'Navari RM et al., N Engl J Med 2016;375:134-142 (NCT02116530)',
        doi: '10.1056/NEJMoa1515725',
        measuredMetric:
          'Proportion of patients with no chemotherapy-induced nausea over 120 hours, and complete response rate',
        auditFlag: 'verified',
      },
      {
        id: 'ola-a4',
        category: 'inferred',
        title: 'The drug built to remove the weight gain removes about a third of it',
        laymanSummary:
          'A combination product was developed to keep olanzapine and cancel its weight gain. In a 561-patient trial it cut average weight gain from 6.6% of body weight to 4.2%. That is a real reduction and it is not a cancellation.',
        technicalDetails:
          'Correll and colleagues randomised 561 adults with schizophrenia to olanzapine combined with samidorphan (n=280) or olanzapine alone (n=281) for 24 weeks, with percent change in body weight and the proportion gaining 10% or more as co-primary endpoints. Least-squares mean weight change was 4.21% (SE 0.68) on the combination against 6.59% (SE 0.67) on olanzapine, a significant difference of -2.38% (SE 0.76). Weight gain of 10% or more occurred in 17.8% against 29.8% (number needed to treat 7.29, odds ratio 0.50) and of 7% or more in 27.5% against 42.7% (number needed to treat 6.29, odds ratio 0.50). Schizophrenia symptom improvement was similar between groups, which is expected because the antipsychotic component is identical. Marketing that describes the product as mitigating weight gain is accurate; reading it as preventing weight gain is not, because more than a quarter of patients still gained 7% or more of their body weight in 24 weeks.',
        evidenceSource: 'Correll CU et al., Am J Psychiatry 2020;177:1168-1178',
        doi: '10.1176/appi.ajp.2020.19121279',
        inferredClaim:
          'That combining olanzapine with samidorphan solves its metabolic problem — the measured result is a 2.38 percentage point reduction on a 6.59% gain, not an elimination',
        auditFlag: 'caution',
      },
      {
        id: 'ola-a5',
        category: 'measured',
        title: 'In anorexia nervosa it moved weight and did not touch the illness',
        laymanSummary:
          'A five-site randomised trial in 152 adults with anorexia nervosa found olanzapine increased the rate of weight gain compared with a dummy pill. It made no difference at all to the obsessional thinking that drives the disorder.',
        technicalDetails:
          'Attia and colleagues randomised 152 adult outpatients with anorexia nervosa, 96% women, mean body mass index 16.7, to olanzapine (n=75) or placebo (n=77) for 16 weeks at five North American sites. The co-primary outcomes were rate of change in body weight and rate of change in obsessionality on the Yale-Brown Obsessive Compulsive Scale. The treatment-by-time interaction for BMI was significant: 0.259 (SD 0.051) units per month on olanzapine against 0.095 (SD 0.053) on placebo. Change in the YBOCS obsessions subscale did not differ (-0.325 against -0.017 points per month), and there was no significant difference in the frequency of abnormal metabolic laboratory results. The authors describe the weight effect as modest and note there was no significant benefit for psychological symptoms.',
        evidenceSource: 'Attia E et al., Am J Psychiatry 2019;176:449-456',
        doi: '10.1176/appi.ajp.2018.18101125',
        measuredMetric:
          'Rate of change in BMI per month and rate of change in YBOCS obsessions subscale score',
        auditFlag: 'verified',
      },
      {
        id: 'ola-a6',
        category: 'failed',
        title: 'The long-acting injection has a syndrome that looks like an overdose',
        laymanSummary:
          'The depot form of olanzapine can accidentally deliver part of the injection into a blood vessel, producing sudden heavy sedation or confusion that looks like an overdose. It happened after roughly one injection in 1,400 and to about one patient in 70.',
        technicalDetails:
          'A review of safety data from all completed and ongoing trials of olanzapine long-acting injection, covering approximately 45,000 injections given to 2,054 patients through 14 October 2008, identified post-injection delirium or sedation syndrome in about 0.07% of injections and 1.4% of patients: 30 events in 29 patients. Presentations were consistent with olanzapine overdose, including sedation, confusion, slurred speech, altered gait or unconsciousness, with no clinically significant change in vital signs. Onset ranged from immediate to three to five hours, median 25 minutes. All patients recovered within 1.5 to 72 hours and most continued to receive further injections. No clear risk factors were identified. The mechanism proposed is accidental partial intravascular injection. The finding is why the product requires administration in a registered healthcare facility with a post-injection observation period.',
        evidenceSource:
          'Detke HC et al., BMC Psychiatry 2010;10:43 (NCT00094640, NCT00088478, NCT00088491, NCT00088465, NCT00320489)',
        doi: '10.1186/1471-244X-10-43',
        measuredMetric:
          'Incidence of post-injection delirium/sedation syndrome per injection and per patient, and time to onset',
        auditFlag: 'caution',
      },
      {
        id: 'ola-a7',
        category: 'conclusion_shift',
        title:
          'The uses beyond the licence were promoted, and settled for US$1.415 billion in 2009',
        laymanSummary:
          'In January 2009 the manufacturer agreed to pay one of the largest pharmaceutical settlements ever recorded in the United States over the promotion of olanzapine for uses the FDA had not approved.',
        technicalDetails:
          'The United States Department of Justice announced in January 2009 that Eli Lilly and Company had agreed to pay US$1.415 billion to resolve allegations of off-label promotion of Zyprexa, including a criminal fine and a civil settlement. The conduct at issue concerned promotion for uses outside the approved indications in elderly populations. The relevance to this page is not the money: it is that the size of the real-world exposure to a drug, and therefore the size of the population in which its metabolic effects were expressed, was shaped by promotion rather than by the trials that supported the licence.',
        evidenceSource:
          'United States Department of Justice, Office of Public Affairs, 15 January 2009: "Eli Lilly and Company Agrees to Pay $1.415 Billion to Resolve Allegations of Off-label Promotion of Zyprexa"',
        inferredClaim:
          'That prescribing volume reflects clinical evidence — for this drug part of it reflects promotion that was found unlawful',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Taken by mouth, or dissolved on the tongue, or injected',
        laymanDesc:
          'A standard tablet, an orally disintegrating wafer for people who will not reliably swallow, a short-acting injection for acute agitation, and a long-acting depot given every two to four weeks in a clinic.',
        molecularDetail:
          'Oral bioavailability is unaffected by food; the terminal half-life is roughly 21 to 54 hours, which supports once-daily dosing. Clearance is hepatic, dominated by direct glucuronidation and CYP1A2. Smoking induces CYP1A2 and lowers exposure substantially, which is why smoking status changes the concentration achieved from the same amount.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It crosses into the brain and reaches the appetite centres too',
        laymanDesc:
          'The molecule is lipophilic and crosses into the brain readily. It does not go only to the regions that matter for psychosis: it reaches the hypothalamus, where hunger and fullness are regulated.',
        molecularDetail:
          'High unbound brain-to-plasma partitioning with distribution throughout the central nervous system, including hypothalamic nuclei expressing 5-HT2C and H1 receptors. The absence of regional selectivity is the structural reason the therapeutic effect and the metabolic effect cannot be separated by dosing.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It binds the dopamine receptor tightly and stays',
        laymanDesc:
          'Unlike quetiapine, olanzapine grips the dopamine receptor firmly and comes off slowly, so the block is sustained between doses. That is why it controls symptoms better, and why stiffness and restlessness are still possible.',
        molecularDetail:
          'High-affinity antagonism at D1 to D4 with slow dissociation from D2, giving sustained striatal occupancy across the dosing interval. Concurrent 5-HT2A antagonism moderates the extrapyramidal consequences of that occupancy, but does not abolish them at the higher end of the licensed range.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'It also blocks the receptors that tell you when you have eaten enough',
        laymanDesc:
          "The same molecule blocks a serotonin receptor and a histamine receptor in the brain's appetite centre. Hunger increases, fullness arrives later, and weight goes up. This is not a side effect that can be dialled out, because it is the same molecule doing both jobs.",
        molecularDetail:
          'Antagonism at 5-HT2C removes a satiety brake and at H1 removes a second one, with downstream effects on hypothalamic AMPK signalling and on peripheral insulin sensitivity. Muscarinic M3 blockade has been proposed as a direct contributor to impaired insulin secretion. The measured consequence is the largest weight effect of fifteen ranked antipsychotics.',
        iconName: 'Scale',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Symptoms fall further than with most alternatives, and so does the tolerability',
        laymanDesc:
          'On the scales trials use, olanzapine outperforms almost every other antipsychotic except clozapine. In the long independent trial it also kept more people on treatment than any other drug, while losing more of them specifically to weight and metabolic problems.',
        molecularDetail:
          'Standardised mean difference against placebo of 0.59 (95% CrI 0.53 to 0.65) for overall symptom change, third of fifteen. Weight gain standardised mean difference of -0.74 against placebo, worst of fifteen. In CATIE, discontinuation attributable to weight gain or metabolic effects was concentrated in the olanzapine arm.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'CATIE phase 1 (NCT00014001)',
        phase: 'Phase 4 independent randomised double-blind effectiveness trial, up to 18 months',
        sampleSize: 1493,
        primaryEndpoint: 'Time to discontinuation of assigned antipsychotic for any cause',
        endpointMet: true,
        statisticalPValue:
          'P < 0.001 for longer time to discontinuation on olanzapine than quetiapine, P = 0.002 versus risperidone; 64% of the olanzapine arm still discontinued',
        unreportedAdverseSignals:
          'Olanzapine accounted for more discontinuation for weight gain or metabolic effects than any other arm, and did not significantly beat perphenazine, a first-generation drug from 1957.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Navari chemotherapy-induced nausea trial (NCT02116530)',
        phase: 'Phase 3 randomised double-blind placebo-controlled trial, 120 hours',
        sampleSize: 380,
        primaryEndpoint:
          'Prevention of nausea over the 120 hours after highly emetogenic chemotherapy, added to dexamethasone, an NK1 antagonist and a 5-HT3 antagonist',
        endpointMet: true,
        statisticalPValue:
          'P = 0.002 for nausea prevention over 120 hours (37% versus 22%); P < 0.001 for complete response (64% versus 41%)',
        unreportedAdverseSignals:
          'Severe sedation on day 2 in 5% of the olanzapine arm. Antiemesis is not an FDA-approved indication for olanzapine, so this National Cancer Institute result supports a use outside the label.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Attia anorexia nervosa trial',
        phase: 'Randomised double-blind placebo-controlled trial, 16 weeks, five sites',
        sampleSize: 152,
        primaryEndpoint:
          'Rate of change in body weight and rate of change in obsessionality on the Yale-Brown Obsessive Compulsive Scale',
        endpointMet: false,
        statisticalPValue:
          'Significant treatment-by-time interaction for BMI (0.259 versus 0.095 units per month); no significant difference in YBOCS obsessions change (-0.325 versus -0.017 points per month)',
        unreportedAdverseSignals:
          'One co-primary endpoint was met and the other was not. A page that reports only the weight result describes half the trial.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Correll olanzapine/samidorphan weight trial',
        phase: 'Phase 3 randomised double-blind active-controlled trial, 24 weeks',
        sampleSize: 561,
        primaryEndpoint:
          'Percent change from baseline in body weight at week 24, and proportion of patients with 10% or greater weight gain',
        endpointMet: true,
        statisticalPValue:
          'Weight change 4.21% versus 6.59%, difference -2.38% (SE 0.76), significant; 10% or greater gain in 17.8% versus 29.8%, odds ratio 0.50',
        unreportedAdverseSignals:
          'The comparator was olanzapine, not placebo. Both arms gained weight; 27.5% of the combination arm still gained 7% or more of body weight in 24 weeks.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Olanzapine long-acting injection safety database (Detke 2010)',
        phase: 'Pooled safety analysis of five registered trials, approximately 45,000 injections',
        sampleSize: 2054,
        primaryEndpoint:
          'Incidence, presentation and outcome of post-injection delirium/sedation syndrome',
        endpointMet: false,
        statisticalPValue:
          'Approximately 0.07% of injections and 1.4% of patients; median onset 25 minutes; all 29 affected patients recovered within 1.5 to 72 hours',
        unreportedAdverseSignals:
          'No clear risk factors were identifiable, which is why the mitigation is a mandatory observation period rather than patient selection.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A standardised mean difference of 0.59 against placebo for overall symptom change, third of fifteen ranked antipsychotics across 212 trials and 43,049 patients',
        'The longest time to all-cause discontinuation of five treatments in CATIE, with 64% of the arm still discontinuing within 18 months',
        'The worst weight effect of the fifteen ranked drugs, standardised mean difference -0.74 against placebo',
        '37% of patients nausea-free over 120 hours after highly emetogenic chemotherapy against 22% on placebo, in 380 randomised patients',
        'A monthly BMI increase of 0.259 against 0.095 units on placebo in 152 adults with anorexia nervosa, with no effect on obsessionality',
        'Post-injection delirium or sedation in 0.07% of roughly 45,000 long-acting injections',
      ],
      unsupportedInferences: [
        'That the samidorphan combination removes the weight problem — it reduced mean gain from 6.59% to 4.21% and left 27.5% of patients gaining 7% or more',
        'That olanzapine treats anorexia nervosa — it changed the rate of weight gain and did not change the obsessional thinking that defines the disorder',
        'That being the most effective non-clozapine antipsychotic makes it the right first choice for everyone — the same analysis ranks it last of fifteen on weight',
        'That the metabolic effect can be avoided by using less — the receptors that drive appetite are bound at lower concentrations than those that control symptoms',
      ],
      whatFailedInitially: [
        "CATIE's primary endpoint was met on olanzapine and still recorded 64% discontinuation, with olanzapine leading the arms for discontinuation due to weight and metabolic effects",
        'The obsessionality co-primary endpoint in the anorexia nervosa trial was not met',
        'The long-acting injectable formulation produced a syndrome resembling overdose in 1.4% of trial patients, with no identifiable risk factors',
      ],
      realWorldOutcome: [
        'About fourteen cents a tablet at United States pharmacy acquisition cost for the generic oral form',
        'A boxed warning for increased mortality in elderly patients with dementia-related psychosis, and a separate boxed warning on the long-acting injection for post-injection delirium and sedation',
        'A US$1.415 billion United States settlement in 2009 over promotion of unapproved uses',
        'Adopted into oncology antiemesis guidelines on the strength of a National Cancer Institute trial, without an FDA indication for it',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, orally disintegrating tablet, short-acting intramuscular injection, and a long-acting intramuscular pamoate depot',
      description:
        'The oral half-life of roughly a day supports once-daily dosing. The orally disintegrating form exists for situations where swallowing cannot be confirmed. The pamoate depot releases olanzapine over two to four weeks and must be given in a registered healthcare facility with a post-injection observation period, because a portion of the depot can enter a blood vessel and produce sudden sedation or delirium.',
      safetyProfile:
        'The United States label carries a boxed warning for increased mortality in elderly patients with dementia-related psychosis; the long-acting injection carries a second boxed warning for post-injection delirium and sedation syndrome. Weight gain, hyperglycaemia, dyslipidaemia and increased appetite are the defining tolerability problems. The class risks of tardive dyskinesia, neuroleptic malignant syndrome and orthostatic hypotension apply. Smoking lowers olanzapine concentrations through CYP1A2 induction, so starting or stopping smoking changes exposure.',
    },
    commonQuestions: [
      {
        q: 'Is olanzapine the most effective antipsychotic?',
        a: 'It is the most effective one that does not require weekly blood tests. Across 212 randomised trials and 43,049 patients, only clozapine (standardised mean difference 0.88) and amisulpride (0.66) ranked above olanzapine (0.59) for overall symptom reduction, and in the largest independent head-to-head trial it kept more people on treatment than four comparators. The same pooled analysis ranks it last of fifteen for weight gain. Both facts come from the same dataset and neither cancels the other.',
      },
      {
        q: 'Can the weight gain be avoided?',
        a: 'Not by adjusting the amount, because the receptors that drive appetite are blocked at concentrations at or below those that control symptoms. The one pharmaceutical attempt to separate them is the combination with samidorphan, and in a 561-patient 24-week trial it reduced mean weight gain from 6.59% of body weight to 4.21%, with 27.5% of patients still gaining 7% or more. That is a genuine reduction and it is not a solution. What is measurable and worth doing is recording weight, waist circumference, fasting glucose and lipids before the first tablet, so that a change over the first year can be attributed to something.',
        auditNote:
          'The product built specifically to fix this is the strongest available evidence about how fixable it is, and it reports a partial fix.',
      },
      {
        q: 'Why is it used for chemotherapy sickness?',
        a: 'Because a National Cancer Institute trial tested it and it worked. Three hundred and eighty patients starting cisplatin or cyclophosphamide-doxorubicin received olanzapine or placebo on top of the standard three-drug antiemetic regimen; 37% on olanzapine had no nausea at all over the five days after chemotherapy against 22% on placebo, and complete response was 64% against 41%. Five per cent had severe sedation on day two. Antiemesis is not an approved indication in the United States, so this is a use supported by a large public trial and not by a licence, which is an unusual combination and worth stating plainly.',
      },
      {
        q: 'Does it treat anorexia nervosa?',
        a: 'It moves weight and it does not treat the illness. In a 152-patient five-site randomised trial, BMI rose 0.259 units per month on olanzapine against 0.095 on placebo, a real difference in a condition where weight change is notoriously hard to produce. The other co-primary endpoint, obsessional thinking measured on the Yale-Brown Obsessive Compulsive Scale, showed no difference at all (-0.325 against -0.017 points per month). Reporting the weight result without the obsessionality result describes half of a two-endpoint trial.',
      },
      {
        q: 'Why does this page show a price but no manufacturing cost?',
        a: 'Because no verifiable per-dose cost of production for olanzapine could be found and cited. The figure quoted is the CMS National Average Drug Acquisition Cost, the price United States pharmacies pay to buy the drug, surveyed by the Centers for Medicare and Medicaid Services. That is a price, not a cost of manufacture. The synthesis is a multi-step route through a thienobenzodiazepine core with a controlled crystallisation at the end, which is more involved than metformin and much less involved than a biologic, but a qualitative statement about difficulty is not a cost figure and this page will not present it as one.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Lieberman JA et al. Effectiveness of antipsychotic drugs in patients with chronic schizophrenia. N Engl J Med 2005;353:1209-1223',
        identifier: '10.1056/NEJMoa051688',
        kind: 'doi',
      },
      {
        label: 'CATIE — Clinical Antipsychotic Trials of Intervention Effectiveness, schizophrenia',
        identifier: 'NCT00014001',
        kind: 'nct',
      },
      {
        label:
          'Leucht S et al. Comparative efficacy and tolerability of 15 antipsychotic drugs in schizophrenia: a multiple-treatments meta-analysis. Lancet 2013;382:951-962',
        identifier: '10.1016/S0140-6736(13)60733-3',
        kind: 'doi',
      },
      {
        label:
          'Huhn M et al. Comparative efficacy and tolerability of 32 oral antipsychotics for the acute treatment of adults with multi-episode schizophrenia. Lancet 2019;394:939-951',
        identifier: '10.1016/S0140-6736(19)31135-3',
        kind: 'doi',
      },
      {
        label:
          'Navari RM et al. Olanzapine for the prevention of chemotherapy-induced nausea and vomiting. N Engl J Med 2016;375:134-142',
        identifier: '10.1056/NEJMoa1515725',
        kind: 'doi',
      },
      {
        label:
          'Olanzapine for the prevention of chemotherapy-induced nausea and vomiting — Alliance trial',
        identifier: 'NCT02116530',
        kind: 'nct',
      },
      {
        label:
          'Attia E et al. Olanzapine versus placebo in adult outpatients with anorexia nervosa: a randomized clinical trial. Am J Psychiatry 2019;176:449-456',
        identifier: '10.1176/appi.ajp.2018.18101125',
        kind: 'doi',
      },
      {
        label:
          'Correll CU et al. Effects of olanzapine combined with samidorphan on weight gain in schizophrenia: a 24-week phase 3 study. Am J Psychiatry 2020;177:1168-1178',
        identifier: '10.1176/appi.ajp.2020.19121279',
        kind: 'doi',
      },
      {
        label:
          'Detke HC et al. Post-injection delirium/sedation syndrome in patients with schizophrenia treated with olanzapine long-acting injection, I: analysis of cases. BMC Psychiatry 2010;10:43',
        identifier: '10.1186/1471-244X-10-43',
        kind: 'doi',
      },
      {
        label:
          'United States Department of Justice. Eli Lilly and Company Agrees to Pay $1.415 Billion to Resolve Allegations of Off-label Promotion of Zyprexa, 15 January 2009',
        identifier:
          'https://www.justice.gov/archives/opa/pr/eli-lilly-and-company-agrees-pay-1415-billion-resolve-allegations-label-promotion-zyprexa',
        kind: 'regulatory',
      },
      {
        label: 'Drugs@FDA: ZYPREXA (olanzapine), NDA 020592, original approval 1996',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020592',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 135398745 — olanzapine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/135398745',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 3. Risperidone — the one antipsychotic with a real paediatric indication, and the one whose
  //    hormonal effect turned into a litigation record.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'risperidone',
    name: 'Risperidone',
    tradeName: 'Risperdal',
    sponsor:
      'Janssen Pharmaceuticals, a Johnson & Johnson company (originator, NDA 020272 approved 1993); the oral form is now widely generic, and long-acting injectable versions are marketed as Risperdal Consta, Perseris, Uzedy and Rykindo',
    targetGene: 'HTR2A',
    targetProtein:
      'Serotonin 5-HT2A receptor and dopamine D2 receptor, antagonised with high affinity, together with alpha-1 and alpha-2 adrenoceptors and histamine H1. The 9-hydroxy metabolite, paliperidone, is equally active and is itself marketed as a separate drug.',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1993,
    indication:
      'Schizophrenia in adults and adolescents aged 13 to 17; acute manic or mixed episodes of bipolar I disorder in adults and in children aged 10 to 17, alone or with lithium or valproate; and irritability associated with autistic disorder in patients aged 5 to 17',
    patientFriendlyIndication:
      'Schizophrenia, bipolar mania, and severe irritability, aggression or self-injury in children with autism',
    anatomicalSite:
      'Mesolimbic dopamine synapses in the brain, and the pituitary lactotroph cells that sit outside the blood-brain barrier',
    conditionContext: {
      conditionExplainer:
        'Risperidone covers three separate populations: adults with schizophrenia, adults and children with bipolar mania, and children aged five and up with autism who have severe tantrums, aggression or self-injury. The autism indication is not for autism; it is for a specific set of behaviours that occur alongside it.',
      whyItMatters:
        'The paediatric indication means children take this drug for years during physical development, which is exactly when a hormonal effect matters most. Risperidone raises prolactin more than almost any other antipsychotic, and the consequences of that were measured in adolescents rather than in the adult trials that supported the licence.',
      whoTakesThis:
        'Adults with schizophrenia and bipolar disorder; children and adolescents with autism-associated irritability; and, off-label and against the evidence below, veterans with post-traumatic stress disorder and elderly people with dementia.',
      clinicalGoals:
        'The registration trials measured PANSS totals in schizophrenia, Young Mania Rating Scale scores in mania, and the Irritability subscale of the Aberrant Behavior Checklist in autism, over six to eight weeks.',
    },
    oneSentenceVerdict:
      'A tight-binding dopamine and serotonin blocker ranked fourth of fifteen antipsychotics on pooled efficacy, holder of the only convincing randomised result in autism-associated irritability (a 56.9% fall in the irritability score against 14.1% on placebo in 101 children), and the antipsychotic whose prolactin elevation produced a measured four-fold rise in gynaecomastia among males aged 15 to 25.',
    laymanHowItWorks:
      'Risperidone blocks two receptors at once: the dopamine receptor that antipsychotics act on, and a serotonin receptor that softens the movement side effects dopamine blockade usually causes. It binds both tightly. The pituitary gland, which controls hormones, sits outside the barrier that protects the brain, so it is exposed to more risperidone than the brain is, and the dopamine block there releases the brake on prolactin. That is why breast tissue growth, milk production and sexual side effects are more common with this drug than with most of its alternatives.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 72,
    substitutes: {
      summary:
        "Risperidone is the cheapest antipsychotic in this batch at about six cents a tablet, and on pooled efficacy it is beaten only by clozapine, amisulpride and olanzapine. The case against it is almost always prolactin. Aripiprazole is the mirror image: the lowest prolactin effect of the fifteen ranked drugs and a measurably weaker effect on symptoms. Paliperidone is the same molecule's active metabolite and raises prolactin more, not less.",
      conventionalRx: [
        {
          name: 'Aripiprazole (Abilify)',
          class: 'Dopamine D2 partial agonist',
          howItCompares:
            "The only drug in the 15-drug pooled ranking whose prolactin effect against placebo pointed in the opposite direction to every other antipsychotic (standardised mean difference 0.22, against -1.30 for paliperidone at the other end). It ranked ninth on efficacy against risperidone's fourth, and it also holds an autism-irritability indication.",
          typicalCost:
            'US$0.1251 per tablet at pharmacy acquisition cost, median across 211 listed generic products (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: essentially no prolactin elevation, much less weight gain, the same paediatric autism indication. Cons: weaker on symptom control, prominent akathisia, and a labelled risk of compulsive gambling and other impulse-control problems.',
        },
        {
          name: 'Olanzapine (Zyprexa)',
          class: 'Second-generation antipsychotic, multi-receptor antagonist',
          howItCompares:
            "Ranked one place above risperidone on pooled efficacy (SMD 0.59 versus 0.56) and had the longest time to all-cause discontinuation in CATIE, where risperidone was third of five. It trades risperidone's prolactin problem for the worst weight and metabolic profile of the fifteen ranked drugs.",
          typicalCost:
            'US$0.1432 per tablet at pharmacy acquisition cost, median across 167 listed generic products (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: slightly better symptom control, much less prolactin elevation. Cons: the largest weight gain of the class and a corresponding metabolic burden.',
        },
        {
          name: 'Paliperidone (Invega)',
          class: 'The 9-hydroxy active metabolite of risperidone, marketed as a separate drug',
          howItCompares:
            "Chemically it is what the body turns risperidone into. It ranked fifth to risperidone's fourth on pooled efficacy, and it produced the largest prolactin elevation of the 32 antipsychotics in the 2019 network meta-analysis (+48.51 ng/mL against placebo). It costs roughly sixteen times as much per tablet.",
          typicalCost:
            'US$1.01 per tablet at pharmacy acquisition cost, median across 56 listed generic products (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: renal rather than hepatic clearance, so CYP2D6 status matters less, and a once-monthly and once-three-monthly injectable range risperidone does not have. Cons: more prolactin elevation, not less, and a far higher price for the same pharmacology.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Ask for a prolactin measurement if breast or sexual symptoms appear',
          action:
            'If breast tenderness, breast enlargement, milk production, absent periods or loss of sexual function starts after risperidone, ask for a serum prolactin level.',
          patientImpact:
            'In a case-control study inside a cohort of 401,924 males aged 15 to 25, current risperidone users had roughly four times the rate of gynaecomastia diagnosis (rate ratio 3.91, 95% CI 2.01 to 7.62), and five times among those aged 18 and under (5.44, 95% CI 1.50 to 19.74).',
          clinicalPrecaution:
            'Prolactin can also be raised by pregnancy, thyroid disease and a pituitary tumour. A single number identifies the problem; it does not identify the cause, and stopping an antipsychotic on your own is not the way to find out.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC1=C(C(=O)N2CCCCC2=N1)CCN3CCC(CC3)C4=NOC5=C4C=CC(=C5)F',
      chemicalFormula: 'C23H27FN4O2',
      molecularWeight: '410.50 g/mol',
      targetReceptorAffinity:
        'A high-affinity antagonist at serotonin 5-HT2A and dopamine D2, with substantial affinity at alpha-1 and alpha-2 adrenoceptors and histamine H1, and negligible muscarinic affinity. It is a P-glycoprotein substrate, so brain exposure is lower relative to plasma than the raw affinity suggests, while the pituitary lies outside the blood-brain barrier and is fully exposed. That asymmetry is the standard mechanistic account of why prolactin elevation is disproportionate to central occupancy.',
      structureSource: {
        label: 'PubChem CID 5073 (risperidone) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5073',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ris-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Incoming control of the benzisoxazole piperidine and the pyrimidinone fragment',
          description:
            'Confirm identity and purity of 6-fluoro-3-(piperidin-4-yl)-1,2-benzisoxazole and of the chloroethyl-substituted tetrahydropyrido-pyrimidinone before alkylation. The benzisoxazole ring opens under strongly basic conditions to a hydroxy-aryl ketoxime, which is the degradation product the monograph tracks.',
          reagentsAndBuffer:
            '6-fluoro-3-(piperidin-4-yl)-1,2-benzisoxazole and 3-(2-chloroethyl)-2-methyl-6,7,8,9-tetrahydro-4H-pyrido[1,2-a]pyrimidin-4-one reference standards, Karl Fischer titration, reversed-phase HPLC with UV detection',
        },
        {
          id: 'ris-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'N-alkylation joining the two halves',
          description:
            'Alkylate the piperidine nitrogen with the chloroethyl side chain of the pyrimidinone in the presence of base and an iodide catalyst. One carbon-nitrogen bond joins the receptor-binding benzisoxazole to the pyrimidinone that tunes the pharmacokinetics.',
          dependsOnStepId: 'ris-w1',
          reagentsAndBuffer:
            'Sodium carbonate or diisopropylethylamine as base, catalytic potassium iodide, dimethylformamide or N-methylpyrrolidone at elevated temperature under nitrogen',
        },
        {
          id: 'ris-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation and control of the 9-hydroxy impurity',
          description:
            'Recrystallise the free base and assay for related substances, with specific attention to 9-hydroxyrisperidone. That impurity is not inert: it is paliperidone, a licensed antipsychotic in its own right, and it is also the metabolite the body produces, so the specification exists for consistency rather than for toxicity.',
          dependsOnStepId: 'ris-w2',
          reagentsAndBuffer:
            'Methanol or isopropanol with water as anti-solvent, activated charcoal, 9-hydroxyrisperidone reference impurity, phosphate buffer with acetonitrile for the HPLC assay',
        },
        {
          id: 'ris-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'P-glycoprotein efflux and brain-versus-pituitary exposure comparison',
          description:
            'Measure bidirectional transport across a P-glycoprotein-expressing monolayer, then compare unbound concentration in brain tissue against pituitary tissue in a rodent model. This step exists to test the central mechanistic claim of the drug: that the pituitary sees more risperidone than the brain does, which is why prolactin rises out of proportion to central receptor occupancy.',
          dependsOnStepId: 'ris-w3',
          reagentsAndBuffer:
            'MDCK-MDR1 monolayers on Transwell inserts, Hanks balanced salt solution with HEPES, elacridar as efflux inhibitor control, rodent brain and pituitary homogenate with equilibrium dialysis, LC-MS/MS with a deuterated internal standard',
        },
        {
          id: 'ris-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Receptor binding panel with a prolactin release readout',
          description:
            'Run competition binding at 5-HT2A, D2 and alpha-1 for both risperidone and 9-hydroxyrisperidone, and in parallel measure prolactin release from cultured pituitary cells. Measuring binding alone would report a receptor number; measuring prolactin reports the consequence that patients actually experience.',
          dependsOnStepId: 'ris-w4',
          reagentsAndBuffer:
            'Membranes from cells expressing human 5-HT2A, D2 and alpha-1; [3H]ketanserin and [3H]raclopride radioligands; GH3 or primary rat anterior pituitary cell culture with a prolactin immunoassay; dopamine as reference agonist',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ris-a1',
        category: 'measured',
        title: 'The one convincing antipsychotic result in childhood autism-related irritability',
        laymanSummary:
          'In 101 children aged five to seventeen with autism and severe tantrums, aggression or self-injury, eight weeks of risperidone cut the irritability score by 57% against 14% on a dummy pill. Two-thirds of those who improved were still improved at six months.',
        technicalDetails:
          'The Research Units on Pediatric Psychopharmacology Autism Network randomised 101 children (82 boys, 19 girls, mean age 8.8 years) to risperidone (n=49) or placebo (n=52) for eight weeks, with the Irritability subscale of the Aberrant Behavior Checklist and the Clinical Global Impressions-Improvement rating as co-primary outcomes. Irritability fell 56.9% on risperidone against 14.1% on placebo (P<0.001). Positive response, defined as at least a 25% fall in irritability plus a rating of much or very much improved, occurred in 69% (34 of 49) against 12% (6 of 52), P<0.001. Weight gain averaged 2.7 kg (SD 2.9) against 0.8 kg (SD 2.2) on placebo, P<0.001, and increased appetite, fatigue, drowsiness, dizziness and drooling were all more common on drug. In 23 of the 34 responders the benefit was maintained at six months. The authors state explicitly that the short trial duration limits inference about tardive dyskinesia.',
        evidenceSource: 'McCracken JT et al., N Engl J Med 2002;347:314-321 (RUPP Autism Network)',
        doi: '10.1056/NEJMoa013171',
        measuredMetric:
          'Percentage change in the Aberrant Behavior Checklist Irritability subscale at 8 weeks, and positive response rate',
        auditFlag: 'verified',
      },
      {
        id: 'ris-a2',
        category: 'failed',
        title: 'A 296-veteran VA trial found nothing at all in post-traumatic stress disorder',
        laymanSummary:
          'Risperidone was widely added to antidepressants for veterans whose PTSD had not responded. A six-month randomised trial across 23 Veterans Administration centres found no benefit on the PTSD scale, none on depression, and none on quality of life.',
        technicalDetails:
          'Veterans Affairs Cooperative Study No. 504 randomised veterans with chronic military-related PTSD and persistent symptoms despite at least two adequate serotonin reuptake inhibitor trials to adjunctive risperidone up to 4 mg daily or placebo for six months at 23 VA outpatient centres between February 2007 and February 2010. Of 367 screened, 296 were diagnosed and 247 contributed to the primary analysis. Change in Clinician-Administered PTSD Scale score at 24 weeks was -16.3 (95% CI -19.7 to -12.9) on risperidone and -12.5 (95% CI -15.7 to -9.4) on placebo; the mean difference of 3.74 (95% CI -0.86 to 8.35) was not significant (t=1.6, P=0.11). A mixed model across all time points likewise showed no difference (mean difference 2.73, 95% CI -0.74 to 6.20, P=0.12). Risperidone did not reduce depression (MADRS mean difference 1.19, P=0.11) or anxiety (HAMA mean difference 1.16, P=0.09) and did not increase quality of life.',
        evidenceSource: 'Krystal JH et al., JAMA 2011;306:493-502 (VA Cooperative Study No. 504)',
        doi: '10.1001/jama.2011.1080',
        measuredMetric:
          'Change in Clinician-Administered PTSD Scale score from baseline to 24 weeks',
        auditFlag: 'verified',
      },
      {
        id: 'ris-a3',
        category: 'measured',
        title: 'Four times the rate of gynaecomastia in young men taking it',
        laymanSummary:
          'Risperidone raises prolactin, the hormone that drives breast tissue growth. In a database study of over 400,000 young men, those currently taking it were diagnosed with breast enlargement about four times as often as non-users, and five times as often among those aged eighteen and under.',
        technicalDetails:
          "Etminan and colleagues built a cohort of 401,924 males aged 15 to 25 from the IMS LifeLink claims database and ran a nested case-control analysis, identifying 1,556 incident gynaecomastia diagnoses matched to 15,560 controls by age, follow-up and calendar time. Current risperidone users had an adjusted rate ratio of 3.91 (95% CI 2.01 to 7.62); restricted to those aged 18 and under, the rate ratio was 5.44 (95% CI 1.50 to 19.74). The mechanism is dopamine D2 blockade at pituitary lactotrophs, which sit outside the blood-brain barrier and are therefore fully exposed while central penetration is limited by P-glycoprotein efflux. In the pooled network meta-analysis of 32 antipsychotics, the prolactin elevation range ran to 48.51 ng/mL for paliperidone, risperidone's own active metabolite. This is claims data rather than a randomised trial, so confounding by indication cannot be excluded, but the pharmacological mechanism is not in dispute.",
        evidenceSource:
          'Etminan M, Carleton B, Brophy JM, J Child Adolesc Psychopharmacol 2015;25:671-673',
        doi: '10.1089/cap.2015.0024',
        measuredMetric:
          'Adjusted rate ratio for incident gynaecomastia diagnosis in current risperidone users aged 15 to 25',
        auditFlag: 'verified',
      },
      {
        id: 'ris-a4',
        category: 'measured',
        title: 'Fourth of fifteen on efficacy, and third of five in the independent trial',
        laymanSummary:
          'Across 212 randomised trials, risperidone ranked fourth of fifteen antipsychotics on symptom reduction. In the eighteen-month independent trial that compared five drugs head to head, 74% of the risperidone arm stopped taking it.',
        technicalDetails:
          "In the Leucht multiple-treatments meta-analysis of 212 trials and 43,049 patients, risperidone's standardised mean difference against placebo for overall symptom change was 0.56 (95% CrI 0.50 to 0.63), behind clozapine 0.88, amisulpride 0.66 and olanzapine 0.59, and ahead of paliperidone 0.50, haloperidol 0.45, quetiapine 0.44 and aripiprazole 0.43. In CATIE, 74% of the risperidone arm discontinued within 18 months against 64% on olanzapine (P=0.002 for the difference in time to discontinuation), 75% on perphenazine, 79% on ziprasidone and 82% on quetiapine. In the 2019 network meta-analysis of 32 drugs, risperidone was among those with significantly higher anticholinergic effects than placebo and among those requiring more antiparkinson medication than several newer agents.",
        evidenceSource:
          'Leucht S et al., Lancet 2013;382:951-962; Lieberman JA et al., N Engl J Med 2005;353:1209-1223',
        doi: '10.1016/S0140-6736(13)60733-3',
        measuredMetric:
          'Standardised mean difference against placebo for overall symptom change, and 18-month all-cause discontinuation',
        auditFlag: 'verified',
      },
      {
        id: 'ris-a5',
        category: 'conclusion_shift',
        title: 'In dementia, the class went from standard practice to boxed warning',
        laymanSummary:
          'Antipsychotics including risperidone were routinely given to agitated residents of care homes. A pooled analysis of fifteen randomised trials found more deaths on drug than on placebo, and the FDA added a boxed warning to the whole class.',
        technicalDetails:
          'Schneider and colleagues pooled fifteen randomised placebo-controlled trials of atypical antipsychotics in dementia, nine of them unpublished, covering 3,353 patients randomised to drug and 1,757 to placebo, with five of the sixteen drug-placebo contrasts contributed by risperidone. Death occurred in 3.5% on drug against 2.3% on placebo, odds ratio 1.54 (95% CI 1.06 to 2.23, P=0.02), risk difference 0.01 (95% CI 0.004 to 0.02, P=0.01). Sensitivity analyses found no evidence of differential risk between individual drugs. In the separate CATIE-AD trial of 421 outpatients, risperidone had the longest median time to discontinuation for lack of efficacy of any arm (26.7 weeks against 9.0 for placebo, P=0.002 across arms) but no significant advantage on the Clinical Global Impression of Change at 12 weeks (29% improved against 21% on placebo, P=0.22), and 18% discontinued for intolerability against 5% on placebo. The FDA added the class boxed warning for increased mortality in dementia-related psychosis in 2005.',
        evidenceSource:
          'Schneider LS et al., JAMA 2005;294:1934-1943; Schneider LS et al., N Engl J Med 2006;355:1525-1538 (CATIE-AD, NCT00015548)',
        doi: '10.1001/jama.294.15.1934',
        inferredClaim:
          'That antipsychotics are an appropriate routine treatment for agitation in dementia — reversed by pooled randomised mortality data and a boxed warning',
        auditFlag: 'contested',
      },
      {
        id: 'ris-a6',
        category: 'conclusion_shift',
        title:
          'The elderly and paediatric uses were promoted, and settled for US$2.2 billion in 2013',
        laymanSummary:
          'In November 2013 Johnson & Johnson and Janssen agreed to pay more than two billion dollars to resolve United States criminal and civil investigations, with the promotion of risperidone for uses outside its licence among the conduct at issue.',
        technicalDetails:
          "The United States Department of Justice announced in November 2013 that Johnson & Johnson and its subsidiaries would pay more than US$2.2 billion to resolve criminal and civil liability arising from allegations relating to the prescription drugs Risperdal, Invega and Natrecor, including promotion for uses not approved as safe and effective. Invega is paliperidone, risperidone's own active metabolite. The relevance here is the sequence: the elderly-dementia and paediatric prescribing patterns that the safety literature above was written to evaluate were, in part, produced by promotion that was later found unlawful, rather than by the trials that supported the licence.",
        evidenceSource:
          'United States Department of Justice, Office of Public Affairs, 4 November 2013: "Johnson & Johnson to Pay More Than $2.2 Billion to Resolve Criminal and Civil Investigations"',
        inferredClaim:
          'That the observed prescribing pattern in elderly and paediatric populations reflected accumulating clinical evidence',
        auditFlag: 'contested',
      },
      {
        id: 'ris-a7',
        category: 'inferred',
        title:
          'The metabolite was relaunched as a separate branded drug at sixteen times the price',
        laymanSummary:
          'When the body processes risperidone it produces a second active molecule. That molecule was developed and licensed as its own drug, Invega, shortly before risperidone lost patent protection. It is not more effective.',
        technicalDetails:
          "Paliperidone is 9-hydroxyrisperidone, the principal active metabolite of risperidone, licensed in 2006 under a separate application. In the 15-drug pooled ranking, paliperidone's standardised mean difference against placebo was 0.50 (95% CrI 0.39 to 0.60), below risperidone's 0.56 (0.50 to 0.63); the credible intervals overlap and neither can be called superior. On prolactin, paliperidone produced the largest elevation of the 32 drugs in the 2019 network meta-analysis, +48.51 ng/mL against placebo (95% CrI 43.52 to 53.51). Current United States pharmacy acquisition cost is about US$1.01 per paliperidone tablet against US$0.0644 per risperidone tablet. What paliperidone genuinely adds is renal rather than CYP2D6-dependent clearance and a monthly and three-monthly injectable range.",
        evidenceSource:
          'Leucht S et al., Lancet 2013;382:951-962; Huhn M et al., Lancet 2019;394:939-951; CMS NADAC file',
        doi: '10.1016/S0140-6736(19)31135-3',
        inferredClaim:
          'That paliperidone is an improvement on risperidone — the pooled efficacy estimate is slightly lower, the prolactin elevation is the largest measured in the class, and the price is roughly sixteen times higher',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A tablet, a dissolving wafer, or an injection lasting two weeks to a month',
        laymanDesc:
          'Risperidone is taken daily by mouth, or given as an injection that releases slowly over two weeks or a month. The injectable versions exist because taking a tablet every day is the step that most often fails.',
        molecularDetail:
          'Oral half-life of about 3 hours for risperidone and 21 hours for 9-hydroxyrisperidone, so the active moiety behaves as a once-daily drug. Risperdal Consta releases from polymer microspheres over roughly two weeks with a three-week lag; Perseris and Uzedy are subcutaneous depots with different release kinetics.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The liver converts part of it into a second drug that does the same job',
        laymanDesc:
          'CYP2D6, a liver enzyme whose activity varies a great deal between people, converts risperidone into 9-hydroxyrisperidone. That second molecule is just as active, so the total effect is more consistent than the enzyme variation would suggest.',
        molecularDetail:
          'CYP2D6-mediated 9-hydroxylation produces paliperidone. Poor metabolisers have higher risperidone and lower paliperidone concentrations; extensive metabolisers the reverse. Because both are active and roughly equipotent, the sum, referred to as the active moiety, varies far less than either component, which is why CYP2D6 genotyping has not become routine for this drug.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It blocks serotonin and dopamine receptors, serotonin first',
        laymanDesc:
          'Risperidone blocks a serotonin receptor at lower concentrations than it blocks the dopamine receptor. The serotonin block is what softens the stiffness and tremor that pure dopamine blockade produces, up to a point.',
        molecularDetail:
          'Higher affinity for 5-HT2A than for D2, with sustained D2 occupancy at licensed exposures. Above roughly 80% striatal D2 occupancy the extrapyramidal threshold is crossed regardless of 5-HT2A blockade, which is why risperidone is dose-dependently more parkinsonian than quetiapine and required more antiparkinson medication than several newer drugs in the 32-drug network meta-analysis.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: "The pituitary is outside the brain's protective barrier, and it gets a full dose",
        laymanDesc:
          'The gland that controls hormones sits outside the barrier that keeps most molecules out of the brain, so it is exposed to more risperidone than the brain is. Dopamine normally holds prolactin down; blocking it there lets prolactin rise.',
        molecularDetail:
          'Risperidone is a P-glycoprotein substrate, so central exposure is attenuated relative to plasma, while anterior pituitary lactotrophs lie outside the blood-brain barrier and see unattenuated concentrations. D2 blockade at those lactotrophs removes tonic dopaminergic inhibition of prolactin secretion. The clinical consequences are gynaecomastia, galactorrhoea, amenorrhoea and sexual dysfunction, and the measured consequence in claims data is a rate ratio of 3.91 for gynaecomastia in males aged 15 to 25.',
        iconName: 'AlertTriangle',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Symptoms and irritability scores fall, and prolactin rises',
        laymanDesc:
          'On the scales the trials use, risperidone is among the more effective antipsychotics, and in children with autism it produced the largest measured reduction in irritability of any drug tested. The hormonal effect runs alongside, not instead.',
        molecularDetail:
          'Standardised mean difference of 0.56 (95% CrI 0.50 to 0.63) against placebo for overall symptom change in acute schizophrenia, fourth of fifteen. In autism-associated irritability, a 56.9% reduction in the Aberrant Behavior Checklist Irritability subscale against 14.1% on placebo over eight weeks, with 2.7 kg of weight gain against 0.8 kg.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'RUPP Autism Network risperidone trial (McCracken 2002)',
        phase: 'Multisite randomised double-blind placebo-controlled trial, 8 weeks',
        sampleSize: 101,
        primaryEndpoint:
          'Aberrant Behavior Checklist Irritability subscale score and Clinical Global Impressions-Improvement rating at 8 weeks in children aged 5 to 17 with autistic disorder',
        endpointMet: true,
        statisticalPValue:
          'P < 0.001 for a 56.9% versus 14.1% reduction in irritability, and for a 69% versus 12% positive response rate',
        unreportedAdverseSignals:
          'Weight gain of 2.7 kg against 0.8 kg on placebo over eight weeks, with increased appetite, fatigue, drowsiness, dizziness and drooling all significantly more common. The authors state the trial was too short to say anything about tardive dyskinesia.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'VA Cooperative Study No. 504 (Krystal 2011)',
        phase:
          'Randomised double-blind placebo-controlled multicentre trial, 6 months, 23 VA centres',
        sampleSize: 296,
        primaryEndpoint:
          'Change in Clinician-Administered PTSD Scale score from baseline to 24 weeks with adjunctive risperidone in antidepressant-resistant military-related PTSD',
        endpointMet: false,
        statisticalPValue:
          'Mean difference 3.74 on a 0-136 scale (95% CI -0.86 to 8.35), t = 1.6, P = 0.11',
        unreportedAdverseSignals:
          'No benefit on depression (P = 0.11), anxiety (P = 0.09) or quality of life either. Only the observer-rated Clinical Global Impression reached nominal significance (P = 0.04) among many secondary measures.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'CATIE phase 1 (NCT00014001)',
        phase: 'Phase 4 independent randomised double-blind effectiveness trial, up to 18 months',
        sampleSize: 1493,
        primaryEndpoint: 'Time to discontinuation of assigned antipsychotic for any cause',
        endpointMet: false,
        statisticalPValue:
          'P = 0.002 for shorter time to discontinuation on risperidone than olanzapine; 74% of the risperidone arm discontinued within 18 months',
        unreportedAdverseSignals:
          'Risperidone did not separate from perphenazine, a first-generation drug approved in 1957 and costing about seventeen cents a tablet.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'CATIE-AD (NCT00015548)',
        phase: 'Independent randomised double-blind placebo-controlled trial, up to 36 weeks',
        sampleSize: 421,
        primaryEndpoint:
          'Time to discontinuation for any reason, and improvement on the Clinical Global Impression of Change at 12 weeks in Alzheimer disease',
        endpointMet: false,
        statisticalPValue:
          'CGIC improvement 29% on risperidone versus 21% on placebo, P = 0.22 across arms; median time to discontinuation for lack of efficacy 26.7 weeks versus 9.0 on placebo, P = 0.002',
        unreportedAdverseSignals:
          'Discontinuation for intolerability was 18% on risperidone against 5% on placebo (P = 0.009). The efficacy advantage and the intolerability disadvantage cancelled on the primary endpoint.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Etminan gynaecomastia case-control study',
        phase: 'Nested case-control analysis within a claims cohort of 401,924 males aged 15 to 25',
        sampleSize: 1556,
        primaryEndpoint:
          'Adjusted rate ratio for incident gynaecomastia diagnosis in current risperidone users versus non-users',
        endpointMet: true,
        statisticalPValue:
          'Rate ratio 3.91 (95% CI 2.01 to 7.62) overall; 5.44 (95% CI 1.50 to 19.74) in those aged 18 and under',
        unreportedAdverseSignals:
          'Observational claims data. Confounding by indication cannot be excluded, and gynaecomastia is identified by diagnostic code rather than by examination.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A 56.9% reduction in the Aberrant Behavior Checklist Irritability subscale against 14.1% on placebo in 101 randomised children with autistic disorder',
        'A standardised mean difference of 0.56 against placebo for overall symptom change in acute schizophrenia, fourth of fifteen ranked antipsychotics',
        'A gynaecomastia rate ratio of 3.91 in current users among 401,924 males aged 15 to 25, and 5.44 in those aged 18 and under',
        '74% all-cause discontinuation over 18 months in the risperidone arm of CATIE',
        'Weight gain of 2.7 kg against 0.8 kg on placebo over eight weeks in children',
      ],
      unsupportedInferences: [
        'That risperidone helps post-traumatic stress disorder — a 296-veteran six-month randomised trial found a non-significant 3.74-point difference on a 136-point scale',
        'That it treats autism — the indication is for irritability, aggression and self-injury occurring alongside autism, and no trial has shown an effect on the core features of the condition',
        'That paliperidone is an improvement on it — the metabolite ranks slightly lower on pooled efficacy, higher on prolactin, and sixteen times higher on price',
        'That antipsychotic treatment of agitation in dementia is supported by evidence — the pooled randomised data show an odds ratio of 1.54 for death',
      ],
      whatFailedInitially: [
        'VA Cooperative Study No. 504 found no benefit in PTSD on the PTSD scale, on depression, on anxiety or on quality of life',
        'CATIE-AD found no significant advantage over placebo on global improvement in Alzheimer disease, with more than three times the intolerability dropout',
        'Risperidone did not separate from perphenazine, a 1957 first-generation drug, in the independent effectiveness trial',
      ],
      realWorldOutcome: [
        'About six cents a tablet at United States pharmacy acquisition cost, the cheapest antipsychotic on this page',
        'One of the very few psychiatric drugs with a genuine paediatric indication supported by a positive independent randomised trial',
        'A boxed warning for increased mortality in elderly patients with dementia-related psychosis, applying to the whole class',
        'A US$2.2 billion United States settlement in 2013 covering, among other conduct, promotion of unapproved uses of Risperdal and Invega',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, orally disintegrating tablet, oral solution, and several long-acting injectable depots including intramuscular microspheres and subcutaneous formulations',
      description:
        'The oral form is taken daily. Risperdal Consta releases risperidone from polymer microspheres over about two weeks after a three-week lag, so oral cover is needed at the start; the newer subcutaneous depots have different onset profiles. The injectable range exists because non-adherence is the commonest route to relapse in schizophrenia, and a depot converts a daily decision into a monthly one.',
      safetyProfile:
        'The United States label carries a boxed warning for increased mortality in elderly patients with dementia-related psychosis. Prolactin elevation is the defining class-distinguishing effect, producing gynaecomastia, galactorrhoea, amenorrhoea and sexual dysfunction. Extrapyramidal effects are dose-dependent and more frequent than with quetiapine or clozapine. Weight gain, orthostatic hypotension, sedation, tardive dyskinesia and neuroleptic malignant syndrome all apply.',
    },
    commonQuestions: [
      {
        q: 'Does risperidone treat autism?',
        a: 'No, and the licence does not claim it does. The approved indication is irritability associated with autistic disorder, meaning severe tantrums, aggression and self-injury, in patients aged five to seventeen. The trial that established it randomised 101 children and measured the Irritability subscale of the Aberrant Behavior Checklist: it fell 56.9% on risperidone against 14.1% on placebo, and 69% of the drug group met the response definition against 12% on placebo. Nothing in that trial addressed communication, social interaction or the core features of autism. The children also gained an average of 2.7 kg in eight weeks against 0.8 kg on placebo.',
        auditNote:
          'The distinction between treating a condition and treating one behaviour that accompanies it is the entire content of this indication.',
      },
      {
        q: 'Why does it cause breast growth?',
        a: 'Dopamine normally holds prolactin secretion down. Risperidone blocks dopamine receptors on the pituitary cells that make prolactin, and those cells sit outside the blood-brain barrier, so they are exposed to the full circulating concentration while the brain sees less because risperidone is pumped back out by P-glycoprotein. Prolactin rises, and in breast tissue that drives growth and milk production. A claims study of 401,924 males aged 15 to 25 found current users had about four times the rate of gynaecomastia diagnosis, and about five times among those aged eighteen and under. This is observational data with the limits that implies, but the mechanism behind it is not disputed.',
      },
      {
        q: 'Should it be added to an antidepressant for PTSD?',
        a: 'The largest randomised test of exactly that question found no benefit. Veterans Affairs Cooperative Study No. 504 enrolled veterans with chronic military-related PTSD whose symptoms persisted after at least two adequate antidepressant trials, and randomised 296 of them to risperidone or placebo for six months across 23 centres. The PTSD scale fell 16.3 points on risperidone and 12.5 on placebo, a difference of 3.74 points on a 136-point scale, which was not statistically significant (P=0.11). Depression, anxiety and quality of life all showed no difference either.',
      },
      {
        q: 'Is Invega a better version of it?',
        a: "Invega is paliperidone, which is the molecule your liver makes out of risperidone. On the pooled ranking of fifteen antipsychotics, paliperidone scored 0.50 against risperidone's 0.56, with overlapping credible intervals, so neither is demonstrably more effective. On prolactin, paliperidone produced the largest elevation of the 32 drugs in the 2019 network meta-analysis. It costs about US$1.01 per tablet against about six cents. What it genuinely offers is clearance through the kidneys rather than through a liver enzyme that varies between people, and injectable forms lasting one, three and six months.",
      },
      {
        q: 'Why does this page show a price but no manufacturing cost?',
        a: 'Because no verifiable per-dose cost of production for risperidone could be found and cited. The figure quoted is the CMS National Average Drug Acquisition Cost, which is the price United States pharmacies pay to buy it, surveyed and published by the Centers for Medicare and Medicaid Services. That is a price, not a cost of manufacture. The route is a single alkylation joining two purchased fragments, which is consistent with a low cost, but consistency is not a measurement and this page will not invent one.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'McCracken JT et al. Risperidone in children with autism and serious behavioral problems. N Engl J Med 2002;347:314-321',
        identifier: '10.1056/NEJMoa013171',
        kind: 'doi',
      },
      {
        label:
          'Krystal JH et al. Adjunctive risperidone treatment for antidepressant-resistant symptoms of chronic military service-related PTSD: a randomized trial. JAMA 2011;306:493-502',
        identifier: '10.1001/jama.2011.1080',
        kind: 'doi',
      },
      {
        label:
          'Etminan M, Carleton B, Brophy JM. Risperidone and risk of gynecomastia in young men. J Child Adolesc Psychopharmacol 2015;25:671-673',
        identifier: '10.1089/cap.2015.0024',
        kind: 'doi',
      },
      {
        label:
          'Leucht S et al. Comparative efficacy and tolerability of 15 antipsychotic drugs in schizophrenia: a multiple-treatments meta-analysis. Lancet 2013;382:951-962',
        identifier: '10.1016/S0140-6736(13)60733-3',
        kind: 'doi',
      },
      {
        label:
          'Huhn M et al. Comparative efficacy and tolerability of 32 oral antipsychotics for the acute treatment of adults with multi-episode schizophrenia. Lancet 2019;394:939-951',
        identifier: '10.1016/S0140-6736(19)31135-3',
        kind: 'doi',
      },
      {
        label:
          'Lieberman JA et al. Effectiveness of antipsychotic drugs in patients with chronic schizophrenia. N Engl J Med 2005;353:1209-1223',
        identifier: '10.1056/NEJMoa051688',
        kind: 'doi',
      },
      {
        label:
          'Schneider LS, Dagerman KS, Insel P. Risk of death with atypical antipsychotic drug treatment for dementia. JAMA 2005;294:1934-1943',
        identifier: '10.1001/jama.294.15.1934',
        kind: 'doi',
      },
      {
        label:
          "Schneider LS et al. Effectiveness of atypical antipsychotic drugs in patients with Alzheimer's disease (CATIE-AD). N Engl J Med 2006;355:1525-1538",
        identifier: '10.1056/NEJMoa061240',
        kind: 'doi',
      },
      {
        label: 'CATIE — Clinical Antipsychotic Trials of Intervention Effectiveness, schizophrenia',
        identifier: 'NCT00014001',
        kind: 'nct',
      },
      {
        label:
          'United States Department of Justice. Johnson & Johnson to Pay More Than $2.2 Billion to Resolve Criminal and Civil Investigations, 4 November 2013',
        identifier:
          'https://www.justice.gov/archives/opa/pr/johnson-johnson-pay-more-22-billion-resolve-criminal-and-civil-investigations',
        kind: 'regulatory',
      },
      {
        label: 'Drugs@FDA: RISPERDAL (risperidone), NDA 020272, original approval 1993',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020272',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 5073 — risperidone structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5073',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 4. Aripiprazole — a genuinely different mechanism that produced a middling drug, and the only
  //    antipsychotic whose label warns you may start gambling.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'aripiprazole',
    name: 'Aripiprazole',
    tradeName: 'Abilify',
    sponsor:
      'Otsuka Pharmaceutical, developed and co-promoted with Bristol-Myers Squibb (NDA 021436 approved 2002); the oral tablet is now widely generic, with long-acting injectables marketed as Abilify Maintena and Abilify Asimtufii',
    targetGene: 'DRD2',
    targetProtein:
      'Dopamine D2 receptor, at which aripiprazole is a high-affinity partial agonist rather than an antagonist, together with partial agonism at 5-HT1A and antagonism at 5-HT2A',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2002,
    indication:
      'Schizophrenia in adults and adolescents aged 13 to 17; acute manic and mixed episodes of bipolar I disorder and its maintenance; adjunctive treatment of major depressive disorder alongside an antidepressant; irritability associated with autistic disorder in patients aged 6 to 17; and Tourette disorder in patients aged 6 to 18',
    patientFriendlyIndication:
      'Schizophrenia, bipolar disorder, depression that has not responded to an antidepressant alone, irritability in autism, and Tourette disorder',
    anatomicalSite:
      'Mesolimbic and mesocortical dopamine synapses, and the mesolimbic reward circuitry where partial agonism is the proposed basis of the compulsive-behaviour signal',
    conditionContext: {
      conditionExplainer:
        'Aripiprazole covers more separate populations than any other antipsychotic: adults with schizophrenia, children with bipolar mania, children with autism-related irritability, children with Tourette disorder, and adults whose depression has not responded to an antidepressant. Each of those licences rests on its own set of six-to-ten-week rating-scale trials.',
      whyItMatters:
        'The breadth is not evidence of breadth of effect. It is evidence of a development programme that ran trials in many populations. The adjunctive depression indication in particular is the one most people encounter, and it is built on an odds ratio for response of 1.69 alongside an odds ratio of 3.91 for stopping because of side effects.',
      whoTakesThis:
        'Adults with schizophrenia and bipolar disorder; adults with depression, as an add-on; children and adolescents with autism-associated irritability or Tourette disorder.',
      clinicalGoals:
        'The registration trials measured PANSS totals, Young Mania Rating Scale scores, Montgomery-Asberg or Hamilton depression scores, the Aberrant Behavior Checklist Irritability subscale and the Yale Global Tic Severity Scale, over six to ten weeks.',
    },
    oneSentenceVerdict:
      'The first dopamine partial agonist to reach market, which produced almost no prolactin elevation and much less weight gain than olanzapine, ranked ninth of fifteen antipsychotics on pooled symptom reduction, and is the only drug in this class whose United States label carries a dedicated section warning that patients may develop uncontrollable urges to gamble, shop, eat or have sex.',
    laymanHowItWorks:
      "Most antipsychotics simply switch the dopamine receptor off. Aripiprazole sits in the same place but turns it partly on: where dopamine is over-active it acts as a brake, and where dopamine is under-active it supplies a weak signal of its own. That is why it causes far less of the flat, deadened feeling and none of the hormonal disruption that full blockers cause. It is also the reason it can push the brain's reward circuitry the wrong way in some people, producing compulsive gambling or shopping that stops when the drug is reduced or stopped.",
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 65,
    substitutes: {
      summary:
        'Aripiprazole costs about thirteen cents a tablet at United States pharmacy acquisition cost. Its case rests entirely on what it does not do: it does not raise prolactin, and it does not put on the weight olanzapine does. The price of that is a measurably weaker effect on symptoms and a distinctive side effect — akathisia — that patients find hard to tolerate and clinicians often mistake for worsening illness.',
      conventionalRx: [
        {
          name: 'Olanzapine (Zyprexa)',
          class: 'Second-generation antipsychotic, multi-receptor antagonist',
          howItCompares:
            "Ranked third of fifteen on pooled symptom reduction against aripiprazole's ninth (SMD 0.59 versus 0.43), and had the longest time to all-cause discontinuation in CATIE. It caused the largest weight gain of the fifteen; aripiprazole is among the smallest.",
          typicalCost:
            'US$0.1432 per tablet at pharmacy acquisition cost, median across 167 listed generic products (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: measurably better symptom control. Cons: the worst weight and metabolic profile in the class.',
        },
        {
          name: 'Risperidone (Risperdal)',
          class: 'Serotonin-dopamine antagonist',
          howItCompares:
            "Ranked fourth of fifteen against aripiprazole's ninth, holds the same autism-irritability indication, and costs half as much. It raises prolactin substantially where aripiprazole lowers it, which is the whole distinction between the two in paediatric use.",
          typicalCost:
            'US$0.0644 per tablet at pharmacy acquisition cost, median across 126 listed generic products (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: better pooled efficacy, cheaper, longer paediatric track record. Cons: prolactin elevation with a measured four-fold gynaecomastia rate ratio in young men.',
        },
        {
          name: 'Brexpiprazole (Rexulti)',
          class: 'Dopamine D2 partial agonist, developed by the same company as a successor',
          howItCompares:
            'Chemically and mechanistically the closest relative, designed for lower intrinsic activity at D2 and therefore less akathisia. In the 32-drug network meta-analysis it had the weakest effect on positive symptoms of any drug measured (standardised mean difference -0.17, 95% CrI -0.31 to -0.04). It is a brand-only product at roughly four hundred times the per-tablet acquisition cost.',
          typicalCost:
            'US$49.53 per tablet at pharmacy acquisition cost, median across 6 listed brand products (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: less akathisia than aripiprazole in the registration programme. Cons: the weakest measured effect on positive symptoms in the 32-drug network, and a brand price against a generic predecessor.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Ask a household member to watch for new gambling, shopping or eating urges',
          action:
            'Tell someone close to you that this drug can cause sudden compulsive urges, and ask them to say something if they notice new gambling, spending, binge eating or sexual behaviour.',
          patientImpact:
            'The United States label states plainly that patients may not recognise these behaviours as abnormal, which is why it directs prescribers to ask specifically rather than wait for a report. In some but not all cases the urges stopped when the amount was reduced or the drug was discontinued.',
          clinicalPrecaution:
            'Impulse-control symptoms can also belong to the underlying illness, particularly in mania. That ambiguity is stated in the label and is a reason to raise it with a prescriber rather than to act on it alone.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1CC(=O)NC2=C1C=CC(=C2)OCCCCN3CCN(CC3)C4=C(C(=CC=C4)Cl)Cl',
      chemicalFormula: 'C23H27Cl2N3O2',
      molecularWeight: '448.40 g/mol',
      targetReceptorAffinity:
        'A high-affinity partial agonist at dopamine D2 and D3 with low intrinsic activity, a partial agonist at serotonin 5-HT1A, and an antagonist at 5-HT2A. Because it is a partial agonist, its net effect depends on the surrounding dopamine tone: it reduces signalling where dopamine is high and supports it where dopamine is low. That state-dependence is the defining pharmacological property and the reason its side-effect profile differs in kind, not only in degree, from the antagonists.',
      structureSource: {
        label: 'PubChem CID 60795 (aripiprazole) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/60795',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ari-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Incoming control of the dichlorophenylpiperazine and the quinolinone fragment',
          description:
            'Confirm identity and purity of 1-(2,3-dichlorophenyl)piperazine and of 7-(4-bromobutoxy)-3,4-dihydroquinolin-2(1H)-one before alkylation. The dichlorophenylpiperazine is itself a serotonergic compound and any that carries through unreacted is a pharmacologically active impurity, not an inert one.',
          reagentsAndBuffer:
            '1-(2,3-dichlorophenyl)piperazine hydrochloride and 7-(4-bromobutoxy)-3,4-dihydrocarbostyril reference standards, Karl Fischer titration, reversed-phase HPLC with UV detection, ion chromatography for residual halide',
        },
        {
          id: 'ari-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'N-alkylation of the piperazine with the butoxy-quinolinone',
          description:
            'React the piperazine nitrogen with the bromobutyl chain on the quinolinone in the presence of base. The four-carbon linker length is not incidental: it sets the geometry that produces partial rather than full agonism at D2, and shortening or lengthening it changes the intrinsic activity.',
          dependsOnStepId: 'ari-w1',
          reagentsAndBuffer:
            'Potassium carbonate or triethylamine as base, catalytic potassium iodide, acetonitrile or dimethylformamide at reflux under nitrogen',
        },
        {
          id: 'ari-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Polymorph selection and recrystallisation to the anhydrous form',
          description:
            'Recrystallise under a controlled cooling profile and confirm the crystal form by powder X-ray diffraction and differential scanning calorimetry. Aripiprazole has a well-documented set of polymorphs and a monohydrate with different dissolution behaviour, and which one is isolated determines whether the tablet meets its dissolution specification.',
          dependsOnStepId: 'ari-w2',
          reagentsAndBuffer:
            'Anhydrous ethanol with controlled water content, defined cooling ramp, powder X-ray diffraction reference pattern, differential scanning calorimetry, HPLC assay for related substances',
        },
        {
          id: 'ari-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Brain penetration and striatal exposure confirmation',
          description:
            'Establish unbound brain-to-plasma partitioning and confirm striatal exposure at the concentrations reached clinically. For a partial agonist this matters more than for an antagonist: the net direction of the effect depends on how much drug is present relative to endogenous dopamine, so an exposure figure is part of the mechanism rather than a pharmacokinetic footnote.',
          dependsOnStepId: 'ari-w3',
          reagentsAndBuffer:
            'Rodent plasma and striatal homogenate, equilibrium dialysis for unbound fraction, phosphate-buffered saline at pH 7.4, LC-MS/MS with a deuterated aripiprazole internal standard, dehydroaripiprazole reference standard for the active metabolite',
        },
        {
          id: 'ari-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Functional intrinsic activity assay, not a binding constant alone',
          description:
            'Measure cyclic AMP or GTP-gamma-S response at human D2 across a full concentration range in the presence and absence of dopamine, to report intrinsic activity as a fraction of full agonism. A binding constant would show aripiprazole and haloperidol occupying the same site; only a functional assay distinguishes switching the receptor off from turning it partly on.',
          dependsOnStepId: 'ari-w4',
          reagentsAndBuffer:
            'CHO or HEK293 cells stably expressing human D2 long isoform, forskolin-stimulated cyclic AMP accumulation assay or [35S]GTP-gamma-S membrane binding, dopamine as full agonist reference, haloperidol as neutral antagonist reference, IBMX phosphodiesterase inhibitor',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ari-a1',
        category: 'measured',
        title: 'The only antipsychotic that lowers prolactin instead of raising it',
        laymanSummary:
          'Every other antipsychotic in the fifteen-drug ranking pushed prolactin up. Aripiprazole was the one that pushed it down, which is why it is chosen when hormonal side effects matter, particularly in children and young adults.',
        technicalDetails:
          'In the Leucht multiple-treatments meta-analysis of 212 trials and 43,049 patients, standardised mean differences against placebo for prolactin increase ran from 0.22 for aripiprazole at one end to -1.30 for paliperidone at the other, with the sign convention such that aripiprazole was the only drug whose effect pointed away from prolactin elevation. On weight gain it also sat near the favourable end of the range, well away from olanzapine at -0.74. In the 2019 network meta-analysis of 32 drugs, aripiprazole produced the largest improvement in quality of life of the five drugs that significantly improved it (standardised mean difference -0.49, 95% CI -0.72 to -0.26).',
        evidenceSource:
          'Leucht S et al., Lancet 2013;382:951-962; Huhn M et al., Lancet 2019;394:939-951',
        doi: '10.1016/S0140-6736(13)60733-3',
        measuredMetric:
          'Standardised mean difference against placebo for prolactin change, weight gain and quality of life',
        auditFlag: 'verified',
      },
      {
        id: 'ari-a2',
        category: 'measured',
        title: 'A new mechanism that produced a ninth-place drug',
        laymanSummary:
          'Aripiprazole was the first antipsychotic to turn the dopamine receptor partly on rather than switching it off, and that was expected to be a step change. On pooled symptom reduction it came ninth of fifteen, below haloperidol.',
        technicalDetails:
          'Standardised mean difference against placebo for overall symptom change was 0.43 (95% CrI 0.34 to 0.52) for aripiprazole, ranking it ninth of fifteen behind clozapine 0.88, amisulpride 0.66, olanzapine 0.59, risperidone 0.56, paliperidone 0.50, zotepine 0.49, haloperidol 0.45 and quetiapine 0.44. The authors of the analysis concluded that efficacy differences between antipsychotics are small but robust, and that the first- versus second-generation classification is not supported by the data. A mechanism that is genuinely novel and a drug that is measurably better are different claims, and only the first one is established for aripiprazole.',
        evidenceSource: 'Leucht S et al., Lancet 2013;382:951-962',
        doi: '10.1016/S0140-6736(13)60733-3',
        measuredMetric: 'Standardised mean difference against placebo for overall symptom change',
        auditFlag: 'verified',
      },
      {
        id: 'ari-a3',
        category: 'failed',
        title: 'The label warns that patients may start gambling and not notice',
        laymanSummary:
          'Aripiprazole can produce sudden, intense urges to gamble, shop, eat or have sex. The label tells prescribers to ask about it specifically, because patients often do not recognise the behaviour as abnormal or connect it to a tablet.',
        technicalDetails:
          'Section 5.7 of the United States prescribing information, headed "Pathological Gambling and Other Compulsive Behaviors", states that post-marketing case reports suggest patients can experience intense urges, particularly for gambling, and an inability to control them while taking aripiprazole; other compulsive urges reported less frequently include sexual urges, shopping, eating or binge eating. The label directs prescribers to ask patients or caregivers specifically about new or intense urges, notes that patients may not recognise the behaviours as abnormal, records that in some but not all cases the urges stopped when the amount was reduced or the drug was stopped, and warns that compulsive behaviours may result in harm to the patient and others if not recognised. The label also notes that impulse-control symptoms can be associated with the underlying disorder, which is a genuine confound and not a dismissal. The proposed mechanism is D3 and D2 partial agonism in mesolimbic reward circuitry, the same class of mechanism behind the compulsive behaviours seen with dopamine agonists used in Parkinson disease.',
        evidenceSource:
          'United States prescribing information for aripiprazole, section 5.7, retrieved from the openFDA drug label endpoint; Drugs@FDA NDA 021436',
        measuredMetric:
          'Post-marketing case reports of new-onset pathological gambling and other compulsive behaviours',
        auditFlag: 'caution',
      },
      {
        id: 'ari-a4',
        category: 'inferred',
        title: 'Adjunctive use in depression: response odds 1.69, dropout-for-harm odds 3.91',
        laymanSummary:
          'Adding an antipsychotic to an antidepressant does help, on average, in depression that has not responded. The same pooled analysis shows people were nearly four times as likely to stop because of side effects.',
        technicalDetails:
          'Nelson and Papakostas pooled sixteen acute-phase, parallel-group, double-blind randomised trials with 3,480 patients who had non-psychotic unipolar major depressive disorder resistant to prior antidepressant treatment. Adjunctive atypical antipsychotics beat placebo for response (odds ratio 1.69, 95% CI 1.46 to 1.95, z=7.00, p<0.00001) and for remission (odds ratio 2.00, 95% CI 1.69 to 2.37, z=8.03, p<0.00001). Mean odds ratios did not differ between the individual atypical agents and were not affected by trial duration or by how treatment resistance was established. Discontinuation for adverse events was substantially higher on drug than on placebo (odds ratio 3.91, 95% CI 2.68 to 5.72, z=7.05, p<0.00001). The benefit is real, class-wide and modest; presenting the response odds ratio without the discontinuation odds ratio describes half of the same analysis.',
        evidenceSource: 'Nelson JC, Papakostas GI, Am J Psychiatry 2009;166:980-991',
        doi: '10.1176/appi.ajp.2009.09030312',
        inferredClaim:
          'That aripiprazole specifically is the right add-on for resistant depression — the pooled analysis found no difference between the atypical agents, so the evidence supports the class rather than the molecule',
        auditFlag: 'caution',
      },
      {
        id: 'ari-a5',
        category: 'failed',
        title: 'A 938-patient Alzheimer psychosis programme that never produced an indication',
        laymanSummary:
          'Three ten-week placebo-controlled trials tested aripiprazole in 938 elderly people with psychosis in Alzheimer disease. The drug is still not approved for it, and the label carries a boxed warning against using antipsychotics in that population.',
        technicalDetails:
          'The United States prescribing information records three ten-week placebo-controlled studies of aripiprazole in elderly patients with psychosis associated with Alzheimer disease, with 938 participants, mean age 82.4 years, range 56 to 99. No indication resulted. Section 5.1 states that elderly patients with dementia-related psychosis treated with antipsychotic drugs are at increased risk of death and that aripiprazole is not approved for dementia-related psychosis. The pooled evidence behind that warning is fifteen randomised placebo-controlled trials of atypical antipsychotics in dementia, three of the sixteen drug-placebo contrasts contributed by aripiprazole, with death in 3.5% on drug against 2.3% on placebo, odds ratio 1.54 (95% CI 1.06 to 2.23, P=0.02).',
        evidenceSource:
          'United States prescribing information for aripiprazole, sections 5.1 and 5.2; Schneider LS et al., JAMA 2005;294:1934-1943',
        doi: '10.1001/jama.294.15.1934',
        measuredMetric:
          'Mortality odds ratio for atypical antipsychotics against placebo in randomised dementia trials',
        auditFlag: 'verified',
      },
      {
        id: 'ari-a6',
        category: 'conclusion_shift',
        title: 'The digital pill that was approved in 2017 no longer has a listed label',
        laymanSummary:
          'In 2017 the FDA approved a version of aripiprazole with a sensor baked into the tablet that reports to a phone when it has been swallowed. As of August 2026 no label for that product is listed on the United States drug label database.',
        technicalDetails:
          'ABILIFY MYCITE KIT, NDA 207202, sponsored by Otsuka, was approved on 13 November 2017 and combines aripiprazole tablets carrying an ingestible event marker with a wearable patch and a smartphone application. It was widely covered as the first digital medicine approved in the United States. A query of the DailyMed structured product label database in August 2026 returns thirteen ABILIFY labels and none for MYCITE, and the openFDA label endpoint returns no match for the brand name. The Drugs@FDA application record for NDA 207202 remains, listing 2 mg, 15 mg and 30 mg kit products. What was licensed was a tracking system, not a better antipsychotic: the aripiprazole in the kit is the same molecule with the same efficacy figures as the generic tablet.',
        evidenceSource:
          'Drugs@FDA NDA 207202 (ABILIFY MYCITE KIT), original approval 13 November 2017; DailyMed and openFDA label queries, August 2026',
        inferredClaim:
          'That an ingestion sensor improves outcomes — the approval covered detection of ingestion, and the product is no longer listed in the label database',
        auditFlag: 'contested',
      },
      {
        id: 'ari-a7',
        category: 'conclusion_shift',
        title: 'Its co-promotion was part of a US$515 million settlement in 2007',
        laymanSummary:
          'In 2007 Bristol-Myers Squibb, which co-promoted aripiprazole, agreed to pay more than half a billion dollars to resolve United States allegations about illegal drug marketing and pricing.',
        technicalDetails:
          'The United States Department of Justice announced in September 2007 that Bristol-Myers Squibb would pay more than US$515 million to resolve allegations of illegal drug marketing and pricing, with the conduct at issue including promotion of Abilify for uses in paediatric patients and in dementia-related psychosis that were not approved at the time. The paediatric indications aripiprazole now holds — autism-associated irritability from 2009, Tourette disorder from 2014 — were granted after trials were run and reviewed; the promotion that preceded them was not supported by that review. The sequence matters for reading prescribing data from that period.',
        evidenceSource:
          'United States Department of Justice, Office of Public Affairs, 28 September 2007: "Bristol-Myers Squibb to Pay More Than $515 Million to Resolve Allegations of Illegal Drug Marketing and Pricing"',
        inferredClaim:
          'That paediatric and elderly prescribing of aripiprazole before 2009 followed the evidence — some of it followed promotion that was found unlawful',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A daily tablet, or an injection lasting a month or two',
        laymanDesc:
          'Aripiprazole is usually a once-daily tablet. Long-acting injections given monthly or every other month exist for people for whom a daily tablet is the step that fails.',
        molecularDetail:
          'Oral bioavailability about 87%, terminal half-life roughly 75 hours for aripiprazole and 94 hours for its active metabolite dehydroaripiprazole, which is why steady state takes about two weeks and why missing a single tablet changes little. Clearance is through CYP2D6 and CYP3A4.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It crosses into the brain and the liver adds a second long-lived active molecule',
        laymanDesc:
          'The drug enters the brain readily, and the liver converts part of it into a related molecule that is also active and lasts even longer than the parent.',
        molecularDetail:
          "Dehydroaripiprazole shares the parent's D2 affinity and accounts for roughly 40% of the exposure at steady state. CYP2D6 poor metabolisers reach substantially higher concentrations, which is one of the few places in psychiatry where genotype has a documented dosing consequence in the label.",
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It occupies the dopamine receptor and turns it partly on',
        laymanDesc:
          'Aripiprazole binds the dopamine receptor as tightly as a blocker does, but instead of shutting the receptor down it produces a weak signal of its own. Against too much dopamine it acts as a brake; against too little it acts as a floor.',
        molecularDetail:
          'High-affinity partial agonism at D2 and D3 with low intrinsic activity, so it competes dopamine off the receptor and substitutes a submaximal signal. Striatal D2 occupancy above 80% is routinely reached without the extrapyramidal consequences a full antagonist would produce at that occupancy, which is the strongest clinical evidence that the partial agonism is real.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The same partial signal reaches the reward circuitry',
        laymanDesc:
          'The receptors aripiprazole partly activates are not only the ones involved in psychosis. The same receptors sit in the circuits that decide what feels rewarding, and in some people a weak persistent signal there produces compulsive gambling, shopping, eating or sexual behaviour.',
        molecularDetail:
          'D3-preferring partial agonism in mesolimbic reward pathways is the standard mechanistic account of the impulse-control signal, by analogy with the well-characterised effect of D3-preferring full agonists such as pramipexole in Parkinson disease. The label records that in some cases the urges stopped on reduction or discontinuation, which is the pattern a pharmacological cause predicts.',
        iconName: 'AlertTriangle',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Symptoms fall modestly, hormones do not move, restlessness appears',
        laymanDesc:
          'On symptom scales aripiprazole performs in the middle of the field. What sets it apart is what stays normal: prolactin, weight and blood sugar. The characteristic complaint is an inner restlessness that makes it impossible to sit still.',
        molecularDetail:
          'Standardised mean difference against placebo of 0.43 (95% CrI 0.34 to 0.52) for overall symptom change, ninth of fifteen. Prolactin effect at the favourable extreme of the fifteen-drug range. Akathisia is the most frequent reason for discontinuation in the aripiprazole arms of the registration programme, and is attributed to partial agonism producing an intermediate dopaminergic state rather than to blockade.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Leucht 15-drug multiple-treatments meta-analysis',
        phase: 'Bayesian network meta-analysis of 212 blinded randomised trials',
        sampleSize: 43049,
        primaryEndpoint:
          'Mean overall change in symptoms against placebo in acute schizophrenia, with all-cause discontinuation, weight gain, extrapyramidal effects, prolactin, QTc and sedation as secondary outcomes',
        endpointMet: true,
        statisticalPValue:
          'Aripiprazole standardised mean difference 0.43 (95% CrI 0.34 to 0.52), ninth of fifteen; prolactin effect 0.22, the most favourable of the fifteen',
        unreportedAdverseSignals:
          'A novel mechanism did not translate into a higher efficacy rank. Aripiprazole placed below haloperidol, a 1967 first-generation drug.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Nelson and Papakostas adjunctive antipsychotic meta-analysis',
        phase: 'Fixed-effects meta-analysis of 16 acute-phase randomised placebo-controlled trials',
        sampleSize: 3480,
        primaryEndpoint:
          'Response and remission rates with adjunctive atypical antipsychotic versus placebo in antidepressant-resistant major depressive disorder',
        endpointMet: true,
        statisticalPValue:
          'Response odds ratio 1.69 (95% CI 1.46 to 1.95, p<0.00001); remission odds ratio 2.00 (95% CI 1.69 to 2.37, p<0.00001)',
        unreportedAdverseSignals:
          'Discontinuation for adverse events had an odds ratio of 3.91 (95% CI 2.68 to 5.72) against placebo. Odds ratios did not differ between the individual atypical agents, so the evidence supports the class rather than aripiprazole in particular.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'Aripiprazole Alzheimer psychosis programme (three 10-week placebo-controlled studies)',
        phase: 'Three randomised placebo-controlled trials, 10 weeks',
        sampleSize: 938,
        primaryEndpoint:
          'Psychosis associated with Alzheimer disease in elderly patients, mean age 82.4 years',
        endpointMet: false,
        statisticalPValue:
          'No indication was granted. The label records the safety experience from these studies and states that aripiprazole is not approved for dementia-related psychosis.',
        unreportedAdverseSignals:
          "The programme is documented in the label's safety section rather than in an efficacy section, which is where trials that did not produce an indication end up.",
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Schneider dementia mortality meta-analysis',
        phase: 'Meta-analysis of 15 randomised placebo-controlled trials, nine unpublished',
        sampleSize: 5110,
        primaryEndpoint:
          'All-cause death with atypical antipsychotic treatment versus placebo in Alzheimer disease and other dementia',
        endpointMet: false,
        statisticalPValue:
          'Death in 3.5% on drug versus 2.3% on placebo; odds ratio 1.54 (95% CI 1.06 to 2.23, P = 0.02)',
        unreportedAdverseSignals:
          'Nine of the fifteen trials were unpublished at the time of the analysis and were obtained from sponsors. Three of the sixteen drug-placebo contrasts were aripiprazole.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A standardised mean difference of 0.43 against placebo for overall symptom change, ninth of fifteen ranked antipsychotics',
        'The most favourable prolactin effect of the fifteen drugs ranked, the only one whose effect did not point toward elevation',
        'The largest quality-of-life improvement of the five antipsychotics that significantly improved it in the 32-drug network (SMD -0.49, 95% CI -0.72 to -0.26)',
        'Response odds ratio 1.69 and remission odds ratio 2.00 for adjunctive atypical antipsychotics in resistant depression, across 16 trials and 3,480 patients',
        'Discontinuation-for-adverse-events odds ratio 3.91 in the same pooled analysis',
      ],
      unsupportedInferences: [
        'That partial agonism makes aripiprazole more effective — the mechanism is genuinely novel and the pooled efficacy rank is ninth of fifteen',
        'That the adjunctive depression evidence is specific to aripiprazole — the pooled odds ratios did not differ between the atypical agents tested',
        'That an ingestible sensor improves adherence or outcomes — the 2017 approval covered detection of ingestion, and no label for that product is currently listed',
        'That it is safe in dementia-related psychosis because it lacks the metabolic profile of olanzapine — the mortality signal is a class finding with an odds ratio of 1.54',
      ],
      whatFailedInitially: [
        'Three ten-week placebo-controlled trials in 938 elderly patients with Alzheimer psychosis produced no indication',
        'Akathisia is the characteristic discontinuation reason in the aripiprazole arms, and it is a direct consequence of the mechanism rather than an incidental effect',
        'The digital ingestion-tracking version approved in 2017 is no longer listed in the United States structured product label database',
      ],
      realWorldOutcome: [
        'About thirteen cents a tablet at United States pharmacy acquisition cost for the generic oral form',
        'The default antipsychotic where prolactin or weight is the deciding consideration, particularly in children and young adults',
        'A dedicated label section on pathological gambling and other compulsive behaviours, unique among the drugs on this page',
        'A US$515 million United States settlement in 2007 covering, among other conduct, promotion of unapproved paediatric and elderly uses',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, orally disintegrating tablet, oral solution, short-acting intramuscular injection, and long-acting intramuscular injections given monthly or every two months',
      description:
        'The 75-hour half-life makes the oral form unusually forgiving of a missed dose and means steady state takes about two weeks to reach, so early impressions of efficacy are unreliable. Abilify Maintena is given monthly and Abilify Asimtufii every two months. The Abilify MyCite kit, approved in 2017, paired the tablet with an ingestible sensor and a wearable patch; no label for it is currently listed on DailyMed.',
      safetyProfile:
        'The United States label carries boxed warnings for increased mortality in elderly patients with dementia-related psychosis and for suicidal thoughts and behaviours in children, adolescents and young adults. Section 5.7 covers pathological gambling and other compulsive behaviours. Akathisia is the most characteristic adverse effect. Weight gain and metabolic disturbance are markedly less than with olanzapine, and prolactin is not elevated. Orthostatic hypotension, seizures, leukopenia and neutropenia, tardive dyskinesia and neuroleptic malignant syndrome are all in the label.',
    },
    commonQuestions: [
      {
        q: 'Can this drug really make someone start gambling?',
        a: 'The label says so directly, in a section written for that purpose. Section 5.7 of the United States prescribing information records post-marketing reports of intense urges, particularly for gambling, and an inability to control them while taking aripiprazole, with sexual urges, shopping and binge eating reported less often. Two details in that section matter more than the warning itself: patients often do not recognise the behaviour as abnormal, which is why prescribers are told to ask specifically rather than wait; and in some cases the urges stopped when the amount was reduced or the drug was stopped, which is the pattern you would expect if the drug is the cause. The label also notes impulse-control problems can belong to the underlying illness, and that ambiguity is real.',
        auditNote:
          'This is the only drug on this page whose label contains a dedicated section on compulsive behaviour.',
      },
      {
        q: 'Is a partial agonist better than a blocker?',
        a: 'It is different, and on symptom control it is not better. Across 212 trials and 43,049 patients, aripiprazole ranked ninth of fifteen with a standardised mean difference of 0.43, below haloperidol at 0.45 and well below olanzapine at 0.59. Where the mechanism clearly delivers is in what does not happen: prolactin does not rise, weight gain is modest, and high receptor occupancy is tolerated without the movement effects a full blocker would produce. The trade is genuine and it runs in both directions.',
      },
      {
        q: 'Why is it added to antidepressants?',
        a: 'Because pooling sixteen randomised trials of 3,480 patients with depression that had not responded to an antidepressant showed adjunctive atypical antipsychotics beat placebo, with an odds ratio of 1.69 for response and 2.00 for remission. The same analysis found the odds of stopping because of side effects were 3.91 times higher than on placebo, and found no difference between the individual atypical agents, meaning the evidence supports the strategy rather than this particular molecule. Anyone quoting the response figure without the discontinuation figure is quoting half of one analysis.',
      },
      {
        q: 'What happened to the pill with the sensor in it?',
        a: 'Abilify MyCite was approved on 13 November 2017 under NDA 207202: aripiprazole tablets containing an ingestible event marker, a wearable patch and a phone application that recorded when a tablet was swallowed. It was reported at the time as the first digital medicine approved in the United States. As of August 2026, a search of the DailyMed structured product label database returns thirteen labels for Abilify and none for MyCite, and the openFDA label endpoint returns no match for the brand name. The application record still exists in Drugs@FDA. Whatever the commercial history, the pharmacology never changed: the aripiprazole inside the kit was the same molecule with the same trial results as the generic tablet.',
      },
      {
        q: 'Why does this page show a price but no manufacturing cost?',
        a: 'Because no verifiable per-dose cost of production for aripiprazole could be found and cited. The figure quoted is the CMS National Average Drug Acquisition Cost, which is what United States pharmacies pay to acquire the drug. That is a price, not a cost of manufacture. The route is a single alkylation between two purchased fragments followed by a controlled crystallisation to select the right polymorph, which is why a molecule that was a blockbuster brand now sells for about thirteen cents a tablet, but a description of a route is not a cost figure.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Leucht S et al. Comparative efficacy and tolerability of 15 antipsychotic drugs in schizophrenia: a multiple-treatments meta-analysis. Lancet 2013;382:951-962',
        identifier: '10.1016/S0140-6736(13)60733-3',
        kind: 'doi',
      },
      {
        label:
          'Huhn M et al. Comparative efficacy and tolerability of 32 oral antipsychotics for the acute treatment of adults with multi-episode schizophrenia. Lancet 2019;394:939-951',
        identifier: '10.1016/S0140-6736(19)31135-3',
        kind: 'doi',
      },
      {
        label:
          'Nelson JC, Papakostas GI. Atypical antipsychotic augmentation in major depressive disorder: a meta-analysis of placebo-controlled randomized trials. Am J Psychiatry 2009;166:980-991',
        identifier: '10.1176/appi.ajp.2009.09030312',
        kind: 'doi',
      },
      {
        label:
          'Schneider LS, Dagerman KS, Insel P. Risk of death with atypical antipsychotic drug treatment for dementia. JAMA 2005;294:1934-1943',
        identifier: '10.1001/jama.294.15.1934',
        kind: 'doi',
      },
      {
        label:
          'United States prescribing information for aripiprazole, section 5.7 (Pathological Gambling and Other Compulsive Behaviors) and section 5.1, via the openFDA drug label endpoint',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22aripiprazole%22',
        kind: 'regulatory',
      },
      {
        label: 'Drugs@FDA: ABILIFY (aripiprazole), NDA 021436, original approval 2002',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021436',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA: ABILIFY MYCITE KIT (aripiprazole tablets with sensor), NDA 207202, original approval 13 November 2017',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=207202',
        kind: 'regulatory',
      },
      {
        label:
          'United States Department of Justice. Bristol-Myers Squibb to Pay More Than $515 Million to Resolve Allegations of Illegal Drug Marketing and Pricing, 28 September 2007',
        identifier:
          'https://www.justice.gov/archives/opa/pr/bristol-myers-squibb-pay-more-515-million-resolve-allegations-illegal-drug-marketing-and-pricing',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 60795 — aripiprazole structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/60795',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 5. Lurasidone — the cleanest metabolic and cardiac profile in the class, and the lowest
  //    measured effect on symptoms of the fifteen drugs ever ranked head to head.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'lurasidone',
    name: 'Lurasidone',
    tradeName: 'Latuda',
    sponsor:
      'Sunovion Pharmaceuticals, the United States arm of Sumitomo Pharma (NDA 200603 approved 2010); the registration trials are now registered to Sumitomo Pharma America and the tablet has a large generic market',
    targetGene: 'DRD2',
    targetProtein:
      'Dopamine D2 receptor (Ki 1 nM), serotonin 5-HT2A (Ki 0.5 nM) and 5-HT7 (Ki 0.5 nM), all antagonised, with partial agonism at 5-HT1A (Ki 6.4 nM) and antagonism at alpha-2C (Ki 11 nM) and alpha-2A (Ki 41 nM). The label records little or no affinity for histamine H1 or muscarinic M1 (IC50 above 1,000 nM), which is the whole basis of its side-effect profile.',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2010,
    indication:
      'Schizophrenia in adults and adolescents aged 13 to 17; monotherapy for the depressive episodes of bipolar I disorder in adults and children aged 10 to 17; and adjunctive treatment with lithium or valproate for the depressive episodes of bipolar I disorder in adults',
    patientFriendlyIndication: 'Schizophrenia, and the depressed phase of bipolar disorder',
    anatomicalSite:
      'Mesolimbic and mesocortical dopamine synapses, with 5-HT7 and 5-HT1A binding in cortical and hippocampal circuits proposed as the basis of the mood effect',
    conditionContext: {
      conditionExplainer:
        'Bipolar depression is the phase people with bipolar disorder spend the most time in, and it is the phase with the fewest approved treatments. Most antidepressants have never been shown to work for it, and some can tip a person into mania. That gap is what lurasidone was developed to fill.',
      whyItMatters:
        'The bar a bipolar depression drug has to clear is a change on the Montgomery-Asberg Depression Rating Scale over six weeks. It is not a measurement of whether the next depressive episode is delayed. Lurasidone has never been approved for maintenance in bipolar disorder, and the trial that tested it is on this page.',
      whoTakesThis:
        'Adults and adolescents with schizophrenia, and adults and children aged 10 and over with bipolar depression. It is chosen most often for people whose weight, blood sugar or cholesterol rules out olanzapine or quetiapine.',
      clinicalGoals:
        'The registration trials measured PANSS or BPRS totals in schizophrenia over six weeks and MADRS totals in bipolar depression over six weeks. The two long trials measured time to relapse in schizophrenia and time to recurrence of a mood event in bipolar disorder.',
    },
    oneSentenceVerdict:
      'A dopamine D2 and serotonin 5-HT2A antagonist built to avoid the histamine and muscarinic receptors that drive weight gain and sedation, which produced the most favourable QT signal of the fifteen antipsychotics ever ranked together and the equal-lowest effect on symptoms (standardised mean difference 0.33), works in bipolar depression on its own (MADRS 4.6 points better than placebo in 505 patients), and carries an add-on bipolar indication supported by one positive trial and one negative one.',
    laymanHowItWorks:
      'Lurasidone blocks the dopamine receptor that antipsychotics have blocked since the 1950s, and blocks two serotonin receptors alongside it. What makes it different is what it deliberately does not touch: it barely binds the histamine and acetylcholine receptors, and those are the receptors responsible for most of the weight gain, sedation, dry mouth and constipation that the older drugs in this class cause. It has to be swallowed with a real meal of at least 350 calories, because on an empty stomach the body absorbs roughly half as much.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 55,
    substitutes: {
      summary:
        'Lurasidone costs about twenty-nine cents a tablet at United States pharmacy acquisition cost now that it is generic. Its case is a trade that is unusually easy to state: it gives up measured efficacy on the symptom scale in exchange for a metabolic and cardiac profile that almost nothing else in the class can match. Whether that trade is worth making depends entirely on which of the two problems the person in front of you actually has.',
      conventionalRx: [
        {
          name: 'Quetiapine (Seroquel)',
          class: 'Second-generation antipsychotic, strongly antihistaminergic',
          howItCompares:
            "The direct competitor in bipolar depression, and the only other drug with a monotherapy indication for it. Quetiapine ranked eighth of fifteen on symptom reduction against lurasidone's fourteenth (SMD 0.44 versus 0.33). It also causes far more sedation and weight gain, because it binds the histamine receptor lurasidone was designed to avoid.",
          typicalCost:
            'US$0.0876 per tablet at pharmacy acquisition cost, median across listed generic products (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: better measured effect on symptoms, longer track record in bipolar depression, cheaper. Cons: the sedation and weight gain that lurasidone exists to avoid.',
        },
        {
          name: 'Olanzapine (Zyprexa)',
          class: 'Second-generation antipsychotic, multi-receptor antagonist',
          howItCompares:
            "Ranked third of fifteen against lurasidone's fourteenth (SMD 0.59 versus 0.33), and had the longest time to all-cause discontinuation in CATIE. It also produced the worst weight gain of the fifteen (SMD -0.74) where lurasidone sits at the favourable end.",
          typicalCost:
            'US$0.1432 per tablet at pharmacy acquisition cost, median across 167 listed generic products (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: nearly twice the measured effect on symptoms. Cons: the metabolic profile that made room for lurasidone in the first place.',
        },
        {
          name: 'Ziprasidone (Geodon)',
          class: 'Second-generation antipsychotic with a QT warning',
          howItCompares:
            'The closest comparison for what lurasidone is trying to be: both are metabolically quiet, both are middling on efficacy (ziprasidone SMD 0.39, lurasidone 0.33). The difference is the electrocardiogram. Ziprasidone had one of the least favourable QT signals of the fifteen; lurasidone had the most favourable of all of them.',
          typicalCost:
            'US$0.3293 per capsule at pharmacy acquisition cost, median across 60 listed generic products (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: a slightly higher efficacy rank, and the same freedom from weight gain. Cons: a QT signal serious enough that its label restricts it in patients with a history of QT prolongation or recent myocardial infarction.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Take it with a real meal, not a snack',
          action:
            'The label instructs that lurasidone be taken with food of at least 350 calories. This is not a comfort measure, it is an absorption requirement.',
          patientImpact:
            'In the food-effect study, mean peak concentration was about three times and total exposure about twice what it was under fasting conditions. Exposure did not rise further as the meal went from 350 to 1,000 calories and did not depend on how fatty the meal was, so the requirement is a floor rather than a target.',
          clinicalPrecaution:
            'Every efficacy figure on this page comes from trials in which the drug was taken with food. A person taking it on an empty stomach is not taking the drug that was tested. Any change to how or when it is taken belongs with a prescriber.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'C1CC[C@H]([C@@H](C1)CN2CCN(CC2)C3=NSC4=CC=CC=C43)CN5C(=O)[C@H]6[C@@H]7CC[C@@H](C7)[C@H]6C5=O',
      chemicalFormula: 'C28H36N4O2S',
      molecularWeight: '492.70 g/mol',
      targetReceptorAffinity:
        'Antagonist with high affinity at dopamine D2 (Ki 1 nM), serotonin 5-HT2A (Ki 0.5 nM) and 5-HT7 (Ki 0.5 nM); moderate affinity at alpha-2C adrenergic (Ki 11 nM); partial agonist at 5-HT1A (Ki 6.4 nM); antagonist at alpha-2A (Ki 41 nM). Little or no affinity for histamine H1 or muscarinic M1 (IC50 above 1,000 nM). The absent affinities are the designed feature: H1 blockade is the main driver of sedation and appetite, and M1 blockade of dry mouth, constipation and cognitive blunting.',
      structureSource: {
        label: 'PubChem CID 213046 (lurasidone) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/213046',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'lur-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Stereochemical control of the norbornane imide and the cyclohexane linker',
          description:
            'Confirm the configuration of all four stereocentres before coupling. Lurasidone carries a bicyclic norbornane-2,3-dicarboximide fused to a trans-1,2-disubstituted cyclohexane, and the wrong relative configuration at either end gives a compound with different receptor behaviour, not merely a lower yield. Chiral separation is the only way to see it.',
          reagentsAndBuffer:
            'Chiral HPLC with an amylose or cellulose carbamate stationary phase, hexane and isopropanol mobile phase with diethylamine modifier, optical rotation reference standard, 1H and 13C NMR against a certified lurasidone reference',
        },
        {
          id: 'lur-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Alkylation of benzisothiazolylpiperazine with the bicyclic imide fragment',
          description:
            'Couple 3-(1-piperazinyl)-1,2-benzisothiazole to the activated hydroxymethyl-cyclohexyl norbornane imide. The benzisothiazolylpiperazine is the fragment that produces the D2 and 5-HT2A affinity; the bulky bicyclic imide on the other end is what keeps the molecule off the histamine and muscarinic receptors.',
          dependsOnStepId: 'lur-w1',
          reagentsAndBuffer:
            '3-(1-piperazinyl)-1,2-benzisothiazole, the corresponding dimesylate or dihalide of the trans-cyclohexanedimethanol norbornane imide, potassium carbonate or diisopropylethylamine as base, acetonitrile or toluene at reflux under nitrogen',
        },
        {
          id: 'lur-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Hydrochloride salt formation and crystal-form confirmation',
          description:
            'Convert the free base to the hydrochloride and crystallise under a controlled cooling profile. Lurasidone hydrochloride is practically insoluble in water and its dissolution behaviour is what makes the tablet dependent on food in the first place, so the crystal form that is isolated has direct consequences for the exposure a patient reaches.',
          dependsOnStepId: 'lur-w2',
          reagentsAndBuffer:
            'Hydrogen chloride in ethanol or isopropanol, controlled anti-solvent addition, powder X-ray diffraction reference pattern, differential scanning calorimetry, USP dissolution apparatus with a biorelevant fed-state medium',
        },
        {
          id: 'lur-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Fed-state versus fasted-state exposure confirmation',
          description:
            'Establish systemic exposure with and without a 350-calorie meal before any efficacy claim is attached to a tablet. For lurasidone this is a mechanism step rather than a pharmacokinetic footnote: the label records a roughly three-fold peak concentration and two-fold total exposure difference between fed and fasted dosing, so a fasted patient is receiving a substantially different drug exposure from the one the trials measured.',
          dependsOnStepId: 'lur-w3',
          reagentsAndBuffer:
            'Standardised 350-calorie and 1,000-calorie test meals, serial plasma sampling into potassium EDTA, LC-MS/MS with a deuterated lurasidone internal standard, ID-14283 and ID-14326 metabolite reference standards',
        },
        {
          id: 'lur-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Counter-screen against H1 and M1, not only the on-target panel',
          description:
            "Run the histamine H1 and muscarinic M1 binding assays alongside the D2, 5-HT2A, 5-HT7 and 5-HT1A panel and report the absent affinities explicitly. Lurasidone's clinical selling point is a negative result on those two receptors, and a negative result is only meaningful if the assay was demonstrably capable of detecting a positive one.",
          dependsOnStepId: 'lur-w4',
          reagentsAndBuffer:
            'Membranes from cells expressing human D2, 5-HT2A, 5-HT7, 5-HT1A, alpha-2A, alpha-2C, H1 and M1 receptors, radioligand competition binding with appropriate tritiated ligands, olanzapine and clozapine as positive controls for H1 and M1 affinity, scintillation counting',
        },
      ],
    },
    keyAudits: [
      {
        id: 'lur-a1',
        category: 'measured',
        title: 'The most favourable QT signal of the fifteen antipsychotics ranked together',
        laymanSummary:
          "Across 212 trials and 43,049 patients, lurasidone sat at the good end of the range for effects on the heart's electrical recovery time. It is the one property on which it beat every other drug in the comparison.",
        technicalDetails:
          "In the Leucht multiple-treatments meta-analysis, standardised mean differences against placebo for QTc prolongation ran from 0.10 for the best drug, lurasidone, to -0.90 for the worst, sertindole. The label's dedicated thorough QT study in 43 patients with schizophrenia or schizoaffective disorder found a maximum mean increase in baseline-adjusted QTcI of 7.5 ms (upper one-sided 95% CI 11.7) at 120 mg daily and 4.6 ms (upper 95% CI 9.5) at 600 mg daily, with no apparent dose-response relationship, and no post-baseline QT above 500 ms in either arm of the short-term placebo-controlled studies.",
        evidenceSource:
          'Leucht S et al., Lancet 2013;382:951-962; United States prescribing information for lurasidone hydrochloride, section 12.2 (ECG Changes), via the openFDA drug label endpoint',
        doi: '10.1016/S0140-6736(13)60733-3',
        measuredMetric:
          'Standardised mean difference against placebo for QTc prolongation, and maximum mean baseline-adjusted QTcI change in a dedicated thorough QT study',
        auditFlag: 'verified',
      },
      {
        id: 'lur-a2',
        category: 'measured',
        title: 'Bipolar depression on its own: 4.6 MADRS points better than placebo',
        laymanSummary:
          'In 505 patients with the depressed phase of bipolar disorder, six weeks of lurasidone alone improved the depression score by about fifteen points against about eleven on placebo. Both dose ranges tested gave the same result.',
        technicalDetails:
          'NCT00868699 randomised 505 patients with bipolar I depression to a lower or higher lurasidone dose range or placebo for six weeks. Least-squares mean change from baseline in MADRS total score was -15.4 in both lurasidone arms against -10.7 on placebo, a mean difference of -4.6 for each arm, p<0.001 by mixed-model analysis. The absence of a dose-response gradient between the two ranges is itself worth stating: the higher range bought nothing on the primary endpoint.',
        evidenceSource:
          'NCT00868699 — Lurasidone, A 6-week Study of Patients With Bipolar I Depression (Monotherapy), posted results, Sumitomo Pharma America',
        measuredMetric:
          'Least-squares mean change from baseline in MADRS total score at week 6 against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'lur-a3',
        category: 'failed',
        title:
          'The add-on bipolar indication rests on one positive trial and one negative one of the same design',
        laymanSummary:
          'Two six-week trials tested lurasidone added to lithium or valproate in bipolar depression. The first, in 348 patients, worked. The second, in 356 patients, did not. The label carries the indication.',
        technicalDetails:
          'NCT00868452 randomised 348 patients already taking lithium or divalproex and reported a least-squares mean MADRS change of -17.1 on lurasidone against -13.5 on placebo, a difference of -3.6, p=0.005. NCT01284517, a randomised, six-week, double-blind, placebo-controlled, flexible-dose study of the same adjunctive question in patients who had not responded to lithium or divalproex alone, randomised 356 patients and reported -11.8 against -10.4, a difference of -1.5, p=0.176. The second study is larger than the first and ran from November 2010 to August 2012, after the first had read out. Both results are posted on ClinicalTrials.gov. A reader told only about the positive trial has been shown half of a two-trial replication attempt in which the replication failed.',
        evidenceSource: 'NCT00868452 and NCT01284517, posted results, Sumitomo Pharma America',
        measuredMetric:
          'Least-squares mean difference in MADRS change at week 6 against placebo: -3.6 (p=0.005) in the first adjunctive trial and -1.5 (p=0.176) in the second',
        auditFlag: 'caution',
      },
      {
        id: 'lur-a4',
        category: 'failed',
        title: 'The bipolar maintenance trial missed, and there is no maintenance indication',
        laymanSummary:
          'A 965-patient trial asked whether staying on lurasidone alongside a mood stabiliser delays the next episode of mania or depression. It did not reach statistical significance, and the drug has never been approved for that use.',
        technicalDetails:
          'NCT01358357, a phase 3 double-blind maintenance study of lurasidone adjunctive to lithium or divalproex, enrolled 965 participants and ran from June 2011 to April 2015. The primary endpoint, time to recurrence of a mood event during the double-blind phase, gave a hazard ratio of 0.71 (95% CI 0.49 to 1.04) with p<0.078 by Cox proportional hazards, against a design powered at 90% to detect a 15% difference in recurrence rates with 120 events. Median time to recurrence was not reached on lurasidone against 207 days on placebo. The secondary endpoint of time to all-cause discontinuation did separate, hazard ratio 0.72 (95% CI 0.54 to 0.98), p<0.034. A confidence interval crossing 1.00 on the primary endpoint and a significant secondary is the classic shape of a trial that will be described afterwards as encouraging. The United States label carries no maintenance indication for bipolar disorder.',
        evidenceSource:
          'NCT01358357 — Bipolar Maintenance Study of Lurasidone Adjunctive to Lithium or Divalproex, posted results, Sumitomo Pharma America',
        measuredMetric:
          'Hazard ratio for time to recurrence of a mood event: 0.71 (95% CI 0.49 to 1.04), p<0.078',
        auditFlag: 'caution',
      },
      {
        id: 'lur-a5',
        category: 'measured',
        title: 'Equal-lowest effect on symptoms of the fifteen drugs compared',
        laymanSummary:
          'On the pooled measure of how much antipsychotics reduce symptoms in acute schizophrenia, lurasidone came fourteenth of fifteen, tied with iloperidone and below chlorpromazine, a drug from 1957.',
        technicalDetails:
          "Standardised mean difference against placebo for overall symptom change was 0.33 (95% CrI 0.21 to 0.45) for lurasidone, placing it fourteenth of fifteen alongside iloperidone at 0.33 and below chlorpromazine 0.38, asenapine 0.38, ziprasidone 0.39, sertindole 0.39, aripiprazole 0.43, quetiapine 0.44, haloperidol 0.45, zotepine 0.49, paliperidone 0.50, risperidone 0.56, olanzapine 0.59, amisulpride 0.66 and clozapine 0.88. The authors concluded that differences in efficacy between antipsychotics are small but robust. Lurasidone's advantages are real and they are in the tolerability domains, not this one, and a page that quotes the metabolic profile without this figure has described a trade-off as a free lunch.",
        evidenceSource: 'Leucht S et al., Lancet 2013;382:951-962',
        doi: '10.1016/S0140-6736(13)60733-3',
        measuredMetric: 'Standardised mean difference against placebo for overall symptom change',
        auditFlag: 'verified',
      },
      {
        id: 'lur-a6',
        category: 'failed',
        title:
          'In the registration programme, the middle dose worked and the two around it did not',
        laymanSummary:
          'One of the five schizophrenia trials that established this drug tested three fixed doses in 489 patients. Only the middle one beat placebo. The lower and the higher dose both failed.',
        technicalDetails:
          'Section 14.1 of the United States prescribing information describes Study 4 as a six-week placebo-controlled trial with 489 patients on three fixed doses, and records that only the 80 mg per day arm was superior to placebo on PANSS total score and CGI-S at endpoint. The 40 mg and 120 mg arms were not, even though the 40 mg and 120 mg arms of Study 3 both were. A monotonic dose-response is the pattern a pharmacological effect predicts, and this programme does not show one. Two of the five trials also carried an active control, olanzapine in one and extended-release quetiapine in the other, specifically to establish assay sensitivity, which is the standard admission that a negative arm in this field is as likely to be a failed trial as an ineffective drug.',
        evidenceSource:
          'United States prescribing information for lurasidone hydrochloride, section 14.1, via the openFDA drug label endpoint',
        measuredMetric:
          'Change in PANSS total score and CGI-S at week 6 against placebo, by fixed dose arm',
        auditFlag: 'caution',
      },
      {
        id: 'lur-a7',
        category: 'inferred',
        title: 'A better metabolic profile is not a measured cardiovascular outcome',
        laymanSummary:
          'Lurasidone causes less weight gain and less disturbance of blood sugar and cholesterol than olanzapine. Nobody has shown that people taking it have fewer heart attacks or live longer.',
        technicalDetails:
          'What was measured in the registration and comparative programmes are surrogate endpoints: kilograms, fasting glucose, lipid fractions and QTc milliseconds. The clinical claim that gets built on them is a reduction in cardiovascular events and in the mortality gap that people with schizophrenia carry, which runs to roughly fifteen to twenty years of life expectancy. No randomised trial of lurasidone has measured myocardial infarction, stroke or death as a primary endpoint, and the two long trials that exist measured time to relapse and time to recurrence over months, not cardiovascular events over years. The surrogate improvements are genuine and well measured. The outcome inference from them is untested.',
        evidenceSource:
          'Leucht S et al., Lancet 2013;382:951-962; NCT01435928 and NCT01358357 posted results',
        doi: '10.1016/S0140-6736(13)60733-3',
        inferredClaim:
          'That the favourable weight, lipid, glucose and QTc profile translates into fewer cardiovascular events or longer life — no trial of this drug has measured that endpoint',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A once-daily tablet that only works if it is swallowed with a meal',
        laymanDesc:
          'Lurasidone is taken once a day with food of at least 350 calories. On an empty stomach the body absorbs roughly half as much, so the meal is part of the dose, not advice about comfort.',
        molecularDetail:
          'Only an estimated 9 to 19% of an administered dose is absorbed. In the food-effect study mean Cmax was about three times and AUC about twice the fasting values, and exposure did not increase further from a 350 to a 1,000 calorie meal or vary with fat content. Peak concentration is reached in 1 to 3 hours and steady state within about seven days.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It crosses into the brain and is cleared almost entirely by one liver enzyme',
        laymanDesc:
          'The drug reaches the brain and is broken down mainly by a single liver enzyme, which is why a handful of common medicines and grapefruit juice change how much of it is in the body.',
        molecularDetail:
          'Activity is primarily due to the parent compound rather than a metabolite. Clearance is predominantly via CYP3A4, and the label contraindicates strong CYP3A4 inhibitors and strong inducers outright rather than adjusting around them. Plasma protein binding is about 99% and the apparent volume of distribution around 6,173 L.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It occupies dopamine D2 and serotonin 5-HT2A and 5-HT7 tightly',
        laymanDesc:
          'It sits on the dopamine receptor that every antipsychotic since the 1950s has targeted, and on two serotonin receptors alongside it, switching all three off.',
        molecularDetail:
          'Antagonism with Ki of 1 nM at D2, 0.5 nM at 5-HT2A and 0.5 nM at 5-HT7. The 5-HT7 affinity is unusually high for this class and is the receptor most often invoked to explain the antidepressant signal in bipolar depression, though that link is a hypothesis rather than a demonstrated mechanism. Partial agonism at 5-HT1A with Ki 6.4 nM is proposed to contribute in the same direction.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'It leaves the histamine and acetylcholine receptors alone',
        laymanDesc:
          'The receptors that make older drugs in this class sedating, appetite-driving and dry-mouthed are the ones lurasidone was designed to miss. That absence is the point of the molecule.',
        molecularDetail:
          'The label records IC50 above 1,000 nM at both histamine H1 and muscarinic M1, three orders of magnitude weaker than its D2 affinity. H1 blockade is the principal driver of sedation and appetite stimulation in this class, and M1 blockade of dry mouth, constipation, urinary retention and cognitive blunting. The bulky bicyclic norbornane imide at one end of the molecule is the structural feature that keeps it off those sites.',
        iconName: 'ShieldCheck',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title:
          'Symptoms fall modestly, weight and the electrocardiogram stay put, akathisia appears',
        laymanDesc:
          'The effect on symptoms is at the low end of what antipsychotics achieve. What stays normal is weight, blood sugar, cholesterol and the heart tracing. The characteristic complaint is restlessness and an urge to keep moving.',
        molecularDetail:
          "Standardised mean difference against placebo of 0.33 (95% CrI 0.21 to 0.45) for overall symptom change, equal-lowest of fifteen. QTc effect at the favourable extreme of the same fifteen-drug range (SMD 0.10). Akathisia, somnolence, nausea and parkinsonism are the most frequent adverse reactions in the label's pooled short-term data, and akathisia is dose-related.",
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'NCT00868699',
        phase: 'Phase 3, 6-week randomised double-blind placebo-controlled monotherapy trial',
        sampleSize: 505,
        primaryEndpoint:
          'Mean change from baseline in Montgomery-Asberg Depression Rating Scale total score at week 6 in bipolar I depression',
        endpointMet: true,
        statisticalPValue:
          'Least-squares mean change -15.4 on both lurasidone dose ranges against -10.7 on placebo; mean difference -4.6 for each arm, p<0.001 by mixed-model analysis',
        unreportedAdverseSignals:
          'The higher dose range produced exactly the same MADRS change as the lower one, so the trial provides no dose-response gradient for the effect it established.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'NCT00868452',
        phase: 'Phase 3, 6-week randomised double-blind placebo-controlled adjunctive trial',
        sampleSize: 348,
        primaryEndpoint:
          'Mean change from baseline in MADRS total score at week 6 in bipolar I depression, added to lithium or divalproex',
        endpointMet: true,
        statisticalPValue:
          'Least-squares mean change -17.1 against -13.5 on placebo; mean difference -3.6, p=0.005',
        unreportedAdverseSignals:
          'This is the positive half of a two-trial adjunctive programme. The second and larger trial of the same question, NCT01284517, did not separate from placebo.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'NCT01284517',
        phase:
          'Phase 3, 6-week randomised double-blind placebo-controlled flexible-dose adjunctive trial',
        sampleSize: 356,
        primaryEndpoint:
          'Mean change from baseline in MADRS total score at week 6 in bipolar I depression in patients not responding to lithium or divalproex alone',
        endpointMet: false,
        statisticalPValue:
          'Least-squares mean change -11.8 against -10.4 on placebo; mean difference -1.5, p=0.176',
        unreportedAdverseSignals:
          'Larger than the positive adjunctive trial it was meant to confirm, and completed in August 2012 after that trial had reported. The adjunctive indication remains on the United States label.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'NCT01358357',
        phase: 'Phase 3 randomised double-blind placebo-controlled maintenance trial',
        sampleSize: 965,
        primaryEndpoint:
          'Time to recurrence of a mood event during the double-blind phase, lurasidone adjunctive to lithium or divalproex',
        endpointMet: false,
        statisticalPValue:
          'Hazard ratio 0.71 (95% CI 0.49 to 1.04), p<0.078 by Cox proportional hazards; median time to recurrence not reached on lurasidone against 207 days on placebo',
        unreportedAdverseSignals:
          'The secondary endpoint of time to all-cause discontinuation did separate, hazard ratio 0.72 (95% CI 0.54 to 0.98), p<0.034. There is no bipolar maintenance indication on the United States label.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'NCT01435928 (PEARL Schizophrenia Maintenance)',
        phase: 'Phase 3 randomised double-blind placebo-controlled relapse-prevention trial',
        sampleSize: 676,
        primaryEndpoint:
          'Time to first relapse event during the double-blind phase in schizophrenia',
        endpointMet: true,
        statisticalPValue:
          'Log-rank p=0.039, ratio 0.66 (95% CI 0.45 to 0.98); median time to relapse not reached on lurasidone against 192 days on placebo',
        unreportedAdverseSignals:
          'Time to all-cause discontinuation, the secondary endpoint that captures tolerability as well as relapse, did not reach significance: 0.75 (95% CI 0.54 to 1.03), p=0.070, with median 148 days on lurasidone against 115 on placebo.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Leucht 15-drug multiple-treatments meta-analysis',
        phase: 'Bayesian network meta-analysis of 212 blinded randomised trials',
        sampleSize: 43049,
        primaryEndpoint:
          'Mean overall change in symptoms against placebo in acute schizophrenia, with all-cause discontinuation, weight gain, extrapyramidal effects, prolactin, QTc and sedation as secondary outcomes',
        endpointMet: true,
        statisticalPValue:
          'Lurasidone standardised mean difference 0.33 (95% CrI 0.21 to 0.45), fourteenth of fifteen; QTc effect 0.10, the most favourable of the fifteen',
        unreportedAdverseSignals:
          'The drug with the best cardiac signal in the analysis also had the equal-weakest effect on symptoms. Both findings come from the same pooled dataset.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A 4.6-point MADRS advantage over placebo at six weeks in 505 patients with bipolar I depression, p<0.001',
        'A standardised mean difference of 0.33 against placebo for overall symptom change in acute schizophrenia, equal-lowest of fifteen ranked antipsychotics',
        'The most favourable QTc effect of the fifteen drugs ranked (SMD 0.10), and a maximum mean QTcI increase of 7.5 ms at 120 mg in a dedicated thorough QT study',
        'A roughly three-fold peak concentration and two-fold total exposure difference between taking the tablet with a 350-calorie meal and taking it fasting',
        'Time to first relapse in schizophrenia extended against placebo in 676 patients, log-rank p=0.039',
      ],
      unsupportedInferences: [
        'That the adjunctive bipolar depression indication is supported by replicated evidence — the second and larger trial of that question returned p=0.176',
        'That a favourable weight, lipid, glucose and QTc profile means fewer cardiovascular events or longer life — no trial of this drug has measured those endpoints',
        "That lurasidone prevents recurrence in bipolar disorder — the maintenance trial's primary endpoint had a 95% confidence interval crossing 1.00 and there is no such indication",
        'That taking the tablet at a convenient time is equivalent to taking it as tested — every efficacy figure here comes from fed dosing',
      ],
      whatFailedInitially: [
        'NCT01284517, the 356-patient replication of the adjunctive bipolar depression indication, returned a 1.5-point MADRS difference at p=0.176',
        'NCT01358357, the 965-patient bipolar maintenance trial, missed its primary endpoint at p<0.078',
        'In Study 4 of the schizophrenia registration programme, 489 patients on three fixed doses, only the middle dose beat placebo',
      ],
      realWorldOutcome: [
        'About twenty-nine cents a tablet at United States pharmacy acquisition cost now that the generic market has 94 listed products',
        'The routine choice where weight, blood sugar, lipids or the electrocardiogram rule out olanzapine, quetiapine or ziprasidone',
        'One of only two drugs with a monotherapy indication for bipolar depression, alongside quetiapine',
        'A dosing requirement — at least 350 calories of food — that is the most common reason the drug underperforms outside a trial',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet taken once daily with food of at least 350 calories',
      description:
        'There is no injectable, no long-acting form and no orally disintegrating form. The food requirement is a genuine constraint on the drug rather than a labelling formality: absorption is estimated at 9 to 19% of an administered dose, and taking the tablet fasting roughly halves total exposure and cuts peak concentration to about a third of the fed value. Clearance is almost entirely through CYP3A4, and the label contraindicates strong inhibitors and strong inducers of that enzyme rather than dose-adjusting around them.',
      safetyProfile:
        'The United States label carries boxed warnings for increased mortality in elderly patients with dementia-related psychosis and for suicidal thoughts and behaviours in children, adolescents and young adults. The most frequent adverse reactions in the pooled short-term data are somnolence, akathisia, extrapyramidal symptoms and nausea, with akathisia dose-related. Weight gain, lipid and glucose disturbance are at the favourable end of the class range, as is the QTc effect. Neuroleptic malignant syndrome, tardive dyskinesia, orthostatic hypotension, leukopenia, neutropenia and agranulocytosis, seizures and hyperprolactinaemia are all in the label.',
    },
    commonQuestions: [
      {
        q: 'Does it really matter whether I take it with food?',
        a: 'It matters more than for almost any other tablet in psychiatry. The label instructs at least 350 calories, and the food-effect study behind that instruction found peak concentration about three times higher and total exposure about twice as high with food as without. Only an estimated 9 to 19% of a dose is absorbed even under the best conditions. Exposure did not rise further when the meal went from 350 to 1,000 calories and did not depend on fat content, so the number is a floor and not a target. Every efficacy figure on this page comes from trials in which the drug was taken with food.',
        auditNote:
          'This is the one place on this page where a patient behaviour, rather than a biological difference, changes the drug exposure by roughly a factor of two.',
      },
      {
        q: 'Is it as effective as olanzapine or risperidone?',
        a: "No, and the pooled evidence says so plainly. Across 212 blinded trials and 43,049 patients, lurasidone's standardised mean difference against placebo for overall symptom change was 0.33, equal-fourteenth of fifteen drugs, against 0.59 for olanzapine and 0.56 for risperidone. It also came below chlorpromazine at 0.38 and haloperidol at 0.45. What lurasidone buys with that is the best QTc signal of the fifteen and a weight and metabolic profile near the favourable end. That is a real trade and it is worth making for some people, but it is a trade.",
      },
      {
        q: 'Why is it approved for bipolar depression when most antipsychotics are not?',
        a: 'Because a 505-patient trial of lurasidone alone against placebo found a 4.6-point advantage on the MADRS at six weeks with p<0.001, and that result stands. The add-on indication is a different matter. Two trials tested lurasidone added to lithium or valproate: the first, in 348 patients, gave a 3.6-point difference at p=0.005, and the second, in 356 patients and completed afterwards, gave a 1.5-point difference at p=0.176. Both are posted on ClinicalTrials.gov. The monotherapy evidence and the add-on evidence are not of the same strength, and the label does not distinguish between them.',
        auditNote:
          'NCT00868452 and NCT01284517 asked the same question of similar populations and disagreed.',
      },
      {
        q: 'Will it stop my bipolar disorder coming back?',
        a: 'That was tested, in 965 people, and the trial did not show it. NCT01358357 followed patients on lurasidone added to lithium or divalproex and measured time to the next mood event. The hazard ratio was 0.71 with a 95% confidence interval from 0.49 to 1.04 and p<0.078, against a design powered at 90% to find a 15% difference. Median time to recurrence was not reached on lurasidone against 207 days on placebo, which reads well, and the secondary endpoint of time to all-cause discontinuation did separate. But the primary endpoint is the one the trial was designed to answer, and lurasidone has no bipolar maintenance indication in the United States.',
      },
      {
        q: 'Why does this page show a price but no manufacturing cost?',
        a: 'Because no verifiable per-dose cost of production for lurasidone could be found and cited. The figures quoted are from the CMS National Average Drug Acquisition Cost survey, which records what United States pharmacies pay to acquire a drug. That is a price, not a cost of manufacture, and the two are different quantities. Lurasidone is a moderately complex synthesis with four stereocentres that have to be controlled, which is a description of a route rather than a number, and a description is not a cost figure.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Leucht S et al. Comparative efficacy and tolerability of 15 antipsychotic drugs in schizophrenia: a multiple-treatments meta-analysis. Lancet 2013;382:951-962',
        identifier: '10.1016/S0140-6736(13)60733-3',
        kind: 'doi',
      },
      {
        label:
          'NCT00868699 — Lurasidone, A 6-week Study of Patients With Bipolar I Depression (Monotherapy), posted results',
        identifier: 'NCT00868699',
        kind: 'nct',
      },
      {
        label:
          'NCT00868452 — Lurasidone, A 6-week Study of Patients With Bipolar I Depression (Add-on), posted results',
        identifier: 'NCT00868452',
        kind: 'nct',
      },
      {
        label:
          'NCT01284517 — Lurasidone adjunctive to lithium or divalproex in bipolar I depression after non-response, posted results showing p=0.176 on the primary endpoint',
        identifier: 'NCT01284517',
        kind: 'nct',
      },
      {
        label:
          'NCT01358357 — Bipolar Maintenance Study of Lurasidone Adjunctive to Lithium or Divalproex, posted results showing a hazard ratio of 0.71 (95% CI 0.49 to 1.04)',
        identifier: 'NCT01358357',
        kind: 'nct',
      },
      {
        label:
          'NCT01435928 — PEARL Schizophrenia Maintenance, posted results showing log-rank p=0.039 on time to first relapse',
        identifier: 'NCT01435928',
        kind: 'nct',
      },
      {
        label:
          'United States prescribing information for lurasidone hydrochloride, sections 2 (food requirement), 12.2 (receptor affinities and ECG changes), 12.3 (food effect) and 14.1 (schizophrenia clinical studies), via the openFDA drug label endpoint',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22lurasidone+hydrochloride%22',
        kind: 'regulatory',
      },
      {
        label: 'Drugs@FDA: LATUDA (lurasidone hydrochloride), NDA 200603, original approval 2010',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=200603',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 213046 — lurasidone structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/213046',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 6. Ziprasidone — the only antipsychotic whose Indications section tells the prescriber that
  //    other drugs should often be tried first, and the subject of the largest randomised
  //    post-marketing safety study ever run in psychiatry.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'ziprasidone',
    name: 'Ziprasidone',
    tradeName: 'Geodon',
    sponsor:
      'Pfizer (NDA 020825 for the oral capsule approved 2001, NDA 020919 for the intramuscular form); the Upjohn division that held it merged with Mylan in 2020 to form Viatris, and the capsule is now widely generic',
    targetGene: 'DRD2',
    targetProtein:
      'Dopamine D2 (Ki 4.8 nM) and D3 (Ki 7.2 nM) receptors, antagonised, alongside serotonin 5-HT2A (Ki 0.4 nM), 5-HT2C (Ki 1.3 nM), 5-HT1D (Ki 2 nM) and alpha-1 adrenergic (Ki 10 nM). It is an agonist at 5-HT1A (Ki 3.4 nM), has moderate affinity for histamine H1 (Ki 47 nM), essentially none for muscarinic receptors (IC50 above 1 micromolar), and inhibits the synaptic reuptake of both serotonin and noradrenaline.',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2001,
    indication:
      'Schizophrenia; monotherapy for the acute treatment of manic or mixed episodes of bipolar I disorder; and, as an adjunct to lithium or valproate, maintenance treatment of bipolar disorder. The intramuscular form is indicated for acute agitation in patients with schizophrenia.',
    patientFriendlyIndication: 'Schizophrenia, and the manic phase of bipolar disorder',
    anatomicalSite:
      'Mesolimbic and mesocortical dopamine synapses, and the cardiac hERG potassium channel, where the same molecule slows the electrical recovery of the ventricle',
    conditionContext: {
      conditionExplainer:
        'Ziprasidone arrived in 2001 as the antipsychotic that would not cause weight gain. That claim held up. What came with it was an effect on the electrical recovery time of the heart, measured in milliseconds on an electrocardiogram, larger than that of the drugs it was competing against.',
      whyItMatters:
        'A QT interval is not a symptom. It is a measurement on a tracing, and its importance rests entirely on an inference: that a longer interval means a higher chance of a fatal arrhythmia called torsade de pointes. That inference is well founded for large prolongations and much less certain for small ones, and the whole regulatory history of this drug is an argument about where the line sits.',
      whoTakesThis:
        'Adults with schizophrenia and bipolar disorder, chosen most often when weight gain and metabolic disturbance are the deciding problem and the person has no cardiac history.',
      clinicalGoals:
        'The registration trials measured PANSS and BPRS totals in schizophrenia over six weeks and Young Mania Rating Scale scores in mania over three weeks. The post-marketing programme measured something different and much larger: non-suicide death within one year.',
    },
    oneSentenceVerdict:
      'A dopamine D2 and serotonin 5-HT2A antagonist that causes almost no weight gain, ranked eleventh of fifteen antipsychotics on symptom reduction, prolonged the QT interval by roughly 9 to 14 milliseconds more than risperidone, olanzapine, quetiapine and haloperidol in a head-to-head study, and was then randomised against olanzapine in 18,154 patients whose one-year non-suicide mortality came out identical — a study its own authors state was never designed to detect the rare arrhythmia everyone was worried about.',
    laymanHowItWorks:
      'Ziprasidone blocks the dopamine receptor that antipsychotics have targeted since the 1950s and blocks several serotonin receptors at the same time, and it also weakly does what an antidepressant does by slowing the reuptake of serotonin and noradrenaline. It barely touches the receptors that drive appetite, which is why it is one of the few drugs in this class that does not reliably put weight on. The same molecule also slows a potassium current in heart muscle, which stretches out the time the heart takes to reset between beats. It has to be swallowed with food, because on an empty stomach the body absorbs about half as much.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 57,
    substitutes: {
      summary:
        'Ziprasidone costs about thirty-three cents a capsule at United States pharmacy acquisition cost. It occupies a narrow position: metabolically among the cleanest drugs in the class, middling on symptom control, and carrying a cardiac warning strong enough that its own Indications section suggests other drugs first. The comparators below are the drugs a prescriber is choosing between when those three facts are all on the table.',
      conventionalRx: [
        {
          name: 'Lurasidone (Latuda)',
          class: 'Second-generation antipsychotic, D2 and 5-HT2A antagonist',
          howItCompares:
            'The nearest thing to a straight upgrade on the cardiac question. In the fifteen-drug network meta-analysis lurasidone had the most favourable QTc effect of all fifteen (SMD 0.10) where ziprasidone sat toward the unfavourable end, and both share a food requirement and a quiet metabolic profile. Ziprasidone is the more effective of the two on symptoms, 0.39 against 0.33.',
          typicalCost:
            'US$0.2860 per tablet at pharmacy acquisition cost, median across 94 listed generic products (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: the best cardiac signal in the ranked set, and a bipolar depression indication ziprasidone does not have. Cons: a lower measured effect on symptoms, and the same dependence on being taken with food.',
        },
        {
          name: 'Aripiprazole (Abilify)',
          class: 'Dopamine D2 partial agonist',
          howItCompares:
            'A higher efficacy rank than ziprasidone (SMD 0.43 against 0.39), no meaningful QT signal, no prolactin elevation and modest weight gain. It costs less than half as much. What it brings instead is akathisia and a label section on compulsive gambling and other impulse-control behaviours.',
          typicalCost:
            'About thirteen cents per tablet at pharmacy acquisition cost for the generic oral form (CMS NADAC)',
          prosAndCons:
            'Pros: better measured efficacy, no cardiac warning, cheaper. Cons: akathisia, and a documented impulse-control risk.',
        },
        {
          name: 'Olanzapine (Zyprexa)',
          class: 'Second-generation antipsychotic, multi-receptor antagonist',
          howItCompares:
            "The drug ziprasidone was randomised against in ZODIAC, and the comparison is instructive in both directions. Olanzapine ranked third of fifteen on symptom reduction against ziprasidone's eleventh, and had the longest time to all-cause discontinuation in CATIE. It also produced the worst weight gain of the fifteen, which is the whole reason ziprasidone exists. One-year non-suicide mortality in 18,154 randomised patients was the same for both.",
          typicalCost:
            'US$0.1432 per tablet at pharmacy acquisition cost, median across 167 listed generic products (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: substantially better measured effect on symptoms, no QT warning. Cons: the largest weight gain and metabolic disturbance of the fifteen drugs ranked.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Take the capsule with a meal, and swallow it whole',
          action:
            'The label instructs that capsules be administered orally with food, and that they not be opened, crushed or chewed.',
          patientImpact:
            'Absolute bioavailability under fed conditions is about 60%, and absorption is increased up to two-fold in the presence of food. Taking it without food therefore does not give a slightly smaller dose, it gives roughly half of one.',
          clinicalPrecaution:
            'Every efficacy figure on this page comes from trials in which the capsule was taken with food. Anything about timing, meals or how the capsule is handled belongs with a prescriber and a pharmacist.',
        },
        {
          name: 'Tell the prescriber about every other medicine, including over-the-counter ones',
          action:
            'The label contraindicates ziprasidone in combination with other drugs known to prolong the QTc interval, and directs clinicians to identify such drugs rather than assume a list is complete.',
          patientImpact:
            'Low potassium and low magnesium also raise the risk, and both are common consequences of vomiting, diarrhoea and diuretics. The interaction that matters here is not necessarily with another psychiatric drug.',
          clinicalPrecaution:
            'This is a contraindication in the label, not a caution. It is a conversation to have before a new medicine is started, not after.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1CN(CCN1CCC2=C(C=C3C(=C2)CC(=O)N3)Cl)C4=NSC5=CC=CC=C54',
      chemicalFormula: 'C21H21ClN4OS',
      molecularWeight: '412.90 g/mol',
      targetReceptorAffinity:
        'Antagonist at dopamine D2 (Ki 4.8 nM) and D3 (Ki 7.2 nM), serotonin 5-HT2A (Ki 0.4 nM), 5-HT2C (Ki 1.3 nM) and 5-HT1D (Ki 2 nM), and alpha-1 adrenergic (Ki 10 nM). Agonist at 5-HT1A (Ki 3.4 nM). Moderate affinity at histamine H1 (Ki 47 nM) and no appreciable affinity at muscarinic receptors (IC50 above 1 micromolar). It also inhibits the synaptic reuptake of serotonin and noradrenaline, which is unusual for this class. The 5-HT2A to D2 affinity ratio is roughly ten to one, among the highest of the second-generation drugs.',
      structureSource: {
        label: 'PubChem CID 60854 (ziprasidone) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/60854',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'zip-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Incoming control of the benzisothiazolylpiperazine and the chlorooxindole',
          description:
            'Confirm identity and purity of 3-(1-piperazinyl)-1,2-benzisothiazole and of the 5-(2-chloroethyl)-6-chlorooxindole fragment before coupling. The benzisothiazolylpiperazine is a pharmacologically active serotonergic fragment in its own right, so residual unreacted starting material is an active impurity rather than an inert one.',
          reagentsAndBuffer:
            '3-(1-piperazinyl)-1,2-benzisothiazole hydrochloride and 6-chloro-5-(2-chloroethyl)oxindole reference standards, reversed-phase HPLC with UV detection, Karl Fischer titration, ion chromatography for residual chloride',
        },
        {
          id: 'zip-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'N-alkylation joining the oxindole ethyl chain to the piperazine',
          description:
            'React the piperazine nitrogen with the chloroethyl side chain on the oxindole under base. The two-carbon linker is short by the standards of this class, and it is what holds the benzisothiazole and oxindole ends in the geometry that gives the unusually high 5-HT2A to D2 affinity ratio.',
          dependsOnStepId: 'zip-w1',
          reagentsAndBuffer:
            'Sodium carbonate or diisopropylethylamine as base, catalytic sodium iodide, water or acetonitrile at reflux under nitrogen',
        },
        {
          id: 'zip-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Salt selection and crystal-form confirmation for the two dosage forms',
          description:
            'Isolate the hydrochloride monohydrate for the oral capsule and the mesylate trihydrate for the injectable, and confirm each by powder X-ray diffraction and thermal analysis. The two salts exist because ziprasidone free base is poorly soluble in water, and that same poor solubility is why the oral form depends on food and why the injectable needed a cyclodextrin.',
          dependsOnStepId: 'zip-w2',
          reagentsAndBuffer:
            'Hydrogen chloride or methanesulfonic acid, controlled water activity for hydrate formation, powder X-ray diffraction reference patterns, differential scanning calorimetry and thermogravimetric analysis, USP dissolution apparatus with a fed-state biorelevant medium',
        },
        {
          id: 'zip-w4',
          stepNumber: 4,
          phase: 'Conjugation',
          name: 'Cyclodextrin complexation for the intramuscular form',
          description:
            'Form the inclusion complex with sulfobutylether-beta-cyclodextrin that makes an injectable solution possible at all. This is a formulation step rather than a chemical modification: the cyclodextrin encloses the hydrophobic portion of the molecule and carries it into solution, and the released drug is chemically identical to the oral form.',
          dependsOnStepId: 'zip-w3',
          reagentsAndBuffer:
            'Sulfobutylether-beta-cyclodextrin sodium, water for injection, phase-solubility determination, lyophilisation, reconstitution testing with sterile water for injection',
        },
        {
          id: 'zip-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'hERG channel assay run alongside the receptor panel, not after it',
          description:
            'Measure block of the hERG potassium current by patch clamp in parallel with the D2, D3, 5-HT2A, 5-HT2C, 5-HT1A, 5-HT1D, alpha-1 and H1 binding panel. For ziprasidone the cardiac assay is not a safety afterthought bolted onto a finished profile: it is the measurement that determines where the drug can be used, and it belongs on the same page as the affinities that make it work.',
          dependsOnStepId: 'zip-w4',
          reagentsAndBuffer:
            'HEK293 cells stably expressing hERG, whole-cell patch clamp at physiological temperature, E-4031 as positive control, membranes from cells expressing human D2, D3, 5-HT2A, 5-HT2C, 5-HT1A, 5-HT1D, alpha-1 and H1 receptors, radioligand competition binding, synaptosomal serotonin and noradrenaline uptake assay',
        },
      ],
    },
    keyAudits: [
      {
        id: 'zip-a1',
        category: 'measured',
        title: "The label's own Indications section says other drugs should often be tried first",
        laymanSummary:
          "Most drug labels put their warnings in the warnings section. Ziprasidone's United States label puts a sentence in the very first section, the one that says what the drug is for, telling prescribers that in many cases the conclusion would be to try something else first.",
        technicalDetails:
          'Section 1 of the United States prescribing information, immediately after listing the indications, states that the prescriber should consider the finding of ziprasidone\'s greater capacity to prolong the QT/QTc interval compared to several other antipsychotic drugs, that QTc prolongation is associated in some other drugs with the ability to cause torsade de pointes, and that "in many cases this would lead to the conclusion that other drugs should be tried first." Placing a comparative disadvantage inside Indications and Usage rather than in Warnings is unusual, and it is a regulatory judgement about how the drug should be positioned rather than a finding from any single trial.',
        evidenceSource:
          'United States prescribing information for ziprasidone hydrochloride, section 1 (Indications and Usage), via the openFDA drug label endpoint',
        measuredMetric: 'The text of the approved United States label, section 1',
        auditFlag: 'verified',
      },
      {
        id: 'zip-a2',
        category: 'measured',
        title: 'Nine to fourteen milliseconds more QT than four comparator antipsychotics',
        laymanSummary:
          "A study compared ziprasidone directly against four other antipsychotics on how much they stretch the heart's electrical recovery time. Ziprasidone added about 9 to 14 milliseconds more than all four, and about 14 milliseconds less than thioridazine, the drug that was later effectively abandoned over this issue.",
        technicalDetails:
          'The head-to-head study described in section 5.3 of the United States label measured electrocardiograms at maximum plasma concentration in patient volunteers, both with each drug alone and with each drug co-administered with a CYP3A4 inhibitor. The mean increase in QTc from baseline for ziprasidone was approximately 9 to 14 msec greater than for risperidone, olanzapine, quetiapine and haloperidol, and approximately 14 msec less than for thioridazine. Ketoconazole 200 mg twice daily did not augment the effect. In placebo-controlled adult trials, oral ziprasidone increased QTc by approximately 10 msec at 160 mg daily. Electrocardiograms exceeding 500 msec occurred in 2 of 2,988 ziprasidone patients (0.06%) and 1 of 440 placebo patients (0.23%), and the label states neither ziprasidone case suggested a drug role. In the fifteen-drug network meta-analysis ziprasidone was among the less favourable drugs on QTc, in a range running from 0.10 for lurasidone to -0.90 for sertindole.',
        evidenceSource:
          'United States prescribing information for ziprasidone hydrochloride, section 5.3 (QT Prolongation and Risk of Sudden Death); Leucht S et al., Lancet 2013;382:951-962',
        doi: '10.1016/S0140-6736(13)60733-3',
        measuredMetric:
          'Mean change in QTc from baseline at maximum plasma concentration, against four comparator antipsychotics and thioridazine',
        auditFlag: 'verified',
      },
      {
        id: 'zip-a3',
        category: 'inferred',
        title:
          'The 18,154-patient safety study could not measure the event it was built to reassure about',
        laymanSummary:
          'Pfizer randomised 18,154 patients to ziprasidone or olanzapine and counted deaths over a year. The rates were the same. The authors then wrote that the study was neither powered nor designed to detect the rare arrhythmia that the QT warning is actually about.',
        technicalDetails:
          'ZODIAC, registered as NCT00418171, was an open-label randomised post-marketing large simple trial in 18,154 patients with schizophrenia across 18 countries, with 9,077 in each arm. The primary outcome, non-suicide mortality within one year of initiating treatment, was 0.91 for ziprasidone and 0.90 for olanzapine, relative risk 1.02 (95% CI 0.76 to 1.39), confirmed across secondary and sensitivity analyses. The authors\' own conclusion states that the study excludes a relative risk larger than 1.39 with high probability, and then states plainly: "However, the study was neither powered nor designed to examine the risk of rare events like torsade de pointes." Torsade de pointes is the event the entire QT warning exists to prevent. A study that rules out a 39% increase in all non-suicide death has genuinely useful information in it, and it is not the same information as an absence of arrhythmia risk. Follow-up was by unblinded treating psychiatrists reporting vital status, and sudden death was a post hoc secondary analysis.',
        evidenceSource: 'Strom BL et al., Am J Psychiatry 2011;168:193-201; NCT00418171',
        doi: '10.1176/appi.ajp.2010.08040484',
        inferredClaim:
          'That equal one-year non-suicide mortality in ZODIAC demonstrates ziprasidone does not carry an arrhythmia risk — the authors state the trial was neither powered nor designed to examine rare events like torsade de pointes',
        auditFlag: 'caution',
      },
      {
        id: 'zip-a4',
        category: 'failed',
        title: 'Adding it to lithium or valproate in acute mania did not beat placebo',
        laymanSummary:
          'A 680-patient trial tested ziprasidone added on top of lithium or divalproex in acute mania. Neither dose range beat placebo on the mania rating scale at three weeks.',
        technicalDetails:
          "NCT00312494, a three-week double-blind multicentre placebo-controlled study of add-on oral ziprasidone in subjects with acute mania already treated with lithium or divalproex, randomised 680 patients. Least-squares mean change from baseline in Young Mania Rating Scale total score was -10.95 in the lower ziprasidone dose arm and -10.19 in the higher one, against -9.47 on placebo, with p=0.1077 and p=0.4274 respectively against placebo. Both arms missed. The dose-response also runs backwards: the higher arm performed worse than the lower one. Ziprasidone's acute mania indication is for monotherapy, and its adjunctive bipolar indication is for maintenance rather than acute treatment, so this negative trial does not contradict the label. It does mean that the add-on question in acute mania was asked at scale and answered no.",
        evidenceSource:
          'NCT00312494 — A Three-Week, Double-Blind, Multicenter, Placebo-Controlled Study Evaluating the Efficacy and Safety of Add-On Oral Ziprasidone in Subjects With Acute Mania Treated With Lithium or Divalproex, posted results',
        measuredMetric:
          'Least-squares mean change in Young Mania Rating Scale total score at week 3: -10.95 and -10.19 on ziprasidone against -9.47 on placebo',
        auditFlag: 'caution',
      },
      {
        id: 'zip-a5',
        category: 'failed',
        title: 'Seventy-nine per cent of its patients stopped taking it within eighteen months',
        laymanSummary:
          'In the largest independent trial of antipsychotics ever run in the United States, ziprasidone had the second-highest dropout rate of the five drugs tested. Four out of five people had stopped by the end.',
        technicalDetails:
          "CATIE randomised 1,493 patients with chronic schizophrenia at 57 United States sites to olanzapine, perphenazine, quetiapine or risperidone, with ziprasidone added after its approval. Of the 1,432 who received at least one dose, 74% discontinued before 18 months: 64% on olanzapine, 74% on risperidone, 75% on perphenazine, 79% on ziprasidone and 82% on quetiapine. Time to discontinuation for any cause was significantly longer on olanzapine than on quetiapine (p<0.001) or risperidone (p=0.002), but the comparison against ziprasidone (p=0.028) did not meet the study's adjusted threshold. The trial was funded by the National Institute of Mental Health, not by a manufacturer, and its primary measure was whether people kept taking the drug at all, which is a different and harder question than whether a rating scale moved over six weeks.",
        evidenceSource: 'Lieberman JA et al., N Engl J Med 2005;353:1209-1223; NCT00014001',
        doi: '10.1056/NEJMoa051688',
        measuredMetric:
          'All-cause discontinuation of assigned treatment within 18 months, by drug arm',
        auditFlag: 'verified',
      },
      {
        id: 'zip-a6',
        category: 'measured',
        title: "It held its own as an active control in a competitor's trial",
        laymanSummary:
          'A rival company ran a trial of its own new drug and included ziprasidone as the yardstick. Ziprasidone beat placebo by about five points on the symptom scale and matched the drug being tested.',
        technicalDetails:
          "NCT00254202, sponsored by Vanda Pharmaceuticals to evaluate iloperidone in acute exacerbation of schizophrenia, randomised 593 patients to iloperidone, ziprasidone or placebo. Mean change from baseline in PANSS total score was -12.0 on iloperidone, -12.3 on ziprasidone and -7.1 on placebo. An active-control result generated by a company with no commercial interest in the comparator is a cleaner form of evidence than a sponsor's own registration trial, and it puts ziprasidone's effect size in the same place the pooled meta-analysis does: real, and modest.",
        evidenceSource:
          'NCT00254202 — Vanda Pharmaceuticals iloperidone trial with ziprasidone as active control, posted results',
        measuredMetric:
          'Mean change from baseline in PANSS total score: -12.3 on ziprasidone against -7.1 on placebo',
        auditFlag: 'verified',
      },
      {
        id: 'zip-a7',
        category: 'inferred',
        title: 'A quiet metabolic profile is measured; fewer cardiovascular events are not',
        laymanSummary:
          'Ziprasidone genuinely does not cause the weight gain that olanzapine does. Nobody has shown that people who take it instead have fewer heart attacks or live longer, and this drug carries a cardiac warning of its own running the other way.',
        technicalDetails:
          "In the fifteen-drug network meta-analysis, standardised mean differences for weight gain ran from -0.09 for haloperidol at the favourable end to -0.74 for olanzapine at the unfavourable end, with ziprasidone toward the favourable side. Those are kilograms and laboratory values, and the argument built on them is a reduction in cardiovascular events and in the fifteen-to-twenty-year mortality gap carried by people with schizophrenia. ZODIAC is the only trial that measured a hard outcome, and what it found was equality with olanzapine on one-year non-suicide mortality, not superiority. The metabolic advantage is well measured and the outcome advantage has never been demonstrated, and in ziprasidone's case a second surrogate, the QT interval, points in the opposite direction.",
        evidenceSource:
          'Leucht S et al., Lancet 2013;382:951-962; Strom BL et al., Am J Psychiatry 2011;168:193-201',
        doi: '10.1176/appi.ajp.2010.08040484',
        inferredClaim:
          'That avoiding weight gain with ziprasidone reduces cardiovascular events or mortality — the one trial with a mortality endpoint found parity with olanzapine, not superiority',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A capsule taken twice a day, always with food',
        laymanDesc:
          'Ziprasidone is a capsule swallowed whole, twice daily, with a meal. Without food the body absorbs about half as much, so a missed meal changes the dose rather than the timing.',
        molecularDetail:
          'Absolute bioavailability of a 20 mg dose under fed conditions is approximately 60%, and absorption is increased up to two-fold in the presence of food. Peak plasma concentration is reached at 6 to 8 hours. Plasma protein binding exceeds 99%, mainly to albumin and alpha-1-acid glycoprotein.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It reaches the brain and is broken down mostly by an enzyme that is not P450',
        laymanDesc:
          'The drug enters the brain and is then cleared, mainly through a pathway that is different from the one most psychiatric drugs use, which keeps its interaction list shorter than expected.',
        molecularDetail:
          "Approximately two-thirds of clearance is by aldehyde oxidase-mediated reduction, with the remainder by CYP3A4 oxidation. Less than 1% is excreted unchanged in urine and under 4% in faeces. The four major circulating metabolites are benzisothiazole sulphoxide and sulphone, ziprasidone sulphoxide and S-methyldihydroziprasidone, and none carries the parent's activity.",
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It blocks dopamine D2 and serotonin 5-HT2A, and blocks serotonin reuptake too',
        laymanDesc:
          'It switches off the dopamine receptor that dampens hallucinations and delusions, switches off several serotonin receptors, and additionally slows the reuptake of serotonin and noradrenaline in the way an antidepressant does.',
        molecularDetail:
          'Antagonism at D2 (Ki 4.8 nM), D3 (7.2 nM), 5-HT2A (0.4 nM), 5-HT2C (1.3 nM), 5-HT1D (2 nM) and alpha-1 (10 nM), with agonism at 5-HT1A (3.4 nM). The 5-HT2A to D2 ratio of roughly ten to one is among the highest in the class. Synaptic reuptake inhibition of serotonin and noradrenaline is stated in the label and is an unusual property for an antipsychotic.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The same molecule blocks a potassium channel in heart muscle',
        laymanDesc:
          'A potassium channel in heart cells does the work of resetting the electrical charge after each beat. Ziprasidone slows it, and the electrocardiogram records the delay as a longer QT interval.',
        molecularDetail:
          "Block of the hERG-encoded rapid delayed-rectifier potassium current prolongs ventricular repolarisation. In the label's head-to-head study, the mean QTc increase from baseline was approximately 9 to 14 msec greater than risperidone, olanzapine, quetiapine and haloperidol, and approximately 14 msec less than thioridazine. Co-administration with ketoconazole did not augment it, which points to a direct channel effect rather than a metabolic one.",
        iconName: 'HeartPulse',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Symptoms fall modestly, weight stays put, the electrocardiogram changes',
        laymanDesc:
          'The effect on symptoms is in the middle of the field. Weight, blood sugar and cholesterol stay largely where they were, which is the main reason to choose it. The trade is on the heart tracing.',
        molecularDetail:
          'Standardised mean difference against placebo of 0.39 (95% CrI 0.30 to 0.49) for overall symptom change, eleventh of fifteen. Weight gain toward the favourable end of the fifteen-drug range. QTc increased by approximately 10 msec at 160 mg daily against placebo. In 18,154 randomised patients, one-year non-suicide mortality was 0.91 against 0.90 for olanzapine, relative risk 1.02 (95% CI 0.76 to 1.39).',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'NCT00418171 (ZODIAC)',
        phase: 'Phase 4 open-label randomised post-marketing large simple trial',
        sampleSize: 18154,
        primaryEndpoint:
          'Non-suicide mortality within one year of initiating ziprasidone or olanzapine, in naturalistic practice across 18 countries',
        endpointMet: true,
        statisticalPValue:
          'Non-suicide mortality 0.91 on ziprasidone against 0.90 on olanzapine; relative risk 1.02 (95% CI 0.76 to 1.39)',
        unreportedAdverseSignals:
          'The authors state the study was neither powered nor designed to examine the risk of rare events like torsade de pointes, which is the event the QT warning exists to prevent. Follow-up was by unblinded treating psychiatrists, and sudden death was analysed post hoc.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'NCT00014001 (CATIE, phase 1)',
        phase: 'Phase 4 double-blind randomised effectiveness trial, up to 18 months',
        sampleSize: 1493,
        primaryEndpoint:
          'Time to discontinuation of assigned antipsychotic for any cause in chronic schizophrenia',
        endpointMet: false,
        statisticalPValue:
          "79% of ziprasidone patients discontinued before 18 months against 64% on olanzapine, 74% on risperidone, 75% on perphenazine and 82% on quetiapine; olanzapine versus ziprasidone p=0.028, which did not meet the study's adjusted threshold",
        unreportedAdverseSignals:
          'Ziprasidone entered the trial late, after its approval, so its arm accrued fewer patients than the others. The trial was publicly funded and no drug arm retained a majority of its patients.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'NCT00312494',
        phase: 'Phase 3, 3-week randomised double-blind placebo-controlled add-on trial',
        sampleSize: 680,
        primaryEndpoint:
          'Change from baseline to week 3 in Young Mania Rating Scale total score, ziprasidone added to lithium or divalproex in acute mania',
        endpointMet: false,
        statisticalPValue:
          'Least-squares mean change -10.95 on the lower dose arm (p=0.1077) and -10.19 on the higher dose arm (p=0.4274) against -9.47 on placebo',
        unreportedAdverseSignals:
          'The higher dose arm performed worse than the lower one, so the trial provides no dose-response signal in the expected direction.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'NCT00254202',
        phase: 'Randomised double-blind placebo- and active-controlled trial in acute exacerbation',
        sampleSize: 593,
        primaryEndpoint:
          'Change from baseline in PANSS total score, with ziprasidone as active control',
        endpointMet: true,
        statisticalPValue:
          'Mean change -12.3 on ziprasidone and -12.0 on iloperidone against -7.1 on placebo',
        unreportedAdverseSignals:
          'The sponsor was Vanda Pharmaceuticals, a competitor with no commercial interest in ziprasidone, which makes this a cleaner estimate of its effect than a manufacturer-run registration trial.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Leucht 15-drug multiple-treatments meta-analysis',
        phase: 'Bayesian network meta-analysis of 212 blinded randomised trials',
        sampleSize: 43049,
        primaryEndpoint:
          'Mean overall change in symptoms against placebo in acute schizophrenia, with all-cause discontinuation, weight gain, extrapyramidal effects, prolactin, QTc and sedation as secondary outcomes',
        endpointMet: true,
        statisticalPValue:
          'Ziprasidone standardised mean difference 0.39 (95% CrI 0.30 to 0.49), eleventh of fifteen',
        unreportedAdverseSignals:
          'Ziprasidone sits toward the unfavourable end of the QTc range in the same analysis, in which lurasidone was most favourable at 0.10 and sertindole least at -0.90.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A standardised mean difference of 0.39 against placebo for overall symptom change, eleventh of fifteen ranked antipsychotics',
        'A QTc increase approximately 9 to 14 msec greater than risperidone, olanzapine, quetiapine and haloperidol in a direct head-to-head study, and about 14 msec less than thioridazine',
        'One-year non-suicide mortality of 0.91 against 0.90 for olanzapine in 18,154 randomised patients, relative risk 1.02 (95% CI 0.76 to 1.39)',
        'Absorption increased up to two-fold in the presence of food, with fed bioavailability of about 60%',
        '79% all-cause discontinuation within 18 months in the publicly funded CATIE trial',
      ],
      unsupportedInferences: [
        'That ZODIAC showed ziprasidone does not cause dangerous arrhythmias — its authors state it was neither powered nor designed to examine rare events like torsade de pointes',
        'That a favourable weight and metabolic profile means fewer cardiovascular events — the only mortality trial found parity with olanzapine, not superiority',
        'That adding ziprasidone to lithium or valproate helps in acute mania — a 680-patient trial found neither dose arm beat placebo',
        'That taking the capsule at a convenient time is equivalent to taking it as tested — fasted dosing roughly halves absorption',
      ],
      whatFailedInitially: [
        'NCT00312494, the 680-patient add-on trial in acute mania, missed at p=0.1077 and p=0.4274 with the higher dose performing worse than the lower',
        'Four out of five ziprasidone patients in CATIE stopped the drug within eighteen months',
        'The 2001 approval came with a comparative QT disadvantage written into the Indications section itself, a position no other drug on this page occupies',
      ],
      realWorldOutcome: [
        'About thirty-three cents a capsule at United States pharmacy acquisition cost, across 60 listed generic products',
        'Chosen where weight gain and metabolic disturbance are the deciding problem and there is no cardiac history',
        'A contraindication against combining it with any other QT-prolonging drug, which in practice restricts a large part of the pharmacopoeia',
        'An intramuscular form for acute agitation, made possible only by a cyclodextrin that carries the poorly soluble molecule into solution',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule taken twice daily with food, and an intramuscular injection for acute agitation in schizophrenia',
      description:
        'The capsule must be swallowed whole with a meal and must not be opened, crushed or chewed. Fed bioavailability is about 60% and absorption roughly doubles with food, so the meal is part of the dose. The intramuscular form is a sulfobutylether-beta-cyclodextrin complex, a formulation choice forced by the free base being too poorly water-soluble to inject on its own. There is no long-acting injectable.',
      safetyProfile:
        'The United States label carries a boxed warning for increased mortality in elderly patients with dementia-related psychosis. Section 5.3 covers QT prolongation and the risk of sudden death, and combination with other QT-prolonging drugs is a contraindication rather than a caution. Congenital long QT syndrome, a history of cardiac arrhythmias, bradycardia, hypokalaemia and hypomagnesaemia are all reasons to avoid it. Section 5.5 covers severe cutaneous adverse reactions including DRESS and Stevens-Johnson syndrome, which are sometimes fatal. Neuroleptic malignant syndrome, tardive dyskinesia, metabolic changes, orthostatic hypotension, leukopenia, neutropenia and agranulocytosis, seizures and cerebrovascular events in elderly patients with dementia are all in the label.',
    },
    commonQuestions: [
      {
        q: 'Is the QT warning something to actually worry about?',
        a: 'It is measured, and the size of the measurement is known. A direct comparison study found ziprasidone added approximately 9 to 14 milliseconds more to the QTc than risperidone, olanzapine, quetiapine and haloperidol, and about 14 milliseconds less than thioridazine. Placebo-controlled trials showed roughly 10 milliseconds at the top approved daily amount. The label itself states that the link between QT prolongation and torsade de pointes is clearest for increases of 20 milliseconds and greater, and that smaller prolongations may still increase risk in susceptible people. That is the honest state of the evidence: a real and reproducible effect of a size that sits below the threshold where the danger is established, in a drug where combining it with other QT-prolonging medicines is a contraindication.',
        auditNote:
          'The comparative QT statement is in section 1 of the label, not section 5, which is where a manufacturer would normally prefer it.',
      },
      {
        q: "Didn't a huge study prove it was safe?",
        a: 'A huge study measured something specific and found no difference. ZODIAC randomised 18,154 patients in 18 countries to ziprasidone or olanzapine and counted non-suicide deaths over one year: 0.91 against 0.90, relative risk 1.02 with a 95% confidence interval from 0.76 to 1.39. That excludes a 39% increase in overall non-suicide death with high probability, which is genuinely useful. The authors then wrote in their own conclusion that the study was neither powered nor designed to examine the risk of rare events like torsade de pointes. Torsade de pointes is the specific event the warning is about. A trial can be the largest ever run in its field and still be the wrong instrument for the question people quote it for.',
        auditNote:
          "The limitation is stated by the study's own authors in the published abstract, not by a critic afterwards.",
      },
      {
        q: 'Why does it have to be taken with food?',
        a: 'Because without it, roughly half the drug does not get absorbed. Absolute bioavailability under fed conditions is about 60%, and the label records that absorption is increased up to two-fold in the presence of food. Every efficacy figure that exists for this drug comes from trials in which it was taken with a meal. A person taking it on an empty stomach is not taking a slightly weaker version of the tested drug, they are taking about half of it.',
      },
      {
        q: 'Does it work as well as the others?',
        a: "It is in the middle. Across 212 blinded trials and 43,049 patients, ziprasidone's standardised mean difference against placebo for overall symptom change was 0.39, eleventh of fifteen, against 0.59 for olanzapine and 0.56 for risperidone. In an independent trial run by a competitor, where ziprasidone was included only as a yardstick, it moved the PANSS by 12.3 points against 7.1 on placebo. In CATIE, 79% of its patients had stopped within eighteen months. The picture is consistent across all three: a real effect, a modest one, and one that most people do not stay on for long.",
      },
      {
        q: 'Why does this page show a price but no manufacturing cost?',
        a: 'Because no verifiable per-dose cost of production for ziprasidone could be found and cited. The figures quoted come from the CMS National Average Drug Acquisition Cost survey, which records what United States pharmacies pay to acquire a drug. That is a price, not a cost of manufacture. The oral capsule is a single alkylation between two purchased fragments followed by salt formation, and the injectable adds a cyclodextrin complexation step, but describing a route is not the same as pricing one.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Strom BL et al. Comparative mortality associated with ziprasidone and olanzapine in real-world use among 18,154 patients with schizophrenia: The Ziprasidone Observational Study of Cardiac Outcomes (ZODIAC). Am J Psychiatry 2011;168:193-201',
        identifier: '10.1176/appi.ajp.2010.08040484',
        kind: 'doi',
      },
      {
        label:
          'Lieberman JA et al. Effectiveness of antipsychotic drugs in patients with chronic schizophrenia (CATIE). N Engl J Med 2005;353:1209-1223',
        identifier: '10.1056/NEJMoa051688',
        kind: 'doi',
      },
      {
        label:
          'Leucht S et al. Comparative efficacy and tolerability of 15 antipsychotic drugs in schizophrenia: a multiple-treatments meta-analysis. Lancet 2013;382:951-962',
        identifier: '10.1016/S0140-6736(13)60733-3',
        kind: 'doi',
      },
      {
        label: 'NCT00418171 — ZODIAC, the randomised post-marketing cardiovascular safety trial',
        identifier: 'NCT00418171',
        kind: 'nct',
      },
      {
        label:
          'NCT00312494 — Add-on oral ziprasidone in acute mania treated with lithium or divalproex, posted results showing p=0.1077 and p=0.4274 against placebo',
        identifier: 'NCT00312494',
        kind: 'nct',
      },
      {
        label:
          'NCT00254202 — Vanda Pharmaceuticals iloperidone trial with ziprasidone as active control, posted results',
        identifier: 'NCT00254202',
        kind: 'nct',
      },
      {
        label: 'NCT00014001 — Clinical Antipsychotic Trials of Intervention Effectiveness (CATIE)',
        identifier: 'NCT00014001',
        kind: 'nct',
      },
      {
        label:
          'United States prescribing information for ziprasidone hydrochloride, sections 1 (Indications and Usage), 2 (administration with food), 5.3 (QT Prolongation and Risk of Sudden Death), 5.5 (severe cutaneous adverse reactions), 12.2 and 12.3, via the openFDA drug label endpoint',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22ziprasidone+hydrochloride%22',
        kind: 'regulatory',
      },
      {
        label: 'Drugs@FDA: GEODON (ziprasidone hydrochloride), NDA 020825, original approval 2001',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020825',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 60854 — ziprasidone structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/60854',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 7. Paliperidone — risperidone's own liver metabolite, licensed as a separate drug two years
  //    before risperidone went generic, and now fifteen times the price of its parent.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'paliperidone',
    name: 'Paliperidone',
    tradeName: 'Invega',
    sponsor:
      'Janssen Pharmaceuticals, part of Johnson & Johnson (NDA 021999 for the oral extended-release tablet approved 2006, NDA 022264 for Invega Sustenna, NDA 207946 for Invega Trinza and Invega Hafyera); the oral tablet is now generic and the long-acting injectables remain brand products',
    targetGene: 'DRD2',
    targetProtein:
      'Dopamine D2 receptor (Ki 1.6 to 2.8 nM) and serotonin 5-HT2A receptor (Ki 0.8 to 1.2 nM), both antagonised, with antagonism at alpha-1 and alpha-2 adrenergic and histamine H1 receptors. The label records no affinity for cholinergic muscarinic or beta-adrenergic receptors, and states that the two enantiomers are qualitatively and quantitatively similar in vitro.',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2006,
    indication:
      'Schizophrenia in adults, with efficacy established in three 6-week trials and one maintenance trial, and in adolescents aged 12 to 17 on one 6-week trial; and schizoaffective disorder in adults, both as monotherapy and as an adjunct to mood stabilisers or antidepressants, established in two 6-week trials',
    patientFriendlyIndication: 'Schizophrenia, and schizoaffective disorder',
    anatomicalSite:
      'Mesolimbic and mesocortical dopamine synapses, and the tuberoinfundibular pathway, where D2 blockade removes the brake on prolactin release from the pituitary',
    conditionContext: {
      conditionExplainer:
        "Paliperidone is not a new discovery. It is 9-hydroxyrisperidone, the molecule a person's liver already makes from risperidone, isolated and sold as a product of its own. Its own label states this in the mechanism section: paliperidone is the major active metabolite of risperidone.",
      whyItMatters:
        "Anyone who has ever taken risperidone has had paliperidone in their bloodstream. That does not make the drug useless, and the long-acting injectable forms genuinely solved a delivery problem that risperidone's injectable did not. It does mean the efficacy question was largely settled before the first paliperidone trial was run, and it makes the fifteen-fold price difference between the two a fact worth stating plainly.",
      whoTakesThis:
        'Adults and adolescents from age 12 with schizophrenia, and adults with schizoaffective disorder, which is the only drug-specific indication for that diagnosis in the United States. The injectable forms are used most where taking a daily tablet is the step that fails.',
      clinicalGoals:
        'The registration trials measured PANSS totals and the Personal and Social Performance scale over six weeks. The long trials measured time to relapse, and the trials for the three-month and six-month injectables measured whether they were no worse than the one-month injectable.',
    },
    oneSentenceVerdict:
      "Risperidone's major active metabolite sold as a separate medicine, ranked fifth of fifteen antipsychotics on symptom reduction, carries the largest prolactin elevation of all fifteen, performed indistinguishably from long-acting risperidone when the two were put head to head in 1,221 patients, and costs about fifteen times as much per tablet as the drug it is derived from.",
    laymanHowItWorks:
      'When someone swallows risperidone, the liver converts most of it into a second molecule that does the same job. Paliperidone is that second molecule, purified and sold on its own. It blocks the dopamine receptor that dampens hallucinations and delusions, and blocks a serotonin receptor at the same time. Because it skips the conversion step, it is less affected by the liver enzymes that vary between people, and it is chemically better suited to being made into an injection that lasts one, three or six months.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 62,
    substitutes: {
      summary:
        "The oral tablet costs about a dollar at United States pharmacy acquisition cost. Risperidone, the drug the body turns into paliperidone, costs about six and a half cents. That is a fifteen-fold difference for a molecule that appears in the bloodstream of every risperidone patient anyway. The genuine argument for paliperidone is not the tablet, it is the injectable: an intramuscular formulation that lasts a month, three months or six months, which risperidone's own injectable never matched.",
      conventionalRx: [
        {
          name: 'Risperidone (Risperdal)',
          class: 'Serotonin-dopamine antagonist, and the parent compound of paliperidone',
          howItCompares:
            'The body converts risperidone into paliperidone. In a 1,221-patient head-to-head trial of the two long-acting injectables, PANSS change was -18.6 on paliperidone palmitate against -17.9 on long-acting risperidone, a difference of 0.4 with a 95% confidence interval from -1.62 to 2.38 against a five-point non-inferiority margin. On pooled acute efficacy the two are adjacent: risperidone 0.56 and paliperidone 0.50 of fifteen ranked drugs.',
          typicalCost:
            'US$0.0644 per tablet at pharmacy acquisition cost, median across 126 listed generic products (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: about one fifteenth the price, longer track record, and the same active molecule reaches the brain. Cons: the conversion step depends on CYP2D6, which varies between people, and its long-acting injectable requires two-weekly dosing rather than monthly.',
        },
        {
          name: 'Aripiprazole (Abilify)',
          class: 'Dopamine D2 partial agonist, also available as a long-acting injectable',
          howItCompares:
            "The realistic alternative when prolactin is the deciding problem. Paliperidone had the largest prolactin elevation of the fifteen drugs ranked (SMD -1.30) and aripiprazole the only effect pointing the other way (0.22). Aripiprazole ranked ninth against paliperidone's fifth on symptom reduction, and its injectables run monthly or two-monthly.",
          typicalCost:
            'About thirteen cents per tablet at pharmacy acquisition cost for the generic oral form (CMS NADAC)',
          prosAndCons:
            'Pros: no prolactin elevation, far less weight gain, cheaper. Cons: a lower measured effect on symptoms, akathisia, and a label section on compulsive behaviours.',
        },
        {
          name: 'Olanzapine (Zyprexa)',
          class: 'Second-generation antipsychotic, multi-receptor antagonist',
          howItCompares:
            "Ranked third of fifteen against paliperidone's fifth (SMD 0.59 versus 0.50) and had the longest time to all-cause discontinuation in CATIE. It causes the worst weight gain of the fifteen where paliperidone is mid-range, and it raises prolactin far less.",
          typicalCost:
            'US$0.1432 per tablet at pharmacy acquisition cost, median across 167 listed generic products (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            "Pros: a higher efficacy rank, much less prolactin elevation. Cons: the largest weight and metabolic burden in the class, and its long-acting injectable carries a post-injection delirium warning that paliperidone's does not.",
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Swallow the extended-release tablet whole',
          action:
            'The label states the tablet should be swallowed whole and should not be chewed, divided or crushed.',
          patientImpact:
            'The extended-release tablet releases the drug through a rigid shell at a controlled rate over the day. Breaking it defeats the release mechanism, and the label carries a separate warning that obstructive symptoms may result in patients with gastrointestinal disease.',
          clinicalPrecaution:
            'Anyone with a history of gastrointestinal narrowing, strictures or severe swallowing difficulty should raise it with a prescriber before starting, not after. This is a warning in the label rather than a handling preference.',
        },
        {
          name: 'Ask for prolactin to be checked, and say if periods, breasts or libido change',
          action:
            'Section 5.7 of the label states that prolactin elevations occur and persist during chronic administration. Missed periods, breast enlargement or discharge, and loss of sexual interest are the symptoms that follow from it.',
          patientImpact:
            "Paliperidone had the largest prolactin effect of the fifteen antipsychotics ranked head to head. This is the drug's most predictable and most under-discussed adverse effect, and it is measurable with a single blood test.",
          clinicalPrecaution:
            'Prolactin elevation is a reason for a conversation about which drug to use, not something to manage independently. Nothing here is advice about stopping or changing a medicine.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC1=C(C(=O)N2CCCC(C2=N1)O)CCN3CCC(CC3)C4=NOC5=C4C=CC(=C5)F',
      chemicalFormula: 'C23H27FN4O3',
      molecularWeight: '426.50 g/mol',
      targetReceptorAffinity:
        'Antagonist at dopamine D2 (Ki 1.6 to 2.8 nM) and serotonin 5-HT2A (Ki 0.8 to 1.2 nM), and at alpha-1 and alpha-2 adrenergic and histamine H1 receptors. No affinity for cholinergic muscarinic or beta-1 and beta-2 adrenergic receptors. The single structural difference from risperidone is a hydroxyl group at the 9-position, added by the liver rather than by a chemist, and it is that hydroxyl that makes the palmitate ester of the long-acting injectable possible.',
      structureSource: {
        label: 'PubChem CID 115237 (paliperidone) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/115237',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'pal-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity confirmation against risperidone and the 7-hydroxy isomer',
          description:
            'Confirm that the material is 9-hydroxyrisperidone and not risperidone or the 7-hydroxy positional isomer. The three differ by one oxygen atom in one position, they are not separated by molecular weight alone, and the starting material for one route is the finished drug of another product. This is the QC step that a metabolite-as-drug programme cannot skip.',
          reagentsAndBuffer:
            'Risperidone, 7-hydroxyrisperidone and paliperidone reference standards, reversed-phase HPLC with UV and mass detection, 1H and 13C NMR, chiral HPLC to characterise the enantiomer ratio',
        },
        {
          id: 'pal-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Construction of the hydroxylated pyridopyrimidinone core and coupling to the benzisoxazole piperidine',
          description:
            'Build the 9-hydroxy-2-methyl-pyrido[1,2-a]pyrimidin-4-one bearing the ethyl linker, then alkylate 6-fluoro-3-(4-piperidinyl)-1,2-benzisoxazole with it. The hydroxyl is installed chemically rather than left to hepatic CYP2D6, which is the entire pharmacological point of the product: exposure no longer depends on a metaboliser genotype.',
          dependsOnStepId: 'pal-w1',
          reagentsAndBuffer:
            '6-fluoro-3-(4-piperidinyl)-1,2-benzisoxazole, the corresponding chloroethyl or mesyloxyethyl hydroxypyridopyrimidinone, potassium carbonate or diisopropylethylamine as base, catalytic potassium iodide, dimethylformamide or acetonitrile under nitrogen',
        },
        {
          id: 'pal-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation and control of the risperidone carry-over specification',
          description:
            'Recrystallise to specification and set an explicit limit on residual risperidone. Residual parent here is not an inert impurity: it is an approved active drug that the body converts back into the product, so it inflates apparent potency rather than diluting it, and it has to be quantified rather than assumed low.',
          dependsOnStepId: 'pal-w2',
          reagentsAndBuffer:
            'Ethanol or ethanol-water anti-solvent system with controlled cooling ramp, powder X-ray diffraction, differential scanning calorimetry, HPLC assay for related substances with a risperidone-specific limit',
        },
        {
          id: 'pal-w4',
          stepNumber: 4,
          phase: 'Conjugation',
          name: 'Palmitate esterification and nanocrystal suspension for the long-acting injectable',
          description:
            'Esterify the 9-hydroxyl with palmitic acid and mill the resulting ester into an aqueous nanocrystal suspension. The ester is a prodrug that dissolves slowly from the muscle and is hydrolysed back to paliperidone, and the release rate is set by particle size rather than by chemistry. This step is the reason the molecule exists as a separate product: risperidone has no equivalent hydroxyl to esterify.',
          dependsOnStepId: 'pal-w3',
          reagentsAndBuffer:
            'Palmitoyl chloride or palmitic anhydride with base, wet bead milling to a defined particle size distribution, polysorbate 20 and polyethylene glycol 4000 as suspending agents, citrate-buffered aqueous vehicle, laser diffraction particle sizing',
        },
        {
          id: 'pal-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Prolactin release assay alongside the receptor binding panel',
          description:
            'Measure prolactin release from pituitary lactotroph culture in parallel with D2, 5-HT2A, alpha-1, alpha-2 and H1 binding. Paliperidone produced the largest prolactin elevation of the fifteen antipsychotics ranked head to head, and a receptor affinity table alone does not predict the size of that effect. The endocrine measurement belongs on the same page as the affinities.',
          dependsOnStepId: 'pal-w4',
          reagentsAndBuffer:
            'Primary rat pituitary lactotroph culture or GH3 cells, dopamine as the physiological inhibitory reference, prolactin immunoassay, membranes expressing human D2, 5-HT2A, alpha-1, alpha-2 and H1 receptors, radioligand competition binding',
        },
      ],
    },
    keyAudits: [
      {
        id: 'pal-a1',
        category: 'conclusion_shift',
        title: 'A new drug that the body was already making from an old one',
        laymanSummary:
          "Paliperidone is the molecule your liver turns risperidone into. It was approved as a separate medicine in 2006. Risperidone's first generic versions were approved in October 2008.",
        technicalDetails:
          'Section 12.1 of the United States prescribing information states directly: "Paliperidone is the major active metabolite of risperidone." Paliperidone extended-release tablets were approved under NDA 021999 in 2006. The earliest abbreviated new drug applications for risperidone were approved from 16 October 2008 onward, according to the Drugs@FDA application records. The sequence is a fact about dates rather than an accusation about intent, and it is the single most useful thing to know when reading a comparison between the two. Note also what the metabolite genuinely bought: paliperidone carries a 9-position hydroxyl that risperidone does not, and that hydroxyl is what allows a palmitate ester and therefore an injection lasting one, three or six months. The delivery advance is real. The efficacy question was largely answered before the first paliperidone trial began.',
        evidenceSource:
          'United States prescribing information for paliperidone, section 12.1, via the openFDA drug label endpoint; Drugs@FDA records for NDA 021999 and for risperidone ANDA approvals from October 2008',
        inferredClaim:
          'That paliperidone represents a new therapeutic mechanism — its own label identifies it as the major active metabolite of a drug approved in 1993',
        auditFlag: 'contested',
      },
      {
        id: 'pal-a2',
        category: 'measured',
        title: 'Head to head against long-acting risperidone, the difference was 0.4 PANSS points',
        laymanSummary:
          'Janssen ran its own monthly injection against the older risperidone injection in 1,221 patients. The two were separated by less than half a point on a scale that runs from 30 to 210.',
        technicalDetails:
          'NCT00589914, a randomised double-blind parallel-group comparison of flexible doses of paliperidone palmitate against flexible doses of long-acting intramuscular risperidone, enrolled 1,221 patients with schizophrenia. Mean change in PANSS total score was -18.6 for paliperidone palmitate against -17.9 for Risperdal Consta, a difference of 0.4 with a 95% confidence interval from -1.62 to 2.38 against a pre-specified non-inferiority margin of five points. This is the cleanest available measurement of what the newer product adds pharmacologically, it was generated by the company that owns both, and the answer it gives is nothing detectable. The advantage of paliperidone palmitate is a dosing interval, not a stronger effect.',
        evidenceSource:
          'NCT00589914 — randomised comparison of paliperidone palmitate and long-acting intramuscular risperidone, posted results, Johnson & Johnson Pharmaceutical Research & Development',
        measuredMetric:
          'Mean difference in PANSS total score change: 0.4 (95% CI -1.62 to 2.38) against a five-point non-inferiority margin',
        auditFlag: 'verified',
      },
      {
        id: 'pal-a3',
        category: 'measured',
        title: 'The largest prolactin elevation of the fifteen antipsychotics ranked',
        laymanSummary:
          'Across 212 trials and 43,049 patients, paliperidone raised prolactin more than any other antipsychotic in the comparison. The label states the elevation persists for as long as the drug is taken.',
        technicalDetails:
          'In the Leucht multiple-treatments meta-analysis, standardised mean differences against placebo for prolactin increase ran from 0.22 for aripiprazole at the favourable end to -1.30 for paliperidone at the unfavourable end. Paliperidone therefore holds both ends of a genuine trade in this dataset: fifth of fifteen on symptom reduction with a standardised mean difference of 0.50 (95% CrI 0.39 to 0.60), and last of fifteen on prolactin. Section 5.7 of the United States label states that prolactin elevations occur and persist during chronic administration. Sustained hyperprolactinaemia produces amenorrhoea, galactorrhoea, gynaecomastia and sexual dysfunction, and is measurable with a single blood test that is not routinely ordered.',
        evidenceSource:
          'Leucht S et al., Lancet 2013;382:951-962; United States prescribing information for paliperidone, section 5.7',
        doi: '10.1016/S0140-6736(13)60733-3',
        measuredMetric:
          'Standardised mean difference against placebo for prolactin increase: -1.30, the least favourable of fifteen drugs',
        auditFlag: 'verified',
      },
      {
        id: 'pal-a4',
        category: 'inferred',
        title:
          'The three-month and six-month injections were tested against the one-month, not against anything better',
        laymanSummary:
          'The longer-acting versions of this drug were approved by showing they were no worse than the shorter-acting version of the same drug. No trial asked whether they beat an alternative.',
        technicalDetails:
          'NCT01515423 was a randomised double-blind non-inferiority study of the three-month against the one-month paliperidone palmitate formulation in 1,429 patients. The percentage without relapse at week 48 was 91.5% on the three-month formulation and 90.0% on the one-month formulation. The three-month product was approved under NDA 207946 with an original approval date of 18 May 2015, and the six-month product was added to the same application later. Each formulation in the chain is established against its own predecessor. That design answers the question of whether a longer interval is safe to substitute, and it is the right design for that question. It does not measure whether a longer interval improves any outcome, and it never compares the franchise against a different drug or against generic risperidone.',
        evidenceSource:
          'NCT01515423 — non-inferiority study of paliperidone palmitate three-month and one-month formulations, posted results; Drugs@FDA NDA 207946, original approval 18 May 2015',
        inferredClaim:
          'That a three-month or six-month injection produces better outcomes than a one-month injection — the trials were designed to show non-inferiority to the predecessor product, not superiority over anything',
        auditFlag: 'caution',
      },
      {
        id: 'pal-a5',
        category: 'inferred',
        title: "A five-fold dose range with, in the label's own words, fairly similar effects",
        laymanSummary:
          'The three registration trials tested amounts from 3 mg to 15 mg a day. The label reports that the effects at all of those amounts were fairly similar, with the higher ones only numerically better.',
        technicalDetails:
          'Section 14.1 of the United States prescribing information describes three placebo-controlled and olanzapine-controlled six-week fixed-dose trials in 1,665 adults, at 3, 6, 9, 12 and 15 mg daily. It states that paliperidone was superior to placebo on the PANSS at all doses, that mean effects at all doses were fairly similar, and that the higher doses were only numerically superior. A five-fold range producing an essentially flat response is what would be expected if D2 occupancy is already near its ceiling at the lowest amount tested, which means the dose-finding data do not support the intuition that more drug does more work. The label reflects this: the recommended adult amount is 6 mg with no initial titration required.',
        evidenceSource:
          'United States prescribing information for paliperidone, sections 2.1 and 14.1, via the openFDA drug label endpoint',
        inferredClaim:
          'That a higher amount of paliperidone produces a proportionally larger effect — the registration data across a five-fold range are described in the label itself as fairly similar',
        auditFlag: 'caution',
      },
      {
        id: 'pal-a6',
        category: 'inferred',
        title: 'The maintenance trial was stopped early at an interim analysis',
        laymanSummary:
          'The trial that established paliperidone keeps schizophrenia from coming back was halted before it finished, because an interim look showed the drug was working. Trials stopped this way tend to report larger effects than trials that run to completion.',
        technicalDetails:
          "Section 14.1 of the label describes a randomised withdrawal design: an eight-week run-in, a six-week open-label stabilisation phase, then randomisation to continue paliperidone or switch to placebo until relapse. It records that an interim analysis showed a significantly longer time to relapse on paliperidone and that the trial was stopped early because maintenance of efficacy was demonstrated. Stopping early for benefit is standard and ethically defensible practice. It is also a well-documented source of effect-size inflation, because a trial is most likely to cross a stopping boundary at a moment when random variation is running in the drug's favour. The direction of the finding is not in doubt here. Its magnitude is less certain than a completed trial's would have been, and the label does not report a hazard ratio or a p-value for it.",
        evidenceSource:
          'United States prescribing information for paliperidone, section 14.1, via the openFDA drug label endpoint',
        inferredClaim:
          'That the size of the relapse-prevention effect is established — the trial was terminated at an interim analysis and the label reports no effect estimate for it',
        auditFlag: 'caution',
      },
      {
        id: 'pal-a7',
        category: 'measured',
        title: 'A rigid tablet with its own gastrointestinal warning',
        laymanSummary:
          'The oral tablet releases its contents through a rigid shell over the course of the day. It must be swallowed whole, and the label warns that in people with gastrointestinal disease it can cause obstruction symptoms.',
        technicalDetails:
          'Section 2.3 of the United States label states that the tablet should be swallowed whole and should not be chewed, divided or crushed. Section 5.8 carries a distinct warning headed Gastrointestinal Narrowing, stating that obstructive symptoms may result in patients with gastrointestinal disease. This is a consequence of the delivery system rather than of the molecule: the extended-release tablet is a non-deformable unit that passes through the gut largely intact. It is the reason a person with strictures, a history of bowel surgery or severe dysphagia is a poor candidate for this specific formulation while being a perfectly reasonable candidate for the same drug given by injection.',
        evidenceSource:
          'United States prescribing information for paliperidone, sections 2.3 and 5.8, via the openFDA drug label endpoint',
        measuredMetric: 'The text of the approved United States label, sections 2.3 and 5.8',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A rigid daily tablet, or an injection lasting one, three or six months',
        laymanDesc:
          'The oral form is a once-daily tablet that must be swallowed whole. The injectable forms are given once a month, once every three months, or twice a year.',
        molecularDetail:
          'The oral product is an extended-release tablet delivering drug at a controlled rate through a non-deformable shell, which is why it must not be chewed, divided or crushed and why the label carries a gastrointestinal narrowing warning. The injectables are aqueous nanocrystal suspensions of paliperidone palmitate; release rate is governed by particle dissolution from the muscle rather than by a polymer.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It skips the liver conversion step that risperidone depends on',
        laymanDesc:
          "Risperidone has to be converted by the liver into this molecule before much of its work is done. Paliperidone arrives already converted, so how fast a person's liver works matters much less.",
        molecularDetail:
          'Risperidone is hydroxylated to 9-hydroxyrisperidone by CYP2D6, an enzyme with well-characterised poor, intermediate, extensive and ultra-rapid metaboliser phenotypes. Paliperidone is that hydroxylated product, and it is not extensively metabolised: about 59% of a dose is excreted unchanged in urine, and no single hepatic pathway dominates its clearance. The palmitate ester of the injectable is hydrolysed back to paliperidone after dissolution from the muscle.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It blocks dopamine D2 and serotonin 5-HT2A',
        laymanDesc:
          'It switches off the dopamine receptor that dampens hallucinations and delusions, and switches off a serotonin receptor alongside it. That combination is what the whole second-generation class is built on.',
        molecularDetail:
          'Antagonism at D2 with Ki 1.6 to 2.8 nM and at 5-HT2A with Ki 0.8 to 1.2 nM, plus antagonism at alpha-1 and alpha-2 adrenergic and H1 histaminergic receptors. No affinity for muscarinic or beta-adrenergic receptors, which is why anticholinergic effects are largely absent. The label states the pharmacological activity of the two enantiomers is qualitatively and quantitatively similar in vitro.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The same blockade reaches the pituitary and prolactin rises',
        laymanDesc:
          'Dopamine is the brake that keeps the pituitary gland from releasing prolactin. Blocking dopamine releases the brake, and prolactin goes up and stays up for as long as the drug is taken.',
        molecularDetail:
          'D2 blockade in the tuberoinfundibular pathway removes tonic dopaminergic inhibition of lactotroph prolactin secretion. In the fifteen-drug network meta-analysis paliperidone had the least favourable prolactin effect of all fifteen at a standardised mean difference of -1.30. Section 5.7 of the label states the elevation occurs and persists during chronic administration, and the clinical consequences are amenorrhoea, galactorrhoea, gynaecomastia and sexual dysfunction.',
        iconName: 'AlertTriangle',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Symptoms fall, relapse is delayed, hormones move',
        laymanDesc:
          'The effect on symptoms is toward the better end of what antipsychotics achieve. The long-acting injections genuinely delay relapse. The price is the largest hormonal disturbance in the class.',
        molecularDetail:
          'Standardised mean difference against placebo of 0.50 (95% CrI 0.39 to 0.60) for overall symptom change, fifth of fifteen. Against long-acting risperidone the difference was 0.4 PANSS points (95% CI -1.62 to 2.38). In the three-month versus one-month injectable comparison, 91.5% against 90.0% remained relapse-free at 48 weeks. Prolactin effect last of fifteen at -1.30.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'NCT00589914',
        phase: 'Phase 3 randomised double-blind parallel-group active-controlled trial',
        sampleSize: 1221,
        primaryEndpoint:
          'Change in PANSS total score, flexible-dose paliperidone palmitate against flexible-dose long-acting intramuscular risperidone in schizophrenia',
        endpointMet: true,
        statisticalPValue:
          'PANSS change -18.6 on paliperidone palmitate against -17.9 on long-acting risperidone; mean difference 0.4 (95% CI -1.62 to 2.38) against a five-point non-inferiority margin',
        unreportedAdverseSignals:
          'The trial establishes equivalence, not advantage. It was run by the company that owns both products, which makes the null result harder to attribute to a comparator being handicapped.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'NCT01515423',
        phase: 'Phase 3 randomised multicentre double-blind non-inferiority trial',
        sampleSize: 1429,
        primaryEndpoint:
          'Percentage of participants without relapse at week 48, three-month against one-month paliperidone palmitate formulation',
        endpointMet: true,
        statisticalPValue:
          '91.5% relapse-free on the three-month formulation against 90.0% on the one-month formulation at week 48',
        unreportedAdverseSignals:
          "The comparator is the sponsor's own earlier formulation of the same molecule. No arm tested a different drug, and no arm tested generic risperidone.",
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'Paliperidone acute schizophrenia registration programme (three 6-week fixed-dose trials)',
        phase:
          'Three randomised placebo-controlled and olanzapine-controlled 6-week fixed-dose trials',
        sampleSize: 1665,
        primaryEndpoint:
          'Change from baseline in PANSS total score at week 6, with the Personal and Social Performance scale as a co-measure, at 3, 6, 9, 12 and 15 mg daily',
        endpointMet: true,
        statisticalPValue:
          'Superior to placebo on the PANSS at all doses; the label records that mean effects at all doses were fairly similar and higher doses only numerically superior',
        unreportedAdverseSignals:
          'A five-fold dose range produced an essentially flat response, which the label states plainly and which argues against the intuition that a higher amount does more.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Leucht 15-drug multiple-treatments meta-analysis',
        phase: 'Bayesian network meta-analysis of 212 blinded randomised trials',
        sampleSize: 43049,
        primaryEndpoint:
          'Mean overall change in symptoms against placebo in acute schizophrenia, with all-cause discontinuation, weight gain, extrapyramidal effects, prolactin, QTc and sedation as secondary outcomes',
        endpointMet: true,
        statisticalPValue:
          'Paliperidone standardised mean difference 0.50 (95% CrI 0.39 to 0.60), fifth of fifteen; prolactin effect -1.30, the least favourable of the fifteen',
        unreportedAdverseSignals:
          'Paliperidone and risperidone, the metabolite and its parent, sit adjacent in the ranking at 0.50 and 0.56, which is what a shared active molecule predicts.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A standardised mean difference of 0.50 against placebo for overall symptom change, fifth of fifteen ranked antipsychotics',
        'The least favourable prolactin effect of the fifteen drugs ranked, at a standardised mean difference of -1.30',
        'A 0.4-point PANSS difference against long-acting risperidone in 1,221 patients, 95% CI -1.62 to 2.38',
        '91.5% against 90.0% relapse-free at 48 weeks for the three-month against the one-month injectable in 1,429 patients',
        'Superiority to placebo at every dose from 3 mg to 15 mg across three trials and 1,665 patients, with effects the label describes as fairly similar across that range',
      ],
      unsupportedInferences: [
        "That paliperidone is a distinct therapeutic advance over risperidone — its own label identifies it as risperidone's major active metabolite",
        'That the three-month and six-month injections improve outcomes over the one-month — every trial in that chain was designed to show non-inferiority to its predecessor',
        'That a higher amount produces a proportionally larger effect — the registration data across a five-fold range are flat',
        'That the size of the relapse-prevention benefit is established — the maintenance trial was stopped early and the label reports no effect estimate',
      ],
      whatFailedInitially: [
        "The head-to-head trial against long-acting risperidone found a difference of 0.4 PANSS points, which is the sponsor's own measurement of what the newer molecule adds pharmacologically",
        'Paliperidone finished last of fifteen on prolactin in the same analysis that placed it fifth on efficacy',
        'The oral extended-release tablet carries its own gastrointestinal narrowing warning, a formulation problem rather than a pharmacological one',
      ],
      realWorldOutcome: [
        'About one dollar per tablet at United States pharmacy acquisition cost against about six and a half cents for risperidone, a fifteen-fold difference for a molecule the body makes from the cheaper drug',
        'The only drug in the United States with a specific indication for schizoaffective disorder',
        'A long-acting injectable franchise running from monthly to twice-yearly, which is a genuine delivery advance risperidone never matched',
        'Prolactin elevation that persists for as long as the drug is taken, and that a single blood test would detect',
      ],
    },
    deliverySystem: {
      type: 'Oral extended-release tablet taken once daily, and paliperidone palmitate intramuscular injections given monthly, three-monthly or six-monthly',
      description:
        'The oral tablet is a non-deformable extended-release unit that must be swallowed whole and not chewed, divided or crushed, and the label carries a separate gastrointestinal narrowing warning for patients with gastrointestinal disease. The injectables are nanocrystal suspensions of the palmitate ester, which dissolves slowly from muscle and is hydrolysed back to paliperidone; release rate is set by particle size. The 9-position hydroxyl that distinguishes paliperidone from risperidone is what makes that ester possible, and it is the clearest technical justification for the product existing separately.',
      safetyProfile:
        'The United States label carries a boxed warning for increased mortality in elderly patients with dementia-related psychosis. Section 5.7 states that prolactin elevations occur and persist during chronic administration, and paliperidone had the largest prolactin effect of the fifteen antipsychotics ranked head to head. Section 5.8 warns of gastrointestinal narrowing with the oral extended-release tablet. Neuroleptic malignant syndrome, tardive dyskinesia, metabolic changes including hyperglycaemia and dyslipidaemia, orthostatic hypotension and syncope, leukopenia, neutropenia and agranulocytosis, seizures and cognitive and motor impairment are all in the label. There is no anticholinergic burden, because the drug has no muscarinic affinity.',
    },
    commonQuestions: [
      {
        q: 'Is this just risperidone under a different name?',
        a: "It is risperidone's major active metabolite, and the label says so in the mechanism section. When a person takes risperidone, the liver converts it into 9-hydroxyrisperidone, which is paliperidone. So anyone who has taken risperidone has had this molecule circulating. What paliperidone adds is not a new mechanism but two practical things: exposure no longer depends on the CYP2D6 enzyme that varies between people, and the extra hydroxyl group allows a palmitate ester and therefore an injection that lasts one, three or six months. When the two long-acting injectables were compared directly in 1,221 patients, the difference was 0.4 PANSS points with a confidence interval straddling zero.",
        auditNote:
          'Approved 2006 under NDA 021999. The first generic risperidone applications were approved from October 2008.',
      },
      {
        q: 'Why does it cost fifteen times more than risperidone?',
        a: 'The oral tablet is about a dollar at United States pharmacy acquisition cost against about six and a half cents for risperidone. The two figures come from the same CMS survey on the same date, and the difference is not a manufacturing one: both are moderately simple small molecules made by dozens of generic manufacturers. The honest answer is that the price reflects market position rather than production, and this page cannot tell you what either one costs to make, because no verifiable cost-of-production study for either molecule could be found and cited.',
      },
      {
        q: 'What is the prolactin problem?',
        a: "Dopamine normally acts as a brake on the pituitary's release of prolactin. Every drug that blocks dopamine releases that brake to some degree, and paliperidone releases it more than any other antipsychotic in the fifteen-drug comparison, with a standardised mean difference of -1.30 against 0.22 for aripiprazole at the other end. The label states the elevation occurs and persists during chronic administration. In practice that means missed periods, breast enlargement or discharge, and loss of sexual interest, in a drug whose symptom-reduction rank is fifth of fifteen. It is measurable with one blood test, and it is the single most predictable trade this drug asks a person to make.",
        auditNote:
          'The efficacy rank and the prolactin rank come from the same pooled dataset of 212 trials.',
      },
      {
        q: 'Is the six-month injection better than the monthly one?',
        a: 'No trial has asked that. The three-month formulation was compared against the one-month formulation in 1,429 patients, and 91.5% against 90.0% remained relapse-free at week 48 — a non-inferiority design, meaning the question was whether the longer interval was no worse, not whether it was better. The six-month product was added to the same application afterwards on the same logic. That is a reasonable way to license a formulation change and it is the right design for the substitution question. It is not evidence that fewer injections improve any outcome, and no trial in that chain compares the franchise against a different drug.',
      },
      {
        q: 'Why does this page show a price but no manufacturing cost?',
        a: 'Because no verifiable per-dose cost of production for paliperidone could be found and cited. The figures quoted come from the CMS National Average Drug Acquisition Cost survey, which records what United States pharmacies pay to acquire a drug. That is a price, not a cost of manufacture. The oral route is a coupling between two purchased fragments and a crystallisation, and the injectable adds an esterification and a milling step, but describing a route is not the same as pricing one.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Leucht S et al. Comparative efficacy and tolerability of 15 antipsychotic drugs in schizophrenia: a multiple-treatments meta-analysis. Lancet 2013;382:951-962',
        identifier: '10.1016/S0140-6736(13)60733-3',
        kind: 'doi',
      },
      {
        label:
          'NCT00589914 — randomised double-blind comparison of paliperidone palmitate and long-acting intramuscular risperidone, posted results',
        identifier: 'NCT00589914',
        kind: 'nct',
      },
      {
        label:
          'NCT01515423 — non-inferiority study of paliperidone palmitate three-month and one-month formulations, posted results',
        identifier: 'NCT01515423',
        kind: 'nct',
      },
      {
        label:
          'United States prescribing information for paliperidone extended-release tablets, sections 2.1, 2.3, 5.7, 5.8, 12.1, 12.2 and 14.1, via the openFDA drug label endpoint',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22paliperidone%22',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA: INVEGA (paliperidone extended-release tablets), NDA 021999, Janssen Pharmaceuticals',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021999',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA: INVEGA TRINZA and INVEGA HAFYERA (paliperidone palmitate), NDA 207946, original approval 18 May 2015',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=207946',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA: INVEGA SUSTENNA (paliperidone palmitate extended-release injectable suspension), NDA 022264',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=022264',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 115237 — paliperidone structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/115237',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 8. Haloperidol — the 1967 drug that beat eight of the fourteen newer ones it was ranked
  //    against, and lost two large placebo-controlled trials of its most common hospital use.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'haloperidol',
    name: 'Haloperidol',
    tradeName: 'Haldol',
    sponsor:
      'Discovered at Janssen Pharmaceutica in 1958 and first approved in the United States in 1967; the Haldol applications passed through Ortho-McNeil and the molecule has been generic for decades, with 107 listed generic products in the current pricing survey',
    targetGene: 'DRD2',
    targetProtein:
      'Dopamine D2 receptor, antagonised with high affinity and almost nothing else. The label records lower-affinity binding at alpha-1 adrenergic receptors and minimal binding at muscarinic cholinergic and histamine H1 receptors, which is why its side-effect profile is dominated by movement disorders rather than by sedation or weight gain.',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1967,
    indication:
      'Management of manifestations of psychotic disorders; control of tics and vocal utterances of Tourette disorder in children and adults; and severe behaviour problems in children of combative, explosive hyperexcitability which cannot be accounted for by immediate provocation',
    patientFriendlyIndication: 'Psychosis, and the tics of Tourette disorder',
    anatomicalSite:
      'Striatal and mesolimbic dopamine synapses, where near-complete D2 blockade produces both the antipsychotic effect and the movement disorders in the same structure',
    conditionContext: {
      conditionExplainer:
        'Haloperidol is the reference point for this entire class. Almost every second-generation antipsychotic was licensed on trials that used it as the active comparator, and almost every marketing claim made for those drugs was a claim about being better than haloperidol.',
      whyItMatters:
        'When 212 of those trials were finally pooled and ranked in 2013, haloperidol came seventh of fifteen on symptom reduction, above quetiapine, aripiprazole, ziprasidone, chlorpromazine, asenapine, sertindole, lurasidone and iloperidone. The authors wrote that their findings challenge the straightforward classification of antipsychotics into first-generation and second-generation groupings. That single sentence undid a commercial premise that had run for two decades.',
      whoTakesThis:
        'Adults with psychotic disorders, children and adults with Tourette disorder, and, far more often than any label describes, agitated and delirious patients in emergency departments and intensive care units around the world.',
      clinicalGoals:
        'The registration-era trials measured BPRS and PANSS totals. The two large modern trials measured something entirely different: days alive without delirium or coma, and days alive and out of hospital at 90 days.',
    },
    oneSentenceVerdict:
      'A nearly pure dopamine D2 blocker from 1967 that ranked seventh of fifteen antipsychotics on symptom reduction — above eight newer drugs — while producing the worst movement-disorder rate of the fifteen (odds ratio 4.76 for extrapyramidal effects) and the least weight gain, and which failed to improve delirium in 566 randomised ICU patients and failed its primary endpoint in 1,000 more, in both cases given by a route its own label states in capital letters is not approved.',
    laymanHowItWorks:
      'Haloperidol blocks the dopamine receptor and does almost nothing else. That single-mindedness is why it is powerful against hallucinations and delusions and why it is so hard on movement: the same receptor that carries the psychotic symptoms also runs the circuit that lets a person start, stop and smooth out a movement. Because it barely touches the histamine and acetylcholine receptors, it does not cause the weight gain, the heavy sedation or the dry mouth that most newer drugs in this class do. It trades one kind of side effect for another rather than avoiding side effects.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 60,
    substitutes: {
      summary:
        'Haloperidol costs about sixteen cents a tablet at United States pharmacy acquisition cost. The case against it has never been that it does not work; the pooled ranking places it above eight newer drugs. The case against it is the movement disorders, which are the worst of the fifteen and which include tardive dyskinesia, a syndrome the label describes as potentially irreversible. Every comparator below is a drug bought with that trade in mind.',
      conventionalRx: [
        {
          name: 'Olanzapine (Zyprexa)',
          class: 'Second-generation antipsychotic, multi-receptor antagonist',
          howItCompares:
            "Ranked third of fifteen against haloperidol's seventh (SMD 0.59 versus 0.45) and had the lowest all-cause discontinuation in CATIE. The trade runs the other way on the body: haloperidol had the least weight gain of the fifteen at a standardised mean difference of -0.09 and olanzapine the most at -0.74.",
          typicalCost:
            'US$0.1432 per tablet at pharmacy acquisition cost, median across 167 listed generic products (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: a measurably better effect on symptoms and far fewer movement effects. Cons: the largest weight gain and metabolic disturbance of the fifteen drugs ranked.',
        },
        {
          name: 'Risperidone (Risperdal)',
          class: 'Serotonin-dopamine antagonist',
          howItCompares:
            "Ranked fourth of fifteen against haloperidol's seventh (SMD 0.56 versus 0.45), with far fewer extrapyramidal effects, and it costs less than half as much per tablet. Both are available as long-acting injections. Risperidone substitutes a substantial prolactin elevation for haloperidol's movement problem.",
          typicalCost:
            'US$0.0644 per tablet at pharmacy acquisition cost, median across 126 listed generic products (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: better measured efficacy, fewer movement effects, cheaper. Cons: prolactin elevation with its hormonal consequences.',
        },
        {
          name: 'Quetiapine (Seroquel)',
          class: 'Second-generation antipsychotic, strongly antihistaminergic',
          howItCompares:
            "The comparison that best illustrates why the first- and second-generation labels stopped meaning much. Quetiapine ranked eighth of fifteen at a standardised mean difference of 0.44 against haloperidol's 0.45 at seventh — a difference of one hundredth of a standard deviation, in favour of the older drug. Quetiapine causes far fewer movement effects and far more sedation and weight gain.",
          typicalCost:
            'US$0.0876 per tablet at pharmacy acquisition cost, median across listed generic products (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: no meaningful extrapyramidal burden, no tardive dyskinesia risk of the same order. Cons: no better on symptoms, and the sedation and weight gain that haloperidol avoids.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Learn what tardive dyskinesia looks like, and report movements early',
          action:
            'Involuntary movements of the tongue, lips, jaw, face or limbs that appear during treatment or after it stops are the sign the label describes. Noticing them early is the only thing that changes the outcome.',
          patientImpact:
            'The label states the syndrome consists of potentially irreversible, involuntary, dyskinetic movements and that its prevalence appears highest among the elderly, especially elderly women. There is no test for it and no way to predict who will develop it; it is found by looking.',
          clinicalPrecaution:
            'This is a reason to see a prescriber promptly, not a reason to stop a medicine independently. Stopping an antipsychotic can temporarily mask the movements it caused, which makes self-directed changes actively unhelpful here.',
        },
        {
          name: 'Ask whether the injection is being given into a vein',
          action:
            'The United States label for haloperidol injection states, in capital letters, that it is not approved for intravenous administration, and directs that if it is given that way the electrocardiogram should be monitored for QTc prolongation and arrhythmias.',
          patientImpact:
            'Intravenous administration is the route used almost universally in intensive care and in many emergency departments, and it is the route used in both of the large randomised trials of ICU delirium. It is not the route the label approves.',
          clinicalPrecaution:
            'Route of administration is a decision for the treating team, and off-label routes are lawful and often reasonable. Knowing that the route is off-label is what allows a family to ask about cardiac monitoring.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1CN(CCC1(C2=CC=C(C=C2)Cl)O)CCCC(=O)C3=CC=C(C=C3)F',
      chemicalFormula: 'C21H23ClFNO2',
      molecularWeight: '375.90 g/mol',
      targetReceptorAffinity:
        'High-affinity antagonist at the dopamine D2 receptor, with lower affinity at alpha-1 adrenergic receptors and minimal binding at muscarinic cholinergic and histamine H1 receptors, as recorded in the United States label. This is close to a single-target drug, and it is the reason haloperidol serves as the neutral-antagonist reference compound in functional D2 assays for partial agonists such as aripiprazole. The absence of muscarinic affinity is also why haloperidol produces more parkinsonism than an equally potent D2 blocker that happens to be anticholinergic: there is no built-in counterweight in the striatum.',
      structureSource: {
        label: 'PubChem CID 3559 (haloperidol) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3559',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'hal-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Incoming control of the chlorophenylpiperidinol and the fluorobutyrophenone',
          description:
            "Confirm identity and purity of 4-(4-chlorophenyl)-4-piperidinol and of 4-chloro-4'-fluorobutyrophenone before coupling. The tertiary alcohol on the piperidine ring is prone to dehydration under acid, and the dehydrated alkene analogue is a distinct compound rather than a degradation product with the same activity.",
          reagentsAndBuffer:
            "4-(4-chlorophenyl)-4-piperidinol and 4-chloro-4'-fluorobutyrophenone reference standards, reversed-phase HPLC with UV detection, Karl Fischer titration, gas chromatography for residual solvents",
        },
        {
          id: 'hal-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'N-alkylation joining the butyrophenone chain to the piperidinol nitrogen',
          description:
            'React the piperidine nitrogen with the chlorobutyl ketone under base. The three-carbon spacer between the nitrogen and the ketone carbonyl is what defines the butyrophenone class, and the para-fluorine on the aryl ketone is what raises potency over the unsubstituted parent from which the class was discovered.',
          dependsOnStepId: 'hal-w1',
          reagentsAndBuffer:
            'Sodium carbonate or potassium carbonate as base, catalytic potassium iodide, methyl isobutyl ketone or toluene at reflux under nitrogen',
        },
        {
          id: 'hal-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation with an explicit dehydration-product limit',
          description:
            'Recrystallise to specification and set a limit on the dehydrated alkene impurity that forms if the tertiary alcohol is exposed to acid or heat. Crystal form and residual solvent are then confirmed. For an old, cheap, heavily genericised molecule the impurity specification is where product quality actually differs between manufacturers.',
          dependsOnStepId: 'hal-w2',
          reagentsAndBuffer:
            'Ethanol or isopropanol with controlled cooling ramp, powder X-ray diffraction, differential scanning calorimetry, HPLC assay for related substances including the dehydro impurity, headspace gas chromatography for residual solvents',
        },
        {
          id: 'hal-w4',
          stepNumber: 4,
          phase: 'Conjugation',
          name: 'Decanoate esterification and sesame-oil formulation for the long-acting form',
          description:
            'Esterify the tertiary hydroxyl with decanoic acid and dissolve the ester in sesame oil with benzyl alcohol. The ester is inactive until hydrolysed, and release is governed by partition out of the oil depot rather than by any property of the molecule, which is what gives a four-weekly injection from a drug with a roughly daily oral half-life.',
          dependsOnStepId: 'hal-w3',
          reagentsAndBuffer:
            'Decanoyl chloride with base, sesame oil vehicle, benzyl alcohol as preservative, in vitro release testing, LC-MS/MS assay distinguishing intact ester from liberated haloperidol',
        },
        {
          id: 'hal-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'hERG patch clamp reported alongside the D2 binding constant',
          description:
            "Measure hERG potassium current block by patch clamp in parallel with D2 binding. Haloperidol's label reports sudden death, QT prolongation and torsades de pointes, notes that higher-than-recommended amounts and intravenous administration raise that risk, and states that a QTc above 500 msec is associated with increased risk of torsades. For a drug given intravenously to critically ill patients every day worldwide, the cardiac assay is part of the primary characterisation and not a safety appendix.",
          dependsOnStepId: 'hal-w4',
          reagentsAndBuffer:
            'HEK293 cells stably expressing hERG, whole-cell patch clamp at physiological temperature, E-4031 as positive control, membranes expressing human D2 long isoform, [3H]spiperone or [3H]raclopride competition binding, dopamine as displacing reference',
        },
      ],
    },
    keyAudits: [
      {
        id: 'hal-a1',
        category: 'conclusion_shift',
        title: 'The 1967 drug outranked eight of the fourteen newer ones',
        laymanSummary:
          'For twenty years the argument for newer antipsychotics was that they worked better than haloperidol. When 212 trials were pooled and ranked, haloperidol came seventh of fifteen, above quetiapine, aripiprazole, ziprasidone, chlorpromazine, asenapine, sertindole, lurasidone and iloperidone.',
        technicalDetails:
          'In the Leucht multiple-treatments meta-analysis of 212 blinded randomised trials and 43,049 participants, the standardised mean difference against placebo for overall symptom change was 0.45 (95% CrI 0.39 to 0.51) for haloperidol. The full ranking ran clozapine 0.88, amisulpride 0.66, olanzapine 0.59, risperidone 0.56, paliperidone 0.50, zotepine 0.49, haloperidol 0.45, quetiapine 0.44, aripiprazole 0.43, sertindole 0.39, ziprasidone 0.39, chlorpromazine 0.38, asenapine 0.38, lurasidone 0.33, iloperidone 0.33. The authors\' stated interpretation is that antipsychotics differed substantially in side-effects, that small but robust differences were seen in efficacy, and that "our findings challenge the straightforward classification of antipsychotics into first-generation and second-generation groupings." Efficacy outcomes did not change substantially after removal of haloperidol groups, or when dose, withdrawals, blinding, industry sponsorship, study duration, chronicity and publication year were accounted for.',
        evidenceSource: 'Leucht S et al., Lancet 2013;382:951-962',
        doi: '10.1016/S0140-6736(13)60733-3',
        measuredMetric:
          'Standardised mean difference against placebo for overall symptom change, ranked across fifteen drugs',
        auditFlag: 'verified',
      },
      {
        id: 'hal-a2',
        category: 'measured',
        title: 'The worst movement-disorder rate of the fifteen, and the least weight gain',
        laymanSummary:
          'The same analysis that put haloperidol seventh on symptoms put it last on movement side effects, with odds nearly sixteen times those of clozapine, and first on weight, as the drug that puts on the least.',
        technicalDetails:
          'Odds ratios against placebo for extrapyramidal side-effects ranged from 0.30 for the best drug, clozapine, to 4.76 for the worst, haloperidol. Standardised mean differences for weight gain ran from -0.09 for the best drug, haloperidol, to -0.74 for the worst, olanzapine. All-cause discontinuation odds ratios ranged from 0.43 for amisulpride to 0.80 for haloperidol, again the least favourable of the fifteen. Haloperidol therefore holds three extremes of the same dataset: it is the least fattening drug, the most movement-disturbing drug, and the drug people were least likely to stay on. Its label separately states that tardive dyskinesia consists of potentially irreversible involuntary dyskinetic movements, and that prevalence appears highest among the elderly, especially elderly women.',
        evidenceSource:
          'Leucht S et al., Lancet 2013;382:951-962; United States prescribing information for haloperidol tablets, Warnings',
        doi: '10.1016/S0140-6736(13)60733-3',
        measuredMetric:
          'Odds ratio 4.76 for extrapyramidal effects, standardised mean difference -0.09 for weight gain, odds ratio 0.80 for all-cause discontinuation',
        auditFlag: 'verified',
      },
      {
        id: 'hal-a3',
        category: 'failed',
        title: 'It did not shorten delirium in 566 randomised intensive-care patients',
        laymanSummary:
          'Giving haloperidol to critically ill patients with delirium is one of the most common uses of this drug anywhere in medicine. A placebo-controlled trial tested it directly and found no benefit at all.',
        technicalDetails:
          'MIND-USA, registered as NCT01211522 and funded by the National Institutes of Health and the VA Geriatric Research Education and Clinical Center, enrolled 1,183 patients with acute respiratory failure or shock. Delirium developed in 566 (48%), of whom 89% had the hypoactive form. Those 566 were randomised to placebo (184), haloperidol (192) or ziprasidone (190), given as intravenous boluses with the amount halved or doubled at 12-hour intervals according to delirium status and side effects. The primary endpoint, days alive without delirium or coma during the 14-day intervention period, gave a median of 8.5 days (95% CI 5.6 to 9.9) on placebo, 7.9 days (95% CI 4.4 to 9.6) on haloperidol and 8.7 days (95% CI 5.9 to 10.0) on ziprasidone, p=0.26 across groups. The odds ratio against placebo was 0.88 (95% CI 0.64 to 1.21) for haloperidol. There were no significant differences in secondary endpoints or in extrapyramidal symptoms.',
        evidenceSource: 'Girard TD et al., N Engl J Med 2018;379:2506-2516; NCT01211522',
        doi: '10.1056/NEJMoa1808217',
        measuredMetric:
          'Days alive without delirium or coma over 14 days: median 7.9 on haloperidol against 8.5 on placebo, odds ratio 0.88 (95% CI 0.64 to 1.21)',
        auditFlag: 'verified',
      },
      {
        id: 'hal-a4',
        category: 'failed',
        title:
          'A second 1,000-patient trial missed its primary endpoint and found a mortality difference anyway',
        laymanSummary:
          'A Danish-led trial randomised 1,000 intensive-care patients with delirium. The main measure, days alive and out of hospital, did not separate. Ninety-day deaths were 36% on haloperidol against 43% on placebo, a gap whose confidence interval just excluded zero.',
        technicalDetails:
          'AID-ICU, registered as NCT03392376 and funded by Innovation Fund Denmark, randomised 1,000 adult ICU patients with delirium to intravenous haloperidol or placebo, with 987 in the final analyses. The primary outcome, mean days alive and out of hospital at 90 days, was 35.8 (95% CI 32.9 to 38.6) on haloperidol against 32.9 (95% CI 29.9 to 35.8) on placebo, adjusted mean difference 2.9 days (95% CI -1.2 to 7.0), p=0.22. Mortality at 90 days was 36.3% against 43.3%, adjusted absolute difference -6.9 percentage points (95% CI -13.0 to -0.6). Serious adverse reactions occurred in 11 haloperidol patients and 9 placebo patients. This is the difficult shape: a primary endpoint that did not separate alongside a secondary mortality difference whose interval excludes zero by four tenths of a percentage point. The published conclusion states the primary result. Treating the mortality figure as established would be reading a secondary endpoint from a trial whose primary endpoint was negative, which is the specific inferential error this field has made repeatedly.',
        evidenceSource: 'Andersen-Ranberg NC et al., N Engl J Med 2022;387:2425-2435; NCT03392376',
        doi: '10.1056/NEJMoa2211868',
        measuredMetric:
          'Days alive and out of hospital at 90 days: adjusted mean difference 2.9 (95% CI -1.2 to 7.0), p=0.22; 90-day mortality 36.3% against 43.3%',
        auditFlag: 'contested',
      },
      {
        id: 'hal-a5',
        category: 'measured',
        title: 'Both ICU trials used a route the label states in capitals is not approved',
        laymanSummary:
          'Haloperidol is given intravenously in intensive care units everywhere. Its own United States label says, in capital letters, that the injection is not approved for intravenous administration.',
        technicalDetails:
          'The Warnings section of the United States label for haloperidol injection states: "HALOPERIDOL INJECTION IS NOT APPROVED FOR INTRAVENOUS ADMINISTRATION. If haloperidol is administered intravenously, the ECG should be monitored for QTc prolongation and arrhythmias." The approved route recorded in the openFDA product data for haloperidol lactate injection is intramuscular. The same section states that higher-than-recommended amounts of any formulation and intravenous administration appear to be associated with a higher risk of QTc prolongation and torsades de pointes, and that a QTc exceeding 500 msec is associated with increased risk. Both MIND-USA and AID-ICU administered the drug intravenously. This does not invalidate either trial — off-label routes are lawful and often the right clinical choice — but it means the two definitive trials of haloperidol\'s commonest hospital use tested an administration route that carries an explicit label warning, and it means every reader of those trials should know the route was off-label.',
        evidenceSource:
          'United States prescribing information for haloperidol lactate injection, Warnings, Cardiovascular Effects, via the openFDA drug label endpoint; Girard TD et al., N Engl J Med 2018; Andersen-Ranberg NC et al., N Engl J Med 2022',
        doi: '10.1056/NEJMoa1808217',
        measuredMetric:
          'The text of the approved United States label for haloperidol injection, and the administration route used in both randomised ICU trials',
        auditFlag: 'caution',
      },
      {
        id: 'hal-a6',
        category: 'inferred',
        title: 'A paediatric behavioural indication written in the language of 1967',
        laymanSummary:
          'The label still lists haloperidol for severe behaviour problems in children of combative, explosive hyperexcitability. That is not a modern diagnosis, and no boxed warning about dementia mortality existed when it was written.',
        technicalDetails:
          'The Indications section of the United States label for haloperidol tablets reads: "Haloperidol tablets, USP are effective for the treatment of severe behavior problems in children of combative, explosive hyperexcitability (which cannot be accounted for by immediate provocation)." The phrasing describes a behavioural presentation rather than a diagnostic entity, and it has no equivalent in any current diagnostic manual. The indication predates the modern requirement for adequate and well-controlled trials in paediatric populations, predates the boxed warning added in the 2000s, and predates the pooled evidence on tardive dyskinesia risk with prolonged exposure. It remains on the label. An indication that survives on a label is not the same thing as an indication supported by evidence a regulator would accept today.',
        evidenceSource:
          'United States prescribing information for haloperidol tablets, Indications and Usage, via the openFDA drug label endpoint',
        inferredClaim:
          'That every indication on a decades-old label reflects evidence a modern regulator would accept — this one describes a behavioural presentation that no current diagnostic manual contains',
        auditFlag: 'caution',
      },
      {
        id: 'hal-a7',
        category: 'measured',
        title: 'A boxed warning about dementia built largely on trials of other drugs',
        laymanSummary:
          'Haloperidol carries the same boxed warning about deaths in elderly people with dementia that the newer drugs carry. The seventeen trials behind it were largely trials of those newer drugs, not of haloperidol.',
        technicalDetails:
          'The boxed warning states that analyses of seventeen placebo-controlled trials with a modal duration of ten weeks, "largely in patients taking atypical antipsychotic drugs," revealed a risk of death 1.6 to 1.7 times that of placebo, with death in about 4.5% of drug-treated patients against about 2.6% on placebo, most deaths cardiovascular or infectious. It then states that observational studies suggest treatment with conventional antipsychotic drugs may increase mortality similarly, and that the extent to which the observational findings can be attributed to the drug rather than to characteristics of the patients is not clear. The warning is therefore honest about its own basis: randomised evidence for the newer drugs, observational evidence with acknowledged confounding for this one. The label states plainly that haloperidol is not approved for the treatment of patients with dementia-related psychosis.',
        evidenceSource:
          'United States prescribing information for haloperidol tablets, Boxed Warning, via the openFDA drug label endpoint',
        measuredMetric:
          'Death in about 4.5% of drug-treated patients against about 2.6% on placebo across seventeen placebo-controlled dementia trials, largely of atypical antipsychotics',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A tablet, a liquid, an intramuscular injection, or a monthly oil depot',
        laymanDesc:
          'Haloperidol comes as a tablet, an oral solution, a short-acting injection into muscle, and a long-acting version dissolved in sesame oil that lasts about four weeks.',
        molecularDetail:
          'The long-acting form is haloperidol decanoate, an inactive ester dissolved in sesame oil with benzyl alcohol. Release is governed by partition of the ester out of the oil depot and subsequent hydrolysis, not by any property of the parent molecule, which is how a drug with a roughly daily oral rhythm becomes a four-weekly injection.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It crosses into the brain and reaches the striatum in force',
        laymanDesc:
          'The drug enters the brain readily and concentrates where dopamine signalling is densest, which is both where the psychotic symptoms are addressed and where the movement problems begin.',
        molecularDetail:
          'Haloperidol reaches striatal D2 occupancy well above the 65 to 80 per cent window in which antipsychotic effect appears without extrapyramidal effect, and at usual clinical amounts it commonly exceeds the upper end of that window. Clearance is hepatic, predominantly by glucuronidation with contributions from CYP3A4 and CYP2D6.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It blocks the dopamine D2 receptor and very little else',
        laymanDesc:
          'It sits on the dopamine receptor and switches it off. Unlike almost every newer drug in this class it does not also block histamine or acetylcholine receptors, so it does not cause the sedation, weight gain and dry mouth those receptors produce.',
        molecularDetail:
          'High-affinity D2 antagonism with lower-affinity alpha-1 adrenergic binding and minimal muscarinic and H1 binding, per the label. This near-selectivity is why haloperidol serves as the neutral-antagonist reference compound in functional assays that characterise partial agonists such as aripiprazole: it defines what switching the receptor fully off looks like.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The same blockade disables the movement circuit',
        laymanDesc:
          'The dopamine circuit that carries psychotic symptoms is the same circuit that starts, stops and smooths out movement. Blocking it hard produces stiffness, tremor, an inability to sit still, and in some people permanent involuntary movements.',
        molecularDetail:
          'Nigrostriatal D2 blockade without anticholinergic counterweight produces parkinsonism, akathisia and acute dystonia, and with prolonged exposure the postsynaptic supersensitivity implicated in tardive dyskinesia. The pooled odds ratio for extrapyramidal effects against placebo was 4.76, the least favourable of the fifteen drugs ranked, against 0.30 for clozapine. The label describes the tardive syndrome as potentially irreversible and most prevalent among the elderly, especially elderly women.',
        iconName: 'AlertTriangle',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Psychosis lifts, movement suffers, delirium does not respond',
        laymanDesc:
          'On symptom scales haloperidol performs better than eight newer drugs. Movement side effects are the worst in the class. In critically ill patients with delirium, two large trials found it did not help.',
        molecularDetail:
          'Standardised mean difference against placebo of 0.45 (95% CrI 0.39 to 0.51) for overall symptom change, seventh of fifteen. Extrapyramidal odds ratio 4.76, weight gain -0.09, all-cause discontinuation odds ratio 0.80. In MIND-USA the odds ratio against placebo for days alive without delirium or coma was 0.88 (95% CI 0.64 to 1.21); in AID-ICU the adjusted difference in days alive and out of hospital at 90 days was 2.9 (95% CI -1.2 to 7.0).',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'NCT01211522 (MIND-USA)',
        phase: 'Randomised double-blind placebo-controlled trial, 14-day intervention period',
        sampleSize: 566,
        primaryEndpoint:
          'Days alive without delirium or coma during the 14-day intervention period, in ICU patients with acute respiratory failure or shock and hypoactive or hyperactive delirium',
        endpointMet: false,
        statisticalPValue:
          'Median 7.9 days (95% CI 4.4 to 9.6) on haloperidol, 8.7 (95% CI 5.9 to 10.0) on ziprasidone and 8.5 (95% CI 5.6 to 9.9) on placebo, p=0.26 across groups; haloperidol odds ratio against placebo 0.88 (95% CI 0.64 to 1.21)',
        unreportedAdverseSignals:
          '89% of the delirium in this trial was hypoactive rather than the agitated form clinicians most often reach for haloperidol to treat. No significant differences appeared in any secondary endpoint or in extrapyramidal symptoms. The trial was publicly funded.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'NCT03392376 (AID-ICU)',
        phase: 'Multicentre blinded placebo-controlled randomised trial, 90-day follow-up',
        sampleSize: 1000,
        primaryEndpoint:
          'Number of days alive and out of hospital at 90 days after randomisation, in adult ICU patients with delirium',
        endpointMet: false,
        statisticalPValue:
          '35.8 days (95% CI 32.9 to 38.6) on haloperidol against 32.9 (95% CI 29.9 to 35.8) on placebo; adjusted mean difference 2.9 days (95% CI -1.2 to 7.0), p=0.22',
        unreportedAdverseSignals:
          'Ninety-day mortality was 36.3% against 43.3%, adjusted absolute difference -6.9 percentage points (95% CI -13.0 to -0.6). That is a secondary endpoint from a trial whose primary endpoint was negative, and it should be read as a signal to be tested rather than a result established.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Leucht 15-drug multiple-treatments meta-analysis',
        phase: 'Bayesian network meta-analysis of 212 blinded randomised trials',
        sampleSize: 43049,
        primaryEndpoint:
          'Mean overall change in symptoms against placebo in acute schizophrenia, with all-cause discontinuation, weight gain, extrapyramidal effects, prolactin, QTc and sedation as secondary outcomes',
        endpointMet: true,
        statisticalPValue:
          'Haloperidol standardised mean difference 0.45 (95% CrI 0.39 to 0.51), seventh of fifteen; extrapyramidal odds ratio 4.76, the least favourable of the fifteen; weight gain -0.09, the most favourable',
        unreportedAdverseSignals:
          'Efficacy outcomes did not change substantially after removal of haloperidol groups, which addresses the standing objection that haloperidol comparator arms were run at amounts chosen to make newer drugs look better.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'NCT00014001 (CATIE, phase 1)',
        phase: 'Phase 4 double-blind randomised effectiveness trial, up to 18 months',
        sampleSize: 1493,
        primaryEndpoint:
          'Time to discontinuation of assigned antipsychotic for any cause in chronic schizophrenia, with the first-generation drug perphenazine as comparator',
        endpointMet: false,
        statisticalPValue:
          '74% of all patients discontinued before 18 months; the efficacy of perphenazine appeared similar to that of quetiapine, risperidone and ziprasidone',
        unreportedAdverseSignals:
          'CATIE used perphenazine rather than haloperidol as its first-generation arm, specifically to avoid the movement-disorder burden that would have unblinded the comparison. The finding that a first-generation drug matched three second-generation ones is the independent counterpart to the meta-analytic ranking.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A standardised mean difference of 0.45 against placebo for overall symptom change, seventh of fifteen ranked antipsychotics and above eight newer drugs',
        'An odds ratio of 4.76 for extrapyramidal side-effects, the least favourable of the fifteen, against 0.30 for clozapine',
        'A standardised mean difference of -0.09 for weight gain, the most favourable of the fifteen',
        'No effect on days alive without delirium or coma in 566 randomised ICU patients, odds ratio 0.88 (95% CI 0.64 to 1.21)',
        'No significant effect on days alive and out of hospital at 90 days in 1,000 randomised ICU patients, adjusted difference 2.9 days (95% CI -1.2 to 7.0)',
      ],
      unsupportedInferences: [
        'That newer antipsychotics are more effective than haloperidol — the pooled ranking places it above eight of the fourteen it was compared against',
        'That haloperidol shortens delirium in critical illness — two large placebo-controlled trials measured that directly and neither found it',
        'That AID-ICU established a mortality benefit — that is a secondary endpoint in a trial whose primary endpoint did not separate',
        'That every indication on the label reflects evidence a modern regulator would accept — the paediatric behavioural indication describes a presentation no current diagnostic manual contains',
      ],
      whatFailedInitially: [
        'MIND-USA, 566 randomised patients, found no effect on delirium duration and none on any secondary endpoint',
        'AID-ICU, 1,000 randomised patients, missed its primary endpoint at p=0.22',
        'Haloperidol had the least favourable all-cause discontinuation of the fifteen drugs ranked, at an odds ratio of 0.80',
      ],
      realWorldOutcome: [
        'About sixteen cents a tablet at United States pharmacy acquisition cost, across 107 listed generic products',
        'The reference comparator for almost every antipsychotic licensed since 1990, and the neutral-antagonist reference in the laboratory assays that define partial agonism',
        'The most widely used drug for agitation and delirium in hospitals worldwide, by a route its own label states in capital letters is not approved',
        'A four-weekly decanoate injection in sesame oil that remains among the cheapest long-acting antipsychotics available anywhere',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, oral concentrate solution, short-acting intramuscular injection of the lactate salt, and long-acting intramuscular decanoate injection in sesame oil given about every four weeks',
      description:
        'The approved route for the injection recorded in the openFDA product data is intramuscular. The Warnings section states in capital letters that haloperidol injection is not approved for intravenous administration and directs electrocardiographic monitoring for QTc prolongation and arrhythmias if it is given that way. The decanoate depot is an inactive ester in sesame oil with benzyl alcohol; release depends on partition out of the oil and subsequent hydrolysis.',
      safetyProfile:
        'The United States label carries a boxed warning for increased mortality in elderly patients with dementia-related psychosis, and states that haloperidol is not approved for that use. The Warnings section records sudden death, QT prolongation and torsades de pointes, with higher risk at higher-than-recommended amounts and with intravenous administration, and notes that a QTc exceeding 500 msec is associated with increased torsades risk. Tardive dyskinesia is described as potentially irreversible with prevalence highest among the elderly, especially elderly women. Neuroleptic malignant syndrome, parkinsonism, akathisia, acute dystonia, hyperprolactinaemia, orthostatic hypotension and seizures are all in the label. Weight gain and metabolic disturbance are the least of any drug in the fifteen-drug comparison.',
    },
    commonQuestions: [
      {
        q: 'Is an old drug like this worse than the modern ones?',
        a: "Not on symptom control. Across 212 blinded trials and 43,049 patients, haloperidol's standardised mean difference against placebo was 0.45, seventh of fifteen, above quetiapine at 0.44, aripiprazole at 0.43, ziprasidone at 0.39, chlorpromazine at 0.38, asenapine at 0.38, lurasidone at 0.33 and iloperidone at 0.33. The authors concluded that their findings challenge the straightforward classification of antipsychotics into first- and second-generation groupings. Where haloperidol genuinely is worse is movement: it had the highest extrapyramidal odds ratio of the fifteen at 4.76 and the least favourable all-cause discontinuation at 0.80. Where it is genuinely better is weight, on which it was the most favourable drug in the set.",
        auditNote:
          'The analysis specifically re-ran its efficacy results with haloperidol arms removed, to test the objection that haloperidol comparators were handicapped. The results did not change substantially.',
      },
      {
        q: 'Does it work for delirium in hospital?',
        a: 'Two large placebo-controlled trials asked exactly that and neither found a benefit on its primary measure. MIND-USA randomised 566 ICU patients with delirium and found a median of 7.9 days alive without delirium or coma on haloperidol against 8.5 on placebo, odds ratio 0.88 with a confidence interval from 0.64 to 1.21. AID-ICU randomised 1,000 ICU patients and found 35.8 against 32.9 days alive and out of hospital at 90 days, an adjusted difference of 2.9 days with a confidence interval from -1.2 to 7.0 and p=0.22. AID-ICU also reported 90-day mortality of 36.3% against 43.3%, a difference whose interval just excluded zero — but that is a secondary endpoint in a trial whose primary endpoint was negative, and reading it as established is the specific error this field keeps making.',
        auditNote:
          'Both trials gave the drug intravenously, which the United States label states in capital letters is not an approved route.',
      },
      {
        q: 'What is tardive dyskinesia and how likely is it?',
        a: 'It is a syndrome of involuntary movements — most often of the tongue, lips, jaw and face — that the label describes as potentially irreversible, and that can appear during treatment or after it is stopped. The label states its prevalence appears highest among the elderly, especially elderly women, and gives no single overall rate. Haloperidol carries the highest extrapyramidal odds ratio of the fifteen drugs ranked head to head, at 4.76 against placebo, where clozapine sits at 0.30. There is no test that predicts who will develop it, which is why it is found by looking rather than by screening, and why noticing new movements early is the only thing that changes the course.',
      },
      {
        q: 'Why is it given into a vein when the label says not to?',
        a: 'Because in an intensive care unit an intravenous line is already in place, absorption from muscle is unreliable in a shocked patient, and the effect is needed quickly. Those are real clinical reasons and prescribing off-label is lawful. What the label says is nonetheless worth knowing: it states in capital letters that haloperidol injection is not approved for intravenous administration, and that if it is given that way the electrocardiogram should be monitored for QTc prolongation and arrhythmias. The same section records that intravenous administration appears to carry a higher risk of QT prolongation and torsades de pointes than the approved route. Both major randomised trials of this use gave it intravenously.',
      },
      {
        q: 'Why does this page show a price but no manufacturing cost?',
        a: 'Because no verifiable per-dose cost of production for haloperidol could be found and cited. The figure quoted comes from the CMS National Average Drug Acquisition Cost survey, which records what United States pharmacies pay to acquire a drug. That is a price, not a cost of manufacture. Haloperidol is a single alkylation between two purchased fragments followed by a crystallisation, which is about as simple as a psychiatric drug synthesis gets and is consistent with 107 generic manufacturers listing it at sixteen cents, but a description of a route is not a cost figure.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Leucht S et al. Comparative efficacy and tolerability of 15 antipsychotic drugs in schizophrenia: a multiple-treatments meta-analysis. Lancet 2013;382:951-962',
        identifier: '10.1016/S0140-6736(13)60733-3',
        kind: 'doi',
      },
      {
        label:
          'Girard TD et al. Haloperidol and Ziprasidone for Treatment of Delirium in Critical Illness (MIND-USA). N Engl J Med 2018;379:2506-2516',
        identifier: '10.1056/NEJMoa1808217',
        kind: 'doi',
      },
      {
        label:
          'Andersen-Ranberg NC et al. Haloperidol for the Treatment of Delirium in ICU Patients (AID-ICU). N Engl J Med 2022;387:2425-2435',
        identifier: '10.1056/NEJMoa2211868',
        kind: 'doi',
      },
      {
        label:
          'Lieberman JA et al. Effectiveness of antipsychotic drugs in patients with chronic schizophrenia (CATIE). N Engl J Med 2005;353:1209-1223',
        identifier: '10.1056/NEJMoa051688',
        kind: 'doi',
      },
      {
        label: 'NCT01211522 — MIND-USA, Modifying the Incidence of Neurologic Dysfunction',
        identifier: 'NCT01211522',
        kind: 'nct',
      },
      {
        label: 'NCT03392376 — AID-ICU, Agents Intervening against Delirium in the ICU',
        identifier: 'NCT03392376',
        kind: 'nct',
      },
      {
        label:
          'United States prescribing information for haloperidol tablets — Boxed Warning, Indications and Usage, and Warnings (Cardiovascular Effects, Tardive Dyskinesia) — via the openFDA drug label endpoint',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22haloperidol%22',
        kind: 'regulatory',
      },
      {
        label:
          'United States prescribing information for haloperidol lactate injection, Warnings, stating that the injection is not approved for intravenous administration',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22haloperidol+lactate%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 3559 — haloperidol structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3559',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 9. Lithium carbonate — an element, not a designed molecule, whose label states after seventy
  //    years that nobody knows how it works, and whose best-known claim failed its trial.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'lithium-carbonate',
    name: 'Lithium Carbonate',
    tradeName: 'Lithobid',
    sponsor:
      'No originator in the modern sense. Lithium is a naturally occurring element and lithium carbonate was never patentable as a composition of matter; the extended-release brands Eskalith, Lithobid, Lithonate and Lithane were formulation products, and the United States market is now 41 listed generic products',
    targetGene: 'None established',
    targetProtein:
      'None established. Section 12.1 of the United States prescribing information reads, in full: "The mechanism of action of lithium as a mood stabilizing agent is unknown." Inhibition of glycogen synthase kinase-3 beta and of inositol monophosphatase are the two most-cited hypotheses, and both remain hypotheses; neither appears in the approved label as a mechanism.',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1970,
    indication:
      'Treatment of manic episodes of bipolar disorder, and maintenance treatment for individuals with a diagnosis of bipolar disorder, where the label states maintenance therapy reduces the frequency of manic episodes and diminishes the intensity of those which occur',
    patientFriendlyIndication:
      'The manic phase of bipolar disorder, and long-term prevention of further episodes',
    anatomicalSite:
      'No identified site of action. Lithium distributes through total body water as a small cation and takes up to 24 hours to reach brain tissue; the kidney, thyroid and parathyroid are where its long-term effects are measured.',
    conditionContext: {
      conditionExplainer:
        'Lithium is the third element in the periodic table. It is not a designed molecule, it has no receptor, and no company invented it. It has been used in psychiatry since 1949 and approved in the United States since 1970, and its label still states that the mechanism of action is unknown.',
      whyItMatters:
        'That combination is unusual and worth sitting with. A drug can be genuinely effective and completely unexplained at the same time, and lithium is the clearest example in medicine. It also means every mechanistic story told about lithium — glycogen synthase kinase-3, inositol depletion, neuroprotection — is a hypothesis being applied backwards to an effect that was found by observation.',
      whoTakesThis:
        'People with bipolar disorder, for acute mania and for long-term prevention. It is also used to augment antidepressants in resistant depression, which is not an approved indication in the United States.',
      clinicalGoals:
        "The trials that matter here measured time to a new mood episode requiring intervention over two years, and time to a repeated suicide-related event. Both are hard outcomes rather than rating-scale changes, which makes lithium's evidence base structurally different from every other drug on this page.",
    },
    oneSentenceVerdict:
      'An element with no known mechanism, no receptor and no patent, which beat valproate on preventing relapse in bipolar I disorder over two years (hazard ratio 0.71, 95% CI 0.51 to 1.00) and then failed its own suicide-prevention trial, stopped for futility after 519 veterans with a hazard ratio of 1.10 (95% CI 0.77 to 1.55), while carrying a boxed warning because the toxic blood concentration begins at 1.5 mEq/L and the therapeutic range ends at 1.2.',
    laymanHowItWorks:
      'Nobody knows. That is not a simplification for a general reader — it is what the approved label says in the mechanism section. Lithium is a small positively charged atom, close in size to sodium and potassium, and it spreads through the water in the body and eventually into the brain. Two ideas dominate the research literature: that it blocks an enzyme called glycogen synthase kinase-3, and that it depletes a signalling molecule called inositol. Neither has been established well enough to appear in the label. What is established is that it works, that the amount that works is close to the amount that poisons, and that the difference between the two is measured with a blood test.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 63,
    substitutes: {
      summary:
        'Lithium carbonate costs about nineteen cents a tablet at United States pharmacy acquisition cost. Its competition in bipolar maintenance is valproate, which lost to it in the only large randomised head-to-head trial, and the second-generation antipsychotics, which carry maintenance indications built on shorter trials and different endpoints. Lithium is the only one of them that requires a blood test to use safely, and the only one with a randomised trial measuring an outcome as hard as a repeated suicide attempt.',
      conventionalRx: [
        {
          name: 'Valproate semisodium (Depakote)',
          class: 'Anticonvulsant used as a mood stabiliser',
          howItCompares:
            'The direct comparator in BALANCE, an open-label randomised trial of 330 patients with bipolar I disorder followed for up to two years. A primary outcome event — a new intervention for an emergent mood episode — occurred in 69% of the valproate group against 59% of the lithium group, hazard ratio 0.71 for lithium against valproate (95% CI 0.51 to 1.00, p=0.0472).',
          typicalCost:
            'Generic divalproex sodium is widely listed in the CMS National Average Drug Acquisition Cost survey; the current per-tablet figure for that molecule is published in the same dataset cited on this page',
          prosAndCons:
            'Pros: no blood-level monitoring of the same criticality, no lithium toxicity. Cons: it lost the head-to-head relapse-prevention comparison, and it is teratogenic to a degree that restricts its use in anyone who could become pregnant.',
        },
        {
          name: 'Quetiapine (Seroquel)',
          class:
            'Second-generation antipsychotic with bipolar depression and maintenance indications',
          howItCompares:
            'The drug most often reached for instead of lithium, and the only other agent with a monotherapy indication covering both phases of bipolar disorder. Its bipolar evidence is built on six-to-eight-week rating-scale trials rather than two-year relapse trials, and it carries the metabolic and sedation burden lithium does not.',
          typicalCost:
            'US$0.0876 per tablet at pharmacy acquisition cost, median across listed generic products (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: no serum monitoring requirement, no renal or thyroid consequence. Cons: an evidence base of shorter trials and softer endpoints, and substantial weight gain and sedation.',
        },
        {
          name: 'Lamotrigine',
          class: 'Anticonvulsant with a bipolar maintenance indication',
          howItCompares:
            "The alternative when the depressive pole dominates. Lithium's strongest evidence is against mania and relapse generally; lamotrigine's indication is for delaying mood episodes with a signal weighted toward depression. Neither has been shown superior to the other on a hard outcome in a large randomised comparison.",
          typicalCost:
            'Generic lamotrigine is widely listed in the CMS National Average Drug Acquisition Cost survey cited on this page',
          prosAndCons:
            'Pros: no serum monitoring, no renal or thyroid burden, better tolerated. Cons: a serious rash risk requiring slow introduction, and no established effect on mania.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Keep fluid and salt intake steady, and say so if you become ill',
          action:
            'The label lists dehydration, volume depletion, changes in sodium concentration and a recent febrile illness among the factors that increase the risk of lithium toxicity.',
          patientImpact:
            'Lithium is handled by the kidney in the same way sodium is. Anything that makes the body conserve sodium — vomiting, diarrhoea, fever, heavy sweating, a low-salt diet — makes it conserve lithium too, and the blood concentration rises without the amount taken changing at all.',
          clinicalPrecaution:
            'This is a reason to contact a prescriber during an illness, not a reason to alter anything independently. The label states there is no specific antidote for lithium poisoning.',
        },
        {
          name: 'Check before taking ibuprofen or any new medicine',
          action:
            'The label identifies concomitant drugs that raise lithium concentrations or affect kidney function as a distinct risk factor for toxicity.',
          patientImpact:
            'Non-steroidal anti-inflammatory drugs, ACE inhibitors, angiotensin receptor blockers and thiazide diuretics all reduce lithium clearance. Several of them are available without prescription or are started for an unrelated reason by a different clinician.',
          clinicalPrecaution:
            'The interaction is with the kidney, not with the brain, which is why it is easy for it to be missed by a prescriber who is not thinking about psychiatry.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: '[Li+].[Li+].C(=O)([O-])[O-]',
      chemicalFormula: 'CLi2O3',
      molecularWeight: '73.90 g/mol',
      targetReceptorAffinity:
        'None. Lithium carbonate dissociates in the stomach and what circulates is the lithium cation, an ion with an ionic radius close to that of sodium and magnesium. It has no receptor, no binding constant and no dose-response curve of the kind every other drug on this page has. The label states the mechanism of action as a mood stabilising agent is unknown. Its concentration in blood, not its occupancy of a target, is the quantity that governs both its effect and its toxicity.',
      structureSource: {
        label: 'PubChem CID 11125 (lithium carbonate) — molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/11125',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'lit-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Assay of the mineral or brine feedstock for heavy metals and alkali impurities',
          description:
            'Establish the elemental profile of the spodumene concentrate or continental brine before any conversion step. This is the one drug on this page whose starting material is dug or pumped out of the ground, and the impurities that matter are other elements — sodium, potassium, calcium, magnesium, and heavy metals — rather than organic side products. A pharmaceutical-grade specification is a purity specification on an element.',
          reagentsAndBuffer:
            'Inductively coupled plasma mass spectrometry for elemental impurities, flame photometry for alkali metals, certified lithium carbonate reference standard, USP elemental impurity limits',
        },
        {
          id: 'lit-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Conversion of the mineral or brine to soluble lithium salt',
          description:
            'Roast and acid-leach spodumene to lithium sulfate, or evaporate and treat brine to concentrate lithium chloride. No carbon-carbon bond is formed anywhere in the manufacture of this medicine: what is called synthesis here is separating one element from the others it was deposited with.',
          dependsOnStepId: 'lit-w1',
          reagentsAndBuffer:
            'Sulfuric acid for the spodumene route with roasting above 1,000 degrees Celsius to convert alpha to beta phase, or staged solar evaporation and liming for the brine route, with soda ash and lime for magnesium and calcium removal',
        },
        {
          id: 'lit-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Carbonate precipitation and recrystallisation to pharmaceutical grade',
          description:
            'Precipitate lithium carbonate with sodium carbonate and recrystallise, exploiting the fact that lithium carbonate is unusual among carbonates in becoming less soluble as the solution is heated. Purity is then confirmed elementally rather than chromatographically, because there is nothing organic to chromatograph.',
          dependsOnStepId: 'lit-w2',
          reagentsAndBuffer:
            'Sodium carbonate solution, hot-water recrystallisation exploiting retrograde solubility, ion exchange for residual sodium and potassium, inductively coupled plasma mass spectrometry for release testing',
        },
        {
          id: 'lit-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Establishment of the serum concentration window before any efficacy claim',
          description:
            'Determine the serum concentration reached and its time course, because for lithium the serum concentration is the drug. The label states the toxic concentration begins at 1.5 mEq/L and the therapeutic range runs 0.8 to 1.2 mEq/L, that some patients show toxic signs within the therapeutic range, and that lithium may take up to 24 hours to distribute into brain tissue so acute toxicity can be delayed.',
          dependsOnStepId: 'lit-w3',
          reagentsAndBuffer:
            'Serum collected in lithium-free tubes, ion-selective electrode or flame atomic absorption assay, timed sampling relative to the last dose, creatinine and estimated glomerular filtration rate measured alongside, thyroid stimulating hormone and serum calcium at baseline',
        },
        {
          id: 'lit-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Longitudinal renal, thyroid and parathyroid monitoring as the real endpoint set',
          description:
            'Track kidney function, thyroid function and serum calcium over years rather than weeks. The label names lithium-induced chronic kidney disease with structural changes, hypothyroidism and hyperthyroidism, and hypercalcaemia and hyperparathyroidism as consequences of long-term use, each with an instruction to monitor. For a drug taken for decades these measurements are not safety monitoring bolted onto the side; they are the quantities that decide whether the drug can be continued.',
          dependsOnStepId: 'lit-w4',
          reagentsAndBuffer:
            'Serial serum creatinine with estimated glomerular filtration rate, urine osmolality for concentrating defect, thyroid stimulating hormone and free thyroxine, serum calcium and parathyroid hormone, electrocardiogram where Brugada syndrome is suspected',
        },
      ],
    },
    keyAudits: [
      {
        id: 'lit-a1',
        category: 'failed',
        title: 'The suicide-prevention trial was stopped for futility',
        laymanSummary:
          "Lithium's most repeated claim is that it prevents suicide. A randomised placebo-controlled trial in 519 veterans who had recently survived a suicide-related event was stopped early because it was not going to show a benefit.",
        technicalDetails:
          "The Li+ plus trial, registered as NCT01928446 and run across 29 Department of Veterans Affairs medical centres, randomised veterans with bipolar disorder or major depression who had had an episode of suicidal behaviour or an admission to prevent suicide within six months. Participants received extended-release lithium carbonate or placebo added to usual care. The trial was stopped for futility after 519 randomisations, 255 to lithium and 264 to placebo. The primary outcome, time to the first repeated suicide-related event, gave a hazard ratio of 1.10 (95% CI 0.77 to 1.55). A total of 127 participants (24.5%) had a suicide-related outcome: 65 on lithium and 62 on placebo. One death occurred in the lithium group and three in the placebo group. Mean lithium concentrations at three months were 0.54 mEq/L in the bipolar group and 0.46 mEq/L in the depression group, which sit below the 0.8 to 1.2 mEq/L therapeutic range the label states, and that is a real limitation on how far the null result generalises. The authors' conclusion is that simply adding lithium to existing regimens is unlikely to be effective for preventing a broad range of suicide-related events in patients already being treated for mood disorders and substantial comorbidities.",
        evidenceSource: 'Katz IR et al., JAMA Psychiatry 2022;79:24-32; NCT01928446',
        doi: '10.1001/jamapsychiatry.2021.3170',
        measuredMetric:
          'Hazard ratio for time to first repeated suicide-related event: 1.10 (95% CI 0.77 to 1.55), trial stopped for futility',
        auditFlag: 'verified',
      },
      {
        id: 'lit-a2',
        category: 'measured',
        title: 'It beat valproate on relapse prevention over two years',
        laymanSummary:
          'An open-label trial randomised 330 people with bipolar I disorder to lithium, valproate or both, and followed them for up to two years. Lithium alone did better than valproate alone on the number of people needing treatment for a new episode.',
        technicalDetails:
          'BALANCE, registered as ISRCTN 55261332 and funded by the Stanley Medical Research Institute and Sanofi-Aventis, randomised 330 patients aged 16 and over at 41 sites in the United Kingdom, France, the United States and Italy, after a four-to-eight-week run-in on the combination. A primary outcome event — initiation of a new intervention for an emergent mood episode — occurred in 59 of 110 (54%) on combination therapy, 65 of 110 (59%) on lithium and 76 of 110 (69%) on valproate. Hazard ratios were 0.59 (95% CI 0.42 to 0.83, p=0.0023) for combination against valproate, 0.71 (95% CI 0.51 to 1.00, p=0.0472) for lithium against valproate, and 0.82 (95% CI 0.58 to 1.17, p=0.27) for combination against lithium. The trial was open-label: investigators and participants knew the allocation, and only the outcome-adjudicating trial management team was masked. The authors state the trial could neither reliably confirm nor refute a benefit of combination therapy over lithium alone.',
        evidenceSource: 'BALANCE investigators; Geddes JR et al., Lancet 2010;375:385-395',
        doi: '10.1016/S0140-6736(09)61828-6',
        measuredMetric:
          'Hazard ratio 0.71 (95% CI 0.51 to 1.00, p=0.0472) for lithium against valproate for a new intervention for an emergent mood episode over up to 24 months',
        auditFlag: 'verified',
      },
      {
        id: 'lit-a3',
        category: 'conclusion_shift',
        title: 'Seventy years in, the label still says the mechanism is unknown',
        laymanSummary:
          'Section 12.1 of the United States prescribing information consists of one sentence: the mechanism of action of lithium as a mood stabilising agent is unknown.',
        technicalDetails:
          'That single sentence is the entire mechanism section of the approved label, for a drug in continuous psychiatric use since 1949 and approved in the United States in 1970. The research literature has proposed inhibition of glycogen synthase kinase-3 beta, depletion of inositol through inhibition of inositol monophosphatase, effects on circadian genes and neuroprotective effects on grey matter volume. None of them has met the standard required to appear in the label as a mechanism. This is worth reading in both directions. It is a genuine and unusual admission of ignorance in a regulatory document. It is also a warning about every mechanistic account of a psychiatric drug: the mechanism sections of the other labels on this page are also hedged, and several of them say the mechanism "is unclear" and then offer a proposal. Lithium is the one that does not offer a proposal.',
        evidenceSource:
          'United States prescribing information for lithium carbonate, section 12.1, via the openFDA drug label endpoint',
        inferredClaim:
          'That lithium works by inhibiting glycogen synthase kinase-3 or by depleting inositol — both are research hypotheses and neither appears in the approved label',
        auditFlag: 'verified',
      },
      {
        id: 'lit-a4',
        category: 'measured',
        title: 'The toxic concentration starts at 1.5 mEq/L and the therapeutic range ends at 1.2',
        laymanSummary:
          'The blood level that helps and the blood level that poisons are separated by three tenths of a unit. The label carries a boxed warning saying so, and adds that some people show toxic signs while still inside the therapeutic range.',
        technicalDetails:
          'The boxed warning states that lithium toxicity is closely related to serum lithium concentrations and can occur at doses close to therapeutic concentrations, and that facilities for prompt and accurate serum lithium determinations should be available before starting treatment. Section 5.1 states that toxic concentrations are at or above 1.5 mEq/L against a therapeutic range of 0.8 to 1.2 mEq/L, and that some patients abnormally sensitive to lithium may show toxic signs at concentrations considered within the therapeutic range. It also records that lithium may take up to 24 hours to distribute into brain tissue, so acute toxicity may be delayed. Toxicity runs from fine tremor and unsteadiness through confusion, seizure, coma and death, with neurological sequelae that may persist after stopping and may be associated with cerebellar atrophy; cardiac manifestations include QT prolongation and myocarditis; renal manifestations include nephrogenic diabetes insipidus and renal failure. The label states that no specific antidote for lithium poisoning is known. Risk is raised by febrile illness, dehydration, volume depletion, sodium changes, impaired renal function, significant cardiovascular disease, and drugs that raise lithium concentrations or affect kidney function.',
        evidenceSource:
          'United States prescribing information for lithium carbonate, Boxed Warning and sections 5.1 and 10, via the openFDA drug label endpoint',
        measuredMetric:
          'Serum lithium concentration: therapeutic 0.8 to 1.2 mEq/L, toxic at or above 1.5 mEq/L',
        auditFlag: 'verified',
      },
      {
        id: 'lit-a5',
        category: 'measured',
        title: 'Three endocrine and renal consequences, each with its own monitoring instruction',
        laymanSummary:
          'Long-term lithium can damage the kidneys, disturb the thyroid in either direction, and raise calcium through the parathyroid glands. The label names all three and tells prescribers to monitor for each.',
        technicalDetails:
          'The Warnings and Precautions summary lists lithium-induced chronic kidney disease, stated to be associated with structural changes in patients on chronic lithium therapy, with an instruction to monitor kidney function; hypothyroidism and hyperthyroidism, with an instruction to monitor thyroid function regularly; and hypercalcaemia and hyperparathyroidism, stated to be associated with long-term lithium use, with an instruction to monitor serum calcium. It separately lists an encephalopathic syndrome with increased risk in patients treated with lithium together with an antipsychotic, and directs routine monitoring for changes in cognitive function — which matters because combining lithium with an antipsychotic is one of the commonest regimens in bipolar disorder. These are not rare idiosyncratic reactions. They are the expected long-term cost of a drug that people take for decades, and each one is detected by a blood test that is cheap and frequently not ordered.',
        evidenceSource:
          'United States prescribing information for lithium carbonate, sections 5.4, 5.5, 5.7 and 5.8, via the openFDA drug label endpoint',
        measuredMetric:
          'Named long-term consequences with monitoring instructions: chronic kidney disease with structural changes, thyroid dysfunction in both directions, hypercalcaemia and hyperparathyroidism',
        auditFlag: 'verified',
      },
      {
        id: 'lit-a6',
        category: 'inferred',
        title: 'The reputation as the gold standard outruns the randomised evidence behind it',
        laymanSummary:
          'Lithium is described almost universally as the gold-standard mood stabiliser. The randomised evidence for that consists largely of one open-label two-year trial in 330 people, and the specific claim most often attached to it failed its own trial.',
        technicalDetails:
          'BALANCE is the largest randomised comparison of lithium against an active alternative for relapse prevention in bipolar I disorder, and it enrolled 330 people, was open-label, and produced a hazard ratio against valproate of 0.71 with an upper confidence limit of exactly 1.00 and p=0.0472. That is a positive result at the margin of significance in an unblinded trial. The suicide-prevention claim, which is the one most often used to argue lithium is unique, comes from observational studies and meta-analyses of small trials, and the one adequately powered randomised test of it was stopped for futility with a hazard ratio of 1.10. None of this makes lithium a bad drug: it beat its comparator on a hard two-year endpoint, which most drugs on this page have never been asked to do. It does mean the gap between the strength of the reputation and the strength of the trial evidence is unusually wide, and that a reader should know the size and design of BALANCE before repeating the phrase.',
        evidenceSource:
          'Geddes JR et al., Lancet 2010;375:385-395; Katz IR et al., JAMA Psychiatry 2022;79:24-32',
        doi: '10.1016/S0140-6736(09)61828-6',
        inferredClaim:
          'That lithium is established as superior to the alternatives across bipolar disorder — the randomised head-to-head evidence is one open-label trial of 330 patients against a single comparator',
        auditFlag: 'caution',
      },
      {
        id: 'lit-a7',
        category: 'measured',
        title: 'It can unmask a cardiac syndrome that causes sudden death',
        laymanSummary:
          'Post-marketing reports link lithium to unmasking Brugada syndrome, an inherited electrical abnormality of the heart that carries a risk of sudden death. The label says lithium should be avoided in anyone who has it or is suspected of having it.',
        technicalDetails:
          'The label records post-marketing reports of a possible association between lithium treatment and the unmasking of Brugada syndrome, describes the syndrome as characterised by abnormal electrocardiographic findings and a risk of sudden death, and states that lithium should be avoided in patients with Brugada syndrome or suspected of having it. It recommends cardiology consultation where lithium is under consideration in someone suspected of having it or carrying risk factors — unexplained syncope, a family history of Brugada syndrome, or a family history of sudden unexplained death before age 45 — and in patients who develop unexplained syncope or palpitations on treatment. The practical significance is that the risk factors are questions a prescriber has to think to ask, since none of them appears in a routine psychiatric history.',
        evidenceSource:
          'United States prescribing information for lithium carbonate, Warnings and Precautions (Unmasking of Brugada Syndrome), via the openFDA drug label endpoint',
        measuredMetric:
          'Post-marketing reports of Brugada syndrome unmasking during lithium treatment',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A tablet of a mineral salt, taken daily for years or decades',
        laymanDesc:
          'Lithium carbonate is a salt made from an element mined out of rock or pumped from brine. It comes as an ordinary tablet and as an extended-release form.',
        molecularDetail:
          'The salt dissociates in the stomach and what is absorbed is the lithium cation. There is no prodrug step, no metabolite and no hepatic metabolism: the substance that is swallowed is the substance that acts and the substance that is excreted, entirely by the kidney.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It spreads through body water and reaches the brain slowly',
        laymanDesc:
          'The lithium ion distributes through the water in the body and takes up to a day to get into brain tissue, which is why the effects of an overdose can appear long after it was taken.',
        molecularDetail:
          'Distribution is through total body water rather than into fat, and the label states lithium may take up to 24 hours to distribute into brain tissue, so acute toxicity symptoms may be delayed. Clearance is renal and is handled in parallel with sodium, which is why dehydration, sodium restriction, thiazide diuretics, ACE inhibitors and non-steroidal anti-inflammatories all raise the serum concentration without any change in the amount taken.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It binds nothing that has been established',
        laymanDesc:
          'This is where every other drug on this page has a receptor. Lithium does not. The approved label states that the mechanism of action as a mood stabilising agent is unknown.',
        molecularDetail:
          "Section 12.1 of the label is a single sentence stating the mechanism is unknown. The leading candidate mechanisms are inhibition of glycogen synthase kinase-3 beta and inhibition of inositol monophosphatase leading to inositol depletion, both plausible at concentrations near the therapeutic range and neither established. Lithium's ionic radius sits close to those of sodium and magnesium, which is the structural basis for the proposal that it competes with magnesium at enzyme active sites.",
        iconName: 'HelpCircle',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The kidney, thyroid and parathyroid register it over years',
        laymanDesc:
          'Whatever lithium does in the brain, what it does to the kidneys, thyroid and calcium regulation is measurable and cumulative, and those measurements are the reason people stop taking it.',
        molecularDetail:
          'The label names lithium-induced chronic kidney disease associated with structural changes on chronic therapy, hypothyroidism and hyperthyroidism, and hypercalcaemia and hyperparathyroidism associated with long-term use, each with a monitoring instruction. Renal manifestations of toxicity include urine concentrating defect, nephrogenic diabetes insipidus and renal failure. An encephalopathic syndrome carries increased risk when lithium is combined with an antipsychotic.',
        iconName: 'AlertTriangle',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Fewer episodes over years, no measured effect on repeated suicide attempts',
        laymanDesc:
          'In the largest randomised comparison, lithium delayed the next mood episode better than valproate over two years. In the largest randomised test of its suicide-prevention claim, it did not separate from placebo.',
        molecularDetail:
          'BALANCE: hazard ratio 0.71 (95% CI 0.51 to 1.00, p=0.0472) for lithium against valproate for a new intervention for an emergent mood episode, in 330 patients over up to 24 months, open-label. Li+ plus: hazard ratio 1.10 (95% CI 0.77 to 1.55) for time to a repeated suicide-related event in 519 veterans, double-blind and placebo-controlled, stopped for futility.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'NCT01928446 (Li+ plus)',
        phase: 'Double-blind placebo-controlled randomised trial across 29 VA medical centres',
        sampleSize: 519,
        primaryEndpoint:
          'Time to the first repeated suicide-related event — repeated suicide attempt, interrupted attempt, hospitalisation to prevent suicide, or death from suicide — in veterans with bipolar disorder or depression who had survived a recent suicide-related event',
        endpointMet: false,
        statisticalPValue:
          'Hazard ratio 1.10 (95% CI 0.77 to 1.55); 65 of 255 on lithium and 62 of 264 on placebo had a suicide-related outcome; trial stopped for futility',
        unreportedAdverseSignals:
          'Mean serum concentrations at three months were 0.54 mEq/L in the bipolar group and 0.46 mEq/L in the depression group, below the 0.8 to 1.2 mEq/L range the label states as therapeutic. That limits how far the null result can be generalised to fully dosed treatment.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'BALANCE (ISRCTN 55261332)',
        phase: 'Randomised open-label trial with masked outcome adjudication, up to 24 months',
        sampleSize: 330,
        primaryEndpoint:
          'Initiation of a new intervention for an emergent mood episode in bipolar I disorder, comparing lithium, valproate and their combination',
        endpointMet: true,
        statisticalPValue:
          'Hazard ratios 0.59 (95% CI 0.42 to 0.83, p=0.0023) combination against valproate, 0.71 (95% CI 0.51 to 1.00, p=0.0472) lithium against valproate, and 0.82 (95% CI 0.58 to 1.17, p=0.27) combination against lithium',
        unreportedAdverseSignals:
          "The trial was open-label: investigators and participants knew the allocation and only the outcome-adjudicating team was masked, in a trial whose primary endpoint is a clinician's decision to intervene. Sixteen participants had serious adverse events after randomisation, including six deaths across the three arms.",
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A hazard ratio of 0.71 (95% CI 0.51 to 1.00, p=0.0472) against valproate for a new intervention for an emergent mood episode over up to two years',
        'A hazard ratio of 1.10 (95% CI 0.77 to 1.55) for a repeated suicide-related event against placebo in 519 veterans, in a trial stopped for futility',
        'A therapeutic serum range of 0.8 to 1.2 mEq/L against toxic concentrations at or above 1.5 mEq/L',
        'Named long-term consequences in the label: chronic kidney disease with structural changes, thyroid dysfunction in both directions, and hypercalcaemia with hyperparathyroidism',
        'A mechanism section in the approved label consisting of one sentence stating that the mechanism is unknown',
      ],
      unsupportedInferences: [
        'That lithium prevents suicide — the one adequately powered randomised test of that claim was stopped for futility at a hazard ratio of 1.10',
        'That lithium works by inhibiting glycogen synthase kinase-3 or by depleting inositol — both are hypotheses and neither appears in the label',
        'That lithium is established as superior across bipolar disorder — the randomised head-to-head evidence is one open-label trial of 330 patients against one comparator',
        'That a combination of lithium and valproate is better than lithium alone — BALANCE reports it could neither confirm nor refute that (hazard ratio 0.82, 95% CI 0.58 to 1.17)',
      ],
      whatFailedInitially: [
        'The Li+ plus suicide-prevention trial was stopped for futility after 519 randomisations',
        "BALANCE's lithium-against-valproate result has an upper confidence limit of exactly 1.00, in an unblinded trial whose endpoint is a clinician's decision",
        "No randomised trial has been able to attribute lithium's effect to any molecular mechanism, seventy-seven years after its first psychiatric use",
      ],
      realWorldOutcome: [
        'About nineteen cents a tablet at United States pharmacy acquisition cost, across 41 listed generic products',
        'The only drug on this page requiring a blood test to be used safely, and the only one whose toxic range abuts its therapeutic range',
        'An element that no company owns, which is part of why no modern development programme has ever been run on it',
        'A drug people take for decades, whose kidney, thyroid and parathyroid consequences accumulate over exactly that timescale',
      ],
    },
    deliverySystem: {
      type: 'Oral immediate-release capsule or tablet, oral solution, and extended-release tablet',
      description:
        'There is no injectable and no long-acting depot. Absorption is complete and clearance is entirely renal, in parallel with sodium handling, which is why the interaction list is dominated by non-steroidal anti-inflammatories, ACE inhibitors, angiotensin receptor blockers and thiazide diuretics rather than by other psychiatric drugs. Extended-release forms smooth the peak concentration but do not change the requirement for serum monitoring.',
      safetyProfile:
        'The United States label carries a boxed warning for lithium toxicity, stating that toxicity is closely related to serum concentrations, can occur at doses close to therapeutic ones, and that facilities for prompt and accurate serum determinations should be available before treatment begins. Toxic concentrations begin at 1.5 mEq/L against a therapeutic range of 0.8 to 1.2 mEq/L, and some patients show toxic signs within the therapeutic range. There is no specific antidote for lithium poisoning. Named long-term risks are chronic kidney disease with structural changes, hypothyroidism and hyperthyroidism, hypercalcaemia and hyperparathyroidism, an encephalopathic syndrome when combined with an antipsychotic, and unmasking of Brugada syndrome. Risk of toxicity rises with febrile illness, dehydration, sodium depletion, impaired renal function and interacting drugs.',
    },
    commonQuestions: [
      {
        q: 'Does lithium prevent suicide?',
        a: 'The largest randomised test of that question did not show it. The Li+ plus trial randomised 519 veterans with bipolar disorder or depression who had survived a suicide-related event within the previous six months to lithium or placebo added to usual care, and was stopped for futility with a hazard ratio of 1.10 and a 95% confidence interval from 0.77 to 1.55. Suicide-related outcomes occurred in 65 of 255 on lithium and 62 of 264 on placebo. The claim comes from observational studies and meta-analyses of smaller trials, which is weaker evidence than a stopped randomised trial pointing the other way. One genuine caveat: mean serum concentrations reached 0.54 and 0.46 mEq/L, below the 0.8 to 1.2 range the label calls therapeutic, so the result speaks most directly to adding lithium at modest concentrations to an existing regimen.',
        auditNote:
          "The authors' own conclusion is that simply adding lithium to existing medication regimens is unlikely to be effective for preventing a broad range of suicide-related events.",
      },
      {
        q: 'How does lithium actually work?',
        a: 'Nobody knows, and the label says so. Section 12.1 of the United States prescribing information is one sentence: the mechanism of action of lithium as a mood stabilising agent is unknown. The two leading research hypotheses are that it inhibits an enzyme called glycogen synthase kinase-3 beta, and that it depletes a signalling molecule called inositol by blocking inositol monophosphatase. Both are plausible at the concentrations lithium reaches in the body and neither has been established well enough to enter the label. Lithium was found to work by observation in 1949 and has been in use ever since; the explanation has never caught up.',
      },
      {
        q: 'Why do I need blood tests?',
        a: 'Because the concentration that helps and the concentration that poisons are three tenths of a unit apart. The label states the therapeutic range as 0.8 to 1.2 mEq/L and toxic concentrations as 1.5 mEq/L and above, and adds that some people show toxic signs while still inside the therapeutic range. It also notes that lithium may take up to 24 hours to distribute into brain tissue, so an overdose can look mild at first and worsen the next day, and that no specific antidote exists. On top of that, lithium is cleared by the kidney alongside sodium, so a stomach bug, a fever, a hot week, a low-salt diet or a new anti-inflammatory tablet can raise the level without anything about the prescription changing.',
        auditNote:
          'The boxed warning requires that facilities for prompt and accurate serum lithium determinations be available before treatment is started.',
      },
      {
        q: 'What does it do to my kidneys and thyroid over time?',
        a: 'The label names three long-term consequences and tells prescribers to monitor for each. Lithium-induced chronic kidney disease is described as associated with structural changes in patients on chronic therapy, with an instruction to monitor kidney function. Hypothyroidism and hyperthyroidism both appear, with an instruction to monitor thyroid function regularly. Hypercalcaemia and hyperparathyroidism are described as associated with long-term use, with an instruction to monitor serum calcium. All three are found with cheap blood tests, and all three are found only if someone orders them. Separately, the label flags an encephalopathic syndrome with increased risk when lithium is combined with an antipsychotic, which is one of the most common combinations in bipolar treatment.',
      },
      {
        q: 'Why does this page show a price but no manufacturing cost?',
        a: 'Because no verifiable per-dose cost of production for lithium carbonate could be found and cited. The figure quoted comes from the CMS National Average Drug Acquisition Cost survey, which records what United States pharmacies pay to acquire a drug. That is a price, not a cost of manufacture. Lithium is unusual here in that its cost is dominated by mining and refining an element rather than by chemical synthesis, and lithium carbonate is a globally traded industrial commodity whose price moves with battery demand rather than with medicine. Those two markets are not the same, and neither one gives a per-tablet cost of production that could be cited.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Katz IR et al. Lithium Treatment in the Prevention of Repeat Suicide-Related Outcomes in Veterans With Major Depression or Bipolar Disorder: A Randomized Clinical Trial. JAMA Psychiatry 2022;79:24-32',
        identifier: '10.1001/jamapsychiatry.2021.3170',
        kind: 'doi',
      },
      {
        label:
          'BALANCE investigators and collaborators; Geddes JR et al. Lithium plus valproate combination therapy versus monotherapy for relapse prevention in bipolar I disorder (BALANCE): a randomised open-label trial. Lancet 2010;375:385-395',
        identifier: '10.1016/S0140-6736(09)61828-6',
        kind: 'doi',
      },
      {
        label: 'NCT01928446 — Li+ plus, lithium versus placebo for repeat suicide-related outcomes',
        identifier: 'NCT01928446',
        kind: 'nct',
      },
      {
        label:
          'United States prescribing information for lithium carbonate — Boxed Warning (Lithium Toxicity), sections 5.1, 5.4, 5.5, 5.7, 5.8, Unmasking of Brugada Syndrome, and 12.1 (Mechanism of Action) — via the openFDA drug label endpoint',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22lithium+carbonate%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 11125 — lithium carbonate formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/11125',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 10. Cariprazine — the only antipsychotic to beat an active comparator on negative symptoms,
  //     and the holder of an add-on depression indication built on two dose arms out of five.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'cariprazine',
    name: 'Cariprazine',
    tradeName: 'Vraylar',
    sponsor:
      'Discovered at Gedeon Richter in Hungary and developed with Forest Laboratories, which became part of Allergan and then of AbbVie (NDA 204370, approved September 2015); it remains a brand-only product in the United States',
    targetGene: 'DRD3',
    targetProtein:
      'Dopamine D3 receptor, at which cariprazine is a partial agonist with a Ki of 0.085 nM — roughly six to eight times its affinity for D2 (0.49 nM at D2L, 0.69 nM at D2S), the reverse of every other drug in this class. It is also a partial agonist at 5-HT1A (Ki 2.6 nM) and an antagonist at 5-HT2B (Ki 0.58 nM) and 5-HT2A (Ki 18.8 nM), with lower affinity at H1 (23.2 nM), 5-HT2C (134 nM) and alpha-1A (155 nM), and no appreciable muscarinic affinity.',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2015,
    indication:
      'Schizophrenia in adults and children aged 13 and over; acute treatment of manic or mixed episodes of bipolar I disorder in adults and children aged 10 and over; depressive episodes of bipolar I disorder in adults; and adjunctive therapy to antidepressants for major depressive disorder in adults',
    patientFriendlyIndication:
      'Schizophrenia, both phases of bipolar I disorder, and depression that has not responded to an antidepressant alone',
    anatomicalSite:
      'Mesolimbic and mesocortical dopamine synapses, with the D3 receptor — densest in the ventral striatum and the islands of Calleja — as the distinguishing target',
    conditionContext: {
      conditionExplainer:
        'The negative symptoms of schizophrenia are the ones nobody markets a drug for: loss of drive, flattened emotion, reduced speech, social withdrawal. They are the strongest predictor of whether a person will work or live independently, and until 2017 no antipsychotic had ever beaten another one on them in a randomised trial.',
      whyItMatters:
        'Cariprazine did, once, over 26 weeks, by 1.46 points on a negative-symptom scale, against risperidone. That is a genuine first and a small number at the same time, and both facts belong in the same sentence. Most of what is written about this drug quotes the first without the second.',
      whoTakesThis:
        'Adults and adolescents with schizophrenia, adults and children with bipolar mania, adults with bipolar depression, and adults whose depression has not responded to an antidepressant alone. The last of those is the largest population by far.',
      clinicalGoals:
        'The trials measured PANSS totals over six weeks in schizophrenia, PANSS negative-symptom factor scores over 26 weeks in the negative-symptom trial, Young Mania Rating Scale scores in mania, and MADRS totals over six to eight weeks in depression.',
    },
    oneSentenceVerdict:
      'A dopamine partial agonist with six-to-eight-fold preference for the D3 receptor over D2, the only antipsychotic to have beaten an active comparator on negative symptoms in a randomised trial (1.46 PANSS-FSNS points against risperidone over 26 weeks, effect size 0.31), whose add-on depression indication rests on two positive dose arms out of five across 2,600 patients including one entire 1,022-patient trial that missed by 0.2 points, and whose active metabolite has a half-life of one to three weeks.',
    laymanHowItWorks:
      'Dopamine acts on a family of related receptors. Almost every antipsychotic aims at the one called D2. Cariprazine binds a close relative called D3 several times more tightly than it binds D2, and it turns both of them partly on rather than switching them off, in the way aripiprazole does. D3 receptors are concentrated in the parts of the brain that handle motivation and reward, which is the reasoning behind testing it against the symptoms of schizophrenia that look like an absence of drive. It also produces a metabolite that is active in the same way and clears from the body over weeks, so both the benefits and the side effects build up and fade slowly.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 52,
    substitutes: {
      summary:
        'Cariprazine costs about fifty dollars a capsule at United States pharmacy acquisition cost. Aripiprazole, the older drug with the same class of mechanism, costs about thirteen cents. That is a ratio of roughly three hundred and eighty to one, and the case for paying it rests on one 26-week trial in predominant negative symptoms and on a D3 preference whose clinical consequence has been demonstrated once.',
      conventionalRx: [
        {
          name: 'Aripiprazole (Abilify)',
          class: 'Dopamine D2 partial agonist, the first of the class',
          howItCompares:
            'The same mechanistic family, without the D3 preference, generic since the 2010s. Aripiprazole holds an adjunctive depression indication resting on a pooled analysis of sixteen trials in 3,480 patients with a response odds ratio of 1.69; cariprazine holds the same indication on two positive dose arms out of five. No head-to-head trial of the two exists.',
          typicalCost:
            'About thirteen cents per tablet at pharmacy acquisition cost for the generic oral form (CMS NADAC)',
          prosAndCons:
            'Pros: roughly one three-hundred-eightieth of the price, a much larger evidence base for the add-on depression use, and a shorter half-life that makes side effects easier to reverse. Cons: no demonstrated effect on negative symptoms, and its own label section on compulsive behaviours.',
        },
        {
          name: 'Brexpiprazole (Rexulti)',
          class: 'Dopamine D2 partial agonist, the direct brand-priced competitor',
          howItCompares:
            'The other brand-priced dopamine partial agonist, at a nearly identical price. In the 32-drug network meta-analysis brexpiprazole had the weakest measured effect on positive symptoms of any drug in the network. Neither drug has been compared with the other, and both are sold against a generic predecessor.',
          typicalCost:
            'US$49.53 per tablet at pharmacy acquisition cost, median across 6 listed brand products (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            "Pros: less akathisia in its registration programme. Cons: the same brand pricing, a weaker measured effect on positive symptoms, and no negative-symptom evidence of cariprazine's kind.",
        },
        {
          name: 'Risperidone (Risperdal)',
          class: 'Serotonin-dopamine antagonist',
          howItCompares:
            'The comparator cariprazine beat in the negative-symptom trial, by 1.46 points on the PANSS negative-symptom factor over 26 weeks with an effect size of 0.31. On overall symptom reduction in acute schizophrenia risperidone ranks fourth of fifteen with a standardised mean difference of 0.56. It costs about one seven-hundred-and-ninetieth as much per tablet.',
          typicalCost:
            'US$0.0644 per tablet at pharmacy acquisition cost, median across 126 listed generic products (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            "Pros: a strong pooled efficacy rank, decades of use, and a price that is a rounding error against cariprazine's. Cons: it lost the negative-symptom comparison, and it raises prolactin substantially.",
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Expect side effects to appear late, and to persist after stopping',
          action:
            "Section 5.6 of the label is headed Late-Occurring Adverse Reactions and instructs that, because of the drug's long half-life, prescribers monitor for adverse reactions and patient response for several weeks after starting and after every change in amount.",
          patientImpact:
            'The major active metabolite has a half-life of roughly one to three weeks and reaches concentrations about four times those of the parent drug by twelve weeks, with some patients not yet at steady state at that point. An effect that appears in week five may be a consequence of a change made in week one, and stopping the drug does not stop the exposure for some time.',
          clinicalPrecaution:
            'This is a reason to report new symptoms with their timing rather than to assume a late symptom is unrelated. Nothing here is guidance about starting, changing or stopping the drug.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CN(C)C(=O)NC1CCC(CC1)CCN2CCN(CC2)C3=C(C(=CC=C3)Cl)Cl',
      chemicalFormula: 'C21H32Cl2N4O',
      molecularWeight: '427.40 g/mol',
      targetReceptorAffinity:
        'Partial agonist at dopamine D3 (Ki 0.085 nM) and D2 (Ki 0.49 nM at D2L, 0.69 nM at D2S) and at serotonin 5-HT1A (Ki 2.6 nM). Antagonist at 5-HT2B (Ki 0.58 nM) and 5-HT2A (Ki 18.8 nM). Lower affinity at histamine H1 (23.2 nM), 5-HT2C (134 nM) and alpha-1A adrenergic (155 nM), and no appreciable affinity at cholinergic muscarinic receptors (IC50 above 1,000 nM). The six-to-eight-fold preference for D3 over D2 is the defining feature and reverses the usual order in this class. Note the qualifier the label attaches to all of it: the mechanism of action of cariprazine is unknown, and the D3 story is a proposal about why it might work rather than a demonstrated chain of cause and effect.',
      structureSource: {
        label:
          'PubChem CID 11154555 (cariprazine) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/11154555',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'car-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Stereochemical and isomeric control of the trans-cyclohexane diamine core',
          description:
            'Confirm the trans relative configuration across the 1,4-disubstituted cyclohexane before the urea is formed. The cis isomer is a distinct compound with a different receptor profile rather than a lower-yielding version of the same one, and the geometry of this ring is what sets the distance between the dichlorophenylpiperazine head and the dimethylurea tail that produces the D3 preference.',
          reagentsAndBuffer:
            'Trans-4-aminocyclohexyl intermediate reference standard, 1H NMR coupling-constant analysis for ring configuration, reversed-phase and chiral HPLC, gas chromatography for residual solvents',
        },
        {
          id: 'car-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Alkylation of dichlorophenylpiperazine and formation of the dimethylurea',
          description:
            'Couple 1-(2,3-dichlorophenyl)piperazine to the ethyl-cyclohexyl chain, then cap the remaining amine as an N,N-dimethylurea. The dichlorophenylpiperazine fragment is shared with aripiprazole; what distinguishes cariprazine is everything on the other end, and that is where the D3 selectivity comes from.',
          dependsOnStepId: 'car-w1',
          reagentsAndBuffer:
            '1-(2,3-dichlorophenyl)piperazine, the corresponding halide or mesylate of the protected trans-aminocyclohexyl ethyl chain, potassium carbonate or diisopropylethylamine as base, dimethylcarbamoyl chloride for the urea step, acetonitrile or dichloromethane under nitrogen',
        },
        {
          id: 'car-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Hydrochloride salt formation and cis-isomer specification',
          description:
            'Form the hydrochloride, recrystallise, and set an explicit limit on the cis diastereomer alongside the residual dichlorophenylpiperazine limit. The latter is a serotonergically active fragment in its own right, so it is an active impurity and not an inert one.',
          dependsOnStepId: 'car-w2',
          reagentsAndBuffer:
            'Hydrogen chloride in isopropanol or ethyl acetate, controlled cooling crystallisation, powder X-ray diffraction, differential scanning calorimetry, HPLC assay for related substances with cis-isomer and dichlorophenylpiperazine limits',
        },
        {
          id: 'car-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Twelve-week exposure study, because a four-week one would understate it',
          description:
            "Establish the concentration-time profile of the parent and of both active metabolites over at least twelve weeks. This is not a routine pharmacokinetic step for this molecule: the label records that didesmethylcariprazine approaches steady state only at week four to week eight, that some patients had not reached it by twelve weeks, and that its concentration is about four times the parent's by then. A conventional short exposure study would have described a different drug from the one patients take.",
          dependsOnStepId: 'car-w3',
          reagentsAndBuffer:
            'Serial plasma sampling over 12 weeks and beyond discontinuation, LC-MS/MS with deuterated internal standards for cariprazine, desmethylcariprazine and didesmethylcariprazine, CYP3A4 phenotyping, multi-exponential decline modelling',
        },
        {
          id: 'car-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'D3 against D2 functional selectivity, measured rather than assumed',
          description:
            'Report intrinsic activity at D3 and at both D2 isoforms across a full concentration range in the same assay system, so the selectivity ratio is a functional one rather than a ratio of binding constants. The entire therapeutic rationale for this molecule is a preference for one dopamine receptor subtype over its close relative, and a binding table alone cannot show whether that preference survives at the occupancies reached in a patient.',
          dependsOnStepId: 'car-w4',
          reagentsAndBuffer:
            'Cells stably expressing human D3, D2-long and D2-short receptors, cyclic AMP or [35S]GTP-gamma-S functional assay across a full concentration range, dopamine as full-agonist reference, haloperidol as neutral-antagonist reference, aripiprazole as a partial-agonist comparator, parallel 5-HT1A, 5-HT2A and 5-HT2B panels',
        },
      ],
    },
    keyAudits: [
      {
        id: 'car-a1',
        category: 'measured',
        title: 'The first antipsychotic to beat another one on negative symptoms — by 1.46 points',
        laymanSummary:
          'Over 26 weeks, 461 patients with long-standing schizophrenia and predominantly negative symptoms took either cariprazine or risperidone. Cariprazine did better on the negative-symptom score, by about one and a half points on a scale where both groups improved by seven to nine.',
        technicalDetails:
          'This phase 3b trial, registered as EudraCT 2012-005485-36 and funded by Gedeon Richter, enrolled adults aged 18 to 65 with stable schizophrenia of more than two years and predominant negative symptoms for more than six months, at 66 centres in 11 European countries. 461 were randomised 1:1 to fixed-dose cariprazine or risperidone for 26 weeks after a two-week discontinuation of previous medication, with 77% of each group completing. Least-squares mean change in the PANSS negative-symptom factor score was -8.90 on cariprazine against -7.44 on risperidone, least-squares mean difference -1.46 (95% CI -2.39 to -0.53), p=0.0022, effect size 0.31. Treatment-emergent adverse events occurred in 54% on cariprazine and 57% on risperidone. Two things are true at once: this is the first randomised demonstration that one antipsychotic outperforms another on the symptom domain that most determines whether a person works or lives independently, and the difference is 1.46 points at an effect size of 0.31 in a trial with no placebo arm, so it establishes superiority over risperidone rather than efficacy against the symptoms themselves.',
        evidenceSource: 'Németh G et al., Lancet 2017;389:1103-1113; EudraCT 2012-005485-36',
        doi: '10.1016/S0140-6736(17)30060-0',
        measuredMetric:
          'Least-squares mean difference in PANSS-FSNS change at week 26: -1.46 (95% CI -2.39 to -0.53), p=0.0022, effect size 0.31',
        auditFlag: 'verified',
      },
      {
        id: 'car-a2',
        category: 'failed',
        title: 'A 1,022-patient depression trial missed by two tenths of a point',
        laymanSummary:
          'The largest trial of cariprazine added to an antidepressant enrolled 1,022 people. The depression score improved by 7.7 points on the drug and 7.5 on placebo. The difference was 0.2 points, with a p-value of 0.79.',
        technicalDetails:
          'NCT01715805, a phase 3 double-blind placebo-controlled study of cariprazine as adjunctive therapy in major depressive disorder run by Forest Laboratories, enrolled 1,022 patients. Least-squares mean change from baseline in MADRS total score in the double-blind period was -7.7 on cariprazine plus antidepressant against -7.5 on placebo plus antidepressant, a difference of -0.2 with a 95% confidence interval from -1.6 to 1.2 and p=0.7948. The secondary endpoint, change in Sheehan Disability Scale score, was -3.7 against -3.1, difference -0.7 (95% CI -1.9 to 0.5), p=0.2784. This trial is larger than the two that produced the positive dose arms and it is unambiguously null on both endpoints. Its results are posted on ClinicalTrials.gov and it is rarely mentioned alongside the indication it did not support.',
        evidenceSource:
          'NCT01715805 — Phase 3 study of cariprazine as adjunctive therapy in major depressive disorder, posted results, Forest Laboratories',
        measuredMetric:
          'Least-squares mean difference in MADRS change: -0.2 (95% CI -1.6 to 1.2), p=0.7948',
        auditFlag: 'caution',
      },
      {
        id: 'car-a3',
        category: 'failed',
        title: 'Two positive dose arms out of five across 2,600 patients, and the doses disagree',
        laymanSummary:
          'Three trials tested cariprazine added to an antidepressant. Across five drug arms and about 2,600 patients, two arms beat placebo. In one trial the higher amount worked and the lower did not; in the other the lower worked and the higher did not.',
        technicalDetails:
          'NCT01469377, a phase 2 trial in 819 patients, tested two dose ranges: the lower gave a MADRS difference of -0.9 (95% CI -2.4 to 0.6), p=0.2404, and the higher gave -2.2 (95% CI -3.7 to -0.6), p=0.0114. NCT01715805, a phase 3 trial in 1,022 patients, tested a single arm and gave -0.2 (95% CI -1.6 to 1.2), p=0.7948. NCT03738215, a phase 3 trial in 759 patients, tested two fixed amounts: the 1.5 mg arm gave -2.5 (95% CI -4.17 to -0.89), p=0.0050, and the 3 mg arm gave -1.5 (95% CI -3.16 to 0.12), p=0.0727. So of five active arms, two separated from placebo. More striking is the direction: the amount that worked in the phase 2 trial sat above the one that failed there, while in the later phase 3 the smaller amount worked and the larger one did not. That is not a dose-response relationship in either direction, and it is the pattern that appears when a real but small effect is being sampled repeatedly. The adjunctive major depressive disorder indication was granted on this evidence base.',
        evidenceSource:
          'NCT01469377, NCT01715805 and NCT03738215 — posted results for cariprazine as adjunctive therapy in major depressive disorder',
        measuredMetric:
          'MADRS differences against placebo across five active arms: -0.9 (p=0.2404), -2.2 (p=0.0114), -0.2 (p=0.7948), -2.5 (p=0.0050), -1.5 (p=0.0727)',
        auditFlag: 'caution',
      },
      {
        id: 'car-a4',
        category: 'failed',
        title: 'A 901-patient bipolar relapse-prevention trial missed on both arms',
        laymanSummary:
          'A trial randomised 901 people to two amounts of cariprazine or placebo and measured how long until the next mood episode. Neither amount separated from placebo, and there is no bipolar maintenance indication.',
        technicalDetails:
          'NCT03573297, an AbbVie double-blind placebo-controlled randomised-withdrawal trial in a dose-reduction paradigm, enrolled 901 patients and measured time to first relapse of any mood episode during the double-blind period. The lower arm gave a hazard ratio of 0.83 (95% CI 0.48 to 1.43), p=0.5745; the higher arm gave 0.89 (95% CI 0.52 to 1.51), p=0.6308. Median time to relapse was not reached in any of the three groups. Both confidence intervals span 1.00 comfortably. Cariprazine holds acute indications in bipolar I disorder for both mania and depression, and no maintenance indication, which is consistent with this result.',
        evidenceSource:
          'NCT03573297 — randomised-withdrawal trial of cariprazine in a dose-reduction paradigm for prevention of relapse in bipolar I disorder, posted results, AbbVie',
        measuredMetric:
          'Hazard ratios for time to first relapse of any mood episode: 0.83 (95% CI 0.48 to 1.43) and 0.89 (95% CI 0.52 to 1.51)',
        auditFlag: 'caution',
      },
      {
        id: 'car-a5',
        category: 'measured',
        title: 'An active metabolite with a half-life of up to three weeks, four times the parent',
        laymanSummary:
          'Cariprazine turns into a second active molecule that clears from the body over weeks rather than days and builds up to about four times the concentration of the drug itself. The label tells prescribers to keep watching for side effects for weeks after any change.',
        technicalDetails:
          "Section 12.3 of the label records that activity is mediated by cariprazine and by two major metabolites, desmethylcariprazine and didesmethylcariprazine, which are pharmacologically equipotent to the parent. Half-lives estimated from time to steady state are 2 to 4 days for cariprazine, 1 to 2 days for desmethylcariprazine and approximately 1 to 3 weeks for didesmethylcariprazine. Cariprazine and desmethylcariprazine reach steady state at around week 1 to week 2; didesmethylcariprazine only approaches it at around week 4 to week 8, and the label states the time to steady state for it was variable across patients, with some not achieving it by the end of a 12-week study. By 12 weeks its mean concentration is approximately 400% of the parent's. Section 5.6, headed Late-Occurring Adverse Reactions, instructs monitoring for adverse reactions and patient response for several weeks after starting and with each change in amount. The practical consequence is that a six-week trial of this drug measures a partially loaded system, and that stopping it does not end exposure for some weeks.",
        evidenceSource:
          'United States prescribing information for cariprazine, sections 5.6 and 12.3, via the openFDA drug label endpoint',
        measuredMetric:
          'Half-life of didesmethylcariprazine approximately 1 to 3 weeks, reaching about 400% of parent concentration by 12 weeks',
        auditFlag: 'verified',
      },
      {
        id: 'car-a6',
        category: 'inferred',
        title: 'The D3 story is a proposal, and the label says the mechanism is unknown',
        laymanSummary:
          'Cariprazine is marketed on binding the D3 dopamine receptor more tightly than the D2 receptor. The binding numbers are real. The label still states that the mechanism of action is unknown.',
        technicalDetails:
          'Section 12.2 gives the affinities: D3 Ki 0.085 nM against D2L 0.49 nM and D2S 0.69 nM, a six-to-eight-fold preference that is genuine and unmatched in this class. Section 12.1 nonetheless reads: "The mechanism of action of cariprazine is unknown. However, the efficacy of cariprazine could be mediated through a combination of partial agonist activity at central dopamine D2 and serotonin 5-HT1A receptors and antagonist activity at serotonin 5-HT2A receptors." Note which receptors that sentence names — D2, 5-HT1A and 5-HT2A — and which it does not. The label\'s own proposed mechanism does not rest on D3. The chain from a binding constant to a clinical effect requires that the receptor be occupied at clinical exposures, that occupancy produce the intended functional change, and that the change explain the outcome; for D3 the first link is measured and the rest are argued.',
        evidenceSource:
          'United States prescribing information for cariprazine, sections 12.1 and 12.2, via the openFDA drug label endpoint',
        inferredClaim:
          "That cariprazine's clinical effects follow from its D3 preference — the affinity ratio is measured, and the label's own mechanism sentence names D2, 5-HT1A and 5-HT2A rather than D3",
        auditFlag: 'caution',
      },
      {
        id: 'car-a7',
        category: 'inferred',
        title: 'Three hundred and eighty times the price of the drug with the same mechanism',
        laymanSummary:
          'Cariprazine costs about fifty dollars a capsule at what pharmacies pay. Aripiprazole, the first dopamine partial agonist and a generic, costs about thirteen cents.',
        technicalDetails:
          'The CMS National Average Drug Acquisition Cost survey effective 19 August 2026 lists cariprazine at US$50.85 per capsule as a brand product across 10 listed products, and generic aripiprazole at about thirteen cents per tablet. No head-to-head randomised trial of cariprazine against aripiprazole exists. What distinguishes cariprazine on measured evidence is one 26-week trial showing superiority over risperidone on negative symptoms by 1.46 points, and the D3 affinity ratio. What it shares with aripiprazole is the partial-agonist mechanism, the adjunctive depression indication, and the schizophrenia and bipolar indications. A price ratio of roughly 380 to 1 is a fact about markets rather than a fact about pharmacology, and no verifiable cost-of-production figure exists for either molecule to place beside it.',
        evidenceSource:
          'CMS National Average Drug Acquisition Cost survey, effective 19 August 2026; Németh G et al., Lancet 2017;389:1103-1113',
        inferredClaim:
          "That cariprazine's clinical advantage over generic aripiprazole justifies its price — the two have never been compared in a trial",
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A once-daily capsule that takes weeks to reach full effect',
        laymanDesc:
          'Cariprazine is a capsule taken once a day. Unlike most tablets it keeps accumulating for a month or two, because one of the molecules the body makes from it clears very slowly.',
        molecularDetail:
          "Cariprazine and desmethylcariprazine reach steady state at around week 1 to 2. Didesmethylcariprazine, which is pharmacologically equipotent to the parent, only approaches steady state at week 4 to 8, and some patients had not reached it at 12 weeks. By 12 weeks its concentration is about 400% of the parent's.",
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The liver makes two more active molecules from it',
        laymanDesc:
          'The liver strips methyl groups off cariprazine in two steps, and both products are active in the same way as the original. The second one is the one that lingers.',
        molecularDetail:
          'Demethylation is primarily CYP3A4-mediated, with a minor CYP2D6 contribution. Both desmethylcariprazine and didesmethylcariprazine have in vitro receptor binding profiles similar to the parent and are described in the label as pharmacologically equipotent to it. Half-lives estimated from time to steady state are 2 to 4 days, 1 to 2 days and approximately 1 to 3 weeks respectively.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It binds D3 several times more tightly than D2, and turns both partly on',
        laymanDesc:
          'Almost every drug in this class aims at the D2 dopamine receptor. Cariprazine holds on to its close relative D3 six to eight times more tightly, and rather than switching either off it turns them partly on.',
        molecularDetail:
          'Partial agonism at D3 with Ki 0.085 nM and at D2 with Ki 0.49 nM (D2L) and 0.69 nM (D2S), plus partial agonism at 5-HT1A (2.6 nM) and antagonism at 5-HT2B (0.58 nM) and 5-HT2A (18.8 nM). D3 receptors are concentrated in the ventral striatum and islands of Calleja, regions associated with motivation and reward, which is the anatomical basis of the negative-symptom hypothesis.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The proposed effect is on drive rather than on hallucinations',
        laymanDesc:
          'Blocking D2 dampens hallucinations and delusions. The argument for D3 is different: that partly activating it in the circuits that handle motivation might lift the flatness and withdrawal that antipsychotics normally leave untouched or worsen.',
        molecularDetail:
          "The one randomised test of that proposition gave a least-squares mean difference of -1.46 PANSS-FSNS points against risperidone at 26 weeks (95% CI -2.39 to -0.53, p=0.0022, effect size 0.31), in patients with predominant negative symptoms for over six months. The label's own mechanism sentence attributes efficacy to D2 and 5-HT1A partial agonism and 5-HT2A antagonism, and states the mechanism is unknown.",
        iconName: 'Activity',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Symptoms improve, akathisia appears, and everything moves slowly',
        laymanDesc:
          'Effects on symptoms are real and modest. The characteristic complaint is restlessness. Because of the slow-clearing metabolite, both the benefit and the side effects arrive and leave over weeks rather than days.',
        molecularDetail:
          'Akathisia, extrapyramidal symptoms, insomnia and nausea are the characteristic adverse reactions, consistent with a dopamine partial agonist. The label states that at three times the maximum recommended amount cariprazine does not prolong the QTc interval to a clinically relevant extent. Section 5.6 directs monitoring for adverse reactions for several weeks after starting and with each change, because of the long half-life.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'EudraCT 2012-005485-36 (cariprazine versus risperidone in predominant negative symptoms)',
        phase: 'Phase 3b randomised double-blind active-controlled trial, 26 weeks',
        sampleSize: 461,
        primaryEndpoint:
          'Change from baseline to week 26 in the PANSS factor score for negative symptoms, in adults with stable schizophrenia of over two years and predominant negative symptoms for over six months',
        endpointMet: true,
        statisticalPValue:
          'Least-squares mean change -8.90 on cariprazine against -7.44 on risperidone; difference -1.46 (95% CI -2.39 to -0.53), p=0.0022, effect size 0.31',
        unreportedAdverseSignals:
          'There was no placebo arm, so the trial establishes superiority over risperidone rather than efficacy against negative symptoms as such. Funding was from Gedeon Richter, the originator. 77% of each group completed the 26 weeks.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'NCT01715805',
        phase: 'Phase 3 double-blind placebo-controlled adjunctive trial',
        sampleSize: 1022,
        primaryEndpoint:
          'Change from baseline in MADRS total score, cariprazine added to an antidepressant in major depressive disorder',
        endpointMet: false,
        statisticalPValue:
          'Least-squares mean change -7.7 against -7.5 on placebo; difference -0.2 (95% CI -1.6 to 1.2), p=0.7948',
        unreportedAdverseSignals:
          'The largest of the three adjunctive depression trials and unambiguously null, on the Sheehan Disability Scale as well as the MADRS. The indication was granted on the two positive dose arms in the other two trials.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'NCT03738215',
        phase: 'Phase 3 double-blind placebo-controlled fixed-dose adjunctive trial, 6 weeks',
        sampleSize: 759,
        primaryEndpoint:
          'Change from baseline to week 6 in MADRS total score, cariprazine added to an antidepressant after inadequate response',
        endpointMet: true,
        statisticalPValue:
          '1.5 mg arm difference -2.5 (95% CI -4.17 to -0.89), p=0.0050; 3 mg arm difference -1.5 (95% CI -3.16 to 0.12), p=0.0727',
        unreportedAdverseSignals:
          'Only one of the two arms separated, and it was the lower one, which reverses the direction seen in the phase 2 trial where the higher range succeeded and the lower failed.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'NCT01469377',
        phase: 'Phase 2 double-blind placebo-controlled adjunctive trial, 8 weeks',
        sampleSize: 819,
        primaryEndpoint:
          'Change from baseline in MADRS total score at week 8, cariprazine added to an antidepressant in major depressive disorder',
        endpointMet: true,
        statisticalPValue:
          'Lower dose range difference -0.9 (95% CI -2.4 to 0.6), p=0.2404; higher dose range difference -2.2 (95% CI -3.7 to -0.6), p=0.0114',
        unreportedAdverseSignals:
          'One of two arms separated. Taken with the two phase 3 trials, two of five active arms across roughly 2,600 patients beat placebo, and the successful amounts are not consistent between trials.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'NCT03573297',
        phase:
          'Double-blind placebo-controlled randomised-withdrawal trial in a dose-reduction paradigm',
        sampleSize: 901,
        primaryEndpoint:
          'Time to first relapse of any mood episode during the double-blind treatment period in bipolar I disorder',
        endpointMet: false,
        statisticalPValue:
          'Hazard ratio 0.83 (95% CI 0.48 to 1.43), p=0.5745 for the lower arm and 0.89 (95% CI 0.52 to 1.51), p=0.6308 for the higher arm',
        unreportedAdverseSignals:
          'Median time to relapse was not reached in any group. Cariprazine has acute bipolar I indications for both mania and depression and no maintenance indication.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A 1.46-point advantage over risperidone on the PANSS negative-symptom factor at 26 weeks (95% CI -2.39 to -0.53, p=0.0022, effect size 0.31) in 461 patients',
        'A six-to-eight-fold higher binding affinity for dopamine D3 (Ki 0.085 nM) than for D2 (0.49 and 0.69 nM)',
        'A didesmethylcariprazine half-life of approximately 1 to 3 weeks, reaching about 400% of parent concentration by 12 weeks',
        'MADRS differences against placebo of -0.2 (p=0.7948), -0.9 (p=0.2404), -1.5 (p=0.0727), -2.2 (p=0.0114) and -2.5 (p=0.0050) across five adjunctive depression arms',
        'Hazard ratios of 0.83 and 0.89 for bipolar relapse prevention, both with confidence intervals spanning 1.00',
      ],
      unsupportedInferences: [
        "That cariprazine's effects follow from its D3 preference — the label states the mechanism is unknown and its own proposed mechanism names D2, 5-HT1A and 5-HT2A",
        'That it treats negative symptoms — the one trial had no placebo arm and shows superiority over risperidone by 1.46 points',
        'That the adjunctive depression evidence is solid — two of five active arms separated, the largest trial was null, and the effective amounts disagree between trials',
        'That its clinical advantage over generic aripiprazole justifies a 380-fold price difference — the two have never been compared',
      ],
      whatFailedInitially: [
        'NCT01715805, the largest adjunctive depression trial at 1,022 patients, missed by 0.2 MADRS points at p=0.7948',
        'NCT03573297, the 901-patient bipolar relapse-prevention trial, missed on both arms',
        'The dose that worked in the phase 2 depression trial was the higher one; the dose that worked in the later phase 3 was the lower one, and the higher arm failed there',
      ],
      realWorldOutcome: [
        'About fifty dollars a capsule at United States pharmacy acquisition cost, against about thirteen cents for generic aripiprazole',
        'The only drug in this class with randomised evidence of superiority over another antipsychotic on negative symptoms',
        'A pharmacokinetic profile in which starting, changing and stopping all take weeks to register, with a dedicated label section about it',
        'Four separate indications, of which the largest population by far is the one with the weakest trial record',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule taken once daily, with or without food',
      description:
        "There is no injectable and no long-acting form, and none is needed in the usual sense: the drug behaves like a slow-release product because of its own metabolite. Cariprazine and desmethylcariprazine reach steady state within one to two weeks, while didesmethylcariprazine approaches steady state only at week four to eight and reaches about four times the parent's concentration by twelve weeks. Clearance is primarily by CYP3A4, with a minor CYP2D6 contribution, so strong inhibitors and inducers of CYP3A4 materially change exposure.",
      safetyProfile:
        'The United States label carries boxed warnings for increased mortality in elderly patients with dementia-related psychosis and for suicidal thoughts and behaviours in children, adolescents and young adults. Section 5.6, Late-Occurring Adverse Reactions, directs monitoring for several weeks after starting and after every change in amount because of the long half-life. Akathisia and extrapyramidal symptoms are the characteristic adverse reactions. Metabolic changes, leukopenia, neutropenia and agranulocytosis, orthostatic hypotension and syncope, seizures, neuroleptic malignant syndrome, tardive dyskinesia and cognitive and motor impairment are all in the label. At three times the maximum recommended amount the label states cariprazine does not prolong the QTc interval to a clinically relevant extent.',
    },
    commonQuestions: [
      {
        q: 'Does it really work for negative symptoms?',
        a: 'One randomised trial says it works better than risperidone, and that is a genuine first. Over 26 weeks in 461 patients with long-standing schizophrenia and predominantly negative symptoms, the negative-symptom factor score improved by 8.90 points on cariprazine and 7.44 on risperidone, a difference of 1.46 points with a 95% confidence interval from -2.39 to -0.53, p=0.0022 and an effect size of 0.31. Two limits belong beside that. There was no placebo arm, so what is established is superiority over risperidone rather than efficacy against negative symptoms in the abstract. And 1.46 points at an effect size of 0.31 is a small difference, in a trial funded by the company that discovered the drug and not yet repeated by anyone else.',
        auditNote: 'No independent replication of this result has been published.',
      },
      {
        q: 'How good is the evidence for adding it to an antidepressant?',
        a: 'Weaker than the indication suggests. Three placebo-controlled trials tested it, with five active arms and roughly 2,600 patients between them. Two arms beat placebo: one at -2.2 MADRS points (p=0.0114) and one at -2.5 points (p=0.0050). Three did not: -0.9 (p=0.2404), -1.5 (p=0.0727) and -0.2 (p=0.7948). The last of those was the largest trial of the three, at 1,022 patients, and it was null on the disability scale as well. The doses also disagree between trials: the higher range succeeded in the phase 2 study while the lower amount succeeded in the later phase 3, where the higher amount failed. All of these results are posted on ClinicalTrials.gov.',
        auditNote:
          'Two of five active arms separated from placebo. The indication was granted on that record.',
      },
      {
        q: 'Why do I need to wait weeks to know if it is working?',
        a: 'Because the drug is still accumulating. Cariprazine produces two active metabolites, and the second, didesmethylcariprazine, has a half-life of roughly one to three weeks and is described in the label as pharmacologically equipotent to the parent. It only approaches steady state at week four to eight, some patients had not reached it after twelve weeks, and by twelve weeks its concentration is about four times that of cariprazine itself. That is why section 5.6 of the label is headed Late-Occurring Adverse Reactions and instructs prescribers to keep monitoring for several weeks after starting and after every change. It also means that stopping the drug does not stop the exposure for some time.',
      },
      {
        q: 'Is it worth fifty dollars a capsule?',
        a: 'That is a judgement rather than a measurement, and this page can only lay out the inputs. Cariprazine is US$50.85 per capsule and generic aripiprazole about US$0.13 per tablet, both from the CMS acquisition-cost survey on the same date, a ratio of roughly 380 to 1. They share the dopamine partial-agonist mechanism, the schizophrenia and bipolar indications and the adjunctive depression indication. What cariprazine has that aripiprazole does not is a 26-week trial showing superiority over risperidone on negative symptoms by 1.46 points, and a D3 affinity roughly six to eight times its D2 affinity. No trial has ever compared the two drugs directly.',
      },
      {
        q: 'Why does this page show a price but no manufacturing cost?',
        a: 'Because no verifiable per-dose cost of production for cariprazine could be found and cited. The figure quoted comes from the CMS National Average Drug Acquisition Cost survey, which records what United States pharmacies pay to acquire a drug. That is a price, not a cost of manufacture, and for a brand-only product the gap between the two is entirely unknown from public data. The synthesis is a piperazine alkylation followed by a urea formation on a trans-substituted cyclohexane, which is a moderately complex but unremarkable route, and describing a route is not the same as pricing one.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Németh G et al. Cariprazine versus risperidone monotherapy for treatment of predominant negative symptoms in patients with schizophrenia: a randomised, double-blind, controlled trial. Lancet 2017;389:1103-1113',
        identifier: '10.1016/S0140-6736(17)30060-0',
        kind: 'doi',
      },
      {
        label:
          'NCT01715805 — Phase 3 study of cariprazine as adjunctive therapy in major depressive disorder, posted results showing p=0.7948 on the primary endpoint',
        identifier: 'NCT01715805',
        kind: 'nct',
      },
      {
        label:
          'NCT03738215 — cariprazine as an adjunct to antidepressants after inadequate response, posted results',
        identifier: 'NCT03738215',
        kind: 'nct',
      },
      {
        label:
          'NCT01469377 — phase 2 study of cariprazine as adjunctive therapy in major depressive disorder, posted results',
        identifier: 'NCT01469377',
        kind: 'nct',
      },
      {
        label:
          'NCT03573297 — randomised-withdrawal trial of cariprazine for prevention of relapse in bipolar I disorder, posted results showing both arms non-significant',
        identifier: 'NCT03573297',
        kind: 'nct',
      },
      {
        label:
          'United States prescribing information for VRAYLAR (cariprazine), sections 1, 5.6, 12.1, 12.2 and 12.3, via the openFDA drug label endpoint',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22cariprazine%22',
        kind: 'regulatory',
      },
      {
        label: 'Drugs@FDA: VRAYLAR (cariprazine), NDA 204370, original approval September 2015',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=204370',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 11154555 — cariprazine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/11154555',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 11. Brexpiprazole — the drug whose boxed warning about deaths in dementia now carries a
  //     written exception for the one dementia indication it holds.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'brexpiprazole',
    name: 'Brexpiprazole',
    tradeName: 'Rexulti',
    sponsor:
      'Otsuka Pharmaceutical, co-developed and co-commercialised with Lundbeck (NDA 205422, approved 10 July 2015); it remains a brand-only product in the United States',
    targetGene: 'DRD2',
    targetProtein:
      'Dopamine D2 receptor, at which brexpiprazole is a partial agonist with lower intrinsic activity than aripiprazole, together with partial agonism at serotonin 5-HT1A and antagonism at 5-HT2A. The label states the mechanism of action in major depressive disorder or schizophrenia is unknown and offers that combination as a possible explanation.',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2015,
    indication:
      'Adjunctive treatment to antidepressants for major depressive disorder in adults; schizophrenia in adults and children aged 13 and over; and agitation associated with dementia due to Alzheimer disease, with an explicit limitation of use stating it is not indicated as an as-needed treatment for that agitation',
    patientFriendlyIndication:
      'Depression that has not responded to an antidepressant alone, schizophrenia, and agitation in Alzheimer disease',
    anatomicalSite:
      'Mesolimbic and mesocortical dopamine synapses, and, for the newest indication, the same circuits in a brain already undergoing Alzheimer neurodegeneration',
    conditionContext: {
      conditionExplainer:
        'Agitation in Alzheimer disease is one of the hardest problems in medicine and one of the most common reasons a family can no longer manage care at home. For twenty years the pooled evidence has been that antipsychotics given to people with dementia increase the chance of dying, and every antipsychotic label has carried a boxed warning saying so.',
      whyItMatters:
        'In 2023 brexpiprazole became the first drug approved in the United States for agitation associated with dementia due to Alzheimer disease. Its boxed warning did not go away. It was rewritten, so that it now says the drug is not approved for dementia-related psychosis "without agitation associated with dementia due to Alzheimer\'s disease". A class warning about death now contains a written exception for one product\'s indication.',
      whoTakesThis:
        'Adults with depression that has not responded to an antidepressant, adults and adolescents with schizophrenia, and people with Alzheimer disease who are agitated. The third group is the one with the least capacity to weigh the trade being made on their behalf.',
      clinicalGoals:
        'The trials measured MADRS totals over six weeks in depression, PANSS totals in schizophrenia, and the Cohen-Mansfield Agitation Inventory over twelve weeks in dementia agitation. The CMAI is a 29-item caregiver-informed questionnaire scored from 29 to 203.',
    },
    oneSentenceVerdict:
      'A dopamine partial agonist designed as a lower-intrinsic-activity successor to aripiprazole, which had the weakest measured effect on positive symptoms of any drug in a 402-study network of 53,463 patients (standardised mean difference -0.17), reduced dementia agitation by 3.77 and 5.32 points beyond a placebo response of about 17 in its two positive trials while a third trial and a second dose arm failed, and became the first drug approved for agitation in Alzheimer disease by having its boxed warning about deaths in dementia rewritten around the indication.',
    laymanHowItWorks:
      'Brexpiprazole is a close chemical relative of aripiprazole and works the same way: instead of switching the dopamine receptor off, it turns it partly on. It was engineered to turn it on less than aripiprazole does, on the theory that this would cause less of the inner restlessness that makes people stop taking aripiprazole. It also acts on two serotonin receptors, turning one partly on and blocking the other. Its own label states that nobody knows how it produces its effects and offers that combination as a possibility rather than an explanation.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 44,
    substitutes: {
      summary:
        'Brexpiprazole costs about fifty dollars a tablet at United States pharmacy acquisition cost. Aripiprazole, the drug it was designed to succeed, costs about thirteen cents and has a substantially larger evidence base for the adjunctive depression indication they share. What brexpiprazole has that nothing else does is an approved indication for agitation in Alzheimer disease, and that is the comparison that matters most, because the alternative there is usually a drug being used off-label under the same boxed warning.',
      conventionalRx: [
        {
          name: 'Aripiprazole (Abilify)',
          class: 'Dopamine D2 partial agonist, the predecessor from the same company',
          howItCompares:
            'The same mechanism with higher intrinsic activity at D2, generic, and with a much larger adjunctive depression evidence base: a pooled analysis of sixteen trials in 3,480 patients gave a response odds ratio of 1.69. Brexpiprazole was designed to cause less akathisia than aripiprazole, and in the 32-drug network meta-analysis it had the weakest measured effect on positive symptoms of any drug included.',
          typicalCost:
            'About thirteen cents per tablet at pharmacy acquisition cost for the generic oral form (CMS NADAC)',
          prosAndCons:
            'Pros: roughly one three-hundred-eightieth of the price, a larger evidence base for the shared indication. Cons: more akathisia, and no approved indication for dementia agitation.',
        },
        {
          name: 'Cariprazine (Vraylar)',
          class: 'Dopamine D3-preferring partial agonist, the direct brand-priced competitor',
          howItCompares:
            'The other brand-priced dopamine partial agonist, at a nearly identical acquisition cost. Cariprazine has a randomised trial showing superiority over risperidone on negative symptoms; brexpiprazole has the dementia agitation indication. Neither has been compared with the other, and both compete against the same generic predecessor.',
          typicalCost:
            'US$50.85 per capsule at pharmacy acquisition cost, median across 10 listed brand products (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: a demonstrated advantage over an active comparator on negative symptoms. Cons: no dementia indication, the same brand pricing, and an adjunctive depression record of two positive dose arms out of five.',
        },
        {
          name: 'Non-drug management of agitation first',
          class: 'Environmental, behavioural and caregiver-directed approaches',
          howItCompares:
            'The comparison the trials cannot make, because none of them randomised against structured non-drug care. What the trials do show is the size of the non-drug effect embedded in them: placebo groups improved by 16.5 to 17.8 CMAI points across the three studies, against a drug increment of 3.77 to 5.32 points where it was found at all.',
          typicalCost: 'No acquisition cost; the cost is caregiver time and specialist input',
          prosAndCons:
            'Pros: no mortality signal, and a placebo-group improvement in these trials three to five times the size of the added drug effect. Cons: it requires staffing and expertise that are often not available, which is the reason a tablet gets reached for.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Ask what the placebo groups did in the agitation trials',
          action:
            'Before deciding about an antipsychotic for agitation in dementia, ask the prescriber for the size of the drug effect and the size of the placebo effect separately, not the p-value.',
          patientImpact:
            'Across the three 12-week trials, placebo groups improved by 16.5, 17.3 and 17.8 points on the Cohen-Mansfield Agitation Inventory. The drug added 3.77 points in one trial and 5.32 in another, and added nothing in the third or in the lower dose arm of the first. Most of the improvement seen in these trials happened without the drug.',
          clinicalPrecaution:
            "That is not an argument that the drug does nothing. It is an argument for knowing the two numbers before a decision that carries a mortality warning is made on someone else's behalf.",
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1CN(CCN1CCCCOC2=CC3=C(C=C2)C=CC(=O)N3)C4=C5C=CSC5=CC=C4',
      chemicalFormula: 'C25H27N3O2S',
      molecularWeight: '433.60 g/mol',
      targetReceptorAffinity:
        "Partial agonist at dopamine D2 with lower intrinsic activity than aripiprazole, partial agonist at serotonin 5-HT1A, and antagonist at 5-HT2A, with additional alpha-1B and alpha-2C adrenergic antagonism. The structural relationship to aripiprazole is direct: both carry a butoxy-linked quinolinone-type head and an arylpiperazine tail, and brexpiprazole substitutes a benzothiophene for aripiprazole's dichlorophenyl. That single substitution is what lowers the intrinsic activity at D2, and lowering it was the design goal.",
      structureSource: {
        label:
          'PubChem CID 11978813 (brexpiprazole) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/11978813',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'bre-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Incoming control of the benzothiophenylpiperazine and the bromobutoxy quinolinone',
          description:
            'Confirm identity and purity of 1-(benzo[b]thiophen-4-yl)piperazine and of the 7-(4-bromobutoxy)quinolin-2(1H)-one fragment. The benzothiophenylpiperazine is the fragment that distinguishes this molecule from aripiprazole and is itself receptor-active, so residual unreacted material is a pharmacologically active impurity.',
          reagentsAndBuffer:
            '1-(benzo[b]thiophen-4-yl)piperazine hydrochloride and 7-(4-bromobutoxy)quinolin-2(1H)-one reference standards, reversed-phase HPLC with UV detection, Karl Fischer titration, sulfur-specific detection for benzothiophene-related impurities',
        },
        {
          id: 'bre-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'N-alkylation joining the butoxy chain to the piperazine nitrogen',
          description:
            "React the piperazine nitrogen with the bromobutyl chain on the quinolinone under base. This is the same disconnection as aripiprazole's, with the same four-carbon linker; the whole pharmacological difference between the two drugs sits in the aryl group on the far side of the piperazine.",
          dependsOnStepId: 'bre-w1',
          reagentsAndBuffer:
            'Potassium carbonate or triethylamine as base, catalytic potassium iodide, acetonitrile or dimethylformamide at reflux under nitrogen',
        },
        {
          id: 'bre-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation and crystal-form confirmation',
          description:
            'Recrystallise under a controlled cooling profile and confirm the crystal form by powder X-ray diffraction and thermal analysis, with an explicit residual-piperazine specification. Dissolution behaviour is what determines whether the tablet delivers the exposure the trials measured.',
          dependsOnStepId: 'bre-w2',
          reagentsAndBuffer:
            'Ethanol or ethyl acetate with controlled cooling ramp, powder X-ray diffraction reference pattern, differential scanning calorimetry, HPLC assay for related substances, USP dissolution apparatus',
        },
        {
          id: 'bre-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Exposure characterisation in an elderly population, separately',
          description:
            'Establish the concentration-time profile in patients of the age the dementia indication targets, rather than extrapolating from the young adults in the schizophrenia programme. The registration trials for agitation enrolled patients with a mean age of 74 and a range up to 90, in whom renal function, body composition, protein binding and concomitant medication all differ from the population in which the pharmacokinetics were originally described.',
          dependsOnStepId: 'bre-w3',
          reagentsAndBuffer:
            'Serial plasma sampling in an elderly cohort, LC-MS/MS with a deuterated brexpiprazole internal standard, CYP2D6 genotyping and CYP3A4 phenotyping, protein binding by equilibrium dialysis, creatinine clearance measured alongside',
        },
        {
          id: 'bre-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Functional intrinsic activity at D2, reported as a fraction of full agonism',
          description:
            'Measure intrinsic activity at human D2 across a full concentration range alongside aripiprazole as the reference partial agonist, dopamine as the full agonist and haloperidol as the neutral antagonist. The design claim for this molecule is a specific quantity — lower intrinsic activity than its predecessor — and only a functional assay run against that predecessor can report it. A binding constant cannot.',
          dependsOnStepId: 'bre-w4',
          reagentsAndBuffer:
            'CHO or HEK293 cells stably expressing human D2 long isoform, forskolin-stimulated cyclic AMP accumulation or [35S]GTP-gamma-S membrane binding, dopamine, aripiprazole and haloperidol reference compounds, parallel 5-HT1A and 5-HT2A functional panels, IBMX phosphodiesterase inhibitor',
        },
      ],
    },
    keyAudits: [
      {
        id: 'bre-a1',
        category: 'conclusion_shift',
        title: 'The boxed warning about deaths in dementia was rewritten around the indication',
        laymanSummary:
          'Every antipsychotic carries a boxed warning that these drugs increase the risk of death in elderly people with dementia. Brexpiprazole now carries that warning with a clause carved out of it for the dementia indication it holds.',
        technicalDetails:
          'The boxed warning states that elderly patients with dementia-related psychosis treated with antipsychotic drugs are at increased risk of death, and then: "REXULTI is not approved for the treatment of patients with dementia-related psychosis without agitation associated with dementia due to Alzheimer\'s disease." Section 5.1 repeats the class evidence in full — analyses of seventeen placebo-controlled trials of modal duration ten weeks, largely of atypical antipsychotics, showing a risk of death 1.6 to 1.7 times placebo, about 4.5% against about 2.6% over a typical ten-week trial, with most deaths cardiovascular or infectious — and then repeats the same carve-out sentence. The warning has not been withdrawn or contradicted; a population has been excised from its scope by wording rather than by new mortality evidence in that population. Whether the two trials supporting the indication were powered to detect a mortality difference of the size the class warning describes is a separate question from whether they showed a benefit on agitation, and only the second was their design objective.',
        evidenceSource:
          'United States prescribing information for REXULTI (brexpiprazole), Boxed Warning and section 5.1, via the openFDA drug label endpoint',
        inferredClaim:
          "That the class mortality risk in dementia does not apply to this indication — the warning's scope was narrowed by wording, and the supporting trials were designed to measure agitation over twelve weeks",
        auditFlag: 'contested',
      },
      {
        id: 'bre-a2',
        category: 'measured',
        title: 'The placebo groups improved by about 17 points; the drug added 3.77 and 5.32',
        laymanSummary:
          'In the two trials that worked, agitation scores fell by around 22 points on the drug and around 17 on placebo. Most of the improvement in these trials happened in people taking nothing.',
        technicalDetails:
          'NCT01862640 enrolled 433 patients with a mean age of 74 and measured change in Cohen-Mansfield Agitation Inventory total score at week 12. The 2 mg group changed by -21.6 against -17.8 on placebo, a least-squares mean difference of -3.77 (95% CI -7.38 to -0.17), p=0.0404. NCT03548584 enrolled 345 patients and gave -22.6 on the combined 2 mg and 3 mg arm against -17.3 on placebo, difference -5.32 (95% CI -8.77 to -1.87), p=0.0026. The CMAI runs from 29 to 203. The placebo improvements of 17.8 and 17.3 points are three to five times the size of the drug increment, and the confidence interval in the first trial reaches -0.17, which is to say it excludes no benefit by seventeen hundredths of a point. Both facts are compatible with a real drug effect. Neither is compatible with describing the drug as the source of the improvement patients experience.',
        evidenceSource:
          'NCT01862640 and NCT03548584 — posted results; United States prescribing information section 14.3',
        measuredMetric:
          'Least-squares mean CMAI difference against placebo at week 12: -3.77 (95% CI -7.38 to -0.17) and -5.32 (95% CI -8.77 to -1.87), against placebo improvements of 17.8 and 17.3 points',
        auditFlag: 'verified',
      },
      {
        id: 'bre-a3',
        category: 'failed',
        title: 'A third agitation trial failed, and so did one dose arm of a successful one',
        laymanSummary:
          'Three trials tested this drug for agitation in dementia. One of them found nothing, and in another the lower amount tested was identical to placebo.',
        technicalDetails:
          'NCT01922258, a phase 3 twelve-week flexible-dose trial in 270 patients, gave a CMAI change of -18.9 against -16.5 on placebo, a difference of -2.34 (95% CI -5.49 to 0.82), p=0.1454. In NCT01862640, the 1 mg fixed-dose arm gave -17.6 against -17.8 on placebo, a difference of +0.23 (95% CI -3.40 to 3.86), p=0.9015 — a result numerically favouring placebo. So of four active arms across three trials and 1,048 patients, two separated and two did not, and the label describes the indication as demonstrated in two studies without the third appearing in the efficacy section. All three results are posted on ClinicalTrials.gov.',
        evidenceSource:
          'NCT01922258 and NCT01862640 — posted results, Otsuka Pharmaceutical Development & Commercialization',
        measuredMetric:
          'CMAI difference against placebo: -2.34 (p=0.1454) in the flexible-dose trial and +0.23 (p=0.9015) in the 1 mg fixed-dose arm',
        auditFlag: 'caution',
      },
      {
        id: 'bre-a4',
        category: 'measured',
        title: 'The weakest measured effect on positive symptoms of 32 antipsychotics',
        laymanSummary:
          'A network meta-analysis of 402 studies and 53,463 patients ranked how much each antipsychotic reduced hallucinations and delusions. Brexpiprazole came last.',
        technicalDetails:
          "In the Huhn network meta-analysis, standardised mean differences against placebo for reduction of positive symptoms, across 31,179 participants, varied from -0.69 (95% CrI -0.86 to -0.52) for amisulpride at the strongest end to -0.17 (95% CrI -0.31 to -0.04) for brexpiprazole at the weakest. The interval still excludes zero, so the effect is present rather than absent. The authors' overall interpretation is that efficacy differences between antipsychotics are mostly gradual rather than discrete and that differences in side-effects are more marked, and they note the confidence in the evidence was often low or very low. What is not gradual is the price: brexpiprazole is a brand-only product at about fifty dollars a tablet, and the drug at the strongest end of the same ranking, amisulpride, is a generic that the United States has never approved as an antipsychotic at all.",
        evidenceSource: 'Huhn M et al., Lancet 2019;394:939-951',
        doi: '10.1016/S0140-6736(19)31135-3',
        measuredMetric:
          'Standardised mean difference against placebo for positive symptom reduction: -0.17 (95% CrI -0.31 to -0.04), weakest of 32 drugs',
        auditFlag: 'verified',
      },
      {
        id: 'bre-a5',
        category: 'failed',
        title: 'In the depression programme the lower dose failed and the higher gave 1.52 points',
        laymanSummary:
          'A 1,539-patient trial tested two amounts of brexpiprazole added to an antidepressant. The lower one did not beat placebo. The higher one did, by about one and a half points on a depression scale.',
        technicalDetails:
          'NCT01360632, a phase 3 fixed-dose adjunctive trial in 1,539 patients, measured change in MADRS total score from the end of an eight-week antidepressant lead-in to week 14. The 1 mg arm changed by -7.65 against -6.45 on placebo, difference -1.19 (95% CI -2.58 to 0.20), p=0.0925. The 3 mg arm changed by -7.98, difference -1.52 (95% CI -2.92 to -0.13), p=0.0327. A 1.52-point MADRS difference on a 60-point scale is at the low end of what has ever supported an antidepressant-adjunct indication, and the lower dose arm of the same trial did not reach significance at all.',
        evidenceSource:
          'NCT01360632 — phase 3 fixed-dose trial of brexpiprazole as adjunctive therapy in major depressive disorder, posted results',
        measuredMetric:
          'MADRS difference against placebo: -1.19 (95% CI -2.58 to 0.20), p=0.0925 for the 1 mg arm and -1.52 (95% CI -2.92 to -0.13), p=0.0327 for the 3 mg arm',
        auditFlag: 'caution',
      },
      {
        id: 'bre-a6',
        category: 'measured',
        title: 'In one trial the approved active comparator did not beat placebo either',
        laymanSummary:
          'A 2,182-patient trial compared brexpiprazole, extended-release quetiapine and placebo, all added to an antidepressant. Quetiapine, which already had that indication, did not separate from placebo.',
        technicalDetails:
          'NCT01727726 was a phase 3 placebo- and active-controlled flexible-dose trial in 2,182 patients. Least-squares mean MADRS changes were -6.04 on brexpiprazole, -4.86 on extended-release quetiapine and -4.57 on placebo. The posted analyses give brexpiprazole against quetiapine as a difference of -1.48 (95% CI -2.56 to -0.39), p=0.0078, and quetiapine against placebo as -0.30 (95% CI -1.63 to 1.04), p=0.6642. A drug-against-placebo analysis for the primary endpoint is not among the posted analyses on the registry record. An active comparator that fails to separate from placebo is the classic sign of a trial with poor assay sensitivity, and in a field where placebo response is the dominant source of variance it is a reason to treat any comparison drawn inside that trial with caution — including the favourable one.',
        evidenceSource:
          'NCT01727726 — phase 3 placebo- and active-controlled trial of flexible-dose brexpiprazole as adjunctive therapy in major depressive disorder, posted results',
        measuredMetric:
          'MADRS: -6.04 on brexpiprazole, -4.86 on extended-release quetiapine, -4.57 on placebo; quetiapine against placebo -0.30 (95% CI -1.63 to 1.04), p=0.6642',
        auditFlag: 'caution',
      },
      {
        id: 'bre-a7',
        category: 'inferred',
        title: 'Lower intrinsic activity was the design goal, not a demonstrated outcome',
        laymanSummary:
          'Brexpiprazole was built to turn the dopamine receptor on less strongly than aripiprazole does, so as to cause less restlessness. The molecules have never been compared in a trial.',
        technicalDetails:
          'The structural change from aripiprazole is the substitution of a benzothiophene for a dichlorophenyl group on the arylpiperazine, and it lowers intrinsic activity at D2 in functional assays. That is a laboratory measurement and it is real. The clinical claim built on it is that patients experience less akathisia, and it rests on cross-trial comparison of separate registration programmes rather than on any head-to-head randomised trial. Meanwhile the same reduction in intrinsic activity is a candidate explanation for the drug placing last of 32 on positive symptom reduction. The design goal and the efficacy result may be two views of the same property, and a head-to-head trial against generic aripiprazole — which costs about one three-hundred-eightieth as much — has never been run.',
        evidenceSource:
          'Huhn M et al., Lancet 2019;394:939-951; United States prescribing information for REXULTI, section 12.1',
        doi: '10.1016/S0140-6736(19)31135-3',
        inferredClaim:
          'That brexpiprazole is better tolerated than aripiprazole — the comparison is between separate trial programmes, not between randomised arms',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A once-daily tablet',
        laymanDesc:
          'Brexpiprazole is a tablet taken once a day. For agitation in dementia the label is explicit that it is not to be used as an as-needed treatment when someone is agitated.',
        molecularDetail:
          'The Limitations of Use in section 1 state that REXULTI is not indicated as an as-needed treatment for agitation associated with dementia due to Alzheimer disease. In the registration trials it was introduced over two to four weeks of stepped increases before the target amount was reached, and the endpoint was measured at twelve weeks.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It crosses into the brain and is cleared by two liver enzymes',
        laymanDesc:
          'The drug reaches the brain and is broken down by two liver enzymes, one of which varies substantially between people for genetic reasons.',
        molecularDetail:
          'Metabolism is primarily by CYP2D6 and CYP3A4, and the label carries amount adjustments for CYP2D6 poor metabolisers and for concurrent strong inhibitors of either enzyme. In an elderly population taking several other medicines, which is the population of the newest indication, that interaction surface is larger than it is in the schizophrenia population the pharmacokinetics were first described in.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It turns the dopamine receptor partly on, less than aripiprazole does',
        laymanDesc:
          'Like aripiprazole it occupies the dopamine receptor and produces a weak signal instead of blocking it entirely. It was engineered to produce a weaker signal still.',
        molecularDetail:
          'Partial agonism at D2 with lower intrinsic activity than aripiprazole, partial agonism at 5-HT1A and antagonism at 5-HT2A, with alpha-1B and alpha-2C antagonism. Section 12.1 states the mechanism in major depressive disorder or schizophrenia is unknown and offers this combination as a possible mediator rather than an established one.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'In a brain with Alzheimer disease the same receptors are in different tissue',
        laymanDesc:
          "The newest indication gives this drug to people whose brains are progressively degenerating. The receptors it acts on are still there, but the tissue around them, and the person's ability to report a side effect, are not what they were in the schizophrenia trials.",
        molecularDetail:
          'The agitation trials enrolled patients with probable Alzheimer disease by NINCDS-ADRDA criteria and Mini-Mental State Examination scores between 5 and 22, mean age 74, range 51 to 90. The class mortality evidence in this population, restated in section 5.1, is a death rate of about 4.5% against 2.6% on placebo over a typical ten-week trial, with most deaths cardiovascular or infectious.',
        iconName: 'AlertTriangle',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Agitation falls a few points beyond placebo, symptoms fall least of 32 drugs',
        laymanDesc:
          'In dementia agitation the drug adds three to five points on top of a seventeen-point placebo improvement. In schizophrenia it produced the smallest measured effect on hallucinations and delusions of any antipsychotic in a 32-drug comparison.',
        molecularDetail:
          'CMAI differences against placebo of -3.77 (95% CI -7.38 to -0.17) and -5.32 (95% CI -8.77 to -1.87) in the two positive trials. Positive symptom standardised mean difference of -0.17 (95% CrI -0.31 to -0.04) in the 32-drug network, the weakest included. MADRS difference of -1.52 points in the positive arm of the fixed-dose adjunctive depression trial.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'NCT01862640',
        phase: 'Phase 3, 12-week randomised double-blind placebo-controlled fixed-dose trial',
        sampleSize: 433,
        primaryEndpoint:
          'Change from baseline in Cohen-Mansfield Agitation Inventory total score at week 12, in agitation associated with dementia due to Alzheimer disease',
        endpointMet: true,
        statisticalPValue:
          '2 mg arm -21.6 against placebo -17.8, difference -3.77 (95% CI -7.38 to -0.17), p=0.0404; 1 mg arm -17.6, difference +0.23 (95% CI -3.40 to 3.86), p=0.9015',
        unreportedAdverseSignals:
          'One of the two active arms was numerically worse than placebo. The upper confidence limit for the successful arm is -0.17, which excludes no effect by seventeen hundredths of a point on a 29-to-203 scale.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'NCT03548584',
        phase: 'Phase 3, 12-week randomised double-blind placebo-controlled fixed-dose trial',
        sampleSize: 345,
        primaryEndpoint:
          'Change from baseline to week 12 in Cohen-Mansfield Agitation Inventory total score, in agitation associated with dementia due to Alzheimer disease',
        endpointMet: true,
        statisticalPValue:
          'Combined 2 mg and 3 mg arm -22.6 against placebo -17.3, difference -5.32 (95% CI -8.77 to -1.87), p=0.0026',
        unreportedAdverseSignals:
          'The two active amounts were pooled into a single arm for the primary comparison, so the trial does not report whether either separated from placebo on its own.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'NCT01922258',
        phase: 'Phase 3, 12-week randomised double-blind placebo-controlled flexible-dose trial',
        sampleSize: 270,
        primaryEndpoint:
          'Change from baseline to week 12 or early termination in Cohen-Mansfield Agitation Inventory total score',
        endpointMet: false,
        statisticalPValue:
          '-18.9 against placebo -16.5, difference -2.34 (95% CI -5.49 to 0.82), p=0.1454',
        unreportedAdverseSignals:
          'This trial does not appear in the efficacy description in section 14.3 of the label, which states the indication was demonstrated in two studies.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'NCT01360632',
        phase: 'Phase 3 randomised double-blind placebo-controlled fixed-dose adjunctive trial',
        sampleSize: 1539,
        primaryEndpoint:
          'Mean change in MADRS total score from the end of the eight-week antidepressant lead-in to week 14, brexpiprazole added to an antidepressant in major depressive disorder',
        endpointMet: true,
        statisticalPValue:
          '1 mg arm difference -1.19 (95% CI -2.58 to 0.20), p=0.0925; 3 mg arm difference -1.52 (95% CI -2.92 to -0.13), p=0.0327',
        unreportedAdverseSignals:
          'Only the higher of two arms separated, at a 1.52-point difference on a 60-point scale.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'NCT01727726',
        phase: 'Phase 3 randomised double-blind placebo- and active-controlled flexible-dose trial',
        sampleSize: 2182,
        primaryEndpoint:
          'Change in MADRS total score with brexpiprazole or extended-release quetiapine added to an antidepressant, against placebo',
        endpointMet: true,
        statisticalPValue:
          'MADRS -6.04 on brexpiprazole, -4.86 on extended-release quetiapine, -4.57 on placebo; brexpiprazole against quetiapine -1.48 (95% CI -2.56 to -0.39), p=0.0078; quetiapine against placebo -0.30 (95% CI -1.63 to 1.04), p=0.6642',
        unreportedAdverseSignals:
          'The active comparator, which holds this indication itself, did not separate from placebo, which is the standard sign of a trial with weak assay sensitivity. No drug-against-placebo analysis for the primary endpoint appears among the posted analyses.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Huhn 32-drug network meta-analysis',
        phase: 'Network meta-analysis of 402 studies',
        sampleSize: 53463,
        primaryEndpoint:
          'Change in overall symptoms against placebo in adults with multi-episode schizophrenia, with positive symptoms, negative symptoms, discontinuation, weight, prolactin and QTc as further outcomes',
        endpointMet: true,
        statisticalPValue:
          'Brexpiprazole standardised mean difference for positive symptoms -0.17 (95% CrI -0.31 to -0.04), the weakest of the 32 drugs, against -0.69 (95% CrI -0.86 to -0.52) for amisulpride',
        unreportedAdverseSignals:
          'The authors state that confidence in the evidence was often low or very low, and that efficacy differences between antipsychotics are mostly gradual rather than discrete.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'CMAI differences against placebo of -3.77 (95% CI -7.38 to -0.17) and -5.32 (95% CI -8.77 to -1.87) at twelve weeks in dementia agitation',
        'Placebo-group CMAI improvements of 16.5, 17.3 and 17.8 points across the three agitation trials',
        'A positive-symptom standardised mean difference of -0.17 (95% CrI -0.31 to -0.04), the weakest of 32 antipsychotics across 402 studies',
        'A MADRS difference of -1.52 points (95% CI -2.92 to -0.13) for the 3 mg adjunctive depression arm, with the 1 mg arm at p=0.0925',
        'Extended-release quetiapine failing to separate from placebo in the same trial that measured brexpiprazole (p=0.6642)',
      ],
      unsupportedInferences: [
        'That the class mortality risk in dementia does not apply to this indication — the boxed warning was narrowed by wording, not by mortality evidence in that population',
        'That brexpiprazole causes less akathisia than aripiprazole — the two have never been compared in a randomised trial',
        'That the improvement seen by families in the agitation trials is the drug — placebo groups improved by three to five times the drug increment',
        'That its price reflects a clinical advantage over generic aripiprazole — no head-to-head trial of the two exists',
      ],
      whatFailedInitially: [
        "NCT01922258, the 270-patient flexible-dose agitation trial, returned p=0.1454 and does not appear in the label's efficacy section",
        'The 1 mg arm of NCT01862640 was numerically worse than placebo, at p=0.9015',
        'The 1 mg arm of the fixed-dose adjunctive depression trial did not reach significance, at p=0.0925',
      ],
      realWorldOutcome: [
        'About fifty dollars a tablet at United States pharmacy acquisition cost, across 6 listed brand products',
        'The first and so far only drug approved in the United States for agitation associated with dementia due to Alzheimer disease',
        'A boxed warning about increased death in dementia that now contains a written exception for that indication',
        'A label limitation stating explicitly that it is not to be used as an as-needed treatment when agitation occurs',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet taken once daily',
      description:
        "There is no injectable and no long-acting form. The label's Limitations of Use state that it is not indicated as an as-needed treatment for agitation associated with dementia due to Alzheimer disease, which matters because as-needed use is how antipsychotics are most often given for agitation in practice. Metabolism is primarily by CYP2D6 and CYP3A4, with label adjustments for CYP2D6 poor metabolisers and for strong inhibitors of either enzyme.",
      safetyProfile:
        'The United States label carries boxed warnings for increased mortality in elderly patients with dementia-related psychosis and for suicidal thoughts and behaviours in children, adolescents and young adults. The first of these now states that the drug is not approved for dementia-related psychosis without agitation associated with dementia due to Alzheimer disease. Section 5.1 restates the class evidence: about 4.5% death on drug against about 2.6% on placebo over a typical ten-week trial, risk 1.6 to 1.7 times placebo, most deaths cardiovascular or infectious. Akathisia and weight gain are the characteristic adverse reactions. Neuroleptic malignant syndrome, tardive dyskinesia, metabolic changes, leukopenia, neutropenia and agranulocytosis, orthostatic hypotension, seizures, dysphagia and cognitive and motor impairment are all in the label.',
    },
    commonQuestions: [
      {
        q: 'Is it safe to give an antipsychotic to someone with dementia?',
        a: 'The label answers that question twice, in two different directions. The boxed warning states that elderly patients with dementia-related psychosis treated with antipsychotic drugs are at increased risk of death, and section 5.1 gives the figures: about 4.5% died on drug against about 2.6% on placebo over a typical ten-week trial, a risk 1.6 to 1.7 times placebo, most deaths cardiovascular or infectious. The same boxed warning then states that the drug is not approved for dementia-related psychosis "without agitation associated with dementia due to Alzheimer\'s disease" — a sentence that carves the approved indication out of the warning\'s scope. No new mortality evidence in that specific population accompanied that wording. The two twelve-week trials behind the indication were designed to measure agitation, not to measure death.',
        auditNote:
          'The class mortality evidence and the indication carve-out appear in the same boxed warning.',
      },
      {
        q: 'How much does it actually reduce agitation?',
        a: 'In the two trials that worked, by 3.77 and 5.32 points on the Cohen-Mansfield Agitation Inventory, a scale running from 29 to 203. What sits underneath those numbers matters more: placebo groups in the same trials improved by 17.8 and 17.3 points. So roughly three quarters to four fifths of the improvement measured in these trials happened in people receiving no drug. In a third trial, of 270 patients, the difference was 2.34 points and did not reach significance, and in the lower dose arm of one of the successful trials the drug was numerically worse than placebo. A real effect and a small one, on top of a large non-drug effect.',
        auditNote: 'The upper confidence limit in the first positive trial was -0.17 points.',
      },
      {
        q: 'How does it compare to aripiprazole, which is generic?',
        a: "Nobody has run the trial. Brexpiprazole is the same class of drug from the same company, engineered to turn the dopamine receptor on less strongly, and it costs about fifty dollars a tablet against about thirteen cents for generic aripiprazole. The tolerability claim — less akathisia — comes from comparing separate trial programmes rather than randomised arms. On measured efficacy, brexpiprazole placed last of 32 antipsychotics for positive symptom reduction in a 402-study network, at -0.17 against amisulpride's -0.69. Lower intrinsic activity was the design goal and may also be the reason for that placement; the two possibilities have never been separated by a trial.",
      },
      {
        q: 'Why does the label say not to use it when someone becomes agitated?',
        a: 'Because it was never tested that way. The Limitations of Use in section 1 state that it is not indicated as an as-needed treatment for agitation associated with dementia due to Alzheimer disease. In the trials it was introduced over two to four weeks of stepped increases and the endpoint was measured at twelve weeks, so what was demonstrated is a change in average agitation over three months of continuous treatment, not an effect on an episode as it happens. As-needed use is how antipsychotics are most often given for agitation in practice, which makes this limitation one of the more consequential sentences on the label.',
      },
      {
        q: 'Why does this page show a price but no manufacturing cost?',
        a: "Because no verifiable per-dose cost of production for brexpiprazole could be found and cited. The figure quoted comes from the CMS National Average Drug Acquisition Cost survey, which records what United States pharmacies pay to acquire a drug. That is a price, not a cost of manufacture, and for a brand-only product the gap between them is unknown from public data. The synthesis is one alkylation between two purchased fragments followed by a crystallisation — the same disconnection as aripiprazole's, which now sells for about thirteen cents — but a route is not a cost figure.",
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Huhn M et al. Comparative efficacy and tolerability of 32 oral antipsychotics for the acute treatment of adults with multi-episode schizophrenia: a systematic review and network meta-analysis. Lancet 2019;394:939-951',
        identifier: '10.1016/S0140-6736(19)31135-3',
        kind: 'doi',
      },
      {
        label:
          'NCT01862640 — 12-week fixed-dose trial of brexpiprazole in agitation associated with dementia due to Alzheimer disease, posted results',
        identifier: 'NCT01862640',
        kind: 'nct',
      },
      {
        label:
          'NCT03548584 — 12-week fixed-dose trial of brexpiprazole 2 mg and 3 mg in agitation associated with dementia due to Alzheimer disease, posted results',
        identifier: 'NCT03548584',
        kind: 'nct',
      },
      {
        label:
          'NCT01922258 — 12-week flexible-dose trial of brexpiprazole in agitation associated with dementia, posted results showing p=0.1454',
        identifier: 'NCT01922258',
        kind: 'nct',
      },
      {
        label:
          'NCT01360632 — phase 3 fixed-dose trial of brexpiprazole as adjunctive therapy in major depressive disorder, posted results',
        identifier: 'NCT01360632',
        kind: 'nct',
      },
      {
        label:
          'NCT01727726 — phase 3 placebo- and active-controlled trial of flexible-dose brexpiprazole as adjunctive therapy in major depressive disorder, posted results',
        identifier: 'NCT01727726',
        kind: 'nct',
      },
      {
        label:
          'United States prescribing information for REXULTI (brexpiprazole), Boxed Warning, sections 1, 5.1, 12.1 and 14.3, via the openFDA drug label endpoint',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22brexpiprazole%22',
        kind: 'regulatory',
      },
      {
        label: 'Drugs@FDA: REXULTI (brexpiprazole), NDA 205422, original approval 10 July 2015',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=205422',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 11978813 — brexpiprazole structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/11978813',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 12. Chlorpromazine — the drug that emptied the asylums, still labelled for hiccups, tetanus
  //     and hyperactive one-year-olds, and still ahead of two drugs approved half a century later.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'chlorpromazine',
    name: 'Chlorpromazine',
    tradeName: 'Thorazine',
    sponsor:
      'Synthesised at Rhône-Poulenc in France in 1950 and licensed in the United States to Smith, Kline & French, whose successor company is now GlaxoSmithKline; the molecule has been generic for decades and the current pricing survey lists 89 products',
    targetGene: 'DRD2',
    targetProtein:
      'Dopamine D2 receptor, blocked alongside a very wide range of other targets. The label describes strong antiadrenergic and weaker peripheral anticholinergic activity, slight ganglionic blocking action, and slight antihistaminic and antiserotonin activity, and states plainly that the precise mechanism by which its therapeutic effects are produced is not known.',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1957,
    indication:
      'Management of manifestations of psychotic disorders; schizophrenia; nausea and vomiting; relief of restlessness and apprehension before surgery; acute intermittent porphyria; adjunct in the treatment of tetanus; the manic type of manic-depressive illness; intractable hiccups; severe behavioural problems in children aged 1 to 12 marked by combativeness or explosive hyperexcitable behaviour; and short-term treatment of hyperactive children with conduct disorder',
    patientFriendlyIndication:
      'Psychosis and schizophrenia, and a long list of other uses including severe nausea, hiccups that will not stop, and agitation',
    anatomicalSite:
      'Subcortical structures of the central nervous system, per the label, together with adrenergic, cholinergic, histaminergic and serotonergic receptors throughout the body — which is why its adverse effects reach the skin, the eyes, the blood pressure and the gut',
    conditionContext: {
      conditionExplainer:
        'Chlorpromazine is where this entire field begins. Before 1952 there was no drug that reduced hallucinations and delusions. Within a decade of its introduction the population of psychiatric institutions in several countries began falling, and every antipsychotic since has been developed, tested and marketed against it.',
      whyItMatters:
        "Its label is a document from a different regulatory era, and reads like one. It carries indications for tetanus, porphyria, intractable hiccups and hyperactive children, and it describes its own mechanism as not known. It is also on the World Health Organization's Model List of Essential Medicines and is one of the most widely available antipsychotics on earth.",
      whoTakesThis:
        'People with schizophrenia and acute psychosis, particularly where cost or availability rules out anything newer; and people with severe nausea, vomiting or intractable hiccups, which is what a large share of current use is actually for.',
      clinicalGoals:
        'The randomised evidence base is a Cochrane review of 55 trials whose primary outcomes were death, violent behaviour, overall improvement, relapse and satisfaction with care — outcomes chosen by reviewers rather than by a sponsor, and much harder than the six-week rating scales that license modern drugs.',
    },
    oneSentenceVerdict:
      'The first antipsychotic, which in a Cochrane review of 55 randomised trials produced global improvement against placebo at a risk ratio of 0.71 on evidence the reviewers graded very low, ranked twelfth of fifteen antipsychotics on pooled symptom reduction and still above lurasidone and iloperidone, carries a weight-gain risk ratio of 4.92 that contradicts the usual first-generation story, and holds a United States label listing tetanus, porphyria, intractable hiccups and hyperactive one-year-olds among its approved uses.',
    laymanHowItWorks:
      'Chlorpromazine blocks the dopamine receptor, which is what reduces hallucinations and delusions, and it was the discovery of that effect in this molecule that produced the whole dopamine theory of psychosis. But it was not designed to do that: it was developed as an antihistamine for surgical anaesthesia, and it blocks a great many other receptors as well. It blocks the adrenaline receptors that hold blood pressure up, the acetylcholine receptors that keep the mouth wet and the gut moving, and the histamine receptors that keep a person awake. The label says the precise mechanism of its therapeutic effect is not known, and that has been true since 1952.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 56,
    substitutes: {
      summary:
        'Chlorpromazine costs about thirty-nine cents a tablet at United States pharmacy acquisition cost, which is more than haloperidol and more than four of the second-generation drugs on this site. Its place is not defined by price in the United States; it is defined by availability everywhere else, and by a set of non-psychiatric indications no newer antipsychotic holds.',
      conventionalRx: [
        {
          name: 'Haloperidol (Haldol)',
          class: 'First-generation butyrophenone antipsychotic',
          howItCompares:
            "The other first-generation benchmark, and the more selective of the two: haloperidol blocks D2 and little else, chlorpromazine blocks D2 alongside adrenergic, cholinergic, histaminergic and serotonergic receptors. Haloperidol ranked seventh of fifteen on symptom reduction against chlorpromazine's twelfth (SMD 0.45 versus 0.38), causes more movement disorders and far less sedation, weight gain and blood-pressure drop.",
          typicalCost:
            'US$0.1579 per tablet at pharmacy acquisition cost, median across 107 listed generic products (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: cheaper, a higher efficacy rank, an injectable depot, and no anticholinergic burden. Cons: the highest extrapyramidal odds ratio of the fifteen drugs ranked.',
        },
        {
          name: 'Olanzapine (Zyprexa)',
          class: 'Second-generation antipsychotic, multi-receptor antagonist',
          howItCompares:
            "Pharmacologically the closest modern relative — a broad multi-receptor blocker with heavy antihistaminic and anticholinergic activity — and the drug chlorpromazine most resembles in side-effect profile. It ranked third of fifteen against chlorpromazine's twelfth (SMD 0.59 versus 0.38) and costs less than half as much per tablet in the United States.",
          typicalCost:
            'US$0.1432 per tablet at pharmacy acquisition cost, median across 167 listed generic products (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: a substantially better measured effect on symptoms, no photosensitivity, no skin or eye pigmentation. Cons: the worst weight gain of the fifteen — although the Cochrane weight-gain risk ratio for chlorpromazine is 4.92, so the difference here is smaller than the first-generation story implies.',
        },
        {
          name: 'Prochlorperazine',
          class: 'Phenothiazine used mainly as an antiemetic',
          howItCompares:
            "The relevant comparison for the non-psychiatric half of chlorpromazine's label. Both are phenothiazines and both block D2 in the chemoreceptor trigger zone, which is the antiemetic mechanism; prochlorperazine is used almost exclusively for nausea and vertigo and chlorpromazine keeps a psychiatric licence as well.",
          typicalCost:
            'Generic prochlorperazine is listed in the CMS National Average Drug Acquisition Cost survey cited on this page',
          prosAndCons:
            'Pros: the same antiemetic mechanism with less sedation and less blood-pressure effect. Cons: the same movement-disorder and tardive dyskinesia risks as any dopamine blocker, which is under-appreciated for a drug used as an antiemetic.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Stay out of strong sun and use protection',
          action:
            'The label states that allergic reactions of a mild urticarial type or photosensitivity are seen, and instructs directly: avoid undue exposure to sun.',
          patientImpact:
            'Beyond sunburn, prolonged treatment at substantial amounts has produced skin pigmentation restricted to sun-exposed areas, described in the label as ranging from almost imperceptible darkening to a slate-grey colour, sometimes with a violet hue.',
          clinicalPrecaution:
            'The pigmentation described in the label occurred in patients taking large amounts for three years or more. Sun protection is a sensible response to a labelled photosensitivity, not a treatment for anything.',
        },
        {
          name: 'Ask for an eye examination if treatment continues for years',
          action:
            'The label records ocular changes occurring more frequently than skin pigmentation, in patients treated for two years or more, and suggests that long-term treatment be accompanied by monitoring for them.',
          patientImpact:
            'The changes are deposits of fine particulate matter in the lens and cornea, with star-shaped opacities in the anterior lens in more advanced cases, and epithelial keratopathy and pigmentary retinopathy have been reported. A small number of patients with more severe changes had some visual impairment. The label states the eye lesions may regress after the drug is withdrawn.',
          clinicalPrecaution:
            'This is a reason to ask for a slit-lamp examination during long-term treatment, not a reason to change anything independently. The label notes the nature of the eye deposits has not yet been determined.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CN(C)CCCN1C2=CC=CC=C2SC3=C1C=C(C=C3)Cl',
      chemicalFormula: 'C17H19ClN2S',
      molecularWeight: '318.90 g/mol',
      targetReceptorAffinity:
        'A broad-spectrum antagonist rather than a selective one. The label describes strong antiadrenergic activity, weaker peripheral anticholinergic activity, relatively slight ganglionic blocking action, and slight antihistaminic and antiserotonin activity, alongside the dopamine blockade that produces the antipsychotic effect. The three-carbon dimethylaminopropyl side chain on the phenothiazine nitrogen is the feature that makes it an antipsychotic rather than an antihistamine; promethazine, its close relative, carries a branched two-carbon chain and is an antihistamine with no antipsychotic effect. That one structural difference is where this drug class began.',
      structureSource: {
        label: 'PubChem CID 2726 (chlorpromazine) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2726',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'cpz-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Incoming control of 2-chlorophenothiazine and the aminopropyl side chain',
          description:
            "Confirm identity and purity of 2-chlorophenothiazine and of 3-dimethylaminopropyl chloride. The position of the chlorine on the phenothiazine ring is not decorative: the 2-chloro isomer is chlorpromazine's precursor and other positional isomers give compounds with different activity, and they are not distinguished by molecular weight.",
          reagentsAndBuffer:
            '2-chlorophenothiazine reference standard, 3-dimethylaminopropyl chloride hydrochloride, reversed-phase HPLC with UV and mass detection, 1H NMR for ring substitution pattern, Karl Fischer titration',
        },
        {
          id: 'cpz-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'N-alkylation of the phenothiazine nitrogen with the dimethylaminopropyl chain',
          description:
            'Deprotonate the phenothiazine nitrogen and alkylate it with the dimethylaminopropyl chloride. The chain length is the whole story of this molecule: a three-carbon straight chain gives an antipsychotic, and the branched two-carbon chain of promethazine gives an antihistamine with no antipsychotic effect at all.',
          dependsOnStepId: 'cpz-w1',
          reagentsAndBuffer:
            'Sodium amide or sodium hydride as base, xylene or toluene under nitrogen at reflux, aqueous work-up, hydrogen chloride for salt formation',
        },
        {
          id: 'cpz-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Hydrochloride crystallisation with light and oxygen exclusion',
          description:
            'Crystallise the hydrochloride and handle it under protection from light. Phenothiazines oxidise readily to sulfoxides and to coloured radical species, which is why chlorpromazine solutions discolour and why the label instructs that discoloured solutions not be used. Oxidation products are impurities with their own toxicology, not simply a cosmetic change.',
          dependsOnStepId: 'cpz-w2',
          reagentsAndBuffer:
            'Isopropanol or ethanol with hydrogen chloride, amber glassware and nitrogen blanketing, HPLC assay for chlorpromazine sulfoxide and related oxidation products, powder X-ray diffraction',
        },
        {
          id: 'cpz-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Exposure and first-pass characterisation before comparing anything to it',
          description:
            'Establish the concentration-time profile and the extent of first-pass metabolism. This matters more for chlorpromazine than for most drugs on this site because chlorpromazine is the historical reference against which other antipsychotics have been dose-equated, and every chlorpromazine-equivalence table in the literature depends on the exposure a given oral amount actually produces.',
          dependsOnStepId: 'cpz-w3',
          reagentsAndBuffer:
            'Serial plasma sampling, LC-MS/MS with deuterated chlorpromazine internal standard, 7-hydroxychlorpromazine and chlorpromazine sulfoxide reference standards, CYP2D6 genotyping, protein binding by equilibrium dialysis',
        },
        {
          id: 'cpz-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'A full off-target panel, because this molecule is defined by its off-targets',
          description:
            "Run dopamine, adrenergic, muscarinic, histaminergic and serotonergic panels together and report all of them. For a selective drug an off-target panel is a safety screen; for chlorpromazine it is the pharmacology. The label's own description — strong antiadrenergic, weaker anticholinergic, slight antihistaminic and antiserotonin — is a list of the receptors that generate its adverse effects, and they cannot be treated as a footnote to the D2 result.",
          dependsOnStepId: 'cpz-w4',
          reagentsAndBuffer:
            'Membranes expressing human D1 and D2, alpha-1 and alpha-2 adrenergic, M1 to M5 muscarinic, H1 histaminergic and 5-HT2A receptors, radioligand competition binding across the full panel, haloperidol as a selective D2 reference, scintillation counting',
        },
      ],
    },
    keyAudits: [
      {
        id: 'cpz-a1',
        category: 'measured',
        title: 'Fifty-five randomised trials, and the evidence graded very low',
        laymanSummary:
          'The Cochrane review of chlorpromazine against placebo pooled 55 randomised trials. It found the drug works. It also states in its own results section that the quality of the evidence is very low.',
        technicalDetails:
          'Adams and colleagues inspected over 1,100 electronic records and included 55 randomised trials, excluding 315. Chlorpromazine produced a global improvement in symptoms and functioning against placebo, risk ratio 0.71 (95% CI 0.58 to 0.86) across 1,164 participants in 14 trials. Fewer people allocated to chlorpromazine left trials early, risk ratio 0.64 (95% CI 0.53 to 0.78) across 1,831 participants in 27 trials. It reduced the number of participants relapsing over six months to two years, risk ratio 0.65 (95% CI 0.47 to 0.90) across 512 participants in 3 trials, though the reviewers note the data were heterogeneous and that no difference was found in relapse rates in the short, medium or long term over two years. The reviewers\' verdict on the whole body of evidence is that its quality is very low, and their conclusion is that chlorpromazine is "a well-established but imperfect treatment" whose benchmark position is not threatened by their findings. Half a century of use and 55 trials produced a very-low-quality evidence base, which is a fact about how this field ran its trials rather than about this molecule.',
        evidenceSource:
          'Adams CE, Awad GA, Rathbone J, Thornley B, Soares-Weiser K. Chlorpromazine versus placebo for schizophrenia. Cochrane Database Syst Rev 2014;(1):CD000284',
        doi: '10.1002/14651858.CD000284.pub3',
        measuredMetric:
          'Risk ratio 0.71 (95% CI 0.58 to 0.86) for global improvement against placebo, on evidence the reviewers graded very low',
        auditFlag: 'verified',
      },
      {
        id: 'cpz-a2',
        category: 'conclusion_shift',
        title:
          'A weight-gain risk ratio of 4.92, in a drug the class story calls metabolically clean',
        laymanSummary:
          'Second-generation antipsychotics are described as the ones that cause weight gain. In the Cochrane review, chlorpromazine — a 1950s drug — had a nearly five-fold risk ratio for considerable weight gain against placebo.',
        technicalDetails:
          "The Cochrane review reports considerable weight gain at a risk ratio of 4.92 (95% CI 2.32 to 10.43) across 165 participants in 5 trials, alongside clear sedation at 2.79 (95% CI 2.25 to 3.45) in 1,627 participants across 23 trials, acute movement disorders at 3.47 (95% CI 1.50 to 8.03), parkinsonism at 2.11 (95% CI 1.59 to 2.80), and lowered blood pressure with dizziness at 2.38 (95% CI 1.74 to 3.25). Akathisia did not occur more often than on placebo. The weight-gain figure rests on only 165 participants and its confidence interval is wide, so the point estimate should not be over-read — but the direction is unambiguous and it sits awkwardly beside a generational story in which metabolic effects arrived with the atypicals. Chlorpromazine's receptor profile predicts it: heavy histamine H1 and 5-HT2C blockade is the same combination that drives weight gain with olanzapine and quetiapine.",
        evidenceSource: 'Adams CE et al., Cochrane Database Syst Rev 2014;(1):CD000284',
        doi: '10.1002/14651858.CD000284.pub3',
        inferredClaim:
          'That weight gain and metabolic disturbance are distinctive to second-generation antipsychotics — the pooled risk ratio for considerable weight gain with chlorpromazine is 4.92',
        auditFlag: 'verified',
      },
      {
        id: 'cpz-a3',
        category: 'measured',
        title: 'Twelfth of fifteen, and still above two drugs approved fifty years later',
        laymanSummary:
          'When 212 trials were pooled, chlorpromazine came twelfth of fifteen antipsychotics on symptom reduction — behind most of the modern drugs, but ahead of lurasidone and iloperidone, both approved in 2009 and 2010.',
        technicalDetails:
          "In the Leucht multiple-treatments meta-analysis of 212 blinded trials and 43,049 participants, chlorpromazine's standardised mean difference against placebo for overall symptom change was 0.38 (95% CrI 0.23 to 0.54). That places it twelfth, level with asenapine at 0.38, marginally below ziprasidone and sertindole at 0.39, and above lurasidone and iloperidone at 0.33 each. Its confidence interval is the widest of the fifteen, reflecting how much of its trial evidence predates modern methods. The authors concluded that their findings challenge the straightforward classification of antipsychotics into first-generation and second-generation groupings, and chlorpromazine sitting above two twenty-first-century drugs is one of the clearest illustrations of what they meant.",
        evidenceSource: 'Leucht S et al., Lancet 2013;382:951-962',
        doi: '10.1016/S0140-6736(13)60733-3',
        measuredMetric:
          'Standardised mean difference against placebo for overall symptom change: 0.38 (95% CrI 0.23 to 0.54), twelfth of fifteen',
        auditFlag: 'verified',
      },
      {
        id: 'cpz-a4',
        category: 'conclusion_shift',
        title: 'A label that still indicates it for hyperactive children as young as one',
        laymanSummary:
          'The current United States label lists, among its approved uses, severe behavioural problems in children aged one to twelve, and short-term treatment of hyperactive children with impulsivity, difficulty sustaining attention and poor frustration tolerance.',
        technicalDetails:
          'The Indications and Usage section reads, verbatim: "For the treatment of severe behavioral problems in children (1 to 12 years of age) marked by combativeness and/or explosive hyperexcitable behavior (out of proportion to immediate provocations), and in the short-term treatment of hyperactive children who show excessive motor activity with accompanying conduct disorders consisting of some or all of the following symptoms: impulsivity, difficulty sustaining attention, aggressivity, mood lability and poor frustration tolerance." The symptom list in the second half is a description of what would today be diagnosed as attention-deficit hyperactivity disorder. The same section indicates the drug for nausea and vomiting, restlessness before surgery, acute intermittent porphyria, adjunctive treatment of tetanus, mania and intractable hiccups. None of this reflects the evidence standard a new indication would face now; it reflects a label that has been amended rather than rewritten since the 1950s. An indication surviving on a label is not the same as an indication supported by evidence a regulator would accept today.',
        evidenceSource:
          'United States prescribing information for chlorpromazine hydrochloride, Indications and Usage, via the openFDA drug label endpoint',
        inferredClaim:
          "That the breadth of chlorpromazine's label reflects breadth of demonstrated effect — it reflects the evidence standards in force when each indication was added",
        auditFlag: 'contested',
      },
      {
        id: 'cpz-a5',
        category: 'measured',
        title: 'Skin that turns slate grey and deposits in the lens of the eye',
        laymanSummary:
          'After years of treatment at high amounts, chlorpromazine can turn sun-exposed skin a slate-grey colour with a violet tinge, and can deposit fine particles in the lens and cornea of the eye.',
        technicalDetails:
          'The label records rare instances of skin pigmentation in patients, primarily female, who received the drug usually for three years or more at 500 to 1,500 mg daily, with changes restricted to exposed areas of the body ranging from almost imperceptible darkening to a slate-grey colour, sometimes with a violet hue. Ocular changes are described as occurring more frequently than skin pigmentation, in patients treated usually for two years or more at 300 mg daily and higher, characterised by deposition of fine particulate matter in the lens and cornea, with star-shaped opacities in the anterior lens in more advanced cases, and with epithelial keratopathy and pigmentary retinopathy also reported. A small number of patients with more severe ocular changes had some visual impairment, and the label notes the lesions may regress after withdrawal. It also states that the nature of the eye deposits has not yet been determined. These are visible, physical, cumulative changes of a kind no modern antipsychotic produces, and they are dose- and duration-related.',
        evidenceSource:
          'United States prescribing information for chlorpromazine hydrochloride, Adverse Reactions — Special Considerations in Long-Term Therapy, via the openFDA drug label endpoint',
        measuredMetric:
          'Skin pigmentation after three years or more at 500 to 1,500 mg daily; ocular deposits after two years or more at 300 mg daily and higher',
        auditFlag: 'caution',
      },
      {
        id: 'cpz-a6',
        category: 'inferred',
        title: 'The dopamine theory of psychosis was reverse-engineered from this molecule',
        laymanSummary:
          'Chlorpromazine was not designed to block dopamine. It was developed as an antihistamine for surgery, found by observation to calm psychosis, and only later discovered to block dopamine — after which dopamine was proposed as the cause of psychosis.',
        technicalDetails:
          'The label still states that the precise mechanism by which the therapeutic effects of chlorpromazine are produced is not known, and describes its actions as psychotropic, sedative and antiemetic, with strong antiadrenergic and weaker peripheral anticholinergic activity, slight ganglionic blockade and slight antihistaminic and antiserotonin activity. The historical sequence matters for reading everything downstream of it: the drug came first, the receptor finding came second, and the disease theory came third. A theory derived from what a drug does is a hypothesis about the drug before it is a hypothesis about the illness, and the dopamine hypothesis of schizophrenia has carried that inheritance ever since. Every mechanism section on this site that says a drug\'s effect "could be mediated through" dopamine D2 antagonism is a descendant of an observation made in a French surgical ward in 1952.',
        evidenceSource:
          'United States prescribing information for chlorpromazine hydrochloride, Clinical Pharmacology, via the openFDA drug label endpoint',
        inferredClaim:
          'That dopamine excess causes psychosis — the hypothesis was constructed from the observation that a drug which blocks dopamine reduces symptoms, which is a claim about the drug before it is a claim about the illness',
        auditFlag: 'caution',
      },
      {
        id: 'cpz-a7',
        category: 'measured',
        title: 'It carries the same dementia boxed warning built on trials of other drugs',
        laymanSummary:
          'Chlorpromazine carries the boxed warning about increased deaths in elderly people with dementia. The seventeen trials behind it were largely trials of newer drugs, and the label says so.',
        technicalDetails:
          'The boxed warning states that analyses of seventeen placebo-controlled trials of modal duration ten weeks, "largely in patients taking atypical antipsychotic drugs," found a risk of death 1.6 to 1.7 times that of placebo, about 4.5% against about 2.6% over a typical trial, with most deaths cardiovascular or infectious. It adds that observational studies suggest conventional antipsychotic drugs may increase mortality similarly, and that the extent to which those observational findings can be attributed to the drug rather than to patient characteristics is not clear. So for chlorpromazine specifically the randomised evidence for the warning does not exist, and the label is explicit about that. Applying a class warning across a class on the basis of shared mechanism is a defensible regulatory decision and it is an inference, and the label distinguishes the two more clearly than most secondary sources do.',
        evidenceSource:
          'United States prescribing information for chlorpromazine hydrochloride, Boxed Warning, via the openFDA drug label endpoint',
        measuredMetric:
          'Death in about 4.5% of drug-treated patients against about 2.6% on placebo across seventeen dementia trials, largely of atypical antipsychotics',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A tablet, a liquid concentrate, or an injection into muscle',
        laymanDesc:
          'Chlorpromazine comes as a tablet, an oral concentrate and an injectable solution. There is no long-acting depot form.',
        molecularDetail:
          'Oral bioavailability is low and variable because of extensive first-pass metabolism, which is one reason the injectable amount differs so markedly from the oral one. Phenothiazine solutions oxidise on exposure to light and air, and the label instructs that discoloured solutions not be used.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It reaches the brain and dozens of receptors on the way',
        laymanDesc:
          'The drug crosses into the brain and also acts throughout the body, because the receptors it binds are not confined to the nervous system.',
        molecularDetail:
          'The label describes actions at all levels of the central nervous system, primarily at subcortical levels, as well as on multiple organ systems. Metabolism is hepatic and extensive, producing more than a dozen metabolites including 7-hydroxychlorpromazine, which is itself active, and chlorpromazine sulfoxide, which is not.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It blocks dopamine, and this is where the dopamine theory came from',
        laymanDesc:
          'Blocking the dopamine receptor is what reduces hallucinations and delusions. That was not known when the drug was introduced; it was worked out afterwards, and the idea that psychosis involves dopamine came from working it out.',
        molecularDetail:
          'D2 antagonism is the accepted basis of the antipsychotic effect, and blockade in the chemoreceptor trigger zone is the basis of the antiemetic effect that gives the drug its nausea and hiccup indications. The label nonetheless states the precise mechanism of the therapeutic effect is not known.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'And it blocks adrenaline, acetylcholine, histamine and serotonin too',
        laymanDesc:
          'The same molecule blocks the receptors that hold blood pressure up, keep the mouth wet and the gut moving, and keep a person awake. That is where almost all of its side effects come from.',
        molecularDetail:
          'The label describes strong antiadrenergic and weaker peripheral anticholinergic activity, relatively slight ganglionic blockade, and slight antihistaminic and antiserotonin activity. Alpha-1 blockade produces the orthostatic hypotension measured in the Cochrane review at a risk ratio of 2.38; H1 and 5-HT2C blockade is the standard explanation for sedation at 2.79 and weight gain at 4.92; muscarinic blockade produces dry mouth, constipation, urinary retention and adynamic ileus, all listed in the label.',
        iconName: 'AlertTriangle',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Psychosis improves, and over years the skin and eyes record the exposure',
        laymanDesc:
          'Symptoms improve, on the evidence of 55 trials. Over years at high amounts, sun-exposed skin can turn slate grey and fine deposits can form in the lens and cornea.',
        molecularDetail:
          'Global improvement risk ratio 0.71 (95% CI 0.58 to 0.86) against placebo. Standardised mean difference 0.38 (95% CrI 0.23 to 0.54), twelfth of fifteen. Skin pigmentation after three years or more at 500 to 1,500 mg daily; lens and corneal deposits after two years or more at 300 mg daily and higher, with the label noting the nature of the deposits has not yet been determined.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Cochrane review: chlorpromazine versus placebo for schizophrenia (CD000284)',
        phase: 'Systematic review and meta-analysis of 55 randomised controlled trials',
        sampleSize: 1831,
        primaryEndpoint:
          'Death, violent behaviour, overall improvement, relapse and satisfaction with care in schizophrenia and non-affective serious mental illness',
        endpointMet: true,
        statisticalPValue:
          'Global improvement risk ratio 0.71 (95% CI 0.58 to 0.86), 1,164 participants in 14 trials; leaving the study early 0.64 (95% CI 0.53 to 0.78), 1,831 participants in 27 trials; relapse over six months to two years 0.65 (95% CI 0.47 to 0.90), 512 participants in 3 trials',
        unreportedAdverseSignals:
          'The reviewers state that the quality of the evidence is very low. Sedation risk ratio 2.79, acute movement disorders 3.47, parkinsonism 2.11, dizziness with lowered blood pressure 2.38, and considerable weight gain 4.92 (95% CI 2.32 to 10.43) on 165 participants across 5 trials. The sample size recorded here is the largest single pooled comparison in the review, not the total across all 55 trials.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Leucht 15-drug multiple-treatments meta-analysis',
        phase: 'Bayesian network meta-analysis of 212 blinded randomised trials',
        sampleSize: 43049,
        primaryEndpoint:
          'Mean overall change in symptoms against placebo in acute schizophrenia, with all-cause discontinuation, weight gain, extrapyramidal effects, prolactin, QTc and sedation as secondary outcomes',
        endpointMet: true,
        statisticalPValue:
          'Chlorpromazine standardised mean difference 0.38 (95% CrI 0.23 to 0.54), twelfth of fifteen and above lurasidone and iloperidone at 0.33 each',
        unreportedAdverseSignals:
          'Chlorpromazine has the widest credible interval of the fifteen drugs, reflecting how much of its randomised evidence predates modern trial methods.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A global improvement risk ratio of 0.71 (95% CI 0.58 to 0.86) against placebo across 14 randomised trials',
        'A standardised mean difference of 0.38 against placebo for overall symptom change, twelfth of fifteen ranked antipsychotics',
        'A considerable-weight-gain risk ratio of 4.92 (95% CI 2.32 to 10.43), in a first-generation drug',
        'Sedation at a risk ratio of 2.79, acute movement disorders at 3.47, parkinsonism at 2.11, and dizziness with lowered blood pressure at 2.38',
        'Skin pigmentation and lens and corneal deposits as dose- and duration-related consequences recorded in the label',
      ],
      unsupportedInferences: [
        "That weight gain and sedation are distinctive to second-generation antipsychotics — chlorpromazine's pooled risk ratios are 4.92 and 2.79",
        'That the breadth of its label reflects breadth of demonstrated effect — it reflects the evidence standards in force when each indication was added',
        "That dopamine excess causes psychosis — the hypothesis was reverse-engineered from this drug's observed effect",
        'That the dementia mortality warning rests on randomised evidence for this drug — the label states the trials were largely of atypical antipsychotics',
      ],
      whatFailedInitially: [
        'The Cochrane reviewers graded the quality of the whole 55-trial evidence base as very low',
        'No difference in relapse rates was found in the short, medium or long term over two years, and the six-month-to-two-year finding was heterogeneous',
        'Two twenty-first-century antipsychotics, lurasidone and iloperidone, rank below this 1950s drug on pooled symptom reduction',
      ],
      realWorldOutcome: [
        'About thirty-nine cents a tablet at United States pharmacy acquisition cost, across 89 listed generic products',
        'On the World Health Organization Model List of Essential Medicines, and one of the most widely available antipsychotics on earth',
        'A label carrying indications for tetanus, acute intermittent porphyria, intractable hiccups and hyperactive children from the age of one',
        'The reference molecule for the chlorpromazine-equivalent dose tables by which every other antipsychotic in this class is still compared',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, oral concentrate solution, and intramuscular injection',
      description:
        'There is no long-acting depot. Oral bioavailability is low and variable because of extensive first-pass metabolism, which is why oral and injectable amounts differ so much. Phenothiazine solutions oxidise on exposure to light and air and the label instructs that discoloured solutions not be used. Contact dermatitis has been reported in nursing staff handling the liquid and injectable forms, and the label recommends rubber gloves for administration.',
      safetyProfile:
        'The United States label carries a boxed warning for increased mortality in elderly patients with dementia-related psychosis, and states the supporting trials were largely of atypical antipsychotics. Tardive dyskinesia is described as potentially irreversible with prevalence highest among the elderly, especially elderly women, and the label states it is unknown whether antipsychotic products differ in their potential to cause it. Sedation, orthostatic hypotension, acute dystonia and parkinsonism are the characteristic acute effects. Long-term therapy carries skin pigmentation and ocular deposits in the lens and cornea. Photosensitivity, exfoliative dermatitis, seizures, agranulocytosis, jaundice, neuroleptic malignant syndrome, priapism and adynamic ileus are all in the label, as is a caution against use in children and adolescents with signs suggesting Reye syndrome.',
    },
    commonQuestions: [
      {
        q: 'Is an old drug like this much worse than a modern one?',
        a: "Less than the generational language suggests. In the pooled ranking of 212 blinded trials, chlorpromazine's standardised mean difference against placebo was 0.38, twelfth of fifteen — behind olanzapine at 0.59 and risperidone at 0.56, level with asenapine, and above lurasidone and iloperidone at 0.33 each, both of which were approved around 2010. Where it clearly is worse is tolerability: sedation at a risk ratio of 2.79, parkinsonism at 2.11, acute movement disorders at 3.47 and dizziness from lowered blood pressure at 2.38, along with visible skin and eye changes with years of use that no modern antipsychotic produces.",
        auditNote:
          'The authors of the 212-trial analysis concluded their findings challenge the straightforward classification of antipsychotics into first- and second-generation groupings.',
      },
      {
        q: "Doesn't it avoid the weight gain the newer drugs cause?",
        a: 'No. The Cochrane review reports considerable weight gain at a risk ratio of 4.92 with a 95% confidence interval from 2.32 to 10.43. That estimate rests on only 165 participants across 5 trials, so the exact figure is uncertain and the interval is wide, but the direction is not in doubt. It is also what the pharmacology predicts: chlorpromazine blocks histamine H1 and serotonin 5-HT2C heavily, which is the same combination that drives weight gain with olanzapine and quetiapine. The idea that metabolic effects arrived with the second generation is a story about marketing eras rather than about receptors.',
      },
      {
        q: 'Why is it approved for hiccups and tetanus?',
        a: 'Because the label has been amended rather than rewritten since the 1950s, and each of those uses was added under the evidence standards of its time. The current Indications and Usage section lists psychotic disorders, schizophrenia, nausea and vomiting, restlessness before surgery, acute intermittent porphyria, adjunctive treatment of tetanus, the manic type of manic-depressive illness, intractable hiccups, severe behavioural problems in children aged one to twelve, and short-term treatment of hyperactive children with impulsivity, difficulty sustaining attention and poor frustration tolerance. Some of those have a clear mechanistic rationale — the antiemetic and hiccup indications both follow from dopamine blockade in the brainstem. None of them would be granted today on the evidence that supports them.',
        auditNote:
          'The last item on that list describes what would now be diagnosed as attention-deficit hyperactivity disorder.',
      },
      {
        q: 'Can it really change the colour of your skin?',
        a: 'The label describes it. Rare instances of skin pigmentation have been observed in patients, primarily female, treated usually for three years or more at 500 to 1,500 mg daily, restricted to sun-exposed areas and ranging from almost imperceptible darkening to a slate-grey colour, sometimes with a violet hue. Ocular changes are described as more frequent than the skin changes, appearing after two years or more at 300 mg daily and higher, consisting of fine particulate deposits in the lens and cornea, with star-shaped opacities in the anterior lens in advanced cases, and with epithelial keratopathy and pigmentary retinopathy also reported. A small number of patients with more severe eye changes had some visual impairment, and the label states the lesions may regress after the drug is withdrawn.',
      },
      {
        q: 'Why does this page show a price but no manufacturing cost?',
        a: 'Because no verifiable per-dose cost of production for chlorpromazine could be found and cited. The figure quoted comes from the CMS National Average Drug Acquisition Cost survey, which records what United States pharmacies pay to acquire a drug. That is a price, not a cost of manufacture. The synthesis is a single alkylation of 2-chlorophenothiazine, which is about as simple as any route on this site and is consistent with the drug appearing on the World Health Organization Essential Medicines list, but a description of a route is not a cost figure.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Adams CE, Awad GA, Rathbone J, Thornley B, Soares-Weiser K. Chlorpromazine versus placebo for schizophrenia. Cochrane Database of Systematic Reviews 2014, Issue 1, CD000284',
        identifier: '10.1002/14651858.CD000284.pub3',
        kind: 'doi',
      },
      {
        label:
          'Leucht S et al. Comparative efficacy and tolerability of 15 antipsychotic drugs in schizophrenia: a multiple-treatments meta-analysis. Lancet 2013;382:951-962',
        identifier: '10.1016/S0140-6736(13)60733-3',
        kind: 'doi',
      },
      {
        label:
          'United States prescribing information for chlorpromazine hydrochloride — Boxed Warning, Indications and Usage, Clinical Pharmacology, Warnings (Tardive Dyskinesia) and Adverse Reactions (Special Considerations in Long-Term Therapy) — via the openFDA drug label endpoint',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22chlorpromazine+hydrochloride%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 2726 — chlorpromazine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2726',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 13. Amisulpride — second of fifteen antipsychotics on measured efficacy, first of thirty-two
  //     on positive symptoms, and available in the United States only as an anti-sickness injection.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'amisulpride',
    name: 'Amisulpride',
    tradeName: 'Barhemsys',
    sponsor:
      'Originated as a substituted benzamide antipsychotic in France, where it has been marketed for decades and is sold across Europe; the only United States approval is BARHEMSYS, an intravenous antiemetic developed by Acacia Pharma, approved under NDA 209510 on 26 February 2020 and now held by LXO Ireland',
    targetGene: 'DRD2',
    targetProtein:
      'Dopamine D2 and D3 receptors, antagonised selectively. The United States label states that amisulpride has no appreciable affinity for any other receptor types apart from low affinities for 5-HT2B and 5-HT7 — making it, along with haloperidol, one of the two most target-selective drugs in this whole group.',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2020,
    indication:
      'In the United States: prevention of postoperative nausea and vomiting in adults, alone or with an antiemetic of a different class, and treatment of postoperative nausea and vomiting, as a single 5 or 10 mg intravenous dose. It has no United States indication for schizophrenia or any other psychiatric condition. In Europe it is a long-established oral antipsychotic.',
    patientFriendlyIndication:
      'In America, sickness after an operation. Everywhere else, schizophrenia.',
    anatomicalSite:
      'The chemoreceptor trigger zone and area postrema in the brainstem for the antiemetic effect, and mesolimbic dopamine synapses for the antipsychotic effect it is not licensed for in the United States',
    conditionContext: {
      conditionExplainer:
        'When 212 blinded trials of fifteen antipsychotics were pooled and ranked, amisulpride came second — behind clozapine and ahead of olanzapine, risperidone and everything else. When a later network of 402 studies ranked reduction of positive symptoms across 32 drugs, amisulpride came first.',
      whyItMatters:
        'It has never been approved in the United States for schizophrenia. The only American approval is for a single intravenous injection to stop sickness after an operation. A reader in America looking up the second-best-performing antipsychotic in the published evidence will find an anti-nausea drug.',
      whoTakesThis:
        'In the United States, adults having surgery. Across Europe and much of the rest of the world, people with schizophrenia, for whom it is a routine first-line option.',
      clinicalGoals:
        'The American trials measured complete response — no vomiting and no rescue medication — over 24 hours after surgery. The evidence that produced the efficacy ranking is European and measures rating-scale change in schizophrenia.',
    },
    oneSentenceVerdict:
      'A selective dopamine D2 and D3 blocker that ranked second of fifteen antipsychotics on pooled symptom reduction (standardised mean difference 0.66), first of thirty-two on reduction of positive symptoms (-0.69), best of fifteen on all-cause discontinuation and least sedating of fifteen — and whose only United States approval is a single 5 or 10 mg intravenous dose to stop nausea after surgery.',
    laymanHowItWorks:
      'Amisulpride blocks two closely related dopamine receptors and, unusually for this class, almost nothing else. In the brainstem there is a small region that triggers vomiting when it detects dopamine, which is why blocking those receptors stops sickness — and that is the use America approved. Deeper in the brain the same blockade reduces hallucinations and delusions, which is why the rest of the world uses it as an antipsychotic. The two uses are the same molecule acting on the same receptors in different places, at very different amounts.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 61,
    substitutes: {
      summary:
        'There is no United States pharmacy acquisition price for amisulpride in the current survey, because the only approved product is a hospital-administered intravenous injection rather than a dispensed prescription. For the American antiemetic use the comparators are ondansetron and dexamethasone. For the psychiatric use that America has not approved, the comparators are the drugs it outranked.',
      conventionalRx: [
        {
          name: 'Ondansetron',
          class: 'Serotonin 5-HT3 antagonist antiemetic',
          howItCompares:
            'The standard first-line antiemetic and the drug amisulpride is most often added to rather than replacing. In the 1,147-patient combination prophylaxis trial, amisulpride added to a standard antiemetic gave complete response in 330 of 572 against 268 of 575 on placebo plus the same standard antiemetic, p<0.001. Both prolong the QT interval, and the amisulpride label names ondansetron specifically among the drugs whose combination warrants electrocardiographic monitoring.',
          typicalCost:
            'Generic ondansetron is widely listed in the CMS National Average Drug Acquisition Cost survey cited on this page',
          prosAndCons:
            'Pros: established, cheap, oral and intravenous forms, no dopamine blockade and so no movement-disorder risk. Cons: a different mechanism, so it does not cover the dopamine-driven component of postoperative sickness.',
        },
        {
          name: 'Olanzapine (Zyprexa)',
          class: 'Second-generation antipsychotic, multi-receptor antagonist',
          howItCompares:
            'The drug amisulpride outranked in the fifteen-drug analysis: standardised mean difference 0.66 against 0.59. Amisulpride also had the best all-cause discontinuation of the fifteen (odds ratio 0.43) and the least sedation (odds ratio 1.42), where olanzapine had the worst weight gain (-0.74). Olanzapine is approved for schizophrenia in the United States and amisulpride is not.',
          typicalCost:
            'US$0.1432 per tablet at pharmacy acquisition cost, median across 167 listed generic products (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: available and approved in the United States for the indication in question. Cons: a lower measured efficacy rank, the worst weight gain of the fifteen drugs compared, and far more sedation.',
        },
        {
          name: 'Brexpiprazole (Rexulti)',
          class: 'Dopamine D2 partial agonist',
          howItCompares:
            'The two ends of the same ranking. In the network meta-analysis of 402 studies, reduction of positive symptoms ran from -0.69 for amisulpride at the strongest end to -0.17 for brexpiprazole at the weakest. Brexpiprazole is a brand-only United States product at about fifty dollars a tablet; amisulpride is a decades-old generic that the United States has never approved for this use.',
          typicalCost:
            'US$49.53 per tablet at pharmacy acquisition cost, median across 6 listed brand products (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: approved and available in the United States for schizophrenia. Cons: the weakest measured effect on positive symptoms of the 32 drugs in that network.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Tell the anaesthetic team about heart-rhythm history before surgery',
          action:
            'The label directs that amisulpride be avoided in patients with congenital long QT syndrome and in patients taking droperidol, and recommends electrocardiographic monitoring in several defined situations.',
          patientImpact:
            'Those situations are pre-existing arrhythmias or cardiac conduction disorders, electrolyte abnormalities such as low potassium or low magnesium, congestive heart failure, and concurrent use of other QT-prolonging medicines including ondansetron. Several of those are common in someone recovering from an operation.',
          clinicalPrecaution:
            'This is a pre-operative conversation, not something to act on afterwards. The QT prolongation the label describes is dose- and concentration-dependent.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CCN1CCCC1CNC(=O)C2=CC(=C(C=C2OC)N)S(=O)(=O)CC',
      chemicalFormula: 'C17H27N3O4S',
      molecularWeight: '369.50 g/mol',
      targetReceptorAffinity:
        'A selective dopamine D2 and D3 antagonist. The United States label states that amisulpride has no appreciable affinity for any other receptor types apart from low affinities for 5-HT2B and 5-HT7. That selectivity is the opposite of the multi-receptor profile the phrase "atypical antipsychotic" was coined to describe, and amisulpride nonetheless outranked every multi-receptor drug except clozapine on measured efficacy. It is a substituted benzamide, structurally unrelated to the phenothiazines, butyrophenones and the tricyclic-derived atypicals — its nearest relative in clinical use is sulpiride, and its nearest relative on a pharmacy shelf is metoclopramide.',
      structureSource: {
        label: 'PubChem CID 2159 (amisulpride) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2159',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ami-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Enantiomeric control of the 2-aminomethyl-1-ethylpyrrolidine fragment',
          description:
            'Determine the enantiomeric composition of the pyrrolidine side chain before coupling. Amisulpride carries a single stereocentre and is marketed as the racemate, so what has to be controlled is not purity of one enantiomer but the ratio of the two, and a drifting ratio is a change in the product rather than an impurity in it.',
          reagentsAndBuffer:
            '(R)- and (S)-2-aminomethyl-1-ethylpyrrolidine reference standards, chiral HPLC with a polysaccharide stationary phase, optical rotation, 1H and 13C NMR against a certified amisulpride standard',
        },
        {
          id: 'ami-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Amide coupling of the benzoic acid core to the pyrrolidinylmethylamine',
          description:
            "Couple 4-amino-5-ethylsulfonyl-2-methoxybenzoic acid to 2-aminomethyl-1-ethylpyrrolidine. Every substituent on that ring earns its place: the methoxy group ortho to the carbonyl locks the amide conformation, the ethylsulfonyl group at position 5 is what raises D2 and D3 affinity over sulpiride's sulfamoyl, and the free aromatic amine is required for activity.",
          dependsOnStepId: 'ami-w1',
          reagentsAndBuffer:
            '4-amino-5-(ethylsulfonyl)-2-methoxybenzoic acid, 2-aminomethyl-1-ethylpyrrolidine, carbodiimide or acyl-chloride activation with base, dichloromethane or tetrahydrofuran under nitrogen',
        },
        {
          id: 'ami-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation and control of the free-amine and sulfone-related impurities',
          description:
            'Recrystallise to specification with explicit limits on unreacted benzoic acid, on the des-amino analogue and on sulfoxide oxidation products of the ethylsulfonyl group. For an intravenous product these limits are tighter than for a tablet, because nothing downstream of the needle removes anything.',
          dependsOnStepId: 'ami-w2',
          reagentsAndBuffer:
            'Ethanol-water recrystallisation with controlled cooling, powder X-ray diffraction, differential scanning calorimetry, HPLC assay for related substances, residual solvent testing by headspace gas chromatography',
        },
        {
          id: 'ami-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Intravenous exposure characterisation across the approved dose pair',
          description:
            'Establish the concentration-time profile after a single 5 mg and a single 10 mg intravenous dose infused over one to two minutes, and relate it to the QT interval. The label states QT prolongation is dose- and concentration-dependent, so the exposure measurement and the cardiac measurement are the same experiment, not two.',
          dependsOnStepId: 'ami-w3',
          reagentsAndBuffer:
            'Serial plasma sampling with time-matched electrocardiography, LC-MS/MS with a deuterated amisulpride internal standard, renal function measured alongside since elimination is substantially renal, concentration-QTc modelling',
        },
        {
          id: 'ami-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'A negative-result receptor panel that must be shown to be capable of positives',
          description:
            'Run the full receptor panel and report the absent affinities explicitly, with positive controls that demonstrate the assay could have detected them. The defining pharmacological claim for amisulpride is a negative result at every receptor except D2, D3 and weakly 5-HT2B and 5-HT7, and a negative result is only informative if the assay was demonstrably able to return a positive one.',
          dependsOnStepId: 'ami-w4',
          reagentsAndBuffer:
            'Membranes expressing human D2, D3, D4, 5-HT2A, 5-HT2B, 5-HT2C, 5-HT7, alpha-1, H1 and M1 to M5 receptors, radioligand competition binding, clozapine and chlorpromazine as broad-spectrum positive controls, haloperidol as a selective D2 reference',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ami-a1',
        category: 'conclusion_shift',
        title: 'Second of fifteen antipsychotics, and America approved it as an anti-sickness shot',
        laymanSummary:
          'In the largest pooled comparison of antipsychotics ever published, amisulpride came second of fifteen, ahead of olanzapine and risperidone. The only version of it approved in the United States is a single injection given after an operation to stop nausea.',
        technicalDetails:
          "In the Leucht multiple-treatments meta-analysis of 212 blinded trials and 43,049 participants, amisulpride's standardised mean difference against placebo for overall symptom change was 0.66 (95% CrI 0.53 to 0.78), second only to clozapine at 0.88 and ahead of olanzapine 0.59, risperidone 0.56, paliperidone 0.50, haloperidol 0.45, quetiapine 0.44 and aripiprazole 0.43. In the same analysis it had the most favourable all-cause discontinuation of the fifteen at an odds ratio of 0.43, where haloperidol was worst at 0.80, and the least sedation of the fifteen at an odds ratio of 1.42, where clozapine was worst at 8.82. The only United States approval for the molecule is BARHEMSYS, NDA 209510, approved 26 February 2020, for prevention and treatment of postoperative nausea and vomiting as a single 5 or 10 mg intravenous dose. There is no United States psychiatric indication. This is not a statement that the drug should be approved there — no sponsor has run the United States registration programme that would be required, and that commercial fact is the reason, not a regulatory finding against the drug. It does mean an American reader searching for the second-ranked antipsychotic in the published literature finds an antiemetic.",
        evidenceSource:
          'Leucht S et al., Lancet 2013;382:951-962; Drugs@FDA NDA 209510 (BARHEMSYS), approved 26 February 2020',
        doi: '10.1016/S0140-6736(13)60733-3',
        inferredClaim:
          'That the antipsychotics available in a country are the ones the evidence ranks highest — the second-ranked drug of fifteen has no United States psychiatric approval, for commercial rather than evidential reasons',
        auditFlag: 'contested',
      },
      {
        id: 'ami-a2',
        category: 'measured',
        title: 'First of thirty-two drugs on reduction of positive symptoms',
        laymanSummary:
          'A later network meta-analysis of 402 studies and 53,463 patients ranked 32 antipsychotics on how much they reduce hallucinations and delusions. Amisulpride came first.',
        technicalDetails:
          "In the Huhn network meta-analysis, standardised mean differences against placebo for reduction of positive symptoms across 31,179 participants ranged from -0.69 (95% CrI -0.86 to -0.52) for amisulpride at the strongest end to -0.17 (95% CrI -0.31 to -0.04) for brexpiprazole at the weakest. Across the same network, overall symptom reduction ran from -0.89 for clozapine to -0.03 for levomepromazine, with six drugs not reaching statistical significance. The authors' interpretation is that efficacy differences between antipsychotics exist but are mostly gradual rather than discrete, that side-effect differences are more marked, and that confidence in the evidence was often low or very low. Amisulpride heading the positive-symptom ranking in one analysis and placing second overall in another, seven years apart and with different methods and datasets, is about as close to independent replication as this literature offers.",
        evidenceSource: 'Huhn M et al., Lancet 2019;394:939-951',
        doi: '10.1016/S0140-6736(19)31135-3',
        measuredMetric:
          'Standardised mean difference against placebo for positive symptom reduction: -0.69 (95% CrI -0.86 to -0.52), strongest of 32 drugs',
        auditFlag: 'verified',
      },
      {
        id: 'ami-a3',
        category: 'measured',
        title: 'The most selective drug in the group, and the "atypical" label does not fit it',
        laymanSummary:
          'The second-generation antipsychotics are usually described as working by hitting many receptors at once. Amisulpride hits two, and outperformed all of the multi-receptor drugs except clozapine.',
        technicalDetails:
          "The United States label states that amisulpride is a selective dopamine D2 and D3 antagonist and has no appreciable affinity for any other receptor types apart from low affinities for 5-HT2B and 5-HT7. That profile is closer to haloperidol's than to olanzapine's or clozapine's, and it is the opposite of the receptor promiscuity the term \"atypical\" was originally used to describe. Yet amisulpride ranked second of fifteen on efficacy, best of fifteen on all-cause discontinuation and least sedating of fifteen — the last two following directly from what it does not bind. Taken with the finding that haloperidol placed seventh, above eight newer drugs, the generational framework does not survive contact with the ranking. The Leucht authors said as much: their findings challenge the straightforward classification of antipsychotics into first-generation and second-generation groupings.",
        evidenceSource:
          'United States prescribing information for BARHEMSYS (amisulpride), section 12.1; Leucht S et al., Lancet 2013;382:951-962',
        doi: '10.1016/S0140-6736(13)60733-3',
        measuredMetric:
          'Receptor selectivity per the label, alongside an efficacy rank of second, a discontinuation rank of first and a sedation rank of first among fifteen drugs',
        auditFlag: 'verified',
      },
      {
        id: 'ami-a4',
        category: 'failed',
        title: 'In one antiemetic trial the lower approved amount did not beat placebo',
        laymanSummary:
          'Two trials tested 5 mg and 10 mg injections for treating sickness that had already started. In one of them the 5 mg arm did not separate from placebo. Both amounts are on the label.',
        technicalDetails:
          'NCT02646566 randomised 705 patients with established postoperative nausea and vomiting who had already received prophylaxis. Complete response — no vomiting and no rescue medication — occurred in 80 of 237 on 5 mg (33.8%), 96 of 230 on 10 mg (41.7%) and 67 of 235 on placebo (28.5%), with p=0.003 for 10 mg against placebo and p=0.109 for 5 mg. NCT02449291 randomised 568 patients who had not received prophylaxis, giving 60 of 191 on 5 mg (31.4%), 59 of 188 on 10 mg (31.4%) and 39 of 181 on placebo (21.5%), with p=0.016 for both active arms. So across the two treatment trials, the 5 mg arm succeeded in one and failed in the other, and in the trial where both succeeded the two amounts were numerically identical. That is not a dose-response relationship. The label recommends 5 or 10 mg as a single intravenous dose without distinguishing between them by efficacy.',
        evidenceSource:
          'NCT02646566 and NCT02449291 — randomised double-blind placebo-controlled trials of intravenous amisulpride for established postoperative nausea and vomiting, posted results, Acacia Pharma',
        measuredMetric:
          'Complete response: 33.8% on 5 mg (p=0.109) and 41.7% on 10 mg (p=0.003) against 28.5% on placebo in one trial; 31.4% on both arms against 21.5% (p=0.016) in the other',
        auditFlag: 'caution',
      },
      {
        id: 'ami-a5',
        category: 'measured',
        title: 'Prophylaxis added eleven percentage points on top of a standard antiemetic',
        laymanSummary:
          'The largest American trial gave amisulpride alongside a standard anti-sickness drug in 1,147 patients. Complete response rose from 47% to 58%.',
        technicalDetails:
          'NCT02337062, a phase 3 randomised double-blind placebo-controlled combination prophylaxis trial in 1,147 patients, gave 5 mg intravenous amisulpride or placebo alongside a standard antiemetic. Complete response occurred in 330 of 572 (57.7%) against 268 of 575 (46.6%), p<0.001. That is an absolute difference of about eleven percentage points, or roughly one additional complete response for every nine patients treated. It is a real and clearly significant result on a hard, patient-relevant endpoint, achieved on top of existing therapy rather than instead of it, and it is a good deal more convincing than the treatment trials of the same drug.',
        evidenceSource:
          'NCT02337062 — phase 3 combination prophylaxis trial of intravenous amisulpride against postoperative nausea and vomiting, posted results, Acacia Pharma',
        measuredMetric: 'Complete response 330/572 (57.7%) against 268/575 (46.6%), p<0.001',
        auditFlag: 'verified',
      },
      {
        id: 'ami-a6',
        category: 'measured',
        title: 'QT prolongation that rises with the amount given, and a named drug to avoid',
        laymanSummary:
          "Amisulpride stretches the heart's electrical recovery time, and does so more at higher amounts. The label says to avoid it in people with an inherited long QT and in anyone taking droperidol.",
        technicalDetails:
          'Section 5.1 states that BARHEMSYS causes dose- and concentration-dependent prolongation of the QT interval, that the recommended amount is 5 or 10 mg as a single intravenous dose infused over one to two minutes, and that use should be avoided in patients with congenital long QT syndrome and in patients taking droperidol. Electrocardiographic monitoring is recommended in patients with pre-existing arrhythmias or cardiac conduction disorders, with electrolyte abnormalities such as hypokalaemia or hypomagnesaemia, with congestive heart failure, and in patients taking other QT-prolonging medicines, with ondansetron named explicitly. Ondansetron is the drug amisulpride is most often given alongside, and that combination is the design of the trial that produced its strongest result.',
        evidenceSource:
          'United States prescribing information for BARHEMSYS (amisulpride), sections 5.1 and 7.2, via the openFDA drug label endpoint',
        measuredMetric:
          'Dose- and concentration-dependent QT prolongation, with named contraindicated and monitored combinations',
        auditFlag: 'caution',
      },
      {
        id: 'ami-a7',
        category: 'inferred',
        title: 'Two evidence bases for one molecule, and they do not speak to each other',
        laymanSummary:
          'Everything known about amisulpride as an antipsychotic comes from European trials of daily tablets. Everything the American label rests on comes from single injections after surgery. Neither body of evidence tells you much about the other.',
        technicalDetails:
          'The efficacy rankings that place amisulpride second of fifteen and first of thirty-two are built on European randomised trials of oral treatment in schizophrenia, sustained over weeks. The United States approval rests on three trials totalling 2,420 patients receiving a single intravenous injection of 5 or 10 mg around the time of surgery. The receptor pharmacology is shared, the exposure and duration are not remotely comparable, and no bridging study joins them. Two consequences follow. An American clinician cannot use the antiemetic evidence to reason about psychiatric use, and the safety experience accumulating from single perioperative injections says nothing about the long-term prolactin, movement and cardiac consequences of sustained blockade. The molecule is the same; the evidence is two separate literatures that share a chemical name.',
        evidenceSource:
          'Leucht S et al., Lancet 2013;382:951-962; Huhn M et al., Lancet 2019;394:939-951; NCT02337062, NCT02646566 and NCT02449291',
        doi: '10.1016/S0140-6736(19)31135-3',
        inferredClaim:
          'That the safety and efficacy record of one use transfers to the other — the two evidence bases differ in route, amount, duration, population and endpoint, and no bridging study connects them',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'In America, one injection into a vein over one to two minutes',
        laymanDesc:
          'The only form approved in the United States is a single injection of 5 or 10 mg given slowly into a vein, around the time of an operation. Everywhere else the drug is a tablet taken daily.',
        molecularDetail:
          'The approved United States route recorded in the openFDA product data is intravenous. Elimination is substantially renal, which matters in perioperative patients whose kidney function may be transiently reduced.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It reaches the brainstem region that triggers vomiting',
        laymanDesc:
          'There is a small area at the base of the brain that sits outside the usual blood-brain barrier and detects circulating chemicals. When it senses dopamine, it triggers vomiting.',
        molecularDetail:
          'D2 receptors in the chemoreceptor trigger zone respond to dopamine released from nerve endings, and activation relays stimuli to the vomiting centre. The label adds that studies in multiple species indicate D3 receptors in the area postrema also play a role in emesis, and reports that amisulpride inhibits apomorphine-induced emesis in ferrets with an estimated ED50 below 1 microgram per kilogram subcutaneously.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It blocks dopamine D2 and D3, and almost nothing else',
        laymanDesc:
          'Unlike most drugs in this family, amisulpride does not also block histamine, acetylcholine or the adrenaline receptors. That is why it is not sedating and does not cause dry mouth or a drop in blood pressure.',
        molecularDetail:
          'The label states it is a selective D2 and D3 antagonist with no appreciable affinity for any other receptor types apart from low affinities for 5-HT2B and 5-HT7. In the fifteen-drug analysis this showed up directly: least sedation of the fifteen at an odds ratio of 1.42, and the most favourable all-cause discontinuation at 0.43.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The same blockade deeper in the brain is the antipsychotic effect',
        laymanDesc:
          'Further into the brain, blocking the same receptors reduces hallucinations and delusions. That is what the rest of the world prescribes this drug for, and it is not approved for it in America.',
        molecularDetail:
          'Standardised mean difference against placebo of 0.66 (95% CrI 0.53 to 0.78) for overall symptom change, second of fifteen, and -0.69 (95% CrI -0.86 to -0.52) for positive symptoms, first of thirty-two. The selectivity that makes it non-sedating also concentrates its adverse effects into the ones D2 blockade produces: prolactin elevation and movement effects.',
        iconName: 'Activity',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Sickness stops, and the electrocardiogram lengthens with the amount given',
        laymanDesc:
          'After surgery, adding it to a standard anti-sickness drug raised the proportion of people with no vomiting and no need for rescue treatment from 47% to 58%. The trade is a measurable effect on the heart tracing.',
        molecularDetail:
          'Complete response 330 of 572 (57.7%) against 268 of 575 (46.6%), p<0.001, in the 1,147-patient combination prophylaxis trial. QT prolongation is stated in the label to be dose- and concentration-dependent, with use avoided in congenital long QT syndrome and alongside droperidol, and electrocardiographic monitoring recommended with ondansetron and in several other defined situations.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'NCT02337062',
        phase: 'Phase 3 randomised double-blind placebo-controlled combination prophylaxis trial',
        sampleSize: 1147,
        primaryEndpoint:
          'Complete response — no vomiting and no rescue antiemetic — with 5 mg intravenous amisulpride added to a standard antiemetic, against placebo added to the same standard antiemetic',
        endpointMet: true,
        statisticalPValue:
          'Complete response 330 of 572 (57.7%) against 268 of 575 (46.6%), p<0.001',
        unreportedAdverseSignals:
          'The comparison is drug-plus-standard-care against standard care alone, so the eleven-percentage-point difference is an increment on top of existing therapy rather than a standalone effect.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'NCT02646566',
        phase: 'Phase 3 randomised double-blind placebo-controlled treatment trial',
        sampleSize: 705,
        primaryEndpoint:
          'Complete response in patients with established postoperative nausea and vomiting who had already received antiemetic prophylaxis',
        endpointMet: true,
        statisticalPValue:
          '10 mg 96 of 230 (41.7%), p=0.003; 5 mg 80 of 237 (33.8%), p=0.109; placebo 67 of 235 (28.5%)',
        unreportedAdverseSignals:
          'The 5 mg arm did not separate from placebo in this trial, and both amounts appear on the label without an efficacy distinction between them.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'NCT02449291',
        phase: 'Phase 3 randomised double-blind placebo-controlled treatment trial',
        sampleSize: 568,
        primaryEndpoint:
          'Complete response in patients with established postoperative nausea and vomiting who had not received prophylaxis',
        endpointMet: true,
        statisticalPValue:
          '5 mg 60 of 191 (31.4%) and 10 mg 59 of 188 (31.4%), both p=0.016, against placebo 39 of 181 (21.5%)',
        unreportedAdverseSignals:
          'The two active amounts produced numerically identical response rates, so this trial provides no dose-response signal either.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Leucht 15-drug multiple-treatments meta-analysis',
        phase: 'Bayesian network meta-analysis of 212 blinded randomised trials',
        sampleSize: 43049,
        primaryEndpoint:
          'Mean overall change in symptoms against placebo in acute schizophrenia, with all-cause discontinuation, weight gain, extrapyramidal effects, prolactin, QTc and sedation as secondary outcomes',
        endpointMet: true,
        statisticalPValue:
          'Amisulpride standardised mean difference 0.66 (95% CrI 0.53 to 0.78), second of fifteen; all-cause discontinuation odds ratio 0.43, the most favourable of the fifteen; sedation odds ratio 1.42, the most favourable of the fifteen',
        unreportedAdverseSignals:
          'These results describe a use that has no United States approval. The evidence is European and the ranking has no bearing on what an American prescriber can write.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Huhn 32-drug network meta-analysis',
        phase: 'Network meta-analysis of 402 studies',
        sampleSize: 53463,
        primaryEndpoint:
          'Change in overall symptoms against placebo in adults with multi-episode schizophrenia, with positive symptoms, negative symptoms, discontinuation, weight, prolactin and QTc as further outcomes',
        endpointMet: true,
        statisticalPValue:
          'Amisulpride standardised mean difference for positive symptoms -0.69 (95% CrI -0.86 to -0.52), the strongest of the 32 drugs, against -0.17 for brexpiprazole at the weakest',
        unreportedAdverseSignals:
          'The authors state that confidence in the evidence was often low or very low and that efficacy differences between antipsychotics are mostly gradual rather than discrete.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A standardised mean difference of 0.66 against placebo for overall symptom change, second of fifteen ranked antipsychotics',
        'A standardised mean difference of -0.69 for positive symptom reduction, strongest of 32 drugs across 402 studies',
        'The most favourable all-cause discontinuation (odds ratio 0.43) and the least sedation (odds ratio 1.42) of the fifteen drugs ranked',
        'Complete response after surgery of 57.7% against 46.6% when added to a standard antiemetic in 1,147 patients, p<0.001',
        'Selective D2 and D3 antagonism with no appreciable affinity for other receptor types apart from low 5-HT2B and 5-HT7, per the label',
      ],
      unsupportedInferences: [
        'That the antipsychotics available in a country are the ones the evidence ranks highest — the second-ranked drug of fifteen has no United States psychiatric approval',
        'That the perioperative safety record transfers to sustained psychiatric use — the two evidence bases differ in route, amount, duration, population and endpoint',
        'That higher is better within the approved antiemetic range — one trial found the two amounts numerically identical and another found the lower one non-significant',
        'That receptor promiscuity is what makes an antipsychotic effective — the most selective drug in the ranking placed second',
      ],
      whatFailedInitially: [
        'The 5 mg arm of NCT02646566 did not separate from placebo, at p=0.109, while remaining on the label',
        'No dose-response relationship is visible across the two treatment trials',
        'No sponsor has run a United States registration programme for the psychiatric indication in which the drug ranks second of fifteen',
      ],
      realWorldOutcome: [
        'No United States pharmacy acquisition price is listed, because the only approved product is a hospital-administered injection rather than a dispensed prescription',
        'A routine first-line antipsychotic across Europe and much of the world, and an antiemetic in the United States',
        'Selective enough that sedation, weight gain, dry mouth and blood-pressure drop are largely absent, concentrating its adverse effects into prolactin elevation and movement effects',
        'A dose- and concentration-dependent QT effect, with ondansetron — the drug it is most often given with — named among the combinations warranting monitoring',
      ],
    },
    deliverySystem: {
      type: 'In the United States, an intravenous injection of 5 or 10 mg given as a single dose over one to two minutes. Elsewhere, an oral tablet taken daily.',
      description:
        'The United States product is a hospital-administered injection, which is why it has no pharmacy acquisition price in the CMS survey that prices the other drugs on this page. Elimination is substantially renal. There is no United States oral product and no long-acting form. The two forms of this molecule serve two different specialties in two different regulatory worlds, and only the injection has an American licence.',
      safetyProfile:
        'The United States label for BARHEMSYS carries no boxed warning. Its principal warning is QT prolongation, described as dose- and concentration-dependent, with use to be avoided in congenital long QT syndrome and in patients taking droperidol, and electrocardiographic monitoring recommended with pre-existing arrhythmias or conduction disorders, electrolyte abnormalities including hypokalaemia and hypomagnesaemia, congestive heart failure, and other QT-prolonging medicines including ondansetron. The adverse-effect profile of sustained antipsychotic use — prolactin elevation, movement disorders, tardive dyskinesia — is not described in the American label because the American label does not cover that use, and a reader should not take its absence there as evidence of absence.',
    },
    commonQuestions: [
      {
        q: 'If it works so well, why can I not get it for schizophrenia in America?',
        a: 'Because no company has run the United States registration programme required, not because a regulator examined it and said no. Amisulpride is a decades-old European generic; the trials that put it second of fifteen antipsychotics and first of thirty-two on positive symptoms were run in Europe and submitted to European authorities. The only American application anyone filed was for a different use entirely — a single intravenous injection to stop postoperative nausea, approved in February 2020 under NDA 209510. Running a full American schizophrenia programme on an off-patent molecule is a commercial decision, and nobody has made it.',
        auditNote: 'This is a gap in the regulatory record rather than a finding against the drug.',
      },
      {
        q: 'How much better than the other antipsychotics is it, really?',
        a: 'On measured symptom reduction, meaningfully. In 212 blinded trials and 43,049 patients its standardised mean difference against placebo was 0.66, behind only clozapine at 0.88 and ahead of olanzapine at 0.59, risperidone at 0.56 and haloperidol at 0.45. In a separate network of 402 studies published six years later it had the strongest effect on positive symptoms of 32 drugs at -0.69. It also had the best all-cause discontinuation and the least sedation of the fifteen. Two caveats belong with that: the authors of the second analysis state their confidence in the evidence was often low or very low and that differences between antipsychotics are mostly gradual, and none of these results comes from a trial designed to show that this specific drug beats a specific alternative.',
      },
      {
        q: 'Is a drug for psychosis safe to use just for nausea?',
        a: 'That is exactly the question the American evidence base is designed to answer and the European one is not. The three American trials gave a single injection of 5 or 10 mg to 2,420 patients around the time of surgery, and the principal warning that came out of them is dose- and concentration-dependent QT prolongation, with use avoided in congenital long QT syndrome and with droperidol. What those trials cannot tell you is anything about sustained dopamine blockade — prolactin elevation, movement disorders, tardive dyskinesia — because a single injection does not produce it. The absence of those warnings from the American label reflects the use it covers, not a property of the molecule.',
        auditNote:
          'The European psychiatric evidence and the American antiemetic evidence share a molecule and nothing else.',
      },
      {
        q: 'Which amount works better after surgery, 5 mg or 10 mg?',
        a: 'The trials do not settle it. In the 705-patient treatment trial, 10 mg gave complete response in 41.7% against 28.5% on placebo (p=0.003) while 5 mg gave 33.8% and did not reach significance (p=0.109). In the 568-patient treatment trial, both amounts gave 31.4% against 21.5% on placebo, and both reached p=0.016 — with the two arms numerically identical. The label recommends 5 or 10 mg without distinguishing them on efficacy, and the two trials disagree about whether the lower amount works at all. That is a genuinely unresolved question rather than an oversight in the reporting.',
      },
      {
        q: 'Why is there no price on this page?',
        a: 'Because the CMS National Average Drug Acquisition Cost survey prices drugs that pharmacies buy and dispense, and the only United States amisulpride product is an injection administered in hospital. It does not appear in that dataset. No verifiable per-dose cost of production exists for it either, so this page states neither a price nor a cost rather than estimating one. The synthesis is a single amide coupling between two purchased fragments, which is consistent with the drug being a cheap generic across Europe, but a description of a route is not a cost figure.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Leucht S et al. Comparative efficacy and tolerability of 15 antipsychotic drugs in schizophrenia: a multiple-treatments meta-analysis. Lancet 2013;382:951-962',
        identifier: '10.1016/S0140-6736(13)60733-3',
        kind: 'doi',
      },
      {
        label:
          'Huhn M et al. Comparative efficacy and tolerability of 32 oral antipsychotics for the acute treatment of adults with multi-episode schizophrenia: a systematic review and network meta-analysis. Lancet 2019;394:939-951',
        identifier: '10.1016/S0140-6736(19)31135-3',
        kind: 'doi',
      },
      {
        label:
          'NCT02337062 — phase 3 combination prophylaxis trial of intravenous amisulpride against postoperative nausea and vomiting, posted results',
        identifier: 'NCT02337062',
        kind: 'nct',
      },
      {
        label:
          'NCT02646566 — treatment of established postoperative nausea and vomiting after failed prophylaxis, posted results showing p=0.109 for the 5 mg arm',
        identifier: 'NCT02646566',
        kind: 'nct',
      },
      {
        label:
          'NCT02449291 — treatment of established postoperative nausea and vomiting without prior prophylaxis, posted results',
        identifier: 'NCT02449291',
        kind: 'nct',
      },
      {
        label:
          'United States prescribing information for BARHEMSYS (amisulpride injection), sections 1, 5.1, 7.2 and 12.1, via the openFDA drug label endpoint',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22amisulpride%22',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA: BARHEMSYS (amisulpride injection), NDA 209510, original approval 26 February 2020',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=209510',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 2159 — amisulpride structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2159',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
]
