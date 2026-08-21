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
        title:
          'The FDA-mandated safety trial: no excess of serious asthma events, in 11,693 people',
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
        phase:
          'Randomised controlled trial, 4 to 6 years of treatment, height measured at mean age 24.9',
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
      type: 'Dry-powder inhaler, nebuliser suspension, nasal spray, and oral delayed-release capsules and extended-release tablets',
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
        title:
          'Novel START: as-needed budesonide-formoterol halved exacerbations against albuterol',
        laymanSummary:
          'In an open trial that let people behave as they do in real life, using a combined steroid-and-formoterol inhaler for symptom relief produced half the attacks of using a plain rescue inhaler.',
        technicalDetails:
          'Novel START (ACTRN12615000999538) was a 52-week open-label trial in 675 adults with mild asthma, 668 analysed, randomised to as-needed albuterol, twice-daily budesonide with as-needed albuterol, or as-needed budesonide-formoterol, with electronic inhaler monitoring. The annualised exacerbation rate was 0.195 on budesonide-formoterol against 0.400 on albuterol (relative rate 0.49, 95% CI 0.33 to 0.72, P<0.001) and did not differ from budesonide maintenance (0.175; relative rate 1.12, 95% CI 0.70 to 1.79, P=0.65). Severe exacerbations numbered 9 on budesonide-formoterol against 23 on albuterol (relative risk 0.40, 95% CI 0.18 to 0.86) and 21 on budesonide maintenance (relative risk 0.44, 95% CI 0.20 to 0.96). Mean inhaled budesonide was 107 micrograms per day against 222 on maintenance. The trial was open-label by design, to capture the adherence behaviour a blinded trial removes.',
        evidenceSource: 'Beasley R et al., N Engl J Med 2019;380:2020-2030 (Novel START)',
        doi: '10.1056/NEJMoa1901963',
        measuredMetric:
          'Annualised asthma exacerbation rate over 52 weeks under electronic monitoring',
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
        title:
          'The Cochrane pooling still cannot rule out a mortality signal, and children are unresolved',
        laymanSummary:
          'Pooling every randomised trial of formoterol with a steroid found six deaths on formoterol and one without it. The difference was not statistically significant, but the confidence interval is wide enough to contain real harm, and the paediatric data are thinner still.',
        technicalDetails:
          'Cates and colleagues pooled 20 studies in 10,578 adults and adolescents and seven studies in 2,788 children and adolescents comparing regular formoterol plus inhaled corticosteroid against the same dose of inhaled corticosteroid alone. Six deaths occurred on formoterol and one on the comparator (Peto odds ratio 3.56, 95% CI 0.79 to 16.03, graded low-quality evidence); all were in adults and one was believed asthma-related. Non-fatal serious adverse events of any cause were similar in adults (Peto OR 0.98, 95% CI 0.76 to 1.27) while asthma-related serious adverse events were significantly fewer on formoterol (Peto OR 0.49, 95% CI 0.28 to 0.88). In children, all-cause serious adverse events trended up (Peto OR 1.62, 95% CI 0.80 to 3.28) and asthma-related events too (Peto OR 1.49, 95% CI 0.48 to 4.61), both imprecise. The authors conclude it is not possible to reassure people that regular formoterol with an inhaled corticosteroid carries no increase in mortality, while finding no conclusive evidence of harm across more than 4,200 patient-years.',
        evidenceSource:
          'Cates CJ, Jaeschke R, Schmidt S, Ferrer M. Cochrane Database Syst Rev 2013;(6):CD006924',
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
        statisticalPValue:
          'Hazard ratio 1.07 (95% CI 0.70 to 1.65); non-inferiority margin 2.0 met',
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
        measuredMetric:
          'Time to first moderate or severe exacerbation, tiotropium against salmeterol',
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
        label:
          'AUSTRI — the FDA-mandated salmeterol-fluticasone safety trial in adolescents and adults',
        identifier: 'NCT01475721',
        kind: 'nct',
      },
      {
        label:
          'VESTRI — the FDA-mandated salmeterol-fluticasone safety trial in children aged 4 to 11',
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
        label:
          'LARGE — genotype-stratified crossover trial of salmeterol by ADRB2 codon 16 genotype',
        identifier: 'NCT00200967',
        kind: 'nct',
      },
      {
        label:
          'SEREVENT DISKUS (salmeterol xinafoate inhalation powder) United States prescribing information — boxed warning, Contraindications, Warnings and Precautions 5.1, Clinical Pharmacology 12.1',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22salmeterol+xinafoate%22',
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
      smilesString: 'C[N+]1([C@@H]2CC(C[C@H]1[C@H]3[C@@H]2O3)OC(=O)C(C4=CC=CS4)(C5=CC=CS5)O)C',
      chemicalFormula: 'C19H22NO4S2',
      molecularWeight: '392.50 g/mol',
      targetReceptorAffinity:
        'The label states similar affinity across muscarinic subtypes M1 to M5, with the airway effect arising from M3 inhibition on smooth muscle, and describes the antagonism as competitive and reversible. The duration is kinetic rather than affinity-driven: in the original characterisation, dissociation half-lives from human receptors were 34.7 hours at M3, 14.6 hours at M1 and 3.6 hours at M2, against 0.26, 0.11 and 0.035 hours for ipratropium. Faster release from M2 than from M3 is what the authors called kinetic receptor subtype selectivity.',
      structureSource: {
        label: 'PubChem CID 5487427 (tiotropium) — canonical SMILES, molecular formula and weight',
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
        phase:
          'Phase 3, two replicate randomised, double-blind, placebo-controlled trials, 48 weeks',
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
        label:
          'UPLIFT — four-year tiotropium trial with rate of FEV1 decline as co-primary endpoint',
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
      smilesString: 'C1C[N+]2(CCC1(CC2)C(C3=CC=CC=C3)(C4=CC=CC=C4)O)CCOCC5=CC=CC=C5',
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
        title: 'The label’s exacerbation claim is borrowed from a trial of a three-drug inhaler',
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
        title:
          'IMPACT: adding a steroid beat the umeclidinium-vilanterol pair, and caused pneumonia',
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
  // ---------------------------------------------------------------------------------------------
  // 6. Vilanterol trifenatate — a beta-agonist that has never been sold on its own, whose largest
  //    monotherapy dataset is a control arm in a trial that missed its primary endpoint.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'vilanterol-trifenatate',
    name: 'Vilanterol Trifenatate',
    tradeName: 'Breo Ellipta / Anoro Ellipta / Trelegy Ellipta',
    sponsor: 'Glaxo Grp Ltd. (developed as GW642444)',
    targetGene: 'ADRB2',
    targetProtein: 'Beta-2 adrenergic receptor — a Gs-coupled G-protein-coupled receptor',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2013,
    indication:
      'Only as a component of a fixed-dose combination. With fluticasone furoate (Breo Ellipta): maintenance treatment of chronic obstructive pulmonary disease and maintenance treatment of asthma in patients aged 5 years and older. With umeclidinium (Anoro Ellipta) and with fluticasone furoate plus umeclidinium (Trelegy Ellipta): maintenance treatment of COPD. Not indicated for relief of acute bronchospasm.',
    patientFriendlyIndication:
      'The airway-relaxing half of a once-daily combination inhaler — never prescribed by itself',
    anatomicalSite:
      'Beta-2 adrenoceptors on bronchial smooth muscle, reached by dry powder deposited in the conducting airways',
    conditionContext: {
      conditionExplainer:
        'Long-acting beta-agonists relax the ring of muscle around the airway and hold it relaxed. Vilanterol holds it for a full twenty-four hours rather than twelve, which is the property the molecule was designed for and the reason the inhalers built on it are used once a day.',
      whyItMatters:
        'Once-daily dosing is a real advantage, because the medicine most often skipped is the second dose of the day. But a component of a combination cannot be judged on its own from trials of the combination, and vilanterol is the clearest case of that problem in this file.',
      whoTakesThis:
        'People prescribed Breo, Anoro or Trelegy. Nobody takes vilanterol alone, because no such product exists in any market.',
      clinicalGoals:
        'Fewer symptoms and better lung function. In the one trial that gave vilanterol by itself to thousands of people for years, it changed neither mortality nor the rate at which lung function declined.',
    },
    oneSentenceVerdict:
      'A once-daily beta-2 agonist whose functional selectivity the label describes as similar to salmeterol’s, sold only inside combination inhalers; in SUMMIT, where 4,118 people took it alone until the trial’s target number of deaths had accrued, all-cause mortality was unchanged (hazard ratio 0.96, 95% CI 0.81 to 1.14, p=0.655) and the rate of FEV1 decline was unchanged (-2 mL per year, 95% CI -8 to 5), while the steroid it is usually paired with did move that second number.',
    laymanHowItWorks:
      'Vilanterol switches on the same receptor on airway muscle that adrenaline uses, raising a chemical messenger inside the cell that makes the muscle relax. It is built to stay in place for a full day rather than half of one, so the inhaler is used once every twenty-four hours. It does nothing to the inflammation or the tissue damage underneath — which is why it is never sold on its own, and why the products containing it always pair it with a steroid, an antimuscarinic, or both.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 66,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$6.50 per unit, the median across 14 listed products at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Vilanterol is the newest beta-agonist in this file and has no standalone product to price. The 14 listed presentations are all combinations in the Ellipta device, all brand. There is a structural point buried in that: a molecule that is only ever sold inside a combination cannot go generic on its own schedule, because a generic entrant would have to reproduce the whole product — two or three actives, the blister, the device and its deposition profile.',
      synthesisComplexity: 'High',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Because vilanterol is not sold alone, the real comparison is between the inhalers it lives in and the inhalers built on older beta-agonists. The differences are once-daily against twice-daily dosing and device design, not a demonstrated difference in what the beta-agonist itself does. On the one occasion vilanterol was compared head to head against a long-acting antimuscarinic on trough lung function, it did not come out ahead.',
      conventionalRx: [
        {
          name: 'Salmeterol (in Advair and Serevent)',
          class: 'Long-acting beta-2 agonist, twice daily',
          howItCompares:
            'The label describes vilanterol’s functional selectivity in vitro as similar to salmeterol’s and says the clinical relevance of that finding is unknown. The practical difference is dosing interval: twelve hours against twenty-four.',
          typicalCost:
            'US$6.74 per unit at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: decades of outcome data, including two FDA-mandated safety trials in 17,887 people. Cons: twice daily, and slow onset for a beta-agonist.',
        },
        {
          name: 'Formoterol (in Symbicort)',
          class: 'Long-acting beta-2 agonist, twice daily, full agonist',
          howItCompares:
            'Works within one to three minutes rather than tens of minutes, which lets its combination products double as relievers. Vilanterol has no such role: its products are maintenance only.',
          typicalCost:
            'US$4.35 per unit at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: fast onset, generic in several presentations, usable in the as-needed anti-inflammatory reliever strategy. Cons: twice daily.',
        },
        {
          name: 'Tiotropium (Spiriva)',
          class: 'Long-acting muscarinic antagonist, once daily',
          howItCompares:
            'A different class with the same dosing interval. In a 24-week trial of 1,141 patients, umeclidinium plus vilanterol beat tiotropium alone on trough FEV1 by 0.088 to 0.090 L, but adding vilanterol to umeclidinium 125 micrograms in the replicate trial produced no significant gain at all (0.037 L, 95% CI -0.012 to 0.087, p=0.14).',
          typicalCost:
            'US$11.73 per unit at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: a four-year outcome trial and a 17,135-patient safety trial. Cons: does not treat inflammation, so in asthma it is an add-on rather than a foundation.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Rinse your mouth after every dose',
          action:
            'Rinse with water and spit it out after inhaling any product containing an inhaled corticosteroid — which every vilanterol product except Anoro does.',
          patientImpact:
            'The label states that Candida albicans infection of the mouth and pharynx may occur and advises rinsing without swallowing to reduce the risk.',
          clinicalPrecaution:
            'This is about the steroid partner, not about vilanterol. It applies to Breo and Trelegy and not to Anoro, which is a point worth being clear on rather than blurring across the family.',
        },
        {
          name: 'Never carry two long-acting beta-agonist inhalers',
          action:
            'Check that no second inhaler in use also contains a long-acting beta-agonist before adding anything.',
          patientImpact:
            'The label warns explicitly against using a vilanterol product together with additional therapy containing a long-acting beta-agonist, because of the risk of overdose.',
          clinicalPrecaution:
            'This is easy to do accidentally when a person is switched between brands and keeps the old inhaler. The names differ; the class does not.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'C1=CC=C(C=C1)C(C2=CC=CC=C2)(C3=CC=CC=C3)C(=O)O.C1=CC(=C(C(=C1)Cl)COCCOCCCCCCNC[C@@H](C2=CC(=C(C=C2)O)CO)O)Cl',
      chemicalFormula: 'C44H49Cl2NO7',
      molecularWeight: '774.80 g/mol',
      targetReceptorAffinity:
        'The label reports only that in vitro tests showed the functional selectivity of vilanterol to be similar to that of salmeterol, and states that the clinical relevance of that finding is unknown. It also records that beta-2 receptors comprise 10% to 50% of total beta-adrenergic receptors in the human heart, so selectivity for the airway receptor does not imply the absence of cardiac effect. No numeric selectivity ratio for vilanterol appears in the prescribing information, and none is stated here.',
      structureSource: {
        label:
          'PubChem CID 44482554 (vilanterol trifenatate) — canonical SMILES, molecular formula and weight; the formula and mass include the triphenylacetate counter-ion',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/44482554',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'vil-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Chiral identity of the saligenin ethanolamine head',
          description:
            'Confirm the single (R) configuration at the benzylic alcohol before anything else. Vilanterol is a single enantiomer; the opposite one is not a weaker bronchodilator but a different pharmacology, and separating them after the fact is far harder than controlling the step that sets them.',
          reagentsAndBuffer:
            'Vilanterol trifenatate reference standard, chiral HPLC on a polysaccharide stationary phase, 1H NMR in DMSO-d6, optical rotation, Karl Fischer titration',
        },
        {
          id: 'vil-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Alkylation joining the head to the dichlorobenzyl ether tail',
          description:
            'Couple the protected saligenin amino alcohol to the 2,6-dichlorobenzyl-oxyethoxy-hexyl arm. Two chlorines and two ether oxygens in that tail are what push the duration from twelve hours to twenty-four; the head group is essentially the same pharmacophore that salmeterol and formoterol carry.',
          dependsOnStepId: 'vil-w1',
          reagentsAndBuffer:
            'N-protected (R)-saligenin amine, 6-[2-(2,6-dichlorobenzyloxy)ethoxy]hexyl bromide, potassium carbonate or diisopropylethylamine base, anhydrous acetonitrile or dimethylformamide, nitrogen atmosphere',
        },
        {
          id: 'vil-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Deprotection and formation of the triphenylacetate salt',
          description:
            'Remove protection and crystallise the free base as the trifenatate. Triphenylacetic acid is a bulky, lipophilic counter-ion chosen for crystallinity and powder handling, and it is why the stated formula and molecular weight of the drug substance are far larger than those of the active cation.',
          dependsOnStepId: 'vil-w2',
          reagentsAndBuffer:
            'Hydrogenolysis over palladium on carbon or acid deprotection, triphenylacetic acid, ethanol or isopropanol crystallisation, X-ray powder diffraction and differential scanning calorimetry for polymorph identity',
        },
        {
          id: 'vil-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Exposure of ADRB2-expressing cells with a washout arm',
          description:
            'Dose cells stably expressing human ADRB2, then wash repeatedly and re-measure. For a molecule whose entire selling point is a twenty-four-hour duration, the washout arm is the experiment; a single-timepoint potency measurement would make vilanterol indistinguishable from a short-acting agonist.',
          dependsOnStepId: 'vil-w3',
          reagentsAndBuffer:
            'CHO-K1 cells stably transfected with human ADRB2, Ham F-12 medium with 10% fetal bovine serum and selection antibiotic, HEPES-buffered assay saline, 3-isobutyl-1-methylxanthine to block phosphodiesterase, serial serum-free washes',
        },
        {
          id: 'vil-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'cAMP response and beta-1 counter-screen run in parallel',
          description:
            'Measure cyclic AMP accumulation against a full agonist, and run the same curve on cells expressing beta-1 receptors on the same plate. Reporting a beta-2 potency without the parallel beta-1 arm gives a number that cannot support any selectivity claim, which is precisely why the label makes none.',
          dependsOnStepId: 'vil-w4',
          reagentsAndBuffer:
            'Homogeneous time-resolved fluorescence cAMP kit, isoprenaline as full-agonist reference, ADRB1-expressing counter-screen line, ICI 118,551 and CGP 20712A as subtype-selective antagonist controls',
        },
      ],
    },
    keyAudits: [
      {
        id: 'vil-a1',
        category: 'failed',
        title: 'SUMMIT: 4,118 people took vilanterol alone, and it changed nothing measurable',
        laymanSummary:
          'The largest trial ever to give vilanterol by itself put more than four thousand people on it until the trial had counted enough deaths to stop. Deaths were unchanged. The rate at which lung function fell was unchanged. The steroid arm of the same trial did slow that decline; the vilanterol arm did not.',
        technicalDetails:
          'SUMMIT randomised 16,590 patients aged 40 to 80 with post-bronchodilator FEV1 of 50% to 70% predicted and a history of or increased risk of cardiovascular disease, one-to-one-to-one-to-one, to placebo, fluticasone furoate 100 micrograms, vilanterol 25 micrograms, or the combination, once daily. Compared with placebo, all-cause mortality was unaffected by vilanterol alone (hazard ratio 0.96, 95% CI 0.81 to 1.14, p=0.655), by fluticasone furoate alone (0.91, 0.77 to 1.08, p=0.284) or by the combination (0.88, 0.74 to 1.04, p=0.137). The rate of FEV1 decline was reduced by the combination (38 mL per year against 46 for placebo, difference 8 mL per year, 95% CI 1 to 15) and by fluticasone furoate (difference 8 mL per year, 95% CI 1 to 14), but not by vilanterol (difference -2 mL per year, 95% CI -8 to 5). Composite cardiovascular events were unaffected by all three (vilanterol hazard ratio 0.99, 95% CI 0.80 to 1.22).',
        evidenceSource:
          'Vestbo J, Anderson JA, Brook RD, et al. Lancet 2016;387:1817-1826 (SUMMIT, NCT01313676)',
        doi: '10.1016/S0140-6736(16)30069-1',
        measuredMetric:
          'All-cause mortality, rate of FEV1 decline and composite cardiovascular events, vilanterol monotherapy against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'vil-a2',
        category: 'inferred',
        title:
          'SUMMIT missed its primary endpoint, and its authors said to read the rest carefully',
        laymanSummary:
          'The trial was built to show that the combination improved survival. It did not, at p=0.137. The paper then says in its own findings that because the primary outcome was not met, the secondary outcomes should be interpreted with caution — including the finding about slowing lung-function decline that is most often quoted from it.',
        technicalDetails:
          'The primary outcome of SUMMIT was all-cause mortality; the secondary outcomes were on-treatment rate of FEV1 decline and a composite of cardiovascular events. The combination gave a hazard ratio of 0.88 (95% CI 0.74 to 1.04, a 12% relative reduction, p=0.137). The published findings state directly that because of this, secondary outcomes should be interpreted with caution. The 8 mL per year reduction in FEV1 decline attributed to fluticasone furoate is one of those secondary outcomes, and it is a difference of 8 mL against a placebo decline of 46 mL per year — around one sixth of the slope, in a trial whose statistical gatekeeper did not open.',
        evidenceSource:
          'Vestbo J, Anderson JA, Brook RD, et al. Lancet 2016;387:1817-1826 (SUMMIT)',
        doi: '10.1016/S0140-6736(16)30069-1',
        inferredClaim:
          'That fluticasone furoate with vilanterol slows lung-function decline in moderate COPD — a secondary outcome in a trial that missed its primary endpoint, which the authors flagged as requiring caution',
        auditFlag: 'caution',
      },
      {
        id: 'vil-a3',
        category: 'failed',
        title: 'One of the two replicate exacerbation trials did not reach significance',
        laymanSummary:
          'Two identical year-long trials asked whether adding a steroid to vilanterol prevents more flare-ups than vilanterol alone. The second one said yes at every dose. The first one did not reach significance even at the highest dose, and the way the statistics were ordered meant the lower doses in that trial could not be tested at all.',
        technicalDetails:
          'Two replicate double-blind parallel-group one-year trials randomised 1,622 and 1,633 patients to vilanterol 25 micrograms alone or with fluticasone furoate 50, 100 or 200 micrograms once daily, with yearly rate of moderate and severe exacerbations as the primary endpoint. In study 1 there was no significant difference between fluticasone furoate/vilanterol 200/25 and vilanterol alone (0.90 against 1.05 events per year; ratio 0.9, 95% CI 0.7 to 1.0), and because of the statistical hierarchy used, significance could not be inferred for the 50 and 100 microgram groups. In study 2 all three combination groups beat vilanterol alone (p=0.0398, 0.0244 and 0.0004). The pooled analysis was significant for all three doses. Pneumonia and fractures were reported more frequently with fluticasone furoate and vilanterol than with vilanterol alone.',
        evidenceSource:
          'Dransfield MT, Bourbeau J, Jones PW, et al. Lancet Respir Med 2013;1:210-223 (NCT01009463 and NCT01017952)',
        doi: '10.1016/S2213-2600(13)70040-7',
        measuredMetric:
          'Yearly rate of moderate and severe COPD exacerbations, fluticasone furoate/vilanterol against vilanterol alone',
        auditFlag: 'caution',
      },
      {
        id: 'vil-a4',
        category: 'failed',
        title: 'Eight deaths from pneumonia in the steroid arms, none in the vilanterol-only arm',
        laymanSummary:
          'In the same pair of trials, eight people died of pneumonia among those taking the steroid with vilanterol. Nobody taking vilanterol alone did.',
        technicalDetails:
          'Across the two replicate one-year trials, pneumonia and fractures were reported more frequently in the fluticasone furoate/vilanterol groups than in the vilanterol-only group, and eight deaths from pneumonia were recorded in the fluticasone furoate/vilanterol groups against none in the vilanterol-only group. In IMPACT, the 10,355-patient triple-therapy trial, clinician-diagnosed pneumonia was significantly more likely on the fluticasone furoate-containing triple regimen than on umeclidinium-vilanterol, hazard ratio 1.53 (95% CI 1.22 to 1.92, P<0.001). SUMMIT, in a milder population, reported no excess pneumonia — 6% on combination against 5% on placebo. The signal is real, it belongs to the inhaled corticosteroid rather than to vilanterol, and its size depends on how severe the population is.',
        evidenceSource:
          'Dransfield MT et al., Lancet Respir Med 2013;1:210-223; Lipson DA et al., N Engl J Med 2018;378:1671-1680; Vestbo J et al., Lancet 2016;387:1817-1826',
        doi: '10.1016/S2213-2600(13)70040-7',
        measuredMetric:
          'Deaths from pneumonia and pneumonia incidence, inhaled corticosteroid arms against non-steroid arms',
        auditFlag: 'caution',
      },
      {
        id: 'vil-a5',
        category: 'measured',
        title: 'Adding vilanterol to umeclidinium 125 micrograms produced no significant gain',
        laymanSummary:
          'Two replicate trials tested the combination against each of its parts. Against tiotropium and against vilanterol alone the pair won. Against the higher dose of umeclidinium alone it did not — the confidence interval crossed zero twice.',
        technicalDetails:
          'Two 24-week randomised, blinded, double-dummy trials recruited 1,141 and 1,191 participants to umeclidinium 125 plus vilanterol 25, umeclidinium 62.5 plus vilanterol 25, tiotropium 18, and either vilanterol 25 (study 1) or umeclidinium 125 (study 2), with trough FEV1 on day 169 as the primary endpoint. Both combination doses beat tiotropium (0.088 and 0.090 L in study 1, 0.074 and 0.060 L in study 2) and both beat vilanterol monotherapy (0.088 L, 95% CI 0.036 to 0.140, p=0.0010; 0.090 L, 0.039 to 0.142, p=0.0006). Neither beat umeclidinium 125 micrograms monotherapy: 0.037 L (95% CI -0.012 to 0.087, p=0.14) and 0.022 L (-0.027 to 0.072, p=0.38). There were no significant differences in symptoms, health status or exacerbation risk between the combination and tiotropium.',
        evidenceSource:
          'Decramer M, Anzueto A, Kerwin E, et al. Lancet Respir Med 2014;2:472-486 (NCT01316900 and NCT01316913)',
        doi: '10.1016/S2213-2600(14)70065-7',
        measuredMetric:
          'Trough FEV1 on day 169, umeclidinium plus vilanterol against each monotherapy and against tiotropium',
        auditFlag: 'verified',
      },
      {
        id: 'vil-a6',
        category: 'measured',
        title:
          'Salford: an 8.4% exacerbation reduction in ordinary general practice, and nothing else',
        laymanSummary:
          'A trial run inside real general practices, with almost no exclusion criteria, put 2,799 people on the combination or on whatever they would have had anyway. Flare-ups fell by 8.4%. Nothing else the trial measured moved.',
        technicalDetails:
          'The Salford Lung Study randomised 2,799 patients with COPD across 75 general practices to once-daily fluticasone furoate 100 micrograms plus vilanterol 25 micrograms or to usual care, with the rate of moderate or severe exacerbations among those with an exacerbation in the previous year as the primary outcome. That rate was 8.4% lower with the combination (95% CI 1.1 to 15.2, P=0.02). There was no significant difference in the annual rate of COPD-related contacts with primary or secondary care, and no significant between-group difference in time to first moderate or severe exacerbation or time to first severe exacerbation. There were no excess serious adverse events of pneumonia.',
        evidenceSource:
          'Vestbo J, Leather D, Diar Bakerly N, et al. N Engl J Med 2016;375:1253-1260 (Salford Lung Study, NCT01551758)',
        doi: '10.1056/NEJMoa1608033',
        measuredMetric:
          'Rate of moderate or severe COPD exacerbations under everyday general-practice conditions',
        auditFlag: 'verified',
      },
      {
        id: 'vil-a7',
        category: 'inferred',
        title: 'Everything claimed for this molecule is claimed for a product containing it',
        laymanSummary:
          'Vilanterol has never been marketed on its own, in any country. The two-drug and three-drug inhalers it lives in carry all the evidence, and separating out what the beta-agonist contributes is an inference rather than a measurement — except in SUMMIT, where it was given alone and produced nothing.',
        technicalDetails:
          'Vilanterol trifenatate exists commercially only in Breo Ellipta (with fluticasone furoate), Anoro Ellipta (with umeclidinium) and Trelegy Ellipta (with both). The label’s pharmacology section says only that in vitro functional selectivity was similar to salmeterol’s and that the clinical relevance is unknown; no numeric selectivity ratio, receptor affinity or dissociation half-life appears in it. The monotherapy evidence that does exist comes from control arms: 4,118 patients in the vilanterol arm of SUMMIT, where mortality, cardiovascular events and FEV1 decline were all unchanged, and roughly 209 patients over 24 weeks in one of the Decramer trials, where the pair beat it by about 90 mL. On this page the combination results are labelled as combination results throughout.',
        evidenceSource:
          'BREO ELLIPTA United States prescribing information, Clinical Pharmacology 12.1; Vestbo J et al., Lancet 2016;387:1817-1826; Decramer M et al., Lancet Respir Med 2014;2:472-486',
        inferredClaim:
          'That vilanterol’s contribution to the products containing it can be read from trials of those products — a component attribution that only SUMMIT tested directly, and that SUMMIT did not support',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'One inhalation from a foil blister',
        laymanDesc:
          'Opening the inhaler cover indexes a blister and pierces it. The powder is drawn in by the breath. Every product containing vilanterol works this way and no other.',
        molecularDetail:
          'Vilanterol trifenatate 25 micrograms of the base, micronised with lactose carrier, in an Ellipta dry-powder inhaler alongside fluticasone furoate, umeclidinium, or both in separate blister strips inhaled together.',
        iconName: 'Wind',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The dichlorobenzyl tail anchors it near the receptor',
        laymanDesc:
          'Like the older long-acting beta-agonists, half the molecule is a long chain that does not act on the receptor at all. It lodges in the fatty membrane so the working end stays within reach for a full day.',
        molecularDetail:
          'A saligenin ethanolamine head connected through a hexyl-ethoxy linker to a 2,6-dichlorobenzyl ether. The lipophilic halogenated tail is the structural difference from salmeterol’s phenylbutoxy chain and is the accepted basis for the extension from about twelve hours to twenty-four.',
        iconName: 'Anchor',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It activates the beta-2 receptor on airway muscle',
        laymanDesc:
          'The active end fits into the same receptor adrenaline uses and switches it on. The label says its selectivity in the test tube looks like salmeterol’s, and that nobody knows what that means in a patient.',
        molecularDetail:
          'Agonism at ADRB2. The label states only that in vitro functional selectivity was similar to that of salmeterol, with clinical relevance unknown, and notes that beta-2 receptors comprise 10% to 50% of total beta-adrenoceptors in the human heart.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Cyclic AMP rises and the muscle lets go',
        laymanDesc:
          'The switched-on receptor makes the cell produce a signalling chemical, and the more of it there is the more the muscle relaxes.',
        molecularDetail:
          'The receptor couples to Gs, activating adenylyl cyclase and converting ATP to cyclic AMP. The label attributes the pharmacologic effect at least in part to that step, together with inhibition of mediator release from mast cells.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The airway stays open for twenty-four hours',
        laymanDesc:
          'One dose covers a full day, which is the entire design goal. In practice that means one inhaler, once, in the morning — and one fewer dose to forget.',
        molecularDetail:
          'Twenty-four-hour bronchodilation supports once-daily dosing across all three combination products. In head-to-head 24-week trials, adding umeclidinium to vilanterol raised trough FEV1 by about 90 mL over vilanterol alone.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'On its own it moved no long-term outcome',
        laymanDesc:
          'In the one large trial where thousands of people took vilanterol by itself for about two years, deaths, heart events and the rate of lung-function loss were all the same as on placebo.',
        molecularDetail:
          'In SUMMIT, vilanterol monotherapy in 4,118 patients gave a mortality hazard ratio of 0.96 (95% CI 0.81 to 1.14, p=0.655), a cardiovascular composite hazard ratio of 0.99 (0.80 to 1.22) and a change in the rate of FEV1 decline of -2 mL per year (95% CI -8 to 5). Exacerbation rates fell with all active treatments including vilanterol.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'SUMMIT (NCT01313676)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, four-arm event-driven trial',
        sampleSize: 16590,
        primaryEndpoint: 'All-cause mortality in moderate COPD with heightened cardiovascular risk',
        endpointMet: false,
        statisticalPValue:
          'Combination hazard ratio 0.88 (95% CI 0.74 to 1.04), p=0.137; vilanterol alone 0.96 (0.81 to 1.14), p=0.655; fluticasone furoate alone 0.91 (0.77 to 1.08), p=0.284',
        unreportedAdverseSignals:
          'The published findings state that because the primary outcome was not met, secondary outcomes should be interpreted with caution. The 8 mL per year reduction in FEV1 decline widely quoted from this trial is one of those secondary outcomes, and vilanterol alone did not produce it (-2 mL per year, 95% CI -8 to 5).',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Dransfield replicate trials (NCT01009463 and NCT01017952)',
        phase: 'Phase 3, two replicate double-blind, parallel-group, randomised trials, one year',
        sampleSize: 3255,
        primaryEndpoint:
          'Yearly rate of moderate and severe COPD exacerbations, fluticasone furoate/vilanterol against vilanterol alone',
        endpointMet: false,
        statisticalPValue:
          'Study 1: 200/25 against vilanterol alone 0.90 against 1.05 events per year, ratio 0.9 (95% CI 0.7 to 1.0) — not significant, and the statistical hierarchy blocked inference for the lower doses. Study 2: all three doses significant (p=0.0398, 0.0244, 0.0004). Pooled: all three significant.',
        unreportedAdverseSignals:
          'Pneumonia and fractures were more frequent with fluticasone furoate and vilanterol than with vilanterol alone, and there were eight deaths from pneumonia in the combination groups against none in the vilanterol-only group.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Decramer replicate trials (NCT01316900 and NCT01316913)',
        phase:
          'Phase 3, two multicentre, blinded, double-dummy, active-controlled trials, 24 weeks',
        sampleSize: 2332,
        primaryEndpoint: 'Trough FEV1 on day 169',
        endpointMet: true,
        statisticalPValue:
          'Umeclidinium plus vilanterol above vilanterol alone by 0.088 L (95% CI 0.036 to 0.140, p=0.0010) and 0.090 L (0.039 to 0.142, p=0.0006); above tiotropium by 0.060 to 0.090 L; not above umeclidinium 125 micrograms alone (0.037 L, -0.012 to 0.087, p=0.14 and 0.022 L, -0.027 to 0.072, p=0.38)',
        unreportedAdverseSignals:
          'No significant differences in symptoms, health status or exacerbation risk between the combination and tiotropium monotherapy. The lung-function advantage did not translate into a difference on any of those endpoints over 24 weeks.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Salford Lung Study COPD (NCT01551758)',
        phase:
          'Phase 3, randomised, open-label, usual-care-controlled effectiveness trial, one year',
        sampleSize: 2799,
        primaryEndpoint:
          'Rate of moderate or severe exacerbations among patients with an exacerbation in the year before the trial',
        endpointMet: true,
        statisticalPValue:
          '8.4% lower with fluticasone furoate-vilanterol (95% CI 1.1 to 15.2), P=0.02',
        unreportedAdverseSignals:
          'No significant difference in COPD-related primary or secondary care contacts, and no significant difference in time to first moderate or severe exacerbation or first severe exacerbation. The single positive result is the annualised rate.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'IMPACT (NCT02164513)',
        phase: 'Phase 3, randomised, double-blind, three-arm, 52 weeks',
        sampleSize: 10355,
        primaryEndpoint: 'Annual rate of moderate or severe COPD exacerbations',
        endpointMet: true,
        statisticalPValue:
          'Triple 0.91/year against fluticasone furoate-vilanterol 1.07 (rate ratio 0.85, 95% CI 0.80 to 0.90, P<0.001) and against umeclidinium-vilanterol 1.21 (rate ratio 0.75, 95% CI 0.70 to 0.81, P<0.001)',
        unreportedAdverseSignals:
          'Clinician-diagnosed pneumonia was more likely on triple therapy than on umeclidinium-vilanterol, hazard ratio 1.53 (95% CI 1.22 to 1.92, P<0.001). Vilanterol is present in all three arms, so this trial says nothing about the vilanterol component.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'All-cause mortality hazard ratio 0.96 (95% CI 0.81 to 1.14) for vilanterol alone against placebo in 16,590 randomised patients',
        'Change in rate of FEV1 decline of -2 mL per year (95% CI -8 to 5) for vilanterol alone, against 8 mL per year for fluticasone furoate',
        'Trough FEV1 0.088 to 0.090 L higher on umeclidinium plus vilanterol than on vilanterol alone at 24 weeks',
        'No significant trough FEV1 gain from adding vilanterol to umeclidinium 125 micrograms (0.037 L, 95% CI -0.012 to 0.087)',
        'An 8.4% lower exacerbation rate against usual care in 2,799 patients in ordinary general practice (95% CI 1.1 to 15.2)',
      ],
      unsupportedInferences: [
        'That the benefits of Breo, Anoro and Trelegy can be apportioned to the vilanterol component, which only SUMMIT tested directly',
        'That fluticasone furoate with vilanterol slows lung-function decline — a secondary outcome the trial’s own authors flagged after the primary endpoint failed',
        'That vilanterol is more beta-2 selective than older agents, a claim the label declines to quantify and calls of unknown clinical relevance',
        'That the pneumonia and fracture excess in the combination trials belongs to vilanterol, when it tracks the inhaled corticosteroid arm',
      ],
      whatFailedInitially: [
        'SUMMIT missed its primary mortality endpoint at p=0.137 in 16,590 patients',
        'Vilanterol monotherapy changed neither mortality, nor cardiovascular events, nor the rate of FEV1 decline in that trial',
        'One of the two replicate exacerbation trials failed to show a difference against vilanterol alone even at the highest steroid dose',
        'Adding vilanterol to umeclidinium 125 micrograms gave no significant lung-function gain in the head-to-head trial designed to test it',
      ],
      realWorldOutcome: [
        'Approved in 2013 and now the beta-agonist in three widely used once-daily inhalers, none of which contains it alone',
        'The first once-daily long-acting beta-agonist to reach the market in a combination product',
        'Extended into asthma down to age 5 as part of fluticasone furoate-vilanterol, never as a single agent',
        'All 14 listed presentations in the CMS survey remain brand-priced, and none of them is vilanterol by itself',
      ],
    },
    deliverySystem: {
      type: 'Inhalation powder, 25 micrograms per blister, in the Ellipta dry-powder inhaler, always co-formulated',
      description:
        'One inhalation once daily. The Ellipta device holds one or two blister strips inhaled together, which is how a three-drug regimen fits into one actuation. Vilanterol has never been supplied in any other device or as a single-ingredient product, so its device and its evidence are the same object.',
      safetyProfile:
        'Long-acting beta-agonist monotherapy increases the risk of serious asthma-related events, which is why no single-ingredient vilanterol product exists. Not to be initiated in acutely deteriorating COPD or asthma and not for acute symptoms. Not to be combined with any other long-acting beta-agonist because of overdose risk. Paradoxical bronchospasm requires discontinuation, and caution applies in cardiovascular disorders because of beta-adrenergic stimulation. The corticosteroid-containing products add oropharyngeal candidiasis, increased pneumonia risk in COPD, worsening of existing infections, adrenal suppression on transfer from systemic steroids, and reduced bone mineral density.',
    },
    commonQuestions: [
      {
        q: 'Can I get vilanterol on its own?',
        a: 'No, and that is deliberate rather than commercial. Long-acting beta-agonist monotherapy in asthma increases the risk of serious asthma-related events, and no single-ingredient vilanterol product has ever been marketed anywhere. It exists in three inhalers: with fluticasone furoate as Breo, with umeclidinium as Anoro, and with both as Trelegy. One practical consequence is that almost every published result about vilanterol is a result about a product containing it, and this page keeps that distinction visible rather than attributing combination results to the component.',
      },
      {
        q: 'What did vilanterol do when it was given by itself?',
        a: 'Very little, in the one place it was tested at scale. SUMMIT gave vilanterol alone to 4,118 people with moderate COPD and raised cardiovascular risk, in an event-driven trial that ran from January 2011 to March 2014. All-cause mortality was unchanged, hazard ratio 0.96 with a confidence interval of 0.81 to 1.14. Cardiovascular events were unchanged. The rate at which lung function declined was unchanged, at -2 mL per year with a confidence interval from -8 to 5, while the steroid arm of the same trial showed 8 mL per year. Exacerbation rates did fall with all active treatments including vilanterol. It is a bronchodilator, and the trial found exactly what a bronchodilator does.',
        auditNote:
          'A negative monotherapy arm is not an argument against the combination products. It is an argument against reading the combination products’ results as though they were the beta-agonist’s.',
      },
      {
        q: 'Is once a day better than twice a day?',
        a: 'For adherence, plausibly. For measured outcomes, no trial has shown it. Vilanterol’s twenty-four-hour duration is the reason its products are once-daily, and the dose most often missed in any twice-daily regimen is the evening one. What does not exist is a randomised comparison of a once-daily against a twice-daily inhaler powered on exacerbations, so the adherence argument remains an argument rather than a result.',
      },
      {
        q: 'Why does the molecular weight look so large for an inhaled drug?',
        a: 'Because the figure includes a counter-ion. Vilanterol is supplied as vilanterol trifenatate, a salt with triphenylacetic acid, chosen because it crystallises well and handles well as a micronised powder. The salt has a formula of C44H49Cl2NO7 and a mass of 774.8 g/mol; the active cation is roughly half of that. The stated dose of 25 micrograms refers to the vilanterol base, not to the salt.',
      },
      {
        q: 'Should the steroid worry me?',
        a: 'It is worth knowing about rather than worrying about, and the size of the risk depends on how severe the disease is. In the two replicate one-year trials, pneumonia and fractures were more frequent on fluticasone furoate with vilanterol than on vilanterol alone, and eight people died of pneumonia in the combination arms against none in the vilanterol-only arm. In the larger IMPACT trial, clinician-diagnosed pneumonia was 53% more likely on the steroid-containing triple regimen. In SUMMIT, run in a milder population, pneumonia was 6% on combination against 5% on placebo. Against that sits a clear reduction in exacerbations. Which way the trade falls is a judgement about a particular patient, not a fact about the drug.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Vestbo J, Anderson JA, Brook RD, et al. Fluticasone furoate and vilanterol and survival in COPD with heightened cardiovascular risk (SUMMIT). Lancet 2016;387:1817-1826',
        identifier: '10.1016/S0140-6736(16)30069-1',
        kind: 'doi',
      },
      {
        label:
          'Dransfield MT, Bourbeau J, Jones PW, et al. Once-daily inhaled fluticasone furoate and vilanterol versus vilanterol only for prevention of exacerbations of COPD. Lancet Respir Med 2013;1:210-223',
        identifier: '10.1016/S2213-2600(13)70040-7',
        kind: 'doi',
      },
      {
        label:
          'Decramer M, Anzueto A, Kerwin E, et al. Efficacy and safety of umeclidinium plus vilanterol versus tiotropium, vilanterol, or umeclidinium monotherapies over 24 weeks. Lancet Respir Med 2014;2:472-486',
        identifier: '10.1016/S2213-2600(14)70065-7',
        kind: 'doi',
      },
      {
        label:
          'Vestbo J, Leather D, Diar Bakerly N, et al. Effectiveness of Fluticasone Furoate-Vilanterol for COPD in Clinical Practice. N Engl J Med 2016;375:1253-1260',
        identifier: '10.1056/NEJMoa1608033',
        kind: 'doi',
      },
      {
        label:
          'Lipson DA, Barnhart F, Brealey N, et al. Once-Daily Single-Inhaler Triple versus Dual Therapy in Patients with COPD. N Engl J Med 2018;378:1671-1680',
        identifier: '10.1056/NEJMoa1713901',
        kind: 'doi',
      },
      {
        label: 'SUMMIT — fluticasone furoate and vilanterol and survival in COPD',
        identifier: 'NCT01313676',
        kind: 'nct',
      },
      {
        label: 'Salford Lung Study COPD — effectiveness against usual care in general practice',
        identifier: 'NCT01551758',
        kind: 'nct',
      },
      {
        label:
          'Umeclidinium/vilanterol against vilanterol and against tiotropium, 24 weeks (Decramer study 1)',
        identifier: 'NCT01316900',
        kind: 'nct',
      },
      {
        label:
          'Umeclidinium/vilanterol against umeclidinium and against tiotropium, 24 weeks (Decramer study 2)',
        identifier: 'NCT01316913',
        kind: 'nct',
      },
      {
        label: 'IMPACT — single-inhaler triple against dual therapy in 10,355 patients',
        identifier: 'NCT02164513',
        kind: 'nct',
      },
      {
        label:
          'BREO ELLIPTA (fluticasone furoate and vilanterol inhalation powder) United States prescribing information — Indications, Warnings and Precautions 5.1 to 5.12, Clinical Pharmacology 12.1',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22BREO+ELLIPTA%22',
        kind: 'regulatory',
      },
      {
        label:
          'PubChem CID 44482554 — vilanterol trifenatate structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/44482554',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 7. Ipratropium — the drug the whole antimuscarinic class descends from, whose best evidence is
  //    for a use its label does not carry, and whose five-year trial showed it changes nothing.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'ipratropium',
    name: 'Ipratropium',
    tradeName: 'Atrovent / Atrovent HFA / Ipratropium Bromide Inhalation Solution',
    sponsor: 'Boehringer Ingelheim (originator); now made by many manufacturers',
    targetGene: 'CHRM3',
    targetProtein:
      'Muscarinic acetylcholine receptors M1, M2 and M3 on airway smooth muscle and submucosal glands',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1986,
    indication:
      'Maintenance treatment of bronchospasm associated with chronic obstructive pulmonary disease, including chronic bronchitis and emphysema (inhalation aerosol and nebuliser solution). Nasal solution 0.06% is indicated for symptomatic relief of rhinorrhoea associated with the common cold or seasonal allergic rhinitis in adults and children aged 5 and over, and does not relieve nasal congestion or sneezing. Not indicated for initial treatment of acute episodes of bronchospasm requiring rapid response.',
    patientFriendlyIndication:
      'A short-acting inhaler or nebuliser that blocks the nerve signal tightening the airway, and a nasal spray for a running nose',
    anatomicalSite:
      'Muscarinic receptors on bronchial smooth muscle and submucosal glands; nasal mucosal glands for the nasal spray',
    conditionContext: {
      conditionExplainer:
        'The vagus nerve keeps the airway muscle under constant mild tension and drives the glands that make mucus. Ipratropium blocks the receptor that nerve signal arrives at. In the nose, the same nerve drives the watery secretion that runs during a cold, and the same block dries it.',
      whyItMatters:
        'This is the original molecule of a class that now includes tiotropium, umeclidinium and several others, and it is the one against which they were all measured. It is also the cheapest drug in this entire file by an order of magnitude, at about eleven cents a millilitre.',
      whoTakesThis:
        'People with chronic obstructive pulmonary disease, as maintenance treatment or nebulised in hospital; children and adults in the emergency department during an asthma attack, mixed with salbutamol; and people with a persistently running nose from a cold or hay fever.',
      clinicalGoals:
        'Immediate relief of airflow obstruction and of a running nose. Not a change in the course of any disease: a five-year trial in 5,887 people settled that.',
    },
    oneSentenceVerdict:
      'A quaternary derivative of atropine that blocks muscarinic receptors on airway muscle and falls off them within about fifteen minutes, so it is dosed four times a day; over five years in 5,887 smokers it produced a small non-cumulative gain in lung function that vanished the moment it was stopped, and its strongest evidence is somewhere else entirely — added to salbutamol during a child’s asthma attack it cut hospital admission from 23 in 100 to 17 in 100 across 15 trials in 2,497 children.',
    laymanHowItWorks:
      'A nerve running to the lungs constantly signals the muscle around each airway to stay slightly tightened, and signals the glands to produce mucus. Ipratropium sits on the receptor that signal lands on and blocks it, so the muscle relaxes and secretion falls. It carries a fixed electrical charge, which keeps it in the airway and out of the rest of the body — the reason it does not cause the confusion and dry eyes that atropine does. It lets go of the receptor within about a quarter of an hour, which is why it has to be taken four times a day.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 79,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1089 per millilitre of inhalation solution, the median across 60 listed products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Ipratropium is the one genuinely commoditised drug in this file: 60 listed presentations, all generic, at about eleven cents a millilitre. It is what an inhaled medicine costs when neither the molecule nor the device is protected — the nebuliser solution needs no proprietary inhaler at all, only a compressor and a mask. Every other page in this group shows the opposite arrangement, and the price difference between this entry and the branded once-daily antimuscarinics is roughly a hundredfold per dose.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Ipratropium is the cheap short-acting member of a class whose long-acting members beat it on maintenance endpoints and cost about a hundred times more per dose. In the emergency department it has no substitute in its own role: it is added to a beta-agonist, not instead of one, and the trials that support that are among the cleanest in respiratory medicine.',
      conventionalRx: [
        {
          name: 'Tiotropium (Spiriva)',
          class: 'Long-acting muscarinic antagonist',
          howItCompares:
            'The same target with a thirty-five-hour receptor residence instead of fifteen minutes. In two identical one-year trials in 535 people, trough FEV1 rose 0.12 L on tiotropium and fell 0.03 L on ipratropium (p<0.001), with 24% fewer exacerbations on tiotropium (p<0.01).',
          typicalCost:
            'US$11.73 per unit at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: once daily, better trough lung function, fewer exacerbations, a four-year outcome trial. Cons: roughly a hundred times the acquisition cost per dose, and still brand-only.',
        },
        {
          name: 'Albuterol / salbutamol',
          class: 'Short-acting beta-2 agonist',
          howItCompares:
            'A different mechanism with a faster onset, and the drug ipratropium is added to rather than compared with in acute asthma. The combination cut hospital admission in children by 27% relative in the pooled trials; the beta-agonist alone did not.',
          typicalCost:
            'Generic and inexpensive; the CMS acquisition survey lists many presentations of both the solution and the metered-dose inhaler',
          prosAndCons:
            'Pros: faster and stronger bronchodilation, the first-line reliever everywhere. Cons: tremor, palpitations and hypokalaemia — all of which were less frequent when ipratropium was added, because less beta-agonist was needed.',
        },
        {
          name: 'Ipratropium with albuterol (Combivent Respimat, DuoNeb)',
          class:
            'Fixed combination of a short-acting antimuscarinic and a short-acting beta-2 agonist',
          howItCompares:
            'The same two molecules in one actuation, which removes the mixing step in a nebuliser and the two-inhaler problem at home. It is the same pharmacology, packaged.',
          typicalCost:
            'Listed separately in the CMS acquisition survey; the combination products are priced well above the generic single-agent solution',
          prosAndCons:
            'Pros: one device, one dose, no mixing errors. Cons: fixed ratio, so neither component can be adjusted without abandoning the product.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Keep the nebuliser mist out of your eyes',
          action:
            'Use a well-fitting mouthpiece rather than a loose mask where possible, and keep eyes closed if a mask is used.',
          patientImpact:
            'The label warns of ocular effects and asks patients to consult a physician immediately if signs of narrow-angle glaucoma develop — eye pain or discomfort, blurred vision, visual haloes or coloured images with red eyes.',
          clinicalPrecaution:
            'Nebulised drug escaping around a mask reaches the eye directly. This is a delivery problem, not a systemic one, and it is preventable by how the device is held.',
        },
        {
          name: 'Say if you have prostate trouble or glaucoma',
          action:
            'Mention narrow-angle glaucoma, prostatic hyperplasia or bladder-neck obstruction before starting, and report new difficulty passing urine.',
          patientImpact:
            'The label asks for caution in exactly these conditions and instructs immediate contact if symptoms of urinary retention appear.',
          clinicalPrecaution:
            'These are the mechanism acting at muscarinic receptors outside the lung. Ipratropium’s permanent charge limits this, but does not abolish it.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(C)[N+]1([C@@H]2CC[C@H]1CC(C2)OC(=O)C(CO)C3=CC=CC=C3)C',
      chemicalFormula: 'C20H30NO3',
      molecularWeight: '332.50 g/mol',
      targetReceptorAffinity:
        'Binding to human muscarinic receptors is in the sub-nanomolar to nanomolar range with little subtype preference; what distinguishes ipratropium from its successors is how quickly it leaves. Published dissociation half-lives from human receptors are 0.26 hours at M3, 0.11 hours at M1 and 0.035 hours at M2, against 34.7, 14.6 and 3.6 hours for tiotropium measured in the same experiments. The label describes the action as inhibiting vagally-mediated reflexes by antagonising acetylcholine, and attributes it, based on animal studies, to preventing the rise in intracellular calcium that acetylcholine causes at muscarinic receptors on bronchial smooth muscle.',
      structureSource: {
        label: 'PubChem CID 657309 (ipratropium) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/657309',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ipr-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity of the tropane ester and its stereochemistry',
          description:
            'Confirm the tropane bicyclic core, the tropic acid ester and the configuration at both bridgehead positions. Ipratropium is N-isopropyl noratropine quaternised at the nitrogen; the difference from atropine is that single alkylation, and it is the whole reason the drug can be inhaled safely.',
          reagentsAndBuffer:
            'Ipratropium bromide reference standard, reversed-phase HPLC with ultraviolet detection, 1H and 13C NMR in D2O, ion chromatography for bromide, Karl Fischer titration',
        },
        {
          id: 'ipr-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'N-dealkylation of atropine and quaternisation with isopropyl bromide',
          description:
            'Remove the N-methyl group from atropine to give noratropine, alkylate with isopropyl bromide, then quaternise with methyl bromide. The quaternary nitrogen is the design decision: it converts a centrally active belladonna alkaloid into a drug that stays in the airway and does not cause the confusion, dry mouth and pupillary dilation atropine does.',
          dependsOnStepId: 'ipr-w1',
          reagentsAndBuffer:
            'Atropine free base, chloroformate or von Braun demethylation reagents, isopropyl bromide, methyl bromide in acetonitrile, potassium carbonate, nitrogen atmosphere',
        },
        {
          id: 'ipr-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation of the monohydrate and preparation of the nebuliser solution',
          description:
            'Crystallise the bromide monohydrate and formulate as a sterile, preservative-free, isotonic unit-dose solution. Preservative-free matters clinically rather than cosmetically: benzalkonium chloride in older multi-dose nebuliser solutions can itself provoke bronchoconstriction, which is one route to the paradoxical bronchospasm the label warns about.',
          dependsOnStepId: 'ipr-w2',
          reagentsAndBuffer:
            'Water for injection, sodium chloride for tonicity, hydrochloric acid for pH adjustment, 0.2 micron sterile filtration, blow-fill-seal unit-dose vials, sterility and endotoxin testing',
        },
        {
          id: 'ipr-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Radioligand occupancy and washout on human muscarinic receptor membranes',
          description:
            'Load membranes expressing human M1, M2 and M3 with labelled compound, dilute heavily and follow the fall in bound tracer over minutes. For ipratropium the whole measurement is over inside an hour, and running it alongside a slow-dissociating comparator is what makes the result interpretable rather than merely fast.',
          dependsOnStepId: 'ipr-w3',
          reagentsAndBuffer:
            'CHO membranes expressing human CHRM1, CHRM2 and CHRM3, tritiated N-methylscopolamine tracer, HEPES-buffered assay medium, atropine for non-specific binding, tiotropium as slow-dissociating reference, rapid glass-fibre filtration',
        },
        {
          id: 'ipr-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Dissociation half-life and duration of bronchoprotection',
          description:
            'Fit the washout curve per subtype and pair it with a functional protection assay against acetylcholine challenge. The point of the pairing is that the receptor number predicts the dosing interval: a fifteen-minute off-rate at M3 is what four-times-daily dosing looks like at the molecular level.',
          dependsOnStepId: 'ipr-w4',
          reagentsAndBuffer:
            'Scintillation counting of filter-bound tracer, guinea pig tracheal ring organ bath with acetylcholine challenge, non-linear regression to one-phase exponential decay, tiotropium run in parallel',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ipr-a1',
        category: 'failed',
        title: 'The Lung Health Study: five years, 5,887 smokers, and the benefit evaporated',
        laymanSummary:
          'The largest trial ipratropium has ever been in gave it three times a day for five years to smokers with early lung disease. It produced a small improvement in lung function that never accumulated, and disappeared as soon as the drug was stopped. What did slow the decline was quitting smoking.',
        technicalDetails:
          'The Lung Health Study randomised 5,887 smokers aged 35 to 60 with spirometric signs of early chronic obstructive pulmonary disease, with equal probability, to smoking intervention plus ipratropium two puffs three times daily, smoking intervention plus placebo, or no intervention. The main outcome measures were rate of change and cumulative change in FEV1 over five years. Both smoking-intervention groups declined significantly more slowly than the control group, with most of the difference occurring in the first year and attributable to cessation, and the largest benefit in those who stayed abstinent. The authors record that the small non-cumulative benefit associated with the active bronchodilator vanished after it was discontinued at the end of the study, and that use of the bronchodilator did not influence the long-term decline of FEV1.',
        evidenceSource:
          'Anthonisen NR, Connett JE, Kiley JP, et al. JAMA 1994;272:1497-1505 (The Lung Health Study)',
        measuredMetric:
          'Rate of change and cumulative change in FEV1 over five years, ipratropium against placebo on a background of smoking intervention',
        auditFlag: 'verified',
      },
      {
        id: 'ipr-a2',
        category: 'measured',
        title: 'In a child’s asthma attack it takes admissions from 23 in 100 to 17 in 100',
        laymanSummary:
          'This is the strongest evidence ipratropium has, and it is for something its label does not mention. Adding it to a salbutamol nebuliser during a child’s asthma attack reduces the chance of being admitted to hospital by about a quarter.',
        technicalDetails:
          'A Cochrane review of 20 trials generating 24 comparisons in 2,697 randomised children aged one to 18 with predominantly moderate or severe exacerbations found that adding an inhaled anticholinergic to a short-acting beta-2 agonist reduced the risk of hospital admission, risk ratio 0.73 (95% CI 0.63 to 0.85; 15 studies, 2,497 children, graded high-quality evidence). Twenty-three of 100 children given beta-agonist alone were admitted, against 17 (95% CI 15 to 20) of 100 given the combination — a number needed to treat of 16 (95% CI 12 to 29). Lung function, clinical score at 120 minutes, oxygen saturation at 60 minutes and the need for repeat bronchodilators before discharge all favoured the combination. Relapse rates did not differ. Nausea and tremor were reported less often on the combination than on beta-agonist alone.',
        evidenceSource:
          'Griffiths B, Ducharme FM. Combined inhaled anticholinergics and short-acting beta2-agonists for initial treatment of acute asthma in children. Cochrane Database Syst Rev 2013;(8):CD000060',
        doi: '10.1002/14651858.CD000060',
        measuredMetric:
          'Risk of hospital admission after emergency-department treatment of an acute asthma exacerbation in children',
        auditFlag: 'verified',
      },
      {
        id: 'ipr-a3',
        category: 'inferred',
        title: 'Its best evidence and its label indication are for different diseases',
        laymanSummary:
          'The United States inhaler label says maintenance treatment of chronic obstructive pulmonary disease, and adds that the drug is not for the initial treatment of an acute attack. The high-quality evidence is for the initial treatment of an acute asthma attack in children.',
        technicalDetails:
          'The ATROVENT HFA prescribing information indicates the product as a bronchodilator for maintenance treatment of bronchospasm associated with COPD, and Warnings and Precautions 5.1 states it is not indicated for the initial treatment of acute episodes of bronchospasm where rescue therapy is required for rapid response. Asthma does not appear in the indication. Meanwhile the Cochrane review graded as high-quality evidence covers exactly that setting — nebulised ipratropium, typically three doses of 250 micrograms or two of 500 micrograms over 30 to 90 minutes, added to a beta-agonist during a paediatric asthma exacerbation. Emergency guidelines worldwide recommend it there. This is a legitimate off-label practice supported by better evidence than most on-label ones, and the mismatch is a fact about how labels are written, not a criticism of the practice.',
        evidenceSource:
          'ATROVENT HFA United States prescribing information, Indications and Warnings and Precautions 5.1; Griffiths B, Ducharme FM. Cochrane Database Syst Rev 2013;(8):CD000060',
        doi: '10.1002/14651858.CD000060',
        inferredClaim:
          'That the label indication describes where the drug is best supported — here it describes a different disease from the one the strongest randomised evidence covers',
        auditFlag: 'caution',
      },
      {
        id: 'ipr-a4',
        category: 'measured',
        title: 'The nasal spray dries a running nose and does nothing for a blocked one',
        laymanSummary:
          'Seven trials in 2,144 people found the nasal spray consistently reduced a running nose during a cold. It had no effect at all on congestion, which is the symptom most people actually want treated, and it doubled the rate of side effects.',
        technicalDetails:
          'A Cochrane review of seven randomised trials with 2,144 participants found that four studies in 1,959 participants addressing subjective change in severity of rhinorrhoea all reported statistically significant changes favouring intranasal ipratropium. Four studies reported nasal congestion and found no significant difference. Two studies found a positive response for global assessment of overall improvement. Side effects were more frequent with ipratropium, odds ratio 2.09 (95% CI 1.40 to 3.11), commonly nasal dryness, blood-tinged mucus and epistaxis. Overall risk of bias across the included studies was judged moderate. The United States nasal label states the same limitation in its own words: the spray does not relieve nasal congestion or sneezing.',
        evidenceSource:
          'AlBalawi ZH, Othman SS, AlFaleh K. Intranasal ipratropium bromide for the common cold. Cochrane Database Syst Rev 2013;(6):CD008231',
        doi: '10.1002/14651858.CD008231.pub2',
        measuredMetric:
          'Subjective severity of rhinorrhoea and of nasal congestion, and side-effect rate, against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'ipr-a5',
        category: 'failed',
        title: 'Beaten head to head by its own successor',
        laymanSummary:
          'Two identical year-long trials compared ipratropium four times a day with tiotropium once a day. Lung function rose on tiotropium and fell on ipratropium, and flare-ups were about a quarter less frequent on the newer drug.',
        technicalDetails:
          'Two identical one-year randomised, double-blind, double-dummy trials compared tiotropium 18 micrograms once daily (n=356) with ipratropium 40 micrograms four times daily (n=179) in patients with screening FEV1 around 40% predicted. Trough FEV1 at one year improved by 0.12±0.01 L on tiotropium and declined by 0.03±0.02 L on ipratropium (P<0.001). Peak expiratory flow, rescue salbutamol use, Transition Dyspnea Index focal score and St George’s Respiratory Questionnaire total and impact scores all favoured tiotropium (P<0.01). Exacerbations fell by 24% (P<0.01), with longer time to first exacerbation (P<0.01) and to first hospitalisation for exacerbation (P<0.05). The mechanistic reason is in the receptor kinetics: 0.26 hours at M3 against 34.7.',
        evidenceSource:
          'Vincken W, van Noord JA, Greefhorst APM, et al. Eur Respir J 2002;19:209-216; Disse B et al., Life Sci 1993;52:537-544',
        doi: '10.1183/09031936.02.00238702',
        measuredMetric:
          'Trough FEV1 and exacerbation rate at one year, ipratropium four times daily against tiotropium once daily',
        auditFlag: 'verified',
      },
      {
        id: 'ipr-a6',
        category: 'conclusion_shift',
        title: 'It was inside the 2008 cardiovascular meta-analysis that the class outgrew',
        laymanSummary:
          'A pooled analysis in 2008 reported that inhaled anticholinergics — ipratropium and tiotropium together — raised the risk of heart attack, cardiovascular death or stroke by about sixty per cent. The two very large trials that followed, both of tiotropium, did not find it.',
        technicalDetails:
          'Singh and colleagues pooled 17 randomised trials of inhaled anticholinergics enrolling 13,645 patients with COPD. The composite of cardiovascular death, myocardial infarction or stroke occurred in 134 of 6,984 (1.9%) against 83 of 6,661 (1.2%) on control, relative risk 1.60 (95% CI 1.22 to 2.10, P<0.001, I2=0%), with all-cause mortality relative risk 1.29 (1.00 to 1.65, P=0.05). UPLIFT (5,993 patients, four years) and TIOSPIR (17,135 patients, mean 2.3 years) both reported similar cardiovascular event rates between arms. Those two trials studied tiotropium, not ipratropium, so strictly the meta-analytic signal for ipratropium itself has never been directly refuted — it has been overtaken. The class inference that raised the alarm and the class inference that settled it have the same weakness in opposite directions.',
        evidenceSource:
          'Singh S, Loke YK, Furberg CD. JAMA 2008;300:1439-1450; Tashkin DP et al., N Engl J Med 2008;359:1543-1554; Wise RA et al., N Engl J Med 2013;369:1491-1501',
        doi: '10.1001/jama.300.12.1439',
        inferredClaim:
          'That the large tiotropium trials cleared ipratropium too — a class-level conclusion resting on trials of a different molecule, which is the same reasoning that produced the original alarm',
        auditFlag: 'contested',
      },
      {
        id: 'ipr-a7',
        category: 'measured',
        title: 'A hundredfold price gap for the same receptor',
        laymanSummary:
          'The CMS acquisition survey lists sixty generic ipratropium products at about eleven cents a millilitre. The once-daily antimuscarinics that replaced it are listed at ten to twelve dollars per dose, and are brand-only.',
        technicalDetails:
          'The CMS National Average Drug Acquisition Cost file effective 19 August 2026 lists ipratropium inhalation solution at a median US$0.1089 per millilitre across 60 generic presentations, tiotropium at US$11.73 per unit across 7 brand presentations and umeclidinium at US$10.28 per unit across 3. NADAC is what a United States pharmacy pays to acquire the product, not what a patient is charged and not a cost of manufacture. The gap is not explained by the molecules, which are close chemical relatives acting on the same receptor family; it is explained by patent status and by the fact that a nebuliser solution requires no proprietary device while a dry-powder or soft-mist product does.',
        evidenceSource:
          'CMS National Average Drug Acquisition Cost (NADAC) 2026 file, prices effective 19 August 2026',
        measuredMetric:
          'Median pharmacy acquisition cost per listed unit, ipratropium against the branded long-acting antimuscarinics',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Given as a mist, a puff or a nasal spray',
        laymanDesc:
          'It exists in more forms than almost anything else here: a nebuliser solution driven by a compressor, a pressurised inhaler, and a nasal spray for a running nose.',
        molecularDetail:
          'Ipratropium bromide as a preservative-free 0.02% unit-dose nebuliser solution, a 17 microgram per actuation HFA inhalation aerosol, and 0.03% and 0.06% nasal solutions. The nebuliser route is why it dominates emergency and inpatient use: it needs no inspiratory effort and no coordination from a breathless patient.',
        iconName: 'Wind',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The quaternary nitrogen keeps it out of the brain',
        laymanDesc:
          'It is atropine with one extra chemical group that gives it a permanent electrical charge. That single change stops it crossing into the brain, which is the difference between a bronchodilator and a deliriant.',
        molecularDetail:
          'N-isopropyl noratropine quaternised at the tropane nitrogen. The fixed positive charge limits passive membrane permeation and blood-brain barrier penetration, so systemic absorption from the airway and from swallowed drug is minimal and central antimuscarinic effects do not occur at therapeutic doses.',
        iconName: 'Lock',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It blocks the acetylcholine receptor on airway muscle',
        laymanDesc:
          'The nerve releases acetylcholine, which normally lands on a receptor and makes the muscle squeeze and the glands secrete. Ipratropium occupies that receptor instead.',
        molecularDetail:
          'The label describes ipratropium as inhibiting vagally-mediated reflexes by antagonising acetylcholine at the neuromuscular junctions of the lung, and states that, based on animal studies, anticholinergics prevent the rise in intracellular calcium caused by acetylcholine interacting with muscarinic receptors on bronchial smooth muscle.',
        iconName: 'Ban',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'It falls off again within about fifteen minutes',
        laymanDesc:
          'It does not stay on the receptor. Within a quarter of an hour most of it has let go, which is why it is taken four times a day rather than once.',
        molecularDetail:
          'Published dissociation half-lives from human receptors: 0.26 hours at M3, 0.11 hours at M1 and 0.035 hours at M2, against 34.7, 14.6 and 3.6 hours respectively for tiotropium in the same experiments. Duration of bronchoprotection in dogs was correspondingly shorter than for an equipotent dose of tiotropium.',
        iconName: 'Timer',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The airway opens and secretions fall',
        laymanDesc:
          'Bronchodilation begins within minutes and lasts a few hours. In the nose the same block dries the watery running that a cold produces.',
        molecularDetail:
          'Onset is slower and peak effect weaker than a short-acting beta-2 agonist, which is why the two are combined rather than substituted. The nasal effect is on the seromucous glands, which is why the label says the spray relieves rhinorrhoea and explicitly not congestion or sneezing.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Nothing about the disease has changed',
        laymanDesc:
          'Five years of the drug in nearly six thousand smokers produced a small lung-function gain that never built up and vanished when the drug stopped. The thing that changed the trajectory in that trial was quitting smoking.',
        molecularDetail:
          'The Lung Health Study reports the bronchodilator benefit as small, non-cumulative and reversed on discontinuation, with no influence on the long-term rate of FEV1 decline. The smoking-cessation arms showed a significantly slower decline, concentrated in the first year and largest in sustained quitters.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'The Lung Health Study (Anthonisen 1994)',
        phase: 'Phase 4, randomised, three-arm, placebo-controlled, five years',
        sampleSize: 5887,
        primaryEndpoint: 'Rate of change and cumulative change in FEV1 over five years',
        endpointMet: false,
        statisticalPValue:
          'The bronchodilator benefit was small, non-cumulative and reversed after discontinuation; use of ipratropium did not influence the long-term decline in FEV1. The smoking-intervention groups declined significantly more slowly than control.',
        unreportedAdverseSignals:
          'The trial is remembered as proof that smoking cessation slows lung-function decline, which it is. It is equally a negative trial of ipratropium over five years, and that half is rarely cited.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Cochrane CD000060 — anticholinergic plus beta-agonist in acute paediatric asthma',
        phase: 'Systematic review and meta-analysis of 20 randomised trials',
        sampleSize: 2697,
        primaryEndpoint:
          'Risk of hospital admission after emergency treatment of an acute asthma exacerbation in children',
        endpointMet: true,
        statisticalPValue:
          'Risk ratio 0.73 (95% CI 0.63 to 0.85) across 15 studies and 2,497 children, graded high-quality evidence; number needed to treat 16 (95% CI 12 to 29)',
        unreportedAdverseSignals:
          'Relapse rates after discharge did not differ. Trends toward greater benefit with higher treatment intensity and greater asthma severity did not reach significance, so who benefits most within the group remains unresolved.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Cochrane CD008231 — intranasal ipratropium for the common cold',
        phase: 'Systematic review and meta-analysis of 7 randomised trials',
        sampleSize: 2144,
        primaryEndpoint: 'Severity of rhinorrhoea and of nasal congestion against placebo',
        endpointMet: true,
        statisticalPValue:
          'All four studies addressing rhinorrhoea (1,959 participants) favoured ipratropium; nasal congestion showed no significant difference in four studies; side effects odds ratio 2.09 (95% CI 1.40 to 3.11)',
        unreportedAdverseSignals:
          'Overall risk of bias across included studies was judged moderate, and the review calls for larger high-quality trials. Nasal dryness, blood-tinged mucus and epistaxis were the common side effects.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Vincken 2002 — ipratropium against tiotropium, two identical one-year trials',
        phase: 'Phase 3, randomised, double-blind, double-dummy, active comparator, one year',
        sampleSize: 535,
        primaryEndpoint: 'Trough FEV1 at one year',
        endpointMet: false,
        statisticalPValue:
          'Trough FEV1 -0.03±0.02 L on ipratropium against +0.12±0.01 L on tiotropium, P<0.001; 24% more exacerbations on ipratropium, P<0.01',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'No influence on the five-year rate of FEV1 decline in 5,887 smokers, with the small benefit reversed on discontinuation',
        'Hospital admission risk ratio 0.73 (95% CI 0.63 to 0.85) when added to a beta-agonist in acute paediatric asthma, across 2,497 children',
        'Consistent reduction in rhinorrhoea and no effect on nasal congestion across seven common-cold trials in 2,144 people',
        'Trough FEV1 falling 0.03 L over a year on ipratropium against rising 0.12 L on tiotropium',
        'Dissociation half-lives of 0.26 hours at M3 and 0.035 hours at M2, roughly a hundredth of tiotropium’s',
      ],
      unsupportedInferences: [
        'That an inhaled anticholinergic slows the progression of chronic obstructive pulmonary disease — a five-year randomised trial says it does not',
        'That the drug’s label indication marks where its evidence is strongest, when the strongest evidence is in a disease absent from the indication',
        'That the nasal spray treats a cold, when it treats one symptom of a cold and explicitly not congestion or sneezing',
        'That the large tiotropium safety trials settled the 2008 cardiovascular question for ipratropium, which they did not study',
      ],
      whatFailedInitially: [
        'Five years of treatment in 5,887 people produced no change in the rate of lung-function decline',
        'Trough lung function fell over a year on ipratropium while rising on the once-daily successor in the same trials',
        'The 2008 class meta-analysis put a cardiovascular signal on ipratropium that has been overtaken rather than directly refuted',
        'The nasal spray doubles the odds of a side effect and does nothing for the blocked nose most users want relieved',
      ],
      realWorldOutcome: [
        'Approved in 1986 and now fully generic across 60 listed presentations at about eleven cents a millilitre',
        'The standard addition to a beta-agonist in emergency-department asthma care worldwide, on evidence its label does not carry',
        'Displaced from maintenance COPD by the long-acting antimuscarinics it made possible',
        'The cheapest drug in this file by roughly a hundredfold, acting on the same receptor family as the most expensive ones',
      ],
    },
    deliverySystem: {
      type: 'HFA inhalation aerosol (17 micrograms per actuation), preservative-free unit-dose nebuliser solution 0.02%, and nasal spray 0.03% and 0.06%',
      description:
        'Four times daily for maintenance in COPD. The nebuliser solution is the form that matters in acute care: it needs no inspiratory effort, no breath-hold and no coordination, which is what makes it usable in a child mid-attack or an adult too breathless to use an inhaler. It is routinely mixed with salbutamol in the same nebuliser chamber, and fixed combinations of the two exist for that reason.',
      safetyProfile:
        'Not indicated for the initial treatment of acute episodes of bronchospasm where rescue therapy is required for rapid response. Hypersensitivity reactions including urticaria, angioedema, rash, bronchospasm, anaphylaxis and oropharyngeal oedema require immediate discontinuation. Paradoxical bronchospasm can occur. Ocular effects require caution in narrow-angle glaucoma, with patients instructed to seek advice immediately if eye pain, blurred vision or visual haloes develop — a risk raised by nebulised mist escaping around a loose face mask. Urinary retention may worsen in prostatic hyperplasia or bladder-neck obstruction. The most common adverse reactions above 5% in the 12-week placebo-controlled trials were bronchitis, COPD exacerbation, dyspnoea and headache.',
    },
    commonQuestions: [
      {
        q: 'Does ipratropium slow down COPD?',
        a: 'No. The Lung Health Study gave it three times a day for five years to 5,887 smokers with early disease and reported that the benefit was small, never accumulated, and disappeared once the drug was stopped — with no effect on the long-term rate of decline in lung function. The same trial found that quitting smoking did slow the decline, most of the effect appearing in the first year and the largest benefit going to those who stayed abstinent. That result has held for thirty years and is the single most important thing on this page.',
        auditNote:
          'This trial is almost always cited for its smoking result and almost never for its bronchodilator result. Both come from the same randomisation.',
      },
      {
        q: 'Why is it given in the emergency department for asthma if the label says COPD?',
        a: 'Because the evidence there is better than the evidence for most on-label uses. A Cochrane review of 20 trials in 2,697 children found that adding an inhaled anticholinergic to a nebulised beta-agonist cut the risk of hospital admission from 23 in 100 to 17 in 100, risk ratio 0.73 with a confidence interval of 0.63 to 0.85, graded high-quality. Lung function, clinical score, oxygen saturation and the need for repeat bronchodilators all improved, and nausea and tremor were less common because less beta-agonist was needed. The United States inhaler label covers maintenance treatment in COPD and states the product is not for the initial treatment of acute bronchospasm. Labels record what a manufacturer applied for; they are not a ranking of evidence.',
      },
      {
        q: 'Why four times a day when newer inhalers are once a day?',
        a: 'Because of how quickly it leaves the receptor. Ipratropium comes off the M3 receptor on airway muscle with a half-life of about fifteen minutes; tiotropium takes about thirty-five hours to do the same thing. That single number is the difference between the two drugs, and it is why a molecule from 1986 needs four doses to cover what one dose of a molecule from 2004 covers. In a direct one-year comparison, trough lung function fell slightly on ipratropium and rose on tiotropium.',
      },
      {
        q: 'Will the nasal spray fix my cold?',
        a: 'It will dry a running nose and do nothing else. Seven trials in 2,144 people found consistent improvement in rhinorrhoea and no significant effect on nasal congestion. The label says the same thing in one sentence: it does not relieve nasal congestion or sneezing. Side effects were about twice as common as on placebo, odds ratio 2.09, most often nasal dryness, blood-tinged mucus and nosebleeds. If the blocked nose is the problem, this is the wrong medicine.',
      },
      {
        q: 'Why is it so much cheaper than the others?',
        a: 'Because nothing about it is protected any more. The CMS acquisition survey lists 60 generic presentations at a median of about eleven cents a millilitre, against ten to twelve dollars a dose for the brand-only once-daily antimuscarinics. Part of that is patent expiry. Part of it is the delivery route: a nebuliser solution is a sterile liquid in a plastic ampoule, while a dry-powder or soft-mist product is a piece of engineered hardware carrying its own patents, and a generic of one of those has to reproduce the deposition profile as well as the chemistry.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Anthonisen NR, Connett JE, Kiley JP, et al. Effects of smoking intervention and the use of an inhaled anticholinergic bronchodilator on the rate of decline of FEV1: the Lung Health Study. JAMA 1994;272:1497-1505',
        identifier: '7966841',
        kind: 'pmid',
      },
      {
        label:
          'Griffiths B, Ducharme FM. Combined inhaled anticholinergics and short-acting beta2-agonists for initial treatment of acute asthma in children. Cochrane Database Syst Rev 2013;(8):CD000060',
        identifier: '10.1002/14651858.CD000060',
        kind: 'doi',
      },
      {
        label:
          'AlBalawi ZH, Othman SS, AlFaleh K. Intranasal ipratropium bromide for the common cold. Cochrane Database Syst Rev 2013;(6):CD008231',
        identifier: '10.1002/14651858.CD008231.pub2',
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
          'Disse B, Speck GA, Rominger KL, Witek TJ, Hammer R. Ba 679 BR, a novel long-acting anticholinergic bronchodilator. Life Sci 1993;52:537-544',
        identifier: '10.1016/0024-3205(93)90312-q',
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
          'ATROVENT HFA (ipratropium bromide HFA inhalation aerosol) United States prescribing information — Indications, Warnings and Precautions 5.1 to 5.5, Adverse Reactions 6.1, Clinical Pharmacology 12.1',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22ATROVENT+HFA%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 657309 — ipratropium structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/657309',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 8. Roflumilast — an oral anti-inflammatory whose two largest COPD trials both missed, and whose
  //    clearest results came a decade later from putting the same molecule on skin.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'roflumilast',
    name: 'Roflumilast',
    tradeName: 'Daliresp / Zoryve',
    sponsor:
      'AstraZeneca (Daliresp oral tablets; originated at Byk Gulden and developed through Nycomed and Takeda). The Zoryve topical formulations are from Arcutis Biotherapeutics.',
    targetGene: 'PDE4B',
    targetProtein:
      'Phosphodiesterase 4 — the major cyclic AMP-metabolising enzyme in lung tissue, inhibited by roflumilast and by its active N-oxide metabolite',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2011,
    indication:
      'Oral tablet: to reduce the risk of COPD exacerbations in patients with severe COPD associated with chronic bronchitis and a history of exacerbations. Not a bronchodilator and not for relief of acute bronchospasm; the 250 microgram strength is a four-week starting dose and not the therapeutic dose. Topical cream: plaque psoriasis including intertriginous areas from age 2 (0.3%), and mild to moderate atopic dermatitis from age 6 (0.15%) and ages 2 to 5 (0.05%).',
    patientFriendlyIndication:
      'A daily tablet that damps down inflammation in severe smokers’ lung disease, and — as a cream — a treatment for psoriasis and eczema',
    anatomicalSite:
      'Inflammatory cells of the airway wall — neutrophils, macrophages, T cells — and, for the cream, keratinocytes and immune cells in the skin',
    conditionContext: {
      conditionExplainer:
        'Chronic bronchitis is the version of chronic obstructive pulmonary disease dominated by inflamed, mucus-producing airways rather than by destroyed air sacs. The inflammation is driven largely by neutrophils, which inhaled steroids control poorly. Roflumilast attacks it from a different direction, by raising a signalling molecule inside inflammatory cells that switches them down.',
      whyItMatters:
        'It is the only oral anti-inflammatory approved for this disease, and the only drug in this file that is not inhaled. It is also the one whose two largest trials both missed their primary endpoint, which is why its indication is written so narrowly.',
      whoTakesThis:
        'A specific and small group: severe chronic obstructive pulmonary disease, with chronic bronchitis, and a history of exacerbations. It is not for breathlessness, not for emphysema without bronchitis, and not for an attack happening now.',
      clinicalGoals:
        'Fewer exacerbations. The lung-function gain is real and small — 48 mL — and the label states plainly that this is not a bronchodilator.',
    },
    oneSentenceVerdict:
      'A phosphodiesterase-4 inhibitor taken as a tablet, which raises cyclic AMP inside airway inflammatory cells; across two 52-week trials in 3,091 people it cut moderate or severe exacerbations by 17% and raised FEV1 by 48 mL, and then missed its primary endpoint in both of the larger trials that followed — REACT at p=0.0529 and RE2SPOND at p=0.163 — while causing 2.17 kg of weight loss and psychiatric adverse reactions in 5.9% against 3.3% on placebo.',
    laymanHowItWorks:
      'Inflammatory cells hold a chemical messenger called cyclic AMP that acts as a brake on them, and an enzyme inside those cells constantly destroys it. Roflumilast blocks that enzyme, so the messenger builds up and the cells calm down. It is a tablet, not an inhaler, so the effect reaches inflammatory cells everywhere in the body — which is why it works, and also why it causes diarrhoea, nausea, weight loss and mood changes that an inhaled drug would not.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 62,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$2.00 per tablet, the median across 43 listed products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'The oral tablet has gone generic across 43 listed presentations, which is why it appears here at two dollars a tablet. The same molecule was then reformulated as a topical cream and launched as a new brand for psoriasis and atopic dermatitis. A molecule whose patent has expired can re-enter the market at brand pricing through a new route of administration and a new indication, and roflumilast is the clearest example of that pattern in this file.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Roflumilast occupies a narrow slot: severe chronic obstructive pulmonary disease with chronic bronchitis and continuing exacerbations despite inhaled treatment. The realistic alternatives in that slot are an inhaled corticosteroid added to bronchodilators, or long-term azithromycin. All three reduce exacerbations by roughly comparable amounts and all three carry a distinct cost — pneumonia, hearing loss and resistance, or weight loss and mood change.',
      conventionalRx: [
        {
          name: 'An inhaled corticosteroid added to bronchodilators',
          class: 'Inhaled corticosteroid, in a combination inhaler',
          howItCompares:
            'Delivered to the lung rather than the whole body, and effective on exacerbations: in IMPACT, adding fluticasone furoate to two bronchodilators cut moderate or severe exacerbations from 1.21 to 0.91 per year in 10,355 patients.',
          typicalCost:
            'US$0.6920 per millilitre for generic fluticasone propionate at United States pharmacy acquisition cost (CMS NADAC, effective 19 August 2026); the branded combination inhalers cost far more',
          prosAndCons:
            'Pros: no systemic weight loss or psychiatric signal, larger exacerbation effect in the frequent-exacerbator population. Cons: clinician-diagnosed pneumonia was 53% more likely in the steroid arm of IMPACT, hazard ratio 1.53 (95% CI 1.22 to 1.92).',
        },
        {
          name: 'Long-term azithromycin',
          class: 'Macrolide antibiotic used for its anti-inflammatory and antimicrobial effect',
          howItCompares:
            'The other oral option for reducing exacerbations in this population, taken daily or three times weekly rather than as a course. It is used for the same reason roflumilast is: inhaled treatment has run out.',
          typicalCost: 'Generic and inexpensive across many listed presentations',
          prosAndCons:
            'Pros: cheap, generally well tolerated, no weight loss. Cons: hearing loss, QT prolongation and the selection of macrolide-resistant organisms — a population-level cost as well as an individual one.',
        },
        {
          name: 'Roflumilast cream (Zoryve)',
          class: 'The same PDE4 inhibitor applied to skin rather than swallowed',
          howItCompares:
            'Not a substitute for the tablet — a different disease entirely. It is listed here because it is the same molecule, and because its trials show what this pharmacology looks like when the drug is kept out of the bloodstream: IGA success at 8 weeks of 42.4% against 6.1% on vehicle, with serious adverse events in 0.7% of both arms.',
          typicalCost:
            'Brand-priced; the oral generic tablet is US$2.00 per unit at United States pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: large effect against vehicle, and the systemic tolerability problem largely disappears. Cons: it treats skin, not lung, and the psoriasis trials ran eight weeks.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Weigh yourself regularly and report unexplained loss',
          action: 'Keep a record of weight from before the first tablet and check it periodically.',
          patientImpact:
            'The label instructs monitoring weight regularly and evaluating, with consideration of discontinuation, if unexplained or clinically significant weight loss occurs. In the pooled 52-week trials the difference in weight change against placebo was -2.17 kg.',
          clinicalPrecaution:
            'Weight loss in severe chronic obstructive pulmonary disease is itself a bad prognostic sign, which makes drug-caused weight loss harder to interpret and more consequential in exactly the population being treated.',
        },
        {
          name: 'Tell someone if your mood or sleep changes',
          action:
            'Ask a family member or carer to watch for new insomnia, anxiety, low mood or thoughts of self-harm, and to raise them promptly.',
          patientImpact:
            'The label carries a Warnings and Precautions entry for psychiatric events including suicidality, and records psychiatric adverse reactions in 5.9% of 4,438 patients on 500 micrograms daily across 8 controlled trials against 3.3% on placebo.',
          clinicalPrecaution:
            'The label asks prescribers to weigh risks and benefits carefully in anyone with a history of depression or suicidal thoughts. This is a systemic drug reaching the brain, unlike everything else in this file.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1CC1COC2=C(C=CC(=C2)C(=O)NC3=C(C=NC=C3Cl)Cl)OC(F)F',
      chemicalFormula: 'C17H14Cl2F2N2O3',
      molecularWeight: '403.20 g/mol',
      targetReceptorAffinity:
        'The label describes roflumilast and its active metabolite roflumilast N-oxide as selective inhibitors of phosphodiesterase 4, the major cyclic AMP-metabolising enzyme in lung tissue, and states that inhibition leads to accumulation of intracellular cyclic AMP. It also states that the specific mechanism by which the drug exerts its therapeutic action in COPD is not well defined and is thought to relate to the effects of increased intracellular cyclic AMP in lung cells. No numeric IC50 is given in the prescribing information and none is stated here.',
      structureSource: {
        label: 'PubChem CID 449193 (roflumilast) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/449193',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'rof-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity of the difluoromethoxy catechol ether and the dichloropyridine amine',
          description:
            'Confirm both fragments before amide coupling. The difluoromethoxy group is the feature that raised metabolic stability enough to make a once-daily oral PDE4 inhibitor possible, and the 3,5-dichloropyridin-4-yl amine is the fragment that carries selectivity for PDE4 over the other phosphodiesterase families.',
          reagentsAndBuffer:
            'Roflumilast reference standard, reversed-phase HPLC with ultraviolet detection, 1H, 13C and 19F NMR in DMSO-d6, Karl Fischer titration, residual solvent testing by headspace gas chromatography',
        },
        {
          id: 'rof-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Amide bond formation between the benzoic acid and the aminopyridine',
          description:
            'Activate 3-cyclopropylmethoxy-4-difluoromethoxybenzoic acid and couple it to 4-amino-3,5-dichloropyridine. Coupling an electron-poor, sterically hindered aminopyridine is the difficult step of the route and is where most of the process yield is decided.',
          dependsOnStepId: 'rof-w1',
          reagentsAndBuffer:
            '3-cyclopropylmethoxy-4-difluoromethoxybenzoic acid, thionyl chloride or oxalyl chloride for acid chloride formation, 4-amino-3,5-dichloropyridine, sodium hydride or lithium bis(trimethylsilyl)amide, anhydrous tetrahydrofuran or toluene under nitrogen',
        },
        {
          id: 'rof-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation and control of the des-cyclopropylmethyl impurity',
          description:
            'Recrystallise and assay for dealkylated and hydrolysed degradants. The N-oxide is not an impurity here but the active human metabolite, formed by CYP3A4 and CYP1A2 after dosing; a process assay that treats it as a contaminant is measuring the wrong thing.',
          dependsOnStepId: 'rof-w2',
          reagentsAndBuffer:
            'Ethanol or ethyl acetate and heptane recrystallisation, activated carbon treatment, HPLC purity with identified impurity limits, X-ray powder diffraction and differential scanning calorimetry for polymorph identity',
        },
        {
          id: 'rof-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Cyclic AMP accumulation in human peripheral blood neutrophils',
          description:
            'Expose isolated human neutrophils and measure intracellular cyclic AMP, then challenge them and measure the functional consequence. Neutrophils are the point: this pharmacology exists because the neutrophilic inflammation of chronic bronchitis is the part inhaled corticosteroids handle worst.',
          dependsOnStepId: 'rof-w3',
          reagentsAndBuffer:
            'Human peripheral blood neutrophils isolated by density gradient, RPMI-1640 with HEPES, formyl-methionyl-leucyl-phenylalanine or lipopolysaccharide challenge, cyclic AMP immunoassay, roflumilast N-oxide run alongside the parent compound',
        },
        {
          id: 'rof-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'PDE isoenzyme selectivity panel including PDE3',
          description:
            'Run inhibition curves across the phosphodiesterase families, with PDE3 explicitly included. PDE3 inhibition is what made earlier non-selective xanthines cardiotoxic and arrhythmogenic; a PDE4 potency reported without a PDE3 counter-screen cannot support the word selective, which is the word the label uses.',
          dependsOnStepId: 'rof-w4',
          reagentsAndBuffer:
            'Recombinant human PDE1 through PDE7 preparations, scintillation proximity or fluorescence polarisation cyclic nucleotide hydrolysis assay, cilomilast and theophylline as reference inhibitors, non-linear regression to four-parameter logistic curves',
        },
      ],
    },
    keyAudits: [
      {
        id: 'rof-a1',
        category: 'measured',
        title: 'M2-124 and M2-125: a 17% cut in exacerbations, and 48 mL of lung function',
        laymanSummary:
          'Two identical year-long trials in just over three thousand people with severe smokers’ lung disease and chronic bronchitis. Exacerbations fell from 1.37 to 1.14 per person per year. Lung function rose by 48 millilitres, which is about half of what a person would normally notice.',
        technicalDetails:
          'Two placebo-controlled, double-blind, 52-week trials of identical design in patients over 40 with severe airflow limitation, bronchitic symptoms and a history of exacerbations randomised 1,537 to roflumilast 500 micrograms once daily and 1,554 to placebo. Both co-primary endpoints were achieved. Pooled, prebronchodilator FEV1 increased by 48 mL against placebo (p<0.0001) and moderate or severe exacerbations fell from 1.37 to 1.14 per patient per year, a 17% reduction (95% CI 8 to 25, p<0.0003). Adverse events were more common on roflumilast, 1,040 of 1,537 (67%) against 963 of 1,554 (62%), and discontinuation for adverse events was 219 (14%) against 177 (12%). The pooled difference in weight change was -2.17 kg.',
        evidenceSource:
          'Calverley PMA, Rabe KF, Goehring U-M, et al. Lancet 2009;374:685-694 (M2-124, NCT00297102; M2-125, NCT00297115)',
        doi: '10.1016/S0140-6736(09)61255-1',
        measuredMetric:
          'Change in prebronchodilator FEV1 and rate of moderate or severe exacerbations over 52 weeks',
        auditFlag: 'verified',
      },
      {
        id: 'rof-a2',
        category: 'failed',
        title:
          'REACT missed its primary analysis at p=0.0529 and is quoted from its sensitivity one',
        laymanSummary:
          'The trial that asked whether roflumilast helps people already on inhaled combination treatment reported a 13.2% reduction in flare-ups — and a p-value of 0.0529, just the wrong side of the line. The figure usually quoted from this trial comes from a different, prespecified statistical method that gave 0.0424.',
        technicalDetails:
          'REACT enrolled 1,945 patients aged 40 or over with at least 20 pack-years, severe airflow limitation, chronic bronchitis and at least two exacerbations in the previous year, all on a fixed inhaled corticosteroid and long-acting beta-agonist combination with tiotropium permitted, and randomised 973 to roflumilast 500 micrograms and 972 to placebo for one year. The primary outcome, rate of moderate to severe exacerbations per patient per year by Poisson regression, was 13.2% lower on roflumilast (0.805 against 0.927; rate ratio 0.868, 95% CI 0.753 to 1.002, p=0.0529). A predefined sensitivity analysis by negative binomial regression gave 14.2% lower (0.823 against 0.959; rate ratio 0.858, 95% CI 0.740 to 0.995, p=0.0424). Adverse events were reported by 67% on roflumilast against 59% on placebo, and withdrawal for adverse events by 104 of 968 (11%) against 52 of 967 (5%).',
        evidenceSource:
          'Martinez FJ, Calverley PMA, Goehring U-M, et al. Lancet 2015;385:857-866 (REACT, NCT01329029)',
        doi: '10.1016/S0140-6736(14)62410-7',
        measuredMetric:
          'Rate of moderate to severe COPD exacerbations per patient per year, primary Poisson analysis',
        auditFlag: 'caution',
      },
      {
        id: 'rof-a3',
        category: 'failed',
        title:
          'RE2SPOND failed outright in 2,354 patients, and reported a post hoc subgroup instead',
        laymanSummary:
          'The larger follow-up trial gave roflumilast or placebo to more than two thousand three hundred people already on inhaled combination treatment. Flare-ups fell by 8.5% and the difference was not statistically significant. The positive result from this trial is a subgroup found after the fact.',
        technicalDetails:
          'RE2SPOND randomised 2,354 participants aged 40 or over with severe or very severe COPD, chronic bronchitis and two or more exacerbations or hospitalisations in the previous year, all on inhaled corticosteroid plus long-acting beta-agonist with or without a long-acting muscarinic antagonist for three months or more, equally to roflumilast 500 micrograms (n=1,178) or placebo (n=1,176) for 52 weeks. The rate of moderate or severe exacerbations per patient per year was 8.5% lower on roflumilast, and the between-group difference was not statistically significant: rate ratio 0.92 (95% CI 0.81 to 1.04, P=0.163). The authors state that roflumilast failed to significantly reduce exacerbations in the overall population, and report a post hoc analysis showing a significant reduction in participants with more than three exacerbations or one or more hospitalisations in the prior year. Adverse-event-related discontinuation was 11.7% against 5.4%; deaths were 2.5% against 2.1%.',
        evidenceSource:
          'Martinez FJ, Rabe KF, Sethi S, et al. Am J Respir Crit Care Med 2016;194:559-567 (RE2SPOND, NCT01443845)',
        doi: '10.1164/rccm.201607-1349OC',
        measuredMetric:
          'Rate of moderate or severe COPD exacerbations per patient per year in the overall randomised population',
        auditFlag: 'caution',
      },
      {
        id: 'rof-a4',
        category: 'failed',
        title: 'Weight loss of 2.17 kg and psychiatric reactions in 5.9% against 3.3%',
        laymanSummary:
          'This is the price of a tablet rather than an inhaler. People lost more than two kilograms on average, in a disease where losing weight is already a bad sign, and psychiatric side effects including suicidal thinking were roughly twice as common as on placebo.',
        technicalDetails:
          'In the pooled M2-124 and M2-125 analysis the difference in weight change against placebo was -2.17 kg, and the label instructs regular weight monitoring with consideration of discontinuation for unexplained or clinically significant loss. Across 8 controlled clinical trials, psychiatric adverse reactions were reported by 5.9% (263) of patients on roflumilast 500 micrograms daily against 3.3% (137) on placebo, most commonly insomnia, anxiety and depression, and the label carries a Warnings and Precautions entry for psychiatric events including suicidality. The most common adverse reactions at 2% or more were diarrhoea, weight decrease, nausea, headache, back pain, influenza, insomnia, dizziness and decreased appetite. Discontinuation for adverse events ran 14% against 12% in the pivotal pair and 11.7% against 5.4% in RE2SPOND. The drug is contraindicated in moderate to severe hepatic impairment.',
        evidenceSource:
          'DALIRESP United States prescribing information, Contraindications 4, Warnings and Precautions 5.2 and 5.3, Adverse Reactions 6.1; Calverley PMA et al., Lancet 2009;374:685-694',
        measuredMetric:
          'Weight change against placebo and rate of psychiatric adverse reactions across 8 controlled trials',
        auditFlag: 'caution',
      },
      {
        id: 'rof-a5',
        category: 'conclusion_shift',
        title: 'The same molecule on skin produced effects the tablet never approached',
        laymanSummary:
          'A decade after the lung indication, roflumilast was reformulated as a cream. In two psoriasis trials, four in ten treated patients reached clear or almost-clear skin against roughly one in fifteen on the cream base alone — and the weight loss and mood effects of the tablet did not appear.',
        technicalDetails:
          'DERMIS-1 and DERMIS-2 randomised 881 patients aged 2 or over with plaque psoriasis covering 2% to 20% of body surface area, 2:1, to roflumilast cream 0.3% or vehicle cream once daily for 8 weeks. Investigator Global Assessment success at week 8 was 42.4% against 6.1% in trial 1 (difference 39.6%, 95% CI 32.3 to 46.9) and 37.5% against 6.9% in trial 2 (difference 28.9%, 95% CI 20.8 to 36.9), P<0.001 for both. Intertriginous IGA success was 71.2% against 13.8% and 68.1% against 18.5%; PASI-75 was 41.6% against 7.6% and 39.0% against 5.3%. Treatment-emergent adverse events were 25.2% against 23.5% and 25.9% against 18.4%; serious adverse events were 0.7% against 0.7% and 0% against 0.7%. Keeping a PDE4 inhibitor out of the bloodstream removes the tolerability problem that constrains the oral drug, and the effect sizes are of a different order from the 17% exacerbation reduction in the lung trials.',
        evidenceSource:
          'Lebwohl MG, Kircik LH, Moore AY, et al. JAMA 2022;328:1073-1084 (DERMIS-1, NCT04211363; DERMIS-2, NCT04211389)',
        doi: '10.1001/jama.2022.15632',
        inferredClaim:
          'That roflumilast is a marginal drug — true of the swallowed tablet in COPD, and not true of the same molecule applied to skin, where the comparison against vehicle is one of the largest in topical dermatology',
        auditFlag: 'verified',
      },
      {
        id: 'rof-a6',
        category: 'inferred',
        title: 'The 48 mL lung-function gain is not bronchodilation, and the label says so',
        laymanSummary:
          'Roflumilast improves a breathing test by 48 millilitres. That is real, and it is roughly half the change a person would be expected to notice, and it does not happen by opening the airway. The label states outright that this is not a bronchodilator.',
        technicalDetails:
          'The DALIRESP Limitations of Use state that the drug is not a bronchodilator and is not indicated for the relief of acute bronchospasm. The 48 mL prebronchodilator FEV1 improvement in the pooled pivotal trials is therefore an indirect consequence of reduced airway inflammation rather than smooth-muscle relaxation. For comparison, tiotropium produced 87 to 103 mL in UPLIFT and umeclidinium 127 mL at 12 weeks, both by relaxing muscle. Reading a 48 mL figure as though it were a bronchodilator response overstates what the drug does and understates what makes it unusual, which is that it is the only oral anti-inflammatory approved for this disease.',
        evidenceSource:
          'DALIRESP United States prescribing information, Indications and Usage 1 with Limitations of Use; Calverley PMA et al., Lancet 2009;374:685-694',
        doi: '10.1016/S0140-6736(09)61255-1',
        inferredClaim:
          'That the FEV1 improvement makes roflumilast a bronchodilator — a reading the label explicitly forecloses in its Limitations of Use',
        auditFlag: 'verified',
      },
      {
        id: 'rof-a7',
        category: 'inferred',
        title: 'The indication is narrower than the population that failed to benefit',
        laymanSummary:
          'The label restricts the drug to severe disease with chronic bronchitis and a history of flare-ups. The two large trials in exactly that kind of population — people still flaring despite inhaled treatment — are the ones that missed. The narrowing came from the trials that worked, not from the ones that did not.',
        technicalDetails:
          'The indication reads: to reduce the risk of COPD exacerbations in patients with severe COPD associated with chronic bronchitis and a history of exacerbations. M2-124 and M2-125, which met their endpoints, enrolled that phenotype on variable background therapy. REACT and RE2SPOND enrolled the same phenotype but required an inhaled corticosteroid and long-acting beta-agonist combination as background, and both missed their primary analyses — REACT at p=0.0529, RE2SPOND at p=0.163. RE2SPOND’s positive result is a post hoc subgroup of the most frequent exacerbators. A phenotype restriction derived from responder analyses is a hypothesis about who benefits, and the trials designed to test it in the modern treatment context did not confirm it on their primary endpoints.',
        evidenceSource:
          'Martinez FJ et al., Lancet 2015;385:857-866; Martinez FJ et al., Am J Respir Crit Care Med 2016;194:559-567; DALIRESP United States prescribing information, Indications and Usage 1',
        doi: '10.1164/rccm.201607-1349OC',
        inferredClaim:
          'That the labelled phenotype identifies the patients in whom roflumilast works — a claim the two trials run in that phenotype on modern background therapy did not confirm on their primary endpoints',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed, not inhaled',
        laymanDesc:
          'It is a tablet taken once a day. That is the whole difference between this drug and everything else on this list, and it explains both what it does and what it costs the person taking it.',
        molecularDetail:
          'Roflumilast 500 micrograms once daily, with a 250 microgram starting strength for the first four weeks only, which the label states explicitly is not the therapeutic dose. Contraindicated in moderate to severe hepatic impairment, and not recommended with strong cytochrome P450 inducers such as rifampicin, phenobarbital, carbamazepine and phenytoin.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The liver converts part of it into a second active drug',
        laymanDesc:
          'The body turns some of the tablet into a related molecule that is also active. Both forms do the same job, which is why the effect lasts through the day from a single dose.',
        molecularDetail:
          'Roflumilast is oxidised to roflumilast N-oxide by CYP3A4 and CYP1A2. The label treats parent and N-oxide together as selective inhibitors of phosphodiesterase 4, and the N-oxide contributes the majority of total PDE4 inhibitory activity in humans.',
        iconName: 'RefreshCw',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It blocks the enzyme that destroys the cell’s brake signal',
        laymanDesc:
          'Inflammatory cells hold a messenger that damps them down, and an enzyme inside them constantly chews it up. Roflumilast stops that enzyme.',
        molecularDetail:
          'Selective inhibition of phosphodiesterase 4, described in the label as the major cyclic AMP-metabolising enzyme in lung tissue. Selectivity for PDE4 over PDE3 is the property that separates this drug from the non-selective xanthines and from their cardiac toxicity.',
        iconName: 'Ban',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Cyclic AMP accumulates inside inflammatory cells',
        laymanDesc:
          'With the enzyme blocked, the brake signal builds up. Neutrophils and other inflammatory cells become less active.',
        molecularDetail:
          'The label states that inhibition leads to accumulation of intracellular cyclic AMP, and that the specific mechanism by which the drug exerts its therapeutic action in COPD is not well defined but is thought to relate to the effects of increased intracellular cyclic AMP in lung cells. This is unusually explicit uncertainty for a mechanism-of-action section.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Exacerbations become less frequent',
        laymanDesc:
          'Over a year, flare-ups fall from about 1.4 per person to about 1.1. Lung function rises by 48 millilitres, which the label is careful to say is not bronchodilation.',
        molecularDetail:
          'Pooled across the two pivotal 52-week trials: moderate or severe exacerbations 1.14 against 1.37 per patient per year, a 17% reduction (95% CI 8 to 25, p<0.0003), and prebronchodilator FEV1 +48 mL (p<0.0001). In the two later trials on inhaled combination background the same endpoint gave rate ratios of 0.868 (p=0.0529) and 0.92 (p=0.163).',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'The same enzyme is blocked everywhere else too',
        laymanDesc:
          'Phosphodiesterase 4 is not confined to the lung. Blocking it in the gut causes diarrhoea and nausea, blocking it elsewhere causes weight loss, and blocking it in the brain is why the label warns about mood and suicidal thinking.',
        molecularDetail:
          'Pooled weight change against placebo was -2.17 kg. Psychiatric adverse reactions occurred in 5.9% against 3.3% across 8 controlled trials, most commonly insomnia, anxiety and depression. Discontinuation for adverse events ran 11.7% against 5.4% in RE2SPOND. The topical formulation exists precisely because keeping the same pharmacology out of the circulation removes this step.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'M2-124 and M2-125 (NCT00297102 and NCT00297115)',
        phase:
          'Phase 3, two identically designed randomised, double-blind, placebo-controlled trials, 52 weeks',
        sampleSize: 3091,
        primaryEndpoint:
          'Co-primary: change in prebronchodilator FEV1 and rate of moderate or severe exacerbations',
        endpointMet: true,
        statisticalPValue:
          'Pooled FEV1 +48 mL (p<0.0001); exacerbations 1.14 against 1.37 per patient per year, 17% reduction (95% CI 8 to 25), p<0.0003',
        unreportedAdverseSignals:
          'Adverse events 67% against 62%, discontinuation for adverse events 14% against 12%, and a pooled weight difference of -2.17 kg against placebo in a disease where weight loss is itself a poor prognostic sign.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'REACT (NCT01329029)',
        phase: 'Phase 3/4, randomised, double-blind, placebo-controlled, parallel group, one year',
        sampleSize: 1945,
        primaryEndpoint:
          'Rate of moderate to severe COPD exacerbations per patient per year, on a background of inhaled corticosteroid plus long-acting beta-agonist',
        endpointMet: false,
        statisticalPValue:
          'Poisson regression: rate ratio 0.868 (95% CI 0.753 to 1.002), p=0.0529. Predefined negative binomial sensitivity analysis: 0.858 (0.740 to 0.995), p=0.0424.',
        unreportedAdverseSignals:
          'The trial is routinely cited using the sensitivity analysis rather than the primary one. Withdrawal for adverse events was 11% against 5%.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'RE2SPOND (NCT01443845)',
        phase: 'Phase 4, randomised, double-blind, placebo-controlled, 52 weeks',
        sampleSize: 2354,
        primaryEndpoint:
          'Rate of moderate or severe COPD exacerbations per patient per year on inhaled corticosteroid plus long-acting beta-agonist, with or without a long-acting muscarinic antagonist',
        endpointMet: false,
        statisticalPValue:
          'Rate ratio 0.92 (95% CI 0.81 to 1.04), P=0.163 — an 8.5% reduction, not significant',
        unreportedAdverseSignals:
          'The reported positive finding is a post hoc subgroup of participants with more than three prior exacerbations or at least one hospitalisation. Adverse-event-related discontinuation was 11.7% against 5.4%.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'DERMIS-1 and DERMIS-2 (NCT04211363 and NCT04211389)',
        phase: 'Phase 3, two randomised, double-blind, vehicle-controlled trials, 8 weeks',
        sampleSize: 881,
        primaryEndpoint:
          'Investigator Global Assessment success at week 8 in chronic plaque psoriasis, roflumilast cream 0.3% against vehicle',
        endpointMet: true,
        statisticalPValue:
          'Trial 1: 42.4% against 6.1% (difference 39.6%, 95% CI 32.3 to 46.9). Trial 2: 37.5% against 6.9% (difference 28.9%, 95% CI 20.8 to 36.9). P<0.001 for both.',
        unreportedAdverseSignals:
          'Eight weeks of follow-up, and a vehicle rather than an active comparator. The authors state that further research is needed to assess efficacy against other active treatments and longer-term efficacy and safety.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A 17% reduction in moderate or severe exacerbations, 1.14 against 1.37 per patient per year, in 3,091 patients across two 52-week trials',
        'A 48 mL increase in prebronchodilator FEV1 against placebo, pooled across those two trials',
        'Rate ratio 0.868 (95% CI 0.753 to 1.002, p=0.0529) in REACT and 0.92 (0.81 to 1.04, P=0.163) in RE2SPOND, both on inhaled combination background',
        'A pooled weight difference of -2.17 kg against placebo, and psychiatric adverse reactions in 5.9% against 3.3% across 8 controlled trials',
        'Investigator Global Assessment success of 42.4% against 6.1% on vehicle at 8 weeks for the 0.3% cream in plaque psoriasis',
      ],
      unsupportedInferences: [
        'That roflumilast added to inhaled combination therapy reduces exacerbations — the two trials designed to test that both missed their primary analyses',
        'That the labelled phenotype identifies who benefits, when the confirmation for it comes from a post hoc subgroup in a failed trial',
        'That a 48 mL FEV1 improvement represents bronchodilation, which the Limitations of Use section rules out in one sentence',
        'That the tablet and the cream can be discussed as one drug — same molecule, different route, and effect sizes an order of magnitude apart',
      ],
      whatFailedInitially: [
        'REACT missed its primary Poisson analysis at p=0.0529 and is generally cited from its sensitivity analysis instead',
        'RE2SPOND failed outright in 2,354 patients, rate ratio 0.92 (95% CI 0.81 to 1.04, P=0.163)',
        'Weight loss of 2.17 kg on average, in a disease where weight loss is an independent marker of poor outcome',
        'Psychiatric adverse reactions including suicidality at nearly twice the placebo rate, and discontinuation for adverse events up to 11.7% against 5.4%',
      ],
      realWorldOutcome: [
        'Approved in 2011 with a deliberately narrow indication: severe COPD with chronic bronchitis and a history of exacerbations',
        'The only oral anti-inflammatory approved for chronic obstructive pulmonary disease and the only non-inhaled drug in this group',
        'Now generic as a tablet across 43 listed presentations at about two dollars each',
        'Relaunched as a topical cream for psoriasis and atopic dermatitis a decade after the lung approval, at brand pricing',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, 250 and 500 micrograms once daily; separately, topical cream at 0.3%, 0.15% and 0.05%',
      description:
        'The tablet is taken once daily with or without food. The 250 microgram strength exists only as a four-week starting dose to improve tolerability and is stated in the label not to be the therapeutic dose. The cream is a different product for a different disease, and is included on this page because it is the same molecule and the contrast in tolerability between the two routes is the clearest evidence of where the tablet’s side effects come from.',
      safetyProfile:
        'Contraindicated in moderate to severe hepatic impairment (Child-Pugh B or C). Not a bronchodilator and not for acute bronchospasm. Warnings for psychiatric events including suicidality — insomnia, anxiety, depression, suicidal thoughts or other mood changes, reported in 5.9% against 3.3% on placebo across 8 controlled trials — and for weight decrease, with instructions to monitor weight regularly and consider discontinuation. Strong cytochrome P450 inducers such as rifampicin, phenobarbital, carbamazepine and phenytoin are not recommended. The most common adverse reactions at 2% or more were diarrhoea, weight decrease, nausea, headache, back pain, influenza, insomnia, dizziness and decreased appetite.',
    },
    commonQuestions: [
      {
        q: 'Does roflumilast actually work?',
        a: 'It depends which trial you read, and that is the honest answer rather than an evasion. In the two 52-week trials that supported approval, in 3,091 people, exacerbations fell from 1.37 to 1.14 per person per year — a 17% reduction with a confidence interval of 8 to 25 and p<0.0003. In the two later and larger trials, run in people already taking an inhaled corticosteroid and a long-acting beta-agonist, it missed: REACT at p=0.0529 on its primary analysis and RE2SPOND at p=0.163. The difference between those two sets of trials is the background treatment. Whether roflumilast adds anything on top of modern inhaled therapy is the question that has been asked twice and answered negatively twice on the primary endpoint.',
        auditNote:
          'REACT is almost always quoted using its negative binomial sensitivity analysis, p=0.0424, rather than its prespecified Poisson primary, p=0.0529. Both were prespecified; only one was primary.',
      },
      {
        q: 'Why does it cause weight loss?',
        a: 'Because it is swallowed. Phosphodiesterase 4 is present throughout the body, not only in the lung, and a tablet reaches all of it. The average difference against placebo across the pivotal trials was -2.17 kg, alongside diarrhoea, nausea and decreased appetite as some of the commonest adverse reactions. That matters more here than it would elsewhere: unintentional weight loss in severe chronic obstructive pulmonary disease is itself associated with worse outcomes, so the label asks for regular weighing and for considering stopping the drug if the loss is unexplained or clinically significant.',
      },
      {
        q: 'Is it true it can affect mood?',
        a: 'Yes, and the label says so directly. Across eight controlled trials, psychiatric adverse reactions were reported by 5.9% of patients on roflumilast against 3.3% on placebo, most commonly insomnia, anxiety and depression, and the Warnings and Precautions section is headed psychiatric events including suicidality. Patients, families and carers are asked to watch for new or worsening insomnia, anxiety, depression, suicidal thoughts or other mood changes and to report them. Anyone with a history of depression or suicidal thinking should have the risks and benefits weighed carefully before starting.',
      },
      {
        q: 'Is the cream the same drug?',
        a: 'The same molecule, applied to skin instead of swallowed, and it behaves very differently. In two 8-week psoriasis trials in 881 people, 42.4% and 37.5% of those using roflumilast cream 0.3% reached clear or almost-clear skin with at least a two-grade improvement, against 6.1% and 6.9% on the cream base alone. Serious adverse events were 0.7% in both arms of one trial and 0% against 0.7% in the other. The systemic weight loss and mood effects that constrain the tablet do not appear, because the drug is not being distributed through the bloodstream. It treats skin, not lung, and it is not interchangeable with the tablet in any direction.',
      },
      {
        q: 'Will it help my breathing?',
        a: 'Not in the way an inhaler does, and the label forecloses the question in one sentence: it is not a bronchodilator and is not indicated for the relief of acute bronchospasm. The 48 mL improvement in lung function measured in the pivotal trials is a downstream consequence of less airway inflammation, and 48 mL is roughly half the change usually taken as noticeable. What the drug is prescribed for is fewer exacerbations, in one narrow group — severe disease, chronic bronchitis, a history of flare-ups. If breathlessness is the problem, this is not the drug for it.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Calverley PMA, Rabe KF, Goehring U-M, et al. Roflumilast in symptomatic chronic obstructive pulmonary disease: two randomised clinical trials. Lancet 2009;374:685-694',
        identifier: '10.1016/S0140-6736(09)61255-1',
        kind: 'doi',
      },
      {
        label:
          'Martinez FJ, Calverley PMA, Goehring U-M, et al. Effect of roflumilast on exacerbations in patients with severe COPD uncontrolled by combination therapy (REACT). Lancet 2015;385:857-866',
        identifier: '10.1016/S0140-6736(14)62410-7',
        kind: 'doi',
      },
      {
        label:
          'Martinez FJ, Rabe KF, Sethi S, et al. Effect of Roflumilast and Inhaled Corticosteroid/Long-Acting beta2-Agonist on COPD Exacerbations (RE2SPOND). Am J Respir Crit Care Med 2016;194:559-567',
        identifier: '10.1164/rccm.201607-1349OC',
        kind: 'doi',
      },
      {
        label:
          'Lebwohl MG, Kircik LH, Moore AY, et al. Effect of Roflumilast Cream vs Vehicle Cream on Chronic Plaque Psoriasis: The DERMIS-1 and DERMIS-2 Randomized Clinical Trials. JAMA 2022;328:1073-1084',
        identifier: '10.1001/jama.2022.15632',
        kind: 'doi',
      },
      {
        label: 'M2-124 — roflumilast against placebo in severe COPD with chronic bronchitis',
        identifier: 'NCT00297102',
        kind: 'nct',
      },
      {
        label: 'M2-125 — the replicate roflumilast trial',
        identifier: 'NCT00297115',
        kind: 'nct',
      },
      {
        label: 'REACT — roflumilast added to inhaled corticosteroid plus long-acting beta-agonist',
        identifier: 'NCT01329029',
        kind: 'nct',
      },
      {
        label: 'RE2SPOND — the 2,354-patient follow-up trial',
        identifier: 'NCT01443845',
        kind: 'nct',
      },
      {
        label: 'DERMIS-1 — roflumilast cream 0.3% in chronic plaque psoriasis',
        identifier: 'NCT04211363',
        kind: 'nct',
      },
      {
        label:
          'DALIRESP (roflumilast tablets) United States prescribing information — Indications and Limitations of Use, Contraindications 4, Warnings and Precautions 5.1 to 5.4, Adverse Reactions 6.1, Clinical Pharmacology 12.1',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22DALIRESP%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 449193 — roflumilast structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/449193',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 9. Theophylline — the oldest drug here, whose most elegant modern mechanism was published in
  //    2002, tested properly in 2018, and did not survive the test.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'theophylline',
    name: 'Theophylline',
    tradeName: 'Theo-Dur / Theo-24 / Slo-Phyllin / Slo-Bid / Uniphyl',
    sponsor:
      'No single originator — a methylxanthine isolated from tea in the nineteenth century and in respiratory use since the 1930s. Baxter Healthcare holds the listed intravenous presentation; the oral extended-release tablets are made by many manufacturers.',
    targetGene: 'PDE3A',
    targetProtein:
      'Phosphodiesterase III and, to a lesser extent, phosphodiesterase IV; separately an adenosine receptor antagonist, and at low concentrations an activator of histone deacetylase',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1976,
    indication:
      'Treatment of the symptoms and reversible airflow obstruction associated with chronic asthma and other chronic lung diseases, such as emphysema and chronic bronchitis.',
    patientFriendlyIndication:
      'An old oral tablet that opens the airways, with a narrow margin between a helpful dose and a dangerous one',
    anatomicalSite:
      'Airway smooth muscle, airway inflammatory cells and the diaphragm — reached systemically, because the drug is swallowed',
    conditionContext: {
      conditionExplainer:
        'Theophylline is a methylxanthine, chemically a close relative of the caffeine in coffee, and it was treating asthma before inhalers existed. It relaxes airway muscle, damps inflammation and strengthens the contraction of the diaphragm, all through different mechanisms, and it does all of it from the bloodstream.',
      whyItMatters:
        'It is the cheapest maintenance option for obstructive lung disease anywhere in the world, and in much of the world it is the only one available. It is also the one drug in this file where an ordinary antibiotic prescription can push a stable patient into seizures.',
      whoTakesThis:
        'People whose asthma or chronic obstructive pulmonary disease is not controlled by inhaled treatment, and — far more commonly — people for whom inhaled treatment is unaffordable or unavailable.',
      clinicalGoals:
        'Symptom relief and reversible airflow obstruction, which is exactly what the label claims. Not exacerbation prevention: the trial that tested that in 1,578 people found nothing.',
    },
    oneSentenceVerdict:
      'A methylxanthine that relaxes airway muscle by inhibiting phosphodiesterase III and IV, blocks adenosine receptors, and at low concentrations restores histone deacetylase activity to make steroids work better — a mechanism published in 2002 and tested in 1,578 patients in 2018, where adding it to an inhaled steroid changed the exacerbation rate from 2.23 to 2.24 per year, incidence rate ratio 0.99 (95% CI 0.91 to 1.08).',
    laymanHowItWorks:
      'Theophylline is a chemical cousin of caffeine, swallowed as a tablet. It blocks an enzyme inside airway muscle cells so a relaxing signal accumulates, and it blocks a second receptor that would otherwise make the airway twitchy — which is also where most of its side effects come from. At very low concentrations it does something else again, reactivating an enzyme that steroids need in order to switch inflammatory genes off. The gap between a dose that helps and a dose that causes vomiting, racing heart and seizures is narrow, and a great many ordinary medicines shift a person across it.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 58,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$1.05 per tablet, the median across 30 listed products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Theophylline has no meaningful patent history left: it is a nineteenth-century natural product, fully generic, and available almost everywhere. Its real cost is not the tablet. Safe use requires serum concentration measurement, dose adjustment for age, fever, heart failure, liver disease and smoking status, and re-checking whenever another medicine is started or stopped. That monitoring burden is invisible in an acquisition price and is the reason a one-dollar tablet is not the bargain it looks like in settings that cannot deliver it.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Almost everything else in this file is a better-tolerated substitute for theophylline, and almost all of it costs more and needs a device. That trade is the whole story of this drug: it is displaced wherever inhaled treatment is available and affordable, and retained wherever it is not. The one genuine claim it retains is that adding a small amount of it to a low-dose steroid matched a doubled steroid dose in a 62-patient trial without suppressing cortisol.',
      conventionalRx: [
        {
          name: 'An inhaled corticosteroid',
          class: 'Inhaled corticosteroid',
          howItCompares:
            'Delivered to the lung instead of the whole body, with no serum concentration to monitor and no interaction with erythromycin or ciprofloxacin. In the 62-patient Evans trial, doubling the budesonide dose worked as well as adding theophylline, but lowered serum cortisol from 18.4 to 15.9 micrograms per decilitre (P=0.02) while the theophylline arm did not.',
          typicalCost:
            'US$0.6920 per millilitre for generic fluticasone propionate at United States pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: no systemic toxicity at ordinary doses, no monitoring, first-line in every guideline. Cons: needs a working inhaler and correct technique, and higher doses do measurably suppress the adrenal axis.',
        },
        {
          name: 'Roflumilast (Daliresp)',
          class: 'Selective phosphodiesterase-4 inhibitor, oral',
          howItCompares:
            'The modern selective version of half of what theophylline does. Selectivity for PDE4 over PDE3 is the point: PDE3 inhibition is where theophylline’s hypotension, tachycardia and vomiting come from.',
          typicalCost:
            'US$2.00 per tablet at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: no serum monitoring, no seizure risk, a defined exacerbation indication. Cons: 2.17 kg of weight loss, psychiatric adverse reactions in 5.9% against 3.3%, and two large trials that missed their primary endpoints.',
        },
        {
          name: 'A long-acting bronchodilator inhaler',
          class: 'Long-acting beta-2 agonist or long-acting muscarinic antagonist',
          howItCompares:
            'Far more effective bronchodilation delivered to the target organ. Tiotropium raised trough FEV1 by 87 to 103 mL in UPLIFT and reduced exacerbations; theophylline has no comparable exacerbation evidence and one large negative trial.',
          typicalCost:
            'US$6.74 to US$11.73 per unit at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: better bronchodilation, no monitoring, no drug-interaction cliff. Cons: six to eleven times the acquisition cost, and requires a device a patient can use.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Tell every prescriber you take theophylline',
          action:
            'Name it before any new medicine is started or stopped, including short antibiotic courses.',
          patientImpact:
            'The label states that adding a drug which inhibits theophylline metabolism, such as cimetidine, erythromycin or tacrine, or stopping one that enhances it, such as carbamazepine or rifampin, is a readily identifiable cause of reduced clearance, and that severe and potentially fatal toxicity can occur if the dose is not appropriately reduced.',
          clinicalPrecaution:
            'This is the single most dangerous property of the drug and it is entirely predictable. The interaction list in the label runs to whole tables.',
        },
        {
          name: 'Treat repeated vomiting as an emergency, not a stomach upset',
          action:
            'If nausea or repetitive vomiting begins, withhold further doses and get a serum theophylline concentration measured.',
          patientImpact:
            'The label instructs exactly this: whenever a patient on theophylline develops nausea or vomiting, particularly repetitive vomiting, or other signs consistent with toxicity — even if another cause is suspected — additional doses should be withheld and a serum concentration measured.',
          clinicalPrecaution:
            'Vomiting is often the first sign of toxicity and precedes the arrhythmias and seizures. Attributing it to a virus is how a manageable situation becomes a fatal one.',
        },
        {
          name: 'Say if you have stopped smoking',
          action:
            'Report stopping smoking, and report a fever above 102°F lasting a day or more, to whoever manages the theophylline dose.',
          patientImpact:
            'The label lists cessation of smoking, fever of 102°F for 24 hours or more, congestive heart failure, cor pulmonale, acute pulmonary oedema, hypothyroidism, liver disease, sepsis and shock among conditions that reduce theophylline clearance and require dose reconsideration.',
          clinicalPrecaution:
            'Tobacco smoke induces the enzyme that clears theophylline. Quitting raises the blood level of an unchanged dose, so the healthiest decision a smoker makes is also the one that can make their tablet toxic.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CN1C2=C(C(=O)N(C1=O)C)NC=N2',
      chemicalFormula: 'C7H8N4O2',
      molecularWeight: '180.16 g/mol',
      targetReceptorAffinity:
        'The label is unusually candid: it states that the mechanisms of action are not known with certainty, that animal studies suggest bronchodilation is mediated by inhibition of phosphodiesterase III and, to a lesser extent, phosphodiesterase IV, and that the non-bronchodilator prophylactic actions are probably mediated through one or more different molecular mechanisms that do not involve PDE III inhibition or adenosine receptor antagonism. It attributes hypotension, tachycardia, headache and emesis to PDE III inhibition and alterations in cerebral blood flow to adenosine receptor antagonism, and records that theophylline increases the force of contraction of diaphragmatic muscles through enhanced calcium uptake via an adenosine-mediated channel.',
      structureSource: {
        label: 'PubChem CID 2153 (theophylline) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2153',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'the-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Discrimination of theophylline from theobromine and caffeine',
          description:
            'Confirm the 1,3-dimethylxanthine substitution pattern and exclude its two isomeric relatives. Theophylline, theobromine and caffeine differ only in which ring nitrogens carry methyl groups, and they have markedly different pharmacology; an assay that cannot separate them cannot certify identity.',
          reagentsAndBuffer:
            'Theophylline anhydrous reference standard, reversed-phase HPLC with ultraviolet detection at 271 nm, caffeine and theobromine as resolution markers, 1H NMR in DMSO-d6, loss on drying for hydrate state',
        },
        {
          id: 'the-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Traube purine synthesis and selective N-methylation',
          description:
            'Build the xanthine ring by the classical Traube route and methylate selectively at N1 and N3. Selectivity is the whole problem: over-methylation at N7 gives caffeine, and separating the two after the fact is far harder than controlling the methylation.',
          dependsOnStepId: 'the-w1',
          reagentsAndBuffer:
            'N,N-dimethylurea, cyanoacetic acid and acetic anhydride for ring construction, sodium nitrite for nitrosation, sodium dithionite reduction, formamide or formic acid for ring closure, dimethyl sulfate or methyl iodide with base for methylation',
        },
        {
          id: 'the-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Recrystallisation and control of the extended-release matrix',
          description:
            'Recrystallise from water and formulate into an extended-release matrix with a characterised dissolution profile. For a drug with this therapeutic index the release profile is not a convenience feature: dose-dumping from a damaged or incorrectly formulated tablet is a route to a toxic serum concentration from a correct prescription.',
          dependsOnStepId: 'the-w2',
          reagentsAndBuffer:
            'Water recrystallisation, activated carbon decolourisation, hydrophilic matrix polymer or wax matrix excipients, USP apparatus 2 dissolution testing across multiple pH media, content uniformity testing',
        },
        {
          id: 'the-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Histone deacetylase activity in alveolar macrophages at low concentration',
          description:
            'Expose alveolar macrophages or bronchial epithelial cells to theophylline at 1 to 5 mg/L — far below the classical bronchodilator range — and measure histone deacetylase activity and inflammatory gene expression, with and without a corticosteroid. Running the corticosteroid arm is the point of the experiment: the claimed effect is cooperative, not additive, and a single-agent design cannot detect it.',
          dependsOnStepId: 'the-w3',
          reagentsAndBuffer:
            'Human alveolar macrophages or BEAS-2B bronchial epithelial cells, RPMI-1640 with 10% fetal bovine serum, lipopolysaccharide or tumour necrosis factor alpha challenge, dexamethasone as corticosteroid partner, HDAC activity fluorometric assay, IL-8 ELISA',
        },
        {
          id: 'the-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Concentration-response across the bronchodilator and sub-bronchodilator ranges',
          description:
            'Quantify the effect across two orders of magnitude of concentration, from 1 mg/L to above 20 mg/L, and report phosphodiesterase inhibition and adenosine antagonism separately from the histone deacetylase effect. Theophylline is the clearest case in this file of one molecule with three mechanisms operating in different concentration bands, and collapsing them into a single potency figure destroys the only interesting thing about it.',
          dependsOnStepId: 'the-w4',
          reagentsAndBuffer:
            'Recombinant human PDE3 and PDE4 hydrolysis assays, adenosine A1 and A2A radioligand binding, HDAC activity assay, serum theophylline immunoassay for concentration verification, four-parameter logistic regression per readout',
        },
      ],
    },
    keyAudits: [
      {
        id: 'the-a1',
        category: 'failed',
        title: 'TWICS: 1,578 patients, and the exacerbation rate went from 2.23 to 2.24',
        laymanSummary:
          'The trial built to test theophylline’s most attractive modern claim gave a low dose or a placebo to more than fifteen hundred people with chronic obstructive pulmonary disease already on a steroid inhaler. Over a year they had 3,430 flare-ups between them, and the two groups were indistinguishable.',
        technicalDetails:
          'TWICS was a pragmatic, double-blind, placebo-controlled randomised trial in 121 UK primary and secondary care sites, enrolling 1,578 participants with FEV1/FVC below 0.7, at least two exacerbations in the previous year and current inhaled corticosteroid use. Participants received low-dose theophylline 200 mg once or twice daily, dosed by ideal body weight and smoking status to give plasma concentrations of 1 to 5 mg/L (n=791), or placebo (n=787). Primary outcome data were available for 1,536 of 1,567 analysed participants (98%). There were 3,430 exacerbations in total: 1,727 on theophylline (mean 2.24 per year, 95% CI 2.10 to 2.38) against 1,703 on placebo (mean 2.23, 95% CI 2.09 to 2.37); unadjusted mean difference 0.01 (95% CI -0.19 to 0.21), adjusted incidence rate ratio 0.99 (95% CI 0.91 to 1.08). Nausea was reported by 10.9% against 7.9% and headache by 9.0% against 7.9%; gastrointestinal serious adverse events were 2.7% against 1.3%. The authors conclude that the findings do not support this use.',
        evidenceSource:
          'Devereux G, Cotton S, Fielding S, et al. JAMA 2018;320:1548-1559 (TWICS, ISRCTN27066620)',
        doi: '10.1001/jama.2018.14432',
        measuredMetric:
          'Participant-reported moderate or severe exacerbations treated with antibiotics, oral corticosteroids or both, over one year',
        auditFlag: 'verified',
      },
      {
        id: 'the-a2',
        category: 'conclusion_shift',
        title: 'A beautiful mechanism from 2002 that a trial in 2018 did not confirm',
        laymanSummary:
          'In 2002 a paper explained why a tiny dose of theophylline should make steroids work better: it reactivates an enzyme steroids need, and it does so at concentrations far below the ones that cause side effects. It was elegant, widely cited and dosed precisely in the trial that followed. The trial found nothing.',
        technicalDetails:
          'Ito and colleagues showed in vitro and in vivo that low-dose theophylline enhances histone deacetylase activity in epithelial cells and macrophages, that the increased activity is then available for corticosteroid recruitment, and that this occurs at therapeutic concentrations and is dissociated from phosphodiesterase inhibition — the bronchodilator mechanism — and from adenosine receptor blockade, which causes side effects. The prediction was a cooperative interaction between corticosteroids and theophylline. TWICS was designed around it: 200 mg once or twice daily titrated by ideal body weight and smoking status specifically to hit 1 to 5 mg/L, in 1,578 patients all taking an inhaled corticosteroid. The adjusted incidence rate ratio for exacerbations was 0.99 (95% CI 0.91 to 1.08). The mechanism is not thereby disproved; the clinical prediction drawn from it was tested and did not hold.',
        evidenceSource:
          'Ito K, Lim S, Caramori G, et al. Proc Natl Acad Sci U S A 2002;99:8921-8926; Devereux G et al., JAMA 2018;320:1548-1559',
        doi: '10.1073/pnas.132556899',
        inferredClaim:
          'That low-dose theophylline restores corticosteroid sensitivity to a degree that reduces exacerbations — a mechanism-derived prediction tested at the predicted concentration in 1,578 patients, with an incidence rate ratio of 0.99',
        auditFlag: 'verified',
      },
      {
        id: 'the-a3',
        category: 'measured',
        title: 'It matched a doubled steroid dose in 62 patients, without touching cortisol',
        laymanSummary:
          'A small trial in moderate asthma compared adding theophylline to a low steroid dose against simply doubling the steroid. The combination did slightly better on two lung-function measures, and unlike the doubled steroid it did not suppress the body’s own cortisol. The theophylline levels achieved were below the range the drug is supposed to need.',
        technicalDetails:
          'A double-blind, placebo-controlled trial randomised 62 patients with persistent asthma symptoms despite inhaled glucocorticoid to budesonide 400 micrograms twice daily plus theophylline 250 or 375 mg twice daily by body weight, or budesonide 800 micrograms twice daily, for three months. Both improved lung function and both sustained it. Compared with high-dose budesonide, low-dose budesonide plus theophylline produced greater improvements in forced vital capacity (P=0.03) and FEV1 (P=0.03). Reductions in beta-agonist use and in peak-flow variability were significant and similar in both arms. Serum cortisol fell in the high-dose budesonide group, from 18.4±2.4 to 15.9±2.1 micrograms per decilitre (P=0.02), and was unchanged in the theophylline group. The median serum theophylline concentration was 8.7 micrograms per millilitre, against a stated therapeutic range of 10 to 20.',
        evidenceSource:
          'Evans DJ, Taylor DA, Zetterstrom O, et al. N Engl J Med 1997;337:1412-1418',
        doi: '10.1056/NEJM199711133372002',
        measuredMetric:
          'FVC, FEV1, beta-agonist use, peak-flow variability and serum cortisol at three months, low-dose budesonide plus theophylline against doubled budesonide',
        auditFlag: 'caution',
      },
      {
        id: 'the-a4',
        category: 'failed',
        title: 'An antibiotic course can make a correct prescription lethal',
        laymanSummary:
          'Theophylline has a narrow gap between a helpful blood level and a dangerous one, and dozens of ordinary medicines and conditions move a person across it. The label lists the causes: some antibiotics, a fever lasting a day, heart failure, liver disease, being over sixty, and quitting smoking.',
        technicalDetails:
          'The label states that there are several readily identifiable causes of reduced theophylline clearance and that if the total daily dose is not appropriately reduced in their presence, severe and potentially fatal theophylline toxicity can occur. Named risk factors include neonates, children under 1, adults over 60, acute pulmonary oedema, congestive heart failure, cor pulmonale, fever of 102°F for 24 hours or more, hypothyroidism, cirrhosis and acute hepatitis, reduced renal function in infants under 3 months, sepsis with multi-organ failure, shock, and cessation of smoking. Drug interactions are handled in whole tables; the label singles out adding cimetidine, erythromycin or tacrine, or stopping carbamazepine or rifampin. Theophylline is to be used with extreme caution in active peptic ulcer disease, seizure disorders and cardiac arrhythmias. The label instructs withholding doses and measuring a serum concentration whenever nausea or repetitive vomiting occurs, even if another cause is suspected.',
        evidenceSource:
          'Theophylline anhydrous extended-release United States prescribing information — Warnings, Concurrent Illness and Conditions That Reduce Theophylline Clearance; Precautions, Drug Interactions',
        measuredMetric:
          'Documented causes of reduced theophylline clearance and their consequence for serum concentration',
        auditFlag: 'caution',
      },
      {
        id: 'the-a5',
        category: 'inferred',
        title: 'The label admits it does not know how the useful half works',
        laymanSummary:
          'The prescribing information says the mechanisms are not known with certainty. It attributes the airway-opening effect to blocking one enzyme, and then says the anti-inflammatory effect is probably something else entirely that it cannot name — while attributing the side effects to the two mechanisms it can.',
        technicalDetails:
          'The Mechanism of Action section states that theophylline has two distinct actions in the airways — smooth muscle relaxation and suppression of airway responsiveness — that the mechanisms are not known with certainty, that animal studies suggest bronchodilation is mediated by inhibition of phosphodiesterase III and to a lesser extent IV, and that the non-bronchodilator prophylactic actions are probably mediated through one or more different molecular mechanisms that do not involve PDE III inhibition or adenosine receptor antagonism. It then assigns hypotension, tachycardia, headache and emesis to PDE III inhibition and altered cerebral blood flow to adenosine antagonism. In other words the two mechanisms that are identified are the ones that produce harm, and the mechanism behind the prophylactic benefit is explicitly unnamed. That is a rare and honest statement to find in a mechanism-of-action section, and it is the context in which the histone deacetylase hypothesis was proposed as the missing piece.',
        evidenceSource:
          'Theophylline anhydrous extended-release United States prescribing information, Clinical Pharmacology — Mechanism of Action',
        inferredClaim:
          'That the anti-inflammatory action of theophylline is understood — the label says it is not, and names only the mechanisms responsible for the adverse effects',
        auditFlag: 'verified',
      },
      {
        id: 'the-a6',
        category: 'inferred',
        title: 'Its continued use worldwide is an argument about price, not about evidence',
        laymanSummary:
          'Theophylline remains one of the most widely used respiratory drugs on earth, and the reason is that it costs about a dollar a tablet and needs no inhaler. That is a real and serious argument. It is not the same argument as the drug being effective.',
        technicalDetails:
          'The CMS acquisition survey lists theophylline at a median US$1.05 per tablet across 30 generic presentations, against US$6.74 to US$11.73 per unit for the branded long-acting inhalers in this file. Against that: TWICS found an incidence rate ratio of 0.99 for exacerbations in 1,578 patients, and the label’s indication is limited to symptoms and reversible airflow obstruction rather than exacerbation prevention. The hidden cost is monitoring — serum concentrations, dose adjustment for a long list of conditions and drugs, and re-checking after any change — which is precisely the infrastructure least available in the settings where the price advantage matters most. Inferring effectiveness from persistence of use inverts the causation: the drug persists because it is affordable, and its affordability says nothing about what it does.',
        evidenceSource:
          'CMS National Average Drug Acquisition Cost (NADAC) 2026 file, prices effective 19 August 2026; Devereux G et al., JAMA 2018;320:1548-1559',
        doi: '10.1001/jama.2018.14432',
        inferredClaim:
          'That theophylline’s continued global use reflects demonstrated benefit — it substantially reflects an acquisition price of about a dollar per tablet and the absence of a device requirement',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed as an extended-release tablet',
        laymanDesc:
          'It is taken by mouth once or twice a day. No inhaler, no technique, no coordination — which is exactly why it is still used where inhalers are hard to get.',
        molecularDetail:
          'Theophylline anhydrous in an extended-release matrix, most often 200 to 400 mg once or twice daily. Absorption is complete; the constraint is not getting the drug in but keeping the serum concentration inside a narrow window.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The liver decides the blood level, and many things change its mind',
        laymanDesc:
          'How much drug ends up in the blood depends on an enzyme in the liver, and that enzyme is sped up by cigarette smoke and slowed down by fever, heart failure, liver disease, age and a long list of other medicines.',
        molecularDetail:
          'Clearance is predominantly hepatic via CYP1A2 with a contribution from CYP3A4, and it is the reason the label devotes tables to interactions. Tobacco smoke induces CYP1A2, so smoking cessation raises the serum concentration of an unchanged dose. Cimetidine, erythromycin and tacrine inhibit clearance; carbamazepine and rifampin induce it.',
        iconName: 'RefreshCw',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It blocks the enzyme that destroys the muscle’s relaxing signal',
        laymanDesc:
          'Airway muscle holds a messenger that tells it to relax, and an enzyme constantly breaks it down. Theophylline blocks that enzyme, so the messenger builds up and the airway opens.',
        molecularDetail:
          'The label attributes bronchodilation to inhibition of phosphodiesterase III and, to a lesser extent, phosphodiesterase IV, based on animal studies. PDE III is also expressed in cardiac and vascular smooth muscle, which is where hypotension and tachycardia come from — the same inhibition, in the wrong tissue.',
        iconName: 'Ban',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'It also blocks adenosine, which is where the jitteriness comes from',
        laymanDesc:
          'A second, separate action blocks adenosine receptors. That contributes to keeping the airway open and it is also why the drug feels like strong coffee, and why an overdose causes seizures.',
        molecularDetail:
          'Adenosine receptor antagonism is a mechanism theophylline shares with caffeine, its close structural relative. The label attributes alterations in cerebral blood flow to it. It also records that theophylline increases the force of contraction of diaphragmatic muscles through enhanced calcium uptake via an adenosine-mediated channel — a genuinely distinctive effect no inhaled drug has.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'At very low concentrations it does something different again',
        laymanDesc:
          'Well below the level needed to open an airway, theophylline reactivates an enzyme that steroids depend on to switch inflammatory genes off. This is the mechanism the 2018 trial was built around.',
        molecularDetail:
          'Ito and colleagues showed that low-dose theophylline enhances histone deacetylase activity in epithelial cells and macrophages, making it available for corticosteroid recruitment, at therapeutic concentrations and dissociated from both phosphodiesterase inhibition and adenosine antagonism. TWICS dosed to 1 to 5 mg/L specifically to exploit this.',
        iconName: 'Dna',
        visualStage: 'catalytic_action',
      },
      {
        step: 6,
        title: 'The airway opens, and the flare-up rate does not move',
        laymanDesc:
          'Symptoms and reversible obstruction improve, which is what the label claims. Adding it to a steroid inhaler to prevent flare-ups was tested in 1,578 people and the rates came out at 2.24 against 2.23 per year.',
        molecularDetail:
          'The indication is limited to symptoms and reversible airflow obstruction in chronic asthma and other chronic lung diseases. TWICS gave an adjusted incidence rate ratio of 0.99 (95% CI 0.91 to 1.08) for exacerbations, with more nausea (10.9% against 7.9%) and more gastrointestinal serious adverse events (2.7% against 1.3%) on theophylline.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'TWICS (ISRCTN27066620)',
        phase: 'Phase 4, pragmatic, randomised, double-blind, placebo-controlled, one year',
        sampleSize: 1578,
        primaryEndpoint:
          'Number of participant-reported moderate or severe COPD exacerbations treated with antibiotics, oral corticosteroids or both, over one year',
        endpointMet: false,
        statisticalPValue:
          'Mean 2.24 (95% CI 2.10 to 2.38) against 2.23 (2.09 to 2.37) exacerbations per year; unadjusted mean difference 0.01 (95% CI -0.19 to 0.21); adjusted incidence rate ratio 0.99 (95% CI 0.91 to 1.08)',
        unreportedAdverseSignals:
          'Nausea 10.9% against 7.9%, headache 9.0% against 7.9%, gastrointestinal serious adverse events 2.7% against 1.3%. A null efficacy result with a non-null harm profile is a net negative rather than a neutral one.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Evans 1997 — theophylline against doubled inhaled budesonide',
        phase: 'Randomised, double-blind, placebo-controlled, active comparator, three months',
        sampleSize: 62,
        primaryEndpoint:
          'Lung function, peak expiratory flow, symptoms and albuterol use, low-dose budesonide plus theophylline against doubled budesonide',
        endpointMet: true,
        statisticalPValue:
          'Greater improvement in FVC (P=0.03) and FEV1 (P=0.03) on the combination; serum cortisol fell from 18.4±2.4 to 15.9±2.1 micrograms per decilitre on doubled budesonide (P=0.02) and was unchanged on the combination',
        unreportedAdverseSignals:
          'Sixty-two patients over three months, with lung function rather than exacerbations as the endpoint. The effect was achieved at a median serum theophylline concentration of 8.7 micrograms per millilitre, below the stated therapeutic range of 10 to 20 — an observation that seeded two decades of low-dose theophylline research.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Adjusted incidence rate ratio 0.99 (95% CI 0.91 to 1.08) for COPD exacerbations with low-dose theophylline added to an inhaled corticosteroid in 1,578 patients',
        '2.24 against 2.23 exacerbations per patient per year across 3,430 events in TWICS',
        'Greater FVC and FEV1 improvement on low-dose budesonide plus theophylline than on doubled budesonide in 62 patients (P=0.03 for both)',
        'Serum cortisol falling from 18.4 to 15.9 micrograms per decilitre on doubled budesonide and unchanged on the theophylline combination',
        'Enhanced histone deacetylase activity in epithelial cells and macrophages at therapeutic concentrations, dissociated from phosphodiesterase inhibition and adenosine antagonism',
      ],
      unsupportedInferences: [
        'That low-dose theophylline reduces exacerbations by restoring corticosteroid sensitivity — the prediction was dosed precisely and tested in 1,578 people, and returned 0.99',
        'That the anti-inflammatory mechanism is understood, when the label states it is probably something other than the two mechanisms it can name',
        'That a 62-patient three-month lung-function trial establishes a steroid-sparing strategy',
        'That worldwide use reflects demonstrated benefit rather than an acquisition price of about a dollar a tablet and no device requirement',
      ],
      whatFailedInitially: [
        'TWICS found no reduction in exacerbations and more nausea and gastrointestinal serious adverse events',
        'The histone deacetylase hypothesis produced a clinical prediction that a purpose-built trial did not confirm',
        'The therapeutic index is narrow enough that fever, heart failure, quitting smoking or a course of erythromycin can push a stable patient into toxicity',
        'The label’s own mechanism section identifies the mechanisms behind the side effects and not the one behind the prophylactic benefit',
      ],
      realWorldOutcome: [
        'In respiratory use since the 1930s and among the most widely used respiratory drugs in the world, overwhelmingly outside high-income countries',
        'Displaced from first-line asthma and COPD care wherever inhaled treatment is available',
        'Its indication remains symptoms and reversible airflow obstruction, and has never extended to exacerbation prevention',
        'About a dollar a tablet, with a monitoring requirement that does not appear anywhere in that price',
      ],
    },
    deliverySystem: {
      type: 'Oral extended-release tablets and capsules, and an intravenous solution in dextrose for hospital use',
      description:
        'Taken once or twice daily. There is no inhaler and no technique to get wrong, which is the drug’s single practical advantage and the reason it survives in settings where devices are unaffordable or unavailable. The cost of that simplicity is that dosing is by serum concentration rather than by a fixed strength, and the correct dose changes when the patient’s circumstances do.',
      safetyProfile:
        'A narrow therapeutic index drug. Extreme caution in active peptic ulcer disease, seizure disorders and cardiac arrhythmias other than bradyarrhythmias. Numerous conditions reduce clearance and require dose reduction — neonates and children under 1, adults over 60, acute pulmonary oedema, congestive heart failure, cor pulmonale, sustained fever of 102°F, hypothyroidism, cirrhosis and acute hepatitis, sepsis with multi-organ failure, shock, and cessation of smoking. Interactions are extensive: adding cimetidine, erythromycin or tacrine, or stopping carbamazepine or rifampin, raises concentrations, and the label warns that severe and potentially fatal toxicity can follow if the dose is not reduced. Nausea or repetitive vomiting requires doses to be withheld and a serum concentration measured, even when another cause is suspected.',
    },
    commonQuestions: [
      {
        q: 'Is theophylline still worth taking?',
        a: 'It depends entirely on what the alternative is. If an inhaled corticosteroid and a long-acting bronchodilator are available and affordable, almost every comparison favours them: better bronchodilation delivered to the lung, no serum concentration to monitor, and no interaction cliff. If they are not available, theophylline is a real drug that genuinely opens airways for about a dollar a tablet. What it has not been shown to do is prevent exacerbations: TWICS tested that in 1,578 people and found 2.24 against 2.23 per year, incidence rate ratio 0.99.',
      },
      {
        q: 'Why does it need blood tests?',
        a: 'Because the gap between the concentration that helps and the concentration that harms is small, and a great many ordinary things move a person across it. The label lists them: being over sixty, a fever of 102°F lasting a day, heart failure, cirrhosis, hypothyroidism, sepsis — and stopping smoking, because tobacco smoke speeds up the liver enzyme that clears the drug. Adding cimetidine or erythromycin, or stopping carbamazepine or rifampin, does the same thing. The label states plainly that if the dose is not reduced in the presence of these factors, severe and potentially fatal toxicity can occur.',
        auditNote:
          'The most dangerous property of this drug is not the drug. It is the routine, well-intentioned prescription of something else alongside it.',
      },
      {
        q: 'What was the low-dose theophylline idea?',
        a: 'One of the more elegant hypotheses in respiratory medicine, and it did not survive its test. In 2002 a group showed that theophylline at concentrations far below the bronchodilator range reactivates histone deacetylase, the enzyme corticosteroids recruit in order to switch inflammatory genes off — and that this happens independently of the mechanisms that cause the side effects. The prediction was that a tiny, well-tolerated dose would make steroids work better. TWICS dosed 1,578 people precisely into that window, 1 to 5 mg/L, on top of their existing steroid inhaler, and found an incidence rate ratio of 0.99. The mechanism may still be real. The clinical claim built on it was tested and failed.',
      },
      {
        q: 'I get nausea on it. Does that matter?',
        a: 'Yes, and the label treats it as a warning sign rather than a nuisance. It instructs that whenever a patient on theophylline develops nausea or vomiting, particularly repetitive vomiting, or other signs consistent with toxicity — even if another cause may be suspected — additional doses should be withheld and a serum concentration measured. Vomiting often precedes the arrhythmias and seizures of serious toxicity. In TWICS, nausea was reported by 10.9% on theophylline against 7.9% on placebo, so at low concentrations most of it is not toxicity; the reason to check is that some of it is.',
      },
      {
        q: 'Is it the same as caffeine?',
        a: 'Chemically it is a very close relative — both are methylxanthines, differing in which nitrogens of the same ring carry methyl groups — and they share the adenosine-blocking mechanism that produces the jitteriness, the racing heart and, at high enough exposure, the seizures. They are not interchangeable: theophylline is a substantially more potent bronchodilator, and it is dosed and monitored as a drug with a narrow therapeutic index rather than consumed as a beverage. Coffee is not a treatment for asthma.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Devereux G, Cotton S, Fielding S, et al. Effect of Theophylline as Adjunct to Inhaled Corticosteroids on Exacerbations in Patients With COPD: A Randomized Clinical Trial. JAMA 2018;320:1548-1559',
        identifier: '10.1001/jama.2018.14432',
        kind: 'doi',
      },
      {
        label:
          'Ito K, Lim S, Caramori G, et al. A molecular mechanism of action of theophylline: induction of histone deacetylase activity to decrease inflammatory gene expression. Proc Natl Acad Sci U S A 2002;99:8921-8926',
        identifier: '10.1073/pnas.132556899',
        kind: 'doi',
      },
      {
        label:
          'Evans DJ, Taylor DA, Zetterstrom O, et al. A comparison of low-dose inhaled budesonide plus theophylline and high-dose inhaled budesonide for moderate asthma. N Engl J Med 1997;337:1412-1418',
        identifier: '10.1056/NEJM199711133372002',
        kind: 'doi',
      },
      {
        label: 'TWICS — theophylline with inhaled corticosteroids, registration record',
        identifier: 'https://www.isrctn.com/ISRCTN27066620',
        kind: 'url',
      },
      {
        label:
          'Theophylline anhydrous extended-release tablets United States prescribing information — Indications and Usage, Warnings (Concurrent Illness; Conditions That Reduce Theophylline Clearance; When Signs or Symptoms of Theophylline Toxicity Are Present), Precautions (Drug Interactions), Clinical Pharmacology (Mechanism of Action)',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22theophylline%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 2153 — theophylline structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2153',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 10. Mometasone — the steroid whose receptor-affinity ranking is quoted everywhere, and whose
  //     own label says the clinical significance of that ranking is unknown.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'mometasone',
    name: 'Mometasone',
    tradeName: 'Asmanex Twisthaler / Asmanex HFA / Nasonex / Elocon / Sinuva',
    sponsor:
      'Organon (spun out of Merck; the molecule originated at Schering-Plough, which Merck acquired in 2009)',
    targetGene: 'NR3C1',
    targetProtein: 'Glucocorticoid receptor (nuclear receptor subfamily 3 group C member 1)',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1987,
    indication:
      'Inhalation powder and aerosol: maintenance treatment of asthma as prophylactic therapy from age 5, not for relief of acute bronchospasm. Nasal spray: prophylaxis of seasonal allergic rhinitis from age 12, treatment of seasonal and perennial allergic rhinitis, and treatment of chronic rhinosinusitis with nasal polyps in adults. Also a topical cream, ointment and lotion for corticosteroid-responsive dermatoses, and a sinus implant for recurrent nasal polyps.',
    patientFriendlyIndication:
      'A steroid that comes as an asthma inhaler, a hay-fever nasal spray, a skin cream and a sinus implant',
    anatomicalSite:
      'Airway epithelium and submucosal inflammatory cells (inhaled); nasal and sinus mucosa (spray and implant); epidermis and dermis (topical)',
    conditionContext: {
      conditionExplainer:
        'Corticosteroids work by entering a cell, binding a receptor in the cytoplasm and carrying it into the nucleus, where the pair switches inflammatory genes off and anti-inflammatory ones on. Every steroid in this file does that. What separates them is how tightly they bind the receptor, how much escapes into the bloodstream, and how fast the liver destroys what does.',
      whyItMatters:
        'Mometasone furoate was designed around the second and third of those. Its systemic availability is very low, and the clearest demonstration of that is a one-year growth study in children which found nothing — published in the same issue of the same journal as a study of another intranasal steroid which found 0.9 cm.',
      whoTakesThis:
        'People with persistent asthma from age 5, people with allergic rhinitis or nasal polyps, and people with inflammatory skin disease — four different products with four different exposure profiles that should not be reasoned about interchangeably.',
      clinicalGoals:
        'Control of inflammation with as little systemic steroid effect as possible. The inhaled product still carries warnings for growth effects, adrenal suppression, glaucoma and cataracts; the nasal product carries a negative growth trial.',
    },
    oneSentenceVerdict:
      'A corticosteroid the label describes as binding the human glucocorticoid receptor about 12 times as tightly as dexamethasone and 1.5 times as tightly as fluticasone — while stating that the clinical significance of those ratios is unknown; its nasal spray produced no growth suppression in a one-year randomised trial in 98 children, and adding formoterol to it in 11,729 patients gave a serious-asthma-event hazard ratio of 1.22 (95% CI 0.76 to 1.94) with 11% fewer exacerbations.',
    laymanHowItWorks:
      'Mometasone crosses into the cells lining the airway or the nose, binds a receptor there and carries it into the nucleus, where it switches off the genes that produce inflammatory signals. It is built to stay where it is put: what escapes into the bloodstream is very small, and most of what is swallowed is destroyed by the liver before it circulates. That is why a year of the nasal spray did not slow children’s growth — and it is not a guarantee for the inhaler, which delivers more drug and still carries a growth warning.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 80,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.7141 per millilitre, the median across 28 listed products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'The nasal spray and the topical preparations are generic across 28 listed presentations, at about seventy cents a millilitre. The inhaled asthma products and the sinus implant are not. This is the same split that runs through the file: the molecule is free, and the delivery system is where the value has migrated — a dry-powder Twisthaler, a pressurised aerosol, and a bioabsorbable implant placed inside a sinus are three separate pieces of engineering carrying three separate sets of protection.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The inhaled and intranasal corticosteroids all act on the same receptor and the head-to-head differences between them are small next to the difference between taking one and not taking one. Where mometasone has a real and specific claim is systemic exposure in children using a nasal spray, and that claim rests on a trial designed and sized exactly like the one that detected suppression with a competitor.',
      conventionalRx: [
        {
          name: 'Fluticasone propionate (Flovent, Flonase)',
          class: 'Inhaled and intranasal corticosteroid',
          howItCompares:
            'The comparator the mometasone label names directly: mometasone furoate binds the human glucocorticoid receptor about 1.5 times as tightly as fluticasone in vitro, with clinical significance stated as unknown. Both are available as nasal sprays and inhalers, and fluticasone is generic in more presentations.',
          typicalCost:
            'US$0.6920 per millilitre at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: cheaper per millilitre, very widely available, decades of use in both routes. Cons: a documented interaction with ritonavir and other strong CYP3A4 inhibitors that can cause Cushing syndrome, which applies to mometasone as well.',
        },
        {
          name: 'Budesonide (Pulmicort, Rhinocort)',
          class: 'Inhaled and intranasal corticosteroid',
          howItCompares:
            'About a fifth of mometasone’s in-vitro receptor affinity by the label’s own ranking, and the only inhaled steroid with a measured final-adult-height outcome — 1.2 cm lower in the children followed from the CAMP trial into adulthood.',
          typicalCost:
            'US$0.7198 per millilitre at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: nebuliser suspension for young children, on the WHO Model List of Essential Medicines, the best long-term growth data of any steroid here. Cons: those data are the reason we know the growth cost is permanent.',
        },
        {
          name: 'Beclometasone dipropionate (Qvar, Beconase)',
          class: 'Inhaled and intranasal corticosteroid',
          howItCompares:
            'The intranasal steroid that did suppress growth: 5.0 cm against 5.9 cm over a year in 100 children, in a study published alongside the mometasone one. That pair is the clearest evidence in this file that these drugs are not interchangeable on systemic exposure.',
          typicalCost:
            'US$30.24 per gram at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: extrafine formulations reach the small airways. Cons: the intranasal growth finding, and no cheaper.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Rinse and spit after every inhaled dose',
          action:
            'Rinse the mouth with water and spit it out — do not swallow — after each inhalation.',
          patientImpact:
            'The label states that Candida albicans infection of the mouth and throat may occur, asks for periodic monitoring of the oral cavity, and gives this instruction directly.',
          clinicalPrecaution:
            'Rinsing removes the drug deposited on the mouth and throat. It does not reduce the dose reaching the lung, so it costs nothing in effect.',
        },
        {
          name: 'Ask about ritonavir and other strong CYP3A4 inhibitors',
          action:
            'List every medicine, including antiretrovirals and antifungals, before starting an inhaled or intranasal steroid.',
          patientImpact:
            'The label warns that strong cytochrome P450 3A4 inhibitors such as ritonavir raise systemic corticosteroid effects and asks for caution. This is the route by which an inhaled steroid can cause full Cushing syndrome.',
          clinicalPrecaution:
            'The interaction defeats the design of the drug. Mometasone’s low systemic exposure depends on rapid hepatic destruction of what is absorbed; blocking the enzyme that does the destroying removes the safety margin.',
        },
        {
          name: 'Have a child on an inhaled steroid measured routinely',
          action:
            'Ask for height to be recorded at each review, with a stadiometer rather than a wall mark.',
          patientImpact:
            'The inhaled label carries growth effects in paediatric patients as a specific Warnings and Precautions entry. The reassuring one-year growth study was of the nasal spray, not the inhaler.',
          clinicalPrecaution:
            'Growth velocity is the earliest measurable systemic effect of an inhaled steroid and it is detectable within a month or two. It is only detectable if someone measures.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'C[C@@H]1C[C@H]2[C@@H]3CCC4=CC(=O)C=C[C@@]4([C@]3([C@H](C[C@@]2([C@]1(C(=O)CCl)O)C)O)Cl)C',
      chemicalFormula: 'C22H28Cl2O4',
      molecularWeight: '427.40 g/mol',
      targetReceptorAffinity:
        'The label states that mometasone furoate has been shown in vitro to exhibit a binding affinity for the human glucocorticoid receptor approximately 12 times that of dexamethasone, 7 times that of triamcinolone acetonide, 5 times that of budesonide and 1.5 times that of fluticasone — and then states that the clinical significance of these findings is unknown. It also states that the precise mechanism of corticosteroid action in asthma is not known, and attributes efficacy to inhibitory effects across mast cells, eosinophils, neutrophils, macrophages and lymphocytes and across histamine, eicosanoids, leukotrienes and cytokines.',
      structureSource: {
        label: 'PubChem CID 441335 (mometasone) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/441335',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'mom-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity of the 9,21-dichloro pregnadiene core',
          description:
            'Confirm both chlorine substitutions and the 16-alpha methyl group before esterification. The two chlorines are what distinguish mometasone from the fluorinated steroids around it, and the 17-furoate ester added later is what makes it a topical drug rather than a systemic one.',
          reagentsAndBuffer:
            'Mometasone furoate reference standard, reversed-phase HPLC with ultraviolet detection at 248 nm, 1H and 13C NMR in DMSO-d6, elemental chlorine analysis, loss on drying',
        },
        {
          id: 'mom-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Esterification of the 17-hydroxyl with furoic acid',
          description:
            'Acylate the 17-alpha hydroxyl with 2-furoyl chloride. This is the step that defines the drug: the bulky furoate ester raises receptor affinity and lipophilicity, and it is hydrolysed and cleared rapidly once the molecule reaches the liver, which is the whole basis of the low systemic exposure claim.',
          dependsOnStepId: 'mom-w1',
          reagentsAndBuffer:
            '2-furoyl chloride, triethylamine or pyridine base, anhydrous dichloromethane or tetrahydrofuran, 4-dimethylaminopyridine catalyst, nitrogen atmosphere',
        },
        {
          id: 'mom-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation of the monohydrate and control of the 21-desloro impurity',
          description:
            'Crystallise the appropriate hydrate for the intended product and assay for dehalogenated and de-esterified degradants. The nasal spray is an aqueous suspension of the monohydrate and the inhalation powder is the anhydrous form; these are different solids with different dissolution behaviour and are not interchangeable in formulation.',
          dependsOnStepId: 'mom-w2',
          reagentsAndBuffer:
            'Acetone or ethanol and water crystallisation, controlled-humidity conditioning, X-ray powder diffraction and differential scanning calorimetry, HPLC purity with identified impurity limits, laser diffraction particle sizing',
        },
        {
          id: 'mom-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Glucocorticoid receptor translocation and reporter activation',
          description:
            'Dose cells expressing the human glucocorticoid receptor and follow translocation to the nucleus and activation of a glucocorticoid response element reporter, with dexamethasone run in parallel. The parallel arm is essential: every affinity ratio quoted for these drugs is a ratio to something else, and a number without its comparator on the same plate means nothing.',
          dependsOnStepId: 'mom-w3',
          reagentsAndBuffer:
            'A549 or human bronchial epithelial cells, charcoal-stripped fetal bovine serum to remove endogenous steroid, GRE-luciferase reporter construct, dexamethasone, budesonide and fluticasone propionate as parallel references, mifepristone as receptor antagonist control',
        },
        {
          id: 'mom-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Receptor affinity ranking with hepatic clearance measured alongside',
          description:
            'Report the competition binding constant together with intrinsic clearance in human hepatocytes. Affinity alone predicts topical potency and nothing about systemic safety; the reason mometasone furoate has an unusual safety profile is what the liver does to it after absorption, and an affinity ranking published without that half is the exact number the label refuses to interpret.',
          dependsOnStepId: 'mom-w4',
          reagentsAndBuffer:
            'Tritiated dexamethasone competition binding on cytosolic glucocorticoid receptor preparations, cryopreserved human hepatocyte incubations with LC-MS/MS quantification, human plasma protein binding by equilibrium dialysis',
        },
      ],
    },
    keyAudits: [
      {
        id: 'mom-a1',
        category: 'measured',
        title: 'A one-year growth trial in children found nothing — and it was built to find it',
        laymanSummary:
          'Ninety-eight children aged 3 to 9 with year-round hay fever were given mometasone nasal spray or placebo for a full year, with height measured on a calibrated stadiometer seven times. They grew the same. Adrenal function testing showed no suppression either.',
        technicalDetails:
          'A randomised, placebo-controlled, double-blind, multicentre trial randomised 98 prepubertal children aged 3 to 9 with perennial allergic rhinitis to mometasone furoate aqueous nasal spray 100 micrograms once daily or placebo for one year, with baseline height between the 5th and 95th percentile and skeletal age within two years of chronological age. Eighty-two completed, 42 on drug and 40 on placebo, with 93% achieving at least 80% compliance. The primary safety variable was change in standing height. No growth suppression was seen; change in height at one year was 6.95 cm on mometasone against 6.35 cm on placebo, and growth rate averaged across all time points was 0.018 cm per day in both groups. Cosyntropin stimulation testing at baseline, 26 and 52 weeks showed no evidence of hypothalamic-pituitary-adrenal axis suppression at any time point. Treatment-related adverse events were 16% on drug against 22% on placebo.',
        evidenceSource: 'Schenkel EJ, Skoner DP, Bronsky EA, et al. Pediatrics 2000;105:E22',
        doi: '10.1542/peds.105.2.e22',
        measuredMetric:
          'Change in standing height and growth rate over one year, and cosyntropin-stimulated cortisol response',
        auditFlag: 'verified',
      },
      {
        id: 'mom-a2',
        category: 'measured',
        title: 'The same journal issue carried the opposite result for another nasal steroid',
        laymanSummary:
          'The mometasone growth study is convincing because of what was published next to it. In the same issue of the same journal, a study of almost identical design found that intranasal beclometasone slowed growth: 5.0 cm against 5.9 cm over a year.',
        technicalDetails:
          'Skoner and colleagues randomised 100 prepubertal children aged 6 to 9 with perennial allergic rhinitis to aqueous beclometasone dipropionate 168 micrograms twice daily (n=51) or placebo (n=49) for one year, with the same entry criteria on height percentile and skeletal age and the same primary parameter, rate of change in standing height. Ninety completed. Overall growth rate was significantly slower on beclometasone in both the intention-to-treat and completer analyses; mean change in standing height at one year was 5.0 cm against 5.9 cm. The difference was evident by the one-month visit and was consistent across age and sex subgroups and across children with and without prior corticosteroid use. A z-score analysis normalising to national height data confirmed the difference was attributable to treatment rather than to a baseline imbalance. No between-group difference was found in hypothalamic-pituitary-adrenal axis assessments. A negative safety trial is only as good as the ability of that design to detect an effect, and the sibling study demonstrates the design detects 0.9 cm.',
        evidenceSource: 'Skoner DP, Rachelefsky GS, Meltzer EO, et al. Pediatrics 2000;105:E23',
        doi: '10.1542/peds.105.2.e23',
        measuredMetric:
          'Rate of change in standing height over one year in a study of matched design and size',
        auditFlag: 'verified',
      },
      {
        id: 'mom-a3',
        category: 'inferred',
        title: 'The receptor-affinity ranking is quoted constantly and disclaimed by its own label',
        laymanSummary:
          'Mometasone is routinely described as the most potent inhaled steroid, on the basis that it binds the receptor twelve times as tightly as dexamethasone and one and a half times as tightly as fluticasone. The sentence immediately after those numbers in the prescribing information says the clinical significance is unknown.',
        technicalDetails:
          'The Mechanism of Action section states the in-vitro binding affinity for the human glucocorticoid receptor as approximately 12 times dexamethasone, 7 times triamcinolone acetonide, 5 times budesonide and 1.5 times fluticasone, and immediately adds that the clinical significance of these findings is unknown. It also states that the precise mechanism of corticosteroid action in asthma is not known. Receptor affinity governs topical potency at the site of deposition; it says nothing about how much drug is deposited, how much is absorbed, or how quickly the liver removes what is. A drug can bind five times more tightly than budesonide and be dosed at a similar microgram strength, which is exactly the situation here, and that is why the ratio does not translate into a clinical ranking.',
        evidenceSource:
          'ASMANEX (mometasone furoate) United States prescribing information, Clinical Pharmacology 12.1',
        inferredClaim:
          'That a 12-fold in-vitro receptor affinity over dexamethasone makes mometasone a proportionally more effective or more dangerous steroid in patients — a translation the label explicitly declines to make',
        auditFlag: 'caution',
      },
      {
        id: 'mom-a4',
        category: 'measured',
        title:
          'SPIRO: 11,729 patients, no excess of serious asthma events, 11% fewer exacerbations',
        laymanSummary:
          'One of the four safety trials the FDA demanded after the long-acting beta-agonist deaths. Adding formoterol to mometasone in nearly twelve thousand people produced 45 serious asthma events against 36 — all hospitalisations, none fatal — and about a tenth fewer exacerbations.',
        technicalDetails:
          'SPIRO was a 26-week randomised, double-blind trial in adolescents and adults aged 12 and over with persistent asthma across 35 countries, with the primary objective of determining whether mometasone furoate-formoterol increases the risk of serious asthma outcomes — adjudicated hospitalisation, intubation or death — compared with mometasone furoate alone. Among 11,729 patients (5,868 on combination, 5,861 on mometasone alone) there were 81 serious asthma outcomes in 71 patients, every one an asthma-related hospitalisation: 45 events in 39 patients on combination against 36 events in 32 patients on mometasone alone. The hazard ratio for the first serious asthma outcome was 1.22 (95% CI 0.76 to 1.94, P=0.411). Asthma exacerbation occurred in 1,487 patients, 708 against 779, hazard ratio 0.89 (95% CI 0.80 to 0.98, P=0.021).',
        evidenceSource:
          'Weinstein CLJ, Ryan N, Shekar T, et al. J Allergy Clin Immunol 2019;143:1395-1402 (SPIRO, NCT01471340)',
        doi: '10.1016/j.jaci.2018.10.065',
        measuredMetric:
          'Time to first adjudicated serious asthma outcome and to first asthma exacerbation over 26 weeks',
        auditFlag: 'verified',
      },
      {
        id: 'mom-a5',
        category: 'conclusion_shift',
        title: 'The regulator acted on this trial more than a year before it was published',
        laymanSummary:
          'The boxed warning came off the combination inhalers in December 2017. The combined analysis of the four trials appeared in June 2018, and this particular trial appeared in a journal in 2019. The decision and the published evidence for it did not arrive in that order.',
        technicalDetails:
          'SPIRO was one of the four FDA-mandated long-acting beta-agonist safety trials. The FDA removed the boxed warning from inhaled corticosteroid and long-acting beta-agonist combination products in December 2017. The joint oversight committee’s combined analysis of all four trials in 36,010 patients was published in the New England Journal of Medicine on 28 June 2018, and SPIRO itself was published in the Journal of Allergy and Clinical Immunology in its 2019;143:1395-1402 issue. Regulators see trial data before journals do, and that is normal and correct. It is worth stating plainly because a reader tracing the evidence for the withdrawal through the published literature will find the papers dated after the decision, and may reasonably wonder which came first.',
        evidenceSource:
          'Weinstein CLJ et al., J Allergy Clin Immunol 2019;143:1395-1402; Busse WW, Bateman ED, Caplan AL, et al. N Engl J Med 2018;378:2497-2505',
        doi: '10.1056/NEJMoa1716868',
        inferredClaim:
          'That the published literature is the record on which the 2017 boxed-warning withdrawal was based — the constituent trials were published in 2018 and 2019, after the decision',
        auditFlag: 'verified',
      },
      {
        id: 'mom-a6',
        category: 'failed',
        title: 'A negative nasal growth trial does not clear the inhaler',
        laymanSummary:
          'The reassuring growth result was for the nasal spray at 100 micrograms once a day. The asthma inhaler delivers more drug into a larger absorbing surface, and its label still carries warnings for growth effects in children, adrenal suppression, glaucoma and cataracts.',
        technicalDetails:
          'The ASMANEX inhaled label lists, under Adverse Reactions, systemic and local corticosteroid effects including Candida albicans infection, immunosuppression, hypercorticism and adrenal suppression, growth effects in paediatric patients, and glaucoma and cataracts, each cross-referenced to its own Warnings and Precautions entry. Hypercorticism and adrenal suppression are stated to occur with very high dosages or at regular dosage in susceptible individuals, with instructions to discontinue slowly if they do. Strong CYP3A4 inhibitors such as ritonavir raise systemic corticosteroid effects. The nasal growth trial randomised 98 children to 100 micrograms once daily intranasally; extrapolating it to a twice-daily inhaled product with a different deposition site and a different absorbed fraction is a route change, not a dose comparison, and the label does not make that extrapolation.',
        evidenceSource:
          'ASMANEX (mometasone furoate) United States prescribing information, Warnings and Precautions 5.1 to 5.11 and Adverse Reactions 6; Schenkel EJ et al., Pediatrics 2000;105:E22',
        doi: '10.1542/peds.105.2.e22',
        measuredMetric:
          'Labelled systemic corticosteroid warnings for the inhaled product against the route and dose studied in the negative growth trial',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Delivered to one surface and meant to stay there',
        laymanDesc:
          'Four products, four surfaces: a dry powder or aerosol into the lung, a spray into the nose, a cream onto skin, an implant into a sinus. The design goal in every case is to treat that surface and go no further.',
        molecularDetail:
          'Mometasone furoate as inhalation powder in the Twisthaler, as a pressurised HFA aerosol, as an aqueous nasal suspension of the monohydrate, as topical cream, ointment and lotion, and as a bioabsorbable steroid-eluting sinus implant. Each has a different deposited dose and a different absorbing surface, and the safety data from one do not transfer to another.',
        iconName: 'Wind',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The furoate ester makes it lipophilic and short-lived in blood',
        laymanDesc:
          'A bulky chemical group attached to the steroid makes it stick in tissue and makes the liver destroy it quickly if it reaches the bloodstream. That combination is the whole design.',
        molecularDetail:
          'The 17-furoate ester raises lipophilicity and receptor affinity and is a substrate for rapid hepatic metabolism. Systemic bioavailability of the intranasal product is negligible, which is what the one-year paediatric growth and cosyntropin data demonstrate rather than assert.',
        iconName: 'Lock',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It binds the glucocorticoid receptor very tightly',
        laymanDesc:
          'Inside the cell it binds a receptor that normally sits waiting in the cytoplasm. It binds it more tightly than most other steroids — although the label declines to say what that means for a patient.',
        molecularDetail:
          'In-vitro binding affinity for the human glucocorticoid receptor of approximately 12 times dexamethasone, 7 times triamcinolone acetonide, 5 times budesonide and 1.5 times fluticasone, with clinical significance stated as unknown.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The receptor carries it into the nucleus and rewrites transcription',
        laymanDesc:
          'The pair moves into the nucleus and switches inflammatory genes off. That is why a steroid takes days to work and why it is useless during an attack.',
        molecularDetail:
          'Activated receptor dimers bind glucocorticoid response elements to transactivate anti-inflammatory genes and, more importantly here, tether to and repress pro-inflammatory transcription factors. The label states that the precise mechanism of corticosteroid action on asthma is not known and describes inhibitory effects across mast cells, eosinophils, neutrophils, macrophages and lymphocytes.',
        iconName: 'Dna',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Inflammation subsides over days',
        laymanDesc:
          'The airway lining or the nasal lining becomes less swollen, less twitchy and produces less mucus. Adding a long-acting beta-agonist to it cut exacerbations by about a tenth in nearly twelve thousand people.',
        molecularDetail:
          'In SPIRO, asthma exacerbation occurred in 708 of 5,868 on mometasone-formoterol against 779 of 5,861 on mometasone alone, hazard ratio 0.89 (95% CI 0.80 to 0.98, P=0.021), with a serious-asthma-outcome hazard ratio of 1.22 (95% CI 0.76 to 1.94, P=0.411).',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What escapes is small but not zero',
        laymanDesc:
          'A year of the nasal spray did not slow children’s growth. The inhaler is a different exposure, and its label still warns about growth, adrenal suppression, glaucoma and cataracts.',
        molecularDetail:
          'The intranasal growth study found 6.95 cm against 6.35 cm at one year with no cosyntropin-detectable adrenal suppression. The inhaled label lists growth effects in paediatric patients, hypercorticism and adrenal suppression, and glaucoma and cataracts as Warnings and Precautions, and flags strong CYP3A4 inhibitors as raising systemic corticosteroid effects.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'SPIRO (NCT01471340)',
        phase: 'Phase 4, randomised, double-blind, FDA-mandated safety trial, 26 weeks',
        sampleSize: 11729,
        primaryEndpoint:
          'Risk of adjudicated serious asthma outcome — hospitalisation, intubation or death — with mometasone furoate-formoterol against mometasone furoate alone',
        endpointMet: true,
        statisticalPValue:
          'Hazard ratio 1.22 (95% CI 0.76 to 1.94, P=0.411) for first serious asthma outcome; 45 events in 39 patients against 36 events in 32 patients, all hospitalisations',
        unreportedAdverseSignals:
          'The point estimate is above 1 and the trial is a noninferiority design, so the finding is the absence of a demonstrated excess rather than a demonstrated equivalence. Every serious asthma outcome in the trial was a hospitalisation; there were no intubations and no deaths.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Schenkel 2000 — one-year intranasal growth study in children',
        phase: 'Randomised, double-blind, placebo-controlled, multicentre, 52 weeks',
        sampleSize: 98,
        primaryEndpoint:
          'Change in standing height over one year in prepubertal children aged 3 to 9 with perennial allergic rhinitis',
        endpointMet: true,
        statisticalPValue:
          'No growth suppression: 6.95 cm against 6.35 cm at one year, growth rate 0.018 cm per day in both groups; no HPA-axis suppression on cosyntropin testing at 26 or 52 weeks',
        unreportedAdverseSignals:
          '82 of 98 completed. A negative safety finding in 82 children is only interpretable alongside the matched study of another intranasal steroid, which detected a 0.9 cm difference at a similar size.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Skoner 2000 — the matched intranasal beclometasone growth study',
        phase: 'Randomised, double-blind, parallel-group, placebo-controlled, 52 weeks',
        sampleSize: 100,
        primaryEndpoint:
          'Rate of change in standing height over one year in prepubertal children aged 6 to 9 with perennial allergic rhinitis',
        endpointMet: true,
        statisticalPValue:
          'Growth rate significantly slower on beclometasone in both intention-to-treat and completer analyses; mean change in standing height 5.0 cm against 5.9 cm at one year',
        unreportedAdverseSignals:
          'There was a statistically significant baseline imbalance in standing height, handled by analysis of covariance and a z-score normalisation. No hypothalamic-pituitary-adrenal axis difference was detected, so a normal cortisol test does not exclude a growth effect.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'No growth suppression over one year in 98 randomised children on intranasal mometasone: 6.95 cm against 6.35 cm',
        'No cosyntropin-detectable adrenal suppression at 26 or 52 weeks in the same trial',
        'A hazard ratio of 1.22 (95% CI 0.76 to 1.94) for serious asthma outcomes and 0.89 (0.80 to 0.98) for exacerbations in 11,729 patients',
        'In-vitro glucocorticoid receptor affinity of approximately 12 times dexamethasone and 1.5 times fluticasone',
        'A 0.9 cm one-year growth difference detected by a matched-design study of a different intranasal steroid',
      ],
      unsupportedInferences: [
        'That the 12-fold receptor affinity over dexamethasone translates into proportionally greater clinical potency — the label states the significance is unknown',
        'That the negative intranasal growth trial clears the inhaled product, which has a different route, dose and absorbing surface',
        'That a normal cortisol stimulation test excludes a systemic steroid effect, when the beclometasone study found growth suppression with no HPA-axis difference',
        'That the published SPIRO paper is the evidence the 2017 boxed-warning withdrawal rested on, when it appeared in 2019',
      ],
      whatFailedInitially: [
        'The serious-asthma-outcome point estimate in SPIRO was 1.22, above unity, in a design that can only show absence of a demonstrated excess',
        'The inhaled label still carries growth effects, adrenal suppression, glaucoma and cataracts as specific warnings',
        'Strong CYP3A4 inhibitors defeat the low-systemic-exposure design that the whole safety argument rests on',
        'Hypothalamic-pituitary-adrenal axis testing failed to detect the growth effect that the matched beclometasone study measured directly',
      ],
      realWorldOutcome: [
        'One molecule across an inhaler, a nasal spray, a skin cream and a bioabsorbable sinus implant, with four different exposure profiles',
        'The nasal and topical forms are generic across 28 listed presentations; the inhaled and implanted forms are not',
        'One of the four FDA-mandated long-acting beta-agonist safety trials was run on its combination product',
        'The paired 2000 growth studies remain the cleanest demonstration in this field that intranasal steroids are not interchangeable',
      ],
    },
    deliverySystem: {
      type: 'Inhalation powder (Twisthaler) and pressurised HFA aerosol, aqueous nasal spray, topical cream, ointment and lotion, and a bioabsorbable sinus implant',
      description:
        'The inhaled products are maintenance treatment only and are explicitly not for relief of acute bronchospasm. The nasal spray is used once daily. The four routes are separate products with separate evidence, and the most common error made about this drug is treating a safety finding from one route as though it applied to another.',
      safetyProfile:
        'Not for relief of acute symptoms; rapidly deteriorating asthma requires immediate re-evaluation. Candida albicans infection of the mouth and throat may occur, with periodic monitoring advised and rinsing and spitting after each dose. Immunosuppression with potential worsening of tuberculosis and of fungal, bacterial, viral, parasitic and ocular herpes simplex infection, and a more serious or fatal course of chickenpox or measles in susceptible patients. Risk of impaired adrenal function when transferring from systemic corticosteroids, requiring slow weaning. Hypercorticism and adrenal suppression at very high dosages or at regular dosage in susceptible individuals. Strong CYP3A4 inhibitors such as ritonavir increase systemic corticosteroid effects. Paradoxical bronchospasm requires discontinuation. Growth effects in paediatric patients, and glaucoma and cataracts, are separately labelled. The most common adverse reactions at 3% or more were nasopharyngitis, headache, sinusitis, bronchitis and influenza.',
    },
    commonQuestions: [
      {
        q: 'Will a steroid nasal spray stunt my child’s growth?',
        a: 'For mometasone specifically, a one-year randomised trial says no, and the reason that answer is trustworthy is what was published beside it. Ninety-eight children aged 3 to 9 were randomised to mometasone nasal spray or placebo for a year with height measured seven times on a calibrated stadiometer; they grew 6.95 cm against 6.35 cm, and adrenal function testing was normal throughout. In the same issue of the same journal, an almost identically designed study of intranasal beclometasone in 100 children found 5.0 cm against 5.9 cm. A negative result is only as good as the design’s ability to find a positive one, and that design found 0.9 cm.',
        auditNote:
          'This does not transfer to the asthma inhaler, which delivers more drug to a larger absorbing surface and still carries a paediatric growth warning on its label.',
      },
      {
        q: 'Is mometasone the strongest inhaled steroid?',
        a: 'It binds the receptor most tightly of the ones its label compares it against — about 12 times dexamethasone, 7 times triamcinolone, 5 times budesonide and 1.5 times fluticasone. The next sentence of that label says the clinical significance of these findings is unknown, and that sentence is doing real work. Receptor affinity determines potency at the surface where the drug lands. It says nothing about how much lands there, how much crosses into the blood, or how fast the liver removes what does — and those are the things that decide both how well a steroid works and how much harm it does.',
      },
      {
        q: 'Why is the same drug sold as an inhaler, a spray, a cream and an implant?',
        a: 'Because the molecule suits being kept where it is put: a bulky furoate ester makes it lipophilic enough to stay in tissue, and it is destroyed quickly by the liver if it gets into the bloodstream. That profile is useful anywhere you want a strong local steroid effect without a systemic one — airway, nose, skin, sinus. The important consequence is that these are four different products with four different absorbed doses. Evidence about one of them is not evidence about the others, and this page keeps them apart.',
      },
      {
        q: 'Is adding formoterol to it safe?',
        a: 'On the largest evidence available, yes, with a caveat about what the trial could show. SPIRO randomised 11,729 people to mometasone with formoterol or mometasone alone for 26 weeks. Serious asthma outcomes — all of them hospitalisations, with no intubations and no deaths — were 45 events in 39 patients against 36 in 32, hazard ratio 1.22 with a confidence interval of 0.76 to 1.94. Exacerbations were 11% less likely on the combination, hazard ratio 0.89 (0.80 to 0.98, p=0.021). A confidence interval that spans 1 with a point estimate above it demonstrates the absence of a proven excess, which is not the same as proving there is none. That is what a noninferiority trial is designed to deliver.',
      },
      {
        q: 'Does a normal cortisol test mean the steroid is not affecting me?',
        a: 'Not reliably, and the paired 2000 studies are the reason to say so. In the beclometasone trial, children grew measurably more slowly on the drug — 5.0 cm against 5.9 cm over a year — and there was no significant between-group difference in the hypothalamic-pituitary-adrenal axis assessments. Growth velocity turned out to be the more sensitive measure. If a child is on an inhaled or intranasal steroid, having their height recorded properly at each review is worth more than a cortisol test.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Schenkel EJ, Skoner DP, Bronsky EA, et al. Absence of growth retardation in children with perennial allergic rhinitis after one year of treatment with mometasone furoate aqueous nasal spray. Pediatrics 2000;105:E22',
        identifier: '10.1542/peds.105.2.e22',
        kind: 'doi',
      },
      {
        label:
          'Skoner DP, Rachelefsky GS, Meltzer EO, et al. Detection of growth suppression in children during treatment with intranasal beclomethasone dipropionate. Pediatrics 2000;105:E23',
        identifier: '10.1542/peds.105.2.e23',
        kind: 'doi',
      },
      {
        label:
          'Weinstein CLJ, Ryan N, Shekar T, et al. Serious asthma events with mometasone furoate plus formoterol compared with mometasone furoate. J Allergy Clin Immunol 2019;143:1395-1402',
        identifier: '10.1016/j.jaci.2018.10.065',
        kind: 'doi',
      },
      {
        label:
          'Busse WW, Bateman ED, Caplan AL, et al. Combined Analysis of Asthma Safety Trials of Long-Acting beta2-Agonists. N Engl J Med 2018;378:2497-2505',
        identifier: '10.1056/NEJMoa1716868',
        kind: 'doi',
      },
      {
        label: 'SPIRO — the FDA-mandated mometasone furoate-formoterol safety trial',
        identifier: 'NCT01471340',
        kind: 'nct',
      },
      {
        label:
          'ASMANEX (mometasone furoate) United States prescribing information — Indications and Limitations of Use, Warnings and Precautions 5.1 to 5.11, Adverse Reactions 6.1, Clinical Pharmacology 12.1',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22ASMANEX%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 441335 — mometasone structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/441335',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 11. Fluticasone — the most-prescribed inhaled steroid in the world, responsible for 30 of the
  //     33 adrenal crises found in a national survey, and the only arm of TORCH that did worse
  //     than placebo.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'fluticasone',
    name: 'Fluticasone',
    tradeName: 'Flovent / Flovent HFA / Flovent Diskus / Flonase / Arnuity Ellipta / Cutivate',
    sponsor:
      'GlaxoSmithKline (originator of fluticasone propionate as Flovent and Flonase, and of the furoate ester as Arnuity Ellipta); the propionate is now made by many manufacturers including Fougera',
    targetGene: 'NR3C1',
    targetProtein: 'Glucocorticoid receptor (nuclear receptor subfamily 3 group C member 1)',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1990,
    indication:
      'Inhalation aerosol and powder: maintenance treatment of asthma as prophylactic therapy in adults and children aged 4 and over. Not indicated for the relief of acute bronchospasm. Nasal spray: seasonal and perennial allergic and non-allergic rhinitis. Cream and ointment: corticosteroid-responsive dermatoses. In combination with salmeterol it is additionally indicated in chronic obstructive pulmonary disease.',
    patientFriendlyIndication:
      'The daily preventer inhaler that keeps asthma quiet, and the same drug as a hay-fever spray and a skin cream',
    anatomicalSite:
      'Airway epithelium and submucosal inflammatory cells; nasal mucosa for the spray; epidermis and dermis for the cream',
    conditionContext: {
      conditionExplainer:
        'Asthma is inflammation in the lining of the airway that persists between attacks. An inhaled corticosteroid enters those lining cells, binds a receptor and carries it into the nucleus, where it shuts down the genes producing inflammatory signals. It takes days to weeks to work and it does nothing during an attack.',
      whyItMatters:
        'Fluticasone propionate is among the most widely prescribed medicines in the world and, on its label’s own numbers, the most receptor-avid of the older inhaled steroids. Both of those facts make its systemic safety record worth reading carefully rather than assuming from the class.',
      whoTakesThis:
        'Anyone with persistent asthma from age 4 upward, on its own or inside a combination inhaler with salmeterol or vilanterol; people with allergic rhinitis, using the nasal spray; and people with inflammatory skin disease.',
      clinicalGoals:
        'Fewer exacerbations and fewer courses of oral steroids, with as little systemic corticosteroid exposure as possible. The second half of that sentence is where this drug’s specific problems live.',
    },
    oneSentenceVerdict:
      'A trifluorinated corticosteroid the label reports as binding the human glucocorticoid receptor 18 times as tightly as dexamethasone and more than 3 times as tightly as budesonide — while stating the clinical significance is unknown; it cut severe asthma exacerbations by 21% when salmeterol was added in 11,679 patients, produced the only arm of TORCH with higher three-year mortality than placebo (16.0% against 15.2%), and accounted for 30 of the 33 cases of adrenal crisis found by a United Kingdom national survey, one of them fatal.',
    laymanHowItWorks:
      'Fluticasone is breathed or sprayed onto an inflamed surface, crosses into the cells there, binds a receptor and carries it into the nucleus, where it switches off the genes making inflammatory signals. It is designed to be destroyed rapidly by the liver, so very little of what is swallowed reaches the bloodstream intact. Two things break that design: doses above the licensed range, and any medicine that blocks the liver enzyme doing the destroying — which is how an inhaler has repeatedly produced full-blown Cushing syndrome.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 83,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.6920 per millilitre, the median across 51 listed products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Fluticasone propionate is generic across 51 listed presentations, more than any other steroid in this file, and at about sixty-nine cents a millilitre it is one of the cheapest. The nasal spray is available without prescription in the United States. What is not generic is the newer furoate ester and the devices carrying it — Arnuity, Breo and Trelegy Ellipta — which is the same molecule family re-entering the market through a new ester and a new inhaler after the original went off patent.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Every inhaled corticosteroid acts on the same receptor and the head-to-head efficacy differences are small. Where they differ is systemic exposure, and on that measure fluticasone has the least reassuring record of the group: a national survey of adrenal crisis found almost all cases on this drug, and its interaction with common CYP3A4 inhibitors has repeatedly produced Cushing syndrome. Those are reasons to respect the licensed dose, not reasons to stop treating asthma.',
      conventionalRx: [
        {
          name: 'Budesonide (Pulmicort, Rhinocort)',
          class: 'Inhaled and intranasal corticosteroid',
          howItCompares:
            'Under a third of fluticasone’s in-vitro receptor affinity by the fluticasone label’s own comparison. It is the steroid with the best long-term paediatric data, including a measured 1.2 cm reduction in final adult height, and it appeared in only one of the 33 adrenal-crisis cases in the United Kingdom survey, alongside fluticasone.',
          typicalCost:
            'US$0.7198 per millilitre at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: nebuliser suspension for young children, WHO Model List of Essential Medicines, best-characterised growth effect. Cons: that growth effect is real and permanent, which is what having the data means.',
        },
        {
          name: 'Mometasone furoate (Asmanex, Nasonex)',
          class: 'Inhaled and intranasal corticosteroid',
          howItCompares:
            'About one and a half times fluticasone’s receptor affinity by the mometasone label’s comparison, with negligible intranasal systemic bioavailability demonstrated by a one-year randomised growth study in 98 children that found nothing.',
          typicalCost:
            'US$0.7141 per millilitre at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: a positive negative-safety trial for the nasal route, which fluticasone does not have in the same form. Cons: the same CYP3A4 interaction, and the inhaled product carries the same systemic warnings.',
        },
        {
          name: 'Beclometasone dipropionate (Qvar, Beconase)',
          class: 'Inhaled and intranasal corticosteroid',
          howItCompares:
            'About half fluticasone’s receptor affinity, comparing against beclometasone-17-monopropionate, its active metabolite. Extrafine formulations deposit further into the small airways, which changes the relationship between nominal dose and delivered dose.',
          typicalCost:
            'US$30.24 per gram at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: long track record, extrafine particle options. Cons: the intranasal form has a positive growth-suppression trial, 5.0 cm against 5.9 cm over a year.',
        },
        {
          name: 'Fluticasone plus salmeterol in one inhaler (Advair)',
          class: 'Inhaled corticosteroid plus long-acting beta-2 agonist',
          howItCompares:
            'Not an alternative to fluticasone but the usual next step from it. In AUSTRI, 11,679 patients, adding salmeterol cut severe exacerbations by 21% (hazard ratio 0.79, 95% CI 0.70 to 0.89) with no excess of serious asthma events.',
          typicalCost:
            'Priced separately from the single-ingredient products; salmeterol alone is US$6.74 per unit at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: fewer exacerbations, and the steroid cannot be dropped independently. Cons: in COPD the same combination carries the pneumonia signal, 19.6% against 12.3% on placebo in TORCH.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Do not exceed the licensed paediatric dose without specialist supervision',
          action:
            'Check what daily dose a child is actually on, counting every product that contains a steroid.',
          patientImpact:
            'A United Kingdom national survey identified 33 cases of acute adrenal crisis on inhaled corticosteroids, 30 of them on fluticasone, in patients taking 500 to 2,000 micrograms a day. Twenty-three children presented with acute hypoglycaemia; nine had coma and convulsions; one child died.',
          clinicalPrecaution:
            'The survey authors advised that the licensed paediatric fluticasone dose of 400 micrograms a day should not be exceeded unless the patient is supervised by a physician experienced in problematic asthma.',
        },
        {
          name: 'Never stop a high-dose inhaled steroid abruptly',
          action:
            'Taper under medical supervision rather than stopping, particularly after months on high doses.',
          patientImpact:
            'The same survey emphasised that until adrenal function has been assessed, patients on high-dose inhaled corticosteroids should not have therapy abruptly terminated, because doing so can precipitate an adrenal crisis.',
          clinicalPrecaution:
            'A suppressed adrenal gland cannot respond to illness or injury. The danger is not the drug in the body; it is the sudden absence of it in a gland that has stopped working.',
        },
        {
          name: 'Name every other medicine, especially HIV and antifungal drugs',
          action:
            'List ritonavir, atazanavir, itraconazole, ketoconazole, clarithromycin and similar drugs before starting an inhaled or intranasal steroid.',
          patientImpact:
            'The label states that use of strong CYP3A4 inhibitors with fluticasone propionate is not recommended, and records postmarketing reports of clinically significant interactions with ritonavir producing systemic corticosteroid effects including Cushing syndrome and adrenal suppression.',
          clinicalPrecaution:
            'This is the safety margin of the whole drug being removed. Fluticasone is safe systemically because the liver destroys it; block that enzyme and an inhaled dose behaves like an oral one.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'C[C@@H]1C[C@H]2[C@@H]3C[C@@H](C4=CC(=O)C=C[C@@]4([C@]3([C@H](C[C@@]2([C@]1(C(=O)SCF)O)C)O)F)C)F',
      chemicalFormula: 'C22H27F3O4S',
      molecularWeight: '444.50 g/mol',
      targetReceptorAffinity:
        'The label states that fluticasone propionate has been shown in vitro to exhibit a binding affinity for the human glucocorticoid receptor 18 times that of dexamethasone, almost twice that of beclomethasone-17-monopropionate — the active metabolite of beclometasone dipropionate — and over 3 times that of budesonide, that data from the McKenzie vasoconstrictor assay in man are consistent with these results, and that the clinical significance of these findings is unknown. It also notes that corticosteroids do not affect asthma symptoms immediately and that time to onset and degree of relief vary between individuals.',
      structureSource: {
        label:
          'PubChem CID 444036 (fluticasone propionate) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/444036',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'flu-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity of the trifluorinated androstane core and the carbothioate',
          description:
            'Confirm all three fluorine positions and the 17-beta carbothioate before esterification. The fluoromethyl thioester in place of the usual 17-beta ketone side chain is what makes this molecule unusual: it raises receptor affinity sharply and it is also the group hydrolysed to the inactive 17-beta carboxylic acid, which is the basis of the low oral bioavailability.',
          reagentsAndBuffer:
            'Fluticasone propionate reference standard, reversed-phase HPLC with ultraviolet detection at 239 nm, 1H, 13C and 19F NMR in DMSO-d6, sulfur elemental analysis, loss on drying',
        },
        {
          id: 'flu-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Propionylation of the 17-alpha hydroxyl and S-fluoromethylation',
          description:
            'Esterify the 17-alpha hydroxyl with propionic anhydride and alkylate the thioacid with a fluoromethyl halide. Doing these in the wrong order gives the 17-alpha-propionate isomer rather than the drug, and the two are separable only with difficulty.',
          dependsOnStepId: 'flu-w1',
          reagentsAndBuffer:
            'Propionic anhydride with triethylamine and 4-dimethylaminopyridine, bromofluoromethane or chlorofluoromethane, sodium bicarbonate, anhydrous dimethylformamide or acetone, nitrogen atmosphere',
        },
        {
          id: 'flu-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation and micronisation to a controlled particle size distribution',
          description:
            'Recrystallise and micronise to a defined aerodynamic particle size. For an inhaled steroid this specification is the dose: particle size decides how much reaches the small airways rather than the oropharynx, and a shift in it changes both efficacy and swallowed fraction without changing a single number on the label.',
          dependsOnStepId: 'flu-w2',
          reagentsAndBuffer:
            'Acetone or ethyl acetate recrystallisation, jet milling under nitrogen, cascade impaction for aerodynamic particle size distribution, X-ray powder diffraction for polymorph identity, HPLC purity with 17-alpha isomer limit',
        },
        {
          id: 'flu-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Receptor translocation with a CYP3A4-inhibited arm',
          description:
            'Dose glucocorticoid-receptor-expressing cells and measure translocation and reporter activation, then repeat in the presence of a CYP3A4 inhibitor with hepatocytes in the system. Running the inhibited arm is not optional for this molecule: the entire systemic safety argument rests on hepatic first-pass destruction, and the clinically important failures of that argument all involve blocking CYP3A4.',
          dependsOnStepId: 'flu-w3',
          reagentsAndBuffer:
            'A549 or human bronchial epithelial cells, charcoal-stripped fetal bovine serum, GRE-luciferase reporter, dexamethasone and budesonide as parallel references, cryopreserved human hepatocytes, ketoconazole or ritonavir as CYP3A4 inhibitor',
        },
        {
          id: 'flu-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Affinity ranking reported with oral bioavailability and cortisol suppression',
          description:
            'Report the competition binding constant alongside oral bioavailability and a cortisol-suppression readout. An 18-fold affinity over dexamethasone is a topical potency statement, and quoting it without the systemic exposure data beside it is exactly the reading the label declines to endorse — and the reading under which a national survey found 30 adrenal crises.',
          dependsOnStepId: 'flu-w4',
          reagentsAndBuffer:
            'Tritiated dexamethasone competition binding on cytosolic glucocorticoid receptor, human hepatocyte intrinsic clearance with LC-MS/MS, 24-hour urinary free cortisol or serum cortisol area under the curve in the clinical arm, equilibrium dialysis for plasma protein binding',
        },
      ],
    },
    keyAudits: [
      {
        id: 'flu-a1',
        category: 'failed',
        title:
          'Thirty of 33 adrenal crises in a national survey were on this drug, and a child died',
        laymanSummary:
          'A survey of nearly three thousand United Kingdom specialists found 33 patients who had suffered acute adrenal collapse while on an inhaled steroid. Thirty of them were on fluticasone. Twenty-three children arrived with dangerously low blood sugar, nine of them in coma with seizures, and one of those children died.',
        technicalDetails:
          'Questionnaires were sent to all consultant paediatricians and adult endocrinologists in a United Kingdom medical directory. From 2,912 initial questionnaires, 33 patients met the diagnostic criteria for acute adrenal crisis associated with inhaled corticosteroids — 28 children and 5 adults — confirmed by symptoms and abnormal hypothalamic-pituitary-adrenal axis testing. Twenty-three children had acute hypoglycaemia: 13 with decreased consciousness or coma, nine with coma and convulsions, and one with coma, convulsions and death. Five children and four adults had insidious onset. All 33 were on 500 to 2,000 micrograms per day of inhaled corticosteroid; 30 (91%) had received fluticasone, one fluticasone and budesonide, and two beclometasone. The authors note that fluticasone was at the time the least prescribed and most recently introduced of the inhaled steroids and was associated with 94% of cases, and advise that the licensed paediatric dose of 400 micrograms per day should not be exceeded without specialist supervision.',
        evidenceSource:
          'Todd GRG, Acerini CL, Ross-Russell R, et al. Arch Dis Child 2002;87:457-461',
        doi: '10.1136/adc.87.6.457',
        measuredMetric:
          'Cases of confirmed acute adrenal crisis on inhaled corticosteroids, by drug, from a national specialist survey',
        auditFlag: 'caution',
      },
      {
        id: 'flu-a2',
        category: 'failed',
        title: 'TORCH: the fluticasone-only arm had the highest mortality of the four',
        laymanSummary:
          'In the three-year survival trial in six thousand people with chronic obstructive pulmonary disease, four groups were compared. The group on fluticasone alone had the most deaths of any of them — more than placebo — and got pneumonia half again as often.',
        technicalDetails:
          'TORCH randomised 6,112 patients in the efficacy population to salmeterol plus fluticasone propionate, salmeterol alone, fluticasone propionate alone, or placebo for three years. Three-year all-cause mortality was 12.6% on the combination, 13.5% on salmeterol, 15.2% on placebo and 16.0% on fluticasone alone. The paper states that mortality for salmeterol alone or fluticasone propionate alone did not differ significantly from placebo, so the fluticasone figure is a numerical rather than a statistical excess — but it is the highest of the four and it is the arm that was supposed to be treating the inflammation. Pneumonia reported as an adverse event was 18.3% on fluticasone alone and 19.6% on the combination, against 12.3% on placebo, P<0.001 for both comparisons against placebo. Inhaled corticosteroid monotherapy is no longer a treatment for chronic obstructive pulmonary disease.',
        evidenceSource:
          'Calverley PMA, Anderson JA, Celli B, et al. N Engl J Med 2007;356:775-789 (TORCH, NCT00268216)',
        doi: '10.1056/NEJMoa063070',
        measuredMetric:
          'Three-year all-cause mortality and pneumonia incidence by treatment arm in chronic obstructive pulmonary disease',
        auditFlag: 'caution',
      },
      {
        id: 'flu-a3',
        category: 'measured',
        title: 'AUSTRI: 11,679 patients, and adding salmeterol cut severe exacerbations by 21%',
        laymanSummary:
          'The largest trial of this drug asked whether adding a long-acting bronchodilator to it was dangerous. It was not, and it prevented attacks: 480 people had a severe exacerbation on the combination against 597 on fluticasone alone.',
        technicalDetails:
          'AUSTRI randomised 11,679 patients aged 12 and over with persistent asthma and a severe exacerbation in the preceding year to fluticasone plus salmeterol or fluticasone alone for 26 weeks. Serious asthma-related events were 36 events in 34 patients on the combination against 38 events in 33 patients on fluticasone alone, hazard ratio 1.03 (95% CI 0.64 to 1.66), meeting noninferiority at P=0.003. There were no asthma-related deaths, and the two asthma-related intubations that occurred were both in the fluticasone-only group. Severe exacerbations occurred in 480 of 5,834 (8%) against 597 of 5,845 (10%), hazard ratio 0.79 (95% CI 0.70 to 0.89), P<0.001.',
        evidenceSource:
          'Stempel DA, Raphiou IH, Kral KM, et al. N Engl J Med 2016;374:1822-1830 (AUSTRI, NCT01475721)',
        doi: '10.1056/NEJMoa1511049',
        measuredMetric:
          'First serious asthma-related event and first severe exacerbation, fluticasone-salmeterol against fluticasone alone',
        auditFlag: 'verified',
      },
      {
        id: 'flu-a4',
        category: 'failed',
        title: 'An HIV drug or an antifungal turns the inhaler into an oral steroid',
        laymanSummary:
          'Fluticasone is safe systemically because the liver destroys almost all of what gets absorbed. Several common medicines block the enzyme that does the destroying, and when that happens people on an ordinary inhaler have developed full Cushing syndrome and adrenal failure.',
        technicalDetails:
          'The label states that fluticasone propionate is a CYP3A4 substrate and that use of strong CYP3A4 inhibitors — ritonavir, atazanavir, clarithromycin, indinavir, itraconazole, nefazodone, nelfinavir, saquinavir, ketoconazole, telithromycin — is not recommended because increased systemic corticosteroid adverse effects may occur. A drug interaction trial with fluticasone propionate aqueous nasal spray in healthy subjects showed that ritonavir significantly increased plasma fluticasone exposure and significantly reduced serum cortisol. During postmarketing use there have been reports of clinically significant interactions in patients receiving fluticasone propionate and ritonavir resulting in systemic corticosteroid effects including Cushing syndrome and adrenal suppression. This is not a rare idiosyncrasy: it is the drug behaving exactly as its pharmacology predicts once first-pass metabolism is removed.',
        evidenceSource:
          'FLOVENT HFA (fluticasone propionate) United States prescribing information, Drug Interactions 7.1 and Clinical Pharmacology 12.3',
        measuredMetric:
          'Plasma fluticasone exposure and serum cortisol with and without ritonavir, and postmarketing reports of Cushing syndrome',
        auditFlag: 'caution',
      },
      {
        id: 'flu-a5',
        category: 'inferred',
        title: 'The 18-fold affinity number is a potency claim the label refuses to interpret',
        laymanSummary:
          'Fluticasone is described everywhere as the most potent of the older inhaled steroids, on the basis that it binds the receptor eighteen times as tightly as dexamethasone. The label gives that number and then says nobody knows what it means clinically.',
        technicalDetails:
          'The Mechanism of Action section reports in-vitro glucocorticoid receptor binding affinity 18 times that of dexamethasone, almost twice that of beclomethasone-17-monopropionate and over 3 times that of budesonide, adds that the McKenzie vasoconstrictor assay in man is consistent, and then states that the clinical significance of these findings is unknown. Receptor affinity is a statement about potency at the surface where the drug lands. It does not by itself predict clinical efficacy, which also depends on how much drug is deposited there, nor systemic risk, which depends on absorbed fraction and hepatic clearance. The adrenal-crisis survey is the clearest illustration: the drug with the highest affinity accounted for 91% of cases while being, at the time, the least prescribed of the three.',
        evidenceSource:
          'FLOVENT HFA United States prescribing information, Clinical Pharmacology 12.1; Todd GRG et al., Arch Dis Child 2002;87:457-461',
        doi: '10.1136/adc.87.6.457',
        inferredClaim:
          'That an 18-fold in-vitro receptor affinity over dexamethasone establishes a clinical potency ranking — a translation the label explicitly declines, and one that the adrenal-crisis data complicate rather than support',
        auditFlag: 'caution',
      },
      {
        id: 'flu-a6',
        category: 'measured',
        title: 'The label asks for four separate long-term surveillance measures',
        laymanSummary:
          'The prescribing information does not treat this as a drug with no systemic effect. It asks for children’s growth to be monitored, for bone density to be assessed initially and periodically, for referral to an eye specialist if vision changes, and for slow withdrawal if signs of steroid excess appear.',
        technicalDetails:
          'The FLOVENT HFA Warnings and Precautions require: monitoring for Candida albicans infection of the mouth and pharynx with rinsing after inhalation; caution in existing tuberculosis and fungal, bacterial, viral, parasitic and ocular herpes simplex infections, with a more serious or fatal course of chickenpox or measles possible in susceptible patients; slow tapering when transferring from systemic corticosteroids because of impaired adrenal function; recognition that hypercorticism and adrenal suppression may occur at very high dosages or at regular dosage in susceptible individuals, with slow discontinuation if they do; assessment for decreased bone mineral density initially and periodically; monitoring of growth in paediatric patients; and consideration of ophthalmologist referral for glaucoma and cataracts with long-term use. That list is what a well-characterised systemic risk profile looks like written into a label.',
        evidenceSource:
          'FLOVENT HFA (fluticasone propionate) United States prescribing information, Warnings and Precautions 5.1 to 5.9',
        measuredMetric: 'Labelled long-term monitoring requirements for an inhaled corticosteroid',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Inhaled or sprayed onto the inflamed surface',
        laymanDesc:
          'A measured dose lands on the airway or nasal lining. A large part of every inhaled dose lands in the mouth instead and is swallowed, which is where the systemic story begins.',
        molecularDetail:
          'Fluticasone propionate as a pressurised HFA aerosol, a Diskus dry powder, an aqueous nasal suspension or a topical cream. Micronised particle size distribution determines the fraction reaching the small airways rather than the oropharynx and is a specification, not an accident.',
        iconName: 'Wind',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The liver destroys almost everything that is swallowed',
        laymanDesc:
          'What goes down the throat is absorbed from the gut and passes through the liver, which breaks it down before it can circulate. That first pass is what makes an inhaled steroid different from a tablet.',
        molecularDetail:
          'Fluticasone propionate is a CYP3A4 substrate hydrolysed to an inactive 17-beta carboxylic acid metabolite, with negligible oral bioavailability. The systemic safety of the drug is a pharmacokinetic property rather than a pharmacodynamic one, which is why strong CYP3A4 inhibitors abolish it.',
        iconName: 'Lock',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It binds the glucocorticoid receptor very tightly',
        laymanDesc:
          'Inside a lining cell it binds a receptor waiting in the cytoplasm — more tightly than most other steroids, though the label declines to say what that means for a patient.',
        molecularDetail:
          'In-vitro glucocorticoid receptor binding affinity 18 times dexamethasone, almost twice beclomethasone-17-monopropionate and over 3 times budesonide, with the McKenzie vasoconstrictor assay in man consistent and clinical significance stated as unknown.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The pair enters the nucleus and rewrites which genes are read',
        laymanDesc:
          'The receptor carries the drug into the nucleus and switches off the inflammatory programme. It is a change in gene transcription, which is why it takes days and does nothing during an attack.',
        molecularDetail:
          'Activated receptor represses pro-inflammatory transcription factors and transactivates anti-inflammatory genes, with effects across mast cells, eosinophils, neutrophils, macrophages and lymphocytes and across histamine, eicosanoids, leukotrienes and cytokines. The label states that corticosteroids do not affect asthma symptoms immediately and that maximum benefit takes time.',
        iconName: 'Dna',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Inflammation subsides and exacerbations become less frequent',
        laymanDesc:
          'The lining becomes less swollen and less twitchy. Adding a long-acting bronchodilator on top cut severe attacks by a further fifth in nearly twelve thousand people.',
        molecularDetail:
          'In AUSTRI, severe exacerbations occurred in 480 of 5,834 (8%) on fluticasone-salmeterol against 597 of 5,845 (10%) on fluticasone alone, hazard ratio 0.79 (95% CI 0.70 to 0.89, P<0.001), with a serious-asthma-event hazard ratio of 1.03 (95% CI 0.64 to 1.66).',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Where the design fails, it fails completely',
        laymanDesc:
          'Above the licensed dose, or alongside a medicine that blocks the liver enzyme, the same inhaler behaves like an oral steroid — adrenal collapse, low blood sugar, seizures, Cushing syndrome.',
        molecularDetail:
          'Thirty of 33 confirmed adrenal crises in a United Kingdom national survey were on fluticasone at 500 to 2,000 micrograms per day, including nine children with coma and convulsions and one death. Postmarketing reports of ritonavir coadministration record Cushing syndrome and adrenal suppression, and a formal interaction study showed significantly raised plasma fluticasone and significantly reduced serum cortisol.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'AUSTRI (NCT01475721)',
        phase: 'Phase 4, randomised, double-blind, FDA-mandated safety trial, 26 weeks',
        sampleSize: 11679,
        primaryEndpoint:
          'Time to first serious asthma-related event — death, endotracheal intubation or hospitalisation',
        endpointMet: true,
        statisticalPValue:
          'Hazard ratio 1.03 (95% CI 0.64 to 1.66), noninferiority achieved at P=0.003; severe exacerbations hazard ratio 0.79 (95% CI 0.70 to 0.89), P<0.001',
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
          'Combination against placebo hazard ratio 0.825 (95% CI 0.681 to 1.002), P=0.052. All-cause mortality by arm: 12.6% combination, 13.5% salmeterol, 15.2% placebo, 16.0% fluticasone alone; monotherapy arms did not differ significantly from placebo.',
        unreportedAdverseSignals:
          'The fluticasone-only arm had the numerically highest mortality of the four. Pneumonia was 18.3% on fluticasone alone and 19.6% on the combination against 12.3% on placebo, P<0.001.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'VESTRI (NCT01462344)',
        phase: 'Phase 4, randomised, double-blind, FDA-mandated paediatric safety trial, 26 weeks',
        sampleSize: 6208,
        primaryEndpoint:
          'Time to first serious asthma-related event in children aged 4 to 11 years',
        endpointMet: true,
        statisticalPValue:
          'Hazard ratio 1.28 (95% CI 0.73 to 2.27), noninferiority against an upper bound of 2.675 achieved, P=0.006; severe exacerbations hazard ratio 0.86 (95% CI 0.73 to 1.01)',
        unreportedAdverseSignals:
          'Every serious asthma-related event in the trial was a hospitalisation. The noninferiority margin in children was wider than the adult one.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Todd 2002 — United Kingdom national survey of adrenal crisis',
        phase: 'National questionnaire survey with case confirmation by HPA-axis testing',
        sampleSize: 33,
        primaryEndpoint:
          'Confirmed cases of acute adrenal crisis associated with inhaled corticosteroids, and the drug involved',
        endpointMet: true,
        statisticalPValue:
          '33 confirmed cases from 2,912 questionnaires — 28 children and 5 adults; 30 (91%) on fluticasone, 1 on fluticasone and budesonide, 2 on beclometasone',
        unreportedAdverseSignals:
          'A survey cannot give a rate, because the denominator of exposed patients is unknown. What it does establish is the distribution across drugs, and that distribution was strongly skewed toward the least-prescribed agent of the three at the time.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '30 of 33 confirmed adrenal crises in a United Kingdom national survey occurred on fluticasone, including nine children with coma and convulsions and one death',
        'Three-year all-cause mortality of 16.0% on fluticasone alone against 15.2% on placebo in TORCH, the highest of the four arms',
        'Pneumonia in 18.3% on fluticasone alone against 12.3% on placebo, P<0.001',
        'Severe asthma exacerbations 21% lower when salmeterol was added, hazard ratio 0.79 (95% CI 0.70 to 0.89) in 11,679 patients',
        'Significantly raised plasma fluticasone and significantly reduced serum cortisol with ritonavir in a formal interaction study',
      ],
      unsupportedInferences: [
        'That an 18-fold in-vitro receptor affinity over dexamethasone establishes a clinical potency ranking — the label states the significance is unknown',
        'That the negligible oral bioavailability makes systemic effects impossible, when a CYP3A4 inhibitor removes exactly that protection',
        'That a national survey of 33 cases gives a rate, when the number of exposed patients is unknown',
        'That inhaled corticosteroid monotherapy benefits chronic obstructive pulmonary disease, which TORCH’s four-arm design does not support',
      ],
      whatFailedInitially: [
        'The fluticasone-only arm of TORCH had the highest three-year mortality of the four arms and 50% more pneumonia than placebo',
        'A national survey found 91% of confirmed inhaled-steroid adrenal crises on this one drug, at doses within contemporary guideline ranges',
        'Coadministration with ritonavir has produced Cushing syndrome and adrenal suppression in postmarketing use',
        'The label requires bone density assessment, paediatric growth monitoring and ophthalmological referral — three surveillance obligations a drug with no systemic effect would not need',
      ],
      realWorldOutcome: [
        'Among the most widely prescribed medicines in the world, generic across 51 listed presentations and available over the counter as a nasal spray in the United States',
        'Inhaled corticosteroid monotherapy has been abandoned in chronic obstructive pulmonary disease, and the steroid is now given only with a bronchodilator',
        'The licensed paediatric dose ceiling exists because of the adrenal-crisis cases, not in spite of them',
        'The newer furoate ester re-entered the market in proprietary devices after the propionate went generic',
      ],
    },
    deliverySystem: {
      type: 'Pressurised HFA inhalation aerosol, Diskus dry-powder inhaler, aqueous nasal spray, and topical cream and ointment',
      description:
        'Inhaled twice daily for asthma maintenance and never for acute symptoms. A large fraction of every inhaled dose is deposited in the mouth and swallowed, which is why rinsing and spitting after each dose is part of the instructions and why hepatic first-pass metabolism carries the systemic safety of the whole product.',
      safetyProfile:
        'Candida albicans infection of the mouth and pharynx, with periodic monitoring and rinsing without swallowing after inhalation. Potential worsening of existing tuberculosis and of fungal, bacterial, viral, parasitic and ocular herpes simplex infections, with a more serious or fatal course of chickenpox or measles possible in susceptible patients. Risk of impaired adrenal function when transferring from systemic corticosteroids, requiring slow tapering. Hypercorticism and adrenal suppression may occur at very high dosages or at regular dosage in susceptible individuals. Assessment for decreased bone mineral density initially and periodically. Monitoring of growth in paediatric patients. Glaucoma and cataracts with long-term use, with ophthalmologist referral to be considered. Strong CYP3A4 inhibitors including ritonavir and ketoconazole are not recommended, with postmarketing reports of Cushing syndrome and adrenal suppression.',
    },
    commonQuestions: [
      {
        q: 'Is my preventer inhaler safe for my child?',
        a: 'At the licensed dose, for the great majority of children, yes — and the reason there is a licensed dose ceiling is worth knowing. A United Kingdom survey of nearly three thousand specialists identified 33 confirmed cases of acute adrenal collapse on inhaled steroids, 30 of them on fluticasone, all at 500 to 2,000 micrograms a day. Twenty-three of the children presented with dangerously low blood sugar, nine with coma and seizures, and one child died. The authors concluded that the licensed paediatric dose of 400 micrograms a day should not be exceeded without a specialist in problematic asthma supervising. Untreated asthma is also dangerous; the point is to stay inside the dose, not to stop the drug.',
        auditNote:
          'A survey cannot produce a rate, because nobody knows how many children were exposed. What it produces is a distribution across drugs, and that distribution was heavily skewed toward one.',
      },
      {
        q: 'Why can I not take it with my HIV medicine?',
        a: 'Because the drug’s entire systemic safety depends on the liver destroying what gets absorbed, and ritonavir blocks the enzyme that does it. A formal interaction study in healthy volunteers found that ritonavir significantly raised plasma fluticasone and significantly lowered serum cortisol, and postmarketing reports record people on the combination developing Cushing syndrome and adrenal suppression from an ordinary inhaler or nasal spray. The label states that strong CYP3A4 inhibitors — ritonavir, atazanavir, itraconazole, ketoconazole, clarithromycin and others — are not recommended. This is not an unpredictable reaction; it is the pharmacology working exactly as described with one step removed.',
      },
      {
        q: 'Should I take it for COPD?',
        a: 'Not on its own. TORCH compared four arms over three years in 6,112 people, and the fluticasone-alone group had the highest all-cause mortality of the four at 16.0%, against 15.2% on placebo — a numerical rather than a statistical excess, since neither monotherapy differed significantly from placebo. The same arm had pneumonia in 18.3% against 12.3% on placebo. Inhaled corticosteroid monotherapy is no longer used in this disease. Where a steroid is used it is added to bronchodilators, and the trade there is fewer exacerbations against more pneumonia.',
      },
      {
        q: 'Is fluticasone stronger than budesonide?',
        a: 'It binds the receptor more than three times as tightly in a test tube, and the label that reports that number says the clinical significance is unknown. Two drugs can differ threefold in receptor affinity and be used at similar microgram doses, because what reaches the airway depends on the device and the particle size as much as on the molecule. Where the difference does show up is systemic: the national adrenal-crisis survey found 30 cases on fluticasone and one involving budesonide, at a time when fluticasone was the least prescribed of the inhaled steroids. That is the comparison worth carrying, and it is about exposure rather than about strength.',
      },
      {
        q: 'Do I really need to rinse my mouth?',
        a: 'Yes, and it costs nothing. A large fraction of every inhaled dose lands in the mouth and throat rather than the lung. Left there it causes oral thrush, which the label asks prescribers to monitor for; swallowed, it adds to the systemic dose that the liver then has to deal with. The instruction is to rinse with water and spit without swallowing after each inhalation. It removes drug from the mouth and throat and takes nothing away from the dose that has already reached the lung.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Todd GRG, Acerini CL, Ross-Russell R, Zahra S, Warner JT, McCance D. Survey of adrenal crisis associated with inhaled corticosteroids in the United Kingdom. Arch Dis Child 2002;87:457-461',
        identifier: '10.1136/adc.87.6.457',
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
        label: 'AUSTRI — fluticasone propionate with and without salmeterol in 11,679 patients',
        identifier: 'NCT01475721',
        kind: 'nct',
      },
      {
        label: 'TORCH — three-year four-arm survival trial including fluticasone monotherapy',
        identifier: 'NCT00268216',
        kind: 'nct',
      },
      {
        label:
          'FLOVENT HFA (fluticasone propionate inhalation aerosol) United States prescribing information — Warnings and Precautions 5.1 to 5.9, Drug Interactions 7.1, Clinical Pharmacology 12.1 and 12.3',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22FLOVENT+HFA%22',
        kind: 'regulatory',
      },
      {
        label:
          'PubChem CID 444036 — fluticasone propionate structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/444036',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 12. Beclometasone — a prodrug 25 times less receptor-avid than its own metabolite, whose
  //     nasal form measurably slows children's growth and whose propellant change altered the dose.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'beclomethasone',
    name: 'Beclomethasone',
    tradeName: 'Qvar / Qvar Redihaler / Qnasl / Beconase AQ / Vancenase AQ / Beclovent',
    sponsor:
      'Schering (originator of the United States nasal and inhaled products); the inhaled aerosol is now marketed by Teva as Qvar Redihaler',
    targetGene: 'NR3C1',
    targetProtein:
      'Glucocorticoid receptor — bound not by the administered dipropionate but by its hydrolysis product, beclometasone-17-monopropionate',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1976,
    indication:
      'Inhalation aerosol: maintenance treatment of asthma as prophylactic therapy in adults and children aged 4 and over. Not indicated for the relief of acute bronchospasm. Nasal aerosol and nasal spray: seasonal and perennial allergic rhinitis, and non-allergic rhinitis in some presentations.',
    patientFriendlyIndication:
      'A daily preventer inhaler for asthma, and a nasal spray for hay fever',
    anatomicalSite:
      'Airway epithelium and submucosal inflammatory cells (inhaled); nasal mucosa (spray and nasal aerosol)',
    conditionContext: {
      conditionExplainer:
        'Beclometasone is administered as a diester and is not itself the drug that acts. The airway and the bloodstream hydrolyse it rapidly to a monoester, and that monoester is what binds the glucocorticoid receptor — about twenty-five times more tightly than the molecule that was inhaled.',
      whyItMatters:
        'That two-step arrangement, plus a change of propellant that altered how deep the particles travel, means the number on the canister maps less directly onto the dose in the lung than it does for any other steroid in this file.',
      whoTakesThis:
        'People with persistent asthma from age 4, and people with allergic rhinitis. It is one of the oldest inhaled corticosteroids in use and remains widely prescribed worldwide.',
      clinicalGoals:
        'Control of airway or nasal inflammation. The trade-off is measurable: at the highest recommended inhaled dose, twenty-four-hour cortisol production falls by more than a third, and a year of the nasal spray cost children 0.9 cm of growth.',
    },
    oneSentenceVerdict:
      'A corticosteroid diester that is a prodrug, hydrolysed to beclometasone-17-monopropionate which binds the glucocorticoid receptor about 13 times as tightly as dexamethasone and 25 times as tightly as the dose that was inhaled; at the highest recommended inhaled dose it reduced 24-hour urinary free cortisol by 37.3%, and a year of the nasal spray in 100 children produced 5.0 cm of growth against 5.9 cm on placebo.',
    laymanHowItWorks:
      'What comes out of the inhaler is not the active drug. It is a chemical precursor that the lining of the airway rapidly converts into the working form, which then enters the cells, binds a receptor and carries it into the nucleus to switch off inflammatory genes. Because the conversion happens where the drug lands, the effect is concentrated there — but not confined there, and the label carries the measurement that proves it: at the top licensed dose, the body’s own cortisol production drops by more than a third.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 78,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$30.24 per gram, the median across 4 listed products at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Only four presentations are listed, all brand, at thirty dollars a gram — a striking figure for a molecule first used in asthma in the early 1970s. The reason is the same one that recurs across this file: the compound is ancient and free, and the breath-actuated pressurised inhaler that delivers it is not. A generic would have to reproduce a deposition profile, not a chemical, and the propellant change from CFC to HFA is direct evidence that deposition and not chemistry decides what the drug does.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The inhaled and intranasal corticosteroids are close substitutes for one another in efficacy and differ mainly in systemic exposure. Beclometasone is the one with a positive intranasal growth-suppression trial, which is the single most useful fact when choosing between them for a child. In asthma, its distinctive contribution is not the molecule but a strategy: the trial that showed a steroid taken only when symptoms occur can match one taken twice daily.',
      conventionalRx: [
        {
          name: 'Mometasone furoate (Nasonex, Asmanex)',
          class: 'Inhaled and intranasal corticosteroid',
          howItCompares:
            'The direct comparison is unusually clean. Two studies published in the same issue of the same journal, with the same entry criteria and nearly the same size, found 0.9 cm of growth suppression over a year with intranasal beclometasone and none with intranasal mometasone.',
          typicalCost:
            'US$0.7141 per millilitre at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: a matched negative growth trial, generic, far cheaper per unit. Cons: the inhaled product carries the same class warnings, and the reassuring result is for the nasal route only.',
        },
        {
          name: 'Fluticasone propionate (Flovent, Flonase)',
          class: 'Inhaled and intranasal corticosteroid',
          howItCompares:
            'About twice the receptor affinity of beclometasone-17-monopropionate by the fluticasone label’s comparison. It is also the drug that accounted for 30 of the 33 confirmed adrenal crises in a United Kingdom national survey, against two on beclometasone.',
          typicalCost:
            'US$0.6920 per millilitre at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: generic across 51 presentations, cheap, over the counter as a nasal spray. Cons: the adrenal-crisis distribution, and the same CYP3A4 interaction.',
        },
        {
          name: 'Budesonide (Pulmicort, Rhinocort)',
          class: 'Inhaled and intranasal corticosteroid',
          howItCompares:
            'About two-thirds the receptor affinity of beclometasone-17-monopropionate by the QVAR label’s comparison, and the steroid with the only measured final-adult-height outcome: 1.2 cm lower in children followed into adulthood.',
          typicalCost:
            'US$0.7198 per millilitre at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: nebuliser suspension for young children, WHO Model List of Essential Medicines, the best long-term data. Cons: those data document a permanent height cost.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Have a child’s height measured properly, not estimated',
          action:
            'Ask for a stadiometer measurement at every review for any child on a regular inhaled or intranasal steroid.',
          patientImpact:
            'In the one-year randomised trial of intranasal beclometasone, children grew 5.0 cm against 5.9 cm on placebo, and the difference was already evident at the one-month visit. Adrenal function testing in the same trial showed no difference between groups.',
          clinicalPrecaution:
            'Growth velocity was the sensitive measure and the cortisol test was not. A normal cortisol result does not exclude a systemic steroid effect in a child.',
        },
        {
          name: 'Rinse and spit after every inhaled dose',
          action: 'Rinse the mouth with water without swallowing after each inhalation.',
          patientImpact:
            'The label states that Candida albicans infection of the mouth and throat may occur, asks for periodic monitoring of the oral cavity, and gives this instruction directly.',
          clinicalPrecaution:
            'It removes drug deposited in the mouth and throat, which reduces both thrush and the swallowed fraction, and takes nothing away from the dose already in the lung.',
        },
        {
          name: 'Treat sudden wheeze immediately after a dose as a reason to stop',
          action:
            'If wheezing increases right after inhaling, use a short-acting reliever and contact the prescriber before taking another dose.',
          patientImpact:
            'The label describes paradoxical bronchospasm with an immediate increase in wheezing after dosing, to be treated at once with an inhaled short-acting bronchodilator, with the product discontinued.',
          clinicalPrecaution:
            'This is the inhaler causing the symptom it is meant to prevent. Continuing to use it because it is the preventer is the error the warning exists to stop.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'C[C@H]1C[C@H]2[C@@H]3CCC4=CC(=O)C=C[C@@]4([C@]3([C@H](C[C@@]2([C@]1(C(=O)CO)O)C)O)Cl)C',
      chemicalFormula: 'C22H29ClO5',
      molecularWeight: '408.90 g/mol',
      targetReceptorAffinity:
        'The structure recorded here is beclometasone, the parent alcohol. The marketed drug substance is beclometasone dipropionate, molecular formula C28H37ClO7 and molecular weight 521.1 per the label, and it is a prodrug: it undergoes rapid and extensive conversion to beclometasone-17-monopropionate during absorption. The label states that beclometasone-17-monopropionate binds the human glucocorticoid receptor with an affinity approximately 13 times that of dexamethasone, 6 times that of triamcinolone acetonide, 1.5 times that of budesonide and 25 times that of beclometasone dipropionate itself — and that the clinical significance of these findings is unknown. It also differs from dexamethasone in carrying a chlorine at the 9-alpha position instead of a fluorine, and a 16-beta rather than 16-alpha methyl group.',
      structureSource: {
        label:
          'PubChem CID 20469 (beclometasone) — canonical SMILES, molecular formula and weight for the parent alcohol; the dipropionate ester is the administered drug substance',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/20469',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'bec-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity of the 9-alpha chloro, 16-beta methyl pregnadiene core',
          description:
            'Confirm the chlorine at the 9-alpha position and the 16-beta methyl configuration. Both distinguish this molecule from dexamethasone, which carries a fluorine and a 16-alpha methyl, and the 16-beta epimer is a different compound rather than a weaker one.',
          reagentsAndBuffer:
            'Beclometasone dipropionate reference standard, reversed-phase HPLC with ultraviolet detection at 240 nm, 1H and 13C NMR in DMSO-d6, chlorine elemental analysis, loss on drying',
        },
        {
          id: 'bec-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Diesterification at the 17-alpha and 21 hydroxyls',
          description:
            'Acylate both hydroxyls with propionic anhydride to give the dipropionate. The diester is the prodrug: it is more lipophilic and far less receptor-avid than the monoester it becomes, and controlling the ratio of 17-mono, 21-mono and di-ester in the finished substance is the central purity problem of the route.',
          dependsOnStepId: 'bec-w1',
          reagentsAndBuffer:
            'Propionic anhydride, pyridine or triethylamine, 4-dimethylaminopyridine catalyst, anhydrous dichloromethane, controlled temperature, nitrogen atmosphere',
        },
        {
          id: 'bec-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation and solution-aerosol formulation in HFA',
          description:
            'Crystallise the dipropionate and formulate it as a solution rather than a suspension in hydrofluoroalkane propellant. This is the step that changed the drug: a solution aerosol in HFA produces much finer particles than the old CFC suspension, and the label’s own cortisol data show the reformulated product behaves differently at a nominally similar dose.',
          dependsOnStepId: 'bec-w2',
          reagentsAndBuffer:
            'Acetone or ethanol crystallisation, ethanol cosolvent, HFA-134a propellant, pressure-filling equipment, cascade impaction for aerodynamic particle size distribution, HPLC assay for the 17-mono and 21-mono ester impurities',
        },
        {
          id: 'bec-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Hydrolysis to the monoester in human lung tissue and receptor translocation',
          description:
            'Incubate the dipropionate with human bronchial epithelial cells or lung homogenate, quantify formation of beclometasone-17-monopropionate, and only then measure receptor translocation. Running the receptor assay on the dipropionate alone would understate activity twenty-five-fold, because the compound applied is not the compound that binds.',
          dependsOnStepId: 'bec-w3',
          reagentsAndBuffer:
            'Human bronchial epithelial cells or lung S9 fraction, esterase-containing buffer at 37C, LC-MS/MS quantification of beclometasone dipropionate, 17-BMP and beclometasone, GRE-luciferase reporter cells, dexamethasone and budesonide as parallel references',
        },
        {
          id: 'bec-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Affinity ranking reported alongside a cortisol-suppression readout',
          description:
            'Report the monoester competition binding constant with a 24-hour urinary free cortisol measurement from the clinical programme. The label carries both, and the pairing is what makes the numbers interpretable: a 13-fold affinity over dexamethasone means little on its own, and a 37.3% cortisol reduction at the top recommended dose means a great deal.',
          dependsOnStepId: 'bec-w4',
          reagentsAndBuffer:
            'Tritiated dexamethasone competition binding on cytosolic glucocorticoid receptor, 24-hour urinary free cortisol by LC-MS/MS, short cosyntropin stimulation testing, plasma protein binding by equilibrium dialysis',
        },
      ],
    },
    keyAudits: [
      {
        id: 'bec-a1',
        category: 'failed',
        title: 'One year of the nasal spray cost children 0.9 cm, detectable within a month',
        laymanSummary:
          'A hundred prepubertal children with year-round hay fever were randomised to intranasal beclometasone or placebo for a year, with height measured seven times. The treated children grew 5.0 cm; the placebo children grew 5.9 cm. The gap was already visible at the first month.',
        technicalDetails:
          'A double-blind, randomised, parallel-group study treated 100 prepubertal children aged 6 to 9 with perennial allergic rhinitis with aqueous beclometasone dipropionate 168 micrograms twice daily (n=51) or placebo (n=49) for one year, with baseline height between the 5th and 95th percentile and skeletal age within two years of chronological age. Ninety completed. The primary safety parameter was the rate of change in standing height, analysed as the slope of a linear regression per subject. Overall growth rate was significantly slower on beclometasone in both the intention-to-treat and completer analyses; mean change in standing height at one year was 5.0 cm against 5.9 cm. The difference was evident by the one-month visit, was consistent across age and sex subgroups and across children with and without prior corticosteroid use, and survived a z-score normalisation against national height data that ruled out a baseline imbalance as the explanation. No significant between-group difference was found in hypothalamic-pituitary-adrenal axis assessments.',
        evidenceSource: 'Skoner DP, Rachelefsky GS, Meltzer EO, et al. Pediatrics 2000;105:E23',
        doi: '10.1542/peds.105.2.e23',
        measuredMetric: 'Rate of change in standing height over one year against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'bec-a2',
        category: 'measured',
        title: 'A matched trial of another nasal steroid published alongside it found nothing',
        laymanSummary:
          'The same journal issue carried an almost identical study of intranasal mometasone in 98 children, and it found no growth suppression at all. Two intranasal steroids, two matched designs, two opposite answers — which is why they cannot be treated as interchangeable.',
        technicalDetails:
          'Schenkel and colleagues randomised 98 prepubertal children aged 3 to 9 with perennial allergic rhinitis to mometasone furoate aqueous nasal spray 100 micrograms once daily or placebo for one year, with the same entry criteria on height percentile and skeletal age. Eighty-two completed. Change in height at one year was 6.95 cm on mometasone against 6.35 cm on placebo, growth rate averaged 0.018 cm per day in both groups, and cosyntropin stimulation testing at baseline, 26 and 52 weeks showed no HPA-axis suppression. The two studies together are the strongest available demonstration that systemic exposure differs between intranasal corticosteroids, and they also demonstrate that the design used is capable of detecting a difference — which is what makes the negative one credible.',
        evidenceSource: 'Schenkel EJ, Skoner DP, Bronsky EA, et al. Pediatrics 2000;105:E22',
        doi: '10.1542/peds.105.2.e22',
        measuredMetric:
          'Change in standing height over one year in a matched-design study of a different intranasal corticosteroid',
        auditFlag: 'verified',
      },
      {
        id: 'bec-a3',
        category: 'failed',
        title: 'At the top licensed inhaled dose, cortisol production falls by more than a third',
        laymanSummary:
          'The label reports the measurement directly. Forty steroid-naive patients were studied, and the highest recommended dose of the inhaler reduced the body’s own twenty-four-hour cortisol output by 37.3%. Even the lowest dose studied reduced it by 12.2%.',
        technicalDetails:
          'The effects on the hypothalamic-pituitary-adrenal axis were studied in 40 corticosteroid-naive patients, comparing QVAR MDI at 80, 160 or 320 micrograms twice daily with placebo and with 336 micrograms twice daily of CFC-formulated beclometasone dipropionate. Active treatment groups showed an expected dose-related reduction in 24-hour urinary free cortisol. At the highest recommended dose, 320 micrograms twice daily, the reduction was 37.3%, against 47.3% for CFC-BDP at 336 micrograms twice daily; 160 micrograms twice daily gave 24.6% and 80 micrograms twice daily gave 12.2%. A separate open-label study of 354 asthma patients treated at recommended doses for one year found that fewer than 1% had an abnormal response, defined as a peak below 18 micrograms per decilitre, to a short cosyntropin test. A dose-related fall in cortisol output at every studied dose, and a normal cosyntropin response in more than 99% of patients, are both true at once and describe different sensitivities of measurement.',
        evidenceSource:
          'QVAR REDIHALER (beclometasone dipropionate) United States prescribing information, Clinical Pharmacology 12.2 Pharmacodynamics',
        measuredMetric:
          'Percentage reduction in 24-hour urinary free cortisol by inhaled dose, and short cosyntropin response after one year',
        auditFlag: 'caution',
      },
      {
        id: 'bec-a4',
        category: 'inferred',
        title: 'The molecule in the canister is 25 times less active than the one that works',
        laymanSummary:
          'Beclometasone dipropionate is a prodrug. Its own label reports that the metabolite it turns into binds the receptor twenty-five times more tightly than it does — and then says nobody knows what the affinity numbers mean clinically.',
        technicalDetails:
          'The label states that beclometasone dipropionate is a prodrug rapidly activated by hydrolysis to the active monoester beclometasone-17-monopropionate, and that 17-BMP has been shown in vitro to bind the human glucocorticoid receptor with an affinity approximately 13 times that of dexamethasone, 6 times that of triamcinolone acetonide, 1.5 times that of budesonide and 25 times that of beclometasone dipropionate — followed by the statement that the clinical significance of these findings is unknown. The consequence is that any potency comparison against this drug depends on whether the parent or the metabolite is being compared, and the two differ by more than an order of magnitude. The fluticasone label, for example, compares itself to beclometasone-17-monopropionate rather than to beclometasone dipropionate, which is the right comparison and is easy to misread as a comparison against the marketed product.',
        evidenceSource:
          'QVAR REDIHALER United States prescribing information, Clinical Pharmacology 12.1; FLOVENT HFA United States prescribing information, Clinical Pharmacology 12.1',
        inferredClaim:
          'That a receptor-affinity ranking naming "beclomethasone" specifies a single potency — the administered diester and its active monoester differ 25-fold, and comparisons must name which one they mean',
        auditFlag: 'caution',
      },
      {
        id: 'bec-a5',
        category: 'conclusion_shift',
        title: 'Changing the propellant changed the drug, and the label’s own numbers show it',
        laymanSummary:
          'When CFC propellants were banned, this inhaler was reformulated. The new version produces much finer particles that travel deeper into the lung, so the same number of micrograms is no longer the same dose. The label compares them directly: 320 micrograms twice daily of the new formulation suppressed cortisol less than 336 micrograms twice daily of the old one.',
        technicalDetails:
          'The original beclometasone dipropionate metered-dose inhalers were chlorofluorocarbon-propelled suspensions. The current product is a hydrofluoroalkane solution aerosol, which produces a substantially finer aerosol and therefore a different distribution between oropharynx, large airways and small airways. The pharmacodynamic study in the label compares the two head to head on the most sensitive available systemic marker: 24-hour urinary free cortisol fell 37.3% on 320 micrograms twice daily of the HFA product against 47.3% on 336 micrograms twice daily of CFC-BDP. A near-identical microgram dose produced a measurably different systemic effect. That is the clearest demonstration in this file that for an inhaled drug, the number on the canister is a property of the product rather than of the molecule, and that dose-equivalence tables written for one formulation do not transfer to another.',
        evidenceSource:
          'QVAR REDIHALER United States prescribing information, Clinical Pharmacology 12.2 and Description 11',
        inferredClaim:
          'That "beclometasone 400 micrograms a day" names a defined exposure — it names a nominal canister dose, and the label’s own comparison shows two formulations at similar nominal doses producing different systemic effects',
        auditFlag: 'verified',
      },
      {
        id: 'bec-a6',
        category: 'measured',
        title: 'BEST: a steroid taken only when needed matched one taken twice daily',
        laymanSummary:
          'In 455 people with mild asthma, using a combined steroid-and-reliever inhaler only when symptoms occurred worked as well over six months as taking the steroid twice a day every day — and delivered a much smaller total amount of steroid.',
        technicalDetails:
          'A six-month double-blind, double-dummy, randomised, parallel-group trial assigned 455 patients with mild asthma, mean FEV1 2.96 L or 88.36% predicted, to one of four regimens after a four-week run-in: as-needed beclometasone 250 micrograms plus albuterol 100 micrograms in a single inhaler; as-needed albuterol 100 micrograms alone; regular beclometasone 250 micrograms twice daily with as-needed albuterol; or regular combination twice daily with as-needed albuterol. The primary outcome was morning peak expiratory flow. In the final two weeks, morning peak flow was higher in the as-needed combination group than in the as-needed albuterol group (P=0.04) and exacerbations over six months were fewer (P=0.002), while values in the as-needed combination group did not differ significantly from either regular-treatment group. The cumulative six-month dose of inhaled beclometasone was lower in the as-needed combination group than in either regular group (P<0.001 for both). This is the direct ancestor of the as-needed anti-inflammatory reliever strategy now built around budesonide-formoterol.',
        evidenceSource:
          'Papi A, Canonica GW, Maestrelli P, et al. N Engl J Med 2007;356:2040-2052 (BEST, NCT00382889)',
        doi: '10.1056/NEJMoa063861',
        measuredMetric:
          'Morning peak expiratory flow, exacerbation count and cumulative inhaled corticosteroid dose over six months across four regimens',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Inhaled as a fine solution aerosol',
        laymanDesc:
          'A breath-actuated inhaler releases a mist that is much finer than the older versions of this product were. Finer particles travel further into the lung and less of the dose is left in the mouth.',
        molecularDetail:
          'Beclometasone dipropionate dissolved in hydrofluoroalkane propellant with an ethanol cosolvent, delivered by a breath-actuated pressurised metered-dose inhaler with a dose counter. The predecessor products were CFC-propelled suspensions with a coarser aerosol, and the label carries a head-to-head pharmacodynamic comparison of the two.',
        iconName: 'Wind',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It is converted to the working molecule on arrival',
        laymanDesc:
          'What lands in the airway is a precursor. Enzymes in the tissue strip one of its two chemical side groups off, and the result is the molecule that actually does the work.',
        molecularDetail:
          'The label describes beclometasone dipropionate as a prodrug rapidly activated by hydrolysis to the active monoester, beclometasone-17-monopropionate, undergoing rapid and extensive conversion during absorption. The 17-monopropionate is the species with pharmacological activity.',
        iconName: 'Scissors',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The monoester binds the glucocorticoid receptor',
        laymanDesc:
          'The converted molecule binds a receptor waiting in the cell — about twenty-five times more tightly than the version that was inhaled would have done.',
        molecularDetail:
          'Beclometasone-17-monopropionate binds the human glucocorticoid receptor in vitro with an affinity approximately 13 times that of dexamethasone, 6 times triamcinolone acetonide, 1.5 times budesonide and 25 times beclometasone dipropionate, with clinical significance stated as unknown.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Inflammatory transcription is shut down',
        laymanDesc:
          'The receptor carries the drug into the nucleus and switches off the genes making inflammatory signals. It takes days, which is why this inhaler is useless during an attack.',
        molecularDetail:
          'The label states that the precise mechanism of corticosteroid action on asthma is not known, and describes inhibition of mast cells, eosinophils, basophils, lymphocytes, macrophages and neutrophils and of histamine, eicosanoids, leukotrienes and cytokines.',
        iconName: 'Dna',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Airway inflammation subsides',
        laymanDesc:
          'The lining becomes less swollen and less reactive. In mild asthma, taking it only when symptoms occurred matched taking it twice daily on peak flow and exacerbations over six months.',
        molecularDetail:
          'In BEST, as-needed beclometasone-albuterol in a single inhaler gave higher morning peak expiratory flow (P=0.04) and fewer exacerbations (P=0.002) than as-needed albuterol alone, and did not differ significantly from regular twice-daily beclometasone, at a significantly lower cumulative corticosteroid dose (P<0.001).',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'The systemic dose is small and measurable',
        laymanDesc:
          'At the highest recommended inhaled dose, the body’s own cortisol output falls by 37%. In children, a year of the nasal spray cost 0.9 cm of growth. Neither is a reason to leave asthma untreated; both are reasons to use the lowest dose that works.',
        molecularDetail:
          'Twenty-four-hour urinary free cortisol fell 12.2% at 80 micrograms twice daily, 24.6% at 160 and 37.3% at 320, with fewer than 1% of 354 patients showing an abnormal short-cosyntropin response after a year at recommended doses. The intranasal growth trial found 5.0 cm against 5.9 cm over a year with no HPA-axis difference — growth velocity being the more sensitive measure.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Skoner 2000 — one-year intranasal growth study in children',
        phase: 'Randomised, double-blind, parallel-group, placebo-controlled, 52 weeks',
        sampleSize: 100,
        primaryEndpoint:
          'Rate of change in standing height over one year in prepubertal children aged 6 to 9 with perennial allergic rhinitis',
        endpointMet: true,
        statisticalPValue:
          'Growth rate significantly slower on beclometasone in both intention-to-treat and completer analyses; mean change in standing height 5.0 cm against 5.9 cm at one year, difference evident by the one-month visit',
        unreportedAdverseSignals:
          'There was a statistically significant baseline imbalance in standing height, handled by analysis of covariance and confirmed by z-score normalisation. No between-group difference was found in HPA-axis assessment, so a normal cortisol test did not detect the effect that height measurement did.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'BEST (NCT00382889)',
        phase: 'Phase 4, randomised, double-blind, double-dummy, four-arm, six months',
        sampleSize: 455,
        primaryEndpoint: 'Morning peak expiratory flow rate',
        endpointMet: true,
        statisticalPValue:
          'As-needed combination against as-needed albuterol: higher morning peak flow (P=0.04) and fewer exacerbations (P=0.002); not significantly different from either regular-treatment arm; cumulative beclometasone dose lower than both regular arms (P<0.001)',
        unreportedAdverseSignals:
          'The primary endpoint is a peak-flow measurement over the final two weeks of six months in mild asthma, not an exacerbation endpoint in a high-risk population. The exacerbation finding is a secondary result in 455 patients.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'QVAR HPA-axis pharmacodynamic study',
        phase: 'Randomised, placebo- and active-controlled pharmacodynamic study',
        sampleSize: 40,
        primaryEndpoint:
          '24-hour urinary free cortisol on QVAR MDI 80, 160 or 320 micrograms twice daily against placebo and against CFC-beclometasone 336 micrograms twice daily',
        endpointMet: true,
        statisticalPValue:
          'Dose-related reduction in 24-hour urinary free cortisol: 12.2% at 80 micrograms twice daily, 24.6% at 160 and 37.3% at 320, against 47.3% for CFC-BDP 336 micrograms twice daily',
        unreportedAdverseSignals:
          'Forty corticosteroid-naive patients. The separate one-year open-label study in 354 patients found fewer than 1% with an abnormal short-cosyntropin response, so the dose-related cortisol suppression is detectable long before a clinical adrenal test becomes abnormal.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Mean growth of 5.0 cm against 5.9 cm over one year in 100 randomised children on intranasal beclometasone, evident by the one-month visit',
        'A 37.3% reduction in 24-hour urinary free cortisol at the highest recommended inhaled dose, and 12.2% at the lowest studied dose',
        'A 47.3% cortisol reduction on the CFC formulation at a near-identical microgram dose, against 37.3% on the HFA formulation',
        'Receptor affinity of the active monoester approximately 25 times that of the administered dipropionate',
        'As-needed beclometasone-albuterol matching regular twice-daily beclometasone on peak flow and exacerbations at a significantly lower cumulative steroid dose in 455 patients',
      ],
      unsupportedInferences: [
        'That a normal cortisol stimulation test excludes a systemic steroid effect — the growth study detected one where the HPA-axis test did not',
        'That a nominal microgram dose specifies exposure, when two formulations at similar nominal doses produced measurably different cortisol suppression',
        'That an affinity ranking naming "beclomethasone" is unambiguous, when the prodrug and its metabolite differ 25-fold',
        'That the intranasal growth finding transfers directly to the inhaled product, which is a different route and a different deposited dose',
      ],
      whatFailedInitially: [
        'A year of the nasal spray produced measurable growth suppression in a randomised trial while the accompanying adrenal testing found nothing',
        'Cortisol output fell in a dose-related way at every inhaled dose studied, including the lowest',
        'The matched study of another intranasal steroid published alongside it found no growth effect, so the finding is drug-specific rather than class-wide',
        'The propellant reformulation changed systemic effect at an equivalent nominal dose, invalidating the old dose-equivalence assumptions',
      ],
      realWorldOutcome: [
        'One of the oldest inhaled corticosteroids still in use, and still widely prescribed worldwide',
        'The BEST trial made it the origin of the as-needed anti-inflammatory reliever strategy that now dominates mild-asthma guidance',
        'Only four listed presentations remain in the CMS acquisition survey, all brand, at about thirty dollars a gram',
        'The paired 2000 growth studies established that intranasal corticosteroids differ from one another in systemic exposure, and that finding has outlived both products’ marketing',
      ],
    },
    deliverySystem: {
      type: 'Breath-actuated pressurised metered-dose inhalation aerosol with dose counter, and nasal aerosol and aqueous nasal spray',
      description:
        'Inhaled twice daily for asthma maintenance and never for acute symptoms. The current inhaler is a hydrofluoroalkane solution aerosol producing a much finer particle distribution than the chlorofluorocarbon suspensions it replaced, which changed how deep the drug travels and, on the label’s own cortisol data, how much systemic effect a given nominal dose produces.',
      safetyProfile:
        'Not for relief of acute symptoms; rapidly deteriorating asthma requires immediate re-evaluation. Oropharyngeal candidiasis with periodic monitoring and rinsing without swallowing after inhalation. Risk of impaired adrenal function when transferring from systemic corticosteroids, requiring slow tapering. Immunosuppression with potential worsening of tuberculosis and of fungal, bacterial, viral, parasitic and ocular herpes simplex infection, and a more serious or fatal course of chickenpox or measles in susceptible patients. Paradoxical bronchospasm with an immediate increase in wheezing after dosing requires immediate short-acting bronchodilator treatment and discontinuation. Dose-related reduction in 24-hour urinary free cortisol was measured at every dose studied, reaching 37.3% at the highest recommended dose.',
    },
    commonQuestions: [
      {
        q: 'Will the nasal spray affect my child’s growth?',
        a: 'For beclometasone specifically, a randomised trial says yes, by about 0.9 cm over a year. A hundred children aged 6 to 9 were given intranasal beclometasone or placebo for twelve months with height measured seven times on a stadiometer; the treated group grew 5.0 cm and the placebo group 5.9 cm, and the difference was already visible at one month. Adrenal function testing in the same children found no difference, so a normal cortisol test would have missed it. In the same issue of the same journal, an almost identical study of intranasal mometasone found no growth effect at all. That is a reason to discuss which spray, not a reason to leave rhinitis untreated.',
        auditNote:
          'The two studies were designed and sized alike and published together. That is what makes the pair informative rather than two isolated results pointing different ways.',
      },
      {
        q: 'Does the inhaler affect my hormones?',
        a: 'Measurably, and the label publishes the numbers rather than hiding them. In 40 steroid-naive patients, 24-hour urinary free cortisol fell by 12.2% at the lowest dose studied, 24.6% at the middle dose and 37.3% at the highest recommended dose. In a separate one-year study of 354 patients at recommended doses, fewer than 1% had an abnormal response to a short cosyntropin stimulation test. Both are true: cortisol output is suppressed in a dose-related way, and clinical adrenal insufficiency is rare. The practical consequence is to use the lowest dose that controls the asthma, which is what every guideline says for reasons exactly like this.',
      },
      {
        q: 'Why does the dose seem different from the old inhaler?',
        a: 'Because the propellant change altered the drug’s behaviour. The old inhalers were chlorofluorocarbon suspensions producing a relatively coarse aerosol; the current one is a hydrofluoroalkane solution producing a much finer one that travels deeper into the lung and leaves less in the mouth. The label compares them directly on cortisol suppression: 320 micrograms twice daily of the new formulation gave a 37.3% reduction, against 47.3% for 336 micrograms twice daily of the old one. Near-identical microgram numbers, different systemic effect. Dose-equivalence tables written for one formulation do not carry over to the other.',
      },
      {
        q: 'Is it true this drug is a prodrug?',
        a: 'Yes, and it matters for reading any potency comparison. What is inhaled is beclometasone dipropionate, which is rapidly hydrolysed to beclometasone-17-monopropionate, and it is the monopropionate that binds the glucocorticoid receptor — about twenty-five times more tightly than the diester does. So a statement that another steroid binds "twice as tightly as beclomethasone" means twice as tightly as the metabolite, not as the product in the canister, and the two differ by more than an order of magnitude. The label reports all of these numbers and then says their clinical significance is unknown.',
      },
      {
        q: 'Can I just use it when I have symptoms?',
        a: 'That question was asked about this exact drug, in 455 people with mild asthma, and the answer was more interesting than expected. Using beclometasone and albuterol together in one inhaler only when symptoms occurred gave higher morning peak flow and fewer exacerbations over six months than reliever alone, and did not differ significantly from taking the steroid twice daily every day — at a much lower total steroid dose. That trial is the ancestor of the as-needed anti-inflammatory reliever strategy now recommended in mild asthma, which is built around budesonide with formoterol rather than around this combination. Whether it applies to a particular person is a question for a prescriber, not a rule this page can give.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Skoner DP, Rachelefsky GS, Meltzer EO, et al. Detection of growth suppression in children during treatment with intranasal beclomethasone dipropionate. Pediatrics 2000;105:E23',
        identifier: '10.1542/peds.105.2.e23',
        kind: 'doi',
      },
      {
        label:
          'Schenkel EJ, Skoner DP, Bronsky EA, et al. Absence of growth retardation in children with perennial allergic rhinitis after one year of treatment with mometasone furoate aqueous nasal spray. Pediatrics 2000;105:E22',
        identifier: '10.1542/peds.105.2.e22',
        kind: 'doi',
      },
      {
        label:
          'Papi A, Canonica GW, Maestrelli P, et al. Rescue use of beclomethasone and albuterol in a single inhaler for mild asthma. N Engl J Med 2007;356:2040-2052',
        identifier: '10.1056/NEJMoa063861',
        kind: 'doi',
      },
      {
        label: 'BEST — as-needed beclometasone with albuterol in a single inhaler for mild asthma',
        identifier: 'NCT00382889',
        kind: 'nct',
      },
      {
        label:
          'QVAR REDIHALER (beclomethasone dipropionate inhalation aerosol) United States prescribing information — Indications and Limitations of Use, Warnings and Precautions 5.1 to 5.5, Description 11, Clinical Pharmacology 12.1 to 12.3',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22QVAR+REDIHALER%22',
        kind: 'regulatory',
      },
      {
        label:
          'PubChem CID 20469 — beclometasone structure, formula and molecular weight for the parent alcohol',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/20469',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
]
