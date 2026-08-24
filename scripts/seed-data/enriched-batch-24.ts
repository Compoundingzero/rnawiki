import type { SeedDossier } from '@/lib/seed-types'

/**
 * Curated flagship dossiers — the respiratory and allergy drugs. The rescue inhaler, the leukotriene
 * blockers, the antihistamines, the oral steroid course, the single-isomer reliever and the anti-IgE
 * antibody: the medicines dispensed by the hundred million for conditions that come and go, where
 * the patient is usually better in a week either way and the drug takes the credit.
 *
 * Editorial layer written over the machine-enriched records: the verdict, the mechanism carousel
 * and the audits, which no pipeline can produce. The identity facts — slug, trade name, sponsor,
 * approval year, SMILES, molecular weight — are copied from the enriched record rather than
 * researched again.
 *
 * Every DOI, PMID, NCT number and FDA application number below was resolved against the NCBI
 * E-utilities, the ClinicalTrials.gov registry or the openFDA label endpoint at the time of
 * writing. Sample sizes, hazard ratios, confidence intervals and p-values are copied from the
 * published abstract or the FDA label, never from memory. Where a number could not be sourced, the
 * field is absent.
 *
 * Five conventions apply to the whole group.
 *
 * 1. LUNG FUNCTION AND SYMPTOM SCORES ARE SURROGATES AND EVERY PAGE SAYS SO. FEV1, peak flow, a
 *    sneeze count and a wheal diameter are what these drugs are licensed on. Exacerbations,
 *    hospital admissions and deaths are what a reader cares about, and the two are not the same
 *    measurement. Where a drug has a hard-endpoint trial it is on the page; where the hard endpoint
 *    went the wrong way — the SABA-only arm of SYGMA 1, the Arg/Arg arm of BARGE — it is on the
 *    page at the same weight as the success.
 *
 * 2. MOST OF THESE CONDITIONS RESOLVE ON THEIR OWN. Allergic rhinitis is seasonal, a cough after a
 *    virus stops, and a mild asthma exacerbation settles. That makes the placebo arm the most
 *    informative number on the page, and where the placebo arm is large it is quoted.
 *
 * 3. PRICING IS A PRICE, NOT A COST. Every price here is the CMS National Average Drug Acquisition
 *    Cost — what a United States retail pharmacy pays a wholesaler — and is labelled as such.
 *    `synthesisCostPerDose` is empty on every dossier in this file: the cost-of-production
 *    literature publishes a method and an aggregate, and its per-molecule respiratory figures sit
 *    in a supplementary appendix that could not be resolved and verified at the time of writing.
 *    An unverified cost is worse than an absent one. For an inhaler, most of the cost comes from
 *    the device rather than the small amount of active molecule.
 *
 * 4. NO DOSING, TITRATION, MONITORING OR PROCUREMENT GUIDANCE. Strengths and schedules appear only
 *    where they are part of a trial's description or a product's identity. Nothing here tells a
 *    reader what to take, how to change a dose, or where to obtain it.
 *
 * 5. THE MOST INSTRUCTIVE RECORD IN THIS GROUP IS A WARNING THAT TOOK TWENTY-TWO YEARS. Montelukast
 *    was approved in 1998; the boxed warning for neuropsychiatric events arrived in March 2020,
 *    after the signal had been visible in spontaneous reports for most of that period. That story
 *    is on the montelukast page because it is the clearest demonstration in this group of what an
 *    evidence audit is for.
 */

const NADAC_SOURCE = {
  label:
    'CMS National Average Drug Acquisition Cost (NADAC) survey — what United States retail pharmacies pay to acquire a drug',
  identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
  kind: 'url' as const,
}

const COST_OF_PRODUCTION_SOURCE = {
  label:
    'Hill A, Barber MJ, Gotham D. Estimated costs of production and potential prices for the WHO Essential Medicines List. BMJ Glob Health 2018;3:e000571 — the cost-of-production literature checked for this group. It publishes an estimation method over 148 medicines and an aggregate result; its per-molecule respiratory figures are in a supplementary appendix that could not be resolved at the time of writing, so no per-dose cost is stated on these pages',
  identifier: '10.1136/bmjgh-2017-000571',
  kind: 'doi' as const,
}

export const ENRICHED_BATCH_24_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // 1. Albuterol — the most reliably effective drug in this file over four hours, and the one whose
  //    own label says needing more of it is a sign that something else is wrong.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'albuterol',
    name: 'Albuterol',
    tradeName: 'Ventolin HFA / ProAir HFA / Proventil HFA',
    sponsor:
      'Originated at Allen & Hanburys in the United Kingdom as salbutamol; GlaxoSmithKline holds NDA 020983 for VENTOLIN HFA, with Teva, Merck and many generic manufacturers holding the other United States registrations',
    targetGene: 'ADRB2',
    targetProtein:
      'Beta-2 adrenergic receptor on airway smooth muscle; the same receptor makes up 10% to 50% of the beta-adrenoceptors in the human heart, which is why a lung drug produces a pulse',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1981,
    indication:
      'Treatment or prevention of bronchospasm in adult and paediatric patients aged 4 years and older with reversible obstructive airway disease, and prevention of exercise-induced bronchospasm in the same age group',
    patientFriendlyIndication: 'A sudden tight chest and wheeze — the blue rescue inhaler',
    anatomicalSite:
      'Beta-2 adrenergic receptors on the smooth muscle ring around the airways, from the trachea to the terminal bronchioles',
    conditionContext: {
      conditionExplainer:
        'An asthma attack is two things happening at once. The muscle wrapped around the airways contracts, narrowing the tube, and the lining of the tube swells and fills with mucus because it is inflamed. Albuterol undoes the first of those within minutes and does nothing at all about the second.',
      whyItMatters:
        'That split is the whole story of this drug. It is the fastest relief in respiratory medicine and it is a symptomatic treatment for a disease whose damage is inflammatory. The label states in section 5.3 that beta-agonist bronchodilators used alone may not be adequate to control asthma in many patients and that early consideration should be given to adding an anti-inflammatory agent.',
      whoTakesThis:
        'People with asthma, chronic obstructive pulmonary disease and other reversible airway narrowing, aged 4 and over for the metered-dose inhaler. Three trials in children under 4 did not establish efficacy in that age group.',
      clinicalGoals:
        'Open the airway now. Anything longer than the four hours the drug lasts is a job for a different medicine, and needing this one more often is information rather than a solution.',
    },
    oneSentenceVerdict:
      'A beta-2 agonist that relaxes airway smooth muscle within a measured 5.4 minutes and holds for about four hours, and which in SYGMA 1 — where 1,277 patients used a short-acting agonist alone as their only reliever — left an annual severe exacerbation rate of 0.20 against 0.07 for an inhaled steroid combination reliever, a rate ratio of 0.36.',
    laymanHowItWorks:
      'A band of muscle wraps around each airway. Albuterol lands on a receptor on the outside of those muscle cells and switches on a signal that lowers the calcium inside them, so the muscle cannot stay contracted and the airway springs open. It works whatever caused the squeeze, which is why it helps in cold air, exercise and allergy alike. It does nothing to the swelling and mucus underneath, and after about four hours it has washed out and the airway is exactly as inflamed as it was.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 88,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.2505 per millilitre of albuterol sulfate inhalation solution at United States pharmacy acquisition cost (CMS NADAC, median across 68 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Salbutamol was synthesised in 1966 and reached the United Kingdom market in 1969; the United States approval dates to 1981 and the molecule has been off patent for decades. What is not off patent is the device. The chlorofluorocarbon-to-hydrofluoroalkane propellant transition of the 2000s withdrew every cheap generic metered-dose inhaler from the United States market and replaced them with newly patented HFA products, so the price of a rescue inhaler rose while the price of the drug inside it did not. The nebuliser solution priced here is the form in which albuterol is genuinely cheap.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Nothing opens an airway faster than a short-acting beta-2 agonist, so the useful comparisons are not about speed. They are about what to add when the four hours run out, and about whether the single-isomer version is worth anything. Ipratropium added to albuterol in an acute childhood attack cut hospital admission by a quarter in 2,497 randomised children. An inhaled steroid taken with the reliever cut severe exacerbations by nearly two thirds against the agonist alone. Levalbuterol, the purified isomer, costs about the same and has not shown a clinically meaningful advantage.',
      conventionalRx: [
        {
          name: 'Ipratropium bromide (Atrovent)',
          class: 'Short-acting inhaled antimuscarinic',
          howItCompares:
            'Slower and weaker as a bronchodilator, and additive rather than competing. Adding it to a short-acting beta-agonist in an acute childhood asthma attack reduced hospital admission with a risk ratio of 0.73 (95% CI 0.63 to 0.85) across 15 studies and 2,497 children — 23 admissions per 100 on the agonist alone against 17 with the combination, a number needed to treat of 16.',
          typicalCost:
            'US$0.1089 per millilitre of inhalation solution at United States pharmacy acquisition cost (CMS NADAC, median across 60 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: high-quality evidence for an outcome that matters, in the setting where it matters. Cons: no role established as a standing treatment for mild asthma; dry mouth; must not be sprayed into the eye.',
        },
        {
          name: 'Levalbuterol (Xopenex)',
          class: 'The single R-isomer of albuterol',
          howItCompares:
            'Chemically half of what is in the albuterol inhaler, marketed on the argument that the discarded S-isomer is harmful. It now costs almost the same per millilitre of nebuliser solution — US$0.2676 against US$0.2505 — and the comparative clinical evidence has not established a benefit that a clinician could act on.',
          typicalCost:
            'US$0.2676 per millilitre of inhalation solution at United States pharmacy acquisition cost (CMS NADAC, median across 30 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: a defensible pharmacological rationale; identical speed of onset. Cons: the clinical case rests on surrogate differences in tremor and heart rate rather than on outcomes.',
        },
        {
          name: 'An inhaled corticosteroid, taken with the reliever rather than instead of it',
          class: 'Inhaled glucocorticoid, alone or combined with formoterol',
          howItCompares:
            'Treats the half of asthma that albuterol does not touch. In SYGMA 1, 3,836 patients with mild asthma were randomised to as-needed terbutaline, as-needed budesonide-formoterol or maintenance budesonide; the annual severe exacerbation rate was 0.20 on the short-acting agonist alone, 0.07 on the as-needed combination and 0.09 on maintenance budesonide.',
          typicalCost:
            'Not stated here: the fixed-dose budesonide-formoterol inhaler is a distinct product from the single-agent budesonide and formoterol entries in the NADAC extract used on this page, and no verified acquisition cost for the combination inhaler is quoted',
          prosAndCons:
            'Pros: the only arm of that trial that changed the exacerbation rate. Cons: an inhaled steroid does nothing in the first five minutes, which is exactly when a person reaches for an inhaler.',
        },
      ],
      naturalFoods: [
        {
          name: 'Caffeine — coffee, tea, cola',
          activeCompound: 'Caffeine, a methylxanthine chemically related to theophylline',
          biologicalMechanism:
            'A weak non-selective adenosine receptor antagonist and phosphodiesterase inhibitor that raises intracellular cyclic AMP in airway smooth muscle by a different route from the beta-2 receptor, and also reduces respiratory muscle fatigue.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: a Cochrane review of seven crossover trials in 75 people with mild to moderate asthma found caffeine improved FEV1 by a standardised mean difference of 0.72 (95% CI 0.25 to 1.20), about a 5% mean improvement, for up to two hours, with mid-expiratory flow improved to four hours. That is a fraction of what an inhaler does in five minutes and it is not a treatment for an attack.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Count the canisters',
          action: 'Keep track of how many rescue inhalers you get through in a year.',
          patientImpact:
            'A Swedish national cohort of 365,324 asthma patients aged 12 to 45 found that collecting 3 to 5 canisters a year carried a hazard ratio for exacerbation of 1.26 and for death of 1.26, rising to 1.77 and 2.35 at 11 or more canisters a year, against two or fewer.',
          clinicalPrecaution:
            'This is an association in a registry, not a demonstration that the inhaler caused the deaths — heavy use is also the signature of severe and undertreated disease. The label makes the same point prospectively in section 5.2: needing more doses than usual may be a marker of destabilisation and requires reassessment.',
        },
        {
          name: 'Prime a new or dropped inhaler away from your face',
          action:
            'Release four sprays into the air, shaking before each, before the first use of a canister, after it has been dropped, or after more than two weeks unused.',
          patientImpact:
            'This is the manufacturer instruction in the label description. It also matters for a safety reason: the label records that paradoxical bronchospasm from an inhaled formulation frequently occurs with the first use of a new canister.',
          clinicalPrecaution:
            'Paradoxical bronchospasm — the inhaler making breathing worse — may be life threatening. The label directs immediate discontinuation and alternative therapy.',
        },
        {
          name: 'Do not treat it as a substitute for a preventer',
          action: 'Say if you have stopped a steroid inhaler and are relying on the blue one.',
          patientImpact:
            'Section 5.3 of the label states that beta-adrenergic agonist bronchodilators used alone may not be adequate to control asthma in many patients and that early consideration should be given to adding anti-inflammatory agents such as corticosteroids.',
          clinicalPrecaution:
            'Section 5.5 states that fatalities have been reported in association with excessive use of inhaled sympathomimetic drugs in asthma, and directs that the recommended dose not be exceeded.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(C)(C)NCC(C1=CC(=C(C=C1)O)CO)O',
      chemicalFormula: 'C13H21NO3',
      molecularWeight:
        '239.31 g/mol (free base); dispensed as the sulfate at a molecular weight of 576.7, formula (C13H21NO3)2·H2SO4',
      targetReceptorAffinity:
        'Preferentially beta-2 selective rather than absolutely selective. The label states that beta-2 adrenoceptors make up 10% to 50% of the total beta-adrenoceptors in the human heart, that the function of those receptors has not been established, and that their presence raises the possibility that even selective beta-2 agonists may have cardiac effects. The marketed product is the racemate; the R-enantiomer carries the receptor activity. Apparent terminal plasma half-life after inhalation is about 4.6 hours, and a 1,080 mcg dose in 12 healthy subjects produced mean peak plasma concentrations of about 3 ng/mL.',
      structureSource: {
        label:
          'PubChem CID 2083 (albuterol) — canonical SMILES, molecular formula and weight, as carried on the enriched record; sulfate salt weight and formula from the VENTOLIN HFA label, section 11',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2083',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'alb-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Establish the enantiomeric ratio of the starting material',
          description:
            'The marketed inhaler contains the racemate and the single-isomer product does not, so the enantiomeric ratio is the identity of the article, not a purity footnote. A racemic assay that reports only total albuterol cannot distinguish the two products.',
          reagentsAndBuffer:
            'Albuterol sulfate USP reference standard, chiral HPLC on a cyclodextrin or protein-bonded phase, circular dichroism detection, Karl Fischer titration for water content',
        },
        {
          id: 'alb-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Build the saligenin head and the tert-butylaminoethanol side chain',
          description:
            'Albuterol is a salbutamol-type saligenin: a catechol replaced by a 4-hydroxy-3-hydroxymethyl phenyl ring, which is the change that stops catechol-O-methyltransferase destroying it and gives the drug its oral and inhaled duration. The side chain is a secondary alcohol bearing a tert-butylamine, and the bulky tert-butyl group is what buys beta-2 preference over beta-1.',
          dependsOnStepId: 'alb-w1',
          reagentsAndBuffer:
            'Substituted acetophenone precursor, bromination and amination with tert-butylamine, ester or ketone reduction with a borohydride, sulfuric acid for salt formation, anhydrous solvents',
        },
        {
          id: 'alb-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallise the hemisulfate and control particle size',
          description:
            'For a metered-dose inhaler the crystal habit and particle size distribution decide how much drug reaches the lung, so purification is inseparable from micronisation. A chemically perfect batch with the wrong particle size distribution is a failed batch.',
          dependsOnStepId: 'alb-w2',
          reagentsAndBuffer:
            'Recrystallisation from aqueous ethanol, jet milling or controlled crystallisation to a respirable fraction, laser diffraction particle sizing, X-ray powder diffraction for polymorph identity',
        },
        {
          id: 'alb-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Measure the delivered dose from the mouthpiece, not from the valve',
          description:
            'The label distinguishes 120 mcg of albuterol sulfate leaving the valve from 108 mcg leaving the mouthpiece, equivalent to 90 mcg of albuterol base. Those three numbers describe the same actuation and only the last is what a patient could possibly inhale.',
          dependsOnStepId: 'alb-w3',
          reagentsAndBuffer:
            'Dose uniformity sampling apparatus, Andersen cascade impactor or next generation impactor at 28.3 L/min, HFA-134a propellant suspension, HPLC quantification of collected stages',
        },
        {
          id: 'alb-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Test relaxation against more than one spasmogen',
          description:
            'The label claims albuterol acts as a functional antagonist that relaxes the airway irrespective of the spasmogen involved, protecting against all bronchoconstrictor challenges. The assay that tests that claim rather than assuming it precontracts tissue with several unrelated agents — histamine, methacholine, leukotriene D4 — and shows relaxation against each.',
          dependsOnStepId: 'alb-w4',
          reagentsAndBuffer:
            'Human or guinea-pig tracheal rings in Krebs-Henseleit buffer, histamine, methacholine and leukotriene D4 as separate precontraction agents, isometric force transducers, cyclic AMP accumulation assay in primary airway smooth muscle cells',
        },
      ],
    },
    keyAudits: [
      {
        id: 'alb-a1',
        category: 'measured',
        title: 'Five minutes to open, four hours to close again',
        laymanSummary:
          'The speed is real and it was timed. In the responders in the registration trial, half the maximum effect arrived in under six minutes, the peak came at just under an hour, and it was gone in about four hours.',
        technicalDetails:
          'Efficacy was established in two 12-week randomised, double-blind, placebo-controlled trials in 610 subjects aged 12 and over with mild to moderate asthma, using serial FEV1 as percentage change from test-day baseline. Two inhalations produced significantly greater improvement in FEV1 than placebo at day 1 and again at week 12, so the effect did not wear off over the treatment period. In the responder population, defined as a 15% or greater rise in FEV1 within 30 minutes of dosing, the mean time to onset of that 15% rise was 5.4 minutes, the mean time to peak effect was 56 minutes, and the mean duration of effect was approximately 4 hours, reaching 6 hours in some subjects. A separate 2-week trial in 135 children aged 4 to 11 gave the same pattern.',
        evidenceSource:
          'VENTOLIN HFA (albuterol sulfate) United States prescribing information, section 14.1 (NDA 020983)',
        measuredMetric:
          'Serial FEV1 as percentage change from pre-dose baseline, and time to onset, peak and offset in responders',
        auditFlag: 'verified',
      },
      {
        id: 'alb-a2',
        category: 'conclusion_shift',
        title: 'Using it alone stopped being a recommended way to treat asthma',
        laymanSummary:
          'For decades mild asthma was treated with the blue inhaler and nothing else. A trial that put 1,277 people on a reliever alone and 1,277 on a reliever containing a steroid found nearly three times the severe attacks in the first group, and the guidelines changed.',
        technicalDetails:
          'SYGMA 1 randomised 3,836 patients aged 12 and over with mild asthma to twice-daily placebo plus as-needed terbutaline, twice-daily placebo plus as-needed budesonide-formoterol, or twice-daily budesonide plus as-needed terbutaline, for 52 weeks. The annual rate of severe exacerbations was 0.20 with the short-acting agonist alone, 0.07 with the as-needed steroid combination and 0.09 with maintenance budesonide — a rate ratio of 0.36 (95% CI 0.27 to 0.49) for the combination against the agonist alone. The symptom endpoint moved far less: 34.4% against 31.1% of weeks well controlled, odds ratio 1.14 (95% CI 1.00 to 1.30, p=0.046). The lesson is not that albuterol stopped working. It is that the thing it fixes and the thing that lands people in hospital are different, and a strategy built only on the first leaves the second untreated.',
        evidenceSource: "O'Byrne PM et al., N Engl J Med 2018;378:1865-1876 (SYGMA 1, NCT02149199)",
        doi: '10.1056/NEJMoa1715274',
        measuredMetric:
          'Annual rate of severe asthma exacerbations with a short-acting beta-agonist alone against an as-needed inhaled corticosteroid–formoterol reliever',
        auditFlag: 'verified',
      },
      {
        id: 'alb-a3',
        category: 'failed',
        title: 'Taking it on a schedule adds nothing to taking it when you need it',
        laymanSummary:
          'Four puffs a day, every day, was tested against using the inhaler only when symptoms came. Over sixteen weeks the morning peak flow was identical, and so was everything else measured.',
        technicalDetails:
          'The Asthma Clinical Research Network randomised 255 patients with mild chronic stable asthma to inhaled albuterol on a regular schedule (n=126) or as needed only (n=129) for 16 weeks, double-blind. Morning peak expiratory flow, the primary outcome, was 416 L/min after run-in and 414 L/min after treatment in the scheduled group, and 424 L/min at both times in the as-needed group (p=0.71). There were no significant differences in peak flow variability, FEV1, supplemental albuterol use, symptoms, quality of life, or methacholine responsiveness. The small differences in evening peak flow and short-term bronchodilator response were judged clinically unimportant. The authors concluded that inhaled albuterol should be prescribed on an as-needed basis — a negative result that settled a real controversy about whether regular use was actively harmful, and simultaneously removed any reason for it.',
        evidenceSource:
          'Drazen JM et al., N Engl J Med 1996;335:841-847 (Asthma Clinical Research Network)',
        doi: '10.1056/NEJM199609193351202',
        measuredMetric:
          'Morning peak expiratory flow after 16 weeks of scheduled against as-needed albuterol',
        auditFlag: 'verified',
      },
      {
        id: 'alb-a4',
        category: 'conclusion_shift',
        title: 'In one sixth of people, regular use made lung function worse',
        laymanSummary:
          'A single letter difference in the beta-2 receptor gene flipped the result. People with two copies of the arginine version got worse on regular albuterol; people with two copies of the glycine version got better. The gap between them was larger than the drug effect itself.',
        technicalDetails:
          'BARGE enrolled patients with mild asthma in pairs matched on FEV1 by genotype at residue 16 of the beta-2 adrenergic receptor: Arg/Arg (n=37) or Gly/Gly (n=41). Regularly scheduled albuterol or placebo was given in a masked crossover design for 16-week periods, with as-needed albuterol withdrawn and ipratropium substituted as the reliever. Morning peak expiratory flow was the primary outcome. Gly/Gly patients gained 14 L/min on regular albuterol against placebo (95% CI 3 to 25, p=0.0175). Arg/Arg patients lost 10 L/min (95% CI -19 to -2, p=0.0209). The genotype-attributable treatment difference was -24 L/min (95% CI -37 to -12, p=0.0003), with matching genotype-specific effects on FEV1, symptoms and reliever use. Homozygous Arg16 occurs in roughly one in six people. Nothing in the United States label mentions this, and no genotype-directed prescribing followed.',
        evidenceSource:
          'Israel E et al., Lancet 2004;364:1505-1512 (NHLBI Asthma Clinical Research Network)',
        doi: '10.1016/S0140-6736(04)17273-5',
        measuredMetric:
          'Morning peak expiratory flow on regularly scheduled albuterol against placebo, stratified by ADRB2 codon 16 genotype',
        auditFlag: 'contested',
      },
      {
        id: 'alb-a5',
        category: 'failed',
        title: 'It was given to wheezing infants for years and it does not work there',
        laymanSummary:
          'Bronchiolitis in a baby looks like asthma and is not. The 2006 American paediatric guideline allowed a trial of albuterol; the 2014 revision issued a strong recommendation against giving it at all.',
        technicalDetails:
          'The American Academy of Pediatrics clinical practice guideline on the diagnosis, management and prevention of bronchiolitis, revised in 2014 for children aged 1 through 23 months, replaced the 2006 guideline that had permitted a monitored trial of a bronchodilator. The revision states that clinicians should not administer albuterol or salbutamol to infants and children with a diagnosis of bronchiolitis, at evidence quality B and strength strong recommendation. The mechanism explains the finding: airway obstruction in bronchiolitis is sloughed epithelium, oedema and mucus plugging in airways whose smooth muscle is scant, and relaxing smooth muscle that is not the obstruction cannot help. Separately, the albuterol label records that three trials in children between birth and 4 years of age did not establish efficacy in that age group.',
        evidenceSource:
          'Ralston SL et al. Clinical Practice Guideline: The Diagnosis, Management, and Prevention of Bronchiolitis. Pediatrics 2014;134:e1474-e1502; VENTOLIN HFA label section 8.4',
        doi: '10.1542/peds.2014-2742',
        measuredMetric:
          'Guideline recommendation strength for bronchodilators in bronchiolitis, 2006 against 2014',
        auditFlag: 'verified',
      },
      {
        id: 'alb-a6',
        category: 'inferred',
        title: 'The mortality signal is a marker as much as a cause',
        laymanSummary:
          'People who get through many rescue inhalers a year die more often. That is solidly measured. Whether the inhalers are doing the killing, or are simply the fingerprint of asthma bad enough to kill, is not settled by the data that show it.',
        technicalDetails:
          'The SABINA Swedish cohort linked national registries for 365,324 asthma patients aged 12 to 45 with a mean 85.4 months of follow-up. Thirty per cent collected three or more short-acting beta-agonist canisters a year. Against two or fewer canisters, exacerbation hazard ratios were 1.26 (95% CI 1.24 to 1.28) at 3 to 5 canisters, 1.44 (1.41 to 1.46) at 6 to 10 and 1.77 (1.72 to 1.83) at 11 or more; mortality hazard ratios across 2,564 deaths were 1.26 (1.14 to 1.39), 1.67 (1.49 to 1.87) and 2.35 (2.02 to 2.72). This is an observational cohort with confounding by indication built into it: the people using the most reliever are the people with the worst disease and, frequently, the least controller treatment. The label states directly that fatalities have been reported with excessive use of inhaled sympathomimetics and that the exact cause of death is unknown. Both statements can be true, and neither licenses the claim that reducing canister counts by itself reduces deaths.',
        evidenceSource:
          'Nwaru BI et al., Eur Respir J 2020;55:1901872 (SABINA); VENTOLIN HFA label section 5.5',
        doi: '10.1183/13993003.01872-2019',
        inferredClaim:
          'That heavy rescue-inhaler use causes the excess mortality associated with it, rather than marking the severity and undertreatment that cause both',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A cloud of drug, most of which never reaches the lung',
        laymanDesc:
          'One press releases a measured puff. Some of it lands in the mouth and throat and is swallowed; the fraction that reaches the airways is what does the work.',
        molecularDetail:
          'Each actuation delivers 120 mcg of albuterol sulfate from the valve, 108 mcg from the mouthpiece, equivalent to 90 mcg of albuterol base. Systemic levels after recommended doses are low; a supratherapeutic 1,080 mcg dose in 12 healthy subjects gave mean peak plasma concentrations of about 3 ng/mL. Tmax was 0.42 hours with the HFA-134a propellant against 0.17 hours with the older CFC formulation.',
        iconName: 'Wind',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It never goes inside a cell',
        laymanDesc:
          'The target sits on the outside surface of the muscle cell. Albuterol docks there from the airway side and the entire signal is passed inwards by the receptor.',
        molecularDetail:
          'The beta-2 adrenergic receptor is a seven-transmembrane G-protein-coupled receptor. Albuterol is a hydrophilic saligenin: the catechol ring of adrenaline is replaced by a 4-hydroxy-3-hydroxymethylphenyl group, which resists catechol-O-methyltransferase and keeps the molecule at the extracellular surface rather than in the membrane, giving a fast onset and a short duration.',
        iconName: 'Layers',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The receptor is switched on, in the lung and a little in the heart',
        laymanDesc:
          'The airway receptor is the intended one. The same receptor exists on the heart, which is why a rescue inhaler can make the pulse race and the hands shake.',
        molecularDetail:
          'Preferential rather than absolute beta-2 selectivity. The label records that beta-2 adrenoceptors constitute 10% to 50% of total beta-adrenoceptors in the human heart, that their function has not been established, and that their presence raises the possibility of cardiac effects even from selective agonists. Reported electrocardiogram changes include T wave flattening, QTc prolongation and ST segment depression, of unknown clinical relevance.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Calcium falls and the muscle cannot hold its grip',
        laymanDesc:
          'The switched-on receptor raises a second messenger inside the cell, which strips calcium away from the contraction machinery. The muscle band releases.',
        molecularDetail:
          'Receptor occupancy activates adenylyl cyclase, raising intracellular cyclic AMP; cyclic AMP activates protein kinase A, which inhibits phosphorylation of myosin and lowers intracellular ionic calcium, producing relaxation. Because the step is downstream of the receptors that constrict, albuterol acts as a functional antagonist and relaxes the airway irrespective of the spasmogen involved. Raised cyclic AMP also inhibits mediator release from airway mast cells.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The airway opens in minutes and closes again in hours',
        laymanDesc:
          'FEV1 starts rising within six minutes, peaks at about an hour, and is back to baseline in roughly four.',
        molecularDetail:
          'In responders in the registration trials, mean time to a 15% FEV1 increase was 5.4 minutes, mean time to peak effect 56 minutes, and mean duration approximately 4 hours, up to 6 hours in some subjects. Apparent terminal plasma half-life is about 4.6 hours.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'The inflammation underneath is untouched',
        laymanDesc:
          'Nothing in this sequence reduces the swelling or the mucus. That is why needing the inhaler more often is a signal rather than a solution.',
        molecularDetail:
          'Label section 5.3 states that beta-adrenergic agonist bronchodilators used alone may not be adequate to control asthma in many patients, and directs early consideration of anti-inflammatory agents. Section 5.2 states that needing more doses than usual may be a marker of destabilisation requiring reassessment. In SYGMA 1 the severe exacerbation rate on a short-acting agonist alone was 0.20 per year against 0.07 when an inhaled steroid was carried in the reliever.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Two 12-week placebo-controlled registration trials (NDA 020983)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 610,
        primaryEndpoint:
          'Serial FEV1 as percentage change from test-day baseline over 12 weeks in subjects aged 12 and over with mild to moderate asthma',
        endpointMet: true,
        statisticalPValue:
          'Significantly greater improvement in FEV1 than placebo at day 1 (n=297) and at week 12 (n=249); in responders, mean onset 5.4 minutes, mean time to peak 56 minutes, mean duration approximately 4 hours',
        unreportedAdverseSignals:
          'These are lung-function trials. No exacerbation, hospitalisation or mortality endpoint was measured in them, which is why the effect on the outcomes people care about had to come from other trials entirely.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'ACRN regular versus as-needed albuterol (N Engl J Med 1996;335:841-847)',
        phase: 'Phase 4, randomised, double-blind, multicentre',
        sampleSize: 255,
        primaryEndpoint:
          'Morning peak expiratory flow after 16 weeks of regularly scheduled against as-needed inhaled albuterol in mild chronic stable asthma',
        endpointMet: false,
        statisticalPValue:
          '416 to 414 L/min scheduled against 424 to 424 L/min as needed, p=0.71; no significant difference in FEV1, symptoms, quality of life or methacholine responsiveness',
        unreportedAdverseSignals:
          'A deliberately two-sided question. The trial was powered to detect harm from regular use as well as benefit, and found neither. It is the reason as-needed use became the standard prescription.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'BARGE genotype-stratified crossover (Lancet 2004;364:1505-1512)',
        phase: 'Phase 4, randomised, double-blind, placebo-controlled crossover',
        sampleSize: 78,
        primaryEndpoint:
          'Morning peak expiratory flow during regularly scheduled albuterol against placebo, in patients matched on FEV1 and stratified by ADRB2 codon 16 genotype',
        endpointMet: true,
        statisticalPValue:
          'Gly/Gly +14 L/min (95% CI 3 to 25, p=0.0175); Arg/Arg -10 L/min (95% CI -19 to -2, p=0.0209); genotype-attributable difference -24 L/min (95% CI -37 to -12, p=0.0003)',
        unreportedAdverseSignals:
          'Thirty-seven Arg/Arg and 41 Gly/Gly patients is a small trial for a pharmacogenetic claim, and four of 41 matched pairs withdrew before randomisation. The result has not translated into genotype-directed prescribing or into the label.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'SYGMA 1 (NCT02149199)',
        phase: 'Phase 3, randomised, double-blind, 52 weeks',
        sampleSize: 3836,
        primaryEndpoint:
          'Electronically recorded percentage of weeks with well-controlled asthma, as-needed budesonide-formoterol against as-needed terbutaline in mild asthma',
        endpointMet: true,
        statisticalPValue:
          '34.4% against 31.1% of weeks well controlled, odds ratio 1.14 (95% CI 1.00 to 1.30), p=0.046',
        unreportedAdverseSignals:
          'The primary endpoint barely moved; the secondary endpoint moved a great deal. Annual severe exacerbations were 0.20 on the short-acting agonist alone against 0.07 on the steroid-containing reliever, rate ratio 0.36 (95% CI 0.27 to 0.49). A trial can be won on a symptom score and be important for something else.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Mean onset of a 15% FEV1 rise at 5.4 minutes, peak at 56 minutes and duration of about 4 hours in responders, across two 12-week placebo-controlled trials in 610 patients',
        'No difference in morning peak flow between scheduled and as-needed use over 16 weeks in 255 patients (416 to 414 against 424 to 424 L/min, p=0.71)',
        'A genotype-attributable treatment difference of -24 L/min in morning peak flow between Arg/Arg and Gly/Gly patients on regular albuterol (p=0.0003)',
        'An annual severe exacerbation rate of 0.20 on a short-acting agonist alone against 0.07 on an as-needed inhaled steroid combination in 3,836 patients with mild asthma',
        'Reduced hospital admission when ipratropium is added to a short-acting agonist in acute childhood asthma: RR 0.73 (95% CI 0.63 to 0.85), 2,497 children',
      ],
      unsupportedInferences: [
        'That fast, reliable relief of bronchospasm amounts to control of asthma — the label itself says a beta-agonist alone may not be adequate in many patients',
        'That the mortality gradient with rising canister counts is caused by the canisters, when the same registry cannot separate heavy use from severe undertreated disease',
        'That because it opens adult asthmatic airways it will open a wheezing infant’s, which the bronchiolitis evidence contradicts',
        'That the drug behaves the same way in everyone taking it regularly, when codon 16 genotype reversed the direction of the effect',
      ],
      whatFailedInitially: [
        'Regularly scheduled dosing produced no benefit at all over as-needed dosing in mild asthma',
        'In Arg/Arg homozygotes, regularly scheduled dosing produced worse morning peak flow than placebo',
        'Three trials in children from birth to 4 years failed to establish efficacy, and the label says so',
        'The 2014 American paediatric guideline issued a strong recommendation against using it in bronchiolitis, reversing the 2006 position',
        'Paradoxical bronchospasm, which may be life threatening, occurs with an inhaled bronchodilator and most often with the first use of a new canister',
      ],
      realWorldOutcome: [
        'Salbutamol reached the market in 1969 and albuterol has been United States standard of care since 1981; it is on the WHO Model List of Essential Medicines',
        'The chlorofluorocarbon phase-out removed cheap generic metered-dose inhalers from the United States market and replaced them with newly patented HFA devices, raising the price of an old molecule',
        'The nebuliser solution costs about twenty-five United States cents a millilitre at pharmacy acquisition cost; the device, not the drug, is the expense',
        'Guidelines worldwide moved between 2019 and 2021 from reliever-only treatment of mild asthma to a reliever containing an inhaled corticosteroid, on the strength of SYGMA and its successors',
      ],
    },
    deliverySystem: {
      type: 'Pressurised metered-dose inhaler delivering 90 mcg of albuterol base per actuation; also nebuliser solution, dry-powder inhaler, oral tablets and syrup',
      description:
        'The inhaled route exists to put a systemically active sympathomimetic where it is needed and nowhere else. Systemic levels after recommended inhaled doses are low. The canister is a microcrystalline suspension of albuterol sulfate in HFA-134a propellant with no other excipient, and must be primed with four sprays before first use, after a drop, or after more than two weeks unused. Oral formulations reach the same receptors by the same mechanism with far more tremor and tachycardia for the same bronchodilation.',
      safetyProfile:
        'Contraindicated only in hypersensitivity to an ingredient. Paradoxical bronchospasm may be life threatening and most often follows the first use of a new canister; the label directs immediate discontinuation. Fatalities have been reported with excessive use of inhaled sympathomimetics. Cardiovascular effects include pulse and blood pressure change and electrocardiogram changes of unknown clinical relevance. Significant hypokalaemia may occur through intracellular shunting, usually transient. Caution in convulsive disorders, hyperthyroidism and diabetes; large intravenous doses have aggravated pre-existing diabetes and ketoacidosis. Adverse reactions at 3% or more in trials were throat irritation, viral respiratory infections, upper respiratory inflammation, cough and musculoskeletal pain.',
    },
    commonQuestions: [
      {
        q: 'If my inhaler works, why do I also need a preventer?',
        a: 'Because they treat different halves of the same attack. Albuterol relaxes the muscle band around the airway, which is what makes you wheeze, and it does that within about five minutes. It does nothing to the swelling and mucus in the airway lining, which is what makes the disease dangerous. SYGMA 1 put that difference into numbers: 3,836 people with mild asthma were randomised, and the annual rate of severe exacerbations was 0.20 on a short-acting reliever alone against 0.07 when the reliever also contained an inhaled steroid. The label says the same thing in plainer language — a beta-agonist alone may not be adequate to control asthma in many patients.',
        auditNote:
          'The symptom endpoint in that trial barely moved and the exacerbation endpoint moved by nearly two thirds. Feeling better and being safer were measuring different things.',
      },
      {
        q: 'Is it dangerous to use my inhaler a lot?',
        a: 'It is a warning sign, and possibly more than that. A Swedish registry of 365,324 people with asthma found that those collecting 11 or more canisters a year had 1.77 times the exacerbation risk and 2.35 times the mortality of those collecting two or fewer. But that study cannot tell you whether the inhaler caused the harm or simply marked the people whose asthma was severe and whose preventer treatment was inadequate — almost certainly some of both. The prescribing information takes the prospective position: needing more doses than usual may be a marker of destabilisation and requires reassessment, and fatalities have been reported in association with excessive use of inhaled sympathomimetics, with the exact cause of death unknown.',
      },
      {
        q: 'Should I take it four times a day even when I feel fine?',
        a: 'That was tested directly and the answer was no. The Asthma Clinical Research Network randomised 255 people with mild stable asthma to regularly scheduled albuterol or as-needed albuterol for 16 weeks. Morning peak flow went from 416 to 414 L/min on the schedule and stayed at 424 L/min as needed, p=0.71, and nothing else differed either — not FEV1, not symptoms, not quality of life, not airway responsiveness. The trial was designed to detect harm as much as benefit and found neither, which is why as-needed use became the standard instruction.',
      },
      {
        q: 'Why does it make my hands shake and my heart pound?',
        a: 'Because beta-2 receptors are not only in the lung. They are on skeletal muscle, which is where the tremor comes from, and the label records that beta-2 receptors make up somewhere between a tenth and a half of all the beta receptors in the human heart. The selectivity that makes albuterol safer than the older non-selective agonists is preferential, not absolute. Reported effects include changes in pulse and blood pressure and electrocardiogram changes such as T wave flattening and QTc prolongation, whose clinical relevance the label says is unknown. Transient falls in blood potassium also occur, by potassium being driven into cells rather than lost from the body.',
      },
      {
        q: 'My baby is wheezing with a chest infection. Will a puff of this help?',
        a: 'For bronchiolitis, the evidence says no, and the guidance is unusually blunt about it. The American Academy of Pediatrics guideline revised in 2014 states that clinicians should not administer albuterol to infants and children diagnosed with bronchiolitis — a strong recommendation, and a reversal of the 2006 guideline that had allowed a monitored trial of the drug. The reason is mechanical: in bronchiolitis the airway is blocked by shed lining cells, swelling and mucus, in airways that have very little smooth muscle to relax. Relaxing muscle that is not the obstruction cannot open it. Separately, the albuterol label records that three trials in children under 4 failed to establish efficacy at all.',
      },
      {
        q: 'Is levalbuterol better than albuterol?',
        a: 'The argument for it is that the albuterol inhaler contains equal amounts of two mirror-image molecules, only one of which activates the receptor, and that the other may be inert or mildly harmful. Levalbuterol contains only the active one. What has not been established is a clinical difference a patient would notice: the comparative work rests on surrogate differences in heart rate and tremor rather than on exacerbations or admissions. The economic argument that once existed has also gone. At pharmacy acquisition cost the two nebuliser solutions are now within seven per cent of each other, US$0.2676 against US$0.2505 per millilitre.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: false,
    sources: [
      {
        label:
          'VENTOLIN HFA (albuterol sulfate) inhalation aerosol United States prescribing information — Indications 1.1 and 1.2, Contraindications 4, Warnings 5.1 to 5.8, Adverse Reactions 6.1, Description 11, Clinical Pharmacology 12.1 and 12.3, Clinical Studies 14.1 (NDA 020983)',
        identifier:
          'https://api.fda.gov/drug/drugsfda.json?search=application_number:%22NDA020983%22',
        kind: 'regulatory',
      },
      {
        label:
          "O'Byrne PM, FitzGerald JM, Bateman ED, et al. Inhaled Combined Budesonide-Formoterol as Needed in Mild Asthma. N Engl J Med 2018;378:1865-1876 (SYGMA 1)",
        identifier: '10.1056/NEJMoa1715274',
        kind: 'doi',
      },
      {
        label:
          'Drazen JM, Israel E, Boushey HA, et al. Comparison of regularly scheduled with as-needed use of albuterol in mild asthma. N Engl J Med 1996;335:841-847',
        identifier: '10.1056/NEJM199609193351202',
        kind: 'doi',
      },
      {
        label:
          'Israel E, Chinchilli VM, Ford JG, et al. Use of regularly scheduled albuterol treatment in asthma: genotype-stratified, randomised, placebo-controlled cross-over trial. Lancet 2004;364:1505-1512 (BARGE)',
        identifier: '10.1016/S0140-6736(04)17273-5',
        kind: 'doi',
      },
      {
        label:
          'Nwaru BI, Ekström M, Hasvold P, et al. Overuse of short-acting β2-agonists in asthma is associated with increased risk of exacerbation and mortality: a nationwide cohort study of the global SABINA programme. Eur Respir J 2020;55:1901872',
        identifier: '10.1183/13993003.01872-2019',
        kind: 'doi',
      },
      {
        label:
          'Ralston SL, Lieberthal AS, Meissner HC, et al. Clinical Practice Guideline: The Diagnosis, Management, and Prevention of Bronchiolitis. Pediatrics 2014;134:e1474-e1502',
        identifier: '10.1542/peds.2014-2742',
        kind: 'doi',
      },
      {
        label:
          'Griffiths B, Ducharme FM. Combined inhaled anticholinergics and short-acting beta2-agonists for initial treatment of acute asthma in children. Cochrane Database Syst Rev 2013;(8):CD000060',
        identifier: '10.1002/14651858.CD000060.pub2',
        kind: 'doi',
      },
      {
        label:
          'Welsh EJ, Bara A, Barley E, Cates CJ. Caffeine for asthma. Cochrane Database Syst Rev 2010;(1):CD001112',
        identifier: '10.1002/14651858.CD001112.pub2',
        kind: 'doi',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — albuterol, 68 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 2083 — albuterol structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2083',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 2. Montelukast — approved in 1998, boxed for psychiatric harm in 2020, and in its own label
  //    beaten by loratadine and by cetirizine in the hay fever trials it ran against them.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'montelukast',
    name: 'Montelukast',
    tradeName: 'Singulair',
    sponsor:
      'Developed by Merck & Co, which holds NDA 020829 (film-coated tablets), NDA 020830 (chewable tablets) and NDA 021409 (oral granules); the United States registration is now with Organon, and generics have been available since 2012',
    targetGene: 'CYSLTR1',
    targetProtein:
      'Cysteinyl leukotriene type-1 receptor (CysLT1), on airway smooth muscle cells, airway macrophages, eosinophils and certain myeloid stem cells',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1998,
    indication:
      'Prophylaxis and chronic treatment of asthma in patients 12 months of age and older; acute prevention of exercise-induced bronchoconstriction in patients 6 years and older; relief of symptoms of seasonal allergic rhinitis in patients 2 years and older and perennial allergic rhinitis in patients 6 months and older, reserved for those with an inadequate response or intolerance to alternative therapies',
    patientFriendlyIndication:
      'Asthma taken as a daily tablet, and hay fever when other drugs fail',
    anatomicalSite:
      'CysLT1 receptors in the airway and nasal mucosa. The label also records that montelukast distributes into the brain in rats, which is the only mechanistic fact it offers about the boxed warning.',
    conditionContext: {
      conditionExplainer:
        'Cysteinyl leukotrienes are inflammatory signals released by mast cells and eosinophils during an allergic reaction. They make airways swell and squeeze, and they make the nose block and run. Montelukast blocks the receptor they act on.',
      whyItMatters:
        'It is a tablet rather than an inhaler, which is why it became one of the most prescribed asthma drugs in the world. Convenience is a real clinical property and it is not the same property as efficacy: in head-to-head randomised evidence a leukotriene blocker is a weaker asthma controller than an inhaled steroid, and in its own registration trials it was a weaker hay fever drug than the antihistamines it was tested against.',
      whoTakesThis:
        'People with persistent asthma, people who wheeze on exercise, and people with allergic rhinitis — the last group only, since March 2020, when other allergy treatments have not worked or cannot be tolerated.',
      clinicalGoals:
        'Fewer symptoms and fewer exacerbations. The label is explicit that it is not for an acute attack and must not be abruptly substituted for an inhaled or oral corticosteroid.',
    },
    oneSentenceVerdict:
      'A cysteinyl leukotriene receptor blocker that raised FEV1 by 13.0% against 4.2% on placebo in its pivotal asthma trial, carries a boxed warning for suicidal thoughts and behaviour added in March 2020 — twenty-two years after approval — and in the two hay fever trials on its own label that included an antihistamine comparator was beaten by loratadine and failed to separate from placebo where cetirizine did.',
    laymanHowItWorks:
      'When an allergic reaction fires, cells release leukotrienes: chemical messengers that make the airway lining swell, the muscle around it squeeze, and the nose block. Montelukast sits on the receptor those messengers use and stops them landing. Because it blocks only one family of messenger out of many, it takes away part of the inflammation rather than most of it, which is why a steroid inhaler that suppresses the whole process works better. It is a tablet, so it reaches everywhere the blood goes, including the brain.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 54,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0689 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 74 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States on 20 February 1998 under NDA 020829. Singulair was among the highest-revenue drugs in the world in the years before its United States patent expired in August 2012, at a branded price and for indications in which cheaper alternatives already existed. It now costs about seven United States cents a tablet, which is the number that makes the risk-benefit argument in the boxed warning interesting rather than academic: the drug is nearly free, and the question the label asks is whether nearly free is cheap enough.',
      synthesisComplexity: 'High',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'For asthma the comparison that matters is against an inhaled corticosteroid, and it is not close: across 56 randomised trials in 13,338 patients, anti-leukotriene monotherapy carried 1.51 times the risk of an exacerbation needing systemic steroids and 3.33 times the risk of one needing hospital admission. For hay fever the comparison is against an antihistamine or an intranasal steroid, and the montelukast label itself contains both comparisons, both unfavourable. This makes montelukast a second-choice treatment in each of its indications.',
      conventionalRx: [
        {
          name: 'An inhaled corticosteroid — budesonide, fluticasone, beclometasone',
          class: 'Inhaled glucocorticoid',
          howItCompares:
            'Superior on every asthma outcome measured. The Cochrane comparison of anti-leukotrienes against inhaled corticosteroids as monotherapy found exacerbations requiring systemic corticosteroids at RR 1.51 (95% CI 1.17 to 1.96) against the anti-leukotriene, hospital admissions at RR 3.33 (1.02 to 10.94), a 110 mL FEV1 deficit, and withdrawal for poor asthma control at RR 2.56 (2.01 to 3.27). In the 285-child PACT trial, fluticasone gave 64.2% asthma control days against montelukast’s 52.5% (p=0.004), with the same 48-week growth.',
          typicalCost:
            'US$0.7198 per millilitre of budesonide inhalation suspension at United States pharmacy acquisition cost (CMS NADAC, median across 51 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: the reference standard, with the outcome data. Cons: an inhaler has to be used correctly and remembered, which is the entire reason a daily tablet won market share it had not earned on efficacy.',
        },
        {
          name: 'Cetirizine or loratadine',
          class: 'Second-generation oral H1 antihistamine',
          howItCompares:
            'The two comparisons are inside the montelukast label. In a seasonal rhinitis trial, montelukast beat placebo by -0.13 on a 0-3 nasal symptom scale and loratadine beat placebo by -0.24. In a perennial rhinitis trial, montelukast’s difference from placebo was -0.04 (95% CI -0.09 to 0.01), which does not exclude zero, while cetirizine’s was -0.10 (95% CI -0.19 to -0.01), which does. The label notes both studies were not designed for statistical comparison between the drugs, so this is a numerical rather than a formal defeat — but it is the manufacturer’s own data.',
          typicalCost:
            'Cetirizine US$0.0629 per unit and loratadine US$0.0532 per unit at United States pharmacy acquisition cost (CMS NADAC, medians across 112 and 109 listed generic products respectively, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: cheaper, available without prescription, no boxed warning. Cons: cetirizine causes measurable sedation in a minority; neither does much for nasal blockage.',
        },
        {
          name: 'An intranasal corticosteroid',
          class: 'Topical glucocorticoid delivered to the nasal mucosa',
          howItCompares:
            'Treats the nose directly and is generally the first-line drug for moderate allergic rhinitis. Its relevance here is what the March 2020 boxed warning means in practice: montelukast is now reserved for allergic rhinitis patients who have had an inadequate response to, or cannot tolerate, exactly these alternatives.',
          typicalCost:
            'US$0.6920 per millilitre of fluticasone propionate at United States pharmacy acquisition cost (CMS NADAC, median across 51 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: acts on the blocked nose that antihistamines leave alone. Cons: nosebleeds and local irritation; needs daily use to work; technique matters.',
        },
      ],
      naturalFoods: [
        {
          name: 'Nasal saline irrigation',
          activeCompound: 'None — isotonic or hypertonic sodium chloride solution',
          biologicalMechanism:
            'Physical removal of allergen, mucus and inflammatory mediators from the nasal mucosa, with some improvement in mucociliary clearance. It does not act on the leukotriene pathway or on any receptor.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'Not stated here as advice. It is an adjunct with a benign safety profile and small measured effects on nasal symptom scores; it is not a substitute for a controller medicine in asthma, and nothing in this row should be read as a reason to stop one.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Read the boxed warning before the first tablet',
          action:
            'Ask what behaviour or mood changes to watch for, and agree what to do if they appear.',
          patientImpact:
            'The boxed warning lists agitation, aggression, depression, sleep disturbances and suicidal thoughts and behaviour including suicide, and directs that patients and caregivers be told to be alert for changes in behaviour. FDA required a patient Medication Guide alongside it in March 2020 specifically because health care professionals and patients were not aware of the risk.',
          clinicalPrecaution:
            'The label directs immediate discontinuation and contact with a health care provider if new neuropsychiatric symptoms or suicidal thoughts occur. In many cases symptoms resolved after stopping; in some they persisted, so the label directs continued monitoring and supportive care until they do.',
        },
        {
          name: 'Do not stop your inhaler because the tablet is working',
          action: 'Keep the inhaled or oral steroid unless a clinician reduces it deliberately.',
          patientImpact:
            'Label section 5.3 states that montelukast must not be abruptly substituted for inhaled or oral corticosteroids, and that inhaled corticosteroid may be reduced gradually if at all.',
          clinicalPrecaution:
            'Section 5.5 records systemic eosinophilia, sometimes with clinical features of vasculitis consistent with Churg-Strauss syndrome, and notes these events have sometimes been associated with reduction of oral corticosteroid therapy.',
        },
        {
          name: 'Keep a rescue inhaler regardless',
          action: 'Do not treat an attack with this tablet.',
          patientImpact:
            'Section 5.2 states montelukast is not indicated for reversal of bronchospasm in acute asthma attacks including status asthmaticus, and directs that patients be advised to have appropriate rescue medication available. Therapy can be continued through an exacerbation.',
          clinicalPrecaution:
            'Section 5.4 adds that patients with known aspirin sensitivity should continue to avoid aspirin and non-steroidal anti-inflammatory drugs while taking montelukast, despite the drug acting on the pathway that aspirin sensitivity runs through.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CC(C)(C1=CC=CC=C1CC[C@H](C2=CC=CC(=C2)/C=C/C3=NC4=C(C=CC(=C4)Cl)C=C3)SCC5(CC5)CC(=O)O)O',
      chemicalFormula: 'C35H36ClNO3S',
      molecularWeight:
        '586.20 g/mol (free acid); dispensed as montelukast sodium, C35H35ClNNaO3S, molecular weight 608.18',
      targetReceptorAffinity:
        'The label states montelukast binds with high affinity and selectivity to the CysLT1 receptor in preference to other pharmacologically important airway receptors including the prostanoid, cholinergic and beta-adrenergic receptors, and inhibits the physiologic actions of LTD4 at CysLT1 without any agonist activity. It is a single R-enantiomer with one defined stereocentre and a trans-configured styryl-quinoline arm; the sodium salt is hygroscopic and optically active.',
      structureSource: {
        label:
          'PubChem CID 5281040 (montelukast) — canonical SMILES, molecular formula and weight, as carried on the enriched record; sodium salt formula and weight from the SINGULAIR label, section 11',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5281040',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'mtk-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the single enantiomer and the trans double bond together',
          description:
            'Montelukast has one stereocentre and one geometric constraint, and both are load-bearing. The S-enantiomer and the cis-styryl isomer are not the drug, and the cis isomer forms readily on exposure to light, so the identity test and the photostability test are the same test.',
          reagentsAndBuffer:
            'Montelukast sodium reference standard, chiral HPLC with a polysaccharide stationary phase, ultraviolet detection at 225 and 385 nm, ICH Q1B photostability chamber, amber glassware throughout',
        },
        {
          id: 'mtk-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Couple the quinoline arm to the thiol-bearing cyclopropane acetic acid',
          description:
            'The molecule is three pieces: a 7-chloroquinoline joined through a trans alkene to a benzene ring, a benzylic stereocentre bearing a sulfur, and a 1-(mercaptomethyl)cyclopropaneacetic acid tail. The final bond is a stereospecific displacement at the benzylic carbon by that thiol, and it is the step that sets the enantiomeric purity of the whole batch.',
          dependsOnStepId: 'mtk-w1',
          reagentsAndBuffer:
            'Enantiomerically enriched benzylic mesylate or methanesulfonate intermediate, 1-(mercaptomethyl)cyclopropaneacetic acid dilithium salt, tetrahydrofuran under nitrogen at low temperature, sodium hydroxide for salt formation',
        },
        {
          id: 'mtk-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Isolate the sodium salt without letting the alkene isomerise',
          description:
            'The free acid is an oil and the marketed article is the sodium salt, isolated as a hygroscopic amorphous or crystalline solid. The purification is designed around avoiding light and heat rather than around chromatographic resolution, because the impurity that matters is a photoisomer that no ordinary crystallisation removes.',
          dependsOnStepId: 'mtk-w2',
          reagentsAndBuffer:
            'Dicyclohexylamine salt crystallisation for upgrade, sodium hydroxide in ethanol or toluene, controlled-humidity drying, low-actinic containers, Karl Fischer titration',
        },
        {
          id: 'mtk-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Measure CysLT1 occupancy against the receptors the label claims are spared',
          description:
            'The selectivity claim names prostanoid, cholinergic and beta-adrenergic receptors as the comparators. Testing CysLT1 alone reports affinity, not selectivity, and the claim on the label is a claim about the ratio.',
          dependsOnStepId: 'mtk-w3',
          reagentsAndBuffer:
            'Membranes from cells expressing human CYSLTR1 and CYSLTR2, radiolabelled LTD4 competition binding, parallel panels for prostanoid EP and TP, muscarinic M3 and beta-2 adrenergic receptors, calcium flux readout in a functional counter-screen',
        },
        {
          id: 'mtk-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Quantify brain exposure, not just plasma exposure',
          description:
            'The boxed warning describes central nervous system events and the label offers exactly one mechanistic fact about them: montelukast distributes into the brain in rats. A programme that measures only plasma concentration cannot address the question the warning raises. The assay that can is a paired plasma and brain tissue measurement with an unbound fraction determination in each compartment.',
          dependsOnStepId: 'mtk-w4',
          reagentsAndBuffer:
            'Rodent plasma and perfused brain homogenate, stable-isotope-labelled montelukast internal standard, protein precipitation and LC-MS/MS quantification, equilibrium dialysis for unbound fraction in plasma and brain homogenate',
        },
      ],
    },
    keyAudits: [
      {
        id: 'mtk-a1',
        category: 'measured',
        title: 'The asthma effect is real and it was measured properly',
        laymanSummary:
          'In the trial that got it approved, lung function improved by 13% against 4% on placebo, and the effect was there within the first day and had not worn off at twelve weeks.',
        technicalDetails:
          'Two similarly designed randomised, 12-week, double-blind, placebo-controlled trials enrolled 1,576 patients aged 15 and over with mild or moderate asthma — 795 on montelukast, 530 on placebo, 251 on an active control — with mean baseline FEV1 at 66% of predicted. In the United States trial the co-primary endpoint of morning FEV1 improved by 13.0% from baseline against 4.2% on placebo (p<0.001), an absolute 0.32 L against 0.10 L, a between-group difference of 0.22 L (95% CI 0.17 to 0.27). The multinational trial gave the same result and added a secondary outcome that matters more: asthma attacks requiring unscheduled care or systemic corticosteroids occurred in 15.6% against 27.3% on placebo (p<0.001). Daytime symptom score fell 0.49 against 0.26 on a 0-6 scale, beta-agonist use 1.65 against 0.42 puffs per day. A randomised subset was switched to placebo for three weeks at the end and showed no rebound.',
        evidenceSource:
          'SINGULAIR (montelukast sodium) United States prescribing information, section 14.1 (NDA 020829); Reiss TF et al., Arch Intern Med 1998;158:1213-1220',
        doi: '10.1001/archinte.158.11.1213',
        measuredMetric:
          'Mean percentage change from baseline in morning FEV1 over 12 weeks, and asthma attack rate as a secondary endpoint',
        auditFlag: 'verified',
      },
      {
        id: 'mtk-a2',
        category: 'conclusion_shift',
        title: 'The boxed warning took twenty-two years',
        laymanSummary:
          'Montelukast was approved in 1998. The strongest warning the FDA can require — for agitation, depression and suicide — was added in March 2020, and at the same time the hay fever indication was cut back to people other drugs had failed.',
        technicalDetails:
          'FDA issued its Drug Safety Communication on 4 March 2020, stating that montelukast prescribing information already included warnings about mental health side effects including suicidal thoughts or actions, but that many health care professionals and patients were not aware of the risk. After an extensive review and a panel of outside experts, FDA required a boxed warning and a new patient Medication Guide, and determined that for allergic rhinitis montelukast should be reserved for those not treated effectively by, or unable to tolerate, other allergy medicines. The boxed warning now reads that because of the risk of neuropsychiatric events, the benefits may not outweigh the risks in some patients, particularly when the symptoms of disease may be mild and adequately treated with alternative therapies. The reasoning is a benefit-risk reversal rather than new evidence of harm: the harm signal was in the label already, and what changed was the judgement that a small benefit could not carry it.',
        evidenceSource:
          'FDA Drug Safety Communication, 4 March 2020: FDA requires Boxed Warning about serious mental health side effects for asthma and allergy drug montelukast (Singulair); advises restricting use for allergic rhinitis',
        measuredMetric:
          'Regulatory benefit-risk determination — warning class and indication scope, 1998 against 2020',
        auditFlag: 'caution',
      },
      {
        id: 'mtk-a3',
        category: 'failed',
        title: 'In its own hay fever trials the antihistamine did better',
        laymanSummary:
          'Two of the registration trials for allergic rhinitis included an ordinary antihistamine as a comparator. In one, loratadine beat placebo by nearly twice as much as montelukast did. In the other, cetirizine separated from placebo and montelukast did not.',
        technicalDetails:
          'Seasonal allergic rhinitis was studied in five trials enrolling 5,029 patients; four of the five showed a significant reduction in daytime nasal symptom score. In the trial reported on the label, on a 0-3 scale, montelukast changed the score by -0.39 against placebo’s -0.26, a difference of -0.13 (95% CI -0.21 to -0.06, p≤0.001) in 344 patients, while loratadine changed it by -0.46, a difference of -0.24 (95% CI -0.31 to -0.17) in 599 patients. Perennial allergic rhinitis was studied in two trials enrolling 3,357 patients, of which the label says only one demonstrated efficacy: there montelukast’s difference from placebo was -0.08 (95% CI -0.12 to -0.04) in 1,000 patients. In the other, montelukast’s estimated difference from placebo was -0.04 (95% CI -0.09 to 0.01), which includes zero, while the cetirizine comparator’s was -0.10 (95% CI -0.19 to -0.01), which does not. The label states in both cases that the study was not designed for statistical comparison between montelukast and the active control, and that caveat is doing a great deal of work: it means the manufacturer never formally tested the comparison whose numbers its own label prints.',
        evidenceSource:
          'SINGULAIR United States prescribing information, section 14.3, Tables 9 and 10 and the accompanying perennial rhinitis text (NDA 020829)',
        measuredMetric:
          'Mean change from baseline in daytime nasal symptom score on a 0-3 scale against placebo, montelukast versus loratadine and cetirizine',
        auditFlag: 'contested',
      },
      {
        id: 'mtk-a4',
        category: 'failed',
        title: 'As a lone asthma controller it loses to an inhaled steroid on every endpoint',
        laymanSummary:
          'Fifty-six randomised trials in more than thirteen thousand people compared a leukotriene tablet with a steroid inhaler used alone. The tablet group had half again as many attacks needing steroid tablets, and more than three times as many needing hospital.',
        technicalDetails:
          'The Cochrane review of anti-leukotrienes against inhaled corticosteroids as monotherapy included 56 trials contributing data on 10,005 adults and 3,333 children with mild or moderate persistent asthma, at a median comparator dose of 200 mcg/day of HFA beclometasone or equivalent. Patients on anti-leukotrienes were more likely to have an exacerbation requiring systemic corticosteroids: RR 1.51 (95% CI 1.17 to 1.96), one additional such exacerbation for every 28 patients treated with the tablet instead of the inhaler. Exacerbations requiring hospital admission: RR 3.33 (95% CI 1.02 to 10.94). FEV1 was 110 mL lower. Withdrawal due to poor asthma control: RR 2.56 (95% CI 2.01 to 3.27), one extra withdrawal for every 31 patients. The disadvantage was significantly larger in moderate than in mild airway obstruction (RR 2.03 against RR 1.25). Side-effect risk did not differ. In children specifically, the 285-patient PACT trial found fluticasone superior to montelukast on asthma control days, 64.2% against 52.5% (p=0.004), and on every other control outcome, with no difference in 48-week growth.',
        evidenceSource:
          'Chauhan BF, Ducharme FM. Cochrane Database Syst Rev 2012;(5):CD002314; Sorkness CA et al., J Allergy Clin Immunol 2007;119:64-72 (PACT)',
        doi: '10.1002/14651858.CD002314.pub3',
        measuredMetric:
          'Exacerbations requiring systemic corticosteroids or hospital admission, anti-leukotriene monotherapy against inhaled corticosteroid monotherapy',
        auditFlag: 'verified',
      },
      {
        id: 'mtk-a5',
        category: 'failed',
        title: 'In preschool wheeze it did not work',
        laymanSummary:
          'The largest trial ever run in wheezy toddlers gave montelukast at the start of each episode to 669 children and placebo to 677. The number of unscheduled medical visits was not significantly different.',
        technicalDetails:
          'The WAIT trial randomised 1,358 children aged 10 months to 5 years with two or more wheeze episodes to intermittent montelukast or placebo given by parents at each episode over 12 months, stratified by ALOX5 promoter Sp1-binding motif copy number because that genotype had been reported to modify response in adults. Primary outcome data were available for 1,308 (96%). Unscheduled medical attendances for wheezing episodes were a mean 2.0 (SD 2.6) on montelukast against 2.3 (2.7) on placebo, incidence rate ratio 0.88 (95% CI 0.77 to 1.01, p=0.06) — not significant. The 5/5 genotype stratum did separate (IRR 0.80, 95% CI 0.68 to 0.95, p=0.01) and the 5/x plus x/x stratum did not (IRR 1.03, 95% CI 0.83 to 1.29, p=0.79), with an interaction p of 0.08 that does not itself reach conventional significance. The authors concluded there was no clear benefit, and that the genotype might identify a responsive subgroup. No genotype-directed prescribing followed.',
        evidenceSource: 'Nwokoro C et al., Lancet Respir Med 2014;2:796-803 (WAIT, NCT01142505)',
        doi: '10.1016/S2213-2600(14)70186-9',
        measuredMetric:
          'Number of unscheduled medical attendances for wheezing episodes over 12 months',
        auditFlag: 'verified',
      },
      {
        id: 'mtk-a6',
        category: 'inferred',
        title: 'The harm is measurable, modest, and still not mechanistically explained',
        laymanSummary:
          'Large matched-cohort studies do find more anxiety, mood and sleep diagnoses after starting montelukast. The size is one extra affected child in about sixty over a year, not a catastrophe — and nobody can say how the drug does it.',
        technicalDetails:
          'A propensity-matched cohort of 107,384 children and young people aged 3 to 17 with asthma, all on inhaled corticosteroids, found any neuropsychiatric outcome in 71 per 1,000 with adjunct montelukast against 54 per 1,000 without: RR 1.32 (95% CI 1.25 to 1.39), absolute risk increase 1.71 per 100 (95% CI 1.44 to 1.98), one-year number needed to harm 58 (95% CI 51 to 69). The largest excess was sleep disorders, RR 1.63 (95% CI 1.50 to 1.77). A companion propensity-matched cohort of 154,946 adults and adolescents aged 15 to 64 found odds ratios of 1.11 (95% CI 1.04 to 1.19) in asthma and 1.07 (95% CI 1.01 to 1.14) in allergic rhinitis. These are observational designs and confounding by indication is a live concern in both. The label is candid about the gap: it says the mechanisms underlying the events are currently not well understood, that based on available data it is difficult to identify risk factors or quantify the risk, and offers as its single mechanistic observation that animal studies showed montelukast distributes into the brain in rats.',
        evidenceSource:
          'Paljarvi T et al., Thorax 2025;80:9-15; Paljarvi T et al., JAMA Netw Open 2022;5:e2213643; SINGULAIR label section 5.1',
        doi: '10.1136/thorax-2024-221590',
        inferredClaim:
          'That montelukast causes the neuropsychiatric diagnoses associated with it — supported by consistent direction across large matched cohorts and by the regulatory action, but without a demonstrated mechanism and without a randomised test',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A tablet, so it goes everywhere',
        laymanDesc:
          'Unlike an inhaler, this is swallowed once a day and carried by the blood to every tissue — including, the label notes, the brain.',
        molecularDetail:
          'Orally active leukotriene receptor antagonist, taken as the sodium salt at 10 mg in adults, 5 mg or 4 mg chewable in children and 4 mg oral granules in infants. Section 5.1 of the label records that animal studies showed montelukast distributes into the brain in rats, cross-referenced from the neuropsychiatric warning to the pharmacokinetics section.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The messengers it blocks come from allergy cells',
        laymanDesc:
          'Mast cells and eosinophils release cysteinyl leukotrienes during an allergic reaction. These are the molecules montelukast is designed to intercept.',
        molecularDetail:
          'LTC4, LTD4 and LTE4 are arachidonic acid products released from mast cells and eosinophils. In asthma their effects include airway oedema, smooth muscle contraction and altered cellular activity in the inflammatory process; in allergic rhinitis they are released from nasal mucosa after allergen exposure in both early- and late-phase reactions.',
        iconName: 'Radio',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It occupies one receptor and leaves the others alone',
        laymanDesc:
          'Montelukast sits in the CysLT1 receptor without switching it on, so the leukotrienes arrive and find the seat taken.',
        molecularDetail:
          'High-affinity, selective binding to CysLT1 in preference to prostanoid, cholinergic and beta-adrenergic receptors, inhibiting the physiologic actions of LTD4 without agonist activity. CysLT1 is present on airway smooth muscle cells, airway macrophages, eosinophils and certain myeloid stem cells.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'One inflammatory pathway closes; the rest stay open',
        laymanDesc:
          'Blocking leukotrienes removes part of the swelling and squeezing. Histamine, cytokines and everything else the airway lining produces carry on.',
        molecularDetail:
          'This is the pharmacological reason a receptor antagonist for one mediator family underperforms a glucocorticoid, which suppresses transcription across the whole inflammatory programme. It shows up as a 110 mL FEV1 deficit and a 1.51 relative risk of steroid-requiring exacerbation in the Cochrane monotherapy comparison.',
        iconName: 'Filter',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Lung function rises within a day and holds for twelve weeks',
        laymanDesc:
          'The measured benefit in asthma arrives almost immediately and does not fade, and stopping it produced no rebound.',
        molecularDetail:
          'FEV1 +13.0% against +4.2% on placebo over 12 weeks, a 0.22 L between-group difference (95% CI 0.17 to 0.27, p<0.001); near-maximal effect on symptoms and reliever use within the first day; asthma attacks 15.6% against 27.3% in the multinational trial. A randomised subset switched to placebo for three weeks showed neither tolerance nor rebound worsening.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And something happens in the brain that nobody has explained',
        laymanDesc:
          'Agitation, nightmares, low mood and, rarely, suicidal thinking. The warning is the strongest the FDA issues, and the label says the mechanism is not understood.',
        molecularDetail:
          'Boxed warning since 4 March 2020. Reported events include agitation, aggression, anxiousness, depression, disorientation, dream abnormalities, hallucinations, insomnia, irritability, memory impairment, obsessive-compulsive symptoms, somnambulism, stuttering, tic, tremor and suicidal thoughts and behaviour including suicide, in patients with and without prior psychiatric history, and some reported after discontinuation. Matched-cohort data put the paediatric one-year number needed to harm at 58 for any neuropsychiatric outcome.',
        iconName: 'AlertOctagon',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Two 12-week placebo-controlled asthma registration trials (NDA 020829)',
        phase: 'Phase 3, randomised, double-blind, placebo- and active-controlled',
        sampleSize: 1576,
        primaryEndpoint:
          'Co-primary morning FEV1 and daytime asthma symptoms over 12 weeks in patients aged 15 and over with mild to moderate asthma',
        endpointMet: true,
        statisticalPValue:
          'FEV1 +13.0% against +4.2% on placebo, absolute 0.32 L against 0.10 L, between-group difference 0.22 L (95% CI 0.17 to 0.27), p<0.001; daytime symptom score -0.49 against -0.26 on a 0-6 scale, p<0.001',
        unreportedAdverseSignals:
          'The publication reported adverse events and discontinuations as comparable to placebo. Twelve weeks in 795 treated patients is not a design that could detect a rare psychiatric outcome, and the boxed warning that arrived 22 years later came from postmarketing reports, not from this programme.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'PACT — Pediatric Asthma Controller Trial (J Allergy Clin Immunol 2007;119:64-72)',
        phase: 'Phase 4, randomised, double-blind, 48 weeks, three parallel regimens',
        sampleSize: 285,
        primaryEndpoint:
          'Percentage of asthma control days over 48 weeks in children aged 6 to 14 with mild to moderate persistent asthma',
        endpointMet: true,
        statisticalPValue:
          'Fluticasone 64.2% against montelukast 52.5% asthma control days, p=0.004; fluticasone superior on every other control outcome; 48-week growth 5.3 cm on fluticasone against 5.7 cm on montelukast, not significantly different',
        unreportedAdverseSignals:
          'The growth result is the one that matters for the argument usually made in montelukast’s favour. Over 48 weeks the steroid inhaler did not measurably cost these children height, and it did measurably control their asthma better.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'Cochrane anti-leukotrienes versus inhaled corticosteroids as monotherapy (CD002314.pub3)',
        phase: 'Systematic review and meta-analysis of 56 randomised trials',
        sampleSize: 13338,
        primaryEndpoint:
          'Number of patients with at least one exacerbation requiring systemic corticosteroids',
        endpointMet: false,
        statisticalPValue:
          'RR 1.51 (95% CI 1.17 to 1.96) against the anti-leukotriene in 6,077 participants; hospital admission RR 3.33 (95% CI 1.02 to 10.94); FEV1 110 mL lower; withdrawal for poor control RR 2.56 (95% CI 2.01 to 3.27)',
        unreportedAdverseSignals:
          'The disadvantage widened with disease severity: RR 2.03 (95% CI 1.41 to 2.91) in moderate airway obstruction against RR 1.25 (95% CI 0.97 to 1.61) in mild. The sicker the patient, the worse the substitution.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'WAIT — intermittent montelukast in preschool wheeze (NCT01142505)',
        phase: 'Phase 4, randomised, double-blind, placebo-controlled, genotype-stratified',
        sampleSize: 1358,
        primaryEndpoint:
          'Number of unscheduled medical attendances for wheezing episodes over 12 months in children aged 10 months to 5 years',
        endpointMet: false,
        statisticalPValue:
          'Mean 2.0 (SD 2.6) against 2.3 (2.7); incidence rate ratio 0.88 (95% CI 0.77 to 1.01), p=0.06',
        unreportedAdverseSignals:
          'The prespecified ALOX5 5/5 genotype stratum separated (IRR 0.80, 95% CI 0.68 to 0.95) and the other stratum did not, but the interaction test itself was p=0.08. A subgroup that only appears when the overall result is negative needs its own trial, and did not get one.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'Seasonal allergic rhinitis trial with loratadine active control (NDA 020829, section 14.3)',
        phase: 'Phase 3, randomised, double-blind, placebo- and active-controlled',
        sampleSize: 1294,
        primaryEndpoint:
          'Mean change from baseline in daytime nasal symptoms score on a 0-3 categorical scale',
        endpointMet: true,
        statisticalPValue:
          'Montelukast -0.39 against placebo -0.26, difference -0.13 (95% CI -0.21 to -0.06), p≤0.001; loratadine -0.46, difference from placebo -0.24 (95% CI -0.31 to -0.17)',
        unreportedAdverseSignals:
          'The label states the study was not designed for statistical comparison between montelukast and the active control. It nonetheless prints both differences from placebo in the same table, and the antihistamine’s is nearly twice the size.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'FEV1 improvement of 13.0% against 4.2% on placebo over 12 weeks, a 0.22 L between-group difference (95% CI 0.17 to 0.27) in 1,576 patients',
        'Asthma attacks in 15.6% against 27.3% on placebo in the multinational registration trial',
        'Inferiority to inhaled corticosteroid monotherapy: exacerbations requiring systemic steroids RR 1.51, requiring admission RR 3.33, FEV1 110 mL lower, across 56 trials and 13,338 patients',
        'A daytime nasal symptom difference from placebo of -0.13 in seasonal and -0.08 in perennial allergic rhinitis, on a 0-3 scale',
        'A paediatric one-year number needed to harm of 58 for any neuropsychiatric diagnosis in 107,384 propensity-matched children',
      ],
      unsupportedInferences: [
        'That a tablet acting on one mediator family can replace an inhaled corticosteroid, which the randomised comparison contradicts on every endpoint',
        'That the allergic rhinitis benefit is comparable to an antihistamine’s, when the label’s own tables show loratadine and cetirizine doing better against the same placebos',
        'That the neuropsychiatric events have an established mechanism — the label states they are not well understood and the only supporting observation is brain distribution in rats',
        'That the ALOX5 genotype subgroup in WAIT identifies a responsive population, on an interaction test that did not itself reach significance',
      ],
      whatFailedInitially: [
        'One of five seasonal and one of two perennial allergic rhinitis registration trials did not demonstrate efficacy',
        'In the perennial trial with a cetirizine comparator, montelukast’s difference from placebo was -0.04 (95% CI -0.09 to 0.01) and cetirizine’s was -0.10 (95% CI -0.19 to -0.01)',
        'Intermittent use in 1,358 wheezy preschool children did not reduce unscheduled medical attendances (IRR 0.88, p=0.06)',
        'The neuropsychiatric signal sat in the warnings section for most of two decades before it was judged to outweigh the benefit in mild disease',
      ],
      realWorldOutcome: [
        'Approved 20 February 1998; among the highest-revenue medicines in the world before United States patent expiry in August 2012',
        'Boxed warning and patient Medication Guide required 4 March 2020, with the allergic rhinitis indication narrowed to patients failed by or intolerant of alternatives',
        'Now about seven United States cents a tablet at pharmacy acquisition cost, and still one of the most dispensed respiratory medicines',
        'Remains an appropriate add-on in aspirin-exacerbated respiratory disease and in exercise-induced bronchoconstriction, where the leukotriene pathway is the dominant one',
      ],
    },
    deliverySystem: {
      type: 'Oral, once daily: 10 mg film-coated tablet, 4 mg and 5 mg chewable tablets, and 4 mg oral granules for infants from 6 months',
      description:
        'The chewable tablets contain aspartame, and the label directs that patients with phenylketonuria be told the 4 mg and 5 mg chewables contain phenylalanine. Dosing is in the evening for asthma; for seasonal allergic rhinitis the label records efficacy with morning or evening administration.',
      safetyProfile:
        'Boxed warning for serious neuropsychiatric events including suicidal thoughts and behaviour, in patients with and without prior psychiatric history, sometimes persisting after discontinuation. Not for acute bronchospasm or status asthmaticus, and rescue medication must remain available. Must not be abruptly substituted for inhaled or oral corticosteroids. Systemic eosinophilia, sometimes presenting with clinical features of vasculitis consistent with Churg-Strauss syndrome, has been reported, sometimes in association with reduction of oral corticosteroid therapy. Aspirin-sensitive patients must continue to avoid aspirin and non-steroidal anti-inflammatory drugs while taking it.',
    },
    commonQuestions: [
      {
        q: 'Should I be worried about the mental health warning?',
        a: 'You should know about it, which is precisely what the FDA concluded was missing. The boxed warning added on 4 March 2020 lists agitation, aggression, depression, sleep disturbances and suicidal thoughts and behaviour including suicide. The best-quantified estimate comes from a propensity-matched cohort of 107,384 children on inhaled steroids: 71 per 1,000 had some neuropsychiatric diagnosis within a year on montelukast against 54 per 1,000 without, a one-year number needed to harm of 58, with sleep disorders the largest single contributor. That is a real signal and a modest absolute risk. The label says the mechanism is not understood and that it is difficult to identify who is at risk. What it also says, and what changed the regulatory decision, is that the benefit may not outweigh the risk when the disease is mild and alternatives exist.',
        auditNote:
          'The 2020 action was a benefit-risk reversal rather than a new discovery. The harm had been in the warnings section for years; the judgement about how much benefit it had to be weighed against is what moved.',
      },
      {
        q: 'Can I take montelukast instead of a steroid inhaler?',
        a: 'The randomised evidence says that trade is a bad one. Across 56 trials in 13,338 people with mild or moderate persistent asthma, patients on an anti-leukotriene alone were 1.51 times as likely to have an exacerbation needing steroid tablets, 3.33 times as likely to have one needing hospital admission, had FEV1 110 mL lower, and were 2.56 times as likely to withdraw for poor control. The gap was widest in the people with the worst airflow obstruction. The label itself directs that montelukast must not be abruptly substituted for inhaled or oral corticosteroids. In children, the 48-week PACT trial found fluticasone gave 64.2% asthma control days against montelukast’s 52.5%, with the same growth over the year.',
      },
      {
        q: 'Is it good for hay fever?',
        a: 'It works, and it works less well than an ordinary antihistamine, and this is not a controversial claim because both numbers are printed in the montelukast label. In the seasonal rhinitis trial reported there, montelukast improved the daytime nasal symptom score by 0.13 points more than placebo on a 0-3 scale and loratadine improved it by 0.24 points more. In one of the two perennial rhinitis trials, montelukast’s difference from placebo was -0.04 with a confidence interval crossing zero, while cetirizine’s was -0.10 with one that did not. The label adds that these studies were not designed for a formal statistical comparison between the drugs. Since March 2020 the indication is restricted to people whom other allergy medicines have failed or who cannot tolerate them.',
      },
      {
        q: 'Are there people it is genuinely the right drug for?',
        a: 'Yes, and they are the people in whom leukotrienes are the dominant pathway rather than one of many. Exercise-induced bronchoconstriction is a licensed indication in its own right in patients 6 and over. Aspirin-exacerbated respiratory disease — the triad of asthma, nasal polyps and reaction to aspirin — runs through leukotriene overproduction, and the label’s instruction that aspirin-sensitive patients must still avoid aspirin while taking montelukast is a reminder that blocking the receptor does not undo the sensitivity. It is also a reasonable add-on when an inhaled steroid alone is not enough, which is the setting almost all of the modern outcome data describe.',
      },
      {
        q: 'What is Churg-Strauss syndrome and why is it in the label?',
        a: 'It is a rare vasculitis, now more often called eosinophilic granulomatosis with polyangiitis, in which eosinophils infiltrate blood vessels. The label records that systemic eosinophilia, sometimes with clinical features of vasculitis consistent with the syndrome, has been reported in patients on montelukast, and notes these events have sometimes been associated with reduction of oral corticosteroid therapy. That last clause is the audit: the standard explanation is unmasking rather than causation — a patient who already had the vasculitis was having it suppressed by the steroid, and the steroid was being withdrawn because the new tablet appeared to be working. Whether montelukast also causes it in some patients has not been settled either way.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'SINGULAIR (montelukast sodium) United States prescribing information — Boxed Warning, Indications 1.1 to 1.4, Warnings 5.1 to 5.6, Description 11, Clinical Pharmacology 12.1, Clinical Studies 14.1 and 14.3 (NDA 020829, 020830, 021409)',
        identifier:
          'https://api.fda.gov/drug/drugsfda.json?search=application_number:%22NDA020829%22',
        kind: 'regulatory',
      },
      {
        label:
          'FDA Drug Safety Communication, 4 March 2020 — FDA requires Boxed Warning about serious mental health side effects for asthma and allergy drug montelukast (Singulair); advises restricting use for allergic rhinitis',
        identifier:
          'https://www.fda.gov/drugs/drug-safety-and-availability/fda-requires-boxed-warning-about-serious-mental-health-side-effects-asthma-and-allergy-drug',
        kind: 'regulatory',
      },
      {
        label:
          'Reiss TF, Chervinsky P, Dockhorn RJ, et al. Montelukast, a once-daily leukotriene receptor antagonist, in the treatment of chronic asthma: a multicenter, randomized, double-blind trial. Arch Intern Med 1998;158:1213-1220',
        identifier: '10.1001/archinte.158.11.1213',
        kind: 'doi',
      },
      {
        label:
          'Chauhan BF, Ducharme FM. Anti-leukotriene agents compared to inhaled corticosteroids in the management of recurrent and/or chronic asthma in adults and children. Cochrane Database Syst Rev 2012;(5):CD002314',
        identifier: '10.1002/14651858.CD002314.pub3',
        kind: 'doi',
      },
      {
        label:
          'Sorkness CA, Lemanske RF Jr, Mauger DT, et al. Long-term comparison of 3 controller regimens for mild-moderate persistent childhood asthma: the Pediatric Asthma Controller Trial. J Allergy Clin Immunol 2007;119:64-72',
        identifier: '10.1016/j.jaci.2006.09.042',
        kind: 'doi',
      },
      {
        label:
          'Nwokoro C, Pandya H, Turner S, et al. Intermittent montelukast in children aged 10 months to 5 years with wheeze (WAIT trial): a multicentre, randomised, placebo-controlled trial. Lancet Respir Med 2014;2:796-803',
        identifier: '10.1016/S2213-2600(14)70186-9',
        kind: 'doi',
      },
      {
        label:
          'Paljarvi T, Forton JT, Thompson C, et al. Neuropsychiatric diagnoses after montelukast initiation in paediatric patients with asthma. Thorax 2025;80:9-15',
        identifier: '10.1136/thorax-2024-221590',
        kind: 'doi',
      },
      {
        label:
          'Paljarvi T, Forton J, Luciano S, Herttua K, Fazel S. Analysis of Neuropsychiatric Diagnoses After Montelukast Initiation. JAMA Netw Open 2022;5:e2213643',
        identifier: '10.1001/jamanetworkopen.2022.13643',
        kind: 'doi',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — montelukast, 74 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 5281040 — montelukast structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5281040',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 3. Cetirizine — the second-generation antihistamine whose own over-the-counter carton tells you
  //    not to drive, and which can cause the itch it treats when you stop taking it.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'cetirizine',
    name: 'Cetirizine',
    tradeName: 'Zyrtec',
    sponsor:
      'Discovered at UCB as the carboxylic acid metabolite of its own older antihistamine hydroxyzine; United States NDA 019835, originally approved as a prescription medicine and now held over the counter by Kenvue Brands, with generic and store-brand products from many manufacturers',
    targetGene: 'HRH1',
    targetProtein:
      'Histamine H1 receptor. The label describes the effect as selective inhibition of peripheral H1 receptors, with no measurable in vitro affinity for any receptor other than H1.',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1995,
    indication:
      'Relief of symptoms of seasonal and perennial allergic rhinitis — sneezing, rhinorrhoea, postnasal discharge, nasal and ocular itching and tearing — and treatment of the uncomplicated skin manifestations of chronic idiopathic urticaria',
    patientFriendlyIndication: 'Hay fever, allergic sneezing and itching, and long-running hives',
    anatomicalSite:
      'H1 receptors on blood vessels, sensory nerve endings and mucosal tissue in the nose, eyes and skin',
    conditionContext: {
      conditionExplainer:
        'Histamine is stored in mast cells and released within seconds of an allergen binding IgE on their surface. It makes small blood vessels leak, which is the blocked nose and the wheal; it fires sensory nerves, which is the itch and the sneeze; and it does all of that within minutes.',
      whyItMatters:
        'An H1 antihistamine does not stop the mast cell degranulating. It occupies the receptor histamine would have landed on, so the message is sent and not received. That is why it works well for itch, sneeze and runny nose and poorly for a blocked nose, which is driven by other mediators, and why it does nothing at all for asthma.',
      whoTakesThis:
        'People with hay fever and other allergic rhinitis, and people with chronic hives. It is sold without prescription and taken by tens of millions of people who never see a clinician about it.',
      clinicalGoals:
        'Fewer symptoms while the allergen is around. Nothing in this drug class modifies the underlying allergy, and stopping it returns the person to baseline — or, occasionally, to worse than baseline.',
    },
    oneSentenceVerdict:
      'A peripherally selective H1 antihistamine that produced complete suppression of chronic spontaneous urticaria 2.72 times as often as placebo in the Cochrane comparison, whose own over-the-counter carton warns that drowsiness may occur and to be careful driving — a warning its rival loratadine does not carry — and whose label now records new-onset itching within days of stopping it after long-term use.',
    laymanHowItWorks:
      'When you meet something you are allergic to, cells in your nose and skin dump histamine into the tissue around them. Histamine makes vessels leak and nerves fire, which is the sneeze, the runny nose, the itch and the hive. Cetirizine gets to the receptor first and sits in it, so the histamine arrives and finds nowhere to dock. It is designed to stay outside the brain, and it mostly does — but not entirely, which is why some people find it makes them sleepy.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 74,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0629 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 112 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'NDA 019835 was approved on 8 December 1995 as a Type 1 New Molecular Entity and the product later switched to over-the-counter sale, where it remains. It is among the cheapest medicines in this file at roughly six United States cents a unit at acquisition cost. Cetirizine is a metabolite of hydroxyzine, a drug that had been on the market since 1956 — the patent estate was built on identifying and purifying the active breakdown product of a compound already in use.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Everything in this class blocks the same receptor and the differences between them are about sedation, onset and price, not about efficacy at the target. Cetirizine is generally the fastest and most potent of the three big over-the-counter options and the most sedating; loratadine and fexofenadine are less sedating and, in the Cochrane urticaria comparison, loratadine was not statistically distinguishable from cetirizine on complete suppression of hives. For a blocked nose specifically, no oral antihistamine is the right answer and an intranasal steroid is.',
      conventionalRx: [
        {
          name: 'Loratadine (Claritin)',
          class: 'Second-generation oral H1 antihistamine',
          howItCompares:
            'Slower to act and less sedating. Its over-the-counter carton warns only that taking more than directed may cause drowsiness, where cetirizine’s carton warns that drowsiness may occur at the ordinary dose and to be careful driving. On hives the Cochrane comparison of loratadine 10 mg against cetirizine 10 mg found no significant difference in complete suppression (RR 1.05, 95% CI 0.76 to 1.43).',
          typicalCost:
            'US$0.0532 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 109 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: cheaper still, and the least sedating of the common oral options alongside fexofenadine. Cons: slower onset; some people simply respond less well to it.',
        },
        {
          name: 'Fexofenadine (Allegra)',
          class: 'Second-generation oral H1 antihistamine, the active metabolite of terfenadine',
          howItCompares:
            'A P-glycoprotein substrate that is actively pumped back out of the brain, which is the structural reason it is the least sedating of the group. Its own over-the-counter carton carries no drowsiness warning at all — only instructions not to take it with fruit juice or with aluminium or magnesium antacids, both of which cut its absorption.',
          typicalCost:
            'US$0.2407 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 52 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: no sedation warning; safe in people who must drive or operate machinery. Cons: about four times the price of cetirizine; absorption is genuinely disrupted by ordinary food and drink.',
        },
        {
          name: 'An intranasal corticosteroid',
          class: 'Topical glucocorticoid delivered to the nasal mucosa',
          howItCompares:
            'The right answer for the symptom oral antihistamines are worst at. Histamine is a minor contributor to nasal blockage compared with the late-phase inflammatory infiltrate, which is why a receptor blocker relieves sneezing and itching well and congestion poorly.',
          typicalCost:
            'US$0.6920 per millilitre of fluticasone propionate at United States pharmacy acquisition cost (CMS NADAC, median across 51 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: works on the blocked nose; no systemic sedation. Cons: takes days to reach full effect; local irritation and nosebleeds; needs correct technique.',
        },
      ],
      naturalFoods: [
        {
          name: 'Nasal saline irrigation',
          activeCompound: 'None — isotonic or hypertonic sodium chloride solution',
          biologicalMechanism:
            'Mechanical removal of allergen and mucus from the nasal mucosa. It reduces the amount of allergen available to trigger mast cells rather than blocking any receptor, so it is additive to an antihistamine rather than a substitute for one.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'Not stated here as advice. The measured effects on nasal symptom scores are small and the safety profile is benign; it is used alongside drug treatment, not instead of it.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Find out how it affects you before you drive on it',
          action:
            'Take the first dose on a day when you do not need to drive or operate machinery.',
          patientImpact:
            'The over-the-counter Drug Facts for cetirizine state, under When using this product: drowsiness may occur; avoid alcoholic drinks; alcohol, sedatives and tranquilizers may increase drowsiness; be careful when driving a motor vehicle or operating machinery. In children aged 6 to 11, somnolence in the placebo-controlled trials was dose-related at 1.3% on placebo, 1.9% at 5 mg and 4.2% at 10 mg.',
          clinicalPrecaution:
            'The same carton says to ask a doctor or pharmacist before use if you are taking tranquillisers or sedatives, and not to use it at all if you have ever reacted to an antihistamine containing hydroxyzine — the parent drug cetirizine is derived from.',
        },
        {
          name: 'If you have taken it for years, do not be surprised by an itch when you stop',
          action:
            'If severe generalised itching starts within days of stopping, say so rather than assuming the allergy has returned.',
          patientImpact:
            'The postmarketing section of the cetirizine label now lists new-onset pruritus within a few days after discontinuation, usually after long-term use of a few months to years. It is a recognised phenomenon rather than a rare curiosity, and it can be mistaken for a rebound of the original condition.',
          clinicalPrecaution:
            'The same postmarketing list includes rare but serious events: anaphylaxis, convulsions, hepatitis and cholestasis, thrombocytopenia, haemolytic anaemia, severe hypotension, and suicidal ideation and suicide.',
        },
        {
          name: 'Do not use it for a cold',
          action: 'Reach for something else when the problem is a virus rather than an allergy.',
          patientImpact:
            'A Cochrane review of 18 randomised trials in 4,342 people with the common cold found a benefit on overall symptom severity only on days one and two — 45% improved against 38% on placebo — with no difference at three to four days or at six to ten, and no clinically significant effect on nasal obstruction, runny nose or sneezing at any point.',
          clinicalPrecaution:
            'The same review found no evidence of effectiveness in children at all. Cetirizine is not indicated for the common cold and nothing on its allergy label claims it is.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1CN(CCN1CCOCC(=O)O)C(C2=CC=CC=C2)C3=CC=C(C=C3)Cl',
      chemicalFormula: 'C21H25ClN2O3',
      molecularWeight: '388.90 g/mol (free acid); dispensed as the dihydrochloride',
      targetReceptorAffinity:
        'The label states that in vitro receptor binding studies showed no measurable affinity for receptors other than H1, and that in vivo and ex vivo animal models showed negligible anticholinergic and antiserotonergic activity — while noting that dry mouth was nonetheless more common than placebo in clinical studies. Autoradiography with radiolabelled cetirizine in the rat showed negligible penetration into the brain, and ex vivo mouse experiments showed that systemically administered cetirizine does not significantly occupy cerebral H1 receptors. Mean plasma protein binding is 93%, mean elimination half-life 8.3 hours across 146 healthy volunteers, and about 50% of an administered dose is recovered unchanged in urine.',
      structureSource: {
        label:
          'PubChem CID 2678 (cetirizine) — canonical SMILES, molecular formula and weight, as carried on the enriched record; protein binding, half-life and receptor selectivity from the cetirizine hydrochloride United States prescribing information, Clinical Pharmacology',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2678',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'cet-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Separate cetirizine from its parent and its enantiomer',
          description:
            'Cetirizine is the carboxylic acid oxidation product of hydroxyzine, and hydroxyzine is a plausible process impurity as well as a pharmacologically active one. The marketed racemate also contains the R-enantiomer sold separately as levocetirizine, so a release assay has to resolve three related compounds, not one.',
          reagentsAndBuffer:
            'Cetirizine dihydrochloride USP reference standard, hydroxyzine reference standard, reversed-phase HPLC for the parent, chiral HPLC on a cellulose or amylose phase for the enantiomeric ratio, ultraviolet detection at 230 nm',
        },
        {
          id: 'cet-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Build the chlorobenzhydryl piperazine and cap it with the acid arm',
          description:
            'The core is 1-(4-chlorobenzhydryl)piperazine, alkylated on the far nitrogen with an ethoxyacetic acid arm. The terminal carboxylate is the whole design: it makes the molecule zwitterionic at physiological pH and stops it crossing the blood-brain barrier freely, which is the entire distinction between this drug and its sedating parent.',
          dependsOnStepId: 'cet-w1',
          reagentsAndBuffer:
            '4-chlorobenzhydryl chloride, piperazine, sodium chloroacetate or ethyl bromoacetate with subsequent hydrolysis, potassium carbonate in toluene or xylene, hydrochloric acid for salt formation',
        },
        {
          id: 'cet-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Isolate the dihydrochloride and control residual hydroxyzine',
          description:
            'Purification is aimed at a specific impurity rather than at general purity: residual hydroxyzine carries real sedating and anticholinergic activity that the finished drug is specifically designed not to have, so its limit is a pharmacological limit rather than a cosmetic one.',
          dependsOnStepId: 'cet-w2',
          reagentsAndBuffer:
            'Recrystallisation from ethanol or isopropanol with hydrogen chloride, activated carbon treatment, HPLC release testing against a specified hydroxyzine limit, Karl Fischer titration',
        },
        {
          id: 'cet-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Measure brain occupancy in humans, not distribution in rats',
          description:
            'The label’s non-sedation case rests on rat autoradiography and ex vivo mouse receptor occupancy. The human carton says drowsiness may occur. The assay that resolves the contradiction is positron emission tomography with an H1 receptor tracer in awake humans at the marketed dose, read against a psychomotor performance battery in the same subjects.',
          dependsOnStepId: 'cet-w3',
          reagentsAndBuffer:
            'Carbon-11 doxepin or equivalent H1 receptor PET tracer, paired placebo and active sessions, plasma concentration sampling at Tmax, critical flicker fusion and divided-attention driving simulator batteries',
        },
        {
          id: 'cet-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Quantify wheal and flare suppression against a histamine challenge',
          description:
            'The pharmacodynamic endpoint that actually corresponds to what the drug is for is suppression of the wheal and flare produced by intradermal histamine, measured over time. It is objective, it is dose-responsive, and unlike a symptom diary it cannot be moved by expectation.',
          dependsOnStepId: 'cet-w4',
          reagentsAndBuffer:
            'Intradermal histamine dihydrochloride challenge at a fixed concentration, planimetry or digital imaging of wheal and flare area, paired placebo arm, serial timepoints across a full dosing interval',
        },
      ],
    },
    keyAudits: [
      {
        id: 'cet-a1',
        category: 'measured',
        title: 'In chronic hives it clears the rash almost three times as often as placebo',
        laymanSummary:
          'For long-running hives with no identifiable cause, the pooled randomised evidence puts complete clearance at 2.72 times the placebo rate at the standard 10 mg dose.',
        technicalDetails:
          'The Cochrane review of H1 antihistamines for chronic spontaneous urticaria identified 73 studies in 9,759 participants, of which 34 provided data across 23 comparisons. Cetirizine 10 mg once daily produced complete suppression of urticaria more often than placebo both in the short term and at up to three months: RR 2.72 (95% CI 1.51 to 4.91). Loratadine 10 mg against cetirizine 10 mg gave RR 1.05 (95% CI 0.76 to 1.43) for complete suppression — no detectable difference between them. The cetirizine label supports the dose choice from its own registration programme: two 4-week randomised placebo-controlled trials in chronic idiopathic urticaria showed significant improvement, the 10 mg dose was more effective than 5 mg, and 20 mg gave no added effect.',
        evidenceSource:
          'Sharma M, Bennett C, Cohen SN, Carter B. H1-antihistamines for chronic spontaneous urticaria. Cochrane Database Syst Rev 2014;(11):CD006137; cetirizine hydrochloride United States prescribing information, Clinical Studies',
        doi: '10.1002/14651858.CD006137.pub2',
        measuredMetric:
          'Proportion of participants with complete suppression of urticaria, cetirizine 10 mg against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'cet-a2',
        category: 'inferred',
        title: 'The non-sedating claim is made in rodents and contradicted on the carton',
        laymanSummary:
          'Cetirizine is sold as a second-generation, non-drowsy antihistamine. Its own over-the-counter box tells you drowsiness may occur and to be careful driving. Loratadine’s box does not, and fexofenadine’s carries no drowsiness warning at all.',
        technicalDetails:
          'The Clinical Pharmacology section supports low central activity with animal data: autoradiographic studies with radiolabelled cetirizine in the rat showed negligible penetration into the brain, and ex vivo experiments in the mouse showed that systemically administered cetirizine does not significantly occupy cerebral H1 receptors. The human evidence points the other way. The over-the-counter Drug Facts for cetirizine read, under When using this product: drowsiness may occur; avoid alcoholic drinks; alcohol, sedatives and tranquilizers may increase drowsiness; be careful when driving a motor vehicle or operating machinery. The corresponding loratadine Drug Facts read only: do not take more than directed; taking more than directed may cause drowsiness. Paediatric trial data show the dose-response the animal work would not predict: somnolence 1.3% on placebo, 1.9% at 5 mg, 4.2% at 10 mg. The generational label — first-generation sedating, second-generation non-sedating — turns out to describe a gradient rather than a category, and cetirizine sits at the sedating end of the second generation.',
        evidenceSource:
          'Cetirizine hydrochloride United States prescribing information, Clinical Pharmacology and Adverse Reactions; over-the-counter Drug Facts labelling for cetirizine, loratadine and fexofenadine (openFDA SPL)',
        inferredClaim:
          'That cetirizine is a non-sedating antihistamine because rodent studies show negligible brain penetration — a species-level inference the human label declines to make',
        auditFlag: 'contested',
      },
      {
        id: 'cet-a3',
        category: 'conclusion_shift',
        title: 'A drug for itching that can cause itching when it is stopped',
        laymanSummary:
          'Years after approval, the label gained a postmarketing entry: severe new itching starting within a few days of stopping cetirizine, in people who had taken it for months or years.',
        technicalDetails:
          'The postmarketing experience section of the cetirizine label now lists, among rare but potentially severe events, new-onset pruritus within a few days after discontinuation of cetirizine, usually after long-term use of a few months to years. This was not in the original approval and is not explained by the drug’s pharmacology as described elsewhere in the same document: an H1 antagonist with an 8.3-hour half-life and no receptor affinity beyond H1 has no obvious mechanism for a withdrawal syndrome, and the label offers none. The practical consequence is a trap for both patient and clinician: the itch that appears on stopping looks exactly like the condition returning, and treating it by restarting the drug both relieves it and perpetuates it.',
        evidenceSource:
          'Cetirizine hydrochloride United States prescribing information, Adverse Reactions — Post-Marketing Experience',
        measuredMetric:
          'Presence and wording of the discontinuation-pruritus entry in the postmarketing section, against the original approval label',
        auditFlag: 'caution',
      },
      {
        id: 'cet-a4',
        category: 'failed',
        title: 'It did not prevent asthma, and the subgroups that worked were found afterwards',
        laymanSummary:
          'A large trial gave cetirizine to infants with eczema for eighteen months to see whether it would stop them developing asthma. Across everyone randomised, it made no difference. Two allergen-specific subgroups did separate, and no confirmatory trial was ever run.',
        technicalDetails:
          'The Early Treatment of the Atopic Child study randomised infants aged 1 to 2 years with atopic dermatitis to cetirizine 0.25 mg/kg twice daily or placebo for 18 months, with a further 18 months of follow-up after treatment stopped — a design chosen specifically to distinguish suppression from prevention. In the intention-to-treat population there was no difference in cumulative prevalence of asthma (p=0.7). Infants sensitised to house dust mite or grass pollen treated with cetirizine were significantly less likely to develop asthma over the 18 treatment months (p=0.005 and p=0.002), and the grass-pollen effect was sustained across the full 36 months (p=0.008) while the house dust mite difference narrowed. The authors concluded that further studies focusing specifically on sensitised groups were required to substantiate the finding. They were not done, and no preventive indication exists. The same trial produced an adverse signal worth keeping: over 18 months, insomnia was more frequent on cetirizine than placebo, 9.0% against 5.3% — the opposite of the drug’s reputation.',
        evidenceSource:
          'Warner JO; ETAC Study Group. J Allergy Clin Immunol 2001;108:929-937; cetirizine label, Adverse Reactions',
        doi: '10.1067/mai.2001.120015',
        measuredMetric:
          'Cumulative prevalence of asthma at 36 months in the intention-to-treat population, and in prespecified allergen-sensitised subgroups',
        auditFlag: 'caution',
      },
      {
        id: 'cet-a5',
        category: 'failed',
        title: 'For a cold it works for two days and then stops working',
        laymanSummary:
          'Antihistamines are sold for colds all over the world. In eighteen randomised trials the benefit lasted through days one and two and had vanished by day three, and in children there was no benefit at all.',
        technicalDetails:
          'The Cochrane review of antihistamines as monotherapy for the common cold included 18 randomised trials reported in 17 publications, with 4,342 participants of whom 212 were children, in both natural and experimentally induced colds; trials in patients with an allergic component were excluded. On day one or two, 45% had a beneficial effect on overall symptom severity against 38% on placebo, odds ratio 0.74 (95% CI 0.60 to 0.92). There was no difference at three to four days or at six to ten days. On individual symptoms, sedating antihistamines produced small effects the reviewers judged clinically non-significant — rhinorrhoea on day three, mean difference -0.23 (95% CI -0.39 to -0.06) on a four- or five-point scale; sneezing on day three, -0.35 (95% CI -0.49 to -0.20) on a four-point scale. Only two trials included children and the results conflicted. The reviewers concluded there is no evidence of effectiveness in children.',
        evidenceSource:
          'De Sutter AI, Saraswat A, van Driel ML. Antihistamines for the common cold. Cochrane Database Syst Rev 2015;(11):CD009345',
        doi: '10.1002/14651858.CD009345.pub2',
        measuredMetric:
          'Proportion with a beneficial effect on overall cold symptom severity, by day of treatment',
        auditFlag: 'verified',
      },
      {
        id: 'cet-a6',
        category: 'inferred',
        title: 'Guidelines quadruple a dose the label says gave no added effect',
        laymanSummary:
          'For stubborn hives, specialists routinely go to four times the standard dose. The registration trials that set that standard dose found that doubling it added nothing.',
        technicalDetails:
          'The cetirizine label reports from its chronic idiopathic urticaria programme that the 10 mg dose was more effective than 5 mg and that the 20 mg dose gave no added effect. The international EAACI/GA²LEN/EuroGuiDerm/APAAACI urticaria guideline nonetheless recommends increasing a second-generation antihistamine to up to fourfold the licensed dose before adding another agent, in patients not controlled at the standard dose. Both positions can be defensible — a flat dose-response averaged across a registration population does not exclude a benefit in the non-responder subgroup a guideline is written about — but the reader should know that the up-dosing recommendation rests on later trials and expert consensus rather than on the dose-ranging data in the label, and that above the licensed dose the sedation warning on the carton applies with more force, not less.',
        evidenceSource:
          'Cetirizine hydrochloride United States prescribing information, Clinical Studies; Zuberbier T et al. Allergy 2022;77:734-766',
        doi: '10.1111/all.15090',
        inferredClaim:
          'That doses above 10 mg add clinical benefit in chronic urticaria, when the drug’s own dose-ranging programme found 20 mg gave no added effect',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A tablet built to stay out of the brain',
        laymanDesc:
          'Cetirizine is what the body makes when it breaks down an older, very sedating antihistamine. The change that happens in that breakdown is what keeps it mostly out of the brain.',
        molecularDetail:
          'Cetirizine is the carboxylic acid metabolite of hydroxyzine. The terminal carboxylate makes the molecule zwitterionic at physiological pH and sharply reduces passive blood-brain barrier permeation. Absorbed rapidly with Tmax about 1 hour, mean Cmax 311 ng/mL after ten days of 10 mg once daily, plasma protein binding 93%, linear kinetics from 5 to 60 mg, no accumulation.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Histamine is already on its way',
        laymanDesc:
          'The allergen has landed, the mast cell has emptied, and histamine is diffusing into the tissue. The drug does not stop any of that.',
        molecularDetail:
          'Allergen cross-links IgE bound to FcεRI on mast cells and basophils, triggering degranulation within seconds. Cetirizine has no effect on degranulation; it competes for the receptor downstream of it, which is why it works better taken before an exposure than during one.',
        iconName: 'Radio',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The receptor seat is taken',
        laymanDesc:
          'Cetirizine sits in the H1 receptor on blood vessels and nerve endings, so histamine arrives and finds no free receptor.',
        molecularDetail:
          'Selective inhibition of peripheral H1 receptors. In vitro receptor binding showed no measurable affinity for receptors other than H1, and animal models showed negligible anticholinergic and antiserotonergic activity — though the label records that dry mouth was nonetheless more common than placebo in clinical studies.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Leak, itch and sneeze are switched off; blockage is not',
        laymanDesc:
          'Vessels stop leaking and sensory nerves stop firing, so the runny nose, itch, sneeze and hive settle. The blocked nose, which histamine contributes little to, largely does not.',
        molecularDetail:
          'H1 blockade prevents histamine-driven endothelial gap formation, vasodilation and sensory C-fibre activation. Nasal congestion is dominated by late-phase cellular infiltration and by mediators other than histamine, which is the pharmacological reason an intranasal corticosteroid outperforms an oral antihistamine for that symptom.',
        iconName: 'Droplet',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Hives clear in a substantial minority',
        laymanDesc:
          'For chronic hives the measured result is complete clearance about 2.7 times as often as on a dummy tablet.',
        molecularDetail:
          'Cetirizine 10 mg daily against placebo for complete suppression of chronic spontaneous urticaria: RR 2.72 (95% CI 1.51 to 4.91), short and intermediate term. Registration data: 10 mg more effective than 5 mg, 20 mg no added effect.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'A fraction of it does reach the brain',
        laymanDesc:
          'Not enough to sedate most people, and enough to sedate some. The carton says so even though the animal studies said it would not.',
        molecularDetail:
          'Paediatric somnolence was dose-related at 1.3% placebo, 1.9% at 5 mg and 4.2% at 10 mg, against animal data showing negligible brain penetration and no significant cerebral H1 occupancy. The over-the-counter Drug Facts warn that drowsiness may occur, that alcohol and sedatives increase it, and to be careful driving.',
        iconName: 'Moon',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Cochrane H1-antihistamines for chronic spontaneous urticaria (CD006137.pub2)',
        phase: 'Systematic review and meta-analysis of 73 randomised trials',
        sampleSize: 9759,
        primaryEndpoint:
          'Proportion of participants with complete suppression of urticaria, and good or excellent response',
        endpointMet: true,
        statisticalPValue:
          'Cetirizine 10 mg daily against placebo for complete suppression, RR 2.72 (95% CI 1.51 to 4.91); loratadine 10 mg against cetirizine 10 mg, RR 1.05 (95% CI 0.76 to 1.43)',
        unreportedAdverseSignals:
          'Only 34 of the 73 identified studies provided usable data across 23 comparisons, and the intervention durations ran to at most three months. Chronic urticaria frequently lasts years, and none of this evidence describes that timescale.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'ETAC — Early Treatment of the Atopic Child (J Allergy Clin Immunol 2001;108:929-937)',
        phase:
          'Phase 3, randomised, double-blind, placebo-controlled, 18 months plus 18 months follow-up',
        sampleSize: 817,
        primaryEndpoint:
          'Cumulative prevalence of asthma in infants aged 1 to 2 years with atopic dermatitis, over 36 months',
        endpointMet: false,
        statisticalPValue:
          'No difference in the intention-to-treat population, p=0.7; house dust mite-sensitised subgroup p=0.005 and grass pollen-sensitised subgroup p=0.002 over the 18 treatment months, grass pollen sustained to 36 months at p=0.008',
        unreportedAdverseSignals:
          'Insomnia was more frequent on cetirizine than placebo over 18 months, 9.0% against 5.3%, and children aged 6 to 11 months on cetirizine showed greater irritability and fussiness than those on placebo in a separate week-long study.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Cochrane antihistamines for the common cold (CD009345.pub2)',
        phase: 'Systematic review and meta-analysis of 18 randomised trials',
        sampleSize: 4342,
        primaryEndpoint:
          'Severity of overall cold symptoms, antihistamine monotherapy against placebo',
        endpointMet: false,
        statisticalPValue:
          'Day one or two: 45% beneficial effect against 38%, OR 0.74 (95% CI 0.60 to 0.92); no difference at three to four days or six to ten days',
        unreportedAdverseSignals:
          'Effects on individual symptoms were statistically detectable and judged clinically non-significant by the reviewers. Only two trials included children, with conflicting results, and the review concluded there is no evidence of effectiveness in children.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'United States perennial allergic rhinitis and chronic urticaria registration trials (NDA 019835)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, multicentre',
        sampleSize: 534,
        primaryEndpoint:
          'Symptom scores in perennial allergic rhinitis over up to 8 weeks, and in chronic idiopathic urticaria over 4 weeks, at cetirizine 5 to 20 mg',
        endpointMet: true,
        statisticalPValue:
          'Two perennial rhinitis trials showed significant reductions in symptoms for up to 8 weeks; two 4-week urticaria trials showed significant improvement; 10 mg more effective than 5 mg and 20 mg gave no added effect',
        unreportedAdverseSignals:
          'The label reports the outcome of these trials qualitatively rather than as effect sizes with confidence intervals, so the magnitude of the rhinitis benefit cannot be read off the document the way the urticaria dose-response can.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Complete suppression of chronic spontaneous urticaria 2.72 times as often as placebo at 10 mg daily (95% CI 1.51 to 4.91)',
        'No detectable difference from loratadine 10 mg on complete suppression of hives (RR 1.05, 95% CI 0.76 to 1.43)',
        'Dose-related somnolence in children aged 6 to 11: 1.3% on placebo, 1.9% at 5 mg, 4.2% at 10 mg',
        'A 20 mg dose gave no added effect over 10 mg in the registration urticaria trials',
        'Mean elimination half-life 8.3 hours in 146 healthy volunteers, plasma protein binding 93%, about 50% excreted unchanged in urine',
      ],
      unsupportedInferences: [
        'That cetirizine is non-sedating, inferred from rat autoradiography and mouse receptor occupancy while its own carton warns about driving',
        'That it helps a common cold, when the randomised evidence shows a two-day effect and nothing after that, and nothing at all in children',
        'That the allergen-specific subgroups in ETAC identify a population in whom asthma can be prevented, on subgroup analyses the authors said needed confirming and that were never confirmed',
        'That fourfold up-dosing in chronic urticaria follows from the drug’s own dose-ranging data, which found no added effect at twice the licensed dose',
      ],
      whatFailedInitially: [
        'The primary intention-to-treat endpoint of ETAC: no difference in cumulative asthma prevalence at 36 months (p=0.7)',
        'Insomnia and irritability, not sedation, were the signals in the infant trials',
        'No clinically significant effect on nasal obstruction, rhinorrhoea or sneezing in the common cold at any timepoint',
        'A postmarketing entry for new-onset pruritus days after stopping the drug, with no mechanism offered anywhere in the label',
      ],
      realWorldOutcome: [
        'NDA 019835 approved 8 December 1995 as a new molecular entity, later switched to over-the-counter sale, where it remains',
        'Now about six United States cents a unit at pharmacy acquisition cost, one of the cheapest medicines in this file',
        'Cetirizine is the racemate; its R-enantiomer is marketed separately as levocetirizine at a higher price, on a purification argument rather than an outcome one',
        'Remains a first-line agent in every major allergic rhinitis and urticaria guideline, none of which claims it modifies the underlying disease',
      ],
    },
    deliverySystem: {
      type: 'Oral, once daily: tablets, chewable tablets, orally disintegrating tablets, oral solution and syrup, from 6 months of age in the paediatric indications',
      description:
        'Rapidly absorbed with Tmax about 1 hour and comparable bioavailability between tablet and solution. Food does not change total exposure but delays Tmax by 1.7 hours and reduces Cmax by 23%. Metabolism is limited — oxidative O-dealkylation to a metabolite with negligible antihistaminic activity, by an enzyme the label says has not been identified — so about half the dose is excreted unchanged in urine and dose reduction is required in renal impairment.',
      safetyProfile:
        'Drowsiness may occur and the over-the-counter carton says so, with warnings to avoid alcohol and to be careful driving. Contraindicated in anyone who has reacted to hydroxyzine, its parent compound. Dose-related somnolence in children; insomnia and irritability reported in infants. Transient reversible transaminase elevations occur; hepatitis with significant transaminase and bilirubin elevation has been reported. Rare but potentially severe postmarketing events include anaphylaxis, convulsions, cholestasis, hepatitis, glomerulonephritis, haemolytic anaemia, thrombocytopenia, severe hypotension, acute generalised exanthematous pustulosis, suicidal ideation and suicide, and new-onset pruritus within a few days of discontinuation after long-term use.',
    },
    commonQuestions: [
      {
        q: 'Is cetirizine non-drowsy or not?',
        a: 'Less drowsy than the old antihistamines, and not non-drowsy. The over-the-counter box says, in the manufacturer’s own words, that drowsiness may occur, that alcohol and sedatives will make it worse, and to be careful when driving or operating machinery. The loratadine box says only that exceeding the dose may cause drowsiness, and the fexofenadine box carries no drowsiness warning at all. In children aged 6 to 11 the trial rates were 1.3% on placebo, 1.9% at 5 mg and 4.2% at 10 mg — clearly dose-related. The claim that it stays out of the brain comes from rat autoradiography and mouse receptor-occupancy experiments quoted in the label, and it is a claim about rodents.',
        auditNote:
          'The first-generation and second-generation labels describe a gradient, not two categories. Cetirizine is at the sedating end of the second generation and the labelling reflects that.',
      },
      {
        q: 'Will it help my blocked nose?',
        a: 'Less than you would like. Histamine drives the leaking, itching and sneezing part of an allergic reaction, and blocking its receptor deals with those well. Nasal congestion is mostly produced by the later cellular inflammation and by mediators histamine antagonists do not touch, which is why the intranasal corticosteroids outperform oral antihistamines for that specific symptom in essentially every comparison. The cetirizine indication text lists sneezing, runny nose, postnasal discharge, nasal and eye itching and tearing — congestion is conspicuously not on the list.',
      },
      {
        q: 'I started itching badly a few days after I stopped taking it. Is that a coincidence?',
        a: 'It may not be. The postmarketing section of the cetirizine label now lists new-onset pruritus within a few days after discontinuation, usually after long-term use of a few months to years. It is a recognised phenomenon and it is a difficult one, because it looks identical to the original allergy returning and restarting the drug relieves it — which makes the trap self-reinforcing. The label offers no mechanism, and nothing else in the document explains how a receptor antagonist with an eight-hour half-life produces a withdrawal effect. If it happens to you it is worth naming out loud rather than assuming your allergy has worsened.',
      },
      {
        q: 'Does taking it every day stop me developing allergies or asthma?',
        a: 'No, and the trial designed to answer that question is one of the better negative results in allergy. ETAC gave cetirizine or placebo to infants aged 1 to 2 with eczema for 18 months, then followed them for another 18 months without treatment, specifically so that suppression could be told apart from prevention. Across everyone randomised there was no difference in how many developed asthma (p=0.7). Subgroups sensitised to grass pollen or house dust mite did separate, and the authors wrote that this needed confirming in trials focused on those groups. Those trials were not done, and no preventive indication exists anywhere.',
      },
      {
        q: 'Is levocetirizine better?',
        a: 'Levocetirizine is the active R-enantiomer of the cetirizine racemate — half of the same tablet, purified. The pharmacological argument is that the inactive S-enantiomer contributes exposure without benefit. What has not been shown is a clinical difference a patient would notice, and the Cochrane urticaria review found levocetirizine effective against placebo at doses the same review could not separate from cetirizine’s. The practical difference in the United States is price and formulation availability rather than measured outcome.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Cetirizine hydrochloride United States prescribing information — Indications, Clinical Pharmacology (mechanism, absorption, distribution, metabolism, elimination), Adverse Reactions including Post-Marketing Experience, Clinical Studies (NDA 019835)',
        identifier:
          'https://api.fda.gov/drug/drugsfda.json?search=application_number:%22NDA019835%22',
        kind: 'regulatory',
      },
      {
        label:
          'Sharma M, Bennett C, Cohen SN, Carter B. H1-antihistamines for chronic spontaneous urticaria. Cochrane Database Syst Rev 2014;(11):CD006137',
        identifier: '10.1002/14651858.CD006137.pub2',
        kind: 'doi',
      },
      {
        label:
          'De Sutter AI, Saraswat A, van Driel ML. Antihistamines for the common cold. Cochrane Database Syst Rev 2015;(11):CD009345',
        identifier: '10.1002/14651858.CD009345.pub2',
        kind: 'doi',
      },
      {
        label:
          'Warner JO; ETAC Study Group. A double-blinded, randomized, placebo-controlled trial of cetirizine in preventing the onset of asthma in children with atopic dermatitis: 18 months’ treatment and 18 months’ posttreatment follow-up. J Allergy Clin Immunol 2001;108:929-937',
        identifier: '10.1067/mai.2001.120015',
        kind: 'doi',
      },
      {
        label:
          'Zuberbier T, Abdul Latiff AH, Abuzakouk M, et al. The international EAACI/GA²LEN/EuroGuiDerm/APAAACI guideline for the definition, classification, diagnosis, and management of urticaria. Allergy 2022;77:734-766',
        identifier: '10.1111/all.15090',
        kind: 'doi',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — cetirizine, 112 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 2678 — cetirizine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2678',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 4. Prednisone — a label that lists optic neuritis as an indication in section 6 and states in
  //    its precautions that oral corticosteroids are not recommended for optic neuritis.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'prednisone',
    name: 'Prednisone',
    tradeName: 'Deltasone / Orasone',
    sponsor:
      'Introduced in the United States in 1955 by Schering. It is now made by dozens of manufacturers under abbreviated applications, the earliest of which carried in the Drugs@FDA record dates from January 1972; there is no living innovator sponsor and no one with a commercial reason to revise the label.',
    targetGene: 'NR3C1',
    targetProtein:
      'Glucocorticoid receptor. Prednisone itself does not bind it — the 11-keto group must first be reduced to the 11-hydroxy form, prednisolone, by 11-beta-hydroxysteroid dehydrogenase type 1, principally in the liver.',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1955,
    indication:
      'Ten categories of indication across endocrine, rheumatic, collagen, dermatologic, allergic, ophthalmic, respiratory, haematologic, neoplastic and oedematous disease. The allergic-states entry is limited on its face to severe or incapacitating allergic conditions intractable to adequate trials of conventional treatment, including seasonal or perennial allergic rhinitis, bronchial asthma, contact and atopic dermatitis, serum sickness and drug hypersensitivity reactions.',
    patientFriendlyIndication:
      'The short steroid course — for an asthma attack, a bad flare-up, a severe allergic reaction',
    anatomicalSite:
      'Cytoplasmic glucocorticoid receptors in almost every nucleated cell in the body. The drug is inert until the liver converts it, and once converted it acts everywhere.',
    conditionContext: {
      conditionExplainer:
        'An asthma or COPD exacerbation is not mainly a muscle problem. The airway lining is swollen, leaking and full of inflammatory cells, and a bronchodilator does not touch any of that. A glucocorticoid does: it goes into the nucleus of the cells producing the inflammation and turns the programme down at the level of transcription.',
      whyItMatters:
        'That is an enormous amount of power to hand to a tablet, and it is not selective. The same transcriptional reach that stops an asthma attack raises blood glucose, thins bone, suppresses the adrenal gland, and disables the immune response to whatever else is in the body at the time. The drug is genuinely transformative and genuinely dangerous, and the interesting question is never whether it works but for how long and at what cost.',
      whoTakesThis:
        'One in five insured American adults received at least one short outpatient course over three years, most often for upper respiratory infections, spinal conditions and allergies — indications that are largely not on the label.',
      clinicalGoals:
        'Break the inflammation and get off it. The label’s own instruction is that the lowest possible dose be used and that reduction be gradual, because complications depend on dose and duration.',
    },
    oneSentenceVerdict:
      'A glucocorticoid prodrug that cut relapse after an asthma exacerbation by more than half (RR 0.38, 95% CI 0.20 to 0.74) and whose short courses carry a 5.30-fold rate of sepsis, 3.33-fold venous thromboembolism and 1.87-fold fracture in the first 30 days — on a 1955 label that still lists optic neuritis as an indication in section 6 while its own precautions state oral corticosteroids are not recommended for optic neuritis and may increase the risk of new episodes.',
    laymanHowItWorks:
      'Prednisone does nothing at all until the liver changes one atom on it, turning it into prednisolone. That version slips through cell membranes, finds a receptor waiting in the cytoplasm, and carries it into the nucleus, where it sits on DNA and rewrites which genes the cell is running. Dozens of inflammatory genes are switched off and a handful of calming ones are switched on. Nothing about that process is targeted: every cell with the receptor gets the same instruction, which is why the drug works so well and costs so much.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 70,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0560 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 118 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Prednisone reached the United States market in 1955, seven years before the 1962 Drug Amendments required substantial evidence of effectiveness for a new indication. It has been generic for longer than most prescribers have been alive and costs about five and a half United States cents a tablet. The economics matter to the audit rather than to the wallet: with no patent and no innovator, there is nobody with a commercial reason to fund a trial that would prune the indication list or to petition for a labelling change, which is one reason a 1955 indication list has survived into a 2026 label.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Within the class the choice between prednisone, prednisolone, methylprednisolone and dexamethasone is mostly a choice of half-life and formulation, not of efficacy, and no head-to-head evidence makes one of them the right answer for an asthma or COPD exacerbation. The comparison that changes outcomes is not between steroids at all: it is between needing a course and not needing one, which is what an inhaled corticosteroid taken regularly is for. Shortening the course is the other lever, and REDUCE showed five days did the work of fourteen in COPD.',
      conventionalRx: [
        {
          name: 'Dexamethasone',
          class: 'Long-acting synthetic glucocorticoid',
          howItCompares:
            'Roughly six times more potent per milligram and far longer acting, which is why it is given as one or two doses where prednisone is given for days. It is not a prodrug, so it does not depend on hepatic conversion. There is no evidence that it produces better outcomes than prednisone in an airway exacerbation; the argument for it is adherence — a course that is finished before the patient leaves cannot be abandoned on day three.',
          typicalCost:
            'US$0.2461 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 114 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: single-dose regimens; no taper needed for a short course. Cons: longer adrenal suppression per dose; no mineralocorticoid effect, which matters when replacement rather than anti-inflammation is the goal.',
        },
        {
          name: 'Prednisolone',
          class: 'The active form of prednisone, given directly',
          howItCompares:
            'Identical pharmacology with the hepatic conversion step removed. Its practical advantage is in children, where a palatable oral solution exists and a tablet does not. The frequent claim that it must be used instead of prednisone in liver disease is an inference from the prodrug step rather than a demonstrated clinical failure of prednisone, and the label’s actual statement about the liver runs the other way — it warns of an enhanced effect due to decreased metabolism of corticosteroids in cirrhosis.',
          typicalCost:
            'US$4.39 per millilitre of oral solution at United States pharmacy acquisition cost (CMS NADAC, median across 38 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: no conversion step; liquid formulations for children. Cons: the oral solution is many times the price of a tablet per course.',
        },
        {
          name: 'A regularly taken inhaled corticosteroid',
          class: 'Inhaled glucocorticoid',
          howItCompares:
            'The only intervention here that reduces how often the oral course is needed rather than treating the episode once it has arrived. In SYGMA 1 the annual severe exacerbation rate — the events that generate prednisone prescriptions — was 0.20 on a short-acting reliever alone against 0.07 when an inhaled steroid was carried in the reliever.',
          typicalCost:
            'US$0.7198 per millilitre of budesonide inhalation suspension at United States pharmacy acquisition cost (CMS NADAC, median across 51 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: a fraction of the systemic exposure for the same anti-inflammatory job. Cons: does nothing for an attack in progress; adrenal insufficiency was still detectable in 6.8% of asthma patients on inhaled steroids alone in the pooled testing data.',
        },
      ],
      naturalFoods: [
        {
          name: 'Liquorice root — listed here as a hazard, not a substitute',
          activeCompound: 'Glycyrrhizin and its metabolite glycyrrhetinic acid',
          biologicalMechanism:
            'Glycyrrhetinic acid inhibits 11-beta-hydroxysteroid dehydrogenase type 2, the enzyme that protects the mineralocorticoid receptor from cortisol. The result is a pseudohyperaldosteronism — sodium retention, potassium loss and hypertension — which compounds exactly the effects the corticosteroid label warns about under Cardio-Renal and Fluid and Electrolyte Disturbances.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice, and this row is not a recommendation. There is no dietary substitute for a systemic glucocorticoid; the reason liquorice appears at all is that it acts on the same enzyme family and can worsen steroid-associated hypokalaemia and hypertension when taken alongside.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Never stop a long course abruptly',
          action: 'Taper as directed, and never on your own initiative.',
          patientImpact:
            'The label states that corticosteroids produce reversible hypothalamic-pituitary-adrenal axis suppression with the potential for corticosteroid insufficiency after withdrawal, that adrenocortical insufficiency may result from too rapid withdrawal, and that this relative insufficiency may persist for up to 12 months after discontinuation. Pooled testing across 74 studies and 3,753 participants found adrenal insufficiency in 27.4% of asthma patients treated for more than a year.',
          clinicalPrecaution:
            'For that whole 12-month window the label directs that hormone therapy be reinstituted in any situation of stress. The label also names a withdrawal syndrome in its own right: myalgia, arthralgia and malaise on stopping.',
        },
        {
          name: 'Tell anyone treating an infection that you are on it',
          action: 'Say so early, and mention it again if you are not getting better.',
          patientImpact:
            'The label states that corticosteroids suppress the immune system and increase the risk of infection with any pathogen; that they can reduce resistance to new infection, exacerbate existing infection, increase the risk of disseminated or reactivated latent infection, and mask some signs of infection; and that corticosteroid-associated infections can be severe and at times fatal, with rates rising with dose.',
          clinicalPrecaution:
            'Specific named hazards include reactivation of latent tuberculosis, Strongyloides hyperinfection with potentially fatal gram-negative septicaemia in people who have lived in the tropics, and a serious or fatal course of chickenpox or measles in non-immune patients. The label directs that people on corticosteroids be warned to avoid exposure to chickenpox and measles and to seek advice without delay if exposed.',
        },
        {
          name: 'Expect it to affect sleep and mood, and say so if it is severe',
          action: 'Mention insomnia, agitation or low mood rather than waiting it out.',
          patientImpact:
            'The label states that psychic derangements may appear, ranging from euphoria, insomnia, mood swings and personality changes to severe depression and frank psychotic manifestations, and that existing emotional instability or psychotic tendencies may be aggravated.',
          clinicalPrecaution:
            'The same precautions section adds that intraocular pressure may rise, and that it should be monitored if therapy continues beyond six weeks.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C[C@]12CC(=O)[C@H]3[C@H]([C@@H]1CC[C@@]2(C(=O)CO)O)CCC4=CC(=O)C=C[C@]34C',
      chemicalFormula: 'C21H26O5',
      molecularWeight: '358.40 g/mol',
      targetReceptorAffinity:
        'Prednisone has an 11-keto group and negligible affinity for the glucocorticoid receptor as supplied. Reduction of that ketone to the 11-beta-hydroxyl by 11-beta-hydroxysteroid dehydrogenase type 1, mostly hepatic, produces prednisolone, which is the molecule that binds. The label’s chemical name — pregna-1,4-diene-3,11,20-trione, 17,21-dihydroxy-, monohydrate — names all three ketones, including the one at position 11 that has to go before the drug does anything.',
      structureSource: {
        label:
          'PubChem CID 5865 (prednisone) — canonical SMILES, molecular formula and weight, as carried on the enriched record; chemical name and monohydrate form from the prednisone tablets United States prescribing information, Description',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5865',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'prd-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Distinguish prednisone from prednisolone and from cortisone',
          description:
            'Four closely related steroids differ only in oxidation state at C11 and in the presence of the 1,2 double bond, and two of them — prednisone and prednisolone — are the prodrug and the drug. A method that cannot separate an 11-keto from an 11-hydroxy steroid cannot tell which product is in the bottle.',
          reagentsAndBuffer:
            'Prednisone and prednisolone USP reference standards, reversed-phase HPLC with ultraviolet detection at 240 nm for the dienone chromophore, thin-layer chromatography for rapid discrimination, Karl Fischer titration to confirm the monohydrate',
        },
        {
          id: 'prd-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Introduce the 1,2 double bond by microbial dehydrogenation',
          description:
            'Prednisone is cortisone with one extra double bond between C1 and C2, and that single bond raises glucocorticoid potency several-fold while cutting the salt-retaining effect. It is installed biologically rather than chemically, by a bacterial 3-ketosteroid dehydrogenase — the step that made synthetic corticosteroids affordable in the 1950s.',
          dependsOnStepId: 'prd-w1',
          reagentsAndBuffer:
            'Cortisone or a hydrocortisone precursor as substrate, Arthrobacter simplex or Mycobacterium species whole-cell biotransformation, aerated fermenter with controlled pH and temperature, solvent extraction of the product',
        },
        {
          id: 'prd-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallise the monohydrate to a defined polymorph',
          description:
            'The label describes the article as a monohydrate, and hydration state and polymorph determine dissolution rate for a very slightly water-soluble steroid. For a 1 mg tablet that difference is the difference between a therapeutic dose and an inert one.',
          dependsOnStepId: 'prd-w2',
          reagentsAndBuffer:
            'Recrystallisation from aqueous ethanol or acetone-water, controlled cooling profile, X-ray powder diffraction for polymorph identity, dynamic vapour sorption for hydrate stability, USP dissolution apparatus 2',
        },
        {
          id: 'prd-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Measure conversion to prednisolone, not prednisone exposure',
          description:
            'The plasma concentration of prednisone is not the exposure that matters, because prednisone does not bind the receptor. Any pharmacokinetic study that reports only the parent is reporting the wrong analyte, and the ratio is what varies between people with liver disease, in pregnancy, and with enzyme-inducing drugs.',
          dependsOnStepId: 'prd-w3',
          reagentsAndBuffer:
            'Paired plasma quantification of prednisone and prednisolone by LC-MS/MS with deuterated internal standards, human liver microsomes or hepatocytes expressing HSD11B1, NADPH regenerating system, equilibrium dialysis for unbound prednisolone fraction given saturable transcortin binding',
        },
        {
          id: 'prd-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Read transactivation and transrepression as two separate numbers',
          description:
            'The therapeutic effects of a glucocorticoid are attributed mainly to repression of inflammatory transcription, and much of the metabolic toxicity to activation of glucocorticoid-response-element-driven genes. A single potency figure averages the benefit and the harm into one number and hides the only ratio a better steroid would have to improve.',
          dependsOnStepId: 'prd-w4',
          reagentsAndBuffer:
            'Reporter cell lines carrying a glucocorticoid response element luciferase construct and, separately, an NF-kappaB-driven construct, tumour necrosis factor alpha or lipopolysaccharide stimulation, prednisolone as the test article with dexamethasone as reference, parallel cortisol control',
        },
      ],
    },
    keyAudits: [
      {
        id: 'prd-a1',
        category: 'conclusion_shift',
        title: 'The label lists optic neuritis as an indication and tells you not to use it there',
        laymanSummary:
          'Section 6 of the prescribing information names optic neuritis among the eye conditions prednisone is indicated for. The precautions section of the same document says oral corticosteroids are not recommended in optic neuritis and may increase the risk of new episodes. Both sentences are in the label a pharmacist dispenses against today.',
        technicalDetails:
          'The Optic Neuritis Treatment Trial randomised 457 patients with acute optic neuritis at 15 centres to oral prednisone 1 mg/kg/day for 14 days, intravenous methylprednisolone 1 g/day for 3 days followed by oral prednisone, or oral placebo. The outcome in the oral-prednisone group did not differ from placebo on any visual measure. The rate of new episodes of optic neuritis in either eye was higher on oral prednisone than on placebo — relative risk 1.79 (95% CI 1.08 to 2.95) — and was not raised in the intravenous methylprednisolone group. The authors concluded that oral prednisone alone as prescribed in that study is an ineffective treatment and increases the risk of new episodes. That finding was published in 1992 and is reflected in the Precautions: Ophthalmic paragraph of the current label, which states that the use of oral corticosteroids is not recommended in the treatment of optic neuritis and may lead to an increase in the risk of new episodes. It was never removed from the indications list in section 6. This is what a label looks like when there is no innovator sponsor left to revise it.',
        evidenceSource:
          'Beck RW et al., N Engl J Med 1992;326:581-588 (Optic Neuritis Treatment Trial); prednisone tablets United States prescribing information, Indications 6 and Precautions: Ophthalmic',
        doi: '10.1056/NEJM199202273260901',
        measuredMetric:
          'Rate of new optic neuritis episodes on oral prednisone against placebo, and the indication text that survived it',
        auditFlag: 'contested',
      },
      {
        id: 'prd-a2',
        category: 'measured',
        title: 'After an asthma attack it more than halves the relapse rate',
        laymanSummary:
          'Six randomised trials followed people sent home from emergency departments after an asthma attack. Those given a short steroid course came back for more care less than half as often, and about one in ten treated avoided a relapse that would otherwise have happened.',
        technicalDetails:
          'The Cochrane review of corticosteroids for preventing relapse after acute asthma exacerbations included six trials in 374 people — five oral, one intramuscular — comparing a corticosteroid course against placebo after discharge from acute care. Relapse requiring additional care in the first week: RR 0.38 (95% CI 0.20 to 0.74). Maintained over 21 days: RR 0.47 (95% CI 0.25 to 0.89). Subsequent hospitalisations: RR 0.35 (95% CI 0.13 to 0.95). Reliever use fell by a mean 3.3 activations per day (95% CI -5.6 to -1.0). The reviewers put the number needed to treat at about ten. Lung function tests and side effects in the first 7 to 10 days showed no significant difference between groups, though side-effect reporting was sparse and statistically heterogeneous, so absence of a detected difference over ten days is not evidence of safety over ten years.',
        evidenceSource:
          'Rowe BH, Spooner CH, Ducharme FM, Bretzlaff JA, Bota GW. Corticosteroids for preventing relapse following acute exacerbations of asthma. Cochrane Database Syst Rev 2007;(3):CD000195',
        doi: '10.1002/14651858.CD000195.pub2',
        measuredMetric:
          'Relapse requiring additional care within 7 and 21 days of discharge, and subsequent hospitalisation',
        auditFlag: 'verified',
      },
      {
        id: 'prd-a3',
        category: 'conclusion_shift',
        title: 'Five days does the work of fourteen',
        laymanSummary:
          'Guidelines said seven to fourteen days for a COPD flare-up. A randomised trial gave 314 patients either five days or fourteen and found no difference in what happened over the next six months, at half the total steroid.',
        technicalDetails:
          'REDUCE randomised 314 patients presenting to emergency departments in five Swiss teaching hospitals with an acute COPD exacerbation — past or present smokers with at least 20 pack-years and no asthma history — to 40 mg of prednisone daily for either 5 or 14 days, placebo-controlled and double-blind. Ninety-two per cent were admitted. The primary endpoint, time to next exacerbation within 180 days, gave a hazard ratio of 0.95 (90% CI 0.70 to 1.29, p=0.006 for non-inferiority) in the intention-to-treat analysis and 0.93 (90% CI 0.68 to 1.26, p=0.005) per protocol. Re-exacerbation within 180 days was 37.2% against 38.4%, a difference of -1.2% (95% CI -12.2% to 9.8%). There was no difference in time to death, in the combined endpoint, or in recovery of lung function. Mean cumulative prednisone dose was 379 mg (95% CI 311 to 446) against 793 mg (710 to 876), p<0.001. Treatment-associated adverse reactions including hyperglycaemia and hypertension did not differ — which, given the 30-day harm rates measured elsewhere, says more about the power of a 314-patient trial to detect them than about their absence.',
        evidenceSource: 'Leuppi JD et al., JAMA 2013;309:2223-2231 (REDUCE, ISRCTN19646069)',
        doi: '10.1001/jama.2013.5023',
        measuredMetric:
          'Time to next COPD exacerbation within 180 days, 5-day against 14-day course',
        auditFlag: 'verified',
      },
      {
        id: 'prd-a4',
        category: 'failed',
        title:
          'One in five adults gets a course, and the first month afterwards is measurably worse',
        laymanSummary:
          'A nationwide claims study followed one and a half million adults. Twenty-one per cent got at least one short steroid course in three years — most often for a chest infection, a bad back or an allergy — and in the thirty days after starting it their rate of sepsis was five times higher, blood clots three times, and fractures nearly twice.',
        technicalDetails:
          'Waljee and colleagues studied 1,548,945 privately insured United States adults aged 18 to 64 continuously enrolled from 2012 to 2014, using both a cohort design and a self-controlled case series so that each person acted as their own control. 327,452 (21.1%) received at least one outpatient prescription for a course of under 30 days. The commonest indications were upper respiratory tract infections, spinal conditions and allergies. Within 30 days of initiation, incidence rate ratios were 5.30 (95% CI 3.80 to 7.41) for sepsis, 3.33 (2.78 to 3.99) for venous thromboembolism and 1.87 (1.69 to 2.07) for fracture, diminishing over days 31 to 90. The elevation persisted below 20 mg/day prednisone equivalent: 4.02 for sepsis, 3.61 for venous thromboembolism, 1.83 for fracture, all p<0.001. Set that against the label, which limits the allergic-states indication to severe or incapacitating allergic conditions intractable to adequate trials of conventional treatment, and does not list upper respiratory infection or back pain anywhere at all. The self-controlled design substantially blunts the obvious objection — that sicker people get steroids — without eliminating confounding by indication, because the illness that prompted the prescription is itself concentrated in the same 30-day window.',
        evidenceSource:
          'Waljee AK, Rogers MA, Lin P, et al. Short term use of oral corticosteroids and related harms among adults in the United States: population based cohort study. BMJ 2017;357:j1415',
        doi: '10.1136/bmj.j1415',
        measuredMetric:
          'Incidence rate ratios for sepsis, venous thromboembolism and fracture within 30 days of starting a course of under 30 days',
        auditFlag: 'caution',
      },
      {
        id: 'prd-a5',
        category: 'failed',
        title: 'In infant bronchiolitis it does nothing',
        laymanSummary:
          'Seventeen trials in nearly 2,600 wheezing babies found steroids did not reduce admissions on day one or day seven, and did not shorten hospital stays.',
        technicalDetails:
          'The Cochrane review of glucocorticoids for acute viral bronchiolitis in children under 24 months included 17 trials with 2,596 participants, of which three had low overall risk of bias. Glucocorticoids did not significantly reduce outpatient admissions by day 1 (pooled RR 0.92, 95% CI 0.78 to 1.08) or by day 7 (RR 0.86, 95% CI 0.70 to 1.06), and produced no benefit in inpatient length of stay (mean difference -0.18 days, 95% CI -0.39 to 0.04). One large low-risk factorial trial found an unadjusted reduction in day-7 admissions with combined high-dose systemic dexamethasone plus inhaled epinephrine (RR 0.65, 95% CI 0.44 to 0.95, number needed to treat 11), a combination result the reviewers flagged as needing replication rather than adoption. This is the same population in which albuterol also fails, and for the same reason: the obstruction in bronchiolitis is shed epithelium, oedema and mucus plugging in very small airways, and neither relaxing smooth muscle nor suppressing transcription clears a plug in the time available.',
        evidenceSource:
          'Fernandes RM, Bialy LM, Vandermeer B, et al. Glucocorticoids for acute viral bronchiolitis in infants and young children. Cochrane Database Syst Rev 2013;(6):CD004878',
        doi: '10.1002/14651858.CD004878.pub4',
        measuredMetric:
          'Outpatient admissions by days 1 and 7, and inpatient length of stay, glucocorticoid against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'prd-a6',
        category: 'measured',
        title: 'There is no dose or duration at which adrenal suppression can be ruled out',
        laymanSummary:
          'Pooled testing across seventy-four studies found the adrenal glands still switched off in a substantial minority of people after stopping — 1.4% after courses under four weeks, 27.4% after more than a year, and 6.8% in people taking only an inhaled steroid.',
        technicalDetails:
          'The systematic review and meta-analysis of adrenal insufficiency in corticosteroid users pooled 74 articles and 3,753 adult participants tested after treatment. By route, percentages ran from 4.2% for nasal administration (95% CI 0.5 to 28.9) to 52.2% for intra-articular (95% CI 40.5 to 63.6). By dose, from 2.4% at low dose (95% CI 0.6 to 9.3) to 21.5% at high dose (95% CI 12.0 to 35.5). By duration in asthma patients, from 1.4% under 28 days (95% CI 0.3 to 7.4) to 27.4% beyond a year (95% CI 17.7 to 39.8). Asthma treated with inhaled corticosteroids only still produced 6.8% (95% CI 3.8 to 12.0). The authors concluded there is no administration form, dose, duration or underlying disease for which adrenal insufficiency can be excluded with certainty, and that the threshold to test should be low. The label’s corresponding statement is that relative insufficiency may persist for up to 12 months after discontinuation and that hormone therapy should be reinstituted during any stress in that window.',
        evidenceSource:
          'Broersen LH, Pereira AM, Jørgensen JO, Dekkers OM. Adrenal Insufficiency in Corticosteroids Use: Systematic Review and Meta-Analysis. J Clin Endocrinol Metab 2015;100:2171-2180; prednisone tablets label, Warnings: Endocrine',
        doi: '10.1210/jc.2015-1218',
        measuredMetric:
          'Pooled percentage of corticosteroid users with biochemically confirmed adrenal insufficiency, by route, dose and duration',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'The tablet is inactive',
        laymanDesc:
          'What you swallow does not fit the receptor. It is a prodrug, and until the liver changes it, nothing happens.',
        molecularDetail:
          'Prednisone carries a ketone at C11. The glucocorticoid receptor requires an 11-beta-hydroxyl. The label’s own chemical name, pregna-1,4-diene-3,11,20-trione 17,21-dihydroxy- monohydrate, names the C11 ketone that has to be reduced before the molecule has any activity at all.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The liver switches it on',
        laymanDesc:
          'An enzyme in liver cells reduces one ketone to an alcohol. That single change turns prednisone into prednisolone, which is the drug that works.',
        molecularDetail:
          '11-beta-hydroxysteroid dehydrogenase type 1 catalyses the NADPH-dependent reduction of the C11 ketone. The measurement that matters in any pharmacokinetic study is therefore prednisolone, not prednisone. The label warns of an enhanced effect due to decreased metabolism of corticosteroids in cirrhosis, and of altered clearance in thyroid disease in both directions.',
        iconName: 'Filter',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It finds a receptor waiting inside the cell',
        laymanDesc:
          'Unlike most drug targets, this receptor is not on the cell surface. Prednisolone passes straight through the membrane and binds it in the cytoplasm.',
        molecularDetail:
          'The glucocorticoid receptor, NR3C1, sits in the cytoplasm in a chaperone complex. Ligand binding releases the chaperones and exposes the nuclear localisation signal. Almost every nucleated cell in the body carries this receptor, which is why nothing about a systemic glucocorticoid is tissue-selective.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'It rewrites which genes the cell is running',
        laymanDesc:
          'The receptor carries the drug into the nucleus and sits on DNA, switching dozens of inflammatory genes off and a few calming ones on.',
        molecularDetail:
          'The ligand-bound receptor translocates to the nucleus and both activates transcription at glucocorticoid response elements and represses inflammatory transcription driven by NF-kappaB and AP-1. The prednisone label describes this only in the most general terms available in 1955 language: glucocorticoids cause profound and varied metabolic effects, and modify the body’s immune responses to diverse stimuli.',
        iconName: 'Dna',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The exacerbation breaks',
        laymanDesc:
          'Over hours to a day the swelling in the airway subsides, and the chance of coming back for more treatment falls by more than half.',
        molecularDetail:
          'Relapse to additional care within one week after an asthma exacerbation: RR 0.38 (95% CI 0.20 to 0.74), sustained to 21 days at RR 0.47, with subsequent hospitalisation RR 0.35. In COPD, five days of 40 mg was non-inferior to fourteen on time to next exacerbation over 180 days (HR 0.95, 90% CI 0.70 to 1.29).',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And so does everything else the receptor controls',
        laymanDesc:
          'The same instruction reaches bone, blood sugar, the immune system and the adrenal gland. In the thirty days after a course, sepsis, clots and fractures are all measurably more common.',
        molecularDetail:
          'Within 30 days of a short course: sepsis IRR 5.30 (95% CI 3.80 to 7.41), venous thromboembolism 3.33 (2.78 to 3.99), fracture 1.87 (1.69 to 2.07), persisting below 20 mg/day prednisone equivalent. Adrenal insufficiency after cessation ranges from 1.4% after under 28 days to 27.4% after more than a year of asthma treatment, and the label states relative insufficiency may persist for 12 months.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'REDUCE (ISRCTN19646069, JAMA 2013;309:2223-2231)',
        phase: 'Phase 4, randomised, double-blind, placebo-controlled non-inferiority',
        sampleSize: 314,
        primaryEndpoint:
          'Time to next exacerbation within 180 days, 5 days against 14 days of prednisone 40 mg daily in acute COPD exacerbation',
        endpointMet: true,
        statisticalPValue:
          'Hazard ratio 0.95 (90% CI 0.70 to 1.29), p=0.006 for non-inferiority intention-to-treat; re-exacerbation 37.2% against 38.4%, difference -1.2% (95% CI -12.2% to 9.8%); cumulative prednisone 379 mg against 793 mg, p<0.001',
        unreportedAdverseSignals:
          'Hyperglycaemia and hypertension did not differ between arms. A 314-patient trial is not powered to detect the 30-day sepsis, thromboembolism and fracture excesses measured in a 1.5-million-person cohort, so this is an absence of detection rather than an absence of harm.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Optic Neuritis Treatment Trial (N Engl J Med 1992;326:581-588)',
        phase: 'Phase 3, randomised, controlled, three-arm, 15 centres',
        sampleSize: 457,
        primaryEndpoint:
          'Visual function over six months with oral prednisone, intravenous methylprednisolone followed by oral prednisone, or placebo, in acute optic neuritis',
        endpointMet: false,
        statisticalPValue:
          'Oral prednisone did not differ from placebo on any visual measure; new episodes of optic neuritis in either eye were more frequent on oral prednisone than placebo, relative risk 1.79 (95% CI 1.08 to 2.95)',
        unreportedAdverseSignals:
          'The harm signal was in the primary publication and reached the Precautions section of the label. It never reached the Indications section, which still names optic neuritis among the ophthalmic conditions the drug is indicated for.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'Cochrane corticosteroids for preventing relapse after acute asthma (CD000195.pub2)',
        phase: 'Systematic review and meta-analysis of 6 randomised trials',
        sampleSize: 374,
        primaryEndpoint: 'Relapse requiring additional care within one week of discharge',
        endpointMet: true,
        statisticalPValue:
          'RR 0.38 (95% CI 0.20 to 0.74) at one week; RR 0.47 (95% CI 0.25 to 0.89) at 21 days; hospitalisation RR 0.35 (95% CI 0.13 to 0.95); number needed to treat about 10',
        unreportedAdverseSignals:
          'Only 374 people across six trials, with side effects rarely reported and statistically heterogeneous where they were. The benefit estimate is robust; the safety estimate from these trials is close to uninformative.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Cochrane glucocorticoids for acute viral bronchiolitis (CD004878.pub4)',
        phase: 'Systematic review and meta-analysis of 17 randomised trials',
        sampleSize: 2596,
        primaryEndpoint:
          'Outpatient admissions by days 1 and 7, and inpatient length of stay, in children under 24 months',
        endpointMet: false,
        statisticalPValue:
          'Admissions day 1 RR 0.92 (95% CI 0.78 to 1.08); day 7 RR 0.86 (95% CI 0.70 to 1.06); length of stay mean difference -0.18 days (95% CI -0.39 to 0.04)',
        unreportedAdverseSignals:
          'Baseline severity, steroid regimens, comparators and outcomes were heterogeneous, and only three of 17 trials had low overall risk of bias. A combined dexamethasone plus inhaled epinephrine result from one factorial trial was unadjusted and the reviewers did not treat it as practice-changing.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'Waljee et al. United States short-course corticosteroid cohort and self-controlled case series (BMJ 2017;357:j1415)',
        phase: 'Retrospective cohort with self-controlled case series, nationwide insurance claims',
        sampleSize: 1548945,
        primaryEndpoint:
          'Incidence rate ratios for sepsis, venous thromboembolism and fracture within 30 days of starting an oral corticosteroid course of under 30 days',
        endpointMet: true,
        statisticalPValue:
          'Sepsis IRR 5.30 (95% CI 3.80 to 7.41); venous thromboembolism 3.33 (2.78 to 3.99); fracture 1.87 (1.69 to 2.07); persisting below 20 mg/day prednisone equivalent at 4.02, 3.61 and 1.83, all p<0.001',
        unreportedAdverseSignals:
          'The self-controlled design removes stable between-person confounding but not the acute illness that prompted the prescription, which sits inside the same 30-day risk window. The finding that 21.1% of a working-age insured population received a course over three years is not confounded by anything.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Relapse after an asthma exacerbation RR 0.38 (95% CI 0.20 to 0.74) in the first week, hospitalisation RR 0.35 (0.13 to 0.95)',
        'Five days of prednisone non-inferior to fourteen in COPD exacerbation (HR 0.95, 90% CI 0.70 to 1.29) at less than half the cumulative dose',
        'Oral prednisone no better than placebo in acute optic neuritis, with new episodes at RR 1.79 (95% CI 1.08 to 2.95)',
        'Sepsis, venous thromboembolism and fracture rates 5.30-, 3.33- and 1.87-fold in the 30 days after a short course, in 1,548,945 adults',
        'Adrenal insufficiency after cessation in 1.4% of asthma patients treated under 28 days and 27.4% treated beyond a year',
      ],
      unsupportedInferences: [
        'That everything on the ten-category indication list has been shown to work — most of it predates the 1962 requirement for substantial evidence of effectiveness and has no modern randomised support',
        'That a short course is a low-risk intervention, when the 30-day harm rates persist below 20 mg/day prednisone equivalent',
        'That prednisolone must replace prednisone in liver disease, an inference from the prodrug step rather than a demonstrated clinical failure — and one the label’s cirrhosis warning about enhanced effect does not support',
        'That the absence of a detected adverse-event difference in a 314-patient or 374-patient trial says anything about the harms measured in cohorts a thousand times larger',
      ],
      whatFailedInitially: [
        'Oral prednisone in acute optic neuritis: ineffective, and it raised the rate of new episodes',
        'Glucocorticoids in infant bronchiolitis: no effect on admissions at day 1 or day 7, no effect on length of stay',
        'The 7-to-14-day COPD course, which REDUCE showed was twice as much drug as the job required',
        'Adrenal recovery, which the label concedes may take up to 12 months and which pooled testing finds incomplete in a quarter of long-term users',
      ],
      realWorldOutcome: [
        'On the United States market since 1955 and on the WHO Model List of Essential Medicines; about five and a half United States cents a tablet',
        'Received by 21.1% of a working-age insured United States population over three years, most often for upper respiratory infection, back pain and allergy',
        'A label with no innovator sponsor, ten categories of indication, and an internal contradiction about optic neuritis that has stood for more than thirty years',
        'The strongest argument for inhaled corticosteroids in asthma is not that they work better; it is that they reduce how often this drug is needed',
      ],
    },
    deliverySystem: {
      type: 'Oral tablets at 1, 2.5, 5, 10 and 20 mg, plus an oral solution and a delayed-release tablet formulation',
      description:
        'Readily absorbed from the gastrointestinal tract, then converted in the liver to prednisolone, which is the active molecule. The label describes prednisone as very slightly soluble in water and supplied as the monohydrate. Metabolic clearance is decreased in hypothyroid patients and increased in hyperthyroid patients, and the label warns of an enhanced effect due to decreased metabolism in cirrhosis — so the same tablet is a different exposure in different people.',
      safetyProfile:
        'The adverse reaction list runs across every organ system. Immunosuppression with increased risk of any infection, masking of the signs of infection, and severe or fatal outcomes at higher doses; specific hazards include tuberculosis reactivation, Strongyloides hyperinfection with potentially fatal gram-negative septicaemia, and serious or fatal varicella and measles in non-immune patients. Hypothalamic-pituitary-adrenal suppression that may persist up to 12 months after stopping, with a named withdrawal syndrome of myalgia, arthralgia and malaise. Decreased bone formation and increased resorption at any age, and growth suppression in children at low systemic doses even without laboratory evidence of axis suppression. Psychic derangements from euphoria and insomnia through mood swings and severe depression to frank psychosis. Posterior subcapsular cataract, glaucoma with possible optic nerve damage, and raised intraocular pressure requiring monitoring beyond six weeks. Sodium and water retention, potassium loss, hypertension, hyperglycaemia and new or unmasked diabetes. Diminished response to vaccines, and potentiated replication of organisms in live attenuated vaccines. An apparent association with left ventricular free wall rupture after recent myocardial infarction.',
    },
    commonQuestions: [
      {
        q: 'Is a five-day course of prednisone harmless?',
        a: 'It is short, it is often the right thing to do, and it is not harmless. The best-measured estimate comes from 1,548,945 insured American adults aged 18 to 64: in the 30 days after starting a course of under a month, the rate of sepsis was 5.30 times higher, venous thromboembolism 3.33 times, and fracture 1.87 times, all falling back over the following two months. The elevation was still there at doses below 20 mg a day. The design used each person as their own control, which removes the obvious objection that sicker people get steroids — though not entirely, because the illness that prompted the prescription sits inside the same 30-day window. A short course carries a real risk, although the absolute risk is small for most people.',
        auditNote:
          'The commonest reasons for these prescriptions were upper respiratory infections, spinal conditions and allergies. None of the first two is on the prednisone label at all, and the allergy indication is written as severe or incapacitating conditions intractable to conventional treatment.',
      },
      {
        q: 'Why do I need to taper it?',
        a: 'Because the drug tells your adrenal glands to stop making cortisol, and they do not restart on command. The label states that corticosteroids produce reversible suppression of the hypothalamic-pituitary-adrenal axis, that too rapid withdrawal may cause adrenocortical insufficiency, and that this relative insufficiency may persist for up to 12 months after stopping — for that entire window it directs that steroid therapy be reinstituted during any physiological stress such as trauma, surgery or illness. Pooled testing of 3,753 people across 74 studies found adrenal insufficiency in 1.4% of asthma patients treated for under four weeks and 27.4% of those treated for over a year, and the reviewers concluded there is no dose, route or duration at which it can be excluded with certainty. Very short courses are frequently stopped outright, and that is a judgement about how much axis suppression a few days can cause, not evidence that none occurred.',
      },
      {
        q: 'Prednisone or prednisolone — does it matter?',
        a: 'For most people, no. Prednisone is a prodrug: the liver reduces one ketone group to turn it into prednisolone, which is the molecule that binds the receptor. The frequent claim that prednisolone must be used instead when there is liver disease is an inference from that conversion step rather than a demonstrated clinical failure of prednisone, and the label’s only statement about the cirrhotic liver runs the other way — it warns of an enhanced effect due to decreased metabolism of corticosteroids in cirrhosis. Where prednisolone genuinely wins is in children, because a palatable oral solution exists.',
      },
      {
        q: 'Why is optic neuritis listed as something prednisone treats when the same label says not to use it?',
        a: 'Because the label was written before the trial and nobody has revised it. The Optic Neuritis Treatment Trial randomised 457 patients in 1992 and found that oral prednisone alone was no better than placebo on any visual measure and increased the rate of new episodes of optic neuritis, relative risk 1.79 (95% CI 1.08 to 2.95). That finding did make it into the label — it is in the Precautions: Ophthalmic paragraph, which states that oral corticosteroids are not recommended in optic neuritis and may lead to an increase in the risk of new episodes. It never made it out of section 6 of the indications, which still lists optic neuritis. Prednisone has no innovator sponsor and no patent, so there is nobody with a commercial reason to fund a labelling supplement. It is a small illustration of a general problem: old, cheap, essential drugs carry the least maintained labels in medicine.',
        auditNote:
          'When a label contradicts itself, the trial is the tiebreaker. The intravenous methylprednisolone arm of the same trial did speed recovery and did not raise the relapse rate — the harm was specific to oral prednisone alone.',
      },
      {
        q: 'My child has bronchiolitis. Will steroids help?',
        a: 'The evidence says no. Seventeen randomised trials in 2,596 children under two found glucocorticoids did not reduce admissions on day one (RR 0.92) or day seven (RR 0.86), and did not shorten hospital stays (mean difference -0.18 days). This is the same negative result that albuterol gets in the same condition, and for the same physical reason: the obstruction is shed lining, swelling and mucus plugging tiny airways, and neither relaxing muscle nor turning down transcription clears a plug within the hours available. One large trial found a possible benefit from high-dose dexamethasone combined with inhaled epinephrine, which the reviewers treated as a finding needing replication rather than a treatment to adopt.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Prednisone tablets United States prescribing information — Description, Clinical Pharmacology, Indications and Usage (all ten categories), Warnings (Cardio-Renal, Endocrine, Immunosuppression and Increased Risk of Infection, Infection), Precautions (Endocrine, Gastrointestinal, Musculoskeletal, Neuro-psychiatric, Ophthalmic, Vaccines), Adverse Reactions',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22PREDNISONE%22',
        kind: 'regulatory',
      },
      {
        label:
          'Beck RW, Cleary PA, Anderson MM Jr, et al. A randomized, controlled trial of corticosteroids in the treatment of acute optic neuritis. N Engl J Med 1992;326:581-588',
        identifier: '10.1056/NEJM199202273260901',
        kind: 'doi',
      },
      {
        label:
          'Leuppi JD, Schuetz P, Bingisser R, et al. Short-term vs conventional glucocorticoid therapy in acute exacerbations of chronic obstructive pulmonary disease: the REDUCE randomized clinical trial. JAMA 2013;309:2223-2231',
        identifier: '10.1001/jama.2013.5023',
        kind: 'doi',
      },
      {
        label:
          'Waljee AK, Rogers MA, Lin P, et al. Short term use of oral corticosteroids and related harms among adults in the United States: population based cohort study. BMJ 2017;357:j1415',
        identifier: '10.1136/bmj.j1415',
        kind: 'doi',
      },
      {
        label:
          'Rowe BH, Spooner CH, Ducharme FM, Bretzlaff JA, Bota GW. Corticosteroids for preventing relapse following acute exacerbations of asthma. Cochrane Database Syst Rev 2007;(3):CD000195',
        identifier: '10.1002/14651858.CD000195.pub2',
        kind: 'doi',
      },
      {
        label:
          'Fernandes RM, Bialy LM, Vandermeer B, et al. Glucocorticoids for acute viral bronchiolitis in infants and young children. Cochrane Database Syst Rev 2013;(6):CD004878',
        identifier: '10.1002/14651858.CD004878.pub4',
        kind: 'doi',
      },
      {
        label:
          'Broersen LH, Pereira AM, Jørgensen JO, Dekkers OM. Adrenal Insufficiency in Corticosteroids Use: Systematic Review and Meta-Analysis. J Clin Endocrinol Metab 2015;100:2171-2180',
        identifier: '10.1210/jc.2015-1218',
        kind: 'doi',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — prednisone, 118 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 5865 — prednisone structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5865',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 5. Levalbuterol — half of albuterol, sold for five times the price, on a label reporting that
  //    its own trials found no significant difference between it and the racemate.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'levalbuterol',
    name: 'Levalbuterol',
    tradeName: 'Xopenex / Xopenex HFA',
    sponsor:
      'Developed by Sepracor, whose business model was single-enantiomer versions of established racemic drugs. NDA 020837 for the inhalation solution was approved on 25 March 1999 and classified Type 3 — New Dosage Form rather than a new molecular entity; XOPENEX HFA followed under NDA 021730 on 11 March 2005. Both registrations now sit with Hikma and Lupin, with generics since 2009.',
    targetGene: 'ADRB2',
    targetProtein:
      'Beta-2 adrenergic receptor. Levalbuterol is the (R)-enantiomer of albuterol and carries all of the racemate’s receptor activity; the (S)-enantiomer it leaves out had, in the manufacturer’s own methacholine study, a minimal bronchoprotective effect at 20 minutes and none at 180.',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1999,
    indication:
      'Treatment or prevention of bronchospasm in adults, adolescents and children 4 years of age and older with reversible obstructive airway disease',
    patientFriendlyIndication: 'A tight chest and wheeze — the purified half of the blue inhaler',
    anatomicalSite:
      'Beta-2 adrenergic receptors on airway smooth muscle, from the trachea to the terminal bronchioles — the same site, by the same mechanism, as racemic albuterol',
    conditionContext: {
      conditionExplainer:
        'Albuterol is a fifty-fifty mixture of two mirror-image molecules. (R)-albuterol activates the beta-2 receptor. (S)-albuterol does not, and it is cleared far more slowly, so it accumulates with repeated dosing. Levalbuterol is the (R) half on its own.',
      whyItMatters:
        'That is a clean pharmacological argument and it generated a decade of commercial claim. Whether removing an inactive molecule improves anything a patient experiences is an empirical question, and the answer sits in the levalbuterol label itself, which reports a crossover study finding no significant difference between levalbuterol and racemic albuterol on lung function, and a slightly higher rate of systemic beta-adrenergic adverse effects on levalbuterol.',
      whoTakesThis:
        'People with asthma and other reversible airway narrowing aged 4 and over. In practice it was heavily used in United States hospitals during the 2000s, when it cost several times racemic albuterol.',
      clinicalGoals:
        'The same thing racemic albuterol achieves — open the airway now. Nothing in the label claims anything beyond that, and, importantly, nothing in the label claims it does the job better than the racemate.',
    },
    oneSentenceVerdict:
      'The purified (R)-enantiomer of albuterol, marketed on the harm of the discarded (S)-isomer, whose own label reports no significant difference from racemic albuterol on lung function, a slightly higher rate of systemic beta-adrenergic adverse effects, and roughly twice the (R)-albuterol exposure per marketed dose — and whose seven-trial, 1,625-patient meta-analysis in acute asthma found no difference in respiratory rate, oxygen saturation, FEV1 or asthma score.',
    laymanHowItWorks:
      'Levalbuterol does exactly what albuterol does, because it is the working half of albuterol. It lands on the receptor around the airway muscle, raises a second messenger inside the cell, drops the calcium, and the muscle lets go. The pitch was that removing the other half — the mirror-image molecule that does not activate the receptor and hangs around far longer — would make it safer or stronger. Once the trials were done, what the label could say was that it works, and that it works about as well as the mixture it was purified from.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 48,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.2676 per millilitre of levalbuterol inhalation solution at United States pharmacy acquisition cost (CMS NADAC, median across 30 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'The price is the whole story of this drug and it has now reversed. At launch, levalbuterol nebuliser solution cost as much as five times racemic albuterol depending on purchase method — the subject of a 2000 Pharmacotherapy analysis titled, "Levalbuterol nebulizer solution: is it worth five times the cost of albuterol?" In 2026, at pharmacy acquisition cost, levalbuterol is US$0.2676 per millilitre and racemic albuterol is US$0.2505: a difference of about seven per cent. The clinical evidence never changed. The patent expired.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The only substitute that matters here is racemic albuterol, and the comparison is unusually well documented because the manufacturer ran it. Its own label reports a crossover study in which no significant difference was found between any active arm, a study in which 0.63 mg of levalbuterol and 2.5 mg of racemic albuterol were clinically comparable, a cumulative-dose study in which 5 mg of levalbuterol and 10 mg of racemic albuterol matched on both efficacy and safety, and a paediatric study in which onset and duration were clinically comparable. Beyond the racemate, the useful additions are the same ones albuterol has: ipratropium in an acute attack, and an inhaled steroid to stop needing either.',
      conventionalRx: [
        {
          name: 'Racemic albuterol (Ventolin, ProAir, Proventil)',
          class: 'Short-acting beta-2 agonist, 50:50 (R) and (S) enantiomers',
          howItCompares:
            'The comparator in essentially every levalbuterol trial and the drug levalbuterol was purified from. The seven-trial meta-analysis in 1,625 patients with acute asthma found no significant difference in respiratory rate (mean difference 0.35, 95% CI -0.81 to 1.51), oxygen saturation (-0.29, -0.68 to 0.10), percentage change in FEV1 (-28.3, -59.95 to 3.33) or clinical asthma score (-1.01, -5.30 to 3.28), and no difference in side effects. The reviewers concluded levalbuterol should not be used over albuterol for acute asthma.',
          typicalCost:
            'US$0.2505 per millilitre of inhalation solution at United States pharmacy acquisition cost (CMS NADAC, median across 68 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: an enormous evidence base including outcome-relevant trials; universally stocked; marginally cheaper. Cons: contains an enantiomer that is not doing anything, which is a real if so far clinically inconsequential fact.',
        },
        {
          name: 'Ipratropium bromide added to whichever beta-agonist is used',
          class: 'Short-acting inhaled antimuscarinic',
          howItCompares:
            'Additive rather than competing, and the addition has the outcome data neither beta-agonist has against the other: adding an anticholinergic to a short-acting beta-agonist in acute childhood asthma reduced hospital admission at RR 0.73 (95% CI 0.63 to 0.85) across 15 studies and 2,497 children.',
          typicalCost:
            'US$0.1089 per millilitre of inhalation solution at United States pharmacy acquisition cost (CMS NADAC, median across 60 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: high-quality evidence on an endpoint that matters. Cons: no established role as maintenance treatment in mild asthma; dry mouth; must not reach the eye.',
        },
        {
          name: 'An inhaled corticosteroid',
          class: 'Inhaled glucocorticoid, alone or combined with formoterol',
          howItCompares:
            'Treats the inflammation neither enantiomer touches. The label for levalbuterol says so directly in section 5.3: the use of a beta-adrenergic agonist alone may not be adequate to control asthma in many patients, and early consideration should be given to adding anti-inflammatory agents.',
          typicalCost:
            'US$0.7198 per millilitre of budesonide inhalation suspension at United States pharmacy acquisition cost (CMS NADAC, median across 51 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: the arm of SYGMA 1 that changed the exacerbation rate. Cons: useless in the first five minutes of an attack.',
        },
      ],
      naturalFoods: [
        {
          name: 'Caffeine — coffee, tea, cola',
          activeCompound: 'Caffeine, a methylxanthine related to theophylline',
          biologicalMechanism:
            'A weak bronchodilator acting through adenosine receptor antagonism and phosphodiesterase inhibition, raising cyclic AMP by a route independent of the beta-2 receptor, and reducing respiratory muscle fatigue.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. A Cochrane review of seven crossover trials in 75 people with mild to moderate asthma found an FEV1 improvement with a standardised mean difference of 0.72 (95% CI 0.25 to 1.20), about 5%, lasting up to two hours. It is not a treatment for an attack and it interferes with lung function testing.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Prime a new canister away from your face',
          action:
            'Release four sprays into the air before the first use of a XOPENEX HFA canister, and after a drop or a long gap.',
          patientImpact:
            'This is the manufacturer’s own instruction, and it has a safety reason as well as a dosing one: the label records that paradoxical bronchospasm from an inhaled formulation frequently occurs with the first use of a new canister.',
          clinicalPrecaution:
            'Paradoxical bronchospasm may be life threatening and the label directs immediate discontinuation and alternative therapy.',
        },
        {
          name: 'Count how often you are reaching for it',
          action: 'Say if you are using more than usual.',
          patientImpact:
            'Section 5.2 states that needing more doses than usual may be a marker of destabilisation of asthma and requires reassessment of the patient and the regimen, with special consideration of anti-inflammatory treatment.',
          clinicalPrecaution:
            'Section 5.5 states that fatalities have been reported in association with excessive use of inhaled sympathomimetic drugs in asthma. The single-isomer formulation carries the same warning as the racemate.',
        },
        {
          name: 'If you were switched to it, ask what problem the switch solved',
          action: 'Ask whether racemic albuterol was tried and what happened.',
          patientImpact:
            'The pharmacodynamic study in the levalbuterol label found no significant differences between any active treatment arm, including racemic albuterol, and reported that levalbuterol 1.25 mg produced a slightly higher rate of systemic beta-adrenergic adverse effects than racemic albuterol 2.5 mg.',
          clinicalPrecaution:
            'This is a question about evidence, not a reason to stop a medicine that is working. Both drugs are the same pharmacology at the same receptor, and either is a reasonable rescue inhaler.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(C)(C)NC[C@@H](C1=CC(=C(C=C1)O)CO)O',
      chemicalFormula: 'C13H21NO3',
      molecularWeight:
        '239.31 g/mol (free base); dispensed as the hydrochloride at 275.8 g/mol for the nebuliser solution, and as the L-tartrate (2:1 salt) at 628.71 g/mol in XOPENEX HFA',
      targetReceptorAffinity:
        'The (R)-enantiomer of albuterol, carrying the receptor activity of the racemate. The label’s own methacholine challenge study in 12 adults found that (S)-albuterol 1.25 mg had a minimal bronchoprotective effect at 20 minutes and none at 180 minutes — evidence that the discarded isomer is inert rather than harmful. Pharmacokinetically, a single 1.25 mg dose of levalbuterol produced an (R)-albuterol AUC of 3.3 ng·hr/mL against 1.7 ng·hr/mL for a single 2.5 mg dose of racemic albuterol, roughly twice the exposure to the active molecule per marketed dose.',
      structureSource: {
        label:
          'PubChem CID 1929 (levalbuterol) — canonical SMILES, molecular formula and weight, as carried on the enriched record; salt forms, molecular weights and the (S)-albuterol methacholine and pharmacokinetic data from the levalbuterol inhalation solution and XOPENEX HFA United States prescribing information, sections 11, 12.2 and 12.3',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/1929',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'lev-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Prove the absence of the (S)-enantiomer, not the presence of the (R)',
          description:
            'For this product the release test is defined negatively. Racemic albuterol and levalbuterol are identical to every achiral assay, so the only measurement that distinguishes the drug from its far cheaper predecessor is the enantiomeric excess. A batch at 98% enantiomeric purity is a batch of albuterol with a marketing claim attached.',
          reagentsAndBuffer:
            'Levalbuterol hydrochloride reference standard, racemic albuterol sulfate as a system suitability check, chiral HPLC on a cyclodextrin or teicoplanin phase, circular dichroism or optical rotation confirmation, specified enantiomeric excess limit',
        },
        {
          id: 'lev-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Resolve or set the benzylic stereocentre',
          description:
            'Levalbuterol has a single stereocentre at the benzylic alcohol. It is reached either by classical resolution of racemic albuterol with a chiral acid — throwing away half the material — or by asymmetric reduction of the corresponding ketone. Which route is used sets the cost of goods, and the cost of goods is the only place the price difference from racemic albuterol could ever have come from.',
          dependsOnStepId: 'lev-w1',
          reagentsAndBuffer:
            'Racemic albuterol free base with a chiral resolving acid such as di-p-toluoyl tartaric acid, or asymmetric hydrogenation of the aryl ketone precursor with a chiral ruthenium or rhodium catalyst, hydrogen chloride or L-tartaric acid for the final salt',
        },
        {
          id: 'lev-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Form the correct salt for the correct device',
          description:
            'The two marketed products are different salts of the same molecule: the hydrochloride for the aqueous nebuliser solution and the L-tartrate for the pressurised inhaler. Each has to be purified to a different specification — solution clarity and sterility for one, crystal habit and respirable particle size for the other.',
          dependsOnStepId: 'lev-w2',
          reagentsAndBuffer:
            'Hydrogen chloride or L-tartaric acid in alcohol, recrystallisation, jet milling and laser diffraction sizing for the HFA suspension, sterile filtration with edetate disodium and sodium chloride for the preservative-free unit-dose vials at pH 4.0',
        },
        {
          id: 'lev-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Match on (R)-albuterol exposure, not on nominal milligrams',
          description:
            'The label reports that 1.25 mg of levalbuterol gives about twice the (R)-albuterol area under the curve of 2.5 mg of racemic albuterol, which are the doses compared in most of the clinical work. Any experiment that compares those two doses and finds levalbuterol slightly better is comparing two doses of the same drug. The design that tests the isomer hypothesis matches on delivered (R)-albuterol exposure and varies only the presence of (S)-albuterol.',
          dependsOnStepId: 'lev-w3',
          reagentsAndBuffer:
            'Chiral LC-MS/MS quantification of (R)- and (S)-albuterol in plasma with deuterated internal standards, PARI LC Jet nebuliser with a fixed compressor, exposure-matched dosing arms, paired racemic and single-isomer test articles',
        },
        {
          id: 'lev-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Test (S)-albuterol on its own against a bronchoprovocation challenge',
          description:
            'The marketing claim is that (S)-albuterol is harmful — that it increases airway responsiveness rather than merely failing to relax the airway. The assay that tests that gives (S)-albuterol alone, with placebo and racemate arms, and measures bronchoprotection against a provoking agent at multiple timepoints. The manufacturer ran exactly this study in 12 adults and found (S)-albuterol had a minimal effect at 20 minutes and no effect at 180 — inert, not harmful.',
          dependsOnStepId: 'lev-w4',
          reagentsAndBuffer:
            'Inhaled methacholine chloride challenge at 20 and 180 minutes post-dose, four-arm crossover with placebo, racemic albuterol 2.5 mg, levalbuterol 1.25 mg and (S)-albuterol 1.25 mg, PARI LC Jet nebuliser, serial FEV1 by spirometry',
        },
      ],
    },
    keyAudits: [
      {
        id: 'lev-a1',
        category: 'inferred',
        title: 'The label reports no significant difference from the drug it replaced',
        laymanSummary:
          'The whole point of levalbuterol is that it should beat ordinary albuterol. The crossover study printed in its own prescribing information compared three doses of levalbuterol with racemic albuterol and found no significant difference between any of them.',
        technicalDetails:
          'Section 12.2 of the levalbuterol inhalation solution label describes a randomised, double-blind, placebo-controlled crossover study in 20 adults with mild to moderate asthma given single doses of levalbuterol 0.31, 0.63 and 1.25 mg and racemic albuterol 2.5 mg. All active treatments produced significantly greater bronchodilation than placebo, and — in the label’s own words — there were no significant differences between any of the active treatment arms. The bronchodilator responses to levalbuterol 1.25 mg and racemic albuterol 2.5 mg were clinically comparable over the 6-hour evaluation, except for a slightly longer duration after levalbuterol. The 4-week parallel-group study in 362 patients reported that levalbuterol 0.63 mg and racemic albuterol 2.5 mg produced clinically comparable mean percentage change from baseline FEV1 on day 1 and day 29. A cumulative-dose study found comparable efficacy and comparable safety after 5 mg of levalbuterol and 10 mg of racemic albuterol. In children aged 6 to 11, onset and duration of levalbuterol were clinically comparable to racemic albuterol. The XOPENEX HFA registration trials in 748 adults included a marketed albuterol HFA inhaler as an active control and the label reports superiority to placebo only; no superiority to the racemate is claimed anywhere in the document.',
        evidenceSource:
          'Levalbuterol inhalation solution United States prescribing information, sections 12.2 and 14; XOPENEX HFA prescribing information, section 14.1 (NDA 020837, NDA 021730)',
        inferredClaim:
          'That the purified (R)-enantiomer is clinically superior to racemic albuterol — a claim the manufacturer’s own comparative data in the label do not support',
        auditFlag: 'contested',
      },
      {
        id: 'lev-a2',
        category: 'failed',
        title: 'It produced slightly more systemic side effects, not fewer',
        laymanSummary:
          'The safety argument was that removing the inactive half would reduce tremor and heart-racing. In the manufacturer’s own study, the marketed levalbuterol dose caused slightly more of those effects than the marketed albuterol dose, not fewer.',
        technicalDetails:
          'Section 12.2 states that systemic beta-adrenergic adverse effects were observed with all active doses and were generally dose-related for (R)-albuterol, and that levalbuterol 1.25 mg produced a slightly higher rate of systemic beta-adrenergic adverse effects than racemic albuterol 2.5 mg. Section 12.3 explains why: a single 1.25 mg dose of levalbuterol produced an (R)-albuterol area under the curve of 3.3 ng·hr/mL against 1.7 ng·hr/mL for a single 2.5 mg dose of racemic albuterol — approximately twice the exposure to the active molecule. The two marketed doses are not equivalent in (R)-albuterol delivered, which means the small efficacy edge and the small side-effect edge point in the directions a higher dose of the same drug would produce. Nothing in that pattern requires the (S)-enantiomer hypothesis to explain it.',
        evidenceSource:
          'Levalbuterol inhalation solution United States prescribing information, sections 12.2 and 12.3, Table 6 (NDA 020837)',
        measuredMetric:
          'Rate of systemic beta-adrenergic adverse effects, and (R)-albuterol AUC, at the marketed doses of each product',
        auditFlag: 'contested',
      },
      {
        id: 'lev-a3',
        category: 'measured',
        title: 'The manufacturer tested whether the discarded isomer is harmful, and it is not',
        laymanSummary:
          '(S)-albuterol was given on its own to twelve people and challenged with a bronchoconstrictor. It offered almost no protection at twenty minutes and none at three hours. It did not make anything worse either.',
        technicalDetails:
          'Section 12.2 describes a randomised, double-blind, placebo-controlled crossover study in which 12 adults with mild to moderate asthma were challenged with inhaled methacholine chloride at 20 and 180 minutes after a single nebulised dose of racemic albuterol 2.5 mg, levalbuterol 1.25 mg, (S)-albuterol 1.25 mg or placebo. All three actives had a protective effect at 20 minutes, although the effect of (S)-albuterol was minimal. At 180 minutes, levalbuterol’s protection was comparable to racemic albuterol’s, and (S)-albuterol had no bronchoprotective effect. That is a description of an inert molecule, not an actively harmful one, and it is the strongest human test of the (S)-albuterol hypothesis carried in the product’s own labelling. The pharmacological argument for harm — that (S)-albuterol raises intracellular calcium and enhances airway reactivity, and that it is cleared far more slowly so accumulates with repeated dosing — remains a laboratory and pharmacokinetic argument that this study did not confirm clinically.',
        evidenceSource:
          'Levalbuterol inhalation solution United States prescribing information, section 12.2 (NDA 020837)',
        measuredMetric:
          'Bronchoprotection against methacholine challenge at 20 and 180 minutes, (S)-albuterol against placebo, racemate and levalbuterol',
        auditFlag: 'verified',
      },
      {
        id: 'lev-a4',
        category: 'failed',
        title: 'Seven trials, 1,625 patients, no difference on anything',
        laymanSummary:
          'When all the acute asthma trials were pooled, breathing rate, oxygen level, lung function and asthma score were all the same on levalbuterol as on albuterol, and so were the side effects.',
        technicalDetails:
          'The systematic review and meta-analysis of levalbuterol against albuterol in acute asthma across all ages identified seven eligible randomised trials with 1,625 participants. Mean differences with 95% confidence intervals were 0.35 (-0.81 to 1.51) for respiratory rate, -0.29 (-0.68 to 0.10) for oxygen saturation, -28.3 (-59.95 to 3.33) for percentage change in FEV1, and -1.01 (-5.30 to 3.28) for clinical asthma score. None was significant. There were no significant differences in side effects. The authors concluded that levalbuterol was not superior to albuterol on efficacy or safety and that levalbuterol should not be used over albuterol for acute asthma. Two probably eligible trials could not contribute data and some values had to be calculated, which the authors listed as limitations — but the confidence intervals are wide around zero rather than narrow around a benefit.',
        evidenceSource:
          'Jat KR, Khairwa A. Levalbuterol versus albuterol for acute asthma: a systematic review and meta-analysis. Pulm Pharmacol Ther 2013;26:239-248',
        doi: '10.1016/j.pupt.2012.11.003',
        measuredMetric:
          'Respiratory rate, oxygen saturation, percentage change in FEV1 and clinical asthma score, levalbuterol against albuterol in acute asthma',
        auditFlag: 'verified',
      },
      {
        id: 'lev-a5',
        category: 'failed',
        title: 'The largest acute trial missed its primary endpoint and was reported on subgroups',
        laymanSummary:
          'Six hundred and twenty-seven adults in emergency departments were randomised. Time to being ready for discharge — the question the trial was built to answer — did not differ. What got reported was a lung-function difference and an admission benefit in one part of the population.',
        technicalDetails:
          'The XOPENEX Acute Severe Asthma Study randomised adults with FEV1 20% to 55% of predicted to nebulised levalbuterol 1.25 mg (n=315) or racemic albuterol 2.5 mg (n=312), all with prednisone, dosed every 20 minutes for the first hour then every 40 minutes for three further doses and as necessary to 24 hours. The primary endpoint, time to meet discharge criteria, did not differ between treatments. FEV1 improvement after dose 1 was greater with levalbuterol in the intention-to-treat group, 0.50 ± 0.43 L against 0.43 ± 0.37 L (p=0.02). Hospitalisation was 7.0% against 9.3% overall and did not differ (p=0.28). The reported advantages were in subgroups: patients not on recent steroid therapy (admission 3.8% against 9.3%, p=0.03) and patients in the highest quartile of entry plasma (S)-albuterol concentration. Relapse at 30 days was 5% in both arms. Note also the dose asymmetry from the label — 1.25 mg of levalbuterol delivers about twice the (R)-albuterol exposure of 2.5 mg of racemic albuterol — which is an alternative explanation for a small first-dose FEV1 difference that requires no isomer hypothesis at all.',
        evidenceSource:
          'Nowak R, Emerman C, Hanrahan JP, et al. A comparison of levalbuterol with racemic albuterol in the treatment of acute severe asthma exacerbations in adults. Am J Emerg Med 2006;24:259-267',
        doi: '10.1016/j.ajem.2006.01.027',
        measuredMetric: 'Time to meet discharge criteria, and hospitalisation rate, in 627 adults',
        auditFlag: 'caution',
      },
      {
        id: 'lev-a6',
        category: 'conclusion_shift',
        title: 'The price argument ended without the evidence changing',
        laymanSummary:
          'It once cost up to five times racemic albuterol and that gap was the substance of every argument about it. Today the two are within seven per cent of each other at what pharmacies pay, and nothing was ever demonstrated in between.',
        technicalDetails:
          'A 2000 analysis in Pharmacotherapy titled "Levalbuterol nebulizer solution: is it worth five times the cost of albuterol?" concluded that published studies indicated levalbuterol was neither safer nor more effective than an equimolar dose of racemic albuterol, that those studies had been conducted in stable asthma at the top of the dose-response curve rather than in the acute exacerbations where nebulised bronchodilators are actually used, that the manufacturer’s recommended dose was therefore likely too low for rescue therapy, and that levalbuterol may cost as much as five times more depending on purchase method. At CMS National Average Drug Acquisition Cost in August 2026, levalbuterol solution is US$0.2676 per millilitre and racemic albuterol solution is US$0.2505 — a 6.8% difference. Its registration classification provides more context: NDA 020837 was approved on 25 March 1999 as Type 3, a new dosage form, not as a new molecular entity, because the active enantiomer was already being administered inside the racemate.',
        evidenceSource:
          'Asmus MJ, Hendeles L. Levalbuterol nebulizer solution: is it worth five times the cost of albuterol? Pharmacotherapy 2000;20:123-129; CMS NADAC survey effective 19 August 2026; FDA Drugs@FDA record for NDA 020837',
        doi: '10.1592/phco.20.3.123.34776',
        measuredMetric:
          'Acquisition cost per millilitre of levalbuterol against racemic albuterol, at launch and in 2026',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'One molecule instead of two',
        laymanDesc:
          'Albuterol is a fifty-fifty mixture of mirror images. This product contains only the one that works.',
        molecularDetail:
          'Levalbuterol is (R)-albuterol, supplied as the hydrochloride at 275.8 g/mol in the nebuliser solution and as the L-tartrate 2:1 salt at 628.71 g/mol in the HFA inhaler. XOPENEX HFA delivers 45 mcg of levalbuterol free base from the actuator mouthpiece per actuation after priming with four sprays.',
        iconName: 'Split',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It reaches the receptor from outside the cell',
        laymanDesc:
          'Like albuterol, it never enters the muscle cell. The receptor it binds is on the outer surface.',
        molecularDetail:
          'A saligenin beta-2 agonist acting at the seven-transmembrane beta-2 adrenergic receptor. The 4-hydroxy-3-hydroxymethylphenyl head resists catechol-O-methyltransferase, giving fast onset and short duration; the tert-butylamine buys beta-2 preference over beta-1.',
        iconName: 'Layers',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The same receptor, with the same imperfect selectivity',
        laymanDesc:
          'Beta-2 receptors are mostly in the lung and partly in the heart, which is why this drug also raises the pulse.',
        molecularDetail:
          'The label states that data indicate there are beta receptors in the human heart, 10% to 50% of which are beta-2, that their precise function has not been established, and that all beta-adrenergic agonists can produce significant cardiovascular effects measured by pulse, blood pressure, symptoms or electrocardiographic change — the identical wording used in the racemic albuterol label.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Calcium drops and the airway opens',
        laymanDesc: 'Identical to albuterol, because it is the working half of albuterol.',
        molecularDetail:
          'Adenylate cyclase activation raises cyclic AMP, protein kinase A inhibits myosin phosphorylation, intracellular ionic calcium falls, smooth muscle relaxes from trachea to terminal bronchiole. Functional antagonism means relaxation occurs irrespective of the spasmogen involved.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Onset in minutes, duration in hours',
        laymanDesc:
          'Roughly the same numbers as albuterol, from separate trials that were never designed to rank them.',
        molecularDetail:
          'XOPENEX HFA day 1: median time to a 15% FEV1 increase 5.5 to 10.2 minutes in adults and 4.5 minutes in children; median time to peak 76 to 78 minutes; median duration in responders 3 to 4 hours, up to 6 in some. Nebulised levalbuterol after 4 weeks: mean onset about 10 minutes at 1.25 mg, peak about 1.5 hours, duration about 6 hours.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And the same limitation as everything else in this class',
        laymanDesc:
          'It opens the airway and does nothing about the inflammation, and needing it more often is a warning rather than a solution.',
        molecularDetail:
          'Section 5.3: the use of a beta-adrenergic agonist alone may not be adequate to control asthma in many patients, with early consideration to be given to anti-inflammatory agents. Section 5.2: more doses than usual may mark destabilisation. Section 5.5: fatalities have been reported with excessive use of inhaled sympathomimetics.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'Four-week nebulised comparison against racemic albuterol (NDA 020837, section 14)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, parallel-group, five arms',
        sampleSize: 362,
        primaryEndpoint:
          'Mean percentage change from baseline FEV1 on day 1 and day 29 in patients 12 and over with mild to moderate asthma',
        endpointMet: true,
        statisticalPValue:
          'All active regimens superior to placebo on day 1 and day 29; levalbuterol 0.63 mg and racemic albuterol 2.5 mg clinically comparable at both timepoints; levalbuterol 1.25 mg gave the largest mean change',
        unreportedAdverseSignals:
          'The 1.25 mg levalbuterol arm delivers about twice the (R)-albuterol exposure of the 2.5 mg racemic arm, per the pharmacokinetic table in the same label. A dose difference is the simpler explanation for the largest mean change, and the trial was not designed to separate the two hypotheses.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Single-dose crossover pharmacodynamic study (NDA 020837, section 12.2)',
        phase: 'Randomised, double-blind, placebo-controlled crossover',
        sampleSize: 20,
        primaryEndpoint:
          'Percentage change from pre-dose mean FEV1 with levalbuterol 0.31, 0.63 and 1.25 mg against racemic albuterol 2.5 mg and placebo',
        endpointMet: false,
        statisticalPValue:
          'All active treatments significantly better than placebo; no significant differences between any of the active treatment arms',
        unreportedAdverseSignals:
          'Levalbuterol 1.25 mg produced a slightly higher rate of systemic beta-adrenergic adverse effects than racemic albuterol 2.5 mg. The safety claim for the single isomer runs in the opposite direction to the manufacturer’s own measurement.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'XOPENEX Acute Severe Asthma Study (Am J Emerg Med 2006;24:259-267)',
        phase: 'Phase 4, multicentre, randomised, double-blind, active-controlled',
        sampleSize: 627,
        primaryEndpoint:
          'Time to meet discharge criteria in adults with acute asthma exacerbation and FEV1 20% to 55% predicted',
        endpointMet: false,
        statisticalPValue:
          'Time to discharge criteria did not differ; hospitalisation 7.0% against 9.3% (p=0.28); FEV1 after dose 1 0.50 ± 0.43 L against 0.43 ± 0.37 L (p=0.02)',
        unreportedAdverseSignals:
          'The favourable results were subgroup results: patients not on recent steroids (3.8% against 9.3% admission, p=0.03) and the highest quartile of entry plasma (S)-albuterol. The comparison also used non-equivalent (R)-albuterol exposures, which the primary publication does not address.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'Jat and Khairwa meta-analysis of levalbuterol versus albuterol in acute asthma',
        phase: 'Systematic review and meta-analysis of 7 randomised trials',
        sampleSize: 1625,
        primaryEndpoint:
          'Respiratory rate, oxygen saturation, percentage change in FEV1 and clinical asthma score',
        endpointMet: false,
        statisticalPValue:
          'Respiratory rate 0.35 (95% CI -0.81 to 1.51); oxygen saturation -0.29 (-0.68 to 0.10); FEV1 percentage change -28.3 (-59.95 to 3.33); asthma score -1.01 (-5.30 to 3.28); no significant difference in side effects',
        unreportedAdverseSignals:
          'Data were unavailable for two probably eligible trials and some values had to be calculated. The authors concluded levalbuterol should not be used over albuterol in acute asthma.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'No significant difference between any active arm — including racemic albuterol — in the manufacturer’s crossover pharmacodynamic study',
        'Levalbuterol 1.25 mg produced a slightly higher rate of systemic beta-adrenergic adverse effects than racemic albuterol 2.5 mg',
        '(R)-albuterol AUC of 3.3 ng·hr/mL from levalbuterol 1.25 mg against 1.7 ng·hr/mL from racemic albuterol 2.5 mg',
        '(S)-albuterol alone gave minimal bronchoprotection at 20 minutes and none at 180 minutes against methacholine challenge',
        'No difference on respiratory rate, oxygen saturation, FEV1 change, asthma score or side effects across 7 trials and 1,625 patients in acute asthma',
      ],
      unsupportedInferences: [
        'That the (S)-enantiomer is clinically harmful, when the manufacturer’s own methacholine study describes it as inert',
        'That levalbuterol is safer than racemic albuterol, when the label reports slightly more systemic beta-adrenergic effects at the marketed doses',
        'That the small first-dose FEV1 advantage in the acute trial reflects the isomer rather than the roughly twofold higher (R)-albuterol exposure at the doses compared',
        'That a subgroup of patients not on recent steroids, identified after a missed primary endpoint, defines a population in whom the drug is preferable',
      ],
      whatFailedInitially: [
        'The primary endpoint of the largest acute asthma trial: time to meet discharge criteria did not differ',
        'The pooled meta-analysis found no difference on any measured outcome and recommended against preferring levalbuterol',
        'The safety rationale reversed: the marketed levalbuterol dose caused slightly more systemic effects than the marketed racemic dose',
        'FDA classified the original application Type 3, a new dosage form, rather than a new molecular entity',
      ],
      realWorldOutcome: [
        'Approved 25 March 1999 for the nebuliser solution and 11 March 2005 for the HFA inhaler; generic since 2009',
        'Heavily used in United States hospitals through the 2000s at several times the price of racemic albuterol',
        'Now within about seven per cent of racemic albuterol at pharmacy acquisition cost, with no change in the evidence that once justified the gap',
        'A useful reference case for the chiral switch as a class: a real pharmacological distinction that never became a clinical one',
      ],
    },
    deliverySystem: {
      type: 'Preservative-free unit-dose nebuliser solution at 0.31, 0.63 and 1.25 mg per 3 mL, and a pressurised metered-dose inhaler delivering 45 mcg of levalbuterol base per actuation',
      description:
        'The nebuliser vials contain sodium chloride for tonicity, edetate disodium as a stabiliser and sulfuric acid to pH 4.0, and require no dilution. The HFA inhaler is a micronised suspension of levalbuterol tartrate in HFA-134a with dehydrated alcohol and oleic acid, 200 actuations per 15 g canister, primed with four actuations before first use.',
      safetyProfile:
        'Identical in kind to racemic albuterol and worded identically in the label. Paradoxical bronchospasm, which may be life threatening and most often follows the first use of a new canister. Fatalities reported with excessive use of inhaled sympathomimetics. Cardiovascular effects including pulse and blood pressure change and electrocardiogram changes of unknown significance. Immediate hypersensitivity reactions. Hypokalaemia and changes in blood glucose. Needing more doses than usual is a marker of destabilisation, and the drug is not a substitute for corticosteroids.',
    },
    commonQuestions: [
      {
        q: 'Is levalbuterol better than albuterol?',
        a: 'On the evidence that exists, no. The clearest statement of that comes from the levalbuterol label itself, which describes a crossover study comparing three doses of levalbuterol with racemic albuterol and reports that there were no significant differences between any of the active treatment arms. The same label says levalbuterol 0.63 mg and racemic albuterol 2.5 mg were clinically comparable over four weeks, that a cumulative 5 mg of levalbuterol matched a cumulative 10 mg of racemic albuterol on both efficacy and safety, and that in children onset and duration were clinically comparable. The independent pooled analysis of seven trials in 1,625 patients with acute asthma found no difference in breathing rate, oxygen saturation, FEV1 or asthma score, and concluded levalbuterol should not be preferred.',
        auditNote:
          'The XOPENEX HFA registration trials included a marketed racemic albuterol inhaler as an active control. The label reports superiority to placebo and claims no superiority to that control anywhere.',
      },
      {
        q: 'I was told the other half of albuterol is harmful. Is it?',
        a: 'That was the argument, and the manufacturer tested it. Twelve adults with asthma received, on separate occasions, racemic albuterol, levalbuterol, (S)-albuterol alone and placebo, then a methacholine challenge at 20 and 180 minutes. (S)-albuterol’s protective effect at 20 minutes was minimal and at 180 minutes there was none. That describes a molecule that does nothing, not one that does harm. There is a real laboratory literature suggesting (S)-albuterol raises intracellular calcium and enhances airway reactivity, and a real pharmacokinetic fact that it is cleared much more slowly than the (R) form and so accumulates with repeated dosing. Neither has translated into a demonstrated clinical harm in humans.',
      },
      {
        q: 'Why did the trials show levalbuterol working slightly better in some measurements?',
        a: 'Probably because the doses being compared are not equivalent. Section 12.3 of the label reports that a single 1.25 mg dose of levalbuterol produces an (R)-albuterol area under the curve of 3.3 ng·hr/mL, while a single 2.5 mg dose of racemic albuterol produces 1.7 — roughly twice the exposure to the active molecule. Those are the two doses compared in most of the clinical work. A slightly larger bronchodilation and a slightly higher rate of tremor and palpitation are exactly what a higher dose of the same drug produces, and the same section reports both. Testing the isomer hypothesis would require matching the arms on delivered (R)-albuterol and varying only whether (S)-albuterol is present.',
      },
      {
        q: 'Should I switch back to ordinary albuterol?',
        a: 'Discuss a switch with the prescriber. Both drugs act at the same receptor, and either can be a reasonable rescue treatment. The reason the question used to matter was money: levalbuterol once cost up to five times racemic albuterol, and a 2000 analysis asked in its title whether it was worth that. At United States pharmacy acquisition cost in August 2026 the gap is about seven per cent — US$0.2676 against US$0.2505 per millilitre of nebuliser solution — so the price difference is now small for most people.',
      },
      {
        q: 'What is a chiral switch, and why does this drug come up whenever it is discussed?',
        a: 'A chiral switch is taking an established racemic drug — a fifty-fifty mixture of two mirror-image forms — purifying the active one, and registering it as a new product with new patent protection. Levalbuterol is the textbook case because the pharmacological story is genuinely clean, the regulator agreed the product was distinct enough to register, and the clinical difference never materialised. FDA classified the original 1999 application as Type 3, a new dosage form, rather than as a new molecular entity, precisely because the same molecule had been reaching patients inside the racemate for two decades. Some chiral switches produce real gains; this one is on the record as the reference case for the ones that do not.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Levalbuterol hydrochloride inhalation solution United States prescribing information — Description 11, Mechanism of Action 12.1, Pharmacodynamics 12.2 including the (S)-albuterol methacholine study, Pharmacokinetics 12.3 and Table 6, Clinical Studies 14 (NDA 020837)',
        identifier:
          'https://api.fda.gov/drug/drugsfda.json?search=application_number:%22NDA020837%22',
        kind: 'regulatory',
      },
      {
        label:
          'XOPENEX HFA (levalbuterol tartrate) inhalation aerosol United States prescribing information — Indications 1.1, Warnings 5.1 to 5.8, Description 11, Mechanism of Action 12.1, Clinical Studies 14.1 (NDA 021730)',
        identifier:
          'https://api.fda.gov/drug/drugsfda.json?search=application_number:%22NDA021730%22',
        kind: 'regulatory',
      },
      {
        label:
          'Jat KR, Khairwa A. Levalbuterol versus albuterol for acute asthma: a systematic review and meta-analysis. Pulm Pharmacol Ther 2013;26:239-248',
        identifier: '10.1016/j.pupt.2012.11.003',
        kind: 'doi',
      },
      {
        label:
          'Nowak R, Emerman C, Hanrahan JP, et al. A comparison of levalbuterol with racemic albuterol in the treatment of acute severe asthma exacerbations in adults. Am J Emerg Med 2006;24:259-267',
        identifier: '10.1016/j.ajem.2006.01.027',
        kind: 'doi',
      },
      {
        label:
          'Asmus MJ, Hendeles L. Levalbuterol nebulizer solution: is it worth five times the cost of albuterol? Pharmacotherapy 2000;20:123-129',
        identifier: '10.1592/phco.20.3.123.34776',
        kind: 'doi',
      },
      {
        label:
          'Griffiths B, Ducharme FM. Combined inhaled anticholinergics and short-acting beta2-agonists for initial treatment of acute asthma in children. Cochrane Database Syst Rev 2013;(8):CD000060',
        identifier: '10.1002/14651858.CD000060.pub2',
        kind: 'doi',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — levalbuterol, 30 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 1929 — levalbuterol structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/1929',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 6. Chlorpheniramine — 53% of the histamine receptors in your cortex are occupied by a 4 mg
  //    tablet, and it has never been through the modern efficacy standard because it predates it.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'chlorpheniramine',
    name: 'Chlorpheniramine',
    tradeName: 'Chlor-Trimeton / Allergy Relief',
    sponsor:
      'Introduced by Schering in 1949. There is no innovator sponsor today: chlorpheniramine maleate is sold in the United States under over-the-counter monograph M012 rather than under an approved application, which means no company owns the labelling and nobody has to run a trial to keep it on the shelf.',
    targetGene: 'HRH1',
    targetProtein:
      'Histamine H1 receptor, in the periphery and in the brain. It is also a muscarinic acetylcholine receptor antagonist, which is the source of both its drying effect and most of its harms.',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1949,
    indication:
      'Temporary relief of sneezing, runny nose, itching of the nose or throat, and itchy watery eyes due to hay fever or other upper respiratory allergies, under the over-the-counter antihistamine monograph; also widely present as one ingredient in multi-symptom cold and flu combination products',
    patientFriendlyIndication: 'Sneezing, runny nose and itchy eyes — the old allergy tablet',
    anatomicalSite:
      'H1 receptors on blood vessels and sensory nerves in the nose and eyes — and, unlike the newer antihistamines, H1 receptors throughout the cerebral cortex',
    conditionContext: {
      conditionExplainer:
        'Histamine released from mast cells makes vessels leak and sensory nerves fire, producing the sneeze, the runny nose and the itch. Histamine is also one of the brain’s wakefulness transmitters, acting at the same H1 receptor. A drug that blocks the receptor in the nose and also reaches the brain will block both.',
      whyItMatters:
        'That double action was invisible for fifty years and is now measurable. Positron emission tomography puts cortical H1 receptor occupancy from a standard chlorpheniramine dose at 53%, against 11.7% for loratadine, and occupancy tracks measured psychomotor impairment almost perfectly. The sedation is not a side effect in the sense of an unrelated event; it is the same drug doing the same thing in a different organ.',
      whoTakesThis:
        'Anyone who buys allergy tablets or a multi-symptom cold remedy. It is in an enormous number of combination products, which is the main route to accidental double-dosing.',
      clinicalGoals:
        'Symptom relief for a few hours. Nothing about this drug modifies allergic disease, and the newer antihistamines block the same receptor with a fraction of the brain exposure.',
    },
    oneSentenceVerdict:
      'A first-generation H1 antihistamine that occupies 53.0% of cortical histamine receptors at the dose in a standard tablet, against 11.7% for loratadine, whose sedating and anticholinergic properties put its class among the three commonest contributors to a dementia signal at a hazard ratio of 1.54 for the heaviest users — and which is sold without any modern efficacy trial because it reached the market in 1949 and is grandfathered under an over-the-counter monograph.',
    laymanHowItWorks:
      'Chlorpheniramine sits in the receptor histamine uses, so histamine arrives and finds nowhere to dock. That stops the sneeze, the runny nose and the itch. Unlike the newer allergy tablets it also crosses freely into the brain, where histamine is one of the signals that keeps you awake, so it blocks that too. And it blocks a second, unrelated receptor — the one acetylcholine uses — which is why it dries you out, and why it blurs vision, holds up urine and clouds thinking in people who are susceptible.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 58,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0673 per millilitre at United States pharmacy acquisition cost (CMS NADAC, median across 29 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'On the market since 1949 and off patent for most of a century. It is sold under over-the-counter monograph M012, the regulatory pathway for products deemed generally recognised as safe and effective on the basis of historical use and expert panel review rather than an approved application backed by trials. That has a consequence the price obscures: there is no sponsor, no exclusivity and therefore no commercial party with a reason to run the modern trials that would either confirm or retire it.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'For allergic rhinitis, everything newer blocks the same receptor with less brain exposure and a longer dosing interval, and costs about the same or less. The measured comparison is direct: cortical H1 occupancy of 53.0% for chlorpheniramine against 11.7% for loratadine. For a blocked nose, no oral antihistamine is the right answer and an intranasal steroid is. The case for keeping chlorpheniramine is that it is fast, cheap, potent and familiar; the case against it is that everything it does badly, the alternatives do not do at all.',
      conventionalRx: [
        {
          name: 'Loratadine (Claritin)',
          class: 'Second-generation oral H1 antihistamine',
          howItCompares:
            'The direct comparator in the positron emission tomography study: loratadine 10 mg occupied 11.7 ± 19.5% of cortical H1 receptors against 53.0 ± 33.2% for d-chlorpheniramine 2 mg, the amount of active enantiomer in a standard 4 mg chlorpheniramine tablet. Once daily rather than every four to six hours, and its carton carries no ordinary-dose drowsiness warning.',
          typicalCost:
            'US$0.0532 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 109 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: cheaper, longer acting, far less brain exposure, no anticholinergic burden. Cons: slower onset; less potent per milligram at the peripheral receptor.',
        },
        {
          name: 'Cetirizine (Zyrtec)',
          class: 'Second-generation oral H1 antihistamine',
          howItCompares:
            'Faster and more potent than loratadine and the most sedating of the second generation, which puts it between the two. Its over-the-counter carton does warn about drowsiness and driving. It carries no meaningful anticholinergic activity, so it does not contribute to the burden that drives the dementia and delirium signals.',
          typicalCost:
            'US$0.0629 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 112 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: once daily; strong effect on hives as well as rhinitis. Cons: measurable drowsiness in a minority; a documented withdrawal itch after long-term use.',
        },
        {
          name: 'An intranasal corticosteroid',
          class: 'Topical glucocorticoid delivered to the nasal mucosa',
          howItCompares:
            'Treats nasal blockage, which the antihistamine indication text on a chlorpheniramine carton conspicuously does not mention: the listed symptoms are sneezing, runny nose, itching of the nose or throat and itchy watery eyes. Congestion is not on the list because histamine is not what causes most of it.',
          typicalCost:
            'US$0.6920 per millilitre of fluticasone propionate at United States pharmacy acquisition cost (CMS NADAC, median across 51 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: works on the symptom orals are worst at; no systemic sedation or anticholinergic effect. Cons: needs several days of regular use; nosebleeds and local irritation.',
        },
      ],
      naturalFoods: [
        {
          name: 'Nasal saline irrigation',
          activeCompound: 'None — isotonic or hypertonic sodium chloride solution',
          biologicalMechanism:
            'Physically removes allergen and mucus from the nasal lining, reducing the trigger rather than blocking the receptor. It is additive to an antihistamine and, for infants under two in whom cough and cold medicines are now contraindicated, it is what the FDA advice page recommends instead, alongside a cool-mist humidifier and bulb suctioning.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'Not stated here as advice. Effects on symptom scores are small and the safety profile is benign; its importance in this file is that it is the alternative regulators point to for the age group in which this drug class has been withdrawn.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Read every carton in the cupboard before adding another',
          action:
            'Check the active ingredients of any cold or flu product before taking an allergy tablet as well.',
          patientImpact:
            'Chlorpheniramine appears as one ingredient in a very large number of multi-symptom products, frequently alongside acetaminophen and a decongestant. FDA’s own consumer guidance warns that many over-the-counter cough and cold products contain multiple ingredients which can lead to accidental overdosing, and that a product must not be used together with another containing the same drug.',
          clinicalPrecaution:
            'The same combination cartons carry an acetaminophen liver warning and a monoamine oxidase inhibitor contraindication that has nothing to do with the antihistamine — an illustration of how much is being taken at once.',
        },
        {
          name: 'Do not give it to a young child',
          action:
            'Nothing containing an antihistamine or decongestant for a child under two, and check the carton for the under-four instruction.',
          patientImpact:
            'FDA states that children under 2 should not be given any cough and cold product containing a decongestant or antihistamine because serious and possibly life-threatening side effects could occur, including convulsions, rapid heart rates and death. Manufacturers voluntarily removed infant products and relabelled the rest to say do not use in children under 4 years of age.',
          clinicalPrecaution:
            'The ordinary adult carton still carries the line "may cause excitability especially in children" — paradoxical stimulation rather than sedation is the characteristic paediatric response to this class.',
        },
        {
          name: 'Treat the drying as a warning, not a feature',
          action:
            'Mention it if you have glaucoma, prostate trouble, or chronic lung disease before taking it.',
          patientImpact:
            'The over-the-counter carton says to ask a doctor before use if you have a breathing problem such as emphysema or chronic bronchitis, glaucoma, or difficulty in urination due to enlargement of the prostate gland. Those three are not a random list — they are the classic contraindications to an anticholinergic drug, and the drying effect people value is the same pharmacology.',
          clinicalPrecaution:
            'The carton also directs caution when driving or operating machinery, no alcohol, and no exceeding the recommended dose. The American Geriatrics Society Beers Criteria list first-generation antihistamines among the medicines typically best avoided in adults 65 and over.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CN(C)CCC(C1=CC=C(C=C1)Cl)C2=CC=CC=N2',
      chemicalFormula: 'C16H19ClN2',
      molecularWeight: '274.79 g/mol (free base); dispensed as the maleate salt',
      targetReceptorAffinity:
        'A propylamine H1 antagonist with a tertiary dimethylamino tail, a chlorophenyl ring and a pyridine ring. Small, lipophilic and uncharged enough at physiological pH to cross the blood-brain barrier freely, which is the structural difference from the second-generation agents that carry an ionisable carboxylate or are actively effluxed. It is a racemate; the dextrorotatory enantiomer carries the H1 activity, and is marketed separately as dexchlorpheniramine at half the milligram dose. Muscarinic antagonism is substantial and is the basis of its anticholinergic classification.',
      structureSource: {
        label:
          'PubChem CID 2725 (chlorpheniramine) — canonical SMILES, molecular formula and weight, as carried on the enriched record; salt form and labelling from the over-the-counter monograph M012 Drug Facts',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2725',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'cpm-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the maleate salt and the enantiomeric composition',
          description:
            'Two products share this molecule: racemic chlorpheniramine maleate and single-enantiomer dexchlorpheniramine maleate at half the strength. An assay that reports total chlorpheniramine cannot tell them apart, and the dose on the carton depends entirely on which one is in the bottle.',
          reagentsAndBuffer:
            'Chlorpheniramine maleate USP reference standard, reversed-phase HPLC with ultraviolet detection at 262 nm, chiral HPLC for the enantiomeric ratio, non-aqueous titration to confirm maleate stoichiometry',
        },
        {
          id: 'cpm-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Alkylate the chlorophenyl-pyridyl acetonitrile and remove the nitrile',
          description:
            'The classical route builds 4-chlorophenyl-2-pyridylacetonitrile, alkylates it with dimethylaminoethyl chloride, then removes the nitrile by hydrolysis and decarboxylation to leave the benzylic stereocentre. That last step sets a racemic centre, which is why the ordinary product is a racemate and the single-enantiomer product costs more.',
          dependsOnStepId: 'cpm-w1',
          reagentsAndBuffer:
            '4-chlorobenzyl cyanide and 2-chloropyridine or equivalent precursors, sodium amide in toluene, 2-dimethylaminoethyl chloride, acid hydrolysis and decarboxylation, maleic acid in ethanol for salt formation',
        },
        {
          id: 'cpm-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallise the maleate and control the free base',
          description:
            'Residual free base is more lipophilic than the salt and behaves differently on dissolution, which matters for a drug whose entire clinical distinction from its successors is how readily it crosses a membrane. The purification specification is therefore about the salt form as much as about chemical purity.',
          dependsOnStepId: 'cpm-w2',
          reagentsAndBuffer:
            'Recrystallisation from ethanol or acetone, controlled cooling, X-ray powder diffraction for polymorph identity, USP dissolution testing, HPLC release assay for related substances',
        },
        {
          id: 'cpm-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Measure receptor occupancy in the brain, not concentration in the plasma',
          description:
            'The question that separates this drug from its successors is not how much reaches the blood but how much reaches the cortex. Positron emission tomography with an H1 tracer answers it directly, and the answer has been shown to track measured psychomotor impairment with a correlation coefficient of 0.899 across drugs.',
          dependsOnStepId: 'cpm-w3',
          reagentsAndBuffer:
            'Carbon-11 doxepin as H1 receptor tracer, double-blind crossover dosing against a second-generation comparator and placebo, regional cortical binding potential analysis, paired psychomotor battery for the impairment ratio',
        },
        {
          id: 'cpm-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Quantify muscarinic antagonism alongside H1 antagonism',
          description:
            'The anticholinergic activity is not an impurity effect and it is not incidental; it is the basis of the drying that made this drug a cold-remedy ingredient and of the confusion, retention and cumulative dementia signal that made it a geriatric prescribing target. A characterisation that reports only H1 affinity describes half the drug.',
          dependsOnStepId: 'cpm-w4',
          reagentsAndBuffer:
            'Membranes expressing human HRH1 and human muscarinic M1, M2 and M3 receptors, radioligand competition binding with tritiated mepyramine and tritiated N-methylscopolamine, functional calcium flux counter-screen, diphenhydramine and loratadine as high and low anticholinergic references',
        },
      ],
    },
    keyAudits: [
      {
        id: 'cpm-a1',
        category: 'measured',
        title: 'Half the histamine receptors in your cortex, measured by brain scan',
        laymanSummary:
          'Eleven people with hay fever were scanned after a standard dose. Chlorpheniramine had taken up 53% of the histamine receptors in the cerebral cortex. Loratadine, at its standard dose, had taken up 12%.',
        technicalDetails:
          'A double-blind crossover positron emission tomography study using carbon-11 doxepin measured cortical histamine H1 receptor occupancy in 11 young male patients with allergic rhinitis after single oral doses. d-Chlorpheniramine 2 mg — the quantity of active enantiomer contained in a standard 4 mg racemic chlorpheniramine tablet — occupied 53.0 ± 33.2% of cortical H1 receptors. Loratadine 10 mg occupied 11.7 ± 19.5%. Across this and previous studies, receptor occupancy was significantly proportional to the published proportional impairment ratio, with a correlation coefficient of 0.899. That last number is what makes this an audit rather than a curiosity: it establishes that the drowsiness and slowed reactions are a direct readout of target engagement in the brain, not an idiosyncratic side effect that some people happen to get.',
        evidenceSource:
          'Kubo N, Senda M, Ohsumi Y, et al. Brain histamine H1 receptor occupancy of loratadine measured by positron emission topography. Hum Psychopharmacol 2011;26:133-139',
        doi: '10.1002/hup.1184',
        measuredMetric:
          'Cortical histamine H1 receptor occupancy by carbon-11 doxepin PET, and its correlation with the proportional impairment ratio',
        auditFlag: 'verified',
      },
      {
        id: 'cpm-a2',
        category: 'conclusion_shift',
        title: 'Withdrawn for infants after deaths, and relabelled for everyone under four',
        laymanSummary:
          'Cough and cold products containing antihistamines were given to babies for decades. After three infant deaths in one year were attributed to them by medical examiners, manufacturers pulled the infant products and relabelled the rest.',
        technicalDetails:
          'A CDC and National Association of Medical Examiners investigation identified three deaths of infants under 6 months in 2005 for which cough and cold medications were determined by medical examiners or coroners to be the underlying cause, against a background of an estimated 1,519 children under 2 treated in United States emergency departments for adverse events including overdoses during 2004 to 2005. The report noted that the doses at which these medicines cause illness or death in children under 2 are not known, that FDA-approved dosing recommendations for that age group do not exist, and that published evidence of effectiveness in that age group is limited. After a 2007 FDA meeting, manufacturers voluntarily removed over-the-counter infant cough and cold products and voluntarily relabelled the remaining products to state do not use in children under 4 years of age. FDA’s current consumer guidance states that children under 2 should not be given any cough and cold product containing a decongestant or antihistamine, because serious and possibly life-threatening side effects could occur, including convulsions, rapid heart rates and death.',
        evidenceSource:
          'CDC. Infant deaths associated with cough and cold medications — two states, 2005. MMWR Morb Mortal Wkly Rep 2007;56(1):1-4; FDA, Use Caution When Giving Cough and Cold Products to Kids',
        measuredMetric:
          'Attributed infant deaths and emergency department presentations, and the labelling age limit before and after 2007',
        auditFlag: 'caution',
      },
      {
        id: 'cpm-a3',
        category: 'failed',
        title: 'The cold products it lives in do almost nothing for a cold',
        laymanSummary:
          'Antihistamines in colds were tested in eighteen randomised trials. There was a small benefit on days one and two and nothing after that, and the effects on runny nose and sneezing were judged too small to matter.',
        technicalDetails:
          'The Cochrane review of antihistamine monotherapy for the common cold included 18 randomised trials in 4,342 participants, excluding anyone with an allergic component to their illness. On day one or two, 45% had a beneficial effect on overall symptom severity against 38% on placebo, odds ratio 0.74 (95% CI 0.60 to 0.92); there was no difference at three to four days or six to ten days. Sedating antihistamines specifically did produce measurable effects on individual symptoms — rhinorrhoea on day three, mean difference -0.23 (95% CI -0.39 to -0.06) on a four- or five-point scale, and sneezing on day three, -0.35 (95% CI -0.49 to -0.20) on a four-point scale — which the reviewers described as clinically non-significant. Adverse effects including sedation were more commonly reported with the sedating agents, though the difference was not statistically significant. Only two trials included children, with conflicting results, and the reviewers concluded there is no evidence of effectiveness in children. Chlorpheniramine’s largest commercial presence in the United States is precisely as one ingredient among several in multi-symptom cold and flu products.',
        evidenceSource:
          'De Sutter AI, Saraswat A, van Driel ML. Antihistamines for the common cold. Cochrane Database Syst Rev 2015;(11):CD009345',
        doi: '10.1002/14651858.CD009345.pub2',
        measuredMetric:
          'Overall cold symptom severity and individual symptom scores by day, antihistamine against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'cpm-a4',
        category: 'conclusion_shift',
        title: 'A cumulative dementia signal for the class, tracked over ten years',
        laymanSummary:
          'Three and a half thousand people over sixty-five were followed for years. Those with the heaviest ten-year exposure to strongly anticholinergic drugs — of which first-generation antihistamines are one of the three biggest sources — developed dementia about half again as often.',
        technicalDetails:
          'The Adult Changes in Thought prospective cohort followed 3,434 participants aged 65 and over with no dementia at entry, using dispensing records to compute cumulative anticholinergic exposure as total standardised daily doses over the preceding 10 years, excluding the most recent 12 months to avoid prodromal reverse causation. The most common anticholinergic classes used were tricyclic antidepressants, first-generation antihistamines and bladder antimuscarinics. Over a mean 7.3 years, 797 participants (23.2%) developed dementia. Adjusted hazard ratios against non-use were 0.92 (95% CI 0.74 to 1.16) at 1 to 90 total standardised daily doses, 1.19 (0.94 to 1.51) at 91 to 365, 1.23 (0.94 to 1.62) at 366 to 1,095 and 1.54 (1.21 to 1.96) above 1,095, with a dose-response trend at p<0.001. This is an observational cohort and it cannot establish causation, but the dose-response gradient and the exclusion of the final year are the two design features that most weaken the obvious alternative explanations. The American Geriatrics Society Beers Criteria list first-generation antihistamines among the medicines typically best avoided in adults 65 and over.',
        evidenceSource:
          'Gray SL, Anderson ML, Dublin S, et al. Cumulative use of strong anticholinergics and incident dementia: a prospective cohort study. JAMA Intern Med 2015;175:401-407; 2023 AGS Beers Criteria, J Am Geriatr Soc 2023;71:2052-2081',
        doi: '10.1001/jamainternmed.2014.7663',
        inferredClaim:
          'That cumulative anticholinergic exposure causes dementia, rather than marking populations at higher risk for other reasons — an inference the dose-response gradient supports and an observational design cannot establish',
        auditFlag: 'caution',
      },
      {
        id: 'cpm-a5',
        category: 'inferred',
        title: 'The drying effect and the harm list are the same pharmacology',
        laymanSummary:
          'People value this drug because it dries you up. The carton’s own list of who should ask a doctor first — glaucoma, prostate trouble, chronic lung disease — is the standard warning list for exactly that drying mechanism.',
        technicalDetails:
          'Chlorpheniramine is a muscarinic acetylcholine receptor antagonist as well as an H1 antagonist. The over-the-counter Drug Facts direct the reader to ask a doctor before use if they have a breathing problem such as emphysema or chronic bronchitis, glaucoma, or difficulty in urination due to enlargement of the prostate gland. Those three conditions are the textbook contraindications to anticholinergic drugs: thickened secretions in chronic airway disease, angle closure in predisposed eyes, and worsened bladder outlet obstruction. The secretion-drying that makes the molecule useful in a cold remedy, the urinary retention, the blurred vision, the constipation and the confusion in older patients are one mechanism described four ways. The second-generation antihistamines block the same histamine receptor with negligible muscarinic activity, which means the drying is separable from the antihistamine effect and is not part of what makes an allergy tablet work.',
        evidenceSource:
          'Chlorpheniramine maleate over-the-counter Drug Facts labelling under monograph M012 (openFDA SPL); receptor pharmacology as reflected in the anticholinergic classification used by the Beers Criteria and the Adult Changes in Thought cohort',
        inferredClaim:
          'That the anticholinergic drying is a therapeutic property worth having, when it is separable from H1 blockade, absent from the newer agents, and the source of the class’s characteristic harms',
        auditFlag: 'contested',
      },
      {
        id: 'cpm-a6',
        category: 'failed',
        title: 'It has never been through the modern efficacy standard',
        laymanSummary:
          'Chlorpheniramine reached the market in 1949, thirteen years before American law began requiring proof that a drug works. It is sold today under a monograph rather than an approval, so there is no trial package behind it and no company obliged to produce one.',
        technicalDetails:
          'The 1962 Drug Amendments introduced the requirement for substantial evidence of effectiveness. Chlorpheniramine predates it by thirteen years, and today it is marketed in the United States under over-the-counter monograph M012 — the pathway for active ingredients deemed generally recognised as safe and effective on the basis of historical use and expert panel review, not on the basis of an approved application supported by controlled trials. The consequences are structural rather than scandalous. There is no sponsor, so there is no party with a commercial reason to fund the trials that would confirm or retire it; no exclusivity, so no revenue to fund them from; and no innovator label, so the labelling changes when the monograph changes and not otherwise. The most informative modern data on this molecule — the brain receptor occupancy study, the cold meta-analysis, the anticholinergic cohort — were all produced by academics and public agencies, and none of them was required by anyone.',
        evidenceSource:
          'Chlorpheniramine maleate marketed under over-the-counter monograph M012 (openFDA SPL application number field); Federal Food, Drug, and Cosmetic Act as amended in 1962',
        measuredMetric:
          'Regulatory pathway — monograph rather than approved application — and the date of market entry against the date of the effectiveness requirement',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A small, greasy molecule that goes everywhere',
        laymanDesc:
          'Swallowed as a tablet, absorbed quickly, and — unlike the newer allergy tablets — free to cross into the brain.',
        molecularDetail:
          'A propylamine antihistamine with a tertiary amine, a chlorophenyl ring and a pyridine ring: small, lipophilic, and lacking the ionisable carboxylate or efflux-transporter substrate character that keeps second-generation agents peripheral. Dispensed as the maleate salt, dosed every four to six hours.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It occupies the histamine receptor in the nose',
        laymanDesc:
          'Histamine released by allergy cells finds the receptor already taken, so the vessels do not leak and the nerves do not fire.',
        molecularDetail:
          'Competitive H1 receptor antagonism on vascular endothelium and sensory nerve endings in the nasal and conjunctival mucosa. The monograph indication reflects exactly what that blocks: sneezing, runny nose, itching of the nose or throat, and itchy watery eyes — not congestion.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'It occupies the same receptor in the brain',
        laymanDesc:
          'Histamine is one of the brain’s wakefulness signals. Blocking it there is what makes you drowsy, and the amount blocked has been measured.',
        molecularDetail:
          'Cortical H1 receptor occupancy of 53.0 ± 33.2% at the d-chlorpheniramine 2 mg equivalent of a standard tablet, by carbon-11 doxepin PET, against 11.7 ± 19.5% for loratadine 10 mg. Occupancy across drugs correlated with the proportional impairment ratio at r=0.899.',
        iconName: 'Moon',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'And it blocks a second, different receptor entirely',
        laymanDesc:
          'The acetylcholine receptor. That is the drying — of the nose, and of the mouth, eyes, gut and bladder along with it.',
        molecularDetail:
          'Muscarinic antagonism sufficient to classify chlorpheniramine as a strong anticholinergic in the scales used by the Beers Criteria and by the Adult Changes in Thought cohort. The Drug Facts warnings for glaucoma, prostatic obstruction and chronic airway disease are anticholinergic warnings.',
        iconName: 'Droplet',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Symptoms settle for a few hours',
        laymanDesc:
          'Fast and effective for the sneeze, the drip and the itch, and gone again in four to six hours.',
        molecularDetail:
          'The over-the-counter directions are one 4 mg tablet every four to six hours to a maximum of 24 mg in 24 hours in adults and children 12 and over, with children under 12 directed to consult a doctor. Nothing in the monograph indication addresses nasal blockage or asthma.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And the exposure accumulates over a lifetime',
        laymanDesc:
          'Each dose is trivial. The measure that matters in the cohort data is ten years of cumulative anticholinergic exposure, and at the top of that range dementia was half again as common.',
        molecularDetail:
          'Adjusted hazard ratio 1.54 (95% CI 1.21 to 1.96) for incident dementia at more than 1,095 total standardised daily doses over 10 years, with a dose-response trend at p<0.001, in 3,434 adults aged 65 and over. First-generation antihistamines were one of the three commonest exposure classes.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'Carbon-11 doxepin PET receptor occupancy crossover (Hum Psychopharmacol 2011;26:133-139)',
        phase: 'Double-blind, randomised crossover imaging study',
        sampleSize: 11,
        primaryEndpoint:
          'Cortical histamine H1 receptor occupancy after single oral doses of d-chlorpheniramine 2 mg and loratadine 10 mg in patients with allergic rhinitis',
        endpointMet: true,
        statisticalPValue:
          'd-Chlorpheniramine 53.0 ± 33.2% against loratadine 11.7 ± 19.5%; occupancy proportional to the published proportional impairment ratio across drugs, r=0.899',
        unreportedAdverseSignals:
          'Eleven young male participants is a small and narrow sample, and the standard deviations are very wide — 33 points around a 53-point mean. The direction of the difference is unambiguous; the precision of either figure is not.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Cochrane antihistamines for the common cold (CD009345.pub2)',
        phase: 'Systematic review and meta-analysis of 18 randomised trials',
        sampleSize: 4342,
        primaryEndpoint: 'Severity of overall cold symptoms, antihistamine against placebo',
        endpointMet: false,
        statisticalPValue:
          'Day one or two, 45% beneficial effect against 38%, OR 0.74 (95% CI 0.60 to 0.92); no difference at three to four or six to ten days; rhinorrhoea day three MD -0.23 (-0.39 to -0.06), sneezing day three -0.35 (-0.49 to -0.20), both judged clinically non-significant',
        unreportedAdverseSignals:
          'Only two of the 18 trials included children and the results conflicted; the reviewers concluded there is no evidence of effectiveness in children. That is the same population in which the products were withdrawn on safety grounds.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'Adult Changes in Thought anticholinergic cohort (JAMA Intern Med 2015;175:401-407)',
        phase: 'Prospective population-based cohort, mean 7.3 years follow-up',
        sampleSize: 3434,
        primaryEndpoint:
          'Incident dementia and Alzheimer disease by cumulative 10-year anticholinergic exposure in adults 65 and over',
        endpointMet: true,
        statisticalPValue:
          'Adjusted HR 0.92 (95% CI 0.74 to 1.16), 1.19 (0.94 to 1.51), 1.23 (0.94 to 1.62) and 1.54 (1.21 to 1.96) across rising exposure bands; test for trend p<0.001; 797 of 3,434 (23.2%) developed dementia',
        unreportedAdverseSignals:
          'Observational. The most recent 12 months of exposure were excluded to reduce reverse causation from prodromal symptoms, and results were reported as robust in sensitivity analyses, but confounding by indication cannot be excluded for a class taken for insomnia, allergy and bladder symptoms that all track with age.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Cortical H1 receptor occupancy of 53.0 ± 33.2% at a standard dose, against 11.7 ± 19.5% for loratadine 10 mg',
        'Receptor occupancy correlates with measured psychomotor impairment across antihistamines at r=0.899',
        'A dose-response gradient for incident dementia with cumulative anticholinergic exposure, reaching HR 1.54 (95% CI 1.21 to 1.96)',
        'An estimated 1,519 children under 2 treated in United States emergency departments for cough and cold medicine adverse events in 2004-2005, and three infant deaths in 2005 attributed by medical examiners',
        'No benefit beyond day two in the common cold, and no evidence of effectiveness in children at all',
      ],
      unsupportedInferences: [
        'That the anticholinergic drying is a therapeutic feature, when it is absent from the newer antihistamines that treat the same symptoms',
        'That drowsiness is an idiosyncratic side effect rather than a direct readout of target engagement in the brain',
        'That cumulative anticholinergic exposure causes dementia, which the cohort design supports but cannot establish',
        'That an ingredient grandfathered under a monograph has been shown to work by the standard applied to every drug approved since 1962',
      ],
      whatFailedInitially: [
        'The paediatric use case: infant products withdrawn, remaining products relabelled to exclude children under 4',
        'The common cold indication: a two-day benefit on a global score and clinically non-significant effects on individual symptoms',
        'The older-adult use case: first-generation antihistamines are on the Beers list of medicines typically best avoided over 65',
        'The regulatory record: no modern efficacy package exists and no party is obliged to produce one',
      ],
      realWorldOutcome: [
        'On the United States market since 1949, sold under over-the-counter monograph M012 with no innovator sponsor',
        'About seven United States cents per millilitre at pharmacy acquisition cost — among the cheapest medicines anywhere',
        'Still an ingredient in a very large number of multi-symptom cold and flu products, which is the main route to accidental duplication',
        'Displaced from first-line allergy treatment by the second-generation agents, which are now cheaper as well as less sedating',
      ],
    },
    deliverySystem: {
      type: 'Oral: 4 mg immediate-release tablets, extended-release tablets, syrups and oral solutions, and a very large number of fixed-dose combination cold and flu products',
      description:
        'The over-the-counter directions for the plain tablet are one every four to six hours in adults and children 12 and over, to a maximum of 24 mg in 24 hours, with children under 12 directed to consult a doctor. Onset is fast because the molecule is small and lipophilic — the same property that gives it its brain exposure. It is also available as the single-enantiomer dexchlorpheniramine at half the milligram strength.',
      safetyProfile:
        'Drowsiness at ordinary doses, with the carton directing caution when driving or operating machinery and avoidance of alcohol, sedatives and tranquillisers. Paradoxical excitability, especially in children. Anticholinergic effects — dry mouth, blurred vision, constipation, urinary retention, confusion — with the carton directing that anyone with glaucoma, prostatic enlargement or chronic airway disease ask a doctor first. Contraindicated with monoamine oxidase inhibitors in the combination products that carry them. Not to be given to children under 2 in any cough and cold product containing an antihistamine or decongestant, and the remaining products are labelled do not use under 4 years. Listed by the American Geriatrics Society among medicines typically best avoided in adults 65 and over.',
    },
    commonQuestions: [
      {
        q: 'Why does this make me so much sleepier than a modern allergy tablet?',
        a: 'Because it is doing the same thing in your brain that it does in your nose. Histamine is one of the transmitters that keeps you awake, acting at the same H1 receptor that produces the sneeze and the itch, and chlorpheniramine crosses into the brain freely while the newer antihistamines largely do not. This has been measured directly rather than inferred: a brain scan study in 11 patients found that a standard chlorpheniramine dose occupied 53% of the histamine receptors in the cerebral cortex, while loratadine 10 mg occupied 12%. Across a set of antihistamines, the amount of receptor occupied tracked measured psychomotor impairment with a correlation of 0.899. The drowsiness is not an unlucky side effect; it is the drug hitting its target in an organ you did not intend to treat.',
      },
      {
        q: 'Is it safe to give to my child for a cold?',
        a: 'Under two, no — the FDA position is explicit that children under 2 should not be given any cough and cold product containing a decongestant or antihistamine, because serious and possibly life-threatening effects including convulsions, rapid heart rates and death could occur. Manufacturers withdrew infant products voluntarily after a CDC and medical examiner investigation attributed three infant deaths in 2005 to these medicines, against a background of about 1,519 emergency department visits by children under 2 in 2004-2005. The remaining products were voluntarily relabelled do not use in children under 4 years of age. There is also very little to lose: the pooled randomised evidence for antihistamines in colds found no demonstrated effectiveness in children at all.',
        auditNote:
          'The ordinary adult carton carries the line "may cause excitability especially in children". Paradoxical stimulation, not sedation, is the characteristic response in this age group, and it is part of what made overdose in infants dangerous.',
      },
      {
        q: 'Should older people avoid it?',
        a: 'That is the mainstream geriatric position, and it rests on two separate things. The first is immediate: anticholinergic drugs cause confusion, falls, urinary retention and blurred vision in older people more readily than in younger ones, which is why first-generation antihistamines sit on the American Geriatrics Society Beers list of medicines typically best avoided over 65. The second is cumulative: a prospective cohort of 3,434 adults over 65 found a dose-response relationship between ten-year anticholinergic exposure and incident dementia, reaching a hazard ratio of 1.54 (95% CI 1.21 to 1.96) in the heaviest-exposure group, with first-generation antihistamines among the three commonest sources. That study is observational and cannot prove cause. What makes it hard to dismiss is the gradient — the risk rose step by step with exposure — and that the second-generation antihistamines offer the same benefit without the exposure.',
      },
      {
        q: 'It dries me up better than the newer ones. Is that a real advantage?',
        a: 'It is a real effect, and it is a different drug action from the one treating your allergy. Chlorpheniramine blocks the acetylcholine receptor as well as the histamine receptor, and the acetylcholine block is what dries secretions. That is why the newer antihistamines, which are almost purely H1 blockers, do not do it. The reason to be careful about calling it an advantage is that the same block is responsible for the dry mouth, the blurred vision, the constipation, the urinary hesitancy and the confusion, and it is why the carton tells anyone with glaucoma, prostate enlargement or chronic bronchitis to ask a doctor first. You are buying the drying and the harms together, because they are the same pharmacology.',
      },
      {
        q: 'Has this drug ever been properly tested?',
        a: 'Not to the standard applied to anything approved since 1962. Chlorpheniramine reached the market in 1949, thirteen years before United States law began requiring substantial evidence of effectiveness, and it is sold today under over-the-counter monograph M012 rather than under an approved application. A monograph ingredient is one an expert panel deemed generally recognised as safe and effective on the basis of historical use; there is no trial package behind it in the way there is behind montelukast or cetirizine. That is not the same as saying it does not work — it is a potent H1 antagonist and it relieves allergic symptoms. It does mean that nobody is obliged to test it, that there is no sponsor with a reason to, and that the most useful modern evidence about it has come from academics and public health agencies studying its harms rather than from anyone establishing its benefits.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Chlorpheniramine maleate over-the-counter Drug Facts labelling under monograph M012 — Uses, Warnings, When using this product, Ask a doctor before use, Directions (openFDA structured product labelling)',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22CHLORPHENIRAMINE+MALEATE%22',
        kind: 'regulatory',
      },
      {
        label:
          'Kubo N, Senda M, Ohsumi Y, et al. Brain histamine H1 receptor occupancy of loratadine measured by positron emission topography: comparison of H1 receptor occupancy and proportional impairment ratio. Hum Psychopharmacol 2011;26:133-139',
        identifier: '10.1002/hup.1184',
        kind: 'doi',
      },
      {
        label:
          'Centers for Disease Control and Prevention. Infant deaths associated with cough and cold medications — two states, 2005. MMWR Morb Mortal Wkly Rep 2007;56(1):1-4',
        identifier: 'https://pubmed.ncbi.nlm.nih.gov/17218934/',
        kind: 'pmid',
      },
      {
        label:
          'US Food and Drug Administration. Use Caution When Giving Cough and Cold Products to Kids — consumer safety guidance on antihistamine- and decongestant-containing products in children under 2 and under 4',
        identifier:
          'https://www.fda.gov/drugs/safe-use-over-counter-otc-medicines-children/use-caution-when-giving-cough-and-cold-products-kids',
        kind: 'regulatory',
      },
      {
        label:
          'De Sutter AI, Saraswat A, van Driel ML. Antihistamines for the common cold. Cochrane Database Syst Rev 2015;(11):CD009345',
        identifier: '10.1002/14651858.CD009345.pub2',
        kind: 'doi',
      },
      {
        label:
          'Gray SL, Anderson ML, Dublin S, et al. Cumulative use of strong anticholinergics and incident dementia: a prospective cohort study. JAMA Intern Med 2015;175:401-407',
        identifier: '10.1001/jamainternmed.2014.7663',
        kind: 'doi',
      },
      {
        label:
          'By the 2023 American Geriatrics Society Beers Criteria Update Expert Panel. American Geriatrics Society 2023 updated AGS Beers Criteria for potentially inappropriate medication use in older adults. J Am Geriatr Soc 2023;71:2052-2081',
        identifier: '10.1111/jgs.18372',
        kind: 'doi',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — chlorpheniramine, 29 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 2725 — chlorpheniramine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2725',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 7. Hydroxyzine — the parent of cetirizine, contraindicated in prolonged QT, and carrying a
  //    United States maximum daily dose four times the European one for the same cardiac reason.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'hydroxyzine',
    name: 'Hydroxyzine',
    tradeName: 'Atarax / Vistaril',
    sponsor:
      'Introduced by Pfizer’s Roerig division in 1956. Most current United States supply of the hydrochloride is generic under abbreviated applications, and the labelling that results is largely unaltered 1950s text with modern safety sections appended to it.',
    targetGene: 'HRH1',
    targetProtein:
      'Histamine H1 receptor. The label does not name it: its account of the anxiolytic effect is that hydroxyzine is not a cortical depressant but that its action may be due to suppression of activity in certain key regions of the subcortical area of the central nervous system.',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1956,
    indication:
      'Symptomatic relief of anxiety and tension associated with psychoneurosis and as an adjunct in organic disease states in which anxiety is manifested; management of pruritus due to allergic conditions such as chronic urticaria and atopic and contact dermatoses and in histamine-mediated pruritus; and as a sedative used as premedication and following general anaesthesia',
    patientFriendlyIndication:
      'Itching from allergy or hives, anxiety, and sedation before an anaesthetic',
    anatomicalSite:
      'H1 receptors in the skin and in the brain. It is the parent compound of cetirizine, which is what the body makes of it and which stays largely out of the brain.',
    conditionContext: {
      conditionExplainer:
        'Histamine causes itch by firing sensory nerves in the skin, and causes wakefulness by acting at the same receptor in the brain. Hydroxyzine blocks both, which is why one drug treats hives, sedates before surgery and calms anxiety.',
      whyItMatters:
        'That breadth is why it is still prescribed seventy years on, most often as the non-addictive alternative when a benzodiazepine is not wanted. It is also why the drug has more ways to cause trouble than a modern antihistamine: it prolongs the QT interval, it is a strong anticholinergic, and the United States label concedes that its effectiveness beyond four months has never been assessed.',
      whoTakesThis:
        'People with chronic itch and hives, people with anxiety who are being kept away from benzodiazepines, and patients being premedicated for anaesthesia.',
      clinicalGoals:
        'Relief of itch, or short-term relief of anxiety. Nothing in the label supports a long-term anxiolytic goal, and it says so in as many words.',
    },
    oneSentenceVerdict:
      'A first-generation antihistamine that beat placebo for generalised anxiety at an odds ratio of 0.30 across five trials and 884 patients — on evidence the reviewers judged at high risk of bias and insufficient to make it a reliable first-line treatment — which is contraindicated in prolonged QT interval, carries a United States maximum daily dose four times the European cap imposed in 2015 for that same cardiac risk, and whose own label admits its effectiveness beyond four months has never been studied.',
    laymanHowItWorks:
      'Hydroxyzine blocks the receptor histamine uses. In the skin that stops the itch and the hive. In the brain, where histamine is one of the signals keeping you alert, blocking it makes you drowsy and takes the edge off anxiety — which is why one old antihistamine is prescribed for three unrelated-sounding things. The body slowly converts it into cetirizine, a molecule that cannot get into the brain, so the calming effect fades as the conversion proceeds while the anti-itch effect carries on.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 56,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0627 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 40 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'On the United States market since 1956 and generic for decades, at about six United States cents a tablet. Its commercial afterlife is more interesting than its price: the carboxylic acid metabolite of hydroxyzine was itself developed into a separate product, cetirizine, approved as a new molecular entity in 1995 and now one of the most-sold antihistamines in the world. The patent estate of the second drug was built on the breakdown product of the first.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'For itch and hives, the substitute is its own metabolite: a head-to-head trial found cetirizine 10 mg once daily equivalent to hydroxyzine 25 mg three times daily, with four sedation withdrawals on hydroxyzine against one on cetirizine. For anxiety, the comparison is with the treatments that have durable evidence — cognitive behavioural therapy and the antidepressants — because hydroxyzine’s own label states that its effectiveness beyond four months has never been assessed. The reason it keeps being chosen is that it is not a controlled substance, and that is a property of drug law rather than of pharmacology.',
      conventionalRx: [
        {
          name: 'Cetirizine (Zyrtec)',
          class: 'Second-generation oral H1 antihistamine — the active metabolite of hydroxyzine',
          howItCompares:
            'The same molecule after the body has oxidised its terminal alcohol to a carboxylic acid, which is the change that keeps it out of the brain. In a 4-week randomised double-blind double-dummy trial in 188 patients with chronic idiopathic urticaria, cetirizine 10 mg once daily was equivalent to hydroxyzine 25 mg three times daily on patient and investigator ratings; four patients on hydroxyzine withdrew for sedation against one on cetirizine and one on placebo. Cetirizine carries no QT contraindication.',
          typicalCost:
            'US$0.0629 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 112 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: same efficacy for hives, once daily, far less sedation, no cardiac contraindication. Cons: precisely because it stays out of the brain, it is not an anxiolytic and not a sedative.',
        },
        {
          name: 'Loratadine (Claritin)',
          class: 'Second-generation oral H1 antihistamine',
          howItCompares:
            'The least sedating of the common oral options along with fexofenadine, and the cheapest. Its relevance here is as the comparator that shows how much of hydroxyzine’s effect profile is central: on the receptor-occupancy scale, first-generation agents occupy roughly half the cortical H1 receptors and loratadine occupies about a tenth.',
          typicalCost:
            'US$0.0532 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 109 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: cheapest, once daily, negligible anticholinergic burden. Cons: less potent at the peripheral receptor and slower to act; no role at all in anxiety or premedication.',
        },
        {
          name: 'Doxylamine',
          class: 'First-generation ethanolamine antihistamine, sold over the counter as a hypnotic',
          howItCompares:
            'Named here because it is the drug people reach for when hydroxyzine is being used purely for its sedative effect. It shares the anticholinergic burden and the Beers Criteria caution, and it is available without a prescription — which makes it a substitute in practice whether or not it is one in principle.',
          typicalCost:
            'US$0.1199 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 31 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: no prescription; no QT contraindication in its labelling. Cons: same anticholinergic class problems; tolerance to the sedative effect develops quickly.',
        },
      ],
      naturalFoods: [
        {
          name: 'Cool compresses and emollients for itch',
          activeCompound: 'None — physical cooling and barrier restoration',
          biologicalMechanism:
            'Cooling raises the firing threshold of the C-fibres that carry itch, and an intact stratum corneum reduces the transepidermal water loss and irritant penetration that drive itch in atopic and contact dermatoses. Neither acts on the histamine receptor, so both are additive to an antihistamine rather than alternatives to it.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'Not stated here as advice. These are adjuncts with a benign safety profile and modest measured effects, and they are named because the antihistamine indication in this label is specifically itch — the symptom for which non-drug measures do most.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Say what else you take that affects heart rhythm',
          action:
            'List every medicine before starting it, particularly heart drugs, antipsychotics, antidepressants and antibiotics.',
          patientImpact:
            'The label contraindicates hydroxyzine in patients with a prolonged QT interval and names specific interacting classes: Class 1A and Class III antiarrhythmics, several antipsychotics, citalopram and fluoxetine, the macrolide and fluoroquinolone antibiotics, methadone, ondansetron and droperidol among others.',
          clinicalPrecaution:
            'It also directs caution in congenital long QT syndrome, a family history of it, recent myocardial infarction, uncompensated heart failure, bradyarrhythmias and electrolyte imbalance. The European regulator went further in 2015 and made several of these outright contraindications.',
        },
        {
          name: 'Stop it at the first rash and do not switch to cetirizine',
          action: 'Report any new skin eruption, particularly one with fever and pustules.',
          patientImpact:
            'The label records acute generalised exanthematous pustulosis — fever with numerous small superficial non-follicular sterile pustules on large areas of swollen redness — and directs discontinuation at the first appearance of a rash, worsening of a pre-existing skin reaction the drug was being used to treat, or any other sign of hypersensitivity.',
          clinicalPrecaution:
            'It specifically directs avoiding cetirizine or levocetirizine in anyone who has had acute generalised exanthematous pustulosis or other hypersensitivity with hydroxyzine, because of cross-sensitivity. The parent and its metabolite are treated as one allergen.',
        },
        {
          name: 'Ask what the plan is after four months',
          action: 'Agree in advance how long the anxiety course is meant to last.',
          patientImpact:
            'The indication section states that the effectiveness of hydroxyzine as an antianxiety agent for long-term use — that is, more than 4 months — has not been assessed by systematic clinical studies, and that the physician should periodically reassess its usefulness for the individual patient.',
          clinicalPrecaution:
            'It is not a controlled substance and does not produce the dependence benzodiazepines do, which is the main reason it is chosen. Not causing dependence is not the same as having been shown to keep working.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1CN(CCN1CCOCCO)C(C2=CC=CC=C2)C3=CC=C(C=C3)Cl',
      chemicalFormula: 'C21H27ClN2O2',
      molecularWeight:
        '374.90 g/mol (free base); dispensed as the dihydrochloride at 447.83 g/mol, and as the pamoate salt in the capsule form',
      targetReceptorAffinity:
        'A diphenylmethylpiperazine antihistamine with a terminal hydroxyethoxyethyl arm. Oxidation of that terminal alcohol to a carboxylic acid produces cetirizine, which is zwitterionic at physiological pH and largely excluded from the brain — the single structural change that separates a sedating anxiolytic from a non-sedating allergy tablet. Hydroxyzine is a racemate; the label’s chemical name begins with the (±) designation. It is a substantial muscarinic antagonist as well as an H1 antagonist, and its cardiac effect is recorded in the label as postmarketing QT prolongation and torsade de pointes without any stated mechanism.',
      structureSource: {
        label:
          'PubChem CID 3658 (hydroxyzine) — canonical SMILES, molecular formula and weight, as carried on the enriched record; dihydrochloride formula and molecular weight from the hydroxyzine hydrochloride United States prescribing information, Description',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3658',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'hyd-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Separate hydroxyzine from cetirizine and from the pamoate form',
          description:
            'Cetirizine is both the human metabolite and a plausible oxidative degradant, and it is a marketed drug in its own right. A release assay therefore has to resolve parent from metabolite, and has to distinguish the dihydrochloride from the pamoate salt used in the capsule, which is a different article with different dissolution.',
          reagentsAndBuffer:
            'Hydroxyzine hydrochloride USP reference standard, cetirizine dihydrochloride as the specified related substance, reversed-phase HPLC with ultraviolet detection at 230 nm, non-aqueous titration for salt stoichiometry, forced oxidative degradation study',
        },
        {
          id: 'hyd-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Alkylate 1-(4-chlorobenzhydryl)piperazine with the ethoxyethanol arm',
          description:
            'The core is the same 4-chlorobenzhydryl piperazine that cetirizine is built on. The only difference between the two drugs is what is attached to the far nitrogen — a hydroxyethoxyethyl group here, a carboxymethoxyethyl group there — and that difference is the entire pharmacological distinction.',
          dependsOnStepId: 'hyd-w1',
          reagentsAndBuffer:
            '1-(4-chlorobenzhydryl)piperazine, 2-(2-chloroethoxy)ethanol, potassium carbonate in toluene or xylene under reflux, hydrogen chloride in isopropanol for the dihydrochloride, or pamoic acid for the capsule salt',
        },
        {
          id: 'hyd-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallise the salt and control the oxidation product',
          description:
            'The specification that matters is the cetirizine limit, because that impurity is not inert — it is a pharmacologically active antihistamine with a different distribution profile. Purification conditions are chosen to avoid oxidising the primary alcohol during processing and storage.',
          dependsOnStepId: 'hyd-w2',
          reagentsAndBuffer:
            'Recrystallisation from ethanol or isopropanol under nitrogen, controlled-humidity drying given the very high aqueous solubility of the dihydrochloride, HPLC release testing against a specified cetirizine limit, accelerated stability at 40 degrees and 75% relative humidity',
        },
        {
          id: 'hyd-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Screen the delayed rectifier potassium current before anything else',
          description:
            'The clinically decisive property of this molecule is not its H1 affinity, which is well characterised, but its effect on cardiac repolarisation, which the label records as a postmarketing finding and a contraindication with no mechanism stated. Any modern characterisation of a diphenylmethylpiperazine begins with the potassium channel assay, and the historical reason is that another antihistamine in an adjacent class was withdrawn from the market for exactly this.',
          dependsOnStepId: 'hyd-w3',
          reagentsAndBuffer:
            'HEK293 or CHO cells stably expressing hERG, whole-cell patch clamp at physiological temperature, cisapride or dofetilide as positive control, concentration-response over the free plasma concentration range, cetirizine run in parallel as the negative comparator',
        },
        {
          id: 'hyd-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Quantify wheal suppression and sedation as one paired experiment',
          description:
            'Hydroxyzine’s benefit is peripheral H1 blockade and its principal cost is central H1 blockade. Measuring them separately, in different studies with different subjects, is how a drug ends up with a reputation for being both effective and tolerable. Measured together in the same subjects at the same timepoints, they are two readouts of the same occupancy curve.',
          dependsOnStepId: 'hyd-w4',
          reagentsAndBuffer:
            'Intradermal histamine dihydrochloride challenge with planimetric wheal and flare measurement, paired critical flicker fusion and divided-attention psychomotor battery at matched timepoints, placebo and cetirizine comparator arms, plasma sampling for parent and metabolite',
        },
      ],
    },
    keyAudits: [
      {
        id: 'hyd-a1',
        category: 'conclusion_shift',
        title: 'Two regulators, one drug, a fourfold difference in maximum daily dose',
        laymanSummary:
          'Europe reviewed the heart-rhythm risk in 2015 and capped hydroxyzine at 100 mg a day for adults and 50 mg for older people. The United States label still prints an anxiety dose of 50 to 100 mg four times a day.',
        technicalDetails:
          'Following an Article 31 referral, the European Medicines Agency concluded in 2015 that hydroxyzine carries a small but definite risk of QT interval prolongation and torsade de pointes, and imposed a set of restrictions: use at the lowest effective dose for the shortest possible duration, a maximum of 100 mg daily in adults, 50 mg daily in the elderly if use cannot be avoided, and 2 mg/kg/day in children up to 40 kg. It contraindicated use in known acquired or congenital QT prolongation and in patients with a known risk factor including cardiovascular disease, significant electrolyte imbalance, family history of sudden cardiac death, significant bradycardia or concomitant QT-prolonging drugs, and stated that use is not recommended in elderly patients. The United States label contraindicates hydroxyzine in patients with a prolonged QT interval and carries a detailed QT precaution listing interacting drug classes — but its Dosage and Administration section still reads, for anxiety in adults, 50 to 100 mg four times daily. Nothing here is a dosing instruction to any reader; the point is that two regulators looking at the same molecule and the same safety data ended four years apart at maximum daily doses that differ by a factor of four, and the older document is the one that was never revised.',
        evidenceSource:
          'European Medicines Agency, new restrictions to minimise the risks of effects on heart rhythm with hydroxyzine-containing medicines (Article 31 referral, 2015); hydroxyzine hydrochloride United States prescribing information, Contraindications, Precautions and Dosage and Administration',
        measuredMetric:
          'Maximum daily dose and contraindication set in the European and United States labelling for the same molecule',
        auditFlag: 'contested',
      },
      {
        id: 'hyd-a2',
        category: 'measured',
        title: 'It beats placebo for anxiety on evidence its own reviewers would not rely on',
        laymanSummary:
          'Five randomised trials in 884 people found hydroxyzine better than a dummy tablet for generalised anxiety, and about as good as a benzodiazepine or buspirone. The reviewers still refused to call it a reliable first-line treatment, because the trials were poorly conducted and there were not many of them.',
        technicalDetails:
          'The Cochrane review of hydroxyzine for generalised anxiety disorder screened 39 studies and included 5, with 884 participants. Against placebo the odds ratio for response was 0.30 (95% CI 0.15 to 0.58) in the review’s direction of effect, with acceptability and tolerability not differing from placebo (OR 1.00, 95% CI 0.63 to 1.58; OR 1.49, 95% CI 0.92 to 2.40). Against other anxiolytics hydroxyzine was equivalent: against chlordiazepoxide OR 0.75 (95% CI 0.35 to 1.62), against buspirone OR 0.76 (95% CI 0.40 to 1.42). It caused more sleepiness and drowsiness than the active comparators, OR 1.74 (95% CI 0.86 to 3.53). The reviewers recorded a high risk of bias in the included studies, noted that the studies did not report all the prespecified outcomes, and concluded that despite being more effective than placebo it is not possible to recommend hydroxyzine as a reliable first-line treatment in generalised anxiety disorder. That is a positive result and a negative recommendation in the same paragraph, and both are correct.',
        evidenceSource:
          'Guaiana G, Barbui C, Cipriani A. Hydroxyzine for generalised anxiety disorder. Cochrane Database Syst Rev 2010;(12):CD006815',
        doi: '10.1002/14651858.CD006815.pub2',
        measuredMetric:
          'Treatment response in generalised anxiety disorder, hydroxyzine against placebo and against benzodiazepine and buspirone comparators',
        auditFlag: 'caution',
      },
      {
        id: 'hyd-a3',
        category: 'failed',
        title: 'Beyond four months, the label says nobody has looked',
        laymanSummary:
          'Hydroxyzine is frequently prescribed for anxiety month after month. Its own prescribing information states that its effectiveness for use beyond four months has never been assessed in systematic clinical studies.',
        technicalDetails:
          'The Indications and Usage section states, in full: "The effectiveness of hydroxyzine as an antianxiety agent for long term use, that is more than 4 months, has not been assessed by systematic clinical studies. The physician should reassess periodically the usefulness of the drug for the individual patient." The Cochrane evidence base is consistent with that: the included trials were short, and the review reported nothing about durability. This matters more than it would for most drugs because of why hydroxyzine is chosen. It is prescribed for anxiety largely because it is not a controlled substance and does not cause the dependence benzodiazepines do — a comparison about a harm. Nothing about the absence of that harm implies the benefit persists, and the label is unusually candid that the question was never asked.',
        evidenceSource:
          'Hydroxyzine hydrochloride United States prescribing information, Indications and Usage',
        measuredMetric:
          'Duration of use for which systematic effectiveness data exist, as stated in the label',
        auditFlag: 'caution',
      },
      {
        id: 'hyd-a4',
        category: 'inferred',
        title: 'A mechanism paragraph that names no receptor, and three claims from 1956',
        laymanSummary:
          'The label explains how the drug calms anxiety by saying it is not a cortical depressant and that its action may be due to suppressing activity in certain key regions of the subcortical brain. It also states that bronchodilator, analgesic and muscle-relaxant effects have been demonstrated and clinically confirmed.',
        technicalDetails:
          'The Clinical Pharmacology section reads: hydroxyzine is unrelated chemically to the phenothiazines, reserpine, meprobamate or the benzodiazepines; it is not a cortical depressant, but its action may be due to a suppression of activity in certain key regions of the subcortical area of the central nervous system; primary skeletal muscle relaxation has been demonstrated experimentally; bronchodilator activity, and antihistaminic and analgesic effects have been demonstrated experimentally and confirmed clinically; an antiemetic effect has been demonstrated by the apomorphine test and the veriloid test. The histamine H1 receptor is not named anywhere in that paragraph, and the modern understanding — that the anxiolytic and sedative effects are central H1 antagonism, with a contribution from 5-HT2A antagonism — is absent. The bronchodilator and analgesic claims would not survive a contemporary efficacy review and are not indications, yet they sit in the document a prescriber reads. This is what an unrevised 1956 pharmacology section looks like when there is no innovator sponsor and no regulatory trigger to rewrite it.',
        evidenceSource:
          'Hydroxyzine hydrochloride United States prescribing information, Clinical Pharmacology',
        inferredClaim:
          'That hydroxyzine has clinically confirmed bronchodilator and analgesic activity, and that its anxiolytic effect is explained by subcortical suppression — claims printed in the label with no receptor, no trial and no modern support',
        auditFlag: 'contested',
      },
      {
        id: 'hyd-a5',
        category: 'measured',
        title: 'Its own metabolite matched it for hives, once a day, with less sedation',
        laymanSummary:
          'Cetirizine is what the body turns hydroxyzine into. Given once daily it controlled chronic hives as well as hydroxyzine given three times a day, and four times fewer people dropped out because of drowsiness.',
        technicalDetails:
          'A 4-week multicentre randomised double-blind double-dummy placebo-controlled trial in 188 patients aged 12 and over with chronic idiopathic urticaria compared cetirizine 10 mg once daily, hydroxyzine 25 mg three times daily and placebo. Cetirizine separated from placebo on episode count and pruritus after one day (p=0.002); hydroxyzine did not reach significance until day 2 (p=0.001). Both actives reduced lesion number and size and pruritus severity against placebo through weeks 1, 2 and 3 and at endpoint (p<0.04), and both were rated improved against placebo at week 4 (p<0.001). Four patients on hydroxyzine discontinued for sedation, against one on cetirizine and one on placebo; nobody withdrew for lack of efficacy. The authors concluded cetirizine 10 mg once daily was equivalent to hydroxyzine 25 mg three times daily. For the itch indication this is close to a complete answer: the metabolite does the job on a third of the dosing occasions with less of the cost, and the only thing the parent adds is the central effect.',
        evidenceSource:
          'Breneman DL. Cetirizine versus hydroxyzine and placebo in chronic idiopathic urticaria. Ann Pharmacother 1996;30:1075-1079',
        doi: '10.1177/106002809603001001',
        measuredMetric:
          'Urticaria episode count, lesion number and size, pruritus severity and sedation withdrawals over 4 weeks',
        auditFlag: 'verified',
      },
      {
        id: 'hyd-a6',
        category: 'conclusion_shift',
        title: 'The parent and its metabolite are now treated as a single allergen',
        laymanSummary:
          'A severe pustular rash was recognised in postmarketing reports. The label now directs that anyone who has had it with hydroxyzine must also avoid cetirizine and levocetirizine, because they are the same molecule after metabolism.',
        technicalDetails:
          'The label records that hydroxyzine may rarely cause acute generalised exanthematous pustulosis, described as a serious skin reaction with fever and numerous small superficial non-follicular sterile pustules arising within large areas of oedematous erythema, and directs discontinuation at the first appearance of a rash, at any worsening of a pre-existing skin reaction the drug is being used to treat, or at any other sign of hypersensitivity. If AGEP is suspected the label states hydroxyzine should not be resumed. It then goes further and instructs avoiding cetirizine or levocetirizine in anyone who has had AGEP or another hypersensitivity reaction with hydroxyzine, because of cross-sensitivity — and the Contraindications section runs the rule the other way, contraindicating hydroxyzine in patients with known hypersensitivity to cetirizine or levocetirizine. Three separately marketed products, two of them approved decades apart as distinct entities, are handled by the labelling as one immunological object. The warning that a drug being used to treat a rash may be causing it is the part clinicians most often miss.',
        evidenceSource:
          'Hydroxyzine hydrochloride United States prescribing information, Contraindications, Precautions — Acute Generalized Exanthematous Pustulosis, and Adverse Reactions',
        measuredMetric:
          'Cross-sensitivity instruction linking hydroxyzine, cetirizine and levocetirizine in the current labelling',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Absorbed fast, felt within half an hour',
        laymanDesc:
          'A tablet or capsule that works quickly — the label puts clinical effects at 15 to 30 minutes after swallowing.',
        molecularDetail:
          'Rapidly absorbed from the gastrointestinal tract, with clinical effects usually noted within 15 to 30 minutes of oral administration. Supplied as the dihydrochloride in tablets and syrup and as the pamoate in capsules. The label states hydroxyzine is chemically unrelated to the phenothiazines, reserpine, meprobamate or the benzodiazepines.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It crosses into the brain, unlike its own metabolite',
        laymanDesc:
          'The terminal alcohol on the molecule keeps it fat-soluble enough to enter the brain. Oxidise it to an acid and you get cetirizine, which cannot.',
        molecularDetail:
          'A diphenylmethylpiperazine with a hydroxyethoxyethyl arm. Oxidation of that primary alcohol to a carboxylic acid gives cetirizine, zwitterionic at physiological pH and largely excluded from the central nervous system. One functional group is the difference between a sedative and a non-sedating allergy tablet.',
        iconName: 'Layers',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It blocks the histamine receptor in skin and brain alike',
        laymanDesc:
          'In the skin that is the anti-itch effect. In the brain it is the drowsiness, and it is most of what the anxiolytic effect consists of.',
        molecularDetail:
          'Competitive H1 antagonism. The label does not name the receptor in its account of the anxiolytic action, saying instead that hydroxyzine is not a cortical depressant but that its action may be due to a suppression of activity in certain key regions of the subcortical area of the central nervous system.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'And it blocks the acetylcholine receptor as well',
        laymanDesc:
          'That is the dry mouth, and it is why this class is on the list of medicines to avoid in older people.',
        molecularDetail:
          'Muscarinic antagonism sufficient for classification as a strong anticholinergic in the scales used by the Beers Criteria and the cumulative-exposure cohort literature. The label lists dry mouth as the anticholinergic adverse reaction and notes potentiation of central nervous system depressants including narcotics, non-narcotic analgesics and barbiturates.',
        iconName: 'Droplet',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Itch settles, and anxiety eases for a while',
        laymanDesc:
          'For hives it works about as well as its metabolite. For anxiety it beats a dummy tablet and roughly matches a benzodiazepine, on a small and shaky evidence base.',
        molecularDetail:
          'Chronic idiopathic urticaria: hydroxyzine 25 mg three times daily equivalent to cetirizine 10 mg once daily over 4 weeks in 188 patients. Generalised anxiety: OR 0.30 (95% CI 0.15 to 0.58) against placebo across 5 trials and 884 participants, equivalent to chlordiazepoxide and buspirone, at high risk of bias.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'The cost is repolarisation, sedation and time',
        laymanDesc:
          'It lengthens the electrical recovery of the heart, it makes people drowsy more than the alternatives do, and past four months nobody has tested whether it still works.',
        molecularDetail:
          'Contraindicated in prolonged QT interval; postmarketing QT prolongation and torsade de pointes, mostly in patients with other risk factors. Sleepiness and drowsiness at OR 1.74 (95% CI 0.86 to 3.53) against active comparators. Effectiveness as an antianxiety agent beyond 4 months not assessed by systematic clinical studies, per the label.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Cochrane hydroxyzine for generalised anxiety disorder (CD006815.pub2)',
        phase: 'Systematic review and meta-analysis of 5 randomised trials',
        sampleSize: 884,
        primaryEndpoint:
          'Treatment response in generalised anxiety disorder, hydroxyzine against placebo and against other anxiolytics',
        endpointMet: true,
        statisticalPValue:
          'Against placebo OR 0.30 (95% CI 0.15 to 0.58); against chlordiazepoxide OR 0.75 (0.35 to 1.62); against buspirone OR 0.76 (0.40 to 1.42); sleepiness against active comparators OR 1.74 (0.86 to 3.53)',
        unreportedAdverseSignals:
          'High risk of bias in all included studies, only 5 of 39 screened studies included, and the included studies did not report all the outcomes prespecified in the review protocol. The reviewers concluded it is not possible to recommend hydroxyzine as a reliable first-line treatment.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId:
          'Breneman cetirizine versus hydroxyzine in chronic urticaria (Ann Pharmacother 1996;30:1075-1079)',
        phase: 'Phase 4, randomised, double-blind, double-dummy, placebo-controlled, multicentre',
        sampleSize: 188,
        primaryEndpoint:
          'Patient and investigator four-point ratings of urticaria episodes, lesion number and size and pruritus severity over 4 weeks',
        endpointMet: true,
        statisticalPValue:
          'Both actives better than placebo through weeks 1 to 3 and at endpoint (p<0.04) and at week 4 (p<0.001); cetirizine separated from placebo on day 1 (p=0.002) and hydroxyzine on day 2 (p=0.001); the two were judged equivalent',
        unreportedAdverseSignals:
          'Four patients withdrew from the hydroxyzine arm for sedation against one on cetirizine and one on placebo. Nobody withdrew for lack of efficacy in any arm.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'Adult Changes in Thought anticholinergic cohort (JAMA Intern Med 2015;175:401-407)',
        phase: 'Prospective population-based cohort, class-level exposure, mean 7.3 years',
        sampleSize: 3434,
        primaryEndpoint:
          'Incident dementia by cumulative 10-year strong anticholinergic exposure in adults 65 and over',
        endpointMet: true,
        statisticalPValue:
          'Adjusted HR 1.54 (95% CI 1.21 to 1.96) above 1,095 total standardised daily doses, with a dose-response trend at p<0.001',
        unreportedAdverseSignals:
          'This is class-level evidence for first-generation antihistamines, not a hydroxyzine-specific result, and the cohort is observational. It is included because hydroxyzine is classified as a strong anticholinergic in the scales that study and the Beers Criteria use.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Response in generalised anxiety disorder against placebo at OR 0.30 (95% CI 0.15 to 0.58) across 5 trials and 884 participants',
        'Equivalence to chlordiazepoxide and to buspirone on efficacy, with more sleepiness than either',
        'Equivalence to cetirizine 10 mg once daily in chronic idiopathic urticaria at hydroxyzine 25 mg three times daily, in 188 patients',
        'Four sedation withdrawals on hydroxyzine against one each on cetirizine and placebo in that trial',
        'Postmarketing QT prolongation and torsade de pointes, mostly in patients with other QT risk factors, leading to a contraindication in prolonged QT',
      ],
      unsupportedInferences: [
        'That it keeps working for anxiety beyond four months, which its own label states has never been assessed',
        'That not being a controlled substance implies it is a safe long-term choice, when the specific harms it does carry are cardiac and anticholinergic rather than dependence',
        'That the label’s clinically confirmed bronchodilator and analgesic effects are real therapeutic properties, when neither is an indication and neither has modern support',
        'That the anxiolytic action is subcortical suppression, a 1956 formulation that names no receptor and has not been updated',
      ],
      whatFailedInitially: [
        'The Cochrane reviewers declined to recommend it as a reliable first-line anxiolytic despite a positive result against placebo, on grounds of bias and evidence volume',
        'The European regulator restricted maximum daily dose fourfold below the United States figure and made several risk factors outright contraindications',
        'Acute generalised exanthematous pustulosis was recognised only in postmarketing reports, and required a cross-sensitivity instruction covering two other marketed drugs',
        'Contraindicated in early pregnancy on animal teratogenicity with human data the label calls inadequate',
      ],
      realWorldOutcome: [
        'On the United States market since 1956, generic, about six United States cents a tablet',
        'Its own metabolite was developed into cetirizine, approved as a new molecular entity in 1995 and now one of the most-sold antihistamines in the world',
        'Widely used as the non-controlled alternative to benzodiazepines for anxiety and insomnia — a choice driven by drug scheduling rather than by comparative evidence',
        'Listed among the first-generation antihistamines the American Geriatrics Society Beers Criteria say are typically best avoided in adults 65 and over',
      ],
    },
    deliverySystem: {
      type: 'Oral tablets at 10, 25 and 50 mg of the hydrochloride, an oral syrup, pamoate capsules, and an intramuscular injection for premedication',
      description:
        'Rapidly absorbed with clinical effects usually noted within 15 to 30 minutes after an oral dose. The label states that when treatment is initiated intramuscularly, subsequent doses may be given orally. It potentiates central nervous system depressants including narcotics, non-narcotic analgesics and barbiturates, and the label directs in capitals that their doses be reduced when given together.',
      safetyProfile:
        'Contraindicated in prolonged QT interval, in known hypersensitivity to hydroxyzine, cetirizine or levocetirizine, and in early pregnancy — the last on fetal abnormalities in rat and mouse at doses substantially above the human range, with human data the label describes as inadequate. QT prolongation and torsade de pointes reported postmarketing, mostly in patients with pre-existing heart disease, electrolyte imbalance or other arrhythmogenic drugs, with an extensive list of interacting classes. Acute generalised exanthematous pustulosis and fixed drug eruptions, with an instruction to avoid cetirizine and levocetirizine afterwards. Drowsiness, with warnings against driving and against alcohol. Dry mouth as the anticholinergic effect. Involuntary motor activity including rare tremor and convulsions, usually at doses considerably above those recommended. Hallucination and headache reported postmarketing. Not to be given to nursing mothers.',
    },
    commonQuestions: [
      {
        q: 'Is hydroxyzine a safe alternative to a benzodiazepine?',
        a: 'It is a different set of risks rather than an absence of risk. What it avoids is real: it is not a controlled substance, it does not produce the tolerance and dependence benzodiazepines do, and that is the main reason clinicians reach for it. What it carries instead is cardiac and anticholinergic. The label contraindicates it in anyone with a prolonged QT interval and lists a long set of drugs that must not be combined with it for the same reason, and it is classified as a strong anticholinergic, which is why first-generation antihistamines sit on the Beers list of medicines best avoided over 65. The efficacy evidence is genuine but thin: five trials, 884 people, better than placebo at an odds ratio of 0.30, about equal to a benzodiazepine, and judged by the reviewers to be at high risk of bias and not sufficient to make it a reliable first-line treatment.',
        auditNote:
          'The comparison people actually make — safer than a benzodiazepine — is a comparison about one specific harm. It says nothing about the harms hydroxyzine has and the benzodiazepine does not.',
      },
      {
        q: 'Can I take it for months?',
        a: 'The label answers this directly: the effectiveness of hydroxyzine as an antianxiety agent for long-term use, meaning more than four months, has not been assessed by systematic clinical studies, and the prescriber should periodically reassess whether it is still useful for the individual patient. That does not mean it stops working; it means long-term benefit has not been studied systematically. This gap matters because hydroxyzine is often chosen over benzodiazepines because of concerns about long-term harm.',
      },
      {
        q: 'Why does the European dose limit differ so much from the American one?',
        a: 'Because Europe reviewed the cardiac risk and America has not revised the document. After a formal referral in 2015, the European Medicines Agency concluded that hydroxyzine carries a small but definite risk of QT prolongation and torsade de pointes, and set a maximum of 100 mg a day in adults, 50 mg in the elderly if it cannot be avoided, and 2 mg/kg/day in children under 40 kg, alongside a set of new contraindications. The United States label does contraindicate the drug in prolonged QT and carries a detailed precaution about interacting drugs, but its dosage section is the original text and prints an anxiety figure four times the European daily cap. Neither figure is advice to any reader here; the point is that the same molecule and the same evidence produced two very different documents, and only one of them was rewritten.',
      },
      {
        q: 'Is cetirizine really the same drug?',
        a: 'Almost. Cetirizine is what your liver makes of hydroxyzine: the same molecule with its terminal alcohol oxidised to a carboxylic acid. That one change makes it zwitterionic at body pH, which stops it entering the brain, which is why it does not sedate and is not an anxiolytic. For the itch indication they are interchangeable in practice — a randomised double-dummy trial in 188 people with chronic hives found cetirizine 10 mg once daily equivalent to hydroxyzine 25 mg three times daily, with four sedation withdrawals on hydroxyzine against one on cetirizine. The labelling treats them as one allergen too: hydroxyzine is contraindicated in anyone hypersensitive to cetirizine or levocetirizine, and anyone who reacts badly to hydroxyzine is told to avoid both.',
      },
      {
        q: 'The rash I am taking it for has got worse. Should I keep going?',
        a: 'That specific situation is called out in the label and it is worth taking seriously. Hydroxyzine can rarely cause acute generalised exanthematous pustulosis — fever with large numbers of small sterile pustules on swollen red skin — and the label directs stopping the drug at the first appearance of a rash, at any worsening of a pre-existing skin reaction that hydroxyzine is being used to treat, or at any other sign of hypersensitivity. If that reaction is suspected, the label says hydroxyzine should not be restarted, and that cetirizine and levocetirizine should be avoided afterwards as well. A drug given for itch that is making the skin worse is the one situation where continuing to take it is the reflex and the wrong move.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Hydroxyzine hydrochloride United States prescribing information — Description, Clinical Pharmacology, Indications and Usage, Contraindications, Warnings, Precautions including QT Prolongation/Torsade de Pointes and Acute Generalized Exanthematous Pustulosis, Adverse Reactions, Dosage and Administration',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22HYDROXYZINE+HYDROCHLORIDE%22',
        kind: 'regulatory',
      },
      {
        label:
          'European Medicines Agency. New restrictions to minimise the risks of effects on heart rhythm with hydroxyzine-containing medicines — Article 31 referral outcome, 2015',
        identifier:
          'https://www.ema.europa.eu/en/news/new-restrictions-minimise-risks-effects-heart-rhythm-hydroxyzine-containing-medicines',
        kind: 'regulatory',
      },
      {
        label:
          'Guaiana G, Barbui C, Cipriani A. Hydroxyzine for generalised anxiety disorder. Cochrane Database Syst Rev 2010;(12):CD006815',
        identifier: '10.1002/14651858.CD006815.pub2',
        kind: 'doi',
      },
      {
        label:
          'Breneman DL. Cetirizine versus hydroxyzine and placebo in chronic idiopathic urticaria. Ann Pharmacother 1996;30:1075-1079',
        identifier: '10.1177/106002809603001001',
        kind: 'doi',
      },
      {
        label:
          'Gray SL, Anderson ML, Dublin S, et al. Cumulative use of strong anticholinergics and incident dementia: a prospective cohort study. JAMA Intern Med 2015;175:401-407',
        identifier: '10.1001/jamainternmed.2014.7663',
        kind: 'doi',
      },
      {
        label:
          'By the 2023 American Geriatrics Society Beers Criteria Update Expert Panel. American Geriatrics Society 2023 updated AGS Beers Criteria for potentially inappropriate medication use in older adults. J Am Geriatr Soc 2023;71:2052-2081',
        identifier: '10.1111/jgs.18372',
        kind: 'doi',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — hydroxyzine, 40 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 3658 — hydroxyzine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3658',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 8. Zileuton — the other end of the leukotriene pathway, with monthly liver tests, four tablets
  //    a day and about 120 times montelukast’s daily cost. The market answered.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'zileuton',
    name: 'Zileuton',
    tradeName: 'Zyflo / Zyflo CR',
    sponsor:
      'Developed at Abbott Laboratories. The immediate-release ZYFLO was approved on 9 December 1996 under NDA 020471 and is now discontinued; the registration sits with Chiesi and the drug survives in the United States only as generic extended-release tablets from a handful of manufacturers.',
    targetGene: 'ALOX5',
    targetProtein:
      'Arachidonate 5-lipoxygenase, the enzyme that converts arachidonic acid into the leukotrienes. Blocking it removes LTB4 as well as the cysteinyl leukotrienes — one step further upstream than montelukast, which blocks only one receptor for one branch of the output.',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1996,
    indication:
      'Prophylaxis and chronic treatment of asthma in adults and children 12 years of age and older. Not indicated for reversal of bronchospasm in an acute attack, though therapy may be continued through an exacerbation.',
    patientFriendlyIndication:
      'Long-term asthma control, for the small number of people who cannot use the alternatives',
    anatomicalSite:
      '5-lipoxygenase in neutrophils, eosinophils, monocytes and mast cells — the enzyme is intracellular, so this drug acts inside the inflammatory cell rather than on the airway',
    conditionContext: {
      conditionExplainer:
        'Leukotrienes are made from arachidonic acid by a single enzyme, 5-lipoxygenase, and then split into two families: LTB4, which recruits neutrophils and eosinophils, and the cysteinyl leukotrienes, which constrict airways and make them swell. Montelukast blocks one receptor for the second family. Zileuton switches off the enzyme and removes both.',
      whyItMatters:
        'On paper that is the better drug. In practice it needs four tablets a day taken after meals, monthly liver blood tests for three months and regular ones thereafter, and it raises theophylline and warfarin levels enough to require dose changes. The pathway argument is sound and the delivery of it is what decided the outcome.',
      whoTakesThis:
        'Very few people. It is a third-line agent, used mainly where the leukotriene pathway is dominant — aspirin-exacerbated respiratory disease — and where montelukast has not worked or is not wanted.',
      clinicalGoals:
        'Fewer exacerbations and better lung function, with the liver watched. The label states that it is not for an acute attack.',
    },
    oneSentenceVerdict:
      'A 5-lipoxygenase inhibitor that cut steroid-requiring exacerbations from 15.6% to 6.1% over three months in its original 401-patient trial, and whose extended-release registration trial gained 0.39 L of FEV1 against placebo’s 0.27 L (p=0.021) — bought with ALT elevations above three times normal in 3.2% of more than 5,000 treated patients, monthly liver testing, four tablets a day, and a daily acquisition cost about 120 times montelukast’s.',
    laymanHowItWorks:
      'Inflammatory cells build leukotrienes from a fatty acid using a single enzyme. Zileuton gets inside those cells and jams that enzyme, so none of the leukotrienes get made at all — not the ones that tighten the airway and not the ones that call in more inflammatory cells. That is a bigger intervention than blocking one receptor, and it comes with the cost of blocking an enzyme rather than intercepting a messenger: the liver, which processes the drug, sometimes objects, and it has to be checked.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 61,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$2.07 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 4 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved 9 December 1996 under NDA 020471 and generic for years, and still US$2.07 a tablet with only four listed products in the acquisition-cost survey — the smallest product count of any medicine in this file. The labelled regimen is four 600 mg tablets a day, so about US$8.28 daily, against montelukast at US$0.0689 for a once-daily tablet: roughly thirty times the price per tablet and a hundred and twenty times per day. Generic status only lowers price where there are enough manufacturers to compete, and there is no volume here to attract them.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Everything zileuton does, something else does more conveniently. An inhaled corticosteroid outperforms the whole anti-leukotriene class on exacerbations. Montelukast blocks the receptor at the end of the same pathway once a day, with no liver monitoring, for about a hundredth of the daily cost — and carries a boxed warning zileuton does not, for events zileuton’s own label also reports. Zafirlukast sits between them. The case for zileuton is specific and narrow: it is the only marketed drug that removes LTB4 as well as the cysteinyl leukotrienes.',
      conventionalRx: [
        {
          name: 'Montelukast (Singulair)',
          class: 'Cysteinyl leukotriene type-1 receptor antagonist',
          howItCompares:
            'One tablet a day, no liver monitoring, no clinically significant interaction with theophylline or warfarin, and about one hundred and twentieth of the daily acquisition cost. It blocks one receptor for one branch of the pathway rather than the enzyme, so LTB4 signalling continues. It also carries a boxed warning for serious neuropsychiatric events added in March 2020 — for the same category of events zileuton’s label reports in its warnings section without a box.',
          typicalCost:
            'US$0.0689 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 74 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: convenience, price, no monitoring. Cons: a boxed warning; inferior to an inhaled steroid as monotherapy; leaves LTB4 untouched.',
        },
        {
          name: 'Zafirlukast (Accolate)',
          class: 'Cysteinyl leukotriene type-1 receptor antagonist',
          howItCompares:
            'The other receptor antagonist, twice daily and taken away from food. Priced between the two at United States acquisition cost. Like zileuton it interacts with warfarin, and like both leukotriene-pathway drugs it has been associated with hepatic injury and with reports of eosinophilic conditions.',
          typicalCost:
            'US$0.6436 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 10 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: twice rather than four times daily; no scheduled liver monitoring in the way zileuton requires. Cons: food substantially reduces absorption; little used, so little modern evidence.',
        },
        {
          name: 'An inhaled corticosteroid',
          class: 'Inhaled glucocorticoid',
          howItCompares:
            'The comparison that settles the class. Across 56 randomised trials in 13,338 patients, anti-leukotriene monotherapy carried 1.51 times the risk of an exacerbation requiring systemic corticosteroids and 3.33 times the risk of one requiring hospital admission, with FEV1 110 mL lower. That evidence is for the receptor antagonists rather than for zileuton specifically, and no trial has shown zileuton escaping it.',
          typicalCost:
            'US$0.7198 per millilitre of budesonide inhalation suspension at United States pharmacy acquisition cost (CMS NADAC, median across 51 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: the reference standard for asthma control, with the outcome data. Cons: inhaler technique; local side effects; does nothing for the aspirin-sensitive phenotype that the leukotriene drugs specifically address.',
        },
      ],
      naturalFoods: [
        {
          name: 'Marine omega-3 fatty acids — oily fish, fish oil',
          activeCompound: 'Eicosapentaenoic acid and docosahexaenoic acid',
          biologicalMechanism:
            'Eicosapentaenoic acid competes with arachidonic acid as a 5-lipoxygenase substrate, so the enzyme produces five-series leukotrienes such as LTB5 in place of the four-series LTB4. That is substrate competition at the same enzyme zileuton inhibits, and it is a genuine biochemical effect.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'Not stated here as advice, and this is a mechanism rather than a treatment. The randomised evidence for fish oil in asthma is inconsistent and none of it demonstrates an exacerbation benefit. Nothing in this row is a reason to substitute a supplement for a controller medicine.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Do not skip the liver blood tests',
          action:
            'Have the tests the prescriber schedules, and say if you feel unwell in a way that could be liver-related.',
          patientImpact:
            'The label directs assessing serum ALT before starting, once a month for the first three months, every two to three months for the rest of the first year, and periodically thereafter. In more than 5,000 patients treated in controlled and open-label studies, 3.2% had ALT elevations of three times the upper limit of normal or more.',
          clinicalPrecaution:
            'The label lists the symptoms to act on — right upper quadrant pain, nausea, fatigue, lethargy, itching, jaundice or flu-like symptoms — and directs discontinuation if they appear or if transaminases reach five times normal. It also cautions in people who drink substantial amounts of alcohol or have a history of liver disease.',
        },
        {
          name: 'Bring your full medicine list, especially theophylline and warfarin',
          action: 'Tell the prescriber about every other medicine before the first dose.',
          patientImpact:
            'The label reports that zileuton roughly halved theophylline clearance and approximately doubled its area under the curve, raising peak concentration by 73%, with theophylline-related adverse reactions occurring more often during co-administration. It also reports a 22% rise in R-warfarin exposure accompanied by a clinically significant increase in prothrombin times, and increased propranolol levels with increased beta-blocker activity.',
          clinicalPrecaution:
            'These are not theoretical interactions. The label directs halving the theophylline dose and monitoring levels, and monitoring prothrombin time with warfarin dose titration.',
        },
        {
          name: 'Report sleep or behaviour changes',
          action: 'Say if mood, sleep or behaviour changes after starting it.',
          patientImpact:
            'Section 5.2 records postmarketing reports of sleep disorders and behaviour changes in adults and adolescents, and states that the clinical details of some of those reports appear consistent with a drug-induced effect. It directs patients and prescribers to be alert and to weigh the risks and benefits of continuing if such events occur.',
          clinicalPrecaution:
            'Montelukast carries a boxed warning for the same category of events. Zileuton carries a warnings-section entry. The difference in warning class is not a difference in the evidence that the events occur.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(C1=CC2=CC=CC=C2S1)N(C(=O)N)O',
      chemicalFormula: 'C11H12N2O2S',
      molecularWeight: '236.29 g/mol',
      targetReceptorAffinity:
        'An N-hydroxyurea iron chelator: the hydroxamic-acid-like head group coordinates the non-haem iron in the active site of 5-lipoxygenase, which is why this class inhibits the enzyme rather than competing at a receptor. The label states that both the R(+) and S(-) enantiomers of the 50:50 racemate are pharmacologically active as 5-lipoxygenase inhibitors, which is unusual and removes any chiral-switch argument. In patients with asthma the IC50 for inhibition of whole-blood LTB4 formation is about 0.46 mcg/mL, with at least 80% inhibition at 2 mcg/mL; peak levels averaging 5.9 mcg/mL on 600 mg four times daily were associated with mean LTB4 inhibition of 98%. Melting point 144.2 to 145.2 degrees Celsius.',
      structureSource: {
        label:
          'PubChem CID 60490 (zileuton) — canonical SMILES, molecular formula and weight, as carried on the enriched record; enantiomer activity, IC50 and inhibition figures from the zileuton extended-release tablets United States prescribing information, sections 11, 12.1 and 12.2',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/60490',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'zil-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the N-hydroxyurea is intact',
          description:
            'The whole molecule is a benzothiophene with an N-hydroxyurea head, and that head is the pharmacophore: it chelates the active-site iron. It is also the most fragile part of the molecule, prone to oxidation and hydrolysis. An assay that measures total zileuton without resolving the degraded head group can pass an inactive batch.',
          reagentsAndBuffer:
            'Zileuton reference standard, reversed-phase HPLC with ultraviolet detection, ferric chloride colorimetric confirmation of the hydroxamate-type functionality, melting point determination against the specified 144.2 to 145.2 degree range, forced oxidative degradation',
        },
        {
          id: 'zil-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Build the benzothiophene and install the hydroxyurea',
          description:
            'A 1-(benzo[b]thien-2-yl)ethyl unit is elaborated to the corresponding hydroxylamine, then capped with a urea. The product is a racemate and stays one, because both enantiomers inhibit the enzyme — there is no resolution step and no single-isomer follow-on product to be had.',
          dependsOnStepId: 'zil-w1',
          reagentsAndBuffer:
            '2-acetylbenzothiophene, hydroxylamine and a reducing agent to reach the N-hydroxylamine, trimethylsilyl isocyanate or equivalent to install the urea, anhydrous solvents under nitrogen with light exclusion',
        },
        {
          id: 'zil-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallise, and build the bilayer tablet around the food effect',
          description:
            'The marketed article is a bilayer tablet with an immediate-release layer and an extended-release layer, taken within one hour after a meal because food increases both peak concentration and total absorption. Formulation is therefore inseparable from purification here: the same drug substance in a different tablet is a different exposure.',
          dependsOnStepId: 'zil-w2',
          reagentsAndBuffer:
            'Recrystallisation from an alcohol-water system, hypromellose matrix for the extended-release layer with crospovidone and sodium starch glycolate in the immediate-release layer, USP dissolution apparatus in fed and fasted-state biorelevant media',
        },
        {
          id: 'zil-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Measure whole-blood LTB4 inhibition, not plasma concentration',
          description:
            'The label defines the pharmacodynamic endpoint precisely: inhibition of ex vivo LTB4 formation in whole blood, directly related to plasma level, IC50 about 0.46 mcg/mL and at least 80% inhibition at 2 mcg/mL. That is the assay that says whether the enzyme is actually off in a given person, and it is far more informative than an exposure figure.',
          dependsOnStepId: 'zil-w3',
          reagentsAndBuffer:
            'Heparinised whole blood, calcium ionophore A23187 stimulation, LTB4 immunoassay or LC-MS/MS quantification, paired urinary LTE4 measurement for the cysteinyl branch, plasma zileuton by LC-MS/MS at matched timepoints',
        },
        {
          id: 'zil-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Screen for hepatocellular injury before anything else',
          description:
            'The rate-limiting property of this molecule is not potency; it is the 3.2% rate of ALT elevation at three times the upper limit of normal across more than 5,000 treated patients, and the monthly monitoring schedule that follows from it. Any successor 5-lipoxygenase inhibitor stands or falls on this assay, and any characterisation that omits it is describing the wrong risk.',
          dependsOnStepId: 'zil-w4',
          reagentsAndBuffer:
            'Primary human hepatocytes or HepaRG cells, high-content imaging for mitochondrial membrane potential, reactive oxygen species and intracellular glutathione, glutathione trapping with LC-MS/MS for reactive metabolite adducts, bile salt export pump inhibition assay in membrane vesicles',
        },
      ],
    },
    keyAudits: [
      {
        id: 'zil-a1',
        category: 'measured',
        title: 'It more than halved steroid-requiring exacerbations in its original trial',
        laymanSummary:
          'Four hundred people with mild to moderate asthma on nothing but a rescue inhaler were randomised. Over three months, 6% of those on the full dose needed a course of steroids, against 16% on placebo.',
        technicalDetails:
          'The Zileuton Clinical Trial Group randomised 401 patients with mild to moderate asthma — FEV1 40% to 80% of predicted, treated only with inhaled beta-agonists — to zileuton 600 mg, zileuton 400 mg or placebo, each four times daily, after a 10-day placebo lead-in, for 13 weeks. Asthma exacerbation requiring corticosteroid treatment occurred in 8 of 132 (6.1%) on 600 mg against 21 of 135 (15.6%) on placebo (p=0.02). At expected peak drug concentration, average FEV1 improved 15.7% on 600 mg against 7.7% on placebo (p=0.006). Quality-of-life scores improved significantly on 600 mg and not on placebo (p=0.007 overall). This is the trial that established that 5-lipoxygenase products are mediators with an important role in the biology of asthma, and it is a genuinely good result on an endpoint that matters. It is also the trial in which the liver signal appeared: transaminase elevations above three times normal in five patients on 600 mg (p=0.03 against placebo), three on 400 mg (p=0.12) and none on placebo, all reversing on withdrawal.',
        evidenceSource:
          'Israel E, Cohn J, Dubé L, Drazen JM. Effect of treatment with zileuton, a 5-lipoxygenase inhibitor, in patients with asthma. A randomized controlled trial. JAMA 1996;275:931-936',
        measuredMetric:
          'Frequency of asthma exacerbation requiring corticosteroid treatment, and FEV1 at expected peak concentration, over 13 weeks',
        auditFlag: 'verified',
      },
      {
        id: 'zil-a2',
        category: 'measured',
        title: 'The extended-release trial won on a 0.12 litre difference',
        laymanSummary:
          'The trial that registered the modern twice-daily tablet measured only lung function. Zileuton gained 0.39 litres and placebo gained 0.27, a difference of about a tenth of a litre, at p=0.021.',
        technicalDetails:
          'The extended-release registration trial was a randomised, double-blind, parallel-group, placebo-controlled, multicentre study of 12 weeks in patients 12 and over with asthma, with 199 on two 600 mg extended-release tablets twice daily and 198 on placebo. Mean baseline FEV1 was 58.5% of predicted. Efficacy was assessed on trough FEV1 at 12 weeks: mean change from baseline 0.39 L against 0.27 L, p=0.021, by last-observation-carried-forward. Secondary endpoints of peak flow and rescue beta-agonist use were described as supportive. Two things are worth naming. First, the placebo arm gained 0.27 L, which is more than two thirds of the improvement seen on the drug — a reminder of how much of a twelve-week asthma trial is regression, seasonality and study effect. Second, no exacerbation endpoint was measured, so the outcome that made the original 1996 trial persuasive is absent from the registration package for the formulation people actually take.',
        evidenceSource:
          'Zileuton extended-release tablets United States prescribing information, section 14 Clinical Studies',
        measuredMetric:
          'Mean change from baseline in trough FEV1 at 12 weeks, zileuton extended-release against placebo',
        auditFlag: 'caution',
      },
      {
        id: 'zil-a3',
        category: 'failed',
        title: 'The liver is the reason nobody prescribes it',
        laymanSummary:
          'Roughly one person in thirty gets liver enzymes above three times normal. That is why the label requires blood tests before starting, monthly for three months, and regularly after that — and why a once-daily competitor with no monitoring took the market.',
        technicalDetails:
          'In controlled and open-label studies involving more than 5,000 patients treated with immediate-release zileuton, the overall rate of ALT elevation at or above three times the upper limit of normal was 3.2%. One patient developed symptomatic hepatitis with jaundice, which resolved on discontinuation; three others with transaminase elevations developed mild hyperbilirubinaemia below three times normal. In the 12-week extended-release trial the incidence was 2.5% (5 of 199) against 0.5% (1 of 198) on placebo, with 60% of elevations occurring in the first month and two detected 14 days after the study treatment finished. Zileuton is contraindicated in active liver disease or persistent enzyme elevations at or above three times normal. The label directs assessing ALT before starting, monthly for three months, every two to three months for the rest of the first year and periodically thereafter, with discontinuation at five times normal or at symptoms. A drug that requires a venepuncture a month for its first quarter is competing against one that requires none, and that is not a pharmacological contest.',
        evidenceSource:
          'Zileuton extended-release tablets United States prescribing information, Contraindications 4, Warnings and Precautions 5.1, Adverse Reactions 6.1, Dosage and Administration 2',
        measuredMetric:
          'Rate of ALT elevation at or above three times the upper limit of normal, and the monitoring schedule that follows from it',
        auditFlag: 'caution',
      },
      {
        id: 'zil-a4',
        category: 'conclusion_shift',
        title: 'Same class of harm as montelukast, a different class of warning',
        laymanSummary:
          'Montelukast got the FDA’s strongest warning in 2020 for psychiatric effects. Zileuton’s label describes sleep disorders and behaviour changes, says some reports look drug-induced, and carries no boxed warning.',
        technicalDetails:
          'Section 5.2 of the zileuton label states that neuropsychiatric events have been reported in adult and adolescent patients taking zileuton, that postmarketing reports include sleep disorders and behaviour changes, and that the clinical details of some of those reports appear consistent with a drug-induced effect. It directs patients and prescribers to be alert for such events and to evaluate the risks and benefits of continuing if they occur. Montelukast, which acts on the receptor at the end of the same pathway, received a boxed warning on 4 March 2020 for serious neuropsychiatric events including suicidal thoughts and behaviour, with the allergic rhinitis indication restricted at the same time. The difference between a boxed warning and a warnings-section paragraph is a regulatory judgement about benefit-risk in a population, not a finding about mechanism. Zileuton is prescribed to a tiny fraction of the number of people who take montelukast, for asthma alone rather than for mild hay fever, which changes both the size of the signal available to detect and the benefit side of the calculation. A reader comparing the two labels should not read the absence of a box as evidence of absence of the effect.',
        evidenceSource:
          'Zileuton extended-release tablets United States prescribing information, section 5.2; FDA Drug Safety Communication, 4 March 2020, on montelukast',
        inferredClaim:
          'That zileuton is neuropsychiatrically safer than montelukast because it lacks a boxed warning — a comparison of regulatory actions taken under very different exposure volumes and benefit-risk contexts',
        auditFlag: 'contested',
      },
      {
        id: 'zil-a5',
        category: 'inferred',
        title: 'A page of animal pharmacology ending in one sentence',
        laymanSummary:
          'The mechanism section describes effects in mice, rats, rabbits, dogs, sheep and monkeys across a full page, then closes with: the clinical relevance of these findings is unknown.',
        technicalDetails:
          'Section 12.1 records that zileuton inhibits ex vivo LTB4 formation in mice, rats, rabbits, dogs, sheep and monkeys; inhibits arachidonic-acid-induced ear oedema in mice, neutrophil migration in mice and eosinophil migration into the lungs of antigen-challenged sheep; in a mouse allergic inflammation model inhibited neutrophil and eosinophil influx, reduced multiple cytokines in bronchoalveolar lavage fluid and reduced serum IgE; inhibits leukotriene-dependent smooth muscle contraction in guinea pig and human airways; inhibits leukotriene-dependent bronchospasm in challenged guinea pigs; and inhibits late-phase bronchoconstriction and airway hyperreactivity in antigen-challenged sheep. The section then ends: "The clinical relevance of these findings is unknown." That closing sentence is doing exactly the right job and it is easy to miss. The upstream position of 5-lipoxygenase in the pathway, and the removal of LTB4 as well as the cysteinyl leukotrienes, is the strongest argument anyone makes for this drug over montelukast. It is an argument from mechanism and from animal models, and no head-to-head clinical trial has been run to convert it into a clinical claim.',
        evidenceSource:
          'Zileuton extended-release tablets United States prescribing information, section 12.1 Mechanism of Action',
        inferredClaim:
          'That inhibiting the enzyme rather than blocking one receptor produces better asthma control in humans — supported across six animal species and never tested head to head against a receptor antagonist',
        auditFlag: 'caution',
      },
      {
        id: 'zil-a6',
        category: 'failed',
        title: 'Four tablets, after food, with two interactions that change other drugs’ doses',
        laymanSummary:
          'The regimen is four 600 mg tablets a day taken after meals. It doubles theophylline levels and pushes up warfarin’s effect on clotting, both enough that the other drug has to be adjusted.',
        technicalDetails:
          'The labelled regimen is two 600 mg extended-release tablets twice daily within one hour after morning and evening meals, a total daily dose of 2,400 mg, with tablets not to be chewed, cut or crushed, and food increasing both peak concentration and total absorption. In a 16-subject interaction study, zileuton reduced steady-state theophylline clearance by approximately 50%, approximately doubled theophylline area under the curve and raised peak concentration by 73%, with theophylline-related adverse reactions occurring more often during co-administration; the label directs halving the theophylline dose. In 30 subjects, zileuton reduced R-warfarin clearance by 15% and raised its exposure by 22%, accompanied by what the label calls a clinically significant increase in prothrombin times, with S-warfarin unaffected; the label directs prothrombin time monitoring and warfarin dose titration. Propranolol levels and beta-blocker activity also rise. Set against montelukast — once daily, no monitoring, no comparable interactions — this is a full account of why a drug with a good 1996 exacerbation result occupies four products in the entire acquisition-cost survey.',
        evidenceSource:
          'Zileuton extended-release tablets United States prescribing information, Dosage and Administration 2, Drug Interactions 7.1 to 7.3, Clinical Pharmacology 12.3',
        measuredMetric:
          'Theophylline clearance and area under the curve, R-warfarin exposure and prothrombin time, during co-administration',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Four tablets a day, after meals',
        laymanDesc:
          'Two extended-release tablets twice daily, taken within an hour of eating because food increases how much gets absorbed.',
        molecularDetail:
          'Bilayer film-coated tablets with an immediate-release and an extended-release layer, 600 mg each, two twice daily for 2,400 mg a day, not to be chewed, cut or crushed. Food increased both peak plasma concentration and total absorption in the crossover pharmacokinetic study.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It has to get inside the inflammatory cell',
        laymanDesc:
          'The enzyme it targets is not on the cell surface. It works inside neutrophils, eosinophils and mast cells.',
        molecularDetail:
          '5-lipoxygenase is an intracellular enzyme that translocates to the nuclear membrane on cell activation, where it acts with 5-lipoxygenase-activating protein on arachidonic acid released from membrane phospholipid. Zileuton must therefore reach an intracellular compartment, unlike a receptor antagonist acting from outside.',
        iconName: 'Layers',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It chelates the iron in the enzyme’s active site',
        laymanDesc:
          'The business end of the molecule grabs the iron atom the enzyme needs to work, and the enzyme stops.',
        molecularDetail:
          'An N-hydroxyurea that coordinates the non-haem active-site iron of 5-lipoxygenase. Both enantiomers of the 50:50 racemate are active. Whole-blood LTB4 inhibition IC50 about 0.46 mcg/mL, at least 80% inhibition at 2 mcg/mL, and 98% mean inhibition at the 5.9 mcg/mL peak levels seen on 600 mg four times daily.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Both leukotriene families disappear, not just one',
        laymanDesc:
          'Blocking the enzyme removes the airway-tightening leukotrienes and the ones that call in inflammatory cells. Blocking a receptor removes only the first.',
        molecularDetail:
          'Inhibition of LTB4, LTC4, LTD4 and LTE4 formation, confirmed in humans by reduced whole-blood LTB4 and reduced urinary LTE4. LTB4 is a chemoattractant for neutrophils and eosinophils; the cysteinyl leukotrienes drive capillary permeability, mucus secretion and smooth muscle contraction. Montelukast blocks one receptor for the second group only.',
        iconName: 'Filter',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Exacerbations fall and lung function rises',
        laymanDesc:
          'In the original trial, steroid courses dropped from about one in six to about one in sixteen. In the modern registration trial, lung function gained about a tenth of a litre over placebo.',
        molecularDetail:
          'Israel 1996: exacerbation requiring corticosteroid 6.1% against 15.6% (p=0.02), FEV1 at peak concentration +15.7% against +7.7% (p=0.006), in 401 patients over 13 weeks. Extended-release registration trial: trough FEV1 change 0.39 L against 0.27 L (p=0.021) in 397 patients over 12 weeks.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And the liver has to be watched every month',
        laymanDesc:
          'About one in thirty gets a significant rise in liver enzymes, which is why the tests are scheduled and why almost nobody prescribes this drug.',
        molecularDetail:
          'ALT elevation at or above three times the upper limit of normal in 3.2% of more than 5,000 treated patients, and 2.5% against 0.5% on placebo over 12 weeks. Contraindicated in active liver disease or persistent elevations at or above three times normal. Monitoring before treatment, monthly for three months, every two to three months for the rest of the year, periodically thereafter.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Zileuton Clinical Trial Group (JAMA 1996;275:931-936)',
        phase: 'Phase 3, randomised, double-blind, parallel-group, placebo-controlled, three arms',
        sampleSize: 401,
        primaryEndpoint:
          'Frequency of asthma exacerbation requiring corticosteroid treatment over 13 weeks in mild to moderate asthma treated only with inhaled beta-agonists',
        endpointMet: true,
        statisticalPValue:
          '6.1% (8 of 132) on zileuton 600 mg four times daily against 15.6% (21 of 135) on placebo, p=0.02; FEV1 at peak concentration +15.7% against +7.7%, p=0.006; overall quality-of-life score p=0.007',
        unreportedAdverseSignals:
          'Transaminase elevations above three times normal occurred in five patients on 600 mg (p=0.03 against placebo), three on 400 mg (p=0.12) and none on placebo. All reversed on withdrawal. The efficacy and the liver signal came out of the same trial.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Zileuton extended-release 12-week registration trial (label section 14)',
        phase: 'Phase 3, randomised, double-blind, parallel-group, placebo-controlled, multicentre',
        sampleSize: 397,
        primaryEndpoint:
          'Mean change from baseline in trough FEV1 at 12 weeks in patients 12 and over with asthma',
        endpointMet: true,
        statisticalPValue:
          '0.39 L against 0.27 L, p=0.021, by last-observation-carried-forward; peak flow and rescue beta-agonist use supportive',
        unreportedAdverseSignals:
          'No exacerbation endpoint was measured, so the outcome that made the 1996 trial persuasive is absent from the registration package for the formulation now dispensed. The placebo arm gained 0.27 L, more than two thirds of the improvement seen on drug.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'Pooled hepatic safety across controlled and open-label immediate-release studies (label section 5.1)',
        phase: 'Pooled safety analysis across the immediate-release clinical programme',
        sampleSize: 5000,
        primaryEndpoint: 'Rate of ALT elevation at or above three times the upper limit of normal',
        endpointMet: false,
        statisticalPValue:
          'Overall rate 3.2% in more than 5,000 treated patients; one symptomatic hepatitis with jaundice, resolving on discontinuation; three further patients with mild hyperbilirubinaemia below three times normal',
        unreportedAdverseSignals:
          'The label notes there was no evidence of hypersensitivity or other alternative aetiology for these findings, which is the observation that makes the signal a drug effect rather than a coincidence. Two of the five elevations in the 12-week extended-release trial were detected 14 days after treatment ended.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Steroid-requiring exacerbations in 6.1% against 15.6% on placebo over 13 weeks in 401 patients (p=0.02)',
        'FEV1 at peak concentration +15.7% against +7.7% on placebo in the same trial (p=0.006)',
        'Trough FEV1 change of 0.39 L against 0.27 L over 12 weeks in the extended-release registration trial (p=0.021)',
        'ALT elevation at or above three times normal in 3.2% of more than 5,000 treated patients, and 2.5% against 0.5% over 12 weeks',
        'Theophylline area under the curve approximately doubled and peak concentration raised 73%; R-warfarin exposure up 22% with a clinically significant prothrombin time increase',
      ],
      unsupportedInferences: [
        'That blocking the enzyme beats blocking the receptor in patients, an argument made from six animal species and never tested head to head',
        'That the absence of a boxed warning makes it neuropsychiatrically safer than montelukast, when its own label reports sleep disorders and behaviour changes consistent with a drug effect',
        'That the 1996 exacerbation result transfers to the extended-release formulation, whose registration trial measured only lung function',
        'That generic status implies affordability, when four listed products sustain a price of US$2.07 per tablet at four tablets a day',
      ],
      whatFailedInitially: [
        'The liver: a 3.2% rate of significant transaminase elevation, a contraindication in active liver disease, and a monitoring schedule that begins monthly',
        'The regimen: 2,400 mg a day in four tablets taken after meals, against a once-daily competitor',
        'The interactions: theophylline exposure doubled and warfarin anticoagulation clinically increased, both requiring the other drug to be changed',
        'The market: the originator immediate-release brand is discontinued and four generic products remain listed',
      ],
      realWorldOutcome: [
        'Approved 9 December 1996 under NDA 020471; the branded immediate-release product is discontinued and only extended-release generics remain',
        'US$2.07 per tablet at pharmacy acquisition cost, about US$8.28 a day, roughly 120 times the daily cost of montelukast',
        'Retains a specific place where the leukotriene pathway is dominant, particularly aspirin-exacerbated respiratory disease',
        'The clearest demonstration in this file that a better mechanism loses to a better regimen',
      ],
    },
    deliverySystem: {
      type: 'Oral bilayer extended-release tablets of 600 mg, two twice daily within one hour after morning and evening meals',
      description:
        'Each tablet combines an immediate-release layer with an extended-release layer. Food increases both peak plasma concentration and total absorption, which is why the label ties administration to meals; tablets must not be chewed, cut or crushed. The original immediate-release product was taken four times a day and is discontinued. The pharmacodynamic marker is inhibition of ex vivo whole-blood LTB4 formation, directly related to plasma level.',
      safetyProfile:
        'Contraindicated in active liver disease or persistent hepatic enzyme elevations at or above three times the upper limit of normal, and in prior allergic reaction to zileuton. Hepatotoxicity requiring ALT measurement before treatment, monthly for three months, every two to three months for the rest of the first year and periodically thereafter, with discontinuation at five times normal or on symptoms of liver dysfunction. Neuropsychiatric events including sleep disorders and behaviour changes reported postmarketing, some with clinical details the label describes as consistent with a drug-induced effect. Commonest adverse reactions at 5% or more were sinusitis, nausea and pharyngolaryngeal pain. Clinically significant interactions with theophylline, warfarin and propranolol, each requiring the other drug to be adjusted. Caution in substantial alcohol consumption or a history of liver disease. Not for an acute asthma attack.',
    },
    commonQuestions: [
      {
        q: 'If it blocks the whole pathway, why is montelukast the one everyone takes?',
        a: 'Because the comparison that decided it was never about pharmacology. Zileuton does act one step further upstream: it inhibits the enzyme, so neither the airway-tightening cysteinyl leukotrienes nor LTB4 — the signal that recruits neutrophils and eosinophils — get made at all. Montelukast blocks one receptor for the first group only. But zileuton is four tablets a day taken after meals, needs a liver blood test before starting and monthly for three months, doubles theophylline levels, meaningfully increases warfarin’s effect, and costs about US$8.28 a day at what pharmacies pay against about seven cents for montelukast. No head-to-head trial has ever compared the two on asthma outcomes. The mechanism argument is genuine and unresolved; the practical contest was over quickly.',
        auditNote:
          'The label’s own mechanism section, after a page of animal data supporting the upstream argument, ends with the sentence: the clinical relevance of these findings is unknown.',
      },
      {
        q: 'How dangerous is the liver problem?',
        a: 'Common enough to require scheduled monitoring, and in the trial record reversible. Across more than 5,000 patients treated in the immediate-release programme, 3.2% had ALT at or above three times the upper limit of normal. One developed symptomatic hepatitis with jaundice, which resolved when the drug was stopped. In the 12-week extended-release trial the rate was 2.5% against 0.5% on placebo, with most elevations in the first month and all of them returning to normal or near-normal within about a month of stopping. The label contraindicates the drug in active liver disease or in anyone whose enzymes are already at three times normal, directs testing before treatment and monthly for the first three months, and directs stopping at five times normal or at any symptom of liver dysfunction — right upper quadrant pain, nausea, fatigue, lethargy, itching, jaundice or flu-like symptoms.',
      },
      {
        q: 'Should I worry about mood or sleep effects, as with montelukast?',
        a: 'The label says to be alert for them. Section 5.2 reports postmarketing sleep disorders and behaviour changes in adults and adolescents and states that the clinical details of some of those reports appear consistent with a drug-induced effect, directing prescribers to weigh risks and benefits if they occur. Montelukast carries a boxed warning for the same category of events; zileuton does not. The difference is a regulatory benefit-risk judgement made about very different populations — montelukast is taken by many millions of people, including for mild hay fever, and zileuton by a very small number for asthma alone — rather than a finding that the effect is absent here.',
      },
      {
        q: 'Is there anyone it is clearly the right drug for?',
        a: 'The strongest case is aspirin-exacerbated respiratory disease — the combination of asthma, nasal polyps and reactions to aspirin and other non-steroidal anti-inflammatories — because that syndrome runs through leukotriene overproduction, and zileuton removes the whole output rather than intercepting one branch. It is also an option for people who need a leukotriene-pathway drug and cannot take or have not responded to a receptor antagonist. In both cases the decision has to account for the monitoring and the interactions, which is why it remains a third-line drug used by a very small number of specialists.',
      },
      {
        q: 'Why is a generic drug from 1996 still two dollars a tablet?',
        a: 'Because generic pricing depends on competition, and competition depends on volume. The acquisition-cost survey lists four zileuton products; it lists seventy-four for montelukast and one hundred and eighteen for prednisone. Almost nobody prescribes zileuton, so almost nobody manufactures it, so the price never fell the way an off-patent price is supposed to. At four tablets a day the daily acquisition cost is about US$8.28 against about seven cents for montelukast. That is not a story about patents; it is a story about what happens to an old drug when the market for it disappears.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: false,
    sources: [
      {
        label:
          'Zileuton extended-release tablets United States prescribing information — Indications 1, Dosage and Administration 2, Contraindications 4, Warnings and Precautions 5.1 and 5.2, Adverse Reactions 6.1, Drug Interactions 7.1 to 7.3, Description 11, Clinical Pharmacology 12.1 to 12.3, Clinical Studies 14',
        identifier:
          'https://api.fda.gov/drug/drugsfda.json?search=application_number:%22NDA020471%22',
        kind: 'regulatory',
      },
      {
        label:
          'Israel E, Cohn J, Dubé L, Drazen JM; Zileuton Clinical Trial Group. Effect of treatment with zileuton, a 5-lipoxygenase inhibitor, in patients with asthma. A randomized controlled trial. JAMA 1996;275:931-936',
        identifier: 'https://pubmed.ncbi.nlm.nih.gov/8598621/',
        kind: 'pmid',
      },
      {
        label:
          'Chauhan BF, Ducharme FM. Anti-leukotriene agents compared to inhaled corticosteroids in the management of recurrent and/or chronic asthma in adults and children. Cochrane Database Syst Rev 2012;(5):CD002314',
        identifier: '10.1002/14651858.CD002314.pub3',
        kind: 'doi',
      },
      {
        label:
          'FDA Drug Safety Communication, 4 March 2020 — FDA requires Boxed Warning about serious mental health side effects for asthma and allergy drug montelukast (Singulair), cited here as the comparator regulatory action on the same pathway',
        identifier:
          'https://www.fda.gov/drugs/drug-safety-and-availability/fda-requires-boxed-warning-about-serious-mental-health-side-effects-asthma-and-allergy-drug',
        kind: 'regulatory',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — zileuton, 4 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 60490 — zileuton structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/60490',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 9. Acetylcysteine — an antidote that saves lives on a stoichiometric mechanism, and an
  //    antioxidant hypothesis that has now failed in three organs in three randomised trials.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'acetylcysteine',
    name: 'Acetylcysteine',
    tradeName: 'Mucomyst / Acetadote / Cetylev',
    sponsor:
      'Introduced as a mucolytic in 1963. The inhalation and oral solution is now supplied entirely by generic manufacturers under abbreviated applications dating from 1994 onwards; the intravenous antidote formulation ACETADOTE was approved on 23 January 2004 under NDA 021539 and the registration is held by Apotex.',
    targetGene:
      'None. Acetylcysteine has no receptor and no gene target — it works by chemistry: a free sulfhydryl group that reduces disulfide bonds, and a cysteine backbone the liver uses to rebuild glutathione.',
    targetProtein:
      'No protein target. In the airway lumen the thiol cleaves the disulfide cross-links holding mucin glycoproteins together; in the hepatocyte it supplies the cysteine needed to synthesise glutathione, which conjugates the reactive acetaminophen metabolite.',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1963,
    indication:
      'Adjuvant therapy for patients with abnormal, viscid or inspissated mucous secretions in chronic and acute bronchopulmonary disease, cystic fibrosis, tracheostomy care, surgical and post-traumatic chest conditions, atelectasis due to mucous obstruction and diagnostic bronchial studies; and, given orally or intravenously, as an antidote to prevent or lessen hepatic injury after ingestion of a potentially hepatotoxic quantity of acetaminophen',
    patientFriendlyIndication:
      'The antidote for a paracetamol overdose, and a very old drug for loosening thick mucus',
    anatomicalSite:
      'The mucus layer sitting in the airway lumen, and the cytosol of the liver cell where glutathione is made',
    conditionContext: {
      conditionExplainer:
        'Two completely different jobs. Mucus is thick because long protein chains are cross-linked to each other by sulfur-to-sulfur bonds; a free thiol breaks those bonds and the mucus thins. Separately, a paracetamol overdose produces a reactive metabolite that the liver normally neutralises with glutathione until the glutathione runs out; acetylcysteine supplies the raw material to make more.',
      whyItMatters:
        'The antidote use is one of the most clearly effective interventions in medicine, and it works for a reason that can be written down as a chemical equation. Everything else acetylcysteine is given for rests on a much looser idea — that being an antioxidant and a glutathione precursor should help wherever oxidative stress is implicated. That idea has now been tested on hard endpoints in three organs and failed in all three.',
      whoTakesThis:
        'People who have taken too much paracetamol, where it is standard of care worldwide; and, far less usefully, people with thick airway secretions.',
      clinicalGoals:
        'For overdose, prevention of hepatic injury, and the label states it is essential to start as soon as possible and in any case within 24 hours. For mucus, thinner secretions — a surrogate for something nobody has shown it changes.',
    },
    oneSentenceVerdict:
      'A thiol that prevented hepatotoxicity in all but 6.1% of at-risk patients treated within 10 hours of a paracetamol overdose across 2,540 cases, and whose antioxidant hypothesis has since failed on hard endpoints in three separate randomised trials — no change in COPD lung-function decline or exacerbations over three years, no change in vital capacity in pulmonary fibrosis, and no change in kidney outcomes after angiography in 4,993 patients.',
    laymanHowItWorks:
      'Acetylcysteine carries a sulfur atom with a spare hydrogen on it, and that one chemical group does everything. In mucus, the sulfur breaks the bridges that hold the sticky protein chains together, so the mucus becomes runnier. In the liver, the same molecule is taken apart and used as the raw material for glutathione, the compound the liver uses to mop up the poisonous by-product of too much paracetamol. There is no receptor and no signalling — it is chemistry, and that is exactly why it works so well where the chemistry is the problem and so poorly everywhere else.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 66,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$1.32 per millilitre at United States pharmacy acquisition cost (CMS NADAC, median across 23 listed products, survey effective 23 April 2025)',
      markupEstimate: '',
      openPatentNotes:
        'The mucolytic solution has been generic since 1994 and the molecule itself is an acetylated form of a common amino acid. Acetylcysteine is on the WHO Model List of Essential Medicines as an antidote, which is the use it earns that place for. In much of Europe it is sold over the counter as an effervescent tablet for coughs and colds; in the United States it is a prescription solution, and the same molecule is also marketed as a dietary supplement — three regulatory identities for one chemical, with three different standards of evidence behind them.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'For the antidote use there is no substitute and no need for one. For the mucolytic use the alternatives are better evidenced than acetylcysteine is: nebulised hypertonic saline has a 164-patient randomised trial in cystic fibrosis with a mixed but real result, and dornase alfa attacks the other polymer in purulent mucus — DNA from dead cells — which acetylcysteine explicitly does not touch, since its own label states the mucolytic activity is unaltered by the presence of DNA. Guaifenesin is cheaper than all of them and thinner on evidence than any.',
      conventionalRx: [
        {
          name: 'Nebulised hypertonic saline',
          class: 'Osmotic airway hydrating agent',
          howItCompares:
            'Draws water onto the airway surface instead of cutting the mucus polymer. In a 48-week double-blind trial in 164 patients with stable cystic fibrosis aged 6 and over, 7% saline twice daily did not change the primary outcome — the rate of change in lung function over the treatment period (p=0.79) — but did produce a significant absolute difference in lung function and fewer exacerbations, and the authors concluded it was an inexpensive, safe and effective additional therapy. That is a more informative result than anything acetylcysteine has in an airway.',
          typicalCost:
            'Not separately listed in the acquisition-cost survey used on this page; it is sterile saline at a higher concentration',
          prosAndCons:
            'Pros: a real randomised trial with a clinical endpoint; extremely cheap. Cons: needs a bronchodilator beforehand because it also provokes bronchospasm; the primary endpoint of its own trial was not met.',
        },
        {
          name: 'Dornase alfa (Pulmozyme)',
          class: 'Recombinant human deoxyribonuclease I',
          howItCompares:
            'Cleaves the DNA released by dead neutrophils, which is the polymer that makes purulent secretions viscous. The acetylcysteine label makes the distinction itself: its own mucolytic activity is unaltered by the presence of DNA, and DNA content rises with increasing purulence. The two drugs cut different molecules, and only one of them cuts the one that accumulates in infected airways.',
          typicalCost:
            'Not listed in the acquisition-cost survey used on this page; it is a recombinant protein supplied through specialty distribution',
          prosAndCons:
            'Pros: attacks the polymer acetylcysteine cannot; established in cystic fibrosis. Cons: expensive; no established role outside cystic fibrosis.',
        },
        {
          name: 'Guaifenesin',
          class: 'Oral expectorant',
          howItCompares:
            'The over-the-counter answer to the same complaint, at a fraction of the price and with an evidence base that is thinner still. It is included here because it is what most people actually take for thick mucus, and because the comparison sets the standard: acetylcysteine’s mucolytic indication is not competing against a well-evidenced alternative, it is competing against nothing much.',
          typicalCost:
            'US$0.0903 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 189 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: over the counter, cheap, no bronchospasm risk. Cons: the randomised evidence for it is weak and largely on subjective sputum measures.',
        },
      ],
      naturalFoods: [
        {
          name: 'Water, and humidified air',
          activeCompound: 'None — hydration of the airway surface liquid',
          biologicalMechanism:
            'Mucus viscosity depends on water content as well as on cross-linking. Systemic and airway hydration is the oldest intervention for thick secretions and the one whose mechanism is least disputed, which is not the same as saying it is well evidenced.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'Not stated here as advice. The randomised evidence that drinking more water thins airway secretions is poor; it is included because it is the comparator against which any mucolytic claim should be read, and because FDA’s guidance for infants with cough and cold recommends a cool-mist humidifier and saline drops rather than drugs.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'If it is a paracetamol overdose, time is the whole treatment',
          action: 'Seek emergency care immediately, and do not wait to feel unwell.',
          patientImpact:
            'The label states it is essential to initiate treatment as soon as possible after the overdose and in any case within 24 hours of ingestion. In the national multicentre series of 2,540 treated patients, hepatotoxicity developed in 6.1% of those at probable risk when treatment began within 10 hours and 26.4% when it began 10 to 24 hours after ingestion.',
          clinicalPrecaution:
            'A paracetamol overdose produces no symptoms at all in the window when the antidote works best. Feeling fine is not evidence of not being poisoned, and it is the reason the timing matters more than the presentation.',
        },
        {
          name: 'If you have asthma, expect the nebulised form to be watched closely',
          action:
            'Tell whoever is giving it that you have asthma, and say immediately if you tighten up.',
          patientImpact:
            'The label states that patients exposed to inhaled acetylcysteine aerosol occasionally respond with increased airways obstruction of varying and unpredictable severity, that reactors cannot be identified in advance from a random population, and that a previous uneventful treatment does not predict the next one. Asthmatics under treatment should be watched carefully.',
          clinicalPrecaution:
            'The label directs that most bronchospasm is quickly relieved by a nebulised bronchodilator, and that if it progresses the acetylcysteine must be discontinued immediately. It also warns that liquefied secretions may need mechanical suction if the cough is inadequate.',
        },
        {
          name: 'Do not be alarmed by the smell or the colour',
          action: 'Ignore the sulfur odour, and the purple tinge an opened bottle can develop.',
          patientImpact:
            'The label records that patients notice a slight disagreeable odour, that a face mask can leave stickiness on the face which washes off with water, and that a light purple colour may develop in an opened bottle from a chemical reaction that does not significantly affect safety or mucolytic effectiveness.',
          clinicalPrecaution:
            'The solution is oxygen sensitive. Continued nebulisation with a dry gas concentrates the drug by evaporation, which the label says can impede nebulisation and efficient delivery.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(=O)N[C@@H](CS)C(=O)O',
      chemicalFormula: 'C5H9NO3S',
      molecularWeight: '163.20 g/mol (the label states 163.19)',
      targetReceptorAffinity:
        'No receptor and no affinity constant, because this drug has no protein target. It is the N-acetyl derivative of the amino acid L-cysteine, a white crystalline powder melting at 104 to 110 degrees Celsius. The label attributes the mucolytic action to the sulfhydryl group, which it says "probably" opens disulfide linkages in mucus and thereby lowers viscosity; the activity is unaltered by DNA and increases with pH, with significant mucolysis between pH 7 and 9. In vivo it undergoes rapid deacetylation to cysteine, or oxidation to diacetylcystine. The 10% and 20% solutions are buffered to pH 7.0 with edetate disodium and are oxygen sensitive.',
      structureSource: {
        label:
          'PubChem CID 12035 (acetylcysteine) — canonical SMILES, molecular formula and weight, as carried on the enriched record; melting point, pH dependence, deacetylation and solution composition from the acetylcysteine solution United States prescribing information, Description and Clinical Pharmacology',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/12035',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'nac-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Measure free thiol, not total acetylcysteine',
          description:
            'The entire pharmacology sits in one sulfhydryl group, and that group oxidises to the disulfide dimer diacetylcystine on contact with air. A chromatographic assay reporting total acetylcysteine-related material will pass a bottle whose active group has already been consumed. Free thiol content is the release test that matters, and it is the reason the solution is packaged oxygen-free.',
          reagentsAndBuffer:
            'Acetylcysteine USP reference standard, Ellman reagent (5,5-dithiobis-2-nitrobenzoic acid) for free thiol quantification at 412 nm, reversed-phase HPLC for the diacetylcystine dimer, headspace oxygen measurement, melting point against the specified 104 to 110 degree range',
        },
        {
          id: 'nac-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Acetylate L-cysteine without racemising or oxidising it',
          description:
            'The molecule is L-cysteine with an acetyl group on the amine. Two things must survive the reaction: the L configuration, because the D-isomer is not the drug, and the free thiol, which will oxidise readily under the same conditions that drive the acetylation.',
          dependsOnStepId: 'nac-w1',
          reagentsAndBuffer:
            'L-cysteine hydrochloride, acetic anhydride under controlled pH and temperature, nitrogen sparging throughout, chelating agent to suppress trace-metal-catalysed thiol oxidation, crystallisation from water or aqueous alcohol',
        },
        {
          id: 'nac-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Formulate at pH 7 with a chelator and exclude oxygen',
          description:
            'The label specifies 10% and 20% solutions at pH 7.0 with edetate disodium, and notes the product is oxygen sensitive and may develop a light purple colour in an opened bottle. The chelator is not an inactive ingredient in any meaningful sense: trace copper and iron catalyse thiol oxidation, and removing them is what gives the solution a shelf life.',
          dependsOnStepId: 'nac-w2',
          reagentsAndBuffer:
            'Sodium hydroxide and hydrochloric acid for pH adjustment to 7.0 within a 6.0 to 7.5 range, edetate disodium dihydrate at 0.25 or 0.5 mg per mL, nitrogen headspace, sterile unpreserved filling',
        },
        {
          id: 'nac-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Quantify the glutathione the liver actually makes',
          description:
            'The antidote mechanism is stoichiometric: cysteine in, glutathione out, conjugated to the reactive metabolite. That makes it measurable in a way an antioxidant hypothesis is not. The assay reads intracellular reduced glutathione and the mercapturate conjugate, not a plasma acetylcysteine concentration.',
          dependsOnStepId: 'nac-w3',
          reagentsAndBuffer:
            'Primary human hepatocytes with acetaminophen challenge, LC-MS/MS for reduced and oxidised glutathione and for acetaminophen-cysteine and mercapturic acid conjugates, glutathione-depleted control with buthionine sulfoximine, N-acetyl-p-benzoquinone imine adduct detection',
        },
        {
          id: 'nac-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Test the bronchospasm liability in the population that receives it',
          description:
            'The label states that reactors to inhaled acetylcysteine cannot be identified a priori and that prior tolerance does not predict future tolerance. That is an unusual admission and it defines the assay that has never been done properly: an airway-challenge study in people with asthma and chronic obstructive disease, with paired bronchodilator pre-treatment, designed to find out who reacts and why.',
          dependsOnStepId: 'nac-w4',
          reagentsAndBuffer:
            'Nebulised 10% and 20% acetylcysteine against matched saline control, serial FEV1 in patients with documented asthma and with COPD, paired arms with and without pre-treatment bronchodilator, rescue nebulised beta-agonist available throughout',
        },
      ],
    },
    keyAudits: [
      {
        id: 'nac-a1',
        category: 'measured',
        title: 'As a paracetamol antidote it is one of the clearest wins in medicine',
        laymanSummary:
          'Across 2,540 treated overdoses, liver injury occurred in 6% of at-risk patients treated within ten hours and 26% of those treated between ten and twenty-four hours. Nobody clearly died of paracetamol if the antidote was started within sixteen hours.',
        technicalDetails:
          'The national multicentre study analysed outcomes in 2,540 patients treated with oral acetylcysteine — a 140 mg/kg loading dose followed four hours later by 70 mg/kg every four hours for 17 further doses — out of 11,195 reported suspected overdoses between 1976 and 1985. Hepatotoxicity developed in 6.1% of patients at probable risk when acetylcysteine was started within 10 hours of ingestion and in 26.4% when it began 10 to 24 hours afterwards. Among high-risk patients treated 16 to 24 hours after overdose, hepatotoxicity developed in 41%, lower than in historical controls. Within eight hours the drug was protective regardless of initial plasma acetaminophen concentration, and there was no difference between starting at zero to four or four to eight hours. There were 11 deaths among 2,540 patients (0.43%), and in the nine fatal cases with a pre-treatment aminotransferase, it was already elevated. No deaths were clearly caused by acetaminophen in anyone whose treatment began within 16 hours. The mechanism is set out in the label: a small fraction of an acetaminophen dose is oxidised by cytochrome P-450 to a reactive intermediate that conjugates with hepatic glutathione, and after an overdose of 150 mg/kg or greater the conjugation pathways saturate and glutathione is depleted. Acetylcysteine supplies the cysteine to rebuild it.',
        evidenceSource:
          'Smilkstein MJ, Knapp GL, Kulig KW, Rumack BH. Efficacy of oral N-acetylcysteine in the treatment of acetaminophen overdose. Analysis of the national multicenter study (1976 to 1985). N Engl J Med 1988;319:1557-1562; acetylcysteine solution label, Clinical Pharmacology (Antidotal)',
        doi: '10.1056/NEJM198812153192401',
        measuredMetric:
          'Incidence of hepatotoxicity by time from ingestion to start of treatment, in patients at probable and high risk',
        auditFlag: 'verified',
      },
      {
        id: 'nac-a2',
        category: 'inferred',
        title: 'The best-evidenced drug in this file has never had a placebo-controlled trial',
        laymanSummary:
          'The 2,540-patient study that established the antidote was uncontrolled, compared against historical rates. No randomised trial was run, because by the time anyone could have, withholding it would have been unethical.',
        technicalDetails:
          'The national multicentre study was an open series of patients treated during the investigational use of oral acetylcysteine, analysed by initial plasma acetaminophen concentration and by delay to treatment, with comparison to historical controls for the high-risk late-treatment group. There is no randomised placebo-controlled trial of acetylcysteine for acetaminophen overdose and there never will be. This is not a criticism — it is the correct outcome, and the effect size and the dose-timing gradient are about as convincing as uncontrolled data can be. It is included as an audit because it sets the standard by which the rest of this page should be read. Where the mechanism is specific, stoichiometric and matched to a defined toxin, historical-control evidence has been enough to make a drug standard of care worldwide. Where the mechanism is the general claim that an antioxidant should help, three large randomised trials have been run and all three were negative.',
        evidenceSource:
          'Smilkstein MJ et al., N Engl J Med 1988;319:1557-1562 — study design and comparison to historical controls',
        doi: '10.1056/NEJM198812153192401',
        inferredClaim:
          'That the antidote benefit is causal — an inference from an uncontrolled series with a strong dose-timing gradient, universally accepted and never randomised',
        auditFlag: 'verified',
      },
      {
        id: 'nac-a3',
        category: 'failed',
        title: 'In COPD, three years of treatment changed nothing',
        laymanSummary:
          'Five hundred and twenty-three people with chronic obstructive lung disease took acetylcysteine or placebo for three years. Lung function declined at the same rate and they had the same number of flare-ups.',
        technicalDetails:
          'BRONCUS randomised 523 patients with COPD across 50 centres to 600 mg daily acetylcysteine or placebo, followed for three years, with co-primary outcomes of yearly FEV1 decline and exacerbations per year, analysed by intention to treat. The yearly rate of FEV1 decline was 54 mL (SE 6) on acetylcysteine against 47 mL (SE 6) on placebo — a difference in slope of 8 mL (SE 9), 95% CI -25 to 10, favouring neither. Exacerbations per year were 1.25 (SD 1.35) against 1.29 (SD 1.46), hazard ratio 0.99 (95% CI 0.89 to 1.10, p=0.85). The authors concluded acetylcysteine is ineffective at preventing deterioration in lung function and preventing exacerbations in COPD. A subgroup analysis suggested exacerbations might be reduced in patients not taking inhaled corticosteroids, and a secondary analysis suggested an effect on hyperinflation — both are the kind of finding that appears when a primary endpoint is flat, and neither has been confirmed in a trial designed to test it.',
        evidenceSource:
          'Decramer M, Rutten-van Mölken M, Dekhuijzen PN, et al. Effects of N-acetylcysteine on outcomes in chronic obstructive pulmonary disease (BRONCUS): a randomised placebo-controlled trial. Lancet 2005;365:1552-1560',
        doi: '10.1016/S0140-6736(05)66456-2',
        measuredMetric: 'Yearly rate of FEV1 decline and exacerbations per year over three years',
        auditFlag: 'verified',
      },
      {
        id: 'nac-a4',
        category: 'conclusion_shift',
        title: 'In pulmonary fibrosis the standard regimen was killing people',
        laymanSummary:
          'Prednisone, azathioprine and acetylcysteine was the accepted treatment for idiopathic pulmonary fibrosis. When it was finally tested against placebo, the trial was stopped early: eight deaths against one, twenty-three hospitalisations against seven. Acetylcysteine on its own was then tested and did nothing.',
        technicalDetails:
          'PANTHER-IPF randomised patients with idiopathic pulmonary fibrosis and mild to moderate lung-function impairment 1:1:1 to prednisone plus azathioprine plus acetylcysteine, to acetylcysteine alone, or to placebo, with the primary outcome being change in forced vital capacity over 60 weeks. At a planned interim analysis with about half the data collected — 77 patients on combination therapy and 78 on placebo — the combination arm had 8 deaths against 1 (p=0.01) and 23 hospitalisations against 7 (p<0.001), with no evidence of physiological or clinical benefit, and the independent data and safety monitoring board recommended termination of that arm. The trial continued as a two-group study without other changes: 133 on acetylcysteine and 131 on placebo. At 60 weeks the change in forced vital capacity was -0.18 L against -0.19 L (p=0.77), with no significant difference in death (4.9% against 2.5%, p=0.30) or acute exacerbation (2.3% in each group). A regimen used as standard of care for years turned out to be actively harmful in two of its three components, and the third did nothing.',
        evidenceSource:
          'Idiopathic Pulmonary Fibrosis Clinical Research Network. Prednisone, azathioprine, and N-acetylcysteine for pulmonary fibrosis. N Engl J Med 2012;366:1968-1977 (PANTHER-IPF, NCT00650091); and Randomized trial of acetylcysteine in idiopathic pulmonary fibrosis. N Engl J Med 2014;370:2093-2101',
        doi: '10.1056/NEJMoa1113354',
        measuredMetric:
          'Deaths and hospitalisations at the interim analysis, and change in forced vital capacity at 60 weeks',
        auditFlag: 'verified',
      },
      {
        id: 'nac-a5',
        category: 'conclusion_shift',
        title: 'Fifteen years of protecting kidneys, and then a definitive negative trial',
        laymanSummary:
          'Acetylcysteine was given routinely before contrast scans to protect the kidneys. A trial of over five thousand high-risk patients found no difference in death, dialysis or kidney function at ninety days.',
        technicalDetails:
          'PRESERVE randomised 5,177 patients at high risk of renal complications scheduled for angiography, in a two-by-two factorial design, to intravenous sodium bicarbonate or sodium chloride and to five days of oral acetylcysteine or placebo; 4,993 were in the modified intention-to-treat analysis. The sponsor stopped the trial after a prespecified interim analysis. The primary composite of death, need for dialysis, or a persistent 50% or greater rise in serum creatinine at 90 days occurred in 114 of 2,495 (4.6%) on acetylcysteine against 112 of 2,498 (4.5%) on placebo, odds ratio 1.02 (95% CI 0.78 to 1.33, p=0.88). There were no significant between-group differences in contrast-associated acute kidney injury either. The authors noted in their own background that both interventions were already widely used without definitive evidence of efficacy. This is the same failure mode as the COPD and fibrosis results: a plausible antioxidant mechanism, a surrogate endpoint that moved in small early studies, wide adoption, and a null result when a properly powered trial measured what patients care about.',
        evidenceSource:
          'Weisbord SD, Gallagher M, Jneid H, et al. Outcomes after Angiography with Sodium Bicarbonate and Acetylcysteine. N Engl J Med 2018;378:603-614 (PRESERVE, NCT01467466)',
        doi: '10.1056/NEJMoa1710933',
        measuredMetric:
          'Composite of death, dialysis or persistent 50% creatinine rise at 90 days, and contrast-associated acute kidney injury',
        auditFlag: 'verified',
      },
      {
        id: 'nac-a6',
        category: 'failed',
        title:
          'The mucolytic indication is a 1963 list, and the drug can close the airway it treats',
        laymanSummary:
          'The list of conditions it is indicated for includes tuberculosis, lung amyloidosis and diagnostic bronchograms. The label also states that inhaling it unpredictably causes airway narrowing in some patients, that you cannot tell in advance who they are, and that tolerating it once does not mean tolerating it again.',
        technicalDetails:
          'The mucolytic indication reads as adjuvant therapy for abnormal, viscid or inspissated mucous secretions in chronic emphysema, emphysema with bronchitis, chronic asthmatic bronchitis, tuberculosis, bronchiectasis, primary amyloidosis of the lung, pneumonia, bronchitis, tracheobronchitis, pulmonary complications of cystic fibrosis, tracheostomy care, pulmonary complications associated with surgery, use during anaesthesia, post-traumatic chest conditions, atelectasis due to mucous obstruction, and diagnostic bronchial studies including bronchograms, bronchospirometry and bronchial wedge catheterisation. None of that list is supported by outcome trials; it is a 1963 indication set that predates the modern efficacy standard. The mechanism paragraph hedges — the sulfhydryl group "probably" opens disulfide linkages. And the same section carries an unusually candid safety statement: patients exposed to inhaled acetylcysteine aerosol occasionally respond with increased airways obstruction of varying and unpredictable severity; those who are reactors cannot be identified a priori from a random patient population; previous reactors may not react next time and previously untroubled patients may react. The population indicated for the drug is, by definition, people with airway disease.',
        evidenceSource:
          'Acetylcysteine solution United States prescribing information, Indications and Usage, Clinical Pharmacology, Warnings and Adverse Reactions',
        measuredMetric:
          'Scope of the mucolytic indication list and the label’s own account of unpredictable bronchospasm in the indicated population',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'One sulfur atom does all the work',
        laymanDesc:
          'Acetylcysteine is the amino acid cysteine with a small chemical cap on it. Everything the drug does comes from the sulfur group hanging off the side.',
        molecularDetail:
          'N-acetyl-L-cysteine, molecular weight 163.19, a white crystalline powder melting at 104 to 110 degrees Celsius, supplied as unpreserved 10% or 20% solutions at pH 7.0 with edetate disodium. The solution is oxygen sensitive because the free thiol oxidises to the disulfide dimer diacetylcystine.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'In the airway it never enters a cell at all',
        laymanDesc:
          'Nebulised into the lung, it works on the mucus sitting in the airway, not on the tissue underneath.',
        molecularDetail:
          'Mucus viscosity depends on mucoprotein concentration and, to a lesser extent, DNA, the latter rising with purulence from cellular debris. Acetylcysteine acts extracellularly on the mucin polymer. Its activity is unaltered by the presence of DNA and increases with pH, with significant mucolysis between pH 7 and 9.',
        iconName: 'Wind',
        visualStage: 'delivery',
      },
      {
        step: 3,
        title: 'It cuts the bridges holding mucus together',
        laymanDesc:
          'Long protein chains in mucus are stitched to each other by sulfur-to-sulfur bonds. The drug’s own sulfur breaks those stitches and the mucus thins.',
        molecularDetail:
          'The label attributes mucolysis to the sulfhydryl group, which it says probably opens disulfide linkages in mucus, lowering viscosity. The hedge is in the original text and has never been removed. Whether thinner mucus changes any clinical outcome is a separate question the indication list does not answer.',
        iconName: 'Scissors',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'Swallowed or infused, it is taken apart and rebuilt as glutathione',
        laymanDesc:
          'The body strips the cap off and uses the cysteine to make glutathione, the molecule the liver needs to neutralise the toxic by-product of a paracetamol overdose.',
        molecularDetail:
          'Rapid deacetylation in vivo yields cysteine, the rate-limiting substrate for glutathione synthesis. After an overdose of 150 mg/kg or more of acetaminophen, sulfate and glucuronide conjugation saturate and cytochrome P-450 produces enough reactive intermediate to deplete hepatic glutathione; the intermediate then binds hepatocyte macromolecules. Restoring glutathione restores conjugation to the non-toxic cysteine and mercapturic acid derivatives excreted by the kidney.',
        iconName: 'Filter',
        visualStage: 'cellular_entry',
      },
      {
        step: 5,
        title: 'The liver is protected, and the clock decides how well',
        laymanDesc:
          'Started within eight hours it works whatever the blood level. Started later, the protection falls away.',
        molecularDetail:
          'Hepatotoxicity in 6.1% of at-risk patients treated within 10 hours against 26.4% at 10 to 24 hours; 41% in high-risk patients treated at 16 to 24 hours, still below historical controls. Protective regardless of initial plasma acetaminophen concentration within eight hours, with no difference between starting at zero to four and four to eight hours.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Everywhere else the antioxidant argument has failed',
        laymanDesc:
          'Three big randomised trials in three organs — lungs in COPD, lungs in fibrosis, kidneys after a scan — and none of them found a benefit.',
        molecularDetail:
          'COPD over three years: FEV1 decline 54 against 47 mL per year, exacerbations HR 0.99 (95% CI 0.89 to 1.10). Idiopathic pulmonary fibrosis over 60 weeks: FVC change -0.18 against -0.19 L, p=0.77. Contrast angiography at 90 days: composite of death, dialysis or persistent creatinine rise 4.6% against 4.5%, OR 1.02 (95% CI 0.78 to 1.33).',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'National multicentre oral acetylcysteine series 1976-1985 (N Engl J Med 1988;319:1557-1562)',
        phase: 'Open, uncontrolled multicentre series with historical-control comparison',
        sampleSize: 2540,
        primaryEndpoint:
          'Incidence of hepatotoxicity after acetaminophen overdose, by risk category and by interval from ingestion to treatment',
        endpointMet: true,
        statisticalPValue:
          'Hepatotoxicity 6.1% at probable risk when treated within 10 hours against 26.4% at 10 to 24 hours; 41% in high-risk patients treated at 16 to 24 hours against higher historical-control rates; 11 deaths among 2,540 (0.43%)',
        unreportedAdverseSignals:
          'There was no randomised placebo arm and there never has been. The comparison for the late high-risk group is historical controls. The dose-timing gradient is what carries the causal inference, and it is strong, but the design is not one that would satisfy a modern regulator for a new drug.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'BRONCUS (Lancet 2005;365:1552-1560)',
        phase: 'Phase 3, randomised, placebo-controlled, 50 centres, 3 years',
        sampleSize: 523,
        primaryEndpoint:
          'Yearly reduction in FEV1 and number of exacerbations per year in chronic obstructive pulmonary disease',
        endpointMet: false,
        statisticalPValue:
          'FEV1 decline 54 mL (SE 6) against 47 mL (SE 6), slope difference 8 mL (SE 9), 95% CI -25 to 10; exacerbations 1.25 (SD 1.35) against 1.29 (SD 1.46) per year, HR 0.99 (95% CI 0.89 to 1.10), p=0.85',
        unreportedAdverseSignals:
          'Subgroup analysis suggested exacerbations might fall in patients not on inhaled corticosteroids, and a secondary analysis suggested an effect on hyperinflation. Both are post-hoc findings from a trial whose co-primary endpoints were flat, and neither has been confirmed in a trial built to test it.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'PANTHER-IPF (NCT00650091, N Engl J Med 2012;366:1968-1977 and 2014;370:2093-2101)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, three arms then two',
        sampleSize: 264,
        primaryEndpoint:
          'Change in forced vital capacity over 60 weeks in idiopathic pulmonary fibrosis with mild to moderate impairment',
        endpointMet: false,
        statisticalPValue:
          'Acetylcysteine alone against placebo at 60 weeks: FVC -0.18 L against -0.19 L, p=0.77; death 4.9% against 2.5%, p=0.30; acute exacerbation 2.3% in each group',
        unreportedAdverseSignals:
          'The three-drug arm was terminated at interim analysis for 8 deaths against 1 (p=0.01) and 23 hospitalisations against 7 (p<0.001) with no evidence of benefit. The regimen stopped had been widely used as standard care for idiopathic pulmonary fibrosis before the trial ran.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'PRESERVE (NCT01467466, N Engl J Med 2018;378:603-614)',
        phase: 'Phase 3, randomised, two-by-two factorial, placebo-controlled, stopped at interim',
        sampleSize: 5177,
        primaryEndpoint:
          'Composite of death, need for dialysis, or persistent increase of at least 50% from baseline in serum creatinine at 90 days after angiography',
        endpointMet: false,
        statisticalPValue:
          '114 of 2,495 (4.6%) on acetylcysteine against 112 of 2,498 (4.5%) on placebo; odds ratio 1.02 (95% CI 0.78 to 1.33), p=0.88; no significant difference in contrast-associated acute kidney injury',
        unreportedAdverseSignals:
          'The trial’s own background states that both interventions were already widely used without definitive evidence of efficacy. The practice preceded the evidence by roughly fifteen years, and the evidence, when it came, was null.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Hepatotoxicity in 6.1% of at-risk patients treated within 10 hours of acetaminophen overdose against 26.4% treated at 10 to 24 hours, in 2,540 patients',
        'No difference in yearly FEV1 decline or exacerbation rate in 523 COPD patients over three years',
        'No difference in forced vital capacity change at 60 weeks in idiopathic pulmonary fibrosis (-0.18 against -0.19 L, p=0.77)',
        'No difference in death, dialysis or persistent creatinine rise at 90 days after angiography in 4,993 patients (OR 1.02)',
        'Eight deaths against one and 23 hospitalisations against seven in the prednisone-azathioprine-acetylcysteine arm at interim analysis',
      ],
      unsupportedInferences: [
        'That being a glutathione precursor and an antioxidant translates into benefit wherever oxidative stress is implicated — tested on hard endpoints in three organs and negative in all three',
        'That thinner mucus is a clinical benefit, which the 1963 mucolytic indication list assumes and no outcome trial has shown',
        'That the BRONCUS subgroup of patients not on inhaled corticosteroids identifies a responsive population, on a post-hoc analysis of a flat primary endpoint',
        'That routine pre-angiography dosing protects kidneys, a practice adopted for roughly fifteen years before the definitive trial found nothing',
      ],
      whatFailedInitially: [
        'COPD: three years of treatment changed neither lung function decline nor exacerbations',
        'Idiopathic pulmonary fibrosis: the standard three-drug regimen was stopped for excess death and hospitalisation, and acetylcysteine alone then did nothing',
        'Contrast-associated kidney injury: null on every endpoint in the largest trial ever run on the question',
        'The inhaled mucolytic itself can produce unpredictable, sometimes severe airway obstruction in the patients it is indicated for, and the label says reactors cannot be identified in advance',
      ],
      realWorldOutcome: [
        'On the WHO Model List of Essential Medicines as an antidote, and standard of care for paracetamol overdose everywhere',
        'Generic since 1994 for the solution, with the intravenous ACETADOTE approved in 2004 under NDA 021539',
        'Sold over the counter as a cough remedy in much of Europe and as a dietary supplement in the United States — three regulatory identities and three evidence standards for one molecule',
        'The clearest illustration in this file of the difference between a mechanism you can write as an equation and a mechanism you can only write as a hypothesis',
      ],
    },
    deliverySystem: {
      type: 'Sterile unpreserved 10% and 20% solution for nebulisation, direct instillation or oral administration; a separate intravenous formulation for the antidote indication; and effervescent tablets',
      description:
        'Each millilitre of the 10% solution contains 100 mg of acetylcysteine and 0.25 mg of edetate disodium; the 20% contains 200 mg and 0.5 mg. pH is adjusted to 7.0 within a 6.0 to 7.5 range with sodium hydroxide and, if needed, hydrochloric acid. The solution is oxygen sensitive and not for injection. Continued nebulisation with a dry gas concentrates the drug by evaporation, which the label says can impede delivery and should be corrected by dilution with sterile water.',
      safetyProfile:
        'Contraindicated only in known sensitivity. Inhaled acetylcysteine can produce increased airways obstruction of varying and unpredictable severity; reactors cannot be identified in advance and prior tolerance does not predict future tolerance. Asthmatics must be watched carefully, bronchodilator relief is usually rapid, and progression requires immediate discontinuation. Liquefied secretions may need mechanical suction if cough is inadequate. Reported effects include stomatitis, nausea, vomiting, fever, rhinorrhoea, drowsiness, clamminess, chest tightness and bronchoconstriction. Oral dosing in the large amounts needed for overdose commonly causes nausea and vomiting. Generalised urticaria has been observed rarely with oral use for overdose, and treatment should stop unless it is essential and the symptoms can be controlled. If hepatic encephalopathy becomes evident the label directs discontinuation to avoid further nitrogenous load.',
    },
    commonQuestions: [
      {
        q: 'Why does the same drug work brilliantly for overdose and not at all for lung disease?',
        a: 'Because the two uses rest on completely different kinds of claim. In a paracetamol overdose there is a specific toxic molecule, a specific detoxifying molecule that has run out, and a drug that supplies the missing raw material — the mechanism can be written as a chemical equation and the benefit follows a clean gradient with how quickly treatment starts. In COPD, pulmonary fibrosis and contrast kidney injury, the argument is that acetylcysteine is an antioxidant and that oxidative stress is involved in the disease. That is a hypothesis about a whole biological process rather than a stoichiometric fix, and when it was tested on endpoints patients care about — 523 patients over three years, 264 patients over 60 weeks, 4,993 patients over 90 days — it produced nothing in any of them.',
        auditNote:
          'Three negative trials in three organs is unusually clean evidence about a class of reasoning, not just about a drug. It is the strongest argument on this site against inferring a clinical benefit from an antioxidant mechanism.',
      },
      {
        q: 'How quickly does the overdose antidote need to be given?',
        a: 'Fast, and the numbers are stark. In the 2,540-patient national series, hepatotoxicity developed in 6.1% of at-risk patients when acetylcysteine was started within 10 hours of ingestion and in 26.4% when it was started between 10 and 24 hours. Within eight hours it was protective regardless of the blood paracetamol level, and there was no difference between starting immediately and starting at eight hours. No death was clearly attributable to paracetamol in anyone whose treatment began within 16 hours. The label’s instruction is that it is essential to begin as soon as possible and in any case within 24 hours. The hard part is that a paracetamol overdose causes almost no symptoms during exactly the window when the antidote works best.',
      },
      {
        q: 'Is it worth taking for a chest infection or thick phlegm?',
        a: 'The evidence does not support it and the label contains a warning worth knowing about. The mucolytic indication dates from 1963 and lists conditions — tuberculosis, primary amyloidosis of the lung, diagnostic bronchograms — that reflect an era before efficacy had to be demonstrated; no outcome trial supports any of it, and the label itself only says the sulfhydryl group "probably" opens the disulfide bonds in mucus. More importantly, the same section records that inhaling acetylcysteine occasionally causes increased airway obstruction of unpredictable severity, that the people who will react cannot be identified in advance, and that having tolerated it before does not mean you will tolerate it again. The population it is indicated for is people with airway disease.',
      },
      {
        q: 'It is sold as a supplement. Is that the same thing?',
        a: 'It is the same molecule with a different regulatory identity. In the United States acetylcysteine is a prescription drug for two indications, is also sold as a dietary supplement, and in much of Europe is an over-the-counter effervescent tablet for coughs. Nothing about the chemistry changes between those three; what changes is what has to be proved before it can be sold and what may be claimed for it. The supplement channel in particular carries claims — antioxidant support, liver support, respiratory health — that are downstream of the same antioxidant hypothesis that failed in COPD, in pulmonary fibrosis and in contrast nephropathy when it was tested properly.',
      },
      {
        q: 'What happened with the pulmonary fibrosis treatment?',
        a: 'It is one of the more sobering stories in respiratory medicine. Prednisone plus azathioprine plus acetylcysteine was widely used as standard treatment for idiopathic pulmonary fibrosis. When it was finally randomised against placebo, a planned interim analysis with about half the data — 77 patients on the combination and 78 on placebo — found 8 deaths against 1 (p=0.01) and 23 hospitalisations against 7 (p<0.001), with no sign of benefit, and the safety monitoring board recommended stopping that arm. The trial then continued as acetylcysteine alone against placebo in 264 patients, and at 60 weeks the change in vital capacity was -0.18 litres against -0.19, p=0.77. A treatment that had been given for years turned out to be harmful in two of its three parts and inert in the third.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Acetylcysteine solution United States prescribing information — Description, Clinical Pharmacology (mucolytic and antidotal), Indications and Usage, Contraindications, Warnings, Precautions, Adverse Reactions',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22ACETYLCYSTEINE%22',
        kind: 'regulatory',
      },
      {
        label:
          'Smilkstein MJ, Knapp GL, Kulig KW, Rumack BH. Efficacy of oral N-acetylcysteine in the treatment of acetaminophen overdose. Analysis of the national multicenter study (1976 to 1985). N Engl J Med 1988;319:1557-1562',
        identifier: '10.1056/NEJM198812153192401',
        kind: 'doi',
      },
      {
        label:
          'Decramer M, Rutten-van Mölken M, Dekhuijzen PN, et al. Effects of N-acetylcysteine on outcomes in chronic obstructive pulmonary disease (Bronchitis Randomized on NAC Cost-Utility Study, BRONCUS): a randomised placebo-controlled trial. Lancet 2005;365:1552-1560',
        identifier: '10.1016/S0140-6736(05)66456-2',
        kind: 'doi',
      },
      {
        label:
          'Idiopathic Pulmonary Fibrosis Clinical Research Network. Prednisone, azathioprine, and N-acetylcysteine for pulmonary fibrosis. N Engl J Med 2012;366:1968-1977',
        identifier: '10.1056/NEJMoa1113354',
        kind: 'doi',
      },
      {
        label:
          'Idiopathic Pulmonary Fibrosis Clinical Research Network. Randomized trial of acetylcysteine in idiopathic pulmonary fibrosis. N Engl J Med 2014;370:2093-2101',
        identifier: '10.1056/NEJMoa1401739',
        kind: 'doi',
      },
      {
        label:
          'Weisbord SD, Gallagher M, Jneid H, et al. Outcomes after Angiography with Sodium Bicarbonate and Acetylcysteine. N Engl J Med 2018;378:603-614 (PRESERVE)',
        identifier: '10.1056/NEJMoa1710933',
        kind: 'doi',
      },
      {
        label:
          'Elkins MR, Robinson M, Rose BR, et al. A controlled trial of long-term inhaled hypertonic saline in patients with cystic fibrosis. N Engl J Med 2006;354:229-240',
        identifier: '10.1056/NEJMoa043900',
        kind: 'doi',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — acetylcysteine, 23 listed products, effective 23 April 2025',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 12035 — acetylcysteine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/12035',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 10. Epinephrine — no contraindications, no randomised trial, a one-sentence mechanism section,
  //     and a device that throws away 1.7 of the 2 mL it holds.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'epinephrine',
    name: 'Epinephrine',
    tradeName: 'EpiPen / Auvi-Q / Adrenalin / neffy',
    sponsor:
      'The molecule was isolated at the turn of the twentieth century and has never been under patent. What has been under patent is the delivery device: EpiPen was approved on 22 December 1987 under NDA 019430, classified Type 5 — New Formulation or New Manufacturer, and the registration now sits with Viatris. neffy, the nasal spray, was approved on 9 August 2024 under NDA 214697.',
    targetGene:
      'ADRA1A, ADRA1B, ADRB1 and ADRB2 among others — epinephrine is non-selective and engages every adrenergic receptor subtype at once, which is precisely why it works in anaphylaxis',
    targetProtein:
      'Alpha- and beta-adrenergic receptors. The mechanism of action section of the EpiPen label is one sentence long: epinephrine acts on both alpha- and beta-adrenergic receptors.',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1948,
    indication:
      'Emergency treatment of allergic reactions (Type I) including anaphylaxis to stinging and biting insects, allergen immunotherapy, foods, drugs, diagnostic testing substances and other allergens, as well as idiopathic and exercise-induced anaphylaxis, for immediate administration in patients determined to be at increased risk',
    patientFriendlyIndication: 'A severe allergic reaction — the adrenaline pen',
    anatomicalSite:
      'Every adrenergic receptor in the body at once: alpha-1 on blood vessels, beta-1 on the heart, beta-2 on airway smooth muscle and mast cells',
    conditionContext: {
      conditionExplainer:
        'Anaphylaxis is mast cells emptying everywhere at the same time. Blood vessels dilate and leak, so blood pressure collapses; the airway swells and the muscle around it squeezes, so breathing stops. It kills within minutes, and the two things killing the patient are opposite problems.',
      whyItMatters:
        'Epinephrine is the only drug that reverses both. Alpha-1 stimulation tightens the leaking vessels and reduces the swelling; beta-2 opens the airway and damps further mast cell release; beta-1 supports the heart. Nothing else in the allergy cabinet does any of that, which is why an antihistamine and a steroid are not alternatives — they are what people take while the anaphylaxis continues.',
      whoTakesThis:
        'People at risk of severe allergic reactions, carrying an auto-injector; and anyone in an emergency department, ambulance or clinic where anaphylaxis occurs.',
      clinicalGoals:
        'Reverse the reaction and get to hospital. The label is explicit that the device is emergency supportive therapy only and not a substitute for immediate medical care.',
    },
    oneSentenceVerdict:
      'The only drug that reverses both the airway obstruction and the circulatory collapse of anaphylaxis, for which a Cochrane review searching every major database found no randomised trial that met its inclusion criteria and concluded none is likely to be ethical — sold in a device that holds 2 mL and delivers 0.3, at US$141.85 a unit at pharmacy acquisition cost for a molecule that has never been patented.',
    laymanHowItWorks:
      'In anaphylaxis two things go wrong at once: blood vessels leak until blood pressure fails, and the airway swells shut. Adrenaline is one of the few molecules that fixes both, because it is not selective — it hits every adrenaline receptor there is. On blood vessels it tightens them, so pressure comes back and the swelling in the throat retreats. On the airway muscle it relaxes the squeeze. On the heart it increases output. And it partly shuts down the mast cells that are still firing. Injected into the thigh muscle it starts working within minutes, and that is the whole treatment.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 72,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$141.85 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 24 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'The molecule has been off patent for the whole of living memory and costs almost nothing to make; a millilitre of epinephrine solution in a glass vial is one of the cheapest things in a hospital. What costs money is the auto-injector, and the label states its own arithmetic: each EpiPen contains 2 mL of epinephrine solution, delivers 0.3 mL, and approximately 1.7 mL remains in the device after activation, is not available for future use, and should be discarded. In 2017 Mylan resolved False Claims Act allegations for US$465 million, relating to the classification of EpiPen and EpiPen Jr as generic rather than brand products for the purposes of the Medicaid Drug Rebate Program, with no admission or finding of wrongdoing.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'There is no substitute for epinephrine in anaphylaxis, and the most dangerous idea in this entire file is that there might be. Antihistamines and corticosteroids are listed below not as alternatives but because they are what people reach for instead, and because reaching for them is one of the mechanisms by which anaphylaxis becomes fatal. The genuine choices are between routes and devices: auto-injector, nasal spray or a vial and syringe, which differ enormously in price and not at all in the molecule.',
      conventionalRx: [
        {
          name: 'Epinephrine 1 mg/mL solution in a vial, drawn into a syringe',
          class: 'The identical drug, without the device',
          howItCompares:
            'Chemically indistinguishable and a fraction of the cost. What the auto-injector buys is not pharmacology but the ability of a frightened person, or a bystander, to deliver a correct intramuscular dose into the thigh in seconds without drawing up, calculating or aiming. The fatal-reactions register is a reminder of how often that fails even with a device: in a national series of fatal anaphylaxis, adrenaline was used in 62% of cases but given before cardiorespiratory arrest in only 14%.',
          typicalCost:
            'Not separately listed in the acquisition-cost extract used on this page; the vial form is a small multiple of the cost of the sterile water it is dissolved in',
          prosAndCons:
            'Pros: negligible cost; dose flexibility the fixed-dose device does not have. Cons: requires training, equipment and calm; unsuitable for self-administration by a patient in shock.',
        },
        {
          name: 'Epinephrine nasal spray (neffy)',
          class: 'The same molecule by a non-injected route',
          howItCompares:
            'Approved on 9 August 2024 as the first non-injected epinephrine product. Its approval rests on four studies in 175 healthy adults without anaphylaxis, measuring blood epinephrine concentrations after the spray against approved injection products and showing comparable concentrations and similar rises in blood pressure and heart rate. Its label warns that nasal polyps or a history of nasal surgery may affect absorption and that such patients should consider an injectable product.',
          typicalCost: 'Not listed in the acquisition-cost survey used on this page',
          prosAndCons:
            'Pros: removes the needle, which the FDA cited as a reason people, particularly children, delay treatment. Cons: no efficacy data in anyone actually having anaphylaxis, and absorption depends on a nasal mucosa that anaphylaxis itself is swelling.',
        },
        {
          name: 'Antihistamines and corticosteroids — not substitutes',
          class: 'H1 antagonists and systemic glucocorticoids',
          howItCompares:
            'Listed because they are what gets given instead. Neither reverses airway obstruction or restores blood pressure, neither acts within the minutes available, and neither has been shown to prevent progression. An oral steroid takes hours to change transcription; an antihistamine blocks one mediator out of many, at receptors on vessels rather than on the airway muscle that is closing. In a national fatal anaphylaxis series the median time to respiratory or cardiac arrest was 30 minutes for food reactions, 15 for venom and 5 for iatrogenic ones.',
          typicalCost:
            'Diphenhydramine US$0.0444 per unit and prednisone US$0.0560 per tablet at United States pharmacy acquisition cost (CMS NADAC, medians across 120 and 118 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: reasonable adjuncts after epinephrine has been given, for urticaria and itch. Cons: taking one of these instead of epinephrine, or before it, is a recognised route to a fatal outcome.',
        },
      ],
      naturalFoods: [
        {
          name: 'None — and this is the one page in this file where that matters',
          activeCompound: 'No dietary compound acts at adrenergic receptors at therapeutic potency',
          biologicalMechanism:
            'Nothing available in a kitchen produces alpha-1 vasoconstriction and beta-2 bronchodilation within minutes. Ephedra-containing preparations act on the same system indirectly and are both far weaker and far less predictable, and are not a treatment for anaphylaxis under any circumstances.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'Not stated here as advice, because there is no advice to give. This row exists to be explicit: there is no natural, dietary or home alternative to adrenaline in anaphylaxis, and the correct action is the injector and an ambulance.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Use it early and call an ambulance anyway',
          action:
            'Give the injection at the first sign of a severe reaction, then seek emergency care.',
          patientImpact:
            'The label states the device is intended for immediate administration as emergency supportive therapy only and is not a substitute for immediate medical care, and that in conjunction with administration the patient should seek immediate medical or hospital care. In a national register of fatal anaphylaxis, adrenaline was used in 62% of fatal reactions but given before arrest in only 14%, and 28% of fatal cases were resuscitated only to die between three hours and 30 days later, mostly of hypoxic brain damage.',
          clinicalPrecaution:
            'The label directs that more than two sequential doses be given only under direct medical supervision. The same register records that adrenaline overdose caused at least three deaths, so more is not automatically better.',
        },
        {
          name: 'Outer thigh only — never the buttock, the hand or a vein',
          action: 'Inject into the outer thigh, through clothing if necessary.',
          patientImpact:
            'The label states EpiPen should only be injected into the anterolateral thigh. Injection into the buttock may not treat anaphylaxis effectively and has been associated with clostridial gas gangrene, which alcohol cleansing does not prevent because it does not kill bacterial spores. Injection into digits, hands or feet may cause loss of blood flow. Accidental intravenous injection or a large dose may cause cerebral haemorrhage from a sharp rise in blood pressure.',
          clinicalPrecaution:
            'For young children the label directs holding the leg firmly and limiting movement before and during injection, to reduce laceration and embedded-needle injuries. Rare serious skin and soft tissue infections after injection are also recorded.',
        },
        {
          name: 'Check the window: pink or brown means replace it',
          action: 'Look at the solution through the clear window periodically.',
          patientImpact:
            'The label states that epinephrine solution deteriorates rapidly on exposure to air or light, turning pink from oxidation to adrenochrome and brown from the formation of melanin, and directs replacement if the solution appears discoloured, cloudy or contains particles.',
          clinicalPrecaution:
            'The device also has an expiry date, and the sensible reading of the label is that a discoloured in-date device and a clear expired one are both reasons to obtain a replacement rather than to rely on it.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CNC[C@@H](C1=CC(=C(C=C1)O)O)O',
      chemicalFormula: 'C9H13NO3',
      molecularWeight: '183.20 g/mol',
      targetReceptorAffinity:
        'A catecholamine with a catechol ring, a benzylic hydroxyl and a secondary methylamine, and the physiologically active form is the (R)- or laevorotatory enantiomer; the label names it (-)-3,4-dihydroxy-alpha-[(methylamino)methyl]benzyl alcohol. It is non-selective across alpha and beta receptors, which is the property no other single agent in the allergy cabinet has. The catechol ring is also why it is unstable: the solution deteriorates rapidly on exposure to air or light, oxidising first to adrenochrome, which is pink, then forming brown melanin. The EpiPen solution is buffered to pH 2.2 to 5.0 with hydrochloric acid and stabilised with 0.5 mg of sodium metabisulfite per 0.3 mL; the label states the presence of a sulfite should not deter use.',
      structureSource: {
        label:
          'PubChem CID 5816 (epinephrine) — canonical SMILES, molecular formula and weight, as carried on the enriched record; chemical name, solution composition, pH range and degradation chemistry from the EPIPEN United States prescribing information, section 11',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5816',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'epi-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Measure adrenochrome, not just epinephrine',
          description:
            'The degradation product is the informative analyte. Epinephrine oxidises through pink adrenochrome to brown melanin on exposure to air or light, and the label makes discolouration the patient-facing failure test. A release and stability programme built on epinephrine assay alone will report a passing batch that a patient would correctly discard.',
          reagentsAndBuffer:
            'Epinephrine bitartrate reference standard, reversed-phase ion-pair HPLC with electrochemical or ultraviolet detection, adrenochrome and adrenaline sulfonate as specified degradants, headspace oxygen measurement, photostability testing under ICH Q1B conditions',
        },
        {
          id: 'epi-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Resolve the laevorotatory enantiomer',
          description:
            'Only the (R)-(-) enantiomer carries the physiological potency, and the racemate is roughly half as active. Synthetic epinephrine is resolved rather than made asymmetrically in most processes, which means half the material is discarded — a rare case where the cost of goods argument for a chiral drug is real, and still negligible against the price of the device.',
          dependsOnStepId: 'epi-w1',
          reagentsAndBuffer:
            'Catechol-derived chloroacetophenone precursor, methylamine, catalytic hydrogenation, resolution with (+)-tartaric acid, recrystallisation of the bitartrate, polarimetry to confirm laevorotation',
        },
        {
          id: 'epi-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Formulate at acid pH with a sulfite antioxidant',
          description:
            'The finished solution is deliberately acidic — pH 2.2 to 5.0 — and carries sodium metabisulfite, because a neutral unprotected catecholamine solution would discolour on the shelf. The sulfite is a known allergen in a product used to treat allergy, and the label addresses that head on by stating that its presence should not deter use.',
          dependsOnStepId: 'epi-w2',
          reagentsAndBuffer:
            'Sodium chloride for tonicity, sodium metabisulfite as antioxidant, hydrochloric acid for pH adjustment, water for injection, nitrogen overlay, amber or light-protective secondary packaging',
        },
        {
          id: 'epi-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Verify needle length reaches muscle in the intended population',
          description:
            'The device is a fixed-dose, fixed-needle-length product used by people of every body habitus, and the label restricts injection to the anterolateral thigh because that is where the pharmacokinetic evidence was generated. Whether the needle reaches muscle in a given patient is a device question that the pharmacology assumes and does not test.',
          dependsOnStepId: 'epi-w3',
          reagentsAndBuffer:
            'Ultrasound measurement of skin-to-muscle and skin-to-bone distance at the anterolateral thigh across a representative body mass index range, auto-injector needle length and penetration depth under simulated activation force, tissue phantom validation',
        },
        {
          id: 'epi-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Read plasma concentration and the two haemodynamic effects together',
          description:
            'Because no efficacy trial in anaphylaxis is possible, every new epinephrine product is bridged on pharmacokinetics plus pharmacodynamics. The nasal spray was approved on exactly this: four studies in 175 healthy adults without anaphylaxis, showing comparable epinephrine blood concentrations and similar increases in blood pressure and heart rate against approved injection products.',
          dependsOnStepId: 'epi-w4',
          reagentsAndBuffer:
            'Serial plasma sampling with LC-MS/MS quantification against a stable-isotope internal standard, continuous non-invasive blood pressure and heart rate monitoring, crossover design against an approved intramuscular comparator, baseline endogenous catecholamine correction',
        },
      ],
    },
    keyAudits: [
      {
        id: 'epi-a1',
        category: 'inferred',
        title: 'There is no randomised trial, and there is not going to be one',
        laymanSummary:
          'A Cochrane review searched every major medical database, the trial registries and the manufacturers, looking for a randomised trial of adrenaline in anaphylaxis. It found none. Its authors concluded such a trial would probably be unethical.',
        technicalDetails:
          'The Cochrane review of adrenaline for the treatment of anaphylaxis with and without shock searched CENTRAL, MEDLINE, EMBASE, CINAHL, BIOSIS, ISI Web of Knowledge and LILACS, plus three trial registries, and contacted pharmaceutical companies and international experts for unpublished material. Its inclusion criteria were randomised and quasi-randomised controlled trials comparing adrenaline with no intervention, placebo or another adrenergic agonist. Its main results section reads, in full: we found no studies that satisfied the inclusion criteria. The authors concluded they were unable to make any new recommendations, that trials of high methodological quality are needed to define the true extent of benefit, that such trials are unlikely to be performed and might be unethical because prompt treatment is deemed critically important for survival, and that they would be difficult to conduct because anaphylaxis occurs without warning, usually in non-medical settings, and varies in severity between and within individuals. The fatal-reactions register reached the same conclusion independently: the unpredictability of anaphylaxis and the need for immediate, often improvised treatment make controlled trials impracticable. This is the strongest case in this file for a drug being correctly used on mechanism, pharmacokinetics and observational evidence alone — and it is supported by the available observational and mechanistic evidence.',
        evidenceSource:
          'Sheikh A, Shehata YA, Brown SG, Simons FE. Adrenaline (epinephrine) for the treatment of anaphylaxis with and without shock. Cochrane Database Syst Rev 2008;(4):CD006312; Pumphrey RS, Clin Exp Allergy 2000;30:1144-1150',
        doi: '10.1002/14651858.CD006312.pub2',
        inferredClaim:
          'That epinephrine reduces death in anaphylaxis — universally accepted, mechanistically compelling, supported by fatal-case series, and never tested against a control',
        auditFlag: 'verified',
      },
      {
        id: 'epi-a2',
        category: 'measured',
        title: 'The thigh beat the arm, in eleven healthy volunteers',
        laymanSummary:
          'The instruction to inject into the outer thigh rather than the upper arm rests on a crossover study in young men that measured blood adrenaline levels after each route and site.',
        technicalDetails:
          'A prospective, randomised, blinded, placebo-controlled six-way crossover study of intramuscular versus subcutaneous epinephrine in young men found peak plasma epinephrine concentrations significantly higher (p<0.01) after intramuscular injection into the thigh than after either intramuscular or subcutaneous injection into the upper arm, and the authors recommended intramuscular thigh injection as the preferred route and site for initial treatment of anaphylaxis. That recommendation is now in every guideline and in the labelling of every auto-injector — the EpiPen label states the device should only be injected into the anterolateral aspect of the thigh. The evidence underneath it is a pharmacokinetic study in healthy volunteers with no anaphylaxis, using peak plasma concentration as the endpoint. That is the appropriate design given the impossibility of the alternative, and it is also a surrogate: nobody has shown that a higher peak plasma concentration in a healthy young man translates into survival in an anaphylactic one.',
        evidenceSource:
          'Simons FE, Gu X, Simons KJ. Epinephrine absorption in adults: intramuscular versus subcutaneous injection. J Allergy Clin Immunol 2001;108:871-873',
        doi: '10.1067/mai.2001.119409',
        measuredMetric:
          'Peak plasma epinephrine concentration by route and injection site in a six-way crossover',
        auditFlag: 'verified',
      },
      {
        id: 'epi-a3',
        category: 'failed',
        title: 'In fatal anaphylaxis it was given before arrest in one case in seven',
        laymanSummary:
          'A national register of deaths from anaphylaxis found adrenaline was used in 62% of fatal reactions but given before the heart or breathing stopped in only 14%. The median time from reaction to arrest was thirty minutes for food, fifteen for stings and five for reactions to a drug.',
        technicalDetails:
          'A register of all fatal anaphylactic reactions in the United Kingdom traceable from certified cause of death since 1992 recorded approximately 20 deaths a year, about half iatrogenic and a quarter each from food and insect venom. All fatal food reactions caused difficulty breathing, which in 86% led to respiratory arrest; shock predominated in iatrogenic and venom reactions. The median time to respiratory or cardiac arrest was 30 minutes for foods, 15 minutes for venom and 5 minutes for iatrogenic reactions. Twenty-eight per cent of fatal cases were resuscitated but died between 3 hours and 30 days later, mostly from hypoxic brain damage. Adrenaline was used in treatment of 62% of fatal reactions but before arrest in only 14%. The author’s conclusions include three findings that get quoted less often than the timing data: that a few reactions will be fatal whatever treatment is given, so avoidance remains the optimal management; that adrenaline overdose caused at least three deaths and must be avoided; and that self-treatment kits had proved unhelpful for a variety of reasons, with success depending on appropriate medication, ease of use and good training. The last of those is a device finding, not a drug finding, and it is the one the market spent the following two decades not solving.',
        evidenceSource:
          'Pumphrey RS. Lessons for management of anaphylaxis from a study of fatal reactions. Clin Exp Allergy 2000;30:1144-1150',
        doi: '10.1046/j.1365-2222.2000.00864.x',
        measuredMetric:
          'Proportion of fatal anaphylactic reactions in which adrenaline was given, and given before cardiorespiratory arrest, and median time from reaction to arrest by trigger',
        auditFlag: 'caution',
      },
      {
        id: 'epi-a4',
        category: 'conclusion_shift',
        title:
          'A whole new route approved on blood levels in people who were not having a reaction',
        laymanSummary:
          'The first non-injected adrenaline product was approved in August 2024 on the basis of four studies in 175 healthy adults, measuring how much adrenaline got into their blood. Nobody in those studies was having an allergic reaction.',
        technicalDetails:
          'FDA approved neffy, epinephrine nasal spray, on 9 August 2024 for emergency treatment of Type I allergic reactions including anaphylaxis in adults and children weighing at least 30 kg. The agency’s announcement states the approval is based on four studies in 175 healthy adults, without anaphylaxis, that measured epinephrine concentrations in the blood after neffy or approved injection products, and showed comparable blood concentrations and similar increases in blood pressure and heart rate — described as two critical effects of epinephrine in the treatment of anaphylaxis. A study in children over 30 kg showed concentrations similar to adults. The product carries a warning that nasal conditions such as polyps or a history of nasal surgery may affect absorption, and that such patients should consider an injectable product. This is bridging on pharmacokinetics and pharmacodynamics rather than efficacy, and given the Cochrane finding that no randomised efficacy trial exists or is likely to be ethical, it is the only path available. It should still be read for what it is: a new route of administration for the most time-critical drug in allergy, licensed without a single dose ever having been given to a person in anaphylaxis in a controlled study, and dependent on absorption across a nasal mucosa that the condition being treated causes to swell.',
        evidenceSource:
          'US Food and Drug Administration news release, 9 August 2024 — FDA Approves First Nasal Spray for Treatment of Anaphylaxis (neffy, NDA 214697)',
        inferredClaim:
          'That comparable plasma epinephrine concentrations and comparable blood pressure and heart rate responses in healthy volunteers predict comparable clinical effect in anaphylaxis',
        auditFlag: 'caution',
      },
      {
        id: 'epi-a5',
        category: 'failed',
        title: 'The device holds 2 mL, delivers 0.3, and discards the rest',
        laymanSummary:
          'Each EpiPen contains two millilitres of adrenaline solution. It injects three tenths of a millilitre. The label says the remaining 1.7 mL is not available for future use and should be thrown away — at about a hundred and forty United States dollars a unit at what pharmacies pay.',
        technicalDetails:
          'Section 2.2 of the EpiPen label states, under Discarding After Use, that the device contains 2 mL of epinephrine solution, that approximately 1.7 mL remains in the auto-injector after activation, that it is not available for future use, and that it should be discarded. Section 11 states each 0.3 mL delivered dose contains 0.3 mg of epinephrine. The CMS National Average Drug Acquisition Cost survey effective 19 August 2026 puts epinephrine at US$141.85 per unit as the median across 24 listed generic products — the most expensive per-unit acquisition cost in this file by two orders of magnitude, for a molecule that has never held a patent and costs a trivial amount to synthesise. The value is entirely in the device, which was approved in 1987 under a Type 5 classification for a new formulation or manufacturer rather than as a new molecular entity. In 2017 Mylan resolved False Claims Act allegations for US$465 million, relating to the classification of EpiPen and EpiPen Jr as generic rather than brand for Medicaid Drug Rebate Program purposes, with no admission or finding of wrongdoing, and entered a Corporate Integrity Agreement with the HHS Office of Inspector General.',
        evidenceSource:
          'EPIPEN United States prescribing information, sections 2.2 and 11 (NDA 019430); CMS NADAC survey effective 19 August 2026; HHS Office of Inspector General corporate integrity agreement record for Mylan Inc. and Mylan Specialty L.P.',
        measuredMetric:
          'Solution volume held, volume delivered and volume discarded per device, against per-unit acquisition cost',
        auditFlag: 'caution',
      },
      {
        id: 'epi-a6',
        category: 'measured',
        title: 'No contraindications, an 87-character mechanism section, and real ways to be hurt',
        laymanSummary:
          'The contraindications section of the EpiPen label says: None. The mechanism section is one sentence. The warnings section lists brain haemorrhage, gas gangrene and dead fingers.',
        technicalDetails:
          'Section 4 of the EpiPen label reads: None. Section 12.1, Mechanism of Action, reads in its entirety: epinephrine acts on both alpha- and beta-adrenergic receptors. Section 5 nonetheless records that large doses or accidental intravenous injection may cause cerebral haemorrhage from a sharp rise in blood pressure; that injection into the buttock may not treat anaphylaxis effectively and has been associated with clostridial gas gangrene, which alcohol cleansing does not prevent because it does not kill bacterial spores; that injection into digits, hands or feet may cause loss of blood flow because epinephrine is a strong vasoconstrictor; that rare serious skin and soft tissue infections have been reported; that it should be administered with caution in heart disease because it may aggravate angina or produce ventricular arrhythmias; and that more than two sequential doses should be given only under direct medical supervision. The absence of a contraindication is not a statement that the drug is harmless. It is a statement that in the indication, nothing outweighs it — and the fatal-reactions register recorded at least three deaths caused by adrenaline overdose, which is the reason the two-dose limit exists.',
        evidenceSource:
          'EPIPEN United States prescribing information, sections 4, 5.1 to 5.5 and 12.1 (NDA 019430); Pumphrey RS, Clin Exp Allergy 2000;30:1144-1150',
        measuredMetric:
          'Contents of the contraindications, mechanism of action and warnings sections of the current label',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Into the muscle of the outer thigh',
        laymanDesc:
          'Through clothing if necessary, into the outer thigh — the one site with pharmacokinetic evidence behind it.',
        molecularDetail:
          'A fixed 0.3 mg dose in 0.3 mL delivered intramuscularly or subcutaneously into the anterolateral thigh. Peak plasma concentrations were significantly higher after intramuscular thigh injection than after intramuscular or subcutaneous injection into the upper arm (p<0.01) in a six-way crossover in young men. The device must not be used intravenously, in the buttock, or in digits, hands or feet.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It reaches every adrenergic receptor at once',
        laymanDesc:
          'Adrenaline is not selective, and in anaphylaxis that is the point. Selectivity is what you want in a lung drug and the last thing you want here.',
        molecularDetail:
          'The label’s entire mechanism of action section: epinephrine acts on both alpha- and beta-adrenergic receptors. Non-selectivity across alpha-1, alpha-2, beta-1 and beta-2 is the property no other single agent in the allergy cabinet has, and it maps onto the three simultaneous failures of anaphylaxis.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'Alpha-1 tightens the leaking vessels',
        laymanDesc:
          'Blood pressure comes back up, and the swelling in the throat and tongue starts to retreat.',
        molecularDetail:
          'Alpha-1 agonism on vascular smooth muscle produces vasoconstriction, raising systemic vascular resistance and reversing the distributive shock and mucosal oedema of anaphylaxis. This is the component antihistamines and corticosteroids do not supply at all.',
        iconName: 'Gauge',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'Beta-2 opens the airway and quietens the mast cells',
        laymanDesc:
          'The same receptor a rescue inhaler works on relaxes the airway, and it also reduces further release from the cells causing the reaction.',
        molecularDetail:
          'Beta-2 agonism relaxes bronchial smooth muscle by the adenylate cyclase and cyclic AMP route familiar from albuterol, and raised cyclic AMP in mast cells and basophils inhibits further mediator release. Beta-1 agonism increases cardiac rate and contractility.',
        iconName: 'Wind',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The reaction turns around within minutes',
        laymanDesc:
          'Given early it reverses the collapse. Given after the heart or breathing has stopped, it usually does not.',
        molecularDetail:
          'In a national fatal anaphylaxis register the median time to respiratory or cardiac arrest was 30 minutes for food, 15 for venom and 5 for iatrogenic reactions, and adrenaline was given before arrest in only 14% of fatal cases. Twenty-eight per cent of fatal cases were resuscitated and died later, mostly of hypoxic brain damage.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And the evidence behind it is not a trial',
        laymanDesc:
          'No randomised controlled trial of adrenaline in anaphylaxis exists. A Cochrane search found none and concluded one would probably be unethical.',
        molecularDetail:
          'Cochrane 2008: we found no studies that satisfied the inclusion criteria. The recommendation rests on mechanism, on plasma-concentration studies in healthy volunteers, and on what fatal-case registers show about what happens when it is given late or not at all. The 2024 nasal spray was licensed on the same kind of bridging evidence: four studies in 175 healthy adults without anaphylaxis.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Cochrane adrenaline for anaphylaxis with and without shock (CD006312.pub2)',
        phase: 'Systematic review — no eligible studies found',
        sampleSize: 0,
        primaryEndpoint:
          'Benefits and harms of adrenaline against no intervention, placebo or another adrenergic agonist in anaphylaxis',
        endpointMet: false,
        statisticalPValue:
          'No studies satisfied the inclusion criteria after searching CENTRAL, MEDLINE, EMBASE, CINAHL, BIOSIS, ISI Web of Knowledge, LILACS and three trial registries, and contacting manufacturers and international experts',
        unreportedAdverseSignals:
          'The authors concluded that such trials are unlikely to be performed and might be unethical, because prompt treatment is deemed critically important for survival and anaphylaxis occurs without warning, usually outside medical settings, with variable severity.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'Simons intramuscular versus subcutaneous crossover (J Allergy Clin Immunol 2001;108:871-873)',
        phase: 'Prospective, randomised, blinded, placebo-controlled six-way crossover',
        sampleSize: 11,
        primaryEndpoint:
          'Peak plasma epinephrine concentration by route and site of injection in healthy young men',
        endpointMet: true,
        statisticalPValue:
          'Peak plasma epinephrine significantly higher after intramuscular thigh injection than after intramuscular or subcutaneous upper-arm injection, p<0.01',
        unreportedAdverseSignals:
          'Healthy volunteers, no anaphylaxis, and a pharmacokinetic surrogate endpoint. Every auto-injector label in the world restricts injection to the thigh on the strength of this design, and no outcome study has tested whether the higher peak translates into survival.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'United Kingdom fatal anaphylaxis register (Clin Exp Allergy 2000;30:1144-1150)',
        phase: 'National case register from certified causes of death',
        sampleSize: 164,
        primaryEndpoint:
          'Circumstances, timing and treatment of fatal anaphylactic reactions in the United Kingdom since 1992',
        endpointMet: true,
        statisticalPValue:
          'Median time to respiratory or cardiac arrest 30 minutes for foods, 15 for venom, 5 for iatrogenic reactions; adrenaline used in 62% of fatal reactions but before arrest in only 14%; 28% resuscitated and died 3 hours to 30 days later',
        unreportedAdverseSignals:
          'Adrenaline overdose caused at least three deaths in the series, and self-treatment kits had proved unhelpful for a variety of reasons. The register also notes that deaths certified as anaphylaxis underestimate the true incidence, so the denominator is uncertain.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'neffy pharmacokinetic and pharmacodynamic bridging programme (NDA 214697)',
        phase: 'Four pharmacokinetic and pharmacodynamic studies in healthy adults',
        sampleSize: 175,
        primaryEndpoint:
          'Epinephrine blood concentrations after nasal spray against approved epinephrine injection products, with blood pressure and heart rate responses',
        endpointMet: true,
        statisticalPValue:
          'Comparable epinephrine blood concentrations to approved injection products, and similar increases in blood pressure and heart rate; a paediatric study above 30 kg showed concentrations similar to adults',
        unreportedAdverseSignals:
          'None of the 175 participants had anaphylaxis. Absorption depends on a nasal mucosa that anaphylaxis itself inflames, and the label warns that nasal polyps or a history of nasal surgery may affect absorption and that such patients should consider an injectable product.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Peak plasma epinephrine significantly higher after intramuscular thigh injection than after upper-arm intramuscular or subcutaneous injection (p<0.01)',
        'Median time to respiratory or cardiac arrest of 30 minutes for food, 15 for venom and 5 for iatrogenic anaphylaxis',
        'Adrenaline used in 62% of fatal anaphylactic reactions but given before arrest in only 14%',
        'Comparable plasma epinephrine concentrations and blood pressure and heart rate responses for nasal spray against injection in 175 healthy adults',
        'Each auto-injector holds 2 mL, delivers 0.3 mL, and discards approximately 1.7 mL',
      ],
      unsupportedInferences: [
        'That epinephrine reduces mortality in anaphylaxis — accepted universally, supported by mechanism and case series, and never tested against any control',
        'That a higher peak plasma concentration in a healthy volunteer predicts survival in a patient in shock',
        'That plasma-concentration bridging in people without anaphylaxis predicts clinical effect through a nasal mucosa the condition is swelling',
        'That the absence of a contraindication means the drug is safe, when the same label describes cerebral haemorrhage, gas gangrene and digital ischaemia and a fatal-case register attributes at least three deaths to overdose',
      ],
      whatFailedInitially: [
        'A Cochrane search of seven databases, three registries, manufacturers and international experts found no eligible randomised trial at all',
        'Self-treatment kits had proved unhelpful for a variety of reasons in the fatal-reactions register, with success depending on medication choice, ease of use and training',
        'Adrenaline was given before cardiorespiratory arrest in only one in seven fatal reactions',
        'The device throws away about 85% of the drug it holds, at the highest per-unit acquisition cost in this file',
      ],
      realWorldOutcome: [
        'The molecule has never been patented; EpiPen was approved on 22 December 1987 under NDA 019430 as a Type 5 new formulation, and the value has always been in the device',
        'US$141.85 per unit at United States pharmacy acquisition cost in August 2026, two orders of magnitude above anything else in this file',
        'Mylan resolved False Claims Act allegations for US$465 million in 2017 over classifying EpiPen as generic for Medicaid rebate purposes, with no admission of wrongdoing',
        'The first non-injected epinephrine, a nasal spray, was approved on 9 August 2024 on pharmacokinetic bridging in 175 healthy volunteers',
      ],
    },
    deliverySystem: {
      type: 'Single-dose intramuscular auto-injector delivering 0.3 mg (or 0.15 mg for the junior device) into the anterolateral thigh; also 1 mg/mL solution in vials and ampoules, and since 2024 a nasal spray',
      description:
        'Each EpiPen delivers 0.3 mg of epinephrine in 0.3 mL from a device containing 2 mL, with approximately 1.7 mL remaining and discarded after activation. The solution contains sodium chloride, 0.5 mg of sodium metabisulfite as antioxidant, and hydrochloric acid to a pH of 2.2 to 5.0. It may be injected through clothing. The solution should be inspected through the clear window and replaced if pink, brown, cloudy or particulate.',
      safetyProfile:
        'No contraindications. The device is emergency supportive therapy only and not a substitute for immediate medical care, and more than two sequential doses should be given only under direct medical supervision. Do not inject intravenously — large or intravenous doses may cause cerebral haemorrhage from a sharp rise in blood pressure. Do not inject into the buttock, which may fail to treat the anaphylaxis and has been associated with clostridial gas gangrene that alcohol cleansing does not prevent. Do not inject into digits, hands or feet, where vasoconstriction may cause loss of blood flow. Rare serious skin and soft tissue infections have been reported. Use with caution in heart disease: it may aggravate angina or produce ventricular arrhythmias. The sulfite content should not deter use. In young children the leg should be held firmly to prevent injection injury.',
    },
    commonQuestions: [
      {
        q: 'Can I take an antihistamine instead and see how it goes?',
        a: 'No, and this is the single most consequential question on this site. An antihistamine blocks one mediator at receptors on blood vessels; it does not open a closing airway, it does not restore blood pressure, and it does not work in the minutes available. A corticosteroid changes gene transcription over hours. Anaphylaxis kills by airway obstruction and circulatory collapse, and epinephrine is the only available drug that reverses both — alpha-1 constriction for the leaking vessels and the swelling, beta-2 relaxation for the airway, beta-1 support for the heart. In a national register of fatal anaphylaxis the median time from reaction to respiratory or cardiac arrest was 30 minutes for food, 15 minutes for a sting and 5 minutes for a drug reaction. Those are the windows an antihistamine would be spending.',
        auditNote:
          'In the same register, adrenaline was used in 62% of the fatal reactions — but before arrest in only 14%. Late is close to the same as never.',
      },
      {
        q: 'Has adrenaline actually been proven to work in anaphylaxis?',
        a: 'Not by a randomised trial, and there almost certainly never will be one. A Cochrane review searched seven databases, three trial registries, pharmaceutical companies and international experts for randomised or quasi-randomised trials of adrenaline against placebo, no treatment or another adrenergic agonist, and reported: we found no studies that satisfied the inclusion criteria. The authors concluded such trials are unlikely to be performed and might be unethical, because prompt treatment is considered critical for survival, and difficult to conduct because anaphylaxis strikes without warning and usually outside medical settings. What supports the drug is the pharmacology, plasma-concentration studies in healthy volunteers, and what fatal-case registers show about the outcomes when it is delayed. That is a genuinely strong case; it is not the same kind of evidence as a trial, and it is worth knowing which one you have.',
      },
      {
        q: 'Why does the injector cost so much when adrenaline is ancient and cheap?',
        a: 'Because you are not buying the drug. Adrenaline has never held a patent and a millilitre of it in a glass vial is among the cheapest things in a hospital. The auto-injector was approved in 1987 under a classification for a new formulation rather than a new molecule, and the device is where the value and the exclusivity have always sat. The label’s own arithmetic makes the point sharply: each EpiPen contains 2 mL of solution, injects 0.3 mL, and states that approximately 1.7 mL remains in the device, is not available for future use, and should be discarded. At United States pharmacy acquisition cost in August 2026 the median is US$141.85 per unit. In 2017 Mylan paid US$465 million to resolve False Claims Act allegations about classifying EpiPen as a generic for Medicaid rebate purposes, without admitting wrongdoing.',
      },
      {
        q: 'Is the nasal spray as good as the injection?',
        a: 'Nobody knows, in the sense of having tested it in anaphylaxis, and nobody is likely to find out. FDA approved neffy on 9 August 2024 on the basis of four studies in 175 healthy adults who were not having allergic reactions, measuring blood epinephrine concentrations against approved injection products and finding them comparable, with similar rises in blood pressure and heart rate. That is bridging on pharmacokinetics and pharmacodynamics, and given that no efficacy trial is ethical, it is the only route available. Two caveats are worth carrying: the drug has to be absorbed across a nasal lining that anaphylaxis itself inflames and swells, and the label warns that nasal polyps or previous nasal surgery may affect absorption and that those patients should consider an injectable product. The reason FDA gave for approving it is real too — fear of needles causes people, particularly children, to delay treatment.',
      },
      {
        q: 'My injector is out of date but the liquid looks fine. Can I use it?',
        a: 'Carry it as a last resort and replace it. The label’s test for the solution is visual: epinephrine deteriorates rapidly on exposure to air or light, turning pink as it oxidises to adrenochrome and brown as melanin forms, and the label directs replacing the device if the solution appears discoloured, cloudy or contains particles. A clear solution is a good sign, not a guarantee of full potency, and the expiry date exists for reasons the window cannot show you. Both a discoloured in-date device and a clear expired one are reasons to get a replacement rather than to rely on it.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'EPIPEN and EPIPEN Jr (epinephrine injection, USP) auto-injectors United States prescribing information — Indications 1, Dosage and Administration 2.1 and 2.2, Contraindications 4, Warnings and Precautions 5.1 to 5.5, Description 11, Mechanism of Action 12.1 (NDA 019430)',
        identifier:
          'https://api.fda.gov/drug/drugsfda.json?search=application_number:%22NDA019430%22',
        kind: 'regulatory',
      },
      {
        label:
          'Sheikh A, Shehata YA, Brown SG, Simons FE. Adrenaline (epinephrine) for the treatment of anaphylaxis with and without shock. Cochrane Database Syst Rev 2008;(4):CD006312',
        identifier: '10.1002/14651858.CD006312.pub2',
        kind: 'doi',
      },
      {
        label:
          'Simons FE, Gu X, Simons KJ. Epinephrine absorption in adults: intramuscular versus subcutaneous injection. J Allergy Clin Immunol 2001;108:871-873',
        identifier: '10.1067/mai.2001.119409',
        kind: 'doi',
      },
      {
        label:
          'Pumphrey RS. Lessons for management of anaphylaxis from a study of fatal reactions. Clin Exp Allergy 2000;30:1144-1150',
        identifier: '10.1046/j.1365-2222.2000.00864.x',
        kind: 'doi',
      },
      {
        label:
          'US Food and Drug Administration news release, 9 August 2024 — FDA Approves First Nasal Spray for Treatment of Anaphylaxis (neffy, epinephrine nasal spray, NDA 214697)',
        identifier:
          'https://www.fda.gov/news-events/press-announcements/fda-approves-first-nasal-spray-treatment-anaphylaxis',
        kind: 'regulatory',
      },
      {
        label:
          'HHS Office of Inspector General — corporate integrity agreement record for Mylan Inc. and Mylan Specialty L.P., entered in connection with the 2017 resolution of False Claims Act allegations concerning EpiPen classification under the Medicaid Drug Rebate Program',
        identifier:
          'https://oig.hhs.gov/compliance/corporate-integrity-agreements/browse-cias/mylan-inc-and-mylan-specialty-lp/',
        kind: 'regulatory',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — epinephrine, 24 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 5816 — epinephrine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5816',
        kind: 'url',
      },
    ],
  },
]
