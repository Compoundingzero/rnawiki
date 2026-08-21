import type { SeedDossier } from '@/lib/seed-types'

/**
 * Curated flagship dossiers — the allergy, cough and congestion shelf: the antihistamines people
 * buy without a prescription, the decongestants behind the pharmacy counter, and the two cough
 * medicines that between them have almost no randomised evidence at all.
 *
 * Editorial layer written over the machine-enriched records: the verdict, the mechanism carousel
 * and the audits, which no pipeline can produce. The identity facts — slug, trade name, sponsor,
 * approval year, SMILES, chemical formula and the CMS acquisition price — are copied from the
 * enriched record rather than researched again.
 *
 * Every DOI, PMID, NCT number and FDA application number below was resolved against the NCBI
 * E-utilities, the ClinicalTrials.gov v2 API or the openFDA Drugs@FDA and label endpoints at the
 * time of writing. Sample sizes, effect sizes, confidence intervals and p-values are copied from
 * the published abstract, from posted registry results, or from the FDA label, never from memory.
 * Where a number could not be sourced, the field is absent.
 *
 * Five conventions apply to the whole group.
 *
 * 1. SYMPTOM SCORES ARE THE ENDPOINT, AND THEY ARE SMALL. Almost every trial on this shelf measures
 *    a total symptom score summed over four to six symptoms rated 0 to 3. A drug that beats placebo
 *    by 0.9 points on such a scale has a real effect and a modest one, and the pages say the number
 *    rather than the adjective. Placebo response in allergic rhinitis is large, which is why several
 *    of these trials are null.
 *
 * 2. WHERE A REGISTRY HOLDS POSTED RESULTS, THE POSTED RESULTS ARE QUOTED. Several of these drugs
 *    have paired trials of identical design where one is positive and one is null, and only the
 *    positive one was written up. The registry is the only place that difference is visible, so the
 *    registry number is what appears here.
 *
 * 3. OLD APPROVALS ARE NOT VALIDATED APPROVALS. Diphenhydramine (1946) and benzonatate (1958)
 *    predate the 1962 Kefauver-Harris amendment that first required proof of efficacy. Guaifenesin
 *    sits in an OTC monograph. Being on the market for seventy years is a fact about regulation,
 *    not a fact about evidence, and the distinction is stated on each page it applies to.
 *
 * 4. THE PRICE IS WHAT PHARMACIES PAY, NOT WHAT PATIENTS PAY. Every retail figure is the median
 *    National Average Drug Acquisition Cost from the CMS survey effective 19 August 2026. No
 *    cost-of-production study has been published for any molecule in this group, so
 *    `synthesisCostPerDose` is empty throughout rather than estimated.
 *
 * 5. NO DOSING, PROTOCOL OR PROCUREMENT GUIDANCE. Strengths appear only where they are part of a
 *    trial's description or a product's regulatory identity. Nothing here tells a reader what to
 *    take, how much, or where to get it.
 */

export const ENRICHED_BATCH_14_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // 1. Levocetirizine — the single enantiomer of an existing antihistamine, sold on a two-fold
  //    receptor affinity whose clinical relevance the label itself calls unknown, and the subject
  //    of the cleanest null trial on this shelf.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'levocetirizine-dihydrochloride',
    name: 'Levocetirizine Dihydrochloride',
    tradeName: 'Xyzal / Xyzal Allergy 24HR',
    sponsor:
      'UCB Pharma developed it; the United States applications NDA 022064 (prescription, 2007) and NDA 209089 and 209090 (over-the-counter, 2017) are held by Chattem, a Sanofi company',
    targetGene: 'HRH1',
    targetProtein: 'Histamine H1 receptor — a human G-protein-coupled receptor',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2007,
    indication:
      'Relief of symptoms associated with seasonal and perennial allergic rhinitis, and treatment of the uncomplicated skin manifestations of chronic idiopathic urticaria',
    patientFriendlyIndication: 'Hay fever, year-round nasal allergy, and long-running hives',
    anatomicalSite:
      'Nasal mucosa and dermal postcapillary venules — H1 receptors on vascular endothelium and on sensory nerve endings',
    conditionContext: {
      conditionExplainer:
        'Allergic rhinitis is an immune reaction to something harmless. Mast cells lining the nose carry antibodies against pollen or dust mite; when the allergen arrives they release histamine within seconds, and histamine is what produces the itch, the sneeze, the running nose and the watering eyes.',
      whyItMatters:
        'The reaction is not dangerous but it is relentless, and in persistent disease it runs for months. The trials on this page measure symptom scores rather than survival for that reason: what is at stake is how bad the days are, not how many of them there are.',
      whoTakesThis:
        'Adults and children from six months of age. It is one of a handful of second-generation antihistamines sold without a prescription in the United States since 2017.',
      clinicalGoals:
        'A lower total symptom score across sneezing, itching, runny nose, blocked nose and itchy or watering eyes, without the sedation that defined the first generation of these drugs. Both halves of that goal are audited on this page.',
    },
    oneSentenceVerdict:
      'The active left-handed half of cetirizine, an H1 receptor inverse agonist that holds the histamine receptor in its resting shape rather than merely blocking histamine from reaching it — it lowered a five-symptom seasonal allergy score by 0.89 points against placebo in 580 adults (95% CI -1.33 to -0.45, p<0.001), produced no measurable benefit at all in a 596-adult trial of identical design (p=0.546), and completely failed the 514-child EPAAC trial that tested whether it prevents asthma (hazard ratio 1.002, 95% CI 0.750 to 1.338, p=0.991).',
    laymanHowItWorks:
      'When you meet something you are allergic to, cells in your nose and skin dump histamine, and histamine is the chemical that makes you itch, sneeze and run. Histamine works by switching on a receptor that sits on blood vessels and on nerve endings. Levocetirizine parks itself in that receptor and holds it in the off position, so the histamine that gets released has nowhere to act. It does nothing about the allergy itself, and it does not stop the histamine being released — it stops the message being received.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 72,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        '$0.1659 per mL of oral solution, median across 20 listed products (CMS National Average Drug Acquisition Cost, generic, effective 19 August 2026)',
      markupEstimate: '',
      synthesisComplexity: 'Moderate',
      openPatentNotes:
        'The prescription tablet under NDA 022064 was approved on 25 May 2007 and is now listed as discontinued. Two over-the-counter applications, NDA 209089 for the tablet and NDA 209090 for the solution, were approved together on 31 January 2017, and generics now dominate: the CMS survey lists twenty separate products for the solution alone.',
      costSource: {
        label:
          'No published cost-of-production study exists for levocetirizine; the field is left empty rather than estimated',
        identifier: 'https://www.medicaid.gov/medicaid/prescription-drugs/pharmacy-pricing',
        kind: 'url',
      },
      priceSource: {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) weekly reference file, effective 19 August 2026 — median across 20 listed levocetirizine products',
        identifier: 'https://www.medicaid.gov/medicaid/prescription-drugs/pharmacy-pricing',
        kind: 'regulatory',
      },
    },
    substitutes: {
      summary:
        'Every realistic alternative here is another H1 antagonist, and the head-to-head trials that exist separate them by fractions of a point on a symptom scale. The choice that actually changes outcomes is not which antihistamine but whether an antihistamine is the right class at all: for a blocked nose specifically, an intranasal corticosteroid outperforms every oral antihistamine ever tested against it.',
      conventionalRx: [
        {
          name: 'Cetirizine (Zyrtec)',
          class: 'Second-generation H1 antagonist — the racemic mixture levocetirizine was split from',
          howItCompares:
            'Levocetirizine is one of the two mirror-image halves of cetirizine, and it is the half that does the work: the label records an H1 affinity two-fold higher than cetirizine (Ki 3 nmol/L against 6 nmol/L) and states in the same sentence that the clinical relevance of that finding is unknown. UCB ran a 570-subject head-to-head comparison of the two in a ragweed exposure chamber (NCT00544388, completed July 2004) and never posted results to the registry.',
          typicalCost:
            '$0.0629 per unit at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: the same pharmacology at a lower acquisition cost per unit, and decades of use. Cons: the racemate carries the inactive enantiomer as well, which contributes nothing to the effect; both drugs share the same dose-related somnolence.',
        },
        {
          name: 'Fexofenadine (Allegra)',
          class: 'Second-generation H1 antagonist that does not enter the brain',
          howItCompares:
            'Positron emission tomography has measured brain H1 receptor occupancy directly for these drugs, and fexofenadine sits at essentially zero while cetirizine-class agents occupy a measurable fraction. If sedation is the deciding factor, that is the one comparison with a physical measurement behind it rather than a symptom questionnaire.',
          typicalCost:
            '$0.2407 per tablet at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: the least brain-penetrating of the common antihistamines. Cons: absorption is cut substantially by fruit juice through an intestinal uptake transporter, an interaction levocetirizine does not have.',
        },
        {
          name: 'Intranasal fluticasone or mometasone',
          class: 'Topical corticosteroid, a different mechanism entirely',
          howItCompares:
            'Suppresses the whole inflammatory cascade in the nasal lining rather than blocking one mediator at one receptor. It is the class that works on nasal blockage, which is the symptom antihistamines address worst, and it acts over days rather than within an hour.',
          typicalCost:
            'US$0.6920 per millilitre of fluticasone, median across 51 listed products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: better on congestion, works on the underlying inflammation. Cons: takes days to reach full effect, causes nosebleeds in a minority, and needs correct spray technique to reach the mucosa at all.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Saline nasal irrigation',
          action: 'Rinsing the nasal cavity with isotonic or hypertonic salt water.',
          patientImpact:
            'Physically removes deposited pollen and thins mucus. It does nothing to the histamine pathway and is not a substitute for a drug, but it is one of very few adjuncts in this area with randomised evidence behind it.',
          clinicalPrecaution:
            'Only sterile, distilled or previously boiled water should be used. Fatal primary amoebic meningoencephalitis has been traced to nasal irrigation with untreated tap water.',
        },
        {
          name: 'Note when the drowsiness happens',
          action:
            'Keep track of whether sleepiness follows the tablet, and mention it rather than assuming a second-generation antihistamine cannot cause it.',
          patientImpact:
            'Somnolence was reported by 6% of adults on the 5 mg dose in the pooled registration trials against 2% on placebo, it showed clear dose ordering between 2.5, 5 and 10 mg, and it was the commonest reason for stopping treatment.',
          clinicalPrecaution:
            'The label carries an explicit warning against driving or operating machinery, and against combining the drug with alcohol or other central nervous system depressants. "Non-sedating" is marketing language, not a label claim.',
        },
        {
          name: 'Know that stopping abruptly can itch',
          action:
            'If severe itching starts within days of stopping long-term treatment, say so rather than assuming the original allergy has returned worse.',
          patientImpact:
            'New-onset pruritus after discontinuation, usually following months to years of use, was added to the Warnings and Precautions section of the label after postmarketing reports. It was not seen in the registration programme.',
          clinicalPrecaution:
            'The label records that symptoms may improve on restarting or tapering. This is a genuine labelled warning, not an inference drawn here.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1CN(CCN1CCOCC(=O)O)[C@H](C2=CC=CC=C2)C3=CC=C(C=C3)Cl.Cl.Cl',
      chemicalFormula: 'C21H27Cl3N2O3',
      molecularWeight: '461.80 g/mol',
      targetReceptorAffinity:
        'In vitro binding gives an H1 receptor dissociation constant of Ki = 3 nmol/L for levocetirizine against 6 nmol/L for racemic cetirizine — a two-fold difference that is exactly what a fifty-fifty mixture of an active and an inactive enantiomer predicts. The label states that the clinical relevance of this finding is unknown. Dextrocetirizine, the other half, produced no clear inhibition of the histamine wheal and flare in healthy volunteers.',
      structureSource: {
        label:
          'PubChem CID 9955977 (levocetirizine dihydrochloride) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/9955977',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'lct-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Chiral identity of the (R)-benzhydryl piperazine intermediate',
          description:
            'Establish the absolute configuration at the single benzhydryl stereocentre before anything is attached to it. The whole commercial argument for this molecule is that it is one enantiomer rather than two, so enantiomeric excess is not a purity specification here — it is the product definition.',
          reagentsAndBuffer:
            'Chiral HPLC with amylose or cellulose tris(3,5-dimethylphenylcarbamate) stationary phase, hexane and isopropanol with diethylamine modifier, optical rotation against a certified reference standard, 1H NMR in DMSO-d6',
        },
        {
          id: 'lct-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'N-alkylation of the piperazine with the ethoxyacetic acid arm',
          description:
            'Alkylate the free piperazine nitrogen with a 2-(2-haloethoxy)acetate ester under base, then hydrolyse the ester to the free carboxylic acid. The carboxylate is the reason this class does not cross into the brain readily: at physiological pH the molecule carries both a positive and a negative charge, and a zwitterion is a poor substrate for passive diffusion across the blood-brain barrier.',
          dependsOnStepId: 'lct-w1',
          reagentsAndBuffer:
            'Methyl or ethyl 2-(2-chloroethoxy)acetate, potassium or sodium carbonate, sodium iodide as halide-exchange catalyst, toluene or acetonitrile at reflux, then aqueous sodium hydroxide for the ester hydrolysis',
        },
        {
          id: 'lct-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Dihydrochloride salt formation and crystallisation',
          description:
            'Convert the zwitterionic free acid to the dihydrochloride and crystallise. The salt is what makes an intensely polar molecule handle and dissolve as a tablet, and it is why the stored formula carries three chlorines: one on the aromatic ring and two as counter-ions. Racemisation is not a risk at this stage, but carry-over of the S-enantiomer from step one is, so chiral purity is re-measured on the isolated solid.',
          dependsOnStepId: 'lct-w2',
          reagentsAndBuffer:
            'Hydrogen chloride in isopropanol or ethyl acetate, anti-solvent crystallisation from acetone, chiral HPLC on the isolated salt, Karl Fischer titration, ion chromatography for chloride stoichiometry',
        },
        {
          id: 'lct-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Dosing membranes from cells expressing the human H1 receptor',
          description:
            'Prepare membranes from a cell line stably expressing recombinant human HRH1 and apply the compound alongside a radiolabelled reference ligand. The point of using a recombinant human receptor rather than a tissue homogenate is that guinea-pig and human H1 receptors differ enough in the binding pocket that a species-mismatched affinity is not transferable.',
          dependsOnStepId: 'lct-w3',
          reagentsAndBuffer:
            'CHO or HEK293 membranes expressing human HRH1, 50 mM Na/K phosphate buffer at pH 7.4, [3H]mepyramine as radioligand, mianserin or triprolidine to define non-specific binding, GF/B filters presoaked in polyethylenimine',
        },
        {
          id: 'lct-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Ki determination and the human wheal-and-flare confirmation',
          description:
            'Fit the displacement curve to a Ki, then confirm the result in the only human pharmacodynamic assay that matters for this class: intradermal histamine, and the size of the wheal and the surrounding flare it raises. Reporting the receptor number without the skin result would leave the two-fold affinity claim untested in a person, and the skin test is where dextrocetirizine visibly does nothing.',
          dependsOnStepId: 'lct-w4',
          reagentsAndBuffer:
            'Scintillation cocktail and beta counter for the binding arm; intradermal histamine phosphate, saline control, planimetry or digital image analysis of wheal and flare area at fixed intervals to 24 hours for the human arm',
        },
      ],
    },
    keyAudits: [
      {
        id: 'lct-a1',
        category: 'measured',
        title: 'A 0.89-point advantage over placebo on a five-symptom score in 580 adults',
        laymanSummary:
          'In a two-week placebo-controlled trial in seasonal hay fever, people on the drug scored about nine-tenths of a point lower on a five-symptom scale than people on a dummy tablet. That is a real difference and a small one, and it is the size of effect this whole drug class produces.',
        technicalDetails:
          'A multi-centre, randomised, double-blind, placebo-controlled parallel-group study in 580 adults with seasonal allergic rhinitis reported a mean 24-hour reflective Total 5 Symptoms Score of 7.87 on levocetirizine 5 mg once daily against 8.68 on placebo over the full 14-day treatment period. The ANCOVA mean difference was -0.89 (95% CI -1.33 to -0.45), p<0.001. The T5SS sums sneezing, rhinorrhoea, nasal itching, nasal congestion and ocular itching, each rated 0 to 3, over morning and evening assessments.',
        evidenceSource:
          'NCT00653224, posted registry results, UCB Pharma — primary outcome measure, 14-day treatment period',
        measuredMetric:
          'Mean 24-hour reflective Total 5 Symptoms Score over 14 days against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'lct-a2',
        category: 'failed',
        title: 'The twin trial, same design and 596 adults, found nothing',
        laymanSummary:
          'The manufacturer ran a second trial with the same design, the same drug and slightly more people. It found no difference from the dummy tablet at all. The two trials sit side by side in the registry, and only one of them is the one usually quoted.',
        technicalDetails:
          'NCT00621959 was a multi-centre, randomised, double-blind, placebo-controlled parallel-group study of levocetirizine 5 mg once daily for two weeks in 596 adults with seasonal allergic rhinitis, with the same primary endpoint as NCT00653224. The mean 24-hour reflective Total 5 Symptoms Score was 8.77 on levocetirizine against 8.96 on placebo. The ANCOVA mean difference was -0.14 (95% CI -0.59 to 0.31), p=0.546. The confidence interval spans zero comfortably in both directions.',
        evidenceSource:
          'NCT00621959, posted registry results, UCB Pharma — primary outcome measure, 14-day treatment period',
        measuredMetric:
          'Mean 24-hour reflective Total 5 Symptoms Score over 14 days against placebo — null',
        auditFlag: 'caution',
      },
      {
        id: 'lct-a3',
        category: 'failed',
        title: 'EPAAC: 514 toddlers, 18 months of treatment, hazard ratio 1.002',
        laymanSummary:
          'The largest and longest trial of this drug ever run asked whether giving it to allergic toddlers for a year and a half would stop them developing asthma. The answer was no, and it was not a near miss: the two groups were indistinguishable.',
        technicalDetails:
          'The Early Prevention of Asthma in Atopic Children study randomised 514 children aged 12 to 24 months with atopic dermatitis and sensitisation to grass pollen or house dust mite to levocetirizine 0.125 mg/kg twice daily or placebo for 18 months. The primary outcome, time to onset of asthma during treatment, gave a Cox hazard ratio of 1.002 (95% CI 0.750 to 1.338), p=0.991. First-quartile time to asthma onset was 10.3 months on levocetirizine and 9.5 months on placebo. The planned 18-month extension trial, NCT00160563, enrolled 207 children and was then terminated, with the registry recording the reason in plain words: the predecessor study did not show statistical significance in time to onset of asthma between the levocetirizine and placebo groups.',
        evidenceSource:
          'NCT00152464 (EPAAC), posted registry results, UCB Pharma; termination reason recorded on NCT00160563',
        measuredMetric: 'Time to onset of asthma over 18 months of treatment, Cox hazard ratio',
        auditFlag: 'verified',
      },
      {
        id: 'lct-a4',
        category: 'conclusion_shift',
        title:
          'The subgroup that justified EPAAC came from ETAC, and EPAAC was built to confirm it and did not',
        laymanSummary:
          'An earlier trial of the parent drug missed its main target but reported that a subgroup of allergic infants did better. That subgroup finding is what the next trial was designed around. The next trial enrolled exactly that subgroup, and the effect was gone.',
        technicalDetails:
          'The Early Treatment of the Atopic Child study gave cetirizine 0.25 mg/kg twice daily or placebo to infants aged 1 to 2 years with atopic dermatitis for 18 months with 18 months of follow-up. There was no difference in cumulative prevalence of asthma in the intention-to-treat population (p=0.7). Infants sensitised to house dust mite or grass pollen were reported as significantly less likely to develop asthma on cetirizine over the treatment period (p=0.005 and p=0.002), sustained for the grass-pollen group at 36 months (p=0.008), and the authors wrote that further studies focusing specifically on sensitised groups were required to substantiate the finding. EPAAC was that study: it enrolled only children sensitised to grass pollen or house dust mite, used the active enantiomer, and returned a hazard ratio of 1.002. This is the textbook sequence in which a post-hoc subgroup survives one trial and does not survive the trial designed to test it.',
        evidenceSource:
          'Warner JO; ETAC Study Group. J Allergy Clin Immunol 2001;108:929-937; EPAAC posted results, NCT00152464',
        doi: '10.1067/mai.2001.120015',
        inferredClaim:
          'That early H1-antihistamine treatment of sensitised atopic infants prevents or delays asthma — an inference from an ETAC subgroup that the confirmatory trial specifically enrolling that subgroup did not reproduce',
        auditFlag: 'verified',
      },
      {
        id: 'lct-a5',
        category: 'inferred',
        title: 'The two-fold receptor affinity is the marketing case, and the label calls it unknown',
        laymanSummary:
          'The drug is one half of an older, cheaper drug. It binds the target twice as tightly as the mixture does, which is arithmetically what you would expect if the other half does nothing. Whether that translates into working better in a person has never been shown.',
        technicalDetails:
          'The Xyzal label records an in vitro human H1 receptor affinity of Ki = 3 nmol/L for levocetirizine against 6 nmol/L for cetirizine, and states in the following sentence that the clinical relevance of this finding is unknown. A racemate containing 50% inactive enantiomer would show exactly a two-fold lower apparent affinity by mass, so the number is consistent with the enantiomer being no more potent per molecule than it already was inside the racemate. UCB completed a 570-subject randomised head-to-head of levocetirizine against cetirizine in a controlled ragweed exposure chamber in July 2004 (NCT00544388) with a primary endpoint of major symptom complex change 21 to 29 hours after dosing; the registry record carries no posted results and no linked publication.',
        evidenceSource:
          'XYZAL prescribing information, section 12.1 Mechanism of Action (NDA 022064); NCT00544388 registry record, UCB Pharma, completed July 2004, no results posted',
        inferredClaim:
          'That the single enantiomer relieves symptoms better than the racemate it was separated from — an in vitro affinity ratio presented as a therapeutic advantage, with the one registered head-to-head trial unreported',
        auditFlag: 'contested',
      },
      {
        id: 'lct-a6',
        category: 'measured',
        title: 'It beat desloratadine in chronic hives by a quarter of a point',
        laymanSummary:
          'A large head-to-head trial in long-running hives found this drug slightly better than its main rival. The difference was statistically solid and clinically small: a quarter of a point on a scale where the average score was about two.',
        technicalDetails:
          'A randomised, double-blind Phase 4 study in 886 patients with chronic idiopathic urticaria compared levocetirizine 5 mg with desloratadine 5 mg, both once daily in the morning. The mean CIU composite score over the first week of treatment was 1.98 on levocetirizine against 2.23 on desloratadine, an ANCOVA net mean difference of 0.25 (95% CI 0.08 to 0.43), p=0.005. Separately, a pooled analysis of two placebo-controlled urticaria trials in 294 patients reported an additional 6.5 pruritus-free days per 30-day month on levocetirizine against placebo (95% CI 3.8 to 9.3, p<0.001).',
        evidenceSource:
          'NCT00264303, posted registry results, UCB Pharma; Kapp A, Demarteau N. Clin Drug Investig 2006;26:1-11',
        doi: '10.2165/00044011-200626010-00001',
        measuredMetric:
          'Mean chronic idiopathic urticaria composite score over week 1, levocetirizine against desloratadine',
        auditFlag: 'verified',
      },
      {
        id: 'lct-a7',
        category: 'failed',
        title: 'It is sedating in a measurable, dose-related way, and two warnings arrived after approval',
        laymanSummary:
          'Sleepiness was three times more common on the drug than on the dummy tablet, and it got worse as the dose went up. Two further problems — difficulty passing urine, and severe itching on stopping after long use — were only found once the drug was on the market.',
        technicalDetails:
          'Across eight placebo-controlled trials in 1,896 adults and adolescents, somnolence was reported by 61 of 1,070 subjects (6%) on 5 mg and 22 of 421 (5%) on 2.5 mg against 16 of 912 (2%) on placebo, with clear dose ordering across 2.5, 5 and 10 mg. It was the commonest adverse reaction leading to discontinuation (0.5%). The label warns against hazardous activity requiring alertness and against concurrent alcohol or CNS depressants. Two further Warnings and Precautions entries derive from postmarketing reports rather than trials: urinary retention, with advice to discontinue if it occurs, and new-onset pruritus within days of stopping after months-to-years of use, which the label notes may improve on restarting or tapering.',
        evidenceSource:
          'XYZAL prescribing information, sections 5.1, 5.2, 5.3 and Table 1 of 6.1 Clinical Trials Experience (NDA 022064)',
        measuredMetric:
          'Somnolence incidence against placebo across eight controlled trials in 1,896 subjects',
        auditFlag: 'caution',
      },
      {
        id: 'lct-a8',
        category: 'measured',
        title: 'Six months of treatment improved quality of life, in the trial designed to test it',
        laymanSummary:
          'A six-month trial in people with year-round allergy measured how much the illness interfered with daily life, not just symptom counts. The drug improved that measure by more than the pre-agreed threshold for a difference patients would notice.',
        technicalDetails:
          'The Xyzal in Persistent Rhinitis Trial randomised 551 adults sensitised to both grass pollen and house dust mite to levocetirizine 5 mg daily or placebo for six months, with 421 completing. Co-primary endpoints were the Rhinoconjunctivitis Quality of Life Questionnaire overall score and the Total 5 Symptoms Score over four weeks; both improved significantly from week 1 through month 6 (all p<0.001). The relative improvement over placebo exceeded the pre-defined 30% threshold for clinical meaningfulness on all RQLQ scores, and improvement from baseline was three times the established minimal important difference. SF-36 physical and mental summary scores also improved (p<=0.004).',
        evidenceSource:
          'Bachert C et al., J Allergy Clin Immunol 2004;114:838-844 (XPERT); Canonica GW et al., Respir Med 2006;100:1706-1715',
        doi: '10.1016/j.jaci.2004.05.070',
        measuredMetric:
          'RQLQ overall score and Total 5 Symptoms Score over 6 months against placebo in 551 patients',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed, absorbed fast, and mostly excreted unchanged',
        laymanDesc:
          'The tablet dissolves and the drug is in the bloodstream within about an hour. The liver barely touches it, which is why it has almost no interactions with other medicines.',
        molecularDetail:
          'Peak plasma concentration is reached at about 0.9 hours after the tablet and 0.5 hours after the oral solution, with steady state after two days and an accumulation ratio of 1.12. Plasma protein binding is 91 to 92%. In vitro data indicate levocetirizine is unlikely to inhibit or induce hepatic drug-metabolising enzymes; the drug is largely excreted unchanged in urine.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It stays outside the brain, mostly',
        laymanDesc:
          'The molecule carries opposing electrical charges at the same time, which makes it hard to cross into the brain. That is the design feature separating this generation of antihistamines from the older ones — though not perfectly, as the sleepiness figures show.',
        molecularDetail:
          'At physiological pH the carboxylate is deprotonated and a piperazine nitrogen is protonated, giving a zwitterion with poor passive membrane permeability, and the molecule is additionally a substrate for P-glycoprotein efflux at the blood-brain barrier. Exclusion is partial rather than absolute: somnolence still occurred in 6% of adults on 5 mg against 2% on placebo, with dose ordering to 10 mg.',
        iconName: 'ShieldAlert',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It occupies the histamine receptor and holds it switched off',
        laymanDesc:
          'The receptor histamine acts on flips between an on shape and an off shape by itself, even with no histamine around. This drug binds the off shape and locks it there, so the background signalling stops as well as the histamine-driven signalling.',
        molecularDetail:
          'Levocetirizine is an inverse agonist rather than a neutral antagonist at HRH1: it preferentially stabilises the inactive receptor conformation and reduces constitutive Gq/11 signalling below baseline. Ki at the human H1 receptor is 3 nmol/L. The R-enantiomer carries essentially all of this activity; dextrocetirizine showed no clear inhibition of the human histamine wheal and flare.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Blood vessels stop leaking and nerve endings stop firing',
        laymanDesc:
          'With the receptor held off, small blood vessels in the nose and skin stop opening up and leaking fluid, and the itch nerves stop being triggered. The swelling, the running and the itching fall away together because they all came from the same switch.',
        molecularDetail:
          'H1 blockade on postcapillary venule endothelium prevents the phospholipase C, inositol trisphosphate and calcium cascade that drives nitric oxide release, vasodilatation and gap formation between endothelial cells; H1 blockade on unmyelinated C-fibre terminals prevents the depolarisation read as itch. In humans this is measured directly as suppression of the intradermal histamine wheal and flare, sustained for at least 24 hours after a 5 mg dose.',
        iconName: 'Droplet',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Symptom scores fall by about one point in five',
        laymanDesc:
          'The measurable result is a lower total symptom score, roughly a tenth to a fifth off the untreated number. It is a real improvement in how the days feel, not a cure, and the allergy itself is untouched.',
        molecularDetail:
          'In the 580-patient seasonal rhinitis trial the mean 24-hour reflective Total 5 Symptoms Score fell from 8.68 on placebo to 7.87 on treatment, a difference of -0.89 (95% CI -1.33 to -0.45). Nasal congestion is the symptom least affected, because it is driven substantially by leukotrienes and by late-phase cellular infiltration rather than by histamine at H1.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What blocking one receptor cannot do',
        laymanDesc:
          'It does not stop the allergic reaction being set off, and it does not change what happens next. Giving it to allergic toddlers for eighteen months did not stop them developing asthma.',
        molecularDetail:
          'H1 antagonism acts downstream of IgE cross-linking and mast cell degranulation and leaves mediator release, eosinophil recruitment and the late-phase response substantially intact. EPAAC tested the disease-modification hypothesis directly in 514 sensitised infants over 18 months and returned a hazard ratio for asthma onset of 1.002 (95% CI 0.750 to 1.338).',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'XPERT (Bachert 2004, J Allergy Clin Immunol 114:838-844)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, 6 months',
        sampleSize: 551,
        primaryEndpoint:
          'RQLQ overall score and Total 5 Symptoms Score over 4 weeks in persistent allergic rhinitis',
        endpointMet: true,
        statisticalPValue:
          'All p<0.001 from week 1 through month 6; relative improvement over placebo exceeded the pre-defined 30% clinically meaningful threshold on all RQLQ scores',
        unreportedAdverseSignals:
          'Predates trial registration, so there is no registry record against which the published analysis can be checked. 130 of 551 randomised patients did not complete.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'NCT00653224',
        phase: 'Phase 4, randomised, double-blind, placebo-controlled, 2 weeks',
        sampleSize: 580,
        primaryEndpoint:
          'Mean 24-hour reflective Total 5 Symptoms Score over the 14-day treatment period',
        endpointMet: true,
        statisticalPValue:
          '7.87 against 8.68 on placebo; ANCOVA mean difference -0.89 (95% CI -1.33 to -0.45), p<0.001',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'NCT00621959',
        phase: 'Phase 4, randomised, double-blind, placebo-controlled, 2 weeks',
        sampleSize: 596,
        primaryEndpoint:
          'Mean 24-hour reflective Total 5 Symptoms Score over the 14-day treatment period',
        endpointMet: false,
        statisticalPValue:
          '8.77 against 8.96 on placebo; ANCOVA mean difference -0.14 (95% CI -0.59 to 0.31), p=0.546',
        unreportedAdverseSignals:
          'Same sponsor, same design and same endpoint as NCT00653224, one week apart in size. The null result is visible only in the posted registry results.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'EPAAC (NCT00152464)',
        phase: 'Phase 3, randomised, double-masked, placebo-controlled, 18 months',
        sampleSize: 514,
        primaryEndpoint:
          'Time to onset of asthma during 18 months of treatment in sensitised atopic children aged 12 to 24 months',
        endpointMet: false,
        statisticalPValue: 'Cox hazard ratio 1.002 (95% CI 0.750 to 1.338), p=0.991',
        unreportedAdverseSignals:
          'The safety and urticaria analyses were published as separate papers; the null primary asthma outcome appears only in the posted registry results. The 207-child extension trial NCT00160563 was terminated because of it.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'NCT00264303',
        phase: 'Phase 4, randomised, double-blind, active-controlled against desloratadine',
        sampleSize: 886,
        primaryEndpoint:
          'Mean chronic idiopathic urticaria composite score over the first week of treatment',
        endpointMet: true,
        statisticalPValue:
          '1.98 against 2.23 for desloratadine; ANCOVA net mean difference 0.25 (95% CI 0.08 to 0.43), p=0.005',
        unreportedAdverseSignals:
          'Sponsored by the manufacturer of the winning drug, with no placebo arm, so the trial measures the gap between two active drugs and not the size of either effect.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'NCT00544388',
        phase: 'Phase 3, randomised, head-to-head against cetirizine in a pollen exposure chamber',
        sampleSize: 570,
        primaryEndpoint:
          'Mean change from baseline in major symptom complex score 21 to 29 hours after dosing on day 2',
        endpointMet: false,
        statisticalPValue:
          'Not reported. The study completed in July 2004 and the registry record carries no posted results and no linked publication.',
        unreportedAdverseSignals:
          'This is the one registered trial that directly tests the enantiomer against the racemate it was separated from, and its results are not public.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A mean Total 5 Symptoms Score of 7.87 against 8.68 on placebo in 580 adults, a difference of -0.89 (95% CI -1.33 to -0.45)',
        'Human H1 receptor affinity Ki = 3 nmol/L, against 6 nmol/L for racemic cetirizine',
        'Somnolence in 6% of adults on 5 mg against 2% on placebo across eight controlled trials in 1,896 subjects, with dose ordering',
        'A composite urticaria score 0.25 points better than desloratadine in 886 patients (95% CI 0.08 to 0.43, p=0.005)',
        'An additional 6.5 pruritus-free days per month against placebo in a pooled analysis of 294 urticaria patients',
      ],
      unsupportedInferences: [
        'That the single enantiomer works better in patients than the racemate — the two-fold affinity is exactly what removing an inactive enantiomer predicts, and the one registered head-to-head trial has no posted results',
        'That early antihistamine treatment of sensitised atopic infants prevents asthma — the ETAC subgroup that suggested it did not survive EPAAC',
        'That a second-generation antihistamine is non-sedating — the label warns against driving and against alcohol, and lists somnolence as the commonest cause of discontinuation',
        'That the positive seasonal rhinitis trial characterises the drug on its own — its identically designed twin was null',
      ],
      whatFailedInitially: [
        'NCT00621959, 596 adults, same design as the positive trial: mean difference -0.14 (95% CI -0.59 to 0.31), p=0.546',
        'EPAAC, 514 sensitised toddlers over 18 months: hazard ratio for asthma onset 1.002 (95% CI 0.750 to 1.338), p=0.991',
        'The EPAAC extension NCT00160563 was terminated after enrolling 207 children, the registry naming the null predecessor as the reason',
        'Urinary retention and post-discontinuation pruritus were added to the label from postmarketing reports, not found in the registration programme',
      ],
      realWorldOutcome: [
        'Approved 25 May 2007 as a prescription tablet under NDA 022064, now listed as discontinued in that form',
        'Switched to over-the-counter sale on 31 January 2017 under NDA 209089 and 209090, both held by Chattem, a Sanofi company',
        'Generic throughout: the CMS acquisition survey lists twenty separate products for the oral solution alone',
        'Indicated down to six months of age, one of the widest paediatric ranges of any second-generation antihistamine',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet (5 mg) and oral solution (2.5 mg per 5 mL)',
      description:
        'Taken once daily in the evening in the registration trials. A high-fat meal delays peak concentration by about 1.25 hours and lowers peak by about 36% without changing total exposure, so it can be taken with or without food. The 5 mg oral solution is bioequivalent to the 5 mg tablet.',
      safetyProfile:
        'Somnolence, fatigue and asthenia, dose-ordered across 2.5, 5 and 10 mg, with an explicit label warning against driving, operating machinery, and concurrent alcohol or CNS depressants. Postmarketing warnings for urinary retention and for new-onset pruritus within days of discontinuation after long-term use. A single 30 mg dose did not prolong QTc; multiple-dose QTc effects are stated as unknown. Cleared renally, so exposure rises in impaired kidney function. No clinically meaningful hepatic enzyme interactions were found in vitro, and no in vivo interaction studies were performed with levocetirizine itself.',
    },
    commonQuestions: [
      {
        q: 'Is this better than cetirizine, the older drug it was separated from?',
        a: 'Nobody outside the manufacturer knows. Levocetirizine is one of the two mirror-image halves of cetirizine, and it is the half that binds the receptor; the label records a two-fold higher affinity and then says in the next sentence that the clinical relevance of that finding is unknown. A two-fold difference is arithmetically what you would expect from removing an inert enantiomer by mass, not evidence of a better molecule. UCB ran a 570-subject randomised head-to-head of the two drugs in a controlled ragweed chamber, completed it in July 2004, and the registry record carries no posted results and no publication. That is the trial that would answer this question.',
        auditNote:
          'Single-enantiomer versions of established racemates are a recognised patent strategy. That does not make the drug worse, but it does mean the burden of proof for the improvement claim sits with the manufacturer, and here it has not been discharged in public.',
      },
      {
        q: 'How much does it actually help?',
        a: 'By about nine-tenths of a point on a five-symptom scale, in the trial that worked. Sneezing, runny nose, itchy nose, blocked nose and itchy eyes are each rated 0 to 3 and summed; untreated patients in that trial scored 8.68 and treated patients scored 7.87. That is a real difference, statistically solid, and roughly a tenth of the symptom burden. A second trial of the same design in 596 people found no difference at all. The honest summary is that this class takes the edge off rather than switching the allergy off, and that placebo response in allergic rhinitis is large enough to swallow the effect in some trials.',
      },
      {
        q: 'Will it make me sleepy?',
        a: 'It can, and the numbers are on the label. Somnolence was reported by 6% of adults on 5 mg against 2% on placebo, it increased with dose across 2.5, 5 and 10 mg, and it was the commonest reason people stopped taking it in the trials. The label carries a direct warning against driving or operating machinery and against combining it with alcohol. "Second generation" means the molecule is built to stay out of the brain — it carries opposing charges that make membrane crossing hard — but the exclusion is partial, not absolute. If sedation is the deciding factor, fexofenadine is the one whose near-zero brain receptor occupancy has been measured directly by imaging.',
      },
      {
        q: 'Can giving it to an allergic child stop them getting asthma?',
        a: 'No. This was tested properly and the answer was clear. The EPAAC trial randomised 514 children aged one to two with eczema and proven sensitisation to grass pollen or house dust mite to eighteen months of levocetirizine or placebo, and measured how long it took each child to develop asthma. The hazard ratio was 1.002 with a confidence interval from 0.750 to 1.338 and a p-value of 0.991 — as close to no effect as a trial can produce. The planned extension study was stopped, and the registry states the reason outright. The idea came from a subgroup in an earlier trial of cetirizine, and EPAAC was designed specifically to test that subgroup.',
        auditNote:
          'The safety findings from EPAAC and its urticaria results were published in journals. The null primary outcome is available only in the posted registry results.',
      },
      {
        q: 'What happens if I stop after taking it for a long time?',
        a: 'For most people, nothing. For some, severe itching starts within a few days of stopping, and this is on the label: new-onset pruritus after discontinuation, usually after months to years of use, which the label notes may improve on restarting or tapering. It was not seen in the registration trials and was added from postmarketing reports. It is easy to mistake for the original allergy coming back worse, which is why it is worth naming rather than assuming.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Bachert C et al. Levocetirizine improves quality of life and reduces costs in long-term management of persistent allergic rhinitis. J Allergy Clin Immunol 2004;114:838-844 (XPERT)',
        identifier: '10.1016/j.jaci.2004.05.070',
        kind: 'doi',
      },
      {
        label:
          'Canonica GW et al. Levocetirizine improves health-related quality of life and health status in persistent allergic rhinitis. Respir Med 2006;100:1706-1715 (XPERT)',
        identifier: '10.1016/j.rmed.2006.03.039',
        kind: 'doi',
      },
      {
        label:
          'Warner JO; ETAC Study Group. A double-blinded, randomized, placebo-controlled trial of cetirizine in preventing the onset of asthma in children with atopic dermatitis. J Allergy Clin Immunol 2001;108:929-937',
        identifier: '10.1067/mai.2001.120015',
        kind: 'doi',
      },
      {
        label:
          'Simons FE; EPAAC Study Group. Safety of levocetirizine treatment in young atopic children: an 18-month study. Pediatr Allergy Immunol 2007;18:535-542',
        identifier: '10.1111/j.1399-3038.2007.00558.x',
        kind: 'doi',
      },
      {
        label:
          'Kapp A, Demarteau N. Cost effectiveness of levocetirizine in chronic idiopathic urticaria: a pooled analysis of two randomised controlled trials. Clin Drug Investig 2006;26:1-11',
        identifier: '10.2165/00044011-200626010-00001',
        kind: 'doi',
      },
      {
        label:
          'EPAAC: prevention of asthma with levocetirizine, 18 months, 514 children — posted results, primary outcome hazard ratio 1.002',
        identifier: 'NCT00152464',
        kind: 'nct',
      },
      {
        label:
          'EPAAC prolongation trial, terminated because the predecessor showed no significance in time to onset of asthma',
        identifier: 'NCT00160563',
        kind: 'nct',
      },
      {
        label: 'Levocetirizine 5 mg against placebo in seasonal allergic rhinitis, 580 adults — positive',
        identifier: 'NCT00653224',
        kind: 'nct',
      },
      {
        label: 'Levocetirizine 5 mg against placebo in seasonal allergic rhinitis, 596 adults — null',
        identifier: 'NCT00621959',
        kind: 'nct',
      },
      {
        label: 'Levocetirizine against desloratadine in chronic idiopathic urticaria, 886 patients',
        identifier: 'NCT00264303',
        kind: 'nct',
      },
      {
        label:
          'Levocetirizine against cetirizine in a ragweed environmental exposure unit, 570 subjects — completed July 2004, no results posted',
        identifier: 'NCT00544388',
        kind: 'nct',
      },
      {
        label:
          'Drugs@FDA: XYZAL (levocetirizine dihydrochloride), NDA 022064, approved 25 May 2007; XYZAL ALLERGY 24HR, NDA 209089 and NDA 209090, approved over-the-counter 31 January 2017',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=022064',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 9955977 — levocetirizine dihydrochloride structure, formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/9955977',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 2. Fexofenadine — the harmless metabolite of a drug the FDA took off the market for stopping
  //    hearts, and the only antihistamine whose absence from the brain has been photographed.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'fexofenadine',
    name: 'Fexofenadine',
    tradeName: 'Allegra / Allegra Allergy',
    sponsor:
      'Hoechst Marion Roussel developed it as the active metabolite of its own terfenadine; the United States applications, beginning with NDA 020625 in 1996, are now held by Chattem, a Sanofi company',
    targetGene: 'HRH1',
    targetProtein: 'Histamine H1 receptor — a human G-protein-coupled receptor',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1996,
    indication:
      'Temporary relief of runny nose, sneezing, itchy or watery eyes and itching of the nose or throat due to hay fever or other upper respiratory allergies, and reduction of hives and relief of itching due to chronic idiopathic urticaria',
    patientFriendlyIndication: 'Hay fever and long-running hives',
    anatomicalSite:
      'Nasal and conjunctival mucosa and dermal postcapillary venules — peripheral H1 receptors only; measured brain H1 occupancy is essentially zero',
    conditionContext: {
      conditionExplainer:
        'The same allergic reaction every antihistamine addresses: mast cells in the lining of the nose and eyes release histamine within seconds of meeting an allergen, and histamine produces the sneeze, the itch and the running.',
      whyItMatters:
        'Fexofenadine exists because its parent drug killed people. Terfenadine was the first antihistamine that did not sedate, and it turned out to block a cardiac potassium channel; when anything slowed its breakdown, the parent drug accumulated and the heart went into torsades de pointes. Fexofenadine is the piece of terfenadine the liver was making all along — the piece that blocks histamine and leaves the potassium channel alone.',
      whoTakesThis:
        'Adults and children from two years of age, sold without a prescription in the United States. It is the usual choice when a person has to drive, fly or operate machinery.',
      clinicalGoals:
        'Symptom relief without central nervous system effect. The second half of that goal is the one with a physical measurement behind it rather than a questionnaire.',
    },
    oneSentenceVerdict:
      'The carboxylic-acid metabolite of terfenadine — it blocks the histamine H1 receptor while, unlike its parent, leaving the cardiac delayed-rectifier potassium current untouched even at thirty times the concentration at which terfenadine half-blocks it, and positron emission tomography measures its brain H1 receptor occupancy at -0.1% against 26.0% for cetirizine; it beat placebo on total symptom score in 570 and 861 patients, and in both of those trials the primary score excluded nasal congestion.',
    laymanHowItWorks:
      'Histamine is the chemical your body releases during an allergic reaction, and it works by switching on a receptor in your nose, eyes and skin. Fexofenadine sits in that receptor and holds it shut. What makes it unusual is where it does not go: the molecule carries an electrical charge that stops it crossing into the brain, and brain scans of people who have taken it show essentially none of it reaching the brain receptors that cause drowsiness. Older antihistamines went everywhere; this one stays where the allergy is.',
    auditConfidence: 'High Confidence',
    confidenceScore: 79,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        '$0.2407 per unit, median across 52 listed products (CMS National Average Drug Acquisition Cost, generic, effective 19 August 2026)',
      markupEstimate: '',
      synthesisComplexity: 'Moderate',
      openPatentNotes:
        'The original prescription capsule, NDA 020625, is listed as discontinued with a Federal Register determination that the product was not withdrawn for safety or effectiveness reasons. The tablet application NDA 020872, approved 25 February 2000, is now over-the-counter, as are the pseudoephedrine combinations NDA 020786 (1997) and NDA 021704 (2004) and the children’s suspension NDA 201373 (2011). It remains the most expensive per unit of the common generic oral antihistamines in the CMS survey.',
      costSource: {
        label:
          'No published cost-of-production study exists for fexofenadine; the field is left empty rather than estimated',
        identifier: 'https://www.medicaid.gov/medicaid/prescription-drugs/pharmacy-pricing',
        kind: 'url',
      },
      priceSource: {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) weekly reference file, effective 19 August 2026 — median across 52 listed fexofenadine products',
        identifier: 'https://www.medicaid.gov/medicaid/prescription-drugs/pharmacy-pricing',
        kind: 'regulatory',
      },
    },
    substitutes: {
      summary:
        'If the reason for choosing this drug is that it does not cause drowsiness, there is no direct substitute — it is the only oral antihistamine whose absence from the brain has been imaged. If the reason is symptom control, particularly of a blocked nose, an intranasal spray beats it, and one trial randomised people who had already failed fexofenadine to prove the point.',
      conventionalRx: [
        {
          name: 'Loratadine (Claritin)',
          class: 'Second-generation H1 antagonist',
          howItCompares:
            'The other classically non-sedating oral option and by far the cheaper of the two. Where fexofenadine has direct brain-imaging evidence of near-zero receptor occupancy, loratadine has trial sedation rates that do not separate from placebo at its approved strength — a weaker kind of evidence for the same claim.',
          typicalCost:
            '$0.0532 per unit at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: roughly a fifth the acquisition cost, no fruit-juice interaction. Cons: metabolised by CYP3A4 and CYP2D6, so it has drug interactions fexofenadine does not; its approved strength was chosen to avoid sedation rather than to maximise effect.',
        },
        {
          name: 'Cetirizine (Zyrtec)',
          class: 'Second-generation H1 antagonist',
          howItCompares:
            'Generally the more effective of the two on symptom scores, and the trade is measurable: in the same PET study that put fexofenadine at -0.1% brain H1 occupancy, cetirizine 20 mg occupied 26.0%, and it impaired some psychomotor tasks where fexofenadine did not.',
          typicalCost:
            '$0.0629 per unit at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: usually stronger symptom relief, about a quarter the acquisition cost. Cons: measurable brain receptor occupancy and dose-related somnolence.',
        },
        {
          name: 'Azelastine nasal spray',
          class: 'Topical H1 antagonist applied directly to the nasal lining',
          howItCompares:
            'Tested head-to-head in exactly the population that matters: 334 patients who had already taken fexofenadine 60 mg twice daily for a week and improved by less than a third. Azelastine spray beat placebo on total nasal symptom score (p=0.007), and adding fexofenadine back on top of the spray produced no better result than the spray alone.',
          typicalCost:
            '$1.01 per mL at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: works on nasal congestion, acts within minutes, effective where an oral antihistamine has already failed. Cons: a bitter taste that drives real-world discontinuation, and it causes somnolence in a proportion of users despite being applied topically.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Do not take it with fruit juice',
          action:
            'Swallow it with water rather than with orange, apple or grapefruit juice, and leave a gap around juice.',
          patientImpact:
            'In a randomised five-way crossover in healthy subjects, grapefruit, orange and apple juice each cut fexofenadine total exposure, peak concentration and urinary excretion to 30% to 40% of the values seen with water. Taking it with juice can silently deliver roughly a third of the intended amount.',
          clinicalPrecaution:
            'The mechanism is not the grapefruit-CYP3A4 effect people expect. Juice constituents block an intestinal uptake transporter, OATP, that carries the drug into the gut wall, so the drug is absorbed less rather than metabolised more. This is why the interaction runs the opposite way to the familiar grapefruit interaction.',
        },
        {
          name: 'Saline nasal irrigation',
          action: 'Rinsing the nasal cavity with isotonic or hypertonic salt water.',
          patientImpact:
            'Physically clears deposited pollen and mucus, and works on nasal blockage, which is the symptom that was excluded from the primary endpoint of this drug’s pivotal trials.',
          clinicalPrecaution:
            'Only sterile, distilled or previously boiled water. Fatal amoebic meningoencephalitis has been traced to irrigation with untreated tap water.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(C)(C1=CC=C(C=C1)C(CCCN2CCC(CC2)C(C3=CC=CC=C3)(C4=CC=CC=C4)O)O)C(=O)O',
      chemicalFormula: 'C32H39NO4',
      molecularWeight: '501.70 g/mol',
      targetReceptorAffinity:
        'The pharmacologically decisive measurement is not the H1 affinity but the absence of cardiac potassium channel block. In isolated feline myocytes terfenadine was equipotent with quinidine as a blocker of the delayed rectifier potassium current, while terfenadine carboxylate — fexofenadine — did not inhibit that current at concentrations thirty times higher than the terfenadine concentration producing a half-maximal effect. Human brain H1 receptor occupancy after 120 mg, measured by [11C]doxepin positron emission tomography, was -0.1%.',
      structureSource: {
        label:
          'PubChem CID 3348 (fexofenadine) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3348',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'fex-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the carboxylic acid, not the tert-butyl group, is present',
          description:
            'The single structural difference between the safe drug and the withdrawn one is that a tert-butyl methyl group has been oxidised all the way to a carboxylic acid. Residual terfenadine in a fexofenadine batch is not an impurity of the ordinary kind: it is the molecule the FDA withdrew from the market. Identity and related-substance testing here is a safety control, not a purity nicety.',
          reagentsAndBuffer:
            'Terfenadine reference standard for the impurity channel, reversed-phase HPLC with ultraviolet detection at 220 nm, 1H and 13C NMR in DMSO-d6, titration of the carboxylic acid to confirm stoichiometry',
        },
        {
          id: 'fex-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Friedel-Crafts acylation and reduction to build the diphenylmethanol piperidine',
          description:
            'Assemble the azacyclonol head — a piperidine carrying a diphenyl carbinol — then alkylate its nitrogen with a butanone chain bearing the aryl ring that will carry the acid, and reduce the ketone to the secondary alcohol. The route deliberately introduces the carboxylate as an ester and unmasks it at the end, because a free acid interferes with the Lewis-acid chemistry earlier in the sequence.',
          dependsOnStepId: 'fex-w1',
          reagentsAndBuffer:
            'Alpha,alpha-diphenyl-4-piperidinemethanol, methyl 2-(4-(4-chlorobutanoyl)phenyl)-2-methylpropanoate, potassium carbonate and potassium iodide in toluene, sodium borohydride or catalytic hydrogenation for the ketone reduction',
        },
        {
          id: 'fex-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Ester hydrolysis, zwitterion isolation and hydrochloride crystallisation',
          description:
            'Hydrolyse the ester and isolate the product. The molecule now carries a carboxylate and a protonated piperidine nitrogen at the same time, which is exactly the feature that keeps it out of the brain and also makes it awkward to crystallise: it is least soluble near its isoelectric point and the polymorph obtained depends on how the pH is walked through it.',
          dependsOnStepId: 'fex-w2',
          reagentsAndBuffer:
            'Aqueous sodium or potassium hydroxide, controlled acidification to the isoelectric region, hydrogen chloride in isopropanol for the salt, seeded crystallisation with polymorph confirmation by powder X-ray diffraction',
        },
        {
          id: 'fex-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'OATP and P-glycoprotein transport assays in polarised monolayers',
          description:
            'Apply the compound to transfected cells expressing the intestinal uptake transporter OATP and to polarised epithelial monolayers expressing P-glycoprotein, in both directions. Fexofenadine is a substrate for both, and this is the assay that predicts the fruit-juice interaction: transporter inhibition at the apical membrane, not enzyme inhibition in the liver, is what cuts oral exposure to a third.',
          dependsOnStepId: 'fex-w3',
          reagentsAndBuffer:
            'OATP-transfected HeLa or HEK293 cells, Caco-2 or MDCK-MDR1 monolayers on Transwell inserts, Hanks balanced salt solution with HEPES at pH 7.4, radiolabelled or LC-MS/MS-quantified fexofenadine, 6’,7’-dihydroxybergamottin and verapamil as transporter inhibitors',
        },
        {
          id: 'fex-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'hERG patch clamp counter-screen against the terfenadine positive control',
          description:
            'Measure the delayed-rectifier potassium current in cells expressing hERG, with terfenadine run alongside as the positive control on the same plate. Reporting a clean hERG result without the parent compound in the same experiment would leave the assay unvalidated, and the parent is the reason this counter-screen exists at all: it is the historical origin of the routine hERG test now applied to every new drug.',
          dependsOnStepId: 'fex-w4',
          reagentsAndBuffer:
            'HEK293 cells stably expressing hERG, whole-cell patch clamp or automated planar array, external solution with 4 mM potassium, terfenadine and quinidine as positive controls, dofetilide for maximal block',
        },
      ],
    },
    keyAudits: [
      {
        id: 'fex-a1',
        category: 'conclusion_shift',
        title:
          'The parent drug was withdrawn as unsafe, and the metabolite turned out to carry all the benefit and none of the risk',
        laymanSummary:
          'Terfenadine was the first antihistamine that did not make people sleepy, and it was a bestseller. It also blocked a channel in heart muscle. When anything slowed its breakdown — an antibiotic, an antifungal, even grapefruit — the drug built up and the heart could go into a fatal rhythm. Investigation showed that the piece the liver normally chopped it into was the piece that treated the allergy. That piece is fexofenadine.',
        technicalDetails:
          'The first non-overdose case of torsades de pointes on prescribed terfenadine was reported in 1990 in a patient also taking ketoconazole, with measured serum showing excess parent drug and proportionately reduced metabolite. By April 1992, 25 cases had reached the FDA Spontaneous Reporting System. Woosley and colleagues showed in isolated feline myocytes that terfenadine was equipotent with quinidine as a blocker of the delayed rectifier potassium current, while terfenadine carboxylate did not inhibit it at thirty times the terfenadine half-maximal concentration — locating the toxicity in the parent and the therapy in the metabolite. FDA proposed withdrawal on 14 January 1997 (62 FR 1889) and withdrew NDA 18-949 (Seldane), NDA 19-664 (Seldane-D) and ANDA 74-475 effective 4 November 1998, on a finding that terfenadine is not shown to be safe for use in the treatment of seasonal allergic rhinitis. The hERG patch-clamp screen now run on essentially every new drug candidate exists largely because of this sequence.',
        evidenceSource:
          'Woosley RL et al., JAMA 1993;269:1532-1536 (PMID 8445816); Monahan BP et al., JAMA 1990;264:2788-2790 (PMID 1977935); 63 FR 53444, 5 October 1998',
        measuredMetric:
          'Delayed rectifier potassium current block, terfenadine against terfenadine carboxylate, in isolated feline myocytes',
        auditFlag: 'verified',
      },
      {
        id: 'fex-a2',
        category: 'measured',
        title: 'Brain receptor occupancy of -0.1%, measured directly by PET',
        laymanSummary:
          'Most claims that an antihistamine is non-drowsy rest on people ticking a box in a diary. For this drug someone put volunteers in a brain scanner and measured how much of the drug reached the receptors that cause drowsiness. The answer was, within measurement error, none.',
        technicalDetails:
          'In a double-blind, placebo-controlled crossover in 20 healthy Japanese volunteers, with [11C]doxepin PET performed in 12 of them plus 11 additional controls, brain histamine H1 receptor occupancy 90 minutes after dosing was -0.1% for fexofenadine 120 mg against 26.0% for cetirizine 20 mg. Hydroxyzine 30 mg was the positive control. On psychomotor testing — simple and choice reaction time, visual discrimination at four exposure durations — fexofenadine was not significantly different from placebo, was significantly less impairing than cetirizine on some tasks, and was significantly less impairing than hydroxyzine on all of them. Subjective sleepiness on fexofenadine was likewise indistinguishable from placebo.',
        evidenceSource: 'Tashiro M et al., J Clin Pharmacol 2004;44:890-900',
        doi: '10.1177/0091270004267590',
        measuredMetric:
          'Brain histamine H1 receptor occupancy by [11C]doxepin PET, fexofenadine 120 mg against cetirizine 20 mg',
        auditFlag: 'verified',
      },
      {
        id: 'fex-a3',
        category: 'measured',
        title: 'In a driving simulator it behaved like placebo while diphenhydramine behaved worse than alcohol',
        laymanSummary:
          'Forty licensed drivers with hay fever drove an hour in a simulator after this drug, after an old antihistamine, after enough alcohol to be over the limit, and after a dummy. The old antihistamine was the worst of the four. This one was not distinguishable from the dummy.',
        technicalDetails:
          'A randomised, double-blind, double-dummy, four-treatment, four-period crossover in the Iowa Driving Simulator gave 40 licensed drivers aged 25 to 44 with seasonal allergic rhinitis a single dose of fexofenadine 60 mg, diphenhydramine 50 mg, alcohol to approximately 0.1% blood alcohol concentration, or placebo, at weekly intervals. The primary endpoint was coherence, the ability to match the varying speed of a lead vehicle. Coherence was significantly better after alcohol or fexofenadine than after diphenhydramine. Lane keeping — steering instability and centre-line crossings — was impaired after alcohol and after diphenhydramine relative to fexofenadine. Self-reported drowsiness did not predict lack of coherence, which is the finding with the most practical weight: people cannot tell how impaired they are.',
        evidenceSource: 'Weiler JM et al., Ann Intern Med 2000;132:354-363',
        doi: '10.7326/0003-4819-132-5-200003070-00004',
        measuredMetric:
          'Coherence, lane keeping and response time in an hour of simulated driving, four-way crossover',
        auditFlag: 'verified',
      },
      {
        id: 'fex-a4',
        category: 'inferred',
        title: 'The pivotal trials measured a symptom score that left out the blocked nose',
        laymanSummary:
          'The registration trials summed sneezing, itching, running and itchy eyes into one number and left nasal congestion out of that number. Congestion is the symptom people most want fixed and the one this class of drug helps least. Excluding it makes the drug look better than the experience of taking it.',
        technicalDetails:
          'In the once-daily registration study of 861 intent-to-treat patients with autumn seasonal allergic rhinitis, the primary efficacy measure is defined in the paper as change from baseline in average instantaneous 8 AM total symptom score, "the sum of individual symptom scores excluding nasal congestion." Both 120 mg and 180 mg beat placebo on that measure (p<=0.05) and on reflective assessments (p<=0.0012), with no statistical difference between the two doses. The earlier twice-daily study in 570 completers likewise found significant improvement at 60, 120 and 240 mg twice daily (p<=0.003) with no additional benefit at the higher strengths — a flat dose-response across a fourfold range, which is what a receptor already saturated at the lowest tested dose looks like, and which leaves no headroom for a patient who is not getting enough relief.',
        evidenceSource:
          'Casale TB et al., Allergy Asthma Proc 1999;20:193-198; Bernstein DI et al., Ann Allergy Asthma Immunol 1997;79:443-448',
        doi: '10.2500/108854199778553046',
        inferredClaim:
          'That a total symptom score improvement describes relief of allergic rhinitis as patients experience it, when nasal congestion was excluded from the score by design and the dose-response above the lowest tested strength is flat',
        auditFlag: 'caution',
      },
      {
        id: 'fex-a5',
        category: 'failed',
        title: 'Fruit juice cuts the absorbed dose to about a third',
        laymanSummary:
          'Taking this tablet with orange, apple or grapefruit juice delivers roughly a third of the drug into the blood compared with taking it with water. Nothing about the experience tells you it has happened.',
        technicalDetails:
          'In a randomised five-way crossover in 10 healthy subjects, grapefruit, orange and apple juices at normal strength each reduced fexofenadine area under the concentration-time curve, peak concentration and urinary excretion to 30% to 40% of the values obtained with water, with no change in time to peak, elimination half-life, renal clearance or urine volume — the signature of reduced absorption rather than altered clearance. The same juices at 5% of normal strength markedly reduced human OATP activity in vitro, while grapefruit juice and apple juice at that strength did not alter P-glycoprotein. The magnitude of the effect varied between individuals and was inversely related to how much drug each person absorbed with water.',
        evidenceSource: 'Dresser GK et al., Clin Pharmacol Ther 2002;71:11-20',
        doi: '10.1067/mcp.2002.121152',
        measuredMetric:
          'Fexofenadine AUC, Cmax and urinary excretion with fruit juice against water, five-way crossover',
        auditFlag: 'caution',
      },
      {
        id: 'fex-a6',
        category: 'failed',
        title: 'In people it had already failed, adding it back to a nasal spray contributed nothing',
        laymanSummary:
          'A trial recruited people who had taken this drug for a week and barely improved. It compared a nasal spray alone against the spray plus this drug. The spray alone did just as well. For that group, the tablet was adding nothing.',
        technicalDetails:
          'A multicentre, randomised, double-blind, placebo-controlled two-week study began with an open-label week of fexofenadine 60 mg twice daily. The 334 patients who improved by less than 25% to 33% were randomised to azelastine nasal spray, azelastine nasal spray plus fexofenadine, or double placebo. Both azelastine arms improved total nasal symptom score against placebo at day 14 (p=0.007 for spray alone, p=0.003 for the combination). Azelastine monotherapy was as effective as azelastine plus fexofenadine on the total nasal symptom score and on each of its four component symptoms, so the tablet added no measurable benefit on top of the spray in a population selected for having already failed it.',
        evidenceSource: 'LaForce CF et al., Ann Allergy Asthma Immunol 2004;93:154-159',
        doi: '10.1016/S1081-1206(10)61468-8',
        measuredMetric:
          'Change in total nasal symptom score at day 14, azelastine against azelastine plus fexofenadine',
        auditFlag: 'verified',
      },
      {
        id: 'fex-a7',
        category: 'measured',
        title: 'It works in chronic hives, and above the lowest effective strength it stops improving',
        laymanSummary:
          'In long-running hives, all four strengths tested beat the dummy tablet for itching and number of welts. Quadrupling the strength beyond the second-lowest did not help further.',
        technicalDetails:
          'A four-week, double-blind, randomised, placebo-controlled dose-finding study in 418 patients with chronic idiopathic urticaria and moderate to severe pruritus compared fexofenadine 20, 60, 120 and 240 mg twice daily against placebo. All four doses were statistically superior to placebo for reducing pruritus severity and number of wheals over four weeks (p<=0.0115), and patients on fexofenadine reported significantly less interference with sleep and daily activities (p<=0.0014). Reductions were greater at 60 mg than at 20 mg and similar across 60, 120 and 240 mg. Adverse event incidence was similar across all groups with no dose-related increase.',
        evidenceSource: 'Nelson HS, Reynolds R, Mason J. Ann Allergy Asthma Immunol 2000;84:517-522',
        doi: '10.1016/S1081-1206(10)62515-X',
        measuredMetric:
          'Mean daily change from baseline in pruritus severity and wheal count over four weeks against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'fex-a8',
        category: 'inferred',
        title: 'A 1,010-subject head-to-head against montelukast has no public result',
        laymanSummary:
          'The manufacturer ran a single-centre trial in over a thousand people comparing this drug against a different kind of allergy medicine in a pollen exposure chamber. The registry entry has been there since 2008 and carries no results.',
        technicalDetails:
          'NCT00637611 is a single-centre, double-blind, randomised, parallel Phase 4 study sponsored by Sanofi comparing onset of action, efficacy and safety of a single dose of fexofenadine hydrochloride 180 mg against montelukast sodium 10 mg and placebo in seasonal allergic rhinitis subjects in an allergen exposure chamber, with an actual enrolment of 1,010. The registry record carries no posted results section. A trial of that size in a controlled challenge chamber is among the most informative designs available in this field, and its outcome is not in the public record.',
        evidenceSource:
          'NCT00637611 registry record, Sanofi — actual enrolment 1,010, no results posted',
        inferredClaim:
          'That the published trial set describes this drug’s comparative performance, when the largest registered head-to-head comparison the sponsor ran has never reported',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Absorbed by a transporter, not by simply soaking through',
        laymanDesc:
          'The molecule is too charged to drift across the gut wall on its own. It has to be carried in by a specific protein, and that is why a glass of juice can cut the dose that reaches you to a third.',
        molecularDetail:
          'Fexofenadine is a substrate for organic anion transporting polypeptides at the apical membrane of the enterocyte and for P-glycoprotein efflux at the same surface. Furanocoumarins and bioflavonoids in grapefruit, orange and apple juice inhibit OATP at 5% of normal juice strength; normal-strength juice reduces AUC, Cmax and urinary excretion to 30% to 40% of the water values without altering half-life or renal clearance.',
        iconName: 'ArrowRightLeft',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It stops at the blood-brain barrier',
        laymanDesc:
          'Carrying a permanent positive and a permanent negative charge, the molecule cannot slip through the fatty membranes that guard the brain, and a pump at that barrier throws back what does arrive. Scans confirm almost none of it gets in.',
        molecularDetail:
          'The zwitterionic carboxylate-plus-protonated-piperidine structure gives very low passive permeability, compounded by P-glycoprotein efflux at the blood-brain barrier. Measured directly by [11C]doxepin PET, brain H1 receptor occupancy 90 minutes after fexofenadine 120 mg was -0.1%, against 26.0% for cetirizine 20 mg in the same study.',
        iconName: 'ShieldCheck',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It occupies the histamine receptor in the nose, eyes and skin',
        laymanDesc:
          'Where the allergy actually is, it parks in the receptor histamine needs and holds it inactive, so the histamine released by mast cells has nowhere to land.',
        molecularDetail:
          'Selective inverse agonism at peripheral HRH1 stabilises the inactive receptor conformation and suppresses both histamine-driven and constitutive Gq/11 signalling. Because the drug is not metabolised to any meaningful extent — it is largely excreted unchanged in faeces and urine — its activity does not depend on hepatic enzymes and it does not compete for them.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'What it deliberately does not touch: the heart',
        laymanDesc:
          'Its parent drug blocked a potassium channel that heart muscle needs to reset between beats, and people died of it. This molecule leaves that channel alone, and that is the entire reason it exists as a separate product.',
        molecularDetail:
          'In isolated feline myocytes terfenadine blocked the delayed rectifier potassium current with a potency equal to quinidine; terfenadine carboxylate produced no inhibition at thirty times the terfenadine half-maximal concentration. In a paediatric safety programme of 875 children there was no statistically significant mean change from baseline in any electrocardiogram parameter, including QTc.',
        iconName: 'HeartPulse',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Symptoms fall, congestion much less so',
        laymanDesc:
          'Sneezing, itching, running nose and itchy eyes improve. A blocked nose improves least, which is why the primary score in the registration trials left it out.',
        molecularDetail:
          'Nasal obstruction is driven substantially by cysteinyl leukotrienes and by late-phase eosinophilic infiltration rather than by histamine at H1, so H1 blockade addresses it poorly. Both registration studies showed a flat dose-response above the lowest tested strength — 60, 120 and 240 mg twice daily were indistinguishable — so there is no route to a larger effect by increasing exposure.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'The trade it makes',
        laymanDesc:
          'By staying out of the brain it gives up whatever extra symptom relief the older drugs bought with sedation. It is the antihistamine to take before driving, and generally not the strongest one available.',
        molecularDetail:
          'The same physicochemical property that produces near-zero brain H1 occupancy limits tissue distribution generally. In a driving simulator crossover it was indistinguishable from placebo on coherence and lane keeping while diphenhydramine was worse than a 0.1% blood alcohol concentration, and self-reported drowsiness failed to predict actual impairment.',
        iconName: 'Scale',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Bernstein 1997 (Ann Allergy Asthma Immunol 79:443-448)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, 14 days',
        sampleSize: 570,
        primaryEndpoint:
          'Patient-assessed 12-hour reflective total symptom score before the evening dose, in ragweed seasonal allergic rhinitis',
        endpointMet: true,
        statisticalPValue:
          'P<=0.003 for each of 60, 120 and 240 mg twice daily against placebo; no additional efficacy at the higher strengths',
        unreportedAdverseSignals:
          'Patients with minimal or very severe symptoms during the placebo baseline period were excluded, so the enrolled population is a middle band rather than the population that takes the drug.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Casale 1999 (Allergy Asthma Proc 20:193-198)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, 14 days',
        sampleSize: 861,
        primaryEndpoint:
          'Change from baseline in average instantaneous 8 AM total symptom score, defined as the sum of individual symptom scores excluding nasal congestion',
        endpointMet: true,
        statisticalPValue:
          'P<=0.05 for both 120 mg and 180 mg once daily on instantaneous TSS and P<=0.0012 on reflective TSS; no statistical difference between the two doses',
        unreportedAdverseSignals:
          'Nasal congestion was excluded from the primary score by definition, and it is the symptom this class relieves least.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Nelson 2000 (Ann Allergy Asthma Immunol 84:517-522)',
        phase: 'Phase 2/3, randomised, double-blind, placebo-controlled dose-finding, 4 weeks',
        sampleSize: 418,
        primaryEndpoint:
          'Mean daily change from baseline in pruritus severity and number of wheals in chronic idiopathic urticaria',
        endpointMet: true,
        statisticalPValue:
          'P<=0.0115 for all of 20, 60, 120 and 240 mg twice daily against placebo; 60 mg and above indistinguishable from each other',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Weiler 2000 (Iowa Driving Simulator, Ann Intern Med 132:354-363)',
        phase: 'Randomised, double-blind, double-dummy, four-period crossover',
        sampleSize: 40,
        primaryEndpoint:
          'Coherence — ability to match the varying speed of a lead vehicle over one hour of simulated driving',
        endpointMet: true,
        statisticalPValue:
          'Coherence significantly better after fexofenadine or alcohol than after diphenhydramine; lane keeping impaired after alcohol and diphenhydramine relative to fexofenadine',
        unreportedAdverseSignals:
          'Single-dose, 40 subjects, one hour of driving. The finding that self-reported drowsiness did not predict impairment applies to the comparator, not to this drug, but it is the result with the widest practical reach.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'LaForce 2004 (Ann Allergy Asthma Immunol 93:154-159)',
        phase: 'Randomised, double-blind, placebo-controlled add-on study, 2 weeks',
        sampleSize: 334,
        primaryEndpoint:
          'Change from baseline to day 14 in total nasal symptom score, in patients who remained symptomatic after a week of fexofenadine',
        endpointMet: false,
        statisticalPValue:
          'Azelastine spray alone P=0.007 and azelastine plus fexofenadine P=0.003 against placebo; the two azelastine arms did not differ, so fexofenadine added nothing',
        unreportedAdverseSignals:
          'The trial was designed to test azelastine, not fexofenadine. Read from the other direction it is the only randomised evidence on what happens when this drug is continued in someone it has already failed.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'NCT00637611',
        phase: 'Phase 4, single-centre, randomised, double-blind, allergen exposure chamber',
        sampleSize: 1010,
        primaryEndpoint:
          'Onset of action and efficacy of single-dose fexofenadine 180 mg against montelukast 10 mg and placebo',
        endpointMet: false,
        statisticalPValue:
          'Not reported. The registry record carries no posted results section.',
        unreportedAdverseSignals:
          'The largest registered head-to-head this sponsor ran on the molecule, and its outcome is not public.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Brain histamine H1 receptor occupancy of -0.1% after 120 mg by [11C]doxepin PET, against 26.0% for cetirizine 20 mg',
        'No inhibition of the cardiac delayed rectifier potassium current at thirty times the terfenadine half-maximal concentration',
        'Significant total symptom score improvement against placebo in 570 and in 861 patients, flat across a fourfold dose range',
        'Fruit juice reduced AUC, Cmax and urinary excretion to 30% to 40% of the values with water in a five-way crossover',
        'Driving coherence and lane keeping indistinguishable from placebo, and better than diphenhydramine, in a four-period crossover in 40 drivers',
      ],
      unsupportedInferences: [
        'That a total symptom score improvement describes the full experience of allergic rhinitis, when nasal congestion was excluded from the primary score by design',
        'That there is a stronger dose for a patient who is not getting enough relief — 60, 120 and 240 mg twice daily were statistically indistinguishable',
        'That the public trial set characterises comparative performance, when the sponsor’s own 1,010-subject head-to-head against montelukast has no posted results',
        'That being the safe metabolite of a withdrawn drug says anything about efficacy — it says something about cardiac safety and nothing else',
      ],
      whatFailedInitially: [
        'The parent drug terfenadine was withdrawn effective 4 November 1998 on a finding that it was not shown to be safe for seasonal allergic rhinitis, after 25 reported cases of torsades de pointes',
        'In 334 patients who had already failed a week of fexofenadine, adding it to azelastine nasal spray produced no benefit over the spray alone',
        'Fruit juice, which nothing on the packet warns about at the point of swallowing, cuts absorption to roughly a third',
        'Nasal congestion, the symptom patients rate most burdensome, was left out of the primary endpoint of both registration trials',
      ],
      realWorldOutcome: [
        'Approved 1996 under NDA 020625 as a prescription capsule, now discontinued in that form with an explicit Federal Register finding that the withdrawal was not for safety or effectiveness reasons',
        'Now entirely over-the-counter in the United States across tablet, orally disintegrating tablet, suspension and pseudoephedrine-combination products',
        'The standard recommendation where alertness matters, on the strength of the only brain-imaging evidence any antihistamine has',
        'The terfenadine episode is why the hERG patch-clamp assay is now a routine part of drug development for every new molecule, not only antihistamines',
      ],
    },
    deliverySystem: {
      type:
        'Oral tablet (30, 60 and 180 mg), orally disintegrating tablet, oral suspension, and extended-release tablets combined with pseudoephedrine',
      description:
        'Taken with water. Absorption depends on an intestinal uptake transporter rather than on passive diffusion, so fruit juice substantially reduces the amount that reaches the blood while water does not. Very little of the drug is metabolised; most is excreted unchanged.',
      safetyProfile:
        'The defining safety fact is a negative one: no cardiac potassium channel block, and no statistically significant change in any electrocardiogram parameter across a paediatric programme of 875 children. Adverse event incidence in the registration trials was indistinguishable from placebo — 30.2% against 30.0% in the once-daily study — with headache the commonest event in both arms. Sedation is not a class-typical feature here; psychomotor testing and a driving simulator both failed to separate it from placebo. Cleared largely unchanged, so exposure rises in impaired kidney function. The clinically meaningful interaction is with fruit juice and with transporter inhibitors, not with hepatic enzymes.',
    },
    commonQuestions: [
      {
        q: 'Why does it say not to take it with fruit juice?',
        a: 'Because the juice takes about two-thirds of your dose away. This molecule is too electrically charged to soak through the gut wall by itself; it has to be carried across by a transport protein called OATP. Compounds in grapefruit, orange and apple juice block that transporter. In a randomised crossover in healthy volunteers, all three juices cut the amount of drug reaching the blood, and the amount coming out in urine, to 30% to 40% of the water values. Nothing about taking it feels different, so the only sign is that it works less well. Note this is the opposite of the familiar grapefruit interaction, which raises drug levels by blocking a liver enzyme.',
      },
      {
        q: 'Is it really non-drowsy, or is that just marketing?',
        a: 'This is the one antihistamine where the claim has a physical measurement behind it. Researchers gave volunteers fexofenadine and scanned their brains with a tracer that binds the histamine receptor, then calculated how much of the receptor the drug had occupied. The answer was -0.1% — that is, nothing, within measurement error. Cetirizine in the same study occupied 26%. Separately, in the Iowa Driving Simulator, drivers on fexofenadine were indistinguishable from drivers on placebo, while drivers on diphenhydramine were worse than drivers who had been given enough alcohol to be over the legal limit.',
        auditNote:
          'The same study found that self-reported drowsiness did not predict actual driving impairment. Feeling alert is not evidence of being unimpaired.',
      },
      {
        q: 'What happened to Seldane, and is this the same drug?',
        a: 'It is the piece of Seldane your liver was making. Terfenadine, sold as Seldane, was the first antihistamine that did not sedate, and it was enormously successful. It also blocked a potassium channel that heart muscle uses to reset between beats. Normally the liver converted almost all of it into its carboxylic acid form within minutes, so little parent drug circulated; but anything that slowed that conversion — ketoconazole, erythromycin, grapefruit, liver disease — let the parent build up, and the heart could go into torsades de pointes. Twenty-five cases reached the FDA by 1992. Laboratory work then showed that the parent blocked the potassium current as strongly as quinidine while the metabolite did not block it at all, even at thirty times the concentration. So the metabolite was developed as its own drug, and the FDA withdrew terfenadine effective 4 November 1998.',
      },
      {
        q: 'It is not clearing my blocked nose. Should I take more?',
        a: 'More will not help, and the trials say so directly. In the registration studies 60, 120 and 240 mg twice daily were statistically indistinguishable from each other — the dose-response is flat across a fourfold range, which is what happens when the receptor is already occupied at the lowest tested strength. On congestion specifically, the primary symptom score in the once-daily pivotal trial was defined as the sum of the symptoms excluding nasal congestion. That is not an accident of reporting: histamine at H1 is not the main driver of a blocked nose, leukotrienes and late-phase cellular infiltration are. The classes with evidence on congestion are intranasal corticosteroids and intranasal antihistamines.',
        auditNote:
          'One trial randomised exactly this situation — 334 people still symptomatic after a week of fexofenadine — and found that azelastine nasal spray alone worked as well as the spray plus continued fexofenadine.',
      },
      {
        q: 'Why does it cost more than the other generic antihistamines?',
        a: 'On the CMS acquisition survey it is the most expensive of the common oral generics: $0.2407 per unit against $0.0532 for loratadine and $0.0629 for cetirizine, all as median generic prices effective 19 August 2026. Those are what pharmacies pay to buy the drug, not what a patient is charged, and United States list prices are not published. There is no published cost-of-production study for any of them, so no manufacturing figure exists to compare against.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Woosley RL, Chen Y, Freiman JP, Gillis RA. Mechanism of the cardiotoxic actions of terfenadine. JAMA 1993;269:1532-1536',
        identifier: '8445816',
        kind: 'pmid',
      },
      {
        label:
          'Monahan BP et al. Torsades de pointes occurring in association with terfenadine use. JAMA 1990;264:2788-2790',
        identifier: '1977935',
        kind: 'pmid',
      },
      {
        label:
          'FDA. Hoechst Marion Roussel, Inc., and Baker Norton Pharmaceuticals, Inc.; Terfenadine; Withdrawal of Approval of Two New Drug Applications and One Abbreviated New Drug Application. 63 FR 53444, 5 October 1998, effective 4 November 1998',
        identifier:
          'https://www.federalregister.gov/documents/1998/10/05/98-26522/hoechst-marion-roussel-inc-and-baker-norton-pharmaceuticals-inc-terfenadine-withdrawal-of-approval',
        kind: 'regulatory',
      },
      {
        label:
          'Tashiro M et al. Central effects of fexofenadine and cetirizine: measurement of psychomotor performance, subjective sleepiness, and brain histamine H1-receptor occupancy using 11C-doxepin positron emission tomography. J Clin Pharmacol 2004;44:890-900',
        identifier: '10.1177/0091270004267590',
        kind: 'doi',
      },
      {
        label:
          'Weiler JM et al. Effects of fexofenadine, diphenhydramine, and alcohol on driving performance: a randomized, placebo-controlled trial in the Iowa driving simulator. Ann Intern Med 2000;132:354-363',
        identifier: '10.7326/0003-4819-132-5-200003070-00004',
        kind: 'doi',
      },
      {
        label:
          'Dresser GK et al. Fruit juices inhibit organic anion transporting polypeptide-mediated drug uptake to decrease the oral availability of fexofenadine. Clin Pharmacol Ther 2002;71:11-20',
        identifier: '10.1067/mcp.2002.121152',
        kind: 'doi',
      },
      {
        label:
          'Bernstein DI et al. Efficacy and safety of fexofenadine hydrochloride for treatment of seasonal allergic rhinitis. Ann Allergy Asthma Immunol 1997;79:443-448',
        identifier: '10.1016/S1081-1206(10)63041-4',
        kind: 'doi',
      },
      {
        label:
          'Casale TB, Andrade C, Qu R. Safety and efficacy of once-daily fexofenadine HCl in the treatment of autumn seasonal allergic rhinitis. Allergy Asthma Proc 1999;20:193-198',
        identifier: '10.2500/108854199778553046',
        kind: 'doi',
      },
      {
        label:
          'Nelson HS, Reynolds R, Mason J. Fexofenadine HCl is safe and effective for treatment of chronic idiopathic urticaria. Ann Allergy Asthma Immunol 2000;84:517-522',
        identifier: '10.1016/S1081-1206(10)62515-X',
        kind: 'doi',
      },
      {
        label:
          'Graft DF et al. Safety of fexofenadine in children treated for seasonal allergic rhinitis. Ann Allergy Asthma Immunol 2001;87:22-26',
        identifier: '10.1016/S1081-1206(10)62317-4',
        kind: 'doi',
      },
      {
        label:
          'LaForce CF et al. Efficacy of azelastine nasal spray in seasonal allergic rhinitis patients who remain symptomatic after treatment with fexofenadine. Ann Allergy Asthma Immunol 2004;93:154-159',
        identifier: '10.1016/S1081-1206(10)61468-8',
        kind: 'doi',
      },
      {
        label:
          'Fexofenadine 180 mg against montelukast 10 mg in an allergen exposure chamber, 1,010 subjects, Sanofi — no results posted',
        identifier: 'NCT00637611',
        kind: 'nct',
      },
      {
        label:
          'Drugs@FDA: ALLEGRA (fexofenadine hydrochloride) capsule, NDA 020625; ALLEGRA ALLERGY tablet, NDA 020872, approved 25 February 2000',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020625',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 3348 — fexofenadine structure, formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3348',
        kind: 'url',
      },
    ],
  },
]
