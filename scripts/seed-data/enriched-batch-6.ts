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
            'US$0.1327 per tablet at pharmacy acquisition cost, median across listed generic products (CMS NADAC, effective 19 August 2026)',
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
]
