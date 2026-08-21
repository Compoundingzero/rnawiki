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
  // ---------------------------------------------------------------------------------------------
  // 3. Salmeterol — the molecule that generated the boxed warning the whole class then wore, and
  //    the only one in this file still contraindicated on its own.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'salmeterol',
    name: 'Salmeterol',
    tradeName: 'Serevent / Serevent Diskus',
    sponsor: 'GlaxoSmithKline (Serevent Diskus, NDA 020692)',
    targetGene: 'ADRB2',
    targetProtein: 'Beta-2 adrenergic receptor — a Gs-coupled G-protein-coupled receptor',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1994,
    indication:
      'Treatment of asthma in patients aged 4 years and older, only in combination with an inhaled corticosteroid; prevention of exercise-induced bronchospasm in patients aged 4 years and older; maintenance treatment of bronchospasm associated with chronic obstructive pulmonary disease. Not indicated for relief of acute bronchospasm.',
    patientFriendlyIndication:
      'A twice-daily inhaler that keeps the muscle around the airway relaxed for about twelve hours',
    anatomicalSite:
      'Airway smooth muscle of the bronchi and bronchioles — the beta-2 receptor on the muscle cell surface, and the membrane pocket beside it',
    conditionContext: {
      conditionExplainer:
        'Every airway has a ring of muscle wrapped around it. In asthma and in chronic obstructive pulmonary disease that muscle tightens and narrows the tube, and in asthma the lining underneath is inflamed as well. Salmeterol works on the muscle. It does not touch the lining.',
      whyItMatters:
        'That division is the whole story of this drug. A medicine that relaxes the muscle makes a person breathe more easily while the inflammation carries on unattended, and the trial that found out what happens when it is used that way is the reason every long-acting beta-agonist on the market wore a boxed warning for twelve years.',
      whoTakesThis:
        'In asthma, only people already on an inhaled corticosteroid whose asthma is not controlled by it, and in practice almost always inside a single combination inhaler so the steroid cannot be skipped. In chronic obstructive pulmonary disease, where there is no equivalent death signal, it is used as maintenance treatment on its own or with other bronchodilators.',
      clinicalGoals:
        'Fewer symptoms and fewer exacerbations. Not survival: the one trial designed to show salmeterol-containing therapy extends life in chronic obstructive pulmonary disease missed its threshold at p=0.052.',
    },
    oneSentenceVerdict:
      'A beta-2 receptor agonist whose long greasy tail anchors it in the membrane beside the receptor so airway muscle stays relaxed for about twelve hours — given alone in asthma it produced 13 asthma deaths against 3 on placebo in 26,355 people, and given with an inhaled steroid to 11,679 people it produced no excess of serious asthma events and 21% fewer severe exacerbations, which is why it is contraindicated by itself and routine inside a combination inhaler.',
    laymanHowItWorks:
      'The muscle wrapped around each airway can tighten and squeeze the tube narrow. Salmeterol switches on a receptor on that muscle which raises a chemical messenger inside the cell and makes it let go, holding the airway open for about twelve hours. What makes it last that long is a long fatty tail on the molecule that buries itself in the cell membrane next to the receptor, so the working end keeps swinging back into place instead of washing away. It does nothing at all to the inflammation underneath, which is why using it without a steroid quietens the symptoms while the disease carries on — and that is the exact combination that produced the deaths in SMART.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 81,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$6.74 per unit, the median across 30 listed products at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Salmeterol xinafoate was first made at Glaxo in the late 1980s and its composition-of-matter protection expired long ago, yet the CMS acquisition survey still lists it as a brand product. The molecule is off patent; the Diskus dry-powder device that carries it, and the fixed-dose combinations built around it, are not. That gap between an old free molecule and a proprietary piece of plastic is the recurring reason a drug of this age is still bought at brand prices.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The alternatives to salmeterol are other long-acting bronchodilators, and the differences between them are real but small next to the difference between taking one with a steroid and taking one without. In chronic obstructive pulmonary disease there is one genuinely superior option on exacerbations, measured head to head in 7,376 people, and it is not a beta-agonist. Nothing eaten or drunk relaxes airway smooth muscle for twelve hours.',
      conventionalRx: [
        {
          name: 'Formoterol (Foradil, and inside Symbicort)',
          class: 'Long-acting beta-2 agonist',
          howItCompares:
            'The same receptor and roughly the same twelve hours, but a full agonist that works within one to three minutes rather than fifteen to twenty. That speed is why formoterol can be combined with a steroid in a single inhaler used both as maintenance and as a reliever, and salmeterol cannot.',
          typicalCost:
            'US$4.35 per unit at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: fast onset, usable in the as-needed anti-inflammatory reliever strategy. Cons: the same class warning applies, and it inherited a boxed warning generated by a trial of salmeterol rather than of itself.',
        },
        {
          name: 'Tiotropium (Spiriva)',
          class: 'Long-acting muscarinic antagonist',
          howItCompares:
            'Relaxes the same muscle by blocking the opposite signal, once daily instead of twice. In POET-COPD, a one-year head-to-head trial in 7,376 people with chronic obstructive pulmonary disease, tiotropium beat salmeterol on time to first exacerbation, hazard ratio 0.83 (95% CI 0.77 to 0.90, p<0.001).',
          typicalCost:
            'US$11.73 per unit at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: better than salmeterol on exacerbations in the only large head-to-head trial; once daily. Cons: dry mouth and urinary retention rather than tremor and palpitations; not a substitute for an inhaled steroid in asthma.',
        },
        {
          name: 'Vilanterol (only inside Breo, Anoro and Trelegy Ellipta)',
          class: 'Long-acting beta-2 agonist, 24-hour',
          howItCompares:
            'A newer beta-2 agonist with a full day of action, so the inhaler is used once daily rather than twice. It is not sold on its own anywhere, which means every piece of evidence for it is evidence for a combination product.',
          typicalCost:
            'US$6.50 per unit at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: once daily, and available in a single inhaler with a steroid and an antimuscarinic. Cons: the molecule has never been tested alone in a registration trial, so its own contribution cannot be separated from the products it lives in.',
        },
        {
          name: 'An inhaled corticosteroid alone',
          class: 'Inhaled corticosteroid',
          howItCompares:
            'In AUSTRI the steroid-only arm had the same rate of serious asthma events as the combination and 24% more severe exacerbations: 597 of 5,845 against 480 of 5,834. The steroid is the part that treats the disease; salmeterol is the part that adds control on top of it.',
          typicalCost:
            'US$0.6920 per millilitre of fluticasone propionate at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: no beta-agonist class warning, no tremor, treats the inflammation. Cons: measurably more exacerbations than the combination in an 11,679-patient trial.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Check that a steroid inhaler is part of the prescription',
          action:
            'If salmeterol has been prescribed for asthma, confirm that an inhaled corticosteroid is being taken as well — ideally inside the same inhaler.',
          patientImpact:
            'Salmeterol as monotherapy in asthma is contraindicated in the United States label. The boxed warning rests on 13 asthma deaths among 13,176 people on salmeterol against 3 among 13,179 on placebo, in a trial where background steroid use was not required.',
          clinicalPrecaution:
            'The reason a fixed-dose combination is preferred is adherence, not chemistry. Two separate inhalers can be reduced to one by a person who feels better, and the one that gets dropped is the one that does not produce an immediate sensation.',
        },
        {
          name: 'Do not reach for it during an attack',
          action:
            'Use the reliever inhaler for symptoms happening now; salmeterol is not one, whatever it feels like.',
          patientImpact:
            'Onset is roughly fifteen to twenty minutes, and the label states it is not indicated for relief of acute bronchospasm and must not be initiated in acutely deteriorating asthma.',
          clinicalPrecaution:
            'Using two products that both contain a long-acting beta-agonist is an overdose risk the label calls out specifically. A combination inhaler plus a separate salmeterol inhaler is that mistake.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1=CC=C(C=C1)CCCCOCCCCCCNCC(C2=CC(=C(C=C2)O)CO)O',
      chemicalFormula: 'C25H37NO4',
      molecularWeight: '415.60 g/mol',
      targetReceptorAffinity:
        'The label states that in vitro studies show salmeterol to be at least 50 times more selective for beta-2 adrenoceptors than albuterol. It also records that beta-2 adrenoceptors make up 10% to 50% of total beta-adrenoceptors in the human heart, so selectivity for the lung receptor does not mean absence of cardiac effect. Salmeterol is a partial agonist at the receptor, which is why it cannot be used as a reliever.',
      structureSource: {
        label: 'PubChem CID 5152 (salmeterol) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5152',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'sal-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity of the saligenin head group',
          description:
            'Confirm the hydroxymethyl-phenol head before any coupling. Salmeterol carries a saligenin ring rather than the catechol of adrenaline, and that substitution is what makes it resistant to catechol-O-methyltransferase. A catechol impurity is not a weaker drug but a short-acting one.',
          reagentsAndBuffer:
            'Salmeterol xinafoate reference standard, reversed-phase HPLC with ultraviolet detection at 278 nm, 1H NMR in DMSO-d6, Karl Fischer titration',
        },
        {
          id: 'sal-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Reductive amination joining the head to the phenylbutoxyhexyl tail',
          description:
            'Couple the protected saligenin amino alcohol to 6-(4-phenylbutoxy)hexanal or the corresponding bromide, then reduce. The tail added here is the entire reason the drug lasts twelve hours: it is a lipophilic anchor, not a pharmacophore, and shortening it shortens the duration of action.',
          dependsOnStepId: 'sal-w1',
          reagentsAndBuffer:
            'N-benzyl-protected saligenin amine, 6-(4-phenylbutoxy)hexyl bromide, potassium carbonate or sodium triacetoxyborohydride, anhydrous acetonitrile or dichloroethane, nitrogen atmosphere',
        },
        {
          id: 'sal-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Deprotection and formation of the 1-hydroxy-2-naphthoate salt',
          description:
            'Remove the benzyl protection by hydrogenolysis and crystallise the free base as the xinafoate salt. The xinafoate counter-ion is a formulation decision rather than a pharmacological one: it gives a crystalline solid stable enough to be micronised into a dry powder.',
          dependsOnStepId: 'sal-w2',
          reagentsAndBuffer:
            'Palladium on carbon under hydrogen, 1-hydroxy-2-naphthoic acid, isopropanol or ethanol for crystallisation, silica chromatography where required, differential scanning calorimetry to confirm the polymorph',
        },
        {
          id: 'sal-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Exposure of ADRB2-expressing cells and washout',
          description:
            'Dose Chinese hamster ovary cells stably expressing human ADRB2, then wash the cells repeatedly and re-measure. The washout is the point of the experiment: a short-acting agonist loses its effect when the medium is replaced, whereas salmeterol keeps signalling because the tail remains in the membrane. A protocol without a washout arm cannot distinguish the two.',
          dependsOnStepId: 'sal-w3',
          reagentsAndBuffer:
            'CHO-K1 cells stably transfected with human ADRB2, Ham F-12 medium with 10% fetal bovine serum and G418 selection, HEPES-buffered assay saline, 3-isobutyl-1-methylxanthine to block phosphodiesterase, repeated serum-free washes',
        },
        {
          id: 'sal-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'cAMP accumulation curve and partial-agonist ceiling',
          description:
            'Measure cyclic AMP against a full agonist run on the same plate. Salmeterol is a partial agonist and its curve plateaus below isoprenaline; reporting only an EC50 hides that ceiling, and the ceiling is the pharmacological reason the drug is useless as a reliever.',
          dependsOnStepId: 'sal-w4',
          reagentsAndBuffer:
            'Homogeneous time-resolved fluorescence cAMP kit, isoprenaline as full-agonist reference, ICI 118,551 as beta-2 selective antagonist control, CGP 20712A as beta-1 antagonist control',
        },
      ],
    },
    keyAudits: [
      {
        id: 'sal-a1',
        category: 'measured',
        title: 'SMART: 13 asthma deaths against 3 on placebo in 26,355 people',
        laymanSummary:
          'A safety trial added salmeterol or a dummy inhaler to whatever asthma treatment people were already on, and did not require them to be on a steroid. It was stopped early. Thirteen people died of asthma on salmeterol; three did on placebo.',
        technicalDetails:
          'The Salmeterol Multicenter Asthma Research Trial was a 28-week randomised, double-blind, placebo-controlled study of salmeterol 42 micrograms twice daily by metered-dose inhaler added to usual asthma care, terminated at an interim analysis of 26,355 subjects. The primary outcome, respiratory-related deaths or life-threatening experiences, was not significantly different: 50 against 36, relative risk 1.40 (95% CI 0.91 to 2.14). Significant differences appeared in respiratory-related deaths (24 against 11, RR 2.16, 95% CI 1.06 to 4.41), asthma-related deaths (13 against 3, RR 4.37, 95% CI 1.25 to 15.34) and combined asthma-related deaths or life-threatening experiences (37 against 22, RR 1.71, 95% CI 1.01 to 2.89). Background inhaled corticosteroid use was not required by the protocol.',
        evidenceSource: 'Nelson HS, Weiss ST, Bleecker ER, et al. Chest 2006;129:15-26 (SMART)',
        doi: '10.1378/chest.129.1.15',
        measuredMetric:
          'Asthma-related deaths on salmeterol added to usual care against placebo added to usual care',
        auditFlag: 'verified',
      },
      {
        id: 'sal-a2',
        category: 'measured',
        title: 'AUSTRI: with a steroid in the same inhaler, no excess and 21% fewer exacerbations',
        laymanSummary:
          'The FDA made the manufacturer run the trial the first one should have been. Eleven and a half thousand people took salmeterol and fluticasone in one inhaler or fluticasone alone. Serious asthma events were the same in both groups, and the combination group had a fifth fewer severe attacks.',
        technicalDetails:
          'AUSTRI randomised 11,679 patients aged 12 and over with persistent asthma and a severe exacerbation in the preceding year to fluticasone plus salmeterol or fluticasone alone for 26 weeks. Sixty-seven patients had 74 serious asthma-related events: 36 events in 34 patients on the combination against 38 events in 33 patients on fluticasone alone, hazard ratio 1.03 (95% CI 0.64 to 1.66), meeting the prespecified noninferiority margin of an upper bound below 2.0 (P=0.003). There were no asthma-related deaths; two intubations occurred, both in the fluticasone-only group. Severe exacerbations occurred in 480 of 5,834 (8%) on the combination against 597 of 5,845 (10%) on fluticasone alone, hazard ratio 0.79 (95% CI 0.70 to 0.89), P<0.001.',
        evidenceSource:
          'Stempel DA, Raphiou IH, Kral KM, et al. N Engl J Med 2016;374:1822-1830 (AUSTRI, NCT01475721)',
        doi: '10.1056/NEJMoa1511049',
        measuredMetric:
          'First serious asthma-related event and first severe exacerbation, fluticasone-salmeterol against fluticasone alone',
        auditFlag: 'verified',
      },
      {
        id: 'sal-a3',
        category: 'measured',
        title: 'VESTRI: the same question asked again in 6,208 children aged 4 to 11',
        laymanSummary:
          'Children were the group where the original alarm was about hospital admissions rather than deaths, so the trial was repeated in them. Twenty-seven children on the combination and twenty-one on the steroid alone were admitted. All the serious events were admissions; none was a death.',
        technicalDetails:
          'VESTRI randomised 6,208 children aged 4 to 11 requiring daily asthma medication with an exacerbation in the previous year to fluticasone plus salmeterol or fluticasone alone for 26 weeks. Twenty-seven patients on the combination and 21 on fluticasone alone had a serious asthma-related event, every one of them a hospitalisation, hazard ratio 1.28 (95% CI 0.73 to 2.27). Noninferiority was declared against a prespecified upper bound of 2.675 (P=0.006). Severe exacerbations occurred in 265 (8.5%) against 309 (10.0%), hazard ratio 0.86 (95% CI 0.73 to 1.01).',
        evidenceSource:
          'Stempel DA, Szefler SJ, Pedersen S, et al. N Engl J Med 2016;375:840-849 (VESTRI, NCT01462344)',
        doi: '10.1056/NEJMoa1606356',
        measuredMetric: 'First serious asthma-related event in children aged 4 to 11',
        auditFlag: 'caution',
      },
      {
        id: 'sal-a4',
        category: 'failed',
        title: 'TORCH: the survival trial missed at p=0.052 and found more pneumonia',
        laymanSummary:
          'Six thousand people with chronic obstructive pulmonary disease were followed for three years to see whether salmeterol with a steroid helps them live longer. Fewer died on the combination, but not by enough to clear the threshold the trial had set. Meanwhile one in five on the steroid-containing arms got pneumonia, against one in eight on placebo.',
        technicalDetails:
          'TORCH randomised 6,112 patients in the efficacy population to salmeterol 50 micrograms plus fluticasone propionate 500 micrograms twice daily, salmeterol alone, fluticasone alone or placebo for three years. All-cause mortality was 12.6% on combination, 13.5% on salmeterol, 16.0% on fluticasone and 15.2% on placebo. The hazard ratio for combination against placebo was 0.825 (95% CI 0.681 to 1.002, P=0.052 adjusted for interim analyses), missing the predetermined level of significance. Neither monotherapy differed significantly from placebo. The combination cut annual exacerbations from 1.13 to 0.85 and improved health status and spirometry (P<0.001). Pneumonia reported as an adverse event was 19.6% on combination and 18.3% on fluticasone against 12.3% on placebo, P<0.001.',
        evidenceSource:
          'Calverley PMA, Anderson JA, Celli B, et al. N Engl J Med 2007;356:775-789 (TORCH, NCT00268216)',
        doi: '10.1056/NEJMoa063070',
        measuredMetric: 'Death from any cause at three years, combination against placebo',
        auditFlag: 'caution',
      },
      {
        id: 'sal-a5',
        category: 'failed',
        title: 'POET-COPD: beaten head to head by an anticholinergic in 7,376 patients',
        laymanSummary:
          'The largest direct comparison of salmeterol against tiotropium in chronic obstructive pulmonary disease ran for a year. Tiotropium delayed the next flare-up by six weeks and cut the risk by seventeen per cent. Salmeterol lost.',
        technicalDetails:
          'POET-COPD randomised 7,376 patients with moderate to very severe chronic obstructive pulmonary disease and an exacerbation in the preceding year to tiotropium 18 micrograms once daily or salmeterol 50 micrograms twice daily for one year, double-blind and double-dummy. Tiotropium increased time to first exacerbation from 145 to 187 days, hazard ratio 0.83 (95% CI 0.77 to 0.90, P<0.001), increased time to first severe exacerbation (HR 0.72, 95% CI 0.61 to 0.85, P<0.001), and reduced annual moderate or severe exacerbations from 0.72 to 0.64 (rate ratio 0.89, 95% CI 0.83 to 0.96, P=0.002). There were 64 deaths (1.7%) on tiotropium and 78 (2.1%) on salmeterol.',
        evidenceSource:
          'Vogelmeier C, Hederer B, Glaab T, et al. N Engl J Med 2011;364:1093-1103 (POET-COPD, NCT00563381)',
        doi: '10.1056/NEJMoa1008378',
        measuredMetric: 'Time to first moderate or severe exacerbation, tiotropium against salmeterol',
        auditFlag: 'verified',
      },
      {
        id: 'sal-a6',
        category: 'conclusion_shift',
        title: 'The class warning was lifted in 2017 — but not from salmeterol on its own',
        laymanSummary:
          'The boxed warning came off the combination inhalers in December 2017 after four trials in 36,010 people found no excess risk when the beta-agonist is given with a steroid. It stayed on salmeterol by itself, and using salmeterol alone in asthma is now not merely warned against but forbidden.',
        technicalDetails:
          'SMART led to a boxed warning applied to every long-acting beta-agonist. In 2010 the FDA required the four manufacturers to run harmonised safety trials; the combined analysis of AUSTRI, VESTRI and the two sibling trials covered 36,010 adolescents and adults and found three asthma-related intubations and two asthma-related deaths in total, with serious asthma-related events in 108 of 18,006 (0.60%) on inhaled glucocorticoid alone against 119 of 18,004 (0.66%) on combination therapy, relative risk 1.09 (95% CI 0.83 to 1.43, P=0.55), and exacerbations in 2,100 (11.7%) against 1,768 (9.8%), relative risk 0.83 (95% CI 0.78 to 0.89, P<0.001). The boxed warning was removed from fixed-dose combination products in December 2017. The current SEREVENT DISKUS label still carries WARNING: ASTHMA-RELATED DEATH and states that use as monotherapy for asthma without a concomitant inhaled corticosteroid is contraindicated. A reader who has heard that the class warning was withdrawn will find this page contradicting them, and the label is why.',
        evidenceSource:
          'Busse WW, Bateman ED, Caplan AL, et al. N Engl J Med 2018;378:2497-2505; SEREVENT DISKUS United States prescribing information, boxed warning and Warnings and Precautions 5.1',
        doi: '10.1056/NEJMoa1716868',
        inferredClaim:
          'That the 2017 withdrawal cleared long-acting beta-agonists generally — it cleared them in fixed-dose combination with a steroid, and left salmeterol monotherapy in asthma contraindicated',
        auditFlag: 'verified',
      },
      {
        id: 'sal-a7',
        category: 'inferred',
        title: 'The genetic explanation for the SMART deaths did not survive its own trial',
        laymanSummary:
          'Most of the excess deaths in SMART were in African-American participants, and a popular explanation was a common variant in the receptor the drug acts on. A trial built specifically to test that gave the two genotypes the same lung-function response to salmeterol, to within a tenth of a litre per minute.',
        technicalDetails:
          'In SMART the imbalance concentrated in African-American subjects: respiratory-related deaths or life-threatening experiences 20 against 5, relative risk 4.10 (95% CI 1.54 to 10.90), and combined asthma-related deaths or life-threatening experiences 19 against 4, RR 4.92 (95% CI 1.68 to 14.45). The paper itself says whether the risk reflects a physiologic treatment effect, genetic factors or patient behaviours remains unknown. LARGE then enrolled adults matched in pairs by FEV1 and ethnic origin and stratified by ADRB2 codon 16 genotype — 42 Arg/Arg and 45 Gly/Gly — and crossed them over between salmeterol and placebo on open-label beclometasone. Morning peak expiratory flow rose 21.4 L/min (95% CI 11.8 to 31.1) in Arg/Arg and 21.5 L/min (11.0 to 32.1) in Gly/Gly, a between-genotype difference of -0.1 L/min (95% CI -14.4 to 14.2, p=0.99). A genotype-specific difference did appear in methacholine responsiveness, 1.32 doubling doses (0.43 to 2.21, p=0.0038), which is a secondary outcome and a different question.',
        evidenceSource:
          'Wechsler ME, Kunselman SJ, Chinchilli VM, et al. Lancet 2009;374:1754-1764 (LARGE, NCT00200967); Nelson HS et al., Chest 2006;129:15-26',
        doi: '10.1016/S0140-6736(09)61492-6',
        inferredClaim:
          'That the excess deaths among African-American participants in SMART are explained by the ADRB2 Arg16 variant — a hypothesis that a genotype-stratified randomised trial tested directly and did not support on its primary endpoint',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Breathed in as a dry powder',
        laymanDesc:
          'The inhaler releases a measured puff of powder. Only a fraction of it reaches the small airways; the rest lands in the mouth and throat and is swallowed.',
        molecularDetail:
          'Salmeterol xinafoate, 50 micrograms of the base per blister in the Diskus, micronised and blended with lactose carrier. Plasma concentrations after inhalation are very low and often undetectable, so systemic exposure is a poor guide to lung effect; the drug is measured by what it does to FEV1, not by what appears in blood.',
        iconName: 'Wind',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The fatty tail parks in the cell membrane',
        laymanDesc:
          'Half the molecule is a long greasy chain that does nothing to the receptor. It slides into the fatty layer of the muscle cell and stays there, holding the rest of the molecule permanently within reach.',
        molecularDetail:
          'The phenylbutoxyhexyl side chain partitions into the lipid bilayer and occupies a hydrophobic exosite adjacent to the orthosteric pocket of ADRB2. This anchoring is the accepted structural explanation for a duration of action near twelve hours from a molecule whose head group binds no more tightly than a short-acting agonist.',
        iconName: 'Anchor',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The active head switches the receptor on, again and again',
        laymanDesc:
          'The working end of the molecule swings into the receptor, activates it, drifts out, and swings back in — because the tail will not let it leave.',
        molecularDetail:
          'The saligenin head engages the orthosteric site of the beta-2 adrenoceptor. Replacing the catechol of adrenaline with a saligenin ring removes the substrate for catechol-O-methyltransferase, which is why the molecule is not degraded the way endogenous catecholamines are. Salmeterol is a partial agonist: its maximal response is below that of isoprenaline on the same preparation.',
        iconName: 'RefreshCw',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'A messenger builds up inside the muscle cell',
        laymanDesc:
          'The switched-on receptor makes the cell produce a signalling chemical. The more of it there is, the more the muscle lets go.',
        molecularDetail:
          'The receptor couples to Gs, which activates adenylyl cyclase and converts ATP to cyclic AMP. The label attributes the pharmacologic effect at least in part to that step. Cyclic AMP activates protein kinase A, which lowers intracellular calcium and reduces myosin light-chain kinase activity.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The airway stays open for about twelve hours',
        laymanDesc:
          'The muscle relaxes and the tube widens. It takes fifteen to twenty minutes to start, which is why this inhaler is useless in an attack, and it lasts about twelve hours, which is why it is taken twice a day.',
        molecularDetail:
          'Bronchodilation with a duration near twelve hours, in contrast to four to six for albuterol. The label additionally records that salmeterol is a potent and long-lasting inhibitor of mast cell mediator release — histamine, leukotrienes and prostaglandin D2 — from human lung in vitro, and that single inhaled doses attenuate allergen-induced bronchial hyper-responsiveness in humans.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'The inflammation underneath is untouched',
        laymanDesc:
          'Nothing in the chain above reaches the swollen, mucus-filled lining that causes asthma attacks. A person on salmeterol alone breathes more easily while the disease continues, and that is what the boxed warning is about.',
        molecularDetail:
          'The mast-cell stabilising effect measured in vitro does not translate into control of eosinophilic airway inflammation in vivo, and salmeterol produces no change in the transcriptional programme that inhaled corticosteroids act on. In SMART, run without required background steroid, asthma-related deaths were 13 against 3. In AUSTRI, run with fluticasone in the same inhaler, the hazard ratio for serious asthma events was 1.03 (95% CI 0.64 to 1.66).',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'SMART (Nelson HS et al., Chest 2006)',
        phase: 'Phase 4, randomised, double-blind, placebo-controlled safety trial',
        sampleSize: 26355,
        primaryEndpoint:
          'Combined respiratory-related deaths or life-threatening experiences, salmeterol added to usual care against placebo added to usual care',
        endpointMet: false,
        statisticalPValue:
          'Primary endpoint not significant: 50 against 36, relative risk 1.40 (95% CI 0.91 to 2.14). Asthma-related deaths 13 against 3, RR 4.37 (95% CI 1.25 to 15.34).',
        unreportedAdverseSignals:
          'The trial was terminated at interim analysis on the strength of the African-American subgroup, so the planned enrolment of 60,000 was never reached and the primary comparison is underpowered. Background inhaled corticosteroid was not required, which the label now makes mandatory.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'AUSTRI (NCT01475721)',
        phase: 'Phase 4, randomised, double-blind, FDA-mandated safety trial',
        sampleSize: 11679,
        primaryEndpoint:
          'Time to first serious asthma-related event — death, endotracheal intubation or hospitalisation',
        endpointMet: true,
        statisticalPValue:
          'Hazard ratio 1.03 (95% CI 0.64 to 1.66); noninferiority against an upper bound of 2.0 achieved, P=0.003',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'VESTRI (NCT01462344)',
        phase: 'Phase 4, randomised, double-blind, FDA-mandated paediatric safety trial',
        sampleSize: 6208,
        primaryEndpoint:
          'Time to first serious asthma-related event in children aged 4 to 11 years',
        endpointMet: true,
        statisticalPValue:
          'Hazard ratio 1.28 (95% CI 0.73 to 2.27); noninferiority against an upper bound of 2.675 achieved, P=0.006',
        unreportedAdverseSignals:
          'The noninferiority margin in children was 2.675 rather than the 2.0 used in adults, so a wider excess would have been declared acceptable. Every serious asthma-related event in the trial was a hospitalisation.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'TORCH (NCT00268216)',
        phase: 'Phase 3/4, randomised, double-blind, placebo-controlled, four-arm, three years',
        sampleSize: 6112,
        primaryEndpoint:
          'Death from any cause, salmeterol-fluticasone combination against placebo, in chronic obstructive pulmonary disease',
        endpointMet: false,
        statisticalPValue:
          'Hazard ratio 0.825 (95% CI 0.681 to 1.002), P=0.052 adjusted for interim analyses — the predetermined level of significance was not reached',
        unreportedAdverseSignals:
          'Pneumonia reported as an adverse event in 19.6% on combination and 18.3% on fluticasone against 12.3% on placebo, P<0.001. The mortality result is quoted as a 17.5% risk reduction far more often than as a missed endpoint.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'POET-COPD (NCT00563381)',
        phase: 'Phase 4, randomised, double-blind, double-dummy, active comparator, one year',
        sampleSize: 7376,
        primaryEndpoint:
          'Time to first moderate or severe exacerbation, tiotropium against salmeterol',
        endpointMet: true,
        statisticalPValue:
          'Hazard ratio 0.83 favouring tiotropium (95% CI 0.77 to 0.90), P<0.001; 187 days against 145 days to first exacerbation',
        unreportedAdverseSignals:
          'This trial met its endpoint against salmeterol, not for it. It is the largest head-to-head evidence that a long-acting antimuscarinic prevents more exacerbations than this drug in chronic obstructive pulmonary disease.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '13 asthma-related deaths on salmeterol against 3 on placebo among 26,355 subjects in SMART, relative risk 4.37 (95% CI 1.25 to 15.34)',
        'Hazard ratio 1.03 (95% CI 0.64 to 1.66) for serious asthma events with salmeterol added to fluticasone in 11,679 patients in AUSTRI',
        '21% fewer severe asthma exacerbations on fluticasone-salmeterol than on fluticasone alone in AUSTRI, hazard ratio 0.79 (95% CI 0.70 to 0.89)',
        'All-cause mortality 12.6% against 15.2% in TORCH, hazard ratio 0.825 (95% CI 0.681 to 1.002), P=0.052',
        'Time to first exacerbation 145 days on salmeterol against 187 days on tiotropium in 7,376 patients in POET-COPD',
      ],
      unsupportedInferences: [
        'That salmeterol with a steroid has been shown to prolong survival in chronic obstructive pulmonary disease — TORCH is the trial that asked, and it missed at p=0.052',
        'That the ADRB2 Arg16 variant explains the SMART deaths, an idea a genotype-stratified randomised trial tested and did not support on its primary endpoint',
        'That the December 2017 withdrawal of the class boxed warning applies to salmeterol used on its own, when the current label still carries it and calls asthma monotherapy contraindicated',
        'That relaxing airway muscle addresses asthma — the drug does nothing to the airway inflammation, and the whole safety history follows from that',
      ],
      whatFailedInitially: [
        'SMART was stopped early and never reached its planned enrolment, leaving the primary endpoint underpowered and the mortality finding a secondary one',
        'TORCH failed its primary mortality endpoint by three thousandths of a p-value and found pneumonia in 19.6% against 12.3% on placebo',
        'POET-COPD showed a long-acting antimuscarinic prevents exacerbations better than salmeterol in 7,376 people',
        'The genetic explanation offered for the African-American excess in SMART was not confirmed when tested directly in LARGE',
      ],
      realWorldOutcome: [
        'Approved in 1994 and still the beta-agonist in one of the most-prescribed combination inhalers in the world',
        'Carried a boxed warning from 2005; it was removed from fixed-dose combination products in December 2017 and retained on the single-ingredient inhaler',
        'Asthma monotherapy moved from warned-against to contraindicated in the United States label',
        'In chronic obstructive pulmonary disease it remains a maintenance bronchodilator with symptom and exacerbation benefit and no demonstrated survival benefit',
      ],
    },
    deliverySystem: {
      type: 'Dry-powder inhaler (Diskus, 50 micrograms per blister) and, historically, metered-dose inhalation aerosol',
      description:
        'Inhaled twice daily. Salmeterol is a partial agonist with an onset of roughly fifteen to twenty minutes, so it cannot function as a reliever, and the label states it is not indicated for relief of acute bronchospasm and must not be initiated in acutely deteriorating asthma. In asthma it is used almost exclusively inside a fixed-dose combination with an inhaled corticosteroid, because two separate inhalers can be reduced to one by a patient who feels better.',
      safetyProfile:
        'Boxed warning for asthma-related death when used as monotherapy without an inhaled corticosteroid; monotherapy in asthma is contraindicated. Not for acute symptoms. Do not combine with another long-acting beta-agonist. Paradoxical bronchospasm requires discontinuation. Caution in cardiovascular and central nervous system disorders, convulsive disorders, thyrotoxicosis, diabetes and ketoacidosis, and alertness to hypokalaemia and hyperglycaemia. Most common adverse reactions at 5% or more in asthma were headache, influenza, nasal or sinus congestion, pharyngitis, rhinitis and tracheitis or bronchitis; in chronic obstructive pulmonary disease, cough, headache, musculoskeletal pain, throat irritation and viral respiratory infection.',
    },
    commonQuestions: [
      {
        q: 'Is salmeterol dangerous?',
        a: 'Used on its own in asthma, the trial evidence says yes and the label says it is contraindicated. In SMART, 13 of 13,176 people on salmeterol died of asthma against 3 of 13,179 on placebo, in a study that did not require anyone to be taking an inhaled steroid. Used in a fixed-dose combination with a steroid, four FDA-mandated trials in 36,010 people found serious asthma events in 0.66% against 0.60% on the steroid alone, relative risk 1.09 with a confidence interval spanning one, and 17% fewer exacerbations. Those are two different questions with two different answers, and almost every argument about this drug comes from treating them as one.',
        auditNote:
          'The mechanism explains the difference. Salmeterol relieves the symptom of a disease it does not treat, and a person whose symptoms are muffled while the inflammation worsens has lost the warning that would have sent them for help.',
      },
      {
        q: 'Was the boxed warning taken off?',
        a: 'From the combination inhalers, in December 2017. Not from salmeterol by itself. The current SEREVENT DISKUS label still opens with WARNING: ASTHMA-RELATED DEATH, and use as asthma monotherapy without a concomitant inhaled corticosteroid is listed as contraindicated rather than merely discouraged. That is a stricter position than the one the warning originally took.',
      },
      {
        q: 'Why does it take twenty minutes to work?',
        a: 'Because of how it lasts twelve hours. Half the molecule is a long fatty chain that has no pharmacological job at all: it buries itself in the membrane of the muscle cell so the active end cannot wash away. Getting into position takes time, and salmeterol is also a partial agonist, meaning it cannot push the receptor as hard as adrenaline or albuterol can even at saturating concentrations. Formoterol, which is a full agonist, works in one to three minutes and lasts about as long — which is why formoterol and not salmeterol is the beta-agonist in the combination inhalers that double as relievers.',
      },
      {
        q: 'Does it help people with COPD live longer?',
        a: 'That was the question TORCH was built to answer, over three years in 6,112 people, and the answer it returned was no by the narrowest possible margin. Deaths were 12.6% on salmeterol plus fluticasone against 15.2% on placebo, hazard ratio 0.825 with a confidence interval of 0.681 to 1.002 and p=0.052 against a threshold of 0.05. Salmeterol alone did not differ significantly from placebo. What the same trial did show, at p<0.001, was fewer exacerbations, better health status and better spirometry — and more pneumonia, 19.6% against 12.3%.',
        auditNote:
          'A 17.5% relative risk reduction that misses its threshold is quoted as a benefit far more often than as a miss. The trial reported both, and this page keeps them together.',
      },
      {
        q: 'Is there something better for COPD?',
        a: 'For preventing exacerbations, one large trial says yes. POET-COPD randomised 7,376 people with moderate to very severe disease to tiotropium or salmeterol for a year and found tiotropium delayed the first exacerbation from 145 to 187 days, hazard ratio 0.83 (95% CI 0.77 to 0.90, p<0.001), with fewer severe exacerbations too. Deaths were 1.7% against 2.1%, a difference the trial was not designed to test. That is a single head-to-head comparison in one population, not a rule for every patient, but it is the largest direct evidence there is.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Nelson HS, Weiss ST, Bleecker ER, Yancey SW, Dorinsky PM. The Salmeterol Multicenter Asthma Research Trial. Chest 2006;129:15-26',
        identifier: '10.1378/chest.129.1.15',
        kind: 'doi',
      },
      {
        label:
          'Stempel DA, Raphiou IH, Kral KM, et al. Serious Asthma Events with Fluticasone plus Salmeterol versus Fluticasone Alone. N Engl J Med 2016;374:1822-1830',
        identifier: '10.1056/NEJMoa1511049',
        kind: 'doi',
      },
      {
        label:
          'Stempel DA, Szefler SJ, Pedersen S, et al. Safety of Adding Salmeterol to Fluticasone Propionate in Children with Asthma. N Engl J Med 2016;375:840-849',
        identifier: '10.1056/NEJMoa1606356',
        kind: 'doi',
      },
      {
        label:
          'Calverley PMA, Anderson JA, Celli B, et al. Salmeterol and fluticasone propionate and survival in chronic obstructive pulmonary disease. N Engl J Med 2007;356:775-789',
        identifier: '10.1056/NEJMoa063070',
        kind: 'doi',
      },
      {
        label:
          'Vogelmeier C, Hederer B, Glaab T, et al. Tiotropium versus salmeterol for the prevention of exacerbations of COPD. N Engl J Med 2011;364:1093-1103',
        identifier: '10.1056/NEJMoa1008378',
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
          'Wechsler ME, Kunselman SJ, Chinchilli VM, et al. Effect of beta2-adrenergic receptor polymorphism on response to longacting beta2 agonist in asthma (LARGE). Lancet 2009;374:1754-1764',
        identifier: '10.1016/S0140-6736(09)61492-6',
        kind: 'doi',
      },
      {
        label: 'AUSTRI — the FDA-mandated salmeterol-fluticasone safety trial in adolescents and adults',
        identifier: 'NCT01475721',
        kind: 'nct',
      },
      {
        label: 'VESTRI — the FDA-mandated salmeterol-fluticasone safety trial in children aged 4 to 11',
        identifier: 'NCT01462344',
        kind: 'nct',
      },
      {
        label: 'TORCH — three-year survival trial of salmeterol and fluticasone in COPD',
        identifier: 'NCT00268216',
        kind: 'nct',
      },
      {
        label: 'POET-COPD — tiotropium against salmeterol for exacerbation prevention',
        identifier: 'NCT00563381',
        kind: 'nct',
      },
      {
        label: 'LARGE — genotype-stratified crossover trial of salmeterol by ADRB2 codon 16 genotype',
        identifier: 'NCT00200967',
        kind: 'nct',
      },
      {
        label:
          'SEREVENT DISKUS (salmeterol xinafoate inhalation powder) United States prescribing information — boxed warning, Contraindications, Warnings and Precautions 5.1, Clinical Pharmacology 12.1',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22salmeterol+xinafoate%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 5152 — salmeterol structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5152',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 4. Tiotropium — the bronchodilator that beat every comparator it was given and failed the one
  //    endpoint it was designed around: the rate at which lung function falls.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'tiotropium',
    name: 'Tiotropium',
    tradeName: 'Spiriva Respimat / Spiriva HandiHaler / Spiriva',
    sponsor: 'Boehringer Ingelheim (with Pfizer as co-development partner on the COPD programme)',
    targetGene: 'CHRM3',
    targetProtein:
      'Muscarinic acetylcholine receptor M3 on airway smooth muscle — with similar binding affinity at M1 to M5',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2004,
    indication:
      'Long-term, once-daily maintenance treatment of bronchospasm associated with chronic obstructive pulmonary disease, including chronic bronchitis and emphysema, and to reduce COPD exacerbations. The Respimat product is additionally indicated as add-on maintenance treatment in asthma. Not a rescue medication.',
    patientFriendlyIndication:
      'A once-daily inhaler that blocks the nerve signal telling the airway to tighten',
    anatomicalSite:
      'Muscarinic M3 receptors on bronchial smooth muscle and submucosal glands, reached directly by the inhaled particle',
    conditionContext: {
      conditionExplainer:
        'The vagus nerve runs to the airways and releases acetylcholine, which tells the muscle around them to contract and the glands to make mucus. In chronic obstructive pulmonary disease that resting nerve tone is the single largest reversible part of the obstruction. Tiotropium blocks the receptor the acetylcholine lands on.',
      whyItMatters:
        'Most of the airflow obstruction in this disease is fixed — destroyed alveoli and scarred small airways do not open again. Blocking cholinergic tone removes the part that can still move, which is why a drug of this class produces a real and immediate gain in lung function and no change at all in how fast the lung is being lost.',
      whoTakesThis:
        'People with chronic obstructive pulmonary disease as maintenance treatment, and separately people whose asthma stays uncontrolled on an inhaled steroid plus a long-acting beta-agonist, where it is an add-on rather than a replacement.',
      clinicalGoals:
        'Fewer exacerbations and less breathlessness. Not a slower decline in lung function: a four-year, 5,993-patient trial was built to test that and did not show it.',
    },
    oneSentenceVerdict:
      'A muscarinic antagonist that stays stuck to the M3 receptor for a day and a half while falling off M2 in three and a half hours, which is what makes one inhalation last twenty-four hours; over four years in 5,993 people it held a 87 to 103 mL gain in lung function, cut exacerbations and hospitalisations, and did not change the rate at which lung function declined — the co-primary endpoint the trial existed to answer.',
    laymanHowItWorks:
      'A nerve running to the lungs constantly tells the muscle around each airway to stay slightly tightened. Tiotropium sits on the receptor that nerve signal lands on, so the message never arrives and the muscle relaxes. What makes one dose last a full day is not how tightly it binds but how slowly it lets go: it clings to the receptor on airway muscle for about thirty-five hours, while falling off the receptor on the heart in under four. It cannot undo the airway damage underneath, so it makes breathing easier without changing the course of the disease.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 84,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$11.73 per unit, the median across 7 listed products at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Tiotropium bromide was synthesised at Boehringer Ingelheim as Ba 679 BR and first described in 1993. The CMS survey still lists it as a brand product two decades after approval, and the reason is the same one that runs through this whole file: the molecule and the inhaler are separate pieces of intellectual property. HandiHaler capsules and the Respimat soft-mist cartridge each carry device and formulation protection outliving the compound patent, and a generic that cannot use the device cannot show equivalent lung deposition.',
      synthesisComplexity: 'High',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The honest comparison for tiotropium is other long-acting bronchodilators, and it has been made directly and at scale. Against salmeterol it prevented more exacerbations in 7,376 people. Against ipratropium, the drug it replaced, it produced a higher trough lung function and 24% fewer exacerbations. Against an inhaled steroid it is a different drug for a different part of the problem, not an alternative. Nothing eaten blocks a muscarinic receptor for a day.',
      conventionalRx: [
        {
          name: 'Ipratropium (Atrovent)',
          class: 'Short-acting muscarinic antagonist',
          howItCompares:
            'The same target, four times a day instead of once, because it falls off the M3 receptor in about fifteen minutes rather than thirty-five hours. In two identical one-year trials in 535 people, trough FEV1 rose 0.12 L on tiotropium and fell 0.03 L on ipratropium (p<0.001), with 24% fewer exacerbations (p<0.01).',
          typicalCost:
            'US$0.1089 per millilitre at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: cheap, generic, decades of use, available as a nebuliser solution for acute care. Cons: four doses a day, and directly beaten by tiotropium on lung function and exacerbations in a randomised comparison.',
        },
        {
          name: 'Umeclidinium (Incruse Ellipta)',
          class: 'Long-acting muscarinic antagonist',
          howItCompares:
            'A once-daily antimuscarinic of the same generation, delivered in a dry-powder device rather than a capsule inhaler or a soft-mist inhaler. Its evidence base is much smaller than tiotropium’s and contains no four-year outcome trial.',
          typicalCost:
            'US$10.28 per unit at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: single-inhalation dry-powder device, once daily, and available combined with vilanterol. Cons: nothing on the scale of UPLIFT or TIOSPIR behind it, so long-term safety rests on the class rather than the molecule.',
        },
        {
          name: 'Salmeterol (Serevent)',
          class: 'Long-acting beta-2 agonist',
          howItCompares:
            'Relaxes the same muscle through the opposite signal. POET-COPD compared them head to head for a year in 7,376 patients: tiotropium delayed the first exacerbation from 145 to 187 days, hazard ratio 0.83 (95% CI 0.77 to 0.90, p<0.001).',
          typicalCost:
            'US$6.74 per unit at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: different side-effect profile, no dry mouth or urinary retention. Cons: lost the largest head-to-head trial ever run between the two classes on the endpoint that matters most.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Mention glaucoma or prostate trouble before starting',
          action:
            'Tell the prescriber about narrow-angle glaucoma, an enlarged prostate or difficulty passing urine.',
          patientImpact:
            'The label warns that worsening of narrow-angle glaucoma and worsening of urinary retention may occur, and asks patients with those conditions to consult a physician immediately if symptoms appear. Eye pain, blurred vision and haloes are the warning signs.',
          clinicalPrecaution:
            'These are muscarinic effects at receptors outside the lung, not idiosyncratic reactions. They are predictable from the mechanism, which is why the label singles out exactly these two organs.',
        },
        {
          name: 'Say if you have a severe milk protein allergy',
          action:
            'Check which device has been prescribed: the HandiHaler capsule contains lactose.',
          patientImpact:
            'The label asks for caution in patients with severe hypersensitivity to milk proteins, because the inhalation powder is blended with a lactose monohydrate carrier that can contain milk protein traces.',
          clinicalPrecaution:
            'This is a property of the formulation, not of tiotropium. The soft-mist inhaler is an aqueous solution and does not contain the lactose carrier.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'C[N+]1([C@@H]2CC(C[C@H]1[C@H]3[C@@H]2O3)OC(=O)C(C4=CC=CS4)(C5=CC=CS5)O)C',
      chemicalFormula: 'C19H22NO4S2',
      molecularWeight: '392.50 g/mol',
      targetReceptorAffinity:
        'The label states similar affinity across muscarinic subtypes M1 to M5, with the airway effect arising from M3 inhibition on smooth muscle, and describes the antagonism as competitive and reversible. The duration is kinetic rather than affinity-driven: in the original characterisation, dissociation half-lives from human receptors were 34.7 hours at M3, 14.6 hours at M1 and 3.6 hours at M2, against 0.26, 0.11 and 0.035 hours for ipratropium. Faster release from M2 than from M3 is what the authors called kinetic receptor subtype selectivity.',
      structureSource: {
        label:
          'PubChem CID 5487427 (tiotropium) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5487427',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'tio-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity of the scopine core and the dithienylglycolic acid',
          description:
            'Confirm both halves before esterification. The epoxide bridge of the scopine ring and the two thiophene rings of the acid are what distinguish tiotropium from ipratropium, and the pair of thiophenes is the part responsible for the thirty-five-hour residence time at M3.',
          reagentsAndBuffer:
            'Tiotropium bromide reference standard, reversed-phase HPLC with ultraviolet detection, 1H and 13C NMR in D2O or DMSO-d6, ion chromatography for bromide content',
        },
        {
          id: 'tio-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Esterification and quaternisation to the bromide salt',
          description:
            'Esterify scopine with di-2-thienylglycolic acid or its methyl ester under transesterification conditions, then quaternise the tertiary amine with methyl bromide. Quaternisation is what confines the drug to the airway: a permanently charged nitrogen crosses membranes poorly, so swallowed drug is barely absorbed and central anticholinergic effects do not appear.',
          dependsOnStepId: 'tio-w1',
          reagentsAndBuffer:
            'Scopine or scopine hydrochloride, methyl di-2-thienylglycolate, sodium methoxide in anhydrous methanol or toluene, methyl bromide in acetonitrile, nitrogen atmosphere',
        },
        {
          id: 'tio-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation of the monohydrate and control of the epoxide impurity',
          description:
            'Crystallise the bromide monohydrate and assay for epoxide ring-opened degradants, which form under acid and moisture. The polymorph and the water of crystallisation matter here for a practical reason: the dry-powder product is a micronised blend and its aerodynamic particle size distribution depends on the crystal habit.',
          dependsOnStepId: 'tio-w2',
          reagentsAndBuffer:
            'Water and methanol or acetone antisolvent crystallisation, controlled-humidity drying, X-ray powder diffraction and differential scanning calorimetry, HPLC purity with impurity limits',
        },
        {
          id: 'tio-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Radioligand occupancy on membranes from cells expressing human M1, M2 and M3',
          description:
            'Load membranes from cells expressing each human receptor subtype with labelled tiotropium, then dilute heavily and follow the fall in bound radioligand over days. The dilution step is the experiment: equilibrium affinity is nearly identical across subtypes, and only the off-rate separates them.',
          dependsOnStepId: 'tio-w3',
          reagentsAndBuffer:
            'CHO or CHO-K1 membranes expressing human CHRM1, CHRM2 and CHRM3, tritiated N-methylscopolamine as tracer, HEPES-buffered assay medium, atropine for non-specific binding, glass-fibre filtration with rapid washing',
        },
        {
          id: 'tio-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Dissociation half-life and protection against induced bronchospasm',
          description:
            'Fit the washout curve to give a dissociation half-life per subtype, and pair it with a functional protection assay against methacholine or acetylcholine challenge. Reporting an affinity constant without an off-rate would make tiotropium and ipratropium look interchangeable, which is precisely the error the original pharmacology was designed to expose.',
          dependsOnStepId: 'tio-w4',
          reagentsAndBuffer:
            'Scintillation counting of filter-bound tracer, guinea pig tracheal ring organ bath with acetylcholine challenge, ipratropium as fast-dissociating comparator, non-linear regression to a one-phase exponential decay',
        },
      ],
    },
    keyAudits: [
      {
        id: 'tio-a1',
        category: 'failed',
        title: 'UPLIFT: four years, 5,993 patients, and the co-primary endpoint was not met',
        laymanSummary:
          'The trial was built around one question: does this drug slow the rate at which lung function is lost in chronic obstructive pulmonary disease? After four years, the answer was no. Everything else about the trial went well, and that is the part people remember.',
        technicalDetails:
          'UPLIFT randomised 5,993 patients with a post-bronchodilator FEV1 of 70% predicted or less to tiotropium 18 micrograms once daily or placebo for four years, with all other respiratory medication except inhaled anticholinergics permitted. The co-primary endpoints were the rate of decline in mean FEV1 before and after bronchodilation from day 30 onwards. After day 30 the differences between groups in the rate of decline were not significant on either co-primary endpoint. Absolute FEV1 improvements were maintained throughout — 87 to 103 mL before bronchodilation and 47 to 65 mL after (P<0.001) — and the St George’s Respiratory Questionnaire total score was better on tiotropium at every time point, by 2.3 to 3.3 units (P<0.001). At four years and 30 days tiotropium was associated with reductions in exacerbations, related hospitalisations and respiratory failure.',
        evidenceSource:
          'Tashkin DP, Celli B, Senn S, et al. N Engl J Med 2008;359:1543-1554 (UPLIFT, NCT00144339)',
        doi: '10.1056/NEJMoa0805800',
        measuredMetric:
          'Rate of decline in FEV1 before and after bronchodilation from day 30 to four years',
        auditFlag: 'verified',
      },
      {
        id: 'tio-a2',
        category: 'inferred',
        title: 'The quality-of-life gain in UPLIFT sat below its own clinical threshold',
        laymanSummary:
          'The trial reported a statistically significant improvement in a breathing questionnaire at every visit for four years. The size of that improvement was between two and three and a third points, and the smallest change the questionnaire’s author considers clinically meaningful is four.',
        technicalDetails:
          'UPLIFT reported mean absolute St George’s Respiratory Questionnaire total scores lower on tiotropium than on placebo at every time point across four years, ranging from 2.3 to 3.3 units, P<0.001. The threshold for a clinically significant change in the SGRQ is conventionally 4 units, derived empirically by Jones and set out in the standard reference on interpreting these instruments. A difference can be highly significant and smaller than the smallest difference a patient would notice; with 5,993 patients followed for four years, statistical significance is not the constraint. This does not make the finding wrong, and it does make "improved quality of life" a heavier claim than the number supports.',
        evidenceSource:
          'Tashkin DP et al., N Engl J Med 2008;359:1543-1554; Jones PW. Interpreting thresholds for a clinically significant change in health status in asthma and COPD. Eur Respir J 2002;19:398-404',
        doi: '10.1183/09031936.02.00063702',
        inferredClaim:
          'That a 2.3 to 3.3 unit SGRQ difference is a clinically meaningful improvement in quality of life, when the accepted threshold for that instrument is 4 units',
        auditFlag: 'caution',
      },
      {
        id: 'tio-a3',
        category: 'conclusion_shift',
        title: 'The Respimat mortality alarm, and the 17,135-patient trial that dissolved it',
        laymanSummary:
          'A 2011 meta-analysis of five trials found people using the soft-mist version of tiotropium died more often than those on placebo, a 52% higher risk. Boehringer then ran a single trial larger than all five put together, comparing the two devices directly. The excess was not there.',
        technicalDetails:
          'Singh and colleagues pooled five randomised trials of tiotropium delivered by the Respimat soft-mist inhaler against placebo and found all-cause mortality of 90 of 3,686 against 47 of 2,836, relative risk 1.52 (95% CI 1.06 to 2.16, P=0.02, I2=0%), with both the 5 microgram (RR 1.46, 1.01 to 2.10) and 10 microgram (RR 2.15, 1.03 to 4.51) doses implicated, and a number needed to harm of 124 per year. TIOSPIR then randomised 17,135 patients to Respimat 2.5 or 5 micrograms or HandiHaler 18 micrograms and followed them a mean of 2.3 years. Respimat was noninferior to HandiHaler for death — 5 micrograms hazard ratio 0.96 (95% CI 0.84 to 1.09), 2.5 micrograms hazard ratio 1.00 (0.87 to 1.14) — and not superior on first exacerbation (HR 0.98, 0.93 to 1.03). Causes of death and major cardiovascular event rates were similar across the three groups.',
        evidenceSource:
          'Singh S, Loke YK, Enright PL, Furberg CD. BMJ 2011;342:d3215; Wise RA, Anzueto A, Cotton D, et al. N Engl J Med 2013;369:1491-1501 (TIOSPIR, NCT01126437)',
        doi: '10.1056/NEJMoa1303342',
        inferredClaim:
          'That the soft-mist device carries a mortality risk the dry-powder device does not — an inference from placebo-controlled trials of unequal design that a direct head-to-head comparison in 17,135 patients did not reproduce',
        auditFlag: 'verified',
      },
      {
        id: 'tio-a4',
        category: 'conclusion_shift',
        title: 'A 2008 meta-analysis put a cardiovascular signal on the whole class',
        laymanSummary:
          'Seventeen trials pooled together suggested that inhaled anticholinergics raised the risk of heart attack, cardiovascular death or stroke by about sixty per cent. The two very large trials that came afterwards, together covering 23,000 people, did not find it.',
        technicalDetails:
          'Singh and colleagues pooled 17 randomised trials of inhaled anticholinergics — ipratropium or tiotropium — enrolling 13,645 patients with COPD. The composite of cardiovascular death, myocardial infarction or stroke occurred in 134 of 6,984 (1.9%) on anticholinergics against 83 of 6,661 (1.2%) on control, relative risk 1.60 (95% CI 1.22 to 2.10, P<0.001, I2=0%), with myocardial infarction RR 1.52 (1.04 to 2.22) and cardiovascular death RR 1.92 (1.23 to 3.00). All-cause mortality was RR 1.29 (1.00 to 1.65, P=0.05). UPLIFT, published two weeks later with 5,993 patients over four years, and TIOSPIR, with 17,135 patients over a mean 2.3 years, both reported similar cardiovascular event rates between arms. The meta-analysis pooled two different molecules, several devices and trials designed for other purposes; the trials that followed were designed to answer the question and answered it differently.',
        evidenceSource:
          'Singh S, Loke YK, Furberg CD. JAMA 2008;300:1439-1450; Tashkin DP et al., N Engl J Med 2008;359:1543-1554; Wise RA et al., N Engl J Med 2013;369:1491-1501',
        doi: '10.1001/jama.300.12.1439',
        inferredClaim:
          'That inhaled antimuscarinics raise cardiovascular risk by roughly 60% — a pooled estimate across two molecules and many devices that two purpose-built trials of 23,128 patients did not confirm',
        auditFlag: 'contested',
      },
      {
        id: 'tio-a5',
        category: 'measured',
        title: 'POET-COPD: more exacerbations prevented than by a long-acting beta-agonist',
        laymanSummary:
          'A one-year trial put tiotropium directly against salmeterol in more than seven thousand people with chronic obstructive pulmonary disease. Tiotropium delayed the next flare-up by about six weeks and cut the risk of one by seventeen per cent.',
        technicalDetails:
          'POET-COPD randomised 7,376 patients with moderate to very severe COPD and an exacerbation in the preceding year to tiotropium 18 micrograms once daily or salmeterol 50 micrograms twice daily, double-blind and double-dummy, for one year. Time to first exacerbation was 187 days against 145 days, hazard ratio 0.83 (95% CI 0.77 to 0.90, P<0.001). Time to first severe exacerbation favoured tiotropium (HR 0.72, 95% CI 0.61 to 0.85, P<0.001), annual moderate or severe exacerbations fell from 0.72 to 0.64 (rate ratio 0.89, 95% CI 0.83 to 0.96, P=0.002) and annual severe exacerbations from 0.13 to 0.09 (rate ratio 0.73, 95% CI 0.66 to 0.82, P<0.001). Deaths were 64 (1.7%) against 78 (2.1%), a comparison the trial was not powered to make.',
        evidenceSource:
          'Vogelmeier C, Hederer B, Glaab T, et al. N Engl J Med 2011;364:1093-1103 (POET-COPD, NCT00563381)',
        doi: '10.1056/NEJMoa1008378',
        measuredMetric:
          'Time to first moderate or severe exacerbation, tiotropium against salmeterol over one year',
        auditFlag: 'verified',
      },
      {
        id: 'tio-a6',
        category: 'measured',
        title: 'PrimoTinA-asthma: a third drug added on top of two, worth about 100 mL and 56 days',
        laymanSummary:
          'In people whose asthma stayed uncontrolled on a steroid and a long-acting beta-agonist, adding tiotropium improved lung function by around a tenth of a litre and delayed the next severe attack from about seven and a half months to nine and a half.',
        technicalDetails:
          'Two replicate 48-week randomised placebo-controlled trials enrolled 912 patients already taking inhaled glucocorticoids and long-acting beta-agonists, all symptomatic, with post-bronchodilator FEV1 of 80% predicted or less and at least one severe exacerbation in the previous year. Mean baseline FEV1 was 62% predicted. At 24 weeks the difference in peak FEV1 was 86±34 mL in trial 1 (P=0.01) and 154±32 mL in trial 2 (P<0.001); trough FEV1 differences were 88±31 mL (P=0.01) and 111±30 mL (P<0.001). Time to first severe exacerbation rose from 226 to 282 days, an overall 21% reduction in risk (hazard ratio 0.79, P=0.03). No deaths occurred and adverse events were similar between groups.',
        evidenceSource:
          'Kerstjens HAM, Engel M, Dahl R, et al. N Engl J Med 2012;367:1198-1207 (NCT00772538 and NCT00776984)',
        doi: '10.1056/NEJMoa1208606',
        measuredMetric:
          'Peak and trough FEV1 at 24 weeks and time to first severe exacerbation at 48 weeks, added to inhaled glucocorticoid plus long-acting beta-agonist',
        auditFlag: 'verified',
      },
      {
        id: 'tio-a7',
        category: 'measured',
        title: 'It beat the drug it replaced on lung function and exacerbations',
        laymanSummary:
          'Two identical year-long trials compared tiotropium once a day with ipratropium four times a day. Lung function rose on tiotropium and fell on ipratropium, and there were about a quarter fewer flare-ups.',
        technicalDetails:
          'Two identical one-year randomised, double-blind, double-dummy trials compared tiotropium 18 micrograms once daily (n=356) with ipratropium 40 micrograms four times daily (n=179) in patients with screening FEV1 around 40% predicted. Trough FEV1 at one year improved by 0.12±0.01 L on tiotropium and declined by 0.03±0.02 L on ipratropium (P<0.001). Peak expiratory flow, rescue salbutamol use, Transition Dyspnea Index focal score and St George’s Respiratory Questionnaire total and impact scores all improved on tiotropium (P<0.01). Exacerbations fell by 24% (P<0.01), with longer time to first exacerbation (P<0.01) and to first hospitalisation for exacerbation (P<0.05). Apart from more dry mouth on tiotropium, adverse events were similar.',
        evidenceSource:
          'Vincken W, van Noord JA, Greefhorst APM, et al. Eur Respir J 2002;19:209-216',
        doi: '10.1183/09031936.02.00238702',
        measuredMetric:
          'Trough FEV1 and exacerbation rate at one year, tiotropium once daily against ipratropium four times daily',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Delivered as a powder from a capsule, or as a slow mist',
        laymanDesc:
          'Two devices exist. One pierces a capsule of powder that is drawn in by the breath; the other pushes a fine mist out slowly enough that it can be inhaled without perfect timing.',
        molecularDetail:
          'HandiHaler delivers 18 micrograms of tiotropium bromide monohydrate blended with lactose carrier; Respimat delivers 2.5 or 5 micrograms as an aqueous soft mist generated mechanically rather than by propellant. The two were compared directly in 17,135 patients in TIOSPIR and were noninferior on mortality and equivalent on exacerbations.',
        iconName: 'Wind',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'A permanently charged molecule stays where it lands',
        laymanDesc:
          'The molecule carries a fixed electrical charge, so it does not slip through cell membranes easily. That keeps it in the airway and out of the brain, and means the portion swallowed is barely absorbed.',
        molecularDetail:
          'Tiotropium is a quaternary ammonium compound. The permanent positive charge on the nitrogen limits passive membrane permeation and blood-brain barrier penetration, and the label describes the bronchodilation as predominantly a site-specific effect.',
        iconName: 'Lock',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It occupies the receptor the nerve signal was aiming for',
        laymanDesc:
          'Acetylcholine released by the vagus nerve normally lands on a receptor on the airway muscle and makes it contract. Tiotropium sits in that spot instead, and the message has nowhere to arrive.',
        molecularDetail:
          'Competitive, reversible antagonism at muscarinic receptors, with similar affinity across M1 to M5 and the airway effect arising from M3 blockade on smooth muscle. M3 activation normally couples through Gq to phospholipase C, inositol trisphosphate and a rise in intracellular calcium.',
        iconName: 'Ban',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'It lets go of the lung receptor very slowly and the heart receptor quickly',
        laymanDesc:
          'This is the whole trick. The drug clings to the receptor on airway muscle for about a day and a half, but falls off the one on the heart in a few hours — so the useful effect outlasts the unwanted one.',
        molecularDetail:
          'Measured dissociation half-lives from human receptors were 34.7 hours at M3, 14.6 hours at M1 and 3.6 hours at M2, against 0.26, 0.11 and 0.035 hours for ipratropium. The authors named this kinetic receptor subtype selectivity: equilibrium affinity is near-identical across subtypes, and only the off-rate distinguishes them. M2 receptors are presynaptic autoreceptors and cardiac; leaving them quickly is desirable.',
        iconName: 'Timer',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The airway opens and stays open for a day',
        laymanDesc:
          'Airway muscle relaxes, the tube widens, and one inhalation covers twenty-four hours. It also cuts down mucus secretion, which the same nerve signal drives.',
        molecularDetail:
          'Preclinical protection against methacholine-induced bronchoconstriction was dose-dependent and lasted longer than 24 hours. In UPLIFT the absolute FEV1 gain of 87 to 103 mL before bronchodilation was maintained unchanged across four years, which is the signature of a symptomatic bronchodilator rather than a disease-modifying drug.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'The damaged lung goes on being lost at the same rate',
        laymanDesc:
          'Blocking the nerve signal removes the part of the narrowing that can still move. It does nothing to destroyed air sacs or scarred small airways, and four years of treatment did not change how fast lung function fell.',
        molecularDetail:
          'UPLIFT’s co-primary endpoints were the rates of decline in pre- and post-bronchodilator FEV1 from day 30; after day 30 neither differed significantly from placebo. The exacerbation, hospitalisation and respiratory-failure reductions in the same trial are real and are a separate finding from disease modification.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'UPLIFT (NCT00144339)',
        phase: 'Phase 4, randomised, double-blind, placebo-controlled, four years',
        sampleSize: 5993,
        primaryEndpoint:
          'Co-primary: rate of decline in mean FEV1 before and after bronchodilation, from day 30 onwards',
        endpointMet: false,
        statisticalPValue:
          'After day 30 the between-group differences in rate of decline were not significant on either co-primary endpoint. Absolute FEV1 gains of 87 to 103 mL pre-bronchodilator and 47 to 65 mL post-bronchodilator were maintained, P<0.001.',
        unreportedAdverseSignals:
          'The trial is widely cited for its secondary findings on exacerbations and health status. Its co-primary endpoint — the reason it ran for four years — was not met, and the St George’s Respiratory Questionnaire benefit of 2.3 to 3.3 units sits below the conventional 4-unit threshold for clinical significance.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'TIOSPIR (NCT01126437)',
        phase: 'Phase 4, randomised, double-blind, device-comparison safety trial, mean 2.3 years',
        sampleSize: 17135,
        primaryEndpoint:
          'Risk of death (noninferiority, Respimat against HandiHaler) and risk of first COPD exacerbation (superiority)',
        endpointMet: true,
        statisticalPValue:
          'Death: Respimat 5 micrograms against HandiHaler hazard ratio 0.96 (95% CI 0.84 to 1.09); 2.5 micrograms hazard ratio 1.00 (0.87 to 1.14). First exacerbation: hazard ratio 0.98 (0.93 to 1.03) — noninferior on death, not superior on exacerbations.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'POET-COPD (NCT00563381)',
        phase: 'Phase 4, randomised, double-blind, double-dummy, active comparator, one year',
        sampleSize: 7376,
        primaryEndpoint:
          'Time to first moderate or severe COPD exacerbation, tiotropium against salmeterol',
        endpointMet: true,
        statisticalPValue:
          'Hazard ratio 0.83 (95% CI 0.77 to 0.90), P<0.001; 187 days against 145 days',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'PrimoTinA-asthma (NCT00772538 and NCT00776984)',
        phase: 'Phase 3, two replicate randomised, double-blind, placebo-controlled trials, 48 weeks',
        sampleSize: 912,
        primaryEndpoint:
          'Peak and trough FEV1 at 24 weeks, and time to first severe exacerbation, added to inhaled glucocorticoid plus long-acting beta-agonist',
        endpointMet: true,
        statisticalPValue:
          'Trough FEV1 difference 88±31 mL (P=0.01) and 111±30 mL (P<0.001); time to first severe exacerbation 282 against 226 days, hazard ratio 0.79, P=0.03',
        unreportedAdverseSignals:
          'This is a third controller added to two, in patients already failing both. The lung-function difference is around 100 mL, which is at the lower edge of what a patient would be expected to notice.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Vincken 2002 — tiotropium against ipratropium, two identical one-year trials',
        phase: 'Phase 3, randomised, double-blind, double-dummy, active comparator, one year',
        sampleSize: 535,
        primaryEndpoint: 'Trough FEV1 at one year, tiotropium against ipratropium',
        endpointMet: true,
        statisticalPValue:
          'Trough FEV1 +0.12±0.01 L on tiotropium against -0.03±0.02 L on ipratropium, P<0.001; exacerbations reduced 24%, P<0.01',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'No significant difference in the rate of FEV1 decline against placebo over four years in 5,993 patients — UPLIFT’s co-primary endpoint',
        'An 87 to 103 mL pre-bronchodilator FEV1 gain held constant across four years, P<0.001',
        'Time to first exacerbation 187 days against 145 on salmeterol in 7,376 patients, hazard ratio 0.83 (95% CI 0.77 to 0.90)',
        'Respimat noninferior to HandiHaler for death in 17,135 patients, hazard ratio 0.96 (95% CI 0.84 to 1.09)',
        'Dissociation half-lives of 34.7 hours at M3 and 3.6 hours at M2, against 0.26 and 0.035 hours for ipratropium',
      ],
      unsupportedInferences: [
        'That tiotropium slows the progression of chronic obstructive pulmonary disease — the four-year trial designed to test that did not show it',
        'That a 2.3 to 3.3 unit St George’s Respiratory Questionnaire difference is a clinically meaningful quality-of-life improvement, against a conventional threshold of 4 units',
        'That the soft-mist inhaler carries a mortality risk the dry-powder inhaler does not, which a 17,135-patient head-to-head comparison did not reproduce',
        'That inhaled antimuscarinics raise cardiovascular risk by around 60%, a pooled estimate the two large purpose-built trials did not confirm',
      ],
      whatFailedInitially: [
        'UPLIFT missed both co-primary endpoints after four years and 5,993 patients',
        'A 2011 meta-analysis of five trials reported a 52% higher mortality with the Respimat device, relative risk 1.52 (95% CI 1.06 to 2.16)',
        'A 2008 meta-analysis of 17 trials reported a 60% higher risk of cardiovascular death, myocardial infarction or stroke across the anticholinergic class',
        'In asthma the drug is a third agent added to two that are already failing, and buys about 100 mL of trough FEV1',
      ],
      realWorldOutcome: [
        'Approved in 2004 and the reference long-acting antimuscarinic against which every later one in this class is compared',
        'The FDA-required device safety programme became TIOSPIR, one of the largest respiratory trials ever run',
        'Extended into asthma in 2015 as add-on maintenance treatment, not as a replacement for an inhaled corticosteroid',
        'Still sold as a brand two decades on, because the device and the molecule are separate pieces of property',
      ],
    },
    deliverySystem: {
      type: 'Inhalation powder in capsules for the HandiHaler device (18 micrograms) and aqueous soft-mist inhalation spray for the Respimat device (2.5 or 5 micrograms)',
      description:
        'Once daily. The HandiHaler pierces a lactose-blended capsule and depends on the patient generating enough inspiratory flow; the Respimat produces a slow-moving mist mechanically, which removes that dependence. The two devices were compared directly in TIOSPIR and behaved the same on mortality and exacerbations. The label is explicit that neither is a rescue medication.',
      safetyProfile:
        'Not for acute use and not a rescue medication. Immediate hypersensitivity reactions including angioedema, urticaria, rash, bronchospasm and anaphylaxis require immediate discontinuation, and caution applies in patients with hypersensitivity to atropine derivatives or severe hypersensitivity to milk proteins, since the powder is lactose-blended. Life-threatening paradoxical bronchospasm can occur. Worsening of narrow-angle glaucoma and of urinary retention may occur and both are named in the label as reasons to seek immediate advice. The most common adverse reactions above 5% in the one-year placebo-controlled trials were upper respiratory tract infection, dry mouth, sinusitis, pharyngitis, non-specific chest pain, urinary tract infection, dyspepsia and rhinitis.',
    },
    commonQuestions: [
      {
        q: 'Does tiotropium slow down my lung disease?',
        a: 'No, and this is the clearest negative result on the page. UPLIFT ran for four years in 5,993 people specifically to answer that question, with the rate of FEV1 decline as its co-primary endpoint, and after day 30 the difference from placebo was not significant. What the same trial did show was a lung-function gain of about 90 to 100 mL that stayed the same size for four years — the signature of a drug that removes a fixed amount of reversible narrowing every day, not one that changes what is happening to the lung underneath. It also reduced exacerbations, hospitalisations and respiratory failure, which are worth having and are a different claim.',
        auditNote:
          'A constant absolute benefit over four years and an unchanged rate of decline are the same observation described twice. Marketing tends to report the first and not the second.',
      },
      {
        q: 'Why does one puff last a whole day?',
        a: 'Not because it binds unusually tightly. Tiotropium has roughly the same affinity for all five muscarinic receptor subtypes. What is unusual is how slowly it comes off: about thirty-five hours at the M3 receptor on airway muscle, against about fifteen minutes for ipratropium at the same receptor. It also comes off the M2 receptor — the one on the heart and on nerve terminals — in three and a half hours, so the lung effect outlives the cardiac one. The original 1993 paper called this kinetic receptor subtype selectivity, and it is the reason the same chemical family went from four doses a day to one.',
      },
      {
        q: 'Was there a problem with the Respimat inhaler?',
        a: 'There was a signal, and it did not hold up. A 2011 meta-analysis of five placebo-controlled trials found 90 deaths among 3,686 people on Respimat against 47 among 2,836 on placebo, a relative risk of 1.52 with a confidence interval of 1.06 to 2.16. That was enough for regulators to act on. Boehringer then ran TIOSPIR, which put 17,135 patients on Respimat or on the HandiHaler directly against each other for an average of 2.3 years, and found hazard ratios for death of 0.96 and 1.00 with confidence intervals comfortably spanning one. A direct comparison in one trial larger than all five pooled ones is stronger evidence than the pooling was.',
      },
      {
        q: 'Should I be worried about my heart?',
        a: 'The evidence has moved. In 2008 a meta-analysis of 17 trials in 13,645 people reported the composite of cardiovascular death, heart attack or stroke in 1.9% on inhaled anticholinergics against 1.2% on control, a relative risk of 1.60. UPLIFT and TIOSPIR, which between them followed 23,128 patients for years with cardiovascular events collected prospectively, reported similar rates between arms. The meta-analysis mixed two different drugs, several devices and trials designed to answer other questions; the two large trials were designed to answer this one.',
      },
      {
        q: 'It was added to my asthma inhalers — is it doing much?',
        a: 'A measurable amount, and less than the first two drugs did. In two 48-week trials in 912 people already on an inhaled steroid and a long-acting beta-agonist and still symptomatic, adding tiotropium raised trough lung function by 88 and 111 mL in the two trials, and pushed the time to the next severe attack from 226 days to 282, a 21% risk reduction at p=0.03. That is a real effect in a group that had run out of other options, and it is roughly a tenth of a litre. It is an add-on: the label positions it alongside the inhaled corticosteroid, never instead of it.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Tashkin DP, Celli B, Senn S, et al. A 4-year trial of tiotropium in chronic obstructive pulmonary disease. N Engl J Med 2008;359:1543-1554',
        identifier: '10.1056/NEJMoa0805800',
        kind: 'doi',
      },
      {
        label:
          'Wise RA, Anzueto A, Cotton D, et al. Tiotropium Respimat inhaler and the risk of death in COPD. N Engl J Med 2013;369:1491-1501',
        identifier: '10.1056/NEJMoa1303342',
        kind: 'doi',
      },
      {
        label:
          'Vogelmeier C, Hederer B, Glaab T, et al. Tiotropium versus salmeterol for the prevention of exacerbations of COPD. N Engl J Med 2011;364:1093-1103',
        identifier: '10.1056/NEJMoa1008378',
        kind: 'doi',
      },
      {
        label:
          'Kerstjens HAM, Engel M, Dahl R, et al. Tiotropium in asthma poorly controlled with standard combination therapy. N Engl J Med 2012;367:1198-1207',
        identifier: '10.1056/NEJMoa1208606',
        kind: 'doi',
      },
      {
        label:
          'Singh S, Loke YK, Enright PL, Furberg CD. Mortality associated with tiotropium mist inhaler in patients with COPD: systematic review and meta-analysis. BMJ 2011;342:d3215',
        identifier: '10.1136/bmj.d3215',
        kind: 'doi',
      },
      {
        label:
          'Singh S, Loke YK, Furberg CD. Inhaled anticholinergics and risk of major adverse cardiovascular events in patients with COPD. JAMA 2008;300:1439-1450',
        identifier: '10.1001/jama.300.12.1439',
        kind: 'doi',
      },
      {
        label:
          'Disse B, Speck GA, Rominger KL, Witek TJ, Hammer R. Ba 679 BR, a novel long-acting anticholinergic bronchodilator. Life Sci 1993;52:537-544',
        identifier: '10.1016/0024-3205(93)90312-q',
        kind: 'doi',
      },
      {
        label:
          'Vincken W, van Noord JA, Greefhorst APM, et al. Improved health outcomes in patients with COPD during 1 yr’s treatment with tiotropium. Eur Respir J 2002;19:209-216',
        identifier: '10.1183/09031936.02.00238702',
        kind: 'doi',
      },
      {
        label:
          'Jones PW. Interpreting thresholds for a clinically significant change in health status in asthma and COPD. Eur Respir J 2002;19:398-404',
        identifier: '10.1183/09031936.02.00063702',
        kind: 'doi',
      },
      {
        label: 'UPLIFT — four-year tiotropium trial with rate of FEV1 decline as co-primary endpoint',
        identifier: 'NCT00144339',
        kind: 'nct',
      },
      {
        label: 'TIOSPIR — Respimat against HandiHaler in 17,135 patients',
        identifier: 'NCT01126437',
        kind: 'nct',
      },
      {
        label: 'POET-COPD — tiotropium against salmeterol for exacerbation prevention',
        identifier: 'NCT00563381',
        kind: 'nct',
      },
      {
        label:
          'SPIRIVA HANDIHALER (tiotropium bromide inhalation powder) United States prescribing information — Indications, Warnings and Precautions 5.1 to 5.5, Clinical Pharmacology 12.1',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22SPIRIVA+HANDIHALER%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 5487427 — tiotropium structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5487427',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 5. Umeclidinium — a once-daily antimuscarinic whose own trials measured lung function only, and
  //    whose exacerbation claim on the label comes from a trial of a three-drug inhaler.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'umeclidinium',
    name: 'Umeclidinium',
    tradeName: 'Incruse Ellipta',
    sponsor: 'GlaxoSmithKline (developed as GSK573719)',
    targetGene: 'CHRM3',
    targetProtein:
      'Muscarinic acetylcholine receptor M3 on airway smooth muscle — with sub-nanomolar affinity at M1 to M5',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2013,
    indication:
      'Maintenance treatment of patients with chronic obstructive pulmonary disease. Not indicated for the relief of acute symptoms and not to be initiated in acutely deteriorating COPD.',
    patientFriendlyIndication:
      'A once-daily inhaler for long-term chronic obstructive pulmonary disease, blocking the nerve signal that tightens the airway',
    anatomicalSite:
      'Muscarinic M3 receptors on bronchial smooth muscle, reached by dry powder deposited in the conducting airways',
    conditionContext: {
      conditionExplainer:
        'Chronic obstructive pulmonary disease narrows the airways in two ways at once. Part of the narrowing is structural — destroyed air sacs and thickened small airways — and does not move. Part of it is the airway muscle held in constant mild contraction by a nerve signal, and that part can be released.',
      whyItMatters:
        'Umeclidinium releases the second part. That is a real and immediate improvement in how much air can be moved, and it is not a change in the disease. Knowing which of the two a drug addresses is the difference between expecting relief and expecting recovery.',
      whoTakesThis:
        'People with chronic obstructive pulmonary disease as long-term maintenance treatment. It is not approved for asthma, and the label says so by omission rather than by warning: asthma appears nowhere in its indications.',
      clinicalGoals:
        'More air moved on a breathing test and less breathlessness. Whether it prevents exacerbations on its own has not been tested in a trial of the drug on its own.',
    },
    oneSentenceVerdict:
      'A once-daily quaternary antimuscarinic with sub-nanomolar affinity at all five muscarinic receptors and slow functional reversal at M3, which raised trough lung function by 115 to 127 mL against placebo in its own 12- and 24-week trials; its label’s exacerbation claim comes not from those trials but from IMPACT, where umeclidinium was one of three drugs in a single inhaler given to 10,355 people.',
    laymanHowItWorks:
      'A nerve running to the lungs keeps the muscle around each airway slightly tightened all the time. Umeclidinium blocks the receptor that signal arrives at, and the muscle relaxes. It carries a permanent electrical charge, so it stays in the airway rather than spreading through the body, and it clears off the receptor slowly enough that one inhalation covers a day. It changes nothing about the destroyed lung tissue underneath, so it makes breathing easier without making the disease better.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 68,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$10.28 per unit, the median across 3 listed products at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Umeclidinium is one of the newest molecules in this file and is still sold only as a brand, in only three listed presentations. It exists in the Ellipta dry-powder inhaler and nowhere else — alone as Incruse, with vilanterol as Anoro and with fluticasone furoate and vilanterol as Trelegy. Every piece of clinical evidence about it was generated inside that device, which means the molecule and the inhaler cannot be separated in the record even in principle.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Umeclidinium is a member of a class with an older and much better-studied leader. The honest comparison is tiotropium, which has a four-year outcome trial and a 17,135-patient safety trial behind it, against umeclidinium, which has neither. On lung function they are close. On the questions that take years to answer, one of them has been asked and the other has not.',
      conventionalRx: [
        {
          name: 'Tiotropium (Spiriva)',
          class: 'Long-acting muscarinic antagonist',
          howItCompares:
            'The reference molecule of this class, once daily, with a four-year 5,993-patient trial and a 17,135-patient device safety trial in its record. In isolated human bronchial strips the two behave almost identically: time to 50% restoration of contraction after washout was about 381 minutes for umeclidinium and 413 minutes for tiotropium.',
          typicalCost:
            'US$11.73 per unit at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: by far the larger evidence base, including hard safety outcomes over years. Cons: capsule-loading or soft-mist devices rather than a single-step dry-powder inhaler, and no cheaper.',
        },
        {
          name: 'Ipratropium (Atrovent)',
          class: 'Short-acting muscarinic antagonist',
          howItCompares:
            'The same receptor at a hundredth of the price, four times a day instead of once, and directly beaten by a long-acting antimuscarinic on trough lung function and exacerbations in a randomised one-year comparison.',
          typicalCost:
            'US$0.1089 per millilitre at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: generic, cheap, available as a nebuliser solution. Cons: four doses a day, and lower trough lung function than a long-acting agent.',
        },
        {
          name: 'Umeclidinium with vilanterol (Anoro Ellipta)',
          class: 'Long-acting muscarinic antagonist plus long-acting beta-2 agonist',
          howItCompares:
            'The same molecule with a beta-agonist added in the same inhaler. In EMAX, 2,696 patients at low exacerbation risk, the combination gave 66 mL more trough FEV1 than umeclidinium alone at 24 weeks (95% CI 43 to 89, p<0.001).',
          typicalCost:
            'US$6.50 per unit for the vilanterol-containing products at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: 66 mL more lung function and better dyspnoea scores than umeclidinium alone. Cons: two long-acting bronchodilators where one may be enough, and the increment is smaller than the effect of the first drug.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Report eye pain, blurred vision or haloes at once',
          action:
            'If narrow-angle glaucoma is known or suspected, raise it before starting and treat these symptoms as urgent.',
          patientImpact:
            'The label states that worsening of narrow-angle glaucoma may occur and instructs patients to contact a healthcare provider immediately if symptoms appear.',
          clinicalPrecaution:
            'Muscarinic receptors sit in the eye as well as the airway. This is the mechanism working where it was not wanted, which is why it is predictable rather than rare and idiosyncratic.',
        },
        {
          name: 'Say if passing urine has become difficult',
          action:
            'Mention prostate enlargement or bladder-neck obstruction before the first dose and report new difficulty passing urine.',
          patientImpact:
            'The label names worsening of urinary retention as a specific risk requiring immediate contact with a healthcare provider.',
          clinicalPrecaution:
            'Bladder emptying depends on the same receptor family. The risk is highest in men who already have some outflow obstruction.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'C1C[N+]2(CCC1(CC2)C(C3=CC=CC=C3)(C4=CC=CC=C4)O)CCOCC5=CC=CC=C5',
      chemicalFormula: 'C29H34NO2',
      molecularWeight: '428.60 g/mol',
      targetReceptorAffinity:
        'Affinity (Ki) for cloned human M1 to M5 receptors ranged from 0.05 to 0.16 nM — sub-nanomolar and essentially the same at every subtype. Dissociation of the labelled compound was slower from M3 than from M2, with half-lives of 82 and 9 minutes. In acetylcholine-mediated calcium mobilisation in CHO cells expressing human M3 the antagonism was competitive with partial reversibility after washout, and in isolated human bronchial strips the time to 50% restoration of contraction at 10 nM was about 381 minutes, against 413 minutes for tiotropium in the same experiment.',
      structureSource: {
        label:
          'PubChem CID 11519070 (umeclidinium) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/11519070',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ume-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity of the quinuclidinol diphenylmethanol core',
          description:
            'Confirm the tertiary alcohol bearing two phenyl rings on the quinuclidine bridgehead before quaternisation. The diphenyl carbinol is the pharmacophore shared with every antimuscarinic in this class; the benzyloxyethyl group added later is what sets the duration.',
          reagentsAndBuffer:
            'Umeclidinium bromide reference standard, reversed-phase HPLC with ultraviolet detection, 1H and 13C NMR in DMSO-d6, ion chromatography for bromide',
        },
        {
          id: 'ume-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Quaternisation with the benzyloxyethyl arm',
          description:
            'Alkylate the quinuclidine nitrogen with 2-benzyloxyethyl bromide to give the permanently charged azoniabicyclooctane. The charge is deliberate: it keeps the drug in the airway lumen and out of the central nervous system, and it is why swallowed drug contributes almost nothing to systemic exposure.',
          dependsOnStepId: 'ume-w1',
          reagentsAndBuffer:
            '3-substituted quinuclidin-3-ol intermediate, 2-benzyloxyethyl bromide, acetonitrile or chloroform, elevated temperature under nitrogen',
        },
        {
          id: 'ume-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation and micronisation for the Ellipta blister',
          description:
            'Crystallise the bromide and micronise it into a lactose blend with a controlled aerodynamic particle size. This step is not incidental to the drug: umeclidinium has never been given to a patient by any route other than this device, so the powder specification is part of the evidence, not a manufacturing detail beneath it.',
          dependsOnStepId: 'ume-w2',
          reagentsAndBuffer:
            'Recrystallisation from acetonitrile or ethanol, jet milling, lactose monohydrate carrier blend, cascade impaction for aerodynamic particle size distribution, X-ray powder diffraction for polymorph identity',
        },
        {
          id: 'ume-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Antagonism in CHO cells expressing human M3',
          description:
            'Challenge Chinese hamster ovary cells transfected with human M3 receptors with acetylcholine and measure the calcium rise in the presence of drug. Run a washout arm alongside: reversibility after washout is the property that separates members of this class, and a protocol without a washout arm reports only the trivial part of the pharmacology.',
          dependsOnStepId: 'ume-w3',
          reagentsAndBuffer:
            'CHO cells stably expressing recombinant human CHRM3, Fluo-4 or equivalent calcium-sensitive dye, HEPES-buffered assay saline with probenecid, acetylcholine as agonist, repeated buffer washes for the reversibility arm',
        },
        {
          id: 'ume-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Human bronchial strip contraction recovery against a reference antimuscarinic',
          description:
            'Contract isolated human bronchial strips with carbachol, apply drug, wash, and record the time to 50% restoration of contraction with tiotropium run in parallel. Only a side-by-side functional measurement supports a duration comparison between molecules — radioligand off-rates from different laboratories under different conditions do not.',
          dependsOnStepId: 'ume-w4',
          reagentsAndBuffer:
            'Isolated human bronchial strips in Krebs-Henseleit solution at 37C, carbachol as contractile agonist, tiotropium bromide as reference comparator, isometric force transducers, Schild analysis for pA2',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ume-a1',
        category: 'measured',
        title: 'Its own placebo-controlled trials measured lung function, and nothing else',
        laymanSummary:
          'The two trials that support approval both asked the same question: how much more air can you blow out in one second, twenty-four hours after a dose? The answer was around 120 to 130 millilitres more than placebo. Neither trial counted flare-ups.',
        technicalDetails:
          'A 12-week randomised placebo-controlled trial enrolled 246 patients with moderate to very severe COPD; the primary endpoint was change from baseline in trough FEV1 on day 85. Umeclidinium 62.5 and 125 micrograms improved least-squares mean trough FEV1 by 127 and 152 mL against placebo (p<0.001), with 0-6-hour weighted mean improvements of 166 and 191 mL. In the 24-week trial (NCT01313650, 1,532 patients in the intent-to-treat population), all active arms improved trough FEV1 on day 169 by 0.072 to 0.167 L against placebo (all p<0.001), with the umeclidinium-vilanterol combination significantly greater than either monotherapy by 0.052 to 0.095 L (p<=0.004). Both trials used trough FEV1 as the primary endpoint. Neither was designed or powered to measure exacerbations.',
        evidenceSource:
          'Trivedi R, Richard N, Mehta R, Church A. Eur Respir J 2014;43:72-81; Donohue JF, Maleki-Yazdi MR, Kilbride S, et al. Respir Med 2013;107:1538-1546 (NCT01313650)',
        doi: '10.1183/09031936.00033213',
        measuredMetric: 'Change from baseline in trough FEV1 at 12 and 24 weeks against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'ume-a2',
        category: 'inferred',
        title:
          'The label’s exacerbation claim is borrowed from a trial of a three-drug inhaler',
        laymanSummary:
          'The prescribing information says outright where the evidence for preventing flare-ups comes from: a twelve-month trial of a combination containing umeclidinium plus two other drugs. Umeclidinium on its own has no exacerbation trial.',
        technicalDetails:
          'Section 14 of the INCRUSE ELLIPTA prescribing information states: "Evidence of efficacy for INCRUSE ELLIPTA on COPD exacerbations was established by the efficacy of the umeclidinium component as part of a fixed-dose combination with an ICS/LABA, as assessed in a 12-month trial in 10,355 subjects." That trial is IMPACT, which compared fluticasone furoate plus umeclidinium plus vilanterol against fluticasone furoate-vilanterol and against umeclidinium-vilanterol. In IMPACT the umeclidinium-containing dual arm had the highest exacerbation rate of the three, 1.21 per year against 0.91 on triple therapy (rate ratio 0.75, 95% CI 0.70 to 0.81, P<0.001) and 1.07 on fluticasone furoate-vilanterol. Attributing the exacerbation benefit of a three-drug inhaler to one of its components is an inference from a factorial-looking design that was not factorial.',
        evidenceSource:
          'INCRUSE ELLIPTA United States prescribing information, Clinical Studies 14 and 14.3; Lipson DA, Barnhart F, Brealey N, et al. N Engl J Med 2018;378:1671-1680 (IMPACT, NCT02164513)',
        doi: '10.1056/NEJMoa1713901',
        inferredClaim:
          'That umeclidinium as a single agent reduces COPD exacerbations — a claim the label itself sources to a trial in which umeclidinium was never given alone',
        auditFlag: 'caution',
      },
      {
        id: 'ume-a3',
        category: 'failed',
        title: 'A third of the 12-week trial did not finish it',
        laymanSummary:
          'The trial that reported a striking quality-of-life improvement enrolled 246 people and 168 finished. Nearly a third left before the end, in a study lasting twelve weeks.',
        technicalDetails:
          'The 12-week placebo-controlled trial enrolled 246 patients and 168 completed, a completion rate of 68%. It reported St George’s Respiratory Questionnaire total score changes against placebo of -7.9 units for umeclidinium 62.5 micrograms and -10.87 units for 125 micrograms (both p<0.001), well beyond the conventional 4-unit threshold for clinical significance, and a transitional dyspnoea index focal score improvement that reached significance only at the higher 125-microgram dose. The published record carries a dosage-error correction notice. A health-status result of that size from a 246-patient study with 32% attrition is a weaker foundation than the effect size suggests, and the 125-microgram dose it partly rests on was never approved in the United States.',
        evidenceSource: 'Trivedi R, Richard N, Mehta R, Church A. Eur Respir J 2014;43:72-81',
        doi: '10.1183/09031936.00033213',
        measuredMetric:
          'Completion rate and St George’s Respiratory Questionnaire change at 12 weeks',
        auditFlag: 'caution',
      },
      {
        id: 'ume-a4',
        category: 'measured',
        title: 'IMPACT: adding a steroid beat the umeclidinium-vilanterol pair, and caused pneumonia',
        laymanSummary:
          'In the largest trial umeclidinium has appeared in, the two-bronchodilator combination containing it had the most flare-ups of the three arms. Adding an inhaled steroid cut flare-ups by a quarter and raised the risk of pneumonia by half.',
        technicalDetails:
          'IMPACT randomised 10,355 patients with COPD to 52 weeks of once-daily fluticasone furoate 100 micrograms plus umeclidinium 62.5 micrograms plus vilanterol 25 micrograms, or fluticasone furoate-vilanterol, or umeclidinium-vilanterol, each in a single Ellipta inhaler. Moderate or severe exacerbations were 0.91 per year on triple therapy against 1.07 on fluticasone furoate-vilanterol (rate ratio 0.85, 95% CI 0.80 to 0.90, P<0.001) and 1.21 on umeclidinium-vilanterol (rate ratio 0.75, 95% CI 0.70 to 0.81, P<0.001). Severe exacerbations leading to hospitalisation were 0.13 against 0.19 on umeclidinium-vilanterol (rate ratio 0.66, 95% CI 0.56 to 0.78, P<0.001). Pneumonia was more common in the glucocorticoid-containing arms, with clinician-diagnosed pneumonia significantly more likely on triple therapy than on umeclidinium-vilanterol, hazard ratio 1.53 (95% CI 1.22 to 1.92, P<0.001).',
        evidenceSource:
          'Lipson DA, Barnhart F, Brealey N, et al. N Engl J Med 2018;378:1671-1680 (IMPACT, NCT02164513)',
        doi: '10.1056/NEJMoa1713901',
        measuredMetric:
          'Annual rate of moderate or severe COPD exacerbations across three single-inhaler regimens',
        auditFlag: 'verified',
      },
      {
        id: 'ume-a5',
        category: 'measured',
        title: 'EMAX: adding a beta-agonist bought 66 mL over umeclidinium alone',
        laymanSummary:
          'A 24-week trial in nearly 2,700 people compared umeclidinium with vilanterol, umeclidinium alone, and salmeterol alone. The pair beat umeclidinium alone by 66 millilitres of lung function and salmeterol alone by 141.',
        technicalDetails:
          'EMAX was a 24-week double-blind, double-dummy, parallel-group trial in patients at low exacerbation risk not receiving inhaled corticosteroids, randomised to umeclidinium/vilanterol 62.5/25 micrograms once daily, umeclidinium 62.5 micrograms once daily or salmeterol 50 micrograms twice daily. Change from baseline in trough FEV1 at week 24 was 66 mL greater with the combination than with umeclidinium (95% CI 43 to 89) and 141 mL greater than with salmeterol (95% CI 118 to 164), both p<0.001. Transition Dyspnoea Index at week 24 favoured the combination over umeclidinium by 0.37 units (95% CI 0.06 to 0.68, p=0.018) and over salmeterol by 0.45 (0.15 to 0.76, p=0.004). The risk of a first clinically important deterioration fell by 16 to 25% against umeclidinium and 26 to 41% against salmeterol depending on the definition used.',
        evidenceSource:
          'Maltais F, Bjermer L, Kerwin EM, et al. Respir Res 2019;20:238 (EMAX, NCT03034915)',
        doi: '10.1186/s12931-019-1193-9',
        measuredMetric: 'Trough FEV1 at week 24, dual bronchodilator against each monotherapy',
        auditFlag: 'verified',
      },
      {
        id: 'ume-a6',
        category: 'inferred',
        title: 'The receptor off-rate is quoted in minutes here and in hours for tiotropium',
        laymanSummary:
          'Umeclidinium is described as leaving its target receptor with a half-life of eighty-two minutes. Tiotropium is described as thirty-five hours. Both drugs are taken once a day. The two figures came from different laboratories using different methods and do not mean what putting them side by side suggests.',
        technicalDetails:
          'Umeclidinium binds cloned human M1 to M5 receptors with Ki values of 0.05 to 0.16 nM, and dissociation half-lives of labelled compound were reported as 82 minutes at M3 and 9 minutes at M2. Tiotropium’s corresponding published figures are 34.7 hours at M3 and 3.6 hours at M2, measured two decades earlier in a different laboratory with a different tracer. The only like-for-like comparison in the umeclidinium paper is functional and run in parallel: in isolated human bronchial strips at 10 nM, time to 50% restoration of contraction was about 381 minutes for umeclidinium and 413 minutes for tiotropium. That comparison shows the two behaving almost identically, and it is the one that supports once-daily dosing for both.',
        evidenceSource:
          'Salmon M, Luttmann MA, Foley JJ, et al. J Pharmacol Exp Ther 2013;345:260-270; Disse B, Speck GA, Rominger KL, et al. Life Sci 1993;52:537-544',
        doi: '10.1124/jpet.112.202051',
        inferredClaim:
          'That umeclidinium leaves the M3 receptor twenty-five times faster than tiotropium — a comparison between numbers produced by different assays in different laboratories, which the one parallel functional experiment contradicts',
        auditFlag: 'contested',
      },
      {
        id: 'ume-a7',
        category: 'failed',
        title: 'There is no long-term outcome trial of this molecule',
        laymanSummary:
          'Tiotropium has a four-year trial in 5,993 people and a safety trial in 17,135. Umeclidinium has neither. Its longest dedicated study is a twelve-month safety trial, and its largest appearance is inside a three-drug inhaler.',
        technicalDetails:
          'The prescribing information describes the efficacy basis as three dose-ranging trials in 624 subjects, two placebo-controlled confirmatory trials in 1,738 subjects at 12 and 24 weeks, a 12-month long-term safety trial, and four 12-week trials of umeclidinium added to an inhaled corticosteroid plus long-acting beta-agonist in 1,637 subjects. Nothing in that programme measures mortality, rate of lung function decline or cardiovascular outcomes over years. The class-level cardiovascular question raised for inhaled antimuscarinics in 2008 was answered for tiotropium by UPLIFT and TIOSPIR; for umeclidinium it rests on the class rather than on the molecule.',
        evidenceSource:
          'INCRUSE ELLIPTA United States prescribing information, Clinical Studies 14 and Adverse Reactions 6.1',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'One inhalation from a blister strip',
        laymanDesc:
          'Opening the cover pulls a foil blister into place and pierces it. The powder is drawn in by the breath — there is no propellant and nothing to press.',
        molecularDetail:
          'Umeclidinium bromide 62.5 micrograms micronised and blended with lactose monohydrate carrier in an Ellipta dry-powder inhaler. Every registration trial of this molecule used this device, so device performance and drug effect are not separable in the clinical record.',
        iconName: 'Wind',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The permanent charge keeps it in the airway',
        laymanDesc:
          'The molecule carries a fixed positive charge, so it does not readily cross membranes or reach the brain. What lands in the mouth and is swallowed contributes almost nothing.',
        molecularDetail:
          'A quaternary azoniabicyclo[2.2.2]octane. The label describes the bronchodilation as predominantly a site-specific effect, which is the pharmacokinetic consequence of a permanently charged nitrogen.',
        iconName: 'Lock',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It occupies the receptor with sub-nanomolar affinity',
        laymanDesc:
          'It sits in the place acetylcholine would land, on the muscle that wraps the airway, and it takes very little of the drug to do it.',
        molecularDetail:
          'Ki values of 0.05 to 0.16 nM across cloned human M1 to M5, competitive antagonism with partial reversibility after washout. In CHO cells expressing human M3 the potency against acetylcholine-mediated calcium mobilisation was picomolar, and in human bronchial strips against carbachol it was similar.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'It leaves M3 slowly and M2 quickly',
        laymanDesc:
          'It comes off the receptor on airway muscle about nine times more slowly than off the receptor found on the heart and on nerve endings. That gap is what a once-daily antimuscarinic is designed around.',
        molecularDetail:
          'Reported dissociation half-lives of 82 minutes at M3 against 9 minutes at M2. Functional reversal in isolated human bronchus at 10 nM took about 381 minutes to reach 50% recovery, against 413 minutes for tiotropium measured alongside it — a like-for-like comparison that puts the two molecules in the same place.',
        iconName: 'Timer',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Airway calibre rises for twenty-four hours',
        laymanDesc:
          'Lung function measured a full day after the dose is still higher than it would have been — around a tenth of a litre more air in the first second of a forced breath out.',
        molecularDetail:
          'Trough FEV1 improvements against placebo of 127 mL at 12 weeks and 0.072 to 0.167 L across arms at 24 weeks, measured 23 to 24 hours after dosing. In guinea pigs 2.5 micrograms intratracheally gave 50% bronchoprotection for more than 24 hours.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What the molecule has not been shown to do alone',
        laymanDesc:
          'No trial has given umeclidinium by itself and counted flare-ups, hospital admissions or deaths. Everything the label claims about flare-ups comes from a trial where it was one drug of three.',
        molecularDetail:
          'The label sources its exacerbation evidence to IMPACT, a 10,355-patient trial of a three-component single inhaler. In IMPACT the umeclidinium-vilanterol arm had the highest exacerbation rate of the three at 1.21 per year, against 0.91 on triple therapy.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Trivedi 2014 — 12-week placebo-controlled umeclidinium monotherapy',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, 12 weeks',
        sampleSize: 246,
        primaryEndpoint: 'Change from baseline in trough FEV1 on day 85',
        endpointMet: true,
        statisticalPValue:
          'Trough FEV1 +127 mL (62.5 micrograms) and +152 mL (125 micrograms) against placebo, both p<0.001',
        unreportedAdverseSignals:
          '246 enrolled and 168 completed — 32% attrition over twelve weeks. The transitional dyspnoea index reached significance only at 125 micrograms, a dose never approved in the United States, and the published record carries a dosage-error correction.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'DB2113373 (NCT01313650)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, four-arm, 24 weeks',
        sampleSize: 1532,
        primaryEndpoint: 'Trough FEV1 on day 169, 23 to 24 hours post-dose',
        endpointMet: true,
        statisticalPValue:
          'All active arms 0.072 to 0.167 L above placebo (all p<0.001); umeclidinium-vilanterol above each monotherapy by 0.052 to 0.095 L (p<=0.004)',
        unreportedAdverseSignals:
          'Every endpoint in this trial is a lung-function or symptom-scale measurement. Exacerbations were not a designed endpoint, and the trial ran 24 weeks — too short to count them reliably.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'EMAX (NCT03034915)',
        phase: 'Phase 4, randomised, double-blind, double-dummy, three-arm, 24 weeks',
        sampleSize: 2696,
        primaryEndpoint: 'Trough FEV1 at week 24',
        endpointMet: true,
        statisticalPValue:
          'Umeclidinium/vilanterol above umeclidinium by 66 mL (95% CI 43 to 89) and above salmeterol by 141 mL (95% CI 118 to 164), both p<0.001',
        unreportedAdverseSignals:
          'Enrolment was restricted to patients at low exacerbation risk who were not taking inhaled corticosteroids, so the result does not transfer to the frequent-exacerbator population where most COPD prescribing decisions are made.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'IMPACT (NCT02164513)',
        phase: 'Phase 3, randomised, double-blind, three-arm, 52 weeks',
        sampleSize: 10355,
        primaryEndpoint: 'Annual rate of moderate or severe COPD exacerbations during treatment',
        endpointMet: true,
        statisticalPValue:
          'Triple 0.91/year against fluticasone furoate-vilanterol 1.07 (rate ratio 0.85, 95% CI 0.80 to 0.90, P<0.001) and against umeclidinium-vilanterol 1.21 (rate ratio 0.75, 95% CI 0.70 to 0.81, P<0.001)',
        unreportedAdverseSignals:
          'Clinician-diagnosed pneumonia was significantly more likely on triple therapy than on umeclidinium-vilanterol, hazard ratio 1.53 (95% CI 1.22 to 1.92, P<0.001). The umeclidinium-containing dual arm had the highest exacerbation rate of the three, and this is the trial the umeclidinium label cites for exacerbation efficacy.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Trough FEV1 127 mL above placebo at 12 weeks and 0.072 to 0.167 L above placebo across arms at 24 weeks',
        'Ki values of 0.05 to 0.16 nM at cloned human M1 to M5 receptors',
        'Time to 50% restoration of human bronchial strip contraction of about 381 minutes, against 413 minutes for tiotropium measured alongside',
        'Umeclidinium-vilanterol 66 mL above umeclidinium alone in trough FEV1 at 24 weeks in 2,696 patients',
        'An exacerbation rate of 1.21 per year on umeclidinium-vilanterol in IMPACT, the highest of the trial’s three arms',
      ],
      unsupportedInferences: [
        'That umeclidinium alone reduces COPD exacerbations — the label sources that claim to a trial of a three-drug inhaler',
        'That an 82-minute M3 off-rate makes it materially shorter-acting than tiotropium, when the one parallel functional experiment puts them within 10% of each other',
        'That a -7.9 to -10.87 unit health-status improvement in a 246-patient trial with 32% attrition is a settled result',
        'That its long-term cardiovascular and mortality safety is established, when it rests on the class rather than on any trial of this molecule',
      ],
      whatFailedInitially: [
        'Nearly a third of the 12-week pivotal trial withdrew before completion',
        'The 125-microgram dose that produced the larger dyspnoea and health-status effects was not approved in the United States',
        'In IMPACT the umeclidinium-containing dual-bronchodilator arm had the highest exacerbation rate and the highest hospitalisation rate of the three regimens',
        'No trial of this molecule has ever measured mortality, rate of FEV1 decline or cardiovascular outcomes over years',
      ],
      realWorldOutcome: [
        'Approved as a once-daily maintenance bronchodilator for chronic obstructive pulmonary disease and not for asthma',
        'Sold exclusively inside the Ellipta inhaler, alone as Incruse and in the two- and three-drug combinations built on it',
        'Its commercial life is largely as a component: the fixed combinations, not the single agent, carry the outcome evidence',
        'Still brand-priced across all three listed presentations in the CMS acquisition survey',
      ],
    },
    deliverySystem: {
      type: 'Inhalation powder, 62.5 micrograms per blister, in the Ellipta dry-powder inhaler',
      description:
        'One inhalation once daily. Opening the cover indexes and pierces a foil blister; the dose is drawn in by the patient’s own inspiratory effort, with no propellant and no coordination step. This device is the only way umeclidinium has ever been administered in a trial, so its evidence and its hardware are the same object.',
      safetyProfile:
        'Not to be initiated in rapidly deteriorating or potentially life-threatening COPD and not for relief of acute symptoms — acute symptoms are to be treated with an inhaled short-acting beta-2 agonist. Paradoxical bronchospasm requires discontinuation. Worsening of narrow-angle glaucoma and worsening of urinary retention are both named in the label as reasons to contact a healthcare provider immediately, with caution advised in prostatic hyperplasia and bladder-neck obstruction. The most common adverse reactions at 2% or more and more common than placebo were nasopharyngitis, upper respiratory tract infection, cough and arthralgia.',
    },
    commonQuestions: [
      {
        q: 'Does umeclidinium stop flare-ups?',
        a: 'Not on the strength of any trial of umeclidinium alone. The prescribing information is unusually candid about this: it says the evidence for exacerbation efficacy was established by the umeclidinium component as part of a fixed-dose combination with an inhaled corticosteroid and a long-acting beta-agonist, in a twelve-month trial of 10,355 people. In that trial, IMPACT, the arm containing umeclidinium without a steroid had the highest exacerbation rate of the three at 1.21 per year. What umeclidinium alone has been shown to do is raise trough lung function by around 120 to 130 mL for twenty-four hours, which is a genuine measurement of something else.',
        auditNote:
          'This is a component-attribution inference, and it is common across combination-inhaler labels. It is not fraud; it is a claim that rests on a design that could not isolate the component.',
      },
      {
        q: 'Is it as good as tiotropium?',
        a: 'On the pharmacology, they look almost the same. In the single experiment that measured both side by side — isolated human bronchial strips, washed out after exposure — the time to half-recovery of contraction was about 381 minutes for umeclidinium and 413 for tiotropium. On lung function in patients the two are comparable. On everything that takes years to measure, they are not comparable at all: tiotropium has a four-year trial in 5,993 people and a device safety trial in 17,135, and umeclidinium has a twelve-month safety study. That is a difference in what is known, not a demonstrated difference in the drugs.',
      },
      {
        q: 'Why can I only get it in that one inhaler?',
        a: 'Because it has never existed anywhere else. Umeclidinium was developed as GSK573719 specifically for the Ellipta device, and every trial that supports it was run in that device — alone, with vilanterol, and with fluticasone furoate and vilanterol. That has a consequence people rarely notice: the evidence base cannot separate the molecule from the hardware, so a future generic would have to demonstrate equivalent lung deposition from a different inhaler rather than merely equivalent chemistry.',
      },
      {
        q: 'Should I be taking a steroid inhaler with it?',
        a: 'That is a question for a prescriber, and IMPACT is the trial that informs it, with a cost attached in both directions. Adding fluticasone furoate to umeclidinium and vilanterol cut moderate or severe exacerbations from 1.21 to 0.91 per year and hospitalisations from 0.19 to 0.13. It also raised clinician-diagnosed pneumonia, hazard ratio 1.53 with a confidence interval of 1.22 to 1.92. Whether that trade favours a particular person depends on how often they exacerbate, and this page does not make that judgement.',
      },
      {
        q: 'Can I use it for asthma?',
        a: 'It is not approved for asthma. The indication reads maintenance treatment of chronic obstructive pulmonary disease and nothing else, and asthma is absent from the label rather than warned against in it. The related molecule tiotropium was separately studied in asthma and approved there as an add-on; umeclidinium was not.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Trivedi R, Richard N, Mehta R, Church A. Umeclidinium in patients with COPD: a randomised, placebo-controlled study. Eur Respir J 2014;43:72-81',
        identifier: '10.1183/09031936.00033213',
        kind: 'doi',
      },
      {
        label:
          'Donohue JF, Maleki-Yazdi MR, Kilbride S, et al. Efficacy and safety of once-daily umeclidinium/vilanterol 62.5/25 mcg in COPD. Respir Med 2013;107:1538-1546',
        identifier: '10.1016/j.rmed.2013.06.001',
        kind: 'doi',
      },
      {
        label:
          'Lipson DA, Barnhart F, Brealey N, et al. Once-Daily Single-Inhaler Triple versus Dual Therapy in Patients with COPD. N Engl J Med 2018;378:1671-1680',
        identifier: '10.1056/NEJMoa1713901',
        kind: 'doi',
      },
      {
        label:
          'Maltais F, Bjermer L, Kerwin EM, et al. Efficacy of umeclidinium/vilanterol versus umeclidinium and salmeterol monotherapies in symptomatic patients with COPD not receiving inhaled corticosteroids: the EMAX randomised trial. Respir Res 2019;20:238',
        identifier: '10.1186/s12931-019-1193-9',
        kind: 'doi',
      },
      {
        label:
          'Salmon M, Luttmann MA, Foley JJ, et al. Pharmacological characterization of GSK573719 (umeclidinium). J Pharmacol Exp Ther 2013;345:260-270',
        identifier: '10.1124/jpet.112.202051',
        kind: 'doi',
      },
      {
        label:
          'Disse B, Speck GA, Rominger KL, Witek TJ, Hammer R. Ba 679 BR, a novel long-acting anticholinergic bronchodilator. Life Sci 1993;52:537-544',
        identifier: '10.1016/0024-3205(93)90312-q',
        kind: 'doi',
      },
      {
        label: 'DB2113373 — 24-week umeclidinium/vilanterol and components trial',
        identifier: 'NCT01313650',
        kind: 'nct',
      },
      {
        label: 'EMAX — umeclidinium/vilanterol against umeclidinium and against salmeterol',
        identifier: 'NCT03034915',
        kind: 'nct',
      },
      {
        label: 'IMPACT — single-inhaler triple against dual therapy in 10,355 patients',
        identifier: 'NCT02164513',
        kind: 'nct',
      },
      {
        label:
          'INCRUSE ELLIPTA (umeclidinium inhalation powder) United States prescribing information — Indications, Warnings and Precautions 5.1 to 5.5, Adverse Reactions 6.1, Clinical Studies 14 and 14.3, Clinical Pharmacology 12.1',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22INCRUSE+ELLIPTA%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 11519070 — umeclidinium structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/11519070',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
]
