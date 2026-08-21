import type { SeedDossier } from '@/lib/seed-types'

/**
 * Curated dossiers — the inhaled airway medicines.
 *
 * The editorial layer written over records a pipeline had already filled with label text, registry
 * entries, CMS acquisition prices and a PubChem structure. Identity facts (slug, trade names,
 * sponsor, approval year, SMILES, formula, molecular weight, NADAC price) are copied from the
 * stored record rather than researched again. Everything else is written from primary sources, and
 * every DOI, PMID, NCT number and PubChem CID below was resolved against the PubMed E-utilities,
 * the ClinicalTrials.gov v2 API or the PubChem PUG REST endpoint at the time of writing.
 *
 * Five conventions apply to the whole group.
 *
 * 1. THE SURROGATE IS FEV1, AND THE OUTCOME IS AN EXACERBATION OR A DEATH. Almost every airway
 *    trial in existence measures trough FEV1 in millilitres over twelve or twenty-four weeks. A
 *    minority measure exacerbation rate. A very small minority measure mortality, and those are
 *    the ones that changed practice. Which of the three a page is describing is stated in as many
 *    words, because a 100 mL FEV1 gain and a survival benefit are not the same finding and the
 *    marketing for this class has spent thirty years blurring them.
 *
 * 2. THIS CLASS CARRIES THE LARGEST SAFETY REVERSAL IN MODERN RESPIRATORY MEDICINE. SMART put a
 *    boxed warning on every long-acting beta-agonist on the strength of thirteen asthma deaths
 *    against three on placebo in 26,355 people; four FDA-mandated trials totalling 36,010 patients
 *    then found no excess when the beta-agonist was given with an inhaled steroid, and the FDA
 *    removed the warning in December 2017. Both halves are on the pages of the drugs involved, and
 *    the reversal is filed as a conclusion shift rather than quietly dropped.
 *
 * 3. NO PER-DOSE SYNTHESIS COST IS STATED ANYWHERE. `synthesisCostPerDose` is empty in every
 *    pricing block below. The published cost-of-production literature holds its per-drug figures in
 *    supplementary appendices that could not be verified line by line here, and a manufactured
 *    number is worse than a missing one. What each block carries instead is the CMS National
 *    Average Drug Acquisition Cost, which is what a United States pharmacy pays to buy the product,
 *    and emphatically not a cost of manufacture or a price a patient is charged.
 *
 * 4. INHALER TECHNIQUE IS NOT DOSING GUIDANCE, AND NEITHER IS DESCRIBED HERE. Doses appear only
 *    where they are part of a trial's description or a label's identity. Nothing on these pages
 *    tells a reader what to take, how often, in what order, or how to obtain it.
 *
 * 5. DEVICE AND MOLECULE ARE DIFFERENT OBJECTS. Several of these drugs exist only inside a
 *    proprietary inhaler, and the trial that supports the molecule was run in that device. Where
 *    the evidence cannot be separated from the device, the page says so rather than implying the
 *    molecule was tested on its own.
 */

const NADAC_SOURCE = {
  label:
    'CMS National Average Drug Acquisition Cost (NADAC) 2026 file, prices effective 19 August 2026',
  identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
  kind: 'url' as const,
}

/**
 * The cost-of-production reference for this class. Hill and colleagues estimated generic prices
 * across the WHO Model List of Essential Medicines, which includes several drugs in this file, but
 * the per-drug figures sit in a supplementary appendix that could not be checked line by line, so
 * every `synthesisCostPerDose` below is empty rather than estimated from it.
 */
const COST_OF_PRODUCTION_SOURCE = {
  label:
    'Hill A, Barber MJ, Gotham D. Estimated costs of production and potential prices for the WHO Essential Medicines List. BMJ Glob Health 2018;3:e000571. Per-drug figures are in a supplementary appendix not verified here, so no synthesis cost is stated on these pages.',
  identifier: '10.1136/bmjgh-2017-000571',
  kind: 'doi' as const,
}

export const ENRICHED_BATCH_8_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // 1. Budesonide — the inhaled steroid whose growth cost was measured, denied, and then measured
  //    again in the same cohort twenty years later.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'budesonide',
    name: 'Budesonide',
    tradeName: 'Pulmicort Flexhaler / Pulmicort Respules / Rhinocort / Uceris / Ortikos',
    sponsor: 'AstraZeneca (originator, from AB Draco in Sweden); now made by many manufacturers',
    targetGene: 'NR3C1',
    targetProtein: 'Glucocorticoid receptor (nuclear receptor subfamily 3 group C member 1)',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1994,
    indication:
      'Maintenance treatment of asthma as prophylactic therapy (inhalation powder and nebuliser suspension); treatment of mild to moderate active Crohn disease involving the ileum and ascending colon and maintenance of remission for up to three months (delayed-release capsules); induction of remission in active mild to moderate ulcerative colitis (extended-release tablets); seasonal and perennial allergic rhinitis (nasal spray)',
    patientFriendlyIndication:
      'Taken every day to keep asthma quiet, and in other forms for Crohn disease, ulcerative colitis and hay fever',
    anatomicalSite:
      'Airway epithelium and submucosal inflammatory cells (inhaled); ileal and ascending-colonic mucosa (oral delayed-release)',
    conditionContext: {
      conditionExplainer:
        'Asthma is not primarily a problem of tight muscle. It is inflammation in the lining of the airways, present between attacks as well as during them, which makes the airway swollen, twitchy and full of mucus. The muscle spasm that produces the wheeze happens on top of that inflammation.',
      whyItMatters:
        'A reliever inhaler treats the spasm and leaves the inflammation where it was. That is why people who rely on relievers alone keep having attacks, and why the drugs that reduce attacks are the ones that treat the lining rather than the muscle.',
      whoTakesThis:
        'Anyone with asthma beyond the mildest intermittent form, in every major guideline worldwide. Budesonide is on the WHO Model List of Essential Medicines, and the nebuliser suspension is the standard inhaled steroid for young children.',
      clinicalGoals:
        'Fewer severe exacerbations and fewer courses of oral steroids. Lung function improves, but only slightly, and the improvement is not what the drug is prescribed for.',
    },
    oneSentenceVerdict:
      'A corticosteroid that enters airway cells, carries the glucocorticoid receptor into the nucleus and shuts down the transcription of inflammatory genes; over three years in 7,241 people with recent-onset mild asthma it cut severe asthma events by 44%, and in the children of a parallel programme it cost 1.2 cm of final adult height — a trade the field spent two decades describing as temporary before the cohort grew up and it was not.',
    laymanHowItWorks:
      'Asthma is inflammation in the lining of the airway, and budesonide switches that inflammation off at its source. Breathed in, it crosses into the cells lining the airway and binds a receptor that carries it into the nucleus, where it silences the genes that make inflammatory signals and switches on the ones that dampen them. Most of the dose that lands in the mouth and is swallowed is destroyed by the liver before it reaches the bloodstream, which is what keeps the effect largely in the lung. It does nothing to open an airway that is closing right now — budesonide will not rescue an attack, and using it as though it would is dangerous.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 87,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.7198 per millilitre of budesonide inhalation suspension, the median across 51 listed products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Synthesised at AB Draco in Lund, Sweden, in the early 1970s and brought to the United States by Astra. Composition-of-matter protection expired long ago and the nebuliser suspension is manufactured generically. What remains proprietary is not the molecule but the hardware and the formulation around it: the Turbuhaler and Flexhaler dry-powder devices, the pH-dependent delayed-release coating of the Crohn capsule and the MMX matrix of the colitis tablet each carry their own patents, which is why an off-patent steroid still appears on this site at brand prices in some of its forms.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Every inhaled corticosteroid on the market does the same thing to the same receptor, and the head-to-head differences between them are small compared with the difference between taking one and not taking one. The real alternatives are a different steroid, a leukotriene tablet with a boxed psychiatric warning, or nothing. No food or supplement treats airway inflammation, and this page will not pretend one does.',
      conventionalRx: [
        {
          name: 'Fluticasone propionate (Flovent, and inside Advair)',
          class: 'Inhaled corticosteroid',
          howItCompares:
            'The same receptor and the same class effect. Its own FDA-mandated safety trial, AUSTRI, was run in 11,679 patients and returned the same answer as the budesonide one: adding a long-acting beta-agonist did not raise serious asthma events. Choosing between the two is mostly a question of device and of which one a formulary covers.',
          typicalCost:
            'US$0.6920 per millilitre, the median across 51 listed fluticasone products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: interchangeable evidence base, wide device choice. Cons: the same growth effect in children, the same oral candidiasis and dysphonia, and a longer systemic half-life than budesonide.',
        },
        {
          name: 'Montelukast (Singulair)',
          class: 'Leukotriene receptor antagonist, oral',
          howItCompares:
            'A tablet rather than an inhaler, which is why it is popular, and consistently weaker than an inhaled steroid on exacerbations in head-to-head trials. In March 2020 the FDA placed a boxed warning on it for serious neuropsychiatric events and advised reserving it in allergic rhinitis for patients who cannot tolerate other treatments.',
          typicalCost:
            'US$0.0689 per tablet, the median across 74 listed products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: oral, no inhaler technique to get wrong, no growth suppression. Cons: weaker on exacerbations, and a boxed warning for agitation, depression, sleep disturbance and suicidal thinking.',
        },
        {
          name: 'Prednisone (oral corticosteroid)',
          class: 'Systemic corticosteroid',
          howItCompares:
            'The same receptor reached the opposite way — through the whole body rather than the airway lining. It is what an inhaled steroid is meant to keep people off, and the number of prednisone courses a year is one of the standard measures of whether inhaled treatment is working.',
          typicalCost:
            'US$0.0560 per tablet, the median across 118 listed products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: cheap, fast, works when nothing inhaled will reach the airway. Cons: at repeated courses, bone loss, diabetes, cataract, adrenal suppression and weight gain — the systemic burden the inhaled route exists to avoid.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Have a child on a daily inhaled steroid measured at every visit',
          action:
            'Ask for a stadiometer height, recorded on the same growth chart each time, rather than an impression that the child looks fine.',
          patientImpact:
            'In the Childhood Asthma Management Program, 4 to 6 years of budesonide from age 5 to 13 left adult height 1.2 cm lower than placebo (95% CI -1.9 to -0.5, p=0.001), and the effect was concentrated in the first two years and in prepubertal children.',
          clinicalPrecaution:
            'The measurement is for tracking, not for stopping treatment. Uncontrolled asthma also stunts growth, and the CAMP participants who took budesonide had fewer hospitalisations and fewer prednisone courses than those who did not.',
        },
        {
          name: 'Rinse and spit after every inhaled dose',
          action:
            'Rinse the mouth with water and spit it out once the dose has been taken, rather than swallowing.',
          patientImpact:
            'Reduces the deposited steroid available to the oropharynx, which is where inhaled corticosteroid candidiasis and dysphonia come from. Both are listed adverse reactions on the label.',
          clinicalPrecaution:
            'This changes the local side effects, not the systemic ones and not the growth effect. Those come from the fraction absorbed through the lung, which rinsing does not touch.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CCCC1O[C@@H]2C[C@H]3[C@@H]4CCC5=CC(=O)C=C[C@@]5([C@H]4[C@H](C[C@@]3([C@@]2(O1)C(=O)CO)C)O)C',
      chemicalFormula: 'C25H34O6',
      molecularWeight: '430.50 g/mol',
      targetReceptorAffinity:
        'The FDA label states approximately 200-fold higher affinity for the glucocorticoid receptor than cortisol in standard in vitro and animal models, and approximately 1,000-fold higher topical anti-inflammatory potency in the rat croton oil ear oedema assay, and adds that the clinical significance of these findings is unknown. Budesonide is supplied as a roughly 1:1 mixture of the 22R and 22S epimers at the acetal carbon; the label reports the 22R form as about twice as active as 22S.',
      structureSource: {
        label: 'PubChem CID 5281004 (budesonide) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5281004',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'bud-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity and epimer ratio of the incoming steroid',
          description:
            'Confirm identity and water content of 16-alpha-hydroxyprednisolone and of the butyraldehyde before the acetalisation, and establish the chiral HPLC method that will later resolve the 22R and 22S epimers. The finished drug substance is a defined mixture of the two, so an assay that cannot separate them cannot release the batch.',
          reagentsAndBuffer:
            '16-alpha-hydroxyprednisolone reference standard, n-butyraldehyde, Karl Fischer titration, chiral stationary-phase HPLC with UV detection at 240 nm',
        },
        {
          id: 'bud-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Acid-catalysed acetalisation across the 16,17-diol',
          description:
            'Condense n-butyraldehyde with the 16,17-diol of 16-alpha-hydroxyprednisolone under acid catalysis to close the cyclic acetal ring. The new carbon is a stereocentre and the reaction is not stereoselective, which is the reason budesonide exists as an epimer mixture rather than a single compound.',
          dependsOnStepId: 'bud-w1',
          reagentsAndBuffer:
            'n-butyraldehyde, perchloric or p-toluenesulfonic acid catalyst, anhydrous dioxane or tetrahydrofuran, nitrogen blanket',
        },
        {
          id: 'bud-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation and epimer-ratio release assay',
          description:
            'Crystallise the crude acetal, then assay the 22R to 22S ratio against specification along with related steroid impurities. The specification is a ratio rather than a single-enantiomer purity, because both epimers are active and the approved product contains both.',
          dependsOnStepId: 'bud-w2',
          reagentsAndBuffer:
            'Ethanol and purified water for recrystallisation, chiral HPLC with acetonitrile-phosphate mobile phase, UV detection at 240 nm, 16-alpha-hydroxyprednisolone and epimer reference standards',
        },
        {
          id: 'bud-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Uptake and fatty-acid esterification in airway epithelial cells',
          description:
            'Dose primary human bronchial epithelial cells at an air-liquid interface and measure both free budesonide and its intracellular oleate ester. The esterification is the pharmacologically interesting part: budesonide is reversibly conjugated to fatty acids inside airway cells, forming an inactive depot that hydrolyses back, which is the proposed explanation for a duration of action longer than its plasma half-life.',
          dependsOnStepId: 'bud-w3',
          reagentsAndBuffer:
            'Primary human bronchial epithelial cells at air-liquid interface, PneumaCult ALI medium, collagen-coated transwell inserts, LC-MS/MS with deuterated budesonide internal standard for free drug and budesonide-21-oleate',
        },
        {
          id: 'bud-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Glucocorticoid receptor translocation and cytokine transrepression readout',
          description:
            'Read out nuclear translocation of the glucocorticoid receptor by immunofluorescence and, in parallel, suppression of TNF-alpha-driven GM-CSF and IL-8 release from the same cells. Reporting both matters: translocation is the proposed mechanism, cytokine suppression is the effect, and there are published conditions in which one moves without the other.',
          dependsOnStepId: 'bud-w4',
          reagentsAndBuffer:
            'Recombinant human TNF-alpha, anti-glucocorticoid-receptor primary antibody with fluorescent secondary, Hoechst nuclear counterstain, GM-CSF and IL-8 ELISA kits, RIPA lysis buffer with protease inhibitors',
        },
      ],
    },
    keyAudits: [
      {
        id: 'bud-a1',
        category: 'measured',
        title: 'START: 44% fewer severe asthma events over three years in 7,241 patients',
        laymanSummary:
          'People whose asthma had started within the previous two years were given either low-dose budesonide once a day or a placebo for three years. Severe attacks fell by nearly half.',
        technicalDetails:
          'The inhaled Steroid Treatment As Regular Therapy (START) trial randomised 7,241 patients aged 5 to 66 in 32 countries with mild persistent asthma of less than two years duration and no previous regular corticosteroid, to budesonide 400 micrograms daily (200 micrograms under age 11) or placebo added to usual therapy, for three years. The primary outcome was time to first severe asthma-related event. It occurred in 198 of 3,568 on placebo and 117 of 3,597 on budesonide, hazard ratio 0.56 (95% CI 0.45 to 0.71, p<0.0001). Post-bronchodilator FEV1 rose 1.48% of predicted at one year and 0.88% at three years against placebo; the pre-bronchodilator gain was 2.24% and 1.71%. The lung-function effect is real and small; the exacerbation effect is the reason the drug is prescribed.',
        evidenceSource: 'Pauwels RA et al., Lancet 2003;361:1071-1076 (START)',
        doi: '10.1016/S0140-6736(03)12891-7',
        measuredMetric:
          'Time to first severe asthma-related event over three years, and change in FEV1 as percent predicted',
        auditFlag: 'verified',
      },
      {
        id: 'bud-a2',
        category: 'conclusion_shift',
        title: 'The growth effect was called temporary for twenty years, then the cohort grew up',
        laymanSummary:
          'Inhaled steroids were known to slow growth for a year or two, and the field held that children caught up and reached a normal adult height. When the trial children were measured at an average age of 25, the lost centimetre was still missing.',
        technicalDetails:
          'The Childhood Asthma Management Program randomised 1,041 children aged 5 to 13 to budesonide 400 micrograms daily, nedocromil 16 mg daily or placebo for 4 to 6 years. Adult height was later measured in 943 of them (90.6%) at a mean age of 24.9 years. Mean adult height was 1.2 cm lower in the budesonide group than placebo (95% CI -1.9 to -0.5, p=0.001) and 0.2 cm lower with nedocromil (95% CI -0.9 to 0.5, p=0.61). A larger daily dose in the first two years predicted lower adult height, at -0.1 cm per microgram per kilogram of body weight (p=0.007). The deficit was the same size as the one measured after two years (-1.3 cm), so it was not progressive or cumulative — it was permanent. The START trial had recorded the same thing prospectively: 1.34 cm of three-year growth lost in children under 11, most of it in the first year.',
        evidenceSource:
          'Kelly HW et al., N Engl J Med 2012;367:904-912 (CAMP, NCT00000575); Pauwels RA et al., Lancet 2003;361:1071-1076',
        doi: '10.1056/NEJMoa1203229',
        inferredClaim:
          'That the growth suppression seen in the first years of inhaled corticosteroid treatment is recovered and does not affect attained adult height — an inference from short-term catch-up data that the same cohort disproved when it reached adulthood',
        auditFlag: 'verified',
      },
      {
        id: 'bud-a3',
        category: 'failed',
        title: 'EUROSCOP: three years of budesonide did not slow lung-function decline in COPD',
        laymanSummary:
          'More than a thousand smokers with early COPD took budesonide or placebo for three years. Their lung function got slightly better in the first six months and then declined at exactly the same rate as everyone else.',
        technicalDetails:
          'The European Respiratory Society Study on Chronic Obstructive Pulmonary Disease randomised 1,277 subjects with mild COPD who continued smoking (mean age 52, mean FEV1 77% of predicted) to inhaled budesonide 400 micrograms twice daily or placebo for three years after a six-month run-in; 912 completed. Median three-year post-bronchodilator FEV1 decline was 140 mL on budesonide against 180 mL on placebo (p=0.05). In the first six months FEV1 improved at 17 mL per year on budesonide against a decline of 81 mL per year on placebo (p<0.001); from nine months to the end of treatment the two arms declined at the same rate (p=0.39). Skin bruising occurred in 10% on budesonide against 4% on placebo (p<0.001). The authors concluded there was a small one-time improvement and no effect on the long-term progressive decline.',
        evidenceSource: 'Pauwels RA et al., N Engl J Med 1999;340:1948-1953 (EUROSCOP)',
        doi: '10.1056/NEJM199906243402503',
        measuredMetric:
          'Rate of post-bronchodilator FEV1 decline over three years, and incidence of skin bruising',
        auditFlag: 'verified',
      },
      {
        id: 'bud-a4',
        category: 'measured',
        title: 'The FDA-mandated safety trial: no excess of serious asthma events, in 11,693 people',
        laymanSummary:
          'A trial ordered by the regulator asked whether adding formoterol to budesonide made asthma more dangerous. It did not, and the combination produced 16.5% fewer attacks.',
        technicalDetails:
          'A 26-week double-blind trial randomised 11,693 patients aged 12 and over with persistent asthma and one to four exacerbations in the previous year to budesonide-formoterol (n=5,846) or budesonide alone (n=5,847); those with a history of life-threatening asthma were excluded. The primary safety endpoint, first adjudicated serious asthma-related event (death, intubation or hospitalisation), occurred in 43 on the combination and 40 on budesonide alone, hazard ratio 1.07 (95% CI 0.70 to 1.65), meeting the prespecified non-inferiority margin of 2.0. There were two asthma-related deaths, both in the combination group, one of whom had also been intubated. First asthma exacerbation was 16.5% less likely on the combination, hazard ratio 0.84 (95% CI 0.74 to 0.94, p=0.002). Registered enrolment was 12,460; 11,693 were randomised.',
        evidenceSource: 'Peters SP et al., N Engl J Med 2016;375:850-860 (NCT01444430)',
        doi: '10.1056/NEJMoa1511190',
        measuredMetric:
          'First adjudicated serious asthma-related event and first asthma exacerbation over 26 weeks',
        auditFlag: 'verified',
      },
      {
        id: 'bud-a5',
        category: 'inferred',
        title: 'The COVID hospitalisation claim did not meet its own superiority threshold',
        laymanSummary:
          'Inhaled budesonide shortened recovery from COVID-19 by about three days in older people at home. It was widely reported as also cutting hospital admissions. The trial itself said that part did not reach the bar it had set in advance.',
        technicalDetails:
          'PRINCIPLE, an open-label adaptive platform trial in UK primary care, analysed 2,530 SARS-CoV-2-positive participants aged 65 and over, or 50 and over with comorbidities: 787 assigned budesonide 800 micrograms twice daily for 14 days, 1,069 usual care, 974 other interventions. Time to first self-reported recovery improved by an estimated 2.94 days (95% BCI 1.19 to 5.12; 11.8 days versus 14.7 days; hazard ratio 1.21, 95% BCI 1.08 to 1.36), with probability of superiority greater than 0.999 against a threshold of 0.99 — that coprimary endpoint was met. The other coprimary, COVID-related hospital admission or death, was 6.8% (95% BCI 4.1 to 10.2) against 8.8% (5.5 to 12.7), odds ratio 0.75 (95% BCI 0.55 to 1.03), probability of superiority 0.963 against a prespecified threshold of 0.975. It did not clear it. The trial was open-label and the recovery endpoint was self-reported, which is the weaker of the two designs for the endpoint that succeeded.',
        evidenceSource: 'Yu LM et al., Lancet 2021;398:843-855 (PRINCIPLE, ISRCTN86534580)',
        doi: '10.1016/S0140-6736(21)01744-X',
        inferredClaim:
          'That inhaled budesonide reduces COVID-19 hospitalisation and death — a coprimary endpoint that fell short of its own prespecified superiority threshold and is routinely quoted as though it had been met',
        auditFlag: 'caution',
      },
      {
        id: 'bud-a6',
        category: 'measured',
        title: 'First-pass metabolism is the whole safety argument, and it is a measured number',
        laymanSummary:
          'Most of an inhaled dose is swallowed rather than inhaled. Budesonide is designed so that the swallowed part is destroyed by the liver before it can act anywhere else in the body.',
        technicalDetails:
          'The FDA label reports that budesonide undergoes extensive first-pass hepatic metabolism, with systemic availability of the orally administered drug of approximately 6 to 13% in adults, mediated principally by CYP3A4 to 6-beta-hydroxybudesonide and 16-alpha-hydroxyprednisolone, both with less than 1% of the glucocorticoid activity of the parent. This is why oral and inhaled budesonide are different drugs in practice despite being the same molecule, and it is also why the label carries an interaction warning for strong CYP3A4 inhibitors such as ketoconazole and ritonavir, which raise plasma budesonide several-fold and can produce systemic corticosteroid effects including Cushing syndrome and adrenal suppression.',
        evidenceSource:
          'FDA prescribing information for budesonide (Pulmicort Flexhaler, Pulmicort Respules and Uceris), clinical pharmacology and drug interactions sections',
        measuredMetric:
          'Oral systemic bioavailability of approximately 6 to 13%, and glucocorticoid activity of the principal metabolites of under 1% of parent',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Breathed in, and mostly swallowed',
        laymanDesc:
          'Only a fraction of a puff reaches the small airways. The rest lands in the mouth and throat and is swallowed, which is where the mouth infections and the hoarse voice come from.',
        molecularDetail:
          'Lung deposition from the dry-powder inhaler is on the order of 15 to 30% of the metered dose and is inspiratory-flow dependent; the remainder is oropharyngeal. The swallowed fraction has an oral systemic availability of approximately 6 to 13% because of extensive CYP3A4 first-pass metabolism.',
        iconName: 'Wind',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It crosses into the cells lining the airway',
        laymanDesc:
          'Budesonide is fat-soluble enough to pass straight through the membrane of the cells lining the airway, without needing a transporter to carry it.',
        molecularDetail:
          'Passive diffusion across the epithelial plasma membrane driven by lipophilicity (logP approximately 3.2). Inside airway cells a fraction is reversibly esterified to budesonide-21-oleate, an inactive depot that hydrolyses back to free drug — the proposed explanation for airway retention beyond the roughly 2 to 3 hour plasma half-life.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It grabs the glucocorticoid receptor and rides it into the nucleus',
        laymanDesc:
          'A receptor sits waiting in the cell body. Budesonide binds it, the pair travel into the nucleus, and the receptor becomes able to reach the DNA.',
        molecularDetail:
          'Binding to the cytosolic glucocorticoid receptor (NR3C1) displaces the HSP90 chaperone complex, exposing nuclear localisation signals. The label puts budesonide affinity at roughly 200-fold that of cortisol in standard models. The receptor dimerises and translocates through the nuclear pore.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'It silences the genes that make inflammation',
        laymanDesc:
          'In the nucleus the receptor switches off the genes that produce inflammatory signals, and switches on a few that dampen them. The effect is on what the cell manufactures, which is why it takes days to weeks rather than minutes.',
        molecularDetail:
          'Transrepression of NF-kappa-B and AP-1 driven genes — GM-CSF, IL-4, IL-5, IL-8, eotaxin — largely through recruitment of histone deacetylase 2 to the activated transcriptional complex, alongside transactivation of anti-inflammatory genes including annexin A1 and MKP-1. Nothing here acts on airway smooth muscle tone.',
        iconName: 'Dna',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The airway lining calms down, and severe attacks become rarer',
        laymanDesc:
          'Over weeks the lining becomes less swollen and less twitchy. The measurable payoff is fewer severe attacks and fewer courses of steroid tablets, not a dramatic change in how much air you can blow out.',
        molecularDetail:
          'Reduced eosinophil and mast cell infiltration of the bronchial mucosa and reduced airway hyperresponsiveness. In START this produced a hazard ratio of 0.56 for first severe asthma-related event over three years, against a post-bronchodilator FEV1 gain of only 0.88% of predicted at three years.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'The fraction that escapes the liver acts everywhere else',
        laymanDesc:
          'Whatever is absorbed through the lung goes straight into the bloodstream and bypasses the liver entirely. That is the part that suppresses growth in children and bruises skin in adults.',
        molecularDetail:
          'Pulmonary absorption is not subject to first-pass metabolism, so lung-deposited drug contributes directly to systemic exposure. Measured consequences: 1.2 cm lower adult height after 4 to 6 childhood years in CAMP, and skin bruising in 10% versus 4% over three years in EUROSCOP.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'START — inhaled Steroid Treatment As Regular Therapy',
        phase: 'Randomised double-blind placebo-controlled trial, 3 years, 32 countries',
        sampleSize: 7241,
        primaryEndpoint: 'Time to first severe asthma-related event',
        endpointMet: true,
        statisticalPValue: 'Hazard ratio 0.56 (95% CI 0.45 to 0.71), P < 0.0001',
        unreportedAdverseSignals:
          'Three-year growth in children under 11 was 1.34 cm lower on budesonide, most of it lost in the first year. It is in the published abstract and is rarely quoted alongside the exacerbation result.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'CAMP adult-height follow-up (NCT00000575)',
        phase: 'Randomised controlled trial, 4 to 6 years of treatment, height measured at mean age 24.9',
        sampleSize: 943,
        primaryEndpoint: 'Attained adult height compared with placebo',
        endpointMet: true,
        statisticalPValue:
          'Budesonide 1.2 cm lower than placebo (95% CI -1.9 to -0.5), P = 0.001; nedocromil 0.2 cm lower, P = 0.61',
        unreportedAdverseSignals:
          'This is the adverse finding. 943 of the 1,041 randomised children (90.6%) were traced and measured, which is an unusually complete follow-up and makes the result hard to dismiss as attrition.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'EUROSCOP — budesonide in mild COPD in continuing smokers',
        phase: 'Randomised double-blind placebo-controlled trial, 3 years',
        sampleSize: 1277,
        primaryEndpoint: 'Rate of decline in post-bronchodilator FEV1 over three years',
        endpointMet: false,
        statisticalPValue:
          'Median decline 140 mL versus 180 mL, P = 0.05; rates identical from month 9 onward, P = 0.39',
        unreportedAdverseSignals:
          'Skin bruising in 10% on budesonide against 4% on placebo (P < 0.001) over three years.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'AstraZeneca FDA-mandated LABA safety trial (NCT01444430)',
        phase: 'Phase 3 randomised double-blind active-controlled safety trial, 26 weeks',
        sampleSize: 11693,
        primaryEndpoint:
          'Time to first adjudicated serious asthma-related event (death, intubation or hospitalisation), budesonide-formoterol versus budesonide alone',
        endpointMet: true,
        statisticalPValue:
          'Hazard ratio 1.07 (95% CI 0.70 to 1.65), non-inferiority margin 2.0 met; exacerbation hazard ratio 0.84 (0.74 to 0.94), P = 0.002',
        unreportedAdverseSignals:
          'Both asthma-related deaths in the trial were in the combination arm. With 83 events in total the trial cannot resolve a difference that small, and says so.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'PRINCIPLE budesonide arm (ISRCTN86534580)',
        phase: 'Open-label adaptive platform trial in UK primary care',
        sampleSize: 2530,
        primaryEndpoint:
          'Coprimary: time to first self-reported recovery, and COVID-related hospital admission or death within 28 days',
        endpointMet: false,
        statisticalPValue:
          'Recovery met superiority (2.94 days faster, probability > 0.999 against threshold 0.99); hospitalisation or death odds ratio 0.75 (95% BCI 0.55 to 1.03), probability 0.963 against threshold 0.975 — not met',
        unreportedAdverseSignals:
          'Open-label design with a self-reported primary endpoint. `endpointMet: false` records that one of the two coprimary endpoints failed, not that both did.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A 44% reduction in first severe asthma-related event over three years in 7,241 people with recent-onset mild persistent asthma (HR 0.56, 95% CI 0.45 to 0.71)',
        'Adult height 1.2 cm lower after 4 to 6 childhood years of budesonide, measured in 943 of 1,041 randomised CAMP participants at a mean age of 24.9',
        'No excess of adjudicated serious asthma events when formoterol was added to budesonide in 11,693 randomised patients (HR 1.07, 95% CI 0.70 to 1.65)',
        'Oral systemic availability of roughly 6 to 13% because of CYP3A4 first-pass metabolism, with principal metabolites under 1% as active as the parent',
      ],
      unsupportedInferences: [
        'That inhaled budesonide reduces COVID-19 hospitalisation or death — that coprimary endpoint in PRINCIPLE reached a probability of 0.963 against its own prespecified threshold of 0.975',
        'That childhood growth suppression on inhaled corticosteroids is recovered — held for two decades, and contradicted by the same cohort measured in adulthood',
        'That the FEV1 improvement is what the drug does for people; the measured lung-function gain in START was under 1% of predicted at three years while exacerbations nearly halved',
        'That inhaled and oral budesonide can be reasoned about interchangeably because they are the same molecule; first-pass metabolism makes their systemic exposure profiles different objects',
      ],
      whatFailedInitially: [
        'EUROSCOP: three years of budesonide did not change the rate of FEV1 decline in mild COPD, beyond a one-time improvement in the first six months',
        'The same trial found skin bruising in 10% on budesonide against 4% on placebo',
        'START recorded 1.34 cm of lost three-year growth in children under 11, prospectively, in the trial that established the benefit',
      ],
      realWorldOutcome: [
        'On the WHO Model List of Essential Medicines, and the standard inhaled corticosteroid for young children because the nebuliser suspension needs no coordination to use',
        'US$0.7198 per millilitre of inhalation suspension at United States pharmacy acquisition cost, while the branded dry-powder and delayed-release oral forms remain far more expensive because the device and the coating are patented, not the steroid',
        'The FDA removed the boxed warning about long-acting beta-agonists from budesonide-formoterol and the rest of the class in December 2017, after four mandated trials totalling 36,010 patients',
      ],
    },
    deliverySystem: {
      type:
        'Dry-powder inhaler, nebuliser suspension, nasal spray, and oral delayed-release capsules and extended-release tablets',
      description:
        'The route is the drug. Inhaled budesonide reaches the airway lining and is then largely destroyed by the liver if swallowed; the delayed-release oral capsule is coated to release in the ileum and ascending colon and relies on the same first-pass metabolism to keep systemic exposure low. The nebuliser suspension exists because a young child cannot coordinate an inhaler, not because it is more effective.',
      safetyProfile:
        'Local effects are oral candidiasis, dysphonia and cough. Systemic effects come from the fraction absorbed through the lung, which bypasses the liver: reduced growth velocity in children with a measured 1.2 cm loss in attained adult height, skin bruising, and at higher exposures adrenal suppression, cataract, glaucoma and reduced bone mineral density. Strong CYP3A4 inhibitors including ketoconazole and ritonavir raise plasma budesonide several-fold and have produced Cushing syndrome and adrenal suppression. Budesonide is not a rescue medicine and does not treat an acute attack.',
    },
    commonQuestions: [
      {
        q: 'Will an inhaled steroid stunt my child growth?',
        a: 'It costs about a centimetre of final height, and that is a measurement rather than an estimate. In the Childhood Asthma Management Program, 1,041 children aged 5 to 13 were randomised to budesonide, nedocromil or placebo for 4 to 6 years, and 943 of them were traced and measured as adults at an average age of 25. The budesonide group ended up 1.2 cm shorter than placebo. The deficit was the same size as the one recorded after two years, so it was a one-off loss rather than a widening gap, and a larger dose in the first two years predicted a larger loss. What the number has to be set against is the other half of the same trial: those children had fewer hospitalisations and fewer courses of oral steroids, and uncontrolled asthma suppresses growth too.',
        auditNote:
          'The field held for twenty years that the growth effect was temporary. This is the trial that settled it, and it settled it against the field.',
      },
      {
        q: 'Can I use it when I am having an attack?',
        a: 'No. Budesonide works by changing which genes an airway cell is transcribing, and that takes days to weeks. It does nothing to airway smooth muscle, which is what tightens during an attack. The label says so directly and the drug is not indicated for acute bronchospasm. Treating a worsening attack with a preventer inhaler rather than a reliever wastes the time in which the attack could have been treated.',
      },
      {
        q: 'Does budesonide help COPD the way it helps asthma?',
        a: 'Much less, and not in the way it was originally hoped. EUROSCOP gave 1,277 smokers with mild COPD budesonide or placebo for three years and found no difference in the rate at which lung function declined — the arms separated slightly in the first six months and then fell at identical rates. The place inhaled corticosteroids do earn in COPD is exacerbation reduction in people who have frequent exacerbations, generally in combination with a bronchodilator, and that is a narrower claim than slowing the disease. This page does not carry the COPD combination trials; the drugs they tested have their own pages.',
      },
      {
        q: 'Did budesonide treat COVID-19?',
        a: 'It shortened recovery and probably did not do more than that. PRINCIPLE randomised older UK primary-care patients with COVID-19 to inhaled budesonide or usual care and found recovery about three days faster, with a probability of superiority above 0.999. The trial also had a second coprimary endpoint, hospital admission or death, and there budesonide reached a probability of 0.963 against a threshold it had set in advance at 0.975. It missed. The trial was open-label and the recovery endpoint was what participants reported about themselves, which is exactly the endpoint an unblinded design is least able to protect.',
        auditNote:
          'The gap between "met one coprimary endpoint" and "reduced hospitalisation" is where most of the popular coverage of this trial sat.',
      },
      {
        q: 'Why does this page show a price but no manufacturing cost?',
        a: 'Because no per-dose cost of production for budesonide could be verified and cited. The published cost-of-production literature reports aggregate ranges or holds per-drug figures in supplementary appendices this file could not check line by line, and estimating one here would mean inventing a number. What is shown instead is the CMS National Average Drug Acquisition Cost — what a United States pharmacy pays to buy the product — which is a price and not a cost of manufacture.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Pauwels RA, Pedersen S, Busse WW, et al. Early intervention with budesonide in mild persistent asthma: a randomised, double-blind trial (START). Lancet 2003;361:1071-1076',
        identifier: '10.1016/S0140-6736(03)12891-7',
        kind: 'doi',
      },
      {
        label:
          'Kelly HW, Sternberg AL, Lescher R, et al. Effect of inhaled glucocorticoids in childhood on adult height. N Engl J Med 2012;367:904-912',
        identifier: '10.1056/NEJMoa1203229',
        kind: 'doi',
      },
      {
        label:
          'Childhood Asthma Management Program (CAMP) — the randomised trial the adult-height analysis follows',
        identifier: 'NCT00000575',
        kind: 'nct',
      },
      {
        label:
          'Pauwels RA, Löfdahl CG, Laitinen LA, et al. Long-term treatment with inhaled budesonide in persons with mild COPD who continue smoking (EUROSCOP). N Engl J Med 1999;340:1948-1953',
        identifier: '10.1056/NEJM199906243402503',
        kind: 'doi',
      },
      {
        label:
          'Peters SP, Bleecker ER, Canonica GW, et al. Serious Asthma Events with Budesonide plus Formoterol vs. Budesonide Alone. N Engl J Med 2016;375:850-860',
        identifier: '10.1056/NEJMoa1511190',
        kind: 'doi',
      },
      {
        label:
          'A 26-week safety study comparing Symbicort with inhaled corticosteroid alone in asthmatic adults and adolescents — the FDA-mandated AstraZeneca trial',
        identifier: 'NCT01444430',
        kind: 'nct',
      },
      {
        label:
          'Yu LM, Bafadhel M, Dorward J, et al. Inhaled budesonide for COVID-19 in people at high risk of complications in the community in the UK (PRINCIPLE). Lancet 2021;398:843-855',
        identifier: '10.1016/S0140-6736(21)01744-X',
        kind: 'doi',
      },
      {
        label:
          'Busse WW, Bateman ED, Caplan AL, et al. Combined Analysis of Asthma Safety Trials of Long-Acting beta2-Agonists. N Engl J Med 2018;378:2497-2505 — the four-trial analysis behind removal of the class boxed warning',
        identifier: '10.1056/NEJMoa1716868',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 5281004 — budesonide structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5281004',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 2. Formoterol — the fast full agonist that made a maintenance drug usable as a reliever, and
  //    carried a boxed warning for twelve years on the strength of a trial of a different molecule.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'formoterol',
    name: 'Formoterol',
    tradeName: 'Foradil / Foradil Certihaler / Perforomist',
    sponsor:
      'Novartis (Foradil in the United States); the Perforomist nebuliser solution is from Mylan, now Viatris',
    targetGene: 'ADRB2',
    targetProtein: 'Beta-2 adrenergic receptor, a Gs-coupled seven-transmembrane receptor',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2001,
    indication:
      'Long-term twice-daily maintenance treatment of bronchoconstriction in chronic obstructive pulmonary disease including chronic bronchitis and emphysema (inhalation solution); long-term maintenance treatment of asthma only in combination with an inhaled corticosteroid, and prevention of exercise-induced bronchospasm (inhalation powder). Not indicated for acute deteriorations of COPD, and the inhalation solution is not indicated for asthma at all',
    patientFriendlyIndication:
      'Keeps the airway muscle relaxed for about twelve hours at a time, in COPD, and in asthma only alongside a steroid inhaler',
    anatomicalSite: 'Airway smooth muscle cell membrane, from the bronchi to the small airways',
    conditionContext: {
      conditionExplainer:
        'The muscle wrapped around each airway can tighten and narrow the tube. In COPD it is tight much of the time on top of airways that are already damaged; in asthma it tightens in episodes on top of an inflamed lining. Formoterol relaxes that muscle and does nothing about anything else.',
      whyItMatters:
        'Relaxing muscle makes breathing easier immediately and does not touch the underlying disease. In asthma that distinction is not academic: a drug that makes an attack feel better while the inflammation worsens can let a person walk into a fatal attack feeling controlled, which is the whole reason this class has the safety history it has.',
      whoTakesThis:
        'People with COPD needing a maintenance bronchodilator, and people with asthma who are already on an inhaled corticosteroid. The label forbids using it alone in asthma.',
      clinicalGoals:
        'Trough FEV1 and symptom relief in COPD. In asthma the goal that matters is fewer exacerbations, and formoterol only delivers that when a steroid is in the same inhaler.',
    },
    oneSentenceVerdict:
      'A full beta-2 agonist that relaxes airway smooth muscle within one to three minutes and keeps it relaxed for about twelve hours; added to budesonide in 852 patients it cut severe asthma exacerbations by 26%, and it wore a boxed warning from 2005 to 2017 that was generated by a trial of salmeterol, not of formoterol.',
    laymanHowItWorks:
      'Each airway is wrapped in a ring of muscle that can squeeze it shut. Formoterol docks onto a receptor on those muscle cells and triggers a chemical signal inside them that makes the muscle let go. It is unusual among the long-acting versions in that it works almost as fast as a rescue inhaler — one to three minutes — because it activates the receptor fully rather than partially, while a fatty tail on the molecule parks it in the cell membrane so it keeps re-engaging for about twelve hours. It does nothing about the inflammation underneath, which is why in asthma it is only ever given with a steroid.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 84,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$1.34 per millilitre of formoterol fumarate inhalation solution, the median across 42 listed products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'First synthesised at Yamanouchi in Japan in the 1970s and licensed widely; the United States dry-powder product Foradil Aerolizer was approved in 2001 and the Perforomist nebuliser solution in 2007. Composition-of-matter protection has expired and the nebuliser solution is generic. The commercially important formoterol products are not the single agent at all but the fixed combinations — budesonide-formoterol, mometasone-formoterol, glycopyrrolate-formoterol and the triple inhalers — where the patent that matters covers the device and the co-formulation.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Formoterol competes with salmeterol on speed and with albuterol on duration, and the honest summary is that the three are separated by pharmacology rather than by outcomes. Formoterol is the only long-acting beta-agonist fast enough to be used as a reliever, which is the entire basis of the as-needed budesonide-formoterol regimens. Nothing that is not a beta-2 agonist substitutes for a beta-2 agonist.',
      conventionalRx: [
        {
          name: 'Salmeterol (Serevent)',
          class: 'Long-acting beta-2 agonist, partial agonist',
          howItCompares:
            'Same receptor, same twelve hours, but a partial agonist with an onset of roughly fifteen to twenty minutes, which makes it unusable as a reliever. Its own postmarketing trial, SMART, produced the deaths that put a boxed warning on formoterol as well.',
          typicalCost:
            'US$6.74 per unit, the median across 30 listed products at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: long-established, large combination evidence base. Cons: too slow for rescue use, and the molecule whose safety signal the whole class inherited.',
        },
        {
          name: 'Albuterol (salbutamol)',
          class: 'Short-acting beta-2 agonist',
          howItCompares:
            'The same receptor with a similar onset and about four hours of effect instead of twelve. In Novel START, as-needed budesonide-formoterol halved the annualised exacerbation rate against as-needed albuterol (0.195 versus 0.400, relative rate 0.49, 95% CI 0.33 to 0.72, P<0.001) in 668 adults with mild asthma.',
          typicalCost:
            'US$0.2505 per millilitre, the median across 68 listed products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: cheapest bronchodilator in the world, and the only one licensed for use on its own in asthma. Cons: relieves without treating, and reliever-only asthma is the pattern associated with fatal attacks.',
        },
        {
          name: 'Arformoterol (Brovana)',
          class: 'The (R,R)-enantiomer of formoterol, nebuliser solution, COPD only',
          howItCompares:
            'Formoterol is dispensed as a mixture of the (R,R) and (S,S) diastereomers, and essentially all the beta-2 activity sits in (R,R). Arformoterol is that half isolated. It is licensed for COPD only and there is no outcome trial showing the single enantiomer beats the mixture on anything a patient would notice.',
          typicalCost:
            'US$0.6145 per millilitre, the median across 27 listed products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: half the total drug for the same active dose, in principle. Cons: a chiral-switch product whose advantage over the racemate has never been demonstrated on an outcome.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Check that an asthma inhaler containing formoterol also contains a steroid',
          action:
            'Read the box. If the only ingredient is formoterol and the diagnosis is asthma, that is a combination the label does not permit.',
          patientImpact:
            'The FDA label states that long-acting beta-2 agonists used without an inhaled corticosteroid increase the risk of asthma-related death, and the single-agent inhalation solution is explicitly not indicated for asthma.',
          clinicalPrecaution:
            'This is a labelling fact, not a reason to stop anything. Changing a prescribed inhaler is a conversation with the prescriber, and stopping a bronchodilator abruptly in COPD has its own consequences.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(CC1=CC=C(C=C1)OC)NCC(C2=CC(=C(C=C2)O)NC=O)O',
      chemicalFormula: 'C19H24N2O4',
      molecularWeight: '344.40 g/mol (free base); dispensed as the fumarate dihydrate salt',
      targetReceptorAffinity:
        'A near-full agonist at the beta-2 adrenoceptor with roughly 200-fold selectivity for beta-2 over beta-1 in functional assays, against about 1,000-fold for salmeterol. Formoterol has two stereocentres and the marketed drug is a racemate of the (R,R) and (S,S) diastereomers, with essentially all of the beta-2 activity residing in (R,R) — the enantiomer sold separately as arformoterol. Intrinsic efficacy, not affinity, is what separates it from salmeterol: salmeterol is a partial agonist and formoterol is not.',
      structureSource: {
        label: 'PubChem CID 3410 (formoterol) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3410',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'form-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Chiral method qualification before any coupling',
          description:
            'Establish and qualify the chiral HPLC method that resolves all four stereoisomers of formoterol before the fragments are made. The drug substance is a defined diastereomeric pair and the two unwanted isomers are the critical impurities, so a method that cannot see them cannot release anything downstream.',
          reagentsAndBuffer:
            'Formoterol fumarate reference standard, all-four-isomer resolution test mixture, polysaccharide chiral stationary phase, n-hexane and ethanol with diethylamine modifier, UV detection at 214 nm',
        },
        {
          id: 'form-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Coupling of the formanilide epoxide fragment with the methoxyphenyl amine',
          description:
            'Open the benzylic epoxide of the protected 4-benzyloxy-3-formamidophenyl fragment with 1-(4-methoxyphenyl)propan-2-amine to form the secondary amine that carries the pharmacophore, then remove the benzyl protecting group by hydrogenolysis. The formamide on the ring is what distinguishes formoterol from the catechol agonists and is the reason it is not a substrate for catechol-O-methyltransferase.',
          dependsOnStepId: 'form-w1',
          reagentsAndBuffer:
            'Protected styrene oxide fragment, 1-(4-methoxyphenyl)propan-2-amine, isopropanol or dimethyl sulfoxide, palladium on carbon with hydrogen for debenzylation, nitrogen blanket',
        },
        {
          id: 'form-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Fumarate salt formation and diastereomer control',
          description:
            'Crystallise the fumarate dihydrate from aqueous alcohol and assay the isomer distribution against specification. Formation of the salt is also the purification: the fumarate crystallises far more selectively than the free base and is what makes a consistent isomer ratio achievable at scale.',
          dependsOnStepId: 'form-w2',
          reagentsAndBuffer:
            'Fumaric acid, isopropanol and purified water, chiral HPLC as qualified in step 1, Karl Fischer titration for the dihydrate stoichiometry',
        },
        {
          id: 'form-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Membrane partitioning and washout resistance in airway smooth muscle',
          description:
            'Expose cultured human airway smooth muscle cells to formoterol, wash extensively, and measure whether receptor activation persists. This is the experiment that distinguishes the depot models from a simple affinity explanation: a lipophilic drug that partitions into the bilayer keeps signalling after washout, and a merely high-affinity one does not.',
          dependsOnStepId: 'form-w3',
          reagentsAndBuffer:
            'Primary human airway smooth muscle cells, DMEM with 10% fetal bovine serum, repeated Krebs-Henseleit buffer washes, propranolol as beta-blocker challenge, LC-MS/MS quantification of membrane-associated drug',
        },
        {
          id: 'form-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Cyclic AMP accumulation and intrinsic efficacy against a full agonist reference',
          description:
            'Measure cyclic AMP accumulation across a concentration range and express the maximum as a fraction of isoprenaline, the reference full agonist, in the same cells. Reporting the maximum and not only the potency is the point: formoterol and salmeterol have comparable potencies and different maxima, and the difference in maximum is what makes one usable as a reliever.',
          dependsOnStepId: 'form-w4',
          reagentsAndBuffer:
            'HTRF or ELISA cyclic AMP detection kit, isoprenaline and salmeterol as full and partial agonist references, 3-isobutyl-1-methylxanthine to block phosphodiesterase, ICI-118551 for beta-2 selectivity control',
        },
      ],
    },
    keyAudits: [
      {
        id: 'form-a1',
        category: 'conclusion_shift',
        title: 'Formoterol wore a boxed warning generated by a trial of a different molecule',
        laymanSummary:
          'The 2005 warning about long-acting bronchodilators came from SMART, a trial of salmeterol. Formoterol was never in it. The warning was applied to formoterol as a class assumption and stayed there for twelve years until trials of formoterol itself removed it.',
        technicalDetails:
          'The Salmeterol Multicenter Asthma Research Trial randomised 26,355 subjects to salmeterol 42 micrograms twice daily or placebo added to usual care and was stopped at interim analysis. Asthma-related deaths were 13 on salmeterol against 3 on placebo, relative risk 4.37 (95% CI 1.25 to 15.34), with the imbalance concentrated in African-American participants. The molecule tested was salmeterol. The boxed warning that followed was applied to the whole long-acting beta-agonist class, formoterol included. In 2010 the FDA required the four companies marketing these drugs to run harmonised safety trials, and the combined analysis of those four trials in 36,010 adolescents and adults found 3 asthma-related intubations and 2 asthma-related deaths in total, with serious asthma-related events in 0.60% on inhaled glucocorticoid alone against 0.66% on combination therapy (relative risk 1.09, 95% CI 0.83 to 1.43, P=0.55), and 17% fewer exacerbations on combination (relative risk 0.83, 95% CI 0.78 to 0.89, P<0.001). The FDA removed the boxed warning from the combination products in December 2017.',
        evidenceSource:
          'Nelson HS et al., Chest 2006;129:15-26 (SMART); Busse WW et al., N Engl J Med 2018;378:2497-2505',
        doi: '10.1056/NEJMoa1716868',
        inferredClaim:
          'That a mortality signal measured for salmeterol monotherapy applies to formoterol given with an inhaled corticosteroid — a class extrapolation that governed labelling for twelve years and that the mandated trials did not support',
        auditFlag: 'verified',
      },
      {
        id: 'form-a2',
        category: 'measured',
        title: 'FACET: adding formoterol to low-dose budesonide cut severe exacerbations by 26%',
        laymanSummary:
          'In 852 patients still symptomatic on a steroid inhaler, adding formoterol reduced severe attacks by a quarter and mild attacks by 40%. Quadrupling the steroid instead reduced severe attacks by half. Doing both was best.',
        technicalDetails:
          'The Formoterol and Corticosteroids Establishing Therapy trial ran a four-week run-in on budesonide 800 micrograms twice daily, then randomised 852 patients to budesonide 100 micrograms twice daily with or without formoterol 12 micrograms twice daily, or budesonide 400 micrograms twice daily with or without formoterol, for one year. A severe exacerbation required oral glucocorticoids or a fall in peak flow of more than 30% below baseline on two consecutive days. Against low-dose budesonide alone, adding formoterol reduced severe exacerbations by 26% and mild by 40%; higher-dose budesonide alone reduced them by 49% and 37%; the two together by 63% and 62%. Symptoms and lung function improved more with formoterol than with the higher steroid dose, and adding formoterol did not worsen asthma control.',
        evidenceSource: 'Pauwels RA et al., N Engl J Med 1997;337:1405-1411 (FACET)',
        doi: '10.1056/NEJM199711133372001',
        measuredMetric: 'Rate of severe and mild asthma exacerbations over one year',
        auditFlag: 'verified',
      },
      {
        id: 'form-a3',
        category: 'inferred',
        title: 'SYGMA 1 found as-needed dosing inferior to maintenance on its own primary endpoint',
        laymanSummary:
          'The trial that launched the idea of using a steroid-plus-formoterol inhaler only when you need it is quoted as showing it works as well as taking it every day. On the endpoint it was designed around, it did not — it was clearly worse.',
        technicalDetails:
          'SYGMA 1 (NCT02149199) randomised 3,849 patients aged 12 and over with mild asthma to as-needed terbutaline, as-needed budesonide-formoterol (200 micrograms budesonide with 6 micrograms formoterol) or twice-daily budesonide with as-needed terbutaline, for 52 weeks. The primary endpoint was electronically recorded weeks with well-controlled asthma. As-needed budesonide-formoterol beat as-needed terbutaline narrowly (34.4% versus 31.1% of weeks; odds ratio 1.14, 95% CI 1.00 to 1.30, P=0.046) and was clearly inferior to budesonide maintenance (34.4% versus 44.4%; odds ratio 0.64, 95% CI 0.57 to 0.73). Annual severe exacerbation rates were 0.20, 0.07 and 0.09 respectively; the rate ratio against terbutaline was 0.36 (95% CI 0.27 to 0.49) and against budesonide maintenance 0.83 (95% CI 0.59 to 1.16). The regimen delivered a median 57 micrograms of inhaled glucocorticoid per day against 340 micrograms on maintenance, 17% of the dose. Adherence in the maintenance arm was 78.9%, higher than clinical practice, which is the direction that flatters the comparator.',
        evidenceSource: 'O Byrne PM et al., N Engl J Med 2018;378:1865-1876 (SYGMA 1, NCT02149199)',
        doi: '10.1056/NEJMoa1715274',
        inferredClaim:
          'That as-needed budesonide-formoterol is equivalent to daily maintenance therapy in mild asthma — true for exacerbations, false for the symptom-control endpoint the trial was powered on, where it lost with an odds ratio of 0.64',
        auditFlag: 'caution',
      },
      {
        id: 'form-a4',
        category: 'measured',
        title: 'Novel START: as-needed budesonide-formoterol halved exacerbations against albuterol',
        laymanSummary:
          'In an open trial that let people behave as they do in real life, using a combined steroid-and-formoterol inhaler for symptom relief produced half the attacks of using a plain rescue inhaler.',
        technicalDetails:
          'Novel START (ACTRN12615000999538) was a 52-week open-label trial in 675 adults with mild asthma, 668 analysed, randomised to as-needed albuterol, twice-daily budesonide with as-needed albuterol, or as-needed budesonide-formoterol, with electronic inhaler monitoring. The annualised exacerbation rate was 0.195 on budesonide-formoterol against 0.400 on albuterol (relative rate 0.49, 95% CI 0.33 to 0.72, P<0.001) and did not differ from budesonide maintenance (0.175; relative rate 1.12, 95% CI 0.70 to 1.79, P=0.65). Severe exacerbations numbered 9 on budesonide-formoterol against 23 on albuterol (relative risk 0.40, 95% CI 0.18 to 0.86) and 21 on budesonide maintenance (relative risk 0.44, 95% CI 0.20 to 0.96). Mean inhaled budesonide was 107 micrograms per day against 222 on maintenance. The trial was open-label by design, to capture the adherence behaviour a blinded trial removes.',
        evidenceSource: 'Beasley R et al., N Engl J Med 2019;380:2020-2030 (Novel START)',
        doi: '10.1056/NEJMoa1901963',
        measuredMetric: 'Annualised asthma exacerbation rate over 52 weeks under electronic monitoring',
        auditFlag: 'verified',
      },
      {
        id: 'form-a5',
        category: 'measured',
        title: 'Two mandated trials, 23,422 patients, no excess of serious asthma events',
        laymanSummary:
          'Formoterol was tested twice under regulatory order, once with budesonide and once with mometasone, in more than twenty thousand people. Neither trial found the extra risk the warning had assumed.',
        technicalDetails:
          'The AstraZeneca trial randomised 11,693 patients aged 12 and over to budesonide-formoterol or budesonide alone for 26 weeks: 43 versus 40 first adjudicated serious asthma-related events, hazard ratio 1.07 (95% CI 0.70 to 1.65), and 16.5% fewer exacerbations on combination (hazard ratio 0.84, 95% CI 0.74 to 0.94, P=0.002). The Merck trial, SPIRO (NCT01471340), randomised 11,729 patients across 35 countries to mometasone furoate-formoterol or mometasone furoate alone for 26 weeks: 81 serious asthma outcomes, all hospitalisations, in 71 patients — 39 on combination and 32 on mometasone alone, hazard ratio 1.22 (95% CI 0.76 to 1.94, P=0.411) — and a hazard ratio of 0.89 (95% CI 0.80 to 0.98, P=0.021) for first exacerbation. Both are non-inferiority safety trials with event counts in the tens; they exclude a large excess risk and cannot exclude a small one.',
        evidenceSource:
          'Peters SP et al., N Engl J Med 2016;375:850-860 (NCT01444430); Weinstein CLJ et al., J Allergy Clin Immunol 2019;143:1395-1402 (SPIRO, NCT01471340)',
        doi: '10.1016/j.jaci.2018.10.065',
        measuredMetric:
          'First adjudicated serious asthma-related event and first exacerbation over 26 weeks, in two independent trials',
        auditFlag: 'verified',
      },
      {
        id: 'form-a6',
        category: 'failed',
        title: 'The Cochrane pooling still cannot rule out a mortality signal, and children are unresolved',
        laymanSummary:
          'Pooling every randomised trial of formoterol with a steroid found six deaths on formoterol and one without it. The difference was not statistically significant, but the confidence interval is wide enough to contain real harm, and the paediatric data are thinner still.',
        technicalDetails:
          'Cates and colleagues pooled 20 studies in 10,578 adults and adolescents and seven studies in 2,788 children and adolescents comparing regular formoterol plus inhaled corticosteroid against the same dose of inhaled corticosteroid alone. Six deaths occurred on formoterol and one on the comparator (Peto odds ratio 3.56, 95% CI 0.79 to 16.03, graded low-quality evidence); all were in adults and one was believed asthma-related. Non-fatal serious adverse events of any cause were similar in adults (Peto OR 0.98, 95% CI 0.76 to 1.27) while asthma-related serious adverse events were significantly fewer on formoterol (Peto OR 0.49, 95% CI 0.28 to 0.88). In children, all-cause serious adverse events trended up (Peto OR 1.62, 95% CI 0.80 to 3.28) and asthma-related events too (Peto OR 1.49, 95% CI 0.48 to 4.61), both imprecise. The authors conclude it is not possible to reassure people that regular formoterol with an inhaled corticosteroid carries no increase in mortality, while finding no conclusive evidence of harm across more than 4,200 patient-years.',
        evidenceSource: 'Cates CJ, Jaeschke R, Schmidt S, Ferrer M. Cochrane Database Syst Rev 2013;(6):CD006924',
        doi: '10.1002/14651858.CD006924.pub3',
        measuredMetric:
          'All-cause and asthma-related fatal and non-fatal serious adverse events, pooled across 27 randomised trials',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Inhaled as a powder or a nebulised mist',
        laymanDesc:
          'The dose is measured in micrograms, so almost nothing reaches the bloodstream even when the whole dose is absorbed. What matters is how much lands past the throat.',
        molecularDetail:
          'Metered doses are 12 micrograms from the dry-powder capsule and 20 micrograms per 2 mL nebule of the inhalation solution. Onset of bronchodilation is within 1 to 3 minutes and effect persists for approximately 12 hours, which is the basis of twice-daily dosing.',
        iconName: 'Wind',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It parks itself in the membrane of the muscle cell',
        laymanDesc:
          'The molecule is greasy enough to dissolve into the fatty membrane of the airway muscle cell and sit there, close to its target, instead of washing away.',
        molecularDetail:
          'Moderate lipophilicity drives partitioning into the plasma membrane lipid bilayer, forming a depot adjacent to the receptor. This is the microkinetic explanation for a 12-hour duration despite receptor dissociation kinetics that are not exceptionally slow, and it is why washout experiments do not abolish the effect.',
        iconName: 'Layers',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It switches the beta-2 receptor fully on',
        laymanDesc:
          'It binds a receptor on the muscle cell surface and turns it all the way on, not partly on. That is the difference between formoterol and salmeterol, and it is why formoterol works in minutes.',
        molecularDetail:
          'Near-full agonism at the beta-2 adrenoceptor, against salmeterol partial agonism at the same site. The active species is the (R,R) diastereomer; the (S,S) contributes essentially nothing. Roughly 200-fold beta-2 over beta-1 selectivity means the beta-1 mediated effects — tremor, tachycardia, hypokalaemia — appear as exposure rises.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Cyclic AMP rises and the muscle lets go',
        laymanDesc:
          'The activated receptor sets off a chemical messenger inside the muscle cell that tells it to relax. The airway opens.',
        molecularDetail:
          'Gs-coupled activation of adenylyl cyclase raises intracellular cyclic AMP, activating protein kinase A, which phosphorylates myosin light-chain kinase and lowers its affinity for calcium-calmodulin. Free intracellular calcium falls through several routes and the smooth muscle relaxes. Nothing in this pathway touches eosinophils, epithelium or mucus.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Airflow improves for about twelve hours, and the inflammation is untouched',
        laymanDesc:
          'Breathing gets easier and stays easier for half a day. Nothing about the underlying inflammation has changed, which is why in asthma this must be paired with a steroid.',
        molecularDetail:
          'Sustained bronchodilation without any anti-inflammatory effect. In FACET, adding formoterol to low-dose budesonide reduced severe exacerbations 26%; in asthma the label prohibits use without a concurrent inhaled corticosteroid because monotherapy relieves symptoms while inflammation progresses.',
        iconName: 'TrendingUp',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Repeated stimulation blunts the receptor',
        laymanDesc:
          'Receptors that are switched on constantly get pulled off the cell surface. The drug becomes less effective over time, which is one reason regular use of a bronchodilator alone is a poor strategy.',
        molecularDetail:
          'Agonist-driven phosphorylation by G-protein-coupled receptor kinases recruits beta-arrestin, uncoupling the receptor from Gs and driving internalisation. Tolerance to the bronchoprotective effect appears within days of regular dosing; inhaled corticosteroids upregulate beta-2 receptor transcription, which is one mechanistic argument for why the two belong in the same inhaler.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'FACET — Formoterol and Corticosteroids Establishing Therapy',
        phase: 'Randomised double-blind four-arm trial, 12 months',
        sampleSize: 852,
        primaryEndpoint: 'Rate of severe and mild asthma exacerbations',
        endpointMet: true,
        statisticalPValue:
          'Severe exacerbations reduced 26% by adding formoterol to low-dose budesonide, 49% by the higher budesonide dose alone, and 63% by both',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'SYGMA 1 (NCT02149199)',
        phase: 'Phase 3 randomised double-blind three-arm trial, 52 weeks',
        sampleSize: 3849,
        primaryEndpoint:
          'Electronically recorded percentage of weeks with well-controlled asthma, as-needed budesonide-formoterol versus as-needed terbutaline',
        endpointMet: true,
        statisticalPValue:
          'Superior to terbutaline: 34.4% versus 31.1% of weeks, odds ratio 1.14 (95% CI 1.00 to 1.30), P = 0.046',
        unreportedAdverseSignals:
          'Against the third arm the result reverses: as-needed dosing was inferior to budesonide maintenance, 34.4% versus 44.4% of weeks, odds ratio 0.64 (95% CI 0.57 to 0.73). The trial is usually cited for the arm it won.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Novel START (ACTRN12615000999538)',
        phase: 'Randomised open-label three-arm trial with electronic inhaler monitoring, 52 weeks',
        sampleSize: 675,
        primaryEndpoint: 'Annualised rate of asthma exacerbations',
        endpointMet: true,
        statisticalPValue:
          'Relative rate 0.49 (95% CI 0.33 to 0.72) against as-needed albuterol, P < 0.001; 1.12 (0.70 to 1.79) against budesonide maintenance, P = 0.65',
        unreportedAdverseSignals:
          'Open-label. That is deliberate — the trial exists to capture adherence behaviour — but it means symptom-based endpoints in it are unblinded.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'AstraZeneca FDA-mandated LABA safety trial (NCT01444430)',
        phase: 'Phase 3 randomised double-blind safety trial, 26 weeks',
        sampleSize: 11693,
        primaryEndpoint:
          'Time to first adjudicated serious asthma-related event, budesonide-formoterol versus budesonide alone',
        endpointMet: true,
        statisticalPValue: 'Hazard ratio 1.07 (95% CI 0.70 to 1.65); non-inferiority margin 2.0 met',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'SPIRO (NCT01471340)',
        phase: 'Phase 3 randomised double-blind safety trial, 26 weeks, 35 countries',
        sampleSize: 11729,
        primaryEndpoint:
          'Adjudicated serious asthma outcome (hospitalisation, intubation or death), mometasone-formoterol versus mometasone alone',
        endpointMet: true,
        statisticalPValue: 'Hazard ratio 1.22 (95% CI 0.76 to 1.94), P = 0.411',
        unreportedAdverseSignals:
          'All 81 serious asthma outcomes were hospitalisations; there were no intubations and no deaths. The point estimate favours the comparator and the interval is wide.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Cochrane pooling of regular formoterol with inhaled corticosteroid (CD006924)',
        phase: 'Systematic review of 27 randomised trials',
        sampleSize: 13366,
        primaryEndpoint: 'Fatal and non-fatal serious adverse events, all-cause and asthma-related',
        endpointMet: false,
        statisticalPValue:
          'Six deaths versus one, Peto odds ratio 3.56 (95% CI 0.79 to 16.03) — not significant, and not reassuring either',
        unreportedAdverseSignals:
          'In children the point estimates for both all-cause (1.62) and asthma-related (1.49) serious adverse events sit above 1 with intervals crossing it. The paediatric question is open.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A 26% reduction in severe asthma exacerbations when formoterol was added to low-dose budesonide in 852 patients over one year',
        'An annualised exacerbation rate of 0.195 with as-needed budesonide-formoterol against 0.400 with as-needed albuterol in 668 monitored adults',
        'No excess of adjudicated serious asthma events in 11,693 patients on budesonide-formoterol or 11,729 on mometasone-formoterol against the steroid alone',
        'Onset of bronchodilation within 1 to 3 minutes, and approximately 12 hours of effect, which is what makes a maintenance drug usable as a reliever',
      ],
      unsupportedInferences: [
        'That as-needed budesonide-formoterol matches daily maintenance therapy — SYGMA 1 found it inferior on its own primary symptom-control endpoint, odds ratio 0.64',
        'That the SMART mortality signal, measured for salmeterol monotherapy, described formoterol; twelve years of labelling rested on that class extrapolation',
        'That the mandated safety trials show formoterol is safe in children; they enrolled patients aged 12 and over, and the paediatric pooled estimates remain imprecise and point the wrong way',
        'That a bronchodilator improving FEV1 and symptoms is improving asthma; formoterol has no anti-inflammatory effect at all',
      ],
      whatFailedInitially: [
        'The Cochrane pooling found six deaths on formoterol plus inhaled corticosteroid against one on corticosteroid alone, Peto odds ratio 3.56 with an upper bound of 16.03',
        'SYGMA 1 lost decisively to budesonide maintenance on weeks of well-controlled asthma, the endpoint it was designed around',
        'The single-agent inhalation solution carries an explicit label statement that it is not indicated for asthma, after the class safety history',
      ],
      realWorldOutcome: [
        'The FDA removed the class boxed warning from inhaled-corticosteroid-plus-long-acting-beta-agonist products in December 2017',
        'As-needed budesonide-formoterol became the preferred reliever in the Global Initiative for Asthma strategy, a change that rests on formoterol speed rather than on any property of the steroid',
        'US$1.34 per millilitre of the generic nebuliser solution at United States pharmacy acquisition cost; the commercially significant products are the fixed combinations, where the patent covers the device',
      ],
    },
    deliverySystem: {
      type: 'Dry-powder inhaler capsule, and a unit-dose nebuliser solution for COPD',
      description:
        'The dry-powder capsule requires an inspiratory effort to disaggregate the powder, which is why the nebuliser solution exists for people who cannot generate one. Formoterol as a single agent is now a minor product: nearly all of its clinical use is inside fixed combinations with budesonide, mometasone or glycopyrrolate, and those trials tested the combination in its own device rather than the molecule alone.',
      safetyProfile:
        'Class effects are tremor, palpitations, headache, muscle cramp and dose-related hypokalaemia and hyperglycaemia. Paradoxical bronchospasm can occur and requires stopping. The label states that long-acting beta-2 agonists increase the risk of asthma-related death when used without an inhaled corticosteroid, and the inhalation solution is not indicated for asthma at any dose. Tolerance to the bronchoprotective effect develops with regular use. Caution with cardiovascular disease, thyrotoxicosis, and drugs that prolong the QT interval.',
    },
    commonQuestions: [
      {
        q: 'Why can formoterol be used as a rescue inhaler when salmeterol cannot?',
        a: 'Because of what the two molecules do to the receptor rather than how long they stay. Formoterol activates the beta-2 receptor almost fully and starts working in one to three minutes, close to albuterol. Salmeterol activates it only partly and takes fifteen to twenty minutes to get going. Both last about twelve hours. That speed difference is the entire mechanical basis of the as-needed budesonide-formoterol regimens: it is the only long-acting beta-agonist that can plausibly be reached for during symptoms, so it is the only one that can carry a steroid along with it every time a person feels short of breath.',
      },
      {
        q: 'Is it dangerous? It used to have a boxed warning.',
        a: 'It did, from 2005 to December 2017, and the warning came from a trial formoterol was not in. SMART tested salmeterol against placebo in 26,355 people and found 13 asthma deaths against 3, and the warning was applied to the whole class. The FDA then required each company to run its own trial. Formoterol was tested twice, with budesonide in 11,693 patients and with mometasone in 11,729, and neither found an excess of serious asthma events; the four-trial combined analysis of 36,010 patients found 0.60% versus 0.66% and 17% fewer exacerbations on combination. What has not been settled is children: the mandated trials enrolled patients aged 12 and over, and the pooled paediatric estimates remain too imprecise to say much.',
        auditNote:
          'The reversal was real and the trials were large. The Cochrane pooling still records six deaths against one, which is not significant and is also not nothing.',
      },
      {
        q: 'Does taking my inhaler only when I need it work as well as taking it every day?',
        a: 'For attacks, roughly yes. For day-to-day control, no, and the trial that is usually cited to say otherwise found so. SYGMA 1 randomised 3,849 people three ways for a year. As-needed budesonide-formoterol produced well-controlled asthma in 34.4% of weeks against 44.4% on daily budesonide — an odds ratio of 0.64 against the maintenance arm, on the endpoint the trial was powered for. Severe exacerbation rates were similar between the two, 0.07 against 0.09 a year, and the as-needed regimen delivered 17% of the steroid dose. The trade is real and it is a trade, not an equivalence.',
        auditNote:
          'The maintenance arm had 78.9% adherence, higher than clinical practice. Real-world adherence would narrow the gap, which is why the open-label Novel START trial matters alongside it.',
      },
      {
        q: 'Can I use formoterol on its own for asthma?',
        a: 'No, and the label is explicit about it. Long-acting beta-2 agonists used without an inhaled corticosteroid increase the risk of asthma-related death, and the formoterol inhalation solution states in its indications that it is not indicated for asthma at all. The reason is mechanistic rather than mysterious: formoterol relaxes airway muscle and does nothing to the inflammation, so a person on it alone can feel better while the disease underneath gets worse, and then meet an attack with no reserve.',
      },
      {
        q: 'Why does this page show a price but no manufacturing cost?',
        a: 'Because no per-dose cost of production for formoterol could be verified and cited. The published cost-of-production literature holds its per-drug figures in supplementary appendices this file could not check line by line, and estimating one would mean inventing a number. What is shown instead is the CMS National Average Drug Acquisition Cost — what a United States pharmacy pays to buy the product — which is a price and not a cost of manufacture.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Pauwels RA, Löfdahl CG, Postma DS, et al. Effect of inhaled formoterol and budesonide on exacerbations of asthma (FACET). N Engl J Med 1997;337:1405-1411',
        identifier: '10.1056/NEJM199711133372001',
        kind: 'doi',
      },
      {
        label:
          'Nelson HS, Weiss ST, Bleecker ER, Yancey SW, Dorinsky PM. The Salmeterol Multicenter Asthma Research Trial. Chest 2006;129:15-26',
        identifier: '10.1378/chest.129.1.15',
        kind: 'doi',
      },
      {
        label:
          'Busse WW, Bateman ED, Caplan AL, et al. Combined Analysis of Asthma Safety Trials of Long-Acting beta2-Agonists. N Engl J Med 2018;378:2497-2505',
        identifier: '10.1056/NEJMoa1716868',
        kind: 'doi',
      },
      {
        label:
          'O Byrne PM, FitzGerald JM, Bateman ED, et al. Inhaled Combined Budesonide-Formoterol as Needed in Mild Asthma (SYGMA 1). N Engl J Med 2018;378:1865-1876',
        identifier: '10.1056/NEJMoa1715274',
        kind: 'doi',
      },
      {
        label: 'SYGMA 1 — Symbicort Given as Needed in Mild Asthma',
        identifier: 'NCT02149199',
        kind: 'nct',
      },
      {
        label:
          'Beasley R, Holliday M, Reddel HK, et al. Controlled Trial of Budesonide-Formoterol as Needed for Mild Asthma (Novel START). N Engl J Med 2019;380:2020-2030',
        identifier: '10.1056/NEJMoa1901963',
        kind: 'doi',
      },
      {
        label:
          'Peters SP, Bleecker ER, Canonica GW, et al. Serious Asthma Events with Budesonide plus Formoterol vs. Budesonide Alone. N Engl J Med 2016;375:850-860',
        identifier: '10.1056/NEJMoa1511190',
        kind: 'doi',
      },
      {
        label:
          'Weinstein CLJ, Ryan N, Shekar T, et al. Serious asthma events with mometasone furoate plus formoterol compared with mometasone furoate (SPIRO). J Allergy Clin Immunol 2019;143:1395-1402',
        identifier: '10.1016/j.jaci.2018.10.065',
        kind: 'doi',
      },
      {
        label: 'SPIRO — the Merck FDA-mandated mometasone-formoterol safety trial',
        identifier: 'NCT01471340',
        kind: 'nct',
      },
      {
        label:
          'Cates CJ, Jaeschke R, Schmidt S, Ferrer M. Regular treatment with formoterol and inhaled steroids for chronic asthma: serious adverse events. Cochrane Database Syst Rev 2013;(6):CD006924',
        identifier: '10.1002/14651858.CD006924.pub3',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 3410 — formoterol structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3410',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
]
